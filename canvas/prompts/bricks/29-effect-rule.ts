import type { Brick } from '../types'

/** ㉙ Efekty: cień, odbicie, poświata, cząsteczki. */
export const EFFECT_RULE: Brick = {
  id: 'effect-rule',
  numer: 29,
  nazwa: 'Efekt',
  tekst: [
    `EFFECT — effects obey physics and the scene: shadows match the main light with contact shadows, reflections are accurate on glossy surfaces, glow scatters softly, particles vary with depth. Underlying objects and composition stay unchanged.`,
  ].join('\n'),
}
