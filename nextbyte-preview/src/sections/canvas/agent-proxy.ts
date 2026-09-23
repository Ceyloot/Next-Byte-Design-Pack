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
  /** co agent widzi na zdjęciach i pod pineskami */
  analiza: string
  /** sekcja doklejana do promptu — wiedza, której kod nie miał */
  doprecyzowanie: string
  /** jedno zdanie po polsku dla użytkownika, przed generacją */
  plan: string
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

const SYSTEM_PLAN = `Jesteś asystentem reżyserskim w edytorze zdjęć. Oglądasz zdjęcia i pomagasz ułożyć polecenie dla modelu edycyjnego.

Dostajesz:
- zadanie napisane przez człowieka, często skrótowo i z literówkami,
- zdjęcia z rolami: PŁÓTNO (scena, którą edytujemy), MATERIAŁ (źródło obiektów), MAPA (to samo płótno z różowymi celownikami wskazującymi miejsca),
- listę uchwytów: nazw z ich położeniem.

Twoje zadanie: obejrzeć zdjęcia i dopisać to, czego nie da się wywnioskować z samego tekstu.

Odpowiadasz WYŁĄCZNIE obiektem JSON o polach:
{
  "analiza": "co konkretnie widzisz pod każdym celownikiem i czym są wymienione uchwyty; po polsku, zwięźle",
  "doprecyzowanie": "3-6 zdań, które trafią do polecenia dla modelu obrazu jako wiedza o scenie: czym dokładnie jest obiekt (materiał, kolor, kształt), jak duży jest w metrach, co leży w miejscu docelowym, jakie jest światło i z której strony padają cienie, co sąsiaduje z miejscem docelowym; pisz zdaniami oznajmującymi po polsku",
  "plan": "jedno zdanie po polsku dla człowieka, zaczynające się od czasownika w pierwszej osobie, np. Wstawię ... / Przeniosę ... / Usunę ..."
}

Zasady:
- Opisujesz to, co widzisz. Nie zgadujesz i nie dopisujesz rzeczy typowych dla takich scen.
- Wielkości podajesz w metrach, oparte na obiektach o znanych wymiarach w kadrze.
- Nie powtarzasz reguł z rusztowania — dokładasz tylko wiedzę o tej konkretnej scenie.
- Żadnego tekstu poza obiektem JSON.`

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
  const start = tekst.indexOf('{')
  const koniec = tekst.lastIndexOf('}')
  if (start < 0 || koniec <= start) return null
  try {
    return JSON.parse(tekst.slice(start, koniec + 1)) as Record<string, unknown>
  } catch {
    return null
  }
}

export function agentProxy(): Plugin {
  let klucz = ''
  let model = 'google:gemini@3.5-flash'

  async function zapytajAgenta(
    system: string,
    tresci: unknown[],
    limitTokenow: number,
  ): Promise<{ json: Record<string, unknown> | null; tokeny: number; blad?: string }> {
    const odp = await fetch(ENDPOINT_CZAT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${klucz}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: tresci },
        ],
        // Ten model liczy „reasoning tokens” z tej samej puli co odpowiedź —
        // przy 200 zjadł 189 na myślenie i uciął zdanie w połowie.
        max_completion_tokens: limitTokenow,
      }),
    })

    const tresc = (await odp.json()) as {
      choices?: { message?: { content?: string } }[]
      usage?: { total_tokens?: number }
      error?: { message?: string }
    }

    if (tresc.error) return { json: null, tokeny: 0, blad: tresc.error.message }
    const tekst = tresc.choices?.[0]?.message?.content ?? ''
    return { json: wyjmijJson(tekst), tokeny: tresc.usage?.total_tokens ?? 0 }
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
        if (!klucz) return wyslij(503, { blad: 'Brak RUNWARE_API_KEY w .env.local' })
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

      const tresci: unknown[] = [
        {
          type: 'text',
          text:
            `ZADANIE OD CZŁOWIEKA: ${z.zadanie}\n\n` +
            `UCHWYTY:\n${z.uchwyty || '(brak)'}\n\n` +
            `RUSZTOWANIE POLECENIA (masz je uzupełnić, nie powtarzać):\n${z.rusztowanie}`,
        },
      ]
      for (const o of z.obrazy) {
        tresci.push({ type: 'text', text: `Zdjęcie w roli ${o.rola.toUpperCase()} („${o.nazwa}”):` })
        tresci.push({ type: 'image_url', image_url: { url: o.dane } })
      }

      const { json, tokeny, blad } = await zapytajAgenta(SYSTEM_PLAN, tresci, 2000)
      if (blad) return { status: 502, cialo: { blad } }
      if (!json) return { status: 502, cialo: { blad: 'Agent nie zwrócił czytelnego planu' } }

      const plan: Plan = {
        analiza: String(json.analiza ?? ''),
        doprecyzowanie: String(json.doprecyzowanie ?? ''),
        plan: String(json.plan ?? ''),
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

      const { json, tokeny, blad } = await zapytajAgenta(SYSTEM_SPRAWDZENIA, tresci, 1200)
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
      klucz = env.RUNWARE_API_KEY ?? ''
      model = env.RUNWARE_MODEL_AGENTA || model
    },
    configureServer: obsluz,
    configurePreviewServer: obsluz,
  }
}
