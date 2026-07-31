import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface ContextPillProps {
  label: string;
  value: string;
  icon?: ReactNode;
  onClick?: () => void;
  active?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

export function ContextPill({
  label, value, icon, onClick, active, size = 'default', className,
}: ContextPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-all',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        active
          ? 'border-primary/50 bg-primary/10 text-primary'
          : 'border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/40',
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="text-muted-foreground/60">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
      <ChevronDown className={cn('shrink-0 opacity-50', size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
    </button>
  );
}
