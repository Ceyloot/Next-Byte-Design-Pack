import type { Operation } from '../types'

/** Zmiana tła przy zachowaniu pierwszego planu. */
export const BACKGROUND_CHANGE: Operation = {
  id: 'background_change',
  nazwa: 'Zmień tło',
  kiedyUzyc:
    'The surroundings are replaced with a new environment while the foreground subjects stay exactly as they are. Polish triggers: zmień tło / inne tło / przenieś mnie na plażę / w tle ma być.',
  bricks: [
    'background-rule',
    'donor-isolation-rule',
    'depth-occlusion-rule',
    'grain-medium-rule',
    'framing-rule',
    'output-contract-rule',
    'edge-blend-rule',
  ],
  dawca: 'opcjonalny',
  czystaPlyta: false,
  misja: `Replace the surroundings with the new environment from {{IMAGE_DONOR}} or from the COMMAND, keeping the foreground subjects exactly as they are.`,
  kroki: [
    `Separate the foreground subjects from the environment; keep their position, scale, pose and crop.`,
    `Build the new environment with the same camera height and horizon as {{IMAGE_TARGET}}.`,
    `Relight the subjects for the new environment and ground them with contact shadows.`,
    `Match the grain, depth of field and medium of {{IMAGE_TARGET}} across the whole frame.`,
  ],
}
