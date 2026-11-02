import React from 'react';
import { cn } from '@/lib/utils';

export type ValueFormat = 'number' | 'currency' | 'percent' | 'compact';

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

interface PremiumChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  labelFormatter?: (label: string) => string;
  valueFormat?: ValueFormat;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
}

function formatValue(value: number, format: ValueFormat, prefix = '', suffix = ''): string {
  let formatted: string;
  switch (format) {
    case 'currency':
      formatted = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
      break;
    case 'percent':
      formatted = `${value.toFixed(1)}%`;
      break;
    case 'compact':
      formatted = new Intl.NumberFormat('pl-PL', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
      break;
    default:
      formatted = value.toLocaleString('pl-PL');
  }
  return `${prefix}${formatted}${suffix}`;
}

export const PremiumChartTooltip: React.FC<PremiumChartTooltipProps> = ({
  active,
  payload,
  label,
  labelFormatter,
  valueFormat = 'number',
  valuePrefix = '',
  valueSuffix = '',
  className,
}) => {
  if (!active || !payload?.length) return null;

  const displayLabel = labelFormatter ? labelFormatter(String(label)) : label;

  return (
    <div
      className={cn(
        'rounded-xl border border-border/50 nb-szklo nb-szklo-plynne px-3 py-2.5 shadow-2xl',
        'min-w-[140px] animate-fade-in',
        className
      )}
    >
      {displayLabel && (
        <p className="text-[11px] font-medium text-muted-foreground mb-1.5 tracking-wide uppercase">
          {displayLabel}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color || entry.stroke }}
              />
              <span className="text-xs text-muted-foreground">
                {entry.name}
              </span>
            </div>
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {formatValue(Number(entry.value), valueFormat, valuePrefix, valueSuffix)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
