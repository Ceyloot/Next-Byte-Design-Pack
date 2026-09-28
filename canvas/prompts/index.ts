/**
 * NEXTBYTE CANVAS — PRZESTRZEŃ PROMPTÓW (punkt wejścia)
 * ======================================================
 * Publiczne API zakładki Prompts. Reszta Canvasu (Json Prompts Engine,
 * Canvas AI, Canvas.tsx) importuje wyłącznie stąd.
 *
 * Struktura:
 *   prompts/
 *     types.ts              — typy bazowe, tokeny referencyjne, słownik operacji
 *     composer.ts           — silnik sklejania (stałe → operacja → opis → pozytyw)
 *     registry.ts           — centralny rejestr modułów (Gemini + Runware)
 *     gemini/{constants,operations,positive}.ts
 *     runware/{constants,operations,positive}.ts
 */
export * from './types';
export * from './registry';
export * from './composer';
