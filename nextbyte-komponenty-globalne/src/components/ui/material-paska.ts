import type React from 'react';

/**
 * MATERIAŁ WYPEŁNIENIA PASKA — jedno źródło dla „Pasków zasobu" i suwaka.
 *
 * DLACZEGO OSOBNY PLIK: przepis żył wyłącznie w `PasekZasobu`. Kiedy 03.08.2026
 * przerabiałem suwak, napisałem w commicie „ten sam materiał, co Paski zasobu"
 * i tego NIE SPRAWDZIŁEM przez porównanie obok siebie. Michał zestawił oba na
 * jednym ekranie i różnica była natychmiast widoczna: pasek ma narastające
 * krycie, refleks i poświatę, a suwak miał płaską wypełniankę. Skoro dwa
 * komponenty mają wyglądać identycznie, przepis musi być jeden — inaczej
 * rozjadą się znowu przy pierwszej zmianie.
 *
 * Z CZEGO SIĘ SKŁADA — i po co każdy składnik:
 *   • MASKA — krycie rośnie od 10% na ogonie do 100% na czole. To jest ta
 *     „zanikająca" część: oko samo biegnie w stronę aktualnej wartości,
 *     zamiast widzieć jednolitą sztabę koloru. Bez tego pasek to naklejka.
 *   • REFLEKS — biel 14% przy górnej krawędzi, wygaszona do zera w 55%
 *     wysokości. Ten sam chwyt, co w szkle: światło pada z góry.
 *   • RANT — `inset 0 0 0 1px currentColor`. To on niesie kształt, nie
 *     wypełnienie; dlatego pasek czyta się nawet przy 2% wartości.
 *   • POŚWIATA — jeden miękki cień, celowo słaby (`-1px` rozlania), żeby
 *     czytać się jako światło, a nie jako neon. Poprzednia wersja suwaka
 *     miała trzy poświaty po `12–16px` i wyglądała jak pilot od telewizora.
 *
 * `color` na elemencie pozwala użyć `currentColor` w cieniu, więc kolor jest
 * podany DOKŁADNIE RAZ i nie ma jak się rozjechać między rantem a poświatą.
 */

/** Maska narastającego krycia — wspólna dla paska i suwaka. */
export const MASKA_NARASTANIA =
  'linear-gradient(90deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.30) 55%, rgba(0,0,0,0.75) 88%, rgba(0,0,0,1) 100%)';

/**
 * @param kolor  kolor stanu jako gotowy ciąg CSS (np. `hsl(var(--primary))`)
 * @param szerokosc  opcjonalna szerokość; suwak nie podaje, bo rozmiar
 *                   ustawia mu Radix przez `--radix-slider-*`
 */
export function wypelnieniePaska(
  kolor: string,
  szerokosc?: string,
): React.CSSProperties {
  return {
    ...(szerokosc ? { width: szerokosc } : {}),
    color: kolor,
    backgroundImage: [
      `linear-gradient(180deg, hsl(0 0% 100% / 0.14) 0%, hsl(0 0% 100% / 0) 55%)`,
      `linear-gradient(90deg, ${kolor} 0%, ${kolor} 100%)`,
    ].join(','),
    WebkitMaskImage: MASKA_NARASTANIA,
    maskImage: MASKA_NARASTANIA,
    boxShadow: `inset 0 0 0 1px currentColor, 0 0 8px -1px currentColor`,
  };
}

/**
 * Tor, po którym biegnie wypełnienie — również wspólny.
 * Wgłębienie, nie wypukłość: rzecz pusta idzie w głąb.
 */
export const TOR_PASKA: React.CSSProperties = {
  background: 'hsl(var(--foreground) / 0.05)',
  boxShadow: 'inset 0 0 0 1px hsl(var(--foreground) / 0.08)',
};
