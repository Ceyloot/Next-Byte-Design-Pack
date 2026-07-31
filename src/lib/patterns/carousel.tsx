import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface CarouselProps {
  items: ReactNode[];
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  loop?: boolean;
  className?: string;
}

export function Carousel({
  items, autoplay = false, interval = 4000,
  showDots = true, showArrows = true, loop = true, className,
}: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = items.length;

  const go = useCallback((idx: number) => {
    if (loop) setCurrent(((idx % total) + total) % total);
    else setCurrent(Math.max(0, Math.min(total - 1, idx)));
  }, [total, loop]);

  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  useEffect(() => {
    if (!autoplay) return;
    timerRef.current = setTimeout(next, interval);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [autoplay, interval, next]);

  if (total === 0) return null;

  return (
    <div className={cn('relative select-none', className)}>
      {/* Track */}
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-400 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {items.map((item, i) => (
            <div key={i} className="w-full shrink-0">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {showArrows && total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            disabled={!loop && current === 0}
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 z-10',
              'h-8 w-8 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm',
              'flex items-center justify-center text-muted-foreground hover:text-foreground',
              'transition-all hover:border-border hover:bg-card disabled:opacity-30',
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!loop && current === total - 1}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 z-10',
              'h-8 w-8 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm',
              'flex items-center justify-center text-muted-foreground hover:text-foreground',
              'transition-all hover:border-border hover:bg-card disabled:opacity-30',
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && total > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              className={cn(
                'rounded-full transition-all duration-200',
                i === current
                  ? 'w-5 h-1.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
