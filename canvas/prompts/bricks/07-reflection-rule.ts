import type { Brick } from '../types'

/** ⑦ Odbicia, przezroczystość, lustra i szkło. */
export const REFLECTION_RULE: Brick = {
  id: 'reflection-rule',
  numer: 7,
  nazwa: 'Odbicia',
  tekst: [
    `REFLECTION — glossy, wet or glass surfaces reflect the environment of {{IMAGE_TARGET}}; mirrors and water nearby show the element; reflections of removed things disappear with them.`,
  ].join('\n'),
}
