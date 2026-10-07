/**
 * ZABLOKOWANE — ZMIANA CZĘŚCI OBIEKTU (PART SWAP: część z referencji; PART CHANGE: część wg opisu w poleceniu).
 * „Póki co” zamrożone na życzenie użytkownika. NIE ZMIENIAĆ bez jego wyraźnej prośby. Teksty są kopiami —
 * zmiany we wspólnych brickach ani w skladaj.ts nie wpływają na ten tryb. Zablokowane też: pole `czesc` i `czesc_zakres`
 * od reżysera (ilość sztuk z semantyki polecenia), reguła światła na nowej części, model Gemini 3.1 (`gemini31`).
 */
import type { PineskaSklejka } from '../skladaj'
import { zablokowanyOpisPineski as opisPineski } from './object-swap-2-zdjecia'

export const ZABLOKOWANA_TEMPERATURA_CZESCI = 0.35

/** Rola modelu (systemPrompt). */
export const ZABLOKOWANY_SYSTEM_CZESCI = `You are a high-end photographic compositor, not a copy-paste editor. You never cut out, paste, sticker or overlay a reference object into a plate. You RE-PHOTOGRAPH the object inside the target photograph: one exposure, one light set, one lens, one sensor, one color grade for the whole frame. Everything the edit does not touch stays as it was.`

/** Bricki [RULES] używane w tym trybie (tylko te id). */
export const ZABLOKOWANE_ID_BRICKOW_CZESCI = ['studio-referencja', 'studio-scena', 'studio-jedno-zdjecie', 'studio-kontrola']

/** Zamrożone kopie tekstów bricków (z tokenami {{…}}). */
export const ZABLOKOWANE_BRICKI_CZESCI: Record<string, string> = {
  'studio-referencja': `{{IMAGE_DONOR}} shows {{DONOR_ROLE}}. The subject is ONLY the thing at the source pin — nothing else of the reference comes along: not its neighbours, props, ground or background, nothing that touches or stands near it. Use it ONLY for the subject's visual identity — a person: facial features, face shape, hair, skin tone, age, body build; a product/object: exact shape, colors, materials, labels, branding and proportions — do not redesign it. Do NOT copy pose, camera angle, lighting or background from any reference, and never copy text, logos or watermarks from it. NEVER COPY THE REFERENCE PIXELS: do not cut, paste, transplant or reuse the reference picture of the object in any form (not its outline, not its viewing angle, not its lighting, not its blur or compression). Generate the object from zero together with the whole photograph, as if it had been standing in this scene when the photo was taken: seen from Image 1's camera angle, lit by Image 1's light, with Image 1's sharpness, grain and colour. If the result looks like the reference picture placed onto the scene, it is wrong.`,
  'studio-usuniecie': `The original element at {{PIN_CLEAR}} must be COMPLETELY removed — none of it may survive; whatever part of that spot is not taken over by a new subject placed there is filled naturally with what would be there without it, continuing the surroundings so nobody could tell anything ever stood there.`,
  'studio-miejsce': `Place the subject at {{PIN_TARGET}}, at its true real-world size and in the perspective of {{IMAGE_TARGET}}'s camera. THE POINT IS FIXED: the middle of the subject's footprint — where it touches the surface — is exactly at the pin's x / y; never move it toward the centre of the frame, to an easier spot or to a better-looking one. If a surface or object already exists at the pin and is not being replaced, the subject rests on that very thing — it is never rebuilt or imitated elsewhere; whatever the request says is to be replaced or removed there is removed, and the subject takes exactly its place. Its arrangement there is logical, exactly as it would really stand: base resting on the real surface, upright, following the slope and the lines of the scene, an elongated subject aligned with the direction of the surface it rests on, turned the way such an object naturally faces, scaled like the neighbouring things at the same depth — never floating, sunk, tilted, oversized or undersized, and never passing through, covering or fusing with any other object. If the exact point cannot hold it as it is, the ground immediately under it is shaped to hold it — the point itself never changes. Near the frame edge it may be partly cut off by the edge.`,
  'studio-scena': `FROM THE SCENE ({{IMAGE_TARGET}}) take everything else, unchanged: scene layout, every object and prop, camera angle, focal length, crop, framing and composition, and ALL text, watermarks, logos and signs reproduced EXACTLY. Everything obeys real-world logic: every part of every object is where it really is and works the way it really does — movable parts open, turn and hang only as they physically can on that real object, on its real side and in its real direction; nothing is mirrored, reversed or mechanically impossible.`,
  'studio-jedno-zdjecie': `ONE photograph captured in-camera, not a composite — RE-LIGHT AND RE-SHOOT the subject into the scene; the reference lighting is an identity document, not a look. Copy from the scene: key-light direction, height and color temperature, fill level, ambient bounce color, contrast ratio and shadow density. Add the shadows that lighting implies: a contact shadow where it meets the ground and a cast shadow pointing the same way as the scene's shadows, with the same edge sharpness. MATCH THE CAMERA AND THE FILM: same focus state and depth of field, same motion blur, white balance, grade, grain and haze — never sharper than the scene; photographic edges with no halo, outline or sticker look.`,
  'studio-czlowiek': `Do not beautify, de-age, slim, symmetrize, airbrush, change ethnicity or alter facial/body proportions. Anatomically correct: exactly 2 eyes with matching irises and catchlights that match the scene light, 5 fingers on each hand. Skin as photographed, never retouched — visible pores, fine vellus hair, natural redness and faint asymmetry, individual hair strands at the hairline, the same sensor grain over the face as over the rest of the frame. IDENTITY MAP: reproduce the reference face feature by feature — face shape and width, forehead and hairline, eye shape, size, tilt and exact spacing, brow shape and thickness, nose bridge, width and tip, lip shape and fullness, jaw, chin and cheekbones, ears, and every mark, mole, scar and asymmetry — so the person is instantly the same individual from any angle.`,
  'studio-kontrola': `FINAL CHECK: is the frame exactly the frame of Image 1 — same crop, same zoom, same field of view, even if the subject ends up small, with nothing in the scene cut away or missing? Is the subject lit by this scene, blurred like this scene, graded and grained like this scene, and casting a shadow into it? Where something was moved or replaced, is its old place free of it — does it appear only once? If not, redo. ONE photograph — one light, one lens, one grade.`,
}

type Zakres = 'all' | 'one' | undefined

/** PART CHANGE: część wg opisu w poleceniu (bez referencji). */
export function zablokowanyPartChange(cz: string, cel: PineskaSklejka, zakres: Zakres): string {
  const w = { czescZakres: zakres }
  return [
      `PART CHANGE: On the object at ${opisPineski(cel)}, change ONLY its ${cz}, exactly as the USER request describes.`,
      w.czescZakres === 'one'
        ? `Change ONLY ONE ${cz}: the one at or nearest to the destination pin. Every other ${cz} of the object stays exactly as it was.`
        : `If the object has several of that part (a pair or a set), change EVERY one of them the same way; leaving any of them as it was is a failure.`,
      `A VISIBLE change is required: the ${cz} must clearly look as described, never like the old one, and it is fitted onto the same place of the object, in the object's own perspective, size and lighting.`,
      `LIGHT ON THE NEW ${cz.toUpperCase()}: it is lit ONLY by Image 1's light, exactly like the neighbouring parts of the same object. Wherever it faces away from the key light it stays in shadow, with only the scene's ambient and bounce light on it; its highlights and shadows fall in the same directions as those of the parts around it; its shiny or reflective surfaces reflect Image 1's own surroundings (sky, sun, ground, buildings), never the reference's reflections or studio lighting. It is never brighter, cleaner or more evenly lit than the original parts around it.`,
      `Everything else stays exactly as it is: the rest of the object, everything around it, the framing and all text.`,
  ].join('\n')
}

/** PART SWAP: część z referencji (pin źródłowy) na obiekcie pod pinem docelowym. */
export function zablokowanyPartSwap(cz: string, cel: PineskaSklejka, zrodlo: PineskaSklejka, zakres: Zakres): string {
  const w = { czescZakres: zakres }
  return [
      `PART SWAP: On the object at ${opisPineski(cel)}, replace ONLY its ${cz} with the ${cz} shown at ${opisPineski(zrodlo)}.`,
      w.czescZakres === 'one'
        ? `Replace ONLY ONE ${cz}: the one at or nearest to the destination pin. Every other ${cz} of the object stays exactly as it was.`
        : `If the object has several of that part (a pair or a set), replace EVERY one of them, each fitted onto its own place — the reference shows one example, and all the others follow its design (mirrored as their side requires). Leaving any of them as it was is a failure.`,
      `Copy the new ${cz} exactly from the reference — shape, design, glass, trim, colours and every detail — and fit it onto the same place of the object, in the object's own perspective, size and lighting. A VISIBLE change is required: the ${cz} of the object must now look like the reference, never like the old one.`,
      `LIGHT ON THE NEW ${cz.toUpperCase()}: it is lit ONLY by Image 1's light, exactly like the neighbouring parts of the same object. Wherever it faces away from the key light it stays in shadow, with only the scene's ambient and bounce light on it; its highlights and shadows fall in the same directions as those of the parts around it; its shiny or reflective surfaces reflect Image 1's own surroundings (sky, sun, ground, buildings), never the reference's reflections or studio lighting. It is never brighter, cleaner or more evenly lit than the original parts around it.`,
      `Everything else stays exactly as it is: the rest of the object, everything around it, the framing and all text.`,
  ].join('\n')
}
