import type { Brick } from '../types'

/** ④ Perspektywa — kamera, horyzont, punkty zbiegu. */
export const PERSPECTIVE_RULE: Brick = {
  id: 'perspective-rule',
  numer: 4,
  nazwa: 'Perspektywa',
  tekst: [
    `PERSPECTIVE RULE — one camera, one viewpoint:`,
    `- The element is drawn from the camera position, height, focal length and angle of {{IMAGE_TARGET}}. It is turned to that camera angle, never shown from the angle of its own source photo.`,
    `- Horizontal edges converge to the same vanishing points as the surrounding ground, walls and objects; verticals stay parallel to the verticals of the scene.`,
    `- The horizon line stays where it is; the element sits on the ground plane of the scene at the right distance from the camera, with correct foreshortening and lens distortion.`,
    `- Further from the camera means smaller and slightly softer, along the same vanishing lines.`,
  ].join('\n'),
}
