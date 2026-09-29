import type { Operation } from '../types'

/** Każda inna lokalna zmiana, która nie pasuje do pozostałych operacji. */
export const GENERAL_FIX: Operation = {
  id: 'general_fix',
  nazwa: 'Inna zmiana',
  kiedyUzyc:
    'Any other small local change that fits none of the operations above (recolour something, open a door, change a sign, adjust a detail). Choose this ONLY when no other operation fits.',
  bricks: [
    'minimal-change-rule',
    'perspective-rule',
    'light-rule',
    'grain-medium-rule',
    'fidelity-rule',
    'framing-rule',
    'output-contract-rule',
    'edge-blend-rule',
  ],
  dawca: 'opcjonalny',
  czystaPlyta: false,
  misja: `Make exactly the change from the COMMAND at {{PIN_TARGET}}, with the smallest possible intervention.`,
  kroki: [
    `Treat the marked area as the only place of work.`,
    `The changed area follows the existing light: the same direction, colour and shadow softness.`,
  ],
}
