import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Sparkline } from './sparkline';
import { LiquidGlass } from '../core/liquid-glass';
import { useUIStyle } from '../core/ui-style-context';

const statCardVariants = cva(
  'rounded-2xl border p-5 flex flex-col gap-3 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-card border-border',
        primary: 'bg-primary/5 border-primary/20',
        muted:   'bg-muted/40 border-border',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export type StatTrend = 'positive' | 'negative' | 'neutral';

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  trend?: StatTrend;
  trendValue?: string;
  sparklineData?: number[];
  footer?: React.ReactNode;
}

const TREND_ICON: Record<StatTrend, React.ElementType> = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral:  Minus,
};

const TREND_COLOR: Record<StatTrend, string> = {
  positive: 'text-primary',
  negative: 'text-destructive',
  neutral:  'text-muted-foreground',
};

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({
    className,
    variant,
    label,
    value,
    description,
    icon,
    trend,
    trendValue,
    sparklineData,
    footer,
    ...props
  }, ref) => {
    const TrendIcon = trend ? TREND_ICON[trend] : null;
    const { styleMode } = useUIStyle();

    const cardContent = (
      <div className={cn(
        statCardVariants({ variant }), 
        styleMode === 'liquid' ? 'bg-transparent border-0 text-white shadow-none' : 
        styleMode === 'glass' ? 'bg-white/10 border-white/20 text-white backdrop-blur-xl' : '',
        className
      )} {...props}>
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
          {icon && (
            <div className="shrink-0 rounded-lg border border-border bg-muted/50 p-1.5 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>

        {/* Value + sparkline */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-heading text-3xl font-bold text-foreground leading-none">{value}</p>
            {description && (
              <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {sparklineData && sparklineData.length > 1 && (
            <Sparkline
              data={sparklineData}
              width={80}
              height={32}
              trend={trend ?? 'neutral'}
              className="shrink-0"
            />
          )}
        </div>

        {/* Trend or footer */}
        {(trend || footer) && (
          <div className="flex items-center justify-between border-t border-border pt-3">
            {trend && TrendIcon && (
              <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', TREND_COLOR[trend])}>
                <TrendIcon className="h-3.5 w-3.5" />
                {trendValue}
              </span>
            )}
            {footer && <div className="ml-auto">{footer}</div>}
          </div>
        )}
      </div>
    );

    if (styleMode === 'liquid') {
      return (
        <LiquidGlass ref={ref as any} mode="svg" depth={10} chromaticAberration={0} className="rounded-2xl shadow-xl">
          {cardContent}
        </LiquidGlass>
      );
    }

    if (styleMode === 'glass') {
      return (
        <LiquidGlass ref={ref as any} mode="native" className="rounded-2xl shadow-xl">
          {cardContent}
        </LiquidGlass>
      );
    }

    return (
      <div ref={ref} className={cn(statCardVariants({ variant }), className)} {...props}>
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
          {icon && (
            <div className="shrink-0 rounded-lg border border-border bg-muted/50 p-1.5 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>

        {/* Value + sparkline */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-heading text-3xl font-bold text-foreground leading-none">{value}</p>
            {description && (
              <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {sparklineData && sparklineData.length > 1 && (
            <Sparkline
              data={sparklineData}
              width={80}
              height={32}
              trend={trend ?? 'neutral'}
              className="shrink-0"
            />
          )}
        </div>

        {/* Trend or footer */}
        {(trend || footer) && (
          <div className="flex items-center justify-between border-t border-border pt-3">
            {trend && TrendIcon && (
              <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', TREND_COLOR[trend])}>
                <TrendIcon className="h-3.5 w-3.5" />
                {trendValue}
              </span>
            )}
            {footer && <div className="ml-auto">{footer}</div>}
          </div>
        )}
      </div>
    );
  }
);
StatCard.displayName = 'StatCard';

export { StatCard, statCardVariants };
