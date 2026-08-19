import React from 'react'
import { Tile, TilePill } from '@/components/Tile'
import { CennikSection } from '@/sections/CennikSection'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

export function StronaGlownaSection() {
  return (
    <div className="w-full min-h-screen text-foreground relative font-sans overflow-x-clip pb-16">

      {/* Background Gradients/Patterns */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-40 bg-[linear-gradient(rgba(105,179,240,0.05)_1px,transparent_1px)_0%_0%/56px_56px,linear-gradient(90deg,rgba(105,179,240,0.05)_1px,transparent_1px)]" />

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 min-h-[92vh] flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 font-mono uppercase mb-8 text-[10px] tracking-[3px] text-primary/60 px-4 py-2 border border-primary/20 rounded-full bg-background/50 backdrop-blur-sm">
            <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
            NEXTBYTE // SYSTEM ONLINE
          </div>
          <h1 className="font-heading text-[clamp(40px,6.6vw,82px)] tracking-[-2px] leading-[1.02] mb-7 font-light">
            <span className="text-primary drop-shadow-[0_0_28px_rgba(105,179,240,0.28)] block font-normal">NextByte.</span>
            <span className="text-foreground block font-light">Twoja przewaga w AI.</span>
          </h1>
          <p className="mx-auto max-w-[720px] text-[clamp(14px,1.15vw,16px)] leading-[1.65] text-foreground/65 mb-10 font-light">
            Platforma AI po polsku — chat z najlepszymi modelami, notatki, kalendarz, panel firmowy i narzędzia twórcy w jednym miejscu. Bez przeskakiwania między appkami.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="font-mono text-[11px] tracking-[2px] px-6 py-3 border border-primary/70 bg-transparent text-primary uppercase transition-all hover:bg-primary/10 hover:shadow-[0_0_18px_rgba(105,179,240,0.18)]">
              [ ZACZNIJ ZA DARMO ]
            </button>
            <button className="font-mono text-[11px] tracking-[2px] px-6 py-3 border border-primary/20 bg-transparent text-foreground/75 uppercase transition-all hover:bg-foreground/5">
              [ SPRAWDŹ, CZY TO DLA CIEBIE ]
            </button>
          </div>
          <div className="mt-20 font-mono uppercase text-[10px] tracking-[4px] text-primary/45 animate-bounce">
            ▼ SCROLLUJ ▼
          </div>
        </div>
      </section>



      {/* ── MANIFEST SECTION ── */}
      <section className="relative z-10 px-4 sm:px-6 py-20 sm:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="font-mono uppercase mb-16 text-[11px] tracking-[3px] text-primary/95">// MANIFEST</div>
          <div className="space-y-10">
            <div className="font-heading font-light text-[clamp(26px,4.2vw,48px)] leading-[1.2] tracking-[-1px] text-foreground/80">Osobne appki do AI, notatek i kalendarza męczą.</div>
            <div className="font-heading font-light text-[clamp(26px,4.2vw,48px)] leading-[1.2] tracking-[-1px] text-foreground/80">Płacisz za pięć subskrypcji, używasz jednej.</div>
            <div className="font-heading font-light text-[clamp(26px,4.2vw,48px)] leading-[1.2] tracking-[-1px] text-primary drop-shadow-[0_0_28px_rgba(105,179,240,0.28)]">NextByte łączy to w jedną platformę.</div>
          </div>
          <p className="mt-20 max-w-2xl text-[15px] leading-[1.7] text-foreground/65 font-light">
            Chat AI z najlepszymi modelami (Gemini 3 Pro, GPT-5, Claude, Grok), notatki z AI, kalendarz, panel firmowy z zespołem, generowanie grafik i wideo, własne agenty. Jedna subskrypcja, jedno logowanie, polski interfejs.
          </p>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative w-full my-24 flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="w-[34px] h-[7px] bg-primary shadow-[0_0_14px_hsl(var(--primary))] rounded-[2px]" />
      </div>

      {/* ── SYGNAŁ ZAMIAST SZUMU ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto grid gap-10 lg:gap-16 lg:grid-cols-2 items-center">
          <div>
            <div className="font-mono text-[11px] tracking-[1.5px] text-primary/55 mb-6">
              <div>&gt; </div>
              <div>&gt; </div>
            </div>
            <h3 className="font-heading font-normal text-[clamp(24px,3.6vw,40px)] leading-[1.1] tracking-[-0.5px] text-primary drop-shadow-[0_0_28px_rgba(105,179,240,0.28)] mb-6">
              // SYGNAŁ ZAMIAST SZUMU
            </h3>
            <p className="text-[15px] leading-[1.65] text-foreground/70 font-light mb-4">
              Codziennie wychodzi 50 „przełomowych” narzędzi AI. Znaczenie mają 2.
            </p>
            <p className="text-[15px] leading-[1.65] text-foreground/70 font-light">
              NextByte testuje je za Ciebie i pokazuje tylko to, co realnie przyspiesza pracę — z instrukcją krok po kroku, po polsku.
            </p>
          </div>
          <div>
            <div className="font-mono uppercase mb-4 text-[10px] tracking-[3px] text-primary/55">NEXTBYTE // RADAR</div>
            <Tile intencja="akcent" elewacja="plaska" className="p-0 border-primary/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10 bg-primary/5">
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <div className="flex-1 text-center font-mono uppercase text-[10px] tracking-[2px] text-primary/95">NEXTBYTE // RADAR</div>
              </div>
              <div className="p-6">
                {/* Simulated Radar Chart */}
                <svg viewBox="0 0 400 180" className="w-full h-auto text-primary">
                  <path d="M0,140 L40,120 L80,130 L120,100 L160,110 L200,70 L240,90 L280,50 L320,60 L360,25 L400,40" fill="none" stroke="currentColor" strokeWidth="2" style={{filter: 'drop-shadow(0 0 6px rgba(105,179,240,0.8))'}} />
                  <path d="M0,140 L40,120 L80,130 L120,100 L160,110 L200,70 L240,90 L280,50 L320,60 L360,25 L400,40 L400,180 L0,180 Z" fill="currentColor" fillOpacity="0.1" />
                </svg>
              </div>
            </Tile>
          </div>
        </div>
      </section>

      {/* ── PROMPTY, KTÓRE DZIAŁAJĄ ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto grid gap-10 lg:gap-16 lg:grid-cols-2 items-center flex-row-reverse">
          <div>
            <div className="font-mono uppercase mb-4 text-[10px] tracking-[3px] text-primary/55">NEXTBYTE // BAZA PROMPTÓW</div>
            <Tile intencja="akcent" elewacja="plaska" className="p-0 border-primary/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10 bg-primary/5">
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <div className="flex-1 text-center font-mono uppercase text-[10px] tracking-[2px] text-primary/95">NEXTBYTE // BAZA PROMPTÓW</div>
              </div>
              <div className="p-6 space-y-3 font-mono text-[11px] tracking-[1px]">
                {['01 // BADANIE — deep-dive w 4 krokach', '02 // TREŚĆ — hook do postu 30s', '03 // KOD — refaktor + testy w JS', '04 // AUTOMATYZACJA — n8n webhook', '05 // ANALIZA — CSV → insights'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border border-primary/15 bg-background/60 text-foreground/75 rounded">
                    <span className="text-primary">›</span>
                    <span className="uppercase truncate">{item}</span>
                  </div>
                ))}
              </div>
            </Tile>
          </div>
          <div>
            <div className="font-mono text-[11px] tracking-[1.5px] text-primary/55 mb-6">
              <div>&gt; </div>
              <div>&gt; </div>
            </div>
            <h3 className="font-heading font-normal text-[clamp(24px,3.6vw,40px)] leading-[1.1] tracking-[-0.5px] text-primary drop-shadow-[0_0_28px_rgba(105,179,240,0.28)] mb-6">
              // PROMPTY, KTÓRE DZIAŁAJĄ
            </h3>
            <p className="text-[15px] leading-[1.65] text-foreground/70 font-light mb-4">
              Zero „magicznych promptów” z TikToka. Dostajesz sprawdzone szablony pod konkretne zadania: research, treści, automatyzacje, kod.
            </p>
            <p className="text-[15px] leading-[1.65] text-foreground/70 font-light">
              Każdy prompt z kontekstem: kiedy użyć, co zmienić pod siebie, czego się spodziewać.
            </p>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative w-full my-24 flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="w-[34px] h-[7px] bg-primary shadow-[0_0_14px_hsl(var(--primary))] rounded-[2px]" />
      </div>

      {/* ── GOTOWE PRZEPŁYWY ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto grid gap-10 lg:gap-16 lg:grid-cols-2 items-center">
          <div>
            <div className="font-mono text-[11px] tracking-[1.5px] text-primary/55 mb-6">
              <div>&gt; </div>
              <div>&gt; </div>
            </div>
            <h3 className="font-heading font-normal text-[clamp(24px,3.6vw,40px)] leading-[1.1] tracking-[-0.5px] text-primary drop-shadow-[0_0_28px_rgba(105,179,240,0.28)] mb-6">
              // GOTOWE PRZEPŁYWY
            </h3>
            <p className="text-[15px] leading-[1.65] text-foreground/70 font-light mb-4">
              Nie pojedyncze triki, tylko całe systemy: od pomysłu do wyniku, z rozpisanymi narzędziami i kolejnością kroków.
            </p>
            <p className="text-[15px] leading-[1.65] text-foreground/70 font-light">
              Kopiujesz, podmieniasz dane, działa. Tego samego dnia.
            </p>
          </div>
          <div>
            <div className="font-mono uppercase mb-4 text-[10px] tracking-[3px] text-primary/55">NEXTBYTE // LABORATORIUM PRZEPŁYWÓW</div>
            <Tile intencja="akcent" elewacja="plaska" className="p-0 border-primary/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10 bg-primary/5">
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <span className="w-2 h-2 rounded-full bg-foreground/20" />
                <div className="flex-1 text-center font-mono uppercase text-[10px] tracking-[2px] text-primary/95">NEXTBYTE // LABORATORIUM PRZEPŁYWÓW</div>
              </div>
              <div className="p-6">
                <svg viewBox="0 0 360 160" className="w-full">
                  <line x1="64" y1="72" x2="160" y2="42" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 3" className="text-primary" />
                  <line x1="64" y1="72" x2="160" y2="112" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 3" className="text-primary" />
                  <line x1="184" y1="42" x2="300" y2="72" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 3" className="text-primary" />
                  <line x1="184" y1="112" x2="300" y2="72" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 3" className="text-primary" />
                  
                  <g transform="translate(40,60)">
                    <rect width="48" height="24" fill="rgba(11,13,17,.9)" stroke="currentColor" className="text-primary" strokeWidth="1" rx="2" style={{filter: 'drop-shadow(0 0 4px rgba(105,179,240,0.5))'}} />
                    <text x="24" y="16" textAnchor="middle" fill="currentColor" className="text-primary" fontFamily="monospace" fontSize="10" letterSpacing="2">SRC</text>
                  </g>
                  <g transform="translate(160,30)">
                    <rect width="48" height="24" fill="rgba(11,13,17,.9)" stroke="currentColor" className="text-primary" strokeWidth="1" rx="2" style={{filter: 'drop-shadow(0 0 4px rgba(105,179,240,0.5))'}} />
                    <text x="24" y="16" textAnchor="middle" fill="currentColor" className="text-primary" fontFamily="monospace" fontSize="10" letterSpacing="2">AI</text>
                  </g>
                  <g transform="translate(160,100)">
                    <rect width="48" height="24" fill="rgba(11,13,17,.9)" stroke="currentColor" className="text-primary" strokeWidth="1" rx="2" style={{filter: 'drop-shadow(0 0 4px rgba(105,179,240,0.5))'}} />
                    <text x="24" y="16" textAnchor="middle" fill="currentColor" className="text-primary" fontFamily="monospace" fontSize="10" letterSpacing="2">FMT</text>
                  </g>
                  <g transform="translate(300,60)">
                    <rect width="48" height="24" fill="rgba(11,13,17,.9)" stroke="currentColor" className="text-primary" strokeWidth="1" rx="2" style={{filter: 'drop-shadow(0 0 4px rgba(105,179,240,0.5))'}} />
                    <text x="24" y="16" textAnchor="middle" fill="currentColor" className="text-primary" fontFamily="monospace" fontSize="10" letterSpacing="2">OUT</text>
                  </g>
                </svg>
              </div>
            </Tile>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative w-full my-24 flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="w-[34px] h-[7px] bg-primary shadow-[0_0_14px_hsl(var(--primary))] rounded-[2px]" />
      </div>

      {/* ── DEMO / NA ŻYWO ── */}
      <section className="relative z-10 px-4 sm:px-6 pt-20 sm:pt-24 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono uppercase mb-3 text-[11px] tracking-[3px] text-primary/95">// DEMO / NA ŻYWO</div>
          <h2 className="mb-4 max-w-3xl font-heading font-light text-[clamp(28px,4.6vw,52px)] leading-[1.06] tracking-[-1px] text-foreground">
            Zobacz platformę <span className="text-primary drop-shadow-[0_0_12px_rgba(105,179,240,0.4)] font-normal">w akcji.</span>
          </h2>
          <p className="mb-6 max-w-2xl font-heading font-light text-[15px] leading-[1.65] text-foreground/65">
            60 sekund. Bez slajdów, bez marketingu — tylko realny przegląd modułów NextByte w codziennym użyciu.
          </p>
          <div className="relative py-16 md:py-28 flex flex-col items-center">
            <div className="w-full max-w-4xl mx-auto relative rounded-[14px] overflow-hidden shadow-[0_0_40px_rgba(105,179,240,0.15)] border border-primary/30">
              <div className="aspect-video bg-background/80 w-full flex items-center justify-center relative">
                <span className="font-mono text-primary/40 uppercase tracking-widest">[ Odtwarzacz Wideo ]</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_20px_rgba(105,179,240,0.3)] cursor-pointer hover:scale-105 transition-transform">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-background border-b-[10px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative w-full my-24 flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="w-[34px] h-[7px] bg-primary shadow-[0_0_14px_hsl(var(--primary))] rounded-[2px]" />
      </div>

      {/* ── TECHNOLOGIA ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono uppercase mb-3 text-[11px] tracking-[3px] text-primary/95">// TECHNOLOGIA / NAPĘDZAJĄ NAS</div>
          <h2 className="mb-10 font-heading font-light text-[clamp(22px,3.4vw,36px)] leading-[1.15] tracking-[-0.5px] text-foreground">
            Zbudowane na tym samym stosie, co największe produkty AI.
          </h2>
          <Tile intencja="neutralna" elewacja="plaska" className="p-0 border-primary/20">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 border-b border-primary/10">
              {['GOOGLE', 'OPENAI', 'ANTHROPIC', 'XAI', 'MISTRAL', 'ELEVENLABS', 'RUNWARE', 'SUPABASE', 'STRIPE', 'VERCEL', 'CLOUDFLARE', 'TIPTAP'].map((brand, i) => (
                <div key={brand} className={cn("flex items-center justify-center py-6 px-3 font-mono uppercase text-[11px] tracking-[2.5px] text-foreground/60 border-r border-b border-primary/10")}>
                  <span className="text-primary mr-2 opacity-70">›</span>{brand}
                </div>
              ))}
            </div>
          </Tile>
          <p className="mt-6 font-mono uppercase text-[10.5px] tracking-[2px] text-foreground/45">
            // Wszystkie modele w jednym miejscu · Twoja subskrypcja to Twoja pula
          </p>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative w-full my-24 flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="w-[34px] h-[7px] bg-primary shadow-[0_0_14px_hsl(var(--primary))] rounded-[2px]" />
      </div>

      {/* ── MODUŁY ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono uppercase mb-3 text-[11px] tracking-[3px] text-primary/95">// PLATFORMA / MODUŁY</div>
          <h2 className="mb-12 max-w-3xl font-heading font-light text-[clamp(26px,4vw,44px)] leading-[1.15] tracking-[-0.5px] text-foreground">
            Jedno logowanie. <span className="text-primary drop-shadow-[0_0_12px_rgba(105,179,240,0.45)] font-normal">Cały stack AI.</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 md:[grid-auto-flow:dense]">
            
            <Tile intencja="neutralna" elewacja="uniesiona" className="md:col-span-2 px-5 py-6 sm:px-8 sm:py-10 md:px-12 md:py-11 border-primary/20">
              <div className="font-mono uppercase mb-3 flex items-center gap-3 text-[10px] tracking-[2.5px] text-primary/75">
                <span>// 01</span><span className="border border-primary/35 px-1.5 py-0.5 rounded-[2px] text-primary">CORE</span>
              </div>
              <h3 className="mb-3 font-heading font-normal text-[clamp(20px,2.2vw,26px)] text-foreground tracking-[-0.3px]">Chat AI</h3>
              <p className="font-heading font-light text-[14px] leading-[1.65] text-foreground/70">
                Gemini 3 Pro, GPT-5, Claude Opus/Sonnet, Grok — wszystkie w jednym oknie. Projekty, wiedza, artefakty, przełączanie modeli w locie.
              </p>
            </Tile>

            <Tile intencja="neutralna" elewacja="uniesiona" className="px-5 py-6 sm:px-8 sm:py-10 md:px-12 md:py-11 border-primary/20">
              <div className="font-mono uppercase mb-3 flex items-center gap-3 text-[10px] tracking-[2.5px] text-primary/75">
                <span>// 02</span>
              </div>
              <h3 className="mb-3 font-heading font-normal text-[clamp(20px,2.2vw,26px)] text-foreground tracking-[-0.3px]">Notatki z AI</h3>
              <p className="font-heading font-light text-[14px] leading-[1.65] text-foreground/70">
                Edytor TipTap, folder-sync jako źródło wiedzy dla czatu, autoanalizy per token.
              </p>
            </Tile>

            <Tile intencja="neutralna" elewacja="uniesiona" className="px-5 py-6 sm:px-8 sm:py-10 md:px-12 md:py-11 border-primary/20">
              <div className="font-mono uppercase mb-3 flex items-center gap-3 text-[10px] tracking-[2.5px] text-primary/75">
                <span>// 03</span>
              </div>
              <h3 className="mb-3 font-heading font-normal text-[clamp(20px,2.2vw,26px)] text-foreground tracking-[-0.3px]">Kalendarz</h3>
              <p className="font-heading font-light text-[14px] leading-[1.65] text-foreground/70">
                Wydarzenia, RRULE, snap 15 min, sync ze spotkaniami i zadaniami zespołu.
              </p>
            </Tile>

            <Tile intencja="neutralna" elewacja="uniesiona" className="px-5 py-6 sm:px-8 sm:py-10 md:px-12 md:py-11 border-primary/20">
              <div className="font-mono uppercase mb-3 flex items-center gap-3 text-[10px] tracking-[2.5px] text-primary/75">
                <span>// 04</span>
              </div>
              <h3 className="mb-3 font-heading font-normal text-[clamp(20px,2.2vw,26px)] text-foreground tracking-[-0.3px]">Panel Firmowy</h3>
              <p className="font-heading font-light text-[14px] leading-[1.65] text-foreground/70">
                Zespół, uprawnienia granularne, projekty, zadania, dokumenty, CRM, statystyki AI.
              </p>
            </Tile>

            <Tile intencja="neutralna" elewacja="uniesiona" className="px-5 py-6 sm:px-8 sm:py-10 md:px-12 md:py-11 border-primary/20">
              <div className="font-mono uppercase mb-3 flex items-center gap-3 text-[10px] tracking-[2.5px] text-primary/75">
                <span>// 05</span>
              </div>
              <h3 className="mb-3 font-heading font-normal text-[clamp(20px,2.2vw,26px)] text-foreground tracking-[-0.3px]">Obrazy &amp; Wideo</h3>
              <p className="font-heading font-light text-[14px] leading-[1.65] text-foreground/70">
                Photo Studio, generacja i edycja obrazów, wideo z modeli Google/Runware.
              </p>
            </Tile>

            <Tile intencja="neutralna" elewacja="uniesiona" className="px-5 py-6 sm:px-8 sm:py-10 md:px-12 md:py-11 border-primary/20">
              <div className="font-mono uppercase mb-3 flex items-center gap-3 text-[10px] tracking-[2.5px] text-primary/75">
                <span>// 06</span>
              </div>
              <h3 className="mb-3 font-heading font-normal text-[clamp(20px,2.2vw,26px)] text-foreground tracking-[-0.3px]">Głos AI</h3>
              <p className="font-heading font-light text-[14px] leading-[1.65] text-foreground/70">
                ElevenLabs WebSocket, polski męski głos, rozmowy w czasie rzeczywistym.
              </p>
            </Tile>

            <Tile intencja="neutralna" elewacja="uniesiona" className="md:col-span-2 px-5 py-6 sm:px-8 sm:py-10 md:px-12 md:py-11 border-primary/20">
              <div className="font-mono uppercase mb-3 flex items-center gap-3 text-[10px] tracking-[2.5px] text-primary/75">
                <span>// 07</span>
              </div>
              <h3 className="mb-3 font-heading font-normal text-[clamp(20px,2.2vw,26px)] text-foreground tracking-[-0.3px]">Agenty &amp; Automatyzacje</h3>
              <p className="font-heading font-light text-[14px] leading-[1.65] text-foreground/70">
                Własne agenty z webhookami, pętle 24/7, integracje z n8n i zewnętrznymi API.
              </p>
            </Tile>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative w-full my-24 flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="w-[34px] h-[7px] bg-primary shadow-[0_0_14px_hsl(var(--primary))] rounded-[2px]" />
      </div>

      {/* ── LOKALNY AI ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono uppercase mb-3 text-[11px] tracking-[3px] text-primary/95">// LOKALNY / PRYWATNE ŚRODOWISKO</div>
          <h2 className="mb-5 max-w-3xl font-heading font-light text-[clamp(28px,4.6vw,52px)] leading-[1.06] tracking-[-1px] text-foreground">
            Lokalny AI. <span className="text-primary drop-shadow-[0_0_12px_rgba(105,179,240,0.4)] font-normal">Zero tokenów na zewnątrz.</span>
          </h2>
          <p className="mb-10 max-w-2xl font-heading font-light text-[15px] leading-[1.65] text-foreground/65">
            LM Studio, Ollama albo Twój własny serwer OpenAI-compatible — NextByte gada z <span className="font-mono">localhost</span>, nigdy przez nasze API.
          </p>

          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 mb-10 pb-6 border-b border-primary/15 font-mono uppercase text-[10px] tracking-[2px] text-primary/50">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-normal text-[16px] text-foreground tracking-[-0.3px]">0 Byte</span>
              <span>Koszt / wiadomość</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-normal text-[16px] text-foreground tracking-[-0.3px]">0 B</span>
              <span>Dane wychodzące</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-normal text-[16px] text-foreground tracking-[-0.3px]">brak</span>
              <span>Wymagana sieć</span>
            </div>
          </div>

          <div className="font-mono uppercase mb-4 text-[10px] tracking-[2.5px] text-primary/95">// KORZYŚCI</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-14">
            {[
              { id: '01', title: '100% prywatność', desc: 'Zgodne z RODO. Dane nie opuszczają Twojej maszyny.' },
              { id: '02', title: '0 Byte / wiadomość', desc: 'Lokalny model = brak kosztów po stronie platformy.' },
              { id: '03', title: 'Działa offline', desc: 'Bez chmury, bez internetu — w pociągu czy w bunkrze.' },
              { id: '04', title: 'LM Studio · Ollama', desc: 'Każdy serwer OpenAI-compatible łączysz w 30 sekund.' },
              { id: '05', title: 'Dowolny model OSS', desc: 'Llama 3.1, Qwen 2.5, Mistral, DeepSeek — Twój wybór.' },
              { id: '06', title: 'Eksport rozmów', desc: 'Pełna historia do .md / .json — pod Twoją kontrolą.' },
            ].map((item) => (
              <Tile key={item.id} intencja="neutralna" elewacja="uniesiona" className="px-5 py-6 sm:px-8 sm:py-10 md:px-12 md:py-11 border-primary/20">
                <div className="font-mono uppercase mb-3 text-[10px] tracking-[2.5px] text-primary/70">// {item.id}</div>
                <h3 className="mb-2 font-heading font-normal text-[18px] text-foreground tracking-[-0.3px]">{item.title}</h3>
                <p className="font-heading font-light text-[13.5px] leading-[1.6] text-foreground/65">{item.desc}</p>
              </Tile>
            ))}
          </div>

          <div className="font-mono uppercase mb-4 text-[10px] tracking-[2.5px] text-primary/95">// DLA KOGO</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-14">
            {[
              { id: 'A', title: 'Firmy i korporacje', desc: 'Kontrakty i strategia nie opuszczają infrastruktury.' },
              { id: 'B', title: 'Prawnicy i kancelarie', desc: 'Tajemnica zawodowa — żaden token nie idzie do API.' },
              { id: 'C', title: 'Medycyna i zdrowie', desc: 'Dane pacjentów analizujesz lokalnie. HIPAA / RODO.' },
            ].map((item) => (
              <Tile key={item.id} intencja="neutralna" elewacja="uniesiona" className="px-5 py-6 sm:px-8 sm:py-10 md:px-12 md:py-11 border-primary/20">
                <div className="font-mono uppercase mb-3 text-[10px] tracking-[2.5px] text-primary">{item.id} /</div>
                <h3 className="mb-2 font-heading font-normal text-[18px] text-foreground tracking-[-0.3px]">{item.title}</h3>
                <p className="font-heading font-light text-[13.5px] leading-[1.6] text-foreground/65">{item.desc}</p>
              </Tile>
            ))}
          </div>

          <div className="font-mono uppercase mb-4 text-[10px] tracking-[2.5px] text-primary/95">// JAK ZACZĄĆ</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-10">
            {[
              { id: '01', title: 'Pobierz runner', desc: 'LM Studio lub Ollama — macOS / Windows / Linux.' },
              { id: '02', title: 'Załaduj model', desc: 'Llama 3.1, Qwen 2.5, Mistral — co tylko chcesz.' },
              { id: '03', title: 'Połącz z NextByte', desc: 'Wklej adres serwera, kliknij Testuj — gotowe.' },
            ].map((item) => (
              <Tile key={item.id} intencja="neutralna" elewacja="uniesiona" className="px-5 py-6 sm:px-8 sm:py-10 md:px-12 md:py-11 border-primary/20">
                <div className="font-mono uppercase mb-3 text-[11px] tracking-[2.5px] text-primary">{item.id}</div>
                <h3 className="mb-2 font-heading font-normal text-[18px] text-foreground tracking-[-0.3px]">{item.title}</h3>
                <p className="font-heading font-light text-[13.5px] leading-[1.6] text-foreground/65">{item.desc}</p>
              </Tile>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative w-full my-24 flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="w-[34px] h-[7px] bg-primary shadow-[0_0_14px_hsl(var(--primary))] rounded-[2px]" />
      </div>

      {/* ── TELEMETRIA ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono uppercase mb-8 text-[11px] tracking-[3px] text-primary/95">// TELEMETRIA</div>
          <Tile intencja="neutralna" elewacja="uniesiona" className="p-0 border-primary/20">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {[
                { id: '01', val: '10+', title: 'Modeli AI', desc: 'Gemini · GPT · Claude · Grok · Mistral' },
                { id: '02', val: '1', title: 'Subskrypcja', desc: 'Zamiast pięciu osobnych' },
                { id: '03', val: '100%', title: 'Po polsku', desc: 'Interfejs, prompty, wsparcie' },
                { id: '04', val: '24/7', title: 'Agenty AI', desc: 'Autonomiczne pętle w tle' },
              ].map((stat, i) => (
                <div key={stat.id} className={cn("p-6 sm:p-8", i !== 3 && "border-b lg:border-b-0 lg:border-r border-primary/10")}>
                  <div className="font-mono uppercase mb-3 text-[10px] tracking-[2.5px] text-primary/60">// {stat.id}</div>
                  <div className="font-heading font-light text-[clamp(38px,5vw,64px)] leading-[1] text-primary drop-shadow-[0_0_10px_rgba(105,179,240,0.5)] tracking-[-1px]">{stat.val}</div>
                  <div className="mt-3 font-heading font-normal text-[15px] text-foreground">{stat.title}</div>
                  <div className="mt-1 font-heading font-light text-[12.5px] text-foreground/55 leading-[1.5]">{stat.desc}</div>
                </div>
              ))}
            </div>
          </Tile>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="relative w-full my-24 flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="w-[34px] h-[7px] bg-primary shadow-[0_0_14px_hsl(var(--primary))] rounded-[2px]" />
      </div>

      {/* ── CENNIK SECTION ── */}
      <CennikSection />

      {/* ── DIVIDER ── */}
      <div className="relative w-full my-24 flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="w-[34px] h-[7px] bg-primary shadow-[0_0_14px_hsl(var(--primary))] rounded-[2px]" />
      </div>

      {/* ── OPINIE SECTION ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono uppercase mb-3 text-[11px] tracking-[3px] text-primary/95">// OPINIE / Z POLA</div>
          <h2 className="mb-12 max-w-3xl font-heading font-light text-[clamp(26px,4vw,42px)] leading-[1.15] tracking-[-0.5px] text-foreground">
            Co mówią osoby, które przestały żonglować narzędziami.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              { id: 'T-001', quote: 'W końcu jedno miejsce zamiast pięciu subskrypcji. Chat AI z modelami premium, notatki i kalendarz w jednym.', author: 'Michał K.', role: 'Freelancer · marketing' },
              { id: 'T-002', quote: 'Panel firmowy z uprawnieniami i zadaniami zastąpił nam Notion i Trello. Zespół 12 osób, jedna platforma.', author: 'Anna S.', role: 'COO · agencja' },
              { id: 'T-003', quote: 'Agenty AI odpalone raz działają w tle. Cotygodniowe raporty same się generują z naszych źródeł.', author: 'Krzysztof P.', role: 'Product Owner' },
            ].map((testim) => (
              <Tile key={testim.id} intencja="neutralna" elewacja="uniesiona" className="px-5 py-6 sm:px-8 sm:py-10 md:px-12 md:py-11 border-primary/20 flex flex-col h-full">
                <div className="font-mono uppercase mb-4 text-[10px] tracking-[2.5px] text-primary/65">// {testim.id}</div>
                <p className="mb-6 font-heading font-light text-[16px] leading-[1.55] tracking-[-0.2px] text-foreground flex-1">
                  <span className="text-primary mr-1.5 font-normal">“</span>{testim.quote}<span className="text-primary ml-1 font-normal">”</span>
                </p>
                <div className="h-px bg-primary/15 mb-3" />
                <div className="font-mono uppercase text-[11px] tracking-[2px] text-foreground">{testim.author}</div>
                <div className="font-mono uppercase mt-1 text-[10px] tracking-[2px] text-foreground/50">{testim.role}</div>
              </Tile>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-normal text-[clamp(38px,6.2vw,72px)] leading-[1.04] tracking-[-1.6px] text-primary drop-shadow-[0_0_28px_rgba(105,179,240,0.28)] mb-2">
            Przestań gonić AI.
          </h2>
          <h2 className="font-heading font-light text-[clamp(38px,6.2vw,72px)] leading-[1.04] tracking-[-1.6px] text-foreground mb-7">
            Zacznij go używać.
          </h2>
          <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-foreground/75 mb-10">
            Dołącz do NextByte i dostawaj konkret zamiast szumu. Bez spamu, bez korpo-gadki — możesz wyjść jednym kliknięciem.
          </p>
          <button className="font-mono text-[11px] tracking-[2px] px-6 py-3 border border-primary/70 bg-transparent text-primary uppercase transition-all hover:bg-primary/10 hover:shadow-[0_0_18px_rgba(105,179,240,0.18)]">
            [ DOŁĄCZAM DO NEXTBYTE ]
          </button>
        </div>
      </section>

    </div>
  )
}
