import type { Brick } from '../types'

/** ④ Perspektywa — kamera, horyzont, punkty zbiegu. */
export const PERSPECTIVE_RULE: Brick = {
  id: 'perspective-rule',
  numer: 4,
  nazwa: 'Perspektywa',
  tekst: [
    `PERSPECTIVE — drawn from the camera of {{IMAGE_TARGET}}: same height, tilt and focal length (a high camera looks down and shows top surfaces). Its base follows the ground perspective, its lines meet the scene's vanishing points, its heading follows the surface it stands on; farther means smaller and softer. Never the viewing angle of its source photo.`,
  ].join('\n'),
}
