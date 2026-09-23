import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EventTask } from './useEventRewards';

// Hook to automatically track progress for auto tasks
export const useAutoTaskTracking = (eventId: string | undefined, tasks: EventTask[] | undefined, hasStarted: boolean) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!eventId || !tasks || !hasStarted) return;

    const autoTasks = tasks.filter(t => t.task_type === 'auto' && t.achievement_category_id);
    if (autoTasks.length === 0) return;

    const trackProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get event start time (prefer started_at, fallback to created_at)
      const { data: progressData } = await supabase
        .from('user_event_progress')
        .select('created_at, started_at')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .single();

      if (!progressData) return;
      const eventStartTime = progressData.started_at || progressData.created_at;

      for (const task of autoTasks) {
        try {
          // Get user's current count for this achievement category
          const { data: categoryData } = await supabase
            .from('achievement_categories')
            .select('data_source, count_field, filter_conditions')
            .eq('id', task.achievement_category_id)
            .single();

          if (!categoryData) continue;

          let currentCount = 0;
          const filterConditions = categoryData.filter_conditions as any;

          // Query the appropriate table based on data_source
          if (categoryData.data_source === 'user_chat_history') {
            let query = supabase
              .from('user_chat_history')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .gte('created_at', eventStartTime);

            // Apply filter conditions if they exist
            if (filterConditions?.sender) {
              query = query.eq('sender', filterConditions.sender);
            }

            const { count } = await query;
            currentCount = count || 0;
          } else if (categoryData.data_source === 'agent_chat_messages') {
            let query = supabase
              .from('agent_chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .gte('created_at', eventStartTime);

            if (filterConditions?.sender) {
              query = query.eq('sender', filterConditions.sender);
            }

            const { count } = await query;
            currentCount = count || 0;
          } else if (categoryData.data_source === 'calendar_events') {
            // Count ALL calendar events created since event start (not just completed)
            // This matches the logic used for regular calendar achievements
            const { count } = await supabase
              .from('calendar_events')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .gte('created_at', eventStartTime);

            currentCount = count || 0;
          } else if (categoryData.data_source === 'user_tasks') {
            if (filterConditions?.status_filter === 'completed') {
              // Count from task completions history - works even if task is deleted
              const { count } = await supabase
                .from('user_task_completions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('completed_at', eventStartTime);
              
              currentCount = count || 0;
            } else {
              // Count created tasks from event start
              const { count } = await supabase
                .from('user_tasks')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', eventStartTime);
              
              currentCount = count || 0;
            }
          } else if (categoryData.data_source === 'combined_ai_chat') {
            // Count from both user_chat_history and agent_chat_messages
            const { count: chatCount } = await supabase
              .from('user_chat_history')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('sender', 'user')
              .gte('created_at', eventStartTime);

            const { count: agentCount } = await supabase
              .from('agent_chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('sender', 'user')
              .gte('created_at', eventStartTime);

            currentCount = (chatCount || 0) + (agentCount || 0);
          }

          // Check if progress record exists
          const { data: existingProgress } = await supabase
            .from('user_event_task_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('event_id', eventId)
            .eq('task_id', task.id)
            .maybeSingle();

          // Skip if task is already completed — no need to keep updating
          if (existingProgress?.status === 'completed') continue;

          // Calculate max progress (never decreases, even if user deletes history)
          const existingMax = (existingProgress?.progress_data as any)?.max || 0;
          const maxProgress = Math.max(currentCount, existingMax);

          // Skip update if nothing changed
          const existingCurrent = (existingProgress?.progress_data as any)?.current || 0;
          if (existingProgress && maxProgress === existingMax && currentCount === existingCurrent) continue;

          const progressData = {
            current: currentCount,
            max: maxProgress,
            required: task.required_value || 0,
            started_at: eventStartTime
          };

          const isCompleted = maxProgress >= (task.required_value || 0);
          const status = isCompleted ? 'completed' : maxProgress > 0 ? 'in_progress' : 'not_started';

          if (existingProgress) {
            await supabase
              .from('user_event_task_progress')
              .update({
                progress_data: progressData,
                status: status,
                completed_at: isCompleted ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingProgress.id);
          } else {
            await supabase
              .from('user_event_task_progress')
              .insert({
                user_id: user.id,
                event_id: eventId,
                task_id: task.id,
                progress_data: progressData,
                status: status,
                completed_at: isCompleted ? new Date().toISOString() : null
              });
          }
        } catch (error) {
          console.error('Error tracking auto task progress:', error);
        }
      }

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['user-task-progress', eventId] });
    };

    // Track progress immediately
    trackProgress();

    // Set up interval to check progress every 10 seconds
    const interval = setInterval(trackProgress, 10000);

    return () => clearInterval(interval);
  }, [eventId, tasks, hasStarted, queryClient]);
};
