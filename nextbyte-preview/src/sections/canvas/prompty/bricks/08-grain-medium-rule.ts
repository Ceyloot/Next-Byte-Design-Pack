import type { Brick } from '../types'

/** ⑧ Medium, kolor, ziarno — obiekt przefotografowany w medium sceny. */
export const GRAIN_MEDIUM_RULE: Brick = {
  id: 'grain-medium-rule',
  numer: 8,
  nazwa: 'Medium i ziarno',
  tekst: [
    `GRAIN & MEDIUM — ONE grain across the frame: the element has the same grain size, density, contrast, softness, tonal curve, colour cast, focus and blur as the photograph — never sharper, smoother or glossier than its surroundings, no halo or cut-out edge, no sticker look.`,
  ].join('\n'),
}
