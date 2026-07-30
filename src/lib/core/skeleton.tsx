import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ── Variants ────────────────────────────────────────────── */
const skeletonVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-muted animate-pulse',
      shimmer: [
        'bg-muted overflow-hidden relative',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.06] before:to-transparent',
        'before:translate-x-[-100%] before:animate-[shimmer_1.5s_infinite]',
      ],
    },
    shape: {
      line:   'h-4 w-full rounded-md',
      circle: 'rounded-full',
      card:   'rounded-2xl',
      button: 'h-10 rounded-xl',
      badge:  'h-5 rounded-full',
    },
  },
  defaultVariants: { variant: 'default', shape: 'line' },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', shape = 'line', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(skeletonVariants({ variant, shape }), className)}
      aria-hidden="true"
      {...props}
    />
  )
);
Skeleton.displayName = 'Skeleton';

/* ── SkeletonText ────────────────────────────────────────── */
export interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
  variant?: SkeletonProps['variant'];
  className?: string;
}

const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3, lastLineWidth = '60%', variant = 'default', className,
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        variant={variant}
        shape="line"
        style={i === lines - 1 ? { width: lastLineWidth } : undefined}
      />
    ))}
  </div>
);

/* ── SkeletonTile ────────────────────────────────────────── */
export interface SkeletonTileProps {
  variant?: SkeletonProps['variant'];
  className?: string;
}

const SkeletonTile: React.FC<SkeletonTileProps> = ({ variant = 'default', className }) => (
  <div className={cn(
    'rounded-2xl border border-border bg-card p-5 flex flex-col gap-4',
    'shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.28),inset_0_1px_0_0_rgb(255_255_255/0.06)]',
    className
  )}>
    {/* header */}
    <div className="flex items-center gap-2.5">
      <Skeleton variant={variant} shape="circle" className="h-8 w-8 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton variant={variant} shape="line" className="h-3.5 w-2/3" />
        <Skeleton variant={variant} shape="line" className="h-3 w-1/2" />
      </div>
      <Skeleton variant={variant} shape="badge" className="h-5 w-12 shrink-0" />
    </div>
    {/* rows */}
    <div className="space-y-2">
      <Skeleton variant={variant} shape="line" className="h-9 rounded-xl" />
      <Skeleton variant={variant} shape="line" className="h-9 rounded-xl" />
    </div>
    {/* footer */}
    <div className="flex gap-2">
      <Skeleton variant={variant} shape="button" className="h-9 w-24" />
      <Skeleton variant={variant} shape="button" className="h-9 w-20" />
    </div>
  </div>
);

export { Skeleton, SkeletonText, SkeletonTile, skeletonVariants };
