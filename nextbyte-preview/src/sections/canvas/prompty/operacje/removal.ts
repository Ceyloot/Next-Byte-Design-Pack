import type { Operation } from '../types'

/** Usunięcie obiektu/osoby i odbudowa tła. */
export const REMOVAL: Operation = {
  id: 'removal',
  nazwa: 'Usuń obiekt',
  kiedyUzyc:
    'Something is deleted from the target photo and nothing takes its place; the background is rebuilt. Polish triggers: usuń / skasuj / wytnij / wymaż / pozbądź się / zrób bez.',
  bricks: [
    'studio-usuniecie',
    'studio-scena',
  ],
  dawca: 'brak',
  czystaPlyta: true,
  misja: `Edit Image 1: delete {{PIN_TARGET}} completely — the whole object, nothing of it may remain. Leave the empty scene behind it: continue the surrounding background, ground and light naturally into the freed space, including where its shadow or reflection was. Everything else stays exactly as it is.`,
  kroki: [
    `Identify the whole object at {{PIN_TARGET}} (see the PIN MAP), together with everything attached to it: shadow, reflection, cables, contact marks.`,
    `Clear all of it and rebuild what logically lies behind and beneath, inferred from the neighbourhood.`,
    `The freed space shows only the background — a seamless continuation of the scene.`,
    `Objects next to the removed one stay in the same places and sizes.`,
  ],
}
