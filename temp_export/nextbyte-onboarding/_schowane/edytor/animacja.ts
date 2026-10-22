import type { Klatka, Punkt, Wezel, Wlasciwosc, Wygladzanie } from './typy'

/* ── Wygładzanie ──────────────────────────────────────────────────
 * Każda funkcja mapuje postęp 0..1 na 0..1. „Sprężyste” celowo
 * przestrzeliwuje ponad 1 — to ten charakterystyczny odbój.
 */
export const KRZYWE: Record<Wygladzanie, (t: number) => number> = {
  'liniowe':   t => t,
  'łagodne':   t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  'wejście':   t => t * t * t,
  'wyjście':   t => 1 - Math.pow(1 - t, 3),
  'sprężyste': t => {
    const c = 1.70158 * 1.525
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2
  },
  'skok':      t => (t < 1 ? 0 : 1),
}

/** Odpowiedniki CSS — używane przy eksporcie do @keyframes. */
export const KRZYWE_CSS: Record<Wygladzanie, string> = {
  'liniowe':   'linear',
  'łagodne':   'cubic-bezier(0.65, 0, 0.35, 1)',
  'wejście':   'cubic-bezier(0.32, 0, 0.67, 0)',
  'wyjście':   'cubic-bezier(0.33, 1, 0.68, 1)',
  'sprężyste': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  'skok':      'steps(1, end)',
}

/** Klatki jednej właściwości, posortowane po czasie. */
export function klatkiWlasciwosci(wezel: Wezel, wlasciwosc: Wlasciwosc): Klatka[] {
  return wezel.klatki.filter(k => k.wlasciwosc === wlasciwosc).sort((a, b) => a.czas - b.czas)
}

/** Wartość statyczna węzła dla danej właściwości (gdy nie ma animacji). */
export function wartoscStatyczna(wezel: Wezel, wlasciwosc: Wlasciwosc): number {
  switch (wlasciwosc) {
    case 'x':      return wezel.x
    case 'y':      return wezel.y
    case 'skala':  return wezel.skala
    case 'obrot':  return wezel.obrot
    case 'krycie': return wezel.krycie
  }
}

/**
 * Wartość właściwości w czasie `czas` (ms). Przed pierwszą i za ostatnią
 * klatką trzymamy wartość skrajną — bez ekstrapolacji, bo w praktyce
 * zawsze chodzi o „stój i czekaj”, a nie o wylot poza scenę.
 */
export function wartoscWCzasie(wezel: Wezel, wlasciwosc: Wlasciwosc, czas: number): number {
  const klatki = klatkiWlasciwosci(wezel, wlasciwosc)
  if (klatki.length === 0) return wartoscStatyczna(wezel, wlasciwosc)
  if (czas <= klatki[0].czas) return klatki[0].wartosc
  const ostatnia = klatki[klatki.length - 1]
  if (czas >= ostatnia.czas) return ostatnia.wartosc

  for (let i = 0; i < klatki.length - 1; i++) {
    const a = klatki[i]
    const b = klatki[i + 1]
    if (czas >= a.czas && czas <= b.czas) {
      const rozpietosc = b.czas - a.czas
      const t = rozpietosc === 0 ? 1 : (czas - a.czas) / rozpietosc
      return a.wartosc + (b.wartosc - a.wartosc) * KRZYWE[a.wygladzanie](t)
    }
  }
  return ostatnia.wartosc
}

/** Wszystkie animowane wartości węzła naraz — to konsumuje renderer. */
export interface StanWezla {
  x: number
  y: number
  skala: number
  obrot: number
  krycie: number
}

export function stanWCzasie(wezel: Wezel, czas: number): StanWezla {
  return {
    x:      wartoscWCzasie(wezel, 'x', czas),
    y:      wartoscWCzasie(wezel, 'y', czas),
    skala:  wartoscWCzasie(wezel, 'skala', czas),
    obrot:  wartoscWCzasie(wezel, 'obrot', czas),
    krycie: wartoscWCzasie(wezel, 'krycie', czas),
  }
}

export function czyAnimowany(wezel: Wezel): boolean {
  return wezel.klatki.length > 0
}

/* ── Ścieżki ─────────────────────────────────────────────────────── */

/**
 * Buduje atrybut `d` z listy punktów. Segment jest krzywą sześcienną,
 * gdy którykolwiek z sąsiadujących uchwytów istnieje — inaczej zwykłą
 * linią, żeby nie zaśmiecać eksportowanego SVG.
 */
export function doAtrybutuD(punkty: Punkt[], zamknieta: boolean): string {
  if (punkty.length === 0) return ''
  if (punkty.length === 1) return `M ${punkty[0].x} ${punkty[0].y}`

  let d = `M ${punkty[0].x} ${punkty[0].y}`
  const ile = zamknieta ? punkty.length : punkty.length - 1

  for (let i = 0; i < ile; i++) {
    const a = punkty[i]
    const b = punkty[(i + 1) % punkty.length]
    const maUchwyty = a.zx !== undefined || b.wx !== undefined
    if (maUchwyty) {
      const c1x = a.zx ?? a.x
      const c1y = a.zy ?? a.y
      const c2x = b.wx ?? b.x
      const c2y = b.wy ?? b.y
      d += ` C ${round(c1x)} ${round(c1y)}, ${round(c2x)} ${round(c2y)}, ${round(b.x)} ${round(b.y)}`
    } else {
      d += ` L ${round(b.x)} ${round(b.y)}`
    }
  }
  if (zamknieta) d += ' Z'
  return d
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Dokłada symetryczne uchwyty do punktu, wyliczone z kierunku sąsiadów
 * (schemat Catmull–Rom). To jest „zamień w krzywe” z paska narzędzi.
 */
export function wygladzPunkty(punkty: Punkt[], zamknieta: boolean, napiecie = 0.35): Punkt[] {
  const n = punkty.length
  if (n < 2) return punkty
  return punkty.map((p, i) => {
    const poprz = punkty[(i - 1 + n) % n]
    const nast  = punkty[(i + 1) % n]
    if (!zamknieta && (i === 0 || i === n - 1)) {
      const sasiad = i === 0 ? nast : poprz
      const dx = (sasiad.x - p.x) * napiecie
      const dy = (sasiad.y - p.y) * napiecie
      return i === 0
        ? { x: p.x, y: p.y, zx: p.x + dx, zy: p.y + dy }
        : { x: p.x, y: p.y, wx: p.x + dx, wy: p.y + dy }
    }
    const dx = (nast.x - poprz.x) * napiecie
    const dy = (nast.y - poprz.y) * napiecie
    return { x: p.x, y: p.y, wx: p.x - dx, wy: p.y - dy, zx: p.x + dx, zy: p.y + dy }
  })
}

/** Usuwa uchwyty — powrót do łamanej. */
export function zaostrzPunkty(punkty: Punkt[]): Punkt[] {
  return punkty.map(p => ({ x: p.x, y: p.y }))
}
