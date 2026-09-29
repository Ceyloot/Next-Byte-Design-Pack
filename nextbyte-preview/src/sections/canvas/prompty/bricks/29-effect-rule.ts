import type { Brick } from '../types'

/** ㉙ Efekty: cień, odbicie, poświata, cząsteczki. */
export const EFFECT_RULE: Brick = {
  id: 'effect-rule',
  numer: 29,
  nazwa: 'Efekt',
  tekst: [
    `EFFECT RULE — effects obey physics and the scene:`,
    `- Shadows: cast realistic shadows that match the primary light angle, with contact shadows (ambient occlusion) grounding objects firmly on the surface.`,
    `- Reflections: physically accurate mirrored reflections on glossy, wet or glass surfaces, distorted naturally by ripples and surface texture.`,
    `- Glow: soft volumetric light bleed and atmospheric scattering from luminous elements, with subtle rim light on nearby surfaces.`,
    `- Particles (snow, rain, dust, sparks, fireflies): natural depth variation — blurred in the foreground, sharp in the midground, dense and soft in the background — with physical motion.`,
    `- The effect light interacts with the existing materials and scene illumination; the underlying objects and composition stay unchanged.`,
  ].join('\n'),
}
