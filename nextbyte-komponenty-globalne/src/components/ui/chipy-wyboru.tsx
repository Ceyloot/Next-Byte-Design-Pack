import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/**
 * CHIPY WYBORU — odpowiedź jednym kliknięciem, bez rozwijanej listy.
 *
 * Powstało 13.09.2026 dla „Szybkiego doboru” [firma klienta] (Kajetan: „nowoczesne,
 * intuicyjne, żeby nikt nie pomyślał o ręcznym notowaniu”). Dotąd każda
 * odpowiedź w Doborze była dropdownem albo dymkiem z listą — dwa kliknięcia
 * i przewijanie tam, gdzie wystarczy jedno dotknięcie. Chip pokazuje WSZYSTKIE
 * opcje naraz, więc handlowiec widzi, co w ogóle może wybrać.
 *
 *  · `wielokrotne` — kilka chipów naraz (dodatki, szyby specjalne),
 *  · `dozwolonyWpis` — chip „inne…” otwiera pole na wartość spoza listy (kolor RAL),
 *  · `wyroznione` — wartość „z zamówienia” rysowana kreskowaną obwódką, żeby
 *    wyjątek na pozycji odróżniał się od dziedziczonej odpowiedzi,
 *  · `zwarte` — mniejsze chipy do listy pozycji.
 * Materiał: tokeny motywu (`--primary`, `--muted`, `--border`) — bez zaszytych barw.
 */
/** `label` może być węzłem (emoji, kropka koloru) — wartość niesie `key`. */
export interface OpcjaChipa { key: string; label: React.ReactNode }

export interface ChipyWyboruProps {
  opcje: readonly (string | OpcjaChipa)[];
  /** wybrana wartość (jedna) albo lista (przy `wielokrotne`) */
  wartosc: string | readonly string[] | null | undefined;
  onZmiana: (v: string, wszystkie: string[]) => void;
  wielokrotne?: boolean;
  dozwolonyWpis?: boolean;
  wyroznione?: string | null;
  zwarte?: boolean;
  /** klik w zaznaczony chip czyści odpowiedź (domyślnie tak) */
  odznaczalne?: boolean;
  /** `cichy` — niezaznaczone chipy bez ramki (tylko tekst), do gęstych wierszy listy; zaznaczony wygląda tak samo jak zwykle.
   *  `pelny` — wyraźna ramka i wypełnienie: chipy w kafelku na szkle okna (19.10.2026, kalendarz: przy `ramka`
   *  niezaznaczone czytały się jak luźny tekst). */
  styl?: 'ramka' | 'cichy' | 'pelny';
  className?: string;
}

const doOpcji = (o: string | OpcjaChipa): OpcjaChipa => (typeof o === 'string' ? { key: o, label: o } : o);

export const ChipyWyboru: React.FC<ChipyWyboruProps> = ({
  opcje, wartosc, onZmiana, wielokrotne, dozwolonyWpis, wyroznione, zwarte, odznaczalne = true, styl = 'ramka', className,
}) => {
  const [wpis, setWpis] = useState<string | null>(null);
  const zaznaczone = new Set(Array.isArray(wartosc) ? wartosc : wartosc ? [String(wartosc)] : []);
  const lista = opcje.map(doOpcji);
  /* wartość spoza listy (np. RAL wpisany ręcznie) dostaje własny chip, żeby była widoczna i odznaczalna */
  const spoza = [...zaznaczone].filter(z => !lista.some(o => o.key === z)).map(z => ({ key: z, label: z }));
  const wszystkie = [...lista, ...spoza];

  const wybierz = (key: string) => {
    if (wielokrotne) {
      const next = zaznaczone.has(key) ? [...zaznaczone].filter(z => z !== key) : [...zaznaczone, key];
      onZmiana(next.join('|||'), next);
      return;
    }
    if (zaznaczone.has(key) && odznaczalne) { onZmiana('', []); return; }
    onZmiana(key, [key]);
  };
  const zatwierdzWpis = () => { const v = (wpis ?? '').trim(); setWpis(null); if (v) wybierz(v); };

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {wszystkie.map(o => {
        const on = zaznaczone.has(o.key);
        const zZamowienia = !on && wyroznione === o.key;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={on}
            onClick={() => wybierz(o.key)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              zwarte ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-xs',
              on
                ? 'border-primary/40 bg-primary/15 text-primary'
                : zZamowienia
                  ? 'border-dashed border-primary/40 text-muted-foreground hover:bg-primary/10'
                  : styl === 'cichy'
                    ? 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    : styl === 'pelny'
                      ? 'border-border/80 bg-foreground/[0.04] text-foreground/85 hover:border-primary/40 hover:bg-primary/[0.06] hover:text-foreground'
                      : 'border-border/40 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
            )}
            title={zZamowienia ? 'Odpowiedź z zamówienia — kliknij, żeby potwierdzić dla tej pozycji' : undefined}
          >
            {on && <Check className="h-3 w-3" />}
            {o.label}
          </button>
        );
      })}
      {dozwolonyWpis && (wpis === null ? (
        <button type="button" onClick={() => setWpis('')}
          className={cn('inline-flex items-center gap-1 rounded-full border border-dashed border-border/50 text-muted-foreground hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40', zwarte ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-xs')}>
          <Plus className="h-3 w-3" /> inne…
        </button>
      ) : (
        <Input autoFocus className="h-7 w-[160px] text-xs" placeholder="np. RAL 7016" value={wpis}
          onChange={e => setWpis(e.target.value)}
          onBlur={zatwierdzWpis}
          onKeyDown={e => { if (e.key === 'Enter') zatwierdzWpis(); if (e.key === 'Escape') setWpis(null); }} />
      ))}
    </div>
  );
};

export default ChipyWyboru;
