/**
 * Stany komponentu i przejścia między nimi.
 *
 * Model wzięty z tego, jak designer faktycznie myśli o komponencie:
 * jest scena bazowa (stan spoczynkowy) i lista stanów, z których każdy
 * mówi tylko, CO SIĘ RÓŻNI. Dzięki temu poprawka koloru w bazie
 * przechodzi automatycznie na wszystkie stany, zamiast wymagać
 * przeklikania każdego wariantu z osobna.
 *
 * Przejście to strzałka między dwoma stanami: wyzwalacz, krzywa, czas,
 * opóźnienie. Z tego generuje się działający komponent — przełącznik
 * z odbojem to dokładnie dwa stany i dwie strzałki.
 */

import { nowyId, type Wezel } from './typy'
import type { Wygladzanie } from './typy'

export type Wyzwalacz = 'klik' | 'najechanie' | 'auto'

export const WYZWALACZE: { klucz: Wyzwalacz; etykieta: string; tytul: string }[] = [
  { klucz: 'klik', etykieta: 'Klik', tytul: 'Przejście po kliknięciu' },
  { klucz: 'najechanie', etykieta: 'Najazd', tytul: 'Przejście po najechaniu kursorem' },
  { klucz: 'auto', etykieta: 'Auto', tytul: 'Przejście samo, po opóźnieniu' },
]

/** Pola węzła, które wolno nadpisać w stanie. */
export type NadpisanieWezla = Partial<
  Pick<
    Wezel,
    | 'x'
    | 'y'
    | 'w'
    | 'h'
    | 'obrot'
    | 'skala'
    | 'krycie'
    | 'promien'
    | 'widoczny'
    | 'wypelnienie'
    | 'obrys'
    | 'grubosc'
    | 'akcent'
    | 'efekt'
    | 'tekst'
    | 'kolorTekstu'
    | 'wyglad'
  >
>

export interface Stan {
  id: string
  nazwa: string
  /** pozycja kafelka w panelu grafu — nie ma nic wspólnego ze sceną */
  gx: number
  gy: number
  nadpisania: Record<string, NadpisanieWezla>
}

export interface Przejscie {
  id: string
  od: string
  do: string
  wyzwalacz: Wyzwalacz
  /**
   * Warstwa, w którą trzeba kliknąć (albo najechać), żeby przejście
   * zadziałało. Brak = cały komponent. To jest odpowiedź na „klik, ale
   * w co?” — bez tego przejście jest abstrakcją, a nie zachowaniem.
   */
  element?: string
  wygladzanie: Wygladzanie
  /** czas trwania w ms */
  czas: number
  opoznienie: number
}

/** Pseudo-stan bazowy. Nie jest na liście, bo to po prostu sama scena. */
export const ID_BAZY = 'baza'

export function nowyStan(nazwa: string, gx: number, gy: number): Stan {
  return { id: nowyId('st'), nazwa, gx, gy, nadpisania: {} }
}

export function nowePrzejscie(od: string, doStanu: string): Przejscie {
  return {
    id: nowyId('pz'),
    od,
    do: doStanu,
    wyzwalacz: 'klik',
    wygladzanie: 'łagodne',
    czas: 300,
    opoznienie: 0,
  }
}

/* ── Składanie sceny ─────────────────────────────────────────────── */

/**
 * Scena widziana w danym stanie. Bez stanu zwracamy oryginał — ta sama
 * lista, nie kopia, żeby React nie przerysowywał kanwy bez powodu.
 */
export function wezlyWStanie(wezly: Wezel[], stan: Stan | undefined): Wezel[] {
  if (!stan || Object.keys(stan.nadpisania).length === 0) return wezly
  return wezly.map(w => {
    const n = stan.nadpisania[w.id]
    return n ? { ...w, ...n } : w
  })
}

/** Czy węzeł ma w tym stanie cokolwiek własnego — do oznaczeń w warstwach. */
export function maNadpisanie(stan: Stan | undefined, idWezla: string): boolean {
  return Boolean(stan && stan.nadpisania[idWezla] && Object.keys(stan.nadpisania[idWezla]).length > 0)
}

/**
 * Zapisuje zmianę jako nadpisanie stanu. Wartości identyczne z bazą
 * kasujemy — inaczej stan po kilku poprawkach zawierałby kopię całego
 * węzła i przestałby dziedziczyć po scenie.
 */
export function zapiszNadpisanie(stan: Stan, wezelBazowy: Wezel, zmiany: Partial<Wezel>): Stan {
  const biezace = { ...(stan.nadpisania[wezelBazowy.id] ?? {}) } as Record<string, unknown>
  const bazowy = wezelBazowy as unknown as Record<string, unknown>

  for (const [klucz, wartosc] of Object.entries(zmiany)) {
    if (JSON.stringify(bazowy[klucz]) === JSON.stringify(wartosc)) delete biezace[klucz]
    else biezace[klucz] = wartosc
  }

  const nadpisania = { ...stan.nadpisania }
  if (Object.keys(biezace).length === 0) delete nadpisania[wezelBazowy.id]
  else nadpisania[wezelBazowy.id] = biezace as NadpisanieWezla

  return { ...stan, nadpisania }
}

/** Czyści nadpisania węzła — „wróć do bazy”. */
export function wyczyscNadpisanie(stan: Stan, idWezla: string): Stan {
  const nadpisania = { ...stan.nadpisania }
  delete nadpisania[idWezla]
  return { ...stan, nadpisania }
}

/**
 * Które węzły w ogóle biorą udział w zmianach — tylko one dostają
 * `transition` w wygenerowanym kodzie. Nakładanie przejścia na wszystko
 * kosztowałoby wydajność i potrafi zepsuć animacje, których nie ruszamy.
 */
export function wezlyZmienne(stany: Stan[]): Set<string> {
  const zbior = new Set<string>()
  for (const s of stany) for (const id of Object.keys(s.nadpisania)) zbior.add(id)
  return zbior
}

/* ── Opis różnic po ludzku ───────────────────────────────────────
 * Panel ma mówić „Włącznik: przesunięty o 156 px w prawo”, a nie
 * pokazywać surowy obiekt nadpisań. Bez tego nie da się stwierdzić,
 * co stan właściwie robi, bez klikania w niego i porównywania okiem.
 */

export interface RoznicaStanu {
  idWezla: string
  nazwaWezla: string
  opisy: string[]
}

const proc = (v: number) => `${Math.round(v * 100)}%`
const px = (v: number) => `${Math.round(v)} px`

function opisWlasciwosci(klucz: string, przed: unknown, po: unknown): string | null {
  switch (klucz) {
    case 'x': {
      const d = (po as number) - (przed as number)
      return `przesunięty o ${px(Math.abs(d))} w ${d > 0 ? 'prawo' : 'lewo'}`
    }
    case 'y': {
      const d = (po as number) - (przed as number)
      return `przesunięty o ${px(Math.abs(d))} w ${d > 0 ? 'dół' : 'górę'}`
    }
    case 'w':
      return `szerokość ${px(przed as number)} → ${px(po as number)}`
    case 'h':
      return `wysokość ${px(przed as number)} → ${px(po as number)}`
    case 'obrot':
      return `obrót ${Math.round(przed as number)}° → ${Math.round(po as number)}°`
    case 'skala':
      return `skala ${przed as number}× → ${po as number}×`
    case 'krycie':
      return `krycie ${proc(przed as number)} → ${proc(po as number)}`
    case 'widoczny':
      return po ? 'pokazany' : 'ukryty'
    case 'promien':
      return `zaokrąglenie ${px(przed as number)} → ${px(po as number)}`
    case 'grubosc':
      return `grubość obrysu ${px(przed as number)} → ${px(po as number)}`
    case 'wypelnienie':
    case 'akcent':
      return `kolor → ${po}`
    case 'obrys':
      return `kolor obrysu → ${po}`
    case 'kolorTekstu':
      return `kolor tekstu → ${po}`
    case 'tekst':
      return `tekst → „${po}”`
    case 'efekt':
      return `efekt → ${po}`
    case 'wyglad':
      return 'zmieniony wygląd (wypełnienie, obrys lub cień)'
    default:
      return null
  }
}

/** Lista zmian stanu względem sceny bazowej, gotowa do wyświetlenia. */
export function rozniceStanu(stan: Stan, wezly: Wezel[]): RoznicaStanu[] {
  const wynik: RoznicaStanu[] = []
  for (const [idWezla, nadpisanie] of Object.entries(stan.nadpisania)) {
    const bazowy = wezly.find(w => w.id === idWezla)
    if (!bazowy) continue
    const surowy = bazowy as unknown as Record<string, unknown>
    const opisy = Object.entries(nadpisanie)
      .map(([klucz, wartosc]) => opisWlasciwosci(klucz, surowy[klucz], wartosc))
      .filter((o): o is string => o !== null)
    if (opisy.length > 0) wynik.push({ idWezla, nazwaWezla: bazowy.nazwa, opisy })
  }
  return wynik
}

/** Najdłuższe przejście wychodzące ze stanu — potrzebne przy `auto`. */
export function przejsciaZe(przejscia: Przejscie[], idStanu: string): Przejscie[] {
  return przejscia.filter(p => p.od === idStanu)
}
