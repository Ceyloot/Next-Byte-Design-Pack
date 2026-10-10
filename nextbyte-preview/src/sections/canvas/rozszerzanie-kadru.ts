import { dopasujWymiary, type ModelDlaWymiarow } from './formaty-modelu'
import { dopasujFormatDoObrazu, konwertujNaDataUrl } from './typy'
import { generuj } from './dostawca'

/**
 * Outpainting: rozszerzenie kadru poza krawędzie zdjęcia (zmiana wymiarów / proporcji bez przycinania).
 *
 * Jak to działa (bez magii po stronie modelu):
 *  1. kod wybiera format obsługiwany przez model, najbliższy żądanym proporcjom (`dopasujWymiary`),
 *  2. buduje klatkę o tym formacie: zdjęcie stoi w niej na wybranym miejscu, reszta to jednolita szara pustka,
 *  3. model dostaje klatkę + prośbę „wypełnij pustkę, nie ruszaj zdjęcia”,
 *  4. kod składa wynik w NATYWNEJ rozdzielczości: wygenerowane brzegi + oryginał wklejony z powrotem piksel w piksel
 *     (miękki szew tylko od strony nowych obszarów), więc środek zdjęcia nie traci ani piksela jakości.
 */

export interface Proporcja {
  id: string
  etykieta: string
  w: number
  h: number
}

export const PROPORCJE_OUTPAINT: Proporcja[] = [
  { id: '1:1', etykieta: '1:1', w: 1, h: 1 },
  { id: '4:3', etykieta: '4:3', w: 4, h: 3 },
  { id: '3:4', etykieta: '3:4', w: 3, h: 4 },
  { id: '3:2', etykieta: '3:2', w: 3, h: 2 },
  { id: '2:3', etykieta: '2:3', w: 2, h: 3 },
  { id: '16:9', etykieta: '16:9', w: 16, h: 9 },
  { id: '9:16', etykieta: '9:16', w: 9, h: 16 },
  { id: '21:9', etykieta: '21:9', w: 21, h: 9 },
]

/** Gdzie ma przybyć nowa treść: wokół (zdjęcie na środku) albo tylko z jednej strony. */
export type Kotwica = 'srodek' | 'lewo' | 'prawo' | 'gora' | 'dol'

export interface ZadanieRozszerzenia {
  /** docelowe proporcje (szerokość / wysokość) */
  proporcja: number
  kotwica: Kotwica
  /** dodatkowy zapas kadru (1 = tylko do proporcji; 1.3 = kadr 30% większy w obu osiach) */
  zapas?: number
  /** opis tego, co ma być w nowych miejscach (opcjonalny) */
  opis?: string
  /** dokładne piksele wyniku (np. „1920×1080”) — wynik jest do nich przeskalowany */
  docelowe?: { w: number; h: number }
}

const MAKS_BOK = 4096

export const typWymiarow = (model: string | undefined): ModelDlaWymiarow =>
  model === 'pro' ? 'pro' : model === 'lite' ? 'lite' : model === 'gptimage2' ? 'gpt' : 'nb2'

export interface UkladRozszerzenia {
  /** format klatki wysyłanej do modelu */
  fw: number
  fh: number
  /** wymiary wyniku (natywna rozdzielczość oryginału) */
  W: number
  H: number
  /** miejsce i rozmiar oryginału w wyniku */
  x: number
  y: number
  ow: number
  oh: number
  /** miejsce oryginału w klatce modelu */
  mx: number
  my: number
  mw: number
  mh: number
}

/** Układ rozszerzenia; `null`, gdy kadr już ma te proporcje (nie ma czego dorysowywać). */
export function ukladRozszerzenia(sw: number, sh: number, z: ZadanieRozszerzenia, model: ModelDlaWymiarow): UkladRozszerzenia | null {
  const { width: fw, height: fh } = dopasujWymiary(Math.round(z.proporcja * 1000), 1000, model)
  const R = fw / fh
  const zapas = Math.max(1, z.zapas ?? 1)
  if (Math.abs(R / (sw / sh) - 1) < 0.02 && zapas === 1) return null

  let W = R >= sw / sh ? Math.round(sh * R) : sw
  let H = R >= sw / sh ? sh : Math.round(sw / R)
  W = Math.round(W * zapas)
  H = Math.round(H * zapas)
  const dlugi = Math.max(W, H)
  const s = dlugi > MAKS_BOK ? MAKS_BOK / dlugi : 1
  const ow = Math.round(sw * s)
  const oh = Math.round(sh * s)
  W = Math.round(W * s)
  H = Math.round(H * s)

  const extraX = Math.max(0, W - ow)
  const extraY = Math.max(0, H - oh)
  const x = z.kotwica === 'lewo' ? extraX : z.kotwica === 'prawo' ? 0 : Math.round(extraX / 2)
  const y = z.kotwica === 'gora' ? extraY : z.kotwica === 'dol' ? 0 : Math.round(extraY / 2)
  const k = fw / W
  return { fw, fh, W, H, x, y, ow, oh, mx: Math.round(x * k), my: Math.round(y * k), mw: Math.round(ow * k), mh: Math.round(oh * k) }
}

const wczytaj = (src: string) =>
  new Promise<HTMLImageElement>((ok, blad) => {
    const o = new Image()
    o.crossOrigin = 'anonymous'
    o.onload = () => ok(o)
    o.onerror = () => blad(new Error('Nie udało się wczytać zdjęcia'))
    o.src = src
  })

/** Klatka dla modelu: szara pustka + zdjęcie na swoim miejscu. */
async function zlozKlatke(zdjecie: HTMLImageElement, u: UkladRozszerzenia): Promise<string> {
  const p = document.createElement('canvas')
  p.width = u.fw
  p.height = u.fh
  const g = p.getContext('2d')
  if (!g) throw new Error('Brak kontekstu rysowania')
  g.fillStyle = '#808080'
  g.fillRect(0, 0, u.fw, u.fh)
  g.imageSmoothingQuality = 'high'
  g.drawImage(zdjecie, u.mx, u.my, u.mw, u.mh)
  return p.toDataURL('image/png')
}

/** Wynik: wygenerowana klatka rozciągnięta do W×H + oryginał z powrotem (miękki szew od strony nowych obszarów). */
async function zlozWynik(zdjecie: HTMLImageElement, wygenerowany: HTMLImageElement, u: UkladRozszerzenia): Promise<string> {
  const p = document.createElement('canvas')
  p.width = u.W
  p.height = u.H
  const g = p.getContext('2d')
  if (!g) throw new Error('Brak kontekstu rysowania')
  g.imageSmoothingQuality = 'high'
  g.drawImage(wygenerowany, 0, 0, u.W, u.H)

  const { ow, oh } = u
  const f = Math.max(2, Math.round(Math.min(ow, oh) * 0.006))
  // oryginał na osobnej warstwie z maską: pełna kryjność, a od strony nowych obszarów — krótkie zanikanie
  const w2 = document.createElement('canvas')
  w2.width = u.W
  w2.height = u.H
  const g2 = w2.getContext('2d')
  if (g2) {
    g2.imageSmoothingQuality = 'high'
    g2.drawImage(zdjecie, u.x, u.y, ow, oh)
    const maska = document.createElement('canvas')
    maska.width = u.W
    maska.height = u.H
    const gm = maska.getContext('2d')
    if (gm) {
      const lewo = u.x > 0 ? f : -2 * f
      const gora = u.y > 0 ? f : -2 * f
      const prawo = u.x + ow < u.W ? f : -2 * f
      const dol = u.y + oh < u.H ? f : -2 * f
      try {
        gm.filter = `blur(${Math.max(1, Math.round(f / 2))}px)`
      } catch {
        /* brak ctx.filter — szew będzie ostry */
      }
      gm.fillStyle = '#000'
      gm.fillRect(u.x + lewo, u.y + gora, ow - lewo - prawo, oh - gora - dol)
      g2.globalCompositeOperation = 'destination-in'
      g2.drawImage(maska, 0, 0)
    }
    g.drawImage(w2, 0, 0)
  } else {
    g.drawImage(zdjecie, u.x, u.y, ow, oh)
  }
  const duzy = u.W * u.H > 12_000_000
  return duzy ? p.toDataURL('image/jpeg', 0.97) : p.toDataURL('image/png')
}

function poleceniePoOpisie(u: UkladRozszerzenia, z: ZadanieRozszerzenia): string {
  const strona: Record<Kotwica, string> = {
    srodek: 'in the middle of the frame, with empty grey bands around it',
    lewo: 'against the RIGHT edge of the frame, with the empty grey area on its left',
    prawo: 'against the LEFT edge of the frame, with the empty grey area on its right',
    gora: 'against the BOTTOM edge of the frame, with the empty grey area above it',
    dol: 'against the TOP edge of the frame, with the empty grey area below it',
  }
  const gdzie = u.mx + u.mw >= u.fw - 1 && u.mx <= 1 ? 'spanning the full width' : strona[z.kotwica]
  return [
    'Outpaint this picture: extend the scene beyond its original borders.',
    `The original photograph sits ${gdzie}. Every flat mid-grey area is EMPTY canvas that you must fill with new picture content.`,
    'Continue the existing scene naturally into the grey area: same place, perspective and horizon, same lighting direction, colour grading, grain, depth of field and level of detail — the join with the original must be invisible. Objects cut by the original border continue naturally; add only what plausibly belongs there.',
    'Do NOT change, move, rescale, crop, re-light or repaint the original photograph — it must stay pixel-identical. No grey, no bars, no frame, no border, no text, no watermark in the result.',
    'Return the complete frame (the original plus the filled areas) at the same aspect ratio.',
    z.opis?.trim() ? `What should appear in the new areas: ${z.opis.trim()}.` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export interface WynikRozszerzenia {
  src: string
  model: string
  kosztUSD: number
}

/** Cały przebieg: klatka → model → złożenie w natywnej rozdzielczości (→ opcjonalnie dokładne piksele). */
export async function wykonajRozszerzenie(
  srcZdjecia: string,
  z: ZadanieRozszerzenia,
  model: string | undefined,
): Promise<WynikRozszerzenia> {
  const dane = await konwertujNaDataUrl(srcZdjecia)
  const zdjecie = await wczytaj(dane)
  const u = ukladRozszerzenia(zdjecie.naturalWidth, zdjecie.naturalHeight, z, typWymiarow(model))
  if (!u) throw new Error('Zdjęcie ma już takie proporcje — nie ma czego dorysować. Wybierz inne proporcje albo kierunek rozszerzenia.')

  const klatka = await zlozKlatke(zdjecie, u)
  const odp = await generuj({
    polecenie: poleceniePoOpisie(u, z),
    obrazy: [klatka],
    szerokosc: u.fw,
    wysokosc: u.fh,
    model: model === 'auto' ? undefined : (model as never),
  })
  const dopasowany = await dopasujFormatDoObrazu(odp.obrazUrl, u.fw, u.fh)
  const wygenerowany = await wczytaj(dopasowany)
  let src = await zlozWynik(zdjecie, wygenerowany, u)
  if (z.docelowe) src = await dopasujFormatDoObrazu(src, z.docelowe.w, z.docelowe.h, { skaluj: true })
  return { src, model: odp.model, kosztUSD: odp.kosztUSD }
}

/* ── Rozpoznanie polecenia z czatu („zmień wymiary na 16:9”, „rozszerz w prawo”) ────────────────────────────── */

const norm = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')

/**
 * Czy polecenie prosi o zmianę wymiarów / rozszerzenie kadru? Wymaga czasownika (rozszerz, poszerz, zmień wymiary…)
 * ORAZ celu (proporcje, piksele, orientacja albo kierunek) — samo „zrób pionowe” bez czasownika o kadrze nie wystarczy.
 */
export function rozpoznajRozszerzenie(tekst: string, sw: number, sh: number): ZadanieRozszerzenia | null {
  const t = norm(tekst)
  const czasownik =
    /\b(rozszerz\w*|poszerz\w*|wydluz\w*|outpaint\w*|powieksz\w* (kadr|tlo|plotno|obraz|zdjecie)|zmien\w* (kadr|wymiar\w*|rozmiar\w*|forma\w*|proporcj\w*|orientacj\w*)|ustaw\w* (wymiar\w*|rozmiar\w*|forma\w*|proporcj\w*)|przerob\w* na (format|pion|poziom|kwadrat)|dostosuj\w* (wymiar\w*|forma\w*|proporcj\w*)|zrob\w* (to |go |ja |zdjecie )?(w )?(forma\w*|pionow\w*|poziom\w*|kwadrat\w*|panoram\w*)|(wymiar\w*|forma\w*|proporcj\w*|rozmiar\w*) (na|do))\b/
  if (!czasownik.test(t)) return null

  const kierunek: Kotwica | null = /\b(w lewo|na lewo|z lewej|po lewej)\b/.test(t)
    ? 'lewo'
    : /\b(w prawo|na prawo|z prawej|po prawej)\b/.test(t)
      ? 'prawo'
      : /\b(w gore|do gory|u gory|na gorze|z gory|nad)\b/.test(t)
        ? 'gora'
        : /\b(w dol|na dol|u dolu|na dole|z dolu|pod)\b/.test(t)
          ? 'dol'
          : /\b(dookola|wszystkich stron|obu stron|po bokach|z bokow|naokolo)\b/.test(t)
            ? 'srodek'
            : null

  let proporcja: number | null = null
  let docelowe: { w: number; h: number } | undefined
  const pix = t.match(/\b(\d{3,5})\s?[x×*]\s?(\d{3,5})\b/)
  const rat = t.match(/\b(\d{1,2})\s?:\s?(\d{1,2})\b/)
  if (pix) {
    docelowe = { w: Number(pix[1]), h: Number(pix[2]) }
    proporcja = docelowe.w / docelowe.h
  } else if (rat && Number(rat[2]) > 0) {
    proporcja = Number(rat[1]) / Number(rat[2])
  } else if (/\b(story|stories|reels|tiktok|shorts)\b/.test(t)) proporcja = 9 / 16
  else if (/\b(panoram\w*|kinow\w*)\b/.test(t)) proporcja = 21 / 9
  else if (/\b(baner\w*|banner\w*|youtube|miniatur\w*|szerok\w*|poziom\w*|pulpit)\b/.test(t)) proporcja = 16 / 9
  else if (/\b(pion\w*|portret\w*|wysok\w*)\b/.test(t)) proporcja = 3 / 4
  else if (/\bkwadrat\w*\b/.test(t)) proporcja = 1

  if (proporcja === null) {
    // bez docelowych proporcji: samo rozszerzenie w wybranym kierunku o ~40% (albo kadr o 30% większy dookoła)
    if (!kierunek) return null
    if (kierunek === 'srodek') return { proporcja: sw / sh, kotwica: 'srodek', zapas: 1.3 }
    const poziomo = kierunek === 'lewo' || kierunek === 'prawo'
    return { proporcja: poziomo ? (sw * 1.4) / sh : sw / (sh * 1.4), kotwica: kierunek }
  }
  return { proporcja, kotwica: kierunek ?? 'srodek', docelowe }
}
