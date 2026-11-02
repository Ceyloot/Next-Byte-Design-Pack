import React, { useId, useState, useCallback, useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumChartTooltip, type ValueFormat } from './premium-chart-tooltip';

// ─── Shared Types ───────────────────────────────────────────────

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

interface BaseChartProps {
  data: Record<string, any>[];
  xKey: string;
  series: ChartSeries[];
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  labelFormatter?: (label: string) => string;
  valueFormat?: ValueFormat;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
  yDomain?: [number, number];
}

// ─── Nice Y-axis tick formatter ─────────────────────────────────

function formatYTick(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1)}k`;
  return String(Math.round(value));
}

// ─── Hook: animate only once ────────────────────────────────────

function useAnimateOnce(animated: boolean, durationMs: number) {
  const [isActive, setIsActive] = useState(animated);
  const mounted = useRef(false);

  useEffect(() => {
    if (!animated) return;
    mounted.current = true;
    const timer = setTimeout(() => setIsActive(false), durationMs + 200);
    return () => clearTimeout(timer);
  }, [animated, durationMs]);

  return isActive;
}

// ─── Crosshair Hook ─────────────────────────────────────────────

function useCrosshair() {
  const [activeX, setActiveX] = useState<string | null>(null);
  const onMouseMove = useCallback((state: any) => {
    if (state?.activeLabel !== undefined) setActiveX(state.activeLabel);
  }, []);
  const onMouseLeave = useCallback(() => setActiveX(null), []);
  return { activeX, onMouseMove, onMouseLeave };
}

// ─── Gradient Defs ──────────────────────────────────────────────

const GradientDefs: React.FC<{ id: string; series: ChartSeries[] }> = ({ id, series }) => (
  <defs>
    {series.map((s) => (
      <linearGradient key={s.key} id={`${id}-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={s.color} stopOpacity={0.4} />
        <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
      </linearGradient>
    ))}
  </defs>
);

// ─── Shared axis props ──────────────────────────────────────────

const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' },
};

// ─── Animation Wrapper ──────────────────────────────────────────

const ChartWrapper: React.FC<{
  animated?: boolean;
  height: number;
  className?: string;
  children: React.ReactNode;
}> = ({ animated, height, className, children }) => {
  const content = (
    <div className={cn('w-full', className)} style={{ height }}>
      {children}
    </div>
  );

  if (!animated) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn('w-full', className)}
      style={{ height }}
    >
      {children}
    </motion.div>
  );
};

// ─── Premium Area Chart ─────────────────────────────────────────

export const PremiumAreaChart: React.FC<BaseChartProps> = ({
  data, xKey, series, height = 350, showGrid = true, animated = true,
  labelFormatter, valueFormat, valuePrefix, valueSuffix, className, yDomain,
}) => {
  const uid = useId().replace(/:/g, '');
  const { activeX, onMouseMove, onMouseLeave } = useCrosshair();
  const isAnimationActive = useAnimateOnce(animated, 1200);

  return (
    <ChartWrapper animated={animated} height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <GradientDefs id={uid} series={series} />
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
          )}
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} width={55} domain={yDomain} tickFormatter={formatYTick} />
          <Tooltip
            content={<PremiumChartTooltip labelFormatter={labelFormatter} valueFormat={valueFormat} valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
            cursor={false}
          />
          {activeX !== null && (
            <ReferenceLine x={activeX} stroke="hsl(var(--primary))" strokeOpacity={0.3} strokeDasharray="3 3" />
          )}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#${uid}-grad-${s.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))', stroke: s.color }}
              isAnimationActive={isAnimationActive}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// ─── Premium Line Chart ─────────────────────────────────────────

export const PremiumLineChart: React.FC<BaseChartProps> = ({
  data, xKey, series, height = 350, showGrid = true, animated = true,
  labelFormatter, valueFormat, valuePrefix, valueSuffix, className,
}) => {
  const uid = useId().replace(/:/g, '');
  const { activeX, onMouseMove, onMouseLeave } = useCrosshair();
  const isAnimationActive = useAnimateOnce(animated, 1200);

  return (
    <ChartWrapper animated={animated} height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <filter key={s.key} id={`${uid}-glow-${s.key}`}>
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
          )}
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} width={55} tickFormatter={formatYTick} />
          <Tooltip
            content={<PremiumChartTooltip labelFormatter={labelFormatter} valueFormat={valueFormat} valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
            cursor={false}
          />
          {activeX !== null && (
            <ReferenceLine x={activeX} stroke="hsl(var(--primary))" strokeOpacity={0.3} strokeDasharray="3 3" />
          )}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: 'hsl(var(--background))', stroke: s.color }}
              filter={`url(#${uid}-glow-${s.key})`}
              isAnimationActive={isAnimationActive}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// ─── Premium Bar Chart ──────────────────────────────────────────

export const PremiumBarChart: React.FC<BaseChartProps & { stacked?: boolean }> = ({
  data, xKey, series, height = 350, showGrid = true, animated = true,
  labelFormatter, valueFormat, valuePrefix, valueSuffix, className, stacked = false, yDomain,
}) => {
  const uid = useId().replace(/:/g, '');
  const isAnimationActive = useAnimateOnce(animated, 800);

  return (
    <ChartWrapper animated={animated} height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <GradientDefs id={uid} series={series} />
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
          )}
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} width={55} domain={yDomain} tickFormatter={formatYTick} />
          <Tooltip
            content={<PremiumChartTooltip labelFormatter={labelFormatter} valueFormat={valueFormat} valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3, radius: 4 }}
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={`url(#${uid}-grad-${s.key})`}
              stroke={s.color}
              strokeWidth={1}
              radius={[6, 6, 0, 0]}
              stackId={stacked ? 'stack' : undefined}
              isAnimationActive={isAnimationActive}
              animationDuration={800}
              animationEasing="ease-out"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};
