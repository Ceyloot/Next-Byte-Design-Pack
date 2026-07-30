import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const separatorVariants = cva('shrink-0', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical:   'h-full w-px',
    },
    variant: {
      solid:       'bg-border',
      dashed:      'bg-transparent border-dashed',
      dotted:      'bg-transparent border-dotted',
      gradient:    'bg-transparent',
      primary:     'bg-primary/30',
      destructive: 'bg-destructive/30',
    },
  },
  defaultVariants: { orientation: 'horizontal', variant: 'solid' },
});

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {
  label?: React.ReactNode;
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation = 'horizontal', variant = 'solid', label, decorative = true, ...props }, ref) => {
  const isHorizontal = orientation === 'horizontal';

  const lineClass = cn(
    separatorVariants({ orientation, variant }),
    variant === 'gradient' && isHorizontal &&
      'bg-gradient-to-r from-transparent via-border to-transparent',
    variant === 'gradient' && !isHorizontal &&
      'bg-gradient-to-b from-transparent via-border to-transparent',
    variant === 'dashed' && isHorizontal &&
      'h-0 border-t border-dashed border-border bg-transparent',
    variant === 'dashed' && !isHorizontal &&
      'w-0 border-l border-dashed border-border bg-transparent',
    variant === 'dotted' && isHorizontal &&
      'h-0 border-t border-dotted border-border bg-transparent',
    variant === 'dotted' && !isHorizontal &&
      'w-0 border-l border-dotted border-border bg-transparent',
    className
  );

  if (label && isHorizontal) {
    return (
      <div className="flex items-center gap-3 w-full" role="separator">
        <div className={cn(lineClass, "w-auto flex-1")} />
        <span className="shrink-0 text-xs text-muted-foreground">
          {label}
        </span>
        <div className={cn(lineClass, "w-auto flex-1")} />
      </div>
    );
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={lineClass}
      {...props}
    />
  );
});
Separator.displayName = 'Separator';

export { Separator, separatorVariants };
