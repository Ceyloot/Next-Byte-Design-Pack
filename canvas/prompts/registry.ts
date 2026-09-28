/**
 * NEXTBYTE CANVAS — REJESTR PROMPTÓW
 * ===================================
 * Centralny punkt dostępu do wszystkich modułów promptów (Gemini + Runware),
 * pogrupowanych w tiery: constants / operations / positive. Silnik (`composer.ts`)
 * i klasyfikator (`canvasAI.ts`) pobierają moduły wyłącznie stąd — nic nie jest
 * już zaszyte na sztywno w logice.
 */
import type { ConstantKey, OperationId, PromptModule, PromptProvider } from './types';

import { GEMINI_CONSTANTS } from './gemini/constants';
import { GEMINI_OPERATIONS } from './gemini/operations';
import { GEMINI_POSITIVE_LIST } from './gemini/positive';

import { RUNWARE_CONSTANTS } from './runware/constants';
import { RUNWARE_OPERATIONS } from './runware/operations';
import { RUNWARE_POSITIVE_LIST, RUNWARE_NEGATIVE } from './runware/positive';

export interface ProviderPromptSet {
  constants: Record<ConstantKey, PromptModule>;
  operations: Record<OperationId, PromptModule>;
  positives: PromptModule[];
  /** Prompt negatywny (tylko modele dyfuzyjne, np. Runware). */
  negative?: string;
}

export const PROMPT_REGISTRY: Record<PromptProvider, ProviderPromptSet> = {
  gemini: {
    constants: GEMINI_CONSTANTS,
    operations: GEMINI_OPERATIONS,
    positives: GEMINI_POSITIVE_LIST,
  },
  runware: {
    constants: RUNWARE_CONSTANTS,
    operations: RUNWARE_OPERATIONS,
    positives: RUNWARE_POSITIVE_LIST,
    negative: RUNWARE_NEGATIVE,
  },
};

/** Lista wszystkich dozwolonych operacji — do zawężania klasyfikatora Gemini. */
export const OPERATION_IDS: OperationId[] = Object.keys(GEMINI_OPERATIONS) as OperationId[];

/** Pobiera zestaw promptów danego dostawcy (domyślnie Gemini). */
export function getPromptSet(provider: PromptProvider = 'gemini'): ProviderPromptSet {
  return PROMPT_REGISTRY[provider];
}

/** Zwraca moduł operacji dla dostawcy, z bezpiecznym fallbackiem do general_edit. */
export function getOperationModule(
  operation: OperationId,
  provider: PromptProvider = 'gemini',
): PromptModule {
  const set = getPromptSet(provider);
  return set.operations[operation] ?? set.operations.general_edit;
}

/** Płaska lista wszystkich modułów (do UI/podglądu zakładki Prompts). */
export function listAllModules(): PromptModule[] {
  const out: PromptModule[] = [];
  for (const provider of Object.keys(PROMPT_REGISTRY) as PromptProvider[]) {
    const set = PROMPT_REGISTRY[provider];
    out.push(
      ...Object.values(set.constants),
      ...Object.values(set.operations),
      ...set.positives,
    );
  }
  return out;
}
