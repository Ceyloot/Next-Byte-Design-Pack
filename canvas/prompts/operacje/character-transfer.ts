import type { Operation } from '../types'

/** Przeniesienie TEJ SAMEJ osoby w inne miejsce / na inne zdjęcie. */
export const CHARACTER_TRANSFER: Operation = {
  id: 'character_transfer',
  nazwa: 'Przenieś postać',
  kiedyUzyc:
    'The SAME person is moved to another place in the photo, or brought from another photo into the target photo; identity and clothing are kept, the pose adapts to the new ground. Polish triggers: przenieś tę osobę / postać / postaw tę osobę tutaj / dodaj tę osobę do zdjęcia.',
  bricks: [
    'character-identity-rule',
    'hair-rule',
    'skin-body-rule',
    'clothing-rule',
    'hands-limbs-rule',
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
  misja: `Bring the same person from {{PIN_SOURCE}} to the destination {{PIN_TARGET}}, keeping their identity and clothing. They appear exactly once, at the destination.`,
  kroki: [
    `Keep identity, hair, body and the exact outfit of the person; only place, pose adaptation, size and light change.`,
    `Adapt the pose to the new ground: standing on level ground, sitting on the seat that is there, stepping on the stairs that are there — natural, balanced, weight on the right leg.`,
    `If the source pin lies in {{IMAGE_TARGET}}, rebuild a clean plate at the old spot; if it lies in another image, only the person comes across.`,
    `Fit their size to the destination: farther from the camera means smaller along the same vanishing lines.`,
    `Give them a contact shadow and a cast shadow in the light of the scene.`,
  ],
}
