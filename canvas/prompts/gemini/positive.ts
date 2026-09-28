/**
 * GEMINI — BLOKI POZYTYWNE / OGÓLNE (zawsze na dole sklejki)
 * ===========================================================
 * Ogólne wytyczne jakości i fotorealizmu doklejane na końcu finalnego promptu,
 * po opisie generacji. To dawny MASTER_PROMPT_ENGINEER, rozbity na moduły.
 */
import type { PromptModule } from '../types';

export const GEMINI_POSITIVES: Record<string, PromptModule> = {
  photoreal: {
    id: 'gemini.pos.photoreal',
    ordinal: 1,
    provider: 'gemini',
    tier: 'positive',
    label: 'Fotorealizm i geometria',
    body: [
      '[PHOTOREALISM & GEOMETRY]',
      '- Output a single, clean photograph at professional cinematic capture quality.',
      '- Zero artifacting: no duplicated geometry, phantom limbs, extra fingers, or residual clones.',
      '- Seamless edges and blending; no visible seams, halos, or masking lines.',
    ].join('\n'),
  },
};

/** Domyślny stos bloków pozytywnych doklejanych zawsze (kolejność = ordinal). */
export const GEMINI_POSITIVE_LIST: PromptModule[] = Object.values(GEMINI_POSITIVES).sort(
  (a, b) => a.ordinal - b.ordinal,
);
