/**
 * Formaty obrazu przyjmowane przez modele — wspólne dla serwera (proxy) i klienta.
 * Bez importów Vite/Node, żeby plik dało się wciągnąć do bundla przeglądarki.
 *
 * Listy pochodzą z komunikatów błędów Runware (zapytanie z celowo błędnym wymiarem zwraca listę obsługiwanych) i są ZWERYFIKOWANE per model
 * (7.10.2026). Nie ma jednej listy dla wszystkich: Lite i NB2 przyjmują formaty skrajne (8:1), Pro nie; formatu 672×1584 nie przyjmuje żaden
 * (jest tylko 1584×672) — wysokie zdjęcie (proporcja ok. 0,42) wybierało go i kończyło się błędem „Unsupported use of width/height parameters”.
 *
 * Inpainting wycina fragment zdjęcia dokładnie w proporcjach z tej listy, więc model oddaje kadr o tym samym układzie
 * i wynik wraca na swoje miejsce bez przycinania i przesunięć.
 */

/** Formaty ~1 Mpx przyjmowane przez Lite, NB2 i Pro (wspólny rdzeń). */
const WSPOLNE: [number, number][] = [
  [1024, 1024],
  [1264, 848], [848, 1264],
  [1200, 896], [896, 1200],
  [1152, 928], [928, 1152],
  [1376, 768], [768, 1376],
  [1584, 672],
]

/** Skrajne proporcje (8:1): tylko Lite i NB2 (Pro ich nie przyjmuje). */
const SKRAJNE: [number, number][] = [
  [2048, 512], [512, 2048],
  [3072, 384], [384, 3072],
]

/** Lista bezpieczna dla KAŻDEGO modelu Google — używa jej inpainting do kształtu wycinków. */
export const DOZWOLONE_FORMATY: [number, number][] = WSPOLNE

export type ModelDlaWymiarow = 'lite' | 'nb2' | 'pro' | 'gpt'

/** Formaty obsługiwane przez dany model (GPT Image: dowolne wielokrotności 16 do 3840 — te same pary są poprawne). */
export function formatyModelu(model: ModelDlaWymiarow): [number, number][] {
  return model === 'pro' ? WSPOLNE : [...WSPOLNE, ...SKRAJNE]
}

/**
 * Najbliższy dozwolony format do proporcji warstwy.
 *
 * Dobieramy po proporcji, nie po rozmiarze: pionowe zdjęcie 1453×2182
 * wysłane jako kwadrat wraca przycięte, a to najbardziej bolesny błąd,
 * bo wygląda na kaprys modelu, a nie na pomyłkę w żądaniu.
 */
export function dopasujWymiary(
  szerokosc: number,
  wysokosc: number,
  model: ModelDlaWymiarow = 'lite',
): { width: number; height: number } {
  const cel = szerokosc / wysokosc
  const [width, height] = formatyModelu(model).reduce((naj, para) =>
    Math.abs(para[0] / para[1] - cel) < Math.abs(naj[0] / naj[1] - cel) ? para : naj,
  )
  return { width, height }
}
