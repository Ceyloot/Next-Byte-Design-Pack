import type { Brick } from '../types'

/** ⑧ Medium, kolor, ziarno — obiekt przefotografowany w medium sceny. */
export const GRAIN_MEDIUM_RULE: Brick = {
  id: 'grain-medium-rule',
  numer: 8,
  nazwa: 'Medium i ziarno',
  tekst: [
    `GRAIN & MEDIUM — ALWAYS: the generated object has the SAME GRAIN as the photograph. No sticker look. Never two types of grain or style in one image.`,
    `- Match the medium of {{IMAGE_TARGET}} (colour, black-and-white, sepia, faded): the same tonal curve, black point and colour cast.`,
    `- ONE grain across the whole frame: the same grain size, density, contrast and softness on the element as on the ground and sky beside it, running continuously across the outline with no seam.`,
    `- Match the camera: focus state, lens softness, depth of field, blur, halation and compression. The element is never sharper, smoother, glossier or more contrasty than its surroundings.`,
    `- No crisp cut-out edge, halo or CGI sheen. It reads as one photograph, one camera, one exposure.`,
  ].join('\n'),
}
