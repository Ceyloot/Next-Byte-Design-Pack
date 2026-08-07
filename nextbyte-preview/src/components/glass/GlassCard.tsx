import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'thin'
  radius?: string
  padding?: string
  interactive?: boolean
}

export function GlassCard({
  variant = 'default',
  radius = 'rounded-2xl',
  padding = 'p-5',
  interactive = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  const { isGlass } = useGlass()
  return (
    <div
      className={cn(
        isGlass
          ? cn('nb-szklo', variant === 'thin' && 'nb-szklo-plynne')
          : 'border border-border bg-card',
        radius,
        padding,
        interactive && 'cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
