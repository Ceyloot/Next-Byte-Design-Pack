import React from 'react'
import { ChevronRight, Folder, FolderOpen, File as FileIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'

// ── 21. TreeView ───────────────────────────────────────────────────

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  icon?: React.ComponentType<{ className?: string }>
  /** Liczba / status po prawej stronie wiersza. */
  badge?: React.ReactNode
  disabled?: boolean
}

export interface GlassTreeViewProps {
  nodes: TreeNode[]
  /** Id-ki rozwinięte na starcie. */
  defaultExpanded?: string[]
  selectedId?: string
  onSelect?: (node: TreeNode) => void
  /** Pionowe kreski pokazujące poziom zagnieżdżenia. */
  showGuides?: boolean
  className?: string
}

export function GlassTreeView({
  nodes,
  defaultExpanded = [],
  selectedId,
  onSelect,
  showGuides = true,
  className,
}: GlassTreeViewProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(defaultExpanded))

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={cn('flex flex-col', className)} role="tree">
      {nodes.map((n) => (
        <TreeBranch
          key={n.id}
          node={n}
          depth={0}
          expanded={expanded}
          toggle={toggle}
          selectedId={selectedId}
          onSelect={onSelect}
          showGuides={showGuides}
        />
      ))}
    </div>
  )
}

function TreeBranch({
  node, depth, expanded, toggle, selectedId, onSelect, showGuides,
}: {
  node: TreeNode
  depth: number
  expanded: Set<string>
  toggle: (id: string) => void
  selectedId?: string
  onSelect?: (n: TreeNode) => void
  showGuides: boolean
}) {
  const { isGlass } = useGlass()
  const hasChildren = !!node.children?.length
  const isOpen = expanded.has(node.id)
  const isSelected = selectedId === node.id

  // Folder bez własnej ikony dostaje otwartą/zamkniętą zależnie od stanu,
  // liść — plik. Dzięki temu drzewo czyta się bez podawania ikon ręcznie.
  const Icon = node.icon ?? (hasChildren ? (isOpen ? FolderOpen : Folder) : FileIcon)

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isOpen : undefined}>
      <div
        onClick={() => {
          if (node.disabled) return
          if (hasChildren) toggle(node.id)
          onSelect?.(node)
        }}
        className={cn(
          'group flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 transition-colors',
          !node.disabled && 'hover:bg-foreground/[0.05]',
          node.disabled && 'pointer-events-none opacity-35',
          isSelected && (isGlass ? 'bg-primary/[0.14] text-primary' : 'bg-primary/10 text-primary'),
        )}
        style={{ paddingLeft: 6 + depth * 16 }}
      >
        {hasChildren ? (
          <ChevronRight
            className={cn('h-3 w-3 shrink-0 text-foreground/35 transition-transform', isOpen && 'rotate-90')}
          />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <Icon className={cn('h-3.5 w-3.5 shrink-0', isSelected ? 'text-primary' : 'text-foreground/45')} />
        <span className={cn('min-w-0 flex-1 truncate text-[12px]', isSelected ? 'font-medium' : 'text-foreground/75')}>
          {node.label}
        </span>
        {node.badge && <span className="shrink-0 text-[10px] text-foreground/35">{node.badge}</span>}
      </div>

      {hasChildren && isOpen && (
        <div className="relative">
          {/* Kreska prowadząca wyrównana do środka chevronu rodzica. */}
          {showGuides && (
            <span
              aria-hidden
              className="absolute bottom-1 top-0 w-px bg-foreground/[0.08]"
              style={{ left: 12 + depth * 16 }}
            />
          )}
          {node.children!.map((c) => (
            <TreeBranch
              key={c.id}
              node={c}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              selectedId={selectedId}
              onSelect={onSelect}
              showGuides={showGuides}
            />
          ))}
        </div>
      )}
    </div>
  )
}
