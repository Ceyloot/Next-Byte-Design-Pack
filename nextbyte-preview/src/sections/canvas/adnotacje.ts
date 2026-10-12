/**
 * Adnotacje → edycja: użytkownik rysuje na zdjęciu (zakresy pisakiem, kreski, napisy z klawiatury lub odręczne),
 * a model dostaje czyste zdjęcie (Image 1) i to samo zdjęcie z naniesionymi adnotacjami (Image 2) jako plan zmian.
 */
import type { Rysunek, Warstwa } from './typy'
import { dopasujWymiary } from './formaty-modelu'
import { konwertujNaDataUrl } from './typy'

/** Kolor, którym rysujemy „domyślne” kreski: na planie zmian ma być wyraźnie czerwony, na białym szkicu — ciemny. */
export type KolorAuto = '#ef4444' | '#111111'

const KROJ = '700 {px}px Inter, system-ui, sans-serif'

/** Szerokość napisu w jednostkach sceny (przybliżona — wystarcza do ramki zaznaczenia i trafiania kliknięciem). */
export const szerokoscNapisu = (tekst: string, rozmiar: number) => Math.max(rozmiar, tekst.length * rozmiar * 0.58)

/** Rysuje adnotacje na płótnie 2D. `mapuj` zamienia współrzędne sceny na piksele płótna, `k` skaluje grubości. */
export function rysujRysunki(
  g: CanvasRenderingContext2D,
  rysunki: Rysunek[],
  mapuj: (x: number, y: number) => [number, number],
  k: number,
  kolorAuto: KolorAuto,
) {
  g.lineCap = 'round'
  g.lineJoin = 'round'
  for (const r of rysunki) {
    const kolor = r.kolor === 'auto' ? kolorAuto : r.kolor
    if (r.tekst) {
      const px = Math.max(10, r.grubosc * k)
      const [x, y] = mapuj(r.punkty[0][0], r.punkty[0][1])
      g.font = KROJ.replace('{px}', String(px))
      g.textBaseline = 'middle'
      g.lineWidth = px / 5
      g.strokeStyle = 'rgba(255,255,255,0.9)'
      g.strokeText(r.tekst, x, y)
      g.fillStyle = kolor
      g.fillText(r.tekst, x, y)
      continue
    }
    g.save()
    g.globalAlpha = r.zakres ? 0.45 : 1
    g.strokeStyle = kolor
    g.lineWidth = Math.max(2, r.grubosc * k)
    g.beginPath()
    r.punkty.forEach((q, i) => {
      const [x, y] = mapuj(q[0], q[1])
      if (i === 0) g.moveTo(x, y)
      else g.lineTo(x, y)
    })
    g.stroke()
    g.restore()
  }
}

/** Czy adnotacja dotyka prostokąta zdjęcia (którykolwiek punkt leży na zdjęciu). */
const dotykaZdjecia = (r: Rysunek, w: Warstwa) =>
  r.punkty.some(q => q[0] >= w.x && q[0] <= w.x + w.width && q[1] >= w.y && q[1] <= w.y + w.height)

/** Zdjęcie, którego dotyczą adnotacje: zaznaczone (jeśli któraś go dotyka), w przeciwnym razie to z największą liczbą punktów. */
export function celAdnotacji(
  rysunki: Rysunek[],
  zaznaczoneRysunki: string[],
  warstwy: Warstwa[],
  wybranaWarstwa: string | null,
): { warstwa: Warstwa; rysunki: Rysunek[] } | null {
  const zdjecia = warstwy.filter(w => w.type === 'image' && w.visible && !w.generator && w.src)
  const pula = zaznaczoneRysunki.length ? rysunki.filter(r => zaznaczoneRysunki.includes(r.id)) : rysunki
  if (!zdjecia.length || !pula.length) return null
  const wybrana = zdjecia.find(w => w.id === wybranaWarstwa)
  let cel = wybrana && pula.some(r => dotykaZdjecia(r, wybrana)) ? wybrana : undefined
  if (!cel) {
    let naj = 0
    for (const w of zdjecia) {
      const ile = pula.reduce((s, r) => s + r.punkty.filter(q => q[0] >= w.x && q[0] <= w.x + w.width && q[1] >= w.y && q[1] <= w.y + w.height).length, 0)
      if (ile > naj) { naj = ile; cel = w }
    }
  }
  if (!cel) return null
  const c = cel
  return { warstwa: c, rysunki: pula.filter(r => dotykaZdjecia(r, c)) }
}

/** Słowny opis położenia punktu na zdjęciu (kadr podzielony na 3×3) — dla napisów wpisanych z klawiatury. */
function strefa(nx: number, ny: number) {
  const pion = ny < 0.34 ? 'top' : ny > 0.66 ? 'bottom' : ''
  const poziom = nx < 0.34 ? 'left' : nx > 0.66 ? 'right' : ''
  return pion || poziom ? `the ${[pion, poziom].filter(Boolean).join('-')} part` : 'the center'
}

export interface PrzygotowaneAdnotacje {
  polecenie: string
  obrazy: [string, string]
  szerokosc: number
  wysokosc: number
}

/** Składa plan zmian (zdjęcie + adnotacje) i polecenie dla modelu. */
export async function przygotujAdnotacje(opcje: {
  warstwa: Warstwa
  rysunki: Rysunek[]
  opis: string
  model: Parameters<typeof dopasujWymiary>[2]
}): Promise<PrzygotowaneAdnotacje> {
  const { warstwa: w, rysunki, opis, model } = opcje
  const baza = await konwertujNaDataUrl(w.src)
  const { width, height } = dopasujWymiary(w.naturalWidth, w.naturalHeight, model)

  // plan zmian w rozdzielczości, którą dostanie model (ale nie większej niż 1600 px, żeby nie puchły dane)
  const skalaPlanu = Math.min(1, 1600 / Math.max(width, height))
  const pw = Math.round(width * skalaPlanu)
  const ph = Math.round(height * skalaPlanu)
  const obraz = await new Promise<HTMLImageElement>((ok, err) => {
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.onload = () => ok(i)
    i.onerror = () => err(new Error('Nie udało się wczytać zdjęcia do adnotacji'))
    i.src = baza
  })
  const plotno = document.createElement('canvas')
  plotno.width = pw
  plotno.height = ph
  const g = plotno.getContext('2d')
  if (!g) throw new Error('Brak kontekstu rysowania')
  g.drawImage(obraz, 0, 0, pw, ph)
  const kx = pw / w.width
  const ky = ph / w.height
  rysujRysunki(g, rysunki, (x, y) => [(x - w.x) * kx, (y - w.y) * ky], Math.min(kx, ky), '#ef4444')
  const plan = plotno.toDataURL('image/png')

  const napisy = rysunki
    .filter(r => r.tekst)
    .map(r => `- "${r.tekst}" — written in ${strefa((r.punkty[0][0] - w.x) / w.width, (r.punkty[0][1] - w.y) / w.height)} of the frame`)

  const polecenie = [
    'Image 1 is the original photo. Image 2 is the same photo with the designer\'s markup drawn on top of it.',
    'The markup is a set of instructions: coloured outlines, hatched or highlighted areas and arrows show WHERE something must change, and the handwritten or typed notes next to them say WHAT to do there. Read every note and carry out every instruction in the place it points to.',
    napisy.length ? `Typed notes on Image 2 (exact text):\n${napisy.join('\n')}` : '',
    opis ? `Extra instructions from the designer: ${opis}` : '',
    'Output Image 1 with all of these changes applied. Keep everything the markup does not mention exactly as it is — the same people with the same identity, face, pose, clothing, framing and camera angle. The markup itself (lines, arrows, hatching, handwriting, outlines) must not appear in the result at all; where it only pointed at something, leave that spot clean. The result is one finished, polished image with consistent light, sharpness and colour grade, no seams, halos or sticker look. Any text the notes ask for must be spelled exactly as written.',
  ].filter(Boolean).join('\n')

  return { polecenie, obrazy: [baza, plan], szerokosc: w.naturalWidth, wysokosc: w.naturalHeight }
}
