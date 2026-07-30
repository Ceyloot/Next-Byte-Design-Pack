import * as React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator, maxItems, className, ...props }, ref) => {
    const sep = separator ?? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />;

    let visible = items;
    if (maxItems && items.length > maxItems) {
      const keep = Math.max(1, Math.floor(maxItems / 2));
      const head = items.slice(0, keep);
      const tail = items.slice(items.length - keep);
      visible = [
        ...head,
        { label: '…', icon: <MoreHorizontal className="h-3.5 w-3.5" /> },
        ...tail,
      ];
    }

    return (
      <nav ref={ref} aria-label="Breadcrumb" className={cn('flex items-center', className)} {...props}>
        <ol className="flex items-center gap-1.5 flex-wrap">
          {visible.map((item, i) => {
            const isLast = i === visible.length - 1;
            const isEllipsis = item.label === '…';
            return (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && sep}
                {isLast || isEllipsis ? (
                  <span className={cn(
                    'flex items-center gap-1 text-sm',
                    isLast ? 'font-medium text-foreground' : 'text-muted-foreground/50'
                  )}>
                    {item.icon}{item.label}
                  </span>
                ) : (
                  <a
                    href={item.href ?? '#'}
                    onClick={e => !item.href && e.preventDefault()}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.icon}{item.label}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

export { Breadcrumb };
