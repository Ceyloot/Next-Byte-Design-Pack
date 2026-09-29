import type { Brick } from '../types'

/** ⑱ Tożsamość postaci — wygląd A do Z. */
export const CHARACTER_IDENTITY_RULE: Brick = {
  id: 'character-identity-rule',
  numer: 18,
  nazwa: 'Tożsamość postaci',
  tekst: [
    `CHARACTER IDENTITY — the person is instantly recognisable as the person from {{IMAGE_DONOR}}: face shape, eyes, brows, nose, mouth, ears, skin tone, freckles, moles, scars, facial hair, apparent age and build.`,
    `- The face is redrawn to the head angle of the destination, never beautified, aged, smoothed or averaged into a generic face.`,
  ].join('\n'),
}
