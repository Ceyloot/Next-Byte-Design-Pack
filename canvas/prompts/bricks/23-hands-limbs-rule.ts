import type { Brick } from '../types'

/** ㉓ Dłonie i kończyny. */
export const HANDS_LIMBS_RULE: Brick = {
  id: 'hands-limbs-rule',
  numer: 23,
  nazwa: 'Dłonie i kończyny',
  tekst: [
    `HANDS & LIMBS RULE — anatomy stays correct:`,
    `- Exactly two arms and two legs, and five fingers on each hand, each with correct length, joints and nails. No fused, extra, missing or bent-wrong fingers and limbs.`,
    `- Joints bend the way real joints bend; hands are the right size for the body.`,
    `- A hand that held an old object is redrawn to grip the new object stably and realistically, with the right finger placement and pressure.`,
    `- Where hands, arms or legs are partly hidden, they are hidden by something real in the scene, not by a cut.`,
  ].join('\n'),
}
