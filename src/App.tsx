import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, Zap, AlertTriangle, Star, Settings, Trash2,
  Eye, Download, Bell, Package, Users, TrendingUp, Activity,
  Search, Mail, Lock, Globe, ChevronRight, BarChart3, FileText,
  Calendar, BookOpen, Layers, ShoppingBag, Shield, Cpu, Video,
  MessageSquare, Flame, Award, Copy, Check, Filter, RefreshCw
} from 'lucide-react';

// Import helpers
import { cn } from '@/lib/utils';

// Import NextByte modular UI component libraries
import {
  Button,
  Badge,
  Input,
  Textarea,
  InputGroup,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  Separator,
  Avatar,
  AvatarGroup,
  Skeleton,
  SkeletonText,
  SkeletonTile,
  Toaster,
  useToast,
  MetricBar
} from '@/lib/core';

import {
  Panel,
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarUserBar,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption
} from '@/lib/layout';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from '@/lib/layout/dropdown-menu';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/lib/layout/popover';

import {
  Sparkline,
  StatCard,
  ActivityFeed,
  AlertCard,
  Tile,
  TileHeader,
  TileRow,
  TilePill,
  TileAction,
  TileFooter
} from '@/lib/analytics';

import {
  BackgroundGrid,
  BackgroundDots,
  BackgroundPlus,
  PatternBackground,
  TechGrid,
  CommandSearch,
  QuickNav,
  ModelSearch,
  type Model
} from '@/lib/patterns';

/* ── Konwertery kolorów dla własnego motywu ────────────────── */
function hexToTailwindHsl(hex: string): string {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}

function tailwindHslToHex(hslStr: string): string {
  const parts = hslStr.trim().split(/\s+/);
  if (parts.length < 3) return '#000000';
  let h = parseFloat(parts[0]);
  let s = parseFloat(parts[1].replace('%', '')) / 100;
  let l = parseFloat(parts[2].replace('%', '')) / 100;

  h = h % 360;
  if (isNaN(h)) h = 0;
  if (isNaN(s)) s = 0;
  if (isNaN(l)) l = 0;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const ri = Math.round((r + m) * 255);
  const gi = Math.round((g + m) * 255);
  const bi = Math.round((b + m) * 255);

  const hexVal = ((ri << 16) + (gi << 8) + bi).toString(16).padStart(6, '0');
  return `#${hexVal}`;
}

/* ── Podgląd zastosowania zmiennych w makiecie ──────────────── */
function renderVariablePreview(varName: string) {
  switch (varName) {
    case '--background':
    case '--foreground':
      return (
        <div className="rounded-lg p-2 text-[10px] text-center border border-border mt-1 transition-all" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
          Tekst na tle strony
        </div>
      );
    case '--card':
    case '--card-foreground':
      return (
        <div className="rounded-lg p-2 text-[10px] text-center border border-border mt-1 transition-all" style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}>
          Karta informacyjna
        </div>
      );
    case '--popover':
    case '--popover-foreground':
      return (
        <div className="rounded-lg p-2 text-[10px] text-center border border-border shadow-md mt-1 transition-all" style={{ backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}>
          Menu popover / dymek
        </div>
      );
    case '--primary':
    case '--primary-foreground':
      return (
        <div className="rounded-lg px-2.5 py-1 text-xs font-bold text-center border border-primary/20 mt-1 transition-all" style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
          Przycisk główny (Primary)
        </div>
      );
    case '--secondary':
    case '--secondary-foreground':
      return (
        <div className="rounded-lg px-2.5 py-1 text-xs font-bold text-center border border-border mt-1 transition-all" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
          Przycisk pomocniczy (Secondary)
        </div>
      );
    case '--accent':
    case '--accent-foreground':
      return (
        <div className="rounded-lg px-2.5 py-1 text-xs font-bold text-center border border-border mt-1 transition-all" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
          Akcent wyboru / hover
        </div>
      );
    case '--muted':
    case '--muted-foreground':
      return (
        <div className="rounded-lg p-2 text-[10px] text-center border border-border mt-1 transition-all" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
          Tekst wygaszony (muted)
        </div>
      );
    case '--border':
      return (
        <div className="rounded-lg p-2 text-[10px] text-center text-muted-foreground mt-1 bg-background/30 transition-all" style={{ border: '1.5px solid hsl(var(--border))' }}>
          Obramowanie (Border)
        </div>
      );
    case '--input':
      return (
        <div className="rounded-lg p-1.5 text-[10px] text-muted-foreground border border-border mt-1 transition-all" style={{ backgroundColor: 'hsl(var(--input))' }}>
          Pole tekstowe (Input bg)
        </div>
      );
    case '--ring':
      return (
        <div className="rounded-lg p-2 text-[10px] text-center text-muted-foreground border border-border mt-1 transition-all" style={{ boxShadow: '0 0 0 2px hsl(var(--ring))' }}>
          Wskaźnik focusu (Ring)
        </div>
      );
    case '--destructive':
    case '--destructive-foreground':
      return (
        <div className="rounded-lg px-2.5 py-1 text-xs font-bold text-center border border-destructive/20 mt-1 transition-all" style={{ backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}>
          Przycisk usuwania (Destructive)
        </div>
      );
    case '--brand-primary':
    case '--brand-primary-light':
    case '--brand-primary-dark':
      return (
        <div className="flex gap-1 text-[9px] text-white mt-1 transition-all">
          <div className="flex-1 p-1 rounded text-center" style={{ backgroundColor: 'hsl(var(--brand-primary-dark))' }}>Ciemny</div>
          <div className="flex-1 p-1 rounded text-center text-black" style={{ backgroundColor: 'hsl(var(--brand-primary))' }}>NB</div>
          <div className="flex-1 p-1 rounded text-center text-black" style={{ backgroundColor: 'hsl(var(--brand-primary-light))' }}>Jasny</div>
        </div>
      );
    default:
      return null;
  }
}

/* ── Motywy ───────────────────────────────────────────────── */
const THEMES = [
  { key: null,              label: 'Ciemny',      price: 'darmowy',  isDefault: true,  isLight: false },
  { key: 'dark-theme',     label: 'Ciemny v2',   price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'light-apple',    label: 'Jasny',        price: 'darmowy',  isDefault: false, isLight: true  },
  { key: 'nextbyte-light', label: 'NB Jasny',     price: 'darmowy',  isDefault: false, isLight: true  },
  { key: 'future-theme',   label: 'Przyszły',     price: 'darmowy',  isDefault: false, isLight: true  },
  { key: 'lime-green',     label: 'Lime',         price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'refspace',       label: 'RefSpace',     price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'sloneczny',      label: 'Słoneczny',    price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'teczowy',        label: 'Tęczowy RGB',  price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'aurora',         label: 'Aurora',       price: '150 Byte', isDefault: false, isLight: false },
  { key: 'fioletowy',      label: 'Fioletowy',    price: '150 Byte', isDefault: false, isLight: false },
  { key: 'nextbyte-v2',    label: 'NB Lekki',     price: '150 Byte', isDefault: false, isLight: false },
  { key: 'dragon-red',     label: 'Smoczy',       price: '150 Byte', isDefault: false, isLight: false },
  { key: 'snowy-white',    label: 'Śnieżny',      price: '150 Byte', isDefault: false, isLight: false },
  { key: 'luxury',         label: 'Luxury',       price: '500 Byte', isDefault: false, isLight: false },
  { key: 'custom',         label: '★ Własny motyw', price: 'edytowalny', isDefault: false, isLight: false },
] as const;

type ThemeKey = null | 'dark-theme' | 'light-apple' | 'nextbyte-light' | 'future-theme' | 'lime-green' | 'refspace' | 'sloneczny' | 'teczowy' | 'aurora' | 'fioletowy' | 'nextbyte-v2' | 'dragon-red' | 'snowy-white' | 'luxury' | 'custom';

const CONTRACT_VARS = [
  '--background','--foreground','--card','--card-foreground',
  '--popover','--popover-foreground','--primary','--primary-foreground',
  '--secondary','--secondary-foreground','--accent','--accent-foreground',
  '--muted','--muted-foreground','--border','--input','--ring',
  '--destructive','--destructive-foreground',
  '--brand-primary','--brand-primary-light','--brand-primary-dark',
] as const;

function readVar(name: string) {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ── Pre-definiowane dane demonstracyjne ────────────────────── */
const DEMO_MODELS: Model[] = [
  {
    id: 'grok-4',
    name: 'Grok 4.3',
    provider: 'xAI',
    description: 'Najnowszy model xAI z agentic reasoning i ogromnym oknem kontekstu.',
    contextSize: '1M tokenów',
    costPerMessage: 2,
    group: 'Inne modele',
    icon: '🚀',
    metrics: { intelligence: 8, speed: 7, context: 10, cost: 7 },
  },
  {
    id: 'gpt-5',
    name: 'GPT-5.4',
    provider: 'OpenAI',
    description: 'Flagowy model OpenAI — TOP w benchmarkach matematyki i logiki. Wspiera Fast Mode.',
    contextSize: '400K tokenów',
    costPerMessage: 4,
    group: 'Inne modele',
    icon: '⚙️',
    metrics: { intelligence: 9, speed: 7, context: 9, cost: 4 },
    config: { reasoningEffort: 'medium', responseSpeed: 'standard' },
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet',
    provider: 'Anthropic',
    description: 'Najlepszy stosunek jakości do ceny w kodzie (SWE-bench ~77%), szybki i stabilny.',
    contextSize: '200K tokenów',
    costPerMessage: 3,
    group: 'Inne modele',
    icon: '💬',
    metrics: { intelligence: 9, speed: 9, context: 8, cost: 6 },
    config: { reasoningEffort: 'medium' },
  },
  {
    id: 'claude-opus',
    name: 'Claude Opus',
    provider: 'Anthropic',
    description: 'Najwyższa jakość Anthropic — wielokrokowe rozumowanie i analiza złożonych zadań.',
    contextSize: '1M tokenów',
    costPerMessage: 23,
    group: 'Inne modele',
    icon: '👑',
    metrics: { intelligence: 10, speed: 5, context: 10, cost: 1 },
    config: { reasoningEffort: 'high' },
  },
  {
    id: 'nb-szybki',
    name: 'Szybki',
    provider: 'NextByte',
    description: 'Błyskawiczne odpowiedzi do prostych zadań i szybkich pytań.',
    contextSize: '32K tokenów',
    costPerMessage: 1,
    group: 'NextByte',
    icon: '⚡',
    metrics: { intelligence: 5, speed: 10, context: 4, cost: 10 },
  },
  {
    id: 'nb-pro',
    name: 'Pro',
    provider: 'NextByte',
    description: 'Zaawansowane rozumowanie i analiza do bardziej złożonych zadań.',
    contextSize: '1M tokenów',
    costPerMessage: 2,
    group: 'NextByte',
    icon: '✨',
    metrics: { intelligence: 8, speed: 8, context: 10, cost: 8 },
    config: { reasoningEffort: 'medium', responseSpeed: 'standard' },
  },
  {
    id: 'nb-ultra',
    name: 'Ultra',
    provider: 'NextByte',
    description: 'Najwyższa jakość — szybkość i inteligencja bez kompromisów.',
    contextSize: '1M tokenów',
    costPerMessage: 2,
    group: 'NextByte',
    icon: '👑',
    metrics: { intelligence: 10, speed: 7, context: 10, cost: 7 },
    config: { reasoningEffort: 'medium' },
  },
];

const DEMO_TABLE_DATA = [
  { name: 'Kafelek', file: 'tile.tsx', lines: 247, status: 'stable', author: 'AB' },
  { name: 'Przycisk', file: 'button.tsx', lines: 106, status: 'stable', author: 'AB' },
  { name: 'Input', file: 'input.tsx', lines: 132, status: 'new', author: 'AB' },
  { name: 'Badge', file: 'badge.tsx', lines: 78, status: 'new', author: 'AB' },
  { name: 'Dialog', file: 'dialog.tsx', lines: 98, status: 'beta', author: 'AB' },
];

export default function App() {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(null);
  const [activeLibrary, setActiveLibrary] = useState<'all' | 'core' | 'layout' | 'analytics' | 'patterns' | 'variables'>('core');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'stable' | 'beta' | 'new'>('all');
  const [selectedComponent, setSelectedComponent] = useState<string>('button');
  const [glassMode, setGlassMode] = useState(false);
  const [tick, setTick] = useState(0);
  const [alertPage, setAlertPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const [shadowCopyFormat, setShadowCopyFormat] = useState<Record<string, 'tailwind' | 'cssVar' | 'cssValue'>>({});
  const [shadowCopied, setShadowCopied] = useState<string | null>(null);
  const [hoveredShadowCard, setHoveredShadowCard] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('nb-pro');
  const [modelSearchSize, setModelSearchSize] = useState<'sm' | 'default' | 'lg'>('default');
  const { toast } = useToast();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  
  // Interactive testing states for HSL variables tab
  const [testPopoverOpen, setTestPopoverOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  // Playground component configuration state
  const [btnVariant, setBtnVariant] = useState<'nextbyte' | 'glass' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'default'>('nextbyte');
  const [btnSize, setBtnSize] = useState<'sm' | 'default' | 'lg' | 'xl' | 'icon'>('default');
  const [btnDisabled, setBtnDisabled] = useState(false);

  const [badgeVariant, setBadgeVariant] = useState<'default' | 'primary' | 'warning' | 'destructive' | 'outline' | 'ghost'>('primary');
  const [badgeSize, setBadgeSize] = useState<'sm' | 'default' | 'lg'>('default');
  const [badgeShape, setBadgeShape] = useState<'rounded' | 'square'>('rounded');
  const [badgeDot, setBadgeDot] = useState(true);

  const [inputVariant, setInputVariant] = useState<'default' | 'ghost' | 'error' | 'success'>('default');
  const [inputSize, setInputSize] = useState<'sm' | 'default' | 'lg'>('default');
  const [inputPrefix, setInputPrefix] = useState('https://');

  const [tileIntent, setTileIntent] = useState<'neutralna' | 'akcent' | 'krytyczna'>('akcent');
  const [tileElevation, setTileElevation] = useState<'plaska' | 'uniesiona' | 'wyzej'>('uniesiona');
  const [tileInteractive, setTileInteractive] = useState(true);

  const [bgPatternType, setBgPatternType] = useState<'plus' | 'dots' | 'grid'>('plus');
  const [bgPatternSize, setBgPatternSize] = useState(60);
  const [bgPatternOpacity, setBgPatternOpacity] = useState(0.3);

  const [customThemeVariables, setCustomThemeVariables] = useState<Record<string, string>>({
    '--background': '0 0% 2%',
    '--foreground': '0 0% 96%',
    '--card': '0 0% 3%',
    '--card-foreground': '0 0% 96%',
    '--popover': '0 0% 3%',
    '--popover-foreground': '0 0% 96%',
    '--primary': '204 91% 70%',
    '--primary-foreground': '0 0% 0%',
    '--secondary': '0 0% 6%',
    '--secondary-foreground': '0 0% 96%',
    '--accent': '204 91% 70%',
    '--accent-foreground': '0 0% 0%',
    '--muted': '0 0% 6%',
    '--muted-foreground': '0 0% 67%',
    '--border': '0 0% 14%',
    '--input': '0 0% 6%',
    '--ring': '204 91% 70%',
    '--destructive': '0 63% 31%',
    '--destructive-foreground': '0 0% 98%',
    '--brand-primary': '204 91% 70%',
    '--brand-primary-light': '202 95% 76%',
    '--brand-primary-dark': '209 75% 64%',
  });

  const applyTheme = useCallback((key: ThemeKey) => {
    if (key === 'custom') {
      document.documentElement.setAttribute('data-theme', 'custom');
      Object.entries(customThemeVariables).forEach(([name, val]) => {
        document.documentElement.style.setProperty(name, val);
      });
      setActiveTheme('custom');
    } else {
      CONTRACT_VARS.forEach(name => {
        document.documentElement.style.removeProperty(name);
      });
      if (key === null) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', key);
      setActiveTheme(key);
    }
    // Trigger update of CSS variable swatches
    setTimeout(() => setTick(t => t + 1), 50);
  }, [customThemeVariables]);

  const updateCustomVariable = (name: string, value: string) => {
    setCustomThemeVariables(prev => {
      const next = { ...prev, [name]: value };
      if (activeTheme === 'custom') {
        document.documentElement.style.setProperty(name, value);
      }
      return next;
    });
    setTimeout(() => setTick(t => t + 1), 20);
  };

  const cloneActiveToCustom = () => {
    const cloned: Record<string, string> = {};
    CONTRACT_VARS.forEach(name => {
      cloned[name] = readVar(name) || '0 0% 0%';
    });
    setCustomThemeVariables(cloned);
    document.documentElement.setAttribute('data-theme', 'custom');
    Object.entries(cloned).forEach(([name, val]) => {
      document.documentElement.style.setProperty(name, val);
    });
    setActiveTheme('custom');
    setTimeout(() => setTick(t => t + 1), 50);
    toast({
      title: "Utworzono własny motyw!",
      description: "Możesz teraz edytować kolory zmiennych HSL bezpośrednio w tabeli.",
      variant: "success"
    });
  };

  useEffect(() => {
    setTick(1);
  }, []);

  const primaryHsl = useMemo(() => {
    return tick >= 0 ? readVar('--primary') : '';
  }, [tick, activeTheme]);

  // Full component list metadata
  const components = useMemo(() => [
    { id: 'button', name: 'Button', desc: 'Przyciski: 8 wariantów × 5 rozmiarów z opcją spin-slow glow', library: 'core', status: 'stable' },
    { id: 'badge', name: 'Badge', desc: 'Odznaki: 6 wariantów × 3 rozmiary × 2 kształty z kropką statusu', library: 'core', status: 'stable' },
    { id: 'input', name: 'Input & Group', desc: 'Pola tekstowe, textarea oraz grupy z etykietami i komunikatami', library: 'core', status: 'new' },
    { id: 'select', name: 'Select', desc: 'Listy wyboru w 4 wariantach z grupami, separatorami i Radix UI', library: 'core', status: 'new' },
    { id: 'separator', name: 'Separator', desc: 'Linie podziału poziome i pionowe w 6 wariantach z etykietami', library: 'core', status: 'stable' },
    { id: 'avatar', name: 'Avatar', desc: 'Awatary z fallbackami, statusami aktywności oraz grupami', library: 'core', status: 'new' },
    { id: 'skeleton', name: 'Skeleton', desc: 'Szkielety ładowania wariantów default i shimmer, teksty i kafelki', library: 'core', status: 'stable' },
    { id: 'toast', name: 'Toast & Toaster', desc: 'Powiadomienia systemowe w 4 wariantach z auto-dismiss', library: 'core', status: 'stable' },

    { id: 'panel', name: 'Panel', desc: 'Panele boczne/kontenery z nagłówkiem, licznikiem i wyszukiwarką', library: 'layout', status: 'beta' },
    { id: 'sidebar', name: 'Sidebar', desc: 'Nawigacja boczna ze stanem zwiniętym, logotypem i sekcjami', library: 'layout', status: 'beta' },
    { id: 'tabs', name: 'Tabs', desc: 'Zakładki w wariantach underline, pills i card o 3 rozmiarach', library: 'layout', status: 'stable' },
    { id: 'dialog', name: 'Dialog', desc: 'Okna modalne wariantów default i destructive o 4 rozmiarach', library: 'layout', status: 'beta' },
    { id: 'dropdown', name: 'Dropdown Menu', desc: 'Menu kontekstowe z grupami, skrótami, ikonami i destruktywnymi akcjami', library: 'layout', status: 'new' },
    { id: 'popover', name: 'Popover', desc: 'Pływające panele zakotwiczone do elementu z automatycznym pozycjonowaniem', library: 'layout', status: 'new' },
    { id: 'table', name: 'Table', desc: 'Tabele z 3 wariantami, sortowaniem nagłówków i zaznaczaniem', library: 'layout', status: 'stable' },

    { id: 'sparkline', name: 'Sparkline', desc: 'Mini-wykresy SVG z wygładzaniem bezierem i wypełnieniami', library: 'analytics', status: 'stable' },
    { id: 'statcard', name: 'StatCard', desc: 'Karty statystyk z ikonami, trendem i sparkline', library: 'analytics', status: 'stable' },
    { id: 'activityfeed', name: 'ActivityFeed', desc: 'Dziennik aktywności z osią czasu i wskaźnikiem live', library: 'analytics', status: 'stable' },
    { id: 'alertcard', name: 'AlertCard', desc: 'Karty powiadomień systemowych o 4 priorytetach z paginacją', library: 'analytics', status: 'beta' },
    { id: 'tile', name: 'Tile', desc: 'Uniwersalny kafelek z 3 elewacjami, 3 intencjami i akcjami', library: 'analytics', status: 'stable' },

    { id: 'metricbar', name: 'MetricBar', desc: 'Blokowy wskaźnik postępu dla metryk modeli i zasobów', library: 'core', status: 'new' },
    { id: 'modelsearch', name: 'ModelSearch', desc: 'Selektor modeli AI z wyszukiwarką, grupami i panelem metryk', library: 'patterns', status: 'new' },

    { id: 'bgpatterns', name: 'BackgroundPatterns', desc: 'Wzorce tła SVG (Plus, Dots, Grid) z regulacją rozmiaru', library: 'patterns', status: 'stable' },
    { id: 'techgrid', name: 'TechGrid', desc: 'Siatka technologiczna w tle z maską radialną gradientu', library: 'patterns', status: 'stable' },
    { id: 'commandsearch', name: 'CommandSearch', desc: 'Pasek szybkiego wyszukiwania ⌘K w 3 rozmiarach', library: 'patterns', status: 'stable' },
    { id: 'quicknav', name: 'QuickNav', desc: 'Siatka skrótów nawigacyjnych o 3 rozmiarach z pustymi slotami', library: 'patterns', status: 'stable' },
  ], []);

  // Filtering logic
  const filteredComponents = useMemo(() => {
    return components.filter(c => {
      const matchQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLib = activeLibrary === 'all' || c.library === activeLibrary;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchQuery && matchLib && matchStatus;
    });
  }, [components, searchQuery, activeLibrary, statusFilter]);

  // Generate code snippet based on active controls
  const activeCodeSnippet = useMemo(() => {
    switch (selectedComponent) {
      case 'button':
        return `import { Button } from '@nextbyte/core';\nimport { Star } from 'lucide-react';\n\n// Render\n<Button \n  variant="${btnVariant}" \n  size="${btnSize}"${btnDisabled ? '\n  disabled' : ''}\n>\n  ${btnSize === 'icon' ? '<Star className="h-4 w-4" />' : 'Kliknij mnie'}\n</Button>`;
      case 'badge':
        return `import { Badge } from '@nextbyte/core';\n\n// Render\n<Badge \n  variant="${badgeVariant}" \n  size="${badgeSize}" \n  shape="${badgeShape}"${badgeDot ? '\n  dot' : ''}\n>\n  Status\n</Badge>`;
      case 'input':
        return `import { Input, InputGroup } from '@nextbyte/core';\nimport { Mail } from 'lucide-react';\n\n// Render\n<InputGroup label="Email" required message="Podaj prawidłowy adres" messageVariant="default">\n  <Input \n    variant="${inputVariant}" \n    size="${inputSize}" \n    placeholder="nazwa@domena.pl" \n    iconLeft={<Mail className="h-4 w-4" />}\n  />\n</InputGroup>`;
      case 'select':
        return `import {\n  Select, SelectTrigger, SelectValue,\n  SelectContent, SelectItem, SelectGroup, SelectLabel\n} from '@nextbyte/core';\n\n// Render\n<Select>\n  <SelectTrigger variant="default" size="default">\n    <SelectValue placeholder="Wybierz komponent" />\n  </SelectTrigger>\n  <SelectContent>\n    <SelectGroup>\n      <SelectLabel>Biblioteki</SelectLabel>\n      <SelectItem value="core">Core Library</SelectItem>\n      <SelectItem value="layout">Layout Library</SelectItem>\n    </SelectGroup>\n  </SelectContent>\n</Select>`;
      case 'separator':
        return `import { Separator, Badge } from '@nextbyte/core';\n\n// Render poziomy z odznaką\n<Separator label={<Badge variant="primary" size="sm">NOWOŚĆ</Badge>} />\n\n// Render pionowy wewnątrz kontenera flex\n<div className="flex h-10 items-center gap-4">\n  <span>Lewo</span>\n  <Separator orientation="vertical" variant="primary" />\n  <span>Prawo</span>\n</div>`;
      case 'avatar':
        return `import { Avatar, AvatarGroup } from '@nextbyte/core';\n\n// Pojedynczy\n<Avatar fallback="Artur Bącik" status="online" size="default" />\n\n// Grupa awatarów\n<AvatarGroup\n  size="default"\n  max={3}\n  avatars={[\n    { fallback: 'Anna Kowalska' },\n    { fallback: 'Piotr Nowak' },\n    { fallback: 'Maria Wójcik' },\n  ]}\n/>`;
      case 'skeleton':
        return `import { Skeleton, SkeletonText, SkeletonTile } from '@nextbyte/core';\n\n// Prosty pasek ładowania\n<Skeleton variant="shimmer" shape="line" className="w-3/4" />\n\n// Tekst blokowy\n<SkeletonText lines={4} lastLineWidth="50%" variant="shimmer" />\n\n// Cały gotowy kafelek w stanie ładowania\n<SkeletonTile variant="default" />`;
      case 'toast':
        return `import { Toaster, useToast } from '@nextbyte/core';\nimport { Button } from '@nextbyte/core';\n\n// Renderuj Toaster na samym dole aplikacji\n// <Toaster position="bottom-right" />\n\n// W komponencie\nconst { toast, success } = useToast();\n\nreturn (\n  <Button onClick={() => success("Zapisano dane!", { description: "Zmiany są widoczne w bazie." })}>\n    Wywołaj powiadomienie\n  </Button>\n);`;
      case 'panel':
        return `import { Panel } from '@nextbyte/layout';\nimport { Star } from 'lucide-react';\n\n// Render\n<Panel\n  icon={<Star className="h-4 w-4" />}\n  title="Ulubione komponenty"\n  count={5}\n  collapsible\n  onSearch={() => console.log('Wyszukaj...')}\n>\n  <div className="p-3">Treść panelu...</div>\n</Panel>`;
      case 'sidebar':
        return `import { Sidebar, SidebarHeader, SidebarSection, SidebarItem, SidebarUserBar } from '@nextbyte/layout';\nimport { Calendar, Layers, Settings } from 'lucide-react';\nimport { Avatar } from '@nextbyte/core';\n\n// Render\n<Sidebar collapsible={true}>\n  <SidebarHeader logo={<span className="font-bold">NextByte</span>} />\n  <div className="flex-1 p-2 space-y-3">\n    <SidebarSection label="Moduły">\n      <SidebarItem icon={<Layers className="h-4 w-4" />} label="Komponenty" active />\n      <SidebarItem icon={<Calendar className="h-4 w-4" />} label="Harmonogram" />\n    </SidebarSection>\n  </div>\n  <SidebarUserBar avatar={<Avatar fallback="AB" size="xs" />} name="Artur Bącik" role="Admin" />\n</Sidebar>`;
      case 'tabs':
        return `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@nextbyte/layout';\nimport { LayoutDashboard } from 'lucide-react';\n\n// Render\n<Tabs variant="card" size="default" defaultValue="dash">\n  <TabsList>\n    <TabsTrigger value="dash"><LayoutDashboard className="h-4 w-4" /> Pulpit</TabsTrigger>\n    <TabsTrigger value="settings">Ustawienia</TabsTrigger>\n  </TabsList>\n  <TabsContent value="dash">Zawartość zakładki...</TabsContent>\n  <TabsContent value="settings">Konfiguracja...</TabsContent>\n</Tabs>`;
      case 'dialog':
        return `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@nextbyte/layout';\nimport { Button } from '@nextbyte/core';\n\n// Render\n<Dialog>\n  <DialogTrigger asChild>\n    <Button>Otwórz modal</Button>\n  </DialogTrigger>\n  <DialogContent size="default">\n    <DialogHeader>\n      <DialogTitle>Tytuł operacji</DialogTitle>\n      <DialogDescription>Czy na pewno chcesz kontynuować?</DialogDescription>\n    </DialogHeader>\n    <DialogFooter>\n      <DialogClose asChild><Button variant="ghost">Anuluj</Button></DialogClose>\n      <Button variant="destructive">Usuń</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>`;
      case 'dropdown':
        return `import {\n  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,\n  DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,\n  DropdownMenuSeparator, DropdownMenuShortcut,\n  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,\n} from '@nextbyte/layout';\nimport { Button } from '@nextbyte/core';\nimport { User, Settings, LogOut, ChevronRight } from 'lucide-react';\n\n// Render\n<DropdownMenu>\n  <DropdownMenuTrigger asChild>\n    <Button variant="outline">Opcje</Button>\n  </DropdownMenuTrigger>\n  <DropdownMenuContent align="end">\n    <DropdownMenuLabel>Moje konto</DropdownMenuLabel>\n    <DropdownMenuSeparator />\n    <DropdownMenuGroup>\n      <DropdownMenuItem>\n        <User /> Profil <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>\n      </DropdownMenuItem>\n      <DropdownMenuItem>\n        <Settings /> Ustawienia <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>\n      </DropdownMenuItem>\n    </DropdownMenuGroup>\n    <DropdownMenuSeparator />\n    <DropdownMenuItem destructive>\n      <LogOut /> Wyloguj <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>\n    </DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>`;
      case 'popover':
        return `import { Popover, PopoverTrigger, PopoverContent } from '@nextbyte/layout';\nimport { Button } from '@nextbyte/core';\n\n// Render\n<Popover>\n  <PopoverTrigger asChild>\n    <Button variant="outline">Otwórz popover</Button>\n  </PopoverTrigger>\n  <PopoverContent side="bottom" align="start">\n    <div className="flex flex-col gap-2">\n      <p className="text-sm font-semibold text-foreground">Tytuł popofera</p>\n      <p className="text-xs text-muted-foreground">\n        Dowolna treść: formularz, filtr, skróty, lista wyboru.\n      </p>\n    </div>\n  </PopoverContent>\n</Popover>`;
      case 'table':
        return `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from '@nextbyte/layout';\nimport { Avatar } from '@nextbyte/core';\n\n// Render\n<Table variant="default" size="default">\n  <TableHeader>\n    <TableRow>\n      <TableHead>Nazwa</TableHead>\n      <TableHead align="right">Wartość</TableHead>\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow interactive selected>\n      <TableCell className="font-semibold">Kafelek</TableCell>\n      <TableCell align="right">247 linii</TableCell>\n    </TableRow>\n  </TableBody>\n</Table>`;
      case 'sparkline':
        return `import { Sparkline } from '@nextbyte/analytics';\n\n// Render wygładzonego wykresu liniowego z wypełnieniem\n<Sparkline\n  data={[20, 25, 18, 30, 28, 38, 42, 50, 55, 62]}\n  width={120}\n  height={40}\n  trend="positive"\n  smooth={true}\n  showFill={true}\n/>`;
      case 'statcard':
        return `import { StatCard } from '@nextbyte/analytics';\nimport { BarChart3 } from 'lucide-react';\n\n// Render\n<StatCard\n  label="Przychód"\n  value="$48,295"\n  description="+12.5% od wczoraj"\n  trend="positive"\n  trendValue="+12.5%"\n  sparklineData={[40, 42, 41, 45, 48, 50, 55]}\n  icon={<BarChart3 className="h-4 w-4" />}\n  variant="primary"\n/>`;
      case 'activityfeed':
        return `import { ActivityFeed } from '@nextbyte/analytics';\nimport { Cpu, Award } from 'lucide-react';\n\n// Render\n<ActivityFeed\n  title="Aktywność platformy"\n  live={true}\n  items={[\n    { icon: <Cpu className="h-4 w-4" />, title: "Uruchomiono kontener", status: "in-progress" },\n    { icon: <Award className="h-4 w-4" />, title: "Zakończono budowanie paczki", status: "done", date: "5 minut temu" },\n  ]}\n/>`;
      case 'alertcard':
        return `import { AlertCard } from '@nextbyte/analytics';\n\n// Render\n<AlertCard\n  variant="warning"\n  title="Zabezpiecz Swój Dostęp"\n  description="Włącz weryfikację dwuetapową (2FA) jednym kliknięciem."\n  priority="high"\n  action={{ label: "Włącz teraz", onClick: () => {} }}\n/>`;
      case 'tile':
        return `import { Tile, TileHeader, TileRow, TilePill, TileFooter, TileAction } from '@nextbyte/analytics';\nimport { LayoutDashboard, Users, Trash2 } from 'lucide-react';\n\n// Render\n<Tile intencja="${tileIntent}" elewacja="${tileElevation}" interaktywny={${tileInteractive}}>\n  <TileHeader \n    ikona={LayoutDashboard} \n    tytul="Wizualizacja" \n    intencja="${tileIntent}" \n    poPrawej={<TilePill intencja="${tileIntent}">Aktywny</TilePill>}\n  />\n  <TileRow ikona={Users} poPrawej="4 autorów">Zespół deweloperski</TileRow>\n  <TileFooter>\n    <TileAction rodzaj="glowna">Zobacz szczegóły</TileAction>\n    <TileAction rodzaj="usun" ikona={Trash2} samaIkona />\n  </TileFooter>\n</Tile>`;
      case 'metricbar':
        return `import { MetricBar } from '@nextbyte/core';\n\n// Wskaźnik metryki modelu AI\n<MetricBar\n  label="Inteligencja"\n  value={7}\n  max={8}\n  color="success"\n  size="default"\n  showValue\n/>\n\n// Zestaw metryk\n<MetricBar label="Szybkość"    value={6} color="success" />\n<MetricBar label="Kontekst"    value={8} color="success" />\n<MetricBar label="Koszt"       value={5} color="warning" />`;
      case 'modelsearch':
        return `import { ModelSearch } from '@nextbyte/patterns';\nimport type { Model } from '@nextbyte/patterns';\n\nconst models: Model[] = [\n  {\n    id: 'pro',\n    name: 'Pro',\n    provider: 'NextByte',\n    description: 'Zaawansowane rozumowanie i analiza',\n    costPerMessage: 2,\n    group: 'NextByte',\n    icon: '✨',\n    metrics: { intelligence: 7, speed: 6, context: 7, cost: 7 },\n    config: { reasoningEffort: 'medium' },\n  },\n];\n\n// Render\n<ModelSearch\n  models={models}\n  value={selectedModel}\n  onValueChange={(id, model) => setSelectedModel(id)}\n/>`;
      case 'bgpatterns':
        return `import { PatternBackground } from '@nextbyte/patterns';\n\n// Render\n<div className="relative h-48 w-full border border-border bg-card rounded-xl overflow-hidden">\n  <PatternBackground\n    pattern_type="${bgPatternType}"\n    pattern_color="#70BEFA"\n    pattern_size={${bgPatternSize}}\n    pattern_opacity={${bgPatternOpacity}}\n    background_color="transparent"\n    fade={true}\n  />\n</div>`;
      case 'techgrid':
        return `import { TechGrid } from '@nextbyte/patterns';\n\n// Render w tle kontenera (absolutne pozycjonowanie)\n<div className="relative min-h-screen bg-background">\n  <TechGrid oczko={44} className="pointer-events-none absolute inset-0 z-0" />\n  <div className="relative z-10">Treść...</div>\n</div>`;
      case 'commandsearch':
        return `import { CommandSearch } from '@nextbyte/patterns';\n\n// Render\n<CommandSearch\n  size="default"\n  placeholder="Szukaj komponentów..."\n  shortcut="⌘K"\n  onOpen={() => console.log('Otwórz wyszukiwarkę')}\n/>`;
      case 'quicknav':
        return `import { QuickNav } from '@nextbyte/patterns';\nimport { MessageSquare, Calendar } from 'lucide-react';\n\n// Render\n<QuickNav\n  slots={6}\n  size="default"\n  items={[\n    { icon: <MessageSquare className="h-4 w-4" />, label: 'Konwersacje', sublabel: 'PRO' },\n    { icon: <Calendar className="h-4 w-4" />, label: 'Kalendarz' },\n  ]}\n/>`;
      default:
        return '';
    }
  }, [
    selectedComponent, btnVariant, btnSize, btnDisabled,
    badgeVariant, badgeSize, badgeShape, badgeDot,
    inputVariant, inputSize, tileIntent, tileElevation, tileInteractive,
    bgPatternType, bgPatternSize, bgPatternOpacity
  ]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeCodeSnippet);
    setCopiedCode(true);
    toast({
      title: "Skopiowano!",
      description: "Kod komponentu został zapisany w schowku.",
      variant: "success"
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Switch category background label
  const backdropText = useMemo(() => {
    if (activeLibrary === 'variables') return 'vars';
    if (activeLibrary === 'shadows') return 'shadows';
    if (activeLibrary === 'all') return 'all';
    return activeLibrary;
  }, [activeLibrary]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground relative overflow-hidden flex flex-col">
      <Toaster position="bottom-right" />

      {/* Grid Pattern in main backdrop */}
      <TechGrid oczko={52} className="pointer-events-none absolute inset-0 z-0" />
      
      {/* Spotlight glow effects */}
      <div className="absolute top-[-10%] left-[30%] w-[40%] h-[20%] rounded-full bg-primary/[0.015] blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[5%] w-[30%] h-[30%] rounded-full bg-accent/[0.01] blur-[110px] pointer-events-none z-0" />

      {/* Giant Blurred Backdrop Text (style pricing in backdrop) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <span className="blur-backdrop-text select-none">
          {backdropText}
        </span>
      </div>

      {/* ── NAGŁÓWEK z selekcją bibliotek ────────────────────────── */}
      <header className="relative z-40 border-b border-border bg-card/60 backdrop-blur-xl sticky top-0">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold text-foreground tracking-tight flex items-center gap-1.5">
                <Cpu className="h-5 w-5 text-primary" />
                NextByte <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold">v3.0.0</span>
              </span>
            </div>
            <div className="text-xs text-muted-foreground md:hidden">14 motywów · 22 zmienne</div>
          </div>

          {/* Library selector pill bar */}
          <div className="flex flex-wrap gap-1 bg-muted/30 border border-border p-1 rounded-xl">
            {[
              { id: 'core', label: '@nextbyte/core' },
              { id: 'layout', label: '@nextbyte/layout' },
              { id: 'analytics', label: '@nextbyte/analytics' },
              { id: 'patterns', label: '@nextbyte/patterns' },
              { id: 'shadows', label: 'Cienie' },
              { id: 'variables', label: 'Zmienne HSL' },
              { id: 'all', label: 'Wszystkie' }
            ].map(lib => (
              <button
                key={lib.id}
                onClick={() => {
                  setActiveLibrary(lib.id as any);
                  // Auto focus first item of library
                  const first = components.find(c => lib.id === 'all' || c.library === lib.id);
                  if (first && lib.id !== 'variables' && lib.id !== 'shadows') setSelectedComponent(first.id);
                }}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                  activeLibrary === lib.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                )}
              >
                {lib.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{components.length} komponentów</span>
            <Separator orientation="vertical" className="h-3" />
            <span>14 motywów</span>
          </div>
        </div>
      </header>

      {/* ── GŁÓWNA TREŚĆ APLIKACJI ────────────────────────────────── */}
      <main className="relative z-10 flex-1 mx-auto max-w-7xl w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEWA STRONA: Lista i Filtrowanie ───────────────────────── */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Panel Filtrów */}
          <div className="nb-glass rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" /> Wyszukiwanie i filtry
            </p>
            
            {/* Search filter using CommandSearch placeholder behavior */}
            <div className="relative">
              <Input
                placeholder="Szukaj komponentu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconLeft={<Search className="h-4 w-4" />}
                size="sm"
                className="bg-muted/30 border-border/80"
              />
            </div>

            {/* Status tags selector */}
            <div className="flex flex-wrap gap-1 mt-1 border-t border-border/50 pt-2.5">
              {[
                { key: 'all', label: 'Wszystkie' },
                { key: 'stable', label: 'Stable' },
                { key: 'beta', label: 'Beta' },
                { key: 'new', label: 'New' }
              ].map(st => (
                <button
                  key={st.key}
                  onClick={() => setStatusFilter(st.key as any)}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-all',
                    statusFilter === st.key
                      ? 'bg-muted text-foreground border-border'
                      : 'bg-transparent text-muted-foreground border-transparent hover:border-border/50 hover:text-foreground'
                  )}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panel listy komponentów */}
          <div className="nb-glass rounded-2xl p-4 flex-1 flex flex-col min-h-[300px]">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Komponenty ({filteredComponents.length})
            </p>

            {activeLibrary === 'variables' ? (
              <div className="flex-1 flex items-center justify-center text-center p-4">
                <p className="text-xs text-muted-foreground font-semibold">Zmienne kontraktu HSL są wyświetlane w centralnym panelu.</p>
              </div>
            ) : activeLibrary === 'shadows' ? (
              <div className="flex-1 flex items-center justify-center text-center p-4">
                <p className="text-xs text-muted-foreground font-semibold">Skale cieni NextByte są wyświetlane w centralnym panelu.</p>
              </div>
            ) : filteredComponents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <AlertTriangle className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground font-medium">Brak pasujących pozycji</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Zmień frazę wyszukiwania lub filtry.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[500px] lg:max-h-[600px] pr-1 space-y-1 scrollbar-none">
                {filteredComponents.map(comp => {
                  const isSelected = selectedComponent === comp.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => { setSelectedComponent(comp.id); setGlassMode(false); }}
                      className={cn(
                        'w-full flex items-center justify-between gap-2 rounded-xl p-2.5 text-left transition-all duration-200 border',
                        isSelected
                          ? 'bg-primary/10 border-primary/30 text-foreground'
                          : 'bg-transparent border-transparent hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="min-w-0">
                        <p className={cn('text-xs font-semibold', isSelected ? 'text-primary' : 'text-card-foreground')}>{comp.name}</p>
                        <p className="text-[10px] text-muted-foreground/80 truncate mt-0.5">{comp.desc}</p>
                      </div>
                      <Badge
                        variant={comp.status === 'stable' ? 'primary' : comp.status === 'new' ? 'default' : 'warning'}
                        size="sm"
                        shape="square"
                        className="shrink-0 scale-90"
                      >
                        {comp.status}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ŚRODEK: Interaktywna Prezentacja (Playground / Vars) ───────── */}
        <section className="lg:col-span-6 flex flex-col gap-6">

          {activeLibrary === 'variables' ? (
            /* WIZUALIZACJA ZMIENNYCH KONTRAKTOWYCH */
            <div className="nb-glass rounded-2xl p-5 flex flex-col gap-5">
              
              {/* Nagłówek */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-4">
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    {activeTheme === 'custom' ? 'Kreator własnego motywu' : 'Paleta aktywnego motywu'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeTheme === 'custom'
                      ? 'Edytujesz własny motyw w czasie rzeczywistym. Kolory zmienią się na żywo w całej aplikacji i w kafelkach poniżej!'
                      : '22 zmienne kontraktu HSL NextByte dynamicznie odczytywane z dokumentu.'}
                  </p>
                </div>
                
                {activeTheme !== 'custom' ? (
                  <Button size="sm" onClick={cloneActiveToCustom} className="shrink-0">
                    Modyfikuj ten motyw
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" onClick={() => applyTheme(null)} className="shrink-0">
                    Przywróć domyślny
                  </Button>
                )}
              </div>
              
              {/* Przywrócona siatka zmiennych na środku */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[350px] overflow-y-auto pr-1 scrollbar-none">
                {CONTRACT_VARS.map(varName => {
                  const val = activeTheme === 'custom' 
                    ? (customThemeVariables[varName] || '0 0% 0%')
                    : (tick >= 0 ? readVar(varName) : '');
                  
                  const hexVal = tailwindHslToHex(val);

                  return (
                    <div key={varName} className="flex flex-col gap-2 rounded-xl border border-border bg-card/60 p-3 transition-colors hover:border-border/80">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-7 w-7 shrink-0 rounded-lg border border-border relative overflow-hidden flex items-center justify-center" 
                          style={{ background: val ? `hsl(${val})` : 'transparent' }} 
                        >
                          {activeTheme === 'custom' && (
                            <input
                              type="color"
                              value={hexVal}
                              onChange={(e) => {
                                const hsl = hexToTailwindHsl(e.target.value);
                                updateCustomVariable(varName, hsl);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-card-foreground">{varName}</p>
                          {activeTheme !== 'custom' ? (
                            <p className="truncate text-[10px] text-muted-foreground font-mono mt-0.5">{val || '—'}</p>
                          ) : null}
                        </div>
                      </div>

                      {activeTheme === 'custom' && (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => updateCustomVariable(varName, e.target.value)}
                            className="flex-1 bg-background/50 border border-border rounded-lg px-2 py-1 text-[10px] font-mono text-muted-foreground focus:outline-none focus:border-primary"
                            placeholder="np. 204 91% 70%"
                          />
                          <div className="relative h-6 w-10 shrink-0 border border-border rounded bg-muted flex items-center justify-center">
                            <input
                              type="color"
                              value={hexVal}
                              onChange={(e) => {
                                const hsl = hexToTailwindHsl(e.target.value);
                                updateCustomVariable(varName, hsl);
                              }}
                              className="w-full h-full opacity-0 absolute inset-0 cursor-pointer"
                            />
                            <span className="text-[9px] font-bold text-muted-foreground pointer-events-none uppercase">Hex</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Separator przed kafelkami testowymi */}
              <Separator className="my-2 bg-border/50" />

              {/* INTERAKTYWNE KAFELKI TESTOWE NA DOLE */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Panel interaktywnego testowania komponentów (UI/UX)
                  </h3>
                  <span className="text-[9px] text-muted-foreground italic">Kliknij poniższe elementy, aby przetestować motyw</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* KAFELEK 1: Test Popover */}
                  <div className="bg-card/50 border border-border rounded-2xl p-4 flex flex-col justify-between min-h-[140px] relative">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">1. Dymki Popover (Błędy)</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                        Przetestuj popover i błędy. Kliknij poniższy przycisk, aby wywołać dymek w prawym dolnym rogu ekranu.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <Button 
                        size="sm" 
                        onClick={() => setTestPopoverOpen(!testPopoverOpen)}
                        className="w-full"
                      >
                        {testPopoverOpen ? 'Ukryj Popover' : 'Testuj Popover'}
                      </Button>

                      {testPopoverOpen && (
                        <div className="fixed bottom-6 right-6 z-50 w-72 bg-popover text-popover-foreground border border-border rounded-xl p-4 shadow-2xl space-y-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
                          <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">Wykryto Błąd (Popover)</span>
                            <button onClick={() => setTestPopoverOpen(false)} className="text-muted-foreground hover:text-foreground text-xs font-semibold px-1">✕</button>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-normal">
                            To jest dymek powiadomienia o błędzie. Tło okna: <code className="bg-muted text-foreground px-1 py-0.5 rounded text-[8px]">--popover</code>. Kolor tekstu: <code className="bg-muted text-foreground px-1 py-0.5 rounded text-[8px]">--popover-foreground</code>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KAFELEK 2: Test Focus Ring & Input */}
                  <div className="bg-card/50 border border-border rounded-2xl p-4 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">2. Pola Input & Focus Ring</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                        Kliknij wewnątrz pola tekstowego, aby przetestować poświatę focusu (<code className="text-foreground">--ring</code>) oraz tło inputa.
                      </p>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <input 
                        type="text" 
                        placeholder="Kliknij mnie (aktywny focus)..."
                        className="w-full bg-input text-foreground border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all"
                      />
                    </div>
                  </div>

                  {/* KAFELEK 3: Test modal Dialog */}
                  <div className="bg-card/50 border border-border rounded-2xl p-4 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">3. Okna dialogowe (Modale)</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                        Przetestuj wygląd okien modalnych na tle przyciemnienia. Otwórz pełnowymiarowy dialog.
                      </p>
                    </div>

                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => setTestDialogOpen(true)}
                        className="w-full"
                      >
                        Uruchom Dialog
                      </Button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          ) : activeLibrary === 'shadows' ? (
            /* WIZUALIZACJA CIENI */
            <div className="nb-glass rounded-2xl p-5 flex flex-col gap-5">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Tokeny cieni (Skale elewacji)</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Zdefiniowane, znormalizowane skale cieni platformy NextByte.</p>
              </div>

              {/* Porównanie wszystkich poziomów jednocześnie */}
              <div
                className="rounded-xl p-8 flex items-end justify-around gap-4 overflow-x-auto"
                style={{ background: 'hsl(0 0% 18%)', border: '1px solid hsl(0 0% 24%)' }}
              >
                {([
                  {
                    label: 'Płaska',
                    sublabel: 'shadow-none',
                    shadowIdle: 'none',
                    shadowHover: 'var(--shadow-uniesiona)',
                    translateHover: -6,
                  },
                  {
                    label: 'Uniesiona',
                    sublabel: 'shadow-uniesiona',
                    shadowIdle: 'var(--shadow-uniesiona)',
                    shadowHover: 'var(--shadow-wyzej)',
                    translateHover: -10,
                  },
                  {
                    label: 'Wyżej',
                    sublabel: 'shadow-wyzej',
                    shadowIdle: 'var(--shadow-wyzej)',
                    shadowHover: '0 4px 8px 0 rgb(0 0 0/0.14), 0 28px 56px -20px rgb(0 0 0/0.6), inset 0 1px 0 0 rgb(255 255 255/0.14)',
                    translateHover: -14,
                  },
                  {
                    label: 'Szklana',
                    sublabel: '.nb-glass',
                    glass: true,
                  },
                ] as const).map((item, i) => {
                  const isHovered = hoveredShadowCard === i;
                  return (
                    <div key={item.sublabel} className="flex flex-col items-center gap-3 shrink-0">
                      <div
                        className={cn(
                          'rounded-xl flex items-center justify-center text-[10px] font-bold cursor-default',
                          item.glass ? 'nb-glass' : ''
                        )}
                        style={item.glass ? {
                          width: 110,
                          height: 70,
                          color: 'hsl(0 0% 75%)',
                          marginBottom: i * 4,
                          transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                        } : {
                          width: 80 + i * 10,
                          height: 52 + i * 6,
                          background: 'hsl(0 0% 28%)',
                          color: 'hsl(0 0% 90%)',
                          border: '1px solid hsl(0 0% 34%)',
                          boxShadow: isHovered ? item.shadowHover : item.shadowIdle,
                          transform: `translateY(${isHovered ? item.translateHover : 0}px)`,
                          transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                          marginBottom: i * 4,
                        }}
                        onMouseEnter={() => setHoveredShadowCard(i)}
                        onMouseLeave={() => setHoveredShadowCard(null)}
                      >
                        {item.label}
                      </div>
                      <span className="text-[9px] font-mono text-center" style={{ color: 'hsl(0 0% 40%)' }}>{item.sublabel}</span>
                    </div>
                  );
                })}
              </div>

              {/* Lista tokenów z dropdownem kopiowania */}
              <div className="flex flex-col gap-3">
                {([
                  {
                    id: 'plaska',
                    tailwind: 'shadow-none',
                    cssVar: null as string | null,
                    cssValue: 'none',
                    desc: 'Brak cienia — tylko obramowanie. Do elementów list, tabel i zwartych układów kolumnowych.',
                  },
                  {
                    id: 'uniesiona',
                    tailwind: 'shadow-uniesiona',
                    cssVar: '--shadow-uniesiona',
                    cssValue: '0 1px 2px 0 rgb(0 0 0 / 0.06), 0 8px 24px -12px rgb(0 0 0 / 0.28), inset 0 1px 0 0 rgb(255 255 255 / 0.06)',
                    desc: 'Domyślny cień kafelków i przycisków. Wewnętrzny refleks 1px chroni czytelność na ciemnych tłach.',
                  },
                  {
                    id: 'wyzej',
                    tailwind: 'shadow-wyzej',
                    cssVar: '--shadow-wyzej',
                    cssValue: '0 2px 4px 0 rgb(0 0 0 / 0.08), 0 16px 40px -16px rgb(0 0 0 / 0.4), inset 0 1px 0 0 rgb(255 255 255 / 0.1)',
                    desc: 'Elementy nakładane: okna dialogowe, popovers, menu rozwijane, karty w stanie hover.',
                  },
                  {
                    id: 'glass',
                    tailwind: '.nb-glass',
                    cssVar: '--shadow-glass',
                    cssValue: 'inset 0 1px 0 0 hsl(var(--foreground) / 0.16), inset 0 -1px 0 0 hsl(var(--primary) / 0.08), 0 1px 2px 0 hsl(0 0% 0% / 0.18), 0 10px 30px -12px hsl(0 0% 0% / 0.34)',
                    desc: 'Łączy cień z backdrop-blur i gradientem tła. Używaj klasy .nb-glass — nie przepisuj ręcznie.',
                  },
                ] as const).map(shadow => {
                  const format = shadowCopyFormat[shadow.id] ?? 'tailwind';
                  const copied = shadowCopied === shadow.id;
                  const codeMap = {
                    tailwind: shadow.tailwind ? `className="${shadow.tailwind}"` : `.nb-glass { /* class */ }`,
                    cssVar: shadow.cssVar ? `box-shadow: var(${shadow.cssVar});` : `/* brak zmiennej */`,
                    cssValue: `box-shadow: ${shadow.cssValue};`,
                  } as const;
                  const handleCopy = () => {
                    navigator.clipboard.writeText(codeMap[format]);
                    setShadowCopied(shadow.id);
                    setTimeout(() => setShadowCopied(null), 1800);
                  };
                  return (
                    <div key={shadow.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card/20 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">{shadow.tailwind}</span>
                            {shadow.cssVar && (
                              <span className="text-[9px] bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded font-mono">{shadow.cssVar}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{shadow.desc}</p>
                        </div>
                        {/* Dropdown wyboru formatu + kopiuj */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <select
                            value={format}
                            onChange={e => setShadowCopyFormat(prev => ({ ...prev, [shadow.id]: e.target.value as 'tailwind' | 'cssVar' | 'cssValue' }))}
                            className="text-[9px] font-mono bg-muted border border-border text-muted-foreground rounded px-1.5 py-1 cursor-pointer outline-none focus:border-primary/50"
                          >
                            <option value="tailwind">Tailwind</option>
                            {shadow.cssVar && <option value="cssVar">CSS var()</option>}
                            <option value="cssValue">Pełna wartość</option>
                          </select>
                          <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 text-[9px] font-mono bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded px-2 py-1 transition-colors"
                          >
                            {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                            {copied ? 'Skopiowano' : 'Kopiuj'}
                          </button>
                        </div>
                      </div>
                      {/* Podgląd kodu do skopiowania */}
                      <code className="text-[10px] font-mono text-muted-foreground/80 select-all leading-relaxed break-all bg-background/50 border border-border/40 rounded-lg px-3 py-2">
                        {codeMap[format]}
                      </code>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* PREZENTACJA DANEGO KOMPONENTU */
            <>
              {/* Główny Panel Prezentacji */}
              <div className="nb-glass rounded-2xl p-5 flex flex-col gap-5">
                
                {/* Header */}
                <div className="flex items-start justify-between border-b border-border/50 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="font-heading text-xl font-bold text-foreground">
                        {components.find(c => c.id === selectedComponent)?.name}
                      </h2>
                      <Badge variant="primary" size="sm">
                        {components.find(c => c.id === selectedComponent)?.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {components.find(c => c.id === selectedComponent)?.desc}
                    </p>
                  </div>
                  <span className="text-[10px] bg-muted/60 border border-border px-2.5 py-1 rounded-full font-mono text-muted-foreground font-semibold">
                    lib: @nextbyte/{components.find(c => c.id === selectedComponent)?.library}
                  </span>
                </div>

                {/* PLAYGROUND: Interaktywne Demo */}
                <div className="relative">

                  {/* Kolorowe tło pod szkłem — bez tego backdrop-blur nie ma czego rozmywać */}
                  {glassMode && (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                      <div className="absolute -top-16 -left-10 h-64 w-64 rounded-full bg-primary/50 blur-2xl" />
                      <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-emerald-500/40 blur-2xl" />
                      <div className="absolute top-1/3 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-500/30 blur-2xl" />
                      <div className="absolute bottom-1/4 left-4 h-40 w-40 rounded-full bg-fuchsia-500/30 blur-2xl" />
                    </div>
                  )}

                  <div className={cn(
                  'rounded-2xl p-6 flex flex-col relative transition-all duration-300',
                  selectedComponent === 'modelsearch'
                    ? 'min-h-[480px] items-start justify-start overflow-visible'
                    : 'min-h-[220px] items-center justify-center overflow-hidden',
                  ['dropdown', 'popover'].includes(selectedComponent) && 'overflow-visible',
                  glassMode ? 'nb-glass' : 'border border-border/80 bg-background/50'
                )}>

                  {/* Grid overlay for preview styling */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

                  <div className="relative z-10 w-full flex items-center justify-center">
                    
                    {/* BUTTON PLAYGROUND */}
                    {selectedComponent === 'button' && (
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button variant={btnVariant} size={btnSize} disabled={btnDisabled}>
                          {btnSize === 'icon' ? <Star className="h-4 w-4" /> : 'Przycisk'}
                        </Button>
                        <Button variant={btnVariant} size={btnSize} disabled={btnDisabled}>
                          {btnSize === 'icon' ? <ArrowRightIcon /> : <><Star className="h-3.5 w-3.5" /> Z ikoną</>}
                        </Button>
                      </div>
                    )}

                    {/* BADGE PLAYGROUND */}
                    {selectedComponent === 'badge' && (
                      <Badge variant={badgeVariant} size={badgeSize} shape={badgeShape} dot={badgeDot}>
                        Odznaka
                      </Badge>
                    )}

                    {/* INPUT PLAYGROUND */}
                    {selectedComponent === 'input' && (
                      <div className="w-full max-w-sm">
                        <InputGroup label="Szukaj witryny" message="Podgląd grupy pól wejściowych" messageVariant="default" required>
                          <Input
                            variant={inputVariant}
                            size={inputSize}
                            placeholder="nextbyte.pl"
                            prefix={inputPrefix}
                            iconRight={<Globe className="h-4 w-4" />}
                          />
                        </InputGroup>
                      </div>
                    )}

                    {/* SELECT PLAYGROUND */}
                    {selectedComponent === 'select' && (
                      <div className="w-full max-w-xs">
                        <Select>
                          <SelectTrigger variant="default" size="default">
                            <SelectValue placeholder="Wybierz pozycję" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Płatne motywy</SelectLabel>
                              <SelectItem value="aurora">Aurora (150 Byte)</SelectItem>
                              <SelectItem value="luxury">Luxury (500 Byte)</SelectItem>
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>Darmowe</SelectLabel>
                              <SelectItem value="ciemny">Ciemny bazowy</SelectItem>
                              <SelectItem value="refspace">RefSpace</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* SEPARATOR PLAYGROUND */}
                    {selectedComponent === 'separator' && (
                      <div className="w-full space-y-5">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Separator poziomy z etykietą</p>
                          <Separator variant="primary" label={<Badge variant="primary" size="sm">nowy standard</Badge>} />
                        </div>
                        <div className="flex items-center gap-4 h-10 border border-border/50 bg-muted/10 p-2 rounded-xl">
                          <span className="text-xs text-muted-foreground">Początek</span>
                          <Separator orientation="vertical" variant="primary" />
                          <span className="text-xs text-muted-foreground">Środek</span>
                          <Separator orientation="vertical" />
                          <span className="text-xs text-muted-foreground font-semibold">Koniec</span>
                        </div>
                      </div>
                    )}

                    {/* AVATAR PLAYGROUND */}
                    {selectedComponent === 'avatar' && (
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar fallback="Artur Bącik" status="online" size="lg" />
                          <Avatar fallback="Jan Kowalski" status="busy" />
                          <Avatar fallback="A" status="away" size="sm" />
                        </div>
                        <div className="flex flex-col items-center gap-1.5 border-t border-border/50 pt-3 w-full">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">AvatarGroup (max=3)</p>
                          <AvatarGroup
                            size="default"
                            max={3}
                            avatars={[
                              { fallback: 'Anna Kowalska' },
                              { fallback: 'Piotr Nowak' },
                              { fallback: 'Maria Wójcik' },
                              { fallback: 'Kasia Wiśniewska' }
                            ]}
                          />
                        </div>
                      </div>
                    )}

                    {/* SKELETON PLAYGROUND */}
                    {selectedComponent === 'skeleton' && (
                      <div className="w-full space-y-4">
                        <div className="space-y-2">
                          <Skeleton variant="shimmer" shape="line" className="h-4 w-3/4" />
                          <Skeleton variant="shimmer" shape="line" className="h-3 w-1/2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <SkeletonTile variant="shimmer" />
                          <SkeletonTile variant="default" />
                        </div>
                      </div>
                    )}

                    {/* TOAST PLAYGROUND */}
                    {selectedComponent === 'toast' && (
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => toast({ title: 'System', description: 'Trwa synchronizacja danych...', variant: 'default' })}>
                          Wywołaj Info
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast({ title: 'Gotowe!', description: 'Komponent zaimportowany pomyślnie.', variant: 'success' })}>
                          Wywołaj Sukces
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast({ title: 'Błąd połączenia', description: 'Host docelowy nie odpowiada.', variant: 'destructive' })}>
                          Wywołaj Błąd
                        </Button>
                      </div>
                    )}

                    {/* PANEL PLAYGROUND */}
                    {selectedComponent === 'panel' && (
                      <div className="w-full max-w-sm">
                        <Panel
                          icon={<Star className="h-4 w-4" />}
                          title="Panel sterowania"
                          count={12}
                          collapsible
                          onSearch={() => toast({ title: 'Wyszukiwarka', description: 'Funkcja wyszukiwania aktywna.' })}
                        >
                          <div className="p-3 space-y-1 bg-muted/10">
                            {['Moduł główny', 'Wykresy analityczne', 'Ustawienia motywów'].map(t => (
                              <div key={t} className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer transition-colors">
                                {t}
                              </div>
                            ))}
                          </div>
                        </Panel>
                      </div>
                    )}

                    {/* SIDEBAR PLAYGROUND */}
                    {selectedComponent === 'sidebar' && (
                      <div className="w-full max-w-md border border-border/80 rounded-2xl overflow-hidden flex h-[280px]">
                        <Sidebar collapsible={true} defaultCollapsed={false}>
                          <SidebarHeader logo={<span className="font-heading text-xs font-bold text-primary">NextByte</span>} />
                          <div className="flex-1 p-2 space-y-3 overflow-y-auto scrollbar-none">
                            <SidebarSection label="Szybki start">
                              <SidebarItem icon={<Layers className="h-4 w-4" />} label="Baza kodu" active />
                              <SidebarItem icon={<Flame className="h-4 w-4" />} label="Statystyki" />
                            </SidebarSection>
                          </div>
                          <SidebarUserBar avatar={<Avatar fallback="AB" size="xs" />} name="Artur Bącik" role="Standard" />
                        </Sidebar>
                        <div className="flex-1 bg-muted/10 flex items-center justify-center p-3 text-center">
                          <p className="text-[10px] text-muted-foreground">Kliknij &quot;Zwiń&quot; w stopce paska bocznego</p>
                        </div>
                      </div>
                    )}

                    {/* TABS PLAYGROUND */}
                    {selectedComponent === 'tabs' && (
                      <div className="w-full max-w-md">
                        <Tabs variant="card" size="default" defaultValue="a">
                          <TabsList>
                            <TabsTrigger value="a"><LayoutDashboard className="h-3.5 w-3.5" /> Pulpit</TabsTrigger>
                            <TabsTrigger value="b">Baza komponentów <Badge variant="primary" size="sm">22</Badge></TabsTrigger>
                          </TabsList>
                          <TabsContent value="a" className="bg-muted/10 p-3 rounded-xl border border-border/40 text-xs text-muted-foreground">
                            Render zakładki Pulpit
                          </TabsContent>
                          <TabsContent value="b" className="bg-muted/10 p-3 rounded-xl border border-border/40 text-xs text-muted-foreground">
                            Render zakładki Baza komponentów
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}

                    {/* DIALOG PLAYGROUND */}
                    {selectedComponent === 'dialog' && (
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button onClick={() => setDialogOpen('sm')}>Rozmiar sm</Button>
                        <Button onClick={() => setDialogOpen('default')}>Rozmiar default</Button>
                        <Button variant="destructive" onClick={() => setDialogOpen('destructive')}>Potwierdzenie</Button>
                      </div>
                    )}

                    {/* DROPDOWN PLAYGROUND */}
                    {selectedComponent === 'dropdown' && (
                      <div className="flex flex-wrap gap-4 justify-center items-start">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Podstawowe</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">Akcje konta</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem>
                                  <Users className="h-4 w-4" /> Profil
                                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="h-4 w-4" /> Ustawienia
                                  <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Globe className="h-4 w-4" /> Więcej
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem><Bell className="h-4 w-4" /> Powiadomienia</DropdownMenuItem>
                                  <DropdownMenuItem><Shield className="h-4 w-4" /> Prywatność</DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem destructive>
                                <Trash2 className="h-4 w-4" /> Wyloguj
                                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Z checkboxami</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="sm">Widok</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Kolumny</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuCheckboxItem checked>Nazwa</DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem checked>Status</DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem>Priorytet</DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem>Assignee</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Kontekstowe</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">⋯</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="h-4 w-4" /> Podgląd</DropdownMenuItem>
                              <DropdownMenuItem><Copy className="h-4 w-4" /> Duplikuj</DropdownMenuItem>
                              <DropdownMenuItem><Download className="h-4 w-4" /> Eksportuj</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem destructive><Trash2 className="h-4 w-4" /> Usuń</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )}

                    {/* POPOVER PLAYGROUND */}
                    {selectedComponent === 'popover' && (
                      <div className="flex flex-wrap gap-8 justify-center items-start">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Informacyjny</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">Szczegóły</Button>
                            </PopoverTrigger>
                            <PopoverContent side="bottom" align="center">
                              <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold text-foreground">NextByte Design System</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Modularna biblioteka komponentów zbudowana na Radix UI i Tailwind CSS.
                                </p>
                                <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                                  <Badge variant="primary" size="sm">v2.4</Badge>
                                  <span className="text-[10px] text-muted-foreground">22 komponenty · 14 motywów</span>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Formularz</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="secondary" size="sm">Filtruj</Button>
                            </PopoverTrigger>
                            <PopoverContent side="bottom" align="start">
                              <div className="flex flex-col gap-3">
                                <p className="text-xs font-semibold text-foreground">Filtry</p>
                                <Input placeholder="Szukaj..." className="h-7 text-xs" />
                                <div className="flex gap-2">
                                  <Button size="sm" className="flex-1 h-7 text-xs">Zastosuj</Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs">Reset</Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Pozycja góra</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm">↑ Top</Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="center">
                              <p className="text-xs text-muted-foreground">Popover zakotwiczony do góry elementu.</p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}

                    {/* TABLE PLAYGROUND */}
                    {selectedComponent === 'table' && (
                      <div className="w-full">
                        <Table variant="default" size="sm">
                          <TableHeader>
                            <TableRow>
                              <TableHead sortable sortDirection="asc">Komponent</TableHead>
                              <TableHead>Typ pliku</TableHead>
                              <TableHead align="right">Linie</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {DEMO_TABLE_DATA.map((row, idx) => (
                              <TableRow key={row.name} interactive selected={idx === 1}>
                                <TableCell className="font-semibold text-xs">{row.name}</TableCell>
                                <TableCell className="text-muted-foreground font-mono text-[10px]">{row.file}</TableCell>
                                <TableCell align="right" className="text-xs">{row.lines}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* SPARKLINE PLAYGROUND */}
                    {selectedComponent === 'sparkline' && (
                      <div className="flex flex-wrap gap-6 items-center justify-center bg-card/40 border border-border/40 p-4 rounded-2xl">
                        <div className="flex flex-col items-center gap-1.5">
                          <Sparkline data={[20, 25, 18, 30, 28, 38, 42, 50, 55, 62]} trend="positive" width={100} height={40} />
                          <span className="text-[9px] text-muted-foreground font-semibold uppercase">Wzrost (+)</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <Sparkline data={[80, 72, 68, 74, 60, 55, 48, 42, 38, 20]} trend="negative" width={100} height={40} />
                          <span className="text-[9px] text-muted-foreground font-semibold uppercase">Spadek (-)</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <Sparkline data={[40, 42, 40, 44, 42, 43, 41, 42, 40]} trend="neutral" width={100} height={40} />
                          <span className="text-[9px] text-muted-foreground font-semibold uppercase">Płaski (~0)</span>
                        </div>
                      </div>
                    )}

                    {/* STATCARD PLAYGROUND */}
                    {selectedComponent === 'statcard' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <StatCard
                          label="Saldo konta"
                          value="◈ 14 Byte"
                          description="−10 ¢/dzień · na wyczerpaniu"
                          trend="negative"
                          trendValue="−10 ¢/dzień"
                          sparklineData={[80, 72, 68, 74, 60, 55, 48, 42, 38, 14]}
                          icon={<BarChart3 className="h-4 w-4" />}
                        />
                        <StatCard
                          label="Nowe integracje"
                          value="4"
                          description="Działające poprawnie"
                          trend="positive"
                          trendValue="+3 w tym tygodniu"
                          sparklineData={[1, 1, 2, 2, 3, 3, 4]}
                          icon={<Package className="h-4 w-4" />}
                          variant="primary"
                        />
                      </div>
                    )}

                    {/* ACTIVITYFEED PLAYGROUND */}
                    {selectedComponent === 'activityfeed' && (
                      <div className="w-full">
                        <ActivityFeed
                          title="Przepływ działań"
                          live={true}
                          items={[
                            { icon: <Cpu className="h-4 w-4" />, title: 'Generowanie pakietów @nextbyte', status: 'in-progress', description: 'Trwa kompilacja TypeScript...' },
                            { icon: <Award className="h-4 w-4" />, title: 'Odblokowano osiągnięcie: Nowa Era', status: 'done', date: 'Wczoraj' },
                            { icon: <Settings className="h-4 w-4" />, title: 'Zaktualizowano zmienne globalne HSL', status: 'done', date: '30.07.2026' }
                          ]}
                        />
                      </div>
                    )}

                    {/* ALERTCARD PLAYGROUND */}
                    {selectedComponent === 'alertcard' && (
                      <div className="w-full max-w-sm">
                        <AlertCard
                          variant="warning"
                          title="Wygasające sesje"
                          description="Klucze API z dostępem deweloperskim wygasną za 48 godzin. Zweryfikuj uprawnienia."
                          priority="high"
                          action={{ label: "Sprawdź klucze", onClick: () => toast({ title: "Skrót", description: "Brak zaimplementowanej akcji kluczy." }) }}
                          currentPage={alertPage}
                          totalPages={3}
                          onPrev={() => setAlertPage(p => Math.max(1, p - 1))}
                          onNext={() => setAlertPage(p => Math.min(3, p + 1))}
                        />
                      </div>
                    )}

                    {/* TILE PLAYGROUND */}
                    {selectedComponent === 'tile' && (
                      <div className="w-full max-w-sm">
                        <Tile intencja={tileIntent} elewacja={tileElevation} interaktywny={tileInteractive}>
                          <TileHeader
                            ikona={LayoutDashboard}
                            tytul="Karta systemowa"
                            podtytul="Kontekst: "
                            intencja={tileIntent}
                            poPrawej={<TilePill intencja={tileIntent}>aktywna</TilePill>}
                          />
                          <TileRow ikona={Users} poPrawej="stable">Moduł główny</TileRow>
                          <TileFooter>
                            <TileAction rodzaj="glowna">Wyświetl</TileAction>
                            <TileAction rodzaj="usun" ikona={Trash2} samaIkona aria-label="Usuń" />
                          </TileFooter>
                        </Tile>
                      </div>
                    )}

                    {/* BACKGROUND PATTERNS PLAYGROUND */}
                    {selectedComponent === 'bgpatterns' && (
                      <div className="relative h-44 w-full border border-border/80 bg-card rounded-2xl overflow-hidden flex items-center justify-center">
                        <PatternBackground
                          pattern_type={bgPatternType}
                          pattern_color="#70BEFA"
                          pattern_size={bgPatternSize}
                          pattern_opacity={bgPatternOpacity}
                          background_color="transparent"
                          fade={true}
                        />
                        <span className="relative z-10 text-xs font-semibold text-muted-foreground/80 bg-background/90 px-3 py-1.5 rounded-xl border border-border/85 shadow-sm">
                          Render: {bgPatternType} (size: {bgPatternSize}px, opacity: {bgPatternOpacity})
                        </span>
                      </div>
                    )}

                    {/* TECHGRID PLAYGROUND */}
                    {selectedComponent === 'techgrid' && (
                      <div className="relative h-44 w-full border border-border/80 bg-card rounded-2xl overflow-hidden flex items-center justify-center">
                        <TechGrid oczko={32} className="pointer-events-none absolute inset-0 z-0" />
                        <span className="relative z-10 text-xs font-semibold text-muted-foreground/80 bg-background/90 px-3 py-1.5 rounded-xl border border-border/85 shadow-sm">
                          TechGrid (oczko: 32px) z maską radialną u góry
                        </span>
                      </div>
                    )}

                    {/* COMMANDSEARCH PLAYGROUND */}
                    {selectedComponent === 'commandsearch' && (
                      <div className="w-full max-w-sm space-y-3">
                        <CommandSearch size="sm" placeholder="Szukaj szybkiego polecenia..." shortcut="⌘F" onOpen={() => toast({ title: "CommandSearch", description: "Otwarto w małym rozmiarze." })} />
                        <CommandSearch size="default" placeholder="Wyszukaj plik lub komponent..." shortcut="⌘K" onOpen={() => toast({ title: "CommandSearch", description: "Otwarto w domyślnym rozmiarze." })} />
                      </div>
                    )}

                    {/* QUICKNAV PLAYGROUND */}
                    {selectedComponent === 'quicknav' && (
                      <div className="w-full">
                        <QuickNav
                          slots={4}
                          size="default"
                          items={[
                            { icon: <MessageSquare className="h-4 w-4" />, label: 'Czat z AI', sublabel: 'AI' },
                            { icon: <Calendar className="h-4 w-4" />, label: 'Kalendarz' }
                          ]}
                          onAddSlot={() => toast({ title: "Szybka nawigacja", description: "Kliknięto pusty slot dodawania." })}
                        />
                      </div>
                    )}

                    {/* METRICBAR PLAYGROUND */}
                    {selectedComponent === 'metricbar' && (
                      <div className="flex flex-col gap-6 w-full" style={{ maxWidth: 360 }}>
                        {/* Układ 2×2 */}
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Układ 2×2 (jak w ModelSearch)</p>
                          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                            <MetricBar label="Inteligencja" value={7} color="warning" />
                            <MetricBar label="Szybkość" value={8} color="success" />
                            <MetricBar label="Kontekst" value={6} color="success" />
                            <MetricBar label="Koszt" value={7} color="success" />
                          </div>
                        </div>
                        {/* Kolory */}
                        <div className="flex flex-col gap-2.5 border-t border-border/40 pt-4">
                          <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Warianty kolorów</p>
                          <MetricBar label="Primary" value={6} color="primary" />
                          <MetricBar label="Success" value={7} color="success" />
                          <MetricBar label="Warning" value={4} color="warning" />
                          <MetricBar label="Destructive" value={2} color="destructive" />
                        </div>
                        {/* Rozmiary */}
                        <div className="flex flex-col gap-2.5 border-t border-border/40 pt-4">
                          <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Rozmiary bloków</p>
                          <MetricBar label="Small (h-2)"   value={5} size="sm"      color="success" />
                          <MetricBar label="Default (h-2.5)" value={5} size="default" color="success" />
                          <MetricBar label="Large (h-3.5)"  value={5} size="lg"      color="success" />
                        </div>
                      </div>
                    )}

                    {/* MODELSEARCH PLAYGROUND */}
                    {selectedComponent === 'modelsearch' && (
                      <div className="flex flex-col gap-3 w-full">
                        <p className="text-[10px] text-muted-foreground">Kliknij trigger, najedź na model żeby zobaczyć metryki</p>
                        <ModelSearch
                          models={DEMO_MODELS}
                          value={selectedModel}
                          onValueChange={(id) => setSelectedModel(id)}
                          size={modelSearchSize}
                          glass={glassMode}
                        />
                      </div>
                    )}

                  </div>
                  </div>
                </div>

                {/* KONTROLERY PLAYGROUND: dynamicznie dopasowywane do komponentu */}
                <div className="bg-muted/10 border border-border/50 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Opcje Playground</p>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={glassMode}
                      onClick={() => setGlassMode(g => !g)}
                      className="flex items-center gap-2 cursor-pointer select-none focus:outline-none"
                    >
                      <span className="text-[10px] font-semibold text-muted-foreground">Glassmorphizm</span>
                      <span className={cn(
                        'relative block h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
                        glassMode ? 'bg-primary' : 'bg-muted ring-1 ring-inset ring-border'
                      )}>
                        <span className={cn(
                          'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                          glassMode ? 'translate-x-4' : 'translate-x-0'
                        )} />
                      </span>
                    </button>
                  </div>

                  {/* ModelSearch controller */}
                  {selectedComponent === 'modelsearch' && (
                    <div>
                      <label className="block text-[10px] text-muted-foreground font-semibold mb-1.5">Rozmiar dropdownu</label>
                      <div className="flex gap-1 rounded-xl border border-border bg-background/40 p-1">
                        {([
                          { value: 'sm',      label: 'Mały'   },
                          { value: 'default', label: 'Średni' },
                          { value: 'lg',      label: 'Duży'   },
                        ] as const).map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setModelSearchSize(opt.value)}
                            className={cn(
                              'flex-1 rounded-lg py-1.5 text-[11px] transition-all duration-150',
                              modelSearchSize === opt.value
                                ? 'bg-primary/10 border border-primary font-semibold text-primary shadow-uniesiona'
                                : 'border border-transparent font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Button controller */}
                  {selectedComponent === 'button' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Variant</label>
                        <Select value={btnVariant} onValueChange={(val: any) => setBtnVariant(val)}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['nextbyte', 'glass', 'outline', 'ghost', 'destructive', 'secondary', 'default'].map(v => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Size</label>
                        <Select value={btnSize} onValueChange={(val: any) => setBtnSize(val)}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['sm', 'default', 'lg', 'xl', 'icon'].map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id="btnDisabled"
                          checked={btnDisabled}
                          onChange={(e) => setBtnDisabled(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                        />
                        <label htmlFor="btnDisabled" className="text-xs font-semibold text-foreground cursor-pointer">Disabled state</label>
                      </div>
                    </div>
                  )}

                  {/* Badge controller */}
                  {selectedComponent === 'badge' && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Variant</label>
                        <Select value={badgeVariant} onValueChange={(val: any) => setBadgeVariant(val)}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['default', 'primary', 'warning', 'destructive', 'outline', 'ghost'].map(v => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Size</label>
                        <Select value={badgeSize} onValueChange={(val: any) => setBadgeSize(val)}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['sm', 'default', 'lg'].map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Shape</label>
                        <Select value={badgeShape} onValueChange={(val: any) => setBadgeShape(val)}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['rounded', 'square'].map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id="badgeDot"
                          checked={badgeDot}
                          onChange={(e) => setBadgeDot(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                        />
                        <label htmlFor="badgeDot" className="text-xs font-semibold text-foreground cursor-pointer">Dot indicator</label>
                      </div>
                    </div>
                  )}

                  {/* Input controller */}
                  {selectedComponent === 'input' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Variant</label>
                        <Select value={inputVariant} onValueChange={(val: any) => setInputVariant(val)}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['default', 'ghost', 'error', 'success'].map(v => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Size</label>
                        <Select value={inputSize} onValueChange={(val: any) => setInputSize(val)}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['sm', 'default', 'lg'].map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Prefix</label>
                        <Select value={inputPrefix} onValueChange={(val: any) => setInputPrefix(val)}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['https://', 'http://', 'ftp://', 'mailto:'].map(p => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Tile controller */}
                  {selectedComponent === 'tile' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Intencja</label>
                        <Select value={tileIntent} onValueChange={(val: any) => setTileIntent(val)}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['neutralna', 'akcent', 'krytyczna'].map(v => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Elewacja</label>
                        <Select value={tileElevation} onValueChange={(val: any) => setTileElevation(val)}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['plaska', 'uniesiona', 'wyzej'].map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id="tileInteractive"
                          checked={tileInteractive}
                          onChange={(e) => setTileInteractive(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                        />
                        <label htmlFor="tileInteractive" className="text-xs font-semibold text-foreground cursor-pointer">Hover lift</label>
                      </div>
                    </div>
                  )}

                  {/* Patterns controller */}
                  {selectedComponent === 'bgpatterns' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Pattern Type</label>
                        <Select value={bgPatternType} onValueChange={(val: any) => setBgPatternType(val)}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['plus', 'dots', 'grid'].map(v => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Pattern Size</label>
                        <Select value={String(bgPatternSize)} onValueChange={(val: any) => setBgPatternSize(Number(val))}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['20', '40', '60', '80'].map(s => (
                              <SelectItem key={s} value={s}>{s}px</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Opacity</label>
                        <Select value={String(bgPatternOpacity)} onValueChange={(val: any) => setBgPatternOpacity(Number(val))}>
                          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['0.1', '0.2', '0.3', '0.5', '0.7'].map(o => (
                              <SelectItem key={o} value={o}>{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                </div>

                {/* SFORMATOWANY FRAGMENT KODU Z KOPIOWANIEM */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span>Fragment Kodu</span>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 hover:text-foreground text-xs text-primary transition-all font-semibold"
                    >
                      {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedCode ? 'Skopiowano!' : 'Skopiuj kod'}
                    </button>
                  </div>
                  <pre className="rounded-xl border border-border/80 bg-muted/30 p-4 overflow-x-auto text-[11px] font-mono text-muted-foreground leading-relaxed">
                    <code>{activeCodeSnippet}</code>
                  </pre>
                </div>

              </div>

              {/* Dodatkowa Karta Dokumentacji */}
              <div className="nb-glass rounded-2xl p-5 flex flex-col gap-3">
                <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" /> Rola w Architekturze Design Systemu
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ten komponent jest częścią modułu <span className="font-semibold text-foreground">@nextbyte/{components.find(c => c.id === selectedComponent)?.library}</span>. 
                  Został zaprojektowany przy użyciu HSL tokens dla pełnej kompatybilności z motywami platformy i płynnym odwracaniem kontrastów. 
                  Dzięki modułowemu podziałowi możesz importować tylko ten pod-pakiet, którego potrzebujesz w swoim projekcie.
                </p>
              </div>
            </>
          )}
        </section>

        {/* PRAWA STRONA: Selekcja motywów i zmienne ───────────────── */}
        <section className="lg:col-span-3 flex flex-col gap-6">

          {/* Panel motywów */}
          <div className="nb-glass rounded-2xl p-4 flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Aktywny motyw</p>
              <h3 className="font-heading text-sm font-bold text-foreground mt-0.5">Szybki Theme Swapper</h3>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-none">
              {THEMES.map(t => {
                const isActive = activeTheme === t.key;
                return (
                  <button
                    key={String(t.key)}
                    onClick={() => applyTheme(t.key)}
                    className={cn(
                      'w-full flex items-center justify-between rounded-xl border p-2.5 text-xs font-semibold transition-all duration-150',
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/10 text-muted-foreground hover:border-border/80 hover:text-foreground'
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {t.isLight ? '☀' : '🌙'}
                      {t.label}
                      {t.isDefault && <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[8px] font-bold">domyślny</span>}
                    </span>
                    <span className="opacity-50 text-[10px] font-medium">{t.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Szybka statystyka systemu */}
          <div className="nb-glass rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Podsumowanie biblioteki</p>
            
            <div className="space-y-2 border-b border-border/50 pb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Komponenty łącznie</span>
                <span className="font-bold text-foreground">22 pozycje</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Zdefiniowane motywy</span>
                <span className="font-bold text-foreground">14 schematów</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Zmienne kontraktu</span>
                <span className="font-bold text-foreground">22 zmienne HSL</span>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground/80 leading-relaxed space-y-1">
              <p>✔ Czysta separacja kodu z logicznym podziałem</p>
              <p>✔ Zależności oparte na Radix UI i CVA</p>
              <p>✔ Przystosowany do ciemnych i jasnych środowisk</p>
            </div>
          </div>

        </section>

      </main>

      {/* STOPKA platformy */}
      <footer className="relative z-40 border-t border-border/50 bg-card/40 py-4 text-center mt-auto">
        <p className="text-[10px] text-muted-foreground">
          NextByte Component Showcase · © 2026 NextByte Design Team · Wszystkie prawa zastrzeżone
        </p>
      </footer>

      {/* ── OKNA MODALNE (Weryfikacja Dialog) ──────────────────────── */}
      {dialogOpen === 'sm' && (
        <Dialog open={true} onOpenChange={() => setDialogOpen(null)}>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Dialog mały</DialogTitle>
              <DialogDescription>To jest modal w małym rozmiarze (size=&quot;sm&quot;) do szybkich komunikatów.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(null)}>Zamknij</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {dialogOpen === 'default' && (
        <Dialog open={true} onOpenChange={() => setDialogOpen(null)}>
          <DialogContent size="default">
            <DialogHeader>
              <DialogTitle>Zapisz konfigurację</DialogTitle>
              <DialogDescription>Wprowadź nazwę nowej gałęzi projektu w celu wyeksportowania zasobów.</DialogDescription>
            </DialogHeader>
            <InputGroup label="Nazwa zasobu" required message="Do 32 znaków" messageVariant="default">
              <Input placeholder="nextbyte-dev-showcase" />
            </InputGroup>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Anuluj</Button></DialogClose>
              <Button variant="default" onClick={() => setDialogOpen(null)}>Zapisz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {dialogOpen === 'destructive' && (
        <Dialog open={true} onOpenChange={() => setDialogOpen(null)}>
          <DialogContent variant="destructive" size="sm">
            <DialogHeader>
              <DialogTitle>Bezpowrotne usunięcie</DialogTitle>
              <DialogDescription>Ta operacja usunie trwale plik z lokalnego dysku. Czy chcesz kontynuować?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Anuluj</Button></DialogClose>
              <Button variant="destructive" onClick={() => setDialogOpen(null)}>Usuń trwale</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Interaktywny Modal dla podglądu kreatora motywu */}
      {testDialogOpen && (
        <Dialog open={true} onOpenChange={() => setTestDialogOpen(false)}>
          <DialogContent size="default">
            <DialogHeader>
              <DialogTitle>Test Kontrastów Dialogu</DialogTitle>
              <DialogDescription>
                Właśnie przetestowałeś zmienne okna modalnego! Ten kontener reaguje na zmienne kolorów HSL.
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2 text-xs">
              <p>Zmienne użyte w tym oknie:</p>
              <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-muted-foreground">
                <li>Tło okna: --background lub --card</li>
                <li>Obramowanie: --border</li>
                <li>Tekst główny: --foreground</li>
                <li>Tekst pomocniczy: --muted-foreground</li>
              </ul>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" onClick={() => setTestDialogOpen(false)}>Anuluj (Secondary)</Button>
              </DialogClose>
              <Button onClick={() => setTestDialogOpen(false)}>Zatwierdź (Primary)</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

// Arrow icon for playground
function ArrowRightIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
