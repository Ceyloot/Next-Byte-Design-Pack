/**
 * Nowy system promptowania — punkt wejścia.
 *  - przygotujZAgentem: agent z oczami (Gemini) dopytuje albo pisze krótki prompt, kod wycina referencje i dopisuje skalę
 *  - przygotujNowySystem: prosty szablon bez AI (zapas, gdy agent zawiedzie)
 */
export { przygotujZAgentem, type WynikPrzygotowania } from './przygotuj'
export { przygotujNowySystem } from './szablon'
export type { Przygotowanie, PrzygotowaneZadanie } from './typy'
