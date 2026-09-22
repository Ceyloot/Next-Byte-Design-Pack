/**
 * Model danych edytora.
 *
 * Scena to płaska lista węzłów (`Wezel`) ułożonych od spodu do wierzchu.
 * Węzeł jest albo kształtem wektorowym (renderowanym jako SVG), albo
 * kafelkiem/przyciskiem (renderowanym jako zwykły DOM, żeby glassmorphism,
 * backdrop-filter i gradienty działały tak samo jak w docelowym kodzie).
 */

export type TypWezla =
  | 'prostokat'
  | 'elipsa'
  | 'sciezka'
  | 'tekst'
  | 'kafelek'
  | 'przycisk'

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

export interface Wezel {
  id: string
  typ: TypWezla
  nazwa: string

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
}

export type Narzedzie = 'wybor' | 'prostokat' | 'elipsa' | 'piora' | 'tekst' | 'reka'

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
