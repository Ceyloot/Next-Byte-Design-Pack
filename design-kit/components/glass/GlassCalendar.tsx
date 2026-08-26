import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

const MONTHS = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
const DOW = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

export interface DateRange {
  from: Date | null
  to: Date | null
}

export interface GlassCalendarProps {
  /** 'single' zwraca Date, 'range' zwraca DateRange. */
  mode?: 'single' | 'range'
  value?: Date | DateRange | null
  onChange?: (value: Date | DateRange | null) => void
  /** Miesiąc pokazany przy pierwszym renderze. */
  defaultMonth?: Date
  minDate?: Date
  maxDate?: Date
  /** Kompaktowy widget — mniejsze komórki, np. do sidebaru. */
  compact?: boolean
  className?: string
}

function startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
function sameDay(a: Date | null | undefined, b: Date | null | undefined) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Siatka 6×7 zaczynająca się od poniedziałku — stała wysokość, żeby
 *  przełączanie miesięcy nie przesuwało layoutu pod spodem. */
function buildGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  // getDay(): 0=niedziela. Przesuwamy tak, by poniedziałek był 0.
  const lead = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - lead)
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
}

export function GlassCalendar({
  mode = 'single',
  value,
  onChange,
  defaultMonth,
  minDate,
  maxDate,
  compact = false,
  className,
}: GlassCalendarProps) {
  const { isGlass } = useGlass()

  const initial = defaultMonth
    ?? (value instanceof Date ? value : (value as DateRange | null)?.from)
    ?? new Date()
  const [view, setView] = React.useState(new Date(initial.getFullYear(), initial.getMonth(), 1))
  const [hover, setHover] = React.useState<Date | null>(null)

  const today = startOfDay(new Date())
  const days = buildGrid(view.getFullYear(), view.getMonth())

  const single = mode === 'single' ? (value as Date | null) : null
  const range = mode === 'range' ? (value as DateRange | null) : null

  function disabled(d: Date) {
    if (minDate && d < startOfDay(minDate)) return true
    if (maxDate && d > startOfDay(maxDate)) return true
    return false
  }

  // W trybie range podgląd zakresu podąża za kursorem, dopóki nie
  // wybrano drugiej granicy — bez tego użytkownik klika w ciemno.
  const previewTo = range?.from && !range.to ? hover : null

  function inRange(d: Date) {
    if (mode !== 'range' || !range?.from) return false
    const end = range.to ?? previewTo
    if (!end) return false
    const [lo, hi] = range.from <= end ? [range.from, end] : [end, range.from]
    return d > startOfDay(lo) && d < startOfDay(hi)
  }

  function pick(d: Date) {
    if (disabled(d)) return
    if (mode === 'single') { onChange?.(d); return }
    if (!range?.from || range.to) { onChange?.({ from: d, to: null }); return }
    onChange?.(range.from <= d ? { from: range.from, to: d } : { from: d, to: range.from })
  }

  const cell = compact ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-xs'

  return (
    <div className={cn(
      'inline-flex flex-col gap-2 rounded-2xl p-3',
      isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
      className,
    )}>
      {/* Nagłówek z nawigacją miesięcy */}
      <div className="flex items-center justify-between px-0.5">
        <button
          type="button"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-foreground/45 transition-colors hover:bg-foreground/[0.07] hover:text-foreground"
          aria-label="Poprzedni miesiąc"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className={cn('font-semibold text-foreground', compact ? 'text-[11px]' : 'text-xs')}>
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-foreground/45 transition-colors hover:bg-foreground/[0.07] hover:text-foreground"
          aria-label="Następny miesiąc"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Nagłówki dni tygodnia */}
      <div className="grid grid-cols-7 gap-0.5">
        {DOW.map((d) => (
          <span key={d} className={cn('flex items-center justify-center font-semibold text-foreground/30', cell)}>
            {d}
          </span>
        ))}
      </div>

      {/* Siatka dni */}
      <div className="grid grid-cols-7 gap-0.5" onMouseLeave={() => setHover(null)}>
        {days.map((d, i) => {
          const outside = d.getMonth() !== view.getMonth()
          const isToday = sameDay(d, today)
          const isDisabled = disabled(d)
          const selected = mode === 'single'
            ? sameDay(d, single)
            : sameDay(d, range?.from) || sameDay(d, range?.to)
          const between = inRange(d)

          return (
            <button
              key={i}
              type="button"
              disabled={isDisabled}
              onMouseEnter={() => setHover(d)}
              onClick={() => pick(d)}
              className={cn(
                'flex items-center justify-center rounded-lg font-medium transition-all tabular-nums',
                cell,
                isDisabled && 'cursor-not-allowed opacity-20',
                !isDisabled && !selected && !between && 'hover:bg-foreground/[0.07]',
                outside ? 'text-foreground/25' : 'text-foreground/75',
                between && !selected && (isGlass ? 'bg-primary/12 text-primary' : 'bg-primary/10 text-primary'),
                selected && (isGlass
                  ? 'bg-primary/30 text-primary font-bold shadow-[0_0_10px_hsl(var(--primary)/0.35)]'
                  : 'bg-primary text-primary-foreground font-bold'),
                isToday && !selected && 'ring-1 ring-primary/40 text-primary',
              )}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Pole z rozwijanym kalendarzem ──────────────────────────────────

export interface GlassDatePickerProps {
  mode?: 'single' | 'range'
  value?: Date | DateRange | null
  onChange?: (v: Date | DateRange | null) => void
  placeholder?: string
  className?: string
}

function fmt(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

export function GlassDatePicker({
  mode = 'single',
  value,
  onChange,
  placeholder = 'Wybierz datę',
  className,
}: GlassDatePickerProps) {
  const { isGlass } = useGlass()
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const label = React.useMemo(() => {
    if (mode === 'single') return value instanceof Date ? fmt(value) : null
    const r = value as DateRange | null
    if (!r?.from) return null
    return r.to ? `${fmt(r.from)} — ${fmt(r.to)}` : `${fmt(r.from)} — ...`
  }, [value, mode])

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-10 w-full min-w-[200px] items-center gap-2 rounded-xl px-3 text-sm transition-all',
          isGlass ? 'nb-szklo nb-szklo-plynne' : 'border border-border bg-input',
          open && 'ring-2 ring-primary/30',
        )}
      >
        <CalIcon className="h-4 w-4 shrink-0 text-primary" />
        <span className={cn('flex-1 text-left', label ? 'text-foreground' : 'text-foreground/35')}>
          {label ?? placeholder}
        </span>
        <ChevronRight className={cn('h-3.5 w-3.5 shrink-0 text-foreground/35 transition-transform', open && 'rotate-90')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 animate-in fade-in-0 zoom-in-[0.98] duration-150">
          <GlassCalendar
            mode={mode}
            value={value}
            onChange={(v) => {
              onChange?.(v)
              // Zamykamy dopiero po domknięciu zakresu, inaczej nie da
              // się wskazać drugiej granicy.
              if (mode === 'single' || (v as DateRange)?.to) setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
