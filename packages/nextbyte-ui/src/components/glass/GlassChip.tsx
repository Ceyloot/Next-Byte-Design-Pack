import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'
import { X } from 'lucide-react'

export type ChipColor = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan'

interface GlassChipProps {
  color?:     ChipColor
  size?:      'sm' | 'default'
  onRemove?:  () => void
  active?:    boolean
  className?: string
  children:   React.ReactNode
  onClick?:   () => void
}

const colorMap: Record<ChipColor, { glass: string; normal: string }> = {
  default: {
    glass:  'border-foreground/20 bg-foreground/6 text-foreground/80',
    normal: 'border-border bg-muted/50 text-foreground/80',
  },
  primary: {
    glass:  'border-primary/35 bg-primary/10 text-primary',
    normal: 'border-primary/40 bg-primary/8 text-primary',
  },
  success: {
    glass:  'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    normal: 'border-emerald-500/35 bg-emerald-500/8 text-emerald-400',
  },
  warning: {
    glass:  'border-amber-400/35 bg-amber-400/10 text-amber-400',
    normal: 'border-amber-400/40 bg-amber-400/8 text-amber-400',
  },
  danger: {
    glass:  'border-destructive/30 bg-destructive/10 text-destructive',
    normal: 'border-destructive/35 bg-destructive/8 text-destructive',
  },
  purple: {
    glass:  'border-violet-500/30 bg-violet-500/10 text-violet-400',
    normal: 'border-violet-500/35 bg-violet-500/8 text-violet-400',
  },
  cyan: {
    glass:  'border-cyan-400/30 bg-cyan-400/10 text-cyan-400',
    normal: 'border-cyan-400/35 bg-cyan-400/8 text-cyan-400',
  },
}

export function GlassChip({
  color     = 'default',
  size      = 'default',
  onRemove,
  active,
  className,
  children,
  onClick,
}: GlassChipProps) {
  const { isGlass } = useGlass()
  const cfg = colorMap[color]

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium select-none',
        size === 'sm' ? 'h-6 px-2.5 text-[11px]' : 'h-7 px-3 text-xs',
        isGlass ? cn('nb-szklo', cfg.glass) : cfg.normal,
        active && 'ring-2 ring-primary/40',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="ml-0.5 rounded-full p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Usuń"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}
