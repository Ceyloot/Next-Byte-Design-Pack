import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { przelaczGrupe, stanGrupy } from '@/lib/zaznaczanie';

/**
 * ZAZNACZ GRUPĘ — pole wyboru całości albo grupy (kategorii, sekcji, rodziny) z etykietą (STANDARD-WYGLADU §22,
 * Kajetan 11.10.2026: „jak jest zaznaczanie, to zawsze chcę móc zaznaczyć całość albo kategorię albo jednostkę”).
 *
 * Stan liczy `lib/zaznaczanie`: wszystkie → zaznaczone, część → stan pośredni, żadna → puste. Klik w grupę zaznaczoną
 * w całości ją odznacza, w każdą inną — zaznacza w całości; inne grupy zostają. Etykieta klika się razem z polem.
 * Ekran podaje KLUCZE grupy i bieżący zbiór — wygląd i reguła mieszkają tu, nie w każdej liście osobno.
 */
export interface ZaznaczGrupeProps {
  klucze: readonly string[];
  zaznaczone: ReadonlySet<string>;
  onZmiana: (nowe: Set<string>) => void;
  /** Treść etykiety: „Zaznacz wszystko” albo nazwa kategorii z licznikiem. */
  children: React.ReactNode;
  /** Opis dla czytnika ekranu, gdy etykieta to nie tylko tekst. */
  opis?: string;
  className?: string;
}

export const ZaznaczGrupe: React.FC<ZaznaczGrupeProps> = ({ klucze, zaznaczone, onZmiana, children, opis, className }) => (
  <label className={cn('flex cursor-pointer select-none items-center gap-2', className)}>
    <Checkbox checked={stanGrupy(klucze, zaznaczone)} disabled={klucze.length === 0} aria-label={opis}
      onCheckedChange={() => onZmiana(przelaczGrupe(klucze, zaznaczone))} />
    {children}
  </label>
);

export default ZaznaczGrupe;
