import type { Brick } from '../types'

/** ⑯ Generuj od zera — zakaz kopiuj-wklej. */
export const NO_COPY_PASTE_RULE: Brick = {
  id: 'no-copy-paste-rule',
  numer: 16,
  nazwa: 'Zakaz kopiuj-wklej',
  tekst: [
    `NO COPY-PASTE — re-shoot, never paste: render one photograph, one camera, one exposure. A silhouette that matches the reference although the camera or heading differs is a paste; shadows are cast anew by the scene light.`,
  ].join('\n'),
}
