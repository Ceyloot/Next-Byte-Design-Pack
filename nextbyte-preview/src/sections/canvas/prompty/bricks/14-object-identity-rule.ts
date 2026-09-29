import type { Brick } from '../types'

/** ⑭ Tożsamość obiektu — to ten sam obiekt, tylko przefotografowany. */
export const OBJECT_IDENTITY_RULE: Brick = {
  id: 'object-identity-rule',
  numer: 14,
  nazwa: 'Tożsamość obiektu',
  tekst: [
    `OBJECT IDENTITY RULE — it is unmistakably the SAME object:`,
    `- The incoming object keeps its own identity: type, model, shape, proportions, material, colour, markings, text, logos, wear and fine details (see the appearance in SCENE DETAILS).`,
    `- Its surface condition is preserved — dust, dirt, grime, patina, scratches, matte or weathered finish — unless the task explicitly asks to clean or change it.`,
    `- It is only re-photographed inside this scene: never a generic stand-in, never a similar-looking substitute, never a hybrid that wears parts of the object it replaces.`,
    `- A moved object is the same object as before, with the same form, colour and details, only in a different place.`,
  ].join('\n'),
}
