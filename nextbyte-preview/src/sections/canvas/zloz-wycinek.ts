/**
 * Generacja na wycinku — pewna pozycja obiektu.
 *
 * Model bez maski potrafi odsunąć obiekt o kilkanaście procent kadru od
 * pineski. Gdy dostaje tylko wycinek wokół miejsca zmiany, ten sam błąd
 * procentowy to kilka pikseli całego zdjęcia, a obiekt dostaje do tego więcej
 * pikseli (ostrzejsze szczegóły). Po generacji wycinek wraca w miejsce
 * wyłącznie tam, gdzie coś się zmieniło (`alfaZmiany`) — reszta zdjęcia
 * zostaje bit w bit oryginałem.
 *
 * Każdy krok zwraca `null` przy niepewności; wtedy wywołujący generuje
 * na pełnym kadrze jak dotąd.
 */
import { alfaZmiany, type Piksele } from './dopasuj-ziarno'

export interface Wycinek {
  x: number
  y: number
  w: number
  h: number
}

/** Punkty (0–1 względem zdjęcia), które muszą zmieścić się w wycinku. */
export interface PunktWzgledny {
  x: number
  y: number
}

const MIN_UDZIAL = 0.5
const MAKS_UDZIAL = 0.8
const MARGINES = 0.15

/**
 * Wycinek o proporcjach zdjęcia, wyśrodkowany na punktach zmiany
 * (przesunięty do środka kadru, gdy wychodziłby poza krawędź).
 * `null`, gdy wycinek objąłby prawie całe zdjęcie — wtedy nie ma po co.
 */
export function policzWycinek(szer: number, wys: number, punkty: PunktWzgledny[]): Wycinek | null {
  if (!punkty.length || szer < 64 || wys < 64) return null
  const xs = punkty.map(p => p.x * szer)
  const ys = punkty.map(p => p.y * wys)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const potrzebnaSzer = Math.max(
    (maxX - minX) + 2 * MARGINES * szer,
    ((maxY - minY) + 2 * MARGINES * wys) * (szer / wys),
  )
  const w = Math.max(MIN_UDZIAL * szer, potrzebnaSzer)
  if (w > MAKS_UDZIAL * szer) return null
  const h = (w * wys) / szer

  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const x = Math.min(Math.max(0, cx - w / 2), szer - w)
  const y = Math.min(Math.max(0, cy - h / 2), wys - h)
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) }
}

function wczytaj(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const obraz = new Image()
    obraz.crossOrigin = 'anonymous'
    obraz.onload = () => resolve(obraz)
    obraz.onerror = () => reject(new Error('Nie udało się wczytać obrazu'))
    obraz.src = src
  })
}

function plotno(w: number, h: number): { c: HTMLCanvasElement; g: CanvasRenderingContext2D } | null {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })
  return g ? { c, g } : null
}

/** Wycina prostokąt z oryginału (w jego naturalnej rozdzielczości) jako data URI. */
export async function wytnijWycinek(src: string, r: Wycinek): Promise<string | null> {
  try {
    const obraz = await wczytaj(src)
    const p = plotno(r.w, r.h)
    if (!p) return null
    p.g.drawImage(obraz, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h)
    return p.c.toDataURL('image/jpeg', 0.95)
  } catch {
    return null
  }
}

/**
 * Składa wynik generacji wycinka z oryginałem. Zwraca pełny obraz w rozmiarze
 * oryginału albo `null`, gdy obszaru zmiany nie da się pewnie wyznaczyć.
 */
export async function zlozWycinek(oryginalSrc: string, wynikWycinkaSrc: string, r: Wycinek): Promise<string | null> {
  try {
    const [oryginal, wynik] = await Promise.all([wczytaj(oryginalSrc), wczytaj(wynikWycinkaSrc)])
    const calosc = plotno(oryginal.naturalWidth, oryginal.naturalHeight)
    const wyc = plotno(r.w, r.h)
    if (!calosc || !wyc) return null
    calosc.g.drawImage(oryginal, 0, 0)

    // oryginalny wycinek i wynik rozciągnięty do tego samego rozmiaru
    const daneOrg = calosc.g.getImageData(r.x, r.y, r.w, r.h)
    wyc.g.drawImage(wynik, 0, 0, r.w, r.h)
    const daneWyn = wyc.g.getImageData(0, 0, r.w, r.h)

    const alfa = alfaZmiany(daneOrg as Piksele, daneWyn as Piksele)
    if (!alfa) return null

    // lokalne wyrównanie koloru: poza obiektem model lekko przesuwa ekspozycję i barwę
    const suma = [0, 0, 0]
    let n = 0
    const o = daneOrg.data
    const d = daneWyn.data
    for (let i = 0; i < alfa.length; i += 3) {
      if (alfa[i] > 0.02) continue
      for (let k = 0; k < 3; k++) suma[k] += o[i * 4 + k] - d[i * 4 + k]
      n++
    }
    const przesuniecie = n > 200 ? suma.map(s => s / n) : [0, 0, 0]

    for (let i = 0; i < alfa.length; i++) {
      const a = alfa[i]
      for (let k = 0; k < 3; k++) {
        const wyn = Math.min(255, Math.max(0, d[i * 4 + k] + przesuniecie[k]))
        o[i * 4 + k] = o[i * 4 + k] * (1 - a) + wyn * a
      }
    }
    calosc.g.putImageData(daneOrg, r.x, r.y)
    return calosc.c.toDataURL('image/jpeg', 0.95)
  } catch {
    return null
  }
}
