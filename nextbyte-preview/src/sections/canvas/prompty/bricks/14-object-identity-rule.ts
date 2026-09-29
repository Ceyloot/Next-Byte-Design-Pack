import type { Brick } from '../types'

/** ⑭ Tożsamość obiektu — to ten sam obiekt, tylko przefotografowany. */
export const OBJECT_IDENTITY_RULE: Brick = {
  id: 'object-identity-rule',
  numer: 14,
  nazwa: 'Tożsamość obiektu',
  tekst: [
    `OBJECT IDENTITY — the SAME object: type, shape, real 3D proportions, material, colour, markings and wear are kept; it is re-photographed for this scene (new view, light and shadow), never a look-alike or hybrid.`,
  ].join('\n'),
}
