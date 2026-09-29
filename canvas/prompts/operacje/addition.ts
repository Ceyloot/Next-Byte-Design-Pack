import type { Operation } from '../types'

/** Dodanie nowego obiektu w wskazanym miejscu (nic nie znika). */
export const ADDITION: Operation = {
  id: 'addition',
  nazwa: 'Dodaj obiekt',
  kiedyUzyc:
    'A NEW object is added at the pin and NOTHING is removed from the photo; every existing object stays. Polish triggers: dodaj / wstaw / umieść / postaw / narysuj … tutaj / obok.',
  bricks: [
    'studio-referencja',
    'studio-miejsce',
    'studio-scena',
    'studio-jedno-zdjecie',
    'studio-kontrola',
  ],
  dawca: 'opcjonalny',
  czystaPlyta: false,
  misja: `Add the new object (from {{IMAGE_DONOR}}, or as described in the USER request) so that it stands exactly on the magenta dot of {{PIN_TARGET}}, at its true size and as naturally as possible. Insert only — nothing else changes.`,
  kroki: [
    `INSERT ONLY — every object, animal and person already in the scene stays: the same count, the same positions, the same sizes.`,
    `Place the new object at the marked point: where it touches the ground or the surface it rests on, or — for an airborne or floating object — where its centre sits in the air. "Next to" means immediately beside the named neighbours, sharing their ground line.`,
    `Give it its own real size (see SCALE) and the perspective of the scene.`,
    `Show it 100% complete; if its real size would clip the frame, set it deeper instead of truncating it.`,
  ],
}
