/**
 * NEXTBYTE CANVAS — SYSTEM PROMPTÓW (typy bazowe)
 * =================================================
 *
 * Cały Canvas nie trzyma już promptów "na sztywno" w kodzie logiki. Prompty żyją
 * w tej przestrzeni (`canvas/prompts/`) jako oddzielne, zidentyfikowane moduły.
 * Silnik (`composer.ts`) skleja z nich finalny prompt według stałej struktury:
 *
 *   [ STAŁE MODYFIKATORY ]   ← zawsze na górze (światło, ziarno, środowisko, tożsamość, pozycja…)
 *   [ PROMPT SYTUACYJNY   ]   ← wybierany DYNAMICZNIE (Gemini decyduje: swap? transfer? removal?)
 *   [ OPIS GENERACJI      ]   ← co Gemini ma wygenerować ({{SUBJECT}})
 *   [ PROMPT POZYTYWNY    ]   ← ogólne wytyczne jakości, zawsze na dole
 *
 * W treści promptów używamy "specyficznych nawiasów" — tokenów referencyjnych
 * w formacie {{TOKEN}} — które silnik podmienia na konkretne wartości
 * (np. {{IMAGE_1}}, {{LIGHT_REF}}, {{IDENTITY_REF}}, {{POSITION_REF}}).
 */

/** Dostawca modelu, do którego przeznaczony jest prompt. */
export type PromptProvider = 'gemini' | 'runware';

/**
 * Kategoria (tier) modułu promptu — decyduje, GDZIE w sklejce ląduje.
 * - `constant`   → blok stały, zawsze doklejany na górze (przed promptem sytuacyjnym).
 * - `operation`  → prompt sytuacyjny, wybierany dynamicznie na podstawie klasyfikacji.
 * - `positive`   → blok ogólny/jakościowy, zawsze doklejany na dole.
 */
export type PromptTier = 'constant' | 'operation' | 'positive';

/**
 * Identyfikatory operacji sytuacyjnych. To jest zamknięty słownik, na którym
 * operuje zarówno klasyfikator Gemini, jak i rejestr promptów — dzięki temu
 * model nie może "wyciągnąć" promptu z object_swap, gdy sytuacja nim nie jest.
 */
export type OperationId =
  | 'object_transfer'   // przeniesienie obiektu (2 pineski, clean-plate źródła)
  | 'object_swap'       // podmiana obiektu z foto 1 na obiekt z foto 2
  | 'character_transfer'// przeniesienie postaci (tożsamość + strój) w scenerię
  | 'character_swap'    // podmiana postaci z zachowaniem pozy sceny docelowej
  | 'addition'          // dodanie nowego obiektu w punkcie
  | 'removal'           // usunięcie obiektu + rekonstrukcja tła
  | 'background_edit'   // zmiana/wymiana tła
  | 'style_change'      // zmiana stylu / gradingu całego kadru
  | 'general_edit';     // lokalna modyfikacja ogólna

/** Tokeny referencyjne podmieniane przez silnik w treści promptów. */
export type ReferenceToken =
  // Sloty obrazów — Gemini dynamicznie określa, który jest który.
  | 'IMAGE_1'
  | 'IMAGE_2'
  // Opis generacji od Gemini (co konkretnie ma powstać).
  | 'SUBJECT'
  // Nazwy i współrzędne obiektów z pinezek.
  | 'SOURCE_OBJECT'
  | 'TARGET_OBJECT'
  | 'SOURCE_COORD'
  | 'TARGET_COORD'
  // Surowa instrukcja użytkownika (fallback / modyfikator).
  | 'USER_INSTRUCTION'
  // Referencje bloków stałych — pozwalają wpleść stałą w konkretnym miejscu operacji.
  | 'LIGHT_REF'
  | 'GRAIN_REF'
  | 'ENVIRONMENT_REF'
  | 'IDENTITY_REF'
  | 'POSITION_REF'
  | 'SCALE_REF';

/**
 * Pojedynczy moduł promptu. Każdy blok stały, każda operacja i każdy blok
 * pozytywny jest jednym takim modułem — zidentyfikowanym i ponumerowanym.
 */
export interface PromptModule {
  /** Stabilne ID, np. `gemini.op.object_swap` albo `gemini.const.light`. */
  id: string;
  /** Numer porządkowy w obrębie swojego dostawcy i tieru (identyfikacja "po kolei"). */
  ordinal: number;
  provider: PromptProvider;
  tier: PromptTier;
  /** Dla `operation` — którą operację obsługuje ten moduł. */
  operation?: OperationId;
  /** Krótka, czytelna nazwa (PL) do UI / logów. */
  label: string;
  /** Treść promptu z tokenami {{...}}. */
  body: string;
  /**
   * Tokeny stałych, które MUSZĄ zostać doklejone gdy ten moduł jest aktywny.
   * Silnik dopisze odpowiadające im bloki stałe na górze sklejki.
   */
  requiresConstants?: Array<'LIGHT' | 'GRAIN' | 'ENVIRONMENT' | 'IDENTITY' | 'POSITION' | 'SCALE'>;
  /** Czy operacja potrzebuje dwóch wejściowych obrazów. */
  requiresDualImage?: boolean;
  /** Czy operacja potrzebuje maski clean-plate (rekonstrukcja źródła/tła). */
  requiresCleanPlate?: boolean;
}

/** Klucze bloków stałych — jednocześnie ich tokeny referencyjne. */
export type ConstantKey = 'LIGHT' | 'GRAIN' | 'ENVIRONMENT' | 'IDENTITY' | 'POSITION' | 'SCALE';

/** Wartości podstawiane pod tokeny referencyjne w trakcie sklejania. */
export interface ReferenceValues {
  IMAGE_1?: string;
  IMAGE_2?: string;
  SUBJECT?: string;
  SOURCE_OBJECT?: string;
  TARGET_OBJECT?: string;
  SOURCE_COORD?: string;
  TARGET_COORD?: string;
  USER_INSTRUCTION?: string;
}
