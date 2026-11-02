/**
 * ════════════════════════════════════════════════════════════════════════
 *  TYPOGRAFIA — CZTERY ROZMIARY, DWIE WAGI. Nic poza tym.
 * ════════════════════════════════════════════════════════════════════════
 *
 * STAN ZASTANY (zmierzone 02.08.2026 w siedmiu plikach `ui/`):
 *     10 różnych rozmiarów: 28, 24, 20, 18, 15, 14, 12, 11, 10, 9 px
 *      3 różne wagi: semibold, bold, medium
 *
 * Rozmiary różniące się o jeden piksel nie budują hierarchii — budują szum.
 * Nikt nie odróżni 10 px od 11 px, ale każdy odróżni 11 px od 14 px. Skala,
 * w której kolejne stopnie są ~1,3× większe, czyta się jako porządek; skala
 * z dziesięcioma stopniami czyta się jako brak decyzji.
 *
 * ── CZTERY ROZMIARY ─────────────────────────────────────────────────────
 *   LICZBA    28 px   wartość, która jest treścią kafelka (metryka, saldo)
 *   TYTUL     16 px   nazwa sekcji, karty, okna
 *   TRESC     14 px   zdania do przeczytania
 *   ETYKIETA  11 px   nazwa danych, plakietka, licznik — nie zdanie, tylko znacznik
 *
 * ── DWIE WAGI ───────────────────────────────────────────────────────────
 *   MOCNA     600 (semibold) — tytuły, etykiety, liczby
 *   ZWYKLA    400 (regular)  — zdania
 *
 * `bold` (700) i `medium` (500) wypadły świadomie. Przy dwóch wagach różnica
 * jest jednoznaczna; przy trzech trzeba się zastanawiać, którą wybrać, a to
 * pytanie nie ma dobrej odpowiedzi i za każdym razem pada inna.
 *
 * ── CZEGO TA SKALA NIE OBEJMUJE ─────────────────────────────────────────
 * Rozstrzelenia (`tracking`) i wersalików. To są WARIANTY etykiety, nie osobne
 * rozmiary: `ETYKIETA` bywa pisana wersalikami z rozstrzeleniem, gdy nazywa
 * zbiór danych, i normalnie, gdy jest licznikiem. Rozmiar zostaje ten sam.
 */

/** Cztery rozmiary. Wartości w pikselach, żeby nie zależeć od skali Tailwinda. */
export const ROZMIAR = {
  /** 28 px — liczba, która JEST treścią (metryka, saldo, wynik) */
  liczba: 'text-[28px] leading-[1.1]',
  /** 16 px — nazwa sekcji, karty, okna */
  tytul: 'text-[16px] leading-tight',
  /** 14 px — zdania */
  tresc: 'text-[14px] leading-normal',
  /** 11 px — nazwa danych, plakietka, licznik */
  etykieta: 'text-[11px] leading-tight',
} as const;

/** Dwie wagi. Trzeciej nie dopisywać. */
export const WAGA = {
  mocna: 'font-semibold',
  zwykla: 'font-normal',
} as const;

/**
 * Gotowe połączenia — używać ICH, a nie składać rozmiaru z wagą za każdym razem.
 * Dzięki temu „etykieta wersalikowa" wygląda tak samo w każdym komponencie,
 * zamiast być siedem razy złożona z tych samych klocków w siedmiu wariantach.
 */
export const TEKST = {
  /** wielka liczba — zawsze `tabular-nums`, inaczej cyfry skaczą przy odliczaniu */
  liczba: `${ROZMIAR.liczba} ${WAGA.mocna} tabular-nums tracking-tight`,
  /** nazwa sekcji / karty / okna */
  tytul: `${ROZMIAR.tytul} ${WAGA.mocna} tracking-tight`,
  /** zdanie w treści */
  tresc: `${ROZMIAR.tresc} ${WAGA.zwykla}`,
  /** zdanie drugoplanowe — ten sam rozmiar, słabszy kolor */
  trescCicha: `${ROZMIAR.tresc} ${WAGA.zwykla} text-muted-foreground`,
  /** NAZWA ZBIORU DANYCH — wersaliki z rozstrzeleniem */
  etykieta: `${ROZMIAR.etykieta} ${WAGA.mocna} uppercase tracking-[0.1em]`,
  /** znacznik bez wersalików: licznik, cena, jednostka */
  znacznik: `${ROZMIAR.etykieta} ${WAGA.mocna}`,
} as const;

export const SKALA_TYPOGRAFII = { ROZMIAR, WAGA, TEKST } as const;
