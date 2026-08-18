import React, { useState, useEffect, useRef } from 'react'
import {
  Grid, Sparkles, MessageSquare, Terminal, Brain, ShieldAlert, Shield,
  Camera, Video, Bell, Search, Plus, ChevronRight, ChevronLeft,
  Zap, Users, Clock, Share2, MoreHorizontal, TrendingUp,
  CheckSquare, Square, ArrowUpRight, ShoppingBag, GraduationCap, Type, Receipt,
  Check, Edit2, FileText, Layers, Folder, Calendar, BarChart3,
  MonitorPlay, LayoutGrid, Navigation as NavIcon, BarChart2, Loader, Palette, Tag,
  PanelTop, PanelLeft, PanelBottom, PanelRight, Settings, GripVertical, GripHorizontal, Move,
  ToggleLeft, SlidersHorizontal, Database, BarChart, AlertCircle, Tag as TagIcon, Activity,
} from 'lucide-react'
import type { NavPosition } from '@/App'
import { cn } from '@/lib/utils'
import { NbGlassFilters } from '@/components/glass/NbGlassFilters'
import { useLiquidGlassScroll } from '@/hooks/useLiquidGlassScroll'
import { Tile, TileRow, TilePill, TileAction } from '@/components/Tile'
import { useGlass } from '@/lib/glass-context'
import { GlassActivityGrid } from '@/components/glass'
import { TINT_1, TINT_2, TINT_3, TINT_4, tintFaded } from '@/lib/chart-colors'
import { AkcjeSection } from '@/sections/AkcjeSection'
import { FormularzeSection } from '@/sections/FormularzeSection'
import { KartySection } from '@/sections/KartySection'
import { NawigacjaSection } from '@/sections/NawigacjaSection'
import { NakladkiSection } from '@/sections/NakladkiSection'
import { PaletaSection } from '@/sections/PaletaSection'
import { DaneSection } from '@/sections/DaneSection'
import { StanySection } from '@/sections/StanySection'
import { CennikSection } from '@/sections/CennikSection'
import { StudioSection } from '@/sections/StudioSection'
import { CzatSection } from '@/sections/CzatSection'


// ── Navigation Tabs with sub-items for dropdown demo ─────────────

type SubItem = { name: string; icon: React.ComponentType<{ className?: string }>; badge?: string; scrollId?: string }

const DESIGN_TABS: { key: string; label: string; icon: React.ComponentType<{ className?: string }>; items: SubItem[] }[] = [
  { key: 'preview',    label: 'Preview',    icon: MonitorPlay,  items: [] },
  { key: 'karty',      label: 'Karty',      icon: LayoutGrid,   items: [
    { name: 'Podstawowe',       icon: Square,        scrollId: 'karta' },
    { name: 'Z nagłówkiem',     icon: Layers,        scrollId: 'panel' },
    { name: 'Interaktywne',     icon: Zap,           scrollId: 'model-search' },
    { name: 'Zwarty widok',     icon: BarChart3,     scrollId: 'feature-row' },
    { name: 'Z obrazkiem',      icon: Camera,        scrollId: 'karta-media' },
    { name: 'Produktowa',       icon: ShoppingBag,   scrollId: 'karta-produkt' },
    { name: 'Profilowa',        icon: Users,         scrollId: 'karta-profil' },
  ]},
  { key: 'akcje',      label: 'Akcje',      icon: Sparkles,     items: [
    { name: 'Przyciski',        icon: Sparkles,      scrollId: 'przyciski' },
    { name: 'Tagi i pigułki',   icon: Tag,           scrollId: 'badge' },
    { name: 'Toggle',           icon: ToggleLeft,    scrollId: 'toggle' },
  ]},
  { key: 'formularze', label: 'Formularze', icon: SlidersHorizontal, items: [
    { name: 'Input / Textarea', icon: FileText,      scrollId: 'input' },
    { name: 'Select',           icon: ChevronRight,  scrollId: 'select' },
    { name: 'Checkbox / Radio', icon: CheckSquare,   scrollId: 'checkbox' },
    { name: 'Combobox',         icon: Search,        scrollId: 'combobox' },
    { name: 'Kalendarz / data', icon: Calendar,      scrollId: 'kalendarz' },
    { name: 'Stepper',          icon: ArrowUpRight,  scrollId: 'stepper' },
  ]},
  { key: 'nawigacja',  label: 'Nawigacja',  icon: NavIcon,      items: [
    { name: 'Górna',            icon: PanelTop,      scrollId: 'nav-gorna' },
    { name: 'Dolna',            icon: PanelBottom,   scrollId: 'nav-dolna' },
    { name: 'Lewa / Prawa',     icon: PanelLeft,     scrollId: 'nav-boczna' },
    { name: 'Dropdown',         icon: ChevronRight,  scrollId: 'nav-dropdown' },
    { name: 'Glass',            icon: Sparkles, badge: 'NEW', scrollId: 'nav-tabs' },
  ]},
  { key: 'nakładki',   label: 'Nakładki',   icon: PanelTop,     items: [
    { name: 'Modal / Dialog',   icon: Square,        scrollId: 'modal' },
    { name: 'Toast',            icon: Bell,          scrollId: 'toast' },
    { name: 'Tooltip',          icon: MessageSquare, scrollId: 'tooltip' },
    { name: 'Drawer',           icon: PanelRight,    scrollId: 'drawer' },
    { name: 'Paleta poleceń',   icon: Terminal,      scrollId: 'command-palette' },
  ]},
  { key: 'dane',       label: 'Dane',       icon: BarChart2,    items: [
    { name: 'Tabela',           icon: Database,      scrollId: 'tabela' },
    { name: 'Wykres liniowy',   icon: BarChart,      scrollId: 'wykres' },
    { name: 'Wykres słupkowy',  icon: BarChart3,     scrollId: 'slupkowy' },
    { name: 'Sparkline',        icon: TrendingUp,    scrollId: 'sparkline' },
    { name: 'Donut / Kołowy',   icon: BarChart3,     scrollId: 'donut' },
    { name: 'Heatmapa',         icon: Grid,          scrollId: 'heatmapa' },
    { name: 'Oś czasu',         icon: Clock,         scrollId: 'timeline' },
    { name: 'Kanał aktywności', icon: Activity,      scrollId: 'feed' },
  ]},
  { key: 'czat',       label: 'Czat',       icon: MessageSquare, items: [
    { name: 'Wątek',            icon: MessageSquare, scrollId: 'czat-watek' },
    { name: 'Bąbel',            icon: Square,        scrollId: 'czat-babel' },
    { name: 'Wskaźnik pisania', icon: MoreHorizontal, scrollId: 'czat-typing' },
    { name: 'Nagłówek',         icon: PanelTop,      scrollId: 'czat-naglowek' },
    { name: 'Pasek wpisywania', icon: Type,          scrollId: 'czat-input' },
  ]},
  { key: 'stany',      label: 'Stany',      icon: Loader,       items: [
    { name: 'Ładowanie',           icon: Loader,        scrollId: 'ladowanie' },
    { name: 'Błąd',               icon: AlertCircle,   scrollId: 'blad' },
    { name: 'Pusty widok',        icon: Square,        scrollId: 'pusty-widok' },
    { name: 'Szkielet (Skeleton)', icon: Square,        scrollId: 'szkielet' },
  ]},
  { key: 'paleta',     label: 'Paleta',     icon: Palette,      items: [
    { name: 'Kolory motywu',    icon: Palette,       scrollId: 'kolory' },
    { name: 'Typografia',       icon: Type,          scrollId: 'typografia' },
    { name: 'Ikony',            icon: Sparkles,      scrollId: 'ikony' },
    { name: 'Dostępność (a11y)', icon: Shield,       scrollId: 'a11y' },
  ]},
  { key: 'cennik',     label: 'Cennik',     icon: TagIcon,      items: [] },
  { key: 'studio',     label: 'Studio',     icon: Layers,       items: [] },
]

// ── Chart Data ────────────────────────────────────────────────────

const WEEKLY_VALS = [1200, 1850, 1540, 2180, 1920, 820, 2847]

// Paleta kategorialna zwalidowana narzędziem dataviz (CVD ΔE, kontrast,
// pasmo jasności) względem tła karty #121417 — 3 barwy jednoznacznie
// odróżnialne zamiast wariantów opacity jednego koloru, które zlewały się
// w jedną szaro-niebieską plamę. "Inne" celowo zostaje neutralnym szarym.
const DONUT_SEGMENTS = [
  { pct: 41, color: TINT_1, label: 'AI Chat', count: '1 167' },
  { pct: 28, color: TINT_2, label: 'Studio Zdęć', count: '797' },
  { pct: 19, color: TINT_3, label: 'Prompty', count: '541' },
  { pct: 12, color: TINT_4, label: 'Inne', count: '342' },
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

// Donut jako pojedynczy conic-gradient zamiast wielu okręgów SVG na
// stroke-dasharray — ten drugi podejście zawsze zostawia szew (linię)
// na styku dwóch segmentów przez anti-aliasing niezależnych kształtów.
// conic-gradient to jeden gradient, więc granica koloru jest idealnie
// czysta. Udziały sumują się do 100%, więc koło jest w pełni wypełnione
// dookoła — bez pustego "gauge" wycinka na dole.
function DonutChart({ size = 135, thickness = 16 }: { size?: number; thickness?: number }) {
  const top = DONUT_SEGMENTS[0]
  let acc = 0
  const stops = DONUT_SEGMENTS
    .map((seg) => {
      const start = acc
      acc += seg.pct
      return `${seg.color} ${start}% ${acc}%`
    })
    .join(', ')
  const inner = size / 2 - thickness
  const maskImg = `radial-gradient(circle, transparent ${inner}px, black ${inner + 1}px)`

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 -z-10 rounded-full blur-2xl opacity-20"
        style={{ backgroundColor: top.color }}
      />
      <div
        className="absolute inset-0 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
        style={{
          background: `conic-gradient(${stops})`,
          WebkitMask: maskImg,
          mask: maskImg,
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="nb-liczby text-2xl font-extrabold leading-none tracking-tight"
          style={{ color: top.color }}
        >
          {top.pct}%
        </span>
        <span className="mt-1 text-[10px] font-semibold text-foreground/55 uppercase tracking-wide">
          {top.label}
        </span>
      </div>
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
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
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
    gradient: 'from-primary/30 via-sky-600/25 to-blue-600/20',
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
    shortcut: '⌘1',
    icon: MessageSquare,
    isAdd: false,
  },
  {
    id: 2,
    title: 'Kalendarz wydatków',
    category: 'PLATFORMA',
    shortcut: '⌘2',
    icon: Calendar,
    isAdd: false,
  },
  {
    id: 3,
    title: 'Studio Zdęć v2.1',
    category: 'STUDIO',
    shortcut: '⌘3',
    icon: Camera,
    isAdd: false,
  },
  {
    id: 4,
    title: 'Prompty AI Master',
    category: 'PROMPTY',
    shortcut: '⌘4',
    icon: Terminal,
    isAdd: false,
  },
  { id: 5, title: 'Dodaj skrót', category: '', shortcut: '+', icon: null, isAdd: true },
  { id: 6, title: 'Dodaj skrót', category: '', shortcut: '+', icon: null, isAdd: true },
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
  onToggleSettings?: () => void
  activeTab?: string
  navPosition?: NavPosition
  onNavPositionChange?: (pos: NavPosition) => void
}

function renderSection(key: string): React.ReactNode {
  switch (key) {
    case 'karty':      return <KartySection />
    case 'akcje':      return <AkcjeSection />
    case 'formularze': return <FormularzeSection />
    case 'nawigacja':  return <NawigacjaSection />
    case 'nakładki':   return <NakladkiSection />
    case 'dane':       return <DaneSection />
    case 'stany':      return <StanySection />
    case 'paleta':     return <PaletaSection />
    case 'cennik':     return <CennikSection />
    case 'studio':     return <StudioSection />
    case 'czat':       return <CzatSection />
    default:           return null
  }
}

export function PreviewSection({ onSelectTab, onToggleSettings, activeTab = 'preview', navPosition = 'top', onNavPositionChange }: PreviewSectionProps) {
  const { showContent, isGlass } = useGlass()
  const [activeSection, setActiveSection] = useState('preview')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [flyoutY, setFlyoutY] = useState(0)
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
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [menuPos, setMenuPos] = useState<{ left: number; top?: number; bottom?: number }>({ left: 0 })
  const sidebarTabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [sidebarMenuTop, setSidebarMenuTop] = useState(16)
  useLiquidGlassScroll(mainRef)

  // ── Drag & Drop Navbar Docking System ──
  const [isDraggingNav, setIsDraggingNav] = useState(false)
  const [dragCoords, setDragCoords] = useState<{ x: number; y: number } | null>(null)
  const [targetDock, setTargetDock] = useState<NavPosition | null>(null)

  const handleDragStart = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingNav(true)
    setDragCoords({ x: e.clientX, y: e.clientY })

    const handlePointerMove = (moveEv: PointerEvent) => {
      const x = moveEv.clientX
      const y = moveEv.clientY
      setDragCoords({ x, y })

      const w = window.innerWidth
      const h = window.innerHeight

      let dock: NavPosition = navPosition
      if (x < w * 0.22) {
        dock = 'left'
      } else if (x > w * 0.78) {
        dock = 'right'
      } else if (y > h * 0.78) {
        dock = 'bottom'
      } else if (y < h * 0.22) {
        dock = 'top'
      } else {
        const dLeft = x
        const dRight = w - x
        const dTop = y
        const dBottom = h - y
        const minDist = Math.min(dLeft, dRight, dTop, dBottom)

        if (minDist === dLeft) dock = 'left'
        else if (minDist === dRight) dock = 'right'
        else if (minDist === dTop) dock = 'top'
        else dock = 'bottom'
      }
      setTargetDock(dock)
    }

    const handlePointerUp = (upEv: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)

      const x = upEv.clientX
      const y = upEv.clientY
      const w = window.innerWidth
      const h = window.innerHeight

      let finalPos: NavPosition = navPosition
      if (x < w * 0.25) finalPos = 'left'
      else if (x > w * 0.75) finalPos = 'right'
      else if (y > h * 0.75) finalPos = 'bottom'
      else if (y < h * 0.25) finalPos = 'top'

      onNavPositionChange?.(finalPos)
      setIsDraggingNav(false)
      setDragCoords(null)
      setTargetDock(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

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
  // HorizontalNav dropdown musi renderować się POZA <header nb-szklo> —
  // `contain: layout paint` na kafelkach glass obcina malowanie potomków
  // do granic headera, więc dropdown zagnieżdżony w środku znika, gdy
  // wychodzi poza jego dolną krawędź (mimo z-50). Renderujemy go jako
  // rodzeństwo headera i pozycjonujemy ręcznie zmierzonym offsetem.
  const openHorizontalMenu = (key: string | null) => {
    if (key && navRef.current && tabRefs.current[key]) {
      const btnRect = tabRefs.current[key]!.getBoundingClientRect()
      const navRect = navRef.current.getBoundingClientRect()
      setMenuPos(
        navPosition === 'bottom'
          ? { left: btnRect.left - navRect.left, bottom: navRect.bottom - btnRect.top + 8 }
          : { left: btnRect.left - navRect.left, top: btnRect.bottom - navRect.top + 8 },
      )
    }
    openMenuDelayed(key)
  }
  // Flyout w SidebarNav ma się wysuwać od zaznaczonej ikony, nie zawsze
  // od góry paska — mierzymy pozycję zahoverowanej ikony względem navRef.
  const openSidebarMenu = (key: string | null) => {
    if (key && navRef.current && sidebarTabRefs.current[key]) {
      const btnRect = sidebarTabRefs.current[key]!.getBoundingClientRect()
      const navRect = navRef.current.getBoundingClientRect()
      setSidebarMenuTop(btnRect.top - navRect.top)
    }
    openMenuDelayed(key)
  }
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const openSection = DESIGN_TABS.find(s => s.key === openMenu)
  const megaItems = openSection?.items ?? []

  const isSidebar = navPosition === 'left' || navPosition === 'right'

  // ── Shared horizontal controls (settings, Aa, search, bell, avatar) ──
  const NavControls = () => (
    <div className="flex items-center gap-1.5 shrink-0 pl-2">
      <button
        onClick={onToggleSettings}
        title="Ustawienia wyglądu"
        className="flex items-center gap-1 px-2 h-7 rounded-full text-[11px] font-semibold transition-all duration-200 bg-foreground/[0.05] text-foreground/45 hover:text-foreground hover:bg-foreground/[0.10]"
      >
        <Settings className="w-3 h-3 shrink-0" />
        {showContent ? <span className="hidden sm:inline">Ustawienia</span> : <div className="h-1.5 w-8 bg-foreground/25 rounded-full" />}
      </button>
      <button
        onClick={() => setNavCompact(!navCompact)}
        title={navCompact ? 'Pokaż etykiety' : 'Ukryj etykiety'}
        className={cn(
          'flex items-center gap-1 px-2 h-7 rounded-full text-[11px] font-semibold transition-all duration-200',
          navCompact ? 'bg-primary/[0.15] text-primary' : 'bg-foreground/[0.05] text-foreground/45 hover:text-foreground hover:bg-foreground/[0.10]',
        )}
      >
        <Type className="w-3 h-3 shrink-0" />
        {!navCompact && (showContent ? <span>Aa</span> : <div className="h-1.5 w-3 bg-foreground/25 rounded-full" />)}
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
  )

  // ── Horizontal navbar (top / bottom) ─────────────────────────────
  const HorizontalNav = () => (
    <div
      ref={navRef}
      // z-40 na całym kontenerze (nie tylko na dropdownie) — nb-szklo ma
      // `isolation: isolate`, więc header tworzy własny kontekst
      // stackowania. Bez z-index tutaj <main> (idący w DOM później)
      // renderuje się nad dropdownem mimo jego z-50 w środku.
      className={cn('relative z-40 px-4 lg:px-5 shrink-0', navPosition === 'bottom' ? 'pt-2 pb-4' : 'pt-4 pb-2')}
      onMouseLeave={scheduleClose}
    >
      <header className={cn(
        isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
        'flex items-center gap-2 px-4 h-12 rounded-2xl border shadow-lg backdrop-blur-md',
      )}>
        <div className="flex items-center gap-1.5 shrink-0 pr-2">
          <button
            type="button"
            onPointerDown={handleDragStart}
            title="Złap i przeciągnij, aby przypiąć nawigację (góra / dół / lewo / prawo)"
            className="flex items-center justify-center w-6 h-6 rounded-lg text-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors cursor-grab active:cursor-grabbing shrink-0 -ml-1"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <div className="w-7 h-7 rounded-[8px] bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <Zap className="w-3.5 h-3.5 text-background" />
          </div>
          {!navCompact && (showContent
            ? <span className="text-[13px] font-bold text-foreground tracking-tight">NextByte</span>
            : <div className="h-3 w-14 bg-foreground/25 rounded-full" />
          )}
        </div>

        <nav className="flex-1 flex items-center justify-center gap-0.5">
          {DESIGN_TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const isOpen = openMenu === tab.key
            const hasItems = tab.items.length > 0
            return (
              <div key={tab.key} className="relative" ref={(el) => { tabRefs.current[tab.key] = el }}>
                <button
                  onClick={() => { setActiveSection(tab.key); onSelectTab?.(tab.key); openHorizontalMenu(isOpen ? null : hasItems ? tab.key : null) }}
                  onMouseEnter={() => openHorizontalMenu(hasItems ? tab.key : null)}
                  className={cn(
                    'flex items-center rounded-full text-[12px] font-medium transition-all duration-150 whitespace-nowrap',
                    navCompact ? 'px-2.5 py-2' : 'gap-1.5 px-3 py-1.5',
                    isActive || isOpen
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm shadow-primary/10'
                      : 'text-foreground/55 hover:text-foreground hover:bg-foreground/[0.06] border border-transparent',
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5 shrink-0" />
                  {!navCompact && (showContent ? <span>{tab.label}</span> : <div className="h-2 w-9 bg-foreground/25 rounded-full" />)}
                  {!navCompact && hasItems && (
                    <ChevronRight className={cn('w-2.5 h-2.5 shrink-0 transition-transform duration-200', isOpen ? 'rotate-90' : 'opacity-40')} />
                  )}
                </button>
              </div>
            )
          })}
        </nav>

        <NavControls/>
      </header>

      {/* Dropdown — rodzeństwo <header>, nie dziecko, żeby uciec spod
          `contain: layout paint` (patrz komentarz przy openHorizontalMenu). */}
      {openMenu && megaItems.length > 0 && (
        <div
          className="absolute z-50 min-w-[190px]"
          style={{ left: menuPos.left, top: menuPos.top, bottom: menuPos.bottom }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className={cn(
            isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
            'p-1.5 rounded-2xl border flex flex-col gap-0.5',
            'animate-in fade-in-0 zoom-in-[0.98] duration-150',
            navPosition === 'bottom' ? 'slide-in-from-bottom-1' : 'slide-in-from-top-1',
          )}>
            {megaItems.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelectTab?.(openMenu!)
                  openMenuDelayed(null)
                  if (item.scrollId) {
                    setTimeout(() => {
                      document.getElementById(item.scrollId!)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }, 120)
                  }
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-150 whitespace-nowrap w-full text-left text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] border border-transparent hover:border-foreground/[0.08]"
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                {showContent ? <span>{item.name}</span> : <div className="h-2 w-14 bg-foreground/25 rounded-full" />}
                {showContent && item.badge && (
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-primary/20 text-primary">{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ── Vertical sidebar (left / right) — połączony navbar w jedną ciągłą linię z unormowanym spacingiem ──
  const SidebarNav = () => (
    <div
      ref={navRef}
      onMouseLeave={scheduleClose}
      // z-40 na całym kontenerze — patrz komentarz w HorizontalNav:
      // bez tego <main> renderuje się nad flyoutem mimo jego z-50 w środku.
      className={cn(
        'shrink-0 flex flex-col py-4 relative z-40 h-full',
        navPosition === 'right' ? 'pr-4 pl-2' : 'pl-4 pr-2',
      )}
    >
      {/* Pojedyncza, spójna linia nawigacyjna od góry do dołu */}
      <div className={cn(
        isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
        'rounded-2xl border w-12 h-full flex flex-col items-center justify-between py-3 px-2 shadow-xl backdrop-blur-md',
      )}>
        {/* Górny sekcja: Logo i Zakładki */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          <button
            type="button"
            onPointerDown={handleDragStart}
            title="Złap i przeciągnij, aby przypiąć nawigację (góra / dół / lewo / prawo)"
            className="flex items-center justify-center w-6 h-6 rounded-lg text-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors cursor-grab active:cursor-grabbing shrink-0 mb-0.5"
          >
            <GripHorizontal className="w-3.5 h-3.5" />
          </button>
          <div className="w-7 h-7 rounded-[8px] bg-primary flex items-center justify-center shadow-md shadow-primary/30 shrink-0 mb-1">
            <Zap className="w-3.5 h-3.5 text-background" />
          </div>

          <div className="w-full border-t border-white/[0.08] mb-1 shrink-0" />

          <nav className="flex flex-col items-center gap-1.5 w-full">
            {DESIGN_TABS.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  ref={(el) => { sidebarTabRefs.current[tab.key] = el }}
                  title={tab.label}
                  onClick={() => { setActiveSection(tab.key); onSelectTab?.(tab.key) }}
                  onMouseEnter={() => openSidebarMenu(tab.items.length > 0 ? tab.key : null)}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150',
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm shadow-primary/10'
                      : 'text-foreground/50 hover:text-foreground hover:bg-foreground/[0.06] border border-transparent',
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5 shrink-0" />
                </button>
              )
            })}
          </nav>
        </div>

        {/* Dolna sekcja: Kontrolki systemowe i profil (taki sam spacing góra-dół) */}
        <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t border-white/[0.08] shrink-0">
          <button
            title="Ustawienia"
            onClick={onToggleSettings}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-transparent hover:border-foreground/10 hover:bg-foreground/[0.06] hover:text-foreground text-foreground/45 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl border border-transparent hover:border-foreground/10 hover:bg-foreground/[0.06] transition-all text-foreground/45 hover:text-foreground">
            <Search className="w-3.5 h-3.5" />
          </button>
          <button className="relative w-8 h-8 flex items-center justify-center rounded-xl border border-transparent hover:border-foreground/10 hover:bg-foreground/[0.06] transition-all text-foreground/45 hover:text-foreground">
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary ring-1 ring-background" />
          </button>
          <div className="w-7 h-7 rounded-full bg-primary/25 flex items-center justify-center border border-primary/40 text-[10px] font-bold text-primary shrink-0 mt-0.5">
            AB
          </div>
        </div>
      </div>

      {/* Sidebar flyout panel — wysuwa się od zaznaczonej ikony (sidebarMenuTop),
          nie zawsze od góry paska. */}
      {megaItems.length > 0 && (
        <div
          className={cn(
            'absolute z-50',
            navPosition === 'left' ? 'left-full ml-1' : 'right-full mr-1',
          )}
          style={{ top: sidebarMenuTop }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className={cn(
            isGlass ? 'nb-szklo nb-szklo-plynne nb-powierzchnia' : 'border border-border bg-card',
            'p-2 rounded-2xl border flex flex-col gap-0.5 min-w-[168px]',
          )}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-2.5 pb-1 pt-0.5">
              {openSection?.label}
            </div>
            <div className="w-full border-t border-foreground/[0.06] mb-1" />
            {megaItems.map((item, i) => (
              <button
                key={i}
                onClick={() => { onSelectTab?.(openMenu!); openMenuDelayed(null) }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-150 whitespace-nowrap w-full text-left text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] border border-transparent hover:border-foreground/[0.08]"
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                {showContent ? <span>{item.name}</span> : <div className="h-2 w-14 bg-foreground/25 rounded-full" />}
                {showContent && item.badge && (
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-primary/20 text-primary">{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div
      className={cn(
        'relative w-full h-screen font-sans antialiased overflow-hidden bg-transparent',
        isSidebar ? 'flex flex-row' : 'flex flex-col',
        navPosition === 'right' && 'flex-row-reverse',
      )}
      style={{ zIndex: 1 }}
    >
      <NbGlassFilters />

      {/* ── Navbar — pozycja zależna od navPosition ── */}
      {isSidebar ? <SidebarNav /> : navPosition === 'bottom'
        ? null  /* bottom: renderowany po <main> */
        : <HorizontalNav />
      }

      {/* ── Main Workspace ── */}
      <main ref={mainRef} className={cn(
        'flex-1 min-w-0 overflow-y-auto flex flex-col',
        activeTab !== 'preview'
          ? 'p-6 w-full'
          : cn('px-4 lg:px-5 pb-4 flex flex-col justify-between flex-1 min-h-0', isSidebar || navPosition === 'bottom' ? 'pt-4' : 'pt-0'),
      )}>

        {/* ── Non-preview section content ── */}
        {activeTab !== 'preview' && renderSection(activeTab)}

        {/* ══ TOP BANNER: UNIFIED SINGLE TILE (SALDO BYTE & TIMELINE) ══ */}
        {activeTab === 'preview' && <>


        <Tile intencja="akcent" elewacja="uniesiona" className="py-2.5 px-3 md:px-4 border-white/[0.06] bg-card/40 transition-[box-shadow,border-color,background-color] duration-200">

          <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-5">

            {/* Column 1: Saldo Byte Amount */}
            <div className="min-w-0 shrink-0 flex items-center gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Saldo Byte</p>
                <p className="mt-0.5 text-xl font-bold leading-none tabular-nums text-foreground flex items-center">
                  {showContent
                    ? <>{`4 820`}<span className="ml-1 text-sm text-primary font-normal">⟠</span></>
                    : <span className="h-5 w-16 bg-foreground/25 rounded-md inline-block animate-pulse" />
                  }
                </p>
              </div>
              {showContent && (
                <button type="button" aria-label="Wersja platformy Beta 4.0.0" className="inline-flex rounded-full outline-none">
                  <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-semibold uppercase tracking-wide border-primary/30 bg-primary/10 text-primary h-4 gap-1 px-1.5 text-[9px]">
                    Beta 4.0.0
                  </span>
                </button>
              )}
            </div>

            {/* Vertical Separator */}
            <span className="hidden w-px self-stretch bg-white/[0.08] md:block" aria-hidden="true" />

            {/* Column 2: Saldo Byte Timeline & Solid Single-Color Line */}
            <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
              {/* Date timeline + Range buttons — above the bar as scale */}
              <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                {showContent ? (
                  <span className="flex flex-1 items-center justify-between tabular-nums">
                    <span>09.08</span>
                    <span className="hidden sm:inline">12.08</span>
                    <span>dziś</span>
                  </span>
                ) : (
                  <span className="flex flex-1 items-center justify-between">
                    <div className="h-2 w-8 bg-foreground/20 rounded-full" />
                    <div className="h-2 w-8 bg-foreground/20 rounded-full hidden sm:block" />
                    <div className="h-2 w-6 bg-foreground/20 rounded-full" />
                  </span>
                )}
                <span className="hidden sm:flex ml-2">
                  <span className="flex shrink-0 items-center gap-0.5">
                    <button type="button" className="rounded-md px-1.5 py-0.5 text-[9px] tabular-nums transition-colors bg-primary/15 text-primary font-semibold">7d</button>
                    <button type="button" className="rounded-md px-1.5 py-0.5 text-[9px] tabular-nums transition-colors text-muted-foreground hover:text-foreground">30d</button>
                    <button type="button" className="rounded-md px-1.5 py-0.5 text-[9px] tabular-nums transition-colors text-muted-foreground hover:text-foreground">90d</button>
                  </span>
                </span>
              </div>

              {/* Solid Single-Color Progress Line */}
              <div className="w-full h-1 bg-foreground/10 rounded-full relative overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[78%] shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
              </div>

              {/* Subtext */}
              {showContent ? (
                <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-muted-foreground/70">
                  Współczynnik zużycia w normie • Zużyto 180 BYTE w ostatnich 7 dniach
                </p>
              ) : (
                <div className="mt-0.5 h-2.5 w-56 bg-foreground/15 rounded-full" />
              )}
            </div>

            {/* Column 3: Action Buttons (Far Right) */}
            <div className="grid w-full shrink-0 grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-row">
              <button
                type="button"
                className="rounded-lg inline-flex items-center gap-1 border text-xs font-semibold px-3 border-foreground/15 bg-white/[0.05] hover:bg-white/[0.1] text-foreground transition-colors duration-200 h-8 w-full justify-center sm:h-7.5 sm:w-auto"
              >
                <Plus className="h-3 w-3 shrink-0 text-primary" />
                {showContent ? 'Doładuj' : <div className="h-2 w-10 bg-foreground/25 rounded-full" />}
              </button>
              <button
                type="button"
                className="rounded-lg inline-flex items-center gap-1 border text-xs font-semibold px-3 border-white/[0.08] hover:border-white/[0.15] text-muted-foreground hover:text-foreground transition-colors duration-200 h-8 w-full justify-center sm:h-7.5 sm:w-auto"
              >
                <Receipt className="h-3 w-3 shrink-0" />
                {showContent ? 'Wydatki' : <div className="h-2 w-10 bg-foreground/25 rounded-full" />}
              </button>
            </div>

          </div>
        </Tile>

        {/* Global Search Input Bar */}
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

        {/* ── MIDDLE SECTION: 3 EQUAL COLUMNS (33% / 33% / 33%) - OPTION 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch min-w-0">

          {/* COLUMN 1 (33%): NOWOŚCI + Lista Zadań */}
          <div className="flex flex-col gap-3 h-full min-w-0">

            {/* Card 1: NOWOŚCI (Top Left) */}
            <Tile intencja="akcent" elewacja="uniesiona" className="p-3.5 flex flex-col justify-between border-white/[0.06] bg-card/40">
              {showContent ? (
                <div className="flex flex-col gap-2.5">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
                      NOWOŚCI
                    </h3>
                    <TilePill intencja="akcent" className="border-primary/30 bg-primary/15 text-primary text-[9px] font-bold">
                      4 NOWE
                    </TilePill>
                  </div>

                  {/* Featured News Card Banner (Horizontal Layout matching Screenshot 1) */}
                  {(() => {
                    const news = FEATURED_NEWS[activeNewsIndex] || FEATURED_NEWS[0]
                    const NewsIcon = news.icon
                    return (
                      <div className="p-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.05] transition-all flex items-center gap-3 group shadow-sm">
                        {/* Left Side: Thumbnail Preview Image */}
                        <div className={cn("w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br border border-white/15 shrink-0 flex items-center justify-center relative overflow-hidden shadow-md group-hover:scale-[1.02] transition-transform duration-200", news.gradient)}>
                          <NewsIcon className="w-7 h-7 text-primary relative z-10 group-hover:scale-110 transition-transform duration-200" />
                          <div className="absolute inset-0 bg-primary/20 blur-md" />
                          <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/65 backdrop-blur border border-white/10 text-[7px] font-bold text-white uppercase tracking-wider">
                            {news.tag}
                          </div>
                        </div>

                        {/* Right Side: Text & Action Link */}
                        <div className="flex flex-col gap-1 min-w-0 flex-1 justify-center">
                          <h4 className="text-xs sm:text-[12.5px] font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {news.title}
                          </h4>
                          <p className="text-[9.5px] text-foreground/60 leading-relaxed line-clamp-2">
                            {news.desc}
                          </p>
                          <button type="button" className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 mt-0.5">
                            {news.linkText} <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Bottom Carousel Indicator Dots */}
                  <div className="flex items-center justify-center gap-1.5 pt-1">
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
                <div className="space-y-2 p-1 animate-pulse">
                  <div className="h-4 w-24 bg-primary/45 rounded" />
                  <div className="h-20 w-full bg-foreground/15 rounded-xl" />
                </div>
              )}
            </Tile>

            {/* Card 2: Lista Zadań (Bottom Left) */}
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
                    <TilePill intencja="neutralna" className="border-white/10 bg-white/5 text-[9px] shrink-0">6 SESJI</TilePill>
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

                  {/* Recent Items List - 6 Items packed tightly */}
                  <div className="flex flex-col gap-1.5">
                    {RECENT_ITEMS.slice(0, 6).map((item) => (
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
                  {Array.from({ length: 6 }).map((_, i) => (
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

          {/* COLUMN 3 (33%): GRAND STATISTICS & ACTIVITY HUB (Donut Chart + Activity Heatmap Grid + Hero Metrics) */}
          <Tile intencja="akcent" elewacja="uniesiona" className="p-3.5 flex flex-col justify-between min-w-0 border-white/[0.06] bg-card/40 h-full">
            {showContent ? (
              <div className="flex flex-col justify-between h-full gap-2.5">
                {/* Header Row matching Screenshot 3 */}
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <BarChart3 className="w-3.5 h-3.5 text-primary shrink-0" />
                      Przegląd Statystyk
                    </h3>
                    <p className="text-[10px] text-foreground/50 font-medium leading-tight">Aktywność konta NextByte</p>
                  </div>
                  <TilePill intencja="akcent" className="border-primary/20 bg-primary/10 text-[9px] font-bold">
                    342 AKCJI
                  </TilePill>
                </div>

                {/* Big Metric Section matching Screenshot 3: 2 847 Wygenerowane zapytania (+24%) */}
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-extrabold text-foreground tracking-tight">2 847</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shadow-sm">
                      <TrendingUp className="w-2.5 h-2.5" /> +24%
                      <span className="text-[9px] text-foreground/50 font-normal">vs zeszły tydzień</span>
                    </span>
                  </div>
                  <p className="text-[10.5px] text-foreground/60 font-medium">Wygenerowane zapytania</p>
                </div>

                {/* Section A: Split 2-Column Layout (Left: Enlarged Donut Ring, Right: Responsive Percentage Pills) */}
                <div className="flex items-center justify-between gap-3 py-1 min-w-0">
                  {/* Left Side: Enlarged Centered Donut Chart Ring */}
                  <div className="flex-1 flex items-center justify-center">
                    <DonutChart size={140} />
                  </div>

                  {/* Right Side: Responsive Percentage Pills matching Theme Colors */}
                  <div className="flex flex-col gap-1.5 w-[140px] shrink-0">
                    {DONUT_SEGMENTS.map((seg, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-2.5 py-1 rounded-full border text-xs transition-all duration-200 hover:brightness-110 shadow-sm"
                        style={{
                          borderColor: tintFaded(seg.color, 30),
                          backgroundColor: tintFaded(seg.color, 8),
                        }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: seg.color, boxShadow: `0 0 6px ${tintFaded(seg.color, 70)}` }}
                          />
                          <span className="text-foreground/90 font-medium text-[10px] truncate">{seg.label}</span>
                        </div>
                        <span
                          className="font-bold text-[10.5px] shrink-0 ml-1"
                          style={{ color: seg.color }}
                        >
                          {seg.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section B: Thin Horizontal Divider Line */}
                <div className="w-full border-t border-white/[0.06]" />

                {/* Section C: GlassActivityGrid (Full Size Heatmap Matrix filling lower card) */}
                <div className="w-full flex items-center justify-center overflow-hidden py-0.5">
                  <GlassActivityGrid
                    weeksCount={18}
                    showContent={showContent}
                    showSummary={false}
                    showStreaks={false}
                    compact={false}
                    hideHeader={true}
                  />
                </div>

                {/* Bottom Status Pills Row matching Screenshot 3 */}
                <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-white/[0.06]">
                  <div className="flex items-center justify-center px-1.5 py-1 rounded-lg border border-white/[0.06] bg-foreground/[0.03] text-[9.5px] text-foreground/70">
                    <span className="font-bold text-primary mr-1">v4.0</span> Wersja
                  </div>
                  <div className="flex items-center justify-center px-1.5 py-1 rounded-lg border border-white/[0.06] bg-foreground/[0.03] text-[9.5px] text-foreground/70">
                    <span className="font-bold text-emerald-400 mr-1">99.8%</span> Uptime
                  </div>
                  <div className="flex items-center justify-center px-1.5 py-1 rounded-lg border border-white/[0.06] bg-foreground/[0.03] text-[9.5px] text-foreground/70">
                    <span className="font-bold text-amber-400 mr-1">0 Byte</span> Zużycie
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-0.5 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-36 bg-primary/45 rounded" />
                  <div className="h-3.5 w-12 bg-foreground/20 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-3 items-center py-1">
                  <div className="w-20 h-20 rounded-full border-4 border-foreground/15 justify-self-center shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full bg-foreground/15 rounded" />
                    <div className="h-2.5 w-4/5 bg-foreground/15 rounded" />
                    <div className="h-2.5 w-3/4 bg-foreground/15 rounded" />
                  </div>
                </div>
                <div className="h-20 w-full bg-foreground/10 rounded-xl" />
              </div>
            )}
          </Tile>

        </div>

        {/* ── ROW 3: SZYBKA PODRÓŻ (Ostatnie Projekty & Skróty) ── */}
        <div className="flex flex-col gap-2 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-primary" />
              {showContent ? 'SZYBKA PODRÓŻ' : <div className="h-2.5 w-24 bg-foreground/25 rounded-full" />}
            </span>
            {showContent && (
              <button type="button" className="inline-flex items-center gap-1 text-xs text-foreground/50 hover:text-foreground transition-colors">
                <Edit2 className="w-3 h-3" />
                Edytuj skróty
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_SHORTCUTS.map((sc) => (
              <Tile
                key={sc.id}
                intencja={sc.isAdd ? "neutralna" : "akcent"}
                elewacja="uniesiona"
                interaktywny
                className={cn(
                  "p-3 min-h-[92px] flex flex-col justify-between transition-all duration-150 group",
                  sc.isAdd && "border-dashed border-foreground/20 hover:border-primary/50 hover:bg-primary/[0.02] flex items-center justify-center"
                )}
              >
                {sc.isAdd ? (
                  <div className="flex flex-col items-center justify-center gap-1 text-foreground/40 group-hover:text-primary transition-colors">
                    <Plus className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                    {showContent && <span className="text-[11px] font-medium">{sc.title}</span>}
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        {sc.icon && <sc.icon className="w-3.5 h-3.5" />}
                      </div>
                      {showContent && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-foreground/50 font-bold">
                          {sc.shortcut}
                        </span>
                      )}
                    </div>
                    <div>
                      {showContent ? (
                        <>
                          <h4 className="text-xs font-bold text-foreground truncate mt-1 group-hover:text-primary transition-colors">
                            {sc.title}
                          </h4>
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-foreground/40 mt-0.5 block">
                            {sc.category}
                          </span>
                        </>
                      ) : (
                        <div className="space-y-1.5 mt-1">
                          <div className="h-2.5 w-full bg-foreground/20 rounded-full" />
                          <div className="h-2 w-10 bg-foreground/15 rounded-full" />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Tile>
            ))}
          </div>
        </div>

        </> /* end activeTab === 'preview' */}

      </main>

      {/* Bottom navbar — renderowany po <main> żeby był na dole */}
      {!isSidebar && navPosition === 'bottom' && <HorizontalNav />}

      {/* ── DRAG TO DOCK OVERLAY ZONES ── */}
      {isDraggingNav && (
        <div className="fixed inset-0 z-[9999] pointer-events-none bg-background/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in-0">
          {/* Top Dock Zone */}
          <div className={cn(
            'fixed top-3 inset-x-12 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all duration-200',
            targetDock === 'top'
              ? 'bg-primary/25 border-primary text-primary shadow-[0_0_40px_hsl(var(--primary)/0.6)] scale-[1.01]'
              : 'bg-card/40 border-border/80 text-muted-foreground/60'
          )}>
            <PanelTop className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Upuść tutaj — Przypnij na górze</span>
          </div>

          {/* Bottom Dock Zone */}
          <div className={cn(
            'fixed bottom-3 inset-x-12 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all duration-200',
            targetDock === 'bottom'
              ? 'bg-primary/25 border-primary text-primary shadow-[0_0_40px_hsl(var(--primary)/0.6)] scale-[1.01]'
              : 'bg-card/40 border-border/80 text-muted-foreground/60'
          )}>
            <PanelBottom className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Upuść tutaj — Przypnij na dole</span>
          </div>

          {/* Left Dock Zone */}
          <div className={cn(
            'fixed left-3 inset-y-12 w-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200',
            targetDock === 'left'
              ? 'bg-primary/25 border-primary text-primary shadow-[0_0_40px_hsl(var(--primary)/0.6)] scale-[1.01]'
              : 'bg-card/40 border-border/80 text-muted-foreground/60'
          )}>
            <PanelLeft className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-center px-1">Przypnij po lewej</span>
          </div>

          {/* Right Dock Zone */}
          <div className={cn(
            'fixed right-3 inset-y-12 w-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200',
            targetDock === 'right'
              ? 'bg-primary/25 border-primary text-primary shadow-[0_0_40px_hsl(var(--primary)/0.6)] scale-[1.01]'
              : 'bg-card/40 border-border/80 text-muted-foreground/60'
          )}>
            <PanelRight className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-center px-1">Przypnij po prawej</span>
          </div>

          {/* Ghost preview cursor tracker */}
          {dragCoords && (
            <div
              className="fixed pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-4 h-11 rounded-2xl bg-card/95 border-2 border-primary shadow-[0_0_35px_hsl(var(--primary)/0.6)] text-primary font-bold text-xs backdrop-blur-2xl animate-pulse"
              style={{ left: dragCoords.x, top: dragCoords.y }}
            >
              <Zap className="w-4 h-4 text-primary" />
              <span>Nawigacja NextByte</span>
              <span className="text-[10px] opacity-75 uppercase">({targetDock ?? 'PRZECIĄGAJ'})</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
