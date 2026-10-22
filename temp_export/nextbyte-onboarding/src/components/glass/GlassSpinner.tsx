import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

export type SpinnerSize = 'sm' | 'md' | 'lg'

const RING = {
  sm: { box: 'h-4 w-4',  bw: 'border-2' },
  md: { box: 'h-6 w-6',  bw: 'border-2' },
  lg: { box: 'h-10 w-10', bw: 'border-[3px]' },
} as const

/* ── Pierścień ───────────────────────────────────────────────────────────
   Otwarty łuk: trzy krawędzie przezroczyste, jedna w kolorze akcentu. */
export function GlassSpinner({
  size = 'md',
  className,
  label,
}: { size?: SpinnerSize; className?: string; label?: string }) {
  const s = RING[size]
  return (
    <span className={cn('inline-flex items-center gap-2', className)} role="status">
      <span
        className={cn(
          'inline-block rounded-full nb-spin',
          s.box, s.bw,
          'border-foreground/15 border-t-primary',
        )}
      />
      {label && <span className="text-xs text-foreground/60">{label}</span>}
      <span className="sr-only">Ładowanie…</span>
    </span>
  )
}

/* ── Kropki ──────────────────────────────────────────────────────────────
   Trzy punkty z przesuniętą fazą — miękkie „podskakiwanie". */
const DOT = { sm: 'h-1 w-1', md: 'h-1.5 w-1.5', lg: 'h-2.5 w-2.5' } as const

export function GlassSpinnerDots({
  size = 'md',
  className,
}: { size?: SpinnerSize; className?: string }) {
  return (
    <span className={cn('inline-flex items-end gap-1', className)} role="status">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn('inline-block rounded-full bg-primary nb-dot-skok', DOT[size])}
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
      <span className="sr-only">Ładowanie…</span>
    </span>
  )
}

/* ── Pasek liniowy ───────────────────────────────────────────────────────
   Nieokreślony postęp. `top` przykleja go do górnej krawędzi okna. */
export function GlassSpinnerBar({
  top = false,
  className,
}: { top?: boolean; className?: string }) {
  const { isGlass } = useGlass()
  return (
    <div
      role="status"
      className={cn(
        'h-0.5 w-full overflow-hidden',
        isGlass ? 'bg-foreground/10' : 'bg-muted',
        top && 'fixed inset-x-0 top-0 z-[200]',
        className,
      )}
    >
      <div className="h-full w-full bg-primary nb-pasek-nieokr" />
      <span className="sr-only">Ładowanie…</span>
    </div>
  )
}

/* ── Nakładka pełnoekranowa ─────────────────────────────────────────────── */
export function GlassLoadingOverlay({
  label = 'Ładowanie…',
  fullScreen = true,
  className,
}: { label?: string; fullScreen?: boolean; className?: string }) {
  const { isGlass } = useGlass()
  return (
    <div
      role="status"
      className={cn(
        'z-[150] flex flex-col items-center justify-center gap-3',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0 rounded-[inherit]',
        isGlass
          ? 'nb-szklo backdrop-blur-md'
          : 'bg-background/80 backdrop-blur-sm',
        className,
      )}
    >
      <GlassSpinner size="lg" />
      <p className="text-xs font-medium text-foreground/70">{label}</p>
    </div>
  )
}
