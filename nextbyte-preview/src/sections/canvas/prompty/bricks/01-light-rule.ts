import type { Brick } from '../types'

/** ① Światło, cienie, promienie, odbicia — obiekt zawsze świeci jak scena. */
export const LIGHT_RULE: Brick = {
  id: 'light-rule',
  numer: 1,
  nazwa: 'Światło',
  tekst: [
    `LIGHT — the element is lit exactly like {{IMAGE_TARGET}}: same direction, hardness, colour temperature and intensity as its neighbours.`,
    `- Its cast shadow falls the same way, with the same length and softness as the other shadows, and bends over the surface beneath; a soft contact shadow sits where it touches a surface.`,
    `- Nearby coloured surfaces tint it and it tints them; highlights sit where the scene light puts them.`,
    `- Light from a donor photo is never carried over.`,
  ].join('\n'),
}
