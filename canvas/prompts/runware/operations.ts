/**
 * RUNWARE — PROMPTY SYTUACYJNE (operacje)
 * ========================================
 * Zestaw równoległy do Gemini, sformułowany pod modele dyfuzyjne serwowane
 * przez Runware (FLUX / SDXL, image-to-image + inpainting). Ten sam zamknięty
 * słownik OperationId, więc klasyfikator i silnik działają identycznie
 * niezależnie od dostawcy.
 */
import type { OperationId, PromptModule } from '../types';

export const RUNWARE_OPERATIONS: Record<OperationId, PromptModule> = {
  object_transfer: {
    id: 'runware.op.object_transfer',
    ordinal: 1,
    provider: 'runware',
    tier: 'operation',
    operation: 'object_transfer',
    label: 'Przeniesienie obiektu',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'GRAIN', 'POSITION', 'SCALE'],
    requiresCleanPlate: true,
    body: 'relocate {{SOURCE_OBJECT}} from {{SOURCE_COORD}} to {{TARGET_COORD}}, clean-plate inpaint the source area with matching background, exactly one instance of the object in the frame',
  },
  object_swap: {
    id: 'runware.op.object_swap',
    ordinal: 2,
    provider: 'runware',
    tier: 'operation',
    operation: 'object_swap',
    label: 'Podmiana obiektu',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'GRAIN', 'POSITION', 'SCALE'],
    requiresDualImage: true,
    requiresCleanPlate: true,
    body: 'replace {{TARGET_OBJECT}} at {{TARGET_COORD}} with {{SOURCE_OBJECT}} from the reference, inpaint away the old object, match its orientation, pose and scale',
  },
  character_transfer: {
    id: 'runware.op.character_transfer',
    ordinal: 3,
    provider: 'runware',
    tier: 'operation',
    operation: 'character_transfer',
    label: 'Przeniesienie postaci',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'GRAIN', 'IDENTITY', 'POSITION'],
    requiresDualImage: true,
    body: 'place the referenced character (face, hair, exact outfit) into the base scene pose and location, keep the base scenery and lighting, replace the base outfit',
  },
  character_swap: {
    id: 'runware.op.character_swap',
    ordinal: 4,
    provider: 'runware',
    tier: 'operation',
    operation: 'character_swap',
    label: 'Podmiana postaci',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'GRAIN', 'IDENTITY', 'POSITION'],
    requiresDualImage: true,
    body: 'swap the person in the base image for the referenced person, keep the base pose and full background, use the referenced face, hair and outfit',
  },
  addition: {
    id: 'runware.op.addition',
    ordinal: 5,
    provider: 'runware',
    tier: 'operation',
    operation: 'addition',
    label: 'Dodanie obiektu',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'SCALE'],
    body: 'add {{SUBJECT}} at {{TARGET_COORD}} only, realistic scale and lighting, do not alter untouched areas',
  },
  removal: {
    id: 'runware.op.removal',
    ordinal: 6,
    provider: 'runware',
    tier: 'operation',
    operation: 'removal',
    label: 'Usunięcie obiektu',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'GRAIN'],
    requiresCleanPlate: true,
    body: 'remove {{TARGET_OBJECT}} at {{TARGET_COORD}} including its shadows, inpaint a seamless matching background, no ghosting or seams',
  },
  background_edit: {
    id: 'runware.op.background_edit',
    ordinal: 7,
    provider: 'runware',
    tier: 'operation',
    operation: 'background_edit',
    label: 'Zmiana tła',
    requiresConstants: ['LIGHT', 'GRAIN', 'IDENTITY'],
    body: 'replace the background with {{SUBJECT}}, keep the foreground subject perfectly intact, re-derive edge lighting on the subject',
  },
  style_change: {
    id: 'runware.op.style_change',
    ordinal: 8,
    provider: 'runware',
    tier: 'operation',
    operation: 'style_change',
    label: 'Zmiana stylu',
    requiresConstants: ['ENVIRONMENT'],
    body: 'restyle the image to {{SUBJECT}}, preserve content, placement, count and geometry, medium/aesthetic change only',
  },
  general_edit: {
    id: 'runware.op.general_edit',
    ordinal: 9,
    provider: 'runware',
    tier: 'operation',
    operation: 'general_edit',
    label: 'Modyfikacja ogólna',
    requiresConstants: ['ENVIRONMENT', 'LIGHT', 'SCALE'],
    body: 'apply {{USER_INSTRUCTION}} locally at {{TARGET_COORD}}, preserve overall composition, seamless blend',
  },
};

export const RUNWARE_OPERATION_LIST: PromptModule[] = Object.values(RUNWARE_OPERATIONS);
