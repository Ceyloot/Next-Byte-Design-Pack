/**
 * ════════════════════════════════════════════════════════════════════════
 *  MAPA PRZEMIESZCZENIA Z KSZTAŁTU — szkło, które wie, gdzie ma krawędź
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „ogarnij komponent wyszukiwarki, bo to nie jest liquid glass"
 * (+ odnośnik do `rdev/liquid-glass-react`).
 *
 * ── CZYM SIĘ TO RÓŻNI OD MAPY, KTÓRĄ MIELIŚMY ───────────────────────────
 * `szklo-plynne.tsx` rysuje mapę z DWÓCH GRADIENTÓW LINIOWYCH: czerwony rośnie
 * w poziomie, niebieski w pionie, a rozmyty prostokąt w środku ściąga
 * przesunięcie z powrotem do zera. To daje przesunięcie KIERUNKOWE — rośnie
 * w prawo i w dół, niezależnie od tego, gdzie faktycznie jest krawędź szyby.
 * Na kwadratowej karcie tego nie widać. Na pigułce wyszukiwarki (512×48, czyli
 * proporcje 10:1) widać od razu: lewy brzeg załamuje inaczej niż prawy, a górny
 * inaczej niż dolny.
 *
 * Tutaj przesunięcie liczy ODLEGŁOŚĆ OD KRAWĘDZI zaokrąglonego prostokąta
 * (funkcja `sdfZaokraglonyProstokat`, w grafice znana jako SDF). Rośnie po
 * obwodzie kształtu — tak jak światło załamuje się na fazie prawdziwej szyby,
 * a nie „w prawo".
 *
 * ── SKĄD TO POCHODZI ────────────────────────────────────────────────────
 * Technika i sam kształt SDF: `rdev/liquid-glass-react` (MIT), który z kolei
 * bierze go z `shuding/liquid-glass`. Przepisane na potrzeby platformy zamiast
 * dodania zależności — biblioteka renderuje WŁASNY kontener z warstwami,
 * własną obsługą myszy i własnym pozycjonowaniem, co w Radix Dialogu i w istniejącym
 * pasku wyszukiwarki znaczyłoby przepisanie obu od zera. Sam materiał (filtr SVG,
 * `backdrop-filter`, refleks krawędzi) mamy już swój; brakowało wyłącznie mapy
 * liczonej z kształtu.
 *
 * ── DLACZEGO CANVAS, A NIE SVG ──────────────────────────────────────────
 * SDF to funkcja per piksel — w SVG dałoby się ją najwyżej przybliżyć kilkoma
 * gradientami, czyli wrócilibyśmy do problemu, który tu naprawiamy. Canvas liczy
 * ją dokładnie, raz, przy pierwszym użyciu, a wynik idzie do `feImage` jako
 * data URL. Dla 256×64 to 16 384 punkty — pojedyncze milisekundy.
 *
 * Wynik jest zapamiętywany pod kluczem `szerokość×wysokość×promień`, więc druga
 * powierzchnia o tych samych proporcjach nie liczy niczego ponownie.
 */

/** Wygładzone przejście 0→1 w przedziale [a, b] — ta sama funkcja co w GLSL. */
function wygladz(a: number, b: number, t: number): number {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

/**
 * Odległość punktu od krawędzi zaokrąglonego prostokąta.
 * Ujemna w środku, zero na krawędzi, dodatnia na zewnątrz.
 */
function sdfZaokraglonyProstokat(
  x: number, y: number, polSzer: number, polWys: number, promien: number,
): number {
  const qx = Math.abs(x) - polSzer + promien;
  const qy = Math.abs(y) - polWys + promien;
  return (
    Math.min(Math.max(qx, qy), 0)
    + Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
    - promien
  );
}

const zapamietane = new Map<string, string>();

export interface OpisKsztaltu {
  /** Rozdzielczość mapy. Nie musi odpowiadać pikselom elementu — liczy się PROPORCJA. */
  szerokosc: number;
  wysokosc: number;
  /** Promień zaokrąglenia w ułamku krótszego boku. 0.5 = pigułka. */
  promien: number;
}

/**
 * Buduje mapę przemieszczenia dla zadanego kształtu i zwraca ją jako data URL.
 *
 * Kanał czerwony niesie przesunięcie w osi X, niebieski w osi Y (tak czyta je
 * `feDisplacementMap` z `xChannelSelector="R" yChannelSelector="B"`).
 * Wartość 128 to zero — stąd `+ 0.5` przy zapisie.
 */
export function mapaZKsztaltu({ szerokosc, wysokosc, promien }: OpisKsztaltu): string {
  // Canvas istnieje tylko w przeglądarce — przy renderze po stronie serwera
  // oddajemy pusty ciąg, a `DefinicjaSzklaPigulki` po prostu nie rysuje filtra.
  if (typeof document === 'undefined') return '';

  const klucz = `${szerokosc}x${wysokosc}r${promien}`;
  const gotowa = zapamietane.get(klucz);
  if (gotowa) return gotowa;

  const plotno = document.createElement('canvas');
  plotno.width = szerokosc;
  plotno.height = wysokosc;
  const ctx = plotno.getContext('2d');
  if (!ctx) return '';

  const obraz = ctx.createImageData(szerokosc, wysokosc);
  const dane = obraz.data;

  /* Dwa przebiegi: najpierw liczymy surowe przesunięcia i największe z nich,
     potem normalizujemy. Bez normalizacji mapa dla wąskiej pigułki i dla
     kwadratowej karty miałaby zupełnie inną siłę przy tym samym `scale`. */
  const surowe = new Float32Array(szerokosc * wysokosc * 2);
  let najwieksze = 0;

  for (let y = 0; y < wysokosc; y++) {
    for (let x = 0; x < szerokosc; x++) {
      // Układ znormalizowany do [-0.5, 0.5] w obu osiach.
      const ux = x / szerokosc - 0.5;
      const uy = y / wysokosc - 0.5;

      const odleglosc = sdfZaokraglonyProstokat(ux, uy, 0.3, 0.2, promien);
      // Im bliżej krawędzi, tym mocniej — i zawsze W STRONĘ środka.
      const sila = wygladz(0.8, 0, odleglosc - 0.15);
      const skala = wygladz(0, 1, sila);

      const dx = (ux * skala + 0.5) * szerokosc - x;
      const dy = (uy * skala + 0.5) * wysokosc - y;

      const i = (y * szerokosc + x) * 2;
      surowe[i] = dx;
      surowe[i + 1] = dy;
      najwieksze = Math.max(najwieksze, Math.abs(dx), Math.abs(dy));
    }
  }
  najwieksze = Math.max(najwieksze, 1);

  for (let y = 0; y < wysokosc; y++) {
    for (let x = 0; x < szerokosc; x++) {
      const i = (y * szerokosc + x) * 2;

      /* Wygaszenie przy samym brzegu mapy. Bez tego pierwszy i ostatni piksel
         przesuwają się skokowo i po filtrze widać twardą kreskę na obwodzie. */
      const doBrzegu = Math.min(x, y, szerokosc - x - 1, wysokosc - y - 1);
      const wspolczynnik = Math.min(1, doBrzegu / 2);

      const r = (surowe[i] * wspolczynnik) / najwieksze + 0.5;
      const g = (surowe[i + 1] * wspolczynnik) / najwieksze + 0.5;

      const p = (y * szerokosc + x) * 4;
      dane[p] = Math.max(0, Math.min(255, r * 255));      // X
      dane[p + 1] = Math.max(0, Math.min(255, g * 255));  // niewykorzystany
      dane[p + 2] = Math.max(0, Math.min(255, g * 255));  // Y
      dane[p + 3] = 255;
    }
  }

  ctx.putImageData(obraz, 0, 0);
  const url = plotno.toDataURL();
  zapamietane.set(klucz, url);
  return url;
}
