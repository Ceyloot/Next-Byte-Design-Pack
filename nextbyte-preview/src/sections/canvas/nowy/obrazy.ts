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
    return c.toDataURL('image/jpeg', 0.95)
  } catch {
    return null
  }
}

/**
 * PRZEWODNIK MIEJSCA: kopia zdjęcia bazowego z cienkim czerwonym pierścieniem w miejscu wstawienia.
 * Środek pierścienia = punkt styku obiektu z podłożem, średnica = najdłuższy bok obiektu (z obliczonej skali).
 * Badania nad kontrolą rozmiaru i położenia (ramki / maski) pokazują, że wskazanie wizualne działa dużo pewniej niż współrzędne w tekście.
 */
export async function narysujPrzewodnik(src: string, x: number, y: number, srednicaPx: number): Promise<string | null> {
  const o = await wczytaj(src)
  if (!o) return null
  const k = Math.min(1, 1600 / Math.max(o.naturalWidth, o.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.round(o.naturalWidth * k)
  c.height = Math.round(o.naturalHeight * k)
  const g = c.getContext('2d')
  if (!g) return null
  g.drawImage(o, 0, 0, c.width, c.height)
  const cx = x * c.width
  const cy = y * c.height
  const r = Math.max(12, (srednicaPx * k) / 2)
  g.lineWidth = Math.max(3, c.width / 300)
  g.strokeStyle = '#ff1a1a'
  g.beginPath()
  g.arc(cx, cy, r, 0, Math.PI * 2)
  g.stroke()
  g.beginPath()
  g.moveTo(cx - 8, cy)
  g.lineTo(cx + 8, cy)
  g.moveTo(cx, cy - 8)
  g.lineTo(cx, cy + 8)
  g.stroke()
  try {
    return c.toDataURL('image/jpeg', 0.92)
  } catch {
    return null
  }
}
