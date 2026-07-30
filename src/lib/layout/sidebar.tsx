import * as React from 'react';
import { PanelLeftClose, PanelLeftOpen, Bell, Settings, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Context ─────────────────────────────────────────────── */
const SidebarContext = React.createContext<{ collapsed: boolean }>({ collapsed: false });

/* ── SidebarSection ──────────────────────────────────────── */
export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ label, children, className, ...props }) => {
  const { collapsed } = React.useContext(SidebarContext);
  return (
    <div className={cn('space-y-0.5', className)} {...props}>
      {label && !collapsed && (
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      )}
      {children}
    </div>
  );
};

/* ── SidebarItem ─────────────────────────────────────────── */
export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  active?: boolean;
  iconColor?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  badge,
  active,
  iconColor,
  className,
  ...props
}) => {
  const { collapsed } = React.useContext(SidebarContext);

  return (
    <button
      type="button"
      title={collapsed ? label : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-muted/80 text-foreground font-semibold'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        collapsed && 'justify-center px-2',
        className
      )}
      {...props}
    >
      {icon && (
        <span className={cn('shrink-0 h-4 w-4', iconColor, active && !iconColor && 'text-foreground')}>
          {icon}
        </span>
      )}
      {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
      {!collapsed && badge && <span>{badge}</span>}
    </button>
  );
};

/* ── SidebarFooter / UserBar ─────────────────────────────── */
export interface SidebarUserBarProps {
  avatar?: React.ReactNode;
  name?: string;
  role?: string;
  balance?: React.ReactNode;
  onBell?: () => void;
  onSettings?: () => void;
  onProfile?: () => void;
}

const SidebarUserBar: React.FC<SidebarUserBarProps> = ({
  avatar,
  name,
  role,
  balance,
  onBell,
  onSettings,
  onProfile,
}) => {
  const { collapsed } = React.useContext(SidebarContext);

  if (collapsed) {
    return (
      <div className="border-t border-border p-2 flex flex-col items-center gap-2">
        {avatar && <div className="h-7 w-7 rounded-full overflow-hidden">{avatar}</div>}
      </div>
    );
  }

  return (
    <div className="border-t border-border p-3 flex flex-col items-stretch gap-2">
      {balance && (
        <div className="mb-1 w-full">
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            {balance}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onProfile}
          className="flex flex-1 items-center gap-2 rounded-xl p-1 hover:bg-muted/50 transition-colors min-w-0"
        >
          {avatar && (
            <div className="h-7 w-7 shrink-0 rounded-full overflow-hidden border border-border">
              {avatar}
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-xs font-semibold text-foreground">{name}</p>
            <p className="truncate text-[10px] text-muted-foreground">{role}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={onBell}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          aria-label="Powiadomienia"
        >
          <Bell className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          aria-label="Ustawienia"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/* ── SidebarHeader ───────────────────────────────────────── */
export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode;
  actions?: React.ReactNode;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ logo, actions, className, ...props }) => {
  const { collapsed } = React.useContext(SidebarContext);
  return (
    <div className={cn('flex items-center gap-2 border-b border-border px-3 py-3', collapsed && 'justify-center', className)} {...props}>
      {logo && <div className={cn('shrink-0', !collapsed && 'flex-1')}>{logo}</div>}
      {!collapsed && actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
};

/* ── Sidebar ─────────────────────────────────────────────── */
export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (v: boolean) => void;
  width?: string;
  collapsedWidth?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsible = true,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  width = 'w-56',
  collapsedWidth = 'w-14',
  children,
  className,
  ...props
}) => {
  const [_collapsed, _setCollapsed] = React.useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? _collapsed;
  const setCollapsed = (v: boolean) => {
    _setCollapsed(v);
    onCollapsedChange?.(v);
  };

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div
        className={cn(
          'flex flex-col border-r border-border bg-card transition-all duration-200 overflow-hidden',
          collapsed ? collapsedWidth : width,
          className
        )}
        {...props}
      >
        <div className="flex flex-1 flex-col overflow-auto">
          {children}
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center border-t border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors',
              collapsed ? 'justify-center' : 'gap-2'
            )}
          >
            {collapsed
              ? <PanelLeftOpen className="h-4 w-4" />
              : <><PanelLeftClose className="h-4 w-4" /><span>Zwiń</span></>
            }
          </button>
        )}
      </div>
    </SidebarContext.Provider>
  );
};

export { Sidebar, SidebarHeader, SidebarSection, SidebarItem, SidebarUserBar };
