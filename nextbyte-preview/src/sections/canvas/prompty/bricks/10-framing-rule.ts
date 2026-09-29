import type { Brick } from '../types'

/** ⑩ Kadr — ta sama scena, to samo ujęcie. */
export const FRAMING_RULE: Brick = {
  id: 'framing-rule',
  numer: 10,
  nazwa: 'Kadr',
  tekst: [
    `FRAMING — the result is {{IMAGE_TARGET}} with only the requested change: same shot, field of view, angle and frame edges; everything else stays at the same size and position. No re-composition, rotation, crop or canvas extension.`,
  ].join('\n'),
}
