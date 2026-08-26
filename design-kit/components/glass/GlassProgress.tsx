import React from 'react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

export interface GlassProgressProps {
  value: number                        // 0–100
  label?: string
  valueLabel?: React.ReactNode
  color?: string
  size?: 'sm' | 'default'
  showMarker?: boolean
  className?: string
}

export function GlassProgress({
  value,
  label,
  valueLabel,
  color = 'hsl(var(--primary))',
  size = 'default',
  showMarker = false,
  className,
}: GlassProgressProps) {
  const { isGlass } = useGlass()
  const pct = Math.min(100, Math.max(0, value))
  const h   = size === 'sm' ? 'h-1' : 'h-1.5'

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between gap-2">
          {label     && <span className="text-sm font-medium text-foreground/80">{label}</span>}
          {valueLabel && <span className="text-xs text-foreground/50 text-right">{valueLabel}</span>}
        </div>
      )}
      <div className="relative">
        {/* Track */}
        <div className={cn(
          h, 'w-full rounded-full',
          isGlass ? 'bg-foreground/8' : 'bg-muted/50',
        )} />
        {/* Fill */}
        <div
          className={cn(h, 'absolute inset-y-0 left-0 rounded-full')}
          style={{
            width: `${pct}%`,
            background: color,
            transition: 'width 0.7s cubic-bezier(.4,0,.2,1)',
            boxShadow: isGlass && pct > 0 ? `0 0 8px ${color}` : undefined,
          }}
        />
        {/* Limit marker */}
        {showMarker && (
          <div
            className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-foreground/25 rounded-full"
            style={{ left: `${pct}%` }}
          />
        )}
      </div>
    </div>
  )
}
