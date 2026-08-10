import React from 'react'
import { RefreshCw, Database, HardDrive, Users, Zap, FileStack, Table2, TicketCheck } from 'lucide-react'
import { GlassCard, GlassPanel, GlassBadge, GlassButton, GlassRing, GlassProgress } from '@/components/glass'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

const PLATFORM_STATS = [
  { label: 'Użytkownicy',      value: 37,  label2: '74',   icon: Users,      sub: 'z 200 limitu' },
  { label: 'Subskrypcje',      value: 80,  label2: '8',    icon: Zap,        sub: 'z 10 limitu'  },
  { label: 'Plików w magazynie', value: 14, label2: '7067', icon: FileStack,  sub: 'z 50 000'     },
  { label: 'Tabel w bazie',    value: 98,  label2: '490',  icon: Table2,     sub: 'z 500 limitu' },
  { label: 'Otwarte tickety',  value: 0,   label2: '0',    icon: TicketCheck, sub: 'brak'         },
]

const RESOURCE_GAUGES = [
  {
    label:   'Baza danych',
    value:   11,
    subtext: '905 MB z 8.0 GB',
    color:   'hsl(var(--primary))',
    icon:    Database,
  },
  {
    label:   'Magazyn plików',
    value:   11,
    subtext: '10.6 GB ze 100.0 GB',
    color:   'hsl(var(--primary))',
    icon:    HardDrive,
  },
  {
    label:   'Aktywni / MAU',
    value:   0.022,
    subtext: '22 ze 100 000',
    color:   'hsl(var(--primary))',
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

          <div className="grid grid-cols-5 divide-x divide-foreground/8 border-t border-foreground/8">
            {PLATFORM_STATS.map(({ label, value, label2, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1 py-6 px-3">
                <GlassRing
                  value={value}
                  label={label2}
                  size={96}
                  thickness={7}
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

          <div className="grid grid-cols-3 divide-x divide-foreground/8 py-6">
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

    </div>
  )
}
