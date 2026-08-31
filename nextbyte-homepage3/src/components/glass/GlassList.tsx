import React from 'react'
import { ChevronRight, Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

// ── 17. List + ListItem ────────────────────────────────────────────

export function GlassList({
  divided = true,
  className,
  children,
}: {
  divided?: boolean
  className?: string
  children: React.ReactNode
}) {
  const { isGlass } = useGlass()
  return (
    <div className={cn(
      'flex flex-col overflow-hidden rounded-2xl',
      isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
      divided && (isGlass ? 'divide-y divide-foreground/[0.06]' : 'divide-y divide-border'),
      className,
    )}>
      {children}
    </div>
  )
}

export interface GlassListItemProps {
  title: React.ReactNode
  description?: React.ReactNode
  /** Lewa strefa — avatar, ikona, miniatura. */
  leading?: React.ReactNode
  /** Prawa strefa — badge, przycisk, wartość. */
  trailing?: React.ReactNode
  /** Strzałka po prawej i hover — sygnalizuje nawigację. */
  chevron?: boolean
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function GlassListItem({
  title, description, leading, trailing, chevron, active, disabled, onClick, className,
}: GlassListItemProps) {
  const clickable = !!onClick && !disabled
  return (
    <div
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick!() } } : undefined}
      className={cn(
        'flex items-center gap-3 px-3.5 py-2.5 transition-colors',
        clickable && 'cursor-pointer hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:bg-foreground/[0.06]',
        active && 'bg-primary/[0.08]',
        disabled && 'pointer-events-none opacity-40',
        className,
      )}
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-[13px] font-medium leading-tight', active ? 'text-primary' : 'text-foreground')}>
          {title}
        </p>
        {description && <p className="mt-0.5 truncate text-[11px] text-foreground/45">{description}</p>}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
      {chevron && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-foreground/25" />}
    </div>
  )
}

// ── 18. Ordered / Unordered / Description list ─────────────────────

export function GlassBulletList({
  items,
  ordered = false,
  /** Ptaszek zamiast kropki — do list korzyści. */
  check = false,
  className,
}: {
  items: React.ReactNode[]
  ordered?: boolean
  check?: boolean
  className?: string
}) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag className={cn('flex flex-col gap-2', className)}>
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-foreground/75">
          {ordered ? (
            <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[9px] font-bold text-primary">
              {i + 1}
            </span>
          ) : check ? (
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          ) : (
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
          )}
          <span className="min-w-0">{it}</span>
        </li>
      ))}
    </Tag>
  )
}

// ── 19. KeyValue ───────────────────────────────────────────────────

export interface KeyValueRow {
  key: React.ReactNode
  value: React.ReactNode
  /** Wartość monospace + przycisk kopiowania (ID, hash, klucz). */
  mono?: boolean
  copyable?: string
}

export function GlassKeyValue({
  rows,
  /** 'row' — klucz i wartość w jednej linii; 'stack' — pod sobą. */
  layout = 'row',
  className,
}: {
  rows: KeyValueRow[]
  layout?: 'row' | 'stack'
  className?: string
}) {
  const { isGlass } = useGlass()
  const [copied, setCopied] = React.useState<number | null>(null)

  function copy(text: string, i: number) {
    navigator.clipboard?.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied((c) => (c === i ? null : c)), 1600)
  }

  return (
    <dl className={cn(
      'flex flex-col',
      isGlass ? 'divide-y divide-foreground/[0.06]' : 'divide-y divide-border/60',
      className,
    )}>
      {rows.map((r, i) => (
        <div
          key={i}
          className={cn(
            'gap-1 py-2.5',
            layout === 'row' ? 'flex items-baseline justify-between gap-4' : 'flex flex-col',
          )}
        >
          <dt className="shrink-0 text-[11px] font-medium text-foreground/45">{r.key}</dt>
          <dd className={cn(
            'flex min-w-0 items-center gap-1.5 text-[12px] text-foreground',
            r.mono && 'font-mono text-[11px]',
            layout === 'row' && 'justify-end text-right',
          )}>
            <span className="truncate">{r.value}</span>
            {r.copyable && (
              <button
                onClick={() => copy(r.copyable!, i)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-foreground/30 transition-colors hover:bg-foreground/[0.07] hover:text-foreground"
                aria-label="Kopiuj"
              >
                {copied === i ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// ── 20. TagCloud ───────────────────────────────────────────────────

export interface CloudTag {
  label: string
  /** Waga 1–5 steruje rozmiarem i intensywnością koloru. */
  weight?: 1 | 2 | 3 | 4 | 5
  onClick?: () => void
}

const WEIGHT = {
  1: 'text-[10px] opacity-45',
  2: 'text-[11px] opacity-60',
  3: 'text-xs opacity-75',
  4: 'text-sm font-medium opacity-90',
  5: 'text-base font-bold opacity-100',
}

export function GlassTagCloud({ tags, className }: { tags: CloudTag[]; className?: string }) {
  const { isGlass } = useGlass()
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-3 gap-y-2', className)}>
      {tags.map((t, i) => (
        <button
          key={i}
          onClick={t.onClick}
          className={cn(
            'rounded-lg px-1.5 py-0.5 text-primary transition-all hover:bg-primary/10',
            WEIGHT[t.weight ?? 3],
            isGlass && (t.weight ?? 3) >= 4 && 'drop-shadow-[0_0_6px_hsl(var(--primary)/0.35)]',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
