import type { Brick } from '../types'

/** ⑭ Tożsamość obiektu — to ten sam obiekt, tylko przefotografowany. */
export const OBJECT_IDENTITY_RULE: Brick = {
  id: 'object-identity-rule',
  numer: 14,
  nazwa: 'Tożsamość obiektu',
  tekst: [
    `OBJECT IDENTITY — it is unmistakably the SAME object: its type, shape, proportions, material, colour, markings and wear are kept, including dust, patina and scratches.`,
    `- It is only re-photographed inside this scene: no look-alike substitute, no hybrid. A moved object keeps its form and details.`,
  ].join('\n'),
}
