import type { Brick } from '../types'

/** ⑮ Izolacja dawcy — z drugiego zdjęcia przechodzi tylko obiekt/osoba. */
export const DONOR_ISOLATION_RULE: Brick = {
  id: 'donor-isolation-rule',
  numer: 15,
  nazwa: 'Izolacja dawcy',
  tekst: [
    `DONOR ISOLATION — from {{IMAGE_DONOR}} only the identity and appearance of the pinned subject crosses over; its framing, background, light, grading and resolution stay there. The subject is redrawn from the camera angle and in the light of {{IMAGE_TARGET}}.`,
  ].join('\n'),
}
