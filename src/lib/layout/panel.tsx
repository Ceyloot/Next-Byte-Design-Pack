import * as React from 'react';
import { PanelRightClose, PanelRightOpen, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── PanelHeader ─────────────────────────────────────────── */
export interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  count?: number;
  actions?: React.ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
  onSearch?: () => void;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({
  icon,
  title,
  count,
  actions,
  collapsed,
  onToggle,
  onSearch,
  className,
  ...props
}) => (
  <div
    className={cn(
      'flex items-center gap-2 border-b border-border px-3 py-2.5',
      className
    )}
    {...props}
  >
    {icon && <span className="shrink-0 text-primary">{icon}</span>}
    {!collapsed && (
      <>
        <span className="font-heading text-sm font-semibold text-foreground flex-1 truncate">{title}</span>
        {count !== undefined && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">
            {count}
          </span>
        )}
        {actions}
        {onSearch && (
          <button
            type="button"
            onClick={onSearch}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Szukaj"
          >
            <Search className="h-4 w-4" />
          </button>
        )}
      </>
    )}
    {onToggle && (
      <button
        type="button"
        onClick={onToggle}
        className="ml-auto rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label={collapsed ? 'Rozwiń panel' : 'Zwiń panel'}
      >
        {collapsed
          ? <PanelRightOpen className="h-4 w-4" />
          : <PanelRightClose className="h-4 w-4" />
        }
      </button>
    )}
  </div>
);

/* ── Panel ───────────────────────────────────────────────── */
export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  count?: number;
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onSearch?: () => void;
  headerSlot?: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({
  icon,
  title,
  count,
  actions,
  collapsible = false,
  defaultCollapsed = false,
  onSearch,
  headerSlot,
  children,
  className,
  ...props
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200',
        collapsed ? 'w-12' : 'w-full',
        className
      )}
      {...props}
    >
      <PanelHeader
        icon={icon}
        title={title}
        count={count}
        actions={actions}
        collapsed={collapsed}
        onToggle={collapsible ? () => setCollapsed(c => !c) : undefined}
        onSearch={collapsed ? undefined : onSearch}
      />
      {headerSlot && !collapsed && (
        <div className="border-b border-border px-3 py-2">{headerSlot}</div>
      )}
      {!collapsed && (
        <div className="flex-1 overflow-auto">{children}</div>
      )}
    </div>
  );
};

export { Panel, PanelHeader };
