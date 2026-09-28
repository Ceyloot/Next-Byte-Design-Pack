/**
 * JSON PROMPTS ENGINE (Canvas)
 * =============================
 * Silnik NIE trzyma już promptów na sztywno. Jest cienkim adapterem nad
 * przestrzenią `canvas/prompts/`: mapuje wejście z Canvasu (akcja + pinezki)
 * na `OperationId`, a następnie zleca sklejenie finalnego promptu silnikowi
 * `composePrompt`. Cała treść (stałe: światło/ziarno/środowisko/tożsamość/
 * pozycja, prompty sytuacyjne, bloki pozytywne) pochodzi z rejestru.
 *
 * Uwaga: `action` bywa zgrubny (source+target → transfer). Jeśli dysponujemy
 * bardziej precyzyjną klasyfikacją z Gemini (`operation`), używamy jej.
 */
import type { OperationId, PromptProvider } from '../prompts';
import { composePrompt } from '../prompts';

export interface PinCoordinate {
  id: string;
  role: 'source' | 'target';
  normalizedX: number;
  normalizedY: number;
  description?: string;
}

export type CanvasEngineAction =
  | 'transfer'
  | 'addition'
  | 'removal'
  | 'swap'
  | 'character'
  | 'clothing'
  | 'texture'
  | 'season'
  | 'time_of_day'
  | 'effects'
  | 'background'
  | 'style'
  | 'general_edit';

export interface PromptEngineInput {
  /** Zgrubna akcja z UI (na podstawie liczby pinezek). */
  action: 'transfer' | 'addition' | 'removal' | 'swap' | 'general_edit';
  /** Precyzyjna operacja z klasyfikatora Gemini (ma priorytet nad `action`). */
  operation?: OperationId;
  userInstruction: string;
  /** Opis od Gemini: co konkretnie ma powstać (trafia do [GENERATION BRIEF]). */
  generationBrief?: string;
  provider?: PromptProvider;
  sourcePin?: PinCoordinate;
  targetPin?: PinCoordinate;
  sourceObjectName?: string;
  targetObjectName?: string;
  extraDetails?: string;
}

export interface PromptEngineOutput {
  compiledPrompt: string;
  negativePrompt?: string;
  actionSummary: string;
  operation: OperationId;
  requiresDualMask: boolean;
  requiresCleanPlate: boolean;
  recommendedAspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '2:3' | '3:2';
  usedModuleIds: string[];
}

/** Mapuje zgrubną akcję z UI na operację rejestru. */
function actionToOperation(
  action: PromptEngineInput['action'],
  hasSource: boolean,
  hasTarget: boolean,
): OperationId {
  switch (action) {
    case 'transfer':
      return hasSource && hasTarget ? 'object_transfer' : 'general_edit';
    case 'swap':
      return 'object_swap';
    case 'addition':
      return 'addition';
    case 'removal':
      return 'removal';
    default:
      return 'general_edit';
  }
}

function coord(pin?: PinCoordinate): string | undefined {
  if (!pin) return undefined;
  return `[X: ${Math.round(pin.normalizedX * 100)}%, Y: ${Math.round(pin.normalizedY * 100)}%]`;
}

export class JsonPromptEngine {
  static compile(input: PromptEngineInput): PromptEngineOutput {
    const {
      action,
      operation,
      userInstruction,
      generationBrief,
      provider = 'gemini',
      sourcePin,
      targetPin,
      sourceObjectName = 'wskazany obiekt',
      targetObjectName = 'obiekt docelowy',
    } = input;

    const resolvedOp: OperationId =
      operation ?? actionToOperation(action, !!sourcePin, !!targetPin);

    const composed = composePrompt({
      provider,
      operation: resolvedOp,
      references: {
        SUBJECT: generationBrief,
        USER_INSTRUCTION: userInstruction,
        SOURCE_OBJECT: sourcePin?.description || sourceObjectName,
        TARGET_OBJECT: targetPin?.description || targetObjectName,
        SOURCE_COORD: coord(sourcePin),
        TARGET_COORD: coord(targetPin) ?? coord(sourcePin),
      },
    });

    return {
      compiledPrompt: composed.prompt,
      negativePrompt: composed.negative,
      actionSummary: composed.operationLabel,
      operation: composed.operation,
      // Dual-mask potrzebny gdy operacja to transfer/relokacja w obrębie kadru.
      requiresDualMask: resolvedOp === 'object_transfer' && !!sourcePin && !!targetPin,
      requiresCleanPlate: composed.requiresCleanPlate,
      recommendedAspectRatio: '3:2',
      usedModuleIds: composed.usedModuleIds,
    };
  }
}
