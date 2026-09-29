import type { Brick } from '../types'

/** ② Pozycja — pod pineską, w pozycji zastępowanego obiektu. */
export const POSITION_RULE: Brick = {
  id: 'position-rule',
  numer: 2,
  nazwa: 'Pozycja',
  tekst: [
    `POSITION RULE — the element lands exactly where the pin says:`,
    `- The element takes EXACTLY the position of {{PIN_TARGET}}. The pin marks the point where its base or point of contact meets the ground or supporting surface; its footprint is centred on that point — not drifted sideways, not floating, not pushed to another part of the frame. Landing at the marked location is a top priority: the contact point of its base lies within about 3% of the frame width and height from the pin.`,
    `- PRIORITY WHEN RULES COMPETE: (1) the marked point, (2) the element shown complete, (3) the room left for neighbours. Nearby subjects never pull the element off the marked point — they stay where they are and the element stands on the free ground at the point itself.`,
    `- NEAR THE FRAME EDGE: when the marked point is close to an edge and the element is wide, keep the contact point on the marked point as far as the frame allows; shift it inward only by the smallest amount that keeps the element whole (usually a few percent of the frame). Inward means away from the edge — never toward a neighbouring subject.`,
    `- When it replaces something, it inherits the position, footprint, orientation, rotation and facing direction of what stood there.`,
    `- When it is moved, it appears at the destination pin ({{PIN_TARGET}}) and nowhere else; the old spot ({{PIN_CLEAR}}) is left empty.`,
    `- It aligns to the natural lines and flow of the surface it rests on and stands on a stable, natural footprint.`,
    `- The pin number, the X/Y percentages and the described place in the PIN MAP all describe the same point (0% = left / top edge of the image, 100% = right / bottom edge).`,
  ].join('\n'),
}
