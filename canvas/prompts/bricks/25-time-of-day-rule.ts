import type { Brick } from '../types'

/** ㉕ Pora dnia. */
export const TIME_OF_DAY_RULE: Brick = {
  id: 'time-of-day-rule',
  numer: 25,
  nazwa: 'Pora dnia',
  tekst: [
    `TIME OF DAY — rebuild the light physically (sun angle, shadow length, sky colour, one colour temperature, lit lamps at dusk and night); geometry and perspective stay.`,
  ].join('\n'),
}
