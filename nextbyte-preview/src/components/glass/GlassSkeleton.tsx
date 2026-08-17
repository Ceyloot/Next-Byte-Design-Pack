import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

/* ── Baza ────────────────────────────────────────────────────────────────
   W trybie glass szkielet jest przezroczysty i połyskuje bielą,
   w normalnym — pełny blok na tle muted. */
function useBase() {
  const { isGlass } = useGlass()
  return isGlass
    ? 'nb-shimmer bg-foreground/[0.07]'
    : 'nb-shimmer bg-muted'
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: string
}

/** Pojedynczy blok — buduje wszystkie pozostałe warianty */
export function GlassSkeleton({ radius = 'rounded-lg', className, ...props }: SkeletonProps) {
  return <div className={cn(useBase(), radius, className)} {...props} />
}

/* ── Tekst ───────────────────────────────────────────────────────────── */
export function GlassSkeletonText({
  lines = 3,
  className,
}: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <GlassSkeleton
          key={i}
          className={cn('h-3', i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  )
}

/* ── Avatar ──────────────────────────────────────────────────────────── */
const AV = { xs: 'h-6 w-6', sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12', xl: 'h-16 w-16' } as const

export function GlassSkeletonAvatar({
  size = 'md',
  className,
}: { size?: keyof typeof AV; className?: string }) {
  return <GlassSkeleton radius="rounded-full" className={cn(AV[size], 'shrink-0', className)} />
}

/** Avatar + dwie linie — typowy wiersz listy */
export function GlassSkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <GlassSkeletonAvatar size="md" />
      <div className="flex-1 space-y-2">
        <GlassSkeleton className="h-3 w-1/3" />
        <GlassSkeleton className="h-2.5 w-1/2" />
      </div>
    </div>
  )
}

/* ── Obraz ───────────────────────────────────────────────────────────── */
export function GlassSkeletonImage({
  aspect = 'aspect-video',
  className,
}: { aspect?: string; className?: string }) {
  return (
    <GlassSkeleton radius="rounded-2xl" className={cn(aspect, 'w-full', className)} />
  )
}

/* ── Karta ───────────────────────────────────────────────────────────── */
export function GlassSkeletonCard({
  image = true,
  className,
}: { image?: boolean; className?: string }) {
  const { isGlass } = useGlass()
  return (
    <div
      className={cn(
        'space-y-3 rounded-2xl p-5',
        isGlass ? 'nb-szklo' : 'border border-border bg-card',
        className,
      )}
    >
      {image && <GlassSkeletonImage className="mb-1" />}
      <div className="flex items-center gap-2">
        <GlassSkeletonAvatar size="sm" />
        <GlassSkeleton className="h-3 w-1/3" />
      </div>
      <GlassSkeletonText lines={3} />
    </div>
  )
}

/* ── Tabela ──────────────────────────────────────────────────────────── */
export function GlassSkeletonTable({
  rows = 5,
  cols = 4,
  className,
}: { rows?: number; cols?: number; className?: string }) {
  const { isGlass } = useGlass()
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl',
        isGlass ? 'nb-szklo' : 'border border-border bg-card',
        className,
      )}
    >
      {/* Nagłówek */}
      <div className={cn('flex gap-4 px-4 py-3', isGlass ? 'bg-foreground/[0.04]' : 'bg-muted/40')}>
        {Array.from({ length: cols }).map((_, i) => (
          <GlassSkeleton key={i} className="h-2.5 flex-1" />
        ))}
      </div>
      {/* Wiersze */}
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-4 py-3">
            {Array.from({ length: cols }).map((_, c) => (
              <GlassSkeleton key={c} className={cn('h-3 flex-1', c === 0 && 'max-w-[40%]')} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Formularz ───────────────────────────────────────────────────────── */
export function GlassSkeletonForm({
  fields = 3,
  className,
}: { fields?: number; className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <GlassSkeleton className="h-2.5 w-24" />
          <GlassSkeleton radius="rounded-xl" className="h-10 w-full" />
        </div>
      ))}
      <GlassSkeleton radius="rounded-xl" className="h-10 w-32" />
    </div>
  )
}
