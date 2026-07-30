import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const trackVariants = cva('relative w-full overflow-hidden rounded-full bg-muted', {
  variants: {
    size: {
      xs:      'h-1',
      sm:      'h-1.5',
      default: 'h-2.5',
      lg:      'h-4',
    },
  },
  defaultVariants: { size: 'default' },
});

const indicatorVariants = cva('h-full rounded-full transition-all duration-500 ease-out', {
  variants: {
    color: {
      primary:     'bg-primary',
      success:     'bg-emerald-500',
      warning:     'bg-amber-500',
      destructive: 'bg-destructive',
      gradient:    'bg-gradient-to-r from-primary to-primary/60',
    },
    animated: {
      true:  'relative overflow-hidden after:absolute after:inset-y-0 after:left-0 after:w-1/2 after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent',
      false: '',
    },
  },
  defaultVariants: { color: 'primary', animated: false },
});

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof trackVariants>,
    VariantProps<typeof indicatorVariants> {
  value?: number;
  label?: string;
  showValue?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, size, color, animated, label, showValue, ...props }, ref) => (
  <div className="w-full flex flex-col gap-1.5">
    {(label || showValue) && (
      <div className="flex items-center justify-between">
        {label && <span className="text-xs font-medium text-foreground">{label}</span>}
        {showValue && <span className="text-xs font-mono text-muted-foreground">{Math.round(value)}%</span>}
      </div>
    )}
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      className={cn(trackVariants({ size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(indicatorVariants({ color, animated }))}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </ProgressPrimitive.Root>
  </div>
));
Progress.displayName = 'Progress';

export { Progress };
