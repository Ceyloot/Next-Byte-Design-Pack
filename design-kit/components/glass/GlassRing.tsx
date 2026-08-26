import React from 'react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

const R    = 40
const CX   = 50
const CY   = 50
const CIRC = 2 * Math.PI * R          // 251.33
const ARC  = CIRC * (270 / 360)       // 188.50 — 270° gauge
const GAP  = CIRC - ARC               // 62.83

export interface GlassRingSegment {
  pct: number
  color: string
}

export interface GlassRingProps {
  value?: number                       // 0–100 (fill percentage) — tryb jednowartościowy
  segments?: GlassRingSegment[]        // podział na kategorie — tryb wielosegmentowy (jak "full", z rounded-cap + poświatą)
  size?: number                        // px
  variant?: 'full' | 'gauge'
  label?: React.ReactNode              // center text (defaults to "${value}%")
  sublabel?: string                    // bold line below ring
  subtext?: string                     // small muted line below sublabel
  color?: string                       // CSS color (default: hsl(var(--primary)))
  thickness?: number
  className?: string
}

export function GlassRing({
  value = 0,
  segments,
  size = 120,
  variant = 'full',
  label,
  sublabel,
  subtext,
  color = 'hsl(var(--primary))',
  thickness = 8,
  className,
}: GlassRingProps) {
  const { isGlass } = useGlass()
  const pct = Math.min(100, Math.max(0, value))

  const labelStr = label !== undefined ? String(label) : `${pct}%`
  const fontSize = labelStr.length > 4 ? 14 : labelStr.length > 2 ? 18 : 22

  const glowStyle = isGlass
    ? { filter: `drop-shadow(0 0 3px ${color})` }
    : {}

  // ── Tryb wielosegmentowy — ta sama poświata i rounded-cap co gauge,
  // tylko podzielone na kilka kategorii zamiast jednej wartości. Jeden
  // spójny styl pierścienia w całej aplikacji (Preview i Dane). ──────
  if (segments && segments.length > 0) {
    const circ = 2 * Math.PI * R
    let cum = 0
    return (
      <div className={cn('flex flex-col items-center', className)}>
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="-rotate-90">
          <circle cx={CX} cy={CY} r={R} stroke="hsl(var(--foreground) / 0.10)" strokeWidth={thickness} />
          {segments.map((seg, i) => {
            const gapDeg = segments.length > 1 ? 1.5 : 0
            const segCirc = (seg.pct / 100) * circ
            const dash = Math.max(0, segCirc - (gapDeg / 360) * circ)
            const rotation = (cum / 100) * 360
            cum += seg.pct
            return (
              <g key={i}>
                {isGlass && (
                  <circle
                    cx={CX} cy={CY} r={R}
                    stroke={seg.color}
                    strokeWidth={thickness + 3}
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeLinecap="butt"
                    transform={`rotate(${rotation} ${CX} ${CY})`}
                    opacity={0.08}
                    style={{ filter: 'blur(3px)' }}
                  />
                )}
                <circle
                  cx={CX} cy={CY} r={R}
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeLinecap="butt"
                  transform={`rotate(${rotation} ${CX} ${CY})`}
                  className="transition-all duration-300"
                />
              </g>
            )
          })}
          <text
            x="50" y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
            transform="rotate(90 50 50)"
            style={{ fontSize, fontWeight: 700, fontFamily: 'inherit' }}
          >
            {labelStr}
          </text>
        </svg>
        {sublabel && <p className="text-xs text-foreground/60 text-center mt-1">{sublabel}</p>}
        {subtext && <p className="text-[11px] text-foreground/40 text-center mt-0.5">{subtext}</p>}
      </div>
    )
  }

  if (variant === 'gauge') {
    const fillLen = (pct / 100) * ARC
    return (
      <div className={cn('flex flex-col items-center', className)}>
        <svg width={size} height={size * 0.88} viewBox="0 0 100 88" fill="none">
          {/* Track */}
          <circle
            cx={CX} cy={CY} r={R}
            stroke="hsl(var(--foreground) / 0.10)"
            strokeWidth={thickness}
            strokeDasharray={`${ARC} ${GAP}`}
            strokeLinecap="round"
            transform="rotate(135 50 50)"
          />
          {/* Glow layer */}
          {isGlass && fillLen > 0 && (
            <circle
              cx={CX} cy={CY} r={R}
              stroke={color}
              strokeWidth={thickness + 4}
              strokeDasharray={`${fillLen} ${CIRC}`}
              strokeLinecap="round"
              transform="rotate(135 50 50)"
              opacity={0.10}
              style={{ filter: 'blur(3px)' }}
            />
          )}
          {/* Fill */}
          {fillLen > 0 && (
            <circle
              cx={CX} cy={CY} r={R}
              stroke={color}
              strokeWidth={thickness}
              strokeDasharray={`${fillLen} ${CIRC}`}
              strokeLinecap="round"
              transform="rotate(135 50 50)"
              style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)', ...glowStyle }}
            />
          )}
          {/* Center label */}
          <text
            x="50" y="47"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
            style={{ fontSize, fontWeight: 700, fontFamily: 'inherit' }}
          >
            {labelStr}
          </text>
        </svg>
        {sublabel && (
          <p className="text-xs font-semibold text-foreground/80 text-center leading-tight">{sublabel}</p>
        )}
        {subtext && (
          <p className="text-[11px] text-foreground/45 text-center mt-0.5">{subtext}</p>
        )}
      </div>
    )
  }

  // full circle
  const fillLen = (pct / 100) * CIRC
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Track */}
        <circle
          cx={CX} cy={CY} r={R}
          stroke="hsl(var(--foreground) / 0.10)"
          strokeWidth={thickness}
        />
        {/* Glow layer */}
        {isGlass && fillLen > 0 && (
          <circle
            cx={CX} cy={CY} r={R}
            stroke={color}
            strokeWidth={thickness + 4}
            strokeDasharray={`${fillLen} ${CIRC}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            opacity={0.10}
            style={{ filter: 'blur(3px)' }}
          />
        )}
        {/* Fill */}
        {fillLen > 0 && (
          <circle
            cx={CX} cy={CY} r={R}
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={`${fillLen} ${CIRC}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)', ...glowStyle }}
          />
        )}
        {/* Center label */}
        <text
          x="50" y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
          style={{ fontSize, fontWeight: 700, fontFamily: 'inherit' }}
        >
          {labelStr}
        </text>
      </svg>
      {sublabel && (
        <p className="text-xs text-foreground/60 text-center mt-1">{sublabel}</p>
      )}
      {subtext && (
        <p className="text-[11px] text-foreground/40 text-center mt-0.5">{subtext}</p>
      )}
    </div>
  )
}
