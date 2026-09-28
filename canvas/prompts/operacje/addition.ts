import type { Operation } from '../types'

/** Dodanie nowego obiektu w wskazanym miejscu (nic nie znika). */
export const ADDITION: Operation = {
  id: 'addition',
  nazwa: 'Dodaj obiekt',
  kiedyUzyc:
    'A NEW object is added at the pin and NOTHING is removed from the photo; every existing object stays. Polish triggers: dodaj / wstaw / umieść / postaw / narysuj … tutaj / obok.',
  bricks: [
    'object-identity-rule',
    'donor-isolation-rule',
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
  czystaPlyta: false,
  misja: `Add the new object (from {{IMAGE_DONOR}}, or as described in the COMMAND) at {{PIN_TARGET}}. Insert only — remove nothing.`,
  kroki: [
    `INSERT ONLY — every object, animal and person already in the scene stays: the same count, the same positions, the same sizes.`,
    `Place the new object at the marked point, where it touches the ground or the surface it rests on. "Next to" means immediately beside the named neighbours, sharing their ground line.`,
    `Give it its own real size (see SCENE DETAILS) and the perspective of the scene.`,
    `Show it 100% complete; if its real size would clip the frame, set it deeper instead of truncating it.`,
  ],
}
