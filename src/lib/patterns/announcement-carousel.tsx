import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Announcement {
  id: string;
  badge?: string;
  badgePremium?: boolean;
  preview?: ReactNode;
  icon?: ReactNode;
  iconBg?: string;
  title: string;
  description?: string;
  linkLabel?: string;
  onClick?: () => void;
}

export interface AnnouncementCarouselProps {
  items: Announcement[];
  title?: string;
  newCount?: number;
  className?: string;
  glass?: boolean;
}

// ── Layout constants ───────────────────────────────────────────────────────
// Card: 60% of container, 2% margin each side → slot = 64%
// Center offset = (100 - 60) / 2 - 2 = 18%
// translateX = (18 - current * 64)%
// Each side card shows 16% of container ≈ 27% of card content

const CARD_W = 60;   // card width as % of container
const GAP    = 2;    // margin on each side of card (%)
const SLOT   = CARD_W + GAP * 2;          // 64 — distance between card left edges
const START  = (100 - CARD_W) / 2 - GAP; // 18 — initial offset to center card[0]

// ── Single card ────────────────────────────────────────────────────────────

function AnnCard({ item, active, glass }: { item: Announcement; active: boolean; glass?: boolean }) {
  return (
    <div className={cn(
      'w-full rounded-2xl border overflow-hidden',
      glass ? 'nb-glass-static border-white/10' : 'bg-card border-border/50',
    )}>
      {/* Badge */}
      {item.badge && (
        <div className="px-4 pt-4">
          <span className={cn(
            'inline-flex items-center gap-1.5 text-[10px] font-bold rounded-full border px-2.5 py-1',
            item.badgePremium
              ? 'border-primary/40 bg-primary/8 text-primary'
              : 'border-border/60 text-muted-foreground',
          )}>
            <span className="text-primary text-[9px]">✦</span>
            {item.badge}
          </span>
        </div>
      )}

      {/* Preview */}
      {item.preview && (
        <div className={cn(
          'mx-4 mt-3 rounded-xl overflow-hidden border aspect-[16/7]',
          'flex items-center justify-center',
          glass ? 'border-white/8 bg-background/20' : 'border-border/30 bg-background/60',
        )}>
          {item.preview}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 flex items-start gap-3">
        {item.icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-md"
            style={{ background: item.iconBg ?? 'hsl(var(--primary))' }}
          >
            {item.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground leading-snug">{item.title}</h3>
          {item.description && (
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
          {item.linkLabel && active && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); item.onClick?.(); }}
              className="mt-2 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              {item.linkLabel}
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export function AnnouncementCarousel({
  items,
  title = 'NOWOŚCI',
  newCount,
  className,
  glass,
}: AnnouncementCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = items.length;

  const go = (dir: 1 | -1) =>
    setCurrent(i => Math.max(0, Math.min(total - 1, i + dir)));

  // trackX — shifts the flex row so card[current] is always centered
  const trackX = START - current * SLOT;

  return (
    <div className={cn('w-full select-none', className)}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className="text-primary text-sm leading-none">✦</span>
        <span className="text-xs font-bold uppercase tracking-widest text-foreground">{title}</span>
        {newCount !== undefined && newCount > 0 && (
          <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/25 rounded-full px-2 py-0.5">
            {newCount} nowe
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={current === 0}
            className={cn(
              'w-7 h-7 rounded-full border flex items-center justify-center transition-all',
              glass
                ? 'bg-white/5 border-white/10 text-foreground/60 hover:text-foreground disabled:opacity-30'
                : 'border-border/60 bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-30',
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={current === total - 1}
            className={cn(
              'w-7 h-7 rounded-full border flex items-center justify-center transition-all',
              glass
                ? 'bg-white/5 border-white/10 text-foreground/60 hover:text-foreground disabled:opacity-30'
                : 'border-border/60 bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-30',
            )}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Track — overflow:hidden clips side cards */}
      <div className="overflow-hidden w-full">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${trackX}%)` }}
        >
          {items.map((item, i) => {
            const dist = Math.abs(i - current);
            const isActive = i === current;
            return (
              <div
                key={item.id}
                className="shrink-0 transition-all duration-500 ease-out"
                style={{
                  width: `${CARD_W}%`,
                  marginLeft: `${GAP}%`,
                  marginRight: `${GAP}%`,
                  // blur + dim side cards; hide cards further than 1 away
                  filter: isActive
                    ? 'none'
                    : dist === 1
                      ? 'blur(2px) brightness(0.45)'
                      : 'blur(4px) brightness(0.2)',
                  opacity: dist > 2 ? 0 : 1,
                  cursor: isActive ? 'default' : 'pointer',
                }}
                onClick={() => !isActive && setCurrent(i)}
              >
                <AnnCard item={item} active={isActive} glass={glass} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={cn(
                'rounded-full transition-all duration-300',
                i === current
                  ? 'w-5 h-1.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
