import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles, MessageSquare, Lock,
  ImagePlus, FileSearch, MessagesSquare, Database, BarChart3, ZoomIn,
  Zap, Bot, Cpu, ShieldCheck, Layers, ArrowRight, Star,
  Coins, Wand2, Calendar, CheckSquare, NotebookPen, ShoppingCart, Repeat, Upload, BrainCircuit,
  GraduationCap, RefreshCw, Headphones, Timer, Rocket, Brain, Crown, CheckCircle2, CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'
import {
  GlassCard, GlassButton, GlassBadge, GlassFeatureRow, GlassCompareTable,
  GlassAccordion, GlassAccordionItem,
} from '@/components/glass'
import type { CompareCellValue } from '@/components/glass'

type Billing = 'monthly' | 'yearly'

// ── Animated Number Counter ─────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)

  useEffect(() => {
    const startValue = prevValueRef.current
    const endValue = value
    if (startValue === endValue) return

    const startTime = performance.now()
    const duration = 400

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (endValue - startValue) * easeProgress)
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        prevValueRef.current = endValue
      }
    }

    requestAnimationFrame(step)
  }, [value])

  return <span className="tabular-nums transition-all inline-block">{displayValue.toLocaleString('pl')}</span>
}

// ── Dynamic Byte Config (miesięcznie / rocznie -17%) ──────────────────
const PREMIUM_STEPS = [
  { byte: 495,  monthly: 99,  yearly: 82,  badge: null,           przelicznik: '5,00 Byte / zł', modelKosztow: '50% ceny w Byte' },
  { byte: 950,  monthly: 179, yearly: 149, badge: null,           przelicznik: '5,30 Byte / zł', modelKosztow: '53% ceny w Byte' },
  { byte: 1500, monthly: 269, yearly: 225, badge: 'ZBALANSOWANY', przelicznik: '5,58 Byte / zł', modelKosztow: '56% ceny w Byte' },
]

const ULTIMATE_STEPS = [
  { byte: 2450, monthly: 349, yearly: 290, badge: 'TOP WYBÓR',       przelicznik: '7,02 Byte / zł', modelKosztow: '70% ceny w Byte' },
  { byte: 4150, monthly: 589, yearly: 490, badge: 'DLA ZESPOŁÓW',    przelicznik: '7,05 Byte / zł', modelKosztow: '70,5% ceny w Byte' },
  { byte: 6070, monthly: 849, yearly: 710, badge: 'MAX PAKIET',      przelicznik: '7,15 Byte / zł', modelKosztow: '71,5% ceny w Byte' },
]

function byteToStats(byte: number) {
  return {
    obrazy: Math.round(byte / 3),
    wiadomosci: byte,
    analizy: Math.round(byte / 2),
    zadania: byte,
  }
}

// ── Odznaka planu ("★ NAJLEPSZA OFERTA") — jeden wiersz, ta sama wysokość
// we wszystkich trzech kartach (niewidoczne odznaki zachowują spacing). ──
function PlanBadge({ visible, savings }: { visible: boolean; savings?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between h-7">
      <span aria-hidden={!visible} className={cn('transition-opacity', visible ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <GlassBadge intent="primary" className="whitespace-nowrap">★ NAJLEPSZA OFERTA</GlassBadge>
      </span>
      <span aria-hidden={!savings} className={cn('transition-opacity', savings ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <GlassBadge intent="primary" size="sm" className="whitespace-nowrap font-extrabold">{savings || ' '}</GlassBadge>
      </span>
    </div>
  )
}

// ── Interactive Byte Slider ────────────────────────────────────────
function ByteSlider({
  steps,
  value,
  onChange,
  badge,
  isUltimate = false,
}: {
  steps: { byte: number; monthly: number; yearly: number; badge: string | null }[]
  value: number
  onChange: (v: number) => void
  badge?: string | null
  isUltimate?: boolean
}) {
  const stepValues = steps.map(s => s.byte)
  const activeIndex = stepValues.indexOf(value) >= 0 ? stepValues.indexOf(value) : 0
  const pct = (activeIndex / (stepValues.length - 1)) * 100

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/50 font-medium">Pula Byte miesięcznie:</span>
          <div className={cn(
            'flex items-center gap-1 px-2.5 py-0.5 rounded-lg border transition-all',
            isUltimate ? 'bg-primary/20 border-primary/40' : 'bg-primary/10 border-primary/25',
          )}>
            <span className="text-xs font-extrabold text-primary"><AnimatedNumber value={value} /></span>
            <span className="text-[10px] text-primary font-semibold">⟠</span>
          </div>
        </div>
        {badge && (
          <GlassBadge intent={isUltimate ? 'primary' : 'success'} size="sm" className="shrink-0 whitespace-nowrap uppercase tracking-wider font-extrabold">
            {badge}
          </GlassBadge>
        )}
      </div>

      <div className="relative cursor-pointer touch-none select-none my-3 flex items-center min-h-[28px]">
        <div className="relative w-full h-1.5 rounded-full bg-foreground/10 border border-foreground/10 overflow-hidden shadow-inner">
          <div
            className={cn(
              'absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out',
              isUltimate ? 'bg-primary shadow-[0_0_12px_hsl(var(--primary))]' : 'bg-primary/80 shadow-[0_0_8px_hsl(var(--primary)/0.5)]',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-0.5 pointer-events-none">
          {stepValues.map((step, idx) => {
            const isActive = idx === activeIndex
            const isPassed = idx < activeIndex
            return (
              <button
                key={step}
                type="button"
                onClick={() => onChange(step)}
                className="relative flex flex-col items-center group cursor-pointer focus:outline-none pointer-events-auto"
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center shadow-sm',
                    isActive
                      ? 'bg-primary border-primary shadow-[0_0_14px_hsl(var(--primary))] scale-110 ring-2 ring-primary/25'
                      : isPassed
                        ? 'bg-primary/25 border-primary/40 opacity-40 scale-85 group-hover:opacity-80'
                        : 'bg-card border-border/80 group-hover:border-primary/60 group-hover:scale-105',
                  )}
                />
                <span
                  className={cn(
                    'absolute top-5 text-[10px] font-semibold transition-colors whitespace-nowrap',
                    isActive ? 'text-primary font-bold' : isPassed ? 'text-primary/70 font-medium' : 'text-foreground/40 group-hover:text-foreground/60',
                  )}
                >
                  {step}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="h-3" />
    </div>
  )
}

// ── "TO WYSTARCZY NA:" Section — nb-wglobienie: identyczny wygląd
// w glass i normal (jedna klasa oparta na alfie foreground). ──────
function ByteStatsList({ byte, isUltimate = false }: { byte: number; isUltimate?: boolean }) {
  const s = byteToStats(byte)
  return (
    <div className={cn('my-4 p-3 rounded-xl space-y-2', isUltimate ? 'bg-primary/[0.06] border border-primary/20' : 'nb-wglobienie')}>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/45 mb-2">
        TO WYSTARCZY NA MIESIĄC:
      </p>
      <div className="space-y-2 text-xs">
        {[
          { icon: ImagePlus, val: s.obrazy, label: 'generacji obrazów Fast' },
          { icon: MessageSquare, val: s.wiadomosci, label: 'wiadomości AI Pro' },
          { icon: FileSearch, val: s.analizy, label: 'analiz dokumentów AI' },
          { icon: Sparkles, val: s.zadania, label: 'zadań Asystenta' },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-2.5 text-foreground/60">
            <row.icon className={cn('w-4 h-4 shrink-0', isUltimate ? 'text-primary' : 'text-primary/80')} />
            <span>≈ <span className="font-bold text-foreground"><AnimatedNumber value={row.val} /></span> {row.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── "UNLIMITED:" Section ───────────────────────────────────────────
function UnlimitedSection({ isUltimate = false }: { isUltimate?: boolean }) {
  const rows = [
    { icon: MessagesSquare, label: 'Chat AI' },
    { icon: BarChart3, label: 'Kalendarz, Zadania, Notatki' },
    { icon: Database, label: 'Baza Danych' },
    { icon: Lock, label: 'Szyfrowanie' },
  ]
  if (isUltimate) rows.push({ icon: ZoomIn, label: 'Enhancer 2x (Jakość HD)' })
  return (
    <div className="my-4 pt-3 border-t border-foreground/[0.08] space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/45 mb-2">UNLIMITED:</p>
      <div className="space-y-2 text-xs">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-foreground/60">
              <row.icon className="w-3.5 h-3.5 text-primary/80 shrink-0" />
              <span>{row.label}</span>
            </div>
            <GlassBadge intent="primary" size="sm" className="uppercase tracking-wider font-extrabold">UNLIMITED</GlassBadge>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Przelicznik / Model kosztów Tiles ─────────────────────────────────
function CostTiles({ przelicznik, modelKosztow, isUltimate = false }: { przelicznik: string; modelKosztow: string; isUltimate?: boolean }) {
  return (
    <div className="my-4 grid grid-cols-2 gap-2 text-[11px]">
      {[
        { label: 'Przelicznik', value: przelicznik },
        { label: 'Model kosztów', value: modelKosztow },
      ].map((tile, i) => (
        <div key={i} className={cn('rounded-xl p-2.5', isUltimate ? 'bg-primary/[0.06] border border-primary/30' : 'nb-wglobienie')}>
          <p className="text-[10px] text-foreground/45 font-medium">{tile.label}</p>
          <p className={cn('font-bold mt-0.5', isUltimate ? 'text-primary text-xs' : 'text-foreground')}>{tile.value}</p>
        </div>
      ))}
    </div>
  )
}

// ── Porównanie / Tabela ─────────────────────────────────────────────
const COMPARE_ROWS: { label: string; values: CompareCellValue[] }[] = [
  { label: 'Chat AI (wszystkie modele)',        values: ['Limit dzienny', 'yes', 'yes'] },
  { label: 'Notatki i Kalendarz',                values: ['yes', 'yes', 'yes'] },
  { label: 'Baza Danych i Szyfrowanie',          values: ['yes', 'yes', 'yes'] },
  { label: 'Personalny Asystent (executor)',     values: ['no', 'yes', 'yes'] },
  { label: 'Studio Zdjęć AI',                    values: ['Ograniczone', 'yes', 'yes'] },
  { label: 'Pamięć długoterminowa AI',           values: ['no', 'yes', 'yes'] },
  { label: 'Akademia Premium (kursy)',           values: ['no', 'yes', 'yes'] },
  { label: 'Deep Research (raporty AI)',         values: ['no', 'yes', 'yes'] },
  { label: 'Tryb Ultra (myślenie rozbudowane)',  values: ['no', 'yes', 'yes'] },
  { label: 'Lokalny AI (LM Studio / Ollama)',    values: ['no', 'yes', 'yes'] },
  { label: 'Równoległe generacje obrazów',       values: ['no', '3×', '5×'] },
  { label: 'Pętle AI (autonomiczni agenci)',     values: ['1', '3', '5'] },
  { label: 'Priorytetowa kolejka zapytań',       values: ['no', 'no', 'yes'] },
  { label: 'Ekskluzywne modele AI',              values: ['no', 'no', 'yes'] },
  { label: 'Wczesny dostęp do nowości',          values: ['no', 'no', 'yes'] },
  { label: 'Wsparcie',                           values: ['Społeczność', 'Email · 48h', 'Czat · 24h'] },
]

// ── Byte Economy ─────────────────────────────────────────────────────
const BYTE_ECONOMY = [
  { n: '01', k: 'UNIT', icon: Coins, title: 'Czym jest Byte?', desc: 'Jednostka rozliczeniowa NextByte. Każda akcja AI — wiadomość, generacja, raport — zużywa liczbę Byte zgodnie z cennikiem operacji.' },
  { n: '02', k: 'REFRESH', icon: RefreshCw, title: 'Miesięczne odnowienie', desc: 'Co miesiąc pula z subskrypcji odnawia się do pełnego stanu. Byte kupione zachowują ważność 12 miesięcy i nie są resetowane.' },
  { n: '03', k: 'PRIORITY', icon: Timer, title: 'Kolejność zużycia', desc: 'Subskrypcja → Byte przyznane → Byte kupione. Najpierw spalamy to, co najbardziej ulotne.' },
  { n: '04', k: 'TOP-UP', icon: CreditCard, title: 'Doładowania', desc: 'Potrzebujesz więcej? Doładuj pakiet Byte w panelu — bez zmiany planu, bez zobowiązań.' },
] as const

function ByteEconomy() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary/80">// BYTE / WALUTA PLATFORMY</div>
        <h2 className="text-2xl sm:text-3xl font-light text-foreground tracking-tight">Jedna waluta. Pełna kontrola.</h2>
        <p className="text-xs sm:text-sm text-foreground/50 max-w-xl mx-auto">
          Byte to wewnętrzna jednostka rozliczeniowa NextByte. Płacisz tylko za to, czego naprawdę używasz — bez sztucznych limitów per-model.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {BYTE_ECONOMY.map((item) => (
          // forceMode="solid" — lista 4 powtórzeń, nie hero-element strony.
          <GlassCard key={item.n} forceMode="solid" radius="rounded-2xl" padding="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">// {item.n} / {item.k}</span>
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">{item.title}</h4>
            <p className="text-[11px] text-foreground/50 leading-relaxed">{item.desc}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

// ── Opinie użytkowników (przykładowe treści demonstracyjne) ────────
const TESTIMONIALS = [
  { quote: 'Zrezygnowałem z 4 osobnych subskrypcji AI i przeniosłem wszystko do NextByte. Ultimate zwraca się już po pierwszym tygodniu.', name: 'Michał K.', role: 'Twórca treści' },
  { quote: 'Priorytetowa kolejka robi różnicę w godzinach szczytu — moje zapytania po prostu nie czekają.', name: 'Ania W.', role: 'Freelancerka' },
  { quote: 'Przenieśliśmy cały zespół na plan Ultimate. Wspólna pula Byte i jedno rozliczenie oszczędzają nam realny czas.', name: 'Tomasz R.', role: 'Właściciel małej firmy' },
] as const

// ── FAQ ────────────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'Dlaczego warto wybrać plan ULTIMATE?',
    a: 'Ultimate ma najwyższy przelicznik wartości ze wszystkich planów — do 7,15 Byte za każdą wydaną złotówkę. Dodatkowo dostajesz priorytetową kolejkę zapytań, ekskluzywne modele AI, wczesny dostęp do nowości i 5 autonomicznych pętli AI działających dla Ciebie 24/7.',
  },
  {
    q: 'Jak dokładnie działa gwarancja zwrotu 14 dni?',
    a: 'Płacisz normalnie za pierwszy okres subskrypcji Premium lub Ultimate. Jeśli w ciągu 14 dni od zakupu uznasz, że plan Ci nie odpowiada, napisz do wsparcia — zwrócimy pełną kwotę bez zbędnych pytań. Wykorzystane w tym czasie Byte nie przepadają, zostają na koncie.',
  },
  {
    q: 'Czy mogę anulować subskrypcję w dowolnym momencie?',
    a: 'Tak. Subskrypcja jest miesięczna lub roczna i możesz ją anulować w panelu jednym kliknięciem. Dostęp pozostaje aktywny do końca opłaconego okresu.',
  },
  {
    q: 'Czym Premium różni się od Ultimate?',
    a: 'Premium to pełny dostęp do funkcji AI dla jednej osoby. Ultimate dodaje priorytetową kolejkę, 5× równoległe generacje obrazów, ekskluzywne modele, większy kontekst plików (200k tokenów) i przesyłanie plików do 100 MB.',
  },
  {
    q: 'Co zawiera plan darmowy?',
    a: 'Notatki, Kalendarz, Zadania, Baza Danych i Szyfrowanie bez limitu (UNLIMITED) oraz podstawowy dostęp do AI płatny bezpośrednio z doładowywanych paczek Byte.',
  },
  {
    q: 'Czy są dostępne plany dla firm?',
    a: 'Tak — panel B2B z zarządzaniem zespołem, wspólną pulą Byte i fakturowaniem zbiorczym. Skontaktuj się z nami, aby dobrać plan pod skalę Twojej firmy.',
  },
  {
    q: 'W jakiej walucie są ceny i jak działa VAT?',
    a: 'Wszystkie ceny podane są w PLN. Faktura VAT generowana jest automatycznie w panelu po każdej transakcji.',
  },
  {
    q: 'Czy płatność jest bezpieczna?',
    a: 'Tak. Płatności obsługuje zewnętrzny, szyfrowany operator płatności zgodny z PCI DSS — Twoje dane karty nigdy nie trafiają na nasze serwery.',
  },
] as const

// ── Main CennikSection Component ──────────────────────────────────
export function CennikSection() {
  const { isGlass } = useGlass()
  const [billing, setBilling] = useState<Billing>('monthly')
  const [premiumByte, setPremiumByte] = useState(PREMIUM_STEPS[2].byte)
  const [ultimateByte, setUltimateByte] = useState(ULTIMATE_STEPS[0].byte)

  const premiumConfig = PREMIUM_STEPS.find(s => s.byte === premiumByte) ?? PREMIUM_STEPS[2]
  const ultimateConfig = ULTIMATE_STEPS.find(s => s.byte === ultimateByte) ?? ULTIMATE_STEPS[0]

  const premiumPrice  = billing === 'monthly' ? premiumConfig.monthly : premiumConfig.yearly
  const ultimatePrice = billing === 'monthly' ? ultimateConfig.monthly : ultimateConfig.yearly

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-6 sm:py-10 space-y-14">

      {/* ── Header ── */}
      <div className="relative w-full flex flex-col items-center justify-center text-center gap-3">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary/80">// CENNIK / PLANY</div>
        <h1 className="font-light text-foreground tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight">
          Jedna cena.<br className="sm:hidden" /> Cały ekosystem AI.
        </h1>
        <p className="text-xs sm:text-sm text-foreground/50 max-w-xl mx-auto">
          Wybierz plan dopasowany do Twoich potrzeb. Anuluj w dowolnym momencie. Niewykorzystane Byte przenoszą się na kolejny okres.
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-foreground/50 font-medium">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>4.9/5 · 2 400+ opinii</span>
          <span className="text-foreground/20">•</span>
          <span>Zaufało nam już 12 000+ twórców i firm w Polsce</span>
        </div>
      </div>

      {/* ── Billing Switcher ── */}
      <div className="relative z-10 flex justify-center">
        <div className={cn(
          'inline-flex items-center rounded-full p-1',
          isGlass ? 'nb-szklo nb-szklo-plynne' : 'nb-tafla',
        )}>
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={cn(
              'relative shrink-0 cursor-pointer rounded-full font-medium transition-colors h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base',
              billing === 'monthly' ? 'text-foreground' : 'text-foreground/45 hover:text-foreground/70',
            )}
          >
            {billing === 'monthly' && (
              <span className="absolute inset-0 rounded-full overflow-hidden">
                <span className="absolute inset-0 rounded-full nb-pigulka-rant nb-tab-pill-spin" />
                <span className="absolute inset-[1px] rounded-full nb-pigulka-szklo" />
              </span>
            )}
            <span className="relative z-20">Miesięcznie</span>
          </button>
          <button
            type="button"
            onClick={() => setBilling('yearly')}
            className={cn(
              'relative shrink-0 cursor-pointer rounded-full font-medium transition-colors h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base',
              billing === 'yearly' ? 'text-foreground' : 'text-foreground/45 hover:text-foreground/70',
            )}
          >
            {billing === 'yearly' && (
              <span className="absolute inset-0 rounded-full overflow-hidden">
                <span className="absolute inset-0 rounded-full nb-pigulka-rant nb-tab-pill-spin" />
                <span className="absolute inset-[1px] rounded-full nb-pigulka-szklo" />
              </span>
            )}
            <span className="relative z-20 flex items-center gap-1.5">
              Rocznie
              <GlassBadge intent="primary" size="sm">do -17%</GlassBadge>
            </span>
          </button>
        </div>
      </div>

      {/* ── Plan Cards ── */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">

        {/* ─── BEZPŁATNY ─── */}
        <GlassCard radius="rounded-2xl" padding="p-6" className="flex flex-col">
          <PlanBadge visible={false} />

          <div className="mb-4 min-h-[68px]">
            <h3 className="font-bold tracking-wide text-xl text-foreground">BEZPŁATNY</h3>
            <p className="text-xs text-foreground/50 mt-1">Start z platformą NextByte</p>
            <p className="text-[11px] text-foreground/40 mt-1">Dla testów i pierwszych kroków z AI</p>
          </div>

          <div className="mb-5">
            <div className="h-5 mb-0.5 invisible" />
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-foreground text-4xl">0</span>
              <span className="text-lg text-foreground/50 font-semibold">PLN</span>
              <span className="text-foreground/50 text-xs">/miesiąc</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 h-8">
              <p className="text-xs text-foreground/50">Płacisz tylko za zużyte Byte z paczek</p>
            </div>
          </div>

          <div className="mb-6">
            <GlassButton variant="ghost" disabled className="w-full h-12 rounded-2xl font-bold">Twój aktualny plan</GlassButton>
            <div className="flex items-center justify-center gap-3 text-[10px] mt-2 font-medium invisible">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Gwarancja 14 dni</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Aktywacja w 3s</span>
            </div>
          </div>

          <div className="border-t border-foreground/[0.08] pt-5 space-y-1">
            <p className="text-[11px] font-bold text-foreground/45 uppercase tracking-wider mb-3">W planie Bezpłatnym:</p>
            <GlassFeatureRow icon={Coins} label="Płacisz tylko za zużycie" desc="Bez miesięcznej puli Byte — doładowujesz paczki, gdy chcesz" />
            <GlassFeatureRow icon={Sparkles} label="Chat AI" desc="Dostęp do wszystkich modeli — koszt w Byte z paczek" />
            <GlassFeatureRow icon={ImagePlus} label="Studio Zdjęć" desc="Generowanie obrazów AI — koszt w Byte z paczek" />
            <GlassFeatureRow icon={Bot} label="Personalny Asystent" desc="Wykonuje zadania — koszt w Byte z paczek" />
            <GlassFeatureRow icon={Wand2} label="PromptEx" desc="Biblioteka promptów i ulepszanie" />
            <GlassFeatureRow icon={Calendar} label="Kalendarz" desc="Wydarzenia, przypomnienia, synchronizacja" badge="UNLIMITED" />
            <GlassFeatureRow icon={CheckSquare} label="Zadania" desc="Tablice, listy, deep-linking" badge="UNLIMITED" />
            <GlassFeatureRow icon={NotebookPen} label="Notatki" desc="Edytor TipTap z autosave" badge="UNLIMITED" />
            <GlassFeatureRow icon={Database} label="Baza Danych" desc="Arkusze i rekordy bez limitu" badge="UNLIMITED" />
            <GlassFeatureRow icon={Lock} label="Szyfrowanie" desc="End-to-end E2EE" badge="UNLIMITED" />
            <GlassFeatureRow icon={ShoppingCart} label="Listy Zakupowe" desc="Współdzielone listy z rodziną" />
            <GlassFeatureRow icon={Repeat} label="Pętle AI" desc="1 autonomiczna pętla (płatna w Byte)" badge="1 PĘTLA" />
            <GlassFeatureRow icon={Upload} label="Przesyłanie plików do 20 MB" desc="Limit per-plik dla planu Bezpłatnego" />
            <GlassFeatureRow icon={BrainCircuit} label="Kontekst plików w AI Chat" desc="Do ~50k tokenów źródeł na projekt" badge="50k tok" />
          </div>
        </GlassCard>

        {/* ─── PREMIUM ─── */}
        <GlassCard radius="rounded-2xl" padding="p-6" className="flex flex-col">
          <PlanBadge visible={false} />

          <div className="mb-4 min-h-[68px]">
            <h3 className="font-bold tracking-wide text-xl text-foreground">PREMIUM</h3>
            <p className="text-xs text-foreground/50 mt-1">Pełny dostęp do funkcji AI</p>
            <p className="text-[11px] text-foreground/60 font-medium mt-1">Wybierz, jeśli pracujesz sam i chcesz mieć wszystko</p>
          </div>

          <div className="mb-5">
            <div className={cn('flex items-center gap-2 h-5 mb-0.5', billing !== 'yearly' && 'invisible')}>
              <span className="text-sm line-through text-foreground/40">{premiumConfig.monthly} PLN</span>
              <span className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">
                Oszczędzasz {(premiumConfig.monthly - premiumConfig.yearly) * 12} zł/rok
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-foreground text-4xl"><AnimatedNumber value={premiumPrice} /></span>
              <span className="text-lg text-foreground/50 font-semibold">PLN</span>
              <span className="text-foreground/50 text-xs">/miesiąc</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 h-8">
              <p className="text-xs text-foreground/50">
                {billing === 'yearly' ? 'Rozliczane rocznie (zrabatowane)' : 'Rozliczane miesięcznie'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <GlassButton variant="solid" className="w-full h-12 rounded-2xl font-bold">Wybierz PREMIUM</GlassButton>
            <div className="flex items-center justify-center gap-3 text-[10px] mt-2 font-medium invisible">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Gwarancja 14 dni</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Aktywacja w 3s</span>
            </div>
          </div>

          <ByteSlider steps={PREMIUM_STEPS} value={premiumByte} onChange={setPremiumByte} badge={premiumConfig.badge} />
          <ByteStatsList byte={premiumByte} />
          <UnlimitedSection />
          <CostTiles przelicznik={premiumConfig.przelicznik} modelKosztow={premiumConfig.modelKosztow} />

          <div className="border-t border-foreground/[0.08] pt-5 space-y-1">
            <p className="text-[11px] font-bold text-foreground/45 uppercase tracking-wider mb-3">W planie Premium:</p>
            <GlassFeatureRow icon={Sparkles} label="Pełny dostęp do Chat AI" desc="Nieograniczone wiadomości i wszystkie modele" />
            <GlassFeatureRow icon={Bot} label="Personalny Asystent" desc="Autonomiczny asystent wykonujący zadania" />
            <GlassFeatureRow icon={Cpu} label="Lokalny AI" desc="Podłącz LM Studio / Ollama / własny serwer" badge="PRIVATE" />
            <GlassFeatureRow icon={Calendar} label="Kalendarz AI i Zadania" desc="Inteligentne planowanie i organizacja" />
            <GlassFeatureRow icon={GraduationCap} label="Akademia Premium" desc="Kursy i materiały dostępne tylko z subskrypcją" />
            <GlassFeatureRow icon={ImagePlus} label="Studio Zdjęć AI" desc="Generowanie i edycja obrazów" />
            <GlassFeatureRow icon={BrainCircuit} label="Pamięć AI" desc="AI zapamiętuje Twoje preferencje" />
            <GlassFeatureRow icon={RefreshCw} label="Miesięczne odnowienie" desc="Co miesiąc Byte odnawiają się do pełnej puli" />
            <GlassFeatureRow icon={Headphones} label="Wsparcie Email" desc="Odpowiedź w ciągu 48h" />
            <GlassFeatureRow icon={Cpu} label="Tryb Ultra AI" desc="Najsilniejszy model z rozbudowanym myśleniem" badge="ULTRA" />
            <GlassFeatureRow icon={FileSearch} label="Deep Research" desc="Zaawansowane badania i raporty AI" badge="PRO" />
            <GlassFeatureRow icon={Layers} label="Równoległe generacje" desc="Do 3 obrazów jednocześnie" badge="3×" />
            <GlassFeatureRow icon={Repeat} label="Pętle AI" desc="Do 3 autonomicznych agentów AI" badge="3 PĘTLE" />
            <GlassFeatureRow icon={Upload} label="Przesyłanie plików do 47 MB" desc="Większe pliki w narzędziach AI" />
            <GlassFeatureRow icon={BrainCircuit} label="Kontekst plików projektu" desc="2× więcej niż Free — do ~100k tokenów" badge="100k tok" />
          </div>
        </GlassCard>

        {/* ─── ULTIMATE ─── */}
        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-sky-400/10 to-primary/20 rounded-2xl opacity-80 pointer-events-none" />
          <GlassCard radius="rounded-2xl" padding="p-6" className="relative flex flex-col border-primary/25 shadow-[0_0_28px_-6px_hsl(var(--primary)/0.28)] overflow-hidden">

            <PlanBadge visible savings="OSZCZĘDZASZ 43%" />

            <div className="mb-4 min-h-[68px]">
              <h3 className="font-bold tracking-wide text-xl text-primary flex items-center gap-2">
                ULTIMATE
                <Sparkles className="w-4 h-4 text-primary" />
              </h3>
              <p className="text-xs text-foreground/50 mt-1">Maksymalne możliwości AI</p>
              <p className="text-[11px] text-primary/80 font-semibold mt-1">Wybierz, jeśli tworzysz dużo lub pracujesz w zespole</p>
            </div>

            <div className="mb-5">
              <div className={cn('flex items-center gap-2 h-5 mb-0.5', billing !== 'yearly' && 'invisible')}>
                <span className="text-sm line-through text-foreground/40">{ultimateConfig.monthly} PLN</span>
                <span className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">
                  Oszczędzasz {(ultimateConfig.monthly - ultimateConfig.yearly) * 12} zł/rok
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-primary text-4xl"><AnimatedNumber value={ultimatePrice} /></span>
                <span className="text-lg text-primary font-bold">PLN</span>
                <span className="text-foreground/50 text-xs">/miesiąc</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 h-8">
                <p className="text-xs text-foreground/50">
                  {billing === 'yearly' ? 'Rozliczane rocznie (zrabatowane)' : 'Rozliczane miesięcznie'}
                </p>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                  Najniższy koszt za Byte
                </span>
              </div>
            </div>

            <div className="mb-6">
              <GlassButton variant="hero" className="w-full h-12 rounded-2xl gap-2">
                Odblokuj Plan ULTIMATE
                <Rocket className="w-4 h-4 shrink-0" />
              </GlassButton>
              <div className="flex items-center justify-center gap-3 text-[10px] text-foreground/50 mt-2 font-medium">
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Gwarancja 14 dni</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> Aktywacja w 3s</span>
              </div>
            </div>

            <ByteSlider steps={ULTIMATE_STEPS} value={ultimateByte} onChange={setUltimateByte} badge={ultimateConfig.badge} isUltimate />
            <ByteStatsList byte={ultimateByte} isUltimate />
            <UnlimitedSection isUltimate />
            <CostTiles przelicznik={ultimateConfig.przelicznik} modelKosztow={ultimateConfig.modelKosztow} isUltimate />

            <div className="border-t border-primary/20 pt-5 space-y-1">
              <p className="text-[11px] font-black text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" /> Wszystko z Premium, plus:
              </p>
              <GlassFeatureRow icon={Timer} label="Priorytetowa kolejka" desc="Twoje zapytania zawsze na początku" badge="FAST" highlight />
              <GlassFeatureRow icon={Layers} label="Równoległe generacje" desc="Do 5 obrazów jednocześnie" badge="5×" highlight />
              <GlassFeatureRow icon={Rocket} label="Wczesny dostęp" desc="Nowe funkcje przed wszystkimi" badge="WCZESNY DOSTĘP" highlight />
              <GlassFeatureRow icon={Brain} label="Ekskluzywne modele AI" desc="Dostęp do najnowszych modeli" badge="EKSKLUZYWNE" highlight />
              <GlassFeatureRow icon={Headphones} label="Priorytetowe wsparcie" desc="Odpowiedź w ciągu 24h na czacie" badge="PRIORYTET" highlight />
              <GlassFeatureRow icon={Repeat} label="Pętle AI — MAX" desc="Do 5 autonomicznych pętli działających równolegle 24/7" badge="5 PĘTLI" highlight />
              <GlassFeatureRow icon={Upload} label="Przesyłanie plików do 100 MB" desc="Największe pliki na platformie" highlight />
              <GlassFeatureRow icon={BrainCircuit} label="Kontekst plików — MAX" desc="Do ~200k tokenów źródeł na projekt (4× więcej niż Free)" badge="200k tok" highlight />
            </div>
          </GlassCard>
        </div>
      </div>

      <p className="text-center text-[11px] text-foreground/40 max-w-2xl mx-auto -mt-8">
        Wszystkie ceny są w PLN. Subskrypcja odnawia się automatycznie. Możesz anulować w dowolnym momencie.
      </p>

      {/* ── Dlaczego Ultimate to najlepsza wartość ──
           Dekoracyjny "glow" MUSI być poza .nb-szklo: globalna reguła
           `.nb-szklo > *` w index.css wymusza position:relative na
           bezpośrednich dzieciach (dla z-index refrakcji), co nadpisuje
           position:absolute i zamienia dekorację w blok 320px w layoucie. */}
      <div className="relative max-w-6xl mx-auto overflow-hidden rounded-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <GlassCard radius="rounded-2xl" padding="p-6 sm:p-8" className="relative border-primary/30">
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2 text-center md:text-left">
              <GlassBadge intent="primary">✦ DLACZEGO ULTIMATE TO NAJLEPSZY WYBÓR?</GlassBadge>
              <h4 className="text-lg sm:text-xl font-bold text-foreground">Aż 7,15 Byte za każdą 1 zł</h4>
              <p className="text-xs text-foreground/50">Najwyższy przelicznik mocy obliczeniowej ze wszystkich planów, bez ryzyka braków w limitach.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl nb-wglobienie">
                <p className="text-[10px] text-foreground/45 uppercase font-bold text-center mb-2">Osobno musiałbyś płacić za:</p>
                <div className="space-y-1 text-[11px] text-foreground/55">
                  <div className="flex items-center justify-between"><span>Chat AI (ChatGPT Plus)</span><span>~100 zł</span></div>
                  <div className="flex items-center justify-between"><span>Generator obrazów</span><span>~120 zł</span></div>
                  <div className="flex items-center justify-between"><span>Asystent / notatki AI</span><span>~80 zł</span></div>
                  <div className="flex items-center justify-between"><span>Deep Research</span><span>~100 zł</span></div>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-foreground border-t border-foreground/10 mt-2 pt-2">
                  <span>Razem</span><span>~400 zł / mies.</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-primary/15 border border-primary/40 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] text-primary uppercase font-extrabold">NextByte ULTIMATE</p>
                <p className="text-2xl font-black text-primary mt-2">349 zł</p>
                <p className="text-[10px] text-foreground/50 mt-1">wszystko w jednym miejscu, jedno logowanie</p>
                <p className="text-[10px] text-emerald-400 font-bold mt-2">Taniej i bez żonglowania kontami</p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end justify-center">
              <GlassButton variant="hero" className="w-full sm:w-auto px-6 h-12 rounded-2xl gap-2">
                Wybierz Plan ULTIMATE
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Zaufanie ── */}
      <div className="space-y-3 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: ShieldCheck, label: 'Gwarancja 14 dni bez ryzyka' },
            { icon: Lock, label: 'Szyfrowane płatności' },
            { icon: Zap, label: 'Natychmiastowa aktywacja' },
            { icon: Star, label: '4.9/5 · 2 400+ opinii' },
          ].map((item, i) => (
            // forceMode="solid" — 4 powtórzenia w rzędzie, nie hero-element.
            <GlassCard key={i} forceMode="solid" radius="rounded-2xl" padding="p-3" className="flex items-center justify-center gap-2.5 text-xs font-semibold text-foreground/80">
              <item.icon className={cn('w-4 h-4 shrink-0', item.label.includes('4.9') ? 'text-amber-400 fill-amber-400' : 'text-primary')} />
              <span>{item.label}</span>
            </GlassCard>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-foreground/40">
          <span className="font-medium">Akceptujemy:</span>
          {['BLIK', 'Visa', 'Mastercard', 'Przelewy24', 'Apple Pay'].map((m) => (
            <span key={m} className="px-2.5 py-1 rounded-lg border border-foreground/10 bg-foreground/[0.03] font-semibold text-foreground/55">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* ── Opinie ── */}
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary/80">// OPINIE UŻYTKOWNIKÓW</div>
          <h2 className="text-2xl sm:text-3xl font-light text-foreground tracking-tight">Co mówią osoby, które już korzystają.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TESTIMONIALS.map((t, i) => (
            // forceMode="solid" — 3 powtórzenia, nie hero-element.
            <GlassCard key={i} forceMode="solid" radius="rounded-2xl" padding="p-4">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-[10px] text-foreground/45 mt-3 font-semibold">{t.name} · {t.role}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* ── Porównanie / Tabela ── */}
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary/80">// PORÓWNANIE / TABELA</div>
          <h2 className="text-2xl sm:text-3xl font-light text-foreground tracking-tight">Co dostajesz w każdym planie.</h2>
        </div>
        <GlassCompareTable columns={['Free', 'Premium', 'Ultimate']} rows={COMPARE_ROWS} />
      </div>

      {/* ── Byte Economy ── */}
      <div className="max-w-6xl mx-auto">
        <ByteEconomy />
      </div>

      {/* ── FAQ ── */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary/80">// FAQ / CENNIK</div>
          <h2 className="text-2xl sm:text-3xl font-light text-foreground tracking-tight">Częste pytania.</h2>
        </div>
        {/* forceMode="solid" na każdej pozycji — 8 powtórzeń w liście. */}
        <GlassAccordion>
          {FAQ.map((item, i) => (
            <GlassAccordionItem key={i} value={String(i)} title={item.q} forceMode="solid">
              {item.a}
            </GlassAccordionItem>
          ))}
        </GlassAccordion>
      </div>

      {/* ── CTA końcowe ── */}
      <div className="relative max-w-6xl mx-auto overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent pointer-events-none" />
        <GlassCard radius="rounded-2xl" padding="p-8 sm:p-12" className="relative border-primary/30 text-center">
          <div className="relative space-y-4">
            <h2 className="text-2xl sm:text-3xl font-light text-foreground tracking-tight">
              Przestań gonić AI.<br />Zacznij go używać.
            </h2>
            <p className="text-xs sm:text-sm text-foreground/50 max-w-md mx-auto">
              Dołącz do NextByte i dostawaj konkret zamiast szumu. Bez spamu, bez korpo-gadki — możesz wyjść jednym kliknięciem.
            </p>
            <GlassButton variant="hero" className="px-6 h-12 rounded-2xl gap-2 mx-auto">
              DOŁĄCZAM DO NEXTBYTE
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
