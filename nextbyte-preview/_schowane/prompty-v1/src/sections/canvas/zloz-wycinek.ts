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

/** Obwiednia obiektu w wycinku, jako ułamek jego szerokości i wysokości. */
export interface Cel {
  szer: number
  wys: number
}

export interface WynikZlozenia {
  src: string
  /** współczynnik, o jaki obiekt został przeskalowany (1 = bez korekty) */
  skala: number
}

/** Tolerancja: w tych granicach rozmiar od modelu zostaje bez korekty. */
const TOLERANCJA_MIN = 0.85
const TOLERANCJA_MAKS = 1.18
/** Największa dopuszczalna korekta — poza nią obiekt i tak byłby nienaturalny. */
const KOREKTA_MIN = 0.35
const KOREKTA_MAKS = 2.5

function obwiednia(alfa: Float32Array, w: number, h: number, prog: number) {
  let x0 = w
  let y0 = h
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (alfa[y * w + x] > prog) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 }
}

/**
 * Składa wynik generacji wycinka z oryginałem. Zwraca pełny obraz w rozmiarze
 * oryginału albo `null`, gdy obszaru zmiany nie da się pewnie wyznaczyć.
 *
 * `cel` = rozmiar obiektu wyznaczony przez Gemini (ułamek wycinka). Model obrazu
 * potrafi zignorować rozmiar z promptu, więc obwiednię wygenerowanego obiektu
 * MIERZYMY i — gdy odbiega od celu — skalujemy sam obiekt (wraz z cieniem)
 * względem jego podstawy i składamy na oryginale.
 */
export async function zlozWycinek(
  oryginalSrc: string,
  wynikWycinkaSrc: string,
  r: Wycinek,
  cel?: Cel,
): Promise<WynikZlozenia | null> {
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
      for (let k = 0; k < 3; k++) d[i * 4 + k] = Math.min(255, Math.max(0, d[i * 4 + k] + przesuniecie[k]))
    }

    // pomiar obiektu (bez poszerzenia maski) i współczynnik korekty
    let skala = 1
    let kotwica = { x: 0, y: 0 }
    const alfaMiary = cel ? alfaZmiany(daneOrg as Piksele, daneWyn as Piksele, 0) : null
    const ob = alfaMiary ? obwiednia(alfaMiary, r.w, r.h, 0.7) : null
    if (cel && ob && ob.w > 8 && ob.h > 8) {
      const rSzer = (cel.szer * r.w) / ob.w
      const rWys = (cel.wys * r.h) / ob.h
      const s = Math.sqrt(rSzer * rWys)
      if (s < TOLERANCJA_MIN || s > TOLERANCJA_MAKS) skala = Math.min(KOREKTA_MAKS, Math.max(KOREKTA_MIN, s))
      kotwica = { x: (ob.x0 + ob.x1) / 2, y: ob.y1 }
      console.info('[canvas] skala obiektu', {
        zmierzone: `${Math.round((ob.w / r.w) * 100)}%×${Math.round((ob.h / r.h) * 100)}% wycinka`,
        cel: `${Math.round(cel.szer * 100)}%×${Math.round(cel.wys * 100)}%`,
        korekta: Number(skala.toFixed(2)),
      })
    }

    if (skala === 1) {
      for (let i = 0; i < alfa.length; i++) {
        const a = alfa[i]
        for (let k = 0; k < 3; k++) o[i * 4 + k] = o[i * 4 + k] * (1 - a) + d[i * 4 + k] * a
      }
      calosc.g.putImageData(daneOrg, r.x, r.y)
      return { src: calosc.c.toDataURL('image/jpeg', 0.95), skala }
    }

    // warstwa obiektu (RGB wyniku + alfa) skalowana względem podstawy obiektu
    const warstwa = plotno(r.w, r.h)
    const baza = plotno(r.w, r.h)
    if (!warstwa || !baza) return null
    const dane = new ImageData(new Uint8ClampedArray(d), r.w, r.h)
    for (let i = 0; i < alfa.length; i++) dane.data[i * 4 + 3] = Math.round(alfa[i] * 255)
    warstwa.g.putImageData(dane, 0, 0)
    baza.g.putImageData(daneOrg, 0, 0)
    baza.g.imageSmoothingQuality = 'high'
    baza.g.setTransform(skala, 0, 0, skala, kotwica.x * (1 - skala), kotwica.y * (1 - skala))
    baza.g.drawImage(warstwa.c, 0, 0)
    baza.g.setTransform(1, 0, 0, 1, 0, 0)
    calosc.g.drawImage(baza.c, r.x, r.y)
    return { src: calosc.c.toDataURL('image/jpeg', 0.95), skala }
  } catch {
    return null
  }
}
