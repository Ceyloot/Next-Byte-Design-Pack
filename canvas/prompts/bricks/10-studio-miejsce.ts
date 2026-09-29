import type { Brick } from '../types'

/** Miejsce, skala, orientacja — Studio Zdjęć, poz. 39 (adaptacja: sylwetka w szkicu → pineska). */
export const STUDIO_MIEJSCE: Brick = {
  id: 'studio-miejsce',
  numer: 10,
  nazwa: 'Miejsce, skala, orientacja',
  tekst: `Place each subject at the exact location, scale and orientation of {{PIN_TARGET}}, keep the scene of {{IMAGE_TARGET}} around it unchanged, and match scene lighting direction, color temperature, shadows, contact shadows, reflections and ambient occlusion so each subject looks photographed inside the scene — never pasted or composited.`,
}
