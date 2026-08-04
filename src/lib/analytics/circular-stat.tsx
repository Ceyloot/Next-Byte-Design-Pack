import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiquidGlass } from '../core/liquid-glass';
import { useUIStyle } from '../core/ui-style-context';

// ── Types ───────────────────────────────────────────────────────────────────────

export type CircularStatVariant = 'liquid' | 'glass' | 'neon' | 'solid' | 'minimal';

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  size?: number; // Size in px, default 120
  strokeWidth?: number; // Stroke width in px, default 10
  label?: string;
  sublabel?: string;
  icon?: React.ReactNode;
  gradientFrom?: string; // e.g. '#22d3ee' or 'hsl(var(--primary))'
  gradientTo?: string; // e.g. '#a855f7'
  variant?: CircularStatVariant;
  showValueText?: boolean;
  animate?: boolean;
}

export interface CircularStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: number;
  unit?: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  trendValue?: string;
  variant?: CircularStatVariant;
  gradientFrom?: string;
  gradientTo?: string;
  badgeText?: string;
  size?: number;
}

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color: string; // Hex or HSL color string
  icon?: React.ReactNode;
}

export interface DonutStatProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerText?: string;
  centerSubtext?: string;
  variant?: CircularStatVariant;
}

export interface ConcentricRingItem {
  id: string;
  label: string;
  value: number; // 0 to 100
  color: string;
  icon?: React.ReactNode;
}

export interface ConcentricRingsStatProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  rings: ConcentricRingItem[];
  size?: number;
  strokeWidth?: number;
  variant?: CircularStatVariant;
}

// ── CircularProgress Component ─────────────────────────────────────────────────

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({
    className,
    value,
    size = 120,
    strokeWidth = 10,
    label,
    sublabel,
    icon,
    gradientFrom = '#00f2fe',
    gradientTo = '#4facfe',
    variant = 'liquid',
    showValueText = true,
    ...props
  }, ref) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

    const gradId = React.useId();

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex flex-col items-center justify-center text-center', className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 drop-shadow-[0_0_12px_rgba(0,242,254,0.25)]"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
            <filter id={`glow-${gradId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-white/10 dark:text-white/5"
          />

          {/* Progress Animated Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            filter={variant === 'neon' ? `url(#glow-${gradId})` : undefined}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 pointer-events-none">
          {icon && <div className="mb-0.5 text-foreground/80">{icon}</div>}
          {showValueText && (
            <span className="font-heading font-extrabold tracking-tight text-foreground text-lg leading-none">
              {Math.round(clampedValue)}%
            </span>
          )}
          {label && (
            <span className="text-[10px] font-medium text-muted-foreground mt-0.5 truncate max-w-[80%]">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[9px] text-muted-foreground/60 truncate max-w-[80%]">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    );
  }
);
CircularProgress.displayName = 'CircularProgress';

// ── CircularStatCard Component ─────────────────────────────────────────────────

export const CircularStatCard = React.forwardRef<HTMLDivElement, CircularStatCardProps>(
  ({
    className,
    title,
    value,
    unit = '%',
    description,
    icon,
    trend,
    trendValue,
    variant = 'liquid',
    gradientFrom = '#38bdf8',
    gradientTo = '#818cf8',
    badgeText,
    size = 110,
    ...props
  }, ref) => {
    const { styleMode } = useUIStyle();
    const effectiveVariant = variant || (styleMode === 'liquid' ? 'liquid' : styleMode === 'glass' ? 'glass' : 'solid');

    const TrendIcon = trend === 'positive' ? TrendingUp : trend === 'negative' ? TrendingDown : Minus;
    const trendColor = trend === 'positive' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                       trend === 'negative' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                       'text-muted-foreground bg-muted/40 border-border/40';

    const cardBody = (
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">{title}</span>
            {badgeText && (
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
                {badgeText}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-heading text-3xl font-extrabold text-foreground tracking-tight">{value}</span>
            <span className="text-sm font-semibold text-muted-foreground">{unit}</span>
          </div>

          {description && (
            <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-2">{description}</p>
          )}

          {trendValue && (
            <div className={cn('mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium', trendColor)}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center justify-center">
          <CircularProgress
            value={value}
            size={size}
            strokeWidth={9}
            gradientFrom={gradientFrom}
            gradientTo={gradientTo}
            variant={effectiveVariant}
            icon={icon}
            showValueText={false}
          />
        </div>
      </div>
    );

    if (effectiveVariant === 'liquid') {
      return (
        <LiquidGlass
          ref={ref}
          containerClassName={cn('rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01]', className)}
          glowColor={gradientFrom}
          depth={2}
          {...props}
        >
          {cardBody}
        </LiquidGlass>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border transition-all duration-300 hover:border-primary/40',
          effectiveVariant === 'glass' ? 'bg-white/5 backdrop-blur-xl border-white/15 text-white shadow-xl' :
          effectiveVariant === 'neon' ? 'bg-black/40 border-primary/40 shadow-[0_0_20px_rgba(56,189,248,0.15)]' :
          'bg-card border-border shadow-sm',
          className
        )}
        {...props}
      >
        {cardBody}
      </div>
    );
  }
);
CircularStatCard.displayName = 'CircularStatCard';

// ── DonutStat Component ────────────────────────────────────────────────────────

export const DonutStat = React.forwardRef<HTMLDivElement, DonutStatProps>(
  ({
    className,
    title,
    subtitle,
    segments,
    size = 160,
    thickness = 16,
    centerText,
    centerSubtext,
    variant = 'liquid',
    ...props
  }, ref) => {
    const total = React.useMemo(() => segments.reduce((acc, s) => acc + s.value, 0), [segments]);
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedValue = 0;

    const content = (
      <div className="p-6 flex flex-col md:flex-row items-center gap-6">
        {/* SVG Donut */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {segments.map((seg) => {
              const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedValue / total) * circumference);
              accumulatedValue += seg.value;

              return (
                <circle
                  key={seg.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  className="transition-all duration-700 hover:opacity-80 cursor-pointer"
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
            <span className="font-heading text-xl font-bold text-foreground">
              {centerText ?? total.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {centerSubtext ?? 'Total'}
            </span>
          </div>
        </div>

        {/* Info & Legend */}
        <div className="flex-1 min-w-0 w-full">
          {title && <h4 className="font-heading text-base font-bold text-foreground mb-0.5">{title}</h4>}
          {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}

          <div className="space-y-2.5">
            {segments.map((seg) => {
              const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
              return (
                <div key={seg.id} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    {seg.icon && <span className="text-muted-foreground">{seg.icon}</span>}
                    <span className="font-medium text-foreground truncate">{seg.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="text-muted-foreground text-[11px]">{seg.value.toLocaleString()}</span>
                    <span className="font-bold text-foreground">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );

    if (variant === 'liquid') {
      return (
        <LiquidGlass ref={ref} containerClassName={cn('rounded-2xl', className)} depth={2} {...props}>
          {content}
        </LiquidGlass>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border bg-card border-border shadow-sm',
          variant === 'glass' ? 'bg-white/5 backdrop-blur-xl border-white/15 text-white' : '',
          className
        )}
        {...props}
      >
        {content}
      </div>
    );
  }
);
DonutStat.displayName = 'DonutStat';

// ── ConcentricRingsStat Component ─────────────────────────────────────────────

export const ConcentricRingsStat = React.forwardRef<HTMLDivElement, ConcentricRingsStatProps>(
  ({
    className,
    title,
    subtitle,
    rings,
    size = 200,
    strokeWidth = 10,
    variant = 'liquid',
    ...props
  }, ref) => {
    const gap = 4;
    const centerRadius = size / 2;

    const content = (
      <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {rings.map((ring, idx) => {
              const currentRadius = centerRadius - strokeWidth / 2 - idx * (strokeWidth + gap);
              const circ = 2 * Math.PI * currentRadius;
              const clamped = Math.max(0, Math.min(100, ring.value));
              const offset = circ - (clamped / 100) * circ;

              return (
                <g key={ring.id}>
                  {/* Track */}
                  <circle
                    cx={centerRadius}
                    cy={centerRadius}
                    r={currentRadius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-white/10 dark:text-white/5"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx={centerRadius}
                    cy={centerRadius}
                    r={currentRadius}
                    stroke={ring.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </g>
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Sparkles className="w-6 h-6 text-primary animate-pulse mb-1" />
            <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-widest">
              Live Gauges
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full space-y-3">
          {title && <h4 className="font-heading text-base font-bold text-foreground mb-0.5">{title}</h4>}
          {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}

          <div className="space-y-2">
            {rings.map((ring) => (
              <div key={ring.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3 h-3 rounded-full shrink-0 border" style={{ backgroundColor: ring.color, borderColor: ring.color }} />
                  {ring.icon && <span className="text-muted-foreground">{ring.icon}</span>}
                  <span className="font-semibold text-foreground truncate">{ring.label}</span>
                </div>
                <span className="font-mono font-bold text-foreground shrink-0">{ring.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    if (variant === 'liquid') {
      return (
        <LiquidGlass ref={ref} containerClassName={cn('rounded-2xl', className)} depth={2} {...props}>
          {content}
        </LiquidGlass>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('rounded-2xl border bg-card border-border shadow-sm', className)}
        {...props}
      >
        {content}
      </div>
    );
  }
);
ConcentricRingsStat.displayName = 'ConcentricRingsStat';
