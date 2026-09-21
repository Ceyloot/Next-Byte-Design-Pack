import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Check, X, Sparkles, Wand2, ChevronDown, ArrowRight,
  MessageSquare, ImagePlus, Bot, Layers, FileStack, FileSearch,
  Gauge, HardDrive, Coins, Lock, Brain, Upload, Gift,
} from 'lucide-react'
import {
  Section, GlowButton, GhostButton, FadeIn, akcentTlo,
  AnimStyles, TechDivider,
} from '@/sections/wspolne/shared'
import { SecRule } from './bloki-wspolne'
import { NextByteMarkIcon, OpenAIIcon, GeminiIcon } from '@/grafiki/znaki-marek'
import { PLANY, PLAN_MACIERZ, BYTE_KARTY, przelicznikByte, KOSZT_BYTE, CENNIK_FAQ } from './data'
import type { Plan, Cecha, TonPlakietki } from './data'
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

/** Rabat roczny jest w produkcji płaski (17%) — nie osobno tabelaryzowany per próg. */
const RABAT_ROCZNY = 0.17
const cenaZaOkres = (miesiecznie: number, okres: Okres) =>
  okres === 'rocznie' ? Math.round(miesiecznie * (1 - RABAT_ROCZNY)) : miesiecznie

/** Nagłówek bloku — ten sam rytm co BlockHead ze strony głównej 3. */
function BlockHead({
  label, title, accent, lead, center, className,
}: {
  label?: string
  title: React.ReactNode
  accent?: React.ReactNode
  lead?: React.ReactNode
  center?: boolean
  className?: string
}) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center', className)}>
      {label && <div className={cn(center && 'flex justify-center')}><SecRule label={label} /></div>}
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
  }, [okres])

  return (
    <div className="relative inline-flex h-10 items-center rounded-xl border border-foreground/[0.12] bg-[hsl(var(--card)/0.7)] p-1 backdrop-blur-md shadow-inner">
      <div ref={wrapRef} className="relative inline-flex h-full items-center">
        {/* Dynamiczny wskaźnik przełącznika w HSL z subtelną poświatą primary */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 rounded-lg border border-primary/45 bg-[hsl(var(--primary)/0.14)] shadow-[0_0_16px_-2px_hsl(var(--primary)/0.25)] backdrop-blur-sm"
          style={{
            left: pill.left,
            width: pill.width,
            opacity: gotowy ? 1 : 0,
            transition: 'left 260ms cubic-bezier(0.2, 0.8, 0.2, 1), width 260ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 150ms',
          }}
        >
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.6)] to-transparent" />
        </span>

        <button
          ref={mRef}
          type="button"
          onClick={() => onChange('miesiecznie')}
          className={cn(
            'relative z-10 flex h-full items-center px-4 font-heading text-[13px] transition-colors duration-200 cursor-pointer select-none',
            okres === 'miesiecznie'
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground font-normal',
          )}
        >
          Miesięcznie
        </button>

        <button
          ref={rRef}
          type="button"
          onClick={() => onChange('rocznie')}
          className={cn(
            'relative z-10 flex h-full items-center gap-2 px-4 font-heading text-[13px] transition-colors duration-200 cursor-pointer select-none',
            okres === 'rocznie'
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground font-normal',
          )}
        >
          <span>Rocznie</span>
          <span
            className={cn(
              'rounded-full px-1.5 py-0.2 font-mono text-[9px] font-bold tracking-tight border transition-colors',
              okres === 'rocznie'
                ? 'border-primary/40 bg-primary/20 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.25)]'
                : 'border-foreground/15 bg-foreground/[0.05] text-muted-foreground',
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
   PRZYCISK "NIE WIESZ KTÓRY PLAN WYBRAĆ?" — dynamiczny HSL
   ═══════════════════════════════════════════════════════════════ */
function PlanFinderButton({ otwarty, onClick }: { otwarty: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={otwarty}
      className={cn(
        'group relative inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-4 font-heading text-[13px] font-semibold transition-all duration-200 backdrop-blur-md cursor-pointer select-none',
        otwarty
          ? 'border-primary/60 bg-[hsl(var(--primary)/0.12)] text-primary shadow-[0_0_20px_-4px_hsl(var(--primary)/0.35)]'
          : 'border-foreground/[0.12] bg-[hsl(var(--card)/0.7)] text-foreground/85 hover:border-primary/45 hover:bg-primary/[0.06] hover:text-primary hover:shadow-[0_0_16px_-3px_hsl(var(--primary)/0.25)]',
      )}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.4)] to-transparent opacity-60" />
      <Wand2 className="h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-110" />
      <span>Nie wiesz który plan?</span>
      <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', otwarty && 'rotate-180')} />
    </button>
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
   SUWAK PULI BYTE — NOWOCZESNY, DYNAMICZNY CYBER-GLASS STEPPER
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
    <div className="space-y-2.5 select-none">
      <div className="flex items-center justify-between h-6">
        <span className="text-xs font-medium text-muted-foreground">Byte miesięcznie:</span>
        <span className="text-sm font-bold tabular-nums flex items-center gap-1" style={{ color: kolor }}>
          <AnimNum value={progi[indeks].byte} />
          <span className="text-xs opacity-60">⟠</span>
        </span>
      </div>

      <div className="relative py-2.5 group">
        <input
          type="range"
          min={0}
          max={progi.length - 1}
          step={1}
          value={indeks}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 z-30 h-full w-full opacity-0 cursor-pointer"
          aria-label="Wybierz pulę Byte"
        />
        <div className="relative h-2 w-full rounded-full bg-foreground/[0.08] border border-foreground/[0.06] shadow-inner overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${akcentTlo(kolor, 45)}, ${kolor})`,
              boxShadow: `0 0 14px ${akcentTlo(kolor, 50)}`,
            }}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-1">
          <div className="relative w-full">
            {progi.map((p, i) => {
              const left = (i / (progi.length - 1)) * 100
              const jestAktywny = i <= indeks
              const jestBiezacy = i === indeks
              return (
                <div
                  key={p.byte}
                  className="absolute -translate-x-1/2 -translate-y-1/2 top-0 flex items-center justify-center transition-all duration-300"
                  style={{ left: `${left}%` }}
                >
                  {!jestBiezacy && (
                    jestAktywny ? (
                      <span
                        className="h-2 w-2 rounded-full transition-all duration-200"
                        style={{ backgroundColor: kolor, boxShadow: `0 0 8px ${akcentTlo(kolor, 80)}` }}
                      />
                    ) : (
                      <span className="h-2 w-2 rounded-full border border-foreground/25 bg-background/90 transition-all duration-200" />
                    )
                  )}
                  {jestBiezacy && (
                    <div
                      className="h-5 w-5 rounded-full transition-transform duration-200 group-hover:scale-110"
                      style={{
                        backgroundColor: kolor,
                        boxShadow: `0 0 0 3px ${akcentTlo(kolor, 30)}, 0 0 16px ${kolor}, 0 2px 6px rgba(0,0,0,0.7)`,
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Statyczny wariant wiersza Byte dla planów bez suwaka (Lite, Free) — spójna geometria i wysokość */
function ByteStaticRow({ plan, pulaByte, darmowy }: { plan: Plan; pulaByte: number | null; darmowy: boolean }) {
  if (darmowy || pulaByte === null) {
    return (
      <div className="space-y-2.5 select-none">
        <div className="h-6" />
        <div className="relative py-2.5">
          <div className="relative h-2 w-full rounded-full border border-dashed border-foreground/20 bg-foreground/[0.02]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5 select-none">
      <div className="flex items-center justify-between h-6">
        <span className="text-xs font-medium text-muted-foreground">Byte miesięcznie:</span>
        <span className="text-sm font-bold tabular-nums flex items-center gap-1" style={{ color: plan.kolor }}>
          <AnimNum value={pulaByte} />
          <span className="text-xs opacity-60">⟠</span>
        </span>
      </div>
      <div className="relative py-2.5">
        <div className="flex items-center gap-2">
          <div
            className="h-2 flex-1 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${akcentTlo(plan.kolor, 45)}, ${plan.kolor})`,
              boxShadow: `0 0 14px ${akcentTlo(plan.kolor, 40)}`,
            }}
          />
          <Lock
            className="shrink-0 opacity-85 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ height: '18px', width: '18px' }}
          />
          <div className="h-2 flex-1 rounded-full bg-foreground/[0.08] border border-foreground/[0.06]" />
        </div>
      </div>
    </div>
  )
}

function fmtTok(n: number): string {
  if (n >= 1_000_000_000) return `~${(n / 1_000_000_000).toFixed(1).replace('.', ',')} mld`
  if (n >= 1_000_000)     return `~${(n / 1_000_000).toFixed(1).replace('.', ',')} mln`
  if (n >= 1_000)         return `~${Math.round(n / 1_000)} tys.`
  return `~${n}`
}

/* ═══════════════════════════════════════════════════════════════
   BLOK "TO WYSTARCZY NA" — 100% wyrównane chipsy (identyczna wysokość)
   ═══════════════════════════════════════════════════════════════ */
function PanelZuzycia({
  byte, kolor, cena, darmowy, cloudStorage, rownolegleGeneracje, kontekst, pliki,
}: {
  kontekst: string
  pliki: string
  byte: number | null
  kolor: string
  cena?: number
  darmowy?: boolean
  cloudStorage: string
  rownolegleGeneracje: string | null
}) {
  // Private Cloud i równoległe generacje — te same wiersze co tokeny/grafiki
  // (wartość + etykieta + ikona), bez chipów/ramek, doklejane na końcu.
  const dodatkoweWiersze = (
    <>
      <div className="flex items-center gap-2 text-[13px]">
        <strong className="font-semibold tabular-nums text-foreground">{cloudStorage}</strong>
        <span className="text-muted-foreground flex-1">Private Cloud</span>
        <HardDrive className="h-3.5 w-3.5 shrink-0 opacity-40" style={{ color: akcentTlo(kolor, 80) }} />
      </div>
      {rownolegleGeneracje && (
        <div className="flex items-center gap-2 text-[13px]">
          <strong className="font-semibold tabular-nums text-foreground">{rownolegleGeneracje}</strong>
          <span className="text-muted-foreground flex-1">Równoległe generacje</span>
          <Layers className="h-3.5 w-3.5 shrink-0 opacity-40" style={{ color: akcentTlo(kolor, 80) }} />
        </div>
      )}
      <div className="flex items-center gap-2 text-[13px]">
        <strong className="font-semibold tabular-nums text-foreground">{kontekst}</strong>
        <span className="text-muted-foreground flex-1">Kontekst w czacie</span>
        <Brain className="h-3.5 w-3.5 shrink-0 opacity-40" style={{ color: akcentTlo(kolor, 80) }} />
      </div>
      <div className="flex items-center gap-2 text-[13px]">
        <strong className="font-semibold tabular-nums text-foreground">{pliki}</strong>
        <span className="text-muted-foreground flex-1">Przesyłanie plików</span>
        <Upload className="h-3.5 w-3.5 shrink-0 opacity-40" style={{ color: akcentTlo(kolor, 80) }} />
      </div>
    </>
  )

  if (darmowy || byte === null) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px]">
          <strong className="font-semibold text-foreground">Chat AI</strong>
          <span className="text-muted-foreground flex-1">z paczek Byte</span>
          <Sparkles className="h-3.5 w-3.5 opacity-40 text-muted-foreground shrink-0" />
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <strong className="font-semibold text-foreground">Rozmowy głosowe</strong>
          <span className="text-muted-foreground flex-1">z paczek Byte</span>
          <Coins className="h-3.5 w-3.5 opacity-40 text-muted-foreground shrink-0" />
        </div>
        {dodatkoweWiersze}
      </div>
    )
  }

  const zlPerByte = byte && byte > 0 && cena ? cena / byte : undefined
  const rows = przelicznikByte(byte, zlPerByte)

  return (
    <div className="flex flex-col gap-2">
      {rows.map(r => (
        <div key={r.label} className="flex items-center gap-2 text-[13px]">
          {r.isTokens ? (
            <>
              <strong className="font-semibold tabular-nums text-foreground">
                {r.value >= 1_000_000
                  ? <>~<AnimNum value={Math.round(r.value / 100_000) / 10} decimals={1} /> mln</>
                  : fmtTok(r.value)}
              </strong>
              <span className="text-muted-foreground flex-1">tokenów AI</span>
              <OpenAIIcon className="h-3.5 w-3.5 shrink-0 opacity-50" style={{ color: akcentTlo(kolor, 80) }} />
            </>
          ) : r.isImages ? (
            <>
              <strong className="font-semibold tabular-nums text-foreground">~<AnimNum value={r.value} /></strong>
              <span className="text-muted-foreground flex-1">grafik AI</span>
              <GeminiIcon className="h-3.5 w-3.5 shrink-0 opacity-50" style={{ color: akcentTlo(kolor, 80) }} />
            </>
          ) : 'isVoice' in r && r.isVoice ? (
            <>
              <strong className="font-semibold tabular-nums text-foreground">
                ~{r.value >= 120 ? <><AnimNum value={Math.floor(r.value / 60)} /> h</> : <><AnimNum value={r.value} /> min</>}
              </strong>
              <span className="text-muted-foreground flex-1">{r.label}</span>
              <r.icon className="h-3.5 w-3.5 shrink-0 opacity-40" style={{ color: akcentTlo(kolor, 80) }} />
            </>
          ) : (
            <>
              <strong className="font-semibold tabular-nums text-foreground">~<AnimNum value={r.value} /></strong>
              <span className="text-muted-foreground flex-1">{r.label}</span>
              <r.icon className="h-3.5 w-3.5 shrink-0 opacity-40" style={{ color: akcentTlo(kolor, 80) }} />
            </>
          )}
        </div>
      ))}
      {dodatkoweWiersze}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   KARTA PLANU — SPÓJNA Z DESIGNEM NEXTBYTE (rounded-2xl, CTA pod ceną)
   ═══════════════════════════════════════════════════════════════ */
function PlanCard({ plan, okres, podswietlony = false }: { plan: Plan; okres: Okres; podswietlony?: boolean }) {
  const [prog, setProg] = useState(0)
  const [rozwiniete, setRozwiniete] = useState(false)
  // Wszystkie cechy widoczne — długość listy ma rosnąć z planem
  const WIDOCZNE = 20
  const ukryte = (plan.cechy?.length ?? 0) - WIDOCZNE

  const konfiguracja = plan.progi?.[prog] ?? null
  const stalaCena = plan.cena
  const cenaBazowa = konfiguracja ? konfiguracja.miesiecznie : stalaCena ?? 0
  const cena = cenaZaOkres(cenaBazowa, okres)
  const darmowy = plan.cena === 0
  const wyroznione = plan.polecany || podswietlony
  const pulaByte = konfiguracja?.byte ?? plan.stalaPula
  const wartosci = (() => {
    if (!pulaByte || !cenaBazowa) return undefined
    const [tok, obr, glos] = przelicznikByte(pulaByte, cenaBazowa / pulaByte)
    return { pula: pulaByte, tokeny: tok.value, obrazy: obr.value, glosMin: glos.value }
  })()


  return (
    <div
      className={cn(
        'group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-6 sm:p-7 transition-all duration-300 backdrop-blur-xl',
        wyroznione
          ? 'border-primary/45 bg-[hsl(var(--card)/0.94)] shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.3)]'
          : 'border-foreground/[0.09] bg-[hsl(var(--card)/0.88)] hover:border-foreground/[0.2] hover:bg-[hsl(var(--card)/0.96)] shadow-lg',
      )}
    >
      {/* Specularna krawędź świetlna u góry karty */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      {/* Subtelna poświata akcentu u góry */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-36 opacity-70"
        style={{ background: `radial-gradient(ellipse 90% 100% at 50% 0%, ${akcentTlo(plan.kolor, 15)}, transparent 75%)` }}
      />

      <div>
        {/* Bez odznaki „Najlepsza oferta" i bez podpisów typu „Na start" —
            o wyborze planu ma decydować sama treść karty. */}

        {/* Tytuł & krótki opis — spójny blok */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2 min-h-[32px]">
            <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {plan.nazwa}
            </h3>
            {!darmowy && okres === 'rocznie' && (
              <span className="shrink-0 rounded-md bg-primary/15 px-2 py-0.5 font-sans text-[11.5px] font-bold text-primary">
                −{Math.round(RABAT_ROCZNY * 100)}%
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 h-4">{plan.opis}</p>
        </div>

        {/* Cena: czytelna i przejrzysta, identyczna wysokość */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 whitespace-nowrap h-10">
            <span className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              {darmowy ? (
                'Free'
              ) : (
                <AnimNum value={cena} decimals={cena % 1 !== 0 ? 2 : 0} />
              )}
            </span>

            {!darmowy && okres === 'rocznie' && cenaBazowa > cena && (
              <span className="font-heading text-xl font-semibold text-foreground/25 line-through decoration-foreground/30">
                {cenaBazowa.toLocaleString('pl-PL', {
                  minimumFractionDigits: cenaBazowa % 1 !== 0 ? 2 : 0,
                  maximumFractionDigits: 2,
                })}
              </span>
            )}

            {!darmowy && (
              <span className="text-base font-normal text-muted-foreground">zł/m</span>
            )}
          </div>

          <div className="mt-1 h-[36px] flex flex-col justify-center space-y-0.5 text-[11.5px]">
            {!darmowy && okres === 'rocznie' ? (
              <>
                <p className="text-muted-foreground font-light leading-tight">
                  Rozliczane rocznie — faktura <AnimNum value={cena * 12} /> PLN
                </p>
                <p className="font-medium text-primary leading-tight">
                  Oszczędzasz <AnimNum value={(cenaBazowa - cena) * 12} /> zł rocznie
                </p>
              </>
            ) : darmowy ? (
              <>
                <p className="text-muted-foreground font-light leading-tight">bez karty kredytowej</p>
                <p className="text-muted-foreground/60 font-light leading-tight">płatność tylko za zużyte Byte</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground font-light leading-tight">rozliczane miesięcznie</p>
                <p className="text-muted-foreground/60 font-light leading-tight">anulujesz w dowolnym momencie</p>
              </>
            )}
          </div>
        </div>

        {/* PRZYCISK CTA ZARAZ POD CENĄ — identyczna pozycja wertykalna */}
        <div className="mb-5">
          {plan.polecany ? (
            <GlowButton className="w-full justify-center h-10" icon={false}>
              {plan.cta || 'Wybierz plan'}
            </GlowButton>
          ) : (
            <GhostButton className="w-full justify-center h-10" icon={undefined}>
              {plan.cta || 'Wybierz plan'}
            </GhostButton>
          )}
        </div>

        {/* Suwak progów Byte / Pula Byte + "To wystarczy na" — 100% wyrównane w pionie */}
        <div className="mb-5 space-y-3">
          {plan.progi ? (
            <ByteSlider progi={plan.progi} indeks={prog} onChange={setProg} kolor={plan.kolor} />
          ) : (
            <ByteStaticRow plan={plan} pulaByte={pulaByte} darmowy={darmowy} />
          )}

          <p className="flex items-center gap-1.5 pt-1 text-[12px] font-semibold text-foreground">
            <Gift className="h-3.5 w-3.5 text-primary" />
            {darmowy ? 'Korzystasz, kiedy chcesz:' : <>Każdego miesiąca aż:</>}
          </p>
          <PanelZuzycia
            pliki={plan.pliki}
            byte={pulaByte}
            kolor={plan.kolor}
            cena={cenaBazowa}
            darmowy={darmowy}
            cloudStorage={plan.cloudStorage}
            rownolegleGeneracje={plan.rownolegleGeneracje}
            kontekst={plan.kontekst}
          />
        </div>

        {/* Lista cech — Premium/Ultimate pokazują tylko NOWE pozycje względem
            niższego planu (nagłówek dziedziczenia), zamiast fałszywie
            sugerować, że mają mniej albo powtarzać to co już wiadomo. */}
        {plan.cechy && plan.cechy.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-foreground/[0.08]">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/50 pb-1">
              {plan.dziedziczyZ ? `Wszystko z ${plan.dziedziczyZ}, plus:` : 'W pakiecie:'}
            </p>
            {plan.cechy.slice(0, WIDOCZNE).map(c => <CechaWiersz key={c.t} cecha={c} wartosci={wartosci} />)}
            {ukryte > 0 && (
              <Rozwijane otwarte={rozwiniete}>
                {plan.cechy.slice(WIDOCZNE).map(c => <CechaWiersz key={c.t} cecha={c} />)}
              </Rozwijane>
            )}
            {ukryte > 0 && (
              <button
                type="button"
                onClick={() => setRozwiniete(v => !v)}
                className="flex w-full items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              >
                {rozwiniete ? 'Pokaż mniej' : `+${ukryte} więcej`}
                <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', rozwiniete && 'rotate-180')} />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

const TON_PLAKIETKI: Record<TonPlakietki, string> = {
  blue: 'hsl(var(--primary))',
  green: 'hsl(var(--primary))',
  pink: 'hsl(var(--primary))',
  violet: 'hsl(var(--primary))',
  ghost: 'hsl(var(--foreground)/0.6)',
}

type WartosciProgu = { pula: number; tokeny: number; obrazy: number; glosMin: number }

/** Animowana liczba dla cech zależnych od progu — ta sama animacja co cena. */
function DynWartosc({ dyn, w }: { dyn: NonNullable<Cecha['dyn']>; w: WartosciProgu }) {
  if (dyn === 'pula') return <AnimNum value={w.pula} />
  if (dyn === 'obrazy') return <AnimNum value={w.obrazy} />
  if (dyn === 'tokeny') return <><AnimNum value={Math.round(w.tokeny / 100_000) / 10} decimals={1} /> mln</>
  return w.glosMin >= 120
    ? <><AnimNum value={Math.floor(w.glosMin / 60)} /> h</>
    : <><AnimNum value={w.glosMin} /> min</>
}

function CechaWiersz({ cecha, wartosci }: { cecha: Cecha; wartosci?: WartosciProgu }) {
  const jestGhost = cecha.badge?.ton === 'ghost'
  return (
    <div className="flex items-center gap-3 min-h-[34px] py-0.5">
      {/* Wszystkie pozycje w pełni widoczne — lista rośnie z planem */}
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-primary/35 bg-primary/10">
        <cecha.icon className="h-3.5 w-3.5 text-primary" />
      </span>
      <span className="flex-1 text-sm font-medium leading-snug text-foreground">
        {cecha.t.split(/\*\*(.+?)\*\*/g).map((cz, i) =>
          i % 2 ? (
            <strong key={i} className="font-semibold text-foreground">
              {cecha.dyn && wartosci && cz.includes('{v}')
                ? <>{cz.split('{v}')[0]}<DynWartosc dyn={cecha.dyn} w={wartosci} />{cz.split('{v}')[1]}</>
                : cz}
            </strong>
          ) : cz,
        )}
      </span>
      {cecha.badge && (
        <span
          className="shrink-0 self-center rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            color: TON_PLAKIETKI[cecha.badge.ton],
            background: jestGhost ? 'transparent' : akcentTlo(TON_PLAKIETKI[cecha.badge.ton], 15),
            borderColor: jestGhost ? 'hsl(var(--foreground)/0.18)' : akcentTlo(TON_PLAKIETKI[cecha.badge.ton], 30),
          }}
        >
          {cecha.badge.t}
        </span>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   COMPARE FEATURES — układ jak w cenniku Higgsfield

   - duże nazwy planów wyrównane do lewej, pod nimi cena i rozliczenie;
     żaden plan nie jest wyróżniony — porównanie ma mówić samo za siebie,
   - działy zawsze widoczne jako zwykłe nagłówki, bez ikon i zwijania;
     długie działy pokazują kilka pozycji i „Pokaż więcej",
   - wartości do lewej, ✓ / ✕, wiersze rozdzielone cienkimi liniami,
   - na telefonie zamiast czterech ściśniętych kolumn jest przełącznik
     planu — widać cechę i jedną kolumnę naraz.
   ═══════════════════════════════════════════════════════════════ */
type CompareGroup = { kategoria: string; rows: typeof PLAN_MACIERZ }

/**
 * Odstęp dla przyklejonego nagłówka tabeli porównania — liczony na żywo
 * względem realnego górnego paska nawigacji (a nie sztywnej stałej), żeby
 * nagłówek trzymał się dokładnie pod nim niezależnie od layoutu strony.
 *
 * UWAGA: position:sticky liczy `top` od PADDING-BOXA kontenera przewijania,
 * a nie od jego krawędzi. Kontener (main) ma własny padding-top pod stały
 * navbar, więc bez odjęcia go offset dublował się i pasek zatrzymywał się
 * o tę wartość za nisko — nad nim przewijały się wtedy widoczne wiersze.
 */
function useStickyOffset() {
  const [top, setTop] = useState(0)
  useEffect(() => {
    const calc = () => {
      const nav = document.querySelector('.nb-homepage-nav') || document.querySelector('[data-navbar]')
      const scroller = document.querySelector('main.overflow-y-auto')
      if (nav && scroller) {
        const paddingTop = parseFloat(getComputedStyle(scroller).paddingTop) || 0
        const scrollportTop = scroller.getBoundingClientRect().top + paddingTop
        setTop(nav.getBoundingClientRect().bottom - scrollportTop)
      } else if (nav) {
        setTop(nav.getBoundingClientRect().bottom)
      }
    }
    calc()
    const ro = new ResizeObserver(calc)
    const nav = document.querySelector('.nb-homepage-nav') || document.querySelector('[data-navbar]')
    if (nav) ro.observe(nav)
    window.addEventListener('resize', calc)
    return () => { ro.disconnect(); window.removeEventListener('resize', calc) }
  }, [])
  return top
}

function CompareFeaturesAccordion({ okres }: { okres: Okres }) {
  const stickyTop = useStickyOffset()

  const groups = React.useMemo<CompareGroup[]>(() => {
    const result: CompareGroup[] = []
    let current: CompareGroup | null = null
    for (const row of PLAN_MACIERZ) {
      if (row.kategoria) {
        current = { kategoria: row.kategoria, rows: [] }
        result.push(current)
      }
      if (current) current.rows.push(row)
    }
    return result
  }, [])

  /** Ile pozycji działu widać, zanim ktoś kliknie „Pokaż więcej". */
  const POKAZ = 4
  const [pelne, setPelne] = useState<Set<string>>(() => new Set())
  const przelaczPelne = (kat: string) =>
    setPelne(prev => {
      const next = new Set(prev)
      next.has(kat) ? next.delete(kat) : next.add(kat)
      return next
    })

  // Na start otwarte tylko dwa główne działy (rozliczenia i tokeny);
  // reszta czeka zwinięta jako same nagłówki, które da się rozwinąć.
  const startowe = () => new Set(groups.slice(0, 2).map(g => g.kategoria))
  const [otwarte, setOtwarte] = useState<Set<string>>(startowe)
  const przelaczDzial = (kat: string) =>
    setOtwarte(prev => {
      const next = new Set(prev)
      next.has(kat) ? next.delete(kat) : next.add(kat)
      return next
    })

  // Działy, w których cokolwiek jest schowane pod „Pokaż więcej".
  // Chowanie jednej pozycji nie ma sensu — taki dział pokazujemy od razu w całości.
  const zUkrytymi = groups.filter(g => g.rows.length - POKAZ > 1).map(g => g.kategoria)
  const wszystkoWidac =
    otwarte.size === groups.length && zUkrytymi.every(k => pelne.has(k))

  const tabelaRef = useRef<HTMLDivElement>(null)
  const przelaczWszystko = () => {
    if (wszystkoWidac) {
      setOtwarte(startowe())
      setPelne(new Set())
      requestAnimationFrame(() => tabelaRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
    } else {
      setOtwarte(new Set(groups.map(g => g.kategoria)))
      setPelne(new Set(zUkrytymi))
    }
  }

  // Plan widoczny na telefonie. Domyślnie polecany — to jego porównanie
  // najczęściej kogoś interesuje.
  const [planMobile, setPlanMobile] = useState(() => Math.max(0, PLANY.findIndex(p => p.polecany)))

  // Kolumny liczone z PLANY — ceny w nagłówku nie mogą rozjechać się z kartami.
  const planCols = PLANY.map(p => {
    const baza = p.cena ?? p.progi?.[0]?.miesiecznie ?? 0
    const kwota = cenaZaOkres(baza, okres)
    const kwotaTekst = kwota.toLocaleString('pl-PL', {
      minimumFractionDigits: kwota % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    })
    const darmowy = p.cena === 0
    return {
      name: darmowy ? 'Free' : p.nazwa,
      cena: darmowy ? 'Za darmo' : `${p.progi ? 'od ' : ''}${kwotaTekst} zł/mies.`,
      opis: darmowy ? 'Płacisz tylko za zużycie' : okres === 'rocznie' ? 'Rozliczane rocznie' : 'Rozliczane miesięcznie',
    }
  })

  // Telefon: cecha + jedna kolumna planu. Od `sm` — pełna tabela.
  const colGrid = 'grid grid-cols-[1.4fr_1fr] sm:grid-cols-[1.6fr_repeat(4,1fr)] gap-x-6'
  /** Komórka planu: na telefonie widać tylko wybrany plan. */
  const komorkaPlanu = (i: number) => cn(i !== planMobile && 'hidden sm:flex')

  return (
    <div ref={tabelaRef} style={{ scrollMarginTop: `${stickyTop + 16}px` }}>

      {/* ── TELEFON: przełącznik planu zamiast czterech ściśniętych kolumn ── */}
      <div className="mb-4 grid grid-cols-4 gap-1 rounded-xl border border-foreground/[0.09] p-1 sm:hidden">
        {planCols.map((col, i) => (
          <button
            key={col.name}
            type="button"
            onClick={() => setPlanMobile(i)}
            className={cn(
              'rounded-lg py-2 font-sans text-[12px] font-semibold transition-colors cursor-pointer',
              planMobile === i ? 'bg-foreground/[0.08] text-foreground' : 'text-muted-foreground/60',
            )}
          >
            {col.name}
          </button>
        ))}
      </div>

      {/* ── NAGŁÓWEK PLANÓW — przyklejony pod paskiem nawigacji. Tło musi być
             w pełni kryjące i bez backdrop-blur (blur na sticky dawał artefakt
             na krawędzi), a przodkowie nie mogą mieć overflow innego niż visible. ── */}
      <div
        className={cn(colGrid, 'sticky z-20 border-b border-foreground/[0.08] bg-background pb-5 pt-4')}
        style={{ top: `${stickyTop}px` }}
      >
        <div />
        {planCols.map((col, ci) => (
          <div key={col.name} className={cn('flex flex-col items-start', komorkaPlanu(ci))}>
            <span className="font-heading text-[20px] font-semibold leading-tight tracking-[-0.3px] text-foreground">
              {col.name}
            </span>
            <span className="mt-2 font-sans text-[14px] font-medium tabular-nums text-foreground/85">{col.cena}</span>
            <span className="font-sans text-[12.5px] text-muted-foreground/60">{col.opis}</span>
          </div>
        ))}
      </div>

      {/* ── DZIAŁY — rozwijane nagłówki ──
             Nagłówek działu to jeden szeroki przycisk: po prawej zawsze stoi
             „Rozwiń"/„Zwiń" ze strzałką, a najechanie podświetla całą linię,
             więc od razu widać, że dział da się otworzyć. Treść otwiera się
             płynnie (grid-template-rows 0fr → 1fr), więc lista nie „skacze". */}
      {groups.map((group, gi) => {
        const otwarty = otwarte.has(group.kategoria)
        const rozwiniety = pelne.has(group.kategoria)
        const ukryte = group.rows.length - POKAZ > 1 ? group.rows.length - POKAZ : 0
        const stale = ukryte ? group.rows.slice(0, POKAZ) : group.rows
        const dodatkowe = ukryte ? group.rows.slice(POKAZ) : []
        const idTresci = `porownanie-dzial-${gi}`
        const wiersz = (r: (typeof group.rows)[number], klucz: string, styl?: React.CSSProperties) => (
          <div key={klucz} style={styl} className={cn(colGrid, 'items-center border-t border-foreground/[0.07] py-4')}>
            <span className="font-sans text-[14.5px] leading-snug text-foreground/90">{r.f}</span>
            {r.v.map((v, vi) => (
              <div key={vi} className={cn('flex items-center', komorkaPlanu(vi))}>
                {v === true ? (
                  <Check className="h-4 w-4 text-foreground/85" strokeWidth={2} />
                ) : v === false ? (
                  <X className="h-4 w-4 text-foreground/35" strokeWidth={1.75} />
                ) : (
                  <span className="font-sans text-[14px] leading-tight tabular-nums text-foreground/85">{v}</span>
                )}
              </div>
            ))}
          </div>
        )
        return (
          <section key={group.kategoria} className="border-b border-foreground/[0.12]">
            <button
              type="button"
              onClick={() => przelaczDzial(group.kategoria)}
              aria-expanded={otwarty}
              aria-controls={idTresci}
              className="group flex w-full items-center justify-between gap-4 py-6 text-left cursor-pointer"
            >
              <span className="flex min-w-0 items-baseline gap-3">
                <span className="font-mono text-[11px] font-medium tracking-[0.16em] text-primary/80">
                  {String(gi + 1).padStart(2, '0')}
                </span>
                <span className="truncate font-heading text-[22px] font-semibold tracking-[-0.4px] text-foreground transition-colors group-hover:text-primary">
                  {group.kategoria}
                </span>
                <span className="hidden shrink-0 font-sans text-[12.5px] text-muted-foreground/50 sm:inline">
                  {group.rows.length} {group.rows.length === 1 ? 'pozycja' : 'pozycji'}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2 font-sans text-[13px] font-medium text-muted-foreground/70 transition-colors group-hover:text-primary">
                <span className="hidden sm:inline">{otwarty ? 'Zwiń' : 'Rozwiń'}</span>
                <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', otwarty && 'rotate-180')} />
              </span>
            </button>

            <div
              id={idTresci}
              className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ gridTemplateRows: otwarty ? '1fr' : '0fr' }}
              aria-hidden={!otwarty}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  className="pb-4 transition-opacity duration-300"
                  style={{ opacity: otwarty ? 1 : 0 }}
                >
                  {stale.map((r, ri) => wiersz(r, r.f + ri))}

                  {dodatkowe.length > 0 && (
                    <div
                      className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ gridTemplateRows: rozwiniety ? '1fr' : '0fr' }}
                      aria-hidden={!rozwiniety}
                    >
                      <div className="min-h-0 overflow-hidden">
                        {dodatkowe.map((r, ri) =>
                          wiersz(r, r.f + 'x' + ri, {
                            opacity: rozwiniety ? 1 : 0,
                            transform: rozwiniety ? 'translateY(0)' : 'translateY(-6px)',
                            transition: 'opacity 320ms ease, transform 420ms cubic-bezier(0.22,1,0.36,1)',
                            transitionDelay: rozwiniety ? `${80 + ri * 45}ms` : '0ms',
                          }),
                        )}
                      </div>
                    </div>
                  )}

                  {ukryte > 0 && (
                    <button
                      type="button"
                      onClick={() => przelaczPelne(group.kategoria)}
                      className="mt-1 inline-flex items-center gap-2 border-t border-transparent py-3 font-sans text-[14px] text-muted-foreground/70 transition-colors hover:text-foreground cursor-pointer"
                    >
                      <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', rozwiniety && 'rotate-180')} />
                      {rozwiniety ? 'Pokaż mniej' : `Pokaż więcej (${ukryte})`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )
      })}

      {!wszystkoWidac && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={przelaczWszystko}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-foreground/[0.12] px-5 font-heading text-[13px] font-semibold text-foreground/85 transition-colors hover:border-primary/45 hover:text-primary cursor-pointer"
          >
            Porównaj wszystkie funkcje
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <p className="mt-4 text-center font-sans text-[11.5px] font-light text-foreground/35">
        Przeliczniki to szacunek przy założeniu, że cała miesięczna pula Byte trafia w całości do jednego modelu — wg jego referencyjnej ceny.
        Dla planów z suwakiem liczone dla domyślnego, najniższego progu puli.
      </p>
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
   KREATOR DOBORU PLANU — odwzorowanie kreatora z cennika
   produkcyjnego. Kluczowa różnica wobec poprzedniej wersji: to nie
   jest już scoring na wagach, tylko realny rachunek. Suwaki liczą
   miesięczne zużycie w Byte po stawkach z data.ts, a plan wychodzi
   z tego, która pula faktycznie pokrywa wyliczone zużycie.
   ═══════════════════════════════════════════════════════════════ */

/** Co użytkownik chce robić. Dwie pierwsze pozycje mają własny suwak w kroku 2
 *  (tam podaje się dokładną liczbę), pozostałe dokładają do rachunku typowe
 *  miesięczne zużycie swojej kategorii — `dodatek` w Byte. */
const OPCJE_UZYCIA = [
  { id: 'rozmowy', icon: MessageSquare, t: 'Pisanie & Chat', tag: 'GPT-5, Claude, Gemini', dodatek: 0 },
  { id: 'grafika', icon: ImagePlus, t: 'Grafika & Studio', tag: 'FLUX, Midjourney 4K', dodatek: 0 },
  { id: 'asystent', icon: Bot, t: 'Asystent Zadań', tag: 'Autonomiczne akcje', dodatek: 20 * KOSZT_BYTE.zadanieAsystenta },
  { id: 'analizy', icon: FileSearch, t: 'Deep Research', tag: 'Synteza i raporty', dodatek: 15 * KOSZT_BYTE.mocnyModel },
  { id: 'notatki', icon: Layers, t: 'Notatki & Plany', tag: 'Harmonogram i baza', dodatek: 10 * KOSZT_BYTE.zadanieAsystenta },
  { id: 'dokumenty', icon: FileStack, t: 'Analiza Plików', tag: 'PDF, CSV, docx, kod', dodatek: 20 * KOSZT_BYTE.zadanieAsystenta },
] as const

/** Suwaki zużycia — dopasowują dokładną liczbę operacji.
 *  `stawka` to koszt jednej operacji w Byte. */
const SUWAKI_ZUZYCIA = [
  { id: 'rozmowy', icon: MessageSquare, etykieta: 'Tokeny AI', jednostka: 'za 1 mln tokenów', stawka: KOSZT_BYTE.tokeny1mlnTerra, max: 30, krok: 0.5, domyslnie: 1 },
  { id: 'obrazy', icon: ImagePlus, etykieta: 'Obrazy i grafiki', jednostka: 'za obraz', stawka: KOSZT_BYTE.obraz, max: 500, krok: 5, domyslnie: 0 },
] as const

/** Suwak liczbowy w stylu produkcyjnym: nazwa + pigułka z wartością po lewej,
 *  koszt w Byte po prawej, pod spodem stawka jednostkowa. */
function SuwakZuzycia({
  icon: Icon, etykieta, wartosc, max, krok, koszt, stawka, jednostka, onChange,
}: {
  icon: typeof MessageSquare
  etykieta: string
  wartosc: number
  max: number
  krok: number
  koszt: number
  stawka: number
  jednostka: string
  onChange: (v: number) => void
}) {
  const pct = (wartosc / max) * 100
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
          <span className="text-[13px] font-medium text-foreground">{etykieta}</span>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-primary">
            {etykieta === 'Tokeny AI' ? `${wartosc.toLocaleString('pl-PL')} mln` : wartosc}
          </span>
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground/80">{koszt} ⟠</span>
      </div>

      <input
        type="range"
        min={0}
        max={max}
        step={krok}
        value={wartosc}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={etykieta}
        className="nb-zakres mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full"
        style={{ background: `linear-gradient(90deg, hsl(var(--primary)) ${pct}%, hsl(var(--foreground)/0.1) ${pct}%)` }}
      />

      <p className="mt-1 text-[10.5px] text-muted-foreground/60">{stawka} ⟠ {jednostka}</p>
    </div>
  )
}

function PlanFinder({ onWybierz, okres }: { onWybierz: (id: string) => void; okres: Okres }) {
  const [wybrane, setWybrane] = useState<Set<string>>(() => new Set(['rozmowy']))
  const [ilosci, setIlosci] = useState<Record<string, number>>(() => ({
    rozmowy: 1,
    obrazy: 0,
  }))
  const [mocne, setMocne] = useState(false)
  const [skad, setSkad] = useState(false)

  const przelacz = (id: string) => {
    setWybrane(prev => {
      const nast = new Set(prev)
      const wlaczony = !nast.has(id)
      if (wlaczony) {
        nast.add(id)
        if (id === 'rozmowy') {
          setIlosci(il => ({ ...il, rozmowy: Math.max(1, il.rozmowy + 1) }))
        } else if (id === 'grafika') {
          setIlosci(il => ({ ...il, obrazy: Math.max(25, il.obrazy + 25) }))
        }
      } else {
        nast.delete(id)
        if (id === 'rozmowy') {
          setIlosci(il => ({ ...il, rozmowy: Math.max(0, il.rozmowy - 1) }))
        } else if (id === 'grafika') {
          setIlosci(il => ({ ...il, obrazy: Math.max(0, il.obrazy - 25) }))
        }
      }
      return nast
    })
  }

  const zmienSuwak = (id: string, v: number) => {
    setIlosci(prev => ({ ...prev, [id]: v }))
    setWybrane(prev => {
      const nast = new Set(prev)
      const optId = id === 'obrazy' ? 'grafika' : id
      if (v > 0) nast.add(optId)
      else nast.delete(optId)
      return nast
    })
  }

  // Tryb "mocniejsze modele" przelicza tokeny po cenie Claude Opus 5 zamiast GPT-5.6 Terra
  const pozycje = SUWAKI_ZUZYCIA.map(s => {
    const stawka = s.id === 'rozmowy' && mocne ? KOSZT_BYTE.tokeny1mlnOpus : s.stawka
    return { ...s, stawkaAktualna: stawka, koszt: Math.round(ilosci[s.id] * stawka) }
  })

  // Zaznaczone kategorie bez własnego suwaka dokładają swoje typowe zużycie.
  const dodatki = OPCJE_UZYCIA.filter(o => wybrane.has(o.id) && o.dodatek > 0)

  const zuzycie =
    pozycje.reduce((sum, p) => sum + p.koszt, 0) +
    dodatki.reduce((sum, o) => sum + o.dodatek, 0)

  // Rekomendacja: najtańszy próg, którego pula pokrywa wyliczone zużycie.
  const kandydaci = PLANY.flatMap(p => (p.progi ?? []).map(prog => ({ plan: p, prog })))
    .sort((a, b) => a.prog.miesiecznie - b.prog.miesiecznie)

  const trafiony = kandydaci.find(k => k.prog.byte >= zuzycie)
  const wybor = zuzycie === 0 ? null : (trafiony ?? kandydaci[kandydaci.length - 1])

  const plan = wybor?.plan ?? PLANY[0]
  const prog = wybor?.prog ?? null
  const zapas = prog ? prog.byte - zuzycie : 0
  const pokrycie = prog ? Math.min((zuzycie / prog.byte) * 100, 100) : 0
  const cena = cenaZaOkres(prog?.miesiecznie ?? 0, okres)

  return (
    <FadeIn className="mx-auto max-w-4xl">
      <div className="relative">
        {/* Górna belka kreatora */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-foreground/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Wand2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading text-[16px] font-bold text-foreground leading-tight">
                Inteligentny dobór planu
              </h2>
              <p className="text-[12px] text-muted-foreground/70">
                Wybierz swoje zastosowania — dopasujemy optymalny pakiet Byte
              </p>
            </div>
          </div>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground/60">
            Automatyczna kalkulacja
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_310px] items-start">
          {/* ── lewa kolumna: jedna karta — te same cienie i światło co kafelki planów (PlanCard).
               UWAGA: odstęp między krokami trzyma wewnętrzny wrapper, a NIE sama karta. Gdy
               `space-y-5` siedziało na karcie, Tailwind dokładał margin-top każdemu dziecku poza
               pierwszym — łącznie z warstwą poświaty, która mimo `absolute top-0` startowała
               20px niżej i rysowała widoczną linię odcięcia u góry. ── */}
          <div className="relative overflow-hidden rounded-2xl border border-foreground/[0.07] bg-[hsl(var(--card)/0.9)] p-5 backdrop-blur-xl shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.3)]">
            {/* Specularna krawędź świetlna u góry — jak w PlanCard */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            {/* Subtelna poświata akcentu u góry — jak w PlanCard */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-36 opacity-70"
              style={{ background: 'radial-gradient(ellipse 90% 100% at 50% 0%, hsl(var(--primary)/0.15), transparent 75%)' }}
            />

            <div className="space-y-5">
            {/* KROK 1: Kafelki zastosowań */}
            <div className="space-y-2.5">
              <div className="flex h-6 items-center justify-between">
                <span className="font-heading text-[13px] font-semibold text-foreground flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-bold text-primary">1</span>
                  Co chcesz robić?
                </span>
                <span className="text-[11px] text-muted-foreground/60">Wybierz dowolną liczbę</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {OPCJE_UZYCIA.map(o => {
                  const on = wybrane.has(o.id)
                  const Icon = o.icon
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => przelacz(o.id)}
                      aria-pressed={on}
                      className={cn(
                        'group relative flex flex-col justify-between rounded-xl p-3.5 text-left transition-all duration-200 cursor-pointer select-none',
                        'border min-h-[94px] backdrop-blur-md',
                        on
                          ? 'border-primary/60 bg-primary/[0.08] shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.25)]'
                          : 'border-white/[0.08] bg-card/60 shadow-sm hover:border-white/20 hover:bg-card/90 hover:shadow-md hover:-translate-y-0.5',
                      )}
                    >
                      {/* Górny rząd: ikona w kapsułce i wskaźnik zaznaczenia */}
                      <div className="flex items-center justify-between w-full">
                        <div
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-200',
                            on
                              ? 'border-primary/40 bg-primary/20 text-primary'
                              : 'border-white/[0.08] bg-white/[0.03] text-muted-foreground group-hover:text-foreground group-hover:border-white/15',
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <div
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all',
                            on
                              ? 'border-primary bg-primary text-background shadow-[0_0_8px_hsl(var(--primary)/0.6)]'
                              : 'border-white/20 bg-white/[0.02] group-hover:border-white/35',
                          )}
                        >
                          {on && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                        </div>
                      </div>

                      {/* Dolna treść kafelka */}
                      <div className="mt-2.5 space-y-0.5">
                        <p className={cn(
                          'font-heading text-[13px] font-semibold leading-tight transition-colors',
                          on ? 'text-foreground' : 'text-foreground/90 group-hover:text-foreground',
                        )}>
                          {o.t}
                        </p>
                        <p className="font-mono text-[9.5px] text-muted-foreground/60 tracking-tight leading-tight">
                          {o.tag}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="h-px bg-foreground/[0.08]" />

            {/* KROK 2: Precyzyjne doprecyzowanie (suwaki i jakość) — bez własnej karty, bo mieści się już we wspólnej */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading text-[13px] font-semibold text-foreground flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 font-mono text-[10.5px] font-bold text-primary">2</span>
                  Precyzyjne dopasowanie
                </span>
                <span className="text-[11px] text-muted-foreground/60">Opcjonalnie</span>
              </div>

              <div className="space-y-4 pt-1">
                {pozycje.map(s => (
                  <SuwakZuzycia
                    key={s.id}
                    icon={s.icon}
                    etykieta={s.etykieta}
                    wartosc={ilosci[s.id]}
                    max={s.max}
                    krok={s.krok}
                    koszt={s.koszt}
                    stawka={s.stawkaAktualna}
                    jednostka={s.jednostka}
                    onChange={v => zmienSuwak(s.id, v)}
                  />
                ))}
              </div>

              {/* Tryb mocniejszych modeli */}
              <div className="border-t border-foreground/[0.08] pt-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={mocne}
                  onClick={() => setMocne(v => !v)}
                  className="flex w-full items-center justify-between gap-3 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Gauge className={cn('h-4 w-4 transition-colors', mocne ? 'text-primary' : 'text-foreground/40')} />
                    <div>
                      <p className="text-[12.5px] font-medium text-foreground">Mocniejsze modele</p>
                      <p className="text-[10.5px] text-muted-foreground/60">
                        Przelicznik: {mocne ? 'Claude Opus 5' : 'GPT-5.6 Terra'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200',
                      mocne ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : 'bg-foreground/15',
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full bg-background transition-transform duration-200 shadow-sm"
                      style={{ transform: mocne ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </span>
                </button>
              </div>
            </div>
            </div>
          </div>

          {/* ── prawa kolumna: zwięzła propozycja planu ── */}
          <div className="lg:sticky lg:top-6 space-y-2.5">
            <div className="flex h-6 items-center justify-between">
              <span className="font-heading text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Rekomendowany plan
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground/60">
                Optymalny wybór
              </span>
            </div>

            <div
              className="relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.3)] backdrop-blur-xl"
              style={{
                borderColor: akcentTlo(plan.kolor, 35),
                background: `linear-gradient(160deg, ${akcentTlo(plan.kolor, 12)}, hsl(var(--card)/0.96))`,
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />

              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-heading text-[24px] font-bold leading-none tracking-tight" style={{ color: plan.kolor }}>
                  {plan.nazwa}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-[28px] font-bold leading-none text-foreground">
                    <AnimNum value={cena} />
                  </span>
                  <span className="text-xs text-muted-foreground">zł/m</span>
                </div>
              </div>

              <p className="mt-1 text-[11.5px] text-muted-foreground/70">
                {prog ? 'Pula Byte odnawiana co miesiąc' : 'Zacznij bez podawania karty'}
              </p>
              {prog && okres === 'rocznie' && (
                <p className="text-[11px] text-primary font-medium">
                  faktura roczna: <AnimNum value={cena * 12} /> PLN
                </p>
              )}

              {/* Pasek pokrycia zużycia */}
              <div className="mt-4 rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] p-3">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-muted-foreground">Szacowane zużycie:</span>
                  <span className="font-bold tabular-nums" style={{ color: plan.kolor }}>
                    <AnimNum value={zuzycie} /> {prog ? `/ ${prog.byte.toLocaleString('pl-PL')} ⟠` : '⟠'}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.08]">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${pokrycie}%`, background: plan.kolor }}
                  />
                </div>
                <p className="mt-1.5 text-[10.5px] text-muted-foreground/60">
                  {prog
                    ? `Zostaje ${zapas.toLocaleString('pl-PL')} ⟠ wolnego zapasu`
                    : 'Zacznij za darmo i doładuj Byte w razie potrzeby'}
                </p>
              </div>

              <GlowButton className="mt-4 w-full justify-center text-[13px] py-2.5" icon={false} onClick={() => onWybierz(plan.id)}>
                <Sparkles className="h-3.5 w-3.5" />
                Wybieram {plan.nazwa}
              </GlowButton>

              {/* Opcjonalne rozwinięcie rozbicia */}
              <button
                type="button"
                onClick={() => setSkad(v => !v)}
                aria-expanded={skad}
                className="mt-3 flex w-full items-center justify-center gap-1.5 py-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              >
                {skad ? 'Ukryj podsumowanie' : 'Rozwiń podsumowanie Byte'}
                <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', skad && 'rotate-180')} />
              </button>

              {skad && (
                <div className="mt-2 animate-tab-in space-y-1.5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] p-2.5 text-[10.5px]">
                  {pozycje.filter(s => s.koszt > 0).map(s => (
                    <div key={s.id} className="flex items-center justify-between gap-2 text-muted-foreground">
                      <span>{s.etykieta} ({ilosci[s.id]}×)</span>
                      <span className="font-semibold text-foreground">{s.koszt} ⟠</span>
                    </div>
                  ))}
                  {dodatki.map(o => (
                    <div key={o.id} className="flex items-center justify-between gap-2 text-muted-foreground">
                      <span>{o.t}</span>
                      <span className="font-semibold text-foreground">{o.dodatek} ⟠</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-2 border-t border-foreground/[0.08] pt-1.5 font-bold">
                    <span className="text-foreground">Suma</span>
                    <span style={{ color: plan.kolor }}>{zuzycie} ⟠</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BYTE STACK — grafika do sekcji "Jedna waluta. Pełna kontrola.":
   moneta PLN u dołu, nad nią rozstrzeliwują się jednostki Byte w miarę
   scrollowania — ten sam pomysł co exploded-view moduły na stronie
   głównej (izometryczne warstwy, przerywane linie projekcyjne), ale
   BEZ nieskończonej pętli rAF. Postęp scrolla liczy się tylko wtedy,
   gdy sekcja faktycznie jest w viewport: IntersectionObserver włącza
   i wyłącza listener, więc poza ekranem nic się nie liczy. Cennik już
   raz ucierpiał na czymś spiętym ze scrollem bez przerwy — stąd ta
   ostrożność.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   ZNAK BYTE, KTÓRY SIĘ GENERUJE
   Jeden symbol zamiast diagramu sieci: kontur ⟠ stoi w miejscu jak
   naczynie, a w środku podnosi się świecący poziom — wartość, która
   rośnie. Pętla 0→100%, krótki postój na pełni, od nowa. Poziom
   liczy się jako pojedynczy stan (setInterval co 100ms, jak licznik
   tokenów w HomePage3Blocks), a granicę wypełnienia rysuje jeden
   gradient z twardym progiem — bez masek i osobnych warstw.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   GENEROWANIE ZNAKU BYTE ZGODNIE ZE SCROLLEM (OD GÓRY DO DOŁU)
   W miarę przewijania strony symbol Byte ⟠ materializuje się od
   górnego wierzchołka do dolnego, prowadzony laserową wiązką.
   ═══════════════════════════════════════════════════════════════ */
function useElementScrollProgress(ref: React.RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1)
      return
    }

    let last = -1
    const read = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 800
      // Początek materializacji gdy element wchodzi od dołu (82% vh),
      // pełna synteza gdy zbliża się do środka ekranu (40% vh)
      const start = vh * 0.82
      const end = vh * 0.40
      const raw = (start - rect.top) / (start - end)
      const clamped = Math.max(0, Math.min(1, raw))
      const q = Math.round(clamped * 200) / 200
      if (q !== last) { last = q; setProgress(q) }
    }

    // Odpytywanie co 80ms zamiast pętli rAF — dziesięć-kilkanaście kroków
    // na sekundę wystarczy oku (patrz useTokenTicker wyżej), a działa
    // niezawodnie nawet tam, gdzie rAF bywa wstrzymywany przez hosta.
    // Liczy TYLKO gdy sekcja jest w okolicy kadru — IntersectionObserver
    // włącza i wyłącza interwał. Bez tego zwykły `window` 'scroll' nigdy by
    // się nie odpalił: w hoście podglądu przewija się WEWNĘTRZNY kontener
    // (main.overflow-y-auto), nie window, więc `progress` zamrażał się
    // na 0 po pierwszym renderze.
    let ivId = 0
    let inViewRef = false
    const io = new IntersectionObserver((entries) => {
      const inView = entries[0]?.isIntersecting ?? true
      inViewRef = inView
      if (inView && !ivId) ivId = window.setInterval(read, 80)
      if (!inView && ivId) { clearInterval(ivId); ivId = 0 }
    }, { rootMargin: '300px 0px' })
    io.observe(el)

    // Ścieżka zapasowa: scroll na window w fazie capture łapie też przewijanie
    // kontenerów potomnych — przydaje się tam, gdzie interwał akurat jeszcze
    // nie zdążył odpytać.
    const onScroll = () => { if (inViewRef) read() }
    read()
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      io.disconnect()
      if (ivId) clearInterval(ivId)
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onScroll)
    }
  }, [ref])

  return progress
}

// Geometria znaku Byte ⟠ — cztery wierzchołki diamentu plus pozioma poprzeczka:
// góra (0,-100), prawy (55,0), dół (0,100), lewy (-55,0).
// Jedna nieprzerwana ścieżka pióra: prawy → góra → lewy → dół → prawy → lewy.
// Domyka zewnętrzny obrys i na końcu przecina go poprzeczką — bez podnoszenia
// pióra, każda krawędź narysowana dokładnie raz (ścieżka Eulera na tym grafie:
// prawy i lewy mają nieparzysty stopień, więc to jedyne poprawne krańce).
const BYTE_EDGE = Math.hypot(55, 100)
const BYTE_PATH_LEN = BYTE_EDGE * 4 + 110
const BYTE_PATH_D = 'M 55,0 L 0,-100 L -55,0 L 0,100 L 55,0 L -55,0'

function ByteGeneratingGlyph() {
  const containerRef = useRef<HTMLDivElement>(null)
  const progress = useElementScrollProgress(containerRef)
  const dashOffset = BYTE_PATH_LEN * (1 - progress)

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[380px] aspect-[300/360] mx-auto flex items-center justify-center select-none"
    >
      {/* Poświata tła narastająca wraz z generowaniem symbolu */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[340px] w-[340px] rounded-full blur-3xl transition-opacity duration-300"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary)/0.25) 0%, transparent 70%)',
          opacity: 0.25 + progress * 0.75,
        }}
      />

      <svg
        viewBox="0 0 300 360"
        className="relative z-10 h-full w-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="byteGlyphGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(150, 155)">
          {/* ════ ZNAK BYTE — rysowany jednym ciągłym ruchem pióra, scroll steruje długością kreski ════ */}
          <path
            d={BYTE_PATH_D}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={BYTE_PATH_LEN}
            strokeDashoffset={dashOffset}
            filter="url(#byteGlyphGlow)"
          />
          {/* Biały rdzeń specularny — ta sama ścieżka, węższa kreska na wierzchu */}
          <path
            d={BYTE_PATH_D}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeOpacity="0.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={BYTE_PATH_LEN}
            strokeDashoffset={dashOffset}
          />
        </g>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ROZWIJANE — animacja do auto-wysokości. Sztuczka z grid 0fr↔1fr
   nie zwija tej zawartości (ślad po ResizeObserverze w środku), więc
   wysokość mierzymy jawnie, tak samo jak robi to FaqRow wyżej.
   ═══════════════════════════════════════════════════════════════ */
function Rozwijane({ otwarte, children }: { otwarte: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [h, setH] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setH(el.scrollHeight))
    ro.observe(el)
    setH(el.scrollHeight)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      className="overflow-hidden"
      style={{
        height: otwarte ? h : 0,
        opacity: otwarte ? 1 : 0,
        transition: 'height .45s cubic-bezier(.22,1,.36,1), opacity .3s ease',
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STRONA CENNIKA
   ═══════════════════════════════════════════════════════════════ */
export function CennikPage({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  // Domyślnie rozliczenie roczne — pokazuje niższą cenę miesięczną i od razu
  // komunikuje oszczędność, zamiast startować od wyższej liczby.
  const [okres, setOkres] = useState<Okres>('rocznie')
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [dobor, setDobor] = useState(false)
  const [rekomendacja, setRekomendacja] = useState<string | null>(null)
  const byteRef = useRef<HTMLDivElement>(null)
  const kartyRef = useRef<HTMLDivElement>(null)

  const wybierzRekomendacje = (id: string) => {
    setRekomendacja(id)
    requestAnimationFrame(() => kartyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }

  return (
    <div className="relative flex w-full flex-col font-landing text-foreground">
      <AnimStyles />

      {/* ══════════ NAGŁÓWEK + KARTY PLANÓW ══════════
           Bez PageAmbience / HeroWispyBackground / Glow / gigantycznego napisu
           w tle — te dekoracyjne warstwy zacinały scroll. Nagłówek i karty
           dzielą TEN SAM, szerszy niż reszta strony kontener (max-w-[92rem])
           — przy 4 kartach naraz (Free/Premium/Ultimate/Enterprise) węższy
           max-w-6xl ze standardowego Section zbyt mocno je ściskał. */}
      <div className="relative">
        {/* Subtelna poświata głębi u góry strony */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.09)_0%,transparent_70%)] blur-3xl"
        />

        <div className="relative mx-auto w-full max-w-4xl px-4 pb-10 pt-12 text-center sm:px-6 sm:pt-16 lg:px-8">
          <FadeIn className="relative z-10">
            <h1 className="font-heading text-center text-[clamp(36px,5.5vw,62px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
              Wybierz swój <span className="font-normal text-primary">plan.</span>
            </h1>

            {/* Przełącznik okresu i kreator doboru wycentrowane */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5">
              <OkresToggle okres={okres} onChange={setOkres} />
              <PlanFinderButton otwarty={dobor} onClick={() => setDobor(v => !v)} />
              <button
                type="button"
                onClick={() => document.getElementById('byte-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Czym są Byte'y? ↓
              </button>
            </div>
          </FadeIn>
        </div>

        {/* ══════════ KREATOR — rozwija się w dół spod przełącznika, nad kartami,
             dokładnie tak jak w cenniku produkcyjnym (przycisk "Nie wiesz który
             plan?" steruje aria-expanded). Zwijanie idzie po grid-template-rows,
             bo to jedyny sposób na animację do auto-wysokości bez mierzenia
             zawartości — a kreator zmienia wysokość, gdy rozwinie się rozbicie. ══════════ */}
        <div className="relative mx-auto w-full max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <Rozwijane otwarte={dobor}>
            <div
              ref={byteRef}
              className="scroll-mt-24 pb-4"
              style={{
                transform: dobor ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'transform .45s cubic-bezier(.22,1,.36,1)',
              }}
            >
              <PlanFinder onWybierz={wybierzRekomendacje} okres={okres} />
            </div>
          </Rozwijane>
        </div>

        {/* ══════════ KARTY PLANÓW ══════════ */}
        <div className="relative mx-auto w-full max-w-[92rem] px-4 pb-28 pt-4 sm:px-6 lg:px-8">
          <div ref={kartyRef} className="relative z-10 scroll-mt-24">
            <FadeIn>
              <div className="grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {PLANY.map(p => <PlanCard key={p.id} plan={p} okres={okres} podswietlony={rekomendacja === p.id} />)}
              </div>
            </FadeIn>
          </div>

          {/* Zdjęcie ryzyka z decyzji — stoi przy kartach, nie w zwiniętym FAQ na dole.
              Zapis w języku strony: mono, wersaliki, kropka rozdzielająca. */}
          <p className="relative mt-9 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary/85">
            <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            <span>Anulujesz jednym kliknięciem</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-primary/40" />
            <span>Dostęp do końca opłaconego okresu</span>
          </p>

          <p className="relative mt-4 text-center font-sans text-[11.5px] font-light text-foreground/30">
            Wszystkie ceny netto. Przy rozliczeniu rocznym rabat do 17% względem ceny miesięcznej.
            Miesięczna pula Byte odnawia się z każdym cyklem, a dokupione pakiety zachowują ważność przez 12 miesięcy.
            Orientacyjna liczba tokenów liczona wg referencyjnej ceny GPT-5.6 Terra, a liczba grafik — wg Nano Banana Pro.
          </p>
        </div>
      </div>

      {/* ══════════ JEDNA WALUTA. PEŁNA KONTROLA. (UKŁAD JAK W DEEP RESEARCH) ══════════ */}
      <Section id="byte-info" className="py-16 sm:py-24">
        <FadeIn>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* LEWA KOLUMNA — DOKŁADNIE FORMAT JAK NA WZORZE (IMAGE 2) */}
            <div className="lg:col-span-5 text-left space-y-6">
              <div className="space-y-3">
                <SecRule label="Czym jest Byte" />
                <h2 className="font-heading text-[clamp(28px,4vw,48px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
                  Jedna waluta. <br className="hidden sm:block" />
                  <span className="font-normal text-primary">Pełna kontrola.</span>
                </h2>
                {/* Definicja w dwóch zdaniach — dłuższy wykład nikt tu nie czyta. */}
                <p className="font-sans text-[15px] font-light leading-relaxed text-foreground/75">
                  <strong className="font-semibold text-foreground">Byte (<span className="text-primary">⟠</span>) to jednostka zużycia AI.</strong>{' '}
                  Jedna pula na wszystkie modele — płacisz za to, czego użyjesz, nie za pięć
                  subskrypcji naraz.
                </p>
              </div>

              {/* Zasady puli — numerowane, żeby czytało się jak reguły, nie hasła */}
              <ol className="space-y-3 font-sans">
                {BYTE_KARTY.map((k, i) => (
                  <li key={k.t} className="flex gap-3 text-[13.5px] font-light leading-snug">
                    <span className="mt-[3px] shrink-0 font-mono text-[10px] tabular-nums text-primary/55">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <strong className="mr-1.5 font-semibold text-foreground">{k.t}:</strong>
                      <span className="text-foreground/70">{k.d}</span>
                    </span>
                  </li>
                ))}
              </ol>

              {/* PRZYCISK CTA */}
              <div className="pt-2">
                <GlowButton
                  size="lg"
                  onClick={() => {
                    setDobor(true)
                    requestAnimationFrame(() => byteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
                  }}
                >
                  Wybierz swój plan
                </GlowButton>
              </div>
            </div>

            {/* PRAWA KOLUMNA — BOGATA WIZUALIZACJA EKOSYSTEMU BYTE */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none w-full">
              <ByteGeneratingGlyph />
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* Bez tej kreski „Jedna waluta" i „Porównaj funkcje" czytały się jak
          jedna sekcja — ten sam rytm rozdzielania co na stronie głównej. */}
      <TechDivider />

      {/* ══════════ PORÓWNANIE FUNKCJI — collapsible accordion ══════════ */}
      <Section wide className="pb-24 pt-8 sm:pt-12">
        <FadeIn>
          <BlockHead center title="Porównaj" accent="wszystkie funkcje." className="mx-auto" />
        </FadeIn>
        {/* Bez FadeIn — ten wrapper nakłada transform na przodka, a każdy
            transform tworzy nowy układ odniesienia i przesuwa position:sticky
            nagłówka tabeli (o dokładnie tyle, ile wynosi translateY). */}
        <div className="mt-12">
          <CompareFeaturesAccordion okres={okres} />
        </div>
      </Section>

      <TechDivider />

      {/* ══════════ FAQ ══════════ */}
      <Section className="pb-24 pt-8 sm:pt-12">
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
            {CENNIK_FAQ.map((f, i) => (
              <FaqRow key={f.q} q={f.q} a={f.a} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? null : i)} />
            ))}
          </FadeIn>
        </div>
      </Section>

      {/* ══════════ CTA ══════════ */}
      <Section className="relative overflow-hidden py-16 sm:py-20">
        <NextByteMarkIcon className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-[70%] text-primary/[0.06]" />
        <FadeIn className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
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
