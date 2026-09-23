import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAvatarDecorations(userId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all active decorations
  const { data: decorations, isLoading: decorationsLoading } = useQuery({
    queryKey: ['avatar-decorations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avatar_decorations' as any)
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch user's purchased and granted decorations
  const { data: purchasedDecorations, isLoading: purchasedLoading } = useQuery({
    queryKey: ['user-decoration-purchases', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Fetch from both tables
      const [purchasesResult, grantedResult] = await Promise.all([
        supabase
          .from('user_decoration_purchases' as any)
          .select('decoration_id, avatar_decorations(*)')
          .eq('user_id', userId),
        supabase
          .from('user_avatar_decorations' as any)
          .select('decoration_id, avatar_decorations:avatar_decorations!user_avatar_decorations_decoration_id_fkey(*)')
          .eq('user_id', userId)
      ]);
      
      if (purchasesResult.error) throw purchasesResult.error;
      if (grantedResult.error) throw grantedResult.error;
      
      // Merge and deduplicate by decoration_id
      const decorationMap = new Map();
      
      purchasesResult.data?.forEach((item: any) => {
        if (item.avatar_decorations) {
          decorationMap.set(item.decoration_id, {
            decoration_id: item.decoration_id,
            avatar_decorations: item.avatar_decorations
          });
        }
      });
      
      grantedResult.data?.forEach((item: any) => {
        if (item.avatar_decorations && !decorationMap.has(item.decoration_id)) {
          decorationMap.set(item.decoration_id, {
            decoration_id: item.decoration_id,
            avatar_decorations: item.avatar_decorations
          });
        }
      });
      
      return Array.from(decorationMap.values());
    },
    enabled: !!userId
  });

  // Fetch active decoration
  const { data: activeDecoration, isLoading: activeLoading } = useQuery({
    queryKey: ['user-decoration-preference', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_decoration_preferences' as any)
        .select('*, avatar_decorations(*)')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && (error as any).code !== 'PGRST116') throw error;

      // Fallback: if preference exists but nested join is missing due to RLS, fetch decoration separately
      if (data && !(data as any).avatar_decorations && (data as any).active_decoration_id) {
        const { data: decData, error: decError } = await supabase
          .from('avatar_decorations' as any)
          .select('*')
          .eq('id', (data as any).active_decoration_id)
          .maybeSingle();
        if (!decError && decData) {
          return { ...(data as any), avatar_decorations: decData } as any;
        }
      }
      return data as any;
    },
    enabled: !!userId
  });

  // Purchase decoration mutation
  const purchaseMutation = useMutation({
    mutationFn: async (decorationId: string) => {
      const { data, error } = await supabase.functions.invoke('purchase-avatar-decoration', {
        body: { decorationId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-decoration-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['user-decoration-preference'] }); // 08.09: był klucz z „-s", nic nie odświeżał
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast({
        title: "Zakupiono dekorację!",
        description: "Dekoracja została dodana do kolekcji i aktywowana"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Błąd zakupu",
        description: error.message || "Nie udało się zakupić dekoracji",
        variant: "destructive"
      });
    }
  });

  // Set active decoration mutation
  const setActiveMutation = useMutation({
    mutationFn: async (decorationId: string | null) => {
      const { data, error } = await supabase.functions.invoke('set-active-decoration', {
        body: { decorationId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, decorationId) => {
      queryClient.invalidateQueries({ queryKey: ['user-decoration-preference'] });
      // Toast removed - silent update
    },
    onError: (error: any) => {
      toast({
        title: "Błąd aktywacji",
        description: error.message || "Nie udało się zaktualizować dekoracji",
        variant: "destructive"
      });
    }
  });

  const isPurchased = (decorationId: string): boolean => {
    return purchasedDecorations?.some((p: any) => p.decoration_id === decorationId) || false;
  };

  const isActive = (decorationId: string): boolean => {
    return (activeDecoration as any)?.active_decoration_id === decorationId;
  };

  return {
    decorations,
    purchasedDecorations,
    activeDecoration,
    loading: decorationsLoading || purchasedLoading || activeLoading,
    // `mutateAsync`, a NIE `mutate`: konsument (ShopAvatarDecorationsTab) robi
    // `await purchaseDecoration(...)` w bloku try/catch. `mutate` zwraca `void`,
    // więc `await undefined` przechodziło natychmiast, `catch` nigdy nie łapał
    // i przy odrzuconej płatności leciały JEDNOCZEŚNIE toast „Błąd zakupu"
    // i animacja „Gratulacje zakupu!". Trzy pozostałe zakładki Sklepu robiły to
    // poprawnie — ta jedna nie.
    purchaseDecoration: purchaseMutation.mutateAsync,
    setActiveDecoration: setActiveMutation.mutate,
    isPurchasing: purchaseMutation.isPending,
    isActivating: setActiveMutation.isPending,
    isPurchased,
    isActive
  };
}
