import React, { useState } from 'react'
import { Sparkles, BarChart3, Settings, Users, Bell } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { NbTabs } from '@/components/ui/NbTabs'
import { GlassCard, GlassNav, GlassNavItem, GlassNavBrand, GlassNavSpacer, GlassSearch, GlassBadge, GlassPanel } from '@/components/glass'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

const NAV_ITEMS = ['Dashboard', 'Projekty', 'Modele', 'Analityka', 'Ustawienia']

const NB_TABS_DATA = [
  { key: 'studio',      label: 'Studio',      icon: <Sparkles className="h-3.5 w-3.5" /> },
  { key: 'analityka',   label: 'Analityka',   icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { key: 'uzytkownicy', label: 'Użytkownicy', icon: <Users className="h-3.5 w-3.5" /> },
  { key: 'ustawienia',  label: 'Ustawienia',  icon: <Settings className="h-3.5 w-3.5" /> },
]

export function NawigacjaSection() {
  const [activeNav, setActiveNav] = useState('Dashboard')

  return (
    <div className="space-y-10">

      {/* NAVBAR */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Pasek nawigacji (Nav)</h3>
        <SectionLabel>Fullwidth z wyszukiwarką i badge</SectionLabel>
        <GlassNav position="free" className="w-full">
          <GlassNavBrand>
            <Sparkles className="h-4 w-4 text-primary" />
            NextByte
          </GlassNavBrand>
          {NAV_ITEMS.map((item) => (
            <GlassNavItem key={item} active={item === activeNav} onClick={() => setActiveNav(item)}>
              {item}
            </GlassNavItem>
          ))}
          <GlassNavSpacer />
          <GlassSearch placeholder="Szukaj..." size="sm" className="w-44" />
          <button className="relative">
            <Bell className="h-5 w-5 text-foreground/60" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
          </button>
          <GlassBadge intent="primary" dot size="sm">Pro</GlassBadge>
        </GlassNav>
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
