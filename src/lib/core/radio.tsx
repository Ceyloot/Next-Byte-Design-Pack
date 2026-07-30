import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />
));
RadioGroup.displayName = 'RadioGroup';

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label?: string;
  description?: string;
  size?: 'sm' | 'default' | 'lg';
}

const sizeMap = {
  sm:      { outer: 'h-3.5 w-3.5', inner: 'h-1.5 w-1.5' },
  default: { outer: 'h-4 w-4',     inner: 'h-2 w-2'     },
  lg:      { outer: 'h-5 w-5',     inner: 'h-2.5 w-2.5' },
};

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, label, description, size = 'default', id, ...props }, ref) => {
  const generatedId = React.useId();
  const innerId = id ?? generatedId;
  const S = sizeMap[size];
  return (
    <div className="flex items-start gap-2.5">
      <RadioGroupPrimitive.Item
        ref={ref}
        id={innerId}
        className={cn(
          S.outer,
          'shrink-0 mt-0.5 rounded-full border-2 border-border bg-transparent transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:border-primary',
          'hover:border-primary/60',
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <div className={cn(S.inner, 'rounded-full bg-primary')} />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label htmlFor={innerId} className="text-sm font-medium text-foreground cursor-pointer select-none leading-tight">
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
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
