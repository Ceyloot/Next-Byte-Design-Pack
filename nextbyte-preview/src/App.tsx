import React, { useState, useEffect } from 'react'
import { toast } from '@/components/ui/toaster'
import { NbTabs } from '@/components/ui/NbTabs'
import { Layers, Sparkles, LayoutGrid, Navigation, PanelTop, Palette, BarChart2, Loader, MonitorPlay, ChevronRight } from 'lucide-react'
import { GlassProvider, useGlass } from '@/lib/glass-context'
import { NbGlassFilters } from '@/components/glass/NbGlassFilters'
import { AppBackground, BgToggle, BG_OPTIONS, type BgKey } from '@/components/AppBackground'
import { AkcjeSection }    from '@/sections/AkcjeSection'
import { FormularzeSection } from '@/sections/FormularzeSection'
import { KartySection }    from '@/sections/KartySection'
import { NawigacjaSection } from '@/sections/NawigacjaSection'
import { NakladkiSection }  from '@/sections/NakladkiSection'
import { PaletaSection }    from '@/sections/PaletaSection'
import { DaneSection }      from '@/sections/DaneSection'
import { StanySection }     from '@/sections/StanySection'
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
  const { isGlass, toggle: toggleGlass } = useGlass()
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(null)
  const [activeTab,   setActiveTab]   = useState<TabKey>('preview')
  const [bgKey,       setBgKey]       = useState<BgKey>('nextbyte')
  const [lensWszedzie, setLensWszedzie] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  /* Klasa na <html> steruje zasięgiem soczewki */
  useEffect(() => {
    document.documentElement.classList.toggle('nb-refrakcja-chrome', !lensWszedzie)
  }, [lensWszedzie])

  const cycleBg = () => {
    const idx = BG_OPTIONS.findIndex(b => b.key === bgKey)
    setBgKey(BG_OPTIONS[(idx + 1) % BG_OPTIONS.length].key)
  }

  useEffect(() => {
    if (activeTheme === null) document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', activeTheme)
  }, [activeTheme])

  const sectionMap: Record<TabKey, React.ReactNode> = {
    preview:    <PreviewSection onSelectTab={(k) => setActiveTab(k as TabKey)} />,
    karty:      <KartySection />,
    akcje:      <AkcjeSection />,
    formularze: <FormularzeSection />,
    nawigacja:  <NawigacjaSection />,
    nakładki:   <NakladkiSection />,
    dane:       <DaneSection />,
    stany:      <StanySection />,
    paleta:     <PaletaSection />,
  }

  const activeTabDetails = TABS.find(t => t.key === activeTab)

  return (
    <>
      {/* Filtry refrakcji — montowane WYŁĄCZNIE w trybie glass. */}
      {isGlass && <NbGlassFilters />}

      {/* Tło — fixed */}
      <AppBackground bgKey={bgKey} />

      <div className="relative min-h-screen text-foreground font-sans flex" style={{ zIndex: 1 }}>
        
        {/* ══ SIDEBAR (SaaS Style) ══ */}
        {activeTab !== 'preview' && (
          <aside className="w-64 shrink-0 border-r border-border/40 bg-card/40 backdrop-blur-xl flex flex-col justify-between hidden md:flex">
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Logo area */}
              <div className="p-4 border-b border-border/30 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-foreground tracking-tight">
                  <Sparkles className="h-4 w-4 text-primary" />
                  NextByte Design
                </span>
                <span className="text-[10px] font-mono opacity-50 bg-foreground/5 border border-foreground/10 px-1.5 py-0.5 rounded">v1.2</span>
              </div>

              {/* Project / Workspace Picker */}
              <div className="p-3">
                <div className="flex items-center justify-between p-2 rounded-nb-sm bg-foreground/[0.02] border border-border/30 hover:bg-foreground/[0.04] transition-all cursor-pointer">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                      <Layers className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-xs font-semibold truncate">Design System Pack</span>
                  </div>
                  <ChevronRight className="h-3 w-3 opacity-40 rotate-90" />
                </div>
              </div>

              {/* Navigation links */}
              <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-[2px]">
                <div className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/50 px-3 pb-2 select-none">
                  Workspace
                </div>
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-nb-sm text-xs transition-all relative font-medium text-left',
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-foreground/60 hover:text-foreground hover:bg-foreground/[0.03]'
                      )}
                    >
                      {isActive && <span className="absolute left-0 top-2 bottom-2 w-[2.5px] bg-primary rounded-r" />}
                      <span className={cn('transition-transform duration-150', isActive ? 'scale-110 text-primary' : 'opacity-70')}>
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Sidebar Footer / Quick Info */}
            <div className="p-3 border-t border-border/40 bg-card/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
                  NB
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground leading-tight">NextByte Preview</div>
                  <div className="text-[9px] text-muted-foreground/60">Local Sandbox</div>
                </div>
              </div>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  "p-1.5 rounded-full border transition-all",
                  showSettings 
                    ? "border-primary/50 bg-primary/10 text-primary" 
                    : "border-border/60 hover:border-primary/40 hover:bg-foreground/[0.03]"
                )}
                title="Appearance Settings"
              >
                <Palette className="h-3.5 w-3.5" />
              </button>
            </div>
          </aside>
        )}

        {/* ══ MAIN WORKSPACE ══ */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header with Breadcrumbs & Responsive Nav */}
          {activeTab !== 'preview' && (
            <header className="h-14 border-b border-border/30 px-6 flex items-center justify-between shrink-0 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/50">NextByte</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
                <span className="text-foreground font-medium flex items-center gap-1.5">
                  {activeTabDetails?.icon}
                  {activeTabDetails?.label}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Responsive theme controller toggle button */}
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "px-3 py-1.5 rounded-nb-sm border text-xs font-semibold flex items-center gap-1.5 transition-all",
                    showSettings 
                      ? "border-primary/50 bg-primary/10 text-primary shadow-sm" 
                      : "border-border/60 hover:border-primary/30 text-foreground/80 hover:text-foreground"
                  )}
                >
                  <Palette className="h-3.5 w-3.5" />
                  <span>Wygląd & Motywy</span>
                </button>
              </div>
            </header>
          )}

          {/* Main workspace container */}
          <main className={cn(
            "flex-1 overflow-y-auto",
            activeTab === 'preview' ? 'p-0' : 'p-6 max-w-7xl mx-auto w-full'
          )}>
            {sectionMap[activeTab]}
          </main>
        </div>

        {/* Floating Settings Trigger (visible when outer layout is hidden) */}
        {activeTab === 'preview' && (
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "fixed bottom-6 left-6 z-40 p-2.5 rounded-full border shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-semibold",
              showSettings 
                ? "border-primary bg-primary/20 text-primary" 
                : "border-border/50 bg-card/85 text-foreground/70 hover:text-foreground hover:border-primary/40"
            )}
            title="Appearance Settings"
          >
            <Palette className="h-4 w-4" />
            <span className="pr-1">Ustawienia Wyglądu</span>
          </button>
        )}

        {/* ══ APPEARANCE CONTROLLER DOCK/DRAWER ══ */}
        {showSettings && (
          <div className="fixed bottom-6 right-6 z-50 w-80 bg-card/90 border border-border/80 rounded-nb shadow-2xl backdrop-blur-2xl p-4 animate-in slide-in-from-bottom-5 duration-200">
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
                          'w-full rounded-nb-sm border p-2 text-[10px] font-semibold transition-all text-left truncate flex items-center justify-between',
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
export default function App() {
  return (
    <GlassProvider>
      <AppInner />
    </GlassProvider>
  )
}
