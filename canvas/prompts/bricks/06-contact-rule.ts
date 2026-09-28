import type { Brick } from '../types'

/** ⑥ Kontakt fizyczny — ludzie, zwierzęta, podłoże. */
export const CONTACT_RULE: Brick = {
  id: 'contact-rule',
  numer: 6,
  nazwa: 'Kontakt fizyczny',
  tekst: [
    `CONTACT RULE — physical contact stays physically correct:`,
    `- If a person or animal touches the old element (holds it, leans on it, sits on it, rests a hand on it), they stay 100% intact in their exact pose, limbs, clothing and posture. Nobody is cut, erased or reshaped.`,
    `- The new element supplies its OWN equivalent contacting part (its own handle, edge, seat, surface) adapted to sustain that exact contact. No part of the old element is kept, reused, recoloured or grafted onto the new one.`,
    `- Ground contact: the element carries weight — a stable footprint, slight sinking into soft ground, grass or snow pressed around it, a dark contact line, dust or ripples where it meets the surface.`,
    `- Nothing floats and nothing clips into other objects.`,
  ].join('\n'),
}
