import * as React from 'react';
import { cn } from '@/lib/utils';
import { PikseloweTlo } from './pikselowe-tlo';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PODŚWIETLENIE UPUSZCZANIA — jeden styl miejsca „upuść tutaj” na całej platformie
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał (27.10.2026): efekt strefy w oknie „Dodaj wiedzę” ma być globalnym
 * stylem platformy i zastąpić własne podświetlenia w innych miejscach.
 *
 * Dwie części:
 *  • `useUpuszczanie` — stan i handlery przeciągania pliku (enter/over/leave/drop
 *    z poprawnym wyjściem przez dzieci) plus najechanie i fokus;
 *  • `PodswietlenieUpuszczania` — warstwa wewnątrz strefy (rodzic `relative`,
 *    `overflow-hidden`): ramka w kolorze akcentu, lekkie zabarwienie i migoczące
 *    piksele (`PikseloweTlo`). Leży jako osobna warstwa, bo szkło (`nb-szklo`)
 *    trzyma własny kolor ramki i tła — klasy na samej szybie przegrywają.
 *
 * Najechanie i fokus dają lżejszą wersję, przeciąganie pliku pełną.
 */

export type StanUpuszczania = 'nad' | 'najechany' | null;

export function useUpuszczanie(opcje: { onPliki: (pliki: File[]) => void; wylaczone?: boolean; bezNajechania?: boolean }) {
  const { onPliki, wylaczone, bezNajechania } = opcje;
  const [nad, setNad] = React.useState(false);
  const [najechany, setNajechany] = React.useState(false);
  const wejdz = (e: React.DragEvent) => {
    if (wylaczone || !Array.from(e.dataTransfer?.types ?? []).includes('Files')) return;
    e.preventDefault();
    setNad(true);
  };
  const handlery = {
    onDragEnter: wejdz,
    onDragOver: wejdz,
    onDragLeave: (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setNad(false); },
    onDrop: (e: React.DragEvent) => {
      if (wylaczone) return;
      e.preventDefault();
      setNad(false);
      const pliki = Array.from(e.dataTransfer?.files ?? []);
      if (pliki.length) onPliki(pliki);
    },
    ...(bezNajechania ? {} : {
      onMouseEnter: () => setNajechany(true),
      onMouseLeave: () => setNajechany(false),
      onFocus: () => setNajechany(true),
      onBlur: () => setNajechany(false),
    }),
  };
  const stan: StanUpuszczania = nad ? 'nad' : najechany ? 'najechany' : null;
  return { stan, nad, najechany, handlery, 'data-nad': nad || undefined };
}

export const PodswietlenieUpuszczania: React.FC<{
  stan: StanUpuszczania;
  /** Zaokrąglenie warstwy, ma pasować do strefy (np. `rounded-lg`). */
  zaokraglenie?: string;
  /** Małe strefy (miniatury) dostają same piksele bez gęstej siatki. */
  odstep?: number;
  className?: string;
}> = ({ stan, zaokraglenie = 'rounded-2xl', odstep, className }) => (
  <span aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', zaokraglenie, className)}>
    <span className={cn(
      'absolute inset-0 border-2 border-primary/80 bg-primary/[0.08] transition-opacity duration-200',
      zaokraglenie,
      stan === 'nad' ? 'opacity-100' : stan === 'najechany' ? 'opacity-50' : 'opacity-0',
    )} />
    <PikseloweTlo
      aktywny={stan !== null}
      odstep={odstep ?? (stan === 'nad' ? 7 : 9)}
      predkosc={stan === 'nad' ? 40 : 25}
      className={cn('transition-opacity duration-200', stan === 'nad' ? 'opacity-100' : 'opacity-60')}
    />
  </span>
);
