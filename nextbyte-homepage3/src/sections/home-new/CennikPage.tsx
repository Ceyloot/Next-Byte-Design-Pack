import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Check, X, CircleCheck, Lock, Sparkles, PhoneCall, Wand2, ArrowRight,
  MessageSquare, ImagePlus, Bot, Users, Zap,
} from 'lucide-react'
import {
  Section, GlowButton, GhostButton, FadeIn, akcentTlo,
  AnimStyles,
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
    <div className="rounded-xl border border-foreground/[0.1] bg-foreground/[0.02] p-1 backdrop-blur-md">
      <div ref={wrapRef} className="relative inline-flex items-center">
        <span
          aria-hidden
          className="pointer-events-none rounded-lg"
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
            'relative z-10 h-10 shrink-0 rounded-lg px-6 font-heading text-[13px] font-semibold transition-colors duration-200',
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
            'relative z-10 flex h-10 shrink-0 items-center gap-2 rounded-lg px-6 font-heading text-[13px] font-semibold transition-colors duration-200',
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
   PRZYCISK "NIE WIESZ KTÓRY PLAN WYBRAĆ?" — kliknięcie przewija do
   sekcji Byte i zamienia ją w krótki dobór planu (patrz PlanFinder).
   ═══════════════════════════════════════════════════════════════ */
function PlanFinderButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-foreground/[0.14] bg-foreground/[0.02] px-4 font-heading text-[13px] font-semibold text-foreground/80 backdrop-blur-md transition-colors duration-200 hover:border-primary/40 hover:text-foreground"
    >
      <Wand2 className="h-3.5 w-3.5 text-primary" />
      Nie wiesz który plan wybrać?
      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wide text-primary">Nowość</span>
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

        {/* punkty — pozycjonowane procentowo, środek kropki dokładnie na linii toru */}
        <div className="absolute inset-x-0 top-1/2">
          {progi.map((p, i) => {
            const aktywny = i <= indeks
            const biezacy = i === indeks
            const left = (i / (progi.length - 1)) * 100
            return (
              <button
                key={p.byte}
                type="button"
                onClick={() => onChange(i)}
                aria-label={`${p.byte} Byte`}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300',
                  biezacy ? 'h-[18px] w-[18px]' : 'h-[13px] w-[13px] hover:scale-125',
                )}
                style={{
                  left: `${left}%`,
                  background: aktywny ? kolor : 'hsl(var(--foreground)/0.14)',
                  border: '2px solid hsl(var(--card))',
                  boxShadow: biezacy ? `0 0 0 3px ${akcentTlo(kolor, 25)}, 0 0 16px ${akcentTlo(kolor, 60)}` : 'none',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* etykiety progów — te same procentowe pozycje co kropki, żeby cyfry siedziały dokładnie pod nimi */}
      <div className="relative h-4">
        {progi.map((p, i) => {
          const left = (i / (progi.length - 1)) * 100
          return (
            <button
              key={p.byte}
              type="button"
              onClick={() => onChange(i)}
              className={cn(
                'absolute top-0 font-mono text-[10px] transition-colors',
                i === 0 ? 'left-0' : i === progi.length - 1 ? 'right-0' : '-translate-x-1/2',
                i === indeks ? 'font-bold' : 'text-foreground/30 hover:text-foreground/55',
              )}
              style={{ left: i === 0 || i === progi.length - 1 ? undefined : `${left}%`, color: i === indeks ? kolor : undefined }}
            >
              {p.byte.toLocaleString('pl-PL')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SUWAK KROKOWY — generyczna wersja mechaniki ByteSlider, używana
   w PlanFinder do pytań "ile treści miesięcznie" (jak w referencji:
   dwa suwaki z podziałką pod pytaniem "What are you here to make?").
   ═══════════════════════════════════════════════════════════════ */
function KrokSlider({
  etykieta, kroki, indeks, onChange, kolor,
}: {
  etykieta: string
  kroki: { label: string; opis: string }[]
  indeks: number
  onChange: (i: number) => void
  kolor: string
}) {
  const pct = (indeks / (kroki.length - 1)) * 100

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-foreground/60">{etykieta}</span>
        <span className="font-heading text-[12.5px] font-bold" style={{ color: kolor }}>{kroki[indeks].label}</span>
      </div>

      <div className="relative py-2">
        <div className="relative h-1.5 w-full rounded-full bg-foreground/[0.08]">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
            style={{ width: `${pct}%`, background: kolor, boxShadow: `0 0 12px ${akcentTlo(kolor, 65)}` }}
          />
        </div>
        <div className="absolute inset-x-0 top-1/2">
          {kroki.map((k, i) => {
            const aktywny = i <= indeks
            const biezacy = i === indeks
            const left = (i / (kroki.length - 1)) * 100
            return (
              <button
                key={k.label}
                type="button"
                onClick={() => onChange(i)}
                aria-label={k.label}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300',
                  biezacy ? 'h-4 w-4' : 'h-[11px] w-[11px] hover:scale-125',
                )}
                style={{
                  left: `${left}%`,
                  background: aktywny ? kolor : 'hsl(var(--foreground)/0.14)',
                  border: '2px solid hsl(var(--card))',
                  boxShadow: biezacy ? `0 0 0 3px ${akcentTlo(kolor, 22)}` : 'none',
                }}
              />
            )
          })}
        </div>
      </div>

      <p className="text-[11px] text-foreground/40">{kroki[indeks].opis}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PANEL "UNLIMITED & FREE GENS"
   ═══════════════════════════════════════════════════════════════ */
function UnlimitedPanel({ plan }: { plan: Plan }) {
  const wszystkieZablokowane = plan.unlimited.every(u => !u.dostep)
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: wszystkieZablokowane ? 'hsl(var(--foreground)/0.08)' : akcentTlo(plan.kolor, 22),
        background: wszystkieZablokowane ? 'hsl(var(--foreground)/0.015)' : akcentTlo(plan.kolor, 5),
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-foreground/30" />
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/35">
          Unlimited &amp; darmowe generacje
        </p>
      </div>
      <div className="space-y-2">
        {plan.unlimited.map(u => (
          <div key={u.label} className="flex items-center justify-between gap-3">
            <span className={cn('text-[12px]', u.dostep ? 'text-foreground/70' : 'text-foreground/30 line-through')}>
              {u.label}
            </span>
            {u.dostep
              ? <span className="rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold" style={{ color: plan.kolor, background: akcentTlo(plan.kolor, 14) }}>UNLIMITED</span>
              : <X className="h-3.5 w-3.5 shrink-0 text-foreground/20" />}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PANEL "DOSTĘP DO MODELI"
   ═══════════════════════════════════════════════════════════════ */
function ModelAccessPanel({ modele, kolor }: { modele: NonNullable<Plan['modele']>; kolor: string }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: akcentTlo(kolor, 30), background: `linear-gradient(160deg, ${akcentTlo(kolor, 12)}, ${akcentTlo(kolor, 3)})` }}
    >
      <p className="text-[12.5px] font-bold text-foreground">{modele.tytul}</p>
      <p className="mt-0.5 text-[11px] text-foreground/45">{modele.podtytul}</p>
      <div className="mt-3 space-y-2">
        {modele.pozycje.map(p => (
          <div key={p.label} className="flex items-center justify-between gap-3 rounded-lg bg-foreground/[0.04] px-2.5 py-1.5">
            <span className="text-[11.5px] font-semibold text-foreground/80">{p.label}</span>
            <span className="rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold" style={{ color: kolor, background: akcentTlo(kolor, 16) }}>
              {p.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   KARTA PLANU — trzy karty obok siebie (Free / Premium / Ultimate),
   jak w referencyjnych cennikach: odznaka + rabat, cena, CTA,
   suwak puli Byte, pasek zużycia, unlimited i dostęp do modeli, cechy.
   ═══════════════════════════════════════════════════════════════ */
function PlanCard({ plan, okres, podswietlony = false }: { plan: Plan; okres: Okres; podswietlony?: boolean }) {
  const [prog, setProg] = useState(0)
  const konfiguracja = plan.progi?.[prog] ?? null
  const cena = konfiguracja ? (okres === 'miesiecznie' ? konfiguracja.miesiecznie : konfiguracja.rocznie) : 0
  const darmowy = plan.progi === null

  const jasny = plan.id !== 'free' // premium/ultimate dostają wypełniony przycisk w kolorze marki
  const wyroznione = plan.polecany || podswietlony

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1.5',
        !wyroznione && 'border-foreground/[0.08]',
        podswietlony && 'ring-2 ring-offset-2 ring-offset-background',
        'bg-[hsl(var(--card)/0.92)]',
      )}
      style={{
        borderColor: wyroznione ? akcentTlo(plan.kolor, 45) : undefined,
        boxShadow: wyroznione ? `0 0 60px -14px ${akcentTlo(plan.kolor, 55)}` : undefined,
        ['--tw-ring-color' as string]: podswietlony ? plan.kolor : undefined,
      }}
    >
      {jasny && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 90% 55% at 50% 0%, ${akcentTlo(plan.kolor, plan.polecany ? 20 : 10)}, transparent 70%)` }}
        />
      )}

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mb-4 h-6" />

        <h3
          className="font-heading text-[26px] font-extrabold leading-none tracking-tight"
          style={{ color: jasny ? plan.kolor : undefined }}
        >
          {plan.nazwa}
        </h3>
        <p className="mt-2 text-[12.5px] text-foreground/45">{plan.opis}</p>

        <div className="mt-7 flex items-end gap-2">
          {!darmowy && <span className="pb-2 text-[13px] font-medium text-foreground/35">od</span>}
          <span className="font-heading text-[46px] font-extrabold leading-none tracking-tight text-foreground">
            {darmowy ? '0' : <AnimNum value={cena} />}
          </span>
          <span className="flex flex-col pb-1.5">
            <span className="text-[13px] font-bold text-foreground/60">PLN</span>
            <span className="text-[10.5px] text-foreground/35">/miesiąc</span>
          </span>
        </div>

        <p className="mt-2 text-[11.5px] text-foreground/40">
          {darmowy
            ? 'Płacisz tylko za zużyte Byte z doładowanych paczek'
            : okres === 'rocznie'
              ? `Rozliczane rocznie · ${(cena * 12).toLocaleString('pl-PL')} zł za rok`
              : 'Rozliczane miesięcznie · anulujesz w każdej chwili'}
        </p>

        {jasny ? (
          <GlowButton className="mt-6 w-full justify-center" icon={false}>{plan.cta}</GlowButton>
        ) : (
          <GhostButton className="mt-6 w-full justify-center" icon={undefined}>{plan.cta}</GhostButton>
        )}

        {plan.progi && (
          <div className="mt-7">
            <ByteSlider progi={plan.progi} indeks={prog} onChange={setProg} kolor={plan.kolor} />
          </div>
        )}

        {konfiguracja && (
          <div className="mt-4 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4">
            <p className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/30">
              To wystarczy na
            </p>
            <div className="space-y-2">
              {przelicznikByte(konfiguracja.byte).map(r => (
                <div key={r.label} className="flex items-center gap-2.5">
                  <r.icon className="h-3.5 w-3.5 shrink-0" style={{ color: plan.kolor }} />
                  <span className="text-[11.5px] text-foreground/55">
                    <strong className="font-bold text-foreground/85">≈ {r.value.toLocaleString('pl-PL')}</strong> {r.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-foreground/[0.06] pt-2.5 font-mono text-[10px] text-foreground/35">
              Kurs: <span style={{ color: plan.kolor }}>{konfiguracja.kurs}</span>
            </p>
          </div>
        )}

        <div className="mt-4 space-y-3">
          <UnlimitedPanel plan={plan} />
          {plan.modele && <ModelAccessPanel modele={plan.modele} kolor={plan.kolor} />}
        </div>

        <div aria-hidden className="my-6 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--foreground)/0.10) 50%, transparent)' }} />
        <p className="mb-3.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/30">
          W planie {plan.nazwa}
        </p>
        <ul className="space-y-2.5">
          {plan.cechy.map(c => (
            <li key={c} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-foreground/60">
              <span
                className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                style={{ background: akcentTlo(plan.kolor, 15) }}
              >
                <Check className="h-2.5 w-2.5" style={{ color: plan.kolor }} />
              </span>
              {c}
            </li>
          ))}
        </ul>
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
   ENTERPRISE — szeroki baner kontaktowy pod trzema kartami planów,
   zamiast osobnej zakładki "Dla firm".
   ═══════════════════════════════════════════════════════════════ */
function EnterpriseCard() {
  const kolor = 'hsl(var(--primary))'
  const cechy = [
    'Niestandardowa pula Byte dopasowana do organizacji',
    'Dedykowana infrastruktura i gwarancja SLA',
    'Nieograniczona liczba użytkowników',
    'Wspólny workspace i pula Byte dla całej firmy',
    'Priorytetowe wsparcie na dedykowanym kanale',
  ]

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1.5"
      style={{
        borderColor: akcentTlo(kolor, 24),
        background: 'linear-gradient(160deg, hsl(var(--foreground)/0.06), hsl(var(--card)/0.92))',
      }}
    >
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mb-4 h-6" />

        <h3 className="font-heading text-[26px] font-extrabold leading-none tracking-tight text-foreground">
          Enterprise
        </h3>
        <p className="mt-2 text-[12.5px] text-foreground/45">Dla organizacji potrzebujących personalizacji i bezpieczeństwa</p>

        <div className="mt-7 flex items-end gap-2">
          <span className="font-heading text-[28px] font-light leading-none tracking-tight text-foreground">
            Porozmawiajmy
          </span>
        </div>
        <p className="mt-2 text-[11.5px] text-foreground/40">Wycena dopasowana do skali Twojej organizacji</p>

        <GlowButton className="mt-6 w-full justify-center" icon={false}>
          <PhoneCall className="h-4 w-4" />
          Skontaktuj się z nami
        </GlowButton>

        <div aria-hidden className="my-6 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--foreground)/0.10) 50%, transparent)' }} />

        <p className="mb-3.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/30">
          W planie Enterprise
        </p>
        <ul className="space-y-2.5">
          {cechy.map(c => (
            <li key={c} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-foreground/60">
              <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: akcentTlo(kolor, 15) }}>
                <Check className="h-2.5 w-2.5" style={{ color: kolor }} />
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PLAN FINDER — zamienia sekcję "Byte" w kreator doboru planu 1:1
   z referencyjnym wizardem: po lewej checkboxy "do czego używasz",
   po prawej dynamicznie aktualizowana karta rekomendacji.
   ═══════════════════════════════════════════════════════════════ */
const OPCJE_DOBORU = [
  { id: 'test', icon: Sparkles, t: 'Testuję platformę', wagi: { free: 2, premium: 0, ultimate: 0 } },
  { id: 'chat', icon: MessageSquare, t: 'Codzienny Chat AI', wagi: { free: 1, premium: 1, ultimate: 0 } },
  { id: 'obrazy', icon: ImagePlus, t: 'Generowanie obrazów', wagi: { free: 0, premium: 2, ultimate: 1 } },
  { id: 'automatyzacje', icon: Bot, t: 'Asystent i automatyzacje', wagi: { free: 0, premium: 1, ultimate: 2 } },
  { id: 'zespol', icon: Users, t: 'Praca zespołowa', wagi: { free: 0, premium: 0, ultimate: 3 } },
  { id: 'skala', icon: Zap, t: 'Duża skala, priorytet w kolejce', wagi: { free: 0, premium: 0, ultimate: 3 } },
] as const

/** Kroki suwaka "ile obrazów miesięcznie" — im wyższy krok, tym mocniej przechyla w stronę wyższego planu. */
const KROKI_OBRAZY = [
  { label: '~50', opis: '≈50 grafik Nano Banana miesięcznie', waga: 0 },
  { label: '~200', opis: '≈200 grafik Nano Banana miesięcznie', waga: 1 },
  { label: '~500', opis: '≈500 grafik Nano Banana miesięcznie', waga: 2 },
  { label: '1000+', opis: '1000+ grafik Nano Banana miesięcznie', waga: 3 },
]

const KROKI_WIADOMOSCI = [
  { label: '~100', opis: '≈100 wiadomości w Chat AI miesięcznie', waga: 0 },
  { label: '~500', opis: '≈500 wiadomości w Chat AI miesięcznie', waga: 1 },
  { label: '~1500', opis: '≈1500 wiadomości w Chat AI miesięcznie', waga: 2 },
  { label: 'Bez limitu', opis: 'Intensywna, codzienna praca z Chat AI', waga: 3 },
]

function obliczRekomendacje(wybrane: Set<string>, obrazy: number, wiadomosci: number): string {
  const wyniki = { free: 0, premium: 0, ultimate: 0 }
  OPCJE_DOBORU.forEach(o => {
    if (!wybrane.has(o.id)) return
    wyniki.free += o.wagi.free
    wyniki.premium += o.wagi.premium
    wyniki.ultimate += o.wagi.ultimate
  })
  const wagaObjetosci = KROKI_OBRAZY[obrazy].waga + KROKI_WIADOMOSCI[wiadomosci].waga
  wyniki.premium += Math.min(wagaObjetosci, 2)
  wyniki.ultimate += Math.max(wagaObjetosci - 2, 0) * 2
  if (wyniki.free === 0 && wyniki.premium === 0 && wyniki.ultimate === 0) return 'premium'
  return (Object.entries(wyniki) as [string, number][]).sort((a, b) => b[1] - a[1])[0][0]
}

function PlanFinder({ onWybierz, onZamknij }: { onWybierz: (id: string) => void; onZamknij: () => void }) {
  const [wybrane, setWybrane] = useState<Set<string>>(new Set(['obrazy']))
  const [krokObrazy, setKrokObrazy] = useState(1)
  const [krokWiadomosci, setKrokWiadomosci] = useState(1)
  const [pokazDlaczego, setPokazDlaczego] = useState(false)
  const rekomendowanyId = obliczRekomendacje(wybrane, krokObrazy, krokWiadomosci)
  const plan = PLANY.find(p => p.id === rekomendowanyId) ?? PLANY[1]
  const konfiguracja = plan.progi?.[Math.min(1, (plan.progi?.length ?? 1) - 1)] ?? null

  const przelacz = (id: string) => {
    setWybrane(prev => {
      const nast = new Set(prev)
      nast.has(id) ? nast.delete(id) : nast.add(id)
      return nast
    })
  }

  return (
    <FadeIn className="mx-auto max-w-5xl">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="font-heading text-[clamp(24px,3.4vw,34px)] font-light leading-[1.1] tracking-[-1px] text-foreground">
          Wybierz, do czego <span className="font-normal text-primary">tworzysz i otrzymaj rekomendację.</span>
        </h2>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* lewa kolumna — pytanie i checkboxy */}
        <div className="rounded-2xl border border-foreground/[0.1] bg-foreground/[0.02] p-6 sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-foreground/[0.14] bg-foreground/[0.04] font-mono text-[12px] font-bold text-foreground/70">1</span>
            <div>
              <h3 className="font-heading text-[16px] font-bold text-foreground">Do czego używasz NextByte?</h3>
              <p className="mt-0.5 text-[12px] text-foreground/45">Możesz wybrać kilka opcji</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {OPCJE_DOBORU.map(o => {
              const aktywna = wybrane.has(o.id)
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => przelacz(o.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
                    aktywna ? 'border-primary/45 bg-primary/[0.08]' : 'border-foreground/[0.1] bg-foreground/[0.02] hover:border-foreground/20',
                  )}
                >
                  <o.icon className={cn('h-4 w-4 shrink-0', aktywna ? 'text-primary' : 'text-foreground/40')} />
                  <span className={cn('flex-1 text-[13px] font-semibold', aktywna ? 'text-foreground' : 'text-foreground/60')}>{o.t}</span>
                  <span
                    className={cn(
                      'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors',
                      aktywna ? 'border-primary bg-primary' : 'border-foreground/20',
                    )}
                  >
                    {aktywna && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-8 flex items-start gap-3 border-t border-foreground/[0.08] pt-7">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-foreground/[0.14] bg-foreground/[0.04] font-mono text-[12px] font-bold text-foreground/70">2</span>
            <div>
              <h3 className="font-heading text-[16px] font-bold text-foreground">Ile treści tworzysz miesięcznie?</h3>
              <p className="mt-0.5 text-[12px] text-foreground/45">Przesuń suwaki, żeby dopasować pulę Byte</p>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <KrokSlider etykieta="Obrazy AI" kroki={KROKI_OBRAZY} indeks={krokObrazy} onChange={setKrokObrazy} kolor={plan.kolor} />
            <KrokSlider etykieta="Wiadomości w Chat AI" kroki={KROKI_WIADOMOSCI} indeks={krokWiadomosci} onChange={setKrokWiadomosci} kolor={plan.kolor} />
          </div>

          <button
            type="button"
            onClick={onZamknij}
            className="mt-7 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/35 transition-colors hover:text-foreground/60"
          >
            ← Wróć do informacji o Byte
          </button>
        </div>

        {/* prawa kolumna — dynamiczna karta rekomendacji */}
        <div
          className="relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-colors duration-500"
          style={{ borderColor: akcentTlo(plan.kolor, 40), background: `linear-gradient(160deg, ${akcentTlo(plan.kolor, 14)}, hsl(var(--card)/0.92))` }}
        >
          <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Polecamy Twój plan</p>
          <button
            type="button"
            onClick={() => setPokazDlaczego(v => !v)}
            className="mx-auto mt-2 rounded-lg px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors"
            style={{ color: plan.kolor, background: akcentTlo(plan.kolor, 14) }}
          >
            {pokazDlaczego ? 'Ukryj powód ↑' : 'Zobacz dlaczego →'}
          </button>
          {pokazDlaczego && (
            <p className="mt-3 rounded-lg bg-foreground/[0.04] p-3 text-center text-[11.5px] leading-relaxed text-foreground/55">
              Na podstawie wybranych opcji plan {plan.nazwa} daje najlepszy stosunek mocy AI do ceny dla Twojego przypadku.
            </p>
          )}

          <div key={plan.id} className="animate-tab-in">
            <h3 className="mt-5 font-heading text-[28px] font-light leading-none tracking-[-1.5px]" style={{ color: plan.kolor }}>
              {plan.nazwa}
            </h3>
            <p className="mt-1 text-[12px] text-foreground/50">{plan.opis}</p>
          </div>

          {/* liczby NIE są w keyowanym, przemontowywanym bloku — dzięki temu AnimNum
              faktycznie przelicza starą wartość na nową, zamiast migać z pominięciem animacji */}
          {konfiguracja && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-foreground/[0.04] px-3 py-2">
              <Sparkles className="h-3.5 w-3.5" style={{ color: plan.kolor }} />
              <span className="text-[12.5px] font-semibold text-foreground"><AnimNum value={konfiguracja.byte} /> ⟠ / mies.</span>
            </div>
          )}

          <div className="mt-4 flex items-end gap-2">
            <span className="font-heading text-[36px] font-extrabold leading-none tracking-tight text-foreground">
              {plan.progi === null ? '0' : <AnimNum value={konfiguracja?.miesiecznie ?? 0} />}
            </span>
            <span className="flex flex-col pb-1">
              <span className="text-[12px] font-bold text-foreground/60">PLN</span>
              <span className="text-[10px] text-foreground/35">/miesiąc</span>
            </span>
          </div>

          <div key={`${plan.id}-szczegoly`} className="animate-tab-in">
            <ul className="mt-4 space-y-2">
              {plan.cechy.slice(0, 3).map(c => (
                <li key={c} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-foreground/60">
                  <Check className="mt-[2px] h-3.5 w-3.5 shrink-0" style={{ color: plan.kolor }} strokeWidth={2.5} />
                  {c}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => onWybierz(plan.id)}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-heading text-[14px] font-extrabold uppercase tracking-wide transition-transform duration-200 hover:scale-[1.02]"
              style={{ background: akcentTlo(plan.kolor, 24), border: `1px solid ${akcentTlo(plan.kolor, 55)}`, color: plan.kolor }}
            >
              Wybierz {plan.nazwa}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STRONA CENNIKA
   ═══════════════════════════════════════════════════════════════ */
export function CennikPage({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const [okres, setOkres] = useState<Okres>('miesiecznie')
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [dobor, setDobor] = useState(true)
  const [rekomendacja, setRekomendacja] = useState<string | null>(null)
  const byteRef = useRef<HTMLDivElement>(null)
  const kartyRef = useRef<HTMLDivElement>(null)

  const wlaczDobor = () => {
    setDobor(true)
    requestAnimationFrame(() => byteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

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
        <div className="relative mx-auto w-full max-w-[92rem] px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <FadeIn className="relative z-10">
            <h1 className="font-heading text-[clamp(26px,4vw,42px)] font-semibold leading-[1.1] tracking-[-1px] text-foreground">
              Wybierz najlepszy plan dla siebie.
            </h1>
            <p className="mt-3 max-w-lg font-sans text-[14.5px] font-light leading-relaxed text-foreground/55">
              Odblokuj lepsze ceny lub skaluj swoje możliwości, dopasowując plan do bieżących potrzeb.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PlanFinderButton onClick={wlaczDobor} />
              <OkresToggle okres={okres} onChange={setOkres} />
            </div>
          </FadeIn>
        </div>

        {/* ══════════ KARTY PLANÓW — Enterprise jako 4. kafelek w tej samej siatce ══════════ */}
        <div className="relative mx-auto w-full max-w-[92rem] px-4 pb-28 pt-4 sm:px-6 lg:px-8">
          <div ref={kartyRef} className="scroll-mt-24">
            <FadeIn>
              <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {PLANY.map(p => <PlanCard key={p.id} plan={p} okres={okres} podswietlony={rekomendacja === p.id} />)}
                <EnterpriseCard />
              </div>
            </FadeIn>
          </div>

          <p className="mt-10 text-center font-sans text-[11.5px] font-light text-foreground/30">
            Wszystkie ceny netto. Przy rozliczeniu rocznym rabat do 17% względem ceny miesięcznej.
            Niewykorzystana pula Byte przechodzi na kolejny okres do trzykrotności puli miesięcznej.
          </p>
        </div>
      </div>

      {/* ══════════ JAK DZIAŁA BYTE / DOBÓR PLANU ══════════ */}
      <Section className="pb-24">
        <div ref={byteRef} className="scroll-mt-24">
          {dobor ? (
            <PlanFinder onWybierz={wybierzRekomendacje} onZamknij={() => setDobor(false)} />
          ) : (
            <>
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
            </>
          )}
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
