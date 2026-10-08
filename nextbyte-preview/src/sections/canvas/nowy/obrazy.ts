import type { Ramka } from './agent'

/**
 * Wycinanie osoby / twarzy / rzeczy z referencji wg ramki od agenta (skala 0–1000).
 * Po co: model dostający całe zdjęcie (np. selfie w windzie, twarz 5% kadru) nie ma z czego skopiować tożsamości i kopiuje tło oraz kadr.
 * Wycinek zawiera tylko to, co ma przejść do sceny. Małe wycinki powiększamy (więcej pikseli do „zobaczenia” przez model).
 */

const wczytaj = (src: string) =>
  new Promise<HTMLImageElement | null>(resolve => {
    const o = new Image()
    o.crossOrigin = 'anonymous'
    o.onload = () => resolve(o)
    o.onerror = () => resolve(null)
    o.src = src
  })

/**
 * @param margines ułamek rozmiaru ramki dodany z każdej strony (osoba 0.08, twarz 0.35 — z włosami, uszami i szyją)
 * @param celBok  najkrótszy żądany dłuższy bok wyniku (px); mniejsze wycinki powiększamy do tej wielkości
 */
export async function wytnijRamke(src: string, ramka: Ramka, margines: number, celBok = 768): Promise<string | null> {
  const o = await wczytaj(src)
  if (!o) return null
  const W = o.naturalWidth
  const H = o.naturalHeight
  const [ymin, xmin, ymax, xmax] = ramka
  const bw = ((xmax - xmin) / 1000) * W
  const bh = ((ymax - ymin) / 1000) * H
  const x0 = Math.max(0, (xmin / 1000) * W - bw * margines)
  const y0 = Math.max(0, (ymin / 1000) * H - bh * margines)
  const x1 = Math.min(W, (xmax / 1000) * W + bw * margines)
  const y1 = Math.min(H, (ymax / 1000) * H + bh * margines)
  const sw = x1 - x0
  const sh = y1 - y0
  if (sw < 24 || sh < 24) return null
  const dluzszy = Math.max(sw, sh)
  const skala = Math.min(1280 / dluzszy, Math.max(1, celBok / dluzszy))
  const c = document.createElement('canvas')
  c.width = Math.round(sw * skala)
  c.height = Math.round(sh * skala)
  const g = c.getContext('2d')
  if (!g) return null
  g.imageSmoothingEnabled = true
  g.imageSmoothingQuality = 'high'
  g.drawImage(o, x0, y0, sw, sh, 0, 0, c.width, c.height)
  try {
    return c.toDataURL('image/png')
  } catch {
    return null
  }
}

/**
 * MASKA UKŁADU (nie zdjęcie): czarne tło tego samego formatu co baza, biały dysk = miejsce, w którym ma stanąć obiekt
 * (środek = punkt styku z podłożem, średnica = najdłuższy bok obiektu z obliczonej skali). Szary dysk (przesunięcie) = skąd rzecz znika.
 * Wcześniejszy pierścień rysowany na kopii zdjęcia bywał kopiowany do wyniku (Lite) — maska nie jest fotografią, więc nie ma czego przenieść.
 */
export async function narysujMaskeUkladu(
  src: string,
  cel: { x: number; y: number; srednicaPx: number },
  zrodlo?: { x: number; y: number; srednicaPx: number },
): Promise<string | null> {
  const o = await wczytaj(src)
  if (!o) return null
  const k = Math.min(1, 1024 / Math.max(o.naturalWidth, o.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.round(o.naturalWidth * k)
  c.height = Math.round(o.naturalHeight * k)
  const g = c.getContext('2d')
  if (!g) return null
  g.fillStyle = '#000'
  g.fillRect(0, 0, c.width, c.height)
  const dysk = (p: { x: number; y: number; srednicaPx: number }, kolor: string) => {
    g.fillStyle = kolor
    g.beginPath()
    g.arc(p.x * c.width, p.y * c.height, Math.max(8, (p.srednicaPx * k) / 2), 0, Math.PI * 2)
    g.fill()
  }
  if (zrodlo) dysk(zrodlo, '#808080')
  dysk(cel, '#ffffff')
  try {
    return c.toDataURL('image/png')
  } catch {
    return null
  }
}
