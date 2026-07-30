import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const sizeMap = {
  sm:      { box: 'h-3.5 w-3.5 rounded', icon: 'h-2.5 w-2.5' },
  default: { box: 'h-4 w-4 rounded-[5px]', icon: 'h-3 w-3' },
  lg:      { box: 'h-5 w-5 rounded-md', icon: 'h-3.5 w-3.5' },
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, description, indeterminate, size = 'default', id, ...props }, ref) => {
  const generatedId = React.useId();
  const innerId = id ?? generatedId;
  const S = sizeMap[size];
  return (
    <div className="flex items-start gap-2.5">
      <CheckboxPrimitive.Root
        ref={ref}
        id={innerId}
        checked={indeterminate ? 'indeterminate' : props.checked}
        className={cn(
          S.box,
          'shrink-0 mt-0.5 border-2 border-border bg-transparent transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
          'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
          'hover:border-primary/60',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-primary-foreground">
          {indeterminate
            ? <Minus className={S.icon} strokeWidth={3} />
            : <Check className={S.icon} strokeWidth={3} />
          }
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
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
Checkbox.displayName = 'Checkbox';

export { Checkbox };
