import React, { useState } from 'react'
import { Sparkles, BarChart3, Settings, Users, Bell, Zap, Search, Type, LayoutGrid, Workflow, Palette } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { NbTabs } from '@/components/ui/NbTabs'
import { GlassCard, GlassPanel } from '@/components/glass'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

// Ten sam zestaw co realny pasek w Preview — logo, pigułki zakładek,
// klaster ikon (ustawienia / Aa / szukaj / dzwonek / avatar). Statyczne
// demo 1:1 ze strukturą PreviewSection.tsx → HorizontalNav.
const NAV_ITEMS = [
  { label: 'Dashboard',  icon: LayoutGrid },
  { label: 'Projekty',   icon: Workflow },
  { label: 'Modele',     icon: Sparkles },
  { label: 'Analityka',  icon: BarChart3 },
  { label: 'Paleta',     icon: Palette },
]

const NB_TABS_DATA = [
  { key: 'studio',      label: 'Studio',      icon: <Sparkles className="h-3.5 w-3.5" /> },
  { key: 'analityka',   label: 'Analityka',   icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { key: 'uzytkownicy', label: 'Użytkownicy', icon: <Users className="h-3.5 w-3.5" /> },
  { key: 'ustawienia',  label: 'Ustawienia',  icon: <Settings className="h-3.5 w-3.5" /> },
]

export function NawigacjaSection() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const { isGlass } = useGlass()

  return (
    <div className="space-y-10">

      {/* NAVBAR — 1:1 z aktualnym paskiem górnym w zakładce Preview */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Pasek nawigacji (Nav)</h3>
        <SectionLabel>Logo + zakładki + klaster akcji, ze szukaniem</SectionLabel>
        <header className={cn(
          isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
          'flex items-center gap-2 px-4 h-12 rounded-2xl border shadow-lg backdrop-blur-md w-full',
        )}>
          <div className="flex items-center gap-1.5 shrink-0 pr-2">
            <div className="w-7 h-7 rounded-[8px] bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Zap className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="text-[13px] font-bold text-foreground tracking-tight">NextByte</span>
          </div>

          <nav className="flex-1 flex items-center justify-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.label
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(item.label)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150 whitespace-nowrap',
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm shadow-primary/10'
                      : 'text-foreground/55 hover:text-foreground hover:bg-foreground/[0.06] border border-transparent',
                  )}
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <button className="flex items-center gap-1 px-2 h-7 rounded-full border text-[11px] font-semibold border-foreground/12 bg-foreground/[0.05] text-foreground/45 hover:text-foreground hover:border-foreground/20 transition-all duration-200">
              <Settings className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">Ustawienia</span>
            </button>
            <button className="flex items-center gap-1 px-2 h-7 rounded-full border text-[11px] font-semibold border-foreground/12 bg-foreground/[0.05] text-foreground/45 hover:text-foreground hover:border-foreground/20 transition-all duration-200">
              <Type className="w-3 h-3 shrink-0" />
              <span>Aa</span>
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.04] hover:border-foreground/20 transition-all duration-200">
              <Search className="w-3.5 h-3.5 text-primary" />
            </button>
            <button className="relative w-7 h-7 flex items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.04] hover:bg-foreground/[0.08] transition-all duration-200">
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="absolute top-[5px] right-[5px] w-1.5 h-1.5 rounded-full bg-primary ring-1 ring-background" />
            </button>
            <div className="w-7 h-7 rounded-full bg-primary/25 flex items-center justify-center border border-primary/40 text-[10px] font-bold text-primary shrink-0">AB</div>
          </div>
        </header>

        <SectionLabel>Pasek wyszukiwania (⌘K) — jak w głównej treści Preview</SectionLabel>
        <div className="nb-szklo relative flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-card/40 shadow-sm h-10 px-3.5 w-full max-w-md">
          <Search className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
          <span className="flex-1 text-xs text-foreground/40">Szukaj w notatkach, zadaniach, kalendarzu...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-foreground/[0.06] border border-foreground/10 text-[9px] font-mono text-foreground/50 shrink-0">⌘K</kbd>
        </div>
      </div>

      {/* TABS — NbTabs (zakładki z pigułką) */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">NbTabs — liquid glass z animowaną pigułką</h3>
        <SectionLabel>Spinning conic-gradient na aktywnej zakładce (zawsze glass)</SectionLabel>
        <NbTabs tabs={NB_TABS_DATA} className="w-fit" />
        <p className="text-xs text-foreground/40 mt-2">NbTabs używa nb-szklo-plynne niezależnie od trybu — to jego natywny styl.</p>
      </div>

      {/* TABS — standardowe */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Tabs — standardowe zakładki</h3>
        <SectionLabel>Underline + zawartość</SectionLabel>
        <Tabs defaultValue="ogolne">
          <TabsList>
            <TabsTrigger value="ogolne">Ogólne</TabsTrigger>
            <TabsTrigger value="bezpiecz">Bezpieczeństwo</TabsTrigger>
            <TabsTrigger value="powiad">Powiadomienia</TabsTrigger>
          </TabsList>
          <TabsContent value="ogolne">
            <GlassCard className="mt-4">
              <p className="text-sm text-foreground/70">Ustawienia ogólne konta i preferencje wyświetlania.</p>
            </GlassCard>
          </TabsContent>
          <TabsContent value="bezpiecz">
            <GlassCard className="mt-4">
              <p className="text-sm text-foreground/70">Zarządzaj hasłem, 2FA i sesjami.</p>
            </GlassCard>
          </TabsContent>
          <TabsContent value="powiad">
            <GlassCard className="mt-4">
              <p className="text-sm text-foreground/70">Konfiguruj email, push i Slack.</p>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* BREADCRUMB */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Breadcrumb</h3>
        <SectionLabel>Ścieżka nawigacji</SectionLabel>
        <GlassPanel className="inline-flex w-auto px-4 py-2 gap-1.5 text-sm">
          {['NextByte', 'Studio', 'Projekty', 'Projekt X'].map((item, i, arr) => (
            <React.Fragment key={item}>
              <span className={i === arr.length - 1 ? 'text-foreground font-medium' : 'text-foreground/50 hover:text-foreground cursor-pointer'}>
                {item}
              </span>
              {i < arr.length - 1 && <span className="text-foreground/30">/</span>}
            </React.Fragment>
          ))}
        </GlassPanel>
      </div>

    </div>
  )
}
