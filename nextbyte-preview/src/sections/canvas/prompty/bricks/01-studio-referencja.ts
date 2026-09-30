import type { Brick } from '../types'

/** Referencja = tylko tożsamość — Studio Zdjęć, poz. 7 + 39 + 9. */
export const STUDIO_REFERENCJA: Brick = {
  id: 'studio-referencja',
  numer: 1,
  nazwa: 'Referencja = tylko tożsamość',
  tekst: `{{IMAGE_DONOR}} shows {{DONOR_ROLE}}. Use it ONLY for the subject's visual identity — a person: facial features, face shape, hair, skin tone, age, body build; a product/object: exact shape, colors, materials, labels, branding and proportions — do not redesign it. Do NOT copy pose, camera angle, lighting or background from any reference, and never copy text, logos or watermarks from it. NEVER COPY THE REFERENCE PIXELS: do not cut, paste, transplant or reuse the reference picture of the object in any form (not its outline, not its viewing angle, not its lighting, not its blur or compression). Generate the object from zero together with the whole photograph, as if it had been standing in this scene when the photo was taken: seen from Image 1's camera angle, lit by Image 1's light, with Image 1's sharpness, grain and colour. If the result looks like the reference picture placed onto the scene, it is wrong.`,
}
