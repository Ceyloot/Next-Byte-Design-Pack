/* ═══════════════════════════════════════════════════════════════
   KLOCKI KAFELKOWE — język ekranów platformy (Panel Główny, Studio
   Zdjęć, Studio Video, Tablice), przepisany ze zrzutów 1:1:

   • KAFEL — szklany kafelek: rounded-2xl, rant foreground/0.10,
     wypełnienie card ~55% z rozmyciem, światło na górnej krawędzi.
   • Zakladki — segmentowe pigułki na środku u góry
     („Generator | Pro Editor | Ruch z filmu").
   • NaglowekSekcji — „▣ Wszystkie filmy · 0" po lewej, filtry po prawej.
   • Etykieta — „SZYBKA PODRÓŻ": wersaliki 11 px, rozstrzelone, nad kafelkami.
   ═══════════════════════════════════════════════════════════════ */

import React from 'react';
import { cn } from '@/lib/utils';

export const KAFEL =
  'rounded-2xl border border-foreground/[0.10] bg-[hsl(var(--card)/0.55)] backdrop-blur-md shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.05),0_10px_30px_-14px_hsl(0_0%_0%/0.6)]';

export const KAFEL_KLIK = cn(KAFEL, 'transition-all duration-200 hover:border-primary/35 hover:bg-[hsl(var(--card)/0.7)]');

/** Pusty kafelek do dodania — przerywany rant, jak „+ Dodaj skrót". */
export const KAFEL_DODAJ =
  'rounded-2xl border border-dashed border-foreground/[0.24] bg-[hsl(var(--card)/0.3)] text-foreground/55 transition-colors hover:border-primary/40 hover:text-foreground';

export function Zakladki({ pozycje, aktywna, onZmien }) {
  return (
    <div role="tablist" className="inline-flex items-center gap-1 rounded-full border border-foreground/[0.10] bg-[hsl(var(--card)/0.6)] p-1 backdrop-blur-md">
      {pozycje.map(({ id, etykieta, ikona: I, licznik }) => {
        const akt = id === aktywna;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={akt}
            onClick={() => onZmien(id)}
            className={cn(
              'flex h-10 items-center gap-2 rounded-full border px-5 text-[14.5px] font-medium transition-all duration-200',
              akt ? 'border-primary/35 bg-primary/10 text-foreground shadow-[0_0_18px_-8px_hsl(var(--primary)/0.6)]' : 'border-transparent text-foreground/65 hover:text-foreground',
            )}
          >
            {I && <I className={cn('h-4 w-4', akt ? 'text-primary' : '')} />}
            {etykieta}
            {licznik > 0 && <span className="text-[12px] tabular-nums text-foreground/45">{licznik}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function NaglowekSekcji({ ikona: I, tytul, licznik, children }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="flex items-center gap-2 text-[16px] font-semibold text-foreground">
        {I && <I className="h-[18px] w-[18px] text-primary" />}
        {tytul}
        {licznik !== undefined && <span className="font-normal text-foreground/45">· {licznik}</span>}
      </h2>
      {children && <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/** Filtr w pigułce — „Wszystkie / Ulubione / Ukryte". */
export function Filtr({ aktywny, onClick, ikona: I, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium transition-colors',
        aktywny ? 'border-primary/35 bg-primary/10 text-primary' : 'border-foreground/[0.10] bg-[hsl(var(--card)/0.4)] text-foreground/70 hover:text-foreground',
      )}
    >
      {I && <I className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

export function Etykieta({ children, prawa }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-foreground/55">{children}</span>
      {prawa}
    </div>
  );
}
