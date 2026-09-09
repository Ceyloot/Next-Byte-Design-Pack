import { useState, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Mic, Camera, Video, NotebookPen } from 'lucide-react'
import {
  Section, GlowButton, GhostButton,
  PageAmbience, AnimStyles, FadeIn,
  TechDivider, TechCornerMarks,
} from '@/sections/wspolne/shared'
import { ModelEcosystemBridge, SecRule } from './bloki-wspolne'
import {
  OpenAIIcon, AnthropicIcon, XaiIcon, GeminiIcon, NextByteMarkIcon,
} from '@/grafiki/znaki-marek'
import {
  BlockAnimStyles, LazyBlock,
  PlatformVideoSection,
  DataSecuritySection, ServerSecuritySection, PrivacyLocalAISection,
  ThreePillarsSection, ThreeStepsSection, ComparisonSection,
  FaqSection, FinalCtaSection,
} from './StronaGlownaBloki'
import {
  ElevenLabsIcon, KlingIcon, RunwareIcon,
  BananaIcon, PixVerseIcon, MiniMaxIcon,
} from '@/grafiki/znaki-marek'
import type { HomePage as HomePageId } from './types'

import interiorImg from '@/assets/studio/interior.jpg'
import carImg from '@/assets/studio/car.jpg'
import landscapeImg from '@/assets/studio/landscape.jpg'
import animalImg from '@/assets/studio/animal.jpg'
import { getNavbarOffset, ton, tonAkc, D2R, CAM, RING, DIAL, circleToEllipse, silhouette, makeScene, useScrollProgress, type V3 } from '@/grafiki/podstawy'
import { AssistantOrbitVisual, DeepResearchVisual, AcademyVisual, MemoryVisual, WorkspaceVisual } from '@/grafiki/wizualizacje'
import { HeroWispyBackground } from '@/grafiki/tlo-hero'

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


/** Wspólny styl obramowań z poświatą */
export const GLOW_CARD = 'relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 backdrop-blur-sm'

export function glowStyle(color: string): { borderColor: string; boxShadow: string } {
  const border = `color-mix(in srgb, ${color} 45%, transparent)`
  const halo = `color-mix(in srgb, ${color} 22%, transparent)`
  return { borderColor: border, boxShadow: `0 0 10px -5px ${halo}` }
}

/* ── PALETA SCEN 3D — WYPROWADZONA Z MOTYWU ──────────────────────────
   Bryły (aparat, płyty modułów, płytka PCB) były malowane stałymi
   granatami i srebrami. Motyw przestawiał tekst i tło, a scena zostawała
   ta sama: w jasnym motywie czarna plama, w Luxury — niebieska mimo
   złotej marki.

   Teraz każdy ton bryły to punkt na JEDNEJ rampie rozpiętej między tłem
   a kolorem tekstu. Przy ciemnym motywie bryła jest ciemna z jasnymi
   refleksami; przy jasnym rampa odwraca się sama i scena czyta się jak
   rysunek techniczny na papierze. Refleksy barwne schodzą z --primary,
   więc scena przejmuje kolor motywu zamiast go ignorować. */







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
                      "absolute -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-xl flex items-center justify-center select-none transition-all duration-300 z-20 group cursor-pointer",
                      "border bg-card/90 backdrop-blur-md",
                      isHovered
                        ? "border-primary/80 scale-115 shadow-[0_0_20px_hsl(var(--primary)/0.45)] z-40"
                        : "border-foreground/[0.12] hover:border-primary/50 shadow-md"
                    )}
                    style={{ left: node.x, top: node.y }}
                  >
                    <span className="absolute top-1 left-1 text-[5px] font-mono text-primary/40 leading-none">┌</span>
                    <span className="absolute top-1 right-1 text-[5px] font-mono text-primary/40 leading-none">┐</span>
                    <span className="absolute bottom-1 left-1 text-[5px] font-mono text-primary/40 leading-none">└</span>
                    <span className="absolute bottom-1 right-1 text-[5px] font-mono text-primary/40 leading-none">┘</span>

                    <node.icon
                      className={cn(
                        "h-6 w-6 transition-all duration-300",
                        isHovered ? "text-primary scale-110 drop-shadow-[0_0_10px_hsl(var(--primary)/0.8)]" : "text-foreground/75 group-hover:text-primary"
                      )}
                    />

                    {/* CUSTOMOWY TOOLTIP CAD (HUD) */}
                    {isHovered && (
                      <div
                        className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 whitespace-nowrap rounded-lg border border-primary/50 bg-card/95 px-2.5 py-1.5 text-foreground backdrop-blur-xl shadow-[0_4px_24px_hsl(var(--background)/0.85),0_0_16px_hsl(var(--primary)/0.3)] transition-all duration-200"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                        <span className="font-heading text-[12.5px] font-semibold text-foreground tracking-[-0.2px]">
                          {node.name}
                        </span>
                        <span className="font-mono text-[10px] font-medium text-primary tracking-wide">
                          // {node.sub}
                        </span>
                        <span className="absolute -top-1 -left-1 text-[6px] font-mono text-primary/40 leading-none">┌</span>
                        <span className="absolute -top-1 -right-1 text-[6px] font-mono text-primary/40 leading-none">┐</span>
                        <span className="absolute -bottom-1 -left-1 text-[6px] font-mono text-primary/40 leading-none">└</span>
                        <span className="absolute -bottom-1 -right-1 text-[6px] font-mono text-primary/40 leading-none">┘</span>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* CENTRALNY PROCESOR NEXTBYTE (KWADRAT / SQUIRCLE) */}
              <div
                className={cn(
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] h-[76px] rounded-2xl",
                  "flex flex-col items-center justify-center p-2 text-center select-none group z-30 transition-all duration-300",
                  "border border-primary/60 bg-card/95 backdrop-blur-2xl",
                  "shadow-[0_0_40px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.55)]"
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
                      "absolute -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-xl flex items-center justify-center select-none transition-all duration-300 z-20 group cursor-pointer",
                      "border bg-card/90 backdrop-blur-md",
                      isHovered
                        ? "border-primary/80 scale-115 shadow-[0_0_20px_hsl(var(--primary)/0.45)] z-40"
                        : "border-foreground/[0.12] hover:border-primary/50 shadow-md"
                    )}
                    style={{ left: node.x, top: node.y }}
                  >
                    <span className="absolute top-1 left-1 text-[5px] font-mono text-primary/40 leading-none">┌</span>
                    <span className="absolute top-1 right-1 text-[5px] font-mono text-primary/40 leading-none">┐</span>
                    <span className="absolute bottom-1 left-1 text-[5px] font-mono text-primary/40 leading-none">└</span>
                    <span className="absolute bottom-1 right-1 text-[5px] font-mono text-primary/40 leading-none">┘</span>

                    <node.icon
                      className={cn(
                        "h-6 w-6 transition-all duration-300",
                        isHovered ? "text-primary scale-110 drop-shadow-[0_0_10px_hsl(var(--primary)/0.8)]" : "text-foreground/75 group-hover:text-primary"
                      )}
                    />

                    {/* CUSTOMOWY TOOLTIP CAD (HUD) */}
                    {isHovered && (
                      <div
                        className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 whitespace-nowrap rounded-lg border border-primary/50 bg-card/95 px-2.5 py-1.5 text-foreground backdrop-blur-xl shadow-[0_4px_24px_hsl(var(--background)/0.85),0_0_16px_hsl(var(--primary)/0.3)] transition-all duration-200"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                        <span className="font-heading text-[12.5px] font-semibold text-foreground tracking-[-0.2px]">
                          {node.name}
                        </span>
                        <span className="font-mono text-[10px] font-medium text-primary tracking-wide">
                          // {node.sub}
                        </span>
                        <span className="absolute -top-1 -left-1 text-[6px] font-mono text-primary/40 leading-none">┌</span>
                        <span className="absolute -top-1 -right-1 text-[6px] font-mono text-primary/40 leading-none">┐</span>
                        <span className="absolute -bottom-1 -left-1 text-[6px] font-mono text-primary/40 leading-none">└</span>
                        <span className="absolute -bottom-1 -right-1 text-[6px] font-mono text-primary/40 leading-none">┘</span>
                      </div>
                    )}
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
        {/* `overflow-hidden` przycina dwie dekoracje niżej: poświatę 540 px
            i siatkę CAD 560 px. Obie są wyśrodkowane przez `left-1/2`, więc
            przy oknie 375 px wychodziły 106 px poza ekran i dawały CAŁEJ
            stronie przewijanie w poziomie. Przycinamy u źródła, a nie na
            korzeniu strony — `overflow-x` na korzeniu psuje `position: sticky`
            paska nawigacji. */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none order-2 lg:order-1 overflow-hidden">

          {/* Subtelna kwantowa poświata w tle */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.18)_0%,transparent_70%)] blur-3xl opacity-80"
          />

          {/* PERSPEKTYWICZNA SIATKA PODŁOŻA CAD */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-56 w-[560px] opacity-[0.14]"
            style={{
              backgroundImage:
                'linear-gradient(30deg, hsl(var(--primary)) 1px, transparent 1px),' +
                'linear-gradient(150deg, hsl(var(--primary)) 1px, transparent 1px)',
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
                  <stop offset="0%" stopColor={ton(12)} stopOpacity="0.96" />
                  <stop offset="50%" stopColor={ton(9)} stopOpacity="0.98" />
                  <stop offset="100%" stopColor={ton(6)} stopOpacity="1" />
                </linearGradient>

                <linearGradient id="chipBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={ton(8)} />
                  <stop offset="100%" stopColor={ton(5)} />
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
                  <g opacity={scrollProgress * 0.75} stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="3 3">
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
                        fill={ton(8)}
                        stroke="hsl(var(--primary))"
                        strokeWidth="2.5"
                      />
                      <circle cx="0" cy="-2" r="4.5" fill="hsl(var(--primary))" />
                      <rect x="-2.5" y="-2" width="5" height="10" rx="1.5" fill="hsl(var(--primary))" />
                    </g>
                  ),
                },
                {
                  id: 'w3-context',
                  offsetMul: 1,
                  icon: (
                    /* 04 // WSPÓLNY KONTEKST I PAMIĘĆ - RDZEŃ PAMIĘCI 3D */
                    <g transform="scale(1, 0.5416) rotate(-45)">
                      <rect x="-18" y="-18" width="36" height="36" rx="8" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="2.5" />
                      <circle cx="-26" cy="-26" r="3" fill="hsl(var(--primary))" />
                      <circle cx="26" cy="-26" r="3" fill="hsl(var(--primary))" />
                      <circle cx="26" cy="26" r="3" fill="hsl(var(--primary))" />
                      <circle cx="-26" cy="26" r="3" fill="hsl(var(--primary))" />
                      <line x1="-18" y1="-18" x2="-24" y2="-24" stroke="hsl(var(--primary))" strokeWidth="2" />
                      <line x1="18" y1="-18" x2="24" y2="-24" stroke="hsl(var(--primary))" strokeWidth="2" />
                      <line x1="18" y1="18" x2="24" y2="24" stroke="hsl(var(--primary))" strokeWidth="2" />
                      <line x1="-18" y1="18" x2="-24" y2="24" stroke="hsl(var(--primary))" strokeWidth="2" />
                      <text x="0" y="5" fill={ton(100)} fontSize="11" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">CTX</text>
                    </g>
                  ),
                },
                {
                  id: 'w2-reasoning',
                  offsetMul: 0,
                  icon: (
                    /* 03 // ROZUMOWANIE & PERSONY - SUWAKI I KONTROLA STYLU 3D */
                    <g transform="scale(1, 0.5416) rotate(-45)">
                      <rect x="-24" y="-20" width="48" height="40" rx="6" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="2.5" />
                      <line x1="-16" y1="-7" x2="16" y2="-7" stroke="hsl(var(--primary))" strokeWidth="2" strokeOpacity="0.4" />
                      <circle cx="5" cy="-7" r="4.5" fill="hsl(var(--primary))" />
                      <line x1="-16" y1="7" x2="16" y2="7" stroke="hsl(var(--primary))" strokeWidth="2" strokeOpacity="0.4" />
                      <circle cx="-6" cy="7" r="4.5" fill="hsl(var(--primary))" />
                      <circle cx="-16" cy="-7" r="1.5" fill="hsl(var(--primary))" />
                      <circle cx="16" cy="-7" r="1.5" fill="hsl(var(--primary))" />
                      <circle cx="-16" cy="7" r="1.5" fill="hsl(var(--primary))" />
                      <circle cx="16" cy="7" r="1.5" fill="hsl(var(--primary))" />
                    </g>
                  ),
                },
                {
                  id: 'w1-docs',
                  offsetMul: -1,
                  icon: (
                    /* 02 // MULTIMODAL & DOKUMENTY - ARKUSZ 3D */
                    <g transform="scale(1, 0.5416) rotate(-45)">
                      <rect x="-18" y="-24" width="36" height="48" rx="5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="2.5" />
                      <path d="M 6 -24 L 18 -12 L 6 -12 Z" fill="hsl(var(--primary))" fillOpacity="0.4" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                      <line x1="-11" y1="-14" x2="1" y2="-14" stroke="hsl(var(--primary))" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="-11" y1="-4" x2="11" y2="-4" stroke="hsl(var(--primary))" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="-11" y1="6" x2="11" y2="6" stroke="hsl(var(--primary))" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="-11" y1="16" x2="5" y2="16" stroke="hsl(var(--primary))" strokeWidth="2.2" strokeLinecap="round" />
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
                        fill="hsl(var(--primary))"
                        fillOpacity="0.25"
                        filter="url(#laserGlow)"
                      />

                      {/* ──────────────── 12 ŚCIEŻEK KRZEMOWYCH Z TERMINALAMI ──────────────── */}
                      {/* GÓRNE 3 ŚCIEŻKI */}
                      <line x1="0" y1="-28" x2="0" y2="-44" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="0" cy="-46" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      <path d="M -16 -28 L -16 -36 L -28 -36 L -28 -44" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="-28" cy="-46" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      <path d="M 16 -28 L 16 -36 L 28 -36 L 28 -44" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="28" cy="-46" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      {/* DOLNE 3 ŚCIEŻKI */}
                      <line x1="0" y1="28" x2="0" y2="44" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="0" cy="46" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      <path d="M -16 28 L -16 36 L -28 36 L -28 44" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="-28" cy="46" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      <path d="M 16 28 L 16 36 L 28 36 L 28 44" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="28" cy="46" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      {/* LEWE 3 ŚCIEŻKI */}
                      <line x1="-28" y1="0" x2="-44" y2="0" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="-46" cy="0" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      <path d="M -28 -16 L -36 -16 L -36 -28 L -44 -28" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="-46" cy="-28" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      <path d="M -28 16 L -36 16 L -36 28 L -44 28" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="-46" cy="28" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      {/* PRAWE 3 ŚCIEŻKI */}
                      <line x1="28" y1="0" x2="44" y2="0" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="46" cy="0" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      <path d="M 28 -16 L 36 -16 L 36 -28 L 44 -28" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="46" cy="-28" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      <path d="M 28 16 L 36 16 L 36 28 L 44 28" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="46" cy="28" r="4.5" fill={ton(8)} stroke="hsl(var(--primary))" strokeWidth="3" />

                      {/* ──────────────── CENTRALNY KWADRAT CHIPA Z ZAOKRĄGLONYMI ROGAMI ──────────────── */}
                      <rect
                        x="-28"
                        y="-28"
                        width="56"
                        height="56"
                        rx="12"
                        fill={ton(8)}
                        stroke="hsl(var(--primary))"
                        strokeWidth="3.2"
                      />

                      {/* Pogrubiony napis AI leżący idealnie w płaszczyźnie izometrycznej */}
                      <text
                        x="0"
                        y="9"
                        fill={ton(100)}
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
                      stroke="hsl(var(--primary)/0.25)"
                      strokeWidth="1"
                    />

                    {/* Górna powierzchnia izometryczna płytki krzemowej */}
                    <path
                      d={`M ${cx} ${cy - 65} L ${cx + 120} ${cy} L ${cx} ${cy + 65} L ${cx - 120} ${cy} Z`}
                      fill="url(#chipTopGrad)"
                      stroke={isTop ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
                      strokeOpacity={isTop ? 0.95 : 0.25}
                      strokeWidth={isTop ? 2.2 : 1}
                      filter={isTop ? "url(#laserGlow)" : undefined}
                    />

                    {/* NITKI ELEKTRONICZNE (Silicon Bus Traces biegnące do krawędzi) */}
                    <path
                      d={`M ${cx - 90} ${cy} L ${cx - 45} ${cy - 25} L ${cx} ${cy - 52} L ${cx + 45} ${cy - 25} L ${cx + 90} ${cy}`}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeOpacity={isTop ? 0.45 : 0.15}
                      strokeWidth="1.2"
                    />
                    <path
                      d={`M ${cx - 90} ${cy} L ${cx - 45} ${cy + 25} L ${cx} ${cy + 52} L ${cx + 45} ${cy + 25} L ${cx + 90} ${cy}`}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeOpacity={isTop ? 0.45 : 0.15}
                      strokeWidth="1.2"
                    />

                    {/* Narożne punkty lutownicze */}
                    <circle cx={cx - 105} cy={cy} r="2.5" fill="hsl(var(--primary))" fillOpacity={isTop ? 0.9 : 0.4} />
                    <circle cx={cx + 105} cy={cy} r="2.5" fill="hsl(var(--primary))" fillOpacity={isTop ? 0.9 : 0.4} />
                    <circle cx={cx} cy={cy - 52} r="2.5" fill="hsl(var(--primary))" fillOpacity={isTop ? 0.9 : 0.4} />
                    <circle cx={cx} cy={cy + 52} r="2.5" fill="hsl(var(--primary))" fillOpacity={isTop ? 0.9 : 0.4} />

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
                stroke="hsl(var(--primary))"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.12) * 1.5))}
              />
              <circle cx="170" cy="42" r="3" fill="hsl(var(--primary))" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.12) * 1.5))} />

              {/* 2. Prawa góra -> Multimodal & Pliki (Wafer 1) */}
              <line
                x1="570"
                y1="127"
                x2={370 - 1 * sepX + 120}
                y2={290 - 1 * sepY}
                stroke="hsl(var(--primary))"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.20) * 1.5))}
              />
              <circle cx="570" cy="127" r="3" fill="hsl(var(--primary))" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.20) * 1.5))} />

              {/* 3. Lewy środek -> Dopasowanie Czatu (Wafer 2) */}
              <line
                x1="170"
                y1="282"
                x2={370 - 120}
                y2={290}
                stroke="hsl(var(--primary))"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.28) * 1.5))}
              />
              <circle cx="170" cy="282" r="3" fill="hsl(var(--primary))" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.28) * 1.5))} />

              {/* 4. Prawa dół -> Wspólny Kontekst (Wafer 3) */}
              <line
                x1="570"
                y1="397"
                x2={370 + 1 * sepX + 120}
                y2={290 + 1 * sepY}
                stroke="hsl(var(--primary))"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.36) * 1.5))}
              />
              <circle cx="570" cy="397" r="3" fill="hsl(var(--primary))" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.36) * 1.5))} />

              {/* 5. Lewy dół -> Prywatność & RODO (Wafer 4) */}
              <line
                x1="170"
                y1="502"
                x2={370 + 2 * sepX - 120}
                y2={290 + 2 * sepY}
                stroke="hsl(var(--primary))"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.44) * 1.5))}
              />
              <circle cx="170" cy="502" r="3" fill="hsl(var(--primary))" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.44) * 1.5))} />
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
                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.8)]" />
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
    const st = o.stroke ?? tonAkc(55, 15)
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
        {Ring(z0, bore, { fill: 'none', stroke: tonAkc(21, 12), strokeWidth: 1.6, strokeOpacity: 0.8 })}
        {Annulus(z1, r, bore, { fill: o.cap, stroke: st, strokeWidth: sw })}
      </>
    )
  }

  /** Walec pionowy (pokrętła na płycie). */
  const VTube = (x: number, z: number, y0: number, y1: number, r: number, band: string, cap: string, st = tonAkc(68, 15), sw = 1.1) => {
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
  const Knurl = (z0: number, z1: number, r: number, n: number, color = tonAkc(63, 13)) => {
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
        {Ring(zb, r, { fill: 'none', stroke: tonAkc(78, 47), strokeWidth: 1, strokeOpacity: 0.32 })}
        <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke={tonAkc(81, 36)} strokeWidth={1.2} strokeOpacity={0.55} />
        <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} stroke={tonAkc(81, 36)} strokeWidth={1.2} strokeOpacity={0.55} />
        {Ring(zf, r, { fill, fillOpacity: 0.34, stroke: tonAkc(81, 36), strokeWidth: 1.5 })}
        {Ring(zf, r * 0.84, { fill: 'none', stroke: tonAkc(94, 11), strokeWidth: 0.8, strokeOpacity: 0.3 })}
        <ellipse
          cx={0} cy={0} rx={r * RING.rx * S * 0.30} ry={r * RING.ry * S * 0.11}
          transform={`translate(${hi.x.toFixed(1)} ${hi.y.toFixed(1)}) rotate(${(RING.rot + 24).toFixed(1)})`}
          fill={ton(100)} opacity={0.4}
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
      edges.push(<line key={`ib${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="hsl(var(--primary))" strokeWidth={0.9} opacity={0.45} />)
    }
    return (
      <g opacity={o}>
        {Tube(z - 5, z + 5, r, { band: 'url(#nbBarrel)', cap: tonAkc(11, 10), stroke: tonAkc(61, 17), sw: 1.3, bore: 0.93 })}
        {edges}
        <polygon points={hole.join(' ')} fill={tonAkc(7, 7)} fillOpacity={0.55} stroke="hsl(var(--primary))" strokeWidth={1.3} />
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
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="hsl(var(--primary))" strokeWidth={0.9} strokeDasharray="3 6" opacity={o * 0.35} />
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
              return <line key={`by${i}`} x1={q.x} y1={q.y} x2={w.x} y2={w.y} stroke={tonAkc(83, 8)} strokeWidth={2.6} opacity={0.6} />
            })}
          </>
        )
      } else if (t.id === 'T2') {
        inner = (
          <>
            {Knurl(z0 + 3, z1 - 3, t.r, 46, tonAkc(45, 15))}
          </>
        )
      } else if (t.id === 'T3') {
        inner = (
          <>
            {Knurl(z0 + 4, z1 - 4, t.r, 64, tonAkc(63, 13))}
            {Ring(z1 - 4, t.r * 1.01, { fill: 'none', stroke: tonAkc(83, 8), strokeWidth: 1, strokeOpacity: 0.4 })}
          </>
        )
      } else if (t.id === 'T4') {
        inner = (
          <>
            {Knurl(z0 + 3, z1 - 3, t.r, 54, tonAkc(63, 13))}
          </>
        )
      } else {
        inner = (
          <>
            {Ring(z1, t.r * 0.90, { fill: 'none', stroke: tonAkc(83, 8), strokeWidth: 2.4, strokeOpacity: 0.55 })}
          </>
        )
      }

      return {
        d: dep(0, 0, zc),
        node: (
          <g key={t.id}>
            {Tube(z0, z1, t.r, {
              band: t.id === 'T5' ? 'url(#nbBezel)' : 'url(#nbBarrel)',
              cap: 'url(#nbCap)', stroke: tonAkc(61, 17), sw: 1.4,
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
                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.8)]" />
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
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.13)_0%,transparent_70%)] blur-3xl"
            style={{ opacity: 0.5 + p * 0.4 }}
          />

          <div ref={stageRef} className="relative w-full max-w-[900px] aspect-[900/620]">
            <svg viewBox="0 0 900 620" className="absolute inset-0 h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nbSkinF" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={tonAkc(15, 9)} /><stop offset="55%" stopColor={tonAkc(9, 6)} /><stop offset="100%" stopColor={ton(6)} />
                </linearGradient>
                <linearGradient id="nbSkinS" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={tonAkc(11, 8)} /><stop offset="100%" stopColor={ton(6)} />
                </linearGradient>
                <linearGradient id="nbSkinT" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={tonAkc(17, 9)} /><stop offset="100%" stopColor={ton(8)} />
                </linearGradient>
                <linearGradient id="nbMagT" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={tonAkc(88, 6)} /><stop offset="42%" stopColor={tonAkc(59, 12)} /><stop offset="100%" stopColor={tonAkc(29, 10)} />
                </linearGradient>
                <linearGradient id="nbMagF" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={tonAkc(67, 11)} /><stop offset="58%" stopColor={tonAkc(35, 11)} /><stop offset="100%" stopColor={tonAkc(20, 9)} />
                </linearGradient>
                <linearGradient id="nbMagS" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={tonAkc(46, 13)} /><stop offset="100%" stopColor={tonAkc(16, 8)} />
                </linearGradient>
                {/* Anodowany tubus — pas boczny walca oświetlony od góry */}
                <linearGradient id="nbBarrel" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={tonAkc(34, 15)} /><stop offset="15%" stopColor={tonAkc(64, 15)} />
                  <stop offset="35%" stopColor={tonAkc(17, 9)} /><stop offset="72%" stopColor={ton(7)} />
                  <stop offset="92%" stopColor={tonAkc(15, 8)} /><stop offset="100%" stopColor={tonAkc(27, 13)} />
                </linearGradient>
                <linearGradient id="nbBezel" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={tonAkc(38, 14)} /><stop offset="16%" stopColor={tonAkc(73, 12)} />
                  <stop offset="38%" stopColor={tonAkc(16, 8)} /><stop offset="74%" stopColor={ton(6)} />
                  <stop offset="94%" stopColor={tonAkc(16, 8)} /><stop offset="100%" stopColor={tonAkc(31, 11)} />
                </linearGradient>
                <linearGradient id="nbCap" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={tonAkc(22, 10)} /><stop offset="55%" stopColor={tonAkc(11, 8)} /><stop offset="100%" stopColor={ton(7)} />
                </linearGradient>
                <radialGradient id="nbGlassR" cx="34%" cy="26%" r="80%">
                  <stop offset="0%" stopColor={ton(100)} stopOpacity="0.75" />
                  <stop offset="40%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
                  <stop offset="100%" stopColor={ton(7)} stopOpacity="0.95" />
                </radialGradient>
                <radialGradient id="nbGlassF" cx="32%" cy="24%" r="82%">
                  <stop offset="0%" stopColor={ton(100)} stopOpacity="0.85" />
                  <stop offset="32%" stopColor="hsl(var(--primary))" stopOpacity="0.65" />
                  <stop offset="100%" stopColor={ton(6)} stopOpacity="0.95" />
                </radialGradient>
                <linearGradient id="nbSensor" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
                  <stop offset="45%" stopColor={ton(12)} />
                  <stop offset="100%" stopColor={ton(8)} />
                </linearGradient>
                <radialGradient id="nbFloor" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={tonAkc(6, 8)} stopOpacity="0.8" /><stop offset="100%" stopColor={tonAkc(6, 8)} stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* ── CIEŃ KONTAKTOWY ── */}
              {Disc(0, -86, 16, 128, { fill: 'url(#nbFloor)', opacity: 0.85 })}

              {/* ── 1. KLAPKA TYLNA (odjeżdża do tyłu) ── */}
              <g>
                {Trail(P3(0, 0, DOOR.z1), P3(0, 0, DOOR.z0 + zDoor), fade(0.08))}
                {Box(-DOOR.x, -DOOR.y, DOOR.z0 + zDoor, DOOR.x, DOOR.y, DOOR.z1 + zDoor,
                  'url(#nbSkinS)', 'url(#nbSkinT)', 'url(#nbSkinF)', tonAkc(31, 14), 1.2)}
                <g transform={plane(0, 0, DOOR.z1 + zDoor, ...FRONT)}>
                  <rect x={-74} y={-34} width={148} height={68} rx={4} fill={tonAkc(8, 6)} stroke={tonAkc(18, 11)} strokeWidth={0.8} />
                  <rect x={-58} y={-22} width={116} height={44} rx={3} fill="none" stroke="hsl(var(--primary))" strokeWidth={0.5} strokeOpacity={0.28} strokeDasharray="3 3" />
                </g>
              </g>

              {/* ── 2. PŁYTKA MATRYCY 4K CMOS (do tyłu i w dół) — rysowana przed
                     korpusem, więc przy złożeniu jest poprawnie w nim schowana ── */}
              <g opacity={0.3 + fade(0.05, 0.2) * 0.7}>
                {Trail(P3(0, 0, SENS.z1), P3(xSens, ySens, SENS.z0 + zSens), fade(0.06))}
                {Box(-SENS.x + xSens, -SENS.y + ySens, SENS.z0 + zSens, SENS.x + xSens, SENS.y + ySens, SENS.z1 + zSens,
                  ton(8), tonAkc(13, 6), 'url(#nbSensor)', 'hsl(var(--primary))', 1.2)}
                <g transform={plane(xSens, ySens, SENS.z1 + zSens, ...FRONT)}>
                  <rect x={-32} y={-18} width={64} height={36} fill={ton(7)} stroke="hsl(var(--primary))" strokeWidth={0.9} />
                  {[-12, -4, 4, 12].map((yy) => <line key={yy} x1={-30} y1={yy} x2={30} y2={yy} stroke="hsl(var(--primary))" strokeWidth={0.4} strokeOpacity={0.4} />)}
                  {[-24, -12, 0, 12, 24].map((xx) => <line key={xx} x1={xx} y1={-16} x2={xx} y2={16} stroke="hsl(var(--primary))" strokeWidth={0.4} strokeOpacity={0.4} />)}
                  <text x={0} y={3.5} fill={ton(100)} fontSize={12} fontFamily="sans-serif" fontWeight="900" textAnchor="middle">4K</text>
                  {[-40, 40].map((xx) => <rect key={xx} x={xx - 1.5} y={-14} width={3} height={28} fill={tonAkc(63, 13)} opacity={0.6} />)}
                </g>
              </g>
              {/* ── 3. KORPUS (skórzana obudowa) ── */}
              <g>
                {Box(-BODY.x, BODY.y0, -BODY.z, BODY.x, BODY.y1, BODY.z,
                  'url(#nbSkinS)', 'url(#nbSkinT)', 'url(#nbSkinF)', tonAkc(32, 15), 1.5)}

                <g transform={plane(0, -6, BODY.z, ...FRONT)}>
                  <rect x={-88} y={-46} width={176} height={92} rx={5} fill={ton(7)} stroke={tonAkc(16, 9)} strokeWidth={0.7} />
                  {Array.from({ length: 12 }, (_, i) => (
                    <line key={`vt${i}`} x1={-82 + i * 15} y1={-42} x2={-82 + i * 15} y2={42} stroke={tonAkc(45, 22)} strokeWidth={0.3} strokeOpacity={0.13} />
                  ))}
                  <g transform="translate(-66 12)">
                    <circle r={11} fill={tonAkc(10, 8)} stroke={tonAkc(58, 14)} strokeWidth={0.9} />
                    <path d="M 0 0 L 8 -7" stroke={tonAkc(83, 8)} strokeWidth={2.4} strokeLinecap="round" />
                  </g>
                  <circle cx={64} cy={0} r={6} fill={tonAkc(13, 10)} stroke={tonAkc(58, 14)} strokeWidth={0.9} />
                </g>

                <g transform={plane(BODY.x, -6, 0, ...SIDE)}>
                  <rect x={-28} y={-44} width={56} height={88} rx={4} fill={ton(6)} stroke={tonAkc(16, 9)} strokeWidth={0.7} />
                  {Array.from({ length: 10 }, (_, i) => (
                    <line key={i} x1={-24} y1={-36 + i * 8} x2={24} y2={-36 + i * 8} stroke={tonAkc(45, 22)} strokeWidth={0.6} strokeOpacity={0.18} />
                  ))}
                </g>
              </g>

              {/* ── 4. GÓRNA PŁYTA MAGNEZOWA Z POKRĘTŁAMI (unosi się) ── */}
              <g>
                {Trail(P3(0, PLATE.y0, 0), P3(0, PLATE.y1 + yPlate, 0), fade(0.08))}
                {Box(-BODY.x, PLATE.y0 + yPlate, -BODY.z, BODY.x, PLATE.y1 + yPlate, BODY.z,
                  'url(#nbMagS)', 'url(#nbMagT)', 'url(#nbMagF)', tonAkc(81, 11), 1.3)}

                <g transform={plane(0, PLATE.y0 + yPlate + 9, BODY.z, ...FRONT)}>
                  <rect x={-74} y={-6} width={26} height={12} rx={2} fill={tonAkc(10, 8)} stroke={tonAkc(77, 12)} strokeWidth={0.8} />
                  <rect x={30} y={-6} width={20} height={12} rx={2} fill={tonAkc(10, 8)} stroke={tonAkc(77, 12)} strokeWidth={0.8} />
                  <circle cx={-61} cy={0} r={3.4} fill={tonAkc(78, 47)} opacity={0.42} />
                </g>

                {VTube(48, -2, PLATE.y1 + yPlate, PLATE.y1 + yPlate + 11, 19, tonAkc(28, 12), 'url(#nbMagT)', tonAkc(88, 6), 1.2)}
                {Array.from({ length: 18 }, (_, i) => {
                  const t = (i / 18) * Math.PI * 2
                  const c0 = P3(48 + Math.cos(t) * 15, PLATE.y1 + yPlate + 11, -2 + Math.sin(t) * 15)
                  const c1 = P3(48 + Math.cos(t) * 18.6, PLATE.y1 + yPlate + 11, -2 + Math.sin(t) * 18.6)
                  return <line key={`sd${i}`} x1={c0.x} y1={c0.y} x2={c1.x} y2={c1.y} stroke={tonAkc(33, 13)} strokeWidth={1} opacity={0.75} />
                })}

                {VTube(-58, -4, PLATE.y1 + yPlate, PLATE.y1 + yPlate + 9, 15, tonAkc(28, 12), 'url(#nbMagT)', tonAkc(88, 6), 1.1)}

                {VTube(22, 8, PLATE.y1 + yPlate, PLATE.y1 + yPlate + 6, 7.5, tonAkc(34, 11), tonAkc(81, 11), tonAkc(88, 6), 1)}

                {Box(-14, PLATE.y1 + yPlate, -14, 12, PLATE.y1 + yPlate + 6, 4,
                  tonAkc(14, 9), tonAkc(19, 10), tonAkc(11, 8), tonAkc(58, 14), 0.9)}

                <g transform={plane(0, PLATE.y1 + yPlate + 0.4, 0, ...TOPF)}>
                  <path d="M 66 16 L 88 20 L 92 12 L 70 8 Z" fill={tonAkc(59, 12)} stroke={tonAkc(88, 6)} strokeWidth={0.6} />
                </g>
              </g>

              {/* ── 4. PRYZMAT / WIZJER (unosi się) ── */}
              <g opacity={0.45 + fade(0.04, 0.2) * 0.55}>
                {Trail(P3(-10, PRISM.y0, 4), P3(-10 + xPrism, PRISM.y0 + yPrism, 4), fade(0.06))}
                {Box(PRISM.x0 + xPrism, PRISM.y0 + yPrism, PRISM.z0, PRISM.x1 + xPrism, PRISM.y1 + yPrism, PRISM.z1,
                  'url(#nbMagS)', 'url(#nbMagT)', 'url(#nbMagF)', tonAkc(81, 11), 1.3)}
                <g transform={plane(-10 + xPrism, PRISM.y0 + yPrism + 14, PRISM.z1, ...FRONT)}>
                  <rect x={-17} y={-9} width={34} height={18} rx={2} fill={tonAkc(9, 8)} stroke="hsl(var(--primary))" strokeWidth={0.9} />
                  <path d="M -14 7 L 0 -6 L 14 7 Z" fill="hsl(var(--primary))" fillOpacity="0.3" stroke="hsl(var(--primary))" strokeWidth={0.7} />
                </g>
                {Box(-24 + xPrism, PRISM.y0 + yPrism + 6, PRISM.z0 - 10, 4 + xPrism, PRISM.y1 + yPrism - 6, PRISM.z0,
                  tonAkc(12, 9), tonAkc(17, 9), tonAkc(10, 8), tonAkc(48, 14), 0.9)}
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
                      <line x1={L.ax} y1={L.ay} x2={L.to.x} y2={L.to.y} stroke="hsl(var(--primary))" strokeWidth={1.1} strokeDasharray="4 4" opacity={0.75} />
                      <circle cx={L.to.x} cy={L.to.y} r={3.2} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.4} />
                      <circle cx={L.ax} cy={L.ay} r={2.6} fill="hsl(var(--primary))" />
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














/** Miejsce na wizualizację modułu — trzyma dokładnie ten sam kadr
    (900 × 620) co gotowe moduły 01 i 02, więc podmiana nic nie przesunie. */
function ModuleVisualSlot({ num, tag }: { num: string; tag: string }) {
  return (
    <div className="relative w-full max-w-[900px] aspect-[900/620]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[440px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.10)_0%,transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'linear-gradient(0deg, hsl(var(--primary)) 1px, transparent 1px),' +
            'linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
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
                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.8)]" />
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
  const navItems: { label: string; id: HomePageId }[] = [
    { label: 'Strona główna', id: 'home' },
    { label: 'Cennik', id: 'cennik' },
    { label: 'Dla firm', id: 'b2b' },
    { label: 'Historia', id: 'historia' },
  ]

  const navRef = useRef<HTMLDivElement>(null)

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
      <div className="flex items-center px-5 h-12 gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => {}}
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary-foreground" fill="currentColor">
              <path d="M6 1L10 4V8L6 11L2 8V4L6 1Z" />
            </svg>
          </div>
          <span className="font-heading text-[14px] font-bold tracking-[-0.4px] text-foreground">NextByte</span>
        </button>

        {/* Nav linki — wycentrowane. Bez CTA po prawej: ekrany logowania mają
            własny podgląd, landing do nich nie linkuje.

            Na wąskim ekranie pigułki przewijają się poziomo zamiast rozpychać
            pasek: przy 375 px cztery linki plus logo miały 106 px więcej niż
            okno, przez co CAŁA strona dostawała przewijanie w poziomie.
            `min-w-0` jest konieczne — bez niego element flex nie zejdzie
            poniżej szerokości treści i nie ma czego przewijać. */}
        <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full items-center justify-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="h-8 shrink-0 px-3.5 rounded-lg font-sans text-[13px] font-medium text-foreground/45 hover:text-foreground/80 hover:bg-foreground/[0.05] transition-all duration-150 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   GŁÓWNY KOMPONENT: StronaGlowna (KOMPLETNY, ZBALANSOWANY LEJEK 10 SEKCJI)
   ═══════════════════════════════════════════════════════════════════════ */
export function StronaGlowna({ onNavigate = () => { } }: { onNavigate?: (p: HomePageId) => void }) {
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
                <span className="block text-primary drop-shadow-[0_0_40px_hsl(var(--primary)/0.4)]">NextByte

                </span>
                <span className="block text-foreground sm:whitespace-nowrap">Twoje AI w&nbsp;jednym miejscu</span>
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

      {/* ══════════ 14. FINALNE CTA — KONWERGENCJA ══════════ */}
      <LazyBlock minHeight={720}><FinalCtaSection onNavigate={onNavigate} /></LazyBlock>
    </div>
  )
}
