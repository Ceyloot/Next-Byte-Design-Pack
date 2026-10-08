/**
 * Agent reżyserski — ogniwo między człowiekiem a modelem obrazu.
 *
 * Dotąd prompt składał się deterministycznie w TypeScripcie: znaliśmy nazwy
 * pinesek i ich współrzędne, ale nikt po naszej stronie nie **widział**
 * zdjęcia. Model obrazu dostawał instrukcję pisaną w ciemno.
 *
 * Tak działa Lovart i to jest jego przewaga: przed generacją uruchamia
 * analizę obrazów, dopiero potem układa polecenie. Tutaj robi to Gemini 3.5
 * Flash przez zgodny z OpenAI endpoint Runware — ten sam klucz, ten sam
 * dostawca, więc nie dokładamy drugiego konta.
 *
 * Rusztowanie promptu zostaje nasze (kadr, skala, tryby, znaczniki — każda
 * z tych sekcji powstała z konkretnej przegranej generacji). Agent dokłada
 * to jedno, czego kod nie ma: oczy.
 */
import type { Plugin, ViteDevServer, PreviewServer } from 'vite'
import { loadEnv } from 'vite'

import {
  KONFIG_REZYSERA,
  MODEL_REZYSERA,
  SYSTEM_REZYSERA,
  miejscaZPlanu,
  odznakiZPlanu,
  szczegolyZPlanu,
  odczytajPlanRezysera,
  trescZadaniaRezysera,
  type PomiarSkali,
  type Prostokat,
} from './rezyser'
import { instrukcjaAgenta, trescZapytaniaAgenta } from './nowy/agent-instrukcja'
import { RODZAJE_ZADAN } from './nowy/receptury'
import { odczytajPlanAgenta, type ZapytanieDoAgenta } from './nowy/agent'

const ENDPOINT_CZAT = 'https://api.runware.ai/v1/chat/completions'

/** Rola obrazu w zestawie wysyłanym agentowi — ta sama, co w prompcie. */
export type RolaObrazu = 'plotno' | 'material' | 'mapa'

export interface ObrazDlaAgenta {
  rola: RolaObrazu
  nazwa: string
  /** zmniejszona kopia jako data URI — agentowi wystarczy 768 px */
  dane: string
}

export interface ZadaniePlanu {
  /** zdanie użytkownika, bez obudowy */
  zadanie: string
  /** rusztowanie promptu złożone przez `zbudujPolecenie` */
  rusztowanie: string
  obrazy: ObrazDlaAgenta[]
  /** nazwy i położenia pinesek, tak jak trafiają do promptu */
  uchwyty: string
  /** zbliżenia wokół pinesek (celownik w środku) — tylko do rozpoznania, co leży pod punktem */
  zblizenia?: { numer: number; nazwa: string; dane: string }[]
}

export interface Plan {
  /** które zdjęcie jest docelowe (1-based) — promowane na Image 1 przy wysyłce */
  zdjecieDocelowe?: number
  intencja?: string
  /** zamiana / przeniesienie dotyczy całej osoby */
  osoba?: boolean
  /** co agent widzi na zdjęciach i pod pineskami */
  analiza: string
  /** jedno zdanie po polsku dla użytkownika, przed generacją */
  plan: string
  /** rzeczywisty rozmiar obiektu względem kotwicy w kadrze, po angielsku — sekcja SCALE */
  skala?: string
  /** pomiar skali od reżysera (kotwica + wymiary obiektu w metrach) */
  pomiar?: PomiarSkali
  /** widok obiektu w scenie docelowej (reżyser) */
  widok?: string
  /** światło i kamera zdjęcia docelowego z konkretnymi wartościami (reżyser) */
  swiatlo?: string
  /** logiczne ułożenie obiektu w miejscu docelowym (EN) */
  ulozenie?: string
  umiejscowienie?: string
  dyrektywa?: string
  /** nazwa części obiektu (EN), gdy zmieniana jest tylko część */
  czesc?: string
  /** zmieniana właściwość rzeczy pod pinem (EN) */
  cecha?: string
  /** ile sztuk części: all / one */
  czescZakres?: 'all' | 'one'
  /** tlo: co zostaje nietknięte (EN) */
  pierwszyPlan?: string
  /** miejsce każdej pineski opisane słowami (numer pineski → opis) — sekcja PIN MAP */
  miejsca?: Record<number, string>
  /** szczegółowy opis każdej pineski (rzecz albo miejsce) */
  szczegoly?: Record<number, string>
  /** krótki opis każdej pineski odróżniający ją od podobnych obiektów (po polsku) */
  odznaki?: Record<number, string>
  /** obszar zmiany na płótnie (0–1) — rysowany na kopii płótna dla modelu */
  obszar?: Prostokat
  /** przy przeniesieniu w kadrze: gdzie obiekt stoi teraz */
  obszarZrodla?: Prostokat
  kosztTokenow: number
}

export interface ZadanieSprawdzenia {
  zadanie: string
  /** wynik generacji jako data URI albo URL */
  wynik: string
  /** zdjęcie wejściowe do porównania */
  przed: string
  /** rodzaj operacji (wstaw/zamien/przenies/…) — żeby QC nie mylił kryteriów */
  intencja?: string
  /** co reżyser zamierzał zrobić, po polsku — jedno zdanie */
  plan?: string
  /** nazwy pinesek: co użytkownik wskazał (np. „obiekt do wstawienia = kaczka") */
  uchwyty?: string
  /** zamiana / wstawienie OSOBY: zdjęcie osoby-źródła (referencja tożsamości) — kontrola porównuje twarz i miejsce */
  referencjaOsoby?: string
}

export interface Sprawdzenie {
  /** czy zadanie zostało wykonane */
  wykonane: boolean
  /** czy w wyniku widać znaczniki z mapy */
  znaczniki: boolean
  /** czy zmieniony element wygląda na wklejony (szew, obwódka, inne światło/ziarno, brak cienia) */
  wklejone: boolean
  /** ocena po polsku, jedno–dwa zdania */
  ocena: string
  kosztTokenow: number
}

const SYSTEM_SPRAWDZENIA = `Jesteś kontrolerem jakości w edytorze zdjęć. Porównujesz zdjęcie przed edycją z wynikiem i oceniasz, czy zadanie zostało wykonane.

Odpowiadasz WYŁĄCZNIE obiektem JSON:
{
  "wykonane": true/false,
  "znaczniki": true/false,
  "wklejone": true/false,
  "ocena": "jedno-dwa zdania po polsku: co się zmieniło i czy zgadza się z zadaniem; jeśli coś poszło nie tak, napisz co konkretnie"
}

ZASADA NADRZĘDNA — SĄDŹ DOSŁOWNIE WG ZADANIA:
- Oceniasz WYŁĄCZNIE to, o co prosi zadanie użytkownika. Nie wymyślaj własnych oczekiwań.
- Jeśli zadanie mówi „wstaw/dodaj kaczkę", to poprawnym wynikiem jest KACZKA dodana do sceny — NIE oczekuj gęsi ani innego obiektu, tylko dlatego że scena jest ich pełna. Obiekt nazwany w zadaniu (i wskazany pineską) jest tym właściwym; jego obecność = sukces.
- „obok X" znaczy blisko X; nie wymagaj idealnego stykania się, ale odstęp na drugi koniec kadru to błąd pozycji.
- POZYCJA: współrzędna pineski dotyczy tylko zdjęcia, na którym pineska leży (procenty od lewego górnego rogu TEGO zdjęcia). Pineska na zdjęciu referencyjnym, którego tu nie widzisz, NIE mówi, gdzie ma być obiekt w wyniku. Odchyłkę do ok. 10% szerokości lub wysokości kadru od pineski docelowej uznaj za poprawną pozycję; błędem jest dopiero wyraźne przesunięcie w inne miejsce.
- Rozróżniaj rodzaj operacji: „wstaw/dodaj" NIE usuwa niczego — jeśli reszta sceny została, to dobrze; „zamień" usuwa stary obiekt; „przenieś" zostawia jeden obiekt w nowym miejscu.

"wklejone" = true, gdy zmieniony albo wstawiony element wygląda na doklejony do zdjęcia: widoczny szew lub jasna/ciemna obwódka, inne światło (kierunek, barwa) niż reszta kadru, brak cienia kontaktowego, ostrzejszy lub gładszy niż otoczenie, inne ziarno. Oceniasz tylko wygląd, nie pozycję ani wielkość.
"znaczniki" = true, gdy w wyniku widać różowe celowniki, kółka, numery albo inne naniesione oznaczenia, których nie powinno tam być.
Oceniasz surowo i konkretnie, ALE tylko względem tego, czego zadanie faktycznie wymaga. Jeśli obiekt stoi w złym miejscu albo ma złą wielkość, mówisz to wprost; jeśli wszystko się zgadza z zadaniem, ustaw "wykonane": true.`

function czytajCialo(req: { on: (z: string, f: (c?: unknown) => void) => void }): Promise<string> {
  return new Promise((resolve, reject) => {
    let dane = ''
    req.on('data', (c: unknown) => { dane += String(c) })
    req.on('end', () => resolve(dane))
    req.on('error', () => reject(new Error('Nie udało się odczytać żądania')))
  })
}

/**
 * Wycina obiekt JSON z odpowiedzi modelu.
 *
 * Modele lubią opakować JSON w blok ```json albo dopisać zdanie przed nim,
 * mimo instrukcji. Bierzemy więc pierwszy nawias klamrowy i ostatni,
 * zamiast ufać, że odpowiedź jest czystym JSON-em.
 */
export function wyjmijJson(tekst: string): Record<string, unknown> | null {
  if (!tekst) return null
  let czysty = tekst.trim()
  if (czysty.startsWith('```')) {
    czysty = czysty.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim()
  }
  const start = czysty.indexOf('{')
  if (start < 0) return null
  const koniec = czysty.lastIndexOf('}')
  if (koniec > start) {
    try {
      return JSON.parse(czysty.slice(start, koniec + 1)) as Record<string, unknown>
    } catch {
      /* odpowiedź ucięta albo z błędem — próbujemy naprawy niżej */
    }
  }
  return naprawUcietyJson(czysty.slice(start))
}

/** Domyka ucięty JSON (otwarty napis, tablice i obiekty). */
function domknijJson(s: string): string {
  const stos: string[] = []
  let wNapisie = false
  let ucieczka = false
  for (const c of s) {
    if (wNapisie) {
      if (ucieczka) ucieczka = false
      else if (c === '\\') ucieczka = true
      else if (c === '"') wNapisie = false
      continue
    }
    if (c === '"') wNapisie = true
    else if (c === '{') stos.push('}')
    else if (c === '[') stos.push(']')
    else if (c === '}' || c === ']') stos.pop()
  }
  let wynik = s
  if (wNapisie) wynik += '"'
  wynik = wynik.replace(/,\s*$/, '').replace(/:\s*$/, ': null')
  return wynik + stos.reverse().join('')
}

/**
 * Reżyser przy długiej odpowiedzi (kilka pinesek, długie opisy) potrafi urwać JSON w połowie. Domykamy go; gdy to nie wystarcza (urwane
 * w środku klucza albo liczby), cofamy się do poprzedniego przecinka i próbujemy znów — główne pola (intencja, obiekty) są na początku.
 */
function naprawUcietyJson(s: string): Record<string, unknown> | null {
  let t = s
  for (let i = 0; i < 80; i++) {
    try {
      const wynik = JSON.parse(domknijJson(t)) as Record<string, unknown>
      if (wynik && typeof wynik === 'object') return wynik
    } catch {
      /* cofamy się dalej */
    }
    const k = t.lastIndexOf(',')
    if (k < 0) break
    t = t.slice(0, k)
  }
  return null
}

const ENDPOINT_GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL_SPRAWDZENIA = 'gemini-2.5-flash-lite'
const NL = String.fromCharCode(10)

/**
 * Analiza pineski — wzór od użytkownika: rekonstrukcja semantyczna sceny
 * zamiast przeliczania pikseli, kalibracja na najstabilniejszym punkcie
 * odniesienia, wynik z metodą i marginesem błędu.
 */
const SYSTEM_ANALIZY_PINESKI = [
  'The image has ONE magenta crosshair (a pin). Analyse what it points at in every dimension.',
  '1. The pin means the WHOLE object containing the point (a pin on a part of an object = the whole object; a pin on a small item = that specific item). If the point is on open ground/floor/water, the object is that location.',
  '2. Identify it precisely: type, make and model if recognisable, colour, exact condition (e.g. "<colour> <type, make and model if recognisable>, <condition>").',
  '3. Estimate its REAL-WORLD size semantically, calibrating against WHATEVER known-size object sits next to it in ITS OWN photo. References for big things: door ~200 cm, adult ~175 cm, car ~450 cm long, chair ~45 cm. References for small things: takeaway drink cup ~15 cm, hand ~18 cm, phone ~15 cm, food packet ~12 cm, mug ~10 cm. A soft toy or figurine is usually 15–40 cm — if it is about as tall as a visible small everyday item, take the size of that item, NOT life-size. Use factory dimensions if a real product is recognisable. Report the honest small size for small objects.',
  '4. PHYSICAL INTERACTION & CONTACT: Does ANY person, animal, or object touch, lean against, hold, sit on, or interact with this object? (e.g. "a person is leaning against the open door with one leg on the sill", "a person sits at the desk with hands on a device placed in front of this item"). This is CRITICAL to prevent cutting or erasing interacting people.',
  '5. 3D POSE & ORIENTATION: How is the object turned relative to the camera? (e.g. "front 3/4 view facing left, door open at 40 degrees, wheels turned slightly right").',
  '6. SURFACE CONDITION & PATINA: What is the exact surface state? (e.g. "covered in thick barn dust, dirt, cobwebs, matte finish — NOT clean" vs "glossy clean metallic finish"). Note: dirty objects must stay dirty unless explicitly requested to be cleaned.',
  '7. DEPTH PLANE & OPTICS: Where does this sit in depth? ("foreground", "midground", "background"). Is it in sharp focus or in blurred background bokeh / shallow depth of field?',
  '8. LIGHT VECTORS & SHADOWS: Where does light come from? (e.g. "low warm golden hour sunset rays from the right at 15°, long shadows cast left" or "dark studio with vertical blue LED strip rim lights").',
  'Answer ONLY with JSON:',
  '{"nazwy":["2-3 short Polish nouns, main first"],"obiekt":"Polish full description","obiekt_en":"English full description","otoczenie":"English surroundings",',
  '"wysokosc_cm":102,"dlugosc_cm":418,"niepewnosc_cm":5,"kalibracja":"Polish reference info",',
  '"interakcja":"Polish: who/what touches or interacts with it, or null","pozycja_3d":"English 3D angle and pose",',
  '"stan_powierzchni":"English: dust, dirt, grime, clean, glossy, matte","glebia_optyka":"English: foreground/midground/background, sharp vs bokeh blur",',
  '"swiatlo_wektory":"English: light direction, color, rim lights, shadows","dwuznacznosc":null}',
].join(NL)
/**
 * Analiza tożsamości osoby spod pineski — prompt analityka biometrycznego
 * ze Studia Zdjęć (poz. 47), zawężony do osoby wskazanej celownikiem.
 * Wynik trafia do zamka tożsamości (poz. 49–50) w prompcie obrazu.
 */
const SYSTEM_TOZSAMOSCI = [
  'You are a biometric character analyst for an image-generation pipeline. The image shows ONE magenta crosshair on a person. Extract a precise, structured identity profile of THAT person so a downstream image model can re-render this exact person in any scene with full fidelity.',
  'Output STRICT JSON only. No markdown, no commentary. Schema:',
  '{"summary":"1-2 sentence portrait in English","face":{"shape":"","jawline":"","chin":"","cheekbones":"","forehead":"","hairline":""},"eyes":{"color":"","shape":"","spacing":"","tilt":"","eyelids":"","brows":""},"nose":{"bridge":"","tip":"","nostrils":"","asymmetry":""},"mouth":{"lips":"","width":"","philtrum":"","smile":""},"skin":{"tone":"","undertone":"","texture":"","marks":""},"hair":{"color":"","texture":"","length":"","style":"","parting":"","facial_hair":""},"body":{"build":"","proportions":"","posture":"","approx_age":""},"distinctive_marks":[""],"typical_clothing":"","negative_dont_change":"Short list of things the model must NEVER change about this person."}',
  'Rules:',
  '- Use English values.',
  '- Be specific and observational, like a forensic sketch artist briefing.',
  '- If a feature is not visible, write "not clearly visible".',
  '- Never invent features that contradict the photo.',
  '- "negative_dont_change" must list at least face shape, eye color, hair color, skin tone.',
].join(NL)

/** Pola, których wartość nic nie mówi — nie wchodzą do zamka. */
const NIEWIDOCZNE = /^(not clearly visible|n\/a|none|unknown|-)?$/i

/** Zamek tożsamości z profilu (rdzeń poz. 49 + uzupełnienie poz. 50 Studia). */
export function zamekTozsamosci(profil: Record<string, unknown>): string {
  const grupa = (v: unknown) =>
    v && typeof v === 'object'
      ? Object.entries(v as Record<string, unknown>)
          .map(([k, x]) => [k, String(x ?? '').trim()] as const)
          .filter(([, x]) => !NIEWIDOCZNE.test(x))
          .map(([k, x]) => `${k}: ${x}`)
          .join(', ')
      : ''
  const tekst = (v: unknown) => {
    const t = String(v ?? '').trim()
    return NIEWIDOCZNE.test(t) ? '' : t
  }
  const znaki = Array.isArray(profil.distinctive_marks)
    ? (profil.distinctive_marks as unknown[]).map(tekst).filter(Boolean).join('; ')
    : ''
  const rdzen = [
    znaki && `Distinctive marks (MUST preserve): ${znaki}`,
    tekst(profil.negative_dont_change) && `DO NOT CHANGE: ${tekst(profil.negative_dont_change)}`,
    grupa(profil.face) && `Face: ${grupa(profil.face)}`,
    grupa(profil.eyes) && `Eyes: ${grupa(profil.eyes)}`,
    grupa(profil.hair) && `Hair: ${grupa(profil.hair)}`,
  ].filter(Boolean)
  const reszta = [
    tekst(profil.summary) && `Summary: ${tekst(profil.summary)}`,
    grupa(profil.skin) && `Skin: ${grupa(profil.skin)}`,
    grupa(profil.nose) && `Nose: ${grupa(profil.nose)}`,
    grupa(profil.mouth) && `Mouth: ${grupa(profil.mouth)}`,
    grupa(profil.body) && `Body: ${grupa(profil.body)}`,
    tekst(profil.typical_clothing) && `Typical clothing: ${tekst(profil.typical_clothing)}`,
  ].filter(Boolean)
  if (!rdzen.length && !reszta.length) return ''
  return [
    rdzen.length ? `IDENTITY LOCK — preserve EXACTLY the same person as in the identity reference. Key identity markers: ${rdzen.join(' | ')}.` : '',
    reszta.length ? `Further identity markers of the same person: ${reszta.join(' | ')}.` : '',
  ]
    .filter(Boolean)
    .join(NL)
}

const SYSTEM_KLASYFIKACJI =
  'Each image shows ONE magenta crosshair. For each image, decide what lies exactly under the centre of the crosshair:' + NL +
  '- "object": a distinct thing (vehicle, house, person, animal, furniture, plant, item) or any part of one (a wheel, a roof).' + NL +
  '- "location": open surface or space (ground, road, path, grass, floor, water, sky) or empty space next to things.' + NL +
  'If the centre is on the ground right next to an object, the answer is "location".' + NL +
  'Answer ONLY with JSON: {"pineski":[{"nr":1,"rodzaj":"object","co":"short English name"}]}'

export function agentProxy(): Plugin {
  // Klucz tylko z .env.local — wpisany w kodzie wyciekł i został unieważniony
  let kluczGemini = ''

  async function zapytajAgenta(
    system: string,
    tresci: any[],
    model: string,
    generationConfig: Record<string, unknown>,
  ): Promise<{ json: Record<string, unknown> | null; tokeny: number; blad?: string; powod?: string }> {
    try {
      const parts: any[] = []
      parts.push({ text: `INSTRUKCJA SYSTEMOWA:\n${system}\n\nTREŚĆ ZADANIA:` })

      for (const item of tresci) {
        if (typeof item === 'string') {
          parts.push({ text: item })
        } else if (item?.type === 'text') {
          parts.push({ text: item.text })
        } else if (item?.type === 'image_url') {
          const urlStr: string = item.image_url?.url || ''
          const dopasowanie = urlStr.match(/^data:([^;]+);base64,(.+)$/)
          if (dopasowanie) {
            parts.push({ inlineData: { mimeType: dopasowanie[1], data: dopasowanie[2] } })
          } else if (/^https?:\/\//.test(urlStr)) {
            // Wynik z Runware przychodzi jako URL — Gemini przyjmuje tylko
            // dane w treści, więc pobieramy obraz po stronie serwera.
            const obraz = await fetch(urlStr)
            if (obraz.ok) {
              const mimeType = obraz.headers.get('content-type') || 'image/jpeg'
              const data = Buffer.from(await obraz.arrayBuffer()).toString('base64')
              parts.push({ inlineData: { mimeType, data } })
            }
          }
        }
      }

      const url = `${ENDPOINT_GEMINI}/${model}:generateContent?key=${kluczGemini}`
      const cialo = JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig })

      // Chwilowe błędy Gemini (przeciążenie, limit, 5xx) ponawiamy: pojedyncza
      // porażka kończyła się 502 dla całej analizy pineski.
      let odp: Response | null = null
      let ostatniBlad = ''
      for (let podejscie = 0; podejscie < 3; podejscie++) {
        try {
          odp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: cialo })
          if (odp.ok || ![429, 500, 502, 503, 504].includes(odp.status)) break
          ostatniBlad = `Gemini API error (${odp.status}): ${(await odp.text()).slice(0, 300)}`
        } catch (e) {
          odp = null
          ostatniBlad = e instanceof Error ? e.message : 'Błąd sieci'
        }
        console.warn(`[canvas] ${model}: podejście ${podejscie + 1}/3 nieudane — ${ostatniBlad}`)
        if (podejscie < 2) await new Promise(r => setTimeout(r, 700 * (podejscie + 1)))
      }
      if (!odp) return { json: null, tokeny: 0, blad: ostatniBlad || 'Brak odpowiedzi Gemini' }

      if (!odp.ok) {
        const errText = await odp.text()
        console.warn(`[canvas] ${model}: ${odp.status} ${errText.slice(0, 300)}`)
        return { json: null, tokeny: 0, blad: `Gemini API error (${odp.status}): ${errText}` }
      }

      const tresc = (await odp.json()) as any
      // Model z myśleniem potrafi oddać odpowiedź w kilku częściach — skleja je.
      const tekst = ((tresc?.candidates?.[0]?.content?.parts ?? []) as { text?: string; thought?: boolean }[])
        .filter(p => !p.thought)
        .map(p => p.text ?? '')
        .join('')
        .trim()
      const tokeny = tresc?.usageMetadata?.totalTokenCount || 0
      // Dlaczego odpowiedź bywa nieczytelna: zablokowana przez filtr (zdjęcia z twarzami), ucięta limitem tokenów albo pusta.
      const koniecOdpowiedzi = tresc?.candidates?.[0]?.finishReason as string | undefined
      const blokada = tresc?.promptFeedback?.blockReason as string | undefined
      const powod = [
        blokada ? `Gemini zablokował zapytanie: ${blokada}` : '',
        koniecOdpowiedzi && koniecOdpowiedzi !== 'STOP' ? `koniec odpowiedzi: ${koniecOdpowiedzi}` : '',
        !tekst ? 'pusta odpowiedź' : '',
      ].filter(Boolean).join('; ')
      if (powod) console.warn(`[canvas] ${model}: ${powod}`)
      return { json: wyjmijJson(tekst), tokeny, powod: powod || undefined }
    } catch (e) {
      return { json: null, tokeny: 0, blad: e instanceof Error ? e.message : 'Błąd zapytania do Gemini' }
    }
  }

  const obsluz = (server: ViteDevServer | PreviewServer) => {
    const odpowiedzNa = (
      sciezka: string,
      obsluga: (dane: string) => Promise<{ status: number; cialo: unknown }>,
    ) => {
      server.middlewares.use(sciezka, async (req, res) => {
        const wyslij = (status: number, dane: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(dane))
        }
        if (req.method !== 'POST') return wyslij(405, { blad: 'Tylko POST' })
        if (!kluczGemini) return wyslij(503, { blad: 'Brak GEMINI_API_KEY w .env.local' })
        try {
          const { status, cialo } = await obsluga(await czytajCialo(req))
          wyslij(status, cialo)
        } catch (e) {
          wyslij(500, { blad: e instanceof Error ? e.message : 'Nieznany błąd agenta' })
        }
      })
    }

    // NOWY SYSTEM: jedno wywołanie agenta z obrazami — rozumie polecenie, dopytuje albo pisze krótki prompt, podaje ramki i skalę.
    odpowiedzNa('/api/canvas/agent', async dane => {
      const z = JSON.parse(dane) as ZapytanieDoAgenta
      if (!z.tekst?.trim() || !z.obrazy?.length) return { status: 400, cialo: { blad: 'Brak polecenia albo zdjęć' } }
      const tresci: unknown[] = []
      for (const o of z.obrazy) {
        tresci.push({ type: 'text', text: `[Image ${o.nr}: "${o.nazwa}", pins drawn]` })
        tresci.push({ type: 'image_url', image_url: { url: o.dane } })
      }
      for (const zb of z.zblizenia ?? []) {
        tresci.push({ type: 'text', text: `[CLOSE-UP of Pin ${zb.numer} (name hint "${zb.nazwa}") — a tight crop centred exactly on the spot the pin points at. THE PINNED THING IS WHAT SITS AT THE CENTRE of this crop, not a bigger or more striking neighbour: identify and describe exactly that thing. This crop is not an extra photo.]` })
        tresci.push({ type: 'image_url', image_url: { url: zb.dane } })
      }
      tresci.push({ type: 'text', text: trescZapytaniaAgenta(z) })
      // KROK 1 — logiczne przypisanie ról (bez pisania promptu): które zdjęcie jest docelowe, a które referencją.
      // Krok 2 (poniżej) dostaje to jako rozstrzygnięte i dba już tylko o szczegóły promptu.
      const INSTRUKCJA_ROL = `You assign ROLES in an image-editing request. You SEE the images (numbered pins drawn on them) and read the user's request (Polish, colloquial). You do NOT write any prompt.
First describe to yourself what you SEE under every pin (who/what, clothes, what they hold, setting, framing). Then link each phrase of the request to a pin or photo. Rules:
- Any detail in the request that describes a subject (what they wear, hold, do, where they stand) is the strongest evidence: find the photo where exactly that detail is visible; that is the subject the phrase names — even if pin names are identical or the order of pins/photos suggests otherwise.
- NAME MATCH: pins carry names (given by the user or the recogniser). When a noun in the request is the same word as a pin name in any inflected form (e.g. "osobę/osoby/osobą" ↔ "osoba", "samochód/samochodu" ↔ "samochód", "człowieka" ↔ "człowiek"), the phrase points to THAT pin, unless what you SEE clearly contradicts it. In "zamień X na Y" a bare pronoun (go / ją / to / niego) carries no name, so the OTHER pin than the one named by Y is X: example pattern — "zamień go na tę osobę" with pins named "osoba" and "człowiek": "tę osobę" names the pin called "osoba" → it supplies the new subject; "go" is the other pin ("człowiek") → it is replaced, so ITS photo is the BASE.
- SAME PHOTO = MOVE: when the pin on the thing (the subject: "ten domek / ten samochód / to") and the pin of the destination ("tutaj / tam / w to miejsce") are BOTH on the same photo, the thing already exists in that photo, so the task is przeniesienie (it MOVES: it disappears from its old spot and appears at the new one) — even if the verb is "wstaw", "dodaj", "postaw", "umieść" or "daj". It is a copy ONLY when the user says so ("skopiuj", "drugi", "jeszcze jeden", "kopię", "obok kolejny"). In that case there is no reference image: "referencje" is empty.
- "zamień X na Y": X is replaced → the photo with X is the BASE (the edited, returned photo). Y supplies the new person/object → REFERENCE. "wstaw/przenieś X tu": X comes from the reference, the place is in the BASE. A pronoun without a descriptor ("niego", "ją", "to") refers to the other pin/photo.
- The BASE is always the photo that contains the subject being replaced/changed/removed, or the place something is put. Double-check: does your base photo really show that subject?
- If nothing links the words to pins, the subject under pin 1 is replaced and the other pin supplies the new thing.
The task kinds: zamiana_osoby (a whole person replaced by a person from a reference), zamiana_twarzy (only the face replaced), zamiana_obiektu (an object replaced by an object from a reference), wstawienie (something from a reference is added), przeniesienie (a thing moved inside the base photo), usuniecie, zmiana_tla, perspektywa, edycja.
Reply ONLY JSON: {"rozumienie":"Polish, a few sentences: what is under each pin and how the words map to them","zadanie":"<one of the task kinds above>","baza":<image number>,"referencje":[<image numbers>],"pewnosc":"wysoka|niska"}`
      let rolePrzydzielone: { baza: number; referencje: number[] } | null = null
      let zadanieKrok1: string | undefined
      {
        const krok1 = await zapytajAgenta(INSTRUKCJA_ROL, tresci, MODEL_REZYSERA, { temperature: 0, maxOutputTokens: 2048, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 2048 } })
        const j = krok1.json as Record<string, unknown> | null | undefined
        const nr = (n: unknown) => (Number.isInteger(n) && (n as number) >= 1 && (n as number) <= z.obrazy.length ? (n as number) : null)
        const baza1 = nr(j?.baza)
        if (j && baza1) {
          rolePrzydzielone = { baza: baza1, referencje: (Array.isArray(j.referencje) ? j.referencje : []).map(nr).filter((x): x is number => x !== null && x !== baza1) }
          zadanieKrok1 = RODZAJE_ZADAN.includes(String(j.zadanie) as never) ? String(j.zadanie) : undefined
          console.info('[canvas] agent krok 1 (role), zadanie', zadanieKrok1, ':', j.rozumienie, '→ baza', baza1, 'refs', rolePrzydzielone.referencje.join(','), j.pewnosc ?? '')
          tresci.push({ type: 'text', text: `ROLES ALREADY DECIDED (final — do not change, do not ask about them): the BASE is Image ${baza1}; the reference image(s): ${rolePrzydzielone.referencje.map(n => `Image ${n}`).join(', ') || 'none'}. Reasoning behind it: ${String(j.rozumienie ?? '')}. The task is ${zadanieKrok1 ?? 'to be decided by you'}. Put "baza": ${baza1} in your reply and use these roles in "referencje".` })
        }
      }
      // Jedna ponowna próba (koszt!): druga z wyższą temperaturą i bez „myślenia”, gdy pierwsza odpowiedź jest nieczytelna
      let plan: ReturnType<typeof odczytajPlanAgenta> = null
      let powod = ''
      for (let proba = 0; proba < 2 && !plan; proba++) {
        const konfig = proba === 0
          ? { temperature: 0, maxOutputTokens: 6144, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 2048 } }
          : { temperature: 0.4, maxOutputTokens: 8192, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } }
        const wynik = await zapytajAgenta(instrukcjaAgenta(zadanieKrok1), tresci, MODEL_REZYSERA, konfig)
        if (wynik.blad) return { status: 502, cialo: { blad: wynik.blad } }
        powod = wynik.powod ?? powod
        const rozumienie = (wynik.json as Record<string, unknown> | null | undefined)?.rozumienie
        if (typeof rozumienie === 'string') console.info('[canvas] agent rozumienie:', rozumienie)
        const karta = (wynik.json as Record<string, unknown> | null | undefined)?.karta
        if (karta) console.info('[canvas] agent karta:', JSON.stringify(karta))
        plan = odczytajPlanAgenta(wynik.json, z.obrazy.length)
        if (!plan) console.warn(`[canvas] agent: nieczytelny plan, próba ${proba + 1}/2`)
      }
      if (plan && rolePrzydzielone && !plan.pytanie && plan.baza !== rolePrzydzielone.baza) {
        console.warn('[canvas] agent: krok 2 zmienił bazę, wymuszam rozstrzygnięcie z kroku 1', plan.baza, '→', rolePrzydzielone.baza)
        plan = { ...plan, baza: rolePrzydzielone.baza, referencje: plan.referencje.filter(r => r.nr !== rolePrzydzielone!.baza) }
      }
      if (!plan) return { status: 502, cialo: { blad: `Agent nie zwrócił użytecznego planu${powod ? ` — ${powod}` : ''}` } }
      console.info('[canvas] agent:', plan.pytanie ? `PYTANIE: ${plan.pytanie.tresc}` : `${plan.zadanie}, baza ${plan.baza}, refs ${plan.referencje.map(r => r.nr).join(',') || '—'}, skala ${plan.skala ? 'tak' : 'nie'}`)
      return { status: 200, cialo: plan }
    })

    odpowiedzNa('/api/canvas/planuj', async dane => {
      const z = JSON.parse(dane) as ZadaniePlanu
      if (!z.zadanie?.trim()) return { status: 400, cialo: { blad: 'Puste zadanie' } }

      const tresci: unknown[] = []
      for (const [i, o] of z.obrazy.entries()) {
        tresci.push({ type: 'text', text: `[Image ${i + 1}: "${o.nazwa}", pins drawn]` })
        tresci.push({ type: 'image_url', image_url: { url: o.dane } })
      }
      for (const zb of z.zblizenia ?? []) {
        tresci.push({ type: 'text', text: `[CLOSE-UP of Pin ${zb.numer} "${zb.nazwa}" — a tight crop around the thing the pin points at (the pin's location is at the CENTRE; when the recogniser found the object, the crop is boxed on it). THE PINNED THING IS THE OBJECT THAT SITS AT THE CENTRE / FILLS THIS CROP — never a bigger or more striking neighbour visible in the full image (e.g. a large glass-roofed building beside a tiny gazebo). Name and describe exactly that object in "opis", "miejsce" and "dyrektywa"; it is not an extra image]` })
        tresci.push({ type: 'image_url', image_url: { url: zb.dane } })
      }
      tresci.push({ type: 'text', text: trescZadaniaRezysera(z.zadanie, z.uchwyty) })

      // Reżyser czasem oddaje ucięty albo niepoprawny JSON (długa odpowiedź z wieloma polami) — ponawiamy do 3 razy, zanim zgłosimy błąd.
      let json: Record<string, unknown> | null = null
      let tokeny = 0
      let odczytany: ReturnType<typeof odczytajPlanRezysera> = null
      let ostatniPowod = ''
      for (let proba = 0; proba < 3 && !odczytany; proba++) {
        // Temperatura 0 daje przy każdej próbie tę samą zepsutą odpowiedź — kolejne próby różnią ustawienia: wyższa temperatura,
        // więcej miejsca na odpowiedź i bez budżetu na myślenie (które zjada limit, gdy odpowiedź jest długa).
        const konfig = proba === 0 ? KONFIG_REZYSERA : { ...KONFIG_REZYSERA, temperature: 0.25 * proba, maxOutputTokens: 12288, thinkingConfig: { thinkingBudget: 0 } }
        const wynikAgenta = await zapytajAgenta(SYSTEM_REZYSERA, tresci, MODEL_REZYSERA, konfig)
        ostatniPowod = wynikAgenta.powod ?? ostatniPowod
        if (wynikAgenta.blad) return { status: 502, cialo: { blad: wynikAgenta.blad } }
        json = wynikAgenta.json
        tokeny += wynikAgenta.tokeny
        odczytany = odczytajPlanRezysera(json)
        if (!odczytany) console.warn(`[canvas] reżyser: nieczytelny plan, próba ${proba + 1}/3`)
      }
      if (!odczytany) return { status: 502, cialo: { blad: `Agent nie zwrócił czytelnego planu${ostatniPowod ? ` — ${ostatniPowod}` : ' — odpowiedź nie była poprawnym JSON-em (3 próby)'}` } }

      const plan: Plan = {
        zdjecieDocelowe: odczytany.zdjecieDocelowe,
        intencja: odczytany.intencja,
        osoba: odczytany.osoba,
        analiza: odczytany.analiza,
        plan: odczytany.plan,
        skala: odczytany.skala,
        pomiar: odczytany.pomiar,
        widok: odczytany.widok || undefined,
        swiatlo: odczytany.swiatlo || undefined,
        ulozenie: odczytany.ulozenie || undefined,
        umiejscowienie: odczytany.umiejscowienie || undefined,
        dyrektywa: odczytany.dyrektywa || undefined,
        czesc: odczytany.czesc || undefined,
        cecha: odczytany.cecha || undefined,
        czescZakres: odczytany.czescZakres || undefined,
        pierwszyPlan: odczytany.pierwszyPlan || undefined,
        miejsca: miejscaZPlanu(odczytany),
        szczegoly: szczegolyZPlanu(odczytany),
        odznaki: odznakiZPlanu(odczytany),
        obszar: odczytany.obszar,
        obszarZrodla: odczytany.obszarZrodla,
        kosztTokenow: tokeny,
      }
      return { status: 200, cialo: plan }
    })

    odpowiedzNa('/api/canvas/sprawdz', async dane => {
      const z = JSON.parse(dane) as ZadanieSprawdzenia
      const kontekst = [
        `ZADANIE, KTÓRE MIAŁO ZOSTAĆ WYKONANE (sądź dosłownie wg tego): ${z.zadanie}`,
        z.intencja ? `RODZAJ OPERACJI: ${z.intencja} (wstaw = dodaj wskazany obiekt, nic nie usuwaj; zamien = podmień; przenies = przesuń jeden obiekt${z.intencja === 'perspektywa' ? '; perspektywa = to samo miejsce sfotografowane z INNEGO punktu — zmiana kadru i kąta kamery jest OCZEKIWANA i poprawna, oceniaj, czy to samo miejsce i te same obiekty widać z nowej strony zgodnie z zadaniem' : ''})` : '',
        z.uchwyty ? `WSKAZANE PINESKAMI (obiekty, o które chodzi):\n${z.uchwyty}` : '',
        z.plan ? `CO MIAŁO POWSTAĆ (zamiar): ${z.plan}` : '',
      ].filter(Boolean).join('\n')
      const kontekstOsoby = z.referencjaOsoby
        ? `
TO ZAMIANA OSOBY. Poza zdjęciem PRZED i WYNIKIEM dostajesz REFERENCJĘ osoby (trzecie zdjęcie, na końcu). Oceń DODATKOWO: (1) czy osoba w WYNIKU to TA SAMA osoba co na referencji — kształt twarzy, oczy, nos, usta, włosy, zarost, znaki; (2) czy zajmuje to samo miejsce, rozmiar i pozę co zamieniana osoba na zdjęciu PRZED (głowa, linia ramion, szerokość tułowia, ręce i to, co trzymają) — nie wolno jej zmniejszyć ani przesunąć; (3) czy tło i reszta kadru zostały ostre i bez rozmycia. Ustaw "wykonane": false, gdy tożsamość się nie zgadza albo osoba jest wyraźnie mniejsza / przesunięta; w "ocena" napisz konkretnie, co się nie zgadza (np. „twarz inna: …”, „osoba mniejsza o ok. 20%”, „ręka niżej niż u oryginału”).`
        : ''
      const tresci: unknown[] = [
        { type: 'text', text: kontekst + kontekstOsoby },
        { type: 'text', text: 'Zdjęcie PRZED edycją:' },
        { type: 'image_url', image_url: { url: z.przed } },
        { type: 'text', text: 'WYNIK edycji:' },
        { type: 'image_url', image_url: { url: z.wynik } },
        ...(z.referencjaOsoby ? [{ type: 'text', text: 'REFERENCJA osoby (tożsamość do porównania):' }, { type: 'image_url', image_url: { url: z.referencjaOsoby } }] : []),
      ]

      const { json, tokeny, blad } = await zapytajAgenta(SYSTEM_SPRAWDZENIA, tresci, MODEL_SPRAWDZENIA, {
        temperature: 0.1,
        maxOutputTokens: 1200,
        responseMimeType: 'application/json',
      })
      if (blad) return { status: 502, cialo: { blad } }
      if (!json) return { status: 502, cialo: { blad: 'Kontrola nie zwróciła czytelnej oceny' } }

      const wynik: Sprawdzenie = {
        wykonane: json.wykonane === true,
        znaczniki: json.znaczniki === true,
        wklejone: json.wklejone === true,
        ocena: String(json.ocena ?? ''),
        kosztTokenow: tokeny,
      }
      return { status: 200, cialo: wynik }
    })

    // Analiza pineski zaraz po wbiciu: co to jest, co wokół, jak duże naprawdę.
    odpowiedzNa('/api/canvas/analizuj-pineske', async dane => {
      const z = JSON.parse(dane) as { obraz?: string }
      if (!z.obraz) return { status: 400, cialo: { blad: 'Brak obrazu' } }
      const { json, blad } = await zapytajAgenta(
        SYSTEM_ANALIZY_PINESKI,
        [{ type: 'image_url', image_url: { url: z.obraz } }],
        MODEL_SPRAWDZENIA,
        { temperature: 0.1, maxOutputTokens: 900, responseMimeType: 'application/json' },
      )
      if (!json) return { status: 502, cialo: { blad: blad ?? 'Analiza nieczytelna' } }
      const liczba = (v: unknown) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.round(Number(v)) : undefined)
      return {
        status: 200,
        cialo: {
          // Model potrafi oddać nazwy sklejone przecinkami w jednym napisie
          nazwy: (Array.isArray(json.nazwy) ? (json.nazwy as unknown[]) : [json.nazwy ?? ''])
            .flatMap(n => String(n).split(','))
            .map(n => n.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 5),
          analiza: {
            obiekt: String(json.obiekt ?? ''),
            obiektEn: String(json.obiekt_en ?? ''),
            otoczenie: String(json.otoczenie ?? ''),
            wysokoscCm: liczba(json.wysokosc_cm),
            dlugoscCm: liczba(json.dlugosc_cm),
            niepewnoscCm: liczba(json.niepewnosc_cm),
            kalibracja: String(json.kalibracja ?? ''),
            dwuznacznosc: json.dwuznacznosc ? String(json.dwuznacznosc) : undefined,
            interakcja: json.interakcja ? String(json.interakcja) : undefined,
            pozycja3d: json.pozycja_3d ? String(json.pozycja_3d) : undefined,
            stanPowierzchni: json.stan_powierzchni ? String(json.stan_powierzchni) : undefined,
            glebiaOptyka: json.glebia_optyka ? String(json.glebia_optyka) : undefined,
            swiatloWektory: json.swiatlo_wektory ? String(json.swiatlo_wektory) : undefined,
          },
        },
      }
    })

    // Pomiar wstawionego obiektu na wyniku: prostokąt 0–1000, bez cienia.
    // Model obrazu ignoruje „13% kadru” w prompcie, więc sprawdzamy to liczbą, nie okiem.
    odpowiedzNa('/api/canvas/zmierz', async dane => {
      const z = JSON.parse(dane) as { obraz?: string; obiekt?: string }
      if (!z.obraz || !z.obiekt) return { status: 400, cialo: { blad: 'Brak obrazu albo nazwy obiektu' } }
      const system =
        'Find the object named below in the image. Answer ONLY with JSON {"box":[ymin,xmin,ymax,xmax]} normalised 0-1000, ' +
        'tight around the WHOLE object (every part of it), excluding its shadow and reflection. If it is not in the image, answer {"box":null}.'
      const { json, blad } = await zapytajAgenta(
        system,
        [{ type: 'image_url', image_url: { url: z.obraz } }, { type: 'text', text: `OBJECT: ${z.obiekt}` }],
        MODEL_REZYSERA,
        { temperature: 0, maxOutputTokens: 1000, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
      )
      if (!json) return { status: 502, cialo: { blad: blad ?? 'Pomiar nieczytelny' } }
      const box = Array.isArray(json.box) ? (json.box as unknown[]).map(Number) : null
      if (!box || box.length !== 4 || box.some(n => !Number.isFinite(n))) return { status: 200, cialo: { box: null } }
      const [y0, x0, y1, x1] = box.map(n => Math.min(1000, Math.max(0, n)) / 1000)
      return { status: 200, cialo: { box: { x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1) } } }
    })

    // Profil tożsamości osoby spod pineski → gotowy zamek tożsamości.
    odpowiedzNa('/api/canvas/tozsamosc', async dane => {
      const z = JSON.parse(dane) as { obraz?: string }
      if (!z.obraz) return { status: 400, cialo: { blad: 'Brak obrazu' } }
      const { json, blad } = await zapytajAgenta(
        SYSTEM_TOZSAMOSCI,
        [{ type: 'image_url', image_url: { url: z.obraz } }],
        MODEL_REZYSERA,
        { temperature: 0.15, maxOutputTokens: 4096, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
      )
      if (!json) return { status: 502, cialo: { blad: blad ?? 'Analiza tożsamości nieczytelna' } }
      const zamek = zamekTozsamosci(json)
      return zamek ? { status: 200, cialo: { zamek } } : { status: 502, cialo: { blad: 'Pusty profil tożsamości' } }
    })

    odpowiedzNa('/api/canvas/klasyfikuj', async dane => {
      const z = JSON.parse(dane) as { obrazy?: string[] }
      const obrazy = (z.obrazy ?? []).filter(Boolean)
      if (obrazy.length === 0) return { status: 400, cialo: { blad: 'Brak obrazów' } }
      const tresci: unknown[] = []
      obrazy.forEach((o, i) => {
        tresci.push({ type: 'text', text: `[Image ${i + 1}]` })
        tresci.push({ type: 'image_url', image_url: { url: o } })
      })
      const { json, blad } = await zapytajAgenta(SYSTEM_KLASYFIKACJI, tresci, MODEL_SPRAWDZENIA, {
        temperature: 0,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json',
      })
      if (!json) {
        console.warn(`[canvas] klasyfikacja pinesek: ${blad ?? 'odpowiedź nieczytelna'}`)
        return { status: 502, cialo: { blad: blad ?? 'Klasyfikacja nieczytelna' } }
      }
      const lista = Array.isArray(json.pineski) ? (json.pineski as { nr?: number; rodzaj?: string; co?: string }[]) : []
      if (lista.length !== obrazy.length) {
        console.warn(`[canvas] klasyfikacja pinesek niepełna: ${lista.length} z ${obrazy.length}`)
        return { status: 502, cialo: { blad: 'Klasyfikacja niepełna' } }
      }
      return {
        status: 200,
        cialo: {
          pineski: obrazy.map((_, i) => {
            const w = lista.find(x => Number(x.nr) === i + 1) ?? lista[i]
            return { rodzaj: w?.rodzaj === 'location' ? 'location' : 'object', co: String(w?.co ?? '') }
          }),
        },
      }
    })
  }

  return {
    name: 'nb-agent-proxy',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '')
      kluczGemini = env.GEMINI_API_KEY || ''
    },
    configureServer: obsluz,
    configurePreviewServer: obsluz,
  }
}
