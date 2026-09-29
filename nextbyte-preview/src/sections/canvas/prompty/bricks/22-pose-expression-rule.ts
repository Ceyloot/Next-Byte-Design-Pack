import type { Brick } from '../types'

/** ㉒ Poza, kierunek głowy, wyraz twarzy. */
export const POSE_EXPRESSION_RULE: Brick = {
  id: 'pose-expression-rule',
  numer: 22,
  nazwa: 'Poza i mimika',
  tekst: [
    `POSE & EXPRESSION — the pose, gesture, head tilt and gaze of the destination stay; the face is redrawn to that angle at the same size with a natural expression.`,
  ].join('\n'),
}
