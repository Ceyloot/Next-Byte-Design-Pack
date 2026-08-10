import React, { useState, useEffect } from 'react'
import { toast } from '@/components/ui/toaster'
import { NbTabs } from '@/components/ui/NbTabs'
import { Layers, Sparkles, LayoutGrid, Navigation, PanelTop, Palette, BarChart2, Loader, MonitorPlay } from 'lucide-react'
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
const THEMES = [
  { key: null,            label: 'Default',       price: 'darmowy',  isDefault: true,  isLight: false },
  { key: 'dark-theme',    label: 'Ciemny',        price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'light-apple',   label: 'Jasny Apple',   price: 'darmowy',  isDefault: false, isLight: true  },
  { key: 'nextbyte-light',label: 'NB Jasny',      price: 'darmowy',  isDefault: false, isLight: true  },
  { key: 'future-theme',  label: 'Przyszły',      price: 'darmowy',  isDefault: false, isLight: true  },
  { key: 'lime-green',    label: 'Lime',          price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'refspace',      label: 'RefSpace',      price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'sloneczny',     label: 'Słoneczny',     price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'teczowy',       label: 'Tęczowy',       price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'aurora',        label: 'Aurora',        price: '150 Byte', isDefault: false, isLight: false },
  { key: 'fioletowy',     label: 'Fioletowy',     price: '150 Byte', isDefault: false, isLight: false },
  { key: 'nextbyte-v2',   label: 'NB Lekki',      price: '150 Byte', isDefault: false, isLight: false },
  { key: 'dragon-red',    label: 'Smoczy',        price: '150 Byte', isDefault: false, isLight: false },
  { key: 'snowy-white',   label: 'Śnieżny',       price: '150 Byte', isDefault: false, isLight: false },
  { key: 'luxury',        label: 'Luxury',        price: '500 Byte', isDefault: false, isLight: false },
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
  const { isGlass } = useGlass()
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(null)
  const [activeTab,   setActiveTab]   = useState<TabKey>('preview')
  const [bgKey,       setBgKey]       = useState<BgKey>('nextbyte')
  const [lensWszedzie, setLensWszedzie] = useState(true)

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
    preview:    <PreviewSection />,
    karty:      <KartySection />,
    akcje:      <AkcjeSection />,
    formularze: <FormularzeSection />,
    nawigacja:  <NawigacjaSection />,
    nakładki:   <NakladkiSection />,
    dane:       <DaneSection />,
    stany:      <StanySection />,
    paleta:     <PaletaSection />,
  }

  return (
    <>
      {/* Filtry refrakcji — montowane WYŁĄCZNIE w trybie glass.
          Przy wyłączonym szkle mapa 16 KB w ogóle nie trafia do DOM. */}
      {isGlass && <NbGlassFilters />}

      {/* Tło — fixed, nie scrolluje, backdrop-filter działa poprawnie */}
      <AppBackground bgKey={bgKey} />

      {/* Przycisk cyklowania tła */}
      <BgToggle bgKey={bgKey} onCycle={cycleBg} />

      <div className="relative min-h-screen text-foreground font-sans" style={{ zIndex: 1 }}>

        {/* ── STICKY HEADER ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-card/85 backdrop-blur-xl">
          <div className="mx-auto max-w-screen-xl px-4">

            {/* Wiersz 1: logo + glass toggle + theme picker (scrollowalny) */}
            <div className="flex items-center gap-3 py-2 overflow-x-auto scrollbar-none">
              <span className="shrink-0 flex items-center gap-1.5 text-sm font-bold text-foreground mr-1">
                <Sparkles className="h-4 w-4 text-primary" />NB
              </span>
              <GlassToggle />
              {isGlass && (
                <RefrakcjaToggle wszedzie={lensWszedzie} onToggle={() => setLensWszedzie(v => !v)} />
              )}
              <div className="h-4 w-px bg-border shrink-0" />
              <div className="flex items-center gap-1.5 min-w-0">
                {THEMES.map((t) => {
                  const isActive = activeTheme === t.key
                  return (
                    <button
                      key={String(t.key)}
                      onClick={() => setActiveTheme(t.key)}
                      className={cn(
                        'shrink-0 rounded-nb-sm border px-2 py-1 text-[10px] font-semibold transition-all duration-150 whitespace-nowrap',
                        isActive
                          ? 'border-primary/60 bg-primary/10 text-primary'
                          : 'border-border bg-card text-foreground/60 hover:border-primary/30 hover:text-foreground',
                      )}
                    >
                      {t.label}
                      {t.isLight && <span className="ml-1 opacity-60">☀</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Wiersz 2: NbTabs kategorie */}
            <div className="pb-2">
              <NbTabs
                tabs={TABS as unknown as { key: string; label: React.ReactNode; icon?: React.ReactNode }[]}
                defaultTab="karty"
                onChange={(k) => setActiveTab(k as TabKey)}
              />
            </div>
          </div>
        </header>

        {/* ── TREŚĆ ZAKŁADKI ────────────────────────────────────────── */}
        <main className={activeTab === 'preview'
          ? 'w-full'
          : 'mx-auto max-w-screen-xl px-4 py-8'
        }>
          {sectionMap[activeTab]}
        </main>

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
