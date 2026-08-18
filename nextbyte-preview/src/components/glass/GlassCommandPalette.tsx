import React from 'react'
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

export interface CommandItem {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  /** Nagłówek grupy, pod którym pozycja się pojawi. */
  group?: string
  hint?: string
  shortcut?: string
  onRun?: () => void
}

export interface GlassCommandPaletteProps {
  open: boolean
  onClose: () => void
  items: CommandItem[]
  placeholder?: string
  emptyText?: string
  /** Renderuj inline zamiast jako overlay — do prezentacji w bibliotece. */
  inline?: boolean
  className?: string
}

export function GlassCommandPalette({
  open,
  onClose,
  items,
  placeholder = 'Wpisz polecenie lub szukaj...',
  emptyText = 'Brak wyników',
  inline = false,
  className,
}: GlassCommandPaletteProps) {
  const { isGlass } = useGlass()
  const [query, setQuery] = React.useState('')
  const [active, setActive] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) =>
      it.label.toLowerCase().includes(q) || it.group?.toLowerCase().includes(q) || it.hint?.toLowerCase().includes(q)
    )
  }, [items, query])

  // Grupowanie z zachowaniem płaskiego indeksu — nawigacja strzałkami
  // musi biec przez wszystkie pozycje niezależnie od podziału na grupy.
  const groups = React.useMemo(() => {
    const out: { name: string | undefined; items: { item: CommandItem; index: number }[] }[] = []
    filtered.forEach((item, index) => {
      const last = out[out.length - 1]
      if (last && last.name === item.group) last.items.push({ item, index })
      else out.push({ name: item.group, items: [{ item, index }] })
    })
    return out
  }, [filtered])

  React.useEffect(() => { setActive(0) }, [query, open])

  React.useEffect(() => {
    if (open && !inline) {
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [open, inline])

  // Utrzymanie podświetlonej pozycji w polu widzenia przy nawigacji klawiaturą.
  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const run = React.useCallback((item: CommandItem) => {
    item.onRun?.()
    onClose()
    setQuery('')
  }, [onClose])

  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % Math.max(filtered.length, 1)); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1)); return }
      if (e.key === 'Enter')     { e.preventDefault(); const it = filtered[active]; if (it) run(it) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, active, onClose, run])

  if (!open) return null

  const panel = (
    <div className={cn(
      'flex w-full flex-col overflow-hidden rounded-2xl',
      isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card shadow-2xl',
      className,
    )}>
      {/* Pole wyszukiwania */}
      <div className={cn('flex items-center gap-2.5 px-4 py-3', isGlass ? 'border-b border-foreground/[0.08]' : 'border-b border-border')}>
        <Search className="h-4 w-4 shrink-0 text-primary" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/35"
        />
        <kbd className="hidden shrink-0 rounded-md border border-foreground/10 bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-foreground/45 sm:inline-block">
          ESC
        </kbd>
      </div>

      {/* Lista wyników */}
      <div ref={listRef} className="max-h-[320px] overflow-y-auto p-1.5">
        {filtered.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-foreground/40">{emptyText}</div>
        ) : (
          groups.map((g, gi) => (
            <div key={gi} className="mb-1">
              {g.name && (
                <p className="px-2.5 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-foreground/35">
                  {g.name}
                </p>
              )}
              {g.items.map(({ item, index }) => {
                const Icon = item.icon
                const isActive = index === active
                return (
                  <button
                    key={item.id}
                    data-idx={index}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => run(item)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors',
                      isActive
                        ? isGlass
                          ? 'bg-primary/15 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.18)]'
                          : 'bg-primary/10 text-primary'
                        : 'text-foreground/70 hover:bg-foreground/[0.05]',
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                    <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                    {item.hint && <span className="shrink-0 text-[10px] text-foreground/35">{item.hint}</span>}
                    {item.shortcut && (
                      <kbd className="shrink-0 rounded-md border border-foreground/10 bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-foreground/45">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* Legenda klawiszy */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-2 text-[10px] text-foreground/35',
        isGlass ? 'border-t border-foreground/[0.08]' : 'border-t border-border',
      )}>
        <span className="flex items-center gap-1"><ArrowUp className="h-2.5 w-2.5" /><ArrowDown className="h-2.5 w-2.5" /> nawigacja</span>
        <span className="flex items-center gap-1"><CornerDownLeft className="h-2.5 w-2.5" /> wybierz</span>
        <span className="ml-auto tabular-nums">{filtered.length} pozycji</span>
      </div>
    </div>
  )

  if (inline) return panel

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg animate-in fade-in-0 zoom-in-[0.98] slide-in-from-top-2 duration-150">
        {panel}
      </div>
    </div>
  )
}

/** Spina ⌘K / Ctrl+K z lokalnym stanem otwarcia palety. */
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return { open, setOpen, close: () => setOpen(false) }
}
