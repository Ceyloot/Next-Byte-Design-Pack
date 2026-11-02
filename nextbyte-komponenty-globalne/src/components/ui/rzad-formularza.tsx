import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { klasyKafelka } from '@/components/ui/tile';
import { KLASA_ETYKIETY_POLA } from '@/components/ui/pola';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  RZĄD FORMULARZA — etykieta i kontrolki w JEDNEJ linii
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał (19.10.2026, okno wydarzenia): „zobacz, jak wiele jest tu pustych przestrzeni — NIC zajmuje tyle miejsca,
 * brakuje logistyki". Każdy moduł był osobnym kafelkiem na całą szerokość z własnym nagłówkiem, a w środku jedna
 * mała rzecz (przełącznik, rząd chipów). Tu: kolumna etykiet po lewej (od `sm`), treść obok; na telefonie
 * etykieta nad treścią. Rzędy w `GrupaFormularza` — jeden kafelek, oddzielone włosową linią.
 */
export const RzadFormularza: React.FC<{
  ikona?: LucideIcon;
  etykieta: React.ReactNode;
  /** dopisek przy etykiecie (np. „1 h”) */
  dopisek?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ ikona: Ikona, etykieta, dopisek, children, className }) => (
  <div className={cn('grid gap-x-3 gap-y-1.5 py-2.5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start', className)}>
    <div className={cn('flex min-h-0 items-center gap-1.5 sm:min-h-9', KLASA_ETYKIETY_POLA)}>
      {Ikona && <Ikona className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      <span className="truncate">{etykieta}</span>
      {dopisek && <span className="ml-auto shrink-0 text-[11px] font-normal normal-case tracking-normal text-muted-foreground sm:ml-1">{dopisek}</span>}
    </div>
    <div className="min-w-0">{children}</div>
  </div>
);

/** Grupa rzędów: jeden kafelek biblioteki, rzędy oddzielone włosową linią. */
export const GrupaFormularza: React.FC<{ children: React.ReactNode; className?: string; 'aria-label'?: string }> = ({ children, className, ...a11y }) => (
  <section {...a11y} className={cn(klasyKafelka({ zwarty: true, elewacja: 'plaska' }), 'gap-0 divide-y divide-border/50 px-3.5 py-0.5', className)}>
    {children}
  </section>
);
