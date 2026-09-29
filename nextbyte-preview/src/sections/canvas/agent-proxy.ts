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
  odczytajPlanRezysera,
  szczegolyZPlanu,
  trescZadaniaRezysera,
  type Prostokat,
} from './rezyser'

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
}

export interface Plan {
  /** które zdjęcie jest docelowe (1-based) — promowane na Image 1 przy wysyłce */
  zdjecieDocelowe?: number
  intencja?: string
  /** zamiana / przeniesienie dotyczy całej osoby */
  osoba?: boolean
  /** co agent widzi na zdjęciach i pod pineskami */
  analiza: string
  /** sekcja doklejana do promptu — wiedza, której kod nie miał */
  doprecyzowanie: string
  /** jedno zdanie po polsku dla użytkownika, przed generacją */
  plan: string
  /** opis całych obiektów i światła, po angielsku — sekcja SCENE DETAILS w poleceniu */
  promptDlaModelu?: string
  /** miejsce każdej pineski opisane słowami (numer pineski → opis) — sekcja PIN MAP */
  miejsca?: Record<number, string>
  /** precyzyjna instrukcja edycji od reżysera, po angielsku — sekcja OPERATION */
  instrukcja?: string
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
}

export interface Sprawdzenie {
  /** czy zadanie zostało wykonane */
  wykonane: boolean
  /** czy w wyniku widać znaczniki z mapy */
  znaczniki: boolean
  /** ocena po polsku, jedno–dwa zdania */
  ocena: string
  kosztTokenow: number
}

const SYSTEM_SPRAWDZENIA = `Jesteś kontrolerem jakości w edytorze zdjęć. Porównujesz zdjęcie przed edycją z wynikiem i oceniasz, czy zadanie zostało wykonane.

Odpowiadasz WYŁĄCZNIE obiektem JSON:
{
  "wykonane": true/false,
  "znaczniki": true/false,
  "ocena": "jedno-dwa zdania po polsku: co się zmieniło i czy zgadza się z zadaniem; jeśli coś poszło nie tak, napisz co konkretnie"
}

ZASADA NADRZĘDNA — SĄDŹ DOSŁOWNIE WG ZADANIA:
- Oceniasz WYŁĄCZNIE to, o co prosi zadanie użytkownika. Nie wymyślaj własnych oczekiwań.
- Jeśli zadanie mówi „wstaw/dodaj kaczkę", to poprawnym wynikiem jest KACZKA dodana do sceny — NIE oczekuj gęsi ani innego obiektu, tylko dlatego że scena jest ich pełna. Obiekt nazwany w zadaniu (i wskazany pineską) jest tym właściwym; jego obecność = sukces.
- „obok X" znaczy blisko X; nie wymagaj idealnego stykania się, ale odstęp na drugi koniec kadru to błąd pozycji.
- POZYCJA: współrzędna pineski dotyczy tylko zdjęcia, na którym pineska leży (procenty od lewego górnego rogu TEGO zdjęcia). Pineska na zdjęciu referencyjnym, którego tu nie widzisz, NIE mówi, gdzie ma być obiekt w wyniku. Odchyłkę do ok. 10% szerokości lub wysokości kadru od pineski docelowej uznaj za poprawną pozycję; błędem jest dopiero wyraźne przesunięcie w inne miejsce.
- Rozróżniaj rodzaj operacji: „wstaw/dodaj" NIE usuwa niczego — jeśli reszta sceny została, to dobrze; „zamień" usuwa stary obiekt; „przenieś" zostawia jeden obiekt w nowym miejscu.

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
function wyjmijJson(tekst: string): Record<string, unknown> | null {
  if (!tekst) return null
  let czysty = tekst.trim()
  if (czysty.startsWith('```')) {
    czysty = czysty.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim()
  }
  const start = czysty.indexOf('{')
  const koniec = czysty.lastIndexOf('}')
  if (start < 0 || koniec <= start) return null
  try {
    return JSON.parse(czysty.slice(start, koniec + 1)) as Record<string, unknown>
  } catch {
    return null
  }
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
  ): Promise<{ json: Record<string, unknown> | null; tokeny: number; blad?: string }> {
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
      const odp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig,
        }),
      })

      if (!odp.ok) {
        const errText = await odp.text()
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
      return { json: wyjmijJson(tekst), tokeny }
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

    odpowiedzNa('/api/canvas/planuj', async dane => {
      const z = JSON.parse(dane) as ZadaniePlanu
      if (!z.zadanie?.trim()) return { status: 400, cialo: { blad: 'Puste zadanie' } }

      const tresci: unknown[] = []
      for (const [i, o] of z.obrazy.entries()) {
        tresci.push({ type: 'text', text: `[Image ${i + 1}: "${o.nazwa}", pins drawn]` })
        tresci.push({ type: 'image_url', image_url: { url: o.dane } })
      }
      tresci.push({ type: 'text', text: trescZadaniaRezysera(z.zadanie, z.uchwyty) })

      const { json, tokeny, blad } = await zapytajAgenta(SYSTEM_REZYSERA, tresci, MODEL_REZYSERA, KONFIG_REZYSERA)
      if (blad) return { status: 502, cialo: { blad } }
      const odczytany = odczytajPlanRezysera(json)
      if (!odczytany) return { status: 502, cialo: { blad: 'Agent nie zwrócił czytelnego planu' } }

      const plan: Plan = {
        zdjecieDocelowe: odczytany.zdjecieDocelowe,
        intencja: odczytany.intencja,
        osoba: odczytany.osoba,
        analiza: odczytany.analiza,
        doprecyzowanie: odczytany.scena,
        plan: odczytany.plan,
        promptDlaModelu: szczegolyZPlanu(odczytany),
        miejsca: miejscaZPlanu(odczytany),
        instrukcja: odczytany.instrukcja,
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
        z.intencja ? `RODZAJ OPERACJI: ${z.intencja} (wstaw = dodaj wskazany obiekt, nic nie usuwaj; zamien = podmień; przenies = przesuń jeden obiekt)` : '',
        z.uchwyty ? `WSKAZANE PINESKAMI (obiekty, o które chodzi):\n${z.uchwyty}` : '',
        z.plan ? `CO MIAŁO POWSTAĆ (zamiar): ${z.plan}` : '',
      ].filter(Boolean).join('\n')
      const tresci: unknown[] = [
        { type: 'text', text: kontekst },
        { type: 'text', text: 'Zdjęcie PRZED edycją:' },
        { type: 'image_url', image_url: { url: z.przed } },
        { type: 'text', text: 'WYNIK edycji:' },
        { type: 'image_url', image_url: { url: z.wynik } },
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
        maxOutputTokens: 400,
        responseMimeType: 'application/json',
      })
      if (!json) return { status: 502, cialo: { blad: blad ?? 'Klasyfikacja nieczytelna' } }
      const lista = Array.isArray(json.pineski) ? (json.pineski as { nr?: number; rodzaj?: string; co?: string }[]) : []
      if (lista.length !== obrazy.length) return { status: 502, cialo: { blad: 'Klasyfikacja niepełna' } }
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
