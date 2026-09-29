import type { Brick } from '../types'

/** ④ Perspektywa — kamera, horyzont, punkty zbiegu. */
export const PERSPECTIVE_RULE: Brick = {
  id: 'perspective-rule',
  numer: 4,
  nazwa: 'Perspektywa',
  tekst: [
    `PERSPECTIVE — one camera: the element is drawn from the camera position, height, focal length and angle of {{IMAGE_TARGET}}, never from its source photo's angle.`,
    `- Its lines converge to the same vanishing points as the ground and walls around it; farther from the camera means smaller and slightly softer along the same lines.`,
  ].join('\n'),
}
