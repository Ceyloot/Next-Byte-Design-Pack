import type { Brick } from '../types'

/** ㉘ Tekstura / materiał. */
export const TEXTURE_RULE: Brick = {
  id: 'texture-rule',
  numer: 28,
  nazwa: 'Tekstura i materiał',
  tekst: [
    `TEXTURE RULE — a new material on the same geometry:`,
    `- Apply the new texture over the exact surface geometry, preserving all 3D contours, curvature, bevels and perspective.`,
    `- Scale the grain and pattern realistically for the scene dimensions and camera distance, without stretching.`,
    `- Blend the texture boundary smoothly into adjoining surfaces with no hard seam.`,
    `- Keep all hardware, seams, fixtures, buttons and structural details intact.`,
    `- Reflectivity, specularity and ambient occlusion follow the new material under the existing scene light.`,
  ].join('\n'),
}
