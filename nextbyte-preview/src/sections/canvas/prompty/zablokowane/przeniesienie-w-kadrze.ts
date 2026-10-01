/**
 * ZABLOKOWANE — PRZENIESIENIE / ZAMIANA OBIEKTU W OBRĘBIE JEDNEGO ZDJĘCIA (obie pineski na Image 1).
 * Zamrożone „póki co” na życzenie użytkownika. NIE ZMIENIAĆ bez jego wyraźnej prośby o zmianę
 * tej logiki. Teksty są kopiami — zmiany we wspólnych brickach ani w skladaj.ts NIE wpływają na ten tryb.
 *
 * Zablokowany jest cały przepływ: prompt zadania (poniżej), bricki [RULES] (poniżej), temperatura,
 * model (object swap w kadrze → Gemini 3.1, klasa `gemini31` w CanvasSection/runware-proxy; przeniesienie → Lite),
 * brak kropek na zdjęciach, szczegółowe opisy od reżysera (`szczegoly`, tryb `opis` w runware-proxy),
 * wyliczanie pinu docelowego (`zrodlaNaCelu` w CanvasSection).
 */
import type { PineskaSklejka } from '../skladaj'

export const ZABLOKOWANA_TEMPERATURA_W_KADRZE = 0.35

/** Rola modelu (systemPrompt) — zamrożona kopia SYSTEM_KOMPOZYTORA. */
export const ZABLOKOWANY_SYSTEM_W_KADRZE = `You are a high-end photographic compositor, not a copy-paste editor. You never cut out, paste, sticker or overlay a reference object into a plate. You RE-PHOTOGRAPH the object inside the target photograph: one exposure, one light set, one lens, one sensor, one color grade for the whole frame. Everything the edit does not touch stays as it was.`

const wsp = (v: number) => v.toFixed(2)

function opisPineski(p: PineskaSklejka): string {
  return `Pin ${p.numer} (Image ${p.obraz}, x=${wsp(p.x)} y=${wsp(p.y)})`
}

function slowaPolozenia(x: number, y: number): string {
  const poziom = x < 0.15 ? 'at the far left edge' : x < 0.35 ? 'in the left part' : x < 0.65 ? 'in the horizontal middle' : x < 0.85 ? 'in the right part' : 'at the far right edge'
  const pion = y < 0.15 ? 'at the very top' : y < 0.35 ? 'in the upper part' : y < 0.65 ? 'around the vertical middle' : y < 0.85 ? 'in the lower part' : 'at the very bottom'
  return `${pion} and ${poziom} of the frame (${Math.round(x * 100)}% of the way from the left edge, ${Math.round(y * 100)}% of the way down from the top)`
}

/** Zadanie [TASK] — zamrożona kopia. */
export function zablokowaneZadanieWKadrze(opId: string, zrodlo: PineskaSklejka, cel: PineskaSklejka): string {
  const op = { id: opId }
  const co = zrodlo.nazwa ? `the ${zrodlo.nazwa}` : 'the object'
    // Szczegółowe opisy od reżysera: CO przenosimy i DOKŁADNIE GDZIE — identyfikacja obiektu i pozycji słowami.
    const opisZrodla = [zrodlo.szczegoly, zrodlo.miejsce].filter(Boolean).join(' ')
    const opisCelu = [cel.miejsce, cel.szczegoly].filter(Boolean).join(' ')
  return [
    `MOVE within Image 1 — two edits, in this exact order: STEP 1 ERASE, then STEP 2 PLACE.`,
    `TAKE the object at ${opisPineski(zrodlo)} (${slowaPolozenia(zrodlo.x, zrodlo.y)})${opisZrodla ? `: ${opisZrodla}` : ''} OUT of its place, and PUT it at ${opisPineski(cel)} (${slowaPolozenia(cel.x, cel.y)})${opisCelu ? `: ${opisCelu.replace(/\.+$/, '')}` : ''}. It is one object that changes place: ${co} is picked up from Pin ${zrodlo.numer} and set down at Pin ${cel.numer}.`,
    `STEP 1 — ERASE (do this first, before anything else): delete the object at Pin ${zrodlo.numer} completely — not a single part of it stays there, no matter how well it would look; the spot is rebuilt with what would be there without it (ground, grass, wall, sky), continuing the surroundings, so nobody could tell anything stood there.`,
    `STEP 2 — PLACE (only after step 1 has left Pin ${zrodlo.numer} empty): put the erased object at Pin ${cel.numer}: the middle of its footprint lands exactly on that point, in that very part of the frame — never beside it, never nearer the centre; if there is too little room it is made smaller or the ground shaped. ${op.id === 'object_swap' ? 'What stands there now is removed completely and the object takes exactly its place.' : 'If a surface or object already stands at that point and the request does not say to replace it, the object rests on it.'} It is EXACTLY the same object — every part, shape, material, colour and detail as now, redrawn from nothing else; only its size and angle adapt to the new spot (scaled for its distance from the camera, seen from Image 1's camera), standing logically: base on the real surface, upright, following the ground and the scene's lines, never floating, sunk or passing through other objects.`,
    `Result: the object appears exactly once — at Pin ${cel.numer}, and no longer at Pin ${zrodlo.numer}. Leaving it at Pin ${zrodlo.numer} is a failure; removing it without placing it at Pin ${cel.numer} is the same failure. Nothing else in the photo changes.`,
  ].join('\n')
}

/** Bricki [RULES] w trybie przeniesienia w kadrze — zamrożone kopie tekstów (z tokenami {{…}}). */
export const ZABLOKOWANE_BRICKI_W_KADRZE: Record<string, string> = {
  'studio-referencja': ``,
  'studio-usuniecie': ``,
  'studio-miejsce': `Where the exact point cannot hold the object, the ground right under it is shaped to hold it — the point never changes. Aligned with the surface and the slope, scaled like neighbouring things at the same depth. Near the frame edge it may be partly cut off.`,
  'studio-scena': `FROM THE SCENE take everything else unchanged: layout, every object, camera angle, crop, framing, and ALL text, logos and signs exactly. Real-world logic everywhere: nothing mirrored, reversed or mechanically impossible.`,
  'studio-jedno-zdjecie': `ONE photograph captured in-camera, not a composite: re-light and re-shoot the subject — scene's light direction, colour temperature and contrast, a contact shadow and a cast shadow like the scene's, the same focus, grain and haze; never sharper than the scene, no halo, outline or sticker look.`,
  'studio-czlowiek': `If the subject is a person: keep the face, body and clothing exactly as they are, anatomically correct, skin as photographed with the scene's grain, no retouching.`,
  'studio-kontrola': `FINAL CHECK: the frame is exactly Image 1's frame; the object stands at the destination, lit and grained like the scene, with a shadow; its old place is free of it and it appears only once. If not, redo.`,
}
