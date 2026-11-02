import React, { useId, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Status } from '@/components/ui/status';
import { ROZMIAR, WAGA } from '@/components/ui/typografia';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  LINIA AKCJI — jedno zdanie o tym, co platforma zrobiła sama, z „Cofnij"
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał (30.09.2026, pamięć projektu): „sam aby zapisywał i widać, kiedy
 * zapisał, i można cofnąć, jak ktoś nie chce akurat".
 *
 * `KartaAkcji` to kafelek — dobry, gdy akcja jest treścią odpowiedzi
 * (dodane zadanie, dokument). Zapis w pamięci jest skutkiem ubocznym: ma być
 * widoczny, ale nie może rozpychać rozmowy kartą ani znikać jak toast.
 * Stąd linijka pod odpowiedzią: czynność, obiekt, GODZINA (pełna data
 * w dymku — na dotyku dymka nie ma, więc godzina stoi w tekście) i jedna
 * akcja. Po cofnięciu akcja znika, a stan mówi `Status` z biblioteki.
 *
 * Bez szkła i bez własnych barw: tekst wyciszony, akcja w akcencie
 * (`nb-tekst-akcent` — w jasnym motywie ciemniejszy, bo 11 px w `--primary`
 * miało 3,93 : 1), „Cofnięto" to neutralny `Status`. Rozmiar 11 px ze skali
 * `typografia.ts`.
 *
 * DOTYK (przegląd 30.09.2026): przycisk ma realne 44×44 px i wiersz tyle
 * samo — bez ujemnych marginesów. Z nimi linijki stały co 31,5 px, a pole
 * „Cofnij" sięgało do następnej: stuknięcie pod słowem cofało inną zmianę.
 * Tekst da się rozwinąć stuknięciem (pełna treść + `szczegoly`), bo skrót
 * obiektu ma ~90 znaków, a `title` na dotyku nie istnieje. Zwinięty tekst
 * zawija się w całości — nie ucinamy go wielokropkiem (26.10.2026).
 */

export interface AkcjaLinii {
  etykieta: string;
  /** Może zwrócić obietnicę — przycisk zablokuje się do jej końca. */
  onClick: () => void | Promise<void>;
  /** Dymek: co się stanie po kliknięciu. */
  opis?: string;
  /** Stan jeszcze nieznany (np. czekamy na bazę) — przycisk stoi, ale nieaktywny. */
  wylaczona?: boolean;
}

export interface LiniaAkcjiProps {
  ikona?: LucideIcon;
  /** Czynność bez kropki: „Zapisano w pamięci projektu". */
  czynnosc: string;
  /** Obiekt czynności — zwykle skrót treści, pokazywany w cudzysłowie. */
  obiekt?: string;
  /** Pełna treść obiektu — po rozwinięciu linijki (stuknięcie w tekst). */
  obiektPelny?: string;
  /** Dodatkowe zdanie po rozwinięciu, np. poprzednia treść przy poprawce. */
  szczegoly?: string;
  /** Kiedy — godzina w tekście, pełna data w dymku. */
  kiedy?: string | Date | null;
  stan?: 'gotowe' | 'cofnieto';
  akcja?: AkcjaLinii | null;
  className?: string;
}

function godzina(kiedy: string | Date | null | undefined): { krotko: string; pelna: string } | null {
  if (!kiedy) return null;
  const d = kiedy instanceof Date ? kiedy : new Date(kiedy);
  if (Number.isNaN(d.getTime())) return null;
  return {
    krotko: d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    pelna: d.toLocaleString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
}

/** Linia akcji — jedno zdanie pod odpowiedzią o tym, co platforma zrobiła sama: czynność, obiekt, godzina i „Cofnij” (albo stan „Cofnięto”). */
export const LiniaAkcji: React.FC<LiniaAkcjiProps> = ({ ikona: Ikona, czynnosc, obiekt, obiektPelny, szczegoly, kiedy, stan = 'gotowe', akcja, className }) => {
  const [trwa, setTrwa] = useState(false);
  const [rozwiniete, setRozwiniete] = useState(false);
  /* Opis linijki dla czytnika ekranu przy „Cofnij" — przy kilku zmianach
     w jednej odpowiedzi same „Cofnij" nie mówią, którą zmianę cofają. */
  const opisId = useId();
  const czas = godzina(kiedy);
  const cofnieto = stan === 'cofnieto';
  const pelny = obiektPelny && obiektPelny !== obiekt ? obiektPelny : null;
  const daSieRozwinac = !!(pelny || szczegoly);

  const kliknij = async () => {
    if (!akcja || akcja.wylaczona || trwa) return;
    const wynik = akcja.onClick();
    if (wynik && typeof (wynik as Promise<void>).then === 'function') {
      setTrwa(true);
      try { await wynik; } finally { setTrwa(false); }
    }
  };

  const tresc = (
    /* BEZ `line-clamp` (26.10.2026). Michał na zrzucie z małego okna Asystenta:
       „Zaktualizowano pamięć: „ulubione lody: lubi całkowicie..." — tekst się nie
       ucina. Obiekt i tak jest skrótem do ~90 znaków (`opisZmianyPamieci`,
       `skrotTresci`), więc linijka zawija się do 2–3 wierszy; dłuższą treść
       pokazuje stuknięcie (`obiektPelny`). */
    <span id={opisId} className="break-words">
      <span className={cn(WAGA.mocna, !cofnieto && 'text-foreground/80')}>{czynnosc}</span>
      {obiekt && (
        <>
          {': '}
          <span className={cn(WAGA.zwykla, cofnieto && 'line-through decoration-muted-foreground/60')}>„{rozwiniete && pelny ? pelny : obiekt}”</span>
        </>
      )}
      {rozwiniete && szczegoly && <span className={cn(WAGA.zwykla, 'mt-0.5 block')}>{szczegoly}</span>}
    </span>
  );

  return (
    <div
      role="status"
      aria-live="polite"
      data-stan={stan}
      className={cn(
        'flex min-w-0 items-start gap-1.5 text-muted-foreground [@media(pointer:coarse)]:items-center',
        ROZMIAR.etykieta,
        className,
      )}
    >
      {Ikona && <Ikona aria-hidden="true" className="mt-px h-3 w-3 shrink-0" />}
      {daSieRozwinac ? (
        <button
          type="button"
          onClick={() => setRozwiniete((v) => !v)}
          aria-expanded={rozwiniete}
          title={rozwiniete ? undefined : (pelny ?? obiekt)}
          className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {tresc}
        </button>
      ) : (
        <p className="min-w-0 flex-1" title={obiekt}>{tresc}</p>
      )}
      <span className="flex shrink-0 items-center gap-1.5">
        {czas && (
          <time className="tabular-nums" dateTime={new Date(kiedy as string | Date).toISOString()} title={czas.pelna}>
            {czas.krotko}
          </time>
        )}
        {cofnieto ? (
          <Status className="py-0.5">Cofnięto</Status>
        ) : akcja ? (
          <button
            type="button"
            onClick={() => { void kliknij(); }}
            disabled={trwa || !!akcja.wylaczona}
            aria-busy={trwa || undefined}
            aria-describedby={opisId}
            title={akcja.opis}
            className={cn(
              'nb-tekst-akcent inline-flex items-center justify-center rounded-md px-1.5 py-0.5 transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
              /* Wysokość 44 px na dotyku daje globalna reguła przycisków; szerokość tutaj. */
              '[@media(pointer:coarse)]:min-w-11',
              WAGA.mocna,
            )}
          >
            {akcja.etykieta}
          </button>
        ) : null}
      </span>
    </div>
  );
};

export default LiniaAkcji;
