import React, { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   NEXTBYTE — SYSTEM DESIGNU STRONY PUBLICZNEJ
   Jedna skala, jedna paleta, jeden rytm sekcji.
   ═══════════════════════════════════════════════════════════════ */

/** Paleta NextByte — 3 barwy, zero hardcoded */
export const AKCENT = {
  chat:    'hsl(var(--primary))',
  studio:  'hsl(var(--primary) / 0.65)',
  notes:   'hsl(var(--primary))',
  auto:    'hsl(var(--primary) / 0.65)',
  local:   'hsl(var(--foreground) / 0.45)',
  neutral: 'hsl(var(--foreground) / 0.45)',
} as const

export type AkcentKey = keyof typeof AKCENT

/** Miękkie tło akcentu — używane w ikonach i chipach */
export const akcentTlo = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`

/* ═══════════════════════════════════════════════════════════════
   SYSTEM ANIMACJI
   ═══════════════════════════════════════════════════════════════ */

/** Wstrzyknięcie keyframes — renderuj raz na górze strony */
export function AnimStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes nb-fade-up {
        from { opacity:0; transform:translateY(28px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes nb-float {
        0%,100% { transform:translateY(0px); }
        50%     { transform:translateY(-9px); }
      }
      @keyframes nb-shimmer {
        0%   { transform:translateX(-120%) skewX(-18deg); }
        100% { transform:translateX(220%)  skewX(-18deg); }
      }
      @keyframes nb-pulse-ring {
        0%   { transform:scale(1);   opacity:.55; }
        100% { transform:scale(2.1); opacity:0;   }
      }
      @keyframes nb-blink {
        0%,49% { opacity:1; }
        50%,100% { opacity:0; }
      }
      @keyframes nb-spin-slow {
        to { transform: rotate(360deg); }
      }
      /* Impuls prądu biegnący ścieżką do rdzenia. Klatki były używane
         w schemacie platformy, ale nigdy nie zdefiniowane — stąd martwa
         animacja. Przesuwamy kreskę o pełną długość wzoru (14 + 86). */
      @keyframes nbElectricCurrent {
        from { stroke-dashoffset: 100; }
        to   { stroke-dashoffset: 0; }
      }
      @keyframes nb-progress {
        from { width: 0; }
      }
      /* Suwak zakresu w kreatorze doboru planu. Tło toru ustawia inline
         gradient (wypełnienie do bieżącej wartości), tutaj zostaje sam
         uchwyt — przeglądarki wymagają osobnych reguł dla WebKita i Gecko. */
      .nb-zakres::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px; height: 18px;
        border-radius: 9999px;
        background: hsl(var(--background));
        border: 2px solid hsl(var(--primary));
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.18);
        cursor: pointer;
        transition: transform .15s ease;
      }
      .nb-zakres::-webkit-slider-thumb:hover { transform: scale(1.12); }
      .nb-zakres::-moz-range-thumb {
        width: 18px; height: 18px;
        border-radius: 9999px;
        background: hsl(var(--background));
        border: 2px solid hsl(var(--primary));
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.18);
        cursor: pointer;
      }
      .nb-zakres:disabled::-webkit-slider-thumb { border-color: hsl(var(--foreground) / 0.3); box-shadow: none; cursor: default; }
      .nb-zakres:disabled::-moz-range-thumb     { border-color: hsl(var(--foreground) / 0.3); box-shadow: none; cursor: default; }
      .nb-float     { animation: nb-float     5s ease-in-out infinite; }
      .nb-shimmer   { animation: nb-shimmer   2.2s linear infinite; }
      .nb-pulse-ring{ animation: nb-pulse-ring 1.9s ease-out infinite; }
      .nb-blink     { animation: nb-blink     1s step-end infinite; }
    ` }} />
  )
}

/** Hook — zwraca true gdy element wchodzi w viewport */
export function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

/** Owijacz z animacją wejścia — fade-up na scroll */
export function FadeIn({
  children, delay = 0, className, as: Tag = 'div',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
}) {
  const { ref, visible } = useInView()
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn(className)}
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity .65s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .65s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}

/* ── SIATKA TŁA ─────────────────────────────────────────────── */
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 opacity-[0.35]', className)}
      style={{
        backgroundImage:
          'linear-gradient(hsl(var(--foreground)/0.045) 1px, transparent 1px),' +
          'linear-gradient(90deg, hsl(var(--foreground)/0.045) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 100%)',
      }}
    />
  )
}

/** Rozmyta poświata — do umieszczania za sekcjami hero / CTA */
export function Glow({
  className, color = 'hsl(var(--primary))', size = 620, opacity = 0.14,
}: { className?: string; color?: string; size?: number; opacity?: number }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute rounded-full', className)}
      style={{
        width: size, height: size * 0.6,
        background: color,
        opacity,
        filter: 'blur(110px)',
      }}
    />
  )
}

/** Precyzyjny separator laserowy z rozmyciem bocznym i świecącym mikrowęzłem */
export function TechDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('relative w-full flex items-center justify-center my-6 sm:my-12 pointer-events-none', className)}>
      <div className="h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-foreground/[0.12] to-transparent" />
      <div className="absolute h-1.5 w-1.5 rounded-full bg-primary/60 shadow-[0_0_8px_hsl(var(--primary))]" />
    </div>
  )
}

/** Znacznik sekcji z kreską laserową i etykietą monospace */
export function SecRule({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center">
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/75">{label}</span>
    </div>
  )
}

/** Znaczniki narożne stylistyki technicznej (+) */
export function TechCornerMarks({ className }: { className?: string }) {
  return (
    <>
      <span aria-hidden className={cn('pointer-events-none absolute -top-1.5 -left-1.5 font-mono text-[10px] text-primary/40 select-none', className)}>+</span>
      <span aria-hidden className={cn('pointer-events-none absolute -top-1.5 -right-1.5 font-mono text-[10px] text-primary/40 select-none', className)}>+</span>
      <span aria-hidden className={cn('pointer-events-none absolute -bottom-1.5 -left-1.5 font-mono text-[10px] text-primary/40 select-none', className)}>+</span>
      <span aria-hidden className={cn('pointer-events-none absolute -bottom-1.5 -right-1.5 font-mono text-[10px] text-primary/40 select-none', className)}>+</span>
    </>
  )
}

/** Techniczna siatka akcentowa dla sekcji sprzętowej / lokalnej */
export function MatrixAura({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden opacity-30', className)}
      style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--primary)/0.25) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 80%)',
      }}
    />
  )
}

/** Świetlny łuk — miękka kopuła nad sekcją (wariant: górny lub dolny) */
export function ArcGlow({
  className, flip = false, opacity = 0.5,
}: { className?: string; flip?: boolean; opacity?: number }) {
  const id = React.useId()
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute left-1/2 -translate-x-1/2 w-full max-w-5xl', className)}
      style={{ opacity, transform: flip ? 'translateX(-50%) rotate(180deg)' : undefined }}
    >
      <svg viewBox="0 0 1000 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`arc-${id}`} x1="0%" y1="100%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <filter id={`arcblur-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M 40 300 C 200 60, 800 60, 960 300" stroke={`url(#arc-${id})`} strokeWidth="1.5" filter={`url(#arcblur-${id})`} />
      </svg>
    </div>
  )
}

/** Ukośna smuga światła — subtelny akcent w tle sekcji */
export function BeamGlow({
  className, angle = -18, opacity = 0.16,
}: { className?: string; angle?: number; opacity?: number }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{
        opacity,
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
      }}
    >
      <div
        className="absolute top-1/2 left-1/2 h-[140%] w-[52%]"
        style={{
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), transparent)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  )
}

/** Ciągła warstwa świetlna dla całej strony — jasność zmienia się płynnie,
 *  bez skoków na granicach sekcji (efekty nie są przypisane do pojedynczej sekcji). */
export function PageAmbience() {
  const spots = [
    { top: '12%', left: '-10%', size: 900, opacity: 0.07 },
    { top: '30%', left: '75%',  size: 760, opacity: 0.06 },
    { top: '48%', left: '10%',  size: 820, opacity: 0.05 },
    { top: '66%', left: '68%',  size: 700, opacity: 0.06 },
    { top: '84%', left: '20%',  size: 880, opacity: 0.05 },
  ]
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {spots.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size * 0.55,
            background: 'hsl(var(--primary))',
            opacity: s.opacity,
            filter: 'blur(130px)',
          }}
        />
      ))}
    </div>
  )
}

/* ── SEKCJA ─────────────────────────────────────────────────── */
export function Section({
  children, className, wide, id,
}: { children: React.ReactNode; className?: string; wide?: boolean; id?: string }) {
  return (
    <section id={id} className={cn('relative px-4 sm:px-6 lg:px-8', className)}>
      <div className={cn('mx-auto w-full', wide ? 'max-w-7xl' : 'max-w-6xl')}>{children}</div>
    </section>
  )
}

/* ── EYEBROW ────────────────────────────────────────────────── */
export function Eyebrow({
  children, icon: Icon, color = 'hsl(var(--primary))', className,
}: { children: React.ReactNode; icon?: LucideIcon; color?: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
        'font-mono text-[10px] font-bold uppercase tracking-[0.22em]',
        className,
      )}
      style={{
        color,
        borderColor: akcentTlo(color, 28),
        background: akcentTlo(color, 8),
      }}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  )
}

/* ── NAGŁÓWEK SEKCJI ────────────────────────────────────────── */
export function SectionHead({
  eyebrow, eyebrowIcon, eyebrowColor, title, lead, align = 'center', className,
}: {
  eyebrow?: string
  eyebrowIcon?: LucideIcon
  eyebrowColor?: string
  title: React.ReactNode
  lead?: React.ReactNode
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 font-landing',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && <Eyebrow icon={eyebrowIcon} color={eyebrowColor}>{eyebrow}</Eyebrow>}
      <h2 className="font-landing text-3xl font-extrabold leading-[1.1] tracking-[-0.04em] text-foreground sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {lead && (
        <p className={cn('font-landing text-[15px] leading-relaxed text-foreground/50', align === 'center' && 'max-w-xl')}>
          {lead}
        </p>
      )}
    </div>
  )
}

/* ── PRZYCISKI ──────────────────────────────────────────────── */
export function GlowButton({
  children, onClick, size = 'lg', className, icon = true,
}: {
  children: React.ReactNode
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  icon?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl font-sans font-semibold cursor-pointer select-none',
        'border border-primary/60 bg-primary/20 backdrop-blur-xl text-foreground hover:bg-primary/30 hover:border-primary',
        'shadow-[0_0_24px_-2px_hsl(var(--primary)/0.45),inset_0_1px_0_0_rgba(255,255,255,0.25)]',
        'transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-[0_0_36px_0px_hsl(var(--primary)/0.6),inset_0_1px_0_0_rgba(255,255,255,0.4)] active:scale-[0.98]',
        size === 'lg' ? 'h-12 px-7 text-[14.5px] tracking-[-0.2px]' : size === 'sm' ? 'h-8 px-3.5 text-xs' : 'h-10 px-5 text-sm',
        className,
      )}
    >
      {/* Top subtle specular highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent"
      />

      <span className="relative z-10 flex items-center gap-2 text-foreground font-semibold">
        {children}
        {icon && (
          <ArrowRight className="h-4 w-4 stroke-[2.2] text-primary transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
        )}
      </span>
    </button>
  )
}

export function GhostButton({
  children, onClick, icon: Icon, size = 'lg', className,
}: {
  children: React.ReactNode
  onClick?: () => void
  icon?: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl font-sans font-semibold cursor-pointer select-none',
        'border border-foreground/[0.14] bg-card/75 backdrop-blur-xl text-foreground/90 hover:text-foreground hover:border-foreground/[0.28] hover:bg-card',
        'shadow-[0_2px_12px_-2px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        'transition-all duration-200 ease-out hover:scale-[1.015] active:scale-[0.98]',
        size === 'lg' ? 'h-12 px-6 text-[14.5px] tracking-[-0.2px]' : size === 'sm' ? 'h-8 px-3.5 text-xs' : 'h-10 px-5 text-sm',
        className,
      )}
    >
      {/* Top subtle specular highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent group-hover:via-foreground/30 transition-all duration-200"
      />
      <span className="relative z-10 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-110" />}
        {children}
      </span>
    </button>
  )
}

export function LinkButton({
  children, onClick, color = 'hsl(var(--primary))', className,
}: { children: React.ReactNode; onClick?: () => void; color?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('group inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80', className)}
      style={{ color }}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  )
}

/* ── PANEL / KARTA ──────────────────────────────────────────── */
export function Panel({
  children, className, hover, glow, style,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-foreground/[0.07]',
        'bg-[hsl(var(--card)/0.55)] backdrop-blur-xl',
        'shadow-[0_1px_0_0_hsl(var(--foreground)/0.05)_inset,0_20px_50px_-30px_rgb(0_0_0/0.7)]',
        hover && 'transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-[0_1px_0_0_hsl(var(--foreground)/0.08)_inset,0_32px_64px_-20px_rgb(0_0_0/0.9),0_0_40px_-10px_hsl(var(--primary)/0.2)]',
        glow && 'border-primary/25 shadow-[0_0_50px_-12px_hsl(var(--primary)/0.35)]',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  )
}

/** Cienka linia dzieląca z gradientem */
export function HairLine({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('h-px w-full', className)}
      style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--foreground)/0.10) 50%, transparent)' }}
    />
  )
}

/* ── IKONA W RAMCE ──────────────────────────────────────────── */
export function IconTile({
  icon: Icon, color = 'hsl(var(--primary))', size = 'md', className,
}: { icon: LucideIcon; color?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dims = { sm: 'h-7 w-7 rounded-lg', md: 'h-10 w-10 rounded-xl', lg: 'h-12 w-12 rounded-2xl' }[size]
  const ic = { sm: 'h-3.5 w-3.5', md: 'h-[18px] w-[18px]', lg: 'h-5 w-5' }[size]
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center border', dims, className)}
      style={{ background: akcentTlo(color, 12), borderColor: akcentTlo(color, 22) }}
    >
      <Icon className={ic} style={{ color }} />
    </span>
  )
}

/* ── STATYSTYKA ─────────────────────────────────────────────── */
export function StatCell({
  value, label, sub, icon: Icon, color = 'hsl(var(--primary))',
}: { value: string; label: string; sub?: string; icon?: LucideIcon; color?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Icon && <Icon className="h-4 w-4" style={{ color }} />}
      <p className="font-heading text-[28px] font-extrabold leading-none tracking-tight text-foreground">{value}</p>
      <p className="text-[12px] font-medium leading-tight text-foreground/50">{label}</p>
      {sub && <p className="text-[10px] font-semibold" style={{ color }}>{sub}</p>}
    </div>
  )
}

/* ── ETYKIETA "KROK N" ──────────────────────────────────────── */
export function StepNumber({ n, color = 'hsl(var(--primary))' }: { n: number; color?: string }) {
  return (
    <span
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[12px] font-bold"
      style={{ color, borderColor: akcentTlo(color, 30), background: akcentTlo(color, 10) }}
    >
      {n}
    </span>
  )
}

/* ── PASEK OPINII / GWIAZDKI ────────────────────────────────── */
export function Stars({ n = 5, size = 14 }: { n?: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-primary">
          <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
        </svg>
      ))}
    </span>
  )
}
