import * as React from 'react';
import { cn } from '@/lib/utils';

/* ── Typy ──────────────────────────────────────────────────── */
export type ActivityStatus = 'done' | 'in-progress' | 'pending' | 'error';

export interface ActivityItem {
  id?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  date?: string;
  status?: ActivityStatus;
}

/* ── Kolory statusów ───────────────────────────────────────── */
const STATUS_DOT: Record<ActivityStatus, string> = {
  done:        'bg-primary',
  'in-progress': 'bg-accent-foreground animate-pulse',
  pending:     'bg-muted-foreground',
  error:       'bg-destructive',
};

const STATUS_LABEL: Record<ActivityStatus, string> = {
  done:         'Zakończono',
  'in-progress': 'W toku',
  pending:       'Oczekuje',
  error:         'Błąd',
};

/* ── ActivityFeedItem ──────────────────────────────────────── */
export interface ActivityFeedItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: ActivityItem;
  last?: boolean;
}

const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({ item, last, className, ...props }) => (
  <div className={cn('flex gap-3', !last && 'pb-4', className)} {...props}>
    {/* Icon column */}
    <div className="flex flex-col items-center">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
        {item.icon ?? <span className="h-2 w-2 rounded-full bg-muted-foreground" />}
      </div>
      {!last && <div className="mt-1 w-px flex-1 bg-border" />}
    </div>

    {/* Content */}
    <div className="min-w-0 flex-1 pb-1">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
        {item.status && (
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
            <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[item.status])} />
            {STATUS_LABEL[item.status]}
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
      )}
      {item.date && (
        <p className="mt-1 text-[10px] text-muted-foreground">{item.date}</p>
      )}
    </div>
  </div>
);

/* ── ActivityFeed ──────────────────────────────────────────── */
export interface ActivityFeedProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ActivityItem[];
  title?: string;
  live?: boolean;
  emptyText?: string;
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items,
  title,
  live = false,
  emptyText = 'Brak aktywności',
  maxItems,
  className,
  ...props
}) => {
  const shown = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div className={cn('rounded-2xl border border-border bg-card', className)} {...props}>
      {title && (
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="font-heading text-sm font-semibold text-foreground">{title}</span>
          {live && (
            <span className="inline-flex items-center gap-1.5 text-xs text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Live
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        {shown.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          shown.map((item, i) => (
            <ActivityFeedItem
              key={item.id ?? i}
              item={item}
              last={i === shown.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
};

export { ActivityFeed, ActivityFeedItem };
