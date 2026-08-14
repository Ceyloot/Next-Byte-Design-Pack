import React, { useState, useEffect, useRef } from 'react'
import {
  Grid, Sparkles, MessageSquare, Terminal, Brain, ShieldAlert, Shield,
  Camera, Video, Bell, Search, Plus, ChevronRight,
  Zap, Users, Clock, Share2, MoreHorizontal, TrendingUp,
  CheckSquare, Square, ArrowUpRight, ShoppingBag, GraduationCap, Type,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NbGlassFilters } from '@/components/glass/NbGlassFilters'
import { useLiquidGlassScroll } from '@/hooks/useLiquidGlassScroll'
import { Tile, TileRow, TilePill, TileAction } from '@/components/Tile'
import { useGlass } from '@/lib/glass-context'

// ── Navigation Data ───────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    key: 'home',
    label: 'Panel Główny',
    icon: Grid,
    items: [] as { name: string; icon: React.ComponentType<{ className?: string }>; active?: boolean; badge?: string }[],
  },
  {
    key: 'ai',
    label: 'AI',
    icon: Sparkles,
    items: [
      { name: 'Personalny Asystent', icon: Sparkles, active: true },
      { name: 'Chat AI',             icon: MessageSquare },
      { name: 'PromptEx',            icon: Terminal },
      { name: 'Pamięć AI',           icon: Brain },
      { name: 'Red Zone',            icon: ShieldAlert, badge: 'OFF' },
    ],
  },
  {
    key: 'moduly',
    label: 'Moduły',
    icon: Camera,
    items: [
      { name: 'Trend',        icon: TrendingUp },
      { name: 'Studio Zdjęć', icon: Camera },
      { name: 'Studio Video', icon: Video },
    ],
  },
  {
    key: 'praca',
    label: 'Praca',
    icon: CheckSquare,
    items: [
      { name: 'Kalendarz', icon: Clock },
      { name: 'Zadania',   icon: CheckSquare },
      { name: 'Notatki',   icon: Square },
      { name: 'Tablice',   icon: Grid },
      { name: 'Firma',     icon: Users },
    ],
  },
  {
    key: 'spolecznosc',
    label: 'Społeczność',
    icon: Users,
    items: [
      { name: 'Panel Twórcy', icon: Sparkles },
      { name: 'Sklep',        icon: ShoppingBag },
      { name: 'Akademia',     icon: GraduationCap },
      { name: 'Zarząd',       icon: Shield, badge: '●' },
    ],
  },
]

// ── Chart Data ────────────────────────────────────────────────────

const WEEKLY_VALS = [1200, 1850, 1540, 2180, 1920, 820, 2847]

const DONUT_SEGMENTS = [
  { pct: 41, color: 'hsl(var(--primary))' },
  { pct: 28, color: 'hsl(var(--primary) / 0.55)' },
  { pct: 19, color: 'hsl(var(--primary) / 0.32)' },
  { pct: 12, color: 'hsl(var(--foreground) / 0.14)' },
]

const TASK_QUEUE = [
  { done: true,  width: '75%' },
  { done: true,  width: '60%' },
  { done: false, width: '85%' },
  { done: false, width: '50%' },
]

// ── SVG Charts ────────────────────────────────────────────────────

function WeekChart() {
  const W = 320, H = 140
  const max = Math.max(...WEEKLY_VALS)
  const pts = WEEKLY_VALS.map((v, i) => ({
    x: (i / (WEEKLY_VALS.length - 1)) * W,
    y: H - 12 - (v / max) * (H - 30),
  }))
  const polyline = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = [
    `M ${pts[0].x.toFixed(1)},${H}`,
    ...pts.map(p => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `L ${pts[pts.length - 1].x.toFixed(1)},${H} Z`,
  ].join(' ')
  const last = pts[pts.length - 1]

  return (
    <div className="w-full flex flex-col gap-3">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" className="w-full" style={{ height: H }}>
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#wg)" />
        <polyline
          points={polyline}
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={last.x} cy={last.y} r="5" fill="hsl(var(--primary))" />
        <circle cx={last.x} cy={last.y} r="10" fill="hsl(var(--primary))" fillOpacity="0.2" />
      </svg>
      <div className="flex justify-between px-1">
        {WEEKLY_VALS.map((_, i) => (
          <span key={i} className="w-2 h-2 rounded-full bg-foreground/20" />
        ))}
      </div>
    </div>
  )
}

function DonutChart() {
  const r = 55, cx = 70, cy = 70, sw = 14
  const circ = 2 * Math.PI * r
  let cum = 0
  return (
    <svg width={140} height={140} viewBox="0 0 140 140" fill="none" className="shrink-0">
      <circle cx={cx} cy={cy} r={r} stroke="hsl(var(--foreground) / 0.07)" strokeWidth={sw} />
      {DONUT_SEGMENTS.map((seg, i) => {
        const dash = (seg.pct / 100) * circ
        const rotation = -90 + (cum / 100) * 360
        cum += seg.pct
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            stroke={seg.color}
            strokeWidth={sw}
            strokeDasharray={`${dash} ${circ - dash}`}
            transform={`rotate(${rotation} ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        )
      })}
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────

interface PreviewSectionProps {
  onSelectTab?: (tabKey: string) => void
}

export function PreviewSection({ onSelectTab: _onSelectTab }: PreviewSectionProps) {
  const { showContent, isGlass } = useGlass()
  const [activeSection, setActiveSection] = useState('home')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [navCompact, setNavCompact] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useLiquidGlassScroll(mainRef)

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const openMenuDelayed = (key: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenMenu(key)
  }
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const openSection = NAV_SECTIONS.find(s => s.key === openMenu)
  const megaItems = openSection?.items ?? []

  return (
    <div
      className="relative w-full h-screen flex flex-col font-sans antialiased overflow-hidden bg-transparent"
      style={{ zIndex: 1 }}
    >
      <NbGlassFilters />

      {/* ── Floating Megamenu Navbar ── */}
      <div
        ref={navRef}
        className="px-4 lg:px-5 pt-4 pb-4 shrink-0 relative"
        onMouseLeave={scheduleClose}
      >
        <header className={cn(
          isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
          'flex items-center gap-2 px-4 h-12 rounded-2xl border',
        )}>

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0 pr-2">
            <div className="w-7 h-7 rounded-[8px] bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Zap className="w-3.5 h-3.5 text-background" />
            </div>
            {!navCompact && (showContent
              ? <span className="text-[13px] font-bold text-foreground tracking-tight">NextByte</span>
              : <div className="h-3 w-14 bg-foreground/25 rounded-full" />
            )}
          </div>

          {/* Section pills */}
          <nav className="flex-1 flex items-center justify-center gap-0.5">
            {NAV_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.key
              const isOpen = openMenu === sec.key
              return (
                <button
                  key={sec.key}
                  onClick={() => { setActiveSection(sec.key); openMenuDelayed(null) }}
                  onMouseEnter={() => openMenuDelayed(sec.items.length > 0 ? sec.key : null)}
                  className={cn(
                    'flex items-center rounded-full text-[12px] font-medium transition-all duration-150 whitespace-nowrap',
                    navCompact ? 'px-2.5 py-2' : 'gap-1.5 px-3 py-1.5',
                    isActive || isOpen
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm shadow-primary/10'
                      : 'text-foreground/55 hover:text-foreground hover:bg-white/[0.06] border border-transparent',
                  )}
                >
                  <sec.icon className="w-3.5 h-3.5 shrink-0" />
                  {!navCompact && (showContent
                    ? <span>{sec.label}</span>
                    : <div className="h-2 w-9 bg-foreground/25 rounded-full" />
                  )}
                  {!navCompact && sec.items.length > 0 && (
                    <ChevronRight className={cn('w-2.5 h-2.5 shrink-0 transition-transform duration-150',
                      isOpen ? 'rotate-90' : 'opacity-40',
                    )} />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            {/* Text toggle */}
            <button
              onClick={() => setNavCompact(!navCompact)}
              title={navCompact ? 'Pokaż etykiety' : 'Ukryj etykiety'}
              className={cn(
                'flex items-center gap-1 px-2 h-7 rounded-full border text-[11px] font-semibold transition-all duration-200',
                navCompact
                  ? 'border-primary/40 bg-primary/[0.15] text-primary'
                  : 'border-foreground/12 bg-foreground/[0.05] text-foreground/45 hover:text-foreground hover:border-foreground/20',
              )}
            >
              <Type className="w-3 h-3 shrink-0" />
              {!navCompact && (showContent ? <span>Aa</span> : <div className="h-1.5 w-3 bg-foreground/25 rounded-full" />)}
            </button>

            {/* Search */}
            {showContent && !navCompact ? (
              <button className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full border border-foreground/10 bg-foreground/[0.04] text-[11px] text-foreground/45 hover:border-primary/40 transition-all duration-200">
                <Search className="w-3 h-3 text-primary shrink-0" />
                <span>Szukaj...</span>
                <kbd className="text-[9px] font-mono px-1 rounded bg-foreground/10 text-foreground/40 ml-0.5">⌘K</kbd>
              </button>
            ) : (
              <button className="w-7 h-7 flex items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.04] text-foreground/50 hover:text-foreground hover:border-foreground/20 transition-all duration-200">
                <Search className="w-3.5 h-3.5 text-primary" />
              </button>
            )}

            {/* Bell */}
            <button className="relative w-7 h-7 flex items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.04] hover:bg-white/10 transition-all duration-200">
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="absolute top-[5px] right-[5px] w-1.5 h-1.5 rounded-full bg-primary ring-1 ring-background" />
            </button>

            {/* User avatar */}
            <div className="w-7 h-7 rounded-full bg-primary/25 flex items-center justify-center border border-primary/40 text-[10px] font-bold text-primary shrink-0">
              AB
            </div>
          </div>
        </header>

        {/* ── Megamenu dropdown (hover z debounce) ── */}
        {megaItems.length > 0 && (
          <div
            className="absolute left-4 right-4 lg:left-6 lg:right-6 top-full mt-1 z-50"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            {/* bridge: wypełnia szczelinę między header a dropdownem */}
            <div className="h-1 w-full" />
            <div className={cn(
              isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
              'p-2 rounded-2xl border flex flex-wrap gap-1.5',
            )}>
              {megaItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveSection(openMenu!); openMenuDelayed(null) }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-150 whitespace-nowrap',
                    item.active
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'text-foreground/60 hover:text-foreground hover:bg-white/[0.06] border border-foreground/[0.08]',
                  )}
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  {showContent
                    ? <span>{item.name}</span>
                    : <div className="h-2 w-14 bg-foreground/25 rounded-full" />
                  }
                  {showContent && item.badge && (
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-bold',
                      item.badge === '●' ? 'bg-primary/20 text-primary' : 'bg-foreground/10 text-foreground/40',
                    )}>{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Main Workspace ── */}
      <main ref={mainRef} className="flex-1 flex flex-col gap-4 px-4 lg:px-5 pt-0 pb-4 min-w-0 overflow-y-auto">

        {/* ══ TOP BANNER / AKTYWNOŚĆ + SALDO BYTE ══ */}
        <Tile intencja="akcent" elewacja="uniesiona" className="p-5 flex flex-row gap-6 items-center">
          {showContent ? (
            <>
              {/* Left: Heatmap + Title */}
              <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground">📈 Aktywność</h2>
                  <div className="text-[10px] text-foreground/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>OSTATNIE 6 MIES.</span>
                  </div>
                </div>

                {/* Heatmap Grid */}
                <div className="flex gap-1.5">
                  {/* Day labels */}
                  <div className="flex flex-col gap-1 justify-end">
                    <div className="w-6 h-4 text-[9px] text-foreground/50 flex items-center">Wt</div>
                    <div className="w-6 h-4 text-[9px] text-foreground/50 flex items-center">Cz</div>
                    <div className="w-6 h-4 text-[9px] text-foreground/50 flex items-center">So</div>
                  </div>

                  {/* Months */}
                  {[
                    { month: 'Lut', sq: [1,2,1,0,2,1,3] },
                    { month: 'Mar', sq: [2,1,3,2,0,1,2] },
                    { month: 'Kwi', sq: [3,4,2,1,2,3,1] },
                    { month: 'Maj', sq: [2,1,4,3,2,1,4] },
                    { month: 'Cze', sq: [1,2,3,2,1,0,2] },
                    { month: 'Lip', sq: [2,3,4,2,1,2,3] },
                    { month: 'Sie', sq: [3,4,1,2,3,0,1] },
                  ].map(({ month, sq }) => (
                    <div key={month} className="flex flex-col gap-1">
                      <div className="w-8 h-4 text-[9px] text-foreground/50 flex items-center justify-center">{month}</div>
                      <div className="flex flex-col gap-1">
                        {sq.map((level, i) => (
                          <div
                            key={`${month}-${i}`}
                            className={cn(
                              'w-3.5 h-3.5 rounded-md transition-all hover:scale-125 cursor-pointer',
                              level === 0 && 'bg-foreground/12',
                              level === 1 && 'bg-primary/25',
                              level === 2 && 'bg-primary/45',
                              level === 3 && 'bg-primary/65',
                              level === 4 && 'bg-primary',
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Saldo Byte */}
              <div className="flex-1 flex items-center justify-between gap-6 pl-4 border-l border-foreground/10">
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">SALDO BYTE</div>
                  <div className="text-2xl font-black text-primary">0 <span className="text-xs font-normal text-foreground/60">Byte</span></div>
                  <div className="flex gap-2 text-[10px] text-foreground/40">
                    <span>07.08</span>
                    <span>11.08</span>
                    <span>dziś (7d 30d 90d)</span>
                  </div>
                </div>

                <div className="flex-1 h-1 bg-foreground/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-1/4" />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <TileAction rodzaj="glowna" ikona={Plus}>+ Doładuj</TileAction>
                  <TileAction rodzaj="wtorna">Wydatki</TileAction>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Left: Skeleton Heatmap */}
              <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-20 bg-foreground/25 rounded-full" />
                  <div className="h-2.5 w-32 bg-foreground/20 rounded-full" />
                </div>

                {/* Skeleton Heatmap Grid */}
                <div className="flex gap-1.5">
                  <div className="flex flex-col gap-1 justify-end">
                    <div className="w-6 h-4 bg-foreground/15 rounded-sm" />
                    <div className="w-6 h-4 bg-foreground/15 rounded-sm" />
                    <div className="w-6 h-4 bg-foreground/15 rounded-sm" />
                  </div>

                  {[1,2,3,4,5,6,7].map(m => (
                    <div key={m} className="flex flex-col gap-1">
                      <div className="w-8 h-4 bg-foreground/15 rounded-sm" />
                      {[1,2,3,4,5,6,7].map(d => (
                        <div key={`${m}-${d}`} className="w-3.5 h-3.5 bg-foreground/20 rounded-md" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Skeleton Saldo */}
              <div className="flex-1 flex items-center justify-between gap-6 pl-4 border-l border-foreground/10">
                <div className="flex flex-col gap-2">
                  <div className="h-2.5 w-24 bg-foreground/20 rounded-full" />
                  <div className="h-6 w-16 bg-foreground/25 rounded-lg" />
                  <div className="h-2 w-32 bg-foreground/15 rounded-full" />
                </div>

                <div className="flex-1 h-1 bg-foreground/10 rounded-full" />

                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-9 w-20 bg-primary/30 rounded-lg" />
                  <div className="h-9 w-16 bg-foreground/20 rounded-lg" />
                </div>
              </div>
            </>
          )}
        </Tile>

        {/* Global Search Input Bar */}
        {showContent && (
          <div className="w-full">
            <TileRow intencja="neutralna" className="py-3 px-4">
              <Search className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs text-foreground/60 flex-1">Szukaj w notatkach, zadaniach, kalendarzu...</span>
              <kbd className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-foreground/10 text-foreground/50 border border-foreground/10">⌘K</kbd>
            </TileRow>
          </div>
        )}

        {/* ── ROW 1: Overview Card + Weekly Trend Chart + Donut Chart ── */}
        <div className="grid gap-5 lg:gap-6" style={{ gridTemplateColumns: '1.9fr 2fr 1.2fr' }}>

          <Tile intencja="akcent" elewacja="uniesiona" interaktywny className="min-h-[280px]">
            {showContent ? (
              <div className="flex flex-col h-full justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Przegląd Statystyk</h3>
                    <p className="text-xs text-foreground/50">Aktywność konta NextByte</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TileAction rodzaj="cicha" ikona={Share2} samaIkona />
                    <TileAction rodzaj="cicha" ikona={MoreHorizontal} samaIkona />
                  </div>
                </div>
                <div className="flex items-end gap-5">
                  <div>
                    <div className="text-3xl font-black text-foreground">2 847</div>
                    <div className="text-xs text-foreground/50 mt-0.5">Wygenerowane zapytania</div>
                  </div>
                  <div className="pb-1">
                    <TilePill intencja="akcent">
                      <TrendingUp className="w-3.5 h-3.5 mr-1 text-primary" />
                      +24%
                    </TilePill>
                    <div className="text-[10px] text-foreground/40 mt-1">vs zeszły tydzień</div>
                  </div>
                </div>

                {/* Mini Activity Bar Chart */}
                <div className="flex items-end justify-between gap-1 h-16 px-1">
                  {[35, 48, 32, 58, 42, 65, 78].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/40 rounded-t-sm hover:bg-primary/60 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${Math.round(height * 2.8)} zapytań`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-auto">
                  <TileRow intencja="neutralna" className="flex-col justify-center items-center py-2">
                    <span className="text-xs font-bold text-primary">v4.0</span>
                    <span className="text-[10px] text-foreground/50">Wersja</span>
                  </TileRow>
                  <TileRow intencja="neutralna" className="flex-col justify-center items-center py-2">
                    <span className="text-xs font-bold text-emerald-400">99.8%</span>
                    <span className="text-[10px] text-foreground/50">Uptime</span>
                  </TileRow>
                  <TileRow intencja="neutralna" className="flex-col justify-center items-center py-2">
                    <span className="text-xs font-bold text-amber-400">0 Byte</span>
                    <span className="text-[10px] text-foreground/50">Zużycie</span>
                  </TileRow>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="h-4 w-32 bg-primary/45 rounded-[5px] mb-1.5" />
                    <div className="h-3 w-20 bg-foreground/30 rounded-[4px]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <TileAction rodzaj="cicha" ikona={Share2} samaIkona />
                    <TileAction rodzaj="cicha" ikona={MoreHorizontal} samaIkona />
                  </div>
                </div>
                <div className="flex items-end gap-5 mb-6">
                  <div>
                    <div className="h-10 w-36 bg-foreground/50 rounded-[8px] mb-1.5" />
                    <div className="h-3 w-20 bg-foreground/30 rounded-[4px]" />
                  </div>
                  <div className="pb-1">
                    <TilePill intencja="akcent">
                      <TrendingUp className="w-3.5 h-3.5 mr-1 text-primary" />
                      <div className="h-3 w-10 bg-primary/60 rounded-[3px]" />
                    </TilePill>
                    <div className="h-2.5 w-16 bg-foreground/30 rounded-[3px] mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-auto">
                  {[1, 2, 3].map(s => (
                    <TileRow key={s} intencja="neutralna" className="min-h-[58px] flex-col justify-center items-center">
                      <div className="h-4.5 w-10 bg-primary/45 rounded-[4px] mb-1" />
                      <div className="h-2.5 w-14 bg-foreground/30 rounded-[3px]" />
                    </TileRow>
                  ))}
                </div>
              </>
            )}
          </Tile>

          <Tile intencja="akcent" elewacja="uniesiona" interaktywny className="min-h-[280px]">
            <div className="flex items-start justify-between mb-4">
              <div>
                {showContent ? (
                  <>
                    <h3 className="text-sm font-bold text-foreground">Wróć do roboty</h3>
                    <p className="text-xs text-foreground/50">Ostatnie sesje ze wszystkich modułów</p>
                  </>
                ) : (
                  <>
                    <div className="h-4 w-40 bg-primary/45 rounded-[5px] mb-1.5" />
                    <div className="h-3 w-52 bg-foreground/30 rounded-[4px]" />
                  </>
                )}
              </div>
              <TilePill intencja="akcent">
                <TrendingUp className="w-3.5 h-3.5 mr-1 text-primary" />
                {showContent ? 'Live' : <div className="h-3 w-8 bg-primary/60 rounded-[3px]" />}
              </TilePill>
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <WeekChart />
            </div>
          </Tile>

          <Tile intencja="neutralna" elewacja="uniesiona" interaktywny className="min-h-[280px]">
            <div className="flex items-start justify-between mb-4">
              {showContent ? (
                <h3 className="text-sm font-bold text-foreground">Aktywność Modułów</h3>
              ) : (
                <div className="h-4 w-24 bg-primary/45 rounded-[5px]" />
              )}
              <TileAction rodzaj="cicha" ikona={MoreHorizontal} samaIkona />
            </div>
            <div className="flex items-center gap-4 flex-1">
              <DonutChart />
              <div className="flex flex-col gap-2 flex-1">
                {DONUT_SEGMENTS.map((seg, i) => (
                  <TileRow key={i} intencja="neutralna" className="py-1 px-2">
                    <span className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: seg.color }} />
                    {showContent ? (
                      <>
                        <span className="text-[10px] text-foreground/80 font-medium">{['AI Chat', 'Zdjęcia', 'Prompty', 'Inne'][i]}</span>
                        <span className="text-[10px] font-bold text-primary ml-auto">{seg.pct}%</span>
                      </>
                    ) : (
                      <>
                        <div className="h-2.5 w-12 bg-foreground/40 rounded-[3px]" />
                        <div className="h-2.5 w-7 bg-primary/50 rounded-[3px] ml-auto" />
                      </>
                    )}
                  </TileRow>
                ))}
              </div>
            </div>
          </Tile>
        </div>

        {/* ── ROW 2: Tasks Queue + Active Sessions ── */}
        <div className="grid grid-cols-3 gap-5 lg:gap-6">

          <Tile intencja="akcent" elewacja="uniesiona" interaktywny className="min-h-[220px]">
            <div className="flex items-center justify-between mb-4">
              {showContent ? (
                <>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/70">Lista Zadań</h3>
                  <TilePill intencja="neutralna">4 ZADANIA</TilePill>
                </>
              ) : (
                <>
                  <div className="h-4 w-32 bg-primary/45 rounded-[5px]" />
                  <TilePill intencja="neutralna"><div className="h-3 w-4 bg-foreground/40 rounded" /></TilePill>
                </>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1 justify-center">
              {showContent ? (
                <>
                  <TileRow intencja="akcent">
                    <CheckSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs text-foreground font-medium truncate">Prośba o zdjęcie z zadania</span>
                  </TileRow>
                  <TileRow intencja="akcent">
                    <CheckSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs text-foreground font-medium truncate">Zamień D na J w Studio Zdjęć</span>
                  </TileRow>
                  <TileRow intencja="neutralna">
                    <Square className="w-3.5 h-3.5 text-foreground/50 shrink-0" />
                    <span className="text-xs text-foreground/60 truncate">Konfiguracja Lokalnego AI (Ollama)</span>
                  </TileRow>
                  <TileRow intencja="neutralna">
                    <Square className="w-3.5 h-3.5 text-foreground/50 shrink-0" />
                    <span className="text-xs text-foreground/60 truncate">Scenariusz TikTok B2C</span>
                  </TileRow>
                </>
              ) : (
                TASK_QUEUE.map((t, i) => (
                  <TileRow key={i} intencja={t.done ? 'akcent' : 'neutralna'}>
                    {t.done
                      ? <CheckSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                      : <Square className="w-3.5 h-3.5 text-foreground/50 shrink-0" />
                    }
                    <div
                      className={cn('h-2.5 rounded-[4px]', t.done ? 'bg-primary/60' : 'bg-foreground/40')}
                      style={{ width: t.width }}
                    />
                  </TileRow>
                ))
              )}
            </div>
          </Tile>

          <div className="col-span-2 grid grid-cols-2 gap-5 lg:gap-6">
            <Tile intencja="akcent" elewacja="uniesiona" interaktywny className="min-h-[220px]">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-md shadow-primary/25"
                  style={{ backgroundColor: 'hsl(var(--primary) / 0.25)', border: '1px solid hsl(var(--primary) / 0.50)' }}
                >
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <TileAction rodzaj="cicha" ikona={MoreHorizontal} samaIkona />
              </div>
              {showContent ? (
                <>
                  <h4 className="text-sm font-bold text-foreground">Chat AI — Personalny Asystent</h4>
                  <p className="text-xs text-foreground/50 mt-1">Rozmowa: Jakie umiejętności potrzebuję...</p>
                </>
              ) : (
                <>
                  <div className="h-4 w-44 bg-primary/45 rounded-[5px] mb-2" />
                  <div className="h-3 w-28 bg-foreground/30 rounded-[4px]" />
                </>
              )}
              <div className="flex items-center justify-between mt-auto pt-3">
                <TilePill intencja="neutralna">
                  <Clock className="w-3 h-3 mr-1 text-primary" />
                  {showContent ? '31 lip' : <div className="h-2.5 w-12 bg-foreground/30 rounded-[3px]" />}
                </TilePill>
                <TilePill intencja="akcent">{showContent ? 'Aktywny' : 'Active'}</TilePill>
              </div>
            </Tile>

            <Tile intencja="akcent" elewacja="uniesiona" interaktywny className="min-h-[220px]">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-md shadow-primary/25"
                  style={{ backgroundColor: 'hsl(var(--primary) / 0.25)', border: '1px solid hsl(var(--primary) / 0.50)' }}
                >
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <TileAction rodzaj="cicha" ikona={MoreHorizontal} samaIkona />
              </div>
              {showContent ? (
                <>
                  <h4 className="text-sm font-bold text-foreground">Studio Zdjęć</h4>
                  <p className="text-xs text-foreground/50 mt-1">Wygenerowany obraz: mazda miata...</p>
                </>
              ) : (
                <>
                  <div className="h-4 w-44 bg-primary/45 rounded-[5px] mb-2" />
                  <div className="h-3 w-28 bg-foreground/30 rounded-[4px]" />
                </>
              )}
              <div className="flex items-center justify-between mt-auto pt-3">
                <TilePill intencja="neutralna">
                  <Clock className="w-3 h-3 mr-1 text-primary" />
                  {showContent ? '28 lip' : <div className="h-2.5 w-12 bg-foreground/30 rounded-[3px]" />}
                </TilePill>
                <TilePill intencja="akcent">{showContent ? 'Aktywny' : 'Active'}</TilePill>
              </div>
            </Tile>
          </div>
        </div>

        {/* ── ROW 3: Recent Projects ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            {showContent ? (
              <>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/70">Ostatnie Projekty (Szybka Podróż)</h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-foreground/50">Zobacz wszystkie</span>
                  <ChevronRight className="w-3.5 h-3.5 text-foreground/50" />
                </div>
              </>
            ) : (
              <>
                <div className="h-4 w-40 bg-primary/45 rounded-[5px]" />
                <div className="flex items-center gap-1.5">
                  <div className="h-3.5 w-16 bg-foreground/30 rounded-[4px]" />
                  <ChevronRight className="w-3.5 h-3.5 text-foreground/50" />
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-3 gap-5 lg:gap-6">
            <Tile intencja="akcent" elewacja="uniesiona" interaktywny className="min-h-[220px]">
              <div className="flex items-start justify-between mb-4">
                <TilePill intencja="akcent">
                  <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-primary shadow-sm" />
                  {showContent ? 'Platforma' : <div className="h-2.5 w-14 bg-foreground/30 rounded-[3px]" />}
                </TilePill>
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </div>
              {showContent ? (
                <>
                  <h4 className="text-sm font-bold text-foreground mb-1">Co trzeba aw kambipo zrobic</h4>
                  <p className="text-xs text-foreground/50">Analiza modułowa dla zespołu NextByte.</p>
                </>
              ) : (
                <>
                  <div className="h-4 w-44 bg-primary/45 rounded-[5px] mb-3" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-full bg-foreground/25 rounded-[4px]" />
                    <div className="h-3 w-10/12 bg-foreground/20 rounded-[4px]" />
                  </div>
                </>
              )}
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-foreground/12">
                <span className="text-[10px] text-foreground/40 font-mono">{showContent ? 'v4.0.0' : <div className="h-2.5 w-12 bg-foreground/30 rounded-[3px]" />}</span>
                <TilePill intencja="akcent">BETA</TilePill>
              </div>
            </Tile>

            <Tile intencja="neutralna" elewacja="uniesiona" interaktywny className="min-h-[220px]">
              <div className="flex items-start justify-between mb-4">
                <TilePill intencja="neutralna">
                  <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-amber-400 shadow-sm" />
                  {showContent ? 'Kalendarz' : <div className="h-2.5 w-14 bg-foreground/30 rounded-[3px]" />}
                </TilePill>
                <ArrowUpRight className="w-4 h-4 text-foreground/50" />
              </div>
              {showContent ? (
                <>
                  <h4 className="text-sm font-bold text-foreground mb-1">Terminy & Zaproszenia</h4>
                  <p className="text-xs text-foreground/50">Brak zaplanowanych wydarzeń w 7d.</p>
                </>
              ) : (
                <>
                  <div className="h-4 w-44 bg-primary/45 rounded-[5px] mb-3" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-full bg-foreground/25 rounded-[4px]" />
                    <div className="h-3 w-10/12 bg-foreground/20 rounded-[4px]" />
                  </div>
                </>
              )}
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-foreground/12">
                <span className="text-[10px] text-foreground/40 font-mono">{showContent ? 'v2.4' : <div className="h-2.5 w-12 bg-foreground/30 rounded-[3px]" />}</span>
                <TilePill intencja="neutralna">Active</TilePill>
              </div>
            </Tile>

            <Tile intencja="neutralna" elewacja="uniesiona" interaktywny className="min-h-[220px]">
              <div className="flex items-start justify-between mb-4">
                <TilePill intencja="neutralna">
                  <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-cyan-400 shadow-sm" />
                  {showContent ? 'Nowości' : <div className="h-2.5 w-14 bg-foreground/30 rounded-[3px]" />}
                </TilePill>
                <ArrowUpRight className="w-4 h-4 text-foreground/50" />
              </div>
              {showContent ? (
                <>
                  <h4 className="text-sm font-bold text-foreground mb-1">Lokalny AI (Ollama)</h4>
                  <p className="text-xs text-foreground/50">Twój model, Twoja prywatność offline.</p>
                </>
              ) : (
                <>
                  <div className="h-4 w-44 bg-primary/45 rounded-[5px] mb-3" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-full bg-foreground/25 rounded-[4px]" />
                    <div className="h-3 w-10/12 bg-foreground/20 rounded-[4px]" />
                  </div>
                </>
              )}
            </Tile>
          </div>
        </div>

      </main>
    </div>
  )
}
