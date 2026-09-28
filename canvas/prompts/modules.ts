/**
 * MODUŁY-STAŁE (placeholdery) — uniwersalne bloki promptu.
 *
 * Zasada naczelna: te teksty są 100% UNIWERSALNE — nigdy nie nazywają typu
 * obiektu ani domeny (żadnych "car", "garage", "driveway"). Mówią ogólnie:
 * the object, its supporting surface, the nearest visible anchor of known size,
 * the scene's medium. Specyfikę typu obiektu (auto → wzdłuż drogi, roślina →
 * na parapecie, konkretne cm) dostarcza GEMINI per-przypadek do placeholderów
 * {scene} i {operation}. Kod tu jest niezmienny; Gemini jest konkretem.
 *
 * Placeholdery wypełniane per-generację (patrz assemble.ts):
 *   {command} {scene} {operation} {anchors} {keep} {images}
 */

/** ① tożsamość — co pozostaje prawdą o obiekcie */
export const IDENTITY = `① IDENTITY: the incoming object keeps its own identity, shape, proportions and surface condition. It is unmistakably the SAME object, only re-photographed inside this scene — never a generic stand-in, and never carrying over the source photo's framing, background or lighting.`

/** ② pozycja — gdzie ląduje, styk, głębia */
export const POSITION = `② POSITION: the object lands EXACTLY at the marked point — that point is where its base meets the ground or surface, footprint centred there, not drifted, not floating, not moved elsewhere. It aligns to the natural lines and flow of that surface, sits with a soft contact shadow, respects depth order (nearer things overlap it), and keeps clear spacing from neighbours with no clipping.`

/** ③ skala — realny rozmiar z kotwic sceny */
export const SCALE = `③ SCALE: render the object at its TRUE real-world size (from the pin analysis). Judge it against whatever known-size reference is actually visible near the spot (a hand, a person, a doorway, a cup, a tile). State the comparison with a number. The marked area is a boundary, not a quota — never inflate to fill it. If no anchor is near, err SMALLER and set it deeper. Keep perspective: edges converge to the scene's vanishing points.`

/** ④ ziarno / medium — dopasowanie do stylu zdjęcia docelowego */
export const GRAIN = `④ GRAIN & MEDIUM: re-photograph the object in the destination photo's exact medium. Match its colour treatment (if the scene is black-and-white / monochrome / sepia, the object is too), its tonal curve and contrast, and cover it in the SAME heavy, authentic film grain, noise and analog texture — grain running continuously across object and background, no clean patch. NO digital smoothness, NO CGI / AI-render / glossy look. Match its lighting direction, colour temperature and depth-of-field / blur.`

/** ⑤ wierność — zero enhancera, blokada rozdzielczości/perspektywy/światła */
export const FIDELITY = `⑤ FIDELITY (editor, NOT enhancer/upscaler): keep the destination's exact resolution, aspect ratio, camera position, focal length and lighting. Do NOT upscale, sharpen, denoise, clean, brighten, re-grade or "improve" anything the task does not touch — a degraded old photo stays a degraded old photo. Only the changed area may differ; every other pixel is the original, at its original quality.`

/** kadr — ta sama scena, blokada ujęcia */
export const FRAMING = `FRAMING (overriding): the result is the destination photo with only the requested change — same shot, same camera spot, same field of view, same angle, same frame edges. Everything the task does not concern stays in place at the same size. Work like a retoucher on a finished photograph.`

/** kontrakt wyniku — Image 1 = docelowe, format/liczba obiektów */
export const OUTPUT_CONTRACT = `OUTPUT CONTRACT (fixed): Image 1 is the TARGET (destination) — the result IS Image 1 with only the change. It keeps Image 1's exact aspect ratio, resolution, framing and grain; never takes format/quality from a reference. Further images are REFERENCES contributing only their pinned object's identity. Add nothing and remove nothing extra: every existing subject stays, same count and positions. Bring each object in EXACTLY ONCE, with the exact number of its own parts — never duplicate a feature.`

/** czysty wynik — jedno zdjęcie, generuj od zera */
export const CLEAN_OUTPUT = `CLEAN OUTPUT: one seamless photograph, no visible pins/boxes/markings. GENERATE FROM SCRATCH — NEVER COPY-PASTE: the object is drawn anew, pixel by pixel, as a native part of this photograph; it is forbidden to copy, cut, lift, warp or paste the object's pixels from the reference and merely recolour them. A recoloured cut-out is always wrong. No seams, no hard edges, no pasted look — the edit must be impossible to spot.`

/** stała lista modułów w kolejności bazowej (dla assemble) */
export const MODULE = {
  IDENTITY,
  POSITION,
  SCALE,
  GRAIN,
  FIDELITY,
  FRAMING,
  OUTPUT_CONTRACT,
  CLEAN_OUTPUT,
} as const

export type ModuleName = keyof typeof MODULE
