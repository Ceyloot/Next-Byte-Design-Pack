/**
 * NEXTBYTE CANVAS — SILNIK SKLEJANIA PROMPTÓW (COMPOSER)
 * =======================================================
 * Cała "logika generowania promptu" żyje tutaj. Composer bierze:
 *   1. wybraną operację (o której zdecydował Gemini — klasyfikacja),
 *   2. wartości referencyjne (które zdjęcie jest którym, opis od Gemini,
 *      nazwy obiektów, współrzędne pinezek, instrukcja użytkownika),
 * i skleja finalny prompt w stałej kolejności:
 *
 *   [ STAŁE MODYFIKATORY ]   ← tylko te, których wymaga dana operacja
 *   [ PROMPT SYTUACYJNY   ]   ← dokładnie jeden, pod wykrytą sytuację
 *   [ OPIS GENERACJI      ]   ← {{SUBJECT}} — co ma powstać
 *   [ PROMPT POZYTYWNY    ]   ← ogólne wytyczne jakości
 *
 * Tokeny {{...}} w treści są podmieniane na konkretne wartości. Dzięki temu
 * "specyficzne nawiasy" (np. {{IMAGE_1}}, {{LIGHT_REF}}, {{IDENTITY_REF}})
 * dynamicznie dostają realne odniesienia.
 */
import type {
  OperationId,
  PromptProvider,
  ReferenceValues,
} from './types';
import { getPromptSet } from './registry';

export interface ComposeInput {
  provider?: PromptProvider;
  operation: OperationId;
  references: ReferenceValues;
  /** Wymuś konkretną kolejność zdjęć (domyślnie IMAGE_1 = źródło, IMAGE_2 = cel). */
  imageLabels?: { image1?: string; image2?: string };
}

export interface ComposeOutput {
  /** Gotowy, sklejony prompt pozytywny. */
  prompt: string;
  /** Prompt negatywny (jeśli dostawca go używa, np. Runware). */
  negative?: string;
  /** Wykorzystana operacja i jej moduł — do logów/UI. */
  operation: OperationId;
  operationLabel: string;
  requiresDualImage: boolean;
  requiresCleanPlate: boolean;
  /** ID wszystkich modułów użytych w sklejce (audyt). */
  usedModuleIds: string[];
}

const TOKEN_RE = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

/** Domyślne etykiety slotów obrazów. */
const DEFAULT_LABELS = { image1: 'image 1', image2: 'image 2' };

/**
 * Podmienia tokeny {{...}} na wartości. Nieznany/pusty token zostaje wycięty
 * (zamiast zostawiać brzydkie {{X}} w promptcie).
 */
function resolveTokens(
  body: string,
  refs: ReferenceValues,
  labels: { image1: string; image2: string },
): string {
  const map: Record<string, string | undefined> = {
    IMAGE_1: labels.image1,
    IMAGE_2: labels.image2,
    SUBJECT: refs.SUBJECT,
    SOURCE_OBJECT: refs.SOURCE_OBJECT,
    TARGET_OBJECT: refs.TARGET_OBJECT,
    SOURCE_COORD: refs.SOURCE_COORD,
    TARGET_COORD: refs.TARGET_COORD,
    USER_INSTRUCTION: refs.USER_INSTRUCTION,
    // Referencje bloków stałych renderujemy jako czytelne odnośniki tekstowe.
    LIGHT_REF: 'the lighting lock above',
    GRAIN_REF: 'the grain/grade lock above',
    ENVIRONMENT_REF: 'the environment lock above',
    IDENTITY_REF: 'the identity lock above',
    POSITION_REF: 'the pose/orientation lock above',
    SCALE_REF: 'the world-scale lock above',
  };

  return body.replace(TOKEN_RE, (_m, key: string) => {
    const val = map[key];
    return val && val.trim() ? val.trim() : '';
  })
  // sprzątanie po wyciętych tokenach: podwójne spacje, puste "" w cudzysłowach
  .replace(/""/g, '')
  .replace(/[ \t]{2,}/g, ' ')
  .replace(/[ \t]+\n/g, '\n')
  .trim();
}

/**
 * Skleja finalny prompt dla wybranej operacji i dostawcy.
 */
export function composePrompt(input: ComposeInput): ComposeOutput {
  const provider = input.provider ?? 'gemini';
  const set = getPromptSet(provider);
  const labels = {
    image1: input.imageLabels?.image1 ?? DEFAULT_LABELS.image1,
    image2: input.imageLabels?.image2 ?? DEFAULT_LABELS.image2,
  };

  const op = set.operations[input.operation] ?? set.operations.general_edit;
  const usedModuleIds: string[] = [];

  // 1. STAŁE — tylko te, których wymaga operacja, w kolejności ordinal.
  const neededKeys = op.requiresConstants ?? [];
  const constantBlocks = neededKeys
    .map((k) => set.constants[k])
    .filter(Boolean)
    .sort((a, b) => a.ordinal - b.ordinal)
    .map((m) => {
      usedModuleIds.push(m.id);
      return resolveTokens(m.body, input.references, labels);
    });

  // 2. OPERACJA (prompt sytuacyjny).
  usedModuleIds.push(op.id);
  const operationBlock = resolveTokens(op.body, input.references, labels);

  // 3. OPIS GENERACJI (co ma powstać) — jeśli podany osobno.
  const subject = input.references.SUBJECT?.trim();
  const subjectBlock = subject ? `[GENERATION BRIEF]\n${subject}` : '';

  // 4. POZYTYWNE — zawsze na dole.
  const positiveBlocks = set.positives
    .slice()
    .sort((a, b) => a.ordinal - b.ordinal)
    .map((m) => {
      usedModuleIds.push(m.id);
      return resolveTokens(m.body, input.references, labels);
    });

  const prompt = [
    ...constantBlocks,
    operationBlock,
    subjectBlock,
    ...positiveBlocks,
  ]
    .filter((s) => s && s.trim())
    .join('\n\n')
    .trim();

  return {
    prompt,
    negative: set.negative,
    operation: input.operation,
    operationLabel: op.label,
    requiresDualImage: !!op.requiresDualImage,
    requiresCleanPlate: !!op.requiresCleanPlate,
    usedModuleIds,
  };
}
