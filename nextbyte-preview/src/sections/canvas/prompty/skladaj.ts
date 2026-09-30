/**
 * SKŁADARKA — cztery części, nic więcej:
 * =====================================
 *
 *   [TASK]   gotowy prompt operacji wybranej przez Gemini (1–2 zdania)
 *            + jedna linia „Image 1 = scene. Image 2 = reference.”
 *            + po linii na pineskę: „Pin 1 · Image 2 · x=0.58 y=0.40 — "czarny Hyundai…"”
 *   [USER]   słowa użytkownika bez zmian, z pineskami wplecionymi przy słowach,
 *            które je wskazują (robi to `polecenia.ts` przed wywołaniem)
 *   [RULES]  bricki z PDF Studia Zdjęć wybrane przez operację (bricks/index.ts)
 *
 * Opis pineski („badge”) daje Gemini: krótko i tak, żeby odróżnić obiekt od
 * podobnych w kadrze. Rozmiar, światło, kierunek i kontrola wyniku NIE idą do
 * promptu — model je ignorował, a każde zdanie więcej rozmywa polecenie.
 *
 * Tokeny w brickach i operacjach:
 *   {{IMAGE_TARGET}} {{IMAGE_DONOR}} {{DONOR_ROLE}} {{PIN_TARGET}} {{PIN_SOURCE}} {{PIN_CLEAR}}
 */
import type { BrickId, ObrazWejscia, OperationId, OpisSceny, RolaPineski, WymaganieDawcy } from './types'
import { getOperation } from './operacje'
import { BRICKS } from './bricks'
import {
  STUDIO_FACE_KONTROLA,
  STUDIO_FACE_SYSTEM,
  STUDIO_SWAP_KONTROLA,
  STUDIO_SWAP_SYSTEM,
  SYSTEM_KOMPOZYTORA,
  studioFaceBaza,
  studioSwapBaza,
  studioSwapBazaUbranieSceny,
} from './operacje/character-swap-studio'

/** Pineska w układzie wysyłki do generatora (numer obrazu: 1 = docelowy). */
export interface PineskaSklejka {
  numer: number
  rola: RolaPineski
  obraz: number
  /** współrzędne znormalizowane 0–1 (od lewej / od góry) — położenie magentowej kropki */
  x: number
  y: number
  /** opis pineski („badge”) — krótko i odróżniająco, np. „zielony hatchback, lewy z dwóch” */
  nazwa?: string
}

/** Obszar, który ma wyjść z edycji nieodróżnialny od oryginału. */
export interface ObszarChroniony {
  numer: number
  obraz: number
  x?: number
  y?: number
  nazwa?: string
}

export interface SkladajWejscie {
  /** słowa użytkownika — już z wplecionymi pineskami */
  polecenie: string
  operacja: OperationId
  pineski: PineskaSklejka[]
  /** obrazy w kolejności wysyłki do generatora (pierwszy = docelowy) */
  obrazy: ObrazWejscia[]
  /** zmierzone przez reżysera światło i kamera zdjęcia docelowego (EN) */
  swiatlo?: string
  /** opis sceny z analizy Gemini (pipeline w canvas/lib) — nazwy pinesek */
  opis?: OpisSceny
  pineskiChronione?: ObszarChroniony[]
  /** dyrektywy konkretnego stylu artystycznego (dla operacji style_change) */
  dyrektywyStylu?: { nazwa: string; reguly: string[] }
  /** rozmiar obrazu docelowego w pikselach (zachowane dla zgodności wywołań) */
  format?: { szerokosc: number; wysokosc: number }
  /** zamiana postaci: ubranie zostaje ze sceny docelowej (wariant z poz. 21 Studia) */
  ubranieZeSceny?: boolean
  /** czy jako ostatni obraz wysyłamy maskę obszaru pracy */
  maska?: boolean
}

export interface SekcjaPromptu {
  klucz: 'task' | 'user' | 'rules'
  tekst: string
}

export interface SkladajWynik {
  prompt: string
  /** rola modelu — idzie jako settings.systemPrompt, nie w treść promptu */
  system?: string
  /** temperatura modelu obrazu (Studio: swap 0.45, twarz 0.42, poprawka 0.2) */
  temperatura?: number
  sekcje: SekcjaPromptu[]
  operacja: OperationId
  nazwaOperacji: string
  uzyteBricki: BrickId[]
  /** bricki operacji pominięte, bo nie mają zastosowania w tej sytuacji */
  pominieteBricki: BrickId[]
  dawca: WymaganieDawcy
  czystaPlyta: boolean
  /** tokeny, których nie udało się podmienić (powinno być puste) */
  nierozwiazaneTokeny: string[]
}

const wsp = (v: number) => v.toFixed(2)

/** Odwołanie do pineski w treści bricków i operacji. */
function opisPineski(p: PineskaSklejka): string {
  return `Pin ${p.numer} (Image ${p.obraz}, x=${wsp(p.x)} y=${wsp(p.y)})`
}

/** Pineska docelowa: rola target, najlepiej na obrazie docelowym. */
function pineskaCelu(pineski: PineskaSklejka[]): PineskaSklejka | undefined {
  return pineski.find((p) => p.rola === 'target' && p.obraz === 1) ?? pineski.find((p) => p.rola === 'target')
}

function pineskaZrodla(pineski: PineskaSklejka[]): PineskaSklejka | undefined {
  return pineski.find((p) => p.rola === 'source')
}

/**
 * Miejsce do wyczyszczenia zależy od operacji:
 * - zamiana i usunięcie czyszczą miejsce pod pineską docelową,
 * - przeniesienie czyści stare miejsce — o ile leży na obrazie docelowym,
 * - null = nie ma czego czyścić (brick „usunięcie” odpada).
 */
function miejsceCzyszczenia(operacja: OperationId, pineski: PineskaSklejka[]): string | null {
  switch (operacja) {
    case 'object_swap':
    case 'character_swap':
    case 'removal': {
      const cel = pineski.find((p) => p.rola === 'target' && p.obraz === 1)
      return cel ? opisPineski(cel) : 'the object named in the USER request'
    }
    case 'object_transfer':
    case 'character_transfer': {
      const zrodlo = pineskaZrodla(pineski)
      if (!zrodlo) return 'the old position of the object named in the USER request'
      return zrodlo.obraz === 1 ? opisPineski(zrodlo) : null
    }
    default:
      return null
  }
}

/** Numer obrazu-dawcy — `null`, gdy operacja idzie bez zdjęcia-dawcy. */
function numerDawcy(w: SkladajWejscie): number | null {
  const zrodlo = pineskaZrodla(w.pineski)
  if (zrodlo && zrodlo.obraz !== 1) return zrodlo.obraz
  return w.obrazy.find((o) => o.rola === 'donor')?.numer ?? null
}

/** Rola zdjęcia-dawcy w brzmieniu Studia Zdjęć (poz. 7). */
const ROLA_DAWCY: Partial<Record<OperationId, string>> = {
  addition: 'the product to depict faithfully',
  object_swap: 'the product to depict faithfully',
  object_transfer: 'the product to depict faithfully',
  character_transfer: 'the person who must appear in the image — preserve their exact face, hair, skin tone, body and clothing',
  clothing_change: 'the outfit and clothing to wear in the image',
  background_change: 'the location and background of the scene — keep its architecture, lighting and mood',
  style_change: 'a STYLE reference only — borrow its palette, lighting and mood, never its literal content, faces or text',
}
const ROLA_INNA = 'a reference described in the prompt — use it exactly as the prompt says'

/** Operacje z obiektem — rola kompozytora i niższa temperatura. */
const OPERACJE_Z_OBIEKTEM = new Set<OperationId>(['addition', 'object_swap', 'object_transfer', 'character_swap', 'character_transfer'])
/** Operacje, których kroki dublowałyby bricki — wystarczy jedno zdanie zadania. */
const BEZ_KROKOW = new Set<OperationId>(['addition', 'object_swap', 'object_transfer', 'removal', 'character_transfer'])
/** Temperatura operacji z obiektem — niżej niż swap postaci (0.45), bo miejsce zadaje pineska. */
const TEMPERATURA_OBIEKTU = 0.35

const TOKEN = /\{\{\s*([A-Z_]+)\s*\}\}/g

/** Linia obrazów + linie pinesek (część TASK). */
function mapaObrazowIPinesek(w: SkladajWejscie): string {
  const refs = w.obrazy.filter((o) => o.rola === 'donor').map((o) => o.numer)
  const obrazy = [
    'Image 1 = scene.',
    refs.length === 1 ? `Image ${refs[0]} = reference.` : refs.length > 1 ? `Images ${refs.join(', ')} = references.` : '',
    w.maska ? 'Last image = mask of the work area (a guide only).' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const opisy = new Map((w.opis?.pineski ?? []).map((o) => [o.pineska, o.nazwa]))
  const pineski = [...w.pineski]
    .sort((a, b) => a.numer - b.numer)
    .map((p) => {
      const nazwa = p.nazwa || opisy.get(p.numer)
      return `Pin ${p.numer} · Image ${p.obraz} · x=${wsp(p.x)} y=${wsp(p.y)}${nazwa ? ` — "${nazwa}"` : ''}`
    })
  const chronione = (w.pineskiChronione ?? []).map(
    (p) =>
      `Pin ${p.numer} · Image ${p.obraz}${p.x !== undefined && p.y !== undefined ? ` · x=${wsp(p.x)} y=${wsp(p.y)}` : ''}${p.nazwa ? ` — "${p.nazwa}"` : ''} — keep exactly as it is`,
  )
  return [obrazy, ...pineski, ...chronione].join('\n')
}

/** Składa finalny prompt dla modelu obrazu. */
export function skladajPrompt(w: SkladajWejscie): SkladajWynik {
  const op = getOperation(w.operacja)
  const nierozwiazane = new Set<string>()
  const cel = pineskaCelu(w.pineski)
  const zrodlo = pineskaZrodla(w.pineski)
  const czyszczenie = miejsceCzyszczenia(w.operacja, w.pineski)
  const dawca = numerDawcy(w)

  const wartosci: Record<string, string> = {
    IMAGE_TARGET: 'Image 1',
    IMAGE_DONOR: dawca ? `Image ${dawca}` : 'the reference described in the USER request',
    DONOR_ROLE: ROLA_DAWCY[op.id] ?? ROLA_INNA,
    PIN_TARGET: cel ? opisPineski(cel) : 'the marked spot',
    PIN_SOURCE: zrodlo ? opisPineski(zrodlo) : 'the source spot',
    PIN_CLEAR: czyszczenie ?? 'the cleared spot',
  }
  const podmien = (tekst: string): string =>
    tekst.replace(TOKEN, (_m, klucz: string) => {
      if (klucz in wartosci) return wartosci[klucz]
      nierozwiazane.add(klucz)
      return ''
    })

  // [TASK] — prompt operacji (zamiany postaci i twarzy: baza Studia 1:1, poz. 20/21/29)
  let zadanie: string
  let system: string | undefined
  let temperatura: number | undefined
  if (op.gotowy === 'studio-character-swap') {
    const refs = w.obrazy.filter((o) => o.rola === 'donor')
    const opisRefs =
      refs.length > 1
        ? `the character reference images (Images ${refs.map((r) => r.numer).join(', ')}, all showing the SAME person from different angles)`
        : `the character reference image (Image ${refs[0]?.numer ?? 2})`
    zadanie = `${(w.ubranieZeSceny ? studioSwapBazaUbranieSceny : studioSwapBaza)(opisRefs, 'Image 1')}\n${STUDIO_SWAP_KONTROLA}`
    system = STUDIO_SWAP_SYSTEM
    temperatura = 0.45
  } else if (op.gotowy === 'studio-face-swap') {
    const refs = w.obrazy.filter((o) => o.rola === 'donor').map((o) => o.numer)
    zadanie = `${studioFaceBaza('Image 1', refs.length > 1 ? `Images ${refs.join(', ')}` : `Image ${refs[0] ?? 2}`, Math.max(1, refs.length))}\n${STUDIO_FACE_KONTROLA}`
    system = STUDIO_FACE_SYSTEM
    temperatura = 0.42
  } else {
    zadanie = podmien(op.misja) + (BEZ_KROKOW.has(op.id) ? '' : `\n${op.kroki.map((k, i) => `${i + 1}. ${podmien(k)}`).join('\n')}`)
    if (OPERACJE_Z_OBIEKTEM.has(op.id)) {
      system = SYSTEM_KOMPOZYTORA
      temperatura = TEMPERATURA_OBIEKTU
    }
  }
  const styl = w.dyrektywyStylu ? `\nStyle — ${w.dyrektywyStylu.nazwa}: ${w.dyrektywyStylu.reguly.join(' ')}` : ''
  const sekcjaZadania = `[TASK]\n${zadanie}${styl}\n${mapaObrazowIPinesek(w)}`

  // [USER]
  const sekcjaUzytkownika = `[USER]\n${w.polecenie.trim() || op.nazwa}`

  // [RULES] — bricki operacji; bez dawcy odpada referencja, bez starego miejsca odpada usunięcie
  const pominiete: BrickId[] = []
  const wlaczone = op.bricks.filter((id) => {
    const zbedny = (id === 'studio-usuniecie' && czyszczenie === null) || (id === 'studio-referencja' && dawca === null)
    if (zbedny) pominiete.push(id)
    return !zbedny
  })
  const bricki = [...new Set(wlaczone)].map((id) => BRICKS[id]).sort((a, b) => a.numer - b.numer)
  const kropki = w.pineski.length
    ? 'Pin positions are given as x / y fractions of the image (x from the left edge, y from the top edge, 0–1); Image 1 and the references carry no markers.'
    : ''
  const swiatlo = w.swiatlo?.trim()
    ? `THE LIGHT OF IMAGE 1 (measured — the subject must be lit exactly like this, not like its reference): ${w.swiatlo.trim()}`
    : ''
  const sekcjaRegul = ['[RULES]', swiatlo, ...bricki.map((b) => podmien(b.tekst)), kropki].filter(Boolean).join('\n')

  const sekcje: SekcjaPromptu[] = [
    { klucz: 'task', tekst: sekcjaZadania },
    { klucz: 'user', tekst: sekcjaUzytkownika },
    { klucz: 'rules', tekst: sekcjaRegul },
  ]
  return {
    prompt: sekcje.map((s) => s.tekst).join('\n\n'),
    system,
    temperatura,
    sekcje,
    operacja: w.operacja,
    nazwaOperacji: op.nazwa,
    uzyteBricki: bricki.map((b) => b.id),
    pominieteBricki: pominiete,
    dawca: op.dawca,
    czystaPlyta: op.czystaPlyta && czyszczenie !== null,
    nierozwiazaneTokeny: [...nierozwiazane],
  }
}
