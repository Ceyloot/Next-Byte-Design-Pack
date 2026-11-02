import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PASEK NARZĘDZI — pływająca szklana pastylka z przyciskami (26.09.2026)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał, o pasku górnym notatek: „ogarnij pasek górny i jego elementy, bo
 * każdy przycisk wygląda praktycznie inaczej". Zmierzone na zrzucie: w jednym
 * pasku było PIĘĆ języków przycisku — gołe ikony, przyciemniona pigułka „AI",
 * nasycona pigułka „Głos" (wyglądała na włączoną, choć nic nie nagrywało),
 * ciemne pigułki z napisem i osobne przyciski ikon o innym promieniu.
 *
 * Pastylka Asystenta (`PastylkaAsystenta`) miała już dobry przepis — szkło
 * pigułki jako tafla, grupy oddzielone włosową kreską, jeden przycisk ikony —
 * ale jako stałe LOKALNE. Drugi pasek z tym samym przepisem byłby kopią,
 * więc przepis zszedł tutaj. Klasy są 1:1 z pastylką Asystenta, żeby oba
 * paski wyglądały jak jedna rodzina.
 *
 * ── JEDEN JĘZYK PRZYCISKU ───────────────────────────────────────────────
 *   • spoczynek: bez tła i bez obwódki, ikona `foreground/65`,
 *   • najechanie: 6% `--foreground` pod spodem,
 *   • otwarte menu/okno (`data-state=open` od Radiksa): 8% — „wciśnięty",
 *   • `aktywny`: barwa `--primary` — WYŁĄCZNIE dla prawdziwego stanu
 *     przełączonego (panel AI otwarty, AI pracuje, trwa nagranie),
 *   • `niszczacy`: czerwień `--destructive` dopiero przy najechaniu.
 * Przycisk z napisem to TEN SAM przycisk, tylko z tekstem obok ikony.
 *
 * ── DOTYK ────────────────────────────────────────────────────────────────
 * Widoczne 32 px, ale palec dostaje 44 × 44 przez `nb-cel-dotyku-wokol`
 * (niewidoczne `::after`), a globalna reguła 44 px jest wyłączona
 * (`data-tap-target="off"`) — inaczej pasek urósłby do 44 px w każdym
 * przycisku i przestał być pastylką.
 */

/** Grupy oddziela włosowa kreska; pierwsza WIDOCZNA grupa jej nie ma (patrz `PasekNarzedzi`). */
export const KLASY_GRUPY_PASKA = 'flex shrink-0 items-center gap-0.5 border-l border-foreground/10 pl-1 ml-1 empty:hidden';

/** Rdzeń przycisku paska — dla miejsc, które muszą użyć własnego elementu (np. awatar-przycisk). */
export const KLASY_PRZYCISKU_PASKA = cn(
  'nb-cel-dotyku-wokol inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full',
  'text-[13px] font-medium text-foreground/65 transition-colors duration-150',
  'hover:bg-foreground/[0.06] hover:text-foreground',
  'data-[state=open]:bg-foreground/[0.08] data-[state=open]:text-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
  'disabled:pointer-events-none disabled:opacity-40',
);

export interface PasekNarzedziProps extends React.HTMLAttributes<HTMLDivElement> {
  /** nazwa paska dla czytnika ekranu — „Narzędzia notatki" */
  etykieta: string;
}

/**
 * Sama pastylka. `pointer-events-auto`, bo paski leżą w nakładkach, które
 * przepuszczają kliknięcia do treści pod spodem — łapie je tylko pastylka.
 */
export const PasekNarzedzi = React.forwardRef<HTMLDivElement, PasekNarzedziProps>(function PasekNarzedzi(
  { etykieta, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={etykieta}
      className={cn(
        'pointer-events-auto nb-szklo nb-szklo-pigulka nb-szklo-tafla flex h-11 max-w-full items-center rounded-full border border-border/60 px-1.5',
        /* Ten sam cień i obwódka co pole wpisywania czatu i pastylka Asystenta. */
        'shadow-2xl shadow-primary/5 ring-1 ring-foreground/[0.04]',
        '[&>*:first-child]:ml-0 [&>*:first-child]:border-l-0 [&>*:first-child]:pl-0',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

/** Grupa przycisków o jednym znaczeniu (edycja, narzędzia, dokument…). */
export const GrupaPaska: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div role="group" className={cn(KLASY_GRUPY_PASKA, className)} {...rest} />
);

export interface PrzyciskPaskaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ikona: LucideIcon;
  /** nazwa czynności — trafia do czytnika ekranu i do podpowiedzi */
  etykieta: string;
  /** pokaż napis obok ikony (domyślnie sama ikona z podpowiedzią) */
  zNapisem?: boolean;
  /** krótszy napis widoczny w pasku, gdy `etykieta` jest dłuższa („AI" zamiast „Asystent AI") */
  napis?: React.ReactNode;
  /** prawdziwy stan przełączony — jedyny powód, żeby przycisk miał kolor */
  aktywny?: boolean;
  /** czerwień przy najechaniu — kosz, usunięcie */
  niszczacy?: boolean;
  /** kręcące się kółko zamiast ikony (np. „AI pracuje") */
  laduje?: boolean;
  /** podpowiedź; domyślnie `etykieta` przy samej ikonie, brak przy przycisku z napisem; `false` wyłącza */
  podpowiedz?: React.ReactNode | false;
}

export const PrzyciskPaska = React.forwardRef<HTMLButtonElement, PrzyciskPaskaProps>(function PrzyciskPaska(
  { ikona: Ikona, etykieta, zNapisem, napis, aktywny, niszczacy, laduje, podpowiedz, className, type = 'button', ...rest },
  ref,
) {
  const przycisk = (
    <button
      ref={ref}
      type={type}
      data-tap-target="off"
      aria-label={zNapisem && !napis ? undefined : etykieta}
      aria-pressed={aktywny === undefined ? undefined : aktywny}
      className={cn(
        KLASY_PRZYCISKU_PASKA,
        zNapisem ? 'pl-2.5 pr-3' : 'w-8',
        aktywny && 'bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary data-[state=open]:bg-primary/20 data-[state=open]:text-primary',
        niszczacy && 'hover:bg-destructive/10 hover:text-destructive',
        className,
      )}
      {...rest}
    >
      {laduje
        ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
        : <Ikona className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {zNapisem && <span className="whitespace-nowrap">{napis ?? etykieta}</span>}
    </button>
  );

  const tresc = podpowiedz === false ? null : podpowiedz ?? (zNapisem ? null : etykieta);
  if (!tresc) return przycisk;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{przycisk}</TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{tresc}</TooltipContent>
    </Tooltip>
  );
});
