import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface ActivityDay {
  date: Date
  dateString: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface MonthLabel {
  month: string
  weekIndex: number
}

export interface ActivityData {
  weeks: ActivityDay[][]
  monthLabels: MonthLabel[]
  totalCount: number
  maxStreak: number
  currentStreak: number
}

const MONTH_NAMES_PL = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru']
const DAY_LABELS_PL = ['', 'Wt', '', 'Cz', '', 'Sob', '']

/**
 * Generates realistic calendar contribution data for the specified number of weeks ending today.
 */
export function generateActivityData(weeksCount: number = 26): ActivityData {
  const endDate = new Date(2026, 7, 15) // 15 Aug 2026
  const currentDayOfWeek = (endDate.getDay() + 6) % 7 // 0 = Mon, 6 = Sun
  const daysToSunday = 6 - currentDayOfWeek

  const endOfWeekDate = new Date(endDate)
  endOfWeekDate.setDate(endDate.getDate() + daysToSunday)

  const totalDays = weeksCount * 7
  const startDate = new Date(endOfWeekDate)
  startDate.setDate(endOfWeekDate.getDate() - totalDays + 1)

  const weeks: ActivityDay[][] = []
  const monthLabels: MonthLabel[] = []
  let lastMonth = -1

  let totalCount = 0
  let maxStreak = 0
  let tempStreak = 0

  // Start dense activity cluster at ~60% of the timeline
  const activeStartIndex = Math.floor(weeksCount * 0.6)

  for (let w = 0; w < weeksCount; w++) {
    const weekDays: ActivityDay[] = []

    for (let d = 0; d < 7; d++) {
      const dayIndex = w * 7 + d
      const cellDate = new Date(startDate)
      cellDate.setDate(startDate.getDate() + dayIndex)

      const isFuture = cellDate > endDate
      const monthNum = cellDate.getMonth()

      // Record month label when month changes (leaving enough gap between labels)
      if (d === 0 && monthNum !== lastMonth) {
        if (monthLabels.length === 0 || w - monthLabels[monthLabels.length - 1].weekIndex >= 3) {
          monthLabels.push({
            month: MONTH_NAMES_PL[monthNum],
            weekIndex: w,
          })
          lastMonth = monthNum
        }
      }

      let count = 0
      let level: 0 | 1 | 2 | 3 | 4 = 0

      if (!isFuture) {
        if (w < activeStartIndex) {
          // Sparse earlier activity
          const rand = Math.random()
          if (rand > 0.88) {
            count = Math.floor(Math.random() * 3) + 1
            level = count > 2 ? 2 : 1
          }
        } else {
          // Dense recent activity cluster matching screenshot pattern
          const dayOfWeek = cellDate.getDay() // 0 = Sun, 6 = Sat
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

          // Pseudo-random seed for organic-looking heatmap cluster
          const seed = (w * 13 + d * 29) % 100

          if (isWeekend) {
            if (seed > 45) {
              count = Math.floor(Math.random() * 4) + 1
              level = count > 2 ? 2 : 1
            }
          } else {
            if (seed > 10) {
              const intensity = (seed % 10) / 10
              if (intensity > 0.75) {
                count = Math.floor(Math.random() * 10) + 15
                level = 4
              } else if (intensity > 0.45) {
                count = Math.floor(Math.random() * 6) + 8
                level = 3
              } else if (intensity > 0.2) {
                count = Math.floor(Math.random() * 4) + 4
                level = 2
              } else {
                count = Math.floor(Math.random() * 3) + 1
                level = 1
              }
            }
          }
        }
      }

      if (count > 0) {
        totalCount += count
        tempStreak++
        if (tempStreak > maxStreak) maxStreak = tempStreak
      } else {
        tempStreak = 0
      }

      const dateString = cellDate.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      weekDays.push({
        date: cellDate,
        dateString,
        count,
        level,
      })
    }

    weeks.push(weekDays)
  }

  // Calculate current streak backwards from today
  let currentStreak = 0
  let checkingDayIndex = weeksCount * 7 - 1 - daysToSunday
  while (checkingDayIndex >= 0) {
    const w = Math.floor(checkingDayIndex / 7)
    const d = checkingDayIndex % 7
    if (weeks[w] && weeks[w][d] && weeks[w][d].count > 0) {
      currentStreak++
      checkingDayIndex--
    } else {
      break
    }
  }

  return {
    weeks,
    monthLabels,
    totalCount,
    maxStreak,
    currentStreak,
  }
}

export interface GlassActivityGridProps {
  weeksCount?: number
  className?: string
  showSummary?: boolean
  showStreaks?: boolean
  quote?: string
  showContent?: boolean
  title?: string
  badgeText?: string
  compact?: boolean
  hideHeader?: boolean
}

export function GlassActivityGrid({
  weeksCount = 26,
  className,
  showSummary = true,
  showStreaks = true,
  quote = "Zużyłeś ~374× więcej tokenów niż „Folwark zwierzęcy”.",
  showContent = true,
  title = "📈 Aktywność",
  badgeText = "OSTATNIE 6 MIES.",
  compact = false,
  hideHeader = false,
}: GlassActivityGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: ActivityDay; x: number; y: number } | null>(null)

  const data = useMemo(() => generateActivityData(weeksCount), [weeksCount])

  return (
    <div className={cn("flex flex-col relative select-none", compact ? "gap-2 py-0" : "gap-2.5 py-1", className)}>
      {/* Header */}
      {!hideHeader && (
        <div className={cn("flex flex-wrap items-center justify-between gap-2", compact ? "h-5" : "h-6")}>
          <div className={cn("flex items-center gap-2", compact ? "h-5" : "h-6")}>
            <h2 className={cn("font-bold text-foreground flex items-center gap-1.5 leading-none", compact ? "text-xs" : "text-sm")}>
              {showContent ? (
                title
              ) : (
                <span className={cn("inline-block bg-foreground/25 rounded-md animate-pulse", compact ? "h-3 w-16" : "h-3.5 w-20")} />
              )}
            </h2>
            <div className={cn("font-semibold text-foreground/50 flex items-center gap-1 px-2 rounded-full bg-foreground/5 border border-foreground/10", compact ? "text-[9px] h-4" : "text-[10px] h-5")}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
              {showContent ? (
                <span>{badgeText}</span>
              ) : (
                <span className="inline-block h-2 w-16 bg-foreground/20 rounded animate-pulse" />
              )}
            </div>
          </div>

          {showStreaks && (
            <div className="flex items-center gap-3 text-[11px] text-foreground/60">
              {showContent ? (
                <>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-foreground/5 border border-foreground/8 text-[10px]">
                    <span className="text-amber-400">🔥</span>
                    <span>Bieżąca seria: <strong className="text-foreground">{data.currentStreak} dni</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-foreground/5 border border-foreground/8 text-[10px]">
                    <span className="text-primary">⚡</span>
                    <span>Max: <strong className="text-foreground">{data.maxStreak} dni</strong></span>
                  </div>
                  <div className="text-[11px] text-foreground/50 tabular-nums">
                    <span className="font-semibold text-foreground">{data.totalCount.toLocaleString('pl-PL')}</span> zapytań
                  </div>
                </>
              ) : (
                <div className="h-4 w-32 bg-foreground/15 rounded-full animate-pulse" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Grid container with scroll if needed */}
      <div className="relative overflow-x-auto pb-0.5 pt-0.5 scrollbar-none">
        <div className="flex flex-col gap-1 min-w-max">

          {/* Month labels row */}
          <div className={cn("flex text-foreground/50 font-medium relative", compact ? "pl-5 text-[9px] h-3.5" : "pl-7 text-[10px] h-5")}>
            {data.monthLabels.map(({ month, weekIndex }) => (
              <div
                key={`${month}-${weekIndex}`}
                className="absolute"
                style={{ left: compact ? `${20 + weekIndex * 12}px` : `${28 + weekIndex * 16}px` }}
              >
                {month}
              </div>
            ))}
          </div>

          {/* Days grid row */}
          <div className={cn("flex items-start", compact ? "gap-[2.5px]" : "gap-1")}>
            {/* Day labels column */}
            <div className={cn("flex flex-col pt-0 pr-0.5 shrink-0 text-foreground/40 font-medium", compact ? "gap-[2.5px] text-[8px]" : "gap-1 text-[9px]")}>
              {DAY_LABELS_PL.map((label, idx) => (
                <div key={idx} className={cn("flex items-center justify-end leading-none", compact ? "w-4 h-2.5" : "w-5 h-3.5")}>
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks columns */}
            <div className={cn("flex", compact ? "gap-[2.5px]" : "gap-1")}>
              {data.weeks.map((week, wIdx) => (
                <div key={wIdx} className={cn("flex flex-col", compact ? "gap-[2.5px]" : "gap-1")}>
                  {week.map((day, dIdx) => (
                    <div
                      key={`${wIdx}-${dIdx}`}
                      onMouseEnter={(e) => {
                        if (!showContent) return
                        const rect = e.currentTarget.getBoundingClientRect()
                        setHoveredCell({
                          day,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        })
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={cn(
                        "transition-all duration-150 cursor-pointer hover:scale-115 hover:z-20 hover:ring-1.5 hover:ring-primary hover:shadow-sm",
                        compact ? "w-2.5 h-2.5 rounded-[2px]" : "w-3.5 h-3.5 rounded-[2.5px]",
                        !showContent && "bg-foreground/12 animate-pulse",
                        showContent && day.level === 0 && "bg-foreground/[0.07] hover:bg-foreground/20",
                        showContent && day.level === 1 && "bg-primary/25 hover:bg-primary/40",
                        showContent && day.level === 2 && "bg-primary/50 hover:bg-primary/65",
                        showContent && day.level === 3 && "bg-primary/75 hover:bg-primary/90",
                        showContent && day.level === 4 && "bg-primary hover:bg-primary/90"
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Glass Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 pointer-events-none transition-opacity duration-150"
          style={{ left: `${hoveredCell.x}px`, top: `${hoveredCell.y}px` }}
        >
          <div className="nb-szklo px-2.5 py-1.5 rounded-lg shadow-xl text-[11px] font-medium text-foreground whitespace-nowrap border border-foreground/15 flex flex-col items-center gap-0.5">
            <span className="font-semibold text-primary">
              {hoveredCell.day.count > 0 ? `${hoveredCell.day.count} zapytań / akcji` : 'Brak aktywności'}
            </span>
            <span className="text-[10px] text-foreground/60">{hoveredCell.day.dateString}</span>
          </div>
        </div>
      )}

      {/* Footer summary & legend */}
      {showSummary && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-foreground/8 text-[11px] text-foreground/50">
          <div className="flex items-center gap-2">
            <span className="text-foreground/70 font-medium">
              {quote}
            </span>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-1.5 text-[10px] text-foreground/45 shrink-0 ml-auto">
            <span>Mniej</span>
            <span className="w-3 h-3 rounded-[2px] bg-foreground/[0.07]" />
            <span className="w-3 h-3 rounded-[2px] bg-primary/25" />
            <span className="w-3 h-3 rounded-[2px] bg-primary/50" />
            <span className="w-3 h-3 rounded-[2px] bg-primary/75" />
            <span className="w-3 h-3 rounded-[2px] bg-primary" />
            <span>Więcej</span>
          </div>
        </div>
      )}
    </div>
  )
}
