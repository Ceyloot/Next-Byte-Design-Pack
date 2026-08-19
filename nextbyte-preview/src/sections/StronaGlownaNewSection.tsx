import React from 'react'
import { Tile, TilePill } from '@/components/Tile'
import { ArrowRight, Sparkles, LayoutGrid, Zap, MonitorPlay, MessageSquare, Database, Infinity, Layers, Cpu, Code2, Lock } from 'lucide-react'

export function StronaGlownaNewSection() {
  return (
    <div className="w-full text-foreground relative font-sans overflow-x-clip pb-16 flex flex-col gap-24">

      {/* Background Gradients/Patterns */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 pt-12 pb-12 min-h-[85vh]">
        {/* Background Gradients/Patterns local to hero */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-40 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.2)_0%,transparent_60%)]" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 rounded-full bg-primary/10 backdrop-blur-md shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-primary font-bold">Nowy wymiar sztucznej inteligencji</span>
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-foreground">
            Przyszłość to nie aplikacje. <br />
            <span className="text-primary drop-shadow-[0_0_40px_rgba(105,179,240,0.5)]">
              Przyszłość to jeden system.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/60 max-w-3xl mx-auto font-medium leading-relaxed">
            Przestań żonglować wieloma subskrypcjami. NextByte łączy topowe modele AI, inteligentne notatki, studio zdjęć i automatyzacje w jednym potężnym środowisku pracy. Pełna kontrola, najwyższa jakość, jedna opłata.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
            <button className="relative flex items-center justify-center gap-3 rounded-2xl h-14 px-8 bg-primary text-background font-bold uppercase tracking-widest text-[12px] shadow-[0_0_40px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.7)] transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
              <span className="relative z-10 flex items-center gap-2">
                Przejdź na platformę <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Abstract UI Mockup */}
        <div className="mt-24 w-full max-w-5xl relative z-10 px-4">
           <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full opacity-60" />
           <Tile intencja="akcent" elewacja="uniesiona" className="relative aspect-[16/9] md:aspect-[21/9] border-primary/30 bg-card/60 backdrop-blur-3xl flex items-center justify-center overflow-hidden shadow-2xl rounded-3xl">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
              <div className="flex flex-col items-center gap-4 opacity-50 relative z-10">
                <Database className="w-16 h-16 text-primary drop-shadow-[0_0_15px_hsl(var(--primary))]" />
                <span className="font-mono text-xs tracking-widest uppercase text-primary font-bold drop-shadow-[0_0_10px_hsl(var(--primary))]">Interfejs Systemu v4.0</span>
              </div>
              
              {/* Decorative light streaks */}
              <div className="absolute -left-1/4 top-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent -rotate-45 blur-[1px]" />
              <div className="absolute -right-1/4 bottom-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent rotate-12 blur-[1px]" />
           </Tile>
        </div>
      </section>

      {/* ── FEATURE BENTO GRID ── */}
      <section className="relative z-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
             <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Jeden ekosystem. <span className="text-primary">Zero kompromisów.</span></h2>
             <p className="text-foreground/50 text-base md:text-lg max-w-2xl mx-auto">Zastąp dziesiątki rozproszonych narzędzi jednym spójnym środowiskiem, które rozumie Twój styl pracy i rośnie razem z Twoim zespołem.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Feature 1 */}
            <Tile intencja="neutralna" elewacja="uniesiona" className="md:col-span-2 p-10 border-foreground/10 overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-700">
                  <Cpu className="w-64 h-64 text-primary" />
               </div>
               <div className="relative z-10 h-full flex flex-col justify-end">
                 <TilePill intencja="akcent" className="w-fit mb-5 border-primary/20 bg-primary/10 text-primary px-3 py-1 text-xs">Wielomodelowość</TilePill>
                 <h3 className="text-3xl font-heading text-foreground mb-3 font-bold">Wszystkie topowe modele AI</h3>
                 <p className="text-foreground/60 max-w-lg text-sm md:text-base leading-relaxed">Przełączaj się płynnie między GPT-4, Claude 3.5, Gemini i Mistral w trakcie jednej konwersacji. Dobieraj najlepszy model do konkretnego zadania bez zakładania pięciu kont.</p>
               </div>
            </Tile>
            
            {/* Feature 2 */}
            <Tile intencja="akcent" elewacja="plaska" className="p-10 border-primary/30 flex flex-col justify-end group overflow-hidden relative bg-primary/[0.03]">
               <div className="absolute -right-8 -top-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500 group-hover:-rotate-12">
                 <Lock className="w-48 h-48 text-primary" />
               </div>
               <div className="relative z-10">
                 <h3 className="text-3xl font-heading text-primary mb-3 font-bold drop-shadow-[0_0_15px_rgba(105,179,240,0.3)]">Lokalne AI</h3>
                 <p className="text-foreground/70 text-sm leading-relaxed">Zintegruj Ollama i ciesz się w 100% prywatnymi rozmowami bez zużywania zasobów. Twoje dane nie opuszczają Twojego komputera.</p>
               </div>
            </Tile>

            {/* Feature 3 */}
            <Tile intencja="neutralna" elewacja="uniesiona" className="p-10 border-foreground/10 flex flex-col justify-end group overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent z-0" />
               <div className="absolute top-8 left-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <MonitorPlay className="w-24 h-24 text-foreground" />
               </div>
               <div className="relative z-10">
                 <h3 className="text-2xl font-heading text-foreground mb-3 font-bold">Studio Zdjęć v2</h3>
                 <p className="text-foreground/60 text-sm leading-relaxed">Generuj i edytuj fotorealistyczne grafiki za pomocą najnowszych algorytmów dyfuzyjnych. Szybko, łatwo i na miejscu.</p>
               </div>
            </Tile>

            {/* Feature 4 */}
            <Tile intencja="neutralna" elewacja="uniesiona" className="md:col-span-2 p-10 border-foreground/10 flex flex-col justify-end group overflow-hidden relative bg-gradient-to-br from-card to-foreground/[0.02]">
               <div className="absolute right-0 bottom-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
                  <Infinity className="w-72 h-72 text-foreground" />
               </div>
               <div className="relative z-10">
                 <TilePill intencja="neutralna" className="w-fit mb-5 px-3 py-1 text-xs">Ekonomia Byte'ów</TilePill>
                 <h3 className="text-3xl font-heading text-foreground mb-3 font-bold">Płacisz tylko za to, czego używasz</h3>
                 <p className="text-foreground/60 max-w-lg text-sm md:text-base leading-relaxed">Koniec z przepłacaniem za niewykorzystane subskrypcje. Nasz system rozlicza Cię precyzyjnie dzięki wewnętrznej walucie Byte, dając Ci pełną przejrzystość kosztów i historii zużycia.</p>
               </div>
            </Tile>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 px-4 sm:px-6 py-20 mt-16">
        <Tile intencja="akcent" elewacja="uniesiona" className="max-w-5xl mx-auto p-12 md:p-24 text-center relative overflow-hidden border-primary/40 bg-primary/[0.08] shadow-[0_0_50px_hsl(var(--primary)/0.15)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.25)_0%,transparent_100%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          
          <div className="relative z-10 space-y-8 flex flex-col items-center">
            <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-foreground tracking-tight max-w-3xl leading-tight">Gotowy na skok w przyszłość?</h2>
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto font-medium">Dołącz do tysięcy profesjonalistów, którzy już zoptymalizowali swój workflow z NextByte.</p>
            <div className="pt-4">
              <button className="relative flex items-center justify-center gap-3 rounded-2xl h-16 px-12 bg-primary text-background font-bold uppercase tracking-widest text-[13px] shadow-[0_0_50px_hsl(var(--primary)/0.7)] hover:scale-[1.03] transition-transform duration-300">
                Przejdź na platformę <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Tile>
      </section>

    </div>
  )
}
