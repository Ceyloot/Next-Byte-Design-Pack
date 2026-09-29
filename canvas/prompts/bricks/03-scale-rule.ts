import type { Brick } from '../types'

/** ③ Skala — prawdziwy rozmiar z kotwic sceny. */
export const SCALE_RULE: Brick = {
  id: 'scale-rule',
  numer: 3,
  nazwa: 'Skala',
  tekst: [
    `SCALE — true real-world size, judged against known-size things near the spot (see SCALE). Distance changes the share of the frame, never the real size; never inflate to fill an area or shrink to fit. Show it complete, inside the frame.`,
  ].join('\n'),
}
