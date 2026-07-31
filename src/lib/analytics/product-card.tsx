import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface ProductCardProps {
  title: string;
  price: number;
  currency?: string;
  priceAlt?: string;
  badge?: string;
  cover?: ReactNode;
  coverColor?: string;
  actionLabel?: string;
  onClick?: () => void;
  onAction?: () => void;
  className?: string;
}

export function ProductCard({
  title, price, currency = 'zł', priceAlt, badge, cover, coverColor = 'hsl(var(--primary)/0.15)',
  actionLabel = 'Zobacz →', onClick, onAction, className,
}: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden cursor-pointer',
        'hover:border-border hover:shadow-uniesiona transition-all duration-200',
        className,
      )}
    >
      {/* Cover */}
      <div
        className="relative h-44 flex items-center justify-center overflow-hidden"
        style={{ background: coverColor }}
      >
        {badge && (
          <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded-full z-10">
            {badge}
          </span>
        )}
        {cover ?? (
          <div className="h-20 w-20 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm flex items-center justify-center">
            <span className="text-3xl opacity-50">📦</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm font-bold text-primary">
              {price} <span className="text-[10px] font-medium text-muted-foreground/60">◈</span>
            </span>
            {priceAlt && (
              <span className="text-xs text-muted-foreground">{priceAlt}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onAction?.(); }}
          className="shrink-0 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
