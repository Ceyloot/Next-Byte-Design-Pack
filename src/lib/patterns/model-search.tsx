import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricBar } from '@/lib/core/metric-bar';

export interface ModelMetrics {
  intelligence: number;
  speed: number;
  context: number;
  cost: number;
}

export interface ModelConfig {
  reasoningEffort?: 'low' | 'medium' | 'high';
  responseSpeed?: 'standard' | 'fast';
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextSize?: string;
  costPerMessage: number;
  metrics: ModelMetrics;
  group: string;
  badge?: string;
  badgeColor?: 'primary' | 'warning' | 'muted';
  icon?: React.ReactNode;
  config?: ModelConfig;
}

export type ModelSearchSize = 'sm' | 'default' | 'lg';

const SIZE_MAP: Record<ModelSearchSize, {
  list: number; panel: number; listMaxH: string;
  metric: 'sm' | 'default' | 'lg';
  trigger: string; icon: string; name: string; desc: string;
  rowPad: string; panelPad: string; metricGapX: string;
}> = {
  sm: {
    list: 260, panel: 260, listMaxH: 'max-h-72', metric: 'sm',
    trigger: 'px-2.5 py-1.5 text-xs', icon: 'h-8 w-8 text-sm',
    name: 'text-xs', desc: 'text-[10px]',
    rowPad: 'px-2 py-1.5 gap-2.5', panelPad: 'p-3 gap-2.5', metricGapX: 'gap-x-3 gap-y-2.5',
  },
  default: {
    list: 320, panel: 320, listMaxH: 'max-h-[340px]', metric: 'default',
    trigger: 'px-3 py-2 text-sm', icon: 'h-9 w-9 text-base',
    name: 'text-sm', desc: 'text-[11px]',
    rowPad: 'px-2.5 py-2 gap-3', panelPad: 'p-4 gap-3', metricGapX: 'gap-x-4 gap-y-3',
  },
  lg: {
    list: 380, panel: 380, listMaxH: 'max-h-[420px]', metric: 'lg',
    trigger: 'px-4 py-2.5 text-base', icon: 'h-10 w-10 text-lg',
    name: 'text-base', desc: 'text-xs',
    rowPad: 'px-3 py-2.5 gap-3', panelPad: 'p-5 gap-4', metricGapX: 'gap-x-5 gap-y-3.5',
  },
};

export interface ModelSearchProps {
  models: Model[];
  value?: string;
  onValueChange?: (id: string, model: Model) => void;
  placeholder?: string;
  size?: ModelSearchSize;
  /** Szklana powierzchnia — trigger i kafelki przepuszczają tło (backdrop-blur). */
  glass?: boolean;
  triggerClassName?: string;
}

function computeCost(model: Model, effort: 'low' | 'medium' | 'high'): number {
  if (effort === 'high') return model.costPerMessage + 1;
  if (effort === 'low')  return Math.max(1, model.costPerMessage - 1);
  return model.costPerMessage;
}

const EFFORT_LABEL: Record<string, string> = { low: 'LOW', medium: 'MED', high: 'HIGH' };

/* ── Segmentowany przełącznik ── */
interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  glass?: boolean;
}

function Segmented<T extends string>({ options, value, onChange, glass = false }: SegmentedProps<T>) {
  return (
    <div className={cn(
      'flex gap-1 rounded-xl border p-1',
      glass ? 'border-foreground/15 bg-foreground/5' : 'border-border bg-background/40'
    )}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-[11px] transition-all duration-150',
              active
                ? 'bg-primary/15 border border-primary font-semibold text-primary shadow-uniesiona'
                : 'border border-transparent font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const EFFORT_OPTIONS = [
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
] as const;

const SPEED_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'fast',     label: 'Fast' },
] as const;

const ModelSearch = React.forwardRef<HTMLDivElement, ModelSearchProps>(
  ({ models, value, onValueChange, placeholder = 'Wybierz model', size = 'default', glass = false, triggerClassName }, _ref) => {
    const S = SIZE_MAP[size];
    const [open, setOpen] = React.useState(false);
    const [hoveredId, setHoveredId] = React.useState<string | null>(null);
    const [panelPos, setPanelPos] = React.useState({ top: 0, left: 0 });
    const [reasoningEffort, setReasoningEffort] = React.useState<Record<string, 'low' | 'medium' | 'high'>>({});
    const [responseSpeed, setResponseSpeed] = React.useState<Record<string, 'standard' | 'fast'>>({});
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const clearTimer = React.useRef<number | undefined>(undefined);

    const selected = models.find(m => m.id === value);
    /* Panel pokazuje się dopiero po najechaniu na model — brak fallbacku */
    const hovered = models.find(m => m.id === hoveredId) ?? null;
    const groups = Array.from(new Set(models.map(m => m.group)));

    React.useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (
          wrapperRef.current && !wrapperRef.current.contains(e.target as Node) &&
          panelRef.current && !panelRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
          setHoveredId(null);
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    React.useEffect(() => () => window.clearTimeout(clearTimer.current), []);

    /* Kursor poza listą i panelem → chowamy detale.
       Krótkie opóźnienie pozwala przejechać przez przerwę między kafelkami. */
    React.useEffect(() => {
      if (!open) return;
      const onOver = (e: MouseEvent) => {
        const t = e.target as Node;
        if (listRef.current?.contains(t) || panelRef.current?.contains(t)) {
          window.clearTimeout(clearTimer.current);
        } else {
          window.clearTimeout(clearTimer.current);
          clearTimer.current = window.setTimeout(() => setHoveredId(null), 140);
        }
      };
      document.addEventListener('mouseover', onOver);
      return () => document.removeEventListener('mouseover', onOver);
    }, [open]);

    /* Panel znika z opóźnieniem, żeby dało się przejechać myszą na niego */
    const scheduleClear = () => {
      window.clearTimeout(clearTimer.current);
      clearTimer.current = window.setTimeout(() => setHoveredId(null), 140);
    };
    const cancelClear = () => window.clearTimeout(clearTimer.current);

    /* Panel startuje od wysokości wiersza; mieści się w oknie (fixed, poza wszystkim) */
    const alignPanel = (row: HTMLElement) => {
      if (!listRef.current) return;
      const r = row.getBoundingClientRect();
      const l = listRef.current.getBoundingClientRect();
      const M = 8;
      let left = l.right + M;
      if (left + S.panel > window.innerWidth - M) left = l.left - S.panel - M;
      if (left < M) left = Math.max(M, window.innerWidth - S.panel - M);
      setPanelPos({ top: r.top, left });
    };

    /* Dociągnięcie w pionie, gdy panel nie mieści się do dołu ekranu */
    React.useLayoutEffect(() => {
      const el = panelRef.current;
      if (!el) return;
      const maxTop = window.innerHeight - el.offsetHeight - 8;
      if (panelPos.top > maxTop) {
        const next = Math.max(8, maxTop);
        if (Math.abs(next - panelPos.top) > 0.5) setPanelPos(p => ({ ...p, top: next }));
      }
    }, [hoveredId, panelPos.top]);

    const getEffort = (model: Model) =>
      reasoningEffort[model.id] ?? model.config?.reasoningEffort ?? 'medium';
    const getSpeed = (model: Model) =>
      responseSpeed[model.id] ?? model.config?.responseSpeed ?? 'standard';

    const badgeClass = (color?: string) => {
      if (color === 'warning') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      if (color === 'primary') return 'bg-primary/15 text-primary border-primary/30';
      return 'bg-muted text-muted-foreground border-border';
    };

    const selectedEffort = selected?.config?.reasoningEffort !== undefined ? getEffort(selected) : null;
    const selectedCost = selected
      ? (selectedEffort ? computeCost(selected, selectedEffort) : selected.costPerMessage)
      : 0;

    return (
      <div ref={wrapperRef} className="relative inline-block">
        {/* ── Trigger ── */}
        <button
          onClick={() => setOpen(o => !o)}
          className={cn(
            'flex items-center gap-2 rounded-xl font-semibold text-foreground transition-all',
            S.trigger,
            glass ? 'nb-glass' : 'border border-border bg-card hover:border-primary/40 hover:bg-card/80',
            open && !glass && 'border-primary/40',
            triggerClassName
          )}
        >
          {selected?.icon && <span className="shrink-0 text-base leading-none">{selected.icon}</span>}
          <span>{selected?.name ?? placeholder}</span>
          {selected && selectedEffort && (
            <span className="text-[9px] font-bold tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">
              {EFFORT_LABEL[selectedEffort]}
            </span>
          )}
          {selected && <span className="text-[10px] font-mono text-muted-foreground">◈{selectedCost}</span>}
          <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0', open && 'rotate-180')} />
        </button>

        {/* ── Kafelek 1: lista modeli ── */}
        {open && (
          <div className="absolute z-50" style={{ top: 'calc(100% + 8px)', left: 0 }}>
            <div
              ref={listRef}
              onMouseLeave={scheduleClear}
              className={cn(
                'flex flex-col rounded-2xl overflow-hidden shrink-0 p-1.5',
                glass ? 'nb-glass-static' : 'bg-popover shadow-wyzej border border-border'
              )}
              style={{ width: S.list }}
            >
              <div className={cn('overflow-y-auto flex flex-col gap-0.5', S.listMaxH)}>
                {groups.map(group => (
                  <React.Fragment key={group}>
                    <p className="px-2 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </p>
                    {models.filter(m => m.group === group).map(model => (
                      <button
                        key={model.id}
                        onMouseOver={e => { cancelClear(); setHoveredId(model.id); alignPanel(e.currentTarget); }}
                        onFocus={e => { cancelClear(); setHoveredId(model.id); alignPanel(e.currentTarget); }}
                        onClick={() => { onValueChange?.(model.id, model); setOpen(false); }}
                        className={cn(
                          'flex items-center rounded-xl text-left w-full transition-colors border',
                          S.rowPad,
                          value === model.id
                            ? 'bg-primary/10 border-primary/40 text-foreground'
                            : 'border-transparent hover:bg-accent/60 text-foreground'
                        )}
                      >
                        {model.icon && (
                          <span className={cn(
                            'shrink-0 flex items-center justify-center rounded-xl',
                            S.icon,
                            value === model.id ? 'bg-primary/20' : 'bg-muted'
                          )}>
                            {model.icon}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={cn('font-semibold truncate', S.name)}>{model.name}</span>
                            {model.costPerMessage > 0 && (
                              <span className="text-[10px] font-mono text-primary shrink-0">◈{model.costPerMessage}</span>
                            )}
                            {model.badge && (
                              <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded border shrink-0', badgeClass(model.badgeColor))}>
                                {model.badge}
                              </span>
                            )}
                          </div>
                          <p className={cn('text-muted-foreground truncate', S.desc)}>
                            {model.provider} — {model.description}
                          </p>
                        </div>
                        {value === model.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Kafelek 2: detale — portal na body, zawsze na wierzchu ── */}
        {open && hovered && createPortal(
          (() => {
            const effort = hovered.config?.reasoningEffort !== undefined ? getEffort(hovered) : null;
            const baseCost = hovered.costPerMessage;
            const dynCost = effort ? computeCost(hovered, effort) : baseCost;
            const costChanged = effort !== null && dynCost !== baseCost;

            return (
                <div
                  ref={panelRef}
                  onMouseEnter={cancelClear}
                  onMouseLeave={scheduleClear}
                  className={cn(
                    'fixed z-[9999] flex flex-col rounded-2xl',
                    S.panelPad,
                    glass ? 'nb-glass-static' : 'bg-card shadow-wyzej border border-border'
                  )}
                  style={{ width: S.panel, top: panelPos.top, left: panelPos.left }}
                >
                  {/* Nagłówek */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-base font-bold text-foreground leading-tight">{hovered.name}</span>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider mt-1 shrink-0">{hovered.provider}</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-snug">{hovered.description}</p>
                    {hovered.contextSize && (
                      <p className="text-[11px] text-muted-foreground mt-1.5">Kontekst: {hovered.contextSize}</p>
                    )}
                  </div>

                  {/* Metryki 2×2 */}
                  <div className={cn('grid grid-cols-2', S.metricGapX)}>
                    <MetricBar label="Inteligencja" value={hovered.metrics.intelligence} color="warning" size={S.metric} />
                    <MetricBar label="Szybkość"     value={hovered.metrics.speed}        color="success" size={S.metric} />
                    <MetricBar label="Kontekst"     value={hovered.metrics.context}      color="success" size={S.metric} />
                    <MetricBar label="Koszt"        value={hovered.metrics.cost}         color="success" size={S.metric} />
                  </div>

                  {/* Koszt wiadomości */}
                  <div className={cn(
                    'rounded-xl border px-3 py-2.5 flex items-center justify-between gap-2',
                    glass ? 'border-foreground/15 bg-foreground/5' : 'border-border bg-background/40'
                  )}>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Koszt wiadomości</span>
                    <div className="flex items-baseline gap-1.5 shrink-0">
                      {costChanged && <span className="text-[11px] text-muted-foreground line-through">◈{baseCost} Byte</span>}
                      <span className={cn('text-base font-bold', costChanged ? 'text-amber-400' : 'text-primary')}>
                        ◈{dynCost} Byte
                      </span>
                    </div>
                  </div>

                  {/* Konfiguracja */}
                  {(hovered.config?.reasoningEffort !== undefined || hovered.config?.responseSpeed !== undefined) && (
                    <div className="flex flex-col gap-2.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Konfiguracja</span>

                      {hovered.config?.reasoningEffort !== undefined && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[12px] text-foreground">Reasoning effort</span>
                          <Segmented
                            options={EFFORT_OPTIONS}
                            value={effort ?? 'medium'}
                            glass={glass}
                            onChange={level => setReasoningEffort(prev => ({ ...prev, [hovered.id]: level }))}
                          />
                        </div>
                      )}

                      {hovered.config?.responseSpeed !== undefined && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[12px] text-foreground">Szybkość odpowiedzi</span>
                          <Segmented
                            options={SPEED_OPTIONS}
                            value={getSpeed(hovered)}
                            glass={glass}
                            onChange={speed => setResponseSpeed(prev => ({ ...prev, [hovered.id]: speed }))}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
            );
          })(),
          document.body
        )}
      </div>
    );
  }
);
ModelSearch.displayName = 'ModelSearch';

export { ModelSearch };
