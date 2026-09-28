import type { Brick } from '../types'

/** ③ Skala — prawdziwy rozmiar z kotwic sceny. */
export const SCALE_RULE: Brick = {
  id: 'scale-rule',
  numer: 3,
  nazwa: 'Skala',
  tekst: [
    `SCALE RULE — true real-world size, judged from the scene:`,
    `- Render the element at its TRUE real-world size (see the dimensions in SCENE DETAILS). Judge it against a known-size reference that is actually visible near the spot: a hand, a person, a door, a cup, a tile, a window, a car. State the comparison with a number to yourself before drawing.`,
    `- The marked area is a boundary, not a quota: never inflate the element to fill it, never shrink it to fit.`,
    `- A replacement element has its OWN size, never the outline of the element it replaces. A larger element rises higher or reaches further and hides more of what is behind it; a smaller one reveals more of the rebuilt background.`,
    `- When no anchor of known size is near, choose the smaller plausible size and set the element deeper in the scene.`,
    `- Show the element complete. If at its real size it would cross the frame edge, set it slightly deeper in the scene — never cut it off and never shrink it below its real size.`,
    `- Keep a comfortable margin from the frame edges so no part is clipped.`,
  ].join('\n'),
}
