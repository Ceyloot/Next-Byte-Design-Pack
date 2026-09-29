import type { Brick } from '../types'

/** Ta sama kamera — Studio Zdjęć, poz. 20 (adaptacja: person → subject). */
export const STUDIO_KAMERA: Brick = {
  id: 'studio-kamera',
  numer: 15,
  nazwa: 'Ta sama kamera',
  tekst: `MATCH THE CAMERA: same distance from the lens as its spot in the scene, same focus state — a shallow scene means the same depth-of-field falloff and bokeh on its edges. If the scene has motion blur, camera shake or panning streaks, the subject MUST carry the same blur, same direction, same amount, on all its edges. NEVER render the subject sharper than the scene.`,
}
