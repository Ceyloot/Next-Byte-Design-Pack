/**
 * Warstwa dostawcy generacji — jedyne miejsce, przez które Canvas rozmawia
 * z modelem. Podmiana Runware na innego dostawcę to zmiana tego pliku,
 * bez dotykania płótna, pinesek i paska polecenia.
 */
import type { WynikGeneracji, ZadanieGeneracji } from './runware-proxy'
import { etykietaPineski, zmniejszDoAnalizy, type Pineska, type Warstwa } from './typy'

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
 * Mikro-AI rozpoznające obiekt pod pineską.
 *
 * Osobne, tanie zadanie `caption` u Runware — nie generator. Nazwa uchwytu
 * jest tym, na co powołujesz się w poleceniu, więc im szybciej pojawi się
 * sama, tym mniej pracy zostaje po stronie człowieka. Cisza przy błędzie
 * jest celowa: to udogodnienie, a nie warunek działania Canvasu.
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

/**
 * Inwentarz sceny — co w ogóle jest na zdjęciu.
 *
 * Leci raz, zaraz po wrzuceniu zdjęcia na płótno, jeszcze zanim użytkownik
 * cokolwiek kliknie. Dzięki temu pineska wbita w miejsce, którego wycinek
 * jest nieczytelny (kawałek trawy, fragment nieba), i tak ma z czego wziąć
 * nazwę — wcześniej zostawało bezużyteczne „obiekt 1”.
 */
export async function rozpoznajScene(zdjecie: string): Promise<string[]> {
  // Zmniejszamy przed wysyłką: pełne zdjęcie potrafi mieć 5 MB w base64,
  // a model opisujący odrzucał takie żądania błędem 500.
  const male = await zmniejszDoAnalizy(zdjecie)
  return rozpoznajObiekt(male || zdjecie, 'scena')
}
