import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import AnimatedTabs from '@/components/ui/AnimatedTabs';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  ZAKŁADKI — PRZEJŚCIÓWKA NA `AnimatedTabs`
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał zobaczył w Bibliotece dwa różne paski jeden pod drugim:
 * „czemu mamy 2 style paska zakładek na platformie? 1 powinniśmy mieć,
 * a drugi to rozwijany styl i też glassmorphizm".
 *
 * Miał rację. Na platformie żyły TRZY komponenty zakładek:
 *   • `AnimatedTabs`   88 plików   pigułka z wirującym rantem   ← ZOSTAJE
 *   • `Zakladki`        8 plików   znacznik pod etykietą
 *   • shadcn `tabs`     1 plik
 *
 * Wygrywa ten z 88 plików — i ten, o którym Michał sam powiedział wcześniej
 * „bo on mi się bardzo podoba". Jego wariant rozwijany (poniżej `sm`) jest
 * dokładnie tym „drugim stylem", o który pyta: lista na szkle, z ograniczoną
 * wysokością i przewijaniem. Czyli drugi styl już mamy i nie trzeba go pisać.
 *
 * DLACZEGO PRZEJŚCIÓWKA, A NIE PRZEPISANIE OŚMIU WYWOŁAŃ
 * API różni się w jednym istotnym miejscu: `Zakladki` przyjmuje `ikona` jako
 * KOMPONENT (`MessageSquare`), a `AnimatedTabs` gotowy element
 * (`<MessageSquare className="…" />`). Ręczne przepisanie ośmiu wywołań to
 * osiem okazji na zgubiony licznik albo rozjechany rozmiar ikony. Tutaj
 * tłumaczenie dzieje się RAZ i jest sprawdzalne w jednym miejscu.
 * Efekt dla oka jest natychmiastowy — wszystkie zakładki wyglądają tak samo.
 * Migracja samych wywołań może iść później; nic od niej nie zależy.
 *
 * CO PRZY OKAZJI DOSZŁO DO `AnimatedTabs`: `licznik` i `grupa` — jedyne dwie
 * rzeczy, których mu brakowało względem `Zakladki`. Nic nie ginie.
 *
 * CO PRZEPADŁO ŚWIADOMIE: mierzony znacznik pod etykietą i poziome przewijanie
 * paska na telefonie. `AnimatedTabs` rozwiązuje oba inaczej — pigułka jedzie
 * za pomiarem `framer-motion`, a na telefonie pasek zwija się w listę zamiast
 * przewijać. To jest wybór jednego zachowania zamiast dwóch, a nie regres.
 */

export interface Zakladka {
  id: string;
  /**
   * WĘZEŁ, NIE TYLKO TEKST — rozszerzone 05.08.2026.
   *
   * `AnimatedTabs` pod spodem od zawsze przyjmował `React.ReactNode`; to ta
   * przejściówka zawężała go do `string`. Przez to zakładka „Premium" na
   * /akademia nie mogła nieść pulsującej kropki „subskrypcja aktywna" i
   * została tam własnym paskiem — bez materiału, czyli płytą nad tłem.
   * Zawężenie w przejściówce jest powodem duplikatu, więc znika zawężenie,
   * a nie zakładka.
   */
  etykieta: React.ReactNode;
  ikona?: LucideIcon;
  /** liczba przy etykiecie — np. liczba zgłoszeń w kolejce */
  licznik?: number;
  /** nazwa grupy; gdy podana przy choć jednej zakładce, pasek dzieli się na sekcje */
  grupa?: string;
}

export interface ZakladkiProps {
  zakladki: Zakladka[];
  aktywna: string;
  onZmiana: (id: string) => void;
  /** Zachowane dla zgodności wywołań. `AnimatedTabs` sam pilnuje progu dotyku
   *  (36 px od `sm`, 44 px na telefonie), więc nie ma tu czego przełączać. */
  zwarte?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const Zakladki: React.FC<ZakladkiProps> = ({
  zakladki, aktywna, onZmiana, className,
}) => (
  <AnimatedTabs
    className={className}
    activeTab={aktywna}
    onTabChange={onZmiana}
    /* Osobny `layoutId` na pasek, wyprowadzony z listy pozycji. Bez tego dwa
       paski na jednym ekranie dzieliłyby jedną animowaną pigułkę i skakałaby
       ona między nimi — widać to od razu w Bibliotece, gdzie stoją obok. */
    layoutId={`zakladki-${zakladki.map(z => z.id).join('-').slice(0, 40)}`}
    mobileDropdown
    tabs={zakladki.map(z => ({
      value: z.id,
      label: z.etykieta,
      icon: z.ikona ? <z.ikona className="h-3.5 w-3.5" /> : undefined,
      licznik: z.licznik,
      grupa: z.grupa,
    }))}
  />
);

/** Panel treści zakładki — `AnimatedTabs` renderuje sam pasek, nie zawartość. */
export const PanelZakladki: React.FC<{
  id: string; aktywna: string; children: React.ReactNode; className?: string;
}> = ({ id, aktywna, children, className }) =>
  id !== aktywna ? null : (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`zakladka-${id}`} tabIndex={0} className={cn('outline-none', className)}>
      {children}
    </div>
  );
