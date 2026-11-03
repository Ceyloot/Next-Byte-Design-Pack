/**
 * ════════════════════════════════════════════════════════════════════════
 *  POBIERANIE CAŁEJ TABELI, A NIE PIERWSZEGO TYSIĄCA
 * ════════════════════════════════════════════════════════════════════════
 *
 * PostgREST oddaje maksymalnie 1000 wierszy na żądanie i NIE MÓWI, że uciął.
 * Zapytanie bez `.range()` wygląda więc identycznie, czy tabela ma 900 wierszy,
 * czy 90 000 — z tą różnicą, że w drugim przypadku widać 1% prawdy.
 *
 * ── SKĄD TO SIĘ WZIĘŁO (03.08.2026) ─────────────────────────────────────
 * Zakładka „Tokeny AI" w Zarządzie liczyła koszt AI z `chat_ai_analytics`
 * zapytaniem `.select('*')` bez stronicowania. Zmierzone na produkcji przy
 * widoku 90-dniowym:
 *
 *     wierszy   4 937 realnie  →  1 000 widzianych
 *     koszt     120,91 USD     →     29,89 USD
 *     tokeny    51,6 mln       →      9,0 mln
 *
 * 75% kosztu nie było widać, a etykieta mówiła „90 dni", choć dane sięgały
 * 28 dni wstecz. To samo dotyczyło kosztów firmowych i dwóch paneli w Admin
 * Panelu — łącznie sześciu zapytań.
 *
 * Najgorsze w tym błędzie jest to, że panel nie wygląda na zepsuty. Pokazuje
 * spójne, wiarygodne liczby, tylko cztery razy za małe.
 *
 * ── UŻYCIE ──────────────────────────────────────────────────────────────
 *     const wiersze = await pobierzWszystkieWiersze((od, do_) =>
 *       supabase.from('chat_ai_analytics')
 *         .select('*')
 *         .gte('created_at', start)
 *         .order('created_at', { ascending: false })
 *         .range(od, do_));
 *
 * Kolejność (`.order`) MUSI być określona przez wołającego i musi być stabilna.
 * Bez niej Postgres nie gwarantuje powtarzalności między stronami i przy
 * kolejnych żądaniach można dostać ten sam wiersz dwa razy albo pominąć inny.
 */

/** Ile wierszy w jednym żądaniu. 1000 to twardy sufit PostgREST-a. */
const KROK = 1000;

/**
 * Bezpiecznik na wypadek rosnącej tabeli: pobieramy najwyżej tyle wierszy.
 *
 * 50 000 przy obecnym tempie (~10 tys. wywołań AI rocznie) to zapas na lata,
 * a jednocześnie granica, powyżej której liczenie statystyk w przeglądarce
 * i tak przestaje być rozsądne — wtedy trzeba to przenieść do funkcji edge
 * albo widoku zagregowanego w bazie.
 */
const SUFIT = 50_000;

export interface WynikPobrania<T> {
  wiersze: T[];
  /**
   * `true`, gdy zatrzymał nas SUFIT, a nie koniec danych. Panel powinien to
   * POWIEDZIEĆ użytkownikowi — cicha niekompletność jest dokładnie tym błędem,
   * dla którego ten plik powstał.
   */
  urwane: boolean;
}

export async function pobierzWszystkieWierszeZeStanem<T>(
  zapytanie: (od: number, do_: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<WynikPobrania<T>> {
  const wiersze: T[] = [];

  for (let od = 0; od < SUFIT; od += KROK) {
    const { data, error } = await zapytanie(od, od + KROK - 1);
    // Błąd rzucamy dalej — react-query pokaże stan błędu zamiast udawać,
    // że danych po prostu nie ma.
    if (error) throw new Error(error.message);
    if (!data) break;
    wiersze.push(...data);
    if (data.length < KROK) return { wiersze, urwane: false };
  }

  return { wiersze, urwane: wiersze.length >= SUFIT };
}

/** Wariant dla miejsc, które nie pokazują informacji o urwaniu. */
export async function pobierzWszystkieWiersze<T>(
  zapytanie: (od: number, do_: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const { wiersze } = await pobierzWszystkieWierszeZeStanem(zapytanie);
  return wiersze;
}
