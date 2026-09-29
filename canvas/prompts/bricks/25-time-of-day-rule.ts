import type { Brick } from '../types'

/** ㉕ Pora dnia. */
export const TIME_OF_DAY_RULE: Brick = {
  id: 'time-of-day-rule',
  numer: 25,
  nazwa: 'Pora dnia',
  tekst: [
    `TIME OF DAY — rebuild the light physically: sun angle and shadow length, sky colour, one colour temperature across the frame, and glowing lamps and windows at dusk and night. Buildings, objects, terrain and perspective stay 100% as they were.`,
  ].join('\n'),
}
