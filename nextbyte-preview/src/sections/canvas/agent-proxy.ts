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
  intencja?: string
  /** co agent widzi na zdjęciach i pod pineskami */
  analiza: string
  /** sekcja doklejana do promptu — wiedza, której kod nie miał */
  doprecyzowanie: string
  /** jedno zdanie po polsku dla użytkownika, przed generacją */
  plan: string
  /** opis całych obiektów i światła, po angielsku — sekcja SCENE DETAILS w poleceniu */
  promptDlaModelu?: string
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

"znaczniki" = true, gdy w wyniku widać różowe celowniki, kółka, numery albo inne naniesione oznaczenia, których nie powinno tam być.
Oceniasz surowo i konkretnie. Jeśli obiekt stoi w złym miejscu albo ma złą wielkość, mówisz to wprost.`

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
const FALLBACK_GEMINI_KEY = 'AQ.Ab8RN6I-cZ-88Z5zzJSLzTDQk6kHGwaySLx8KavpNXsEp7CZuQ'

export function agentProxy(): Plugin {
  let kluczGemini = FALLBACK_GEMINI_KEY

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
          const urlStr = item.image_url?.url || ''
          const dopasowanie = urlStr.match(/^data:([^;]+);base64,(.+)$/)
          if (dopasowanie) {
            parts.push({
              inlineData: { mimeType: dopasowanie[1], data: dopasowanie[2] },
            })
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
        intencja: odczytany.intencja,
        analiza: odczytany.analiza,
        doprecyzowanie: odczytany.scena,
        plan: odczytany.plan,
        promptDlaModelu: szczegolyZPlanu(odczytany),
        instrukcja: odczytany.instrukcja,
        obszar: odczytany.obszar,
        obszarZrodla: odczytany.obszarZrodla,
        kosztTokenow: tokeny,
      }
      return { status: 200, cialo: plan }
    })

    odpowiedzNa('/api/canvas/sprawdz', async dane => {
      const z = JSON.parse(dane) as ZadanieSprawdzenia
      const tresci: unknown[] = [
        { type: 'text', text: `ZADANIE, KTÓRE MIAŁO ZOSTAĆ WYKONANE: ${z.zadanie}` },
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
  }

  return {
    name: 'nb-agent-proxy',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '')
      kluczGemini = env.GEMINI_API_KEY || FALLBACK_GEMINI_KEY
    },
    configureServer: obsluz,
    configurePreviewServer: obsluz,
  }
}
