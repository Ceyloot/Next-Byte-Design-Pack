import React, { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  SEKCJA PANELU — jedna konwencja nazwy dla każdej części Panelu Głównego
 * ════════════════════════════════════════════════════════════════════════
 *
 * W bibliotece, nie w `dashboard/`: tej samej konwencji używa lewa kolumna
 * Personalnego Asystenta („Twój dzień"). Dwie kopie tego samego nagłówka
 * rozjechałyby się przy pierwszej zmianie — patrz nagłówek `naglowek-sekcji`.
 * (`NaglowekSekcji` to inny rejestr: pigułka z kreską do kolumn list.)
 *
 * 26.09.2026, zrzut Michała: część kart miała tytuł W ŚRODKU (pasek
 * `TileHeader` z ikoną w „Czeka na Ciebie" i „Kalendarzu"), część etykietę
 * NAD kartą („SZYBKA PODRÓŻ", „TWOJE CHMURY"), a „Wróć do roboty" nie miała
 * żadnej. Trzy sposoby nazywania na jednym ekranie czytały się jak trzy
 * różne aplikacje sklejone w jedną.
 *
 * Wybrana konwencja: nazwa sekcji stoi NAD kartą, na tle strony — tak jak
 * nagłówki grup w ustawieniach iOS/macOS. Powód jest prosty: Szybka podróż
 * i chmury to GRUPY kafelków, więc nie mają jednej karty, w której tytuł
 * mógłby zamieszkać. Etykieta nad treścią działa dla grupy i dla pojedynczej
 * karty tak samo — tytuł w środku działałby tylko dla karty.
 *
 * Wiersz nazwy:
 *   · ETYKIETA — 11 px, wersaliki, rozstrzelenie (stopień ETYKIETA
 *     z `typografia.ts`), w kolorze drugoplanowym — nazywa, nie krzyczy.
 *     `text-foreground/65`, nie `text-muted-foreground`: nazwa stoi na tle
 *     strony, a tam `--muted-foreground` motywu NextByte Jasny ma 4,1–4,6 : 1
 *     (zmierzone 26.09) — poniżej progu 4,5 dla 11 px. Pismo 65% daje 5,3 : 1
 *     na jasnym i ~8 : 1 na ciemnym, a wygląda tak samo cicho,
 *   · META — liczba albo stan zaraz za nazwą („3 sprawy, w tym 3 po terminie"),
 *   · AKCJA — przy prawej krawędzi („Edytuj", „Otwórz").
 *
 * WSZYSTKO W WIERSZU TO TEKST 11 px NA JEDNEJ LINII BAZOWEJ — także akcja
 * (`AkcjaSekcji`: słowo z ikoną, bez obudowy przycisku). Dzięki temu:
 *   · wiersz ma tę samą wysokość w każdej sekcji, więc karty w sąsiednich
 *     kolumnach zaczynają się na jednej linii, z akcją czy bez,
 *   · nazwa należy do karty pod nią: 8 px do karty, 16 px do karty wyżej.
 *     Przycisk 28 px w wierszu (pierwsza wersja) odsuwał nazwę od karty
 *     o połowę swojej wysokości i ta proporcja się odwracała.
 */

interface SekcjaPaneluProps {
  etykieta: string;
  meta?: React.ReactNode;
  akcja?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  /** `data-tour` i podobne znaczniki zostają na sekcji. */
  'data-tour'?: string;
}

/** Nazwa sekcji NAD kartą (etykieta, meta, akcja) + treść sekcji pod nią. */
export const SekcjaPanelu: React.FC<SekcjaPaneluProps> = ({
  etykieta, meta, akcja, className, children, ...rest
}) => {
  const id = useId();
  return (
    <section aria-labelledby={id} className={cn('flex min-w-0 flex-col gap-2', className)} {...rest}>
      <div className="flex h-4 shrink-0 items-center gap-3 px-1.5">
        <h2 id={id} className="shrink-0 text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-foreground/65">
          {etykieta}
        </h2>
        {meta && (
          <span className="min-w-0 truncate text-[11px] leading-4 tabular-nums text-foreground/65">
            {meta}
          </span>
        )}
        {akcja && <span className="ml-auto flex shrink-0 items-center">{akcja}</span>}
      </div>
      {children}
    </section>
  );
};

/**
 * AKCJA SEKCJI — słowo z ikoną w wierszu nazwy („Edytuj", „Otwórz ↗").
 *
 * Bez obudowy przycisku, w tym samym stopniu pisma co nazwa, żeby wiersz
 * został jedną linią tekstu. Obszar kliknięcia jest większy niż litery
 * (ujemne marginesy z wyściółką), a na dotyku 44 × 44 px daje
 * `nb-cel-dotyku-wokol` — wiersz nie rośnie ani o piksel.
 */
export const AkcjaSekcji: React.FC<{
  onClick: () => void;
  ikona?: React.ReactNode;
  /** ikona przed słowem (np. ołówek) zamiast po nim (strzałka) */
  ikonaPrzed?: boolean;
  children: React.ReactNode;
}> = ({ onClick, ikona, ikonaPrzed, children }) => (
  <button
    type="button"
    onClick={onClick}
    data-tap-target="off"
    className={cn(
      'nb-cel-dotyku-wokol -mx-1.5 -my-1 inline-flex items-center gap-1 rounded-md px-1.5 py-1',
      'text-[11px] font-medium leading-4 text-foreground/65 transition-colors hover:text-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
    )}
  >
    {ikonaPrzed && ikona}
    {children}
    {!ikonaPrzed && ikona}
  </button>
);
