/**
 * Agent-reżyser — jedno źródło instrukcji dla modelu, który OGLĄDA zdjęcia
 * przed generacją (Gemini Vision), wspólne dla klienta i proxy serwera.
 *
 * Dlaczego agent, a nie regex: „wstaw go tu” z pineską na masce Mustanga
 * i drugą na plaży obok foki dało pół auta w miejscu foki. Kod widział
 * tylko słowa i nazwę „maska samochodu”; nie wiedział, że pineska leży na
 * całym aucie, że obok celu stoi zwierzę, które ma zostać, ani jak duże jest
 * auto względem foki. To może rozstrzygnąć tylko ktoś, kto patrzy.
 *
 * Podział pracy: rusztowanie (`zbudujPolecenie`) trzyma reguły stałe —
 * kadr, władzę zdjęć, światło, czysty wynik. Agent dokłada to, czego kod
 * nie ma: tryb operacji, opis całych obiektów i jedną precyzyjną instrukcję
 * (wzorzec „prompt enhancer” z Qwen-Image-Edit: niejasne polecenie →
 * konkretna, wykonalna instrukcja edycji, która wskazuje zdjęcie i obiekt).
 */
import { INTENCJE, type Intencja } from './tryby-edycji'

/**
 * Reżyser to Flash, nie Flash-Lite. Lite, z płótnem i rolami podanymi jako
 * fakty, i tak napisał „połóż poduszkę na fotelu w salonie” przy płótnie
 * z jeziorem; Flash na tych samych danych dał poprawną instrukcję (~5 s).
 * Myślenie ograniczone budżetem — reszta limitu zostaje na odpowiedź.
 */
export const MODEL_REZYSERA = 'gemini-2.5-flash'
export const KONFIG_REZYSERA = {
  temperature: 0.1,
  maxOutputTokens: 6000,
  responseMimeType: 'application/json',
  thinkingConfig: { thinkingBudget: 512 },
}

export const SYSTEM_REZYSERA = `You are the edit director of an image-editing pipeline.
A downstream image model receives the clean original images, a fixed rule scaffold and YOUR fields. You look at the images, understand what every pin points at, choose the operation, and report the real-world SCALE. You do not describe looks, light, colour or mood — the scaffold and the image model handle those.

INPUT
- Image 1 is the CANVAS (already decided by the pipeline); further images are REFERENCES. Pins are drawn as numbered magenta crosshairs, only for you.
- A pin list with recogniser names (hints: they can be wrong and often name only a part), and the user's request, usually in colloquial Polish.

STEP 0 — DESTINATION IMAGE ("zdjecie_docelowe")
The image that STAYS and receives the change (where the object lands / the location pin sits / the photo being edited). Every other image is a SOURCE the object is taken from. With one image it is 1. Boxes are expressed on the destination image.

STEP 1 — WHAT EACH PIN POINTS AT
- A pin on an object means the WHOLE object (not a part, unless the user names a part). A pin on open ground, water, floor or sky is a LOCATION.
- "opis": the whole pinned object in English, 2–8 words (type and model if recognisable). Nothing about light or mood.
- "miejsce": where the point lies in its image, in words from what you SEE — the surface it stands on, the nearest landmarks and which side of them, and whether it is near a frame edge. Landmarks only; never percentages or coordinates. If the user's words relate the new thing to the pinned object (leans on, stands next to, in front of, on), say in "miejsce" the object AND the spot where the new thing ends up (e.g. on the ground beside that object), not just the object's surface. Describe the pin's OWN spot: if the nearest subject is far, say so instead of writing "next to".

STEP 1b — BIND THE USER'S WORDS TO PINS
Each noun of the request that refers to a scene object resolves to a pin (users type fragments, inflected forms, synonyms). The operation acts on EXACTLY the named pinned objects — never on a more prominent object nearby. The user's word decides the TYPE of object: when the noun names a type that no pin is on, but a pin lies on or right next to an object of that type (a person leaning on the car the user calls "car"), the operation targets that object of the named type. If nothing of that type is near any pin, say so in "analiza" and act only on what the pins clearly show.

STEP 2 — OPERATION ("intencja"), exactly one of:
"wstaw" (add an object at a location, nothing removed), "przenies" (an object goes to a location pin — same photo or from a reference), "zamien" (the object under a canvas pin is replaced), "postac" (face/identity of a reference person onto the person under a canvas pin), "ubranie" (new outfit for the marked person), "usun", "tekstura", "pora_roku", "pora_dnia", "efekt", "tlo", "styl", "popraw".
"wstaw go tu", "daj to tam", "niech tu stoi" = put the object at the pin and keep everything else. A location pin next to an object means that object stays: "wstaw" or "przenies", never "zamien" unless a replacement is asked for.
Set "dotyczy_osoby" true when a "wstaw", "zamien" or "przenies" adds, replaces or moves a WHOLE PERSON (a human being, not an object) — including a person brought in from a reference photo.

STEP 3 — ROLES
When the pin list gives a role (SOURCE = object that moves or is brought in, DESTINATION = where it ends up), follow it.

STEP 4 — SCALE. Realistic scale is measured, never guessed, and it is neither inflated nor shrunk: use your knowledge of the typical real-world dimensions of the objects involved and be as accurate as you can.
- "skala": 1–3 English sentences: the true real-world size of the incoming / changed object, and how it compares with the anchor below. Words only — no percentages of the image. Never take the size from how much of the reference photo the object fills; distance changes the share of the frame, never the real size.
- "kotwica": ONE anchor of known real size in the DESTINATION image, chosen so it stands at about the same distance from the camera as the destination pin (similar depth — a lane, a doorway, a person, a similar object, a paving course at that row of the image). Give its real width in metres ("szer_m") and a tight box around its horizontal extent ("box", [ymin, xmin, ymax, xmax], 0–1000 of the destination image). Prefer a wide, clearly bounded anchor; never use one at a very different depth from the pin.
- "obiekt": the finished object's apparent size in the destination image, in metres: "szer_m" = its horizontal extent as seen from the camera at its heading in the scene, "wys_m" = its vertical extent as seen (for a high or aerial camera the vertical extent is foreshortened). The code turns anchor + object into the object's exact share of the frame and rescales the generated object to it.
- For a replacement give both sizes in "skala" and their ratio.

STEP 5 — BOXES on the destination image, [ymin, xmin, ymax, xmax] normalised 0–1000:
- "obszar": where the change happens, anchored to the destination pin (centred horizontally on the crosshair, bottom edge at the point where the object meets the ground), compact and true to scale. "zamien": centred on the replaced object's pin. "usun": around the whole removed object with its shadow. "postac": head and hair. "ubranie": torso. "tlo"/"styl"/"pora_roku"/"pora_dnia": null.
- "obszar_zrodla": only for "przenies" inside the canvas photo — the object where it stands now; otherwise null.

STEP 6 — FOR THE USER, IN POLISH
"analiza": one short sentence per pin, what it really points at. "plan": one sentence announcing what will happen.

Answer ONLY with JSON:
{
  "zdjecie_docelowe": 1,
  "intencja": "wstaw",
  "dotyczy_osoby": false,
  "obiekty": [{ "pin": 1, "opis": "short English name", "miejsce": "where the point lies, in words" }],
  "skala": "English, with numbers",
  "kotwica": { "opis": "<the anchor>", "szer_m": <real width in metres>, "box": [<ymin>, <xmin>, <ymax>, <xmax>] },
  "obiekt": { "szer_m": <apparent width in metres>, "wys_m": <apparent height in metres> },
  "obszar": [<ymin>, <xmin>, <ymax>, <xmax>],
  "obszar_zrodla": null,
  "analiza": "Pineska 1 wskazuje ...",
  "plan": "Wstawię ..."
}`

/** Tekst zadania dla agenta — to, co widzi obok zdjęć. */
export function trescZadaniaRezysera(zadanie: string, uchwyty: string): string {
  return [
    `USER REQUEST (Polish): ${zadanie}`,
    `PINS (names from the recogniser — hints only):\n${uchwyty || '(none)'}`,
  ].join('\n\n')
}

/** Role pinesek — ustala je `uklad-pinesek.ts`, `rolaPineski` w polecenia.ts zamienia je na opis. */
export const ROLE_PINESEK = ['SOURCE', 'DESTINATION', 'TARGET', 'DONOR', 'REMOVE', 'SUBJECT', 'STYLE', 'AREA'] as const
export type RolaPineski = (typeof ROLE_PINESEK)[number]

/** Prostokąt na płótnie, współrzędne 0–1 od lewego górnego rogu. */
export interface Prostokat {
  x0: number
  y0: number
  x1: number
  y1: number
}

/**
 * Prostokąt z formatu Gemini ([ymin, xmin, ymax, xmax] w skali 0–1000).
 * Zwraca `undefined` dla wszystkiego, co nie jest sensownym obszarem — model
 * potrafi oddać odwrócone narożniki albo pudełko o zerowym polu.
 */
function odczytajProstokat(v: unknown): Prostokat | undefined {
  if (!Array.isArray(v) || v.length !== 4) return undefined
  const [ymin, xmin, ymax, xmax] = v.map(n => Math.min(1000, Math.max(0, Number(n))) / 1000)
  if ([ymin, xmin, ymax, xmax].some(n => !Number.isFinite(n))) return undefined
  const r = { x0: Math.min(xmin, xmax), y0: Math.min(ymin, ymax), x1: Math.max(xmin, xmax), y1: Math.max(ymin, ymax) }
  return r.x1 - r.x0 >= 0.01 && r.y1 - r.y0 >= 0.01 ? r : undefined
}

export interface PlanRezysera {
  /** numer zdjęcia docelowego (1-based, w kolejności jak reżyser je widział) */
  zdjecieDocelowe?: number
  intencja?: Intencja
  /** zamiana / przeniesienie dotyczy całej osoby → operacje postaci */
  osoba?: boolean
  /** obszar zmiany na płótnie — z niego wynika skala wstawianego obiektu */
  obszar?: Prostokat
  /** przy przeniesieniu w kadrze: gdzie obiekt stoi teraz */
  obszarZrodla?: Prostokat
  /** opis całych obiektów pod pineskami, po angielsku */
  obiekty: { pin: number; opis: string; miejsce: string }[]
  /** rzeczywisty rozmiar obiektu względem kotwicy w kadrze, po angielsku — sekcja SCALE */
  skala: string
  /** pomiar skali: kotwica o znanym rozmiarze + widoczne wymiary obiektu w metrach */
  pomiar?: PomiarSkali
  analiza: string
  plan: string
}

/** Kotwica (znany rozmiar, box 0–1) i widoczne wymiary obiektu w metrach. */
export interface PomiarSkali {
  kotwica: { szerM: number; szer: number }
  obiekt: { szerM: number; wysM: number }
}

function odczytajPomiar(kotwica: unknown, obiekt: unknown): PomiarSkali | undefined {
  const k = kotwica as { szer_m?: unknown; box?: unknown } | null | undefined
  const o = obiekt as { szer_m?: unknown; wys_m?: unknown } | null | undefined
  const szerM = Number(k?.szer_m)
  const box = Array.isArray(k?.box) ? (k.box as unknown[]).map(Number) : []
  const oSzer = Number(o?.szer_m)
  const oWys = Number(o?.wys_m)
  if (![szerM, oSzer, oWys].every(n => Number.isFinite(n) && n > 0) || box.length !== 4 || box.some(n => !Number.isFinite(n))) {
    return undefined
  }
  const szer = Math.abs(box[3] - box[1]) / 1000
  if (szer < 0.02 || szer > 1) return undefined
  return { kotwica: { szerM, szer }, obiekt: { szerM: oSzer, wysM: oWys } }
}

/**
 * Obwiednia obiektu jako % szerokości i wysokości zdjęcia docelowego:
 * skala (ułamek szerokości na metr) wynika z kotwicy, więc rozmiar jest liczony, nie zgadywany.
 */
export function rozmiarZPomiaru(p: PomiarSkali, szerPx: number, wysPx: number): { szer: number; wys: number } | undefined {
  const naMetr = p.kotwica.szer / p.kotwica.szerM
  const szer = p.obiekt.szerM * naMetr * 100
  const wys = p.obiekt.wysM * naMetr * (szerPx / wysPx) * 100
  return szer >= 0.5 && szer <= 95 && wys >= 0.5 && wys <= 95 ? { szer: Math.round(szer * 10) / 10, wys: Math.round(wys * 10) / 10 } : undefined
}

/** Normalizacja odpowiedzi agenta — model potrafi oddać pola w dziwnych typach. */
export function odczytajPlanRezysera(json: Record<string, unknown> | null | undefined): PlanRezysera | null {
  if (!json) return null
  const intencja = INTENCJE.some(i => i.id === json.intencja) ? (json.intencja as Intencja) : undefined
  const obiekty = Array.isArray(json.obiekty)
    ? json.obiekty
        .map(o => o as { pin?: unknown; opis?: unknown; miejsce?: unknown })
        .filter(o => o && o.opis)
        .map(o => ({ pin: Number(o.pin) || 0, opis: String(o.opis), miejsce: String(o.miejsce ?? '').trim() }))
    : []
  const nrDocelowego = Number(json.zdjecie_docelowe)
  const plan: PlanRezysera = {
    zdjecieDocelowe: Number.isFinite(nrDocelowego) && nrDocelowego >= 1 ? Math.round(nrDocelowego) : undefined,
    intencja,
    osoba: json.dotyczy_osoby === true,
    obszar: odczytajProstokat(json.obszar),
    obszarZrodla: odczytajProstokat(json.obszar_zrodla),
    obiekty,
    skala: String(json.skala ?? '').trim(),
    pomiar: odczytajPomiar(json.kotwica, json.obiekt),
    analiza: String(json.analiza ?? '').trim(),
    plan: String(json.plan ?? '').trim(),
  }
  return plan.skala || plan.obiekty.length > 0 ? plan : null
}

/** Opis miejsca każdej pineski słowami (numer pineski → miejsce) — do sekcji PIN MAP w poleceniu. */
export function miejscaZPlanu(plan: Pick<PlanRezysera, 'obiekty'>): Record<number, string> {
  const wynik: Record<number, string> = {}
  for (const o of plan.obiekty) if (o.pin > 0 && o.miejsce) wynik[o.pin] = o.miejsce
  return wynik
}
