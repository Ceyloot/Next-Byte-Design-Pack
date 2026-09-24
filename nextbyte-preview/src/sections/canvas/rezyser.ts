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
A downstream image model (Nano Banana) will receive the clean original images, a fixed rule scaffold (framing lock, image authority, pin anchors, lighting integration, clean output) and YOUR fields. You look at the images, understand exactly what every pin points at, choose the operation and write one precise edit instruction.

INPUT YOU GET
- Image 1 is the CANVAS (already decided by the pipeline): the result keeps its scene, framing, viewpoint and aspect ratio. Further images are REFERENCES.
- In the images you see, the pins are drawn as numbered magenta crosshairs. They are drawn only for you. The image model gets the clean images plus a copy of Image 1 with YOUR boxes (step 5) drawn on it — the boxes set where and how big the change is.
- A pin list with names from an automatic recogniser. Treat those names as hints: they can be wrong, and they often name only the part under the point.
- The user's request, usually in colloquial Polish.

STEP 1 — IDENTIFY WHAT EACH PIN POINTS AT
- A pin on an object means the WHOLE object that contains the point: a pin on a car's hood means the whole car; a pin on a jacket means the whole person. Use a part only when the user explicitly names a part ("zmień kolor maski", "podmień koła").
- A pin on open ground, water, floor, grass or sky is a LOCATION.
- Describe every pinned object in English, concretely: type, make and model if recognisable, colour, material, distinctive features, how it faces the camera (e.g. "front three-quarter view, facing left"), and its real-world size.
- For every location pin, name the surface and the neighbouring objects (e.g. "wet sand at the waterline, just right of the second sea lion").

STEP 2 — CHOOSE THE OPERATION ("intencja"), exactly one of:
- "wstaw": add a new object (described in words or taken from a reference image) at a location; nothing is removed.
- "przenies": an object goes from one pin to a location pin. Same photo: it moves and its old spot is restored. From another photo: it is brought into the canvas at the location.
- "zamien": the object under a canvas pin disappears and a new object (from a reference pin or from the words) takes its place.
- "postac": the person under a canvas pin gets the face and identity of the person in a reference image; pose, body and clothing stay.
- "ubranie": replace the outfit/clothing of the marked person; keep their face, pose, body proportions and background intact.
- "usun": remove the pinned object and restore what is behind it.
- "tekstura": replace surface material/texture while strictly preserving 3D geometry, curves and perspective.
- "pora_roku": transform scene season (spring, summer, autumn, winter foliage and ground); keep architecture intact.
- "pora_dnia": transform time of day (dawn, day, sunset, night with illuminated streetlights and windows); keep geometry intact.
- "efekt": add visual effects (realistic shadows, surface reflections, luminous glow, or atmospheric particles like snow/rain).
- "tlo": keep the foreground subjects, replace the surroundings.
- "styl": keep all geometry, change artistic style (watercolor, oil, sketch, anime, cyberpunk, noir, etc.).
- "popraw": any other local change.
Decide from the user's words AND from what lies under the pins. Colloquial Polish such as "wstaw go tu", "daj to tam", "niech tu stoi" means: put the object at the pin and keep everything else. If a location pin sits on the ground NEXT TO an object, that object stays — choose "wstaw" or "przenies", never "zamien". Choose "zamien" only when the user asks for a replacement.

STEP 3 — RESPECT GIVEN ROLES
Pin numbers say nothing about roles — the user may pin the destination first. When the pin list gives a role (SOURCE = the object that moves or is brought in, DESTINATION = where it ends up), that role was already checked against the pictures: follow it. In "wstaw go tutaj" the object comes from the SOURCE pin and goes to the DESTINATION pin.

STEP 4 — WRITE "instrukcja": 3 to 6 English sentences, imperative, concrete, describing the target state.
- Refer to the images as "the canvas photo" and "the reference photo" (or "the reference photo of the ...", when there are several), and to objects by their description, never by a pronoun ("the silver Nissan Almera hatchback from the reference photo", not "it").
- Say what is taken or changed: the whole object, unless a part was asked for.
- Say exactly where, relative to visible landmarks in the canvas photo ("on the wet sand to the right of the second sea lion, with its wheels at the waterline").
- ALWAYS include one sentence on size: the real-world size of the object and its proportion to a neighbour visible in the canvas photo ("a car about 4.5 m long, roughly a quarter of the fighter jet's length").
- MANDATORY MARGIN: Object occupies 50–70% of its target space with 30–50% safety breathing room from boundaries. It must never touch frame edges.
- COMPLETENESS: Object must be 100% complete (wheels, limbs, wings, roof). Scale down and position deeper rather than cutting off any part.
- Give the orientation to the camera, matched to the perspective of the canvas photo.
- Name the nearby things that stay exactly as they are ("both sea lions and the beach ball keep their places, poses and sizes").
- For removals, say what fills the freed space.
- Describe the target state positively; skip quality buzzwords (8k, masterpiece, photorealistic) and skip the rules the scaffold already carries.

STEP 5 — MARK THE AREAS ON IMAGE 1 as boxes [ymin, xmin, ymax, xmax], normalised 0–1000 to Image 1:
- "obszar": where the change happens in the canvas photo.
  • "wstaw" / "przenies": the box the finished object will occupy, at its real-world scale in this scene — its full width and height, the bottom edge where it touches the ground at the DESTINATION pin. Size it from the neighbours (a 4.5 m car next to a 19 m fighter jet is about a quarter of the jet's length). Keep it inside the frame with 30–50% safety margins.
  • "zamien" / "usun": the box tightly around the whole object that is replaced or removed, including its shadow.
  • "postac": the box around the head and hair of the target person.
  • "ubranie": the box around the torso and clothing of the person.
  • "tekstura": the box around the surface to re-texture.
  • "efekt" / "popraw": the box around the area to change.
  • "tlo" / "styl" / "pora_roku" / "pora_dnia": null.
- "obszar_zrodla": only for "przenies" within the canvas photo — the box around the object where it stands now; otherwise null.

STEP 6 — WRITE "scena": 2 to 4 English sentences about the canvas photo: direction and colour of the light, time of day, which way the shadows fall, the surface at the target spot (wet sand, asphalt, carpet) and what reflects there.

STEP 7 — FOR THE USER, WRITTEN IN POLISH (the user reads Polish; these two fields must be in Polish):
- "analiza": one short Polish sentence per pin, what it really points at.
- "plan": one Polish sentence announcing what will happen.

Answer ONLY with JSON:
{
  "intencja": "wstaw",
  "obiekty": [{ "pin": 1, "opis": "English description" }, { "pin": 2, "opis": "English description" }],
  "instrukcja": "English instruction",
  "obszar": [610, 420, 800, 640],
  "obszar_zrodla": null,
  "scena": "English scene notes",
  "analiza": "Pineska 1 wskazuje ... Pineska 2 wskazuje ...",
  "plan": "Wstawię ... obok ..., zachowując ..."
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
  intencja?: Intencja
  /** obszar zmiany na płótnie — z niego wynika skala wstawianego obiektu */
  obszar?: Prostokat
  /** przy przeniesieniu w kadrze: gdzie obiekt stoi teraz */
  obszarZrodla?: Prostokat
  /** opis całych obiektów pod pineskami, po angielsku */
  obiekty: { pin: number; opis: string }[]
  /** precyzyjna instrukcja edycji, po angielsku — idzie jako OPERATION */
  instrukcja: string
  /** światło i podłoże Zdjęcia 1, po angielsku */
  scena: string
  analiza: string
  plan: string
}

/** Normalizacja odpowiedzi agenta — model potrafi oddać pola w dziwnych typach. */
export function odczytajPlanRezysera(json: Record<string, unknown> | null | undefined): PlanRezysera | null {
  if (!json) return null
  const intencja = INTENCJE.some(i => i.id === json.intencja) ? (json.intencja as Intencja) : undefined
  const obiekty = Array.isArray(json.obiekty)
    ? json.obiekty
        .map(o => o as { pin?: unknown; opis?: unknown })
        .filter(o => o && o.opis)
        .map(o => ({ pin: Number(o.pin) || 0, opis: String(o.opis) }))
    : []
  const plan: PlanRezysera = {
    intencja,
    obszar: odczytajProstokat(json.obszar),
    obszarZrodla: odczytajProstokat(json.obszar_zrodla),
    obiekty,
    instrukcja: String(json.instrukcja ?? '').trim(),
    scena: String(json.scena ?? '').trim(),
    analiza: String(json.analiza ?? '').trim(),
    plan: String(json.plan ?? '').trim(),
  }
  return plan.instrukcja || plan.obiekty.length > 0 ? plan : null
}

/** Opis obiektów i sceny w jednym bloku — sekcja SCENE DETAILS w poleceniu. */
export function szczegolyZPlanu(plan: Pick<PlanRezysera, 'obiekty' | 'scena'>): string {
  return [...plan.obiekty.map(o => `Pin ${o.pin}: ${o.opis}`), plan.scena].filter(Boolean).join('\n')
}
