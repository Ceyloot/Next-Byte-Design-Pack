import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'default'
  dot?: boolean
}

const intentGlass = {
  neutral: 'border-foreground/20 text-foreground/80',
  primary: 'border-primary/40 text-primary',
  success: 'border-emerald-400/40 text-emerald-400',
  warning: 'border-amber-400/40 text-amber-400',
  danger:  'border-red-400/40 text-red-400',
}

const intentNormal = {
  neutral: 'border-border bg-muted text-foreground',
  primary: 'border-primary/40 bg-primary/10 text-primary',
  success: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-400',
  warning: 'border-amber-400/40 bg-amber-500/10 text-amber-400',
  danger:  'border-red-400/40 bg-red-500/10 text-red-400',
}

const dotMap = {
  neutral: 'bg-foreground/60',
  primary: 'bg-primary',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger:  'bg-red-400',
}

export function GlassBadge({
  intent = 'neutral',
  size = 'default',
  dot = false,
  className,
  children,
  ...props
}: GlassBadgeProps) {
  const { isGlass } = useGlass()
  return (
    <span
      className={cn(
        isGlass ? 'nb-szklo' : intentNormal[intent],
        isGlass && intentGlass[intent],
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotMap[intent])} />}
      {children}
    </span>
  )
}
