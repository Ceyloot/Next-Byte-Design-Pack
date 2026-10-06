import { generuj } from './dostawca'
import type { ZadanieGeneracji } from './runware-proxy'

/**
 * Generowanie z wieloma referencjami — bez pinesek. Użytkownik zaznacza kilka zdjęć na płótnie (Shift+klik, ramka,
 * Ctrl+A) i opisuje wynik: wszystkie zaznaczone idą do modelu jako ponumerowane referencje (Image 1…N, w kolejności
 * na płótnie). Osobny tor, niezależny od pinesek, inpaintu i zwykłej generacji.
 */

/** Tyle referencji przyjmuje Nano Banana (Gemini) w jednym żądaniu. */
export const MAKS_REFERENCJI = 14

export function promptReferencji(tekst: string, n: number): string {
  return `${tekst.trim()}

REFERENCES. You are given ${n} reference images, numbered Image 1 … Image ${n} in the order provided. The instruction above may point at them by number ("zdjęcie 1", "image 2", "pierwsze") or by what they show. Use each reference for exactly what the instruction asks of it (a person, an object, a place, a style, colours) and keep whatever is taken from a reference faithful to it — same identity, shape, colour and detail. Produce ONE new photograph as the result: a single coherent, natural-looking image with consistent light direction, perspective, scale, shadows and grain. Do not output a collage, grid or side-by-side comparison unless the instruction explicitly asks for one.`
}

export interface ZadanieReferencji {
  /** zdjęcia jako data URI, w kolejności numeracji Image 1…N */
  obrazy: string[]
  tekst: string
  /** proporcje wyniku (zwykle pierwszego zdjęcia) */
  szerokosc: number
  wysokosc: number
  model?: ZadanieGeneracji['model']
}

export async function wykonajGeneracjeZReferencji({ obrazy, tekst, szerokosc, wysokosc, model }: ZadanieReferencji) {
  if (obrazy.length < 2) throw new Error('Zaznacz co najmniej dwa zdjęcia jako referencje')
  if (obrazy.length > MAKS_REFERENCJI) throw new Error(`Model przyjmuje najwyżej ${MAKS_REFERENCJI} referencji naraz — odznacz część zdjęć`)
  return generuj({ polecenie: promptReferencji(tekst, obrazy.length), obrazy, szerokosc, wysokosc, model })
}
