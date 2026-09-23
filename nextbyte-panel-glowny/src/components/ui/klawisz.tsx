import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Klawisz — podpowiedź skrótu klawiszowego (`⌘K`, `↵`, `Esc`) w jednym przepisie dla całej platformy:
 * tym samym, którym `pola.tsx` rysuje `skrot` przy polu szukania. Nie wpisuj `<kbd>` z własnymi klasami —
 * użyj tego i ewentualnie dołóż `className` (np. `hidden sm:inline-block`).
 */
export const Klawisz: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, ...props }) => (
  <kbd
    className={cn(
      'pointer-events-none inline-block shrink-0 rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground',
      className,
    )}
    {...props}
  />
);
