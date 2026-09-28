/**
 * RUNWARE — BLOKI STAŁE (zawsze przed promptem sytuacyjnym)
 * ==========================================================
 * Runware to API szybkiej inferencji obrazów (rodziny FLUX / SDXL i pokrewne,
 * text-to-image oraz image-to-image z maską inpaintingu). Prompt jest tu
 * klasyczny "positive", a osobno prowadzimy "negative" (patrz `positive.ts`).
 *
 * Stałe odpowiadają tej samej idei co po stronie Gemini: światło, ziarno,
 * środowisko, tożsamość, pozycja, skala — ale sformułowane jako tagi/frazy
 * przyjazne modelom dyfuzyjnym.
 */
import type { ConstantKey, PromptModule } from '../types';

export const RUNWARE_CONSTANTS: Record<ConstantKey, PromptModule> = {
  LIGHT: {
    id: 'runware.const.light',
    ordinal: 1,
    provider: 'runware',
    tier: 'constant',
    label: 'Światło',
    body: 'consistent scene lighting, matched color temperature, coherent shadow direction and soft falloff',
  },
  GRAIN: {
    id: 'runware.const.grain',
    ordinal: 2,
    provider: 'runware',
    tier: 'constant',
    label: 'Ziarno / grading',
    body: 'uniform film grain and color grade, matched sharpness and micro-contrast, no over-smoothing',
  },
  ENVIRONMENT: {
    id: 'runware.const.environment',
    ordinal: 3,
    provider: 'runware',
    tier: 'constant',
    label: 'Środowisko / kadr',
    body: 'preserved background and composition, same camera angle, focal length and perspective, local edit only',
  },
  IDENTITY: {
    id: 'runware.const.identity',
    ordinal: 4,
    provider: 'runware',
    tier: 'constant',
    label: 'Tożsamość',
    body: 'faithful subject identity, same face, hair, skin tone and exact outfit colors and details, no beautify',
  },
  POSITION: {
    id: 'runware.const.position',
    ordinal: 5,
    provider: 'runware',
    tier: 'constant',
    label: 'Pozycja / orientacja',
    body: 'matched 3D orientation, rotation and pose to the replaced element, correct occlusion and contact points',
  },
  SCALE: {
    id: 'runware.const.scale',
    ordinal: 6,
    provider: 'runware',
    tier: 'constant',
    label: 'Skala świata',
    body: 'physically plausible scale and proportions relative to nearby objects, grounded, no floating or clipping',
  },
};

export const RUNWARE_CONSTANT_LIST: PromptModule[] = Object.values(RUNWARE_CONSTANTS);
