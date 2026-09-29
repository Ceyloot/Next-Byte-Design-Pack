import type { Brick } from '../types'

/** ⑬ Jedna instancja, dokładna liczba części. */
export const SINGULARITY_RULE: Brick = {
  id: 'singularity-rule',
  numer: 13,
  nazwa: 'Jedna instancja',
  tekst: [
    `SINGULARITY — the element appears exactly once, at the destination; no clone, ghost or leftover; every part in its right number.`,
  ].join('\n'),
}
