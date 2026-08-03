import { useState, useEffect, useRef } from 'react';
import { Button, Badge, Input, Avatar, AvatarGroup, Separator, LiquidGlass } from '@/lib/core';
import { PricingCard } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import {
  ArrowRight, CheckCircle2, Code2, Layers,
  Package, Shield, Zap, Palette, Sparkles, Bell,
} from 'lucide-react';

// ── Palettes ──────────────────────────────────────────────────────────────────

const PALETTES = [
  { id: 'blue',   primary: '204 91% 70%', fg: '0 0% 0%',   hex: '#70BEFA' },
  { id: 'purple', primary: '270 75% 65%', fg: '0 0% 100%', hex: '#9B6FE8' },
  { id: 'green',  primary: '142 71% 55%', fg: '0 0% 0%',   hex: '#4ADE80' },
  { id: 'amber',  primary: '38 92% 60%',  fg: '0 0% 0%',   hex: '#FBBF24' },
  { id: 'rose',   primary: '350 89% 65%', fg: '0 0% 0%',   hex: '#F87171' },
  { id: 'cyan',   primary: '186 82% 55%', fg: '0 0% 0%',   hex: '#22D3EE' },
  { id: 'orange', primary: '25 96% 62%',  fg: '0 0% 0%',   hex: '#FB923C' },
] as const;

type PaletteId = typeof PALETTES[number]['id'];
type AccentVariant = 'default' | 'primary' | 'warning' | 'destructive';

const VARIANTS: { id: AccentVariant; label: string }[] = [
  { id: 'default',     label: 'Default'     },
  { id: 'primary',     label: 'Primary'     },
  { id: 'warning',     label: 'Warning'     },
  { id: 'destructive', label: 'Destructive' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function variantBadge(v: AccentVariant): React.ComponentProps<typeof Badge>['variant'] {
  if (v === 'primary') return 'primary';
  if (v === 'warning') return 'warning';
  if (v === 'destructive') return 'destructive';
  return 'outline';
}

function variantIconBg(v: AccentVariant) {
  if (v === 'primary')     return 'bg-primary/10 text-primary';
  if (v === 'warning')     return 'bg-amber-500/10 text-amber-400';
  if (v === 'destructive') return 'bg-red-500/10 text-red-400';
  return 'bg-muted/50 text-muted-foreground';
}

function variantActivePill(v: AccentVariant) {
  if (v === 'primary')     return 'bg-primary/10 border-primary/35 text-primary';
  if (v === 'warning')     return 'bg-amber-500/10 border-amber-500/35 text-amber-400';
  if (v === 'destructive') return 'bg-red-500/10 border-red-500/35 text-red-400';
  return 'bg-muted/30 border-border text-foreground';
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LandingPreview() {
  const [paletteId, setPaletteId] = useState<PaletteId>('blue');
  const [accentVariant, setAccentVariant] = useState<AccentVariant>('primary');
  const [glassStyle, setGlassStyle] = useState<'flat' | 'glass' | 'liquid'>('glass');
  const [landingBg, setLandingBg] = useState<'grid' | 'mars' | 'galaxy' | 'cyberpunk' | 'aurora' | 'ocean' | 'obsidian'>('grid');

  // Customizer dla siatki (Grid)
  const [gridSize, setGridSize] = useState(40);
  const [gridOpacity, setGridOpacity] = useState(0.35);
  const [gridColor, setGridColor] = useState<'cyan' | 'purple' | 'emerald' | 'amber' | 'white'>('cyan');
  const [gridAura, setGridAura] = useState(true);

  const savedRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const vars = ['--primary', '--primary-foreground', '--ring', '--accent', '--accent-foreground', '--brand-primary', '--brand-primary-light', '--brand-primary-dark'];
    vars.forEach(v => { savedRef.current[v] = style.getPropertyValue(v).trim(); });
    return () => {
      Object.entries(savedRef.current).forEach(([k, v]) => {
        if (v) document.documentElement.style.setProperty(k, v);
        else document.documentElement.style.removeProperty(k);
      });
    };
  }, []);

  const applyPalette = (id: PaletteId) => {
    const p = PALETTES.find(x => x.id === id)!;
    document.documentElement.style.setProperty('--primary', p.primary);
    document.documentElement.style.setProperty('--primary-foreground', p.fg);
    document.documentElement.style.setProperty('--ring', p.primary);
    document.documentElement.style.setProperty('--accent', p.primary);
    document.documentElement.style.setProperty('--accent-foreground', p.fg);
    document.documentElement.style.setProperty('--brand-primary', p.primary);
    document.documentElement.style.setProperty('--brand-primary-light', p.primary);
    document.documentElement.style.setProperty('--brand-primary-dark', p.primary);
    setPaletteId(id);
  };

  const isWarning     = accentVariant === 'warning';
  const isDestructive = accentVariant === 'destructive';

  const ctaBtnVariant = (
    isDestructive ? 'destructive' :
    accentVariant === 'primary' ? 'nextbyte' :
    'default'
  ) as React.ComponentProps<typeof Button>['variant'];

  const ctaBtnClass = isWarning
    ? 'bg-amber-500 text-black hover:bg-amber-400 border-amber-500'
    : '';

  const bv = variantBadge(accentVariant);
  const iconBg = variantIconBg(accentVariant);

  const gridLineColorHex =
    gridColor === 'purple' ? '168, 85, 247' :
    gridColor === 'emerald' ? '74, 222, 128' :
    gridColor === 'amber' ? '251, 191, 36' :
    gridColor === 'white' ? '255, 255, 255' :
    '34, 211, 238'; // cyan

  return (
    <div className="min-h-full bg-background text-foreground relative overflow-hidden">

      {/* ── Dynamic Background Stage (Fotorealistyczne zdjęcia & Custom Grid) ── */}
      {landingBg === 'grid' && (
        <div className="fixed inset-0 bg-black pointer-events-none z-0 transition-all">
          <div
            className="absolute inset-0 transition-all"
            style={{
              opacity: gridOpacity,
              backgroundImage: `linear-gradient(to right, rgba(${gridLineColorHex}, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(${gridLineColorHex}, 0.5) 1px, transparent 1px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
          />
          {gridAura && (
            <div
              className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-[150px] pointer-events-none opacity-40 transition-all"
              style={{
                background: gridColor === 'purple' ? '#a855f7' :
                            gridColor === 'emerald' ? '#4ade80' :
                            gridColor === 'amber' ? '#f59e0b' :
                            gridColor === 'white' ? '#ffffff' :
                            '#06b6d4',
              }}
            />
          )}
        </div>
      )}

      {landingBg === 'mars' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=2400&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>
      )}

      {landingBg === 'galaxy' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2400&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </div>
      )}

      {landingBg === 'cyberpunk' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2400&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-brightness-90" />
        </div>
      )}

      {landingBg === 'aurora' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2400&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/75" />
        </div>
      )}

      {landingBg === 'ocean' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2400&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {landingBg === 'obsidian' && (
        <div className="fixed inset-0 bg-[#050507] pointer-events-none z-0" />
      )}

      {/* ── Sticky Style Toolbar ───────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl relative">
        <div className="flex items-center gap-3 px-6 py-2.5 flex-wrap">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
            Style & Studio
          </span>
          <div className="h-3.5 w-px bg-border" />

          {/* Paleta kolorów */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/50 shrink-0">Kolor</span>
            <div className="flex items-center gap-1">
              {PALETTES.map(p => (
                <button
                  key={p.id}
                  title={p.id}
                  onClick={() => applyPalette(p.id)}
                  className={cn(
                    'w-4.5 h-4.5 rounded-full transition-all outline-none',
                    paletteId === p.id
                      ? 'ring-2 ring-foreground ring-offset-1 ring-offset-background scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-110',
                  )}
                  style={{ width: 18, height: 18, background: p.hex }}
                />
              ))}
            </div>
          </div>

          <div className="h-3.5 w-px bg-border" />

          {/* Wybór Tła (Zdjęcia & Grid) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground/50 shrink-0">Tło Sceny</span>
            <div className="flex gap-1 flex-wrap">
              {[
                { id: 'grid',      label: '👾 Custom Grid' },
                { id: 'mars',      label: '🔴 Mars Planet' },
                { id: 'galaxy',    label: '🌌 Galaktyka' },
                { id: 'cyberpunk', label: '🌇 Cyberpunk City' },
                { id: 'aurora',    label: '🏔️ Zorza Polarna' },
                { id: 'ocean',     label: '🌊 Głębia Oceanu' },
                { id: 'obsidian',  label: '🖤 Obsidian' },
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setLandingBg(b.id as any)}
                  className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all',
                    landingBg === b.id
                      ? 'border-primary bg-primary/15 text-primary shadow-sm'
                      : 'border-border/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-3.5 w-px bg-border" />

          {/* Tryb Szkła */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground/50 shrink-0">Styl UI</span>
            <div className="flex gap-1">
              {[
                { id: 'flat',   label: 'Płaski' },
                { id: 'glass',  label: '✨ Glassmorphism' },
                { id: 'liquid', label: '💧 Liquid Glass' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setGlassStyle(s.id as any)}
                  className={cn(
                    'text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all',
                    glassStyle === s.id
                      ? 'border-primary bg-primary/15 text-primary shadow-sm'
                      : 'border-border/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sub-bar: Konfigurator Siatki (Wyświetla się gdy wybrano 'grid') ── */}
        {landingBg === 'grid' && (
          <div className="bg-primary/5 border-t border-primary/20 px-6 py-2 flex items-center gap-6 text-xs flex-wrap">
            <span className="font-bold text-primary text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Dostosowanie Siatki (Grid Studio)
            </span>

            {/* Grid Size */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-[11px]">Gęstość:</span>
              <input
                type="range"
                min={20}
                max={80}
                value={gridSize}
                onChange={e => setGridSize(Number(e.target.value))}
                className="w-20 accent-primary cursor-pointer h-1.5 rounded-lg bg-border"
              />
              <span className="font-mono text-[10px] text-primary w-6">{gridSize}px</span>
            </div>

            {/* Grid Opacity */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-[11px]">Przezroczystość:</span>
              <input
                type="range"
                min={10}
                max={80}
                value={Math.round(gridOpacity * 100)}
                onChange={e => setGridOpacity(Number(e.target.value) / 100)}
                className="w-20 accent-primary cursor-pointer h-1.5 rounded-lg bg-border"
              />
              <span className="font-mono text-[10px] text-primary w-8">{Math.round(gridOpacity * 100)}%</span>
            </div>

            {/* Grid Color */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-[11px]">Kolor linii:</span>
              {[
                { id: 'cyan',    bg: '#22d3ee' },
                { id: 'purple',  bg: '#a855f7' },
                { id: 'emerald', bg: '#4ade80' },
                { id: 'amber',   bg: '#f59e0b' },
                { id: 'white',   bg: '#ffffff' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setGridColor(c.id as any)}
                  className={cn(
                    'w-3.5 h-3.5 rounded-full transition-all border border-white/20',
                    gridColor === c.id ? 'ring-2 ring-white scale-125' : 'opacity-60 hover:opacity-100',
                  )}
                  style={{ backgroundColor: c.bg }}
                />
              ))}
            </div>

            {/* Grid Aura toggle */}
            <button
              onClick={() => setGridAura(a => !a)}
              className={cn(
                'ml-auto text-[10px] font-bold px-2 py-0.5 rounded border transition-all',
                gridAura ? 'border-primary/40 bg-primary/20 text-primary' : 'border-border text-muted-foreground'
              )}
            >
              Poświata {gridAura ? 'ON' : 'OFF'}
            </button>
          </div>
        )}
      </div>

      <div className="relative z-10">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-6 py-16 sm:py-24 flex flex-col items-center text-center">
          <Badge
            variant={bv}
            size="sm"
            dot
            className={cn('mb-6 relative z-10 font-bold px-3.5 py-1 text-xs shadow-lg backdrop-blur-md rounded-xl', isWarning && 'border-amber-500/30 bg-amber-500/10 text-amber-400')}
          >
            {isWarning ? '⚠ Warning variant aktywny' : isDestructive ? '✕ Destructive variant' : '✨ NextByte UI v3.0 — Liquid Glass Architecture'}
          </Badge>

          <h1 className="relative z-10 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
            Buduj zjawiskowe interfejsy,{' '}
            <span className={cn(
              'text-primary',
              isWarning && 'text-amber-400',
              isDestructive && 'text-red-400',
            )}>
              znacznie szybciej
            </span>.
          </h1>

          <p className="relative z-10 text-base sm:text-lg text-white/70 max-w-2xl mb-10 leading-relaxed font-normal">
            Zaawansowany design system React nowej generacji. Kryształowy glassmorphism, optyczne filtry soczewkowe i pełna produktywność bez kompromisów.
          </p>

          {/* Hero CTAs - Nowoczesne prostokątne zaokrąglenia rounded-xl */}
          <div className="relative z-10 flex flex-wrap gap-4 justify-center mb-12 items-center">
            {glassStyle === 'liquid' ? (
              <>
                <LiquidGlass inline button depth={10} chromaticAberration={2} className="rounded-xl shadow-2xl">
                  <Button variant={ctaBtnVariant} size="lg" className={cn(ctaBtnClass, 'rounded-xl px-7 font-bold text-base py-5 border-0')}>
                    Zacznij teraz <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </LiquidGlass>
                <LiquidGlass inline button depth={8} chromaticAberration={1.5} className="rounded-xl shadow-2xl">
                  <Button variant="outline" size="lg" className="rounded-xl px-7 font-semibold text-base py-5 border-0 text-white hover:bg-white/10">
                    Dokumentacja
                  </Button>
                </LiquidGlass>
              </>
            ) : (
              <>
                <Button variant={ctaBtnVariant} size="lg" className={cn(ctaBtnClass, 'rounded-xl px-7 font-bold shadow-xl text-base py-5')}>
                  Zacznij teraz <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className={cn('rounded-xl px-7 font-semibold text-base py-5', glassStyle === 'glass' && 'nb-glass border-white/25')}>
                  Dokumentacja
                </Button>
              </>
            )}
          </div>

          {/* Feature Pills - Nowoczesny kształt rounded-xl */}
          <div className="relative z-10 flex flex-wrap gap-2.5 justify-center mb-14">
            {['50+ komponentów', 'TypeScript-first', 'Liquid Lens SVG', '15 motywów', 'WCAG dostępność'].map(f => (
              <span
                key={f}
                className={cn(
                  'flex items-center gap-2 text-xs font-semibold border rounded-xl px-3.5 py-1.5 transition-all shadow-md',
                  glassStyle !== 'flat' ? 'nb-glass border-white/20 text-white' : 'border-border/60 bg-card/40 text-muted-foreground',
                )}
              >
                <CheckCircle2 className={cn('h-3.5 w-3.5',
                  isWarning ? 'text-amber-400' : isDestructive ? 'text-red-400' : 'text-primary'
                )} />
                {f}
              </span>
            ))}
          </div>

          {/* Floating Glass Dashboard Showcase Card */}
          <div className="w-full max-w-4xl relative z-10">
            {glassStyle === 'liquid' ? (
              <LiquidGlass className="rounded-3xl p-6 sm:p-8 shadow-2xl text-left" depth={14} chromaticAberration={2}>
                <div className="flex flex-col gap-6 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-sm tracking-tight">NextByte Control Center</span>
                    </div>
                    <span className="text-xs font-mono bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-full font-bold">Live System</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs text-white/50 font-medium">Aktywni Agenci AI</p>
                      <p className="text-2xl font-black mt-1">24 / 24</p>
                      <p className="text-[11px] text-emerald-400 mt-1">100% sprawności</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs text-white/50 font-medium">Prędkość Generowania</p>
                      <p className="text-2xl font-black mt-1 text-primary">184 tok/s</p>
                      <p className="text-[11px] text-primary/80 mt-1">Szybkość ekstremalna</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs text-white/50 font-medium">Zużycie pamięci GPU</p>
                      <p className="text-2xl font-black mt-1 text-purple-300">4.2 GB</p>
                      <p className="text-[11px] text-purple-300/80 mt-1">Optymalne vRAM</p>
                    </div>
                  </div>
                </div>
              </LiquidGlass>
            ) : (
              <div className={cn('rounded-3xl p-6 sm:p-8 text-left border shadow-2xl transition-all', glassStyle === 'glass' ? 'nb-glass border-white/20' : 'bg-card border-border')}>
                <div className="flex flex-col gap-6 text-foreground">
                  <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-sm tracking-tight">NextByte Control Center</span>
                    </div>
                    <span className="text-xs font-mono bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-full font-bold">Live System</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                      <p className="text-xs text-muted-foreground font-medium">Aktywni Agenci AI</p>
                      <p className="text-2xl font-black mt-1">24 / 24</p>
                      <p className="text-[11px] text-emerald-400 mt-1">100% sprawności</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                      <p className="text-xs text-muted-foreground font-medium">Prędkość Generowania</p>
                      <p className="text-2xl font-black mt-1 text-primary">184 tok/s</p>
                      <p className="text-[11px] text-primary/80 mt-1">Szybkość ekstremalna</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                      <p className="text-xs text-muted-foreground font-medium">Zużycie pamięci GPU</p>
                      <p className="text-2xl font-black mt-1 text-purple-400">4.2 GB</p>
                      <p className="text-[11px] text-purple-400/80 mt-1">Optymalne vRAM</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Floating Glass Stats Bar ───────────────────────────────────── */}
        <section className="px-6 py-6 my-2">
          <div className={cn(
            'max-w-3xl mx-auto rounded-3xl p-6 transition-all border shadow-2xl',
            glassStyle !== 'flat' ? 'nb-glass border-white/15' : 'bg-card/40 border-border',
          )}>
            <div className="grid grid-cols-3 divide-x divide-white/10">
              {[
                { value: '50+',  label: 'Komponentów' },
                { value: '15',   label: 'Motywów Systemowych' },
                { value: '100%', label: 'TypeScript & WCAG' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center text-center px-4 py-1">
                  <span className={cn(
                    'text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight',
                    isWarning ? 'text-amber-400' : isDestructive ? 'text-red-400' : 'text-primary',
                  )}>
                    {s.value}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features grid ─────────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant={bv} size="sm" className={cn('mb-3 font-bold', isWarning && 'border-amber-500/30 bg-amber-500/10 text-amber-400')}>
                Możliwości
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Wszystko czego potrzebujesz</h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-md mx-auto">
                Zaprojektowany z myślą o produktywności, estetyce i jakości kodu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Zap className="h-5 w-5" />,     title: 'Błyskawiczny start',  desc: 'Import komponentu, gotowe. Zero trudnej konfiguracji, zero boilerplate.' },
                { icon: <Shield className="h-5 w-5" />,   title: 'Dostępność WCAG',     desc: 'Pełna obsługa klawiatury, ARIA i czytników ekranu.' },
                { icon: <Palette className="h-5 w-5" />,  title: 'Personalizacja HSL',  desc: 'Zmienne CSS, motywy, dark/light mode — pełna kontrola wizualna.' },
                { icon: <Code2 className="h-5 w-5" />,    title: 'TypeScript-first',    desc: 'Kompletne typy, autouzupełnianie propsów, czysty kod.' },
                { icon: <Layers className="h-5 w-5" />,   title: 'Prymitywy Radix UI',  desc: 'Solidna baza dostępności i logiki pod spodem.' },
                { icon: <Package className="h-5 w-5" />,  title: 'Tree-shaking',        desc: 'Importuj tylko to co używasz. Minimalny rozmiar pakietu.' },
              ].map(f => (
                glassStyle === 'liquid' ? (
                  <LiquidGlass key={f.title} className="rounded-3xl h-full shadow-xl" depth={6} chromaticAberration={0}>
                    <div className="p-6 flex flex-col gap-3.5 h-full text-left">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary/30 to-purple-500/20 border border-white/20 flex items-center justify-center text-primary shadow-md">
                        {f.icon}
                      </div>
                      <h3 className="font-bold text-base text-white">{f.title}</h3>
                      <p className="text-xs text-white/70 leading-relaxed font-normal">{f.desc}</p>
                    </div>
                  </LiquidGlass>
                ) : (
                  <div
                    key={f.title}
                    className={cn(
                      'rounded-3xl border p-6 flex flex-col gap-3.5 text-left transition-all',
                      glassStyle === 'glass' && 'nb-glass border-white/15 hover:-translate-y-1 hover:border-primary/40 shadow-lg',
                      glassStyle === 'flat' && (
                        isDestructive
                          ? 'border-red-500/20 bg-red-500/5 hover:border-red-500/40'
                          : isWarning
                            ? 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40'
                            : 'border-border/60 bg-card/40 hover:border-primary/30 hover:bg-card/70'
                      )
                    )}
                  >
                    <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center border shadow-md', iconBg)}>
                      {f.icon}
                    </div>
                    <h3 className="font-bold text-base text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-normal">{f.desc}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        </section>

        {/* ── Team / Social proof (Pływająca Szklana Karta) ───────────────── */}
        <section className="px-6 py-4 my-4">
          {glassStyle === 'liquid' ? (
            <LiquidGlass className="max-w-5xl mx-auto rounded-3xl shadow-2xl" depth={6} chromaticAberration={0}>
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
                <div className="text-left">
                  <p className="text-base font-bold mb-1">Zaufany przez tysiące deweloperów</p>
                  <p className="text-xs text-white/70">Dołącz do rosnącej społeczności deweloperów budujących z NextByte UI.</p>
                </div>
                <div className="flex items-center gap-4">
                  <AvatarGroup size="sm" max={4} avatars={[
                    { fallback: 'Anna Kowalska' },
                    { fallback: 'Piotr Nowak' },
                    { fallback: 'Maria Wiśniewska' },
                    { fallback: 'Kasia Wójcik' },
                    { fallback: 'Tomek Zieliński' },
                  ]} />
                  <span className="text-xs font-mono text-primary font-bold bg-primary/20 border border-primary/30 px-3 py-1 rounded-full">+49 996</span>
                </div>
              </div>
            </LiquidGlass>
          ) : (
            <div className={cn(
              'max-w-5xl mx-auto rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all border shadow-2xl',
              glassStyle === 'glass' ? 'nb-glass border-white/15' : 'bg-card/40 border-border',
            )}>
              <div className="text-left">
                <p className="text-base font-bold text-foreground mb-1">Zaufany przez tysiące deweloperów</p>
                <p className="text-xs text-muted-foreground">Dołącz do rosnącej społeczności deweloperów budujących z NextByte UI.</p>
              </div>
              <div className="flex items-center gap-4">
                <AvatarGroup size="sm" max={4} avatars={[
                  { fallback: 'Anna Kowalska' },
                  { fallback: 'Piotr Nowak' },
                  { fallback: 'Maria Wiśniewska' },
                  { fallback: 'Kasia Wójcik' },
                  { fallback: 'Tomek Zieliński' },
                ]} />
                <span className="text-xs font-mono text-primary font-bold bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">+49 996</span>
              </div>
            </div>
          )}
        </section>

        {/* ── Pricing ───────────────────────────────────────────────────── */}
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant={bv} size="sm" className={cn('mb-3 font-bold rounded-xl', isWarning && 'border-amber-500/30 bg-amber-500/10 text-amber-400')}>
                Cennik
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Prosty, uczciwy cennik</h2>
              <p className="text-muted-foreground text-sm mt-2">Bez ukrytych opłat. Anuluj w dowolnej chwili.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { title: 'BEZPŁATNY', subtitle: 'Dla małych projektów', price: '0', period: 'mies', features: ['10 komponentów', 'Motyw domyślny', 'Dokumentacja publiczna'], actionLabel: 'Zacznij za darmo', highlight: false },
                { title: 'PRO', subtitle: 'Dla profesjonalistów', badge: 'Popularny', price: '99', originalPrice: 119, period: 'mies', features: ['Wszystkie komponenty', '15 motywów', 'Wsparcie priorytetowe', 'Figma kit'], actionLabel: 'Wybierz Pro', highlight: true },
                { title: 'ENTERPRISE', subtitle: 'Dla firm i zespołów', price: '349', period: 'mies', features: ['Licencja firmowa', 'Dedykowane wsparcie', 'Custom komponenty', 'SLA 99.9%'], actionLabel: 'Skontaktuj się', highlight: false },
              ].map(p => (
                glassStyle === 'liquid' ? (
                  <LiquidGlass key={p.title} className={cn('rounded-3xl shadow-xl', p.highlight && 'scale-[1.03]')} depth={7} chromaticAberration={0}>
                    <div className="p-6">
                      <PricingCard
                        title={p.title}
                        subtitle={p.subtitle}
                        badge={p.badge}
                        price={{ amount: p.price, currency: 'zł', period: p.period }}
                        originalPrice={p.originalPrice}
                        features={p.features}
                        action={{ label: p.actionLabel, onClick: () => {} }}
                        highlight={p.highlight}
                        className="bg-transparent border-0 shadow-none p-0 text-white"
                      />
                    </div>
                  </LiquidGlass>
                ) : (
                  <PricingCard
                    key={p.title}
                    title={p.title}
                    subtitle={p.subtitle}
                    badge={p.badge}
                    price={{ amount: p.price, currency: 'zł', period: p.period }}
                    originalPrice={p.originalPrice}
                    features={p.features}
                    action={{ label: p.actionLabel, onClick: () => {} }}
                    highlight={p.highlight}
                    className={cn('rounded-3xl border transition-all shadow-xl', p.highlight && 'scale-[1.03]', glassStyle === 'glass' ? 'nb-glass border-white/15' : 'bg-card/40 border-border')}
                  />
                )
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner (Pływająca Karta Glass) ────────────────────────── */}
        <section className="px-6 py-12">
          {glassStyle === 'liquid' ? (
            <LiquidGlass className="max-w-2xl mx-auto rounded-3xl shadow-2xl" depth={8} chromaticAberration={0}>
              <div className="p-8 sm:p-10 text-center text-white">
                <div className={cn('inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-4 border shadow-md', iconBg)}>
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Gotowy żeby zacząć?</h2>
                <p className="text-white/70 text-sm mb-6">
                  Dołącz do 50 000 deweloperów budujących z NextByte.
                </p>
                <div className="flex gap-2 max-w-sm mx-auto">
                  <Input placeholder="Twój email" className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                  <Button variant={ctaBtnVariant} className={cn('rounded-xl font-bold', ctaBtnClass)}>
                    Dołącz
                  </Button>
                </div>
                <p className="text-[11px] text-white/50 mt-3 font-normal">
                  Bez spamu. Możesz zrezygnować w każdej chwili.
                </p>
              </div>
            </LiquidGlass>
          ) : (
            <div className={cn(
              'max-w-2xl mx-auto rounded-3xl p-8 sm:p-10 text-center transition-all border shadow-2xl',
              glassStyle === 'glass' ? 'nb-glass border-white/15' : 'bg-card/40 border-border',
            )}>
              <div className={cn('inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-4 border shadow-md', iconBg)}>
                <Bell className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Gotowy żeby zacząć?</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Dołącz do 50 000 deweloperów budujących z NextByte.
              </p>
              <div className="flex gap-2 max-w-sm mx-auto">
                <Input placeholder="Twój email" className={cn('flex-1', glassStyle !== 'flat' && 'nb-glass')} />
                <Button variant={ctaBtnVariant} className={cn('rounded-xl font-bold', ctaBtnClass)}>
                  Dołącz
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 font-normal">
                Bez spamu. Możesz zrezygnować w każdej chwili.
              </p>
            </div>
          )}
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="border-t border-border px-6 py-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <span className={cn(
              'font-bold',
              isWarning ? 'text-amber-400' : isDestructive ? 'text-red-400' : 'text-primary',
            )}>NextByte</span>
            {' '}Design Pack — v3.0.0
          </span>
          <span>Made with ♥ by NextByte</span>
        </footer>
      </div>
    </div>
  );
}
