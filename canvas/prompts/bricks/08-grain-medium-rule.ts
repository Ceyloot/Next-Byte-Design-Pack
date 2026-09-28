import type { Brick } from '../types'

/** ⑧ Medium, kolor, ziarno — obiekt przefotografowany w medium sceny. */
export const GRAIN_MEDIUM_RULE: Brick = {
  id: 'grain-medium-rule',
  numer: 8,
  nazwa: 'Medium i ziarno',
  tekst: [
    `GRAIN & MEDIUM RULE — the element is re-photographed in the medium of the scene:`,
    `- Adopt the exact photographic medium of {{IMAGE_TARGET}}. If it is black-and-white, monochrome, sepia, cross-processed or heavily desaturated, the element is rendered in that SAME treatment with no full modern colour left on it. Match the tonal curve, contrast, dynamic range, black point and overall colour cast.`,
    `- Cover the element with the SAME film grain, sensor noise and analog texture: the same grain size, density and contrast, running continuously across the element and the background with no clean patch around it.`,
    `- Match sharpness, depth of field, motion blur, lens softness, vignetting and compression artifacts of the scene.`,
    `- The element is never smooth, glossy, over-sharp, denoised or over-rendered: no digital smoothness, no CGI sheen, no 3D-render or AI-generated look.`,
    `- The result reads as one photograph from one camera, one exposure, one film stock.`,
  ].join('\n'),
}
