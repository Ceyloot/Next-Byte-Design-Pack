import type { Operation } from '../types'

/** Dodanie efektu: cień, odbicie, poświata, cząsteczki. */
export const EFFECT_ADD: Operation = {
  id: 'effect_add',
  nazwa: 'Dodaj efekt',
  kiedyUzyc:
    'A visual or atmospheric effect is added: shadow, reflection, glow, fog, rain, snow, sparks, particles. Polish triggers: dodaj cień / odbicie / poświatę / mgłę / deszcz / śnieg / iskry.',
  bricks: [
    'studio-scena',
  ],
  dawca: 'brak',
  czystaPlyta: false,
  misja: `Add the visual or atmospheric effect requested in the USER request, at {{PIN_TARGET}} or across the scene as the USER request says.`,
  kroki: [
    `The effect interacts physically with the existing materials and light.`,
    `Scene layout, object identities and composition stay unchanged.`,
  ],
}
