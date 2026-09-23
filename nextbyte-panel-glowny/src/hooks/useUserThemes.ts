import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShopTheme {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  byte_price: number;
  is_purchasable: boolean;
}

interface PurchasedTheme {
  id: string;
  theme_id: string;
  is_active: boolean;
  purchased_at: string;
  theme: ShopTheme;
}

export function useUserThemes(userId?: string) {
  const queryClient = useQueryClient();

  // Fetch all purchasable themes
  const { data: shopThemes = [], isLoading: themesLoading } = useQuery({
    queryKey: ['shop-themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('color_themes')
        .select('id, name, display_name, description, byte_price, is_purchasable')
        .eq('is_active', true)
        .eq('is_purchasable', true)
        .order('display_name');
      if (error) throw error;
      return (data as any[]) as ShopTheme[];
    },
  });

  // Fetch user's purchased themes
  const { data: purchasedThemes = [], isLoading: purchasedLoading } = useQuery({
    queryKey: ['user-purchased-themes', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_purchased_themes' as any)
        .select('id, theme_id, is_active, purchased_at')
        .eq('user_id', userId);
      if (error) throw error;
      
      const themeIds = (data as any[]).map((d: any) => d.theme_id);
      if (themeIds.length === 0) return [];
      
      const { data: themes } = await supabase
        .from('color_themes')
        .select('id, name, display_name, description, byte_price, is_purchasable')
        .in('id', themeIds);
      
      const themeMap = new Map((themes as any[] || []).map((t: any) => [t.id, t]));
      return (data as any[]).map((p: any) => ({
        ...p,
        theme: themeMap.get(p.theme_id),
      })).filter((p: any) => p.theme) as PurchasedTheme[];
    },
    enabled: !!userId,
  });

  const activeTheme = purchasedThemes.find(t => t.is_active) || null;

  const isPurchased = (themeId: string) => 
    purchasedThemes.some(t => t.theme_id === themeId);

  const isActive = (themeId: string) => 
    purchasedThemes.some(t => t.theme_id === themeId && t.is_active);

  // Purchase theme via edge function
  const purchaseMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const { data, error } = await supabase.functions.invoke('purchase-theme', {
        body: { themeId },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Błąd zakupu');
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Zakupiono motyw: ${data.theme.display_name}`);
      queryClient.invalidateQueries({ queryKey: ['user-purchased-themes', userId] });
      // ['wallet'] to prefiks trafiajacy w ['wallet', <userId>] z useWallet.
      // Poprzednie dwa klucze nie istnialy nigdzie w projekcie.
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Błąd zakupu motywu');
    },
  });

  // Activate/deactivate theme
  const activateMutation = useMutation({
    mutationFn: async (themeId: string | null) => {
      if (!userId) throw new Error('Musisz być zalogowany');

      // Deactivate all first
      await supabase
        .from('user_purchased_themes' as any)
        .update({ is_active: false } as any)
        .eq('user_id', userId);

      // Activate selected
      if (themeId) {
        // Check if theme exists in user_purchased_themes
        const { data: existing } = await supabase
          .from('user_purchased_themes' as any)
          .select('id')
          .eq('user_id', userId)
          .eq('theme_id', themeId)
          .maybeSingle();

        if (!existing) {
          // Auto-insert for free themes (byte_price = 0, not purchasable)
          const { data: theme } = await supabase
            .from('color_themes')
            .select('byte_price, is_purchasable')
            .eq('id', themeId)
            .single();

          if (theme && theme.byte_price === 0) {
            await supabase
              .from('user_purchased_themes' as any)
              .insert({ user_id: userId, theme_id: themeId, is_active: true } as any);
            return;
          } else {
            throw new Error('Musisz najpierw kupić ten motyw');
          }
        }

        const { error } = await supabase
          .from('user_purchased_themes' as any)
          .update({ is_active: true } as any)
          .eq('user_id', userId)
          .eq('theme_id', themeId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-purchased-themes', userId] });
      // Clear theme cache so useGlobalTheme re-applies
      try {
        localStorage.removeItem('nextbyte_theme_colors');
        localStorage.removeItem('nextbyte_theme_colors_name');
        localStorage.removeItem('nextbyte_theme_expiry');
        localStorage.removeItem('nextbyte_user_theme');
      } catch {}
      // Dispatch event so theme providers re-apply; avoid full page reload in native apps
      window.dispatchEvent(new CustomEvent('themeChanged'));
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Błąd aktywacji motywu');
    },
  });

  return {
    shopThemes,
    purchasedThemes,
    activeTheme,
    loading: themesLoading || purchasedLoading,
    isPurchased,
    isActive,
    purchaseTheme: purchaseMutation.mutate,
    isPurchasing: purchaseMutation.isPending,
    activateTheme: activateMutation.mutate,
    isActivating: activateMutation.isPending,
  };
}
