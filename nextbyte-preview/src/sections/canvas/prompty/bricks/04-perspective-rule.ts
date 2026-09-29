import type { Brick } from '../types'

/** ④ Perspektywa — kamera, horyzont, punkty zbiegu. */
export const PERSPECTIVE_RULE: Brick = {
  id: 'perspective-rule',
  numer: 4,
  nazwa: 'Perspektywa',
  tekst: [
    `PERSPECTIVE — ALWAYS maximally realistic relative to the camera of {{IMAGE_TARGET}}: one camera, one viewpoint, one horizon.`,
    `- Re-draw the element as that camera sees it: the same camera height, tilt (a high or aerial camera looks DOWN at it and shows its top surfaces; a low camera looks up), focal length and lens distortion. Never keep the viewing angle of its source photo — a front-on or eye-level donor is fully rotated to the target view.`,
    `- The element sits on the ground plane at the right distance: its base follows the ground's perspective, its horizontal lines converge to the same vanishing points as the road, walls and ground around it, and its verticals lean exactly like the verticals of the scene.`,
    `- Its heading follows the lines of the surface it stands on (along the road, parallel to the wall or shelf), foreshortened correctly for that heading; parts nearer the camera are larger than parts farther away.`,
    `- Farther from the camera means smaller and slightly softer, along the same vanishing lines; the horizon line stays where it is.`,
  ].join('\n'),
}
