import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

interface GlassNavProps extends React.HTMLAttributes<HTMLElement> {
  position?: 'top' | 'free'
}

export function GlassNav({
  position = 'top',
  className,
  children,
  ...props
}: GlassNavProps) {
  const { isGlass } = useGlass()
  return (
    <nav
      className={cn(
        isGlass ? 'nb-szklo nb-szklo-plynne' : 'border border-border bg-card',
        'flex items-center gap-3 rounded-[1.75rem] border px-4 py-2',
        position === 'top' && 'sticky top-4 z-50',
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  )
}

interface GlassNavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function GlassNavItem({ active = false, className, children, ...props }: GlassNavItemProps) {
  return (
    <button
      className={cn(
        'relative flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors duration-150',
        active
          ? 'text-foreground'
          : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function GlassNavBrand({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center gap-2 text-sm font-semibold text-foreground mr-2', className)} {...props}>
      {children}
    </div>
  )
}

export function GlassNavSpacer() {
  return <span className="flex-1" />
}
