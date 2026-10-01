/**
 * Warstwa dostawcy generacji — jedyne miejsce, przez które Canvas rozmawia
 * z modelem. Podmiana Runware na innego dostawcę to zmiana tego pliku,
 * bez dotykania płótna, pinesek i paska polecenia.
 */
import type { WynikGeneracji, ZadanieGeneracji } from './runware-proxy'
import type { Plan, Sprawdzenie, ZadaniePlanu, ZadanieSprawdzenia } from './agent-proxy'
import { etykietaPineski, zmniejszDoAnalizy, type AnalizaPineski, type Pineska, type Warstwa } from './typy'

/** Koszt pokazywany przed generacją — z cennika NextByte („4 ⟠ za obraz”). */
export const BYTE_ZA_OBRAZ = 4

export interface Generacja {
  obrazUrl: string
  /** realny koszt z API, w USD — do kontroli marży, nie dla klienta */
  kosztUSD: number
  model: string
  /** co się zmieniło, po polsku — patrz `opiszZmiane` */
  opis: string
  nazwa: string
}

/**
 * Nazwa warstwy z wyniku, w stylu `szopa_na_ganku`.
 *
 * Bierzemy nazwy uchwytów, bo to one niosą sens polecenia. Gdy pinesek nie
 * ma, schodzimy do pierwszych słów tekstu — nigdy do „Wynik 3”, bo po
 * dziesięciu generacjach taka nazwa nic nie mówi.
 */
export function nazwijWynik(tekst: string, pineski: Pineska[]): string {
  const slug = (v: string) =>
    v
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/ł/g, 'l')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

  if (pineski.length > 0) {
    const czesci = pineski.slice(0, 3).map((p, i) => slug(etykietaPineski(p, i + 1))).filter(Boolean)
    if (czesci.length > 0) return czesci.join('_na_')
  }
  return slug(tekst.split(/\s+/).slice(0, 4).join(' ')) || 'wynik'
}

/**
 * Opis zmiany po polsku.
 *
 * Runware zwraca sam obraz — opis „co się zmieniło” pochodziłby z modelu
 * tekstowego, czyli drugiego płatnego wywołania. Na razie składamy go
 * lokalnie z polecenia i uchwytów: mówi, o co prosiliśmy i czego dotyczyło,
 * i nie udaje, że model sam to opisał. Podmiana na prawdziwe porównanie
 * przed/po to zamiana ciała tej jednej funkcji.
 */
export function opiszZmiane(tekst: string, pineski: Pineska[], warstwaZrodlowa: Warstwa): string {
  const zdania: string[] = []
  const polecenie = tekst.trim().replace(/\s+/g, ' ')
  zdania.push(`Polecenie: „${polecenie}”.`)

  if (pineski.length > 0) {
    const lista = pineski.map((p, i) => `„${etykietaPineski(p, i + 1)}”`).join(', ')
    zdania.push(
      pineski.length === 1
        ? `Model dostał wskazany obiekt: ${lista}, razem z jego położeniem na zdjęciu.`
        : `Model dostał wskazane obiekty: ${lista}, każdy z położeniem na zdjęciu.`,
    )
  }

  zdania.push(`Wejściem było „${warstwaZrodlowa.name}” w pełnej rozdzielczości ${warstwaZrodlowa.naturalWidth}×${warstwaZrodlowa.naturalHeight}.`)
  return zdania.join(' ')
}

/** Strzał do modelu. Rzuca `Error` z treścią po polsku — do pokazania wprost. */
export async function generuj(zadanie: ZadanieGeneracji): Promise<WynikGeneracji> {
  const odp = await fetch('/api/canvas/generuj', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zadanie),
  })

  const tresc = (await odp.json().catch(() => ({}))) as Partial<WynikGeneracji> & { blad?: string }
  if (!odp.ok) throw new Error(tresc.blad ?? `Model odpowiedział błędem ${odp.status}`)
  if (!tresc.obrazUrl) throw new Error('Model nie zwrócił obrazu')

  return tresc as WynikGeneracji
}

/**
 * Rozpoznanie obiektu pod pineską — przez serwer (Gemini, klucz tylko
 * w .env.local). Bezpośrednie wywołania z przeglądarki zostały usunięte:
 * klucz w bundlu wyciekł i Google go unieważnił (28.09).
 */
export async function rozpoznajObiekt(
  wycinek: string,
  tryb: 'obiekt' | 'scena' = 'obiekt',
): Promise<string[]> {
  try {
    const odp = await fetch('/api/canvas/rozpoznaj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wycinek, tryb }),
    })
    if (!odp.ok) return []
    const tresc = (await odp.json()) as { nazwy?: string[] }
    return tresc.nazwy ?? []
  } catch {
    return []
  }
}

/** Wyczerpujący opis wizualny jednego obiektu w centrum wycinka (po angielsku); pusty, gdy się nie uda. */
export async function opiszObiektSzczegolowo(wycinek: string): Promise<string> {
  try {
    const odp = await fetch('/api/canvas/rozpoznaj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wycinek, tryb: 'opis' }),
    })
    if (!odp.ok) return ''
    const tresc = (await odp.json()) as { opis?: string }
    return tresc.opis?.trim() ?? ''
  } catch {
    return ''
  }
}

/** Opis rzeczy pod pineską + ciasna ramka [ymin,xmin,ymax,xmax] 0–1000 w wycinku (do inteligentnego zbliżenia). */
export async function opiszRzeczZRamka(wycinek: string): Promise<{ opis: string; box?: [number, number, number, number] }> {
  try {
    const odp = await fetch('/api/canvas/rozpoznaj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wycinek, tryb: 'opis' }),
    })
    if (!odp.ok) return { opis: '' }
    const tresc = (await odp.json()) as { opis?: string; box?: number[] }
    const b = tresc.box
    return { opis: tresc.opis?.trim() ?? '', box: b && b.length === 4 ? [b[0], b[1], b[2], b[3]] : undefined }
  } catch {
    return { opis: '' }
  }
}

/** Karta tożsamości osoby (EN) + ramka twarzy [ymin,xmin,ymax,xmax] 0–1000 w wycinku; pusta, gdy się nie uda. */
export async function opiszOsobeSzczegolowo(wycinek: string): Promise<{ opis: string; twarz?: [number, number, number, number] }> {
  try {
    const odp = await fetch('/api/canvas/rozpoznaj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wycinek, tryb: 'osoba' }),
    })
    if (!odp.ok) return { opis: '' }
    const tresc = (await odp.json()) as { opis?: string; twarz?: number[] }
    const t = tresc.twarz
    return { opis: tresc.opis?.trim() ?? '', twarz: t && t.length === 4 ? [t[0], t[1], t[2], t[3]] : undefined }
  } catch {
    return { opis: '' }
  }
}

/** Inwentarz sceny — co w ogóle jest na zdjęciu. */
export async function rozpoznajScene(zdjecie: string): Promise<string[]> {
  const male = await zmniejszDoAnalizy(zdjecie)
  return rozpoznajObiekt(male || zdjecie, 'scena')
}

/* ── Agent reżyserski ────────────────────────────────────────────── */

import { narysujMapeMiejsc } from './mapa-miejsc'
import type { RodzajPunktu } from './uklad-pinesek'

/**
 * Analiza pineski zaraz po wbiciu: całe zdjęcie z jednym celownikiem, żeby
 * model widział punkty odniesienia do skali (koła, drzwi, ludzi). Zwraca
 * `null` przy awarii — pineska dostaje wtedy nazwy z samego rozpoznania.
 */
export async function analizujPineske(
  pineska: Pineska,
  warstwa: Warstwa,
): Promise<{ nazwy: string[]; analiza: AnalizaPineski } | null> {
  try {
    const obraz = await narysujMapeMiejsc(warstwa, [pineska])
    if (!obraz) return null
    const odp = await fetch('/api/canvas/analizuj-pineske', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obraz }),
    })
    if (!odp.ok) return null
    const wynik = (await odp.json()) as { nazwy?: string[]; analiza?: AnalizaPineski }
    return wynik.analiza?.obiekt ? { nazwy: wynik.nazwy ?? [], analiza: wynik.analiza } : null
  } catch {
    return null
  }
}

/** Analiza pineski jako tekst dla reżysera — liczby, interakcja, orientacja 3D i światło. */
export function opisAnalizy(a: AnalizaPineski | undefined): string {
  if (!a) return ''
  const wymiary = [
    a.wysokoscCm ? `height ≈ ${a.wysokoscCm} cm` : '',
    a.dlugoscCm ? `length ≈ ${a.dlugoscCm} cm` : '',
  ]
    .filter(Boolean)
    .join(', ')
  return [
    a.obiektEn || a.obiekt,
    wymiary && `${wymiary}${a.niepewnoscCm ? ` (± ${a.niepewnoscCm} cm)` : ''}`,
    a.kalibracja && `calibration: ${a.kalibracja}`,
    a.pozycja3d && `3D POSE & ORIENTATION: ${a.pozycja3d}`,
    a.interakcja && `PHYSICAL CONTACT & INTERACTION (DO NOT CUT/ERASE INTERACTING PEOPLE): ${a.interakcja}`,
    a.stanPowierzchni && `SURFACE CONDITION & PATINA: ${a.stanPowierzchni}`,
    a.glebiaOptyka && `DEPTH PLANE & OPTICS: ${a.glebiaOptyka}`,
    a.swiatloWektory && `LIGHT VECTORS: ${a.swiatloWektory}`,
    a.otoczenie && `surroundings: ${a.otoczenie}`,
    a.dwuznacznosc && `AMBIGUOUS: ${a.dwuznacznosc}`,
  ]
    .filter(Boolean)
    .join('; ')
}

/**
 * Rzecz czy miejsce pod każdą pineską — wejście dla `ustalUklad`.
 * Zwraca `null` przy awarii; generacja idzie wtedy na domyśle z kolejności.
 */
export async function klasyfikujPineski(
  pineski: Pineska[],
  warstwy: Warstwa[],
): Promise<Record<string, RodzajPunktu> | null> {
  const uchwyty = pineski.filter(p => !p.chroniona)
  if (uchwyty.length < 2) return null
  try {
    const obrazy = await Promise.all(
      uchwyty.map(p => {
        const w = warstwy.find(x => x.id === p.layerId)
        return w ? narysujMapeMiejsc(w, [p]) : Promise.resolve('')
      }),
    )
    if (obrazy.some(o => !o)) return null
    const odp = await fetch('/api/canvas/klasyfikuj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obrazy }),
    })
    if (!odp.ok) return null
    const wynik = (await odp.json()) as { pineski?: { rodzaj: RodzajPunktu }[] }
    if (!wynik.pineski || wynik.pineski.length !== uchwyty.length) return null
    return Object.fromEntries(uchwyty.map((p, i) => [p.id, wynik.pineski![i].rodzaj]))
  } catch {
    return null
  }
}

/**
 * Plan przed generacją. Rzuca błąd po polsku, gdy agent zawiedzie —
 * generacja bez planu dawała zdjęcie bez zmian za pełną cenę, więc lepiej
 * zatrzymać się i powiedzieć dlaczego.
 */
export async function zaplanuj(zadanie: ZadaniePlanu): Promise<Plan> {
  let odp: Response
  try {
    odp = await fetch('/api/canvas/planuj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zadanie),
    })
  } catch {
    throw new Error('Asystent nie odpowiada — sprawdź, czy serwer podglądu działa.')
  }
  const tresc = (await odp.json().catch(() => ({}))) as Partial<Plan> & { blad?: string }
  if (!odp.ok) {
    const powod = tresc.blad ?? `błąd ${odp.status}`
    const klucz = /401|403|API key|UNAUTHENTICATED|klucz/i.test(powod)
    throw new Error(
      klucz
        ? 'Asystent nie przeanalizował zdjęć: klucz Gemini w .env.local jest nieprawidłowy. Nic nie wygenerowano, nie pobrano opłaty.'
        : `Asystent nie przeanalizował zdjęć (${powod}). Nic nie wygenerowano, nie pobrano opłaty.`,
    )
  }
  return tresc as Plan
}

/**
 * Kontrola po generacji: agent porównuje przed i po.
 *
 * To jest odpowiedź na powtarzający się problem — wynik wyglądał dobrze na
 * miniaturze, a dopiero powiększenie pokazywało wypalony celownik albo
 * obiekt w złym miejscu. Teraz patrzy na to maszyna, od razu.
 */
export async function sprawdzWynik(zadanie: ZadanieSprawdzenia): Promise<Sprawdzenie | null> {
  try {
    const odp = await fetch('/api/canvas/sprawdz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zadanie),
    })
    if (!odp.ok) return null
    return (await odp.json()) as Sprawdzenie
  } catch {
    return null
  }
}

/**
 * Zamek tożsamości osoby spod pineski (analiza biometryczna jak w Studiu Zdjęć,
 * poz. 47–50). Obraz to zdjęcie z jednym celownikiem na tej osobie.
 * Zwraca `null` przy awarii — generacja idzie wtedy bez zamka.
 */
export async function analizujTozsamosc(obrazZCelownikiem: string): Promise<string | null> {
  try {
    const odp = await fetch('/api/canvas/tozsamosc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obraz: obrazZCelownikiem }),
    })
    if (!odp.ok) return null
    const tresc = (await odp.json()) as { zamek?: string }
    return tresc.zamek?.trim() || null
  } catch {
    return null
  }
}

/**
 * Gdzie na obrazie stoi wstawiony obiekt — prostokąt 0–1 (od lewego górnego rogu).
 * `null`, gdy go nie znaleziono albo pomiar zawiódł.
 */
export async function zmierzObiekt(
  obraz: string,
  obiekt: string,
): Promise<{ x0: number; y0: number; x1: number; y1: number } | null> {
  try {
    const odp = await fetch('/api/canvas/zmierz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obraz, obiekt }),
    })
    if (!odp.ok) return null
    const tresc = (await odp.json()) as { box?: { x0: number; y0: number; x1: number; y1: number } | null }
    return tresc.box ?? null
  } catch {
    return null
  }
}

/** Usunięcie obiektu po masce (biały = do usunięcia) dedykowanym modelem do wymazywania; rzuca błąd, gdy się nie uda. */
export async function usunPoMasce(obraz: string, maska: string): Promise<WynikGeneracji> {
  const odp = await fetch('/api/canvas/usun', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ obraz, maska }),
  })
  const tresc = (await odp.json().catch(() => ({}))) as Partial<WynikGeneracji> & { blad?: string }
  if (!odp.ok || !tresc.obrazUrl) throw new Error(tresc.blad ?? `Usuwanie nie powiodło się (${odp.status})`)
  return tresc as WynikGeneracji
}
