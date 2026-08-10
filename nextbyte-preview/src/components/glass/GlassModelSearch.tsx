import React, { useState } from 'react'
import { Sparkles, ArrowRight, Star, Zap, Brain, Image } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from './GlassCard'
import { GlassSearch } from './GlassSearch'
import { GlassBadge } from './GlassBadge'
import { GlassButton } from './GlassButton'

interface Model {
  id: string
  name: string
  provider: string
  description: string
  tags: string[]
  speed: 'fast' | 'balanced' | 'powerful'
  icon: React.ReactNode
}

const MODELS: Model[] = [
  { id: 'gpt4o',   name: 'GPT-4o',         provider: 'OpenAI',    description: 'Multimodalny model najwyższej klasy',           tags: ['vision', 'code', 'reasoning'], speed: 'balanced', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'claude4', name: 'Claude Sonnet 4', provider: 'Anthropic', description: 'Doskonały w analizie i długich kontekstach',    tags: ['long-ctx', 'analysis', 'code'], speed: 'balanced', icon: <Brain className="h-4 w-4" /> },
  { id: 'gemini',  name: 'Gemini 2.0 Flash',provider: 'Google',    description: 'Błyskawiczny model do codziennych zadań',       tags: ['fast', 'multimodal'],           speed: 'fast',     icon: <Zap className="h-4 w-4" /> },
  { id: 'grok',    name: 'Grok 3',          provider: 'xAI',       description: 'Silny w matematyce i kodowaniu',                tags: ['math', 'code'],                 speed: 'powerful', icon: <Star className="h-4 w-4" /> },
  { id: 'flux',    name: 'FLUX 1.1 Pro',    provider: 'Black Forest', description: 'Generowanie obrazów najwyższej jakości',     tags: ['image-gen'],                    speed: 'balanced', icon: <Image className="h-4 w-4" /> },
  { id: 'llama',   name: 'Llama 3.3 70B',  provider: 'Meta',      description: 'Open source, lokalny, bez cenzury',             tags: ['open-source', 'local'],         speed: 'fast',     icon: <Sparkles className="h-4 w-4" /> },
]

const speedLabel: Record<Model['speed'], string> = {
  fast:     'Szybki',
  balanced: 'Zbalansowany',
  powerful: 'Mocny',
}

const speedIntent: Record<Model['speed'], 'success' | 'primary' | 'warning'> = {
  fast:     'success',
  balanced: 'primary',
  powerful: 'warning',
}

interface GlassModelSearchProps {
  className?: string
  onSelect?: (model: Model) => void
}

/** Gotowy przykład użycia biblioteki Glass — wybór modelu AI */
export function GlassModelSearch({ className, onSelect }: GlassModelSearchProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = MODELS.filter((m) =>
    !query || [m.name, m.provider, m.description, ...m.tags].some((s) =>
      s.toLowerCase().includes(query.toLowerCase()),
    ),
  )

  function handleSelect(model: Model) {
    setSelected(model.id)
    onSelect?.(model)
  }

  return (
    <div className={cn('w-full space-y-3', className)}>
      <GlassSearch
        placeholder="Szukaj modelu AI..."
        value={query}
        onChange={setQuery}
        size="lg"
        className="w-full"
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((model) => (
          <GlassCard
            key={model.id}
            interactive
            padding="p-4"
            onClick={() => handleSelect(model)}
            className={cn(
              'flex flex-col gap-2 cursor-pointer transition-all',
              selected === model.id && 'ring-2 ring-primary/60 border-primary/40',
            )}
          >
            {/* Nagłówek */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-nb-sm nb-szklo text-primary">
                  {model.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{model.name}</p>
                  <p className="text-[11px] text-foreground/50">{model.provider}</p>
                </div>
              </div>
              <GlassBadge intent={speedIntent[model.speed]} size="sm">
                {speedLabel[model.speed]}
              </GlassBadge>
            </div>

            {/* Opis */}
            <p className="text-xs text-foreground/60 leading-relaxed">{model.description}</p>

            {/* Tagi */}
            <div className="flex flex-wrap gap-1">
              {model.tags.map((tag) => (
                <GlassBadge key={tag} size="sm">{tag}</GlassBadge>
              ))}
            </div>

            {/* CTA */}
            {selected === model.id && (
              <div className="flex items-center gap-1 text-xs font-medium text-primary mt-1">
                <span>Wybrano</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            )}
          </GlassCard>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-foreground/40">
            Brak modeli pasujących do &ldquo;{query}&rdquo;
          </div>
        )}
      </div>

      {selected && (
        <div className="flex justify-end">
          <GlassButton size="lg">
            Użyj {MODELS.find((m) => m.id === selected)?.name}
            <ArrowRight className="h-4 w-4" />
          </GlassButton>
        </div>
      )}
    </div>
  )
}
