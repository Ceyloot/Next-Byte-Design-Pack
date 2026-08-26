import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'
import { ChevronDown, Check } from 'lucide-react'

export interface DropdownItem {
  key:       string
  label:     React.ReactNode
  icon?:     React.ReactNode
  danger?:   boolean
  disabled?: boolean
  divider?:  boolean
}

interface GlassDropdownProps {
  trigger:    React.ReactNode
  items:      DropdownItem[]
  align?:     'left' | 'right'
  className?: string
}

export function GlassDropdown({ trigger, items, align = 'left', className }: GlassDropdownProps) {
  const { isGlass } = useGlass()
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-2xl border p-1',
            align === 'right' ? 'right-0' : 'left-0',
            isGlass
              ? 'nb-szklo nb-szklo-plynne nb-powierzchnia border-foreground/12'
              : 'bg-card border-border shadow-xl',
          )}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className="my-1 h-px bg-foreground/8" />
            }
            return (
              <button
                key={item.key}
                disabled={item.disabled}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium',
                  'transition-colors duration-150 text-left',
                  item.danger
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-foreground/80 hover:bg-foreground/8 hover:text-foreground',
                  item.disabled && 'pointer-events-none opacity-40',
                )}
              >
                {item.icon && <span className="shrink-0 opacity-70">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Wersja z aktualnie wybranym elementem (Select-like) ── */
interface GlassDropdownSelectProps {
  options:    { value: string; label: string }[]
  value?:     string
  onChange?:  (v: string) => void
  placeholder?: string
  className?: string
}

export function GlassDropdownSelect({
  options,
  value,
  onChange,
  placeholder = 'Wybierz...',
  className,
}: GlassDropdownSelectProps) {
  const { isGlass } = useGlass()
  const [open, setOpen]     = useState(false)
  const ref                 = useRef<HTMLDivElement>(null)
  const selected            = options.find((o) => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm',
          'transition-all duration-200 cursor-pointer',
          isGlass
            ? cn('nb-szklo text-foreground')
            : 'bg-input border-border text-foreground hover:border-border/80',
        )}
      >
        <span className={cn(!selected && 'text-foreground/40')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-foreground/50 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border p-1',
            isGlass
              ? 'nb-szklo nb-szklo-plynne nb-powierzchnia border-foreground/12'
              : 'bg-card border-border shadow-xl',
          )}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange?.(opt.value); setOpen(false) }}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm',
                'transition-colors duration-150 cursor-pointer',
                opt.value === value
                  ? 'bg-primary/12 text-primary font-medium'
                  : 'text-foreground/80 hover:bg-foreground/8 hover:text-foreground',
              )}
            >
              {opt.label}
              {opt.value === value && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
