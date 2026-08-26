import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

export interface GlassPaginationProps {
  page: number
  total: number
  siblings?: number
  onChange: (page: number) => void
  size?: 'sm' | 'md'
  className?: string
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function GlassPagination({
  page,
  total,
  siblings = 1,
  onChange,
  size = 'md',
  className,
}: GlassPaginationProps) {
  const { isGlass } = useGlass()

  const btnSize = size === 'sm' ? 'h-7 min-w-[28px] text-xs' : 'h-8 min-w-[32px] text-sm'
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  function btn(base: string) {
    return cn(
      'inline-flex items-center justify-center rounded-lg px-2 font-medium transition-all duration-150 select-none',
      btnSize,
      base,
      isGlass
        ? 'hover:bg-foreground/[0.08]'
        : 'hover:bg-muted/60',
    )
  }

  function activeCls() {
    return isGlass
      ? 'bg-primary/20 text-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.25)]'
      : 'bg-primary text-primary-foreground'
  }

  // Build page list with dots
  const DOTS = -1
  function getPages(): number[] {
    const totalShown = siblings * 2 + 5
    if (total <= totalShown) return range(1, total)
    const leftSib = Math.max(page - siblings, 1)
    const rightSib = Math.min(page + siblings, total)
    const showLeft = leftSib > 2
    const showRight = rightSib < total - 1
    if (!showLeft && showRight) return [...range(1, rightSib + 1), DOTS, total]
    if (showLeft && !showRight) return [1, DOTS, ...range(leftSib - 1, total)]
    return [1, DOTS, ...range(leftSib, rightSib), DOTS, total]
  }

  const pages = getPages()

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        onClick={() => page > 1 && onChange(page - 1)}
        disabled={page <= 1}
        className={cn(btn('text-foreground/60 disabled:opacity-30 disabled:cursor-not-allowed'))}
        aria-label="Poprzednia strona"
      >
        <ChevronLeft className={iconSize} />
      </button>

      {pages.map((p, i) =>
        p === DOTS ? (
          <span key={`dots-${i}`} className={cn('inline-flex items-center justify-center text-foreground/30', btnSize)}>
            <MoreHorizontal className={iconSize} />
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              btn(''),
              p === page
                ? cn(activeCls(), 'cursor-default')
                : 'text-foreground/60',
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => page < total && onChange(page + 1)}
        disabled={page >= total}
        className={cn(btn('text-foreground/60 disabled:opacity-30 disabled:cursor-not-allowed'))}
        aria-label="Następna strona"
      >
        <ChevronRight className={iconSize} />
      </button>
    </div>
  )
}
