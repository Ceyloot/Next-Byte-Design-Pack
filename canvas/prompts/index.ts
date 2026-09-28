/**
 * CANVAS — PRZESTRZEŃ PROMPTÓW (punkt wejścia)
 * =============================================
 *   gemini/    sekcja 1: prompty analizy (zdjęcie docelowe, opis sceny)
 *   operacje/  sekcja 2: jeden prompt na sytuację (object_swap, …)
 *   bricks/    sekcja 3: cegiełki-zasady (light-rule, position-rule, …)
 *   skladaj.ts składarka: bricks + operacja + opis Gemini + polecenie → prompt
 *
 * Przepływ krok po kroku: `canvas/README.md`.
 */
export * from './types'
export * from './gemini'
export * from './operacje'
export * from './bricks'
export * from './pozytyw'
export * from './skladaj'
