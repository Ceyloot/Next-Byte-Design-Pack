import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  JĘZYK WIZUALNY — wzór: DocuVerse, barwy: NextByte
 * ════════════════════════════════════════════════════════════════════════
 *
 * Projektowane NA MOTYWIE JASNYM, bo tam każdy błąd widać od razu: płaska
 * karta ginie w bieli, brak cienia robi z kafelka prostokąt, a zbyt słaby
 * kontrast tekstu przestaje być czytelny. Co działa na bieli, przenosi się
 * na czerń samymi tokenami; w drugą stronę prawie nigdy.
 *
 * CZTERY RZECZY, KTÓRYCH BRAK ROBIŁ „PUSTY EKRAN":
 *
 *  ① GRADIENT. W DocuVerse gradient jest wszędzie, gdzie coś rośnie —
 *    pod krzywą, w słupku, w karcie zachęty. Płaska plama koloru wygląda
 *    na niedokończoną; gradient ma kierunek, więc wygląda na zrobiony.
 *
 *  ② CIEŃ WARSTWOWY. Jeden cień to obrys. Trzy (ciasny kontaktowy,
 *    średni formujący, szeroki ambientowy) to przedmiot leżący na stole.
 *
 *  ③ MIERNIK PRĄŻKOWY zamiast gładkiego paska. Ten jeden detal niesie
 *    cały charakter DocuVerse: kreseczki dają fakturę i skalę, której
 *    gładki pasek nie ma.
 *
 *  ④ LICZBA MA SĄSIADA. Każda duża liczba stoi przy drugiej, mniejszej,
 *    która mówi, czy to dużo. Sama liczba nie znaczy nic.
 *
 * Wszystko z tokenów motywu — zero wpisanych barw poza tożsamością modułów.
 */

/* ── Powierzchnie ─────────────────────────────────────────────────────── */

/** Tafla karty. W jasnym prawie biała, w ciemnym odsunięta od tła. */
export const TAFLA = 'color-mix(in srgb, hsl(var(--card)) 94%, hsl(var(--foreground)))';
/** Niecka wewnątrz karty — pola, mierniki, listy. */
export const NIECKA = 'color-mix(in srgb, hsl(var(--background)) 92%, hsl(var(--foreground)))';

export const CIEN_KARTY =
  '0 1px 2px hsl(var(--foreground) / 0.05),' +
  '0 4px 10px -4px hsl(var(--foreground) / 0.07),' +
  '0 20px 40px -24px hsl(var(--foreground) / 0.13)';

export const CIEN_UNIESIONY =
  '0 2px 4px hsl(var(--foreground) / 0.06),' +
  '0 10px 22px -8px hsl(var(--foreground) / 0.12),' +
  '0 30px 60px -30px hsl(var(--foreground) / 0.2)';

export function Karta({
  children, className, uniesiona, bezWypelnienia, style, ...reszta
}: React.HTMLAttributes<HTMLDivElement> & { uniesiona?: boolean; bezWypelnienia?: boolean }) {
  return (
    <div
      {...reszta}
      className={cn('relative rounded-[22px]', bezWypelnienia ? '' : 'p-4', className)}
      style={{
        background: TAFLA,
        border: '1px solid hsl(var(--foreground) / 0.07)',
        boxShadow: uniesiona ? CIEN_UNIESIONY : CIEN_KARTY,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Nagłówek w karcie: tytuł po lewej, akcja po prawej. */
export function Naglowek({
  children, akcja,
}: { children: React.ReactNode; akcja?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <h2 className="text-[16px] font-bold tracking-[-0.01em] text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        {children}
      </h2>
      {akcja}
    </div>
  );
}

/** Ikona w kółku — prawy górny róg karty statystyki. */
export function Krazek({
  children, akcent,
}: { children: React.ReactNode; akcent?: boolean }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{
        background: akcent ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--foreground) / 0.055)',
        color: akcent ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.55)',
        border: '1px solid hsl(var(--foreground) / 0.07)',
      }}
    >
      {children}
    </span>
  );
}

/**
 * MIERNIK PRĄŻKOWY — podpis znaku rozpoznawczego DocuVerse.
 *
 * Trzydzieści kresek zamiast jednego gładkiego paska. Wypełnione niosą
 * wartość, puste pokazują, ile jeszcze zostało — więc miernik mówi
 * o proporcji nawet bez liczby obok. Gładki pasek mówi tylko „trochę".
 */
export function Miernik({
  udzial, barwa = 'hsl(var(--primary))', kresek = 30,
}: { udzial: number; barwa?: string; kresek?: number }) {
  const pelne = Math.round(Math.min(1, Math.max(0, udzial)) * kresek);
  return (
    <span className="flex h-6 items-end gap-[2px]" aria-hidden>
      {Array.from({ length: kresek }, (_, i) => (
        <span
          key={i}
          className="flex-1 rounded-full"
          style={{
            height: i < pelne ? '100%' : '62%',
            background: i < pelne ? barwa : 'hsl(var(--foreground) / 0.11)',
            opacity: i < pelne ? 0.55 + (i / kresek) * 0.45 : 1,
          }}
        />
      ))}
    </span>
  );
}

/**
 * KARTA STATYSTYKI — cztery takie stoją w górnym rzędzie.
 *
 * Układ wzięty wprost z DocuVerse: etykieta i ikona, pod nimi duża liczba,
 * niżej dwa podpisy, miernik i dwie wartości brzegowe. Dzięki stałej
 * budowie cztery różne tematy czyta się tym samym ruchem oka.
 */
export function Statystyka({
  etykieta, wartosc, jednostka, ikona, akcent, lewy, prawy, udzial, barwa, podpis,
}: {
  etykieta: string;
  wartosc: string;
  jednostka?: React.ReactNode;
  ikona: React.ReactNode;
  akcent?: boolean;
  lewy: [string, string];
  prawy: [string, string];
  udzial: number;
  barwa?: string;
  podpis?: React.ReactNode;
}) {
  return (
    <Karta className="flex min-w-0 flex-col">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] text-[hsl(var(--foreground)/0.55)]">{etykieta}</span>
          <span
            className="mt-0.5 flex items-baseline gap-1 text-[30px] font-extrabold leading-none tracking-[-0.03em] text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {wartosc}
            {jednostka}
          </span>
        </span>
        <Krazek akcent={akcent}>{ikona}</Krazek>
      </div>

      {podpis && <p className="mt-1.5 text-[11.5px] leading-snug text-[hsl(var(--foreground)/0.5)]">{podpis}</p>}

      <div className="mt-auto pt-3">
        <span className="flex items-baseline justify-between text-[11px] text-[hsl(var(--foreground)/0.5)]">
          <span>{lewy[0]}</span><span>{prawy[0]}</span>
        </span>
        <span className="mt-1.5 block"><Miernik udzial={udzial} barwa={barwa} /></span>
        <span className="mt-1 flex items-baseline justify-between text-[11.5px] font-semibold tabular-nums text-foreground">
          <span>{lewy[1]}</span><span className="text-[hsl(var(--foreground)/0.45)]">{prawy[1]}</span>
        </span>
      </div>
    </Karta>
  );
}

/**
 * WYKRES OBSZAROWY z gradientem i dymkiem.
 *
 * Krzywa wygładzona Catmull–Rom → Bézier: łamana z ostrymi kątami wygląda
 * na dane, krzywa wygląda na przebieg. Gradient pod nią gaśnie do zera,
 * więc wykres nie kończy się twardą krawędzią.
 */
export function WykresObszar({
  dane, barwa = 'hsl(var(--primary))', wysokosc = 112, dymek, id,
}: { dane: number[]; barwa?: string; wysokosc?: number; dymek?: string; id: string }) {
  const W = 320, H = wysokosc;
  const maks = Math.max(...dane), min = Math.min(...dane);
  const zakres = maks - min || 1;
  const pkt = dane.map((v, i) => [
    (i / (dane.length - 1)) * W,
    H - 14 - ((v - min) / zakres) * (H - 34),
  ] as [number, number]);

  const krzywa = pkt.map(([x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = pkt[i - 1];
    const cx = (px + x) / 2;
    return `C ${cx} ${py} ${cx} ${y} ${x} ${y}`;
  }).join(' ');

  const szczyt = pkt[pkt.indexOf(pkt.reduce((a, b) => (a[1] < b[1] ? a : b)))];

  return (
    <div className="relative w-full" style={{ height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={barwa} stopOpacity="0.32" />
            <stop offset="100%" stopColor={barwa} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${krzywa} L ${W} ${H} L 0 ${H} Z`} fill={`url(#g-${id})`} />
        <path d={krzywa} fill="none" stroke={barwa} strokeWidth="2.2" vectorEffect="non-scaling-stroke"
          strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={szczyt[0]} cy={szczyt[1]} r="3.5" fill={barwa} stroke="hsl(var(--card))" strokeWidth="2"
          vectorEffect="non-scaling-stroke" />
      </svg>

      {dymek && (
        <span
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-[9px] px-2 py-1 text-[11px] font-semibold text-[hsl(var(--primary-foreground))]"
          style={{
            left: `${(szczyt[0] / W) * 100}%`,
            top: `${(szczyt[1] / H) * 100}%`,
            background: barwa,
            boxShadow: '0 6px 14px -6px hsl(var(--foreground) / 0.4)',
          }}
        >
          {dymek}
        </span>
      )}
    </div>
  );
}

/** Pigułka — filtr, godzina, znacznik. */
export function Pigulka({
  children, aktywna, onClick, className,
}: { children: React.ReactNode; aktywna?: boolean; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktywna}
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] transition-all active:scale-[0.97]',
        aktywna ? 'font-semibold' : 'text-[hsl(var(--foreground)/0.6)] hover:text-foreground',
        className,
      )}
      style={aktywna
        ? {
            background: 'linear-gradient(140deg, hsl(var(--primary)), color-mix(in srgb, hsl(var(--primary)) 78%, hsl(var(--foreground))))',
            color: 'hsl(var(--primary-foreground))',
            boxShadow: '0 4px 12px -4px hsl(var(--primary) / 0.55)',
          }
        : { background: 'hsl(var(--foreground) / 0.055)', border: '1px solid hsl(var(--foreground) / 0.07)' }}
    >
      {children}
    </button>
  );
}

/** Główny przycisk — gradient i cień, nie płaska plama. */
export function PrzyciskGlowny({
  children, ikona: Ik, onClick, className,
}: { children: React.ReactNode; ikona?: React.ComponentType<{ className?: string }>; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-all active:scale-[0.98]', className)}
      style={{
        background: 'linear-gradient(140deg, hsl(var(--primary)), color-mix(in srgb, hsl(var(--primary)) 74%, hsl(var(--foreground))))',
        color: 'hsl(var(--primary-foreground))',
        boxShadow: '0 6px 16px -6px hsl(var(--primary) / 0.6), inset 0 1px 0 0 hsl(0 0% 100% / 0.2)',
      }}
    >
      {Ik && <Ik className="h-4 w-4" />}
      {children}
    </button>
  );
}

/** Przycisk ikonowy w pasku górnym. */
export function PrzyciskIkony({
  children, tytul, onClick, kropka,
}: { children: React.ReactNode; tytul: string; onClick?: () => void; kropka?: boolean }) {
  return (
    <button
      type="button" title={tytul} aria-label={tytul} onClick={onClick}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-[hsl(var(--foreground)/0.6)] transition-colors hover:text-foreground"
      style={{ background: TAFLA, border: '1px solid hsl(var(--foreground) / 0.08)', boxShadow: CIEN_KARTY }}
    >
      {children}
      {kropka && (
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full"
          style={{ background: 'hsl(var(--primary))', boxShadow: '0 0 0 2px hsl(var(--card))' }} />
      )}
    </button>
  );
}

/* ── Tożsamość modułów (dane, nie motyw — patrz CLAUDE.md) ─────────────── */
export const MODULY = {
  czat:     { nazwa: 'Chat AI',      h: 'var(--primary)' },
  obraz:    { nazwa: 'Studio Zdjęć', h: '272 72% 56%' },
  wideo:    { nazwa: 'Studio Video', h: '340 74% 56%' },
  notatka:  { nazwa: 'Notatki',      h: '36 88% 52%' },
  tablica:  { nazwa: 'Tablice',      h: '168 62% 42%' },
  kalendarz:{ nazwa: 'Kalendarz',    h: '210 85% 56%' },
} as const;

export type KluczModulu = keyof typeof MODULY;
export const barwa = (k: KluczModulu, a: number) => `hsl(${MODULY[k].h} / ${a})`;
