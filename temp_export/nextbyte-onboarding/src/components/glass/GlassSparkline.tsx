import React from 'react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

export interface GlassSparklineProps {
  data: number[]
  /** 'line' — krzywa, 'bar' — mini słupki. */
  variant?: 'line' | 'bar'
  color?: string
  width?: number
  height?: number
  showArea?: boolean
  /** Kropka na ostatnim punkcie — sygnalizuje stan bieżący. */
  showLastDot?: boolean
  /** Kolor sam wynika ze znaku trendu (zielony w górę, czerwony w dół). */
  autoTrendColor?: boolean
  className?: string
}

const UP = 'hsl(160 60% 45%)'
const DOWN = 'hsl(0 72% 58%)'

export function GlassSparkline({
  data,
  variant = 'line',
  color,
  width = 90,
  height = 28,
  showArea = true,
  showLastDot = true,
  autoTrendColor = false,
  className,
}: GlassSparklineProps) {
  const { isGlass } = useGlass()

  if (data.length === 0) return null

  const trendUp = data[data.length - 1] >= data[0]
  const stroke = color ?? (autoTrendColor ? (trendUp ? UP : DOWN) : 'hsl(var(--primary))')

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const padY = 3
  const toX = (i: number) => (i / Math.max(data.length - 1, 1)) * width
  const toY = (v: number) => padY + (1 - (v - min) / range) * (height - padY * 2)

  const pts = data.map((v, i) => ({ x: toX(i), y: toY(v) }))
  const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]

  const area = [
    `M ${pts[0].x.toFixed(1)},${height}`,
    ...pts.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `L ${last.x.toFixed(1)},${height} Z`,
  ].join(' ')

  const gradId = React.useId()

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fill="none"
      className={cn('shrink-0 overflow-visible', className)}
      aria-hidden="true"
    >
      {variant === 'bar' ? (
        data.map((v, i) => {
          const barW = Math.max(width / data.length - 1.5, 1)
          const h = Math.max(((v - min) / range) * (height - padY * 2) + 2, 2)
          return (
            <rect
              key={i}
              x={(i / data.length) * width}
              y={height - h}
              width={barW}
              height={h}
              rx={1}
              fill={stroke}
              fillOpacity={i === data.length - 1 ? 0.95 : isGlass ? 0.45 : 0.35}
            />
          )
        })
      ) : (
        <>
          {showArea && (
            <>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={isGlass ? 0.35 : 0.22} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <path d={area} fill={`url(#${gradId})`} />
            </>
          )}
          {isGlass && (
            <polyline
              points={polyline}
              stroke={stroke}
              strokeWidth={4}
              strokeOpacity={0.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'blur(3px)' }}
            />
          )}
          <polyline
            points={polyline}
            stroke={stroke}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {showLastDot && (
            <>
              <circle cx={last.x} cy={last.y} r={2.25} fill={stroke} />
              {isGlass && <circle cx={last.x} cy={last.y} r={5} fill={stroke} fillOpacity={0.2} />}
            </>
          )}
        </>
      )}
    </svg>
  )
}
