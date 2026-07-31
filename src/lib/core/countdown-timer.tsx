import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface CountdownTimerProps {
  targetDate: Date | number;
  showSeconds?: boolean;
  variant?: 'default' | 'compact' | 'badge' | 'blocks';
  label?: string;
  onEnd?: () => void;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calc(target: Date | number): TimeLeft {
  const diff = Math.max(0, +new Date(target) - Date.now());
  return {
    total: diff,
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000)  / 60000),
    seconds: Math.floor((diff % 60000)    / 1000),
  };
}

export function CountdownTimer({
  targetDate, showSeconds = true, variant = 'default', label, onEnd, className,
}: CountdownTimerProps) {
  const [time, setTime] = useState<TimeLeft>(() => calc(targetDate));

  const tick = useCallback(() => {
    const t = calc(targetDate);
    setTime(t);
    if (t.total === 0) onEnd?.();
  }, [targetDate, onEnd]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  if (variant === 'badge') {
    const parts = [
      time.days    > 0 ? `${time.days}d`  : null,
      time.hours   > 0 ? `${time.hours}h` : null,
      `${String(time.minutes).padStart(2,'0')}m`,
      showSeconds ? `${String(time.seconds).padStart(2,'0')}s` : null,
    ].filter(Boolean);
    return (
      <span className={cn(
        'inline-flex items-center gap-1 text-[10px] font-mono font-bold',
        'bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full',
        className,
      )}>
        ● {parts.join(' ')}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex items-center gap-1 font-mono text-sm font-semibold text-foreground', className)}>
        {time.days > 0 && <><span>{time.days}</span><span className="text-muted-foreground/50 text-xs">d</span></>}
        <span>{String(time.hours).padStart(2,'0')}</span>
        <span className="text-muted-foreground/50">:</span>
        <span>{String(time.minutes).padStart(2,'0')}</span>
        {showSeconds && <><span className="text-muted-foreground/50">:</span><span>{String(time.seconds).padStart(2,'0')}</span></>}
      </div>
    );
  }

  if (variant === 'blocks') {
    const units = [
      { label: 'DNI',    value: String(time.days).padStart(2,'0') },
      { label: 'GODZ',   value: String(time.hours).padStart(2,'0') },
      { label: 'MIN',    value: String(time.minutes).padStart(2,'0') },
      ...(showSeconds ? [{ label: 'SEK', value: String(time.seconds).padStart(2,'0') }] : []),
    ];
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="text-xl font-mono font-bold text-foreground tabular-nums">{u.value}</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50">{u.label}</span>
            </div>
            {i < units.length - 1 && (
              <span className="text-muted-foreground/30 text-xl font-mono mb-2.5">:</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* default */
  const parts = [
    { label: 'd',   value: time.days },
    { label: 'h',   value: time.hours },
    { label: 'm',   value: time.minutes },
    ...(showSeconds ? [{ label: 's', value: time.seconds }] : []),
  ].filter((p, i) => i > 0 || p.value > 0);

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      {label && <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</p>}
      <div className="flex items-baseline gap-0.5 font-mono text-sm font-semibold text-foreground">
        {parts.map(p => (
          <span key={p.label}>
            <span className="tabular-nums">{String(p.value).padStart(2,'0')}</span>
            <span className="text-muted-foreground/50 text-[10px] mr-0.5">{p.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
