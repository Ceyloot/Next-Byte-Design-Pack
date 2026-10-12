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
    let odl = 0.12
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

/** Kolory obszarów na mapie układu (numer → kolor). Mapa nie jest częścią zdjęcia, więc kolory nie muszą nic znaczyć. */
const KOLORY_MAPY = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#eab308']

/**
 * Mapa układu (Image 2): czarne tło i same obszary zadań — wypełnione, w kolorze i z numerem. Bez zdjęcia i bez tekstu:
 * model dostaje WSKAZANIE miejsca, nie rysunek do przepisania, więc kresek i napisów nie przenosi na wynik.
 */
function narysujMapeUkladu(
  w: Warstwa,
  rysunki: Rysunek[],
  zadania: ZadanieAdnotacji[],
  pw: number,
  ph: number,
): string {
  const plotno = document.createElement('canvas')
  plotno.width = pw
  plotno.height = ph
  const g = plotno.getContext('2d')
  if (!g) throw new Error('Brak kontekstu rysowania')
  g.fillStyle = '#000000'
  g.fillRect(0, 0, pw, ph)
  const kx = pw / w.width
  const ky = ph / w.height
  const mapuj = (x: number, y: number): [number, number] => [(x - w.x) * kx, (y - w.y) * ky]
  const promien = Math.max(12, Math.round(Math.min(pw, ph) * 0.028))

  zadania.forEach((z, i) => {
    const kolor = KOLORY_MAPY[i % KOLORY_MAPY.length]
    // tło obszaru: prostokąt obejmujący zaznaczenie (miękko), żeby obrys z cienkiej kreski też wskazywał całe pole
    g.fillStyle = kolor + '33'
    g.fillRect(z.ramka.x0 * pw, z.ramka.y0 * ph, (z.ramka.x1 - z.ramka.x0) * pw, (z.ramka.y1 - z.ramka.y0) * ph)
    // same kreski tego zadania: obrysy zamknięte wypełniamy, otwarte zostają liniami
    for (const r of rysunki) {
      if (r.tekst) continue
      const xs = r.punkty.map(q => (q[0] - w.x) / w.width)
      const ys = r.punkty.map(q => (q[1] - w.y) / w.height)
      const sr = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
      if (sr[0] < z.ramka.x0 - 0.001 || sr[0] > z.ramka.x1 + 0.001 || sr[1] < z.ramka.y0 - 0.001 || sr[1] > z.ramka.y1 + 0.001) continue
      g.save()
      g.lineCap = 'round'
      g.lineJoin = 'round'
      g.strokeStyle = kolor
      g.fillStyle = kolor + '66'
      g.lineWidth = Math.max(3, r.grubosc * Math.min(kx, ky))
      g.beginPath()
      r.punkty.forEach((q, j) => {
        const [x, y] = mapuj(q[0], q[1])
        if (j === 0) g.moveTo(x, y)
        else g.lineTo(x, y)
      })
      const p0 = mapuj(r.punkty[0][0], r.punkty[0][1])
      const pk = mapuj(r.punkty[r.punkty.length - 1][0], r.punkty[r.punkty.length - 1][1])
      const rozpietosc = Math.hypot((Math.max(...xs) - Math.min(...xs)) * pw, (Math.max(...ys) - Math.min(...ys)) * ph)
      if (Math.hypot(p0[0] - pk[0], p0[1] - pk[1]) < rozpietosc * 0.25) {
        g.closePath()
        g.fill()
      }
      g.stroke()
      g.restore()
    }
    const cx = Math.min(pw - promien - 2, Math.max(promien + 2, z.ramka.x0 * pw))
    const cy = Math.min(ph - promien - 2, Math.max(promien + 2, z.ramka.y0 * ph))
    g.beginPath()
    g.arc(cx, cy, promien, 0, Math.PI * 2)
    g.fillStyle = '#ffffff'
    g.fill()
    g.fillStyle = '#000000'
    g.font = `700 ${Math.round(promien * 1.2)}px Inter, system-ui, sans-serif`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(String(z.numer), cx, cy)
  })
  return plotno.toDataURL('image/png')
}

/** Składa mapę układu i ponumerowaną listę zadań dla modelu. */
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
  // mapa w rozdzielczości, którą dostanie model (ale nie większej niż 1600 px, żeby nie puchły dane)
  const skala = Math.min(1, 1600 / Math.max(width, height))
  const plan = narysujMapeUkladu(w, rysunki, zadania, Math.round(width * skala), Math.round(height * skala))

  const lista = zadania.map(z => {
    const cx = (z.ramka.x0 + z.ramka.x1) / 2
    const cy = (z.ramka.y0 + z.ramka.y1) / 2
    const miejsce = `region ${proc(z.ramka.x0)}–${proc(z.ramka.x1)} from the left, ${proc(z.ramka.y0)}–${proc(z.ramka.y1)} from the top (${strefa(cx, cy)} of the frame)`
    const tresc = z.napisy.length
      ? `the designer asks for: ${z.napisy.map(n => `"${n}"`).join(' and ')}`
      : 'a marked area without a note — apply the extra instructions below to it'
    return `${z.numer}. Region ${z.numer} — ${miejsce} — ${tresc}`
  })

  const polecenie = [
    'Image 1 is the original photo. Image 2 is a LAYOUT MAP, not a photo: a black background with coloured, numbered shapes at the same positions and proportions as in Image 1. Each shape marks the place on the photo where the task with the same number applies. The map only tells you WHERE; it is never part of the picture.',
    zadania.length ? `TASK LIST — every item is mandatory; none may be skipped, merged or toned down until it is barely visible. The notes may be in any language — understand them and turn each into a convincing, clearly visible change inside its region:\n${lista.join('\n')}` : '',
    opis ? `Extra instructions from the designer: ${opis}` : '',
    'Output Image 1 with ALL of these changes applied, each one clearly visible in its region. Before answering, check the finished image against the task list item by item. Keep everything the tasks do not mention exactly as it is — the same people with the same identity, face, pose, clothing, framing and camera angle. NEVER copy anything from Image 2 into the result: no outlines, shapes, colours, numbers, arrows, lines, handwriting or labels, and do not write the notes onto the picture (unless a task explicitly asks for a text in the image — then spell it exactly). The result is one finished, polished photograph with consistent light, sharpness and colour grade, no seams, halos or sticker look.',
  ].filter(Boolean).join('\n')

  return { polecenie, obrazy: [baza, plan], szerokosc: w.naturalWidth, wysokosc: w.naturalHeight, zadania }
}
