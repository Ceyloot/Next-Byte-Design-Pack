/**
 * Bezpośredni klient Gemini Flash Vision (Google Generative AI).
 *
 * Używa superszybkiego modelu multimodalnego gemini-2.5-flash, który w ułamku sekundy
 * (200-300 ms) analizuje wycinek wokół pineski i zwraca precyzyjne nazwy obiektów po polsku.
 */
import {
  KONFIG_REZYSERA,
  MODEL_REZYSERA,
  SYSTEM_REZYSERA,
  odczytajPlanRezysera,
  trescZadaniaRezysera,
  type PlanRezysera,
} from './rezyser'


export const DOMYSLNY_GEMINI_KLUCZ = 'AQ.Ab8RN6I-cZ-88Z5zzJSLzTDQk6kHGwaySLx8KavpNXsEp7CZuQ'
export const GEMINI_MODEL = 'gemini-2.5-flash-lite'
const ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export interface WynikRozpoznaniaGemini {
  nazwy: string[]
  surowy?: string
}

function usunPrefiksBase64(daneUrl: string): { mimeType: string; data: string } {
  const dopasowanie = daneUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (dopasowanie) {
    return { mimeType: dopasowanie[1], data: dopasowanie[2] }
  }
  return { mimeType: 'image/jpeg', data: daneUrl }
}

/**
 * Bezpieczne wyciąganie JSON-a z odpowiedzi modeli LLM.
 * Usuwa opakowania markdown (```json ... ```) oraz radzi sobie z dodatkowym tekstem.
 */
export function wyczyscIWyjmijJson<T = any>(tekst: string): T | null {
  if (!tekst) return null
  let czysty = tekst.trim()
  if (czysty.startsWith('```')) {
    czysty = czysty.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim()
  }
  try {
    return JSON.parse(czysty) as T
  } catch {}

  const start = czysty.indexOf('{')
  const koniec = czysty.lastIndexOf('}')
  if (start >= 0 && koniec > start) {
    try {
      return JSON.parse(czysty.slice(start, koniec + 1)) as T
    } catch {}
  }

  const startArr = czysty.indexOf('[')
  const koniecArr = czysty.lastIndexOf(']')
  if (startArr >= 0 && koniecArr > startArr) {
    try {
      return JSON.parse(czysty.slice(startArr, koniecArr + 1)) as T
    } catch {}
  }

  return null
}

function filtrujNazwy(nazwy: unknown[]): string[] {
  return nazwy
    .map(n => String(n).trim().toLowerCase())
    .map(n => n.replace(/[`"'\\\/]/g, '').trim())
    .filter(
      n =>
        n.length >= 2 &&
        n.length <= 40 &&
        n !== 'json' &&
        !n.startsWith('```') &&
        !n.includes('{') &&
        !n.includes('}'),
    )
}

/**
 * Bezpośrednie wywołanie Gemini 2.5 Flash-Lite Vision dla wycinka lub całego obrazu.
 */
export async function geminiRozpoznajWycinek(
  wycinekBase64: string,
  tryb: 'obiekt' | 'scena' = 'obiekt',
  kluczApi = DOMYSLNY_GEMINI_KLUCZ,
): Promise<string[]> {
  try {
    const { mimeType, data } = usunPrefiksBase64(wycinekBase64)
    const url = `${ENDPOINT_BASE}/${GEMINI_MODEL}:generateContent?key=${kluczApi}`

    const promptTekst =
      tryb === 'scena'
        ? `Przeanalizuj to zdjęcie i zidentyfikuj główne obiekty i elementy widoczne w kadrze.
Odpowiedz WYŁĄCZNIE obiektem JSON w formacie:
{"nazwy": ["obiekt 1", "obiekt 2", "obiekt 3", "obiekt 4", "obiekt 5", "obiekt 6"]}
Każda pozycja to jeden lub dwa rzeczowniki po polsku w mianowniku (np. "fotel", "stolik kawowy", "skały", "taras"). Żadnego innego tekstu.`
        : `Zidentyfikuj obiekt, element lub powierzchnię znajdującą się w centrum tego wycinka (dokładnie pod wskazaniem pineski).
Odpowiedz WYŁĄCZNIE obiektem JSON w formacie:
{"nazwy": ["główna nazwa", "synonim lub typ", "szersze określenie"]}
Każda nazwa to 1-3 słowa po polsku (np. "domek w lesie", "chata", "drewniana ściana"). Żadnego innego tekstu.`

    const payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data,
              },
            },
            {
              text: promptTekst,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 250,
        responseMimeType: 'application/json',
      },
    }

    const odp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!odp.ok) {
      const errText = await odp.text()
      console.warn(`Gemini Vision HTTP ${odp.status}:`, errText)
      return []
    }

    const odpJson = await odp.json()
    const rawText = odpJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    const sparsowany = wyczyscIWyjmijJson<{ nazwy?: string[] }>(rawText)
    if (sparsowany && Array.isArray(sparsowany.nazwy)) {
      const oczyszczone = filtrujNazwy(sparsowany.nazwy)
      if (oczyszczone.length > 0) return oczyszczone
    }

    // Dodatkowy fallback na wypadek tekstu rozdzielanego przecinkami
    const linie = rawText
      .replace(/```[a-zA-Z]*/g, '')
      .replace(/[`{}[\]"]/g, '')
      .split(/[,\n]/)
    const oczyszczoneFallback = filtrujNazwy(linie)
    if (oczyszczoneFallback.length > 0) return oczyszczoneFallback.slice(0, 5)

    return []
  } catch (error) {
    console.error('Błąd bezpośredniego połączenia z Gemini Vision:', error)
    return []
  }
}

/**
 * Plan edycji od agenta-reżysera (instrukcja w `rezyser.ts`).
 *
 * Zdjęcia idą z narysowanymi pineskami — agent ma zobaczyć, na czym leży
 * każdy punkt. Model obrazu dostaje potem czyste zdjęcia.
 */
export async function geminiPlanujZadanie(
  zadanie: string,
  obrazy: Array<{ nazwa: string; rola: string; dane: string }>,
  uchwyty: string,
  kluczApi = DOMYSLNY_GEMINI_KLUCZ,
): Promise<PlanRezysera | null> {
  try {
    const url = `${ENDPOINT_BASE}/${MODEL_REZYSERA}:generateContent?key=${kluczApi}`

    const parts: any[] = [{ text: SYSTEM_REZYSERA }]
    obrazy.forEach((img, idx) => {
      if (!img.dane) return
      const { mimeType, data } = usunPrefiksBase64(img.dane)
      parts.push({
        text: `[Image ${idx + 1}: "${img.nazwa}", pins drawn]`,
      })
      parts.push({ inlineData: { mimeType, data } })
    })
    parts.push({ text: trescZadaniaRezysera(zadanie, uchwyty) })

    const odp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: KONFIG_REZYSERA }),
    })

    if (!odp.ok) return null
    const json = await odp.json()
    // Model z myśleniem potrafi oddać odpowiedź w kilku częściach — skleja je.
    const txt = (json?.candidates?.[0]?.content?.parts ?? [])
      .filter((p: { thought?: boolean }) => !p.thought)
      .map((p: { text?: string }) => p.text ?? '')
      .join('')
      .trim()
    if (!txt) return null

    return odczytajPlanRezysera(wyczyscIWyjmijJson(txt))
  } catch (e) {
    console.warn('geminiPlanujZadanie error:', e)
    return null
  }
}

/**
 * Czy punkt pineski leży NA RZECZY, czy NA MIEJSCU (patrz `uklad-pinesek.ts`).
 *
 * Każda pineska idzie jako osobne zdjęcie z jednym celownikiem, żeby nie
 * było wątpliwości, o który punkt pytamy. Zwraca `null`
 * przy awarii; wtedy układ zostaje przy domyśle z kolejności.
 */
export async function geminiKlasyfikujPineski(
  obrazy: string[],
  kluczApi = DOMYSLNY_GEMINI_KLUCZ,
): Promise<{ rodzaj: 'object' | 'location'; co: string }[] | null> {
  try {
    const parts: any[] = [
      {
        text:
          'Each image below shows ONE magenta crosshair. For each image, decide what lies exactly under the centre of the crosshair:\n' +
          '- "object": a distinct thing — vehicle, aircraft, person, animal, furniture, building, plant, item, or any part of one (a wheel, a hood, a cushion).\n' +
          '- "location": open surface or space — ground, road, tarmac, floor, rug, grass, sand, leaves on the ground, water, sky, or empty space next to things.\n' +
          'If the centre is on the ground right next to an object, the answer is "location".\n' +
          'Answer ONLY with JSON: {"pineski":[{"nr":1,"rodzaj":"object","co":"short English name of what is under the centre"}]}',
      },
    ]
    obrazy.forEach((dane, i) => {
      const { mimeType, data } = usunPrefiksBase64(dane)
      parts.push({ text: `[Image ${i + 1}]` })
      parts.push({ inlineData: { mimeType, data } })
    })

    const odp = await fetch(`${ENDPOINT_BASE}/${GEMINI_MODEL}:generateContent?key=${kluczApi}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0, maxOutputTokens: 400, responseMimeType: 'application/json' },
      }),
    })
    if (!odp.ok) return null
    const json = await odp.json()
    const txt = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    const wynik = wyczyscIWyjmijJson<{ pineski?: { nr?: number; rodzaj?: string; co?: string }[] }>(txt ?? '')
    const lista = wynik?.pineski
    if (!Array.isArray(lista) || lista.length !== obrazy.length) return null

    return obrazy.map((_, i) => {
      const w = lista.find(x => Number(x.nr) === i + 1) ?? lista[i]
      return { rodzaj: w?.rodzaj === 'location' ? 'location' : 'object', co: String(w?.co ?? '') }
    })
  } catch (e) {
    console.warn('geminiKlasyfikujPineski error:', e)
    return null
  }
}
