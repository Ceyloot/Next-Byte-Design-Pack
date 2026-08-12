import React from 'react'
import { 
  Grid, Sparkles, MessageSquare, Terminal, Brain, ShieldAlert, 
  TrendingUp, Camera, Video, Calendar, CheckSquare, FileText, 
  LayoutGrid, Briefcase, Bell, Settings, Search, Plus, Award, 
  Image as ImageIcon, FileCode, ChevronRight, Activity, ArrowUpRight,
  TrendingDown, Download, Filter, MoreHorizontal, Navigation, PanelTop, Loader, Palette, Layers
} from 'lucide-react'

// ── Mock Data ────────────────────────────────────────────────────
const STATS = [
  { label: 'Zużycie Tokenów', value: '2,410,320', trend: '+14.2%', isPositive: true, subtext: 'w tym miesiącu' },
  { label: 'Aktywne Zadania', value: '18', trend: '-2', isPositive: false, subtext: '3 w toku' },
  { label: 'Wygenerowane Grafiki', value: '4,305', trend: '+8.4%', isPositive: true, subtext: 'w tym tygodniu' },
  { label: 'Współczynnik Trafności AI', value: '98.9%', trend: '+0.4%', isPositive: true, subtext: 'średnia p99' },
]

const TRANSACTIONS = [
  { id: '#04910', task: 'Projekt logo dla NextByte', module: 'Studio Zdjęć', status: 'Sukces', qty: 12, cost: '1,450 Byte' },
  { id: '#04911', task: 'Analiza rynku i konkurencji', module: 'Chat AI', status: 'Sukces', qty: 20, cost: '820 Byte' },
  { id: '#04912', task: 'Generowanie video promocyjnego', module: 'Studio Video', status: 'Oczekuje', qty: 1, cost: '5,000 Byte' },
  { id: '#04913', task: 'Trening modelu na dokumentach', module: 'Pamięć AI', status: 'Błąd', qty: 8, cost: '320 Byte' },
]

const LIVE_ACTIVITIES = [
  { title: 'Generowanie obrazu: "mazda miata z popupami..."', time: '5 min temu', type: 'img' },
  { title: 'Chat AI: "Jakie umiejętności potrzebuje..."', time: '12 min temu', type: 'chat' },
  { title: 'Edycja dokumentu B2C TikTok', time: '1 godz temu', type: 'doc' },
]

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  let style = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (status === 'Oczekuje') style = 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  if (status === 'Błąd') style = 'bg-destructive/10 text-destructive border-destructive/20'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style}`}>
      <span className={`w-1 h-1 rounded-full ${status === 'Sukces' ? 'bg-emerald-500' : status === 'Oczekuje' ? 'bg-amber-500' : 'bg-destructive'}`} />
      {status}
    </span>
  )
}

// ── Sidebar Item ─────────────────────────────────────────────────
interface SItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  dot?: boolean
  count?: number
}

function SItem({ icon, label, active, dot, count }: SItemProps) {
  return (
    <div className={`
      group flex items-center gap-2.5 px-3 py-1.5 rounded-nb-sm cursor-pointer text-xs transition-all duration-150 relative
      ${active 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-foreground/60 hover:text-foreground hover:bg-foreground/[0.03]'}
    `}>
      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-primary rounded-r" />}
      <span className={`transition-transform duration-150 ${active ? 'scale-105' : 'group-hover:scale-105 opacity-80 group-hover:opacity-100'}`}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      {count !== undefined && (
        <span className="text-[10px] font-mono opacity-50 bg-foreground/5 px-1.5 py-0.5 rounded border border-foreground/[0.03] group-hover:opacity-85 transition-opacity">
          {count}
        </span>
      )}
    </div>
  )
}

function SLabel({ label }: { label: string }) {
  return (
    <div className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground/45 px-3 pt-3.5 pb-1 select-none">
      {label}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────
interface PreviewSectionProps {
  onSelectTab?: (tabKey: string) => void
}

export function PreviewSection({ onSelectTab }: PreviewSectionProps) {
  return (
    <div className="w-full h-[calc(100vh-56px)] flex font-sans antialiased text-foreground overflow-hidden bg-background relative">
      
      {/* Decorative radial gradients for high-end SaaS feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--primary),0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(var(--primary),0.02),transparent_60%)] pointer-events-none" />

      {/* ══ SIDEBAR (Linear/Craft Style) ══ */}
      <aside className="w-56 shrink-0 border-r border-border/40 bg-card/15 backdrop-blur-md flex flex-col overflow-hidden relative z-10">
        
        {/* Workspace dropdown selector */}
        <div className="p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-6 h-6 rounded-nb-xs bg-primary flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 transition-transform duration-200">
                <Activity className="h-3.5 w-3.5 text-primary-foreground stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-tight text-foreground block leading-none">Agencja</span>
                <span className="text-[10px] text-muted-foreground/60">Artur Bącik Team</span>
              </div>
            </div>
            <button className="text-foreground/45 hover:text-foreground p-1 hover:bg-foreground/[0.04] rounded-nb-xs transition-colors">
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick Finder / Search bar */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-nb-sm bg-foreground/[0.02] border border-border/40 hover:bg-foreground/[0.04] hover:border-primary/30 transition-all cursor-pointer group">
            <Search className="h-3.5 w-3.5 text-foreground/40 group-hover:text-foreground/60 transition-colors" />
            <span className="flex-1 text-[11px] text-foreground/45 group-hover:text-foreground/60 transition-colors">Wyszukaj...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-sans font-medium bg-foreground/5 border border-border/60 rounded text-foreground/45 shadow-sm">⌘K</kbd>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-[2px] scrollbar-none">
          <SItem icon={<Grid className="h-3.5 w-3.5" />} label="Dashboard" active />
          
          <SLabel label="AI Workspace" />
          <SItem icon={<Sparkles className="h-3.5 w-3.5" />} label="Personalny Asystent" />
          <SItem icon={<MessageSquare className="h-3.5 w-3.5" />} label="Chat AI" />
          <SItem icon={<Terminal className="h-3.5 w-3.5" />} label="PromptEx" />
          <SItem icon={<Brain className="h-3.5 w-3.5" />} label="Pamięć AI" />
          <SItem icon={<ShieldAlert className="h-3.5 w-3.5" />} label="Red Zone" dot />
          
          <SLabel label="Moduły" />
          <SItem icon={<TrendingUp className="h-3.5 w-3.5" />} label="Trend" />
          <SItem icon={<Camera className="h-3.5 w-3.5" />} label="Studio Zdjęć" />
          <SItem icon={<Video className="h-3.5 w-3.5" />} label="Studio Video" />
          
          <SLabel label="Praca" />
          <SItem icon={<Calendar className="h-3.5 w-3.5" />} label="Kalendarz" />
          <SItem icon={<CheckSquare className="h-3.5 w-3.5" />} label="Zadania" count={7} />
          <SItem icon={<FileText className="h-3.5 w-3.5" />} label="Notatki" />
          <SItem icon={<LayoutGrid className="h-3.5 w-3.5" />} label="Tablice" />
          <SItem icon={<Briefcase className="h-3.5 w-3.5" />} label="Firma" />

          {onSelectTab && (
            <>
              <SLabel label="Design Sandbox" />
              <div onClick={() => onSelectTab('karty')}>
                <SItem icon={<LayoutGrid className="h-3.5 w-3.5" />} label="Karty" />
              </div>
              <div onClick={() => onSelectTab('akcje')}>
                <SItem icon={<Sparkles className="h-3.5 w-3.5" />} label="Akcje" />
              </div>
              <div onClick={() => onSelectTab('formularze')}>
                <SItem icon={<Layers className="h-3.5 w-3.5" />} label="Formularze" />
              </div>
              <div onClick={() => onSelectTab('nawigacja')}>
                <SItem icon={<Navigation className="h-3.5 w-3.5" />} label="Nawigacja" />
              </div>
              <div onClick={() => onSelectTab('nakładki')}>
                <SItem icon={<PanelTop className="h-3.5 w-3.5" />} label="Nakładki" />
              </div>
              <div onClick={() => onSelectTab('dane')}>
                <SItem icon={<Activity className="h-3.5 w-3.5" />} label="Dane" />
              </div>
              <div onClick={() => onSelectTab('stany')}>
                <SItem icon={<Loader className="h-3.5 w-3.5" />} label="Stany" />
              </div>
              <div onClick={() => onSelectTab('paleta')}>
                <SItem icon={<Palette className="h-3.5 w-3.5" />} label="Paleta" />
              </div>
            </>
          )}
        </nav>

        {/* User Account / Footer */}
        <div className="p-3 border-t border-border/40 bg-card/10 flex items-center gap-2.5">
          <div className="relative group cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
              AB
            </div>
            <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">Artur Bącik</div>
            <div className="text-[10px] text-muted-foreground/60 truncate">Free · 0 Byte</div>
          </div>
          <button className="text-foreground/45 hover:text-foreground p-1.5 hover:bg-foreground/[0.04] rounded-full transition-colors relative">
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
          </button>
        </div>
      </aside>

      {/* ══ MAIN DASHBOARD AREA ══ */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black/[0.18] z-10">
        
        {/* Header / Top bar */}
        <header className="h-14 border-b border-border/30 px-6 flex items-center justify-between shrink-0 bg-card/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-foreground font-semibold">Overview</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="h-8 px-3 rounded-nb-sm border border-border/50 bg-card/45 hover:bg-foreground/[0.03] text-foreground/75 hover:text-foreground text-xs font-medium flex items-center gap-1.5 transition-all">
              <Download className="h-3.5 w-3.5" /> Eksportuj CSV
            </button>
            <button className="h-8 px-3 rounded-nb-sm bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20">
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" /> Nowy projekt
            </button>
          </div>
        </header>

        {/* Scrollable content container */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Greeting section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Witaj z powrotem, Artur</h2>
              <p className="text-xs text-muted-foreground mt-1">Monitoruj zużycie tokenów, zadania i procesy AI w czasie rzeczywistym.</p>
            </div>
            <div className="flex rounded-nb-sm border border-border/40 bg-card/40 p-0.5 font-mono text-[10px]">
              {['Dzienny', 'Tygodniowy', 'Miesięczny'].map((opt, idx) => (
                <button 
                  key={opt} 
                  className={`px-3 py-1 rounded-nb-xs transition-all ${idx === 1 ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-foreground/50 hover:text-foreground'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`bg-card/80 border rounded-nb p-4 shadow-sm hover:shadow-md hover:bg-card/95 transition-all duration-300 flex flex-col justify-between ${stat.isPositive ? 'border-emerald-500/15 hover:border-emerald-500/30' : 'border-rose-500/15 hover:border-rose-500/30'}`}
              >
                {/* Colored top accent line */}
                <div className={`absolute top-0 left-4 right-4 h-[1.5px] rounded-full ${stat.isPositive ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`} style={{ position: 'absolute' }} />
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-medium text-muted-foreground/80">{stat.label}</span>
                  <span className={`inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${stat.isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                    {stat.trend}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <div>
                    <span className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</span>
                    <span className="block text-[10px] text-muted-foreground/50 mt-0.5">{stat.subtext}</span>
                  </div>
                  <svg className={`w-14 h-8 ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`} viewBox="0 0 100 50">
                    <defs>
                      <linearGradient id={`sg${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="currentColor" stopOpacity="1"/>
                      </linearGradient>
                    </defs>
                    <path
                      d={i % 2 === 0 ? "M 0 45 Q 25 15 50 30 T 100 5" : "M 0 5 Q 25 40 50 25 T 100 45"}
                      fill="none" stroke={`url(#sg${i})`} strokeWidth="2.5" strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </section>

          {/* Main Charts & Live Feed Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* Sales Trend / Performance block */}
            <div className="bg-card/80 border border-border/30 rounded-nb p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Trend Zużycia Systemu</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-foreground">20,320 Byte</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-0.5 bg-emerald-500/5 px-1 rounded border border-emerald-500/10">
                      <ArrowUpRight className="h-3 w-3" /> +12.4% vs wczoraj
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-foreground/60 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Nowy użytkownik
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-foreground/60 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" /> Powracający
                  </span>
                </div>
              </div>

              {/* Grid Bar Chart (Gradient & Line overlays) */}
              <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2 relative border-b border-border/30">
                {/* Horizontal reference lines */}
                <div className="absolute inset-x-0 top-[20%] border-t border-dashed border-border/10 pointer-events-none" />
                <div className="absolute inset-x-0 top-[50%] border-t border-dashed border-border/10 pointer-events-none" />
                <div className="absolute inset-x-0 top-[80%] border-t border-dashed border-border/10 pointer-events-none" />
                
                {[35, 65, 40, 90, 50, 75, 45, 60, 80, 55, 70, 85].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-[105%] bg-foreground text-background text-[9px] font-semibold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-20 font-mono">
                      {h * 240} Byte
                    </div>
                    {/* Bar with gradient and high contrast */}
                    <div className="w-full rounded-t-nb-xs overflow-hidden flex flex-col justify-end h-full">
                      <div 
                        style={{ height: `${h}%` }} 
                        className="bg-gradient-to-t from-primary/20 to-primary/80 group-hover/bar:from-primary/40 group-hover/bar:to-primary transition-all duration-300 rounded-t-[3px]"
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground/60 font-mono mt-1.5 select-none font-medium">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Modules Breakdown */}
            <div className="bg-card/80 border border-border/30 rounded-nb p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-4">Udział Modułów AI</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Chat AI & Modele Językowe', percentage: 48, cost: '12.4k Byte', color: 'bg-primary' },
                    { label: 'Studio Generowania Grafiki', percentage: 28, cost: '7.1k Byte', color: 'bg-emerald-400' },
                    { label: 'Studio Video & Klatkowanie', percentage: 14, cost: '3.6k Byte', color: 'bg-amber-400' },
                    { label: 'Pamięć & Agenci Wektorowi', percentage: 10, cost: '2.5k Byte', color: 'bg-foreground/35' },
                  ].map((mod) => (
                    <div key={mod.label} className="text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-foreground/80 font-medium">{mod.label}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{mod.cost} ({mod.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden border border-border/20">
                        <div style={{ width: `${mod.percentage}%` }} className={`h-full rounded-full ${mod.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-border/20 mt-4">
                <button className="w-full py-2 bg-foreground/5 hover:bg-foreground/10 border border-border/40 hover:border-border/60 text-foreground/80 hover:text-foreground text-xs font-semibold rounded-nb-sm flex items-center justify-center gap-1.5 transition-all">
                  Analiza kosztów <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* Transactions Table / Details */}
          <section className="bg-card/80 border border-border/30 rounded-nb shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/30 flex items-center justify-between bg-card/25 shrink-0">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Ostatnie Transakcje i Zadania</h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-nb-xs border border-border/60 hover:bg-foreground/[0.03] text-foreground/75 transition-all">
                  <Filter className="h-3.5 w-3.5" />
                </button>
                <button className="p-1.5 rounded-nb-xs border border-border/60 hover:bg-foreground/[0.03] text-foreground/75 transition-all">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/65">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Nazwa zadania</th>
                    <th className="py-3 px-4">Moduł</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ilość</th>
                    <th className="py-3 px-4 text-right">Koszt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {TRANSACTIONS.map((t) => (
                    <tr key={t.id} className="hover:bg-foreground/[0.02] transition-all duration-150">
                      <td className="py-3.5 px-4 font-mono text-[10px] text-muted-foreground font-semibold">{t.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">{t.task}</td>
                      <td className="py-3.5 px-4 text-muted-foreground/80 font-medium">{t.module}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={t.status} /></td>
                      <td className="py-3.5 px-4 text-right font-mono text-muted-foreground/80 font-medium">{t.qty}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">{t.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
        
      </div>
    </div>
  )
}
