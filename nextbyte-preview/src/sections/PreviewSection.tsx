import React, { useState, useEffect, useRef } from 'react'
import {
  Grid, Sparkles, MessageSquare, Terminal, Brain, ShieldAlert, Shield,
  Camera, Video, Bell, Search, Plus, ChevronRight, ChevronLeft,
  Zap, Users, Clock, Share2, MoreHorizontal, TrendingUp,
  CheckSquare, Square, ArrowUpRight, ShoppingBag, GraduationCap, Type, Receipt,
  Check, Edit2, FileText, Layers, Folder, Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NbGlassFilters } from '@/components/glass/NbGlassFilters'
import { useLiquidGlassScroll } from '@/hooks/useLiquidGlassScroll'
import { Tile, TileRow, TilePill, TileAction } from '@/components/Tile'
import { useGlass } from '@/lib/glass-context'
import { GlassActivityGrid } from '@/components/glass'


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
  { pct: 41, color: 'hsl(var(--primary))', label: 'AI Chat', count: '1 167' },
  { pct: 28, color: '#38bdf8', label: 'Studio Zdjęcia', count: '797' },
  { pct: 19, color: '#a855f7', label: 'Prompty', count: '541' },
  { pct: 12, color: 'hsl(var(--foreground) / 0.25)', label: 'Inne', count: '342' },
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

function DonutChart({ size = 92 }: { size?: number }) {
  const r = 36, cx = 46, cy = 46, sw = 10
  const circ = 2 * Math.PI * r
  let cum = 0

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} viewBox="0 0 92 92" fill="none" className="shrink-0 -rotate-90">
        <circle cx={cx} cy={cy} r={r} stroke="hsl(var(--foreground) / 0.08)" strokeWidth={sw} />
        {DONUT_SEGMENTS.map((seg, i) => {
          const dash = (seg.pct / 100) * circ
          const rotation = (cum / 100) * 360
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
              className="transition-all duration-300"
            />
          )
        })}
      </svg>
    </div>
  )
}

// ── Recent Items & Quick Shortcuts Mock Data ───────────────────────

const RECENT_ITEMS = [
  {
    id: 1,
    title: 'Roadmapa studio zdjęć',
    type: 'Notatka',
    time: '2 dni temu',
    icon: FileText,
    category: 'notatka',
  },
  {
    id: 2,
    title: 'Jakie umiejętności potrzebuje aby bez problemu',
    type: 'Rozmowa',
    time: '31 lip',
    icon: MessageSquare,
    category: 'chat',
  },
  {
    id: 3,
    title: 'zamień D na J',
    type: 'Studio Zdjęć',
    time: '30 lip',
    icon: Camera,
    category: 'zdjecia',
    hasThumbnail: true,
  },
  {
    id: 4,
    title: 'Jaki vr do lmu najlepszy an',
    type: 'Rozmowa',
    time: '30 lip',
    icon: MessageSquare,
    category: 'chat',
  },
  {
    id: 5,
    title: 'mazda miata z popupami w kolorze syrenkowym',
    type: 'Studio Zdjęć',
    time: '28 lip',
    icon: Camera,
    category: 'zdjecia',
    hasThumbnail: true,
  },
  {
    id: 6,
    title: 'Firmy pod wprowadzenie ich na nextbyte',
    type: 'Rozmowa',
    time: '27 lip',
    icon: MessageSquare,
    category: 'chat',
    hasArrow: true,
  },
  {
    id: 7,
    title: 'Czas gotowania parówek...',
    type: 'Rozmowa',
    time: '25 lip',
    icon: MessageSquare,
    category: 'chat',
  },
]

const AKTUALNOSCI_ITEMS = [
  {
    id: 1,
    title: 'Wersja 4.0 z ulepszonym modelem AI',
    desc: 'Zoptymalizowano szybkość odpowiedzi oraz dodano podgląd aktywności.',
    time: '1 godz. temu',
    badge: 'SYSTEM',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Studio Zdęć v2.1 — kadry 3D',
    desc: 'Dodano nowe presety renderowania oraz redukcję szumów obrazu.',
    time: '1 dzień temu',
    badge: 'NOWOŚĆ',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
    icon: Camera,
  },
  {
    id: 3,
    title: 'Zwiększono limity zapytań',
    desc: 'Zwiększony limit współbieżnych zapytań dla pakietów Byte Pro.',
    time: '3 dni temu',
    badge: 'INFO',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: Zap,
  },
]

const FEATURED_NEWS = [
  {
    id: 1,
    title: 'Grok Image — kosmiczny realizm',
    desc: 'Najmocniejsze odwzorowanie ludzi i fotorealizm. Twarze, skóra, światło — jak ze studia.',
    tag: 'Studio Zdęć v2.1',
    linkText: 'Otwórz Studio Zdęć',
    icon: Camera,
    gradient: 'from-primary/30 via-purple-600/25 to-blue-600/20',
  },
  {
    id: 2,
    title: 'Model Chat AI 4.0 — superszybki kompilator',
    desc: 'O 300% szybsza generacja kodu i automatyczna synteza długich instrukcji.',
    tag: 'Chat AI v4.0',
    linkText: 'Przejdź do Chat AI',
    icon: MessageSquare,
    gradient: 'from-cyan-500/30 via-blue-600/25 to-indigo-600/20',
  },
  {
    id: 3,
    title: 'PromptEx v3 — automatyczny optymalizator',
    desc: 'Błyskawiczne ulepszanie instrukcji w czasie rzeczywistym z analizą kontekstu.',
    tag: 'Prompty v3.0',
    linkText: 'Otwórz PromptEx',
    icon: Terminal,
    gradient: 'from-amber-500/30 via-orange-600/25 to-red-600/20',
  },
  {
    id: 4,
    title: 'Byte Cloud — bezlimitowa pamięć AI',
    desc: 'Błyskawiczne zapisywanie sesji roboczych i natychmiastowe współdzielenie projektów.',
    tag: 'Pamięć AI',
    linkText: 'Sprawdź Pamięć AI',
    icon: Brain,
    gradient: 'from-emerald-500/30 via-teal-600/25 to-cyan-600/20',
  },
]

const QUICK_SHORTCUTS = [
  {
    id: 1,
    title: 'Co trzeba w kambipo zro...',
    category: 'PLATFORMA',
    icon: MessageSquare,
    isAdd: false,
  },
  {
    id: 2,
    title: 'Kalendarz',
    category: 'PLATFORMA',
    icon: Calendar,
    isAdd: false,
  },
  { id: 3, title: 'Dodaj skrót', category: '', icon: null, isAdd: true },
  { id: 4, title: 'Dodaj skrót', category: '', icon: null, isAdd: true },
  { id: 5, title: 'Dodaj skrót', category: '', icon: null, isAdd: true },
  { id: 6, title: 'Dodaj skrót', category: '', icon: null, isAdd: true },
]

function CircularGauge({
  value,
  pct,
  label,
  color,
}: {
  value: string | number
  pct: number
  label: string
  color?: string
}) {
  const r = 22
  const circ = 2 * Math.PI * r
  const strokeDashoffset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
          <circle
            cx="26"
            cy="26"
            r={r}
            fill="none"
            stroke="hsl(var(--foreground) / 0.08)"
            strokeWidth="3.5"
          />
          <circle
            cx="26"
            cy="26"
            r={r}
            fill="none"
            stroke={color || "hsl(var(--primary))"}
            strokeWidth="3.5"
            strokeDasharray={circ}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute text-xs font-bold text-foreground tabular-nums">
          {value}
        </span>
      </div>
      <span className="text-[10px] text-foreground/60 font-medium text-center truncate max-w-[85px]">
        {label}
      </span>
    </div>
  )
}

function CustomCheckbox({
  checked,
  onChange,
  label,
  showContent = true,
}: {
  checked: boolean
  onChange?: () => void
  label: string
  showContent?: boolean
}) {
  return (
    <div
      onClick={onChange}
      className={cn(
        "group flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-150 cursor-pointer select-none border",
        checked
          ? "border-primary/30 bg-primary/10 text-foreground"
          : "border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.08] text-foreground/70"
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors",
          checked
            ? "border-primary bg-primary/20 text-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
            : "border-white/20 bg-white/[0.03] group-hover:border-white/40"
        )}
      >
        {checked && <Check className="w-3 h-3 text-primary stroke-[3]" />}
      </div>
      {showContent ? (
        <span className={cn("text-xs font-medium truncate flex-1 leading-none", checked ? "text-foreground font-semibold" : "text-foreground/70")}>
          {label}
        </span>
      ) : (
        <div className="h-2.5 bg-foreground/20 rounded-full animate-pulse flex-1" />
      )}
    </div>
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
  const [searchQuery, setSearchQuery] = useState('')
  const [activeNewsIndex, setActiveNewsIndex] = useState(0)
  const [taskList, setTaskList] = useState([
    { id: 1, label: 'Prośba o zdjęcie z zadania', done: true },
    { id: 2, label: 'Zamień D na J w Studio Zdjęć', done: true },
    { id: 3, label: 'Konfiguracja Lokalnego AI (Ollama)', done: false },
    { id: 4, label: 'Scenariusz TikTok B2C', done: false },
  ])
  const mainRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useLiquidGlassScroll(mainRef)

  const toggleTask = (id: number) => {
    setTaskList(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

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

        {/* ══ TOP BANNER: UNIFIED SINGLE TILE (AKTYWNOŚĆ + SALDO BYTE SIDE-BY-SIDE) ══ */}
        <Tile intencja="akcent" elewacja="uniesiona" className="py-2.5 px-3 md:px-4 border-white/[0.06] bg-card/40 transition-[box-shadow,border-color,background-color] duration-200">

          <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-4">

            {/* Column 1: Aktywność */}
            <div className="min-w-0 flex-1 md:max-w-[380px]">
              <GlassActivityGrid
                weeksCount={26}
                showContent={showContent}
                showSummary={false}
                showStreaks={false}
                compact={true}
              />
            </div>

            {/* Vertical Separator */}
            <span className="hidden w-px self-stretch bg-white/[0.08] md:block" aria-hidden="true" />

            {/* Column 2: Saldo Byte Amount */}
            <div className="min-w-0 shrink-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Saldo Byte</p>
              <p className="mt-0.5 text-xl font-bold leading-none tabular-nums text-foreground flex items-center">
                0<span className="ml-1 text-sm text-primary font-normal">⟠</span>
              </p>
              <button type="button" aria-label="Wersja platformy Beta 4.0.0" className="mt-1 inline-flex rounded-full outline-none">
                <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-semibold uppercase tracking-wide border-primary/30 bg-primary/10 text-primary h-4 gap-1 px-1.5 text-[9px]">
                  Beta 4.0.0
                </span>
              </button>
            </div>

            {/* Column 3: Saldo Byte Timeline & Solid Single-Color Line */}
            <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
              {/* Solid Single-Color Progress Line */}
              <div className="w-full h-1 bg-foreground/10 rounded-full relative overflow-hidden my-0.5">
                <div className="h-full bg-primary rounded-full w-full shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
              </div>

              {/* Date timeline + Range buttons */}
              <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                <span className="flex flex-1 items-center justify-between tabular-nums">
                  <span>09.08</span>
                  <span className="hidden sm:inline">12.08</span>
                  <span>dziś</span>
                </span>
                <span className="hidden sm:flex ml-2">
                  <span className="flex shrink-0 items-center gap-0.5">
                    <button type="button" className="rounded-md px-1.5 py-0.5 text-[9px] tabular-nums transition-colors bg-primary/15 text-primary font-semibold">7d</button>
                    <button type="button" className="rounded-md px-1.5 py-0.5 text-[9px] tabular-nums transition-colors text-muted-foreground hover:text-foreground">30d</button>
                    <button type="button" className="rounded-md px-1.5 py-0.5 text-[9px] tabular-nums transition-colors text-muted-foreground hover:text-foreground">90d</button>
                  </span>
                </span>
              </div>

              {/* Subtext */}
              <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-muted-foreground/70">
                Brak zużycia w ostatnich 7 dniach
              </p>
            </div>

            {/* Column 4: Action Buttons (Far Right) */}
            <div className="grid w-full shrink-0 grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-col">
              <button
                type="button"
                className="rounded-lg inline-flex items-center gap-1 border text-xs font-semibold px-2.5 border-foreground/15 bg-white/[0.05] hover:bg-white/[0.1] text-foreground transition-colors duration-200 h-8 w-full justify-center sm:h-7.5 sm:w-[110px]"
              >
                <Plus className="h-3 w-3 shrink-0 text-primary" />
                Doładuj
              </button>
              <button
                type="button"
                className="rounded-lg inline-flex items-center gap-1 border text-xs font-semibold px-2.5 border-white/[0.08] hover:border-white/[0.15] text-muted-foreground hover:text-foreground transition-colors duration-200 h-8 w-full justify-center sm:h-7.5 sm:w-[110px]"
              >
                <Receipt className="h-3 w-3 shrink-0" />
                Wydatki
              </button>
            </div>

          </div>
        </Tile>

        {/* Global Search Input Bar (Visible in both content and skeleton mode with 1:1 identical dimensions) */}
        <div className="w-full flex items-center justify-end gap-4 z-20">
          <div className="flex items-center gap-4 w-full">
            <div className={cn(
              "nb-szklo nb-szklo-pigulka relative z-10 flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-white/[0.08] transition-all duration-300 h-10 px-3.5 bg-card/40 shadow-sm",
              showContent ? "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20" : "animate-pulse border-foreground/10"
            )}>
              <Search className={cn("w-3.5 h-3.5 shrink-0", showContent ? "text-primary" : "text-foreground/30")} />
              <div className="relative flex-1 min-w-0 overflow-hidden">
                {showContent ? (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Szukaj w notatkach, zadaniach, kalendarzu..."
                    className="w-full bg-transparent text-foreground outline-none ring-0 placeholder:text-muted-foreground/50 text-xs font-medium"
                  />
                ) : (
                  <div className="h-3 w-64 bg-foreground/20 rounded-full" />
                )}
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-muted-foreground/60 flex-shrink-0 whitespace-nowrap">
                <span>⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* ── MIDDLE SECTION: 3 EQUAL COLUMNS (33% / 33% / 33%) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch min-w-0">

          {/* COLUMN 1 (33%): Aktywność Modułów + Lista Zadań */}
          <div className="flex flex-col gap-3 h-full min-w-0">

            {/* Card 1: Aktywność Modułów */}
            <Tile intencja="akcent" elewacja="uniesiona" className="p-3.5 flex flex-col justify-between border-white/[0.06] bg-card/40">
              {showContent ? (
                <>
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                    <h3 className="text-xs font-bold text-foreground">Aktywność Modułów</h3>
                    <button type="button" className="text-foreground/40 hover:text-foreground transition-colors" title="Więcej opcji">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main Section: Donut Ring + Stacked Pill Rows */}
                  <div className="flex items-center gap-3 py-2">
                    <DonutChart size={84} />
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      {DONUT_SEGMENTS.map((seg, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-2.5 py-1 rounded-full border border-primary/25 bg-primary/10 text-xs transition-colors hover:border-primary/40"
                        >
                          <span className="text-foreground/90 font-medium text-[10.5px] truncate">{seg.label}</span>
                          <span className="text-primary font-bold text-xs shrink-0 ml-1.5">{seg.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2 p-1 animate-pulse">
                  <div className="h-4 w-32 bg-primary/45 rounded" />
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-20 h-20 rounded-full border-4 border-foreground/15 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-full bg-foreground/15 rounded" />
                      <div className="h-3 w-4/5 bg-foreground/15 rounded" />
                      <div className="h-3 w-3/4 bg-foreground/15 rounded" />
                    </div>
                  </div>
                </div>
              )}
            </Tile>

            {/* Card 2: Lista Zadań */}
            <Tile intencja="akcent" elewacja="uniesiona" className="p-3.5 flex flex-col justify-between flex-1 border-white/[0.06] bg-card/40">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/[0.06]">
                {showContent ? (
                  <>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Lista Zadań</h3>
                    <TilePill intencja="neutralna" className="border-white/10 bg-white/5 text-[9px]">4 ZADANIA</TilePill>
                  </>
                ) : (
                  <>
                    <div className="h-4 w-32 bg-primary/45 rounded-[5px]" />
                    <TilePill intencja="neutralna"><div className="h-3 w-4 bg-foreground/40 rounded" /></TilePill>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-1.5 flex-1 justify-center">
                {taskList.map((t) => (
                  <CustomCheckbox
                    key={t.id}
                    checked={t.done}
                    label={t.label}
                    showContent={showContent}
                    onChange={() => toggleTask(t.id)}
                  />
                ))}
              </div>
            </Tile>

          </div>

          {/* COLUMN 2 (33%): Wróć do roboty */}
          <Tile intencja="akcent" elewacja="uniesiona" className="p-3.5 flex flex-col justify-between min-w-0 border-white/[0.06] bg-card/40 h-full">
            {showContent ? (
              <div className="flex flex-col justify-between h-full">
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2 pb-1.5 border-b border-white/[0.06]">
                    <div>
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        Wróć do roboty
                      </h3>
                      <p className="text-[10px] text-foreground/50 mt-0.5">
                        Twoje ostatnie sesje ze wszystkich modułów
                      </p>
                    </div>
                    <TilePill intencja="neutralna" className="border-white/10 bg-white/5 text-[9px] shrink-0">5 SESJI</TilePill>
                  </div>

                  {/* Filter Pills Bar */}
                  <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-0.5 scrollbar-none">
                    <button type="button" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-primary/20 text-primary border border-primary/30 shrink-0">
                      <Layers className="w-3 h-3" />
                      Wszystko
                    </button>
                    <button type="button" className="p-0.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/5 border border-transparent shrink-0" title="Notatki">
                      <FileText className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-0.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/5 border border-transparent shrink-0" title="Chat AI">
                      <MessageSquare className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-0.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/5 border border-transparent shrink-0" title="Studio Zdjęcia">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Recent Items List - 5 Items */}
                  <div className="flex flex-col gap-1.5">
                    {RECENT_ITEMS.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between gap-2.5 p-1.5 px-2 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.08] transition-all duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:border-primary/40 group-hover:text-primary transition-colors">
                            <item.icon className="w-3 h-3 text-foreground/70 group-hover:text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[11px] font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                              {item.title}
                            </h4>
                            <p className="text-[9px] text-foreground/45 mt-0.5 flex items-center gap-1.5">
                              <span>{item.type}</span>
                              <span>•</span>
                              <span>{item.time}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 p-0.5 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-primary/45 rounded" />
                  <div className="h-3.5 w-14 bg-foreground/20 rounded-full" />
                </div>
                <div className="flex gap-1">
                  <div className="h-5 w-16 bg-foreground/15 rounded-lg" />
                  <div className="h-5 w-6 bg-foreground/10 rounded-lg" />
                  <div className="h-5 w-6 bg-foreground/10 rounded-lg" />
                </div>
                <div className="space-y-1.5 pt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                      <div className="w-6 h-6 rounded-lg bg-foreground/15 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-2.5 w-32 bg-foreground/20 rounded" />
                        <div className="h-2 w-16 bg-foreground/15 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Tile>

          {/* COLUMN 3 (33%): NOWOŚCI with Top Image Banner & Carousel */}
          <Tile intencja="akcent" elewacja="uniesiona" className="p-3.5 flex flex-col justify-between min-w-0 border-white/[0.06] bg-card/40 h-full">
            {showContent ? (
              <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col gap-2">
                  {/* Header with Nav Controls */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
                      NOWOŚCI
                    </h3>
                    <div className="flex items-center gap-1">
                      <TilePill intencja="akcent" className="border-primary/20 bg-primary/10 text-[9px] mr-0.5">
                        {activeNewsIndex + 1} z {FEATURED_NEWS.length}
                      </TilePill>
                      <button
                        type="button"
                        onClick={() => setActiveNewsIndex((prev) => (prev > 0 ? prev - 1 : FEATURED_NEWS.length - 1))}
                        className="p-1 rounded-md text-foreground/50 hover:text-foreground hover:bg-white/10 border border-white/5 transition-colors"
                        title="Poprzedni slajd"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveNewsIndex((prev) => (prev < FEATURED_NEWS.length - 1 ? prev + 1 : 0))}
                        className="p-1 rounded-md text-foreground/50 hover:text-foreground hover:bg-white/10 border border-white/5 transition-colors"
                        title="Następny slajd"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Featured Highlight Card with Top Image Banner (Image on Top, Text & Link Below) */}
                  {(() => {
                    const news = FEATURED_NEWS[activeNewsIndex] || FEATURED_NEWS[0]
                    const NewsIcon = news.icon
                    return (
                      <div
                        key={news.id}
                        className="p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col gap-2 group shadow-sm"
                      >
                        {/* Top Image Preview Banner */}
                        <div className={cn("h-20 w-full rounded-lg bg-gradient-to-br border border-white/15 flex items-center justify-center relative overflow-hidden group shadow-inner", news.gradient)}>
                          <NewsIcon className="w-8 h-8 text-primary relative z-10 group-hover:scale-110 transition-transform duration-200" />
                          <div className="absolute inset-0 bg-primary/20 blur-md" />
                          <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur border border-white/10 text-[8px] font-bold text-white uppercase tracking-wider">
                            {news.tag}
                          </div>
                        </div>

                        {/* Text & Details Below Banner */}
                        <div className="flex flex-col gap-1">
                          <h4 className="text-xs font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                            {news.title}
                          </h4>
                          <p className="text-[9.5px] text-foreground/55 leading-snug line-clamp-2">
                            {news.desc}
                          </p>
                        </div>

                        {/* Footer Action Link */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                          <span className="text-[8.5px] text-foreground/40 font-medium">Oficjalna aktualizacja</span>
                          <button type="button" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                            {news.linkText} <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Additional Sub-News Feed */}
                  <div className="flex flex-col gap-1.5">
                    {AKTUALNOSCI_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between gap-2 p-1.5 px-2 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <item.icon className="w-2.5 h-2.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[10.5px] font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                              {item.title}
                            </h4>
                          </div>
                        </div>
                        <span className={cn("text-[7.5px] font-bold px-1.5 py-0.5 rounded border shrink-0 uppercase tracking-wide", item.badgeClass)}>
                          {item.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Carousel Indicator Dots */}
                <div className="flex items-center justify-center gap-1.5 pt-1.5">
                  {FEATURED_NEWS.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveNewsIndex(idx)}
                      className={cn(
                        "transition-all duration-300 rounded-full cursor-pointer",
                        activeNewsIndex === idx
                          ? "w-5 h-1 bg-primary shadow-sm shadow-primary/40"
                          : "w-1 h-1 bg-foreground/20 hover:bg-foreground/40"
                      )}
                      title={`Slajd ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-0.5 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-primary/45 rounded" />
                  <div className="h-3.5 w-12 bg-foreground/20 rounded-full" />
                </div>
                <div className="h-24 w-full bg-foreground/10 rounded-xl p-2.5 space-y-2">
                  <div className="flex gap-2.5">
                    <div className="w-10 h-10 bg-foreground/20 rounded-lg shrink-0" />
                    <div className="space-y-1 flex-1">
                      <div className="h-3 w-3/4 bg-foreground/20 rounded" />
                      <div className="h-2 w-full bg-foreground/15 rounded" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-6 w-full bg-foreground/10 rounded-xl" />
                  <div className="h-6 w-full bg-foreground/10 rounded-xl" />
                  <div className="h-6 w-full bg-foreground/10 rounded-xl" />
                </div>
              </div>
            )}
          </Tile>

        </div>

        {/* ── ROW 3: SZYBKA PODRÓŻ (Ostatnie Projekty) ── */}
        <div className="flex flex-col gap-2 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">
              SZYBKA PODRÓŻ
            </span>
            <button type="button" className="inline-flex items-center gap-1 text-xs text-foreground/50 hover:text-foreground transition-colors">
              <Edit2 className="w-3 h-3" />
              Edytuj
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_SHORTCUTS.map((sc) => (
              <Tile
                key={sc.id}
                intencja={sc.isAdd ? "neutralna" : "akcent"}
                elewacja="uniesiona"
                interaktywny
                className={cn(
                  "p-3 min-h-[80px] flex flex-col justify-between transition-all duration-150",
                  sc.isAdd && "border-dashed border-foreground/20 hover:border-foreground/40 flex items-center justify-center"
                )}
              >
                {sc.isAdd ? (
                  <div className="flex flex-col items-center justify-center gap-1 text-foreground/40 hover:text-foreground/70 transition-colors">
                    <Plus className="w-4 h-4 text-foreground/40" />
                    <span className="text-[11px] font-medium">{sc.title}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                        {sc.icon && <sc.icon className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground truncate mt-1">
                        {sc.title}
                      </h4>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-foreground/40 mt-0.5 block">
                        {sc.category}
                      </span>
                    </div>
                  </>
                )}
              </Tile>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
