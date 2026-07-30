import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  [
    'w-full rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60',
    'transition-all duration-150 outline-none resize-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
  ],
  {
    variants: {
      variant: {
        default: 'border border-border/60 bg-input/40 hover:border-border focus-visible:border-primary/60',
        ghost:   'border border-transparent bg-transparent hover:bg-muted/30 focus-visible:bg-muted/20 focus-visible:border-primary/40',
        glass:   'nb-glass-static border-foreground/[0.14] hover:border-primary/35',
        error:   'border border-destructive/60 bg-destructive/5 focus-visible:border-destructive',
        success: 'border border-primary/50 bg-primary/5 focus-visible:border-primary',
      },
      size: {
        sm:      'px-3 py-2 text-xs min-h-[72px]',
        default: 'px-3.5 py-2.5 min-h-[96px]',
        lg:      'px-4 py-3 text-base min-h-[120px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, autoResize = false, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      onChange?.(e);
    };
    return (
      <textarea
        ref={ref}
        className={cn(textareaVariants({ variant, size }), className)}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
