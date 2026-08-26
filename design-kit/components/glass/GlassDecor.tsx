import React from 'react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

/* ═══════════════════════════════════════════════════════════════════
   Dekoracje. Wszystkie czysto wizualne — `pointer-events-none` i
   `aria-hidden`, żeby nie wchodziły w tab order ani nie blokowały
   klikania treści pod spodem.

   UWAGA: elementy pozycjonowane absolutnie NIE mogą być bezpośrednim
   dzieckiem `.nb-szklo` — globalna reguła `.nb-szklo > *` wymusza
   position:relative i zamienia dekorację w blok w przepływie. Zawsze
   opakuj je w zwykły `relative` div poza szkłem.
   ═══════════════════════════════════════════════════════════════════ */

// ── 9. Divider ─────────────────────────────────────────────────────

export function GlassDivider({
  orientation = 'horizontal',
  label,
  variant = 'solid',
  className,
}: {
  orientation?: 'horizontal' | 'vertical'
  /** Tekst na środku linii — linia rozdziela się na dwie części. */
  label?: React.ReactNode
  variant?: 'solid' | 'dashed' | 'dotted' | 'gradient'
  className?: string
}) {
  const line = {
    solid:    'bg-foreground/[0.09]',
    dashed:   'bg-[repeating-linear-gradient(90deg,hsl(var(--foreground)/0.16)_0_6px,transparent_6px_12px)]',
    dotted:   'bg-[repeating-linear-gradient(90deg,hsl(var(--foreground)/0.22)_0_2px,transparent_2px_6px)]',
    gradient: 'bg-gradient-to-r from-transparent via-primary/40 to-transparent',
  }[variant]

  if (orientation === 'vertical') {
    return (
      <span
        aria-hidden
        className={cn('inline-block w-px self-stretch', variant === 'solid' ? 'bg-foreground/[0.09]' : 'bg-foreground/[0.14]', className)}
      />
    )
  }

  if (!label) {
    return <div aria-hidden className={cn('h-px w-full', line, className)} />
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div aria-hidden className={cn('h-px flex-1', line)} />
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/35">{label}</span>
      <div aria-hidden className={cn('h-px flex-1', line)} />
    </div>
  )
}

// ── 10. Orb ────────────────────────────────────────────────────────

export function GlassOrb({
  size = 320,
  color = 'hsl(var(--primary))',
  opacity = 0.18,
  blur = 80,
  className,
  style,
}: {
  size?: number
  color?: string
  opacity?: number
  blur?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute rounded-full', className)}
      style={{ width: size, height: size, background: color, opacity, filter: `blur(${blur}px)`, ...style }}
    />
  )
}

// ── 11. Noise ──────────────────────────────────────────────────────

/** Ziarno z feTurbulence w data-URI — bez sieciowego zasobu, więc
 *  działa też offline i w artefaktach z CSP. */
const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

export function GlassNoise({
  opacity = 0.05,
  className,
}: {
  opacity?: number
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 mix-blend-overlay', className)}
      style={{ backgroundImage: NOISE_SVG, opacity }}
    />
  )
}

// ── 12. Spotlight ──────────────────────────────────────────────────

/** Poświata podążająca za kursorem. Nasłuch jest na kontenerze, nie na
 *  oknie — kilka spotlightów na stronie nie depcze sobie po evencie. */
export function GlassSpotlight({
  color = 'hsl(var(--primary))',
  size = 380,
  className,
  children,
}: {
  color?: string
  size?: number
  className?: string
  children?: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
      }}
      onMouseLeave={() => setPos(null)}
      className={cn('relative overflow-hidden', className)}
    >
      {pos && (
        <div
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-200"
          style={{
            left: pos.x, top: pos.y, width: size, height: size,
            background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
            opacity: 0.13, filter: 'blur(28px)',
          }}
        />
      )}
      {children}
    </div>
  )
}

// ── 13. MeshGradient ───────────────────────────────────────────────

export function GlassMeshGradient({
  colors = ['hsl(var(--primary))', 'hsl(190 70% 50%)', 'hsl(270 65% 58%)'],
  opacity = 0.3,
  className,
}: {
  colors?: string[]
  opacity?: number
  className?: string
}) {
  // Kilka nakładających się gradientów radialnych daje efekt "mesh"
  // bez canvasu i bez biblioteki.
  const layers = [
    { c: colors[0], pos: '20% 25%' },
    { c: colors[1] ?? colors[0], pos: '80% 20%' },
    { c: colors[2] ?? colors[0], pos: '55% 85%' },
  ]
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        opacity,
        backgroundImage: layers.map((l) => `radial-gradient(at ${l.pos}, ${l.c} 0px, transparent 55%)`).join(', '),
      }}
    />
  )
}

// ── 14. Aurora ─────────────────────────────────────────────────────

export function GlassAurora({
  className,
  speed = 18,
}: {
  className?: string
  /** Czas jednego cyklu w sekundach — wyższy = spokojniej. */
  speed?: number
}) {
  const id = React.useId().replace(/:/g, '')
  return (
    <>
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 opacity-40', className)}
        style={{
          background: `conic-gradient(from 180deg at 50% 50%, hsl(var(--primary)/0.5), hsl(190 70% 50%/0.35), hsl(270 65% 58%/0.4), hsl(var(--primary)/0.5))`,
          filter: 'blur(56px)',
          animation: `nb-aurora-${id} ${speed}s linear infinite`,
        }}
      />
      <style>{`@keyframes nb-aurora-${id}{0%{transform:rotate(0) scale(1.25)}100%{transform:rotate(360deg) scale(1.25)}}`}</style>
    </>
  )
}

// ── 15. CornerDecor ────────────────────────────────────────────────

/** Techniczne narożniki — dwie kreski w każdym rogu, jak celownik. */
export function GlassCornerDecor({
  size = 14,
  color = 'hsl(var(--primary)/0.5)',
  corners = 'all',
  className,
}: {
  size?: number
  color?: string
  corners?: 'all' | 'top' | 'bottom'
  className?: string
}) {
  const show = {
    tl: corners !== 'bottom', tr: corners !== 'bottom',
    bl: corners !== 'top',    br: corners !== 'top',
  }
  const base = 'absolute'
  const s = `${size}px`

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      {show.tl && <span className={cn(base, 'left-0 top-0 border-l border-t')} style={{ width: s, height: s, borderColor: color }} />}
      {show.tr && <span className={cn(base, 'right-0 top-0 border-r border-t')} style={{ width: s, height: s, borderColor: color }} />}
      {show.bl && <span className={cn(base, 'bottom-0 left-0 border-b border-l')} style={{ width: s, height: s, borderColor: color }} />}
      {show.br && <span className={cn(base, 'bottom-0 right-0 border-b border-r')} style={{ width: s, height: s, borderColor: color }} />}
    </div>
  )
}

// ── 16. BorderGlow ─────────────────────────────────────────────────

/** Świecąca krawędź przez podwójną warstwę: gradientowe tło pod spodem
 *  i wewnętrzna powierzchnia z marginesem 1px, która je przykrywa. */
export function GlassBorderGlow({
  radius = 'rounded-2xl',
  color = 'hsl(var(--primary))',
  animated = false,
  className,
  children,
}: {
  radius?: string
  color?: string
  animated?: boolean
  className?: string
  children: React.ReactNode
}) {
  const { isGlass } = useGlass()
  const id = React.useId().replace(/:/g, '')

  return (
    <div className={cn('relative', radius, className)}>
      <div
        aria-hidden
        className={cn('pointer-events-none absolute -inset-px', radius)}
        style={{
          background: animated
            ? `conic-gradient(from 0deg, transparent 0%, ${color} 25%, transparent 50%, ${color} 75%, transparent 100%)`
            : `linear-gradient(135deg, ${color}, transparent 45%, transparent 55%, ${color})`,
          opacity: isGlass ? 0.55 : 0.35,
          animation: animated ? `nb-glow-${id} 4s linear infinite` : undefined,
        }}
      />
      <div className={cn('relative h-full w-full', radius)}>{children}</div>
      {animated && <style>{`@keyframes nb-glow-${id}{to{transform:rotate(360deg)}}`}</style>}
    </div>
  )
}
