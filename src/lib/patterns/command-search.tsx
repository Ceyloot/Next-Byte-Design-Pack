import * as React from 'react';
import { Search } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const commandSearchVariants = cva(
  [
    'flex w-full items-center gap-3 rounded-xl border border-border bg-input',
    'text-sm text-muted-foreground cursor-pointer select-none',
    'transition-colors hover:border-primary/40 hover:bg-muted/60',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  ],
  {
    variants: {
      size: {
        sm:      'h-8  px-3 text-xs',
        default: 'h-10 px-4',
        lg:      'h-12 px-5 text-base',
      },
    },
    defaultVariants: { size: 'default' },
  }
);

export interface CommandSearchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof commandSearchVariants> {
  placeholder?: string;
  shortcut?: string;
  onOpen?: () => void;
}

const CommandSearch = React.forwardRef<HTMLButtonElement, CommandSearchProps>(
  ({
    className,
    size,
    placeholder = 'Szukaj w notatkach, zadaniach, kalendarzu…',
    shortcut = '⌘K',
    onOpen,
    onClick,
    ...props
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onOpen?.();
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={false}
        aria-haspopup="listbox"
        onClick={handleClick}
        className={cn(commandSearchVariants({ size }), className)}
        {...props}
      >
        <Search className={cn('shrink-0 text-muted-foreground', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        <span className="flex-1 truncate text-left">{placeholder}</span>
        {shortcut && (
          <kbd className="pointer-events-none hidden select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);
CommandSearch.displayName = 'CommandSearch';

export { CommandSearch, commandSearchVariants };
