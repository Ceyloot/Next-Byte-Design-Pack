import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 'chat' | 'team' | 'template' | 'course' | 'level' | 'achievement' | 'invitation' | 'byte' | 'notification' | 'company_task' | 'work_shift' | 'ai_proposal' | 'calendar_invite' | 'note_invite' | 'folder_invite' | 'konto' | 'tworczosc';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'info';
  metadata?: Record<string, any>;
}

export const useRealtimeActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const processedEventsRef = useRef<Set<string>>(new Set());

  const loadActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMountedRef.current) return;

      const activitiesArray: ActivityItem[] = [];

      /*
        WSZYSTKIE NIEZALEŻNE ZAPYTANIA STARTUJĄ NARAZ (06.08.2026).

        Zgłoszenie Michała: „Aktywność Live długo się ładuje". Przyczyną
        nie była ilość danych (limity po 3–5 wierszy), tylko KSZTAŁT
        pobierania: jedenaście `await` jedno po drugim, każde czekało
        na poprzednie. Przy ~150 ms na obieg dawało to ~2 s samego
        czekania w kolejce.

        `Promise.resolve(builder)` subskrybuje zapytanie OD RAZU (builder
        Supabase jest thenable i rusza dopiero przy subskrypcji), a każdy
        blok przetwarzania niżej odbiera swoje `p_*` w dotychczasowym
        miejscu — logika i kolejność wstawiania bez zmian, bo na końcu
        i tak jest sortowanie po czasie z deduplikacją. Sekwencyjny
        zostaje tylko łańcuch memberships → zmiany (realna zależność).
      */
      const p_achievements = Promise.resolve(
        supabase
        .from('user_achievements')
        .select(`
          id, 
          completed_at,
          achievement:achievements(name)
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(3)
      );
      const p_invitations = Promise.resolve(
        supabase
        .from('company_invitations')
        .select(`
          id, 
          created_at, 
          status,
          token,
          company_id,
          company:companies(name)
        `)
        .eq('email', user.email?.toLowerCase() || '')
        .order('created_at', { ascending: false })
        .limit(3)
      );
      const p_notifications = Promise.resolve(
        supabase
        .from('user_notifications')
        .select('id, title, type, created_at, is_read')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
      );
      const p_byteAllocations = Promise.resolve(
        supabase
        .from('company_byte_allocations')
        .select('id, amount, created_at, note')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
      );
      const p_memberships = Promise.resolve(
        supabase
        .from('company_members')
        .select('id, company_id')
        .eq('user_id', user.id)
      );
      const p_calInvites = Promise.resolve(
        supabase
        .from('shared_calendar_members')
        .select('id, status, created_at, calendar_id, role, user_id, calendar:shared_calendars(name, color)')
        .eq('user_id', user.id)
        .in('status', ['pending', 'accepted', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(5)
      );
      const p_noteInvites = Promise.resolve(
        supabase
        .from('note_shares')
        .select('id, status, created_at, note_id, permission, owner_id, note:user_notes(title)')
        .eq('shared_with_id', user.id)
        .in('status', ['pending', 'accepted', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(5)
      );
      const p_folderInvites = Promise.resolve(
        supabase
        .from('folder_shares')
        .select('id, status, created_at, folder_id, permission, owner_id, folder:user_note_folders(name)')
        .eq('shared_with_id', user.id)
        .in('status', ['pending', 'accepted', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(5)
      );
      const p_chatMessages = Promise.resolve(
        supabase
        .from('user_chat_history')
        .select('id, metadata, created_at, conversation_id')
        .eq('user_id', user.id)
        .eq('sender', 'assistant')
        .not('metadata', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20)
      );
      const p_profil = Promise.resolve(
        supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .maybeSingle()
      );

      // Recent achievements (completed)
      const { data: achievements } = await p_achievements;

      if (achievements) {
        achievements.forEach(ach => {
          if (ach.completed_at) {
            activitiesArray.push({
              id: `ach-${ach.id}`,
              type: 'achievement',
              message: `Odblokowano osiągnięcie: ${(ach.achievement as any)?.name || 'Nowe osiągnięcie'}`,
              timestamp: new Date(ach.completed_at),
              status: 'success'
            });
          }
        });
      }

      // Company invitations (pending and accepted)
      const { data: invitations } = await p_invitations;

      if (invitations) {
        invitations.forEach(inv => {
          if (inv.status === 'pending') return;
          const companyName = (inv.company as any)?.name || 'firma';
          activitiesArray.push({
            id: `inv-${inv.id}`,
            type: 'invitation',
            message: `Dołączono do firmy: ${companyName}`,
            timestamp: new Date(inv.created_at),
            status: 'success'
          });
        });
      }

      // User notifications (recent) - only byte/achievement/level types
      const { data: notifications } = await p_notifications;

      if (notifications) {
        notifications.forEach(notif => {
          let activityType: ActivityType = 'notification';
          if (notif.type === 'level_up') activityType = 'level';
          else if (notif.type === 'achievement') activityType = 'achievement';
          else if (notif.type === 'byte_received' || notif.type === 'byte_purchase') activityType = 'byte';
          
          activitiesArray.push({
            id: `notif-${notif.id}`,
            type: activityType,
            message: notif.title,
            timestamp: new Date(notif.created_at),
            status: notif.is_read ? 'success' : 'info'
          });
        });
      }

      // Byte allocations received (for company members)
      const { data: byteAllocations } = await p_byteAllocations;

      if (byteAllocations) {
        byteAllocations.forEach(alloc => {
          activitiesArray.push({
            id: `byte-${alloc.id}`,
            type: 'byte',
            message: `Otrzymano ${alloc.amount} Byte${alloc.note ? `: ${alloc.note}` : ''}`,
            timestamp: new Date(alloc.created_at),
            status: 'success'
          });
        });
      }

      // Company tasks assigned to user (recent)
      // First get user's company member IDs
      const { data: memberships } = await p_memberships;

      if (memberships && memberships.length > 0) {
        // Get tasks assigned to this user
        const { data: companyTasks } = await supabase
          .from('company_tasks')
          .select('id, title, created_at, company_id, status')
          .eq('assigned_to', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (companyTasks) {
          companyTasks.forEach(task => {
            activitiesArray.push({
              id: `ctask-${task.id}`,
              type: 'company_task',
              message: `Przypisano zadanie: ${task.title}`,
              timestamp: new Date(task.created_at),
              status: task.status === 'done' ? 'success' : 'pending'
            });
          });
        }

        // Get work shifts assigned to user's member IDs
        const memberIds = memberships.map(m => m.id);
        const { data: shifts } = await supabase
          .from('company_work_shifts')
          .select('id, title, shift_start, shift_type, created_at, assigned_member_id')
          .in('assigned_member_id', memberIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (shifts) {
          shifts.forEach(shift => {
            const shiftDate = new Date(shift.shift_start).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
            activitiesArray.push({
              id: `shift-${shift.id}`,
              type: 'work_shift',
              message: `Nowa zmiana: ${shift.title} (${shiftDate})`,
              timestamp: new Date(shift.created_at || shift.shift_start),
              status: 'info'
            });
          });
        }
      }

      // Pending shared calendar invitations
      const { data: calInvites } = await p_calInvites;

      if (calInvites) {
        calInvites.forEach(inv => {
          if (inv.status === 'pending') return;
          const calName = (inv.calendar as any)?.name || 'Kalendarz';
          activitiesArray.push({
            id: `cal-inv-${inv.id}`,
            type: 'calendar_invite',
            message: inv.status === 'accepted'
                ? `Dołączono do kalendarza: ${calName}`
                : `Odrzucono zaproszenie: ${calName}`,
            timestamp: new Date(inv.created_at),
            status: inv.status === 'accepted' ? 'success' : 'info',
            metadata: { inviteId: inv.id, table: 'shared_calendar_members', calendarName: calName }
          });
        });
      }

      // Pending note share invitations
      const { data: noteInvites } = await p_noteInvites;

      if (noteInvites) {
        noteInvites.forEach(inv => {
          if (inv.status === 'pending') return;
          const noteTitle = (inv.note as any)?.title || 'Notatka';
          activitiesArray.push({
            id: `note-inv-${inv.id}`,
            type: 'note_invite',
            message: inv.status === 'accepted'
                ? `Dołączono do notatki: ${noteTitle}`
                : `Odrzucono zaproszenie: ${noteTitle}`,
            timestamp: new Date(inv.created_at),
            status: inv.status === 'accepted' ? 'success' : 'info',
            metadata: { inviteId: inv.id, table: 'note_shares', noteTitle }
          });
        });
      }

      // Pending folder share invitations
      const { data: folderInvites } = await p_folderInvites;

      if (folderInvites) {
        folderInvites.forEach(inv => {
          if (inv.status === 'pending') return;
          const folderName = (inv.folder as any)?.name || 'Folder';
          activitiesArray.push({
            id: `folder-inv-${inv.id}`,
            type: 'folder_invite',
            message: inv.status === 'accepted'
                ? `Dołączono do folderu: ${folderName}`
                : `Odrzucono zaproszenie: ${folderName}`,
            timestamp: new Date(inv.created_at),
            status: inv.status === 'accepted' ? 'success' : 'info',
            metadata: { inviteId: inv.id, table: 'folder_shares', folderName }
          });
        });
      }

      // Pending AI proposals (calendar events, notes, tasks) from chat history
      const { data: chatMessages } = await p_chatMessages;

      if (chatMessages) {
        chatMessages.forEach(msg => {
          const meta = msg.metadata as any;
          const proposals = meta?.proposals as any[];
          const proposalStatuses = meta?.proposals_status as Record<number, string> | undefined;
          
          if (!proposals || !Array.isArray(proposals)) return;
          
          proposals.forEach((proposal: any, idx: number) => {
            const status = proposalStatuses?.[idx];
            if (status === 'confirmed' || status === 'rejected') return; // skip resolved
            
            let proposalMessage = '';
            const type = proposal.type;
            if (type === 'calendar_event' || type === 'event') {
              proposalMessage = `📅 Propozycja: ${proposal.title || 'Wydarzenie'}`;
            } else if (type === 'note' || type === 'note_create') {
              proposalMessage = `📝 Propozycja: ${proposal.title || 'Notatka'}`;
            } else if (type === 'note_update' || type === 'note_append') {
              proposalMessage = `✏️ Edycja notatki: ${proposal.title || proposal.note_title || 'Notatka'}`;
            } else if (type === 'task' || type === 'task_create') {
              proposalMessage = `✅ Propozycja zadania: ${proposal.title || 'Zadanie'}`;
            } else if (type === 'event_delete') {
              proposalMessage = `🗑️ Usunięcie: ${proposal.title || 'Wydarzenie'}`;
            } else if (type === 'event_update') {
              proposalMessage = `✏️ Zmiana: ${proposal.title || 'Wydarzenie'}`;
            } else {
              proposalMessage = `🤖 Propozycja AI: ${proposal.title || type || 'Akcja'}`;
            }
            
            activitiesArray.push({
              id: `proposal-${msg.id}-${idx}`,
              type: 'ai_proposal',
              message: proposalMessage,
              timestamp: new Date(msg.created_at),
              status: 'pending',
              metadata: { conversationId: msg.conversation_id }
            });
          });
        });
      }

      /*
        ══════════════════════════════════════════════════════════════════
         WŁASNE ŚLADY UŻYTKOWNIKA — dodane 03.08.2026
        ══════════════════════════════════════════════════════════════════
        Michał: „aktywność live dał po rejestracji już od razu, aby użytkownik
        miał swoje logi — jak założenie konta, zrobienie tego i tego, potem
        że wygenerował to i to".

        Do tej pory dziennik zbierał niemal wyłącznie rzeczy, które zrobił
        KTOŚ INNY albo system: zaproszenia, udostępnienia, przydziały Byte,
        osiągnięcia. Świeżo założone konto widziało więc pustą kartę „Brak
        aktywności" — czyli człowiek, który właśnie się zarejestrował
        i wygenerował trzy obrazy, dostawał komunikat, że nic nie robił.

        Teraz dziennik zaczyna się od założenia konta i notuje to, co
        użytkownik SAM stworzył. Każde źródło to jedno zapytanie po własnych
        wierszach (RLS i tak zawęża je do właściciela) — świadomie bez
        `count`, bo interesuje nas oś czasu, nie statystyka.
      */
      const wlasne: Array<{
        tabela: string; kolumnaCzasu: string; kolumnaTytulu: string | null; opis: (t: string | null) => string;
      }> = [
        { tabela: 'chat_conversations', kolumnaCzasu: 'created_at', kolumnaTytulu: 'title',
          opis: (x) => `💬 Rozmowa: ${x || 'bez tytułu'}` },
        { tabela: 'photo_studio_generations', kolumnaCzasu: 'created_at', kolumnaTytulu: 'prompt',
          opis: (x) => `🖼️ Wygenerowany obraz${x ? `: ${x.slice(0, 60)}` : ''}` },
        { tabela: 'studio_video_generations', kolumnaCzasu: 'created_at', kolumnaTytulu: 'prompt',
          opis: (x) => `🎬 Wygenerowany film${x ? `: ${x.slice(0, 60)}` : ''}` },
        { tabela: 'chat_artifacts', kolumnaCzasu: 'created_at', kolumnaTytulu: 'title',
          opis: (x) => `📄 Dokument: ${x || 'bez tytułu'}` },
        { tabela: 'user_notes', kolumnaCzasu: 'created_at', kolumnaTytulu: 'title',
          opis: (x) => `📝 Notatka: ${x || 'bez tytułu'}` },
        { tabela: 'whiteboards', kolumnaCzasu: 'created_at', kolumnaTytulu: 'title',
          opis: (x) => `🎨 Tablica: ${x || 'bez tytułu'}` },
      ];

      await Promise.all(wlasne.map(async (z) => {
        const kolumny = ['id', z.kolumnaCzasu, z.kolumnaTytulu].filter(Boolean).join(', ');
        // Błąd pojedynczego źródła NIE może wywalić całego dziennika — nowy
        // moduł albo cofnięte uprawnienie zabrałoby wtedy też resztę historii.
        const { data, error } = await supabase
          .from(z.tabela as any)
          .select(kolumny)
          .eq('user_id', user.id)
          .order(z.kolumnaCzasu, { ascending: false })
          .limit(5);
        if (error || !data) return;
        (data as any[]).forEach((w) => {
          activitiesArray.push({
            id: `wlasne-${z.tabela}-${w.id}`,
            type: 'tworczosc',
            message: z.opis(z.kolumnaTytulu ? w[z.kolumnaTytulu] : null),
            timestamp: new Date(w[z.kolumnaCzasu]),
            status: 'success',
          });
        });
      }));

      /* Założenie konta — zawsze najstarszy wpis, więc naturalnie ląduje
         na końcu listy i nie wypycha niczego świeższego. Dla nowego konta
         jest jedynym wpisem i to jest dokładnie ten stan, o który chodziło:
         dziennik ma istnieć od pierwszej minuty. */
      const { data: profil } = await p_profil;
      if (profil?.created_at) {
        activitiesArray.push({
          id: `konto-${user.id}`,
          type: 'konto',
          message: '🎉 Konto założone — witaj w NextByte',
          timestamp: new Date(profil.created_at),
          status: 'success',
        });
      }

      // Sort by timestamp and deduplicate
      const seen = new Set<string>();
      const uniqueActivities = activitiesArray.filter(activity => {
        const key = `${activity.message}-${activity.timestamp.getTime()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      uniqueActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      if (isMountedRef.current) {
        // 20, nie 10: doszły własne ślady użytkownika, a przy 10 pozycjach
        // jeden aktywny dzień wypychał całą wcześniejszą historię.
        setActivities(uniqueActivities.slice(0, 20));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      if (isMountedRef.current) {
        setActivities([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    loadActivities();

    const setupRealtimeSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const channel = supabase
        .channel('activity-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (!isMountedRef.current) return;
            
            const eventId = `notif-${payload.new.id}`;
            if (processedEventsRef.current.has(eventId)) return;
            processedEventsRef.current.add(eventId);

            let activityType: ActivityType = 'notification';
            if (payload.new.type === 'level_up') activityType = 'level';
            else if (payload.new.type === 'achievement') activityType = 'achievement';
            else if (payload.new.type === 'byte_received' || payload.new.type === 'byte_purchase') activityType = 'byte';

            const newActivity: ActivityItem = {
              id: `notif-${payload.new.id}`,
              type: activityType,
              message: payload.new.title,
              timestamp: new Date(payload.new.created_at),
              status: 'info'
            };

            setActivities(prev => [newActivity, ...prev].slice(0, 10));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_achievements',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (!isMountedRef.current) return;
            if (!payload.new.completed || !payload.new.completed_at) return;
            
            const eventId = `ach-${payload.new.id}`;
            if (processedEventsRef.current.has(eventId)) return;
            processedEventsRef.current.add(eventId);

            const newActivity: ActivityItem = {
              id: eventId,
              type: 'achievement',
              message: 'Odblokowano nowe osiągnięcie!',
              timestamp: new Date(payload.new.completed_at),
              status: 'success'
            };

            setActivities(prev => [newActivity, ...prev].slice(0, 10));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'company_byte_allocations',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (!isMountedRef.current) return;
            
            const eventId = `byte-${payload.new.id}`;
            if (processedEventsRef.current.has(eventId)) return;
            processedEventsRef.current.add(eventId);

            const newActivity: ActivityItem = {
              id: eventId,
              type: 'byte',
              message: `Otrzymano ${payload.new.amount} Byte`,
              timestamp: new Date(payload.new.created_at),
              status: 'success'
            };

            setActivities(prev => [newActivity, ...prev].slice(0, 10));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'company_tasks',
            filter: `assigned_to=eq.${user.id}`
          },
          (payload) => {
            if (!isMountedRef.current) return;
            
            const eventId = `ctask-${payload.new.id}`;
            if (processedEventsRef.current.has(eventId)) return;
            processedEventsRef.current.add(eventId);

            const newActivity: ActivityItem = {
              id: eventId,
              type: 'company_task',
              message: `Przypisano zadanie: ${payload.new.title}`,
              timestamp: new Date(payload.new.created_at),
              status: 'pending'
            };

            setActivities(prev => [newActivity, ...prev].slice(0, 10));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'company_work_shifts'
          },
          async (payload) => {
            if (!isMountedRef.current) return;
            
            // Check if this shift is assigned to the current user's member ID
            const { data: membership } = await supabase
              .from('company_members')
              .select('id')
              .eq('user_id', user.id)
              .eq('id', payload.new.assigned_member_id)
              .maybeSingle();

            if (!membership) return;

            const eventId = `shift-${payload.new.id}`;
            if (processedEventsRef.current.has(eventId)) return;
            processedEventsRef.current.add(eventId);

            const shiftDate = new Date(payload.new.shift_start).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
            const newActivity: ActivityItem = {
              id: eventId,
              type: 'work_shift',
              message: `Nowa zmiana: ${payload.new.title} (${shiftDate})`,
              timestamp: new Date(payload.new.created_at || payload.new.shift_start),
              status: 'info'
            };

            setActivities(prev => [newActivity, ...prev].slice(0, 10));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'shared_calendar_members',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (!isMountedRef.current || payload.new.status !== 'pending') return;
            const eventId = `cal-inv-${payload.new.id}`;
            if (processedEventsRef.current.has(eventId)) return;
            processedEventsRef.current.add(eventId);
            loadActivities();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'note_shares',
            filter: `shared_with_id=eq.${user.id}`
          },
          (payload) => {
            if (!isMountedRef.current || payload.new.status !== 'pending') return;
            const eventId = `note-inv-${payload.new.id}`;
            if (processedEventsRef.current.has(eventId)) return;
            processedEventsRef.current.add(eventId);
            loadActivities();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'folder_shares',
            filter: `shared_with_id=eq.${user.id}`
          },
          (payload) => {
            if (!isMountedRef.current || payload.new.status !== 'pending') return;
            const eventId = `folder-inv-${payload.new.id}`;
            if (processedEventsRef.current.has(eventId)) return;
            processedEventsRef.current.add(eventId);
            loadActivities();
          }
        )
        .subscribe();

      return channel;
    };

    let channelRef: any = null;
    setupRealtimeSubscriptions().then(channel => {
      channelRef = channel;
    });

    return () => {
      isMountedRef.current = false;
      processedEventsRef.current.clear();
      if (channelRef) {
        supabase.removeChannel(channelRef);
      }
    };
  }, []);

  return {
    activities,
    setActivities,
    isLoading,
    refreshActivities: loadActivities
  };
};