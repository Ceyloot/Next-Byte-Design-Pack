/**
 * GEMINI — PROMPTY SYTUACYJNE (operacje)
 * =======================================
 * Uniwersalne prompty, każdy pod konkretną sytuację. Klasyfikator Gemini
 * (patrz `canvas/lib/canvasAI.ts`) zwraca `OperationId`, a silnik wyciąga
 * DOKŁADNIE jeden pasujący moduł. Dzięki temu prompt z object_swap nie zostanie
 * użyty, gdy sytuacją jest np. removal.
 *
 * W treści używamy tokenów: {{IMAGE_1}}, {{IMAGE_2}}, {{SUBJECT}},
 * {{SOURCE_OBJECT}}, {{TARGET_OBJECT}}, {{SOURCE_COORD}}, {{TARGET_COORD}},
 * {{USER_INSTRUCTION}}. `requiresConstants` mówi silnikowi, które bloki stałe
 * dokleić na górze.
 */
import type { OperationId, PromptModule } from '../types';

export const GEMINI_OPERATIONS: Record<OperationId, PromptModule> = {
  object_transfer: {
    id: 'gemini.op.object_transfer',
    ordinal: 1,
    provider: 'gemini',
    tier: 'operation',
    operation: 'object_transfer',
    label: 'Przeniesienie obiektu (relokacja)',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'GRAIN', 'POSITION', 'SCALE'],
    requiresDualImage: false,
    requiresCleanPlate: true,
    body: [
      '[OPERATION — OBJECT RELOCATION]',
      'Relocate "{{SOURCE_OBJECT}}" from source location {{SOURCE_COORD}} to destination {{TARGET_COORD}} within the same frame.',
      '1. CLEAN PLATE: completely erase the object at {{SOURCE_COORD}} and reconstruct the revealed background with matching terrain, foliage, or texture. No residual object or halo at the source.',
      '2. INJECTION: render the object at {{TARGET_COORD}}, seated naturally on the terrain and lit per {{LIGHT_REF}}.',
      '3. SINGULARITY: the final image must contain EXACTLY ONE instance of this object. Any clone is a failure.',
    ].join('\n'),
  },

  object_swap: {
    id: 'gemini.op.object_swap',
    ordinal: 2,
    provider: 'gemini',
    tier: 'operation',
    operation: 'object_swap',
    label: 'Podmiana obiektu (foto 1 → foto 2)',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'GRAIN', 'POSITION', 'SCALE'],
    requiresDualImage: true,
    requiresCleanPlate: true,
    body: [
      '[OPERATION — OBJECT SWAP]',
      'Replace "{{TARGET_OBJECT}}" in {{IMAGE_2}} at {{TARGET_COORD}} with "{{SOURCE_OBJECT}}" taken from {{IMAGE_1}}.',
      '1. SITUATIONAL ANALYSIS: if the new object is smaller, fully remove the old "{{TARGET_OBJECT}}" and inpaint the background beneath it. Never stack one over the other.',
      '2. ORIENTATION: the new object must inherit the exact pose, rotation, and 3D perspective of "{{TARGET_OBJECT}}" ({{POSITION_REF}}).',
      '3. HAND INTEGRATION: if the object is held, re-render the hand to grip the new object stably.',
    ].join('\n'),
  },

  character_transfer: {
    id: 'gemini.op.character_transfer',
    ordinal: 3,
    provider: 'gemini',
    tier: 'operation',
    operation: 'character_transfer',
    label: 'Przeniesienie postaci (tożsamość + strój)',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'GRAIN', 'IDENTITY', 'POSITION'],
    requiresDualImage: true,
    requiresCleanPlate: false,
    body: [
      '[OPERATION — CHARACTER IDENTITY & OUTFIT TRANSFER]',
      'APPEARANCE SOURCE ({{IMAGE_1}}): take face, hair, and the exact outfit (colors, cut, details) — see {{IDENTITY_REF}}.',
      'POSE & SCENE SOURCE ({{IMAGE_2}}): this is the base. Keep its scenery, lighting, and the exact pose/gesture of the person ({{POSITION_REF}}).',
      'TASK: place the character from {{IMAGE_1}} into the exact pose and location of the person in {{IMAGE_2}}.',
      'Remove clothing visible in {{IMAGE_2}}; replace with the outfit from {{IMAGE_1}}. Never reuse the pose from {{IMAGE_1}}.',
    ].join('\n'),
  },

  character_swap: {
    id: 'gemini.op.character_swap',
    ordinal: 4,
    provider: 'gemini',
    tier: 'operation',
    operation: 'character_swap',
    label: 'Podmiana postaci (zachowanie pozy sceny)',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'GRAIN', 'IDENTITY', 'POSITION'],
    requiresDualImage: true,
    requiresCleanPlate: false,
    body: [
      '[OPERATION — CHARACTER SWAP]',
      'Replace the person in {{IMAGE_2}} with the person from {{IMAGE_1}}, keeping the pose from {{IMAGE_2}} ({{POSITION_REF}}).',
      'Take face, hair, and outfit from {{IMAGE_1}} ({{IDENTITY_REF}}); take pose, gesture, and full background from {{IMAGE_2}}.',
      'Prohibited: reusing clothing from {{IMAGE_2}}. Preserve 100% of the {{IMAGE_2}} scenery.',
    ].join('\n'),
  },

  addition: {
    id: 'gemini.op.addition',
    ordinal: 5,
    provider: 'gemini',
    tier: 'operation',
    operation: 'addition',
    label: 'Dodanie obiektu',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'SCALE'],
    requiresDualImage: false,
    requiresCleanPlate: false,
    body: [
      '[OPERATION — ADDITION]',
      'Generate "{{SUBJECT}}" at {{TARGET_COORD}}.',
      'Isolation: generate ONLY this element; do not alter any untouched area of the scene.',
      'It must sit with realistic scale ({{SCALE_REF}}) and lighting ({{LIGHT_REF}}) matched to the surroundings.',
    ].join('\n'),
  },

  removal: {
    id: 'gemini.op.removal',
    ordinal: 6,
    provider: 'gemini',
    tier: 'operation',
    operation: 'removal',
    label: 'Usunięcie obiektu + rekonstrukcja tła',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'GRAIN'],
    requiresDualImage: false,
    requiresCleanPlate: true,
    body: [
      '[OPERATION — REMOVE & RECONSTRUCT]',
      'Completely remove "{{TARGET_OBJECT}}" at {{TARGET_COORD}}, including its cast shadows and reflections.',
      'Rebuild the concealed background with seamless matching textures. Zero smudges, seams, or ghosting.',
    ].join('\n'),
  },

  background_edit: {
    id: 'gemini.op.background_edit',
    ordinal: 7,
    provider: 'gemini',
    tier: 'operation',
    operation: 'background_edit',
    label: 'Zmiana / wymiana tła',
    requiresConstants: ['LIGHT', 'GRAIN', 'IDENTITY'],
    requiresDualImage: false,
    requiresCleanPlate: false,
    body: [
      '[OPERATION — BACKGROUND REPLACEMENT]',
      'Replace the background with: "{{SUBJECT}}". Keep the foreground subject perfectly intact ({{IDENTITY_REF}}).',
      'Re-derive edge lighting and rim light on the subject so it belongs in the new environment, but do not alter the subject itself.',
    ].join('\n'),
  },

  style_change: {
    id: 'gemini.op.style_change',
    ordinal: 8,
    provider: 'gemini',
    tier: 'operation',
    operation: 'style_change',
    label: 'Zmiana stylu / gradingu',
    requiresConstants: ['ENVIRONMENT'],
    requiresDualImage: false,
    requiresCleanPlate: false,
    body: [
      '[OPERATION — STYLE TRANSFER]',
      'Recreate the exact content and composition of {{IMAGE_1}} in a new style: "{{SUBJECT}}".',
      'Preserve subject placement, count, and geometry. Only medium/aesthetic changes.',
    ].join('\n'),
  },

  general_edit: {
    id: 'gemini.op.general_edit',
    ordinal: 9,
    provider: 'gemini',
    tier: 'operation',
    operation: 'general_edit',
    label: 'Modyfikacja lokalna (ogólna)',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'SCALE'],
    requiresDualImage: false,
    requiresCleanPlate: false,
    body: [
      '[OPERATION — LOCAL EDIT]',
      'Apply "{{USER_INSTRUCTION}}" locally at {{TARGET_COORD}}.',
      'Preserve overall composition; blend the change seamlessly with realistic physics.',
    ].join('\n'),
  },
};

export const GEMINI_OPERATION_LIST: PromptModule[] = Object.values(GEMINI_OPERATIONS);
