import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Check, Sparkles, Wand2, ChevronDown, ArrowRight,
  MessageSquare, ImagePlus, Bot, Layers, FileStack, FileSearch,
  Gauge,
} from 'lucide-react'
import {
  Section, GlowButton, GhostButton, FadeIn, akcentTlo,
  AnimStyles,
} from './shared'
import { SecRule, NextByteMarkIcon } from './HomePage'
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
   SUWAK PULI BYTE — zgodny z HSL i kolorami planu
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
      {/* Nagłówek: etykieta cicha (xs, muted), a liczba niesie akcent w kolorze planu */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Byte miesięcznie:</span>
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-bold tabular-nums" style={{ color: kolor }}>
            <AnimNum value={progi[indeks].byte} />
          </span>
          <span className="text-xs font-semibold" style={{ color: kolor }}>⟠</span>
        </span>
      </div>

      {/* Tor suwaka */}
      <div className="relative py-2">
        <div className="relative h-1.5 w-full rounded-full bg-foreground/[0.08]">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${akcentTlo(kolor, 35)}, ${akcentTlo(kolor, 65)})` }}
          />
        </div>

        {/* Punkty kroków */}
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
                  'absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 cursor-pointer',
                  biezacy ? 'h-[18px] w-[18px]' : 'h-[13px] w-[13px] hover:scale-125',
                )}
                style={{
                  left: `${left}%`,
                  background: biezacy ? kolor : aktywny ? akcentTlo(kolor, 55) : 'hsl(var(--foreground)/0.14)',
                  border: '2px solid hsl(var(--card))',
                  boxShadow: biezacy ? `0 0 0 3px ${akcentTlo(kolor, 20)}` : 'none',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Etykiety numeryczne progów pod linią */}
      <div className="relative h-4">
        {progi.map((p, i) => {
          const left = (i / (progi.length - 1)) * 100
          return (
            <button
              key={p.byte}
              type="button"
              onClick={() => onChange(i)}
              className={cn(
                'absolute top-0 text-[11px] tabular-nums transition-colors cursor-pointer select-none',
                i === 0 ? 'left-0' : i === progi.length - 1 ? 'right-0' : '-translate-x-1/2',
                i === indeks ? 'font-semibold' : 'text-muted-foreground/60 hover:text-muted-foreground',
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
   BLOK "TO WYSTARCZY NA" + UNLIMITED — Panel w HSL
   ═══════════════════════════════════════════════════════════════ */
function PanelZuzycia({ byte, unlimited, kolor }: { byte: number | null; unlimited: Plan['unlimited']; kolor: string }) {
  return (
    <div className="space-y-1.5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] p-3">
      {byte !== null && (
        <>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
            To wystarczy na:
          </p>
          {przelicznikByte(byte).map(r => (
            <div key={r.label} className="flex items-center gap-2">
              <r.icon className="h-3.5 w-3.5 shrink-0" style={{ color: akcentTlo(kolor, 70) }} />
              <span className="text-xs text-muted-foreground">
                ≈ <strong className="font-bold tabular-nums text-foreground"><AnimNum value={r.value} /></strong> {r.label}
              </span>
            </div>
          ))}
        </>
      )}

      {unlimited && unlimited.length > 0 && (
        <div className={cn('space-y-1.5', byte !== null && 'mt-2 border-t border-foreground/[0.06] pt-2')}>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
            Unlimited:
          </p>
          {unlimited.map(u => (
            <div key={u.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <u.icon className="h-3.5 w-3.5 shrink-0" style={{ color: akcentTlo(kolor, 70) }} />
                <span className="text-xs text-muted-foreground">{u.label}</span>
              </div>
              <span
                className="rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ color: kolor, background: akcentTlo(kolor, 15), borderColor: akcentTlo(kolor, 25) }}
              >
                Unlimited
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   KARTA PLANU — SPÓJNA Z DESIGNEM NEXTBYTE (rounded-2xl, CTA pod ceną)
   ═══════════════════════════════════════════════════════════════ */
function PlanCard({ plan, okres, podswietlony = false }: { plan: Plan; okres: Okres; podswietlony?: boolean }) {
  const [prog, setProg] = useState(0)
  const [rozwiniete, setRozwiniete] = useState(false)
  const konfiguracja = plan.progi?.[prog] ?? null
  const stalaCena = plan.cena
  const cenaBazowa = konfiguracja ? konfiguracja.miesiecznie : stalaCena ?? 0
  const cena = cenaZaOkres(cenaBazowa, okres)
  const darmowy = plan.cena === 0
  const wyroznione = plan.polecany || podswietlony
  const pulaByte = konfiguracja?.byte ?? plan.stalaPula

  const WIDOCZNE = 6
  const ukryte = plan.cechy.length - WIDOCZNE

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
        {/* Rząd odznaki planu */}
        <div className="flex items-center justify-between min-h-[24px] mb-2">
          <span className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {plan.nazwa} Plan
          </span>

          {plan.polecany && (
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
              style={{ color: plan.kolor, background: akcentTlo(plan.kolor, 15), borderColor: akcentTlo(plan.kolor, 30) }}
            >
              ★ Najlepsza oferta
            </span>
          )}
        </div>

        {/* Tytuł & krótki opis */}
        <div className="mb-3">
          <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {plan.nazwa}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{plan.opis}</p>
        </div>

        {/* Cena: czytelna i przejrzysta */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              {darmowy ? (
                'Free'
              ) : (
                <>
                  <AnimNum value={cena} decimals={cena % 1 !== 0 ? 2 : 0} />
                  <span className="text-base font-normal text-muted-foreground ml-1">zł/m</span>
                </>
              )}
            </span>
          </div>

          <div className="mt-1 min-h-[18px]">
            {!darmowy && okres === 'rocznie' ? (
              <span className="text-[11.5px] text-emerald-400 font-medium">
                faktura roczna: <AnimNum value={cena * 12} /> PLN
              </span>
            ) : darmowy ? (
              <span className="text-[11.5px] text-muted-foreground font-light">bez karty kredytowej</span>
            ) : (
              <span className="text-[11.5px] text-muted-foreground font-light">rozliczane miesięcznie</span>
            )}
          </div>
        </div>

        {/* ══════════ PRZYCISK CTA ZARAZ POD CENĄ (ERGONOMICZNE UMIEJSZCZENIE) ══════════ */}
        <div className="mb-5">
          {plan.polecany ? (
            <GlowButton className="w-full justify-center" icon={false}>
              {plan.cta || 'Wybierz plan'}
            </GlowButton>
          ) : (
            <GhostButton className="w-full justify-center" icon={undefined}>
              {plan.cta || 'Wybierz plan'}
            </GhostButton>
          )}
        </div>

        {/* Suwak progów Byte / Pula Byte + Panel Zużycia */}
        <div className="mb-5 space-y-3">
          {plan.progi ? (
            <ByteSlider progi={plan.progi} indeks={prog} onChange={setProg} kolor={plan.kolor} />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Byte miesięcznie:</span>
                {pulaByte !== null && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tabular-nums" style={{ color: plan.kolor }}>
                      <AnimNum value={pulaByte} />
                    </span>
                    <span className="text-xs font-semibold" style={{ color: plan.kolor }}>⟠</span>
                  </span>
                )}
              </div>
              {plan.notka && (
                <p className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.03] px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                  {plan.notkaTytul && <strong className="block text-foreground/70">{plan.notkaTytul}</strong>}
                  {plan.notka}
                </p>
              )}
            </>
          )}

          <PanelZuzycia byte={pulaByte} unlimited={plan.unlimited} kolor={plan.kolor} />
        </div>

        {/* Lista cech */}
        <div className="space-y-2.5 pt-2 border-t border-foreground/[0.08]">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {plan.cechyNaglowek || 'W pakiecie:'}
          </p>

          {plan.cechy.slice(0, WIDOCZNE).map(c => (
            <CechaWiersz key={c.t} cecha={c} />
          ))}

          {ukryte > 0 && (
            <Rozwijane otwarte={rozwiniete}>
              <div className="space-y-2.5 pt-2.5">
                {plan.cechy.slice(WIDOCZNE).map(c => (
                  <CechaWiersz key={c.t} cecha={c} />
                ))}
              </div>
            </Rozwijane>
          )}

          {ukryte > 0 && (
            <button
              type="button"
              onClick={() => setRozwiniete(v => !v)}
              className="pt-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{rozwiniete ? 'Zwiń listę' : `+ Więcej (${ukryte})`}</span>
              <ChevronDown className={cn('h-3 w-3 transition-transform', rozwiniete && 'rotate-180')} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const TON_PLAKIETKI: Record<TonPlakietki, string> = {
  blue: 'hsl(var(--primary))',
  green: 'hsl(var(--primary))',
  pink: 'hsl(var(--primary))',
  violet: 'hsl(var(--primary))',
}

function CechaWiersz({ cecha }: { cecha: Cecha }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-foreground/[0.1] bg-foreground/5">
        <cecha.icon className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
      <span className="flex-1 text-sm font-medium leading-snug text-foreground">{cecha.t}</span>
      {cecha.badge && (
        <span
          className="shrink-0 self-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            color: TON_PLAKIETKI[cecha.badge.ton],
            background: akcentTlo(TON_PLAKIETKI[cecha.badge.ton], 15),
            borderColor: akcentTlo(TON_PLAKIETKI[cecha.badge.ton], 30),
          }}
        >
          {cecha.badge.t}
        </span>
      )}
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
  { id: 'rozmowy', icon: MessageSquare, t: 'Pisanie i rozmowy z AI', dodatek: 0, opis: 'Ustawiasz suwakiem niżej' },
  { id: 'grafika', icon: ImagePlus, t: 'Grafika i wizualizacje', dodatek: 0, opis: 'Ustawiasz suwakiem niżej' },
  { id: 'asystent', icon: Bot, t: 'Asystent wykonujący zadania', dodatek: 20 * KOSZT_BYTE.zadanieAsystenta, opis: '≈20 zadań miesięcznie' },
  { id: 'analizy', icon: FileSearch, t: 'Analizy i Deep Research', dodatek: 15 * KOSZT_BYTE.mocnyModel, opis: '≈15 analiz na mocnym modelu' },
  { id: 'notatki', icon: Layers, t: 'Notatki, kalendarz, zadania', dodatek: 6 * KOSZT_BYTE.zadanieAsystenta, opis: '≈6 podsumowań miesięcznie' },
  { id: 'dokumenty', icon: FileStack, t: 'Dokumenty i analiza plików', dodatek: 20 * KOSZT_BYTE.zadanieAsystenta, opis: '≈20 przeanalizowanych plików' },
] as const

/** Suwaki zużycia — liczą się zawsze, tak jak w cenniku produkcyjnym
 *  (przy zerowych zaznaczeniach domyślne 30 rozmów i 10 obrazów dają 190 ⟠).
 *  `stawka` to koszt jednej operacji w Byte. */
const SUWAKI_ZUZYCIA = [
  { id: 'rozmowy', icon: MessageSquare, etykieta: 'Rozmowy z AI', jednostka: 'za rozmowę', stawka: KOSZT_BYTE.rozmowa, max: 400, krok: 10, domyslnie: 30 },
  { id: 'obrazy', icon: ImagePlus, etykieta: 'Obrazy', jednostka: 'za obraz', stawka: KOSZT_BYTE.obraz, max: 500, krok: 10, domyslnie: 10 },
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
          <Icon className="h-4 w-4 shrink-0 text-primary/70" />
          <span className="text-sm font-medium text-foreground">{etykieta}</span>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
            {wartosc}
          </span>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">{koszt} ⟠</span>
      </div>

      <input
        type="range"
        min={0}
        max={max}
        step={krok}
        value={wartosc}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={etykieta}
        className="nb-zakres mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full"
        style={{ background: `linear-gradient(90deg, hsl(var(--primary)) ${pct}%, hsl(var(--foreground)/0.1) ${pct}%)` }}
      />

      <p className="mt-1.5 text-[11px] text-muted-foreground/70">{stawka} ⟠ {jednostka}</p>
    </div>
  )
}

/** Numerowany krok kreatora — kółko z cyfrą + tytuł i podtytuł. */
function KrokNaglowek({ n, tytul, podtytul }: { n: number; tytul: string; podtytul: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
        {n}
      </span>
      <div>
        <h3 className="font-heading text-[15px] font-bold text-foreground">{tytul}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{podtytul}</p>
      </div>
    </div>
  )
}

function PlanFinder({ onWybierz }: { onWybierz: (id: string) => void }) {
  const [wybrane, setWybrane] = useState<Set<string>>(new Set())
  const [ilosci, setIlosci] = useState<Record<string, number>>(
    () => Object.fromEntries(SUWAKI_ZUZYCIA.map(s => [s.id, s.domyslnie])),
  )
  const [mocne, setMocne] = useState(false)
  const [skad, setSkad] = useState(false)

  const przelacz = (id: string) => {
    setWybrane(prev => {
      const nast = new Set(prev)
      if (nast.has(id)) nast.delete(id)
      else nast.add(id)
      return nast
    })
  }

  // Tryb "mocniejsze modele" podnosi koszt rozmowy do stawki mocnego modelu —
  // dokładnie ta sama liczba, którą karta planu pokazuje w "rozmów na mocnym modelu".
  const pozycje = SUWAKI_ZUZYCIA.map(s => {
    const stawka = s.id === 'rozmowy' && mocne ? KOSZT_BYTE.mocnyModel : s.stawka
    return { ...s, stawkaAktualna: stawka, koszt: ilosci[s.id] * stawka }
  })

  // Zaznaczone kategorie bez własnego suwaka dokładają swoje typowe zużycie.
  const dodatki = OPCJE_UZYCIA.filter(o => wybrane.has(o.id) && o.dodatek > 0)

  const zuzycie =
    pozycje.reduce((sum, p) => sum + p.koszt, 0) +
    dodatki.reduce((sum, o) => sum + o.dodatek, 0)

  // Rekomendacja: najtańszy próg, którego pula pokrywa wyliczone zużycie.
  // Gdy nic nie zaznaczono albo zużycie = 0, sensowny jest plan bezpłatny.
  const kandydaci = PLANY.flatMap(p => (p.progi ?? []).map(prog => ({ plan: p, prog })))
    .sort((a, b) => a.prog.miesiecznie - b.prog.miesiecznie)

  const trafiony = kandydaci.find(k => k.prog.byte >= zuzycie)
  const wybor = zuzycie === 0 ? null : (trafiony ?? kandydaci[kandydaci.length - 1])

  const plan = wybor?.plan ?? PLANY[0]
  const prog = wybor?.prog ?? null
  const zapas = prog ? prog.byte - zuzycie : 0
  const pokrycie = prog ? Math.min((zuzycie / prog.byte) * 100, 100) : 0

  // Kolejny próg — "gdy zabraknie" pokazuje, ile kosztuje wyższa półka.
  const nastepny = wybor ? kandydaci[kandydaci.indexOf(wybor) + 1] ?? null : null

  return (
    <FadeIn className="mx-auto max-w-6xl">
      <div className="rounded-2xl border border-foreground/[0.1] bg-foreground/[0.02] p-5 sm:p-7">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Wand2 className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-[17px] font-bold text-foreground">Dobierz plan pod swoje użycie</h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
            Stawki zmierzone na produkcji
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* ── lewa kolumna: trzy kroki konfiguracji ── */}
          <div className="space-y-4">
            <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-5">
              <KrokNaglowek n={1} tytul="Co chcesz robić?" podtytul="Można zaznaczyć kilka" />
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {OPCJE_UZYCIA.map(o => {
                  const on = wybrane.has(o.id)
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => przelacz(o.id)}
                      aria-pressed={on}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors duration-200',
                        on ? 'border-primary/45 bg-primary/[0.08]' : 'border-foreground/[0.1] bg-foreground/[0.02] hover:border-foreground/20',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors',
                          on ? 'border-primary bg-primary' : 'border-foreground/25',
                        )}
                      >
                        {on && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
                      </span>
                      <span className="flex-1">
                        <span className={cn('block text-sm leading-snug', on ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                          {o.t}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground/60">{o.opis}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-5">
              <KrokNaglowek n={2} tytul="Ile tego miesięcznie?" podtytul="Przesuń, jeśli chcesz doprecyzować" />
              <div className="mt-6 space-y-6">
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
                    onChange={v => setIlosci(prev => ({ ...prev, [s.id]: v }))}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-5">
              <KrokNaglowek n={3} tytul="Jakość modeli" podtytul="Mocniejsze myślą dłużej i kosztują więcej" />
              <button
                type="button"
                role="switch"
                aria-checked={mocne}
                onClick={() => setMocne(v => !v)}
                className="mt-5 flex w-full items-center gap-3 rounded-xl border border-foreground/[0.1] bg-foreground/[0.02] px-3.5 py-3 text-left transition-colors hover:border-foreground/20"
              >
                <Gauge className="h-4 w-4 shrink-0 text-primary/70" />
                <span className="text-sm font-medium text-foreground">Mocniejsze modele</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {KOSZT_BYTE.rozmowa} ⟠ → {KOSZT_BYTE.mocnyModel} ⟠
                </span>
                <span
                  className={cn(
                    'ml-auto flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200',
                    mocne ? 'bg-primary' : 'bg-foreground/15',
                  )}
                >
                  <span
                    className="h-5 w-5 rounded-full bg-background transition-transform duration-200"
                    style={{ transform: mocne ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </span>
              </button>
            </div>
          </div>

          {/* ── prawa kolumna: propozycja planu ── */}
          <div>
            <p className="mb-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              Proponujemy plan
            </p>

            <div
              className="rounded-2xl border p-5 transition-colors duration-500"
              style={{
                borderColor: akcentTlo(plan.kolor, 35),
                background: `linear-gradient(160deg, ${akcentTlo(plan.kolor, 12)}, hsl(var(--card)/0.92))`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div key={plan.id} className="animate-tab-in">
                  <h3 className="font-heading text-[26px] font-bold leading-none" style={{ color: plan.kolor }}>
                    {plan.nazwa}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {prog ? 'Rozliczane miesięcznie' : 'Wystarczy pula startowa'}
                  </p>
                </div>
                {/* Liczba poza keyowanym blokiem — inaczej przemontowanie zjadłoby
                    animację przeliczania i cena tylko by przeskakiwała. */}
                <div className="flex shrink-0 items-baseline gap-1">
                  <span className="font-heading text-[32px] font-bold leading-none text-foreground">
                    <AnimNum value={prog?.miesiecznie ?? 0} />
                  </span>
                  <span className="text-xs text-muted-foreground">zł/mies.</span>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Twoje szacowane zużycie</span>
                  <span className="font-semibold tabular-nums" style={{ color: plan.kolor }}>
                    <AnimNum value={zuzycie} /> / {prog ? prog.byte.toLocaleString('pl-PL') : '—'} ⟠
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.08]">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${pokrycie}%`, background: plan.kolor }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                  {prog
                    ? `Zostaje ${zapas.toLocaleString('pl-PL')} ⟠ zapasu`
                    : 'Zacznij bez opłaty i doładuj paczkę, gdy będzie potrzebna'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSkad(v => !v)}
                aria-expanded={skad}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-foreground/[0.04] py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Skąd ta liczba?
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', skad && 'rotate-180')} />
              </button>

              {skad && (
                <div className="mt-2 animate-tab-in space-y-1.5 rounded-lg bg-foreground/[0.04] p-3">
                  {pozycje.filter(s => s.koszt > 0).map(s => (
                    <div key={s.id} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-muted-foreground">
                        {s.etykieta} · {ilosci[s.id]} × {s.stawkaAktualna} ⟠
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">{s.koszt} ⟠</span>
                    </div>
                  ))}
                  {dodatki.map(o => (
                    <div key={o.id} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-muted-foreground">{o.t} · {o.opis}</span>
                      <span className="font-semibold tabular-nums text-foreground">{o.dodatek} ⟠</span>
                    </div>
                  ))}
                  {zuzycie === 0 ? (
                    <p className="text-[11px] text-muted-foreground">Ustaw suwaki albo zaznacz, co chcesz robić.</p>
                  ) : (
                    <div className="flex items-center justify-between gap-2 border-t border-foreground/[0.08] pt-1.5 text-[11px]">
                      <span className="font-medium text-foreground">Razem</span>
                      <span className="font-bold tabular-nums" style={{ color: plan.kolor }}>{zuzycie} ⟠</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <GlowButton className="mt-4 w-full justify-center" icon={false} onClick={() => onWybierz(plan.id)}>
              <Sparkles className="h-4 w-4" />
              Wybieram {plan.nazwa}
            </GlowButton>

            {nastepny && (
              <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-foreground/[0.08] px-3.5 py-2.5 text-xs">
                <span className="text-muted-foreground">Gdy zabraknie</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {nastepny.prog.byte.toLocaleString('pl-PL')} ⟠ za {nastepny.prog.miesiecznie} zł
                </span>
              </div>
            )}

            <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground/60">
              Plan zmienisz w każdej chwili. W górę działa od razu z dopłatą różnicy, w dół od
              następnego okresu — żeby nie przepadło to, co już opłacone.
            </p>
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
   BOGATA WIZUALIZACJA: EKOSYSTEM JEDNEJ WALUTY (PLN → BYTE)
   Wzorowana na zaawansowanych scenach modułowych (Deep Research):
   3D moneta PLN, wznoszący się strumień kwantowy, centralny kryształ
   Byte ⟠ oraz 6 rozchodzących się satelitarnych węzłów operacji.
   ═══════════════════════════════════════════════════════════════ */
function BytePlnTransferVisual() {
  const referencja = PLANY.find(p => p.id === 'premium')?.progi?.[0]
  const kurs = (referencja ? referencja.byte / referencja.miesiecznie : 5).toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  return (
    <div className="relative w-full max-w-[880px] aspect-[880/580] flex items-center justify-center">
      {/* Poświata tła */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[620px] rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.14)_0%,transparent_70%)] blur-3xl"
      />

      {/* Siatka techniczna z radialną maską */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(0deg, #38bdf8 1px, transparent 1px),' +
            'linear-gradient(90deg, #38bdf8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
        }}
      />

      <svg
        viewBox="0 0 880 580"
        className="relative z-10 h-full w-full overflow-visible select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="bytePulseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="plnBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#090d16" stopOpacity="0.98" />
          </linearGradient>

          <linearGradient id="crystalFacetA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="crystalFacetB" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id="beamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* ══════════ 1. PROMIENISTE ŁUKI POŁĄCZEŃ OD KRYSZTAŁU DO WĘZŁÓW ══════════ */}
        <g stroke="#38bdf8" strokeOpacity="0.32" strokeWidth="1.2" fill="none">
          <path d="M 440 190 C 360 180, 280 130, 230 110" strokeDasharray="3 4" />
          <path d="M 440 210 C 340 220, 260 230, 200 245" strokeDasharray="3 4" />
          <path d="M 440 240 C 350 310, 260 360, 210 385" strokeDasharray="3 4" />
          <path d="M 440 190 C 520 180, 600 130, 650 110" strokeDasharray="3 4" />
          <path d="M 440 210 C 540 220, 620 230, 680 245" strokeDasharray="3 4" />
          <path d="M 440 240 C 530 310, 620 360, 670 385" strokeDasharray="3 4" />
        </g>

        {/* Cząstki fotonów poruszające się wzdłuż łuków */}
        <g fill="#38bdf8" filter="url(#bytePulseGlow)">
          <circle r="2.5">
            <animateMotion dur="4s" repeatCount="indefinite" path="M 440 190 C 360 180, 280 130, 230 110" />
          </circle>
          <circle r="2.5">
            <animateMotion dur="4.6s" repeatCount="indefinite" begin="0.8s" path="M 440 210 C 340 220, 260 230, 200 245" />
          </circle>
          <circle r="2.5">
            <animateMotion dur="5.2s" repeatCount="indefinite" begin="1.4s" path="M 440 240 C 350 310, 260 360, 210 385" />
          </circle>
          <circle r="2.5">
            <animateMotion dur="4.2s" repeatCount="indefinite" begin="0.4s" path="M 440 190 C 520 180, 600 130, 650 110" />
          </circle>
          <circle r="2.5">
            <animateMotion dur="4.8s" repeatCount="indefinite" begin="1.1s" path="M 440 210 C 540 220, 620 230, 680 245" />
          </circle>
          <circle r="2.5">
            <animateMotion dur="5.5s" repeatCount="indefinite" begin="1.8s" path="M 440 240 C 530 310, 620 360, 670 385" />
          </circle>
        </g>

        {/* ══════════ 2. STRUMIEŃ KWANTOWY PLN -> BYTE ══════════ */}
        <g>
          <line x1="440" y1="445" x2="440" y2="245" stroke="url(#beamGrad)" strokeWidth="2.5" />
          <line x1="428" y1="448" x2="428" y2="250" stroke="#38bdf8" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 5" />
          <line x1="452" y1="448" x2="452" y2="250" stroke="#38bdf8" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 5" />

          <circle r="3" fill="#38bdf8" filter="url(#bytePulseGlow)">
            <animate attributeName="cy" from="445" to="245" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="cx" values="440;441;439;440" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle r="2" fill="#7dd3fc">
            <animate attributeName="cy" from="445" to="245" dur="2.8s" begin="1.1s" repeatCount="indefinite" />
            <animate attributeName="cx" values="436;437;435;436" dur="2.8s" begin="1.1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.8s" begin="1.1s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ══════════ 3. BAZA PLN: 3D CYFROWY SKARBIEC ══════════ */}
        <g transform="translate(440, 465)">
          <ellipse cx="0" cy="8" rx="145" ry="42" fill="none" stroke="#38bdf8" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="5 7" />
          <ellipse cx="0" cy="8" rx="120" ry="34" fill="none" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="1.2" />

          {/* Grubość krawędzi monety 3D */}
          <path d="M -90 0 C -90 26, 90 26, 90 0 L 90 14 C 90 40, -90 40, -90 14 Z" fill="#0b111c" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1.2" />

          {/* Górna tafla monety PLN */}
          <ellipse cx="0" cy="0" rx="90" ry="26" fill="url(#plnBaseGrad)" stroke="#38bdf8" strokeWidth="1.6" filter="url(#bytePulseGlow)" />
          <ellipse cx="0" cy="0" rx="76" ry="21" fill="none" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 4" />

          <text x="0" y="8" textAnchor="middle" fontSize="28" fontWeight="800" fill="white" letterSpacing="-1px" fontFamily="ui-sans-serif, system-ui">
            zł
          </text>
          <text x="0" y="22" textAnchor="middle" fontSize="8" fontWeight="700" fill="#38bdf8" letterSpacing="0.24em" fontFamily="ui-monospace, monospace">
            PLN POZIOM BAZOWY
          </text>
        </g>

        {/* Holograficzna plakietka przelicznika na środku strumienia */}
        <g transform="translate(440, 335)">
          <rect x="-68" y="-14" width="136" height="28" rx="14" fill="#07121e" stroke="#38bdf8" strokeOpacity="0.7" strokeWidth="1.3" filter="url(#bytePulseGlow)" />
          <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="ui-monospace, monospace">
            1 ZŁ <tspan fill="#38bdf8">≈</tspan> {kurs} ⟠
          </text>
        </g>

        {/* ══════════ 4. CENTRALNY KRYSZTAŁ BYTE 3D (⟠) ══════════ */}
        <g transform="translate(440, 185)">
          <circle cx="0" cy="0" r="70" fill="none" stroke="#38bdf8" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="0" cy="0" r="54" fill="none" stroke="#38bdf8" strokeOpacity="0.22" strokeWidth="1" />

          {/* Płaszczyzny 3D kryształu Byte */}
          <polygon points="0,-48 -38,-6 0,38" fill="url(#crystalFacetA)" stroke="#38bdf8" strokeWidth="1.6" />
          <polygon points="0,-48 38,-6 0,38" fill="url(#crystalFacetB)" stroke="#38bdf8" strokeWidth="1.6" />
          <polygon points="-38,-6 0,38 0,48" fill="#0369a1" fillOpacity="0.3" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1" />
          <polygon points="38,-6 0,38 0,48" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1" />

          {/* Główny symbol Byte */}
          <text x="0" y="10" textAnchor="middle" fontSize="32" fontWeight="900" fill="#38bdf8" filter="url(#bytePulseGlow)" fontFamily="sans-serif">
            ⟠
          </text>
          <text x="0" y="66" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" letterSpacing="0.18em" fontFamily="ui-monospace, monospace">
            JEDNOSTKA BYTE
          </text>
        </g>

        {/* ══════════ 5. SATELITARNE WĘZŁY ZASTOSOWAŃ (JAK W RESEARCH) ══════════ */}
        {/* WĘZEŁ 1: CZAT & TEKST */}
        <g transform="translate(110, 95)">
          <rect x="-10" y="-18" width="165" height="42" rx="10" fill="#07121e" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1.2" />
          <circle cx="-10" cy="3" r="3.5" fill="#38bdf8" />
          <text x="8" y="-1" fontSize="12" fontWeight="600" fill="white" fontFamily="ui-sans-serif, system-ui">
            Czat & Modele AI
          </text>
          <text x="8" y="15" fontSize="10" fontWeight="700" fill="#38bdf8" fontFamily="ui-monospace, monospace">
            od 0.002 ⟠ / zapytanie
          </text>
        </g>

        {/* WĘZEŁ 2: STUDIO OBRAZÓW */}
        <g transform="translate(80, 230)">
          <rect x="-10" y="-18" width="170" height="42" rx="10" fill="#07121e" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1.2" />
          <circle cx="-10" cy="3" r="3.5" fill="#38bdf8" />
          <text x="8" y="-1" fontSize="12" fontWeight="600" fill="white" fontFamily="ui-sans-serif, system-ui">
            Studio Grafik 4K
          </text>
          <text x="8" y="15" fontSize="10" fontWeight="700" fill="#38bdf8" fontFamily="ui-monospace, monospace">
            0.15 ⟠ / generacja
          </text>
        </g>

        {/* WĘZEŁ 3: LOKALNE AI */}
        <g transform="translate(95, 370)">
          <rect x="-10" y="-18" width="165" height="42" rx="10" fill="#07121e" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1.2" />
          <circle cx="-10" cy="3" r="3.5" fill="#38bdf8" />
          <text x="8" y="-1" fontSize="12" fontWeight="600" fill="white" fontFamily="ui-sans-serif, system-ui">
            Lokalne AI (Ollama)
          </text>
          <text x="8" y="15" fontSize="10" fontWeight="700" fill="#10b981" fontFamily="ui-monospace, monospace">
            0.00 ⟠ (BEZ LIMITU)
          </text>
        </g>

        {/* WĘZEŁ 4: DEEP RESEARCH */}
        <g transform="translate(620, 95)">
          <rect x="-10" y="-18" width="170" height="42" rx="10" fill="#07121e" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1.2" />
          <circle cx="160" cy="3" r="3.5" fill="#38bdf8" />
          <text x="8" y="-1" fontSize="12" fontWeight="600" fill="white" fontFamily="ui-sans-serif, system-ui">
            Deep Research
          </text>
          <text x="8" y="15" fontSize="10" fontWeight="700" fill="#38bdf8" fontFamily="ui-monospace, monospace">
            0.80 ⟠ / pełen raport
          </text>
        </g>

        {/* WĘZEŁ 5: KODOWANIE & AGENCI */}
        <g transform="translate(645, 230)">
          <rect x="-10" y="-18" width="165" height="42" rx="10" fill="#07121e" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1.2" />
          <circle cx="155" cy="3" r="3.5" fill="#38bdf8" />
          <text x="8" y="-1" fontSize="12" fontWeight="600" fill="white" fontFamily="ui-sans-serif, system-ui">
            Kodowanie & Audyt
          </text>
          <text x="8" y="15" fontSize="10" fontWeight="700" fill="#38bdf8" fontFamily="ui-monospace, monospace">
            0.05 ⟠ / analiza
          </text>
        </g>

        {/* WĘZEŁ 6: AUDIO & GŁOS */}
        <g transform="translate(630, 370)">
          <rect x="-10" y="-18" width="165" height="42" rx="10" fill="#07121e" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1.2" />
          <circle cx="155" cy="3" r="3.5" fill="#38bdf8" />
          <text x="8" y="-1" fontSize="12" fontWeight="600" fill="white" fontFamily="ui-sans-serif, system-ui">
            Generacja Głosu TTS
          </text>
          <text x="8" y="15" fontSize="10" fontWeight="700" fill="#38bdf8" fontFamily="ui-monospace, monospace">
            0.02 ⟠ / minuta
          </text>
        </g>

        {/* ══════════ PODPIS DOLNY ══════════ */}
        <text x="440" y="555" textAnchor="middle" fontSize="10.5" fontFamily="ui-monospace, monospace" fill="hsl(var(--foreground)/0.45)" letterSpacing="0.18em">
          PŁACISZ W PLN · ZUŻYWASZ W BYTE · NIEWYKORZYSTANE NIE PRZEPADAJĄ
        </text>
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
  const [okres, setOkres] = useState<Okres>('miesiecznie')
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
        <div className="relative mx-auto w-full max-w-[92rem] px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <FadeIn className="relative z-10">
            <h1 className="font-heading text-[clamp(26px,4vw,42px)] font-semibold leading-[1.1] tracking-[-1px] text-foreground">
              Wybierz najlepszy plan dla siebie.
            </h1>
            <p className="mt-3 max-w-lg font-sans text-[14.5px] font-light leading-relaxed text-foreground/55">
              Odblokuj lepsze ceny lub skaluj swoje możliwości, dopasowując plan do bieżących potrzeb.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PlanFinderButton otwarty={dobor} onClick={() => setDobor(v => !v)} />
              <OkresToggle okres={okres} onChange={setOkres} />
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
              <PlanFinder onWybierz={wybierzRekomendacje} />
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

          <p className="relative mt-10 text-center font-sans text-[11.5px] font-light text-foreground/30">
            Wszystkie ceny netto. Przy rozliczeniu rocznym rabat do 17% względem ceny miesięcznej.
            Niewykorzystana pula Byte przechodzi na kolejny okres do trzykrotności puli miesięcznej.
          </p>
        </div>
      </div>

      {/* ══════════ JEDNA WALUTA. PEŁNA KONTROLA. (UKŁAD JAK W DEEP RESEARCH) ══════════ */}
      <Section className="py-16 sm:py-24">
        <FadeIn>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* LEWA KOLUMNA — DOKŁADNIE FORMAT JAK NA WZORZE (IMAGE 2) */}
            <div className="lg:col-span-5 text-left space-y-6">
              <div className="space-y-2.5">
                <SecRule label="BYTE // WALUTA PLATFORMY" />
                <h2 className="font-heading text-[clamp(28px,4vw,48px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
                  Jedna waluta. <br className="hidden sm:block" />
                  <span className="font-normal text-primary">Pełna kontrola.</span>
                </h2>
                <p className="font-sans text-[15px] font-light leading-relaxed text-foreground/70">
                  Byte to wewnętrzna jednostka rozliczeniowa NextByte. Płacisz tylko za to, czego naprawdę używasz — bez sztucznych limitów per-model.
                </p>
              </div>

              {/* LISTA PUNKTÓW Z CYANOWĄ POŚWIATĄ */}
              <div className="space-y-3.5 pt-1 font-sans">
                {BYTE_KARTY.map((k) => (
                  <div key={k.t} className="flex items-start gap-3 text-[13.5px] font-light text-foreground/80 leading-snug">
                    <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] mt-2" />
                    <div>
                      <strong className="font-semibold text-foreground mr-1.5">{k.t}:</strong>
                      <span className="text-foreground/70">{k.d}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* PRZYCISK CTA */}
              <div className="pt-2">
                <GlowButton
                  size="lg"
                  onClick={() => {
                    setDobor(true)
                    requestAnimationFrame(() => byteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
                  }}
                >
                  Sprawdź kalkulator Byte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </GlowButton>
              </div>
            </div>

            {/* PRAWA KOLUMNA — BOGATA WIZUALIZACJA EKOSYSTEMU BYTE */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none w-full">
              <BytePlnTransferVisual />
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ CO DOSTAJESZ W KAŻDYM PLANIE — 1:1 z produkcją: trzy kolumny
           Free/Premium/Ultimate (Lite jest wariantem wejściowym Premium, nie ma
           własnej kolumny w tej tabeli — tak samo jak w cenniku referencyjnym). ══════════ */}
      <Section className="pb-24">
        <FadeIn>
          <BlockHead center label="// Porównanie / tabela" title="Co dostajesz" accent="w każdym planie." className="mx-auto" />
        </FadeIn>

        <FadeIn delay={80} className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-foreground/[0.1]">
                <th className="w-[38%] pb-4 text-left align-bottom font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/30">
                  Funkcja
                </th>
                {['Free', 'Premium', 'Ultimate'].map((nazwa, i) => (
                  <th key={nazwa} className="px-3 pb-4 text-center align-bottom">
                    <span
                      className="font-mono text-[11px] font-medium uppercase tracking-[0.16em]"
                      style={{ color: i === 2 ? 'hsl(var(--primary))' : undefined }}
                    >
                      {nazwa}
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
