/**
 * Budowanie poleceń dla modelu — rozpoznanie operacji ze zdania i złożenie
 * promptu z bricków.
 *
 * Cała treść reguł żyje w `prompty/` (kopia z `canvas/prompts`):
 *   - bricks/   cegiełki-zasady (światło, pozycja, skala, tożsamość, clean plate…)
 *   - operacje/ jeden prompt na sytuację (object_swap, character_transfer, removal…)
 *   - skladaj.ts składarka: IMAGES → BRICKS → OPERATION → PIN MAP → SCENE DETAILS →
 *               COMMAND → FINAL CHECK → FINAL QUALITY
 * Tu zostaje tylko to, co zależy od stanu Canvasu: wykrycie intencji, nazwy
 * i role pinesek oraz mapowanie intencji na operację.
 *
 * Polecenie idzie do modelu po angielsku. Zadanie użytkownika trafia
 * w oryginale — Nano Banana rozumie polski, a tłumaczenie po drodze
 * gubiło niuanse („piwniczka” to nie „basement”).
 */
import { etykietaPineski, type Pineska, type Warstwa } from './typy'
import { wykryjStyl, type Intencja } from './tryby-edycji'
import { wplecPineski } from './role-z-polecenia'
import { skladajPrompt, type ObrazWejscia, type OperationId, type PineskaSklejka, type SkladajWynik } from './prompty'

export { INTENCJE, TABELA_STYLOW, wykryjStyl, type Intencja } from './tryby-edycji'

/**
 * Rozpoznanie trybu z samego zdania — bez pytania użytkownika o tryb.
 *
 * Kolejność testów ma znaczenie: „zamień to na akwarelę” jest zmianą stylu,
 * „zamień tło na plażę” — zmianą tła, „usuń tę osobę” — usuwaniem, a nie
 * zamianą postaci. Dlatego najpierw idą tryby o najwęższych słowach.
 */
export function wykryjIntencje(tekst: string, pineski: Pineska[] = []): Intencja {
  const t = tekst.toLowerCase().trim()
  if (!t) {
    if (pineski.length >= 2) return 'przenies'
    if (pineski.length === 1) return 'zamien'
    return 'popraw'
  }

  // 1. Zmiana ubrania / stroju (Clothing Change)
  if (
    /\b(ubrani\w*|ubr[aó]j|str[oó]j|stroju|sukienk\w*|garnitur\w*|kurtk\w*|spodni\w*|koszul\w*|outfit|clothing|dress|przebierz|za[łl][oó][żz]|ubierz)\b/.test(
      t,
    )
  ) {
    return 'ubranie'
  }

  // 2. Zmiana tekstury / materiału powierzchni (Texture Replace)
  if (
    /\b(tekstur\w*|faktur\w*|materia[łl]\w*|drewnian\w*|marmur\w*|metaliczn\w*|sk[oó]rzan\w*|szklan\w*|betonow\w*|p[łl]ytk\w*|kafelk\w*|texture)\b/.test(
      t,
    )
  ) {
    return 'tekstura'
  }

  // 3. Pora roku (Season Change)
  if (
    /\b(por\w*\s+roku|wiosn\w*|letni\w*|lato\b|jesie[ńn]\w*|jesienn\w*|zim\w*|zimow\w*|[śs]nieg\w*|snow|season)\b/.test(
      t,
    )
  ) {
    return 'pora_roku'
  }

  // 4. Pora dnia / oświetlenie czasowe (Time of Day)
  if (
    /\b(por\w*\s+dnia|noc[ąay]?\b|nocn\w*|wiecz[oó]r\w*|zach[óo]d\w*\s+s[łl]o[ńn]c\w*|[śs]wit\w*|dusk|dawn|sunset|sunrise|midday|po[łl]udni\w*|z[łl]ot\w*\s+godzin\w*|golden hour)\b/.test(
      t,
    )
  ) {
    return 'pora_dnia'
  }

  // 5. Efekty wizualne (Shadow, Reflection, Glow, Particles)
  if (
    /\b(cie[ńn]\w*|cieni\w*|odbici\w*|refleks\w*|po[śs]wiat\w*|glow|blask|deszcz\w*|iskr\w*|ogie[ńn]\w*|p[łl]omie[ńn]\w*|[śs]wietlik\w*|mg[łl]\w*|cz[ąa]steczk\w*|particles?|fireflies)\b/.test(
      t,
    )
  ) {
    return 'efekt'
  }

  // 6. Styl artystyczny
  const styl =
    /\b(styl|w stylu|akwarel|olejn|szkic|rysunek|anime|komiks|pixel|retro|vintage|czarno-?bia|sepia|malarsk|kresk[oó]wk|cyberpunk|minimalis|fotorealist)/.test(
      t,
    )
  if (styl) return 'styl'

  // 7. Usuwanie obiektu / Clean Plate
  if (
    /\b(usu[ńn]|wyma[żz]|skasuj|pozb[ąa]d[źz]|zniknij|znikn[ąa][ćc]|bez\s+\w+|wytnij|skasowa[ćc]|wyczy[sś][ćc]|odtw[óo]rz\s+t[łl]o)/.test(
      t,
    )
  )
    return 'usun'

  // 8. Zmiana tła / otoczenia
  if (
    /\b(zmie[ńn]\w*|zamie[ńn]\w*|podmie[ńn]\w*|nowe|nowym|inne|innym|daj|ustaw)\s+(\w+\s+){0,2}(t[łl]o|t[łl]a|t[łl]em|otoczeni\w*|sceneri\w*)|\bt[łl]o\s+(na|w)\s|\bbackground/.test(
      t,
    )
  )
    return 'tlo'

  // 9. Zamiana twarzy / postaci — PRZED ogólną zamianą: „zamień twarz” i „zamień tę
  // osobę” zawierają „zamień”, więc sprawdzane później nigdy nie wygrywały.
  // Tylko WYRAŹNIE twarz / tożsamość = zamiana twarzy (face swap). „Zamień rycerza na tę osobę” to zamiana CAŁEJ postaci
  // (character swap: zostaje pozycja i miejsce, reszta — twarz, włosy, budowa, ubiór — z referencji), nie samej twarzy.
  if (/\b(twarz|face|tożsamo|tozsamo|wygl[ąa]da\w*\s+jak)/.test(t)) return 'postac'
  if (dotyczyCalejOsoby(t)) return 'zamien'

  // 9b. ZABLOKOWANE (zablokowane/ruch-w-kadrze.ts) — nie zmieniać bez prośby użytkownika. Czasownik przeniesienia („przesuń / przenieś / przestaw ten domek w miejsce ogrodu”) to PRZENIESIENIE do miejsca,
  // nie zamiana — „w miejsce X” oznacza tu cel, o ile polecenie nie mówi wprost „zamień / podmień / zastąp / zamiast”.
  if (/\b(przenie[śs]|przesu[ńn]|przestaw|prze[łl][óo][żz])/.test(t) && !/\b(zamie[ńn]|podmie[ńn]|zast[ąa]p|zamiast|swap)/.test(t)) {
    return 'przenies'
  }

  // 10. Zamiana miejscami lub podmiana obiektu (Object Replace: "w miejsce tej poduszki", "zamiast auta", "zamień X na Y")
  if (
    /\b(zamie[ńn]|podmie[ńn]|zast[ąa]p|zamiast|zamiana\s+miejscami|switch|swap|odwr[óo][ćc]|przer[óo]b\s+\w+\s+na|zr[óo]b\s+z\s+\w+)/.test(t) ||
    /\b(w|na)\s+miejsc[eu]\s+(te[gj]|t[eą]|teg[oó]|tamte[gj]|tamtego|[a-ząćęłńóśźż]+)/.test(t)
  ) {
    return 'zamien'
  }

  // 11. Przeniesienie obiektu (Object Transfer)
  if (
    /\b(przenie[śs]|przesu[ńn]|przestaw|przeni[eo]s|prze[łl][óo][żz]|daj\s+(to|go|j[ąa]|obiekt)?\s*(tu|tutaj|tutuaj|tam|w|na)|ma\s+by[ćc]\s+(tu|tutaj|tutuaj|tam|w|na)|niech[^.!?]{0,45}\b(b[ęe]dzie|stanie|znajdzie\s+si[ęe]|wyl[ąa]duje|stoi)\s+(tu|tutaj|tutuaj|tam|w|na)|w\s+miejsce\s*(\d+|drugie|celu)|na\s+miejsce\s*(\d+|drugie|celu))/.test(
      t,
    )
  )
    return 'przenies'

  if (pineski.length >= 2 && /\b(tu|tutaj|tutuaj|tam|w|na|miejsce|miejscu|pozycj)\b/.test(t)) {
    return 'przenies'
  }

  // 12. Wstawianie / dodawanie nowego obiektu
  if (
    /\b(dodaj|wstaw|umie[śs][ćc]|postaw|dorysuj|do[łl][óo][żz]|niech[^.!?]{0,24}\b(pojawi|stanie|b[ęe]dzie|stoi)|pojawi\s+si[ęe])/.test(
      t,
    )
  )
    return 'wstaw'

  if (pineski.length >= 2) return 'przenies'
  if (pineski.length === 1) return 'zamien'

  return 'popraw'
}

/* ── Pineski ─────────────────────────────────────────────────────── */

/**
 * Nazwy uchwytów muszą być rozróżnialne.
 *
 * Rozpoznawanie obrazu potrafi nazwać dwie pineski tak samo („ogród”
 * i „ogród”). W poleceniu robi się wtedy dwuznaczność, której model nie ma
 * jak rozstrzygnąć — więc powtórki dostają dopisek ze zdjęciem, na którym
 * leżą. To nie zmienia tego, co użytkownik widzi na chipie.
 */
function rozroznialneNazwy(pineski: Pineska[], obrazy: Warstwa[]): Map<string, string> {
  const wynik = new Map<string, string>()
  const ile = new Map<string, number>()

  for (const [i, p] of pineski.entries()) {
    const bazowa = etykietaPineski(p, i + 1)
    ile.set(bazowa, (ile.get(bazowa) ?? 0) + 1)
  }

  const licznik = new Map<string, number>()
  for (const [i, p] of pineski.entries()) {
    const bazowa = etykietaPineski(p, i + 1)
    if ((ile.get(bazowa) ?? 0) < 2) {
      wynik.set(p.id, bazowa)
      continue
    }

    // Numer zdjęcia zwykle wystarczy do rozróżnienia („ogród from Image 2”).
    // Kolejny numer dokładamy tylko wtedy, gdy powtórki siedzą na tym samym
    // zdjęciu i sam jego numer niczego nie rozstrzyga.
    const numerObrazu = obrazy.findIndex(w => w.id === p.layerId) + 1
    const naTymSamym = pineski.filter(
      x => x.layerId === p.layerId && etykietaPineski(x, pineski.indexOf(x) + 1) === bazowa,
    ).length

    if (naTymSamym < 2) {
      wynik.set(p.id, `${bazowa} from Image ${numerObrazu}`)
      continue
    }

    const kolejny = (licznik.get(bazowa) ?? 0) + 1
    licznik.set(bazowa, kolejny)
    wynik.set(p.id, `${bazowa} from Image ${numerObrazu}, no. ${kolejny}`)
  }
  return wynik
}

/**
 * Rola pineski w danym trybie.
 *
 * Sama lista „pineska 1, pineska 2” zostawiała modelowi zgadywanie, która
 * jest źródłem, a która celem. Przy przeniesieniu pierwsza na płótnie to
 * obiekt, ostatnia — miejsce docelowe; przy zamianie pineska na płótnie
 * wskazuje, co zniknie, a pineska na innym zdjęciu — dawcę.
 */
function rolaPineski(
  intencja: Intencja,
  p: Pineska,
  wskazane: Pineska[],
  obrazy: Warstwa[],
  rolaAgenta?: string,
): string {
  const naPlotnie = p.layerId === obrazy[0]?.id

  // Agent widział zdjęcia i zdanie — jego rola wygrywa z domysłem z kolejności.
  const zAgenta: Record<string, string> = {
    SOURCE: naPlotnie ? 'SOURCE — the object to move away from here' : 'SOURCE — the object to bring into the scene',
    DESTINATION: 'DESTINATION — where the object ends up standing',
    TARGET: intencja === 'postac' ? 'TARGET PERSON — keeps pose, body and clothing' : 'TARGET — the element to be replaced',
    DONOR: intencja === 'postac' ? 'IDENTITY DONOR — face and hair to carry over' : 'DONOR — the new element to put in its place',
    REMOVE: 'REMOVE — this object and all its traces',
    SUBJECT: 'SUBJECT — stays exactly as it is',
    STYLE: 'STYLE REFERENCE',
    AREA: 'area to change',
  }
  if (rolaAgenta && zAgenta[rolaAgenta]) return zAgenta[rolaAgenta]

  switch (intencja) {
    case 'przenies': {
      // Pierwsza pineska to obiekt, ostatnia — cel. Płótnem jest zdjęcie celu
      // (patrz `warstwaZrodlowa` w CanvasSection), więc obiekt z innego
      // zdjęcia jest przynoszony, a z płótna — przesuwany.
      if (wskazane.length < 2) return naPlotnie ? 'DESTINATION — where the object ends up standing' : 'SOURCE — the object to bring into the scene'
      if (p === wskazane[wskazane.length - 1]) return 'DESTINATION — where the object ends up standing'
      if (p === wskazane[0]) return naPlotnie ? 'SOURCE — the object to move away from here' : 'SOURCE — the object to bring into the scene'
      return 'additional reference'
    }
    case 'zamien':
      return naPlotnie ? 'TARGET — the element to be replaced' : 'DONOR — the new element to put in its place'
    case 'postac':
      return naPlotnie ? 'TARGET PERSON — keeps pose, body and clothing' : 'IDENTITY DONOR — face and hair to carry over'
    case 'wstaw':
      return naPlotnie ? 'INSERTION POINT — where the new object touches the ground' : 'DONOR — the object to insert'
    case 'usun':
      return naPlotnie ? 'REMOVE — this object and all its traces' : 'reference'
    case 'tlo':
      return naPlotnie ? 'SUBJECT — stays exactly as it is' : 'NEW ENVIRONMENT — reference for the surroundings'
    case 'styl':
      return naPlotnie ? 'area of attention' : 'STYLE REFERENCE'
    default:
      return naPlotnie ? 'area to change' : 'reference'
  }
}

/* ── Operacje ────────────────────────────────────────────────────── */

/** Intencja z UI i reżysera → operacja z rejestru bricków. */
const OPERACJE_Z_INTENCJI: Record<Intencja, OperationId> = {
  wstaw: 'addition',
  przenies: 'object_transfer',
  zamien: 'object_swap',
  postac: 'face_swap',
  ubranie: 'clothing_change',
  usun: 'removal',
  tekstura: 'texture_change',
  pora_roku: 'season_change',
  pora_dnia: 'time_of_day_change',
  efekt: 'effect_add',
  tlo: 'background_change',
  styl: 'style_change',
  popraw: 'general_fix',
}

/**
 * Operacja dla danej intencji. Gdy reżyser widzi, że zamiana albo przeniesienie
 * dotyczy CAŁEJ osoby, wchodzą operacje postaci (tożsamość, włosy, ubranie, poza…).
 */
/** „Zamień / podmień X na tę osobę / postać / mężczyznę…” bez słowa o twarzy — zamiana całej postaci (character swap). */
export function dotyczyCalejOsoby(tekst: string): boolean {
  const t = tekst.toLowerCase()
  if (/\b(twarz|face|tożsamo|tozsamo|wygl[ąa]da\w*\s+jak)/.test(t)) return false
  return /\b(zamie[ńn]|podmie[ńn]|zast[ąa]p)\w*[^.!?]{0,40}\b(posta[ćc]|postaci|osob|cz[łl]owiek|kobiet|m[ęe][żz]czyzn|dziewczyn|ch[łl]op|dziecko|rycerz|aktor|model)/.test(t)
}

export function operacjaZIntencji(intencja: Intencja, osoba = false): OperationId {
  if (osoba && intencja === 'zamien') return 'character_swap'
  // wstawienie / przeniesienie całej osoby (też z innego zdjęcia) = operacja postaci
  if (osoba && (intencja === 'przenies' || intencja === 'wstaw')) return 'character_transfer'
  return OPERACJE_Z_INTENCJI[intencja]
}

/** Role „biorę stąd” (dawca, źródło, styl) kontra „działam tutaj” (cel, miejsce, obszar). */
const ROLA_ZRODLA = /^(SOURCE|DONOR|IDENTITY DONOR|STYLE|NEW ENVIRONMENT|additional reference|reference)/

export interface OpcjePolecenia {
  /** numer pineski → rola od agenta albo z `role-z-polecenia.ts` (SOURCE, DESTINATION, …) */
  role?: Record<number, string>
  /** reżyser: zamiana lub przeniesienie dotyczy całej osoby */
  osoba?: boolean
  /** numer pineski → krótki opis od Gemini, odróżniający obiekt od podobnych („zielony hatchback, lewy z dwóch”) */
  odznaki?: Record<number, string>
  /** światło i kamera zdjęcia docelowego zmierzone przez reżysera */
  swiatlo?: string
  /** rozmiar obiektu w miejscu docelowym policzony z kotwic reżysera (EN) — idzie do [RULES] */
  rozmiar?: string
  /** wersja Studio promptów (przełącznik w czacie) */
  studio?: boolean
  /** Studio + zmierzony rozmiar obiektu od reżysera (porównanie z czystym Studiem) */
  hybryda?: boolean
  /** numer pineski → szczegółowy opis rzeczy / miejsca od reżysera (EN) */
  szczegoly?: Record<number, string>
  /** numer pineski → gdzie leży punkt, słowami (EN) */
  miejsca?: Record<number, string>
  /** rzeczywisty rozmiar obiektu i porównanie z kotwicą, słowami (EN) — od reżysera */
  skala?: string
  /** jak obiekt ma WYGLĄDAĆ w miejscu docelowym: kierunek, widoczne ściany, wysokość kamery (EN) */
  widok?: string
  /** logiczne ułożenie: powierzchnia, dopasowanie, wyrównanie, odstępy (EN) */
  ulozenie?: string
  /** nazwa CZĘŚCI obiektu (EN), gdy użytkownik zmienia tylko część (np. oświetlenie auta) */
  czesc?: string
  /** zmieniana właściwość rzeczy pod pinem (EN) */
  cecha?: string
  /** numer obrazu ze zbliżeniem twarzy osoby z referencji (dodatkowy obraz tożsamości) */
  twarzObraz?: number
  /** dodatkowe obrazy-zbliżenia w pobliżu pinesek: numer obrazu + opis (EN) */
  zblizenia?: { numer: number; opis: string }[]
  /** ile sztuk części: all = komplet, one = pojedyncza */
  czescZakres?: 'all' | 'one'
  /** tlo: co zostaje nietknięte — główne obiekty i nakładki (EN, od reżysera) */
  pierwszyPlan?: string
}

/** Operacje na człowieku — idą modelem postaci (RUNWARE_MODEL_POSTAC). */
export const OPERACJE_POSTACI = new Set<OperationId>(['character_swap', 'character_transfer', 'face_swap'])

/**
 * Pineski-źródła, które leżą na obrazie docelowym (obiekt do zamiany/przeniesienia
 * stoi już w Image 1). Nie dostają kropki — zostałaby w wyniku — więc wskazują je
 * współrzędne i nazwa w PIN MAP.
 */
export function idZrodelNaPlotnie(
  pineski: Pineska[],
  obrazy: Warstwa[],
  intencja: Intencja,
  role: Record<number, string> = {},
): Set<string> {
  const wskazane = pineski.filter(p => !p.chroniona)
  const wynik = new Set<string>()
  for (const p of wskazane) {
    const opis = rolaPineski(intencja, p, wskazane, obrazy, role[pineski.indexOf(p) + 1])
    if (ROLA_ZRODLA.test(opis) && p.layerId === obrazy[0]?.id) wynik.add(p.id)
  }
  return wynik
}

/* ── Złożenie ────────────────────────────────────────────────────── */

/**
 * Pełne polecenie dla modelu: [TASK] operacji + obrazy i pineski, [USER] ze
 * słowami użytkownika i wplecionymi pineskami, [RULES] z bricków Studia.
 */
export function zbudujPolecenie(
  tekst: string,
  pineski: Pineska[],
  obrazy: Warstwa[],
  intencja: Intencja = wykryjIntencje(tekst),
  opcje: OpcjePolecenia = {},
): string {
  return zbudujZadanieModelu(tekst, pineski, obrazy, intencja, opcje)?.prompt ?? ''
}

/**
 * To samo co `zbudujPolecenie`, ale z rolą modelu (systemPrompt) i temperaturą —
 * tak jak edge functions Studia Zdjęć wysyłają je w `settings`.
 */
export function zbudujZadanieModelu(
  tekst: string,
  pineski: Pineska[],
  obrazy: Warstwa[],
  intencja: Intencja = wykryjIntencje(tekst),
  opcje: OpcjePolecenia = {},
): SkladajWynik | null {
  const { role = {}, osoba = false, odznaki = {}, swiatlo, rozmiar, szczegoly = {}, miejsca = {}, skala, widok, ulozenie, czesc, czescZakres, cecha, pierwszyPlan, twarzObraz, zblizenia, studio, hybryda } = opcje
  const zadanie = tekst.trim()
  if (!zadanie) return null

  const nazwy = rozroznialneNazwy(pineski, obrazy)
  const numerObrazu = (p: Pineska) => Math.max(1, obrazy.findIndex(w => w.id === p.layerId) + 1)
  const wskazane = pineski.filter(p => !p.chroniona)
  const chronione = pineski.filter(p => p.chroniona)
  const odznaka = (p: Pineska) => nazwy.get(p.id) || odznaki[pineski.indexOf(p) + 1]

  const pineskiSklejka: PineskaSklejka[] = wskazane.map(p => {
    const numer = pineski.indexOf(p) + 1
    const rolaOpis = rolaPineski(intencja, p, wskazane, obrazy, role[numer])
    return {
      numer,
      rola: ROLA_ZRODLA.test(rolaOpis) ? 'source' : 'target',
      obraz: numerObrazu(p),
      x: p.normalizedX,
      y: p.normalizedY,
      nazwa: odznaka(p),
      szczegoly: szczegoly[numer] || undefined,
      miejsce: miejsca[numer] || undefined,
    }
  })

  // [USER]: słowa użytkownika bez zmian, pineska w nawiasie przy słowie, które ją wskazuje
  const wsp = (v: number) => v.toFixed(2)
  const zPineskami = wplecPineski(
    zadanie,
    pineski,
    numer => {
      const p = pineski[numer - 1]
      const nazwa = odznaka(p)
      return `Pin ${numer} · Image ${numerObrazu(p)}${nazwa ? ` · "${nazwa}"` : ''} · x=${wsp(p.normalizedX)} y=${wsp(p.normalizedY)}`
    },
    numer => {
      const s = pineskiSklejka.find(x => x.numer === numer)
      return !s ? null : s.rola === 'source' ? 'obiekt' : 'miejsce'
    },
  )

  // Pierwszy obraz to zawsze płótno (docelowe), pozostałe to dawcy.
  const obrazyWejscia: ObrazWejscia[] = Array.from({ length: Math.max(1, obrazy.length) }, (_, i) => ({
    numer: i + 1,
    rola: i === 0 ? 'target' : 'donor',
  }))

  const styl = intencja === 'styl' ? wykryjStyl(zadanie) : undefined

  // „Wstaw ten obiekt z drugiego zdjęcia” to przeniesienie obiektu (zachowane proporcje i tożsamość).
  let operacja = operacjaZIntencji(intencja, osoba)
  if (operacja === 'addition' && pineskiSklejka.some(p => p.rola === 'source' && p.obraz > 1)) operacja = 'object_transfer'

  return skladajPrompt({
    studio,
    hybryda,
    polecenie: zPineskami,
    operacja,
    pineski: pineskiSklejka,
    obrazy: obrazyWejscia,
    swiatlo,
    rozmiar,
    skala,
    widok,
    ulozenie,
    czesc,
    czescZakres,
    cecha,
    twarzObraz,
    zblizenia,
    pierwszyPlan,
    pineskiChronione: chronione.map(p => ({
      numer: pineski.indexOf(p) + 1,
      obraz: numerObrazu(p),
      x: p.normalizedX,
      y: p.normalizedY,
      nazwa: odznaka(p),
    })),
    dyrektywyStylu: styl ? { nazwa: styl.nazwa, reguly: styl.reguly } : undefined,
    format: obrazy[0] ? { szerokosc: obrazy[0].naturalWidth, wysokosc: obrazy[0].naturalHeight } : undefined,
  })
}
