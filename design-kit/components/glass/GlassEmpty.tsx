import React from 'react'
import { Inbox, SearchX, Database, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

export type EmptyVariant = 'ogolny' | 'brak-wynikow' | 'brak-danych' | 'blad'

const PRESET: Record<EmptyVariant, {
  icon: React.ReactNode
  title: string
  desc: string
  tone: string
}> = {
  'ogolny': {
    icon: <Inbox className="h-6 w-6" />,
    title: 'Nic tu jeszcze nie ma',
    desc:  'Gdy pojawią się pierwsze elementy, zobaczysz je w tym miejscu.',
    tone:  'text-foreground/50',
  },
  'brak-wynikow': {
    icon: <SearchX className="h-6 w-6" />,
    title: 'Brak wyników',
    desc:  'Nic nie pasuje do tego zapytania. Spróbuj innych słów lub wyczyść filtry.',
    tone:  'text-foreground/50',
  },
  'brak-danych': {
    icon: <Database className="h-6 w-6" />,
    title: 'Brak danych',
    desc:  'Dla wybranego zakresu nie ma jeszcze żadnych rekordów.',
    tone:  'text-foreground/50',
  },
  'blad': {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: 'Nie udało się wczytać',
    desc:  'Coś poszło nie tak po naszej stronie. Spróbuj ponownie za chwilę.',
    tone:  'text-destructive/70',
  },
}

interface GlassEmptyProps {
  variant?:  EmptyVariant
  icon?:     React.ReactNode
  title?:    string
  desc?:     string
  action?:   React.ReactNode
  compact?:  boolean
  bordered?: boolean
  className?: string
}

export function GlassEmpty({
  variant = 'ogolny',
  icon,
  title,
  desc,
  action,
  compact  = false,
  bordered = true,
  className,
}: GlassEmptyProps) {
  const { isGlass } = useGlass()
  const cfg = PRESET[variant]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-5 py-8' : 'gap-3 px-6 py-14',
        bordered && (isGlass
          ? 'nb-szklo rounded-2xl'
          : 'rounded-2xl border border-dashed border-border bg-card/40'),
        className,
      )}
    >
      {/* Ikona w okrągłym gnieździe */}
      <span
        className={cn(
          'flex items-center justify-center rounded-full',
          compact ? 'h-10 w-10' : 'h-14 w-14',
          isGlass
            ? 'border border-foreground/10 bg-foreground/[0.06]'
            : 'border border-border bg-muted/50',
          cfg.tone,
        )}
      >
        {icon ?? cfg.icon}
      </span>

      <div className="space-y-1">
        <p className={cn('font-semibold text-foreground', compact ? 'text-sm' : 'text-base')}>
          {title ?? cfg.title}
        </p>
        <p className={cn('mx-auto max-w-sm text-foreground/55', compact ? 'text-xs' : 'text-xs leading-relaxed')}>
          {desc ?? cfg.desc}
        </p>
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
