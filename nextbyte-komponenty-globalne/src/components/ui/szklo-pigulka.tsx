import React from 'react';
import { mapaZKsztaltu } from './szklo-mapa';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  SZKŁO PIGUŁKI — materiał wyszukiwarki
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „ogarnij komponent wyszukiwarki, bo to nie jest liquid glass"
 * (+ odnośnik do `rdev/liquid-glass-react`).
 *
 * ── DWIE RZECZY, KTÓRYCH BRAKOWAŁO ──────────────────────────────────────
 *
 * ① MAPA LICZONA Z KSZTAŁTU, nie z dwóch gradientów liniowych.
 *    Szczegóły i powód: `szklo-mapa.ts`. W skrócie — dotychczasowa mapa
 *    przesuwała obraz „w prawo i w dół", co na kwadratowej karcie uchodzi,
 *    ale na pigułce 512×48 daje cztery różne krawędzie zamiast jednej fazy
 *    biegnącej po obwodzie.
 *
 * ② MASKA KRAWĘDZI — i to jest ta różnica, którą widać gołym okiem.
 *    Nasz dotychczasowy filtr przesuwał CAŁĄ powierzchnię, tylko słabiej
 *    w środku. Efekt: rozszczepienie kolorów rozlewało się na cały element
 *    i tekst pod szybą robił się miękki. Prawdziwe szkło zniekształca przy
 *    fazie, a przez środek tafli patrzy się jak przez zwykłą szybę.
 *
 *    Dlatego tutaj obraz idzie DWIEMA drogami: przesunięty (z aberracją)
 *    i nietknięty. Maska zbudowana z samej mapy decyduje, gdzie który —
 *    brzeg dostaje aberrację, środek zostaje czysty. Bez tego cała reszta
 *    (trzy kanały, `screen`, rozmycie) daje tylko „krzywe szkło".
 *
 * ── SKĄD TO POCHODZI ────────────────────────────────────────────────────
 * Łańcuch filtrów odwzorowuje `rdev/liquid-glass-react` (MIT). Przepisany,
 * a nie dołączony jako zależność: tamten komponent renderuje własny kontener
 * z warstwami, własną obsługą myszy i własnym pozycjonowaniem, więc wstawienie
 * go pod pasek wyszukiwarki i pod Radix Dialoga znaczyłoby przepisanie obu
 * od zera. Materiał (filtr, `backdrop-filter`, refleks) mamy już swój.
 */

/** Id filtra — używany w CSS przez `url(#…)`. */
export const ID_FILTRA_PIGULKI = 'nb-refrakcja-pigulka';

/**
 * Siła przesunięcia w pikselach. Niska z rozmysłem: pod pigułką stoi pole
 * tekstowe, a nie ozdoba — przy mocniejszym załamaniu litery pod krawędzią
 * zaczynają pływać.
 */
const SILA = 34;

/**
 * Rozstrojenie kanałów. Cała aberracja bierze się z RÓŻNICY między nimi:
 * gdyby wszystkie trzy miały tę samą skalę, wyszłoby samo zniekształcenie —
 * krzywe szkło zamiast szlifowanego.
 */
const KANALY = { r: 1, g: 0.94, b: 0.88 };

export const DefinicjaSzklaPigulki: React.FC = () => {
  /* Mapa liczona raz — `szklo-mapa` zapamiętuje ją pod kluczem kształtu,
     więc przemontowanie komponentu nie oznacza ponownego liczenia.
     Proporcja 8:1 odpowiada pigułce wyszukiwarki (512×48 i 672×64);
     `promien: 0.5` to pigułka, czyli zaokrąglenie na pełną wysokość. */
  const mapa = React.useMemo(
    () => mapaZKsztaltu({ szerokosc: 256, wysokosc: 32, promien: 0.5 }),
    [],
  );

  if (!mapa) return null;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      // Poza widokiem, ale NIE `display:none` — ukryty filtr przestaje działać.
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter
          id={ID_FILTRA_PIGULKI}
          x="-25%" y="-25%" width="150%" height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={mapa}
            x="0" y="0" width="100%" height="100%"
            preserveAspectRatio="none"
            result="MAPA"
          />

          {/* ── MASKA KRAWĘDZI ────────────────────────────────────────────
              Jasność mapy mówi, jak daleko od krawędzi jesteśmy. Zamieniamy
              ją na maskę schodkową: 0 w środku, pełna przy brzegu. To ona
              rozstrzyga, gdzie wolno zniekształcać. */}
          <feColorMatrix
            in="MAPA" type="matrix"
            values="0.3 0.3 0.3 0 0  0.3 0.3 0.3 0 0  0.3 0.3 0.3 0 0  0 0 0 1 0"
            result="JASNOSC_MAPY"
          />
          <feComponentTransfer in="JASNOSC_MAPY" result="MASKA_BRZEGU">
            <feFuncA type="discrete" tableValues="0 0.35 1" />
          </feComponentTransfer>

          {/* Obraz nietknięty — trafi w środek tafli. */}
          <feOffset in="SourceGraphic" dx="0" dy="0" result="SRODEK_CZYSTY" />

          {/* ── TRZY KANAŁY, KAŻDY PRZESUNIĘTY INACZEJ ──────────────────── */}
          <feDisplacementMap
            in="SourceGraphic" in2="MAPA" scale={SILA * KANALY.r}
            xChannelSelector="R" yChannelSelector="B" result="R_PRZES"
          />
          <feColorMatrix
            in="R_PRZES" type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="KANAL_R"
          />
          <feDisplacementMap
            in="SourceGraphic" in2="MAPA" scale={SILA * KANALY.g}
            xChannelSelector="R" yChannelSelector="B" result="G_PRZES"
          />
          <feColorMatrix
            in="G_PRZES" type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="KANAL_G"
          />
          <feDisplacementMap
            in="SourceGraphic" in2="MAPA" scale={SILA * KANALY.b}
            xChannelSelector="R" yChannelSelector="B" result="B_PRZES"
          />
          <feColorMatrix
            in="B_PRZES" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="KANAL_B"
          />

          <feBlend in="KANAL_G" in2="KANAL_B" mode="screen" result="GB" />
          <feBlend in="KANAL_R" in2="GB" mode="screen" result="RGB" />

          {/* Włosowe rozmycie zbija ząbki po przesunięciu o wartości ułamkowe. */}
          <feGaussianBlur in="RGB" stdDeviation="0.4" result="RGB_MIEKKI" />

          {/* ── ZŁOŻENIE: brzeg z aberracją, środek nietknięty ───────────── */}
          <feComposite in="RGB_MIEKKI" in2="MASKA_BRZEGU" operator="in" result="BRZEG" />
          <feComponentTransfer in="MASKA_BRZEGU" result="MASKA_SRODKA">
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feComposite in="SRODEK_CZYSTY" in2="MASKA_SRODKA" operator="in" result="SRODEK" />
          <feComposite in="BRZEG" in2="SRODEK" operator="over" />
        </filter>
      </defs>
    </svg>
  );
};

/**
 * Refleks szkła — dwie linie światła wewnątrz krawędzi i cień pod spodem.
 *
 * To ten drobiazg, po którym oko rozpoznaje szybę, zanim zdąży pomyśleć:
 * górna krawędź łapie światło, dolna je oddaje. Wartości z `liquid-glass-react`,
 * ale liczone od `--foreground` zamiast zaszytej bieli — inaczej na jasnych
 * motywach refleks byłby bielą na prawie bieli, czyli zniknąłby dokładnie tam,
 * gdzie krawędź najbardziej go potrzebuje.
 */
export const REFLEKS_PIGULKI =
  'inset 0 0 0 0.5px hsl(var(--foreground) / 0.30),'
  + ' inset 0 1px 3px hsl(var(--foreground) / 0.16),'
  + ' inset 0 -1px 2px hsl(var(--foreground) / 0.05),'
  + ' 0 8px 24px hsl(0 0% 0% / 0.28)';
