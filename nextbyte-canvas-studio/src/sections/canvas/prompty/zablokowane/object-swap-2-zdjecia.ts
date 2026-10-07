/**
 * ZABLOKOWANE — OBJECT SWAP Z DWÓCH ZDJĘĆ (obiekt na Image 1 zastąpiony obiektem z Image 2).
 * Zatwierdzone przez użytkownika jako działające (test: GT40 → Mercedes). NIE ZMIENIAĆ bez jego wyraźnej prośby.
 * Teksty są kopiami — zmiany we wspólnych brickach, w operacje/object-swap.ts ani w analizie osadzania
 * w skladaj.ts NIE wpływają na ten tryb.
 *
 * Zablokowany jest też przepływ: model Gemini 3.1 (znacznik `gemini31` z `skladajPrompt`), zmierzony rozmiar
 * i analiza reżysera w [RULES] (rozmiar, skala, widok, ułożenie, opis miejsca i obiektu), strefy kadru w opisie pinu.
 */
import type { PineskaSklejka } from '../skladaj'

export const ZABLOKOWANA_TEMPERATURA_SWAP_OBIEKTU = 0.35

/** Rola modelu (systemPrompt). */
export const ZABLOKOWANY_SYSTEM_SWAP_OBIEKTU = `You are a high-end photographic compositor, not a copy-paste editor. You never cut out, paste, sticker or overlay a reference object into a plate. You RE-PHOTOGRAPH the object inside the target photograph: one exposure, one light set, one lens, one sensor, one color grade for the whole frame. Everything the edit does not touch stays as it was.`

/** Zadanie [TASK] (tokeny {{…}} podstawia skladaj.ts). Bez kroków — object_swap jest w BEZ_KROKOW. */
export const ZABLOKOWANA_MISJA_SWAP_OBIEKTU = `Replace the whole object at the x / y point of {{PIN_TARGET}} with the whole new object (from {{IMAGE_DONOR}}, or as described in the USER request), at its true size and as naturally as possible. The old object leaves completely; the new one stands exactly where it stood. The new object keeps its OWN shape, body, proportions and size — it never inherits the outline, silhouette, windows or height of the old one, and nothing of the old one is blended into it. It takes over the place of the old one exactly as it stood: the same heading and alignment to the lines of the surface it rests on, the same footprint centre — only its own length, width and height differ.`

/** Bricki [RULES] (z tokenami {{…}}). */
export const ZABLOKOWANE_BRICKI_SWAP_OBIEKTU: Record<string, string> = {
  'studio-referencja': `{{IMAGE_DONOR}} shows {{DONOR_ROLE}}. The subject is ONLY the thing at the source pin — nothing else of the reference comes along: not its neighbours, props, ground or background, nothing that touches or stands near it. Use it ONLY for the subject's visual identity — a person: facial features, face shape, hair, skin tone, age, body build; a product/object: exact shape, colors, materials, labels, branding and proportions — do not redesign it. Do NOT copy pose, camera angle, lighting or background from any reference, and never copy text, logos or watermarks from it. NEVER COPY THE REFERENCE PIXELS: do not cut, paste, transplant or reuse the reference picture of the object in any form (not its outline, not its viewing angle, not its lighting, not its blur or compression). Generate the object from zero together with the whole photograph, as if it had been standing in this scene when the photo was taken: seen from Image 1's camera angle, lit by Image 1's light, with Image 1's sharpness, grain and colour. If the result looks like the reference picture placed onto the scene, it is wrong.`,
  'studio-usuniecie': `The original element at {{PIN_CLEAR}} must be COMPLETELY removed — none of it may survive; whatever part of that spot is not taken over by a new subject placed there is filled naturally with what would be there without it, continuing the surroundings so nobody could tell anything ever stood there.`,
  'studio-miejsce': `Place the subject at {{PIN_TARGET}}, at its true real-world size and in the perspective of {{IMAGE_TARGET}}'s camera. THE POINT IS FIXED: the middle of the subject's footprint — where it touches the surface — is exactly at the pin's x / y; never move it toward the centre of the frame, to an easier spot or to a better-looking one. If a surface or object already exists at the pin and is not being replaced, the subject rests on that very thing — it is never rebuilt or imitated elsewhere; whatever the request says is to be replaced or removed there is removed, and the subject takes exactly its place. Its arrangement there is logical, exactly as it would really stand: base resting on the real surface, upright, following the slope and the lines of the scene, an elongated subject aligned with the direction of the surface it rests on, turned the way such an object naturally faces, scaled like the neighbouring things at the same depth — never floating, sunk, tilted, oversized or undersized, and never passing through, covering or fusing with any other object. If the exact point cannot hold it as it is, the ground immediately under it is shaped to hold it — the point itself never changes. Near the frame edge it may be partly cut off by the edge.`,
  'studio-scena': `FROM THE SCENE ({{IMAGE_TARGET}}) take everything else, unchanged: scene layout, every object and prop, camera angle, focal length, crop, framing and composition, and ALL text, watermarks, logos and signs reproduced EXACTLY. Everything obeys real-world logic: every part of every object is where it really is and works the way it really does — movable parts open, turn and hang only as they physically can on that real object, on its real side and in its real direction; nothing is mirrored, reversed or mechanically impossible.`,
  'studio-jedno-zdjecie': `ONE photograph captured in-camera, not a composite — RE-LIGHT AND RE-SHOOT the subject into the scene; the reference lighting is an identity document, not a look. Copy from the scene: key-light direction, height and color temperature, fill level, ambient bounce color, contrast ratio and shadow density. Add the shadows that lighting implies: a contact shadow where it meets the ground and a cast shadow pointing the same way as the scene's shadows, with the same edge sharpness. MATCH THE CAMERA AND THE FILM: same focus state and depth of field, same motion blur, white balance, grade, grain and haze — never sharper than the scene; photographic edges with no halo, outline or sticker look.`,
  'studio-czlowiek': `Do not beautify, de-age, slim, symmetrize, airbrush, change ethnicity or alter facial/body proportions. Anatomically correct: exactly 2 eyes with matching irises and catchlights that match the scene light, 5 fingers on each hand. Skin as photographed, never retouched — visible pores, fine vellus hair, natural redness and faint asymmetry, individual hair strands at the hairline, the same sensor grain over the face as over the rest of the frame. IDENTITY MAP: reproduce the reference face feature by feature — face shape and width, forehead and hairline, eye shape, size, tilt and exact spacing, brow shape and thickness, nose bridge, width and tip, lip shape and fullness, jaw, chin and cheekbones, ears, and every mark, mole, scar and asymmetry — so the person is instantly the same individual from any angle.`,
  'studio-kontrola': `FINAL CHECK: is the frame exactly the frame of Image 1 — same crop, same zoom, same field of view, even if the subject ends up small, with nothing in the scene cut away or missing? Is the subject lit by this scene, blurred like this scene, graded and grained like this scene, and casting a shadow into it? Where something was moved or replaced, is its old place free of it — does it appear only once? If not, redo. ONE photograph — one light, one lens, one grade.`,
}

const wsp = (v: number) => v.toFixed(2)

function slowaPolozenia(x: number, y: number, krotko = false): string {
  const poziom = x < 0.15 ? 'at the far left edge' : x < 0.35 ? 'in the left part' : x < 0.65 ? 'in the horizontal middle' : x < 0.85 ? 'in the right part' : 'at the far right edge'
  const pion = y < 0.15 ? 'at the very top' : y < 0.35 ? 'in the upper part' : y < 0.65 ? 'around the vertical middle' : y < 0.85 ? 'in the lower part' : 'at the very bottom'
  if (krotko) return `${pion} and ${poziom} of the frame`
  return `${pion} and ${poziom} of the frame (${Math.round(x * 100)}% of the way from the left edge, ${Math.round(y * 100)}% of the way down from the top)`
}

/** Odwołanie do pineski: miejsce docelowe dostaje strefę kadru słowami. */
export function zablokowanyOpisPineski(p: PineskaSklejka): string {
  const strefa = p.rola === 'target' ? `, ${slowaPolozenia(p.x, p.y, true)}` : ''
  return `Pin ${p.numer} (Image ${p.obraz}, x=${wsp(p.x)} y=${wsp(p.y)}${strefa})`
}

/** Linie [RULES] z analizą reżysera: zmierzony rozmiar, prawdziwy rozmiar, widok, ułożenie, opis miejsca i obiektu. */
export function zablokowaneLinieAnalizySwapu(
  w: { rozmiar?: string; skala?: string; widok?: string; ulozenie?: string },
  cel: PineskaSklejka | undefined,
  zrodlo: PineskaSklejka | undefined,
): string[] {
  return [
    w.rozmiar?.trim()
      ? `THE SIZE AT THE DESTINATION (measured from objects of known size in Image 1 — follow it, never the size the object has in its reference): ${w.rozmiar.trim()}`
      : '',
    w.skala?.trim() ? `THE REAL SIZE OF THE SUBJECT (analysed against objects of known size in Image 1 — never take its size from how large it appears in its reference): ${w.skala.trim()}` : '',
    w.widok?.trim() ? `HOW IT MUST APPEAR AT THE DESTINATION (from Image 1's camera and the surface it stands on — a different view in the reference is turned to match): ${w.widok.trim()}` : '',
    w.ulozenie?.trim() ? `THE LOGICAL ARRANGEMENT AT THE DESTINATION (analysed from Image 1's scene — follow it): ${w.ulozenie.trim()}` : '',
    cel && (cel.miejsce || cel.szczegoly) ? `THE DESTINATION SPOT (Pin ${cel.numer}): ${[cel.miejsce, cel.szczegoly].filter(Boolean).join(' ')}` : '',
    zrodlo?.szczegoly && zrodlo.obraz !== 1 ? `THE SUBJECT (Pin ${zrodlo.numer}): ${zrodlo.szczegoly}` : '',
  ].filter(Boolean)
}
