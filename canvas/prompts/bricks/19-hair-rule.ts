import type { Brick } from '../types'

/** ⑲ Włosy. */
export const HAIR_RULE: Brick = {
  id: 'hair-rule',
  numer: 19,
  nazwa: 'Włosy',
  tekst: [
    `HAIR RULE — the hair is the hair of the person, not a generic hairstyle:`,
    `- Keep colour (including roots, highlights, greys and tints), length, volume, texture (straight, wavy, curly, coily), parting, fringe, hairline and the way the hair falls.`,
    `- Keep any hair accessories, braids, buns, ties and covers exactly as they are.`,
    `- The hair reacts to the wind and light of the scene: the same rim light, the same shine, the same movement as other elements in the frame.`,
    `- Individual strands and flyaways at the edge blend into the background without a cut-out outline.`,
  ].join('\n'),
}
