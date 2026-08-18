import React from 'react'
import { Plus, MoreHorizontal, MessageSquare, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

// ── 22-24. Kanban: Board / Column / Card ───────────────────────────

export interface KanbanCard {
  id: string
  title: string
  description?: string
  /** Kolorowe pigułki nad tytułem — etykiety kategorii. */
  labels?: { text: string; color: string }[]
  assignee?: string
  comments?: number
  attachments?: number
  priority?: 'low' | 'medium' | 'high'
}

export interface KanbanColumn {
  id: string
  title: string
  cards: KanbanCard[]
  /** Limit WIP — nagłówek zapala się na czerwono po przekroczeniu. */
  limit?: number
  accent?: string
}

const PRIORITY = {
  low:    { label: 'Niski',  cls: 'bg-foreground/[0.08] text-foreground/50' },
  medium: { label: 'Średni', cls: 'bg-amber-500/15 text-amber-400' },
  high:   { label: 'Wysoki', cls: 'bg-red-500/15 text-red-400' },
}

export function GlassKanbanCard({
  card,
  dragging,
  onDragStart,
  onDragEnd,
  className,
}: {
  card: KanbanCard
  dragging?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  className?: string
}) {
  const { isGlass } = useGlass()
  const p = card.priority ? PRIORITY[card.priority] : null

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'cursor-grab rounded-xl p-2.5 transition-all active:cursor-grabbing',
        isGlass ? 'nb-szklo' : 'border border-border bg-card',
        dragging ? 'opacity-40' : 'hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      {card.labels && card.labels.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {card.labels.map((l, i) => (
            <span
              key={i}
              className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ background: `color-mix(in srgb, ${l.color} 18%, transparent)`, color: l.color }}
            >
              {l.text}
            </span>
          ))}
        </div>
      )}

      <p className="text-[12px] font-medium leading-snug text-foreground">{card.title}</p>
      {card.description && (
        <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-foreground/45">{card.description}</p>
      )}

      {(p || card.comments || card.attachments || card.assignee) && (
        <div className="mt-2 flex items-center gap-2">
          {p && <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold', p.cls)}>{p.label}</span>}
          {!!card.comments && (
            <span className="flex items-center gap-0.5 text-[10px] text-foreground/35">
              <MessageSquare className="h-2.5 w-2.5" />{card.comments}
            </span>
          )}
          {!!card.attachments && (
            <span className="flex items-center gap-0.5 text-[10px] text-foreground/35">
              <Paperclip className="h-2.5 w-2.5" />{card.attachments}
            </span>
          )}
          {card.assignee && (
            <span className={cn(
              'ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold',
              isGlass ? 'bg-primary/20 text-primary' : 'bg-primary/15 text-primary',
            )}>
              {card.assignee}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function GlassKanbanColumn({
  column,
  children,
  onAdd,
  isDropTarget,
  ...dropProps
}: {
  column: KanbanColumn
  children?: React.ReactNode
  onAdd?: () => void
  isDropTarget?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  const { isGlass } = useGlass()
  const over = column.limit !== undefined && column.cards.length > column.limit

  return (
    <div
      {...dropProps}
      className={cn(
        'flex w-64 shrink-0 flex-col gap-2 rounded-2xl p-2.5 transition-colors',
        isGlass ? 'nb-szklo nb-szklo-plynne' : 'border border-border bg-card/60',
        isDropTarget && 'ring-2 ring-primary/40',
      )}
    >
      <div className="flex items-center gap-2 px-1">
        {column.accent && (
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: column.accent }} />
        )}
        <span className="text-[11px] font-bold uppercase tracking-wide text-foreground/70">{column.title}</span>
        <span className={cn(
          'rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold tabular-nums',
          over ? 'bg-red-500/15 text-red-400' : 'bg-foreground/[0.07] text-foreground/40',
        )}>
          {column.cards.length}{column.limit !== undefined && `/${column.limit}`}
        </span>
        <button className="ml-auto flex h-5 w-5 items-center justify-center rounded-md text-foreground/30 hover:bg-foreground/[0.07] hover:text-foreground">
          <MoreHorizontal className="h-3 w-3" />
        </button>
      </div>

      <div className="flex min-h-[60px] flex-col gap-2">{children}</div>

      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-foreground/12 py-1.5 text-[11px] font-medium text-foreground/35 transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Plus className="h-3 w-3" /> Dodaj kartę
        </button>
      )}
    </div>
  )
}

export function GlassKanbanBoard({
  columns,
  onChange,
  onAddCard,
  className,
}: {
  columns: KanbanColumn[]
  /** Wywoływane po przeniesieniu karty — zwraca cały nowy układ kolumn. */
  onChange?: (columns: KanbanColumn[]) => void
  onAddCard?: (columnId: string) => void
  className?: string
}) {
  const [drag, setDrag] = React.useState<{ cardId: string; fromCol: string } | null>(null)
  const [overCol, setOverCol] = React.useState<string | null>(null)

  function drop(toCol: string) {
    if (!drag || drag.fromCol === toCol) { setDrag(null); setOverCol(null); return }
    const card = columns.find((c) => c.id === drag.fromCol)?.cards.find((c) => c.id === drag.cardId)
    if (!card) { setDrag(null); setOverCol(null); return }

    onChange?.(columns.map((col) => {
      if (col.id === drag.fromCol) return { ...col, cards: col.cards.filter((c) => c.id !== drag.cardId) }
      if (col.id === toCol) return { ...col, cards: [...col.cards, card] }
      return col
    }))
    setDrag(null)
    setOverCol(null)
  }

  return (
    <div className={cn('flex gap-3 overflow-x-auto pb-2', className)}>
      {columns.map((col) => (
        <GlassKanbanColumn
          key={col.id}
          column={col}
          isDropTarget={overCol === col.id && drag?.fromCol !== col.id}
          onAdd={onAddCard ? () => onAddCard(col.id) : undefined}
          onDragOver={(e) => { e.preventDefault(); setOverCol(col.id) }}
          onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
          onDrop={(e) => { e.preventDefault(); drop(col.id) }}
        >
          {col.cards.map((card) => (
            <GlassKanbanCard
              key={card.id}
              card={card}
              dragging={drag?.cardId === card.id}
              onDragStart={() => setDrag({ cardId: card.id, fromCol: col.id })}
              onDragEnd={() => { setDrag(null); setOverCol(null) }}
            />
          ))}
        </GlassKanbanColumn>
      ))}
    </div>
  )
}
