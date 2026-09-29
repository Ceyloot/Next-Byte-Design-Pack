import type { Operation } from '../types'

/** Zamiana samej twarzy/tożsamości; ciało, ubiór i poza zostają. */
export const FACE_SWAP: Operation = {
  id: 'face_swap',
  nazwa: 'Zamień twarz',
  kiedyUzyc:
    'Only the face and identity of a person change (face, hair, apparent age); their body, clothing, pose and the scene stay. Polish triggers: zamień twarz / daj mu twarz z drugiego zdjęcia / twarz tej osoby.',
  bricks: [
    'character-identity-rule',
    'hair-rule',
    'skin-body-rule',
    'pose-expression-rule',
    'donor-isolation-rule',
    'light-rule',
    'grain-medium-rule',
    'fidelity-rule',
    'framing-rule',
    'output-contract-rule',
    'singularity-rule',
    'no-copy-paste-rule',
    'edge-blend-rule',
  ],
  dawca: 'wymagany',
  czystaPlyta: false,
  misja: `Give the person at {{PIN_TARGET}} the face and identity of the person from {{IMAGE_DONOR}}. Everything else about the person in {{IMAGE_TARGET}} stays.`,
  kroki: [
    `Keep the pose, body proportions, clothing, accessories, hands and head tilt of the person in {{IMAGE_TARGET}}.`,
    `Redraw the donor face turned to the exact head angle and gaze of the original.`,
    `Blend neck, jawline and hairline continuously into the body; match skin tone on neck and hands to the new face.`,
    `Keep the face at the same size in the frame as the original face and every other person with their own faces.`,
  ],
}
