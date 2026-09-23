/**
 * Model danych edytora.
 *
 * Scena to płaska lista węzłów (`Wezel`) ułożonych od spodu do wierzchu.
 * Węzeł jest albo kształtem wektorowym (renderowanym jako SVG), albo
 * kafelkiem/przyciskiem (renderowanym jako zwykły DOM, żeby glassmorphism,
 * backdrop-filter i gradienty działały tak samo jak w docelowym kodzie).
 */

// Import tylko typów — dzięki temu cykl z `wyglad.ts` (który potrzebuje
// stąd `nowyId`) znika przy kompilacji i nie powstaje w module runtime.
import type { Cien, Obrys, Wypelnienie } from './wyglad'
import type { Przejscie, Stan } from './stany'

export type TypWezla =
  | 'prostokat'
  | 'elipsa'
  | 'sciezka'
  | 'tekst'
  | 'kafelek'
  | 'przycisk'
  | 'obraz'
  | 'grupa'

/** Punkt ścieżki. Uchwyty są w układzie lokalnym węzła, absolutnie (nie delty). */
export interface Punkt {
  x: number
  y: number
  /** uchwyt „wejściowy” (przed punktem) — brak = ostry narożnik */
  wx?: number
  wy?: number
  /** uchwyt „wyjściowy” (za punktem) */
  zx?: number
  zy?: number
}

/** Właściwości, które da się animować na osi czasu. */
export type Wlasciwosc = 'x' | 'y' | 'skala' | 'obrot' | 'krycie'

export const WLASCIWOSCI: { klucz: Wlasciwosc; etykieta: string; jednostka: string; krok: number }[] = [
  { klucz: 'x',      etykieta: 'Pozycja X', jednostka: 'px',  krok: 1 },
  { klucz: 'y',      etykieta: 'Pozycja Y', jednostka: 'px',  krok: 1 },
  { klucz: 'skala',  etykieta: 'Skala',     jednostka: '×',   krok: 0.01 },
  { klucz: 'obrot',  etykieta: 'Obrót',     jednostka: '°',   krok: 1 },
  { klucz: 'krycie', etykieta: 'Krycie',    jednostka: '',    krok: 0.01 },
]

export type Wygladzanie = 'liniowe' | 'łagodne' | 'wejście' | 'wyjście' | 'sprężyste' | 'skok'

export interface Klatka {
  id: string
  wlasciwosc: Wlasciwosc
  /** czas w milisekundach od początku osi */
  czas: number
  wartosc: number
  /** wygładzanie segmentu prowadzącego DO następnej klatki */
  wygladzanie: Wygladzanie
}

/** Treść kafelka — świadomie prosta, bo z niej generujemy JSX. */
export interface TrescKafelka {
  znaczek?: string
  tytul?: string
  podtytul?: string
  cena?: string
  sufiks?: string
  punkty?: string[]
  cta?: string
}

export type Efekt = 'brak' | 'glass' | 'liquid' | 'neon' | 'gradient' | 'siatka'

/**
 * Parametryczny wygląd — nowa ścieżka stylowania (gradienty, obrys z
 * pozycją i bokami, lista cieni). Trzymamy to w osobnym obiekcie, a nie
 * rozsypane po węźle, żeby stare pola (`wypelnienie: string`, `obrys`,
 * `grubosc`) dalej działały jako zapas: gdy `wyglad` jest pusty,
 * renderer i eksport czytają je tak jak wcześniej. Dzięki temu projekty
 * zapisane w localStorage przed tą zmianą otwierają się bez migracji.
 */
export interface Wyglad {
  wypelnienie?: Wypelnienie
  obrys?: Obrys
  cienie?: Cien[]
  /** rozmycie tła pod warstwą (glass) w px; 0 = wyłączone */
  rozmycieTla?: number
  /** nasycenie tła pod warstwą w % (razem z rozmyciem daje szkło) */
  nasycenieTla?: number
}

export interface Wezel {
  id: string
  typ: TypWezla
  nazwa: string

  /** id węzła-grupy, do której warstwa należy; brak = korzeń sceny */
  rodzic?: string

  /** ramka w układzie sceny */
  x: number
  y: number
  w: number
  h: number
  obrot: number
  skala: number
  krycie: number

  widoczny: boolean
  zablokowany: boolean

  /* — wektor — */
  wypelnienie?: string
  obrys?: string
  grubosc?: number
  promien?: number
  punkty?: Punkt[]
  zamknieta?: boolean

  /* — tekst — */
  tekst?: string
  rozmiar?: number
  waga?: number
  kolorTekstu?: string

  /* — kafelek / przycisk — */
  tresc?: TrescKafelka
  efekt?: Efekt
  akcent?: string
  /** dodatkowe style CSS doklejane do warstwy (ucieczka awaryjna) */
  styl?: Record<string, string>

  /* — parametryczny wygląd (ma pierwszeństwo nad polami wyżej) — */
  wyglad?: Wyglad

  /* — obraz — */
  /** dataURL albo adres; trzymamy dataURL, żeby projekt był samowystarczalny */
  zrodlo?: string
  /** dopasowanie obrazu do ramki */
  dopasowanie?: 'wypelnij' | 'zmiesc' | 'rozciagnij'

  /* — animacja — */
  klatki: Klatka[]
}

export interface Projekt {
  nazwa: string
  szerokosc: number
  wysokosc: number
  tlo: string
  /** długość osi czasu w ms */
  dlugosc: number
  wezly: Wezel[]
  /** warianty komponentu; brak = projekt sprzed dodania stanów */
  stany?: Stan[]
  /** strzałki między stanami */
  przejscia?: Przejscie[]
}

export type Narzedzie = 'wybor' | 'prostokat' | 'elipsa' | 'piora' | 'tekst' | 'reka' | 'obraz'

let licznik = 0
export function nowyId(prefiks = 'w'): string {
  licznik += 1
  return `${prefiks}${Date.now().toString(36)}${licznik.toString(36)}`
}

/** Baza wspólna dla każdego nowego węzła — żeby nie powtarzać pól. */
export function bazowyWezel(czesciowy: Partial<Wezel> & { typ: TypWezla; nazwa: string }): Wezel {
  return {
    id: nowyId(),
    x: 0,
    y: 0,
    w: 160,
    h: 120,
    obrot: 0,
    skala: 1,
    krycie: 1,
    widoczny: true,
    zablokowany: false,
    wypelnienie: '#38bdf8',
    obrys: 'transparent',
    grubosc: 2,
    promien: 16,
    klatki: [],
    ...czesciowy,
  }
}
