import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NotificationSource, UnifiedNotification } from './useUnifiedNotifications';

const TABLE_BY_SOURCE: Partial<Record<NotificationSource, string>> = {
  note_share: 'note_shares',
  folder_share: 'folder_shares',
  whiteboard_share: 'whiteboard_shares',
  shared_calendar: 'shared_calendar_members',
};

export type ResolveDecision = 'accept' | 'reject';

export const ACTIONABLE_SOURCES: NotificationSource[] = [
  'note_share',
  'folder_share',
  'whiteboard_share',
  'shared_calendar',
  'event_invitation',
];

export function isActionable(n: UnifiedNotification) {
  if (!ACTIONABLE_SOURCES.includes(n.source)) return false;
  // Only pending invitations are actionable; resolved ones become history-only
  return !n.status || n.status === 'pending' || n.status === 'invited';
}

export function useResolveNotification() {
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const resolve = useCallback(
    async (n: UnifiedNotification, decision: ResolveDecision) => {
      setBusyId(n.id);
      try {
        if (n.source === 'event_invitation') {
          const status = decision === 'accept' ? 'accepted' : 'declined';
          const { error } = await supabase
            .from('event_invitations')
            .update({ status })
            .eq('id', n.sourceId);
          if (error) throw error;
        } else {
          const table = TABLE_BY_SOURCE[n.source];
          if (!table) throw new Error('Nieobsługiwany typ powiadomienia');
          const status = decision === 'accept' ? 'accepted' : 'rejected';
          const { error } = await (supabase as any)
            .from(table)
            .update({ status })
            .eq('id', n.sourceId);
          if (error) throw error;
        }

        toast.success(decision === 'accept' ? 'Zaakceptowano' : 'Odrzucono');
        qc.invalidateQueries({ queryKey: ['unified-notifications'] });
        qc.invalidateQueries({ queryKey: ['pending-dashboard-actions'] });
        qc.invalidateQueries({ queryKey: ['note-shares'] });
        qc.invalidateQueries({ queryKey: ['folder-shares'] });
        qc.invalidateQueries({ queryKey: ['shared-calendars'] });
      } catch (e: any) {
        toast.error(e?.message || 'Nie udało się przetworzyć');
      } finally {
        setBusyId(null);
      }
    },
    [qc]
  );

  return { resolve, busyId };
}
