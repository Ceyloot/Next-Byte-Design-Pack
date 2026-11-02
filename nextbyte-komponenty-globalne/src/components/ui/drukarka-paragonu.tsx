import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, steps, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DRUKARKA PARAGONU — potwierdzenie, które urządzenie drukuje na oczach klienta.
 *
 * Wydzielona 26.10.2026 z rezerwacji bezpłatnej rozmowy dla firm
 * (`rozmowa/DrukarkaPotwierdzenia.tsx`), żeby ta sama animacja zamykała
 * każdą płatność na platformie. Jeden komponent: zmiana wyglądu drukarki
 * zmienia ją i przy rozmowie, i przy kasie.
 *
 * Ciemne, nieprzezroczyste urządzenie z ekranem stanu i szczeliną; spod szczeliny
 * wysuwa się jasny papier. Papier jedzie `translateY(-100% → 0%)` wewnątrz toru
 * z `overflow: hidden`, który zaczyna się na szczelinie, więc pierwszy wychodzi
 * DÓŁ wydruku (kod kreskowy), a na końcu widać całość.
 *
 * Trzy stany: `zapis` trwa tyle, co prawdziwe żądanie (ale nie krócej niż
 * `minZapisuMs`, inaczej przy szybkim łączu ekran tylko mignie), `druk`
 * to przejazd papieru, `gotowe` zostaje.
 *
 * Ruch wyłącznie przez `transform` i `opacity`. W framer-motion podawany jest
 * PEŁNY napis `transform`: skrót `y` liczy klatki w głównym wątku, pełny napis
 * przeglądarka animuje sama. To NIE jest szkło: materiał urządzenia jest
 * nieprzezroczysty, więc zasady `backdrop-filter` go nie dotyczą.
 */
export type StanDrukarki = 'zapis' | 'druk' | 'gotowe';
export type PosuwDruku = 'plynny' | 'skokowy';

export const CZASY_DRUKARKI = { minZapisuMs: 700, drukMs: 2000, bezRuchuMs: 200 } as const;

/** Krzywa posuwu papieru (powolny start, powolne zatrzymanie) i krzywa wejść drobnych elementów (szybki start, długie wyhamowanie). */
const KRZYWA_POSUWU = [0.77, 0, 0.175, 1] as const;
const KRZYWA_WEJSCIA = [0.23, 1, 0.32, 1] as const;
/** Ile skoków robi papier w trybie skokowym: mniej więcej jeden na linię wydruku. */
const LINII_WYDRUKU = 28;

/* Barwy lokalne, liczone od akcentu motywu. Urządzenie ma być ciemne, a papier
   jasny w OBU motywach, więc nie mogą iść z `--card` ani `--foreground`
   (te odwracają się razem z motywem). */
export const BARWY_DRUKARKI = {
  '--druk-akcent': 'hsl(var(--primary))',
  '--druk-obudowa': 'color-mix(in oklab, hsl(var(--primary)) 7%, black)',
  '--druk-obudowa-gora': 'color-mix(in oklab, hsl(var(--primary)) 14%, black)',
  '--druk-ekran': 'color-mix(in oklab, hsl(var(--primary)) 4%, black)',
  '--druk-szczelina': 'color-mix(in oklab, hsl(var(--primary)) 2%, black)',
  '--druk-rant': 'color-mix(in oklab, hsl(var(--primary)) 28%, transparent)',
  '--druk-tekst': 'color-mix(in oklab, hsl(var(--primary)) 20%, white)',
  '--druk-tekst-cichy': 'color-mix(in oklab, var(--druk-tekst) 62%, transparent)',
  '--druk-cien': 'color-mix(in oklab, black 70%, transparent)',
  '--druk-papier': 'color-mix(in oklab, hsl(var(--primary)) 5%, white)',
  '--druk-atrament': 'color-mix(in oklab, hsl(var(--primary)) 12%, black)',
  '--druk-atrament-cichy': 'color-mix(in oklab, var(--druk-atrament) 62%, transparent)',
} as React.CSSProperties;

/** Górna część ekranu urządzenia: co to za dokument i na jaką kwotę. */
export interface EkranDrukarki {
  etykieta: string;
  tytul: React.ReactNode;
  etykietaKwoty: string;
  kwota: React.ReactNode;
}

export interface DrukarkaParagonuProps {
  ekran: EkranDrukarki;
  /** Napis na ekranie w każdym stanie, ogłaszany czytnikowi ekranu. */
  opisyStanu: Record<StanDrukarki, string>;
  /** `false` = żądanie jeszcze trwa (stan „zapis”); `true` rusza druk. */
  potwierdzone: boolean;
  /** Treść papieru: `PapierParagonu` z klockami niżej. */
  papier: React.ReactNode;
  /** Przyciski pod wydrukiem, widoczne od stanu „gotowe”. */
  akcje?: React.ReactNode;
  /** Papier wychodzi linia po linii (`skokowy`) albo jednym ruchem (`plynny`). */
  posuw?: PosuwDruku;
  /** Woła się raz, gdy wydruk wyjdzie w całości. */
  onGotowe?: () => void;
  className?: string;
}

export function DrukarkaParagonu({
  ekran, opisyStanu, potwierdzone, papier, akcje, posuw = 'skokowy', onGotowe, className,
}: DrukarkaParagonuProps) {
  const ograniczony = useReducedMotion() ?? false;
  const [minalZapis, setMinalZapis] = useState(false);
  const [wydrukowano, setWydrukowano] = useState(false);
  const naGotowe = useRef(onGotowe);
  naGotowe.current = onGotowe;

  useEffect(() => {
    const zegar = setTimeout(() => setMinalZapis(true), CZASY_DRUKARKI.minZapisuMs);
    return () => clearTimeout(zegar);
  }, []);

  const drukuje = potwierdzone && minalZapis;
  const czasDruku = ograniczony ? CZASY_DRUKARKI.bezRuchuMs : CZASY_DRUKARKI.drukMs;

  /* Zegar, nie `onAnimationComplete`: stan „gotowe” ma przyjść także wtedy,
     gdy przeglądarka wstrzyma animację (karta w tle) albo jej nie odtworzy. */
  useEffect(() => {
    if (!drukuje) return;
    const zegar = setTimeout(() => setWydrukowano(true), czasDruku);
    return () => clearTimeout(zegar);
  }, [drukuje, czasDruku]);

  useEffect(() => {
    if (wydrukowano) naGotowe.current?.();
  }, [wydrukowano]);

  const stan: StanDrukarki = !drukuje ? 'zapis' : wydrukowano ? 'gotowe' : 'druk';

  const ruchPapieru = ograniczony
    /* Bez przesuwania: papier stoi na miejscu i tylko nabiera krycia. */
    ? { animate: { transform: 'translateY(0%)', opacity: drukuje ? 1 : 0 }, transition: { duration: CZASY_DRUKARKI.bezRuchuMs / 1000, ease: KRZYWA_WEJSCIA } }
    : {
        animate: { transform: drukuje ? 'translateY(0%)' : 'translateY(-100%)', opacity: 1 },
        transition: posuw === 'skokowy'
          ? { duration: CZASY_DRUKARKI.drukMs / 1000, ease: steps(LINII_WYDRUKU) }
          : { duration: CZASY_DRUKARKI.drukMs / 1000, ease: KRZYWA_POSUWU },
      };

  return (
    <div className={cn('mx-auto w-full max-w-[400px]', className)} style={BARWY_DRUKARKI} data-stan={stan} data-posuw={posuw}>
      {/* ── urządzenie ── */}
      <div
        className="relative z-10 rounded-t-[22px] rounded-b-[10px] p-3 pb-0"
        style={{
          background: 'linear-gradient(180deg, var(--druk-obudowa-gora), var(--druk-obudowa))',
          boxShadow: 'inset 0 1px 0 0 var(--druk-rant), 0 18px 36px -20px var(--druk-cien)',
        }}
      >
        <div className="flex items-center justify-between px-1.5 pb-2.5">
          <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: 'var(--druk-tekst-cichy)' }}>NEXTBYTE</span>
          <span
            aria-hidden="true"
            className={cn('h-1.5 w-1.5 rounded-full', stan !== 'gotowe' && 'animate-pulse motion-reduce:animate-none')}
            style={{ background: 'var(--druk-akcent)' }}
          />
        </div>

        {/* ekran */}
        <div
          className="rounded-xl px-3.5 py-3 font-mono"
          style={{ background: 'var(--druk-ekran)', color: 'var(--druk-tekst)', boxShadow: 'inset 0 0 0 1px var(--druk-rant)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] tracking-[0.06em]" style={{ color: 'var(--druk-tekst-cichy)' }}>{ekran.etykieta}</p>
              <p className="mt-1 truncate text-[14px]">{ekran.tytul}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] tracking-[0.06em]" style={{ color: 'var(--druk-tekst-cichy)' }}>{ekran.etykietaKwoty}</p>
              <p className="mt-1 text-[14px] tabular-nums">{ekran.kwota}</p>
            </div>
          </div>
          <div className="mt-3 border-t border-dashed pt-2.5" style={{ borderColor: 'var(--druk-rant)' }}>
            <p role="status" aria-live="polite" className="flex min-h-5 items-center gap-2 text-[12px]">
              <WskaznikStanu stan={stan} />
              <motion.span
                key={stan}
                initial={{ opacity: 0, transform: 'translateY(4px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                transition={{ duration: ograniczony ? 0 : 0.28, ease: KRZYWA_WEJSCIA }}
              >
                {opisyStanu[stan]}
              </motion.span>
            </p>
          </div>
        </div>

        {/* szczelina: o kilka pikseli szersza od papieru, żeby wydruk wychodził z niej, a nie obok */}
        <div aria-hidden="true" className="mt-3 h-2 rounded-t-[3px] sm:mx-2" style={{ background: 'var(--druk-szczelina)', boxShadow: 'inset 0 2px 3px 0 var(--druk-cien)' }} />
      </div>

      {/* ── tor papieru: zaczyna się na szczelinie, więc papier „wychodzi” z urządzenia ── */}
      <div className="relative -mt-1 overflow-hidden px-4 pb-3 sm:px-6">
        <motion.div
          data-papier=""
          aria-hidden={drukuje ? undefined : true}
          initial={false}
          animate={ruchPapieru.animate}
          transition={ruchPapieru.transition}
          /* Cień na ruchomym wrapperze, nie na papierze: `clip-path` ząbków uciąłby go razem z krawędzią. */
          style={{ filter: 'drop-shadow(0 6px 7px var(--druk-cien))' }}
        >
          {papier}
        </motion.div>
        {/* cień szczeliny leży na torze, nie na papierze: papier przesuwa się pod nim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-6 sm:inset-x-6"
          style={{ background: 'linear-gradient(180deg, var(--druk-cien), transparent)' }}
        />
      </div>

      <div className="mt-3 flex min-h-11 justify-center">
        {stan === 'gotowe' && akcje && (
          <motion.div
            /* Przyciski jeden pod drugim na pełną szerokość papieru: obok siebie wystawały poza kartę (22.10.2026). */
            className="flex w-full flex-col items-stretch gap-2 px-4 sm:px-6"
            initial={{ opacity: 0, transform: 'translateY(6px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: ograniczony ? 0 : 0.32, ease: KRZYWA_WEJSCIA }}
          >
            {akcje}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function WskaznikStanu({ stan }: { stan: StanDrukarki }) {
  if (stan === 'gotowe') {
    return (
      <motion.span
        aria-hidden="true"
        className="grid h-4 w-4 shrink-0 place-items-center rounded-full"
        style={{ background: 'var(--druk-akcent)', color: 'var(--druk-ekran)' }}
        initial={{ opacity: 0, transform: 'scale(0.9)' }}
        animate={{ opacity: 1, transform: 'scale(1)' }}
        transition={{ duration: 0.28, ease: KRZYWA_WEJSCIA }}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </motion.span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
      style={{ color: 'var(--druk-akcent)' }}
    />
  );
}

/* ══ PAPIER ══════════════════════════════════════════════════════════════
   Klocki wydruku. Barwy biorą ze zmiennych `--druk-*` ustawionych na
   drukarce, żeby papier był jasny, a druk ciemny w każdym motywie.        */

/* ── kod kreskowy ───────────────────────────────────────────────────────────
   Paski liczone z cyfr numeru wzorami EAN (lewa i prawa połowa, znaki straży
   na brzegach i w środku). Ten sam numer daje zawsze ten sam rysunek; to ozdoba
   potwierdzenia, nie kod do skanowania.                                       */

const WZORY_EAN = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'] as const;
const odwroc = (wzor: string) => wzor.replace(/[01]/g, (b) => (b === '1' ? '0' : '1'));

/** Moduły kodu: `true` = pasek, `false` = przerwa. */
export function paskiZNumeru(numer: string): boolean[] {
  const cyfry = numer.replace(/[^0-9]/g, '').split('').map(Number);
  const polowa = Math.ceil(cyfry.length / 2);
  const lewa = cyfry.slice(0, polowa).map((c) => WZORY_EAN[c]).join('');
  const prawa = cyfry.slice(polowa).map((c) => odwroc(WZORY_EAN[c])).join('');
  return `101${lewa}01010${prawa}101`.split('').map((b) => b === '1');
}

/** Wielokąt przycinający dół papieru w ząbki, jak po oderwaniu z rolki. */
export function zabkowanaKrawedz(zabkow = 24, glebokoscPx = 7): string {
  const punkty = ['0 0', '100% 0'];
  for (let i = 0; i <= zabkow * 2; i += 1) {
    const x = 100 - (i * 100) / (zabkow * 2);
    punkty.push(`${Number(x.toFixed(3))}% ${i % 2 === 0 ? '100%' : `calc(100% - ${glebokoscPx}px)`}`);
  }
  return `polygon(${punkty.join(', ')})`;
}

const KRAWEDZ = zabkowanaKrawedz();

export function zapiszChwile(iso: string | null): string {
  if (!iso) return '';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  return new Intl.DateTimeFormat('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(data);
}

/** Kartka: jasny papier z ząbkowanym dołem. Dzieci układają się jedno pod drugim. */
export function PapierParagonu({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-4 pb-7 pt-5 font-mono text-[12px] leading-[1.55]"
      style={{ background: 'var(--druk-papier)', color: 'var(--druk-atrament)', clipPath: KRAWEDZ }}
    >
      {children}
    </div>
  );
}

/** Logo, tytuł wydruku i chwila potwierdzenia. Pusta linia trzyma wysokość papieru do chwili potwierdzenia. */
export function NaglowekParagonu({ tytul, chwila }: { tytul: string; chwila: string | null }) {
  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--druk-atrament)' }} />
        <span className="text-[11px] font-bold tracking-[0.3em]">NEXTBYTE</span>
      </div>
      <p className="mt-2.5 text-center text-[13px] font-bold tracking-[0.12em]">{tytul}</p>
      <p className="min-h-[1.55em] text-center tabular-nums" style={{ color: 'var(--druk-atrament-cichy)' }}>{zapiszChwile(chwila)}</p>
    </>
  );
}

export const PrzerywanaParagonu = () => (
  <div aria-hidden="true" className="my-2.5 border-t border-dashed" style={{ borderColor: 'var(--druk-atrament-cichy)' }} />
);

/** Pozycja z kropkowanym prowadzeniem do ceny. */
export function PozycjaParagonu({ nazwa, kwota }: { nazwa: React.ReactNode; kwota: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="min-w-0 [overflow-wrap:anywhere]">{nazwa}</span>
      <span aria-hidden="true" className="min-w-4 flex-1 -translate-y-1 border-b border-dotted" style={{ borderColor: 'var(--druk-atrament-cichy)' }} />
      <span className="shrink-0 tabular-nums">{kwota}</span>
    </div>
  );
}

/** Wiersz danych (`dt` + `dd`) do listy `<dl className="space-y-1">`. */
export function WierszParagonu({ etykieta, children }: { etykieta: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0" style={{ color: 'var(--druk-atrament-cichy)' }}>{etykieta}</dt>
      <dd className="min-w-0 text-right [overflow-wrap:anywhere] [text-wrap:balance]">{children}</dd>
    </div>
  );
}

export function RazemParagonu({ kwota, etykieta = 'RAZEM' }: { kwota: React.ReactNode; etykieta?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[14px] font-bold">
      <span className="tracking-[0.12em]">{etykieta}</span>
      <span className="tabular-nums">{kwota}</span>
    </div>
  );
}

/**
 * Kod kreskowy z numerem pod spodem.
 * @param czego  dopełniacz do podpisu: „zgłoszenia”, „płatności”.
 */
export function KodParagonu({ numer, czego }: { numer: string; czego: string }) {
  const paski = useMemo(() => {
    const moduly = paskiZNumeru(numer);
    /* Sąsiednie moduły łączone w jeden prostokąt: osobne zostawiają włosowe szczeliny przy skalowaniu. */
    const prostokaty: { x: number; szer: number }[] = [];
    moduly.forEach((pasek, i) => {
      if (!pasek) return;
      const ostatni = prostokaty[prostokaty.length - 1];
      if (ostatni && ostatni.x + ostatni.szer === i) ostatni.szer += 1;
      else prostokaty.push({ x: i, szer: 1 });
    });
    return { prostokaty, szerokosc: moduly.length };
  }, [numer]);

  return (
    <div className="mt-4">
      <svg
        role="img"
        aria-label={`Kod kreskowy ${czego} ${numer}`}
        viewBox={`0 0 ${paski.szerokosc} 24`}
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        className="h-11 w-full"
      >
        {paski.prostokaty.map((p) => (
          <rect key={p.x} x={p.x} y={0} width={p.szer} height={24} fill="currentColor" />
        ))}
      </svg>
      <p className="mt-1.5 text-center text-[12px] font-bold tracking-[0.24em]">
        <span className="sr-only">{`Numer ${czego}: `}</span>
        {numer}
      </p>
    </div>
  );
}
