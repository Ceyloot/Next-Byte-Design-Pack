/**
 * SEKCJA 2 — OPERACJE (prompty sytuacyjne)
 * =========================================
 * Jeden plik = jedna sytuacja. Gemini (prompt 1) wybiera dokładnie jedną
 * operację z tej listy; składarka pobiera z niej misję, kroki i listę bricków.
 */
import type { Operation, OperationId } from '../types'
import { ADDITION } from './addition'
import { BACKGROUND_CHANGE } from './background-change'
import { CHARACTER_SWAP } from './character-swap'
import { CHARACTER_TRANSFER } from './character-transfer'
import { CLOTHING_CHANGE } from './clothing-change'
import { EFFECT_ADD } from './effect-add'
import { FACE_SWAP } from './face-swap'
import { GENERAL_FIX } from './general-fix'
import { OBJECT_SWAP } from './object-swap'
import { OBJECT_TRANSFER } from './object-transfer'
import { PERSPECTIVE_CHANGE } from './perspective-change'
import { REMOVAL } from './removal'
import { SEASON_CHANGE } from './season-change'
import { STYLE_CHANGE } from './style-change'
import { TEXTURE_CHANGE } from './texture-change'
import { TIME_OF_DAY_CHANGE } from './time-of-day-change'

export const OPERATIONS: Record<OperationId, Operation> = {
  addition: ADDITION,
  background_change: BACKGROUND_CHANGE,
  character_swap: CHARACTER_SWAP,
  character_transfer: CHARACTER_TRANSFER,
  clothing_change: CLOTHING_CHANGE,
  effect_add: EFFECT_ADD,
  face_swap: FACE_SWAP,
  general_fix: GENERAL_FIX,
  object_swap: OBJECT_SWAP,
  object_transfer: OBJECT_TRANSFER,
  perspective_change: PERSPECTIVE_CHANGE,
  removal: REMOVAL,
  season_change: SEASON_CHANGE,
  style_change: STYLE_CHANGE,
  texture_change: TEXTURE_CHANGE,
  time_of_day_change: TIME_OF_DAY_CHANGE,
}

export const OPERATION_LIST: Operation[] = Object.values(OPERATIONS)
export const OPERATION_IDS = Object.keys(OPERATIONS) as OperationId[]

export function getOperation(id: OperationId): Operation {
  return OPERATIONS[id]
}

export { ADDITION, BACKGROUND_CHANGE, CHARACTER_SWAP, CHARACTER_TRANSFER, CLOTHING_CHANGE, EFFECT_ADD, FACE_SWAP, GENERAL_FIX, OBJECT_SWAP, OBJECT_TRANSFER, PERSPECTIVE_CHANGE, REMOVAL, SEASON_CHANGE, STYLE_CHANGE, TEXTURE_CHANGE, TIME_OF_DAY_CHANGE }
