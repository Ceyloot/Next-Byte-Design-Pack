import type { Brick } from '../types'

/** ③ Skala — prawdziwy rozmiar z kotwic sceny. */
export const SCALE_RULE: Brick = {
  id: 'scale-rule',
  numer: 3,
  nazwa: 'Skala',
  tekst: [
    `SCALE — true real-world size, judged against something of known size that is visible near the spot (a person, door, window, tile, car).`,
    `- Use the size given in SCALE; distance changes how much of the frame it covers, never how big it is. The marked area is a boundary, not a quota: never inflate to fill it or shrink to fit.`,
    `- A replacement has its OWN size, never the outline of what it replaces.`,
    `- With no anchor nearby, use the typical real-world size of that kind of object — neither inflated nor shrunk. Show it complete, clear of the frame edge.`,
  ].join('\n'),
}
