import type { Brick } from '../types'

/** ⑤ Głębia i przesłanianie. */
export const DEPTH_OCCLUSION_RULE: Brick = {
  id: 'depth-occlusion-rule',
  numer: 5,
  nazwa: 'Głębia i przesłanianie',
  tekst: [
    `DEPTH — closer things overlap it and it overlaps what is behind; it takes the sharpness and haze of its depth plane; occlusion is natural and nothing clips through it.`,
  ].join('\n'),
}
