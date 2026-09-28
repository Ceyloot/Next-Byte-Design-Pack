import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';
import { dolaczDoKanalu } from '@/lib/realtimeChannels';

export type NotificationSource =
  | 'system'
  | 'company_invitation'
  | 'event_invitation'
  | 'note_share'
  | 'folder_share'
  | 'shared_calendar'
  | 'whiteboard_share'
  | 'team_invitation';

export type NotificationIcon =
  | 'mail'
  | 'calendar'
  | 'note'
  | 'board'
  | 'building'
  | 'users'
  | 'bell';

export interface UnifiedNotification {
  id: string; // unique key: source + sourceId
  source: NotificationSource;
  sourceId: string;
  title: string;
  description?: string;
  icon: NotificationIcon;
  link: string;
  createdAt: string;
  isRead: boolean;
  status?: 'pending' | 'accepted' | 'rejected' | 'declined' | 'invited' | string;
}

interface RawAggregated {
  notifications: Omit<UnifiedNotification, 'isRead'>[];
  reads: Map<string, true>; // key = source:sourceId
}

const QUERY_KEY = (userId: string | null) => ['unified-notifications', userId];

async function fetchAll(userId: string, userEmail: string | null): Promise<RawAggregated> {
  const items: Omit<UnifiedNotification, 'isRead'>[] = [];

  const [
    sys,
    eventInv,
    noteShares,
    folderShares,
    whiteboardShares,
    sharedCalMembers,
    companyInv,
    teamInv,
    reads,
  ] = await Promise.all([
    supabase
      .from('user_notifications')
      .select('id, title, message, type, is_read, created_at, metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('event_invitations')
      .select('id, event_id, status, created_at, calendar_events(title)')
      .eq('invitee_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('note_shares')
      .select('id, note_id, status, created_at, user_notes!note_shares_note_id_fkey(title)')
      .eq('shared_with_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('folder_shares')
      .select('id, folder_id, status, created_at')
      .eq('shared_with_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('whiteboard_shares')
      .select('id, whiteboard_id, status, created_at')
      .eq('shared_with_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('shared_calendar_members')
      .select('id, calendar_id, status, created_at, shared_calendars(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    userEmail
      ? supabase
          .from('company_invitations')
          .select('id, role, status, created_at, companies(name)')
          .eq('email', userEmail)
          .order('created_at', { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] as any[], error: null }),
    /*
      ZAPROSZENIA DO ZESPOŁU — ŹRÓDŁO WYŁĄCZONE 03.08.2026.

      To zapytanie zwracało `400 Bad Request` przy KAŻDYM wczytaniu powiadomień,
      czyli na każdym wejściu na platformę. Michał pokazał to w konsoli.

      Sprawdzone w bazie, nie założone:
        • tabeli `teams` NIE MA w ogóle — więc złączenie `teams(name)` nie ma
          prawa się rozwiązać i PostgREST odrzuca całe zapytanie,
        • `team_invitations` ma 0 wierszy,
        • jej kolumna `team_id` nie ma żadnego klucza obcego — nie wskazuje
          na nic.

      Czyli to jest pozostałość po wyciętej funkcji „zespoły": zapytanie nigdy
      nie mogło nic zwrócić, a kosztowało jedno nieudane żądanie na wejście.
      Samej tabeli NIE kasuję — to osobna decyzja i migracja.
    */
    Promise.resolve({ data: [] as any[], error: null }),
    supabase
      .from('notification_reads')
      .select('source, source_id')
      .eq('user_id', userId),
  ]);

  for (const n of (sys.data ?? []) as any[]) {
    const md = n.metadata || {};
    let link: string = md.link || md.url || '/panel-glowny';
    if (!md.link && !md.url) {
      if (md.task_id) link = `/zadania?task=${md.task_id}`;
      else if (md.note_id) link = `/notatki/${md.note_id}`;
      else if (md.whiteboard_id) link = `/tablice?board=${md.whiteboard_id}`;
      else if (md.event_id) link = `/kalendarz?event=${md.event_id}`;
    }
    items.push({
      id: `system:${n.id}`,
      source: 'system',
      sourceId: n.id,
      title: n.title || 'Powiadomienie',
      description: n.message ?? undefined,
      icon: 'bell',
      link,
      createdAt: n.created_at,
    });
  }

  for (const n of (eventInv.data ?? []) as any[]) {
    items.push({
      id: `event_invitation:${n.id}`,
      source: 'event_invitation',
      sourceId: n.id,
      title: 'Zaproszenie do wydarzenia',
      description: n.calendar_events?.title || 'Nowe wydarzenie w kalendarzu',
      icon: 'calendar',
      link: n.event_id ? `/kalendarz?event=${n.event_id}` : '/kalendarz',
      createdAt: n.created_at,
      status: n.status,
    });
  }

  for (const n of (noteShares.data ?? []) as any[]) {
    items.push({
      id: `note_share:${n.id}`,
      source: 'note_share',
      sourceId: n.id,
      title: 'Udostępniono notatkę',
      description: n.user_notes?.title || 'Nowa notatka do współpracy',
      icon: 'note',
      link: n.note_id ? `/notatki/${n.note_id}` : '/notatki',
      createdAt: n.created_at,
      status: n.status,
    });
  }

  for (const n of (folderShares.data ?? []) as any[]) {
    items.push({
      id: `folder_share:${n.id}`,
      source: 'folder_share',
      sourceId: n.id,
      title: 'Udostępniono folder',
      description: 'Nowy folder w notatkach',
      icon: 'note',
      link: n.folder_id ? `/notatki?folder=${n.folder_id}` : '/notatki',
      createdAt: n.created_at,
      status: n.status,
    });
  }

  for (const n of (whiteboardShares.data ?? []) as any[]) {
    items.push({
      id: `whiteboard_share:${n.id}`,
      source: 'whiteboard_share',
      sourceId: n.id,
      title: 'Udostępniono tablicę',
      description: 'Nowa tablica do współpracy',
      icon: 'board',
      link: n.whiteboard_id ? `/tablice?board=${n.whiteboard_id}` : '/tablice',
      createdAt: n.created_at,
      status: n.status,
    });
  }

  for (const n of (sharedCalMembers.data ?? []) as any[]) {
    items.push({
      id: `shared_calendar:${n.id}`,
      source: 'shared_calendar',
      sourceId: n.id,
      title: 'Zaproszenie do kalendarza',
      description: n.shared_calendars?.name || 'Współdzielony kalendarz',
      icon: 'calendar',
      link: n.calendar_id ? `/kalendarz?calendar=${n.calendar_id}` : '/kalendarz',
      createdAt: n.created_at,
      status: n.status,
    });
  }

  for (const n of (companyInv.data ?? []) as any[]) {
    items.push({
      id: `company_invitation:${n.id}`,
      source: 'company_invitation',
      sourceId: n.id,
      title: 'Zaproszenie do firmy',
      description: `${n.companies?.name || 'Firma'} • ${n.role || 'Pracownik'}`,
      icon: 'building',
      link: '/firma',
      createdAt: n.created_at,
      status: n.status,
    });
  }

  for (const n of (teamInv.data ?? []) as any[]) {
    items.push({
      id: `team_invitation:${n.id}`,
      source: 'team_invitation',
      sourceId: n.id,
      title: 'Zaproszenie do zespołu',
      description: `${n.teams?.name || 'Zespół'} • ${n.role || 'Członek'}`,
      icon: 'users',
      link: '/zespol',
      createdAt: n.created_at,
      status: n.status,
    });
  }

  // Reads map
  const readsMap = new Map<string, true>();
  // user_notifications already uses is_read; mark them as read in the map
  for (const n of (sys.data ?? []) as any[]) {
    if (n.is_read) readsMap.set(`system:${n.id}`, true);
  }
  // Resolved invitations (accepted/rejected/declined) count as read for badge purposes
  for (const item of items) {
    if (item.status && item.status !== 'pending' && item.status !== 'invited') {
      readsMap.set(`${item.source}:${item.sourceId}`, true);
    }
  }
  for (const r of (reads.data ?? []) as any[]) {
    readsMap.set(`${r.source}:${r.source_id}`, true);
  }

  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return { notifications: items, reads: readsMap };
}

export function useUnifiedNotifications() {
  const userId = useAuthId();
  const queryClient = useQueryClient();
  const emailRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: QUERY_KEY(userId),
    enabled: !!userId,
    staleTime: 30_000,
    queryFn: async () => {
      if (!userId) return { notifications: [], reads: new Map() } as RawAggregated;
      let email = emailRef.current;
      if (!email) {
        const { data } = await supabase.auth.getUser();
        email = data.user?.email ?? null;
        emailRef.current = email;
      }
      return fetchAll(userId, email);
    },
  });

  // Realtime — kanał wspólny dla wszystkich konsumentów haka (PasekKart montuje
  // go kilka razy naraz; osobne `.on()` po `subscribe()` wywalało render).
  useEffect(() => {
    if (!userId) return;
    return dolaczDoKanalu(
      `unified-notifications-${userId}`,
      [
        { event: 'INSERT', table: 'user_notifications', filter: `user_id=eq.${userId}` },
        { event: 'INSERT', table: 'event_invitations', filter: `invitee_id=eq.${userId}` },
        { event: 'INSERT', table: 'note_shares', filter: `shared_with_id=eq.${userId}` },
        { event: 'INSERT', table: 'folder_shares', filter: `shared_with_id=eq.${userId}` },
        { event: 'INSERT', table: 'whiteboard_shares', filter: `shared_with_id=eq.${userId}` },
        { event: 'INSERT', table: 'shared_calendar_members', filter: `user_id=eq.${userId}` },
      ],
      () => queryClient.invalidateQueries({ queryKey: QUERY_KEY(userId) }),
    );
  }, [userId, queryClient]);

  const notifications: UnifiedNotification[] = useMemo(() => {
    const data = query.data as RawAggregated | undefined;
    if (!data) return [];
    return data.notifications.map((n) => ({
      ...n,
      isRead: data.reads.has(`${n.source}:${n.sourceId}`),
    }));
  }, [query.data]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const markAsRead = useCallback(
    async (n: UnifiedNotification) => {
      if (!userId || n.isRead) return;
      if (n.source === 'system') {
        await supabase
          .from('user_notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('id', n.sourceId)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('notification_reads')
          .upsert({ user_id: userId, source: n.source, source_id: n.sourceId, read_at: new Date().toISOString() });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(userId) });
    },
    [userId, queryClient]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    const sysIds = unread.filter((n) => n.source === 'system').map((n) => n.sourceId);
    const others = unread.filter((n) => n.source !== 'system');

    const tasks: PromiseLike<any>[] = [];
    if (sysIds.length > 0) {
      tasks.push(
        supabase
          .from('user_notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in('id', sysIds)
          .eq('user_id', userId)
      );
    }
    if (others.length > 0) {
      tasks.push(
        supabase.from('notification_reads').upsert(
          others.map((n) => ({
            user_id: userId,
            source: n.source,
            source_id: n.sourceId,
            read_at: new Date().toISOString(),
          }))
        )
      );
    }
    await Promise.all(tasks);
    queryClient.invalidateQueries({ queryKey: QUERY_KEY(userId) });
  }, [userId, notifications, queryClient]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY(userId) });
  }, [userId, queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}
