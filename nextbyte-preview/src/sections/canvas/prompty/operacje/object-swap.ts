import type { Operation } from '../types'

/** Zamiana jednego obiektu na inny (z drugiego zdjęcia albo z opisu). */
export const OBJECT_SWAP: Operation = {
  id: 'object_swap',
  nazwa: 'Zamień obiekt',
  kiedyUzyc:
    'One object in the target photo is replaced by ANOTHER object — from a second photo or described in words. Polish triggers: zamień / podmień / zastąp / zamiast X daj Y / wstaw Y w miejsce X. The old object disappears, the new one takes its place.',
  bricks: [
    'studio-produkt',
    'studio-tozsamosc-referencji',
    'studio-miejsce',
    'studio-scena-zostaje',
    'studio-jedno-zdjecie',
    'studio-przeoswietlenie',
    'studio-kamera',
    'studio-film',
    'studio-montaz',
    'studio-kontrola',
    'studio-usuniecie',
  ],
  dawca: 'opcjonalny',
  czystaPlyta: true,
  misja: `Replace the whole object at the magenta dot of {{PIN_TARGET}} with the whole new object (from {{IMAGE_DONOR}}, or as described in the COMMAND), at its true size and as naturally as possible. The old object leaves completely; the new one stands exactly where it stood.`,
  kroki: [
    `Both objects are taken WHOLE: the old one at {{PIN_TARGET}} (not only the part under the pin) and the new one from its reference or description (the whole object, not only the part under its pin). The pins' names decide which object is meant.`,
    `Remove the old object entirely together with its shadow and reflection and rebuild what was behind it; the new object may be larger or smaller, so nothing of the old one may peek out around it.`,
    `Draw the new object at its OWN real size (see SCALE), seen from the camera angle of {{IMAGE_TARGET}}, standing on the spot of the old one: footprint centred there, on the same surface plane, heading along the lines of that surface.`,
    `Everything else in the photograph stays exactly as it is.`,
  ],
}
