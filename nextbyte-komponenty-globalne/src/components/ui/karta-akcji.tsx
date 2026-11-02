import React, { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { klasyKafelka } from '@/components/ui/tile';
import { Status, type TonStatusu } from '@/components/ui/status';
import { Button } from '@/components/ui/button';
import { StrzalkaRozwijania } from '@/components/ui/strzalka-rozwijania';
import { TEKST } from '@/components/ui/typografia';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  KARTA AKCJI — co asystent właśnie zrobił na platformie
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał (26.09.2026): „podczas rozmowy proszę go o coś, on sprawdza na
 * platformie i w popupie rozmowy pokazuje się karta potwierdzenia wykonania
 * akcji — i tę kartę przerobić, żeby nie wyglądała jak AI slop, tylko turbo
 * profesjonalnie".
 *
 * ── CO BYŁO ──────────────────────────────────────────────────────────────
 * Dwie różne karty na tę samą rzecz. W rozmowie głosowej: pigułki z pulsującą
 * kropką i poświatą. W czacie (`ToolActivityCard`): kolorowa „studzienka"
 * z ikoną w barwie narzędzia (niebo, bursztyn, szmaragd, fiolet — cztery
 * palety Tailwinda obok siebie, głuche na motyw), przesuwający się połysk,
 * mono-chip z milisekundami i szmaragdowy ✓ wyskakujący sprężyną. Dużo
 * ruchu i koloru, mało informacji: nie było widać, CO powstało ani GDZIE.
 *
 * ── CO JEST ──────────────────────────────────────────────────────────────
 * Jeden komponent dla czatu i rozmowy, zbudowany jak rekord, nie jak efekt:
 *   · moduł (ETYKIETA) i JEDEN stan po prawej — `Status` z biblioteki,
 *   · czynność jako tytuł („Dodano zadanie"), obiekt pod nią (tytuł zadania),
 *   · szczegóły w parach etykieta → wartość (termin, gdzie, wynik),
 *   · błąd: powód po polsku w barwie `--destructive`, obwódka krytyczna,
 *   · akcje: „Otwórz" (akcent) i „Cofnij" (obwódka) — tylko gdy istnieją.
 * Barwy wyłącznie z tokenów: `--primary` (trwa), `--success` (gotowe),
 * `--destructive` (błąd), wyciszony (cofnięto). Bez ikon w kwadracikach,
 * bez emoji, dwie wagi i cztery rozmiary z `typografia.ts`.
 *
 * ── RUCH ─────────────────────────────────────────────────────────────────
 * Szkło (`klasyKafelka`) NIE jest animowane: `transform` i `opacity` na
 * elemencie z `backdrop-filter` przenoszą go na własną warstwę kompozytora
 * i rozmycie przestaje widzieć tło (pamięć projektu: szkło a animacja).
 * Wchodzą DZIECI — przesunięcie o 6 px i przejrzystość, z krótkim stopniowaniem.
 * `prefers-reduced-motion` wyłącza wejście i pasek „trwa".
 */

export type StanKartyAkcji = 'w-toku' | 'gotowe' | 'blad' | 'cofnieto' | 'czeka';

export interface SzczegolKartyAkcji {
  etykieta: string;
  wartosc: React.ReactNode;
}

export interface AkcjaKarty {
  etykieta: string;
  /** Może zwrócić obietnicę — przycisk pokaże wtedy stan „w toku" i zablokuje ponowne kliknięcie. */
  onClick: () => void | Promise<void>;
  wariant?: 'glowna' | 'wtorna';
  /** Dymek: co się stanie po kliknięciu (standard wyglądu §2). */
  opis?: string;
}

export interface KartaAkcjiProps {
  /** Nazwa modułu, w którym zaszła zmiana: „Zadania", „Kalendarz"… */
  modul?: string;
  /** Czynność jako zdanie bez kropki: „Dodano zadanie", „Sprawdzam kalendarz". */
  czynnosc: string;
  /** Obiekt czynności — zwykle tytuł rekordu. */
  obiekt?: React.ReactNode;
  stan: StanKartyAkcji;
  szczegoly?: SzczegolKartyAkcji[];
  /** Powód błędu po polsku — pokazywany przy stanie `blad`. */
  powodBledu?: string;
  akcje?: AkcjaKarty[];
  /** Metadane obok stanu, np. czas trwania. Ciche, drobne. */
  meta?: string;
  /** Treść rozwijana (np. lista źródeł w czacie). */
  rozwiniecie?: { etykieta: string; tresc: React.ReactNode; domyslnieOtwarte?: boolean };
  /** Treść stała pod nagłówkiem (np. podgląd przeglądarki na żywo) — bez własnego szkła. */
  zawartosc?: React.ReactNode;
  /** Pozycja na liście — stopniuje wejście. */
  indeks?: number;
  /** `zwarta` — jeden wiersz na czynność i stan, szczegóły w linii pod spodem.
   *  Dla list w wiadomości czatu, gdzie kilka narzędzi stoi jedno pod drugim. */
  gestosc?: 'pelna' | 'zwarta';
  className?: string;
}

const STAN: Record<StanKartyAkcji, { ton: TonStatusu; etykieta: string }> = {
  'w-toku': { ton: 'akcent', etykieta: 'W toku' },
  gotowe: { ton: 'dobrze', etykieta: 'Gotowe' },
  blad: { ton: 'problem', etykieta: 'Nie udało się' },
  cofnieto: { ton: 'neutralny', etykieta: 'Cofnięto' },
  /* Wstrzymane do decyzji człowieka (zapora pamięci, 27.10.2026): nie błąd, tylko czekanie na „tak”. */
  czeka: { ton: 'uwaga', etykieta: 'Czeka na Twoje „tak”' },
};

const PrzyciskAkcji: React.FC<{ akcja: AkcjaKarty }> = ({ akcja }) => {
  const [trwa, setTrwa] = useState(false);
  const kliknij = async () => {
    if (trwa) return;
    const wynik = akcja.onClick();
    if (wynik && typeof (wynik as Promise<void>).then === 'function') {
      setTrwa(true);
      try { await wynik; } finally { setTrwa(false); }
    }
  };
  return (
    <Button
      type="button"
      size="akcja"
      variant={akcja.wariant === 'wtorna' ? 'obwodka' : 'akcent'}
      onClick={() => { void kliknij(); }}
      disabled={trwa}
      aria-busy={trwa || undefined}
      title={akcja.opis}
    >
      {akcja.etykieta}
    </Button>
  );
};

/** Karta akcji asystenta — co zrobił na platformie (czat i rozmowa głosowa): moduł, czynność, obiekt, szczegóły, jeden stan, „Otwórz"/„Cofnij". */
export const KartaAkcji: React.FC<KartaAkcjiProps> = ({
  modul,
  czynnosc,
  obiekt,
  stan,
  szczegoly,
  powodBledu,
  akcje,
  meta,
  rozwiniecie,
  zawartosc,
  indeks = 0,
  gestosc = 'pelna',
  className,
}) => {
  const zwarta = gestosc === 'zwarta';
  const bezRuchu = useReducedMotion();
  const [otwarte, setOtwarte] = useState(!!rozwiniecie?.domyslnieOtwarte);
  const idRozwiniecia = useId();
  const { ton, etykieta } = STAN[stan];

  /* Wejście dzieci — szkło zostaje nieruchome (patrz nagłówek pliku). */
  const wejscie = (krok: number) => (bezRuchu
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.22, delay: 0.04 * indeks + 0.05 * krok, ease: [0.2, 0.65, 0.3, 0.9] as const },
      });

  const widoczneAkcje = stan === 'cofnieto' ? [] : (akcje ?? []);

  return (
    <div
      role="status"
      aria-live="polite"
      data-stan={stan}
      className={cn(
        klasyKafelka({ intencja: stan === 'blad' ? 'krytyczna' : 'neutralna', zwarty: true }),
        'relative overflow-hidden text-left',
        zwarta ? 'gap-2 !py-2.5' : 'gap-3',
        className,
      )}
    >
      {/* Pasek „trwa" — cienka linia u góry w barwie marki. Dziecko szkła,
          więc jego ruch nie dotyka rozmycia tafli. */}
      {stan === 'w-toku' && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
          {bezRuchu ? (
            <span className="block h-full w-full bg-primary/40" />
          ) : (
            <motion.span
              className="block h-full w-1/3 bg-gradient-to-r from-transparent via-primary/70 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '300%' }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </span>
      )}

      {zwarta ? (
        <motion.div {...wejscie(0)} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn(TEKST.tresc, 'truncate', stan === 'cofnieto' ? 'text-muted-foreground' : 'text-foreground')}>
              <span className="font-semibold">{czynnosc}</span>
              {obiekt && <span className="text-muted-foreground"> · {obiekt}</span>}
            </p>
            {szczegoly && szczegoly.length > 0 && stan !== 'blad' && (
              <p className={cn(TEKST.znacznik, 'mt-0.5 truncate font-normal text-muted-foreground')}>
                {szczegoly.map((s, i) => (
                  <React.Fragment key={s.etykieta}>
                    {i > 0 && ' · '}
                    {s.etykieta}: {s.wartosc}
                  </React.Fragment>
                ))}
              </p>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-2">
            {meta && <span className={cn(TEKST.znacznik, 'tabular-nums text-muted-foreground/80')}>{meta}</span>}
            <Status ton={ton}>{etykieta}</Status>
          </span>
        </motion.div>
      ) : (
        <>
          <motion.div {...wejscie(0)} className="flex items-center justify-between gap-3">
            <span className={cn(TEKST.etykieta, 'truncate text-muted-foreground')}>{modul ?? 'Asystent'}</span>
            <span className="flex shrink-0 items-center gap-2">
              {meta && <span className={cn(TEKST.znacznik, 'tabular-nums text-muted-foreground/80')}>{meta}</span>}
              <Status ton={ton}>{etykieta}</Status>
            </span>
          </motion.div>

          <motion.div {...wejscie(1)} className="min-w-0">
            <p className={cn(TEKST.tytul, stan === 'cofnieto' ? 'text-muted-foreground' : 'text-foreground')}>{czynnosc}</p>
            {obiekt && (
              <p className={cn(TEKST.tresc, 'mt-1 line-clamp-2 break-words text-foreground/85', stan === 'cofnieto' && 'line-through decoration-muted-foreground/60')}>
                {obiekt}
              </p>
            )}
          </motion.div>
        </>
      )}

      {zawartosc && <motion.div {...wejscie(1)} className="min-w-0">{zawartosc}</motion.div>}

      {(stan === 'blad' || stan === 'czeka') && powodBledu && (
        <motion.p {...wejscie(2)} className={cn(TEKST.tresc, stan === 'blad' ? 'text-destructive' : 'text-foreground/75')}>
          {powodBledu}
        </motion.p>
      )}

      {!zwarta && szczegoly && szczegoly.length > 0 && stan !== 'blad' && (
        <motion.dl
          {...wejscie(2)}
          className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1.5 border-t border-border/60 pt-3"
        >
          {szczegoly.map((s) => (
            <React.Fragment key={s.etykieta}>
              <dt className={cn(TEKST.etykieta, 'text-muted-foreground')}>{s.etykieta}</dt>
              <dd className={cn(TEKST.tresc, 'min-w-0 break-words text-foreground/90')}>{s.wartosc}</dd>
            </React.Fragment>
          ))}
        </motion.dl>
      )}

      {rozwiniecie && (
        <motion.div {...wejscie(3)} className="border-t border-border/60 pt-2">
          <button
            type="button"
            onClick={() => setOtwarte((v) => !v)}
            aria-expanded={otwarte}
            aria-controls={idRozwiniecia}
            className={cn(TEKST.znacznik, 'flex w-full items-center justify-between gap-2 rounded-lg py-1 text-muted-foreground transition-colors hover:text-foreground')}
          >
            {rozwiniecie.etykieta}
            <StrzalkaRozwijania otwarty={otwarte} />
          </button>
          <AnimatePresence initial={false}>
            {otwarte && (
              <motion.div
                id={idRozwiniecia}
                key="rozwiniecie"
                initial={bezRuchu ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={bezRuchu ? undefined : { height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="overflow-hidden"
              >
                <div className="pt-2">{rozwiniecie.tresc}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {widoczneAkcje.length > 0 && (
        <motion.div {...wejscie(4)} className="flex flex-wrap items-center gap-2">
          {widoczneAkcje.map((a) => <PrzyciskAkcji key={a.etykieta} akcja={a} />)}
        </motion.div>
      )}
    </div>
  );
};

export default KartaAkcji;
