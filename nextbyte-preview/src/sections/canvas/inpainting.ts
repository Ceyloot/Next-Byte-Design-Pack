import type { Pociagniecie } from './typy'

/**
 * Inpainting pędzlem.
 *
 * Użytkownik maluje jasnoniebieskim; do modelu idzie zdjęcie z TYM SAMYM obszarem zamalowanym magentą
 * w ~50% krycia (model „widzi” maskę, ale pod spodem prześwituje oryginał). Po generacji wynik wraca
 * TYLKO w obrębie maski (z miękką krawędzią) — poza nią piksele zostają oryginalne, więc reszta zdjęcia nie może się zmienić.
 */

function wczytaj(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const o = new Image()
    o.crossOrigin = 'anonymous'
    o.onload = () => resolve(o)
    o.onerror = () => reject(new Error('Nie udało się wczytać zdjęcia'))
    o.src = src
  })
}

function rysujMaske(g: CanvasRenderingContext2D, w: number, h: number, kreski: Pociagniecie[], kolor: string) {
  g.strokeStyle = kolor
  g.fillStyle = kolor
  g.lineCap = 'round'
  g.lineJoin = 'round'
  for (const k of kreski) {
    g.lineWidth = Math.max(2, k.srednica * w)
    g.beginPath()
    k.punkty.forEach(([x, y], i) => (i === 0 ? g.moveTo(x * w, y * h) : g.lineTo(x * w, y * h)))
    g.stroke()
  }
}

/** Zdjęcie z zamalowaną magentą (≈50%) maską — wejście dla modelu. */
export async function zlozZMaskaMagenta(src: string, kreski: Pociagniecie[]): Promise<string> {
  const o = await wczytaj(src)
  const w = o.naturalWidth
  const h = o.naturalHeight
  const maska = document.createElement('canvas')
  maska.width = w
  maska.height = h
  const gm = maska.getContext('2d')!
  rysujMaske(gm, w, h, kreski, '#ff00ff') // jedna warstwa pełna — nakładające się kreski nie ciemnieją podwójnie
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  g.drawImage(o, 0, 0, w, h)
  g.globalAlpha = 0.5
  g.drawImage(maska, 0, 0)
  return c.toDataURL('image/jpeg', 0.95)
}

/** Wynik modelu wklejony w maskę (z miękką krawędzią) na oryginał — poza maską zostaje oryginał. */
export async function wklejWMaske(oryginal: string, wynik: string, kreski: Pociagniecie[]): Promise<string> {
  const [o, r] = await Promise.all([wczytaj(oryginal), wczytaj(wynik)])
  const w = o.naturalWidth
  const h = o.naturalHeight
  const maska = document.createElement('canvas')
  maska.width = w
  maska.height = h
  const gm = maska.getContext('2d')!
  const miekko = Math.max(2, Math.round(Math.min(w, h) * 0.006))
  gm.filter = `blur(${miekko}px)`
  rysujMaske(gm, w, h, kreski, '#fff')
  gm.filter = 'none'
  // wynik przycięty maską
  const w2 = document.createElement('canvas')
  w2.width = w
  w2.height = h
  const g2 = w2.getContext('2d')!
  g2.drawImage(r, 0, 0, w, h)
  g2.globalCompositeOperation = 'destination-in'
  g2.drawImage(maska, 0, 0)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  g.drawImage(o, 0, 0, w, h)
  g.drawImage(w2, 0, 0)
  return c.toDataURL('image/jpeg', 0.95)
}

/** Prompt inpaintingu — krótki, ogólny: zmiana tylko w zamalowanym obszarze. */
export function promptInpaintingu(tekst: string): string {
  return `${tekst.trim()}

Image 1 has the area to edit painted over in semi-transparent magenta. Make the requested change ONLY inside the magenta-painted area and blend it naturally with its surroundings: same light, perspective, sharpness and grain. Remove the magenta paint completely. Everything outside the painted area stays exactly as it is.`
}
