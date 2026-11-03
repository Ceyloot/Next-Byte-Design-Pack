import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  SZKŁO I WAFFLE
 * ════════════════════════════════════════════════════════════════════════
 *
 * Receptura szkła wzięta z CLAUDE.md, nie wymyślona na nowo: półprzezroczysta
 * tafla, rozmycie z podbiciem nasycenia, światło na górnej krawędzi, hairline
 * rant.
 *
 * SZKŁO MA SENS TYLKO WTEDY, GDY JEST CO ZAŁAMYWAĆ. Na jednolitym tle wygląda
 * identycznie jak płaska karta — zostaje sam koszt rozmycia. Dlatego pod
 * spodem leżą trzy ciche plamy koloru (`TloSzkla`). Są poniżej progu
 * zauważalności jako kształty, ale powyżej progu jako materiał.
 */

export const SZKLO: React.CSSProperties = {
  background: 'color-mix(in srgb, hsl(var(--card)) 58%, transparent)',
  backdropFilter: 'blur(20px) saturate(145%)',
  WebkitBackdropFilter: 'blur(20px) saturate(145%)',
  border: '1px solid hsl(var(--foreground) / 0.12)',
  boxShadow:
    'inset 0 1px 0 0 hsl(0 0% 100% / 0.3),' +
    '0 1px 2px hsl(var(--foreground) / 0.05),' +
    '0 10px 26px -12px hsl(var(--foreground) / 0.16),' +
    '0 30px 60px -34px hsl(var(--foreground) / 0.24)',
};

/** Karta ze szkła — domyślna powierzchnia pulpitu. */
export function Szyba({
  children, className, bezWypelnienia, style, ...reszta
}: React.HTMLAttributes<HTMLDivElement> & { bezWypelnienia?: boolean }) {
  return (
    <div
      {...reszta}
      className={cn('relative rounded-[22px]', bezWypelnienia ? '' : 'p-4', className)}
      style={{ ...SZKLO, ...style }}
    >
      {children}
    </div>
  );
}

/** Niecka wewnątrz szyby — matowa, nie druga szyba (szkło w szkle gasi refrakcję). */
export const NIECKA_SZKLANA: React.CSSProperties = {
  background: 'color-mix(in srgb, hsl(var(--background)) 55%, transparent)',
  border: '1px solid hsl(var(--foreground) / 0.07)',
  boxShadow: 'inset 0 1px 2px 0 hsl(var(--foreground) / 0.05)',
};

/**
 * WAFFLE — siatka kwadracików zamiast paska postępu.
 *
 * Liczy się POLICZALNOŚĆ. Pasek mówi „jakieś siedemdziesiąt procent";
 * waffle pozwala policzyć wzrokiem, ile pól jest zajętych. Przy Byte
 * i dniach aktywnych ma to znaczenie, bo obie wartości są małe i konkretne.
 */
export function Waffle({
  udzial, kolumny = 20, wiersze = 4, barwa = 'hsl(var(--primary))', rozmiar = 9,
}: { udzial: number; kolumny?: number; wiersze?: number; barwa?: string; rozmiar?: number }) {
  const razem = kolumny * wiersze;
  const pelne = Math.round(Math.min(1, Math.max(0, udzial)) * razem);
  return (
    <span
      className="grid gap-[3px]"
      aria-hidden
      style={{ gridTemplateColumns: `repeat(${kolumny}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: razem }, (_, i) => (
        <span
          key={i}
          className="rounded-[2.5px]"
          style={{
            height: rozmiar,
            background: i < pelne ? barwa : 'hsl(var(--foreground) / 0.1)',
            opacity: i < pelne ? 0.45 + (i / razem) * 0.55 : 1,
          }}
        />
      ))}
    </span>
  );
}

/** Trzy ciche plamy koloru — istnieją po to, żeby szkło miało co załamywać. */
export function TloSzkla() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <span className="absolute -left-40 -top-32 h-[460px] w-[460px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.42), transparent 68%)' }} />
      <span className="absolute right-[6%] top-[12%] h-[400px] w-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(272 72% 56% / 0.3), transparent 68%)' }} />
      <span className="absolute bottom-[-14%] left-[28%] h-[420px] w-[420px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(168 62% 46% / 0.26), transparent 70%)' }} />
      <span className="absolute bottom-[6%] right-[18%] h-[300px] w-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(36 88% 54% / 0.24), transparent 70%)' }} />
    </div>
  );
}

/** Słupki tygodniowe — mały wykres do kart, gdzie krzywa byłaby przesadą. */
export function Slupki({
  dane, barwa = 'hsl(var(--primary))', wysokosc = 46,
}: { dane: number[]; barwa?: string; wysokosc?: number }) {
  const maks = Math.max(1, ...dane);
  return (
    <span className="flex items-end gap-[4px]" style={{ height: wysokosc }} aria-hidden>
      {dane.map((w, i) => (
        <span
          key={i}
          className="flex-1 rounded-t-[3px]"
          style={{
            height: `${18 + (w / maks) * 82}%`,
            background: `linear-gradient(180deg, ${barwa}, color-mix(in srgb, ${barwa} 45%, transparent))`,
            opacity: 0.45 + (i / dane.length) * 0.55,
          }}
        />
      ))}
    </span>
  );
}
