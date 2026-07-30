import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SparklineProps extends React.SVGAttributes<SVGSVGElement> {
  data: number[];
  width?: number;
  height?: number;
  trend?: 'positive' | 'negative' | 'neutral';
  smooth?: boolean;
  strokeWidth?: number;
  showDot?: boolean;
  showFill?: boolean;
  className?: string;
}

function normalize(data: number[], w: number, h: number, pad = 2) {
  if (data.length < 2) return { points: [], last: { x: 0, y: 0 } };
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (w - pad * 2));
  const ys = data.map(v => h - pad - ((v - min) / range) * (h - pad * 2));
  const points = xs.map((x, i) => ({ x, y: ys[i] }));
  return { points, last: points[points.length - 1] };
}

function toPolyline(pts: { x: number; y: number }[]) {
  return pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

function toSmooth(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * 0.5;
    const cp2x = pts[i].x - (pts[i].x - pts[i - 1].x) * 0.5;
    d += ` C ${cp1x.toFixed(2)} ${pts[i - 1].y.toFixed(2)}, ${cp2x.toFixed(2)} ${pts[i].y.toFixed(2)}, ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)}`;
  }
  return d;
}

const TREND_STROKE: Record<string, string> = {
  positive: 'hsl(var(--primary))',
  negative: 'hsl(var(--destructive))',
  neutral:  'hsl(var(--muted-foreground))',
};

const TREND_FILL: Record<string, string> = {
  positive: 'hsl(var(--primary) / 0.12)',
  negative: 'hsl(var(--destructive) / 0.12)',
  neutral:  'hsl(var(--muted-foreground) / 0.08)',
};

const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(
  ({
    data = [],
    width = 120,
    height = 40,
    trend = 'neutral',
    smooth = true,
    strokeWidth = 1.5,
    showDot = true,
    showFill = true,
    className,
    ...props
  }, ref) => {
    const { points, last } = normalize(data, width, height);
    if (points.length < 2) return null;

    const stroke = TREND_STROKE[trend];
    const fillId = React.useId();

    const linePath = smooth ? toSmooth(points) : `M ${toPolyline(points).replace(/ /g, ' L ')}`;
    const areaPath = smooth
      ? `${toSmooth(points)} L ${last.x.toFixed(2)} ${height} L ${points[0].x.toFixed(2)} ${height} Z`
      : `M ${toPolyline(points).replace(/ /g, ' L ')} L ${last.x.toFixed(2)} ${height} L ${points[0].x.toFixed(2)} ${height} Z`;

    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn('overflow-visible', className)}
        {...props}
      >
        {showFill && (
          <>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={stroke} stopOpacity="0.18" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#${fillId})`} />
          </>
        )}
        <path d={linePath} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {showDot && (
          <circle cx={last.x} cy={last.y} r={2.5} fill={stroke} />
        )}
      </svg>
    );
  }
);
Sparkline.displayName = 'Sparkline';

export { Sparkline };
