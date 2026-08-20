import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Check, Coins, Sparkles, CircleCheck, Minus, ChevronDown,
  Infinity as InfinityIcon, Shield, Wallet, Repeat, ArrowRight, Calculator,
} from 'lucide-react'
import {
  Section, SectionHead, Eyebrow, GlowButton, GhostButton,
  Panel, IconTile, GridBackdrop, Glow, HairLine, AKCENT, akcentTlo,
} from './shared'
import { PLANY, przelicznikByte, POROWNANIE, FAQ } from './data'
import type { Plan } from './data'
import type { HomePage as HomePageId } from './types'

type Okres = 'miesiecznie' | 'rocznie'

/* ═══════════════════════════════════════════════════════════════
   PRZEŁĄCZNIK OKRESU — pigułka przesuwana
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
    <div className="rounded-full border border-foreground/[0.08] bg-foreground/[0.03] p-1 backdrop-blur-md">
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
            'relative z-10 h-10 shrink-0 rounded-full px-6 text-[13px] font-bold transition-colors duration-200',
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
            'relative z-10 flex h-10 shrink-0 items-center gap-2 rounded-full px-6 text-[13px] font-bold transition-colors duration-200',
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
            −17%
          </span>
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ANIMOWANA LICZBA
   ═══════════════════════════════════════════════════════════════ */
function AnimNum({ value }: { value: number }) {
  const [pokaz, setPokaz] = useState(value)
  const poprzedni = useRef(value)

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
      setPokaz(Math.round(start + (koniec - start) * e))
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
  }, [value])

  return <span className="tabular-nums">{pokaz.toLocaleString('pl-PL')}</span>
}

/* ═══════════════════════════════════════════════════════════════
   SUWAK PULI BYTE
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
        <span className="text-[11.5px] font-medium text-foreground/45">Pula Byte miesięcznie</span>
        <span
          className="flex items-center gap-1 rounded-lg border px-2.5 py-0.5"
          style={{ borderColor: akcentTlo(kolor, 30), background: akcentTlo(kolor, 10) }}
        >
          <span className="font-heading text-[12.5px] font-extrabold" style={{ color: kolor }}>
            <AnimNum value={progi[indeks].byte} />
          </span>
          <span className="text-[10px] font-bold" style={{ color: kolor }}>⟠</span>
        </span>
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
                  border: `2px solid hsl(var(--card))`,
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

/* ═══════════════════════════════════════════════════════════════
   KARTA PLANU
   ═══════════════════════════════════════════════════════════════ */
function PlanCard({ plan, okres }: { plan: Plan; okres: Okres }) {
  const [prog, setProg] = useState(0)
  const konfiguracja = plan.progi?.[prog] ?? null
  const cena = konfiguracja ? (okres === 'miesiecznie' ? konfiguracja.miesiecznie : konfiguracja.rocznie) : 0
  const darmowy = plan.progi === null

  return (
    <Panel
      glow={plan.polecany}
      hover={!plan.polecany}
      className={cn('flex flex-col p-7', plan.polecany && 'lg:-my-3 lg:py-10')}
    >
      {plan.polecany && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${akcentTlo(plan.kolor, 12)}, transparent)` }}
        />
      )}

      <div className="relative z-10 flex flex-1 flex-col">
        {/* odznaka */}
        <div className="mb-4 flex h-6 items-center">
          {plan.odznaka && (
            <span
              className="rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em]"
              style={{ color: plan.kolor, borderColor: akcentTlo(plan.kolor, 32), background: akcentTlo(plan.kolor, 10) }}
            >
              ★ {plan.odznaka}
            </span>
          )}
        </div>

        {/* nazwa */}
        <h3 className="font-heading text-[22px] font-extrabold tracking-tight" style={{ color: plan.polecany ? plan.kolor : undefined }}>
          {plan.nazwa}
        </h3>
        <p className="mt-1 text-[12.5px] text-foreground/45">{plan.opis}</p>

        {/* cena */}
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

        {/* CTA */}
        <button
          type="button"
          className={cn(
            'mt-6 h-12 w-full rounded-xl text-[13px] font-bold transition-all duration-200',
            plan.polecany
              ? 'text-background hover:-translate-y-0.5'
              : 'border border-foreground/[0.10] text-foreground/70 hover:border-foreground/25 hover:text-foreground',
          )}
          style={plan.polecany ? {
            background: plan.kolor,
            boxShadow: `0 8px 30px -8px ${akcentTlo(plan.kolor, 80)}`,
          } : undefined}
        >
          {plan.cta}
        </button>

        {/* suwak */}
        {plan.progi && (
          <div className="mt-7">
            <ByteSlider progi={plan.progi} indeks={prog} onChange={setProg} kolor={plan.kolor} />
          </div>
        )}

        {/* przelicznik */}
        {konfiguracja && (
          <div className="mt-6 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4">
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

        {/* cechy */}
        <HairLine className="my-6" />
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
    </Panel>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STRONA CENNIKA
   ═══════════════════════════════════════════════════════════════ */
export function CennikPage({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const [okres, setOkres] = useState<Okres>('miesiecznie')
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  return (
    <div className="flex w-full flex-col">

      {/* ══════════ NAGŁÓWEK ══════════ */}
      <section className="relative overflow-hidden px-4 pb-14 pt-4 sm:px-6 lg:px-8">
        <GridBackdrop />
        <Glow className="left-1/2 top-[-80px] -translate-x-1/2" size={680} opacity={0.12} />

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          <Eyebrow icon={Coins} className="mb-6">Cennik i plany</Eyebrow>
          <h1 className="font-heading text-[38px] font-extrabold leading-[1.06] tracking-tight text-foreground sm:text-[56px]">
            Jedna cena.<br />
            <span className="text-primary drop-shadow-[0_0_44px_hsl(var(--primary)/0.4)]">Cały ekosystem AI.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-foreground/50">
            Wybierz plan dopasowany do skali pracy. Niewykorzystane Byte przechodzą na kolejny okres,
            a plan zmienisz albo anulujesz w dowolnym momencie.
          </p>

          <div className="mt-9">
            <OkresToggle okres={okres} onChange={setOkres} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {[
              { i: Wallet, t: 'Bez karty na starcie' },
              { i: Repeat, t: 'Zmiana planu w każdej chwili' },
              { i: Shield, t: 'Faktura VAT w złotówkach' },
            ].map(x => (
              <span key={x.t} className="flex items-center gap-1.5 text-[11.5px] text-foreground/35">
                <x.i className="h-3.5 w-3.5 text-primary/60" />
                {x.t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ KARTY PLANÓW ══════════ */}
      <Section className="pb-24">
        <div className="grid items-start gap-5 lg:grid-cols-3">
          {PLANY.map(p => <PlanCard key={p.id} plan={p} okres={okres} />)}
        </div>

        <p className="mt-8 text-center text-[11.5px] text-foreground/30">
          Wszystkie ceny netto. Przy rozliczeniu rocznym rabat do 17% względem ceny miesięcznej.
          Niewykorzystana pula Byte przechodzi na kolejny okres do trzykrotności puli miesięcznej.
        </p>
      </Section>

      {/* ══════════ JAK DZIAŁA BYTE ══════════ */}
      <Section className="pb-24">
        <Panel className="relative overflow-hidden p-8 sm:p-12 lg:p-14">
          <Glow className="right-[-80px] top-[-60px]" size={460} opacity={0.10} />
          <div className="relative z-10">
            <SectionHead
              eyebrow="Model rozliczeń"
              eyebrowIcon={Calculator}
              title="Byte — jednostka mocy, nie abonament"
              lead="Zamiast płacić stałą kwotę za dostęp, którego nie wykorzystujesz w pełni, rozliczasz rzeczywiste zużycie. Koszt każdej akcji widzisz zanim ją uruchomisz."
              align="left"
              className="mb-11 max-w-2xl"
            />

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Coins, color: AKCENT.chat,
                  t: 'Jawny koszt każdej akcji',
                  d: 'Wiadomość do modelu, wygenerowany obraz, analiza dokumentu — każda operacja ma cenę w Byte widoczną przed uruchomieniem i zapisaną w historii.',
                },
                {
                  icon: InfinityIcon, color: AKCENT.notes,
                  t: 'Pula nigdy nie przepada',
                  d: 'Niewykorzystane Byte przechodzą na kolejny okres, do trzykrotności puli miesięcznej. Byte z doładowanych paczek nie wygasają w ogóle.',
                },
                {
                  icon: Shield, color: AKCENT.local,
                  t: 'Modele lokalne bez kosztu',
                  d: 'Praca na modelach uruchomionych przez Ollamę nie zużywa ani jednego Byte — niezależnie od planu i liczby zapytań.',
                },
              ].map(k => (
                <div key={k.t} className="flex flex-col gap-3.5">
                  <IconTile icon={k.icon} color={k.color} size="lg" />
                  <h3 className="font-heading text-[16px] font-bold tracking-tight text-foreground">{k.t}</h3>
                  <p className="text-[13px] leading-relaxed text-foreground/50">{k.d}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </Section>

      {/* ══════════ PORÓWNANIE Z KONKURENCJĄ ══════════ */}
      <Section className="pb-24">
        <SectionHead
          eyebrow="Porównanie"
          title="Co dostajesz, czego nie ma gdzie indziej"
          className="mb-12"
        />

        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-foreground/[0.07]">
                <th className="px-5 py-5 text-left text-[12px] font-medium text-foreground/40">Funkcja</th>
                {POROWNANIE.kolumny.map((k, i) => (
                  <th key={k} className="px-4 py-5 text-center">
                    {i === 0
                      ? <span className="font-heading text-[14px] font-extrabold text-primary">{k}</span>
                      : <span className="text-[12.5px] font-medium text-foreground/35">{k}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {POROWNANIE.wiersze.map((r, ri) => (
                <tr key={r.f} className={cn('border-b border-foreground/[0.04] last:border-b-0', ri % 2 === 0 && 'bg-foreground/[0.008]')}>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-foreground/65">{r.f}</td>
                  {r.v.map((v, vi) => (
                    <td key={vi} className={cn('px-4 py-3.5 text-center', vi === 0 && 'bg-primary/[0.035]')}>
                      {v === true ? <CircleCheck className="mx-auto h-[18px] w-[18px] text-emerald-400" />
                        : v === false ? <Minus className="mx-auto h-4 w-4 text-foreground/15" />
                        : <span className={cn('text-[12.5px] font-semibold', vi === 0 ? 'text-primary' : 'text-foreground/45')}>{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section className="pb-24">
        <SectionHead
          eyebrow="Pytania o rozliczenia"
          title="Zanim wybierzesz plan"
          className="mb-12"
        />
        <div className="mx-auto max-w-3xl space-y-2.5">
          {FAQ.map((f, i) => (
            <div
              key={f.q}
              className={cn(
                'overflow-hidden rounded-xl border transition-colors duration-200',
                faqOpen === i ? 'border-primary/20 bg-primary/[0.03]' : 'border-foreground/[0.06] bg-foreground/[0.015]',
              )}
            >
              <button
                type="button"
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                aria-expanded={faqOpen === i}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <span className={cn('flex-1 text-[14px] font-semibold', faqOpen === i ? 'text-foreground' : 'text-foreground/75')}>
                  {f.q}
                </span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform duration-300', faqOpen === i ? 'rotate-180 text-primary' : 'text-foreground/35')} />
              </button>
              <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: faqOpen === i ? '1fr' : '0fr' }}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-foreground/55">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════ CTA ══════════ */}
      <Section className="pb-24">
        <Panel glow className="relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-16">
          <GridBackdrop className="opacity-[0.25]" />
          <Glow className="left-1/2 top-[-100px] -translate-x-1/2" size={640} opacity={0.18} />
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
            <Eyebrow icon={Sparkles} className="mb-5">500 ⟠ na start</Eyebrow>
            <h2 className="font-heading text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[42px]">
              Nie musisz wybierać planu od razu
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-foreground/55">
              Zacznij od planu bezpłatnego ze startową pulą Byte. Przejdziesz wyżej dopiero wtedy,
              gdy poczujesz, że platforma faktycznie zarabia na siebie.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <GlowButton>Załóż darmowe konto</GlowButton>
              <GhostButton onClick={() => onNavigate('b2b')}>Rozwiązania dla firm</GhostButton>
            </div>
          </div>
        </Panel>
      </Section>
    </div>
  )
}
