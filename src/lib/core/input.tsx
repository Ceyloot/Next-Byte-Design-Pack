import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LiquidGlass } from './liquid-glass';
import { useUIStyle } from './ui-style-context';

const inputVariants = cva(
  [
    'flex w-full rounded-xl border text-sm text-foreground',
    'placeholder:text-muted-foreground',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'read-only:cursor-default read-only:opacity-75',
  ],
  {
    variants: {
      variant: {
        default:       'border-border bg-input hover:border-border/80',
        ghost:         'border-transparent bg-transparent hover:bg-muted/40',
        error:         'border-destructive/60 bg-destructive/[0.04] focus-visible:ring-destructive',
        success:       'border-primary/60 bg-primary/[0.04] focus-visible:ring-primary',
        glass:         'nb-glass-static border-foreground/[0.14] hover:border-primary/35',
        glassmorphism: 'border-white/20 bg-white/5 text-white backdrop-blur-xl hover:border-white/40',
        liquid:        'border-white/25 bg-transparent text-white hover:border-white/45',
        'liquid-glass':'border-white/20 bg-transparent text-white hover:border-white/40',
        nextbyte:      'border-primary/60 bg-primary/[0.03] text-foreground focus-visible:ring-primary/50',
        gradient:      'border-border bg-gradient-to-r from-card/30 to-muted/20 hover:border-primary/40',
        secondary:     'border-border bg-secondary/30 text-secondary-foreground hover:bg-secondary/50',
        destructive:   'border-destructive/60 bg-destructive/[0.04] text-destructive focus-visible:ring-destructive',
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

export type InputVariant = 'default' | 'ghost' | 'error' | 'success' | 'glass' | 'glassmorphism' | 'liquid' | 'liquid-glass';
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
    const { styleMode } = useUIStyle();
    
    const isDefault = !variant || variant === 'default';
    const activeVariant = isDefault && styleMode === 'liquid' ? 'liquid-glass'
                        : isDefault && styleMode === 'glass' ? 'glassmorphism'
                        : variant;

    const hasWrapper = iconLeft || iconRight || prefix || suffix;
    
    const inputEl = (
      <input
        ref={ref}
        className={cn(
          inputVariants({ variant: activeVariant, size }),
          hasWrapper && 'flex-1 border-0 bg-transparent ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none',
          (activeVariant === 'liquid-glass' || activeVariant === 'liquid' || activeVariant === 'glassmorphism') && 'bg-transparent text-white',
          className
        )}
        {...props}
      />
    );

    if (!hasWrapper) {
      if (activeVariant === 'liquid-glass' || activeVariant === 'liquid') {
        return (
          <LiquidGlass mode="svg" depth={8} chromaticAberration={0} className="rounded-xl w-full">
            {inputEl}
          </LiquidGlass>
        );
      }
      if (activeVariant === 'glassmorphism') {
        return (
          <LiquidGlass mode="native" className="rounded-xl w-full">
            {inputEl}
          </LiquidGlass>
        );
      }
      return inputEl;
    }

    const wrapperContent = (
      <div
        className={cn(
          inputVariants({ variant: activeVariant, size }),
          'flex items-center gap-0 p-0 overflow-hidden w-full',
          (activeVariant === 'liquid-glass' || activeVariant === 'liquid' || activeVariant === 'glassmorphism') && 'bg-transparent border-0 shadow-none',
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

    if (activeVariant === 'liquid-glass' || activeVariant === 'liquid') {
      return (
        <LiquidGlass mode="svg" depth={8} chromaticAberration={0} className="rounded-xl w-full">
          {wrapperContent}
        </LiquidGlass>
      );
    }

    if (activeVariant === 'glassmorphism') {
      return (
        <LiquidGlass mode="native" className="rounded-xl w-full">
          {wrapperContent}
        </LiquidGlass>
      );
    }

    return wrapperContent;
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
