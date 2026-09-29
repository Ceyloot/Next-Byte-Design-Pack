import type { Brick } from '../types'

/** ⑬ Jedna instancja, dokładna liczba części. */
export const SINGULARITY_RULE: Brick = {
  id: 'singularity-rule',
  numer: 13,
  nazwa: 'Jedna instancja',
  tekst: [
    `SINGULARITY RULE — exactly once:`,
    `- The moved, replaced or added element appears EXACTLY ONCE in the final image, at the destination pin.`,
    `- No clone, mirror image, ghost, half-transparent copy or leftover of it remains anywhere else — least of all at the source location.`,
    `- Each element has the exact number of its own parts: two eyes, one nose, five fingers per hand, four wheels, one roof. No part is duplicated, mirrored or added.`,
  ].join('\n'),
}
