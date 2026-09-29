import type { Brick } from '../types'

/** ① Światło, cienie, promienie, odbicia — obiekt zawsze świeci jak scena. */
export const LIGHT_RULE: Brick = {
  id: 'light-rule',
  numer: 1,
  nazwa: 'Światło',
  tekst: [
    `LIGHT — lit exactly like {{IMAGE_TARGET}}: same direction, hardness, colour temperature and intensity as its neighbours; its cast and contact shadows fall the way the scene's shadows do (direction, length, softness); colour bounces both ways. Reference-photo light never carries over.`,
  ].join('\n'),
}
