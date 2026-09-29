import type { Brick } from '../types'

/** ⑬ Jedna instancja, dokładna liczba części. */
export const SINGULARITY_RULE: Brick = {
  id: 'singularity-rule',
  numer: 13,
  nazwa: 'Jedna instancja',
  tekst: [
    `SINGULARITY — the moved, replaced or added element appears EXACTLY ONCE, at the destination. No clone, ghost or leftover anywhere else. Each element has the right number of parts (two eyes, four wheels, five fingers).`,
  ].join('\n'),
}
