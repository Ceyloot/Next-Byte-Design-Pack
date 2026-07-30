import * as React from 'react';
import { Plus } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const quickNavItemVariants = cva(
  'flex flex-col items-center justify-center gap-2 rounded-2xl border transition-colors cursor-pointer select-none',
  {
    variants: {
      size: {
        sm:      'h-16 w-16 p-2',
        default: 'h-20 w-20 p-3',
        lg:      'h-24 w-24 p-4',
      },
      state: {
        filled: 'border-border bg-card hover:border-primary/40 hover:bg-muted/60',
        empty:  'border-dashed border-border bg-transparent hover:border-primary/40 hover:bg-muted/30',
      },
    },
    defaultVariants: { size: 'default', state: 'filled' },
  }
);

export interface QuickNavItemData {
  id?: string;
  icon?: React.ReactNode;
  label?: string;
  sublabel?: string;
  onClick?: () => void;
}

export interface QuickNavItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof quickNavItemVariants> {
  item?: QuickNavItemData;
  empty?: boolean;
  emptyLabel?: string;
}

const QuickNavItem = React.forwardRef<HTMLButtonElement, QuickNavItemProps>(
  ({ className, size, item, empty, emptyLabel = 'Dodaj skrót', onClick, ...props }, ref) => {
    if (empty) {
      return (
        <button
          ref={ref}
          type="button"
          onClick={onClick ?? item?.onClick}
          className={cn(quickNavItemVariants({ size, state: 'empty' }), className)}
          {...props}
        >
          <Plus className="h-4 w-4 text-muted-foreground/50" />
          {emptyLabel && (
            <span className="text-center text-[10px] leading-tight text-muted-foreground/50">{emptyLabel}</span>
          )}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick ?? item?.onClick}
        className={cn(quickNavItemVariants({ size, state: 'filled' }), className)}
        {...props}
      >
        {item?.icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
            {item.icon}
          </div>
        )}
        {item?.label && (
          <div className="text-center">
            <p className="text-[10px] font-medium leading-tight text-foreground line-clamp-1">{item.label}</p>
            {item.sublabel && (
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{item.sublabel}</p>
            )}
          </div>
        )}
      </button>
    );
  }
);
QuickNavItem.displayName = 'QuickNavItem';

/* ── QuickNav ────────────────────────────────────────────── */
export interface QuickNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: QuickNavItemData[];
  slots?: number;
  size?: VariantProps<typeof quickNavItemVariants>['size'];
  title?: string;
  onAddSlot?: () => void;
  onEdit?: () => void;
}

const QuickNav: React.FC<QuickNavProps> = ({
  items,
  slots = 6,
  size = 'default',
  title,
  onAddSlot,
  onEdit,
  className,
  ...props
}) => {
  const emptyCount = Math.max(0, slots - items.length);

  return (
    <div className={cn('space-y-3', className)} {...props}>
      {(title || onEdit) && (
        <div className="flex items-center justify-between">
          {title && <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Edytuj
            </button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {items.map((item, i) => (
          <QuickNavItem key={item.id ?? i} size={size} item={item} />
        ))}
        {Array.from({ length: emptyCount }, (_, i) => (
          <QuickNavItem key={`empty-${i}`} size={size} empty onClick={onAddSlot} />
        ))}
      </div>
    </div>
  );
};

export { QuickNav, QuickNavItem, quickNavItemVariants };
