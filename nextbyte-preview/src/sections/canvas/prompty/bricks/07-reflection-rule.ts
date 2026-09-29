import type { Brick } from '../types'

/** ⑦ Odbicia, przezroczystość, lustra i szkło. */
export const REFLECTION_RULE: Brick = {
  id: 'reflection-rule',
  numer: 7,
  nazwa: 'Odbicia',
  tekst: [
    `REFLECTION — glossy, wet, metal or glass surfaces of the element reflect the environment of {{IMAGE_TARGET}}, never the donor's.`,
    `- Mirrors, windows, water and polished surfaces nearby show the element with correct angle and blur; reflections of anything removed disappear with it.`,
  ].join('\n'),
}
