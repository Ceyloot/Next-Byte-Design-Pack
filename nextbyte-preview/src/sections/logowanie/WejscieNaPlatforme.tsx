import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  X, Infinity as InfinityIcon, Gift, Check, Sparkles, Lock, Info, Minus,
  MessageSquare, Image as ImageIcon, Video, Spline, NotebookPen, GraduationCap,
  Calendar, Database, ZoomIn, ArrowRight, Coins,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NextByteMarkIcon } from '@/grafiki/znaki-marek'
import { PREMIUM_STEPS, ULTIMATE_STEPS, byteToStats } from '@/sections/CennikSection'
import zdjAnimal from '@/assets/studio/animal.jpg'
import zdjCar from '@/assets/studio/car.jpg'
import zdjInterior from '@/assets/studio/interior.jpg'
import zdjLandscape from '@/assets/studio/landscape.jpg'

/* Onboarding — faza C (spec: ./ONBOARDING.md). Po ostatnim pytaniu
   użytkownik ląduje na platformie (rozmytej w tle), a na niej po kolei:
   C1 Unlimited → C2 osobista zniżka z licznikiem → C3 plany z ofertą →
   C4 zapowiedź nowej funkcji. Treść oferty będzie się zmieniać, więc cała
   jest w jednym obiekcie konfiguracji (KONFIG_OFERTY). */

export interface KonfiguracjaOferty {
  /** Największy rabat — pokazywany na kuponie i w nagłówku */
  procent: number
  kod: string
  /** Czas ważności oferty liczony od wejścia na platformę */
  czasSekund: number
  /** Rabat per plan, dotyczy rozliczenia rocznego */
  rabatPremium: number
  rabatUltimate: number
}

export const KONFIG_OFERTY: KonfiguracjaOferty = {
  procent: 55,
  kod: 'NEXT_PERSONAL_PROMO',
  czasSekund: 3 * 3600 - 218,
  rabatPremium: 40,
  rabatUltimate: 45,
}

type Etap = 'unlimited' | 'gratulacje' | 'plany' | 'funkcja' | 'koniec'

/* Kolor promocji (róż z wzoru) to kolor tożsamości oferty, nie motywu —
   osobny token, żeby nie mylić go z akcentem interfejsu. */
const TOKENY_OFERTY = { '--oferta': '332 88% 58%', '--oferta-foreground': '0 0% 100%' } as React.CSSProperties

function StyleWejscia() {
  return (
    <style>{`
      @keyframes nbModalWchodzi { from { opacity: 0; transform: translateY(10px) scale(.98) } }
      @keyframes nbTloWchodzi { from { opacity: 0 } }
      @keyframes nbKonfetti {
        0% { transform: translate3d(0,-20px,0) rotate(0); opacity: 0 }
        10% { opacity: 1 }
        100% { transform: translate3d(var(--dx),140px,0) rotate(var(--rot)); opacity: 0 }
      }
      @keyframes nbKolazUnos { 0%,100% { translate: 0 0 } 50% { translate: 0 -6px } }
      .nb-modal-wchodzi { animation: nbModalWchodzi 360ms cubic-bezier(.2,.8,.2,1) backwards }
      .nb-tlo-wchodzi { animation: nbTloWchodzi 300ms ease-out backwards }
      .nb-konfetti { animation: nbKonfetti var(--t) cubic-bezier(.3,.6,.4,1) var(--d) infinite }
      .nb-kolaz-unos { animation: nbKolazUnos 7s ease-in-out infinite }
      @media (prefers-reduced-motion: reduce) {
        .nb-modal-wchodzi, .nb-tlo-wchodzi, .nb-konfetti, .nb-kolaz-unos { animation: none }
      }
    `}</style>
  )
}

/* ── Licznik oferty ──────────────────────────────────────────────────── */
function useOdliczanie(sekundy: number) {
  const koniec = useRef(Date.now() + sekundy * 1000)
  const [teraz, setTeraz] = useState(Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setTeraz(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const zostalo = Math.max(0, Math.floor((koniec.current - teraz) / 1000))
  const dwa = (n: number) => String(n).padStart(2, '0')
  return {
    h: dwa(Math.floor(zostalo / 3600)),
    m: dwa(Math.floor((zostalo % 3600) / 60)),
    s: dwa(zostalo % 60),
  }
}

type Czas = ReturnType<typeof useOdliczanie>

/* ── Wspólne klocki ──────────────────────────────────────────────────── */
function Modal({ children, className, onZamknij }: { children: React.ReactNode; className?: string; onZamknij?: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'nb-modal-wchodzi relative isolate w-full overflow-hidden rounded-3xl',
        'bg-[color-mix(in_srgb,hsl(var(--card))_90%,transparent)] backdrop-blur-[24px] ring-1 ring-inset ring-[hsl(var(--foreground)/0.12)]',
        'shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12),0_24px_80px_-20px_hsl(0_0%_0%/0.55)]',
        className,
      )}
    >
      {onZamknij && (
        <button
          type="button"
          onClick={onZamknij}
          aria-label="Zamknij"
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--foreground)/0.08)] text-foreground/80 transition-colors hover:bg-[hsl(var(--foreground)/0.14)] hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  )
}

function IkonaModala({ ikona: Ik }: { ikona: React.ComponentType<{ className?: string }> }) {
  return (
    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--foreground)/0.06)] text-foreground ring-1 ring-inset ring-[hsl(var(--foreground)/0.14)] shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.14),0_8px_24px_-8px_hsl(0_0%_0%/0.4)]">
      <Ik className="h-6 w-6" />
    </span>
  )
}

/* Kupon: pasek „kod zastosowany” + bilet z perforacją (ząbki po bokach,
   przerywana linia pośrodku) dzielony na rabat i licznik. */
function Kupon({ konfig, czas, kompakt }: { konfig: KonfiguracjaOferty; czas: Czas; kompakt?: boolean }) {
  return (
    <div className="relative w-full rounded-2xl bg-[color-mix(in_srgb,hsl(var(--background))_55%,transparent)] ring-1 ring-inset ring-[hsl(var(--foreground)/0.08)]">
      <p className={cn('flex items-center justify-center gap-2 text-center text-foreground', kompakt ? 'px-4 py-3 text-[13px]' : 'px-4 py-3.5 text-[14px]')}>
        <Check className="h-4 w-4 text-[hsl(var(--primary))]" strokeWidth={3} />
        <span className="font-semibold text-[hsl(var(--primary))]">{konfig.kod}</span>
        <span className="text-foreground/80">— kod zastosowany</span>
      </p>
      {/* perforacja: dwa ząbki w kolorze tła modala + przerywana linia */}
      <div className="relative h-0">
        <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-[hsl(var(--card))]" />
        <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-[hsl(var(--card))]" />
        <span className="absolute inset-x-4 top-0 border-t border-dashed border-[hsl(var(--foreground)/0.16)]" />
      </div>
      <div className="relative grid grid-cols-2">
        <span className="absolute bottom-3 left-1/2 top-3 border-l border-dashed border-[hsl(var(--foreground)/0.16)]" />
        <div className={cn('flex flex-col items-center justify-center', kompakt ? 'py-4' : 'py-6')}>
          <p className={cn('font-bold leading-none tracking-[-0.03em] text-[hsl(var(--oferta))]', kompakt ? 'text-[28px]' : 'text-[38px]')}>
            -{konfig.procent}%
          </p>
          <p className="mt-2 text-[11.5px] text-muted-foreground">z osobistym kodem</p>
        </div>
        <div className={cn('flex flex-col items-center justify-center', kompakt ? 'py-4' : 'py-6')}>
          <div className={cn('flex items-baseline gap-1.5 font-semibold tabular-nums leading-none text-foreground', kompakt ? 'text-[28px]' : 'text-[38px]')}>
            <span>{czas.h}</span><span className="text-foreground/50">:</span>
            <span>{czas.m}</span><span className="text-foreground/50">:</span>
            <span>{czas.s}</span>
          </div>
          <div className="mt-2 flex gap-5 text-[11.5px] text-muted-foreground">
            <span>godz.</span><span>min</span><span>sek</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Platforma w tle (rozmyta pod modalami) ──────────────────────────── */
function PlatformaWTle() {
  return (
    <div aria-hidden className="absolute inset-0 flex gap-3 p-3">
      <div className="hidden w-[200px] shrink-0 flex-col gap-2 rounded-2xl bg-[hsl(var(--card))] p-3 ring-1 ring-inset ring-[hsl(var(--foreground)/0.08)] md:flex">
        <NextByteMarkIcon className="mb-3 h-5 w-5 text-foreground" />
        {[MessageSquare, ImageIcon, Video, Spline, NotebookPen, GraduationCap].map((Ik, i) => (
          <div key={i} className="flex items-center gap-2 rounded-[10px] px-2 py-2 text-muted-foreground">
            <Ik className="h-4 w-4" />
            <span className="h-2 flex-1 rounded-full bg-[hsl(var(--foreground)/0.08)]" />
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-3 lg:grid-cols-3">
        {[zdjLandscape, null, zdjCar, null, zdjInterior, zdjAnimal].map((src, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-[hsl(var(--card))] ring-1 ring-inset ring-[hsl(var(--foreground)/0.08)]">
            {src
              ? <img src={src} alt="" className="h-full w-full object-cover opacity-70" />
              : <div className="space-y-2 p-4">{[70, 50, 85].map(w => <div key={w} className="h-2 rounded-full bg-[hsl(var(--foreground)/0.08)]" style={{ width: `${w}%` }} />)}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── C1: Twórz więcej z Unlimited ────────────────────────────────────── */
const KARTY_KOLAZU = [
  { nazwa: 'Chat AI', ikona: MessageSquare, zdj: null, x: '-4%', y: '14%', rot: -6, d: 0 },
  { nazwa: 'Studio Zdjęć', ikona: ImageIcon, zdj: zdjAnimal, x: '35%', y: '4%', rot: 0, d: -2, glowna: true },
  { nazwa: 'Studio Wideo', ikona: Video, zdj: zdjCar, x: '72%', y: '-6%', rot: 5, d: -4 },
  { nazwa: 'Canvas', ikona: Spline, zdj: zdjInterior, x: '8%', y: '62%', rot: 4, d: -1 },
  { nazwa: 'Notebook', ikona: NotebookPen, zdj: null, x: '44%', y: '56%', rot: -3, d: -3 },
  { nazwa: 'Akademia', ikona: GraduationCap, zdj: zdjLandscape, x: '76%', y: '50%', rot: -7, d: -5 },
]

function ModalUnlimited({ onDalej }: { onDalej: () => void }) {
  return (
    <Modal className="max-w-[620px]" onZamknij={onDalej}>
      <div className="px-6 pb-2 pt-10 text-center sm:px-10">
        <IkonaModala ikona={InfinityIcon} />
        <h2 className="mt-5 text-[26px] font-semibold tracking-[-0.6px] text-foreground sm:text-[30px]">Twórz więcej z Unlimited</h2>
        <p className="mx-auto mt-2 max-w-[380px] text-[14px] leading-relaxed text-muted-foreground">
          Korzystaj z modułów bez limitu w planie albo dobierz Byte, gdy potrzebujesz więcej.
        </p>
        <button
          type="button"
          onClick={onDalej}
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-foreground px-7 text-[14px] font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          Kontynuuj
        </button>
      </div>

      {/* Kolaż modułów — karty rozsypane i przechylone, część ucięta krawędzią */}
      <div
        className="relative mt-6 h-[300px]"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--foreground) / 0.10) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      >
        {KARTY_KOLAZU.map(k => (
          <div
            key={k.nazwa}
            className="nb-kolaz-unos absolute"
            style={{ left: k.x, top: k.y, animationDelay: `${k.d}s`, zIndex: k.glowna ? 2 : 1 }}
          >
            <div
              className={cn(
                'relative flex flex-col justify-end overflow-hidden rounded-2xl p-3 ring-1 ring-inset ring-[hsl(var(--foreground)/0.14)] shadow-[0_16px_40px_-12px_hsl(0_0%_0%/0.6)]',
                k.glowna ? 'h-[150px] w-[190px]' : 'h-[118px] w-[160px]',
              )}
              style={{
                rotate: `${k.rot}deg`,
                background: k.zdj ? undefined : 'linear-gradient(135deg, hsl(var(--primary) / 0.35), hsl(var(--card)) 70%)',
              }}
            >
              {k.zdj && <img src={k.zdj} alt="" className="absolute inset-0 -z-0 h-full w-full object-cover" />}
              <span className="absolute inset-0 bg-gradient-to-t from-[hsl(0_0%_0%/0.75)] via-[hsl(0_0%_0%/0.15)] to-transparent" />
              <k.ikona className="absolute left-3 top-3 h-4 w-4 text-white/90" />
              <span className="relative text-[9px] font-bold uppercase tracking-[0.3em] text-white/80">Unlimited</span>
              <span className={cn('relative font-extrabold italic leading-none tracking-[-0.02em] text-[hsl(var(--primary))]', k.glowna ? 'text-[22px]' : 'text-[17px]')}>
                {k.nazwa.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

/* ── C2: Gratulacje — osobista zniżka ────────────────────────────────── */
const KONFETTI = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  dx: `${((i * 53) % 60) - 30}px`,
  rot: `${(i * 97) % 360}deg`,
  t: `${2.6 + ((i * 13) % 10) / 10}s`,
  d: `${-((i * 7) % 26) / 10}s`,
  kolor: ['hsl(var(--primary))', 'hsl(var(--oferta))', 'hsl(48 96% 58%)', 'hsl(152 60% 52%)'][i % 4],
  ksztalt: i % 3 === 0 ? 'rounded-full' : 'rounded-[2px]',
  r: i % 2 ? 7 : 9,
}))

function ModalGratulacje({ konfig, czas, onDalej, onZamknij }: { konfig: KonfiguracjaOferty; czas: Czas; onDalej: () => void; onZamknij: () => void }) {
  return (
    <Modal className="max-w-[640px]" onZamknij={onZamknij}>
      <div className="relative px-6 pb-8 pt-10 text-center sm:px-12">
        <IkonaModala ikona={Gift} />
        <h2 className="mt-6 text-[28px] font-semibold leading-[1.12] tracking-[-0.8px] text-foreground sm:text-[36px]">
          Gratulacje! Otrzymujesz
          <span className="block text-[hsl(var(--primary))]">osobistą zniżkę {konfig.procent}%</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[440px] text-[14.5px] leading-relaxed text-muted-foreground">
          Oferta jest ważna tylko przez ograniczony czas. Plany Premium do {konfig.procent}% taniej.
        </p>
        <div className="mt-7">
          <Kupon konfig={konfig} czas={czas} />
        </div>

        <div className="relative mt-7">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-10 h-[160px] overflow-hidden">
            {KONFETTI.map((k, i) => (
              <span
                key={i}
                className={cn('nb-konfetti absolute top-0', k.ksztalt)}
                style={{
                  left: k.left, width: k.r, height: k.r, background: k.kolor,
                  ['--dx' as string]: k.dx, ['--rot' as string]: k.rot, ['--t' as string]: k.t, ['--d' as string]: k.d,
                } as React.CSSProperties}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onDalej}
            className="relative h-14 w-full rounded-2xl bg-[hsl(var(--primary))] text-[16px] font-semibold text-[hsl(var(--primary-foreground))] shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.35),inset_0_-3px_0_0_hsl(0_0%_0%/0.18),0_12px_32px_-10px_hsl(var(--primary)/0.7)] transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            Odbierz zniżkę
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ── C3: Plany z ofertą ──────────────────────────────────────────────── */
type Rozliczenie = 'miesiecznie' | 'rocznie'

interface PlanOferty {
  id: 'premium' | 'ultimate'
  nazwa: string
  opis: string
  kroki: typeof PREMIUM_STEPS
  rabat: number
  /** Premium ma stałą pulę (jak Plus u wzoru), Ultimate — suwak */
  suwak: boolean
  wyroznienie?: string
  kolor: string
  kolorTekstu: string
  bezLimitu: { nazwa: string; ikona: React.ComponentType<{ className?: string }>; status: string | null; plakietka?: string }[]
}

function KartaPlanu({ plan, rozliczenie }: { plan: PlanOferty; rozliczenie: Rozliczenie }) {
  const [krok, setKrok] = useState(plan.suwak ? 0 : plan.kroki.length - 1)
  const s = plan.kroki[krok]
  const staty = byteToStats(s.byte)
  const rocznie = rozliczenie === 'rocznie'
  const cena = rocznie ? Math.round(s.monthly * (1 - plan.rabat / 100)) : s.monthly
  const oszczednosc = (s.monthly - cena) * 12

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-3xl p-4 ring-1 ring-inset shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12),0_16px_40px_-16px_hsl(0_0%_0%/0.45)] sm:p-5"
      style={{
        background: `linear-gradient(170deg, hsl(${plan.kolor} / 0.30) 0%, hsl(${plan.kolor} / 0.08) 45%, hsl(var(--card)) 100%)`,
        ['--tw-ring-color' as string]: `hsl(${plan.kolor} / 0.45)`,
      } as React.CSSProperties}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <h3 className="text-[24px] font-extrabold tracking-[-0.03em] text-foreground">{plan.nazwa.toUpperCase()}</h3>
        {rocznie && (
          <span className="rounded-md bg-[hsl(var(--oferta))] px-1.5 py-0.5 text-[10.5px] font-extrabold italic text-[hsl(var(--oferta-foreground))]">
            -{plan.rabat}%
          </span>
        )}
        {plan.wyroznienie && (
          <span className="rounded-md bg-[hsl(var(--primary))] px-1.5 py-0.5 text-[10.5px] font-extrabold italic text-[hsl(var(--primary-foreground))]">
            ◆ {plan.wyroznienie}
          </span>
        )}
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">{plan.opis}</p>

      {/* Niecka z pulą Byte (poziom 2 szkła) */}
      <div className="mt-4 rounded-2xl bg-[color-mix(in_srgb,hsl(var(--background))_52%,transparent)] p-3.5 ring-1 ring-inset ring-[hsl(var(--foreground)/0.06)] shadow-[inset_0_1px_2px_0_hsl(var(--foreground)/0.03)]">
        <p className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <Coins className="h-4 w-4" style={{ color: `hsl(${plan.kolor})` }} />
          {s.byte.toLocaleString('pl')} Byte / mies.
        </p>
        <p className="mt-1 pl-6 text-[12px] text-muted-foreground">≈ {staty.obrazy.toLocaleString('pl')} generacji obrazów</p>
        <p className="pl-6 text-[12px] text-muted-foreground">≈ {staty.wiadomosci.toLocaleString('pl')} wiadomości AI Pro</p>
        {plan.suwak ? (
          <div className="mt-3.5">
            <input
              type="range"
              min={0}
              max={plan.kroki.length - 1}
              step={1}
              value={krok}
              onChange={e => setKrok(Number(e.target.value))}
              aria-label="Pula Byte"
              className="w-full cursor-pointer"
              style={{ accentColor: `hsl(${plan.kolor})` }}
            />
            <div className="mt-1 flex justify-between text-[11.5px]">
              {plan.kroki.map((k, i) => (
                <button
                  key={k.byte}
                  type="button"
                  onClick={() => setKrok(i)}
                  className={cn('cursor-pointer tabular-nums transition-colors', i === krok ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground')}
                >
                  {k.byte.toLocaleString('pl')}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-3.5 flex items-center justify-center gap-1.5 rounded-[10px] py-2 text-[12px] text-muted-foreground ring-1 ring-inset ring-[hsl(var(--foreground)/0.08)]">
            <Check className="h-3.5 w-3.5" /> Stała pula {s.byte.toLocaleString('pl')} Byte / mies.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        {rocznie && <span className="text-[22px] font-bold text-[hsl(var(--oferta))] line-through decoration-2">{s.monthly} zł</span>}
        <span className="text-[30px] font-extrabold tracking-[-0.03em] text-foreground">{cena} zł</span>
        <span className="text-[12.5px] text-muted-foreground">/ mies.{rocznie && ', rozliczane rocznie'}</span>
      </div>

      <button
        type="button"
        className="mt-3 h-12 w-full rounded-2xl text-[15px] font-semibold transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.35),inset_0_-3px_0_0_hsl(0_0%_0%/0.18)]"
        style={{ background: `hsl(${plan.kolor})`, color: `hsl(${plan.kolorTekstu})` }}
      >
        Wybierz ofertę
      </button>
      <p className="mt-2 min-h-[18px] text-center text-[12.5px] text-muted-foreground">
        {rocznie && oszczednosc > 0 && <>Oszczędzasz <b className="text-foreground">{oszczednosc.toLocaleString('pl')} zł</b> w porównaniu z miesięcznym</>}
      </p>

      <div className="mt-3 rounded-2xl bg-[color-mix(in_srgb,hsl(var(--background))_52%,transparent)] p-3 ring-1 ring-inset ring-[hsl(var(--foreground)/0.06)]">
        <p className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Bez limitu i za darmo</span>
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </p>
        <div className="space-y-1">
          {plan.bezLimitu.map(r => (
            <div
              key={r.nazwa}
              className={cn('flex items-center justify-between gap-2 rounded-[10px] px-2 py-1.5 text-[12.5px]', r.status ? 'text-foreground' : 'text-muted-foreground')}
              style={r.plakietka ? { background: `hsl(${plan.kolor} / 0.12)` } : undefined}
            >
              <span className="flex items-center gap-2">
                {r.status ? <Check className="h-3.5 w-3.5" style={{ color: `hsl(${plan.kolor})` }} /> : <Minus className="h-3.5 w-3.5" />}
                {r.nazwa}
              </span>
              {r.status ? (
                <span className="flex gap-1">
                  <span className="rounded-md bg-[hsl(var(--foreground)/0.08)] px-1.5 py-0.5 text-[10px] font-semibold">{r.status}</span>
                  {r.plakietka && (
                    <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold" style={{ background: `hsl(${plan.kolor})`, color: `hsl(${plan.kolorTekstu})` }}>
                      {r.plakietka}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[10.5px]">Brak</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EkranPlanow({ konfig, czas, onZamknij }: { konfig: KonfiguracjaOferty; czas: Czas; onZamknij: () => void }) {
  const [rozliczenie, setRozliczenie] = useState<Rozliczenie>('rocznie')
  const plany = useMemo<PlanOferty[]>(() => [
    {
      id: 'premium', nazwa: 'Premium', opis: 'Na codzienną pracę z AI',
      kroki: PREMIUM_STEPS, rabat: konfig.rabatPremium, suwak: false,
      kolor: 'var(--primary)', kolorTekstu: 'var(--primary-foreground)',
      bezLimitu: [
        { nazwa: 'Chat AI', ikona: MessageSquare, status: 'Unlimited', plakietka: '3 darmowe Pro' },
        { nazwa: 'Kalendarz, zadania, notatki', ikona: Calendar, status: 'Unlimited' },
        { nazwa: 'Baza danych', ikona: Database, status: 'Unlimited' },
        { nazwa: 'Enhancer 2x (HD)', ikona: ZoomIn, status: null },
      ],
    },
    {
      id: 'ultimate', nazwa: 'Ultimate', opis: 'Na ambitne projekty i zespoły',
      kroki: ULTIMATE_STEPS, rabat: konfig.rabatUltimate, suwak: true, wyroznienie: 'NAJLEPSZA WARTOŚĆ',
      kolor: 'var(--oferta)', kolorTekstu: 'var(--oferta-foreground)',
      bezLimitu: [
        { nazwa: 'Chat AI', ikona: MessageSquare, status: 'Unlimited', plakietka: '3 darmowe Pro' },
        { nazwa: 'Kalendarz, zadania, notatki', ikona: Calendar, status: 'Unlimited' },
        { nazwa: 'Baza danych', ikona: Database, status: 'Unlimited' },
        { nazwa: 'Enhancer 2x (HD)', ikona: ZoomIn, status: 'HD', plakietka: '7 dni bez limitu' },
      ],
    },
  ], [konfig])

  return (
    <Modal className="max-w-[1000px]" onZamknij={onZamknij}>
      <div className="px-4 pb-8 pt-10 sm:px-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--oferta))] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[hsl(var(--oferta-foreground))]">
            <Gift className="h-3.5 w-3.5" /> Oferta specjalna
          </span>
          <h2 className="mt-4 text-[28px] font-extrabold uppercase leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[40px]">
            Przejdź na Premium
            <span className="block">z osobistą zniżką <span className="text-[hsl(var(--oferta))]">do {konfig.procent}%</span></span>
          </h2>
        </div>

        <div className="mx-auto mt-7 max-w-[480px]">
          <Kupon konfig={konfig} czas={czas} kompakt />
        </div>

        {/* Przełącznik rozliczenia */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-xl px-3 py-2 ring-1 ring-inset ring-[hsl(var(--foreground)/0.10)]">
            <span className={cn('text-[13px]', rozliczenie === 'miesiecznie' ? 'font-semibold text-foreground' : 'text-muted-foreground')}>Miesięcznie</span>
            <button
              type="button"
              role="switch"
              aria-checked={rozliczenie === 'rocznie'}
              aria-label="Rozliczenie roczne"
              onClick={() => setRozliczenie(r => (r === 'rocznie' ? 'miesiecznie' : 'rocznie'))}
              className={cn('relative h-5 w-9 rounded-full transition-colors cursor-pointer', rozliczenie === 'rocznie' ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--foreground)/0.18)]')}
            >
              <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-[hsl(var(--background))] transition-[left] duration-200', rozliczenie === 'rocznie' ? 'left-[18px]' : 'left-0.5')} />
            </button>
            <span className={cn('text-[13px]', rozliczenie === 'rocznie' ? 'font-semibold text-foreground' : 'text-muted-foreground')}>Rocznie</span>
            <span className="rounded-md bg-[hsl(var(--oferta))] px-1.5 py-0.5 text-[10.5px] font-extrabold text-[hsl(var(--oferta-foreground))]">-{konfig.procent}%</span>
          </div>
        </div>

        <div className="mx-auto mt-6 grid max-w-[720px] grid-cols-1 gap-4 md:grid-cols-2">
          {plany.map(p => <KartaPlanu key={p.id} plan={p} rozliczenie={rozliczenie} />)}
        </div>
      </div>
    </Modal>
  )
}

/* ── C4: Nowa funkcja ────────────────────────────────────────────────── */
function ModalFunkcja({ onDalej }: { onDalej: () => void }) {
  return (
    <Modal className="max-w-[620px]" onZamknij={onDalej}>
      <div className="relative h-[260px] sm:h-[300px]">
        <img src={zdjCar} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--card)/0.2)] to-[hsl(var(--card))]" />
      </div>
      <div className="relative -mt-14 px-6 pb-9 text-center sm:px-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--oferta))] px-3 py-1 text-[12px] font-semibold text-[hsl(var(--oferta-foreground))] shadow-[0_6px_20px_-6px_hsl(var(--oferta)/0.7)]">
          <Gift className="h-3.5 w-3.5" /> Darmowa generacja
        </span>
        <h2 className="mt-4 text-[30px] font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-foreground sm:text-[38px]">
          Nowa funkcja
          <span className="block text-[hsl(var(--primary))]">Agent w Canvas</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[440px] text-[14.5px] leading-relaxed text-muted-foreground">
          Wstaw, przenieś albo zamień obiekt na zdjęciu jednym poleceniem — agent sam dobierze skalę, światło i perspektywę.
        </p>
        <button
          type="button"
          onClick={onDalej}
          className="group mt-7 inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--primary))] px-8 py-3.5 text-[16px] font-semibold text-[hsl(var(--primary-foreground))] shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.35),inset_0_-3px_0_0_hsl(0_0%_0%/0.18),0_12px_32px_-10px_hsl(var(--primary)/0.7)] transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          Odbierz darmową generację
        </button>
      </div>
    </Modal>
  )
}

/* ── Przepływ fazy C ─────────────────────────────────────────────────── */
export function WejscieNaPlatforme({
  konfig = KONFIG_OFERTY,
  onZakoncz,
}: {
  konfig?: KonfiguracjaOferty
  /** Po zamknięciu ostatniego modala — użytkownik jest na platformie */
  onZakoncz?: () => void
}) {
  const [etap, setEtap] = useState<Etap>('unlimited')
  const czas = useOdliczanie(konfig.czasSekund)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }) }, [etap])
  useEffect(() => { if (etap === 'koniec') onZakoncz?.() }, [etap, onZakoncz])

  return (
    <div className="relative h-full min-h-[680px] w-full overflow-hidden font-sans text-foreground" style={TOKENY_OFERTY}>
      <StyleWejscia />
      <PlatformaWTle />

      {etap !== 'koniec' ? (
        <div
          ref={scrollRef}
          key={etap}
          className="nb-tlo-wchodzi absolute inset-0 overflow-y-auto bg-[hsl(var(--background)/0.55)] backdrop-blur-md"
        >
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            {etap === 'unlimited' && <ModalUnlimited onDalej={() => setEtap('gratulacje')} />}
            {etap === 'gratulacje' && (
              <ModalGratulacje konfig={konfig} czas={czas} onDalej={() => setEtap('plany')} onZamknij={() => setEtap('funkcja')} />
            )}
            {etap === 'plany' && <EkranPlanow konfig={konfig} czas={czas} onZamknij={() => setEtap('funkcja')} />}
            {etap === 'funkcja' && <ModalFunkcja onDalej={() => setEtap('koniec')} />}
          </div>
        </div>
      ) : (
        /* Podgląd: platforma odsłonięta, z możliwością powtórki sekwencji */
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <button
            type="button"
            onClick={() => setEtap('unlimited')}
            className="nb-modal-wchodzi inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,hsl(var(--card))_85%,transparent)] px-4 py-2 text-[13px] font-medium text-foreground ring-1 ring-inset ring-[hsl(var(--foreground)/0.14)] backdrop-blur-xl cursor-pointer"
          >
            Powtórz sekwencję wejścia <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
