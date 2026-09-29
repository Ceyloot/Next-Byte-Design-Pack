import type { Brick } from '../types'

/** ⑱ Tożsamość postaci — wygląd A do Z. */
export const CHARACTER_IDENTITY_RULE: Brick = {
  id: 'character-identity-rule',
  numer: 18,
  nazwa: 'Tożsamość postaci',
  tekst: [
    `CHARACTER IDENTITY — instantly the person from {{IMAGE_DONOR}}: face shape, eyes, brows, nose, mouth, ears, skin marks, facial hair, age and build; the face is turned to the destination head angle, never beautified or averaged.`,
  ].join('\n'),
}
