import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { CountdownTimer } from '../core/countdown-timer';

export interface PricingCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  discount?: number;
  available?: string;
  endsAt?: Date | number;
  features?: string[];
  price?: { amount: number | string; currency?: string; period?: string };
  originalPrice?: number;
  action?: { label: string; onClick: () => void };
  highlight?: boolean;
  glass?: boolean;
  children?: ReactNode;
  className?: string;
}

export function PricingCard({
  title, subtitle, badge, discount, available, endsAt, features,
  price, originalPrice, action, highlight, glass, children, className,
}: PricingCardProps) {
  return (
    <div className={cn(
      'relative rounded-2xl border overflow-hidden p-6 flex flex-col',
      glass
        ? highlight
          ? 'nb-glass border-primary/35'
          : 'nb-glass border-white/8'
        : highlight
          ? 'bg-card border-primary/40 shadow-wyzej'
          : 'bg-card border-border/50',
      className,
    )}>
      {/* Smooth non-clipped top light aura */}
      <div className={cn(
        'pointer-events-none absolute inset-x-0 top-0 h-32 opacity-40 transition-opacity',
        highlight
          ? 'bg-gradient-to-b from-primary/30 via-primary/5 to-transparent'
          : 'bg-gradient-to-b from-white/10 to-transparent',
      )} />

      {/* Badge / discount row */}
      {(badge || discount) && (
        <div className="relative z-10 flex items-center gap-2 mb-4">
          {badge && (
            <span className={cn(
              'inline-flex items-center gap-1.5 text-[10px] font-bold rounded-full border px-2.5 py-1',
              highlight
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/50 bg-muted/30 text-muted-foreground',
            )}>
              <span className="text-primary text-[8px]">★</span>
              {badge.toUpperCase()}
              {available && ` · ${available}`}
            </span>
          )}
          {discount && !badge && (
            <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">
              -{discount}%
            </span>
          )}
        </div>
      )}

      {/* Title + subtitle */}
      <div className="relative z-10 mb-5">
        {title && (
          <p className={cn(
            'text-base font-bold tracking-wide',
            highlight ? 'text-primary' : 'text-foreground',
          )}>
            {title}
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Price */}
      {price && (
        <div className="relative z-10 mb-6">
          <div className="flex items-end gap-1.5">
            <span className="text-5xl font-extrabold tracking-tight text-foreground leading-none">
              {price.amount}
            </span>
            <div className="flex flex-col pb-1 gap-0.5">
              <span className="text-sm font-semibold text-muted-foreground leading-none">
                {price.currency ?? 'zł'}
              </span>
              {price.period && (
                <span className="text-[10px] text-muted-foreground/55 leading-none">/{price.period}</span>
              )}
            </div>
            {originalPrice && (
              <span className="text-sm text-muted-foreground/35 line-through ml-2 pb-1 self-end">
                {originalPrice} {price.currency ?? 'zł'}
              </span>
            )}
          </div>
          {endsAt && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-destructive/70">
              <span>Kończy się za</span>
              <CountdownTimer targetDate={endsAt} variant="compact" showSeconds={false} />
            </div>
          )}
        </div>
      )}

      {/* CTA button */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'relative z-10 w-full rounded-xl py-2.5 text-sm font-semibold transition-all mb-6',
            highlight
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
              : glass
                ? 'bg-white/6 border border-white/12 text-foreground hover:bg-white/12'
                : 'bg-muted/40 border border-border/60 text-foreground hover:bg-muted/70',
          )}
        >
          {action.label}
        </button>
      )}

      {/* Features */}
      {features && features.length > 0 && (
        <ul className="relative z-10 space-y-2.5 mt-auto">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <span className={cn(
                'w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
                highlight
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border/50 bg-muted/20 text-muted-foreground/50',
              )}>
                <Check className="w-2.5 h-2.5" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      )}

      {children && <div className="relative z-10 mt-4">{children}</div>}
    </div>
  );
}
