/**
 * Atrapa kursów platformy. Na platformie liczby przychodzą z bazy;
 * w paczce potrzebny jest tylko przelicznik do podpisu przykładowej karty metryki.
 */
export const KURS_USD_PLN = 4.0;
export function kursUsdPln(): number {
  return KURS_USD_PLN;
}
