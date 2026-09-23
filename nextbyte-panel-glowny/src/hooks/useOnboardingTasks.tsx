import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';

export interface OnboardingStep {
  num: string;
  title: string;
  description: string;
  platform?: 'ios' | 'android' | 'all';
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string | null;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
  instruction_title: string;
  instruction_steps: OnboardingStep[];
  created_at: string;
  updated_at: string;
}

export interface UserOnboardingProgress {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
}

export const useOnboardingTasks = () => {
  const userId = useAuthId();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['onboarding-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_tasks')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return (data || []).map(t => ({
        ...t,
        instruction_steps: (t.instruction_steps as any) as OnboardingStep[]
      })) as OnboardingTask[];
    },
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['onboarding-progress', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_onboarding_progress')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data as UserOnboardingProgress[];
    },
    enabled: !!userId,
  });

  const completeTask = useMutation({
    mutationFn: async (taskId: string) => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_onboarding_progress')
        .insert({ user_id: userId, task_id: taskId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress', userId] });
    },
  });

  const uncompleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_onboarding_progress')
        .delete()
        .eq('user_id', userId)
        .eq('task_id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress', userId] });
    },
  });

  const completedTaskIds = new Set((progress || []).map(p => p.task_id));
  const activeTasks = tasks || [];
  const completedCount = activeTasks.filter(t => completedTaskIds.has(t.id)).length;
  const totalCount = activeTasks.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  return {
    tasks: activeTasks,
    completedTaskIds,
    completedCount,
    totalCount,
    allCompleted,
    isLoading: tasksLoading || progressLoading,
    completeTask,
    uncompleteTask,
  };
};

// Admin hook for managing all tasks
export const useOnboardingTasksAdmin = () => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['onboarding-tasks-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_tasks')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return (data || []).map(t => ({
        ...t,
        instruction_steps: (t.instruction_steps as any) as OnboardingStep[]
      })) as OnboardingTask[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (task: Partial<OnboardingTask>) => {
      const { error } = await supabase.from('onboarding_tasks').insert(task as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding-tasks-admin'] }),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OnboardingTask> & { id: string }) => {
      const { error } = await supabase.from('onboarding_tasks').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-tasks-admin'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('onboarding_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-tasks-admin'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-tasks'] });
    },
  });

  return { tasks: tasks || [], isLoading, createTask, updateTask, deleteTask };
};
