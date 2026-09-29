import type { Brick } from '../types'

/** ② Pozycja — pod pineską, w pozycji zastępowanego obiektu. */
export const POSITION_RULE: Brick = {
  id: 'position-rule',
  numer: 2,
  nazwa: 'Pozycja',
  tekst: [
    `POSITION RULE — the element lands exactly where the pin says:`,
    `- The element takes EXACTLY the position of {{PIN_TARGET}}. The PIN MAP describes that spot in words — what it is, what it stands on and what is around it. For an element that rests on something, its base or point of contact meets the ground or supporting surface at exactly that spot and its footprint is centred there — not drifted sideways, not pushed to another part of the frame. For an element that is airborne, floating or hanging (a bird, an aircraft, a balloon, a lamp), the pin marks where the CENTRE of the element sits in the air, and no ground contact is invented. Landing at the described spot is a top priority.`,
    `- PRIORITY WHEN RULES COMPETE: (1) the described spot, (2) the element shown complete, (3) the room left for neighbours. Nearby subjects never pull the element off the described spot — they stay where they are and the element stands on the free ground at the spot itself.`,
    `- NEAR THE FRAME EDGE: when the spot is close to an edge and the element is wide, keep its contact point on the spot as far as the frame allows; shift it inward only as far as needed to keep the element whole. Inward means away from the edge — never toward a neighbouring subject.`,
    `- When it replaces something, it inherits the position, footprint, orientation, rotation and facing direction of what stood there.`,
    `- When it is moved, it appears at the destination pin ({{PIN_TARGET}}) and nowhere else; the old spot ({{PIN_CLEAR}}) is left empty.`,
    `- It aligns to the natural lines and flow of the surface it rests on and stands on a stable, natural footprint.`,
  ].join('\n'),
}
