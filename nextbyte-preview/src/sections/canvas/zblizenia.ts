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
import type { Pineska, Warstwa } from './typy'

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

/** Zbliżenie RZECZY pod pinem: ramka od Gemini → wycinek z oryginału. null, gdy rzecz wypełnia całe okno albo analiza zawiodła. */
export async function zblizenieRzeczy(src: string, x: number, y: number): Promise<string | null> {
  const o = await wczytaj(src)
  if (!o) return null
  const okno = oknoKwadratowe(o, x, y, 0.5)
  if (!okno) return null
  const { box } = await opiszRzeczZRamka(okno.src)
  if (!box) return null
  const r = naPiksele(okno, box)
  const wypelnienie = Math.max(r.x1 - r.x0, r.y1 - r.y0) / okno.bok
  if (wypelnienie > 0.8 || wypelnienie < 0.02) return null
  return wytnijZOryginalu(o, r, 0.25)
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
