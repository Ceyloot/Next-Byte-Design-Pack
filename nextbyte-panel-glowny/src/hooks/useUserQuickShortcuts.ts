import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';

export interface QuickShortcut {
  user_id: string;
  slot_index: number;
  title: string;
  icon: string;
  url: string;
  source: 'platform' | 'company';
  company_id: string | null;
}

export type QuickShortcutInput = Omit<QuickShortcut, 'user_id'>;

export const useUserQuickShortcuts = () => {
  const userId = useAuthId();
  const qc = useQueryClient();
  const queryKey = ['user-quick-shortcuts', userId];

  const query = useQuery({
    queryKey,
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async (): Promise<(QuickShortcut | null)[]> => {
      if (!userId) return new Array(6).fill(null);
      const { data, error } = await supabase
        .from('user_quick_shortcuts')
        .select('*')
        .eq('user_id', userId)
        .order('slot_index');
      if (error) throw error;
      const slots: (QuickShortcut | null)[] = new Array(6).fill(null);
      (data || []).forEach((row: any) => {
        if (row.slot_index >= 0 && row.slot_index < 6) {
          slots[row.slot_index] = row as QuickShortcut;
        }
      });
      return slots;
    },
  });

  const setSlot = useMutation({
    mutationFn: async (payload: QuickShortcutInput) => {
      if (!userId) throw new Error('No user');
      const { error } = await supabase
        .from('user_quick_shortcuts')
        .upsert(
          { ...payload, user_id: userId },
          { onConflict: 'user_id,slot_index' }
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const clearSlot = useMutation({
    mutationFn: async (slotIndex: number) => {
      if (!userId) throw new Error('No user');
      const { error } = await supabase
        .from('user_quick_shortcuts')
        .delete()
        .eq('user_id', userId)
        .eq('slot_index', slotIndex);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return {
    shortcuts: query.data ?? new Array(6).fill(null),
    isLoading: query.isLoading,
    setSlot: setSlot.mutateAsync,
    clearSlot: clearSlot.mutateAsync,
    isMutating: setSlot.isPending || clearSlot.isPending,
  };
};
