import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';

export interface AssignedManagementTask {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  board_id: string;
  created_by: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  calendar_event_id: string | null;
  is_management_task: true;
}

/**
 * Hook to fetch management tasks assigned to the current user.
 * Checks both `management_task_assignees` table AND `assigned_to` column.
 */
export const useAssignedManagementTasks = () => {
  // user.id MUSI trafić do klucza cache. Bez niego po przelogowaniu na tym
  // samym urządzeniu kolejny użytkownik widzi zadania poprzednika (ten klucz
  // nie jest nigdzie inwalidowany). Id bierzemy z kontekstu auth — pobranie
  // go dopiero w `queryFn` byłoby za późno, klucz jest liczony wcześniej.
  const userId = useAuthId();

  return useQuery({
    queryKey: ['assigned-management-tasks', userId],
    enabled: !!userId,
    queryFn: async (): Promise<AssignedManagementTask[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // 1. Get task IDs from the assignees junction table
      const { data: assignments, error: assignmentsError } = await supabase
        .from('management_task_assignees')
        .select('task_id')
        .eq('user_id', user.id);

      if (assignmentsError) throw assignmentsError;

      const assigneeTaskIds = (assignments || []).map(a => a.task_id);

      // 2. Get tasks where assigned_to = user OR user is in assignees table
      let query = supabase
        .from('management_tasks')
        .select('*')
        .order('order_index');

      if (assigneeTaskIds.length > 0) {
        query = query.or(`assigned_to.eq.${user.id},id.in.(${assigneeTaskIds.join(',')})`);
      } else {
        query = query.eq('assigned_to', user.id);
      }

      const { data: tasks, error: tasksError } = await query;

      if (tasksError) throw tasksError;

      // Deduplicate by task id
      const seen = new Set<string>();
      const uniqueTasks = (tasks || []).filter(task => {
        if (seen.has(task.id)) return false;
        seen.add(task.id);
        return true;
      });

      // Filter out completed tasks older than 48h (auto-hide from personal board)
      const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const filtered = uniqueTasks.filter(task => {
        if (task.status === 'done' && task.updated_at < cutoff48h) return false;
        return true;
      });

      return filtered.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status as AssignedManagementTask['status'],
        priority: task.priority as AssignedManagementTask['priority'],
        due_date: task.due_date,
        board_id: task.board_id,
        created_by: task.created_by,
        order_index: task.order_index,
        created_at: task.created_at,
        updated_at: task.updated_at,
        calendar_event_id: task.calendar_event_id,
        is_management_task: true as const,
      }));
    },
  });
};
