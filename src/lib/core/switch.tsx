import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const trackVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
    'transition-all duration-200 outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted',
  ],
  {
    variants: {
      size: {
        sm:      'h-4 w-7',
        default: 'h-5 w-9',
        lg:      'h-6 w-11',
      },
    },
    defaultVariants: { size: 'default' },
  }
);

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform duration-200',
  {
    variants: {
      size: {
        sm:      'h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0',
        default: 'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        lg:      'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: { size: 'default' },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof trackVariants> {
  label?: string;
  description?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, label, description, id, ...props }, ref) => {
  const innerId = id ?? React.useId();
  return (
    <div className="flex items-center gap-3">
      <SwitchPrimitive.Root
        ref={ref}
        id={innerId}
        className={cn(trackVariants({ size }), className)}
        {...props}
      >
        <SwitchPrimitive.Thumb className={thumbVariants({ size })} />
      </SwitchPrimitive.Root>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label htmlFor={innerId} className="text-sm font-medium text-foreground cursor-pointer select-none">
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </div>
  );
});
Switch.displayName = 'Switch';

export { Switch };
