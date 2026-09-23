import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  how_to_earn: string;
  icon_url: string | null;
  color: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  created_at: string;
}

export interface UserBadgeAssignment {
  id: string;
  user_id: string;
  badge_id: string;
  assigned_at: string;
  assigned_by: string | null;
  expires_at: string | null;
  badge: UserBadge;
}

export interface BadgeStats {
  total_users: number;
  users_with_badge: number;
  percentage: number;
}

export const useUserBadges = () => {
  return useQuery({
    queryKey: ['user-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('is_active', true)
        .order('rarity', { ascending: false })
        .order('name');

      if (error) throw error;
      return data as UserBadge[];
    }
  });
};

export const useUserBadgeAssignments = (userId?: string) => {
  return useQuery({
    queryKey: ['user-badge-assignments', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_badge_assignments')
        .select(`
          *,
          badge:user_badges(*)
        `)
        .eq('user_id', userId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data as UserBadgeAssignment[];
    },
    enabled: !!userId
  });
};

export const useUserActiveBadge = (userId?: string) => {
  return useQuery({
    queryKey: ['user-active-badge', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_badge_preferences')
        .select(`
          *,
          badge:user_badges(*)
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return (data?.badge ?? null) as UserBadge | null;
    },
    enabled: !!userId
  });
};

export const useBadgeStats = (badgeId: string) => {
  return useQuery({
    queryKey: ['badge-stats', badgeId],
    queryFn: async () => {
      // Get total users count
      const { count: totalUsers, error: totalError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get users with this badge
      const { count: usersWithBadge, error: badgeError } = await supabase
        .from('user_badge_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('badge_id', badgeId);

      if (badgeError) throw badgeError;

      const percentage = totalUsers ? (usersWithBadge || 0) / totalUsers * 100 : 0;

      return {
        total_users: totalUsers || 0,
        users_with_badge: usersWithBadge || 0,
        percentage: Math.round(percentage * 100) / 100
      } as BadgeStats;
    }
  });
};

export interface BadgeRarity {
  id: string;
  name: string;
  display_name: string;
  color: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBadgeRarities = () => {
  return useQuery({
    queryKey: ['badge-rarities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badge_rarities')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      return data as BadgeRarity[];
    }
  });
};

export const useCreateBadgeRarity = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rarityData: Omit<BadgeRarity, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('badge_rarities')
        .insert(rarityData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badge-rarities'] });
      toast({
        title: "Rzadkość została utworzona",
        description: "Nowa kategoria rzadkości została dodana."
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć rzadkości.",
        variant: "destructive"
      });
      console.error('Error creating rarity:', error);
    }
  });
};

export const useUpdateBadgeRarity = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BadgeRarity> }) => {
      const { error } = await supabase
        .from('badge_rarities')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badge-rarities'] });
      toast({
        title: "Rzadkość została zaktualizowana",
        description: "Zmiany zostały zapisane."
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować rzadkości.",
        variant: "destructive"
      });
      console.error('Error updating rarity:', error);
    }
  });
};

export const useDeleteBadgeRarity = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rarityId: string) => {
      const { error } = await supabase
        .from('badge_rarities')
        .delete()
        .eq('id', rarityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badge-rarities'] });
      toast({
        title: "Rzadkość została usunięta",
        description: "Kategoria rzadkości została pomyślnie usunięta."
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć rzadkości.",
        variant: "destructive"
      });
      console.error('Error deleting rarity:', error);
    }
  });
};

export const useSetActiveBadge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, badgeId }: { userId: string; badgeId: string | null }) => {
      // If setting a badge, validate user owns it first
      if (badgeId) {
        const { data: assignment, error: checkError } = await supabase
          .from('user_badge_assignments')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_id', badgeId)
          .maybeSingle();

        if (checkError) {
          console.error('Badge ownership check error:', checkError);
          throw checkError;
        }
        if (!assignment) {
          throw new Error('Nie posiadasz tej przypinki');
        }
      }

      const { data, error } = await supabase
        .from('user_badge_preferences')
        .upsert({
          user_id: userId,
          active_badge_id: badgeId
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (error) {
        console.error('Badge preference upsert error:', {
          error,
          userId,
          badgeId,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // More precise cache invalidation
      queryClient.invalidateQueries({ queryKey: ['user-active-badge', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user-active-badge'] });
    },
    onError: (error: { message?: string; code?: string; details?: string }, variables) => {
      let errorMessage = "Nie udało się zaktualizować przypinki.";
      
      if (error.message === 'Nie posiadasz tej przypinki') {
        errorMessage = error.message;
      } else if (error.code === 'PGRST116') {
        errorMessage = "Nie znaleziono przypinki do ustawienia.";
      } else if (error.code === '42501') {
        errorMessage = "Brak uprawnień do zmiany przypinki.";
      } else if (error.details) {
        errorMessage = `Błąd: ${error.details}`;
      }
      
      console.error('Error setting active badge:', {
        error,
        variables,
        message: error.message,
        code: error.code,
        details: error.details
      });
    }
  });
};