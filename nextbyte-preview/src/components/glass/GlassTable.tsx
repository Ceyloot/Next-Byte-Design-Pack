import React, { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlass } from '@/lib/glass-context'

export interface GlassTableColumn<T = Record<string, unknown>> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode
}

export interface GlassTableProps<T = Record<string, unknown>> {
  columns: GlassTableColumn<T>[]
  data: T[]
  caption?: string
  compact?: boolean
  onRowClick?: (row: T, rowIndex: number) => void
  className?: string
}

type SortDir = 'asc' | 'desc' | null

export function GlassTable<T extends Record<string, unknown>>({
  columns,
  data,
  caption,
  compact,
  onRowClick,
  className,
}: GlassTableProps<T>) {
  const { isGlass } = useGlass()
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const sorted = React.useMemo(() => {
    if (!sortKey || !sortDir) return data
    return [...data].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'pl', { numeric: true, sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  function handleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
    } else {
      setSortKey(null)
      setSortDir(null)
    }
  }

  const cellPad = compact ? 'px-4 py-2' : 'px-4 py-3'
  const alignMap: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' }

  return (
    <div className={cn(
      'w-full overflow-hidden rounded-2xl',
      isGlass
        ? 'nb-szklo nb-szklo-plynne nb-powierzchnia'
        : 'border border-border bg-card',
      className,
    )}>
      {caption && (
        <div className="px-4 py-3 border-b border-foreground/10">
          <p className="text-sm font-semibold text-foreground">{caption}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    cellPad,
                    'text-xs font-semibold text-foreground/55 uppercase tracking-wide whitespace-nowrap',
                    alignMap[col.align ?? 'left'],
                    col.sortable && 'cursor-pointer select-none hover:text-foreground/80 transition-colors',
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDir === 'asc'
                          ? <ChevronUp className="h-3 w-3" />
                          : <ChevronDown className="h-3 w-3" />
                        : <ChevronsUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/[0.06]">
            {sorted.map((row, rIdx) => (
              <tr
                key={rIdx}
                onClick={onRowClick ? () => onRowClick(row, rIdx) : undefined}
                className={cn(
                  'transition-colors duration-100 hover:bg-foreground/[0.035]',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      cellPad,
                      'text-sm text-foreground/80 whitespace-nowrap',
                      alignMap[col.align ?? 'left'],
                    )}
                  >
                    {col.render
                      ? col.render(row[col.key], row, rIdx)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
