import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Check, X, CircleCheck, Wallet, Repeat, Shield,
  MessageSquare, Image as ImageIcon, Bot, CalendarCheck, ShieldCheck, Zap,
} from 'lucide-react'
import {
  Section, GlowButton, GhostButton, FadeIn, akcentTlo,
  AnimStyles, PageAmbience, Glow,
} from './shared'
import { SecRule, NextByteMarkIcon } from './HomePage'
import { PLANY, przelicznikByte, POROWNANIE, FAQ } from './data'
import type { Plan } from './data'
import type { HomePage as HomePageId } from './types'

/* ═══════════════════════════════════════════════════════════════════════
   CENNIK — zbudowany na tym samym języku wizualnym co STRONA GŁÓWNA 3:
   nagłówki font-heading/font-light z tracking -2px, etykiety SecRule
   (mono, uppercase, stonowane), treść font-sans/font-light, kropki
   zamiast plakietek. Mechanika liczbowa (animowany licznik PLN/Byte,
   rabat roczny = miesięczna × 5/6, suwak progów) zgodna 1:1 z panelem
   rozliczeń produkcji — patrz AnimNum i PlanCard niżej.
   ═══════════════════════════════════════════════════════════════════════ */

type Okres = 'miesiecznie' | 'rocznie'

/** Pełna macierz funkcji naszych 3 planów — układ "Compare plans" jak w referencyjnych cennikach. */
const PLAN_MACIERZ: { f: string; v: (boolean | string)[] }[] = [
  { f: 'Pula Byte / miesiąc', v: ['Tylko paczki doładowań', 'od 495 ⟠', 'od 2450 ⟠'] },
  { f: 'Chat ze wszystkimi modelami (GPT, Claude, Gemini, Grok)', v: [true, true, true] },
  { f: 'Studio Zdjęć i Wideo AI', v: [true, true, true] },
  { f: 'Lokalny AI (Ollama / LM Studio) — 0 kosztu', v: [true, true, true] },
  { f: 'Personalny Asystent w całej platformie', v: [false, true, true] },
  { f: 'Tryb Ultra AI i Deep Research', v: [false, true, true] },
  { f: 'Równoległe generacje obrazów / wideo', v: ['1', '3', '5'] },
  { f: 'Priorytetowa kolejka (FAST queue)', v: [false, false, true] },
  { f: 'Kontekst i limit przesyłanych plików', v: ['Standard', 'Standard', '200k tokenów · 100 MB'] },
  { f: 'Wsparcie', v: ['Baza wiedzy', 'Mail do 24h', 'Dedykowany kanał na żywo'] },
]

/** Tło hero — fale rozmytego światła pod maską zanikania w dół, 1:1 z HeroWispyBackground strony głównej 3. */
function HeroWispyBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 90% 70% at 50% 0%, hsl(var(--foreground) / 0.06), hsl(var(--background)) 65%)',
        maskImage: 'linear-gradient(to bottom, black 0%, black 48%, transparent 75%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 48%, transparent 75%)',
      }}
    >
      <svg viewBox="0 0 1200 820" preserveAspectRatio="xMidYMin slice" className="absolute inset-0 h-full w-full" style={{ opacity: 0.55 }}>
        <defs>
          <filter id="nbWispCennik" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <linearGradient id="nbWispCennikGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
            <stop offset="45%" stopColor="hsl(var(--foreground))" stopOpacity="0.16" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="nbWispCennikGrad2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M -100 120 C 200 40, 350 260, 620 160 S 1000 60, 1300 220" fill="none" stroke="url(#nbWispCennikGrad1)" strokeWidth="60" filter="url(#nbWispCennik)" />
        <path d="M -100 380 C 250 300, 420 520, 700 400 S 1050 260, 1300 420" fill="none" stroke="url(#nbWispCennikGrad2)" strokeWidth="70" filter="url(#nbWispCennik)" />
        <path d="M -100 600 C 220 520, 500 700, 780 560 S 1080 480, 1300 620" fill="none" stroke="url(#nbWispCennikGrad1)" strokeWidth="50" filter="url(#nbWispCennik)" />
      </svg>
      <div className="absolute inset-0" style={{ opacity: 0.05, mixBlendMode: 'overlay', backgroundImage: 'repeating-linear-gradient(115deg, hsl(var(--foreground)) 0px, transparent 1.5px, transparent 3px)' }} />
    </div>
  )
}

/** Nagłówek bloku — ten sam rytm co BlockHead ze strony głównej 3. */
function BlockHead({
  label, title, accent, lead, center, className,
}: {
  label: string
  title: React.ReactNode
  accent?: React.ReactNode
  lead?: React.ReactNode
  center?: boolean
  className?: string
}) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center', className)}>
      <div className={cn(center && 'flex justify-center')}><SecRule label={label} /></div>
      <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
        {title}{accent ? <> <span className="font-normal text-primary">{accent}</span></> : null}
      </h2>
      {lead && (
        <p className={cn('mt-3 font-sans text-[15px] font-light leading-relaxed text-foreground/60', center && 'mx-auto')}>
          {lead}
        </p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PRZEŁĄCZNIK OKRESU — pigułka przesuwana (mechanika 1:1 z produkcją)
   ═══════════════════════════════════════════════════════════════ */
function OkresToggle({ okres, onChange }: { okres: Okres; onChange: (o: Okres) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const mRef = useRef<HTMLButtonElement>(null)
  const rRef = useRef<HTMLButtonElement>(null)
  const [pill, setPill] = useState({ left: 0, width: 0 })
  const [gotowy, setGotowy] = useState(false)

  const zmierz = () => {
    const wrap = wrapRef.current
    const btn = okres === 'miesiecznie' ? mRef.current : rRef.current
    if (!wrap || !btn) return
    const w = wrap.getBoundingClientRect()
    const b = btn.getBoundingClientRect()
    if (b.width === 0) return
    setPill({ left: b.left - w.left, width: b.width })
    setGotowy(true)
  }

  useLayoutEffect(() => {
    zmierz()
    const raf = requestAnimationFrame(zmierz)
    window.addEventListener('resize', zmierz)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', zmierz) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [okres])

  return (
    <div className="rounded-full border border-foreground/[0.1] bg-foreground/[0.02] p-1 backdrop-blur-md">
      <div ref={wrapRef} className="relative inline-flex items-center">
        <span
          aria-hidden
          className="pointer-events-none rounded-full"
          style={{
            position: 'absolute',
            top: 0, bottom: 0,
            left: pill.left,
            width: pill.width,
            opacity: gotowy ? 1 : 0,
            background: 'hsl(var(--primary))',
            boxShadow: '0 4px 18px -4px hsl(var(--primary)/0.6)',
            transition: 'left 320ms cubic-bezier(0.34,1.4,0.64,1), width 320ms cubic-bezier(0.34,1.4,0.64,1), opacity 200ms',
          }}
        />
        <button
          ref={mRef}
          type="button"
          onClick={() => onChange('miesiecznie')}
          className={cn(
            'relative z-10 h-10 shrink-0 rounded-full px-6 font-heading text-[13px] font-semibold transition-colors duration-200',
            okres === 'miesiecznie' ? 'text-background' : 'text-foreground/45 hover:text-foreground/75',
          )}
        >
          Miesięcznie
        </button>
        <button
          ref={rRef}
          type="button"
          onClick={() => onChange('rocznie')}
          className={cn(
            'relative z-10 flex h-10 shrink-0 items-center gap-2 rounded-full px-6 font-heading text-[13px] font-semibold transition-colors duration-200',
            okres === 'rocznie' ? 'text-background' : 'text-foreground/45 hover:text-foreground/75',
          )}
        >
          Rocznie
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide transition-colors',
              okres === 'rocznie' ? 'bg-background/20 text-background' : 'bg-primary/15 text-primary',
            )}
          >
            do −17%
          </span>
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ANIMOWANA LICZBA — easing cubic 420ms, obsługuje miejsca dziesiętne
   (cena roczna pokazuje grosze dokładnie jak panel rozliczeń: 149,17 zł)
   ═══════════════════════════════════════════════════════════════ */
function AnimNum({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [pokaz, setPokaz] = useState(value)
  const poprzedni = useRef(value)
  const mnoznik = 10 ** decimals

  useEffect(() => {
    const start = poprzedni.current
    const koniec = value
    poprzedni.current = koniec
    if (start === koniec) return

    const czas = 420
    let raf = 0
    const t0 = performance.now()

    const krok = (t: number) => {
      const p = Math.min((t - t0) / czas, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setPokaz(Math.round((start + (koniec - start) * e) * mnoznik) / mnoznik)
      if (p < 1) raf = requestAnimationFrame(krok)
    }
    raf = requestAnimationFrame(krok)

    // Gwarancja końcowej wartości — rAF nie działa w karcie w tle,
    // bez tego licznik zostałby na starej liczbie na zawsze.
    const domkniecie = window.setTimeout(() => {
      cancelAnimationFrame(raf)
      setPokaz(koniec)
    }, czas + 60)

    return () => { cancelAnimationFrame(raf); clearTimeout(domkniecie) }
  }, [value, mnoznik])

  return (
    <span className="tabular-nums">
      {pokaz.toLocaleString('pl-PL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SUWAK PULI BYTE — z badge'em "Lepszy kurs" na wyższych progach
   ═══════════════════════════════════════════════════════════════ */
function ByteSlider({
  progi, indeks, onChange, kolor,
}: {
  progi: NonNullable<Plan['progi']>
  indeks: number
  onChange: (i: number) => void
  kolor: string
}) {
  const pct = (indeks / (progi.length - 1)) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[12px] font-medium text-foreground/55">Pula Byte miesięcznie</span>
        <div className="flex items-center gap-1.5">
          {indeks > 0 && (
            <span
              className="rounded-full px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wide"
              style={{ color: kolor, background: akcentTlo(kolor, 14) }}
            >
              Lepszy kurs
            </span>
          )}
          <span
            className="flex items-center gap-1 rounded-lg border px-2.5 py-0.5"
            style={{ borderColor: akcentTlo(kolor, 30), background: akcentTlo(kolor, 10) }}
          >
            <span className="font-heading text-[12.5px] font-bold" style={{ color: kolor }}>
              <AnimNum value={progi[indeks].byte} />
            </span>
            <span className="text-[10px] font-bold" style={{ color: kolor }}>⟠</span>
          </span>
        </div>
      </div>

      {/* tor */}
      <div className="relative py-2">
        <div className="relative h-1.5 w-full rounded-full bg-foreground/[0.08]">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
            style={{ width: `${pct}%`, background: kolor, boxShadow: `0 0 14px ${akcentTlo(kolor, 70)}` }}
          />
        </div>

        {/* punkty */}
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
          {progi.map((p, i) => {
            const aktywny = i <= indeks
            const biezacy = i === indeks
            return (
              <button
                key={p.byte}
                type="button"
                onClick={() => onChange(i)}
                aria-label={`${p.byte} Byte`}
                className={cn(
                  'rounded-full transition-all duration-300',
                  biezacy ? 'h-[18px] w-[18px]' : 'h-[13px] w-[13px] hover:scale-125',
                )}
                style={{
                  background: aktywny ? kolor : 'hsl(var(--foreground)/0.14)',
                  border: '2px solid hsl(var(--card))',
                  boxShadow: biezacy ? `0 0 0 3px ${akcentTlo(kolor, 25)}, 0 0 16px ${akcentTlo(kolor, 60)}` : 'none',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* etykiety progów */}
      <div className="flex justify-between">
        {progi.map((p, i) => (
          <button
            key={p.byte}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              'font-mono text-[10px] transition-colors',
              i === indeks ? 'font-bold' : 'text-foreground/30 hover:text-foreground/55',
            )}
            style={i === indeks ? { color: kolor } : undefined}
          >
            {p.byte.toLocaleString('pl-PL')}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   MORPHING CANVAS — jedna scena SVG zamiast trzech kart. Sześć modułów
   platformy krąży wokół rdzenia Byte; który węzeł "żyje" (świeci, pulsuje
   prądem do rdzenia) zależy od wybranego planu. Przesuwasz plan wyżej —
   scena dosłownie się rozbudowuje, zamiast czytać listę cech.
   ═══════════════════════════════════════════════════════════════════════ */
type WezelId = 'chat' | 'studio' | 'notatki' | 'asystent' | 'lokalny' | 'fast'

const WEZLY_CANVAS: { id: WezelId; label: string; icon: React.ComponentType<{ className?: string }>; minTier: 0 | 1 | 2; kat: number }[] = [
  { id: 'chat', label: 'Chat AI', icon: MessageSquare, minTier: 0, kat: -90 },
  { id: 'studio', label: 'Studio Zdjęć', icon: ImageIcon, minTier: 0, kat: -30 },
  { id: 'asystent', label: 'Asystent', icon: Bot, minTier: 1, kat: 30 },
  { id: 'notatki', label: 'Kalendarz', icon: CalendarCheck, minTier: 1, kat: 90 },
  { id: 'lokalny', label: 'Lokalny AI', icon: ShieldCheck, minTier: 1, kat: 150 },
  { id: 'fast', label: 'FAST queue', icon: Zap, minTier: 2, kat: 210 },
]

function PricingCanvas({ tier, kolor }: { tier: 0 | 1 | 2; kolor: string }) {
  const cx = 320
  const cy = 168
  const promien = 128
  const rdzenR = 30 + tier * 7

  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[640px] sm:h-[340px]">
      <svg viewBox="0 0 640 320" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
        <defs>
          <filter id="cnvGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* pierścienie wokół rdzenia — przybywają z tierem */}
        <circle cx={cx} cy={cy} r={rdzenR + 22} fill="none" stroke={kolor} strokeWidth="1" strokeDasharray="2 6"
          style={{ opacity: tier >= 1 ? 0.35 : 0, transition: 'opacity 400ms ease' }} />
        <circle cx={cx} cy={cy} r={rdzenR + 40} fill="none" stroke={kolor} strokeWidth="1" strokeDasharray="1 8"
          style={{ opacity: tier >= 2 ? 0.28 : 0, transition: 'opacity 400ms ease 120ms' }} />

        {/* połączenia — dopiero za nimi rysują się węzły, żeby chip przykrywał start ścieżki */}
        {WEZLY_CANVAS.map(w => {
          const rad = (w.kat * Math.PI) / 180
          const nx = cx + Math.cos(rad) * promien
          const ny = cy + Math.sin(rad) * promien
          const aktywny = w.minTier <= tier
          const midx = cx + Math.cos(rad) * (promien * 0.5)
          const midy = cy + Math.sin(rad) * (promien * 0.5)
          return (
            <g key={w.id}>
              <path
                d={`M ${nx} ${ny} Q ${midx} ${midy} ${cx} ${cy}`}
                fill="none"
                stroke={aktywny ? kolor : 'hsl(var(--foreground))'}
                strokeWidth={aktywny ? 1.6 : 1}
                strokeOpacity={aktywny ? 0.5 : 0.1}
                style={{ transition: 'stroke-opacity 400ms ease, stroke 400ms ease' }}
              />
              {aktywny && (
                <path
                  d={`M ${nx} ${ny} Q ${midx} ${midy} ${cx} ${cy}`}
                  fill="none"
                  stroke={kolor}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeDasharray="14 86"
                  filter="url(#cnvGlow)"
                  style={{ animation: 'nbElectricCurrent 1.6s linear infinite', opacity: 0.85 }}
                />
              )}
            </g>
          )
        })}

        {/* rdzeń Byte */}
        <circle cx={cx} cy={cy} r={rdzenR} fill="hsl(var(--background))" stroke={kolor} strokeWidth="2" filter="url(#cnvGlow)"
          style={{ transition: 'r 400ms ease' }} />
      </svg>

      {/* logo rdzenia — HTML nad SVG, żeby użyć gotowej ikony marki */}
      <div
        className="absolute flex items-center justify-center rounded-full transition-all duration-400"
        style={{
          left: cx, top: cy, width: rdzenR * 2, height: rdzenR * 2, transform: 'translate(-50%,-50%)',
          background: akcentTlo(kolor, 10),
        }}
      >
        <NextByteMarkIcon className="h-1/2 w-1/2" style={{ color: kolor }} />
      </div>

      {/* węzły modułów — HTML nad SVG dla ostrych ikon i etykiet */}
      {WEZLY_CANVAS.map(w => {
        const rad = (w.kat * Math.PI) / 180
        const nx = cx + Math.cos(rad) * promien
        const ny = cy + Math.sin(rad) * promien
        const aktywny = w.minTier <= tier
        return (
          <div
            key={w.id}
            className="absolute flex flex-col items-center gap-1.5 transition-all duration-500"
            style={{
              left: `${(nx / 640) * 100}%`,
              top: `${(ny / 320) * 100}%`,
              transform: `translate(-50%,-50%) scale(${aktywny ? 1 : 0.8})`,
              opacity: aktywny ? 1 : 0.3,
            }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-sm"
              style={{
                borderColor: aktywny ? akcentTlo(kolor, 45) : 'hsl(var(--foreground)/0.12)',
                background: aktywny ? akcentTlo(kolor, 12) : 'hsl(var(--card)/0.6)',
                boxShadow: aktywny ? `0 0 16px -2px ${akcentTlo(kolor, 60)}` : undefined,
              }}
            >
              <w.icon className="h-[18px] w-[18px]" style={{ color: aktywny ? kolor : 'hsl(var(--foreground)/0.35)' }} />
            </div>
            <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: aktywny ? 'hsl(var(--foreground)/0.6)' : 'hsl(var(--foreground)/0.25)' }}>
              {w.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PRZEŁĄCZNIK PLANU — segmentowana pigułka z N opcjami (mechanika
   z OkresToggle uogólniona na dowolną liczbę przycisków).
   ═══════════════════════════════════════════════════════════════ */
function PlanSwitch({ plany, aktywny, onChange }: { plany: Plan[]; aktywny: string; onChange: (id: string) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef(new Map<string, HTMLButtonElement>())
  const [pill, setPill] = useState({ left: 0, width: 0 })
  const [gotowy, setGotowy] = useState(false)
  const aktywnyPlan = plany.find(p => p.id === aktywny)!

  const zmierz = () => {
    const wrap = wrapRef.current
    const btn = btnRefs.current.get(aktywny)
    if (!wrap || !btn) return
    const w = wrap.getBoundingClientRect()
    const b = btn.getBoundingClientRect()
    if (b.width === 0) return
    setPill({ left: b.left - w.left, width: b.width })
    setGotowy(true)
  }

  useLayoutEffect(() => {
    zmierz()
    const raf = requestAnimationFrame(zmierz)
    window.addEventListener('resize', zmierz)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', zmierz) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktywny])

  return (
    <div className="inline-flex rounded-full border border-foreground/[0.1] bg-foreground/[0.02] p-1 backdrop-blur-md">
      <div ref={wrapRef} className="relative inline-flex items-center">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 rounded-full transition-[left,width] duration-300"
          style={{
            left: pill.left,
            width: pill.width,
            opacity: gotowy ? 1 : 0,
            background: akcentTlo(aktywnyPlan.kolor, 14),
            border: `1px solid ${akcentTlo(aktywnyPlan.kolor, 38)}`,
            boxShadow: `0 0 20px -4px ${akcentTlo(aktywnyPlan.kolor, 60)}`,
            transitionTimingFunction: 'cubic-bezier(0.34,1.4,0.64,1)',
          }}
        />
        {plany.map(p => (
          <button
            key={p.id}
            ref={el => { if (el) btnRefs.current.set(p.id, el); }}
            type="button"
            onClick={() => onChange(p.id)}
            className={cn(
              'relative z-10 flex h-11 shrink-0 items-center gap-2 rounded-full px-5 font-heading text-[13.5px] font-semibold transition-colors duration-200',
              aktywny === p.id ? 'text-foreground' : 'text-foreground/40 hover:text-foreground/70',
            )}
            style={aktywny === p.id ? { color: p.kolor } : undefined}
          >
            {p.nazwa}
            {p.odznaka && (
              <span className="hidden rounded-full px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wide sm:inline" style={{ color: p.kolor, background: akcentTlo(p.kolor, 18) }}>
                top
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Zanika i wjeżdża od dołu za każdym razem, gdy zmienia się `id` — używane przy przełączaniu planu. */
function Crossfade({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const [widoczny, setWidoczny] = useState(true)
  useEffect(() => {
    setWidoczny(false)
    const raf = requestAnimationFrame(() => setWidoczny(true))
    return () => cancelAnimationFrame(raf)
  }, [id])

  return (
    <div
      className={cn('transition-[opacity,transform] duration-300 ease-out', className)}
      style={{ opacity: widoczny ? 1 : 0, transform: widoczny ? 'translateY(0)' : 'translateY(6px)' }}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   WITRYNA PLANU — canvas na górze, przełącznik i panel ceny/cech
   pod spodem, wszystko reaguje na jeden wybrany plan.
   ═══════════════════════════════════════════════════════════════ */
function PlanShowcase({ okres }: { okres: Okres }) {
  const polecanyId = PLANY.find(p => p.polecany)?.id ?? PLANY[0].id
  const [aktywnyId, setAktywnyId] = useState(polecanyId)
  const plan = PLANY.find(p => p.id === aktywnyId)!
  const tier = PLANY.findIndex(p => p.id === aktywnyId) as 0 | 1 | 2
  const [prog, setProg] = useState(0)

  useEffect(() => { setProg(0) }, [aktywnyId])

  const konfiguracja = plan.progi?.[prog] ?? null
  const darmowy = plan.progi === null
  // Rabat roczny = 2 miesiące gratis na 12 (miesięczna × 5/6) — dokładnie jak w panelu rozliczeń.
  const cena = konfiguracja ? (okres === 'miesiecznie' ? konfiguracja.miesiecznie : konfiguracja.miesiecznie * 5 / 6) : 0

  return (
    <div className="flex flex-col items-center">
      <PricingCanvas tier={tier} kolor={plan.kolor} />

      <div className="-mt-2">
        <PlanSwitch plany={PLANY} aktywny={aktywnyId} onChange={setAktywnyId} />
      </div>

      <div className="relative mt-8 w-full overflow-hidden rounded-2xl border p-8 sm:p-10" style={{ borderColor: akcentTlo(plan.kolor, 16), background: 'hsl(var(--card)/0.55)', backdropFilter: 'blur(20px)' }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-[background] duration-500"
          style={{ background: `radial-gradient(ellipse 70% 45% at 15% 0%, ${akcentTlo(plan.kolor, 10)}, transparent)` }}
        />

        <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Crossfade id={aktywnyId}>
              <p className="font-sans text-[13px] font-normal text-foreground/55">{plan.opis}</p>

              <div className="mt-6 flex h-5 items-center">
                {!darmowy && okres === 'rocznie' && konfiguracja && (
                  <span className="font-mono text-[13px] font-semibold text-red-400/70 line-through decoration-red-400/70">
                    {konfiguracja.miesiecznie.toLocaleString('pl-PL')} PLN
                  </span>
                )}
              </div>

              <div className="flex items-end gap-2">
                {!darmowy && <span className="pb-2 font-sans text-[13px] font-medium text-foreground/40">od</span>}
                <span className="font-heading text-[56px] font-semibold leading-none tracking-[-2px] text-foreground">
                  {darmowy ? '0' : <AnimNum value={cena} decimals={okres === 'rocznie' ? 2 : 0} />}
                </span>
                <span className="flex flex-col pb-2">
                  <span className="font-heading text-[14px] font-bold text-foreground/70">PLN</span>
                  <span className="font-sans text-[10.5px] font-medium text-foreground/40">/miesiąc</span>
                </span>
              </div>

              <p className="mt-2 font-sans text-[11.5px] font-medium text-foreground/45">
                {darmowy
                  ? 'Płacisz tylko za zużyte Byte z doładowanych paczek'
                  : okres === 'rocznie'
                    ? 'Płatność roczna.'
                    : 'Rozliczane miesięcznie · anulujesz w każdej chwili'}
                {!darmowy && okres === 'rocznie' && (
                  <span className="ml-1 font-semibold" style={{ color: plan.kolor }}>Oszczędzasz 17%</span>
                )}
              </p>

              {plan.polecany ? (
                <GlowButton className="mt-6 w-full justify-center">{plan.cta}</GlowButton>
              ) : (
                <GhostButton className="mt-6 w-full justify-center" icon={undefined}>{plan.cta}</GhostButton>
              )}

              {plan.progi && (
                <div className="mt-8">
                  <ByteSlider progi={plan.progi} indeks={prog} onChange={setProg} kolor={plan.kolor} />
                </div>
              )}

              {konfiguracja && (
                <p className="mt-5 font-sans text-[12px] font-medium leading-relaxed text-foreground/55">
                  To wystarczy na <strong className="font-semibold text-foreground/90">≈{przelicznikByte(konfiguracja.byte)[0].value.toLocaleString('pl-PL')}</strong> wiadomości
                  lub <strong className="font-semibold text-foreground/90">≈{przelicznikByte(konfiguracja.byte)[1].value.toLocaleString('pl-PL')}</strong> grafik 4K w miesiącu
                  <span className="ml-1 font-mono text-[10.5px] text-foreground/35">· kurs {konfiguracja.kurs}</span>
                </p>
              )}
            </Crossfade>
          </div>

          <div className="lg:col-span-7">
            <Crossfade id={aktywnyId}>
              <p className="mb-4 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-foreground/30">
                W planie {plan.nazwa}
              </p>
              <ul className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
                {plan.cechy.map(c => (
                  <li key={c} className="flex items-start gap-2.5 font-sans text-[13px] font-normal leading-relaxed text-foreground/70">
                    <Check className="mt-[3px] h-3.5 w-3.5 shrink-0" style={{ color: plan.kolor }} strokeWidth={2.5} />
                    {c}
                  </li>
                ))}
              </ul>
            </Crossfade>
          </div>
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   FAQ — akordeon z pomiarem wysokości (ResizeObserver), ten sam
   rytm co baza wiedzy na stronie głównej 3
   ═══════════════════════════════════════════════════════════════ */
function FaqRow({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const [h, setH] = useState(0)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setH(el.scrollHeight))
    ro.observe(el)
    setH(el.scrollHeight)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="border-b border-foreground/[0.08] first:border-t first:border-foreground/[0.08]">
      <button onClick={onToggle} aria-expanded={open} className="group flex w-full items-start gap-6 py-6 text-left">
        <span className={cn(
          'flex-1 font-heading text-[clamp(15px,1.8vw,17px)] font-light leading-snug tracking-[-0.3px] transition-colors duration-200',
          open ? 'text-foreground' : 'text-foreground/70 group-hover:text-foreground',
        )}>
          {q}
        </span>
        <span
          aria-hidden
          className={cn(
            'mt-0.5 shrink-0 text-[20px] font-light leading-none transition-[transform,color] duration-300',
            open ? 'rotate-45 text-primary' : 'text-foreground/30 group-hover:text-foreground/60',
          )}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden"
        style={{
          height: open ? h : 0,
          opacity: open ? 1 : 0,
          transition: 'height .42s cubic-bezier(.22,1,.36,1), opacity .3s ease',
        }}
      >
        <p ref={bodyRef} className="pb-7 pr-10 font-sans text-[13.5px] font-light leading-[1.7] text-foreground/55">
          {a}
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STRONA CENNIKA
   ═══════════════════════════════════════════════════════════════ */
export function CennikPage({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const [okres, setOkres] = useState<Okres>('miesiecznie')
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  return (
    <div className="relative flex w-full flex-col font-landing text-foreground">
      <AnimStyles />
      <PageAmbience />

      {/* ══════════ NAGŁÓWEK ══════════ */}
      <div className="relative overflow-hidden">
        <HeroWispyBackground />
        <Glow className="left-1/2 top-[-120px] -translate-x-1/2" size={720} opacity={0.16} />

        {/* gigantyczny napis w tle — ten sam trik co w referencyjnych cennikach */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-0.12em] -translate-x-1/2 select-none whitespace-nowrap font-heading font-bold uppercase leading-none text-foreground/[0.05]"
          style={{ fontSize: 'clamp(90px, 17vw, 230px)', letterSpacing: '-0.04em' }}
        >
          Cennik
        </span>

        <Section className="relative pb-16 pt-14 sm:pt-20">
          <FadeIn className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
            <SecRule label="Cennik i plany" />
            <h1 className="font-heading text-[clamp(34px,6vw,58px)] font-normal leading-[1.05] tracking-[-2.5px] text-foreground">
              Jedna cena. <br />
              <span className="font-normal text-primary drop-shadow-[0_0_44px_hsl(var(--primary)/0.4)]">Cały ekosystem AI.</span>
            </h1>
            <p className="mt-5 max-w-xl font-sans text-[15.5px] font-light leading-relaxed text-foreground/65">
              Wybierz plan dopasowany do skali pracy. Niewykorzystane Byte przechodzą na kolejny okres,
              a plan zmienisz albo anulujesz w dowolnym momencie.
            </p>

            <div className="mt-8">
              <OkresToggle okres={okres} onChange={setOkres} />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {[
                { i: Wallet, t: 'Bez karty na starcie' },
                { i: Repeat, t: 'Zmiana planu w każdej chwili' },
                { i: Shield, t: 'Faktura VAT w złotówkach' },
              ].map(x => (
                <span key={x.t} className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-foreground/35">
                  <x.i className="h-3.5 w-3.5 text-primary/60" />
                  {x.t}
                </span>
              ))}
            </div>
          </FadeIn>
        </Section>
      </div>

      {/* ══════════ MORPHING CANVAS — scena SVG + przełącznik + panel ceny ══════════ */}
      <Section className="pb-28 pt-4">
        <FadeIn>
          <PlanShowcase okres={okres} />
        </FadeIn>

        <p className="mt-10 text-center font-sans text-[11.5px] font-light text-foreground/30">
          Wszystkie ceny netto. Przy rozliczeniu rocznym rabat do 17% względem ceny miesięcznej.
          Niewykorzystana pula Byte przechodzi na kolejny okres do trzykrotności puli miesięcznej.
        </p>
      </Section>

      {/* ══════════ JAK DZIAŁA BYTE — trzy filary, rytm strony głównej 3 ══════════ */}
      <Section className="pb-24">
        <FadeIn>
          <BlockHead
            center
            label="Model rozliczeń"
            title="Byte — jednostka mocy,"
            accent="nie abonament."
            lead="Zamiast płacić stałą kwotę za dostęp, którego nie wykorzystujesz w pełni, rozliczasz rzeczywiste zużycie. Koszt każdej akcji widzisz zanim ją uruchomisz."
          />
        </FadeIn>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="relative mb-8 h-7">
            <span aria-hidden className="absolute inset-x-0 top-[13px] h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
            <span className="absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-2 bg-background px-4">
              <NextByteMarkIcon className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">rozliczenia</span>
            </span>
          </div>

          <div className="grid gap-x-10 gap-y-14 md:grid-cols-3">
            {[
              {
                n: '01', tag: 'Przejrzystość',
                t: 'Jawny koszt każdej akcji',
                d: 'Wiadomość do modelu, wygenerowany obraz, analiza dokumentu — każda operacja ma cenę w Byte widoczną przed uruchomieniem i zapisaną w historii.',
                metric: 'koszt widoczny przed wysłaniem',
              },
              {
                n: '02', tag: 'Bez straty',
                t: 'Pula nigdy nie przepada',
                d: 'Niewykorzystane Byte przechodzą na kolejny okres, do trzykrotności puli miesięcznej. Byte z doładowanych paczek nie wygasają w ogóle.',
                metric: 'do 3× puli w rolowaniu',
              },
              {
                n: '03', tag: 'Prywatność',
                t: 'Modele lokalne bez kosztu',
                d: 'Praca na modelach uruchomionych przez Ollamę nie zużywa ani jednego Byte — niezależnie od planu i liczby zapytań.',
                metric: '0 ⟠ za pracę offline',
              },
            ].map((f, i) => (
              <FadeIn key={f.n} delay={i * 90} className="relative pl-7">
                <span
                  aria-hidden
                  className="absolute -left-[3px] -top-1 h-[7px] w-[7px] rounded-full bg-primary"
                  style={{ boxShadow: '0 0 12px hsl(var(--primary))' }}
                />
                <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-primary/70 to-primary/10" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary/70">
                  {f.n} · {f.tag}
                </span>
                <h3 className="mt-3.5 font-heading text-[19px] font-light leading-snug tracking-[-0.5px] text-foreground">
                  {f.t}
                </h3>
                <p className="mt-3 font-sans text-[13.5px] font-light leading-relaxed text-foreground/55">
                  {f.d}
                </p>
                <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-foreground/35">
                  {f.metric}
                </p>
              </FadeIn>
            ))}
          </div>

          <div aria-hidden className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-foreground/[0.12] to-transparent" />
        </div>
      </Section>

      {/* ══════════ PORÓWNAJ PLANY — pełna macierz funkcji, styl referencyjnych cenników ══════════ */}
      <Section className="pb-24">
        <FadeIn>
          <BlockHead center label="Porównanie" title="Porównaj plany." lead="Wszystko, co dostajesz w każdym z trzech planów, jeden obok drugiego." className="mx-auto" />
        </FadeIn>

        <FadeIn delay={80} className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-foreground/[0.1]">
                <th className="w-[38%] pb-4 text-left align-bottom font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/30">
                  Znajdź plan dla siebie
                </th>
                {PLANY.map(p => (
                  <th key={p.id} className="px-3 pb-4 text-center align-bottom">
                    <span
                      className="font-heading text-[15px] font-medium tracking-[-0.3px]"
                      style={{ color: p.polecany ? p.kolor : undefined }}
                    >
                      {p.nazwa}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_MACIERZ.map(r => (
                <tr key={r.f} className="border-b border-foreground/[0.05] last:border-b-0">
                  <td className="py-3.5 pr-3 font-sans text-[13px] font-normal leading-snug text-foreground/70">{r.f}</td>
                  {r.v.map((v, vi) => (
                    <td key={vi} className={cn('px-3 py-3.5 text-center', vi === 2 && 'bg-primary/[0.035]')}>
                      {v === true ? (
                        <Check className="mx-auto h-4 w-4 text-primary" strokeWidth={2.5} />
                      ) : v === false ? (
                        <span className="mx-auto block h-px w-3 bg-foreground/15" />
                      ) : (
                        <span className={cn('font-sans text-[11.5px] font-semibold', vi === 2 ? 'text-primary' : 'text-foreground/55')}>{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </FadeIn>
      </Section>

      {/* ══════════ NEXTBYTE VS OSOBNE SUBSKRYPCJE ══════════ */}
      <Section className="pb-24">
        <FadeIn>
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5 space-y-5 text-left">
              <div className="space-y-2">
                <SecRule label="Vs. osobne subskrypcje" />
                <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
                  Pięć rachunków miesięcznie <br className="hidden sm:block" />
                  <span className="font-normal text-primary">albo jeden.</span>
                </h2>
              </div>
              <div className="space-y-2.5 pt-1 font-sans">
                {[
                  'Wszystkie topowe modele w jednym oknie, bez przełączania kart',
                  'Płacisz za realne zużycie, nie za sztywny limit na start miesiąca',
                  'Jedna faktura VAT w PLN zamiast kilku mikropłatności w USD',
                ].map(b => (
                  <div key={b} className="flex items-center gap-2.5 text-[13.5px] font-normal text-foreground/85">
                    <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse font-sans text-sm">
                <thead>
                  <tr className="border-b border-foreground/[0.08]">
                    <th className="pb-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/30">Funkcja</th>
                    {POROWNANIE.kolumny.map((k, i) => (
                      <th key={k} className="px-2 pb-3 text-center">
                        {i === 0
                          ? <span className="font-heading text-[13px] font-semibold text-primary">{k}</span>
                          : <span className="font-sans text-[11.5px] font-light text-foreground/35">{k}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {POROWNANIE.wiersze.map(r => (
                    <tr key={r.f} className="border-b border-foreground/[0.05] last:border-b-0">
                      <td className="py-3 pr-3 font-sans text-[12.5px] font-normal leading-snug text-foreground/70">{r.f}</td>
                      {r.v.map((v, vi) => (
                        <td key={vi} className={cn('py-3 text-center', vi === 0 && 'bg-primary/[0.04]')}>
                          {v === true ? (
                            <CircleCheck
                              className={cn('mx-auto h-4 w-4', vi === 0 ? 'text-primary' : 'text-foreground/40')}
                              style={vi === 0 ? { filter: 'drop-shadow(0 0 6px hsl(var(--primary)/0.5))' } : undefined}
                            />
                          ) : v === false ? (
                            <X className="mx-auto h-4 w-4 text-foreground/15" />
                          ) : (
                            <span className={cn('font-sans text-[11.5px] font-semibold', vi === 0 ? 'text-primary' : 'text-foreground/45')}>{v}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section className="pb-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <FadeIn>
                <SecRule label="Pytania o rozliczenia" />
                <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.06] tracking-[-2px] text-foreground">
                  Zanim <br />
                  <span className="font-normal text-primary">wybierzesz plan.</span>
                </h2>
                <p className="mt-4 max-w-sm font-sans text-[14.5px] font-light leading-relaxed text-foreground/55">
                  Najczęstsze pytania o Byte, rezygnację, bezpieczeństwo danych i płatności.
                </p>
              </FadeIn>
            </div>
          </div>

          <FadeIn delay={80} className="lg:col-span-8">
            {FAQ.map((f, i) => (
              <FaqRow key={f.q} q={f.q} a={f.a} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? null : i)} />
            ))}
          </FadeIn>
        </div>
      </Section>

      {/* ══════════ CTA ══════════ */}
      <Section className="relative overflow-hidden py-16 sm:py-20">
        <Glow className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" size={820} opacity={0.22} />
        <NextByteMarkIcon className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-[70%] text-primary/[0.06]" />
        <FadeIn className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
          <SecRule label="500 ⟠ na start" />
          <h2 className="font-heading text-[clamp(28px,5vw,44px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
            Nie musisz wybierać <br />
            <span className="font-normal text-primary">planu od razu.</span>
          </h2>
          <p className="mt-4 max-w-lg font-sans text-[15px] font-light leading-relaxed text-foreground/60">
            Zacznij od planu bezpłatnego ze startową pulą Byte. Przejdziesz wyżej dopiero wtedy,
            gdy poczujesz, że platforma faktycznie zarabia na siebie.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <GlowButton size="lg">Załóż darmowe konto</GlowButton>
            <GhostButton size="lg" onClick={() => onNavigate('b2b')}>Rozwiązania dla firm</GhostButton>
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/30">
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary/60" /> bez karty</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary/60" /> serwery w ue</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary/60" /> faktura vat w pln</span>
          </p>
        </FadeIn>
      </Section>
    </div>
  )
}
