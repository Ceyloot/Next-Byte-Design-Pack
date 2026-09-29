import type { Brick } from '../types'

/** ㉒ Poza, kierunek głowy, wyraz twarzy. */
export const POSE_EXPRESSION_RULE: Brick = {
  id: 'pose-expression-rule',
  numer: 22,
  nazwa: 'Poza i mimika',
  tekst: [
    `POSE & EXPRESSION — the scene decides the pose: same posture, gesture, head tilt and gaze as at the destination; the donor's pose is never used. The face is redrawn to that head angle at the same size, with a natural expression, and interacts with the surroundings as before.`,
  ].join('\n'),
}
