import type { Operation } from '../types'

/** Przeniesienie TEGO SAMEGO obiektu w inne miejsce (to samo lub inne zdjęcie). */
export const OBJECT_TRANSFER: Operation = {
  id: 'object_transfer',
  nazwa: 'Przenieś obiekt',
  kiedyUzyc:
    'The SAME object changes position — inside the target photo, or it is brought from another photo. Examples: move the cottage closer, put this here, take this object from photo 2 and place it there. Polish triggers: przenieś / przesuń / daj tu / ma być tu / przybliż / oddal.',
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
  misja: `Move the object at {{PIN_SOURCE}} to the destination {{PIN_TARGET}}. This is a relocation, not a copy: the same object changes position and appears exactly once, at the destination.`,
  kroki: [
    `The object keeps its identity and surface condition: the same form, material, colour, dust, patina and details.`,
    `If the source pin lies in {{IMAGE_TARGET}}, restore a clean plate there: rebuild ground, vegetation and patterns as if the object had never stood there. If it lies in another image, only the object comes across from it.`,
    `Adapt the object to the new position: perspective, angle and scale follow the destination — farther from the camera means smaller along the same vanishing lines, closer means larger and sharper (an object moved from the distance to the foreground grows accordingly).`,
    `Set it on the ground at the destination pin with a stable natural footprint and its own new contact shadow.`,
    `Its old cast shadow and reflection leave together with it.`,
    `People in contact with the object are never cut or erased: their contact adapts naturally.`,
  ],
}
