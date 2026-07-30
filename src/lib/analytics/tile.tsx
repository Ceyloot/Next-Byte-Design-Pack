import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const ELEWACJA = {
  plaska: 'shadow-none',
  uniesiona: 'shadow-uniesiona',
  wyzej: 'shadow-wyzej',
} as const;

/* ── INTENCJA — sens, nie kolor ─────────────────────────────── */
const INTENCJA = {
  neutralna: { obwodka: 'border-border',            ikona: 'text-muted-foreground', chip: 'bg-muted/60' },
  akcent:    { obwodka: 'border-primary/25',        ikona: 'text-primary',          chip: 'bg-primary/10' },
  krytyczna: { obwodka: 'border-destructive/35',    ikona: 'text-destructive',      chip: 'bg-destructive/10' },
} as const;

export type Elewacja = keyof typeof ELEWACJA;
export type Intencja = keyof typeof INTENCJA;

const PROMIEN = { kafelek: 'rounded-2xl', wiersz: 'rounded-xl', chip: 'rounded-xl', pigulka: 'rounded-full' } as const;

export function klasyKafelka(opcje?: {
  intencja?: Intencja;
  elewacja?: Elewacja;
  interaktywny?: boolean;
  zwarty?: boolean;
}): string {
  const { intencja = 'neutralna', elewacja = 'uniesiona', interaktywny, zwarty } = opcje ?? {};
  return cn(
    PROMIEN.kafelek, 'border', INTENCJA[intencja].obwodka,
    'flex flex-col',
    'bg-card backdrop-blur-xl supports-[backdrop-filter]:bg-card/80',
    ELEWACJA[elewacja],
    'transition-[box-shadow,border-color,background-color] duration-200',
    interaktywny && 'cursor-pointer hover:border-primary/40 hover:shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4),inset_0_1px_0_0_rgb(255_255_255/0.1)]',
    zwarty ? 'p-3.5' : 'p-5',
  );
}

export interface TileProps extends React.HTMLAttributes<HTMLDivElement> {
  intencja?: Intencja;
  elewacja?: Elewacja;
  interaktywny?: boolean;
  zwarty?: boolean;
  children?: React.ReactNode;
}

export const Tile = React.forwardRef<HTMLDivElement, TileProps>(function Tile(
  { intencja = 'neutralna', elewacja = 'uniesiona', interaktywny, zwarty, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(klasyKafelka({ intencja, elewacja, interaktywny, zwarty }), className)}
      {...rest}
    >
      {children}
    </div>
  );
});

/* ── NAGŁÓWEK: chip z ikoną + tytuł + licznik/akcja po prawej ─────────── */
export interface TileHeaderProps {
  ikona?: LucideIcon;
  tytul: React.ReactNode;
  podtytul?: React.ReactNode;
  intencja?: Intencja;
  poPrawej?: React.ReactNode;
  className?: string;
}

export const TileHeader: React.FC<TileHeaderProps> = ({
  ikona: Ikona, tytul, podtytul, intencja = 'akcent', poPrawej, className,
}) => {
  const i = INTENCJA[intencja];
  return (
    <div className={cn('mb-3 flex items-center gap-2.5', className)}>
      {Ikona && (
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center', PROMIEN.chip, i.chip)}>
          <Ikona className={cn('h-4 w-4', i.ikona)} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-card-foreground">{tytul}</span>
        {podtytul && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{podtytul}</span>}
      </span>
      {poPrawej && <span className="ml-auto shrink-0">{poPrawej}</span>}
    </div>
  );
};

/* ── WIERSZ WEWNĄTRZ KAFELKA ────────────────────────────────────────── */
export interface TileRowProps extends React.HTMLAttributes<HTMLDivElement> {
  ikona?: LucideIcon;
  intencja?: Intencja;
  poPrawej?: React.ReactNode;
  children?: React.ReactNode;
}

export const TileRow: React.FC<TileRowProps> = ({
  ikona: Ikona, intencja = 'neutralna', poPrawej, className, children, ...rest
}) => {
  const i = INTENCJA[intencja];
  return (
    <div
      className={cn(
        PROMIEN.wiersz, 'flex items-center gap-2 border p-2.5',
        intencja === 'neutralna' ? 'border-border bg-muted/40' : cn(i.obwodka, i.chip),
        className,
      )}
      {...rest}
    >
      {Ikona && <Ikona className={cn('h-3.5 w-3.5 shrink-0', i.ikona)} />}
      <span className="min-w-0 flex-1 truncate text-xs text-card-foreground">{children}</span>
      {poPrawej && <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{poPrawej}</span>}
    </div>
  );
};

/* ── PIGUŁKA ────────────────────────────────────────────────────────── */
export const TilePill: React.FC<{ intencja?: Intencja; children: React.ReactNode; className?: string }> = ({
  intencja = 'akcent', children, className,
}) => {
  const i = INTENCJA[intencja];
  return (
    <span className={cn(
      PROMIEN.pigulka, 'inline-flex items-center border px-2 py-0.5 text-[10px] font-semibold',
      i.obwodka, i.chip, i.ikona, className,
    )}>
      {children}
    </span>
  );
};

/* ── AKCJA ──────────────────────────────────────────────────────────── */
const AKCJA = {
  glowna: 'border-primary/40 bg-primary/[0.06] text-primary hover:border-primary/70 hover:bg-primary/[0.12]',
  wtorna: 'border-border bg-foreground/[0.02] text-foreground hover:border-border hover:bg-foreground/[0.06]',
  cicha:  'border-transparent bg-transparent text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground',
  usun:   'border-destructive/40 bg-destructive/[0.06] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.12]',
} as const;

export type RodzajAkcji = keyof typeof AKCJA;

export interface TileActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rodzaj?: RodzajAkcji;
  ikona?: LucideIcon;
  samaIkona?: boolean;
}

export const TileAction = React.forwardRef<HTMLButtonElement, TileActionProps>(function TileAction(
  { rodzaj = 'wtorna', ikona: Ikona, samaIkona, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        PROMIEN.wiersz, 'inline-flex h-9 items-center justify-center gap-1.5 border text-xs font-semibold',
        samaIkona ? 'w-9' : 'px-3',
        AKCJA[rodzaj],
        'transition-colors duration-200',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {Ikona && <Ikona className="h-3.5 w-3.5 shrink-0" />}
      {!samaIkona && children}
    </button>
  );
});

export const TileFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('mt-4 flex flex-wrap items-center gap-2', className)}>{children}</div>
);

export const TOKENY_KAFELKA = { ELEWACJA, INTENCJA, PROMIEN, AKCJA } as const;
