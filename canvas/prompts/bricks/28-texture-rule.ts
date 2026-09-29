import type { Brick } from '../types'

/** ㉘ Tekstura / materiał. */
export const TEXTURE_RULE: Brick = {
  id: 'texture-rule',
  numer: 28,
  nazwa: 'Tekstura i materiał',
  tekst: [
    `TEXTURE — apply the new material over the exact geometry, keeping contours, curvature and perspective; scale the pattern realistically, blend seams into adjoining surfaces, keep hardware and details, and let reflectivity follow the new material under the existing light.`,
  ].join('\n'),
}
