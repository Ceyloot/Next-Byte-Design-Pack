import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

type Side = 'top' | 'bottom' | 'left' | 'right'

interface GlassTooltipProps {
  content:    React.ReactNode
  children:   React.ReactElement
  side?:      Side
  delay?:     number
  className?: string
}

const sideClasses: Record<Side, { pos: string; arrow: string }> = {
  top:    { pos: 'bottom-full left-1/2 -translate-x-1/2 mb-2',   arrow: 'top-full  left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-foreground/20' },
  bottom: { pos: 'top-full  left-1/2 -translate-x-1/2 mt-2',   arrow: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-foreground/20' },
  left:   { pos: 'right-full top-1/2 -translate-y-1/2 mr-2',   arrow: 'left-full   top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-foreground/20' },
  right:  { pos: 'left-full  top-1/2 -translate-y-1/2 ml-2',   arrow: 'right-full  top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-foreground/20' },
}

export function GlassTooltip({
  content,
  children,
  side    = 'top',
  delay   = 400,
  className,
}: GlassTooltipProps) {
  const { isGlass } = useGlass()
  const [visible, setVisible]   = useState(false)
  const timerRef                = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cfg = sideClasses[side]

  const show = () => { timerRef.current = setTimeout(() => setVisible(true), delay) }
  const hide = () => { if (timerRef.current) clearTimeout(timerRef.current); setVisible(false) }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}

      {visible && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap px-3 py-1.5 text-xs font-medium',
            'rounded-lg border',
            cfg.pos,
            isGlass
              ? 'nb-szklo text-foreground border-foreground/15'
              : 'bg-card border-border text-foreground shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            className,
          )}
        >
          {content}
          {/* małe trójkątne wskazanie */}
          <span
            className={cn(
              'absolute border-4',
              cfg.arrow,
            )}
          />
        </span>
      )}
    </span>
  )
}
