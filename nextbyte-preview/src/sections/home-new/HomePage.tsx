import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  ArrowRight, Check, ChevronDown, Sparkles, Coins, Shield,
  Zap, CircleCheck, X,
  Brain, Camera, NotebookPen, Cpu, Calendar,
  Users, Clock, Lock, Layers, Gauge, CpuIcon, FileText,
  KeyRound, Mic, Repeat, CheckCircle2, Globe,
  Building2, WifiOff, LogOut,
  Clapperboard,
  AudioLines,
  Folder, Search, Type, MonitorPlay, Move,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import {
  Section, GlowButton, GhostButton,
  Panel, IconTile, StepNumber, Glow, PageAmbience,
  HairLine, akcentTlo, AnimStyles, FadeIn,
  TechDivider, TechCornerMarks, MatrixAura,
} from './shared'
import {
  MODULY, POROWNANIE, OPINIE, FAQ,
} from './data'
import type { HomePage as HomePageId } from './types'

// Real photorealistic studio image assets
import interiorImg from '@/assets/studio/interior.jpg'
import carImg from '@/assets/studio/car.jpg'
import landscapeImg from '@/assets/studio/landscape.jpg'
import animalImg from '@/assets/studio/animal.jpg'

/* ------------------------------------------------------------------
   LOGA MODELI AI — do rozpoznania marki jednym rzutem oka (bez tekstu)
   ------------------------------------------------------------------ */
export type BrandIconProps = { className?: string; style?: React.CSSProperties }

export function OpenAIIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387 2.02-1.165a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.412-.666zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  )
}

export function AnthropicIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M13.827 3.52h3.603L24 20.521h-3.603zm-7.258 0h3.767L16.906 20.521H13.28l-1.435-3.899H5.588l-1.435 3.899H0Zm2.976 5.18-1.997 5.43h3.995z" />
    </svg>
  )
}

export function GeminiIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M11.9968 0C11.1394 6.97318 6.97318 11.1394 0 11.9968C6.97318 12.8542 11.1394 17.0205 11.9968 24C12.8542 17.0205 17.0205 12.8542 24 11.9968C17.0205 11.1394 12.8542 6.97318 11.9968 0Z" />
    </svg>
  )
}

export function XaiIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12.6144 13.8505 19.4637 22H16.3727L10.7916 14.9354 4.54546 22H1L8.89393 12.7276 2.53636 5H5.62738L10.7154 11.5372 16.4545 5H20ZM17.3455 20.2837H19.0182L6.70909 6.65671H4.98182Z" />
    </svg>
  )
}

export function GoogleIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053z" />
    </svg>
  )
}

/* ------------------------------------------------------------------
   1. MANIFEST INTERACTIVE COMPARISON (5 APPS CHAOS VS NEXTBYTE)
   ------------------------------------------------------------------ */
export function ChaosVsUnifiedCard() {
  const [activeTab, setActiveTab] = useState<'stack' | 'features'>('stack')

  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/50 p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80">
      <TechCornerMarks />
      {/* Background radial highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
      />

      {/* Header with Switcher */}
      <div className="flex items-center justify-between border-b border-foreground/[0.08] pb-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
          <span className="font-mono text-[10.5px] uppercase font-bold tracking-[1.5px] text-primary">
            Kalkulacja kosztów
          </span>
        </div>
        <div className="flex rounded-full border border-foreground/[0.1] bg-background/60 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('stack')}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
              activeTab === 'stack'
                ? 'bg-primary/20 text-primary font-bold shadow-sm'
                : 'text-foreground/60 hover:text-foreground'
            )}
          >
            Koszty
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
              activeTab === 'features'
                ? 'bg-primary/20 text-primary font-bold shadow-sm'
                : 'text-foreground/60 hover:text-foreground'
            )}
          >
            Dlaczego NextByte
          </button>
        </div>
      </div>

      {activeTab === 'stack' ? (
        <div key="stack" className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-tab-in">
          {/* LEWA STRONA: CHAOS */}
          <div className="rounded-2xl border border-foreground/[0.12] bg-foreground/[0.04] p-5 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-[11px] font-semibold text-foreground/45 tracking-wide">
                  5 subskrypcji osobno
                </span>
                <span className="rounded-lg bg-foreground/[0.07] text-foreground/45 border border-foreground/15 px-2 py-1 font-sans text-[10px] font-semibold">
                  Chaos
                </span>
              </div>
              <ul className="font-sans divide-y divide-foreground/[0.05]">
                {[
                  { name: 'ChatGPT Plus', price: '~85 zł/mc', icon: OpenAIIcon },
                  { name: 'Claude Pro', price: '~85 zł/mc', icon: AnthropicIcon },
                  { name: 'Midjourney', price: '~125 zł/mc', icon: Camera },
                  { name: 'Notion / Todoist', price: '~65 zł/mc', icon: NotebookPen },
                  { name: 'ElevenLabs', price: '~90 zł/mc', icon: Mic },
                ].map(({ name, price, icon: RowIcon }) => (
                  <li key={name} className="flex items-center justify-between py-2.5">
                    <span className="flex items-center gap-2 text-[13px] text-foreground/65">
                      <RowIcon className="h-3.5 w-3.5 text-foreground/35 shrink-0" />
                      {name}
                    </span>
                    <span className="text-[13px] font-medium text-foreground/50">{price}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-foreground/[0.08] pt-4">
              <p className="font-heading text-[22px] font-bold text-foreground/65">~450 zł/mc</p>
              <p className="mt-1.5 text-[11px] text-foreground/30 leading-snug">5 logowań · 5 faktur w USD</p>
            </div>
          </div>

          {/* PRAWA STRONA: NEXTBYTE */}
          <div className="relative rounded-2xl border border-primary/25 bg-card/60 p-5 flex flex-col">
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-[11px] font-semibold text-foreground/80 tracking-wide">
                  Ekosystem NextByte
                </span>
                <span className="rounded-lg bg-primary/15 text-primary border border-primary/25 px-2 py-1 font-sans text-[10px] font-semibold whitespace-nowrap">
                  All-in-one
                </span>
              </div>
              <ul className="font-sans divide-y divide-foreground/[0.05]">
                <li className="flex items-center gap-2.5 py-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex items-center gap-2 text-foreground/80">
                    <OpenAIIcon className="h-4 w-4 shrink-0 text-foreground/60" />
                    <AnthropicIcon className="h-4 w-4 shrink-0 text-foreground/60" />
                    <GeminiIcon className="h-4 w-4 shrink-0 text-foreground/60" />
                    <XaiIcon className="h-4 w-4 shrink-0 text-foreground/60" />
                    <span className="text-[13px] text-foreground/80 whitespace-nowrap ml-1">i wiele więcej</span>
                  </div>
                </li>
                {[
                  { text: 'Studio zdjęć 4K i Wideo AI', icon: Camera },
                  { text: 'Notatki AI i Kalendarz', icon: Calendar },
                  { text: 'Głos i transkrypcja AI', icon: Mic },
                  { text: 'Lokalny AI za 0 zł', icon: Cpu },
                ].map(({ text, icon: RowIcon }) => (
                  <li key={text} className="flex items-center gap-2.5 py-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <RowIcon className="h-3.5 w-3.5 text-foreground/45 shrink-0" />
                    <span className="text-[13px] text-foreground/80 whitespace-nowrap">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative z-10 border-t border-foreground/[0.08] pt-4">
              <p className="font-heading text-[22px] font-bold text-foreground whitespace-nowrap">
                Od <span className="text-primary font-bold">0 zł</span><span className="text-[14px] text-foreground/50 font-normal"> / mc</span>
              </p>
              <p className="mt-1.5 text-[11px] text-foreground/45 leading-snug">1 faktura VAT · po polsku · Serwery UE</p>
            </div>
          </div>
        </div>
      ) : (
        <div key="features" className="space-y-3 animate-tab-in">
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
            <div key={idx} className="rounded-xl border border-foreground/[0.08] bg-background/50 p-3.5">
              <p className="text-[12.5px] font-heading font-semibold text-foreground mb-1.5 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary font-mono text-[10px] font-bold">
                  {idx + 1}
                </span>
                {item.title}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mt-2">
                <div className="rounded-lg bg-foreground/[0.05] border border-foreground/[0.1] p-2 text-foreground/55">
                  <span className="font-mono text-[9px] uppercase text-foreground/50 font-bold block mb-0.5">Osobne appki:</span>
                  {item.before}
                </div>
                <div className="rounded-lg bg-primary/10 border border-primary/30 p-2 text-foreground/90">
                  <span className="font-mono text-[9px] uppercase text-primary font-bold block mb-0.5">NextByte:</span>
                  {item.after}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-foreground/[0.06] flex items-center justify-between text-[11px] text-foreground/50">
        <span className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Dane chronione szyfrowaniem E2EE</span>
        </span>
        <span className="font-mono text-[10px] text-primary/70 font-semibold">
          Zgodne z europejskim RODO
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   1.5. MODEL ECOSYSTEM & TRUSTED INFRASTRUCTURE BRIDGE
   ------------------------------------------------------------------ */
export function ModelEcosystemBridge() {
  const logos = [
    {
      name: 'OpenAI', model: 'GPT-5.4',
      svg: <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387 2.02-1.165a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.412-.666zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>,
    },
    {
      name: 'Anthropic', model: 'Claude Sonnet & Opus',
      svg: <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor"><path d="M13.827 3.52h3.603L24 20.521h-3.603zm-7.258 0h3.767L16.906 20.521H13.28l-1.435-3.899H5.588l-1.435 3.899H0Zm2.976 5.18-1.997 5.43h3.995z"/></svg>,
    },
    {
      name: 'Gemini', model: 'Gemini 3.1 Pro Preview',
      svg: <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor"><path d="M11.9968 0C11.1394 6.97318 6.97318 11.1394 0 11.9968C6.97318 12.8542 11.1394 17.0205 11.9968 24C12.8542 17.0205 17.0205 12.8542 24 11.9968C17.0205 11.1394 12.8542 6.97318 11.9968 0Z"/></svg>,
    },
    {
      name: 'xAI', model: 'Grok 4.3',
      svg: <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor"><path d="M12.6144 13.8505 19.4637 22H16.3727L10.7916 14.9354 4.54546 22H1L8.89393 12.7276 2.53636 5H5.62738L10.7154 11.5372 16.4545 5H20ZM17.3455 20.2837H19.0182L6.70909 6.65671H4.98182Z"/></svg>,
    },
    {
      name: 'ElevenLabs', model: 'Voice AI',
      svg: <svg viewBox="0 0 14 24" className="h-6 w-4 shrink-0" fill="currentColor"><rect x="0" y="0" width="4" height="24" rx="1"/><rect x="10" y="0" width="4" height="24" rx="1"/></svg>,
    },
    {
      name: 'Google', model: 'Nano Banana Pro',
      svg: <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053z"/></svg>,
    },
  ]

  const track = [...logos, ...logos, ...logos]

  return (
    <div
      className="relative z-10 w-full mt-10 mb-12 overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
      }}
    >

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.3333%) } }
        .marquee-track { animation: marquee 32s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}} />

      <div className="flex marquee-track w-max">
        {track.map((logo, i) => (
          <div
            key={i}
            className="mx-3 flex items-center gap-3.5 rounded-2xl border border-foreground/[0.08] bg-card/50 px-5 py-3.5 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80 shrink-0"
          >
            <span className="text-foreground/75">{logo.svg}</span>
            <div>
              <p className="font-grotesk text-[13px] font-semibold text-foreground leading-none">{logo.name}</p>
              <p className="font-sans text-[11px] text-foreground/40 mt-0.5">{logo.model}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   2. SCREEN 2 INSPIRATION: GIANT ATMOSPHERIC HEMISPHERE ARCH
   ------------------------------------------------------------------ */
export function HemisphereArchSection() {
  return (
    <div className="relative py-20 text-center font-sans">
      {/* Płynna, miękka kopuła świetlna — zero ostrych odcięć */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -top-12 -translate-x-1/2 w-full max-w-5xl h-[380px] flex items-center justify-center overflow-visible"
        style={{
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 60%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 60%, black 30%, transparent 80%)',
        }}
      >
        {/* Wewnętrzny miękki glow */}
        <div
          className="absolute w-[800px] h-[340px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.25)_0%,hsl(var(--primary)/0.05)_50%,transparent_75%)] blur-2xl"
        />
        
        {/* Płynny łuk wektorowy SVG z gradientem wygaszania na krawędziach */}
        <svg
          viewBox="0 0 1000 350"
          className="relative w-full h-full opacity-70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="archGlow" x1="0%" y1="100%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="25%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
              <stop offset="75%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 50 330 C 200 60, 800 60, 950 330"
            stroke="url(#archGlow)"
            strokeWidth="1.75"
            filter="url(#softGlow)"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <h2 className="font-heading text-[clamp(32px,5vw,56px)] font-light leading-[1.08] tracking-[-2px] text-foreground mb-4">
          Zmieniasz model.<br />
          <span className="text-primary font-normal drop-shadow-[0_0_36px_hsl(var(--primary)/0.45)]">
            Rozmowa zostaje.
          </span>
        </h2>

        <p className="mx-auto max-w-xl text-[15.5px] leading-relaxed text-foreground/60 mb-14 font-light">
          Swobodne przełączanie między GPT, Claude, Gemini i Grok w tym samym wątku. Bez kopiowania promptów i bez utraty wypracowanego kontekstu.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 text-left">
          {[
            {
              icon: Repeat,
              title: 'Przełącz model w locie',
              desc: 'Zmieniasz silnik w trakcie rozmowy jednym kliknięciem, gdy potrzebujesz innej perspektywy lub głębszej logiki.',
            },
            {
              icon: Clock,
              title: 'Historia zawsze pod ręką',
              desc: 'Wszystkie sesje i wątki bezpiecznie zapisane. Błyskawiczny powrót do ustaleń sprzed tygodni bez utraty danych.',
            },
            {
              icon: NotebookPen,
              title: 'Notatki rosną same',
              desc: 'Kluczowe wnioski i podsumowania z rozmów trafiają bezpośrednio do Twojej bazy wiedzy bez ręcznego przeklejania.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/40 backdrop-blur-sm p-6 pt-5 flex flex-col gap-3 transition-all duration-300 hover:border-primary/30 hover:bg-card/70 hover:-translate-y-1"
            >
              {/* watermark icon */}
              <item.icon
                aria-hidden
                className="pointer-events-none absolute right-3 top-3 h-16 w-16 text-foreground/[0.05] transition-colors duration-300 group-hover:text-primary/[0.08]"
              />

              <div className="relative z-10">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <item.icon className="h-5 w-5" />
                </span>
              </div>

              <h3 className="relative z-10 font-heading text-[17px] font-semibold text-foreground leading-snug tracking-[-0.4px] mt-1">
                {item.title}
              </h3>
              <p className="relative z-10 text-[13px] leading-relaxed text-foreground/50 font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   3. HERO COMMAND APP MOCKUP (AUTHENTIC NEXTBYTE PLATFORM LIVE DEMO)
   ------------------------------------------------------------------ */
/* ------------------------------------------------------------------
   2.5. KANBAN TASKS VIEW (REAL HTML5 DRAG & DROP & UNIVERSAL TASKS)
   ------------------------------------------------------------------ */
function KanbanTasksView({
  tasks,
  setTasks,
  moveTask,
}: {
  tasks: { [col: string]: Array<{ id: string; title: string; tag: string; tagColor: string; author: string }> }
  setTasks: React.Dispatch<React.SetStateAction<{ [col: string]: Array<{ id: string; title: string; tag: string; tagColor: string; author: string }> }>>
  moveTask: (fromCol: string, toCol: string, taskId: string) => void
}) {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [sprintDropdownOpen, setSprintDropdownOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('Wszystkie zadania')
  const [selectedSprint, setSelectedSprint] = useState('Sprint 42 (Bieżący)')
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  const addNewTask = () => {
    const id = Date.now().toString()
    setTasks(prev => ({
      ...prev,
      todo: [
        {
          id,
          title: `Nowe zadanie z asystenta AI #${prev.todo.length + 1}`,
          tag: 'Normalny',
          tagColor: 'bg-primary/15 text-primary border-primary/30',
          author: 'Artur B.',
        },
        ...prev.todo,
      ],
    }))
  }

  const changePriority = (colId: string, taskId: string, tag: string, tagColor: string) => {
    setTasks(prev => ({
      ...prev,
      [colId]: prev[colId].map(t => (t.id === taskId ? { ...t, tag, tagColor } : t)),
    }))
    setActiveCardMenuId(null)
  }

  const deleteTask = (colId: string, taskId: string) => {
    setTasks(prev => ({
      ...prev,
      [colId]: prev[colId].filter(t => t.id !== taskId),
    }))
    setActiveCardMenuId(null)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string, sourceCol: string) => {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.setData('sourceCol', sourceCol)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== colId) {
      setDragOverCol(colId)
    }
  }

  const handleDrop = (e: React.DragEvent, targetCol: string) => {
    e.preventDefault()
    setDragOverCol(null)
    const taskId = e.dataTransfer.getData('taskId')
    const sourceCol = e.dataTransfer.getData('sourceCol')
    if (taskId && sourceCol && sourceCol !== targetCol) {
      moveTask(sourceCol, targetCol, taskId)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-5">
      {/* Kanban Interactive Toolbar & Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* DROPDOWN 1: FILTR ZADAŃ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setFilterDropdownOpen(!filterDropdownOpen)
                setSprintDropdownOpen(false)
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 hover:border-primary/40 transition-all shadow-sm"
            >
              <span className="text-primary font-bold">⚡ Widok:</span>
              <span>{selectedFilter}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-muted-foreground transition-transform',
                  filterDropdownOpen && 'rotate-180 text-primary'
                )}
              />
            </button>

            {filterDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-48 rounded-xl border border-border/60 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                {['Wszystkie zadania', 'Tylko z Chat AI', 'Pilne priorytety', 'Studio Grafiki'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedFilter(opt)
                      setFilterDropdownOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                      selectedFilter === opt
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-foreground/75 hover:bg-foreground/[0.06] hover:text-foreground'
                    )}
                  >
                    <span>{opt}</span>
                    {selectedFilter === opt && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DROPDOWN 2: SPRINT & PROJEKTY */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSprintDropdownOpen(!sprintDropdownOpen)
                setFilterDropdownOpen(false)
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 hover:border-primary/40 transition-all shadow-sm"
            >
              <span className="text-muted-foreground">Sprint:</span>
              <span>{selectedSprint}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-muted-foreground transition-transform',
                  sprintDropdownOpen && 'rotate-180 text-primary'
                )}
              />
            </button>

            {sprintDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-52 rounded-xl border border-border/60 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                {['Sprint 42 (Bieżący)', 'Sprint 43 (Planowany)', 'Kampania B2B NextByte', 'Archiwum'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSelectedSprint(s)
                      setSprintDropdownOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                      selectedSprint === s
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-foreground/75 hover:bg-foreground/[0.06] hover:text-foreground'
                    )}
                  >
                    <span>{s}</span>
                    {selectedSprint === s && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Button */}
        <button
          type="button"
          onClick={addNewTask}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3.5 py-1 text-xs font-bold text-primary hover:bg-primary/25 transition-all shadow-sm active:scale-95"
        >
          <span>+ Nowe zadanie</span>
        </button>
      </div>

      {/* 4 Kanban Columns with HTML5 Drag & Drop Support */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-1">
        {[
          { id: 'todo', title: 'Do zrobienia', count: tasks.todo.length, nextCol: 'inProgress' },
          { id: 'inProgress', title: 'W trakcie', count: tasks.inProgress.length, nextCol: 'review' },
          { id: 'review', title: 'Do sprawdzenia', count: tasks.review.length, nextCol: 'done' },
          { id: 'done', title: 'Gotowe', count: tasks.done.length, nextCol: 'todo' },
        ].map(col => {
          const isOver = dragOverCol === col.id
          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.id)}
              className={cn(
                'flex flex-col rounded-xl border p-3 min-h-[190px] relative transition-all duration-200',
                isOver
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.25)] scale-[1.01]'
                  : 'border-primary/20 bg-card/50'
              )}
            >
              <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-2">
                <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                  <span className={cn('h-2 w-2 rounded-full', col.id === 'done' ? 'bg-primary' : col.id === 'inProgress' ? 'bg-primary/60' : 'bg-foreground/25')} />
                  {col.title}
                </span>
                <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.2 text-[10px] font-mono text-primary font-bold">
                  {col.count}
                </span>
              </div>

              <div className="flex-1 space-y-2">
                {tasks[col.id]?.map(t => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={e => handleDragStart(e, t.id, col.id)}
                    className="group relative rounded-xl border border-border/40 bg-card/90 p-3 transition-all hover:border-primary/50 hover:bg-card shadow-sm cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <p className="text-[12px] font-medium text-foreground leading-snug">{t.title}</p>

                      {/* Action Menu Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation()
                            setActiveCardMenuId(activeCardMenuId === t.id ? null : t.id)
                          }}
                          className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-colors"
                        >
                          ···
                        </button>

                        {/* DROPDOWN: CARD CONTEXT ACTIONS */}
                        {activeCardMenuId === t.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border/70 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                            <p className="px-2 py-1 text-[9.5px] font-mono uppercase text-muted-foreground/60 border-b border-border/20">
                              Przenieś kolumnę:
                            </p>
                            {[
                              { id: 'todo', name: 'Do zrobienia' },
                              { id: 'inProgress', name: 'W trakcie' },
                              { id: 'review', name: 'Do sprawdzenia' },
                              { id: 'done', name: 'Gotowe' },
                            ]
                              .filter(c => c.id !== col.id)
                              .map(target => (
                                <button
                                  key={target.id}
                                  type="button"
                                  onClick={() => {
                                    moveTask(col.id, target.id, t.id)
                                    setActiveCardMenuId(null)
                                  }}
                                  className="w-full text-left px-2 py-1 text-[11px] text-foreground/80 hover:bg-primary/15 hover:text-primary rounded-md transition-colors"
                                >
                                  ↓ {target.name}
                                </button>
                              ))}

                            <p className="px-2 pt-2 pb-1 text-[9.5px] font-mono uppercase text-muted-foreground/60 border-t border-border/20 mt-1">
                              Priorytet:
                            </p>
                            <div className="flex gap-1 px-1">
                              <button
                                type="button"
                                onClick={() =>
                                  changePriority(
                                    col.id,
                                    t.id,
                                    'Pilny',
                                    'bg-destructive/15 text-destructive border-destructive/30'
                                  )
                                }
                                className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
                              >
                                Pilny
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  changePriority(
                                    col.id,
                                    t.id,
                                    'Normalny',
                                    'bg-primary/15 text-primary border-primary/30'
                                  )
                                }
                                className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                              >
                                Normalny
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteTask(col.id, t.id)}
                              className="w-full text-left px-2 py-1 mt-1 text-[10.5px] text-destructive hover:bg-destructive/15 rounded-md transition-colors"
                            >
                              Usuń zadanie
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-foreground/[0.04] mt-1">
                      <span className={cn('rounded-full border px-2 py-0.2 text-[9.5px] font-bold', t.tagColor)}>
                        {t.tag}
                      </span>
                      <span className="text-[9.5px] font-mono text-muted-foreground">
                        {t.author}
                      </span>
                    </div>
                  </div>
                ))}

                {tasks[col.id]?.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-7 text-[11.5px] text-muted-foreground/40 border border-dashed border-border/20 rounded-xl">
                    <span className="text-sm opacity-40 mb-1">◻</span>
                    <span>Upuść zadanie tutaj</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Drag & Drop Helper */}
      <div className="pt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Move className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-primary font-bold">Drag &amp; Drop:</span>
        <span>Chwyć dowolną kartę i przeciągnij ją pomiędzy kolumnami lub kliknij menu ··· aby zmienić stan.</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   3. HERO COMMAND APP MOCKUP (AUTHENTIC NEXTBYTE PLATFORM LIVE DEMO)
   ------------------------------------------------------------------ */
export function HeroAppMockup() {
  const [activeTab, setActiveTab] = useState<'chat' | 'studio' | 'tasks'>('chat')
  const [selectedModel, setSelectedModel] = useState('pro')
  const [promptInput, setPromptInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [bytesUsed, setBytesUsed] = useState(74)
  const [studioSubTab, setStudioSubTab] = useState('gpt2')
  const [isStudioGenerating, setIsStudioGenerating] = useState(false)
  const [studioJustGenerated, setStudioJustGenerated] = useState(false)
  const [webSearchEnabled, setWebSearchEnabled] = useState(true)
  const [docsModeEnabled, setDocsModeEnabled] = useState(false)
  const [imagesModeEnabled, setImagesModeEnabled] = useState(false)

  // Universal realistic Kanban tasks
  const [tasks, setTasks] = useState<{ [col: string]: Array<{ id: string; title: string; tag: string; tagColor: string; author: string }> }>({
    todo: [
      {
        id: '1',
        title: 'Przygotować brief pod nową kampanię B2B w LinkedIn',
        tag: 'Normalny',
        tagColor: 'bg-primary/15 text-primary border-primary/30',
        author: 'Artur B.',
      },
      {
        id: '2',
        title: 'Research modeli LLM pod analizę dokumentacji prawnej',
        tag: 'Ważny',
        tagColor: 'bg-primary/15 text-primary border-primary/30',
        author: 'AI Agent',
      },
    ],
    inProgress: [
      {
        id: '3',
        title: 'Generowanie 4 wariantów grafik 4K w Studio Zdjęć',
        tag: 'Pilny',
        tagColor: 'bg-destructive/15 text-destructive border-destructive/30',
        author: 'Studio AI',
      },
    ],
    review: [
      {
        id: '4',
        title: 'Audyt bezpieczeństwa danych i zgodności RODO',
        tag: 'Review',
        tagColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        author: 'Zarząd',
      },
    ],
    done: [
      {
        id: '5',
        title: 'Wdrożenie zintegrowanego ekosystemu NextByte',
        tag: 'Gotowe',
        tagColor: 'bg-primary/15 text-primary border-primary/30',
        author: 'NextByte Team',
      },
    ],
  })

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string; details?: string[] }>>([
    {
      role: 'user',
      text: 'Napisz post na LinkedIn o naszym nowym kursie i zrób do niego grafikę.',
      time: '10:02',
    },
    {
      role: 'assistant',
      text: 'Gotowe — post i grafika czekają:',
      time: '10:02',
      details: [
        'Post w trzech długościach, do wyboru pod feed albo artykuł.',
        '4 grafiki w Studio Zdjęć — wersje kwadratowa i pionowa.',
        '✓ Zapisano w Notatkach  ·  ✓ Zadanie trafiło na Kanban',
      ],
    },
  ])

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)

  const MODELS = [
    { id: 'pro',          name: 'Gemini 3.1 Pro',   vendor: 'Google',     cost: 2,  hint: 'Multimodalność & Deep Research', tag: 'Polecany' },
    { id: 'imagen',       name: 'Nano Banana Pro',  vendor: 'Google',     cost: 2,  hint: 'Generowanie obrazów 4K',          tag: 'Obraz' },
    { id: 'grok43',       name: 'Grok 4.3',         vendor: 'xAI',        cost: 2,  hint: 'Agentic reasoning & live web',   tag: 'Agentic' },
    { id: 'gpt54',        name: 'GPT-5.4',          vendor: 'OpenAI',     cost: 4,  hint: 'Flagowe rozumowanie & asystent', tag: 'Flagship' },
    { id: 'claude-sonnet',name: 'Claude Sonnet',    vendor: 'Anthropic',  cost: 3,  hint: 'Szybka analiza & synteza',       tag: 'Szybki' },
    { id: 'claude-opus',  name: 'Claude Opus',      vendor: 'Anthropic',  cost: 23, hint: 'Coding & zaawansowana logika',   tag: 'Kod & Logika' },
  ]

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Automatyczne płynne przewijanie czatu w dół po wysłaniu wiadomości i odpowiedzi AI
  useEffect(() => {
    if (activeTab === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, isGenerating, activeTab])

  const handleSend = (customPrompt?: string) => {
    const textToSend = customPrompt || promptInput
    if (!textToSend.trim() || isGenerating) return

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', text: textToSend, time: userTime }])
    setPromptInput('')
    setIsGenerating(true)

    // Deduct byte
    setBytesUsed(prev => prev + currentModel.cost)

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `[${currentModel.name}] Odpowiedź wygenerowana dla zapytania:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          details: [
            `· Opracowano trafną analizę dla "${textToSend.slice(0, 42)}...".`,
            `· Wynik zsynchronizowany z modułami Zadania i Notatki.`,
            `✓ Zużyto: ${currentModel.cost} Byte  ·  ✓ Tokeny: ~1.4k tok`,
          ],
        },
      ])
      setIsGenerating(false)
    }, 800)
  }

  const handleStudioGenerate = () => {
    if (isStudioGenerating) return
    setIsStudioGenerating(true)
    setStudioJustGenerated(false)
    setBytesUsed(prev => prev + 4)
    setTimeout(() => {
      setIsStudioGenerating(false)
      setStudioJustGenerated(true)
      setTimeout(() => setStudioJustGenerated(false), 2200)
    }, 900)
  }

  const moveTask = (fromCol: string, toCol: string, taskId: string) => {
    const item = tasks[fromCol]?.find(t => t.id === taskId)
    if (!item) return
    setTasks(prev => ({
      ...prev,
      [fromCol]: prev[fromCol].filter(t => t.id !== taskId),
      [toCol]: [item, ...prev[toCol]],
    }))
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl font-sans text-foreground text-left">
      {/* Ambient glow behind workspace */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-b from-primary/30 via-primary/8 to-transparent opacity-80 blur-3xl"
      />

      <Panel glow className="relative overflow-hidden rounded-2xl border-primary/30 bg-card/95 shadow-[0_25px_90px_-20px_hsl(var(--primary)/0.4)]">
        {/* NextByte Real Top Navigation Header */}
        <div className="relative flex flex-wrap items-center justify-between border-b border-foreground/[0.08] bg-foreground/[0.02] px-4 py-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-foreground/15 border border-foreground/10" />
              <span className="h-3 w-3 rounded-full bg-foreground/10 border border-foreground/[0.07]" />
              <span className="h-3 w-3 rounded-full bg-primary/50 border border-primary/30" />
            </div>

            <div className="flex items-center gap-2 pl-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold text-xs shadow-sm">
                NB
              </span>
              <span className="font-heading font-semibold text-[13.5px] text-foreground tracking-tight">
                NextByte
              </span>
            </div>

            <span className="hidden sm:inline-block font-mono text-[11px] text-foreground/40 pl-2">
              nextbyte.space/{activeTab === 'chat' ? 'chat-ai' : activeTab === 'studio' ? 'studio-zdjec' : 'zadania'}
            </span>
          </div>

          {/* Module Switcher Pills (Real NextByte Tab Bar) */}
          <div className="flex rounded-full border border-primary/20 bg-background/50 p-1 backdrop-blur-md">
            {[
              { id: 'chat', label: 'Chat AI', icon: Brain },
              { id: 'studio', label: 'Studio Zdjęć', icon: Camera },
              { id: 'tasks', label: 'Zadania Kanban', icon: Layers },
            ].map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-medium transition-all duration-200',
                    active
                      ? 'bg-primary text-background font-semibold shadow-md'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

        </div>

        {/* Workspace Body */}
        <div className="min-h-[420px] bg-background/80 flex flex-col justify-between">
          {/* =========================================================================
              VIEW 1: REAL NEXTBYTE CHAT AI
              ========================================================================= */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 animate-tab-in">
              {/* Message Feed — zoptymalizowana, wyśrodkowana szerokość max-w-[700px] ze scrollem */}
              <div ref={chatScrollRef} className="mx-auto w-full max-w-2xl sm:max-w-[700px] space-y-4 max-h-[280px] overflow-y-auto pr-2 scroll-smooth">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-start gap-2.5 w-full',
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <span
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border',
                          msg.role === 'user'
                            ? 'border-primary/40 bg-primary/20 text-primary'
                            : 'border-foreground/15 bg-card text-foreground'
                        )}
                      >
                        {msg.role === 'user' ? 'AB' : <Sparkles className="h-3.5 w-3.5 text-primary" />}
                      </span>
                    </div>

                    {/* Content Box */}
                    <div
                      className={cn(
                        'max-w-[85%] sm:max-w-[80%] flex flex-col',
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-2xl p-3.5 text-[13px] leading-relaxed shadow-sm font-sans',
                          msg.role === 'user'
                            ? 'rounded-tr-sm bg-card/60 border border-primary/40 text-foreground/95 shadow-[0_4px_20px_-6px_hsl(var(--primary)/0.2)]'
                            : 'rounded-tl-sm bg-card/70 border border-foreground/[0.08] text-foreground/90 font-light'
                        )}
                      >
                        <p>{msg.text}</p>
                        {msg.details && (
                          <div className="mt-2.5 pt-2 border-t border-border/30 space-y-1 text-[11.5px] text-muted-foreground">
                            {msg.details.map((d, di) => (
                              <p key={di} className="flex items-center gap-1.5">
                                <span className="text-primary">•</span> {d}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 px-1 pt-1 font-mono">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex items-center gap-2 text-primary font-mono text-[11px] animate-pulse py-1 pl-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{currentModel.name} odpowiada...</span>
                  </div>
                )}
              </div>

              {/* Real NextByte Chat Input Box — wyśrodkowany max-w-[700px] */}
              <div className="mt-4 mx-auto w-full max-w-2xl sm:max-w-[700px] rounded-[1.5rem] border border-border/60 bg-card/70 p-2 shadow-xl focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] transition-all">
                {/* Top Toolbar: Streamlined Model Search Dropdown & Modifiers */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1.5 border-b border-border/20">
                  {/* MODEL SEARCH DROPDOWN TRIGGER */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[11.5px] font-medium text-foreground hover:bg-primary/25 hover:border-primary/60 transition-all shadow-sm group"
                    >
                      <Zap className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-foreground">{currentModel.name}</span>
                      <span className="font-mono text-[10px] text-primary/70 font-semibold">
                        ⟠ {currentModel.cost}
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-3 w-3 text-muted-foreground transition-transform',
                          modelDropdownOpen && 'rotate-180 text-primary'
                        )}
                      />
                    </button>

                    {/* MODEL DROPDOWN — otwiera się W GÓRĘ */}
                    {modelDropdownOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-56 rounded-xl border border-primary/30 bg-card p-1.5 shadow-2xl backdrop-blur-md z-50 font-sans animate-tab-in origin-bottom">
                        {MODELS.map(m => {
                          const isSelected = selectedModel === m.id
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => { setSelectedModel(m.id); setModelDropdownOpen(false) }}
                              className={cn(
                                'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-all',
                                isSelected
                                  ? 'bg-primary/15 text-primary'
                                  : 'text-foreground/75 hover:bg-foreground/[0.06] hover:text-foreground'
                              )}
                            >
                              <div>
                                <p className="text-[11.5px] font-semibold leading-tight">{m.name}</p>
                                <p className="text-[9.5px] text-muted-foreground font-mono">{m.vendor}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] font-bold text-primary">
                                  {m.cost === 0 ? 'Free' : `⟠ ${m.cost}`}
                                </span>
                                {isSelected && <Check className="h-3 w-3 text-primary shrink-0" />}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Modifiers (Dokumenty, Obrazy, WEB) — proste ikony, bez pigułek */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDocsModeEnabled(!docsModeEnabled)}
                      title="Dokumenty"
                      className={cn(
                        'transition-colors',
                        docsModeEnabled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagesModeEnabled(!imagesModeEnabled)}
                      title="Obrazy"
                      className={cn(
                        'transition-colors',
                        imagesModeEnabled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                      title="Wyszukiwanie w sieci"
                      className={cn(
                        'transition-colors',
                        webSearchEnabled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Globe className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Input Textarea */}
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center px-2 py-1.5 gap-2"
                >
                  <input
                    type="text"
                    value={promptInput}
                    onChange={e => setPromptInput(e.target.value)}
                    placeholder="Wpisz zapytanie do AI... (np. Napisz post na LinkedIn, stwórz grafikę, zrób zadanie)"
                    className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none font-sans"
                  />

                  {/* Token counter & Send Button */}
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground/70">
                      <Layers className="h-3 w-3" />
                      ~1.8k tok
                    </span>
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary px-3.5 py-1.5 text-[12px] font-bold text-background shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <span>Wyślij</span>
                      <span className="font-mono text-[10px]">· {currentModel.cost} ⟠</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: REAL NEXTBYTE STUDIO ZDJĘĆ
              ========================================================================= */}
          {activeTab === 'studio' && (
            <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 animate-tab-in">
              {/* Studio Sub-Navigation — silniki generowania */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3">
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'gpt2', label: 'GPT Image 2.0' },
                    { id: 'grok', label: 'Grok Imagine' },
                    { id: 'nb-pro', label: 'Nano Banana Pro' },
                    { id: 'nb2', label: 'Nano Banana 2' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setStudioSubTab(sub.id)}
                      className={cn(
                        'rounded-full px-3 py-1 text-[11.5px] font-medium transition-all',
                        studioSubTab === sub.id
                          ? 'border border-primary/40 bg-primary/15 text-primary font-semibold shadow-sm'
                          : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]'
                      )}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span>Wielkość: 75%</span>
                  <span className="h-3 w-px bg-border" />
                  <span className="text-primary font-bold">
                    Silnik: {
                      studioSubTab === 'gpt2' ? 'GPT Image 2.0' :
                      studioSubTab === 'grok' ? 'Grok Imagine' :
                      studioSubTab === 'nb-pro' ? 'Nano Banana Pro' :
                      'Nano Banana 2'
                    }
                  </span>
                </div>
              </div>

              {/* Photorealistic AI Generated Image Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                {[
                  {
                    title: 'Luksusowy Penthouse',
                    desc: 'Wnętrze · Warm Ambient 4K',
                    ratio: '16:9 4K',
                    image: interiorImg,
                    tag: 'Nano Banana Pro',
                  },
                  {
                    title: 'Hypercar Studio Render',
                    desc: 'Motoryzacja · Raytracing',
                    ratio: '16:9 4K',
                    image: carImg,
                    tag: 'GPT Image 2.0',
                  },
                  {
                    title: 'Fiordy o Złotej Godzinie',
                    desc: 'Krajobraz · NatGeo Quality',
                    ratio: '16:9 4K',
                    image: landscapeImg,
                    tag: 'Grok Imagine',
                  },
                  {
                    title: 'Irbis Śnieżny w Tatrach',
                    desc: 'Zwierzę · Hyper-detail Fur',
                    ratio: '16:9 4K',
                    image: animalImg,
                    tag: 'Nano Banana 2',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative h-36 sm:h-40 rounded-2xl border border-foreground/[0.15] bg-card overflow-hidden transition-all hover:border-primary/80 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.3)] cursor-pointer"
                  >
                    {/* Real Generated Image */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 transition-opacity group-hover:opacity-80" />

                    {/* Top Badges */}
                    <div className="relative z-10 flex items-center justify-between p-2.5">
                      <span className="rounded-md bg-black/60 px-2 py-0.5 font-mono text-[9.5px] font-bold text-primary backdrop-blur-md border border-primary/30 shadow-sm">
                        {item.tag}
                      </span>
                      <span className="rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[9px] text-white/70 backdrop-blur-sm">
                        {item.ratio}
                      </span>
                    </div>

                    {/* Feedback: generowanie / świeżo gotowe (tylko na pierwszym kafelku) */}
                    {idx === 0 && isStudioGenerating && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/70 backdrop-blur-sm">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <span className="font-mono text-[10.5px] font-bold text-primary animate-pulse">Generowanie...</span>
                      </div>
                    )}
                    {idx === 0 && studioJustGenerated && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-primary/20 backdrop-blur-sm ring-2 ring-primary animate-tab-in">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                        <span className="font-mono text-[10.5px] font-bold text-primary">Gotowe · 4K</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Studio Bottom Generation Bar */}
              <div className="rounded-2xl border border-border/60 bg-card/80 p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2 flex-1 w-full">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Camera className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    defaultValue="Wizualizacja nowoczesnego bolidu wyścigowego w jakości 4K..."
                    className="flex-1 bg-transparent text-[12.5px] text-foreground outline-none font-sans"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-lg border border-border/40 px-2 py-1 font-mono text-[10.5px] text-muted-foreground">
                    Auto · 2K
                  </span>
                  <button
                    type="button"
                    onClick={handleStudioGenerate}
                    disabled={isStudioGenerating}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[12px] font-bold text-background shadow-md transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    <Sparkles className={cn('h-3.5 w-3.5', isStudioGenerating && 'animate-pulse')} />
                    <span>{isStudioGenerating ? 'Generowanie...' : 'Generuj (⟠ 4)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: REAL NEXTBYTE ZADANIA (KANBAN WITH DRAG & DROP)
              ========================================================================= */}
          {activeTab === 'tasks' && (
            <div className="animate-tab-in">
              <KanbanTasksView tasks={tasks} setTasks={setTasks} moveTask={moveTask} />
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------------
   4. KARTA MODUŁU
   ------------------------------------------------------------------ */
const METRIC_ICONS: Record<string, [LucideIcon, LucideIcon, LucideIcon]> = {
  chat: [CpuIcon, Zap, Layers],
  studio: [Sparkles, Gauge, Lock],
  notes: [Clock, FileText, Layers],
  calendar: [Clock, Zap, Repeat],
  video: [Clock, Gauge, CpuIcon],
  voice: [Zap, CheckCircle2, Mic],
}

export function getModuleVisual(mod: (typeof MODULY)[number], color: string) {
    if (mod.id === 'chat') return (
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: 'GPT', svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387 2.02-1.165a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.412-.666zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg> },
            { name: 'Claude', svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M13.827 3.52h3.603L24 20.521h-3.603zm-7.258 0h3.767L16.906 20.521H13.28l-1.435-3.899H5.588l-1.435 3.899H0Zm2.976 5.18-1.997 5.43h3.995z"/></svg> },
            { name: 'Gemini', svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M11.9968 0C11.1394 6.97318 6.97318 11.1394 0 11.9968C6.97318 12.8542 11.1394 17.0205 11.9968 24C12.8542 17.0205 17.0205 12.8542 24 11.9968C17.0205 11.1394 12.8542 6.97318 11.9968 0Z"/></svg> },
            { name: 'Grok', svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12.6144 13.8505 19.4637 22H16.3727L10.7916 14.9354 4.54546 22H1L8.89393 12.7276 2.53636 5H5.62738L10.7154 11.5372 16.4545 5H20ZM17.3455 20.2837H19.0182L6.70909 6.65671H4.98182Z"/></svg> },
          ].map(({ name, svg }) => (
            <div key={name} className="flex flex-col items-center gap-1.5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] py-3">
              <span className="text-foreground/80">{svg}</span>
              <span className="font-sans text-[10.5px] font-medium text-foreground/55">{name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] px-3.5 py-3">
          <Layers className="h-4 w-4 shrink-0" style={{ color }} />
          <span className="font-sans text-[12px] font-medium text-foreground/70 shrink-0">Wspólny kontekst</span>
          <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-foreground/[0.08]">
            <div className="h-full w-[72%] rounded-full" style={{ background: color, opacity: 0.8 }} />
          </div>
          <span className="font-grotesk text-[12px] font-bold text-foreground shrink-0">1M tok</span>
        </div>
      </div>
    )
    if (mod.id === 'studio') return (
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Nano Banana', svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053z"/></svg> },
            { name: 'GPT Image 2.0', svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387 2.02-1.165a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.412-.666zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg> },
            { name: 'Grok', svg: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12.6144 13.8505 19.4637 22H16.3727L10.7916 14.9354 4.54546 22H1L8.89393 12.7276 2.53636 5H5.62738L10.7154 11.5372 16.4545 5H20ZM17.3455 20.2837H19.0182L6.70909 6.65671H4.98182Z"/></svg> },
          ].map(({ name, svg }) => (
            <div key={name} className="flex flex-col items-center gap-1.5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] py-3">
              <span className="text-foreground/80">{svg}</span>
              <span className="font-sans text-[10.5px] font-medium text-foreground/55">{name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] px-3.5 py-3">
          <Sparkles className="h-4 w-4 shrink-0" style={{ color }} />
          <span className="font-sans text-[12px] font-medium text-foreground/70 shrink-0">Czas generowania</span>
          <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-foreground/[0.08]">
            <div className="h-full w-[85%] rounded-full" style={{ background: color, opacity: 0.8 }} />
          </div>
          <span className="font-grotesk text-[12px] font-bold text-foreground shrink-0">~6 s</span>
        </div>
      </div>
    )
    if (mod.id === 'assistant') return (
      <div className="mt-4 rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] p-3.5 space-y-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-foreground/[0.08] bg-background/40 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="font-sans text-[12px] text-foreground/75 font-medium">Asystent: Auto-organizacja zadań</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-foreground/60">
          <div className="rounded-lg bg-foreground/[0.03] p-2 border border-foreground/[0.05]">
            <span className="text-primary block font-bold">14:30 Sync</span>
            <span>zapisano termin</span>
          </div>
          <div className="rounded-lg bg-foreground/[0.03] p-2 border border-foreground/[0.05]">
            <span className="text-emerald-400 block font-bold">Zadania + Sync</span>
            <span>utworzono w agendzie</span>
          </div>
        </div>
      </div>
    )
    if (mod.id === 'research') return (
      <div className="mt-4 rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] p-3.5 space-y-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-sans text-[12px] text-foreground/80 font-medium">Deep Research: 34 źródła</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-foreground/60">
          <div className="rounded-lg bg-foreground/[0.03] p-2 border border-foreground/[0.05]">
            <span className="text-primary block font-bold">42 ms</span>
            <span>czas weryfikacji</span>
          </div>
          <div className="rounded-lg bg-foreground/[0.03] p-2 border border-foreground/[0.05]">
            <span className="text-emerald-400 block font-bold">Raport PDF</span>
            <span>gotowy do pobrania</span>
          </div>
        </div>
      </div>
    )
    if (mod.id === 'creator') return (
      <div className="mt-4 rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-sans text-[12px] font-bold text-foreground">Panel Twórcy & Sklep</span>
          <span className="font-mono text-[11px] text-emerald-400 font-semibold">+2 450 PLN / mc</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11.5px] text-foreground/70">
            <span>Kurs: Wdrożenia AI w B2B</span>
            <span className="font-mono text-primary">48 kursantów</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-foreground/[0.07]">
            <div className="h-full rounded-full bg-primary w-[78%]" />
          </div>
        </div>
      </div>
    )
    if (mod.id === 'workspace') return (
      <div className="mt-4 rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] p-3.5 space-y-2">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-lg border border-primary/30 bg-primary/10 py-1.5 px-1 text-[11px] font-medium text-foreground">
            📐 Tablice
          </div>
          <div className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.03] py-1.5 px-1 text-[11px] font-medium text-foreground/70">
            📝 Notatki
          </div>
          <div className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.03] py-1.5 px-1 text-[11px] font-medium text-foreground/70">
            📅 Kalendarz
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 text-[11px] text-foreground/50">
          <span>Wspólny stan danych</span>
          <span className="text-emerald-400 font-mono">100% sync</span>
        </div>
      </div>
    )
    return null
}

/* ------------------------------------------------------------------
   4b. MODULES SHOWCASE — interactive selector (list + detail panel)
   ------------------------------------------------------------------ */
function ModulesShowcase() {
  const [activeId, setActiveId] = useState(MODULY[0].id)
  const active = MODULY.find(m => m.id === activeId) ?? MODULY[0]
  const ActiveIcon = active.icon
  const metricIcons = METRIC_ICONS[active.id] ?? [Gauge, Gauge, Gauge]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {/* left: module list */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
        {MODULY.map((m) => {
          const ModIcon = m.icon
          const isActive = m.id === active.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveId(m.id)}
              className={cn(
                'group flex shrink-0 lg:shrink items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200 min-w-[220px] lg:min-w-0',
                isActive
                  ? 'border-primary/35 bg-primary/[0.07]'
                  : 'border-foreground/[0.07] bg-foreground/[0.02] hover:border-foreground/[0.15] hover:bg-foreground/[0.04]'
              )}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                style={{ background: isActive ? `${m.color}22` : 'hsl(var(--foreground)/0.05)', color: isActive ? m.color : 'hsl(var(--foreground)/0.45)' }}
              >
                <ModIcon className="h-4.5 w-4.5" />
              </span>
              <span className={cn('font-landing text-[13.5px] font-semibold leading-tight', isActive ? 'text-foreground' : 'text-foreground/60')}>
                {m.title.split(' — ')[0].split(' i ')[0]}
              </span>
            </button>
          )
        })}
      </div>

      {/* right: detail panel */}
      <Panel key={active.id} className="relative overflow-hidden p-6 sm:p-8 animate-tab-in">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${akcentTlo(active.color, 70)}, transparent)` }}
        />
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <IconTile icon={ActiveIcon} color={active.color} size="lg" />
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em]" style={{ color: active.color }}>
              {active.tag}
            </span>
          </div>
          <h3 className="font-heading text-[22px] sm:text-[26px] font-bold leading-snug tracking-tight text-foreground mb-2">
            {active.title}
          </h3>
          <p className="text-[14px] leading-relaxed text-foreground/55 font-landing font-light max-w-xl">
            {active.lead}
          </p>

          {getModuleVisual(active, active.color)}

          <div className="mt-6 pt-6 grid grid-cols-3 gap-4 border-t border-foreground/[0.07]">
            {active.metryki.slice(0, 3).map((m, mi) => {
              const MetricIcon = metricIcons[mi]
              return (
                <div key={m.label} className="flex items-start gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${active.color}18`, color: active.color }}>
                    <MetricIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <span className="font-grotesk text-[14px] font-bold text-foreground leading-tight truncate" title={m.value}>{m.value}</span>
                    <span className="text-[10px] text-foreground/40 font-medium leading-tight truncate" title={m.label}>{m.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------------
   5. FAQ ROW
   ------------------------------------------------------------------ */
export function FaqRow({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border transition-all duration-300 font-landing', open ? 'border-primary/30 bg-primary/[0.04]' : 'border-foreground/[0.07] bg-card/50 hover:border-foreground/[0.15]')}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <span className={cn('flex-1 font-landing text-[14.5px] font-semibold transition-colors', open ? 'text-foreground' : 'text-foreground/80')}>{q}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform duration-300', open ? 'rotate-180 text-primary' : 'text-foreground/40')} />
      </button>
      <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-foreground/60 font-landing">{a}</p>
        </div>
      </div>
    </div>
  )
}

export function SecRule({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="h-px w-5 bg-foreground/[0.18]" />
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-foreground/40">{label}</span>
    </div>
  )
}

/** Wrapper renderujący plik logo NextByte tym samym interfejsem co ikony marek */
/** Logo NextByte "N" jako SVG — kontury wyekstrahowane bezpośrednio z pliku nextbyte-mark.png (kanał alfa, analiza pikseli) */
export function NextByteMarkIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="278.5 45.5 642 775" className={className} style={style} fill="currentColor">
      <path d="M299,65.5 L298,225 L900,800.5 L900,641 Z" />
      <path d="M784,68 L900,68 L900,460 L784,460 Z" />
      <path d="M299,264 L416,377 L415,797 L298,797 Z" />
      <path d="M900,489 L784.5,490 L900,600.5 Z" />
    </svg>
  )
}

export type Chip = { icon: React.ComponentType<{ className?: string }>; label: string; highlight?: boolean }

/* Jeden spójny wzorzec dla wszystkich kart: ikona + zwięzła etykieta */
export const CHIP_DATA: Record<string, Chip[]> = {
  chat: [
    { icon: OpenAIIcon, label: 'GPT' },
    { icon: AnthropicIcon, label: 'Claude' },
    { icon: GeminiIcon, label: 'Gemini' },
    { icon: XaiIcon, label: 'Grok' },
  ],
  studio: [
    { icon: GoogleIcon, label: 'Imagen' },
    { icon: OpenAIIcon, label: 'GPT Image' },
    { icon: XaiIcon, label: 'Grok Imagine' },
  ],
  notes: [
    { icon: Folder, label: 'Foldery' },
    { icon: Brain, label: 'Analiza AI' },
    { icon: Search, label: 'Wyszukiwanie' },
  ],
  calendar: [
    { icon: Calendar, label: 'Terminy' },
    { icon: Repeat, label: 'Zadania Kanban' },
    { icon: Users, label: 'Google Sync' },
  ],
  video: [
    { icon: Type, label: 'Tekst na wideo' },
    { icon: Clapperboard, label: 'Obraz na wideo' },
    { icon: MonitorPlay, label: 'Klip MP4' },
  ],
  voice: [
    { icon: Mic, label: 'ElevenLabs' },
    { icon: AudioLines, label: 'Whisper PL' },
    { icon: FileText, label: 'Transkrypcja' },
  ],
}

/* ------------------------------------------------------------------
   MAIN HOMEPAGE COMPONENT (AUTHENTIC NEXTBYTE.SPACE SOURCE OF TRUTH)
   ------------------------------------------------------------------ */
export function HomePage({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  return (
    <div className="relative flex w-full flex-col font-landing text-foreground">
      <AnimStyles />
      <PageAmbience />

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative overflow-hidden px-4 pt-8 pb-10 sm:px-6 lg:px-8">
        {/* Subtle Ambient Matrix Grid & Diffuse Glow Effect in Background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--primary) / 0.16) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 75% 55% at 50% 32%, black 15%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 55% at 50% 32%, black 15%, transparent 75%)',
          }}
        />

        {/* Ambient Multi-Hue Pulsing Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-160px] -translate-x-1/2"
          style={{
            width: 1100,
            height: 550,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.2) 0%, hsl(240 80% 70% / 0.06) 42%, transparent 72%)',
            filter: 'blur(90px)',
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center pt-4">
          <h1 className="font-heading text-[clamp(36px,5.6vw,72px)] tracking-[-2px] leading-[1.05] mb-5 font-light">
            <span className="text-primary drop-shadow-[0_0_32px_rgba(105,179,240,0.45)] block font-normal">NextByte.</span>
            <span className="text-foreground block font-light">Twoje AI w jednym miejscu.</span>
          </h1>

          <p className="max-w-2xl font-sans text-[clamp(14.5px,1.15vw,16.5px)] leading-[1.6] text-foreground/75 mb-8 font-light">
            Dostęp do GPT-5, Claude, Gemini i Groka, generowanie grafik 4K oraz inteligentna baza wiedzy w jednym spójnym panelu — w 100% po polsku, na serwerach w UE i od 0 zł.
          </p>

          <div className="flex flex-col items-center gap-3.5 sm:flex-row">
            <GlowButton onClick={() => onNavigate('cennik')}>Rozpocznij za darmo</GlowButton>
            <GhostButton onClick={() => onNavigate('cennik')}>Zobacz cennik i pakiety</GhostButton>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3.5">
            <div className="flex">
              {['M', 'A', 'K', 'P'].map((ini, i) => (
                <div
                  key={ini}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-card font-grotesk text-[11.5px] font-semibold text-primary shadow-sm"
                  style={{ zIndex: 4 - i, marginLeft: i === 0 ? 0 : -9 }}
                >
                  {ini}
                </div>
              ))}
            </div>
            <div className="flex flex-col text-left">
              <p className="font-sans text-[12px] text-foreground/65 leading-tight">
                Dołącz do <span className="text-foreground font-semibold">tysięcy twórców i firm</span> pracujących z NextByte
              </p>
            </div>
          </div>
        </div>

        {/* Poszerzony kontener Mockupa na max-w-6xl */}
        <div className="relative z-10 mx-auto w-full max-w-6xl px-2 sm:px-4 mt-8">
          <HeroAppMockup />
        </div>

        {/* Dynamic Model Ecosystem & Infrastructure Bridge */}
        <FadeIn>
          <ModelEcosystemBridge />
        </FadeIn>
      </section>

      {/* ══════════ SEKCJA: MANIFEST ══════════ */}
      <Section className="relative z-10 py-20 sm:py-24">
        <FadeIn>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-6 space-y-5 lg:pt-2">
              <div className="font-mono uppercase text-[10.5px] tracking-[2px] text-foreground/45 font-medium">
                Dlaczego NextByte
              </div>
              
              <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-light leading-[1.12] tracking-[-1.5px] text-foreground">
                Jeden abonament zamiast <br />
                <span className="text-primary font-normal">pięciu osobnych.</span>
              </h2>

              <p className="font-sans text-[15px] text-foreground/60 leading-relaxed max-w-lg font-light">
                Koniec z przepłacaniem za osobne konta w USD. Korzystaj z topowych modeli AI, studia grafik i bazy wiedzy w ramach jednej elastycznej puli Byte.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: Brain,    label: '10+ modeli AI' },
                  { icon: Coins,    label: '1 subskrypcja' },
                  { icon: Cpu,      label: 'Lokalny AI za 0 zł' },
                  { icon: Lock,     label: 'Serwery w UE' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 rounded-xl border border-foreground/[0.08] bg-foreground/[0.03] px-3 py-2">
                    <Icon className="h-3.5 w-3.5 text-foreground/50 shrink-0" />
                    <span className="font-sans text-[12.5px] font-medium text-foreground/70">{label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <GlowButton onClick={() => onNavigate('cennik')}>Rozpocznij za darmo</GlowButton>
              </div>
            </div>

            <div className="lg:col-span-6">
              <ChaosVsUnifiedCard />
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ SEKCJA: GIANT HEMISPHERE ARCH ══════════ */}
      <Section className="relative z-10 py-16 sm:py-20">
        <FadeIn>
          <HemisphereArchSection />
        </FadeIn>
      </Section>

      {/* ══════════ MODUŁY (6 MODUŁÓW NEXTBYTE) ══════════ */}
      <Section className="relative z-10 py-20 sm:py-24">
        <FadeIn>
          <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-3 tracking-[-2px]">
            Najlepsze modele <span className="text-primary font-normal">do każdego zadania.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-xl mb-12 font-light">
            Sześć modułów, a pod każdym kilka silników AI — dobranych pod to, co faktycznie robisz. Wszystkie z jednej puli Byte.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {MODULY.map((m, i) => {
            const Icon = m.icon
            return (
              <FadeIn key={m.id} delay={i * 70}>
                <div className="group flex items-start gap-5 rounded-2xl border border-foreground/[0.08] bg-card p-6 transition-all hover:border-primary/30">
                  <IconTile
                    icon={Icon}
                    color={m.color}
                    size="lg"
                    className="relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="relative z-10 min-w-0 flex-1">
                    <h3 className="font-heading text-[19px] font-bold text-foreground leading-tight mb-1.5 tracking-[-0.3px]">
                      {m.title}
                    </h3>
                    {m.lead && (
                      <p className="text-[13.5px] text-foreground/50 leading-relaxed font-light mb-4">
                        {m.lead}
                      </p>
                    )}
                    {/* Loga modeli / rozwiązań napędzających moduł */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {CHIP_DATA[m.id].filter(chip => !chip.highlight).map((chip, idx) => {
                        const ChipIcon = chip.icon
                        return (
                          <span
                            key={idx}
                            className="flex items-center gap-2 rounded-xl border border-foreground/[0.09] bg-foreground/[0.04] px-3 py-2 transition-colors group-hover:border-foreground/[0.16]"
                          >
                            <ChipIcon className="h-5 w-5 text-foreground/70 shrink-0" />
                            <span className="text-[12.5px] font-semibold text-foreground/70 whitespace-nowrap">{chip.label}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </Section>

      {/* ══════════ LOKALNY AI & BEZPIECZEŃSTWO ══════════ */}
      <Section className="relative z-10 py-20 sm:py-24">
        <FadeIn>
          <div className="relative font-sans">
            <MatrixAura />
            <div className="relative z-10">
              <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-3 max-w-2xl tracking-[-2px]">
                Prywatne AI na Twoim sprzęcie.
              </h2>
              <p className="font-sans text-[15px] text-foreground/65 leading-relaxed max-w-xl mb-10 font-light">
                Llama, Mistral i DeepSeek bezpośrednio na Twoim GPU przez Ollama i LM Studio. 100% prywatności, zero opłat i nielimitowane działanie offline.
              </p>

              <div className="grid gap-5 md:grid-cols-3">
                {[
                  {
                    icon: Shield,
                    title: '100% na Twoim dysku',
                    desc: 'Przetwarzanie lokalne przez procesor i kartę graficzną bez wysyłania danych do chmury.',
                  },
                  {
                    icon: Cpu,
                    title: 'Działa z Llama i Ollama',
                    desc: 'Natywna integracja z darmowymi programami Ollama i LM Studio jednym kliknięciem.',
                  },
                  {
                    icon: WifiOff,
                    title: 'Za 0 zł i bez limitów',
                    desc: 'Nielimitowana praca w trybie offline bez zużywania jednostek Byte i abonamentów.',
                  },
                ].map((item, i) => {
                  const ItemIcon = item.icon
                  return (
                    <FadeIn key={item.title} delay={i * 80}>
                      <div className="group relative overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/60 backdrop-blur-md p-6 flex flex-col gap-3 transition-all duration-300 hover:border-primary/40 hover:bg-card hover:-translate-y-1">
                        {/* Background watermark icon */}
                        <ItemIcon
                          aria-hidden
                          className="pointer-events-none absolute right-3 top-3 h-16 w-16 text-foreground/[0.04] transition-colors duration-300 group-hover:text-primary/[0.08]"
                        />

                        <div className="relative z-10">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                            <ItemIcon className="h-5 w-5" />
                          </span>
                        </div>

                        <h3 className="relative z-10 font-heading text-[17px] font-semibold text-foreground leading-snug tracking-[-0.3px] mt-1">
                          {item.title}
                        </h3>
                        <p className="relative z-10 font-sans text-[13px] text-foreground/55 font-light leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </FadeIn>
                  )
                })}
              </div>

              <p className="mt-8 font-sans text-[13px] text-foreground/50 font-light">
                Zgodność z <span className="text-foreground/80 font-medium">Ollama</span> oraz <span className="text-foreground/80 font-medium">LM Studio</span> na macOS, Windows i Linux.
              </p>
            </div>
          </div>
        </FadeIn>
      </Section>

      <TechDivider />

      {/* ══════════ JAK TO DZIAŁA — 3 KROKI ══════════ */}
      <Section className="relative z-10 py-20">
        <FadeIn>
          <Panel className="relative overflow-hidden p-8 sm:p-12 lg:p-16">
            <Glow className="right-[-100px] top-[-80px]" size={480} opacity={0.09} />
            <div className="relative z-10 font-sans">
              <SecRule label="Jak to działa" />
              <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-12 max-w-xl tracking-[-2px]">
                Od rejestracji do pierwszego wyniku — <span className="text-primary font-normal">trzy proste kroki.</span>
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    title: 'Zakładasz konto za 0 zł',
                    desc: 'Rejestracja w 30 sekund, bez karty.',
                    icon: KeyRound,
                  },
                  {
                    title: 'Wybierasz zadanie i model',
                    desc: 'Czat, grafiki 4K, notatki lub automatyzacja.',
                    icon: Layers,
                  },
                  {
                    title: 'Płacisz tylko za zużycie',
                    desc: 'Jawny koszt w Byte, niewykorzystana pula przechodzi dalej.',
                    icon: Gauge,
                  },
                ].map((k, i, arr) => (
                  <FadeIn key={k.title} delay={i * 120}>
                    <div className="relative flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <StepNumber n={i + 1} />
                        {i < arr.length - 1 && (
                          <div className="hidden md:flex flex-1 items-center">
                            <div className="h-px flex-1 border-t border-dashed border-foreground/20" />
                            <span className="text-foreground/20 text-[10px] mx-1">›</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-heading text-[17px] font-semibold text-foreground">{k.title}</h3>
                      <p className="font-sans text-[13.5px] leading-relaxed text-foreground/60 font-light">{k.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </Panel>
        </FadeIn>
      </Section>

      {/* ══════════ PORÓWNANIE ══════════ */}
      <Section className="relative z-10 py-20">
        <FadeIn>
          <SecRule label="Porównanie" />
          <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-3 tracking-[-2px]">
            NextByte zamiast <span className="text-primary font-normal">pięciu subskrypcji.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-lg mb-12 font-light">
            Zestawienie funkcji, które w innych narzędziach wymagają osobnych planów w obcych walutach i generują chaos faktur.
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <div className="relative">
            <TechCornerMarks />
            <Panel className="overflow-x-auto">
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
            </Panel>
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <div className="mt-6 rounded-2xl border border-foreground/[0.08] bg-card/50 backdrop-blur-xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {/* 5 tools stack */}
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

              {/* NextByte package */}
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
          </div>
        </FadeIn>
      </Section>

      <TechDivider />

      {/* ══════════ BEZPIECZEŃSTWO DANYCH ══════════ */}
      <Section className="relative z-10 py-20">
        <FadeIn>
          <div className="relative">
            <div className="relative z-10">
              <h2 className="font-heading text-[clamp(28px,4vw,46px)] font-light leading-[1.1] text-foreground mb-3 tracking-[-2px] max-w-2xl">
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
                    <div key={item.title} className="group flex flex-col items-center text-center gap-3 rounded-xl border border-foreground/[0.07] bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card/70">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary transition-all group-hover:bg-primary/15 group-hover:border-primary/30">
                        <ItemIcon className="h-7 w-7" />
                      </div>
                      <h3 className="font-heading text-[14.5px] font-semibold text-foreground leading-snug">{item.title}</h3>
                      <p className="font-sans text-[12px] text-foreground/50 font-light leading-snug">{item.sentence}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ OPINIE / Z POLA ══════════ */}
      <Section className="relative z-10 py-20">
        <FadeIn>
          <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-3 tracking-[-2px]">
            Sprawdzona efektywność <span className="text-primary font-normal">w codziennej pracy.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/60 leading-relaxed max-w-xl mb-12 font-light">
            Zobacz, jak twórcy, programiści i zespoły optymalizują procesy dzięki połączeniu modeli AI, studia grafik i bazy wiedzy w jednym oknie.
          </p>
        </FadeIn>
        <div className="grid gap-5 lg:grid-cols-3">
          {OPINIE.map((o, i) => (
            <FadeIn key={o.id} delay={i * 100}>
              <div
                className={cn(
                  'group flex h-full flex-col rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 font-sans',
                  i === 1
                    ? 'border-primary/40 bg-card/80 shadow-[0_0_45px_-10px_hsl(var(--primary)/0.25)]'
                    : 'border-foreground/[0.08] bg-card/60 hover:border-primary/30',
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-medium text-primary">
                    {o.kategoria}
                  </span>
                  <div className="flex gap-0.5 text-primary text-[13px]">★★★★★</div>
                </div>
                <p className="flex-1 font-sans text-[14px] leading-relaxed text-foreground/85 mb-6 font-light">
                  „{o.tekst}”
                </p>
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-foreground/[0.07]">
                  <p className="font-heading text-[13.5px] font-semibold text-foreground/80 truncate">
                    {o.rola}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ══════════ FAQ / ODPOWIEDZI ══════════ */}
      <Section className="relative z-10 py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <FadeIn className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="font-heading text-[clamp(28px,3.8vw,42px)] font-light leading-[1.08] text-foreground mb-4 tracking-[-1.5px]">
              Wszystko, co warto wiedzieć <br />
              <span className="text-primary font-normal">przed startem.</span>
            </h2>
            <p className="font-sans text-[14.5px] text-foreground/60 leading-relaxed mb-7 font-light max-w-md">
              Masz niestandardowe pytanie lub potrzebujesz dedykowanego wdrożenia dla zespołu? Jesteśmy do dyspozycji.
            </p>
            <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-3">
              <GlowButton size="md" onClick={() => onNavigate('cennik')}>
                Zobacz plany i cennik
              </GlowButton>
              <GhostButton size="md" onClick={() => window.open('mailto:kontakt@nextbyte.space', '_blank')}>
                Napisz do nas
              </GhostButton>
            </div>
          </FadeIn>
          <FadeIn delay={120} className="space-y-2.5">
            {FAQ.map((f, i) => (
              <FaqRow key={f.q} q={f.q} a={f.a} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? null : i)} />
            ))}
          </FadeIn>
        </div>
      </Section>

      {/* ══════════ FINAL CTA ══════════ */}
      <Section className="relative z-10 py-24 sm:py-32 overflow-hidden">
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
              <linearGradient id="finalCtaArchGlow" x1="0%" y1="100%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                <stop offset="20%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
                <stop offset="80%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
              <filter id="finalCtaBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 50 330 C 200 60, 800 60, 950 330"
              stroke="url(#finalCtaArchGlow)"
              strokeWidth="1.75"
              filter="url(#finalCtaBlur)"
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

            {/* CTA Action Buttons */}
            <div className="flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <GlowButton size="lg" onClick={() => onNavigate('cennik')}>
                Przejdź do platformy
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
