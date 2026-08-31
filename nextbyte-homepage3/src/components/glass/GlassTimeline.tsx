import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

export type TimelineStatus = 'done' | 'active' | 'pending' | 'error'

export interface TimelineEvent {
  title: string
  description?: string
  time?: string
  status?: TimelineStatus
  /** Ikona dostaje kolor przez `style`, więc typ musi go dopuszczać. */
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  /** Nadpisuje kolor markera i łącznika (np. kolor kategorii). */
  color?: string
  meta?: React.ReactNode
}

export interface GlassTimelineProps {
  events: TimelineEvent[]
  orientation?: 'vertical' | 'horizontal'
  /** Węższe odstępy — do paneli bocznych. */
  compact?: boolean
  className?: string
}

const STATUS_COLOR: Record<TimelineStatus, string> = {
  done:    'hsl(160 60% 45%)',
  active:  'hsl(var(--primary))',
  pending: 'hsl(var(--muted-foreground))',
  error:   'hsl(0 72% 58%)',
}

export function GlassTimeline({
  events,
  orientation = 'vertical',
  compact = false,
  className,
}: GlassTimelineProps) {
  const { isGlass } = useGlass()

  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex w-full items-start overflow-x-auto pb-2', className)}>
        {events.map((ev, i) => {
          const color = ev.color ?? STATUS_COLOR[ev.status ?? 'pending']
          const Icon = ev.icon
          const last = i === events.length - 1
          return (
            <React.Fragment key={i}>
              <div className="flex min-w-[110px] flex-col items-center px-1 text-center">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${color} 22%, transparent)`,
                    boxShadow: isGlass ? `0 0 10px color-mix(in srgb, ${color} 40%, transparent)` : undefined,
                  }}
                >
                  {Icon
                    ? <Icon className="h-3.5 w-3.5" style={{ color }} />
                    : <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
                </div>
                {ev.time && <span className="mt-1.5 font-mono text-[9px] text-foreground/35 tabular-nums">{ev.time}</span>}
                <p className="mt-0.5 text-[11px] font-semibold leading-tight text-foreground/85">{ev.title}</p>
                {ev.description && <p className="mt-0.5 text-[10px] leading-snug text-foreground/45">{ev.description}</p>}
              </div>
              {!last && (
                <div
                  className="mt-3.5 h-0.5 min-w-[24px] flex-1"
                  style={{ background: `color-mix(in srgb, ${color} 35%, transparent)` }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {events.map((ev, i) => {
        const color = ev.color ?? STATUS_COLOR[ev.status ?? 'pending']
        const Icon = ev.icon
        const last = i === events.length - 1

        return (
          <div key={i} className="flex gap-3">
            {/* Kolumna markera — łącznik jest rodzeństwem kropki, więc
                rozciąga się na pełną wysokość treści obok. */}
            <div className="flex flex-col items-center">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `color-mix(in srgb, ${color} 20%, transparent)`,
                  boxShadow: isGlass && ev.status === 'active'
                    ? `0 0 12px color-mix(in srgb, ${color} 45%, transparent)`
                    : undefined,
                }}
              >
                {Icon
                  ? <Icon className="h-3.5 w-3.5" style={{ color }} />
                  : <span
                      className={cn('rounded-full', ev.status === 'active' ? 'h-2.5 w-2.5 animate-pulse' : 'h-2 w-2')}
                      style={{ background: color }}
                    />}
              </div>
              {!last && (
                <div
                  className={cn('w-0.5 flex-1', compact ? 'min-h-[16px]' : 'min-h-[26px]')}
                  style={{ background: `color-mix(in srgb, ${color} 25%, transparent)` }}
                />
              )}
            </div>

            <div className={cn('min-w-0 flex-1', last ? 'pb-0' : compact ? 'pb-3' : 'pb-5')}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[13px] font-semibold leading-tight text-foreground">{ev.title}</p>
                {ev.time && <span className="shrink-0 font-mono text-[10px] text-foreground/35 tabular-nums">{ev.time}</span>}
              </div>
              {ev.description && (
                <p className="mt-1 text-[11px] leading-relaxed text-foreground/50">{ev.description}</p>
              )}
              {ev.meta && <div className="mt-1.5">{ev.meta}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Kanał aktywności ───────────────────────────────────────────────

export interface FeedItem {
  actor: string
  action: string
  target?: string
  time: string
  initials?: string
  icon?: React.ComponentType<{ className?: string }>
  meta?: React.ReactNode
}

export function GlassActivityFeed({
  items,
  className,
}: {
  items: FeedItem[]
  className?: string
}) {
  const { isGlass } = useGlass()
  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((it, i) => {
        const Icon = it.icon
        const fallback = it.initials ?? it.actor.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
        return (
          <div
            key={i}
            className={cn(
              'flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-foreground/[0.03]',
              i !== items.length - 1 && (isGlass ? 'border-b border-foreground/[0.05]' : 'border-b border-border/50'),
            )}
          >
            <div className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
              isGlass ? 'nb-szklo text-foreground/70' : 'bg-muted text-foreground/70 border border-border',
            )}>
              {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : fallback}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[12px] leading-snug text-foreground/70">
                <span className="font-semibold text-foreground">{it.actor}</span>
                {' '}{it.action}{' '}
                {it.target && <span className="font-medium text-primary">{it.target}</span>}
              </p>
              <p className="mt-0.5 text-[10px] text-foreground/35">{it.time}</p>
              {it.meta && <div className="mt-1.5">{it.meta}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
