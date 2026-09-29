import type { Brick } from '../types'

/** ⑨ Wierność — edytor, nie enhancer. */
export const FIDELITY_RULE: Brick = {
  id: 'fidelity-rule',
  numer: 9,
  nazwa: 'Wierność (zero enhancera)',
  tekst: [
    `FIDELITY — this is an editor, not an enhancer.`,
    `- Same resolution and aspect ratio as {{IMAGE_TARGET}}; no upscaling, denoising, sharpening, brightening or colour correction anywhere. A degraded old photo stays degraded.`,
    `- Same camera, focal length and angle. Untouched areas keep their exact exposure, contrast and colour; only the change area may differ.`,
  ].join('\n'),
}
