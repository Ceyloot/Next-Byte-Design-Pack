import React from 'react';
import { cn } from '@/lib/utils';
import { RDZEN_POLA } from '@/components/ui/pola';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  POLE GODZINY — wpisz albo wybierz, bez systemowego wybieraka
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał (19.10.2026, zrzut edytora presetu): natywne `<input type="time">`
 * otwierało SZARY systemowy wybierak z kolumnami i miało ikonę zegara
 * w polu — „nie jest to w naszym stylu”. Tu jest szkło biblioteki:
 *
 *  • PISANIE: „9” → 09:00, „930” → 09:30, „17.45” → 17:45; zatwierdza Enter
 *    albo wyjście z pola. Strzałki ↑/↓ — o krok (5 min), z Shiftem o godzinę.
 *  • WYBÓR: kliknięcie otwiera okienko z siatką godzin (6×4) i minut (6×2) —
 *    każda godzina dwoma stuknięciami, bez przewijania kolumn.
 *  • TELEFON: `inputMode="none"` przy grubym wskaźniku — stuknięcie otwiera
 *    siatkę zamiast klawiatury, która zasłoniłaby pół okna.
 *  • Fokus zostaje w polu (przyciski siatki go nie biorą), więc można wybrać
 *    godzinę z siatki i od razu dopisać minuty z klawiatury.
 */

const dwa = (n: number) => String(n).padStart(2, '0');
const GODZINY = Array.from({ length: 24 }, (_, i) => i);
const WZOR = /^\d{2}:\d{2}$/;

/** Odczyt wpisanej godziny: „9”, „09”, „930”, „0930”, „9:3”, „17.45”. `null` — nie da się odczytać. */
export function odczytajGodzine(tekst: string): string | null {
  const t = tekst.trim().replace(/[.,;\-\s]/g, ':');
  let h: number;
  let m: number;
  const zDwukropkiem = /^(\d{1,2}):(\d{0,2})$/.exec(t);
  if (zDwukropkiem) {
    h = Number(zDwukropkiem[1]);
    m = zDwukropkiem[2] ? Number(zDwukropkiem[2].padEnd(2, '0')) : 0;
  } else if (/^\d{1,4}$/.test(t)) {
    h = Number(t.length <= 2 ? t : t.slice(0, -2));
    m = t.length <= 2 ? 0 : Number(t.slice(-2));
  } else {
    return null;
  }
  if (h > 23 || m > 59) return null;
  return `${dwa(h)}:${dwa(m)}`;
}

const naMinuty = (g: string) => Number(g.slice(0, 2)) * 60 + Number(g.slice(3, 5));
const zMinut = (m: number) => `${dwa(Math.floor(m / 60))}:${dwa(m % 60)}`;

export interface PoleGodzinyProps {
  /** „HH:MM” albo pusty napis */
  wartosc: string;
  onZmiana: (godzina: string) => void;
  /** po zatwierdzeniu (wyjście z pola, Enter) — np. ułożenie listy po czasie */
  onZatwierdz?: () => void;
  'aria-label': string;
  krokMinut?: number;
  /** najpóźniejsza godzina (strzałki i siatka jej nie przekroczą); domyślnie 23:59 */
  maks?: string;
  blad?: boolean;
  className?: string;
}

/** Pole godziny „HH:MM”: wpis z klawiatury („930” → 09:30) albo siatka godzin i minut w okienku ze szkła. */
export const PoleGodziny: React.FC<PoleGodzinyProps> = ({
  wartosc, onZmiana, onZatwierdz, krokMinut = 5, maks = '23:59', blad, className, ...a11y
}) => {
  const [otwarte, setOtwarte] = React.useState(false);
  const [szkic, setSzkic] = React.useState<string | null>(null);
  const pole = React.useRef<HTMLInputElement>(null);
  const [gruby, setGruby] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: coarse)');
    const ustaw = () => setGruby(mq.matches);
    ustaw();
    mq.addEventListener?.('change', ustaw);
    return () => mq.removeEventListener?.('change', ustaw);
  }, []);

  /*
    Esc zamyka SIATKĘ, nie okno pod nią. Okna stoją na innej kopii warstw Radiksa niż
    dymki (`react-dialog` 1.1.10 vs `react-popover` 1.1.2 — patrz `popover.tsx`), więc okno
    uważa się za najwyższą warstwę i zamknęłoby się razem z siatką. Nasłuch na `window`
    w fazie przechwytywania działa przed nasłuchem okna na `document`.
  */
  React.useEffect(() => {
    if (!otwarte) return;
    const naKlawisz = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setOtwarte(false);
    };
    window.addEventListener('keydown', naKlawisz, true);
    return () => window.removeEventListener('keydown', naKlawisz, true);
  }, [otwarte]);

  const poprawna = WZOR.test(wartosc);
  const [hh, mm] = poprawna ? [Number(wartosc.slice(0, 2)), Number(wartosc.slice(3, 5))] : [-1, -1];
  const limit = naMinuty(WZOR.test(maks) ? maks : '23:59');
  const minuty = Array.from({ length: Math.ceil(60 / krokMinut) }, (_, i) => i * krokMinut);

  const ustaw = (min: number) => onZmiana(zMinut(Math.max(0, Math.min(min, limit))));

  const zatwierdz = () => {
    if (szkic !== null) {
      const g = odczytajGodzine(szkic);
      if (g && g !== wartosc) ustaw(naMinuty(g));
      setSzkic(null);
    }
    onZatwierdz?.();
  };

  const przesun = (kierunek: 1 | -1, oGodzine: boolean) => {
    const baza = poprawna ? naMinuty(wartosc) : 9 * 60;
    const krok = oGodzine ? 60 : krokMinut;
    /* Najpierw dociąga do siatki kroku (9:07 ↑ → 9:10), dopiero potem przesuwa o krok. */
    const doSiatki = kierunek > 0 ? Math.ceil(baza / krok) * krok : Math.floor(baza / krok) * krok;
    setSzkic(null);
    ustaw(doSiatki !== baza ? doSiatki : baza + kierunek * krok);
  };

  const komorka = (wybrana: boolean, wylaczona = false) => cn(
    'flex h-8 items-center justify-center rounded-lg text-[13px] tabular-nums transition-colors duration-150',
    wybrana
      ? 'bg-primary/15 font-semibold text-primary ring-1 ring-inset ring-primary/45'
      : 'text-foreground/80 hover:bg-foreground/[0.07] hover:text-foreground',
    wylaczona && 'pointer-events-none opacity-30',
  );

  return (
    <Popover open={otwarte} onOpenChange={setOtwarte}>
      <PopoverAnchor asChild>
        <input
          ref={pole}
          type="text"
          inputMode={gruby ? 'none' : 'numeric'}
          autoComplete="off"
          spellCheck={false}
          maxLength={5}
          value={szkic ?? wartosc}
          placeholder="--:--"
          aria-invalid={blad || undefined}
          aria-haspopup="dialog"
          aria-expanded={otwarte}
          {...a11y}
          onChange={(e) => setSzkic(e.target.value.replace(/[^\d:.,\s]/g, ''))}
          onClick={() => setOtwarte(true)}
          onFocus={(e) => { const el = e.currentTarget; requestAnimationFrame(() => el.select()); }}
          onBlur={zatwierdz}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); zatwierdz(); setOtwarte(false); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); przesun(1, e.shiftKey); }
            else if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); setOtwarte(true); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); przesun(-1, e.shiftKey); }
            else if (e.key === 'Tab') setOtwarte(false);
          }}
          className={cn(
            RDZEN_POLA,
            'h-9 w-[4.5rem] shrink-0 rounded-lg px-2 text-center text-[13px] tabular-nums focus:bg-background/55',
            gruby && 'cursor-pointer caret-transparent',
            blad && 'border-destructive/60',
            className,
          )}
        />
      </PopoverAnchor>
      <PopoverContent
        okienko
        align="start"
        className="w-auto p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => { if (pole.current?.contains(e.target as Node)) e.preventDefault(); }}
      >
        {/* Przyciski nie biorą fokusu (`onMouseDown` + `tabIndex=-1`) — pole zostaje aktywne. */}
        <div className="w-[15.5rem] space-y-2.5 p-2.5" onMouseDown={(e) => e.preventDefault()}>
          <div className="space-y-1">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Godzina</p>
            <div className="grid grid-cols-6 gap-1" role="group" aria-label="Godzina">
              {GODZINY.map((h) => (
                <button
                  key={h} type="button" tabIndex={-1} aria-pressed={h === hh}
                  className={komorka(h === hh, h * 60 > limit)}
                  onClick={() => { setSzkic(null); ustaw(h * 60 + Math.max(mm, 0)); }}
                >
                  {dwa(h)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Minuty</p>
            <div className="grid grid-cols-6 gap-1" role="group" aria-label="Minuty">
              {minuty.map((m) => (
                <button
                  key={m} type="button" tabIndex={-1} aria-pressed={m === mm}
                  className={komorka(m === mm)}
                  onClick={() => { setSzkic(null); ustaw(Math.max(hh, 0) * 60 + m); setOtwarte(false); onZatwierdz?.(); }}
                >
                  :{dwa(m)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
