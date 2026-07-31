import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface MasonryItem {
  id: string;
  src?: string;
  alt?: string;
  caption?: string;
  placeholder?: ReactNode;
  span?: 1 | 2;
  aspectRatio?: number;
}

export interface MasonryGridProps {
  items: MasonryItem[];
  columns?: 2 | 3 | 4;
  gap?: number;
  glass?: boolean;
  onItemClick?: (item: MasonryItem) => void;
  className?: string;
}

function MasonryItemCard({ item, glass, onClick }: { item: MasonryItem; glass?: boolean; onClick?: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const ratio = item.aspectRatio ?? (Math.random() > 0.5 ? 1 : Math.random() > 0.5 ? 1.33 : 0.75);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/40',
        glass ? 'nb-glass-static' : 'bg-muted/20',
        'cursor-pointer transition-all duration-200 hover:border-border hover:shadow-uniesiona',
        item.span === 2 && 'col-span-2',
      )}
      style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
    >
      <div className="absolute inset-0">
        {item.src ? (
          <img
            src={item.src}
            alt={item.alt ?? ''}
            onLoad={() => setLoaded(true)}
            className={cn('w-full h-full object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
          />
        ) : (
          item.placeholder ?? <div className="w-full h-full bg-muted/40 flex items-center justify-center text-2xl opacity-30">🖼️</div>
        )}

        {/* Overlay */}
        {item.caption && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <p className="text-[11px] text-white font-medium leading-snug">{item.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function MasonryGrid({ items, columns = 3, gap = 8, glass, onItemClick, className }: MasonryGridProps) {
  const colClass = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns];

  return (
    <div
      className={cn('grid', colClass, className)}
      style={{ gap: `${gap}px` }}
    >
      {items.map(item => (
        <MasonryItemCard key={item.id} item={item} glass={glass} onClick={() => onItemClick?.(item)} />
      ))}
    </div>
  );
}
