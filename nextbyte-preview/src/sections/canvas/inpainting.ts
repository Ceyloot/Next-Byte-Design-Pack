import type { Pociagniecie } from './typy'
import { konwertujNaDataUrl } from './typy'
import { generuj } from './dostawca'
import { DOZWOLONE_FORMATY } from './formaty-modelu'
import type { ZadanieGeneracji } from './runware-proxy'

/**
 * Inpainting pędzlem — CAŁKOWICIE oddzielony od generowania i od pinesek (żadnych wspólnych bricków ani promptów).
 *
 * Dlaczego wycinek, a nie cały kadr: gdy model dostaje całe zdjęcie z ledwo widocznym zaznaczeniem, rysuje obiekt
 * „gdzieś w scenie”, a maska potem przycina go do złego miejsca. Tu model dostaje FRAGMENT zdjęcia wokół
 * zaznaczenia (z kontekstem), w którym zamalowany obszar zajmuje sporą część kadru — nie ma gdzie się pomylić.
 * Wycinek ma proporcje z listy formatów modelu, więc kadr wraca 1:1 i trafia dokładnie na swoje miejsce.
 *
 * Przepływ: wycinek wokół maski → magenta w obrębie maski → model → CAŁY wygenerowany wycinek wstawiony na swoje
 * miejsce w oryginale (miękkie wtopienie brzegów wycinka). Wynik NIE jest przycinany maską — maska pilnuje tylko
 * miejsca i rozmiaru w prompcie, więc obiekt nigdy nie zostaje uciety krawędzią zaznaczenia.
 */

/** Krycie magenty na wejściu: wyraźna maska, a pod spodem nadal widać oryginał (potrzebny przy „zmień / usuń”). */
const KRYCIE_MAGENTY = 0.55
/** Kontekst wokół zaznaczenia: tyle razy większy od niego (w każdej osi). */
const KONTEKST = 2
/** … ale nie mniejszy niż ten ułamek krótszego boku zdjęcia (małe plamki dostają sensowne otoczenie). */
const MIN_KONTEKST = 0.28
/** Wycinek zajmujący więcej niż ten ułamek zdjęcia = bierzemy całe zdjęcie. */
const PROG_CALEGO = 0.8
/** Długi bok obrazu wysyłanego do modelu (małe wycinki powiększamy — model oddaje ok. 1 Mpx, więc detal się nie traci). */
const BOK_MIN = 768
const BOK_MAKS = 1536

/** Proporcje z listy modelu bez skrajnych (8:1 itp.) — do wycinków. */
const PROPORCJE = DOZWOLONE_FORMATY.map(([s, w]) => s / w).filter(p => p > 0.4 && p < 2.5)

interface Prostokat {
  x: number
  y: number
  w: number
  h: number
}

function wczytaj(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const o = new Image()
    o.crossOrigin = 'anonymous'
    o.onload = () => resolve(o)
    o.onerror = () => reject(new Error('Nie udało się wczytać zdjęcia'))
    o.src = src
  })
}

function nowePlotno(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  return { c, g: c.getContext('2d')! }
}

/** Rysuje kreski maski; `dx`/`dy` — przesunięcie (początek wycinka). */
function rysujMaske(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  kreski: Pociagniecie[],
  kolor: string,
  dx = 0,
  dy = 0,
) {
  g.strokeStyle = kolor
  g.fillStyle = kolor
  g.lineCap = 'round'
  g.lineJoin = 'round'
  for (const k of kreski) {
    g.lineWidth = Math.max(2, k.srednica * w)
    g.beginPath()
    k.punkty.forEach(([x, y], i) => (i === 0 ? g.moveTo(x * w - dx, y * h - dy) : g.lineTo(x * w - dx, y * h - dy)))
    g.stroke()
  }
}

/** Prostokąt obejmujący całą maskę (z promieniem pędzla), w pikselach zdjęcia. */
function obrysMaski(w: number, h: number, kreski: Pociagniecie[]) {
  let x0 = w
  let y0 = h
  let x1 = 0
  let y1 = 0
  for (const k of kreski) {
    const r = Math.max(2, k.srednica * w) / 2
    for (const [x, y] of k.punkty) {
      x0 = Math.min(x0, x * w - r)
      y0 = Math.min(y0, y * h - r)
      x1 = Math.max(x1, x * w + r)
      y1 = Math.max(y1, y * h + r)
    }
  }
  return { x0: Math.max(0, x0), y0: Math.max(0, y0), x1: Math.min(w, x1), y1: Math.min(h, y1) }
}

/**
 * Fragment zdjęcia wokół maski: kontekst ×2, proporcje z listy modelu, w granicach zdjęcia.
 * Gdy wycinek i tak zająłby prawie całe zdjęcie — całe zdjęcie.
 */
export function policzWycinekMaski(w: number, h: number, kreski: Pociagniecie[]): Prostokat {
  const calosc = { x: 0, y: 0, w, h }
  if (!kreski.length) return calosc
  const b = obrysMaski(w, h, kreski)
  const bw = Math.max(1, b.x1 - b.x0)
  const bh = Math.max(1, b.y1 - b.y0)
  const minBok = MIN_KONTEKST * Math.min(w, h)
  const ew = Math.max(bw * KONTEKST, minBok)
  const eh = Math.max(bh * KONTEKST, minBok)
  // proporcja z listy modelu najbliższa kształtowi kontekstu (w skali logarytmicznej)
  const proporcja = PROPORCJE.reduce((naj, p) => (Math.abs(Math.log(p / (ew / eh))) < Math.abs(Math.log(naj / (ew / eh))) ? p : naj))
  let cw = Math.max(ew, eh * proporcja)
  let ch = cw / proporcja
  const dopasuj = Math.min(1, w / cw, h / ch)
  cw *= dopasuj
  ch *= dopasuj
  // po dopasowaniu do zdjęcia maska musi nadal mieścić się z zapasem — inaczej całe zdjęcie
  if (cw < bw * 1.15 || ch < bh * 1.15 || (cw * ch) / (w * h) > PROG_CALEGO) return calosc
  const x = Math.min(w - cw, Math.max(0, (b.x0 + b.x1) / 2 - cw / 2))
  const y = Math.min(h - ch, Math.max(0, (b.y0 + b.y1) / 2 - ch / 2))
  return { x: Math.round(x), y: Math.round(y), w: Math.round(cw), h: Math.round(ch) }
}

/** Wycinek zdjęcia z zamalowaną magentą maską — jedyne wejście dla modelu. */
function zlozWejscie(o: HTMLImageElement, kreski: Pociagniecie[], wyc: Prostokat) {
  const w = o.naturalWidth
  const h = o.naturalHeight
  const dlugi = Math.max(wyc.w, wyc.h)
  const skala = Math.min(BOK_MAKS, Math.max(BOK_MIN, dlugi)) / dlugi
  const szer = Math.round(wyc.w * skala)
  const wys = Math.round(wyc.h * skala)
  const maska = nowePlotno(wyc.w, wyc.h)
  rysujMaske(maska.g, w, h, kreski, '#ff00ff', wyc.x, wyc.y) // jedna warstwa pełna — nakładające się kreski nie ciemnieją podwójnie
  const wej = nowePlotno(szer, wys)
  wej.g.drawImage(o, wyc.x, wyc.y, wyc.w, wyc.h, 0, 0, szer, wys)
  wej.g.globalAlpha = KRYCIE_MAGENTY
  wej.g.drawImage(maska.c, 0, 0, szer, wys)
  return { src: wej.c.toDataURL('image/jpeg', 0.95), szer, wys }
}

/** Wygenerowany wycinek wstawiony na swoje miejsce w oryginale; brzegi wycinka wtapiają się miękko (poza brzegami zdjęcia). */
async function wstawWycinek(o: HTMLImageElement, wynik: string, wyc: Prostokat): Promise<string> {
  const r = await wczytaj(wynik)
  const w = o.naturalWidth
  const h = o.naturalHeight

  // wynik w rozmiarze wycinka: te same proporcje = rozciągnięcie, inne = przycięcie „cover” (bez przesunięcia środka)
  const warstwa = nowePlotno(wyc.w, wyc.h)
  const zrodloP = r.naturalWidth / r.naturalHeight
  const celP = wyc.w / wyc.h
  if (Math.abs(zrodloP / celP - 1) < 0.06) {
    warstwa.g.drawImage(r, 0, 0, wyc.w, wyc.h)
  } else {
    const sw = zrodloP > celP ? r.naturalHeight * celP : r.naturalWidth
    const sh = zrodloP > celP ? r.naturalHeight : r.naturalWidth / celP
    warstwa.g.drawImage(r, (r.naturalWidth - sw) / 2, (r.naturalHeight - sh) / 2, sw, sh, 0, 0, wyc.w, wyc.h)
  }

  // wtopienie: prostokątna maska z rozmytym brzegiem; krawędź przylegająca do brzegu zdjęcia zostaje ostra
  const m = Math.max(6, Math.round(Math.min(wyc.w, wyc.h) * 0.05))
  const wolne = m * 4
  const lewo = wyc.x <= 0 ? -wolne : m
  const gora = wyc.y <= 0 ? -wolne : m
  const prawo = wyc.x + wyc.w >= w ? wyc.w + wolne : wyc.w - m
  const dol = wyc.y + wyc.h >= h ? wyc.h + wolne : wyc.h - m
  const maska = nowePlotno(wyc.w, wyc.h)
  maska.g.filter = `blur(${Math.round(m / 2)}px)`
  maska.g.fillStyle = '#fff'
  maska.g.fillRect(lewo, gora, prawo - lewo, dol - gora)
  maska.g.filter = 'none'
  warstwa.g.globalCompositeOperation = 'destination-in'
  warstwa.g.drawImage(maska.c, 0, 0)

  const koncowe = nowePlotno(w, h)
  koncowe.g.drawImage(o, 0, 0, w, h)
  koncowe.g.drawImage(warstwa.c, wyc.x, wyc.y)
  return koncowe.c.toDataURL('image/jpeg', 0.95)
}

/** Prompt inpaintingu — własny, niezależny od reszty Canvasa. */
export function promptInpaintingu(tekst: string): string {
  return `${tekst.trim()}

INPAINTING. Image 1 is a photograph with one region painted over in semi-transparent magenta. The magenta region marks WHERE the change goes and HOW BIG it is.
- Do the request above INSIDE the magenta region: create the new content right there. If the request is to remove something, fill the region with what would naturally be behind it. Never draw it anywhere else in the frame and never add copies of it elsewhere.
- FIT: the new content must fit COMPLETELY inside the magenta region — scale it so that every part of it, from one end to the other, lies within the painted shape with a small margin. Nothing may stick out past the edge of the painted area, be cut off by it or touch its border. The painted area is the maximum size.
- Everything outside the magenta region stays exactly as it is: same objects, positions, colours, framing and composition.
- Remove the magenta paint completely — no pink tint, outline or residue may remain.
- Make the new content continue its surroundings seamlessly: same light direction and colour, perspective, sharpness, noise and grain, with natural contact shadows and reflections.
- Return the full frame with the same framing and aspect ratio as Image 1.`
}

export interface ZadanieInpaintingu {
  /** zdjęcie do edycji (adres lub data URI) */
  src: string
  kreski: Pociagniecie[]
  tekst: string
  model?: ZadanieGeneracji['model']
}

export interface WynikInpaintingu {
  obrazUrl: string
  kosztUSD: number
  model: string
}

/** Cały inpainting: jedna generacja na wycinku wokół maski, wygenerowany wycinek wstawiony w oryginał (rozdzielczość oryginału). */
export async function wykonajInpainting({ src, kreski, tekst, model }: ZadanieInpaintingu): Promise<WynikInpaintingu> {
  if (!kreski.length) throw new Error('Zamaluj obszar do zmiany')
  const zrodlo = await konwertujNaDataUrl(src)
  const o = await wczytaj(zrodlo)
  const wyc = policzWycinekMaski(o.naturalWidth, o.naturalHeight, kreski)
  const wejscie = zlozWejscie(o, kreski, wyc)
  const wynik = await generuj({
    polecenie: promptInpaintingu(tekst),
    obrazy: [wejscie.src],
    szerokosc: wejscie.szer,
    wysokosc: wejscie.wys,
    model,
    studio: true,
  })
  const obrazUrl = await wstawWycinek(o, wynik.obrazUrl, wyc)
  return { obrazUrl, kosztUSD: wynik.kosztUSD, model: wynik.model }
}
