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
import { skladajPrompt, type ObrazWejscia, type OperationId, type PineskaSklejka } from './prompty'

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

  // 9. Zamiana miejscami lub podmiana obiektu (Object Replace: "w miejsce tej poduszki", "zamiast auta", "zamień X na Y")
  if (
    /\b(zamie[ńn]|podmie[ńn]|zast[ąa]p|zamiast|zamiana\s+miejscami|switch|swap|odwr[óo][ćc]|przer[óo]b\s+\w+\s+na|zr[óo]b\s+z\s+\w+)/.test(t) ||
    /\b(w|na)\s+miejsc[eu]\s+(te[gj]|t[eą]|teg[oó]|tamte[gj]|tamtego|[a-ząćęłńóśźż]+)/.test(t)
  ) {
    return 'zamien'
  }

  // 10. Przeniesienie obiektu (Object Transfer)
  if (
    /\b(przenie[śs]|przesu[ńn]|przestaw|przeni[eo]s|prze[łl][óo][żz]|daj\s+(to|go|j[ąa]|obiekt)?\s*(tu|tutaj|tutuaj|tam|w|na)|ma\s+by[ćc]\s+(tu|tutaj|tutuaj|tam|w|na)|niech[^.!?]{0,45}\b(b[ęe]dzie|stanie|znajdzie\s+si[ęe]|wyl[ąa]duje|stoi)\s+(tu|tutaj|tutuaj|tam|w|na)|w\s+miejsce\s*(\d+|drugie|celu)|na\s+miejsce\s*(\d+|drugie|celu))/.test(
      t,
    )
  )
    return 'przenies'

  // 10. Zamiana postaci / twarzy
  if (
    /\b(twarz|face|tożsamo|tozsamo|wygl[ąa]da\w*\s+jak)/.test(t) ||
    /\b(zamie[ńn]|podmie[ńn]|zast[ąa]p)\w*[^.!?]{0,30}\b(posta[ćc]|osob|cz[łl]owiek|kobiet|m[ęe][żz]czyzn|dziewczyn|ch[łl]opa|dziecko)/.test(t)
  )
    return 'postac'

  // 11. Zamiana miejscami lub podmiana (Object Switch / Replace)
  if (
    /\b(zamie[ńn]|podmie[ńn]|zast[ąa]p|zamiast|zamiana\s+miejscami|switch|swap|odwr[óo][ćc]|przer[óo]b\s+\w+\s+na|zr[óo]b\s+z\s+\w+)/.test(
      t,
    )
  )
    return 'zamien'

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
export function operacjaZIntencji(intencja: Intencja, osoba = false): OperationId {
  if (osoba && intencja === 'zamien') return 'character_swap'
  if (osoba && intencja === 'przenies') return 'character_transfer'
  return OPERACJE_Z_INTENCJI[intencja]
}

/** Role „biorę stąd” (dawca, źródło, styl) kontra „działam tutaj” (cel, miejsce, obszar). */
const ROLA_ZRODLA = /^(SOURCE|DONOR|IDENTITY DONOR|STYLE|NEW ENVIRONMENT|additional reference|reference)/

/** Tylko rozmiar z analizy pineski — bez opisu wyglądu, światła i stanu powierzchni. */
function rozmiarPineski(a: Pineska['analiza']): string {
  if (!a) return ''
  const wymiary = [a.wysokoscCm ? `height ≈ ${a.wysokoscCm} cm` : '', a.dlugoscCm ? `length ≈ ${a.dlugoscCm} cm` : '']
    .filter(Boolean)
    .join(', ')
  return wymiary ? `size: ${wymiary}` : ''
}

export interface OpcjePolecenia {
  /** rzeczywisty rozmiar obiektu względem kotwicy w kadrze (agent-reżyser) — sekcja SCALE */
  skala?: string
  /** dodatkowa uwaga techniczna dla modelu (np. że Image 1 jest wycinkiem) */
  instrukcja?: string
  /** numer pineski → rola od agenta (SOURCE, DESTINATION, …) */
  role?: Record<number, string>
  /** numer pineski → miejsce opisane słowami przez agenta (na czym stoi, co jest obok) */
  miejsca?: Record<number, string>
  /** reżyser: zamiana lub przeniesienie dotyczy całej osoby */
  osoba?: boolean
}

/* ── Złożenie ────────────────────────────────────────────────────── */

/**
 * Pełne polecenie dla modelu.
 *
 * `skala` pochodzi od agenta-reżysera (`rezyser.ts`), który oglądał zdjęcia:
 * to jedyny opis sceny, jaki idzie do modelu (rzeczywisty rozmiar obiektu). Wchodzą W szkielet z bricków, nigdy zamiast niego.
 */
export function zbudujPolecenie(
  tekst: string,
  pineski: Pineska[],
  obrazy: Warstwa[],
  intencja: Intencja = wykryjIntencje(tekst),
  opcje: OpcjePolecenia = {},
): string {
  const { skala = '', instrukcja = '', role = {}, miejsca = {}, osoba = false } = opcje
  const zadanie = tekst.trim()
  if (!zadanie) return ''

  const nazwy = rozroznialneNazwy(pineski, obrazy)
  const numerObrazu = (p: Pineska) => Math.max(1, obrazy.findIndex(w => w.id === p.layerId) + 1)
  const wskazane = pineski.filter(p => !p.chroniona)
  const chronione = pineski.filter(p => p.chroniona)

  const pineskiSklejka: PineskaSklejka[] = wskazane.map(p => {
    const numer = pineski.indexOf(p) + 1
    const rolaOpis = rolaPineski(intencja, p, wskazane, obrazy, role[numer])
    return {
      numer,
      rola: ROLA_ZRODLA.test(rolaOpis) ? 'source' : 'target',
      obraz: numerObrazu(p),
      x: p.normalizedX,
      y: p.normalizedY,
      nazwa: nazwy.get(p.id),
      miejsce: miejsca[numer],
      opis: [rolaOpis, rozmiarPineski(p.analiza)].filter(Boolean).join('; '),
    }
  })

  // Pierwszy obraz to zawsze płótno (docelowe), pozostałe to dawcy.
  const obrazyWejscia: ObrazWejscia[] = Array.from({ length: Math.max(1, obrazy.length) }, (_, i) => ({
    numer: i + 1,
    rola: i === 0 ? 'target' : 'donor',
  }))

  const styl = intencja === 'styl' ? wykryjStyl(zadanie) : undefined

  return skladajPrompt({
    polecenie: zadanie,
    operacja: operacjaZIntencji(intencja, osoba),
    pineski: pineskiSklejka,
    obrazy: obrazyWejscia,
    skala: skala.trim() || undefined,
    instrukcja: instrukcja.trim() || undefined,
    pineskiChronione: chronione.map(p => ({
      numer: pineski.indexOf(p) + 1,
      obraz: numerObrazu(p),
      nazwa: nazwy.get(p.id),
      miejsce: miejsca[pineski.indexOf(p) + 1],
    })),
    dyrektywyStylu: styl ? { nazwa: styl.nazwa, reguly: styl.reguly } : undefined,
    format: obrazy[0] ? { szerokosc: obrazy[0].naturalWidth, wysokosc: obrazy[0].naturalHeight } : undefined,
  }).prompt
}
