import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckSquare, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  PASEK ZAZNACZENIA — jedna listwa dla „N zaznaczono · akcje · ✕" w całej platformie
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Powstał 02.09.2026 przy przebudowie Studia Video na wzór Artlist („1 selected
 * · Favorite · Hide · Delete · Move to session · Download · ✕"). Do tej pory
 * platforma miała DWA takie paski i żaden nie był komponentem: Studio Zdjęć
 * (pływający, z fioletem wpisanym na sztywno) i panel firmowy (`BulkActionsBar`,
 * bez pobierania i bez ulubionych). Trzeci pisany od zera skończyłby jako
 * trzeci wygląd tej samej rzeczy.
 *
 * ZASADY MATERIAŁU:
 *  · tafla `nb-szklo-tafla` — unosi się nad stroną, więc nie jest „szybą
 *    w szybie" nawet wtedy, gdy w drzewie siedzi w szklanym rodzicu;
 *  · barwę niesie `--primary` miejsca użycia (Studio Video przestraja je na
 *    zieleń, Zdjęcia na fiolet) — pasek sam nie zna żadnego koloru;
 *  · wejście/wyjście: krycie i przesunięcie, NIGDY `scale` — animowana skala
 *    zabija `backdrop-filter` na czas animacji (zmierzone, patrz pamięć szkła).
 *
 * Pasek zastępuje kompozytor na czas zaznaczania (tak robi Artlist): oba
 * stoją w tym samym miejscu i ta sama ręka, która zaznacza, nie pisze
 * jednocześnie promptu.
 */
export interface AkcjaZaznaczenia {
  id: string;
  etykieta: string;
  ikona: LucideIcon;
  onClick: () => void;
  /** czerwień tylko dla usuwania — reszta w kolorze miejsca */
  intencja?: 'neutralna' | 'krytyczna';
  wylaczona?: boolean;
  /** np. „Ulubione" ma inny napis, gdy wszystkie zaznaczone już są ulubione */
  tytul?: string;
}

export interface PasekZaznaczeniaProps {
  liczba: number;
  /** odmiana rzeczownika: ['film', 'filmy', 'filmów'] — bez niej „zaznaczono" */
  formy?: [string, string, string];
  akcje: AkcjaZaznaczenia[];
  onZaznaczWszystko?: () => void;
  onWyczysc: () => void;
  className?: string;
  /** Do pokazu w bibliotece: w przepływie strony zamiast przyklejony do dołu okna. */
  wPrzeplywie?: boolean;
}

const odmien = (n: number, f: [string, string, string]) => {
  if (n === 1) return f[0];
  const d = n % 10, s = n % 100;
  return d >= 2 && d <= 4 && (s < 10 || s >= 20) ? f[1] : f[2];
};

export const PasekZaznaczenia: React.FC<PasekZaznaczeniaProps> = ({
  liczba, formy, akcje, onZaznaczWszystko, onWyczysc, className, wPrzeplywie,
}) => (
  <AnimatePresence>
    {liczba > 0 && (
      <motion.div
        key="pasek-zaznaczenia"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className={cn(
          'pointer-events-none flex justify-center px-4',
          wPrzeplywie ? 'relative' : 'fixed inset-x-0 z-50 bottom-[max(0.75rem,env(safe-area-inset-bottom))] md:bottom-4',
          className,
        )}
      >
        <div
          role="toolbar"
          aria-label="Akcje dla zaznaczonych"
          className="nb-szklo nb-szklo-plynne nb-szklo-tafla pointer-events-auto flex max-w-full items-center gap-0.5 rounded-2xl border border-primary/30 px-2 py-1.5 md:gap-1 md:px-3 md:py-2"
        >
          <span className="mr-1 inline-flex items-center gap-1.5 whitespace-nowrap px-1.5 text-xs font-semibold text-foreground md:text-sm">
            <CheckSquare className="h-4 w-4 text-primary" aria-hidden />
            <span className="tabular-nums">{liczba}</span>
            <span className="hidden sm:inline text-muted-foreground">{formy ? odmien(liczba, formy) : 'zaznaczono'}</span>
          </span>

          <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />

          {akcje.map(({ id, etykieta, ikona: Ikona, onClick, intencja = 'neutralna', wylaczona, tytul }) => (
            <button
              key={id}
              type="button"
              onClick={onClick}
              disabled={wylaczona}
              title={tytul ?? etykieta}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-xl px-2 text-xs font-medium transition-colors md:px-2.5',
                'disabled:cursor-not-allowed disabled:opacity-40',
                intencja === 'krytyczna'
                  ? 'text-foreground hover:bg-destructive/10 hover:text-destructive'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary',
              )}
            >
              <Ikona className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">{etykieta}</span>
            </button>
          ))}

          {onZaznaczWszystko && (
            <>
              <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
              <button
                type="button"
                onClick={onZaznaczWszystko}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary md:px-2.5"
                title="Zaznacz wszystko"
              >
                <CheckSquare className="h-4 w-4" aria-hidden />
                <span className="hidden md:inline">Wszystko</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onWyczysc}
            aria-label="Wyczyść zaznaczenie"
            title="Wyczyść zaznaczenie (Esc)"
            className="ml-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default PasekZaznaczenia;
