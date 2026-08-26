import React, { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'
import { Checkbox } from '../../components/ui/checkbox'

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
  /** Klucz wiersza do identyfikacji zaznaczenia (domyślnie index). */
  rowKey?: (row: T, rowIndex: number) => string | number
  /** Włącza kolumnę checkboxów + "zaznacz wszystko". */
  selectable?: boolean
  selectedKeys?: Array<string | number>
  onSelectionChange?: (keys: Array<string | number>) => void
  /** Nagłówek przykleja się do góry scrollowanego kontenera. */
  stickyHeader?: boolean
  maxHeight?: string
}

type SortDir = 'asc' | 'desc' | null

export function GlassTable<T extends Record<string, unknown>>({
  columns,
  data,
  caption,
  compact,
  onRowClick,
  className,
  rowKey,
  selectable,
  selectedKeys,
  onSelectionChange,
  stickyHeader,
  maxHeight,
}: GlassTableProps<T>) {
  const { isGlass } = useGlass()
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [internalSelected, setInternalSelected] = useState<Array<string | number>>([])
  const selected = selectedKeys ?? internalSelected
  const getKey = (row: T, idx: number) => rowKey?.(row, idx) ?? idx

  function setSelected(next: Array<string | number>) {
    if (selectedKeys === undefined) setInternalSelected(next)
    onSelectionChange?.(next)
  }

  function toggleRow(key: string | number) {
    setSelected(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])
  }

  function toggleAll(keys: Array<string | number>) {
    setSelected(selected.length === keys.length ? [] : keys)
  }

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
      <div className={cn('overflow-x-auto', stickyHeader && 'overflow-y-auto')} style={stickyHeader ? { maxHeight: maxHeight ?? '360px' } : undefined}>
        <table className="w-full text-sm">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10 backdrop-blur-md', stickyHeader && (isGlass ? 'bg-card/90' : 'bg-card'))}>
            <tr className="border-b border-foreground/10">
              {selectable && (
                <th className={cn(cellPad, 'w-10')}>
                  <Checkbox
                    checkboxSize="sm"
                    checked={sorted.length > 0 && selected.length === sorted.length ? true : selected.length > 0 ? 'indeterminate' : false}
                    onCheckedChange={() => toggleAll(sorted.map((row, i) => getKey(row, i)))}
                  />
                </th>
              )}
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
            {sorted.map((row, rIdx) => {
              const key = getKey(row, rIdx)
              const isSelected = selected.includes(key)
              return (
              <tr
                key={rIdx}
                onClick={onRowClick ? () => onRowClick(row, rIdx) : undefined}
                className={cn(
                  'transition-colors duration-100 hover:bg-foreground/[0.035]',
                  onRowClick && 'cursor-pointer',
                  isSelected && 'bg-primary/[0.06]',
                )}
              >
                {selectable && (
                  <td className={cellPad} onClick={(e) => e.stopPropagation()}>
                    <Checkbox checkboxSize="sm" checked={isSelected} onCheckedChange={() => toggleRow(key)} />
                  </td>
                )}
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
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
