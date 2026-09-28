/**
 * PROMPT GEMINI 2 — OPIS SCENY (miejsce, wygląd, wymiary)
 * ========================================================
 * Wywoływany PO wyborze zdjęcia docelowego. Gemini dostaje zdjęcia już w
 * kolejności wysyłki do generatora (Image 1 = docelowe) i opisuje pineski
 * po kolei: najpierw pineska 1 (miejsce, wygląd, wymiary), potem pineska 2 itd.
 * Wynik trafia do sekcji SCENE DETAILS finalnego promptu.
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

  return `You are the scene analyst of an image-editing pipeline. You look at the images and write a SHORT factual description that a downstream image model will use. You do not edit anything.

INPUT
- ${w.liczbaZdjec} image(s), labelled Image 1 … Image ${w.liczbaZdjec} in the order sent. Pins are drawn as numbered magenta dots, only for you.
${kontekst}
- Pin list (describe them in this order):
${listaPinesek(w.pineski)}
- The user's command (usually colloquial Polish): "${w.polecenie.trim() || '(none)'}"

WHAT TO DESCRIBE
1. "place": where the scene of Image 1 is, in one sentence (e.g. "stone terrace of a country house, late afternoon").
2. "look": the look of Image 1 — photographic medium (colour / black-and-white / sepia), light direction and colour temperature, grain and sharpness, condition (old, degraded, clean), mood.
3. "anchors": objects of known size visible in Image 1 near the pins, with their real-world size (e.g. "door ≈ 2.0 m high, person ≈ 1.75 m, brick ≈ 6.5 cm").
4. "pins": for EACH pin, in order:
   - "name": the WHOLE object or person under the pin (not only the part under the crosshair), 2–5 words;
   - "place": where it is in its image and what surrounds it;
   - "look": colour, material, condition and distinguishing details;
   - "size": real-world dimensions (height × width or length) with a comparison to a visible anchor. For a pin on a donor image, give the true size of the donor object; for a pin on the target image, give the size of the thing there or of the free space.

RULES
- The pin's NAME and the user's word decide what the pinned thing is — even when the crosshair sits near a bigger, brighter or more central object. Never retarget to a more prominent object.
- Recogniser hints may be wrong; trust what you see.
- Facts only, no opinions. Each text field is at most 25 words. Write in English.

OUTPUT — return ONLY this JSON, no commentary:
{
  "place": "...",
  "look": "...",
  "anchors": "...",
  "pins": [{ "pin": <number>, "name": "...", "place": "...", "look": "...", "size": "..." }]
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
      miejsce: tekst(wpis.place),
      wyglad: tekst(wpis.look),
      wymiary: tekst(wpis.size),
    }
  })

  return {
    miejsce: tekst(json.place),
    wyglad: tekst(json.look),
    kotwice: tekst(json.anchors),
    pineski,
  }
}
