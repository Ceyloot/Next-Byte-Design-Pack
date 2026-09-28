import type { Brick } from '../types'

/** ⑦ Odbicia, przezroczystość, lustra i szkło. */
export const REFLECTION_RULE: Brick = {
  id: 'reflection-rule',
  numer: 7,
  nazwa: 'Odbicia',
  tekst: [
    `REFLECTION RULE — reflections work both ways:`,
    `- Glossy, wet, metallic or glass surfaces of the element reflect the environment of {{IMAGE_TARGET}}, never the surroundings of a donor photo.`,
    `- Mirrors, shop windows, water, polished floors, car paint and screens near the element show its reflection with the correct angle, distortion, brightness and blur; reflections of anything removed disappear together with it.`,
    `- Transparent parts (glass, plastic, liquid) refract and show the real background behind them, with the right tint and distortion.`,
    `- Water ripples, wet asphalt and rain puddles break the reflection naturally.`,
  ].join('\n'),
}
