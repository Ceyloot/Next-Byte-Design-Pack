import type { Brick } from '../types'

/** ⑩ Kadr — ta sama scena, to samo ujęcie. */
export const FRAMING_RULE: Brick = {
  id: 'framing-rule',
  numer: 10,
  nazwa: 'Kadr',
  tekst: [
    `FRAMING — the result is {{IMAGE_TARGET}} with only the requested change: same shot, angle and frame edges; everything else keeps its size and position.`,
  ].join('\n'),
}
