import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Search, Copy, Check, Cpu, Star, LayoutDashboard,
  Package, Users, Settings, Trash2, Globe, Eye,
  Download, Layers, Shield, Award, Flame, BarChart3,
  MessageSquare, Calendar, Bell, Activity, Lock,
  ChevronRight, Filter, RefreshCw, Mail,
  Home, Inbox, FileText, PlusCircle, FolderOpen,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import {
  Button, Badge, Input, InputGroup,
  Select, SelectTrigger, SelectValue, SelectContent,
  SelectItem, SelectGroup, SelectLabel, SelectSeparator,
  Separator, Avatar, AvatarGroup, Skeleton, SkeletonText,
  SkeletonTile, Toaster, useToast, MetricBar,
  Switch, SimpleTooltip, TooltipProvider,
  Tooltip, TooltipTrigger, TooltipContent,
  Checkbox, RadioGroup, RadioGroupItem,
  Textarea, Progress, EmptyState,
} from '@/lib/core';

import {
  Panel, Sidebar, SidebarHeader, SidebarSection,
  SidebarItem, SidebarUserBar, Tabs, TabsList,
  TabsTrigger, TabsContent, Dialog,
  DialogContent, DialogHeader, DialogFooter,
  DialogTitle, DialogDescription, DialogClose,
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetBody, SheetFooter, SheetClose,
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Breadcrumb,
} from '@/lib/layout';

import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuSub, DropdownMenuSubTrigger,
  DropdownMenuSubContent, DropdownMenuCheckboxItem
} from '@/lib/layout/dropdown-menu';

import { Popover, PopoverTrigger, PopoverContent } from '@/lib/layout/popover';

import {
  Sparkline, StatCard, ActivityFeed, AlertCard,
  Tile, TileHeader, TileRow, TilePill, TileAction, TileFooter
} from '@/lib/analytics';

import {
  TechGrid, PatternBackground, CommandSearch,
  QuickNav, ModelSearch, type Model
} from '@/lib/patterns';

/* ── Colour helpers ───────────────────────────────────────── */
function hexToHsl(hex: string): string {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const r = parseInt(hex.slice(0,2),16)/255;
  const g = parseInt(hex.slice(2,4),16)/255;
  const b = parseInt(hex.slice(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0, s=0; const l=(max+min)/2;
  if (max !== min) {
    const d = max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) {
      case r: h=(g-b)/d+(g<b?6:0); break;
      case g: h=(b-r)/d+2; break;
      case b: h=(r-g)/d+4; break;
    }
    h/=6;
  }
  return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
}

function hslToHex(hsl: string): string {
  const p = hsl.trim().split(/\s+/);
  if (p.length < 3) return '#000000';
  let h = parseFloat(p[0]) % 360;
  const s = parseFloat(p[1])/100;
  const l = parseFloat(p[2])/100;
  const c = (1-Math.abs(2*l-1))*s;
  const x = c*(1-Math.abs((h/60)%2-1));
  const m = l-c/2;
  let r=0,g=0,b=0;
  if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}
  else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}
  else if(h<300){r=x;b=c;}else{r=c;b=x;}
  const hex=(v:number)=>Math.round((v+m)*255).toString(16).padStart(2,'0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function readVar(name: string) {
  return typeof window==='undefined' ? '' : getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ── Constants ────────────────────────────────────────────── */
const THEMES = [
  { key: null,            label: 'Domyślny',    isLight: false },
  { key: 'dark-theme',    label: 'Ciemny v2',   isLight: false },
  { key: 'light-apple',   label: 'Jasny',        isLight: true  },
  { key: 'nextbyte-light',label: 'NB Jasny',     isLight: true  },
  { key: 'future-theme',  label: 'Przyszły',     isLight: true  },
  { key: 'lime-green',    label: 'Lime',         isLight: false },
  { key: 'refspace',      label: 'RefSpace',     isLight: false },
  { key: 'sloneczny',     label: 'Słoneczny',    isLight: false },
  { key: 'teczowy',       label: 'Tęczowy',      isLight: false },
  { key: 'aurora',        label: 'Aurora',       isLight: false },
  { key: 'fioletowy',     label: 'Fioletowy',    isLight: false },
  { key: 'nextbyte-v2',   label: 'NB Lekki',     isLight: false },
  { key: 'dragon-red',    label: 'Smoczy',       isLight: false },
  { key: 'snowy-white',   label: 'Śnieżny',      isLight: false },
  { key: 'luxury',        label: 'Luxury',       isLight: false },
] as const;

type ThemeKey = typeof THEMES[number]['key'];

const CONTRACT_VARS = [
  '--background','--foreground','--card','--card-foreground',
  '--popover','--popover-foreground','--primary','--primary-foreground',
  '--secondary','--secondary-foreground','--accent','--accent-foreground',
  '--muted','--muted-foreground','--border','--input','--ring',
  '--destructive','--destructive-foreground',
  '--brand-primary','--brand-primary-light','--brand-primary-dark',
] as const;

const NAV = [
  {
    id: 'core', label: 'Core', pkg: 'core',
    items: [
      { id: 'button',    name: 'Button',     status: 'stable' },
      { id: 'badge',     name: 'Badge',      status: 'stable' },
      { id: 'input',     name: 'Input',      status: 'new'    },
      { id: 'select',    name: 'Select',     status: 'new'    },
      { id: 'avatar',    name: 'Avatar',     status: 'new'    },
      { id: 'separator', name: 'Separator',  status: 'stable' },
      { id: 'skeleton',  name: 'Skeleton',   status: 'stable' },
      { id: 'toast',     name: 'Toast',      status: 'stable' },
      { id: 'metricbar', name: 'MetricBar',  status: 'new'    },
      { id: 'switch',    name: 'Switch',     status: 'new'    },
      { id: 'tooltip',   name: 'Tooltip',    status: 'new'    },
      { id: 'checkbox',  name: 'Checkbox',   status: 'new'    },
      { id: 'radio',     name: 'Radio',      status: 'new'    },
      { id: 'textarea',  name: 'Textarea',   status: 'new'    },
      { id: 'progress',  name: 'Progress',   status: 'new'    },
      { id: 'emptystate',name: 'EmptyState', status: 'new'    },
    ],
  },
  {
    id: 'layout', label: 'Layout', pkg: 'layout',
    items: [
      { id: 'panel',    name: 'Panel',         status: 'beta'   },
      { id: 'sidebar',  name: 'Sidebar',       status: 'beta'   },
      { id: 'tabs',     name: 'Tabs',          status: 'stable' },
      { id: 'dialog',   name: 'Dialog',        status: 'beta'   },
      { id: 'dropdown', name: 'Dropdown Menu', status: 'new'    },
      { id: 'popover',  name: 'Popover',       status: 'new'    },
      { id: 'table',    name: 'Table',         status: 'stable' },
      { id: 'sheet',      name: 'Sheet',        status: 'new'    },
      { id: 'accordion',  name: 'Accordion',    status: 'new'    },
      { id: 'breadcrumb', name: 'Breadcrumb',   status: 'new'    },
    ],
  },
  {
    id: 'analytics', label: 'Analytics', pkg: 'analytics',
    items: [
      { id: 'sparkline',    name: 'Sparkline',     status: 'stable' },
      { id: 'statcard',     name: 'StatCard',      status: 'stable' },
      { id: 'activityfeed', name: 'ActivityFeed',  status: 'stable' },
      { id: 'alertcard',    name: 'AlertCard',     status: 'beta'   },
      { id: 'tile',         name: 'Tile',          status: 'stable' },
    ],
  },
  {
    id: 'patterns', label: 'Patterns', pkg: 'patterns',
    items: [
      { id: 'commandsearch', name: 'CommandSearch',      status: 'stable' },
      { id: 'quicknav',      name: 'QuickNav',           status: 'stable' },
      { id: 'modelsearch',   name: 'ModelSearch',        status: 'new'    },
      { id: 'bgpatterns',    name: 'BackgroundPatterns', status: 'stable' },
      { id: 'techgrid',      name: 'TechGrid',           status: 'stable' },
    ],
  },
  {
    id: 'tokens', label: 'Tokens', pkg: 'tokens',
    items: [
      { id: 'colors',  name: 'Colors & HSL', status: 'stable' },
      { id: 'shadows', name: 'Shadows',      status: 'stable' },
    ],
  },
] as const;

type NavId = typeof NAV[number]['items'][number]['id'];

const DEMO_MODELS: Model[] = [
  { id:'gpt-5', name:'GPT-5', provider:'OpenAI', description:'Flagowy model OpenAI.', contextSize:'400K', costPerMessage:4, group:'Inne', icon:'⚙️', metrics:{intelligence:9,speed:7,context:9,cost:4}, config:{reasoningEffort:'medium',responseSpeed:'standard'} },
  { id:'claude-sonnet', name:'Claude Sonnet', provider:'Anthropic', description:'Najlepszy stosunek jakości do ceny.', contextSize:'200K', costPerMessage:3, group:'Inne', icon:'💬', metrics:{intelligence:9,speed:9,context:8,cost:6}, config:{reasoningEffort:'medium'} },
  { id:'nb-pro', name:'Pro', provider:'NextByte', description:'Zaawansowane rozumowanie.', contextSize:'1M', costPerMessage:2, group:'NextByte', icon:'✨', metrics:{intelligence:8,speed:8,context:10,cost:8}, config:{reasoningEffort:'medium',responseSpeed:'standard'} },
  { id:'nb-ultra', name:'Ultra', provider:'NextByte', description:'Najwyższa jakość.', contextSize:'1M', costPerMessage:2, group:'NextByte', icon:'👑', metrics:{intelligence:10,speed:7,context:10,cost:7}, config:{reasoningEffort:'medium'} },
];

const DEMO_TABLE = [
  { name:'Button',      file:'button.tsx',  lines:70,  status:'stable', author:'AB' },
  { name:'Badge',       file:'badge.tsx',   lines:55,  status:'stable', author:'AB' },
  { name:'Input',       file:'input.tsx',   lines:132, status:'new',    author:'AB' },
  { name:'Dialog',      file:'dialog.tsx',  lines:98,  status:'beta',   author:'AB' },
  { name:'StatCard',    file:'stat-card.tsx',lines:88, status:'stable', author:'AB' },
];

/* ── UI helpers ───────────────────────────────────────────── */
function StatusDot({ status }: { status: string }) {
  return (
    <span className={cn('inline-block h-1.5 w-1.5 rounded-full shrink-0',
      status==='stable' ? 'bg-primary/70' : status==='new' ? 'bg-emerald-400/80' : 'bg-amber-400/80'
    )} />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 shrink-0">
        {children}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

function PageHeader({ name, pkg, status, description }: {
  name: string; pkg: string; status: string; description: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-3 mb-1.5">
        <h1 className="text-2xl font-bold text-foreground">{name}</h1>
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
          status==='stable' ? 'bg-primary/10 text-primary border border-primary/20' :
          status==='new'    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        )}>{status}</span>
      </div>
      <code className="text-[11px] text-muted-foreground/60 font-mono">
        @nextbyte/{pkg}
      </code>
      <p className="text-sm text-muted-foreground leading-relaxed mt-2">{description}</p>
    </div>
  );
}

function CodeBlock({ code, id, onCopy, copied }: {
  code: string; id: string;
  onCopy: (code: string, id: string) => void;
  copied: string | null;
}) {
  return (
    <div className="relative group rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
      <button
        onClick={() => onCopy(code, id)}
        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg px-2 py-1"
      >
        {copied === id ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        {copied === id ? 'Skopiowano' : 'Kopiuj'}
      </button>
      <pre className="p-4 overflow-x-auto text-[11px] font-mono text-muted-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function PropsTable({ rows }: { rows: { name: string; type: string; default?: string; desc: string }[] }) {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/60 bg-muted/20">
            <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Prop</th>
            <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Typ</th>
            <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Default</th>
            <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Opis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name} className={cn('border-b border-border/30', i%2===0 ? 'bg-transparent' : 'bg-muted/10')}>
              <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{r.name}</td>
              <td className="px-4 py-2.5 font-mono text-primary/80 max-w-[200px]">
                <span className="break-all">{r.type}</span>
              </td>
              <td className="px-4 py-2.5 font-mono text-muted-foreground">{r.default ?? '—'}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Preview({ children, glass, tight }: {
  children: React.ReactNode; glass?: boolean; tight?: boolean;
}) {
  return (
    <div className={cn(
      'relative rounded-2xl border border-border/60',
      tight ? 'p-6' : 'p-10',
    )}>
      {/* Background blobs clipped to card boundary */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        {glass ? (
          <>
            <div className="absolute inset-0 bg-card/20" />
            <div className="absolute -top-20 -left-10 h-56 w-56 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute -bottom-16 right-4 h-48 w-48 rounded-full bg-emerald-500/35 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-fuchsia-500/25 blur-3xl" />
          </>
        ) : (
          <div className="absolute inset-0 bg-card/30" />
        )}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ── Main App ─────────────────────────────────────────────── */
export default function App() {
  const [active, setActive]         = useState<NavId>('button');
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(null);
  const [search, setSearch]         = useState('');
  const [glass, setGlass]           = useState(false);
  const [copied, setCopied]         = useState<string|null>(null);
  const [dialogOpen, setDialogOpen] = useState<string|null>(null);
  const [alertPage, setAlertPage]   = useState(1);
  const [selectedModel, setSelectedModel] = useState('nb-pro');
  const [tick, setTick]             = useState(0);
  const [bgPattern, setBgPattern]       = useState<'plus'|'dots'|'grid'>('plus');
  const [bgPatternSize, setBgPatternSize]       = useState(40);
  const [bgPatternOpacity, setBgPatternOpacity] = useState(0.35);
  const [bgPatternColor, setBgPatternColor]     = useState('#70BEFA');
  const [hoveredShadow, setHoveredShadow] = useState<number|null>(null);
  const [sheetOpen, setSheetOpen]   = useState<string|null>(null);
  const [switchStates, setSwitchStates] = useState({ a: true, b: false, c: true, d: false });
  const [checkStates, setCheckStates] = useState({ a: true, b: false, c: false });
  const [radioVal, setRadioVal] = useState('pro');
  const [progressVal, setProgressVal] = useState(65);
  const [customVars, setCustomVars] = useState<Record<string,string>>({
    '--background':'0 0% 2%','--foreground':'0 0% 96%','--card':'0 0% 3%',
    '--card-foreground':'0 0% 96%','--popover':'0 0% 3%','--popover-foreground':'0 0% 96%',
    '--primary':'204 91% 70%','--primary-foreground':'0 0% 0%','--secondary':'0 0% 6%',
    '--secondary-foreground':'0 0% 96%','--accent':'204 91% 70%','--accent-foreground':'0 0% 0%',
    '--muted':'0 0% 6%','--muted-foreground':'0 0% 67%','--border':'0 0% 14%',
    '--input':'0 0% 6%','--ring':'204 91% 70%','--destructive':'0 63% 31%',
    '--destructive-foreground':'0 0% 98%','--brand-primary':'204 91% 70%',
    '--brand-primary-light':'202 95% 76%','--brand-primary-dark':'209 75% 64%',
  });
  const { toast } = useToast();

  useEffect(() => { setTick(1); }, []);

  const applyTheme = useCallback((key: ThemeKey) => {
    CONTRACT_VARS.forEach(n => document.documentElement.style.removeProperty(n));
    if (key === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', key);
    setActiveTheme(key);
    setTimeout(() => setTick(t=>t+1), 50);
  }, []);

  const copy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredNav = useMemo(() => {
    if (!search) return NAV;
    const q = search.toLowerCase();
    return NAV.map(g => ({
      ...g,
      items: g.items.filter(i => i.name.toLowerCase().includes(q))
    })).filter(g => g.items.length > 0);
  }, [search]);

  const activeThemeLabel = THEMES.find(t => t.key === activeTheme)?.label ?? 'Domyślny';

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Toaster position="bottom-right" glass={glass} />

      {/* TopBar */}
      <header className="h-11 shrink-0 border-b border-border bg-background/90 backdrop-blur-xl z-50 flex items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm tracking-tight">NextByte</span>
          <span className="text-muted-foreground/40 text-xs font-medium">UI</span>
          <span className="text-[9px] font-mono bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full">v3.0.0</span>
        </div>

        <div className="flex-1" />

        {/* Glass context toggle */}
        <button
          onClick={() => setGlass(g => !g)}
          title="Przełącz tło glassmorphism w podglądach"
          className={cn(
            'text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all',
            glass
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border/60 text-muted-foreground hover:text-foreground'
          )}
        >
          Glass
        </button>

        {/* Theme picker */}
        <Select
          value={String(activeTheme)}
          onValueChange={v => applyTheme(v === 'null' ? null : v as ThemeKey)}
        >
          <SelectTrigger size="sm" className="w-32 text-xs h-7">
            <SelectValue>{activeThemeLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {THEMES.map(t => (
              <SelectItem key={String(t.key)} value={String(t.key)}>
                {t.isLight ? '☀ ' : '🌙 '}{t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Left Nav */}
        <nav className="w-52 shrink-0 border-r border-border flex flex-col overflow-hidden bg-card/10">
          <div className="p-2.5 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/60 pointer-events-none" />
              <input
                type="text"
                placeholder="Szukaj..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-background/40 border border-border/60 rounded-lg pl-7 pr-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2 scrollbar-none">
            {filteredNav.map(group => (
              <div key={group.id} className="mb-3">
                <div className="px-3 py-1 flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    {group.label}
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground/30 ml-auto">
                    /{group.pkg}
                  </span>
                </div>
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActive(item.id as NavId); setSearch(''); }}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-medium transition-all rounded-lg mx-1',
                      active === item.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    )}
                    style={{ width: 'calc(100% - 8px)' }}
                  >
                    {item.name}
                    <StatusDot status={item.status} />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Dialogs */}
      {dialogOpen === 'sm' && (
        <Dialog open onOpenChange={() => setDialogOpen(null)}>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Dialog — rozmiar sm</DialogTitle>
              <DialogDescription>Modal w małym wariancie do szybkich potwierdzeń.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(null)}>Anuluj</Button>
              <Button onClick={() => setDialogOpen(null)}>Potwierdź</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {dialogOpen === 'default' && (
        <Dialog open onOpenChange={() => setDialogOpen(null)}>
          <DialogContent size="default">
            <DialogHeader>
              <DialogTitle>Dialog — rozmiar default</DialogTitle>
              <DialogDescription>Modal z polem input i dwoma przyciskami akcji.</DialogDescription>
            </DialogHeader>
            <InputGroup label="Nazwa zasobu" required message="Do 32 znaków" messageVariant="default">
              <Input placeholder="nextbyte-component" />
            </InputGroup>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Anuluj</Button></DialogClose>
              <Button onClick={() => setDialogOpen(null)}>Zapisz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {dialogOpen === 'destructive' && (
        <Dialog open onOpenChange={() => setDialogOpen(null)}>
          <DialogContent variant="destructive" size="sm">
            <DialogHeader>
              <DialogTitle>Usuń trwale</DialogTitle>
              <DialogDescription>Tej operacji nie można cofnąć. Dane zostaną usunięte na zawsze.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Anuluj</Button></DialogClose>
              <Button variant="destructive" onClick={() => setDialogOpen(null)}>Usuń</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  /* ───────────────────────────────────────────────────────── */
  function renderPage() {
    switch (active) {

      /* ── BUTTON ─────────────────────────────────────────── */
      case 'button': return (
        <>
          <PageHeader
            name="Button" pkg="core" status="stable"
            description="Interaktywny element wywołujący akcje. Osiem wariantów wizualnych i pięć rozmiarów. Domyślny wariant nextbyte jest podpisem wizualnym NextByte."
          />
          <SectionLabel>Warianty</SectionLabel>
          <Preview glass={glass} tight>
            <div className="flex flex-wrap gap-3 items-center justify-center">
              {(['nextbyte','glass','gradient','outline','ghost','destructive','secondary','default'] as const).map(v => (
                <div key={v} className="flex flex-col items-center gap-1.5">
                  <Button variant={v}>{v}</Button>
                  <span className="text-[9px] font-mono text-muted-foreground/60">{v}</span>
                </div>
              ))}
            </div>
          </Preview>

          <div className="mt-6">
            <SectionLabel>Rozmiary</SectionLabel>
            <Preview glass={false} tight>
              <div className="flex flex-wrap items-center gap-3 justify-center">
                {(['sm','default','lg','xl'] as const).map(s => (
                  <div key={s} className="flex flex-col items-center gap-1.5">
                    <Button size={s}>Przycisk</Button>
                    <span className="text-[9px] font-mono text-muted-foreground/60">{s}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-1.5">
                  <Button size="icon"><Star className="h-4 w-4" /></Button>
                  <span className="text-[9px] font-mono text-muted-foreground/60">icon</span>
                </div>
              </div>
            </Preview>
          </div>

          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="btn-import" copied={copied} onCopy={copy}
              code={`import { Button } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="btn-usage" copied={copied} onCopy={copy}
              code={`<Button variant="nextbyte" size="default">\n  Kliknij mnie\n</Button>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'variant', type:"'nextbyte'|'glass'|'gradient'|'outline'|'ghost'|'destructive'|'secondary'|'default'", default:"'nextbyte'", desc:'Styl wizualny przycisku' },
              { name:'size',    type:"'sm'|'default'|'lg'|'xl'|'icon'", default:"'default'", desc:'Rozmiar przycisku' },
              { name:'disabled',type:'boolean', default:'false', desc:'Wyłącza interakcję' },
              { name:'asChild', type:'boolean', default:'false', desc:'Renduje jako element potomny (Radix Slot)' },
            ]} />
          </div>
        </>
      );

      /* ── BADGE ──────────────────────────────────────────── */
      case 'badge': return (
        <>
          <PageHeader name="Badge" pkg="core" status="stable"
            description="Etykieta statusu lub kategorii. Siedem wariantów, trzy rozmiary, dwa kształty, opcjonalna kropka statusu." />
          <SectionLabel>Warianty</SectionLabel>
          <Preview glass={glass} tight>
            <div className="flex flex-wrap gap-3 items-center justify-center">
              {(['default','primary','warning','destructive','outline','ghost','glass'] as const).map(v => (
                <div key={v} className="flex flex-col items-center gap-1.5">
                  <Badge variant={v} dot>{v}</Badge>
                  <span className="text-[9px] font-mono text-muted-foreground/60">{v}</span>
                </div>
              ))}
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Rozmiary i kształty</SectionLabel>
            <Preview glass={false} tight>
              <div className="flex flex-wrap gap-4 items-center justify-center">
                <Badge variant="primary" size="sm">sm</Badge>
                <Badge variant="primary" size="default">default</Badge>
                <Badge variant="primary" size="lg">lg</Badge>
                <Separator orientation="vertical" className="h-5" />
                <Badge variant="primary" shape="square">square</Badge>
                <Badge variant="primary" shape="rounded">rounded</Badge>
              </div>
            </Preview>
          </div>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="badge-import" copied={copied} onCopy={copy}
              code={`import { Badge } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="badge-usage" copied={copied} onCopy={copy}
              code={`<Badge variant="primary" size="default" shape="rounded" dot>\n  Status\n</Badge>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'variant', type:"'default'|'primary'|'warning'|'destructive'|'outline'|'ghost'|'glass'", default:"'default'", desc:'Styl wizualny' },
              { name:'size',    type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar odznaki' },
              { name:'shape',   type:"'rounded'|'square'",  default:"'rounded'",  desc:'Kształt rogów' },
              { name:'dot',     type:'boolean', default:'false', desc:'Wyświetla kropkę statusu po lewej' },
            ]} />
          </div>
        </>
      );

      /* ── INPUT ──────────────────────────────────────────── */
      case 'input': return (
        <>
          <PageHeader name="Input" pkg="core" status="new"
            description="Pole tekstowe z wariantami walidacyjnymi, ikonami i prefix/suffix. InputGroup opakowuje input z etykietą i komunikatem." />
          <SectionLabel>Warianty</SectionLabel>
          <Preview glass={glass}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {([
                { v:'default' as const, label:'Default' },
                { v:'ghost'   as const, label:'Ghost'   },
                { v:'error'   as const, label:'Error'   },
                { v:'success' as const, label:'Success' },
                { v:'glass'   as const, label:'Glass'   },
              ]).map(({ v, label }) => (
                <InputGroup key={v} label={label}>
                  <Input variant={v} placeholder={`variant="${v}"`} />
                </InputGroup>
              ))}
              <InputGroup label="Z ikoną" message="Wpisz adres email" messageVariant="default">
                <Input iconLeft={<Mail className="h-4 w-4" />} placeholder="nazwa@domena.pl" />
              </InputGroup>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="input-import" copied={copied} onCopy={copy}
              code={`import { Input, InputGroup } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="input-usage" copied={copied} onCopy={copy}
              code={`<InputGroup label="Email" required message="Podaj adres" messageVariant="default">\n  <Input variant="default" placeholder="nazwa@domena.pl" />\n</InputGroup>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — Input</SectionLabel>
            <PropsTable rows={[
              { name:'variant',   type:"'default'|'ghost'|'error'|'success'|'glass'", default:"'default'", desc:'Styl wizualny' },
              { name:'size',      type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar pola' },
              { name:'iconLeft',  type:'ReactNode', desc:'Ikona po lewej stronie' },
              { name:'iconRight', type:'ReactNode', desc:'Ikona po prawej stronie' },
              { name:'prefix',    type:'string', desc:'Stały prefix tekstowy (np. "https://")' },
            ]} />
          </div>
        </>
      );

      /* ── SELECT ─────────────────────────────────────────── */
      case 'select': return (
        <>
          <PageHeader name="Select" pkg="core" status="new"
            description="Lista wyboru oparta na Radix UI Select. Obsługuje grupy, separatory, etykiety i cztery warianty wizualne triggera." />
          <SectionLabel>Podgląd</SectionLabel>
          <Preview glass={glass} tight>
            <div className="flex flex-wrap gap-6 items-start justify-center">
              {(['default','ghost','glass','outline'] as const).map(v => (
                <div key={v} className="flex flex-col items-center gap-1.5 w-40">
                  <Select>
                    <SelectTrigger variant={v} size="default"><SelectValue placeholder={`${v}`} /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Opcje</SelectLabel>
                        <SelectItem value="a">Opcja A</SelectItem>
                        <SelectItem value="b">Opcja B</SelectItem>
                        <SelectItem value="c">Opcja C</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <span className="text-[9px] font-mono text-muted-foreground/60">{v}</span>
                </div>
              ))}
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="select-import" copied={copied} onCopy={copy}
              code={`import {\n  Select, SelectTrigger, SelectValue,\n  SelectContent, SelectItem,\n  SelectGroup, SelectLabel, SelectSeparator\n} from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="select-usage" copied={copied} onCopy={copy}
              code={`<Select>\n  <SelectTrigger variant="default">\n    <SelectValue placeholder="Wybierz..." />\n  </SelectTrigger>\n  <SelectContent>\n    <SelectGroup>\n      <SelectLabel>Kategoria</SelectLabel>\n      <SelectItem value="x">Opcja X</SelectItem>\n    </SelectGroup>\n  </SelectContent>\n</Select>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — SelectTrigger</SectionLabel>
            <PropsTable rows={[
              { name:'variant', type:"'default'|'ghost'|'glass'|'outline'", default:"'default'", desc:'Styl wizualny triggera' },
              { name:'size',    type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar triggera' },
            ]} />
          </div>
        </>
      );

      /* ── AVATAR ─────────────────────────────────────────── */
      case 'avatar': return (
        <>
          <PageHeader name="Avatar" pkg="core" status="new"
            description="Awatar użytkownika z inicjałami jako fallback, wskaźnikami statusu i grupowaniem. Obsługuje kółko i kwadrat." />
          <SectionLabel>Rozmiary i statusy</SectionLabel>
          <Preview glass={glass} tight>
            <div className="flex flex-col gap-6 items-center">
              <div className="flex items-end gap-4">
                {(['xs','sm','default','lg','xl','2xl'] as const).map(s => (
                  <div key={s} className="flex flex-col items-center gap-1.5">
                    <Avatar fallback="Artur Bącik" size={s} status="online" glass={glass} />
                    <span className="text-[9px] font-mono text-muted-foreground/60">{s}</span>
                  </div>
                ))}
              </div>
              <Separator className="w-full" />
              <div className="flex items-center gap-4">
                {(['online','busy','away','offline'] as const).map(st => (
                  <div key={st} className="flex flex-col items-center gap-1.5">
                    <Avatar fallback="NB" status={st} glass={glass} />
                    <span className="text-[9px] font-mono text-muted-foreground/60">{st}</span>
                  </div>
                ))}
                <Separator orientation="vertical" className="h-10" />
                <div className="flex flex-col items-center gap-1.5">
                  <Avatar fallback="NB" shape="square" status="online" glass={glass} />
                  <span className="text-[9px] font-mono text-muted-foreground/60">square</span>
                </div>
              </div>
              <Separator className="w-full" />
              <AvatarGroup size="default" max={3} avatars={[
                { fallback:'Anna Kowalska' }, { fallback:'Piotr Nowak' },
                { fallback:'Maria Wójcik' }, { fallback:'Kasia Wiśniewska' }
              ]} />
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="avatar-import" copied={copied} onCopy={copy}
              code={`import { Avatar, AvatarGroup } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="avatar-usage" copied={copied} onCopy={copy}
              code={`<Avatar fallback="Artur Bącik" size="default" shape="circle" status="online" />\n\n<AvatarGroup\n  max={3}\n  size="default"\n  avatars={[\n    { fallback: 'Anna Kowalska' },\n    { fallback: 'Piotr Nowak' },\n  ]}\n/>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — Avatar</SectionLabel>
            <PropsTable rows={[
              { name:'fallback', type:'string', desc:'Imię i nazwisko — inicjały generowane automatycznie' },
              { name:'src',      type:'string', desc:'URL zdjęcia profilowego' },
              { name:'size',     type:"'xs'|'sm'|'default'|'lg'|'xl'|'2xl'", default:"'default'", desc:'Rozmiar awatara' },
              { name:'shape',    type:"'circle'|'square'", default:"'circle'", desc:'Kształt' },
              { name:'status',   type:"'online'|'offline'|'busy'|'away'", desc:'Wskaźnik statusu aktywności' },
              { name:'glass',    type:'boolean', default:'false', desc:'Szklany styl fallbacka' },
            ]} />
          </div>
        </>
      );

      /* ── SEPARATOR ──────────────────────────────────────── */
      case 'separator': return (
        <>
          <PageHeader name="Separator" pkg="core" status="stable"
            description="Linia podziału pozioma lub pionowa w sześciu wariantach. Obsługuje etykietę wyśrodkowaną." />
          <SectionLabel>Warianty</SectionLabel>
          <Preview glass={false}>
            <div className="flex flex-col gap-5 max-w-sm mx-auto">
              {(['default','primary','muted','dashed','gradient','fade'] as const).map(v => (
                <div key={v} className="flex flex-col gap-1.5">
                  <Separator variant={v} label={<Badge variant="outline" size="sm">{v}</Badge>} />
                </div>
              ))}
              <div className="flex items-center gap-4 h-10">
                <span className="text-xs text-muted-foreground">Pionowy</span>
                <Separator orientation="vertical" variant="primary" />
                <span className="text-xs text-muted-foreground">separator</span>
                <Separator orientation="vertical" />
                <span className="text-xs text-muted-foreground">koniec</span>
              </div>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="sep-import" copied={copied} onCopy={copy}
              code={`import { Separator } from '@nextbyte/core';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'variant',     type:"'default'|'primary'|'muted'|'dashed'|'gradient'|'fade'", default:"'default'", desc:'Styl separatora' },
              { name:'orientation', type:"'horizontal'|'vertical'", default:"'horizontal'", desc:'Kierunek separatora' },
              { name:'label',       type:'ReactNode', desc:'Opcjonalna etykieta wyśrodkowana' },
            ]} />
          </div>
        </>
      );

      /* ── SKELETON ───────────────────────────────────────── */
      case 'skeleton': return (
        <>
          <PageHeader name="Skeleton" pkg="core" status="stable"
            description="Placeholder ładowania. Skeleton bazowy, SkeletonText dla bloków tekstu, SkeletonTile dla gotowych kart." />
          <SectionLabel>Podgląd</SectionLabel>
          <Preview glass={false}>
            <div className="flex flex-col gap-6 max-w-sm mx-auto">
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-3">Linie</p>
                <Skeleton variant="shimmer" shape="line" className="h-4 w-3/4" />
                <Skeleton variant="shimmer" shape="line" className="h-3 w-1/2" />
                <Skeleton variant="shimmer" shape="line" className="h-3 w-5/6" />
              </div>
              <Separator />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-3">Blok tekstowy</p>
                <SkeletonText lines={3} lastLineWidth="40%" variant="shimmer" />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-3">Kafelek</p>
                  <SkeletonTile variant="shimmer" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-3">Default</p>
                  <SkeletonTile variant="default" />
                </div>
              </div>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="skel-import" copied={copied} onCopy={copy}
              code={`import { Skeleton, SkeletonText, SkeletonTile } from '@nextbyte/core';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — Skeleton</SectionLabel>
            <PropsTable rows={[
              { name:'variant', type:"'default'|'shimmer'", default:"'default'", desc:'Animacja — shimmer daje efekt przesuwającego się gradientu' },
              { name:'shape',   type:"'line'|'circle'|'rect'", default:"'rect'", desc:'Kształt elementu' },
            ]} />
          </div>
        </>
      );

      /* ── TOAST ──────────────────────────────────────────── */
      case 'toast': return (
        <>
          <PageHeader name="Toast" pkg="core" status="stable"
            description="Powiadomienie systemowe z auto-dismiss. Wymaga umieszczenia Toaster raz w drzewie aplikacji. Cztery warianty semantyczne + tryb glass." />
          <SectionLabel>Triggeruj powiadomienia</SectionLabel>
          <Preview glass={glass} tight>
            <div className="flex flex-col gap-3 items-center">
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="outline" size="sm" onClick={() => toast({ title:'Informacja', description:'Operacja trwa...', variant:'default' })}>
                  Default
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast({ title:'Sukces!', description:'Dane zostały zapisane.', variant:'success' })}>
                  Success
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast({ title:'Uwaga', description:'Czas sesji wygasa.', variant:'warning' })}>
                  Warning
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast({ title:'Błąd', description:'Połączenie przerwane.', variant:'destructive' })}>
                  Destructive
                </Button>
              </div>
              {glass && (
                <p className="text-[10px] text-primary/70 font-medium">
                  ✦ Glass aktywny — włącz w topbarze aby zobaczyć efekt na toastach
                </p>
              )}
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="toast-import" copied={copied} onCopy={copy}
              code={`import { Toaster, useToast } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="toast-usage" copied={copied} onCopy={copy}
              code={`// Raz w App.tsx:\n<Toaster position="bottom-right" glass={false} />\n\n// W komponencie:\nconst { toast } = useToast();\n\ntoast({\n  title: 'Sukces!',\n  description: 'Dane zostały zapisane.',\n  variant: 'success',\n});`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — Toaster</SectionLabel>
            <PropsTable rows={[
              { name:'position', type:"'top-right'|'top-center'|'bottom-right'|'bottom-center'", default:"'bottom-right'", desc:'Pozycja kontenera powiadomień' },
              { name:'glass',    type:'boolean', default:'false', desc:'Glassmorphism zamiast bg-card (nb-glass-static)' },
            ]} />
          </div>
          <div className="mt-4"><SectionLabel>Props — toast()</SectionLabel>
            <PropsTable rows={[
              { name:'title',       type:'string', desc:'Nagłówek powiadomienia' },
              { name:'description', type:'string', desc:'Treść pomocnicza' },
              { name:'variant',     type:"'default'|'success'|'warning'|'destructive'", default:"'default'", desc:'Typ semantyczny' },
              { name:'duration',    type:'number', default:'4000', desc:'Czas wyświetlania w ms (0 = nie znika)' },
            ]} />
          </div>
        </>
      );

      /* ── METRICBAR ──────────────────────────────────────── */
      case 'metricbar': return (
        <>
          <PageHeader name="MetricBar" pkg="core" status="new"
            description="Blokowy wskaźnik wartości do wizualizacji metryk modeli AI, zasobów systemowych lub wskaźników KPI." />
          <SectionLabel>Kolory i rozmiary</SectionLabel>
          <Preview glass={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-lg mx-auto">
              <div className="flex flex-col gap-3">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Warianty kolorów</p>
                <MetricBar label="Primary"     value={7} color="primary"     showValue />
                <MetricBar label="Success"     value={8} color="success"     showValue />
                <MetricBar label="Warning"     value={4} color="warning"     showValue />
                <MetricBar label="Destructive" value={2} color="destructive" showValue />
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Rozmiary</p>
                <MetricBar label="Small (sm)"    value={6} size="sm"      color="success" />
                <MetricBar label="Default"       value={6} size="default" color="success" />
                <MetricBar label="Large (lg)"    value={6} size="lg"      color="success" />
              </div>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="metric-import" copied={copied} onCopy={copy}
              code={`import { MetricBar } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="metric-usage" copied={copied} onCopy={copy}
              code={`<MetricBar label="Inteligencja" value={7} max={10} color="success" showValue />`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'label',     type:'string', desc:'Etykieta metryki' },
              { name:'value',     type:'number', desc:'Wartość aktualna' },
              { name:'max',       type:'number', default:'10', desc:'Wartość maksymalna' },
              { name:'color',     type:"'primary'|'success'|'warning'|'destructive'", default:"'primary'", desc:'Kolor wypełnienia' },
              { name:'size',      type:"'sm'|'default'|'lg'", default:"'default'", desc:'Wysokość paska' },
              { name:'showValue', type:'boolean', default:'false', desc:'Wyświetla wartość numeryczną' },
            ]} />
          </div>
        </>
      );

      /* ── PANEL ──────────────────────────────────────────── */
      case 'panel': return (
        <>
          <PageHeader name="Panel" pkg="layout" status="beta"
            description="Kontener z nagłówkiem, licznikiem elementów, ikoną, opcją zwijania i wbudowaną wyszukiwarką." />
          <SectionLabel>Podgląd</SectionLabel>
          <Preview glass={glass}>
            <div className="max-w-xs mx-auto">
              <Panel
                icon={<Star className="h-4 w-4" />}
                title="Ulubione"
                count={5}
                collapsible
                className={glass ? 'nb-glass' : ''}
                onSearch={() => toast({ title:'Panel', description:'Wyszukiwarka otwarta.' })}
              >
                <div className="p-3 space-y-1">
                  {['Komponent A','Komponent B','Komponent C'].map(t => (
                    <div key={t} className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40 cursor-pointer">{t}</div>
                  ))}
                </div>
              </Panel>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="panel-import" copied={copied} onCopy={copy}
              code={`import { Panel } from '@nextbyte/layout';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'title',      type:'string', desc:'Tytuł nagłówka' },
              { name:'icon',       type:'ReactNode', desc:'Ikona przy tytule' },
              { name:'count',      type:'number', desc:'Licznik wyświetlany w nagłówku' },
              { name:'collapsible',type:'boolean', default:'false', desc:'Dodaje przycisk zwijania' },
              { name:'onSearch',   type:'() => void', desc:'Callback ikony wyszukiwania' },
            ]} />
          </div>
        </>
      );

      /* ── SIDEBAR ────────────────────────────────────────── */
      case 'sidebar': return (
        <>
          <PageHeader name="Sidebar" pkg="layout" status="beta"
            description="Nawigacja boczna ze zwijaniem, sekcjami, elementami z ikonami i paskiem użytkownika w stopce." />
          <SectionLabel>Podgląd</SectionLabel>
          <Preview glass={glass} tight>
            <div className="h-72 flex rounded-xl border border-border/60 overflow-hidden">
              <Sidebar collapsible defaultCollapsed={false} className={glass ? 'nb-glass' : ''}>
                <SidebarHeader logo={<span className="font-heading text-xs font-bold text-primary">NextByte</span>} />
                <div className="flex-1 p-2 space-y-3 overflow-y-auto scrollbar-none">
                  <SidebarSection label="Moduły">
                    <SidebarItem icon={<Layers className="h-4 w-4" />} label="Komponenty" active />
                    <SidebarItem icon={<Flame className="h-4 w-4" />} label="Statystyki" />
                    <SidebarItem icon={<Settings className="h-4 w-4" />} label="Ustawienia" />
                  </SidebarSection>
                </div>
                <SidebarUserBar avatar={<Avatar fallback="AB" size="xs" />} name="Artur Bącik" role="Admin" />
              </Sidebar>
              <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground bg-muted/5 p-4">
                Kliknij ↙ aby zwinąć sidebar
              </div>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="sidebar-import" copied={copied} onCopy={copy}
              code={`import {\n  Sidebar, SidebarHeader, SidebarSection,\n  SidebarItem, SidebarUserBar\n} from '@nextbyte/layout';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — Sidebar</SectionLabel>
            <PropsTable rows={[
              { name:'collapsible',     type:'boolean', default:'false', desc:'Włącza przycisk zwijania' },
              { name:'defaultCollapsed',type:'boolean', default:'false', desc:'Domyślnie zwinięty' },
            ]} />
          </div>
        </>
      );

      /* ── TABS ───────────────────────────────────────────── */
      case 'tabs': return (
        <>
          <PageHeader name="Tabs" pkg="layout" status="stable"
            description="Zakładki w czterech wariantach wizualnych i trzech rozmiarach. Oparty na Radix UI Tabs." />
          <SectionLabel>Warianty</SectionLabel>
          <Preview glass={glass}>
            <div className="flex flex-col gap-6">
              {(['underline','pills','card','glass'] as const).map(v => (
                <div key={v}>
                  <p className="text-[10px] font-mono text-muted-foreground/60 mb-2">{v}</p>
                  <Tabs variant={v} defaultValue="a">
                    <TabsList>
                      <TabsTrigger value="a"><LayoutDashboard className="h-3.5 w-3.5" /> Pulpit</TabsTrigger>
                      <TabsTrigger value="b">Analityka</TabsTrigger>
                      <TabsTrigger value="c">Ustawienia</TabsTrigger>
                    </TabsList>
                    <TabsContent value="a"><div className="text-xs text-muted-foreground p-2">Zawartość zakładki Pulpit</div></TabsContent>
                    <TabsContent value="b"><div className="text-xs text-muted-foreground p-2">Zawartość zakładki Analityka</div></TabsContent>
                    <TabsContent value="c"><div className="text-xs text-muted-foreground p-2">Zawartość zakładki Ustawienia</div></TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="tabs-import" copied={copied} onCopy={copy}
              code={`import { Tabs, TabsList, TabsTrigger, TabsContent } from '@nextbyte/layout';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — Tabs</SectionLabel>
            <PropsTable rows={[
              { name:'variant', type:"'underline'|'pills'|'card'|'glass'", default:"'underline'", desc:'Styl wizualny zakładek' },
              { name:'size',    type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar triggerów' },
            ]} />
          </div>
        </>
      );

      /* ── DIALOG ─────────────────────────────────────────── */
      case 'dialog': return (
        <>
          <PageHeader name="Dialog" pkg="layout" status="beta"
            description="Okno modalne z animowanym wejściem, nakryciem tła i obsługą klawisza Escape. Wariant destructive dodaje czerwony pasek." />
          <SectionLabel>Otwórz dialog</SectionLabel>
          <Preview glass={false} tight>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen('sm')}>Dialog sm</Button>
              <Button size="sm" onClick={() => setDialogOpen('default')}>Dialog default</Button>
              <Button variant="destructive" size="sm" onClick={() => setDialogOpen('destructive')}>Potwierdzenie usunięcia</Button>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="dialog-import" copied={copied} onCopy={copy}
              code={`import {\n  Dialog, DialogContent, DialogHeader, DialogFooter,\n  DialogTitle, DialogDescription, DialogClose\n} from '@nextbyte/layout';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="dialog-usage" copied={copied} onCopy={copy}
              code={`<Dialog open={open} onOpenChange={setOpen}>\n  <DialogContent size="default">\n    <DialogHeader>\n      <DialogTitle>Tytuł</DialogTitle>\n      <DialogDescription>Opis operacji.</DialogDescription>\n    </DialogHeader>\n    <DialogFooter>\n      <DialogClose asChild>\n        <Button variant="ghost">Anuluj</Button>\n      </DialogClose>\n      <Button>Potwierdź</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — DialogContent</SectionLabel>
            <PropsTable rows={[
              { name:'size',    type:"'sm'|'default'|'lg'|'xl'", default:"'default'", desc:'Szerokość okna' },
              { name:'variant', type:"'default'|'destructive'", default:"'default'", desc:'Destructive dodaje czerwony pasek na górze' },
            ]} />
          </div>
        </>
      );

      /* ── DROPDOWN ───────────────────────────────────────── */
      case 'dropdown': return (
        <>
          <PageHeader name="Dropdown Menu" pkg="layout" status="new"
            description="Menu kontekstowe z obsługą grup, separatorów, skrótów klawiszowych, podmenu i checkboxów. Oparty na Radix UI." />
          <SectionLabel>Przykłady</SectionLabel>
          <Preview glass={glass} tight>
            <div className="flex flex-wrap gap-6 items-start justify-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Podstawowe</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Konto</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><Users className="h-4 w-4" /> Profil <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem>
                    <DropdownMenuItem><Settings className="h-4 w-4" /> Ustawienia <DropdownMenuShortcut>⌘,</DropdownMenuShortcut></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger><Globe className="h-4 w-4" /> Więcej</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem><Bell className="h-4 w-4" /> Powiadomienia</DropdownMenuItem>
                        <DropdownMenuItem><Shield className="h-4 w-4" /> Prywatność</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive><Trash2 className="h-4 w-4" /> Wyloguj <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Z checkboxami</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="secondary" size="sm">Widok</Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Kolumny</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>Nazwa</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>Status</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Priorytet</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Kontekstowe</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">⋯</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Eye className="h-4 w-4" /> Podgląd</DropdownMenuItem>
                    <DropdownMenuItem><Download className="h-4 w-4" /> Eksportuj</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive><Trash2 className="h-4 w-4" /> Usuń</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="dropdown-import" copied={copied} onCopy={copy}
              code={`import {\n  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,\n  DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,\n  DropdownMenuSeparator, DropdownMenuShortcut\n} from '@nextbyte/layout';`} />
          </div>
        </>
      );

      /* ── POPOVER ────────────────────────────────────────── */
      case 'popover': return (
        <>
          <PageHeader name="Popover" pkg="layout" status="new"
            description="Pływający panel zakotwiczony do elementu triggera z automatycznym pozycjonowaniem. Zawsze renderuje nb-glass-static." />
          <SectionLabel>Przykłady</SectionLabel>
          <Preview glass={glass} tight>
            <div className="flex flex-wrap gap-6 justify-center items-start">
              {[
                { label:'Informacyjny', side:'bottom' as const, children: (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">NextByte UI</p>
                    <p className="text-xs text-muted-foreground">Modularna biblioteka komponentów na Radix + Tailwind.</p>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-border"><Badge variant="primary" size="sm">v3.0</Badge></div>
                  </div>
                )},
                { label:'Formularz', side:'bottom' as const, children: (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold">Filtruj wyniki</p>
                    <Input placeholder="Szukaj..." className="h-7 text-xs" />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-7 text-xs">Zastosuj</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs">Reset</Button>
                    </div>
                  </div>
                )},
              ].map(({ label, side, children }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{label}</span>
                  <Popover>
                    <PopoverTrigger asChild><Button variant="outline" size="sm">{label}</Button></PopoverTrigger>
                    <PopoverContent side={side} align="center">{children}</PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="popover-import" copied={copied} onCopy={copy}
              code={`import { Popover, PopoverTrigger, PopoverContent } from '@nextbyte/layout';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — PopoverContent</SectionLabel>
            <PropsTable rows={[
              { name:'side',  type:"'top'|'bottom'|'left'|'right'", default:"'bottom'", desc:'Strona względem triggera' },
              { name:'align', type:"'start'|'center'|'end'", default:"'center'", desc:'Wyrównanie względem triggera' },
            ]} />
          </div>
        </>
      );

      /* ── TABLE ──────────────────────────────────────────── */
      case 'table': return (
        <>
          <PageHeader name="Table" pkg="layout" status="stable"
            description="Tabela danych z nagłówkami sortowania, zaznaczeniem wierszy, trzema wariantami wizualnymi i rozmiarami." />
          <SectionLabel>Podgląd</SectionLabel>
          <Preview glass={glass} tight>
            <Table variant="default" size="sm">
              <TableHeader>
                <TableRow>
                  <TableHead sortable sortDirection="asc">Komponent</TableHead>
                  <TableHead>Plik</TableHead>
                  <TableHead align="right">Linie</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_TABLE.map((row, i) => (
                  <TableRow key={row.name} interactive selected={i===1}>
                    <TableCell className="font-semibold text-xs">{row.name}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{row.file}</TableCell>
                    <TableCell align="right" className="text-xs">{row.lines}</TableCell>
                    <TableCell>
                      <Badge
                        variant={row.status==='stable'?'primary':row.status==='new'?'default':'warning'}
                        size="sm" shape="square"
                      >{row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="table-import" copied={copied} onCopy={copy}
              code={`import {\n  Table, TableHeader, TableBody,\n  TableRow, TableHead, TableCell\n} from '@nextbyte/layout';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — Table</SectionLabel>
            <PropsTable rows={[
              { name:'variant', type:"'default'|'bordered'|'striped'", default:"'default'", desc:'Styl wizualny tabeli' },
              { name:'size',    type:"'sm'|'default'|'lg'", default:"'default'", desc:'Gęstość wierszy' },
            ]} />
          </div>
        </>
      );

      /* ── SPARKLINE ──────────────────────────────────────── */
      case 'sparkline': return (
        <>
          <PageHeader name="Sparkline" pkg="analytics" status="stable"
            description="Mini-wykres SVG z wygładzaniem krzywa Béziera i wypełnieniem. Trzy typy trendu zmieniają paletę kolorów." />
          <SectionLabel>Trendy</SectionLabel>
          <Preview glass={false} tight>
            <div className="flex flex-wrap gap-8 items-center justify-center">
              {([
                { data:[20,25,18,30,28,38,42,50,55,62], trend:'positive' as const, label:'Wzrost' },
                { data:[80,72,68,74,60,55,48,42,38,20], trend:'negative' as const, label:'Spadek' },
                { data:[40,42,40,44,42,43,41,42,40],    trend:'neutral'  as const, label:'Stabilny' },
              ]).map(({ data, trend, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <Sparkline data={data} trend={trend} width={120} height={44} smooth showFill />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="spark-import" copied={copied} onCopy={copy}
              code={`import { Sparkline } from '@nextbyte/analytics';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'data',     type:'number[]', desc:'Tablica wartości do wykresu' },
              { name:'trend',    type:"'positive'|'negative'|'neutral'", default:"'neutral'", desc:'Paleta kolorów' },
              { name:'width',    type:'number', default:'120', desc:'Szerokość SVG w px' },
              { name:'height',   type:'number', default:'40',  desc:'Wysokość SVG w px' },
              { name:'smooth',   type:'boolean', default:'true', desc:'Wygładza linię krzywą Béziera' },
              { name:'showFill', type:'boolean', default:'false', desc:'Wypełnienie pod linią' },
            ]} />
          </div>
        </>
      );

      /* ── STATCARD ───────────────────────────────────────── */
      case 'statcard': return (
        <>
          <PageHeader name="StatCard" pkg="analytics" status="stable"
            description="Karta metryki z etykietą, wartością główną, trendem i mini-sparkline. Cztery warianty kolorystyczne." />
          <SectionLabel>Podgląd</SectionLabel>
          <Preview glass={glass}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard label="Przychód" value="$48 295" description="+12.5% vs poprzedni tydzień" trend="positive" trendValue="+12.5%" sparklineData={[40,42,41,45,48,50,55]} icon={<BarChart3 className="h-4 w-4" />} variant="primary" className={glass ? 'nb-glass' : ''} />
              <StatCard label="Saldo" value="◈ 14 Byte" description="−10 ¢/dzień · na wyczerpaniu" trend="negative" trendValue="−10 ¢/dzień" sparklineData={[80,72,68,60,55,48,14]} icon={<Activity className="h-4 w-4" />} className={glass ? 'nb-glass' : ''} />
              <StatCard label="Integracje" value="4 aktywne" description="+3 w tym tygodniu" trend="positive" trendValue="+3" sparklineData={[1,1,2,2,3,4,4]} icon={<Package className="h-4 w-4" />} variant="success" className={glass ? 'nb-glass' : ''} />
              <StatCard label="Błędy" value="12" description="−5 vs wczoraj" trend="negative" trendValue="−5" sparklineData={[20,18,15,17,14,13,12]} icon={<Bell className="h-4 w-4" />} variant="destructive" className={glass ? 'nb-glass' : ''} />
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="statcard-import" copied={copied} onCopy={copy}
              code={`import { StatCard } from '@nextbyte/analytics';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="statcard-usage" copied={copied} onCopy={copy}
              code={`<StatCard\n  label="Przychód"\n  value="$48 295"\n  description="+12.5% vs poprzedni tydzień"\n  trend="positive"\n  trendValue="+12.5%"\n  sparklineData={[40, 42, 45, 50, 55]}\n  icon={<BarChart3 className="h-4 w-4" />}\n  variant="primary"\n/>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'label',         type:'string', desc:'Etykieta metryki' },
              { name:'value',         type:'string', desc:'Wartość główna' },
              { name:'description',   type:'string', desc:'Opis pomocniczy pod wartością' },
              { name:'trend',         type:"'positive'|'negative'|'neutral'", desc:'Kierunek trendu' },
              { name:'trendValue',    type:'string', desc:'Tekstowa wartość trendu np. "+12.5%"' },
              { name:'sparklineData', type:'number[]', desc:'Dane do mini-wykresu' },
              { name:'icon',          type:'ReactNode', desc:'Ikona w prawym górnym rogu' },
              { name:'variant',       type:"'default'|'primary'|'success'|'destructive'", default:"'default'", desc:'Akcent kolorystyczny' },
            ]} />
          </div>
        </>
      );

      /* ── ACTIVITYFEED ───────────────────────────────────── */
      case 'activityfeed': return (
        <>
          <PageHeader name="ActivityFeed" pkg="analytics" status="stable"
            description="Dziennik aktywności z osią czasu, wskaźnikami stanu (done/in-progress/pending) i opcją live." />
          <SectionLabel>Podgląd</SectionLabel>
          <Preview glass={glass}>
            <ActivityFeed
              title="Dziennik aktywności"
              live
              className={glass ? 'nb-glass' : ''}
              items={[
                { icon:<Cpu className="h-4 w-4" />,      title:'Generowanie pakietów @nextbyte', status:'in-progress', description:'Trwa kompilacja TypeScript...' },
                { icon:<Award className="h-4 w-4" />,    title:'Odblokowano osiągnięcie: Nowa Era', status:'done', date:'2 min temu' },
                { icon:<Settings className="h-4 w-4" />, title:'Zaktualizowano zmienne HSL', status:'done', date:'5 min temu' },
                { icon:<Package className="h-4 w-4" />,  title:'Zaplanowane wdrożenie v3.1', status:'pending' },
              ]}
            />
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="feed-import" copied={copied} onCopy={copy}
              code={`import { ActivityFeed } from '@nextbyte/analytics';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'title', type:'string', desc:'Nagłówek feedu' },
              { name:'live',  type:'boolean', default:'false', desc:'Wyświetla pulsujący wskaźnik "live"' },
              { name:'items', type:'ActivityFeedItem[]', desc:'Lista elementów aktywności' },
            ]} />
          </div>
        </>
      );

      /* ── ALERTCARD ──────────────────────────────────────── */
      case 'alertcard': return (
        <>
          <PageHeader name="AlertCard" pkg="analytics" status="beta"
            description="Karta powiadomienia systemowego z czterema priorytetami, paginacją i przyciskiem akcji." />
          <SectionLabel>Warianty</SectionLabel>
          <Preview glass={glass}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { variant:'info'    as const, title:'Nowa wersja dostępna', desc:'NextByte v3.1 jest gotowy do aktualizacji.' },
                { variant:'warning' as const, title:'Wygasające klucze API', desc:'Klucze wygasną za 48h. Zweryfikuj uprawnienia.' },
                { variant:'success' as const, title:'Wdrożenie ukończone',  desc:'Wszystkie kontenery działają poprawnie.' },
                { variant:'destructive' as const, title:'Błąd połączenia',  desc:'Host docelowy nie odpowiada od 5 minut.' },
              ]).map(({ variant, title, desc }) => (
                <AlertCard
                  key={variant}
                  variant={variant}
                  title={title}
                  description={desc}
                  priority="high"
                  className={glass ? 'nb-glass' : ''}
                  action={{ label:'Działaj', onClick:() => toast({ title, variant:'default' }) }}
                  currentPage={alertPage}
                  totalPages={3}
                  onPrev={() => setAlertPage(p=>Math.max(1,p-1))}
                  onNext={() => setAlertPage(p=>Math.min(3,p+1))}
                />
              ))}
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="alert-import" copied={copied} onCopy={copy}
              code={`import { AlertCard } from '@nextbyte/analytics';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'variant',     type:"'info'|'warning'|'success'|'error'", default:"'info'", desc:'Typ semantyczny' },
              { name:'title',       type:'string', desc:'Tytuł alertu' },
              { name:'description', type:'string', desc:'Treść alertu' },
              { name:'priority',    type:"'low'|'medium'|'high'|'critical'", desc:'Priorytet' },
              { name:'action',      type:'{ label: string; onClick: () => void }', desc:'Przycisk akcji' },
              { name:'currentPage', type:'number', desc:'Aktualna strona paginacji' },
              { name:'totalPages',  type:'number', desc:'Łączna liczba alertów' },
            ]} />
          </div>
        </>
      );

      /* ── TILE ───────────────────────────────────────────── */
      case 'tile': return (
        <>
          <PageHeader name="Tile" pkg="analytics" status="stable"
            description="Uniwersalny kafelek z trzema intencjami, trzema elewacjami i opcją hover-lift. Złożony z pod-komponentów." />
          <SectionLabel>Intencje</SectionLabel>
          <Preview glass={glass}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([
                { intent:'neutralna' as const, pill:'neutralna' },
                { intent:'akcent'    as const, pill:'akcent'    },
                { intent:'krytyczna' as const, pill:'krytyczna' },
              ]).map(({ intent, pill }) => (
                <Tile key={intent} intencja={intent} elewacja="uniesiona" interaktywny className={glass ? 'nb-glass' : ''}>
                  <TileHeader
                    ikona={LayoutDashboard}
                    tytul="Karta systemu"
                    intencja={intent}
                    poPrawej={<TilePill intencja={intent}>{pill}</TilePill>}
                  />
                  <TileRow ikona={Users} poPrawej="stable">Moduł główny</TileRow>
                  <TileFooter>
                    <TileAction rodzaj="glowna">Wyświetl</TileAction>
                    <TileAction rodzaj="usun" ikona={Trash2} samaIkona aria-label="Usuń" />
                  </TileFooter>
                </Tile>
              ))}
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="tile-import" copied={copied} onCopy={copy}
              code={`import {\n  Tile, TileHeader, TileRow, TilePill,\n  TileAction, TileFooter\n} from '@nextbyte/analytics';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — Tile</SectionLabel>
            <PropsTable rows={[
              { name:'intencja',    type:"'neutralna'|'akcent'|'krytyczna'", default:"'neutralna'", desc:'Paleta kolorów kafelka' },
              { name:'elewacja',    type:"'plaska'|'uniesiona'|'wyzej'",     default:"'uniesiona'",  desc:'Poziom cienia' },
              { name:'interaktywny',type:'boolean', default:'false', desc:'Dodaje hover-lift i cursor-pointer' },
            ]} />
          </div>
        </>
      );

      /* ── COMMANDSEARCH ──────────────────────────────────── */
      case 'commandsearch': return (
        <>
          <PageHeader name="CommandSearch" pkg="patterns" status="stable"
            description="Pasek szybkiego wyszukiwania ⌘K w trzech rozmiarach. Wywołuje callback onOpen — integracja z własnym modal search." />
          <SectionLabel>Rozmiary</SectionLabel>
          <Preview glass={glass}>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              {(['sm','default','lg'] as const).map(s => (
                <div key={s} className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono text-muted-foreground/60">{s}</span>
                  <CommandSearch
                    size={s}
                    placeholder={`Wyszukaj... (${s})`}
                    shortcut="⌘K"
                    className={glass ? 'nb-glass' : ''}
                    onOpen={() => toast({ title:'CommandSearch', description:`Otwarto rozmiar ${s}.` })}
                  />
                </div>
              ))}
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="cs-import" copied={copied} onCopy={copy}
              code={`import { CommandSearch } from '@nextbyte/patterns';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'size',        type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar przycisku wyszukiwania' },
              { name:'placeholder', type:'string', desc:'Tekst placeholder' },
              { name:'shortcut',    type:'string', desc:'Skrót klawiszowy wyświetlany po prawej' },
              { name:'onOpen',      type:'() => void', desc:'Callback wywołany przy kliknięciu' },
            ]} />
          </div>
        </>
      );

      /* ── QUICKNAV ───────────────────────────────────────── */
      case 'quicknav': return (
        <>
          <PageHeader name="QuickNav" pkg="patterns" status="stable"
            description="Siatka skrótów nawigacyjnych z wypełnionymi i pustymi slotami. Trzy rozmiary elementów." />
          <SectionLabel>Podgląd</SectionLabel>
          <Preview glass={glass} tight>
            <QuickNav
              slots={6}
              size="default"
              className={glass ? 'nb-glass rounded-xl p-2' : ''}
              items={[
                { icon:<MessageSquare className="h-4 w-4" />, label:'Konwersacje', sublabel:'AI' },
                { icon:<Calendar className="h-4 w-4" />,      label:'Kalendarz' },
                { icon:<BarChart3 className="h-4 w-4" />,     label:'Analityka' },
                { icon:<Shield className="h-4 w-4" />,        label:'Bezpieczeństwo' },
              ]}
              onAddSlot={() => toast({ title:'QuickNav', description:'Kliknięto pusty slot.' })}
            />
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="qn-import" copied={copied} onCopy={copy}
              code={`import { QuickNav } from '@nextbyte/patterns';`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'slots',     type:'number', desc:'Łączna liczba slotów (wypełnione + puste)' },
              { name:'size',      type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar kafelka' },
              { name:'items',     type:'QuickNavItem[]', desc:'Lista wypełnionych slotów' },
              { name:'onAddSlot', type:'() => void', desc:'Callback kliknięcia pustego slotu' },
            ]} />
          </div>
        </>
      );

      /* ── MODELSEARCH ────────────────────────────────────── */
      case 'modelsearch': return (
        <>
          <PageHeader name="ModelSearch" pkg="patterns" status="new"
            description="Selektor modeli AI z wyszukiwarką, grupowaniem, panelem metryk i konfiguracją. Podpina się do własnej listy modeli." />
          <SectionLabel>Podgląd</SectionLabel>
          <Preview glass={glass}>
            <div className="max-w-md mx-auto">
              <p className="text-[10px] text-muted-foreground mb-3">Kliknij trigger i najedź na model by zobaczyć metryki</p>
              <ModelSearch
                models={DEMO_MODELS}
                value={selectedModel}
                onValueChange={id => setSelectedModel(id)}
                glass={glass}
              />
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="ms-import" copied={copied} onCopy={copy}
              code={`import { ModelSearch, type Model } from '@nextbyte/patterns';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="ms-usage" copied={copied} onCopy={copy}
              code={`const models: Model[] = [\n  {\n    id: 'pro',\n    name: 'Pro',\n    provider: 'NextByte',\n    description: 'Zaawansowane rozumowanie.',\n    costPerMessage: 2,\n    group: 'NextByte',\n    icon: '✨',\n    metrics: { intelligence: 8, speed: 8, context: 10, cost: 8 },\n  },\n];\n\n<ModelSearch\n  models={models}\n  value={selectedModel}\n  onValueChange={(id) => setSelectedModel(id)}\n/>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'models',        type:'Model[]', desc:'Lista dostępnych modeli' },
              { name:'value',         type:'string', desc:'ID aktualnie wybranego modelu' },
              { name:'onValueChange', type:'(id: string, model: Model) => void', desc:'Callback zmiany modelu' },
              { name:'size',          type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar triggera' },
              { name:'glass',         type:'boolean', default:'false', desc:'Szklany styl panelu metryk' },
            ]} />
          </div>
        </>
      );

      /* ── BGPATTERNS ─────────────────────────────────────── */
      case 'bgpatterns': return (
        <>
          <PageHeader name="BackgroundPatterns" pkg="patterns" status="stable"
            description="Wzorce tła SVG — Plus, Dots, Grid — z regulowanym rozmiarem, kryciem i opcjonalną maską radialną." />
          <SectionLabel>Podgląd interaktywny</SectionLabel>

          {/* Live preview */}
          <div className="relative h-56 rounded-2xl border border-border/60 overflow-hidden flex items-center justify-center">
            <PatternBackground
              pattern_type={bgPattern}
              pattern_color={bgPatternColor}
              pattern_size={bgPatternSize}
              pattern_opacity={bgPatternOpacity}
              background_color="transparent"
              fade
            />
            <div className="relative z-10 text-center">
              <span className="text-[10px] font-mono text-muted-foreground/60 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                {bgPattern} · {bgPatternSize}px · {Math.round(bgPatternOpacity * 100)}%
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 rounded-2xl border border-border/60 bg-card/20 p-5 grid grid-cols-2 gap-x-8 gap-y-5">
            {/* Type */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Typ wzorca</p>
              <div className="flex gap-2">
                {(['plus','dots','grid'] as const).map(t => (
                  <button key={t} onClick={() => setBgPattern(t)} className={cn(
                    'px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all',
                    bgPattern === t
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
                  )}>{t}</button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Kolor</p>
              <div className="flex items-center gap-2">
                {['#70BEFA','#34d399','#f59e0b','#e879f9','#f87171','#ffffff'].map(c => (
                  <button key={c} onClick={() => setBgPatternColor(c)} title={c}
                    className={cn('h-6 w-6 rounded-lg transition-all',
                      bgPatternColor === c ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground/50 scale-110' : 'scale-100 hover:scale-105'
                    )}
                    style={{ background: c }}
                  />
                ))}
                <input
                  type="color" value={bgPatternColor}
                  onChange={e => setBgPatternColor(e.target.value)}
                  title="Własny kolor"
                  className="h-6 w-6 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                />
              </div>
            </div>

            {/* Size slider */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                Rozmiar: <span className="text-foreground">{bgPatternSize}px</span>
              </p>
              <input
                type="range" min={12} max={120} step={4}
                value={bgPatternSize}
                onChange={e => setBgPatternSize(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground/40">12px</span>
                <span className="text-[9px] text-muted-foreground/40">120px</span>
              </div>
            </div>

            {/* Opacity slider */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                Krycie: <span className="text-foreground">{Math.round(bgPatternOpacity * 100)}%</span>
              </p>
              <input
                type="range" min={5} max={80} step={5}
                value={Math.round(bgPatternOpacity * 100)}
                onChange={e => setBgPatternOpacity(Number(e.target.value) / 100)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground/40">5%</span>
                <span className="text-[9px] text-muted-foreground/40">80%</span>
              </div>
            </div>
          </div>

          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="bp-import" copied={copied} onCopy={copy}
              code={`import { PatternBackground } from '@nextbyte/patterns';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="bp-usage" copied={copied} onCopy={copy}
              code={`<div className="relative h-48 w-full overflow-hidden">\n  <PatternBackground\n    pattern_type="${bgPattern}"\n    pattern_color="${bgPatternColor}"\n    pattern_size={${bgPatternSize}}\n    pattern_opacity={${bgPatternOpacity}}\n    background_color="transparent"\n    fade={true}\n  />\n  <div className="relative z-10">Treść...</div>\n</div>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'pattern_type',    type:"'plus'|'dots'|'grid'", desc:'Typ wzorca' },
              { name:'pattern_color',   type:'string', desc:'Kolor elementów wzorca (hex)' },
              { name:'pattern_size',    type:'number', default:'60', desc:'Rozmiar elementu wzorca w px' },
              { name:'pattern_opacity', type:'number', default:'0.3', desc:'Krycie wzorca (0–1)' },
              { name:'background_color',type:'string', desc:'Kolor tła (lub "transparent")' },
              { name:'fade',            type:'boolean', default:'false', desc:'Maska radialna wyblakająca krawędzie' },
            ]} />
          </div>
        </>
      );

      /* ── TECHGRID ───────────────────────────────────────── */
      case 'techgrid': return (
        <>
          <PageHeader name="TechGrid" pkg="patterns" status="stable"
            description="Siatka techniczna SVG jako element tła z maską radialną u góry. Idealna jako warstwa absolutna za treścią." />
          <SectionLabel>Podgląd</SectionLabel>
          <Preview glass={false} tight>
            <div className="relative h-40 w-full rounded-xl border border-border/60 bg-card overflow-hidden flex items-center justify-center">
              <TechGrid oczko={28} className="absolute inset-0 pointer-events-none" />
              <span className="relative z-10 text-xs font-semibold text-muted-foreground/80 bg-background/90 px-3 py-1.5 rounded-xl border border-border/80">
                TechGrid (oczko: 28px)
              </span>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="tg-import" copied={copied} onCopy={copy}
              code={`import { TechGrid } from '@nextbyte/patterns';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="tg-usage" copied={copied} onCopy={copy}
              code={`<div className="relative min-h-screen bg-background">\n  <TechGrid oczko={44} className="absolute inset-0 z-0 pointer-events-none" />\n  <div className="relative z-10">Treść strony...</div>\n</div>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'oczko', type:'number', default:'44', desc:'Rozmiar komórki siatki w px' },
            ]} />
          </div>
        </>
      );

      /* ── COLORS ─────────────────────────────────────────── */
      case 'colors': return (
        <>
          <PageHeader name="Colors & HSL" pkg="tokens" status="stable"
            description="22 zmienne kontraktu kolorystycznego NextByte. Wszystkie motywy nadpisują te same zmienne — komponenty reagują automatycznie." />
          <SectionLabel>Paleta aktywnego motywu</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONTRACT_VARS.map(varName => {
              const val = tick >= 0 ? readVar(varName) : '';
              return (
                <div key={varName} className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/30 p-2.5">
                  <div className="h-7 w-7 shrink-0 rounded-lg border border-border/40" style={{ background: val ? `hsl(${val})` : 'transparent' }} />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-[10px] font-mono font-semibold text-foreground truncate">{varName}</p>
                    <p className="text-[9px] font-mono text-muted-foreground truncate">{val || '—'}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6"><SectionLabel>Użycie w CSS</SectionLabel>
          <CodeBlock id="colors-usage" copied={copied} onCopy={copy}
            code={`.my-element {\n  background: hsl(var(--primary));\n  color: hsl(var(--primary-foreground));\n  border: 1px solid hsl(var(--border));\n}`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie w Tailwind</SectionLabel>
          <CodeBlock id="colors-tw" copied={copied} onCopy={copy}
            code={`<div className="bg-primary text-primary-foreground border border-border">`} />
          </div>
        </>
      );

      /* ── SHADOWS ────────────────────────────────────────── */
      case 'shadows': return (
        <>
          <PageHeader name="Shadows" pkg="tokens" status="stable"
            description="Trzy poziomy elewacji i wariant szklany. Każdy poziom jest dostępny jako klasa Tailwind i zmienna CSS." />
          <SectionLabel>Poziomy elewacji</SectionLabel>
          <div className="rounded-2xl border border-border/60 p-8 flex items-end justify-around gap-4 overflow-x-auto" style={{ background:'hsl(0 0% 16%)' }}>
            {([
              { label:'Płaska', sub:'shadow-none', idle:'none', hover:'var(--shadow-uniesiona)', dy:-6 },
              { label:'Uniesiona', sub:'shadow-uniesiona', idle:'var(--shadow-uniesiona)', hover:'var(--shadow-wyzej)', dy:-10 },
              { label:'Wyżej', sub:'shadow-wyzej', idle:'var(--shadow-wyzej)', hover:'0 4px 8px rgb(0 0 0/.14),0 28px 56px -20px rgb(0 0 0/.6),inset 0 1px 0 rgb(255 255 255/.14)', dy:-14 },
            ] as const).map((item, i) => {
              const h = hoveredShadow === i;
              return (
                <div key={item.sub} className="flex flex-col items-center gap-3 shrink-0">
                  <div
                    className="rounded-xl flex items-center justify-center text-[10px] font-bold cursor-default"
                    style={{ width:80+i*14, height:52+i*8, background:'hsl(0 0% 26%)', color:'hsl(0 0% 88%)', border:'1px solid hsl(0 0% 32%)', boxShadow:h?item.hover:item.idle, transform:`translateY(${h?item.dy:0}px)`, transition:'transform .22s ease,box-shadow .22s ease', marginBottom:i*4 }}
                    onMouseEnter={()=>setHoveredShadow(i)} onMouseLeave={()=>setHoveredShadow(null)}
                  >{item.label}</div>
                  <span className="text-[9px] font-mono text-center" style={{color:'hsl(0 0% 38%)'}}>{item.sub}</span>
                </div>
              );
            })}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="nb-glass rounded-xl flex items-center justify-center text-[10px] font-bold" style={{ width:108, height:70, color:'hsl(0 0% 75%)', marginBottom:12 }}>Szklana</div>
              <span className="text-[9px] font-mono text-center" style={{color:'hsl(0 0% 38%)'}}>.nb-glass</span>
            </div>
          </div>
          <div className="mt-6"><SectionLabel>Tokeny</SectionLabel>
          <CodeBlock id="shadows-css" copied={copied} onCopy={copy}
            code={`/* Tailwind */\nclassName="shadow-uniesiona"\nclassName="shadow-wyzej"\n\n/* CSS */\nbox-shadow: var(--shadow-uniesiona);\nbox-shadow: var(--shadow-wyzej);\nbox-shadow: var(--shadow-glass);\n\n/* Glass class */\nclassName="nb-glass"         /* z position:relative */\nclassName="nb-glass-static"  /* dla overlays/portali */`} />
          </div>
        </>
      );

      /* ── SWITCH ──────────────────────────────────────────── */
      case 'switch': return (
        <>
          <PageHeader name="Switch" pkg="core" status="new"
            description="Toggle on/off z opcjonalną etykietą i opisem. Trzy rozmiary. Oparty na Radix UI Switch." />
          <SectionLabel>Rozmiary i stany</SectionLabel>
          <Preview glass={glass} tight>
            <div className="flex flex-col gap-5 max-w-xs mx-auto">
              <div className="flex flex-col gap-3">
                {(['sm','default','lg'] as const).map(s => (
                  <div key={s} className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground/60">{s}</span>
                    <Switch size={s} defaultChecked={s === 'default'} />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <Switch
                  label="Powiadomienia push"
                  description="Otrzymuj alerty w czasie rzeczywistym"
                  checked={switchStates.a}
                  onCheckedChange={v => setSwitchStates(s => ({ ...s, a: v }))}
                />
                <Switch
                  label="Tryb ciemny"
                  checked={switchStates.b}
                  onCheckedChange={v => setSwitchStates(s => ({ ...s, b: v }))}
                />
                <Switch
                  label="Synchronizacja danych"
                  description="Co 5 minut"
                  checked={switchStates.c}
                  onCheckedChange={v => setSwitchStates(s => ({ ...s, c: v }))}
                />
                <Switch label="Wyłączony" disabled />
              </div>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="switch-import" copied={copied} onCopy={copy}
              code={`import { Switch } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="switch-usage" copied={copied} onCopy={copy}
              code={`<Switch\n  label="Powiadomienia push"\n  description="Otrzymuj alerty w czasie rzeczywistym"\n  checked={enabled}\n  onCheckedChange={setEnabled}\n/>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'checked',         type:'boolean', desc:'Stan kontrolowany' },
              { name:'onCheckedChange', type:'(checked: boolean) => void', desc:'Callback zmiany stanu' },
              { name:'size',            type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar togglea' },
              { name:'label',           type:'string', desc:'Etykieta klikalna wyświetlana obok' },
              { name:'description',     type:'string', desc:'Opis pomocniczy pod etykietą' },
              { name:'disabled',        type:'boolean', default:'false', desc:'Wyłącza interakcję' },
            ]} />
          </div>
        </>
      );

      /* ── TOOLTIP ─────────────────────────────────────────── */
      case 'tooltip': return (
        <>
          <PageHeader name="Tooltip" pkg="core" status="new"
            description="Pływający hint zakotwiczony do triggera. Dwa warianty wizualne, cztery pozycje, auto-portal. Wymaga TooltipProvider raz w drzewie." />
          <SectionLabel>Pozycje i warianty</SectionLabel>
          <Preview glass={glass}>
            <TooltipProvider>
              <div className="flex flex-col gap-8 items-center">
                <div className="flex flex-wrap gap-6 items-center justify-center">
                  {([
                    { side:'top'    as const, label:'Góra' },
                    { side:'bottom' as const, label:'Dół' },
                    { side:'left'   as const, label:'Lewo' },
                    { side:'right'  as const, label:'Prawo' },
                  ]).map(({ side, label }) => (
                    <Tooltip key={side}>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">{label}</Button>
                      </TooltipTrigger>
                      <TooltipContent side={side}>Tooltip — {label}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <Separator className="w-full max-w-sm" />
                <div className="flex gap-4 items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm">Wariant default</Button>
                    </TooltipTrigger>
                    <TooltipContent>Ciemne tło, białe litery</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="glass" size="sm">Wariant glass</Button>
                    </TooltipTrigger>
                    <TooltipContent variant="glass">nb-glass-static z blur</TooltipContent>
                  </Tooltip>
                </div>
                <Separator className="w-full max-w-sm" />
                <div className="flex gap-3 flex-wrap justify-center">
                  {[
                    { icon:<Settings className="h-4 w-4"/>, tip:'Ustawienia' },
                    { icon:<Bell className="h-4 w-4"/>,     tip:'Powiadomienia (3 nowe)' },
                    { icon:<Filter className="h-4 w-4"/>,   tip:'Filtruj wyniki' },
                    { icon:<RefreshCw className="h-4 w-4"/>,tip:'Odśwież dane' },
                    { icon:<Download className="h-4 w-4"/>, tip:'Eksportuj CSV' },
                    { icon:<Lock className="h-4 w-4"/>,     tip:'Zablokowane — brak uprawnień' },
                  ].map(({ icon, tip }) => (
                    <SimpleTooltip key={tip} content={tip}>
                      <Button variant="ghost" size="icon">{icon}</Button>
                    </SimpleTooltip>
                  ))}
                </div>
              </div>
            </TooltipProvider>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="tooltip-import" copied={copied} onCopy={copy}
              code={`import {\n  TooltipProvider, Tooltip, TooltipTrigger, TooltipContent,\n  SimpleTooltip\n} from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="tooltip-usage" copied={copied} onCopy={copy}
              code={`// Raz w App.tsx:\n<TooltipProvider>\n  <App />\n</TooltipProvider>\n\n// Pełna forma:\n<Tooltip>\n  <TooltipTrigger asChild>\n    <Button>Hover</Button>\n  </TooltipTrigger>\n  <TooltipContent side="top">Tekst tooltipa</TooltipContent>\n</Tooltip>\n\n// Skrót:\n<SimpleTooltip content="Tekst tooltipa" side="top">\n  <Button>Hover</Button>\n</SimpleTooltip>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — TooltipContent</SectionLabel>
            <PropsTable rows={[
              { name:'side',    type:"'top'|'bottom'|'left'|'right'", default:"'top'", desc:'Pozycja tooltipa względem triggera' },
              { name:'variant', type:"'default'|'glass'", default:"'default'", desc:'Ciemne tło lub nb-glass-static' },
              { name:'sideOffset', type:'number', default:'6', desc:'Odstęp od triggera w px' },
            ]} />
          </div>
        </>
      );

      /* ── SHEET ───────────────────────────────────────────── */
      case 'sheet': return (
        <>
          <PageHeader name="Sheet" pkg="layout" status="new"
            description="Panel wsuwany z krawędzi ekranu — drawer/sidebar overlay. Cztery strony, cztery rozmiary, zawsze nb-glass-static." />
          <SectionLabel>Strony wsunięcia</SectionLabel>
          <Preview glass={false} tight>
            <div className="flex flex-wrap gap-3 justify-center">
              {([
                { side:'right'  as const, label:'Prawy (default)' },
                { side:'left'   as const, label:'Lewy' },
                { side:'bottom' as const, label:'Dolny' },
              ]).map(({ side, label }) => (
                <Button key={side} variant="outline" size="sm" onClick={() => setSheetOpen(side)}>
                  {label}
                </Button>
              ))}
            </div>
          </Preview>

          {/* Right sheet */}
          <Sheet open={sheetOpen === 'right'} onOpenChange={o => !o && setSheetOpen(null)}>
            <SheetContent side="right" size="default">
              <SheetHeader>
                <SheetTitle>Panel ustawień</SheetTitle>
                <SheetDescription>Skonfiguruj preferencje swojego konta.</SheetDescription>
              </SheetHeader>
              <SheetBody className="flex flex-col gap-4">
                <Switch label="Powiadomienia email" description="Raporty tygodniowe" defaultChecked />
                <Switch label="Powiadomienia push" />
                <Switch label="Tryb nocny" defaultChecked />
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">Język interfejsu</p>
                  <Select defaultValue="pl">
                    <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pl">Polski</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SheetBody>
              <SheetFooter>
                <SheetClose asChild><Button variant="ghost" size="sm">Anuluj</Button></SheetClose>
                <Button size="sm" onClick={() => setSheetOpen(null)}>Zapisz zmiany</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Left sheet */}
          <Sheet open={sheetOpen === 'left'} onOpenChange={o => !o && setSheetOpen(null)}>
            <SheetContent side="left" size="sm">
              <SheetHeader>
                <SheetTitle>Nawigacja</SheetTitle>
              </SheetHeader>
              <SheetBody className="flex flex-col gap-1">
                {[
                  { icon:<LayoutDashboard className="h-4 w-4"/>, label:'Pulpit' },
                  { icon:<Package className="h-4 w-4"/>,         label:'Komponenty' },
                  { icon:<BarChart3 className="h-4 w-4"/>,       label:'Analityka' },
                  { icon:<Settings className="h-4 w-4"/>,        label:'Ustawienia' },
                ].map(({ icon, label }) => (
                  <button key={label} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors text-left w-full">
                    {icon}{label}
                  </button>
                ))}
              </SheetBody>
            </SheetContent>
          </Sheet>

          {/* Bottom sheet */}
          <Sheet open={sheetOpen === 'bottom'} onOpenChange={o => !o && setSheetOpen(null)}>
            <SheetContent side="bottom" size="default">
              <SheetHeader>
                <SheetTitle>Potwierdź akcję</SheetTitle>
                <SheetDescription>Ta operacja jest nieodwracalna. Czy chcesz kontynuować?</SheetDescription>
              </SheetHeader>
              <SheetBody>
                <div className="flex gap-3 pt-2">
                  <Button variant="destructive" className="flex-1" onClick={() => setSheetOpen(null)}>Usuń trwale</Button>
                  <SheetClose asChild><Button variant="outline" className="flex-1">Anuluj</Button></SheetClose>
                </div>
              </SheetBody>
            </SheetContent>
          </Sheet>

          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="sheet-import" copied={copied} onCopy={copy}
              code={`import {\n  Sheet, SheetTrigger, SheetContent,\n  SheetHeader, SheetTitle, SheetDescription,\n  SheetBody, SheetFooter, SheetClose\n} from '@nextbyte/layout';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="sheet-usage" copied={copied} onCopy={copy}
              code={`<Sheet>\n  <SheetTrigger asChild>\n    <Button>Otwórz panel</Button>\n  </SheetTrigger>\n  <SheetContent side="right" size="default">\n    <SheetHeader>\n      <SheetTitle>Tytuł</SheetTitle>\n      <SheetDescription>Opis panelu.</SheetDescription>\n    </SheetHeader>\n    <SheetBody>Treść...</SheetBody>\n    <SheetFooter>\n      <SheetClose asChild><Button variant="ghost">Zamknij</Button></SheetClose>\n    </SheetFooter>\n  </SheetContent>\n</Sheet>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — SheetContent</SectionLabel>
            <PropsTable rows={[
              { name:'side', type:"'right'|'left'|'top'|'bottom'", default:"'right'", desc:'Krawędź z której wysuwa się panel' },
              { name:'size', type:"'sm'|'default'|'lg'|'xl'|'full'", default:"'default'", desc:'Maksymalna szerokość (lub wysokość dla top/bottom)' },
            ]} />
          </div>
        </>
      );

      /* ── ACCORDION ───────────────────────────────────────── */
      case 'accordion': return (
        <>
          <PageHeader name="Accordion" pkg="layout" status="new"
            description="Zwijane sekcje w czterech wariantach wizualnych. Obsługuje single i multiple. Oparty na Radix UI Accordion." />
          <SectionLabel>Warianty</SectionLabel>
          <Preview glass={glass}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {([
                { variant:'default'  as const, label:'default' },
                { variant:'bordered' as const, label:'bordered' },
                { variant:'ghost'    as const, label:'ghost' },
                { variant:'glass'    as const, label:'glass' },
              ]).map(({ variant, label }) => (
                <div key={variant}>
                  <p className="text-[9px] font-mono text-muted-foreground/50 mb-2 uppercase tracking-wider">{label}</p>
                  <Accordion type="single" collapsible variant={variant} defaultValue="item-1">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Czym jest NextByte?</AccordionTrigger>
                      <AccordionContent>
                        NextByte to platforma AI i system komponentów dla nowoczesnych aplikacji SaaS.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Jak zacząć?</AccordionTrigger>
                      <AccordionContent>
                        Zainstaluj paczkę i zaimportuj komponenty z odpowiedniego pakietu.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Czy obsługuje TypeScript?</AccordionTrigger>
                      <AccordionContent>
                        Tak — pełne typy i eksporty dla każdego komponentu.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="acc-import" copied={copied} onCopy={copy}
              code={`import {\n  Accordion, AccordionItem,\n  AccordionTrigger, AccordionContent\n} from '@nextbyte/layout';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="acc-usage" copied={copied} onCopy={copy}
              code={`<Accordion type="single" collapsible variant="bordered">\n  <AccordionItem value="q1">\n    <AccordionTrigger>Pytanie pierwsze?</AccordionTrigger>\n    <AccordionContent>\n      Odpowiedź na pierwsze pytanie.\n    </AccordionContent>\n  </AccordionItem>\n</Accordion>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — Accordion</SectionLabel>
            <PropsTable rows={[
              { name:'type',      type:"'single'|'multiple'", desc:'Czy może być otwartych kilka sekcji naraz' },
              { name:'collapsible',type:'boolean', desc:'(single) Czy aktywna sekcja może się zamknąć' },
              { name:'variant',   type:"'default'|'bordered'|'ghost'|'glass'", default:"'default'", desc:'Styl wizualny' },
              { name:'defaultValue', type:'string | string[]', desc:'Domyślnie otwarta sekcja / sekcje' },
            ]} />
          </div>
        </>
      );

      /* ── CHECKBOX ───────────────────────────────────────── */
      case 'checkbox': return (
        <>
          <PageHeader name="Checkbox" pkg="core" status="new"
            description="Pole wyboru z trzema stanami: unchecked, checked i indeterminate. Trzy rozmiary, opcjonalna etykieta i opis. Radix UI Checkbox." />
          <SectionLabel>Stany i rozmiary</SectionLabel>
          <Preview glass={glass} tight>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-sm mx-auto">
              <div className="flex flex-col gap-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Rozmiary</p>
                <Checkbox size="sm" label="Mały (sm)" checked={checkStates.a} onCheckedChange={v => setCheckStates(s => ({ ...s, a: !!v }))} />
                <Checkbox size="default" label="Domyślny" checked={checkStates.b} onCheckedChange={v => setCheckStates(s => ({ ...s, b: !!v }))} />
                <Checkbox size="lg" label="Duży (lg)" checked={checkStates.c} onCheckedChange={v => setCheckStates(s => ({ ...s, c: !!v }))} />
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Stany</p>
                <Checkbox label="Zaznaczony" defaultChecked />
                <Checkbox label="Niezaznaczony" />
                <Checkbox label="Nieokreślony" indeterminate />
                <Checkbox label="Wyłączony" disabled defaultChecked />
              </div>
            </div>
          </Preview>
          <SectionLabel>Z opisem</SectionLabel>
          <Preview glass={false} tight>
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <Checkbox
                label="Powiadomienia email"
                description="Tygodniowy raport aktywności"
                defaultChecked
              />
              <Checkbox
                label="Akceptuję regulamin"
                description="Przeczytaj pełny dokument przed akceptacją"
              />
              <Checkbox
                label="Newsletter"
                description="Promocje, nowości i aktualizacje produktu"
                defaultChecked
              />
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="cb-import" copied={copied} onCopy={copy}
              code={`import { Checkbox } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="cb-usage" copied={copied} onCopy={copy}
              code={`<Checkbox\n  label="Akceptuję regulamin"\n  description="Przeczytaj pełny dokument"\n  checked={accepted}\n  onCheckedChange={setAccepted}\n/>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'checked',         type:'boolean | "indeterminate"', desc:'Stan kontrolowany' },
              { name:'onCheckedChange', type:'(checked: boolean | "indeterminate") => void', desc:'Callback zmiany' },
              { name:'size',            type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar checkboxa' },
              { name:'label',           type:'string', desc:'Etykieta klikalna' },
              { name:'description',     type:'string', desc:'Opis pomocniczy pod etykietą' },
              { name:'indeterminate',   type:'boolean', default:'false', desc:'Stan nieokreślony (minus)' },
              { name:'disabled',        type:'boolean', default:'false', desc:'Wyłącza interakcję' },
            ]} />
          </div>
        </>
      );

      /* ── RADIO ───────────────────────────────────────────── */
      case 'radio': return (
        <>
          <PageHeader name="Radio" pkg="core" status="new"
            description="Grupa przycisków radio — jeden wybór z wielu. Trzy rozmiary. Radix UI RadioGroup." />
          <SectionLabel>Podgląd</SectionLabel>
          <Preview glass={glass} tight>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-sm mx-auto">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Plan</p>
                <RadioGroup value={radioVal} onValueChange={setRadioVal}>
                  <RadioGroupItem value="starter" label="Starter" description="Do 3 projektów" />
                  <RadioGroupItem value="pro"     label="Pro"     description="Nieograniczone projekty" />
                  <RadioGroupItem value="team"    label="Team"    description="Zarządzanie zespołem" />
                </RadioGroup>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Rozmiary</p>
                <RadioGroup defaultValue="b">
                  <RadioGroupItem value="a" label="Mały (sm)"    size="sm" />
                  <RadioGroupItem value="b" label="Domyślny"     size="default" />
                  <RadioGroupItem value="c" label="Duży (lg)"    size="lg" />
                  <RadioGroupItem value="d" label="Wyłączony"    disabled />
                </RadioGroup>
              </div>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="radio-import" copied={copied} onCopy={copy}
              code={`import { RadioGroup, RadioGroupItem } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="radio-usage" copied={copied} onCopy={copy}
              code={`<RadioGroup value={plan} onValueChange={setPlan}>\n  <RadioGroupItem value="starter" label="Starter" description="Do 3 projektów" />\n  <RadioGroupItem value="pro"     label="Pro"     description="Bez limitów" />\n  <RadioGroupItem value="team"    label="Team"    description="Współpraca" />\n</RadioGroup>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props — RadioGroupItem</SectionLabel>
            <PropsTable rows={[
              { name:'value',       type:'string', desc:'Unikalna wartość opcji' },
              { name:'label',       type:'string', desc:'Etykieta klikalna' },
              { name:'description', type:'string', desc:'Opis pomocniczy' },
              { name:'size',        type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar przycisku radio' },
              { name:'disabled',    type:'boolean', default:'false', desc:'Wyłącza tę opcję' },
            ]} />
          </div>
        </>
      );

      /* ── TEXTAREA ─────────────────────────────────────────── */
      case 'textarea': return (
        <>
          <PageHeader name="Textarea" pkg="core" status="new"
            description="Wieloliniowe pole tekstowe w pięciu wariantach wizualnych. Obsługuje auto-resize i trzy rozmiary." />
          <SectionLabel>Warianty</SectionLabel>
          <Preview glass={glass}>
            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
              {([
                { variant:'default' as const, placeholder:'Wariant default...' },
                { variant:'ghost'   as const, placeholder:'Wariant ghost...' },
                { variant:'glass'   as const, placeholder:'Wariant glass...' },
                { variant:'error'   as const, placeholder:'Wariant error...' },
                { variant:'success' as const, placeholder:'Wariant success...' },
              ]).map(({ variant, placeholder }) => (
                <div key={variant} className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider">{variant}</span>
                  <Textarea variant={variant} placeholder={placeholder} rows={2} />
                </div>
              ))}
            </div>
          </Preview>
          <div className="mt-6">
            <SectionLabel>Auto-resize</SectionLabel>
            <Preview glass={false} tight>
              <div className="max-w-sm mx-auto">
                <Textarea
                  autoResize
                  placeholder="Zacznij pisać — textarea rośnie automatycznie..."
                  size="default"
                />
              </div>
            </Preview>
          </div>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="ta-import" copied={copied} onCopy={copy}
              code={`import { Textarea } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="ta-usage" copied={copied} onCopy={copy}
              code={`<Textarea\n  variant="default"\n  placeholder="Wpisz treść..."\n  autoResize\n/>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'variant',    type:"'default'|'ghost'|'glass'|'error'|'success'", default:"'default'", desc:'Styl wizualny' },
              { name:'size',       type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar i minimalna wysokość' },
              { name:'autoResize', type:'boolean', default:'false', desc:'Automatyczne dopasowanie wysokości do treści' },
              { name:'rows',       type:'number', desc:'Liczba wierszy (nadpisuje min-h)' },
              { name:'placeholder',type:'string', desc:'Tekst zastępczy' },
              { name:'disabled',   type:'boolean', default:'false', desc:'Wyłącza edycję' },
            ]} />
          </div>
        </>
      );

      /* ── PROGRESS ─────────────────────────────────────────── */
      case 'progress': return (
        <>
          <PageHeader name="Progress" pkg="core" status="new"
            description="Pasek postępu w czterech rozmiarach i pięciu kolorach. Obsługuje etykietę, wartość procentową i animowany shimmer. Radix UI Progress." />
          <SectionLabel>Kolory i rozmiary</SectionLabel>
          <Preview glass={glass}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-lg mx-auto">
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Kolory</p>
                <Progress value={75} color="primary"     label="Primary"     showValue />
                <Progress value={82} color="success"     label="Success"     showValue />
                <Progress value={45} color="warning"     label="Warning"     showValue />
                <Progress value={28} color="destructive" label="Destructive" showValue />
                <Progress value={60} color="gradient"    label="Gradient"    showValue />
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Rozmiary</p>
                <Progress value={progressVal} size="xs"      label="Extra small (xs)" />
                <Progress value={progressVal} size="sm"      label="Small (sm)" />
                <Progress value={progressVal} size="default" label="Default" />
                <Progress value={progressVal} size="lg"      label="Large (lg)" showValue />
              </div>
            </div>
          </Preview>
          <SectionLabel>Interaktywny + animacja</SectionLabel>
          <Preview glass={false} tight>
            <div className="flex flex-col gap-5 max-w-sm mx-auto">
              <Progress value={progressVal} label="Postęp instalacji" showValue animated color="success" size="default" />
              <input
                type="range" min={0} max={100} step={1}
                value={progressVal}
                onChange={e => setProgressVal(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="prog-import" copied={copied} onCopy={copy}
              code={`import { Progress } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="prog-usage" copied={copied} onCopy={copy}
              code={`<Progress\n  value={75}\n  label="Ukończono"\n  showValue\n  color="success"\n  size="default"\n  animated\n/>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'value',     type:'number', desc:'Wartość postępu (0–100)' },
              { name:'size',      type:"'xs'|'sm'|'default'|'lg'", default:"'default'", desc:'Wysokość paska' },
              { name:'color',     type:"'primary'|'success'|'warning'|'destructive'|'gradient'", default:"'primary'", desc:'Kolor wypełnienia' },
              { name:'animated',  type:'boolean', default:'false', desc:'Shimmer animacja' },
              { name:'label',     type:'string', desc:'Etykieta nad paskiem' },
              { name:'showValue', type:'boolean', default:'false', desc:'Wyświetla % po prawej od etykiety' },
            ]} />
          </div>
        </>
      );

      /* ── BREADCRUMB ───────────────────────────────────────── */
      case 'breadcrumb': return (
        <>
          <PageHeader name="Breadcrumb" pkg="layout" status="new"
            description="Nawigacja okruszków z ikonami, custom separatorem i auto-skracaniem po maxItems." />
          <SectionLabel>Warianty</SectionLabel>
          <Preview glass={glass}>
            <div className="flex flex-col gap-6 max-w-md mx-auto">
              <div>
                <p className="text-[9px] font-mono text-muted-foreground/50 mb-2 uppercase tracking-wider">Podstawowy</p>
                <Breadcrumb items={[
                  { label: 'Strona główna', href: '/' },
                  { label: 'Komponenty', href: '/components' },
                  { label: 'Breadcrumb' },
                ]} />
              </div>
              <div>
                <p className="text-[9px] font-mono text-muted-foreground/50 mb-2 uppercase tracking-wider">Z ikonami</p>
                <Breadcrumb items={[
                  { label: 'Home',        href: '/', icon: <Home className="h-3 w-3" /> },
                  { label: 'Projekty',    href: '/projects', icon: <FolderOpen className="h-3 w-3" /> },
                  { label: 'API Design',  href: '/projects/api', icon: <FileText className="h-3 w-3" /> },
                  { label: 'Przegląd' },
                ]} />
              </div>
              <div>
                <p className="text-[9px] font-mono text-muted-foreground/50 mb-2 uppercase tracking-wider">Auto-skracanie (maxItems=3)</p>
                <Breadcrumb
                  maxItems={3}
                  items={[
                    { label: 'Strona główna', href: '/' },
                    { label: 'Projekty',      href: '/projects' },
                    { label: 'NextByte UI',   href: '/projects/nb' },
                    { label: 'Komponenty',    href: '/projects/nb/components' },
                    { label: 'Breadcrumb' },
                  ]}
                />
              </div>
              <div>
                <p className="text-[9px] font-mono text-muted-foreground/50 mb-2 uppercase tracking-wider">Custom separator (›)</p>
                <Breadcrumb
                  separator={<span className="text-muted-foreground/40 text-sm leading-none">›</span>}
                  items={[
                    { label: 'Ustawienia', href: '/settings' },
                    { label: 'Profil',     href: '/settings/profile' },
                    { label: 'Bezpieczeństwo' },
                  ]}
                />
              </div>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="bc-import" copied={copied} onCopy={copy}
              code={`import { Breadcrumb } from '@nextbyte/layout';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="bc-usage" copied={copied} onCopy={copy}
              code={`<Breadcrumb\n  items={[\n    { label: 'Strona główna', href: '/' },\n    { label: 'Projekty', href: '/projects' },\n    { label: 'Breadcrumb' },\n  ]}\n  maxItems={4}\n/>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'items',     type:'BreadcrumbItem[]', desc:'Lista okruszków — ostatni jest aktywny (bez href)' },
              { name:'separator', type:'ReactNode', desc:'Separator między okruszkami (default: ChevronRight)' },
              { name:'maxItems',  type:'number', desc:'Maksymalna liczba elementów — środkowe są zastąpione przez …' },
            ]} />
          </div>
          <div className="mt-4"><SectionLabel>BreadcrumbItem</SectionLabel>
            <PropsTable rows={[
              { name:'label', type:'string', desc:'Tekst okruszka' },
              { name:'href',  type:'string', desc:'Link (brak = element nieaktywny/aktualny)' },
              { name:'icon',  type:'ReactNode', desc:'Ikona przed etykietą' },
            ]} />
          </div>
        </>
      );

      /* ── EMPTYSTATE ───────────────────────────────────────── */
      case 'emptystate': return (
        <>
          <PageHeader name="EmptyState" pkg="core" status="new"
            description="Placeholder dla pustych list, wyników wyszukiwania i błędów. Ikona, tytuł, opis i slot na CTA. Trzy rozmiary." />
          <SectionLabel>Przykłady</SectionLabel>
          <Preview glass={glass}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/60 bg-card/30">
                <EmptyState
                  icon={<Inbox className="h-full w-full" />}
                  title="Brak powiadomień"
                  description="Gdy pojawią się nowe powiadomienia, znajdziesz je tutaj."
                />
              </div>
              <div className="rounded-xl border border-border/60 bg-card/30">
                <EmptyState
                  icon={<Search className="h-full w-full" />}
                  title="Brak wyników"
                  description={`Nie znaleziono niczego dla Twojego zapytania.`}
                  action={<Button variant="outline" size="sm">Wyczyść filtr</Button>}
                />
              </div>
              <div className="rounded-xl border border-border/60 bg-card/30">
                <EmptyState
                  icon={<FolderOpen className="h-full w-full" />}
                  title="Brak projektów"
                  description="Utwórz swój pierwszy projekt, aby zacząć pracę."
                  action={<Button size="sm"><PlusCircle className="h-3.5 w-3.5 mr-1.5" />Nowy projekt</Button>}
                />
              </div>
              <div className="rounded-xl border border-border/60 bg-card/30">
                <EmptyState
                  size="sm"
                  icon={<Activity className="h-full w-full" />}
                  title="Brak aktywności"
                  description="Historia aktywności jest pusta."
                />
              </div>
            </div>
          </Preview>
          <div className="mt-6"><SectionLabel>Import</SectionLabel>
            <CodeBlock id="es-import" copied={copied} onCopy={copy}
              code={`import { EmptyState } from '@nextbyte/core';`} />
          </div>
          <div className="mt-4"><SectionLabel>Użycie</SectionLabel>
            <CodeBlock id="es-usage" copied={copied} onCopy={copy}
              code={`<EmptyState\n  icon={<InboxIcon className="h-full w-full" />}\n  title="Brak wyników"\n  description="Zmień kryteria wyszukiwania."\n  action={<Button size="sm">Wyczyść</Button>}\n/>`} />
          </div>
          <div className="mt-6"><SectionLabel>Props</SectionLabel>
            <PropsTable rows={[
              { name:'icon',        type:'ReactNode', desc:'Ikona wyświetlana w tle — przekaż z klasą h-full w-full' },
              { name:'title',       type:'string', desc:'Główny nagłówek' },
              { name:'description', type:'string', desc:'Opis pomocniczy' },
              { name:'action',      type:'ReactNode', desc:'Slot na przycisk CTA' },
              { name:'size',        type:"'sm'|'default'|'lg'", default:"'default'", desc:'Rozmiar i padding' },
            ]} />
          </div>
        </>
      );

      default: return (
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          Wybierz komponent z nawigacji po lewej.
        </div>
      );
    }
  }
}
