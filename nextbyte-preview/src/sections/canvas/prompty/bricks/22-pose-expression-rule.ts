import type { Brick } from '../types'

/** ㉒ Poza, kierunek głowy, wyraz twarzy. */
export const POSE_EXPRESSION_RULE: Brick = {
  id: 'pose-expression-rule',
  numer: 22,
  nazwa: 'Poza i mimika',
  tekst: [
    `POSE & EXPRESSION RULE — the scene decides the pose:`,
    `- The person keeps the exact pose of the scene at the destination pin: sitting, standing, lying, walking, leaning — the same body posture, gesture, head tilt and gaze direction. The pose of the donor photo is never used.`,
    `- The face is redrawn turned to that exact head angle and keeps the same size in the frame as the face it replaces.`,
    `- The expression stays natural and subtle, and follows the expression of the scene unless the task asks otherwise.`,
    `- The person interacts with the surroundings exactly as before: the same seat, the same handrail, the same object held.`,
  ].join('\n'),
}
