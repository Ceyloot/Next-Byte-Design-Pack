import { odciskPinesek, type OpcjaRol } from '../role-z-polecenia'
import type { Pineska, Warstwa } from '../typy'
import type { PinezkaZRola, RodzajZadania, RolaPinezki } from './typy'

/**
 * Role zdjęć i pinesek — deterministyczne, bez wywołań AI.
 *
 * 1. Rodzaj zadania z czasownika (zamień / przenieś / wstaw / usuń, inaczej edycja swobodna).
 * 2. Kolejność pinesek = kolejność, w jakiej użytkownik wymienia je w zdaniu (nazwa pinezki → pierwsze wystąpienie w tekście);
 *    gdy nazw nie widać w tekście, zostaje kolejność wbijania.
 * 3. Zdjęcie-baza i role z czasownika:
 *      zamień X na Y        → X = cel (baza = jego zdjęcie), Y = źródło
 *      zamień… zamiast…     → odwrotnie
 *      przenieś/wstaw X tu  → X = źródło, ostatnia = miejsce (baza = zdjęcie miejsca)
 *      usuń X               → X = cel
 * 4. Gdy pinezki leżą na różnych zdjęciach i kolejności nie da się ustalić — PYTANIE zamiast zgadywania (jedno kliknięcie).
 */

const bez = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')

const USUN = /\b(usun|wymaz|skasuj|wytnij|zniknij|pozbadz)/
const ZAMIEN = /\b(zamien|podmien|zastap|wymien|swap|replace)/
const PRZENIES = /\b(przenies|przesun|przestaw|przeloz)/
const WSTAW = /\b(wstaw|dodaj|umiesc|postaw|poloz|dorysuj|daj)/
const ZAMIAST = /\b(zamiast|w miejsce|na miejsce)\b/

export function wykryjRodzaj(tekst: string): { rodzaj: RodzajZadania; odwrocone: boolean } {
  const t = bez(tekst)
  if (USUN.test(t)) return { rodzaj: 'usun', odwrocone: false }
  if (ZAMIEN.test(t)) return { rodzaj: 'zamien', odwrocone: false }
  if (PRZENIES.test(t)) return { rodzaj: 'przenies', odwrocone: false }
  // „wstaw Y zamiast X” = zamiana, w której pierwsza wymieniona rzecz jest NOWA
  if (WSTAW.test(t) && ZAMIAST.test(t)) return { rodzaj: 'zamien', odwrocone: true }
  if (WSTAW.test(t)) return { rodzaj: 'wstaw', odwrocone: false }
  return { rodzaj: 'edycja', odwrocone: false }
}

export function etykietaPinezki(p: Pineska, numer: number): string {
  return (p.label ?? '').trim() || `obiekt ${numer}`
}

/** Pierwsze wystąpienie nazwy pinezki w zdaniu (rdzeń nazwy, bo zdanie ma odmienione formy: „biznesman” → „biznesmana”). −1, gdy brak. */
function pozycjaWTekscie(tekst: string, p: Pineska): number {
  const rdzen = bez((p.label ?? '').trim().split(/\s+/)[0] ?? '').slice(0, 5)
  if (rdzen.length < 3) return -1
  return bez(tekst).indexOf(rdzen)
}

export interface WejscieRol {
  tekst: string
  pineski: Pineska[]
  /** wszystkie zdjęcia na płótnie (bez ramek generatora) */
  warstwy: Warstwa[]
  /** zaznaczone zdjęcia, gdy nie ma pinesek */
  zaznaczone: string[]
  wybrana: string | null
  /** odpowiedź użytkownika na pytanie o bazę (jedno kliknięcie) */
  odpowiedzBazaId: string | null
}

export type WynikRol =
  | { ok: true; rodzaj: RodzajZadania; baza: Warstwa; referencje: Warstwa[]; pinezki: Omit<PinezkaZRola, 'obraz'>[] }
  | { ok: false; pytanie: import('../role-z-polecenia').PytanieORole }
  | { ok: false; blad: string }

export function rozstrzygnijRole(w: WejscieRol): WynikRol {
  const { rodzaj, odwrocone } = wykryjRodzaj(w.tekst)
  const numerPineski = (p: Pineska) => w.pineski.indexOf(p) + 1
  const warstwa = (id: string) => w.warstwy.find(x => x.id === id)

  // Pinezki w kolejności wymieniania w zdaniu
  const wskazane = w.pineski
    .filter(p => !p.chroniona && warstwa(p.layerId))
    .map((p, i) => ({ p, idx: pozycjaWTekscie(w.tekst, p), i }))
    .sort((a, b) => (a.idx < 0 ? 1e9 : a.idx) - (b.idx < 0 ? 1e9 : b.idx) || a.i - b.i)
  const znaneKolejnosc = wskazane.filter(x => x.idx >= 0).length
  const uporzadkowane = wskazane.map(x => x.p)

  // Bez pinesek: zdjęcie wybrane / zaznaczone
  if (uporzadkowane.length === 0) {
    const ids = w.zaznaczone.length ? w.zaznaczone : w.wybrana ? [w.wybrana] : w.warstwy[0] ? [w.warstwy[0].id] : []
    const baza = ids.length ? warstwa(ids[0]) : undefined
    if (!baza) return { ok: false, blad: 'Nie ma zdjęcia do edycji — wgraj zdjęcie albo zaznacz je na płótnie.' }
    const referencje = ids.slice(1).map(warstwa).filter((x): x is Warstwa => Boolean(x))
    return { ok: true, rodzaj, baza, referencje, pinezki: [] }
  }

  const warstwyPinesek = [...new Set(uporzadkowane.map(p => p.layerId))]

  // Wybór zdjęcia-bazy
  let bazaId: string | null = w.odpowiedzBazaId && warstwa(w.odpowiedzBazaId) ? w.odpowiedzBazaId : null
  if (!bazaId) {
    if (warstwyPinesek.length === 1) {
      bazaId = warstwyPinesek[0]
    } else {
      const jednoznaczne = rodzaj !== 'edycja' && znaneKolejnosc > 0
      if (!jednoznaczne) {
        const opcje: OpcjaRol[] = warstwyPinesek.map(id => ({
          etykieta: `Edytuj „${warstwa(id)!.name}” — pozostałe zdjęcia jako referencje`,
          bazaId: id,
          role: Object.fromEntries(w.pineski.map((p, i) => [i + 1, p.layerId === id ? 'TARGET' : 'DONOR'])) as OpcjaRol['role'],
        }))
        return {
          ok: false,
          pytanie: {
            tresc: 'Które zdjęcie mam edytować? Pozostałe będą tylko źródłem (osoby, rzeczy).',
            opcje,
            odcisk: odciskPinesek(w.pineski),
          },
        }
      }
      const cel = rodzaj === 'zamien' ? (odwrocone ? uporzadkowane[uporzadkowane.length - 1] : uporzadkowane[0]) : uporzadkowane[uporzadkowane.length - 1]
      bazaId = cel.layerId
    }
  }
  const baza = warstwa(bazaId)!

  // Role pinesek
  const naBazie = uporzadkowane.filter(p => p.layerId === bazaId)
  const poza = uporzadkowane.filter(p => p.layerId !== bazaId)
  const role = new Map<Pineska, RolaPinezki>()
  for (const p of poza) role.set(p, 'zrodlo')
  if (rodzaj === 'zamien') {
    if (poza.length === 0 && naBazie.length >= 2) {
      // oba punkty na jednym zdjęciu: pierwszy wymieniony = zamieniany, drugi = źródło (odwrócone: odwrotnie)
      role.set(naBazie[0], odwrocone ? 'zrodlo' : 'cel')
      role.set(naBazie[1], odwrocone ? 'cel' : 'zrodlo')
      for (const p of naBazie.slice(2)) role.set(p, 'obszar')
    } else {
      for (const p of naBazie) role.set(p, 'cel')
    }
  } else if (rodzaj === 'przenies' || rodzaj === 'wstaw') {
    if (poza.length === 0 && naBazie.length >= 2) {
      role.set(naBazie[0], 'zrodlo')
      for (const p of naBazie.slice(1)) role.set(p, 'miejsce')
    } else {
      for (const p of naBazie) role.set(p, 'miejsce')
    }
  } else if (rodzaj === 'usun') {
    for (const p of naBazie) role.set(p, 'cel')
  } else {
    for (const p of naBazie) role.set(p, 'obszar')
  }

  const referencje = [...new Set(poza.map(p => p.layerId))].map(warstwa).filter((x): x is Warstwa => Boolean(x))
  return {
    ok: true,
    rodzaj,
    baza,
    referencje,
    pinezki: uporzadkowane.map(p => ({ numer: numerPineski(p), pineska: p, rola: role.get(p) ?? 'obszar' })),
  }
}
