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
A downstream image model receives the clean original images, a fixed rule scaffold and YOUR fields. You look at the images, understand what every pin points at, choose the operation, report the real-world SCALE, and MEASURE the destination's light and camera (STEP 4c). You never describe how the new object should look or feel — its identity comes from its reference.

INPUT
- Image 1 is the CANVAS (already decided by the pipeline); further images are REFERENCES. Pins are drawn as numbered magenta crosshairs, only for you.
- A pin list with recogniser names (hints: they can be wrong and often name only a part), and the user's request, usually in colloquial Polish.

STEP 0 — DESTINATION IMAGE ("zdjecie_docelowe")
The image that STAYS and receives the change (where the object lands / the location pin sits / the photo being edited). Every other image is a SOURCE the object is taken from. With one image it is 1. Boxes are expressed on the destination image.

STEP 1 — WHAT EACH PIN POINTS AT
- A pin on an object means the WHOLE object (not a part, unless the user names a part). A pin on open ground, water, floor or sky is a LOCATION.
- "opis": a short BADGE in Polish, 3–8 words, that names exactly this pinned thing and tells it apart from similar ones in the same image — colour, type, make or model if recognisable, a visible marking (sticker, number, logo). If look-alikes are near, add which one ("lewy z dwóch", "najbliżej domu"). A location pin: the surface and its nearest landmark ("brukowany podjazd przed bramą garażu"). It goes into the image model's prompt next to the pin's x/y, so keep it short and exact; nothing about light or mood.
- "szczegoly": a DETAILED, exact description in English (3–4 sentences) of EXACTLY the pinned thing, written so that someone who cannot see the image could point at it and nobody could confuse it with anything else. An object: what it is, its overall shape and silhouette, every distinctive part, materials, colours, relative size, what it stands on or against, and which of any look-alikes it is. A location: precisely what the spot is — the surface or thing under the point, what is there now, the nearest landmarks and on which side of each, how far from them in relation to the size of things around, and whether it is near a frame edge. Facts you SEE only; never coordinates or percentages.
- "miejsce": where the point lies in its image, in words from what you SEE — the surface it stands on, the nearest landmarks and which side of them, and whether it is near a frame edge. Landmarks only; never percentages or coordinates. If the user's words relate the new thing to the pinned object (leans on, stands next to, in front of, on), say in "miejsce" the object AND the spot where the new thing ends up (e.g. on the ground beside that object), not just the object's surface. Describe the pin's OWN spot: if the nearest subject is far, say so instead of writing "next to".

STEP 1a — PART OR WHOLE ("czesc")
When the user names a PART of an object (a component of it, not the whole thing) and wants that part changed, set "czesc" to the English name of that part; otherwise "". With a part, the operation is "zamien" or "przenies": ONLY that part of the object at the destination pin is replaced by the same kind of part shown at the source pin — the object itself, and everything else, stays.

STEP 1b — BIND THE USER'S WORDS TO PINS
Each noun of the request that refers to a scene object resolves to a pin (users type fragments, inflected forms, synonyms). The operation acts on EXACTLY the named pinned objects — never on a more prominent object nearby. The user's word decides the TYPE of object: when the noun names a type that no pin is on, but a pin lies on or right next to an object of that type (a person leaning on the car the user calls "car"), the operation targets that object of the named type. If nothing of that type is near any pin, say so in "analiza" and act only on what the pins clearly show.

STEP 2 — OPERATION ("intencja"), exactly one of:
"wstaw" (add an object at a location, nothing removed), "przenies" (an object goes to a location pin — same photo or from a reference), "zamien" (the object under a canvas pin is replaced), "postac" (FACE SWAP ONLY — only when the user explicitly asks for the face / twarz: the face of the reference person goes onto the person under a canvas pin; their body, clothing and pose stay), "ubranie" (new outfit for the marked person), "usun", "tekstura", "pora_roku", "pora_dnia", "efekt", "tlo", "styl", "popraw".
"tlo" = the surroundings / scenery / background / place / location are replaced by another environment (taken from a reference photo, or described), while the subjects in the foreground stay as they are. "zmień scenerię / otoczenie / tło / miejsce / lokalizację na X", "niech to będzie w X", "przenieś to do X" with a place name or a reference photo of a place is ALWAYS "tlo" — never "wstaw" or "przenies": a place is not an object to add. A pin on the reference photo then marks the NEW ENVIRONMENT.
"wstaw go tu", "daj to tam", "niech tu stoi" = put the object at the pin and keep everything else. A location pin next to an object means that object stays: "wstaw" or "przenies", never "zamien" unless a replacement is asked for.
Replacing a PERSON with another person ("zamień go na tego", "podmień tę osobę", without the word face/twarz) is "zamien" with "dotyczy_osoby": true — a whole-person swap: the new person with their own face, hair AND clothing, in the pose and place of the old one. Set "dotyczy_osoby" true when a "wstaw", "zamien" or "przenies" adds, replaces or moves a WHOLE PERSON (a human being, not an object) — including a person brought in from a reference photo.

STEP 3 — ROLES
When the pin list gives a role (SOURCE = object that moves or is brought in, DESTINATION = where it ends up), follow it.

STEP 4 — SCALE. Realistic scale is measured, never guessed, and it is neither inflated nor shrunk: use your knowledge of the typical real-world dimensions of the objects involved and be as accurate as you can.
- "skala": 1–3 English sentences: the true real-world size of the incoming / changed object, and how it compares with the anchor below. Words only — no percentages of the image. Never take the size from how much of the reference photo the object fills; distance changes the share of the frame, never the real size.
- PERSPECTIVE decides apparent size: things shrink with distance from the camera, so a distant house can look smaller than a car standing near the camera, and the same car ten metres farther looks far smaller than right beside the camera. Real size and apparent size are different things — judge apparent size at the DESTINATION's distance, never the object's size in its own photo and never a fixed ratio between object types.
- "kotwice": 2 or 3 anchors of known real size in the DESTINATION image, standing at DIFFERENT distances from the camera (one nearer, one farther; the destination pin lies between or near them). Each gives its real width in metres ("szer_m") and a tight box around its horizontal extent ("box", [ymin, xmin, ymax, xmax], 0–1000 of the destination image) whose BOTTOM edge sits where the anchor touches the ground. The code uses their sizes at their image rows to derive how scale changes with distance and reads the scale exactly at the destination pin's row. One anchor is acceptable only when nothing else of known size is visible.
- "obiekt": the finished object's size as it appears AT THE DESTINATION (in metres of real length across the image plane at that spot): "szer_m" = its horizontal extent as seen from the camera at its heading in the scene, "wys_m" = its vertical extent as seen (for a high or aerial camera the vertical extent is foreshortened), "prawdziwe" = its TRUE dimensions {"dl_m" length, "szer_m" width, "wys_m" height}, "kat_deg" = its heading relative to the camera in degrees (0 = its long side faces the camera, full length visible; 90 = its front or back faces the camera, only its width visible; 45 = diagonal three-quarter view), and "kamera_deg" = how steeply the destination camera looks down at the spot (0 = eye level, 90 = straight down). The code computes the apparent size from these; give them even when unsure. An object turned at an angle to the camera shows part of its length: its apparent width then lies between its width and the diagonal of its footprint — a car parked diagonally, seen from above, spans nearly its full length, not its 1.9 m width. The code turns anchor + object into the object's exact share of the frame and rescales the generated object to it.
- For a replacement give both sizes in "skala" and their ratio.
- Compare in NUMBERS, never with a bare "smaller / larger than": give the ratio of the object's real length and width to the nearest anchor (e.g. "length 4.5 m ≈ 1.5× the 3 m door; width 1.9 m ≈ 0.6× it"). Check the arithmetic — a 4.5 m car is longer than a 3 m door, not smaller.

STEP 4b — "widok": how the finished object must APPEAR at the destination, 1–2 English sentences, derived from the destination scene's geometry: its heading relative to the lines of the surface it stands on (along, across or at an angle to them, and toward or away from the camera), which of its faces the target camera sees (front, side, rear, top) and from what camera height or elevation. It comes from the destination camera and surface, never from how the object looks in its reference photo; a reference view that differs from this is turned to match. Skip for objects without a natural heading.

STEP 4d — "ulozenie": how the finished object is arranged LOGICALLY at the destination, 2–3 English sentences: exactly which surface it rests on at the pin and how far that surface extends around the point (compare its width with the object's footprint — the object must fit within its own ground and never overhang what is not ground for it), how it is aligned to the lines of that surface and of the scene, what free space it occupies, and which neighbouring things it must keep clear of (never touching, covering or standing inside them). Facts from the destination image only; skip for pure removal.

STEP 4c — "swiatlo": the DESTINATION image's light and camera, measured from what you see, 2–4 English sentences with concrete values. The image model cannot guess these reliably, so "match the lighting" is useless — write numbers and directions:
- key light: direction relative to the camera (e.g. from camera-left, high, ~40° above the horizon; or back-light), hardness (hard sun / soft overcast / diffuse window), colour temperature in Kelvin (e.g. ~3200K warm tungsten, ~5600K daylight, ~7000K overcast shade), and fill/ambient level;
- shadows: which way they fall in the image, their length and edge softness, how dark they are, as seen on objects near the destination pin;
- colour bounce: which nearby surfaces tint the subject and how (green grass → green fill from below, warm floor → warm bounce, neon → coloured rim);
- camera: apparent focal length (wide / normal / tele), depth of field at the destination pin (sharp or how blurred), grain or noise level, motion blur if any, and the medium (digital, film, black-and-white, old photo).
Describe the destination photograph as it is, never an idealised version. For "tlo", "styl", "pora_dnia" and "pora_roku" describe the ORIGINAL light — the operation changes it.

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
  "obiekty": [{ "pin": 1, "opis": "short English badge", "miejsce": "where the point lies, in words", "szczegoly": "detailed description of exactly this pinned thing" }],
  "skala": "English, with numbers",
  "kotwice": [{ "opis": "<the anchor>", "szer_m": <real width in metres>, "box": [<ymin>, <xmin>, <ymax>, <xmax>] }],
  "widok": "<heading, visible faces, camera elevation at the destination>",
  "ulozenie": "<surface under the pin, how it fits on it, alignment, what to keep clear of>",
  "czesc": "",
  "swiatlo": "<key light direction, hardness, Kelvin; shadow direction and softness; colour bounce; focal length, depth of field, grain, medium>",
  "obiekt": { "szer_m": <apparent width in metres>, "wys_m": <apparent height in metres>, "prawdziwe": { "dl_m": <true length>, "szer_m": <true width>, "wys_m": <true height> }, "kat_deg": <0–90>, "kamera_deg": <0–90> },
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
  obiekty: { pin: number; opis: string; miejsce: string; szczegoly: string }[]
  /** rzeczywisty rozmiar obiektu względem kotwicy w kadrze, po angielsku — sekcja SCALE */
  skala: string
  /** pomiar skali: kotwica o znanym rozmiarze + widoczne wymiary obiektu w metrach */
  pomiar?: PomiarSkali
  /** widok obiektu w scenie docelowej (kierunek, widoczne ściany, kąt kamery), po angielsku */
  widok: string
  /** światło i kamera zdjęcia docelowego z konkretnymi wartościami, po angielsku */
  swiatlo: string
  /** logiczne ułożenie obiektu w miejscu docelowym: powierzchnia, dopasowanie, wyrównanie, odstępy (EN) */
  ulozenie: string
  /** nazwa CZĘŚCI obiektu (EN), gdy użytkownik zmienia tylko część; puste = cały obiekt */
  czesc: string
  analiza: string
  plan: string
}

/** Kotwice (znany rozmiar, szerokość i dolna krawędź w kadrze 0–1) i widoczne wymiary obiektu w metrach. */
export interface PomiarSkali {
  kotwice: { opis: string; szerM: number; szer: number; rzad: number }[]
  obiekt: { szerM: number; wysM: number }
}

function odczytajPomiar(kotwice: unknown, obiekt: unknown): PomiarSkali | undefined {
  const lista = Array.isArray(kotwice) ? (kotwice as { opis?: unknown; szer_m?: unknown; box?: unknown }[]) : []
  const k = lista.flatMap(x => {
    const szerM = Number(x?.szer_m)
    const box = Array.isArray(x?.box) ? (x.box as unknown[]).map(Number) : []
    if (!Number.isFinite(szerM) || szerM <= 0 || box.length !== 4 || box.some(n => !Number.isFinite(n))) return []
    const szer = Math.abs(box[3] - box[1]) / 1000
    const rzad = Math.max(box[0], box[2]) / 1000
    return szer >= 0.02 && szer <= 1 ? [{ opis: String(x?.opis ?? '').trim(), szerM, szer, rzad }] : []
  })
  const o = obiekt as
    | {
        szer_m?: unknown
        wys_m?: unknown
        kat_deg?: unknown
        kamera_deg?: unknown
        prawdziwe?: { dl_m?: unknown; szer_m?: unknown; wys_m?: unknown }
      }
    | null
    | undefined
  let oSzer = Number(o?.szer_m)
  let oWys = Number(o?.wys_m)
  if (!k.length || ![oSzer, oWys].every(n => Number.isFinite(n) && n > 0)) return undefined

  // Widoczny rozmiar nie może wyjść poza to, co pozwalają prawdziwe wymiary.
  // Auto stojące ukośnie, widziane z góry, reżyser opisał jako ~1 m „widocznej
  // szerokości” (3% kadru) — model to zignorował i narysował auto dwa razy za duże.
  const dl = Number(o?.prawdziwe?.dl_m)
  const sz = Number(o?.prawdziwe?.szer_m)
  const wy = Number(o?.prawdziwe?.wys_m)
  if ([dl, sz].every(n => Number.isFinite(n) && n > 0)) {
    const bok = Math.min(dl, sz)
    const przekatna = Math.hypot(dl, sz)
    const wysokosc = Number.isFinite(wy) && wy > 0 ? wy : bok
    const kat = Number(o?.kat_deg)
    const kamera = Number(o?.kamera_deg)
    if (Number.isFinite(kat) && Number.isFinite(kamera)) {
      // Rzut prostopadłościanu: kąty ocenia się na oko pewniej niż „widoczne metry”.
      const t = (Math.min(90, Math.max(0, kat)) * Math.PI) / 180
      const e = (Math.min(90, Math.max(0, kamera)) * Math.PI) / 180
      oSzer = dl * Math.abs(Math.cos(t)) + sz * Math.abs(Math.sin(t))
      const glebia = dl * Math.abs(Math.sin(t)) + sz * Math.abs(Math.cos(t))
      oWys = glebia * Math.sin(e) + wysokosc * Math.cos(e)
    } else {
      oSzer = Math.min(przekatna, Math.max(bok, oSzer))
      oWys = Math.min(Math.hypot(przekatna, wysokosc), Math.max(0.5 * Math.min(wysokosc, bok), oWys))
    }
  }
  return { kotwice: k, obiekt: { szerM: Math.round(oSzer * 100) / 100, wysM: Math.round(oWys * 100) / 100 } }
}

/**
 * Skala (ułamek szerokości kadru na metr) w danym rzędzie zdjęcia.
 * Dla płaskiego podłoża skala rośnie liniowo ku dołowi kadru: a(y) = k·(y − y_horyzontu).
 * Z ≥2 kotwic na różnych rzędach dopasowujemy tę prostą i odczytujemy skalę dokładnie
 * w rzędzie pinu; przy jednej kotwicy (albo niespójnym dopasowaniu) bierzemy kotwicę
 * najbliższą temu rzędowi.
 */
export function skalaWRzedzie(p: PomiarSkali, rzad: number): number {
  const a = p.kotwice.map(k => ({ y: k.rzad, s: k.szer / k.szerM }))
  const najblizsza = a.reduce((b, x) => (Math.abs(x.y - rzad) < Math.abs(b.y - rzad) ? x : b), a[0])
  if (a.length < 2) return najblizsza.s
  const n = a.length
  const my = a.reduce((t, x) => t + x.y, 0) / n
  const ms = a.reduce((t, x) => t + x.s, 0) / n
  const sxx = a.reduce((t, x) => t + (x.y - my) ** 2, 0)
  if (sxx < 0.0025) return najblizsza.s // kotwice na prawie tym samym rzędzie — brak informacji o perspektywie
  const k = a.reduce((t, x) => t + (x.y - my) * (x.s - ms), 0) / sxx
  const przewidziana = ms + k * (rzad - my)
  if (!(k > 0 && przewidziana > 0)) return najblizsza.s
  // Prosta z 2–3 pudełek od modelu potrafi przestrzelić kilkukrotnie (auto na
  // podjeździe wyszło na 3% kadru). Skala nie zmienia się skokowo między bliskimi
  // rzędami, więc wynik trzymamy w paśmie wokół najbliższej kotwicy.
  const blisko = Math.abs(najblizsza.y - rzad) < 0.15
  const [dol, gora] = blisko ? [0.7, 1.45] : [0.4, 2.5]
  return Math.min(najblizsza.s * gora, Math.max(najblizsza.s * dol, przewidziana))
}

/** Kotwica leżąca najbliżej rzędu pinu — do porównania „obiekt vs znana rzecz obok”. */
function najblizszaKotwica(p: PomiarSkali, rzad: number) {
  return p.kotwice.reduce((b, x) => (Math.abs(x.rzad - rzad) < Math.abs(b.rzad - rzad) ? x : b), p.kotwice[0])
}

/**
 * Porównanie z kotwicą widoczną w kadrze — modelowi łatwiej trafić „1,5× szerokości
 * bramy garażu” niż procent kadru. Po angielsku, do sekcji SCALE.
 */
export function porownanieZKotwica(p: PomiarSkali, rzadPinu?: number): string {
  const rzad = rzadPinu ?? p.kotwice.reduce((t, k) => t + k.rzad, 0) / p.kotwice.length
  const kotwica = najblizszaKotwica(p, rzad)
  if (!kotwica?.opis) return ''
  const naMetr = skalaWRzedzie(p, rzad)
  const razy = (p.obiekt.szerM * naMetr) / kotwica.szer
  if (!Number.isFinite(razy) || razy <= 0) return ''
  const r = razy >= 10 ? Math.round(razy) : Math.round(razy * 10) / 10
  return `Size anchor: the ${kotwica.opis} in Image 1 is ${kotwica.szerM} m wide; at the destination the object spans about ${r}× the width at which that ${kotwica.opis} appears in the frame (${p.obiekt.szerM} m across as seen from the camera).`
}

/**
 * Obwiednia obiektu jako % szerokości i wysokości zdjęcia docelowego, liczona
 * z perspektywy: skala w rzędzie pinu × wymiary obiektu w metrach.
 */
export function rozmiarZPomiaru(
  p: PomiarSkali,
  szerPx: number,
  wysPx: number,
  rzadPinu?: number,
): { szer: number; wys: number } | undefined {
  const rzad = rzadPinu ?? p.kotwice.reduce((t, k) => t + k.rzad, 0) / p.kotwice.length
  const naMetr = skalaWRzedzie(p, rzad)
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
        .map(o => o as { pin?: unknown; opis?: unknown; miejsce?: unknown; szczegoly?: unknown })
        .filter(o => o && o.opis)
        .map(o => ({ pin: Number(o.pin) || 0, opis: String(o.opis), miejsce: String(o.miejsce ?? '').trim(), szczegoly: String(o.szczegoly ?? '').trim() }))
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
    pomiar: odczytajPomiar(json.kotwice, json.obiekt),
    widok: String(json.widok ?? '').trim(),
    swiatlo: String(json.swiatlo ?? '').trim(),
    ulozenie: String(json.ulozenie ?? '').trim(),
    czesc: String(json.czesc ?? '').trim(),
    analiza: String(json.analiza ?? '').trim(),
    plan: String(json.plan ?? '').trim(),
  }
  return plan.skala || plan.obiekty.length > 0 ? plan : null
}

/** Odznaka każdej pineski (numer → krótki opis odróżniający obiekt) — idzie do promptu obok x/y. */
export function odznakiZPlanu(plan: Pick<PlanRezysera, 'obiekty'>): Record<number, string> {
  const wynik: Record<number, string> = {}
  for (const o of plan.obiekty) if (o.pin > 0 && o.opis.trim()) wynik[o.pin] = o.opis.trim()
  return wynik
}

/** Szczegółowy opis każdej pineski (numer pineski → opis rzeczy / miejsca) — idzie do promptu przeniesienia w kadrze. */
export function szczegolyZPlanu(plan: Pick<PlanRezysera, 'obiekty'>): Record<number, string> {
  const wynik: Record<number, string> = {}
  for (const o of plan.obiekty) if (o.pin > 0 && o.szczegoly) wynik[o.pin] = o.szczegoly
  return wynik
}

/** Opis miejsca każdej pineski słowami (numer pineski → miejsce) — do kontroli wyniku. */
export function miejscaZPlanu(plan: Pick<PlanRezysera, 'obiekty'>): Record<number, string> {
  const wynik: Record<number, string> = {}
  for (const o of plan.obiekty) if (o.pin > 0 && o.miejsce) wynik[o.pin] = o.miejsce
  return wynik
}
