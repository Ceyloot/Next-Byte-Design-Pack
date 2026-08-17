import React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

/* Tabela porównawcza planów/wariantów — Funkcja | kolumna | kolumna...
   Ostatnia kolumna może być wyróżniona (highlightLast) jak w Cenniku. */
export type CompareCellValue = 'yes' | 'no' | string

interface GlassCompareTableProps {
  columns: string[]
  rows: { label: string; values: CompareCellValue[] }[]
  highlightLast?: boolean
  className?: string
}

function Cell({ value, highlighted }: { value: CompareCellValue; highlighted?: boolean }) {
  if (value === 'yes') {
    return <div className="flex items-center justify-center"><Check className={cn('w-4 h-4', highlighted ? 'text-primary' : 'text-foreground/70')} /></div>
  }
  if (value === 'no') {
    return <div className="flex items-center justify-center"><X className="w-4 h-4 text-foreground/25" /></div>
  }
  return <div className={cn('text-center text-[11px] font-semibold', highlighted ? 'text-primary' : 'text-foreground/75')}>{value}</div>
}

export function GlassCompareTable({ columns, rows, highlightLast = true, className }: GlassCompareTableProps) {
  const { isGlass } = useGlass()
  const gridCols = `1.6fr repeat(${columns.length}, 1fr)`

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden',
      isGlass ? 'nb-szklo nb-szklo-plynne' : 'nb-tafla',
      className,
    )}>
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${280 + columns.length * 100}px` }}>
          <div className={cn('grid border-b', isGlass ? 'border-foreground/[0.08]' : 'border-border/60')} style={{ gridTemplateColumns: gridCols }}>
            <div className="p-3.5 md:p-4 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/50">Funkcja</div>
            {columns.map((c, i) => {
              const last = highlightLast && i === columns.length - 1
              return (
                <div key={c} className={cn(
                  'p-3.5 md:p-4 text-center text-[10px] font-bold uppercase tracking-[0.14em] border-l',
                  isGlass ? 'border-foreground/[0.06]' : 'border-border/40',
                  last ? 'text-primary bg-primary/[0.05]' : 'text-foreground/40',
                )}>
                  {c}
                </div>
              )
            })}
          </div>
          {rows.map((row, ri) => (
            <div
              key={ri}
              className={cn('grid border-b last:border-0', isGlass ? 'border-foreground/[0.05]' : 'border-border/30')}
              style={{ gridTemplateColumns: gridCols }}
            >
              <div className="p-3.5 md:p-4 text-xs text-foreground/80">{row.label}</div>
              {row.values.map((v, i) => {
                const last = highlightLast && i === columns.length - 1
                return (
                  <div key={i} className={cn(
                    'p-3.5 md:p-4 border-l',
                    isGlass ? 'border-foreground/[0.06]' : 'border-border/40',
                    last && 'bg-primary/[0.04]',
                  )}>
                    <Cell value={v} highlighted={last} />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
