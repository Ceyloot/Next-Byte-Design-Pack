import type { Brick } from '../types'

/** ② Pozycja — pod pineską, w pozycji zastępowanego obiektu. */
export const POSITION_RULE: Brick = {
  id: 'position-rule',
  numer: 2,
  nazwa: 'Pozycja',
  tekst: [
    `POSITION RULE — the element lands exactly where the pin says:`,
    `- The element takes EXACTLY the position of {{PIN_TARGET}}. The pin marks the point where its base or point of contact meets the ground or supporting surface; its footprint is centred on that point — not drifted sideways, not floating, not pushed to another part of the frame. Landing at the marked location is a top priority.`,
    `- When it replaces something, it inherits the position, footprint, orientation, rotation and facing direction of what stood there.`,
    `- When it is moved, it appears at the destination pin ({{PIN_TARGET}}) and nowhere else; the old spot ({{PIN_CLEAR}}) is left empty.`,
    `- It aligns to the natural lines and flow of the surface it rests on and stands on a stable, natural footprint.`,
    `- The pin number, the X/Y percentages and the described place in the PIN MAP all describe the same point (0% = left / top edge of the image, 100% = right / bottom edge).`,
  ].join('\n'),
}
