import type { Brick } from '../types'

/** Miejsce, skala, perspektywa — Studio Zdjęć, poz. 39 + 52. */
export const STUDIO_MIEJSCE: Brick = {
  id: 'studio-miejsce',
  numer: 3,
  nazwa: 'Miejsce, skala, perspektywa',
  tekst: `Place the subject at the exact location of {{PIN_TARGET}}, at its true real-world size and in the perspective of {{IMAGE_TARGET}}'s camera: correct size relative to the environment, contact points correctly placed in 3D space. Seat it logically: it rests on the surface at that point (the top of what is there — a shelf, a radiator, a table, the floor), its base touching it, never floating in front of it and never dropped below it. The point is fixed and always wins over plausibility — adapt the subject to the spot, never pick a more convenient spot: never shift the subject toward the centre or to an easier spot — near the frame edge it may be partly cut off by the edge.`,
}
