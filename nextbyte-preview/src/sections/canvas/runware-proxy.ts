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
  /** `settings.temperature` — Studio: swap 0.45, twarz 0.42, poprawka 0.2 */
  temperatura?: number
  /**
   * Znacznik operacji na człowieku (dziś bez wpływu na model — zawsze Nano Banana 2 Lite).
   */
  klasa?: 'postac'
}

/** Żądanie rozpoznania obiektu pod pineską */
export interface ZadanieRozpoznania {
  /** wycinek wokół pineski albo całe zdjęcie — zależnie od trybu */
  wycinek: string
  /**
   * `obiekt` (domyślnie) nazywa jedną rzecz w centrum kadru.
   * `scena` robi inwentarz: co w ogóle jest na zdjęciu.
   */
  tryb?: 'obiekt' | 'scena'
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

/**
 * Nano Banana nie przyjmuje dowolnych wymiarów — tylko tę listę par.
 * Zwrócił ją sam model w komunikacie błędu przy pierwszej próbie.
 */
const DOZWOLONE: [number, number][] = [
  [1024, 1024],
  [1264, 848], [848, 1264],
  [1200, 896], [896, 1200],
  [1152, 928], [928, 1152],
  [1376, 768], [768, 1376],
  [1584, 672], [672, 1584],
  [2048, 512], [512, 2048],
  [3072, 384], [384, 3072],
]

/**
 * Najbliższy dozwolony format do proporcji warstwy.
 *
 * Dobieramy po proporcji, nie po rozmiarze: pionowe zdjęcie 1453×2182
 * wysłane jako kwadrat wraca przycięte, a to najbardziej bolesny błąd,
 * bo wygląda na kaprys modelu, a nie na pomyłkę w żądaniu.
 */
export function dopasujWymiary(szerokosc: number, wysokosc: number): { width: number; height: number } {
  const cel = szerokosc / wysokosc
  const [width, height] = DOZWOLONE.reduce((naj, para) =>
    Math.abs(para[0] / para[1] - cel) < Math.abs(naj[0] / naj[1] - cel) ? para : naj,
  )
  return { width, height }
}

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
  const model = 'google:nano-banana@2-lite'

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
        if (!zadanie.obrazy?.length) return odpowiedz(400, { blad: 'Brak obrazu wejściowego' })

        const { width, height } = dopasujWymiary(zadanie.szerokosc, zadanie.wysokosc)
        const modelZadania = model
        console.info(`[canvas] generacja modelem ${modelZadania}`)

        // Rola i temperatura idą w `settings`, tak jak w edge functions Studia Zdjęć.
        const settings: Record<string, unknown> = {}
        if (zadanie.system?.trim()) settings.systemPrompt = zadanie.system.trim()
        if (typeof zadanie.temperatura === 'number') {
          settings.temperature = zadanie.temperatura
          settings.topP = 0.9
        }
        const zUstawieniach = (tak: boolean) => tak && Object.keys(settings).length > 0

        const wyslij = (zUstawieniami: boolean) =>
          fetch(ENDPOINT, {
            method: 'POST',
            headers: { Authorization: `Bearer ${klucz}`, 'Content-Type': 'application/json' },
            body: JSON.stringify([
              {
                taskType: 'imageInference',
                taskUUID: crypto.randomUUID(),
                model: modelZadania,
                positivePrompt: zadanie.polecenie,
                // Edycja, nie generacja od zera: zdjęcie z płótna idzie jako
                // referencja. API przyjmuje data URI, więc nie ma uploadu.
                inputs: { referenceImages: zadanie.obrazy },
                width,
                height,
                numberResults: 1,
                outputType: 'URL',
                outputFormat: 'JPG',
                outputQuality: 95,
                deliveryMethod: 'sync',
                includeCost: true,
                ...(zUstawieniach(zUstawieniami) ? { settings } : {}),
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
        const { wycinek, tryb = 'obiekt' } = JSON.parse(await czytajCialo(req)) as ZadanieRozpoznania
        if (!wycinek) return odpowiedz(400, { blad: 'Brak wycinka' })

        // Gemini 2.5 Flash-Lite — tani, a pełny Flash zużywał limit 250 tokenów na myślenie i oddawał pustą odpowiedź
        if (kluczGemini) {
          const dopasowanie = wycinek.match(/^data:([^;]+);base64,(.+)$/)
          const mimeType = dopasowanie ? dopasowanie[1] : 'image/jpeg'
          const data = dopasowanie ? dopasowanie[2] : wycinek

          const promptGemini =
            tryb === 'scena'
              ? 'Wymień obiekty i elementy widoczne na tym zdjęciu. Odpowiedz wyłącznie obiektem JSON: {"nazwy": ["obiekt1", "obiekt2", "obiekt3", "obiekt4", "obiekt5"]}. Same zwięzłe rzeczowniki w mianowniku po polsku.'
              : 'Zidentyfikuj obiekt w centrum tego wycinka (miejsce pod pineską). Odpowiedz wyłącznie obiektem JSON: {"nazwy": ["główna nazwa", "synonim lub typ", "szersze określenie"]}. Same zwięzłe rzeczowniki 1-2 słów po polsku (np. "fotel", "stolik kawowy", "reflektor").'

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
