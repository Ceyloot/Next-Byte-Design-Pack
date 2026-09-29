/**
 * SKŁADARKA — łączy bricki, operację, opis Gemini i polecenie w jeden prompt.
 * =========================================================================
 * Kolejność sekcji w złożonym prompcie (stała):
 *
 *   0. ALWAYS        — zasada naczelna o jednym ziarnie (też jako ostatnia linia promptu)
 *   1. IMAGES        — który obraz jest czym, w jakiej kolejności wysłany, format wyniku
 *   2. RULE BRICKS   — bricki włączone przez operację, rosnąco po numerze
 *   3. OPERATION     — misja + kroki wybranej operacji (+ DIRECTION od reżysera, + STYLE DIRECTIVES)
 *   4. PIN MAP       — pineski: rola, obraz, współrzędne X/Y, opis miejsca (+ PROTECTED AREAS)
 *   5. SCALE          — rzeczywisty rozmiar obiektu i kotwice skali
 *   6. COMMAND       — słowa użytkownika
 *   7. FINAL CHECK   — trzy sprawdzenia na końcu (pozycja, ziarno, czysty wynik)
 *   8. FINAL QUALITY — blok pozytywny
 *
 * Tokeny podmieniane w brickach i operacjach:
 *   {{IMAGE_TARGET}} {{IMAGE_DONOR}} {{PIN_TARGET}} {{PIN_SOURCE}} {{PIN_CLEAR}}
 */
import type { BrickId, ObrazWejscia, OperationId, OpisSceny, RolaPineski, WymaganieDawcy } from './types'
import { getOperation } from './operacje'
import { BRICKS } from './bricks'
import { POZYTYW } from './pozytyw'

/** Pineska w układzie wysyłki do generatora (numer obrazu: 1 = docelowy). */
export interface PineskaSklejka {
  numer: number
  rola: RolaPineski
  obraz: number
  /** współrzędne znormalizowane 0–1 (od lewej / od góry) — w PIN MAP jako położenie magentowej kropki */
  x: number
  y: number
  nazwa?: string
  /** miejsce pineski opisane słowami z analizy obrazu (na czym stoi, co jest obok) */
  miejsce?: string
  /** dodatkowe fakty o obiekcie pod pineską (wymiary, stan, kontakt) — z analizy pineski */
  opis?: string
}

/** Obszar, który ma wyjść z edycji nieodróżnialny od oryginału. */
export interface ObszarChroniony {
  numer: number
  obraz: number
  nazwa?: string
  /** miejsce opisane słowami */
  miejsce?: string
}

export interface SkladajWejscie {
  polecenie: string
  operacja: OperationId
  pineski: PineskaSklejka[]
  /** obrazy w kolejności wysyłki do generatora (pierwszy = docelowy) */
  obrazy: ObrazWejscia[]
  opis?: OpisSceny
  /** rzeczywisty rozmiar obiektu względem kotwicy widocznej w Image 1 (od reżysera) */
  skala?: string
  /** precyzyjna instrukcja od reżysera dla tej sceny (fakty o typie obiektu, rozmiary) */
  instrukcja?: string
  pineskiChronione?: ObszarChroniony[]
  /** dyrektywy konkretnego stylu artystycznego (dla operacji style_change) */
  dyrektywyStylu?: { nazwa: string; reguly: string[] }
  /** rozmiar obrazu docelowego w pikselach — do zapisu formatu wyniku */
  format?: { szerokosc: number; wysokosc: number }
  /** czy jako ostatni obraz wysyłamy maskę obszaru pracy */
  maska?: boolean
}

export interface SekcjaPromptu {
  klucz: 'always' | 'images' | 'bricks' | 'operation' | 'direction' | 'style' | 'pins' | 'protected' | 'scene' | 'command' | 'check' | 'quality'
  tekst: string
}

export interface SkladajWynik {
  prompt: string
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

/** Odwołanie do pineski w treści bricków. Miejsce jest opisane słowami w sekcji PIN MAP. */
function opisPineski(p: PineskaSklejka): string {
  const nazwa = p.nazwa ? `"${p.nazwa}", ` : ''
  return `Pin ${p.numer} (${nazwa}Image ${p.obraz})`
}

/** Pineska docelowa: rola target, najlepiej na obrazie docelowym. */
function pineskaCelu(pineski: PineskaSklejka[]): PineskaSklejka | undefined {
  return pineski.find((p) => p.rola === 'target' && p.obraz === 1) ?? pineski.find((p) => p.rola === 'target')
}

function pineskaZrodla(pineski: PineskaSklejka[]): PineskaSklejka | undefined {
  return pineski.find((p) => p.rola === 'source')
}

/**
 * Miejsce do wyczyszczenia (clean plate) zależy od operacji:
 * - zamiana i usunięcie czyszczą miejsce pod pineską docelową,
 * - przeniesienie czyści stare miejsce (pineska źródłowa) — o ile leży na obrazie docelowym,
 * - null = nie ma czego czyścić na obrazie docelowym (brick clean-plate odpada).
 */
function miejsceCzyszczenia(operacja: OperationId, pineski: PineskaSklejka[]): string | null {
  switch (operacja) {
    case 'object_swap':
    case 'character_swap':
    case 'removal': {
      const cel = pineski.find((p) => p.rola === 'target' && p.obraz === 1)
      return cel ? opisPineski(cel) : 'the object named in the COMMAND'
    }
    case 'object_transfer':
    case 'character_transfer': {
      const zrodlo = pineskaZrodla(pineski)
      if (!zrodlo) return 'the old position of the object named in the COMMAND'
      return zrodlo.obraz === 1 ? opisPineski(zrodlo) : null
    }
    default:
      return null
  }
}

/** Nazwa obrazu-dawcy dla tokenu {{IMAGE_DONOR}}. */
function nazwaDawcy(w: SkladajWejscie): string {
  const zrodlo = pineskaZrodla(w.pineski)
  if (zrodlo && zrodlo.obraz !== 1) return `Image ${zrodlo.obraz}`
  const dawca = w.obrazy.find((o) => o.rola === 'donor')
  return dawca ? `Image ${dawca.numer}` : 'the reference described in the COMMAND'
}

/**
 * Zasady, które obowiązują w KAŻDEJ operacji (poza zmianą stylu, gdzie wygląd
 * zmienia się celowo): jedno ziarno, ten sam kadr, kontrakt wyniku.
 */
const BRICKI_ZAWSZE: BrickId[] = ['grain-medium-rule', 'framing-rule', 'output-contract-rule']

/** Zasada naczelna: na samej górze i na samym końcu promptu. */
const ZASADA_ZAWSZE =
  'ALWAYS: THE GENERATED OBJECT MUST HAVE THE SAME GRAIN AS THE PHOTOGRAPH — THE SAME GRAIN SIZE, DENSITY, CONTRAST, SHARPNESS AND COLOUR TREATMENT. ' +
  'NO STICKER LOOK, NO CUT-OUT LOOK. NEVER TWO DIFFERENT TYPES OF GRAIN OR STYLE IN ONE IMAGE.'

const TOKEN = /\{\{\s*([A-Z_]+)\s*\}\}/g

function nazwaBricka(id: BrickId): string {
  return id.replace(/-/g, ' ').toUpperCase()
}

/** Składa finalny prompt dla modelu obrazu. */
export function skladajPrompt(w: SkladajWejscie): SkladajWynik {
  const op = getOperation(w.operacja)
  const nierozwiazane = new Set<string>()

  const cel = pineskaCelu(w.pineski)
  const zrodlo = pineskaZrodla(w.pineski)
  const czyszczenie = miejsceCzyszczenia(w.operacja, w.pineski)

  const wartosci: Record<string, string> = {
    IMAGE_TARGET: 'Image 1',
    IMAGE_DONOR: nazwaDawcy(w),
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

  // 1. IMAGES
  const linieObrazow = w.obrazy.map((o) =>
    o.rola === 'target'
      ? `Image ${o.numer} = TARGET (destination). The result is this photograph with only the requested change.` +
        (w.format
          ? ` Output format: exactly the aspect ratio and framing of this image (${w.format.szerokosc}×${w.format.wysokosc} px).`
          : ` Output format: exactly the aspect ratio and framing of this image.`)
      : `Image ${o.numer} = DONOR (reference). It supplies only the identity or appearance of its pinned subject.`,
  )
  if (w.maska) {
    linieObrazow.push(
      `Last image = MASK of the work area (white = where the change happens, black = untouched). It is a guide only — not a reference and not part of the result.`,
    )
  }
  const sekcjaObrazow = `[IMAGES — sent in this order]\n${linieObrazow.join('\n')}`

  // 2. RULE BRICKS
  const pominiete: BrickId[] = []
  const stale: BrickId[] = op.id === 'style_change' ? [] : BRICKI_ZAWSZE
  const wlaczone = [...op.bricks, ...stale].filter((id) => {
    if (id === 'clean-plate-rule' && czyszczenie === null) {
      pominiete.push(id)
      return false
    }
    return true
  })
  const bricki = [...new Set(wlaczone)].map((id) => BRICKS[id]).sort((a, b) => a.numer - b.numer)
  const sekcjaBrickow =
    `[RULES — ${bricki.length} rules; all hold at once]\n` + bricki.map((b) => podmien(b.tekst)).join('\n')

  // 3. OPERATION
  const nazwaOp = op.id.replace(/_/g, ' ').toUpperCase()
  const sekcjaOperacji =
    `[OPERATION — ${nazwaOp}]\n${podmien(op.misja)}\nSTEPS:\n` +
    op.kroki.map((k, i) => `${i + 1}. ${podmien(k)}`).join('\n')

  // 4. PIN MAP
  const opisyPinesek = new Map((w.opis?.pineski ?? []).map((o) => [o.pineska, o]))
  const liniePinesek = [...w.pineski]
    .sort((a, b) => a.numer - b.numer)
    .map((p) => {
      const o = opisyPinesek.get(p.numer)
      const nazwa = o?.nazwa || p.nazwa
      const szczegoly = [
        (o?.miejsce || p.miejsce) && `place: ${o?.miejsce || p.miejsce}`,
        o?.wymiary && `size: ${o.wymiary}`,
        p.opis,
      ]
        .filter(Boolean)
        .join('; ')
      const wsp = `dot at x=${Math.round(p.x * 100)}%, y=${Math.round(p.y * 100)}%`
      return `- Pin ${p.numer} · ${p.rola.toUpperCase()} · Image ${p.obraz}${nazwa ? ` — "${nazwa}"` : ''} — ${wsp}${
        szczegoly ? ` — ${szczegoly}` : ''
      }`
    })
  const sekcjaPinesek = liniePinesek.length
    ? `[PIN MAP — each pin is a small magenta dot drawn on its image; x / y = the dot's position in % from the left / top edge of that image]\n${liniePinesek.join('\n')}`
    : ''

  // 5. SCENE DETAILS
  const liniaSceny = [w.skala?.trim(), w.opis?.kotwice && `Scale anchors in Image 1: ${w.opis.kotwice}`].filter(Boolean)
  const sekcjaSceny = liniaSceny.length ? `[SCALE — real-world size]\n${liniaSceny.join('\n')}` : ''

  // 3b. DIRECTION i STYLE DIRECTIVES — dopisane do operacji
  const sekcjaKierunku = w.instrukcja?.trim()
    ? `[DIRECTION]\n${w.instrukcja.trim()}`
    : ''
  const sekcjaStylu = w.dyrektywyStylu
    ? `[STYLE DIRECTIVES — ${w.dyrektywyStylu.nazwa}]\n${w.dyrektywyStylu.reguly.map((x, i) => `${i + 1}. ${x}`).join('\n')}`
    : ''

  // 4b. PROTECTED AREAS — najwyższy priorytet
  const sekcjaChronionych = w.pineskiChronione?.length
    ? `[PROTECTED AREAS — HIGHEST PRIORITY]\n${w.pineskiChronione
        .map((p) => `- ${p.nazwa ? `"${p.nazwa}" — ` : ''}Pin ${p.numer} · Image ${p.obraz}${p.miejsce ? ` — ${p.miejsce}` : ''}`)
        .join('\n')}\nThese areas come out of the edit indistinguishable from the original: the same shape, colour, sharpness and position. On conflict with the task, protection wins — shrink the change, move it, or route it around these areas.`
    : ''

  // 6b. FINAL CHECK — to, co najczęściej zawodzi, powtórzone krótko tuż przed końcem
  //     (model najmocniej trzyma początek i koniec promptu). Z generacji, w której
  //     obiekt wyszedł bez ziarna sceny, obok pineski i z cyfrą znacznika.
  const uzyte = new Set(bricki.map((b) => b.id))
  const liniaKontroli: string[] = []
  if (uzyte.has('position-rule')) {
    liniaKontroli.push(
      `- POSITION: the element stands exactly on the destination pin's magenta dot (base of a resting element, centre of an airborne one); no nearby subject has pulled it aside.`,
    )
  }
  if (op.id !== 'style_change') {
    liniaKontroli.push(
      `- GRAIN: look closely at the changed area — its grain has the same size, density, contrast and sharpness as the ground and sky right beside it; it is not smoother, cleaner, sharper or differently grained, and it does not look like a sticker.`,
    )
  }
  liniaKontroli.push(
    `- CLEAN: the frame holds only the photographed scene from edge to edge — no magenta dots, numerals, letters, marks or outlines anywhere, including the ground next to the changed area.`,
  )
  const sekcjaKontroli = `[FINAL CHECK — verify before returning the image]\n${liniaKontroli.join('\n')}`

  // 6. COMMAND (tekst użytkownika wstawiany bez podmiany tokenów)
  const sekcjaPolecenia = `[COMMAND — the user's words]\n${w.polecenie.trim() || op.nazwa}`

  const zasadaZawsze = op.id === 'style_change' ? '' : `[ALWAYS — NON-NEGOTIABLE]\n${ZASADA_ZAWSZE}`

  const sekcje: SekcjaPromptu[] = [
    { klucz: 'always', tekst: zasadaZawsze },
    { klucz: 'images', tekst: sekcjaObrazow },
    { klucz: 'bricks', tekst: sekcjaBrickow },
    { klucz: 'operation', tekst: sekcjaOperacji },
    { klucz: 'direction', tekst: sekcjaKierunku },
    { klucz: 'style', tekst: sekcjaStylu },
    { klucz: 'pins', tekst: sekcjaPinesek },
    { klucz: 'protected', tekst: sekcjaChronionych },
    { klucz: 'scene', tekst: sekcjaSceny },
    { klucz: 'command', tekst: sekcjaPolecenia },
    { klucz: 'check', tekst: sekcjaKontroli },
    { klucz: 'quality', tekst: POZYTYW },
    { klucz: 'always', tekst: zasadaZawsze },
  ].filter((s): s is SekcjaPromptu => s.tekst.trim().length > 0)

  return {
    prompt: sekcje.map((s) => s.tekst).join('\n\n'),
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
