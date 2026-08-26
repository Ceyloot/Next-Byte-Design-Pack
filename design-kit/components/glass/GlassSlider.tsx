import React from 'react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

export interface GlassSliderProps {
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  onChange?: (value: number[]) => void
  formatValue?: (v: number) => string
  showValue?: boolean
  disabled?: boolean
  color?: string
  className?: string
}

export function GlassSlider({
  value,
  defaultValue = [0],
  min = 0,
  max = 100,
  step = 1,
  onChange,
  formatValue,
  showValue,
  disabled,
  color = 'hsl(var(--primary))',
  className,
}: GlassSliderProps) {
  const { isGlass } = useGlass()
  const [internal, setInternal] = React.useState<number[]>(value ?? defaultValue)
  const current = value ?? internal
  const isRange = current.length > 1

  function clamp(v: number) {
    return Math.min(max, Math.max(min, Math.round(v / step) * step))
  }
  function pct(v: number) {
    return ((v - min) / (max - min)) * 100
  }

  function handleChange(idx: number, raw: number) {
    const next = [...current]
    next[idx] = clamp(raw)
    if (isRange) {
      if (idx === 0 && next[0] > next[1]) next[0] = next[1]
      if (idx === 1 && next[1] < next[0]) next[1] = next[0]
    }
    setInternal(next)
    onChange?.(next)
  }

  function onInputChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    handleChange(idx, Number(e.target.value))
  }

  const lo = isRange ? pct(current[0]) : 0
  const hi = pct(current[isRange ? 1 : 0])

  const fmt = (v: number) => formatValue ? formatValue(v) : String(v)

  return (
    <div className={cn('w-full flex flex-col gap-2', disabled && 'opacity-50', className)}>
      <div className="relative flex items-center h-5">
        {/* Track bg */}
        <div className={cn(
          'absolute inset-y-0 my-auto h-1.5 w-full rounded-full',
          isGlass ? 'nb-szklo' : 'bg-muted/60',
        )} />
        {/* Active range fill */}
        <div
          className="absolute inset-y-0 my-auto h-1.5 rounded-full pointer-events-none transition-all duration-100"
          style={{
            left: `${lo}%`,
            width: `${hi - lo}%`,
            background: color,
            boxShadow: isGlass ? `0 0 6px 1px ${color}60` : undefined,
          }}
        />
        {/* Thumb(s) */}
        {current.map((v, i) => (
          <input
            key={i}
            type="range"
            min={min}
            max={max}
            step={step}
            value={v}
            disabled={disabled}
            onChange={(e) => onInputChange(i, e)}
            className={cn(
              'absolute w-full appearance-none bg-transparent cursor-pointer',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary',
              '[&::-webkit-slider-thumb]:bg-background',
              '[&::-webkit-slider-thumb]:shadow-sm',
              '[&::-webkit-slider-thumb]:transition-transform',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              isGlass && '[&::-webkit-slider-thumb]:shadow-[0_0_8px_2px_hsl(var(--primary)/0.4)]',
              '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary',
              '[&::-moz-range-thumb]:bg-background',
            )}
            style={{ zIndex: i === 0 && isRange ? 1 : 2 }}
          />
        ))}
      </div>
      {showValue && (
        <div className="flex justify-between text-[11px] text-foreground/50 font-mono tabular-nums">
          <span>{fmt(current[0])}</span>
          {isRange && <span>{fmt(current[1])}</span>}
        </div>
      )}
    </div>
  )
}
