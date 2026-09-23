/**
 * ════════════════════════════════════════════════════════════════════════
 *  ŹRÓDŁO REJESTRACJI — parametry wejścia, które muszą przeżyć logowanie
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał, 10.08.2026: „czy w zakładce rejestracje możemy widzieć źródło,
 * czy z tiktoka, instagrama, czy z wyszukiwania w google, czy z youtube".
 *
 * Ścieżka E-MAILOWA czytała parametry prosto z adresu w chwili wysyłki
 * formularza i to działa — użytkownik cały czas siedzi na tej samej stronie.
 *
 * Ścieżka GOOGLE tak nie może. Wejście wygląda tak:
 *     /auth?utm_source=tiktok  →  popup Google  →  /auth/callback  →  dialog
 * Zanim dojdzie do zapisu konta, `window.location.search` jest już inny —
 * parametry wejścia przepadły po drodze. Dlatego zapisujemy je od razu przy
 * wejściu na stronę logowania i odczytujemy dopiero przy zakładaniu konta.
 *
 * ZMIERZONE, ZANIM TO POWSTAŁO: po wdrożeniu zapisu źródła (19.03.2026)
 * powstały 24 konta przez Google i ZERO z nich miało `registration_source`.
 * Zakładka „Rejestracje" rysowała wykres, w którym połowa ruchu nie istniała.
 *
 * `sessionStorage`, nie `localStorage`: to dane jednego wejścia, nie profil
 * użytkownika. Mają zniknąć razem z kartą — inaczej ktoś, kto raz wszedł
 * z TikToka, jeszcze za pół roku zakładałby konto „z TikToka".
 */

const KLUCZ = 'nb-utm-wejscia';

/** Parametry, które uznajemy za źródło wejścia. */
const POLA = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref'] as const;

export type DaneUtm = Partial<Record<(typeof POLA)[number], string>>;

/** Wyciąga parametry z podanego adresu (domyślnie bieżącego). */
export const utmZAdresu = (search = window.location.search): DaneUtm => {
  const p = new URLSearchParams(search);
  const out: DaneUtm = {};
  for (const pole of POLA) {
    const v = p.get(pole);
    if (v) out[pole] = v.slice(0, 120);
  }
  return out;
};

/**
 * Zapamiętuje parametry wejścia, jeśli w adresie cokolwiek jest.
 * Pustego adresu NIE zapisujemy — inaczej powrót z Google (już bez
 * parametrów) skasowałby to, po co ten zapis w ogóle istnieje.
 */
export const zapamietajUtm = (search = window.location.search): void => {
  const dane = utmZAdresu(search);
  if (Object.keys(dane).length === 0) return;
  try {
    sessionStorage.setItem(KLUCZ, JSON.stringify(dane));
  } catch {
    /* prywatne okno / brak miejsca — źródło po prostu nie zostanie zapisane */
  }
};

/**
 * Odczytuje zapamiętane parametry; gdy ich nie ma, próbuje jeszcze bieżącego
 * adresu. Zwraca `null`, a nie pusty obiekt — wołający ma odróżnić „nic nie
 * wiemy" od „wiemy, że pusto".
 */
export const odczytajUtm = (): DaneUtm | null => {
  try {
    const raw = sessionStorage.getItem(KLUCZ);
    if (raw) {
      const dane = JSON.parse(raw) as DaneUtm;
      if (dane && Object.keys(dane).length > 0) return dane;
    }
  } catch {
    /* uszkodzony wpis — schodzimy do adresu */
  }
  const zAdresu = utmZAdresu();
  return Object.keys(zAdresu).length > 0 ? zAdresu : null;
};

/** Sprząta po udanej rejestracji, żeby kolejne konto z tej samej karty nie odziedziczyło źródła. */
export const zapomnijUtm = (): void => {
  try {
    sessionStorage.removeItem(KLUCZ);
  } catch {
    /* nic nie szkodzi */
  }
};
