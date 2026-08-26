import React from 'react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

export interface GlassToggleProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  label?: React.ReactNode
  description?: string
  className?: string
}

const SIZE = {
  sm: { track: 'h-4 w-7',   thumb: 'h-3 w-3',   translate: 'translate-x-3',  label: 'text-xs' },
  md: { track: 'h-5 w-9',   thumb: 'h-4 w-4',   translate: 'translate-x-4',  label: 'text-sm' },
  lg: { track: 'h-6 w-11',  thumb: 'h-5 w-5',   translate: 'translate-x-5',  label: 'text-sm' },
}

export function GlassToggle({
  checked,
  defaultChecked = false,
  onChange,
  size = 'md',
  disabled,
  label,
  description,
  className,
}: GlassToggleProps) {
  const { isGlass } = useGlass()
  const [internal, setInternal] = React.useState(defaultChecked)
  const isOn = checked !== undefined ? checked : internal
  const s = SIZE[size]

  function toggle() {
    if (disabled) return
    const next = !isOn
    setInternal(next)
    onChange?.(next)
  }

  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <button
        role="switch"
        type="button"
        aria-checked={isOn}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          'relative shrink-0 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          s.track,
          isOn
            ? isGlass
              ? 'bg-primary/70 shadow-[0_0_8px_2px_hsl(var(--primary)/0.35)]'
              : 'bg-primary'
            : isGlass
              ? 'nb-szklo'
              : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full shadow-sm transition-all duration-200',
            s.thumb,
            isOn
              ? cn('translate-x-full', s.translate, 'bg-white')
              : isGlass
                ? 'bg-foreground/60'
                : 'bg-foreground/40',
          )}
          style={isOn && isGlass ? { boxShadow: '0 0 6px 1px hsl(var(--primary)/0.5)' } : undefined}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className={cn('font-medium text-foreground leading-tight', s.label)}>{label}</span>}
          {description && <span className="text-xs text-foreground/50 mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  )
}
