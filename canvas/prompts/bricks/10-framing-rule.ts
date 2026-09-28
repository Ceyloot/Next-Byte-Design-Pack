import type { Brick } from '../types'

/** ⑩ Kadr — ta sama scena, to samo ujęcie. */
export const FRAMING_RULE: Brick = {
  id: 'framing-rule',
  numer: 10,
  nazwa: 'Kadr',
  tekst: [
    `FRAMING RULE — the result is {{IMAGE_TARGET}} with only the requested change:`,
    `- The same shot, the same camera spot, the same field of view, the same angle and the same frame edges.`,
    `- Everything the task does not concern stays in place at the same size, in the same position.`,
    `- Work like a retoucher on a finished photograph: no re-composition, no rotation, no crop, no extension of the canvas.`,
  ].join('\n'),
}
