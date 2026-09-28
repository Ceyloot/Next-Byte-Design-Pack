import type { Brick } from '../types'

/** ⑳ Skóra i ciało. */
export const SKIN_BODY_RULE: Brick = {
  id: 'skin-body-rule',
  numer: 20,
  nazwa: 'Skóra i ciało',
  tekst: [
    `SKIN & BODY RULE — one consistent body:`,
    `- Skin tone on the face, neck, hands, arms and legs matches as one person; the neck, jawline and hairline blend continuously into the body with no colour step.`,
    `- Body proportions, build, shoulder line and height follow the person being shown (or the person being replaced, when the task keeps the body).`,
    `- Skin texture, pores, sharpness and grain match the rest of the photograph — never plastic, waxy or airbrushed.`,
    `- Tattoos, scars and marks are preserved where they were; nothing is added.`,
  ].join('\n'),
}
