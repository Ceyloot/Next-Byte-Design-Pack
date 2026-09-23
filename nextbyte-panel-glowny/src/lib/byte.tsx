import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  WALUTA PLATFORMY — JEDNO ŹRÓDŁO ZNAKU
 * ════════════════════════════════════════════════════════════════════════
 *
 * Znak ⟠ (U+27E0, „lozenge divided by horizontal rule") jest wpisany na
 * sztywno w 109 plikach, 313 razy — policzone 19.08.2026. Nie było ani
 * stałej, ani komponentu, więc każda zmiana wyglądu waluty oznaczałaby
 * przejście po całym repozytorium.
 *
 * Ten plik zakłada jedno źródło. NIE przepisuję przy okazji tamtych 313
 * miejsc — to osobna, mechaniczna robota i osobna decyzja Michała. Nowy kod
 * ma sięgać tutaj, a stary można podmieniać stopniowo, przy okazji dotykania
 * danego ekranu.
 *
 * Dlaczego `<IkonaByte>`, a nie sam znak: pasek kart w stopce przyjmuje ikony
 * jak z `lucide-react` (komponent biorący `className`). Bez owijki nie dałoby
 * się postawić waluty obok `Bell` i `User` bez rozjazdu rozmiarów.
 */

/** Znak waluty platformy. Używać zamiast wpisywania „⟠" w JSX. */
export const SYMBOL_BYTE = '⟠';

/** Pełna nazwa jednostki — do zdań, nie do liczb. */
export const NAZWA_BYTE = 'Byte';

interface IkonaByteProps {
  className?: string;
  /** Tytuł dla czytników ekranu; gdy pominięty, znak jest dekoracją. */
  opis?: string;
  /** Grubość kreski — domyślnie jak w `lucide-react`. */
  grubosc?: number;
}

/**
 * Waluta jako IKONA WEKTOROWA, nie znak tekstowy.
 *
 * Pierwsza wersja renderowała `⟠` jako tekst z `font-size: 1.05em`. Michał
 * zobaczył od razu: „totalnie za mały i niewidoczny". Powód jest w samym
 * glifie — ⟠ ma w kroju dużo światła wewnętrznego i cienką kreskę, więc przy
 * tym samym rozmiarze co `Bell` czy `User` czyta się o połowę słabiej.
 * Do tego klasy `h-4 w-4` sterują ikonami przez `width`/`height`, a tekst
 * słucha `font-size` — więc znak nie skalował się razem z sąsiadami.
 *
 * Rysunek w `viewBox="0 0 24 24"` przy `stroke-width: 2` daje dokładnie tę
 * samą wagę optyczną co reszta zestawu i słucha tych samych klas rozmiaru.
 * Kształt: romb przecięty poziomą kreską — to jest ⟠ (U+27E0).
 */
export const IkonaByte: React.FC<IkonaByteProps> = ({ className, opis, grubosc = 2 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={grubosc}
    strokeLinecap="round"
    strokeLinejoin="round"
    role={opis ? 'img' : undefined}
    aria-label={opis}
    aria-hidden={opis ? undefined : true}
    className={cn('shrink-0', className)}
  >
    <path d="M12 2.5 19 12l-7 9.5L5 12z" />
    <path d="M5 12h14" />
  </svg>
);

export default IkonaByte;
