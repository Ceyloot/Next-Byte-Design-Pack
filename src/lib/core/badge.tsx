import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 border font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'border-border bg-muted/60 text-foreground',
        primary:     'border-primary/40 bg-primary/10 text-primary',
        warning:     'border-accent/40 bg-accent/10 text-accent-foreground',
        destructive: 'border-destructive/40 bg-destructive/10 text-destructive',
        outline:     'border-border bg-transparent text-foreground',
        ghost:       'border-transparent bg-muted/40 text-muted-foreground',
      },
      size: {
        sm:      'px-1.5 py-0 text-[10px]',
        default: 'px-2 py-0.5 text-xs',
        lg:      'px-2.5 py-1 text-sm',
      },
      shape: {
        rounded: 'rounded-full',
        square:  'rounded-md',
      },
    },
    defaultVariants: { variant: 'default', size: 'default', shape: 'rounded' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  /** Animowana kropka statusu po lewej */
  dot?: boolean;
  /** Callback gdy kliknięto ikonę usunięcia po prawej */
  onRemove?: () => void;
  disabled?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className, variant, size, shape, iconLeft, iconRight,
      dot, onRemove, disabled, children, ...props
    },
    ref
  ) => (
    <span
      ref={ref}
      className={cn(
        badgeVariants({ variant, size, shape }),
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full shrink-0',
            variant === 'primary'     && 'bg-primary animate-pulse',
            variant === 'warning'     && 'bg-accent-foreground',
            variant === 'destructive' && 'bg-destructive',
            (!variant || variant === 'default' || variant === 'outline' || variant === 'ghost') && 'bg-muted-foreground',
          )}
        />
      )}
      {iconLeft && <span className="shrink-0 [&_svg]:h-3 [&_svg]:w-3">{iconLeft}</span>}
      {children}
      {iconRight && !onRemove && (
        <span className="shrink-0 [&_svg]:h-3 [&_svg]:w-3">{iconRight}</span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="shrink-0 rounded-full opacity-60 hover:opacity-100 transition-opacity ml-0.5"
          aria-label="Usuń"
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </span>
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
