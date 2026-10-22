import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * KAFELEK — jeden wygląd, zmienia się tylko treść.
 * Official NextByte Production Tile Component System
 */

/* ── SKALA UNIESIENIA — trzy stopnie ─────────────────────────────────────── */
const ELEWACJA = {
  /** w płaszczyźnie strony — tylko obramowanie */
  plaska: 'shadow-none',
  /** domyślny kafelek z efektem szkła */
  uniesiona:
    'shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.28),inset_0_1px_0_0_rgb(255_255_255/0.12)]',
  /** kafelek pod kursorem, panel nakładany */
  wyzej:
    'shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4),inset_0_1px_0_0_rgb(255_255_255/0.18)]',
} as const;

/* ── INTENCJA — sens, nie kolor. Mapowana na zmienne motywu ─────────────── */
const INTENCJA = {
  neutralna: { obwodka: 'border-white/10 dark:border-white/10', ikona: 'text-foreground/70', chip: 'bg-white/[0.04]' },
  akcent:    { obwodka: 'border-primary/25',                    ikona: 'text-primary',          chip: 'bg-primary/10' },
  krytyczna: { obwodka: 'border-destructive/30',                ikona: 'text-destructive',      chip: 'bg-destructive/10' },
} as const;

export type Elewacja = keyof typeof ELEWACJA;
export type Intencja = keyof typeof INTENCJA;

/* ── PROMIENIE ────────────────────────────────────────────────────────── */
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
    'nb-szklo',
    ELEWACJA[elewacja],
    'transition-all duration-200',
    interaktywny && 'cursor-pointer hover:border-primary/40 hover:shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4)]',
    zwarty ? 'p-3.5' : 'p-5 lg:p-6',
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

/* ── NAGŁÓWEK KAFELKA ─────────────────────────────────────────────────── */
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
        <span className="block truncate text-sm font-semibold text-foreground">{tytul}</span>
        {podtytul && <span className="mt-0.5 block truncate text-xs text-foreground/60">{podtytul}</span>}
      </span>
      {poPrawej && <span className="ml-auto shrink-0">{poPrawej}</span>}
    </div>
  );
};

/* ── WIERSZ WEWNĄTRZ KAFELKA — Czysta bezszwowa integracja ze szkłem ─────── */
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
        PROMIEN.wiersz, 'flex items-center gap-2 border p-2.5 backdrop-blur-sm',
        intencja === 'neutralna' ? 'border-white/10 bg-white/[0.03] dark:border-white/10 dark:bg-white/[0.03]' : cn(i.obwodka, i.chip),
        className,
      )}
      {...rest}
    >
      {Ikona && <Ikona className={cn('h-3.5 w-3.5 shrink-0', i.ikona)} />}
      <span className="min-w-0 flex-1 truncate text-xs text-foreground">{children}</span>
      {poPrawej && <span className="ml-auto shrink-0 text-[10px] text-foreground/60">{poPrawej}</span>}
    </div>
  );
};

/* ── PIGUŁKA STATUSU / ZNACZNIK ──────────────────────────────────────── */
export const TilePill: React.FC<{ intencja?: Intencja; children: React.ReactNode; className?: string }> = ({
  intencja = 'akcent', children, className,
}) => {
  const i = INTENCJA[intencja];
  return (
    <span className={cn(
      PROMIEN.pigulka, 'inline-flex items-center border border-white/10 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm',
      i.chip, i.ikona, className,
    )}>
      {children}
    </span>
  );
};

/* ── AKCJA / PRZYCISK KAFELKA ─────────────────────────────────────────── */
const AKCJA = {
  glowna: 'border-primary/40 bg-primary/[0.08] text-primary hover:border-primary/70 hover:bg-primary/[0.15]',
  wtorna: 'border-foreground/15 bg-foreground/[0.04] text-foreground hover:border-foreground/30 hover:bg-foreground/[0.08]',
  cicha:  'border-transparent bg-transparent text-foreground/60 hover:bg-foreground/[0.05] hover:text-foreground',
  usun:   'border-destructive/40 bg-destructive/[0.08] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.15]',
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
        PROMIEN.wiersz, 'inline-flex h-9 items-center justify-center gap-1.5 border text-xs font-semibold backdrop-blur-md',
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
