import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  STATUS — jeden komponent do wyświetlania stanu, cztery barwy
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (17.09.2026): „potrzebujemy jednego komponentu wizualnego do wyświetlania statusu; może mieć różny
 * kolor na zasadzie zielony, czerwony, żółty lub biały/szary — ograniczona ilość kolorów”.
 *
 * Znaczenie barw (docs/STANDARD-WYGLADU.md §1):
 *   dobrze    — zielony  — jest, zrobione, zgodne, rozliczone
 *   problem   — czerwony — brak, po terminie, strata, błąd
 *   uwaga     — żółty    — w toku, czeka, do sprawdzenia
 *   neutralny — szary    — informacja bez oceny (liczba, data, etap)
 *
 * Barwy z tokenów motywu (`--success`, `--destructive`, `--warning`, `--muted`) — panel zarządzania wyglądem
 * zmieni je w jednym miejscu. Innych kolorów statusu nie ma: krem to akcja (przycisk), nie stan.
 */

export type TonStatusu = 'dobrze' | 'problem' | 'uwaga' | 'neutralny';

export const TONY_STATUSU: Record<TonStatusu, string> = {
  dobrze: 'border-success/30 bg-success/10 text-success',
  problem: 'border-destructive/35 bg-destructive/10 text-destructive',
  uwaga: 'border-warning/35 bg-warning/10 text-warning',
  neutralny: 'border-border bg-muted/40 text-muted-foreground',
};

export interface StatusProps {
  ton?: TonStatusu;
  /** ikona przed tekstem (lucide), rysowana w rozmiarze 12 px */
  ikona?: React.ElementType;
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export const Status: React.FC<StatusProps> = ({ ton = 'neutralny', ikona: Ikona, title, className, children }) => (
  <span title={title} className={cn(
    'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-meta font-semibold leading-none',
    TONY_STATUSU[ton], className,
  )}>
    {Ikona && <Ikona className="h-3 w-3" />}
    {children}
  </span>
);

/**
 * Ton jako ZMIENNA CSS — dla kafelków i obwódek, które barwią się `--ton` (§16z-6), a nie klasami.
 *
 * ⚠️ JEDNA MAPA NA CAŁĄ PLATFORMĘ. Zapis `ton === 'dobrze' ? 'var(--success)' : …` zdążył się pojawić
 * w dwóch plikach Vidomontu, zanim ktokolwiek go nazwał — trzeci byłby miejscem, w którym któraś kopia
 * zapomni o nowym tonie. Neutralny celowo wraca do barwy marki: kafelek bez stanu ma wyglądać jak
 * kafelek, nie jak stan „nijaki”.
 */
export const zmiennaTonu = (ton: TonStatusu | 'akcent'): string =>
  `var(--${ton === 'dobrze' ? 'success' : ton === 'problem' ? 'destructive' : ton === 'uwaga' ? 'warning' : 'primary'})`;

/** Przejście ze starych intencji pigułki (TilePill) — żeby istniejące funkcje stanu nie musiały zmieniać typów. */
export const tonZIntencji = (i: 'pozytywna' | 'krytyczna' | 'neutralna' | 'akcent' | 'uwaga' | TonStatusu): TonStatusu =>
  i === 'pozytywna' || i === 'dobrze' ? 'dobrze'
    : i === 'krytyczna' || i === 'problem' ? 'problem'
    : i === 'uwaga' ? 'uwaga'
    : 'neutralny';

export default Status;
