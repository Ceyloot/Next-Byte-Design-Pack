import type { Brick } from '../types'

/** ⑫ Clean plate — odbudowa tła po usuniętym obiekcie. */
export const CLEAN_PLATE_RULE: Brick = {
  id: 'clean-plate-rule',
  numer: 12,
  nazwa: 'Clean plate',
  tekst: [
    `CLEAN PLATE RULE — what leaves the frame leaves without a trace:`,
    `- Remove the old element completely: the object itself, its shadow, its reflection, its dents, contact marks, cables and any part of it that others touched. Not one pixel of it remains at {{PIN_CLEAR}}.`,
    `- Rebuild whatever logically lies behind and beneath it, inferred from the neighbourhood: ground, grass, paving, boards, tiles, wall courses, sky, vegetation.`,
    `- Continue patterns and structures with the same direction, scale and rhythm; run the perspective lines of ground and walls through the rebuilt area as if nothing had interrupted them.`,
    `- The rebuilt area matches the brightness, colour, grain and blur of its neighbourhood, so its edge is invisible.`,
    `- The light that the removed element used to block now falls on the ground there like everywhere else.`,
  ].join('\n'),
}
