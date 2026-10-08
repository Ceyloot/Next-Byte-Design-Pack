import { ZABLOKOWANY_MODEL_POSTACI } from './prompty/zablokowane/character-swap'
import { dopasujWymiary } from './formaty-modelu'
/**
 * Proxy do Runware jako wtyczka Vite.
 *
 * Powód istnienia: Canvas to czysty SPA, a klucz API nie może trafić do
 * przeglądarki — zmienna `VITE_*` ląduje w bundlu i widać ją w zakładce
 * Network. Klucz czytamy więc po stronie serwera deweloperskiego z
 * `.env.local` (bez przedrostka `VITE_`), a przeglądarka rozmawia wyłącznie
 * z `/api/canvas/generuj` na własnym origin.
 *
 * Przy wdrożeniu ten sam kontrakt (żądanie i odpowiedź niżej) przenosi się
 * do funkcji serwerowej — Canvas nie wymaga wtedy żadnej zmiany.
 */
import type { Plugin, ViteDevServer, PreviewServer } from 'vite'
import { loadEnv } from 'vite'

const SCIEZKA = '/api/canvas/generuj'
const SCIEZKA_OPISU = '/api/canvas/rozpoznaj'
const ENDPOINT = 'https://api.runware.ai/v1'
/** GPT Image 2 w Runware (nazwa z listy modeli Studia Zdjęć: „GPT-Image-2.5 Sunburst”). Nie przyjmuje `settings` ani `providerSettings` Google — rola modelu idzie w treści promptu. */
const MODEL_GPT_IMAGE = 'openai:gpt-image@2.5-sunburst'

/** Żądanie z przeglądarki */
export interface ZadanieGeneracji {
  /** gotowe polecenie — złożone przez `zbudujPolecenie` */
  polecenie: string
  /** obrazy wejściowe jako data URI; pierwszy jest tym edytowanym */
  obrazy: string[]
  szerokosc: number
  wysokosc: number
  /** rola modelu — `settings.systemPrompt` (jak w Studiu Zdjęć), nie treść promptu */
  system?: string
  /** negatywny prompt (`negativePrompt`) — Studio: zamiana postaci i twarzy */
  negatyw?: string
  /** `settings.temperature` — Studio: swap 0.45, twarz 0.42, poprawka 0.2 */
  temperatura?: number
  /**
   * Wybór modelu: 'postac' — operacja na człowieku (Gemini 3.1);
   * 'gemini31' — object swap w obrębie jednego zdjęcia (Gemini 3.1); brak — Nano Banana 2 Lite.
   */
  klasa?: 'postac' | 'gemini31'
  /** Wybór użytkownika dla zwykłych edycji: 'lite' (domyślny, szybszy), 'nb2' (Nano Banana 2 / Gemini 3.1) albo 'pro' (Nano Banana Pro). Jawny wybór użytkownika (Lite / NB 2 / Pro) ma pierwszeństwo także w trybach osób i Gemini 3.1; przy „Auto” tryby używają własnego modelu. */
  model?: 'lite' | 'nb2' | 'pro' | 'gptimage2'
  /** tryb Studio (wstawianie z referencji): dostawca dostaje `providerSettings.google.safetyTolerance`, jak w Studiu Zdjęć */
  studio?: boolean
}

/** Żądanie rozpoznania obiektu pod pineską */
export interface ZadanieRozpoznania {
  /** nazwa nadana przez użytkownika — w trybie `opis` wskazuje, KTÓRĄ rzecz opisać i obramować (może leżeć obok środka) */
  nazwa?: string
  /** wycinek wokół pineski albo całe zdjęcie — zależnie od trybu */
  wycinek: string
  /**
   * `obiekt` (domyślnie) nazywa jedną rzecz w centrum kadru.
   * `scena` robi inwentarz: co w ogóle jest na zdjęciu.
   * `opis` — wyczerpujący opis wizualny jednego obiektu w centrum wycinka (EN), do przeniesienia w kadrze.
   */
  tryb?: 'obiekt' | 'scena' | 'opis' | 'osoba' | 'poza' | 'tekst'
}

/** Odpowiedź rozpoznania — krótkie nazwy po polsku */
export interface WynikRozpoznania {
  nazwy: string[]
  kosztUSD: number
  /** surowa odpowiedź modelu — do diagnozy, gdy `nazwy` wyjdą puste */
  surowy?: string
}

/** Odpowiedź do przeglądarki */
export interface WynikGeneracji {
  obrazUrl: string
  /** realny koszt w USD prosto z API — nie szacunek */
  kosztUSD: number
  model: string
  seed?: number
}

export { dopasujWymiary }

function czytajCialo(req: { on: (z: string, f: (c?: unknown) => void) => void }): Promise<string> {
  return new Promise((resolve, reject) => {
    let dane = ''
    req.on('data', (c: unknown) => { dane += String(c) })
    req.on('end', () => resolve(dane))
    req.on('error', () => reject(new Error('Nie udało się odczytać żądania')))
  })
}

export function runwareProxy(): Plugin {
  let klucz = ''
  let kluczGemini = ''
  /** Jeden model dla wszystkiego: Nano Banana 2 Lite. Zmienne RUNWARE_MODEL* w .env.local są ignorowane. */
  const model = 'google:nano-banana@2-lite' // na testy Lite; Nano Banana 2 (Gemini 3.1): 'google:4@3'

  const obsluz = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use(SCIEZKA, async (req, res) => {
      const odpowiedz = (status: number, dane: unknown) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(dane))
      }

      if (req.method !== 'POST') return odpowiedz(405, { blad: 'Tylko POST' })
      if (!klucz) {
        return odpowiedz(503, {
          blad: 'Brak RUNWARE_API_KEY w .env.local — dopisz klucz i zrestartuj serwer deweloperski.',
        })
      }

      try {
        const zadanie = JSON.parse(await czytajCialo(req)) as ZadanieGeneracji
        if (!zadanie.polecenie?.trim()) return odpowiedz(400, { blad: 'Puste polecenie' })
        zadanie.obrazy ??= []

        const gpt = zadanie.model === 'gptimage2'
        // Operacje na ludziach — Gemini 3.1. Character swap: ZABLOKOWANY_MODEL_POSTACI (zablokowane/character-swap.ts), nie zmieniać.
        const modelZadania =
          gpt ? MODEL_GPT_IMAGE : zadanie.model === 'pro' ? 'google:4@2' : zadanie.model === 'nb2' ? 'google:4@3' : zadanie.model === 'lite' ? model : zadanie.klasa === 'postac' ? ZABLOKOWANY_MODEL_POSTACI : zadanie.klasa === 'gemini31' ? 'google:4@3' : model
        // Wymiary z listy obsługiwanej przez TEN model (listy różnią się: Pro nie przyjmuje skrajnych formatów, żaden nie przyjmuje 672×1584)
        const typWymiarow = gpt ? 'gpt' : modelZadania === 'google:4@2' ? 'pro' : modelZadania === 'google:4@3' ? 'nb2' : 'lite'
        const { width, height } = dopasujWymiary(zadanie.szerokosc, zadanie.wysokosc, typWymiarow)
        console.info(`[canvas] generacja modelem ${modelZadania}, ${width}×${height}`)

        // Rola i temperatura idą w `settings`, tak jak w edge functions Studia Zdjęć.
        const settings: Record<string, unknown> = {}
        if (zadanie.system?.trim()) settings.systemPrompt = zadanie.system.trim()
        if (typeof zadanie.temperatura === 'number') {
          settings.temperature = zadanie.temperatura
          settings.topP = 0.9
        }
        const zUstawieniach = (tak: boolean) => tak && !gpt && Object.keys(settings).length > 0

        const wyslij = (zUstawieniami: boolean) =>
          fetch(ENDPOINT, {
            method: 'POST',
            headers: { Authorization: `Bearer ${klucz}`, 'Content-Type': 'application/json' },
            body: JSON.stringify([
              {
                taskType: 'imageInference',
                taskUUID: crypto.randomUUID(),
                model: modelZadania,
                ...(zadanie.negatyw?.trim() && !gpt ? { negativePrompt: zadanie.negatyw.trim() } : {}),
                positivePrompt: (!zUstawieniami || gpt) && zadanie.system?.trim() ? `${zadanie.system.trim()}\n\n${zadanie.polecenie}` : zadanie.polecenie,
                // Edycja, nie generacja od zera: zdjęcie z płótna idzie jako
                // referencja. API przyjmuje data URI, więc nie ma uploadu.
                ...(zadanie.obrazy.length ? { inputs: { referenceImages: zadanie.obrazy } } : {}),
                width,
                height,
                numberResults: 1,
                outputType: 'URL',
                // PNG: bez pierwszej stratnej kompresji po stronie Runware (wcześniej JPG q95, a potem jeszcze raz JPEG w przeglądarce)
                outputFormat: 'PNG',
                deliveryMethod: 'sync',
                includeCost: true,
                ...(zUstawieniach(zUstawieniami) ? { settings } : {}),
                ...(zadanie.studio && zUstawieniami && !gpt ? { providerSettings: { google: { safetyTolerance: 'off' } } } : {}),
              },
            ]),
          }).then(r => r.json() as Promise<{
            data?: { imageURL?: string; cost?: number; seed?: number }[]
            errors?: { message?: string }[]
          }>)

        let tresc = await wyslij(true)
        // Nie każdy model przyjmuje `settings` — wtedy jedna powtórka bez nich,
        // a rola kompozytora i tak zostaje opisana w prompcie przez reguły.
        if (tresc.errors?.length && zUstawieniach(true)) {
          console.warn(`[canvas] ${modelZadania} odrzucił settings: ${tresc.errors[0]?.message ?? ''} — ponawiam bez nich`)
          tresc = await wyslij(false)
        }

        const blad = tresc.errors?.[0]?.message
        if (blad) return odpowiedz(502, { blad })

        const wynik = tresc.data?.[0]
        if (!wynik?.imageURL) return odpowiedz(502, { blad: 'Runware nie zwrócił obrazu' })

        // Zwracamy wynik jako data URI, nie surowy URL Runware. Bez tego klient
        // rysujący wynik na canvas (twarda blokada formatu do Image 1) trafia na
        // tainted canvas z powodu braku CORS i nie może przyciąć obrazu.
        let obrazUrl = wynik.imageURL
        try {
          const obraz = await fetch(wynik.imageURL)
          if (obraz.ok) {
            const mime = obraz.headers.get('content-type') || 'image/jpeg'
            const base64 = Buffer.from(await obraz.arrayBuffer()).toString('base64')
            obrazUrl = `data:${mime};base64,${base64}`
          }
        } catch {
          /* przy błędzie pobrania zostaje URL — lepszy niż nic */
        }

        const gotowe: WynikGeneracji = {
          obrazUrl,
          kosztUSD: wynik.cost ?? 0,
          model: modelZadania,
          seed: wynik.seed,
        }
        odpowiedz(200, gotowe)
      } catch (e) {
        odpowiedz(500, { blad: e instanceof Error ? e.message : 'Nieznany błąd proxy' })
      }
    })
  }

  const obsluzRozpoznanie = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use(SCIEZKA_OPISU, async (req, res) => {
      const odpowiedz = (status: number, dane: unknown) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(dane))
      }
      if (req.method !== 'POST') return odpowiedz(405, { blad: 'Tylko POST' })
      if (!kluczGemini) return odpowiedz(503, { blad: 'Brak GEMINI_API_KEY w .env.local' })

      try {
        const { wycinek, tryb = 'obiekt', nazwa } = JSON.parse(await czytajCialo(req)) as ZadanieRozpoznania
        if (!wycinek) return odpowiedz(400, { blad: 'Brak wycinka' })

        // Tryb „osoba”: karta tożsamości osoby (twarz cecha po cesze, włosy, budowa, ubiór) + ramka twarzy do zbliżenia.
        if (tryb === 'osoba') {
          const d = wycinek.match(/^data:([^;]+);base64,(.+)$/)
          const oResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${kluczGemini}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { inlineData: { mimeType: d ? d[1] : 'image/jpeg', data: d ? d[2] : wycinek } },
                      {
                        text: 'This crop shows a person (the one at the centre). Write a precise IDENTITY CARD of exactly this person — facts you SEE only — so that an artist who cannot see the photo could redraw the same individual. FACE: overall shape and width; forehead height and hairline; eyes (shape, size, tilt, colour, exact spacing); eyebrows (shape, thickness, spacing); nose (bridge, width, tip, nostrils); lips (shape, fullness, corners); jaw, chin, cheekbones; ears; facial hair (exact pattern and length); skin tone and undertone; every mark, mole, scar, line and asymmetry; apparent age. HAIR: colour, length, texture, parting, volume, how it falls. BUILD: height cues, shoulder width, neck, torso, limbs, overall proportions and body type. OUTFIT: every garment and accessory with cut, colour, fabric, fit, fastenings, folds and details. Also say which parts of the body are visible in this photo, so the missing ones can be built. 8–12 sentences, plain English, no pose or mood. Also give the tight bounding box of the FACE (forehead to chin, ear to ear) as "twarz": [ymin, xmin, ymax, xmax], normalised 0–1000 within this crop. Answer only with JSON: {"opis": "...", "twarz": [0,0,0,0]}',
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 1400,
                  responseMimeType: 'application/json',
                  thinkingConfig: { thinkingBudget: 0 },
                },
              }),
            },
          )
          if (oResp.ok) {
            const oJson = await oResp.json()
            const oTxt = oJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
            try {
              const o = JSON.parse(oTxt) as { opis?: string; twarz?: number[] }
              if (o.opis?.trim()) return odpowiedz(200, { opis: o.opis.trim(), twarz: Array.isArray(o.twarz) && o.twarz.length === 4 ? o.twarz.map(Number) : undefined, nazwy: [] })
            } catch {
              // bez karty — prompt użyje opisu reżysera
            }
          }
          return odpowiedz(200, { opis: '', nazwy: [] })
        }

        // Tryb „poza”: poza i miejsce osoby, którą zamieniamy — nowa osoba ma wejść dokładnie w jej sylwetkę (rozmiar, ramiona, ręce, trzymane rzeczy).
        if (tryb === 'poza') {
          const d = wycinek.match(/^data:([^;]+);base64,(.+)$/)
          const pResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${kluczGemini}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { inlineData: { mimeType: d ? d[1] : 'image/jpeg', data: d ? d[2] : wycinek } },
                      {
                        text: 'This crop is centred on ONE person (the one at the centre) who is going to be replaced by another person. Describe ONLY their POSE and SILHOUETTE, precisely enough that an artist could draw a different person into exactly the same outline: body orientation and posture (seated / standing / leaning, which way the torso faces), head position, tilt and gaze direction, expression intensity, the line of the shoulders and how wide the torso is relative to this crop, where each arm and hand is and exactly what they hold (name the held objects and where they are), how the body is cropped by the frame edges or hidden by objects in front, and the volume of the clothing as it shapes the outline (bulky hoodie, loose jacket, fitted shirt). 4–6 sentences, plain English, facts you SEE only. Do NOT describe the face features, hair colour or identity. Answer only with JSON: {"opis": "..."}',
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 700,
                  responseMimeType: 'application/json',
                  thinkingConfig: { thinkingBudget: 0 },
                },
              }),
            },
          )
          if (pResp.ok) {
            const pJson = await pResp.json()
            const pTxt = pJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
            try {
              const o = JSON.parse(pTxt) as { opis?: string }
              if (o.opis?.trim()) return odpowiedz(200, { opis: o.opis.trim(), nazwy: [] })
            } catch {
              // bez opisu pozy — prompt zostaje przy samej ramce osoby
            }
          }
          return odpowiedz(200, { opis: '', nazwy: [] })
        }

        // Tryb „tekst”: OCR całego obrazu — każdy widoczny napis osobno (tekst dokładnie jak w obrazie, ramka, krótki opis liternictwa).
        if (tryb === 'tekst') {
          const d = wycinek.match(/^data:([^;]+);base64,(.+)$/)
          const tResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${kluczGemini}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { inlineData: { mimeType: d ? d[1] : 'image/jpeg', data: d ? d[2] : wycinek } },
                      {
                        text: 'Read ALL visible text in this image: titles, captions, labels, numbers, logos with words, signs, watermarks, small print. Group lines that belong to one block (one headline, one label) into ONE entry; keep separate blocks separate. For each entry return: "tekst" — the text EXACTLY as written (same language, spelling, diacritics, capitalisation, line breaks as spaces); "box" — tight [ymin,xmin,ymax,xmax] on a 0-1000 scale; "styl" — a short English description of the lettering (typeface style, weight, colour, any outline / shadow / highlight box behind it). Order: top to bottom, then left to right. Do not invent text; skip illegible fragments. Reply ONLY JSON: {"teksty":[{"tekst":"…","box":[0,0,0,0],"styl":"…"}]}',
                      },
                    ],
                  },
                ],
                generationConfig: { temperature: 0, maxOutputTokens: 4096, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
              }),
            },
          )
          if (tResp.ok) {
            const tJson = await tResp.json()
            const tTxt = tJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
            try {
              const o = JSON.parse(tTxt) as { teksty?: { tekst?: string; box?: number[]; styl?: string }[] }
              const teksty = (o.teksty ?? [])
                .filter(t => typeof t.tekst === 'string' && t.tekst.trim())
                .slice(0, 30)
                .map(t => ({ tekst: String(t.tekst).trim(), box: Array.isArray(t.box) && t.box.length === 4 ? t.box.map(Number) : undefined, styl: typeof t.styl === 'string' ? t.styl.trim() : undefined }))
              return odpowiedz(200, { teksty, nazwy: [] })
            } catch {
              // nieczytelna odpowiedź — panel pokaże puste pole do ręcznego wpisu
            }
          }
          return odpowiedz(200, { teksty: [], nazwy: [] })
        }

        // Tryb „opis”: pełny Gemini 2.5 Flash (bez myślenia) — wyczerpujący opis jednego obiektu z wycinka.
        if (tryb === 'opis') {
          const d = wycinek.match(/^data:([^;]+);base64,(.+)$/)
          const oResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${kluczGemini}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { inlineData: { mimeType: d ? d[1] : 'image/jpeg', data: d ? d[2] : wycinek } },
                      {
                        text: (nazwa?.trim() ? `The user calls the thing under the pin "${nazwa.trim().slice(0, 80)}". Find THAT named thing nearest to the centre of the crop (it can sit slightly off-centre; do not pick a different object) and describe and box exactly it. ` : '') + 'This crop is centred on ONE object (the one under the pin). Describe exactly THAT object in exhaustive visual detail, so that another artist who cannot see the image could redraw it identically: what it is; its overall shape and silhouette; every distinctive part and feature with its position on the object, shape, colour and material; surface textures, edges and wear; its size relative to what is around it; what it stands on or against. 4–6 sentences, plain English, facts you SEE only. Describe only the object — nothing of the background. Also give the tight bounding box of that object (all of it, nothing else) as "box": [ymin, xmin, ymax, xmax], normalised 0–1000 within this crop. Answer only with JSON: {"opis": "...", "box": [0,0,0,0]}',
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 700,
                  responseMimeType: 'application/json',
                  thinkingConfig: { thinkingBudget: 0 },
                },
              }),
            },
          )
          if (oResp.ok) {
            const oJson = await oResp.json()
            const oTxt = oJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
            try {
              const o = JSON.parse(oTxt) as { opis?: string; box?: number[] }
              if (o.opis?.trim()) return odpowiedz(200, { opis: o.opis.trim(), box: Array.isArray(o.box) && o.box.length === 4 ? o.box.map(Number) : undefined, nazwy: [] })
            } catch {
              // bez opisu — prompt użyje opisu reżysera
            }
          }
          return odpowiedz(200, { opis: '', nazwy: [] })
        }

        // Gemini 2.5 Flash-Lite — tani, a pełny Flash zużywał limit 250 tokenów na myślenie i oddawał pustą odpowiedź
        if (kluczGemini) {
          const dopasowanie = wycinek.match(/^data:([^;]+);base64,(.+)$/)
          const mimeType = dopasowanie ? dopasowanie[1] : 'image/jpeg'
          const data = dopasowanie ? dopasowanie[2] : wycinek

          const promptGemini =
            tryb === 'scena'
              ? 'Wymień obiekty i elementy widoczne na tym zdjęciu. Odpowiedz wyłącznie obiektem JSON: {"nazwy": ["obiekt1", "obiekt2", "obiekt3", "obiekt4", "obiekt5"]}. Same zwięzłe rzeczowniki w mianowniku po polsku.'
              : 'Środek tego wycinka to dokładnie punkt wskazany pineską. Nazwij JEDNĄ rzecz, która znajduje się w tym punkcie — nie największą ani najbardziej rzucającą się w oczy, tylko tę pod samym środkiem. Jeśli w punkcie stoi obiekt (zwierzę, osoba, pojazd, budynek, mebel, przedmiot), podaj jego nazwę, a gdy w kadrze są podobne, dodaj cechę odróżniającą (np. "brązowy koń", "biała altana"). Jeśli punkt leży na podłożu albo tle (trawa, droga, woda, niebo, podłoga, ściana), nazwij tę powierzchnię i najbliższy widoczny punkt orientacyjny (np. "trawa przy płocie", "kostka przed garażem"). Podaj do 4 propozycji nazwy TEJ SAMEJ rzeczy: pierwsza najtrafniejsza, kolejne to alternatywy o innym stopniu szczegółowości (np. "sweter", "kremowy sweter", "bluza", "ubranie"). Nie wymieniaj innych rzeczy z kadru. Odpowiedz wyłącznie obiektem JSON: {"nazwy": ["nazwa 1-3 słowa po polsku", "..."]}.'

          const gResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${kluczGemini}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ inlineData: { mimeType, data } }, { text: promptGemini }] }],
                generationConfig: {
                  temperature: 0.1,
                  maxOutputTokens: 250,
                  responseMimeType: 'application/json',
                },
              }),
            },
          )

          if (gResp.ok) {
            const gJson = await gResp.json()
            const gTxt = gJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
            try {
              const spars = JSON.parse(gTxt) as { nazwy?: string[] }
              if (Array.isArray(spars.nazwy) && spars.nazwy.length > 0) {
                return odpowiedz(200, {
                  nazwy: spars.nazwy.map(n => String(n).trim().toLowerCase()),
                  kosztUSD: 0.0001,
                  surowy: gTxt,
                })
              }
            } catch {
              // fallback do tekstu
            }
          }
        }

        // Bez zapasowego modelu opisującego (LLaVA w Runware zwracał 500):
        // gdy Gemini nie da nazw, pineska zostaje bez propozycji i użytkownik
        // nazywa ją sam.
        return odpowiedz(200, { nazwy: [], kosztUSD: 0 })
      } catch (e) {
        odpowiedz(500, { blad: e instanceof Error ? e.message : 'Nieznany błąd proxy' })
      }
    })
  }

  return {
    name: 'nb-runware-proxy',
    configResolved(config) {
      // Bez przedrostka: `loadEnv` z pustym prefiksem widzi też zmienne,
      // których Vite celowo nie wpuszcza do kodu klienta.
      const env = loadEnv(config.mode, config.root, '')
      klucz = env.RUNWARE_API_KEY ?? ''
      kluczGemini = env.GEMINI_API_KEY || kluczGemini
    },
    configureServer: server => {
      obsluz(server)
      obsluzRozpoznanie(server)
    },
    configurePreviewServer: server => {
      obsluz(server)
      obsluzRozpoznanie(server)
    },
  }
}
