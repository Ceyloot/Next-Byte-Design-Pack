import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dolaczDoKanalu } from '@/lib/realtimeChannels';
import { useToast } from '@/hooks/use-toast';

export interface RewardEvent {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string;
  event_type: 'limited_time' | 'permanent' | 'seasonal';
  theme_color: string;
  secondary_color: string;
  progress_bar_color?: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  is_visible: boolean;
  order_index: number;
  claim_mode: 'instant' | 'task_based';
  auto_complete: boolean;
  requirements: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface EventReward {
  id: string;
  event_id: string;
  reward_type: 'badge' | 'avatar_decoration' | 'color_theme';
  reward_id: string;
  name: string;
  description: string | null;
  order_index: number;
  is_required: boolean;
  created_at: string;
}

export interface EventTask {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  task_type: 'manual' | 'auto' | 'external';
  verification_url: string | null;
  achievement_category_id: string | null;
  required_value: number | null;
  order_index: number;
  is_required: boolean;
  points: number;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface UserEventProgress {
  id: string;
  user_id: string;
  event_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  claimed_rewards: string[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserTaskProgress {
  id: string;
  user_id: string;
  event_id: string;
  task_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_data?: any | null;
  completed_at: string | null;
  notes: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch active events
export const useActiveEvents = () => {
  return useQuery({
    queryKey: ['active-events'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('reward_events' as any)
        .select('*')
        .eq('is_active', true)
        .eq('is_visible', true)
        .lte('start_date', now)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as unknown as RewardEvent[];
    }
  });
};

// Fetch event details
export const useEventDetails = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['event-details', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const { data, error } = await supabase
        .from('reward_events' as any)
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data as unknown as RewardEvent;
    },
    enabled: !!eventId
  });
};

// Fetch event rewards with full details (badges, decorations, themes)
export const useEventRewardsWithDetails = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['event-rewards-details', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      // Get event rewards
      const { data: eventRewards, error } = await supabase
        .from('event_rewards' as any)
        .select('*')
        .eq('event_id', eventId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (!eventRewards || eventRewards.length === 0) return [];

      /* Tła profili zostały wycięte z platformy (decyzja Michała), więc nagroda
         „Tło profilu" obiecywała coś, czego nie ma gdzie zobaczyć. Filtrujemy
         TU, a nie w widoku, żeby żaden inny ekran nagród też jej nie pokazał —
         wiersz w `event_rewards` może zostać, dopóki nie ruszymy danych. */
      const doPokazania = eventRewards.filter(
        (r: any) => r.reward_type !== 'profile_background',
      );
      if (doPokazania.length === 0) return [];

      // Fetch detailed data for each reward type
      const rewardsWithDetails = await Promise.all(
        doPokazania.map(async (reward: any) => {
          let details = null;

          if (reward.reward_type === 'badge') {
            const { data } = await supabase
              .from('user_badges' as any)
              .select('id, name, icon_url, color, rarity')
              .eq('id', reward.reward_item_id)
              .single();
            details = data;
          } else if (reward.reward_type === 'avatar_decoration') {
            const { data } = await supabase
              .from('avatar_decorations' as any)
              .select('id, name, decoration_url, preview_url, color_theme')
              .eq('id', reward.reward_item_id)
              .single();
            details = data;
          } else if (reward.reward_type === 'color_theme') {
            const { data } = await supabase
              .from('color_themes')
              .select('id, name:display_name, description')
              .eq('id', reward.reward_item_id)
              .single();
            if (data) {
              // Fetch primary, background, card colors for mini UI preview
              const { data: colorData } = await supabase
                .from('color_settings')
                .select('css_variable, hsl_value')
                .eq('theme_id', reward.reward_item_id)
                .in('css_variable', ['--primary', '--background', '--card']);
              const colorMap: any = {};
              (colorData || []).forEach((c: any) => { colorMap[c.css_variable] = c.hsl_value; });
              details = { 
                ...data, 
                primary_color: colorMap['--primary'],
                bg_color: colorMap['--background'],
                card_color: colorMap['--card'],
              };
            }
          }

          return {
            ...reward,
            details
          };
        })
      );

      return rewardsWithDetails;
    },
    enabled: !!eventId
  });
};

// Fetch event rewards
export const useEventRewards = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['event-rewards', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from('event_rewards' as any)
        .select('*')
        .eq('event_id', eventId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as unknown as EventReward[];
    },
    enabled: !!eventId
  });
};

// Fetch event tasks
export const useEventTasks = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['event-tasks', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from('event_tasks' as any)
        .select('*')
        .eq('event_id', eventId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as unknown as EventTask[];
    },
    enabled: !!eventId
  });
};

// Fetch user event progress
export const useUserEventProgress = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['user-event-progress', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_event_progress' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as UserEventProgress | null;
    },
    enabled: !!eventId
  });
};

// Fetch user task progress
export const useUserTaskProgress = (eventId: string | undefined) => {
  const queryClient = useQueryClient();

  // Setup realtime subscription
  React.useEffect(() => {
    if (!eventId) return;

    /* Kafelki eventu montują ten hak kilka razy naraz (panel, lista zadań,
       karta), a nazwa kanału była stała — patrz `dolaczDoKanalu`. */
    return dolaczDoKanalu(
      `user-task-progress-changes-${eventId}`,
      [{ table: 'user_event_task_progress', filter: `event_id=eq.${eventId}` }],
      () => queryClient.invalidateQueries({ queryKey: ['user-task-progress', eventId] }),
    );
  }, [eventId, queryClient]);

  return useQuery({
    queryKey: ['user-task-progress', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_event_task_progress' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('event_id', eventId);

      if (error) throw error;
      return data as unknown as UserTaskProgress[];
    },
    enabled: !!eventId
  });
};

// Check if user can claim rewards
export const useCanClaimRewards = (eventId: string | undefined) => {
  const { data: event } = useEventDetails(eventId);
  const { data: progress } = useUserEventProgress(eventId);
  const { data: tasks } = useEventTasks(eventId);
  const { data: taskProgress } = useUserTaskProgress(eventId);

  if (!event || !eventId) return false;
  if (progress?.status === 'completed') return false;

  // Instant mode - always can claim
  if (event.claim_mode === 'instant') return true;

  // Task-based mode - check if all required tasks completed
  if (event.claim_mode === 'task_based') {
    const requiredTasks = tasks?.filter(t => t.is_required) || [];
    const completedTasks = taskProgress?.filter(tp => tp.status === 'completed') || [];
    const completedTaskIds = new Set(completedTasks.map(tp => tp.task_id));
    
    return requiredTasks.every(task => completedTaskIds.has(task.id));
  }

  return false;
};

// Start event participation
export const useStartEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Musisz być zalogowany');

      const { data, error } = await supabase
        .from('user_event_progress' as any)
        .insert({
          user_id: user.id,
          event_id: eventId,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['user-event-progress', eventId] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.message
      });
    }
  });
};

// Complete task
export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, taskId }: { eventId: string; taskId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Musisz być zalogowany');

      // Fetch task details to get points
      const { data: task, error: taskError } = await supabase
        .from('event_tasks' as any)
        .select('points')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;

      // Mark task as completed
      const { data, error } = await supabase
        .from('user_event_task_progress' as any)
        .upsert({
          user_id: user.id,
          event_id: eventId,
          task_id: taskId,
          status: 'completed',
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,event_id,task_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Award XP points to user profile if task has points
      const taskPoints = (task as any)?.points || 0;
      if (taskPoints > 0) {
        // Update user's total_xp directly
        const { error: xpError } = await supabase.rpc('increment_user_xp' as any, {
          p_user_id: user.id,
          p_xp_amount: taskPoints
        });

        if (xpError) {
          console.error('Error awarding XP:', xpError);
          // Try direct update as fallback
          const { data: profile } = await supabase
            .from('profiles')
            .select('total_xp')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            await supabase
              .from('profiles')
              .update({ total_xp: (profile.total_xp || 0) + taskPoints })
              .eq('id', user.id);
          }
        }
      }

      return { taskProgress: data, points: taskPoints };
    },
    onSuccess: (data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-task-progress', eventId] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['account-data'] });
      queryClient.invalidateQueries({ queryKey: ['level-info'] });
      
      toast({
        title: 'Zadanie ukończone!',
        description: data.points > 0 ? `+${data.points} XP! Świetna robota!` : 'Świetna robota!'
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.message
      });
    }
  });
};

// Claim event rewards
export const useClaimEventRewards = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Musisz być zalogowany');

      // Fetch rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from('event_rewards' as any)
        .select('*')
        .eq('event_id', eventId);

      if (rewardsError) throw rewardsError;
      if (!rewards || rewards.length === 0) throw new Error('Brak nagród do odebrania');

      // Award each reward (with duplicate handling)
      for (const reward of rewards as any[]) {
        if (reward.reward_type === 'badge') {
          // Check if already has this badge
          const { data: existing } = await supabase
            .from('user_badge_assignments' as any)
            .select('id')
            .eq('user_id', user.id)
            .eq('badge_id', reward.reward_item_id)
            .maybeSingle();
          
          if (!existing) {
            await supabase.from('user_badge_assignments' as any).insert({
              user_id: user.id,
              badge_id: reward.reward_item_id,
              assigned_at: new Date().toISOString()
            });
          }
        } else if (reward.reward_type === 'avatar_decoration') {
          // Check if already has this decoration
          const { data: existing } = await supabase
            .from('user_avatar_decorations' as any)
            .select('id')
            .eq('user_id', user.id)
            .eq('decoration_id', reward.reward_item_id)
            .maybeSingle();
          
          if (!existing) {
            await supabase.from('user_avatar_decorations' as any).insert({
              user_id: user.id,
              decoration_id: reward.reward_item_id,
              granted_at: new Date().toISOString()
            });
          }
        } else if (reward.reward_type === 'color_theme') {
          // Grant color theme
          const { data: existing } = await supabase
            .from('user_purchased_themes')
            .select('id')
            .eq('user_id', user.id)
            .eq('theme_id', reward.reward_item_id)
            .maybeSingle();
          
          if (!existing) {
            await supabase.from('user_purchased_themes').insert({
              user_id: user.id,
              theme_id: reward.reward_item_id,
              is_active: false
            });
          }
        }
      }

      // Update progress
      const currentTime = new Date().toISOString();
      const { data, error } = await supabase
        .from('user_event_progress' as any)
        .upsert({
          user_id: user.id,
          event_id: eventId,
          status: 'completed',
          claimed_rewards: rewards.map((r: any) => r.id),
          completed_at: currentTime,
          claimed_at: currentTime
        }, {
          onConflict: 'user_id,event_id'
        })
        .select()
        .single();

      if (error) throw error;
      return { progress: data, rewards };
    },
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['user-event-progress', eventId] });
      queryClient.invalidateQueries({ queryKey: ['user-badge-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['user-avatar-decorations'] });
      toast({
        title: '🎉 Gratulacje!',
        description: 'Pomyślnie odebrano nagrody!'
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.message
      });
    }
  });
};
