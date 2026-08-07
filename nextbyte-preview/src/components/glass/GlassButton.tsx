import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'default' | 'lg' | 'icon'
  variant?: 'solid' | 'ghost'
}

const sizeMap = {
  sm:      'h-8  px-3   text-xs  gap-1.5',
  default: 'h-10 px-4   text-sm  gap-2',
  lg:      'h-12 px-6   text-base gap-2',
  icon:    'h-10 w-10   text-sm',
}

const normalMap = {
  solid: 'border border-border/50 bg-muted/20 text-foreground hover:bg-muted/40 hover:border-border/70',
  ghost: 'text-foreground/70 hover:bg-muted/40 hover:text-foreground',
}

export function GlassButton({
  size = 'default',
  variant = 'solid',
  className,
  children,
  disabled,
  ...props
}: GlassButtonProps) {
  const { isGlass } = useGlass()
  return (
    <button
      disabled={disabled}
      className={cn(
        isGlass ? cn('nb-szklo', variant === 'ghost' && 'nb-szklo-plynne') : normalMap[variant],
        'inline-flex items-center justify-center rounded-xl font-medium',
        'select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'disabled:pointer-events-none disabled:opacity-50',
        'transition-all duration-200',
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
