/** Suwak ciągły biblioteki cennika — ten sam tor i uchwyt co suwak progów puli, ale od `min` do `max` co `krok`. */
import React from 'react';
import { cn } from '@/lib/utils';
import { tintaAkcentu } from './wiersze';

/*
  ════════════════════════════════════════════════════════════════════════
   SUWAK ZAKRESU — wybór ilości (13.10.2026)
  ════════════════════════════════════════════════════════════════════════

  `SuwakPuli` wybiera jeden z kilku progów. Doładowanie puli firmy potrzebuje
  wyboru dowolnej ilości w zakresie (1 000 – 100 000 Byte co 1 000), z progami
  cen zaznaczonymi na torze. Wygląd jest ten sam, żeby suwak w cenniku planów
  i suwak doładowania były jednym elementem platformy.

  Pod własnym torem leży natywny `<input type="range">`: strzałki, Page Up/Down,
  Home/End i czytnik ekranu działają bez własnej obsługi klawiatury.

  Z `wartosci` suwak chodzi po podanej liście, a pozycje mają RÓWNE odstępy —
  dla zakresów, w których krok rośnie z wielkością (100, 200 … 1 000, 1 500 …
  50 000). Liniowy tor zostawiłby na małe wartości kilka pikseli.

  KOMPONENT NIE ZNA ŻADNEJ KWOTY — zakres, krok i znaczniki przychodzą z zewnątrz.
*/

export interface SuwakZakresuProps {
  min: number;
  max: number;
  krok: number;
  wartosc: number;
  onChange: (wartosc: number) => void;
  /** Nazwa dla czytnika ekranu, np. „Liczba Byte". */
  etykieta: string;
  /** Wartość słownie dla czytnika, np. „25 000 Byte, 4500 zł". */
  opisWartosci?: string;
  /** Wartości zaznaczone kropką na torze (progi). */
  znaczniki?: number[];
  /**
   * Dozwolone wartości rosnąco. Gdy podane, suwak przeskakuje między nimi, a ich
   * pozycje na torze są rozłożone równo; `min`, `max` i `krok` nie są wtedy czytane.
   */
  wartosci?: readonly number[];
  /** Barwa wypełnienia i uchwytu (dowolny kolor CSS); domyślnie akcent motywu. */
  kolor?: string;
  className?: string;
}

/** Połowa szerokości uchwytu — o tyle tor uchwytu jest krótszy z każdej strony. */
const POL_UCHWYTU_PX = 10;

export function SuwakZakresu({
  min, max, krok, wartosc, onChange, etykieta, opisWartosci, znaczniki = [], wartosci, kolor = 'hsl(var(--primary))', className,
}: SuwakZakresuProps) {
  const zListy = !!wartosci && wartosci.length > 1;
  /* Pozycja wartości na liście; wartość spoza listy staje na ostatniej nie większej od niej. */
  const pozycja = (v: number) => {
    if (!zListy) return 0;
    let i = 0;
    wartosci.forEach((w, indeks) => { if (w <= v) i = indeks; });
    return i;
  };
  const ulamek = (v: number) => (zListy
    ? pozycja(v) / (wartosci.length - 1)
    : max > min ? Math.min(1, Math.max(0, (v - min) / (max - min))) : 0);
  const pct = ulamek(wartosc) * 100;

  return (
    <div className={cn('group relative select-none py-3', className)}>
      <input
        type="range"
        /* Z listą wartości pole chodzi po POZYCJACH (0…n−1); na zewnątrz wychodzi wartość z listy. */
        min={zListy ? 0 : min}
        max={zListy ? wartosci.length - 1 : max}
        step={zListy ? 1 : krok}
        value={zListy ? pozycja(wartosc) : wartosc}
        onChange={(e) => onChange(zListy ? wartosci[Number(e.target.value)] : Number(e.target.value))}
        /* Pole sięga poza tor, żeby palec miał w co trafić (cel dotyku 44 px). */
        className="peer absolute inset-x-0 -inset-y-2 z-30 w-full cursor-pointer opacity-0"
        aria-label={etykieta}
        aria-valuetext={opisWartosci}
      />
      <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-foreground/[0.06] bg-foreground/[0.08] shadow-inner">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            /* Wypełnienie kończy się w środku uchwytu, który jedzie po krótszym torze. */
            width: `calc(${POL_UCHWYTU_PX}px + (100% - ${2 * POL_UCHWYTU_PX}px) * ${pct / 100})`,
            background: `linear-gradient(90deg, ${tintaAkcentu(kolor, 45)}, ${kolor})`,
            boxShadow: `0 0 14px ${tintaAkcentu(kolor, 50)}`,
          }}
        />
      </div>

      <div className="pointer-events-none absolute top-1/2 -translate-y-1/2" style={{ left: POL_UCHWYTU_PX, right: POL_UCHWYTU_PX }}>
        {znaczniki.map((z) => (
          <span
            key={z}
            data-znacznik={z}
            className="absolute top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${ulamek(z) * 100}%`,
              backgroundColor: z <= wartosc ? 'hsl(var(--background) / 0.75)' : 'hsl(var(--foreground) / 0.35)',
            }}
          />
        ))}
        <div
          data-uchwyt=""
          className="absolute top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-200 group-hover:scale-110"
          style={{
            left: `${pct}%`,
            backgroundColor: kolor,
            boxShadow: `0 0 0 3px ${tintaAkcentu(kolor, 30)}, 0 0 16px ${kolor}, 0 2px 6px hsl(var(--background) / 0.7)`,
          }}
        />
      </div>
      {/* Obwódka przy sterowaniu z klawiatury — pole jest niewidoczne, więc pokazuje ją tor. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 inset-y-1 rounded-full opacity-0 ring-2 ring-primary/60 peer-focus-visible:opacity-100" />
    </div>
  );
}
