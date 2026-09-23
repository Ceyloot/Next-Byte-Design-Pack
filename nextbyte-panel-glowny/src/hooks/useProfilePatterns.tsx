import { useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { dolaczDoKanalu } from '@/lib/realtimeChannels';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface ProfilePattern {
  id: string;
  name: string;
  description: string | null;
  pattern_type: 'plus' | 'dots' | 'grid';
  pattern_color: string;
  pattern_size: number;
  pattern_opacity: number;
  background_color: string;
  fade: boolean;
  byte_price: number;
  category: string;
  tags: string[];
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Default pattern shown for all users when no pattern is explicitly set
export const DEFAULT_PATTERN: ProfilePattern = {
  id: 'default-tech-grid',
  name: 'Tech Grid',
  description: 'Technologiczna siatka',
  pattern_type: 'grid',
  pattern_color: '#70BEFA',
  pattern_size: 60,
  pattern_opacity: 0.12,
  background_color: 'transparent',
  fade: true,
  byte_price: 0,
  category: 'default',
  tags: ['default'],
  is_active: true,
  order_index: 0,
  created_at: '',
  updated_at: '',
};

export const useProfilePatterns = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all patterns
  const { data: patterns = [], isLoading: patternsLoading } = useQuery({
    queryKey: ['profile-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_patterns' as any)
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as ProfilePattern[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch purchased patterns
  const { data: purchasedPatterns = [], isLoading: purchasedLoading } = useQuery({
    queryKey: ['user-pattern-purchases', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_pattern_purchases' as any)
        .select('pattern_id')
        .eq('user_id', userId);

      if (error) throw error;
      return (data || []).map((d: any) => d.pattern_id as string);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch active pattern from preferences
  const { data: activePatternId = null, isLoading: activeLoading } = useQuery({
    queryKey: ['user-active-pattern', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_background_preferences' as any)
        .select('active_pattern_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && (error as any).code !== 'PGRST116') throw error;
      return (data as any)?.active_pattern_id ?? null;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  const loading = patternsLoading || purchasedLoading || activeLoading;

  const isPurchased = useCallback((patternId: string) => {
    if (patternId === DEFAULT_PATTERN.id) return true;
    return purchasedPatterns.includes(patternId);
  }, [purchasedPatterns]);

  const isActive = useCallback((patternId: string) => {
    return activePatternId === patternId;
  }, [activePatternId]);

  const selectedPattern = patterns.find(p => p.id === activePatternId) || null;
  /* STABILNA TOŻSAMOŚĆ (07.09.2026). Przy domyślnym wzorze powstawał tu NOWY
     obiekt w każdym renderze. Odkąd `PatternOverlay` oddaje wzór powłoce
     (`useTloZakladki`, po tożsamości węzła), nowy obiekt = nowy węzeł = zapis
     do stanu powłoki = render = nowy obiekt… Zmierzone na Chat AI: ~55
     pełnych renderów strony na sekundę, wątek główny 100% zajęty
     w spoczynku, 40 ms na klatkę. `useMemo` zamyka pętlę u źródła. */
  const activePattern = useMemo(
    () => (selectedPattern?.name === DEFAULT_PATTERN.name
      ? { ...selectedPattern, ...DEFAULT_PATTERN, id: selectedPattern.id }
      : selectedPattern || (activePatternId === null ? DEFAULT_PATTERN : null)),
    [selectedPattern, activePatternId],
  );

  // Purchase a pattern
  const purchasePattern = async (patternId: string) => {
    try {
      const { data, error } = await supabase.rpc('purchase_profile_pattern' as any, {
        p_pattern_id: patternId,
      });

      if (error) throw error;
      /* 08.09.2026: RPC oddaje `{success:false, error:'Za mało Byte'}` bez błędu
         PostgREST — dotąd i tak leciał toast „Zakupiono wzór!" i gratulacje. */
      const wynik = data as { success?: boolean; error?: string } | null;
      if (wynik && wynik.success === false) throw new Error(wynik.error || 'Nie udało się kupić wzoru');

      toast({ title: 'Sukces', description: 'Zakupiono wzór!' });

      queryClient.invalidateQueries({ queryKey: ['user-pattern-purchases', userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });

      return data;
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się zakupić wzoru',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Set active pattern (clears active background)
  const setActivePattern = async (patternId: string | null) => {
    try {
      if (!userId) throw new Error('Nie zalogowano');

      // Upsert preference
      const { error } = await supabase
        .from('user_background_preferences' as any)
        .upsert(
          {
            user_id: userId,
            active_pattern_id: patternId,
            active_background_id: patternId ? null : undefined, // clear image bg when setting pattern
          } as any,
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['user-active-pattern', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-background-preference', userId] });
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się ustawić wzoru',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Realtime
  useEffect(() => {
    if (!userId) return;

    /* Hak wołają naraz `TechGrid`, `PatternOverlay` i `AppearanceTab`, a kanał
       ma stałą nazwę — stąd wspólny kanał z licznikiem referencji. */
    return dolaczDoKanalu(
      `pattern-purchases-${userId}`,
      [{ table: 'user_pattern_purchases', filter: `user_id=eq.${userId}` }],
      () => queryClient.invalidateQueries({ queryKey: ['user-pattern-purchases', userId] }),
    );
  }, [userId, queryClient]);

  return {
    patterns,
    purchasedPatterns,
    activePattern,
    activePatternId,
    loading,
    purchasePattern,
    setActivePattern,
    isPurchased,
    isActive,
  };
};
