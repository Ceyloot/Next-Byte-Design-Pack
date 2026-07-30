import * as React from 'react';
import { cn } from '@/lib/utils';

const COLOR_MAP = {
  primary:     { filled: 'bg-primary',      empty: 'bg-primary/15' },
  success:     { filled: 'bg-emerald-500',  empty: 'bg-emerald-500/15' },
  warning:     { filled: 'bg-amber-500',    empty: 'bg-amber-500/15' },
  destructive: { filled: 'bg-destructive',  empty: 'bg-destructive/15' },
} as const;

const SIZE_MAP = {
  sm:      { w: 'w-[6px]', h: 'h-[15px]', gap: 'gap-[2px]' },
  default: { w: 'w-[7px]', h: 'h-[17px]', gap: 'gap-[3px]' },
  lg:      { w: 'w-[9px]', h: 'h-[21px]', gap: 'gap-[3px]' },
} as const;

export interface MetricBarProps {
  label: string;
  value: number;
  max?: number;
  color?: keyof typeof COLOR_MAP;
  size?: keyof typeof SIZE_MAP;
  showLabel?: boolean;
  showValue?: boolean;
  className?: string;
}

const MetricBar = React.forwardRef<HTMLDivElement, MetricBarProps>(
  ({ label, value, max = 10, color = 'success', size = 'default', showLabel = true, showValue = false, className }, ref) => {
    const clamped = Math.max(0, Math.min(value, max));
    const { filled, empty } = COLOR_MAP[color];
    const { w, h, gap } = SIZE_MAP[size];

    return (
      <div ref={ref} className={cn('flex flex-col gap-1.5', className)}>
        {(showLabel || showValue) && (
          <div className="flex items-center justify-between">
            {showLabel && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
            )}
            {showValue && (
              <span className="text-[10px] font-mono text-muted-foreground">
                {clamped}/{max}
              </span>
            )}
          </div>
        )}
        <div className={cn('flex items-end', gap)}>
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-[2px] transition-colors shrink-0',
                w, h,
                i < clamped ? filled : empty
              )}
            />
          ))}
        </div>
      </div>
    );
  }
);
MetricBar.displayName = 'MetricBar';

export { MetricBar };
