import type { Operation } from '../types'

/** Zmiana materiału/faktury powierzchni. */
export const TEXTURE_CHANGE: Operation = {
  id: 'texture_change',
  nazwa: 'Zmień teksturę',
  kiedyUzyc:
    'The material or surface texture of an area changes while its shape stays. Polish triggers: zmień materiał / zrób z drewna / marmurowa podłoga / inna faktura / inny kolor elewacji.',
  bricks: [
    'texture-rule',
    'perspective-rule',
    'reflection-rule',
    'light-rule',
    'grain-medium-rule',
    'fidelity-rule',
    'framing-rule',
    'output-contract-rule',
    'edge-blend-rule',
  ],
  dawca: 'opcjonalny',
  czystaPlyta: false,
  misja: `Replace the surface texture and material of the object at {{PIN_TARGET}} as the COMMAND says (reference: {{IMAGE_DONOR}} if present).`,
  kroki: [
    `Work only inside the marked object; its 3D shape, volume and geometry stay.`,
    `Adjacent objects, ground contact, perspective and lighting direction stay.`,
  ],
}
