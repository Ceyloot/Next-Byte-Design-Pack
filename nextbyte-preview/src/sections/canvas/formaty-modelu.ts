/**
 * Formaty obrazu przyjmowane przez model (Nano Banana) — wspólne dla serwera (proxy) i klienta.
 * Bez importów Vite/Node, żeby plik dało się wciągnąć do bundla przeglądarki.
 *
 * Inpainting wycina fragment zdjęcia dokładnie w proporcjach z tej listy, więc model oddaje kadr
 * o tym samym układzie i wynik wraca na swoje miejsce bez przycinania i przesunięć.
 */

/** Nano Banana nie przyjmuje dowolnych wymiarów — tylko tę listę par (zwrócił ją sam model w komunikacie błędu). */
export const DOZWOLONE_FORMATY: [number, number][] = [
  [1024, 1024],
  [1264, 848], [848, 1264],
  [1200, 896], [896, 1200],
  [1152, 928], [928, 1152],
  [1376, 768], [768, 1376],
  [1584, 672], [672, 1584],
  [2048, 512], [512, 2048],
  [3072, 384], [384, 3072],
]

/**
 * Najbliższy dozwolony format do proporcji warstwy.
 *
 * Dobieramy po proporcji, nie po rozmiarze: pionowe zdjęcie 1453×2182
 * wysłane jako kwadrat wraca przycięte, a to najbardziej bolesny błąd,
 * bo wygląda na kaprys modelu, a nie na pomyłkę w żądaniu.
 */
export function dopasujWymiary(szerokosc: number, wysokosc: number): { width: number; height: number } {
  const cel = szerokosc / wysokosc
  const [width, height] = DOZWOLONE_FORMATY.reduce((naj, para) =>
    Math.abs(para[0] / para[1] - cel) < Math.abs(naj[0] / naj[1] - cel) ? para : naj,
  )
  return { width, height }
}
