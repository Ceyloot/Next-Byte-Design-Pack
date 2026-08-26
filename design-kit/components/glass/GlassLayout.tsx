import React from 'react'
import { cn } from '../../lib/utils'

/* ═══════════════════════════════════════════════════════════════════
   Prymitywy układu. Celowo bez glass — to rusztowanie, nie powierzchnia.
   Powierzchnię wnoszą dzieci (GlassCard, Tile). Dzięki temu te same
   komponenty działają w obu trybach bez rozgałęzień.
   ═══════════════════════════════════════════════════════════════════ */

// ── 1. Container ───────────────────────────────────────────────────

const MAXW = {
  sm: 'max-w-2xl', md: 'max-w-4xl', lg: 'max-w-6xl',
  xl: 'max-w-7xl', full: 'max-w-none',
} as const

export function GlassContainer({
  size = 'lg',
  bleed = false,
  className,
  children,
}: {
  size?: keyof typeof MAXW
  /** Pełna szerokość — znosi max-width i padding boczny. */
  bleed?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('mx-auto w-full', bleed ? 'max-w-none px-0' : cn(MAXW[size], 'px-4 sm:px-6'), className)}>
      {children}
    </div>
  )
}

// ── 2. Grid ────────────────────────────────────────────────────────

const COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
}

const GAP = { sm: 'gap-2', md: 'gap-3', lg: 'gap-5' } as const

export function GlassGrid({
  cols = 3,
  gap = 'md',
  className,
  children,
}: {
  cols?: 1 | 2 | 3 | 4 | 6
  gap?: keyof typeof GAP
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('grid', COLS[cols], GAP[gap], className)}>{children}</div>
}

// ── 3. Bento ───────────────────────────────────────────────────────

export interface BentoTile {
  /** Ile kolumn z 4 zajmuje kafelek (1–4). */
  span?: 1 | 2 | 3 | 4
  /** Ile rzędów zajmuje — daje charakterystyczną nierówną siatkę. */
  rows?: 1 | 2
  content: React.ReactNode
}

const SPAN: Record<number, string> = {
  1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4',
}
const ROWSPAN: Record<number, string> = { 1: '', 2: 'lg:row-span-2' }

export function GlassBento({
  tiles,
  gap = 'md',
  className,
}: {
  tiles: BentoTile[]
  gap?: keyof typeof GAP
  className?: string
}) {
  return (
    <div className={cn('grid auto-rows-[minmax(120px,auto)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', GAP[gap], className)}>
      {tiles.map((t, i) => (
        <div key={i} className={cn(SPAN[t.span ?? 1], ROWSPAN[t.rows ?? 1])}>
          {t.content}
        </div>
      ))}
    </div>
  )
}

// ── 4. Masonry ─────────────────────────────────────────────────────

/** Oparte na CSS columns — treść płynie w dół kolumny, więc kafelki
 *  o różnej wysokości nie zostawiają dziur jak w grid. */
export function GlassMasonry({
  cols = 3,
  gap = 'md',
  className,
  children,
}: {
  cols?: 2 | 3 | 4
  gap?: keyof typeof GAP
  className?: string
  children: React.ReactNode
}) {
  const colCls = cols === 2 ? 'sm:columns-2' : cols === 4 ? 'sm:columns-2 lg:columns-4' : 'sm:columns-2 lg:columns-3'
  const gapCls = gap === 'sm' ? 'gap-2' : gap === 'lg' ? 'gap-5' : 'gap-3'
  return (
    <div className={cn('columns-1', colCls, gapCls, className)}>
      {React.Children.map(children, (child, i) => (
        // break-inside-avoid zapobiega rozcięciu kafelka między kolumnami.
        <div key={i} className={cn('break-inside-avoid', gap === 'sm' ? 'mb-2' : gap === 'lg' ? 'mb-5' : 'mb-3')}>
          {child}
        </div>
      ))}
    </div>
  )
}

// ── 5. Split ───────────────────────────────────────────────────────

const RATIO = {
  '1/2': 'lg:grid-cols-2',
  '1/3': 'lg:grid-cols-[1fr_2fr]',
  '2/3': 'lg:grid-cols-[2fr_1fr]',
  '1/4': 'lg:grid-cols-[1fr_3fr]',
} as const

export function GlassSplit({
  ratio = '1/2',
  gap = 'lg',
  reverse = false,
  className,
  children,
}: {
  ratio?: keyof typeof RATIO
  gap?: keyof typeof GAP
  /** Odwraca kolejność na desktopie — mobile zawsze zostaje w DOM order. */
  reverse?: boolean
  className?: string
  children: React.ReactNode
}) {
  const kids = React.Children.toArray(children)
  return (
    <div className={cn('grid grid-cols-1 items-center', RATIO[ratio], GAP[gap], className)}>
      {kids.map((k, i) => (
        <div key={i} className={cn(reverse && (i === 0 ? 'lg:order-2' : 'lg:order-1'))}>{k}</div>
      ))}
    </div>
  )
}

// ── 6. Stack ───────────────────────────────────────────────────────

const SPACE = { xs: 'gap-1', sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-10' } as const
const ALIGN = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' } as const

export function GlassStack({
  space = 'md',
  align = 'stretch',
  divide = false,
  className,
  children,
}: {
  space?: keyof typeof SPACE
  align?: keyof typeof ALIGN
  /** Cienka linia między dziećmi. */
  divide?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn(
      'flex flex-col', SPACE[space], ALIGN[align],
      divide && 'divide-y divide-foreground/[0.07]',
      className,
    )}>
      {children}
    </div>
  )
}

// ── 7. Cluster ─────────────────────────────────────────────────────

const JUSTIFY = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between' } as const

/** Poziomy rząd, który zawija się zamiast przepełniać — do pigułek,
 *  tagów, przycisków akcji. */
export function GlassCluster({
  space = 'sm',
  justify = 'start',
  align = 'center',
  className,
  children,
}: {
  space?: keyof typeof SPACE
  justify?: keyof typeof JUSTIFY
  align?: keyof typeof ALIGN
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-wrap', SPACE[space], JUSTIFY[justify], ALIGN[align], className)}>
      {children}
    </div>
  )
}

// ── 8. AspectRatio ─────────────────────────────────────────────────

const ASPECT = {
  '16/9': 'aspect-video', '1/1': 'aspect-square',
  '4/3': 'aspect-[4/3]', '3/2': 'aspect-[3/2]', '21/9': 'aspect-[21/9]',
} as const

export function GlassAspectRatio({
  ratio = '16/9',
  className,
  children,
}: {
  ratio?: keyof typeof ASPECT
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('relative w-full overflow-hidden', ASPECT[ratio], className)}>
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}
