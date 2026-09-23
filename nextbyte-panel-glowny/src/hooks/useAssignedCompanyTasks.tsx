import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';

export interface AssignedCompanyTask {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  board_id: string;
  company_id: string;
  created_by: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  company_name: string;
  company_slug: string;
  is_company_task: true;
}

/**
 * Hook to fetch company tasks assigned to the current user.
 * Checks both `company_task_assignees` table AND `assigned_to` column.
 */
export const useAssignedCompanyTasks = () => {
  // WYCIEK DANYCH MIEDZY UZYTKOWNIKAMI (naprawa 20.07.2026):
  // klucz cache nie zawieral identyfikatora uzytkownika, wiec React Query
  // trzymal zadania pod globalnym kluczem. Gdy w tej samej sesji przegladarki
  // wylogowala sie jedna osoba i zalogowala druga, druga dostawala z cache
  // ZADANIA POPRZEDNIEJ. Pobranie usera wewnatrz queryFn tego nie naprawia —
  // id musi byc czescia klucza, zanim zapytanie w ogole wystartuje.
  // Ten sam blad byl w useAssignedManagementTasks (naprawiony w tym samym PR).
  const userId = useAuthId();

  return useQuery({
    queryKey: ['assigned-company-tasks', userId],
    enabled: !!userId,
    queryFn: async (): Promise<AssignedCompanyTask[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // 1. Get task IDs from the assignees junction table
      const { data: assignments, error: assignmentsError } = await supabase
        .from('company_task_assignees')
        .select('task_id')
        .eq('user_id', user.id);

      if (assignmentsError) throw assignmentsError;

      const assigneeTaskIds = (assignments || []).map(a => a.task_id);

      // 2. Get tasks where assigned_to = user OR user is in assignees table
      let query = supabase
        .from('company_tasks')
        .select(`
          *,
          company:companies!company_id (
            name,
            slug
          )
        `)
        .order('order_index');

      if (assigneeTaskIds.length > 0) {
        // Tasks where assigned_to = me OR id in assignee task ids
        query = query.or(`assigned_to.eq.${user.id},id.in.(${assigneeTaskIds.join(',')})`);
      } else {
        // Only tasks where assigned_to = me
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
        status: task.status as AssignedCompanyTask['status'],
        priority: task.priority as AssignedCompanyTask['priority'],
        due_date: task.due_date,
        board_id: task.board_id,
        company_id: task.company_id,
        created_by: task.created_by,
        order_index: task.order_index,
        created_at: task.created_at,
        updated_at: task.updated_at,
        company_name: (task.company as any)?.name || 'Firma',
        company_slug: (task.company as any)?.slug || '',
        is_company_task: true as const,
      }));
    },
  });
};
