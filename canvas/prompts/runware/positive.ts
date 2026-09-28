/**
 * RUNWARE — BLOKI POZYTYWNE + PROMPT NEGATYWNY
 * =============================================
 * Modele dyfuzyjne (FLUX / SDXL) korzystają z osobnego promptu negatywnego,
 * dlatego oprócz bloków pozytywnych eksportujemy tu gotowy `RUNWARE_NEGATIVE`,
 * który silnik zwraca obok sklejonego promptu pozytywnego.
 */
import type { PromptModule } from '../types';

export const RUNWARE_POSITIVES: Record<string, PromptModule> = {
  photoreal: {
    id: 'runware.pos.photoreal',
    ordinal: 1,
    provider: 'runware',
    tier: 'positive',
    label: 'Fotorealizm',
    body: 'photorealistic, high detail, natural lighting, seamless blending, clean edges, professional photography',
  },
};

export const RUNWARE_POSITIVE_LIST: PromptModule[] = Object.values(RUNWARE_POSITIVES).sort(
  (a, b) => a.ordinal - b.ordinal,
);

/** Standardowy prompt negatywny dla operacji edycyjnych na Runware. */
export const RUNWARE_NEGATIVE =
  'duplicated object, clone, extra limbs, extra fingers, deformed, artifacts, seams, halo, ghosting, ' +
  'blurry, low quality, watermark, text, jpeg artifacts, oversmoothed, plastic skin, warped geometry';
