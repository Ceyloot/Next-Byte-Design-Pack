import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'
import { GlassBadge } from './GlassBadge'

/* Wiersz cechy — ikona + etykieta + opis + odznaka po prawej.
   Jeden wygląd dla list funkcji w kartach planów/produktów (Cennik i wszędzie
   indziej, gdzie trzeba wyliczyć co zawiera dana opcja). */
interface GlassFeatureRowProps {
  icon?: React.ComponentType<{ className?: string }>
  label: React.ReactNode
  desc?: React.ReactNode
  badge?: React.ReactNode
  highlight?: boolean
  className?: string
}

export function GlassFeatureRow({
  icon: Icon,
  label,
  desc,
  badge,
  highlight = false,
  className,
}: GlassFeatureRowProps) {
  const { isGlass } = useGlass()
  const RowIcon = Icon || Check
  return (
    <div className={cn(
      'flex items-start gap-3 py-2 px-2 rounded-xl border-b last:border-0 transition-colors duration-150',
      isGlass ? 'border-foreground/[0.06]' : 'border-border/60',
      highlight ? 'bg-primary/[0.06]' : (isGlass ? 'hover:bg-foreground/[0.03]' : 'hover:bg-muted/40'),
      className,
    )}>
      <span className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-lg mt-0.5',
        highlight ? 'bg-primary/20 text-primary' : 'nb-wglobienie-gnizado text-foreground/70',
      )}>
        <RowIcon className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className={cn('text-xs font-semibold leading-snug', highlight ? 'text-foreground' : 'text-foreground/90')}>
          {label}
        </div>
        {desc && <div className="text-[11px] text-foreground/50 mt-0.5 leading-snug">{desc}</div>}
      </div>
      {badge && (
        typeof badge === 'string'
          ? <GlassBadge intent={highlight ? 'primary' : 'neutral'} size="sm" className="shrink-0 self-center uppercase tracking-wider">{badge}</GlassBadge>
          : <span className="shrink-0 self-center">{badge}</span>
      )}
    </div>
  )
}
