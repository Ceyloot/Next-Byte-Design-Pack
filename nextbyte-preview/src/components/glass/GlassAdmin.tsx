import React from 'react'
import {
  Search, X, SlidersHorizontal, Trash2, Download, Eye, EyeOff, Copy, Check,
  AlertTriangle, Bell, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

// ── 41. FilterBar ──────────────────────────────────────────────────

export interface FilterChip {
  id: string
  label: string
  value: string
}

export function GlassFilterBar({
  query,
  onQueryChange,
  chips = [],
  onRemoveChip,
  onClearAll,
  placeholder = 'Szukaj…',
  actions,
  className,
}: {
  query: string
  onQueryChange: (v: string) => void
  /** Aktywne filtry jako zdejmowalne pigułki. */
  chips?: FilterChip[]
  onRemoveChip?: (id: string) => void
  onClearAll?: () => void
  placeholder?: string
  actions?: React.ReactNode
  className?: string
}) {
  const { isGlass } = useGlass()
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <div className={cn(
          'flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl px-3 transition-all focus-within:ring-2 focus-within:ring-primary/25',
          isGlass ? 'nb-szklo nb-szklo-plynne' : 'border border-border bg-input',
        )}>
          <Search className="h-3.5 w-3.5 shrink-0 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-foreground/35"
          />
          {query && (
            <button onClick={() => onQueryChange('')} className="shrink-0 text-foreground/30 hover:text-foreground" aria-label="Wyczyść">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <button className={cn(
          'flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-foreground/65 transition-colors hover:text-foreground',
          isGlass ? 'nb-szklo' : 'border border-border bg-card',
        )}>
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filtry
        </button>
        {actions}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => (
            <span
              key={c.id}
              className={cn(
                'inline-flex items-center gap-1 rounded-full py-0.5 pl-2 pr-1 text-[10px] font-medium',
                isGlass ? 'bg-primary/18 text-primary' : 'bg-primary/12 text-primary',
              )}
            >
              <span className="opacity-60">{c.label}:</span>{c.value}
              <button
                onClick={() => onRemoveChip?.(c.id)}
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-primary/25"
                aria-label={`Usuń filtr ${c.label}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          {onClearAll && (
            <button onClick={onClearAll} className="ml-1 text-[10px] font-medium text-foreground/40 hover:text-foreground">
              Wyczyść wszystko
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── 42. BulkActionBar ──────────────────────────────────────────────

export function GlassBulkActionBar({
  count,
  onClear,
  actions,
  /** Przykleja pasek do dołu ekranu, gdy coś jest zaznaczone. */
  floating = false,
  className,
}: {
  count: number
  onClear?: () => void
  actions?: React.ReactNode
  floating?: boolean
  className?: string
}) {
  const { isGlass } = useGlass()
  if (count === 0) return null

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-2xl px-4 py-2.5',
      isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card shadow-lg',
      floating && 'fixed bottom-5 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-3 duration-200',
      className,
    )}>
      <span className={cn(
        'flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums',
        isGlass ? 'bg-primary/25 text-primary' : 'bg-primary text-primary-foreground',
      )}>
        {count}
      </span>
      <span className="text-xs text-foreground/65">zaznaczono</span>

      <div className="ml-2 flex items-center gap-1.5">
        {actions ?? (
          <>
            <button className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-foreground/65 transition-colors hover:bg-foreground/[0.07] hover:text-foreground">
              <Download className="h-3 w-3" /> Eksportuj
            </button>
            <button className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/10">
              <Trash2 className="h-3 w-3" /> Usuń
            </button>
          </>
        )}
      </div>

      {onClear && (
        <button onClick={onClear} className="ml-auto shrink-0 text-foreground/35 transition-colors hover:text-foreground" aria-label="Odznacz wszystko">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

// ── 43. SettingsSection ────────────────────────────────────────────

export function GlassSettingsSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  const { isGlass } = useGlass()
  return (
    <div className={cn(
      'grid gap-4 rounded-2xl p-4 sm:grid-cols-[1fr_1.4fr]',
      isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
      className,
    )}>
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description && <p className="mt-1 text-[11px] leading-relaxed text-foreground/50">{description}</p>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

// ── 44. DangerZone ─────────────────────────────────────────────────

export function GlassDangerZone({
  title = 'Strefa niebezpieczna',
  items,
  className,
}: {
  title?: string
  items: { label: string; description: string; action: string; onAction?: () => void }[]
  className?: string
}) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-destructive/30', className)}>
      <div className="flex items-center gap-2 border-b border-destructive/25 bg-destructive/[0.07] px-4 py-2.5">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
        <h4 className="text-xs font-bold uppercase tracking-wide text-destructive">{title}</h4>
      </div>
      <div className="divide-y divide-destructive/15">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-foreground">{it.label}</p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-foreground/50">{it.description}</p>
            </div>
            <button
              onClick={it.onAction}
              className="shrink-0 rounded-lg border border-destructive/40 px-3 py-1.5 text-[11px] font-bold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              {it.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 45. ApiKeyDisplay ──────────────────────────────────────────────

export function GlassApiKey({
  label,
  value,
  createdAt,
  onRegenerate,
  className,
}: {
  label: string
  value: string
  createdAt?: string
  onRegenerate?: () => void
  className?: string
}) {
  const { isGlass } = useGlass()
  const [visible, setVisible] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  // Maska pokazuje prefiks i 4 ostatnie znaki — wystarcza do rozpoznania
  // klucza, nie ujawniając sekretu na ekranie współdzielonym.
  const masked = React.useMemo(() => {
    if (value.length <= 12) return '•'.repeat(value.length)
    const head = value.slice(0, 7)
    const tail = value.slice(-4)
    return `${head}${'•'.repeat(Math.max(8, value.length - 11))}${tail}`
  }, [value])

  function copy() {
    navigator.clipboard?.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className={cn(
      'flex flex-col gap-2 rounded-2xl p-3',
      isGlass ? 'nb-szklo nb-szklo-plynne' : 'border border-border bg-card',
      className,
    )}>
      <div className="flex items-baseline gap-2">
        <p className="text-[12px] font-semibold text-foreground">{label}</p>
        {createdAt && <p className="text-[10px] text-foreground/35">utworzony {createdAt}</p>}
      </div>

      <div className="flex items-center gap-1.5">
        <code className={cn(
          'min-w-0 flex-1 truncate rounded-lg px-2.5 py-1.5 font-mono text-[11px]',
          isGlass ? 'bg-foreground/[0.06] text-foreground/75' : 'bg-muted/60 text-foreground/75',
        )}>
          {visible ? value : masked}
        </code>
        <button
          onClick={() => setVisible((v) => !v)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/35 transition-colors hover:bg-foreground/[0.07] hover:text-foreground"
          aria-label={visible ? 'Ukryj klucz' : 'Pokaż klucz'}
        >
          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={copy}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/35 transition-colors hover:bg-foreground/[0.07] hover:text-foreground"
          aria-label="Kopiuj klucz"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/35 transition-colors hover:bg-foreground/[0.07] hover:text-amber-400"
            aria-label="Wygeneruj ponownie"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── 46. UsageBar ───────────────────────────────────────────────────

export function GlassUsageBar({
  label,
  used,
  total,
  unit = '',
  /** Próg, powyżej którego pasek zmienia kolor na ostrzegawczy. */
  warnAt = 80,
  className,
}: {
  label: string
  used: number
  total: number
  unit?: string
  warnAt?: number
  className?: string
}) {
  const { isGlass } = useGlass()
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0
  const over = pct >= 100
  const warn = pct >= warnAt

  const color = over ? 'hsl(0 72% 58%)' : warn ? 'hsl(38 92% 50%)' : 'hsl(var(--primary))'

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium text-foreground/70">{label}</span>
        <span className="font-mono text-[10px] tabular-nums text-foreground/45">
          {used.toLocaleString('pl-PL')} / {total.toLocaleString('pl-PL')} {unit}
          <span className="ml-1.5 font-bold" style={{ color }}>{Math.round(pct)}%</span>
        </span>
      </div>
      <div className={cn('h-1.5 w-full overflow-hidden rounded-full', isGlass ? 'bg-foreground/10' : 'bg-muted')}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color, boxShadow: isGlass ? `0 0 8px ${color}` : undefined }}
        />
      </div>
    </div>
  )
}

// ── 47. NotificationCenter ─────────────────────────────────────────

export interface NotificationItem {
  id: string
  title: string
  description?: string
  time: string
  read?: boolean
  intent?: 'info' | 'success' | 'warning' | 'error'
  icon?: React.ComponentType<{ className?: string }>
}

const INTENT_DOT = {
  info:    'bg-sky-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error:   'bg-red-400',
}

export function GlassNotificationCenter({
  items,
  onMarkAllRead,
  onSelect,
  maxHeight = 340,
  className,
}: {
  items: NotificationItem[]
  onMarkAllRead?: () => void
  onSelect?: (n: NotificationItem) => void
  maxHeight?: number
  className?: string
}) {
  const { isGlass } = useGlass()
  const unread = items.filter((i) => !i.read).length

  return (
    <div className={cn(
      'flex w-full max-w-sm flex-col overflow-hidden rounded-2xl',
      isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card shadow-xl',
      className,
    )}>
      <div className={cn(
        'flex items-center gap-2 px-3.5 py-2.5',
        isGlass ? 'border-b border-foreground/[0.08]' : 'border-b border-border',
      )}>
        <Bell className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">Powiadomienia</span>
        {unread > 0 && (
          <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary tabular-nums">
            {unread} nowe
          </span>
        )}
        {onMarkAllRead && unread > 0 && (
          <button onClick={onMarkAllRead} className="ml-auto text-[10px] font-medium text-foreground/40 transition-colors hover:text-primary">
            Oznacz jako przeczytane
          </button>
        )}
      </div>

      <div className="overflow-y-auto" style={{ maxHeight }}>
        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-foreground/35">Brak powiadomień</p>
        ) : items.map((n) => {
          const Icon = n.icon
          return (
            <button
              key={n.id}
              onClick={() => onSelect?.(n)}
              className={cn(
                'flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-foreground/[0.04]',
                isGlass ? 'border-b border-foreground/[0.05]' : 'border-b border-border/50',
                !n.read && (isGlass ? 'bg-primary/[0.05]' : 'bg-primary/[0.03]'),
              )}
            >
              <span className="relative mt-0.5 shrink-0">
                {Icon
                  ? <Icon className="h-3.5 w-3.5 text-foreground/50" />
                  : <span className={cn('block h-2 w-2 rounded-full', INTENT_DOT[n.intent ?? 'info'])} />}
                {!n.read && Icon && <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-primary" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('text-[12px] leading-tight', n.read ? 'text-foreground/65' : 'font-semibold text-foreground')}>
                  {n.title}
                </p>
                {n.description && <p className="mt-0.5 text-[10.5px] leading-relaxed text-foreground/45">{n.description}</p>}
                <p className="mt-1 text-[9.5px] text-foreground/30">{n.time}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
