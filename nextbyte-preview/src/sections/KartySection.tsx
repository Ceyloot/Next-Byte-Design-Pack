import React from 'react'
import { BarChart3, Users, Activity, Shield, Zap, Layers, ArrowRight, Sparkles } from 'lucide-react'
import { GlassCard, GlassStat, GlassPanel, GlassBadge, GlassButton, GlassModelSearch } from '@/components/glass'
import { cn } from '@/lib/utils'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

export function KartySection() {
  /* Jeden wzór dla obu trybów: nb-wglobienie (panel) i nb-wglobienie-gnizado
     (mniejsza rzecz jak gniazdo ikony). Oparte na alfie foreground, więc
     wygląda identycznie na glass i na nb-tafla — koniec z rozjazdem. */
  const panel   = 'rounded-nb-sm nb-wglobienie p-4'
  const iconBox = 'rounded-nb-xs nb-wglobienie-gnizado p-1.5'

  return (
    <div className="space-y-10">

      {/* KARTY PODSTAWOWE */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Karta (Card)</h3>
        <SectionLabel>Warianty zawartości</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Wariant A — liczba prowadzi, ikona schodzi do roli podpisu.
              Hierarchia niesiona rozmiarem, nie ozdobnikiem. */}
          <GlassCard className="flex flex-col justify-between gap-5">
            <div className="space-y-1">
              <p className="text-3xl font-semibold tracking-tight text-foreground nb-liczby">2,41 M</p>
              <p className="text-xs text-foreground/50">tokenów przetworzonych w tym miesiącu</p>
            </div>
            <div className="flex items-center justify-between border-t border-foreground/[0.08] pt-3">
              <span className="flex items-center gap-1.5 text-xs text-foreground/45">
                <BarChart3 className="h-3.5 w-3.5" />Analityka
              </span>
              <span className="flex cursor-pointer items-center gap-1 text-xs font-medium text-primary">
                Szczegóły <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </GlassCard>

          {/* Wariant B — lista danych bez zagnieżdżonego pudełka.
              Rytm buduje hairline między wierszami. */}
          <GlassCard className="space-y-3.5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-foreground">Status systemu</p>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />operacyjny
              </span>
            </div>
            <div className="divide-y divide-foreground/[0.07]">
              {[['API Gateway', '99,98%'], ['Model Router', '99,95%'], ['Vector DB', '99,99%']].map(([s, v]) => (
                <div key={s} className="flex items-center justify-between py-2 text-xs first:pt-0 last:pb-0">
                  <span className="text-foreground/60">{s}</span>
                  <span className="font-medium text-foreground/85 nb-liczby">{v}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Wariant C — pasek istotności zamiast badge'a w rogu.
              Stan czyta się z formy, nie tylko z koloru tekstu. */}
          <GlassCard className="space-y-3.5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-foreground">Bezpieczeństwo</p>
              <span className="text-xs text-foreground/45 nb-liczby">3 zdarzenia</span>
            </div>
            <div className="space-y-2">
              {[
                ['Nieautoryzowany dostęp',   'bg-destructive',   'text-foreground/85'],
                ['Podejrzane logowania',     'bg-primary',       'text-foreground/85'],
                ['Sprawdzenie certyfikatów', 'bg-foreground/25', 'text-foreground/50'],
              ].map(([t, bar, tone]) => (
                <div key={t} className="flex items-stretch gap-2.5">
                  <span className={cn('w-0.5 shrink-0 rounded-full', bar)} />
                  <span className={cn('py-0.5 text-xs', tone)}>{t}</span>
                </div>
              ))}
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
