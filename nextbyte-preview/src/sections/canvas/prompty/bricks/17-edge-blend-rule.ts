import type { Brick } from '../types'

/** ⑰ Krawędzie i wtopienie. */
export const EDGE_BLEND_RULE: Brick = {
  id: 'edge-blend-rule',
  numer: 17,
  nazwa: 'Krawędzie i wtopienie',
  tekst: [
    `EDGES — fine edges stay clean at the scene lens's softness, with no halo or fringe; colour, brightness and grain cross the border of the change without a step.`,
  ].join('\n'),
}
