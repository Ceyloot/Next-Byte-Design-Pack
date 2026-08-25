import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ArrowRight, Play, Check, ChevronDown, Sparkles, Coins, Shield,
  Zap, CircleCheck, X, Quote,
  Brain, Camera, NotebookPen, Workflow, Cpu, Calendar, Rocket,
  Users, Star, Clock, Lock, Layers, Gauge, CpuIcon, Activity, FileText,
  KeyRound, Mic, Bot, Repeat, CheckCircle2, Globe,
  Building2, WifiOff, LogOut,
  Clapperboard,
  AudioLines,
  Folder, Search, Type, MonitorPlay, Move,
  type LucideIcon,
} from 'lucide-react'
import {
  Section, GlowButton, GhostButton,
  Panel, IconTile, StepNumber, Stars, Glow, PageAmbience,
  HairLine, AKCENT, akcentTlo, AnimStyles, FadeIn,
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
type BrandIconProps = { className?: string; style?: React.CSSProperties }

function OpenAIIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387 2.02-1.165a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.412-.666zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  )
}

function AnthropicIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M13.827 3.52h3.603L24 20.521h-3.603zm-7.258 0h3.767L16.906 20.521H13.28l-1.435-3.899H5.588l-1.435 3.899H0Zm2.976 5.18-1.997 5.43h3.995z" />
    </svg>
  )
}

function GeminiIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M11.9968 0C11.1394 6.97318 6.97318 11.1394 0 11.9968C6.97318 12.8542 11.1394 17.0205 11.9968 24C12.8542 17.0205 17.0205 12.8542 24 11.9968C17.0205 11.1394 12.8542 6.97318 11.9968 0Z" />
    </svg>
  )
}

function XaiIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12.6144 13.8505 19.4637 22H16.3727L10.7916 14.9354 4.54546 22H1L8.89393 12.7276 2.53636 5H5.62738L10.7154 11.5372 16.4545 5H20ZM17.3455 20.2837H19.0182L6.70909 6.65671H4.98182Z" />
    </svg>
  )
}

function GoogleIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053z" />
    </svg>
  )
}

/* ------------------------------------------------------------------
   1. MANIFEST INTERACTIVE COMPARISON (5 APPS CHAOS VS NEXTBYTE)
   ------------------------------------------------------------------ */
function ChaosVsUnifiedCard() {
  const [activeTab, setActiveTab] = useState<'stack' | 'features'>('stack')

  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/50 p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80">
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
            // Policz samemu
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
          <div className="relative rounded-2xl border border-primary/40 bg-primary/[0.08] p-5 flex flex-col shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)]">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-[11px] font-semibold text-primary/80 tracking-wide">
                  Ekosystem NextByte
                </span>
                <span className="rounded-lg bg-primary/20 text-primary border border-primary/40 px-2 py-1 font-sans text-[10px] font-semibold whitespace-nowrap">
                  All-in-one
                </span>
              </div>
              <ul className="font-sans divide-y divide-foreground/[0.05]">
                <li className="flex items-center gap-2.5 py-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex items-center gap-2 text-primary/90">
                    <OpenAIIcon className="h-4 w-4 shrink-0" />
                    <AnthropicIcon className="h-4 w-4 shrink-0" />
                    <GeminiIcon className="h-4 w-4 shrink-0" />
                    <XaiIcon className="h-4 w-4 shrink-0" />
                    <span className="text-[13px] text-foreground/85 whitespace-nowrap ml-1">+ 6 innych</span>
                  </div>
                </li>
                {[
                  { text: 'Studio zdjęć 4K i Wideo AI', icon: Camera },
                  { text: 'Notatki AI i Kalendarz', icon: Calendar },
                  { text: 'Lokalny AI za 0 zł', icon: Cpu },
                ].map(({ text, icon: RowIcon }) => (
                  <li key={text} className="flex items-center gap-2.5 py-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <RowIcon className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                    <span className="text-[13px] text-foreground/85 whitespace-nowrap">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative z-10 border-t border-primary/30 pt-4">
              <p className="font-heading text-[22px] font-bold text-primary whitespace-nowrap">Od 0zł/mc</p>
              <p className="mt-1.5 text-[11px] text-primary/60 leading-snug">1 faktura VAT · po polsku · Serwery UE</p>
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
function ModelEcosystemBridge() {
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
function HemisphereArchSection() {
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

        <p className="mx-auto max-w-xl text-[15.5px] leading-relaxed text-foreground/55 mb-14 font-light">
          Przełączasz model jednym kliknięciem. Kontekst rozmowy zostaje. Historia sesji zawsze pod ręką.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 text-left">
          {[
            {
              icon: Repeat,
              title: 'Przełącz model w locie',
              desc: 'GPT, Claude, Gemini, Grok — zmieniasz model bez utraty kontekstu rozmowy.',
              tag: '10+ modeli',
            },
            {
              icon: Clock,
              title: 'Historia zawsze przy Tobie',
              desc: 'Wszystkie sesje zapisane. Wracasz do rozmowy sprzed tygodnia jednym kliknięciem.',
              tag: 'Nielimitowana',
            },
            {
              icon: NotebookPen,
              title: 'Notatki rosną same',
              desc: 'To co ważne z czatu trafia prosto do Twoich notatek AI bez kopiowania.',
              tag: 'Auto-zapis',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-foreground/[0.08] bg-card/40 backdrop-blur-sm p-6 pt-5 flex flex-col gap-2.5 transition-all duration-300 hover:border-primary/30 hover:bg-card/70 hover:-translate-y-1"
            >
              {/* watermark icon */}
              <item.icon
                aria-hidden
                className="pointer-events-none absolute right-3 top-3 h-16 w-16 text-foreground/[0.05] transition-colors duration-300 group-hover:text-primary/[0.08]"
              />

              <span className="relative z-10 inline-flex w-fit items-center rounded-full border border-primary/25 bg-primary/[0.08] px-2.5 py-1 font-mono text-[10px] tracking-[1.5px] text-primary uppercase">
                {item.tag}
              </span>
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
function HeroAppMockup() {
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
    <div className="relative mx-auto mt-12 w-full max-w-5xl font-sans text-foreground text-left">
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
            <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 animate-tab-in">
              {/* Message Feed */}
              <div className="mx-auto w-full sm:w-[88%] space-y-4 max-h-[260px] overflow-y-auto pr-2">
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
                        'max-w-[85%] sm:max-w-[78%] flex flex-col',
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
                          <div className="mt-2.5 space-y-1 text-[12px] text-foreground/75 pt-2 border-t border-foreground/[0.06]">
                            {msg.details.map((d, di) => (
                              <p key={di} className="leading-snug">
                                {d}
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

              {/* Real NextByte Chat Input Box */}
              <div className="mt-4 mx-auto w-full sm:w-[88%] rounded-[1.5rem] border border-border/60 bg-card/70 p-2 shadow-xl focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] transition-all">
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

function getModuleVisual(mod: (typeof MODULY)[number], color: string) {
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
    if (mod.id === 'notes') return (
      <div className="mt-4 rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] p-3.5">
        <div className="flex items-center gap-2 rounded-lg border border-foreground/[0.08] bg-background/40 px-3 py-2 mb-3">
          <span className="text-foreground/35 text-[13px]">⌕</span>
          <span className="font-sans text-[12.5px] text-foreground/55">"kontrakt Q3"</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}18`, color }}>
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <span className="font-sans text-[12.5px] font-semibold text-foreground/85 truncate block">Strategia Q3 2025.pdf</span>
            <span className="text-[10.5px] text-foreground/40">znaleziono w treści · sync AI</span>
          </div>
        </div>
      </div>
    )
    if (mod.id === 'calendar') return (
      <div className="mt-4 rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] p-3.5">
        <div className="relative pl-4">
          <div className="absolute left-[5px] top-1 bottom-1 w-px bg-foreground/[0.08]" />
          {[
            { time: '09:00', title: 'Standup zespołu', done: true },
            { time: '11:30', title: 'Review PRD z AI', done: true },
            { time: '14:00', title: 'Demo klienta', done: false },
          ].map(({ time, title, done }) => (
            <div key={time} className="relative flex items-center gap-3 py-1.5">
              <span
                className="absolute left-[-16px] h-2.5 w-2.5 rounded-full border-2"
                style={{ borderColor: color, background: done ? color : 'hsl(var(--background))', opacity: done ? 0.9 : 0.6 }}
              />
              <span className="font-mono text-[11px] text-foreground/45 w-11 shrink-0">{time}</span>
              <span className={cn('font-sans text-[12.5px] truncate', done ? 'text-foreground/40 line-through' : 'text-foreground/80')}>{title}</span>
            </div>
          ))}
        </div>
      </div>
    )
    if (mod.id === 'video') return (
      <div className="mt-4 rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] p-3.5 space-y-3">
        {[
          { label: 'Klip produktowy 4K', pct: 100, dur: '0:42' },
          { label: 'Reklama social 9:16', pct: 100, dur: '0:15' },
          { label: 'Cinematic opener', pct: 46, dur: '—' },
        ].map(({ label, pct, dur }) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-[12.5px] text-foreground/75 truncate">{label}</span>
              <span className="font-mono text-[10.5px] font-semibold shrink-0" style={{ color: pct === 100 ? color : 'hsl(var(--foreground)/0.4)' }}>
                {pct === 100 ? dur : `${pct}%`}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-foreground/[0.07]">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color, opacity: pct === 100 ? 0.85 : 0.5 }} />
            </div>
          </div>
        ))}
      </div>
    )
    if (mod.id === 'voice') return (
      <div className="mt-4 rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] p-3.5">
        <div className="flex items-center gap-[3px] h-10 mb-3">
          {[6,14,9,22,15,28,18,32,20,26,12,24,17,30,14,20,8,16,10,6].map((h, i) => (
            <div key={i} className="flex-1 rounded-full" style={{ height: `${h}px`, background: color, opacity: i < 13 ? 0.85 : 0.25 }} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full shrink-0 animate-pulse" style={{ background: color }} />
          <span className="font-sans text-[11.5px] text-foreground/55 truncate">na żywo · transkrypcja PL</span>
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
function FaqRow({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
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

function SecRule({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="h-px w-5 bg-foreground/[0.18]" />
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-foreground/40">{label}</span>
    </div>
  )
}

/** Wrapper renderujący plik logo NextByte tym samym interfejsem co ikony marek */
/** Logo NextByte "N" jako SVG — kontury wyekstrahowane bezpośrednio z pliku nextbyte-mark.png (kanał alfa, analiza pikseli) */
function NextByteMarkIcon({ className, style }: BrandIconProps) {
  return (
    <svg viewBox="278.5 45.5 642 775" className={className} style={style} fill="currentColor">
      <path d="M299,65.5 L298,225 L900,800.5 L900,641 Z" />
      <path d="M784,68 L900,68 L900,460 L784,460 Z" />
      <path d="M299,264 L416,377 L415,797 L298,797 Z" />
      <path d="M900,489 L784.5,490 L900,600.5 Z" />
    </svg>
  )
}

type Chip = { icon: React.ComponentType<{ className?: string }>; label: string; highlight?: boolean }

/* Jeden spójny wzorzec dla wszystkich 7 kart: ikona + krótka etykieta, zero diagramów */
const CHIP_DATA: Record<string, Chip[]> = {
  chat: [
    { icon: OpenAIIcon, label: 'GPT' },
    { icon: AnthropicIcon, label: 'Claude' },
    { icon: GeminiIcon, label: 'Gemini' },
    { icon: XaiIcon, label: 'Grok' },
    { icon: NextByteMarkIcon, label: 'Wspólny kontekst', highlight: true },
  ],
  studio: [
    { icon: GoogleIcon, label: 'Nano Banana' },
    { icon: OpenAIIcon, label: 'GPT Image 2.0' },
    { icon: XaiIcon, label: 'Grok Imagine' },
  ],
  notes: [
    { icon: Folder, label: 'Folder-sync' },
    { icon: Brain, label: 'Analiza AI' },
    { icon: Search, label: 'Wyszukiwanie' },
  ],
  calendar: [
    { icon: Calendar, label: 'Wydarzenia' },
    { icon: Repeat, label: 'Cykliczne' },
    { icon: Users, label: 'Sync zespołu' },
  ],
  video: [
    { icon: Type, label: 'Tekst / obraz' },
    { icon: Clapperboard, label: 'Generacja' },
    { icon: MonitorPlay, label: 'Gotowy klip' },
  ],
  voice: [
    { icon: Mic, label: 'Nagranie' },
    { icon: AudioLines, label: 'Analiza fali' },
    { icon: FileText, label: 'Transkrypt' },
  ],
}

/* Siatka 3×2 — wszystkie 6 kart tej samej szerokości, pełna symetria */

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
      <section className="relative overflow-hidden px-4 pt-10 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(215 10% 30% / .22) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 80%)',
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-180px] -translate-x-1/2"
          style={{
            width: 1100,
            height: 550,
            borderRadius: '50%',
            background: 'radial-gradient(circle, hsl(204 91% 70% / 0.18) 0%, hsl(240 80% 70% / 0.06) 45%, transparent 75%)',
            filter: 'blur(90px)',
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center pt-8">
          <h1 className="font-heading text-[clamp(38px,6.2vw,80px)] tracking-[-2px] leading-[1.04] mb-7 font-light">
            <span className="text-primary drop-shadow-[0_0_32px_rgba(105,179,240,0.45)] block font-normal">NextByte.</span>
            <span className="text-foreground block font-light">Wszystkie modele AI. Twoje pomysły. Gotowe w sekundę.</span>
          </h1>

          <p className="mt-2 max-w-2xl font-sans text-[clamp(15px,1.2vw,17px)] leading-[1.65] text-foreground/75 mb-10 font-light">
            GPT-5, Claude, Gemini, Grok, generowanie grafik 4K, wideo i notatki w jednym, płynnym ekosystemie. Bez żonglowania 5 abonamentami, w 100% po polsku i natychmiast gotowe do działania.
          </p>

          <div className="mt-2 flex flex-col items-center gap-3.5 sm:flex-row">
            <GlowButton onClick={() => onNavigate('cennik')}>ZACZNIJ ZA DARMO</GlowButton>
            <GhostButton onClick={() => onNavigate('cennik')}>SPRAWDŹ PLANY & CENNIK →</GhostButton>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="flex">
              {['M', 'A', 'K', 'P'].map((ini, i) => (
                <div
                  key={ini}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-card font-grotesk text-[12px] font-semibold text-primary shadow-sm"
                  style={{ zIndex: 4 - i, marginLeft: i === 0 ? 0 : -10 }}
                >
                  {ini}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="font-sans text-[12.5px] text-foreground/60 leading-tight">
                Dołącz do twórców i profesjonalistów, którzy <span className="text-foreground font-semibold">zamienili chaos narzędzi na jeden panel</span>
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-5">
            {['Bez karty kredytowej', 'Anulujesz w każdej chwili', 'Dane na serwerach w UE'].map(t => (
              <span key={t} className="flex items-center gap-1.5 font-landing text-[12.5px] text-foreground/50">
                <CircleCheck className="h-4 w-4 text-primary" />
                {t}
              </span>
            ))}
          </div>

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
            <div className="lg:col-span-6 space-y-6 lg:pt-2">
              <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary">
                // MANIFEST & RACJA BYTU
              </div>
              
              <h2 className="font-heading text-[clamp(28px,4vw,42px)] font-normal leading-[1.15] tracking-[-1px] text-primary drop-shadow-[0_0_20px_rgba(105,179,240,0.35)]">
                NextByte łączy to w jedną platformę.
              </h2>

              <p className="font-sans text-[15px] text-foreground/65 leading-relaxed max-w-lg font-light pt-1">
                Osobne appki do AI, notatek i kalendarza męczą — płacisz za pięć subskrypcji, używasz jednej. Chat AI, notatki, kalendarz, grafiki, wideo i głos. Jedno logowanie, polski interfejs.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: Brain,    label: '10+ modeli AI' },
                  { icon: Coins,    label: '1 subskrypcja' },
                  { icon: Cpu,      label: 'Lokalny AI za 0 zł' },
                  { icon: Lock,     label: 'Serwery w UE' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] px-3 py-2">
                    <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-sans text-[12.5px] font-medium text-foreground/70">{label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <GlowButton onClick={() => onNavigate('cennik')}>ZACZNIJ ZA DARMO</GlowButton>
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
          <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary mb-2">
            // PLATFORMA / MODUŁY
          </div>
          <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-3 tracking-[-2px]">
            Najlepsze modele <span className="text-primary font-normal">do każdego zadania.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-xl mb-8 font-light">
            Sześć modułów, a pod każdym kilka silników AI — dobranych pod to, co faktycznie robisz. Wszystkie z jednej puli Byte.
          </p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 mb-12 pb-8 border-b border-foreground/[0.07]">
            {[
              { value: '10+', label: 'modeli w jednym miejscu' },
              { value: '1', label: 'logowanie' },
              { value: '0', label: 'żonglowania subskrypcjami' },
            ].map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="font-heading text-[26px] font-extrabold leading-none tracking-tight text-primary">
                  {s.value}
                </span>
                <span className="text-[12.5px] text-foreground/50 font-light">{s.label}</span>
              </div>
            ))}
          </div>
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
            <Glow className="right-[-100px] top-[-80px]" size={480} opacity={0.10} />
            <div className="relative z-10">
              <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary mb-2">
                // LOKALNE AI · 100% PRYWATNOŚCI &amp; OFFLINE
              </div>
              <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-3 max-w-2xl tracking-[-2px]">
                Twoje dane należą tylko do Ciebie. <span className="text-primary font-normal">Prywatne AI na Twoim sprzęcie.</span>
              </h2>
              <p className="font-sans text-[15px] text-foreground/65 leading-relaxed max-w-2xl mb-8 font-light">
                Uruchamiaj najnowsze modele open-source (Llama, Mistral, Gemma, DeepSeek) bezpośrednio na swoim komputerze. Żadne zapytanie, plik ani prompt nie opuszczają Twojego urządzenia. Zero opłat w Byte, pełna dyskrecja i bezpieczna praca nawet bez dostępu do sieci.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { tag: '// 01', title: '100% na Twoim dysku', desc: 'Pliki i rozmowy przetwarza Twój procesor i karta graficzna. Żaden zewnętrzny serwer ani dostawca chmurowy ich nie widzi.' },
                  { tag: '// 02', title: 'Działa z Llama i Ollama', desc: 'Pełna zgodność z darmowymi programami Ollama i LM Studio — podłączasz ulubiony model jednym kliknięciem.' },
                  { tag: '// 03', title: 'Za 0 zł i bez internetu', desc: 'Pracuj w podróży, w pociągu, samolocie lub w odciętej sieci. Za lokalne modele nie zużywasz ani jednego Byte.' },
                ].map((item, i) => (
                  <FadeIn key={item.title} delay={i * 80}>
                    <div className="rounded-xl border border-foreground/[0.08] bg-card/60 p-5 hover:border-primary/30 transition-all">
                      <span className="font-mono text-[10px] text-primary font-bold">{item.tag}</span>
                      <h3 className="font-heading text-[16px] font-semibold text-foreground mt-1.5 mb-2">{item.title}</h3>
                      <p className="font-sans text-[13px] text-foreground/55 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <p className="mt-6 font-sans text-[13px] text-foreground/50 font-light">
                Działa natywnie z <span className="text-foreground/80 font-medium">Ollama</span> oraz <span className="text-foreground/80 font-medium">LM Studio</span> — instalujesz na macOS, Windows lub Linux i cieszysz się prywatnym asystentem AI bez opłat.
              </p>
            </div>
          </div>
        </FadeIn>
      </Section>

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
                    desc: 'Rejestracja w 30 sekund bez podawania karty kredytowej. Dostęp do platformy i modeli lokalnych jest natychmiastowy.',
                    icon: KeyRound,
                  },
                  {
                    title: 'Wybierasz zadanie i model',
                    desc: 'Chat AI, Studio grafik 4K, baza Notatek lub automatyzacja. Dobierasz model dopasowany do bieżącego zadania.',
                    icon: Layers,
                  },
                  {
                    title: 'Płacisz tylko za zużycie',
                    desc: 'Każda akcja ma jawny koszt w Byte. Wiesz z góry ile wydasz — żadnych niespodzianek na koniec miesiąca.',
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
        </FadeIn>
        <FadeIn delay={200}>
          <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/[0.06] px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="font-sans">
              <span className="font-mono text-[10px] text-primary/70 uppercase tracking-[2px]">// PRZELICZ SAMEMU</span>
              <div className="flex items-center flex-wrap gap-5 mt-5">
                <div className="flex items-center gap-3.5 text-foreground/50">
                  <OpenAIIcon className="h-10 w-10" />
                  <AnthropicIcon className="h-10 w-10" />
                  <Camera className="h-10 w-10" />
                  <NotebookPen className="h-10 w-10" />
                  <Mic className="h-10 w-10" />
                </div>
                <span className="font-heading text-[28px] font-semibold text-foreground/35 line-through decoration-2 decoration-destructive/50">
                  ~450 zł
                </span>
                <ArrowRight className="h-8 w-8 text-primary/40" />
                <NextByteMarkIcon className="h-11 w-11 text-foreground" />
                <span className="font-heading text-[48px] font-black text-primary leading-none drop-shadow-[0_0_24px_hsl(var(--primary)/0.5)]">
                  99 zł
                </span>
                <span className="rounded-full border border-primary/40 bg-primary/15 px-4 py-2 font-mono text-[14px] font-bold uppercase tracking-[0.5px] text-primary">
                  −78% taniej
                </span>
              </div>
            </div>
            <GlowButton onClick={() => onNavigate('cennik')} className="shrink-0">Zobacz plan NextByte →</GlowButton>
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ BEZPIECZEŃSTWO DANYCH ══════════ */}
      <Section className="relative z-10 py-20">
        <FadeIn>
          <div className="relative">
            <Glow className="left-[-80px] bottom-[-80px]" size={400} opacity={0.07} />
            <div className="relative z-10">
              <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary mb-2">
                // PRYWATNOŚĆ & BEZPIECZEŃSTWO
              </div>
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
          <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary mb-2">
            // WYNIKI &amp; OPINIE
          </div>
          <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-3 tracking-[-2px]">
            Mniej narzędzi. <span className="text-primary font-normal">Więcej zrobionej roboty.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/60 leading-relaxed max-w-xl mb-12 font-light">
            Zobacz, jak codzienna praca staje się prostsza i szybsza, gdy wszystkie modele, grafiki i notatki masz w jednym spójnym oknie.
          </p>
        </FadeIn>
        <div className="grid gap-4 lg:grid-cols-3">
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
                  <span className="font-mono text-[10.5px] tracking-[2px] text-primary font-bold">
                    // OPINIA {o.id}
                  </span>
                  <div className="flex gap-0.5 text-primary text-[13px]">★★★★★</div>
                </div>
                <p className="flex-1 font-sans text-[14px] leading-relaxed text-foreground/85 mb-6 font-light">
                  „{o.tekst}”
                </p>
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-foreground/[0.07]">
                  <div className="min-w-0">
                    <p className="font-heading text-[13.5px] font-semibold text-foreground truncate">
                      {o.autor}
                    </p>
                    <p className="text-[11.5px] text-foreground/50 font-light truncate">
                      {o.rola}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 border border-primary/25 px-2.5 py-1 font-mono text-[9.5px] font-bold text-primary shrink-0">
                    {o.metryka}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ══════════ FAQ / ODPOWIEDZI ══════════ */}
      <Section className="relative z-10 py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <FadeIn className="lg:sticky lg:top-32 lg:self-start">
            <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary mb-2">
              // FAQ / ODPOWIEDZI
            </div>
            <h2 className="font-heading text-[2.2rem] font-light leading-[1.06] text-foreground mb-4 tracking-[-1.5px]">
              Częste pytania.
            </h2>
            <p className="font-sans text-[14px] text-foreground/55 leading-relaxed mb-7 font-light">
              Nie ma tu odpowiedzi na Twoje pytanie? Napisz do nas — odpowiadamy w ciągu jednego dnia roboczego.
            </p>
            <GhostButton size="md" onClick={() => onNavigate('cennik')}>Sprawdź pełny cennik →</GhostButton>
          </FadeIn>
          <FadeIn delay={120} className="space-y-2.5">
            {FAQ.map((f, i) => (
              <FaqRow key={f.q} q={f.q} a={f.a} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? null : i)} />
            ))}
          </FadeIn>
        </div>
      </Section>

      {/* ══════════ FINAL CTA ══════════ */}
      <Section className="relative z-10 py-20">
        <HairLine className="mb-16" />
        <FadeIn>
          <div className="text-center flex flex-col items-center font-sans">
            <div className="font-mono text-[11px] tracking-[3px] text-primary/80 mb-6 font-bold">
              // TWÓJ OSOBISTY PANEL AI
            </div>
            <h2
              className="font-heading font-light leading-[1.04] tracking-[-2px] text-foreground mb-2"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)' }}
            >
              Wszystko, czego potrzebujesz.
            </h2>
            <h2
              className="font-heading font-normal leading-[1.04] tracking-[-2px] text-primary drop-shadow-[0_0_32px_rgba(105,179,240,0.4)] mb-8"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)' }}
            >
              W jednym, bezbłędnym miejscu.
            </h2>
            <p className="font-sans text-[16px] text-foreground/65 max-w-xl leading-relaxed mb-10 font-light">
              Pisz, twórz grafiki, organizuj notatki i automatyzuj zadania z najmocniejszymi modelami AI na świecie. Zacznij za 0 zł bez karty kredytowej.
            </p>
            <div className="flex flex-col items-center gap-3.5 sm:flex-row">
              <GlowButton onClick={() => onNavigate('cennik')}>ZACZNIJ ZA DARMO</GlowButton>
              <GhostButton onClick={() => onNavigate('cennik')}>SPRAWDŹ PLANY &amp; CENNIK</GhostButton>
            </div>
          </div>
        </FadeIn>
      </Section>
    </div>
  )
}
