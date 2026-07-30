import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'default' | 'lg';
}

const sizeMap = {
  sm:      { icon: 'h-10 w-10 mb-3 text-muted-foreground/40', iconWrap: 'p-2.5 rounded-xl', title: 'text-sm font-semibold', desc: 'text-xs', gap: 'gap-2', pad: 'py-8 px-4' },
  default: { icon: 'h-12 w-12 mb-4 text-muted-foreground/40', iconWrap: 'p-3 rounded-2xl',  title: 'text-base font-semibold', desc: 'text-sm', gap: 'gap-2.5', pad: 'py-12 px-6' },
  lg:      { icon: 'h-16 w-16 mb-5 text-muted-foreground/40', iconWrap: 'p-4 rounded-2xl',  title: 'text-lg font-semibold', desc: 'text-sm', gap: 'gap-3', pad: 'py-16 px-8' },
};

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, size = 'default', className, ...props }, ref) => {
    const S = sizeMap[size];
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center text-center', S.pad, S.gap, className)}
        {...props}
      >
        {icon && (
          <div className={cn('flex items-center justify-center bg-muted/50 border border-border/40', S.iconWrap)}>
            <span className={S.icon}>{icon}</span>
          </div>
        )}
        <div className={cn('flex flex-col items-center', size === 'sm' ? 'gap-1' : 'gap-1.5')}>
          <p className={cn(S.title, 'text-foreground')}>{title}</p>
          {description && <p className={cn(S.desc, 'text-muted-foreground max-w-xs')}>{description}</p>}
        </div>
        {action && <div className="mt-1">{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export { EmptyState };
