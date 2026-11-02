import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChipyWyboru } from '@/components/ui/chipy-wyboru';

/**
 * WYBÓR Z LISTY — odpowiedź z długiej listy (kolory RAL, okleiny, systemy): przycisk z bieżącą wartością,
 * w dymku szukanie, „ostatnio używane” jako chipy na wierzchu i lista. Uzupełnia `ChipyWyboru`, które są
 * czytelne do ~12 odpowiedzi (plan Doboru [firma klienta], rozdz. 13). Wpis spoza listy dozwolony przez `dozwolonyWpis`.
 * Materiał: tokeny motywu, bez zaszytych barw.
 */
export interface WyborZListyProps {
  opcje: readonly string[];
  wartosc: string;
  onZmiana: (v: string) => void;
  ostatnie?: readonly string[];
  /** typowe odpowiedzi (np. kolory z rynku), gdy lista z bazy jest krótka albo pusta — chipy pod „ostatnio używane” */
  typowe?: readonly string[];
  dozwolonyWpis?: boolean;
  /** co pokazać, gdy lista jest pusta, a wpis dozwolony — zamiast pustego dymku (zmierzone 14.09: kolor bez opcji = „Szukaj…” i nic) */
  podpowiedz?: string;
  placeholder?: string;
  className?: string;
  /** opcja = klucz (np. id parametru), a na ekranie jej nazwa — szukanie przeszukuje nazwę i opis, nie klucz */
  etykieta?: (opcja: string) => string;
  /** druga linijka pozycji: czym ta opcja jest — żeby dało się ją rozpoznać bez otwierania innego ekranu */
  opis?: (opcja: string) => string | undefined;
  /** nagłówek grupy; grupy idą w kolejności pierwszego wystąpienia w `opcje` (Poczekalnia, 09.10.2026: 74 parametry bez grup „nie da się naocznie sprawdzić”) */
  grupa?: (opcja: string) => string | undefined;
  /** ile pozycji pokazać naraz (domyślnie 40) */
  limit?: number;
}

export const WyborZListy: React.FC<WyborZListyProps> = ({ opcje, wartosc, onZmiana, ostatnie = [], typowe = [], dozwolonyWpis, placeholder = 'wybierz…', podpowiedz, className, etykieta = o => o, opis, grupa, limit = 40 }) => {
  const [otwarte, setOtwarte] = useState(false);
  const [q, setQ] = useState('');
  const fl = q.trim().toLowerCase();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lista = useMemo(() => opcje.filter(o => !fl || `${etykieta(o)} ${opis?.(o) ?? ''}`.toLowerCase().includes(fl)).slice(0, limit), [opcje, fl, limit]);
  const wybierz = (v: string) => { onZmiana(v); setOtwarte(false); setQ(''); };
  const dokladnie = opcje.some(o => o.toLowerCase() === fl) || ostatnie.some(o => o.toLowerCase() === fl) || typowe.some(o => o.toLowerCase() === fl);
  const typoweBezOstatnich = typowe.filter(t => !ostatnie.includes(t));
  const tylkoWpis = opcje.length === 0 && !!dozwolonyWpis;
  return (
    <Popover open={otwarte} onOpenChange={o => { setOtwarte(o); if (!o) setQ(''); }}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(
          'inline-flex min-w-[140px] items-center justify-between gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors',
          wartosc ? 'border-border/60 bg-muted/20 text-foreground hover:border-border' : 'border-dashed border-primary/60 text-primary hover:bg-primary/10', className,
        )}>
          <span className="truncate">{wartosc ? etykieta(wartosc) : placeholder}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-2">
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input autoFocus className="h-8 pl-9 text-xs" placeholder={tylkoWpis ? 'Wpisz…' : 'Szukaj…'} value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { if (lista.length) wybierz(lista[0]); else if (dozwolonyWpis && fl) wybierz(q.trim()); } }} />
        </div>
        {ostatnie.length > 0 && !fl && (
          <div className="mb-2">
            <div className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Ostatnio używane</div>
            <ChipyWyboru opcje={ostatnie} wartosc={wartosc} zwarte odznaczalne={false} onZmiana={v => wybierz(v)} />
          </div>
        )}
        {typoweBezOstatnich.length > 0 && !fl && (
          <div className="mb-2">
            <div className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">Typowe</div>
            <ChipyWyboru opcje={typoweBezOstatnich} wartosc={wartosc} zwarte odznaczalne={false} onZmiana={v => wybierz(v)} />
          </div>
        )}
        <div className={cn('overflow-y-auto', grupa ? 'max-h-[320px]' : 'max-h-[240px]')}>
          {tylkoWpis && !fl && <p className="px-2 py-1.5 text-[12px] text-muted-foreground">{podpowiedz ?? 'Wpisz wartość i zatwierdź Enterem.'}</p>}
          {/* Bez opisu i grup — pozycja dokładnie jak dawniej (ten sam wiersz u innych ekranów, 14.10.2026). */}
          {!opis && !grupa && lista.map(o => (
            <button key={o} type="button" onClick={() => wybierz(o)} className={cn('flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] hover:bg-muted/40', o === wartosc && 'text-primary')}>
              {o === wartosc ? <Check className="h-3.5 w-3.5" /> : <span className="w-3.5" />}{etykieta(o)}
            </button>
          ))}
          {(opis || grupa) && lista.flatMap((o, i) => {
            const g = grupa?.(o), o2 = opis?.(o);
            const naglowek = g && g !== (i ? grupa?.(lista[i - 1]) : undefined)
              ? [<div key={`g:${o}`} className="px-2 pb-1 pt-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">{g}</div>] : [];
            return [...naglowek, (
              <button key={o} type="button" onClick={() => wybierz(o)} className={cn('flex w-full items-start gap-2 rounded px-2 py-1.5 text-left text-[13px] hover:bg-muted/40', o === wartosc && 'text-primary')}>
                {o === wartosc ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                <span className="min-w-0">
                  <span className="block">{etykieta(o)}</span>
                  {o2 && <span className="block text-[11.5px] text-muted-foreground">{o2}</span>}
                </span>
              </button>
            )];
          })}
          {lista.length === 0 && !dozwolonyWpis && <p className="px-2 py-1.5 text-[12px] text-muted-foreground">Nic nie pasuje.</p>}
        </div>
        {dozwolonyWpis && fl && !dokladnie && (
          <button type="button" onClick={() => wybierz(q.trim())} className="mt-1 w-full rounded border border-dashed border-border/60 px-2 py-1.5 text-left text-[12.5px] text-foreground hover:bg-muted/30">Użyj „{q.trim()}”</button>
        )}
        {wartosc && <button type="button" onClick={() => wybierz('')} className="mt-1 w-full rounded px-2 py-1 text-left text-[11.5px] text-muted-foreground hover:bg-muted/30">Wyczyść</button>}
      </PopoverContent>
    </Popover>
  );
};

export default WyborZListy;
