import { useState, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  Shield, Cpu, WifiOff,
  Building2, Lock, LogOut, CircleCheck, X,
  Mic, Camera, NotebookPen, ArrowRight,
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

      // TRIGGER OD PUNKTU ZE ZRZUTU EKRANU:
      // Do punktu ze zrzutu ekranu (rect.top >= 25px) -> progress = 0 (idealnie złożony na płasko!)
      // Od rect.top = 25px do -340px -> płynne, dynamiczne rozsuwanie od 0.0 do 1.0
      const startUnfold = 25
      const fullUnfold = -340
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
          <div className="relative w-full max-w-[620px] h-[560px] flex items-center justify-center">
            
            <svg
              viewBox="0 0 620 580"
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
                const topCx = 310 - 2 * sepX
                const topCy = 290 - 2 * sepY
                const botCx = 310 + 2 * sepX
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
                    /* 05 // PRYWATNOŚĆ & GPU - TARCZA 3D */
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
                    /* 04 // WSPÓLNY KONTEKST 1M - RDZEŃ PAMIĘCI 3D */
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
                      <text x="0" y="5" fill="#ffffff" fontSize="13" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">1M</text>
                    </g>
                  ),
                },
                {
                  id: 'w2-voice',
                  offsetMul: 0,
                  icon: (
                    /* 03 // GŁOS AI LIVE - SPEKTRUM DŹWIĘKOWE 3D */
                    <g transform="scale(1, 0.5416) rotate(-45)">
                      <line x1="-24" y1="0" x2="-24" y2="0" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                      <line x1="-16" y1="-10" x2="-16" y2="10" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                      <line x1="-8" y1="-20" x2="-8" y2="20" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                      <line x1="0" y1="-28" x2="0" y2="28" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                      <line x1="8" y1="-18" x2="8" y2="18" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                      <line x1="16" y1="-9" x2="16" y2="9" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                      <line x1="24" y1="0" x2="24" y2="0" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
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
                const cx = 310 + wafer.offsetMul * sepX
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
                  PRECYZYJNE LINIE WSKAŹNIKOWE CAD (POJAWIAJĄ SIĘ PRZY ROZWINIĘCIU)
                  ───────────────────────────────────────────────────────────── */}
              {/* Lewa góra -> AI Neural Core (Wafer 0) */}
              <line
                x1="40"
                y1="70"
                x2={310 - 2 * sepX - 120}
                y2={290 - 2 * sepY}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.15) * 1.5))}
              />
              <circle cx="40" cy="70" r="3" fill="#38bdf8" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.15) * 1.5))} />

              {/* Prawa góra -> Dokumenty & PDF (Wafer 1) */}
              <line
                x1="580"
                y1="160"
                x2={310 - 1 * sepX + 120}
                y2={290 - 1 * sepY}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.25) * 1.5))}
              />
              <circle cx="580" cy="160" r="3" fill="#38bdf8" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.25) * 1.5))} />

              {/* Prawa dół -> Wspólny Kontekst 1M (Wafer 3) */}
              <line
                x1="580"
                y1="420"
                x2={310 + 1 * sepX + 120}
                y2={290 + 1 * sepY}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.35) * 1.5))}
              />
              <circle cx="580" cy="420" r="3" fill="#38bdf8" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.35) * 1.5))} />

              {/* Lewy dół -> Prywatność & GPU (Wafer 4) */}
              <line
                x1="40"
                y1="480"
                x2={310 + 2 * sepX - 120}
                y2={290 + 2 * sepY}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity={Math.min(1, Math.max(0, (scrollProgress - 0.45) * 1.5))}
              />
              <circle cx="40" cy="480" r="3" fill="#38bdf8" opacity={Math.min(1, Math.max(0, (scrollProgress - 0.45) * 1.5))} />
            </svg>

            {/* ─────────────────────────────────────────────────────────────
                PŁYNNIE ROZPISUJĄCE SIĘ ADNOTACJE BOCZNE (STOPNIOWY REVEAL)
                ───────────────────────────────────────────────────────────── */}
            {/* Lewa góra: AI Chip Core & Modele */}
            <div
              className="absolute left-0 top-6 max-w-[170px] text-left font-mono hidden sm:block transition-all duration-300"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollProgress - 0.15) * 1.6)),
                transform: `translateX(${(1 - scrollProgress) * -16}px)`,
              }}
            >
              <p className="text-[11px] font-bold text-primary tracking-wider uppercase">// 01 MODELE & PERSONY</p>
              <p className="text-[10px] text-foreground/55 font-sans mt-0.5 leading-snug">
                GPT-5, Claude 3.7, Gemini i Grok + wybór charakteru czatu.
              </p>
            </div>

            {/* Prawa góra: Dokumenty & PDF */}
            <div
              className="absolute right-0 top-20 max-w-[170px] text-right font-mono hidden sm:block transition-all duration-300"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollProgress - 0.25) * 1.6)),
                transform: `translateX(${(1 - scrollProgress) * 16}px)`,
              }}
            >
              <p className="text-[11px] font-bold text-primary tracking-wider uppercase">// 02 MULTIMODAL & PLIKI</p>
              <p className="text-[10px] text-foreground/55 font-sans mt-0.5 leading-snug">
                Analiza PDF, Excel, kodu i generowanie zaawansowanych dokumentów.
              </p>
            </div>

            {/* Prawa dół: 1M Context Cache */}
            <div
              className="absolute right-0 bottom-20 max-w-[170px] text-right font-mono hidden sm:block transition-all duration-300"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollProgress - 0.35) * 1.6)),
                transform: `translateX(${(1 - scrollProgress) * 16}px)`,
              }}
            >
              <p className="text-[11px] font-bold text-primary tracking-wider uppercase">// 03 WSPÓLNY KONTEKST</p>
              <p className="text-[10px] text-foreground/55 font-sans mt-0.5 leading-snug">
                1 000 000 tokenów pamięci ciągłej bez utraty wątku i powtarzania promptu.
              </p>
            </div>

            {/* Lewy dół: Privacy & GPU Base */}
            <div
              className="absolute left-0 bottom-10 max-w-[170px] text-left font-mono hidden sm:block transition-all duration-300"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollProgress - 0.45) * 1.6)),
                transform: `translateX(${(1 - scrollProgress) * -16}px)`,
              }}
            >
              <p className="text-[11px] font-bold text-primary tracking-wider uppercase">// 04 PRYWATNOŚĆ & GPU</p>
              <p className="text-[10px] text-foreground/55 font-sans mt-0.5 leading-snug">
                Lokalny silnik Ollama (0 zł) i serwery w 100% zgodne z RODO w UE.
              </p>
            </div>

          </div>

        </div>

        {/* PRAWA STRONA: ZWIĘZŁA, PRZEJRZYSTA TYPOGRAFIA (BEZ ŚCIANY TEKSTU) */}
        <div className="lg:col-span-5 text-left space-y-6">
          <div className="space-y-3">
            <SecRule label="01 // ARCHITEKTURA RDZENIA" />
            <h2 className="font-heading text-[clamp(28px,4vw,48px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
              Chat AI ze wszystkimi <br className="hidden sm:block" />
              <span className="font-normal text-primary">modelami w 1 oknie.</span>
            </h2>
            <p className="font-sans text-[15px] font-light leading-relaxed text-foreground/70">
              Wszystkie topowe silniki AI zintegrowane w jednym procesorze neuronowym. Brak powtarzania promptów, błyskawiczne przełączanie w locie, rozmowy głosowe i pełna prywatność danych.
            </p>
          </div>

          {/* PUNKTY KORZYŚCI - DOKŁADNIE WEDŁUG WSKAZÓWEK */}
          <div className="space-y-3 font-sans">
            {[
              'Wszystkie topowe modele: GPT-5, Claude 3.7, Gemini 2.5, Grok 3 w 1 oknie',
              'Wspólny kontekst do 1 000 000 tokenów pamięci — brak konieczności powtarzania promptów',
              'Analiza i tworzenie zaawansowanych dokumentów: PDF, arkusze Excel, kod i obrazy',
              'Rozmowa głosowa w czasie rzeczywistym (Real-time Voice AI) oraz wybór charakteru i persony',
              'Prywatny tryb lokalny (Ollama / LM Studio) — dane w 100% na Twoim dysku (0 zł)',
            ].map((bullet) => (
              <div key={bullet} className="flex items-start gap-2.5 text-[13.5px] text-foreground/80 font-light">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10.5px] font-bold mt-0.5">
                  ✓
                </span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          {/* POZIOMY PASEK TELEMETRII (CZYSTY, BEZ KAFELKÓW) */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-foreground/[0.08]">
            <div className="space-y-0.5">
              <p className="font-heading text-[18px] font-bold text-foreground">165 t/s</p>
              <p className="text-[11.5px] text-foreground/50 font-light">Prędkość generacji</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-heading text-[18px] font-bold text-primary">&lt; 12 ms</p>
              <p className="text-[11.5px] text-foreground/50 font-light">Opóźnienie routingu</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-heading text-[18px] font-bold text-foreground">1 000 000</p>
              <p className="text-[11.5px] text-foreground/50 font-light">Pamięć kontekstu</p>
            </div>
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
   GŁÓWNY KOMPONENT: HomePage3 (KOMPLETNY, ZBALANSOWANY LEJEK 10 SEKCJI)
   ═══════════════════════════════════════════════════════════════════════ */
export function HomePage3({ onNavigate = () => {} }: { onNavigate?: (p: HomePageId) => void }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  return (
    <div className="relative flex w-full flex-col font-landing text-foreground">
      <AnimStyles />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nbElectricCurrent {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
      ` }} />
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
        <Section className="relative z-10 py-16 sm:py-24">
          <FadeIn>
            <UnifiedAIPlatformConvergence onNavigate={onNavigate} />
          </FadeIn>
        </Section>
      </div>

      <TechDivider />

      {/* ══════════ 3. MODUŁ 01: CHAT AI (ZIGZAG 3D EXPLODED HUD) ══════════ */}
      <Section className="relative z-10 py-16 sm:py-24">
        <FadeIn>
          <Module01ChatAiZigzagSection onNavigate={onNavigate} />
        </FadeIn>
      </Section>

      <TechDivider />

      {/* ══════════ 4. PRYWATNOŚĆ & LOKALNY AI (0 ZŁ OFFLINE) ══════════ */}
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

      {/* ══════════ 5. TRZY FILARY WARTOŚCI DLA BIZNESU ══════════ */}
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

      {/* ══════════ 6. START W 3 PROSTYCH KROKACH ══════════ */}
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

      {/* ══════════ 7. BEZPIECZEŃSTWO & SERWERY W UE ══════════ */}
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

      {/* ══════════ 8. KALKULACJA KOSZTÓW & PRICING ROI (ZAMIAST 5 SUBSKRYPCJI) ══════════ */}
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

      {/* ══════════ 9. ZAUFANIE UŻYTKOWNIKÓW (OPINIE) ══════════ */}
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

      {/* ══════════ 10. FAQ & FINALNE CTA ══════════ */}
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
