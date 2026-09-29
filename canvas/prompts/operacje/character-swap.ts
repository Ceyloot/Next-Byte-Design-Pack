import type { Operation } from '../types'

/** Zamiana całej postaci (tożsamość + ciało + ubiór) na inną. */
export const CHARACTER_SWAP: Operation = {
  id: 'character_swap',
  nazwa: 'Zamień postać',
  kiedyUzyc:
    'A whole person in the target photo is replaced by ANOTHER person (from a second photo or described): identity, body and clothing all change, position and pose of the scene stay. Polish triggers: zamień tę osobę / postać na / podmień osobę / wstaw tę osobę zamiast.',
  bricks: [
    'studio-osoba',
    'studio-tozsamosc-osoby',
    'studio-miejsce',
    'studio-scena-zostaje',
    'studio-jedno-zdjecie',
    'studio-przeoswietlenie',
    'studio-kamera',
    'studio-film',
    'studio-montaz',
    'studio-anatomia',
    'studio-realizm-skory',
    'studio-kontrola',
    'studio-usuniecie',
  ],
  gotowy: 'studio-character-swap',
  dawca: 'wymagany',
  czystaPlyta: true,
  misja: `Replace the whole person at {{PIN_TARGET}} with the person from {{IMAGE_DONOR}} — their identity, body and clothing — fitted into the position, pose, scale and light of the scene. Every other person stays untouched.`,
  kroki: [
    `Remove the target person completely, including their clothing, shadow and reflection; rebuild whatever they hid (clean plate).`,
    `Draw the donor person in full: face, hair, body and outfit exactly as in {{IMAGE_DONOR}}.`,
    `Give them the pose, gesture, head angle and gaze of the person they replace, standing or sitting on the same spot at the same distance from the camera.`,
    `Fit their size to the scene: real height relative to the surroundings, not the size of the person they replace.`,
    `Every other person, animal and object keeps the same place, pose and look.`,
  ],
}
