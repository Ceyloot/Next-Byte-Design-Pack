import { useState } from 'react';
import { ChevronRight, File, Folder, FolderOpen, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface FileTreeNode {
  id: string;
  label: string;
  type: 'folder' | 'file';
  count?: number;
  icon?: ReactNode;
  shared?: boolean;
  sharedBy?: string;
  children?: FileTreeNode[];
  badge?: string;
}

export interface FileTreeSection {
  id: string;
  label: string;
  icon?: ReactNode;
  nodes: FileTreeNode[];
  defaultExpanded?: boolean;
}

interface NodeProps {
  node: FileTreeNode;
  depth: number;
  selected?: string;
  onSelect?: (id: string) => void;
}

function TreeNode({ node, depth, selected, onSelect }: NodeProps) {
  const [open, setOpen] = useState(node.type === 'folder' && depth === 0);
  const isSelected = selected === node.id;
  const hasChildren = node.type === 'folder' && node.children && node.children.length > 0;

  function handleClick() {
    if (hasChildren) setOpen(o => !o);
    onSelect?.(node.id);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors text-left',
          isSelected
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {/* Expand arrow */}
        <span className={cn('shrink-0 transition-transform', open && 'rotate-90')}>
          {hasChildren
            ? <ChevronRight className="h-3 w-3 opacity-50" />
            : <span className="w-3 h-3 block" />
          }
        </span>

        {/* Icon */}
        <span className="shrink-0">
          {node.icon ?? (
            node.type === 'folder'
              ? open
                ? <FolderOpen className="h-3.5 w-3.5" />
                : <Folder className="h-3.5 w-3.5" />
              : <File className="h-3.5 w-3.5" />
          )}
        </span>

        {/* Label */}
        <span className="flex-1 truncate font-medium">{node.label}</span>

        {/* Count / badge */}
        {node.count !== undefined && (
          <span className={cn(
            'shrink-0 text-[10px] font-semibold tabular-nums',
            isSelected ? 'text-primary/70' : 'text-muted-foreground/50',
          )}>{node.count}</span>
        )}
        {node.badge && (
          <span className="shrink-0 text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{node.badge}</span>
        )}
        {node.shared && (
          <Users className="h-3 w-3 shrink-0 text-muted-foreground/40" />
        )}
      </button>

      {hasChildren && open && (
        <div>
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export interface FileTreeProps {
  sections?: FileTreeSection[];
  nodes?: FileTreeNode[];
  selected?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function FileTree({ sections, nodes, selected, onSelect, className }: FileTreeProps) {
  return (
    <div className={cn('flex flex-col gap-1 text-xs', className)}>
      {sections ? sections.map(section => (
        <SectionBlock key={section.id} section={section} selected={selected} onSelect={onSelect} />
      )) : nodes?.map(node => (
        <TreeNode key={node.id} node={node} depth={0} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}

function SectionBlock({
  section, selected, onSelect,
}: { section: FileTreeSection; selected?: string; onSelect?: (id: string) => void }) {
  const [open, setOpen] = useState(section.defaultExpanded ?? true);

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        <ChevronRight className={cn('h-2.5 w-2.5 transition-transform', open && 'rotate-90')} />
        {section.icon}
        {section.label}
      </button>
      {open && section.nodes.map(node => (
        <TreeNode key={node.id} node={node} depth={0} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}
