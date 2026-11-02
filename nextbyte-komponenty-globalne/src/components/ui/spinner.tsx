import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  'animate-spin',
  {
    variants: {
      variant: {
        default: 'rounded-full border-b-2 border-brand-primary',
        icon: 'text-brand-primary',
        light: 'rounded-full border-b-2 border-white',
        secondary: 'rounded-full border-b-2 border-secondary',
      },
      size: {
        sm: 'h-4 w-4',
        default: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Use icon variant (Loader2 from lucide-react) instead of border spinner
   */
  useIcon?: boolean;
}

/**
 * Spinner component for loading states
 * 
 * @example
 * // Default border spinner
 * <Spinner />
 * 
 * @example
 * // Small icon spinner
 * <Spinner variant="icon" size="sm" useIcon />
 * 
 * @example
 * // Large light spinner
 * <Spinner variant="light" size="lg" />
 * 
 * @example
 * // With custom className
 * <Spinner className="mx-auto my-4" />
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, variant, size, useIcon = false, ...props }, ref) => {
    if (useIcon) {
      return (
        <Loader2
          className={cn(spinnerVariants({ variant: 'icon', size }), className)}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';
