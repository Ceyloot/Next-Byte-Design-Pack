import React, { createContext, useContext, useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

/* ── Kontekst grupy ──────────────────────────────────────────────────────
   Trzyma otwarte klucze. `multiple` decyduje, czy pozycje wykluczają się. */
interface AccCtx {
  open: string[]
  toggle: (k: string) => void
}
const Ctx = createContext<AccCtx | null>(null)

interface GlassAccordionProps {
  multiple?:     boolean
  defaultOpen?:  string[]
  className?:    string
  children:      React.ReactNode
}

export function GlassAccordion({
  multiple = false,
  defaultOpen = [],
  className,
  children,
}: GlassAccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen)

  const toggle = (k: string) =>
    setOpen((prev) =>
      prev.includes(k)
        ? prev.filter((x) => x !== k)
        : multiple ? [...prev, k] : [k],
    )

  return (
    <Ctx.Provider value={{ open, toggle }}>
      <div className={cn('space-y-2', className)}>{children}</div>
    </Ctx.Provider>
  )
}

/* ── Pojedyncza pozycja ─────────────────────────────────────────────────── */
interface ItemProps {
  value?:     string
  title:      React.ReactNode
  icon?:      React.ReactNode
  badge?:     React.ReactNode
  disabled?:  boolean
  /** Wymusza tryb solid niezależnie od Glass/Normal — dla dłuższych list
   *  (FAQ, itd.), gdzie każda pozycja z drogim backdrop-filter SVG
   *  realnie się sumuje. Patrz `forceMode` na GlassCard. */
  forceMode?: 'auto' | 'solid'
  className?: string
  children:   React.ReactNode
}

export function GlassAccordionItem({
  value,
  title,
  icon,
  badge,
  disabled = false,
  forceMode = 'auto',
  className,
  children,
}: ItemProps) {
  const { isGlass: isGlassCtx } = useGlass()
  const isGlass = forceMode === 'solid' ? false : isGlassCtx
  const ctx = useContext(Ctx)
  const auto = useId()
  const key = value ?? auto

  /* Poza grupą pozycja działa samodzielnie (Collapsible) */
  const [solo, setSolo] = useState(false)
  const isOpen = ctx ? ctx.open.includes(key) : solo
  const toggle = () => (ctx ? ctx.toggle(key) : setSolo((v) => !v))

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl',
        isGlass ? 'nb-szklo' : 'border border-border bg-card',
        disabled && 'opacity-50',
        className,
      )}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-center gap-3 px-4 py-3 text-left',
          'transition-colors duration-200',
          !disabled && (isGlass ? 'hover:bg-foreground/[0.04]' : 'hover:bg-muted/40'),
          disabled && 'cursor-not-allowed',
        )}
      >
        {icon && <span className="shrink-0 text-primary">{icon}</span>}
        <span className="flex-1 text-sm font-medium text-foreground">{title}</span>
        {badge}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-foreground/40 transition-transform duration-300',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {/* Rozwijanie przez grid-template-rows — animuje dowolną wysokość */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className={cn(
            'px-4 pb-3.5 pt-0 text-xs leading-relaxed text-foreground/65',
            isGlass ? 'border-t border-foreground/[0.07]' : 'border-t border-border/60',
            'mt-0 pt-3',
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sekcja zwijana bez ramki (Collapsible) ─────────────────────────────── */
export function GlassCollapsible({
  title,
  defaultOpen = false,
  className,
  children,
}: {
  title: React.ReactNode
  defaultOpen?: boolean
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 py-2 text-left text-xs font-medium text-foreground/50 transition-colors hover:text-foreground/80"
      >
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-300', open && 'rotate-180')} />
        {title}
      </button>
      <div className={cn('grid transition-all duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden"><div className="pb-2">{children}</div></div>
      </div>
    </div>
  )
}
