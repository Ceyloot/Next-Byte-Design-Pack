/**
 * PROMPT GEMINI 2 — OPIS SCENY (miejsce, wygląd, wymiary)
 * ========================================================
 * Wywoływany PO wyborze zdjęcia docelowego. Gemini dostaje zdjęcia już w
 * kolejności wysyłki do generatora (Image 1 = docelowe) i opisuje pineski
 * po kolei: najpierw pineska 1 (miejsce, wygląd, wymiary), potem pineska 2 itd.
 * Wynik trafia do sekcji SCALE finalnego promptu (tylko skala: kotwice i wymiary).
 *
 * Prompt służy też do szybkiego nazwania obiektu pod świeżo postawioną pineską
 * (jedna pineska, bez analizy operacji).
 */
import type { AnalizaDocelowego, OpisPineski, OpisSceny, PineskaWejscie } from '../types'
import { listaPinesek, tekst, wyciagnijJson } from './wspolne'

export interface WejscieOpisuSceny {
  liczbaZdjec: number
  /** pineski w kolejności numerów; `zdjecie` = numer zdjęcia w kolejności wysyłki */
  pineski: PineskaWejscie[]
  polecenie: string
  /** wynik promptu 1 (opcjonalny — przy nazywaniu pojedynczej pineski go nie ma) */
  analiza?: AnalizaDocelowego
}

export function zbudujPromptOpisuSceny(w: WejscieOpisuSceny): string {
  const kontekst = w.analiza
    ? `- Image 1 is the TARGET photo; other images are DONORS.
- Operation chosen for this edit: ${w.analiza.operacja}.
- Pin roles: ${w.analiza.role.map((r) => `pin ${r.pineska} = ${r.rola}`).join(', ')}.`
    : `- Describe what the pin points at.`

  return `You are the scale analyst of an image-editing pipeline. You look at the images and report ONLY real-world sizes, so that an inserted or moved object is rendered at a realistic scale. You do not describe looks, light or mood, and you do not edit anything.

INPUT
- ${w.liczbaZdjec} image(s), labelled Image 1 … Image ${w.liczbaZdjec} in the order sent. Pins are drawn as numbered magenta dots, only for you.
${kontekst}
- Pin list (report them in this order):
${listaPinesek(w.pineski)}
- The user's command (usually colloquial Polish): "${w.polecenie.trim() || '(none)'}"

REPORT
1. "anchors": objects of known size visible in Image 1 near the pins, with their real-world size (e.g. "door ≈ 2.0 m high, person ≈ 1.75 m, paving stone ≈ 30 cm").
2. "pins": for EACH pin, in order:
   - "name": the WHOLE object or person under the pin, 2–5 words (the pin's name and the user's word decide it, never a more prominent neighbour);
   - "size": true real-world dimensions (height × width or length) compared with a visible anchor. For a pin on a donor image give the true size of the donor object; for a pin on Image 1 give the size of the thing there or of the free space.

Facts only, at most 25 words per field, English.

OUTPUT — return ONLY this JSON:
{
  "anchors": "...",
  "pins": [{ "pin": <number>, "name": "...", "size": "..." }]
}`
}

/** Parsuje odpowiedź Gemini; brakujące pola uzupełnia pustymi tekstami. */
export function parsujOpisSceny(odpowiedz: string, w: WejscieOpisuSceny): OpisSceny {
  const json = wyciagnijJson(odpowiedz)
  const puste: OpisSceny = { miejsce: '', wyglad: '', kotwice: '', pineski: [] }
  if (!json) return puste

  const wpisy = Array.isArray(json.pins) ? (json.pins as Record<string, unknown>[]) : []
  const pineski: OpisPineski[] = w.pineski.map((p, i) => {
    const wpis = wpisy.find((x) => Number(x.pin) === p.numer) ?? wpisy[i] ?? {}
    return {
      pineska: p.numer,
      nazwa: tekst(wpis.name, p.nazwa ?? 'object'),
      miejsce: '',
      wyglad: '',
      wymiary: tekst(wpis.size),
    }
  })

  return {
    miejsce: '',
    wyglad: '',
    kotwice: tekst(json.anchors),
    pineski,
  }
}
