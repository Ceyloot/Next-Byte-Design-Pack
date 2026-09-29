import type { Brick } from '../types'

/** Referencja = tylko tożsamość — Studio Zdjęć, poz. 7 + 39 + 9. */
export const STUDIO_REFERENCJA: Brick = {
  id: 'studio-referencja',
  numer: 1,
  nazwa: 'Referencja = tylko tożsamość',
  tekst: `{{IMAGE_DONOR}} shows {{DONOR_ROLE}}. Use it ONLY for the subject's visual identity — a person: facial features, face shape, hair, skin tone, age, body build; a product/object: exact shape, colors, materials, labels, branding and proportions — do not redesign it. Do NOT copy pose, camera angle, lighting or background from any reference, and never copy text, logos or watermarks from it.`,
}
