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
import {
  ZABLOKOWANA_TEMPERATURA_CZESCI,
  ZABLOKOWANE_BRICKI_CZESCI,
  ZABLOKOWANE_ID_BRICKOW_CZESCI,
  ZABLOKOWANY_SYSTEM_CZESCI,
  zablokowanyPartChange,
  zablokowanyPartSwap,
} from './zablokowane/zmiana-czesci'
import {
  ZABLOKOWANA_TEMPERATURA_SCENERII,
  ZABLOKOWANY_SYSTEM_SCENERII,
  zablokowaneRegulyScenerii,
  zablokowaneZadanieScenerii,
} from './zablokowane/zmiana-scenerii'
import { zablokowaneReguRuchu, zablokowaneZadanieRuchu } from './zablokowane/ruch-w-kadrze'
import {
  ZABLOKOWANA_MISJA_SWAP_OBIEKTU,
  ZABLOKOWANA_TEMPERATURA_SWAP_OBIEKTU,
  ZABLOKOWANE_BRICKI_SWAP_OBIEKTU,
  ZABLOKOWANY_SYSTEM_SWAP_OBIEKTU,
  zablokowaneLinieAnalizySwapu,
  zablokowanyOpisPineski,
} from './zablokowane/object-swap-2-zdjecia'
import {
  ZABLOKOWANA_MISJA_TRANSFERU,
  ZABLOKOWANA_TEMPERATURA_TRANSFERU,
  ZABLOKOWANE_BRICKI_TRANSFERU,
  zablokowaneLinieSkaliTransferu,
  ZABLOKOWANY_SYSTEM_TRANSFERU,
} from './zablokowane/transfer-z-drugiego-zdjecia'
import {
  ZABLOKOWANA_SWAP_KONTROLA,
  ZABLOKOWANA_SWAP_TEMPERATURA,
  ZABLOKOWANY_BRICK_CZLOWIEK,
  ZABLOKOWANY_SWAP_SYSTEM,
  zablokowanaSwapBaza,
  zablokowanaSwapBazaUbranieSceny,
} from './zablokowane/character-swap'
import type { BrickId, ObrazWejscia, OperationId, OpisSceny, RolaPineski, WymaganieDawcy } from './types'
import { getOperation } from './operacje'
import { BRICKS } from './bricks'
import {
  STUDIO_FACE_KONTROLA,
  STUDIO_FACE_SYSTEM,
  SYSTEM_KOMPOZYTORA,
  studioFaceBaza,
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
  /** szczegółowy opis rzeczy / miejsca od reżysera (EN) */
  szczegoly?: string
  /** gdzie leży punkt, słowami (EN) */
  miejsce?: string
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
  /** zmierzony rozmiar obiektu w miejscu docelowym (EN) */
  rozmiar?: string
  /** prawdziwy rozmiar obiektu i porównanie z kotwicą — słowami (EN, od reżysera) */
  skala?: string
  /** jak obiekt ma wyglądać w miejscu docelowym: kierunek, widoczne ściany, kamera (EN, od reżysera) */
  widok?: string
  /** logiczne ułożenie obiektu w miejscu docelowym (EN, od reżysera) */
  ulozenie?: string
  /** nazwa CZĘŚCI obiektu (EN), gdy użytkownik zmienia tylko część (od reżysera) */
  czesc?: string
  /** zmieniana właściwość rzeczy pod pinem (EN, od reżysera) */
  cecha?: string
  /** numer obrazu ze zbliżeniem twarzy osoby z referencji (transfer postaci) */
  twarzObraz?: number
  /** dodatkowe obrazy-zbliżenia w pobliżu pinesek (numer obrazu + opis, EN) */
  zblizenia?: { numer: number; opis: string }[]
  /** ile sztuk części: all = komplet / więcej niż jedna, one = pojedyncza (z semantyki polecenia, od reżysera) */
  czescZakres?: 'all' | 'one'
  /** tlo: co zostaje nietknięte — główne obiekty i nakładki (EN, od reżysera) */
  pierwszyPlan?: string
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
  /** tryb zablokowany: transfer obiektu z drugiego zdjęcia → model Gemini 3.1 (CanvasSection → klasa `gemini31`) */
  gemini31?: boolean
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
/** zNazwa: dopisuje nazwę rzeczy pod pinezką (tylko tryby niezamrożone — zamrożone mają własny, niezmienny tekst). */
function opisPineski(p: PineskaSklejka, strefy = true, zNazwa = false): string {
  // Miejsce docelowe dostaje też strefę kadru słowami — model lepiej trzyma „w prawej części, w dolnej połowie” niż ułamki.
  const strefa = strefy && p.rola === 'target' ? `, ${slowaPolozenia(p.x, p.y, true)}` : ''
  const nazwa = zNazwa && p.nazwa?.trim() ? `"${p.nazwa.trim()}", ` : ''
  return `Pin ${p.numer} (${nazwa}Image ${p.obraz}, x=${wsp(p.x)} y=${wsp(p.y)}${strefa})`
}

/** Położenie punktu słowami (strefa kadru + odległość od krawędzi) — model lepiej wykonuje „po prawej, przy krawędzi” niż ułamek. */
function slowaPolozenia(x: number, y: number, krotko = false): string {
  const poziom = x < 0.15 ? 'at the far left edge' : x < 0.35 ? 'in the left part' : x < 0.65 ? 'in the horizontal middle' : x < 0.85 ? 'in the right part' : 'at the far right edge'
  const pion = y < 0.15 ? 'at the very top' : y < 0.35 ? 'in the upper part' : y < 0.65 ? 'around the vertical middle' : y < 0.85 ? 'in the lower part' : 'at the very bottom'
  if (krotko) return `${pion} and ${poziom} of the frame`
  return `${pion} and ${poziom} of the frame (${Math.round(x * 100)}% of the way from the left edge, ${Math.round(y * 100)}% of the way down from the top)`
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
function miejsceCzyszczenia(operacja: OperationId, pineski: PineskaSklejka[], strefy = true): string | null {
  switch (operacja) {
    case 'object_swap':
    case 'character_swap':
    case 'removal': {
      const cel = pineski.find((p) => p.rola === 'target' && p.obraz === 1)
      return cel ? opisPineski(cel, strefy, true) : 'the object named in the USER request'
    }
    case 'object_transfer':
    case 'character_transfer': {
      const zrodlo = pineskaZrodla(pineski)
      if (!zrodlo) return 'the old position of the object named in the USER request'
      return zrodlo.obraz === 1 ? opisPineski(zrodlo, strefy) : null
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
const OPERACJE_POSTACI_SKLADAJ = new Set<OperationId>(['character_swap', 'character_transfer', 'face_swap'])
const OPERACJE_Z_OBIEKTEM = new Set<OperationId>(['addition', 'object_swap', 'object_transfer', 'character_swap', 'character_transfer'])
/** Operacje, których kroki dublowałyby bricki — wystarczy jedno zdanie zadania. */
/** Tryby bez linii światła: zmiana światła/stylu (K1/K2 — „oświetl dokładnie jak teraz” byłoby sprzeczne z poleceniem) oraz usuwanie (nic nie jest wstawiane). */
const ZMIENIAJA_SWIATLO = new Set<OperationId>(['time_of_day_change', 'season_change', 'style_change', 'removal'])
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

/** Położenie punktu w kadrze słowami + współrzędne (do promptu ruchu w obrębie jednego zdjęcia). */
function polozenieSlowami(x: number, y: number): string {
  const poziom = x < 0.15 ? 'at the far left edge' : x < 0.35 ? 'in the left part' : x < 0.65 ? 'in the horizontal middle' : x < 0.85 ? 'in the right part' : 'at the far right edge'
  const pion = y < 0.15 ? 'at the very top' : y < 0.35 ? 'in the upper part' : y < 0.65 ? 'around the vertical middle' : y < 0.85 ? 'in the lower part' : 'at the very bottom'
  return `${pion} and ${poziom} of the frame, ${Math.round(x * 100)}% from the left edge and ${Math.round(y * 100)}% down from the top (x=${x.toFixed(2)}, y=${y.toFixed(2)})`
}

/** Dokładniejsze słowa o położeniu punktu (7 stref w poziomie) — „środek kadru” dla x=0.62 ściągało obiekt do środka (test T03). */
function polozenieDokladne(x: number, y: number): string {
  const poziom = x < 0.12 ? 'at the far left edge' : x < 0.3 ? 'in the left part' : x < 0.45 ? 'left of the centre' : x < 0.55 ? 'in the centre' : x < 0.7 ? 'right of the centre' : x < 0.88 ? 'in the right part' : 'at the far right edge'
  const pion = y < 0.12 ? 'at the very top' : y < 0.3 ? 'in the upper part' : y < 0.45 ? 'a little above the middle' : y < 0.55 ? 'at the vertical middle' : y < 0.7 ? 'a little below the middle' : y < 0.88 ? 'in the lower part' : 'at the very bottom'
  return `${pion}, ${poziom} of the frame — ${Math.round(x * 100)}% from the left edge, ${Math.round(y * 100)}% down from the top`
}

/** Rozmiar w jednej linii: procent szerokości + porównanie z rzeczą znaną ze zdjęcia (liczby same model ignoruje — test T03). */
function liniaRozmiaruDodaj(rozmiar: string): string {
  const pct = Number(rozmiar.match(/spans about (\d+)% of Image 1's width/)?.[1])
  const kotwica = rozmiar.match(/Size anchor: the (.+?) in Image 1 is [^;]*; at the destination the object spans about ([\d.]+)× the width/)
  if (!Number.isFinite(pct)) return rozmiar.trim().split(/\s*Size anchor:/)[0]
  const jak = pct <= 6 ? 'tiny in the frame, because it is far from the camera' : pct <= 15 ? 'small in the frame' : 'its size in the frame'
  const wzgl = kotwica ? `; about ${kotwica[2]}× as wide as the ${kotwica[1]} already visible in Image 1` : ''
  return `it spans about ${pct}% of the image width — ${jak}${wzgl}. Keep exactly that size; never enlarge it to fill the free space.`
}

/** Pierwsze zdania opisu światła od reżysera (kierunek, temperatura barwowa, twardość) — reszta to szczegóły, które tylko rozwadniają prompt. */
function krotkieSwiatlo(t: string, limit = 280): string {
  const zdania = t.trim().split(/(?<=[.!?])\s+/)
  let wynik = ''
  for (const z of zdania) {
    if (wynik && (wynik + ' ' + z).length > limit) break
    wynik = wynik ? `${wynik} ${z}` : z
  }
  return wynik
}

/** Składa finalny prompt dla modelu obrazu. */
export function skladajPrompt(w: SkladajWejscie): SkladajWynik {
  const op = getOperation(w.operacja)
  const nierozwiazane = new Set<string>()
  const cel = pineskaCelu(w.pineski)
  const zrodlo = pineskaZrodla(w.pineski)
  // Zamiana CZĘŚCI obiektu (np. oświetlenia auta): osobny, niezablokowany prompt — tryby zablokowane dotyczą całych obiektów.
  // czescTryb: user zmienia tylko część obiektu pod pinem; czescSwap — część z referencji (pin źródłowy), czescOpis — część wg opisu w poleceniu.
  const czescTryb = Boolean(w.czesc?.trim()) && (op.id === 'object_swap' || op.id === 'object_transfer') && cel !== undefined
  const czescSwap = czescTryb && zrodlo !== undefined
  const czescOpis = czescTryb && zrodlo === undefined
  // Zmiana WŁAŚCIWOŚCI rzeczy pod jedną pinezką (budowa, wiek, kolor, materiał…): osobny prompt ATTRIBUTE CHANGE.
  const cechaTryb = Boolean(w.cecha?.trim()) && !czescTryb && cel !== undefined && zrodlo === undefined && ['addition', 'object_swap', 'general_fix', 'texture_change'].includes(op.id)
  // Tryby zablokowane (przeniesienie w kadrze; transfer obiektu z drugiego zdjęcia) zostają bez stref kadru w opisie pinesek — prompt identyczny jak zamrożony.
  // Transfer z drugiego zdjęcia: tylko object_transfer z pinem źródłowym na innym zdjęciu niż docelowe (ZABLOKOWANE/transfer-z-drugiego-zdjecia.ts).
  const miedzyZdjeciami = !czescTryb && op.id === 'object_transfer' && !op.gotowy && zrodlo !== undefined && zrodlo.obraz > 1 && cel?.obraz === 1
  // Object swap z dwóch zdjęć (ZABLOKOWANE/object-swap-2-zdjecia.ts): każdy obiekt object_swap poza trybem w kadrze.
  const swapZablokowany = !czescTryb && !cechaTryb && op.id === 'object_swap' && !op.gotowy && !(zrodlo?.obraz === 1 && cel?.obraz === 1)
  const strefy = !(!czescTryb && ['object_transfer', 'character_transfer', 'object_swap'].includes(op.id) && zrodlo?.obraz === 1 && cel?.obraz === 1 && !op.gotowy)
  const czyszczenie = miejsceCzyszczenia(w.operacja, w.pineski, strefy)
  const dawca = numerDawcy(w)

  const wartosci: Record<string, string> = {
    IMAGE_TARGET: 'Image 1',
    IMAGE_DONOR: dawca ? `Image ${dawca}` : 'the reference described in the USER request',
    DONOR_ROLE: ROLA_DAWCY[op.id] ?? ROLA_INNA,
    PIN_TARGET: cel ? (swapZablokowany ? zablokowanyOpisPineski(cel) : opisPineski(cel, strefy, !miedzyZdjeciami)) : 'the marked spot',
    PIN_SOURCE: zrodlo ? (swapZablokowany ? zablokowanyOpisPineski(zrodlo) : opisPineski(zrodlo, strefy, !miedzyZdjeciami)) : 'the source spot',
    PIN_CLEAR: swapZablokowany && cel ? zablokowanyOpisPineski(cel) : czyszczenie ?? 'the cleared spot',
  }
  const podmien = (tekst: string): string =>
    tekst.replace(TOKEN, (_m, klucz: string) => {
      if (klucz in wartosci) return wartosci[klucz]
      nierozwiazane.add(klucz)
      return ''
    })

  // [TASK] — prompt operacji (zamiany postaci i twarzy: baza Studia 1:1, poz. 20/21/29)
  let zadanie: string
  // Zmiana scenerii / tła: osobny prompt — zostaje pierwszy plan, wymieniane jest całe otoczenie.
  const sceneria = op.id === 'background_change'
  let system: string | undefined
  let temperatura: number | undefined
  if (op.gotowy === 'studio-character-swap') {
    const refs = w.obrazy.filter((o) => o.rola === 'donor')
    const opisRefs =
      refs.length > 1
        ? `the character reference images (Images ${refs.map((r) => r.numer).join(', ')}, all showing the SAME person from different angles)`
        : `the character reference image (Image ${refs[0]?.numer ?? 2})`
    // ZABLOKOWANE (zablokowane/character-swap.ts) — nie zmieniać bez prośby użytkownika.
    zadanie = `${(w.ubranieZeSceny ? zablokowanaSwapBazaUbranieSceny : zablokowanaSwapBaza)(opisRefs, 'Image 1')}\n${ZABLOKOWANA_SWAP_KONTROLA}`
    system = ZABLOKOWANY_SWAP_SYSTEM
    temperatura = ZABLOKOWANA_SWAP_TEMPERATURA
  } else if (op.gotowy === 'studio-face-swap') {
    const refs = w.obrazy.filter((o) => o.rola === 'donor').map((o) => o.numer)
    zadanie = `${studioFaceBaza('Image 1', refs.length > 1 ? `Images ${refs.join(', ')}` : `Image ${refs[0] ?? 2}`, Math.max(1, refs.length))}\n${STUDIO_FACE_KONTROLA}`
    system = STUDIO_FACE_SYSTEM
    temperatura = 0.42
  } else if (sceneria) {
    // ZABLOKOWANE (zablokowane/zmiana-scenerii.ts) — nie zmieniać bez prośby użytkownika.
    zadanie = zablokowaneZadanieScenerii(dawca ?? undefined)
    system = ZABLOKOWANY_SYSTEM_SCENERII
    temperatura = ZABLOKOWANA_TEMPERATURA_SCENERII
  } else if (cechaTryb && cel) {
    const ce = w.cecha!.trim()
    zadanie = [
      `ATTRIBUTE CHANGE: change ONLY the ${ce} of the subject at ${opisPineski(cel, true, true)}, exactly as the USER request describes, to the degree it states.`,
      `The subject stays the same individual or object: same identity, face or form, pose, position, clothing or surface, and framing. A VISIBLE change is required, and it must look like a real photograph of the changed subject — anatomically and physically correct, proportions consistent with the rest of the subject, nothing of the old state left where the change applies.`,
      `The changed parts are lit ONLY by Image 1's light, with the same shading, shadows, skin or surface texture, grain and sharpness as the unchanged parts of the subject. Everything else stays exactly as it is: the rest of the subject, everything around it, the framing and all text.`,
    ].join('\n')
    system = SYSTEM_KOMPOZYTORA
    temperatura = TEMPERATURA_OBIEKTU
  } else if (czescOpis && cel) {
    // ZABLOKOWANE (zablokowane/zmiana-czesci.ts) — nie zmieniać bez prośby użytkownika.
    zadanie = zablokowanyPartChange(w.czesc!.trim(), cel, w.czescZakres)
    system = ZABLOKOWANY_SYSTEM_CZESCI
    temperatura = ZABLOKOWANA_TEMPERATURA_CZESCI
  } else if (czescSwap && zrodlo && cel) {
    // ZABLOKOWANE (zablokowane/zmiana-czesci.ts) — nie zmieniać bez prośby użytkownika.
    zadanie = zablokowanyPartSwap(w.czesc!.trim(), cel, zrodlo, w.czescZakres)
    system = ZABLOKOWANY_SYSTEM_CZESCI
    temperatura = ZABLOKOWANA_TEMPERATURA_CZESCI
  } else if (swapZablokowany) {
    // ZABLOKOWANE (zablokowane/object-swap-2-zdjecia.ts) — nie zmieniać bez prośby użytkownika.
    zadanie = podmien(ZABLOKOWANA_MISJA_SWAP_OBIEKTU)
    system = ZABLOKOWANY_SYSTEM_SWAP_OBIEKTU
    temperatura = ZABLOKOWANA_TEMPERATURA_SWAP_OBIEKTU
  } else if (miedzyZdjeciami) {
    // ZABLOKOWANE (zablokowane/transfer-z-drugiego-zdjecia.ts) — logika z dd2f587, tylko w tym trybie.
    zadanie = podmien(ZABLOKOWANA_MISJA_TRANSFERU)
    system = ZABLOKOWANY_SYSTEM_TRANSFERU
    temperatura = ZABLOKOWANA_TEMPERATURA_TRANSFERU
  } else {
    zadanie = podmien(op.misja) + (BEZ_KROKOW.has(op.id) ? '' : `\n${op.kroki.map((k, i) => `${i + 1}. ${podmien(k)}`).join('\n')}`)
    if (OPERACJE_Z_OBIEKTEM.has(op.id)) {
      system = SYSTEM_KOMPOZYTORA
      temperatura = TEMPERATURA_OBIEKTU
    }
  }
  const styl = w.dyrektywyStylu ? `\nStyle — ${w.dyrektywyStylu.nazwa}: ${w.dyrektywyStylu.reguly.join(' ')}` : ''
  const sekcjaZadania = `[TASK]\n${zadanie}${styl}${sceneria ? '' : `\n${mapaObrazowIPinesek(w)}`}`

  // [USER]
  const sekcjaUzytkownika = `[USER]\n${w.polecenie.trim() || op.nazwa}`

  // [RULES] — bricki operacji; bez dawcy odpada referencja, bez starego miejsca odpada usunięcie
  const pominiete: BrickId[] = []
  const wlaczone = op.bricks.filter((id) => {
    if (sceneria) { pominiete.push(id); return false }
    if (cechaTryb && !['studio-scena', 'studio-jedno-zdjecie', 'studio-kontrola'].includes(id)) { pominiete.push(id); return false }
    if (czescTryb && !ZABLOKOWANE_ID_BRICKOW_CZESCI.includes(id)) { pominiete.push(id); return false }
    const zbedny = (id === 'studio-usuniecie' && czyszczenie === null) || (id === 'studio-referencja' && dawca === null)
    if (zbedny) pominiete.push(id)
    return !zbedny
  })
  const bricki = [...new Set(wlaczone)].map((id) => BRICKS[id]).sort((a, b) => a.numer - b.numer)
  const kropki = w.pineski.length && !sceneria
    ? 'Pin positions are given as x / y fractions of the image (x from the left edge, y from the top edge, 0–1); the images carry no markers.'
    : ''
  const swiatlo = w.swiatlo?.trim()
    ? `THE LIGHT OF IMAGE 1 (measured — the subject must be lit exactly like this, not like its reference): ${w.swiatlo.trim()}`
    : ''
  // Transfer postaci z drugiego zdjęcia dostaje zmierzony rozmiar i analizę osadzania jak obiekty (poza trybem w kadrze).
  const osadzalny = OPERACJE_Z_OBIEKTEM.has(op.id) && (!OPERACJE_POSTACI_SKLADAJ.has(op.id) || (op.id === 'character_transfer'))
  const rozmiar = !miedzyZdjeciami && !czescTryb && !cechaTryb && w.rozmiar?.trim() && osadzalny
    ? `THE SIZE AT THE DESTINATION (measured from objects of known size in Image 1 — follow it, never the size the object has in its reference): ${w.rozmiar.trim()}`
    : ''
  // Analiza reżysera dla osadzania (nie dla trybu zablokowanego w kadrze): prawdziwy rozmiar, widok z kamery, opis miejsca i obiektu.
  const osadzanie = !miedzyZdjeciami && !czescTryb && !cechaTryb && osadzalny
  const analizaOsadzania = osadzanie
    ? [
        op.id === 'character_transfer' && w.twarzObraz
          ? `Image ${w.twarzObraz} is a close-up of the FACE of the person from the reference, cut from the same photo — the identity reference: reproduce exactly this face, feature by feature (shape, eyes and their spacing, brows, nose, lips, jaw, ears, marks, asymmetries), never a similar-looking person.`
          : '',
        w.skala?.trim() ? `THE REAL SIZE OF THE SUBJECT (analysed against objects of known size in Image 1 — never take its size from how large it appears in its reference): ${w.skala.trim()}` : '',
        w.widok?.trim() ? `HOW IT MUST APPEAR AT THE DESTINATION (from Image 1's camera and the surface it stands on — a different view in the reference is turned to match): ${w.widok.trim()}` : '',
        w.ulozenie?.trim() ? `THE LOGICAL ARRANGEMENT AT THE DESTINATION (analysed from Image 1's scene — follow it): ${w.ulozenie.trim()}` : '',
        cel && (cel.miejsce || cel.szczegoly) ? `THE DESTINATION SPOT (Pin ${cel.numer}): ${[cel.miejsce, cel.szczegoly].filter(Boolean).join(' ')}` : '',
        zrodlo?.szczegoly && zrodlo.obraz !== 1 ? `${op.id === 'character_transfer' ? 'THE PERSON TO BRING — IDENTITY CARD, reproduce exactly (face, hair, build, outfit)' : 'THE SUBJECT'} (Pin ${zrodlo.numer}): ${zrodlo.szczegoly}` : '',
      ].filter(Boolean)
    : []
  // Scenografia: światło sceny docelowej NIE obowiązuje (zmienia się z otoczeniem) — zamiast tego reguły zmiany miejsca.
  const regulySceneria = sceneria ? zablokowaneRegulyScenerii(w.pierwszyPlan) : []
  // Zbliżenia w pobliżu pinesek: ta sama fotografia powiększona — tylko szczegół i kontekst, nigdy dodatkowe rzeczy do wstawienia.
  const liniaZblizen = w.zblizenia?.length
    ? [
        `ZOOMED DETAIL — the same photographs enlarged around the pins, only to show exact detail and context; they are never extra things to put into the result:`,
        ...w.zblizenia.map((z) => `Image ${z.numer} = ${z.opis}.`),
      ].join('\n')
    : ''
  const sekcjaRegul = ['[RULES]', sceneria || ZMIENIAJA_SWIATLO.has(op.id) ? '' : swiatlo, liniaZblizen, ...regulySceneria, ...(swapZablokowany ? zablokowaneLinieAnalizySwapu(w, cel, zrodlo) : miedzyZdjeciami ? zablokowaneLinieSkaliTransferu(w) : [rozmiar, ...analizaOsadzania]), ...bricki.map((b) => podmien(op.gotowy === 'studio-character-swap' && b.id === 'studio-czlowiek' ? ZABLOKOWANY_BRICK_CZLOWIEK : miedzyZdjeciami ? (ZABLOKOWANE_BRICKI_TRANSFERU[b.id] ?? b.tekst) : swapZablokowany ? (ZABLOKOWANE_BRICKI_SWAP_OBIEKTU[b.id] ?? b.tekst) : czescTryb ? (ZABLOKOWANE_BRICKI_CZESCI[b.id] ?? b.tekst) : b.tekst)), kropki].filter(Boolean).join('\n')

  // Przeniesienie / zamiana obiektu w obrębie JEDNEGO zdjęcia — ZABLOKOWANE (zablokowane/ruch-w-kadrze.ts), nie zmieniać
  // bez prośby użytkownika: prosty prompt „MOVE — do not copy” + wybrane bricki + światło, rozmiar i analiza reżysera.
  const ruchWKadrze =
    !czescTryb && !cechaTryb && ['object_transfer', 'object_swap', 'character_transfer'].includes(op.id) && zrodlo?.obraz === 1 && cel?.obraz === 1
  const opisyPinesek = new Map((w.opis?.pineski ?? []).map((o) => [o.pineska, o.nazwa]))
  const zadanieRuchu = ruchWKadrze && zrodlo && cel
    ? zablokowaneZadanieRuchu(op.id === 'object_swap', zrodlo, cel, w.pineski.map((p) => ({ numer: p.numer, obraz: p.obraz, x: p.x, y: p.y, nazwa: p.nazwa || opisyPinesek.get(p.numer) })))
    : ''
  const sekcjaReguRuchu = ruchWKadrze && cel
    ? zablokowaneReguRuchu(
        {
          pinCzyszczenia: czyszczenie === null ? null : op.id === 'object_swap' ? cel : zrodlo ?? null,
          swiatlo: w.swiatlo,
          rozmiar: w.rozmiar,
          skala: w.skala,
          widok: w.widok,
          ulozenie: w.ulozenie,
        },
        cel,
      )
    : ''
  // DODAJ (krótki prompt): zadanie + rozmiar + światło w 2 zdaniach + jedna reguła naturalności. Test T03: pełny prompt (~6000 zn.)
  // dawał obiekt 6× za duży, wersja ~600 zn. trzymała miejsce i skalę w obu próbach. Dotyczy dodawania bez pinu źródłowego.
  const dodajKrotko = op.id === 'addition' && !czescTryb && !cechaTryb && cel !== undefined && zrodlo === undefined
  const sekcjaDodaj = dodajKrotko && cel
    ? [
        '[TASK]',
        `Edit Image 1: add the new object from the USER request (or from the reference image, if one is given) at Pin ${cel.numer}${cel.nazwa?.trim() ? ` ("${cel.nazwa.trim()}")` : ''}, ${polozenieDokladne(cel.x, cel.y)} (x=${wsp(cel.x)} y=${wsp(cel.y)}). The middle of its footprint sits exactly on that x / y point, resting on the real surface there, at its true size for that distance from the camera. Nothing else changes: every object already in Image 1 stays where it is.`,
        '',
        sekcjaUzytkownika,
        '',
        [
          '[RULES]',
          w.rozmiar?.trim() ? `SIZE: ${liniaRozmiaruDodaj(w.rozmiar)}` : '',
          w.swiatlo?.trim() ? `LIGHT: match the scene — ${krotkieSwiatlo(w.swiatlo)}` : 'LIGHT: match the scene’s direction, colour temperature and softness.',
          'ONE real photograph: the new object has the scene’s light, shadow or reflection, focus and grain; no halo, outline or sticker look. Everything else stays exactly as it is.',
        ].filter(Boolean).join('\n'),
      ].join('\n')
    : ''
  // ZAMIANA TWARZY (krótki prompt): każdemu zdjęciu przypisana rola i opis (BAZA / TOŻSAMOŚĆ) + „tylko twarz”. Test T06: długi prompt
  // z bazą „Image 1” i 4 zdjęciami oddawał całe zdjęcie referencji; wersja z opisem obu zdjęć dała poprawną zamianę 2/2.
  const twarzKrotko = op.id === 'face_swap' && cel !== undefined && zrodlo !== undefined
  const nazwaPinu = (p: PineskaSklejka) => (p.nazwa || opisyPinesek.get(p.numer) || '').trim()
  const sekcjaTwarz = twarzKrotko && cel && zrodlo
    ? [
        '[TASK]',
        `Image ${cel.obraz} is the BASE photograph${nazwaPinu(cel) ? `: ${nazwaPinu(cel)}` : ''}. Image ${zrodlo.obraz} is only the IDENTITY reference${nazwaPinu(zrodlo) ? `: ${nazwaPinu(zrodlo)}` : ''}.`,
        `Edit Image ${cel.obraz}: give the person at Pin ${cel.numer} (x=${wsp(cel.x)} y=${wsp(cel.y)}) the face of the person at Pin ${zrodlo.numer} of Image ${zrodlo.obraz} — face shape, eyes, nose, mouth, jaw, facial hair and skin marks. Keep from Image ${cel.obraz} everything else: hair, clothing, body, pose, background, light and crop. Take nothing but the face from Image ${zrodlo.obraz} — no clothes, no hair, no background.`,
        '',
        sekcjaUzytkownika,
        '',
        [
          '[RULES]',
          `The new face is lit by Image ${cel.obraz}'s light${w.swiatlo?.trim() ? ` — ${krotkieSwiatlo(w.swiatlo)}` : ''}, with its grain, and no visible seam. Natural skin: pores, no retouching. The result is Image ${cel.obraz}'s photograph with a new face.`,
        ].join('\n'),
      ].join('\n')
    : ''
  // UBRANIE Z REFERENCJI (krótki prompt): jak przy zamianie twarzy — role zdjęć + „tylko ubiór”, reszta kadru (tło, światło) bez zmian (T09: tło traciło poświatę).
  const ubranieKrotko = op.id === 'clothing_change' && cel !== undefined && zrodlo !== undefined && zrodlo.obraz !== cel.obraz
  const sekcjaUbranie = ubranieKrotko && cel && zrodlo
    ? [
        '[TASK]',
        `Image ${cel.obraz} is the BASE photograph${nazwaPinu(cel) ? `: ${nazwaPinu(cel)}` : ''}. Image ${zrodlo.obraz} is only the OUTFIT reference${nazwaPinu(zrodlo) ? `: ${nazwaPinu(zrodlo)}` : ''}.`,
        `Edit Image ${cel.obraz}: dress the person at Pin ${cel.numer} (x=${wsp(cel.x)} y=${wsp(cel.y)}) in the outfit of Pin ${zrodlo.numer} of Image ${zrodlo.obraz} — the same garments, cut, colour, pattern and details, fitted to the body with natural folds. Keep from Image ${cel.obraz} everything else exactly: face, hair, pose, hands, the whole background and its light, crop. Take nothing but the garments from Image ${zrodlo.obraz}.`,
        '',
        sekcjaUzytkownika,
        '',
        `[RULES]\nThe new garments are lit by Image ${cel.obraz}'s light, with its grain. The background, its glow and colours stay pixel-for-pixel as in Image ${cel.obraz}.`,
      ].join('\n')
    : ''
  // PRZENIESIENIE / ZAMIANA OBIEKTU Z DRUGIEGO ZDJĘCIA (krótki prompt): role zdjęć + miejsce + rozmiar z porównaniem do rzeczy na zdjęciu.
  // Test F3 (3×): zamrożony długi prompt dawał obiekt 3–4× za duży i przesunięty od pinezki; krótka wersja jak przy „dodaj” trzyma skalę.
  const zamianaMiedzy = op.id === 'object_swap' && !czescTryb && !cechaTryb && zrodlo !== undefined && cel !== undefined && zrodlo.obraz !== cel.obraz
  const przenosKrotko = (miedzyZdjeciami || zamianaMiedzy) && cel !== undefined && zrodlo !== undefined
  const sekcjaPrzenos = przenosKrotko && cel && zrodlo
    ? [
        '[TASK]',
        `Image ${cel.obraz} is the BASE photograph${nazwaPinu(cel) ? `: ${nazwaPinu(cel)}` : ''}. Image ${zrodlo.obraz} is only the SUBJECT reference${nazwaPinu(zrodlo) ? `: ${nazwaPinu(zrodlo)}` : ''}.`,
        `Edit Image ${cel.obraz}: put the subject from Pin ${zrodlo.numer} of Image ${zrodlo.obraz} into Image ${cel.obraz}, so that the middle of its footprint is exactly at Pin ${cel.numer} — ${polozenieDokladne(cel.x, cel.y)} (x=${wsp(cel.x)} y=${wsp(cel.y)}).${zamianaMiedzy ? ` It REPLACES whatever stands at that pin: remove that completely, nothing of it may remain.` : ' Nothing else is removed.'} Redraw the subject for Image ${cel.obraz} — its perspective, light and reflections; never a pasted copy of the reference picture. In Image ${zrodlo.obraz} it looks large only because that photo was taken up close: in Image ${cel.obraz} draw it at the SIZE given below. It appears exactly once. THE POINT IS FIXED: ${cel.x < 0.4 || cel.x > 0.6 ? `the subject stands in the ${cel.x < 0.5 ? 'left' : 'right'} part of the picture, NOT in the middle; ` : ''}do not move it toward the centre or to an easier spot; near the frame edge it may be partly cut off. Everything else in Image ${cel.obraz} stays exactly as it is.`,
        '',
        sekcjaUzytkownika,
        '',
        [
          '[RULES]',
          w.rozmiar?.trim() ? `SIZE: ${liniaRozmiaruDodaj(w.rozmiar)}` : '',
          w.swiatlo?.trim() ? `LIGHT: match Image ${cel.obraz} — ${krotkieSwiatlo(w.swiatlo)}` : `LIGHT: match Image ${cel.obraz}'s direction, colour temperature and softness.`,
          `ONE real photograph: the subject has Image ${cel.obraz}'s light, shadow or reflection, focus and grain; no halo, outline or sticker look.`,
        ].filter(Boolean).join('\n'),
      ].join('\n')
    : ''
  // ZAMIANA DWÓCH OSÓB NA JEDNYM ZDJĘCIU (T07): osoby wymieniają się twarzami i włosami; ciała, ubiory i pozy zostają na swoich miejscach.
  const pinyOsob = w.pineski.filter((p) => p.obraz === 1)
  const zamianaOsob = op.id === 'character_swap' && w.obrazy.length === 1 && pinyOsob.length >= 2
  const sekcjaZamianaOsob = zamianaOsob
    ? [
        '[TASK]',
        `Edit Image 1: swap the two people. The person at Pin ${pinyOsob[0].numer} (x=${wsp(pinyOsob[0].x)} y=${wsp(pinyOsob[0].y)}) and the person at Pin ${pinyOsob[1].numer} (x=${wsp(pinyOsob[1].x)} y=${wsp(pinyOsob[1].y)}) exchange their faces and hair — each person gets the other's face, hair and facial hair. Each body, outfit, pose and place in the frame stays exactly where it is. Each swapped face keeps the head angle, expression and gaze of the body it now sits on.`,
        '',
        sekcjaUzytkownika,
        '',
        `[RULES]\nBoth faces are lit by Image 1's light, with its grain, and no visible seam. Natural skin: pores, no retouching. Everything else in Image 1 stays exactly as it is.`,
      ].join('\n')
    : ''
  const sekcje: SekcjaPromptu[] = ruchWKadrze
    ? [
        { klucz: 'task', tekst: zadanieRuchu },
        { klucz: 'user', tekst: sekcjaUzytkownika },
        { klucz: 'rules', tekst: sekcjaReguRuchu },
      ]
    : dodajKrotko
    ? [{ klucz: 'task', tekst: sekcjaDodaj }]
    : twarzKrotko
    ? [{ klucz: 'task', tekst: sekcjaTwarz }]
    : ubranieKrotko
    ? [{ klucz: 'task', tekst: sekcjaUbranie }]
    : przenosKrotko
    ? [{ klucz: 'task', tekst: sekcjaPrzenos }]
    : zamianaOsob
    ? [{ klucz: 'task', tekst: sekcjaZamianaOsob }]
    : [
        { klucz: 'task', tekst: sekcjaZadania },
        { klucz: 'user', tekst: sekcjaUzytkownika },
        { klucz: 'rules', tekst: sekcjaRegul },
      ]
  return {
    prompt: sekcje.map((s) => s.tekst).join('\n\n'),
    system: twarzKrotko || ubranieKrotko || zamianaOsob ? undefined : system,
    temperatura: twarzKrotko || ubranieKrotko || zamianaOsob ? undefined : temperatura,
    // Transfer z drugiego zdjęcia (zablokowany) i object swap (poza trybem w kadrze, który wybiera model w CanvasSection) → Gemini 3.1.
    gemini31: miedzyZdjeciami || (op.id === 'object_swap') || czescTryb || cechaTryb || sceneria || op.id === 'style_change' || op.id === 'clothing_change' || op.id === 'character_transfer' || undefined,
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
