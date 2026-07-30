import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'flex w-full rounded-xl border bg-input text-sm text-foreground',
    'placeholder:text-muted-foreground',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'read-only:cursor-default read-only:opacity-75',
  ],
  {
    variants: {
      variant: {
        default: 'border-border bg-input hover:border-border/80',
        ghost:   'border-transparent bg-transparent hover:bg-muted/40',
        error:   'border-destructive/60 bg-destructive/[0.04] focus-visible:ring-destructive',
        success: 'border-primary/60 bg-primary/[0.04] focus-visible:ring-primary',
        glass:   'nb-glass-static border-foreground/[0.14] hover:border-primary/35',
      },
      size: {
        sm:      'h-8 px-2.5 text-xs',
        default: 'h-10 px-3 text-sm',
        lg:      'h-12 px-4 text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export type InputVariant = 'default' | 'ghost' | 'error' | 'success' | 'glass';
export type InputSize = 'sm' | 'default' | 'lg';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, iconLeft, iconRight, prefix, suffix, ...props }, ref) => {
    const hasWrapper = iconLeft || iconRight || prefix || suffix;
    const inputEl = (
      <input
        ref={ref}
        className={cn(
          inputVariants({ variant, size }),
          hasWrapper && 'flex-1 border-0 bg-transparent ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none',
          className
        )}
        {...props}
      />
    );

    if (!hasWrapper) return inputEl;

    return (
      <div
        className={cn(
          inputVariants({ variant, size }),
          'flex items-center gap-0 p-0 overflow-hidden',
          className
        )}
      >
        {prefix && (
          <span className="flex h-full items-center border-r border-border bg-muted/40 px-3 text-xs text-muted-foreground shrink-0">
            {prefix}
          </span>
        )}
        {iconLeft && (
          <span className="flex items-center pl-3 text-muted-foreground shrink-0">{iconLeft}</span>
        )}
        {inputEl}
        {iconRight && (
          <span className="flex items-center pr-3 text-muted-foreground shrink-0">{iconRight}</span>
        )}
        {suffix && (
          <span className="flex h-full items-center border-l border-border bg-muted/40 px-3 text-xs text-muted-foreground shrink-0">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ── InputLabel ───────────────────────────────────────────── */
export interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const InputLabel = React.forwardRef<HTMLLabelElement, InputLabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('mb-1.5 block text-sm font-medium text-foreground', className)}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </label>
  )
);
InputLabel.displayName = 'InputLabel';

/* ── InputMessage ─────────────────────────────────────────── */
export interface InputMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'error' | 'success';
}

const InputMessage = React.forwardRef<HTMLParagraphElement, InputMessageProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'mt-1.5 text-xs',
        variant === 'default' && 'text-muted-foreground',
        variant === 'error'   && 'text-destructive',
        variant === 'success' && 'text-primary',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
);
InputMessage.displayName = 'InputMessage';

/* ── InputGroup ───────────────────────────────────────────── */
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  message?: string;
  messageVariant?: InputMessageProps['variant'];
}

const InputGroup: React.FC<InputGroupProps> = ({
  label, required, message, messageVariant = 'default', className, children, ...props
}) => (
  <div className={cn('flex flex-col', className)} {...props}>
    {label && <InputLabel required={required}>{label}</InputLabel>}
    {children}
    {message && <InputMessage variant={messageVariant}>{message}</InputMessage>}
  </div>
);

export { Input, InputGroup, InputLabel, InputMessage, inputVariants };
