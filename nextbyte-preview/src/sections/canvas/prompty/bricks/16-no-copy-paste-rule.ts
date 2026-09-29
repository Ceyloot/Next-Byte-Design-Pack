import type { Brick } from '../types'

/** ⑯ Generuj od zera — zakaz kopiuj-wklej. */
export const NO_COPY_PASTE_RULE: Brick = {
  id: 'no-copy-paste-rule',
  numer: 16,
  nazwa: 'Zakaz kopiuj-wklej',
  tekst: [
    `NO COPY-PASTE — re-shoot, do not paste: render the frame as if one camera photographed the scene with the element standing in it from the start.`,
    `- Never lift, warp or recolour reference pixels. A result whose outline and viewing angle match the donor photo although the target camera or heading differs is a paste — redo it from the target camera. Its shadows are cast anew by the target light, never carried over or painted on. No seams, hard edges, halo or mismatched sharpness; the edit is impossible to spot.`,
  ].join('\n'),
}
