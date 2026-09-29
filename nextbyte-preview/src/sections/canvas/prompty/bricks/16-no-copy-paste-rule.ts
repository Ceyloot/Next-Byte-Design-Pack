import type { Brick } from '../types'

/** ⑯ Generuj od zera — zakaz kopiuj-wklej. */
export const NO_COPY_PASTE_RULE: Brick = {
  id: 'no-copy-paste-rule',
  numer: 16,
  nazwa: 'Zakaz kopiuj-wklej',
  tekst: [
    `NO COPY-PASTE — re-shoot, do not paste: render the frame as if one camera photographed the scene with the element standing in it from the start.`,
    `- Never lift, warp or recolour reference pixels. No seams, hard edges, halo or mismatched sharpness; the edit is impossible to spot.`,
  ].join('\n'),
}
