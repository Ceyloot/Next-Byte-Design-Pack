import React from 'react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

/* ═══════════════════════════════════════════════════════════════════
   Dwupanelowa wyszukiwarka modeli — wierna reprodukcja dropdownu
   z nextbyte.space/chat-ai (zrzuty ekranu z sesji).
   Lewy panel: lista pogrupowana, wiersz = ikona + {nazwa + opis} + koszt.
   Prawy panel: nagłówek + opis + kontekst, siatka metryk 2×2 z segmento-
   wymi paskami 8px, box koszt wiadomości, segment poziomu rozumowania.
   ═══════════════════════════════════════════════════════════════════ */

export interface ModelPickerItem {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  cost?: number
  needsSetup?: boolean
}

export interface ModelPickerGroup {
  label: string
  items: ModelPickerItem[]
}

export interface ModelMetric {
  label: string
  /** 0–10 segmentów wypełnionych */
  value: number
  max?: number
}

export interface ModelPickerDetail {
  name: string
  badge: string
  description: string
  contextLabel: string
  metrics: ModelMetric[]
  messageCost: number
  reasoningLevels: string[]
  activeReasoningLevel?: string
}

export interface GlassModelPickerProps {
  groups: ModelPickerGroup[]
  activeId?: string
  /** ID elementu który jest hover'owany/podejrzany (drugi po aktywnym) */
  peekId?: string
  onSelect?: (item: ModelPickerItem) => void
  detail: ModelPickerDetail
  onReasoningLevelChange?: (level: string) => void
  className?: string
}

/* Paskowe metryki — 10 kwadratowych segmentów jak w oryginale */
function MetricBars({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-[8px] flex-1 rounded-sm',
            i < value ? 'bg-primary' : 'bg-foreground/[0.08]',
          )}
        />
      ))}
    </div>
  )
}

export function GlassModelPicker({
  groups,
  activeId,
  peekId,
  onSelect,
  detail,
  onReasoningLevelChange,
  className,
}: GlassModelPickerProps) {
  const { isGlass } = useGlass()

  const panelCls = isGlass
    ? 'nb-szklo nb-szklo-plynne border border-border/40'
    : 'bg-card border border-border'

  return (
    <div className={cn('flex items-start gap-4', className)}>

      {/* ── Lewy panel: lista modeli ── */}
      <div className={cn('w-[340px] shrink-0 overflow-hidden rounded-2xl', panelCls)}>
        <div className="max-h-[480px] overflow-y-auto p-2">
          {groups.map((group, gi) => (
            <div key={group.label}>
              {/* Nagłówek grupy */}
              <p className={cn(
                'px-3 pb-2 pt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/40',
                gi > 0 && 'pt-4',
              )}>
                {group.label}
              </p>

              {group.items.map((item) => {
                const isActive = item.id === activeId
                const isPeek  = item.id === peekId && !isActive
                const Icon    = item.icon

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect?.(item)}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150',
                      isActive
                        ? 'bg-primary/[0.08] border border-primary/20'
                        : isPeek
                        ? 'bg-foreground/[0.04] border border-transparent'
                        : 'border border-transparent hover:bg-foreground/[0.03] hover:border-border/30',
                    )}
                  >
                    {/* Linia aktywności po lewej */}
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute inset-y-[8px] left-0 w-[3px] rounded-full bg-primary"
                      />
                    )}

                    {/* Ikona modelu */}
                    <span className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-foreground/[0.06] text-foreground/50 group-hover:text-foreground/70',
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>

                    {/* Nazwa + opis */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          'text-sm font-semibold leading-tight',
                          isActive ? 'text-primary' : 'text-foreground',
                        )}>
                          {item.name}
                        </span>
                        {item.needsSetup && (
                          <span className="rounded-[4px] bg-amber-400/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-amber-400">
                            Skonfiguruj
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11.5px] leading-tight text-foreground/45">
                        {item.description}
                      </p>
                    </div>

                    {/* Koszt w ⟠ */}
                    {item.cost !== undefined && (
                      <span className={cn(
                        'shrink-0 rounded-full px-2 py-1 font-mono text-[11px] font-medium tabular-nums',
                        isActive
                          ? 'bg-primary/[0.12] text-primary'
                          : 'bg-foreground/[0.05] text-foreground/40',
                      )}>
                        ⟠ {item.cost}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Prawy panel: szczegóły wybranego modelu ── */}
      <div className={cn('w-[360px] shrink-0 rounded-2xl p-5', panelCls)}>

        {/* Nagłówek: nazwa + badge dostawcy */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[18px] font-bold leading-none text-foreground">
            {detail.name}
          </span>
          <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-foreground/35">
            {detail.badge}
          </span>
        </div>

        {/* Opis */}
        <p className="mt-2.5 text-[12.5px] leading-[1.6] text-foreground/50">
          {detail.description}
        </p>

        {/* Kontekst */}
        <p className="mt-1.5 text-[11px] text-foreground/30">
          {detail.contextLabel}
        </p>

        {/* Metryki 2×2 */}
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
          {detail.metrics.map((m) => (
            <div key={m.label}>
              <p className="mb-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.15em] text-foreground/50">
                {m.label}
              </p>
              <MetricBars value={m.value} max={m.max} />
            </div>
          ))}
        </div>

        {/* Box kosztu wiadomości */}
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] px-4 py-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/45">
            Koszt wiadomości
          </span>
          <span className="text-[17px] font-bold leading-none text-primary">
            {detail.messageCost} Byte
          </span>
        </div>

        {/* Konfiguracja — poziom rozumowania */}
        {detail.reasoningLevels.length > 0 && (
          <div className="mt-5">
            <p className="mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-foreground/35">
              Konfiguracja
            </p>
            <p className="mb-3 text-[13px] text-foreground/80">
              Poziom rozumowania
            </p>
            <div className="flex gap-1 rounded-xl bg-foreground/[0.04] p-1">
              {detail.reasoningLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onReasoningLevelChange?.(level)}
                  className={cn(
                    'flex h-9 flex-1 items-center justify-center rounded-lg text-[13px] font-medium transition-all duration-150',
                    level === detail.activeReasoningLevel
                      ? 'bg-foreground/[0.10] text-foreground shadow-sm'
                      : 'text-foreground/40 hover:text-foreground/65',
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
