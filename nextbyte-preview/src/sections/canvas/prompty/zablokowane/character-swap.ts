/**
 * ZABLOKOWANE — CHARACTER SWAP (dwa różne zdjęcia: scena + referencja postaci).
 * Zatwierdzone przez użytkownika jako działające. NIE ZMIENIAĆ bez jego wyraźnej prośby
 * o zmianę character swapu. Teksty są zamrożonymi kopiami — zmiany we wspólnych brickach
 * (06-studio-czlowiek) ani w character-swap-studio.ts NIE wpływają na character swap.
 */

export const ZABLOKOWANY_SWAP_SYSTEM = `You are a high-end VFX character-replacement compositor, not a copy-paste editor. You never cut out, paste, sticker, overlay, mask or clone a reference person into a plate. You RE-PHOTOGRAPH the person inside the target plate: one exposure, one light set, one lens, one sensor, one color grade for the whole frame.`

const ZABLOKOWANY_OGON = `pose, posture, limb placement, head tilt, action; position, scale, perspective, camera angle, focal length, crop, composition; the whole background; and ALL text, watermarks, overlays, logos and signs reproduced EXACTLY. RE-LIGHT AND RE-SHOOT THE PERSON INTO THE SCENE — this decides the shot. Discard the reference lighting completely; it is an identity document, not a look. Copy from the scene onto the person: key-light direction, height and color temperature, fill level, ambient bounce color, rim light, contrast ratio and shadow density, and every warm or cool cast that falls on skin, hair and fabric elsewhere in the frame. Add the shadows that lighting implies: modelling shadows on the body, contact shadow where the person meets the ground, and a cast shadow of correct direction, length, softness and opacity. MATCH THE CAMERA: same distance from the lens as the person being replaced, same focus state — a shallow scene means the same depth-of-field falloff and bokeh on hair and shoulders. If the scene has motion blur, camera shake or panning streaks, the person MUST carry the same blur, same direction, same amount, on limbs, hair and clothing edges. NEVER render the person sharper than the scene. MATCH THE FILM: same white balance, grade, black level, highlight rolloff, saturation, grain size and strength, vignetting, chromatic aberration, flare, glow and atmospheric haze over the person as over the background. Edges must be photographic: no halo, no outline, no crisp silhouette against a soft background, no brightness step between person and scene.`

export function zablokowanaSwapBaza(refsClause: string, scena: string): string {
  return `REPLACE the person in the scene image (${scena}) with the person from ${refsClause}. The original person must be COMPLETELY removed — none of their face, body, clothing, headwear, glasses, jewellery or accessories may survive; the new person wears only what they wear in the character reference. The head is drawn anew on the scene body, never taken from the reference photo: its size in proportion to the body, turn, tilt, gaze direction and expression follow the original person in the scene, and the neck joins the shoulders naturally — the reference head's angle, framing, size, expression and lighting are never copied. FROM THE CHARACTER REFERENCE take ONLY identity: facial geometry, hair, body build, skin undertone, tattoos, scars, moles, and the exact garments and accessories (same cut, color, print, logo, lettering). FROM THE SCENE take everything else, unchanged: ` + ZABLOKOWANY_OGON
}

export function zablokowanaSwapBazaUbranieSceny(refsClause: string, scena: string): string {
  return `REPLACE the person in the scene image (${scena}) with the person from ${refsClause}. The original person must be COMPLETELY removed — none of their face or body may survive. FROM THE CHARACTER REFERENCE take ONLY identity: facial geometry, hair, body build, skin undertone, tattoos, scars, moles. Do NOT take the reference clothing, garments or accessories — ignore what the reference person wears entirely. FROM THE SCENE take everything else, unchanged: the ORIGINAL PERSON'S CLOTHING, garments, footwear and accessories exactly as worn (same cut, color, print, fit, drape and wrinkles, re-fitted naturally to the new body); ` + ZABLOKOWANY_OGON
}

export const ZABLOKOWANA_SWAP_KONTROLA = `FINAL CHECK: is the person lit by this scene, blurred like this scene, graded and grained like this scene, and casting a shadow into it? If not, redo. ONE photograph — one light, one lens, one grade — with the person from the character references.`

/** Zamrożona kopia bricka „Człowiek” (06) — jedyny brick w [RULES] character swapu. */
export const ZABLOKOWANY_BRICK_CZLOWIEK = `Do not beautify, de-age, slim, symmetrize, airbrush, change ethnicity or alter facial/body proportions. Anatomically correct: exactly 2 eyes with matching irises and catchlights that match the scene light, 5 fingers on each hand. Skin as photographed, never retouched — visible pores, fine vellus hair, natural redness and faint asymmetry, individual hair strands at the hairline, the same sensor grain over the face as over the rest of the frame. IDENTITY MAP: reproduce the reference face feature by feature — face shape and width, forehead and hairline, eye shape, size, tilt and exact spacing, brow shape and thickness, nose bridge, width and tip, lip shape and fullness, jaw, chin and cheekbones, ears, and every mark, mole, scar and asymmetry — so the person is instantly the same individual from any angle.`

export const ZABLOKOWANA_SWAP_TEMPERATURA = 0.45

/** Model character swapu (runware-proxy, klasa 'postac'). */
export const ZABLOKOWANY_MODEL_POSTACI = 'google:4@3'
