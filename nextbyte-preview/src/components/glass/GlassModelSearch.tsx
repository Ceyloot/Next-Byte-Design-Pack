import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, Star, Zap, Brain, Image as ImageIcon, ChevronDown, Search, Server, Rocket, Crown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

export interface Model {
  id: string
  name: string
  provider: string
  badge?: string
  description: string
  fullDescription?: string
  contextLabel?: string
  tags: string[]
  cost?: number
  needsSetup?: boolean
  speed: 'fast' | 'balanced' | 'powerful'
  icon: React.ReactNode
  metrics: { label: string; value: number }[]
  messageCost: number
  reasoningLevels: string[]
  group: 'NEXTBYTE' | 'INNE MODELE'
}

export const DEFAULT_MODELS: Model[] = [
  {
    id: 'szybki',
    name: 'Szybki',
    provider: 'NextByte',
    badge: 'NEXTBYTE',
    description: 'Błyskawiczne odpowiedzi do prostych zadań',
    fullDescription: 'Gemini 2.0 Flash — zoptymalizowana pod kątem ultra szybkiego czasu reakcji i codziennych zapytań.',
    contextLabel: 'Kontekst: 1M tokenów',
    tags: ['fast', 'gemini', 'nextbyte'],
    cost: 1,
    speed: 'fast',
    icon: <Zap className="h-4 w-4" />,
    group: 'NEXTBYTE',
    metrics: [
      { label: 'Inteligencja', value: 6 },
      { label: 'Szybkość', value: 10 },
      { label: 'Kontekst', value: 9 },
      { label: 'Koszt', value: 2 },
    ],
    messageCost: 1,
    reasoningLevels: ['Standard', 'Błyskawiczny'],
  },
  {
    id: 'pro',
    name: 'Pro',
    provider: 'NextByte',
    badge: 'NEXTBYTE',
    description: 'Zaawansowane rozumowanie i analiza',
    fullDescription: 'Gemini 3.1 Pro Preview — zaawansowane rozumowanie i analiza do bardziej złożonych zadań (2 Byte).',
    contextLabel: 'Kontekst: 1M tokenów',
    tags: ['reasoning', 'analysis', 'pro'],
    cost: 2,
    speed: 'balanced',
    icon: <Sparkles className="h-4 w-4" />,
    group: 'NEXTBYTE',
    metrics: [
      { label: 'Inteligencja', value: 8 },
      { label: 'Szybkość', value: 7 },
      { label: 'Kontekst', value: 10 },
      { label: 'Koszt', value: 8 },
    ],
    messageCost: 2,
    reasoningLevels: ['Niski', 'Średni', 'Wysoki'],
  },
  {
    id: 'ultra',
    name: 'Ultra',
    provider: 'NextByte',
    badge: 'NEXTBYTE',
    description: 'Najwyższa jakość — szybkość i inteligencja',
    fullDescription: 'Claude 3.7 Sonnet / Gemini 1.5 Pro — bezkompromisowa jakość wnioskowania, analiza złożonych problemów.',
    contextLabel: 'Kontekst: 2M tokenów',
    tags: ['ultra', 'flagship', 'code'],
    cost: 2,
    speed: 'powerful',
    icon: <Crown className="h-4 w-4" />,
    group: 'NEXTBYTE',
    metrics: [
      { label: 'Inteligencja', value: 10 },
      { label: 'Szybkość', value: 8 },
      { label: 'Kontekst', value: 10 },
      { label: 'Koszt', value: 9 },
    ],
    messageCost: 2,
    reasoningLevels: ['Niski', 'Średni', 'Głęboki'],
  },
  {
    id: 'lokalny',
    name: 'Lokalny',
    provider: 'NextByte',
    badge: 'LOCAL',
    description: 'Najpierw przetestuj połączenie',
    fullDescription: 'Lokalne środowisko AI (Ollama / LocalAI) uruchamiane na Twoim sprzęcie bez przesyłania danych do chmury.',
    contextLabel: 'Kontekst: 8K tokenów',
    tags: ['local', 'privacy', 'ollama'],
    needsSetup: true,
    speed: 'fast',
    icon: <Server className="h-4 w-4" />,
    group: 'NEXTBYTE',
    metrics: [
      { label: 'Inteligencja', value: 5 },
      { label: 'Szybkość', value: 9 },
      { label: 'Kontekst', value: 3 },
      { label: 'Koszt', value: 1 },
    ],
    messageCost: 0,
    reasoningLevels: ['Brak', 'Lokalny'],
  },
  {
    id: 'grok',
    name: 'Grok 4.3',
    provider: 'xAI',
    badge: 'XAI',
    description: 'xAI — agentic reasoning, 1M kontekst',
    fullDescription: 'Grok 4.3 od xAI — zaawansowany model z naciskiem na wnioskowanie agentowe i wiedzę w czasie rzeczywistym.',
    contextLabel: 'Kontekst: 1M tokenów',
    tags: ['grok', 'xai', 'realtime'],
    cost: 2,
    speed: 'powerful',
    icon: <Rocket className="h-4 w-4" />,
    group: 'INNE MODELE',
    metrics: [
      { label: 'Inteligencja', value: 9 },
      { label: 'Szybkość', value: 8 },
      { label: 'Kontekst', value: 9 },
      { label: 'Koszt', value: 7 },
    ],
    messageCost: 2,
    reasoningLevels: ['Niski', 'Średni', 'Wysoki'],
  },
  {
    id: 'gpt',
    name: 'GPT-5.4',
    provider: 'OpenAI',
    badge: 'OPENAI',
    description: 'OpenAI — uniwersalny model do zadań mieszanych',
    fullDescription: 'Flagowa linia modeli OpenAI z ulepszoną logiką, syntezą wielomodalną i szeroką wiedzą ogólną.',
    contextLabel: 'Kontekst: 128K tokenów',
    tags: ['openai', 'gpt5', 'multimodal'],
    cost: 2,
    speed: 'balanced',
    icon: <Sparkles className="h-4 w-4" />,
    group: 'INNE MODELE',
    metrics: [
      { label: 'Inteligencja', value: 9 },
      { label: 'Szybkość', value: 8 },
      { label: 'Kontekst', value: 8 },
      { label: 'Koszt', value: 8 },
    ],
    messageCost: 2,
    reasoningLevels: ['Niski', 'Średni', 'Wysoki'],
  },
  {
    id: 'opus',
    name: 'Claude Opus 5',
    provider: 'Anthropic',
    badge: 'ANTHROPIC',
    description: 'Anthropic — długie konteksty i praca z kodem',
    fullDescription: 'Model najwyższej próby od Anthropic — stworzony do długich dokumentów, dogłębnych analiz i pisania kodu.',
    contextLabel: 'Kontekst: 200K tokenów',
    tags: ['anthropic', 'claude', 'code'],
    cost: 3,
    speed: 'powerful',
    icon: <Crown className="h-4 w-4" />,
    group: 'INNE MODELE',
    metrics: [
      { label: 'Inteligencja', value: 10 },
      { label: 'Szybkość', value: 6 },
      { label: 'Kontekst', value: 9 },
      { label: 'Koszt', value: 10 },
    ],
    messageCost: 3,
    reasoningLevels: ['Średni', 'Maksymalny'],
  },
  {
    id: 'flux',
    name: 'FLUX 1.1 Pro',
    provider: 'Black Forest',
    badge: 'BLACK FOREST',
    description: 'Generowanie obrazów najwyższej jakości',
    fullDescription: 'Generatywny model grafik i ilustracji o najwyższym poziomie szczegółów i precyzyjnym rozumieniu tekstowych promptów.',
    contextLabel: 'Visual Prompt',
    tags: ['image-gen', 'flux', 'art'],
    cost: 2,
    speed: 'balanced',
    icon: <ImageIcon className="h-4 w-4" />,
    group: 'INNE MODELE',
    metrics: [
      { label: 'Inteligencja', value: 9 },
      { label: 'Szybkość', value: 7 },
      { label: 'Kontekst', value: 5 },
      { label: 'Koszt', value: 7 },
    ],
    messageCost: 2,
    reasoningLevels: ['Standard', 'Ultra'],
  },
  {
    id: 'llama',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    badge: 'META',
    description: 'Open source, lokalny i bez cenzury',
    fullDescription: 'Open source od Meta AI — wszechstronny, zbalansowany i wysoce wydajny model do lokalnych zastosowań.',
    contextLabel: 'Kontekst: 128K tokenów',
    tags: ['open-source', 'meta', 'llama'],
    cost: 1,
    speed: 'fast',
    icon: <Star className="h-4 w-4" />,
    group: 'INNE MODELE',
    metrics: [
      { label: 'Inteligencja', value: 8 },
      { label: 'Szybkość', value: 9 },
      { label: 'Kontekst', value: 8 },
      { label: 'Koszt', value: 3 },
    ],
    messageCost: 1,
    reasoningLevels: ['Standard'],
  },
]

function MetricBars({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-[8px] flex-1 rounded-[2px] transition-all duration-200',
            i < value ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]' : 'bg-foreground/[0.08]',
          )}
        />
      ))}
    </div>
  )
}

/** Mały wskaźnik 5-segmentowy (skala 0–10) — do szybkiego porównania modeli w liście. */
function MiniWskaznik({ etykieta, value }: { etykieta: string; value: number }) {
  const pelne = Math.round(value / 2)
  return (
    <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-foreground/70" title={`${etykieta}: ${pelne}/5`}>
      {etykieta}
      <span className="flex gap-[2px]" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={cn('h-[6px] w-[7px] rounded-[2px]', i < pelne ? 'bg-primary' : 'bg-foreground/[0.14]')} />
        ))}
      </span>
    </span>
  )
}

export interface GlassModelSearchProps {
  className?: string
  onSelect?: (model: Model) => void
  selectedId?: string
  models?: Model[]
  mode?: 'dropdown' | 'inline'
  placement?: 'top' | 'bottom'
  /** którą krawędzią wyzwalacza kotwiczyć popover (prawa — gdy pasek leży przy prawej krawędzi ekranu) */
  align?: 'left' | 'right'
  /** sama lista modeli — bez karty szczegółów, węższe okno, kanciastsze kształty */
  compact?: boolean
  /** karta szczegółów po lewej, lista modeli po prawej (panel przy prawej krawędzi ekranu) */
  odwroc?: boolean
  /** szerokość okna w px (domyślnie 700) — wąski wariant skraca też kartę szczegółów */
  szerokosc?: number
  /** mocniejsze szkło: półprzezroczyste tło z rozmyciem */
  szklo?: boolean
  /** przesunięcie okna w poziomie (px) względem przycisku — np. aby lista leżała równo z ramką kompozytora */
  przesuniecieX?: number
  defaultOpen?: boolean
}

export function GlassModelSearch({
  className,
  onSelect,
  selectedId = 'szybki',
  models = DEFAULT_MODELS,
  mode = 'dropdown',
  placement = 'top',
  align = 'left',
  compact = false,
  odwroc = false,
  szerokosc,
  szklo = false,
  przesuniecieX = 0,
  defaultOpen = false,
}: GlassModelSearchProps) {
  const { isGlass } = useGlass()
  const [open, setOpen] = useState(defaultOpen)
  const [query, setQuery] = useState('')
  const [activeModelId, setActiveModelId] = useState(selectedId)
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null)
  const [reasoningLevelsState, setReasoningLevelsState] = useState<Record<string, string>>({
    pro: 'Średni',
    ultra: 'Średni',
    grok: 'Średni',
    gpt: 'Średni',
  })

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveModelId(selectedId)
  }, [selectedId])

  useEffect(() => {
    if (mode !== 'dropdown') return

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mode])

  const selectedModel = models.find((m) => m.id === activeModelId) || models[0]
  const peekedModel = models.find((m) => m.id === (hoveredModelId || activeModelId)) || selectedModel

  const filtered = models.filter((m) =>
    !query || [m.name, m.provider, m.description, ...m.tags].some((s) =>
      s.toLowerCase().includes(query.toLowerCase()),
    ),
  )

  const groups: Array<{ label: 'NEXTBYTE' | 'INNE MODELE'; items: Model[] }> = [
    { label: 'NEXTBYTE', items: filtered.filter((m) => m.group === 'NEXTBYTE') },
    { label: 'INNE MODELE', items: filtered.filter((m) => m.group === 'INNE MODELE') },
  ]

  function handleModelClick(model: Model) {
    setActiveModelId(model.id)
    onSelect?.(model)
    if (mode === 'dropdown') {
      setOpen(false)
    }
  }

  const activeReasoningLevel = reasoningLevelsState[peekedModel.id] || peekedModel.reasoningLevels[0] || 'Średni'

  const szkloStyle: React.CSSProperties = {
    backgroundColor: 'hsl(var(--background) / 0.5)',
    backdropFilter: 'blur(26px) saturate(150%)',
    WebkitBackdropFilter: 'blur(26px) saturate(150%)',
    borderColor: 'hsl(var(--foreground) / 0.14)',
    boxShadow: 'inset 0 1px 0 0 hsl(0 0% 100% / 0.1), 0 18px 48px -16px rgba(0,0,0,0.6)',
  }

  // Karta szczegółów modelu (metryki, koszt, konfiguracja)
  const kartaSzczegolow = !compact ? (
<div className={cn('w-full shrink-0 rounded-xl border border-border/50 bg-foreground/[0.02] p-4 flex flex-col justify-between', szerokosc ? 'md:w-[236px]' : 'md:w-[320px]', odwroc && 'md:w-[236px]')} style={odwroc && szklo ? szkloStyle : undefined}>
        <div>
          {/* Nagłówek: nazwa + dostawca */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-base font-bold leading-none text-foreground">
              {peekedModel.name}
            </span>
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              {peekedModel.badge || peekedModel.provider}
            </span>
          </div>

          {/* Opis */}
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {peekedModel.fullDescription || peekedModel.description}
          </p>

          {/* Kontekst */}
          {peekedModel.contextLabel && (
            <p className="mt-1 text-[11px] font-mono text-muted-foreground/70">
              {peekedModel.contextLabel}
            </p>
          )}

          {/* Metryki 2x2 */}
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            {peekedModel.metrics.map((m) => (
              <div key={m.label}>
                <p className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {m.label}
                </p>
                <MetricBars value={m.value} />
              </div>
            ))}
          </div>

          {/* Box kosztu wiadomości */}
          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              KOSZT WIADOMOŚCI
            </span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {peekedModel.messageCost} Byte
            </span>
          </div>
        </div>

        {/* Konfiguracja — poziom rozumowania */}
        {peekedModel.reasoningLevels.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/40">
            <p className="mb-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              KONFIGURACJA
            </p>
            <p className="mb-2 text-xs font-medium text-foreground">
              Poziom rozumowania
            </p>
            <div className="flex gap-1 rounded-xl bg-muted/40 p-1">
              {peekedModel.reasoningLevels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() =>
                    setReasoningLevelsState((prev) => ({
                      ...prev,
                      [peekedModel.id]: lvl,
                    }))
                  }
                  className={cn(
                    'flex h-7 flex-1 items-center justify-center rounded-lg text-xs font-medium transition-all duration-150',
                    lvl === activeReasoningLevel
                      ? 'bg-primary/20 text-primary font-semibold shadow-xs border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
  ) : null

  const panel = (
    <div
      className={cn(
        'flex flex-col rounded-2xl border shadow-2xl transition-all duration-200 backdrop-blur-xl',
        odwroc ? 'gap-2 p-2' : 'gap-3 p-3 md:flex-row',
        isGlass
          ? 'nb-szklo nb-szklo-plynne border-border/60 bg-background/95 shadow-primary/10'
          : 'bg-card border-border/80 text-card-foreground',
        mode === 'dropdown' && (compact ? 'w-[372px] max-w-[95vw]' : odwroc ? 'w-full' : szerokosc ? 'w-full max-w-[95vw]' : 'w-full md:w-[700px] max-w-[95vw]'),
      )}
      style={{
        ...(compact ? { backgroundColor: 'hsl(var(--card) / 0.97)' } : null),
        ...(szklo ? szkloStyle : null),
        ...(!compact && szerokosc && !odwroc && mode === 'dropdown' ? { width: szerokosc } : null),
      }}
    >
      {/* LEWY PANEL — WYSZUKIWARKA I LISTA MODELI */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Szukajka */}
        <div className="relative mb-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj modelu AI..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border/50 rounded-xl placeholder:text-muted-foreground/60 text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Lista pogrupowana */}
        <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3">
          {groups.map((group) => {
            if (group.items.length === 0) return null
            return (
              <div key={group.label} className="space-y-1">
                <p className="px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                  {group.label}
                </p>

                {group.items.map((model) => {
                  const isActive = model.id === activeModelId
                  const isHovered = model.id === hoveredModelId

                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => handleModelClick(model)}
                      onMouseEnter={() => setHoveredModelId(model.id)}
                      onMouseLeave={() => setHoveredModelId(null)}
                      className={cn(
                        'group relative flex w-full items-center rounded-xl text-left transition-all duration-150 border',
                        compact ? 'gap-3 px-3 py-3' : 'gap-2.5 px-2.5 py-2',
                        isActive
                          ? 'border-primary/40 bg-primary/[0.08] shadow-[0_0_12px_-4px_hsl(var(--primary)/0.3)]'
                          : isHovered
                          ? 'border-border/60 bg-foreground/[0.04]'
                          : 'border-transparent hover:bg-foreground/[0.03]',
                      )}
                    >
                      {/* Pasek aktywnego wyboru */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                      )}

                      {/* Ikona */}
                      <span
                        className={cn(
                          'flex shrink-0 items-center justify-center rounded-lg transition-colors',
                          compact ? 'h-9 w-9' : 'h-7 w-7',
                          isActive
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted/50 text-muted-foreground group-hover:text-foreground',
                        )}
                      >
                        {model.icon}
                      </span>

                      {/* Nazwa + opis */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              compact ? 'text-[14px] font-semibold leading-tight' : 'truncate text-xs font-semibold leading-tight',
                              isActive ? 'text-primary' : 'text-foreground',
                            )}
                          >
                            {model.name}
                          </span>
                          {model.needsSetup && (
                            <span className="rounded bg-amber-400/15 px-1 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400">
                              SKONFIGURUJ
                            </span>
                          )}
                        </div>
                        {!odwroc && <p className={cn(compact ? 'mt-1 text-[12.5px] leading-snug text-foreground/65' : 'mt-0.5 truncate text-[11px] text-muted-foreground/80 leading-none')}>
                          {model.description}
                        </p>}
                        {compact && (
                          <div className="mt-2 grid grid-cols-2 items-center gap-x-3">
                            {['Jakość', 'Szybkość'].map((et) => {
                              const m = model.metrics.find((x) => x.label === et)
                              return m ? <MiniWskaznik key={et} etykieta={et} value={m.value} /> : null
                            })}
                          </div>
                        )}
                      </div>

                      {/* Koszt */}
                      {model.cost !== undefined && (
                        <span
                          className={cn(
                            compact ? 'shrink-0 self-start rounded-full px-2.5 py-1 font-mono text-[12px] font-semibold tabular-nums' : 'shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium tabular-nums',
                            isActive
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted/40 text-muted-foreground',
                          )}
                        >
                          ⟠ {model.cost}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Brak modeli pasujących do &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>

      {!compact && !odwroc && kartaSzczegolow}
    </div>
  )

  // `odwroc`: sama lista przy kompozytorze, a karta szczegółów wyjeżdża w lewo dopiero po najechaniu na model.
  // Karta jest rodzeństwem szklanego panelu, a nie jego dzieckiem — szkło przycina (contain: paint) wszystko, co wystaje.
  const popoverContent = odwroc ? (
    <div className="relative w-full">
      {panel}
      {hoveredModelId && <div className="absolute right-full top-0 mr-2">{kartaSzczegolow}</div>}
    </div>
  ) : (
    panel
  )

  if (mode === 'inline') {
    return <div className={cn('w-full', className)}>{popoverContent}</div>
  }

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      {/* Przycisk wyzwalający dropdown */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'group inline-flex items-center gap-2 border border-border bg-background/40 h-11 px-3 text-[14px] text-card-foreground transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-9 text-xs font-medium',
          compact ? 'rounded-lg !h-10 w-full justify-between border-primary/40 bg-primary/[0.12] font-semibold shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_6px_20px_-8px_hsl(var(--primary)/0.5)]' : odwroc ? 'min-w-[280px] rounded-xl' : 'rounded-full',
          open && 'border-primary/50 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]',
        )}
      >
        <span className="text-primary">{selectedModel.icon}</span>
        <span className="min-w-0 flex-1 truncate text-left">{selectedModel.name}</span>
        {selectedModel.cost !== undefined && (
          <span className="shrink-0 tabular-nums text-primary/80 font-mono">⟠ {selectedModel.cost}</span>
        )}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Popover */}
      {open && (
        <div
          className={cn(
            'absolute z-50 animate-in fade-in zoom-in-95 duration-150',
            odwroc ? 'inset-x-0' : align === 'right' ? 'right-0' : 'left-0',
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
          style={przesuniecieX ? { marginLeft: przesuniecieX } : undefined}
        >
          {popoverContent}
        </div>
      )}
    </div>
  )
}

