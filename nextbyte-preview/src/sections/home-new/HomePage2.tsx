import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  Shield, Cpu, WifiOff,
  Building2, Lock, LogOut, CircleCheck, X,
  Mic, Camera, NotebookPen, ArrowRight,
  Radar, Workflow, Sparkles, Brain, Calendar, Rocket, Check,
} from 'lucide-react'
import {
  Section, GlowButton, GhostButton,
  IconTile, Glow, PageAmbience,
  AnimStyles, FadeIn, Stars,
  TechDivider, TechCornerMarks,
} from './shared'
import {
  MODULY, STATY, WARTOSCI_FILARY, KROKI,
  POROWNANIE, OPINIE, FAQ,
} from './data'
import {
  ModelEcosystemBridge,
  HemisphereArchSection, FaqRow, SecRule,
  OpenAIIcon, AnthropicIcon, XaiIcon, GoogleIcon, GeminiIcon,
  NextByteMarkIcon,
} from './HomePage'
import { GlassCard } from '@/components/glass'
import type { HomePage as HomePageId } from './types'

/* ═══════════════════════════════════════════════════════════════════════
   STRONA GŁÓWNA 2 — wariant „flow state" inspirowany alle-ai.com / ninjachat.ai

   To NIE jest kopia „Strony głównej NEW" w nowym opakowaniu — układ sekcji
   i hero są własną kompozycją, lokalną dla tego pliku. Ze współdzielonego
   HomePage.tsx bierzemy tylko: ModelEcosystemBridge, HemisphereArchSection
   i ikony marek (OpenAI/Anthropic/Gemini/xAI) — HeroAppMockup NIE jest
   używany. `ChaosVsUnifiedCard` NIE jest importowana: ta strona ma własny
   fork `DepthCompareCard` (ta sama treść i zakładki, ale w pełni w stylu
   głębi tej strony), żeby nie mieszać płaskiego stylu oryginału z resztą.
   ORAZ dwa zestawy danych z data.ts, które w oryginale nie są nigdzie
   renderowane (WARTOSCI_FILARY, KROKI) — tutaj dostają swoje miejsce.

   TYLKO DWIE KARUZELE na całej stronie — nie dokładać kolejnych:
   1. `HeroBanner` (ten plik) — TECH_PARTNERZY, cały stack platformy
      (modele + infrastruktura), poziomy pasek na samej górze hero.
   2. `ModelEcosystemBridge` (HomePage.tsx, sekcja "Ekosystem modeli") —
      konkretne modele AI z prawdziwymi ikonami marek.

   Karty modułów/filarów/bezpieczeństwa/opinii/kroków dzielą JEDEN bespoke
   styl kafelka (rounded-2xl, border-foreground/[0.08], bg-card/80, cień
   0_24px_48px_-28px, backdrop-blur-sm) — ten sam co siatka bento pod hero —
   żeby cała strona (nie tylko hero) trzymała się nowej estetyki zamiast
   mieszać z `Tile` z `@/components/Tile` z reszty platformy (feedback 2026-08-27).

   Zero pigułek-badge (komponent `Eyebrow` z shared.tsx) — wszędzie płaski
   `SecRule`, zgodnie z feedbackiem z 2026-08-27.
   ═══════════════════════════════════════════════════════════════════════ */

/** Wspólny, świecący styl kart — jedna definicja, którą dzielą siatka bento
 *  pod hero, "Sprawdzone wyniki", "Bezpieczeństwo", "Trzy filary" i "Lokalny AI",
 *  żeby cała strona trzymała się jednego języka wizualnego zamiast osobnych
 *  wariantów obramowań (feedback 2026-08-27: "przenieś ten styl i tutaj"). */
export const GLOW_CARD = 'relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 backdrop-blur-sm'
/** Stonowana poświata — obramowanie i blask są rozcieńczone (color-mix), a
 *  promień rozmycia mały, żeby akcent był subtelnym detalem, nie latarnią
 *  morską (feedback 2026-08-27: "mniejsze i wszędzie mają być mniejsze"). */
export function glowStyle(color: string): { borderColor: string; boxShadow: string } {
  const border = `color-mix(in srgb, ${color} 45%, transparent)`
  const halo = `color-mix(in srgb, ${color} 22%, transparent)`
  return { borderColor: border, boxShadow: `0 0 10px -5px ${halo}` }
}
/** Dekoracja głębi karty — cienka jasna kreska na górnej krawędzi (odbicie
 *  światła jak na szklanej kopule) + miękka poświata koloru u dołu, jak na
 *  glossy ikonie aplikacji z referencji. Wstawiać jako pierwsze dziecko
 *  w `relative overflow-hidden` kontenerze (feedback 2026-08-27: "trochę głębi"). */
function CardDepth({ color = 'hsl(var(--primary))' }: { color?: string }) {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-1/2 h-20 w-36 -translate-x-1/2 rounded-full opacity-[0.16] blur-2xl"
        style={{ background: color }}
      />
    </>
  )
}
/** Kwadratowa ikona ze szklaną głębią — gradient od ciemnego u góry do
 *  podświetlonego koloru u dołu, plus połysk na górnej krawędzi, jak
 *  glossy ikona aplikacji z referencji, zamiast płaskiego wypełnienia. */
function GlowIcon({ icon: Icon, color = 'hsl(var(--primary))' }: { icon: LucideIcon; color?: string }) {
  return (
    <span
      className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border"
      style={{
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        background: `linear-gradient(180deg, hsl(var(--background)) 0%, color-mix(in srgb, ${color} 20%, hsl(var(--background))) 100%)`,
        boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.1), 0 6px 14px -6px color-mix(in srgb, ${color} 55%, transparent)`,
      }}
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent" />
      <Icon className="relative h-[19px] w-[19px]" style={{ color }} />
    </span>
  )
}

/** Wielki, blady napis w tle sekcji — jak "Pricing" za kartami cenowymi
 *  u Forma AI. Czysty tekst, bez obrazka, przycięty overflow-hidden rodzica. */
function BigBackdropText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 select-none whitespace-nowrap text-center font-heading font-black leading-none text-foreground/[0.05]',
        'text-[18vw] sm:text-[15vw]',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Dymne, wstęgowe tło hero — płynące krzywe (jak Portfolite), monochromatyczne
 *  z muśnięciem błękitu, zamiast pojedynczych rozmytych plam. */
function HeroWispyBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 90% 70% at 50% 0%, hsl(var(--foreground) / 0.06), hsl(var(--background)) 65%)',
        maskImage: 'linear-gradient(to bottom, black 0%, black 82%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 82%, transparent 100%)',
      }}
    >
      <svg viewBox="0 0 1200 820" preserveAspectRatio="xMidYMin slice" className="absolute inset-0 h-full w-full" style={{ opacity: 0.55 }}>
        <defs>
          <filter id="nbWisp" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <linearGradient id="nbWispGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
            <stop offset="45%" stopColor="hsl(var(--foreground))" stopOpacity="0.16" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="nbWispGrad2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M -100 120 C 200 40, 350 260, 620 160 S 1000 60, 1300 220" fill="none" stroke="url(#nbWispGrad1)" strokeWidth="60" filter="url(#nbWisp)" />
        <path d="M -100 380 C 250 300, 420 520, 700 400 S 1050 260, 1300 420" fill="none" stroke="url(#nbWispGrad2)" strokeWidth="70" filter="url(#nbWisp)" />
        <path d="M -100 600 C 220 520, 500 700, 780 560 S 1080 480, 1300 620" fill="none" stroke="url(#nbWispGrad1)" strokeWidth="50" filter="url(#nbWisp)" />
      </svg>
      <div className="absolute inset-0" style={{ opacity: 0.05, mixBlendMode: 'overlay', backgroundImage: 'repeating-linear-gradient(115deg, hsl(var(--foreground)) 0px, transparent 1.5px, transparent 3px)' }} />
    </div>
  )
}

/** Zamiast czterech rozłącznych, nic-nie-łączących-je kafli (opinie / kwota /
 *  chipy / ikony osobno) — JEDNA makieta "okna platformy": pasek z modułami,
 *  boczny pasek ikon i czat z podglądem wygenerowanej grafiki w jednym
 *  ekranie, żeby wizualnie DOWIEŚĆ hasło "jedna platforma" zamiast je tylko
 *  opisywać. Dwie pływające plakietki wystają z rogów jak u Finstact
 *  (feedback 2026-08-27: "zmień tu elementy, ogólnie to przebuduj"). */
function PlatformShowcase() {
  const sidebarIcons = [Brain, Camera, NotebookPen, Calendar, Rocket, Mic]
  return (
    <div className="relative mx-auto mt-16 w-full max-w-3xl">
      <FloatingStatBadge
        value={STATY[0].value}
        label={STATY[0].label}
        icon={STATY[0].icon}
        className="-left-4 -top-5 hidden rotate-[-4deg] sm:flex"
      />
      <FloatingStatBadge
        value="do 350 zł"
        label="oszczędności miesięcznie"
        icon={Sparkles}
        className="-bottom-5 -right-4 hidden rotate-[3deg] sm:flex"
      />

      <div className="overflow-hidden rounded-2xl border bg-card shadow-[0_24px_48px_-28px_rgb(0_0_0/0.6)]" style={glowStyle('hsl(var(--primary))')}>
        {/* pasek tytułowy z zakładkami modułów */}
        <div className="flex items-center gap-3 border-b border-foreground/[0.07] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-foreground/15" />
            <span className="h-2 w-2 rounded-full bg-foreground/15" />
            <span className="h-2 w-2 rounded-full bg-foreground/15" />
          </div>
          <div className="ml-2 flex gap-1.5 overflow-hidden">
            <span className="shrink-0 rounded-md bg-primary/[0.14] px-2.5 py-1 font-mono text-[10px] font-bold text-primary">Chat</span>
            <span className="shrink-0 rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold text-foreground/40">Studio</span>
            <span className="hidden shrink-0 rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold text-foreground/40 sm:inline-block">Notatki</span>
          </div>
          <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.08] px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-widest text-primary sm:inline-flex">
            <span className="h-1 w-1 animate-pulse rounded-full bg-primary" />
            Na żywo
          </span>
        </div>

        {/* wnętrze: boczny pasek modułów + czat z podglądem grafiki */}
        <div className="grid grid-cols-[52px_1fr]">
          <div className="flex flex-col items-center gap-2 border-r border-foreground/[0.07] py-4">
            {sidebarIcons.map((Ico, i) => (
              <span
                key={i}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  i === 0 ? 'bg-primary/[0.16] text-primary' : 'text-foreground/35',
                )}
              >
                <Ico className="h-4 w-4" />
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 p-4">
            <div className="max-w-[75%] self-start rounded-lg rounded-bl-sm bg-foreground/[0.06] px-3 py-2 text-[11px] text-foreground/65">
              Zrób mi 4 warianty grafiki produktowej w stylu minimalistycznym
            </div>
            <div className="max-w-[85%] self-end rounded-lg rounded-br-sm bg-primary px-3 py-2 text-[11px] text-background">
              Jasne, generuję — GPT-5 opisze koncept, Nano Banana Pro wyrenderuje grafiki.
            </div>
            <div className="mt-1 grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((k) => (
                <div key={k} className="aspect-square rounded-md bg-gradient-to-br from-primary/[0.2] to-primary/[0.03]" />
              ))}
            </div>
            <div className="mt-1 flex items-center gap-1.5 self-start rounded-lg bg-foreground/[0.06] px-3 py-2">
              {[0, 1, 2].map((k) => <span key={k} className="h-1 w-1 animate-pulse rounded-full bg-foreground/40" style={{ animationDelay: `${k * 0.15}s` }} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Pływająca plakietka statystyki (10+, 1, 100%, 0 zł) — te same dane co w
 *  "Sprawdzone wyniki", tu podpięte pod flagowe karty modułów jak notyfikacje
 *  wystające z makiet u Finstact (feedback 2026-08-27: "dodaj tu te elementy"). */
function FloatingStatBadge({ value, label, icon: Icon, className }: { value: string; label: string; icon: LucideIcon; className?: string }) {
  return (
    <div
      className={cn('absolute z-20 flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2', className)}
      style={glowStyle('hsl(var(--primary))')}
    >
      <IconTile icon={Icon} size="sm" />
      <div className="leading-none">
        <p className="font-heading text-[15px] font-extrabold text-foreground">{value}</p>
        <p className="mt-0.5 whitespace-nowrap text-[9px] font-medium text-foreground/45">{label}</p>
      </div>
    </div>
  )
}

/** Ikona ElevenLabs — dwa paski, lokalna kopia (nie eksportowana ze
 *  współdzielonego HomePage.tsx, żeby nie ruszać „Strony głównej NEW"). */
function ElevenLabsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 24" className={className} fill="currentColor">
      <rect x="0" y="0" width="4" height="24" rx="1" />
      <rect x="10" y="0" width="4" height="24" rx="1" />
    </svg>
  )
}

/** Jedna karta partnera w banerze — ikona (jeśli mamy prawdziwą) albo
 *  monogram, plus nazwa i podtytuł. Identyczny styl co karty modeli w
 *  "Ekosystem modeli" (ModelEcosystemBridge), zgodnie z feedbackiem. */
function PartnerCard({ name, sub, Icon, mono }: { name: string; sub: string; Icon?: typeof OpenAIIcon; mono?: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-foreground/[0.08] bg-card/80 px-[18px] py-3.5 backdrop-blur-sm">
      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-foreground/[0.06] font-heading text-[13px] font-extrabold">
        {Icon ? <Icon className="h-4 w-4 text-foreground/80" /> : mono}
      </span>
      <div>
        <p className="font-heading text-[12.5px] font-bold leading-none text-foreground">{name}</p>
        <p className="mt-0.5 text-[10.5px] text-foreground/40">{sub}</p>
      </div>
    </div>
  )
}

const PARTNER_CARDS: { name: string; sub: string; Icon?: typeof OpenAIIcon; mono?: string }[] = [
  { name: 'Google', sub: 'Nano Banana Pro', mono: 'G' },
  { name: 'OpenAI', sub: 'GPT-5.4', Icon: OpenAIIcon },
  { name: 'Anthropic', sub: 'Claude Sonnet & Opus', Icon: AnthropicIcon },
  { name: 'xAI', sub: 'Grok 4.3', Icon: XaiIcon },
  { name: 'Mistral', sub: 'Mixtral / Le Chat', mono: 'M' },
  { name: 'ElevenLabs', sub: 'Voice AI', Icon: ElevenLabsIcon },
  { name: 'Runware', sub: 'Generowanie wideo', mono: 'R' },
  { name: 'Supabase', sub: 'Infrastruktura', mono: 'S' },
  { name: 'Stripe', sub: 'Płatności', mono: 'S' },
  { name: 'Vercel', sub: 'Hosting', mono: 'V' },
  { name: 'Cloudflare', sub: 'Sieć / CDN', mono: 'C' },
  { name: 'Tiptap', sub: 'Edytor notatek', mono: 'T' },
]

/** Baner partnerów — JEDYNA karuzela "silników ogólnych" (cały stack
 *  platformy: modele + infrastruktura, nie tylko AI). Karty w tym samym
 *  stylu co "Ekosystem modeli" niżej (ikona + nazwa + podtytuł), nie płaskie
 *  pigułki tekstowe.
 *
 *  Druga i JEDYNA druga karuzela na tej stronie to "Ekosystem modeli"
 *  (ModelEcosystemBridge, niżej) — konkretne modele AI. Nie dokładać kolejnych. */
function HeroBanner() {
  const track = [...PARTNER_CARDS, ...PARTNER_CARDS]
  return (
    <div
      aria-hidden
      className="relative w-full overflow-hidden py-1"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <div className="flex w-max gap-3 px-6 nb-marquee-x">
        {track.map((p, i) => <PartnerCard key={`${p.name}-${i}`} {...p} />)}
      </div>
    </div>
  )
}

/** Ramka „urządzenia" ze świecącym obramowaniem koloru modułu — jak
 *  pływające makiety u Finstact. Środek renderuje jedną z sześciu miniaturek
 *  (`ModuleMockupContent`), dobraną po `id` modułu, więc każda karta pokazuje
 *  co innego zamiast gołej ikony (feedback 2026-08-27: „całkowicie inny styl"). */
function ModuleStage({ id, color, tall }: { id: string; color: string; tall?: boolean }) {
  return (
    <div className={cn('relative flex items-center justify-center', tall ? 'h-[168px]' : 'h-[128px]')}>
      {/* dwa przygaszone panele z tyłu — głębia jak nakładające się karty referencji */}
      <div aria-hidden className="absolute h-[78%] w-[62%] -translate-x-[38%] rotate-[-7deg] rounded-xl border border-foreground/[0.06] bg-foreground/[0.02]" />
      <div aria-hidden className="absolute h-[78%] w-[62%] translate-x-[38%] rotate-[7deg] rounded-xl border border-foreground/[0.06] bg-foreground/[0.02]" />
      {/* główna „szybka" z delikatnie podświetlonym obramowaniem koloru modułu */}
      <div
        className="relative z-10 flex h-full w-[72%] flex-col gap-2 overflow-hidden rounded-xl border bg-background/80 p-3 backdrop-blur-sm"
        style={glowStyle(color)}
      >
        <ModuleMockupContent id={id} color={color} />
      </div>
    </div>
  )
}

/** Zawartość „szybki" — sześć różnych, ręcznie ułożonych miniaturek UI,
 *  po jednej na moduł, zbudowanych z samych divów (zero zasobów graficznych). */
function ModuleMockupContent({ id, color }: { id: string; color: string }) {
  if (id === 'chat') {
    return (
      <div className="flex flex-1 flex-col justify-end gap-1.5">
        <div className="max-w-[70%] self-start rounded-lg rounded-bl-sm bg-foreground/[0.08] px-2.5 py-1.5 text-[9px] text-foreground/60">Podsumuj ten raport</div>
        <div className="max-w-[78%] self-end rounded-lg rounded-br-sm px-2.5 py-1.5 text-[9px] text-background" style={{ background: color }}>Jasne, oto trzy kluczowe wnioski…</div>
        <div className="flex items-center gap-1 self-start rounded-lg bg-foreground/[0.08] px-2.5 py-1.5">
          {[0, 1, 2].map((k) => <span key={k} className="h-1 w-1 animate-pulse rounded-full bg-foreground/40" style={{ animationDelay: `${k * 0.15}s` }} />)}
        </div>
      </div>
    )
  }
  if (id === 'studio') {
    return (
      <div className="grid flex-1 grid-cols-2 gap-1.5">
        {[0, 1, 2, 3].map((k) => (
          <div key={k} className="rounded-md" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${color} 22%, transparent), transparent)` }} />
        ))}
      </div>
    )
  }
  if (id === 'notes') {
    return (
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-1.5 w-[85%] rounded-full bg-foreground/[0.1]" />
        <div className="h-1.5 w-[60%] rounded-full bg-foreground/[0.1]" />
        <div className="h-1.5 w-[72%] rounded-full bg-foreground/[0.1]" />
        <div className="mt-auto rounded-md px-2 py-1.5 text-[8.5px] font-semibold text-background" style={{ background: color }}>Odpowiedź AI z Twoich notatek ✓</div>
      </div>
    )
  }
  if (id === 'calendar') {
    return (
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="grid grid-cols-7 gap-[3px]">
          {Array.from({ length: 21 }).map((_, k) => (
            <span key={k} className="aspect-square rounded-[2px]" style={k === 10 ? { background: color } : { background: 'hsl(var(--foreground) / 0.08)' }} />
          ))}
        </div>
        <div className="mt-auto h-1.5 w-[55%] rounded-full" style={{ background: `color-mix(in srgb, ${color} 45%, transparent)` }} />
      </div>
    )
  }
  if (id === 'video') {
    return (
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-1 items-center justify-center">
          <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: color }}>
            <span className="ml-0.5 h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-background" />
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-foreground/[0.1]">
          <div className="h-1 w-[42%] rounded-full" style={{ background: color }} />
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-1 items-end justify-center gap-[3px] pb-1">
      {[6, 14, 9, 20, 12, 24, 10, 16, 7].map((h, k) => (
        <span key={k} className="w-[3px] rounded-full" style={{ height: h, background: k % 3 === 0 ? color : 'hsl(var(--foreground) / 0.15)' }} />
      ))}
    </div>
  )
}

/** Lokalny, "pogłębiony" fork `ChaosVsUnifiedCard` (z HomePage.tsx) — TA SAMA
 *  treść i logika zakładek, ale w pełni przystosowana do stylu głębi tej
 *  strony (CardDepth, GlowIcon, glowStyle) zamiast płaskich klas oryginału.
 *  Osobna kopia, żeby nie ruszać komponentu współdzielonego ze "Stroną
 *  główną NEW" (feedback 2026-08-27: "cały styl" — nie tylko otoczka). */
function DepthCompareCard() {
  const [tab, setTab] = useState<'stack' | 'features'>('stack')
  return (
    <div
      className={GLOW_CARD}
      style={{
        ...glowStyle('hsl(var(--primary))'),
        background: 'linear-gradient(180deg, color-mix(in srgb, hsl(var(--primary)) 6%, hsl(var(--card))) 0%, hsl(var(--card)) 55%)',
      }}
    >
      <CardDepth />
      <TechCornerMarks />

      <div className="relative mb-5 flex items-center justify-between border-b border-foreground/[0.08] pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[1.5px] text-primary">Kalkulacja kosztów</span>
        </div>
        <div className="flex rounded-full border border-foreground/[0.1] bg-background/60 p-0.5">
          {(['stack', 'features'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                tab === t ? 'bg-primary/20 font-bold text-primary shadow-sm' : 'text-foreground/60 hover:text-foreground',
              )}
            >
              {t === 'stack' ? 'Koszty' : 'Dlaczego NextByte'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'stack' ? (
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* CHAOS — celowo płaski, bez głębi: to jest ta gorsza opcja */}
          <div className="flex flex-col rounded-2xl border border-foreground/[0.12] bg-foreground/[0.04] p-5">
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-sans text-[11px] font-semibold tracking-wide text-foreground/45">5 subskrypcji osobno</span>
                <span className="rounded-lg border border-foreground/15 bg-foreground/[0.07] px-2 py-1 font-sans text-[10px] font-semibold text-foreground/45">Chaos</span>
              </div>
              <ul className="divide-y divide-foreground/[0.05] font-sans">
                {[
                  { name: 'ChatGPT Plus', price: '~85 zł/mc', icon: OpenAIIcon },
                  { name: 'Claude Pro', price: '~85 zł/mc', icon: AnthropicIcon },
                  { name: 'Midjourney', price: '~125 zł/mc', icon: Camera },
                  { name: 'Notion / Todoist', price: '~65 zł/mc', icon: NotebookPen },
                  { name: 'ElevenLabs', price: '~90 zł/mc', icon: Mic },
                ].map(({ name, price, icon: RowIcon }) => (
                  <li key={name} className="flex items-center justify-between py-2.5">
                    <span className="flex items-center gap-2 text-[13px] text-foreground/65">
                      <RowIcon className="h-3.5 w-3.5 shrink-0 text-foreground/35" />
                      {name}
                    </span>
                    <span className="text-[13px] font-medium text-foreground/50">{price}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-foreground/[0.08] pt-4">
              <p className="font-heading text-[22px] font-bold text-foreground/65">~450 zł/mc</p>
              <p className="mt-1.5 text-[11px] leading-snug text-foreground/30">5 logowań · 5 faktur w USD</p>
            </div>
          </div>

          {/* NEXTBYTE — pełna głębia: podświetlone obramowanie, gradientowe tło
               i poświata u dołu — celowy kontrast z płaskim "Chaos" obok */}
          <div
            className="relative flex flex-col overflow-hidden rounded-2xl border p-5"
            style={{
              ...glowStyle('hsl(var(--primary))'),
              background: 'linear-gradient(165deg, color-mix(in srgb, hsl(var(--primary)) 14%, hsl(var(--card))) 0%, hsl(var(--card)) 60%)',
            }}
          >
            <CardDepth />
            <div className="relative flex-1">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-sans text-[11px] font-semibold tracking-wide text-foreground/80">Ekosystem NextByte</span>
                <span className="whitespace-nowrap rounded-lg border border-primary/25 bg-primary/15 px-2 py-1 font-sans text-[10px] font-semibold text-primary">All-in-one</span>
              </div>
              <ul className="divide-y divide-foreground/[0.05] font-sans">
                <li className="flex items-center gap-2.5 py-2.5">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  <div className="flex items-center gap-2 text-foreground/80">
                    <OpenAIIcon className="h-4 w-4 shrink-0 text-foreground/60" />
                    <AnthropicIcon className="h-4 w-4 shrink-0 text-foreground/60" />
                    <GeminiIcon className="h-4 w-4 shrink-0 text-foreground/60" />
                    <XaiIcon className="h-4 w-4 shrink-0 text-foreground/60" />
                    <span className="ml-1 whitespace-nowrap text-[13px] text-foreground/80">i wiele więcej</span>
                  </div>
                </li>
                {[
                  { text: 'Studio zdjęć 4K i Wideo AI', icon: Camera },
                  { text: 'Notatki AI i Kalendarz', icon: Calendar },
                  { text: 'Głos i transkrypcja AI', icon: Mic },
                  { text: 'Lokalny AI za 0 zł', icon: Cpu },
                ].map(({ text, icon: RowIcon }) => (
                  <li key={text} className="flex items-center gap-2.5 py-2.5">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    <RowIcon className="h-3.5 w-3.5 shrink-0 text-foreground/45" />
                    <span className="whitespace-nowrap text-[13px] text-foreground/80">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative border-t border-foreground/[0.08] pt-4">
              <p className="whitespace-nowrap font-heading text-[22px] font-bold text-foreground">
                Od <span className="font-bold text-primary">0 zł</span><span className="text-[14px] font-normal text-foreground/50"> / mc</span>
              </p>
              <p className="mt-1.5 text-[11px] leading-snug text-foreground/45">1 faktura VAT · po polsku · Serwery UE</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative space-y-3">
          {[
            {
              title: 'Wspólna baza wiedzy i kontekst',
              before: 'Notatki w Notion, prompty w ChatGPT, zadania w Trello — zero powiązania.',
              after: 'Czat AI bezpośrednio czyta Twoje notatki i zamienia odpowiedzi w zadania Kanban.',
            },
            {
              title: 'Przełączanie modeli w ułamku sekundy',
              before: 'Logowanie do 4 różnych stron, kopiowanie długich promptów, limity rate-limit.',
              after: 'Wybór Claude, GPT lub Gemini jednym klikiem w tym samym oknie konwersacji.',
            },
            {
              title: 'Bezpieczeństwo biznesowe i poufność',
              before: 'Ryzyko trenowania publicznych modeli na wrażliwych danych firmy.',
              after: 'Przetwarzanie na serwerach w UE, zgodność z RODO oraz tryb 100% offline (Ollama).',
            },
          ].map((item, idx) => (
            <div key={idx} className="relative overflow-hidden rounded-xl border border-foreground/[0.08] bg-background/50 p-3.5">
              <p className="mb-1.5 flex items-center gap-2 font-heading text-[12.5px] font-semibold text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 font-mono text-[10px] font-bold text-primary">{idx + 1}</span>
                {item.title}
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 text-[11px] sm:grid-cols-2">
                <div className="rounded-lg border border-foreground/[0.1] bg-foreground/[0.05] p-2 text-foreground/55">
                  <span className="mb-0.5 block font-mono text-[9px] font-bold uppercase text-foreground/50">Osobne appki:</span>
                  {item.before}
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-2 text-foreground/90">
                  <span className="mb-0.5 block font-mono text-[9px] font-bold uppercase text-primary">NextByte:</span>
                  {item.after}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative mt-4 flex items-center justify-between border-t border-foreground/[0.06] pt-3 text-[11px] text-foreground/50">
        <span className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Dane chronione szyfrowaniem E2EE</span>
        </span>
        <span className="font-mono text-[10px] font-semibold text-primary/70">Zgodne z europejskim RODO</span>
      </div>
    </div>
  )
}

export function HomePage2({ onNavigate = () => {} }: { onNavigate?: (p: HomePageId) => void }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  return (
    <div className="relative flex w-full flex-col font-landing text-foreground">
      <AnimStyles />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nb-marquee-x { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .nb-marquee-x { animation: nb-marquee-x 28s linear infinite; }
      ` }} />
      <PageAmbience />

      {/* ══════════ HERO + MODELE NA ŻYWO — tło dymne wspólne dla obu sekcji,
           żeby efekt nie urywał się nagle na granicy hero (feedback 2026-08-27) ══════════ */}
      <div className="relative overflow-hidden">
        <HeroWispyBackground />

        <section className="relative pt-[104px]">
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
            <FadeIn>
              <h1 className="font-heading text-[clamp(40px,6.5vw,80px)] font-normal leading-[1.02] tracking-[-0.04em]">
                <span className="block text-primary drop-shadow-[0_0_40px_rgba(105,179,240,0.4)]">NextByte.</span>
                <span className="block text-foreground">Twoje AI w jednym miejscu.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={60}>
              <p className="mt-[22px] max-w-2xl font-sans text-[16px] font-light leading-[1.6] text-foreground/70">
                Dostęp do GPT-5, Claude, Gemini i Groka, generowanie grafik 4K oraz inteligentna baza wiedzy w jednym spójnym panelu — w 100% po polsku, na serwerach w UE i od 0 zł.
              </p>
            </FadeIn>

            <FadeIn delay={100}>
              <div className="mt-[30px] flex flex-col items-center gap-3.5 sm:flex-row">
                <GlowButton onClick={() => onNavigate('cennik')}>Rozpocznij za darmo</GlowButton>
                <GhostButton onClick={() => onNavigate('cennik')}>Zobacz cennik i pakiety</GhostButton>
              </div>
            </FadeIn>

            {/* ── pasek partnerów tuż pod CTA, jak logotypy pod hero u SEOtalos/Webtrix ── */}
            <FadeIn delay={140} className="mt-14 w-full">
              <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/30">
                Modele i infrastruktura, które napędzają NextByte
              </p>
              <HeroBanner />
            </FadeIn>
          </div>
        </section>

        {/* ══════════ SIATKA BENTO — konkretne mini-produkty zamiast pustki ══════════ */}
        <Section className="relative z-10 py-16 sm:py-20">
          <FadeIn>
            <SecRule label="Jedna platforma" />
            <h2 className="mb-3 max-w-2xl font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.1] tracking-[-2px] text-foreground">
              Narzędzie, które <span className="font-normal text-primary">naprawdę dowozi wyniki.</span>
            </h2>
            <p className="mb-10 max-w-xl font-sans text-[15px] font-light leading-relaxed text-foreground/55">
              Zamiast pięciu osobnych kont — jeden panel, jedna pula Byte i jeden rachunek w złotówkach.
            </p>
            <PlatformShowcase />
          </FadeIn>
        </Section>
      </div>

      {/* ══════════ MOST EKOSYSTEMU MODELI (grafika) — JEDYNA karuzela, która
           zostaje bez zmian stylu ══════════ */}
      <Section className="relative z-10 pb-2 pt-10 sm:pt-14">
        <FadeIn>
          <SecRule label="Ekosystem modeli" />
          <ModelEcosystemBridge />
        </FadeIn>
      </Section>

      {/* ══════════ OSIĄGNIĘCIA — te same świecące karty co siatka bento pod
           hero, zero luk między sekcjami (feedback 2026-08-27: "przenieś ten
           styl i tutaj") ══════════ */}
      <Section className="relative z-10 pb-16 pt-2 sm:pb-24">
        <Glow className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" size={700} opacity={0.05} />
        <FadeIn>
          <SecRule label="Sprawdzone wyniki" />
          <h2 className="mb-8 max-w-2xl font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.1] tracking-[-2px] text-foreground">
            Liczby, <span className="font-normal text-primary">nie obietnice.</span>
          </h2>
        </FadeIn>
        <div className="relative grid grid-cols-2 gap-5 md:grid-cols-4">
          {STATY.map((s, i) => (
            <FadeIn key={s.label} delay={i * 80}>
              <div className={GLOW_CARD} style={glowStyle('hsl(var(--primary))')}>
                <CardDepth />
                <GlowIcon icon={s.icon} />
                <p className="relative mt-3 font-heading text-[26px] font-extrabold leading-none tracking-tight text-foreground">{s.value}</p>
                <p className="mt-1.5 text-[11px] font-medium leading-tight text-foreground/50">{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <TechDivider />

      {/* ══════════ MANIFEST: CHAOS VS NEXTBYTE (grafika) ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5 space-y-5 lg:pt-2">
              <SecRule label="Dlaczego NextByte" />
              <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.12] tracking-[-1.5px] text-foreground">
                Jeden abonament zamiast <br />
                <span className="text-primary font-normal">pięciu osobnych.</span>
              </h2>
              <p className="font-sans text-[15px] text-foreground/60 leading-relaxed max-w-lg font-light">
                Koniec z przepłacaniem za osobne konta w USD. Korzystaj z topowych modeli AI, studia grafik i bazy wiedzy w ramach jednej elastycznej puli Byte.
              </p>
              <div className="pt-2">
                <GlowButton onClick={() => onNavigate('cennik')}>Rozpocznij za darmo</GlowButton>
              </div>
            </div>
            <div className="lg:col-span-7">
              <DepthCompareCard />
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ ŁUK HEMISPHERE (grafika) ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <HemisphereArchSection />
        </FadeIn>
      </Section>

      {/* ══════════ SIATKA MODUŁÓW ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Sześć modułów" />
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.1] text-foreground mb-3 max-w-2xl tracking-[-2px]">
            Najlepsze modele <span className="font-normal text-primary">do każdego zadania.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-xl mb-12 font-light">
            Pod każdym modułem kilka silników AI — dobranych pod to, co faktycznie robisz. Wszystkie z jednej puli Byte.
          </p>
        </FadeIn>
        {/* Rząd 1 — dwa flagowe moduły, szersze karty z większą makietą UI +
             pływające plakietki statystyk (10+, 100%…), wystające jak
             notyfikacje z makiet u Finstact (feedback 2026-08-27). */}
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
          {MODULY.slice(0, 2).map((m, i) => (
            <FadeIn key={m.id} delay={i * 80} className="relative">
              <FloatingStatBadge
                value={STATY[i].value}
                label={STATY[i].label}
                icon={STATY[i].icon}
                className={i === 0 ? '-top-4 -right-3 rotate-[-3deg]' : '-top-4 -right-3 rotate-[3deg]'}
              />
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/80 p-5 shadow-[0_24px_48px_-28px_rgb(0_0_0/0.6)] backdrop-blur-sm">
                <ModuleStage id={m.id} color={m.color} tall />
                <div className="mt-4 flex items-center gap-2.5">
                  <IconTile icon={m.icon} color={m.color} size="sm" />
                  <h3 className="font-heading text-[16px] font-extrabold leading-snug text-foreground">{m.title}</h3>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/55">{m.lead}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Rząd 2 — cztery pozostałe moduły, mniejsze karty w tym samym duchu */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULY.slice(2).map((m, i) => (
            <FadeIn key={m.id} delay={i * 60}>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/80 p-4 shadow-[0_24px_48px_-28px_rgb(0_0_0/0.6)] backdrop-blur-sm">
                <ModuleStage id={m.id} color={m.color} />
                <div className="mt-3.5 flex items-center gap-2">
                  <IconTile icon={m.icon} color={m.color} size="sm" />
                  <h3 className="text-[13.5px] font-extrabold leading-snug text-foreground">{m.title}</h3>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-foreground/50">{m.lead}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ══════════ TRZY FILARY ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Trzy filary" />
        </FadeIn>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {WARTOSCI_FILARY.map((f, i) => {
            const FilarIcon = [Radar, Workflow, Sparkles][i] ?? Sparkles
            return (
              <FadeIn key={f.tag} delay={i * 80}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/80 p-6 shadow-[0_24px_48px_-28px_rgb(0_0_0/0.6)] backdrop-blur-sm">
                  <CardDepth />
                  <GlowIcon icon={FilarIcon} />
                  <p className="relative mt-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary/70">{f.tag}</p>
                  <h3 className="relative mt-1 font-heading text-[16px] font-extrabold leading-snug text-foreground">{f.title}</h3>
                  <p className="relative mt-2 text-[13px] leading-relaxed text-foreground/55">{f.desc}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </Section>

      {/* ══════════ LOKALNY AI ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Prywatność" />
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.1] text-foreground mb-3 max-w-2xl tracking-[-2px]">
            Prywatne AI na Twoim sprzęcie.
          </h2>
          <p className="font-sans text-[15px] text-foreground/65 leading-relaxed max-w-xl mb-8 font-light">
            Llama, Mistral i DeepSeek bezpośrednio na Twoim GPU przez Ollama i LM Studio. 100% prywatności, zero opłat i nielimitowane działanie offline.
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Shield, title: '100% na Twoim dysku', desc: 'Przetwarzanie lokalne przez procesor i kartę graficzną bez wysyłania danych do chmury.' },
              { icon: Cpu, title: 'Działa z Llama i Ollama', desc: 'Natywna integracja z darmowymi programami Ollama i LM Studio jednym kliknięciem.' },
              { icon: WifiOff, title: 'Za 0 zł i bez limitów', desc: 'Nielimitowana praca w trybie offline bez zużywania jednostek Byte i abonamentów.' },
            ].map((item, i) => {
              const ItemIcon = item.icon
              return (
                <FadeIn key={item.title} delay={i * 80}>
                  <div className="relative h-full overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/80 p-6 shadow-[0_24px_48px_-28px_rgb(0_0_0/0.6)] backdrop-blur-sm transition-colors hover:border-primary/25">
                    <CardDepth />
                    <GlowIcon icon={ItemIcon} />
                    <h3 className="relative mt-3.5 font-heading text-[15.5px] font-extrabold leading-snug text-foreground">{item.title}</h3>
                    <p className="relative mt-2 text-[13px] leading-relaxed text-foreground/55">{item.desc}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </FadeIn>
      </Section>

      <TechDivider />

      {/* ══════════ JAK TO DZIAŁA ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Start w 3 krokach" />
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.1] text-foreground mb-3 max-w-2xl tracking-[-2px]">
            Od rejestracji do pierwszego wyniku
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-xl mb-12 font-light">
            Zero konfiguracji, zero kart kredytowych na start.
          </p>
        </FadeIn>
        {/* Pionowy timeline ze świecącą linią i węzłami — jak w referencjach
             (krok → krok → krok połączone jedną smugą światła), zamiast
             gołej siatki 3 kart z przerywaną kreską (feedback 2026-08-27). */}
        <div className="relative mx-auto max-w-xl">
          <div aria-hidden className="absolute left-5 top-3 bottom-3 w-px bg-gradient-to-b from-primary/70 via-primary/25 to-transparent" />
          {KROKI.map((k, i) => (
            <FadeIn key={k.krok} delay={i * 100} className={cn('relative flex gap-5', i < KROKI.length - 1 && 'pb-7')}>
              <span
                className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-[13px] font-bold text-primary"
                style={glowStyle('hsl(var(--primary))')}
              >
                {i + 1}
              </span>
              <div className="flex-1 rounded-2xl border border-foreground/[0.08] bg-card/80 p-5 shadow-[0_24px_48px_-28px_rgb(0_0_0/0.6)] backdrop-blur-sm">
                <h3 className="font-heading text-[15.5px] font-extrabold leading-snug text-foreground">{k.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/55">{k.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ══════════ PORÓWNANIE — wielki napis w tle, jak Forma AI ══════════ */}
      <Section className="relative z-10 overflow-hidden py-16 sm:py-20">
        <BigBackdropText className="top-6">BYTE</BigBackdropText>
        <Glow className="left-1/2 top-1/3 -translate-x-1/2" size={800} opacity={0.1} />
        <FadeIn>
          <SecRule label="Porównanie" />
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.06] text-foreground mb-3 tracking-[-2px]">
            NextByte zamiast <span className="text-primary font-normal">pięciu subskrypcji.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-lg mb-10 font-light">
            Zestawienie funkcji, które w innych narzędziach wymagają osobnych planów w obcych walutach i generują chaos faktur.
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <div className="relative">
            <TechCornerMarks />
            <GlassCard padding="p-0" className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm font-sans">
                <thead>
                  <tr className="border-b border-foreground/[0.07]">
                    <th className="px-5 py-5 text-left text-[12px] font-medium text-foreground/40 font-mono">Funkcja</th>
                    {POROWNANIE.kolumny.map((k, i) => (
                      <th key={k} className="px-4 py-5 text-center">
                        {i === 0 ? (
                          <span className="font-heading text-[14px] font-semibold text-primary">{k}</span>
                        ) : (
                          <span className="font-heading text-[12.5px] font-medium text-foreground/40">{k}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {POROWNANIE.wiersze.map((r, ri) => (
                    <tr
                      key={r.f}
                      className={cn(
                        'border-b border-foreground/[0.04] last:border-b-0 transition-colors hover:bg-foreground/[0.02]',
                        ri % 2 === 0 && 'bg-foreground/[0.008]',
                      )}
                    >
                      <td className="px-5 py-3.5 text-[13px] font-medium text-foreground/70 font-sans">{r.f}</td>
                      {r.v.map((v, vi) => (
                        <td key={vi} className={cn('px-4 py-3.5 text-center', vi === 0 && 'bg-primary/[0.035]')}>
                          {v === true ? (
                            <CircleCheck className="mx-auto h-[18px] w-[18px] text-primary" />
                          ) : v === false ? (
                            <X className="mx-auto h-5 w-5 text-foreground/25 font-bold" />
                          ) : (
                            <span className={cn('font-sans text-[12.5px] font-semibold', vi === 0 ? 'text-primary' : 'text-foreground/50')}>
                              {v}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <GlassCard className="mt-6 flex flex-col gap-6 p-6 sm:p-7 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 text-foreground/50">
                  <OpenAIIcon className="h-7 w-7" />
                  <AnthropicIcon className="h-7 w-7" />
                  <Camera className="h-7 w-7" />
                  <NotebookPen className="h-7 w-7" />
                  <Mic className="h-7 w-7" />
                </div>
                <span className="font-heading text-[17px] font-medium text-foreground/35 line-through decoration-destructive/60 ml-1">
                  ~450 zł/mc
                </span>
              </div>
              <ArrowRight className="h-5 w-5 text-primary/40 shrink-0 hidden sm:block" />
              <div className="flex items-center gap-3">
                <NextByteMarkIcon className="h-8 w-8 text-primary shrink-0" />
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-[26px] font-bold text-foreground leading-none">
                    od <span className="text-primary">0 zł</span>
                  </span>
                  <span className="text-[12.5px] text-foreground/50 font-light">
                    (lub 99 zł w pakiecie)
                  </span>
                </div>
              </div>
            </div>
            <GlowButton onClick={() => onNavigate('cennik')} className="shrink-0 md:self-center">
              Sprawdź cennik i pakiety
            </GlowButton>
          </GlassCard>
        </FadeIn>
      </Section>

      {/* ══════════ BEZPIECZEŃSTWO DANYCH ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Bezpieczeństwo" />
          <h2 className="font-heading text-[clamp(26px,3.8vw,40px)] font-light leading-[1.1] text-foreground mb-3 tracking-[-1.5px] max-w-2xl">
            Twoje dane są tylko <span className="text-primary font-normal">Twoje.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-xl mb-10 font-light">
            Żaden gigant się nie szkoli na Twoich rozmowach. Nikt nie ma wglądu w Twoje dokumenty. To nie jest klauzula regulaminowa — to architektura platformy.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: 'Serwery w UE', sentence: 'Dane w Unii Europejskiej, pełna zgodność z RODO.' },
              { icon: Lock, title: 'Zero trenowania', sentence: 'Nikt nie szkoli modeli na Twoich danych.' },
              { icon: WifiOff, title: 'Zero wglądu z zewnątrz', sentence: 'Lokalny AI — dane nie opuszczają urządzenia.' },
              { icon: LogOut, title: 'Rezygnujesz kiedy chcesz', sentence: 'Jedno kliknięcie — dane usunięte w 30 dni.' },
            ].map((item) => {
              const ItemIcon = item.icon
              return (
                <div
                  key={item.title}
                  className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/80 p-6 text-center shadow-[0_24px_48px_-28px_rgb(0_0_0/0.6)] backdrop-blur-sm transition-colors hover:border-primary/25"
                >
                  <CardDepth />
                  <GlowIcon icon={ItemIcon} />
                  <h3 className="relative font-heading text-[14.5px] font-semibold text-foreground leading-snug">{item.title}</h3>
                  <p className="relative font-sans text-[12px] text-foreground/50 font-light leading-snug">{item.sentence}</p>
                </div>
              )
            })}
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ OPINIE ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Zaufanie użytkowników" />
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.1] text-foreground mb-12 max-w-2xl tracking-[-2px]">
            Nie nasze słowa. Ich wyniki.
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {OPINIE.map((o, i) => (
            <FadeIn key={o.id} delay={i * 80}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-foreground/[0.08] bg-card/80 p-6 shadow-[0_24px_48px_-28px_rgb(0_0_0/0.6)] backdrop-blur-sm">
                <Stars n={5} size={13} />
                <p className="text-[13.5px] leading-relaxed text-foreground/70">„{o.tekst}"</p>
                <div className="mt-auto flex flex-col items-start gap-1 border-t border-foreground/[0.07] pt-3.5">
                  <p className="font-heading text-[13px] font-bold text-foreground">{o.kategoria}</p>
                  <p className="text-[11.5px] text-foreground/45">{o.rola}</p>
                  <span className="mt-1 rounded-full bg-primary/[0.1] px-2.5 py-1 font-mono text-[10.5px] font-bold text-primary">{o.metryka}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Pytania" />
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.1] text-foreground mb-10 max-w-2xl tracking-[-2px]">
            Wszystko, co warto wiedzieć przed startem.
          </h2>
        </FadeIn>
        <FadeIn delay={100} className="mx-auto max-w-3xl space-y-2.5">
          {FAQ.map((f, i) => (
            <FaqRow key={f.q} q={f.q} a={f.a} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? null : i)} />
          ))}
        </FadeIn>
      </Section>

      {/* ══════════ CTA KOŃCOWE ══════════ */}
      <Section className="relative z-10 py-20 sm:py-28">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/[0.08] to-transparent px-6 py-16 text-center sm:px-12">
            <BigBackdropText className="top-4 text-[16vw] sm:text-[12vw]">NEXTBYTE</BigBackdropText>
            <Glow className="left-1/2 top-0 -translate-x-1/2" size={700} opacity={0.18} />
            <div className="relative z-10 flex flex-col items-center gap-5">
              <SecRule label="Gotowy?" />
              <h2 className="max-w-2xl font-heading text-[clamp(26px,4vw,40px)] font-light leading-[1.1] tracking-[-1.5px] text-foreground">
                Jeden abonament zamiast <span className="font-normal text-primary">pięciu osobnych.</span>
              </h2>
              <GlowButton size="lg" onClick={() => onNavigate('cennik')}>Rozpocznij za darmo</GlowButton>
            </div>
          </div>
        </FadeIn>
      </Section>
    </div>
  )
}
