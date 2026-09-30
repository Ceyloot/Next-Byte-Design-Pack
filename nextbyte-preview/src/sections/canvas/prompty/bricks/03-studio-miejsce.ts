import type { Brick } from '../types'

/** Miejsce, skala, perspektywa — Studio Zdjęć, poz. 39 + 52. */
export const STUDIO_MIEJSCE: Brick = {
  id: 'studio-miejsce',
  numer: 3,
  nazwa: 'Miejsce, skala, perspektywa',
  tekst: `Place the subject at the exact x / y point of {{PIN_TARGET}} in {{IMAGE_TARGET}}, at its true real-world size and in the perspective of {{IMAGE_TARGET}}'s camera: correct size relative to the environment, contact points correctly placed in 3D space. That point lies ON a surface — the thing named in the pin line (a shelf, a radiator top, a table, the floor, a road): the subject stands, sits or lies naturally on top of THAT surface at that point, its base touching it with a contact shadow — never floating in the air in front of it, never dropped to the floor or ground below it, never moved to another spot. The pose may adapt to that surface; an exact copy of the reference pose is not required.`,
}
