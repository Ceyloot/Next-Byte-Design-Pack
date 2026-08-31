import React, { useState } from 'react'
import {
  Search, Command, ChevronRight, Circle, Plus, MoreHorizontal,
  Home, Folder, Boxes, Users, Activity, Settings, Bell,
  ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════════
   STUDIO — dialekt Linear × Supabase × Vercel
   Ten sam Panel Główny NextByte co w reszcie appki, ale w zupełnie innym
   języku wizualnym: sidebar po lewej, gęste treści z hairline'ami, buttony
   z subtle bevelem, monospace-tinted labelki, dane niosą wygląd.
   Wszystko w jednym pliku — self-contained, żeby nie mieszać się z resztą
   design systemu. Motywy kolorystyczne (`Przyjazny`, `NextByte`, itd.)
   przenoszą się przez tokeny CSS — komponenty tu ich nie omijają.
   ═══════════════════════════════════════════════════════════════════════ */

const STYLES = `
/* ── Powierzchnia bazowa ─────────────────────────────────────────────── */
.st-plotno {
  background: hsl(var(--tafla-1) / .55);
  border: 1px solid hsl(var(--border) / .8);
  border-radius: var(--r-md);
  box-shadow: var(--swiatlo-gorne), var(--cien-plaski);
}
/* ── Kafelka statystyki — cienka, dużo powietrza, tylko dane ────────── */
.st-kpi {
  display: flex; flex-direction: column; gap: 10px;
  padding: 18px 18px 16px;
  border: 1px solid hsl(var(--border) / .7);
  border-radius: var(--r-md);
  background: hsl(var(--tafla-1) / .55);
  box-shadow: var(--swiatlo-gorne);
  transition: border-color .18s ease, background-color .18s ease;
}
.st-kpi:hover {
  border-color: hsl(var(--border));
  background: hsl(var(--tafla-1) / .75);
}
.st-kpi-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; letter-spacing: .01em;
  color: hsl(var(--foreground) / .58);
  font-weight: 500;
}
.st-kpi-value {
  font-size: 26px; font-weight: 600; line-height: 1;
  letter-spacing: -.022em;
  font-variant-numeric: tabular-nums;
  color: hsl(var(--foreground));
}
.st-kpi-delta {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 11px; font-weight: 500;
  padding: 2px 6px; border-radius: var(--r-xs);
  font-variant-numeric: tabular-nums;
}
.st-kpi-delta[data-tone="up"]   { color: hsl(158 60% 62%); background: hsl(158 40% 20% / .35); }
.st-kpi-delta[data-tone="down"] { color: hsl(0   72% 68%); background: hsl(0   40% 20% / .35); }
.st-kpi-delta[data-tone="flat"] { color: hsl(var(--foreground) / .55); background: hsl(var(--foreground) / .06); }
.st-kpi-note {
  font-size: 11px; color: hsl(var(--foreground) / .42);
}

/* ── Bevel button — subtelny 3D, koniec z płaskimi prostokątami ────── */
.st-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 30px; padding: 0 12px;
  font-size: 12.5px; font-weight: 500;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: all .15s ease;
  white-space: nowrap;
}
.st-btn-primary {
  background: linear-gradient(180deg, hsl(var(--primary) / 1) 0%, hsl(var(--primary) / .88) 100%);
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--primary) / .8);
  box-shadow:
    inset 0 1px 0 0 hsl(0 0% 100% / .18),
    0 1px 2px 0 hsl(0 0% 0% / .35),
    0 4px 10px -4px hsl(var(--primary) / .5);
}
.st-btn-primary:hover { filter: brightness(1.08); }
.st-btn-ghost {
  background: hsl(var(--foreground) / .04);
  color: hsl(var(--foreground) / .82);
  border: 1px solid hsl(var(--border) / .6);
  box-shadow: inset 0 1px 0 0 hsl(0 0% 100% / .04);
}
.st-btn-ghost:hover {
  background: hsl(var(--foreground) / .08);
  border-color: hsl(var(--border));
  color: hsl(var(--foreground));
}

/* ── Search — z kbd hintem, jak w Linear ────────────────────────────── */
.st-search {
  display: flex; align-items: center; gap: 8px;
  height: 32px; padding: 0 10px 0 10px;
  border: 1px solid hsl(var(--border) / .7);
  border-radius: var(--r-sm);
  background: hsl(var(--tafla-1) / .5);
  color: hsl(var(--foreground) / .5);
  font-size: 12.5px;
  min-width: 240px;
  transition: border-color .15s ease, background-color .15s ease;
}
.st-search:hover { border-color: hsl(var(--border)); background: hsl(var(--tafla-1) / .8); }
.st-kbd {
  display: inline-flex; align-items: center; gap: 2px;
  padding: 1px 5px; margin-left: auto;
  font-size: 10.5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: hsl(var(--foreground) / .55);
  background: hsl(var(--foreground) / .06);
  border: 1px solid hsl(var(--border) / .5);
  border-radius: 4px;
}

/* ── Sidebar item — hairline z primary barem po lewej dla active ──── */
.st-side-item {
  position: relative;
  display: flex; align-items: center; gap: 10px;
  padding: 7px 10px 7px 12px;
  font-size: 12.5px; font-weight: 500;
  color: hsl(var(--foreground) / .62);
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: color .12s ease, background-color .12s ease;
}
.st-side-item:hover {
  color: hsl(var(--foreground) / .92);
  background: hsl(var(--foreground) / .04);
}
.st-side-item[data-active="true"] {
  color: hsl(var(--foreground));
  background: hsl(var(--foreground) / .06);
}
.st-side-item[data-active="true"]::before {
  content: '';
  position: absolute;
  left: -12px; top: 6px; bottom: 6px;
  width: 2px; background: hsl(var(--primary));
  border-radius: 2px;
}
.st-side-group {
  font-size: 10.5px; font-weight: 600; letter-spacing: .04em;
  color: hsl(var(--foreground) / .38);
  padding: 0 12px; margin: 12px 0 4px;
  text-transform: uppercase;
}

/* ── Tabela — dense, hairline separators, hover na wierszu ─────────── */
.st-tabela {
  width: 100%; border-collapse: collapse;
  font-size: 12.5px;
}
.st-tabela th {
  text-align: left; font-weight: 500;
  font-size: 11px; color: hsl(var(--foreground) / .5);
  padding: 8px 12px;
  border-bottom: 1px solid hsl(var(--border) / .7);
  background: hsl(var(--foreground) / .02);
}
.st-tabela td {
  padding: 10px 12px;
  border-bottom: 1px solid hsl(var(--border) / .35);
  color: hsl(var(--foreground) / .82);
  font-variant-numeric: tabular-nums;
}
.st-tabela tr:last-child td { border-bottom: none; }
.st-tabela tr:hover td { background: hsl(var(--foreground) / .025); }

/* ── Pigułka stanu ─────────────────────────────────────────────────── */
.st-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 8px 2px 6px;
  font-size: 11px; font-weight: 500;
  border-radius: 999px;
  border: 1px solid;
}
.st-pill[data-tone="ok"]   { color: hsl(158 60% 62%); border-color: hsl(158 45% 30% / .5); background: hsl(158 40% 15% / .35); }
.st-pill[data-tone="warn"] { color: hsl(38  95% 65%); border-color: hsl(38  45% 30% / .5); background: hsl(38  40% 15% / .35); }
.st-pill[data-tone="off"]  { color: hsl(var(--foreground) / .5); border-color: hsl(var(--border) / .7); background: hsl(var(--foreground) / .03); }
.st-dot { width: 6px; height: 6px; border-radius: 50%; }
.st-dot[data-tone="ok"]   { background: hsl(158 60% 62%); box-shadow: 0 0 6px hsl(158 60% 62% / .6); }
.st-dot[data-tone="warn"] { background: hsl(38  95% 65%); }
.st-dot[data-tone="off"]  { background: hsl(var(--foreground) / .35); }
`

/* ═══════════════════════════════════════════════════════════════════════
   Sparkline SVG — czysty, bez bibliotek.
   Rysuje krzywą Bezier + wypełnienie do zera + końcową kropkę.
   ═══════════════════════════════════════════════════════════════════════ */
function Sparkline({ data, width = 480, height = 120, tone = 'primary' }: {
  data: number[]; width?: number; height?: number; tone?: 'primary' | 'success'
}) {
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const pad = 4
  const w = width - pad * 2
  const h = height - pad * 2
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * w,
    pad + h - ((v - min) / range) * h,
  ] as [number, number])

  /* Krzywa Catmull-Rom → Bezier dla naturalnej gładkości */
  let d = `M ${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`
  }
  const dFill = `${d} L ${pts[pts.length - 1][0]},${height} L ${pts[0][0]},${height} Z`
  const strokeVar = tone === 'primary' ? '--primary' : ''
  const strokeColor = tone === 'primary' ? `hsl(var(--primary))` : `hsl(158 60% 62%)`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${tone}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor={strokeColor} stopOpacity=".25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Siatka horyzontalna — 3 linie */}
      {[0.33, 0.66].map((y) => (
        <line key={y} x1={pad} x2={width - pad} y1={pad + h * y} y2={pad + h * y}
          stroke="hsl(var(--foreground) / .06)" strokeDasharray="2 4" strokeWidth="1" />
      ))}
      <path d={dFill} fill={`url(#sp-${tone})`} />
      <path d={d} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      {/* Końcowa kropka */}
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5"
        fill={strokeColor} stroke="hsl(var(--tafla-1))" strokeWidth="2" />
    </svg>
  )
}

/* ─── Sidebar ─────────────────────────────────────────────────────── */
const SIDEBAR = [
  { group: null, items: [
    { icon: Home,     label: 'Panel Główny',   active: true },
    { icon: Folder,   label: 'Projekty',       badge: 12 },
    { icon: Boxes,    label: 'Modele AI' },
    { icon: Activity, label: 'Aktywność' },
  ]},
  { group: 'ZESPÓŁ', items: [
    { icon: Users,    label: 'Członkowie' },
    { icon: Bell,     label: 'Powiadomienia', badge: 3 },
  ]},
  { group: 'KONTO', items: [
    { icon: Settings, label: 'Ustawienia' },
  ]},
] as const

function Sidebar() {
  return (
    <aside className="w-[220px] shrink-0 flex flex-col gap-1 py-4 pr-2 border-r border-border/60">
      {/* Logo + workspace */}
      <div className="flex items-center gap-2.5 px-3 pb-3 mb-2 border-b border-border/50">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-[13px]">
          N
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-foreground leading-tight truncate">NextByte</p>
          <p className="text-[10.5px] text-foreground/50 leading-tight">Workspace · Pro</p>
        </div>
      </div>

      {SIDEBAR.map((section, i) => (
        <React.Fragment key={i}>
          {section.group && <div className="st-side-group">{section.group}</div>}
          {section.items.map((item) => (
            <div key={item.label} className="st-side-item" data-active={('active' in item && item.active) || undefined}>
              <item.icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <span className="flex-1 truncate">{item.label}</span>
              {'badge' in item && item.badge && (
                <span className="text-[10.5px] font-medium text-foreground/50 tabular-nums">{item.badge}</span>
              )}
            </div>
          ))}
        </React.Fragment>
      ))}

      {/* User chip u dołu */}
      <div className="mt-auto pt-3 border-t border-border/50 px-2">
        <div className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-foreground/[0.04] cursor-pointer transition-colors">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-semibold text-primary-foreground">
            AR
            <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full bg-emerald-500 border-2 border-[hsl(var(--tafla-1))]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-foreground leading-tight truncate">Artur R.</p>
            <p className="text-[10.5px] text-foreground/50 leading-tight truncate">arturbacik7@…</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ─── KPI kafelka ─────────────────────────────────────────────────── */
function Kpi({ icon: Icon, label, value, delta, note, tone = 'up' }: {
  icon: React.ElementType; label: string; value: string; delta: string; note: string
  tone?: 'up' | 'down' | 'flat'
}) {
  const Arrow = tone === 'up' ? ArrowUpRight : tone === 'down' ? ArrowDownRight : Circle
  return (
    <div className="st-kpi">
      <div className="flex items-start justify-between">
        <div className="st-kpi-label"><Icon className="h-3.5 w-3.5" />{label}</div>
        <button className="text-foreground/35 hover:text-foreground/70 -mr-1 -mt-1 p-1">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="st-kpi-value">{value}</span>
        <span className="st-kpi-delta" data-tone={tone}>
          <Arrow className="h-3 w-3" />{delta}
        </span>
      </div>
      <div className="st-kpi-note">{note}</div>
    </div>
  )
}

/* ─── Wygenerowane dane dla wykresu ────────────────────────────────── */
const CHART = [
  38, 42, 40, 48, 55, 52, 61, 58, 66, 72, 68, 74, 80, 76, 84, 88, 82, 91, 95, 98,
]

const AKTYWNOSC = [
  { kto: 'Marta K.',  co: 'wdrożyła model',          czas: '2 min',  ton: 'ok'   as const },
  { kto: 'Piotr W.',  co: 'zmienił ustawienia',       czas: '18 min', ton: 'off'  as const },
  { kto: 'System',    co: 'wykrył podejrzane logowanie', czas: '1 h',    ton: 'warn' as const },
  { kto: 'Julia B.',  co: 'ukończyła szkolenie',      czas: '3 h',    ton: 'ok'   as const },
  { kto: 'Backup',    co: 'zakończył się sukcesem',    czas: '5 h',    ton: 'ok'   as const },
]

const PROJEKTY = [
  { nazwa: 'nb-chat-core',     model: 'Claude Sonnet',   tokenow: '412 K',  status: 'Aktywny',   ton: 'ok'   as const, aktywnosc: '4 min' },
  { nazwa: 'wizja-produktu',   model: 'GPT-4o',          tokenow: '128 K',  status: 'Aktywny',   ton: 'ok'   as const, aktywnosc: '22 min' },
  { nazwa: 'router-lab',        model: 'Llama 3.3 70B',   tokenow: '86 K',   status: 'Zatrzymany', ton: 'off'  as const, aktywnosc: '2 dni' },
  { nazwa: 'obrazy-marketing', model: 'FLUX 1.1 Pro',    tokenow: '54 K',   status: 'Uwaga',     ton: 'warn' as const, aktywnosc: '6 h' },
  { nazwa: 'grok-eval',        model: 'Grok 3',          tokenow: '31 K',   status: 'Aktywny',   ton: 'ok'   as const, aktywnosc: '11 h' },
]

/* ═══════════════════════════════════════════════════════════════════════ */
export function StudioSection() {
  const [inject] = useState(() => <style dangerouslySetInnerHTML={{ __html: STYLES }} />)

  return (
    <div className="-mx-4 -mt-8">
      {inject}
      <div className="mx-auto max-w-screen-2xl px-4 py-6">
        <div className="flex gap-6 min-h-[720px]">

          <Sidebar />

          {/* ── MAIN ──────────────────────────────────────────────── */}
          <main className="flex-1 flex flex-col gap-5 min-w-0">

            {/* Top bar */}
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-[18px] font-semibold text-foreground leading-tight tracking-tight">Panel Główny</h2>
                <p className="text-[12px] text-foreground/50 leading-tight mt-0.5">
                  Zarządzaj projektami i zużyciem tokenów
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="st-search">
                  <Search className="h-3.5 w-3.5" />
                  <span>Szukaj projektów, modeli…</span>
                  <span className="st-kbd"><Command className="h-2.5 w-2.5" />K</span>
                </div>
                <button className="st-btn st-btn-ghost">
                  <Bell className="h-3.5 w-3.5" />
                </button>
                <button className="st-btn st-btn-primary">
                  <Plus className="h-3.5 w-3.5" />Nowy projekt
                </button>
              </div>
            </div>

            {/* Row: 4 KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Kpi icon={Activity} label="Tokeny / mies."  value="2,41 M"  delta="+18%" note="cel: 3 M · 80%"   tone="up" />
              <Kpi icon={Folder}   label="Projekty"        value="12"      delta="+3"   note="8 aktywnych"      tone="up" />
              <Kpi icon={CheckCircle2} label="Uptime"      value="99,94%"  delta="−0,05%" note="p99 340 ms"     tone="down" />
              <Kpi icon={Users}    label="Użytkownicy"     value="1 204"   delta="+84"  note="nowi w tym tyg." tone="up" />
            </div>

            {/* Chart + activity */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
              {/* Chart */}
              <div className="st-plotno flex flex-col">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Zużycie tokenów</p>
                    <p className="text-[11px] text-foreground/50">ostatnie 20 dni</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {['7d', '30d', '90d'].map((v, i) => (
                      <button key={v} className="st-btn st-btn-ghost" style={{ height: 26, padding: '0 10px', fontSize: 11.5, opacity: i === 1 ? 1 : .6 }}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-5 pt-6">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-[28px] font-semibold text-foreground leading-none tabular-nums tracking-tight">2,41 M</span>
                    <span className="st-kpi-delta" data-tone="up"><ArrowUpRight className="h-3 w-3" />+18,2%</span>
                    <span className="text-[11px] text-foreground/45 ml-auto">vs poprzedni okres</span>
                  </div>
                  <Sparkline data={CHART} />
                </div>
              </div>

              {/* Activity */}
              <div className="st-plotno flex flex-col">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Aktywność</p>
                    <p className="text-[11px] text-foreground/50">ostatnie zdarzenia</p>
                  </div>
                  <button className="text-[11.5px] font-medium text-primary hover:underline underline-offset-2">
                    Zobacz wszystkie
                  </button>
                </div>
                <div className="flex-1 px-2 py-2">
                  {AKTYWNOSC.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-[6px] hover:bg-foreground/[0.03]">
                      <span className="st-dot mt-1.5" data-tone={a.ton} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] leading-tight">
                          <span className="text-foreground font-medium">{a.kto}</span>{' '}
                          <span className="text-foreground/65">{a.co}</span>
                        </p>
                        <p className="text-[10.5px] text-foreground/40 mt-1 tabular-nums">{a.czas} temu</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="st-plotno overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Ostatnie projekty</p>
                  <p className="text-[11px] text-foreground/50">5 z 12</p>
                </div>
                <button className="text-[11.5px] font-medium text-primary hover:underline underline-offset-2 inline-flex items-center gap-1">
                  Wszystkie <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <table className="st-tabela">
                <thead>
                  <tr>
                    <th>Projekt</th>
                    <th>Model</th>
                    <th className="text-right">Tokeny</th>
                    <th>Status</th>
                    <th className="text-right">Aktywność</th>
                  </tr>
                </thead>
                <tbody>
                  {PROJEKTY.map((p) => (
                    <tr key={p.nazwa}>
                      <td>
                        <span className="font-medium text-foreground">{p.nazwa}</span>
                      </td>
                      <td className="text-foreground/70">{p.model}</td>
                      <td className="text-right font-medium">{p.tokenow}</td>
                      <td>
                        <span className="st-pill" data-tone={p.ton}>
                          <span className="st-dot" data-tone={p.ton} />{p.status}
                        </span>
                      </td>
                      <td className="text-right text-foreground/55">{p.aktywnosc} temu</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}
