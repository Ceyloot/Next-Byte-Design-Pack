import type { Brick } from '../types'

/** ⑨ Wierność — edytor, nie enhancer. */
export const FIDELITY_RULE: Brick = {
  id: 'fidelity-rule',
  numer: 9,
  nazwa: 'Wierność (zero enhancera)',
  tekst: [
    `FIDELITY — an editor, not an enhancer: same resolution and aspect as {{IMAGE_TARGET}}; nothing is denoised, sharpened, brightened or colour-corrected; untouched areas keep their exact exposure, contrast and colour.`,
  ].join('\n'),
}
