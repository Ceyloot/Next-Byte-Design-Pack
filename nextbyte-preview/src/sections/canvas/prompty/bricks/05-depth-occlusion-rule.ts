import type { Brick } from '../types'

/** ⑤ Głębia i przesłanianie. */
export const DEPTH_OCCLUSION_RULE: Brick = {
  id: 'depth-occlusion-rule',
  numer: 5,
  nazwa: 'Głębia i przesłanianie',
  tekst: [
    `DEPTH & OCCLUSION — whatever is closer to the camera overlaps the element; it overlaps what is behind it.`,
    `- It takes the sharpness, blur and haze of its own depth plane. Partial occlusion by grass, people, railings or leaves is natural; nothing clips through another object or is cut by a straight line.`,
  ].join('\n'),
}
