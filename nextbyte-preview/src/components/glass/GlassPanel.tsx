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
        isGlass
          ? 'nb-szklo nb-szklo-plynne rounded-[1.75rem]'
          : 'border border-border bg-muted/30 rounded-[1.75rem]',
        'flex items-center gap-2 p-2',
        direction === 'col' && 'flex-col',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
