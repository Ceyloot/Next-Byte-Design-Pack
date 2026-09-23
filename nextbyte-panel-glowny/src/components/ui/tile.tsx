import React from 'react';
import { StrzalkaRozwijania } from '@/components/ui/strzalka-rozwijania';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
  RDZEN_STYL_1,
  RDZEN_STYL_2,
  RDZEN_CICHY,
  RDZEN_USUN,
} from '@/components/ui/style-przyciskow';

/**
 * KAFELEK — jeden wygląd, zmienia się tylko treść.
 *
 * Po co to istnieje (zmierzone 30.07.2026 na Panelu Głównym i jego komponentach,
 * 21 plików / 4658 linii): krążyło tam 35 różnych cieni, 31 obramowań i 51 tł.
 * 27 cieni było pisanych ręcznie w nawiasach, 25 użytych DOKŁADNIE RAZ.
 * 18 z 21 plików skleja sobie własny kafelek. Dlatego „usuń" wygląda inaczej
 * w każdym miejscu i całość sprawia wrażenie sklejanej — a nie projektowanej.
 *
 * Czego ten plik NIE robi i dlaczego:
 *   • nie używa `design-system.tsx` — tamten ma warianty zaszyte na paletę
 *     Tailwinda (`blue-500`, `purple-300`, `green-500`), obojętne na motyw.
 *     Przepisanie się na niego pogorszyłoby jasne motywy, nie poprawiło.
 *   • nie używa `bg-black/*`, `text-white/*`, `border-white/*` ani `glass-effect`
 *     — te działają wyłącznie dzięki warstwie łatek `!important` dla
 *     `[data-theme="nextbyte-light"]` w index.css, czyli liście dozwolonych.
 *     Kafelek zbudowany na tokenach nie potrzebuje w tej liście ani jednego wpisu.
 *   • nie używa `--brand-primary-glow` (7 z 14 motywów), `--sidebar*` (5–13/14)
 *     ani `--chart-*` (7/14). Wyłącznie 22 zmienne, które ustawia każdy motyw.
 *
 * Cień: czysta czerń z niską alfą (fizycznie poprawna na jasnym i ciemnym tle)
 * + wewnętrzny refleks 1px liczony od `--foreground`, więc odwracający się razem
 * z motywem. Wcześniej refleks był zaszytą bielą i na jasnych motywach znikał.
 * Oba stopnie jadą z tokenów `--nb-kaf-*` sterowanych z Panelu Zarządu.
 */

/* ── SKALA UNIESIENIA — trzy stopnie, koniec z 35 ───────────────────────
   Cienie przeszły z klas Tailwinda do klas `.nb-kafelek*` w index.css, żeby
   dały się sterować z Panelu Zarządu (zmienne CSS rozwiązuje przeglądarka,
   klasy Tailwinda rozstrzyga BUDOWANIE — patrz style-przyciskow.ts).

   Przy okazji naprawiony ten sam błąd co w przycisku: wewnętrzny refleks
   był `rgb(255 255 255 / 0.06)`, czyli ZASZYTĄ BIELĄ. Na jasnym motywie to
   biel na prawie bieli — refleks znikał bez śladu dokładnie tam, gdzie
   karta najbardziej go potrzebuje. Teraz liczy się od `--foreground`.     */
const ELEWACJA = {
  /** w płaszczyźnie strony — tylko obramowanie */
  plaska: 'shadow-none',
  /** domyślny kafelek */
  uniesiona: 'nb-kafelek',
  /** kafelek pod kursorem, panel nakładany */
  wyzej: 'nb-kafelek nb-kafelek-wyzej',
} as const;

/* ── INTENCJA — sens, nie kolor. Mapowana na zmienne motywu ───────────────
   Tło jest ZAWSZE kartą. Intencję nosi obwódka, ikona i chip.
   Powód: dwóch klas `bg-` nie da się nałożyć — w CSS wygrywa ostatnia, więc
   „czerwony tint" zjadłby bazę karty i kafelek przestałby być czytelny nad
   wzorem i tłem ustawionym przez użytkownika.                              */
/**
 * Klucz `sztabka` (pionowy pasek akcentu) USUNIĘTY 31.07.2026 — kształt kolidował
 * z uchwytem paska przewijania. Powód i decyzja: patrz komentarz przy `TileHeader`.
 * Nie przywracać: jeśli nagłówek potrzebuje akcentu, niesie go ikona i lewy
 * odcinek włosowej linii pod nagłówkiem.
 */
const INTENCJA = {
  neutralna: { obwodka: 'border-border',            ikona: 'text-muted-foreground', chip: 'bg-muted/60' },
  akcent:    { obwodka: 'border-primary/25',        ikona: 'text-primary',          chip: 'bg-primary/10' },
  krytyczna: { obwodka: 'border-destructive/35',    ikona: 'text-destructive',      chip: 'bg-destructive/10' },
  /* zielony = element pozytywny (wybrany, zgodny, rozliczony) — Kajetan, 17.09.2026 */
  pozytywna: { obwodka: 'border-success/35',        ikona: 'text-success',          chip: 'bg-success/10' },
} as const;

export type Elewacja = keyof typeof ELEWACJA;
export type Intencja = keyof typeof INTENCJA;

/* ── SZKŁO — powierzchnia warstw nakładanych: okien, menu, kart podglądu ──
   Mieszka tutaj, a nie w `okno.tsx`, bo korzystają z niego co najmniej dwa
   niezależne komponenty (`Okno` i `ListaWyboru`), a to jest moduł od
   powierzchni. Trzymanie tej stałej przy oknie i drugiej kopii przy liście
   odtworzyłoby dokładnie ten rozjazd, który likwidujemy.

   Zapasowe krycie jest PEŁNE (`bg-card/95`). Bez tego przeglądarka bez
   obsługi `backdrop-filter` przepuszczałaby treść strony przez okno. */
/**
 * Powierzchnia warstw nakładanych: okien, menu, kart podglądu.
 *
 * ZAWIERA ZAŁAMANIE. Do 02.08.2026 było tu samo `nb-szklo` (rozmycie + nasycenie
 * + odblask krawędzi), a refrakcja siedziała wyłącznie na płytkach pokazowych
 * w bibliotece — czyli efekt istniał, ale nie było go tam, gdzie miał być.
 *
 * WARUNEK: `DefinicjeSzklaPlynnego` muszą być zamontowane w drzewie, inaczej
 * `url(#nb-refrakcja-*)` nie ma czego znaleźć i CAŁY `backdrop-filter` staje się
 * nieprawidłowy — powierzchnia traci wtedy także rozmycie. Dlatego definicje
 * montuje się RAZ, możliwie blisko korzenia aplikacji.
 */
export const SZKLO = 'nb-szklo nb-szklo-plynne';

/* ── PROMIENIE — jedna decyzja na poziom zagnieżdżenia ────────────────── */
const PROMIEN = { kafelek: 'rounded-2xl', wiersz: 'rounded-xl', chip: 'rounded-xl', pigulka: 'rounded-full' } as const;

/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Chrome kafelka jako gotowy łańcuch klas.
 *
 * Po co osobno: `Tile` renderuje `<div>`, a część kafelków MUSI być czymś innym —
 * skróty na Panelu Głównym to `<button>`, bo się w nie klika, a karty w innych
 * miejscach bywają `<a>`. Kopiowanie klas do każdego z nich odtworzyłoby dokładnie
 * ten rozjazd, który likwidujemy. Tu jest jedno źródło: zmiana obwódki albo cienia
 * w jednym miejscu przechodzi i na `<div>`, i na `<button>`.
 */
export function klasyKafelka(opcje?: {
  intencja?: Intencja;
  elewacja?: Elewacja;
  interaktywny?: boolean;
  zwarty?: boolean;
}): string {
  const { intencja = 'neutralna', elewacja = 'uniesiona', interaktywny, zwarty } = opcje ?? {};
  return cn(
    PROMIEN.kafelek, 'border', INTENCJA[intencja].obwodka,
    // kolumna: pozwala dzieciom uzyc flex-1 i wypelnic karte, gdy siatka
    // wyrownuje wysokosci w rzedzie (h-full + items-stretch)
    'flex flex-col',
    /*
      SZKŁO KAFELKA — jedno źródło, `SZKLO`.

      BYŁO TU: `bg-card supports-[backdrop-filter]:bg-card/80`,
      czyli STARY przepis (samo rozmycie, 80% wypełnienia), i stało OBOK `SZKLO`
      dokładanego w komponencie. Wyglądało to w kodzie tak, jakby kafelek dostał
      nowe szkło — ale nie dostał: `nb-szklo` to klasa narzędziowa
      Tailwinda, a te wygrywają z `.nb-szklo` z warstwy komponentów. Zmierzony
      efekt na kafelku to było `blur(24px)` i `rgba(8,8,8,0.8)` — bez nasycenia,
      bez załamania, bez adaptacji jasności.

      Widać to było dopiero na tle testowym: rząd metryk (który dostał `SZKLO`
      bez konkurencyjnej klasy) świecił pełnym szkłem, a WSZYSTKO owinięte
      w `Tile` wyglądało jak ciemna płyta. Michał pokazał to na zrzucie jako
      strefę 1 i strefę 2.

      Wniosek na przyszłość: dołożenie nowej klasy nie usuwa starej. Przy każdej
      przeróbce trzeba STARĄ SKASOWAĆ, bo inaczej cicho wygrywa.
    */
    SZKLO,
    /*
      WŁASNE ŚWIATŁO KARTY — USUNIĘTE (04.08.2026).

      Był tu gradient od `--foreground` (4.5% → 1.2%), dołożony 31.07, bo na
      motywie Ciemnym `--background` (2%) i `--card` (3%) zlewały się w jedną
      ścianę. Zniknął decyzją Michała „zamień wszystkie komponenty na materiał
      z biblioteki": tafla `liquid-glass-react` nie ma ŻADNEGO własnego
      wypełnienia — 4.5% bieli na czerni to dokładnie ta „szarość zamiast
      przezroczystości", którą wytykał. Rozdzielanie kart od tła przejęły rant
      (`.nb-szklo` w `index.css`) i załamanie krawędzi, które przy nowym
      przepisie filtra widać na brzegu każdej tafli.

      Ta sama zasada co w `index.css` — domieszka `--foreground` wyleciała
      z OBU miejsc naraz; zostawiona w jednym wracałaby kuchennymi drzwiami.
    */
    ELEWACJA[elewacja],
    'transition-[box-shadow,border-color,background-color] duration-200',
    interaktywny && 'cursor-pointer hover:border-primary/40 nb-kafelek-int',
    zwarty ? 'p-3.5' : 'p-5',
  );
}

export interface TileProps extends React.HTMLAttributes<HTMLDivElement> {
  intencja?: Intencja;
  elewacja?: Elewacja;
  /** rozjaśnia i podnosi kafelek pod kursorem */
  interaktywny?: boolean;
  /** ciasne odstępy — dla siatek i kafelków w kolumnie bocznej */
  zwarty?: boolean;
  children?: React.ReactNode;
}

/**
 * Kafelek mówi nagłówkowi, jakie ma odstępy.
 *
 * `TileHeader` rozciąga pasek tytułowy na PEŁNĄ szerokość karty, więc musi
 * zdjąć dokładnie tyle marginesu, ile kafelek dodał — a to zależy od `zwarty`.
 * Przekazanie tego przez kontekst, a nie przez powtórzony props, jest tu istotne:
 * gdyby nagłówek trzeba było oznaczać ręcznie, prędzej czy później ktoś ustawi
 * `zwarty` na kafelku i zapomni o nagłówku, a pasek wyjdzie poza kartę.
 */
/**
 * SKALA PISMA W KAFELKU (15.09.2026).
 *
 * `'zwykla'` to KONTRAKT PLATFORMY z `typografia.ts`: tytuł 16 px, treść 14 px,
 * etykieta 11 px. Cztery rozmiary, nic pomiędzy — bo rozmiary różniące się
 * o piksel nie budują hierarchii, tylko szum (decyzja Michała z 02.08.2026).
 *
 * `'drobna'` to WYJĄTEK, o który prosi jeden ekran: Dobór upycha w jednym
 * wierszu symbol, wymiar, podtyp i cztery odpowiedzi, więc tytuł sekcji na
 * 16 px zabiera tam miejsce potrzebne na dane. 13–15.09 zeszło to do wspólnego
 * `tile.tsx` na sztywno i pociągnęło za sobą 142 wywołania `TileHeader` poza
 * Vidomontem — Panel Zarządu, Panel Główny, Akademię, Predyktor. Dlatego skala
 * jest teraz WYBOREM poddrzewa, a nie nową wartością domyślną: kto chce ciaśniej,
 * prosi o to jawnie przez `SkalaKafelkow`; reszta platformy nie zauważa zmiany.
 */
export type SkalaKafelka = 'zwykla' | 'drobna';

const KontekstKafelka = React.createContext<{ zwarty: boolean; skala: SkalaKafelka }>({
  zwarty: false,
  skala: 'zwykla',
});

/** Rozmiary pisma prymitywów kafelka — jedno miejsce dla obu skal. */
const PISMO: Record<SkalaKafelka, { tytul: string; podtytul: string; odstepPodtytulu: string; etykieta: string }> = {
  /* Kontrakt `typografia.ts`: TYTUL 16, TRESC 14, ETYKIETA 11. */
  zwykla: { tytul: 'text-[16px]', podtytul: 'text-[14px]', odstepPodtytulu: 'mt-1', etykieta: 'text-[11px]' },
  /* Wyjątek Doboru — dokładnie to, co Kajetan ustawił 14.09, tyle że lokalnie. */
  drobna: { tytul: 'text-sm', podtytul: 'text-xs', odstepPodtytulu: 'mt-0.5', etykieta: 'text-xs' },
};

/**
 * Prosi poddrzewo o inną skalę pisma w kafelkach. Jedno opakowanie na ekran
 * wystarcza — `Tile` przepuszcza skalę dalej, więc zagnieżdżone kafelki,
 * nagłówki, wiersze i plakietki podchwytują ją same.
 */
export const SkalaKafelkow: React.FC<{ skala: SkalaKafelka; children: React.ReactNode }> = ({ skala, children }) => {
  const rodzic = React.useContext(KontekstKafelka);
  const kontekst = React.useMemo(() => ({ ...rodzic, skala }), [rodzic, skala]);
  return <KontekstKafelka.Provider value={kontekst}>{children}</KontekstKafelka.Provider>;
};

export const Tile = React.forwardRef<HTMLDivElement, TileProps>(function Tile(
  { intencja = 'neutralna', elewacja = 'uniesiona', interaktywny, zwarty, className, children, ...rest },
  ref,
) {
  /* Skala przychodzi z góry i musi przeżyć własnego dostawcę kafelka — inaczej
     `Tile` w poddrzewie `SkalaKafelkow` zerowałby prośbę rodzica. */
  const { skala } = React.useContext(KontekstKafelka);
  const kontekst = React.useMemo(() => ({ zwarty: !!zwarty, skala }), [zwarty, skala]);

  return (
    <div
      ref={ref}
      // Chrome z `klasyKafelka` — to samo źródło, z którego korzystają kafelki
      // będące <button> (np. skróty na Panelu Głównym). Szkło przepuszcza wzór
      // i tło użytkownika, ale trzyma czytelność tekstu: domyślnie nieprzejrzyste,
      // przejrzyste dopiero gdy przeglądarka wspiera rozmycie tła.
      className={cn(klasyKafelka({ intencja, elewacja, interaktywny, zwarty }), className)}
      {...rest}
    >
      <KontekstKafelka.Provider value={kontekst}>{children}</KontekstKafelka.Provider>
    </div>
  );
});

/* ── NAGŁÓWEK: chip z ikoną + tytuł + licznik/akcja po prawej ─────────── */
export interface TileHeaderProps {
  ikona?: LucideIcon;
  tytul: React.ReactNode;
  podtytul?: React.ReactNode;
  intencja?: Intencja;
  /** licznik, pigułka statusu albo przycisk — ląduje po prawej */
  poPrawej?: React.ReactNode;
  /**
   * Element PRZED tytułem, gdy sama ikona nie wystarcza — np. awatar
   * użytkownika w nagłówku powitalnym. Świadomie osobno od `ikona`:
   * ta jest z biblioteki i ma 14 px, a tu wchodzi cokolwiek własnego.
   */
  przedTytulem?: React.ReactNode;
  className?: string;
  /**
   * NAGŁÓWEK ZWIJAJĄCY (14.09.2026, Dobór): gdy kafelek jest sekcją, którą
   * można zwinąć, to nadal TEN SAM nagłówek — tytuł tej samej wielkości,
   * czcionki i charakteru co w każdym innym kafelku (Kajetan: „tytuły wszystkie
   * mają być jednej wielkości, jednej czcionki, jednego charakteru”). Strzałka
   * ląduje po prawej, cały pasek jest przyciskiem. Wcześniej takie sekcje
   * dostawały `BlokRozwijany` z własnym, wersalikowym tytułem — i to on
   * wyłamywał się z rejestru.
   */
  otwarta?: boolean;
  onPrzelacz?: () => void;
}

/**
 * NAGŁÓWEK KAFELKA — PASEK TYTUŁOWY na pełną szerokość karty.
 *
 * ── DLACZEGO PASEK, A NIE TEKST Z KRESKĄ (przebudowa 01.08.2026) ─────────
 * Poprzednia wersja to był tytuł, podtytuł i włosowa linia pod spodem.
 * Zmierzone na motywie Ciemnym: linia miała `hsl(var(--border)/0.7)`, czyli
 * po zmieszaniu z kartą 8,6% jasności przy karcie 3% — RÓŻNICA 5,6 PUNKTU.
 * Tego się fizycznie nie widzi. Do tego akcent w linii gasł po 12% szerokości
 * i czytał się jak przypadkowy artefakt, a nie jak element.
 * Skutek: nagłówek nie wyglądał na nagłówek, tylko na drobny tekst nad treścią.
 *
 * Teraz nagłówek dostaje WŁASNĄ PŁASZCZYZNĘ — jaśniejszy pasek na pełną
 * szerokość karty, domknięty pełną krawędzią. Dokładnie ten sam język, co
 * listwa etykiety w oknie dialogowym: neutralne tło liczone od `--foreground`,
 * akcent wyłącznie w tekście i w lewym odcinku krawędzi. Jeden gest w oknie
 * i w karcie zamiast dwóch podobnych.
 *
 * Pasek wychodzi POZA wyściółkę kafelka (`-mx-*`, `-mt-*`), więc dotyka jego
 * krawędzi. Wielkość zdejmowanego marginesu bierze się z kontekstu kafelka —
 * patrz `KontekstKafelka`.
 */
export const TileHeader: React.FC<TileHeaderProps> = ({
  ikona: Ikona, tytul, podtytul, intencja = 'akcent', poPrawej, przedTytulem, className, otwarta, onPrzelacz,
}) => {
  const i = INTENCJA[intencja];
  const { zwarty, skala } = React.useContext(KontekstKafelka);
  const akcent = intencja === 'krytyczna' ? 'var(--destructive)'
    : intencja === 'akcent' ? 'var(--primary)' : 'var(--muted-foreground)';

  return (
    <div
      className={cn(
        'relative rounded-t-2xl border-b border-border',
        // Zdejmujemy dokładnie tyle, ile kafelek dodał, i dokładamy z powrotem
        // w poziomie — dzięki temu tekst stoi w tej samej osi co treść niżej.
        zwarty ? '-mx-3.5 -mt-3.5 mb-3.5 px-3.5 py-2.5' : '-mx-5 -mt-5 mb-5 px-5 py-3.5',
        onPrzelacz && 'cursor-pointer select-none',
        onPrzelacz && !otwarta && '!mb-0 !border-b-0 rounded-b-2xl',
        className,
      )}
      onClick={onPrzelacz ? (e => { if (!(e.target as HTMLElement).closest('button,a,input')) onPrzelacz(); }) : undefined}
      /*
        PASEK BEZ WŁASNEGO TŁA (14.08.2026). Michał, zaznaczając kafelki Panelu
        Głównego: „czemu te kafelki nie wyglądają globalnie tak dobrze jak ten
        u góry nad wyszukiwarką, z liquid glass bez jakiegoś jasnego czegoś
        w tle".

        Zmierzone: materiał kafelków był IDENTYCZNY z paskiem górnym (to samo
        szkło, `saturate(1.3) blur(8.8px)`, tło w pełni przezroczyste) — jedyną
        różnicą było to tło nagłówka, `hsl(--foreground / 0.026)`, czyli biel
        położona NA szkle. Szkło ma pokazywać to, co pod nim; jasna płachta na
        wierzchu zabiera mu głębię i właśnie ona czytała się jako „jasne coś".
        Górny pasek wygląda lepiej, bo jako jedyny nie ma `TileHeader` (świadomie
        — patrz komentarz „PASEK, NIE KARTA Z NAGŁÓWKIEM" w ByteStatusBar).

        Historia tej wartości to zresztą sam dowód: 4,5% → 2,6% → 0. Za każdym
        razem była o krok za mocna. Nagłówek oddziela teraz kreska akcentu niżej
        (i tak tam stała) plus rejestr typografii — bez dokładania płaszczyzny.
      */
    >
      {/* Krawędź pod paskiem: pełny akcent po lewej, dalej zwykła obwódka.
          Kierunek zostaje ten sam co w oknie, ale teraz ma na czym stać. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px"
        style={{
          background: `linear-gradient(90deg,
            hsl(${akcent}) 0%,
            color-mix(in srgb, hsl(${akcent}) 45%, transparent) 14%,
            hsl(var(--border)) 40%,
            hsl(var(--border)) 100%)`,
        }}
      />

      {/*
        NA WĄSKIM EKRANIE PLAKIETKA SCHODZI POD TYTUŁ.

        Zmierzone na 375 px (02.08.2026): plakietka jest `shrink-0`, więc przy
        etykiecie w rodzaju „364 UŻYCIA / 121 WYGLĄDÓW" zabierała ~200 z 375 px
        i na podtytuł zostawało ~150. Efekt: „wybór modelu i każde inne rozwijane
        menu to jeden komponent" łamało się na PIĘĆ urwanych wierszy, podczas gdy
        sąsiedni kafelek bez plakietki mieścił to w dwóch.

        Plakietka niesie liczbę pomocniczą, tytuł niesie treść — więc to
        plakietka ustępuje, a nie tekst. Od `sm` układ wraca do jednego rzędu,
        bo tam szerokości starcza dla obu.
      */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {przedTytulem && <span className="shrink-0">{przedTytulem}</span>}
            {/* Ikona jest OPCJONALNA i domyślnie się jej nie podaje.
                Przy nagłówku sekcji ikona z biblioteki (lupa, licznik, pudełka)
                nie niesie informacji — powtarza to, co mówi tytuł, i wygląda
                jak clipart. Tytuł plus akcent na linii wystarczają. */}
            {Ikona && <Ikona className={cn('h-3.5 w-3.5 shrink-0', i.ikona)} />}
            {/*
              TYTUŁ MA INNY REJESTR NIŻ WSZYSTKO INNE W KARCIE — i to jest sedno
              poprawki z 01.08.2026.

              Zmierzone: tytuł karty miał `12px/600/wersaliki/1.44`, etykieta
              pola `11px/600/wersaliki/1.10`, a grupa zakładek `10px/600/
              wersaliki/1.30`. TRZY poziomy tym samym głosem, różniące się
              o piksel. Podtytuł karty `12px/400` był z kolei co do piksela tym
              samym, co podpowiedź w treści. Hierarchii nie było w typografii,
              więc musiał ją unieść sam pasek tytułowy — i dlatego wyglądał na
              za mocno odcięty. Naprawa poszła w typografię, nie w pasek.

              Teraz tytuł to NAZWA, którą się czyta: 16 px (stopień TYTUL
              z `typografia.ts`, skala `zwykla`), bez wersalików,
              ciasne rozstrzelenie. Wersaliki zostają wyłącznie dla drobnych
              etykiet (pola, grupy) — czyli dla innej klasy rzeczy.
            */}
            <span className={cn(
              'min-w-0 truncate font-heading font-semibold leading-tight tracking-tight text-foreground',
              PISMO[skala].tytul,
            )}>
              {tytul}
            </span>
          </div>
          {podtytul && (
            <span className={cn('block leading-snug text-muted-foreground', PISMO[skala].odstepPodtytulu, PISMO[skala].podtytul)}>
              {podtytul}
            </span>
          )}
        </div>

        {(poPrawej || onPrzelacz) && (
          <span className="ml-auto flex shrink-0 items-center gap-1">
            {poPrawej}
            {onPrzelacz && (
              <button type="button" aria-expanded={!!otwarta} aria-label={otwarta ? 'Zwiń' : 'Rozwiń'} onClick={onPrzelacz}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <StrzalkaRozwijania otwarty={!!otwarta} />
              </button>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

/* ── WIERSZ WEWNĄTRZ KAFELKA — jeden wygląd listy ─────────────────────── */
export interface TileRowProps extends React.HTMLAttributes<HTMLDivElement> {
  ikona?: LucideIcon;
  intencja?: Intencja;
  poPrawej?: React.ReactNode;
  /**
   * WIERSZ Z OPISEM, NIE JEDNOLINIJKOWA ETYKIETA — dodane 17.08.2026.
   *
   * Domyślny wiersz przycina treść do jednej linii (`truncate`) i centruje ją
   * w pionie. To jest poprawne dla list typu „nazwa · wartość", ale wyklucza
   * najczęstszą listę w platformie: pozycję z tytułem, plakietkami i zdaniem
   * opisu pod spodem — model AI, plan, integracja, członek zespołu.
   *
   * ZMIERZONE: 18 plików rysuje własne `divide-y divide-border`, bo w ten
   * kontrakt się nie mieściły. Każdy z nich ma własne odstępy i własną grubość
   * linii — czyli dokładnie ten rozjazd, przed którym `TileRow` miał chronić.
   * Luka w kontrakcie nie zatrzymuje takiej listy, tylko wypycha ją poza
   * bibliotekę, gdzie nikt jej już nie przemaluje jedną zmianą.
   *
   * Wariant zdejmuje przycinanie i wyrównuje do GÓRY, żeby przełącznik albo
   * kwota po prawej stały w jednej linii z tytułem, a nie w połowie opisu.
   */
  wielowierszowy?: boolean;
  children?: React.ReactNode;
}

export const TileRow: React.FC<TileRowProps> = ({
  ikona: Ikona, intencja = 'neutralna', poPrawej, wielowierszowy, className, children, ...rest
}) => {
  const i = INTENCJA[intencja];
  const { skala } = React.useContext(KontekstKafelka);
  return (
    <div
      className={cn(
        PROMIEN.wiersz, 'flex gap-2 border p-2.5',
        wielowierszowy ? 'items-start' : 'items-center',
        intencja === 'neutralna' ? 'nb-wiersz' : cn(i.obwodka, i.chip),
        className,
      )}
      {...rest}
    >
      {Ikona && (
        <Ikona className={cn('h-3.5 w-3.5 shrink-0', wielowierszowy && 'mt-0.5', i.ikona)} />
      )}
      {/* DIV, NIE SPAN, w wariancie wielowierszowym: taka treść z definicji
          niesie bloki — akapit opisu, siatkę ocen, listę plakietek. `span`
          jest treścią liniową, więc blok w środku jest niepoprawny składniowo
          i tylko dlatego uchodzi, że React buduje DOM z pominięciem parsera. */}
      {wielowierszowy ? (
        <div className="min-w-0 flex-1 text-[14px] text-card-foreground">{children}</div>
      ) : (
        <span className="min-w-0 flex-1 truncate text-[14px] text-card-foreground">{children}</span>
      )}
      {poPrawej && (
        <span className={cn(
          'ml-auto shrink-0 text-muted-foreground', PISMO[skala].etykieta,
          /* Bez tego sterowanie w wierszu wielowierszowym rozciąga się na całą
             wysokość opisu i przestaje sąsiadować z tytułem, do którego należy. */
          wielowierszowy && 'self-start',
        )}>
          {poPrawej}
        </span>
      )}
    </div>
  );
};

/* ── PIGUŁKA — licznik, status, znacznik ──────────────────────────────── */
export const TilePill: React.FC<{ intencja?: Intencja; children: React.ReactNode; className?: string }> = ({
  intencja = 'akcent', children, className,
}) => {
  const i = INTENCJA[intencja];
  const { skala } = React.useContext(KontekstKafelka);
  return (
    <span className={cn(
      PROMIEN.pigulka, 'inline-flex items-center border px-2 py-0.5 font-semibold', PISMO[skala].etykieta,
      i.obwodka, i.chip, i.ikona, className,
    )}>
      {children}
    </span>
  );
};

/* ── AKCJA — TO jest sedno „kafelkowości": „Usuń" wygląda tak samo wszędzie ──
   Jeden język z domyślnym przyciskiem platformy (`nextbyte` w button.tsx):
   obwódka + ~2–6% wypełnienia, ZERO wypełnienia kolorem. Akcent niesie tekst
   i obwódka, nie tło.
   Hierarchia bez plam koloru: „główna" ma obwódkę w akcencie, „wtórna"
   neutralną, „cicha" żadnej, „usuń" w kolorze ostrzeżenia. Wypełnienia liczone
   od `--foreground` / `--primary` / `--destructive`, więc odwracają się razem
   z motywem i są widoczne zarówno na ciemnym, jak i jasnym tle.               */
/**
 * Akcje kafelka czerpią z tego samego źródła co `Button` — `style-przyciskow.ts`.
 * Wcześniej `wtorna`, `cicha` i `usun` były tu przepisane słowo w słowo obok
 * wariantów przycisku, więc zmiana wyglądu wymagała pamiętania o dwóch miejscach.
 *
 * `glowna` to teraz STYL 1 (szkło). Zanim styl 1 powstał, `glowna` znaczyło
 * „najmocniejsze, co mamy", czyli obwódkę w kolorze akcentu — i był to trzeci
 * rejestr obok dwóch docelowych. Zniknął.
 */
const AKCJA = {
  glowna: RDZEN_STYL_1,
  wtorna: RDZEN_STYL_2,
  cicha:  RDZEN_CICHY,
  usun:   RDZEN_USUN,
} as const;

export type RodzajAkcji = keyof typeof AKCJA;

export interface TileActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rodzaj?: RodzajAkcji;
  ikona?: LucideIcon;
  /** tylko ikona, bez etykiety — wtedy podaj `aria-label` */
  samaIkona?: boolean;
}

export const TileAction = React.forwardRef<HTMLButtonElement, TileActionProps>(function TileAction(
  { rodzaj = 'wtorna', ikona: Ikona, samaIkona, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        PROMIEN.wiersz, 'inline-flex h-9 items-center justify-center gap-1.5 border text-[14px] font-semibold',
        samaIkona ? 'w-9' : 'px-3',
        AKCJA[rodzaj],
        'transition-colors duration-200',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {Ikona && <Ikona className="h-3.5 w-3.5 shrink-0" />}
      {!samaIkona && children}
    </button>
  );
});

/** Pasek akcji na spodzie kafelka — stały odstęp, żeby nie było 6 wariantów. */
export const TileFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('mt-4 flex flex-wrap items-center gap-2', className)}>{children}</div>
);

export const TOKENY_KAFELKA = { ELEWACJA, INTENCJA, PROMIEN, AKCJA } as const;
