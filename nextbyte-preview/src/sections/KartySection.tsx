import React from 'react'
import { BarChart3, Users, Activity, Shield, Zap, Layers, ArrowRight, Sparkles } from 'lucide-react'
import { GlassCard, GlassStat, GlassPanel, GlassBadge, GlassButton, GlassModelSearch } from '@/components/glass'
import { useGlass } from '@/lib/glass-context'
import { cn } from '@/lib/utils'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-foreground/40">{children}</p>
}

export function KartySection() {
  const { isGlass } = useGlass()
  const panel  = isGlass ? 'nb-szklo nb-szklo-plynne rounded-2xl p-4' : 'rounded-2xl border border-border bg-muted/30 p-4'
  const iconBox = isGlass ? 'nb-szklo nb-szklo-plynne rounded-xl p-1.5' : 'rounded-xl border border-border bg-card p-1.5'

  return (
    <div className="space-y-10">

      {/* KARTY PODSTAWOWE */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Karta (Card)</h3>
        <SectionLabel>Warianty zawartości</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Karta informacyjna */}
          <GlassCard className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={cn(iconBox, 'text-primary')}><BarChart3 className="h-4 w-4" /></span>
              <p className="text-sm font-semibold text-foreground">Analityka</p>
            </div>
            <p className="text-xs text-foreground/60">Monitoruj wyniki w czasie rzeczywistym. Szczegółowe raporty i wizualizacje danych.</p>
            <div className="flex items-center gap-2 text-xs font-medium text-primary cursor-pointer">
              Szczegóły <ArrowRight className="h-3 w-3" />
            </div>
          </GlassCard>

          {/* Karta statusu */}
          <GlassCard className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(iconBox, 'text-emerald-400')}><Activity className="h-4 w-4" /></span>
                <p className="text-sm font-semibold text-foreground">Status systemu</p>
              </div>
              <GlassBadge intent="success" dot size="sm">OK</GlassBadge>
            </div>
            <div className={cn(panel, 'space-y-2')}>
              {['API Gateway', 'Model Router', 'Vector DB'].map((s) => (
                <div key={s} className="flex items-center justify-between text-xs">
                  <span className="text-foreground/60">{s}</span>
                  <span className="text-emerald-400 font-medium">99.9%</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Karta bezpieczeństwa */}
          <GlassCard className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(iconBox, 'text-red-400')}><Shield className="h-4 w-4" /></span>
                <p className="text-sm font-semibold text-foreground">Bezpieczeństwo</p>
              </div>
              <GlassBadge intent="danger" dot size="sm">3 alerty</GlassBadge>
            </div>
            <div className={cn(panel, 'space-y-1.5')}>
              <div className="text-xs text-red-400 font-medium">Nieautoryzowany dostęp</div>
              <div className="text-xs text-amber-400 font-medium">Podejrzane logowania</div>
              <div className="text-xs text-foreground/50">Sprawdzenie certyfikatów</div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* STATYSTYKI */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Statystyki (Stat)</h3>
        <SectionLabel>4-kolumnowy grid</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <GlassStat label="Tokeny"      value="2.4M"  delta="+18%"   trend="up"      icon={<Zap className="h-4 w-4" />}      subtext="ostatnie 30 dni" />
          <GlassStat label="Projekty"    value="12"    delta="+3"     trend="up"      icon={<Layers className="h-4 w-4" />}   subtext="aktywne" />
          <GlassStat label="Uptime"      value="99.9%" delta="-0.1%"  trend="neutral" icon={<Activity className="h-4 w-4" />} subtext="p99 latency 340ms" />
          <GlassStat label="Użytkownicy" value="1 204" delta="+84"    trend="up"      icon={<Users className="h-4 w-4" />}    subtext="nowi w tym tygodniu" />
        </div>
      </div>

      {/* PANEL */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Panel (GlassPanel)</h3>
        <SectionLabel>Toolbar + lista statusów</SectionLabel>
        <GlassPanel className="flex-wrap p-3">
          <GlassBadge intent="success" dot>API v2</GlassBadge>
          <GlassBadge intent="primary">3 modele</GlassBadge>
          <GlassBadge intent="neutral">Workspace: Dev</GlassBadge>
          <span className="flex-1" />
          <GlassButton size="sm" variant="ghost"><Sparkles className="h-3.5 w-3.5" />Generuj</GlassButton>
        </GlassPanel>
      </div>

      {/* MODEL SEARCH */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Wybór modelu AI (GlassModelSearch)</h3>
        <SectionLabel>Komponent złożony — wyszukiwanie + karty modeli</SectionLabel>
        <GlassModelSearch />
      </div>

    </div>
  )
}
