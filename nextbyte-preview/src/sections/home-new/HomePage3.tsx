import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Sparkles, TrendingUp,
  Layers, Camera, Play, Pause
} from 'lucide-react'
import {
  Section, Glow, PageAmbience,
  AnimStyles, FadeIn, Stars
} from './shared'
import { FAQ, OPINIE } from './data'
import {
  OpenAIIcon, AnthropicIcon, XaiIcon, GeminiIcon
} from './HomePage'
import type { HomePage as HomePageId } from './types'

/* ═══════════════════════════════════════════════════════════════════════
   STRONA GŁÓWNA 3 — INTERAKTYWNA SCROLL STORY (BEZ KAFELKÓW, 1:1 ZE SS)
   ═══════════════════════════════════════════════════════════════════════
   - ZERO BADGES / PIGUŁEK — Czysta, elegancka typografia bez zbędnych etykiet
   - ZERO PRICING — Cennik całkowicie usunięty
   - BEZ KAFELKÓW: Każdy moduł to otwarta, interaktywna przestrzeń z:
     1. Kopułą cząsteczek Halftone Dotted Sphere (1:1 ze screena)
     2. Pływającymi kontrolerami i selektorami person / modeli AI
     3. Podwójną falą plazmową Human vs NextByte Agent (1:1 ze screena)
     4. Wektorową konstelacją bazy wiedzy 1M tokenów
     5. Kinowym laserowym viewportem kreacji 4K
     6. Przetwarzaniem GPU 100% offline
   - Sprawdzone Wyniki, Opinie, FAQ & Monumentalny Obrys "NEXTBYTE"
   ═══════════════════════════════════════════════════════════════════════ */

/** 3D Metaliczna Chromowana Gwiazda */
function ChromeStar({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={cn('pointer-events-none drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]', className)}
    >
      <defs>
        <linearGradient id="stChrome1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#e2e8f0" />
          <stop offset="65%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>
        <linearGradient id="stChrome2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>
      <path
        d="M 50 0 C 50 35, 65 50, 100 50 C 65 50, 50 65, 50 100 C 50 65, 35 50, 0 50 C 35 50, 50 35, 50 0 Z"
        fill="url(#stChrome1)"
      />
      <path
        d="M 50 0 C 50 35, 65 50, 100 50 C 65 50, 50 65, 50 100 Z"
        fill="url(#stChrome2)"
        opacity="0.6"
      />
    </svg>
  )
}

/** Kopuła cząsteczek Halftone Dotted Sphere (1:1 ze screena) */
function HalftoneDottedSphere({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 420" className={cn('w-full select-none pointer-events-none', className)}>
      <defs>
        <radialGradient id="htSphereGlow" cx="50%" cy="100%" r="90%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="htWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
          <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Poświata wewnętrzna */}
      <ellipse cx="400" cy="420" rx="380" ry="320" fill="url(#htSphereGlow)" />
      
      {/* Matryca punktowa cząsteczek (Halftone particle mesh) */}
      {Array.from({ length: 22 }).map((_, rIdx) => {
        const radiusY = 310 - rIdx * 14
        const radiusX = 370 - rIdx * 16
        const dotCount = Math.max(12, Math.floor(46 - rIdx * 1.5))
        return (
          <g key={rIdx} opacity={0.12 + (1 - rIdx / 22) * 0.65}>
            {Array.from({ length: dotCount }).map((_, dIdx) => {
              const angle = Math.PI + (dIdx / (dotCount - 1)) * Math.PI
              const cx = 400 + Math.cos(angle) * radiusX
              const cy = 420 + Math.sin(angle) * radiusY
              const size = Math.max(0.8, (1 - rIdx / 22) * 2.6 * (0.6 + Math.sin((dIdx / dotCount) * Math.PI) * 0.4))
              return <circle key={dIdx} cx={cx} cy={cy} r={size} fill="#ffffff" />
            })}
          </g>
        )
      })}

      {/* Dynamiczne linie fal dźwiękowych i plazmy */}
      <path
        d="M 100 400 Q 230 290, 370 360 T 540 300 T 700 410"
        fill="none"
        stroke="url(#htWaveGrad)"
        strokeWidth="2.5"
        style={{ filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.8))' }}
      />
      <path
        d="M 140 415 Q 270 330, 410 390 T 590 340 T 740 420"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        opacity="0.8"
      />
    </svg>
  )
}

/** Podwójna plazmowa fala dźwiękowa (1:1 z dolnej części screena) */
function GlowingWaveform({ active = true, color = '#38bdf8' }: { active?: boolean; color?: string }) {
  return (
    <div className="relative h-24 w-full flex items-center justify-center select-none pointer-events-none">
      <svg viewBox="0 0 320 70" className="w-full h-full">
        <defs>
          <linearGradient id={`wGrad-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="25%" stopColor={color} stopOpacity="0.7" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="75%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Rozmyta poświata */}
        <path
          d="M 10 35 Q 80 12, 160 35 T 310 35"
          fill="none"
          stroke={color}
          strokeWidth="14"
          opacity="0.3"
          className={active ? 'animate-pulse' : ''}
          filter="blur(8px)"
        />
        {/* Precyzyjne linie fal */}
        <path
          d="M 10 35 Q 55 15, 110 40 T 195 24 T 265 42 T 310 35"
          fill="none"
          stroke={`url(#wGrad-${color.replace(/[^a-z0-9]/gi, '')})`}
          strokeWidth="2.5"
        />
        <path
          d="M 10 35 Q 65 50, 130 25 T 215 45 T 275 22 T 310 35"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity="0.9"
        />
      </svg>
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

/* ═══════════════════════════════════════════════════════════════════════
   1. HERO SEKCJA (BEZ BADGE'Y — CZYSTA LUKSUSOWA TYPOGRAFIA)
   ═══════════════════════════════════════════════════════════════════════ */
function CleanLuxuryHero({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  return (
    <div className="relative overflow-hidden pt-24 pb-14 sm:pt-32 sm:pb-20">
      <PageAmbience />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          
          {/* Lewa kolumna: Teksty ze Strony Głównej 2 i CTA */}
          <div className="lg:col-span-8">
            <FadeIn>
              <h1 className="font-heading text-[clamp(42px,6.8vw,80px)] font-normal leading-[1.02] tracking-[-0.04em] text-foreground">
                <span className="block text-primary drop-shadow-[0_0_40px_rgba(56,189,248,0.4)] font-bold">
                  NextByte.
                </span>
                <span className="block text-foreground">
                  Twoje AI w jednym miejscu.
                </span>
              </h1>

              <p className="mt-6 max-w-xl font-sans text-[16.5px] sm:text-[18px] font-light leading-[1.6] text-foreground/75">
                Dostęp do GPT-5, Claude, Gemini i Groka, generowanie grafik 4K oraz inteligentna baza wiedzy w jednym spójnym panelu — w 100% po polsku, na serwerach w UE i od 0 zł.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('cennik')}
                  className="rounded-full bg-white text-black px-8 py-3.5 text-[14.5px] font-heading font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-zinc-200 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Rozpocznij za darmo →
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('cennik')}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card/60 text-foreground/85 px-6 py-3.5 text-[14px] font-heading font-medium hover:border-primary/50 hover:text-white backdrop-blur-md transition-all cursor-pointer"
                >
                  <span>Zobacz możliwości</span>
                  <Play className="w-3.5 h-3.5 fill-current text-primary" />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-[12px] font-mono text-foreground/50">
                <span>Bez karty kredytowej</span>
                <span>·</span>
                <span>100 jednostek Byte na start</span>
                <span>·</span>
                <span>Polska faktura VAT 23%</span>
              </div>
            </FadeIn>
          </div>

          {/* Prawa kolumna: 3D Chromowane Gwiazdy */}
          <div className="lg:col-span-4 relative flex items-center justify-center min-h-[220px]">
            <FadeIn delay={100}>
              <div className="relative w-64 h-64 flex items-center justify-center">
                <ChromeStar size={160} className="animate-pulse" />
                <ChromeStar size={75} className="absolute -top-2 right-0 rotate-12 opacity-90" />
                <ChromeStar size={45} className="absolute bottom-2 -left-3 -rotate-12 opacity-75" />
              </div>
            </FadeIn>
          </div>

        </div>

        {/* Minimalistyczny pasek partnerów */}
        <div className="mt-14 pt-8 border-t border-foreground/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-6 opacity-65 text-foreground/75 font-mono text-[13px] font-bold">
            <span className="flex items-center gap-2"><OpenAIIcon className="w-4 h-4 text-primary" /> OpenAI</span>
            <span className="flex items-center gap-2"><AnthropicIcon className="w-4 h-4 text-primary" /> Anthropic</span>
            <span className="flex items-center gap-2"><GeminiIcon className="w-4 h-4 text-primary" /> Google</span>
            <span className="flex items-center gap-2"><XaiIcon className="w-4 h-4 text-primary" /> xAI Grok</span>
            <span className="flex items-center gap-2"><ElevenLabsIcon className="w-4 h-4 text-primary" /> ElevenLabs</span>
            <span className="flex items-center gap-2 text-primary font-bold">NVIDIA RTX</span>
          </div>
        </div>

      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   2. INTERAKTYWNE ROZWIJANE MODUŁY (BEZ KAFELKÓW — 1:1 ZE SCREENA)
   ═══════════════════════════════════════════════════════════════════════ */

/* ── MODUŁ 1: CZAT MULTIMODEL (KOPUŁA CZĄSTECEK & KONTROLER 1:1 ZE SS) ── */
function StageChatMultimodel({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const [activeModel, setActiveModel] = useState<'gpt' | 'claude' | 'gemini'>('gpt')
  const [activeMode, setActiveMode] = useState<string>('call')

  return (
    <Section className="relative z-10 py-24 sm:py-36">
      <div className="mx-auto max-w-5xl text-center">
        
        {/* Nagłówek modułu (bez badge'y) */}
        <FadeIn>
          <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-primary block mb-3">
            01 / Czat AI Multimodel
          </span>
          <h2 className="font-heading text-[clamp(34px,5.5vw,58px)] font-bold leading-[1.06] tracking-[-1.5px] text-foreground max-w-2xl mx-auto">
            Modele AI działające <br />
            <span className="text-primary font-bold">z prędkością myśli.</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto font-sans text-[16px] text-foreground/75 font-light leading-relaxed">
            Przełączaj OpenAI GPT-5.4, Claude 3.7 Sonnet i Gemini 2.5 w ułamku sekundy. Wspólny kontekst i zerowe opóźnienia.
          </p>
        </FadeIn>

        {/* ── KOPUŁA CZĄSTECEK I PŁYWAJĄCY KONTROLER (1:1 ZE SCREENA) ── */}
        <div className="relative mt-12 sm:mt-16 flex items-center justify-center min-h-[380px] sm:min-h-[460px] overflow-hidden">
          
          {/* Halftone Dotted Sphere w tle */}
          <div className="absolute inset-x-0 bottom-0 top-6 flex items-center justify-center">
            <HalftoneDottedSphere className="max-w-3xl" />
          </div>

          {/* Centralny Pływający Szklany Kontroler (1:1 ze screena) */}
          <FadeIn delay={80} className="relative z-10 w-full max-w-xl px-4">
            <div className="rounded-3xl border border-white/20 bg-card/85 p-6 sm:p-7 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-left space-y-6">
              
              {/* Górny wiersz: Tytuł i Selektor Modelu */}
              <div className="flex items-center justify-between">
                <p className="font-heading text-[15.5px] font-bold text-foreground">
                  Witaj w NextByte — Twoje AI w jednym oknie.
                </p>

                {/* Dropdown / Selektor modelu */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground/15 bg-background/80 text-[11px] font-mono text-foreground font-bold shadow-inner">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span>{activeModel === 'gpt' ? 'GPT-5.4' : activeModel === 'claude' ? 'Claude 3.7' : 'Gemini Pro'}</span>
                </div>
              </div>

              {/* Przyciski Akcji (1:1 ze screena: Test a call, Create a line, Narrate) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'call', label: '💬 Czat na żywo', model: 'gpt' },
                    { id: 'reason', label: '🧠 Głębokie myślenie', model: 'claude' },
                    { id: 'search', label: '🔍 Research internetu', model: 'gemini' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => { setActiveMode(btn.id); setActiveModel(btn.model as 'gpt' | 'claude' | 'gemini') }}
                      className={cn(
                        'px-3.5 py-2 rounded-xl text-[12px] font-sans font-medium transition-all cursor-pointer border',
                        activeMode === btn.id
                          ? 'border-primary/50 bg-primary/15 text-primary shadow-sm'
                          : 'border-foreground/[0.08] bg-foreground/[0.03] text-foreground/70 hover:text-foreground'
                      )}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Okrągły przycisk akcji Play / Wyślij (1:1 ze screena) */}
                <button
                  type="button"
                  onClick={() => onNavigate('cennik')}
                  className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer shrink-0"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>

              {/* Odpowiedź live modelu */}
              <div className="pt-3 border-t border-foreground/[0.08] font-sans text-[13.5px] text-foreground/80 leading-relaxed font-light">
                {activeModel === 'gpt' && (
                  <span><strong className="text-primary font-mono text-[11px] uppercase mr-2">GPT-5.4:</strong> Gotowy do natychmiastowej syntezy. Kontekst pamięci jest współdzielony ze wszystkimi modułami.</span>
                )}
                {activeModel === 'claude' && (
                  <span><strong className="text-primary font-mono text-[11px] uppercase mr-2">Claude 3.7:</strong> Tryb Reasoning aktywny. Analiza złożonych procesów i weryfikacja logiki z dokładnością do 99.8%.</span>
                )}
                {activeModel === 'gemini' && (
                  <span><strong className="text-primary font-mono text-[11px] uppercase mr-2">Gemini 2.5:</strong> Przeszukiwanie bazy źródeł w czasie rzeczywistym z przepustowością 160 tokenów na sekundę.</span>
                )}
              </div>

            </div>
          </FadeIn>
        </div>

      </div>
    </Section>
  )
}

/* ── MODUŁ 2: STUDIO AUDIO & LEKTOR PL (DUAL WAVEFORM 1:1 ZE SCREENA) ── */
function StageAudioDualWaveform({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <Section className="relative z-10 py-24 sm:py-36 border-t border-foreground/[0.08]">
      <div className="mx-auto max-w-5xl text-center">
        
        <FadeIn>
          <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-primary block mb-3">
            02 / Studio Audio & Lektor PL
          </span>
          <h2 className="font-heading text-[clamp(34px,5.5vw,58px)] font-bold leading-[1.06] tracking-[-1.5px] text-foreground max-w-2xl mx-auto">
            Stworzone do głosu <br />
            <span className="text-primary font-bold">w czasie rzeczywistym.</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto font-sans text-[16px] text-foreground/75 font-light leading-relaxed">
            Nieskazitelna studyjna precyzja, naturalna polska dykcja i natychmiastowa transkrypcja z podziałem na role.
          </p>
        </FadeIn>

        {/* ── PODWÓJNY PANEL HUMAN VOICE / NEXTBYTE AGENT (1:1 ZE SCREENA) ── */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
          
          {/* Lewo: Wejście / Prompt audio */}
          <FadeIn delay={60}>
            <div className="rounded-3xl border border-foreground/[0.1] bg-card/75 p-6 sm:p-7 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between font-mono text-[11px] text-foreground/60">
                <span>Wejście / Nagranie</span>
                <span className="px-2.5 py-0.5 rounded-full bg-foreground/[0.08] text-foreground font-bold">Oryginał PL</span>
              </div>
              <GlowingWaveform active={isPlaying} color="#94a3b8" />
              <div className="pt-3 border-t border-foreground/[0.08]">
                <p className="font-heading text-[14px] font-bold text-foreground">Opóźnienie poniżej 12ms</p>
                <p className="mt-1 text-[13px] font-sans text-foreground/60 font-light">
                  Silnik syntezy odpowiada szybciej niż mrugnięcie okiem, umożliwiając płynny dialog.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Prawo: NextByte Lektor PL (ElevenLabs v3 HD) */}
          <FadeIn delay={100}>
            <div className="rounded-3xl border border-primary/30 bg-card/90 p-6 sm:p-7 backdrop-blur-xl space-y-4 shadow-[0_0_40px_rgba(56,189,248,0.15)]">
              <div className="flex items-center justify-between font-mono text-[11px] text-primary">
                <span>NextByte Lektor PL</span>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold">ElevenLabs v3 48kHz</span>
              </div>
              <GlowingWaveform active={isPlaying} color="#38bdf8" />
              <div className="pt-3 border-t border-foreground/[0.08]">
                <p className="font-heading text-[14px] font-bold text-foreground">Precyzyjna polska intonacja</p>
                <p className="mt-1 text-[13px] font-sans text-foreground/60 font-light">
                  Nazwy własne, liczby i żargon techniczny wymawiane bez sztucznego akcentu.
                </p>
              </div>
            </div>
          </FadeIn>

        </div>

        {/* Centralny przycisk odsłuchu */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-full bg-white text-black px-7 py-3 text-[13.5px] font-heading font-bold hover:bg-zinc-200 transition-all cursor-pointer shadow-lg flex items-center gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Zatrzymaj odsłuch' : 'Odtwórz próbkę lektora'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('cennik')}
            className="rounded-full border border-foreground/15 bg-card/60 text-foreground px-6 py-3 text-[13.5px] font-heading font-medium hover:border-primary/50 transition-all cursor-pointer"
          >
            Otwórz Studio Audio →
          </button>
        </div>

      </div>
    </Section>
  )
}

/* ── MODUŁ 3: STUDIO ZDJĘĆ & KREACJI 4K (KINOWY VIEWPORT BEZ KAFELKA) ── */
function StageStudio4K({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const [resolution, setResolution] = useState<'4K' | '8K'>('4K')

  return (
    <Section className="relative z-10 py-24 sm:py-36 border-t border-foreground/[0.08]">
      <div className="mx-auto max-w-5xl text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <FadeIn>
              <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-primary">
                03 / Studio Zdjęć & Kreacji
              </span>
              <h2 className="font-heading text-[clamp(32px,5vw,54px)] font-bold leading-[1.06] tracking-[-1.5px] text-foreground">
                Fotorealizm 4K <br />
                <span className="text-primary font-bold">i generowanie wideo.</span>
              </h2>
              <p className="font-sans text-[16px] text-foreground/75 font-light leading-relaxed">
                Google Nano Banana Pro oraz Runware 4K. Twórz packshoty produktowe, banery reklamowe i materiały wideo o kinowej głębi.
              </p>

              <div className="pt-2 space-y-2 font-sans text-[14px] text-foreground/80">
                <p>✓ Pełne komercyjne prawa autorskie do każdego wygenerowanego pliku</p>
                <p>✓ Inteligentne powiększanie do druku wielkoformatowego</p>
                <p>✓ Zachowanie spójności postaci i stylu w całej serii</p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onNavigate('cennik')}
                  className="rounded-full bg-white text-black px-7 py-3 text-[13.5px] font-heading font-bold hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
                >
                  Generuj w 4K Ultra-HD →
                </button>
              </div>
            </FadeIn>
          </div>

          {/* Kinowy Viewport bez ramki */}
          <div className="lg:col-span-7">
            <FadeIn delay={100}>
              <div className="relative rounded-3xl border border-foreground/[0.12] bg-background/80 p-6 backdrop-blur-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-foreground/[0.08] pb-3 mb-4">
                  <span className="font-mono text-[11px] text-foreground/60 font-bold">Silnik: Nano Banana Pro</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setResolution('4K')}
                      className={cn('px-2.5 py-0.5 rounded font-mono text-[10px] font-bold cursor-pointer transition-all', resolution === '4K' ? 'bg-primary text-black' : 'text-foreground/40')}
                    >
                      4K UHD
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolution('8K')}
                      className={cn('px-2.5 py-0.5 rounded font-mono text-[10px] font-bold cursor-pointer transition-all', resolution === '8K' ? 'bg-primary text-black' : 'text-foreground/40')}
                    >
                      8K Raw
                    </button>
                  </div>
                </div>

                <div className="relative h-56 rounded-2xl border border-primary/20 bg-gradient-to-tr from-sky-950/40 via-card to-background flex items-center justify-center overflow-hidden">
                  <Camera className="w-12 h-12 text-primary/40 animate-pulse relative z-10" />
                  <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10.5px] text-foreground bg-card/90 backdrop-blur-md p-2.5 rounded-xl border border-foreground/10">
                    <span className="truncate max-w-[220px]">„Fotorealistyczny render butelki szklanej...”</span>
                    <span className="text-emerald-400 font-bold">Render gotowy ✓</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </Section>
  )
}

/* ── MODUŁ 4: BAZA WIEDZY & DYNAMIC RAG 1M (WEKTOROWA KONSTELACJA) ─── */
function StageVaultRAG({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  return (
    <Section className="relative z-10 py-24 sm:py-36 border-t border-foreground/[0.08]">
      <div className="mx-auto max-w-5xl text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 order-2 lg:order-1">
            <FadeIn delay={100}>
              <div className="rounded-3xl border border-foreground/[0.12] bg-card/85 p-6 sm:p-7 backdrop-blur-2xl shadow-2xl space-y-3 font-mono text-[12px]">
                <div className="flex items-center justify-between border-b border-foreground/[0.08] pb-3 mb-3">
                  <span className="text-foreground/70 font-bold">Indeks Wektorowy 1 000 000 Tokenów</span>
                  <span className="text-emerald-400 font-bold">AES-256 E2EE Active</span>
                </div>

                {[
                  { title: 'Umowa_Inwestycyjna_2026.pdf', size: '24 str.', relevance: '99.8%' },
                  { title: 'Kwartalny_Raport_Finansowy.xlsx', size: '12 ark.', relevance: '98.5%' },
                  { title: 'Dokumentacja_Architektury_API.md', size: '85 str.', relevance: '100%' },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-foreground/[0.08] bg-background/80">
                    <span className="flex items-center gap-2 text-foreground font-bold truncate max-w-[220px]">
                      <Layers className="w-4 h-4 text-primary shrink-0" />
                      {doc.title}
                    </span>
                    <span className="text-foreground/50 hidden sm:inline">{doc.size}</span>
                    <span className="text-primary font-bold">{doc.relevance}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
            <FadeIn>
              <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-primary">
                04 / Baza Wiedzy i Notatki
              </span>
              <h2 className="font-heading text-[clamp(32px,5vw,54px)] font-bold leading-[1.06] tracking-[-1.5px] text-foreground">
                Pamięć do miliona <br />
                <span className="text-primary font-bold">tokenów kontekstu.</span>
              </h2>
              <p className="font-sans text-[16px] text-foreground/75 font-light leading-relaxed">
                Przeszukuj obszerne tomy dokumentacji, umowy i arkusze Excel. Natychmiastowa ekstrakcja faktów z precyzją OCR.
              </p>

              <div className="pt-2 space-y-2 font-sans text-[14px] text-foreground/80">
                <p>✓ Zero Data Retention — modele nie uczą się na Twoich plikach</p>
                <p>✓ Błyskawiczny OCR skanów i odręcznych notatek</p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onNavigate('cennik')}
                  className="rounded-full bg-white text-black px-7 py-3 text-[13.5px] font-heading font-bold hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
                >
                  Przetestuj Bazę Wiedzy →
                </button>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </Section>
  )
}

/* ── MODUŁ 5: PRYWATNY AI NA TWOIM GPU 0 ZŁ (HARDWARE ACCELERATION) ──── */
function StageHardwareGPU({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  return (
    <Section className="relative z-10 py-24 sm:py-36 border-t border-foreground/[0.08]">
      <div className="mx-auto max-w-5xl text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <FadeIn>
              <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-emerald-400">
                05 / Prywatność & Hardware
              </span>
              <h2 className="font-heading text-[clamp(32px,5vw,54px)] font-bold leading-[1.06] tracking-[-1.5px] text-foreground">
                Lokalny GPU <br />
                <span className="text-emerald-400 font-bold">100% offline za 0 zł.</span>
              </h2>
              <p className="font-sans text-[16px] text-foreground/75 font-light leading-relaxed">
                Uruchamiaj modele Llama, Mistral i DeepSeek bezpośrednio na karcie NVIDIA RTX lub układzie Apple Metal bez opłat i limitów.
              </p>

              <div className="pt-2 space-y-2 font-sans text-[14px] text-foreground/80">
                <p>✓ Integracja z Ollama i LM Studio jednym kliknięciem</p>
                <p>✓ Zero zużycia jednostek Byte — darmowa praca lokalna</p>
                <p>✓ 100% bezpieczeństwa dla danych poufnych</p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onNavigate('cennik')}
                  className="rounded-full bg-white text-black px-7 py-3 text-[13.5px] font-heading font-bold hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
                >
                  Włącz tryb offline GPU →
                </button>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-7">
            <FadeIn delay={100}>
              <div className="rounded-3xl border border-emerald-500/30 bg-card/90 p-6 sm:p-7 backdrop-blur-2xl shadow-2xl font-mono text-[12px] space-y-4">
                <div className="flex items-center justify-between border-b border-foreground/[0.08] pb-3">
                  <span className="text-emerald-400 font-bold">Air-Gapped Hardware Mode</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">0 Byte (Free)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl border border-foreground/[0.08] bg-background/80 text-left">
                    <span className="text-[10px] text-foreground/45 block mb-1">Akcelerator</span>
                    <p className="text-[13px] font-bold text-foreground">NVIDIA RTX / Metal</p>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-foreground/[0.08] bg-background/80 text-left">
                    <span className="text-[10px] text-foreground/45 block mb-1">Silnik</span>
                    <p className="text-[13px] font-bold text-emerald-400">Ollama Local Mesh</p>
                  </div>
                </div>

                <p className="text-foreground/75 text-[12px]">
                  Dane nie opuszczają Twojego komputera. Pełna prywatność prawna i medyczna.
                </p>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   3. SPRAWDZONE WYNIKI (KASKADA 3D METRYK BEZ BADGE'Y)
   ═══════════════════════════════════════════════════════════════════════ */
function CleanProvenResults() {
  return (
    <Section className="relative z-10 py-20 sm:py-32 border-t border-foreground/[0.08]">
      <div className="mx-auto max-w-5xl text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-4">
            <FadeIn>
              <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-primary">
                Osiągnięcia i Wyniki
              </span>
              <h2 className="font-heading text-[clamp(32px,5vw,52px)] font-bold leading-[1.08] tracking-[-1.5px] text-foreground">
                Sprawdzone wyniki, <br />
                <span className="text-primary font-bold">którym możesz zaufać.</span>
              </h2>
              <p className="mt-4 font-sans text-[16px] text-foreground/75 font-light leading-relaxed max-w-md">
                Od startupów po wiodące firmy technologiczne — pomagamy setkom twórców i firm osiągać rekordowe rezultaty w rekordowym czasie.
              </p>

              <div className="mt-8 flex items-center gap-4 text-foreground/70 font-mono text-[12px]">
                <span>✓ 99.9% Uptime</span>
                <span>·</span>
                <span>✓ Szyfrowanie Bankowe</span>
                <span>·</span>
                <span>✓ Klastry w UE</span>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-6 relative min-h-[280px] flex items-center justify-center">
            <FadeIn delay={100} className="w-full">
              <div className="relative w-full max-w-[340px] mx-auto h-[250px]">
                {/* Karta 1 */}
                <div className="absolute top-0 right-0 w-[240px] rounded-2xl border border-foreground/[0.15] bg-card p-5 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-foreground/50">Efektywność</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="font-heading text-[32px] font-black text-foreground leading-none">200%</p>
                  <p className="mt-1 text-[11px] text-foreground/60 font-sans">Wzrost szybkości tworzenia</p>
                </div>

                {/* Karta 2 */}
                <div className="absolute top-20 left-0 w-[240px] rounded-2xl border border-primary/40 bg-card p-5 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-primary">Generacje</span>
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-heading text-[32px] font-black text-primary leading-none">50K+</p>
                  <p className="mt-1 text-[11px] text-foreground/60 font-sans">Wykonanych zapytań AI</p>
                </div>

                {/* Karta 3 */}
                <div className="absolute bottom-0 right-4 w-[210px] rounded-2xl border border-foreground/[0.12] bg-card/90 p-4 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-foreground/50">Stack</span>
                    <Layers className="w-3.5 h-3.5 text-foreground/60" />
                  </div>
                  <p className="font-heading text-[24px] font-black text-foreground leading-none">7+ Modeli</p>
                  <p className="mt-0.5 text-[10px] text-foreground/60 font-sans">Wszystkie w jednym oknie</p>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   4. OPINIE UŻYTKOWNIKÓW (BEZ BADGE'Y)
   ═══════════════════════════════════════════════════════════════════════ */
function CleanTestimonials() {
  return (
    <Section className="relative z-10 py-20 sm:py-32 border-t border-foreground/[0.08]">
      <div className="mx-auto max-w-5xl text-left">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div>
              <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-primary">
                Opinie Twórców
              </span>
              <h2 className="font-heading text-[clamp(30px,4.8vw,50px)] font-bold leading-[1.08] tracking-[-1.5px] text-foreground mt-2">
                Co mówią o nas nasi użytkownicy.
              </h2>
              <p className="mt-3 max-w-xl font-sans text-[16px] text-foreground/70 font-light leading-relaxed">
                Doświadczenia programistów, grafików i przedsiębiorców korzystających z NextByte na co dzień.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-10 w-10 rounded-full border border-foreground/[0.15] bg-card flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
              >
                ←
              </button>
              <button
                type="button"
                className="h-10 w-10 rounded-full border border-foreground/[0.15] bg-card flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
              >
                →
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {OPINIE.slice(0, 3).map((o, idx) => (
            <FadeIn key={o.id} delay={idx * 80}>
              <div className="h-full flex flex-col justify-between rounded-3xl border border-foreground/[0.1] bg-card/85 p-6 backdrop-blur-xl hover:border-primary/40 transition-all shadow-xl">
                <div>
                  <Stars n={5} size={14} />
                  <p className="mt-4 font-sans text-[14px] text-foreground/85 leading-relaxed font-light italic">
                    „{o.tekst}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-foreground/[0.06] flex items-center justify-between">
                  <div>
                    <p className="font-heading text-[14px] font-bold text-foreground">{o.kategoria}</p>
                    <p className="text-[11.5px] text-foreground/50">{o.rola}</p>
                  </div>
                  <span className="rounded-lg bg-foreground/[0.06] px-2.5 py-1 font-mono text-[11px] font-bold text-primary">
                    {o.metryka}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   5. FAQ (BEZ BADGE'Y)
   ═══════════════════════════════════════════════════════════════════════ */
function CleanFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <Section className="relative z-10 py-20 sm:py-32 border-t border-foreground/[0.08]">
      <div className="mx-auto max-w-5xl text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-5 space-y-3">
            <FadeIn>
              <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-primary">
                FAQ
              </span>
              <h2 className="font-heading text-[clamp(32px,5vw,50px)] font-bold leading-[1.08] tracking-[-1.5px] text-foreground">
                Masz pytania? <br />
                <span className="text-primary font-bold">Mamy odpowiedzi.</span>
              </h2>
              <p className="mt-4 font-sans text-[15.5px] text-foreground/70 font-light leading-relaxed">
                Wszystko, co warto wiedzieć o modelach, rozliczeniach w PLN i bezpieczeństwie platformy NextByte.
              </p>
            </FadeIn>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {FAQ.slice(0, 5).map((item, idx) => {
              const isOpen = openIdx === idx
              return (
                <FadeIn key={item.q} delay={idx * 60}>
                  <div className={cn(
                    'rounded-2xl border transition-all overflow-hidden',
                    isOpen
                      ? 'border-primary/40 bg-card shadow-lg'
                      : 'border-foreground/[0.08] bg-card/60 hover:border-foreground/20'
                  )}>
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-heading text-[15.5px] font-bold text-foreground cursor-pointer"
                    >
                      <span className="pr-4">{item.q}</span>
                      <ChevronDown className={cn('w-4 h-4 text-primary shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-foreground/[0.06] font-sans text-[14px] text-foreground/75 leading-relaxed font-light">
                        {item.a}
                      </div>
                    )}
                  </div>
                </FadeIn>
              )
            })}
          </div>

        </div>
      </div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   6. FOOTER Z MONUMENTALNYM "NEXTBYTE"
   ═══════════════════════════════════════════════════════════════════════ */
function CleanFooter({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  return (
    <footer className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 border-t border-foreground/[0.08] bg-background text-left">
      <Glow className="left-1/2 top-0 -translate-x-1/2" size={700} opacity={0.15} />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-foreground/[0.08]">
          <div className="lg:col-span-5">
            <span className="font-heading text-[24px] font-black text-foreground">NextByte.</span>
            <p className="mt-3 font-sans text-[14px] text-foreground/65 max-w-sm font-light leading-relaxed">
              Zunifikowana platforma modeli sztucznej inteligencji. Korzystaj z najpotężniejszych silników na świecie w 1 oknie z polską fakturą VAT.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => onNavigate('cennik')}
                className="rounded-full bg-white text-black px-7 py-3 text-[13.5px] font-heading font-bold hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
              >
                Rozpocznij za darmo →
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-3 gap-6 font-sans text-[13px]">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground/40 mb-3">Moduły</p>
              <ul className="space-y-2 text-foreground/70">
                <li><button onClick={() => onNavigate('cennik')} className="hover:text-foreground">Czat Multimodel</button></li>
                <li><button onClick={() => onNavigate('cennik')} className="hover:text-foreground">Studio Zdjęć 4K</button></li>
                <li><button onClick={() => onNavigate('cennik')} className="hover:text-foreground">Baza Wiedzy</button></li>
                <li><button onClick={() => onNavigate('cennik')} className="hover:text-foreground">Lokalny GPU 0 zł</button></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground/40 mb-3">O platformie</p>
              <ul className="space-y-2 text-foreground/70">
                <li><button onClick={() => onNavigate('cennik')} className="hover:text-foreground">Technologia</button></li>
                <li><button onClick={() => onNavigate('cennik')} className="hover:text-foreground">Bezpieczeństwo</button></li>
                <li><button onClick={() => onNavigate('cennik')} className="hover:text-foreground">Cennik w PLN</button></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground/40 mb-3">Wsparcie</p>
              <ul className="space-y-2 text-foreground/70">
                <li><button onClick={() => onNavigate('cennik')} className="hover:text-foreground">Dokumentacja</button></li>
                <li><button onClick={() => onNavigate('cennik')} className="hover:text-foreground">Regulamin i RODO</button></li>
                <li><button onClick={() => onNavigate('cennik')} className="hover:text-foreground">Kontakt</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="py-6 flex flex-col sm:flex-row items-center justify-between text-[11.5px] font-mono text-foreground/50 gap-3">
          <span>Copyright © 2026 NextByte. Wszystkie prawa zastrzeżone.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-foreground cursor-pointer">Polityka Prywatności</span>
            <span>·</span>
            <span className="hover:text-foreground cursor-pointer">Regulamin</span>
          </div>
        </div>

      </div>

      {/* Monumentalny Obrys Typography "NEXTBYTE" */}
      <div className="select-none overflow-hidden text-center mt-8">
        <h2
          className="font-heading text-[18vw] font-black tracking-tighter leading-none opacity-20 uppercase"
          style={{
            WebkitTextStroke: '2px rgba(255, 255, 255, 0.4)',
            color: 'transparent',
          }}
        >
          NEXTBYTE
        </h2>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   GŁÓWNY KOMPONENT: HomePage3 (Interaktywny Scroll Storyboard bez kafelków)
   ═══════════════════════════════════════════════════════════════════════ */
export function HomePage3({ onNavigate = () => {} }: { onNavigate?: (p: HomePageId) => void }) {
  return (
    <div className="relative flex w-full flex-col font-landing text-foreground bg-background selection:bg-primary selection:text-background">
      <AnimStyles />
      <PageAmbience />

      {/* 1. Hero (Napis ze Strony Głównej 2 + 3D Chrome Stars + Pill CTA) */}
      <CleanLuxuryHero onNavigate={onNavigate} />

      {/* 2. Moduł 1: Czat Multimodel (Kopuła Cząsteczek Halftone & Kontroler 1:1 ze screena) */}
      <StageChatMultimodel onNavigate={onNavigate} />

      {/* 3. Moduł 2: Studio Audio (Podwójna Fala Plazmowa Human vs NextByte 1:1 ze screena) */}
      <StageAudioDualWaveform onNavigate={onNavigate} />

      {/* 4. Moduł 3: Studio 4K (Kinowy Viewport bez ramki) */}
      <StageStudio4K onNavigate={onNavigate} />

      {/* 5. Moduł 4: Baza Wiedzy (Wektorowa Konstelacja 1M Tokenów) */}
      <StageVaultRAG onNavigate={onNavigate} />

      {/* 6. Moduł 5: Prywatny AI na Twoim GPU 0 zł */}
      <StageHardwareGPU onNavigate={onNavigate} />

      {/* 7. Sprawdzone Wyniki (Kaskada 3D Kart 200%, 50K+, 7+) */}
      <CleanProvenResults />

      {/* 8. Opinie Użytkowników */}
      <CleanTestimonials />

      {/* 9. Często Zadawane Pytania FAQ */}
      <CleanFaq />

      {/* 10. Footer z monumentalnym obrysem "NEXTBYTE" */}
      <CleanFooter onNavigate={onNavigate} />
    </div>
  )
}
