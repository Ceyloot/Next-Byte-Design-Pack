import React from 'react'
import { RefreshCw, Database, HardDrive, Users, Zap, FileStack, Table2, TicketCheck } from 'lucide-react'
import { GlassCard, GlassPanel, GlassBadge, GlassButton, GlassRing, GlassProgress, GlassTable, GlassLineChart, GlassActivityGrid, GlassPagination } from '@/components/glass'
import type { GlassTableColumn } from '@/components/glass'
import { CHART_1, CHART_2, CHART_3, CHART_4, CHART_NEUTRAL, TINT_1, TINT_2, TINT_3, TINT_4 } from '@/lib/chart-colors'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

// ── Dane do tabeli ────────────────────────────────────────────────
type ModelRow = {
  model: string
  provider: string
  input: string
  output: string
  ctx: string
  status: string
}

const MODEL_ROWS: ModelRow[] = [
  { model: 'GPT-4o',           provider: 'OpenAI',    input: '$5.00',  output: '$15.00', ctx: '128k', status: 'active'  },
  { model: 'Claude Sonnet 4',  provider: 'Anthropic', input: '$3.00',  output: '$15.00', ctx: '200k', status: 'active'  },
  { model: 'Gemini 1.5 Flash', provider: 'Google',    input: '$0.075', output: '$0.30',  ctx: '1M',   status: 'active'  },
  { model: 'Llama 3 70B',      provider: 'Meta',      input: '$0.59',  output: '$0.79',  ctx: '128k', status: 'beta'    },
  { model: 'Mistral Large',    provider: 'Mistral',   input: '$2.00',  output: '$6.00',  ctx: '128k', status: 'active'  },
  { model: 'Command R+',       provider: 'Cohere',    input: '$2.50',  output: '$10.00', ctx: '128k', status: 'preview' },
]

const MODEL_COLS: GlassTableColumn<ModelRow>[] = [
  { key: 'model',    header: 'Model',    sortable: true },
  { key: 'provider', header: 'Dostawca', sortable: true },
  { key: 'input',    header: 'Input / 1M', align: 'right', sortable: true },
  { key: 'output',   header: 'Output / 1M', align: 'right', sortable: true },
  { key: 'ctx',      header: 'Kontekst', align: 'center' },
  {
    key: 'status', header: 'Status',
    render: (v) => {
      const m: Record<string, { intent: 'success' | 'warning' | 'primary'; label: string }> = {
        active:  { intent: 'success', label: 'Aktywny' },
        beta:    { intent: 'warning', label: 'Beta' },
        preview: { intent: 'primary', label: 'Preview' },
      }
      const cfg = m[String(v)] ?? m.active
      return <GlassBadge intent={cfg.intent} size="sm" dot>{cfg.label}</GlassBadge>
    },
  },
]

// ── Dane do wykresu liniowego ─────────────────────────────────────
const DAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']
const LINE_SERIES_1 = DAYS.map((label, i) => ({ label, value: [1200, 1850, 1540, 2180, 1920, 820, 2847][i] }))
const LINE_SERIES_2 = DAYS.map((label, i) => ({ label, value: [980, 1100, 1350, 1620, 1440, 610, 1980][i] }))

const MONTHS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie']
const LINE_SERIES_TOKENS = MONTHS.map((label, i) => ({
  label,
  value: [420, 680, 590, 940, 1150, 1380, 1720, 2410][i] * 1000,
}))

const PLATFORM_STATS = [
  { label: 'Użytkownicy',      value: 37,  label2: '74',   icon: Users,      sub: 'z 200 limitu', color: CHART_1       },
  { label: 'Subskrypcje',      value: 80,  label2: '8',    icon: Zap,        sub: 'z 10 limitu',  color: CHART_2       },
  { label: 'Plików w magazynie', value: 14, label2: '7067', icon: FileStack,  sub: 'z 50 000',     color: CHART_3       },
  { label: 'Tabel w bazie',    value: 98,  label2: '490',  icon: Table2,     sub: 'z 500 limitu', color: CHART_4       },
  { label: 'Otwarte tickety',  value: 0,   label2: '0',    icon: TicketCheck, sub: 'brak',         color: CHART_NEUTRAL },
]

const RESOURCE_GAUGES = [
  {
    label:   'Baza danych',
    value:   11,
    subtext: '905 MB z 8.0 GB',
    color:   CHART_1,
    icon:    Database,
  },
  {
    label:   'Magazyn plików',
    value:   11,
    subtext: '10.6 GB ze 100.0 GB',
    color:   CHART_2,
    icon:    HardDrive,
  },
  {
    label:   'Aktywni / MAU',
    value:   0.022,
    subtext: '22 ze 100 000',
    color:   CHART_3,
    icon:    Users,
  },
]

const PROGRESS_BARS = [
  { label: 'Rozmiar bazy danych',       value: 11,    valueLabel: <>905 MB z 8.0 GB <strong className="text-foreground">11%</strong></> },
  { label: 'Magazyn plików',            value: 11,    valueLabel: <>10.6 GB ze 100.0 GB <strong className="text-foreground">11%</strong></> },
  { label: 'Aktywni miesięcznie (MAU)', value: 0.022, valueLabel: <>22 z 100 000 <strong className="text-foreground">&lt;1%</strong></> },
  { label: 'Transfer wychodzący',       value: 0,     valueLabel: <span className="text-foreground/40">niemierzalny</span> },
]

export function DaneSection() {
  const [tablePage, setTablePage] = React.useState(1)
  return (
    <div className="space-y-8">

      {/* PIERŚCIENIE STATYSTYK */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Ring (pierścień)</h3>
        <SectionLabel>Wariant full — wartość bezwzględna w centrum</SectionLabel>

        <GlassCard padding="p-0" className="overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Stan platformy</p>
              <p className="text-xs text-foreground/45 mt-0.5">liczby bezwzględne, pierścień pokazuje udział w limicie</p>
            </div>
            <GlassButton size="sm" variant="ghost" className="gap-1.5 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Odśwież
            </GlassButton>
          </div>

          <div className="grid grid-cols-5 border-t border-foreground/[0.06]">
            {PLATFORM_STATS.map(({ label, value, label2, color }) => (
              <div key={label} className="flex flex-col items-center gap-1 py-6 px-3">
                <GlassRing
                  value={value}
                  label={label2}
                  size={96}
                  thickness={7}
                  color={color}
                />
                <p className="text-[11px] text-foreground/55 text-center mt-1">{label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* WSKAŹNIKI GAUGE */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Gauge (półpierścień)</h3>
        <SectionLabel>Wariant gauge — 270° łuk z wartością % w centrum</SectionLabel>

        <GlassCard padding="p-0" className="overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-foreground/8">
            <p className="text-sm font-semibold text-foreground">Wykorzystanie zasobów</p>
            <p className="text-xs text-foreground/45 mt-0.5">mierzone we własnej bazie — bez zewnętrznego API</p>
          </div>

          <div className="grid grid-cols-3 py-6">
            {RESOURCE_GAUGES.map(({ label, value, subtext, color }) => (
              <div key={label} className="flex flex-col items-center gap-1 px-6">
                <GlassRing
                  variant="gauge"
                  value={value}
                  label={value < 1 ? '0%' : `${Math.round(value)}%`}
                  sublabel={label}
                  subtext={subtext}
                  size={160}
                  thickness={9}
                  color={color}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4 px-5 py-5 border-t border-foreground/8">
            {PROGRESS_BARS.map(({ label, value, valueLabel }) => (
              <GlassProgress
                key={label}
                label={label}
                value={value}
                valueLabel={valueLabel}
                showMarker={value > 0}
              />
            ))}
          </div>
        </GlassCard>
      </div>

      {/* STANDALONE PROGRESS */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Progress bar</h3>
        <SectionLabel>Warianty koloru i rozmiaru</SectionLabel>
        <GlassCard className="max-w-lg space-y-5">
          <GlassProgress
            label="Użycie CPU"
            value={72}
            valueLabel={<><strong className="text-foreground">72%</strong> z 100%</>}
            color="hsl(var(--primary))"
            showMarker
          />
          <GlassProgress
            label="Pamięć RAM"
            value={48}
            valueLabel={<><strong className="text-foreground">7.7 GB</strong> z 16 GB</>}
            color="hsl(160 60% 45%)"
            showMarker
          />
          <GlassProgress
            label="Dysk"
            value={91}
            valueLabel={<><strong className="text-amber-400">910 GB</strong> z 1 TB</>}
            color="hsl(38 92% 50%)"
            showMarker
          />
          <GlassProgress
            label="Transfer"
            value={23}
            valueLabel={<><strong className="text-foreground">230 GB</strong> z 1 TB</>}
            color="hsl(270 70% 60%)"
            size="sm"
          />
        </GlassCard>
      </div>

      {/* DONUT — wielosegmentowy GlassRing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Donut / Kołowy (GlassRing — segments)</h3>
        <SectionLabel>Kategorialny podział — każdy segment ma inny kolor, zwalidowany pod CVD</SectionLabel>
        <GlassCard className="flex flex-col sm:flex-row items-center gap-8">
          <GlassRing
            segments={[
              { pct: 41, color: TINT_1 },
              { pct: 28, color: TINT_2 },
              { pct: 19, color: TINT_3 },
              { pct: 12, color: TINT_4 },
            ]}
            size={160}
            thickness={14}
            label="2 847"
          />
          <div className="flex flex-col gap-2.5 flex-1">
            {[
              { pct: 41, color: TINT_1, label: 'AI Chat',       count: '1 167' },
              { pct: 28, color: TINT_2, label: 'Studio Zdęć',   count: '797' },
              { pct: 19, color: TINT_3, label: 'Prompty',        count: '541' },
              { pct: 12, color: TINT_4, label: 'Inne',           count: '342' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="flex-1 text-xs text-foreground/70">{s.label}</span>
                <span className="font-mono text-xs font-semibold text-foreground/85">{s.count}</span>
                <span className="font-mono text-xs text-foreground/40 w-8 text-right">{s.pct}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* TABELA */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Tabela danych (Table)</h3>
        <SectionLabel>Sortowalna — kliknij nagłówek kolumny · Glass / Normal automatycznie</SectionLabel>
        <GlassTable
          caption="Dostępne modele AI — ceny za 1M tokenów"
          columns={MODEL_COLS}
          data={MODEL_ROWS}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground/40">{MODEL_ROWS.length} wyników · strona {tablePage} z 4</span>
          <GlassPagination page={tablePage} total={4} onChange={setTablePage} />
        </div>
        <SectionLabel>Wariant kompaktowy</SectionLabel>
        <GlassTable
          compact
          columns={MODEL_COLS.slice(0, 4)}
          data={MODEL_ROWS.slice(0, 4)}
        />
        <div className="flex items-center justify-between">
          <GlassPagination page={1} total={8} onChange={() => {}} size="sm" />
        </div>
      </div>

      {/* WYKRES LINIOWY */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Wykres liniowy (Line Chart)</h3>

        <SectionLabel>Seria pojedyncza z obszarem — aktywność w tygodniu</SectionLabel>
        <GlassCard>
          <GlassLineChart
            series={[{ points: LINE_SERIES_1, color: 'hsl(var(--primary))', showArea: true }]}
            height={160}
            showYLabels
          />
        </GlassCard>

        <SectionLabel>Dwie serie — porównanie tygodni</SectionLabel>
        <GlassCard>
          <GlassLineChart
            series={[
              { points: LINE_SERIES_1, color: 'hsl(var(--primary))', label: 'Bieżący tydzień', showArea: true },
              { points: LINE_SERIES_2, color: CHART_2, label: 'Poprzedni tydzień', showArea: false },
            ]}
            height={160}
            showYLabels
          />
        </GlassCard>

        <SectionLabel>Trend miesięczny — tokeny (w tysiącach)</SectionLabel>
        <GlassCard>
          <GlassLineChart
            series={[{ points: LINE_SERIES_TOKENS, color: CHART_3, showArea: true }]}
            height={160}
            showYLabels
          />
        </GlassCard>
      </div>

      {/* HEATMAPA */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Heatmapa aktywności</h3>
        <SectionLabel>Siatka aktywności — 26 tygodni · najedź na dzień by zobaczyć tooltip</SectionLabel>
        <GlassCard padding="p-5">
          <GlassActivityGrid weeksCount={26} showSummary showStreaks />
        </GlassCard>
        <SectionLabel>Wariant kompaktowy — 12 tygodni</SectionLabel>
        <GlassCard padding="p-4">
          <GlassActivityGrid weeksCount={12} compact showSummary={false} showStreaks={false} hideHeader />
        </GlassCard>
      </div>

    </div>
  )
}
