import React, { useState, useEffect } from 'react'
import { toast } from '@/components/ui/toaster'
import { NbTabs } from '@/components/ui/NbTabs'
import { Layers, Sparkles, LayoutGrid, Navigation, PanelTop, PanelBottom, PanelLeft, PanelRight, Palette, BarChart2, Loader, MonitorPlay, ChevronRight, Tag } from 'lucide-react'

export type NavPosition = 'top' | 'bottom' | 'left' | 'right'
import { GlassProvider, useGlass } from '@/lib/glass-context'
import { NbGlassFilters } from '@/components/glass/NbGlassFilters'
import { AppBackground, BgToggle, BG_OPTIONS, type BgKey } from '@/components/AppBackground'
import { PreviewSection }   from '@/sections/PreviewSection'
import { cn } from '@/lib/utils'

// ── Motywy ─────────────────────────────────────────────────────────
// mode: 'dark' | 'light' | 'warm' — przekazywane do iframe previews
const THEMES = [
  { key: null,            label: 'Default',       price: 'darmowy',  isDefault: true,  isLight: false, mode: 'dark'  as const },
  { key: 'przyjazny',     label: 'Przyjazny',     price: 'darmowy',  isDefault: false, isLight: false, mode: 'dark'  as const },
  { key: 'dark-theme',    label: 'Ciemny',        price: 'darmowy',  isDefault: false, isLight: false, mode: 'dark'  as const },
  { key: 'light-apple',   label: 'Jasny Apple',   price: 'darmowy',  isDefault: false, isLight: true,  mode: 'light' as const },
  { key: 'nextbyte-light',label: 'NB Jasny',      price: 'darmowy',  isDefault: false, isLight: true,  mode: 'light' as const },
  { key: 'future-theme',  label: 'Przyszły',      price: 'darmowy',  isDefault: false, isLight: true,  mode: 'light' as const },
  { key: 'scandinavian',  label: 'Scandi',        price: 'darmowy',  isDefault: false, isLight: true,  mode: 'warm'  as const },
  { key: 'lime-green',    label: 'Lime',          price: 'darmowy',  isDefault: false, isLight: false, mode: 'dark'  as const },
  { key: 'refspace',      label: 'RefSpace',      price: 'darmowy',  isDefault: false, isLight: false, mode: 'dark'  as const },
  { key: 'sloneczny',     label: 'Słoneczny',     price: 'darmowy',  isDefault: false, isLight: false, mode: 'dark'  as const },
  { key: 'teczowy',       label: 'Tęczowy',       price: 'darmowy',  isDefault: false, isLight: false, mode: 'dark'  as const },
  { key: 'aurora',        label: 'Aurora',        price: '150 Byte', isDefault: false, isLight: false, mode: 'dark'  as const },
  { key: 'fioletowy',     label: 'Fioletowy',     price: '150 Byte', isDefault: false, isLight: false, mode: 'dark'  as const },
  { key: 'nextbyte-v2',   label: 'NB Lekki',      price: '150 Byte', isDefault: false, isLight: false, mode: 'dark'  as const },
  { key: 'dragon-red',    label: 'Smoczy',        price: '150 Byte', isDefault: false, isLight: false, mode: 'dark'  as const },
  { key: 'snowy-white',   label: 'Śnieżny',       price: '150 Byte', isDefault: false, isLight: false, mode: 'dark'  as const },
  { key: 'luxury',        label: 'Luxury',        price: '500 Byte', isDefault: false, isLight: false, mode: 'dark'  as const },
] as const

type ThemeKey = (typeof THEMES)[number]['key']

// ── Zakładki główne ────────────────────────────────────────────────
const TABS = [
  { key: 'preview',    label: 'Preview',    icon: <MonitorPlay className="h-3.5 w-3.5" /> },
  { key: 'karty',      label: 'Karty',      icon: <LayoutGrid  className="h-3.5 w-3.5" /> },
  { key: 'akcje',      label: 'Akcje',      icon: <Sparkles    className="h-3.5 w-3.5" /> },
  { key: 'formularze', label: 'Formularze', icon: <Layers      className="h-3.5 w-3.5" /> },
  { key: 'nawigacja',  label: 'Nawigacja',  icon: <Navigation  className="h-3.5 w-3.5" /> },
  { key: 'nakładki',   label: 'Nakładki',   icon: <PanelTop    className="h-3.5 w-3.5" /> },
  { key: 'dane',       label: 'Dane',       icon: <BarChart2   className="h-3.5 w-3.5" /> },
  { key: 'stany',      label: 'Stany',      icon: <Loader      className="h-3.5 w-3.5" /> },
  { key: 'paleta',     label: 'Paleta',     icon: <Palette     className="h-3.5 w-3.5" /> },
  { key: 'cennik',     label: 'Cennik',     icon: <Tag         className="h-3.5 w-3.5" /> },
] as const

type TabKey = (typeof TABS)[number]['key']


// ── Przełącznik Normal / Glass ─────────────────────────────────────
function GlassToggle() {
  const { isGlass, toggle } = useGlass()
  return (
    <button
      onClick={toggle}
      className={cn(
        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200',
        isGlass
          ? 'border-cyan-400/60 bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900/80'
          : 'border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-foreground',
      )}
    >
      <span className={cn('h-2 w-2 rounded-full transition-colors', isGlass ? 'bg-cyan-400' : 'bg-foreground/30')} />
      {isGlass ? 'Liquid Glass' : 'Normal'}
    </button>
  )
}

// ── Przełącznik zasięgu refrakcji ─────────────────────────────────
function RefrakcjaToggle({ wszedzie, onToggle }: { wszedzie: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title="Zasięg soczewki na krawędziach"
      className={cn(
        'shrink-0 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all duration-200',
        wszedzie
          ? 'border-amber-400/60 bg-amber-950/70 text-amber-300'
          : 'border-border bg-card text-foreground/60 hover:text-foreground',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', wszedzie ? 'bg-amber-400' : 'bg-foreground/30')} />
      {wszedzie ? 'Soczewka: wszędzie' : 'Soczewka: chrome'}
    </button>
  )
}

// ── Główna treść (wewnątrz GlassProvider) ─────────────────────────
function AppInner() {
  const { isGlass, toggle: toggleGlass, showContent, toggleContent } = useGlass()
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(null)
  const [activeTab,   setActiveTab]   = useState<TabKey>('preview')
  const [bgKey,       setBgKey]       = useState<BgKey>('nextbyte')
  const [lensWszedzie, setLensWszedzie] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [navPosition, setNavPosition] = useState<NavPosition>('top')

  /* Klasa na <html> steruje trybem Liquid Glass oraz zasięgiem soczewki */
  useEffect(() => {
    document.documentElement.classList.toggle('is-glass', isGlass)
    document.documentElement.classList.toggle('nb-glass-active', isGlass)
    document.documentElement.classList.toggle('nb-refrakcja-chrome', !lensWszedzie)
  }, [isGlass, lensWszedzie])

  const cycleBg = () => {
    const idx = BG_OPTIONS.findIndex(b => b.key === bgKey)
    setBgKey(BG_OPTIONS[(idx + 1) % BG_OPTIONS.length].key)
  }

  useEffect(() => {
    if (activeTheme === null) document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', activeTheme)
  }, [activeTheme])

  return (
    <>
      {/* Filtry refrakcji — montowane WYŁĄCZNIE w trybie glass. */}
      {isGlass && <NbGlassFilters />}

      {/* Tło — fixed */}
      <AppBackground bgKey={bgKey} />

      <div className="relative min-h-screen text-foreground font-sans flex flex-col" style={{ zIndex: 1 }}>

        {/* ══ CONTENT ══ */}
        <main className="flex-1 overflow-y-auto">
          <PreviewSection
            activeTab={activeTab}
            onSelectTab={(k) => setActiveTab(k as TabKey)}
            onToggleSettings={() => setShowSettings(v => !v)}
            navPosition={navPosition}
            onNavPositionChange={setNavPosition}
          />
        </main>

        {/* ══ SETTINGS PANEL ══ */}
        {showSettings && (
          <div className="fixed bottom-6 right-6 z-50 w-80 bg-card/90 border border-border/80 rounded-2xl shadow-2xl backdrop-blur-2xl p-4 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-primary" /> Ustawienia Wyglądu
              </span>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-[10px] font-semibold text-foreground/40 hover:text-foreground bg-foreground/5 px-2 py-0.5 rounded"
              >
                Zamknij
              </button>
            </div>

            <div className="space-y-4">
              {/* Liquid Glass Toggle */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground/80">Styl Liquid Glass</span>
                <button
                  onClick={toggleGlass}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all duration-200',
                    isGlass
                      ? 'border-cyan-400/60 bg-cyan-950/80 text-cyan-300'
                      : 'border-border bg-card text-foreground/70'
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full transition-colors', isGlass ? 'bg-cyan-400' : 'bg-foreground/30')} />
                  {isGlass ? 'Aktywne' : 'Wyłączone'}
                </button>
              </div>

              {/* Refraction Range Toggle (if Glass enabled) */}
              {isGlass && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground/80">Zakres refrakcji</span>
                  <button
                    onClick={() => setLensWszedzie(v => !v)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all duration-200',
                      lensWszedzie
                        ? 'border-amber-400/60 bg-amber-950/70 text-amber-300'
                        : 'border-border bg-card text-foreground/60'
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', lensWszedzie ? 'bg-amber-400' : 'bg-foreground/30')} />
                    {lensWszedzie ? 'Wszędzie' : 'Tylko Chrome'}
                  </button>
                </div>
              )}

              {/* Tryb Treści (Z napisami / Czysty Szablon) */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground/80">Podgląd treści</span>
                <button
                  onClick={toggleContent}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all duration-200',
                    showContent
                      ? 'border-emerald-400/60 bg-emerald-950/80 text-emerald-300'
                      : 'border-border bg-card text-foreground/70'
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full transition-colors', showContent ? 'bg-emerald-400' : 'bg-foreground/30')} />
                  {showContent ? 'Z napisami (Work)' : 'Czysty szablon'}
                </button>
              </div>

              {/* Navbar position */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">Pozycja nawigacji</span>
                <div className="grid grid-cols-4 gap-1">
                  {([
                    { pos: 'top',    label: 'Góra',  Icon: PanelTop    },
                    { pos: 'bottom', label: 'Dół',   Icon: PanelBottom },
                    { pos: 'left',   label: 'Lewy',  Icon: PanelLeft   },
                    { pos: 'right',  label: 'Prawy', Icon: PanelRight  },
                  ] as const).map(({ pos, label, Icon }) => (
                    <button
                      key={pos}
                      onClick={() => setNavPosition(pos)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-semibold transition-all',
                        navPosition === pos
                          ? 'border-primary/60 bg-primary/10 text-primary'
                          : 'border-border/60 bg-card/65 text-foreground/60 hover:border-primary/30 hover:text-foreground',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background patterns cycler */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground/80">Wzór tła</span>
                <button
                  onClick={cycleBg}
                  className="px-2.5 py-1 rounded-full border border-border bg-card text-[10px] font-semibold hover:border-primary/40 transition-colors uppercase"
                >
                  {bgKey}
                </button>
              </div>

              {/* Theme Picker Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Wybierz motyw kolorystyczne</label>
                <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto scrollbar-none pr-1">
                  {THEMES.map((t) => {
                    const isActive = activeTheme === t.key
                    return (
                      <button
                        key={String(t.key)}
                        onClick={() => setActiveTheme(t.key)}
                        className={cn(
                          'w-full rounded-xl border p-2 text-[10px] font-semibold transition-all text-left truncate flex items-center justify-between',
                          isActive
                            ? 'border-primary/60 bg-primary/10 text-primary'
                            : 'border-border/60 bg-card/65 text-foreground/60 hover:border-primary/30 hover:text-foreground'
                        )}
                      >
                        <span>{t.label}</span>
                        {t.isLight && <span className="opacity-65 text-[8px]">☀</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ── ROOT ───────────────────────────────────────────────────────────
import { InspectorProvider } from '@/components/ui/ComponentInspector'

export default function App() {
  return (
    <GlassProvider>
      <InspectorProvider>
        <AppInner />
      </InspectorProvider>
    </GlassProvider>
  )
}
