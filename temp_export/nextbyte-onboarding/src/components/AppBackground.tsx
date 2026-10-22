import React from 'react'
import { Sparkles, Blend, Stars, Building2, Waves, Ban, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type BgKey = 'nextbyte' | 'landscape' | 'gradient' | 'galaxy' | 'city' | 'aurora' | 'off'

export const BG_OPTIONS: { key: BgKey; label: string; icon: React.ReactNode }[] = [
  { key: 'nextbyte',  label: 'NextByte',  icon: <Sparkles   className="h-3.5 w-3.5" /> },
  { key: 'landscape', label: 'Krajobraz', icon: <ImageIcon  className="h-3.5 w-3.5" /> },
  { key: 'gradient',  label: 'Gradient',  icon: <Blend      className="h-3.5 w-3.5" /> },
  { key: 'galaxy',    label: 'Galaktyka', icon: <Stars      className="h-3.5 w-3.5" /> },
  { key: 'city',      label: 'Miasto',    icon: <Building2  className="h-3.5 w-3.5" /> },
  { key: 'aurora',    label: 'Zorza',     icon: <Waves      className="h-3.5 w-3.5" /> },
  { key: 'off',       label: 'Brak',      icon: <Ban        className="h-3.5 w-3.5" /> },
]

/* Unsplash — wysokiej jakości, publiczne zdjęcia */
const PHOTOS: Partial<Record<BgKey, string>> = {
  landscape: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85&fit=crop',
  galaxy:    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=85&fit=crop',
  city:      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=85&fit=crop',
  aurora:    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=85&fit=crop',
}

/* Przyciemnienie żeby glass wyglądał lepiej na zdjęciu */
const OVERLAYS: Partial<Record<BgKey, string>> = {
  landscape: 'rgba(5, 20, 25, 0.25)',
  galaxy:    'rgba(2,2,15,0.45)',
  city:      'rgba(3,5,18,0.50)',
  aurora:    'rgba(2,8,12,0.40)',
}

function PhotoBg({ bgKey }: { bgKey: BgKey }) {
  const url     = PHOTOS[bgKey]
  const overlay = OVERLAYS[bgKey]
  if (!url) return null
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:    `url(${url})`,
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          backgroundRepeat:   'no-repeat',
        }}
      />
      {overlay && (
        <div className="absolute inset-0" style={{ background: overlay }} />
      )}
    </>
  )
}

function GradientBg() {
  return <div className="absolute inset-0 nb-app-bg" />
}

/* ── NextByte — 1:1 z produkcyjnego Panelu Głównego ──────────────────────
   Warstwowa scena z pięciu elementów, wszystkie fixed pod treścią:
     1. body = #09090b (zinc-950)
     2. cztery radial aury po rogach — dwie z domieszką primary (błękit),
        dwie w foreground (biel schodząca w tło)
     3. siatka techniczna SVG w kolorze #70BEFA (błękit marki), 0.12 opacity,
        maskowana centralną „latarnią" żeby brzegi znikały
     4. centralne przyciemnienie do background, żeby środek się wyciszył
   Każda warstwa oddzielnie, żeby dało się dostroić bez ruszania innych. */

/* Maska „latarnia" — siatka widoczna tylko w środkowych 10%, potem
   plynnie znika do 90%. Dokładnie tak jak w produkcji. */
const MASKA_LATARNIA = 'radial-gradient(circle, white 10%, transparent 90%)'

function NextByteBg() {
  return (
    <>
      {/* Baza — używa tokenu motywu, działa w jasnych i ciemnych */}
      <div className="absolute inset-0" style={{ backgroundColor: 'hsl(var(--background))' }} />

      {/* Siatka — inline SVG żeby kolor primary śledził motyw */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        style={{ maskImage: MASKA_LATARNIA, WebkitMaskImage: MASKA_LATARNIA }}
        aria-hidden
      >
        <defs>
          <pattern id="nb-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.12" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nb-grid)" />
      </svg>

      {/* Winieta — ściąga uwagę do środka, bez ostrych ruchomych plam */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 30%, transparent 50%, hsl(var(--background) / 0.8) 100%)',
        }}
      />
    </>
  )
}

interface AppBackgroundProps { bgKey: BgKey }

export function AppBackground({ bgKey }: AppBackgroundProps) {
  if (bgKey === 'off') return null
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
    >
      {bgKey === 'nextbyte' ? <NextByteBg />
        : bgKey === 'gradient' ? <GradientBg />
        : <PhotoBg bgKey={bgKey} />}
    </div>
  )
}

interface BgToggleProps { bgKey: BgKey; onCycle: () => void }

export function BgToggle({ bgKey, onCycle }: BgToggleProps) {
  const current = BG_OPTIONS.find(b => b.key === bgKey)!
  return (
    <button
      onClick={onCycle}
      title="Zmień tło"
      className={cn(
        'fixed right-4 top-4 z-[9999] flex items-center gap-2 rounded-lg border',
        'px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md transition-all duration-200',
        'border-border/60 bg-card/75 text-foreground/55 hover:bg-card/90 hover:text-foreground',
      )}
    >
      <span className="opacity-70">{current.icon}</span>
      <span>{current.label}</span>
    </button>
  )
}
