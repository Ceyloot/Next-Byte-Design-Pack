import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { hotCache } from '@/lib/hotMemoryCache';
import { dolaczDoKanalu } from '@/lib/realtimeChannels';

export type PendingDashboardActionType = 'company_invite' | 'calendar_share' | 'note_share' | 'folder_share';

export interface PendingDashboardAction {
  id: string;
  type: PendingDashboardActionType;
  title: string;
  description: string;
  sourceLabel: string;
  createdAt: string;
  route: string;
  metadata: Record<string, string>;
}

type CompanyInviteRow = { id: string; company_id: string; token: string; role: string | null; created_at: string; company?: { name?: string | null } | null };
type CalendarInviteRow = { id: string; created_at: string; role: string | null; calendar?: { name?: string | null } | null };
type NoteShareRow = { id: string; created_at: string; permission: string | null; note?: { title?: string | null } | null };
type FolderShareRow = { id: string; created_at: string; permission: string | null; folder?: { name?: string | null } | null };
type RealtimeEmailPayload = { new?: { email?: string | null }; old?: { email?: string | null } };

const pendingActionsKey = ['pending-dashboard-actions'];

export const usePendingDashboardActions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: pendingActionsKey,
    queryFn: async (): Promise<PendingDashboardAction[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const normalizedEmail = user.email?.trim().toLowerCase() || '';
      const actions: PendingDashboardAction[] = [];

      if (normalizedEmail) {
        const [{ data: companyInvites }, { data: memberships }] = await Promise.all([
          supabase
            .from('company_invitations')
            .select('id, company_id, token, role, created_at, email, company:companies(name)')
            .ilike('email', normalizedEmail)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(8),
          supabase
            .from('company_members')
            .select('company_id')
            .eq('user_id', user.id)
            .eq('status', 'active'),
        ]);

        const joinedCompanyIds = new Set((memberships || []).map((m: { company_id: string }) => m.company_id));

        (companyInvites as CompanyInviteRow[] | null)?.forEach((inv) => {
          if (joinedCompanyIds.has(inv.company_id)) return;
          const companyName = inv.company?.name || 'firma';
          actions.push({
            id: `company-${inv.id}`,
            type: 'company_invite',
            title: `Zaproszenie do firmy: ${companyName}`,
            description: `Rola: ${inv.role || 'Pracownik'}`,
            sourceLabel: 'Firma',
            createdAt: inv.created_at,
            route: '/firma',
            metadata: { inviteId: inv.id, token: inv.token, companyId: inv.company_id, companyName },
          });
        });
      }


      const [{ data: calendars }, { data: notes }, { data: folders }] = await Promise.all([
        supabase
          .from('shared_calendar_members')
          .select('id, created_at, role, calendar:shared_calendars(name)')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('note_shares')
          .select('id, created_at, permission, note:user_notes(title)')
          .eq('shared_with_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('folder_shares')
          .select('id, created_at, permission, folder:user_note_folders(name)')
          .eq('shared_with_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(8),
      ]);

      (calendars as CalendarInviteRow[] | null)?.forEach((item) => actions.push({
        id: `calendar-${item.id}`,
        type: 'calendar_share',
        title: `Zaproszenie do kalendarza: ${item.calendar?.name || 'Kalendarz'}`,
        description: `Dostęp: ${item.role || 'uczestnik'}`,
        sourceLabel: 'Kalendarz',
        createdAt: item.created_at,
        route: '/kalendarz',
        metadata: { inviteId: item.id, table: 'shared_calendar_members' },
      }));

      (notes as NoteShareRow[] | null)?.forEach((item) => actions.push({
        id: `note-${item.id}`,
        type: 'note_share',
        title: `Zaproszenie do notatki: ${item.note?.title || 'Notatka'}`,
        description: `Uprawnienia: ${item.permission || 'odczyt'}`,
        sourceLabel: 'Notatka',
        createdAt: item.created_at,
        route: '/notatki',
        metadata: { inviteId: item.id, table: 'note_shares' },
      }));

      (folders as FolderShareRow[] | null)?.forEach((item) => actions.push({
        id: `folder-${item.id}`,
        type: 'folder_share',
        title: `Zaproszenie do folderu: ${item.folder?.name || 'Folder'}`,
        description: `Uprawnienia: ${item.permission || 'odczyt'}`,
        sourceLabel: 'Folder',
        createdAt: item.created_at,
        route: '/notatki',
        metadata: { inviteId: item.id, table: 'folder_shares' },
      }));

      return actions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    staleTime: 15 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    let odlacz: (() => void) | null = null;
    /* Kanał powstaje dopiero po `getUser()`. Bez tej flagi sprzątanie efektu
       trafia w `channel === null`, a dopiero potem rozwiązana obietnica zakłada
       kanał, który nikt już nie usunie — kolejny montaż dostaje ten sam temat
       po `subscribe()` i wywala „cannot add postgres_changes callbacks”. */
    let porzucony = false;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || porzucony) return;
      const normalizedEmail = user.email?.trim().toLowerCase() || '';
      const refresh = (payload?: RealtimeEmailPayload) => {
        const rowEmail = payload?.new?.email || payload?.old?.email;
        if (rowEmail && normalizedEmail && String(rowEmail).trim().toLowerCase() !== normalizedEmail) return;
        queryClient.invalidateQueries({ queryKey: pendingActionsKey });
      };

      /* Wspólny kanał — hak żyje naraz w pasku bocznym i na karcie Dashboardu. */
      odlacz = dolaczDoKanalu(
        `pending-dashboard-actions-${user.id}`,
        [
          { table: 'company_invitations' },
          { table: 'shared_calendar_members', filter: `user_id=eq.${user.id}` },
          { table: 'note_shares', filter: `shared_with_id=eq.${user.id}` },
          { table: 'folder_shares', filter: `shared_with_id=eq.${user.id}` },
          { table: 'company_members', filter: `user_id=eq.${user.id}` },
        ],
        refresh,
      );


    });

    return () => {
      porzucony = true;
      odlacz?.();
    };
  }, [queryClient]);

  const resolveAction = useMutation({
    mutationFn: async ({ action, decision }: { action: PendingDashboardAction; decision: 'accept' | 'reject' }) => {
      if (action.type === 'company_invite') {
        if (decision === 'accept') {
          const { data, error } = await supabase.functions.invoke('manage-company-member', {
            body: { action: 'accept_invitation', invitation_token: action.metadata.token },
          });
          if (error) throw new Error(error.message);
          if (data?.error) throw new Error(data.error);
          await supabase.from('company_invitations').update({ status: 'accepted' }).eq('id', action.metadata.inviteId);
          hotCache.delete('user-companies');
          hotCache.delete('user-companies-admin');
        } else {
          const { error } = await supabase.from('company_invitations').update({ status: 'rejected' }).eq('id', action.metadata.inviteId);
          if (error) throw error;
        }
        return;
      }

      const nextStatus = decision === 'accept' ? 'accepted' : 'rejected';
      const { error } = action.type === 'calendar_share'
        ? await supabase.from('shared_calendar_members').update({ status: nextStatus }).eq('id', action.metadata.inviteId)
        : action.type === 'note_share'
          ? await supabase.from('note_shares').update({ status: nextStatus }).eq('id', action.metadata.inviteId)
          : await supabase.from('folder_shares').update({ status: nextStatus }).eq('id', action.metadata.inviteId);
      if (error) throw error;
    },
    onMutate: async ({ action }) => {
      await queryClient.cancelQueries({ queryKey: pendingActionsKey });
      const previous = queryClient.getQueryData<PendingDashboardAction[]>(pendingActionsKey);
      queryClient.setQueryData<PendingDashboardAction[]>(pendingActionsKey, (current = []) => current.filter(item => item.id !== action.id));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(pendingActionsKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: pendingActionsKey });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-companies'] });
      queryClient.invalidateQueries({ queryKey: ['shared-calendar-events'] });
    },
  });

  return {
    ...query,
    actions: query.data || [],
    pendingCount: query.data?.length || 0,
    resolveAction,
  };
};