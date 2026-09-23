/*
 * NextGlass — 4. warstwa materiału: załamanie światła (refrakcja).
 *
 * Plik przeniesiony 1:1 z platformy (`components/ui/szklo-plynne.tsx`).
 * Trzy pozostałe warstwy siedzą w `styles/nextglass.css`.
 *
 * Wstaw `<NextGlassDefs />` RAZ, możliwie wysoko w drzewie — to same
 * definicje `<filter>`, nic nie rysuje. Bez niego szkło dalej działa,
 * tylko bez refrakcji (tak jest w Safari i Firefoksie, które
 * `backdrop-filter: url(#…)` nie obsługują).
 *
 * `DefinicjeSzklaPlynnego` zostaje jako nazwa zgodna z platformą;
 * `NextGlassDefs` to alias dla czytelności w bibliotece.
 */
import React from 'react';
import { mapaZKsztaltu } from '../../lib/szklo-mapa';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  SZKŁO PŁYNNE — załamanie światła na krawędzi (Liquid Glass)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Czwarta warstwa materiału szklanego. Trzy pierwsze (rozmycie, nasycenie,
 * odblask krawędzi) siedzą w `.nb-szklo` w `index.css` i działają wszędzie.
 * Ta jedna wymaga filtrów SVG i dlatego jest OSOBNO — żeby dało się ją włączyć
 * tam, gdzie ma sens, i nie płacić za nią wszędzie indziej.
 *
 * ── SKĄD TEN PRZEPIS ────────────────────────────────────────────────────
 * Decyzja Michała (04.08.2026): „zamień wszystkie komponenty nasze
 * glassmorphistyczne na ten z takimi ustawieniami" — czyli materiał z kopii
 * 1:1 `rdev/liquid-glass-react` (`szklo-apple/`), z wartościami dobranymi
 * w panelu «Zarządzanie szkłem»: siła 31, rozszczepienie 2.
 *
 * Wcześniejszy przepis (mapa z dwóch gradientów liniowych, przesunięcie po
 * CAŁEJ powierzchni) różnił się od tamtego dokładnie tym, co widać gołym
 * okiem: środek tafli też falował. Prawdziwa szyba zniekształca przy fazie,
 * a przez środek patrzy się jak przez zwykłe okno.
 *
 * Mapa idzie z `mapaZKsztaltu` (liczona z kształtu, neutralny środek,
 * kilkaset bajtów, pamiętana pod kluczem wymiarów) — a nie z bitmapy
 * biblioteki. Powód jest wydajnościowy i zmierzony: patrz komentarz nad
 * `cialoFiltra`. Wygląd (brzeg z aberracją, czysty środek, siła i proporcje
 * kanałów) pozostaje ten z biblioteki.
 *
 * ── OGRANICZENIE, KTÓRE TRZEBA ZNAĆ ─────────────────────────────────────
 * `backdrop-filter: url(#…)` działa w Chromium. Safari i Firefox tego NIE
 * obsługują — autorzy obu bibliotek piszą to wprost. Tam element zostaje przy
 * `.nb-szklo`, czyli rozmycie + nasycenie + odblask krawędzi. Wykrywanie jest
 * po stronie CSS (`@supports`), więc nie ma tu żadnego sprawdzania przeglądarki
 * po nazwie — to zawsze się prędzej czy później myli.
 */

/**
 * Ustawienia materiału — dobrane przez Michała w panelu «Zarządzanie szkłem»
 * (Biblioteka komponentów), 04.08.2026. Rozmycie i nasycenie z tego samego
 * zestawu siedzą w `index.css` (blur 7.2px = 4 + 0.10×32, saturate 130%).
 */
/**
 * Wartości zapasowe = dokładnie to, co stało tu na sztywno do 13.08.2026.
 * Brak tokenów w bazie, brak sieci, wyłączony JavaScript — materiał wygląda
 * jak dotąd. Brak danych jest poprawnym stanem, nie awarią.
 */
const ZAPASOWE = { sila: 31, aberracja: 2 } as const;

/**
 * Siła załamania i rozszczepienie — teraz z tokenów, nie ze stałej.
 *
 * Do 13.08.2026 były wpisane w tym pliku, a komentarz obok mówił wprost:
 * „dobrane przez Michała w panelu «Zarządzanie szkłem»". Czyli panel już raz
 * posłużył do ich dobrania — tylko wynik trzeba było ręcznie przepisać do kodu
 * i wdrożyć. Michał, 13.08.2026: panel „miał być takim ustawieniem na całą
 * platformę". Teraz nim jest: suwak → publikacja → tokeny → ten filtr.
 */
function ustawieniaZTokenow() {
  if (typeof window === 'undefined') return ZAPASOWE;
  const styl = getComputedStyle(document.documentElement);
  const liczba = (nazwa: string, zapasowa: number) => {
    const v = Number.parseFloat(styl.getPropertyValue(nazwa));
    return Number.isFinite(v) ? v : zapasowa;
  };
  return {
    sila: liczba('--nb-szklo-sila', ZAPASOWE.sila),
    aberracja: liczba('--nb-szklo-aberracja', ZAPASOWE.aberracja),
  };
}

/**
 * Dwa identyfikatory zostają dla zgodności z klasami w CSS — ale od decyzji
 * o jednym materiale OBA dostają ten sam przepis. Rozróżnienie „delikatne /
 * wyraźne" przestało istnieć: wszystkie powierzchnie mają wyglądać tak samo.
 */
export type SilaSzkla = 'delikatne' | 'wyrazne';

/** Klasa do postawienia na powierzchni. Zawsze RAZEM z `nb-szklo`. */
export const KLASA_SZKLA: Record<SilaSzkla, string> = {
  delikatne: 'nb-szklo nb-szklo-plynne',
  wyrazne: 'nb-szklo nb-szklo-plynne-wyrazne',
};

/**
 * Ciało filtra — WYGLĄD z `szklo-apple/filtr.tsx` (brzeg z aberracją, środek
 * nietknięty; kanały ±5%/±10% od siły; wygładzenie 0.3), ale zbudowany
 * z 8 prymitywów zamiast 14.
 *
 * ── DLACZEGO NIE DOSŁOWNY ŁAŃCUCH BIBLIOTEKI ────────────────────────────
 * ZMIERZONE 04.08.2026 (Panel Główny, animacja, 18 tafli): dosłowna kopia
 * łańcucha — 39 fps, 66 klatek >20 ms na 77; sam blur bez refrakcji —
 * 101 fps, zero długich klatek. Michał: „czemu tak się ścina wszystko".
 *
 * Biblioteka potrzebuje maski (feColorMatrix→feComponentTransfer→3×
 * feComposite), bo jej mapa bitmapowa ma wzór TAKŻE na środku i środek
 * trzeba wycinać po fakcie. Nasza mapa (`mapaZKsztaltu`) ma neutralny
 * środek Z KONSTRUKCJI — przesunięcie przy brzegu, zero w środku — więc
 * cała gałąź maskowania jest zbędna: ten sam obraz końcowy, o 6 prymitywów
 * mniej NA KAŻDĄ taflę przy KAŻDYM przemalowaniu. To jest różnica między
 * „ścina się" a 60 fps, nie zmiana wyglądu.
 */
/**
 * ════════════════════════════════════════════════════════════════════════
 *  POZIOMY REFRAKCJI — przesunięcie PROPORCJONALNE do wysokości powierzchni
 * ════════════════════════════════════════════════════════════════════════
 *
 * PROBLEM, KTÓRY TO ROZWIĄZUJE (zmierzony 20.08.2026 na stronie lądowania).
 *
 * `feDisplacementMap` przesuwa o `scale × (kanał − 0,5)` w JEDNOSTKACH
 * UŻYTKOWNIKA — czyli o STAŁĄ liczbę pikseli, niezależnie od tego, jak duża
 * jest powierzchnia. Przy sile 31 to ±15,5 px zawsze i wszędzie. A to znaczy:
 *
 *     karta 318 px wysokości  →  15,5 px  =   4,9% wysokości   ← subtelna faza
 *     pasek  64 px wysokości  →  15,5 px  =  24,2% wysokości   ← całość faluje
 *
 * Na przyklejonym nagłówku (1674 × 64) dawało to widoczne przesunięcie treści
 * w bok — Michał opisał to jako „szkło przesuwa to, co pod nim, w lewo".
 * Sprawdzone doświadczalnie: przy skali 0 smuga za paskiem ZOSTAJE prawie
 * identyczna, bo to blask napisu przez rozmycie. Winowajcą jest wyłącznie
 * przesunięcie, nie rozmycie ani nasycenie.
 *
 * CZEGO NIE DA SIĘ ZROBIĆ, choć wygląda na oczywiste:
 *  · Generować mapy w proporcji paska — mapa jest znormalizowana do [-0.5,0.5]
 *    w obu osiach (`szklo-mapa.ts`), więc 200×200 i 400×50 dają TO SAMO pole.
 *  · Użyć `primitiveUnits="objectBoundingBox"` — normalizuje po przekątnej,
 *    a ta na pasku 1674×64 jest zdominowana przez szerokość: przesunięcie
 *    wyszłoby 40 px zamiast 15,5, czyli DWA razy gorzej.
 *
 * ROZWIĄZANIE: kilka gotowych filtrów o różnej sile i przydzielanie ich po
 * ZMIERZONEJ wysokości. Progi dobrane tak, żeby przesunięcie wszędzie wyszło
 * około 5% wysokości — tyle, ile ma dziś karta, na której materiał wygląda
 * dobrze.
 *
 * Bezpieczeństwo: te poziomy wyłącznie OSŁABIAJĄ przesunięcie. Gdyby pomiar
 * kiedykolwiek zawiódł, najgorsze, co się stanie, to szkło subtelniejsze niż
 * zamierzone — nigdy zniekształcone mocniej.
 */
const POZIOMY = [
  { nazwa: 'w1', doWysokosci: 88, mnoznik: 0.20 },   // paski, pigułki  → ~4,8%
  { nazwa: 'w2', doWysokosci: 160, mnoznik: 0.40 },  // listwy, wiersze → ~4,7%
  { nazwa: 'w3', doWysokosci: 240, mnoznik: 0.65 },  // niskie karty    → ~5,0%
] as const;

function cialoFiltra(id: string, mnoznikSily = 1): string {
  const { sila: silaBazowa, aberracja } = ustawieniaZTokenow();
  const sila = silaBazowa * mnoznikSily;
  const kanaly = {
    r: sila,
    g: sila * (1 + aberracja * 0.05),
    b: sila * (1 + aberracja * 0.1),
  };
  const kanal = (nazwa: string, skala: number, macierz: string) => `
    <feDisplacementMap in="SourceGraphic" in2="MAPA" scale="${skala}"
      xChannelSelector="R" yChannelSelector="B" result="${nazwa}_P"/>
    <feColorMatrix in="${nazwa}_P" type="matrix" values="${macierz}" result="${nazwa}"/>`;

  const mapa = mapaZKsztaltu({ szerokosc: 200, wysokosc: 200, promien: 0.12 });

  /*
    ── ROZSZCZEPIENIE 0 ZNACZY JEDNO PRZEJŚCIE, NIE TRZY (10.09.2026) ─────────

    Rozszczepienie (aberracja chromatyczna) polega na przesunięciu każdego
    kanału barwy o TROCHĘ inną odległość — stąd tęczowy rant prawdziwego szkła.
    Kosztuje to trzy `feDisplacementMap`, trzy `feColorMatrix` i dwa `feBlend`:
    dziesięć prymitywów zamiast dwóch.

    Przy suwaku „Rozszczepienie" ustawionym na 0 wszystkie trzy przejścia
    dostawały TĘ SAMĄ skalę — czyli liczyliśmy trzy razy to samo i mieszali
    ze sobą trzy identyczne obrazy. Zero różnicy w wyglądzie, dziesięć razy
    więcej pracy na każdą taflę i każdą klatkę.

    Teraz suwak w Panelu Zarządu jest realnym pokrętłem: 0 to szkło tanie
    (dwa prymitywy, sam refrakcyjny przeskok), powyżej zera — pełne, z tęczą
    na rancie. Wygląd wybiera człowiek, nie przypadek w kodzie.

    Wzorzec jednoprzejściowy jest zresztą tym, co opisuje artykuł ekino
    („Liquid Glass in CSS (and SVG)"): `feImage` plus jeden `feDisplacementMap`.
    Ich zdanie, że „przesunięcie jest tanie w porównaniu z rozmyciem", dotyczy
    właśnie takiego filtra — nasz robił dziesięciokrotność tej pracy.
  */
  if (aberracja <= 0) {
    return `<filter id="${id}" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB">
    <feImage href="${mapa}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="MAPA"/>
    <feDisplacementMap in="SourceGraphic" in2="MAPA" scale="${sila}"
      xChannelSelector="R" yChannelSelector="B"/>
  </filter>`;
  }

  return `<filter id="${id}" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB">
    <feImage href="${mapa}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="MAPA"/>
    ${kanal('KR', kanaly.r, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0')}
    ${kanal('KG', kanaly.g, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0')}
    ${kanal('KB', kanaly.b, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0')}
    <feBlend in="KG" in2="KB" mode="screen" result="GB"/>
    <feBlend in="KR" in2="GB" mode="screen" result="RGB"/>
    <feGaussianBlur in="RGB" stdDeviation="${Math.max(0.1, 0.5 - aberracja * 0.1)}"/>
  </filter>`;
}

/** Komplet definicji jako tekst — jedno źródło dla obu dróg montowania. */
function definicjeSvg(): string {
  return `<svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0"><defs>${
    (Object.keys(KLASA_SZKLA) as SilaSzkla[]).map((k) => cialoFiltra(`nb-refrakcja-${k}`)).join('') +
    /* Warianty osłabione dla powierzchni niskich — patrz komentarz nad POZIOMY. */
    POZIOMY.map((p) => cialoFiltra(`nb-refrakcja-${p.nazwa}`, p.mnoznik)).join('')
  }</defs></svg>`;
}

/**
 * Definicje filtrów — montowane RAZ na całą aplikację (App.tsx).
 *
 * Filtr SVG jest zasobem globalnym: elementy odwołują się do niego przez
 * `url(#id)`. Renderowanie go przy każdej powierzchni oznaczałoby
 * kilkadziesiąt identycznych definicji w drzewie i tyle samo razy powtórzoną
 * pracę przeglądarki — dokładnie ten koszt, którego ta architektura unika.
 *
 * Render przez ten sam tekst co `useDefinicjeSzkla`, żeby obie drogi nie
 * miały jak się rozjechać.
 */
export const DefinicjeSzklaPlynnego: React.FC = () => {
  /* DWIE DROGI MONTAŻU, JEDNO ZACHOWANIE.

     Dopasowanie wysokości było najpierw wpięte tylko w `useDefinicjeSzkla`
     i nie działało na stronie lądowania — bo `App.tsx` montuje definicje przez
     TEN komponent, a z haka korzystają wyłącznie okna dialogowe i listy wyboru.
     Zmierzone: filtry powstawały poprawnie, ale ani jedna tafla nie dostawała
     `data-nb-wys`. Obie drogi muszą więc włączać to samo. */
  React.useEffect(() => {
    wlaczDopasowanieWysokosci();
    return wylaczDopasowanieWysokosci;
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      // Poza widokiem, ale NIE `display:none` — ukryty filtr przestaje działać.
      dangerouslySetInnerHTML={{ __html: definicjeSvg() }}
    />
  );
};

/**
 * Samoczynne zamontowanie definicji — dokładnie RAZ, niezależnie od tego, ile
 * powierzchni szklanych jest na stronie.
 *
 * Po co licznik zamiast zwykłego `useEffect`: okno dialogowe i lista wyboru
 * montują się i odmontowują niezależnie od siebie. Bez zliczania zamknięcie
 * jednego zabrałoby filtry drugiemu, a wtedy `url(#…)` przestaje się rozwiązywać
 * i powierzchnia traci nie tylko załamanie, ale CAŁY `backdrop-filter` — czyli
 * zamknięcie menu psułoby wygląd otwartego okna.
 */
let ileUzyc = 0;
let wezel: HTMLElement | null = null;

/* ══════════════════════════════════════════════════════════════════════
   PRZYDZIELANIE POZIOMU PO ZMIERZONEJ WYSOKOŚCI
   ══════════════════════════════════════════════════════════════════════

   Filtr SVG jest zasobem GLOBALNYM — jeden na całą aplikację, wołany przez
   `url(#id)`. Nie da się go sparametryzować dla pojedynczej tafli bez tworzenia
   filtra na każdą z nich, a to jest dokładnie ten koszt, którego cała ta
   architektura unika (patrz komentarz nad `cialoFiltra`).

   Stąd droga na około: kilka gotowych filtrów o różnej sile i atrybut
   `data-nb-wys` mówiący, którego użyć. CSS dobiera filtr po atrybucie, ten kod
   tylko mierzy i podpisuje.

   DLACZEGO OBSERWATOR, A NIE POMIAR PRZY MONTAŻU. Wysokość szklanej powierzchni
   zmienia się później: karta rozwija treść, pasek chowa się przy przewijaniu,
   okno się zwęża i tekst przelewa się na kolejny wiersz. Pomiar jednorazowy
   rozjechałby się przy pierwszej takiej zmianie.

   KOSZT. Jeden `ResizeObserver` na wszystkie tafle i jeden `MutationObserver`
   na dokładanie nowych, oba spięte w jedną klatkę przez `requestAnimationFrame`.
   Odczyt to `getBoundingClientRect` — wartość, którą przeglądarka ma już
   policzoną w chwili wywołania obserwatora. */

const WYBOR_TAFLI = '.nb-szklo-plynne, .nb-szklo-plynne-wyrazne';

/*
  ── REFRAKCJA MA GRANICE POWIERZCHNI (10.09.2026) ───────────────────────────
  Michał, ze zrzutem panelu: „ścina strasznie i ekran na czarno, jakby migał" —
  a na drugim zrzucie ZNIKNĘŁY pasek boczny, kalendarz, kafelki chmur i ikony
  szybkiej podróży. Reszta strony wyrenderowała się normalnie.

  To nie jest przypadkowy zestaw. Zniknęły DOKŁADNIE te powierzchnie, które
  niosą `backdrop-filter` z filtrem SVG. Tak wygląda przekroczenie budżetu
  kompozytora: przeglądarka nie rysuje warstwy w ogóle, zamiast rysować ją
  wolno — stąd „znika i pojawia się na ułamki sekundy".

  ZMIERZONE na Panelu Głównym: 14 warstw z filtrem SVG, razem 1,34 Mpx w skali
  CSS. Na ekranie Michała (dwa razy szerszym, ×2 gęstości) to grubo ponad
  10 Mpx przeliczanych przy każdej zmianie tła. Sześć z tych czternastu to ikony
  szybkiej podróży, które szkło dostały tego samego dnia — liczba warstw skoczyła
  z ośmiu do czternastu i wtedy zaczęło migać.

  GRANICE, NIE REZYGNACJA. Refrakcja to `feDisplacementMap` przesuwający o STAŁĄ
  liczbę pikseli, więc jej sens zależy od rozmiaru powierzchni:
    • kafelek 130 × 106 px — przesunięcie wychodzi kilkanaście procent wysokości,
      czyli faluje CAŁA powierzchnia zamiast samej krawędzi. Nie widać z tego
      szkła, widać drganie;
    • karta 909 × 3392 px (edytor notatki) — te same piksele to ułamek procenta,
      więc refrakcji nie widać w ogóle, a płaci się za każdy jej piksel.
  W obu przypadkach zostaje rozmycie, nasycenie i tinta — czyli materiał czyta
  się dalej jak szkło, tylko bez warstwy, która nic nie wnosi.

  Wartości: 20 000 px² to mniej więcej kafelek 140 × 140; 1 000 000 px² to
  powierzchnia 1000 × 1000, powyżej której refrakcja jest już niewidoczna.
*/
const POWIERZCHNIA_BEZ_REFRAKCJI_MIN = 20_000;
const POWIERZCHNIA_BEZ_REFRAKCJI_MAX = 1_000_000;

function poziomDlaPowierzchni(szerokosc: number, wysokosc: number): string | null {
  const powierzchnia = szerokosc * wysokosc;
  if (powierzchnia > 0 && (powierzchnia < POWIERZCHNIA_BEZ_REFRAKCJI_MIN
    || powierzchnia > POWIERZCHNIA_BEZ_REFRAKCJI_MAX)) return 'bez';
  for (const p of POZIOMY) if (wysokosc < p.doWysokosci) return p.nazwa;
  return null;   // powierzchnia dość wysoka — pełna siła, bez atrybutu
}

let obserwatorRozmiaru: ResizeObserver | null = null;
let obserwatorDrzewa: MutationObserver | null = null;
let klatka = 0;

function oznacz(el: Element): void {
  const { width: szerokosc, height: wysokosc } = (el as HTMLElement).getBoundingClientRect();
  /* Zero znaczy „jeszcze nie w układzie" albo „ukryta" — wtedy nie zgadujemy,
     bo pomyłka w tę stronę POGORSZYŁABY szkło. Obserwator wróci tu sam, gdy
     element dostanie wymiary. */
  if (!wysokosc || !szerokosc) return;

  const poziom = poziomDlaPowierzchni(szerokosc, wysokosc);
  if (poziom) {
    if (el.getAttribute('data-nb-wys') !== poziom) el.setAttribute('data-nb-wys', poziom);
  } else if (el.hasAttribute('data-nb-wys')) {
    el.removeAttribute('data-nb-wys');
  }
}

function przejrzyjWszystkie(): void {
  klatka = 0;
  document.querySelectorAll(WYBOR_TAFLI).forEach((el) => {
    oznacz(el);
    /* Powtórne `observe` tego samego celu jest bezkosztowe — specyfikacja mówi
       wprost, że drugie zgłoszenie nic nie robi. */
    obserwatorRozmiaru?.observe(el);
  });
}

function zaplanujPrzeglad(): void {
  if (klatka || typeof requestAnimationFrame === 'undefined') return;
  klatka = requestAnimationFrame(przejrzyjWszystkie);
}

function wlaczDopasowanieWysokosci(): void {
  if (typeof document === 'undefined' || obserwatorRozmiaru) return;
  obserwatorRozmiaru = new ResizeObserver((wpisy) => wpisy.forEach((w) => oznacz(w.target)));
  obserwatorDrzewa = new MutationObserver(zaplanujPrzeglad);
  obserwatorDrzewa.observe(document.body, { childList: true, subtree: true });
  zaplanujPrzeglad();
}

function wylaczDopasowanieWysokosci(): void {
  obserwatorRozmiaru?.disconnect();
  obserwatorDrzewa?.disconnect();
  obserwatorRozmiaru = null;
  obserwatorDrzewa = null;
  if (klatka) cancelAnimationFrame(klatka);
  klatka = 0;
}

export function useDefinicjeSzkla(): void {
  React.useEffect(() => {
    ileUzyc += 1;
    if (ileUzyc === 1 && typeof document !== 'undefined' && !document.getElementById('nb-defs-szkla')) {
      wezel = document.createElement('div');
      wezel.id = 'nb-defs-szkla';
      wezel.setAttribute('aria-hidden', 'true');
      wezel.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      wezel.innerHTML = definicjeSvg();
      document.body.appendChild(wezel);
    }

    /* Poza `if` świadomie: definicje mogą już wisieć w drzewie z poprzedniego
       montażu, a obserwator i tak trzeba wtedy uruchomić. Sam pilnuje, żeby
       nie wystartować dwa razy. */
    wlaczDopasowanieWysokosci();
    /* Publikacja z Zarządu zmienia tokeny NA `documentElement`, ale filtr SVG
       jest już zbudowanym drzewem — sam z siebie o tym nie wie. Przebudowa
       tylko przy tym zdarzeniu (a nie przy każdym ruchu suwaka), bo
       `feDisplacementMap` przelicza się przy każdym przemalowaniu każdej tafli
       i jest najdroższą rzeczą w tym pliku. */
    const naPublikacje = () => {
      if (wezel) wezel.innerHTML = definicjeSvg();
    };
    window.addEventListener('komponentyOpublikowane', naPublikacje);

    return () => {
      window.removeEventListener('komponentyOpublikowane', naPublikacje);
      ileUzyc -= 1;
      if (ileUzyc === 0) {
        if (wezel) { wezel.remove(); wezel = null; }
        wylaczDopasowanieWysokosci();
      }
    };
  }, []);

  /*
    ══════════════════════════════════════════════════════════════════════
     REFRAKCJA NIE ZNIKA NA CZAS PRZEWIJANIA (usunięte 02.09.2026)
    ══════════════════════════════════════════════════════════════════════

    Tu stał nasłuch `scroll`, który na czas przewijania dokładał do `<html>`
    klasę `nb-przewija`, a CSS zdejmował wtedy z każdej szyby samo załamanie
    (`url(#nb-refrakcja-…)`), zostawiając rozmycie. Pomysł: oszczędzić GPU,
    bo „nikt nie studiuje załamania światła w trakcie przewijania".

    Michał zobaczył coś innego: „jak scrolluje się coś, to to, co jest pod
    oknem, dziwnie skacze w dół, a jak przestanie się scrollować, to znowu
    w górę idzie". To był dokładnie ten przełącznik. `feDisplacementMap`
    przesuwa tło pod szybą o kilkanaście pikseli; zdjęcie filtru na start
    przewijania cofa to przesunięcie (skok), a jego powrót 140 ms po ostatnim
    zdarzeniu przesuwa tło z powrotem (drugi skok). Zmierzone obserwatorem
    klasy na `<html>`: klasa wchodzi 6 ms po starcie przewijania i schodzi
    1,4 s później — w rytmie „skacze / wraca". Przy okazji każda zmiana
    `backdrop-filter` każe przeglądarce zrasteryzować całą taflę od nowa,
    stąd mignięcia treści w pasku bocznym w pierwszej klatce przewijania.

    A oszczędność, dla której to powstało, nie istnieje. Zmierzone na
    Chat AI z paskiem bocznym o 7 000 px treści, płynne przewijanie 1,7 s,
    ~200 klatek, dwa przebiegi każdej wersji:

        z przełącznikiem:   średnia 8,3 ms · p95 9 ms · maks 24–28 ms
        bez przełącznika:   średnia 8,4 ms · p95 9 ms · maks 25–29 ms

    Różnica mieści się w szumie pomiaru. Kompozytor Chromium i tak liczy
    `backdrop-filter` na GPU; to, co miało być lekarstwem, było wyłącznie
    źródłem skoków. Gdyby na słabszym urządzeniu przewijanie zaczęło
    się ciąć, właściwa odpowiedź to bramka po możliwościach sprzętu przy
    montażu, nie przełączanie filtru w trakcie ruchu.
  */
}


/** Alias biblioteczny — ta sama komponenta co `DefinicjeSzklaPlynnego`. */
export const NextGlassDefs = DefinicjeSzklaPlynnego;
