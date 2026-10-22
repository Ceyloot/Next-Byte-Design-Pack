import { generuj } from './dostawca'
import type { ZadanieGeneracji } from './runware-proxy'

/**
 * Generowanie obrazu z opisu (pusta ramka „Image Generator”) — proste i samodzielne:
 * sam opis użytkownika, bez zdjęć wejściowych, pinesek, bricków i reguł. Niezależne od inpaintingu.
 */

export interface WynikGenerowania {
  obrazUrl: string
  /** rzeczywiste wymiary zwróconego obrazu */
  szerokosc: number
  wysokosc: number
  kosztUSD: number
  model: string
}

export async function wykonajGenerowanie(
  tekst: string,
  szerokosc: number,
  wysokosc: number,
  model?: ZadanieGeneracji['model'],
): Promise<WynikGenerowania> {
  const w = await generuj({ polecenie: tekst.trim(), obrazy: [], szerokosc, wysokosc, model })
  const obraz = await new Promise<HTMLImageElement>((ok, err) => {
    const o = new Image()
    o.onload = () => ok(o)
    o.onerror = () => err(new Error('Nie udało się wczytać wyniku'))
    o.src = w.obrazUrl
  })
  return { obrazUrl: w.obrazUrl, szerokosc: obraz.width, wysokosc: obraz.height, kosztUSD: w.kosztUSD, model: w.model }
}
