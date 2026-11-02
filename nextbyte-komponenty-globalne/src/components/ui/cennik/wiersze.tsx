/** Klocki karty planu cennika: animowana liczba, suwak i wiersz puli Byte, panel zużycia, wiersz cechy i rozwijanie. */
import React, { useEffect, useRef, useState } from 'react';
import NumberFlow from '@number-flow/react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CechaCennika, DodatekCennika, DodatekZablokowany, ProgCennika, TonPlakietkiCennika, WierszZuzycia } from './typy';

/*
  Klocki karty planu — wyniesione z `KartaPlanu.tsx`, żeby karta mieściła się
  w limicie 500 linii i żeby `CennikPage` mógł użyć tych samych elementów
  (animowana liczba, rozwijanie) w kreatorze doboru zamiast trzymać kopie.
*/

/** Miękkie tło akcentu — `color-mix` z przezroczystością, ten sam chwyt co na stronie głównej. */
export const tintaAkcentu = (kolor: string, procent = 14) =>
  `color-mix(in srgb, ${kolor} ${procent}%, transparent)`;

/**
 * Animowana liczba — cyfry przewijają się jak w liczniku (NumberFlow), po polsku.
 * Michał (23.09.2026): „te animacje zmiany cen daj tu te, co mamy w tym nie od
 * Artura planie, bo ładne są, jak liczby się zmieniają".
 */
export function AnimLiczba({ wartosc, miejsca = 0, className }: { wartosc: number; miejsca?: number; className?: string }) {
  return (
    <NumberFlow
      value={wartosc}
      locales="pl-PL"
      format={{ minimumFractionDigits: miejsca, maximumFractionDigits: miejsca }}
      className={cn('tabular-nums', className)}
    />
  );
}

/** Kwota po polsku: przecinek dziesiętny, grosze tylko gdy są („12,50", nie „12,5"; „8", nie „8,00"). */
export const kwotaPl = (n: number) =>
  n.toLocaleString('pl-PL', { minimumFractionDigits: n % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 });

/** Ile miejsc po przecinku dla `AnimLiczba`: dwa, gdy kwota ma grosze, inaczej zero. */
export const miejscaKwoty = (n: number) => (Math.round(n * 100) % 100 !== 0 ? 2 : 0);

/* ═══════════════════════════════════════════════════════════════
   WIERSZ PULI — nagłówek „Byte miesięcznie: N ⟠" wspólny dla suwaka
   i wariantu statycznego; wysokość stała, żeby karty stały równo.
   ═══════════════════════════════════════════════════════════════ */
const PlakietkaPuli = ({ tekst }: { tekst: string }) => (
  <span className="whitespace-nowrap rounded-full border border-primary/25 bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
    {tekst}
  </span>
);

function NaglowekPuli({ etykieta, byte, kolor, plakietka }: { etykieta: string; byte: number; kolor: string; plakietka?: string }) {
  return (
    <div className="flex h-6 items-center justify-between gap-2">
      <span className="text-xs font-medium text-muted-foreground">{etykieta}</span>
      <span className="flex items-center gap-2">
        {plakietka && <PlakietkaPuli tekst={plakietka} />}
        <span className="flex items-center gap-1 whitespace-nowrap text-sm font-bold tabular-nums" style={{ color: kolor }}>
          <AnimLiczba wartosc={byte} />
          <span className="text-xs opacity-60">⟠</span>
        </span>
      </span>
    </div>
  );
}

/**
 * Suwak progów puli Byte — natywny `<input type="range">` pod własnym torem,
 * więc działa z klawiatury i czytnikiem ekranu, a wygląda jak stepper.
 */
export function SuwakPuli({
  progi, indeks, onChange, kolor, etykieta,
}: {
  progi: ProgCennika[];
  indeks: number;
  onChange: (i: number) => void;
  kolor: string;
  etykieta: string;
}) {
  const pct = (indeks / (progi.length - 1)) * 100;
  const biezacy = progi[indeks];

  return (
    <div className="select-none space-y-2.5">
      <NaglowekPuli etykieta={etykieta} byte={biezacy.byte ?? 0} kolor={kolor} plakietka={biezacy.plakietka} />

      <div className="group relative py-2.5">
        <input
          type="range"
          min={0}
          max={progi.length - 1}
          step={1}
          value={indeks}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 z-30 h-full w-full cursor-pointer opacity-0"
          aria-label="Wybierz pulę Byte"
        />
        <div className="relative h-2 w-full overflow-hidden rounded-full border border-foreground/[0.06] bg-foreground/[0.08] shadow-inner">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${tintaAkcentu(kolor, 45)}, ${kolor})`,
              boxShadow: `0 0 14px ${tintaAkcentu(kolor, 50)}`,
            }}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-1">
          <div className="relative w-full">
            {progi.map((p, i) => {
              const left = (i / (progi.length - 1)) * 100;
              const aktywny = i <= indeks;
              const wybrany = i === indeks;
              return (
                <div
                  key={`${p.byte}-${i}`}
                  className="absolute top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all duration-300"
                  style={{ left: `${left}%` }}
                >
                  {!wybrany && (aktywny ? (
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: kolor, boxShadow: `0 0 8px ${tintaAkcentu(kolor, 80)}` }} />
                  ) : (
                    <span className="h-2 w-2 rounded-full border border-foreground/25 bg-background/90" />
                  ))}
                  {wybrany && (
                    <div
                      className="h-5 w-5 rounded-full transition-transform duration-200 group-hover:scale-110"
                      style={{
                        backgroundColor: kolor,
                        boxShadow: `0 0 0 3px ${tintaAkcentu(kolor, 30)}, 0 0 16px ${kolor}, 0 2px 6px hsl(var(--background) / 0.7)`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Wysokość wiersza dodatku — tę samą rezerwuje karta bez dodatku (`miejsceNaDodatek`). */
export const WYSOKOSC_DODATKU = 'h-[76px]';

const odmiana = (n: number, [jedna, dwie, piec]: [string, string, string]) => {
  if (n === 1) return jedna;
  const jednosci = n % 10;
  const nastki = n % 100 >= 12 && n % 100 <= 14;
  return jednosci >= 2 && jednosci <= 4 && !nastki ? dwie : piec;
};

/**
 * Suwak dodatku ilościowego (miejsca Premium dla zespołu) — ten sam tor i ten
 * sam uchwyt co suwak puli, ale ciągły: od zera do `max`, co jedną sztukę.
 * Natywny `<input type="range">` leży nad torem, więc działa z klawiatury
 * i czytnikiem ekranu; jego pole sięga poza tor, żeby palec miał w co trafić.
 */
export function SuwakDodatku({
  dodatek, ilosc, onChange, kolor, rocznie, jednostkaCeny = 'zł/m',
}: {
  dodatek: DodatekCennika;
  ilosc: number;
  onChange: (n: number) => void;
  kolor: string;
  /** Rozliczenie roczne — podpis pokazuje ratę miesięczną z faktury rocznej. */
  rocznie: boolean;
  /** Ta sama jednostka co przy cenie planu (`PlanCennika.jednostkaCeny`). */
  jednostkaCeny?: string;
}) {
  const pct = dodatek.max > 0 ? (ilosc / dodatek.max) * 100 : 0;
  const sztuka = rocznie ? dodatek.rocznie : dodatek.miesiecznie;
  const jednostka = odmiana(ilosc, dodatek.jednostka);

  return (
    <div className={cn('select-none', WYSOKOSC_DODATKU)}>
      <div className="flex h-6 items-center justify-between gap-2">
        <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">{dodatek.etykieta}</span>
        <span className="flex items-baseline gap-1 whitespace-nowrap text-sm font-bold tabular-nums" style={{ color: kolor }}>
          <AnimLiczba wartosc={ilosc} />
          <span className="text-xs font-medium opacity-70">{jednostka}</span>
        </span>
      </div>

      <div className="group relative py-2.5">
        <input
          type="range"
          min={0}
          max={dodatek.max}
          step={1}
          value={ilosc}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 -inset-y-2 z-30 w-full cursor-pointer opacity-0"
          aria-label={dodatek.etykieta.replace(/:\s*$/, '')}
          aria-valuetext={`${ilosc} ${jednostka}`}
        />
        <div className="relative h-2 w-full overflow-hidden rounded-full border border-foreground/[0.06] bg-foreground/[0.08] shadow-inner">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${tintaAkcentu(kolor, 45)}, ${kolor})`,
              boxShadow: `0 0 14px ${tintaAkcentu(kolor, 50)}`,
            }}
          />
        </div>
        {/* Uchwyt jedzie po torze skróconym o własną szerokość — przy zerze i przy `max` nie wystaje za krawędź. */}
        <div className="pointer-events-none absolute inset-x-2.5 top-1/2 -translate-y-1/2">
          <div
            className="absolute top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-200 group-hover:scale-110"
            style={{
              left: `${pct}%`,
              backgroundColor: kolor,
              boxShadow: `0 0 0 3px ${tintaAkcentu(kolor, 30)}, 0 0 16px ${kolor}, 0 2px 6px hsl(var(--background) / 0.7)`,
            }}
          />
        </div>
      </div>

      <p className="flex h-4 items-center justify-between gap-2 text-[11.5px] leading-tight text-muted-foreground">
        {/* Klucz z okresu: po przełączeniu Miesięcznie ↔ Rocznie stawka wchodzi tą samą
            animacją co podpisy pod ceną. Sam ruch suwaka klucza nie zmienia — tam liczy licznik. */}
        <span key={rocznie ? 'rocznie' : 'miesiecznie'} className="whitespace-nowrap motion-safe:animate-wejscie-tekstu motion-reduce:animate-wejscie-tekstu-lagodne">
          {ilosc > 0
            ? <>+<AnimLiczba wartosc={ilosc * sztuka} miejsca={miejscaKwoty(ilosc * sztuka)} /> {jednostkaCeny}</>
            : <>{kwotaPl(sztuka)} {jednostkaCeny} za {dodatek.zaJednostke}</>}
        </span>
        <span className="whitespace-nowrap opacity-70">do {dodatek.max}</span>
      </p>
    </div>
  );
}

/**
 * Statyczny wiersz puli dla planu bez wyboru progu (Lite, plany firmowe) albo
 * bez puli (Bezpłatny) — ta sama geometria i wysokość co suwak, więc karty
 * obok siebie mają cenę, przycisk i listę na tych samych wysokościach.
 */
export function WierszPuli({ prog, kolor, etykieta, bezPaska }: { prog: ProgCennika; kolor: string; etykieta: string; bezPaska?: boolean }) {
  if (bezPaska) {
    /* Plakietka stoi POD liczbą, w wierszu o stałej wysokości: w wąskiej karcie
       etykieta, „NAJLEPSZY KURS" i pula nie mieszczą się w jednej linii — liczba
       wychodziła za krawędź. Pusty wiersz trzyma karty bez plakietki na tej
       samej wysokości. */
    return (
      <div className="select-none">
        {prog.byte === null ? <div className="h-6" /> : <NaglowekPuli etykieta={etykieta} byte={prog.byte} kolor={kolor} />}
        <div className="flex h-6 items-center justify-end">{prog.plakietka && <PlakietkaPuli tekst={prog.plakietka} />}</div>
      </div>
    );
  }

  if (prog.byte === null) {
    return (
      <div className="select-none space-y-2.5">
        <div className="h-6" />
        <div className="relative py-2.5">
          <div className="relative h-2 w-full rounded-full border border-dashed border-foreground/20 bg-foreground/[0.02]" />
        </div>
      </div>
    );
  }

  return (
    <div className="select-none space-y-2.5">
      <NaglowekPuli etykieta={etykieta} byte={prog.byte} kolor={kolor} plakietka={prog.plakietka} />
      <PasekZablokowany kolor={kolor} />
    </div>
  );
}

/** Zablokowany pasek z kłódką — jeden dla puli bez wyboru progu i dla dodatku, którego plan nie ma. */
function PasekZablokowany({ kolor }: { kolor: string }) {
  return (
    <div className="relative py-2.5">
      <div className="flex items-center gap-2">
        <div
          className="h-2 flex-1 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${tintaAkcentu(kolor, 45)}, ${kolor})`,
            boxShadow: `0 0 14px ${tintaAkcentu(kolor, 40)}`,
          }}
        />
        {/* Kłódka w barwie pisma, nie w bieli: na jasnym motywie biała ikona znikała. */}
        <Lock className="h-[18px] w-[18px] shrink-0 text-foreground opacity-85 drop-shadow-[0_0_8px_hsl(var(--foreground)/0.5)]" />
        <div className="h-2 flex-1 rounded-full border border-foreground/[0.06] bg-foreground/[0.08]" />
      </div>
    </div>
  );
}

/**
 * Dodatek, którego plan nie ma (miejsca Premium w JDG): ta sama geometria co
 * `SuwakDodatku`, ale w miejscu suwaka stoi zablokowany pasek z kłódką.
 */
export function DodatekZablokowanyWiersz({ dodatek, kolor }: { dodatek: DodatekZablokowany; kolor: string }) {
  return (
    <div className={cn('select-none', WYSOKOSC_DODATKU)}>
      <div className="flex h-6 items-center justify-between gap-2">
        <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">{dodatek.etykieta}</span>
        <span className="whitespace-nowrap text-sm font-bold text-muted-foreground">{dodatek.wartosc}</span>
      </div>
      <PasekZablokowany kolor={kolor} />
      <p className="flex h-4 items-center text-[11.5px] leading-tight text-muted-foreground">{dodatek.podpis}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL ZUŻYCIA — „Każdego miesiąca aż": wartość + etykieta + ikona,
   wiersze przychodzą z adaptera, karta ich nie liczy.
   ═══════════════════════════════════════════════════════════════ */
export function PanelZuzycia({ wiersze, kolor }: { wiersze: WierszZuzycia[]; kolor: string }) {
  return (
    <div className="flex flex-col gap-2">
      {wiersze.map((w) => {
        const Ikona = w.ikona;
        return (
          <div key={w.klucz} className="flex items-center gap-2 text-[13px]">
            <strong className="font-semibold tabular-nums text-foreground">
              {typeof w.wartosc === 'number'
                ? <>{w.przed}<AnimLiczba wartosc={w.wartosc} miejsca={w.miejsca ?? 0} />{w.po}</>
                : w.wartosc}
            </strong>
            <span className="flex-1 text-muted-foreground">{w.etykieta}</span>
            <Ikona className="h-3.5 w-3.5 shrink-0 opacity-40" style={{ color: tintaAkcentu(kolor, 80) }} />
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WIERSZ CECHY — ikona w ramce, tekst z `**pogrubieniem**`, plakietka.
   Tony plakietek idą z akcentu motywu, nie z palety Tailwinda.
   ═══════════════════════════════════════════════════════════════ */
const TON_PLAKIETKI: Record<TonPlakietkiCennika, string> = {
  akcent: 'hsl(var(--primary))',
  cichy: 'hsl(var(--foreground) / 0.6)',
};

export function WierszCechy({ cecha }: { cecha: CechaCennika }) {
  const Ikona = cecha.ikona;
  const ton = cecha.plakietka?.ton ?? 'akcent';
  const cichy = ton === 'cichy';
  return (
    <div className="flex min-h-[34px] items-center gap-3 py-0.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-primary/35 bg-primary/10">
        <Ikona className="h-3.5 w-3.5 text-primary" />
      </span>
      {/* Tekst i plakietka zawijają się razem: w wąskiej karcie plakietka schodzi
          pod tekst, zamiast ściskać go do słowa na linię i wychodzić za krawędź. */}
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
        <span className="min-w-0 grow basis-32 text-sm font-medium leading-snug text-foreground">
          {cecha.tekst.split(/\*\*(.+?)\*\*/g).map((cz, i) =>
            i % 2 ? <strong key={i} className="font-semibold text-foreground">{cz}</strong> : cz,
          )}
        </span>
        {cecha.plakietka && (
          <span
            className="shrink-0 self-center whitespace-nowrap rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color: TON_PLAKIETKI[ton],
              background: cichy ? 'transparent' : tintaAkcentu(TON_PLAKIETKI[ton], 15),
              borderColor: cichy ? 'hsl(var(--foreground) / 0.18)' : tintaAkcentu(TON_PLAKIETKI[ton], 30),
            }}
          >
            {cecha.plakietka.tekst}
          </span>
        )}
      </span>
    </div>
  );
}

/**
 * Rozwijanie do auto-wysokości — wysokość mierzona `ResizeObserver`em, bo
 * sztuczka z `grid-template-rows 0fr↔1fr` nie zwija treści, która sama
 * mierzy się w środku. Bez `filter` i bez `scale`, żeby nie gasić szkła.
 */
export function Rozwijane({ otwarte, children }: { otwarte: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setH(el.scrollHeight);
    /* jsdom nie ma `ResizeObserver` — bez strażnika test komponentu padałby
       na ReferenceError, choć w przeglądarce wszystko działa. */
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setH(el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="overflow-hidden"
      style={{
        height: otwarte ? h : 0,
        opacity: otwarte ? 1 : 0,
        transition: 'height .45s cubic-bezier(.22,1,.36,1), opacity .3s ease',
      }}
      aria-hidden={!otwarte}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}
