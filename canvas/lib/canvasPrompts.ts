/**
 * CANVAS PROMPTS (fasada)
 * ========================
 * Ten plik NIE zawiera już żadnych promptów zaszytych na sztywno. Wszystkie
 * dawne szablony (CANVAS_TEMPLATES, MASTER_PROMPT_ENGINEER, protokoły Loomic)
 * zostały usunięte i przeniesione do ustrukturyzowanej przestrzeni
 * `canvas/prompts/` (Gemini + Runware, tiery: constants/operations/positive).
 *
 * Zostaje wyłącznie re-eksport publicznego API tej przestrzeni, aby stare
 * importy `./lib/canvasPrompts` dalej działały.
 */
export {
  PROMPT_REGISTRY,
  OPERATION_IDS,
  getPromptSet,
  getOperationModule,
  listAllModules,
  composePrompt,
} from '../prompts';

export type {
  OperationId,
  PromptProvider,
  PromptModule,
  PromptTier,
  ConstantKey,
  ReferenceToken,
  ReferenceValues,
} from '../prompts';
