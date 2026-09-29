/**
 * Zamiana postaci — prompty Studia Zdjęć (supabase/functions/runware-character-swap),
 * przejęte 1:1 z „Studio Zdjęć — prompty systemowe” (poz. 19, 20, 21, 23, 11, 9).
 * Jedyne zmiany: numeracja obrazów (u nas Image 1 = scena, Image 2… = referencje
 * postaci; w Studiu scena jest OSTATNIĄ referencją) oraz `{refsClause}`.
 */

/** poz. 19 — rola modelu (systemPrompt) */
export const STUDIO_SWAP_SYSTEM =
  `You are a high-end VFX character-replacement compositor, not a copy-paste editor. You never cut out, paste, sticker, overlay, mask or clone a reference person into a plate. You RE-PHOTOGRAPH the person inside the target plate: one exposure, one light set, one lens, one sensor, one color grade for the whole frame.`

/** Wspólny ogon bazy (poz. 20 i 21 różnią się tylko początkiem — skąd bierzemy ubranie). */
const OGON_BAZY =
  `pose, posture, limb placement, head tilt, action; position, scale, perspective, camera angle, focal length, crop, composition; the whole background; and ALL text, watermarks, overlays, logos and signs reproduced EXACTLY. RE-LIGHT AND RE-SHOOT THE PERSON INTO THE SCENE — this decides the shot. Discard the reference lighting completely; it is an identity document, not a look. Copy from the scene onto the person: key-light direction, height and color temperature, fill level, ambient bounce color, rim light, contrast ratio and shadow density, and every warm or cool cast that falls on skin, hair and fabric elsewhere in the frame. Add the shadows that lighting implies: modelling shadows on the body, contact shadow where the person meets the ground, and a cast shadow of correct direction, length, softness and opacity. MATCH THE CAMERA: same distance from the lens as the person being replaced, same focus state — a shallow scene means the same depth-of-field falloff and bokeh on hair and shoulders. If the scene has motion blur, camera shake or panning streaks, the person MUST carry the same blur, same direction, same amount, on limbs, hair and clothing edges. NEVER render the person sharper than the scene. MATCH THE FILM: same white balance, grade, black level, highlight rolloff, saturation, grain size and strength, vignetting, chromatic aberration, flare, glow and atmospheric haze over the person as over the background. Edges must be photographic: no halo, no outline, no crisp silhouette against a soft background, no brightness step between person and scene.`

/** poz. 20 — ubranie bierzemy Z POSTACI (wariant domyślny). */
export function studioSwapBaza(refsClause: string, scena: string): string {
  return (
    `REPLACE the person in the scene image (${scena}) with the person from ${refsClause}. The original person must be COMPLETELY removed — none of their face or body may survive. FROM THE CHARACTER REFERENCE take ONLY identity: facial geometry, hair, body build, skin undertone, tattoos, scars, moles, and the exact garments and accessories (same cut, color, print, logo, lettering). FROM THE SCENE take everything else, unchanged: ` +
    OGON_BAZY
  )
}

/** poz. 21 — „zachowaj ubranie sceny docelowej” (z postaci tylko twarz, włosy, budowa, skóra, znaki). */
export function studioSwapBazaUbranieSceny(refsClause: string, scena: string): string {
  return (
    `REPLACE the person in the scene image (${scena}) with the person from ${refsClause}. The original person must be COMPLETELY removed — none of their face or body may survive. FROM THE CHARACTER REFERENCE take ONLY identity: facial geometry, hair, body build, skin undertone, tattoos, scars, moles. Do NOT take the reference clothing, garments or accessories — ignore what the reference person wears entirely. FROM THE SCENE take everything else, unchanged: the ORIGINAL PERSON'S CLOTHING, garments, footwear and accessories exactly as worn (same cut, color, print, fit, drape and wrinkles, re-fitted naturally to the new body); ` +
    OGON_BAZY
  )
}

/** poz. 23 — kotwica na koniec bazy */
export const STUDIO_SWAP_KONTROLA =
  `FINAL CHECK: is the person lit by this scene, blurred like this scene, graded and grained like this scene, and casting a shadow into it? If not, redo. ONE photograph — one light, one lens, one grade — with the person from the character references.`

/** poz. 11 — wymogi anatomiczne twarzy i dłoni */
export const STUDIO_ANATOMIA =
  `ANATOMICAL ACCURACY — MANDATORY: Every human face must be photorealistic and anatomically correct. Each face must have exactly 2 symmetrically placed eyes with matching iris color/size, 1 nose with 2 nostrils, 1 mouth with natural lip proportions, 2 ears, correct teeth count and alignment. Hands must have exactly 5 fingers each with correct joint count (3 per finger, 2 for thumb). No extra/missing/fused/twisted digits. Skin must look natural with real pores, subtle imperfections, and proper subsurface scattering — never waxy, plastic, or uncanny-valley. Eyes must have proper catchlights, realistic sclera veining, natural pupil dilation, and correct gaze direction — never crossed, empty, or glazed. Face proportions must follow real human anatomy: proper eye spacing (~1 eye width apart), nose-to-chin ratio, forehead height, ear alignment with eyebrow-to-nose span.`

/** poz. 9 — blok tożsamości (bez części o tekstach z referencji nie dotyczących tej operacji) */
export const STUDIO_TOZSAMOSC =
  `Do not beautify, de-age, slim, symmetrize, airbrush, change ethnicity or alter facial/body proportions; never average faces between references. Never copy text, logos or watermarks from the references.`

/** poz. 26 — drugi przebieg (polish pass): wynik + oryginalna scena jako wzorzec. Do użycia w osobnym wywołaniu. */
export const STUDIO_SWAP_POLISH =
  `The FIRST image is a composite to repair. The SECOND image is the original plate — it is the ground truth for lighting, color grade, grain, depth of field and motion blur. Make the person in the first image look photographed by the same camera under the same light as the second image: match light direction and color temperature on skin, hair and clothing, match shadow density, add the missing contact and cast shadows, match white balance, saturation, black level and grain, and match the focus state and any motion blur at the person's depth. Remove every seam, halo, outline and brightness step at the person's edges. Do NOT sharpen. Do NOT brighten. Do NOT increase contrast globally. Preserve every out-of-focus and motion-blurred area exactly as in the plate, and keep identity, pose, composition, background and ALL text, watermarks, logos and overlays unchanged. Keep skin texture photographic: pores, vellus hair, natural asymmetry and grain — do not smooth, beautify or sharpen the face.`
