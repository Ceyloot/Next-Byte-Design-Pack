import React from 'react'
import { BarChart3, Users, Activity, Shield, Zap, Layers, ArrowRight, Sparkles, Brain, Database, Globe, Lock, Cpu, Star } from 'lucide-react'
import { GlassCard, GlassStat, GlassPanel, GlassBadge, GlassButton, GlassModelSearch, GlassFeatureRow, GlassCompareTable } from '@/components/glass'
import type { CompareCellValue } from '@/components/glass'
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

      {/* FEATURE ROW */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Wiersz cechy (GlassFeatureRow)</h3>
        <SectionLabel>Lista funkcji planu — ikona + opis + odznaka · Glass / Normal automatycznie</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="divide-y divide-foreground/[0.06] !p-0 overflow-hidden">
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Plan Pro</p>
              <p className="text-xs text-foreground/50 mt-0.5">Wszystko z Free + więcej</p>
            </div>
            <div className="px-2 py-2">
              <GlassFeatureRow icon={Brain}    label="Claude Sonnet 4"        desc="Najnowszy model Anthropic"       badge="NEW" highlight />
              <GlassFeatureRow icon={Database} label="200k kontekst"           desc="Do 200 000 tokenów na prompt" />
              <GlassFeatureRow icon={Globe}    label="Dostęp do internetu"      desc="Przeszukiwanie w czasie rzeczywistym" />
              <GlassFeatureRow icon={Lock}     label="Prywatne projekty"        desc="Pełna izolacja danych" />
              <GlassFeatureRow icon={Cpu}      label="Priority compute"         desc="Brak kolejki w godzinach szczytu" badge="PRO" />
              <GlassFeatureRow icon={Star}     label="Wsparcie priorytetowe"    desc="Czas odpowiedzi < 2h" />
            </div>
          </GlassCard>

          <GlassCard className="divide-y divide-foreground/[0.06] !p-0 overflow-hidden">
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Plan Free</p>
              <p className="text-xs text-foreground/50 mt-0.5">Na dobry początek</p>
            </div>
            <div className="px-2 py-2">
              <GlassFeatureRow icon={Brain}    label="GPT-4o mini"             desc="Szybki model do prostych zadań" />
              <GlassFeatureRow icon={Database} label="8k kontekst"              desc="Do 8 000 tokenów na prompt" />
              <GlassFeatureRow icon={Globe}    label="Brak internetu"           desc="Tylko dane z treningu" />
              <GlassFeatureRow icon={Lock}     label="Projekty publiczne"       desc="Widoczne dla innych" />
              <GlassFeatureRow icon={Cpu}      label="Shared compute"           desc="Wspólna kolejka" />
              <GlassFeatureRow icon={Star}     label="Wsparcie community"       desc="Forum i dokumentacja" />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* COMPARE TABLE */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Tabela porównawcza (GlassCompareTable)</h3>
        <SectionLabel>Podświetlona ostatnia kolumna — do porównania planów / wariantów</SectionLabel>
        <GlassCompareTable
          columns={['Free', 'Pro', 'Ultimate']}
          highlightLast
          rows={[
            { label: 'Tokeny / miesiąc',       values: ['50 000',    '2 000 000',  'Bez limitu'  ] as CompareCellValue[] },
            { label: 'Modele AI',               values: ['3 modele',  '8 modeli',   'Wszystkie'   ] as CompareCellValue[] },
            { label: 'Kontekst',                values: ['8k',        '200k',       '1M+'         ] as CompareCellValue[] },
            { label: 'Dostęp do internetu',     values: ['no',        'yes',        'yes'         ] as CompareCellValue[] },
            { label: 'Studio Zdęć',             values: ['no',        'yes',        'yes'         ] as CompareCellValue[] },
            { label: 'API access',              values: ['no',        'yes',        'yes'         ] as CompareCellValue[] },
            { label: 'Prywatne projekty',       values: ['no',        'yes',        'yes'         ] as CompareCellValue[] },
            { label: 'Priority compute',        values: ['no',        'no',         'yes'         ] as CompareCellValue[] },
            { label: 'Dedykowany manager',      values: ['no',        'no',         'yes'         ] as CompareCellValue[] },
            { label: 'SLA',                     values: ['Brak',      '99.9%',      '99.99%'      ] as CompareCellValue[] },
          ]}
        />
      </div>

    </div>
  )
}
