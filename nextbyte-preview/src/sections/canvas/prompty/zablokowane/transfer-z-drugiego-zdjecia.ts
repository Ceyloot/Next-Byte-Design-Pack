/**
 * ZABLOKOWANE — OBJECT TRANSFER Z DRUGIEGO ZDJĘCIA (obiekt z Image 2, miejsce na Image 1). Zatwierdzone przez użytkownika jako działające.
 * Pełna logika z commita dd2f587 (zadanie, bricki, rola modelu, temperatura, model Gemini 3.1) — TYLKO w tym trybie.
 * NIE ZMIENIAĆ bez wyraźnej prośby użytkownika. Teksty są kopiami — zmiany we wspólnych brickach ani w
 * operacje/object-transfer.ts NIE wpływają na ten tryb.
 *
 * Zmiany względem dd2f587 (na prośbę użytkownika): do bricka „Miejsce” dopisane jedno zdanie o perspektywie kamery Image 1;
 * Na prośbę użytkownika (test samochód → droga): do bricka „Miejsce” dopisane „THE POINT IS FIXED” (punkt ważniejszy niż pokazanie całego obiektu, może być uciety krawędzią, rozmiar wg odległości) oraz strefy kadru w opisie pinu docelowego (skladaj.ts).
 * lista przykładów powierzchni („a shelf, a radiator…”) zastąpiona ogólnym „whatever is there” (uogólnienie, bez przykładów).
 *
 * Dodane na prośbę użytkownika (skala): TYLKO zmierzony rozmiar w miejscu docelowym (horyzont + kotwice). Skala tekstowa, widok i ułożenie NIE idą — opis „prawdziwy rozmiar” bez perspektywy mylił model. Model: Gemini 3.1 (`google:4@3`) — znacznik `gemini31` z `skladajPrompt`.
 */

/** Zadanie [TASK] z dd2f587 (tokeny {{…}} podstawia skladaj.ts). Bez kroków — object_transfer jest w BEZ_KROKOW. */
export const ZABLOKOWANA_MISJA_TRANSFERU = `Generate the object shown at {{PIN_SOURCE}} from zero inside Image 1, standing exactly at the x / y point of {{PIN_TARGET}} with its real proportions, as if it had been in this scene when the photo was taken — never a copy of the reference picture. It appears exactly once.`

/** Rola modelu (systemPrompt) z dd2f587. */
export const ZABLOKOWANY_SYSTEM_TRANSFERU = `You are a high-end photographic compositor, not a copy-paste editor. You never cut out, paste, sticker or overlay a reference object into a plate. You RE-PHOTOGRAPH the object inside the target photograph: one exposure, one light set, one lens, one sensor, one color grade for the whole frame. Everything the edit does not touch stays as it was.`

export const ZABLOKOWANA_TEMPERATURA_TRANSFERU = 0.35

/** Bricki [RULES] z dd2f587 (z tokenami {{…}}). */
export const ZABLOKOWANE_BRICKI_TRANSFERU: Record<string, string> = {
  'studio-referencja': `{{IMAGE_DONOR}} shows {{DONOR_ROLE}}. Use it ONLY for the subject's visual identity — a person: facial features, face shape, hair, skin tone, age, body build; a product/object: exact shape, colors, materials, labels, branding and proportions — do not redesign it. Do NOT copy pose, camera angle, lighting or background from any reference, and never copy text, logos or watermarks from it. NEVER COPY THE REFERENCE PIXELS: do not cut, paste, transplant or reuse the reference picture of the object in any form (not its outline, not its viewing angle, not its lighting, not its blur or compression). Generate the object from zero together with the whole photograph, as if it had been standing in this scene when the photo was taken: seen from Image 1's camera angle, lit by Image 1's light, with Image 1's sharpness, grain and colour. If the result looks like the reference picture placed onto the scene, it is wrong.`,
  'studio-usuniecie': `The original element at {{PIN_CLEAR}} must be COMPLETELY removed — none of it may survive.`,
  'studio-miejsce': `Place the subject at the exact location of {{PIN_TARGET}}, at its true real-world size and in the perspective of {{IMAGE_TARGET}}'s camera: correct size relative to the environment, contact points correctly placed in 3D space. Seat it logically: it rests on the surface at that point (the top of whatever is there), its base touching it, never floating in front of it and never dropped below it. Its perspective is exactly that of {{IMAGE_TARGET}}'s camera: the same viewing elevation and the same vanishing lines as the ground, buildings and surfaces around it — a reference photographed from a different angle is redrawn as {{IMAGE_TARGET}}'s camera would see the object right there, with matching foreshortening. THE POINT IS FIXED: the middle of the subject's footprint — where it touches the surface — is exactly at the pin's x / y; never move it toward the centre of the frame, to an easier spot or to a better-looking one. Placing it exactly at the point matters more than showing the whole subject: near the frame edge it may be partly cut off by the edge. Its size follows its distance from the camera at that point — the farther the point (higher in the frame, farther along the ground), the smaller the subject; never enlarge it to fill the free space nearby. SCALE BY COMPARISON: find things in Image 1 whose real size is known (people, doors, vehicles, posts, windows) — if the scene already holds an object of the same kind as the subject, it is the best reference — and size the subject exactly as such a thing would look standing at the same spot: judge the distance along the converging lines of the ground (road edges, fences, rows of objects) toward the vanishing point, where objects shrink steadily; a reference standing much closer to the camera than the destination is much larger in the frame than the subject must be.`,
  'studio-scena': `FROM THE SCENE ({{IMAGE_TARGET}}) take everything else, unchanged: scene layout, every object and prop, camera angle, focal length, crop, framing and composition, and ALL text, watermarks, logos and signs reproduced EXACTLY.`,
  'studio-jedno-zdjecie': `ONE photograph captured in-camera, not a composite — RE-LIGHT AND RE-SHOOT the subject into the scene; the reference lighting is an identity document, not a look. Copy from the scene: key-light direction, height and color temperature, fill level, ambient bounce color, contrast ratio and shadow density. Add the shadows that lighting implies: a contact shadow where it meets the ground and a cast shadow pointing the same way as the scene's shadows, with the same edge sharpness. MATCH THE CAMERA AND THE FILM: same focus state and depth of field, same motion blur, white balance, grade, grain and haze — never sharper than the scene; photographic edges with no halo, outline or sticker look.`,
  'studio-czlowiek': `Do not beautify, de-age, slim, symmetrize, airbrush, change ethnicity or alter facial/body proportions. Anatomically correct: exactly 2 eyes with matching irises and catchlights that match the scene light, 5 fingers on each hand. Skin as photographed, never retouched — visible pores, fine vellus hair, natural redness and faint asymmetry, individual hair strands at the hairline, the same sensor grain over the face as over the rest of the frame.`,
  'studio-kontrola': `FINAL CHECK: is the subject lit by this scene, blurred like this scene, graded and grained like this scene, and casting a shadow into it? If not, redo. ONE photograph — one light, one lens, one grade.`,
}

/** Linia rozmiaru w [RULES] — zmierzony rozmiar w miejscu docelowym (z horyzontem i kotwicami, ze względną miarą „N× szerokość X”). Bez tekstowych wymiarów obiektu. */
export function zablokowaneLinieSkaliTransferu(w: { rozmiar?: string }): string[] {
  return w.rozmiar?.trim()
    ? [`THE SIZE AT THE DESTINATION (measured from objects of known size in Image 1 — follow it, never the size the object has in its reference): ${w.rozmiar.trim()}`]
    : []
}
