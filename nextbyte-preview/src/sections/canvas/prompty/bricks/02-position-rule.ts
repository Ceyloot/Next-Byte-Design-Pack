import type { Brick } from '../types'

/** ② Pozycja — pod pineską, w pozycji zastępowanego obiektu. */
export const POSITION_RULE: Brick = {
  id: 'position-rule',
  numer: 2,
  nazwa: 'Pozycja',
  tekst: [
    `POSITION — the element lands exactly at {{PIN_TARGET}}: on the magenta dot drawn there, at the x / y given in the PIN MAP.`,
    `- A resting element meets its supporting surface exactly there, footprint centred on the spot. An airborne or floating one has its CENTRE there and no invented ground contact.`,
    `- Nearby subjects never pull it aside: they stay put and the element stands on the free surface at the spot itself. Near a frame edge shift it inward only as far as needed to keep it whole.`,
    `- A replacement inherits the position, footprint, orientation and facing of what stood there. A moved element appears only at the destination; {{PIN_CLEAR}} is left empty.`,
  ].join('\n'),
}
