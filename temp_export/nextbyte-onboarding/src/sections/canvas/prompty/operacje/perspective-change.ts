import type { Operation } from '../types'

/**
 * ZMIANA PERSPEKTYWY / KADRU (PERSPECTIVE CHANGE) — to samo miejsce sfotografowane z innego punktu.
 *
 * Wszystkie pozostałe tryby edycji każą zachować kamerę, kąt, kadr i kompozycję (brick „studio-scena”).
 * Ten tryb jest dokładnie odwrotny: kamera MA się zmienić tak, jak mówi polecenie, a niezmienny jest ŚWIAT
 * (miejsce, obiekty, układ, światło, tożsamość rzeczy). Dlatego nie używa żadnych bricków — zakaz zmiany
 * kamery z nich w ogóle tu nie wchodzi. Złożenie promptu: `skladaj.ts` (sekcja „PERSPEKTYWA”).
 *
 * Polecenie z dwoma życzeniami („wstaw tutaj auto i zrób perspektywę z podjazdu”) idzie jednym przebiegiem:
 * dodatek jest umieszczony w miejscu pineski z Image 1 i pokazany już z nowej kamery.
 */
export const PERSPECTIVE_CHANGE: Operation = {
  id: 'perspective_change',
  nazwa: 'Zmień perspektywę',
  kiedyUzyc:
    'The CAMERA changes: the same place is shown from another viewpoint, height, direction or distance (it may also include adding or changing something). Polish triggers: zrób perspektywę z … / ujęcie z lotu ptaka / pokaż to z boku / widok z podjazdu / zmień kąt kamery.',
  bricks: [],
  dawca: 'opcjonalny',
  czystaPlyta: false,
  misja: `Re-photograph the place of {{IMAGE_TARGET}} from the new camera position described in the USER request.`,
  kroki: [],
}

/** Rola modelu (systemPrompt). */
export const SYSTEM_PERSPEKTYWY = `You are a virtual cinematographer and photographic compositor. Given one photograph of a real place, you place a new camera in that same place and photograph it again from a different position — you never stretch, warp, rotate, crop or re-skin the old frame. You think in 3D: the scene has a fixed geometry, and you only move the camera through it.`

/** Temperatura: wyżej niż przy edycjach lokalnych — nowe ujęcie wymaga dorysowania niewidocznych wcześniej części. */
export const TEMPERATURA_PERSPEKTYWY = 0.4

/**
 * Zadanie [TASK]. `pineski` — punkty z Image 1 (opisane słowami i współrzędnymi): jeśli polecenie coś w nich dodaje
 * albo zmienia, ma to powstać w tym samym miejscu świata, tylko widziane z nowej kamery.
 */
export function zadaniePerspektywy(opts: {
  pineski: { numer: number; x: number; y: number; nazwa?: string }[]
  dawcy: number[]
}): string {
  const wsp = (v: number) => v.toFixed(2)
  const pinezki = opts.pineski.length
    ? `\nPins mark real spots of the ORIGINAL view (Image 1) — ${opts.pineski
        .map((p) => `Pin ${p.numer}${p.nazwa?.trim() ? ` ("${p.nazwa.trim()}")` : ''} at x=${wsp(p.x)} y=${wsp(p.y)}`)
        .join('; ')}. They are NOT positions in the new frame: find the same real spot in the new view. If the USER request adds or changes something at a pin, it appears at that real spot, drawn for the new camera and visible in the frame when the new view includes that spot; if the camera is described as standing at or near a pin, the camera stays just beside it, so the added thing is seen from outside and not under the lens.`
    : ''
  const dawcy = opts.dawcy.length
    ? `\n${opts.dawcy.length === 1 ? `Image ${opts.dawcy[0]} is` : `Images ${opts.dawcy.join(', ')} are`} a reference only — it shows what the USER request asks to add; it is never the base photograph.`
    : ''
  return [
    `Image 1 is the ORIGINAL photograph of a real place.${dawcy}`,
    `Photograph the SAME place again from a NEW CAMERA POSITION, exactly as the USER request describes (where the camera stands, how high, which way it looks, how much of the scene must be in view). This is a new shot, not an edit of the old frame: the camera MAY move, turn, rise, drop and change its lens as the request says — the old angle, framing and crop are NOT kept.`,
    `THE WORLD STAYS THE SAME: the same place and layout, the same buildings, objects, vegetation, terrain and paths in the same real positions relative to each other, the same materials, colours, weather, time of day, light direction and mood. Everything visible in Image 1 keeps its true shape, size and place and is only seen from the new viewpoint, with correct parallax, foreshortening and occlusion. What the new camera could not see before is built plausibly and consistently with what Image 1 shows (same architectural style, materials, colours, details, proportions); what falls outside the new view simply leaves the frame. If the request says what must be in view (for example the whole house), it is fully in frame.${pinezki}`,
    `If the USER request also asks to add, remove or change something, do that too — once, at its real place, at its true size for its distance from the new camera — and everything else follows the new viewpoint.`,
  ].join('\n')
}

/** Reguły [RULES] — zamiast zakazu zmiany kamery: spójność nowego ujęcia. */
export const REGULY_PERSPEKTYWY = [
  `ONE real photograph from the new camera: new vanishing lines, horizon, lens perspective and depth of field; shadows keep their real direction in the world, so they turn with the view; the same light, white balance, colour grade, grain and sharpness as Image 1.`,
  `Never a distorted, stretched, mirrored or cropped copy of Image 1 pasted into the frame, never a collage and never Image 1 with a filter: every pixel is rendered fresh for the new viewpoint.`,
  `Do not invent unrelated objects, people or buildings, and leave no pin, marker, rectangle or text overlay anywhere in the result.`,
].join('\n')
