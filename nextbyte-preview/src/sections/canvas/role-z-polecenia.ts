/**
 * Role obrazów i pinesek ze zdania użytkownika — cztery poziomy, od najpewniejszego.
 *
 *   1. JAWNE słowa: „edytuj zdjęcie 1” → zdjęcie 1 to BAZA; „w stylu zdjęcia 2”
 *      → zdjęcie 2 to referencja stylu; „pineska 2” wskazuje pineskę wprost.
 *   2. GRAMATYKA: „wstaw [kaczkę] obok [gęsi]” → kaczka = obiekt (SOURCE),
 *      gęś = miejsce (DESTINATION); „zamień [poduszkę] na [żabę]” → poduszka
 *      znika (TARGET), żaba przychodzi (DONOR).
 *   3. SEMANTYKA: co leży NA RZECZY, a co NA MIEJSCU (klasyfikacja wzrokiem,
 *      `uklad-pinesek.ts`) — poza tym modułem.
 *   4. PYTANIE: gdy nic z powyższych nie rozstrzyga, pytamy użytkownika jednym
 *      kliknięciem, zamiast zgadywać za pełną cenę generacji.
 *
 * Wzmianki o pineskach to ich nazwy (chipy) w dowolnej odmianie: „kaczka”
 * pasuje do „kaczkę”, „kaczki”, „kaczce”. Poziomy 1 i 2 są deterministyczne —
 * reżyser (Gemini) dostaje ich wynik jako fakty i nie może go odwrócić.
 */
import type { Intencja } from './tryby-edycji'
import type { RolaPineski } from './rezyser'
import { etykietaPineski, type Pineska, type Warstwa } from './typy'

export type PoziomRol = 'jawne' | 'gramatyka' | 'semantyka' | 'uzytkownik'

export interface RozstrzygniecieRol {
  /** numer pineski (od 1) → rola */
  role: Record<number, RolaPineski>
  /** zdjęcie-baza (tu wraca wynik); `null`, gdy zdanie go nie wskazuje */
  baza: Warstwa | null
  poziom: PoziomRol
  /** krótko po polsku, skąd wiemy — do czatu i podglądu promptu */
  powod: string
}

/** Opcja w pytaniu do użytkownika — jedno kliknięcie ustala role. */
export interface OpcjaRol {
  etykieta: string
  role: Record<number, RolaPineski>
  bazaId: string
}

export interface PytanieORole {
  tresc: string
  opcje: OpcjaRol[]
  /** odcisk pinesek, dla których pytanie jest ważne — po zmianie pinesek odpowiedź wygasa */
  odcisk: string
}

/* ── Normalizacja i dopasowanie nazw ─────────────────────────────── */

const bezOgonkow = (t: string) =>
  t
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

interface Slowo {
  tekst: string
  poz: number
}

function slowa(tekst: string): Slowo[] {
  const wynik: Slowo[] = []
  const re = /[\p{L}\d#]+/gu
  let m: RegExpExecArray | null
  while ((m = re.exec(tekst))) wynik.push({ tekst: bezOgonkow(m[0]), poz: wynik.length })
  return wynik
}

/** Rdzeń słowa nazwy odporny na odmianę: „kaczka” → „kacz”, „gęś” → „ges”. */
function rdzen(slowo: string): string {
  const s = bezOgonkow(slowo)
  if (s.length <= 4) return s.slice(0, 3)
  return s.slice(0, Math.max(4, s.length - 2))
}

/** Słowa, które w nazwie pineski nic nie znaczą („obiekt 2”, „ten”). */
const PUSTE_NAZWY = new Set(['obiekt', 'ten', 'ta', 'to', 'na', 'w', 'z', 'do', 'i'])

/** Wzmianka: numer pineski i pozycja (indeks słowa) w zdaniu. */
interface Wzmianka {
  pin: number
  poz: number
}

/**
 * Gdzie w zdaniu pada każda pineska: po nazwie (w dowolnej odmianie)
 * albo wprost („pineska 2”, „pin 2”, „p2”).
 */
function znajdzWzmianki(t: Slowo[], pineski: Pineska[]): Wzmianka[] {
  const wynik: Wzmianka[] = []
  pineski.forEach((p, i) => {
    const numer = i + 1
    if (p.chroniona) return
    // jawny numer pineski
    for (let k = 0; k < t.length; k++) {
      const w = t[k].tekst
      if ((/^(pinesk|pinezk|pin)/.test(w) && t[k + 1]?.tekst === String(numer)) || w === `p${numer}`) {
        wynik.push({ pin: numer, poz: k })
      }
    }
    // nazwa pineski — wszystkie znaczące słowa nazwy muszą paść obok siebie
    const nazwa = slowa(etykietaPineski(p, numer))
      .map(s => s.tekst)
      .filter(s => !PUSTE_NAZWY.has(s) && !/^\d+$/.test(s))
    if (!nazwa.length) return
    const rdzenie = nazwa.map(rdzen)
    for (let k = 0; k + rdzenie.length <= t.length; k++) {
      if (rdzenie.every((r, j) => t[k + j].tekst.startsWith(r))) wynik.push({ pin: numer, poz: k })
    }
  })
  return wynik.sort((a, b) => a.poz - b.poz)
}

/* ── Poziom 1: jawne odwołania do zdjęć ──────────────────────────── */

const ZDJECIE = /^(zdjeci|zdjec|obraz|image|img|foto|fotk|obrazk)/
const EDYCJA = /^(edytuj|zmien|popraw|przerob|pracuj|baza|bazow)/
const STYL = /^(styl|stylu)$/

/** Numer zdjęcia po słowie „zdjęcie” („zdjęcie 2”, „image #2”, „zdjęciu nr 2”). */
function numerZdjeciaPo(t: Slowo[], k: number): number | null {
  for (let j = k + 1; j <= k + 2 && j < t.length; j++) {
    const m = t[j].tekst.match(/^#?(\d+)$/)
    if (m) return Number(m[1])
    if (t[j].tekst !== 'nr' && t[j].tekst !== 'numer') break
  }
  return null
}

interface Jawne {
  baza?: number
  styl: number[]
}

function jawneZdjecia(t: Slowo[]): Jawne {
  const wynik: Jawne = { styl: [] }
  for (let k = 0; k < t.length; k++) {
    if (!ZDJECIE.test(t[k].tekst)) continue
    const n = numerZdjeciaPo(t, k)
    if (!n) continue
    const przed = t.slice(Math.max(0, k - 3), k).map(s => s.tekst)
    if (przed.some(s => STYL.test(s)) || (przed.includes('zgodnie') && przed.includes('z'))) wynik.styl.push(n)
    else if (przed.some(s => EDYCJA.test(s)) || przed.includes('na')) wynik.baza ??= n
  }
  return wynik
}

/* ── Poziom 2: gramatyka zdania ──────────────────────────────────── */

const WSTAW = /^(wstaw|dodaj|przenie|przesun|postaw|umiesc|poloz|wklej|daj|przestaw|wrzuc|dorysuj|posadz|wsadz)/
const ZAMIEN = /^(zamien|podmien|zastap|wymien)/
const PRZYIMEK = new Set(['na', 'do', 'w', 'we', 'obok', 'przy', 'pod', 'nad', 'za', 'przed', 'kolo', 'miedzy', 'tuz', 'blisko', 'przy'])

interface Gramatyka {
  rodzaj: 'wstaw' | 'zamien'
  /** wstaw: obiekt; zamien: to, co znika */
  a: number
  /** wstaw: miejsce; zamien: to, co przychodzi */
  b: number
}

function gramatyka(t: Slowo[], wzmianki: Wzmianka[]): Gramatyka | null {
  const pinPo = (od: number, doK = t.length) => wzmianki.find(w => w.poz >= od && w.poz < doK)
  const inneNiz = (pin: number, od: number) => wzmianki.find(w => w.poz >= od && w.pin !== pin)

  for (let k = 0; k < t.length; k++) {
    const w = t[k].tekst

    // „zamiast A (wstaw) B” / „w miejsce A (wstaw) B” → A znika, B przychodzi
    if (w === 'zamiast' || (w === 'miejsce' && ['w', 'na'].includes(t[k - 1]?.tekst ?? ''))) {
      const a = pinPo(k + 1)
      if (a) {
        const b = inneNiz(a.pin, a.poz + 1) ?? wzmianki.find(x => x.poz < k && x.pin !== a.pin)
        if (b) return { rodzaj: 'zamien', a: a.pin, b: b.pin }
      }
    }

    // „zamień A na B”
    if (ZAMIEN.test(w)) {
      const a = pinPo(k + 1)
      if (!a) continue
      const na = t.findIndex((s, j) => j > a.poz && (s.tekst === 'na' || s.tekst === 'w'))
      const b = na >= 0 ? inneNiz(a.pin, na + 1) : undefined
      if (b) return { rodzaj: 'zamien', a: a.pin, b: b.pin }
    }

    // „wstaw A <przyimek> B” albo „<przyimek> B wstaw A”
    if (WSTAW.test(w)) {
      const a = pinPo(k + 1)
      if (a) {
        const przyimek = t.findIndex((s, j) => j > a.poz && PRZYIMEK.has(s.tekst))
        const b = przyimek >= 0 ? inneNiz(a.pin, przyimek + 1) : undefined
        if (b) return { rodzaj: 'wstaw', a: a.pin, b: b.pin }
        // „wstaw A tutaj” — miejscem jest jedyna inna pineska przed czasownikiem
        const przed = wzmianki.find(x => x.poz < k && x.pin !== a.pin)
        const przyimekPrzed = przed && t.slice(Math.max(0, przed.poz - 2), przed.poz).some(s => PRZYIMEK.has(s.tekst))
        if (przed && przyimekPrzed) return { rodzaj: 'wstaw', a: a.pin, b: przed.pin }
      }
    }
  }
  return null
}

/* ── Złożenie ────────────────────────────────────────────────────── */

/** Odcisk pinesek: po dodaniu, usunięciu albo przesunięciu pineski odpowiedź użytkownika wygasa. */
export function odciskPinesek(pineski: Pineska[]): string {
  return pineski.map(p => `${p.id}@${p.layerId}:${p.normalizedX.toFixed(3)},${p.normalizedY.toFixed(3)}:${p.chroniona ? 1 : 0}`).join('|')
}

/**
 * Poziomy 1–2. Zwraca `null`, gdy zdanie niczego nie rozstrzyga —
 * wtedy wchodzi semantyka (`klasyfikujPineski` + `ustalUklad`).
 */
export function roleZPolecenia(
  tekst: string,
  pineski: Pineska[],
  warstwy: Warstwa[],
  intencja: Intencja,
): RozstrzygniecieRol | null {
  const t = slowa(tekst)
  if (!t.length) return null
  const nazwa = (n: number) => `„${etykietaPineski(pineski[n - 1], n)}”`
  const warstwaPineski = (n: number) => warstwy.find(w => w.id === pineski[n - 1]?.layerId) ?? null

  // Poziom 1 — jawne zdjęcia (numeracja jak kolejność zdjęć na płótnie)
  const jawne = jawneZdjecia(t)
  const bazaJawna = jawne.baza ? warstwy[jawne.baza - 1] ?? null : null
  const role: Record<number, RolaPineski> = {}
  for (const n of jawne.styl) {
    const w = warstwy[n - 1]
    if (!w) continue
    pineski.forEach((p, i) => {
      if (p.layerId === w.id && !p.chroniona) role[i + 1] = 'STYLE'
    })
  }

  // Poziom 2 — gramatyka
  const g = gramatyka(t, znajdzWzmianki(t, pineski))
  if (g) {
    if (g.rodzaj === 'wstaw' && intencja !== 'zamien') {
      role[g.a] = 'SOURCE'
      role[g.b] = 'DESTINATION'
      return {
        role,
        baza: bazaJawna ?? warstwaPineski(g.b),
        poziom: 'gramatyka',
        powod: `Ze zdania: ${nazwa(g.a)} to obiekt, a ${nazwa(g.b)} to miejsce, w którym ma się znaleźć.`,
      }
    }
    if (g.rodzaj === 'zamien' || intencja === 'zamien') {
      const [znika, przychodzi] = g.rodzaj === 'zamien' ? [g.a, g.b] : [g.b, g.a]
      role[znika] = 'TARGET'
      role[przychodzi] = 'DONOR'
      return {
        role,
        baza: bazaJawna ?? warstwaPineski(znika),
        poziom: 'gramatyka',
        powod: `Ze zdania: ${nazwa(znika)} znika, a w tym miejscu pojawia się ${nazwa(przychodzi)}.`,
      }
    }
  }

  if (bazaJawna || Object.keys(role).length) {
    return {
      role,
      baza: bazaJawna,
      poziom: 'jawne',
      powod: bazaJawna
        ? `Edytowane jest zdjęcie ${warstwy.indexOf(bazaJawna) + 1}, bo tak mówi polecenie.`
        : 'Zdjęcie wskazane jako styl służy tylko za referencję stylu.',
    }
  }
  return null
}

/**
 * Poziom 4 — pytanie, gdy wstawienie / przeniesienie / zamiana ma dwie
 * pineski, a ani zdanie, ani wzrok nie rozstrzygnęły, która jest czym.
 */
export function pytanieORole(pineski: Pineska[], intencja: Intencja): PytanieORole | null {
  if (!['wstaw', 'przenies', 'zamien'].includes(intencja)) return null
  const uchwyty = pineski.map((p, i) => ({ p, n: i + 1 })).filter(x => !x.p.chroniona)
  if (uchwyty.length !== 2) return null
  const [a, b] = uchwyty
  const nazwa = (x: { p: Pineska; n: number }) => `${x.n} „${etykietaPineski(x.p, x.n)}”`
  const zamiana = intencja === 'zamien'
  const opcja = (obiekt: typeof a, miejsce: typeof a): OpcjaRol =>
    zamiana
      ? {
          etykieta: `Zamień ${nazwa(miejsce)} na ${nazwa(obiekt)}`,
          role: { [miejsce.n]: 'TARGET', [obiekt.n]: 'DONOR' },
          bazaId: miejsce.p.layerId,
        }
      : {
          etykieta: `Wstaw ${nazwa(obiekt)} w miejsce pineski ${miejsce.n}`,
          role: { [obiekt.n]: 'SOURCE', [miejsce.n]: 'DESTINATION' },
          bazaId: miejsce.p.layerId,
        }
  return {
    tresc: zamiana
      ? 'Nie wiem na pewno, co ma zniknąć, a co przyjść na jego miejsce. Wybierz:'
      : 'Nie wiem na pewno, co jest obiektem, a co miejscem. Wybierz:',
    opcje: [opcja(a, b), opcja(b, a)],
    odcisk: odciskPinesek(pineski),
  }
}
