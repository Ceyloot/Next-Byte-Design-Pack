import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { SZKLO } from '@/components/ui/tile';
import { AreaChart, Area, ChartTooltip, ZMIENNE_WYKRESU } from '@/components/ui/area-chart';
import { wypelnieniePaska, TOR_PASKA } from '@/components/ui/material-paska';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  WSKAŹNIKI — łuk, pierścień, pasek zasobu
 * ════════════════════════════════════════════════════════════════════════
 *
 * Trzy kształty do pokazywania jednej liczby w kontekście limitu. Używane na
 * Przeglądzie Panelu Zarządu.
 *
 * DLACZEGO CZYSTY SVG, A NIE RECHARTS/VISX (oba są w projekcie)
 * Biblioteki wykresów rysują kolorami podanymi jako łańcuchy znaków, więc
 * każdy motyw wymagałby przeliczenia palety w JS i przekazania jej w dół.
 * Tu kolor jest atrybutem CSS (`stroke`), czyli po prostu `hsl(var(--primary))`
 * — motyw przełącza się sam, bez jednej linii JavaScriptu. Przy trzech
 * kształtach bez osi, skal i podpowiedzi biblioteka nic nie wnosi.
 *
 * ── KOLOR STANU ────────────────────────────────────────────────────────
 * DWA KOLORY: akcent motywu i czerwień. Bez zieleni, bez żółci.
 *
 * KOREKTA WCZEŚNIEJSZEJ WERSJI TEGO KOMENTARZA (01.08.2026).
 * Stało tu, że motywy „NIE MAJĄ `--success`", więc łańcuch zapasowy
 * `hsl(var(--success, var(--primary)))` zawsze spadnie na akcent motywu.
 * TO BYŁO NIEPRAWDĄ i dało się to zobaczyć na ekranie: karty metryk świeciły
 * jaskrawą zielenią `145 58% 55%` również na Smoczym, gdzie cała paleta jest
 * czerwono-pomarańczowa.
 *
 * Jak jest naprawdę — zweryfikowane w kodzie i w DOM:
 *   • `useGlobalTheme.ts:61` wstrzykuje zmienne po NAZWACH Z BAZY
 *     (`color.css_variable`), więc szukanie `--success` w kodzie niczego nie
 *     znajdzie — nazwy są danymi, nie kodem. Stąd mój błędny wniosek.
 *   • `--success` NIE ma go w `BEZPIECZNE_ZMIENNE`
 *     (`sandbox/useMotywyPodgladu.ts:28`), czyli w liście zweryfikowanej
 *     zapytaniem do bazy jako „ustawiane przez wszystkie 14 motywów".
 *     Dokumentacja tamtego pliku mówi wprost, co to oznacza: wygląd zaczyna
 *     ZALEŻEĆ OD TEGO, JAKI MOTYW KTOŚ KUPIŁ.
 *
 * Dlatego „dobra wiadomość" niesie po prostu `--primary`. Jest to zgodne
 * z decyzją o dwóch kolorach i — co ważniejsze — działa tak samo u każdego
 * użytkownika, niezależnie od kupionego motywu.
 * Kierunek zmiany niosą strzałka i znak liczby, nie sam kolor.
 *
 * ── DOSTĘPNOŚĆ ─────────────────────────────────────────────────────────
 * Każdy wskaźnik jest `role="meter"` z pełnym zestawem `aria-value*`, więc
 * czytnik ekranu mówi „62 procent, wykorzystanie bazy", zamiast milczeć nad
 * ozdobną grafiką. Animacja ustępuje przy `prefers-reduced-motion`.
 */

export type StanWskaznika = 'dobry' | 'uwaga' | 'krytyczny' | 'neutralny';

/**
 * Kolor stanu wskaźnika — CELOWO TYLKO DWA.
 *
 * 1. STAN „DOBRY" TO AKCENT MOTYWU, NIE ZIELEŃ.
 *    Wykorzystanie zasobu w normie nie jest sukcesem — to stan spoczynkowy.
 *    Zieleń odbierała każdemu motywowi tożsamość: ciemny przestawał być
 *    błękitny, Smoczy czerwony, Luxury złoty. Zieleń zostaje dla DYSKRETNYCH
 *    statusów („opłacone", „aktywne"), gdzie naprawdę znaczy sukces.
 *
 * 2. STAN „UWAGA" NIE MA WŁASNEGO KOLORU.
 *    Trzeci odcień na skali robił z każdego wskaźnika tęczę, a na dziewięciu
 *    motywach żółć zawsze z czymś kolidowała (Luxury ma złoty akcent, Smoczy
 *    bursztynowy błąd). Zbliżanie się do limitu niesie POZYCJA wypełnienia
 *    względem znaczników progów, które wskaźniki już rysują — kolor nie musi
 *    powtarzać tej informacji. Zmiana na czerwień następuje dopiero przy
 *    realnym przekroczeniu.
 *
 * `--warning` zostaje w motywach, ale do innych zastosowań: banery, plakietki
 * „wygasa za 3 dni". Nie do skali wypełnienia.
 */
/**
 * ⚠️ DWA KOLORY ZOSTAJĄ DOMYŚLNE — SKÓRA MOŻE POPROSIĆ O CZTERY (19.09.2026).
 *
 * Powód dwóch kolorów (opisany wyżej) nie zniknął: motywy platformy są KUPOWANE i nie każdy ustawia
 * `--success` czy `--warning`, więc zieleń na Przeglądzie Zarządu wyglądałaby inaczej u każdego.
 * Dlatego domyślne wartości nadal spadają na `--primary`.
 *
 * Ale tam, gdzie skóra GWARANTUJE te tokeny, dwa kolory są za ubogie. Panel firmowy [firma klienta] ma
 * własną skórę i własne pokrętła barw stanu w Personalizacji (§16z-1: `kolorDobrze`, `kolorUwaga`,
 * `kolorProblem`), więc może poprosić o pełne cztery tony — ustawiając `--wsk-*` w swoim zakresie
 * (`systemWygladu.css`). Bez tego ustawienia nic się nie zmienia: `var(--wsk-dobry, var(--primary))`
 * spada na dotychczasową wartość, więc wszystkie 22 pliki platformy wyglądają identycznie jak wczoraj.
 *
 * Zasada, której to pilnuje: barwa znaczenia jest dozwolona TYLKO tam, gdzie ktoś odpowiada za to,
 * że token istnieje i jest czytelny na tle. Na platformie nikt nie odpowiada, w skórze firmy — właściciel.
 */
const KOLOR: Record<StanWskaznika, string> = {
  dobry: 'hsl(var(--wsk-dobry, var(--primary)))',
  uwaga: 'hsl(var(--wsk-uwaga, var(--primary)))',
  krytyczny: 'hsl(var(--wsk-krytyczny, var(--destructive)))',
  neutralny: 'hsl(var(--wsk-neutralny, var(--primary)))',
};

/**
 * Progi w JEDNYM miejscu — używają ich i kolory stanu, i znaczniki rysowane
 * na wskaźnikach. Rozjazd między „kolor zrobił się czerwony" a „kreska stoi
 * gdzie indziej" byłby błędem widocznym gołym okiem.
 */
export const PROG_UWAGI = 75;
export const PROG_KRYTYCZNY = 90;

/** Stan wyprowadzony z procentu wykorzystania. */
export function stanZProcentu(procent: number): StanWskaznika {
  if (procent >= PROG_KRYTYCZNY) return 'krytyczny';
  if (procent >= PROG_UWAGI) return 'uwaga';
  return 'dobry';
}

/** Czy użytkownik prosi o ograniczenie ruchu. */
function useOgraniczonyRuch(): boolean {
  const [ograniczony, setOgraniczony] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOgraniczony(mq.matches);
    const zmiana = (e: MediaQueryListEvent) => setOgraniczony(e.matches);
    mq.addEventListener('change', zmiana);
    return () => mq.removeEventListener('change', zmiana);
  }, []);
  return ograniczony;
}

/**
 * Płynne dojście wartości od 0 do celu.
 * Wartość rośnie na wejściu, żeby wzrok złapał kierunek — ale tylko wtedy,
 * gdy użytkownik nie prosił o spokój.
 */
function useNarastanie(cel: number, ms = 900): number {
  const ograniczony = useOgraniczonyRuch();
  const [wartosc, setWartosc] = useState(ograniczony ? cel : 0);
  const klatkaRef = useRef<number | null>(null);

  useEffect(() => {
    if (ograniczony) { setWartosc(cel); return; }
    const start = performance.now();
    const od = 0;
    const krok = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      // easeOutCubic — szybko rusza, miękko dochodzi
      const e = 1 - Math.pow(1 - p, 3);
      setWartosc(od + (cel - od) * e);
      if (p < 1) klatkaRef.current = requestAnimationFrame(krok);
    };
    klatkaRef.current = requestAnimationFrame(krok);
    return () => { if (klatkaRef.current) cancelAnimationFrame(klatkaRef.current); };
  }, [cel, ms, ograniczony]);

  return wartosc;
}

// ══════════════════════════════════════════════════════════════════════
//  1. ŁUK — jedna liczba w skali 0-100, półkole
// ══════════════════════════════════════════════════════════════════════

export interface LukProps {
  /** 0-100 */
  procent: number;
  etykieta: string;
  /** Tekst pod liczbą, np. „888 MB z 8 GB" */
  podpis?: string;
  stan?: StanWskaznika;
  rozmiar?: number;
  className?: string;
}

/** Licznik do unikalnych identyfikatorów w SVG (gradienty muszą mieć własne id). */
let licznikId = 0;

export const Luk: React.FC<LukProps> = ({
  procent, etykieta, podpis, stan, rozmiar = 168, className,
}) => {
  const bezpieczny = Math.max(0, Math.min(100, Number.isFinite(procent) ? procent : 0));
  const zanimowany = useNarastanie(bezpieczny);
  const st = stan ?? stanZProcentu(bezpieczny);
  const idRef = useRef<string>();
  if (!idRef.current) idRef.current = `luk-${++licznikId}`;
  const id = idRef.current;

  // Półkole o promieniu r, narysowane jako ścieżka od lewej do prawej.
  const r = 56;
  const grubosc = 10;
  const dlugoscLuku = Math.PI * r;               // obwód półkola
  const wypelnienie = (zanimowany / 100) * dlugoscLuku;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        width={rozmiar}
        height={rozmiar * 0.62}
        viewBox="0 0 140 78"
        role="meter"
        aria-valuenow={Math.round(bezpieczny)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={etykieta}
        className="overflow-visible"
        style={{ color: KOLOR[st] }}
      >
        <defs>
          {/*
            Ten sam język, co pasek: krycie narasta ku aktualnej wartości.
            Łuk biegnie od lewej do prawej, więc gradient poziomy pokrywa się
            z kierunkiem wypełnienia — ogon jest przygaszony, czoło pełne.
          */}
          {/*
            `x2` zwężone do wypełnionej części, a nie do całego toru.
            Bez tego przy 11% widać WYŁĄCZNIE najsłabszy fragment gradientu
            i łuk wygląda na wyblakły — zmierzone na jasnym motywie. Teraz
            gradient zawsze rozkłada się na tym, co faktycznie narysowane,
            więc krótki łuk też dochodzi do pełnego krycia na czole.
            Pierścień tego nie potrzebuje: tam stopnie liczą się od kąta.
          */}
          <linearGradient
            id={`${id}-grad`}
            x1="0" y1="0"
            x2={Math.max(0.18, zanimowany / 100).toFixed(3)} y2="0"
          >
            <stop offset="0%"   stopColor="currentColor" stopOpacity="0.30" />
            <stop offset="55%"  stopColor="currentColor" stopOpacity="0.62" />
            <stop offset="88%"  stopColor="currentColor" stopOpacity="0.94" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* tor */}
        <path
          d={`M ${70 - r} 70 A ${r} ${r} 0 0 1 ${70 + r} 70`}
          fill="none"
          stroke="hsl(var(--foreground) / 0.08)"
          strokeWidth={grubosc}
          strokeLinecap="round"
        />

        {/*
          ZNACZNIK PROGU — kreska w miejscu, od którego robi się nieprzyjemnie.
          Bez niego wskaźnik mówi „ile jest", ale nie mówi „ile zostało do
          kłopotu". Rysowany zawsze, także gdy wartość jest niska, bo właśnie
          wtedy najbardziej informuje.
        */}
        {[PROG_UWAGI, PROG_KRYTYCZNY].map((prog) => {
          const alfa = Math.PI * (1 - prog / 100);   // 0% = lewo, 100% = prawo
          const x1 = 70 + Math.cos(alfa) * (r - grubosc / 2 - 1);
          const y1 = 70 - Math.sin(alfa) * (r - grubosc / 2 - 1);
          const x2 = 70 + Math.cos(alfa) * (r + grubosc / 2 + 1);
          const y2 = 70 - Math.sin(alfa) * (r + grubosc / 2 + 1);
          return (
            <line
              key={prog}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="hsl(var(--foreground) / 0.22)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* wypełnienie — gradient zamiast płaskiego koloru */}
        {bezpieczny > 0 && (
          <path
            d={`M ${70 - r} 70 A ${r} ${r} 0 0 1 ${70 + r} 70`}
            fill="none"
            stroke={`url(#${id}-grad)`}
            strokeWidth={grubosc}
            strokeLinecap="round"
            strokeDasharray={`${wypelnienie} ${dlugoscLuku}`}
            style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}
          />
        )}
        {/* liczba */}
        <text
          x="70" y="60"
          textAnchor="middle"
          className="fill-foreground font-heading"
          style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
        >
          {Math.round(zanimowany)}%
        </text>
      </svg>

      <p className="mt-1 text-center text-[14px] font-semibold text-foreground">{etykieta}</p>
      {podpis && (
        <p className="mt-0.5 text-center text-[14px] text-muted-foreground tabular-nums">{podpis}</p>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
//  2. PIERŚCIEŃ — liczba bezwzględna w środku, udział na obwodzie
// ══════════════════════════════════════════════════════════════════════

export interface PierscienProps {
  /** Liczba pokazywana w środku — bezwzględna, nie procent. */
  wartosc: number | string;
  /** 0-100 — jaka część pierścienia ma być wypełniona. */
  procent: number;
  etykieta: string;
  stan?: StanWskaznika;
  rozmiar?: number;
  className?: string;
}

export const Pierscien: React.FC<PierscienProps> = ({
  wartosc, procent, etykieta, stan, rozmiar = 92, className,
}) => {
  const bezpieczny = Math.max(0, Math.min(100, Number.isFinite(procent) ? procent : 0));
  const zanimowany = useNarastanie(bezpieczny);
  // Stan wyliczany z wartości tak samo jak w łuku i pasku. Wcześniej domyślną
  // było `neutralny`, więc pierścień jako jedyny nie sygnalizował przekroczeń.
  const st = stan ?? stanZProcentu(bezpieczny);
  const c = KOLOR[st];

  /**
   * MINIMALNY WIDOCZNY WYCINEK.
   *
   * Przy udziale rzędu 0,07% (68 użytkowników ze 100 000) kąt wychodzi
   * ułamkiem stopnia — zostawała sama jasna kropka zaokrąglenia, bez obręczy
   * za nią. Czytało się to jak artefakt, nie jak „prawie zero". Podłoga 6°
   * daje krótki, czytelny wycinek, a że wartość i tak stoi liczbą w środku,
   * nikogo nie wprowadza w błąd co do skali.
   */
  const MIN_STOPNI = 6;
  const surowyKat = (zanimowany / 100) * 360;
  const kat = bezpieczny > 0 ? Math.max(MIN_STOPNI, surowyKat) : 0;

  /**
   * Pierścień rysowany `conic-gradient`em, a NIE obrysem SVG — wypełnienie
   * biegnie po KĄCIE, a SVG nie ma gradientu kątowego.
   *
   * PRZEBUDOWA PO OCENIE: poprzednia wersja miała obręcz grubą na ~27%
   * promienia i tor na 8% krycia, przez co czytała się jako szary pączek
   * z małym kolorowym kawałkiem — cała waga wizualna siedziała na PUSTEJ
   * części. Teraz:
   *   • obręcz cieńsza (pasmo ~11% promienia) — kształt jest delikatny,
   *     a liczba w środku przejmuje uwagę;
   *   • tor ledwie widoczny (4%) — pokazuje skalę, nie konkuruje;
   *   • ZAOKRĄGLONE CZOŁO: `conic-gradient` ucina się na ostro, co wyglądało
   *     na niedokończone. Dokładamy kropkę na końcu łuku (i na starcie),
   *     żeby pasmo miało miękkie zakończenia jak pasek i łuk.
   */
  const GRUBOSC = 0.11;                       // udział promienia
  const wewnetrzny = (0.5 - GRUBOSC) * 100;   // % promienia, gdzie zaczyna się dziura
  const maska =
    `radial-gradient(closest-side, transparent ${wewnetrzny * 2}%, #000 ${wewnetrzny * 2 + 1.5}%)`;

  const wspolne: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    WebkitMaskImage: maska,
    maskImage: maska,
  };

  // Środek pasma — tam siadają zaokrąglenia końców.
  const promienPasma = rozmiar / 2 - (rozmiar * GRUBOSC) / 2;
  const srodek = rozmiar / 2;
  const gruboscPx = rozmiar * GRUBOSC;
  const punkt = (stopnie: number) => {
    const rad = ((stopnie - 90) * Math.PI) / 180;
    return {
      left: srodek + Math.cos(rad) * promienPasma - gruboscPx / 2,
      top: srodek + Math.sin(rad) * promienPasma - gruboscPx / 2,
    };
  };

  return (
    <div className={cn('flex flex-col items-center gap-2.5', className)}>
      <div
        className="relative"
        style={{ width: rozmiar, height: rozmiar, color: c }}
        role="meter"
        aria-valuenow={Math.round(bezpieczny)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={etykieta}
      >
        {/* tor — ledwie obecny */}
        <div
          style={{
            ...wspolne,
            background: 'conic-gradient(hsl(var(--foreground) / 0.04) 0deg 360deg)',
          }}
        />

        {bezpieczny > 0 && (
          <>
            {/* wypełnienie — krycie narasta ku czołu */}
            <div
              style={{
                ...wspolne,
                // BEZ `from -90deg`. `conic-gradient` w CSS startuje już na
                // godzinie 12; dodanie obrotu przesuwało łuk na godzinę 9,
                // podczas gdy matematyka zaokrąglenia czoła liczyła od 12 —
                // stąd kropka wisiała w zupełnie innym miejscu niż koniec pasma.
                background: `conic-gradient(
                  color-mix(in srgb, ${c} 20%, transparent) 0deg,
                  color-mix(in srgb, ${c} 52%, transparent) ${kat * 0.55}deg,
                  color-mix(in srgb, ${c} 90%, transparent) ${kat * 0.88}deg,
                  ${c} ${kat}deg,
                  transparent ${kat}deg)`,
                filter: 'drop-shadow(0 0 6px currentColor)',
              }}
            />
            {/*
              Zaokrąglenia startu tu NIE MA — celowo.
              Przy krótkich łukach kropka startu i kropka czoła siadały niemal
              w tym samym miejscu i czytały się jako dwa osobne punkty zawieszone
              nad obręczą, a nie jako zakończenia pasma. Gradient stożkowy i tak
              zaczyna się przygaszony, więc początek jest miękki bez dokładki.
            */}
            {/* zaokrąglenie czoła — pełne krycie i poświata */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full"
              style={{
                width: gruboscPx, height: gruboscPx, ...punkt(kat),
                background: c,
                boxShadow: `0 0 8px -1px ${c}`,
              }}
            />
          </>
        )}

        {/* Liczba jako HTML, nie <text> — dziedziczy krój i skaluje się z tekstem strony. */}
        <div className="absolute inset-0 flex items-center justify-center px-2">
          <span className="truncate font-heading text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {wartosc}
          </span>
        </div>
      </div>
      <p className="max-w-[9rem] text-center text-[14px] leading-snug text-muted-foreground">
        {etykieta}
      </p>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
//  3. PASEK ZASOBU — wykorzystanie limitu, wzorowane na Usage Summary
// ══════════════════════════════════════════════════════════════════════

export interface PasekZasobuProps {
  etykieta: string;
  /** Zużyte — sformatowane do wyświetlenia, np. „888 MB". */
  uzyte: string;
  /** Limit — sformatowany, np. „8 GB". `null` = brak znanego limitu. */
  limit?: string | null;
  /** 0-100. `null` = nie da się zmierzyć; pasek pokazuje wtedy stan „nieznane". */
  procent: number | null;
  /**
   * Jak wygląda wypełnienie:
   * - `czolo`   — krycie narasta ku aktualnej wartości (DOMYŚLNE, wybrane
   *               przez właściciela: oko samo biegnie do liczby, a pasek
   *               nie jest ciężką plamą koloru);
   * - `obwodka` — sam jasny rant, wnętrze prawie puste. Zostawione dla
   *               przypadków, gdzie pasek ma być wyłącznie tłem dla liczby.
   */
  wariant?: 'obwodka' | 'czolo';
  /**
   * CIENKI (26.09.2026, kafelek PrivateCloud na Panelu Głównym) — sam tor
   * 4 px, bez wiersza etykiety i bez znaczników progów. Dla miejsc, gdzie
   * liczba stoi obok w zdaniu („1,0 GB z 20 GB"), a pasek ma tylko pokazać
   * proporcję. Materiał i kolory stanu te same, co w pełnym pasku — dzięki
   * temu kafelek nie potrzebuje własnego, zaszytego koloru ostrzeżenia.
   * `etykieta` idzie wtedy wyłącznie do `aria-label`.
   */
  cienki?: boolean;
  className?: string;
}

export const PasekZasobu: React.FC<PasekZasobuProps> = ({
  etykieta, uzyte, limit, procent, wariant = 'czolo', cienki, className,
}) => {
  const nieznane = procent == null;
  const bezpieczny = nieznane ? 0 : Math.max(0, Math.min(100, procent));
  const zanimowany = useNarastanie(bezpieczny);
  const st = nieznane ? 'neutralny' : stanZProcentu(bezpieczny);
  const c = KOLOR[st];

  /**
   * Wypełnienie jest ŚWIECĄCĄ KAPSUŁĄ, nie zamalowanym paskiem.
   *
   * Płaskie 100% krycia na całej długości daje ciężką plamę koloru, która
   * przykrywa kartę i na jasnych motywach wygląda jak naklejka. Zamiast tego:
   *
   *   • wnętrze — poziomy gradient narastający ku czołu (6% → 95%), więc oko
   *     samo biegnie w stronę aktualnej wartości;
   *   • drugi gradient pionowy — rozjaśnienie przy górnej krawędzi i wygaszenie
   *     ku dołowi, czyli ten sam „szklany" refleks, co w .nb-glass;
   *   • obwódka — `inset 0 0 0 1px` w kolorze stanu, to ona niesie kształt;
   *   • poświata — jeden miękki cień na zewnątrz, celowo słaby (alfa 0.45),
   *     żeby czytać się jako światło, a nie jako neon.
   *
   * `color: c` na kontenerze pozwala użyć `currentColor` w cieniu, więc kolor
   * stanu jest podany DOKŁADNIE RAZ.
   */
  const szerokosc = `${Math.max(zanimowany, bezpieczny > 0 ? 2 : 0)}%`;

  const wypelnienie: React.CSSProperties =
    wariant === 'obwodka'
      ? {
          // RANT NIESIE KSZTAŁT, wnętrze tylko sugeruje wypełnienie.
          // Gradient pionowy: mocniej przy górnej i dolnej krawędzi, prawie
          // przezroczyście w osi — to daje wrażenie podświetlonej rurki, a nie
          // zamalowanego prostokąta. Rant to `inset 0 0 0 1px`, poświata to
          // jeden miękki cień na zewnątrz, celowo słaby.
          width: szerokosc,
          color: c,
          backgroundImage: `linear-gradient(180deg,
            color-mix(in srgb, ${c} 42%, transparent) 0%,
            color-mix(in srgb, ${c} 8%, transparent) 45%,
            color-mix(in srgb, ${c} 10%, transparent) 55%,
            color-mix(in srgb, ${c} 34%, transparent) 100%)`,
          boxShadow: `inset 0 0 0 1px currentColor, 0 0 7px -2px currentColor`,
        }
      // Wariant „czoło" — wnętrze narasta ku aktualnej wartości.
      // Przepis wyprowadzony do `material-paska.ts`, bo używa go też suwak.
      // Trzymanie go tutaj skończyło się tym, że suwak dostał płaską
      // wypełniankę i przez to nie pasował do paska stojącego obok.
      : wypelnieniePaska(c, szerokosc);

  if (cienki) {
    return (
      <div
        className={cn('relative h-1 w-full overflow-hidden rounded-full', className)}
        style={TOR_PASKA}
        role="meter"
        aria-valuenow={nieznane ? undefined : Math.round(bezpieczny)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={etykieta}
      >
        {!nieznane && bezpieczny > 0 && (
          <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300" style={wypelnienie} />
        )}
      </div>
    );
  }

  return (
    <div className={cn('py-3', className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[14px] text-foreground">{etykieta}</span>
        <span className="shrink-0 text-[14px] tabular-nums text-muted-foreground">
          {nieznane ? (
            'niemierzalne'
          ) : (
            <>
              {uzyte}
              {limit && <span className="opacity-60"> z {limit}</span>}
              <span className="ml-1.5 font-semibold text-foreground">
                {bezpieczny < 1 ? '<1' : Math.round(bezpieczny)}%
              </span>
            </>
          )}
        </span>
      </div>

      <div
        className="relative h-2.5 w-full overflow-hidden rounded-full"
        style={{
          ...TOR_PASKA,
          // Tor przerywany, gdy wartości NIE DA SIĘ zmierzyć. Ciągły pusty pasek
          // czyta się jak „zero", a to zupełnie co innego niż „nie wiemy".
          ...(nieznane
            ? {
                boxShadow: 'inset 0 0 0 1px hsl(var(--foreground) / 0.05)',
                backgroundImage:
                  'repeating-linear-gradient(90deg, hsl(var(--foreground)/0.10) 0 4px, transparent 4px 9px)',
              }
            : {}),
        }}
        role="meter"
        aria-valuenow={nieznane ? undefined : Math.round(bezpieczny)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={etykieta}
      >
        {/* Znaczniki progów — widać, ile zostało do kłopotu. */}
        {!nieznane && [PROG_UWAGI, PROG_KRYTYCZNY].map((prog) => (
          <span
            key={prog}
            aria-hidden="true"
            className="absolute inset-y-0 w-px"
            style={{ left: `${prog}%`, background: 'hsl(var(--foreground) / 0.20)' }}
          />
        ))}

        {!nieznane && bezpieczny > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
            style={wypelnienie}
          />
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
//  3b. PASEK ROZKŁADU — jedna całość podzielona na części
// ══════════════════════════════════════════════════════════════════════

/*
  CZYM SIĘ RÓŻNI OD „PASKA ZASOBU" — bo to nie jest jego wariant.

  Pasek zasobu odpowiada na pytanie ILE ZOSTAŁO DO LIMITU. Stąd znaczniki
  progów 75/90 i czerwień przy przekroczeniu: wysoki procent to zła nowina.

  Pasek rozkładu odpowiada na pytanie NA CO ROZESZŁA SIĘ CAŁOŚĆ. Progi
  zasobu nie znaczą tu nic (75% ludzi, którzy poszli dalej, to bardzo dobrze),
  a części są RÓWNORZĘDNYMI KATEGORIAMI, nie poziomami tej samej skali.

  Pierwszy raz potrzebny przy lejku onboardingu: „ze 147 osób 33 poszły dalej,
  0 pominęło, 114 utknęło". Trzy osobne paski nie pokazałyby, że to JEDNA setka
  ludzi, która się gdzieś rozeszła — a właśnie o to całe pytanie chodzi.

  MATERIAŁ JEST TEN SAM, CO W PASKU ZASOBU — `wypelnieniePaska` i `TOR_PASKA`
  z `material-paska.ts`. To nie jest uprzejmość, tylko wniosek z pomyłki
  opisanej w nagłówku tamtego pliku: pasek napisany „w tym samym stylu", ale
  własnym kodem, rozjeżdża się przy pierwszej zmianie. Tutaj przepis jest
  wołany, nie przepisywany.

  PALETA — dwa kolory motywu, nie trzy. Powód jest ten sam, dla którego skala
  wskaźników nie ma żółci (patrz KOLOR wyżej): trzeci odcień na dziewięciu
  motywach zawsze z czymś koliduje. Kategorie rozróżnia więc `primary`,
  przygaszony `foreground` i `destructive` — wszystkie już w motywie.
*/

/** Wydźwięk części — steruje kolorem, nie tylko odcieniem. */
export type TonCzesci = 'akcent' | 'cichy' | 'alarm';

const KOLOR_CZESCI: Record<TonCzesci, string> = {
  akcent: 'hsl(var(--primary))',
  cichy: 'hsl(var(--foreground) / 0.35)',
  alarm: 'hsl(var(--destructive))',
};

export interface CzescRozkladu {
  /** Nazwa kategorii — trafia do czytnika ekranu i podpowiedzi. */
  etykieta: string;
  wartosc: number;
  ton?: TonCzesci;
}

export interface PasekRozkladuProps {
  etykieta: string;
  czesci: CzescRozkladu[];
  /**
   * Całość, względem której liczone są udziały. Bez tego suma części —
   * ale podanie jej jawnie ma sens wszędzie tam, gdzie części NIE wyczerpują
   * całości (np. „ilu z 33 respondentów wybrało tę opcję" przy wyborze
   * wielokrotnym, gdzie udziały sumują się grubo powyżej 100%).
   */
  calosc?: number;
  /** Liczba po prawej, nad paskiem — np. „33 z 147". */
  opisWartosci?: React.ReactNode;
  /**
   * Procent wyróżniony na końcu wiersza. Bez tego liczony z pierwszej części.
   * `null` chowa go zupełnie.
   */
  procent?: number | null;
  /** Czy wyróżniony procent ma świecić na czerwono. */
  procentAlarm?: boolean;
  /** Pogrubiona etykieta — dla list, gdzie wiersz jest pozycją nadrzędną. */
  mocna?: boolean;
  className?: string;
}

export const PasekRozkladu: React.FC<PasekRozkladuProps> = ({
  etykieta, czesci, calosc, opisWartosci, procent, procentAlarm = false,
  mocna = false, className,
}) => {
  const suma = czesci.reduce((a, c) => a + Math.max(0, c.wartosc), 0);
  const podstawa = Math.max(calosc ?? suma, 0);

  /*
    JEDEN HOOK NA CAŁY PASEK, nie po jednym na część.
    `useNarastanie` to hook — wołanie go w pętli po tablicy o zmiennej długości
    złamałoby zasady Reacta przy pierwszym przeliczeniu danych. Animujemy więc
    wspólny współczynnik 0→1 i mnożymy przez niego wszystkie udziały, przez co
    segmenty rosną razem, jak jedna rzecz.
  */
  const postep = useNarastanie(100) / 100;

  const udzial = (v: number) => (podstawa > 0 ? (Math.max(0, v) / podstawa) * 100 : 0);
  const wyroznionyProcent =
    procent === null ? null
    : procent !== undefined ? procent
    : Math.round(udzial(czesci[0]?.wartosc ?? 0));

  return (
    <div className={cn('py-2', className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className={cn('text-[14px] text-foreground', mocna && 'font-medium')}>
          {etykieta}
        </span>
        <span className="shrink-0 text-[14px] tabular-nums text-muted-foreground">
          {opisWartosci}
          {wyroznionyProcent !== null && (
            <span className={cn('ml-1.5 font-semibold',
                                procentAlarm ? 'text-destructive' : 'text-foreground')}>
              {wyroznionyProcent < 1 && wyroznionyProcent > 0 ? '<1' : Math.round(wyroznionyProcent)}%
            </span>
          )}
        </span>
      </div>

      <div
        className="relative flex h-2.5 w-full overflow-hidden rounded-full"
        style={TOR_PASKA}
        role="meter"
        aria-valuenow={Math.round(udzial(czesci[0]?.wartosc ?? 0))}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={etykieta}
      >
        {czesci.map((c, i) => {
          const szer = udzial(c.wartosc) * postep;
          if (szer <= 0) return null;
          const kolor = KOLOR_CZESCI[c.ton ?? 'akcent'];
          return (
            <div
              key={`${c.etykieta}-${i}`}
              className="h-full rounded-full transition-[width] duration-300"
              title={`${c.etykieta}: ${c.wartosc}`}
              style={{
                ...wypelnieniePaska(kolor, `${szer}%`),
                /*
                  Ujemny margines zsuwa sąsiednie segmenty o grubość rantu.
                  Bez tego dwa ranty stykają się i między kolorami powstaje
                  jasna kreska, która czyta się jak czwarta, pusta kategoria.
                */
                ...(i > 0 ? { marginLeft: '-1px' } : {}),
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
//  4. KARTA METRYKI — liczba, zmiana i przebieg w czasie
// ══════════════════════════════════════════════════════════════════════

/**
 * PRZEBIEG — mini-wykres w karcie metryki, TERAZ Z NAJECHANIEM.
 *
 * DLACZEGO PRZEZ `ui/area-chart`, A NIE WŁASNA ŁAMANA
 * Poprzednia wersja rysowała ścieżkę SVG ręcznie: 40 linii, zero interakcji.
 * Obok, w `management/TokensAnalytics`, stała już pełna biblioteka wykresu
 * (2322 linie) z podpowiedzią, celownikiem, znacznikiem daty i odbijaniem
 * dymka przy krawędzi — czyli dokładnie to zachowanie, o które poprosił
 * Michał. Dwie implementacje wykresu w jednym projekcie to ten sam rozjazd,
 * który likwidujemy przy każdym innym komponencie; podpięcie karty pod
 * istniejący wykres daje najechanie WSZĘDZIE, gdzie stoi karta metryki,
 * i zostawia jedną implementację zamiast dwóch.
 *
 * Wersja w karcie jest CELOWO ogołocona: bez siatki i bez osi. Karta pokazuje
 * KSZTAŁT przy jednej dużej liczbie — siatka konkurowałaby z nią o uwagę.
 * Podpowiedź pojawia się dopiero pod kursorem, czyli wtedy, gdy ktoś naprawdę
 * pyta o konkretny punkt.
 */
const Przebieg: React.FC<{
  seria: number[];
  /** podpisy osi X — bez nich podpowiedź pokazuje sam numer punktu */
  etykiety?: string[];
  kolor: string;
  nazwa: string;
  formatuj?: (v: number) => string;
  wysokosc?: number;
}> = ({ seria, etykiety, kolor, nazwa, formatuj, wysokosc = 40 }) => {
  if (!seria || seria.length < 2) return null;

  /*
    OŚ X MUSI BYĆ DATĄ — `area-chart` buduje skalę czasu i robi
    `new Date(wartość)` na tym, co dostanie (patrz `area-chart.tsx`, budowa
    `xAccessor`). Podpisy w rodzaju „16 cze" dają `Invalid Date`, więc WSZYSTKIE
    punkty lądowały na x=0: ścieżka miała 10 px długości i przebieg był
    niewidoczny, mimo że element renderował się z pełną szerokością.
    Zmierzone w przeglądarce — na zrzucie widać było tylko pustą przestrzeń.

    Karta metryki dostaje jednak serię BEZ dat (osiem tygodni, pięć wdrożeń,
    dowolne kubełki), a osi X i tak nie rysuje. Dlatego oś dostaje równomierny
    ciąg dni, który służy WYŁĄCZNIE do rozstawienia punktów, a ludzki podpis
    jedzie osobnym polem i pokazuje się w podpowiedzi. Gdyby ktoś kiedyś włączył
    tu `XAxis`, zobaczyłby ten sztuczny ciąg — i dlatego stoi to napisane tutaj,
    a nie jest ukryte w mapowaniu.
  */
  const dane = seria.map((v, i) => ({
    x: new Date(2000, 0, 1 + i),
    wartosc: v,
    podpis: etykiety?.[i] ?? '',
  }));

  return (
    <div style={{ ...ZMIENNE_WYKRESU, '--chart-line-primary': kolor } as React.CSSProperties}>
      <AreaChart
        data={dane}
        xDataKey="x"
        /*
          PROPORCJA, A NIE `auto`. `AreaChart` liczy wysokość z `aspectRatio`,
          więc „auto" dawało ZERO wysokości i przebieg znikał z karty bez
          żadnego błędu — sprawdzone na zrzucie, bo pomiar liczby elementów
          `svg` w karcie trafiał w ikonę i pokazywał, że wykres „jest".
          8:1 przy karcie ~330 px daje ok. 40 px, czyli tyle, ile miała
          poprzednia ręczna łamana.
        */
        aspectRatio="8 / 1"
        /*
          Podpowiedź i plakietka osi biorą nagłówek z DATY, a nasza jest
          sztuczna — bez tego w dymku pokazywało się „Sat, Jan 8" zamiast
          „2 sie". Mapujemy datę z powrotem na indeks (ciąg jest równomierny,
          po jednym dniu) i oddajemy podpis, który podał wywołujący.
        */
        formatDateLabel={(d) => {
          const i = Math.round((d.getTime() - new Date(2000, 0, 1).getTime()) / 86_400_000);
          return etykiety?.[i] ?? `${i + 1}`;
        }}
        margin={{ top: 4, right: 2, bottom: 2, left: 2 }}
        className="w-full"
      >
        <Area dataKey="wartosc" fillOpacity={0.28} gradientToOpacity={0} />
        {/* Plakietka daty jest wyłączona DOMYŚLNIE w `area-chart` — zawsze
            duplikowała datę z nagłówka dymka. Tu nie trzeba już nic podawać. */}
        <ChartTooltip
          rows={(punkt) => [{
            color: kolor,
            // Nazwa metryki, NIE data — datę niesie już nagłówek podpowiedzi
            // (przez `formatDateLabel`). Zanim to naprawiłem, nagłówek pokazywał
            // sztuczne „Sat, Jan 8", więc wkładałem podpis do wiersza; po
            // naprawie nagłówka wiersz powtarzał tę samą datę dwa razy.
            label: nazwa,
            value: formatuj
              ? formatuj(punkt.wartosc as number)
              : ((punkt.wartosc as number) ?? 0).toLocaleString('pl-PL'),
          }]}
        />
      </AreaChart>
    </div>
  );
};

/** Kierunek zmiany. Wydźwięk (dobrze/źle) to OSOBNA sprawa — `wzrostToDobrze`. */
export type StanKierunku = 'wzrost' | 'spadek' | 'bez-zmian';

export interface KartaMetrykiProps {
  etykieta: string;
  /**
   * WĘZEŁ, NIE TYLKO TEKST — rozszerzone 05.08.2026.
   *
   * Było `string | number`, przez co strona Planu nie mogła użyć tej karty:
   * jej saldo to żywy `<NumberFlow>` (animowana liczba), a stan ładowania to
   * pulsujący prostokąt. Zbudowała więc własny kafelek — i ten kafelek nie
   * miał materiału platformy, bo nikt mu go nie dopisał. Klasyczny koszt
   * duplikatu: jedna zmiana wyglądu, dwa miejsca, jedno zapomniane.
   *
   * Węzeł niczego nie psuje istniejącym wywołaniom (tekst i liczba to też
   * `ReactNode`), a domyka rodzinę przypadków, dla których karta powstała.
   */
  wartosc: React.ReactNode;
  /** Jednostka dopisywana mniejszym krojem tuż za liczbą, np. „zł", „⟠". */
  jednostka?: string;
  /** Zmiana względem poprzedniego okresu, np. „+4,6%". */
  delta?: string;
  /** Kierunek zmiany — steruje strzałką. */
  kierunek?: StanKierunku;
  /**
   * Czy wzrost jest dobrą wiadomością. Dla użytkowników — tak. Dla kosztów AI
   * — NIE, i dlatego to osobny przełącznik, a nie wniosek z kierunku strzałki.
   */
  wzrostToDobrze?: boolean;
  /** Dopisek pod liczbą — kontekst słowny. */
  podpis?: string;
  /** Przebieg do mini-wykresu (opcjonalny). */
  seria?: number[];
  /**
   * Podpisy punktów przebiegu — daty, nazwy okresów. Bez nich podpowiedź
   * pokazuje sam numer punktu, co jest prawie bezużyteczne; z nimi mówi
   * „Jul 21 · 283 620", czyli to, po co się w ogóle najeżdża.
   */
  etykietySerii?: string[];
  /** Format liczby w podpowiedzi — np. dopisanie „zł" albo „⟠". */
  formatujSerie?: (v: number) => string;
  ikona?: React.ReactNode;
  /**
   * Sterowanie przypięte do karty — np. „odśwież" przy saldzie. Ląduje
   * w prawym górnym rogu, obok delty, więc nie walczy z liczbą o miejsce.
   * Bez tego slotu strona Planu musiała mieć własny kafelek (patrz `wartosc`).
   */
  akcja?: React.ReactNode;
  /**
   * Slot NA DOLE karty, pod podpisem — na akcję, która jest decyzją, a nie
   * drobnym sterowaniem.
   *
   * Po co osobno od `akcja`: tamten slot stoi w nagłówku, obok etykiety, i jest
   * zaprojektowany na małe ikony (odświeżenie, podpowiedź). Przycisk decyzyjny
   * wciśnięty tam robi się mikroskopijny i ląduje przy rzeczy, z którą nie ma
   * nic wspólnego — zmierzone na „Anuluj subskrypcję" obok ikony odświeżania:
   * dwa zupełnie różne ciężary gatunkowe w jednym rzędzie.
   *
   * Dół karty daje przyciskowi własną przestrzeń i naturalną kolejność czytania:
   * najpierw CO (wartość), potem JAK JEST (podpis), na końcu CO MOGĘ ZROBIĆ.
   */
  stopka?: React.ReactNode;
  className?: string;
}

/*
  ── DELTA I KIERUNEK — jedno źródło dla wszystkich kart metryk ─────────────

  Te dwie funkcje powstały najpierw w Przeglądzie Zarządu, a przy Finansach
  miały powstać drugi raz. Mieszkają więc tutaj, obok karty, której dotyczą.
  Powielenie ich skończyłoby się tym, co przez całą sesję wycinaliśmy: dwoma
  progami „co uznajemy za zmianę" i dwoma sposobami zapisu procentu.

  Zasada: zmiana bez znaku i bez kierunku jest ozdobnikiem. Delta, strzałka
  i wydźwięk muszą mówić to samo — dlatego liczy je jedno miejsce.
*/

/**
 * Sformatowana zmiana procentowa. Zwraca `undefined` poniżej progu 0,05 pp —
 * karta chowa wtedy deltę, zamiast rysować „0,0%", które udaje informację.
 */
export const procentZmiany = (v?: number): string | undefined =>
  v == null || !Number.isFinite(v) || Math.abs(v) < 0.05
    ? undefined
    : `${v > 0 ? '+' : ''}${v.toFixed(1).replace('.', ',')}%`;

/**
 * Zmiana STANU, nie przepływu — dla metryk narastających (łączna liczba
 * użytkowników, saldo w obiegu). Porównuje ostatni punkt serii z punktem
 * sprzed `okno` dni i zwraca procent.
 *
 * DLACZEGO OSOBNA FUNKCJA. Edge liczy `zmiana_7dni` przez SUMOWANIE serii
 * z dwóch tygodni. Dla przepływu (nowe konta dziennie, wydane Byte) to
 * poprawne. Dla serii narastającej suma nie znaczy nic — sumowałaby stany.
 *
 * PO CO TO POWSTAŁO (10.08.2026). Karta „Użytkownicy" nie miała procentu,
 * bo edge go dla niej nie liczy, więc w slocie delty stała LICZBA nowych
 * kont (`+5`), a w trzech sąsiednich kartach PROCENT (`+4,6%`). Ten sam
 * róg karty, ten sam krój, ta sama strzałka — dwie różne jednostki.
 * Czytający rząd metryk widział „+5" i rozumiał „+5%".
 *
 * Liczymy z tej samej serii, którą rysuje mini-wykres karty, więc delta
 * i wykres mówią jednym głosem — zgodnie z zasadą z nagłówka tej sekcji.
 */
export const procentWzrostuStanu = (
  seria?: number[],
  okno = 7,
): number | undefined => {
  if (!seria || seria.length <= okno) return undefined;
  const teraz = seria[seria.length - 1];
  const przed = seria[seria.length - 1 - okno];
  if (!Number.isFinite(teraz) || !Number.isFinite(przed) || przed <= 0) return undefined;
  return ((teraz - przed) / przed) * 100;
};

/**
 * Kierunek strzałki. WYDŹWIĘK (czy wzrost to dobrze) ustawia osobno
 * `wzrostToDobrze` — rosnące koszty i rosnące przychody mają ten sam
 * kierunek, a przeciwne znaczenie.
 */
export const kierunekZmiany = (v?: number): StanKierunku =>
  v == null || !Number.isFinite(v) || Math.abs(v) < 0.05
    ? 'bez-zmian'
    : v > 0 ? 'wzrost' : 'spadek';

export const KartaMetryki: React.FC<KartaMetrykiProps> = ({
  etykieta, wartosc, jednostka, delta, kierunek = 'bez-zmian',
  wzrostToDobrze = true, podpis, seria, etykietySerii, formatujSerie, ikona, akcja, stopka, className,
}) => {
  /**
   * Kolor delty zależy od ZNACZENIA, nie od kierunku strzałki.
   * Wzrost kosztów AI jest złą wiadomością mimo strzałki w górę — dlatego
   * `wzrostToDobrze` jest jawnym parametrem, a nie domysłem.
   */
  const dobraWiadomosc =
    kierunek === 'bez-zmian' ? null
    : kierunek === 'wzrost' ? wzrostToDobrze
    : !wzrostToDobrze;

  // `--primary`, NIE `--success` — patrz „KOLOR STANU" w nagłówku pliku.
  // `--success` nie jest ustawiany przez wszystkie motywy, więc kolor delty
  // zależałby od tego, jaki motyw kupił użytkownik.
  const kolorDelty =
    dobraWiadomosc === null ? 'hsl(var(--muted-foreground))'
    : dobraWiadomosc ? 'hsl(var(--primary))'
    : 'hsl(var(--destructive))';

  const strzalka = kierunek === 'wzrost' ? '↑' : kierunek === 'spadek' ? '↓' : '';

  return (
    <div
      className={cn(
        'relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border p-4',
        /*
          SZKŁO, A NIE `bg-card`.

          Zmierzone na tle testowym (02.08.2026): ta karta miała
          `background-color: rgb(8,8,8)` i `backdrop-filter: none` — czyli
          ZERO szkła, przy czym reszta biblioteki już je miała. Nad zdjęciem
          rząd metryk był jedynym pasem czerni na całej stronie i to właśnie
          rzuciło się Michałowi w oczy.

          Powód był prozaiczny: `Tile` dostał szkło przy przeróbce, a ta karta
          nie jest `Tile` — ma własny kontener i po prostu została pominięta.
          Dokładnie ten typ przeoczenia, który wychodzi wyłącznie na tle
          z detalem, a na czarnym tle jest niewidoczny.
        */
        SZKLO,
        className,
      )}
    >
      {/* Cienka świetlna krawędź u góry — ten sam gest, co rant paska. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.45), transparent)',
        }}
      />

      {/*
        IKONA JAKO ZNAK WODNY, nie plakietka.
        Wcześniej siedziała w pigułce obok etykiety i czytała się jak naklejka
        doklejona do karty — dwa drobne elementy walczące o uwagę z liczbą.
        Tutaj jest duża, przygaszona i wypuszczona poza róg, więc buduje
        tożsamość kafelka, nie konkuruje z treścią.
      */}
      {ikona && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-3 -top-3 text-primary/[0.09] [&>svg]:h-20 [&>svg]:w-20"
        >
          {ikona}
        </span>
      )}

      {/*
        LICZBA jest bohaterem, ale NIE MOŻE nachodzić na deltę.
        Poprzedni układ (`justify-between` + nieskracana liczba) przy dłuższych
        wartościach — „48 120", „$24.51" — nakładał pigułkę delty na cyfry,
        a jednostka uciekała do osobnej linii. Teraz liczba dostaje `flex-1
        min-w-0` i skraca się wielokropkiem, delta ma `shrink-0`, a jednostka
        jest przyklejona do liczby przez `whitespace-nowrap`.
        Rozmiar liczby zmniejszony na wąskich ekranach — 32 px przy dwóch
        kolumnach na 375 px nie miało prawa się zmieścić.

        DELTA SCHODZI POD LICZBĘ, GDY SIĘ NIE MIEŚCI (05.10.2026).
        Skracanie liczby wielokropkiem miało chronić przed nachodzeniem, ale
        w wąskiej kolumnie zjadało samą liczbę: „1159 P…” obok plakietki „+10,8%”.
        Liczba ma teraz szerokość własnej treści (`flex-auto`), a wiersz się
        zawija — plakietka przechodzi do drugiej linii, zamiast ucinać bohatera.
        Gdy miejsca starcza, układ jest ten sam co wcześniej: liczba wypełnia
        wiersz, delta stoi przy prawej krawędzi.
      */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5">
        <p className="flex min-w-0 max-w-full flex-auto items-baseline whitespace-nowrap font-heading text-[28px] font-semibold leading-none tabular-nums text-foreground sm:text-[28px]">
          <span className="truncate">{wartosc}</span>
          {jednostka && (
            <span className="ml-1 shrink-0 text-[14px] font-semibold text-muted-foreground">
              {jednostka}
            </span>
          )}
        </p>

        {delta && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
            style={{
              color: kolorDelty,
              background: `color-mix(in srgb, ${kolorDelty} 12%, transparent)`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${kolorDelty} 28%, transparent)`,
            }}
          >
            {strzalka} {delta}
          </span>
        )}

        {akcja && <span className="shrink-0">{akcja}</span>}
      </div>

      {/* ETYKIETA POD LICZBĄ — objaśnia ją, więc idzie za nią. */}
      <p className="mt-2 truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {etykieta}
      </p>

      {seria && seria.length > 1 && (
        <div className="mt-3 -mx-1">
          <Przebieg
            seria={seria}
            etykiety={etykietySerii}
            nazwa={etykieta}
            formatuj={formatujSerie}
            kolor={dobraWiadomosc === false ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
          />
        </div>
      )}

      {podpis && (
        <p className="mt-2 truncate text-[14px] text-muted-foreground">{podpis}</p>
      )}

      {/* Stopka — patrz komentarz przy `stopka` w kontrakcie. */}
      {stopka && <div className="mt-3 flex justify-end">{stopka}</div>}
    </div>
  );
};

/** @deprecated Zostawione, żeby nie psuć istniejących wywołań. Używaj KartaMetryki. */
export const Liczba = KartaMetryki;

/* ══════════════════════════════════════════════════════════════════════════
   POSTĘP — ile ZROBIONE. To NIE jest `PasekZasobu`.
   ══════════════════════════════════════════════════════════════════════════

   Kształt ten sam, znaczenie ODWROTNE — i dlatego to osobny komponent,
   a nie parametr tamtego.

     PasekZasobu   pokazuje ZUŻYCIE LIMITU. Im więcej, tym gorzej.
                   Progi 75% i 90%, przy przekroczeniu robi się czerwony.
     Postep        pokazuje UKOŃCZENIE. Im więcej, tym lepiej.
                   100% to sukces, nie awaria.

   Gdyby podstawić jedno pod drugie (a taka pokusa jest, bo wyglądają tak samo),
   ukończone zadanie świeciłoby na czerwono. Zmierzone w Panelu Głównym: `Progress`
   jest tam użyty w 3 plikach i ZAWSZE w znaczeniu „postęp", nigdy „zużycie".
*/
export interface PostepProps {
  /**
   * Liczba KROKÓW i ile zrobione. Gdy je podasz, pasek dzieli się na tyle
   * segmentów, ile jest kroków — „1 z 5" pokazuje pięć pól i jedno wypełnione.
   */
  krokow?: number;
  zrobione?: number;
  /**
   * TON SEGMENTÓW (19.09.2026). Domyślnie akcent motywu — bez zmian dla platformy. Skóra firmy,
   * która gwarantuje tokeny stanu, może poprosić o zieleń/żółć/czerwień przez `--wsk-*` (§16z-5).
   */
  stan?: StanWskaznika;
  /** wariant ciągły — dla postępu bez policzalnych kroków (np. wgrywanie pliku) */
  procent?: number;
  etykieta?: React.ReactNode;
  /**
   * Nazwa dla czytnika ekranu, gdy pasek stoi BEZ widocznej etykiety — bo nazywa go coś obok
   * (np. podpis wskaźnika w kokpicie). Bez tego czytnik mówi „Postęp” przy każdym pasku w rzędzie
   * i nie da się ich odróżnić. Widoczna `etykieta` ma pierwszeństwo, gdy obie są podane.
   */
  etykietaDostepnosci?: string;
  /** np. „3 z 8 zadań" — stoi po prawej, w jednej linii z etykietą */
  opis?: React.ReactNode;
  className?: string;
}

/**
 * SEGMENTY, NIE CIĄGŁY PASEK — gdy kroki są policzalne.
 *
 * Przy „1 z 5 kroków" ciągły pasek wypełniony w 20% zmusza do liczenia w głowie:
 * patrzysz na kreskę, czytasz liczbę obok i dopiero łączysz jedno z drugim.
 * Pięć segmentów z jednym wypełnionym mówi to samo BEZ liczby — a liczba obok
 * staje się potwierdzeniem, nie jedynym źródłem informacji.
 *
 * To ten sam język, co `ListaCecha` w liście modeli (osiem segmentów oceny).
 * Jedna gramatyka na wszystkie „ile z ilu" w platformie.
 *
 * Wariant ciągły zostaje dla przypadków, w których kroków NIE MA — wgrywanie
 * pliku ma procenty, ale nie ma „kroku trzeciego z pięciu".
 */
export const Postep: React.FC<PostepProps> = ({
  krokow, zrobione = 0, procent, etykieta, etykietaDostepnosci, opis, stan, className,
}) => {
  const segmentowy = typeof krokow === 'number' && krokow > 0;

  // Przycięcie do zakresu — ocena spoza skali narysowałaby pasek, który kłamie
  // o sobie samym (wszystkie segmenty pełne przy „7 z 5" wyglądają jak „5 z 5”).
  const pelnych = segmentowy ? Math.max(0, Math.min(krokow!, Math.round(zrobione))) : 0;
  const p = Math.max(0, Math.min(100, Number.isFinite(procent as number) ? (procent as number) : 0));
  const ukonczone = segmentowy ? pelnych >= krokow! : p >= 100;

  /*
    TEN SAM „PODŚWIETLONY RANT", CO W PASKU ZASOBU — i to jest sedno poprawki
    z 02.08.2026. Pierwsza wersja miała płaskie `bg-primary/80`, przez co obok
    Łuków i Pasków zasobu wyglądała jak element z innego produktu: te mają
    gradient, rant i poświatę, a ten był zamalowanym prostokątem.

    Przepis jest dosłownie ten sam co w `PasekZasobu` (wariant „obwodka"):
    gradient PIONOWY, mocniejszy przy górnej i dolnej krawędzi, prawie
    przezroczysty w osi — oko czyta to jako podświetloną rurkę. Do tego rant
    `inset 0 0 0 1px` i jeden miękki cień na zewnątrz, celowo słaby.
  */
  const rurka = (mocniej: boolean): React.CSSProperties => ({
    color: KOLOR[stan ?? 'neutralny'],
    backgroundImage: `linear-gradient(180deg,
      color-mix(in srgb, currentColor ${mocniej ? 52 : 42}%, transparent) 0%,
      color-mix(in srgb, currentColor 8%, transparent) 45%,
      color-mix(in srgb, currentColor 10%, transparent) 55%,
      color-mix(in srgb, currentColor ${mocniej ? 44 : 34}%, transparent) 100%)`,
    boxShadow: `inset 0 0 0 1px currentColor, 0 0 ${mocniej ? 9 : 7}px -2px currentColor`,
  });

  return (
    <div className={cn('space-y-1.5', className)}>
      {(etykieta || opis) && (
        <div className="flex items-baseline justify-between gap-3">
          {etykieta && (
            <span className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {etykieta}
            </span>
          )}
          {opis && (
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{opis}</span>
          )}
        </div>
      )}

      {segmentowy ? (
        <div
          role="progressbar"
          aria-valuenow={pelnych}
          aria-valuemin={0}
          aria-valuemax={krokow}
          aria-label={typeof etykieta === 'string' ? etykieta : etykietaDostepnosci ?? 'Postęp'}
          className="flex gap-1"
        >
          {Array.from({ length: krokow! }, (_, i) => {
            const zrobiony = i < pelnych;
            // Ostatni zrobiony segment to CZOŁO postępu — świeci mocniej,
            // więc wzrok trafia od razu tam, gdzie jesteś.
            const czolo = zrobiony && i === pelnych - 1;
            return (
              <span
                key={i}
                aria-hidden="true"
                className={cn(
                  'h-2 flex-1 rounded-full transition-[background-image,box-shadow] duration-300 motion-reduce:transition-none',
                  !zrobiony && 'bg-foreground/[0.05] shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.08)]',
                )}
                style={
                  zrobiony
                    // Segmenty zapalają się po kolei, a nie wszystkie naraz —
                    // ruch czyta się wtedy jako „postęp", nie „przeładowanie".
                    ? { ...rurka(czolo || ukonczone), transitionDelay: `${i * 45}ms` }
                    : undefined
                }
              />
            );
          })}
        </div>
      ) : (
        <div
          role="progressbar"
          aria-valuenow={Math.round(p)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={typeof etykieta === 'string' ? etykieta : etykietaDostepnosci ?? 'Postęp'}
          className="relative h-2.5 w-full overflow-hidden rounded-full"
          style={{
            background: 'hsl(var(--foreground) / 0.05)',
            boxShadow: 'inset 0 0 0 1px hsl(var(--foreground) / 0.08)',
          }}
        >
          {p > 0 && (
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
              style={{ width: `${p}%`, ...rurka(ukonczone) }}
            />
          )}
        </div>
      )}
    </div>
  );
};
