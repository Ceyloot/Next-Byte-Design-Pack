import type { Brick } from '../types'

/** ㉙ Efekty: cień, odbicie, poświata, cząsteczki. */
export const EFFECT_RULE: Brick = {
  id: 'effect-rule',
  numer: 29,
  nazwa: 'Efekt',
  tekst: [
    `EFFECT — effects obey physics: shadows and reflections follow the main light, glow scatters softly, particles vary with depth; objects and composition stay.`,
  ].join('\n'),
}
