import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

export interface GlassLineChartPoint {
  label: string
  value: number
}

export interface GlassLineSeries {
  points: GlassLineChartPoint[]
  color?: string
  label?: string
  showArea?: boolean
}

export interface GlassLineChartProps {
  series: GlassLineSeries[]
  height?: number
  caption?: string
  showGrid?: boolean
  showDots?: boolean
  showXLabels?: boolean
  showYLabels?: boolean
  className?: string
}

export function GlassLineChart({
  series,
  height = 180,
  caption,
  showGrid = true,
  showDots = true,
  showXLabels = true,
  showYLabels = false,
  className,
}: GlassLineChartProps) {
  const { isGlass } = useGlass()

  const W = 600
  const H = height
  const padL = showYLabels ? 40 : 16
  const padR = 16
  const padT = 16
  const padB = showXLabels ? 28 : 8

  const allValues = series.flatMap((s) => s.points.map((p) => p.value))
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const range = maxVal - minVal || 1

  const maxPoints = Math.max(...series.map((s) => s.points.length))

  function toX(i: number) {
    return padL + (i / Math.max(maxPoints - 1, 1)) * (W - padL - padR)
  }
  function toY(v: number) {
    return padT + (1 - (v - minVal) / range) * (H - padT - padB)
  }

  const GRID_LINES = 4

  return (
    <div className={cn('w-full flex flex-col gap-2', className)}>
      {caption && (
        <p className="text-xs font-semibold text-foreground/55">{caption}</p>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        fill="none"
        className="overflow-visible"
      >
        <defs>
          {series.map((s, si) => {
            const color = s.color ?? 'hsl(var(--primary))'
            return (
              <linearGradient key={`grad-${si}`} id={`glc-area-${si}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color} stopOpacity={isGlass ? 0.30 : 0.20} />
                <stop offset="100%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            )
          })}
        </defs>

        {/* Horizontal grid lines */}
        {showGrid && Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
          const y = padT + (i / GRID_LINES) * (H - padT - padB)
          return (
            <line
              key={i}
              x1={padL} y1={y} x2={W - padR} y2={y}
              stroke="currentColor"
              strokeOpacity={0.07}
              strokeWidth={1}
            />
          )
        })}

        {/* Y labels */}
        {showYLabels && Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
          const y = padT + (i / GRID_LINES) * (H - padT - padB)
          const val = maxVal - (i / GRID_LINES) * range
          return (
            <text
              key={i}
              x={padL - 6}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="currentColor"
              fillOpacity={0.4}
              style={{ fontSize: 10, fontFamily: 'inherit' }}
            >
              {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : Math.round(val)}
            </text>
          )
        })}

        {/* Series */}
        {series.map((s, si) => {
          const color = s.color ?? 'hsl(var(--primary))'
          const pts = s.points.map((p, i) => ({ x: toX(i), y: toY(p.value) }))
          const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
          const last = pts[pts.length - 1]
          const first = pts[0]

          const area = s.showArea !== false && [
            `M ${first.x.toFixed(1)},${(H - padB).toFixed(1)}`,
            ...pts.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
            `L ${last.x.toFixed(1)},${(H - padB).toFixed(1)} Z`,
          ].join(' ')

          return (
            <g key={si}>
              {area && (
                <path d={area} fill={`url(#glc-area-${si})`} />
              )}
              <polyline
                points={polyline}
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Glow in glass mode */}
              {isGlass && (
                <polyline
                  points={polyline}
                  stroke={color}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={0.12}
                  style={{ filter: 'blur(4px)' }}
                />
              )}
              {/* Dots */}
              {showDots && pts.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={3.5} fill={color} />
                  {isGlass && (
                    <circle cx={p.x} cy={p.y} r={7} fill={color} fillOpacity={0.15} />
                  )}
                </g>
              ))}
              {/* Last dot accent */}
              {showDots && (
                <circle cx={last.x} cy={last.y} r={5} fill={color} />
              )}
            </g>
          )
        })}

        {/* X labels */}
        {showXLabels && (() => {
          const labels = series[0]?.points ?? []
          const step = Math.ceil(labels.length / 8)
          return labels.map((p, i) => {
            if (i % step !== 0 && i !== labels.length - 1) return null
            return (
              <text
                key={i}
                x={toX(i)}
                y={H - padB + 14}
                textAnchor="middle"
                fill="currentColor"
                fillOpacity={0.4}
                style={{ fontSize: 10, fontFamily: 'inherit' }}
              >
                {p.label}
              </text>
            )
          })
        })()}
      </svg>

      {/* Legend */}
      {series.some((s) => s.label) && (
        <div className="flex flex-wrap gap-3 px-1">
          {series.filter((s) => s.label).map((s, si) => (
            <div key={si} className="flex items-center gap-1.5">
              <span
                className="h-2 w-5 rounded-full"
                style={{ background: s.color ?? 'hsl(var(--primary))' }}
              />
              <span className="text-[11px] text-foreground/55">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
