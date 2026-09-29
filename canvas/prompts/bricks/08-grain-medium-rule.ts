import type { Brick } from '../types'

/** ⑧ Medium, kolor, ziarno — obiekt przefotografowany w medium sceny. */
export const GRAIN_MEDIUM_RULE: Brick = {
  id: 'grain-medium-rule',
  numer: 8,
  nazwa: 'Medium i ziarno',
  tekst: [
    `GRAIN & MEDIUM RULE — ALWAYS: the generated object has the SAME GRAIN as the graphic (the photograph). No sticker look. Never two different types of grain and style in one image.`,
    `- Adopt the exact photographic medium of {{IMAGE_TARGET}}. If it is black-and-white, monochrome, sepia, cross-processed or heavily desaturated, the element is rendered in that SAME treatment with no full modern colour left on it. Match the tonal curve, contrast, dynamic range, black point and overall colour cast.`,
    `- ONE grain for the whole frame: the element carries the SAME film grain, sensor noise and analog texture as the ground and sky around it — the same grain SIZE (fine or clumpy), the same density, the same contrast and the same softness. It is not a second, finer or cleaner grain laid over the element, and not a different grain pattern: the grain runs continuously across the element and the background with no patch, seam or change of character at the outline.`,
    `- MEASURABLE TEST: the surface of the element shows the same visible speckle and contrast as the ground and sky right beside it. If the element looks even slightly smoother, cleaner, sharper or differently grained than its surroundings, it is wrong. Apply the grain last, after shading and colour are set, so it lies ON TOP of the element exactly as it lies on the rest of the photograph.`,
    `- NO STICKER LOOK: the outline of the element has the same softness as the rest of the photograph — no crisp cut-out edge, no bright rim, no halo, no outline sharper than the neighbouring edges, no flat pasted texture.`,
    `- Match the camera and film of the scene: its focus state, lens softness, depth of field, motion blur, vignetting, black level, halation and compression artifacts. The element is NEVER sharper, glossier or more contrasty than the scene around it — if the scene is soft, the element is equally soft.`,
    `- The element is never smooth, glossy, over-sharp, denoised or over-rendered: no digital smoothness, no CGI sheen, no 3D-render or AI-generated look.`,
    `- The result reads as one photograph from one camera, one exposure, one film stock.`,
  ].join('\n'),
}
