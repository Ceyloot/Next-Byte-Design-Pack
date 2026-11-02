import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface StyledTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export const StyledTimeInput: React.FC<StyledTimeInputProps> = ({
  value,
  onChange,
  label,
  disabled,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [hour, minute] = (value || '08:00').split(':');

  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const scrollToSelected = (container: HTMLDivElement | null, selectedValue: string, items: string[]) => {
          if (!container) return;
          const index = items.indexOf(selectedValue);
          if (index >= 0) {
            container.scrollTop = index * 36 - 36;
          }
        };
        scrollToSelected(hourListRef.current, hour, HOURS);
        scrollToSelected(minuteListRef.current, minute, MINUTES);
      }, 50);
    }
  }, [open, hour, minute]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          className={cn(
            'group flex items-center gap-2 h-11 px-3 rounded-xl',
            'bg-background/45 border border-border/30',
            'hover:border-primary/50 hover:bg-primary/5',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
            'transition-all duration-200 cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
        >
          <Clock className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-base font-semibold tabular-nums tracking-wide text-foreground">
            {hour}:{minute}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="w-auto p-0 border-primary/20 nb-szklo nb-szklo-plynne rounded-xl overflow-hidden z-[9999]"
      >
        <div className="flex divide-x divide-border/20">
          {/* Hours */}
          <div>
            <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-muted-foreground font-medium text-center border-b border-border/20">
              Godz
            </div>
            <div
              ref={hourListRef}
              className="h-[200px] w-[60px] overflow-y-auto overscroll-contain pointer-events-auto"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    onClick={() => onChange(`${h}:${minute}`)}
                    className={cn(
                      'w-full h-9 flex items-center justify-center text-sm font-medium rounded-md transition-all duration-150',
                      h === hour
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'text-foreground/70 hover:bg-primary/10 hover:text-primary',
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Minutes */}
          <div>
            <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-muted-foreground font-medium text-center border-b border-border/20">
              Min
            </div>
            <div
              ref={minuteListRef}
              className="h-[200px] w-[60px] overflow-y-auto overscroll-contain pointer-events-auto"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    onClick={() => onChange(`${hour}:${m}`)}
                    className={cn(
                      'w-full h-9 flex items-center justify-center text-sm font-medium rounded-md transition-all duration-150',
                      m === minute
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'text-foreground/70 hover:bg-primary/10 hover:text-primary',
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
