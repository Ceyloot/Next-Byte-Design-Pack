import type { Brick } from '../types'

/** ⑥ Kontakt fizyczny — ludzie, zwierzęta, podłoże. */
export const CONTACT_RULE: Brick = {
  id: 'contact-rule',
  numer: 6,
  nazwa: 'Kontakt fizyczny',
  tekst: [
    `CONTACT — physical contact stays correct.`,
    `- People or animals touching the old element stay 100% intact in their exact pose; the new element supplies its own matching contact part.`,
    `- A resting element carries weight: stable footprint, slight sinking or pressed grass, a dark contact line. Nothing floats above its surface or clips into others.`,
    `- An airborne or hanging element has no ground contact and stays clear of every other object.`,
  ].join('\n'),
}
