/**
 * ════════════════════════════════════════════════════════════════════════
 *  PŁYNNY KURSOR — karetka, która dojeżdża, zamiast przeskakiwać
 * ════════════════════════════════════════════════════════════════════════
 *
 * Natywna karetka skacze po znaku. Tutaj prawdziwa jest ukryta
 * (`caret-color: transparent`), a rysujemy własną i przesuwamy sprężyną —
 * pisanie dostaje ciągłość ruchu zamiast klatkowania.
 *
 * JAK MIERZYMY POZYCJĘ
 * Nie da się zapytać pola „gdzie jest karetka w pikselach". Bierzemy więc
 * tekst PRZED karetką, wypisujemy go w niewidzialny `<span>` z identyczną
 * typografią i czytamy jego szerokość. Stąd `syncMiarki` — każda różnica
 * w foncie, odstępach czy wariancie przesunęłaby kursor obok liter.
 *
 * CZEGO TU CELOWO NIE MA
 * Wzorzec pochodzi z gotowca skiper-ui, ale wzięliśmy z niego sam mechanizm.
 * Odpadły trzy rzeczy, które w naszej bibliotece byłyby usterką:
 *   • `dialkit` — panel deweloperski z suwakami do strojenia animacji na żywo;
 *     w produkcji to zależność i panel sterowania nad polem tekstowym,
 *   • `bg-muted2` / `outline-muted3` — tokeny, których nie mamy, więc pole
 *     wyszłoby bez tła (ta sama rodzina co martwe krycie z #107),
 *   • `navigator.userAgent` liczone przy imporcie modułu — wystarczy, że plik
 *     trafi tam, gdzie `navigator` nie istnieje, i wywala się cały build.
 *     Tutaj znak hasła ustala się dopiero przy pierwszym pomiarze.
 *
 * DOSTĘPNOŚĆ
 * Przy `prefers-reduced-motion` sprężyna zamienia się w skok — kursor nadal
 * jest we właściwym miejscu, tylko bez animacji.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

/** Szerokość kropki hasła różni się między silnikami — mierzymy prawdziwy znak. */
const znakHasla = () =>
  typeof navigator !== 'undefined' && /firefox|fxios/i.test(navigator.userAgent) ? '●' : '•';

/* ── STROJENIE Z ZARZĄDU ──────────────────────────────────────────────────
   Sprężyna czyta wartości z tokenów `--nb-kursor-*`, tymi samymi torami co
   reszta biblioteki: Zarząd → Biblioteka komponentów → publikacja → tokeny
   na `documentElement`. Wartości zapasowe w `var(…, X)` są równe temu, co
   było wpisane na sztywno, więc pusta tabela albo brak sieci to poprawny
   stan, nie awaria.                                                        */
const DOMYSLNE = { sprezystosc: 500, tlumienie: 30, masa: 0.5, szerokosc: 2 };

const liczbaZTokenu = (el: HTMLElement | null, nazwa: string, zapasowa: number): number => {
  if (typeof window === 'undefined') return zapasowa;
  const surowa = getComputedStyle(el ?? document.documentElement).getPropertyValue(nazwa).trim();
  const liczba = parseFloat(surowa);
  return Number.isFinite(liczba) ? liczba : zapasowa;
};

/**
 * Parametry sprężyny i grubość kreski.
 *
 * Czyta z ELEMENTU, nie z `documentElement`, choć tam trafiają tokeny globalne.
 * Powód: zmienne CSS się dziedziczą, więc panel w Zarządzie może nałożyć własne
 * wartości na swój kontener podglądu i stroić kursor TYLKO tam. Gdyby odczyt
 * szedł zawsze z korzenia, kręcenie suwakiem przestawiałoby karetkę w całej
 * aplikacji administratora — łącznie z polami, w których właśnie coś pisze.
 *
 * Przelicza się po publikacji (`komponentyOpublikowane`), żeby skutek było
 * widać bez przeładowania — tak samo jak przy cieniu kafelka.
 */
/*
  KOLOR KRESKI JAKO TOKEN (03.09.2026).

  Michał o NextElite Club: „wszystko co NextElite Club to nie ma mieć koloru
  niebieskiego, tylko czarny i biały" — a karetka brała `bg-primary`, czyli
  błękit platformy, i była jedyną niebieską rzeczą na czarno-białej bramce.

  Pusty ciąg znaczy „nie nadpisuj": kreska zostaje wtedy na klasie
  `bg-primary` dokładnie jak dotąd, więc nic w platformie się nie zmienia.
  Miejsce, które chce inny kolor, ustawia `--nb-kursor-kolor` na swoim
  kontenerze i karetka bierze go razem z resztą tokenów.
*/
function tekstZTokenu(el: HTMLElement | null, nazwa: string): string {
  const zrodlo = el ?? (typeof document !== 'undefined' ? document.documentElement : null);
  if (!zrodlo) return '';
  return window.getComputedStyle(zrodlo).getPropertyValue(nazwa).trim();
}

export function useTokenyKursora(elRef?: React.RefObject<HTMLElement>) {
  const odczyt = useCallback(() => {
    const el = elRef?.current ?? null;
    return {
      sprezystosc: liczbaZTokenu(el, '--nb-kursor-sprezystosc', DOMYSLNE.sprezystosc),
      tlumienie: liczbaZTokenu(el, '--nb-kursor-tlumienie', DOMYSLNE.tlumienie),
      masa: liczbaZTokenu(el, '--nb-kursor-masa', DOMYSLNE.masa),
      szerokosc: liczbaZTokenu(el, '--nb-kursor-szerokosc', DOMYSLNE.szerokosc),
      kolor: tekstZTokenu(el, '--nb-kursor-kolor'),
    };
  }, [elRef]);

  const [tokeny, setTokeny] = useState(odczyt);

  useEffect(() => {
    const odswiez = () => setTokeny(odczyt());
    odswiez();
    window.addEventListener('komponentyOpublikowane', odswiez);
    /* Podgląd w Bibliotece kręci suwakami bez publikacji — własne zdarzenie,
       żeby kreska w polu obok reagowała od razu, jeszcze przed zapisem. */
    window.addEventListener('kursorPodglad', odswiez);
    return () => {
      window.removeEventListener('komponentyOpublikowane', odswiez);
      window.removeEventListener('kursorPodglad', odswiez);
    };
  }, [odczyt]);

  return tokeny;
}

export interface PlynnyKursorProps {
  /** Pole, którego karetkę rysujemy — jedno- albo wielolinijkowe. */
  polaRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  /** Wartość — zmiana wymusza przeliczenie pozycji. */
  wartosc?: string | number | readonly string[];
  /** Wyłącza mechanizm (np. pole tylko do odczytu). */
  wylaczony?: boolean;
  className?: string;
}

/**
 * ════════════════════════════════════════════════════════════════════════
 *  BRAMKA DOTYKU — na telefonie karetka jest SYSTEMOWA
 * ════════════════════════════════════════════════════════════════════════
 *
 * Zgłoszenie Michała: „nie widać zaznaczenia na telefonie". Przyczyna
 * zmierzona 24.08.2026: `caret-color: transparent` szło także na dotyk,
 * a rysowana karetka chowa się przy zaznaczeniu (patrz `przelicz`) —
 * użytkownik telefonu nie widział więc ANI JEDNEJ, ani drugiej.
 * W WebKicie z `caret-color` bierze kolor także UCHWYT zaznaczenia,
 * czyli te dwie kropelki, którymi rozciąga się zakres palcem.
 *
 * Efekt jest ozdobą płynnego pisania na klawiaturze. Palec nie pisze
 * płynnie — przeciąga, zaznacza i upuszcza, a do tego potrzebuje
 * NATYWNYCH uchwytów, których nie da się narysować.
 *
 * Hak jest w bibliotece, nie w polach, bo `plynny` liczy się w SZEŚCIU
 * miejscach (`input`, `textarea`, 3 pola z `pola.tsx`, plus sama nakładka).
 * Rozjazd między nimi to dokładnie ta usterka: pole chowa karetkę, a
 * nakładka jej nie rysuje.
 *
 * Nasłuch, nie jednorazowy odczyt — iPad z doczepioną klawiaturą przechodzi
 * `coarse` → `fine` bez przeładowania strony.
 */
export function useDotyk(): boolean {
  const [dotyk, ustawDotyk] = useState(
    () => typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(pointer: coarse)').matches
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const zapytanie = window.matchMedia('(pointer: coarse)');
    const naZmianie = (e: MediaQueryListEvent) => ustawDotyk(e.matches);
    zapytanie.addEventListener('change', naZmianie);
    return () => zapytanie.removeEventListener('change', naZmianie);
  }, []);

  return dotyk;
}

/* Właściwości, które muszą się zgadzać co do joty, żeby LUSTRO łamało wiersze
   dokładnie tam, gdzie łamie je pole. Każda pominięta przesuwa karetkę
   o tyle, o ile lustro rozjedzie się z oryginałem. */
export const WLASCIWOSCI_LUSTRA = [
  'boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  /* `border*Style` MUSI iść razem z `border*Width` — bez niego styl lustra
     to `none`, a wtedy przeglądarka liczy szerokość ramki jako 0 i lustro
     jest o 2 px szersze niż pole. Zmierzone 24.08.2026 na 437 długościach
     tekstu: 3 razy lustro złamało wiersz w innym miejscu niż pole, czyli
     karetka wypadła o CAŁY WIERSZ (21 px) obok. Trafienia siedzą dokładnie
     na granicy zawijania — łapie je ten, kto pisze na końcu wiersza. */
  'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontFamily',
  /* `textAlign` dołożone 03.09.2026: bez niego lustro liczy tekst od lewej,
     a pole z `text-center` rysuje go na środku — w polu 80 px karetka stała
     27 px obok znaku, w polu 200 px nawet 85 px (7 pól w platformie). */
  'textAlign',
  'lineHeight', 'letterSpacing', 'wordSpacing', 'textIndent', 'textTransform',
  'whiteSpace', 'wordBreak', 'overflowWrap', 'tabSize',
] as const;


/*
  ══════════════════════════════════════════════════════════════════════════
   JEDEN POMIAR DLA OBU KARETEK (03.09.2026)
  ══════════════════════════════════════════════════════════════════════════

  Michał: „ogarnij kursor globalnie na całej platformie… abyś teraz to zrobił
  poprawnie".

  Płynna karetka jeździ dziś dwiema drogami: pola z biblioteki montują ją same
  (`Input`, `Textarea`, trzy pola z `pola.tsx`, wyszukiwarka), a 178 surowych
  `<input>`/`<textarea>` w 163 plikach nie ma jej wcale — użytkownik widzi raz
  kreskę platformy, raz karetkę systemu. Domykamy to karetką GLOBALNĄ, która
  obsługuje każde pole bez przepisywania 163 plików.

  Żeby obie drogi nie rozjechały się przy pierwszej poprawce, pomiar siedzi
  TUTAJ, w jednej funkcji. Komponent lokalny podaje własną miarkę i dostaje
  pozycję względem swojego kontenera; globalny dokłada do niej prostokąt pola
  i rysuje kreskę na `fixed`.

  Zwraca pozycję ŚRODKA karetki w układzie pola (border-box, od lewego górnego
  rogu) oraz to, czy w ogóle jest co rysować.
*/
export function zmierzKaretke(
  pole: HTMLInputElement | HTMLTextAreaElement,
  miarka: HTMLElement,
): { x: number; y: number; widoczna: boolean; wysWiersza: number } | null {
  /*
    POLA BEZ POZYCJI KARETKI (07.09.2026).

    Michał na logowaniu: „kursor nie idzie za wpisywaniem". Zmierzone:
    dla `input type="email"` (także `number`, `date`…) Chrome zwraca
    `selectionStart = null` — to nie „pozycja 0", to „nie powiem". Dotąd
    `?? 0` robiło z tego zero i kreska stała przed pierwszą literą przy
    pełnym polu. Skoro przeglądarka nie zdradza pozycji, przyjmujemy koniec
    tekstu: tam trafia każdy wpisywany znak i tam stoi karetka po
    autouzupełnieniu. Klik w środek takiego pola pokaże kreskę na końcu —
    świadomy koszt, bo alternatywą jest pole z kreską zawsze na początku.
  */
  const dlugosc = String(pole.value).length;
  const od = pole.selectionStart ?? dlugosc;
  const doo = pole.selectionEnd ?? dlugosc;

  /* Przy zaznaczeniu karetki nie ma — jest zakres. Rysowanie jej wtedy
     dawałoby dwa wskaźniki naraz. */
  if (od !== doo) return null;

  const wielolinijkowe = pole.tagName === 'TEXTAREA';
  const tekstPrzed = !wielolinijkowe && (pole as HTMLInputElement).type === 'password'
    ? znakHasla().repeat(od)
    : String(pole.value).slice(0, od);
  const styl = window.getComputedStyle(pole);

  if (wielolinijkowe) {
    /*
      POLE WIELOLINIJKOWE — LUSTRO ZAMIAST MIARKI.

      W jednym wierszu wystarczy zmierzyć szerokość tekstu. Tu tekst się
      ZAWIJA, więc trzeba wiedzieć, w którym wierszu i jak głęboko wypadła
      karetka. Robi to kopia pola: ten sam font, ta sama szerokość, to samo
      łamanie wyrazów.

      `​` (spacja zerowej szerokości) na końcu jest konieczna: sam pusty
      `<span>` po znaku nowej linii przeglądarka potrafi zignorować i karetka
      zostawałaby wiersz wyżej.
    */
    miarka.style.position = 'absolute';
    miarka.style.top = '0';
    miarka.style.left = '0';
    miarka.style.visibility = 'hidden';
    miarka.style.whiteSpace = 'pre-wrap';
    miarka.style.overflowWrap = 'break-word';
    WLASCIWOSCI_LUSTRA.forEach((w) => {
      (miarka.style as unknown as Record<string, string>)[w] =
        (styl as unknown as Record<string, string>)[w];
    });
    /*
      SZEROKOŚĆ BEZ PASKA PRZEWIJANIA (03.09.2026).

      `getComputedStyle().width` nie wie o pasku, który zjada treść: gdy pole
      zacznie się przewijać, `clientWidth` spada (u nas o 4 px, bo pasek ma
      `index.css` 4 px; na Windowsie byłoby ~15). Lustro było wtedy szersze
      od pola i łamało wiersz w INNYM miejscu — karetka wskakiwała o cały
      wiersz niżej niż litera.
    */
    miarka.style.boxSizing = 'content-box';
    miarka.style.width = `${pole.clientWidth - (parseFloat(styl.paddingLeft) || 0) - (parseFloat(styl.paddingRight) || 0)}px`;

    miarka.textContent = tekstPrzed;
    const znacznik = document.createElement('span');
    znacznik.textContent = '\u200b';
    miarka.appendChild(znacznik);

    const wysWiersza = parseFloat(styl.lineHeight) || parseFloat(styl.fontSize) * 1.2;
    const lewo = znacznik.offsetLeft - pole.scrollLeft;
    const gora = znacznik.offsetTop - pole.scrollTop;
    miarka.textContent = ''; // sprzątamy znacznik przed następnym pomiarem

    /* Karetka wyjechała poza widoczny obszar (długi tekst, przewinięte pole)
       — chowamy ją, zamiast rysować kreskę na krawędzi. */
    return {
      x: lewo,
      y: gora + wysWiersza / 2, // środek wiersza, bo kreska jest centrowana
      widoczna: gora >= -wysWiersza * 0.5 && gora <= pole.clientHeight,
      wysWiersza,
    };
  }

  /* Jedna linia — miarka musi mieć DOKŁADNIE tę samą typografię co pole. */
  miarka.style.font = `${styl.fontStyle} ${styl.fontWeight} ${styl.fontSize} ${styl.fontFamily}`;
  miarka.style.letterSpacing = styl.letterSpacing;
  miarka.style.fontFeatureSettings = styl.fontFeatureSettings;
  miarka.style.fontVariationSettings = styl.fontVariationSettings;
  miarka.textContent = tekstPrzed;
  const szerokosc = miarka.offsetWidth;

  /*
    WCIĘCIE POLA TRZEBA DOLICZYĆ.

    Karetka jest pozycjonowana względem KONTENERA, a tekst zaczyna się dopiero
    za wcięciem pola. W komponentach biblioteki wcięcie siedzi na oprawie
    (pole ma 0), ale `Input` z shadcn trzyma `px-3` na samym polu i bez tej
    poprawki karetka stałaby 12 px w lewo od pierwszej litery.
  */
  const wciecie = parseFloat(styl.paddingLeft) || 0;
  const granica = parseFloat(styl.borderLeftWidth) || 0;
  const granica_gora = parseFloat(styl.borderTopWidth) || 0;

  /* Pole przewija się poziomo, gdy tekst nie mieści się w oprawie —
     pozycja karetki to szerokość tekstu MINUS to, co wyjechało w lewo. */
  const pozycja = szerokosc - pole.scrollLeft;

  /* WYRÓWNANIE TEKSTU (03.09.2026). Do dziś pozycja liczyła się od lewej
     krawędzi zawsze, a przy `text-center` litery zaczynają się w środku
     pustego obszaru — kreska zostawała przy krawędzi, znak był daleko. */
  const wciecie_prawe = parseFloat(styl.paddingRight) || 0;
  const obszar = pole.clientWidth - wciecie - wciecie_prawe;
  let start = 0;
  if (styl.textAlign === 'center') start = Math.max(0, (obszar - szerokosc) / 2);
  else if (styl.textAlign === 'right' || styl.textAlign === 'end') start = Math.max(0, obszar - szerokosc);

  return {
    x: wciecie + granica + start + Math.max(0, Math.min(pozycja, pole.clientWidth)),
    /* `clientHeight` NIE zawiera ramek, a pozycja idzie do transformu liczonego
       od border-boxa — przy `border: 1px` środek wypadał o 1 px za wysoko. */
    y: granica_gora + pole.clientHeight / 2,
    widoczna: pozycja >= -1 && pozycja <= pole.clientWidth + 1,
    wysWiersza: parseFloat(styl.lineHeight) || parseFloat(styl.fontSize) * 1.2,
  };
}

/*
  ══════════════════════════════════════════════════════════════════════════
   WARSTWA NAD POLEM MUSI MIERZYĆ TEKST TAK SAMO JAK POLE (03.09.2026)
  ══════════════════════════════════════════════════════════════════════════

  Michał: „nie wylicza dobrze wielkości tych kafelków referencji w prompcie".

  Nakładka z pigułkami „@imageN" w Studiu Zdjęć rysuje ten sam tekst co pole
  pod spodem i przykleja pigułkę do tokenu. Obie warstwy miały te same klasy
  (`text-[15px]`), więc wyglądało to na zgodne. Nie było:

      input[type="text"], … , textarea { font-size: 16px !important; }
                                                    ↑ src/index.css:527

  Reguła chroni iPhone'a przed przybliżeniem strony przy wejściu w pole i bije
  KAŻDĄ klasę rozmiaru — pole rysowało 16 px, nakładka 15 px. Zmierzone na
  żywym CSS platformy, na zdaniu Michała ze zrzutu: pigułka stała 33,7 px
  na lewo od swojego tokenu, a karetka wyprzedzała widoczny tekst o 42,2 px.

  Dlatego warstwa nie może ZAKŁADAĆ swojej metryki z klas — musi ją PRZEPISAĆ
  z pola tak, jak robi to lustro płynnej karetki. Ta sama lista właściwości,
  bo to ten sam problem: dwa elementy mają złamać tekst identycznie.

  Szerokość idzie z `clientWidth`, nie z `width`: gdy tekst urośnie, pole
  dostaje pasek przewijania i jego wnętrze się zwęża, a nakładka bez paska
  łamałaby wiersz gdzie indziej.
*/
export function useLustroTypografii(
  poleRef: React.RefObject<HTMLElement | null>,
  warstwaRef: React.RefObject<HTMLElement | null>,
  zaleznosc?: unknown,
) {
  React.useLayoutEffect(() => {
    const pole = poleRef.current;
    const warstwa = warstwaRef.current;
    if (!pole || !warstwa) return;

    const przepisz = () => {
      const cs = getComputedStyle(pole);
      WLASCIWOSCI_LUSTRA.forEach((w) => {
        if (w === 'width') return;
        (warstwa.style as unknown as Record<string, string>)[w] = cs[w];
      });
      /* Ramka pola przenosi się jako SZEROKOŚĆ (żeby tekst zaczynał się w tym
         samym miejscu), ale nie może być widoczna — bez tego domyślny
         `currentColor` narysowałby drugą ramkę w kolorze tekstu. */
      warstwa.style.borderColor = 'transparent';
      warstwa.style.boxSizing = 'border-box';
      warstwa.style.width = `${pole.clientWidth}px`;
    };

    przepisz();
    /* Zmiana kroju w Ustawieniach, obrót telefonu, pojawienie się paska
       przewijania — wszystko to zmienia rozmiar pola, więc przeliczamy. */
    const obs = new ResizeObserver(przepisz);
    obs.observe(pole);
    return () => obs.disconnect();
  }, [poleRef, warstwaRef, zaleznosc]);
}

/**
 * Nakładka rysująca karetkę. Musi siedzieć w rodzicu z `position: relative`,
 * razem z polem — pozycję liczy względem jego lewej krawędzi.
 */
export const PlynnyKursor: React.FC<PlynnyKursorProps> = ({ polaRef, wartosc, wylaczony, className }) => {
  const dotyk = useDotyk();
  const miarkaRef = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  /* Pole jednolinijkowe trzyma karetkę na `top: 50%` i tylko cofa ją o połowę
     wysokości. Wielolinijkowe wylicza `y` z pomiaru, bo karetka wędruje między
     wierszami — stąd wartość ruchoma zamiast stałej. */
  const y = useMotionValue(0);
  const krycie = useMotionValue(0);
  const bezRuchu = useReducedMotion();
  /* Tokeny czytane z SAMEGO POLA, żeby zadziałały wartości odziedziczone
     z kontenera podglądu w Zarządzie — patrz komentarz przy hooku. */
  const tokeny = useTokenyKursora(polaRef as React.RefObject<HTMLElement>);

  const ustawieniaSprezyny = bezRuchu
    ? { stiffness: 10000, damping: 100, mass: 0.1 }
    : { stiffness: tokeny.sprezystosc, damping: tokeny.tlumienie, mass: tokeny.masa };


  const xSprezyna = useSpring(x, ustawieniaSprezyny);
  /* Pion jedzie SZTYWNIEJ niż poziom. Przeskok między wierszami w polu
     wielolinijkowym to zmiana o całą wysokość linii — ta sama miękka sprężyna
     co przy literach dawałaby wrażenie opadania kreski, a nie przeniesienia
     karetki do następnego wiersza. */
  const ySprezyna = useSpring(y, {
    ...ustawieniaSprezyny,
    stiffness: ustawieniaSprezyny.stiffness * 1.6,
  });

  /*
    KARETKA NIE PRZYLATUJE ZE STAREJ POZYCJI (03.09.2026).

    Krycie szło prosto na `opacity`, a `x`/`y` przez sprężynę. Kreska zapalała
    się więc PEŁNĄ mocą tam, gdzie stała poprzednio, i dopiero sunęła na
    miejsce: po zwinięciu zaznaczenia na początek tekstu przejeżdżała przez
    ponad połowę szerokości pola, a przy `autoFocus` startowała z narożnika.
    Gdy kreska była zgaszona, jej pozycja nie ma czego animować — przestawiamy
    ją skokiem i dopiero potem zapalamy.
  */
  const ustawKrycieBezPrzylotu = React.useCallback((docelowe: number) => {
    if (docelowe === 1 && krycie.get() === 0) {
      xSprezyna.jump(x.get());
      ySprezyna.jump(y.get());
    }
    krycie.set(docelowe);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const przelicz = useCallback(() => {
    const pole = polaRef.current;
    const miarka = miarkaRef.current;
    if (!pole || !miarka || wylaczony) return;

    const pomiar = zmierzKaretke(pole, miarka);
    if (!pomiar) { krycie.set(0); return; }
    x.set(pomiar.x);
    y.set(pomiar.y);
    ustawKrycieBezPrzylotu(pomiar.widoczna && document.activeElement === pole ? 1 : 0);
  }, [polaRef, wylaczony, x, y, krycie, ustawKrycieBezPrzylotu]);

  const przeliczRef = useRef(przelicz);
  przeliczRef.current = przelicz;

  // Zmiana treści albo typu pola przesuwa karetkę.
  /* Po zmianie treści z ZEWNĄTRZ (rodzic podmienia tekst i dopiero w kolejnej
     klatce przywraca zaznaczenie) pozycja z tego pomiaru bywa tymczasowa.
     Przeliczamy ponownie w następnej klatce, żeby sprężyna nie jechała do
     miejsca, którego już nie ma. */
  useEffect(() => {
    przeliczRef.current();
    const klatka = requestAnimationFrame(() => przeliczRef.current());
    return () => cancelAnimationFrame(klatka);
  }, [wartosc]);

  useEffect(() => {
    const pole = polaRef.current;
    if (!pole || wylaczony) return;

    const odswiez = () => przeliczRef.current();
    /* `selectionchange` leci na dokumencie, nie na polu — łapiemy strzałki,
       klik w środek tekstu i Cmd+A, których `input` nie zgłasza. */
    const naZaznaczeniu = () => {
      if (document.activeElement !== pole) return;
      requestAnimationFrame(odswiez);
    };
    const naFokusie = () => requestAnimationFrame(odswiez);
    const naRozmyciu = () => krycie.set(0);

    document.addEventListener('selectionchange', naZaznaczeniu);
    pole.addEventListener('focus', naFokusie);
    pole.addEventListener('blur', naRozmyciu);
    pole.addEventListener('scroll', odswiez);
    pole.addEventListener('keyup', odswiez);
    pole.addEventListener('click', odswiez);
    /* `select` (03.09.2026): gdy kod ustawia zaznaczenie sam
       (`setSelectionRange` po wstawieniu znacznika w Studiu Video), NIE leci
       ani `keyup`, ani `click`, a `selectionchange` bywa spóźniony o klatkę.
       Bez tego karetka mierzyła STARE zaznaczenie — odjeżdżała na koniec
       opisu i wracała. */
    pole.addEventListener('select', odswiez);

    /* Font wczytany po pierwszym renderze zmienia szerokości liter —
       bez tego karetka zostaje w miejscu wyliczonym dla fontu zastępczego. */
    let obserwator: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      obserwator = new ResizeObserver(odswiez);
      obserwator.observe(pole);
    }
    if (typeof document !== 'undefined' && 'fonts' in document) {
      void (document as Document & { fonts: FontFaceSet }).fonts.ready.then(odswiez);
    }

    /*
      STRAŻNIK ZMIAN BEZ ZDARZENIA (07.09.2026).

      Michał: „czasami kursor zostaje — w ChatInput, na logowaniu, przy
      rejestracji". Wspólna przyczyna: wartość pola zmienia się w DOM, ale
      ANI React, ANI żadne z nasłuchiwanych wyżej zdarzeń o tym nie wie.
       • autouzupełnianie przeglądarki wpisuje e-mail i hasło bez `input`,
         bez `selectionchange` i bez zmiany propa `wartosc` — karetka zostaje
         na pozycji zero przy pełnym polu (zrzut z okna wystawiania karty);
       • pole czyszczone programowo po wysłaniu wiadomości — gdy rodzic
         podmienia DOM z pominięciem stanu, efekt na `[wartosc]` się nie
         odpala i karetka stoi na końcu tekstu, którego już nie ma.
      Zdarzeń na te przypadki nie ma, więc porównujemy stan pola w każdej
      klatce, PÓKI MA FOKUS. Koszt: trzy porównania na klatkę dla jednego
      pola; przy niezmienionej wartości React trzyma tę samą referencję,
      więc porównanie napisów jest O(1). Ta sama naprawa siedzi w karetce
      globalnej — obie muszą jej mieć, bo obsługują rozłączne zbiory pól.
    */
    let ostatniaWartosc = pole.value;
    let ostatniPoczatek = pole.selectionStart;
    let ostatniKoniec = pole.selectionEnd;
    let straznik = 0;
    const pilnuj = () => {
      if (document.activeElement === pole && (
        pole.value !== ostatniaWartosc
        || pole.selectionStart !== ostatniPoczatek
        || pole.selectionEnd !== ostatniKoniec)) {
        ostatniaWartosc = pole.value;
        ostatniPoczatek = pole.selectionStart;
        ostatniKoniec = pole.selectionEnd;
        odswiez();
      }
      straznik = requestAnimationFrame(pilnuj);
    };
    straznik = requestAnimationFrame(pilnuj);

    odswiez();

    return () => {
      cancelAnimationFrame(straznik);
      document.removeEventListener('selectionchange', naZaznaczeniu);
      pole.removeEventListener('select', odswiez);
      pole.removeEventListener('focus', naFokusie);
      pole.removeEventListener('blur', naRozmyciu);
      pole.removeEventListener('scroll', odswiez);
      pole.removeEventListener('keyup', odswiez);
      pole.removeEventListener('click', odswiez);
      obserwator?.disconnect();
    };
  }, [polaRef, wylaczony, krycie]);

  /* Bramka dotyku — patrz `useDotyk` wyżej. Telefon dostaje karetkę systemową
     razem z uchwytami zaznaczenia; pola warunkują tym samym hakiem swój
     `caret-color`, więc bez karetki nie zostaje nikt. */
  if (wylaczony || dotyk) return null;

  return (
    <>
      <span
        ref={miarkaRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
      />
      {/*
        DWA ELEMENTY, NIE JEDEN — I TO JEST SEDNO.

        Pierwsza wersja miała `x` z framer-motion i klasę `-translate-y-1/2`
        na tym samym elemencie. Usterka zmierzona 13.08.2026: środek pola
        600,5 px, środek kreski 607,8 px — karetka siedziała 7,3 px za nisko,
        górną krawędzią dokładnie na linii środka. Powód: motion zapisuje `x`
        jako `transform: translateX(...)`, czyli do TEJ SAMEJ właściwości co
        klasa Tailwinda. Jedna zjadła drugą — ta sama rodzina błędu co dwie
        klasy piszące do `box-shadow`.

        Teraz kontener niesie POZYCJĘ (x, y — środek karetki liczony od lewego
        górnego rogu pola), a kreska w środku ma własne cofnięcie o połowę
        wysokości. Każdy transform na swoim elemencie, więc nie ma czego zjadać.
      */}
      <motion.span
        aria-hidden="true"
        style={{ x: xSprezyna, y: ySprezyna, opacity: krycie }}
        /* `z-20` (03.09.2026): nakładka nie miała żadnego z-index, więc pole
           z własnym `z-10` i kryjącym tłem malowało się NAD kreską — a prawdziwa
           karetka jest zgaszona (`caretColor: transparent`). Zmiana nazwy
           rozmowy albo folderu w pasku Chatu oznaczała pisanie na ślepo. */
        className="pointer-events-none absolute left-0 top-0 z-20"
      >
        <span
          /* Grubość przez `style`, bo to wartość strojona w Zarządzie —
             Tailwind generuje tylko klasy, które widzi w kodzie.
             `backgroundColor` tylko gdy token jest ustawiony — inaczej
             zostaje klasa `bg-primary` i zachowanie bez zmian. */
          style={{ width: `${tokeny.szerokosc}px`, backgroundColor: tokeny.kolor || undefined }}
          className={'block h-[1.05em] -translate-y-1/2 rounded-full bg-primary ' + (className ?? '')}
        />
      </motion.span>
    </>
  );
};

/** Scala kilka refów w jeden — pole ma swój `ref` z zewnątrz, a my potrzebujemy własnego. */
export function scalRefy<T>(...refy: (React.Ref<T> | undefined)[]) {
  return (wartosc: T | null) => {
    refy.forEach((r) => {
      if (typeof r === 'function') r(wartosc);
      else if (r && typeof r === 'object') (r as React.MutableRefObject<T | null>).current = wartosc;
    });
  };
}
