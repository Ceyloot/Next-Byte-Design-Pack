/**
 * GEMINI — BLOKI STAŁE (zawsze przed promptem sytuacyjnym)
 * =========================================================
 * To są "stałe modyfikatory", o których mówił brief: światło, ziarno/szum,
 * środowisko, tożsamość obiektu, pozycja, skala. Silnik doklei je na górze
 * finalnego promptu ZANIM pojawi się prompt sytuacyjny (np. object_swap).
 *
 * Każdy blok jest samodzielnym, ponumerowanym modułem — można je włączać
 * i wyłączać per-operacja (patrz `requiresConstants` w operacjach).
 *
 * Referencja w treści operacji: {{LIGHT_REF}}, {{GRAIN_REF}}, {{ENVIRONMENT_REF}},
 * {{IDENTITY_REF}}, {{POSITION_REF}}, {{SCALE_REF}} — jeśli chcemy wpleść stałą
 * w konkretnym punkcie zamiast na górze.
 */
import type { ConstantKey, PromptModule } from '../types';

export const GEMINI_CONSTANTS: Record<ConstantKey, PromptModule> = {
  LIGHT: {
    id: 'gemini.const.light',
    ordinal: 1,
    provider: 'gemini',
    tier: 'constant',
    label: 'Światło i integracja świetlna',
    body: [
      '[LIGHTING LOCK]',
      '- Match the destination scene lighting exactly: ambient color temperature, key-light direction, rim lights, and shadow falloff.',
      '- Any injected or moved element must cast contact shadows consistent with the existing sun/lamp position and intensity.',
      '- No relighting of untouched areas. Preserve the original exposure and dynamic range of the base frame.',
    ].join('\n'),
  },

  GRAIN: {
    id: 'gemini.const.grain',
    ordinal: 2,
    provider: 'gemini',
    tier: 'constant',
    label: 'Ziarno / szum / grading',
    body: [
      '[GRAIN & GRADE LOCK]',
      '- Match film grain, sensor noise profile, sharpness, and color grade of the base photograph across the whole frame.',
      '- Edited regions must share identical micro-contrast and texture — no cleaner, smoother, or over-sharpened patches.',
      '- Preserve chromatic aberration, vignette, and compression characteristics already present in the source.',
    ].join('\n'),
  },

  ENVIRONMENT: {
    id: 'gemini.const.environment',
    ordinal: 3,
    provider: 'gemini',
    tier: 'constant',
    label: 'Środowisko / sceneria',
    body: [
      '[ENVIRONMENT LOCK]',
      '- Treat the destination environment as ground truth: keep 100% of untouched background, architecture, terrain, and props.',
      '- Preserve exact camera angle, focal length, field of view, horizon line, and perspective vanishing points.',
      '- Do not reframe, crop, rotate, or restyle the scene. Edits are strictly local.',
    ].join('\n'),
  },

  IDENTITY: {
    id: 'gemini.const.identity',
    ordinal: 4,
    provider: 'gemini',
    tier: 'constant',
    label: 'Tożsamość obiektu / postaci',
    body: [
      '[IDENTITY LOCK]',
      '- Preserve the identity of the transferred subject from {{IMAGE_1}}: face geometry, hair, skin tone, distinguishing marks, exact garment colors and cut, material and logo details.',
      '- Do not beautify, age, restyle, or reinterpret the subject. It must remain recognizably the same instance.',
      '- Reproduce fine details (stitching, texture, print) at the fidelity of the source reference.',
    ].join('\n'),
  },

  POSITION: {
    id: 'gemini.const.position',
    ordinal: 5,
    provider: 'gemini',
    tier: 'constant',
    label: 'Pozycja / orientacja / poza',
    body: [
      '[POSE & ORIENTATION LOCK]',
      '- The edited element must adopt the exact 3D orientation, rotation angle, pose, and spatial perspective of the element it replaces or the target location.',
      '- Respect occlusion order and contact points (ground, hands, supporting surfaces).',
      '- If a hand held the old object, re-render the hand so it grips the new object naturally.',
    ].join('\n'),
  },

  SCALE: {
    id: 'gemini.const.scale',
    ordinal: 6,
    provider: 'gemini',
    tier: 'constant',
    label: 'Skala świata',
    body: [
      '[WORLD-SCALE LOCK]',
      '- Size the edited element with physically plausible proportions relative to nearby reference objects and landscape features.',
      '- No floating, no clipping through surfaces, no impossible scale relative to the scene.',
    ].join('\n'),
  },
};

export const GEMINI_CONSTANT_LIST: PromptModule[] = Object.values(GEMINI_CONSTANTS);
