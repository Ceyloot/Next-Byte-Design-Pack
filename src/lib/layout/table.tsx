import * as React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Context ─────────────────────────────────────────────── */
type TableVariant = 'default' | 'bordered' | 'ghost';
type TableSize = 'sm' | 'default' | 'lg';

const TableContext = React.createContext<{ variant: TableVariant; size: TableSize }>({
  variant: 'default', size: 'default',
});

const CELL_PADDING: Record<TableSize, string> = {
  sm:      'px-3 py-2',
  default: 'px-4 py-3',
  lg:      'px-5 py-4',
};

/* ── Table ───────────────────────────────────────────────── */
export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: TableVariant;
  size?: TableSize;
  stickyHeader?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'default', size = 'default', stickyHeader, ...props }, ref) => (
    <TableContext.Provider value={{ variant, size }}>
      <div className="w-full overflow-x-auto rounded-xl border border-border">
        <table
          ref={ref}
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  )
);
Table.displayName = 'Table';

/* ── TableHeader ─────────────────────────────────────────── */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-muted/40 border-b border-border', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

/* ── TableBody ───────────────────────────────────────────── */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

/* ── TableFooter ─────────────────────────────────────────── */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-border bg-muted/20 font-medium', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

/* ── TableRow ────────────────────────────────────────────── */
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  interactive?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, interactive, ...props }, ref) => {
    const { variant } = React.useContext(TableContext);
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-border transition-colors',
          variant === 'default' && 'even:bg-muted/20',
          variant === 'ghost'   && 'even:bg-transparent',
          interactive && 'cursor-pointer hover:bg-accent/10',
          selected && 'bg-primary/10 border-l-2 border-l-primary',
          className
        )}
        {...props}
      />
    );
  }
);
TableRow.displayName = 'TableRow';

/* ── TableHead ───────────────────────────────────────────── */
export type SortDirection = 'asc' | 'desc' | 'none';

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
  align?: 'left' | 'center' | 'right';
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection = 'none', onSort, align = 'left', children, ...props }, ref) => {
    const { size } = React.useContext(TableContext);
    const SortIcon =
      sortDirection === 'asc'  ? ChevronUp :
      sortDirection === 'desc' ? ChevronDown : ChevronsUpDown;

    return (
      <th
        ref={ref}
        className={cn(
          CELL_PADDING[size],
          'text-xs font-semibold text-muted-foreground text-left whitespace-nowrap',
          align === 'center' && 'text-center',
          align === 'right'  && 'text-right',
          sortable && 'cursor-pointer hover:text-foreground select-none',
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        {sortable ? (
          <span className="inline-flex items-center gap-1">
            {children}
            <SortIcon className={cn(
              'h-3.5 w-3.5 transition-opacity',
              sortDirection === 'none' ? 'opacity-30' : 'opacity-100',
            )} />
          </span>
        ) : children}
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

/* ── TableCell ───────────────────────────────────────────── */
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = 'left', ...props }, ref) => {
    const { size, variant } = React.useContext(TableContext);
    return (
      <td
        ref={ref}
        className={cn(
          CELL_PADDING[size],
          'text-sm text-foreground',
          align === 'center' && 'text-center',
          align === 'right'  && 'text-right',
          variant === 'bordered' && 'border-r border-border last:border-r-0',
          className
        )}
        {...props}
      />
    );
  }
);
TableCell.displayName = 'TableCell';

/* ── TableCaption ────────────────────────────────────────── */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-3 text-xs text-muted-foreground', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table, TableHeader, TableBody, TableFooter,
  TableRow, TableHead, TableCell, TableCaption,
};
