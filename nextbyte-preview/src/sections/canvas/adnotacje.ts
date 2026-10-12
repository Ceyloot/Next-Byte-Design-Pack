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

/** Słowny opis położenia punktu na zdjęciu (kadr podzielony na 3×3). */
function strefa(nx: number, ny: number) {
  const pion = ny < 0.34 ? 'top' : ny > 0.66 ? 'bottom' : ''
  const poziom = nx < 0.34 ? 'left' : nx > 0.66 ? 'right' : ''
  return pion || poziom ? `${[pion, poziom].filter(Boolean).join('-')} part` : 'center'
}

interface Ramka { x0: number; y0: number; x1: number; y1: number }

/** Jedno zadanie z adnotacji: obszar zaznaczony kreskami (albo punkt napisu) plus napisy, które go opisują. */
export interface ZadanieAdnotacji {
  numer: number
  /** obszar w ułamkach zdjęcia (0–1) */
  ramka: Ramka
  napisy: string[]
}

const sumuj = (a: Ramka, b: Ramka): Ramka => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) })
const zachodza = (a: Ramka, b: Ramka, luz: number) => a.x0 - luz < b.x1 && a.x1 + luz > b.x0 && a.y0 - luz < b.y1 && a.y1 + luz > b.y0
const odlegloscDoRamki = (x: number, y: number, r: Ramka) => Math.hypot(Math.max(r.x0 - x, 0, x - r.x1), Math.max(r.y0 - y, 0, y - r.y1))

/**
 * Zamienia adnotacje na ponumerowaną listę zadań. Kreski tego samego koloru, które na siebie zachodzą, tworzą jeden obszar;
 * każdy napis przypisujemy do najbliższego obszaru (albo, gdy żaden nie jest blisko, do jego własnego miejsca).
 */
export function zadaniaZAdnotacji(rysunki: Rysunek[], w: Pick<Warstwa, 'x' | 'y' | 'width' | 'height'>): ZadanieAdnotacji[] {
  const nx = (x: number) => Math.min(1, Math.max(0, (x - w.x) / w.width))
  const ny = (y: number) => Math.min(1, Math.max(0, (y - w.y) / w.height))
  const ramkaRysunku = (r: Rysunek): Ramka => {
    const xs = r.punkty.map(q => nx(q[0]))
    const ys = r.punkty.map(q => ny(q[1]))
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
  }
  const obszary: { ramka: Ramka; kolor: string }[] = []
  for (const r of rysunki.filter(x => !x.tekst)) {
    const ramka = ramkaRysunku(r)
    const kolor = r.kolor
    const pasujace = obszary.filter(o => o.kolor === kolor && zachodza(o.ramka, ramka, 0.02))
    if (pasujace.length) {
      const polaczona = pasujace.reduce((suma, o) => sumuj(suma, o.ramka), ramka)
      for (const o of pasujace) obszary.splice(obszary.indexOf(o), 1)
      obszary.push({ ramka: polaczona, kolor })
    } else obszary.push({ ramka, kolor })
  }
  const zadania: { ramka: Ramka; napisy: string[] }[] = obszary.map(o => ({ ramka: o.ramka, napisy: [] }))
  for (const r of rysunki.filter(x => x.tekst)) {
    const rt = ramkaRysunku(r)
    const sx = (rt.x0 + rt.x1) / 2
    const sy = rt.y0
    let naj = -1
    let odl = 0.3
    zadania.forEach((z, i) => {
      const d = odlegloscDoRamki(sx, sy, z.ramka)
      if (d < odl) { odl = d; naj = i }
    })
    if (naj >= 0) zadania[naj].napisy.push(r.tekst as string)
    else zadania.push({ ramka: { x0: rt.x0, y0: Math.max(0, rt.y0 - 0.04), x1: rt.x1, y1: Math.min(1, rt.y1 + 0.04) }, napisy: [r.tekst as string] })
  }
  return zadania
    .sort((a, b) => a.ramka.y0 - b.ramka.y0 || a.ramka.x0 - b.ramka.x0)
    .map((z, i) => ({ numer: i + 1, ...z }))
}

export interface PrzygotowaneAdnotacje {
  polecenie: string
  obrazy: [string, string]
  szerokosc: number
  wysokosc: number
  zadania: ZadanieAdnotacji[]
}

const proc = (v: number) => `${Math.round(v * 100)}%`

/** Składa plan zmian (zdjęcie + adnotacje z numerami obszarów) i polecenie dla modelu. */
export async function przygotujAdnotacje(opcje: {
  warstwa: Warstwa
  rysunki: Rysunek[]
  opis: string
  model: Parameters<typeof dopasujWymiary>[2]
}): Promise<PrzygotowaneAdnotacje> {
  const { warstwa: w, rysunki, opis, model } = opcje
  const baza = await konwertujNaDataUrl(w.src)
  const { width, height } = dopasujWymiary(w.naturalWidth, w.naturalHeight, model)
  const zadania = zadaniaZAdnotacji(rysunki, w)

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
  // numery zadań w lewym górnym rogu każdego obszaru — model wie, który napis dotyczy którego miejsca
  const promien = Math.max(12, Math.round(Math.min(pw, ph) * 0.028))
  for (const z of zadania) {
    const cx = Math.min(pw - promien - 2, Math.max(promien + 2, z.ramka.x0 * pw))
    const cy = Math.min(ph - promien - 2, Math.max(promien + 2, z.ramka.y0 * ph))
    g.beginPath()
    g.arc(cx, cy, promien, 0, Math.PI * 2)
    g.fillStyle = '#111111'
    g.fill()
    g.lineWidth = Math.max(2, promien / 6)
    g.strokeStyle = '#ffffff'
    g.stroke()
    g.fillStyle = '#ffffff'
    g.font = `700 ${Math.round(promien * 1.2)}px Inter, system-ui, sans-serif`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(String(z.numer), cx, cy)
  }
  g.textAlign = 'start'
  const plan = plotno.toDataURL('image/png')

  const lista = zadania.map(z => {
    const cx = (z.ramka.x0 + z.ramka.x1) / 2
    const cy = (z.ramka.y0 + z.ramka.y1) / 2
    const miejsce = `region ${proc(z.ramka.x0)}–${proc(z.ramka.x1)} from the left, ${proc(z.ramka.y0)}–${proc(z.ramka.y1)} from the top (${strefa(cx, cy)} of the frame)`
    const tresc = z.napisy.length
      ? `designer's note: ${z.napisy.map(n => `"${n}"`).join(' and ')}`
      : 'a marked area without a typed note — read the handwriting next to it, if any, or follow the extra instructions below'
    return `${z.numer}. ${miejsce} — ${tresc}`
  })

  const polecenie = [
    'Image 1 is the original photo. Image 2 is the same photo with the designer\'s markup drawn on top: coloured outlines, hatched or highlighted areas, arrows, notes, and numbered black circles that mark the regions.',
    'The markup is a set of instructions. Outlined or highlighted areas show WHERE something must change; the notes say WHAT to do there. Notes may be in any language — understand them and turn each into a convincing visual change.',
    zadania.length ? `TASK LIST — every item is mandatory; none may be skipped, merged or toned down until it is barely visible:\n${lista.join('\n')}` : '',
    'Handwritten notes on Image 2, if any, are additional mandatory tasks for the place they are written in.',
    opis ? `Extra instructions from the designer: ${opis}` : '',
    'Output Image 1 with ALL of these changes applied, each one clearly visible in its region. Before answering, check the finished image against the task list item by item. Keep everything the markup does not mention exactly as it is — the same people with the same identity, face, pose, clothing, framing and camera angle. The markup itself (lines, arrows, hatching, handwriting, circles, outlines) must not appear in the result at all; where it only pointed at something, leave that spot clean. The result is one finished, polished image with consistent light, sharpness and colour grade, no seams, halos or sticker look. Any text the notes ask for must be spelled exactly as written.',
  ].filter(Boolean).join('\n')

  return { polecenie, obrazy: [baza, plan], szerokosc: w.naturalWidth, wysokosc: w.naturalHeight, zadania }
}
