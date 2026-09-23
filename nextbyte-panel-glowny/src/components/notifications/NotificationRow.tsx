import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Bell, Building2, Calendar, Check, ChevronDown, ExternalLink, FileText, Loader2, Mail, PenTool, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationIcon, UnifiedNotification } from '@/hooks/useUnifiedNotifications';
import { isActionable, useResolveNotification } from '@/hooks/useResolveNotification';

const ICON_MAP: Record<NotificationIcon, React.ComponentType<{ className?: string }>> = {
  bell: Bell,
  building: Building2,
  calendar: Calendar,
  note: FileText,
  mail: Mail,
  board: PenTool,
  users: Users,
};

interface NotificationRowProps {
  notification: UnifiedNotification;
  onOpen: () => void;
  onMarkRead: () => void;
  /**
   * Wariant do WĄSKIEJ kolumny (pasek boczny ma ~240 px).
   *
   * Układ domyślny powstał dla popovera i arkusza, gdzie miejsca jest dużo:
   * kwadrat ikony 36 px, tytuł i plakietka statusu w JEDNYM wierszu, przyciski
   * akcji dosunięte do prawej. W pasku bocznym to się rozpada — plakietka
   * „Zaakceptowano" zjada ~90 px, więc na tytuł zostaje tyle, że „Automatyzacja
   * outreach B2B" łamie się na trzy linie, a przyciski schodzą jeden pod drugi.
   *
   * Wariant wąski: mniejsza ikona, plakietka POD tytułem (tytuł dostaje pełną
   * szerokość), przyciski rozciągnięte na równe części wiersza. Zachowanie —
   * rozwijanie, oznaczanie jako przeczytane, akcje — bez zmian.
   */
  kompaktowy?: boolean;
}

export const NotificationRow: React.FC<NotificationRowProps> = ({ notification, onOpen, onMarkRead, kompaktowy = false }) => {
  const Icon = ICON_MAP[notification.icon] ?? Bell;
  const isRead = notification.isRead;
  const [expanded, setExpanded] = useState(false);
  const { resolve, busyId } = useResolveNotification();
  const actionable = isActionable(notification);
  const busy = busyId === notification.id;

  const toggle = () => {
    setExpanded((v) => {
      const next = !v;
      if (next && !isRead) onMarkRead();
      return next;
    });
  };

  return (
    <div
      className={cn(
        'group w-full rounded-xl border transition-all duration-300',
        isRead
          ? 'border-border/20 bg-card/20 opacity-60 grayscale-[20%] hover:opacity-50 hover:grayscale-[40%]'
          : 'border-primary/25 bg-primary/[0.06] hover:bg-primary/10 hover:opacity-80'
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        className={cn(
          'w-full text-left flex items-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-xl',
          kompaktowy ? 'p-2 gap-2' : 'p-3 gap-3'
        )}
      >
        <div
          className={cn(
            'flex-shrink-0 rounded-lg flex items-center justify-center transition-colors',
            kompaktowy ? 'w-7 h-7' : 'w-9 h-9',
            isRead ? 'bg-muted/30 text-muted-foreground' : 'bg-primary/15 text-primary'
          )}
        >
          <Icon className={kompaktowy ? "w-3.5 h-3.5" : "w-4 h-4"} />
        </div>

        <div className="flex-1 min-w-0">
          <div className={cn('flex gap-2', kompaktowy ? 'flex-wrap items-start' : 'items-center')}>
            {/* W wariancie wąskim tytuł ŁAMIE SIĘ na dwie linie zamiast ucinać.
                Ucinanie zostawiało „Udostępniono n…", z czego nie da się poznać,
                czego dotyczy powiadomienie — a to jedyna informacja w wierszu,
                która musi dojść. Dwie linie to sufit: przy trzech lista
                przestaje mieścić drugą pozycję na pierwszym ekranie. */}
            <p className={cn(
              'font-medium',
              kompaktowy ? 'text-[13px] w-full leading-snug line-clamp-2' : 'text-sm truncate',
              isRead ? 'text-muted-foreground' : 'text-foreground',
            )}>
              {notification.title}
            </p>
            {!isRead && (
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
            )}
            {actionable && !isRead && (
              <span className={cn('flex-shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30', !kompaktowy && 'ml-auto')}>
                Akcja
              </span>
            )}
            {(notification.status === 'accepted') && (
              <span className={cn('flex-shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', !kompaktowy && 'ml-auto')}>
                Zaakceptowano
              </span>
            )}
            {(notification.status === 'rejected' || notification.status === 'declined') && (
              <span className={cn('flex-shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/30', !kompaktowy && 'ml-auto')}>
                Odrzucono
              </span>
            )}
          </div>
          {notification.description && (
            <p
              className={cn(
                'text-muted-foreground mt-0.5 transition-all',
                kompaktowy ? 'text-[11px]' : 'text-xs',
                expanded ? 'whitespace-pre-wrap break-words' : 'truncate'
              )}
            >
              {notification.description}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { locale: pl, addSuffix: true })}
          </p>
        </div>

        <ChevronDown
          className={cn(
            'flex-shrink-0 text-muted-foreground/60 transition-transform duration-300 mt-1',
            kompaktowy ? 'w-3.5 h-3.5' : 'w-4 h-4',
            expanded && 'rotate-180 text-foreground'
          )}
        />
      </button>

      {expanded && (
        <div className={cn(
          '-mt-1 flex items-center gap-2',
          kompaktowy ? 'px-2 pb-2 [&>button]:flex-1 [&>button]:justify-center' : 'px-3 pb-3 flex-wrap justify-end'
        )}>
          {actionable && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={(e) => {
                  e.stopPropagation();
                  resolve(notification, 'reject');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                Odrzuć
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={(e) => {
                  e.stopPropagation();
                  resolve(notification, 'accept');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 transition-colors disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Akceptuj
              </button>
            </>
          )}
          {notification.link && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2.5 py-1.5 rounded-md hover:bg-primary/10"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Otwórz
            </button>
          )}
        </div>
      )}
    </div>
  );
};
