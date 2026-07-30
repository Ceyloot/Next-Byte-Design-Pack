import * as React from 'react';
import { ChevronLeft, ChevronRight, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertCardVariants = cva('rounded-2xl border p-4 flex flex-col gap-3', {
  variants: {
    variant: {
      info:        'bg-card border-border',
      warning:     'bg-card border-border',
      destructive: 'bg-card border-destructive/30',
      success:     'bg-card border-primary/30',
    },
  },
  defaultVariants: { variant: 'info' },
});

const PRIORITY_BADGE: Record<string, { label: string; cls: string }> = {
  low:      { label: 'Niski',   cls: 'bg-muted text-muted-foreground' },
  medium:   { label: 'Średni',  cls: 'bg-accent/20 text-accent-foreground' },
  high:     { label: 'Wysoki',  cls: 'bg-destructive/20 text-destructive' },
  critical: { label: 'Kryt.',   cls: 'bg-destructive text-destructive-foreground' },
};

const VARIANT_ICON: Record<string, React.ElementType> = {
  info:        Info,
  warning:     AlertTriangle,
  destructive: XCircle,
  success:     CheckCircle,
};

const VARIANT_ICON_COLOR: Record<string, string> = {
  info:        'text-primary',
  warning:     'text-accent-foreground',
  destructive: 'text-destructive',
  success:     'text-primary',
};

export interface AlertCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertCardVariants> {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  action?: { label: string; onClick?: () => void };
  /* pagination */
  currentPage?: number;
  totalPages?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

const AlertCard = React.forwardRef<HTMLDivElement, AlertCardProps>(
  ({
    className,
    variant = 'info',
    title,
    description,
    priority,
    action,
    currentPage,
    totalPages,
    onPrev,
    onNext,
    ...props
  }, ref) => {
    const Icon = VARIANT_ICON[variant ?? 'info'];
    const iconColor = VARIANT_ICON_COLOR[variant ?? 'info'];
    const badge = priority ? PRIORITY_BADGE[priority] : null;
    const hasPagination = totalPages !== undefined && totalPages > 1;

    return (
      <div ref={ref} className={cn(alertCardVariants({ variant }), className)} {...props}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconColor)} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              {badge && (
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', badge.cls)}>
                  {badge.label}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        {/* Footer — action + pagination */}
        {(action || hasPagination) && (
          <div className="flex items-center justify-between">
            {action ? (
              <button
                type="button"
                onClick={action.onClick}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {action.label}
              </button>
            ) : <div />}

            {hasPagination && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={currentPage === 1}
                  className="rounded p-0.5 hover:text-foreground disabled:opacity-30"
                  aria-label="Poprzedni"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="tabular-nums">{currentPage}/{totalPages}</span>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={currentPage === totalPages}
                  className="rounded p-0.5 hover:text-foreground disabled:opacity-30"
                  aria-label="Następny"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
AlertCard.displayName = 'AlertCard';

export { AlertCard, alertCardVariants };
