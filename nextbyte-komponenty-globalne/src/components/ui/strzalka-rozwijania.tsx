import { Button } from '@/components/ui/button';
import { Dymek } from '@/components/ui/naglowek-sekcji';
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  STRZAŁKA ROZWIJANIA — jedna dla każdego rekordu, kontenera i paska
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (17.09.2026): „trzeba ujednolicić strzałki rozwijania rekordów czy kontenerów”. Na jednym ekranie
 * stały trzy wzory: „>” zamieniane na „v”, „v” obracane do „^” i „v” bez ruchu — raz po lewej, raz po prawej.
 * Reguła: docs/STANDARD-WYGLADU.md §2a.
 *
 *   zamknięty — strzałka w dół · otwarty — obrót o 180° (w górę) · 16 px · kolor t2 · ruch 160 ms
 *   zawsze OSTATNI element wiersza, przy prawym brzegu — za danymi, kodem systemowym i przyciskami akcji.
 *
 * Stan podaje `otwarty`. Bez niego strzałka czyta stan rodzica: `<details class="group">`
 * albo Radix `Collapsible` z klasą `group` (atrybut data-state="open").
 * „Przejdź dalej” (nawigacja do innego ekranu) to NIE rozwijanie — tam zostaje `ChevronRight` bez obrotu.
 */
export const StrzalkaRozwijania: React.FC<{ otwarty?: boolean; className?: string }> = ({ otwarty, className }) => (
  <ChevronDown
    aria-hidden="true"
    className={cn(
      'h-4 w-4 shrink-0 text-t2 transition-transform duration-szybko ease-system',
      otwarty === undefined ? 'group-open:rotate-180 group-data-[state=open]:rotate-180' : otwarty && 'rotate-180',
      className,
    )}
  />
);

export default StrzalkaRozwijania;

/**
 * PRZEŁĄCZNIK SEKCJI — cichy przycisk 32×32 z jedną strzałką platformy (§12, §2a).
 *
 * ⚠️ WYNIESIONY Z `ClientTasks` 21.09.2026, a nie napisany od nowa. Archiwum z CRM wchodzi na dół
 * KAŻDEJ zakładki Panelu (Kajetan: „każda zakładka powinna mieć coś takiego jak rozwijany kontener
 * na samym dole”), więc ten sam ruch musiałby powstać w kilku plikach — a duplikat komponentu to
 * dług, który w tym repo raz kosztował tygodnie sprzątania (CLAUDE.md, żelazna zasada biblioteki).
 */
export const PrzelacznikSekcji: React.FC<{ otwarty: boolean; onPrzelacz: () => void }> = ({ otwarty, onPrzelacz }) => (
  <Dymek tytul={otwarty ? 'Zwiń sekcję' : 'Rozwiń sekcję'}
    opis={otwarty ? 'Chowa wiersze tej sekcji — zostaje sam nagłówek z licznikiem.' : 'Pokazuje wiersze tej sekcji.'}>
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrzelacz} aria-expanded={otwarty}>
      <StrzalkaRozwijania otwarty={otwarty} />
    </Button>
  </Dymek>
);
