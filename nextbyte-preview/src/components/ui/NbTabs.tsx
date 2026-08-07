import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

export interface NbTab {
  key: string
  label: React.ReactNode
  icon?: React.ReactNode
}

interface NbTabsProps {
  tabs: NbTab[]
  defaultTab?: string
  onChange?: (key: string) => void
  className?: string
}

/**
 * NbTabs — nawigacja zakładkowa z efektem liquid glass.
 * Implementacja CSS z produkcyjnego Studio Zdjęć (nextbyte.space):
 *   - kontener: .nb-szklo .nb-szklo-plynne (szkło płynne)
 *   - aktywna zakładka: wirujący conic-gradient (.nb-pigulka-rant .nb-tab-pill-spin)
 *     + szklane wypełnienie (.nb-pigulka-szklo)
 *   - zmiana zakładki: płynne przesunięcie pigułki przez CSS transform
 */
export function NbTabs({ tabs, defaultTab, onChange, className }: NbTabsProps) {
  const { isGlass } = useGlass()
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key ?? '')
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({ left: 0, width: 0, opacity: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  function movePill(key: string) {
    const btn = tabRefs.current.get(key)
    const container = containerRef.current
    if (!btn || !container) return
    const cRect = container.getBoundingClientRect()
    const bRect = btn.getBoundingClientRect()
    setPillStyle({
      left: bRect.left - cRect.left,
      width: bRect.width,
      opacity: 1,
    })
  }

  // Po zamontowaniu — ustaw pigułkę bez animacji
  useLayoutEffect(() => {
    // Krótkie opóźnienie żeby DOM był gotowy
    const id = requestAnimationFrame(() => movePill(active))
    return () => cancelAnimationFrame(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Przy zmianie zakładki — przesuń pigułkę z animacją
  useEffect(() => {
    movePill(active)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // Dopasuj pigułkę przy zmianie rozmiaru okna
  useEffect(() => {
    const observer = new ResizeObserver(() => movePill(active))
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  function handleClick(key: string) {
    setActive(key)
    onChange?.(key)
  }

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={cn(
        'relative flex flex-wrap items-center gap-0.5 rounded-[1.75rem] border p-1',
        isGlass ? 'nb-szklo nb-szklo-plynne' : 'border-border bg-muted/20',
        className,
      )}
    >
      {/* Ruchoma pigułka — za przyciskami */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 h-[calc(100%-8px)] rounded-full transition-[left,width] duration-300 ease-[cubic-bezier(.25,.46,.45,.94)]"
        style={pillStyle}
      >
        {isGlass ? (
          /* Wirujący conic-gradient + szklane wypełnienie */
          <span className="absolute inset-0 rounded-full overflow-hidden">
            <span className="absolute inset-0 rounded-full nb-pigulka-rant nb-tab-pill-spin" />
            <span className="absolute inset-[1px] rounded-full nb-pigulka-szklo" />
          </span>
        ) : (
          /* Zwykłe wypełnienie bez animacji */
          <span className="absolute inset-0 rounded-full bg-background border border-border shadow-sm" />
        )}
      </span>

      {/* Zakładki */}
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.key, el)
              else tabRefs.current.delete(tab.key)
            }}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleClick(tab.key)}
            className={cn(
              'relative z-10 flex h-9 sm:h-10 min-w-0 flex-initial cursor-pointer items-center',
              'justify-center gap-1.5 whitespace-nowrap rounded-full px-3 sm:px-5 py-1.5',
              'text-xs sm:text-sm font-medium transition-colors duration-200',
              isActive
                ? 'text-foreground'
                : 'text-foreground/65 hover:text-foreground hover:bg-foreground/5',
            )}
          >
            {tab.icon && (
              <span className="h-3.5 w-3.5 shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
