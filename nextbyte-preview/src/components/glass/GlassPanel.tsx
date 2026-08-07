import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col'
}

export function GlassPanel({
  direction = 'row',
  className,
  children,
  ...props
}: GlassPanelProps) {
  const { isGlass } = useGlass()
  return (
    <div
      className={cn(
        isGlass ? 'nb-szklo nb-szklo-plynne' : 'border border-border bg-muted/30',
        'flex items-center gap-2 rounded-[1.75rem] border p-2',
        direction === 'col' && 'flex-col',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
