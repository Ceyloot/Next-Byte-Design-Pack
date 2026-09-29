import type { Brick } from '../types'

/** ⑮ Izolacja dawcy — z drugiego zdjęcia przechodzi tylko obiekt/osoba. */
export const DONOR_ISOLATION_RULE: Brick = {
  id: 'donor-isolation-rule',
  numer: 15,
  nazwa: 'Izolacja dawcy',
  tekst: [
    `REFERENCE ISOLATION — from {{IMAGE_DONOR}} only the identity of the pinned subject crosses over; its framing, viewing angle, background, light, shadows and grading stay there.`,
  ].join('\n'),
}
