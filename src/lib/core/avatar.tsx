import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { User } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ── Variants ────────────────────────────────────────────── */
const avatarVariants = cva('relative inline-flex shrink-0 overflow-hidden', {
  variants: {
    size: {
      xs:      'h-6 w-6',
      sm:      'h-8 w-8',
      default: 'h-10 w-10',
      lg:      'h-12 w-12',
      xl:      'h-16 w-16',
      '2xl':   'h-20 w-20',
    },
    shape: {
      circle: 'rounded-full',
      square: 'rounded-xl',
    },
  },
  defaultVariants: { size: 'default', shape: 'circle' },
});

const fallbackTextSize: Record<string, string> = {
  xs:      'text-[9px]',
  sm:      'text-xs',
  default: 'text-sm',
  lg:      'text-base',
  xl:      'text-xl',
  '2xl':   'text-2xl',
};

const statusColors: Record<string, string> = {
  online:  'bg-primary',
  offline: 'bg-muted-foreground',
  busy:    'bg-destructive',
  away:    'bg-accent-foreground',
};

const statusSize: Record<string, string> = {
  xs:      'h-1.5 w-1.5 border',
  sm:      'h-2 w-2 border',
  default: 'h-2.5 w-2.5 border',
  lg:      'h-3 w-3 border',
  xl:      'h-3.5 w-3.5 border-2',
  '2xl':   'h-4 w-4 border-2',
};

export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: AvatarStatus;
}

/* ── Avatar ──────────────────────────────────────────────── */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = 'default', shape = 'circle', src, alt, fallback, status, ...props }, ref) => {
  const sizeKey = size ?? 'default';
  const initials = fallback
    ? fallback.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <div className="relative inline-flex">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, shape }), className)}
        {...props}
      >
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={alt ?? fallback ?? ''}
            className="h-full w-full object-cover"
          />
        )}
        <AvatarPrimitive.Fallback
          className={cn(
            'flex h-full w-full items-center justify-center bg-muted',
            fallbackTextSize[sizeKey] ?? 'text-sm',
            'font-semibold text-muted-foreground select-none',
          )}
        >
          {initials || <User className="h-[40%] w-[40%]" />}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-card',
            statusColors[status],
            statusSize[sizeKey],
          )}
          aria-label={status}
        />
      )}
    </div>
  );
});
Avatar.displayName = 'Avatar';

/* ── AvatarImage / AvatarFallback (raw) ──────────────────── */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center bg-muted text-sm font-semibold text-muted-foreground',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

/* ── AvatarGroup ─────────────────────────────────────────── */
export interface AvatarGroupProps {
  avatars: Array<{ src?: string; fallback?: string; alt?: string }>;
  max?: number;
  size?: AvatarProps['size'];
  shape?: AvatarProps['shape'];
  className?: string;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars, max = 4, size = 'default', shape = 'circle', className,
}) => {
  const shown = avatars.slice(0, max);
  const rest = avatars.length - max;

  return (
    <div className={cn('flex items-center', className)}>
      {shown.map((a, i) => (
        <div key={i} className="-ml-2 first:ml-0 ring-2 ring-background rounded-full">
          <Avatar {...a} size={size} shape={shape} />
        </div>
      ))}
      {rest > 0 && (
        <div className={cn(
          '-ml-2 ring-2 ring-background rounded-full flex items-center justify-center bg-muted',
          avatarVariants({ size, shape }),
          fallbackTextSize[size ?? 'default'],
          'font-semibold text-muted-foreground',
        )}>
          +{rest}
        </div>
      )}
    </div>
  );
};

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, avatarVariants };
