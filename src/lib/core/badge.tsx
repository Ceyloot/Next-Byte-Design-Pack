import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LiquidGlass } from './liquid-glass';
import { useUIStyle } from './ui-style-context';

const badgeVariants = cva(
  'inline-flex items-center gap-1 border font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:       'border-border bg-muted/60 text-foreground',
        primary:       'border-primary/40 bg-primary/10 text-primary',
        warning:       'border-accent/40 bg-accent/10 text-accent-foreground',
        destructive:   'border-destructive/40 bg-destructive/10 text-destructive',
        outline:       'border-border bg-transparent text-foreground',
        ghost:         'border-transparent bg-muted/40 text-muted-foreground',
        glass:         'nb-glass-static border-foreground/[0.14] text-foreground shadow-[var(--shadow-glass)]',
        glassmorphism: 'nb-glass-static border-white/20 text-white backdrop-blur-xl bg-white/10 shadow-lg',
        liquid:        'border border-white/20 text-white bg-transparent shadow-xl',
        'liquid-glass':'border border-white/25 text-white bg-transparent shadow-xl',
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

export type BadgeVariant = 'default' | 'primary' | 'warning' | 'destructive' | 'outline' | 'ghost' | 'glass' | 'glassmorphism' | 'liquid' | 'liquid-glass';

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
  ) => {
    const { styleMode } = useUIStyle();

    const isDefault = !variant || variant === 'default';
    const activeVariant = isDefault && styleMode === 'liquid' ? 'liquid-glass'
                        : isDefault && styleMode === 'glass' ? 'glassmorphism'
                        : variant;

    if (activeVariant === 'liquid-glass' || activeVariant === 'liquid') {
      return (
        <LiquidGlass inline mode="svg" depth={6} chromaticAberration={0} className={cn('inline-flex rounded-full', shape === 'square' && 'rounded-md')}>
          <span
            ref={ref}
            className={cn(badgeVariants({ variant: 'outline', size, shape }), 'bg-transparent border-0 text-white shadow-none', disabled && 'opacity-50 pointer-events-none', className)}
            {...props}
          >
            {dot && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
            {iconLeft}
            {children}
            {iconRight}
          </span>
        </LiquidGlass>
      );
    }

    if (activeVariant === 'glassmorphism') {
      return (
        <LiquidGlass inline mode="native" className={cn('inline-flex rounded-full', shape === 'square' && 'rounded-md')}>
          <span
            ref={ref}
            className={cn(badgeVariants({ variant: 'outline', size, shape }), 'bg-transparent border-0 text-white shadow-none', disabled && 'opacity-50 pointer-events-none', className)}
            {...props}
          >
            {dot && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
            {iconLeft}
            {children}
            {iconRight}
          </span>
        </LiquidGlass>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ variant: activeVariant, size, shape }),
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        {...props}
      >
        {dot && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
        {iconLeft}
        {children}
        {iconRight}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="hover:opacity-70 text-current text-xs ml-0.5 leading-none focus:outline-none"
          >
            ×
          </button>
        )}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
