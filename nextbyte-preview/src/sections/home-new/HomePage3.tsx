import { useState, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  Shield, Cpu, WifiOff,
  Building2, Lock, LogOut, CircleCheck, X,
  Mic, Camera, Video, NotebookPen, ArrowRight,
  Radar, Workflow, Sparkles, Brain, Calendar, Rocket, Check,
  Zap, Play, TrendingUp, Layers, Database, ArrowUpRight, MessageSquare
} from 'lucide-react'
import {
  Section, GlowButton, GhostButton,
  IconTile, Glow, PageAmbience,
  AnimStyles, FadeIn, Stars,
  TechDivider, TechCornerMarks,
} from './shared'
import {
  MODULY, STATY, KROKI,
  POROWNANIE, OPINIE, FAQ,
} from './data'
import {
  ModelEcosystemBridge,
  HemisphereArchSection, FaqRow, SecRule,
  OpenAIIcon, AnthropicIcon, XaiIcon, GoogleIcon, GeminiIcon,
  NextByteMarkIcon, ChaosVsUnifiedCard,
} from './HomePage'
import { GlassCard } from '@/components/glass'
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

/** Skrócone i zwięzłe opisy trzech filarów wartości */
const FILARY_SKROCONE = [
  {
    tag: '// SYGNAŁ ZAMIAST SZUMU',
    title: 'Tylko narzędzia, które dają wynik',
    desc: 'Testujemy dziesiątki nowości AI i wdrażamy tylko to, co realnie przyspiesza pracę — z gotową instrukcją krok po kroku po polsku.',
    accent: '#70BEFA',
  },
  {
    tag: '// PROMPTY BIZNESOWE',
    title: 'Sprawdzone szablony promptów',
    desc: 'Gotowe prompty pod konkretne zadania: research, treści, analizy i kod. Kopiujesz, podmieniasz dane i od razu masz oczekiwany rezultat.',
    accent: '#C084FC',
  },
  {
    tag: '// CAŁE SYSTEMY',
    title: 'Kompletne przepływy pracy',
    desc: 'Od pomysłu do gotowego wyniku. Zintegrowane narzędzia i rozpisane kroki, które uruchomisz w firmie tego samego dnia.',
    accent: '#34D399',
  },
] as const

/** Wspólny styl obramowań z poświatą */
export const GLOW_CARD = 'relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 backdrop-blur-sm'

export function glowStyle(color: string): { borderColor: string; boxShadow: string } {
  const border = `color-mix(in srgb, ${color} 45%, transparent)`
  const halo = `color-mix(in srgb, ${color} 22%, transparent)`
  return { borderColor: border, boxShadow: `0 0 10px -5px ${halo}` }
}

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

function ElevenLabsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 24" className={className} fill="currentColor">
      <rect x="0" y="0" width="4" height="24" rx="1" />
      <rect x="10" y="0" width="4" height="24" rx="1" />
    </svg>
  )
}

function KlingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4 3.5h3.8v7.2L14.2 3.5h4.6l-7.3 7.8 7.7 9.2h-4.8L8 13.2v7.3H4V3.5z" />
    </svg>
  )
}

function RunwareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 3.2l6.8 3.7L12 12.6 5.2 8.9 12 5.2zm-7 5.1l6 3.3v6.7l-6-3.3v-6.7zm8 10v-6.7l6-3.3v6.7l-6 3.3z" />
    </svg>
  )
}

function BananaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.8 3.5c-.8 1.4-1.9 3.2-3.1 5.3-2.1 3.7-4.4 7.6-7.2 9.8-1.4 1.1-2.9 1.9-4.5 1.9-.3 0-.6 0-.8-.1-.6-.2-1-.7-1.1-1.3-.1-.6.1-1.2.6-1.6 1.8-1.5 3.8-3.4 5.7-5.9 2-2.6 3.8-5.7 4.9-8.4.5-1.2 1.3-1.8 2.5-1.8.8 0 2 .7 3 2.1z" />
    </svg>
  )
}

function PixVerseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 6l9-4 9 4v12l-9 4-9-4V6zm9 2.5L6.5 11l5.5 2.5 5.5-2.5L12 8.5z" />
    </svg>
  )
}

function MiniMaxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 7h3v10H3V7zm5-4h3v18H8V3zm5 8h3v6h-3v-6zm5-5h3v16h-3V6z" />
    </svg>
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
              <span className="font-normal text-primary">Jeden zintegrowany rdzeń.</span>
            </h2>
            <p className="font-sans text-[15px] font-light leading-relaxed text-foreground/65 max-w-md">
              Zamiast 5 osobnych subskrypcji za ponad 450 zł/mc i chaosu logowań — dostęp do czołowych modeli w jednej elastycznej puli Byte.
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
              Rozpocznij za darmo →
            </GlowButton>
          </div>
        </div>

        {/* PRAWA STRONA: ORGANICZNY POZIOMY SCHEMAT ŚWIATŁOWODOWY */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <div className="relative mx-auto w-full max-w-[580px] h-[340px] flex items-center justify-center select-none">

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

                {/* Logo NextByte N */}
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110 mb-0.5">
                  <NextByteMarkIcon className="h-5 w-5" />
                </div>

                <p className="font-heading text-[9.5px] font-black tracking-[0.2em] text-foreground uppercase leading-none">
                  NEXTBYTE
                </p>
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
  const [scrollProgress, setScrollProgress] = useState(0)

  // Reaktywny nasłuch scrolla z triggerem idealnie w miejscu ze zrzutu ekranu
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateProgress = () => {
      const rect = el.getBoundingClientRect()

      // TRIGGER ROZSUWANIA:
      // Rozpoczyna rozsuwanie gdy sekcja wchodzi na ekran (rect.top ≈ vh * 0.58)
      // Osiąga 100% (rozwinięcie na maksa) dokładnie w momencie wyrównania w kadrze (rect.top ≈ vh * 0.16)
      const vh = window.innerHeight || 800
      const startUnfold = vh * 0.45
      const fullUnfold = vh * 0.18

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
    <div ref={containerRef} className="relative z-10 py-16 sm:py-24 overflow-visible">

      {/* 2-KOLUMNOWY UKŁAD NAPRZEMIENNY (CZYSTY, BEZ KAFELKÓW I BEZ CIĘŻKICH BLOKÓW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

        {/* LEWA STRONA: 3D DIAGONAL ISOMETRIC WAFER STACK + LINIE PROWADZĄCE (LEADER LINES) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none">

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
          <div className="relative w-full max-w-[740px] h-[580px] flex items-center justify-center">

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
        <div className="lg:col-span-5 text-left space-y-5">
          <div className="space-y-2">
            <SecRule label="01 // CHAT AI" />
            <h2 className="font-heading text-[clamp(28px,4vw,48px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
              Wszystkie modele. <br className="hidden sm:block" />
              <span className="font-normal text-primary">Jeden czat.</span>
            </h2>
            <p className="font-sans text-[15px] font-light leading-relaxed text-foreground/70">
              Błyskawiczne przełączanie między wiodącymi silnikami AI bez utraty wątku i ponawiania promptów.
            </p>
          </div>

          {/* 3 BŁYSKAWICZNIE CZYTELNE PUNKTY Z KROPKAMI CAD */}
          <div className="space-y-2.5 font-sans pt-1">
            {[
              'Generowanie do 165 t/s',
              'Wspólna pamięć kontekstu',
              'Pełna prywatność i serwery w UE',
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
              Wypróbuj Chat AI →
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
   „złamać”, bo nie jest liczona osobno dla każdego elementu — jest wspólna.
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
    zawsze idealnie schodzi się z czaszami elips (zero „załamań”). */
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
  const [p, setP] = useState(0)

  useEffect(() => {
    const el = containerRef.current
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
      const start = vh * 0.88
      const end = vh * 0.14
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
            <SecRule label="02 // OBRAZY I WIDEO" />
            <h2 className="font-heading text-[clamp(28px,4vw,48px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
              Studio Kreacji. <br className="hidden sm:block" />
              <span className="font-normal text-primary">Zdjęcia 4K i wideo AI.</span>
            </h2>
            <p className="font-sans text-[15px] font-light leading-relaxed text-foreground/70">
              Fotorealistyczne grafiki produktowe i natychmiastowa zamiana pojedynczego zdjęcia w płynny klip wideo.
            </p>
          </div>

          <div className="space-y-2.5 font-sans pt-1">
            {[
              'Generowanie grafik w jakości 4K bez limitu kolejek',
              'Automatyczna zamiana kadru w ruchome wideo',
              'Pełne prawa komercyjne do każdego materiału',
            ].map((bullet) => (
              <div key={bullet} className="flex items-center gap-2.5 text-[13.5px] text-foreground/80 font-light">
                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <GlowButton size="lg" onClick={() => onNavigate('cennik')}>
              Zobacz Studio Kreacji →
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

          <div className="relative w-full max-w-[900px] aspect-[900/620]">
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

/** Warstwice popiersia: [wysokość, półoś w X, półoś w Z, przesunięcie w Z].
    Ramiona są szerokie i płytkie, szyja wąska, głowa niemal okrągła
    i lekko wysunięta do przodu — sylwetka czyta się bez rysowania twarzy. */
const BUST_CONTOURS: [number, number, number, number][] = [
  [0, 64, 26, 0],
  [8, 63, 25, 0],
  [16, 60, 24, 1],
  [24, 54, 23, 1],
  [31, 45, 21, 2],
  [37, 35, 19, 2],
  [43, 25, 16, 3],
  [48, 18, 14, 3],
  [53, 16, 14, 4],
  [58, 16, 14, 4],
  [63, 19, 18, 5],
  [69, 24, 23, 5],
  [75, 26, 26, 5],
  [82, 26, 26, 4],
  [88, 24, 24, 4],
  [94, 19, 20, 3],
  [99, 12, 14, 2],
  [103, 5, 7, 1],
]

/** Karty krążące wokół postaci. `at` to próg scrolla, przy którym karta
    wychodzi zza popiersia; `lab` oznacza te, które dostają opis CAD. */
const ASSIST_CARDS = [
  { id: 'c1', at: 0.00, rEnd: 62, yEnd: 38, glyph: 'note', lab: '01' },
  { id: 'c2', at: 0.13, rEnd: 76, yEnd: 66, glyph: 'cal', lab: '02' },
  { id: 'c3', at: 0.27, rEnd: 88, yEnd: 94, glyph: 'search', lab: '03' },
  { id: 'c4', at: 0.41, rEnd: 98, yEnd: 122, glyph: 'task', lab: '04' },
  { id: 'c5', at: 0.55, rEnd: 106, yEnd: 148, glyph: 'pen', lab: null },
  { id: 'c6', at: 0.69, rEnd: 112, yEnd: 172, glyph: 'dot', lab: null },
]

const GOLDEN = 137.507764

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
      const start = vh * 0.88
      const end = vh * 0.14
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
  const S = 1.60
  const OX = 450
  const OY = 455

  const P3 = (x: number, y: number, z: number) => ({
    x: OX + (x * C.ux + y * C.vx + z * C.wx) * S,
    y: OY + (x * C.uy + y * C.vy + z * C.wy) * S,
  })
  const dep = (x: number, y: number, z: number) => x * C.ud + y * C.vd + z * C.wd

  /* Elipsa poziomego przekroju o półosiach rx (wzdłuż X) i rz (wzdłuż Z). */
  const contourEllipse = (rx: number, rz: number) =>
    circleToEllipse(rx * C.ux * S, rx * C.uy * S, rz * C.wx * S, rz * C.wy * S)

  /* Punkt na obwodzie przekroju — używany do łuku światła i do kotwic opisów. */
  const contourPt = (y: number, rx: number, rz: number, cz: number, t: number) => {
    const x = Math.cos(t) * rx
    const z = Math.sin(t) * rz + cz
    return P3(x, y, z)
  }

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

    const theta = (-46 + i * GOLDEN) * D2R
    const r = 30 + ease * (card.rEnd - 30)
    const y = 52 + ease * (card.yEnd - 52)

    const cx = Math.cos(theta) * r
    const cz = Math.sin(theta) * r
    // Styczna do spirali — karta jest zwrócona licem na zewnątrz.
    const ux = -Math.sin(theta)
    const uz = Math.cos(theta)
    // Normalna karty i jej oświetlenie wspólnym światłem sceny.
    const nx = Math.cos(theta)
    const nz = Math.sin(theta)
    const lit = Math.max(0, nx * ASSIST_LIGHT[0] + nz * ASSIST_LIGHT[2])

    return {
      ...card, i, cx, cy: y, cz, ux, uz, lit,
      o: Math.min(1, ease * 3.2),
      d: dep(cx, y, cz),
    }
  })

  /* ── Kotwice opisów: prawy górny róg karty ───────────────────────── */
  const anchorOf = (c: typeof cards[number]) =>
    P3(c.cx + c.ux * CW, c.cy + CH, c.cz + c.uz * CW)

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
  const anchors = labelled.map((c) => P3(c.cx + c.ux * CW, c.cy + CH, c.cz + c.uz * CW))
  const byAngle = anchors
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
      const a = anchors[c.j]!
      cost += Math.hypot(k.ax - a.x, k.ay - a.y)
    })
    if (cost < bestCost) { bestCost = cost; bestRot = r }
  }
  const cornerFor: (typeof CORNERS[number] | undefined)[] = []
  byAngle.forEach((c, i) => { cornerFor[c.j] = CORNERS[cornersByAngle[(i + bestRot) % N]!.j] })
  const LABELS = [
    { k: 'a1', num: '01', head: 'NOTATKI', sub: 'Zapisuje ustalenia, zanim zdążysz o nich zapomnieć.' },
    { k: 'a2', num: '02', head: 'KALENDARZ', sub: 'Terminy same trafiają na właściwy dzień.' },
    { k: 'a3', num: '03', head: 'WYSZUKIWANIE', sub: 'Sprawdza w sieci i podaje źródło.' },
    { k: 'a4', num: '04', head: 'ZADANIA', sub: 'Rozbija projekt na kroki i pilnuje ich.' },
  ].map((L, i) => ({ ...L, card: labelled[i], ...(cornerFor[i] ?? CORNERS[i]) }))

  /* ── Grafika na licu karty — jeden hairline'owy znak, nic więcej ── */
  const glyphOf = (kind: string) => {
    const st = { stroke: '#cbd5e1', strokeWidth: 1.4, strokeLinecap: 'round' as const, fill: 'none' }
    switch (kind) {
      case 'note':
        return <><line x1={-9} y1={-3} x2={9} y2={-3} {...st} /><line x1={-9} y1={3} x2={3} y2={3} {...st} /></>
      case 'cal':
        return <>{[-7, 0, 7].map((x) => [-4, 4].map((y) => (
          <circle key={`${x}_${y}`} cx={x} cy={y} r={1.5} fill="#cbd5e1" />
        )))}</>
      case 'search':
        return <><circle cx={-2} cy={-1} r={6} {...st} /><line x1={2.5} y1={3.5} x2={8} y2={9} {...st} /></>
      case 'task':
        return <><path d="M -9 0 L -4 5 L 6 -6" {...st} /></>
      case 'pen':
        return <><line x1={-8} y1={7} x2={8} y2={-7} {...st} /><path d="M -8 7 L -9 10 L -6 9 Z" fill="#cbd5e1" /></>
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
              'M -66 0',
              'C -60 -22 -40 -30 -17 -40',
              'L -15 -54',
              'C -30 -58 -30 -78 -22 -90',
              'C -16 -100 -6 -106 0 -106',
              'C 6 -106 16 -100 22 -90',
              'C 30 -78 30 -58 15 -54',
              'L 17 -40',
              'C 40 -30 60 -22 66 0',
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
                  d="M 0 -106 C 6 -106 16 -100 22 -90 C 30 -78 30 -58 15 -54 L 17 -40 C 40 -30 60 -22 66 0"
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
      const face = 12 + c.lit * 26
      const edge = 40 + c.lit * 55
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
            const a = anchorOf(L.card)
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

/* Moduły 03–06: Spójne, krótkie, sprzedażowe */
const MODULE_COPY: ModuleCopy[] = [
  {
    id: 'assistant',
    num: '03',
    tag: 'ASYSTENT NEXTBYTE',
    titleLead: 'Twój asystent.',
    titleAccent: 'Działa sam.',
    lead: 'Zlecasz zadanie, a asystent sam przeszukuje pliki, ustala terminy w kalendarzu i pilnuje projektów.',
    bullets: [
      'Wnioski z rozmów same stają się terminami',
      'Automatyczne tworzenie i przypisywanie zadań',
      'Błyskawiczna analiza Twoich dokumentów i plików',
    ],
    cta: 'Poznaj Asystenta NextByte →',
    visualLeft: false,
  },
  {
    id: 'research',
    num: '04',
    tag: 'DEEP RESEARCH',
    titleLead: 'Deep Research.',
    titleAccent: 'Analiza setek źródeł w locie.',
    lead: 'Autonomiczny radar sieci: przeszukuje dziesiątki baz, weryfikuje fakty i sporządza wyczerpujący raport w 30 sekund.',
    bullets: [
      'Równoległa eksploracja do 40 źródeł w czasie rzeczywistym',
      'Krzyżowa weryfikacja faktów eliminująca halucynacje',
      'Gotowy raport executive z tabelami i cytowaniami',
    ],
    cta: 'Uruchom Deep Research →',
    visualLeft: true,
  },
  {
    id: 'creator',
    num: '05',
    tag: 'AKADEMIA I PANEL TWÓRCY',
    titleLead: 'Akademia i Panel Twórcy.',
    titleAccent: 'Ucz się i zarabiaj na wiedzy.',
    lead: 'Certyfikowane kursy AI po polsku oraz dedykowany panel, w którym wystawiasz własne materiały i zarabiasz w PLN.',
    bullets: [
      'Panel Twórcy: twórz i sprzedawaj własne kursy oraz szablony',
      'Sklep z gotowymi promptami i workflow biznesowymi',
      'Wypłata zysków bezpośrednio w PLN z fakturą VAT 23%',
    ],
    cta: 'Odkryj Akademię i Twórców →',
    visualLeft: false,
  },
  {
    id: 'workspace',
    num: '06',
    tag: 'ZINTEGROWANY WORKSPACE',
    titleLead: 'Zintegrowany Workspace.',
    titleAccent: 'Wszystko w jednym rdzeniu.',
    lead: 'Tablice wizualne, notatki semantyczne, kalendarz i zadania Kanban połączone w jeden płynny organizm.',
    bullets: [
      'Tablice: nieskończone płótno do szkiców i map myśli',
      'Notatki AI odpowiadające na bazie Twoich dokumentów',
      'Wspólny stan danych bez kopiowania między aplikacjami',
    ],
    cta: 'Zobacz Zintegrowany Workspace →',
    visualLeft: true,
  },
]

/* ═══════════════════════════════════════════════════════════════════════
   GŁÓWNY KOMPONENT: HomePage3 (KOMPLETNY, ZBALANSOWANY LEJEK 10 SEKCJI)
   ═══════════════════════════════════════════════════════════════════════ */
export function HomePage3({ onNavigate = () => { } }: { onNavigate?: (p: HomePageId) => void }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  return (
    <div className="relative flex w-full flex-col font-landing text-foreground">
      <AnimStyles />
      <PageAmbience />

      {/* ══════════ 1. HERO + JEDYNA KARUZELA (MODEL ECOSYSTEM BRIDGE) ══════════ */}
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
      <Section className="relative z-10 py-4 sm:py-8">
        <FadeIn>
          <Module01ChatAiZigzagSection onNavigate={onNavigate} />
        </FadeIn>
      </Section>

      <TechDivider />

      {/* ══════════ 4. MODUŁ 02: OBRAZY I WIDEO (ZDJĘCIA & WIDEO AI) ══════════ */}
      <Section className="relative z-10 py-4 sm:py-8">
        <FadeIn>
          <Module02VisualCreationZigzagSection onNavigate={onNavigate} />
        </FadeIn>
      </Section>

      {/* ══════════ 5. MODUŁY 03–06: ASYSTENT, DEEP RESEARCH, AKADEMIA, WORKSPACE ══════════ */}
      {MODULE_COPY.map((copy) => (
        <div key={copy.id}>
          <TechDivider />
          <Section className="relative z-10 py-4 sm:py-8">
            <FadeIn>
              <ModuleZigzagSection
                copy={copy}
                onNavigate={onNavigate}
                visual={copy.id === 'assistant' ? <AssistantOrbitVisual /> : undefined}
              />
            </FadeIn>
          </Section>
        </div>
      ))}

      <TechDivider />

      {/* ══════════ 6. PRYWATNOŚĆ & LOKALNY AI (0 ZŁ OFFLINE) ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Prywatność // 0 zł Offline" />
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
                    <p className="relative mt-2 text-[13px] leading-relaxed text-foreground/55 font-light">{item.desc}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </FadeIn>
      </Section>

      <TechDivider />

      {/* ══════════ 7. TRZY FILARY WARTOŚCI DLA BIZNESU ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <SecRule label="Trzy filary" />
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.1] text-foreground mb-3 max-w-2xl tracking-[-2px]">
            Dlaczego podejście <span className="font-normal text-primary">NextByte działa.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-xl mb-10 font-light">
            Trzy zasady, dzięki którym nie marnujesz czasu na testowanie niesprawdzonych narzędzi.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {FILARY_SKROCONE.map((f, i) => {
            const FilarIcon = [Radar, Workflow, Sparkles][i] ?? Sparkles
            return (
              <FadeIn key={f.tag} delay={i * 80}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/80 p-6 shadow-[0_24px_48px_-28px_rgb(0_0_0/0.6)] backdrop-blur-sm transition-all hover:border-primary/30">
                  <CardDepth color={f.accent} />
                  <GlowIcon icon={FilarIcon} color={f.accent} />
                  <p className="relative mt-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary/70">{f.tag}</p>
                  <h3 className="relative mt-1 font-heading text-[16px] font-extrabold leading-snug text-foreground">{f.title}</h3>
                  <p className="relative mt-2 text-[13px] leading-relaxed text-foreground/60 font-light">{f.desc}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </Section>

      <TechDivider />

      {/* ══════════ 8. START W 3 PROSTYCH KROKACH ══════════ */}
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
                <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/55 font-light">{k.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <TechDivider />

      {/* ══════════ 9. BEZPIECZEŃSTWO & SERWERY W UE ══════════ */}
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

      <TechDivider />

      {/* ══════════ 10. KALKULACJA KOSZTÓW & PRICING ROI (ZAMIAST 5 SUBSKRYPCJI) ══════════ */}
      <Section className="relative z-10 overflow-hidden py-16 sm:py-24">
        <BigBackdropText className="top-6">BYTE</BigBackdropText>
        <Glow className="left-1/2 top-1/3 -translate-x-1/2" size={800} opacity={0.1} />

        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <SecRule label="Kalkulacja kosztów" />
            <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.06] text-foreground tracking-[-2px]">
              Jeden abonament zamiast <span className="text-primary font-normal">pięciu osobnych.</span>
            </h2>
            <p className="font-sans text-[15px] text-foreground/60 leading-relaxed font-light">
              Koniec z płaceniem ~450 zł/mc w obcych walutach i chaosem faktur. Wszystkie silniki i narzędzia w ramach jednej puli Byte z fakturą VAT 23%.
            </p>
          </div>
        </FadeIn>

        {/* INTERAKTYWNA KARTA PORÓWNANIA KOSZTÓW (CHAOS VS NEXTBYTE) */}
        <FadeIn delay={60} className="mb-12">
          <ChaosVsUnifiedCard />
        </FadeIn>

        {/* TABELA FUNKCJI */}
        <FadeIn delay={120}>
          <div className="relative max-w-4xl mx-auto">
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
      </Section>

      <TechDivider />

      {/* ══════════ 11. ZAUFANIE UŻYTKOWNIKÓW (OPINIE) ══════════ */}
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
                <p className="text-[13.5px] leading-relaxed text-foreground/70 font-light">„{o.tekst}"</p>
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

      <TechDivider />

      {/* ══════════ 12. FAQ & FINALNE CTA ══════════ */}
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

      {/* FINALNE CTA Z LUMINOUS ARCH */}
      <Section className="relative z-10 py-20 sm:py-28 overflow-hidden">
        {/* Luminous Atmospheric Horizon Arch & Pulsing Aura */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[420px] flex items-center justify-center overflow-visible"
          style={{
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 80%)',
          }}
        >
          <div
            className="absolute w-[820px] h-[360px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.3)_0%,hsl(var(--primary)/0.06)_50%,transparent_75%)] blur-3xl"
          />
          <svg
            viewBox="0 0 1000 350"
            className="relative w-full h-full opacity-80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="finalCtaArchGlow3" x1="0%" y1="100%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                <stop offset="20%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
                <stop offset="80%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
              <filter id="finalCtaBlur3" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 50 330 C 200 60, 800 60, 950 330"
              stroke="url(#finalCtaArchGlow3)"
              strokeWidth="1.75"
              filter="url(#finalCtaBlur3)"
            />
          </svg>
        </div>

        <FadeIn>
          <div className="relative mx-auto max-w-3xl text-center">
            <h2
              className="font-heading font-light leading-[1.08] tracking-[-2px] text-foreground mb-4"
              style={{ fontSize: 'clamp(2.4rem, 5.2vw, 4rem)' }}
            >
              Wszystkie modele AI. <br />
              <span className="text-primary font-normal drop-shadow-[0_0_35px_rgba(105,179,240,0.5)]">
                Jeden standard pracy.
              </span>
            </h2>

            <p className="font-sans text-[15px] sm:text-[16px] text-foreground/65 max-w-md mx-auto leading-relaxed mb-8 font-light">
              Topowe modele, studio grafik 4K i baza wiedzy w jednym oknie. Start za 0 zł bez karty.
            </p>

            <div className="flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <GlowButton size="lg" onClick={() => onNavigate('cennik')}>
                Rozpocznij za darmo
              </GlowButton>
              <GhostButton size="lg" onClick={() => onNavigate('cennik')}>
                Zobacz cennik i pakiety
              </GhostButton>
            </div>
          </div>
        </FadeIn>
      </Section>
    </div>
  )
}
