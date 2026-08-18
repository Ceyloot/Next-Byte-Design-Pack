import React from 'react'
import { Check, ChevronDown, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

export interface ComboOption {
  value: string
  label: string
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

export interface GlassComboboxProps {
  options: ComboOption[]
  /** string dla trybu pojedynczego, string[] gdy `multiple`. */
  value?: string | string[]
  onChange?: (v: string | string[]) => void
  multiple?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function GlassCombobox({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = 'Wybierz...',
  searchPlaceholder = 'Szukaj...',
  emptyText = 'Brak wyników',
  disabled,
  className,
}: GlassComboboxProps) {
  const { isGlass } = useGlass()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [active, setActive] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selected = React.useMemo<string[]>(
    () => (multiple ? (Array.isArray(value) ? value : []) : value ? [value as string] : []),
    [value, multiple],
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q))
  }, [options, query])

  React.useEffect(() => { setActive(0) }, [query, open])

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20)
    else setQuery('')
  }, [open])

  React.useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function toggle(opt: ComboOption) {
    if (opt.disabled) return
    if (!multiple) {
      onChange?.(opt.value)
      setOpen(false)
      return
    }
    const next = selected.includes(opt.value)
      ? selected.filter((v) => v !== opt.value)
      : [...selected, opt.value]
    onChange?.(next)
  }

  function removeChip(v: string, e: React.MouseEvent) {
    e.stopPropagation()
    onChange?.(selected.filter((s) => s !== v))
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % Math.max(filtered.length, 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); const o = filtered[active]; if (o) toggle(o) }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
    // Backspace na pustym polu zdejmuje ostatni chip — zachowanie znane
    // z pól tagów, oszczędza sięganie do myszy.
    else if (e.key === 'Backspace' && !query && multiple && selected.length) {
      onChange?.(selected.slice(0, -1))
    }
  }

  const singleLabel = !multiple && selected[0]
    ? options.find((o) => o.value === selected[0])?.label
    : null

  return (
    <div ref={ref} className={cn('relative w-full max-w-sm', className)}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          'flex min-h-10 w-full cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition-all',
          isGlass ? 'nb-szklo nb-szklo-plynne' : 'border border-border bg-input',
          open && 'ring-2 ring-primary/30',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {multiple && selected.length > 0 ? (
            selected.map((v) => {
              const opt = options.find((o) => o.value === v)
              return (
                <span
                  key={v}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full py-0.5 pl-2 pr-1 text-[11px] font-medium',
                    isGlass ? 'bg-primary/20 text-primary' : 'bg-primary/12 text-primary',
                  )}
                >
                  {opt?.label ?? v}
                  <button
                    type="button"
                    onClick={(e) => removeChip(v, e)}
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors hover:bg-primary/25"
                    aria-label={`Usuń ${opt?.label ?? v}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )
            })
          ) : singleLabel ? (
            <span className="truncate text-foreground">{singleLabel}</span>
          ) : (
            <span className="text-foreground/35">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-foreground/35 transition-transform', open && 'rotate-180')} />
      </div>

      {/* Panel */}
      {open && (
        <div className={cn(
          'absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl',
          'animate-in fade-in-0 zoom-in-[0.98] slide-in-from-top-1 duration-150',
          isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card shadow-xl',
        )}>
          <div className={cn('flex items-center gap-2 px-3 py-2', isGlass ? 'border-b border-foreground/[0.08]' : 'border-b border-border')}>
            <Search className="h-3.5 w-3.5 shrink-0 text-foreground/35" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-foreground/30"
            />
          </div>

          <div className="max-h-56 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-foreground/40">{emptyText}</p>
            ) : (
              filtered.map((opt, i) => {
                const Icon = opt.icon
                const isSel = selected.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => toggle(opt)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors',
                      opt.disabled && 'cursor-not-allowed opacity-35',
                      i === active && !opt.disabled && (isGlass ? 'bg-primary/12' : 'bg-foreground/[0.06]'),
                      isSel ? 'text-primary font-medium' : 'text-foreground/75',
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                    {opt.hint && <span className="shrink-0 text-[10px] text-foreground/35">{opt.hint}</span>}
                    {isSel && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
