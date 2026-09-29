import type { Brick } from '../types'

/** ⑥ Kontakt fizyczny — ludzie, zwierzęta, podłoże. */
export const CONTACT_RULE: Brick = {
  id: 'contact-rule',
  numer: 6,
  nazwa: 'Kontakt fizyczny',
  tekst: [
    `CONTACT — it carries weight: footprint, slight sinking or pressed grass, a dark contact line. People or animals touching the old element stay intact and keep their pose. An airborne element has no ground contact.`,
  ].join('\n'),
}
