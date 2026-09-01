import { useState, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Mic, Camera, Video, NotebookPen } from 'lucide-react'
import {
  Section, GlowButton, GhostButton,
  PageAmbience, AnimStyles, FadeIn,
  TechDivider, TechCornerMarks,
} from './shared'
import {
  ModelEcosystemBridge, SecRule,
  OpenAIIcon, AnthropicIcon, XaiIcon, GeminiIcon,
  NextByteMarkIcon,
} from './HomePage'
import {
  BlockAnimStyles, LazyBlock,
  PlatformVideoSection,
  DataSecuritySection, ServerSecuritySection, PrivacyLocalAISection,
  ThreePillarsSection, ThreeStepsSection, ComparisonSection,
  FaqSection, FinalCtaSection,
} from './HomePage3Blocks'
import {
  ElevenLabsIcon, KlingIcon, RunwareIcon,
  BananaIcon, PixVerseIcon, MiniMaxIcon,
} from './brand-icons'
import type { HomePage as HomePageId } from './types'

import interiorImg from '@/assets/studio/interior.jpg'
import carImg from '@/assets/studio/car.jpg'
import landscapeImg from '@/assets/studio/landscape.jpg'
import animalImg from '@/assets/studio/animal.jpg'

/* ═══════════════════════════════════════════════════════════════════════
   STRONA GŁÓWNA 3 — ARCHITEKTURA TECHNICZNA (FLEEK NETWORK BLUEPRINT)
   ═══════════════════════════════════════════════════════════════════════
   1. JEDNA KARUZELA:
      - `ModelEcosystemBridge` umieszczony bezpośrednio pod Hero CTA.
      - Usunięto zbędne podwójne paski.
   2. "NARZĘDZIE, KTÓRE NAPRAWDĘ DOWOZI WYNIKI":
      - Wszystkie 6 modułów (Czat, Studio 4K, Notatki, Kalendarz, Wideo, Głos)
        połączonych bezpośrednio ścieżkami węzłowymi z NextByte Space.
      - Czysta, czytelna grafika bez zbędnych opisów i badge'y.
   3. "LICZBY, NIE OBIETNICE":
      - Nowoczesny, minimalistyczny układ telemetryczny bez ciężkich kafelków.
   4. "JEDEN ABONAMENT ZAMIAST PIĘCIU OSOBNYCH":
      - Czysty Canvas Node Graph — pionowa lista 5 nodów z logotypami SVG
        i cenami łącząca się w węzeł ~450 zł/mc vs węzeł NextByte (99 zł / od 0 zł).
   5. MODUŁ 01: CHAT AI (Styl Fleek Network — Rozsuwany Blueprint Izometryczny):
      - Rozsuwane warstwy izometryczne 3D (Client 01, Neural Router 02, Compute 03)
        z liniami wskaźnikowymi CAD, matrycą GPU i techniczną specyfikacją.
   6. TRZY FILARY:
      - Skrócone, zwięzłe opisy o natychmiastowej czytelności.
   ═══════════════════════════════════════════════════════════════════════ */

/** Wysokość sticky paska nawigacyjnego strony — "wycentrowanie" grafik liczymy
    w obszarze POD nim, a nie w całym oknie przeglądarki. */
function getNavbarOffset(): number {
  if (typeof document === 'undefined') return 0
  return document.querySelector<HTMLElement>('[data-navbar]')?.getBoundingClientRect().height ?? 0
}

/** Wspólny styl obramowań z poświatą */
export const GLOW_CARD = 'relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 backdrop-blur-sm'

export function glowStyle(color: string): { borderColor: string; boxShadow: string } {
  const border = `color-mix(in srgb, ${color} 45%, transparent)`
  const halo = `color-mix(in srgb, ${color} 22%, transparent)`
  return { borderColor: border, boxShadow: `0 0 10px -5px ${halo}` }
}




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
          <filter id="nbWisp3" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <linearGradient id="nbWispGrad3_1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
            <stop offset="45%" stopColor="hsl(var(--foreground))" stopOpacity="0.16" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="nbWispGrad3_2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M -100 120 C 200 40, 350 260, 620 160 S 1000 60, 1300 220" fill="none" stroke="url(#nbWispGrad3_1)" strokeWidth="60" filter="url(#nbWisp3)" />
        <path d="M -100 380 C 250 300, 420 520, 700 400 S 1050 260, 1300 420" fill="none" stroke="url(#nbWispGrad3_2)" strokeWidth="70" filter="url(#nbWisp3)" />
        <path d="M -100 600 C 220 520, 500 700, 780 560 S 1080 480, 1300 620" fill="none" stroke="url(#nbWispGrad3_1)" strokeWidth="50" filter="url(#nbWisp3)" />
      </svg>
      <div className="absolute inset-0" style={{ opacity: 0.05, mixBlendMode: 'overlay', backgroundImage: 'repeating-linear-gradient(115deg, hsl(var(--foreground)) 0px, transparent 1.5px, transparent 3px)' }} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   1. NARZĘDZIE: NEXTBYTE AI MODEL CONSTELLATION (10 OFICJALNYCH MODELI)
   ═══════════════════════════════════════════════════════════════════════ */

interface AIModelNode {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  xPct: number
  yPct: number
  path: string
  startPt: { x: number; y: number }
  endPt: { x: number; y: number }
}

/* ═══════════════════════════════════════════════════════════════════════
   1. ZUNIFIKOWANA PLATFORMA AI: DWUKOLUMNOWY SCHEMAT POZIOMY (ŚWIATŁOWODY DO ŚRODKA)
   ═══════════════════════════════════════════════════════════════════════ */

interface SchematicNode {
  id: string
  name: string
  side: 'left' | 'right'
  sub: string
  icon: React.ComponentType<{ className?: string }>
  x: number
  y: number
  path: string
  portPt: { x: number; y: number }
  chipPt: { x: number; y: number }
  duration: string
  delay: string
}

// Canvas 580x320: Center Box (290, 160) size 76x76 [252, 328] x [122, 198]
// Organic crescent wave: Top/Bottom nodes tucked inward (X=58/522), Middle 3 spread wider (X=18/562)
const LEFT_SCHEMATIC_NODES: SchematicNode[] = [
  {
    id: 'gpt',
    name: 'OpenAI GPT-5.4',
    sub: 'Reasoning & LLM',
    side: 'left',
    icon: OpenAIIcon,
    x: 58,
    y: 28,
    portPt: { x: 83, y: 28 },
    chipPt: { x: 252, y: 138 },
    path: 'M 83 28 C 160 28, 195 138, 252 138',
    duration: '1.5s',
    delay: '0.1s',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude 3.7',
    sub: 'Hybrid Thinking',
    side: 'left',
    icon: AnthropicIcon,
    x: 28,
    y: 94,
    portPt: { x: 53, y: 94 },
    chipPt: { x: 252, y: 149 },
    path: 'M 53 94 C 145 94, 190 149, 252 149',
    duration: '1.9s',
    delay: '0.5s',
  },
  {
    id: 'gemini',
    name: 'Google Gemini 2.5',
    sub: 'Multimodal 2M',
    side: 'left',
    icon: GeminiIcon,
    x: 18,
    y: 160,
    portPt: { x: 43, y: 160 },
    chipPt: { x: 252, y: 160 },
    path: 'M 43 160 C 120 174, 180 148, 252 160',
    duration: '1.3s',
    delay: '0.0s',
  },
  {
    id: 'grok',
    name: 'xAI Grok 3',
    sub: 'Realtime Search',
    side: 'left',
    icon: XaiIcon,
    x: 28,
    y: 226,
    portPt: { x: 53, y: 226 },
    chipPt: { x: 252, y: 171 },
    path: 'M 53 226 C 145 226, 190 171, 252 171',
    duration: '2.2s',
    delay: '0.7s',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs HD',
    sub: 'Voice & Speech',
    side: 'left',
    icon: ElevenLabsIcon,
    x: 58,
    y: 292,
    portPt: { x: 83, y: 292 },
    chipPt: { x: 252, y: 182 },
    path: 'M 83 292 C 160 292, 195 182, 252 182',
    duration: '1.6s',
    delay: '0.3s',
  },
]

const RIGHT_SCHEMATIC_NODES: SchematicNode[] = [
  {
    id: 'runware',
    name: 'Runware Ultra-Fast',
    sub: 'Fast Inference',
    side: 'right',
    icon: RunwareIcon,
    x: 522,
    y: 28,
    portPt: { x: 497, y: 28 },
    chipPt: { x: 328, y: 138 },
    path: 'M 497 28 C 420 28, 385 138, 328 138',
    duration: '1.7s',
    delay: '0.4s',
  },
  {
    id: 'kling',
    name: 'Kling 1.5 HD',
    sub: 'Cinema Video 4K',
    side: 'right',
    icon: KlingIcon,
    x: 552,
    y: 94,
    portPt: { x: 527, y: 94 },
    chipPt: { x: 328, y: 149 },
    path: 'M 527 94 C 435 94, 390 149, 328 149',
    duration: '1.4s',
    delay: '0.2s',
  },
  {
    id: 'pixverse',
    name: 'PixVerse 4K',
    sub: 'LipSync & 3D',
    side: 'right',
    icon: PixVerseIcon,
    x: 562,
    y: 160,
    portPt: { x: 537, y: 160 },
    chipPt: { x: 328, y: 160 },
    path: 'M 537 160 C 460 148, 400 174, 328 160',
    duration: '2.0s',
    delay: '0.6s',
  },
  {
    id: 'minimax',
    name: 'MiniMax Hailuo',
    sub: 'Motion Physics',
    side: 'right',
    icon: MiniMaxIcon,
    x: 552,
    y: 226,
    portPt: { x: 527, y: 226 },
    chipPt: { x: 328, y: 171 },
    path: 'M 527 226 C 435 226, 390 171, 328 171',
    duration: '1.5s',
    delay: '0.8s',
  },
  {
    id: 'banana',
    name: 'Nano Banana',
    sub: 'Generative AI',
    side: 'right',
    icon: BananaIcon,
    x: 522,
    y: 292,
    portPt: { x: 497, y: 292 },
    chipPt: { x: 328, y: 182 },
    path: 'M 497 292 C 420 292, 385 182, 328 182',
    duration: '1.8s',
    delay: '0.15s',
  },
]

function UnifiedAIPlatformConvergence({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  return (
    <div className="relative z-10 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

        {/* LEWA STRONA: Nagłówek, krótki opis i czytelny poziomy pasek statystyk */}
        <div className="lg:col-span-5 text-left space-y-5">
          <div className="space-y-3">
            <SecRule label="JEDNA PLATFORMA" />
            <h2 className="font-heading text-[clamp(28px,3.5vw,44px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
              Wszystkie silniki AI. <br className="hidden sm:block" />
              <span className="font-normal text-primary">Jeden panel.</span>
            </h2>
            <p className="font-sans text-[15px] font-light leading-relaxed text-foreground/65 max-w-md">
              Połączyliśmy czołowe modele językowe, generatory grafik i wideo w jedno narzędzie. Przełączaj silniki jednym kliknięciem bez chaosu logowań.
            </p>
          </div>

          {/* POZIOMY UKŁAD 3 GŁÓWNYCH KORZYŚCI */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-foreground/[0.08]">
            <div className="space-y-0.5">
              <p className="font-heading text-[22px] sm:text-[25px] font-black text-foreground leading-none">10+</p>
              <p className="font-heading text-[12.5px] font-bold text-foreground">Silników AI</p>
            </div>

            <div className="space-y-0.5">
              <p className="font-heading text-[22px] sm:text-[25px] font-black text-primary leading-none">1 Pula</p>
              <p className="font-heading text-[12.5px] font-bold text-foreground">1 Subskrypcja</p>
            </div>

            <div className="space-y-0.5">
              <p className="font-heading text-[22px] sm:text-[25px] font-black text-foreground leading-none">100%</p>
              <p className="font-heading text-[12.5px] font-bold text-foreground">Po polsku & UE</p>
            </div>
          </div>

          {/* PRZYCISK AKCJI */}
          <div className="pt-2">
            <GlowButton size="lg" onClick={() => onNavigate('cennik')}>
              Rozpocznij za darmo
            </GlowButton>
          </div>
        </div>

        {/* PRAWA STRONA: ORGANICZNY POZIOMY SCHEMAT ŚWIATŁOWODOWY */}
        <div className="lg:col-span-7 flex items-center justify-center">
          {/* Wysokość MUSI iść za skalą poniżej: `transform: scale()` zmniejsza
              tylko rysunek, layout dalej zajmuje pełne 320 px. Bez tych progów
              pod grafiką zostawała pusta dziura (na telefonie ~140 px). */}
          <div className="relative mx-auto w-full max-w-[580px] h-[215px] xs:h-[255px] sm:h-[305px] md:h-[340px] flex items-center justify-center select-none">

            {/* Subtelna poświata ambientowa w tle */}
            <div className="absolute inset-0 bg-primary/[0.04] blur-3xl rounded-full pointer-events-none" />

            {/* SKALOWANY KONTENER 580x320 */}
            <div className="relative w-[580px] h-[320px] shrink-0 scale-[0.62] xs:scale-[0.74] sm:scale-[0.9] md:scale-100 origin-center transition-transform">

              {/* KRZYWE BEZIERA SVG Z PŁYNNYMI IMPULSAMI WPADAJĄCYMI DO ŚRODKA */}
              <svg viewBox="0 0 580 320" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <defs>
                  <filter id="nbWireGlowDirect" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Połączenia z LEWEJ strony DO ŚRODKA */}
                {LEFT_SCHEMATIC_NODES.map((node, i) => {
                  const isHovered = hoveredNode === node.id
                  const isAnyHovered = hoveredNode !== null
                  const baseOpacity = isHovered ? 0.8 : isAnyHovered ? 0.1 : 0.22
                  const pulseOpacity = isHovered ? 1 : isAnyHovered ? 0.3 : 0.85

                  return (
                    <g key={node.id} className="transition-all duration-300">
                      <path
                        d={node.path}
                        fill="none"
                        stroke="hsl(var(--foreground))"
                        strokeOpacity={baseOpacity}
                        strokeWidth={isHovered ? 2.2 : 1.5}
                      />
                      {/* Impuls elektryczny */}
                      <path
                        d={node.path}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth={isHovered ? 2.6 : 1.8}
                        strokeLinecap="round"
                        strokeDasharray="14 86"
                        filter="url(#nbWireGlowDirect)"
                        style={{
                          animation: `nbElectricCurrent ${isHovered ? '0.8s' : node.duration} linear infinite`,
                          animationDelay: node.delay,
                          opacity: pulseOpacity,
                        }}
                      />
                      <circle cx={node.portPt.x} cy={node.portPt.y} r={isHovered ? 4 : 3} fill="hsl(var(--primary))" filter="url(#nbWireGlowDirect)" />
                      <circle cx={node.chipPt.x} cy={node.chipPt.y} r={isHovered ? 3.5 : 2.5} fill="hsl(var(--primary))" />
                    </g>
                  )
                })}

                {/* Połączenia z PRAWEJ strony DO ŚRODKA */}
                {RIGHT_SCHEMATIC_NODES.map((node) => {
                  const isHovered = hoveredNode === node.id
                  const isAnyHovered = hoveredNode !== null
                  const baseOpacity = isHovered ? 0.8 : isAnyHovered ? 0.1 : 0.22
                  const pulseOpacity = isHovered ? 1 : isAnyHovered ? 0.3 : 0.85

                  return (
                    <g key={node.id} className="transition-all duration-300">
                      <path
                        d={node.path}
                        fill="none"
                        stroke="hsl(var(--foreground))"
                        strokeOpacity={baseOpacity}
                        strokeWidth={isHovered ? 2.2 : 1.5}
                      />
                      <path
                        d={node.path}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth={isHovered ? 2.6 : 1.8}
                        strokeLinecap="round"
                        strokeDasharray="14 86"
                        filter="url(#nbWireGlowDirect)"
                        style={{
                          animation: `nbElectricCurrent ${isHovered ? '0.8s' : node.duration} linear infinite`,
                          animationDelay: node.delay,
                          opacity: pulseOpacity,
                        }}
                      />
                      <circle cx={node.portPt.x} cy={node.portPt.y} r={isHovered ? 4 : 3} fill="hsl(var(--primary))" filter="url(#nbWireGlowDirect)" />
                      <circle cx={node.chipPt.x} cy={node.chipPt.y} r={isHovered ? 3.5 : 2.5} fill="hsl(var(--primary))" />
                    </g>
                  )
                })}
              </svg>

              {/* LEWE 5 MIKRO-CHIPÓW CAD (LLM & AUDIO) - WIĘKSZE (50x50) */}
              {LEFT_SCHEMATIC_NODES.map((node) => {
                const isHovered = hoveredNode === node.id

                return (
                  <div
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-xl flex items-center justify-center select-none transition-all duration-300 z-20 group cursor-default",
                      "border bg-card/90 dark:bg-[#0a0d13]/90 backdrop-blur-md",
                      isHovered
                        ? "border-primary/80 scale-115 shadow-[0_0_20px_rgba(56,189,248,0.45)]"
                        : "border-foreground/[0.12] hover:border-primary/50 shadow-md"
                    )}
                    style={{ left: node.x, top: node.y }}
                    title={`${node.name} — ${node.sub}`}
                  >
                    <span className="absolute top-1 left-1 text-[5px] font-mono text-primary/40 leading-none">┌</span>
                    <span className="absolute top-1 right-1 text-[5px] font-mono text-primary/40 leading-none">┐</span>
                    <span className="absolute bottom-1 left-1 text-[5px] font-mono text-primary/40 leading-none">└</span>
                    <span className="absolute bottom-1 right-1 text-[5px] font-mono text-primary/40 leading-none">┘</span>

                    <node.icon
                      className={cn(
                        "h-6 w-6 transition-all duration-300",
                        isHovered ? "text-primary scale-110 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" : "text-foreground/75 group-hover:text-primary"
                      )}
                    />
                  </div>
                )
              })}

              {/* CENTRALNY PROCESOR NEXTBYTE (KWADRAT / SQUIRCLE) */}
              <div
                className={cn(
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] h-[76px] rounded-2xl",
                  "flex flex-col items-center justify-center p-2 text-center select-none group z-30 transition-all duration-300",
                  "border border-primary/60 bg-card/95 dark:bg-[#070a0f]/95 backdrop-blur-2xl",
                  "shadow-[0_0_40px_rgba(56,189,248,0.3)] hover:shadow-[0_0_60px_rgba(56,189,248,0.55)]"
                )}
              >
                {/* Wewnętrzne narożniki CAD */}
                <div className="absolute inset-1.5 rounded-xl border border-primary/20 pointer-events-none" />
                <span className="absolute top-1.5 left-1.5 text-[7px] font-mono text-primary/40 leading-none">┌</span>
                <span className="absolute top-1.5 right-1.5 text-[7px] font-mono text-primary/40 leading-none">┐</span>
                <span className="absolute bottom-1.5 left-1.5 text-[7px] font-mono text-primary/40 leading-none">└</span>
                <span className="absolute bottom-1.5 right-1.5 text-[7px] font-mono text-primary/40 leading-none">┘</span>

                {/* Samo „N" — bez podpisu, rdzeń ma być znakiem, nie etykietą */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                  <NextByteMarkIcon className="h-7 w-7" />
                </div>
              </div>

              {/* PRAWE 5 MIKRO-CHIPÓW CAD (VIDEO & GENERATIVE) - WIĘKSZE (50x50) */}
              {RIGHT_SCHEMATIC_NODES.map((node) => {
                const isHovered = hoveredNode === node.id

                return (
                  <div
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-xl flex items-center justify-center select-none transition-all duration-300 z-20 group cursor-default",
                      "border bg-card/90 dark:bg-[#0a0d13]/90 backdrop-blur-md",
                      isHovered
                        ? "border-primary/80 scale-115 shadow-[0_0_20px_rgba(56,189,248,0.45)]"
                        : "border-foreground/[0.12] hover:border-primary/50 shadow-md"
                    )}
                    style={{ left: node.x, top: node.y }}
                    title={`${node.name} — ${node.sub}`}
                  >
                    <span className="absolute top-1 left-1 text-[5px] font-mono text-primary/40 leading-none">┌</span>
                    <span className="absolute top-1 right-1 text-[5px] font-mono text-primary/40 leading-none">┐</span>
                    <span className="absolute bottom-1 left-1 text-[5px] font-mono text-primary/40 leading-none">└</span>
                    <span className="absolute bottom-1 right-1 text-[5px] font-mono text-primary/40 leading-none">┘</span>

                    <node.icon
                      className={cn(
                        "h-6 w-6 transition-all duration-300",
                        isHovered ? "text-primary scale-110 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" : "text-foreground/75 group-hover:text-primary"
                      )}
                    />
                  </div>
                )
              })}

            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   3. MODUŁ 01: CHAT AI (PRECISE SCROLL-EXPANDED ISOMETRIC AI CHIP STACK)
   Wszystkie ikony na wszystkich 5 waflach są osadzone w rzucie izometrycznym 3D.
   Rozsuwanie rozpoczyna się dokładnie od momentu pokazanego na zrzucie ekranu.
   ═══════════════════════════════════════════════════════════════════════ */
function Module01ChatAiZigzagSection({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Mierzymy pozycję samej ramki grafiki (stały aspect-ratio), a nie całej sekcji —
  // sekcje mają różną wysokość zależnie od ilości tekstu, co przesuwałoby trigger.
  const stageRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Reaktywny nasłuch scrolla z triggerem idealnie w miejscu ze zrzutu ekranu
  useEffect(() => {
    const el = stageRef.current ?? containerRef.current
    if (!el) return

    const updateProgress = () => {
      const rect = el.getBoundingClientRect()

      // TRIGGER ROZSUWANIA:
      // Rozpoczyna rozsuwanie gdy sekcja wchodzi na ekran (rect.top ≈ vh * 0.45)
      // Osiąga 100% (rozwinięcie na maksa) dokładnie w momencie, gdy grafika jest wycentrowana na ekranie.
      const vh = window.innerHeight || 800
      const startUnfold = vh * 0.45
      // Wycentrowanie liczymy w obszarze POD sticky navbarem, nie w całym oknie.
      const fullUnfold = (vh + getNavbarOffset()) / 2 - rect.height / 2

      const raw = (startUnfold - rect.top) / (startUnfold - fullUnfold)
      const clamped = Math.max(0, Math.min(1, raw))
      setScrollProgress(clamped)
    }

    let scrollParent: HTMLElement | null = el.parentElement
    while (scrollParent && scrollParent !== document.body) {
      const overflowY = window.getComputedStyle(scrollParent).overflowY
      if (overflowY === 'auto' || overflowY === 'scroll') {
        scrollParent.addEventListener('scroll', updateProgress, { passive: true })
        break
      }
      scrollParent = scrollParent.parentElement
    }

    window.addEventListener('scroll', updateProgress, { passive: true, capture: true })
    document.addEventListener('scroll', updateProgress, { passive: true, capture: true })

    updateProgress()

    let rafId: number
    const onFrame = () => {
      updateProgress()
      rafId = requestAnimationFrame(onFrame)
    }
    rafId = requestAnimationFrame(onFrame)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', updateProgress, { capture: true } as any)
      document.removeEventListener('scroll', updateProgress, { capture: true } as any)
      if (scrollParent) {
        scrollParent.removeEventListener('scroll', updateProgress)
      }
    }
  }, [])

  // Gdy scrollProgress = 0, separacja = 0 (płaski, idealnie złożony procesor bez przerw!)
  const sepY = scrollProgress * 86
  const sepX = scrollProgress * 28

  return (
    <div ref={containerRef} className="relative z-10 py-6 sm:py-24 overflow-visible">

      {/* 2-KOLUMNOWY UKŁAD NAPRZEMIENNY (CZYSTY, BEZ KAFELKÓW I BEZ CIĘŻKICH BLOKÓW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

        {/* LEWA STRONA: 3D DIAGONAL ISOMETRIC WAFER STACK + LINIE PROWADZĄCE (LEADER LINES).
            Na telefonie tekst ma iść PRZED grafiką (order-2), na desktopie grafika
            wraca na swoje miejsce po lewej (lg:order-1) — jak w pozostałych modułach. */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none order-2 lg:order-1">

          {/* Subtelna kwantowa poświata w tle */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.18)_0%,transparent_70%)] blur-3xl opacity-80"
          />

          {/* PERSPEKTYWICZNA SIATKA PODŁOŻA CAD */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-56 w-[560px] opacity-[0.14]"
            style={{
              backgroundImage:
                'linear-gradient(30deg, #38bdf8 1px, transparent 1px),' +
                'linear-gradient(150deg, #38bdf8 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              transform: 'translateX(-50%) rotateX(65deg) rotateZ(-35deg)',
            }}
          />

          {/* GŁÓWNY WIDOK IZOMETRYCZNY SVG ZE STOSEM WARSTW PROCESORA */}
          <div ref={stageRef} className="relative w-full max-w-[740px] aspect-[740/580] flex items-center justify-center">

            <svg
              viewBox="0 0 740 580"
              className="w-full h-full overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="chipTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a2332" stopOpacity="0.96" />
                  <stop offset="50%" stopColor="#0e141d" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#070a0f" stopOpacity="1" />
                </linearGradient>

                <linearGradient id="chipBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d131c" />
                  <stop offset="100%" stopColor="#040609" />
                </linearGradient>

                <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* ─────────────────────────────────────────────────────────────
                  PIONOWE PRZERYWANE LINIE PROJEKCYJNE (POJAWIAJĄ SIĘ PRZY ROZSUWANIU)
                  ───────────────────────────────────────────────────────────── */}
              {(() => {
                const topCx = 370 - 2 * sepX
                const topCy = 290 - 2 * sepY
                const botCx = 370 + 2 * sepX
                const botCy = 290 + 2 * sepY + 12

                return (
                  <g opacity={scrollProgress * 0.75} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3">
                    {/* Lewy narożnik */}
                    <line x1={topCx - 120} y1={topCy} x2={botCx - 120} y2={botCy} />
                    {/* Górny narożnik */}
                    <line x1={topCx} y1={topCy - 65} x2={botCx} y2={botCy - 65} />
                    {/* Prawy narożnik */}
                    <line x1={topCx + 120} y1={topCy} x2={botCx + 120} y2={botCy} />
                    {/* Dolny narożnik */}
                    <line x1={topCx} y1={topCy + 65} x2={botCx} y2={botCy + 65} />
                  </g>
                )
              })()}

              {/* ─────────────────────────────────────────────────────────────
                  5 IZOMETRYCZNYCH WARSTW PROCESORA (ROZSUWANYCH OD 0 DO PEŁNEGO ROZSTRZAŁU)
                  WSZYSTKIE IKONY OSADZONE W RZUCIE IZOMETRYCZNYM 3D: scale(1, 0.5416) rotate(-45)
                  ───────────────────────────────────────────────────────────── */}
              {[
                {
                  id: 'w4-base',
                  offsetMul: 2,
                  icon: (
                    /* 05 // PRYWATNOŚĆ I BEZPIECZEŃSTWO W CHMURZE - TARCZA 3D */
                    <g transform="scale(1, 0.5416) rotate(-45)">
                      <path
                        d="M 0 -24 L 22 -12 L 22 8 C 22 22, 0 28, 0 28 C 0 28, -22 22, -22 8 L -22 -12 Z"
                        fill="#080d16"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                      <circle cx="0" cy="-2" r="4.5" fill="#38bdf8" />
                      <rect x="-2.5" y="-2" width="5" height="10" rx="1.5" fill="#38bdf8" />
                    </g>
                  ),
                },
                {
                  id: 'w3-context',
                  offsetMul: 1,
                  icon: (
                    /* 04 // WSPÓLNY KONTEKST I PAMIĘĆ - RDZEŃ PAMIĘCI 3D */
                    <g transform="scale(1, 0.5416) rotate(-45)">
                      <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#080d16" stroke="#38bdf8" strokeWidth="2.5" />
                      <circle cx="-26" cy="-26" r="3" fill="#38bdf8" />
                      <circle cx="26" cy="-26" r="3" fill="#38bdf8" />
                      <circle cx="26" cy="26" r="3" fill="#38bdf8" />
                      <circle cx="-26" cy="26" r="3" fill="#38bdf8" />
                      <line x1="-18" y1="-18" x2="-24" y2="-24" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="18" y1="-18" x2="24" y2="-24" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="18" y1="18" x2="24" y2="24" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="-18" y1="18" x2="-24" y2="24" stroke="#38bdf8" strokeWidth="2" />
                      <text x="0" y="5" fill="#ffffff" fontSize="11" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">CTX</text>
                    </g>
                  ),
                },
                {
                  id: 'w2-reasoning',
                  offsetMul: 0,
                  icon: (
                    /* 03 // ROZUMOWANIE & PERSONY - SUWAKI I KONTROLA STYLU 3D */
                    <g transform="scale(1, 0.5416) rotate(-45)">
                      <rect x="-24" y="-20" width="48" height="40" rx="6" fill="#080d16" stroke="#38bdf8" strokeWidth="2.5" />
                      <line x1="-16" y1="-7" x2="16" y2="-7" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.4" />
                      <circle cx="5" cy="-7" r="4.5" fill="#38bdf8" />
                      <line x1="-16" y1="7" x2="16" y2="7" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.4" />
                      <circle cx="-6" cy="7" r="4.5" fill="#38bdf8" />
                      <circle cx="-16" cy="-7" r="1.5" fill="#38bdf8" />
                      <circle cx="16" cy="-7" r="1.5" fill="#38bdf8" />
                      <circle cx="-16" cy="7" r="1.5" fill="#38bdf8" />
                      <circle cx="16" cy="7" r="1.5" fill="#38bdf8" />
                    </g>
                  ),
                },
                {
                  id: 'w1-docs',
                  offsetMul: -1,
                  icon: (
                    /* 02 // MULTIMODAL & DOKUMENTY - ARKUSZ 3D */
                    <g transform="scale(1, 0.5416) rotate(-45)">
                      <rect x="-18" y="-24" width="36" height="48" rx="5" fill="#080d16" stroke="#38bdf8" strokeWidth="2.5" />
                      <path d="M 6 -24 L 18 -12 L 6 -12 Z" fill="#38bdf8" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1="-11" y1="-14" x2="1" y2="-14" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="-11" y1="-4" x2="11" y2="-4" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="-11" y1="6" x2="11" y2="6" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="-11" y1="16" x2="5" y2="16" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
                    </g>
                  ),
                },
                {
                  id: 'w0-ai-chip',
                  offsetMul: -2,
                  isTopAiChip: true,
                  icon: (
                    /* 01 // PROCESOR AI 3D (CHIP + 12 ŚCIEŻEK + NAPIS AI) */
                    <g transform="scale(1, 0.5416) rotate(-45)">
                      {/* Poświata procesora */}
                      <rect
                        x="-36"
                        y="-36"
                        width="72"
                        height="72"
                        rx="14"
                        fill="#38bdf8"
                        fillOpacity="0.25"
                        filter="url(#laserGlow)"
                      />

                      {/* ──────────────── 12 ŚCIEŻEK KRZEMOWYCH Z TERMINALAMI ──────────────── */}
                      {/* GÓRNE 3 ŚCIEŻKI */}
                      <line x1="0" y1="-28" x2="0" y2="-44" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="0" cy="-46" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      <path d="M -16 -28 L -16 -36 L -28 -36 L -28 -44" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="-28" cy="-46" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      <path d="M 16 -28 L 16 -36 L 28 -36 L 28 -44" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="28" cy="-46" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      {/* DOLNE 3 ŚCIEŻKI */}
                      <line x1="0" y1="28" x2="0" y2="44" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="0" cy="46" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      <path d="M -16 28 L -16 36 L -28 36 L -28 44" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="-28" cy="46" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      <path d="M 16 28 L 16 36 L 28 36 L 28 44" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="28" cy="46" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      {/* LEWE 3 ŚCIEŻKI */}
                      <line x1="-28" y1="0" x2="-44" y2="0" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="-46" cy="0" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      <path d="M -28 -16 L -36 -16 L -36 -28 L -44 -28" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="-46" cy="-28" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      <path d="M -28 16 L -36 16 L -36 28 L -44 28" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="-46" cy="28" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      {/* PRAWE 3 ŚCIEŻKI */}
                      <line x1="28" y1="0" x2="44" y2="0" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="46" cy="0" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      <path d="M 28 -16 L 36 -16 L 36 -28 L 44 -28" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="46" cy="-28" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      <path d="M 28 16 L 36 16 L 36 28 L 44 28" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="46" cy="28" r="4.5" fill="#080d16" stroke="#38bdf8" strokeWidth="3" />

                      {/* ──────────────── CENTRALNY KWADRAT CHIPA Z ZAOKRĄGLONYMI ROGAMI ──────────────── */}
                      <rect
                        x="-28"
                        y="-28"
                        width="56"
                        height="56"
                        rx="12"
                        fill="#080d16"
                        stroke="#38bdf8"
                        strokeWidth="3.2"
                      />

                      {/* Pogrubiony napis AI leżący idealnie w płaszczyźnie izometrycznej */}
                      <text
                        x="0"
                        y="9"
                        fill="#ffffff"
                        fontSize="24"
                        fontFamily="sans-serif"
                        fontWeight="900"
                        letterSpacing="1px"
                        textAnchor="middle"
                        className="select-none"
                      >
                        AI
                      </text>
                    </g>
                  ),
                },
              ].map((wafer) => {
                const cx = 370 + wafer.offsetMul * sepX
                const cy = 290 + wafer.offsetMul * sepY
                const isTop = wafer.isTopAiChip

                return (
                  <g key={wafer.id} className="transition-transform duration-75 ease-out">
                    {/* Krawędź boczna wafla (Bevel Extrusion) */}
                    <path
                      d={`M ${cx - 120} ${cy} L ${cx} ${cy + 65} L ${cx + 120} ${cy} L ${cx + 120} ${cy + 10} L ${cx} ${cy + 75} L ${cx - 120} ${cy + 10} Z`}
                      fill="url(#chipBevelGrad)"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />

                    {/* Górna powierzchnia izometryczna płytki krzemowej */}
                    <path
                      d={`M ${cx} ${cy - 65} L ${cx + 120} ${cy} L ${cx} ${cy + 65} L ${cx - 120} ${cy} Z`}
                      fill="url(#chipTopGrad)"
                      stroke={isTop ? "#38bdf8" : "hsl(var(--foreground))"}
                      strokeOpacity={isTop ? 0.95 : 0.25}
                      strokeWidth={isTop ? 2.2 : 1}
                      filter={isTop ? "url(#laserGlow)" : undefined}
                    />

                    {/* NITKI ELEKTRONICZNE (Silicon Bus Traces biegnące do krawędzi) */}
                    <path
                      d={`M ${cx - 90} ${cy} L ${cx - 45} ${cy - 25} L ${cx} ${cy - 52} L ${cx + 45} ${cy - 25} L ${cx + 90} ${cy}`}
                      fill="none"
                      stroke="#38bdf8"
                      strokeOpacity={isTop ? 0.45 : 0.15}
                      strokeWidth="1.2"
                    />
                    <path
                      d={`M ${cx - 90} ${cy} L ${cx - 45} ${cy + 25} L ${cx} ${cy + 52} L ${cx + 45} ${cy + 25} L ${cx + 90} ${cy}`}
                      fill="none"
                      stroke="#38bdf8"
                      strokeOpacity={isTop ? 0.45 : 0.15}
                      strokeWidth="1.2"
                    />

                    {/* Narożne punkty lutownicze */}
                    <circle cx={cx - 105} cy={cy} r="2.5" fill="#38bdf8" fillOpacity={isTop ? 0.9 : 0.4} />
                    <circle cx={cx + 105} cy={cy} r="2.5" fill="#38bdf8" fillOpacity={isTop ? 0.9 : 0.4} />
                    <circle cx={cx} cy={cy - 52} r="2.5" fill="#38bdf8" fillOpacity={isTop ? 0.9 : 0.4} />
                    <circle cx={cx} cy={cy + 52} r="2.5" fill="#38bdf8" fillOpacity={isTop ? 0.9 : 0.4} />

                    {/* Wizualizacja na środku wafla (osadzona w 3D) */}
                    <g transform={`translate(${cx}, ${cy})`}>
                      {wafer.icon}
                    </g>
                  </g>
                )
              })}

              {/* ─────────────────────────────────────────────────────────────
                  5 PRECYZYJNYCH LINII WSKAŹNIKOWYCH CAD (BEZPOŚREDNIO ZE ZNAKÓW TEKSTOWYCH)
                  ───────────────────────────────────────────────────────────── */}
              {/* 1. Lewa góra -> Modele AI (Wafer 0) */}
              <line
                x1="170"
                y1="42"
                x2={370 - 2 * sepX - 120}
                y2={290 - 2 * sepY}
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.12) * 1.5))}
              />
              <circle cx="170" cy="42" r="3" fill="#38bdf8" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.12) * 1.5))} />

              {/* 2. Prawa góra -> Multimodal & Pliki (Wafer 1) */}
              <line
                x1="570"
                y1="127"
                x2={370 - 1 * sepX + 120}
                y2={290 - 1 * sepY}
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.20) * 1.5))}
              />
              <circle cx="570" cy="127" r="3" fill="#38bdf8" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.20) * 1.5))} />

              {/* 3. Lewy środek -> Dopasowanie Czatu (Wafer 2) */}
              <line
                x1="170"
                y1="282"
                x2={370 - 120}
                y2={290}
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.28) * 1.5))}
              />
              <circle cx="170" cy="282" r="3" fill="#38bdf8" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.28) * 1.5))} />

              {/* 4. Prawa dół -> Wspólny Kontekst (Wafer 3) */}
              <line
                x1="570"
                y1="397"
                x2={370 + 1 * sepX + 120}
                y2={290 + 1 * sepY}
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.36) * 1.5))}
              />
              <circle cx="570" cy="397" r="3" fill="#38bdf8" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.36) * 1.5))} />

              {/* 5. Lewy dół -> Prywatność & RODO (Wafer 4) */}
              <line
                x1="170"
                y1="502"
                x2={370 + 2 * sepX - 120}
                y2={290 + 2 * sepY}
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.44) * 1.5))}
              />
              <circle cx="170" cy="502" r="3" fill="#38bdf8" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.44) * 1.5))} />
            </svg>

            {/* ─────────────────────────────────────────────────────────────
                5 CZYSTYCH ETYKIET CAD (BEZ ŻADNYCH KAFELKÓW, RAM I TŁA)
                ───────────────────────────────────────────────────────────── */}
            {/* 01. Lewa góra: Wiodące Modele AI */}
            <div
              className="absolute left-[10px] top-[24px] w-[155px] text-left hidden sm:block transition-all duration-300 pointer-events-none"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollProgress - 0.12) * 1.6)),
                transform: `translateX(${(1 - scrollProgress) * -12}px)`,
              }}
            >
              <p className="text-[12px] font-bold text-primary tracking-wide uppercase font-sans leading-none">// 01 MODELE AI</p>
              <p className="text-[12px] text-foreground/80 font-sans mt-1 leading-snug">
                Wiele modeli w jednym miejscu.
              </p>
            </div>

            {/* 02. Prawa góra: Multimodal & Pliki */}
            <div
              className="absolute right-[10px] top-[108px] w-[155px] text-right hidden sm:block transition-all duration-300 pointer-events-none"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollProgress - 0.20) * 1.6)),
                transform: `translateX(${(1 - scrollProgress) * 12}px)`,
              }}
            >
              <p className="text-[12px] font-bold text-primary tracking-wide uppercase font-sans leading-none">// 02 MULTIMODAL</p>
              <p className="text-[12px] text-foreground/80 font-sans mt-1 leading-snug">
                Szybkie generowanie i analiza plików.
              </p>
            </div>

            {/* 03. Lewy środek: Wybór Rozumowania & Styl */}
            <div
              className="absolute left-[10px] top-[264px] w-[155px] text-left hidden sm:block transition-all duration-300 pointer-events-none"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollProgress - 0.28) * 1.6)),
                transform: `translateX(${(1 - scrollProgress) * -12}px)`,
              }}
            >
              <p className="text-[12px] font-bold text-primary tracking-wide uppercase font-sans leading-none">// 03 DOPASOWANIE CZATU</p>
              <p className="text-[12px] text-foreground/80 font-sans mt-1 leading-snug">
                Dostosowanie stylu i tonu do Twoich potrzeb.
              </p>
            </div>

            {/* 04. Prawa dół: Wspólny Kontekst */}
            <div
              className="absolute right-[10px] top-[378px] w-[155px] text-right hidden sm:block transition-all duration-300 pointer-events-none"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollProgress - 0.36) * 1.6)),
                transform: `translateX(${(1 - scrollProgress) * 12}px)`,
              }}
            >
              <p className="text-[12px] font-bold text-primary tracking-wide uppercase font-sans leading-none">// 04 WSPÓLNY KONTEKST</p>
              <p className="text-[12px] text-foreground/80 font-sans mt-1 leading-snug">
                AI pamięta kontekst pomimo zmiany modelu.
              </p>
            </div>

            {/* 05. Lewy dół: Bezpieczeństwo & RODO w UE */}
            <div
              className="absolute left-[10px] top-[484px] w-[155px] text-left hidden sm:block transition-all duration-300 pointer-events-none"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollProgress - 0.44) * 1.6)),
                transform: `translateX(${(1 - scrollProgress) * -12}px)`,
              }}
            >
              <p className="text-[12px] font-bold text-primary tracking-wide uppercase font-sans leading-none">// 05 PRYWATNOŚĆ & RODO</p>
              <p className="text-[12px] text-foreground/80 font-sans mt-1 leading-snug">
                Serwery w UE i pełna izolacja danych.
              </p>
            </div>

          </div>

        </div>

        {/* PRAWA STRONA: ULTRA-CZYSTA, MINIMALISTYCZNA TYPOGRAFIA (BEZ ZBĘDNEGO ROZPYCHANIA) */}
        <div className="lg:col-span-5 text-left space-y-5 order-1 lg:order-2">
          <div className="space-y-2">
            <SecRule label="01 // CHAT AI" />
            <h2 className="font-heading text-[clamp(28px,4vw,48px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
              Wszystkie modele <br className="hidden sm:block" />
              <span className="font-normal text-primary">Jeden czat</span>
            </h2>
            <p className="font-sans text-[15px] font-light leading-relaxed text-foreground/70">
              Rozmawiaj z GPT-5, Claude, Gemini i Grokiem w jednej rozmowie. Przełączaj silnik w trakcie pisania bez ponawiania promptów i utraty kontekstu.
            </p>
          </div>

          {/* 3 BŁYSKAWICZNIE CZYTELNE PUNKTY Z KROPKAMI CAD */}
          <div className="space-y-2.5 font-sans pt-1">
            {[
              'Generowanie do 165 t/s',
              'Zmieniasz model, kontekst zostaje',
              'Serwery w UE i pełne RODO',
              'Analiza plików PDF, Excel, kodu i zdjęć',
            ].map((bullet) => (
              <div key={bullet} className="flex items-center gap-2.5 text-[13.5px] text-foreground/80 font-light">
                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          {/* PRZYCISK CTA */}
          <div className="pt-2">
            <GlowButton size="lg" onClick={() => onNavigate('cennik')}>
              Zacznij rozmowę
            </GlowButton>
          </div>
        </div>

      </div>

    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SILNIK AKSONOMETRYCZNY 3D → SVG (rozstrzelony aparat)

   Model aparatu żyje w prawdziwej przestrzeni (x, y, z):
     +Z = oś optyczna (kierunek patrzenia obiektywu)
     +Y = góra aparatu
     +X = prawy bok korpusu
   Całą scenę rzutuje JEDNA stała macierz ortogonalna (aksonometria), dzięki
   czemu: okrąg zawsze staje się poprawną elipsą o identycznym nachyleniu,
   rozsuwanie idzie DOKŁADNIE po osi optycznej, a perspektywa nie może się
   „złamać", bo nie jest liczona osobno dla każdego elementu — jest wspólna.
   Kolejność rysowania wynika z realnej głębi (algorytm malarza).
   ═══════════════════════════════════════════════════════════════════════ */
type V3 = [number, number, number]
const D2R = Math.PI / 180

function rotX3(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a)
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]
}
function rotY3(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a)
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]
}

/* Ustawienie sceny: aparat zadarty o 24°, obserwator 52° w bok i 30° w górę.
   Efekt: widać front, prawy bok i górną płytę, a oś optyczna biegnie w lewo
   delikatnie pod górę — klasyczne ujęcie rysunku rozstrzelonego. */
const CAM = (() => {
  const t = (v: V3) => rotX3(rotY3(rotX3(v, -24 * D2R), -52 * D2R), 30 * D2R)
  const X = t([1, 0, 0]), Y = t([0, 1, 0]), Z = t([0, 0, 1])
  return {
    ux: X[0], uy: -X[1], ud: X[2],
    vx: Y[0], vy: -Y[1], vd: Y[2],
    wx: Z[0], wy: -Z[1], wd: Z[2],
  }
})()

/** SVD macierzy 2×2 → obraz okręgu jednostkowego jako elipsa (rx, ry, kąt). */
function circleToEllipse(a: number, b: number, c: number, d: number) {
  const E = (a + d) / 2, F = (a - d) / 2, G = (b + c) / 2, H = (b - c) / 2
  const q = Math.hypot(E, H), r = Math.hypot(F, G)
  return { rx: q + r, ry: Math.abs(q - r), rot: ((Math.atan2(H, E) + Math.atan2(G, F)) / 2) / D2R }
}
/** Okrąg prostopadły do osi optycznej (soczewki, pierścienie tubusu). */
const RING = circleToEllipse(CAM.ux, CAM.uy, CAM.vx, CAM.vy)
/** Okrąg poziomy (pokrętła na górnej płycie). */
const DIAL = circleToEllipse(CAM.ux, CAM.uy, CAM.wx, CAM.wy)

/** Styczna sylwetka walca — liczona analitycznie, więc pas boczny tubusu
    zawsze idealnie schodzi się z czaszami elips (zero „załamań"). */
function silhouette(ax: number, ay: number, bx: number, by: number, dx: number, dy: number) {
  const det = ax * by - bx * ay
  const n0 = (by * dx - bx * dy) / det
  const n1 = (-ay * dx + ax * dy) / det
  const L = Math.hypot(n0, n1)
  return { x: (ax * n1 - bx * n0) / L, y: (ay * n1 - by * n0) / L }
}
const SIL_Z = silhouette(CAM.ux, CAM.uy, CAM.vx, CAM.vy, CAM.wx, CAM.wy)
const SIL_Y = silhouette(CAM.ux, CAM.uy, CAM.wx, CAM.wy, CAM.vx, CAM.vy)

/* ── GEOMETRIA APARATU (jednostki modelu ≈ 0,5 mm) ──────────────────── */
const BODY = { x: 92, y0: -58, y1: 46, z: 34 }
const PLATE = { y0: 46, y1: 64 }
const PRISM = { x0: -36, x1: 16, y0: 64, y1: 92, z0: -18, z1: 24 }
const DOOR = { x: 86, y: 46, z0: -46, z1: -34 }
const SENS = { x: 46, y: 28, z0: -30, z1: -24 }

/* Sekcje tubusu — przy p=0 tworzą jeden ciągły obiektyw, przy p=1 rozjeżdżają
   się równomiernie, zostawiając luki dokładnie na grupy optyczne. */
const TUBES = [
  { id: 'T1', z0: 34, z1: 52, r: 44, off: 10 },
  { id: 'T2', z0: 52, z1: 82, r: 42, off: 78 },
  { id: 'T3', z0: 82, z1: 122, r: 46, off: 144 },
  { id: 'T4', z0: 122, z1: 156, r: 50, off: 210 },
  { id: 'T5', z0: 156, z1: 176, r: 53, off: 276 },
]
const OPTICS = [
  { id: 'G1', z: 62, r: 30, off: 37 },
  { id: 'G2', z: 96, r: 36, off: 101 },
  { id: 'G3', z: 132, r: 41, off: 170 },
  { id: 'G4', z: 166, r: 47, off: 236 },
]

/* ═══════════════════════════════════════════════════════════════════════
   4. MODUŁ 02: OBRAZY I WIDEO (ZDJĘCIA & WIDEO AI)
   Wizualizacja: APARAT W WIDOKU ROZSTRZELONYM, ROZKŁADANY SCROLLEM
   ═══════════════════════════════════════════════════════════════════════ */
function Module02VisualCreationZigzagSection({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Mierzymy pozycję samej ramki grafiki (stały aspect-ratio), a nie całej sekcji —
  // sekcje mają różną wysokość zależnie od ilości tekstu, co przesuwałoby trigger.
  const stageRef = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)

  useEffect(() => {
    const el = stageRef.current ?? containerRef.current
    if (!el) return

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setP(1)
      return
    }

    let rafId = 0
    let last = -1

    const read = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 800
      const start = vh * 0.82
      // Wycentrowanie liczymy w obszarze POD sticky navbarem, nie w całym oknie.
      const end = (vh + getNavbarOffset()) / 2 - rect.height / 2
      const t = Math.max(0, Math.min(1, (start - rect.top) / (start - end)))
      const eased = t * t * (3 - 2 * t)
      const q = Math.round(eased * 400) / 400
      if (q !== last) { last = q; setP(q) }
    }
    const loop = () => { read(); rafId = requestAnimationFrame(loop) }

    // rAF pracuje tylko gdy sekcja jest przy ekranie — zero pracy w tle.
    const io = new IntersectionObserver((entries) => {
      const inView = entries[0]?.isIntersecting ?? true
      if (inView && !rafId) rafId = requestAnimationFrame(loop)
      if (!inView && rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    }, { rootMargin: '260px 0px' })
    io.observe(el)

    read()
    rafId = requestAnimationFrame(loop)
    return () => { io.disconnect(); if (rafId) cancelAnimationFrame(rafId) }
  }, [])

  /* ── Kadr: STAŁA skala (aparat się nie kurczy — tylko rozsuwa). Przy p=0
        bryła stoi po prawej, przy p=1 jest wyśrodkowana, więc rozsuw wypełnia
        całą dostępną szerokość zamiast zjeżdżać poza kadr. ── */
  const S = 1.30
  const OX = 690 - p * 78
  const OY = 318

  const P3 = (x: number, y: number, z: number) => ({
    x: OX + (x * CAM.ux + y * CAM.vx + z * CAM.wx) * S,
    y: OY + (x * CAM.uy + y * CAM.vy + z * CAM.wy) * S,
  })
  const dep = (x: number, y: number, z: number) => x * CAM.ud + y * CAM.vd + z * CAM.wd
  const poly = (pts: V3[]) =>
    pts.map((q) => { const s = P3(q[0], q[1], q[2]); return `${s.x.toFixed(1)},${s.y.toFixed(1)}` }).join(' ')

  /** Układ lokalny leżący NA ścianie bryły — detale rysujemy w milimetrach
      modelu, a rzut sam nadaje im poprawne pochylenie. */
  const plane = (px: number, py: number, pz: number, right: V3, down: V3) => {
    const c = P3(px, py, pz)
    const rx = (right[0] * CAM.ux + right[1] * CAM.vx + right[2] * CAM.wx) * S
    const ry = (right[0] * CAM.uy + right[1] * CAM.vy + right[2] * CAM.wy) * S
    const dx = (down[0] * CAM.ux + down[1] * CAM.vx + down[2] * CAM.wx) * S
    const dy = (down[0] * CAM.uy + down[1] * CAM.vy + down[2] * CAM.wy) * S
    return `matrix(${rx.toFixed(4)} ${ry.toFixed(4)} ${dx.toFixed(4)} ${dy.toFixed(4)} ${c.x.toFixed(1)} ${c.y.toFixed(1)})`
  }
  const FRONT: [V3, V3] = [[1, 0, 0], [0, -1, 0]]
  const TOPF: [V3, V3] = [[1, 0, 0], [0, 0, -1]]
  const SIDE: [V3, V3] = [[0, 0, -1], [0, -1, 0]]

  /** Bryła — widoczne są dokładnie trzy ściany (+X bok, +Y góra, +Z front). */
  const Box = (
    x0: number, y0: number, z0: number, x1: number, y1: number, z1: number,
    fSide: string, fTop: string, fFront: string, stroke: string, sw = 1.2,
  ) => (
    <>
      <polygon points={poly([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]])} fill={fSide} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={poly([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]])} fill={fTop} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])} fill={fFront} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    </>
  )

  /** Ścieżka elipsy (sweep steruje kierunkiem obiegu → dziury w fillRule). */
  const ellPath = (cx: number, cy: number, rx: number, ry: number, rot: number) => {
    const a = rot * D2R, c = Math.cos(a), s = Math.sin(a)
    const x0 = cx + rx * c, y0 = cy + rx * s
    const x1 = cx - rx * c, y1 = cy - rx * s
    const R = `${rx.toFixed(1)} ${ry.toFixed(1)} ${rot.toFixed(1)}`
    return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R} 1 1 ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} 1 1 ${x0.toFixed(1)} ${y0.toFixed(1)} Z`
  }

  /** Okrąg prostopadły do osi optycznej. */
  const Ring = (z: number, r: number, props: Record<string, unknown>, key?: string) => {
    const c = P3(0, 0, z)
    return (
      <ellipse
        key={key} cx={0} cy={0} rx={r * RING.rx * S} ry={r * RING.ry * S}
        transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${RING.rot.toFixed(2)})`}
        {...props}
      />
    )
  }
  /** Pierścień (kołnierz) z REALNYM otworem — przez środek widać element za nim. */
  const Annulus = (z: number, rOut: number, rIn: number, props: Record<string, unknown>, key?: string) => {
    const c = P3(0, 0, z)
    const d = `${ellPath(c.x, c.y, rOut * RING.rx * S, rOut * RING.ry * S, RING.rot)} ${ellPath(c.x, c.y, rIn * RING.rx * S, rIn * RING.ry * S, RING.rot)}`
    return <path key={key} d={d} fillRule="evenodd" {...props} />
  }
  /** Okrąg poziomy na wysokości y. */
  const Disc = (x: number, y: number, z: number, r: number, props: Record<string, unknown>, key?: string) => {
    const c = P3(x, y, z)
    return (
      <ellipse
        key={key} cx={0} cy={0} rx={r * DIAL.rx * S} ry={r * DIAL.ry * S}
        transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${DIAL.rot.toFixed(2)})`}
        {...props}
      />
    )
  }
  /** Punkt na obwodzie okręgu prostopadłego do osi optycznej (+ widoczność). */
  const rim = (z: number, r: number, t: number) => {
    const c = P3(0, 0, z)
    return {
      x: c.x + (Math.cos(t) * CAM.ux + Math.sin(t) * CAM.vx) * r * S,
      y: c.y + (Math.cos(t) * CAM.uy + Math.sin(t) * CAM.vy) * r * S,
      n: Math.cos(t) * CAM.ud + Math.sin(t) * CAM.vd,
    }
  }

  /** DRĄŻONY tubus: pas boczny z wyciętym otworem + kołnierz-pierścień.
      Otwór jest prawdziwą dziurą w ścieżce, więc widać przez niego optykę
      stojącą za sekcją — dokładnie jak w prawdziwym korpusie obiektywu. */
  const Tube = (z0: number, z1: number, r: number, o: {
    band: string; cap: string; stroke?: string; sw?: number; bore?: number
  }) => {
    const a = P3(0, 0, z0), b = P3(0, 0, z1)
    const ox = SIL_Z.x * r * S, oy = SIL_Z.y * r * S
    const st = o.stroke ?? '#7d8ea6'
    const sw = o.sw ?? 1.3
    const bore = (o.bore ?? 0.60) * r
    const quad = `M ${(a.x + ox).toFixed(1)} ${(a.y + oy).toFixed(1)} L ${(b.x + ox).toFixed(1)} ${(b.y + oy).toFixed(1)} L ${(b.x - ox).toFixed(1)} ${(b.y - oy).toFixed(1)} L ${(a.x - ox).toFixed(1)} ${(a.y - oy).toFixed(1)} Z`
    const hole = ellPath(b.x, b.y, bore * RING.rx * S, bore * RING.ry * S, RING.rot)
    return (
      <>
        {Annulus(z0, r, bore, { fill: o.band })}
        <path d={`${quad} ${hole}`} fill={o.band} fillRule="evenodd" />
        <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke={st} strokeWidth={sw} />
        <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} stroke={st} strokeWidth={sw} />
        {/* ścianka wewnętrzna widoczna w głębi otworu */}
        {Ring(z0, bore, { fill: 'none', stroke: '#243244', strokeWidth: 1.6, strokeOpacity: 0.8 })}
        {Annulus(z1, r, bore, { fill: o.cap, stroke: st, strokeWidth: sw })}
      </>
    )
  }

  /** Walec pionowy (pokrętła na płycie). */
  const VTube = (x: number, z: number, y0: number, y1: number, r: number, band: string, cap: string, st = '#9fb0c6', sw = 1.1) => {
    const a = P3(x, y0, z), b = P3(x, y1, z)
    const ox = SIL_Y.x * r * S, oy = SIL_Y.y * r * S
    return (
      <>
        <polygon
          points={`${(a.x + ox).toFixed(1)},${(a.y + oy).toFixed(1)} ${(b.x + ox).toFixed(1)},${(b.y + oy).toFixed(1)} ${(b.x - ox).toFixed(1)},${(b.y - oy).toFixed(1)} ${(a.x - ox).toFixed(1)},${(a.y - oy).toFixed(1)}`}
          fill={band} stroke={st} strokeWidth={sw * 0.8}
        />
        {Disc(x, y1, z, r, { fill: cap, stroke: st, strokeWidth: sw })}
      </>
    )
  }

  /** Radełkowanie — żłobki tylko po widocznej połowie walca, z jasnością
      rosnącą ku krawędzi sylwetki, jak na realnym toczonym metalu. */
  const Knurl = (z0: number, z1: number, r: number, n: number, color = '#94a3b8') => {
    const out = []
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2
      const a = rim(z0, r, t)
      if (a.n <= 0.04) continue
      const b = rim(z1, r, t)
      out.push(<line key={`k${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={0.85} opacity={0.1 + a.n * 0.42} />)
    }
    return out
  }

  /** Grupa optyczna — PRZEZROCZYSTE szkło: przez każdą soczewkę widać
      element stojący za nią, tak jak w realnym układzie optycznym. */
  const Optic = (z: number, r: number, th: number, fill: string, o: number) => {
    const zb = z - th / 2, zf = z + th / 2
    const a = P3(0, 0, zb), b = P3(0, 0, zf)
    const ox = SIL_Z.x * r * S, oy = SIL_Z.y * r * S
    const hi = rim(zf, r * 0.58, 2.5)
    return (
      <g opacity={o}>
        {Ring(zb, r, { fill: 'none', stroke: '#7dd3fc', strokeWidth: 1, strokeOpacity: 0.32 })}
        <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke="#9ad9fb" strokeWidth={1.2} strokeOpacity={0.55} />
        <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} stroke="#9ad9fb" strokeWidth={1.2} strokeOpacity={0.55} />
        {Ring(zf, r, { fill, fillOpacity: 0.34, stroke: '#9ad9fb', strokeWidth: 1.5 })}
        {Ring(zf, r * 0.84, { fill: 'none', stroke: '#e0f2fe', strokeWidth: 0.8, strokeOpacity: 0.3 })}
        <ellipse
          cx={0} cy={0} rx={r * RING.rx * S * 0.30} ry={r * RING.ry * S * 0.11}
          transform={`translate(${hi.x.toFixed(1)} ${hi.y.toFixed(1)}) rotate(${(RING.rot + 24).toFixed(1)})`}
          fill="#ffffff" opacity={0.4}
        />
      </g>
    )
  }

  /** Przysłona irysowa: 9 listków — nonagonalny otwór, przez który też widać
      to, co stoi za nią. Otwór przymyka się przy p=0, otwiera przy rozłożeniu. */
  const Iris = (z: number, r: number, o: number) => {
    const n = 9
    const rin = r * (0.26 + p * 0.28)
    const hole: string[] = []
    const edges = []
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2 + 0.35
      const a = rim(z, rin, t)
      hole.push(`${a.x.toFixed(1)},${a.y.toFixed(1)}`)
      const b = rim(z, r * 0.93, t + Math.PI / n)
      edges.push(<line key={`ib${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#38bdf8" strokeWidth={0.9} opacity={0.45} />)
    }
    return (
      <g opacity={o}>
        {Tube(z - 5, z + 5, r, { band: 'url(#nbBarrel)', cap: '#0c1626', stroke: '#8ba0b8', sw: 1.3, bore: 0.93 })}
        {edges}
        <polygon points={hole.join(' ')} fill="#020a14" fillOpacity={0.55} stroke="#7dd3fc" strokeWidth={1.3} />
      </g>
    )
  }

  /* ── Przesunięcia podzespołów (offset × postęp scrolla) ────────────── */
  const yPlate = p * 44     // górna płyta z pokrętłami — w górę
  const yPrism = p * 62     // pryzmat / wizjer — najwyżej
  const xPrism = -p * 86    // …i mocno w bok, żeby zwolnić prawy górny róg na opis
  const zDoor = -p * 66     // klapka tylna — do tyłu
  const xSens = -p * 34     // matryca 4K — w bok, dalej od rogu z opisem…
  const zSens = -p * 30     // …do tyłu…
  const ySens = -p * 150    // …i w dół, żeby wyszła zza korpusu
  const fade = (from: number, span = 0.2) => Math.max(0, Math.min(1, (p - from) / span))
  const glassOn = fade(0.04, 0.18)

  /* Kreskowany ślad montażowy — krótki, tylko przy podzespołach korpusu. */
  const Trail = (a: { x: number; y: number }, b: { x: number; y: number }, o: number) => (
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#38bdf8" strokeWidth={0.9} strokeDasharray="3 6" opacity={o * 0.35} />
  )

  /* Stos optyki sortowany realną głębią — kolejność zawsze fizycznie poprawna. */
  const stack: { d: number; node: ReactNode }[] = [
    ...TUBES.map((t) => {
      const z0 = t.z0 + t.off * p, z1 = t.z1 + t.off * p
      const zc = (z0 + z1) / 2
      let inner: ReactNode = null

      if (t.id === 'T1') {
        inner = (
          <>
            {[0.35, 2.45, 4.55].map((a, i) => {
              const q = rim(z1, t.r * 0.94, a), w = rim(z1, t.r * 0.78, a)
              return <line key={`by${i}`} x1={q.x} y1={q.y} x2={w.x} y2={w.y} stroke="#cbd5e1" strokeWidth={2.6} opacity={0.6} />
            })}
          </>
        )
      } else if (t.id === 'T2') {
        inner = (
          <>
            {Knurl(z0 + 3, z1 - 3, t.r, 46, '#64748b')}
          </>
        )
      } else if (t.id === 'T3') {
        inner = (
          <>
            {Knurl(z0 + 4, z1 - 4, t.r, 64, '#94a3b8')}
            {Ring(z1 - 4, t.r * 1.01, { fill: 'none', stroke: '#cbd5e1', strokeWidth: 1, strokeOpacity: 0.4 })}
          </>
        )
      } else if (t.id === 'T4') {
        inner = (
          <>
            {Knurl(z0 + 3, z1 - 3, t.r, 54, '#94a3b8')}
          </>
        )
      } else {
        inner = (
          <>
            {Ring(z1, t.r * 0.90, { fill: 'none', stroke: '#cbd5e1', strokeWidth: 2.4, strokeOpacity: 0.55 })}
          </>
        )
      }

      return {
        d: dep(0, 0, zc),
        node: (
          <g key={t.id}>
            {Tube(z0, z1, t.r, {
              band: t.id === 'T5' ? 'url(#nbBezel)' : 'url(#nbBarrel)',
              cap: 'url(#nbCap)', stroke: '#8ba0b8', sw: 1.4,
              bore: t.id === 'T1' ? 0.68 : 0.60,
            })}
            {inner}
          </g>
        ),
      }
    }),
    ...OPTICS.map((g) => {
      const z = g.z + g.off * p
      return {
        d: dep(0, 0, z),
        node: (
          <g key={g.id}>
            {g.id === 'G2'
              ? Iris(z, g.r, glassOn)
              : Optic(z, g.r, g.id === 'G4' ? 16 : 11, g.id === 'G4' ? 'url(#nbGlassF)' : 'url(#nbGlassR)', glassOn)}
          </g>
        ),
      }
    }),
  ].sort((a, b) => a.d - b.d)

  /* ── Punkty zaczepienia opisów: 4 symetryczne, bezkolizyjne cele
        (przednia soczewka, tubus optyczny, korpus na górze, matryca na dole).
        Silniki obrazu i wideo trzymamy w JEDNEJ etykiecie — rozbicie ich na dwie
        mówiło dwa razy to samo. ── */
  const tOptic = rim(OPTICS[3].z + OPTICS[3].off * p, OPTICS[3].r * 0.98, -1.35)
  const tFocus = rim((TUBES[2].z0 + TUBES[2].z1) / 2 + TUBES[2].off * p, TUBES[2].r * 0.98, 1.75)
  const tPrism = P3(PRISM.x0 + xPrism + 6, PRISM.y0 + yPrism + 6, PRISM.z1)
  const tSens = P3(SENS.x + xSens + 4, -SENS.y + ySens + 6, SENS.z1 + zSens)

  const LABELS = [
    { k: 'l1', num: '01', head: 'HIPERREALIZM', sub: 'Hiperrealistycznie generowane zdjęcia.', side: 'l', cls: 'left-[2%] top-[3%]', ax: 222, ay: 58, to: tOptic, at: 0.24 },
    { k: 'l2', num: '02', head: 'WIDEO Z KADRU', sub: 'Zdjęcie zamienia się w gotowy klip.', side: 'l', cls: 'left-[2%] top-[77%]', ax: 222, ay: 490, to: tFocus, at: 0.40 },
    { k: 'l3', num: '03', head: 'NAJLEPSZE SILNIKI', sub: 'Kling, PixVerse, Seedance — w jednym miejscu.', side: 'r', cls: 'right-[1.5%] top-[3%]', ax: 678, ay: 58, to: tPrism, at: 0.30 },
    { k: 'l4', num: '04', head: 'TWOJE POSTACIE', sub: 'Ta sama twarz hiperrealistycznie w każdym ujęciu.', side: 'r', cls: 'right-[1.5%] top-[77%]', ax: 678, ay: 500, to: tSens, at: 0.62 },
  ]

  return (
    <div ref={containerRef} className="relative z-10 py-8 sm:py-12 overflow-visible">

      {/* 2-KOLUMNOWY UKŁAD ZIGZAG: TEKST PO LEWEJ, ROZKŁADANY APARAT PO PRAWEJ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* LEWA STRONA: TYPOGRAFIA, PUNKTY I CTA */}
        <div className="lg:col-span-5 text-left space-y-5">
          <div className="space-y-2">
            <SecRule label="02 // ZDJĘCIA I WIDEO AI" />
            <h2 className="font-heading text-[clamp(28px,4vw,48px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
              Najlepsze zdjęcia <br className="hidden sm:block" />
              <span className="font-normal text-primary">i wideo AI.</span>
            </h2>
            <p className="font-sans text-[15px] font-light leading-relaxed text-foreground/70">
              Najlepsze modele generatywnego AI, twórz hiperrealistyczne grafiki i wideo.
            </p>
          </div>

          <div className="space-y-2.5 font-sans pt-1">
            {[
              'Grafiki i wideo w jakości 4K bez limitów',
              'Wszystkie topowe modele w jednym miejscu',
              'Postacie pozwalające na fotorealistyczne oddanie osób na zdjęciu',
              'Zaawansowane generowanie wideo AI',
            ].map((bullet) => (
              <div key={bullet} className="flex items-center gap-2.5 text-[13.5px] text-foreground/80 font-light">
                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <GlowButton size="lg" onClick={() => onNavigate('cennik')}>
              Wypróbuj studio AI
            </GlowButton>
          </div>
        </div>

        {/* PRAWA STRONA: ROZSTRZELONY APARAT — AKSONOMETRIA 3D → SVG */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none">

          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.13)_0%,transparent_70%)] blur-3xl"
            style={{ opacity: 0.5 + p * 0.4 }}
          />

          <div ref={stageRef} className="relative w-full max-w-[900px] aspect-[900/620]">
            <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nbSkinF" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#18222f" /><stop offset="55%" stopColor="#0b111c" /><stop offset="100%" stopColor="#05080e" />
                </linearGradient>
                <linearGradient id="nbSkinS" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0d1522" /><stop offset="100%" stopColor="#03060b" />
                </linearGradient>
                <linearGradient id="nbSkinT" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1d2734" /><stop offset="100%" stopColor="#090e16" />
                </linearGradient>
                <linearGradient id="nbMagT" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dbe3ec" /><stop offset="42%" stopColor="#8b99aa" /><stop offset="100%" stopColor="#3d4959" />
                </linearGradient>
                <linearGradient id="nbMagF" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a1aebe" /><stop offset="58%" stopColor="#4e5a6b" /><stop offset="100%" stopColor="#252f3d" />
                </linearGradient>
                <linearGradient id="nbMagS" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#68768a" /><stop offset="100%" stopColor="#1b2430" />
                </linearGradient>
                {/* Anodowany tubus — pas boczny walca oświetlony od góry */}
                <linearGradient id="nbBarrel" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#48586f" /><stop offset="15%" stopColor="#95a7bd" />
                  <stop offset="35%" stopColor="#1f2937" /><stop offset="72%" stopColor="#06090f" />
                  <stop offset="92%" stopColor="#18212e" /><stop offset="100%" stopColor="#36445a" />
                </linearGradient>
                <linearGradient id="nbBezel" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#54637a" /><stop offset="16%" stopColor="#aebcce" />
                  <stop offset="38%" stopColor="#1c2532" /><stop offset="74%" stopColor="#05080d" />
                  <stop offset="94%" stopColor="#1d2632" /><stop offset="100%" stopColor="#41505f" />
                </linearGradient>
                <linearGradient id="nbCap" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2b3646" /><stop offset="55%" stopColor="#0d1522" /><stop offset="100%" stopColor="#050a13" />
                </linearGradient>
                <radialGradient id="nbGlassR" cx="34%" cy="26%" r="80%">
                  <stop offset="0%" stopColor="#cdeafd" /><stop offset="45%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#082c46" />
                </radialGradient>
                <radialGradient id="nbGlassF" cx="32%" cy="24%" r="82%">
                  <stop offset="0%" stopColor="#e0f2fe" /><stop offset="34%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#062032" />
                </radialGradient>
                <linearGradient id="nbSensor" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1d4ed8" /><stop offset="48%" stopColor="#0b2036" /><stop offset="100%" stopColor="#334155" />
                </linearGradient>
                <radialGradient id="nbFloor" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#020617" stopOpacity="0.8" /><stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* ── CIEŃ KONTAKTOWY ── */}
              {Disc(0, -86, 16, 128, { fill: 'url(#nbFloor)', opacity: 0.85 })}

              {/* ── 1. KLAPKA TYLNA (odjeżdża do tyłu) ── */}
              <g>
                {Trail(P3(0, 0, DOOR.z1), P3(0, 0, DOOR.z0 + zDoor), fade(0.08))}
                {Box(-DOOR.x, -DOOR.y, DOOR.z0 + zDoor, DOOR.x, DOOR.y, DOOR.z1 + zDoor,
                  'url(#nbSkinS)', 'url(#nbSkinT)', 'url(#nbSkinF)', '#3f5064', 1.2)}
                <g transform={plane(0, 0, DOOR.z1 + zDoor, ...FRONT)}>
                  <rect x={-74} y={-34} width={148} height={68} rx={4} fill="#070d17" stroke="#1e293b" strokeWidth={0.8} />
                  <rect x={-58} y={-22} width={116} height={44} rx={3} fill="none" stroke="#38bdf8" strokeWidth={0.5} strokeOpacity={0.28} strokeDasharray="3 3" />
                </g>
              </g>

              {/* ── 2. PŁYTKA MATRYCY 4K CMOS (do tyłu i w dół) — rysowana przed
                     korpusem, więc przy złożeniu jest poprawnie w nim schowana ── */}
              <g opacity={0.3 + fade(0.05, 0.2) * 0.7}>
                {Trail(P3(0, 0, SENS.z1), P3(xSens, ySens, SENS.z0 + zSens), fade(0.06))}
                {Box(-SENS.x + xSens, -SENS.y + ySens, SENS.z0 + zSens, SENS.x + xSens, SENS.y + ySens, SENS.z1 + zSens,
                  '#0b1a2b', '#14324d', 'url(#nbSensor)', '#7dd3fc', 1.2)}
                <g transform={plane(xSens, ySens, SENS.z1 + zSens, ...FRONT)}>
                  <rect x={-32} y={-18} width={64} height={36} fill="#05101c" stroke="#9ad9fb" strokeWidth={0.9} />
                  {[-12, -4, 4, 12].map((yy) => <line key={yy} x1={-30} y1={yy} x2={30} y2={yy} stroke="#38bdf8" strokeWidth={0.4} strokeOpacity={0.35} />)}
                  {[-24, -12, 0, 12, 24].map((xx) => <line key={xx} x1={xx} y1={-16} x2={xx} y2={16} stroke="#38bdf8" strokeWidth={0.4} strokeOpacity={0.35} />)}
                  <text x={0} y={3.5} fill="#ffffff" fontSize={12} fontFamily="sans-serif" fontWeight="900" textAnchor="middle">4K</text>
                  {[-40, 40].map((xx) => <rect key={xx} x={xx - 1.5} y={-14} width={3} height={28} fill="#94a3b8" opacity={0.6} />)}
                </g>
              </g>
              {/* ── 3. KORPUS (skórzana obudowa) ── */}
              <g>
                {Box(-BODY.x, BODY.y0, -BODY.z, BODY.x, BODY.y1, BODY.z,
                  'url(#nbSkinS)', 'url(#nbSkinT)', 'url(#nbSkinF)', '#42536a', 1.5)}

                <g transform={plane(0, -6, BODY.z, ...FRONT)}>
                  <rect x={-88} y={-46} width={176} height={92} rx={5} fill="#060b14" stroke="#1b2532" strokeWidth={0.7} />
                  {Array.from({ length: 12 }, (_, i) => (
                    <line key={`vt${i}`} x1={-82 + i * 15} y1={-42} x2={-82 + i * 15} y2={42} stroke="#5b7796" strokeWidth={0.3} strokeOpacity={0.13} />
                  ))}
                  <g transform="translate(-66 12)">
                    <circle r={11} fill="#0c1421" stroke="#8798ad" strokeWidth={0.9} />
                    <path d="M 0 0 L 8 -7" stroke="#cbd5e1" strokeWidth={2.4} strokeLinecap="round" />
                  </g>
                  <circle cx={64} cy={0} r={6} fill="#121d2c" stroke="#8798ad" strokeWidth={0.9} />
                </g>

                <g transform={plane(BODY.x, -6, 0, ...SIDE)}>
                  <rect x={-28} y={-44} width={56} height={88} rx={4} fill="#05080f" stroke="#1b2532" strokeWidth={0.7} />
                  {Array.from({ length: 10 }, (_, i) => (
                    <line key={i} x1={-24} y1={-36 + i * 8} x2={24} y2={-36 + i * 8} stroke="#5b7796" strokeWidth={0.6} strokeOpacity={0.18} />
                  ))}
                </g>
              </g>

              {/* ── 4. GÓRNA PŁYTA MAGNEZOWA Z POKRĘTŁAMI (unosi się) ── */}
              <g>
                {Trail(P3(0, PLATE.y0, 0), P3(0, PLATE.y1 + yPlate, 0), fade(0.08))}
                {Box(-BODY.x, PLATE.y0 + yPlate, -BODY.z, BODY.x, PLATE.y1 + yPlate, BODY.z,
                  'url(#nbMagS)', 'url(#nbMagT)', 'url(#nbMagF)', '#c3d0e0', 1.3)}

                <g transform={plane(0, PLATE.y0 + yPlate + 9, BODY.z, ...FRONT)}>
                  <rect x={-74} y={-6} width={26} height={12} rx={2} fill="#08131d" stroke="#b9c7d8" strokeWidth={0.8} />
                  <rect x={30} y={-6} width={20} height={12} rx={2} fill="#08131d" stroke="#b9c7d8" strokeWidth={0.8} />
                  <circle cx={-61} cy={0} r={3.4} fill="#7dd3fc" opacity={0.42} />
                </g>

                {VTube(48, -2, PLATE.y1 + yPlate, PLATE.y1 + yPlate + 11, 19, '#3a465a', 'url(#nbMagT)', '#dbe3ec', 1.2)}
                {Array.from({ length: 18 }, (_, i) => {
                  const t = (i / 18) * Math.PI * 2
                  const c0 = P3(48 + Math.cos(t) * 15, PLATE.y1 + yPlate + 11, -2 + Math.sin(t) * 15)
                  const c1 = P3(48 + Math.cos(t) * 18.6, PLATE.y1 + yPlate + 11, -2 + Math.sin(t) * 18.6)
                  return <line key={`sd${i}`} x1={c0.x} y1={c0.y} x2={c1.x} y2={c1.y} stroke="#46536a" strokeWidth={1} opacity={0.75} />
                })}

                {VTube(-58, -4, PLATE.y1 + yPlate, PLATE.y1 + yPlate + 9, 15, '#3a465a', 'url(#nbMagT)', '#dbe3ec', 1.1)}

                {VTube(22, 8, PLATE.y1 + yPlate, PLATE.y1 + yPlate + 6, 7.5, '#4a5768', '#c3d0e0', '#dbe3ec', 1)}

                {Box(-14, PLATE.y1 + yPlate, -14, 12, PLATE.y1 + yPlate + 6, 4,
                  '#131e2c', '#212d3c', '#0c1621', '#8798ad', 0.9)}

                <g transform={plane(0, PLATE.y1 + yPlate + 0.4, 0, ...TOPF)}>
                  <path d="M 66 16 L 88 20 L 92 12 L 70 8 Z" fill="#8b99aa" stroke="#dbe3ec" strokeWidth={0.6} />
                </g>
              </g>

              {/* ── 4. PRYZMAT / WIZJER (unosi się) ── */}
              <g opacity={0.45 + fade(0.04, 0.2) * 0.55}>
                {Trail(P3(-10, PRISM.y0, 4), P3(-10 + xPrism, PRISM.y0 + yPrism, 4), fade(0.06))}
                {Box(PRISM.x0 + xPrism, PRISM.y0 + yPrism, PRISM.z0, PRISM.x1 + xPrism, PRISM.y1 + yPrism, PRISM.z1,
                  'url(#nbMagS)', 'url(#nbMagT)', 'url(#nbMagF)', '#c3d0e0', 1.3)}
                <g transform={plane(-10 + xPrism, PRISM.y0 + yPrism + 14, PRISM.z1, ...FRONT)}>
                  <rect x={-17} y={-9} width={34} height={18} rx={2} fill="#06121c" stroke="#7dd3fc" strokeWidth={0.9} />
                  <path d="M -14 7 L 0 -6 L 14 7 Z" fill="#38bdf8" fillOpacity={0.3} stroke="#9ad9fb" strokeWidth={0.7} />
                </g>
                {Box(-24 + xPrism, PRISM.y0 + yPrism + 6, PRISM.z0 - 10, 4 + xPrism, PRISM.y1 + yPrism - 6, PRISM.z0,
                  '#0f1826', '#1d2836', '#0b1320', '#6d7c92', 0.9)}
              </g>


              {/* ── 6. UKŁAD OPTYCZNY — posortowany realną głębią ── */}
              {stack.map((s, i) => <g key={`st${i}`}>{s.node}</g>)}

              {/* ── 7. LINIE WSKAŹNIKOWE DO OPISÓW ── */}
              <g className="hidden sm:block">
                {LABELS.map((L) => {
                  const o = Math.max(0, Math.min(1, (p - L.at) / 0.18))
                  if (o <= 0.01) return null
                  return (
                    <g key={L.k} opacity={o}>
                      <line x1={L.ax} y1={L.ay} x2={L.to.x} y2={L.to.y} stroke="#38bdf8" strokeWidth={1.1} strokeDasharray="4 4" opacity={0.75} />
                      <circle cx={L.to.x} cy={L.to.y} r={3.2} fill="none" stroke="#38bdf8" strokeWidth={1.4} />
                      <circle cx={L.ax} cy={L.ay} r={2.6} fill="#38bdf8" />
                    </g>
                  )
                })}
              </g>
            </svg>

            {/* ── 8. OPISY (HTML — ta sama czytelność co w module czatu AI) ── */}
            {LABELS.map((L) => (
              <div
                key={L.k}
                className={`absolute w-[200px] hidden sm:block pointer-events-none transition-opacity duration-300 ${L.cls} ${L.side === 'r' ? 'text-right' : 'text-left'}`}
                style={{
                  opacity: Math.max(0, Math.min(1, (p - L.at) / 0.18)),
                  transform: `translateX(${(1 - p) * (L.side === 'r' ? 14 : -14)}px)`,
                }}
              >
                <p className="text-[12.5px] font-bold text-primary tracking-wide uppercase font-sans leading-none">
                  {`// ${L.num} ${L.head}`}
                </p>
                <p className="text-[12.5px] text-foreground/80 font-sans mt-1.5 leading-snug">{L.sub}</p>
              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  )
}
/* ═══════════════════════════════════════════════════════════════════════
   MODUŁ 03: ASYSTENT NEXTBYTE
   Wizualizacja: POPIERSIE Z WARSTWIC + KARTY NA SPIRALI KĄTA ZŁOTEGO

   Trzy decyzje, które trzymają to po stronie designu, a nie infografiki:
   • Popiersie to kilkanaście REALNYCH okręgów poziomych na różnych
     wysokościach — model warstwicowy, nie siatka i nie płaska sylwetka.
   • Karty rozkręcają się co 137,5° (kąt złoty). Podział nigdy się nie
     powtarza, więc oko nie łapie rytmu i nie czyta tego jako wykresu.
   • Jedno źródło światła na całą scenę: jasność każdej karty wynika
     z kąta jej normalnej do wektora światła, więc spirala czyta się
     jak bryła, a nie jak naklejone prostokąty.
   ═══════════════════════════════════════════════════════════════════════ */

/* Własne ustawienie sceny: obserwator 30° w bok i 20° nad poziomem.
   Łagodniej niż przy aparacie — popiersie ma być zwrócone do widza. */
const ASSIST_CAM = (() => {
  const t = (v: V3) => rotX3(rotY3(v, -30 * D2R), 20 * D2R)
  const X = t([1, 0, 0]), Y = t([0, 1, 0]), Z = t([0, 0, 1])
  return {
    ux: X[0], uy: -X[1], ud: X[2],
    vx: Y[0], vy: -Y[1], vd: Y[2],
    wx: Z[0], wy: -Z[1], wd: Z[2],
  }
})()

/** Kierunek światła sceny (przestrzeń modelu) — wspólny dla wszystkich płaszczyzn. */
const ASSIST_LIGHT = (() => {
  const v: V3 = [-0.38, 0.5, 0.78]
  const L = Math.hypot(v[0], v[1], v[2])
  return [v[0] / L, v[1] / L, v[2] / L] as V3
})()


/** Karty krążące wokół postaci. `at` to próg scrolla, przy którym karta
    wychodzi zza popiersia; `lab` oznacza te, które dostają opis CAD. */
const ASSIST_CARDS = [
  { id: 'c1', at: 0.00, ang: -38, rEnd: 112, yEnd: 22, glyph: 'note', lab: '01' },
  { id: 'c2', at: 0.13, ang: 138, rEnd: 120, yEnd: 60, glyph: 'cal', lab: '02' },
  { id: 'c3', at: 0.27, ang: 186, rEnd: 128, yEnd: 130, glyph: 'search', lab: '03' },
  { id: 'c4', at: 0.41, ang: 24, rEnd: 134, yEnd: 168, glyph: 'task', lab: '04' },
  { id: 'c5', at: 0.55, ang: 154, rEnd: 150, yEnd: 176, glyph: 'pen', lab: null },
  { id: 'c6', at: 0.69, ang: -102, rEnd: 138, yEnd: 186, glyph: 'dot', lab: null },
]

function AssistantOrbitVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setP(1); return }

    let rafId = 0
    let last = -1
    const read = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 800
      const start = vh * 0.82
      // Wycentrowanie liczymy w obszarze POD sticky navbarem, nie w całym oknie.
      const end = (vh + getNavbarOffset()) / 2 - rect.height / 2
      const t = Math.max(0, Math.min(1, (start - rect.top) / (start - end)))
      const eased = t * t * (3 - 2 * t)
      const q = Math.round(eased * 400) / 400
      if (q !== last) { last = q; setP(q) }
    }
    const loop = () => { read(); rafId = requestAnimationFrame(loop) }
    const io = new IntersectionObserver((entries) => {
      const inView = entries[0]?.isIntersecting ?? true
      if (inView && !rafId) rafId = requestAnimationFrame(loop)
      if (!inView && rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    }, { rootMargin: '260px 0px' })
    io.observe(el)
    read()
    rafId = requestAnimationFrame(loop)
    return () => { io.disconnect(); if (rafId) cancelAnimationFrame(rafId) }
  }, [])

  const C = ASSIST_CAM
  const S = 1.42
  const OX = 450
  const OY = 448

  const P3 = (x: number, y: number, z: number) => ({
    x: OX + (x * C.ux + y * C.vx + z * C.wx) * S,
    y: OY + (x * C.uy + y * C.vy + z * C.wy) * S,
  })
  const dep = (x: number, y: number, z: number) => x * C.ud + y * C.vd + z * C.wd

  /* Elipsa poziomego przekroju o półosiach rx (wzdłuż X) i rz (wzdłuż Z). */
  const contourEllipse = (rx: number, rz: number) =>
    circleToEllipse(rx * C.ux * S, rx * C.uy * S, rz * C.wx * S, rz * C.wy * S)


  /** Układ lokalny leżący NA płaszczyźnie karty — pozwala rysować grafikę
      karty w jej własnych milimetrach, a rzut sam nadaje pochylenie. */
  const cardPlane = (cx: number, cy: number, cz: number, ux: number, uz: number) => {
    const c = P3(cx, cy, cz)
    const rx = (ux * C.ux + uz * C.wx) * S
    const ry = (ux * C.uy + uz * C.wy) * S
    const dx = -C.vx * S
    const dy = -C.vy * S
    return `matrix(${rx.toFixed(4)} ${ry.toFixed(4)} ${dx.toFixed(4)} ${dy.toFixed(4)} ${c.x.toFixed(1)} ${c.y.toFixed(1)})`
  }

  const CW = 36   // półszerokość karty
  const CH = 25   // półwysokość karty

  /* ── Karty: pozycja, oświetlenie, głębia ─────────────────────────── */
  const cards = ASSIST_CARDS.map((card, i) => {
    const span = Math.max(0.18, 0.9 - card.at)
    const q = Math.max(0, Math.min(1, (p - card.at) / span))
    const ease = q * q * (3 - 2 * q)

    const theta = card.ang * D2R
    const r = 30 + ease * (card.rEnd - 30)
    const y = 52 + ease * (card.yEnd - 52)

    const cx = Math.cos(theta) * r
    const cz = Math.sin(theta) * r
    // Kierunek patrzenia rzutowany na płaszczyznę poziomą.
    const vlen = Math.hypot(C.ud, C.wd)
    const vx = C.ud / vlen
    const vz = C.wd / vlen
    // Normalna = mieszanka promienia i kierunku widza (0.34 / 0.66), dzięki
    // czemu karta nigdy nie ustawia się krawędzią i ikona zostaje czytelna.
    const bx = Math.cos(theta) * 0.34 + vx * 0.66
    const bz = Math.sin(theta) * 0.34 + vz * 0.66
    const blen = Math.hypot(bx, bz) || 1
    const nx = bx / blen
    const nz = bz / blen
    const ux = -nz
    const uz = nx
    const lit = Math.max(0, nx * ASSIST_LIGHT[0] + nz * ASSIST_LIGHT[2])

    return {
      ...card, i, cx, cy: y, cz, ux, uz, lit,
      o: Math.min(1, ease * 3.2),
      d: dep(cx, y, cz),
    }
  })

  /* ── Kotwice opisów: prawy górny róg karty ───────────────────────── */
  /** Narożnik karty od strony opisu — linia dobija do najbliższego rogu,
      zamiast przecinać własną kartę w drodze do przeciwległego. */
  const anchorOf = (c: typeof cards[number], side?: string, top?: boolean) => {
    const sx = side === 'r' ? 1 : -1
    const sy = top === false ? -1 : 1
    return P3(c.cx + sx * c.ux * CW, c.cy + sy * CH, c.cz + sx * c.uz * CW)
  }

  const CORNERS = [
    { cls: 'left-[2%] top-[4%]', side: 'l', ax: 222, ay: 64 },
    { cls: 'left-[2%] top-[76%]', side: 'l', ax: 222, ay: 500 },
    { cls: 'right-[1.5%] top-[4%]', side: 'r', ax: 678, ay: 64 },
    { cls: 'right-[1.5%] top-[76%]', side: 'r', ax: 678, ay: 500 },
  ]
  const labelled = cards.filter((c) => c.lab)
  // Dopasowanie karta ↔ róg po KĄCIE wokół środka sceny, nie po odległości.
  // Obie listy sortujemy tym samym kątem i łączymy po kolei — zachowanie
  // porządku cyklicznego matematycznie wyklucza przecięcia linii.
  const HUB = { x: 450, y: 400 }
  const ang = (x: number, y: number) => {
    const a = Math.atan2(y - HUB.y, x - HUB.x)
    return a < 0 ? a + Math.PI * 2 : a
  }
  const centers = labelled.map((c) => P3(c.cx, c.cy, c.cz))
  const byAngle = centers
    .map((a, j) => ({ j, t: ang(a.x, a.y) }))
    .sort((a, b) => a.t - b.t)
  const cornersByAngle = CORNERS
    .map((k, j) => ({ j, t: ang(k.ax, k.ay) }))
    .sort((a, b) => a.t - b.t)

  // Sam porządek kątowy nie wystarcza — trzeba jeszcze trafić w przesunięcie
  // cyklu. Sprawdzamy wszystkie rotacje i bierzemy tę o najkrótszych liniach:
  // porządek gwarantuje brak przecięć, rotacja — że linie są krótkie.
  const N = cornersByAngle.length
  let bestRot = 0
  let bestCost = Infinity
  for (let r = 0; r < N; r++) {
    let cost = 0
    byAngle.forEach((c, i) => {
      const k = CORNERS[cornersByAngle[(i + r) % N]!.j]!
      const a = centers[c.j]!
      cost += Math.hypot(k.ax - a.x, k.ay - a.y)
    })
    if (cost < bestCost) { bestCost = cost; bestRot = r }
  }
  const cornerFor: (typeof CORNERS[number] | undefined)[] = []
  byAngle.forEach((c, i) => { cornerFor[c.j] = CORNERS[cornersByAngle[(i + bestRot) % N]!.j] })
  const LABELS = [
    { k: 'a1', num: '01', head: 'NOTATKI', sub: 'Tworzy i organizuje notatki z ustaleń.' },
    { k: 'a2', num: '02', head: 'DOKUMENTY', sub: 'Generuje pliki i pisze umowy w locie.' },
    { k: 'a3', num: '03', head: 'RESEARCH', sub: 'Samodzielnie sprawdza sieć i źródła.' },
    { k: 'a4', num: '04', head: 'ZADANIA', sub: 'Rozbija projekty na kroki i planuje terminy.' },
  ].map((L, i) => ({ ...L, card: labelled[i], ...(cornerFor[i] ?? CORNERS[i]) }))

  /* ── Grafika na licu karty — jeden hairline'owy znak, nic więcej ── */
  const glyphOf = (kind: string) => {
    const st = { stroke: '#e8eef6', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }
    const thin = { ...st, strokeWidth: 1.45 }
    switch (kind) {
      case 'note': // kartka z zagiętym rogiem i tekstem
        return (
          <>
            <path d="M -9 -12 L 4 -12 L 10 -6 L 10 12 L -9 12 Z" {...st} />
            <path d="M 4 -12 L 4 -6 L 10 -6" {...st} />
            <line x1={-5} y1={-2} x2={6} y2={-2} {...thin} />
            <line x1={-5} y1={3} x2={6} y2={3} {...thin} />
            <line x1={-5} y1={8} x2={1} y2={8} {...thin} />
          </>
        )
      case 'cal': // kalendarz: oczka, belka nagłówka, siatka dni
        return (
          <>
            <line x1={-6} y1={-14} x2={-6} y2={-9} {...st} />
            <line x1={6} y1={-14} x2={6} y2={-9} {...st} />
            <rect x={-12} y={-11} width={24} height={22} rx={2.5} {...st} />
            <line x1={-12} y1={-4} x2={12} y2={-4} {...st} />
            {[-6, 0, 6].map((x) => [1, 6].map((y) => (
              <circle key={`${x}_${y}`} cx={x} cy={y} r={1.4} fill="#e8eef6" />
            )))}
          </>
        )
      case 'search': // lupa nad dokumentem — research, nie zwykłe szukanie
        return (
          <>
            <circle cx={-2} cy={-3} r={9.5} {...st} />
            <line x1={5} y1={4} x2={11.5} y2={10.5} strokeWidth={2.8} stroke="#e8eef6" strokeLinecap="round" />
          </>
        )
      case 'task': // lista zadań z odhaczonymi polami
        return (
          <>
            {[-8, 0, 8].map((y, i) => (
              <g key={y}>
                <rect x={5} y={y - 3.5} width={7} height={7} rx={1.5} {...thin} />
                {i < 2 && <path d={`M 6.5 ${y} L 8 ${y + 1.8} L 10.5 ${y - 2.2}`} {...thin} />}
                <line x1={-11} y1={y} x2={1} y2={y} {...thin} />
              </g>
            ))}
          </>
        )
      case 'pen':
        return (
          <>
            <path d="M -9 9 L 6 -6 L 9 -3 L -6 12 Z" {...thin} />
            <path d="M -9 9 L -10 12 L -6 12" {...thin} />
          </>
        )
      default:
        return <circle cx={0} cy={0} r={2.4} fill="#7dd3fc" />
    }
  }

  /* ── Scena posortowana realną głębią ─────────────────────────────── */
  const scene: { d: number; node: ReactNode }[] = [
    // popiersie jako jeden obiekt na głębi swojej osi
    {
      d: dep(0, 55, 3),
      node: (
        <g key="bust">
          {(() => {
            // Bryła obrotowa zawsze czyta się jak przedmiot toczony, bo popiersie
            // nie jest obrotowe — ramiona to płaska płyta, nie stożek. Dlatego
            // sylwetka to realny obrys głowa+ramiona, a warstwice kładziemy
            // NA niej jako linie skanu (przycięte maską do konturu).
            const base = P3(0, 0, 0)
            const k = S
            const d = [
              'M -68 0',
              'C -62 -18 -40 -28 -17 -38',   // linia ramienia w górę do szyi
              'L -14 -50',                   // szyja
              'C -25 -54 -27 -64 -27 -75',   // policzek — owal głowy
              'C -27 -93 -16 -106 0 -106',   // czubek
              'C 16 -106 27 -93 27 -75',
              'C 27 -64 25 -54 14 -50',
              'L 17 -38',
              'C 40 -28 62 -18 68 0',
              'Z',
            ].join(' ')
            const tr = `translate(${base.x.toFixed(1)} ${base.y.toFixed(1)}) scale(${k.toFixed(3)})`
            return (
              <g transform={tr}>
                <clipPath id="nbAsClip"><path d={d} /></clipPath>
                <path d={d} fill="url(#nbAsBody)" stroke="#3a4c66" strokeWidth={1.1 / k} strokeLinejoin="round" />
                {/* Linie skanu — faktura, nie kontur */}
                <g clipPath="url(#nbAsClip)" stroke="#7f96b2" strokeWidth={0.9 / k}>
                  {Array.from({ length: 22 }, (_, i) => {
                    const y = -104 + i * 4.8
                    return <line key={i} x1={-70} y1={y} x2={70} y2={y} opacity={0.14 + (i / 22) * 0.16} />
                  })}
                </g>
                {/* Światło po prawej krawędzi — ta sama logika co na aparacie */}
                <path
                  d="M 0 -106 C 16 -106 27 -93 27 -75 C 27 -64 25 -54 14 -50 L 17 -38 C 40 -28 62 -18 68 0"
                  fill="none" stroke="#c3d3e6" strokeWidth={2 / k} strokeLinecap="round" opacity={0.6}
                />
              </g>
            )
          })()}

          {/* Rdzeń obecności — jedyny cyan na postaci */}
          {(() => {
            const c = P3(0, 74, 0)
            return (
              <>
                <circle cx={c.x} cy={c.y} r={4} fill="#38bdf8" opacity={0.9} />
                <circle cx={c.x} cy={c.y} r={9} fill="none" stroke="#38bdf8" strokeWidth={1} opacity={0.32} />
              </>
            )
          })()}
        </g>
      ),
    },
    ...cards.map((c) => {
      // Jasność lica z kąta do światła sceny — jedno światło na całą scenę.
      const face = 17 + c.lit * 30
      const edge = 52 + c.lit * 62
      return {
        d: c.d,
        node: (
          <g key={c.id} opacity={c.o}>
            <polygon
              points={[
                P3(c.cx - c.ux * CW, c.cy + CH, c.cz - c.uz * CW),
                P3(c.cx + c.ux * CW, c.cy + CH, c.cz + c.uz * CW),
                P3(c.cx + c.ux * CW, c.cy - CH, c.cz + c.uz * CW),
                P3(c.cx - c.ux * CW, c.cy - CH, c.cz - c.uz * CW),
              ].map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')}
              fill={`rgb(${face} ${face + 6} ${face + 14})`}
              stroke={`rgb(${edge} ${edge + 14} ${edge + 28})`}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
            <g transform={cardPlane(c.cx, c.cy, c.cz, c.ux, c.uz)} opacity={0.5 + c.lit * 0.5}>
              {glyphOf(c.glyph)}
            </g>
          </g>
        ),
      }
    }),
  ].sort((a, b) => a.d - b.d)

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.12)_0%,transparent_70%)] blur-3xl"
        style={{ opacity: 0.5 + p * 0.4 }}
      />

      <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nbAsBody" x1="0%" y1="0%" x2="100%" y2="60%">
            <stop offset="0%" stopColor="#0a121e" />
            <stop offset="55%" stopColor="#111b2a" />
            <stop offset="100%" stopColor="#1c2a3d" />
          </linearGradient>
          <radialGradient id="nbAsFloor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#020617" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Cień kontaktowy — sadza scenę na podłożu */}
        {(() => {
          const e = contourEllipse(150, 150)
          const c = P3(0, -6, 0)
          return (
            <ellipse
              cx={0} cy={0} rx={e.rx} ry={e.ry}
              transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${e.rot.toFixed(2)})`}
              fill="url(#nbAsFloor)"
            />
          )
        })()}

        {scene.map((sc, i) => <g key={`sc${i}`}>{sc.node}</g>)}

        {/* Linie wskaźnikowe do opisów */}
        <g className="hidden sm:block">
          {LABELS.map((L) => {
            if (!L.card) return null
            const o = Math.min(1, Math.max(0, (p - L.card.at - 0.14) / 0.18)) * L.card.o
            if (o <= 0.01) return null
            const a = anchorOf(L.card, L.side, L.ay < 300)
            return (
              <g key={L.k} opacity={o}>
                <line x1={L.ax} y1={L.ay} x2={a.x} y2={a.y} stroke="#38bdf8" strokeWidth={1.1} strokeDasharray="4 4" opacity={0.7} />
                <circle cx={a.x} cy={a.y} r={3} fill="none" stroke="#38bdf8" strokeWidth={1.3} />
                <circle cx={L.ax} cy={L.ay} r={2.6} fill="#38bdf8" />
              </g>
            )
          })}
        </g>
      </svg>

      {/* OPISY — ta sama typografia co w module 02 */}
      {LABELS.map((L) => {
        if (!L.card) return null
        const o = Math.min(1, Math.max(0, (p - L.card.at - 0.14) / 0.18)) * L.card.o
        return (
          <div
            key={L.k}
            className={cn(
              'absolute w-[200px] hidden sm:block pointer-events-none transition-opacity duration-300',
              L.cls, L.side === 'r' ? 'text-right' : 'text-left',
            )}
            style={{ opacity: o, transform: `translateX(${(1 - p) * (L.side === 'r' ? 14 : -14)}px)` }}
          >
            <p className="text-[12.5px] font-bold uppercase tracking-wide text-primary font-sans leading-none">
              {`// ${L.num} ${L.head}`}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-snug text-foreground/80 font-sans">{L.sub}</p>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   WSPÓLNE NARZĘDZIA SCEN 3D (moduły 04–07)
   Ta sama kamera co przy asystencie, więc wszystkie sceny na stronie
   ogląda się z jednego, spójnego ustawienia.
   ═══════════════════════════════════════════════════════════════════════ */

/** Deterministyczny szum — bez Math.random, żeby układ był zawsze ten sam
    i dało się go zestroić raz na zawsze. */
const noise = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Fabryka rzutu dla sceny: własna skala i środek, wspólna kamera. */
function makeScene(S: number, OX: number, OY: number) {
  const C = ASSIST_CAM
  const P3 = (x: number, y: number, z: number) => ({
    x: OX + (x * C.ux + y * C.vx + z * C.wx) * S,
    y: OY + (x * C.uy + y * C.vy + z * C.wy) * S,
  })
  const dep = (x: number, y: number, z: number) => x * C.ud + y * C.vd + z * C.wd
  const poly = (pts: V3[]) =>
    pts.map((q) => { const s = P3(q[0], q[1], q[2]); return `${s.x.toFixed(1)},${s.y.toFixed(1)}` }).join(' ')
  /** Układ lokalny leżący NA ścianie — detale rysujemy w milimetrach modelu. */
  const plane = (px: number, py: number, pz: number, right: V3, down: V3) => {
    const c = P3(px, py, pz)
    const rx = (right[0] * C.ux + right[1] * C.vx + right[2] * C.wx) * S
    const ry = (right[0] * C.uy + right[1] * C.vy + right[2] * C.wy) * S
    const dx = (down[0] * C.ux + down[1] * C.vx + down[2] * C.wx) * S
    const dy = (down[0] * C.uy + down[1] * C.vy + down[2] * C.wy) * S
    return `matrix(${rx.toFixed(4)} ${ry.toFixed(4)} ${dx.toFixed(4)} ${dy.toFixed(4)} ${c.x.toFixed(1)} ${c.y.toFixed(1)})`
  }
  const Box = (
    x0: number, y0: number, z0: number, x1: number, y1: number, z1: number,
    fSide: string, fTop: string, fFront: string, stroke: string, sw = 1.2,
  ) => (
    <>
      <polygon points={poly([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]])} fill={fSide} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={poly([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]])} fill={fTop} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])} fill={fFront} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    </>
  )
  /** Okrąg leżący poziomo (monety, tarcze) — rzut daje spłaszczoną elipsę. */
  const discE = circleToEllipse(C.ux * S, C.uy * S, C.wx * S, C.wy * S)
  const Disc = (x: number, y: number, z: number, r: number, props: Record<string, unknown>, key?: string) => {
    const c = P3(x, y, z)
    return (
      <ellipse
        key={key} cx={0} cy={0} rx={r * discE.rx} ry={r * discE.ry}
        transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${discE.rot.toFixed(2)})`}
        {...props}
      />
    )
  }
  return { C, P3, dep, poly, plane, Box, Disc, discE }
}

/** Wspólny hook postępu scrolla dla scen. */
function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>, startRatio = 0.82) {
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
      const start = vh * startRatio
      // Wycentrowanie liczymy w obszarze POD sticky navbarem, nie w całym oknie.
      const end = (vh + getNavbarOffset()) / 2 - rect.height / 2
      const t = Math.max(0, Math.min(1, (start - rect.top) / (start - end)))
      const eased = t * t * (3 - 2 * t)
      const q = Math.round(eased * 400) / 400
      if (q !== last) { last = q; setP(q) }
    }
    const loop = () => { read(); rafId = requestAnimationFrame(loop) }
    const io = new IntersectionObserver((entries) => {
      const inView = entries[0]?.isIntersecting ?? true
      if (inView && !rafId) rafId = requestAnimationFrame(loop)
      if (!inView && rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    }, { rootMargin: '260px 0px' })
    io.observe(el)
    read()
    rafId = requestAnimationFrame(loop)
    return () => { io.disconnect(); if (rafId) cancelAnimationFrame(rafId) }
  }, [ref, startRatio])
  return p
}

/* ═══════════════════════════════════════════════════════════════════════
   MODUŁ 04: DEEP RESEARCH
   Wizualizacja: SIEĆ NEURONOWA WYRASTAJĄCA Z LAPTOPA

   Gęsta, warstwowa siatka: trzy warstwy węzłów, każdy spięty z kilkoma
   z warstwy wyżej. Krawędzie zapalają się falami, na końcu wszystko
   schodzi się do raportu. Kształt węzła niesie typ źródła, a część węzłów
   ma podpis — widać nie tylko ILE, ale i CO zostało przeszukane.
   ═══════════════════════════════════════════════════════════════════════ */

type NeuroNode = { x: number; y: number; z: number; lvl: number; kind: number; tag?: string }

/** Przykładowe źródła — pokazują, że research faktycznie czegoś szuka. */
const NEURO_TAGS = [
  'arxiv.org', 'benchmarki LLM', 'raport rynku AI',
  'dokumentacja API', 'analiza konkurencji', 'studium przypadku',
]

const NEURO = (() => {
  const layers = [
    { n: 7, y: 84, spread: 208, dz: 54 },
    { n: 10, y: 168, spread: 286, dz: 70 },
    { n: 8, y: 250, spread: 244, dz: 60 },
  ]
  const nodes: NeuroNode[] = []
  const index: number[][] = []
  let tagI = 0
  layers.forEach((L, li) => {
    const ids: number[] = []
    for (let i = 0; i < L.n; i++) {
      const u = L.n === 1 ? 0.5 : i / (L.n - 1)
      const seed = li * 50 + i
      // Podpisy tylko na skrajnych węzłach — w środku zrobiłby się tłok.
      const edgeish = i === 0 || i === L.n - 1
      const tag = edgeish && tagI < NEURO_TAGS.length ? NEURO_TAGS[tagI++] : undefined
      nodes.push({
        x: (u - 0.5) * 2 * L.spread + (noise(seed) - 0.5) * 24,
        y: L.y + (noise(seed + 7) - 0.5) * 22,
        z: (noise(seed + 13) - 0.5) * 2 * L.dz,
        lvl: li + 1,
        kind: (i + li) % 4,
        tag,
      })
      ids.push(nodes.length - 1)
    }
    index.push(ids)
  })

  const edges: { a: number; b: number; at: number }[] = []
  for (let li = 0; li < index.length - 1; li++) {
    index[li]!.forEach((ai) => {
      const cand = index[li + 1]!
        .map((bi) => ({ bi, d: Math.abs(nodes[bi]!.x - nodes[ai]!.x) }))
        .sort((p1, p2) => p1.d - p2.d)
      const k = 2 + (noise(ai * 3 + li) > 0.55 ? 1 : 0)
      cand.slice(0, k).forEach((c, j) => {
        edges.push({ a: ai, b: c.bi, at: 0.2 + li * 0.2 + j * 0.02 + noise(ai + j) * 0.05 })
      })
    })
  }
  index[0]!.forEach((ai, i) => edges.push({ a: -1, b: ai, at: 0.05 + i * 0.02 }))
  index[index.length - 1]!.forEach((ai, i) => edges.push({ a: ai, b: -2, at: 0.72 + i * 0.015 }))
  return { nodes, edges }
})()

const NEURO_APEX: V3 = [0, 40, -28]
const NEURO_OUT: V3 = [0, 330, -4]

function DeepResearchVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const p = useScrollProgress(containerRef, 0.66)
  const { P3, poly, plane } = makeScene(1.30, 450, 590)

  const pos = (i: number): V3 =>
    i === -1 ? NEURO_APEX : i === -2 ? NEURO_OUT : [NEURO.nodes[i]!.x, NEURO.nodes[i]!.y, NEURO.nodes[i]!.z]

  const nodeT = (i: number) => {
    const at = 0.08 + (NEURO.nodes[i]!.lvl - 1) * 0.2
    const q = Math.max(0, Math.min(1, (p - at) / 0.18))
    return q * q * (3 - 2 * q)
  }

  const edgePts = (a: V3, b: V3, t: number, bow: number) => {
    const pts: string[] = []
    const N = 12
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * t
      const q = P3(
        a[0] + (b[0] - a[0]) * u,
        a[1] + (b[1] - a[1]) * u + 4 * u * (1 - u) * bow,
        a[2] + (b[2] - a[2]) * u,
      )
      pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`)
    }
    return pts.join(' ')
  }

  const glyph = (kind: number, x: number, y: number, k: number) => {
    const st = { stroke: '#7dd3fc', strokeWidth: 1.2, fill: '#07131f' }
    const r = 5 * k
    if (kind === 0) return <circle cx={x} cy={y} r={r} {...st} />
    if (kind === 1) return <rect x={x - r * 0.9} y={y - r * 1.15} width={r * 1.8} height={r * 2.3} rx={1} {...st} />
    if (kind === 2) return (
      <>
        <rect x={x - r * 1.1} y={y - r * 0.85} width={r * 2.2} height={r * 1.7} rx={1} {...st} />
        <line x1={x - r * 1.1} y1={y} x2={x + r * 1.1} y2={y} stroke="#7dd3fc" strokeWidth={0.7} />
      </>
    )
    return <polygon points={`${x},${y - r * 1.25} ${x + r},${y} ${x},${y + r * 1.25} ${x - r},${y}`} {...st} />
  }

  const shown = NEURO.nodes.filter((_, i) => nodeT(i) > 0.02).length
  const outT = Math.max(0, Math.min(1, (p - 0.78) / 0.18))

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.15)_0%,transparent_70%)] blur-3xl"
        style={{ opacity: 0.45 + p * 0.45 }}
      />
      <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nbRsBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9fadc0" /><stop offset="100%" stopColor="#3a4759" />
          </linearGradient>
          <linearGradient id="nbRsLid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6d7d92" /><stop offset="100%" stopColor="#2b3644" />
          </linearGradient>
          <radialGradient id="nbRsFloor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#020617" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          <filter id="nbRsGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── KRAWĘDZIE SIECI ── */}
        <g>
          {NEURO.edges.map((e, i) => {
            const q = Math.max(0, Math.min(1, (p - e.at) / 0.2))
            const t = q * q * (3 - 2 * q)
            if (t <= 0.01) return null
            const out = e.b === -2
            return (
              <polyline
                key={`e${i}`} points={edgePts(pos(e.a), pos(e.b), t, out ? -18 : 12)}
                fill="none" stroke="#38bdf8" strokeWidth={out ? 0.9 : 1}
                strokeDasharray={out ? '3 5' : undefined}
                opacity={(out ? 0.4 : 0.3) * t} strokeLinecap="round"
              />
            )
          })}
        </g>

        {/* ── LAPTOP ── */}
        <g>
          {(() => { const e = P3(0, -3, 0); return <ellipse cx={e.x} cy={e.y} rx={128} ry={30} fill="url(#nbRsFloor)" /> })()}

          {/* klapa z ekranem */}
          <polygon points={poly([[-58, 0, -40], [58, 0, -40], [52, 58, -56], [-52, 58, -56]])} fill="url(#nbRsLid)" stroke="#cbd8e6" strokeWidth={1.3} strokeLinejoin="round" />
          <polygon points={poly([[-49, 6, -43], [49, 6, -43], [44, 52, -55], [-44, 52, -55]])} fill="#06111c" stroke="#38bdf8" strokeWidth={0.9} strokeOpacity={0.5} />
          {/* zawartość ekranu: pasek wyszukiwania i wyniki */}
          <g transform={plane(0, 29, -49, [1, 0, 0], [0, -1, 0])} opacity={0.92}>
            <rect x={-38} y={-19} width={76} height={10} rx={5} fill="#0d2033" stroke="#38bdf8" strokeWidth={0.9} />
            <circle cx={-31} cy={-14} r={3} fill="none" stroke="#7dd3fc" strokeWidth={0.9} />
            <line x1={-29} y1={-12} x2={-26.6} y2={-9.6} stroke="#7dd3fc" strokeWidth={0.9} />
            <line x1={-22} y1={-14} x2={18} y2={-14} stroke="#7dd3fc" strokeWidth={1.2} opacity={0.55} />
            {[-3, 4, 11].map((y, i) => (
              <g key={y}>
                <rect x={-38} y={y} width={4.4} height={4.4} rx={0.8} fill="#38bdf8" opacity={0.6} />
                <line x1={-30} y1={y + 2.2} x2={38 - i * 12} y2={y + 2.2} stroke="#5b7d99" strokeWidth={1.1} />
              </g>
            ))}
          </g>

          {/* podstawa z klawiaturą i gładzikiem */}
          <polygon points={poly([[-61, 0, 38], [61, 0, 38], [52, 0, -40], [-52, 0, -40]])} fill="url(#nbRsBase)" stroke="#d3dde9" strokeWidth={1.3} strokeLinejoin="round" />
          <polygon points={poly([[-61, 0, 38], [61, 0, 38], [61, -5, 38], [-61, -5, 38]])} fill="#28323f" stroke="#7d8ea6" strokeWidth={1} />
          <g transform={plane(0, 0.4, 0, [1, 0, 0], [0, 0, 1])} opacity={0.75}>
            {Array.from({ length: 4 }, (_, r) => (
              <g key={r}>
                {Array.from({ length: 13 }, (_, c) => (
                  <rect key={c} x={-45 + c * 7.1} y={-26 + r * 7.4} width={5.8} height={5.6} rx={1} fill="#1c2531" opacity={0.9} />
                ))}
              </g>
            ))}
            <rect x={-16} y={9} width={32} height={19} rx={2.2} fill="none" stroke="#6f8199" strokeWidth={1} />
          </g>
        </g>

        {/* ── WĘZŁY ── */}
        <g>
          {NEURO.nodes.map((n, i) => {
            const t = nodeT(i)
            if (t <= 0.02) return null
            const q = P3(n.x, n.y, n.z)
            return (
              <g key={`n${i}`} opacity={t}>
                <circle cx={q.x} cy={q.y} r={10} fill="#38bdf8" opacity={0.1} />
                {glyph(n.kind, q.x, q.y, n.lvl === 2 ? 1.05 : 0.92)}
                {n.tag && (
                  <text
                    x={q.x + (n.x < 0 ? -15 : 15)} y={q.y + 4.2}
                    textAnchor={n.x < 0 ? 'end' : 'start'}
                    fill="#a8c9e0" fontSize={15} fontFamily="monospace" letterSpacing="0.3"
                  >
                    {n.tag}
                  </text>
                )}
              </g>
            )
          })}
        </g>

        {/* ── RAPORT ── */}
        {outT > 0.01 && (() => {
          const c = P3(NEURO_OUT[0], NEURO_OUT[1], NEURO_OUT[2])
          const w = 64, h = 40
          return (
            <g opacity={outT}>
              <g filter="url(#nbRsGlow)">
                <rect x={c.x - w} y={c.y - h} width={w * 2} height={h * 2} rx={4} fill="#0a1726" stroke="#7dd3fc" strokeWidth={1.6} />
                {[-18, -7, 4, 15].map((dy, i) => (
                  <line key={dy} x1={c.x - w + 16} y1={c.y + dy} x2={c.x + w - (i === 3 ? 40 : 16)} y2={c.y + dy} stroke="#9fc9e4" strokeWidth={1.5} opacity={0.72} />
                ))}
              </g>
              <text x={c.x} y={c.y + h + 20} fill="#7dd3fc" fontSize={12} fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">RAPORT</text>
            </g>
          )
        })()}

        <g className="hidden sm:block" opacity={Math.min(1, p * 3)}>
          <text x={28} y={598} fill="#64748b" fontSize={12} fontFamily="monospace" letterSpacing="1">
            {`PRZESZUKANO ${String(shown * 9).padStart(3, '0')} ŹRÓDEŁ`}
          </text>
        </g>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   MODUŁ 05: AKADEMIA I PANEL TWÓRCY
   Wizualizacja: OTWIERAJĄCA SIĘ KSIĄŻKA, Z KTÓREJ WYFRUWAJĄ LEKCJE

   Książka to natychmiast czytelna „akademia". Przy scrollu otwiera się,
   a z jej wnętrza kolejno wyfruwają karty lekcji układające się w łuk.
   Ostatnia karta zamienia się w ofertę z ceną — to moment, w którym
   przestajesz się uczyć, a zaczynasz sprzedawać własne materiały.
   Ruch: otwarcie i wachlarz — gest, którego nie ma w żadnym innym module.
   ═══════════════════════════════════════════════════════════════════════ */

const LESSON_CARDS = ['PODSTAWY', 'PROMPTY', 'OBRAZ', 'ASYSTENT', 'AUTOMATY']

function AcademyVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const p = useScrollProgress(containerRef, 0.82)
  const { P3, poly, plane, Disc, discE } = makeScene(1.02, 356, 404)

  const BW = 176   // półszerokość okładki
  const BD = 124   // półgłębokość (grzbiet → brzeg)
  const openT = Math.max(0, Math.min(1, p / 0.32))
  const open = openT * openT * (3 - 2 * openT)
  const lift = 26 * open           // kąt rozwarcia oddany uniesieniem brzegów

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[470px] w-[660px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.13)_0%,transparent_70%)] blur-3xl"
        style={{ opacity: 0.45 + p * 0.45 }}
      />
      <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nbAcCover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#31404f" /><stop offset="100%" stopColor="#131c26" />
          </linearGradient>
          <linearGradient id="nbAcPage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cfdae6" /><stop offset="100%" stopColor="#7e8ea1" />
          </linearGradient>
          <linearGradient id="nbAcLesson" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#233243" /><stop offset="100%" stopColor="#111a24" />
          </linearGradient>
          <radialGradient id="nbAcFloor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#020617" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>

        {(() => { const e = P3(0, -3, 0); return <ellipse cx={e.x} cy={e.y} rx={224} ry={44} fill="url(#nbAcFloor)" /> })()}

        {/* ── KSIĄŻKA: dwie połówki rozchylone wokół grzbietu ── */}
        <g>
          {/* lewa okładka + kartki */}
          <polygon points={poly([[-BW, 0, -BD], [0, 0, -BD], [0, 0, BD], [-BW, 0, BD]])} fill="url(#nbAcCover)" stroke="#7d8ea6" strokeWidth={1.2} strokeLinejoin="round" />
          <polygon points={poly([[-BW + 8, lift * 0.35, -BD + 8], [-4, 0, -BD + 8], [-4, 0, BD - 8], [-BW + 8, lift * 0.35, BD - 8]])} fill="url(#nbAcPage)" stroke="#e6edf5" strokeWidth={0.9} strokeLinejoin="round" opacity={0.9} />
          {/* prawa okładka + kartki */}
          <polygon points={poly([[0, 0, -BD], [BW, 0, -BD], [BW, 0, BD], [0, 0, BD]])} fill="url(#nbAcCover)" stroke="#7d8ea6" strokeWidth={1.2} strokeLinejoin="round" />
          <polygon points={poly([[4, 0, -BD + 8], [BW - 8, lift * 0.35, -BD + 8], [BW - 8, lift * 0.35, BD - 8], [4, 0, BD - 8]])} fill="url(#nbAcPage)" stroke="#e6edf5" strokeWidth={0.9} strokeLinejoin="round" opacity={0.9} />
          {/* grzbiet */}
          <polygon points={poly([[-5, 0, -BD], [5, 0, -BD], [5, 5, BD], [-5, 5, BD]])} fill="#0d151f" stroke="#5f7288" strokeWidth={1} />
          {/* linie tekstu na kartkach */}
          <g transform={plane(-BW / 2 - 4, lift * 0.18, 0, [1, 0, 0], [0, 0, -1])} opacity={0.45 * open}>
            {[-22, -14, -6, 2, 10, 18].map((y, i) => (
              <line key={y} x1={-32} y1={y} x2={i % 3 === 2 ? 8 : 30} y2={y} stroke="#4a5b70" strokeWidth={1.4} />
            ))}
          </g>
          <g transform={plane(BW / 2 + 4, lift * 0.18, 0, [1, 0, 0], [0, 0, -1])} opacity={0.45 * open}>
            {[-22, -14, -6, 2, 10, 18].map((y, i) => (
              <line key={y} x1={-30} y1={y} x2={i % 3 === 1 ? 6 : 32} y2={y} stroke="#4a5b70" strokeWidth={1.4} />
            ))}
          </g>
        </g>

        {/* ── LEKCJE WYFRUWAJĄCE Z KSIĄŻKI W ŁUK ── */}
        {LESSON_CARDS.map((t, i) => {
          const at = 0.16 + i * 0.12
          const q = Math.max(0, Math.min(1, (p - at) / 0.26))
          const e = q * q * (3 - 2 * q)
          if (e <= 0.01) return null
          // Łuk: od grzbietu w górę i na boki, każda kolejna wyżej i dalej.
          const a = (-84 + (i / (LESSON_CARDS.length - 1)) * 116) * D2R
          const r = 186 + i * 29
          const cx = Math.sin(a) * r * e
          const cy = 40 + e * (108 + Math.cos(a) * 66)
          const cz = -Math.cos(a) * 30 * e
          const w = 74, h = 46
          const sell = i === LESSON_CARDS.length - 1 ? Math.max(0, Math.min(1, (p - 0.7) / 0.24)) : 0
          return (
            <g key={t} opacity={Math.min(1, e * 1.8)}>
              <polygon
                points={poly([[cx - w, cy + h, cz], [cx + w, cy + h, cz], [cx + w, cy - h, cz], [cx - w, cy - h, cz]])}
                fill="url(#nbAcLesson)" stroke={sell > 0.4 ? '#7dd3fc' : '#5b7288'} strokeWidth={sell > 0.4 ? 1.5 : 1.1} strokeLinejoin="round"
              />
              <g transform={plane(cx, cy, cz, [1, 0, 0], [0, -1, 0])}>
                <text x={0} y={-8} fill="#7dd3fc" fontSize={16} fontFamily="monospace" fontWeight="bold" textAnchor="middle">{`0${i + 1}`}</text>
                <text x={0} y={14} fill={sell > 0.4 ? '#e0f2fe' : '#bacbde'} fontSize={14} fontFamily="monospace" textAnchor="middle" letterSpacing="0.6">{t}</text>
              </g>
            </g>
          )
        })}

        {/* ── ZARABIANIE: duży wykres u góry, banknoty i kupki monet ── */}
        {(() => {
          const eT = Math.max(0, Math.min(1, (p - 0.56) / 0.4))
          const e = eT * eT * (3 - 2 * eT)
          if (e <= 0.01) return null
          const EX = 408, EY = 352, EZ = -62
          const bars = [0.3, 0.46, 0.6, 0.8, 1]
          return (
            <g opacity={Math.min(1, e * 1.6)}>
              {/* Panel z wykresem — u samej góry kadru, w pełnej czytelności */}
              <g transform={plane(EX, EY, EZ, [1, 0, 0], [0, -1, 0])}>
                <rect x={-118} y={-92} width={236} height={184} rx={8} fill="#0a1420" stroke="#4f6a86" strokeWidth={1.8} />
                <text x={-100} y={-62} fill="#9fc2da" fontSize={17} fontFamily="monospace" letterSpacing="1.6">PRZYCHÓD</text>
                {bars.map((v, i) => {
                  const bq = Math.max(0, Math.min(1, (e - i * 0.1) / 0.4))
                  const bt = bq * bq * (3 - 2 * bq)
                  const h = 104 * v * bt
                  return (
                    <rect key={i} x={-96 + i * 40} y={60 - h} width={27} height={h} rx={2.6}
                      fill={i === bars.length - 1 ? '#38bdf8' : '#20415c'} stroke="#5b93b8" strokeWidth={1.1} />
                  )
                })}
                <line x1={-104} y1={62} x2={104} y2={62} stroke="#4a6178" strokeWidth={1.6} />
                <path d="M -92 30 L -34 -2 L 12 14 L 84 -56" fill="none" stroke="#7dd3fc" strokeWidth={3.4}
                  strokeLinecap="round" strokeLinejoin="round" opacity={Math.max(0, (e - 0.3) / 0.5)} />
                <path d="M 60 -56 L 88 -56 L 88 -28" fill="none" stroke="#7dd3fc" strokeWidth={3.4}
                  strokeLinecap="round" strokeLinejoin="round" opacity={Math.max(0, (e - 0.45) / 0.4)} />
              </g>

              {/* Banknoty — plik leżący pod monetami */}
              {[0, 1, 2].map((i) => {
                const nq = Math.max(0, Math.min(1, (e - 0.24 - i * 0.07) / 0.34))
                const nt = nq * nq * (3 - 2 * nq)
                if (nt <= 0.01) return null
                const bx = 372, bz = 24, by = 3 + i * 5
                return (
                  <g key={`note${i}`} opacity={nt}>
                    <polygon
                      points={poly([[bx - 62, by, bz - 34], [bx + 62, by, bz - 34], [bx + 62, by, bz + 34], [bx - 62, by, bz + 34]])}
                      fill="#15303f" stroke="#7dd3fc" strokeWidth={1.3} strokeLinejoin="round"
                    />
                    {i === 2 && (
                      <g transform={plane(bx, by + 0.6, bz, [1, 0, 0], [0, 0, -1])}>
                        <circle cx={0} cy={0} r={13} fill="none" stroke="#9fd6f2" strokeWidth={1.4} />
                        <text x={0} y={5} fill="#d6ecfb" fontSize={14} fontFamily="monospace" fontWeight="bold" textAnchor="middle">zł</text>
                        <line x1={-46} y1={-18} x2={-22} y2={-18} stroke="#5b93b8" strokeWidth={1.4} />
                        <line x1={22} y1={18} x2={46} y2={18} stroke="#5b93b8" strokeWidth={1.4} />
                      </g>
                    )}
                  </g>
                )
              })}

              {/* Moneta = walec: dolna czasza, pas boczny i górne lico.
                  Sam krążek czytał się płasko jak żeton. */}
              {[{ x: 296, z: 100, n: 5 }, { x: 372, z: 122, n: 7 }, { x: 444, z: 92, n: 4 }].map((st, k) => (
                <g key={`pile${k}`}>
                  {Array.from({ length: st.n }, (_, i) => {
                    const cq = Math.max(0, Math.min(1, (e - 0.3 - k * 0.06 - i * 0.05) / 0.32))
                    const ct = cq * cq * (3 - 2 * cq)
                    if (ct <= 0.01) return null
                    const TH = 7.5
                    const y = 4 + i * (TH + 0.6) * ct
                    const R = 27
                    const bot = P3(st.x, y, st.z)
                    const top = P3(st.x, y + TH, st.z)
                    const rot = discE.rot * D2R
                    const hw = Math.hypot(R * discE.rx * Math.cos(rot), R * discE.ry * Math.sin(rot))
                    return (
                      <g key={i} opacity={ct}>
                        {Disc(st.x, y, st.z, R, { fill: '#0f2433', stroke: '#4d7f9e', strokeWidth: 1 })}
                        <path
                          d={`M ${(bot.x - hw).toFixed(1)} ${bot.y.toFixed(1)} L ${(bot.x + hw).toFixed(1)} ${bot.y.toFixed(1)} L ${(top.x + hw).toFixed(1)} ${top.y.toFixed(1)} L ${(top.x - hw).toFixed(1)} ${top.y.toFixed(1)} Z`}
                          fill="#173347" stroke="#5b93b8" strokeWidth={1}
                        />
                        {Disc(st.x, y + TH, st.z, R, { fill: '#22485f', stroke: '#a8def8', strokeWidth: 1.5 })}
                        {Disc(st.x, y + TH + 0.4, st.z, R * 0.62, { fill: 'none', stroke: '#6fa8c8', strokeWidth: 1 })}
                      </g>
                    )
                  })}
                </g>
              ))}
            </g>
          )
        })()}

        <g className="hidden sm:block" opacity={Math.min(1, p * 3)}>
          <text x={28} y={598} fill="#64748b" fontSize={12} fontFamily="monospace" letterSpacing="1">
            {p > 0.74 ? 'UCZ SIĘ · WYSTAW · ZARABIAJ' : `LEKCJE ${Math.min(LESSON_CARDS.length, Math.max(0, Math.round((p - 0.16) / 0.12) + 1))} / ${LESSON_CARDS.length}`}
          </text>
        </g>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   MODUŁ 06: PAMIĘĆ AI
   Wizualizacja: SZUFLADA, KTÓRA REALNIE SIĘ WYSUWA

   Cała skrzynka jedzie do przodu po prowadnicy — widać lewą i prawą
   ściankę oraz dno, więc czyta się jako szuflada, a nie jako otwarte
   pudełko. W środku karty z tym, co platforma o Tobie pamięta. Jedna
   jest wyjęta i podświetlona z krzyżykiem: masz wgląd i możesz skasować.
   ═══════════════════════════════════════════════════════════════════════ */

const MEMORY_CARDS = [
  'Profil firmy',
  'Ton komunikacji',
  'Nazwy produktów',
  'Stali klienci',
  'Ulubione formaty',
  'Ustalenia projektów',
]

function MemoryVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const p = useScrollProgress(containerRef, 0.82)
  const { P3, poly, plane } = makeScene(1.16, 430, 452)

  const TX = 168, TZ = 108, TY = 48, WT = 10  // szuflada + grubość ścianek
  const CW = 148, CH = 108                     // karta
  const N = MEMORY_CARDS.length

  // Wysuw szuflady — teraz naprawdę wyjeżdża, a nie drga w miejscu.
  const slideT = Math.max(0, Math.min(1, p / 0.3))
  const slide = (slideT * slideT * (3 - 2 * slideT)) * 170
  const pullT = Math.max(0, Math.min(1, (p - 0.66) / 0.3))
  const pull = pullT * pullT * (3 - 2 * pullT)
  const Z = (z: number) => z + slide

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[660px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.13)_0%,transparent_70%)] blur-3xl"
        style={{ opacity: 0.45 + p * 0.45 }}
      />
      <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nbMmFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7f8fa4" /><stop offset="100%" stopColor="#232d3a" />
          </linearGradient>
          <linearGradient id="nbMmInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e2b3a" /><stop offset="100%" stopColor="#0a121b" />
          </linearGradient>
          <linearGradient id="nbMmCard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#26364a" /><stop offset="100%" stopColor="#131c28" />
          </linearGradient>
          <radialGradient id="nbMmFloor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#020617" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>

        {(() => { const e = P3(0, -8, 50); return <ellipse cx={e.x} cy={e.y} rx={256} ry={50} fill="url(#nbMmFloor)" /> })()}

        {/* ── SZAFKA, Z KTÓREJ SZUFLADA WYJEŻDŻA ── */}
        <polygon points={poly([[-TX - 12, -6, -TZ - 10], [TX + 12, -6, -TZ - 10], [TX + 12, TY + 22, -TZ - 10], [-TX - 12, TY + 22, -TZ - 10]])} fill="#060b12" stroke="#29384a" strokeWidth={1.1} />
        <polygon points={poly([[TX + 12, -6, -TZ - 10], [TX + 12, -6, -TZ + 52], [TX + 12, TY + 22, -TZ + 52], [TX + 12, TY + 22, -TZ - 10]])} fill="#0b131d" stroke="#31435a" strokeWidth={1} />
        <polygon points={poly([[-TX - 12, TY + 22, -TZ - 10], [TX + 12, TY + 22, -TZ - 10], [TX + 12, TY + 22, -TZ + 52], [-TX - 12, TY + 22, -TZ + 52]])} fill="#101a26" stroke="#3d4f66" strokeWidth={1} />

        {/* ── DNO ── */}
        <polygon points={poly([[-TX, 0, Z(-TZ)], [TX, 0, Z(-TZ)], [TX, 0, Z(TZ)], [-TX, 0, Z(TZ)]])} fill="#0a121c" stroke="#44576f" strokeWidth={1.1} strokeLinejoin="round" />

        {/* ── TYLNA ŚCIANKA (wnętrze) ── */}
        <polygon points={poly([[-TX, 0, Z(-TZ)], [TX, 0, Z(-TZ)], [TX, TY, Z(-TZ)], [-TX, TY, Z(-TZ)]])} fill="url(#nbMmInner)" stroke="#46586f" strokeWidth={1.1} />

        {/* ── LEWA ŚCIANKA. Jej ściana ZEWNĘTRZNA jest przy tej kamerze tyłem,
               dlatego wcześniej wyglądało, jakby szuflada nie miała lewego boku.
               Rysujemy powierzchnię wewnętrzną plus grubość na górnej krawędzi. ── */}
        <polygon points={poly([[-TX, 0, Z(-TZ)], [-TX, 0, Z(TZ)], [-TX, TY, Z(TZ)], [-TX, TY, Z(-TZ)]])} fill="url(#nbMmInner)" stroke="#6b7f99" strokeWidth={1.2} strokeLinejoin="round" />
        <polygon points={poly([[-TX, TY, Z(-TZ)], [-TX, TY, Z(TZ)], [-TX - WT, TY, Z(TZ)], [-TX - WT, TY, Z(-TZ)]])} fill="#8496ab" stroke="#c3d0e0" strokeWidth={1.1} strokeLinejoin="round" />
        <polygon points={poly([[-TX - WT, 0, Z(TZ)], [-TX, 0, Z(TZ)], [-TX, TY, Z(TZ)], [-TX - WT, TY, Z(TZ)]])} fill="#4d5c70" stroke="#93a4bb" strokeWidth={1} />

        {/* ── KARTY ── */}
        {MEMORY_CARDS.map((m, i) => {
          const q = Math.max(0, Math.min(1, (p - 0.16 - i * 0.075) / 0.22))
          const t = q * q * (3 - 2 * q)
          if (t <= 0.01) return null
          const isPulled = i === 2
          const z = Z(-TZ + 22 + i * 30)
          const lifted = isPulled ? pull * 80 : 0
          const y0 = 5 + lifted, y1 = 5 + CH + lifted
          const hot = isPulled && pull > 0.4
          return (
            <g key={m} opacity={Math.min(1, t * 2)}>
              <polygon
                points={poly([[-CW / 2, y0, z], [CW / 2, y0, z], [CW / 2, y1, z], [-CW / 2, y1, z]])}
                fill="url(#nbMmCard)" stroke={hot ? '#7dd3fc' : '#5b7089'} strokeWidth={hot ? 1.6 : 1.1} strokeLinejoin="round"
              />
              <g transform={plane(0, (y0 + y1) / 2, z, [1, 0, 0], [0, -1, 0])}>
                <text x={-56} y={-30} fill={hot ? '#e0f2fe' : '#b9cbdf'} fontSize={12} fontFamily="monospace" letterSpacing="0.2">{m}</text>
                <line x1={-50} y1={-19} x2={22} y2={-19} stroke="#3f5169" strokeWidth={1.1} />
                <line x1={-50} y1={-10} x2={0} y2={-10} stroke="#3f5169" strokeWidth={1.1} />
                {hot && (
                  <g>
                    <circle cx={48} cy={-32} r={9} fill="#0b1a28" stroke="#7dd3fc" strokeWidth={1.3} />
                    <path d="M 44 -36 L 52 -28 M 52 -36 L 44 -28" stroke="#d3ecfb" strokeWidth={1.6} strokeLinecap="round" />
                  </g>
                )}
              </g>
            </g>
          )
        })}

        {/* ── PRAWA ŚCIANKA I FRONT (karty siedzą za nimi) ── */}
        <polygon points={poly([[TX, 0, Z(-TZ)], [TX, 0, Z(TZ)], [TX, TY, Z(TZ)], [TX, TY, Z(-TZ)]])} fill="#1a2431" stroke="#7d8ea6" strokeWidth={1.2} strokeLinejoin="round" />
        <polygon points={poly([[TX, TY, Z(-TZ)], [TX, TY, Z(TZ)], [TX + WT, TY, Z(TZ)], [TX + WT, TY, Z(-TZ)]])} fill="#8496ab" stroke="#c3d0e0" strokeWidth={1.1} strokeLinejoin="round" />
        <polygon points={poly([[-TX - WT, 0, Z(TZ)], [TX + WT, 0, Z(TZ)], [TX + WT, TY, Z(TZ)], [-TX - WT, TY, Z(TZ)]])} fill="url(#nbMmFront)" stroke="#c3d0e0" strokeWidth={1.4} strokeLinejoin="round" />

        {/* uchwyt i podpis frontu */}
        <g transform={plane(0, TY / 2, Z(TZ), [1, 0, 0], [0, -1, 0])}>
          <rect x={-46} y={-11} width={92} height={22} rx={4} fill="#0d151f" stroke="#a1b2c6" strokeWidth={1.1} />
          <text x={0} y={5} fill="#d5e3f2" fontSize={13} fontFamily="monospace" textAnchor="middle" letterSpacing="2.2">PAMIĘĆ</text>
        </g>

        <g className="hidden sm:block" opacity={Math.min(1, p * 3)}>
          <text x={28} y={598} fill="#64748b" fontSize={12} fontFamily="monospace" letterSpacing="1">
            {`ZAPAMIĘTANE WPISY ${Math.min(N, Math.max(0, Math.round((p - 0.16) / 0.075) + 1))} / ${N}`}
          </text>
        </g>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   MODUŁ 07: ZINTEGROWANY WORKSPACE
   Wizualizacja: PŁASKA PŁYTKA DRUKOWANA — RDZEŃ NEXTBYTE I ŚCIEŻKI

   Jedyna scena bez rzutu aksonometrycznego: płytkę oglądamy PROSTOPADLE,
   jak schemat PCB. W rdzeniu siedzi prawdziwy znak NextByte, a ścieżki
   wychodzą wszystkimi czterema bokami — nie tylko na prawo i lewo.
   Układy stoją w nierównych odległościach i zapalają się w rozjechanych
   momentach, więc płytka wygląda na projektowaną, a nie na siatkę.
   ═══════════════════════════════════════════════════════════════════════ */

type PcbMod = {
  t: string
  axis: 'h' | 'v'
  dir: -1 | 1        // h: -1 w lewo, 1 w prawo | v: -1 w górę, 1 w dół
  pin: number        // przesunięcie nóżki wzdłuż krawędzi rdzenia
  elbow: number      // współrzędna kolanka (x dla 'h', y dla 'v')
  padX: number; padY: number; w: number
  at: number
}

const PCB_CX = 450, PCB_CY = 306, PCB_R = 78
const PAD_H = 44

/** Nierówne odległości i rozjechane progi — celowo, żeby uniknąć siatki. */
const PCB_MODS: PcbMod[] = [
  { t: 'CZAT AI', axis: 'h', dir: -1, pin: -34, elbow: 300, padX: 236, padY: 156, w: 158, at: 0.04 },
  { t: 'STUDIO WIDEO', axis: 'h', dir: -1, pin: 4, elbow: 250, padX: 178, padY: 306, w: 180, at: 0.20 },
  { t: 'DEEP RESEARCH', axis: 'h', dir: -1, pin: 40, elbow: 308, padX: 222, padY: 458, w: 190, at: 0.42 },
  { t: 'PAMIĘĆ AI', axis: 'h', dir: 1, pin: -34, elbow: 600, padX: 664, padY: 166, w: 152, at: 0.11 },
  { t: 'KALENDARZ', axis: 'h', dir: 1, pin: 4, elbow: 648, padX: 716, padY: 306, w: 154, at: 0.26 },
  { t: 'AKADEMIA I SKLEP', axis: 'h', dir: 1, pin: 40, elbow: 596, padX: 660, padY: 458, w: 200, at: 0.48 },
  { t: 'STUDIO ZDJĘĆ', axis: 'v', dir: -1, pin: -40, elbow: 118, padX: 300, padY: 74, w: 168, at: 0.15 },
  { t: 'NOTATKI', axis: 'v', dir: -1, pin: 34, elbow: 160, padX: 610, padY: 74, w: 132, at: 0.32 },
  { t: 'ASYSTENT AI', axis: 'v', dir: 1, pin: -40, elbow: 494, padX: 322, padY: 552, w: 158, at: 0.36 },
  { t: 'ZADANIA I TABLICE', axis: 'v', dir: 1, pin: 34, elbow: 528, padX: 616, padY: 552, w: 196, at: 0.54 },
]

function WorkspaceVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const p = useScrollProgress(containerRef, 0.82)

  /** Trasa ścieżki: nóżka → kolanko → przesunięcie → pole lutownicze.
      Rysowana częściowo, więc realnie „narasta". */
  const route = (m: PcbMod): [number, number][] => {
    if (m.axis === 'h') {
      const x0 = PCB_CX + m.dir * PCB_R
      const y0 = PCB_CY + m.pin
      return [[x0, y0], [m.elbow, y0], [m.elbow, m.padY], [m.padX, m.padY]]
    }
    const x0 = PCB_CX + m.pin
    const y0 = PCB_CY + m.dir * PCB_R
    return [[x0, y0], [x0, m.elbow], [m.padX, m.elbow], [m.padX, m.padY]]
  }

  const partial = (pts: [number, number][], t: number) => {
    const segs: number[] = []
    let total = 0
    for (let i = 0; i < pts.length - 1; i++) {
      const d = Math.hypot(pts[i + 1]![0] - pts[i]![0], pts[i + 1]![1] - pts[i]![1])
      segs.push(d); total += d
    }
    let want = total * t
    const out = [`${pts[0]![0]},${pts[0]![1]}`]
    for (let i = 0; i < segs.length; i++) {
      const d = segs[i]!
      const fr = d === 0 ? 1 : Math.min(1, want / d)
      const A = pts[i]!, B = pts[i + 1]!
      out.push(`${(A[0] + (B[0] - A[0]) * fr).toFixed(1)},${(A[1] + (B[1] - A[1]) * fr).toFixed(1)}`)
      want -= d
      if (want <= 0) break
    }
    return out.join(' ')
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.17)_0%,transparent_70%)] blur-3xl"
        style={{ opacity: 0.4 + p * 0.5 }}
      />
      <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nbPcbCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#23445f" /><stop offset="55%" stopColor="#122536" /><stop offset="100%" stopColor="#0a151f" />
          </linearGradient>
          <linearGradient id="nbPcbPad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#17222f" /><stop offset="100%" stopColor="#0d151f" />
          </linearGradient>
          <filter id="nbPcbGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── ŚCIEŻKI OZDOBNE: krótkie odnogi bez układu, jak na realnym PCB ── */}
        <g opacity={Math.min(1, p * 2) * 0.4}>
          {[[-62, -1], [-14, -1], [62, -1], [-62, 1], [14, 1], [62, 1]].map((v, i) => {
            const [off, dir] = v as [number, number]
            const y0 = PCB_CY + dir * PCB_R
            const len = 30 + ((i * 29) % 4) * 22
            const t = Math.max(0, Math.min(1, (p - 0.03 - i * 0.025) / 0.3))
            if (t <= 0.01) return null
            return (
              <g key={`stub${i}`}>
                <line x1={PCB_CX + off} y1={y0} x2={PCB_CX + off} y2={y0 + dir * len * t} stroke="#38bdf8" strokeWidth={2.2} opacity={0.55} />
                <circle cx={PCB_CX + off} cy={y0 + dir * len * t} r={3.6} fill="none" stroke="#7dd3fc" strokeWidth={1.4} opacity={t} />
              </g>
            )
          })}
        </g>

        {/* ── ŚCIEŻKI DO UKŁADÓW ── */}
        <g>
          {PCB_MODS.map((m, i) => {
            const q = Math.max(0, Math.min(1, (p - m.at) / 0.26))
            const t = q * q * (3 - 2 * q)
            if (t <= 0.01) return null
            const pts = partial(route(m), t)
            const r0 = route(m)
            return (
              <g key={`tr${i}`}>
                <polyline points={pts} fill="none" stroke="#38bdf8" strokeWidth={6} opacity={0.13} strokeLinejoin="round" strokeLinecap="round" />
                <polyline points={pts} fill="none" stroke="#7dd3fc" strokeWidth={2} opacity={0.88} strokeLinejoin="round" strokeLinecap="round" />
                <circle cx={r0[1]![0]} cy={r0[1]![1]} r={3.4} fill="#07131f" stroke="#7dd3fc" strokeWidth={1.4} opacity={t} />
              </g>
            )
          })}
        </g>

        {/* ── UKŁADY ── */}
        {PCB_MODS.map((m) => {
          const q = Math.max(0, Math.min(1, (p - m.at - 0.13) / 0.22))
          const t = q * q * (3 - 2 * q)
          if (t <= 0.01) return null
          const x = m.axis === 'h' ? (m.dir === -1 ? m.padX - m.w : m.padX) : m.padX - m.w / 2
          const y = m.padY - PAD_H / 2
          return (
            <g key={m.t} opacity={t}>
              <rect x={x} y={y} width={m.w} height={PAD_H} rx={6} fill="url(#nbPcbPad)" stroke="#7dd3fc" strokeWidth={1.7} />
              {[-0.3, 0, 0.3].map((u) => (
                m.axis === 'h' ? (
                  <line key={u} x1={m.padX} y1={m.padY + u * PAD_H} x2={m.padX + m.dir * 10} y2={m.padY + u * PAD_H} stroke="#9fb8cc" strokeWidth={2.2} opacity={0.8} />
                ) : (
                  <line key={u} x1={m.padX + u * m.w} y1={m.padY - m.dir * PAD_H / 2} x2={m.padX + u * m.w} y2={m.padY - m.dir * (PAD_H / 2 + 10)} stroke="#9fb8cc" strokeWidth={2.2} opacity={0.8} />
                )
              ))}
              <text x={x + m.w / 2} y={m.padY + 6} fill="#dcf0fd" fontSize={16} fontFamily="monospace" textAnchor="middle" letterSpacing="0.6">
                {m.t}
              </text>
            </g>
          )
        })}

        {/* ── RDZEŃ ── */}
        <g filter="url(#nbPcbGlow)">
          <rect x={PCB_CX - PCB_R} y={PCB_CY - PCB_R} width={PCB_R * 2} height={PCB_R * 2} rx={14}
            fill="url(#nbPcbCore)" stroke="#7dd3fc" strokeWidth={2.4} />
          <rect x={PCB_CX - PCB_R + 10} y={PCB_CY - PCB_R + 10} width={PCB_R * 2 - 20} height={PCB_R * 2 - 20} rx={8}
            fill="none" stroke="#38bdf8" strokeWidth={1.1} strokeOpacity={0.4} />
        </g>
        <g opacity={0.85}>
          {[-52, -34, -16, 4, 22, 40, 58].map((d) => (
            <g key={`pin${d}`}>
              <line x1={PCB_CX - PCB_R} y1={PCB_CY + d} x2={PCB_CX - PCB_R - 11} y2={PCB_CY + d} stroke="#9fb8cc" strokeWidth={2.6} />
              <line x1={PCB_CX + PCB_R} y1={PCB_CY + d} x2={PCB_CX + PCB_R + 11} y2={PCB_CY + d} stroke="#9fb8cc" strokeWidth={2.6} />
              <line x1={PCB_CX + d} y1={PCB_CY - PCB_R} x2={PCB_CX + d} y2={PCB_CY - PCB_R - 11} stroke="#9fb8cc" strokeWidth={2.6} />
              <line x1={PCB_CX + d} y1={PCB_CY + PCB_R} x2={PCB_CX + d} y2={PCB_CY + PCB_R + 11} stroke="#9fb8cc" strokeWidth={2.6} />
            </g>
          ))}
        </g>

        {/* Prawdziwy znak NextByte na rdzeniu (viewBox ikony 278.5 45.5 642 775) */}
        <g transform={`translate(${PCB_CX} ${PCB_CY}) scale(0.104) translate(-599.5 -433)`} fill="#e6f6ff">
          <path d="M299,65.5 L298,225 L900,800.5 L900,641 Z" />
          <path d="M784,68 L900,68 L900,460 L784,460 Z" />
          <path d="M299,264 L416,377 L415,797 L298,797 Z" />
          <path d="M900,489 L784.5,490 L900,600.5 Z" />
        </g>

        <g className="hidden sm:block" opacity={Math.min(1, p * 3)}>
          <text x={28} y={604} fill="#64748b" fontSize={12} fontFamily="monospace" letterSpacing="1">
            {`PODŁĄCZONE MODUŁY ${PCB_MODS.filter((m) => p > m.at + 0.13).length} / ${PCB_MODS.length}`}
          </text>
        </g>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SZKIELET MODUŁÓW 03–06 (ASYSTENT, DEEP RESEARCH, AKADEMIA, WORKSPACE)
   ═══════════════════════════════════════════════════════════════════════ */

/** Miejsce na wizualizację modułu — trzyma dokładnie ten sam kadr
    (900 × 620) co gotowe moduły 01 i 02, więc podmiana nic nie przesunie. */
function ModuleVisualSlot({ num, tag }: { num: string; tag: string }) {
  return (
    <div className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[440px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.10)_0%,transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'linear-gradient(0deg, #38bdf8 1px, transparent 1px),' +
            'linear-gradient(90deg, #38bdf8 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse at center, #000 25%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 25%, transparent 72%)',
        }}
      />
      <div className="absolute inset-8 rounded-2xl border border-dashed border-primary/[0.14]">
        <TechCornerMarks />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-primary/45">{num}</span>
        <span className="font-heading text-[15px] font-light uppercase tracking-[0.16em] text-foreground/30">{tag}</span>
      </div>
    </div>
  )
}

type ModuleCopy = {
  id: string
  num: string
  tag: string
  titleLead: string
  titleAccent: string
  lead: string
  bullets: string[]
  cta: string
  visualLeft?: boolean
}

/** Wspólny układ zigzag dla modułów. Kolumna tekstu zawsze idzie pierwsza
    w DOM (czytelność na mobile), a na `lg` przestawia ją `order`. */
function ModuleZigzagSection({
  copy, onNavigate, visual,
}: {
  copy: ModuleCopy
  onNavigate: (p: HomePageId) => void
  visual?: ReactNode
}) {
  const left = copy.visualLeft
  return (
    <div className="relative z-10 overflow-visible py-8 sm:py-12">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">

        {/* KOLUMNA TEKSTU */}
        <div className={cn('lg:col-span-5 text-left space-y-5', left && 'lg:order-2')}>
          <div className="space-y-2">
            <SecRule label={`${copy.num} // ${copy.tag}`} />
            <h2 className="font-heading text-[clamp(28px,4vw,48px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
              {copy.titleLead} <br className="hidden sm:block" />
              <span className="font-normal text-primary">{copy.titleAccent}</span>
            </h2>
            <p className="font-sans text-[15px] font-light leading-relaxed text-foreground/70">
              {copy.lead}
            </p>
          </div>

          <div className="space-y-2.5 pt-1 font-sans">
            {copy.bullets.map((bullet) => (
              <div key={bullet} className="flex items-center gap-2.5 text-[13.5px] font-light text-foreground/80">
                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <GlowButton size="lg" onClick={() => onNavigate('cennik')}>
              {copy.cta}
            </GlowButton>
          </div>
        </div>

        {/* KOLUMNA WIZUALIZACJI */}
        <div className={cn(
          'lg:col-span-7 flex flex-col items-center justify-center relative select-none',
          left && 'lg:order-1',
        )}>
          {visual ?? <ModuleVisualSlot num={copy.num} tag={copy.tag} />}
        </div>

      </div>
    </div>
  )
}

/* Moduły 03–07: opisy przy animacjach — zwięzłe nagłówki i czysty język korzyści */
const MODULE_COPY: ModuleCopy[] = [
  {
    id: 'assistant',
    num: '03',
    tag: 'ASYSTENT AI',
    titleLead: 'Jeden asystent',
    titleAccent: 'do całej Twojej pracy',
    lead: 'Pracuje w czacie, notatkach, kalendarzu i na tablicach. Wykonuje zadania tam, gdzie jesteś, bez przełączania okien.',
    bullets: [
      'Obecny w każdym module platformy',
      'Tworzy notatki i dokumenty z Twoich ustaleń',
      "Sam wpisuje spotkania i deadline'y do kalendarza",
      'Rozumie kontekst Twojej pracy',
    ],
    cta: 'Poznaj Asystenta AI',
    visualLeft: true,
  },
  {
    id: 'research',
    num: '04',
    tag: 'DEEP RESEARCH',
    titleLead: 'Zrób research',
    titleAccent: 'w parę minut',
    lead: 'Przeszukuje cały internet, zbiera dziesiątki źródeł naraz, sprawdza fakty i oddaje gotowy raport z tabelami i linkami.',
    bullets: [
      'Przeszukuje cały internet i dziesiątki źródeł naraz',
      'Każdy fakt sprawdzony w kilku źródłach',
      'Wnioski i tabele zamiast ściany linków',
      'Linki źródłowe do szybkiego sprawdzenia',
    ],
    cta: 'Uruchom Deep Research',
    visualLeft: false,
  },
  {
    id: 'academy',
    num: '05',
    tag: 'AKADEMIA I PANEL TWÓRCY',
    titleLead: 'Akademia AI',
    titleAccent: 'i Panel Twórcy',
    lead: 'Ucz się praktycznej wiedzy z gotowych kursów od twórców albo publikuj własne materiały i na nich zarabiaj.',
    bullets: [
      'Zero teorii, kursy skupione na efektywności',
      'Gotowe szablony i prompty zamiast suchej teorii',
      'Zarabiasz na tym, co już umiesz',
      'Wypłata zysków w PLN z fakturą VAT 23%',
    ],
    cta: 'Wejdź do Akademii',
    visualLeft: true,
  },
  {
    id: 'memory',
    num: '06',
    tag: 'PAMIĘĆ AI',
    titleLead: 'AI, która pamięta',
    titleAccent: 'kim jesteś',
    lead: 'Platforma pamięta Twój styl, produkty i ustalenia z projektów. Wszystkie moduły korzystają z tej samej wiedzy.',
    bullets: [
      'Zna Twoje dane i dopasowuje każdą odpowiedź',
      'Nie tłumaczysz od nowa, kim jesteś i nad czym pracujesz',
      'Cała pamięć na jednej liście, bez tajemnic',
      'Ty decydujesz, co zostaje w pamięci',
    ],
    cta: 'Zobacz Pamięć AI',
  },
  {
    id: 'workspace',
    num: '07',
    tag: 'ZINTEGROWANY WORKSPACE',
    titleLead: 'Wszystkie narzędzia',
    titleAccent: 'Jeden panel',
    lead: 'Czat, grafika, wideo, notatki, kalendarz i tablice w jednym oknie. Wynik z jednego narzędzia od razu działa w kolejnym.',
    bullets: [
      'Jedna platforma zamiast pięciu subskrypcji',
      'Pliki i dane same przechodzą między modułami',
      'Jedna polska faktura zamiast kilku płatności w USD',
      'Serwery w UE i wsparcie po polsku',
    ],
    cta: 'Zacznij za darmo',
    visualLeft: true,
  },
]

/* ═══════════════════════════════════════════════════════════════════════
   GÓRNY NAVBAR STRONY GŁÓWNEJ (1:1 Z STRONA GŁÓWNA)
   ═══════════════════════════════════════════════════════════════════════ */
function LandingNavbar({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const items: { label: string; id: HomePageId }[] = [
    { label: 'Strona główna', id: 'home' },
    { label: 'Cennik', id: 'cennik' },
    { label: 'Dla firm', id: 'b2b' },
    { label: 'Historia', id: 'historia' },
  ]

  const navRef = useRef<HTMLDivElement>(null)

  // Dół tego navbara = "góra strony" dla scroll-snapa i wyliczeń wycentrowania
  // modułów (--nb-navbar-h w :root, patrz index.css `scroll-padding-top`).
  useEffect(() => {
    const el = navRef.current
    if (!el) return
    const sync = () => {
      document.documentElement.style.setProperty('--nb-navbar-h', `${el.getBoundingClientRect().height}px`)
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={navRef} data-navbar className="sticky top-0 z-50 w-full shrink-0 border-b border-foreground/[0.06] bg-background/92 backdrop-blur-md">
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 h-12 overflow-x-auto">
        {items.map((item) => {
          const aktywna = item.id === 'home'
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id !== 'home') {
                  onNavigate(item.id)
                }
              }}
              className={cn(
                'h-8 shrink-0 whitespace-nowrap px-2.5 sm:px-4 rounded-lg font-sans text-[12px] sm:text-[13px] font-medium transition-all duration-200 cursor-pointer',
                aktywna
                  ? 'bg-primary/15 border border-primary/30 text-primary'
                  : 'text-foreground/45 hover:text-foreground/75 hover:bg-foreground/[0.05]',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   GŁÓWNY KOMPONENT: HomePage3 (KOMPLETNY, ZBALANSOWANY LEJEK 10 SEKCJI)
   ═══════════════════════════════════════════════════════════════════════ */
export function HomePage3({ onNavigate = () => { } }: { onNavigate?: (p: HomePageId) => void }) {
  return (
    <div className="relative flex w-full flex-col font-landing text-foreground">
      <LandingNavbar onNavigate={onNavigate} />
      <AnimStyles />
      <BlockAnimStyles />
      <PageAmbience />

      {/* ══════════ 1. HERO + JEDYNA KARUZELA (MODEL ECOSYSTEM BRIDGE) ══════════ */}
      {/* Fale podciągnięte pod sticky navbar (ujemny margines o jego wysokość) —
          navbar (półprzezroczysty, z blurem) siedzi WIZUALNIE na falach, a nie
          na czystym tle. Padding sekcji poniżej odzyskuje tę wysokość i dokłada
          trochę więcej odstępu nad nagłówkiem. */}
      <div className="relative overflow-hidden" style={{ marginTop: 'calc(var(--nb-navbar-h, 49px) * -1)' }}>
        <HeroWispyBackground />

        <section className="relative pt-[130px] sm:pt-[160px]">
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
            <FadeIn>
              <h1 className="font-heading text-[clamp(32px,5.2vw,72px)] font-normal leading-[1.04] tracking-[-0.035em]">
                <span className="block text-primary drop-shadow-[0_0_40px_rgba(105,179,240,0.4)]">NextByte

                </span>
                <span className="block text-foreground sm:whitespace-nowrap">Twoje AI w&nbsp;jednym miejscu.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={60}>
              <p className="mt-[22px] max-w-2xl font-sans text-[16px] font-light leading-[1.6] text-foreground/70">
                Topowe modele AI, studio grafik 4K i inteligentny asystent pod ręką. Jeden prosty panel zamiast pięciu subskrypcji.
              </p>
            </FadeIn>

            <FadeIn delay={100}>
              <div className="mt-[30px] flex flex-col items-center gap-3.5 sm:flex-row">
                <GlowButton size="lg" onClick={() => onNavigate('cennik')}>Rozpocznij za darmo </GlowButton>
                <GhostButton size="lg" onClick={() => onNavigate('cennik')}>Zobacz cennik i pakiety</GhostButton>
              </div>
            </FadeIn>

            {/* JEDYNA KARUZELA NA CAŁEJ STRONIE */}
            <FadeIn delay={140} className="w-full">
              <ModelEcosystemBridge />
            </FadeIn>
          </div>
        </section>

        {/* ══════════ 2. JEDNA PLATFORMA: ZUNIFIKOWANY RDZEŃ AI ══════════ */}
        <Section className="relative z-10 py-12 sm:py-16">
          <FadeIn>
            <UnifiedAIPlatformConvergence onNavigate={onNavigate} />
          </FadeIn>
        </Section>
      </div>

      <TechDivider />

      {/* ══════════ 3. MODUŁ 01: CHAT AI (ZIGZAG 3D EXPLODED HUD) ══════════ */}
      <div id="modele">
        <LazyBlock minHeight={860}>
          <Section className="relative z-10 py-4 sm:py-8">
            <FadeIn>
              <Module01ChatAiZigzagSection onNavigate={onNavigate} />
            </FadeIn>
          </Section>
        </LazyBlock>
      </div>

      <TechDivider />

      {/* ══════════ 4. MODUŁ 02: OBRAZY I WIDEO (ZDJĘCIA & WIDEO AI) ══════════ */}
      <div id="studio">
        <LazyBlock minHeight={860}>
          <Section className="relative z-10 py-4 sm:py-8">
            <FadeIn>
              <Module02VisualCreationZigzagSection onNavigate={onNavigate} />
            </FadeIn>
          </Section>
        </LazyBlock>
      </div>

      {/* ══════════ 5. MODUŁY 03–06: ASYSTENT, DEEP RESEARCH, AKADEMIA, WORKSPACE ══════════ */}
      {MODULE_COPY.map((copy) => (
        <div key={copy.id} id={copy.id === 'assistant' ? 'asystent' : copy.id}>
          <TechDivider />
          <LazyBlock minHeight={820}>
            <Section className="relative z-10 py-4 sm:py-8">
              <FadeIn>
                <ModuleZigzagSection
                  copy={copy}
                  onNavigate={onNavigate}
                  visual={
                    copy.id === 'assistant' ? <AssistantOrbitVisual />
                      : copy.id === 'research' ? <DeepResearchVisual />
                        : copy.id === 'academy' ? <AcademyVisual />
                          : copy.id === 'memory' ? <MemoryVisual />
                            : copy.id === 'workspace' ? <WorkspaceVisual />
                              : undefined
                  }
                />
              </FadeIn>
            </Section>
          </LazyBlock>
        </div>
      ))}

      <TechDivider />

      {/* ══════════ 6. BEZPIECZEŃSTWO DANYCH (AES-256 & BRAK TRENOWANIA) ══════════ */}
      <div id="bezpieczenstwo">
        <LazyBlock minHeight={720}><DataSecuritySection onNavigate={onNavigate} /></LazyBlock>
      </div>

      <TechDivider />

      {/* ══════════ 7. BEZPIECZEŃSTWO SERWERÓW (ARCHITEKTURA UE & RODO) ══════════ */}
      <LazyBlock minHeight={780}><ServerSecuritySection onNavigate={onNavigate} /></LazyBlock>

      <TechDivider />

      {/* ══════════ 8. PRYWATNOŚĆ — AI LOKALNE (0 ZŁ / BEZ INTERNETU) ══════════ */}
      <LazyBlock minHeight={1080}><PrivacyLocalAISection /></LazyBlock>

      <TechDivider />

      {/* ══════════ 9. PREZENTACJA WIDEO PLATFORMY (VIMEO EMBED) ══════════ */}
      <div id="wideo">
        <LazyBlock minHeight={720}><PlatformVideoSection onNavigate={onNavigate} /></LazyBlock>
      </div>

      <TechDivider />

      {/* ══════════ 10. TRZY FILARY WARTOŚCI ══════════ */}
      <LazyBlock minHeight={760}><ThreePillarsSection /></LazyBlock>

      <TechDivider />

      {/* ══════════ 10. WDROŻENIE W 3 KROKACH — PROCES W DÓŁ ══════════ */}
      <LazyBlock minHeight={900}><ThreeStepsSection onNavigate={onNavigate} /></LazyBlock>

      <TechDivider />

      {/* ══════════ 11. PORÓWNANIE Z OSOBNYMI SUBSKRYPCJAMI ══════════ */}
      <LazyBlock minHeight={560}><ComparisonSection onNavigate={onNavigate} /></LazyBlock>

      <TechDivider />

      {/* ══════════ 12. BAZA WIEDZY I FAQ ══════════ */}
      <LazyBlock minHeight={950}><FaqSection onNavigate={onNavigate} /></LazyBlock>

      {/* ══════════ 13. FINALNE CTA — KONWERGENCJA ══════════ */}
      <LazyBlock minHeight={720}><FinalCtaSection onNavigate={onNavigate} /></LazyBlock>
    </div>
  )
}
