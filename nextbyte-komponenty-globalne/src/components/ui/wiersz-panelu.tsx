import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * WIERSZ LISTY PANELU — jeden wygląd dla „Czeka na Ciebie" i „Wróć do roboty".
 *
 * Wiersz-odnośnik BEZ RAMKI (w odróżnieniu od `TileRow`, który jest wierszem
 * w ramce, do list ustawień i pozycji z przełącznikami). W bibliotece, bo tym
 * samym wierszem mówią listy Personalnego Asystenta.
 *
 * 26.09.2026: dwie listy stojące obok siebie miały dwa różne wiersze —
 * skrzynka rysowała każdą sprawę w osobnej ramce z kolorową ikoną w kwadracie
 * i pigułką wersalikami, lista ostatnich rzeczy miała wiersze bez ramek.
 * Zostaje ten drugi język (decyzja z 07.09: „ramka wokół każdej pozycji robiła
 * z listy ścianę pudełek"), teraz w jednym miejscu:
 *
 *   · stała wysokość 52 px — listy przewijają się w środku kart, a sufit
 *     liczony z wysokości wiersza musi się zgadzać co do piksela,
 *   · tytuł 13 px w `--foreground`, kontekst 11 px w `--foreground` 65%
 *     (nie `--muted-foreground` — na jasnym motywie miał 4,3 : 1 na szybie),
 *   · to, co po prawej (czas, termin), 11 px z cyframi tabelarycznymi,
 *     żeby kolumna godzin nie falowała,
 *   · powierzchnia i strzałka „otwórz" pojawiają się dopiero pod kursorem
 *     (ta sama strzałka, co w kafelkach Szybkiej podróży); miejsce na nią
 *     jest zarezerwowane, więc kolumna czasu nie skacze przy najechaniu
 *     (na dotyku, gdzie najechania nie ma, strzałki i jej miejsca nie ma).
 */

export const WYSOKOSC_WIERSZA_PANELU = 52;

interface WierszPaneluProps {
  to: string;
  tytul: React.ReactNode;
  kontekst?: React.ReactNode;
  /** miniatura / znak po lewej — opcjonalny */
  przed?: React.ReactNode;
  /** czas albo termin po prawej */
  po?: React.ReactNode;
  /** klasa koloru dla `po` — np. `text-destructive` przy terminie po czasie */
  kolorPo?: string;
  /** dopowiedzenie w `title` (np. „Otworzy moduł Studio Zdjęć") */
  podpowiedz?: string;
  /** coś doklejone przy tytule, np. licznik serii „×5" */
  przyTytule?: React.ReactNode;
}

/** Wiersz-odnośnik listy bez ramki: znak, tytuł, kontekst, czas/termin, strzałka pod kursorem. */
export const WierszPanelu: React.FC<WierszPaneluProps> = ({
  to, tytul, kontekst, przed, po, kolorPo, podpowiedz, przyTytule,
}) => (
  <Link
    to={to}
    title={podpowiedz}
    className={cn(
      'group flex items-center gap-3 rounded-xl px-2.5 transition-colors duration-150',
      'hover:bg-foreground/[0.05] focus-visible:bg-foreground/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50',
    )}
    style={{ height: WYSOKOSC_WIERSZA_PANELU }}
  >
    {przed}
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-1.5">
        <span className="truncate text-[13px] leading-5 text-foreground">{tytul}</span>
        {przyTytule}
      </span>
      {kontekst && (
        <span className="block truncate text-[11px] leading-4 text-foreground/65">{kontekst}</span>
      )}
    </span>
    {po && (
      <span className={cn('shrink-0 text-[11px] tabular-nums', kolorPo ?? 'text-foreground/65')}>
        {po}
      </span>
    )}
    <ArrowUpRight
      aria-hidden="true"
      className="-ml-1 h-3.5 w-3.5 shrink-0 text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:hidden"
    />
  </Link>
);
