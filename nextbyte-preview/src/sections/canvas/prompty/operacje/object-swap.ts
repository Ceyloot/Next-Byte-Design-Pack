import type { Operation } from '../types'

/** Zamiana jednego obiektu na inny (z drugiego zdjęcia albo z opisu). */
export const OBJECT_SWAP: Operation = {
  id: 'object_swap',
  nazwa: 'Zamień obiekt',
  kiedyUzyc:
    'One object in the target photo is replaced by ANOTHER object — from a second photo or described in words. Polish triggers: zamień / podmień / zastąp / zamiast X daj Y / wstaw Y w miejsce X. The old object disappears, the new one takes its place.',
  bricks: [
    'object-identity-rule',
    'donor-isolation-rule',
    'clean-plate-rule',
    'position-rule',
    'scale-rule',
    'perspective-rule',
    'depth-occlusion-rule',
    'contact-rule',
    'reflection-rule',
    'light-rule',
    'grain-medium-rule',
    'fidelity-rule',
    'framing-rule',
    'output-contract-rule',
    'singularity-rule',
    'no-copy-paste-rule',
    'edge-blend-rule',
  ],
  dawca: 'opcjonalny',
  czystaPlyta: true,
  misja: `Replace the object at {{PIN_TARGET}} with the new object (taken from {{IMAGE_DONOR}}, or as described in the COMMAND). The old object leaves the photograph completely; the new object takes its place.`,
  kroki: [
    `Identify the old object at {{PIN_TARGET}} as a whole (see the PIN MAP), not only the part under the pin.`,
    `Remove it entirely together with its shadow and reflection and rebuild what was behind it (clean plate).`,
    `Generate the new object from its reference or description at its OWN real size, turned to the camera angle of {{IMAGE_TARGET}}.`,
    `Stand the new object where the old one stood: the same contact point, on the same surface plane, facing the same direction.`,
    `If a person or animal touched the old object, they stay intact and the new object gets its own equivalent contacting part.`,
    `Recompute light, shadows and reflections for the shape and material of the new object.`,
  ],
}
