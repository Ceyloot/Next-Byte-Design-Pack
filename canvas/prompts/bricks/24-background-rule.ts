import type { Brick } from '../types'

/** ㉔ Zmiana tła — pierwszy plan zostaje, otoczenie się zmienia. */
export const BACKGROUND_RULE: Brick = {
  id: 'background-rule',
  numer: 24,
  nazwa: 'Tło',
  tekst: [
    `BACKGROUND RULE — only the surroundings change:`,
    `- The foreground subjects keep exactly the same position, scale, pose, crop and identity, with the same camera angle, framing and perspective.`,
    `- The horizon of the new environment sits at the same height as in {{IMAGE_TARGET}}, so the camera height is unchanged.`,
    `- The ground of the new environment continues under the subjects so that their feet rest on it naturally, with contact shadows in the direction of the new light.`,
    `- Relight the subjects for the new environment: key-light direction and colour temperature come from the new background, with a rim light on edges facing bright areas and subtle colour bounce on skin and clothing.`,
    `- The depth of field matches the lens: a background that was soft stays equally soft in the new environment.`,
    `- Edges around hair, fingers and fine details stay clean with a natural transition into the new background.`,
  ].join('\n'),
}
