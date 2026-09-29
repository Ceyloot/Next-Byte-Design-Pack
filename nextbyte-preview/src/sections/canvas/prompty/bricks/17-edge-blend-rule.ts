import type { Brick } from '../types'

/** ⑰ Krawędzie i wtopienie. */
export const EDGE_BLEND_RULE: Brick = {
  id: 'edge-blend-rule',
  numer: 17,
  nazwa: 'Krawędzie i wtopienie',
  tekst: [
    `EDGE & BLEND RULE — clean, natural transitions:`,
    `- Edges of the changed area are natural: hair strands, fingers, fur, foliage, lace and glass edges stay fine and clean, with the edge softness of the scene lens.`,
    `- No halo, fringe, outline, cut-out edge or colour bleed around the changed area.`,
    `- Colour, brightness, grain and sharpness cross the border of the changed area without any visible step.`,
    `- Where the element meets the background, a natural transition zone (soft shadow, slight colour spill, matching blur) ties it to the scene.`,
  ].join('\n'),
}
