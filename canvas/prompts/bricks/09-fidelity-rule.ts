import type { Brick } from '../types'

/** ⑨ Wierność — edytor, nie enhancer. */
export const FIDELITY_RULE: Brick = {
  id: 'fidelity-rule',
  numer: 9,
  nazwa: 'Wierność (zero enhancera)',
  tekst: [
    `FIDELITY RULE — this is an EDITOR, not an enhancer, upscaler or restorer:`,
    `- Output the SAME resolution and aspect ratio as {{IMAGE_TARGET}}. No upscaling, stretching, added detail or extra sharpness anywhere.`,
    `- Keep the original quality everywhere the task does not touch: exact grain, noise, softness, compression, low resolution, colour degradation, scratches and old-photo artifacts. Nothing is denoised, sharpened, cleaned, brightened, colour-corrected or "improved" — a degraded old photo stays a degraded old photo.`,
    `- Camera lock: identical camera position, focal length, field of view and angle; no zoom, no re-crop, no lens change.`,
    `- Lighting lock: the exposure, contrast and colour balance of the untouched areas stay exactly as they are.`,
    `- Only the marked change area may differ; every other pixel is the original photograph at its original quality.`,
  ].join('\n'),
}
