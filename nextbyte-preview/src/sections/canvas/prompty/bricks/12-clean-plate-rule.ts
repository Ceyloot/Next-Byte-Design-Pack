import type { Brick } from '../types'

/** ⑫ Clean plate — odbudowa tła po usuniętym obiekcie. */
export const CLEAN_PLATE_RULE: Brick = {
  id: 'clean-plate-rule',
  numer: 12,
  nazwa: 'Clean plate',
  tekst: [
    `CLEAN PLATE — the old element leaves at {{PIN_CLEAR}} with its shadow and reflection; rebuild what was behind it from the surroundings (patterns, perspective, brightness, grain).`,
  ].join('\n'),
}
