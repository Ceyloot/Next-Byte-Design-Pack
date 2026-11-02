import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PRZEWIJANY RZĄD — chipy i pigułki w jednym wierszu, przewijane w bok
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał (19.10.2026, filtry presetów w panelu kalendarza): „nie można na boki tego przesuwać". Rząd miał
 * `overflow-x-auto` bez paska — przewijał się tylko gestem gładzika; kółko myszy i przeciąganie nie działały,
 * a ucięte „Nau…" nie mówiło, jak dojść dalej. Tu:
 *  • strzałki po bokach — tylko gdy JEST dokąd przewinąć (przewijają o ~70% szerokości),
 *  • kółko myszy przewija w bok (pionowe kręcenie nad rzędem), ale tylko póki rząd ma dokąd jechać —
 *    na końcu oddaje kręcenie stronie, więc nie więzi przewijania panelu,
 *  • przeciąganie myszą (klik po przeciągnięciu nie odpala chipa),
 *  • palcem — natywnie; klawiaturą — fokus sam przewija do chipa.
 */
export interface PrzewijanyRzadProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** klasa wewnętrznego rzędu (odstępy między elementami) */
  klasaRzedu?: string;
}

export const PrzewijanyRzad: React.FC<PrzewijanyRzadProps> = ({ children, className, klasaRzedu, ...reszta }) => {
  const rzad = React.useRef<HTMLDivElement>(null);
  const [lewo, setLewo] = React.useState(false);
  const [prawo, setPrawo] = React.useState(false);
  const ciag = React.useRef<{ x: number; start: number; przesuniety: boolean } | null>(null);

  const odswiez = React.useCallback(() => {
    const el = rzad.current;
    if (!el) return;
    setLewo(el.scrollLeft > 2);
    setPrawo(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  React.useLayoutEffect(() => {
    const el = rzad.current;
    if (!el) return;
    odswiez();
    el.addEventListener('scroll', odswiez, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(odswiez) : null;
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    /* Kółko: nieodpasywny nasłuch, bo React dokłada `wheel` jako pasywny i preventDefault by nie zadziałał. */
    const kolko = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const cel = Math.max(0, Math.min(max, el.scrollLeft + e.deltaY));
      if (cel === el.scrollLeft) return;
      e.preventDefault();
      el.scrollLeft = cel;
    };
    el.addEventListener('wheel', kolko, { passive: false });
    return () => { el.removeEventListener('scroll', odswiez); el.removeEventListener('wheel', kolko); ro?.disconnect(); };
  }, [odswiez]);

  const przewin = (kierunek: 1 | -1) => {
    const el = rzad.current;
    if (!el) return;
    el.scrollBy({ left: kierunek * Math.max(80, el.clientWidth * 0.7), behavior: 'smooth' });
  };

  return (
    <div className={cn('relative min-w-0', className)} {...reszta}>
      <div
        ref={rzad}
        className={cn(
          'overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          lewo && prawo ? '[mask-image:linear-gradient(to_right,transparent,black_28px,black_calc(100%-28px),transparent)]'
            : prawo ? '[mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)]'
              : lewo ? '[mask-image:linear-gradient(to_right,transparent,black_28px)]' : '',
        )}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || e.button !== 0) return;
          ciag.current = { x: e.clientX, start: rzad.current?.scrollLeft ?? 0, przesuniety: false };
        }}
        onPointerMove={(e) => {
          const c = ciag.current;
          const el = rzad.current;
          if (!c || !el) return;
          const dx = e.clientX - c.x;
          if (!c.przesuniety && Math.abs(dx) < 5) return;
          if (!c.przesuniety) { c.przesuniety = true; el.setPointerCapture?.(e.pointerId); }
          el.scrollLeft = c.start - dx;
        }}
        onPointerUp={() => { window.setTimeout(() => { ciag.current = null; }, 0); }}
        onPointerCancel={() => { ciag.current = null; }}
        onClickCapture={(e) => { if (ciag.current?.przesuniety) { e.preventDefault(); e.stopPropagation(); } }}
      >
        <div className={cn('flex w-max items-center', klasaRzedu)}>{children}</div>
      </div>
      {lewo && (
        <button
          type="button" tabIndex={-1} aria-label="Przewiń w lewo" onClick={() => przewin(-1)}
          className="absolute left-0 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-sm transition-colors hover:border-primary/40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}
      {prawo && (
        <button
          type="button" tabIndex={-1} aria-label="Przewiń w prawo" onClick={() => przewin(1)}
          className="absolute right-0 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-sm transition-colors hover:border-primary/40"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
