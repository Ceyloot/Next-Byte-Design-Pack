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
import {
  STUDIO_ANATOMIA,
  STUDIO_SWAP_KONTROLA,
  STUDIO_SWAP_SYSTEM,
  STUDIO_TOZSAMOSC,
  studioSwapBaza,
  studioSwapBazaUbranieSceny,
} from './operacje/character-swap-studio'

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
  /** jak obiekt ma wyglądać w scenie docelowej: kierunek, widoczne ściany, kąt kamery (od reżysera) */
  widok?: string
  /** precyzyjna instrukcja od reżysera dla tej sceny (fakty o typie obiektu, rozmiary) */
  instrukcja?: string
  pineskiChronione?: ObszarChroniony[]
  /** dyrektywy konkretnego stylu artystycznego (dla operacji style_change) */
  dyrektywyStylu?: { nazwa: string; reguly: string[] }
  /** rozmiar obrazu docelowego w pikselach — do zapisu formatu wyniku */
  format?: { szerokosc: number; wysokosc: number }
  /** zamiana postaci: ubranie zostaje ze sceny docelowej (wariant z poz. 21 Studia) */
  ubranieZeSceny?: boolean
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
  'ALWAYS: the generated object has the SAME GRAIN as the photograph (size, density, contrast, sharpness, colour) — no sticker look, never two kinds of grain or style in one image.'

/** Operacje, w których jest generowany obiekt (pin docelowy = tu ma stanąć obiekt). */
const OPERACJE_Z_OBIEKTEM = new Set<OperationId>(['addition', 'object_swap', 'object_transfer', 'character_swap', 'character_transfer'])
/** Operacje, których kroki dublowałyby bricki — wystarczy jedno zdanie zadania. */
const BEZ_KROKOW = new Set<OperationId>(['addition', 'object_swap', 'object_transfer', 'removal', 'character_transfer'])

const TOKEN = /\{\{\s*([A-Z_]+)\s*\}\}/g

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
      ? `Image ${o.numer} = the SCENE: the result is this photograph${w.format ? ` (${w.format.szerokosc}×${w.format.wysokosc} px, same framing)` : ' with the same framing'} with only the requested change.`
      : `Image ${o.numer} = REFERENCE: supplies only the identity of its pinned subject.`,
  )
  if (w.maska) {
    linieObrazow.push(`Last image = MASK of the work area (white = change, black = untouched); a guide only.`)
  }
  const sekcjaObrazow = `[IMAGES]\n${linieObrazow.join('\n')}`

  if (op.gotowy === 'studio-character-swap') return skladajGotowySwap(w, sekcjaObrazow, zasadaZawsze0(), cel, zrodlo)

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
    `[RULES — all hold at once]\n` + bricki.map((b) => podmien(b.tekst)).join('\n')

  // 3. TASK — jedno zdanie; kroki tylko tam, gdzie bricki ich nie pokrywają
  const sekcjaOperacji =
    `[TASK]\n${podmien(op.misja)}` +
    (BEZ_KROKOW.has(op.id) ? '' : `\n${op.kroki.map((k, i) => `${i + 1}. ${podmien(k)}`).join('\n')}`)

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
      const xy = `x=${Math.round(p.x * 100)}%, y=${Math.round(p.y * 100)}%`
      // Źródło leżące na obrazie docelowym nie ma kropki (zostałaby w wyniku) — wskazują je współrzędne i nazwa.
      const wsp = p.rola === 'source' && p.obraz === 1 ? `no dot — the object is at ${xy}` : `magenta dot at ${xy}`
      const cel = p.rola === 'target' ? (OPERACJE_Z_OBIEKTEM.has(op.id) ? ' ← THE GENERATED OBJECT MUST STAND EXACTLY HERE' : ' ← the change happens exactly here') : ''
      return `- Pin ${p.numer} (${p.rola}) · Image ${p.obraz}${nazwa ? ` "${nazwa}"` : ''} — ${wsp}${cel}${szczegoly ? ` — ${szczegoly}` : ''}`
    })
  const sekcjaPinesek = liniePinesek.length
    ? `[PINS — small magenta dots on the images; x / y in % from the left / top edge]\n${liniePinesek.join('\n')}`
    : ''

  // 5. SCENE DETAILS
  const liniaSceny = [w.skala?.trim(), w.opis?.kotwice && `Scale anchors in Image 1: ${w.opis.kotwice}`].filter(Boolean)
  const sekcjaSceny = liniaSceny.length ? `[SCALE]\n${liniaSceny.join('\n')}` : ''

  // 3b. DIRECTION i STYLE DIRECTIVES — dopisane do operacji
  const liniaKierunku = [w.instrukcja?.trim(), w.widok?.trim() && `View at the destination (from Image 1's camera, not the reference's): ${w.widok.trim()}`].filter(Boolean)
  const sekcjaKierunku = liniaKierunku.length ? `[DIRECTION]\n${liniaKierunku.join('\n')}` : ''
  const sekcjaStylu = w.dyrektywyStylu
    ? `[STYLE DIRECTIVES — ${w.dyrektywyStylu.nazwa}]\n${w.dyrektywyStylu.reguly.map((x, i) => `${i + 1}. ${x}`).join('\n')}`
    : ''

  // 4b. PROTECTED AREAS — najwyższy priorytet
  const sekcjaChronionych = w.pineskiChronione?.length
    ? `[PROTECTED — highest priority]\n${w.pineskiChronione
        .map((p) => `- ${p.nazwa ? `"${p.nazwa}" — ` : ''}Pin ${p.numer} · Image ${p.obraz}${p.miejsce ? ` — ${p.miejsce}` : ''}`)
        .join('\n')}\nThese stay indistinguishable from the original; on conflict, protection wins.`
    : ''

  // 6b. FINAL CHECK — najczęstsze porażki, krótko tuż przed końcem promptu
  const uzyte = new Set(bricki.map((b) => b.id))
  const celNaObrazie1 = w.pineski.find((p) => p.rola === 'target' && p.obraz === 1)
  const liniaKontroli: string[] = []
  if (uzyte.has('position-rule') && celNaObrazie1) {
    liniaKontroli.push(
      `- POSITION: the generated object stands exactly on the magenta dot at x=${Math.round(celNaObrazie1.x * 100)}%, y=${Math.round(celNaObrazie1.y * 100)}% of Image 1 (base of a resting object, centre of an airborne one).`,
    )
  }
  if (op.id !== 'style_change') {
    liniaKontroli.push(
      `- ONE PHOTOGRAPH: grain, sharpness, light, shadow and viewing angle of the changed area belong to Image 1's camera — it does not look pasted or like a sticker.`,
    )
  }
  liniaKontroli.push(`- CLEAN: no magenta dots, marks or text anywhere in the frame.`)
  const sekcjaKontroli = `[FINAL CHECK]\n${liniaKontroli.join('\n')}`

  // 6. COMMAND (tekst użytkownika wstawiany bez podmiany tokenów)
  const sekcjaPolecenia = `[COMMAND]\n${w.polecenie.trim() || op.nazwa}`

  const zasadaZawsze = op.id === 'style_change' ? '' : ZASADA_ZAWSZE

  const sekcje: SekcjaPromptu[] = [
    { klucz: 'always', tekst: zasadaZawsze },
    { klucz: 'operation', tekst: sekcjaOperacji },
    { klucz: 'images', tekst: sekcjaObrazow },
    { klucz: 'pins', tekst: sekcjaPinesek },
    { klucz: 'direction', tekst: sekcjaKierunku },
    { klucz: 'scene', tekst: sekcjaSceny },
    { klucz: 'style', tekst: sekcjaStylu },
    { klucz: 'protected', tekst: sekcjaChronionych },
    { klucz: 'command', tekst: sekcjaPolecenia },
    { klucz: 'bricks', tekst: sekcjaBrickow },
    { klucz: 'check', tekst: sekcjaKontroli },
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

function zasadaZawsze0(): string {
  return ZASADA_ZAWSZE
}

/**
 * Zamiana postaci: prompt Studia Zdjęć 1:1 (rola, baza, kotwica, anatomia, tożsamość)
 * + mapa „który element skąd, gdzie i jak” (obrazy i kropki pinesek) + polecenie.
 */
function skladajGotowySwap(
  w: SkladajWejscie,
  sekcjaObrazow: string,
  zawsze: string,
  cel: PineskaSklejka | undefined,
  zrodlo: PineskaSklejka | undefined,
): SkladajWynik {
  const op = getOperation(w.operacja)
  const dawcy = w.obrazy.filter((o) => o.rola === 'donor')
  const refs =
    dawcy.length > 1
      ? `the first ${dawcy.length} character reference images (Images ${dawcy[0].numer}–${dawcy[dawcy.length - 1].numer}, all showing the SAME person from different angles)`
      : `the character reference image (Image ${dawcy[0]?.numer ?? 2})`
  const baza = (w.ubranieZeSceny ? studioSwapBazaUbranieSceny : studioSwapBaza)(refs, 'Image 1')

  const wsp = (p: PineskaSklejka) => `dot at x=${Math.round(p.x * 100)}%, y=${Math.round(p.y * 100)}%`
  const mapa = [
    `[MAP — which element is where]`,
    `Image 1 = the SCENE (the plate that stays).`,
    ...dawcy.map((d) => `Image ${d.numer} = CHARACTER REFERENCE (identity source only).`),
    cel ? `The person to REPLACE is at the magenta dot of Pin ${cel.numer} in Image 1 (${wsp(cel)})${cel.miejsce ? ` — ${cel.miejsce}` : ''}. The new person takes exactly that position, pose, scale and light.` : '',
    zrodlo ? `The person to take IDENTITY from is at the magenta dot of Pin ${zrodlo.numer} in Image ${zrodlo.obraz} (${wsp(zrodlo)}). Every other person in the scene stays untouched.` : '',
    `The small magenta dots are guides only and must not appear in the result.`,
  ].filter(Boolean)

  const sekcje: SekcjaPromptu[] = [
    { klucz: 'always', tekst: zawsze },
    { klucz: 'operation', tekst: STUDIO_SWAP_SYSTEM },
    { klucz: 'images', tekst: sekcjaObrazow },
    { klucz: 'pins', tekst: mapa.join('\n') },
    { klucz: 'operation', tekst: baza },
    { klucz: 'command', tekst: `Additional instruction: ${w.polecenie.trim() || op.nazwa}.` },
    { klucz: 'check', tekst: STUDIO_SWAP_KONTROLA },
    { klucz: 'quality', tekst: `${STUDIO_ANATOMIA}\n${STUDIO_TOZSAMOSC}\nThe frame holds no magenta dot, numeral, letter or marker anywhere.` },
    { klucz: 'always', tekst: zawsze },
  ]
  return {
    prompt: sekcje.map((s) => s.tekst).join('\n\n'),
    sekcje,
    operacja: w.operacja,
    nazwaOperacji: op.nazwa,
    uzyteBricki: [],
    pominieteBricki: [],
    dawca: op.dawca,
    czystaPlyta: true,
    nierozwiazaneTokeny: [],
  }
}
