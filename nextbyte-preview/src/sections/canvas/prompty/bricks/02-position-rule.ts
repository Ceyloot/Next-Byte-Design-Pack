import type { Brick } from '../types'

/** ② Pozycja — pod pineską, w pozycji zastępowanego obiektu. */
export const POSITION_RULE: Brick = {
  id: 'position-rule',
  numer: 2,
  nazwa: 'Pozycja',
  tekst: [
    `POSITION — the element stands EXACTLY ON THE MAGENTA DOT of {{PIN_TARGET}} (x / y in PINS): a resting element with its base and footprint centred on the dot, an airborne one with its centre there. Neighbours never pull it aside. A replacement inherits the position, footprint and heading of what stood there; a moved element appears only there and its old spot is left empty.`,
  ].join('\n'),
}
