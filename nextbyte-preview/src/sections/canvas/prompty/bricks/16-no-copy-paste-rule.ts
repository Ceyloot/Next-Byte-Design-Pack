import type { Brick } from '../types'

/** ⑯ Generuj od zera — zakaz kopiuj-wklej. */
export const NO_COPY_PASTE_RULE: Brick = {
  id: 'no-copy-paste-rule',
  numer: 16,
  nazwa: 'Zakaz kopiuj-wklej',
  tekst: [
    `NO COPY-PASTE RULE — generate from scratch:`,
    `- Re-shoot, do not paste: render the whole frame as if the camera had photographed the scene with the element standing in it from the start — one shot, one lens, one exposure.`,
    `- The element is drawn anew, pixel by pixel, as a native part of this photograph. It is forbidden to copy, cut, lift, warp or paste the pixels of the element from a reference and merely recolour or resize them.`,
    `- A recoloured cut-out is always wrong: no pasted look, no hard edges, no seams, no halo, no mismatched sharpness.`,
    `- The edit must be impossible to spot.`,
  ].join('\n'),
}
