/**
 * Warstwa dostawcy generacji — jedyne miejsce, przez które Canvas rozmawia
 * z modelem. Podmiana Runware na innego dostawcę to zmiana tego pliku,
 * bez dotykania płótna, pinesek i paska polecenia.
 */
import type { WynikGeneracji, ZadanieGeneracji } from './runware-proxy'
import type { Plan, Sprawdzenie, ZadaniePlanu, ZadanieSprawdzenia } from './agent-proxy'
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

import { geminiRozpoznajWycinek } from './gemini-client'

/**
 * Mikro-AI rozpoznające obiekt pod pineską bezpośrednio przez Gemini 2.5 Flash Vision.
 *
 * Działa błyskawicznie (200-300 ms), widzi wycinek wokół pineski i zwraca
 * precyzyjne nazwy po polsku wprost do uchwytu.
 */
export async function rozpoznajObiekt(
  wycinek: string,
  tryb: 'obiekt' | 'scena' = 'obiekt',
): Promise<string[]> {
  try {
    // 1. Bezpośrednie, natychmiastowe zapytanie do Gemini Flash Vision
    const nazwyGemini = await geminiRozpoznajWycinek(wycinek, tryb)
    if (nazwyGemini.length > 0) return nazwyGemini

    // 2. Fallback przez lokalne proxy serwera
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
 * Inwentarz sceny — co w ogóle jest na zdjęciu (Gemini Vision).
 */
export async function rozpoznajScene(zdjecie: string): Promise<string[]> {
  const male = await zmniejszDoAnalizy(zdjecie)
  return rozpoznajObiekt(male || zdjecie, 'scena')
}

/* ── Agent reżyserski ────────────────────────────────────────────── */

/**
 * Plan przed generacją: agent ogląda zdjęcia i dokłada wiedzę o scenie.
 *
 * Zwraca `null` przy awarii — generacja ma iść dalej na samym rusztowaniu.
 * Agent jest wzmocnieniem, nie warunkiem działania Canvasu.
 */
import { geminiKlasyfikujPineski, geminiPlanujZadanie } from './gemini-client'
import { narysujMapeMiejsc } from './mapa-miejsc'
import { szczegolyZPlanu } from './rezyser'
import type { RodzajPunktu } from './uklad-pinesek'

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
    const wynik = await geminiKlasyfikujPineski(obrazy)
    if (!wynik) return null
    return Object.fromEntries(uchwyty.map((p, i) => [p.id, wynik[i].rodzaj]))
  } catch {
    return null
  }
}

export async function zaplanuj(zadanie: ZadaniePlanu): Promise<Plan | null> {
  try {
    // 1. Próba bezpośredniego agenta Gemini 2.5 Flash
    const bezposredniPlan = await geminiPlanujZadanie(
      zadanie.zadanie,
      zadanie.obrazy,
      zadanie.uchwyty,
    )
    if (bezposredniPlan) {
      return {
        intencja: bezposredniPlan.intencja,
        analiza: bezposredniPlan.analiza,
        doprecyzowanie: bezposredniPlan.scena,
        plan: bezposredniPlan.plan,
        promptDlaModelu: szczegolyZPlanu(bezposredniPlan),
        instrukcja: bezposredniPlan.instrukcja,
        obszar: bezposredniPlan.obszar,
        obszarZrodla: bezposredniPlan.obszarZrodla,
        kosztTokenow: 150,
      }
    }

    // 2. Próba przez serwer
    const odp = await fetch('/api/canvas/planuj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zadanie),
    })
    if (!odp.ok) return null
    return (await odp.json()) as Plan
  } catch {
    return null
  }
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
