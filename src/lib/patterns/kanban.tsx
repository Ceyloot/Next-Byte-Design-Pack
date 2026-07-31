import { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface KanbanCard {
  id: string;
  title: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  assignee?: string;
  description?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  icon?: ReactNode;
  cards: KanbanCard[];
  color?: string;
  emptyLabel?: string;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardMove?: (cardId: string, fromCol: string, toCol: string) => void;
  onAddCard?: (colId: string) => void;
  glass?: boolean;
  className?: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  low:    'bg-muted text-muted-foreground border-border/40',
  medium: 'bg-primary/10 text-primary border-primary/20',
  high:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
};
const PRIORITY_LABELS: Record<string, string> = {
  low: 'Niski', medium: 'Średni', high: 'Wysoki', urgent: 'Pilny',
};

function KCard({ card, glass }: { card: KanbanCard; glass?: boolean }) {
  return (
    <div className={cn(
      'rounded-xl border border-border/50 p-3 cursor-grab active:cursor-grabbing',
      glass ? 'nb-glass-static' : 'bg-card',
      'hover:border-border hover:shadow-uniesiona transition-all duration-150 group',
    )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs font-semibold text-foreground leading-snug">{card.title}</p>
        <button
          type="button"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {card.description && (
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed mb-2 line-clamp-2">{card.description}</p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        {card.priority && (
          <span className={cn(
            'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border',
            PRIORITY_COLORS[card.priority],
          )}>
            {PRIORITY_LABELS[card.priority]}
          </span>
        )}
        {card.tags?.map(tag => (
          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border/30">
            {tag}
          </span>
        ))}
        {card.assignee && (
          <div className="ml-auto h-4 w-4 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[8px] font-bold text-primary">
            {card.assignee.slice(0,1).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ columns, onAddCard, glass, className }: KanbanBoardProps) {
  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-2', className)}>
      {columns.map(col => (
        <div key={col.id} className="shrink-0 w-64 flex flex-col gap-2">
          {/* Column header */}
          <div className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-xl',
            glass && 'nb-glass-static',
          )}>
            {col.icon && <span className="text-muted-foreground">{col.icon}</span>}
            <span className="text-xs font-semibold text-foreground flex-1">{col.title}</span>
            <span className={cn(
              'text-[10px] font-bold tabular-nums rounded-full w-4 h-4 flex items-center justify-center',
              col.cards.length > 0 ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground/50',
            )}>
              {col.cards.length}
            </span>
          </div>

          {/* Card list */}
          <div className={cn(
            'flex flex-col gap-2 min-h-24 rounded-xl border border-dashed border-border/40 p-2',
            col.cards.length === 0 && 'items-center justify-center',
          )}>
            {col.cards.length === 0 ? (
              <p className="text-[10px] text-muted-foreground/40 text-center">
                {col.emptyLabel ?? 'Przeciągnij zadanie tutaj'}
              </p>
            ) : (
              col.cards.map(card => <KCard key={card.id} card={card} glass={glass} />)
            )}
          </div>

          {onAddCard && (
            <button
              type="button"
              onClick={() => onAddCard(col.id)}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground px-1 py-0.5 rounded transition-colors"
            >
              <Plus className="h-3 w-3" />
              Dodaj zadanie
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
