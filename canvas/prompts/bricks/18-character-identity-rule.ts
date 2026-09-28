import type { Brick } from '../types'

/** ⑱ Tożsamość postaci — wygląd A do Z. */
export const CHARACTER_IDENTITY_RULE: Brick = {
  id: 'character-identity-rule',
  numer: 18,
  nazwa: 'Tożsamość postaci',
  tekst: [
    `CHARACTER IDENTITY RULE — the person is recognisable at first glance as the person from {{IMAGE_DONOR}}, every feature from A to Z:`,
    `- Face shape: oval, round, square or heart outline, forehead height and width, cheekbone prominence, jaw width and angle, chin shape and size.`,
    `- Eyes: shape, size, spacing, tilt, eyelid fold, eye colour, eyelash length, under-eye lines.`,
    `- Eyebrows: shape, thickness, arch, colour, spacing.`,
    `- Nose: bridge height and width, tip shape, nostril shape, length, profile.`,
    `- Mouth: lip fullness (upper and lower), cupid's bow, mouth width, corner shape, smile lines, teeth as visible.`,
    `- Ears: size, shape, position, lobe.`,
    `- Skin: tone and undertone, freckles, moles, scars, birthmarks, wrinkles, pores, blemishes, tattoos — every distinguishing mark stays where it is on the person.`,
    `- Facial hair: beard, stubble, moustache — density, length, colour, outline.`,
    `- Apparent age, gender presentation, build and height relative to the surroundings.`,
    `- The face is redrawn turned to the head angle of the destination, but never beautified, aged, slimmed, smoothed, stylised or averaged into a generic face.`,
  ].join('\n'),
}
