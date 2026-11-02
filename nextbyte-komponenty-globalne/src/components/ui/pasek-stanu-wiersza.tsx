import React from 'react';
import { cn } from '@/lib/utils';
import type { StanWiersza } from '@/eksport/stanWiersza';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PASEK STANU WIERSZA — pionowy, owalny, świecący (§3C-1)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (19.09.2026): „na początku każdego rekordu pionowy, lekko owalny pasek, który będzie świecił
 * się na kolor z oznaczeniami powiadomienia (…) jeśli pasek ma inny kolor niż zielony, to po najechaniu
 * ma się wyświetlić komunikat, który pokaże, jakie powiadomienia widnieją wewnątrz danego klienta”.
 *
 * Wspólny dla WSZYSTKICH list platformy (§14: jedna forma listy) — Panel Klienta bierze go pierwszy,
 * lista CRM tym samym ruchem, bez drugiej definicji.
 *
 * ⚠️ PASEK SIEDZI W KOMÓRCE, NIE W WIERSZU. Pseudo-element w `<tr>` staje się anonimową komórką
 * i przesuwa kolumny — zmierzone 17.09.2026 na tej samej liście. Dlatego pierwsza komórka dostaje
 * `relative`, a pasek stoi w niej absolutnie.
 *
 * ⚠️ ZIELONY NIE MA DYMKA. Dymek mówi, co wymaga pracy; „nic nie wymaga pracy” nie potrzebuje zdania.
 */
const TON_BARWA: Record<StanWiersza['ton'], string> = {
  dobrze: 'var(--success)',
  uwaga: 'var(--warning)',
  problem: 'var(--destructive)',
};

const TON_SLOWO: Record<StanWiersza['ton'], string> = {
  dobrze: 'Nic nie czeka',
  uwaga: 'Czeka na uzupełnienie',
  problem: 'Brakuje danych, które blokują zamówienie',
};

/**
 * WARIANTY UŁOŻENIA — ten sam znak, dwa kształty pojemnika.
 *
 * `wiersz` (domyślny): pasek wyśrodkowany w komórce, 58 % jej wysokości. Tak stoi w listach.
 *
 * `karta` (Kajetan, 20.09.2026): „pionowe paski ukazujące status na wysokość zdjęcia, zgodne
 * z zaokrągleniem zdjęcia w narożu”. Na karcie Pipeline pasek wyśrodkowany w CAŁEJ karcie zaczynał
 * się w połowie zdjęcia i kończył w połowie treści — wisiał w poprzek dwóch różnych rzeczy.
 * Wariant `karta` przykleja go do lewej krawędzi obszaru zdjęcia: od górnej krawędzi karty na
 * wysokość zdjęcia, z górnym rogiem zaokrąglonym tak jak róg karty, więc pasek jest jej częścią,
 * a nie czymś położonym na wierzchu.
 */
export type WariantPaska = 'wiersz' | 'karta';

export const PasekStanuWiersza: React.FC<{
  stan: StanWiersza;
  wariant?: WariantPaska;
  className?: string;
}> = ({ stan, wariant = 'wiersz', className }) => {
  const barwa = TON_BARWA[stan.ton];
  /* ⚠️ SAM PASEK, BEZ DYMKA. Dymek siedzi na CAŁYM wierszu (Kajetan 19.09.2026: „chciałbym, żeby
     dymek pojawiał się po najechaniu na rekord klienta i po 1 sek się pojawił”) — celowanie w 4 px
     było ćwiczeniem z precyzji, a nie czytaniem listy. Pasek zostaje znakiem, nie przyciskiem. */
  /* `h-20` = wysokość slotu zdjęcia na karcie Pipeline (80 px, zarezerwowana także wtedy, gdy
     zdjęcia nie ma — patrz `PipelineBoard`). Promień górnego rogu ten sam, co karty (`rekord`). */
  const pojemnik = wariant === 'karta'
    ? 'absolute left-0 top-0 flex h-20 w-1 items-center'
    : 'absolute left-0 top-1/2 flex h-[58%] w-4 -translate-y-1/2 items-center';
  const ksztalt = wariant === 'karta'
    ? 'h-full w-full rounded-tl-rekord rounded-br-full rounded-tr-full'
    : 'h-full w-1 rounded-full';

  return (
    <span aria-hidden="true" className={cn('pointer-events-none', pojemnik, className)}>
      <span
        className={ksztalt}
        style={{
          background: `hsl(${barwa})`,
          /* Poświata w barwie paska — „świecił się”; przy zielonym słabsza, bo zielony nie woła o uwagę. */
          boxShadow: `0 0 8px hsl(${barwa} / ${stan.ton === 'dobrze' ? 0.35 : 0.65})`,
        }}
      />
    </span>
  );
};

/** Nagłówek dymka wiersza — zdanie w tonie stanu. */
export const TYTUL_STANU = TON_SLOWO;

export default PasekStanuWiersza;
