import type { Brick } from '../types'

/** ⑮ Izolacja dawcy — z drugiego zdjęcia przechodzi tylko obiekt/osoba. */
export const DONOR_ISOLATION_RULE: Brick = {
  id: 'donor-isolation-rule',
  numer: 15,
  nazwa: 'Izolacja dawcy',
  tekst: [
    `DONOR ISOLATION RULE — only the pinned subject crosses over:`,
    `- When the object, person or look comes from {{IMAGE_DONOR}}, only the identity and appearance of the pinned subject is used.`,
    `- The framing, background, surroundings, lighting, time of day, colour grading, resolution and quality of the donor photo stay in the donor photo.`,
    `- The subject is redrawn from the camera angle and in the light of {{IMAGE_TARGET}}; reflections and shadows of the donor environment are not carried over.`,
    `- If no donor image is present, the subject follows the description in SCENE DETAILS and the COMMAND.`,
  ].join('\n'),
}
