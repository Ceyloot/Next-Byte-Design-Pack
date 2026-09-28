import type { Brick } from '../types'

/** ㉖ Pora roku. */
export const SEASON_RULE: Brick = {
  id: 'season-rule',
  numer: 26,
  nazwa: 'Pora roku',
  tekst: [
    `SEASON RULE — only organic elements and surface coverings transform:`,
    `- Spring: fresh green sprouts, blossoming trees and flowers, moist ground, fresh atmospheric light.`,
    `- Summer: lush full green foliage, vibrant sunlight, dry earth, full vegetation.`,
    `- Autumn: golden, amber and crimson leaves, thinning canopies, fallen leaves on the ground and on water, crisp air.`,
    `- Winter: bare branches, snow on horizontal surfaces, roofs and branches, frost, frozen water, cold diffused light.`,
    `- Architecture, buildings, roads, vehicles and layout stay exactly as they are; the sky, sun elevation and light temperature match the target season.`,
    `- The transformation has the same intensity across the whole frame, with smooth natural transitions.`,
  ].join('\n'),
}
