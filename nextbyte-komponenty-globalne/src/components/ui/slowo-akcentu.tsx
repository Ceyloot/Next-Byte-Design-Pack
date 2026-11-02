import React from 'react';
import { cn } from '@/lib/utils';

/**
 * SŁOWO AKCENTU — wyróżniony fragment nagłówka, wypełniony gradientem akcentu.
 *
 * Po co to istnieje (zmierzone 05.08.2026): ten sam łańcuch
 * `bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent`
 * stał przepisany słowo w słowo w OSIEMNASTU plikach — w całej ścieżce
 * `mastery/` (12) i na wszystkich sekcjach `course/landing/` (6).
 *
 * To jest jeden gest typograficzny, nie osiemnaście decyzji. Dopóki był
 * przepisany, zmiana wyglądu wyróżnienia wymagała osiemnastu poprawek —
 * a przy takiej liczbie ktoś zawsze którąś przeoczy i strona sprzedażowa
 * zaczyna mieć dwa różne akcenty obok siebie.
 *
 * UWAGA NA UŻYCIE: to jest fragment ZDANIA, a nie cały nagłówek. Rozmiar,
 * grubość i interlinię niesie `<h1>`/`<h2>` dookoła — tutaj jest wyłącznie
 * wypełnienie. Dlatego komponent nie ustawia ani jednej klasy typograficznej.
 */

const WARIANT = {
  /** Akcent → przygaszony akcent. Domyślny, 18 z 21 wystąpień. */
  akcent: 'from-primary to-primary/60',
  /**
   * Kolor tekstu → akcent. Używane tam, gdzie wyróżnienie jest CAŁYM tytułem
   * (nagłówek panelu, nazwa rozmowy) i musi zaczynać się neutralnie, żeby
   * dało się je czytać jak zwykły tytuł.
   */
  odTekstu: 'from-foreground to-primary',
} as const;

export interface SlowoAkcentuProps {
  children: React.ReactNode;
  wariant?: keyof typeof WARIANT;
  className?: string;
}

export const SlowoAkcentu: React.FC<SlowoAkcentuProps> = ({
  children,
  wariant = 'akcent',
  className,
}) => (
  <span className={cn('bg-gradient-to-r bg-clip-text text-transparent', WARIANT[wariant], className)}>
    {children}
  </span>
);

export const TOKENY_SLOWA_AKCENTU = WARIANT;
