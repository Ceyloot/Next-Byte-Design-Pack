import type { Brick } from '../types'

/** ① Światło, cienie, promienie, odbicia — obiekt zawsze świeci jak scena. */
export const LIGHT_RULE: Brick = {
  id: 'light-rule',
  numer: 1,
  nazwa: 'Światło',
  tekst: [
    `LIGHT RULE — the element is lit exactly like the scene it lives in:`,
    `- Every generated, replaced or moved element receives the light that already exists in {{IMAGE_TARGET}}: the same direction, elevation, hardness, colour temperature and intensity as its neighbours.`,
    `- Sun rays, window light, lamp light, rim lights and dappled light strike the element on the same side and with the same colour as they strike the objects around it.`,
    `- Shadows: the cast shadow falls in the same direction, with the same length and softness as the other shadows in the scene; a soft contact shadow and ambient occlusion sit where the element touches a surface; the shadow bends over the shape of the surface beneath it (grass, steps, folds, uneven ground).`,
    `- Bounce and colour spill: nearby coloured surfaces tint the element, and the element tints its surroundings the same way.`,
    `- Highlights: specular highlights on glossy parts sit exactly where the scene light sources would place them; matte and dusty surfaces stay diffuse.`,
    `- Mirrors, glass, windows, water and polished metal in the scene show the element wherever the geometry says it must be visible, and stop showing anything that was removed.`,
    `- A light-emitting element (lamp, screen, fire, neon) illuminates its surroundings physically, with correct falloff.`,
    `- Light from a donor photo is never carried over; only the scene light of {{IMAGE_TARGET}} counts.`,
  ].join('\n'),
}
