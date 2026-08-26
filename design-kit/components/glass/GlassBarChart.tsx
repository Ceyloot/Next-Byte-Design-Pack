import React from 'react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

export interface GlassBarDatum {
  label: string
  /** Pojedyncza wartość, albo tablica wartości dla wariantu grouped/stacked. */
  values: number | number[]
}

export interface GlassBarChartProps {
  data: GlassBarDatum[]
  /** Kolory serii — indeks odpowiada indeksowi w `values`. */
  colors?: string[]
  /** Nazwy serii do legendy. */
  seriesLabels?: string[]
  orientation?: 'vertical' | 'horizontal'
  /** 'grouped' — słupki obok siebie, 'stacked' — jeden na drugim. */
  mode?: 'grouped' | 'stacked'
  height?: number
  showGrid?: boolean
  showValues?: boolean
  showAxisLabels?: boolean
  caption?: string
  className?: string
}

const DEFAULT_COLORS = ['hsl(var(--primary))', 'hsl(160 60% 45%)', 'hsl(38 92% 50%)', 'hsl(270 70% 60%)']

export function GlassBarChart({
  data,
  colors = DEFAULT_COLORS,
  seriesLabels,
  orientation = 'vertical',
  mode = 'grouped',
  height = 200,
  showGrid = true,
  showValues = false,
  showAxisLabels = true,
  caption,
  className,
}: GlassBarChartProps) {
  const { isGlass } = useGlass()

  // Normalizacja: każdy punkt staje się tablicą, żeby jedna ścieżka
  // renderowania obsłużyła single / grouped / stacked.
  const rows = data.map((d) => (Array.isArray(d.values) ? d.values : [d.values]))
  const seriesCount = Math.max(...rows.map((r) => r.length))

  const maxVal = mode === 'stacked'
    ? Math.max(...rows.map((r) => r.reduce((a, b) => a + b, 0)))
    : Math.max(...rows.flat())
  const scaleMax = maxVal || 1

  const isVertical = orientation === 'vertical'
  const W = 600
  const H = height
  const padL = isVertical ? 40 : 90
  const padR = 16
  const padT = 12
  const padB = showAxisLabels ? 28 : 10

  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const GRID_LINES = 4

  // Szerokość slotu na jedną kategorię + odstęp między kategoriami.
  const slot = (isVertical ? plotW : plotH) / data.length
  const bandPad = slot * 0.22
  const band = slot - bandPad
  const barSize = mode === 'stacked' ? band : band / seriesCount

  function valueToLen(v: number) {
    return (v / scaleMax) * (isVertical ? plotH : plotW)
  }

  return (
    <div className={cn('w-full flex flex-col gap-2', className)}>
      {caption && <p className="text-xs font-semibold text-foreground/55">{caption}</p>}

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} fill="none" className="overflow-visible">
        {/* Linie siatki — prostopadłe do kierunku słupków */}
        {showGrid && Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
          const t = i / GRID_LINES
          return isVertical ? (
            <line
              key={i}
              x1={padL} y1={padT + t * plotH}
              x2={W - padR} y2={padT + t * plotH}
              stroke="currentColor" strokeOpacity={0.07} strokeWidth={1}
            />
          ) : (
            <line
              key={i}
              x1={padL + t * plotW} y1={padT}
              x2={padL + t * plotW} y2={H - padB}
              stroke="currentColor" strokeOpacity={0.07} strokeWidth={1}
            />
          )
        })}

        {/* Etykiety osi wartości */}
        {showGrid && Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
          const t = i / GRID_LINES
          const val = isVertical ? scaleMax * (1 - t) : scaleMax * t
          const txt = val >= 1000 ? `${(val / 1000).toFixed(0)}k` : Math.round(val)
          return isVertical ? (
            <text
              key={i} x={padL - 6} y={padT + t * plotH}
              textAnchor="end" dominantBaseline="middle"
              fill="currentColor" fillOpacity={0.4}
              style={{ fontSize: 10, fontFamily: 'inherit' }}
            >{txt}</text>
          ) : (
            <text
              key={i} x={padL + t * plotW} y={H - padB + 14}
              textAnchor="middle"
              fill="currentColor" fillOpacity={0.4}
              style={{ fontSize: 10, fontFamily: 'inherit' }}
            >{txt}</text>
          )
        })}

        {/* Słupki */}
        {rows.map((vals, di) => {
          const bandStart = (isVertical ? padL : padT) + di * slot + bandPad / 2
          let stackAcc = 0

          return (
            <g key={di}>
              {vals.map((v, si) => {
                const color = colors[si % colors.length]
                const len = valueToLen(v)
                const offset = mode === 'stacked' ? 0 : si * barSize
                const pos = bandStart + offset

                // W stacked kolejne segmenty przesuwają się o sumę poprzednich.
                const stackOffset = mode === 'stacked' ? valueToLen(stackAcc) : 0
                if (mode === 'stacked') stackAcc += v

                const x = isVertical ? pos : padL + stackOffset
                const y = isVertical ? H - padB - len - stackOffset : pos
                const w = isVertical ? barSize : len
                const h = isVertical ? len : barSize

                return (
                  <g key={si}>
                    <rect
                      x={x} y={y} width={Math.max(w - 2, 1)} height={Math.max(h, 1)}
                      rx={4}
                      fill={color}
                      fillOpacity={isGlass ? 0.75 : 0.9}
                    />
                    {/* Poświata w trybie glass — miękka kopia pod spodem */}
                    {isGlass && (
                      <rect
                        x={x} y={y} width={Math.max(w - 2, 1)} height={Math.max(h, 1)}
                        rx={4}
                        fill={color}
                        fillOpacity={0.25}
                        style={{ filter: 'blur(6px)' }}
                      />
                    )}
                    {showValues && mode !== 'stacked' && (
                      <text
                        x={isVertical ? x + (w - 2) / 2 : x + len + 6}
                        y={isVertical ? y - 5 : y + h / 2}
                        textAnchor={isVertical ? 'middle' : 'start'}
                        dominantBaseline="middle"
                        fill="currentColor" fillOpacity={0.65}
                        style={{ fontSize: 10, fontWeight: 600, fontFamily: 'inherit' }}
                      >{v}</text>
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* Etykiety kategorii */}
        {showAxisLabels && data.map((d, di) => {
          const center = (isVertical ? padL : padT) + di * slot + slot / 2
          return isVertical ? (
            <text
              key={di} x={center} y={H - padB + 14}
              textAnchor="middle"
              fill="currentColor" fillOpacity={0.45}
              style={{ fontSize: 10, fontFamily: 'inherit' }}
            >{d.label}</text>
          ) : (
            <text
              key={di} x={padL - 8} y={center}
              textAnchor="end" dominantBaseline="middle"
              fill="currentColor" fillOpacity={0.45}
              style={{ fontSize: 10, fontFamily: 'inherit' }}
            >{d.label}</text>
          )
        })}
      </svg>

      {seriesLabels && seriesLabels.length > 0 && (
        <div className="flex flex-wrap gap-3 px-1">
          {seriesLabels.map((lbl, si) => (
            <div key={si} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[si % colors.length] }} />
              <span className="text-[11px] text-foreground/55">{lbl}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
