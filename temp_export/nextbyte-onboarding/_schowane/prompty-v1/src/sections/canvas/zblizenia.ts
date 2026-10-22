/**
 * Inteligentne zbliżenia w pobliżu pinezki — dodatkowe obrazy dla modelu: ta sama fotografia powiększona tam,
 * gdzie leży rzecz albo miejsce, żeby model widział szczegóły (kształt, materiał, twarz, grunt) w pełnej rozdzielczości.
 *
 * Inteligencja: rozmiar i położenie wycinka NIE są stałe — Gemini podaje ciasną ramkę rzeczy pod pinem, a wycinek
 * jest brany z ORYGINAŁU (nie z miniatury) z marginesem proporcjonalnym do rozmiaru rzeczy; gdy rzecz wypełnia
 * całe okno, zbliżenie nic nie wnosi i jest pomijane. Zbliżenie obszaru docelowego ma szerokość proporcjonalną
 * do zmierzonego rozmiaru obiektu, który tam stanie.
 */
import { opiszOsobeSzczegolowo, opiszRzeczZRamka } from './dostawca'
import type { Pineska, RamkaObiektu, Warstwa } from './typy'

export interface Zblizenie {
  src: string
  /** opis dla modelu (EN) — po „Image N = …” */
  opis: string
}

const wczytaj = (src: string) =>
  new Promise<HTMLImageElement | null>(resolve => {
    const o = new Image()
    o.crossOrigin = 'anonymous'
    o.onload = () => resolve(o)
    o.onerror = () => resolve(null)
    o.src = src
  })

interface Okno {
  /** wycinek do analizy (data URI) */
  src: string
  /** położenie okna w pikselach oryginału */
  sx: number
  sy: number
  bok: number
}

function oknoKwadratowe(o: HTMLImageElement, x: number, y: number, udzial: number, bokWyjsciowy = 1024): Okno | null {
  const bok = Math.max(48, Math.min(o.naturalWidth, o.naturalHeight) * udzial)
  const sx = Math.max(0, Math.min(o.naturalWidth - bok, o.naturalWidth * x - bok / 2))
  const sy = Math.max(0, Math.min(o.naturalHeight - bok, o.naturalHeight * y - bok / 2))
  const c = document.createElement('canvas')
  c.width = c.height = Math.round(Math.min(bokWyjsciowy, bok))
  const g = c.getContext('2d')
  if (!g) return null
  g.drawImage(o, sx, sy, bok, bok, 0, 0, c.width, c.height)
  return { src: c.toDataURL('image/jpeg', 0.92), sx, sy, bok }
}

/** Wycina z ORYGINAŁU prostokąt (px) z marginesem i skaluje tak, by dłuższy bok ≤ bokMaks. */
function wytnijZOryginalu(o: HTMLImageElement, r: { x0: number; y0: number; x1: number; y1: number }, margines: number, bokMaks = 1024): string | null {
  const dw = (r.x1 - r.x0) * margines
  const dh = (r.y1 - r.y0) * margines
  const x0 = Math.max(0, r.x0 - dw)
  const y0 = Math.max(0, r.y0 - dh)
  const x1 = Math.min(o.naturalWidth, r.x1 + dw)
  const y1 = Math.min(o.naturalHeight, r.y1 + dh)
  const sw = x1 - x0
  const sh = y1 - y0
  if (sw < 48 || sh < 48) return null
  const skala = Math.min(1, bokMaks / Math.max(sw, sh))
  const c = document.createElement('canvas')
  c.width = Math.round(sw * skala)
  c.height = Math.round(sh * skala)
  const g = c.getContext('2d')
  if (!g) return null
  g.drawImage(o, x0, y0, sw, sh, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.95)
}

const naPiksele = (okno: Okno, box: [number, number, number, number]) => ({
  x0: okno.sx + (Math.min(box[1], box[3]) / 1000) * okno.bok,
  x1: okno.sx + (Math.max(box[1], box[3]) / 1000) * okno.bok,
  y0: okno.sy + (Math.min(box[0], box[2]) / 1000) * okno.bok,
  y1: okno.sy + (Math.max(box[0], box[2]) / 1000) * okno.bok,
})

/** Ramka rzeczy pod pinem (px oryginału) z Gemini; null, gdy analiza zawiodła albo rzecz jest pomijalnie mała. */
async function znajdzRamkeRzeczy(
  o: HTMLImageElement,
  x: number,
  y: number,
): Promise<{ r: { x0: number; y0: number; x1: number; y1: number }; wypelnienie: number } | null> {
  const okno = oknoKwadratowe(o, x, y, 0.5)
  if (!okno) return null
  const { box } = await opiszRzeczZRamka(okno.src)
  if (!box) return null
  let r = naPiksele(okno, box)
  let wypelnienie = Math.max(r.x1 - r.x0, r.y1 - r.y0) / okno.bok
  if (wypelnienie < 0.02) return null
  // Pinezka musi leżeć wewnątrz (lub tuż przy) ramki — inaczej Gemini wskazał sąsiedni obiekt
  const px = x * o.naturalWidth
  const py = y * o.naturalHeight
  const luzx = Math.max(6, (r.x1 - r.x0) * 0.08)
  const luzy = Math.max(6, (r.y1 - r.y0) * 0.08)
  const wRamce = (b: { x0: number; y0: number; x1: number; y1: number }) => px >= b.x0 - luzx && px <= b.x1 + luzx && py >= b.y0 - luzy && py <= b.y1 + luzy
  if (!wRamce(r)) return null
  // Mała rzecz w dużym oknie (np. odległy domek): ramka bywa nieprecyzyjna i łapie sąsiada — drugie, ciaśniejsze
  // przejście: okno ~4× rozmiar rzeczy wokół jej środka daje dokładniejszą ramkę.
  if (wypelnienie < 0.15) {
    const cx = (r.x0 + r.x1) / 2
    const cy = (r.y0 + r.y1) / 2
    const bok2 = Math.max(96, 4 * Math.max(r.x1 - r.x0, r.y1 - r.y0))
    const okno2 = oknoKwadratowe(o, cx / o.naturalWidth, cy / o.naturalHeight, Math.min(1, bok2 / Math.min(o.naturalWidth, o.naturalHeight)))
    if (okno2) {
      const drugie = await opiszRzeczZRamka(okno2.src)
      if (drugie.box) {
        const r2 = naPiksele(okno2, drugie.box)
        const w2 = Math.max(r2.x1 - r2.x0, r2.y1 - r2.y0) / okno2.bok
        // przyjmujemy ramkę z drugiego przejścia, gdy ma sensowny rozmiar względem okna
        if (w2 >= 0.1 && w2 <= 0.9 && wRamce(r2)) {
          r = r2
          wypelnienie = w2
        }
      }
    }
  }
  return { r, wypelnienie }
}

/** Zbliżenie RZECZY pod pinem: ramka od Gemini → wycinek z oryginału. null, gdy rzecz wypełnia całe okno albo analiza zawiodła. */
export async function zblizenieRzeczy(src: string, x: number, y: number): Promise<string | null> {
  const o = await wczytaj(src)
  if (!o) return null
  const znaleziona = await znajdzRamkeRzeczy(o, x, y)
  if (!znaleziona || znaleziona.wypelnienie > 0.8) return null
  return wytnijZOryginalu(o, znaleziona.r, 0.25)
}

/**
 * Ramka CAŁEJ rzeczy pod pinem, w ułamkach kadru (0–1) — do podglądu przy pineskach.
 * Pineska bywa wbita w skrawek (maska auta), a podgląd ma pokazać cały obiekt, nie ten skrawek.
 * Zwraca null, gdy ramki nie da się ustalić — wtedy podgląd zostaje szerokim kadrem wokół pinu.
 */
export async function ramkaRzeczyPodPinem(src: string, x: number, y: number): Promise<RamkaObiektu | null> {
  const o = await wczytaj(src)
  if (!o) return null
  const znaleziona = await znajdzRamkeRzeczy(o, x, y)
  if (!znaleziona) return null
  const { r } = znaleziona
  return {
    x0: r.x0 / o.naturalWidth,
    y0: r.y0 / o.naturalHeight,
    x1: r.x1 / o.naturalWidth,
    y1: r.y1 / o.naturalHeight,
  }
}

/** Zbliżenie OBSZARU wokół pinu: szerokość proporcjonalna do zmierzonego rozmiaru obiektu (ułamek szerokości kadru). */
export async function zblizenieObszaru(src: string, x: number, y: number, szerokoscObiektu?: number): Promise<string | null> {
  const o = await wczytaj(src)
  if (!o) return null
  const min = Math.min(o.naturalWidth, o.naturalHeight)
  const bok = Math.max(0.15 * min, Math.min(0.5 * min, szerokoscObiektu ? 3.5 * szerokoscObiektu * o.naturalWidth : 0.3 * min))
  const okno = oknoKwadratowe(o, x, y, bok / min)
  return okno ? okno.src : null
}

/** Zbliżenie TWARZY osoby pod pinem (ramka twarzy od Gemini). */
export async function zblizenieTwarzyPodPinem(src: string, x: number, y: number): Promise<string | null> {
  const o = await wczytaj(src)
  if (!o) return null
  const okno = oknoKwadratowe(o, x, y, 0.6)
  if (!okno) return null
  const { twarz } = await opiszOsobeSzczegolowo(okno.src)
  if (!twarz) return null
  return wytnijZOryginalu(o, naPiksele(okno, twarz), 0.35, 768)
}

export interface WejscieZblizen {
  /** operacja z reżysera (id operacji z rejestru promptów) */
  operacja: string
  czesc?: string
  cecha?: string
  pinZrodlowy?: Pineska
  pinDocelowy?: Pineska
  /** warstwy: zdjęcie docelowe i zdjęcie pinu źródłowego */
  warstwaCelu: Warstwa
  warstwaZrodla?: Warstwa
  /** zmierzona szerokość obiektu w miejscu docelowym (ułamek szerokości kadru) */
  szerokoscObiektu?: number
}

const WSTAWIANIE = ['object_transfer', 'addition', 'character_transfer']

/** Dobiera zbliżenia do trybu; każde z osobna może się nie udać (wtedy go brak). */
export async function zbudujZblizenia(w: WejscieZblizen): Promise<Zblizenie[]> {
  const zadania: Promise<Zblizenie | null>[] = []
  const nrZdjecia = (l?: Warstwa) => (l ? `of its photograph` : '')
  void nrZdjecia
  const dodaj = (p: Promise<string | null>, opis: string) =>
    zadania.push(p.then(src => (src ? { src, opis } : null)).catch(() => null))

  if (w.operacja === 'background_change') {
    if (w.pinZrodlowy && w.warstwaZrodla) {
      dodaj(zblizenieObszaru(w.warstwaZrodla.src, w.pinZrodlowy.normalizedX, w.pinZrodlowy.normalizedY), 'a close-up of the new place around the marked spot of the reference — only to show its real surfaces, vegetation and light in detail')
    }
  } else if (w.operacja === 'face_swap') {
    if (w.pinZrodlowy && w.warstwaZrodla) {
      dodaj(zblizenieTwarzyPodPinem(w.warstwaZrodla.src, w.pinZrodlowy.normalizedX, w.pinZrodlowy.normalizedY), 'a close-up of the FACE to carry over, from the reference — identity reference: reproduce exactly this face, feature by feature')
    }
    if (w.pinDocelowy) {
      dodaj(zblizenieTwarzyPodPinem(w.warstwaCelu.src, w.pinDocelowy.normalizedX, w.pinDocelowy.normalizedY), 'a close-up of the face to be replaced in Image 1 — its pose, angle, light and expression are kept')
    }
  } else {
    // źródło: rzecz, która przychodzi / jest przenoszona / dostarcza część
    if (w.pinZrodlowy) {
      const zrodlowa = w.warstwaZrodla ?? w.warstwaCelu
      const co = w.czesc ? `the ${w.czesc} to copy` : WSTAWIANIE.includes(w.operacja) ? 'the thing to bring' : 'the thing to put in'
      dodaj(zblizenieRzeczy(zrodlowa.src, w.pinZrodlowy.normalizedX, w.pinZrodlowy.normalizedY), `a close-up of ${co}, enlarged around its pin — only to show its exact shape, material and details`)
    }
    // cel: miejsce do wstawienia (obszar) albo rzecz do zmiany / usunięcia (zbliżenie rzeczy)
    if (w.pinDocelowy) {
      const wstawianie = WSTAWIANIE.includes(w.operacja) && !w.czesc && !w.cecha
      if (wstawianie) {
        dodaj(zblizenieObszaru(w.warstwaCelu.src, w.pinDocelowy.normalizedX, w.pinDocelowy.normalizedY, w.szerokoscObiektu), 'a close-up of the area around the destination in Image 1 — only to judge the real ground, scale, perspective and light there')
      } else if (w.operacja !== 'background_change') {
        dodaj(zblizenieRzeczy(w.warstwaCelu.src, w.pinDocelowy.normalizedX, w.pinDocelowy.normalizedY), 'a close-up of the thing that is changed in Image 1, enlarged around its pin — only to show its exact current state')
      }
    }
  }
  const wyniki = await Promise.all(zadania)
  return wyniki.filter((z): z is Zblizenie => Boolean(z))
}

/**
 * Referencja obiektu do wstawienia z innego zdjęcia: ciasny wycinek wokół rzeczy pod pinem (ramka od Gemini), a nie całe zdjęcie.
 * Przy pełnym kadrze (np. auto na całą szerokość) model uznawał rozmiar z referencji za docelowy i rysował obiekt ok. 2× za duży (test F3).
 * Okno jest dopełnione szarością tak, by pin leżał w środku — ramka dotyczy rzeczy pod pinem, nawet gdy jest większa niż kwadrat wokół niego.
 * Zwraca wycinek i jego położenie w pikselach oryginału (do przeliczenia pinezki), albo null, gdy się nie uda.
 */
export async function referencjaWokolRzeczy(
  src: string,
  x: number,
  y: number,
): Promise<{ src: string; x0: number; y0: number; w: number; h: number } | null> {
  const o = await wczytaj(src)
  if (!o) return null
  const W = o.naturalWidth
  const H = o.naturalHeight
  const Wp = 2 * Math.max(x, 1 - x) * W
  const Hp = 2 * Math.max(y, 1 - y) * H
  const sc = Math.min(1, 1024 / Math.max(Wp, Hp))
  const c = document.createElement('canvas')
  c.width = Math.max(64, Math.round(Wp * sc))
  c.height = Math.max(64, Math.round(Hp * sc))
  const g = c.getContext('2d')
  if (!g) return null
  g.fillStyle = '#808080'
  g.fillRect(0, 0, c.width, c.height)
  const ox = (Wp / 2 - x * W) * sc
  const oy = (Hp / 2 - y * H) * sc
  g.drawImage(o, ox, oy, W * sc, H * sc)
  const { box } = await opiszRzeczZRamka(c.toDataURL('image/jpeg', 0.92))
  if (!box) return null
  const px = (v: number, wymiar: number, przes: number) => (((v / 1000) * wymiar - przes) / sc)
  const x0 = Math.max(0, px(Math.min(box[1], box[3]), c.width, ox))
  const x1 = Math.min(W, px(Math.max(box[1], box[3]), c.width, ox))
  const y0 = Math.max(0, px(Math.min(box[0], box[2]), c.height, oy))
  const y1 = Math.min(H, px(Math.max(box[0], box[2]), c.height, oy))
  if (x1 - x0 < W * 0.03 || y1 - y0 < H * 0.03) return null
  const dw = (x1 - x0) * 0.1
  const dh = (y1 - y0) * 0.1
  const cx0 = Math.max(0, x0 - dw)
  const cy0 = Math.max(0, y0 - dh)
  const cx1 = Math.min(W, x1 + dw)
  const cy1 = Math.min(H, y1 + dh)
  const out = document.createElement('canvas')
  const sk = Math.min(1, 1280 / Math.max(cx1 - cx0, cy1 - cy0))
  out.width = Math.round((cx1 - cx0) * sk)
  out.height = Math.round((cy1 - cy0) * sk)
  const go = out.getContext('2d')
  if (!go) return null
  go.drawImage(o, cx0, cy0, cx1 - cx0, cy1 - cy0, 0, 0, out.width, out.height)
  return { src: out.toDataURL('image/jpeg', 0.95), x0: cx0, y0: cy0, w: cx1 - cx0, h: cy1 - cy0 }
}
