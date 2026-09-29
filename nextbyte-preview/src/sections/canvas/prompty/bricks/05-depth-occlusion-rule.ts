import type { Brick } from '../types'

/** ⑤ Głębia i przesłanianie. */
export const DEPTH_OCCLUSION_RULE: Brick = {
  id: 'depth-occlusion-rule',
  numer: 5,
  nazwa: 'Głębia i przesłanianie',
  tekst: [
    `DEPTH & OCCLUSION RULE — the element lives in the depth of the scene:`,
    `- Respect depth order: whatever is closer to the camera overlaps the element; the element overlaps whatever is behind it. Foreground subjects stay sharp and seal it out.`,
    `- An element on a background plane inherits that plane of the optical softness, lens blur (bokeh) and atmospheric haze; an element in the foreground is as sharp as the other foreground objects.`,
    `- Partial occlusion by grass, railings, furniture, people or leaves is natural and physically correct — no part is cut by a straight line and nothing clips through another object.`,
    `- Keep the spacing to neighbours: the element stands beside what is already there, each object on its own footprint.`,
  ].join('\n'),
}
