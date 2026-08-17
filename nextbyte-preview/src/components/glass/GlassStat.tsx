import React from 'react'
import { cn } from '@/lib/utils'
import { GlassCard } from './GlassCard'
import { GlassBadge } from './GlassBadge'

interface GlassStatProps {
  label: string
  value: React.ReactNode
  delta?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  subtext?: string
  className?: string
}

export function GlassStat({
  label,
  value,
  delta,
  trend = 'neutral',
  icon,
  subtext,
  className,
}: GlassStatProps) {
  const trendIntent = trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'neutral'

  return (
    <GlassCard className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-foreground/60">{label}</span>
        {icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl nb-wglobienie-gnizado text-foreground/70">
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="nb-liczby text-2xl font-semibold leading-none text-primary">{value}</span>
        {delta && (
          <GlassBadge intent={trendIntent} size="sm" dot>
            {delta}
          </GlassBadge>
        )}
      </div>
      {subtext && (
        <p className="text-[11px] text-foreground/45">{subtext}</p>
      )}
    </GlassCard>
  )
}
