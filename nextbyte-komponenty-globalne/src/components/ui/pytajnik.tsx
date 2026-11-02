import * as React from 'react';
import { CircleHelp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PYTAJNIK — opis pod znakiem „?”, widoczny po najechaniu
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (14.09.2026, Dobór): „zrób porządek z opisami — dodaj do każdego
 * tytułu pytajnik i tam po najechaniu myszą mają się wyświetlać opisy”.
 * Opis pytania nie zajmuje miejsca na ekranie: tytuł zostaje sam, a pomoc
 * czeka pod ikoną. Bez opisu ikona nie rysuje się wcale — nie ma pustych „?”.
 *
 * To ten sam `Tooltip` z biblioteki (dostawca siedzi w App), tylko z gotowym
 * spustem: przycisk z ikoną, dostępny z klawiatury (fokus otwiera dymek).
 */
export const Pytajnik: React.FC<{ opis?: React.ReactNode; className?: string }> = ({ opis, className }) => {
  if (!opis) return null;
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button data-w-odczycie="" type="button" aria-label="Opis" className={cn('inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full align-middle text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40', className)}>
          <CircleHelp className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-w-[320px] text-xs leading-5">{opis}</TooltipContent>
    </Tooltip>
  );
};
