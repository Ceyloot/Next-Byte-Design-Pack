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
  radius = 'rounded-nb',
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
        /* Soczewka na krawędzi. Zasięg steruje klasa na <html>:
           .nb-refrakcja-chrome  → tylko nav/panel/modal
           .nb-refrakcja-wszedzie → również karty i mniejsze elementy */
        isGlass
          ? 'nb-szklo nb-szklo-plynne'
          : cn('nb-tafla', interactive && 'nb-tafla-int'),
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
