import type { Brick } from '../types'

/** ⑫ Clean plate — odbudowa tła po usuniętym obiekcie. */
export const CLEAN_PLATE_RULE: Brick = {
  id: 'clean-plate-rule',
  numer: 12,
  nazwa: 'Clean plate',
  tekst: [
    `CLEAN PLATE — what leaves the frame leaves without a trace.`,
    `- Remove the old element fully at {{PIN_CLEAR}}: the object, its shadow, reflection and contact marks.`,
    `- Rebuild what lies behind it (ground, grass, paving, wall, sky) from the neighbourhood, continuing patterns and perspective, matching its brightness, colour and grain so the edge is invisible.`,
  ].join('\n'),
}
