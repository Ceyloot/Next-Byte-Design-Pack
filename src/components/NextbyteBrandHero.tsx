import React from 'react';
import { Sparkles, Shield, Cpu, Zap, Layers, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button, Badge, LiquidGlass } from '@/lib/core';
import { useUIStyle } from '@/lib/core/ui-style-context';

export function NextbyteBrandHero({
  onExploreClick,
}: {
  onExploreClick?: () => void;
}) {
  const { styleMode, setStyleMode } = useUIStyle();

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8 border border-white/10 bg-gradient-to-br from-background via-background/95 to-primary/10 shadow-2xl p-6 sm:p-10">
      {/* Background Animated Gradient Aura */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Column: Brand Statement */}
        <div className="max-w-2xl text-left space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="liquid-glass" className="px-3 py-1 text-xs font-mono tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-400 inline animate-spin" />
              NEXTBYTE AI CORE SYSTEM
            </Badge>
            <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary">
              v2.5 DESIGN PACK
            </Badge>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
            Marka <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-primary to-purple-500">Nextbyte</span> w Nowym Wymiarze
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
            Najwyższej klasy ekosystem interfejsów użytkownika napędzany przez technologię <strong className="text-foreground font-semibold">Liquid Glass</strong> oraz najwyższą estetykę wizualną modeli sztucznej inteligencji.
          </p>

          {/* Style Mode Switcher */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase text-muted-foreground tracking-wider">Tryb Stylu:</span>
            <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border/60 gap-1">
              {(['liquid', 'glass', 'default'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setStyleMode(mode)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    styleMode === mode
                      ? 'bg-primary text-primary-foreground shadow-md font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                  }`}
                >
                  {mode === 'liquid' ? '💧 Liquid Glass' : mode === 'glass' ? '✨ Glassmorphism' : '🛡️ Standard'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Button
              variant="nextbyte"
              size="lg"
              onClick={onExploreClick}
              className="px-6 rounded-xl font-bold shadow-lg shadow-primary/25"
            >
              Poznaj Zestaw Marki NextByte <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Column: Branded Liquid Emblem Preview Card */}
        <div className="w-full lg:w-auto shrink-0">
          <LiquidGlass containerClassName="rounded-3xl p-6 w-full max-w-sm" depth={3} glowColor="#00f2fe">
            <div className="space-y-5 text-center">
              {/* Logo Badge Icon */}
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-primary to-purple-600 p-0.5 shadow-xl shadow-cyan-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-background/80 backdrop-blur-md rounded-[14px] flex items-center justify-center">
                  <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="font-heading text-2xl font-bold text-white tracking-wide">Nextbyte System</h3>
                <p className="text-xs text-white/70 font-mono mt-0.5">PREMIUM BRAND ENGINE</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-white/10">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-white/60 uppercase font-mono block">Precyzja AI</span>
                  <span className="text-sm font-bold text-cyan-300">99.8%</span>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-white/60 uppercase font-mono block">Reakcja Liquid</span>
                  <span className="text-sm font-bold text-purple-300">&lt; 1.2ms</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-white/80 pt-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nextbyte Brand Identity Verified</span>
              </div>
            </div>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
}
