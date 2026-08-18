import React, { useState } from 'react'
import {
  Sparkles, BarChart3, Settings, Users, Bell, Zap, Search, Type,
  LayoutGrid, Workflow, Palette, Home, FolderOpen, MessageSquare,
  ChevronDown, ChevronRight, Database, Shield, HelpCircle,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { NbTabs } from '@/components/ui/NbTabs'
import { GlassCard, GlassPanel, GlassBadge, GlassTooltip, GlassButton, GlassDropdown } from '@/components/glass'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

const NAV_ITEMS = [
  { label: 'Dashboard',  icon: LayoutGrid },
  { label: 'Projekty',   icon: Workflow },
  { label: 'Modele',     icon: Sparkles },
  { label: 'Analityka',  icon: BarChart3 },
  { label: 'Paleta',     icon: Palette },
]

const BOTTOM_NAV = [
  { label: 'Start',       icon: Home },
  { label: 'Projekty',    icon: FolderOpen },
  { label: 'Chat',        icon: MessageSquare, badge: '4' },
  { label: 'Analityka',   icon: BarChart3 },
  { label: 'Profil',      icon: Users },
]

const SIDEBAR_NAV = [
  { label: 'Dashboard',  icon: LayoutGrid,   active: true },
  { label: 'Projekty',   icon: FolderOpen },
  { label: 'Modele AI',  icon: Sparkles,     badge: 'NEW' },
  { label: 'Analityka',  icon: BarChart3 },
  { label: 'Baza danych',icon: Database },
  { label: 'Bezpiecz.',  icon: Shield },
]

const NB_TABS_DATA = [
  { key: 'studio',      label: 'Studio',      icon: <Sparkles className="h-3.5 w-3.5" /> },
  { key: 'analityka',   label: 'Analityka',   icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { key: 'uzytkownicy', label: 'Użytkownicy', icon: <Users className="h-3.5 w-3.5" /> },
  { key: 'ustawienia',  label: 'Ustawienia',  icon: <Settings className="h-3.5 w-3.5" /> },
]

const DROPDOWN_ITEMS = [
  { key: 'd',   label: 'Dashboard',  icon: <LayoutGrid className="h-4 w-4" /> },
  { key: 'p',   label: 'Projekty',   icon: <FolderOpen className="h-4 w-4" /> },
  { key: 'm',   label: 'Modele',     icon: <Sparkles   className="h-4 w-4" /> },
  { key: 'div', label: '',           divider: true },
  { key: 's',   label: 'Ustawienia', icon: <Settings   className="h-4 w-4" /> },
  { key: 'h',   label: 'Pomoc',      icon: <HelpCircle className="h-4 w-4" /> },
]

export function NawigacjaSection() {
  const [activeNav,    setActiveNav]    = useState('Dashboard')
  const [activeBottom, setActiveBottom] = useState('Start')
  const [activeSide,   setActiveSide]   = useState('Dashboard')
  const { isGlass } = useGlass()

  return (
    <div className="space-y-12">

      {/* ── GÓRNA NAWIGACJA ──────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Górna nawigacja (Horizontal Nav)</h3>
        <SectionLabel>Logo + pigułki zakładek + klaster akcji — 1:1 z paskiem głównym Preview</SectionLabel>
        <header className={cn(
          isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
          'flex items-center gap-2 px-4 h-12 rounded-2xl shadow-lg w-full overflow-hidden',
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
                      ? 'bg-primary/20 text-primary border border-primary/40'
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
            <button className="flex items-center gap-1 px-2 h-7 rounded-full text-[11px] font-semibold bg-foreground/[0.05] text-foreground/45 hover:text-foreground hover:bg-foreground/[0.10] transition-all duration-200">
              <Settings className="w-3 h-3 shrink-0" /><span className="hidden sm:inline">Ustawienia</span>
            </button>
            <button className="flex items-center gap-1 px-2 h-7 rounded-full text-[11px] font-semibold bg-foreground/[0.05] text-foreground/45 hover:text-foreground hover:bg-foreground/[0.10] transition-all duration-200">
              <Type className="w-3 h-3 shrink-0" /><span>Aa</span>
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-foreground/[0.04] hover:bg-foreground/[0.08] transition-all duration-200">
              <Search className="w-3.5 h-3.5 text-primary" />
            </button>
            <button className="relative w-7 h-7 flex items-center justify-center rounded-full bg-foreground/[0.04] hover:bg-foreground/[0.08] transition-all duration-200">
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="absolute top-[5px] right-[5px] w-1.5 h-1.5 rounded-full bg-primary ring-1 ring-background" />
            </button>
            <div className="w-7 h-7 rounded-full bg-primary/25 flex items-center justify-center border border-primary/40 text-[10px] font-bold text-primary shrink-0">AB</div>
          </div>
        </header>

        <SectionLabel>Pasek wyszukiwania (⌘K)</SectionLabel>
        <div className={cn(
          isGlass ? 'nb-szklo' : 'border border-border bg-card',
          'relative flex items-center gap-2.5 rounded-full h-10 px-3.5 w-full max-w-md',
        )}>
          <Search className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
          <span className="flex-1 text-xs text-foreground/40">Szukaj w notatkach, zadaniach...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-foreground/[0.06] border border-foreground/10 text-[9px] font-mono text-foreground/50 shrink-0">⌘K</kbd>
        </div>
      </div>

      {/* ── DOLNA NAWIGACJA ──────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Dolna nawigacja (Bottom Nav)</h3>
        <SectionLabel>5 zakładek z ikonami i etykietami — mobilowa konwencja</SectionLabel>
        <div className={cn(
          isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
          'flex items-stretch rounded-2xl overflow-hidden max-w-sm h-16',
        )}>
          {BOTTOM_NAV.map((item) => {
            const isActive = activeBottom === item.label
            return (
              <button
                key={item.label}
                onClick={() => setActiveBottom(item.label)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all duration-150 relative',
                  isActive ? 'text-primary' : 'text-foreground/45 hover:text-foreground/70',
                )}
              >
                <div className="relative">
                  <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_4px_hsl(var(--primary)/0.6)]')} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-primary text-[8px] font-bold text-background px-0.5">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── BOCZNA NAWIGACJA ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Boczna nawigacja (Sidebar Nav)</h3>
        <SectionLabel>Ikony z tooltipami — zwijany sidebar · Glass / Normal automatycznie</SectionLabel>
        <div className="flex items-start gap-6">
          {/* Icon-only sidebar */}
          <div className={cn(
            isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
            'flex flex-col items-center gap-1 rounded-2xl px-1.5 py-3 w-14',
          )}>
            <div className="w-7 h-7 rounded-[8px] bg-primary flex items-center justify-center shadow-md shadow-primary/30 mb-2">
              <Zap className="w-3.5 h-3.5 text-background" />
            </div>
            {SIDEBAR_NAV.map((item) => {
              const isActive = activeSide === item.label
              return (
                <GlassTooltip key={item.label} content={item.label} side="right">
                  <button
                    onClick={() => setActiveSide(item.label)}
                    className={cn(
                      'relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-foreground/45 hover:text-foreground hover:bg-foreground/[0.06]',
                    )}
                  >
                    <item.icon className="w-4.5 h-4.5" />
                    {item.badge && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                </GlassTooltip>
              )
            })}
            <div className="flex-1" />
            <GlassTooltip content="Ustawienia" side="right">
              <button className="w-9 h-9 flex items-center justify-center rounded-xl text-foreground/45 hover:text-foreground hover:bg-foreground/[0.06] transition-all duration-150">
                <Settings className="w-4 h-4" />
              </button>
            </GlassTooltip>
            <div className="w-7 h-7 rounded-full bg-primary/25 border border-primary/40 flex items-center justify-center text-[9px] font-bold text-primary">AB</div>
          </div>

          {/* Sidebar z etykietami */}
          <div className={cn(
            isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
            'flex flex-col gap-0.5 rounded-2xl px-2 py-3 w-44',
          )}>
            <div className="flex items-center gap-2 px-2 mb-3">
              <div className="w-6 h-6 rounded-[7px] bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                <Zap className="w-3 h-3 text-background" />
              </div>
              <span className="text-[12px] font-bold text-foreground tracking-tight">NextByte</span>
            </div>
            {SIDEBAR_NAV.map((item) => {
              const isActive = activeSide === item.label
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveSide(item.label)}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 h-8 rounded-xl text-[12px] font-medium transition-all duration-150 w-full text-left',
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-foreground/55 hover:text-foreground hover:bg-foreground/[0.06]',
                  )}
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && <GlassBadge intent="primary" size="sm">{item.badge}</GlassBadge>}
                </button>
              )
            })}
            <div className="flex-1 min-h-[16px]" />
            <button className="flex items-center gap-2.5 px-2.5 h-8 rounded-xl text-[12px] font-medium text-foreground/45 hover:text-foreground hover:bg-foreground/[0.06] transition-all duration-150 w-full">
              <Settings className="w-3.5 h-3.5 shrink-0" />Ustawienia
            </button>
          </div>
        </div>
      </div>

      {/* ── DROPDOWN ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Dropdown nav</h3>
        <SectionLabel>Menu wysuwa się pod triggerem — Glass / Normal automatycznie</SectionLabel>
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-foreground/45">Nawigacja kontekstowa</span>
            <GlassDropdown
              trigger={
                <GlassButton variant="solid" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />Sekcja
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </GlassButton>
              }
              items={DROPDOWN_ITEMS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-foreground/45">Breadcrumb z dropdownem</span>
            <GlassPanel className="inline-flex w-auto px-3 py-1.5 gap-1 text-sm items-center">
              {['NextByte', 'Studio'].map((item, i, arr) => (
                <React.Fragment key={item}>
                  <span className="text-foreground/50 text-xs hover:text-foreground cursor-pointer">{item}</span>
                  <span className="text-foreground/30 text-xs">/</span>
                </React.Fragment>
              ))}
              <GlassDropdown
                trigger={
                  <button className="flex items-center gap-0.5 text-xs font-medium text-foreground">
                    Projekty <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                }
                items={DROPDOWN_ITEMS}
              />
            </GlassPanel>
          </div>
        </div>
      </div>

      {/* ── NBTABS ───────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">NbTabs — liquid glass z animowaną pigułką</h3>
        <SectionLabel>Spinning conic-gradient na aktywnej zakładce</SectionLabel>
        <NbTabs tabs={NB_TABS_DATA} className="w-fit" />
      </div>

      {/* ── STANDARDOWE TABS ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Tabs — standardowe zakładki</h3>
        <SectionLabel>Underline z zawartością</SectionLabel>
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

      {/* ── BREADCRUMB ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Breadcrumb</h3>
        <SectionLabel>Ścieżka nawigacji — separator /</SectionLabel>
        <GlassPanel className="inline-flex w-auto px-4 py-2 gap-1.5 text-sm">
          {['NextByte', 'Studio', 'Projekty', 'Projekt X'].map((item, i, arr) => (
            <React.Fragment key={item}>
              <span className={i === arr.length - 1 ? 'text-foreground font-medium text-xs' : 'text-foreground/50 hover:text-foreground cursor-pointer text-xs'}>
                {item}
              </span>
              {i < arr.length - 1 && <span className="text-foreground/30 text-xs">/</span>}
            </React.Fragment>
          ))}
        </GlassPanel>
      </div>

    </div>
  )
}
