import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  size?: 'sm' | 'default' | 'lg'
}

const sizeMap = {
  sm:      'h-8  px-3 text-xs',
  default: 'h-10 px-4 text-sm',
  lg:      'h-12 px-5 text-base',
}

export function GlassInput({
  iconLeft,
  iconRight,
  size = 'default',
  className,
  ...props
}: GlassInputProps) {
  const { isGlass } = useGlass()
  const hasLeft  = !!iconLeft
  const hasRight = !!iconRight

  return (
    <div className="relative flex items-center w-full">
      {hasLeft && (
        <span className="pointer-events-none absolute left-3 flex items-center text-foreground/50">
          {iconLeft}
        </span>
      )}
      <input
        className={cn(
          isGlass
            ? 'nb-szklo nb-szklo-plynne bg-transparent'
            : 'border border-border bg-input',
          'w-full rounded-xl outline-none',
          'text-foreground placeholder:text-foreground/40',
          'transition-[border-color,box-shadow] duration-200',
          'focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
          sizeMap[size],
          hasLeft  && 'pl-9',
          hasRight && 'pr-9',
          className,
        )}
        {...props}
      />
      {hasRight && (
        <span className="absolute right-3 flex items-center text-foreground/50">
          {iconRight}
        </span>
      )}
    </div>
  )
}
