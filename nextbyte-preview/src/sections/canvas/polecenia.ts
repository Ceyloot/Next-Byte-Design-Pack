/**
 * Budowanie poleceń dla modelu — jedno miejsce na całą wiedzę o tym, jak
 * rozmawiać z modelem edycyjnym.
 *
 * Jeden prompt nie obsłuży wszystkiego: „usuń altanę” i „zmień to na
 * akwarelę” to inne zadania i inne pułapki. Usuwanie wymaga rekonstrukcji
 * tła, zamiana — przejęcia skali i cieni poprzednika, styl — zachowania
 * kompozycji. Dlatego jest wspólny szkielet i osobne reguły na tryb.
 *
 * Polecenie idzie do modelu po angielsku (patrz `tryby-edycji.ts`), więc
 * wszystkie sekcje niżej są po angielsku. Zadanie użytkownika trafia
 * w oryginale — Nano Banana rozumie polski, a tłumaczenie po drodze
 * gubiło niuanse („piwniczka” to nie „basement”).
 */
import { etykietaPineski, type Pineska, type Warstwa } from './typy'

import { TRYBY, TABELA_STYLOW, wykryjStyl, type Intencja } from './tryby-edycji'

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

  // 9. Przeniesienie obiektu (Object Transfer)
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

/* ── Położenie ───────────────────────────────────────────────────── */

/**
 * Położenie pineski po angielsku: opis słowny plus procenty.
 *
 * Opis słowny jest pierwszy, bo tak opisują sceny podpisy, na których
 * model był trenowany — same procenty trafiały obok. Procenty dokładamy
 * w nawiasie jako doprecyzowanie: Gemini zna współrzędne z zadań detekcji,
 * a przy pięciu pasach „lower part” obejmuje jedną piątą kadru.
 */
export function polozenie(x: number, y: number): string {
  const pas = (v: number, nazwy: [string, string, string, string, string]) =>
    v < 0.18 ? nazwy[0] : v < 0.4 ? nazwy[1] : v < 0.6 ? nazwy[2] : v < 0.82 ? nazwy[3] : nazwy[4]

  const pion = pas(y, ['near the top edge', 'in the upper part', 'at mid-height', 'in the lower part', 'near the bottom edge'])
  const poziom = pas(x, ['near the left edge', 'left of centre', 'horizontally centred', 'right of centre', 'near the right edge'])
  return `${pion}, ${poziom} (x ${Math.round(x * 100)}%, y ${Math.round(y * 100)}% from the top-left corner)`
}

/* ── Fragmenty wspólne ───────────────────────────────────────────── */

/**
 * Skala — sekcja, która powstała z konkretnej porażki: wstawiona kanapa
 * wyszła wielkości garażu i weszła w inne obiekty.
 *
 * Model nie ma pojęcia, ile metrów ma miejsce na zdjęciu, dopóki mu tego
 * nie każemy ustalić. Dlatego zamiast prosić „dopasuj skalę” (ogólnik, który
 * nic nie znaczy) dajemy procedurę i punkty odniesienia o znanych
 * wymiarach — Google zaleca dokładnie to: konkretne miary zamiast przymiotników.
 */
function sekcjaSkali(): string {
  return [
    'SCALE AND PERSPECTIVE:',
    '1. First read the scale of the scene from things of known size near the target point: a door is about 2 m tall, an adult about 1.7 m, a car about 1.5 m tall and 4.5 m long, a chair seat about 45 cm high, a dog or seal about 1–2 m long. Things already standing next to the target point are the best ruler.',
    '2. Then size the object against those references at the depth where it stands — further from the camera means smaller.',
    '3. Its vertical lines stay parallel to the verticals of the scene; its horizontal lines converge to the same vanishing points and horizon as Image 1.',
    '4. Keep the focal length, depth of field and grain of Image 1.',
  ].join('\n')
}

/**
 * Zaznaczone obszary na płótnie (patrz `narysujObszary` w mapa-miejsc.ts).
 *
 * Prostokąt mówi modelowi i GDZIE, i JAK DUŻE — stąd zdanie o skali tuż przy
 * opisie magenty. Nakładka potrafi przejść do wyniku (celownik na oparciu
 * ławki, sprawdzone generacją), więc opisujemy stan docelowy tego miejsca
 * i odsyłamy do czystego płótna, zamiast wyliczać, czego ma nie być.
 */
function sekcjaObszarow(obszary: Obszary | undefined, intencja: Intencja, nrCzystego: number): string {
  if (!obszary?.cel && !obszary?.zrodlo) return ''
  const linie = ['MARKED AREAS ON IMAGE 1:']

  if (obszary.cel) {
    const tresc: Record<string, string> = {
      wstaw:
        'the finished object is placed inside this rectangle, occupying 50–70% of the area with 30–50% safety breathing room from boundaries. Standing naturally on the ground plane, 100% complete.',
      przenies:
        'the moved object is placed inside this rectangle, occupying 50–70% of the area with 30–50% safety breathing room. 100% complete without clipped edges.',
      zamien:
        'the object inside this rectangle is replaced; the new object occupies 50–70% of the space with 30–50% safety margin, matching ground contact and camera angle.',
      postac:
        'the head and hair inside this rectangle take the identity from the reference photo; pose, body and clothing stay.',
      ubranie:
        'the clothing inside this rectangle is replaced with the new outfit, fitting the body naturally while face, hands and background stay intact.',
      usun:
        'the object inside this rectangle is completely removed, including shadows and reflections, and the background behind it is seamlessly reconstructed.',
      tekstura:
        'the surface texture inside this rectangle is replaced with the new material while strictly preserving underlying 3D geometry and curvature.',
      pora_roku:
        'seasonal transformation applied across this region with natural foliage, ground cover and atmospheric lighting.',
      pora_dnia:
        'time-of-day illumination and sky transformation applied across this area with matching shadow recalculation.',
      efekt:
        'visual effect (shadows, reflection, glow, or particles) rendered organically inside this region.',
    }
    linie.push(`- MAGENTA rectangle — ${tresc[intencja] ?? 'the change happens inside this rectangle.'}`)
  }
  if (obszary.zrodlo) {
    linie.push('- RED rectangle — where the object stands now; after the edit this area shows only the restored clean background.')
  }
  linie.push(
    '- The rectangles are temporary guide markers drawn onto a copy of the photo, not part of the scene. ' +
      `In the result these areas show the real scene in natural colours, continuing Image ${nrCzystego} (the clean canvas photo).`,
    '- Everything outside the rectangles stays exactly as it is in the clean canvas photo.',
  )
  return linie.join('\n')
}

/**
 * Czysty wynik — zawsze, nie tylko przy mapie.
 *
 * Numery pinesek i procenty w samym prompcie też potrafiły wrócić na
 * obrazie jako napis. Formułujemy to jako opis wyniku, bez wyliczania
 * rzeczy, których ma nie być (patrz nagłówek `tryby-edycji.ts`).
 */
function sekcjaCzystegoWyniku(): string {
  return [
    'CLEAN OUTPUT:',
    'Pin numbers, names and coordinates in this prompt are instructions for you only.',
    'The result is a single clean, unannotated photograph: the scene itself with natural surfaces and colours from edge to edge.',
  ].join('\n')
}

/**
 * Kadr to najczęstsza porażka edycji: model przerysowuje scenę z innej
 * odległości i wynik przestaje pasować do oryginału, choć „zrobił, o co
 * prosiłeś”. Dlatego kadr dostaje własną sekcję zaraz po zadaniu.
 */
function sekcjaKadru(): string {
  return [
    'FRAMING — OVERRIDING CONDITION:',
    'The result is Image 1 with the change from the task — the same shot, taken from the same spot.',
    '- The camera stays where it was: the same distance, the same field of view, the same angle.',
    '- Every element the task does not concern stays in the same place and at the same size as in Image 1.',
    '- The frame edges stay exactly where they are: the same slice of the scene as Image 1.',
    '- Work on this shot like a retoucher on a finished photograph — the scene is already built.',
  ].join('\n')
}

/**
 * Zakres władzy każdego zdjęcia.
 *
 * Nie wystarczy powiedzieć, czym zdjęcie jest — trzeba powiedzieć, o czym
 * NIE decyduje. Przy kilku obrazach na wejściu model sam rozstrzyga, skąd
 * wziąć kadr i światło, i regularnie bierze je z niewłaściwego.
 *
 * Wzorzec z `higgsfield-prompt-template` (REFERENCE AUTHORITY:
 * controls / does_not_control / priority). Zakres dawcy zależy od trybu —
 * przy zamianie postaci dawca daje twarz, przy zmianie tła — otoczenie.
 */
function sekcjaZdjec(obrazy: Warstwa[], obszary: Obszary | undefined, intencja: Intencja): string {
  if (obrazy.length === 0) return ''
  const tryb = TRYBY[intencja]

  const wpis = (naglowek: string, kontroluje: string, nieKontroluje: string, priorytet: string) =>
    [naglowek, `  controls: ${kontroluje}`, `  does not control: ${nieKontroluje}`, `  priority: ${priorytet}`].join('\n')

  const plotno = tryb.swiatloZPlotna
    ? 'framing, perspective, viewpoint, lighting, time of day, colour grading and the whole scene outside the change'
    : 'framing, perspective, viewpoint, composition and the position of everything in the scene'

  const zaznaczone = Boolean(obszary?.cel || obszary?.zrodlo)
  const opisy = obrazy.map((w, i) =>
    i === 0
      ? wpis(
          `Image 1 ("${w.name}") — CANVAS (also called "the canvas photo")` +
            (zaznaczone ? ', with the edit area marked by coloured rectangles' : ''),
          plotno,
          'the look of the one area the task concerns — only there may the result depart from this image',
          'highest — on any conflict with other images, Image 1 wins',
        )
      : wpis(
          `Image ${i + 1} ("${w.name}") — REFERENCE (also called "the reference photo")`,
          tryb.material.decyduje,
          tryb.material.nieDecyduje,
          'applies only to what the task takes from it, never to the scene',
        ),
  )

  // Czyste płótno idzie jako ostatnie: to samo zdjęcie co Image 1, bez
  // nakładki — prawdziwe barwy i faktura tego, co leży pod prostokątami.
  if (zaznaczone) {
    opisy.push(
      wpis(
        `Image ${obrazy.length + 1} — CLEAN CANVAS (the same photo as Image 1, without markings)`,
        'the true colours, textures and light of the canvas scene, including what lies under the rectangles',
        'framing and the content of the change — the result has the framing of Image 1',
        'the look of the result outside the change follows this image',
      ),
    )
  }

  return `IMAGES — AUTHORITY OF EACH:\n${opisy.join('\n')}`
}

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

function sekcjaUchwytow(
  pineski: Pineska[],
  obrazy: Warstwa[],
  intencja: Intencja,
  role: Record<number, string>,
): string {
  if (pineski.length === 0) return ''
  const nazwy = rozroznialneNazwy(pineski, obrazy)
  const numerObrazu = (p: Pineska) => obrazy.findIndex(w => w.id === p.layerId) + 1

  const wskazane = pineski.filter(p => !p.chroniona)
  const chronione = pineski.filter(p => p.chroniona)
  const czesci: string[] = []

  if (wskazane.length > 0) {
    czesci.push(
      `SPATIAL ANCHORS (names the task uses):\n${wskazane
        .map(
          p =>
            `Pin ${pineski.indexOf(p) + 1} "${nazwy.get(p.id)}" — ${rolaPineski(intencja, p, wskazane, obrazy, role[pineski.indexOf(p) + 1])}; ` +
            `Image ${numerObrazu(p)}, ${polozenie(p.normalizedX, p.normalizedY)}`,
        )
        .join('\n')}\n` +
        // Obie reguły z jednej generacji: pineska na masce Mustanga dała
        // samą maskę, a pineska celu obok foki — auto w miejscu foki.
        'How to read the pins:\n' +
        '- A pin is a point ON an object. Its name may describe only the part under the point (a hood, a sleeve, a wheel). ' +
        'The operation concerns the WHOLE object that contains the point, unless the task explicitly names a part.\n' +
        '- A destination or insertion pin marks where the object stands on the ground. Everything already near that point ' +
        'stays in its place at its size; the new object stands beside it and shares the space.',
    )
  }

  if (chronione.length > 0) {
    czesci.push(
      `PROTECTED AREAS — HIGHEST PRIORITY:\n${chronione
        .map(p => `- "${nazwy.get(p.id)}" — Image ${numerObrazu(p)}, ${polozenie(p.normalizedX, p.normalizedY)}`)
        .join('\n')}\n` +
        // Nie żądamy zgodności pikselowej: model przerysowuje cały kadr,
        // więc taka obietnica jest z góry niewykonalna. Prosimy o wygląd
        // nieodróżnialny od oryginału i o omijanie tych miejsc.
        'These areas come out of the edit indistinguishable from the original: the same shape, ' +
        'colour, sharpness and position. On conflict with the task, protection wins — ' +
        'shrink the change, move it, or route it around these areas.',
    )
  }

  return czesci.join('\n\n')
}

/** Integracja fotometryczna: reguły trybu plus to, co wspólne dla każdej operacji na zdjęciu. */
function sekcjaSwiatla(obrazy: Warstwa[], intencja: Intencja): string {
  const tryb = TRYBY[intencja]
  const reguly = [...tryb.swiatlo]

  if (tryb.swiatloZPlotna) {
    reguly.push(
      'Direction, colour temperature and hardness of light match Image 1; every shadow falls the way the others in the scene do.',
    )
  }
  reguly.push('Grain, sharpness and depth of field match Image 1, including along the edges of the changed area.')
  if (intencja !== 'styl') {
    reguly.push('The result looks like one photograph from one camera, one exposure — a single seamless shot.')
  }
  if (obrazy.length > 1 && tryb.swiatloZPlotna) {
    reguly.push(
      'Whatever comes from a reference image is redrawn in the light and quality of Image 1 — it belongs to that scene, it is not a pasted cut-out.',
    )
  }
  return `PHOTOMETRIC INTEGRATION:\n${reguly.map(r => `- ${r}`).join('\n')}`
}

export interface Obszary {
  cel: boolean
  zrodlo: boolean
}

export interface OpcjePolecenia {
  /** które obszary są narysowane na Image 1 — wtedy czyste płótno idzie jako ostatni obraz */
  obszary?: Obszary
  /** opis obiektów i sceny od agenta-reżysera */
  szczegoly?: string
  /** precyzyjna instrukcja od agenta-reżysera */
  instrukcja?: string
  /** numer pineski → rola od agenta (SOURCE, DESTINATION, …) */
  role?: Record<number, string>
}

/* ── Złożenie ────────────────────────────────────────────────────── */

/**
 * Pełne polecenie dla modelu.
 *
 * Układ jest stały niezależnie od trybu: zadanie → kadr → zdjęcia →
 * kotwice → misja → reguły trybu → skala → światło → czysty wynik →
 * to, co zostaje bez zmian. Model najmocniej trzyma się początku, więc
 * zadanie idzie pierwsze, a kadr zaraz po nim. Koniec to wzór Google
 * „co się zmienia + co zostaje”, więc lista „zostaje” zamyka polecenie.
 *
 * `szczegoly` i `instrukcja` pochodzą od agenta-reżysera (`rezyser.ts`),
 * który oglądał zdjęcia: opis całych obiektów i jedna precyzyjna instrukcja
 * z miejscem, skalą i sąsiadami. Wchodzą W rusztowanie, nigdy zamiast niego.
 * Bez agenta operację opisuje ogólna misja trybu.
 */
export function zbudujPolecenie(
  tekst: string,
  pineski: Pineska[],
  obrazy: Warstwa[],
  intencja: Intencja = wykryjIntencje(tekst),
  opcje: OpcjePolecenia = {},
): string {
  const { obszary, szczegoly = '', instrukcja = '', role = {} } = opcje
  const zadanie = tekst.trim()
  if (!zadanie) return ''

  const tryb = TRYBY[intencja]
  const zostajeWspolne = ['aspect ratio and framing of Image 1']

  const wykrytyStyl = intencja === 'styl' ? wykryjStyl(zadanie) : undefined

  const sekcje = [
    `TASK (user's words): ${zadanie}`,
    sekcjaKadru(),
    sekcjaZdjec(obrazy, obszary, intencja),
    sekcjaUchwytow(pineski, obrazy, intencja, role),
    szczegoly.trim() ? `SCENE DETAILS (from visual analysis of the images):\n${szczegoly.trim()}` : '',
    instrukcja.trim() ? `OPERATION:\n${instrukcja.trim()}` : `OPERATION: ${tryb.misja(zadanie)}`,
    wykrytyStyl
      ? `SPECIFIC STYLE DIRECTIVES (${wykrytyStyl.nazwa}):\n${wykrytyStyl.reguly.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
      : '',
    `STEPS:\n${tryb.reguly.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
    tryb.zeSkala ? sekcjaSkali() : '',
    sekcjaSwiatla(obrazy, intencja),
    sekcjaObszarow(obszary, intencja, obrazy.length + 1),
    sekcjaCzystegoWyniku(),
    `UNCHANGED:\n${[...tryb.zostaje, ...zostajeWspolne].map(z => `- ${z}`).join('\n')}`,
  ]

  return sekcje.filter(Boolean).join('\n\n')
}
