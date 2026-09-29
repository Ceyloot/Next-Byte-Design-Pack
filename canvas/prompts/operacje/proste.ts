/**
 * Proste prompty operacji + „bezwzględne zasady” z fragmentów doklejanych w Studiu
 * Zdjęć (PDF „Studio Zdjęć — prompty systemowe”, poz. 4, 13, 23, 9, 11, 35, 28–30).
 * Zamiast brył bricków: jedno zdanie zadania + blok zasad, który obowiązuje ZAWSZE.
 */
import type { OperationId } from '../types'
import { STUDIO_ANATOMIA, STUDIO_TOZSAMOSC } from './character-swap-studio'

export interface ProstaOperacja {
  /** rola modelu (opcjonalna, np. kompozytor VFX) */
  system?: string
  /** zadanie — 1–3 zdania; tokeny {{IMAGE_TARGET}} {{IMAGE_DONOR}} {{PIN_TARGET}} {{PIN_SOURCE}} {{PIN_CLEAR}} */
  misja: string
  /** kotwica na końcu; domyślnie FINAL_CHECK_KOMPOZYTU */
  kontrola?: string
  /** operacja na osobie: dokładamy anatomię, tożsamość i realizm skóry */
  ludzie?: boolean
}

/** poz. 4 — booster kompozytu (dosłownie) */
export const BOOSTER_KOMPOZYTU =
  `ONE photograph captured in-camera, not a composite: subject(s) from the references and the new environment photographed together, same camera, same moment. Relight and color-grade the subject(s) to the destination scene: same light direction, color temperature, softness, white balance, exposure and contrast. Match focal length, eye level, horizon and lens distortion; render true contact shadows, ambient occlusion and ground reflections where the subject touches surfaces. Unified film grain, sensor noise and depth of field — no halos, cut-out edges, sticker look or double lighting.`

/** poz. 20 (część „RE-LIGHT AND RE-SHOOT … Edges must be photographic”), po zamianie „person” → „element” */
export const RE_SHOOT =
  `RE-LIGHT AND RE-SHOOT THE ELEMENT INTO THE SCENE — this decides the shot. Discard the reference lighting completely; it is an identity document, not a look. Copy from the scene onto the element: key-light direction, height and color temperature, fill level, ambient bounce color, rim light, contrast ratio and shadow density, and every warm or cool cast that falls on the objects elsewhere in the frame. Add the shadows that lighting implies: modelling shadows on the element, contact shadow where it meets the ground, and a cast shadow of correct direction, length, softness and opacity. MATCH THE CAMERA: same distance from the lens, same focus state — a shallow scene means the same depth-of-field falloff and bokeh on the element. If the scene has motion blur, camera shake or panning streaks, the element MUST carry the same blur, same direction, same amount. NEVER render the element sharper than the scene. MATCH THE FILM: same white balance, grade, black level, highlight rolloff, saturation, grain size and strength, vignetting, chromatic aberration, flare, glow and atmospheric haze over the element as over the background. Edges must be photographic: no halo, no outline, no crisp silhouette against a soft background, no brightness step between the element and the scene.`

/** poz. 13 — jakość fotograficzna (dosłownie) */
export const JAKOSC_FOTO =
  `PHOTOGRAPHIC QUALITY: magazine-cover quality photograph with crisp micro-detail on the main subject. Background depth-of-field, bokeh, motion blur, atmospheric haze and any intentionally out-of-focus areas MUST be preserved — never force sharpness across the whole frame.`

/** Ramka wyniku (nasza; mapuje obrazy na Image 1). */
export const RAMKA =
  `The result is {{IMAGE_TARGET}} with only the requested change: same framing, format and resolution, every untouched pixel unchanged, and ALL text, watermarks, logos and signs reproduced exactly. The small magenta pin dots are guides only — no magenta dot, numeral or marker appears in the result. Render the element at its TRUE real-world scale, in perfect proportion to the scene.`

/** poz. 23 — kotwica, uogólniona */
export const FINAL_CHECK_KOMPOZYTU =
  `FINAL CHECK: is the element lit by this scene, blurred like this scene, graded and grained like this scene, and casting a shadow into it? Is it exactly at the marked spot? If not, redo. ONE photograph — one light, one lens, one grade.`

/** poz. 35 — realizm skóry i głowy (dosłownie) */
export const REALIZM_SKORY =
  `SKIN AND HEAD REALISM: render skin as photographed, never retouched — visible pores, fine vellus hair on cheeks and jaw, subtle subsurface glow through ears and nose, natural redness and tonal variation, faint facial asymmetry, individual hair strands and flyaways at the hairline, moist eyes with catchlights that match the scene light, natural teeth and lips; keep the same sensor grain over the face as over the rest of the frame.`

/** Blok „bezwzględne zasady — ZAWSZE”. */
export function zasadyZawsze(ludzie: boolean): string {
  const czesci = [BOOSTER_KOMPOZYTU, RE_SHOOT, JAKOSC_FOTO, RAMKA]
  if (ludzie) czesci.push(STUDIO_ANATOMIA, STUDIO_TOZSAMOSC, REALIZM_SKORY)
  return czesci.map((c) => `- ${c}`).join('\n')
}

const NATURALNIE = 'keeping perfect proportions and making it look as natural as possible'

export const PROSTE: Partial<Record<OperationId, ProstaOperacja>> = {
  addition: {
    misja: `Add the new object (the one shown at {{PIN_SOURCE}}, or described in the COMMAND) at {{PIN_TARGET}}, ${NATURALNIE}. Nothing else in the photo changes.`,
  },
  object_swap: {
    misja: `Replace the object at {{PIN_TARGET}} with the object from {{PIN_SOURCE}}, ${NATURALNIE}. The old object leaves completely (with its shadow and reflection); the new one takes its place, orientation and footing.`,
  },
  object_transfer: {
    misja: `Move the object from {{PIN_SOURCE}} to {{PIN_TARGET}}, ${NATURALNIE}. It is the same object, it appears exactly once at the destination, and the old spot is rebuilt as if it had never stood there.`,
  },
  removal: {
    misja: `Remove the object at {{PIN_CLEAR}} and rebuild what was behind it, so that the result looks untouched and natural.`,
  },
  character_transfer: {
    ludzie: true,
    misja: `Move the person from {{PIN_SOURCE}} to {{PIN_TARGET}}, ${NATURALNIE}. It is the same person (same face, body and clothing), they appear exactly once at the destination, and the old spot is rebuilt as if nobody had stood there.`,
  },
  face_swap: {
    ludzie: true,
    system: `You are a high-end VFX face replacement compositor, not a copy-paste editor. Never paste, cut out, overlay, sticker, mask, clone-stamp or directly copy the face pixels from a reference image. Always re-synthesize the person as one coherent photograph with physically consistent lighting, perspective, lens response, skin texture and color grading.`,
    misja: `Create a single photorealistic image using {{IMAGE_TARGET}} as the exact base photo: preserve its body, pose, head angle, expression intensity, gaze direction, clothing, hair placement, hands, occlusions, background, camera angle, focal length, crop, lighting direction, shadows, color grade and composition. Use {{IMAGE_DONOR}} only as the identity source. Transfer identity by reconstructing facial geometry and recognizable traits: face shape, eye shape and spacing, brows, nose structure, mouth shape, jaw/chin/cheekbone structure, skin undertone, age cues, unique marks and realistic skin texture. The final face must look like it was originally photographed in the target scene. Relight and recolor the identity to match the target photo; blend forehead, temples, cheeks, jaw, ears, neck and hairline naturally with no boundary line. Preserve target-scene occluders exactly: hair strands, glasses, hands, shadows, makeup, accessories and anything crossing the face must remain in front where appropriate. Do not copy the source face crop, source expression, source lighting, source background, source image borders or any oval/rectangular patch. Do not change the target body, clothes, pose, hairstyle, environment or framing. Result quality: natural celebrity-grade VFX face replacement, seamless skin blending, coherent pores and grain, no uncanny valley, no pasted-face look.`,
    kontrola: `FINAL CHECK: is this the SAME person as in the identity reference — same face shape, eyes, nose, mouth, skin marks, hair color and texture? If any trait drifted toward a generic face, redo. One photograph, one light, one grade.`,
  },
}
