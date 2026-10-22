/**
 * Parametryczny wygląd węzła: wypełnienie, obrys, cienie.
 *
 * Kluczowa zasada — te same struktury opisują podgląd na kanwie i kod
 * po eksporcie. Dlatego wszystko sprowadza się tutaj do stringów CSS
 * (dla warstw DOM) albo do atrybutów SVG (dla kształtów wektorowych),
 * i nigdzie nie ma drugiego, „ładniejszego” zestawu stylów.
 */

import { nowyId, type Wezel, type Wyglad } from './typy'

const zaokr = (n: number) => Math.round(n * 1000) / 1000
const ok = (n: number) => Math.round(n * 100) / 100

/* ── Kolor ────────────────────────────────────────────────────────
 * Potrzebujemy mnożyć krycie (siła cienia, krycie wypełnienia) na
 * dowolnym zapisie koloru, jaki użytkownik wklei. Parsujemy więc hex
 * i rgb(); resztę (nazwy CSS, hsl) przepuszczamy bez zmian, bo lepiej
 * oddać kolor bez krycia niż wywalić się na nieznanym formacie.
 */

export function naRgba(kolor: string, krycie = 1): string {
  const k = (kolor ?? '').trim()
  if (!k || k === 'none' || k === 'transparent') return 'transparent'
  // Hex z kanałem alfa i tak trzeba przepisać, bo część przeglądarek
  // nie wspiera #rrggbbaa w gradientach.
  if (krycie >= 1 && !/^#([0-9a-f]{4}|[0-9a-f]{8})$/i.test(k)) return k

  const hex = k.match(/^#([0-9a-f]{3,8})$/i)
  if (hex) {
    const c = hex[1]
    const rozwin = (s: string) => parseInt(s.length === 1 ? s + s : s, 16)
    let r: number
    let g: number
    let b: number
    let a = 1
    if (c.length === 3 || c.length === 4) {
      r = rozwin(c[0])
      g = rozwin(c[1])
      b = rozwin(c[2])
      if (c.length === 4) a = rozwin(c[3]) / 255
    } else if (c.length === 6 || c.length === 8) {
      r = parseInt(c.slice(0, 2), 16)
      g = parseInt(c.slice(2, 4), 16)
      b = parseInt(c.slice(4, 6), 16)
      if (c.length === 8) a = parseInt(c.slice(6, 8), 16) / 255
    } else {
      return k
    }
    return `rgba(${r}, ${g}, ${b}, ${zaokr(a * krycie)})`
  }

  const rgb = k.match(/^rgba?\(([^)]+)\)$/i)
  if (rgb) {
    const czesci = rgb[1].split(/[,/]/).map(s => s.trim())
    const [r, g, b] = czesci
    const surowa = czesci[3] === undefined ? 1 : parseFloat(czesci[3])
    const a = isNaN(surowa) ? 1 : surowa
    return `rgba(${r}, ${g}, ${b}, ${zaokr(a * krycie)})`
  }

  return k
}

/* ── Wypełnienie ─────────────────────────────────────────────────── */

export type RodzajWypelnienia = 'brak' | 'jednolite' | 'liniowy' | 'radialny'

export interface StopienGradientu {
  id: string
  kolor: string
  /** pozycja na osi gradientu, 0–100 */
  pozycja: number
}

export interface Wypelnienie {
  rodzaj: RodzajWypelnienia
  /** kolor dla `jednolite`; dla gradientów nieużywany */
  kolor: string
  /** kąt gradientu liniowego w stopniach, 0° = w górę (konwencja CSS) */
  kat: number
  stopnie: StopienGradientu[]
  /** mnożnik krycia całego wypełnienia, 0–1 */
  krycie: number
}

export function noweWypelnienie(kolor = '#38bdf8'): Wypelnienie {
  return {
    rodzaj: 'jednolite',
    kolor,
    kat: 135,
    stopnie: [
      { id: nowyId('s'), kolor, pozycja: 0 },
      { id: nowyId('s'), kolor: '#0b0f14', pozycja: 100 },
    ],
    krycie: 1,
  }
}

export function nowyStopien(kolor = '#ffffff', pozycja = 50): StopienGradientu {
  return { id: nowyId('s'), kolor, pozycja }
}

function uporzadkowaneStopnie(w: Wypelnienie): StopienGradientu[] {
  return [...w.stopnie].sort((a, b) => a.pozycja - b.pozycja)
}

/** Wartość dla CSS `background`. `undefined`, gdy wypełnienia nie ma. */
export function cssTlo(w: Wypelnienie | undefined): string | undefined {
  if (!w || w.rodzaj === 'brak') return undefined
  if (w.rodzaj === 'jednolite') return naRgba(w.kolor, w.krycie)
  const stopy = uporzadkowaneStopnie(w)
    .map(s => `${naRgba(s.kolor, w.krycie)} ${ok(s.pozycja)}%`)
    .join(', ')
  return w.rodzaj === 'radialny'
    ? `radial-gradient(circle at 50% 50%, ${stopy})`
    : `linear-gradient(${ok(w.kat)}deg, ${stopy})`
}

/**
 * Wypełnienie kształtu SVG. Gradient wymaga wpisu w `<defs>`, więc
 * zwracamy obie rzeczy naraz — wołający wstawia `defs` i używa `fill`.
 */
export interface WypelnienieSvg {
  fill: string
  defs: string
}

export function svgWypelnienie(w: Wypelnienie | undefined, idGradientu: string): WypelnienieSvg {
  if (!w || w.rodzaj === 'brak') return { fill: 'none', defs: '' }
  if (w.rodzaj === 'jednolite') return { fill: naRgba(w.kolor, w.krycie), defs: '' }

  const stopy = uporzadkowaneStopnie(w)
    .map(s => `<stop offset="${ok(s.pozycja)}%" stop-color="${naRgba(s.kolor, w.krycie)}" />`)
    .join('')

  if (w.rodzaj === 'radialny') {
    return {
      fill: `url(#${idGradientu})`,
      defs: `<radialGradient id="${idGradientu}" cx="50%" cy="50%" r="50%">${stopy}</radialGradient>`,
    }
  }

  // CSS liczy kąt od „w górę” zgodnie z ruchem wskazówek; SVG chce wektora.
  const rad = ((w.kat - 90) * Math.PI) / 180
  const x1 = ok(50 - Math.cos(rad) * 50)
  const y1 = ok(50 - Math.sin(rad) * 50)
  const x2 = ok(50 + Math.cos(rad) * 50)
  const y2 = ok(50 + Math.sin(rad) * 50)
  return {
    fill: `url(#${idGradientu})`,
    defs: `<linearGradient id="${idGradientu}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stopy}</linearGradient>`,
  }
}

/* ── Obrys ───────────────────────────────────────────────────────── */

export type PozycjaObrysu = 'wewnatrz' | 'srodek' | 'zewnatrz'

export interface Strony {
  gora: boolean
  prawo: boolean
  dol: boolean
  lewo: boolean
}

export interface Obrys {
  wlaczony: boolean
  kolor: string
  grubosc: number
  pozycja: PozycjaObrysu
  strony: Strony
  krycie: number
}

export const WSZYSTKIE_STRONY: Strony = { gora: true, prawo: true, dol: true, lewo: true }

export function nowyObrys(kolor = 'rgba(255,255,255,0.14)'): Obrys {
  return { wlaczony: true, kolor, grubosc: 1, pozycja: 'srodek', strony: { ...WSZYSTKIE_STRONY }, krycie: 1 }
}

export function wszystkieStrony(s: Strony): boolean {
  return s.gora && s.prawo && s.dol && s.lewo
}

/**
 * Obrys warstwy DOM. Przy pełnych stronach używamy `border` — najkrótszy
 * zapis i poprawnie zaokrągla się razem z `border-radius`. Przy wybranych
 * bokach schodzimy na `border-<bok>`, bo inaczej nie da się pominąć jednej
 * krawędzi.
 *
 * Pozycja: CSS nie ma „na zewnątrz”, więc zewnętrzny obrys realizujemy
 * przez `outline` (rysowany poza pudełkiem), a wewnętrzny i środkowy
 * przez `border` — warstwy i tak mają `box-sizing: border-box`.
 */
export function cssObrys(o: Obrys | undefined): Record<string, string | number> {
  if (!o || !o.wlaczony || o.grubosc <= 0) return {}
  const kolor = naRgba(o.kolor, o.krycie)

  if (o.pozycja === 'zewnatrz' && wszystkieStrony(o.strony)) {
    return { outline: `${ok(o.grubosc)}px solid ${kolor}`, outlineOffset: 0 }
  }
  if (wszystkieStrony(o.strony)) {
    return { border: `${ok(o.grubosc)}px solid ${kolor}` }
  }
  const styl: Record<string, string> = {}
  if (o.strony.gora) styl.borderTop = `${ok(o.grubosc)}px solid ${kolor}`
  if (o.strony.prawo) styl.borderRight = `${ok(o.grubosc)}px solid ${kolor}`
  if (o.strony.dol) styl.borderBottom = `${ok(o.grubosc)}px solid ${kolor}`
  if (o.strony.lewo) styl.borderLeft = `${ok(o.grubosc)}px solid ${kolor}`
  return styl
}

/* ── Cienie i podświetlenie ──────────────────────────────────────── */

export type RodzajCienia = 'zewnetrzny' | 'wewnetrzny'

export interface Cien {
  id: string
  wlaczony: boolean
  rodzaj: RodzajCienia
  /** kierunek padania w stopniach; 0° = w dół, rośnie zgodnie z zegarem */
  kat: number
  odleglosc: number
  rozmycie: number
  /** rozlanie (spread) — powiększa cień bez rozmywania; tym robi się glow */
  rozlanie: number
  kolor: string
  /** siła 0–1, mnożona w krycie koloru */
  sila: number
}

export function nowyCien(czesciowy: Partial<Cien> = {}): Cien {
  return {
    id: nowyId('c'),
    wlaczony: true,
    rodzaj: 'zewnetrzny',
    kat: 0,
    odleglosc: 18,
    rozmycie: 40,
    rozlanie: -18,
    kolor: '#000000',
    sila: 0.65,
    ...czesciowy,
  }
}

/** Preset „podświetlenie” — glow bez przesunięcia, z dodatnim rozlaniem. */
export function nowyGlow(kolor: string): Cien {
  return nowyCien({ kat: 0, odleglosc: 0, rozmycie: 26, rozlanie: 2, kolor, sila: 0.85 })
}

/** Przesunięcie cienia z kąta i odległości. 0° celowo znaczy „w dół”. */
export function przesuniecieCienia(c: Cien): { x: number; y: number } {
  const rad = ((c.kat - 90) * Math.PI) / 180
  return { x: ok(Math.cos(rad) * c.odleglosc), y: ok(Math.sin(rad) * c.odleglosc) }
}

export function cssCien(c: Cien): string {
  const { x, y } = przesuniecieCienia(c)
  const wewn = c.rodzaj === 'wewnetrzny' ? 'inset ' : ''
  return `${wewn}${x}px ${y}px ${ok(c.rozmycie)}px ${ok(c.rozlanie)}px ${naRgba(c.kolor, c.sila)}`
}

/** Wartość dla CSS `box-shadow`; `undefined`, gdy nic nie jest włączone. */
export function cssCienie(cienie: Cien[] | undefined): string | undefined {
  const czynne = (cienie ?? []).filter(c => c.wlaczony)
  if (czynne.length === 0) return undefined
  return czynne.map(cssCien).join(', ')
}

/* ── Złożenie w styl warstwy ──────────────────────────────────────
 * Zwracamy zwykły obiekt (nie React.CSSProperties), bo ten sam wynik
 * konsumuje renderer kanwy i generator kodu w `eksport.ts`. Klucze są
 * w camelCase — React tego chce, a eksport i tak zapisuje literał JSX.
 */

export function stylWygladu(w: Wyglad | undefined, promien: number): Record<string, string | number> {
  if (!w) return {}
  const styl: Record<string, string | number> = {}

  const tlo = cssTlo(w.wypelnienie)
  if (tlo !== undefined) styl.background = tlo

  Object.assign(styl, cssObrys(w.obrys))

  const cienie = cssCienie(w.cienie)
  if (cienie !== undefined) styl.boxShadow = cienie

  if (w.rozmycieTla && w.rozmycieTla > 0) {
    const nasycenie = w.nasycenieTla ?? 100
    const filtr = `blur(${ok(w.rozmycieTla)}px) saturate(${ok(nasycenie)}%)`
    styl.backdropFilter = filtr
    styl.WebkitBackdropFilter = filtr
  }

  if (Object.keys(styl).length > 0) styl.borderRadius = promien
  return styl
}

/** Czy węzeł ma cokolwiek ustawione parametrycznie. */
export function maWyglad(w: Wyglad | undefined): boolean {
  if (!w) return false
  return Boolean(
    (w.wypelnienie && w.wypelnienie.rodzaj !== 'brak') ||
      (w.obrys && w.obrys.wlaczony) ||
      (w.cienie && w.cienie.some(c => c.wlaczony)) ||
      (w.rozmycieTla && w.rozmycieTla > 0),
  )
}

/**
 * Wygląd startowy dla węzła, zbudowany z jego starych pól. Wołane, gdy
 * użytkownik pierwszy raz otwiera sekcję wyglądu — żeby nie zobaczył
 * pustych kontrolek, tylko to, co faktycznie widzi na kanwie.
 */
export function wygladZWezla(wezel: Wezel): Wyglad {
  const kolor = wezel.wypelnienie && wezel.wypelnienie !== 'none' ? wezel.wypelnienie : (wezel.akcent ?? '#38bdf8')
  const wyp = noweWypelnienie(kolor)
  if (wezel.wypelnienie === 'none') wyp.rodzaj = 'brak'
  const obr = nowyObrys(wezel.obrys && wezel.obrys !== 'transparent' ? wezel.obrys : 'rgba(255,255,255,0.14)')
  obr.grubosc = wezel.grubosc ?? 1
  obr.wlaczony = Boolean(wezel.obrys && wezel.obrys !== 'transparent' && (wezel.grubosc ?? 0) > 0)
  return { wypelnienie: wyp, obrys: obr, cienie: [] }
}

/**
 * Cienie dla kształtu SVG. `drop-shadow` nie zna rozlania ani cienia
 * wewnętrznego, więc rozlanie doliczamy do rozmycia (najbliżej wizualnie),
 * a cienie wewnętrzne pomijamy — na konturze i tak nie mają sensu.
 */
export function filtrSvgCieni(cienie: Cien[] | undefined): string | undefined {
  const czynne = (cienie ?? []).filter(c => c.wlaczony && c.rodzaj === 'zewnetrzny')
  if (czynne.length === 0) return undefined
  return czynne
    .map(c => {
      const { x, y } = przesuniecieCienia(c)
      const promien = Math.max(0, c.rozmycie / 2 + c.rozlanie / 2)
      return `drop-shadow(${x}px ${y}px ${ok(promien)}px ${naRgba(c.kolor, c.sila)})`
    })
    .join(' ')
}
