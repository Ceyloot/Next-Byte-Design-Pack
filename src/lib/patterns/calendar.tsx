import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarProps {
  view?: CalendarView;
  defaultView?: CalendarView;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  glass?: boolean;
  className?: string;
}

const DAY_LABELS = ['PON.', 'WT.', 'ŚR.', 'CZW.', 'PT.', 'SOB.', 'NIEDZ.'];
const MONTH_LABELS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 08:00 – 23:00

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function formatDateRange(monday: Date) {
  const sunday = addDays(monday, 6);
  const m1 = MONTH_LABELS[monday.getMonth()];
  const m2 = MONTH_LABELS[sunday.getMonth()];
  if (m1 === m2) return `${monday.getDate()} ${m1} - ${sunday.getDate()} ${m2} ${sunday.getFullYear()}`;
  return `${monday.getDate()} ${m1} - ${sunday.getDate()} ${m2} ${sunday.getFullYear()}`;
}

export function Calendar({
  view: controlledView, defaultView = 'week',
  events = [], onEventClick, onDateClick, glass, className,
}: CalendarProps) {
  const [view, setView] = useState<CalendarView>(controlledView ?? defaultView);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const today = useMemo(() => new Date(), []);
  const nowMinutes = today.getHours() * 60 + today.getMinutes();

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  function eventsForDay(day: Date) {
    return events.filter(e => sameDay(new Date(e.start), day));
  }

  function eventTop(e: CalendarEvent) {
    const start = new Date(e.start);
    return ((start.getHours() - 8) * 60 + start.getMinutes()) * (56 / 60);
  }

  function eventHeight(e: CalendarEvent) {
    const mins = (new Date(e.end).getTime() - new Date(e.start).getTime()) / 60000;
    return Math.max(mins * (56 / 60), 24);
  }

  const nowTop = (nowMinutes - 8 * 60) * (56 / 60);
  const showNow = nowMinutes >= 8 * 60 && nowMinutes <= 23 * 60;

  return (
    <div className={cn(
      'flex flex-col rounded-2xl border border-border/60 overflow-hidden',
      glass ? 'nb-glass-static' : 'bg-card',
      className,
    )}>
      {/* Toolbar */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 border-b border-border/40 shrink-0',
        glass && 'bg-background/10',
      )}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart(d => addDays(d, -7))}
            className="h-7 w-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground px-2 py-1 border border-border/40 rounded-lg">
            <span className="text-muted-foreground/50">📅</span>
            {formatDateRange(weekStart)}
          </span>
          <button
            type="button"
            onClick={() => setWeekStart(d => addDays(d, 7))}
            className="h-7 w-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setWeekStart(getMonday(new Date()))}
          className="ml-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Dziś
        </button>

        <div className="ml-auto flex items-center gap-1">
          {(['day', 'week', 'month'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors capitalize',
                view === v
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {v === 'day' ? 'Dzień' : v === 'week' ? 'Tydzień' : 'Miesiąc'}
            </button>
          ))}
          <button type="button" className="ml-1 text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Week header */}
      <div className={cn('flex border-b border-border/40 shrink-0', glass && 'bg-background/10')}>
        <div className="w-14 shrink-0" />
        {weekDays.map((day, i) => {
          const isToday = sameDay(day, today);
          return (
            <div key={i} className="flex-1 text-center py-2.5 border-l border-border/30 first:border-l-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{DAY_LABELS[i]}</p>
              <p className={cn(
                'text-sm font-bold mt-0.5 leading-none',
                isToday
                  ? 'h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-[11px]'
                  : 'text-foreground',
              )}>
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-y-auto" style={{ maxHeight: 480 }}>
        {/* Hour labels */}
        <div className="w-14 shrink-0 border-r border-border/30">
          {HOURS.map(h => (
            <div key={h} className="h-14 flex items-start justify-end pr-2 pt-0.5">
              <span className="text-[9px] text-muted-foreground/40 font-mono tabular-nums">
                {String(h).padStart(2,'0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day, di) => {
          const isToday = sameDay(day, today);
          const dayEvents = eventsForDay(day);
          return (
            <div
              key={di}
              onClick={() => onDateClick?.(day)}
              className={cn(
                'flex-1 relative border-l border-border/20 cursor-pointer',
                isToday && 'bg-primary/[0.02]',
              )}
            >
              {/* Hour lines */}
              {HOURS.map(h => (
                <div key={h} className="h-14 border-b border-border/20" />
              ))}

              {/* Current time indicator */}
              {isToday && showNow && (
                <div
                  className="absolute left-0 right-0 z-10 flex items-center"
                  style={{ top: `${nowTop}px` }}
                >
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 -ml-1" />
                  <div className="flex-1 h-px bg-primary" />
                </div>
              )}

              {/* Events */}
              {dayEvents.map(ev => (
                <div
                  key={ev.id}
                  onClick={e => { e.stopPropagation(); onEventClick?.(ev); }}
                  className="absolute left-1 right-1 z-20 rounded-lg px-2 py-1 text-[10px] font-semibold cursor-pointer overflow-hidden"
                  style={{
                    top: `${eventTop(ev)}px`,
                    height: `${eventHeight(ev)}px`,
                    background: ev.color ?? 'hsl(var(--primary)/0.2)',
                    borderLeft: `2px solid ${ev.color ?? 'hsl(var(--primary))'}`,
                    color: 'hsl(var(--foreground))',
                  }}
                >
                  <span className="line-clamp-1">{ev.title}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
