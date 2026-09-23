import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ByteSpecialOffer {
  id: string;
  package_id: string;
  title: string;
  subtitle: string | null;
  original_price_pln: number;
  promo_price_pln: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  priority: number;
  image_desktop_url: string | null;
  image_mobile_url: string | null;
  image_alt: string | null;
  max_per_user: number | null;
}

const fetchActiveOffer = async (): Promise<ByteSpecialOffer | null> => {
  const nowIso = new Date().toISOString();
  const { data, error } = await (supabase as any)
    .from('byte_special_offers')
    .select('*')
    .eq('is_active', true)
    .lte('starts_at', nowIso)
    .gte('ends_at', nowIso)
    .order('priority', { ascending: false })
    .order('ends_at', { ascending: true })
    .limit(1);
  if (error) {
    console.error('[useByteSpecialOffer]', error);
    return null;
  }
  return (data?.[0] as any) || null;
};

export const useByteSpecialOffer = (enabled = true) => {
  return useQuery({
    queryKey: ['byte-special-offer-active'],
    queryFn: fetchActiveOffer,
    enabled,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
};

export const useUserOfferPurchaseCount = (offerId: string | null | undefined, enabled = true) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['byte-offer-purchase-count', user?.id, offerId],
    enabled: !!user?.id && !!offerId && enabled,
    staleTime: 15_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      if (!user?.id || !offerId) return 0;
      const { data, error } = await (supabase as any)
        .from('byte_offer_purchases')
        .select('purchase_count')
        .eq('user_id', user.id)
        .eq('offer_id', offerId)
        .maybeSingle();
      if (error) {
        console.error('[useUserOfferPurchaseCount]', error);
        return 0;
      }
      return Number((data as any)?.purchase_count ?? 0);
    },
  });
};

export const useOfferCountdown = (endsAt: string | undefined | null) => {
  const [remaining, setRemaining] = useState<string>('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('0s');
        setExpired(true);
        return;
      }
      setExpired(false);
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1000);
      if (days > 0) setRemaining(`${days}d ${hours}h ${minutes}m`);
      else if (hours > 0) setRemaining(`${hours}h ${minutes}m ${seconds}s`);
      else setRemaining(`${minutes}m ${seconds}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return { remaining, expired };
};
