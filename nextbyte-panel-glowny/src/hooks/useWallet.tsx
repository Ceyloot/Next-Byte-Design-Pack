import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';

interface WalletData {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  description: string;
  related_purchase_id?: string;
  admin_user_id?: string;
  created_at: string;
}

const fetchWalletData = async (userId: string): Promise<WalletData | null> => {
  const { data, error } = await supabase
    .from('user_wallets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && !error.message.includes('No rows')) {
    throw error;
  }

  return data;
};

const fetchTransactionsData = async (userId: string): Promise<WalletTransaction[]> => {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
};

/*
 * ════════════════════════════════════════════════════════════════════════════
 *  JEDEN KANAŁ REALTIME NA UŻYTKOWNIKA — WSPÓLNY DLA WSZYSTKICH INSTANCJI HOOKA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * `supabase.channel(nazwa)` ODDAJE ISTNIEJĄCY kanał o tej nazwie (realtime-js
 * 2.99, `RealtimeClient.channel`: `getChannels().find(c => c.topic === …)`),
 * a `removeChannel` zamyka go i wyrzuca z listy. Ten hook ma 20 konsumentów
 * (pasek, saldo, sklep, strażnik Byte…). Każdy „zakładał" kanał pod tą samą
 * nazwą — czyli dostawał TEN SAM obiekt — i przy odmontowaniu go USUWAŁ.
 * Odmontowanie dowolnego konsumenta (np. wyjście ze strony kasy) gasiło
 * realtime portfela wszystkim pozostałym, bez żadnego błędu w konsoli.
 *
 * Zmierzone 23.09.2026: webhook zaksięgował +425 o 08:39:55, a Panel Główny
 * stał na 1517 (baza: 1944) i okno „Potwierdzamy płatność" czekało do
 * timeoutu, bo nikt nie odświeżył zapytań.
 *
 * Licznik referencji przez zbiór słuchaczy: pierwszy konsument otwiera kanał,
 * ostatni go zamyka, a każde zdarzenie budzi WSZYSTKICH zapisanych.
 */
type SluchaczPortfela = () => void;
const kanalyPortfela = new Map<string, { kanal: ReturnType<typeof supabase.channel>; sluchacze: Set<SluchaczPortfela> }>();

function dolaczDoKanaluPortfela(userId: string, sluchacz: SluchaczPortfela): () => void {
  let wpis = kanalyPortfela.get(userId);
  if (!wpis) {
    const sluchacze = new Set<SluchaczPortfela>();
    const obudz = () => sluchacze.forEach((s) => s());
    const filter = `user_id=eq.${userId}`;
    const kanal = supabase
      .channel(`user-byte-balance-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_wallets', filter }, obudz)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wallet_transactions', filter }, obudz)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_byte_pool', filter }, obudz)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_byte_packs', filter }, obudz)
      .subscribe();
    wpis = { kanal, sluchacze };
    kanalyPortfela.set(userId, wpis);
  }
  wpis.sluchacze.add(sluchacz);

  return () => {
    const biezacy = kanalyPortfela.get(userId);
    if (!biezacy) return;
    biezacy.sluchacze.delete(sluchacz);
    if (biezacy.sluchacze.size === 0) {
      kanalyPortfela.delete(userId);
      supabase.removeChannel(biezacy.kanal);
    }
  };
}

export const useWallet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthContext();
  const userId = user?.id;

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', userId],
    queryFn: () => fetchWalletData(userId!),
    enabled: !!userId && !authLoading,
    staleTime: 5000,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet-transactions', userId],
    queryFn: () => fetchTransactionsData(userId!),
    enabled: !!userId && !authLoading,
    staleTime: 5000,
  });

  const loading = authLoading || (!!userId && (walletLoading || transactionsLoading));

  const invalidateWallet = () => {
    if (!userId) return;
    queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
    queryClient.invalidateQueries({ queryKey: ['wallet-transactions', userId] });
    queryClient.invalidateQueries({ queryKey: ['user-byte-pool-v2', userId] });
  };

  const purchaseCurrencyPackage = async (
    packageId: string,
    options?: { offerId?: string; redeemCode?: string }
  ) => {
    const params = new URLSearchParams({ package_id: packageId });
    if (options?.offerId) params.set('offer_id', options.offerId);
    if (options?.redeemCode) params.set('code', options.redeemCode);
    navigate(`/sklep/checkout?${params.toString()}`);
  };

  const spendBytes = async (itemId: string, itemType: 'course' | 'product', bytePrice: number) => {
    try {
      // Prevent multiple simultaneous requests
      if (loading) {
        toast({
          title: "Poczekaj",
          description: "Trwa już jedna transakcja",
          variant: "destructive",
        });
        throw new Error('Transaction already in progress');
      }
      
      // Check if purchase already exists to prevent duplicates
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (itemType === 'course') {
        const { data: existingPurchase } = await supabase
          .from('course_purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', itemId)
          .eq('status', 'completed')
          .maybeSingle();

        if (existingPurchase) {
          toast({
            title: "Już zakupiono",
            description: "Ten kurs jest już w Twojej bibliotece",
          });
          return null;
        }
      } else if (itemType === 'product') {
        const { data: existingPurchase } = await supabase
          .from('user_purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', itemId)
          .eq('status', 'completed')
          .maybeSingle();

        if (existingPurchase) {
          toast({
            title: "Już zakupiono",
            description: "Ten produkt jest już w Twojej bibliotece",
          });
          return null;
        }
      }

      const { data, error } = await supabase.functions.invoke('spend-bytes', {
        body: { itemId, itemType, bytePrice }
      });

      if (error) throw error;

      toast({
        title: "Sukces",
        description: `Zakupiono za ${bytePrice}⟠`,
      });

      // Refresh wallet and transactions
      invalidateWallet();

      return data;
    } catch (error: any) {
      console.error('Error spending bytes:', error);
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się dokonać zakupu",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Subscribe to wallet updates for realtime sync — one shared channel per user
  useEffect(() => {
    if (!userId) return;

    const odlacz = dolaczDoKanaluPortfela(userId, invalidateWallet);

    const handleWalletUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string; balance?: number }>).detail;
      if (detail?.userId && detail.userId !== userId) return;
      if (typeof detail?.balance === 'number') {
        queryClient.setQueryData(['wallet', userId], (old: WalletData | null | undefined) => ({
          ...(old || { user_id: userId }),
          balance: detail.balance!,
          updated_at: new Date().toISOString(),
        }));
      }
      invalidateWallet();
    };

    window.addEventListener('nextbyte:wallet-updated', handleWalletUpdated);

    return () => {
      window.removeEventListener('nextbyte:wallet-updated', handleWalletUpdated);
      odlacz();
    };
  }, [userId, queryClient]);

  return {
    wallet,
    transactions,
    loading,
    balance: wallet?.balance || 0,
    purchaseCurrencyPackage,
    spendBytes,
    refetch: invalidateWallet,
    invalidateWallet
  };
};