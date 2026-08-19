import React from 'react'
import { Tile, TilePill } from '@/components/Tile'
import {
  GlassProgress, GlassBadge,
} from '@/components/glass'
import {
  ArrowRight, Sparkles, Zap, Brain, Camera, FileText,
  Shield, TrendingUp, CheckCircle2, Star, Users,
  MessageSquare, Crown, ChevronRight, Play, Coins,
  Image as ImageIcon, Timer, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── paleta semantyczna ─── */
const C = {
  chat:   'hsl(var(--primary))',
  studio: 'hsl(262 80% 68%)',   // violet
  notes:  'hsl(158 64% 52%)',   // emerald
  amber:  'hsl(38 92% 50%)',
}

/* ─── dane ─────────────────────────────────────────────────── */
const STATS = [
  { label: 'Aktywnych użytkowników', value: '12 400+', icon: Users,          trend: '+38% miesiąc do miesiąca' },
  { label: 'Zapytań obsłużonych',    value: '4,2M',    icon: MessageSquare,  trend: 'w ostatnim miesiącu' },
  { label: 'Modeli AI dostępnych',   value: '15+',     icon: Brain,          trend: 'GPT · Claude · Gemini · Grok' },
  { label: 'Średni czas odpowiedzi', value: '<1,2s',   icon: Zap,            trend: 'p95 latency, Tryb Szybki' },
]

const FEATURES = [
  {
    key: 'chat', icon: Brain, color: C.chat,
    tag: 'AI Chat',
    title: 'Wszystkie topowe modele w jednym oknie',
    desc: 'GPT-4.1, Claude Opus 4, Gemini 2.5 Pro, Grok 4 — przełączaj jednym kliknięciem. Płacisz tokenami Byte tylko za to, czego faktycznie używasz.',
    bullets: [
      'Historia wspólna dla wszystkich modeli',
      'Tryb porównawczy — dwie odpowiedzi obok siebie',
      'Lokalne AI (Ollama) — dane nie opuszczają komputera',
    ],
  },
  {
    key: 'studio', icon: Camera, color: C.studio,
    tag: 'Studio Zdjęć',
    title: 'Generatywne studio bez osobnej subskrypcji',
    desc: 'Generuj, edytuj, usuwaj tła, nakładaj style. Grok Image, Flux i Stable Diffusion wbudowane — płacisz za tokeny, nie miesięczny abonament.',
    bullets: [
      'Batch processing — wiele zdjęć naraz',
      'Styl wizualny spójny z marką',
      'Eksport WebP / PNG / AVIF',
    ],
  },
  {
    key: 'notes', icon: FileText, color: C.notes,
    tag: 'Notatki AI',
    title: 'Notatki z pamięcią i semantycznym wyszukiwaniem',
    desc: 'Pisz, a AI dopisuje kontekst. Zadaj pytanie w naturalnym języku — system znajdzie odpowiedź w Twoich notatkach.',
    bullets: [
      'Semantyczne wyszukiwanie w całej bazie',
      'Powiązania między notatkami',
      'Eksport Markdown / PDF',
    ],
  },
]

const COMPARE = [
  { feature: 'Wiele modeli AI (GPT / Claude / Gemini / Grok)', nb: true,        gpt: false,  perp: false },
  { feature: 'Studio generatywne zdjęć',                        nb: true,        gpt: false,  perp: false },
  { feature: 'Notatki z AI',                                    nb: true,        gpt: false,  perp: false },
  { feature: 'Lokalne AI bez wysyłania danych',                 nb: true,        gpt: false,  perp: false },
  { feature: 'Model płatności za użycie (tokeny)',              nb: true,        gpt: false,  perp: false },
  { feature: 'Historia wspólna dla wszystkich modeli',          nb: true,        gpt: false,  perp: false },
  { feature: 'Cena (plan z pulą Byte)',                         nb: 'od 99 zł',  gpt: '~89 zł', perp: '~89 zł' },
]

// Plany pobrane z CennikSection — wartości dokładne
const PLANS = [
  {
    name: 'Bezpłatny',
    byteLabel: 'Brak puli — płatne paczki',
    monthly: 0,
    yearly: 0,
    color: 'hsl(var(--foreground)/0.5)',
    highlight: false,
    badge: null,
    priceNote: 'Płacisz tylko za zużyte Byte z paczek',
    features: [
      'Chat AI (wszystkie modele)',
      'Studio Zdjęć',
      'Notatki AI',
      'Lokalne AI (Ollama)',
      'Brak miesięcznej puli — doładowujesz kiedy chcesz',
    ],
  },
  {
    name: 'Premium',
    byteLabel: '495 – 1 500 ⟠ / mies.',
    monthly: 99,
    yearly: 82,
    color: C.chat,
    highlight: false,
    badge: null,
    priceNote: 'od 99 zł (495 ⟠) do 269 zł (1 500 ⟠)',
    features: [
      'Chat AI (wszystkie modele)',
      'Studio Zdjęć (Grok Image)',
      'Notatki AI',
      'Lokalne AI (Ollama)',
      'Historia 90 dni',
    ],
  },
  {
    name: 'Ultimate',
    byteLabel: '2 450 – 6 070 ⟠ / mies.',
    monthly: 349,
    yearly: 290,
    color: C.studio,
    highlight: true,
    badge: 'NAJLEPSZA OFERTA',
    priceNote: 'od 349 zł (2 450 ⟠) do 849 zł (6 070 ⟠)',
    features: [
      'Wszystko z Premium',
      'Do 6 070 ⟠ Byte miesięcznie',
      'Priorytetowe kolejkowanie',
      'Dostęp do modeli beta',
      'Dedykowany support',
    ],
  },
]

const TESTIMONIALS = [
  { name: 'Marta K.', role: 'CEO, agencja e-com',    text: 'Zrezygnowałam z kilku oddzielnych narzędzi. NextByte jest szybszy i tańszy w przeliczeniu na efekt.' },
  { name: 'Bartek W.', role: 'Freelancer, UX/UI',    text: 'Tryb Szybki odpowiada błyskawicznie. Mogę porównać odpowiedzi GPT i Claude bez otwierania drugiej karty.' },
  { name: 'Ola M.',    role: 'Content Manager',       text: 'Notatki z AI plus Studio Zdjęć — planowanie treści i generowanie grafik w jednym miejscu.' },
]

const MOCK_MODELS = [
  { name: 'Szybki',      sub: '~1,2s',   active: true },
  { name: 'Claude Opus', sub: '~3,5s',   active: false },
  { name: 'GPT-4.1',    sub: '~2,8s',   active: false },
  { name: 'Gemini 2.5', sub: '~2,1s',   active: false },
  { name: 'Grok 4',     sub: '~4,0s',   active: false },
]

/* ─── komponent ────────────────────────────────────────────── */
export function StronaGlownaNewSection({ onNavigateToCennik }: { onNavigateToCennik?: () => void }) {

  return (
    <div className="w-full text-foreground font-sans overflow-x-clip flex flex-col">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 sm:px-6 pt-10 pb-16 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,hsl(var(--primary)/0.16),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 blur-[90px] rounded-full" />

        <div className="max-w-5xl mx-auto text-center space-y-7 relative z-10">

          {/* social proof pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/[0.07] backdrop-blur-md">
            <span className="flex -space-x-1.5">
              {['hsl(var(--primary)/0.8)', C.studio, C.notes].map(bg => (
                <span key={bg} className="w-5 h-5 rounded-full border-2 border-card" style={{ background: bg }} />
              ))}
            </span>
            <span className="text-[11px] font-semibold text-foreground/75">
              <span className="text-primary font-bold">12 400+</span> profesjonalistów już korzysta
            </span>
            <span className="text-[11px] text-foreground/50 font-medium flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 4.9/5
            </span>
          </div>

          <h1 className="font-heading text-5xl md:text-7xl lg:text-[5.4rem] font-extrabold tracking-tight leading-[1.04]">
            Wszystkie topowe AI.
            <br className="hidden md:block" />
            <span className="text-primary drop-shadow-[0_0_44px_hsl(var(--primary)/0.45)]">
              Jeden ekosystem.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/50 max-w-2xl mx-auto leading-relaxed">
            Chat AI z 15+ modelami, Studio Zdjęć i Notatki AI — w jednym miejscu.
            Płacisz tokenami Byte tylko za to, czego używasz.{' '}
            <span className="text-foreground/80 font-semibold">Plan Premium od 99 zł/mies.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button className="group relative flex items-center gap-2.5 rounded-2xl h-14 px-8 bg-primary text-background font-bold text-sm uppercase tracking-widest shadow-[0_0_36px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_56px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Zacznij za darmo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/12 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            <button className="group flex items-center gap-2 h-14 px-6 rounded-2xl border border-foreground/10 bg-card/40 backdrop-blur-sm text-sm font-semibold text-foreground/65 hover:text-foreground hover:border-foreground/20 transition-all duration-200">
              <Play className="w-4 h-4 text-primary" />
              Obejrzyj demo (2 min)
            </button>
          </div>

          <p className="text-[11px] text-foreground/30 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Bez karty kredytowej</span>
            <span className="text-foreground/15">·</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Anuluj w dowolnym momencie</span>
            <span className="text-foreground/15">·</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> RODO / EU compliance</span>
          </p>
        </div>

        {/* Fake UI mockup */}
        <div className="mt-16 w-full max-w-5xl px-2 relative z-10">
          <div aria-hidden className="absolute -inset-6 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          <Tile intencja="akcent" elewacja="uniesiona" className="relative rounded-3xl border-primary/20 bg-card/70 backdrop-blur-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.38)]">
            {/* title bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/[0.06] bg-foreground/[0.015]">
              <div className="flex gap-1.5">
                {['bg-red-400/50','bg-amber-400/50','bg-emerald-400/50'].map(c => (
                  <div key={c} className={cn('w-3 h-3 rounded-full', c)} />
                ))}
              </div>
              <div className="h-5 w-52 rounded-full bg-foreground/[0.04] border border-foreground/[0.06] flex items-center px-2.5">
                <span className="text-[10px] text-foreground/25 font-mono">nextbyte.space/chat-ai</span>
              </div>
              <TilePill intencja="akcent" className="border-primary/20 bg-primary/10 text-[9px] ml-auto">LIVE</TilePill>
            </div>

            <div className="grid grid-cols-5 divide-x divide-foreground/[0.05]" style={{ minHeight: 320 }}>
              {/* sidebar */}
              <div className="col-span-1 p-3 flex flex-col gap-1.5 bg-foreground/[0.008]">
                <p className="text-[9px] font-mono uppercase tracking-widest text-foreground/25 px-1 pb-1.5">Modele</p>
                {MOCK_MODELS.map(m => (
                  <div key={m.name} className={cn(
                    'flex items-center justify-between rounded-xl px-2.5 py-1.5 text-[11px]',
                    m.active
                      ? 'bg-primary/10 border border-primary/20 text-primary font-semibold'
                      : 'text-foreground/40'
                  )}>
                    <span>{m.name}</span>
                    <span className="text-[9px] font-mono" style={{ color: m.active ? C.chat : undefined, opacity: m.active ? 0.8 : 0.4 }}>{m.sub}</span>
                  </div>
                ))}
              </div>

              {/* chat */}
              <div className="col-span-3 flex flex-col justify-end p-4 gap-3">
                {[
                  { role: 'user', text: 'Napisz e-mail sprzedażowy dla klienta B2B w branży SaaS' },
                  { role: 'ai',   text: 'Oczywiście. Oto profesjonalna wiadomość z personalizacją i CTA dopasowanym do procesu zakupowego...' },
                ].map((m, i) => (
                  <div key={i} className={cn('flex gap-2', m.role === 'user' && 'flex-row-reverse')}>
                    <div className={cn(
                      'w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold',
                      m.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-foreground/[0.07] text-foreground/50'
                    )}>
                      {m.role === 'user' ? 'T' : <Sparkles className="w-3 h-3" />}
                    </div>
                    <div className={cn(
                      'rounded-2xl px-3 py-2 text-[11px] leading-relaxed max-w-[82%]',
                      m.role === 'user'
                        ? 'bg-primary/8 text-primary border border-primary/12 rounded-tr-sm'
                        : 'bg-foreground/[0.04] text-foreground/75 rounded-tl-sm'
                    )}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 bg-foreground/[0.035] rounded-2xl border border-foreground/[0.07] px-3 py-2.5 mt-1">
                  <span className="text-[11px] text-foreground/25 flex-1">Napisz wiadomość...</span>
                  <div className="w-7 h-7 rounded-full bg-primary/12 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              </div>

              {/* stats */}
              <div className="col-span-1 p-3 flex flex-col gap-2">
                <p className="text-[9px] font-mono uppercase tracking-widest text-foreground/25 px-1 pb-1.5">Sesja</p>
                {[
                  { l: 'Pula Byte', v: '1 420 ⟠' },
                  { l: 'Tokeny', v: '~80 wiad.' },
                  { l: 'Model', v: 'Szybki' },
                ].map(s => (
                  <div key={s.l} className="rounded-xl bg-foreground/[0.025] border border-foreground/[0.05] px-2.5 py-1.5">
                    <p className="text-[9px] text-foreground/35 mb-0.5">{s.l}</p>
                    <p className="text-[12px] font-bold text-foreground">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </Tile>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="px-4 sm:px-6 py-14">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <Tile key={s.label} intencja="neutralna" elewacja="plaska" className="p-5 flex flex-col gap-2 border-foreground/[0.06] bg-card/50 hover:border-primary/15 transition-colors duration-300">
              <s.icon className="w-4 h-4 text-primary" />
              <p className="text-2xl font-extrabold text-foreground tracking-tight">{s.value}</p>
              <p className="text-[11px] text-foreground/45 font-medium leading-tight">{s.label}</p>
              <p className="text-[10px] text-primary/60 font-semibold">{s.trend}</p>
            </Tile>
          ))}
        </div>
      </section>

      {/* ══════════════ VIDEO ══════════════ */}
      <section className="px-4 sm:px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <TilePill intencja="akcent" className="border-primary/20 bg-primary/[0.07] text-primary text-[10px] font-bold px-3 py-1 mx-auto">
              Demo — 2 minuty
            </TilePill>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Zobacz NextByte w akcji
            </h2>
            <p className="text-foreground/45 text-sm max-w-md mx-auto">
              Chat AI, Studio Zdjęć i Notatki — w jednym przepływie pracy.
            </p>
          </div>

          <Tile intencja="akcent" elewacja="uniesiona" className="relative overflow-hidden rounded-2xl border-foreground/[0.08] bg-card/60 backdrop-blur-md aspect-video flex items-center justify-center group cursor-pointer">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,hsl(var(--primary)/0.10),transparent)]" />
            {/* Placeholder — zastąp src iframe gdy będzie URL */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/25 transition-all duration-300 shadow-[0_0_40px_hsl(var(--primary)/0.3)]">
                <Play className="w-8 h-8 text-primary fill-primary translate-x-0.5" />
              </div>
              <p className="text-foreground/40 text-sm font-medium">Kliknij, aby odtworzyć demo</p>
            </div>
            {/* Wstaw iframe gdy będzie URL: */}
            {/* <iframe src="URL_WIDEO" allow="autoplay; fullscreen" className="absolute inset-0 w-full h-full" /> */}
          </Tile>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-5xl mx-auto space-y-20">
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Jeden system. Trzy moduły.
            </h2>
            <p className="text-foreground/45 text-base max-w-lg mx-auto">
              Każdy moduł zintegrowany z resztą — wspólna historia, wspólne tokeny, jeden interfejs.
            </p>
          </div>

          {FEATURES.map((f, i) => (
            <div key={f.key} className={cn('flex flex-col md:flex-row gap-10 items-center', i % 2 === 1 && 'md:flex-row-reverse')}>
              <div className="flex-1 w-full">
                <Tile intencja="akcent" elewacja="uniesiona" className="p-7 relative overflow-hidden border-foreground/[0.07] bg-card/50 min-h-[260px] flex flex-col gap-4">
                  <div className="absolute -right-6 -top-6 opacity-[0.035] pointer-events-none">
                    <f.icon style={{ width: 180, height: 180, color: f.color }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${f.color} 15%, transparent)` }}>
                      <f.icon className="w-4 h-4" style={{ color: f.color }} />
                    </div>
                    <TilePill intencja="neutralna" className="text-[10px] border-foreground/10">{f.tag}</TilePill>
                  </div>
                  <GlassProgress value={88 + i * 4} max={100} label="Zadowolenie użytkowników" />
                  <GlassProgress value={72 + i * 7} max={100} label="Oszczędność czasu" />
                  <div className="grid grid-cols-3 gap-1.5 mt-2 opacity-50">
                    {Array.from({ length: 21 }).map((_, j) => (
                      <div key={j} className="h-1.5 rounded-full" style={{ background: j % 3 === 0 ? f.color : 'hsl(var(--foreground)/0.08)', opacity: 0.4 + (j % 4) * 0.15 }} />
                    ))}
                  </div>
                </Tile>
              </div>

              <div className="flex-1 space-y-5">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: f.color }}>{f.tag}</span>
                <h3 className="text-3xl font-extrabold tracking-tight leading-tight">{f.title}</h3>
                <p className="text-foreground/50 leading-relaxed">{f.desc}</p>
                <ul className="space-y-2.5">
                  {f.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/65">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: f.color }} />
                      {b}
                    </li>
                  ))}
                </ul>
                <button className="group inline-flex items-center gap-1.5 text-sm font-semibold transition-colors" style={{ color: f.color }}>
                  Dowiedz się więcej <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ COMPARE ══════════════ */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold">NextByte vs reszta świata</h2>
            <p className="text-foreground/45 text-sm max-w-sm mx-auto">Jedno narzędzie zamiast kilku subskrypcji.</p>
          </div>

          <Tile intencja="neutralna" elewacja="uniesiona" className="overflow-hidden border-foreground/[0.07]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/[0.06]">
                  <th className="text-left px-5 py-4 text-foreground/45 font-medium">Funkcja</th>
                  <th className="px-5 py-4 font-bold text-primary">
                    <span className="flex flex-col items-center gap-0.5">NextByte <Crown className="w-3 h-3 text-amber-400" /></span>
                  </th>
                  <th className="px-5 py-4 text-foreground/35 font-medium text-center">ChatGPT+</th>
                  <th className="px-5 py-4 text-foreground/35 font-medium text-center">Perplexity</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.feature} className={cn('border-b border-foreground/[0.04] hover:bg-foreground/[0.015] transition-colors', i % 2 === 0 && 'bg-foreground/[0.008]')}>
                    <td className="px-5 py-3 text-foreground/65 font-medium">{row.feature}</td>
                    <td className="px-5 py-3 text-center">
                      {row.nb === true
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                        : <span className="text-primary font-bold text-sm">{row.nb}</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {row.gpt === false
                        ? <span className="text-foreground/20">—</span>
                        : <span className="text-sm font-medium text-foreground/50">{row.gpt}</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {row.perp === false
                        ? <span className="text-foreground/20">—</span>
                        : <span className="text-sm font-medium text-foreground/50">{row.perp}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Tile>
          <p className="text-[11px] text-center text-foreground/25">* ChatGPT Plus: $20/mies. (≈89 zł). Perplexity Pro: $20/mies. (≈89 zł). Ceny orientacyjne.</p>
        </div>
      </section>

      {/* ══════════════ PRICING TEASER ══════════════ */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <Tile intencja="akcent" elewacja="uniesiona" className="relative overflow-hidden rounded-3xl border-primary/20 bg-card/60 backdrop-blur-md p-10 md:p-14">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,hsl(var(--primary)/0.12),transparent)] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
              {/* left: headline */}
              <div className="flex-1 space-y-4">
                <TilePill intencja="akcent" className="border-primary/20 bg-primary/[0.07] text-primary text-[10px] font-bold px-3 py-1">
                  Cennik
                </TilePill>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  Płać tylko za to,<br />czego używasz
                </h2>
                <p className="text-foreground/50 text-sm leading-relaxed max-w-sm">
                  Tokeny Byte to Twoja pula mocy AI. Model Bezpłatny dostępny od zaraz — Plan Premium od 99 zł/mies.
                </p>

                {/* mini plan preview */}
                <div className="flex flex-col gap-2 pt-2">
                  {PLANS.map(p => (
                    <div key={p.name} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                      <span className="text-sm text-foreground/70 font-medium">{p.name}</span>
                      <span className="text-sm font-bold text-foreground ml-auto">
                        {p.monthly === 0 ? '0 zł' : `od ${p.monthly} zł`}
                        <span className="text-[11px] font-normal text-foreground/35">/mies.</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* right: CTA */}
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="text-foreground/35 text-sm">Pełne porównanie planów,<br />kalkulator Byte i więcej →</div>
                <button
                  onClick={onNavigateToCennik}
                  className="group relative flex items-center gap-2 rounded-2xl h-12 px-8 bg-primary text-background font-bold text-sm shadow-[0_0_30px_hsl(var(--primary)/0.35)] hover:shadow-[0_0_48px_hsl(var(--primary)/0.55)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Zobacz pełny cennik <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/12 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
                <p className="text-[11px] text-foreground/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Zacznij bezpłatnie, bez karty
                </p>
              </div>
            </div>
          </Tile>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold">Co mówią użytkownicy</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <Tile key={t.name} intencja="neutralna" elewacja="uniesiona" className="p-6 flex flex-col gap-4 border-foreground/[0.07] hover:border-primary/15 transition-colors duration-300">
                <div className="flex gap-0.5">
                  {[0,1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-2.5 pt-1 border-t border-foreground/[0.05]">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">{t.name[0]}</div>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-foreground/40">{t.role}</p>
                  </div>
                </div>
              </Tile>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="px-4 sm:px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Tile intencja="akcent" elewacja="uniesiona" className="relative overflow-hidden rounded-3xl border-primary/25 bg-primary/[0.06] p-12 md:p-20 text-center shadow-[0_0_60px_hsl(var(--primary)/0.10)]">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_55%)] pointer-events-none" />
            <div aria-hidden className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

            <div className="relative z-10 space-y-6 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/8 border border-amber-400/25">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">Pierwsze 500 ⟠ Byte gratis przy rejestracji</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-2xl">
                Zacznij dziś.{' '}
                <span className="text-primary drop-shadow-[0_0_28px_hsl(var(--primary)/0.5)]">Za darmo.</span>
              </h2>
              <p className="text-foreground/55 text-lg max-w-lg">
                Zarejestruj się w 30 sekund. Żadnej karty kredytowej. Pierwsze zapytania gratis na startowym pakiecie Byte.
              </p>

              <button className="group relative flex items-center gap-2 rounded-2xl h-14 px-10 bg-primary text-background font-bold text-sm uppercase tracking-widest shadow-[0_0_44px_hsl(var(--primary)/0.55)] hover:shadow-[0_0_64px_hsl(var(--primary)/0.75)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Załóż konto — to nic nie kosztuje <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/12 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <p className="text-[11px] text-foreground/30 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Szyfrowanie end-to-end</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> RODO zgodność</span>
                <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-400" /> Natychmiastowy dostęp</span>
              </p>
            </div>
          </Tile>
        </div>
      </section>

    </div>
  )
}
