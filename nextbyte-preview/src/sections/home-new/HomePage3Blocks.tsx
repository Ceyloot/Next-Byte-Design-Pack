import { useState, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  CircleCheck, X, Check, ArrowRight,
} from 'lucide-react'
import {
  Section, GlowButton, GhostButton, FadeIn, Stars,
} from './shared'
import { SecRule, NextByteMarkIcon, OpenAIIcon, AnthropicIcon, GeminiIcon, XaiIcon } from './HomePage'
import { ElevenLabsIcon, KlingIcon } from './brand-icons'
import { POROWNANIE, OPINIE, FAQ } from './data'
import type { HomePage as HomePageId } from './types'

/* ═══════════════════════════════════════════════════════════════════════
   NEXTBYTE — DOLNA POŁOWA STRONY GŁÓWNEJ 3

   Dwie reguły trzymają tę połowę razem:
   1. JAK NAJMNIEJ POJEMNIKÓW — rysunek leży wprost na tle strony, tekst
      trzymają cienkie linie i typografia. Ramkę dostaje tylko to, co bez
      niej się rozjeżdża: tabela porównania i kafle karuzeli opinii.
   2. NIC NIE ŻYJE POZA KADREM — każda sekcja jest montowana dopiero, gdy
      użytkownik do niej dojeżdża, i zdejmowana, gdy odjedzie (LazyBlock).
      Dzięki temu kilkanaście scen SVG nie kręci się naraz w tle.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Montowanie sekcji tylko w okolicy kadru ─────────────────────────── */
/** Ile pikseli poza kadrem sekcja jest jeszcze trzymana zamontowana. */
const LAZY_MARGIN = 900

export function LazyBlock({ children, minHeight = 620 }: { children: ReactNode; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const held = useRef(minHeight)
  const nearRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const apply = (inside: boolean) => {
      if (inside === nearRef.current) return
      if (!inside) {
        // Wysokość mierzymy JESZCZE z treścią w środku — inaczej po
        // odmontowaniu sekcja skurczyłaby się i szarpnęła scrollem.
        const h = el.getBoundingClientRect().height
        if (h > 0) held.current = h
      }
      nearRef.current = inside
      setNear(inside)
    }

    const measure = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 800
      apply(r.bottom > -LAZY_MARGIN && r.top < vh + LAZY_MARGIN)
    }

    // Ścieżka podstawowa: obserwator przecięcia — nie dotyka layoutu.
    const io = new IntersectionObserver(([e]) => apply(!!e?.isIntersecting), {
      rootMargin: `${LAZY_MARGIN}px 0px`,
    })
    io.observe(el)

    // Ścieżka zapasowa: pomiar przy scrollu, dławiony czasem. Potrzebna
    // tam, gdzie obserwator milczy (np. gdy kadr jest zamrożony przez
    // hosta podglądu) — bez niej strona zostałaby pusta.
    let last = 0
    const onScroll = () => {
      const now = Date.now()
      if (now - last < 120) return
      last = now
      measure()
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div ref={ref} style={near ? undefined : { minHeight: held.current }}>
      {near ? children : null}
    </div>
  )
}

/* ── Postęp scrolla — te same progi co sceny 3D modułów wyżej ────────── */
function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setP(1); return }
    let rafId = 0
    let last = -1
    const read = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 800
      const t = Math.max(0, Math.min(1, (vh * 0.9 - rect.top) / (vh * 0.72)))
      const eased = t * t * (3 - 2 * t)
      const q = Math.round(eased * 120) / 120
      if (q !== last) { last = q; setP(q) }
    }
    const loop = () => { read(); rafId = requestAnimationFrame(loop) }
    const io = new IntersectionObserver((entries) => {
      const inView = entries[0]?.isIntersecting ?? true
      if (inView && !rafId) rafId = requestAnimationFrame(loop)
      if (!inView && rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    }, { rootMargin: '160px 0px' })
    io.observe(el)
    read()
    rafId = requestAnimationFrame(loop)
    return () => { io.disconnect(); if (rafId) cancelAnimationFrame(rafId) }
  }, [ref])
  return p
}

/** Czy blok jest w kadrze — do odpalania liczników i pętli czasowych. */
function useOnScreen(ref: React.RefObject<HTMLElement | null>, margin = '-8% 0px') {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(!!e?.isIntersecting), { rootMargin: margin })
    io.observe(el)
    // Zapasowy pomiar przy scrollu — obserwator milczy tam, gdzie host
    // podglądu zamraża kadr, a licznik nie może przez to stać w miejscu.
    let last = 0
    const onScroll = () => {
      const now = Date.now()
      if (now - last < 150) return
      last = now
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 800
      setOn(r.bottom > 0 && r.top < vh)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll, { capture: true })
    }
  }, [ref, margin])
  return on
}

/** Nagłówek sekcji — jeden rytm dla całej dolnej połowy strony. */
function BlockHead({
  label, title, accent, lead, center, className,
}: {
  label: string
  title: ReactNode
  accent?: ReactNode
  lead?: string
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

/** Keyframes używane wyłącznie przez dolne sekcje. */
export function BlockAnimStyles() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @keyframes nb3-burst    { 0%{opacity:0; transform:scale(.35);} 35%{opacity:.9;} 100%{opacity:0; transform:scale(2.1);} }
      @keyframes nb3-marquee  { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
      @keyframes nb3-arrow    { 0%,100% { transform: translateY(0); opacity:.35; } 50% { transform: translateY(5px); opacity:.9; } }
      .nb3-marquee { animation: nb3-marquee 46s linear infinite; will-change: transform; }
      .nb3-marquee:hover { animation-play-state: paused; }
      .nb3-arrow   { animation: nb3-arrow 2.4s ease-in-out infinite; }
      @keyframes nb3-run      { 0% { left: 0%; opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
      .nb3-run     { animation: nb3-run 9s cubic-bezier(.45,0,.55,1) infinite; }
      @keyframes nb3-fan      { to { transform: rotate(360deg); } }
      .nb3-fan     { animation: nb3-fan 6s linear infinite; }
      @media (prefers-reduced-motion: reduce) {
        .nb3-marquee, .nb3-arrow, .nb3-fan, .nb3-run { animation: none !important; }
      }
    `}} />
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   AI LOKALNE — CAŁA SEKCJA O JEDNEJ FUNKCJI

   Cała rzecz sprowadza się do jednego kontrastu i on niesie tę sekcję:
   licznik tokenów kręci się bez przerwy, a licznik kosztów stoi na zerze.
   Praca leci, rachunek się nie rusza — bo model liczy na Twoim sprzęcie.
   Po lewej rachunek, po prawej maszyna, która go generuje.
   ═══════════════════════════════════════════════════════════════════════ */

function PathDots({ d, color, n, dur, r = 2.7, delay = 0 }: {
  d: string; color: string; n: number; dur: number; r?: number; delay?: number
}) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <circle key={i} r={r} fill={color}>
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${delay + (i * dur) / n}s`} path={d} />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.9;1"
            dur={`${dur}s`} repeatCount="indefinite" begin={`${delay + (i * dur) / n}s`} />
        </circle>
      ))}
    </>
  )
}

const AKCENT = 'hsl(var(--primary))'
const TOK_NA_SEK = 62

/** Licznik tokenów — chodzi tylko wtedy, gdy sekcja jest w kadrze.
    Dziesięć kroków na sekundę wystarczy, żeby cyfry wyglądały na żywe,
    i jest dziesięć razy tańsze niż odświeżanie co klatkę. */
function useTokenTicker(run: boolean) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setN(12480); return }
    const iv = setInterval(() => setN((v) => v + TOK_NA_SEK / 10), 100)
    return () => clearInterval(iv)
  }, [run])
  return Math.floor(n)
}

/** Wentylator: obrys, piasta i siedem łopatek kręcących się w kółko. */
function Fan({ cx, cy, r, dur }: { cx: number; cy: number; r: number; dur: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={AKCENT} strokeOpacity={0.28} strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={r - 7} fill="none" stroke="hsl(var(--foreground)/0.07)" strokeWidth={1} />
      <g className="nb3-fan" style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: `${dur}s` }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <path
            key={i}
            d={`M ${cx} ${cy} Q ${cx + r * 0.42} ${cy - r * 0.5} ${cx + r * 0.86} ${cy - r * 0.2} Q ${cx + r * 0.44} ${cy - r * 0.06} ${cx} ${cy} Z`}
            fill={AKCENT} fillOpacity={0.09} stroke={AKCENT} strokeOpacity={0.3} strokeWidth={1}
            transform={`rotate(${(i * 360) / 7} ${cx} ${cy})`}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={9} fill="hsl(var(--background))" stroke={AKCENT} strokeOpacity={0.4} strokeWidth={1.2} />
    </g>
  )
}

const TOK_STRUMIEN = 'M 504 176 H 636'

/** Karta graficzna w rzucie technicznym — z modelem wgranym do pamięci. */
function LocalGpuScene() {
  return (
    <svg viewBox="0 0 660 400" className="w-full h-auto" role="img"
      aria-label="Karta graficzna z wgranym modelem językowym i strumieniem tokenów płynącym do NextByte">
      <defs>
        <linearGradient id="nb3GpuBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={AKCENT} stopOpacity="0.08" />
          <stop offset="100%" stopColor={AKCENT} stopOpacity="0.02" />
        </linearGradient>
        <filter id="nb3GpuGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* śledź montażowy */}
      <g stroke="hsl(var(--foreground)/0.26)" strokeWidth={1.2} fill="none">
        <path d="M 14 56 h 20 v 244 h -20 z" fill="hsl(var(--foreground)/0.03)" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={19} y1={78 + i * 38} x2={29} y2={78 + i * 38} strokeOpacity={0.5} />
        ))}
      </g>

      {/* korpus karty */}
      <rect x={34} y={70} width={466} height={212} rx={12}
        fill="url(#nb3GpuBody)" stroke={AKCENT} strokeOpacity={0.45} strokeWidth={1.4} filter="url(#nb3GpuGlow)" />
      <rect x={44} y={80} width={446} height={192} rx={8} fill="none" stroke={AKCENT} strokeOpacity={0.13} strokeWidth={1} />

      {/* złącze PCIe */}
      <g stroke="hsl(var(--foreground)/0.28)" strokeWidth={1.1}>
        <path d="M 88 282 h 214 v 16 h -214 z" fill="hsl(var(--foreground)/0.04)" />
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={i} x1={98 + i * 10} y1={284} x2={98 + i * 10} y2={296} strokeOpacity={0.35} />
        ))}
      </g>
      <text x={195} y={318} textAnchor="middle" fontSize="10" fontFamily="ui-monospace,monospace"
        fill="hsl(var(--foreground)/0.3)" letterSpacing="0.18em">TWÓJ KOMPUTER</text>

      <Fan cx={150} cy={176} r={60} dur={5.5} />
      <Fan cx={282} cy={176} r={60} dur={7} />

      {/* pamięć z wgranym modelem */}
      <g>
        <rect x={360} y={106} width={126} height={140} rx={8} fill={'hsl(var(--primary)/0.06)'} stroke={AKCENT} strokeOpacity={0.5} strokeWidth={1.3} />
        <text x={423} y={130} textAnchor="middle" fontSize="9.5" fontFamily="ui-monospace,monospace"
          fill={AKCENT} fillOpacity={0.85} letterSpacing="0.16em">MODEL W VRAM</text>
        <text x={423} y={160} textAnchor="middle" fontSize="15" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--foreground)/0.78)" letterSpacing="0.04em">TWÓJ MODEL</text>
        <text x={423} y={178} textAnchor="middle" fontSize="9.5" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--foreground)/0.4)" letterSpacing="0.06em">Ollama / LM Studio</text>
        <rect x={379} y={198} width={88} height={7} rx={3.5} fill="hsl(var(--foreground)/0.08)" />
        <rect x={379} y={198} width={52} height={7} rx={3.5} fill={AKCENT} fillOpacity={0.8} />
        <text x={423} y={224} textAnchor="middle" fontSize="9.5" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--foreground)/0.35)" letterSpacing="0.12em">4,7 / 8 GB</text>
      </g>

      {/* strumień tokenów wychodzący z karty */}
      <path d={TOK_STRUMIEN} fill="none" stroke={AKCENT} strokeOpacity={0.25} strokeWidth={1.2} strokeDasharray="4 6" />
      <PathDots d={TOK_STRUMIEN} color={AKCENT} n={5} dur={2.4} r={2.4} />
      <text x={570} y={164} textAnchor="middle" fontSize="9.5" fontFamily="ui-monospace,monospace"
        fill={AKCENT} fillOpacity={0.7} letterSpacing="0.16em">{TOK_NA_SEK} TOK/S</text>

      {/* to samo okno co zawsze */}
      <g>
        <rect x={508} y={200} width={130} height={50} rx={9}
          fill="hsl(var(--primary)/0.06)" stroke="hsl(var(--primary)/0.35)" strokeWidth={1.2} />
        <text x={573} y={221} textAnchor="middle" fontSize="10.5" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--primary))" fillOpacity={0.85} letterSpacing="0.16em">NEXTBYTE</text>
        <text x={573} y={237} textAnchor="middle" fontSize="9" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--foreground)/0.35)" letterSpacing="0.14em">TEN SAM CZAT</text>
      </g>

      {/* praca bez sieci */}
      <g transform="translate(540 78)">
        <path d="M -12 4 a 17 17 0 0 1 24 0" fill="none" stroke="hsl(var(--foreground)/0.3)" strokeWidth={1.4} strokeLinecap="round" />
        <path d="M -6.5 10 a 9 9 0 0 1 13 0" fill="none" stroke="hsl(var(--foreground)/0.3)" strokeWidth={1.4} strokeLinecap="round" />
        <circle cx={0} cy={16} r={2} fill="hsl(var(--foreground)/0.3)" />
        <line x1={-16} y1={21} x2={16} y2={-4} stroke={AKCENT} strokeOpacity={0.85} strokeWidth={1.8} strokeLinecap="round" />
        <text x={28} y={13} fontSize="10" fontFamily="ui-monospace,monospace"
          fill={AKCENT} fillOpacity={0.75} letterSpacing="0.18em">BEZ SIECI</text>
      </g>
    </svg>
  )
}

/* Po lewej to, co realnie obchodzi czytelnika — że za darmo, bez limitów
   i bez internetu. Liczniki zeszły pod maszynę i zrobiły się drobne: mają
   dowodzić tezy z lewej, a nie konkurować z nią o uwagę. */
const LOKALNE_KORZYSCI = [
  {
    v: '0 zł',
    t: 'Za każdą generację',
    k: 'Ollama i LM Studio są darmowe, model liczy u Ciebie. Nie ma tu żadnej opłaty do zapłacenia.',
  },
  {
    v: 'bez limitów',
    t: 'Tyle, ile wytrzyma karta',
    k: 'Żadnych kolejek, przydziałów ani dziennych pułapów. Generujesz, dopóki chcesz.',
  },
  {
    v: 'offline',
    t: 'Bez internetu i bez transferu',
    k: 'W pociągu, u klienta, w sieci odciętej od świata. Prompt i odpowiedź zostają na Twoim dysku.',
  },
] as const

export function PrivacyLocalAISection() {
  const ref = useRef<HTMLDivElement>(null)
  const on = useOnScreen(ref)
  const tokeny = useTokenTicker(on)

  return (
    <Section className="relative z-10 py-12 sm:py-16">
      <FadeIn>
        <BlockHead
          center
          label="AI lokalne · 0 zł"
          title="Za darmo, bez limitów"
          accent="i bez internetu."
          lead="Podłączasz darmowe Ollama albo LM Studio i NextByte przestaje pytać chmurę. Model chodzi na Twojej karcie graficznej — z tego samego czatu, z tą samą historią rozmów."
        />
      </FadeIn>

      <FadeIn delay={40}>
        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/35">
          <span>działa z</span>
          <span className="text-primary">Ollama</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-foreground/20" />
          <span className="text-primary">LM Studio</span>
        </p>
      </FadeIn>

      <div ref={ref} className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
        {/* ── TO, CO NAJWAŻNIEJSZE ── */}
        <FadeIn className="lg:col-span-5">
          {LOKALNE_KORZYSCI.map((f) => (
            <div key={f.v} className="border-t border-foreground/[0.08] py-6 first:border-t-0 first:pt-0">
              <p
                className="font-heading font-light leading-none tracking-tight text-primary"
                style={{ fontSize: 'clamp(34px,5vw,48px)', filter: 'drop-shadow(0 0 26px hsl(var(--primary)/0.25))' }}
              >
                {f.v}
              </p>
              <p className="mt-3 font-heading text-[14.5px] font-semibold text-foreground">{f.t}</p>
              <p className="mt-1.5 font-sans text-[13px] font-light leading-relaxed text-foreground/50">{f.k}</p>
            </div>
          ))}
        </FadeIn>

        {/* ── MASZYNA I DOWÓD W LICZBACH ── */}
        <FadeIn delay={80} className="lg:col-span-7">
          <LocalGpuScene />

          <div className="mt-2 grid grid-cols-3 gap-4 border-t border-foreground/[0.07] pt-5">
            <div>
              <p className="font-heading text-[22px] font-light leading-none tracking-tight tabular-nums text-foreground/85">
                {tokeny.toLocaleString('pl-PL')}
              </p>
              <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-foreground/30">tokenów w tej sesji</p>
            </div>
            <div>
              <p className="font-heading text-[22px] font-light leading-none tracking-tight text-primary">0</p>
              <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-foreground/30">Byte z Twojej puli</p>
            </div>
            <div>
              <p className="font-heading text-[22px] font-light leading-none tracking-tight text-primary">0,00 zł</p>
              <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-foreground/30">do zapłaty</p>
            </div>
          </div>
          <p className="mt-3 font-sans text-[12px] font-light leading-relaxed text-foreground/35">
            Licznik tokenów rośnie przez cały czas, a dwa pozostałe stoją w miejscu — i będą stały niezależnie od tego,
            ile wygenerujesz.
          </p>
        </FadeIn>
      </div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   TRZY FILARY WARTOŚCI
   Rysunek: TRZY FILARY PODTRZYMUJĄCE BELKĘ.
   ═══════════════════════════════════════════════════════════════════════ */

const FILARY = [
  {
    n: '01',
    tag: 'Selekcja',
    title: 'Tylko narzędzia, które dowożą',
    desc: 'Testujemy dziesiątki nowości miesięcznie i wpuszczamy do platformy wyłącznie to, co skraca realną pracę.',
    metric: '10+ modeli po selekcji',
  },
  {
    n: '02',
    tag: 'Gotowe wzorce',
    title: 'Sprawdzone prompty pod zadania',
    desc: 'Research, treści, analizy, kod. Podmieniasz swoje dane w szablonie i masz wynik, zanim nauczysz się promptować.',
    metric: 'minuta do pierwszego wyniku',
  },
  {
    n: '03',
    tag: 'Całe przepływy',
    title: 'Systemy, nie pojedyncze triki',
    desc: 'Narzędzia spięte w kolejność kroków, którą uruchomisz w firmie tego samego dnia i powtórzysz w przyszłym tygodniu.',
    metric: 'zero integracji do spinania',
  },
] as const

export function ThreePillarsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const p = useSectionProgress(ref)
  const beam = Math.max(0, Math.min(1, (p - 0.6) / 0.3))

  return (
    <Section className="relative z-10 py-16 sm:py-20">
      <FadeIn>
        <BlockHead
          center
          label="Trzy filary"
          title="Platforma stoi"
          accent="na trzech rzeczach."
          lead="Nie na długości listy funkcji. Zabierz którąkolwiek z nich, a zostaje kolejne narzędzie AI — z tych, których rynek produkuje kilkanaście tygodniowo."
        />
      </FadeIn>

      <div ref={ref} className="relative mx-auto mt-14 max-w-5xl">
        <div className="relative mb-8 h-7">
          <span
            aria-hidden
            className="absolute inset-x-0 top-[13px] h-px origin-center bg-gradient-to-r from-transparent via-primary to-transparent"
            style={{
              transform: `scaleX(${0.15 + beam * 0.85})`,
              opacity: 0.2 + beam * 0.8,
              boxShadow: `0 0 ${beam * 16}px hsl(var(--primary) / ${beam * 0.55})`,
            }}
          />
          <span
            className="absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-2 bg-background px-4"
            style={{ opacity: 0.3 + beam * 0.7 }}
          >
            <NextByteMarkIcon className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">platforma</span>
          </span>
        </div>

        <div className="grid gap-x-10 gap-y-14 md:grid-cols-3">
          {FILARY.map((f, i) => {
            const grow = Math.max(0, Math.min(1, (p - 0.06 - i * 0.14) / 0.4))
            return (
              <div key={f.n} className="relative pl-7">
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 top-0 w-px origin-bottom"
                  style={{
                    transform: `scaleY(${grow})`,
                    background: 'linear-gradient(0deg, hsl(var(--primary)/0.1), hsl(var(--primary)/0.85))',
                    boxShadow: `0 0 ${6 + grow * 14}px hsl(var(--primary) / ${grow * 0.45})`,
                  }}
                />
                <span
                  aria-hidden
                  className="absolute -left-[3px] -top-1 h-[7px] w-[7px] rounded-full bg-primary"
                  style={{ opacity: grow, boxShadow: `0 0 ${grow * 16}px hsl(var(--primary))` }}
                />
                <div style={{ opacity: 0.22 + grow * 0.78 }}>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary/70">
                    {f.n} · {f.tag}
                  </span>
                  <h3 className="mt-3.5 font-heading text-[19px] font-light leading-snug tracking-[-0.5px] text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-3 font-sans text-[13.5px] font-light leading-relaxed text-foreground/55">
                    {f.desc}
                  </p>
                  <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-foreground/35">
                    {f.metric}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div aria-hidden className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-foreground/[0.12] to-transparent" />
      </div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   START — TRZY WĘZŁY SPIĘTE KRZYWĄ

   Przebudowa od zera. Kroki nie stoją już w rzędzie równych pól, tylko
   są rozstawione jak węzły schematu: pierwszy u góry z lewej, drugi
   zeszedł niżej, trzeci wraca na linię pierwszego. Spina je krzywa
   Béziera z impulsem lecącym po niej — ten sam język, co połączenia
   w sekcji zintegrowanego rdzenia. Pola są „prawie kaflami”: mają obrys
   i lekkie tło, ale bez ciężaru karty.
   ═══════════════════════════════════════════════════════════════════════ */

const WEZLY = [
  {
    n: '01',
    title: 'Zakładasz konto',
    desc: 'Adres e-mail i trzydzieści sekund. Bez karty płatniczej i bez rozmowy z handlowcem.',
    detal: 'karta niewymagana',
  },
  {
    n: '02',
    title: 'Piszesz pierwszy prompt',
    desc: 'Model znajdujesz wyszukiwarką — wpisujesz nazwę albo samo zadanie. Zmieniasz go w trakcie wątku.',
    detal: 'koszt widoczny przed wysłaniem',
  },
  {
    n: '03',
    title: 'Odbierasz gotowy materiał',
    desc: 'Tekst, analiza albo komplet grafik — z dokładnym rachunkiem w Byte i resztą puli, która przechodzi dalej.',
    detal: 'pierwszy wynik na koncie',
  },
] as const

/** Panel węzła — obrys i ledwie widoczne tło, bez ciężaru pełnej karty. */
function WezelPanel({ w, show }: { w: (typeof WEZLY)[number]; show: number }) {
  return (
    <div
      className="relative rounded-[20px] border border-foreground/[0.07] bg-card/25 p-6 backdrop-blur-[2px] sm:p-7"
      style={{ opacity: 0.2 + show * 0.8, transform: `translateY(${((1 - show) * 12).toFixed(1)}px)` }}
    >
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-px origin-left bg-gradient-to-r from-primary/60 to-transparent"
        style={{ transform: `scaleX(${show})` }}
      />
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[11.5px] font-bold text-primary"
          style={{
            borderColor: `hsl(var(--primary) / ${0.25 + show * 0.4})`,
            boxShadow: `0 0 ${show * 20}px hsl(var(--primary) / ${show * 0.3})`,
          }}
        >
          {w.n}
        </span>
        <h3 className="font-heading text-[17.5px] font-light leading-snug tracking-[-0.4px] text-foreground">
          {w.title}
        </h3>
      </div>
      <p className="mt-3.5 font-sans text-[13px] font-light leading-relaxed text-foreground/55">{w.desc}</p>
      <p className="mt-4 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary/65">
        <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-primary" />
        {w.detal}
      </p>
    </div>
  )
}

/** Krzywe łączące węzły. Rysowane w procentach kontenera, więc trzymają
    się paneli niezależnie od szerokości; grubość kreski nie skaluje się
    razem z viewBoxem dzięki non-scaling-stroke. */
function WezlyPolaczenia({ p }: { p: number }) {
  // Zaczepy siedzą na krawędziach paneli, a nie w ich środkach: pierwsza
  // krzywa wychodzi bokiem z panelu 01 i wchodzi w górną krawędź panelu 02,
  // druga wychodzi bokiem z 02 i wraca w dolną krawędź 03.
  const sciezki = [
    'M 32 21 C 40 21, 42 37, 42 58',
    'M 66 79 C 74 79, 84 63, 84 46',
  ]
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
    >
      {sciezki.map((d, i) => {
        const widoczna = Math.max(0, Math.min(1, (p - 0.12 - i * 0.18) / 0.3))
        return (
          <g key={d}>
            <path
              d={d} fill="none" stroke="hsl(var(--foreground))" strokeOpacity={0.12 + widoczna * 0.06}
              strokeWidth={1.4} vectorEffect="non-scaling-stroke" strokeLinecap="round"
            />
            <path
              d={d} fill="none" stroke="hsl(var(--primary))" strokeWidth={2}
              vectorEffect="non-scaling-stroke" strokeLinecap="round"
              strokeDasharray="14 86"
              style={{
                animation: `nbElectricCurrent ${2.6 + i * 0.4}s linear infinite`,
                animationDelay: `${i * 0.5}s`,
                opacity: widoczna * 0.9,
              }}
            />
          </g>
        )
      })}
    </svg>
  )
}

export function ThreeStepsSection({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const p = useSectionProgress(ref)
  const pokaz = (i: number) => Math.max(0, Math.min(1, (p - 0.05 - i * 0.15) / 0.3))

  return (
    <Section className="relative z-10 py-16 sm:py-20">
      <FadeIn>
        <BlockHead
          center
          label="Start"
          title="Zaczynasz"
          accent="w trzech krokach."
          lead="Dosłownie w trzech: konto, pierwszy prompt, gotowy materiał. Bez wdrożeniowca, bez migracji i bez karty na start."
        />
      </FadeIn>

      <div ref={ref} className="relative mx-auto mt-14 max-w-6xl">
        <WezlyPolaczenia p={p} />

        {/* mobilnie: jeden pod drugim; od lg: 01 u góry z lewej, 02 niżej
           pośrodku, 03 z powrotem na linii pierwszego */}
        <div className="relative grid gap-6 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-14">
          <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1">
            <WezelPanel w={WEZLY[0]} show={pokaz(0)} />
          </div>
          <div className="lg:col-span-4 lg:col-start-5 lg:row-start-2">
            <WezelPanel w={WEZLY[1]} show={pokaz(1)} />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
            <WezelPanel w={WEZLY[2]} show={pokaz(2)} />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-3.5">
          <GlowButton size="lg" onClick={() => onNavigate('cennik')}>Rozpocznij za darmo</GlowButton>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/25">
            konto zakładasz w 30 sekund · bez karty
          </span>
        </div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   BEZPIECZEŃSTWO DANYCH I ARCHITEKTURA UE
   Rysunek: ZAMEK, KTÓRY SIĘ DOMYKA.

   W środku okrągły zamek: dwanaście gwiazd Unii jako pierścień, rygle,
   które wsuwają się do środka w miarę przewijania, i kłódka w osi.
   Cztery zobowiązania stoją dookoła — po dwa z każdej strony, spięte
   z zamkiem cienką linią. Nic tu nie leży w kafelku.
   ═══════════════════════════════════════════════════════════════════════ */

const ZOBOWIAZANIA = [
  {
    n: '01',
    t: 'Nikt nie szkoli AI na Twoich danych.',
    d: 'Rozmowy, pliki i notatki nie wchodzą do żadnego zbioru treningowego — ani u nas, ani u dostawców modeli.',
  },
  {
    n: '02',
    t: 'Wszystko zostaje w Unii Europejskiej.',
    d: 'Serwery, kopie zapasowe i logi w UE. Zgodność z RODO jest tu warunkiem architektury, nie naklejką na stronie.',
  },
  {
    n: '03',
    t: 'Twoje dane są w pełni poufne.',
    d: 'Zero odsprzedaży, zero profilowania reklamowego, zero dostępu podmiotów trzecich. Nikt nie zagląda Ci przez ramię.',
  },
  {
    n: '04',
    t: 'Odejść możesz w każdej chwili.',
    d: 'Eksport wszystkich treści jednym kliknięciem, konto zamykasz od ręki, a dane znikają z infrastruktury w 30 dni.',
  },
] as const

/** Rysunek: PODPISANY DOKUMENT.

    Zamiast kolejnego okręgu — arkusz zobowiązania. Cztery klauzule na
    arkuszu zapalają się w tym samym rytmie, co cztery zasady po bokach,
    a przy przewijaniu dorysowuje się podpis i przybija pieczęć. „Zasada,
    od której nie ma odstępstwa” wygląda wtedy na to, czym jest: na
    zobowiązanie złożone na piśmie, a nie na hasło. */
function CommitmentDoc({ p }: { p: number }) {
  const sign = Math.max(0, Math.min(1, (p - 0.42) / 0.34))
  const stamp = Math.max(0, Math.min(1, (p - 0.72) / 0.2))
  const SIGN_LEN = 268

  return (
    <svg viewBox="0 0 260 336" className="w-full h-auto" role="img"
      aria-label="Arkusz zobowiązania z czterema klauzulami, podpisem i pieczęcią">
      <defs>
        <linearGradient id="nb3DocFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.065" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.012" />
        </linearGradient>
        <filter id="nb3DocShadow" x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#000" floodOpacity="0.55" />
        </filter>
        <filter id="nb3DocGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* arkusz — miękki cień zamiast przesuniętej kopii pod spodem */}
      <g filter="url(#nb3DocShadow)">
        <rect x={26} y={16} width={208} height={296} rx={8}
          fill="url(#nb3DocFill)" stroke="hsl(var(--foreground)/0.15)" strokeWidth={1.2} />
      </g>
      {/* światło na górnej krawędzi kartki */}
      <path d="M 34 16.6 H 226" stroke="hsl(var(--foreground)/0.16)" strokeWidth={1} />
      {/* margines jak w formularzu */}
      <line x1={54} y1={30} x2={54} y2={298} stroke="hsl(var(--primary)/0.14)" strokeWidth={1} />

      {/* główka */}
      <g transform="translate(66 36)">
        <rect x={0} y={0} width={16} height={16} rx={4.5} fill="hsl(var(--primary)/0.14)" stroke="hsl(var(--primary)/0.5)" strokeWidth={1} />
        <path d="M 4.2 12.2 V 3.8 L 11.8 12.2 V 3.8" fill="none" stroke="hsl(var(--primary))" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        <text x={25} y={6.5} fontSize="8.5" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--foreground)/0.55)" letterSpacing="0.2em">ZOBOWIĄZANIE</text>
        <text x={25} y={17} fontSize="8.5" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--foreground)/0.3)" letterSpacing="0.2em">NEXTBYTE · UE</text>
      </g>
      <line x1={66} y1={68} x2={214} y2={68} stroke="hsl(var(--foreground)/0.12)" strokeWidth={1} />

      {/* cztery klauzule — zapalają się razem z zasadami po bokach */}
      {[0, 1, 2, 3].map((i) => {
        const lit = Math.max(0, Math.min(1, (p - 0.04 - i * 0.1) / 0.28))
        const y = 92 + i * 40
        return (
          <g key={i}>
            <text x={34} y={y + 4} fontSize="8.5" fontFamily="ui-monospace,monospace"
              fill="hsl(var(--primary))" fillOpacity={0.22 + lit * 0.6} letterSpacing="0.1em">
              {`0${i + 1}`}
            </text>
            <rect x={66} y={y - 4} width={116} height={3} rx={1.5}
              fill="hsl(var(--primary))" fillOpacity={0.1 + lit * 0.45} />
            <rect x={66} y={y + 5} width={84} height={3} rx={1.5}
              fill="hsl(var(--foreground))" fillOpacity={0.05 + lit * 0.14} />
            {/* ptaszek dostaje własne pole po prawej, nie dotyka linii */}
            <g transform={`translate(198 ${y + 1})`} opacity={0.25 + lit * 0.75}>
              <circle r={8.5} fill="hsl(var(--primary))" fillOpacity={0.06 + lit * 0.1}
                stroke="hsl(var(--primary))" strokeOpacity={0.2 + lit * 0.4} strokeWidth={1} />
              <path d="M -3.6 0.2 l 2.6 2.8 L 4 -2.6" fill="none"
                stroke="hsl(var(--primary))" strokeOpacity={lit} strokeWidth={1.5}
                strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )
      })}

      <line x1={66} y1={244} x2={214} y2={244} stroke="hsl(var(--foreground)/0.09)" strokeWidth={1} />

      {/* podpis dorysowywany przewijaniem */}
      <path
        d="M 68 282 c 2 -14 6 -25 12 -24 c 5 1 5 13 1 22 c -4 9 -8 11 -6 3 c 3 -13 12 -21 20 -18 c 6 3 3 13 -1 19 c -3 4 -1 6 3 3 c 6 -5 11 -16 17 -14 c 5 2 2 11 -2 16 c -3 4 -1 6 3 3 l 12 -10"
        fill="none" stroke="hsl(var(--primary))" strokeOpacity={0.85} strokeWidth={1.8}
        strokeLinecap="round" filter="url(#nb3DocGlow)"
        strokeDasharray={SIGN_LEN} strokeDashoffset={SIGN_LEN * (1 - sign)}
      />
      <line x1={66} y1={290} x2={148} y2={290} stroke="hsl(var(--foreground)/0.18)" strokeWidth={1} />
      <text x={66} y={302} fontSize="7.5" fontFamily="ui-monospace,monospace"
        fill="hsl(var(--foreground)/0.3)" letterSpacing="0.18em">PODPISANO</text>

      {/* pieczęć przybijana na końcu */}
      <g
        transform={`translate(190 274) rotate(-9) scale(${0.86 + stamp * 0.14})`}
        opacity={0.12 + stamp * 0.88}
      >
        <rect x={-32} y={-19} width={64} height={38} rx={4} fill="hsl(var(--background)/0.6)"
          stroke="hsl(var(--primary))" strokeOpacity={0.75} strokeWidth={1.6} />
        <rect x={-27} y={-14} width={54} height={28} rx={2} fill="none"
          stroke="hsl(var(--primary))" strokeOpacity={0.3} strokeWidth={1} />
        <text x={0} y={-3} textAnchor="middle" fontSize="10.5" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--primary))" fillOpacity={0.9} letterSpacing="0.16em">RODO</text>
        <text x={0} y={9} textAnchor="middle" fontSize="7.5" fontFamily="ui-monospace,monospace"
          fill="hsl(var(--primary))" fillOpacity={0.6} letterSpacing="0.16em">UNIA EUROPEJSKA</text>
      </g>

      <text x={130} y={328} textAnchor="middle" fontSize="7.5" fontFamily="ui-monospace,monospace"
        fill="hsl(var(--foreground)/0.24)" letterSpacing="0.16em">OBOWIĄZUJE WE WSZYSTKICH PAKIETACH</text>
    </svg>
  )
}

function Zobowiazanie({ z, align, show }: {
  z: (typeof ZOBOWIAZANIA)[number]; align: 'right' | 'left'; show: number
}) {
  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'right'
          ? 'lg:items-end lg:border-r lg:border-foreground/[0.07] lg:pr-8 lg:text-right'
          : 'lg:items-start lg:border-l lg:border-foreground/[0.07] lg:pl-8 lg:text-left',
      )}
      style={{ opacity: 0.16 + show * 0.84, transform: `translateY(${((1 - show) * 12).toFixed(1)}px)` }}
    >
      <span className="font-heading text-[28px] font-extralight leading-none text-primary/30">{z.n}</span>
      <h3 className="mt-3 font-heading text-[clamp(17px,2vw,20px)] font-light leading-snug tracking-[-0.4px] text-foreground">
        {z.t}
      </h3>
      <p className="mt-2.5 max-w-[330px] font-sans text-[13px] font-light leading-relaxed text-foreground/50">
        {z.d}
      </p>
    </div>
  )
}

export function SecurityEuSection() {
  const ref = useRef<HTMLDivElement>(null)
  const p = useSectionProgress(ref)
  const pokaz = (i: number) => Math.max(0, Math.min(1, (p - 0.04 - i * 0.1) / 0.28))

  return (
    <Section className="relative z-10 py-16 sm:py-20">
      <FadeIn>
        <BlockHead
          center
          label="Bezpieczeństwo"
          title="Cztery zasady, od których"
          accent="nie ma odstępstwa."
          lead="Nie zmieniają się między pakietami i nie mają gwiazdki w regulaminie. Tak jest zbudowana platforma — od strony serwerów, nie od strony marketingu."
        />
      </FadeIn>

      <div ref={ref} className="mx-auto mt-16 grid max-w-6xl items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-14 lg:col-span-4">
          <Zobowiazanie z={ZOBOWIAZANIA[0]} align="right" show={pokaz(0)} />
          <Zobowiazanie z={ZOBOWIAZANIA[1]} align="right" show={pokaz(1)} />
        </div>

        <div className="lg:col-span-4">
          <div className="mx-auto w-full max-w-[270px]">
            <CommitmentDoc p={p} />
          </div>
        </div>

        <div className="flex flex-col gap-14 lg:col-span-4">
          <Zobowiazanie z={ZOBOWIAZANIA[2]} align="left" show={pokaz(2)} />
          <Zobowiazanie z={ZOBOWIAZANIA[3]} align="left" show={pokaz(3)} />
        </div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   PORÓWNANIE — STOS RACHUNKÓW I TO, CZEGO NIE MA NIGDZIE INDZIEJ

   Przebudowa od zera. Macierz cztery-na-dziesięć była neutralna: dawała
   dane, ale nie stawiała tezy i czytało się ją jak arkusz. Tu są dwa
   ruchy. Najpierw koszt — pięć osobnych pasków rachunku obok jednego
   naszego, w skali, więc różnicę widać, zanim się przeczyta liczby.
   Potem argument — cztery rzeczy, których nie ma żadne z tych narzędzi,
   i uczciwa lista tego, co mają one i mamy my.
   ═══════════════════════════════════════════════════════════════════════ */

const OSOBNE_SUBSKRYPCJE = [
  { n: 'ChatGPT Plus', zl: 80 },
  { n: 'Claude Pro', zl: 80 },
  { n: 'Midjourney Std', zl: 120 },
  { n: 'Notion AI', zl: 95 },
  { n: 'Narzędzie wideo AI', zl: 90 },
] as const

const RAZEM = OSOBNE_SUBSKRYPCJE.reduce((a, b) => a + b.zl, 0)

/** Wiersze funkcji bez wiersza z ceną — po nich liczymy braki. */
const FUNKCJE = POROWNANIE.wiersze.slice(0, -1)

export function ComparisonSection() {
  const ref = useRef<HTMLDivElement>(null)
  const p = useSectionProgress(ref)
  const rosnie = Math.min(1, Math.max(0, p / 0.55))
  const [wybrany, setWybrany] = useState<number | null>(1)
  const brakuje = wybrany === null ? 0 : FUNKCJE.filter((r) => r.v[wybrany] === false).length

  return (
    <Section className="relative z-10 py-16 sm:py-20">
      <FadeIn>
        <BlockHead
          center
          label="Porównanie"
          title="Pięć rachunków miesięcznie"
          accent="albo jeden."
          lead="Tyle kosztuje trzymanie osobnych subskrypcji na czat, grafikę, wideo i notatki — w obcych walutach, z pięcioma fakturami do rozliczenia."
        />
      </FadeIn>

      {/* ── STOS RACHUNKÓW ── */}
      <div ref={ref} className="mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-2 lg:gap-14">
        <FadeIn>
          <div className="flex items-baseline justify-between border-b border-foreground/[0.08] pb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/35">osobno</span>
            <span className="font-heading text-[26px] font-light leading-none tracking-tight text-foreground/60">
              {RAZEM} <span className="text-[13px] text-foreground/35">zł/mc</span>
            </span>
          </div>

          <div className="mt-5 space-y-2.5">
            {OSOBNE_SUBSKRYPCJE.map((s, i) => (
              <div key={s.n} className="flex items-center gap-3.5">
                <span className="w-[132px] shrink-0 font-sans text-[12.5px] font-light text-foreground/50">{s.n}</span>
                <span className="h-[9px] flex-1 overflow-hidden rounded-full bg-foreground/[0.05]">
                  <span
                    className="block h-full rounded-full bg-foreground/25"
                    style={{
                      width: `${(s.zl / 130) * 100 * Math.min(1, Math.max(0, (rosnie - i * 0.08) / 0.5))}%`,
                      transition: 'none',
                    }}
                  />
                </span>
                <span className="w-[52px] shrink-0 text-right font-mono text-[11px] text-foreground/40">{s.zl} zł</span>
              </div>
            ))}
          </div>

          <p className="mt-5 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/30">
            <X className="h-3.5 w-3.5" /> pięć faktur · trzy waluty · pięć logowań
          </p>
        </FadeIn>

        <FadeIn delay={90}>
          <div className="flex items-baseline justify-between border-b border-primary/30 pb-3">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary/75">
              <NextByteMarkIcon className="h-3.5 w-3.5" /> w NextByte
            </span>
            <span
              className="font-heading text-[40px] font-light leading-none tracking-tight text-primary"
              style={{ filter: 'drop-shadow(0 0 26px hsl(var(--primary)/0.35))' }}
            >
              od 0 <span className="text-[15px] text-foreground/40">zł/mc</span>
            </span>
          </div>

          <div className="mt-5 flex items-center gap-3.5">
            <span className="w-[132px] shrink-0 font-sans text-[12.5px] font-light text-foreground/70">Wszystko razem</span>
            <span className="h-[9px] flex-1 overflow-hidden rounded-full bg-foreground/[0.05]">
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${18 * rosnie}%`, boxShadow: '0 0 14px hsl(var(--primary)/0.6)' }}
              />
            </span>
            <span className="w-[52px] shrink-0 text-right font-mono text-[11px] font-bold text-primary">0 zł</span>
          </div>

          <p className="mt-5 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary/60">
            <CircleCheck className="h-3.5 w-3.5" /> jedna faktura vat 23% · pln · jedno logowanie
          </p>

          <p className="mt-6 font-sans text-[13px] font-light leading-relaxed text-foreground/50">
            Plan darmowy obejmuje interfejs, notatki, kalendarz i modele lokalne. Za resztę płacisz jedną pulą Byte —
            tylko za to, co faktycznie wygenerujesz, a niewykorzystana część przechodzi na kolejny miesiąc.
          </p>
        </FadeIn>
      </div>

      {/* ── DOWÓD: MACIERZ, KTÓRĄ SIĘ PRZEPYTUJE ──
         Rozsypane bloki „czego tam nie ma” zastąpiła macierz, bo tylko ona
         pokazuje braki wprost. Żeby nie była martwym arkuszem, wybiera się
         w niej konkurenta: jego kolumna wychodzi na wierzch, reszta gaśnie,
         a nad tabelą staje licznik brakujących funkcji. */}
      <FadeIn delay={120}>
        <div className="mx-auto mt-16 max-w-5xl border-t border-foreground/[0.08] pt-10">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/35">porównaj z</span>
            {POROWNANIE.kolumny.slice(1).map((k, i) => {
              const idx = i + 1
              const on = wybrany === idx
              return (
                <button
                  key={k}
                  onClick={() => setWybrany(on ? null : idx)}
                  aria-pressed={on}
                  className={cn(
                    'rounded-full border px-4 py-1.5 font-sans text-[12.5px] transition-all duration-300',
                    on
                      ? 'border-primary/45 bg-primary/[0.1] text-foreground'
                      : 'border-foreground/[0.09] text-foreground/45 hover:border-foreground/20 hover:text-foreground/75',
                  )}
                >
                  {k}
                </button>
              )
            })}
          </div>

          <p className="mt-6 text-center font-heading text-[clamp(17px,2.2vw,22px)] font-light leading-snug tracking-[-0.4px] text-foreground">
            {wybrany === null ? (
              <>Wybierz narzędzie, żeby zobaczyć, <span className="text-foreground/45">czego w nim nie ma.</span></>
            ) : (
              <>
                <span className="text-primary">{POROWNANIE.kolumny[wybrany]}</span> nie ma{' '}
                <span className="text-primary">{brakuje} z {FUNKCJE.length}</span> rzeczy z tej listy.
              </>
            )}
          </p>

          {/* ── MACIERZ ── */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-foreground/[0.08]">
                  <th className="w-[44%] pb-3 pr-4 text-left font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/30">
                    Funkcja
                  </th>
                  {POROWNANIE.kolumny.map((k, ci) => (
                    <th
                      key={k}
                      className={cn(
                        'relative px-3 pb-3 pt-2 text-center align-bottom transition-opacity duration-300',
                        ci === 0 && 'bg-primary/[0.07]',
                        wybrany !== null && ci !== 0 && ci !== wybrany && 'opacity-25',
                      )}
                    >
                      {ci === 0 ? (
                        <>
                          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-b bg-primary" />
                          <span className="inline-flex flex-col items-center gap-1">
                            <NextByteMarkIcon className="h-4 w-4 text-primary" />
                            <span className="font-heading text-[13px] font-semibold text-primary">{k}</span>
                          </span>
                        </>
                      ) : (
                        <span className={cn('font-heading text-[12.5px] font-light', ci === wybrany ? 'text-foreground/80' : 'text-foreground/35')}>
                          {k}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POROWNANIE.wiersze.map((r, ri) => {
                  const show = Math.max(0, Math.min(1, (p - 0.28 - ri * 0.03) / 0.2))
                  const ostatni = ri === POROWNANIE.wiersze.length - 1
                  return (
                    <tr key={r.f} className="border-b border-foreground/[0.05] last:border-b-0" style={{ opacity: 0.14 + show * 0.86 }}>
                      <td className={cn('py-2.5 pr-4 text-[12.5px] leading-snug', ostatni ? 'font-semibold text-foreground' : 'font-light text-foreground/65')}>
                        {r.f}
                      </td>
                      {r.v.map((v, vi) => (
                        <td
                          key={vi}
                          className={cn(
                            'relative px-3 py-2.5 text-center transition-opacity duration-300',
                            vi === 0 && 'bg-primary/[0.05]',
                            wybrany !== null && vi !== 0 && vi !== wybrany && 'opacity-20',
                          )}
                        >
                          {vi === 0 && (
                            <>
                              <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-primary/20" />
                              <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-px bg-primary/20" />
                            </>
                          )}
                          {v === true ? (
                            <CircleCheck
                              className={cn('mx-auto h-[17px] w-[17px]', vi === 0 ? 'text-primary' : 'text-foreground/45')}
                              style={vi === 0 ? { filter: 'drop-shadow(0 0 7px hsl(var(--primary)/0.6))' } : undefined}
                            />
                          ) : v === false ? (
                            <X className={cn('mx-auto h-4 w-4', vi === wybrany ? 'text-rose-300/70' : 'text-foreground/15')} />
                          ) : (
                            <span className={cn('font-sans', ostatni ? 'text-[14px]' : 'text-[12px]', vi === 0 ? 'font-semibold text-primary' : 'font-light text-foreground/40')}>
                              {v}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      <p className="mx-auto mt-8 max-w-2xl text-center font-sans text-[11.5px] font-light leading-relaxed text-foreground/30">
        Ceny konkurencji według cenników katalogowych, przeliczone po bieżącym kursie. Twój rachunek w NextByte zależy
        od realnego zużycia — koszt każdego zapytania widzisz przed wysłaniem.
      </p>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   ZAUFANIE I OPINIE
   Karuzela jadąca w kółko. Pięć miejsc: trzy wypełnione, dwa czekają na
   kolejne wdrożenia — zarezerwowane wprost, zamiast udawać komplet.
   ═══════════════════════════════════════════════════════════════════════ */

type Opinia = {
  id: string
  kategoria: string
  rola: string
  tekst: string
  metryka: string
  pusta?: boolean
}

const MIEJSCE = (id: string): Opinia => ({
  id, kategoria: 'Miejsce zarezerwowane', rola: 'Kolejne wdrożenie w toku', tekst: '', metryka: '', pusta: true,
})

/* Wolne miejsca są przeplatane z opiniami — postawione obok siebie robiły
   w środku taśmy jedną dużą dziurę. */
const OPINIE_KARUZELA: Opinia[] = [
  { ...OPINIE[0] },
  MIEJSCE('04'),
  { ...OPINIE[1] },
  { ...OPINIE[2] },
  MIEJSCE('05'),
]

/** Wpis w taśmie — bez kafelka. Kolumny rozdziela cienka pionowa kreska,
    dokładnie tak jak filary i zobowiązania wyżej, więc karuzela wpada
    w ten sam język co reszta strony zamiast wyglądać jak wklejone karty. */
function OpiniaWpis({ o }: { o: Opinia }) {
  if (o.pusta) {
    return (
      <div className="flex w-[290px] shrink-0 flex-col justify-center border-l border-dashed border-foreground/[0.11] px-8 sm:w-[350px]">
        <span className="font-mono text-[10px] tracking-[0.16em] text-foreground/20">{o.id}</span>
        <p className="mt-4 font-heading text-[15px] font-light leading-snug text-foreground/30">
          {o.kategoria}
        </p>
        <p className="mt-2 font-sans text-[12px] font-light text-foreground/25">{o.rola}</p>
      </div>
    )
  }
  return (
    <div className="flex w-[290px] shrink-0 flex-col border-l border-foreground/[0.09] px-8 sm:w-[350px]">
      <div className="flex items-center gap-3.5">
        <span className="font-mono text-[10px] tracking-[0.16em] text-primary/60">{o.id}</span>
        <Stars n={5} size={11} />
      </div>

      <p className="mt-5 font-heading text-[15px] font-light leading-[1.62] tracking-[-0.2px] text-foreground/80">
        {o.tekst}
      </p>

      <div className="mt-auto pt-7">
        <p className="font-heading text-[13px] font-semibold leading-snug text-foreground">{o.kategoria}</p>
        <p className="mt-0.5 font-sans text-[11.5px] font-light text-foreground/40">{o.rola}</p>
        <p className="mt-3 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-primary/75">
          <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
          {o.metryka}
        </p>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <div className="relative z-10 py-16 sm:py-20">
      <Section>
        <FadeIn>
          <BlockHead center label="Zaufanie" title="Nie nasze słowa." accent="Ich wyniki." />
        </FadeIn>
      </Section>

      {/* Taśma jedzie przez całą szerokość strony, nie przez kolumnę treści —
         inaczej skrajne wpisy wyglądały jak przycięte w połowie. Wygaszenie
         robi maska alfa, a nie prostokąt w kolorze tła: tło strony ma własny
         gradient, więc nakładka zostawiała widoczny szew. */}
      <div
        className="relative mt-14 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)',
        }}
      >
        <div className="flex w-max items-stretch nb3-marquee">
          {[...OPINIE_KARUZELA, ...OPINIE_KARUZELA].map((o, i) => (
            <div key={`${o.id}-${i}`} className="flex min-h-[290px] items-stretch">
              <OpiniaWpis o={o} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   BAZA WIEDZY I FAQ
   Lewa kolumna zostaje przyklejona i jedzie razem ze scrollem, akordeon
   dopchnięty do prawej. Rozwijanie idzie po zmierzonej wysokości treści,
   a nie po zgadywanym maksimum — stąd żadnego zacinania na przejściu.
   ═══════════════════════════════════════════════════════════════════════ */

function FaqRow({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const [h, setH] = useState(0)

  // Wysokość mierzymy raz i po każdej zmianie szerokości okna — animacja
  // dostaje konkretną liczbę pikseli, więc nie skacze i nie przycina.
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
          'flex-1 font-heading text-[clamp(16px,1.9vw,19px)] font-light leading-snug tracking-[-0.4px] transition-colors duration-200',
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
        <p ref={bodyRef} className="pb-7 pr-10 font-sans text-[14px] font-light leading-[1.7] text-foreground/55">
          {a}
        </p>
      </div>
    </div>
  )
}

export function FaqSection({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <Section className="relative z-10 py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* ── LEWA KOLUMNA — jedzie razem ze scrollem ── */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <FadeIn>
              <SecRule label="Baza wiedzy" />
              <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.06] tracking-[-2px] text-foreground">
                Wasze pytania.<br />
                <span className="font-normal text-primary">Nasze odpowiedzi.</span>
              </h2>
              <p className="mt-4 max-w-sm font-sans text-[14.5px] font-light leading-relaxed text-foreground/55">
                Sześć rzeczy, o które pytacie najczęściej przed założeniem konta — o koszty, o prywatność i o to, co się
                dzieje, gdy chcecie zrezygnować.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-sans text-[13px] font-light text-foreground/40">Nie ma tu Twojego pytania?</span>
                <button
                  onClick={() => onNavigate('cennik')}
                  className="group inline-flex items-center gap-1.5 font-heading text-[13px] font-semibold text-primary transition-colors hover:text-primary/75"
                >
                  Zajrzyj do cennika
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* ── AKORDEON — dopchnięty do prawej ── */}
        <FadeIn delay={80} className="lg:col-span-8">
          {FAQ.map((f, i) => (
            <FaqRow key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </FadeIn>
      </div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   FINALNE CALL TO ACTION — KONWERGENCJA
   ═══════════════════════════════════════════════════════════════════════ */

const ZNAKI = [
  { Icon: OpenAIIcon, a: -1.24 },
  { Icon: AnthropicIcon, a: -0.72 },
  { Icon: GeminiIcon, a: -0.24 },
  { Icon: XaiIcon, a: 0.24 },
  { Icon: ElevenLabsIcon, a: 0.72 },
  { Icon: KlingIcon, a: 1.24 },
] as const

export function FinalCtaSection({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const p = useSectionProgress(ref)
  const merged = Math.max(0, Math.min(1, (p - 0.15) / 0.6))
  const flash = p > 0.82

  return (
    <Section className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div ref={ref} className="relative mx-auto max-w-3xl text-center">

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-visible"
          style={{
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 80%)',
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-[360px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] blur-3xl transition-opacity duration-700"
            style={{
              opacity: 0.35 + merged * 0.65,
              background: 'radial-gradient(ellipse at center, hsl(var(--primary)/0.3) 0%, hsl(var(--primary)/0.06) 50%, transparent 75%)',
            }}
          />
          <svg viewBox="0 0 1000 350" className="relative h-full w-full" fill="none">
            <defs>
              <linearGradient id="nb3CtaArch" x1="0%" y1="100%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                <stop offset="20%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
                <stop offset="80%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
              <filter id="nb3CtaBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path d="M 50 330 C 200 60, 800 60, 950 330" stroke="url(#nb3CtaArch)" strokeWidth={1.75} filter="url(#nb3CtaBlur)" />
          </svg>
        </div>

        <div aria-hidden className="pointer-events-none relative mx-auto mb-9 h-[132px] w-full max-w-[560px]">
          {ZNAKI.map(({ Icon, a }, i) => {
            const x = Math.sin(a) * 232 * (1 - merged)
            const y = (1 - Math.cos(a)) * 96 * (1 - merged)
            return (
              <span
                key={i}
                className="absolute left-1/2 top-[74px] flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/[0.1] bg-card/70 backdrop-blur-sm"
                style={{
                  transform: `translate(-50%,-50%) translate(${x.toFixed(1)}px, ${(-y).toFixed(1)}px) scale(${1 - merged * 0.45})`,
                  opacity: 0.15 + (1 - merged) * 0.85,
                }}
              >
                <Icon className="h-5 w-5 text-foreground/55" />
              </span>
            )
          })}

          <span
            className="absolute left-1/2 top-[74px] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border"
            style={{
              borderColor: `hsl(var(--primary) / ${0.2 + merged * 0.5})`,
              background: `hsl(var(--primary) / ${0.05 + merged * 0.12})`,
              boxShadow: `0 0 ${20 + merged * 60}px hsl(var(--primary) / ${0.15 + merged * 0.45})`,
              transform: `translate(-50%,-50%) scale(${0.85 + merged * 0.15})`,
            }}
          >
            <NextByteMarkIcon className="h-7 w-7 text-primary" />
          </span>

          {flash && (
            <span
              className="absolute left-1/2 top-[74px] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50"
              style={{ animation: 'nb3-burst 1.8s ease-out infinite' }}
            />
          )}
        </div>

        <h2
          className="relative mb-4 font-heading font-light leading-[1.08] tracking-[-2px] text-foreground"
          style={{ fontSize: 'clamp(2.4rem, 5.2vw, 4rem)' }}
        >
          Wszystkie modele AI. <br />
          <span
            className="font-normal text-primary transition-[filter] duration-700"
            style={{ filter: `drop-shadow(0 0 ${12 + merged * 30}px hsl(var(--primary) / ${0.25 + merged * 0.35}))` }}
          >
            Jeden standard pracy.
          </span>
        </h2>

        <p className="relative mx-auto mb-8 max-w-md font-sans text-[15px] font-light leading-relaxed text-foreground/65 sm:text-[16px]">
          Czat, studio grafik 4K, research i baza wiedzy w jednym oknie. Zaczynasz za 0 zł, bez karty, po polsku.
        </p>

        <div className="relative flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          <GlowButton size="lg" onClick={() => onNavigate('cennik')}>Rozpocznij za darmo</GlowButton>
          <GhostButton size="lg" onClick={() => onNavigate('cennik')}>Zobacz cennik i pakiety</GhostButton>
        </div>

        <p className="relative mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/30">
          <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary/60" /> bez karty</span>
          <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary/60" /> serwery w ue</span>
          <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary/60" /> faktura vat w pln</span>
        </p>
      </div>
    </Section>
  )
}
