/**
 * ════════════════════════════════════════════════════════════════════════
 *  DWA GLOBALNE STYLE PRZYCISKÓW NextByte — jedyne źródło prawdy
 * ════════════════════════════════════════════════════════════════════════
 *
 * Powód istnienia tego pliku: sam Panel Główny miał SZEŚĆ różnych języków
 * przycisku naraz (`ghost`, `nextbyte`, `glass`, `outline`, `default` plus
 * trzy rodzaje `TileAction`), a w całym kodzie żyło 325 unikalnych ręcznych
 * cieni. Zmiana wyglądu przycisku wymagała wtedy obejścia wszystkiego.
 * Od teraz są dwa style i obydwa mieszkają TUTAJ.
 *
 * ── STYL 1 — SZKŁO ──────────────────────────────────────────────────────
 * Główne wezwanie. Zasada: DOKŁADNIE JEDNO na blok / kartę / ekran-sekcję.
 * Ma poświatę, uniesienie przy najechaniu i przesuwane pasmo światła, więc
 * gdy dostanie go wszystko, hierarchia umiera i cały ekran krzyczy naraz.
 * Wygląd siedzi w klasie `.nb-glass` w index.css i liczy się od zmiennych
 * motywu, więc poświata idzie za kolorem wybranym przez UŻYTKOWNIKA.
 *
 * ── STYL 2 — OBWÓDKA ────────────────────────────────────────────────────
 * Wszystko pozostałe. Obwódka + ~2% wypełnienia, ZERO wypełnienia kolorem.
 * Akcent niesie tekst i obwódka, nigdy tło.
 *
 * ── CZEGO NIE ROBIĆ ─────────────────────────────────────────────────────
 * • Nie dopisywać trzeciego stylu „bo ten przypadek jest wyjątkowy".
 *   Wyjątkiem jest wyłącznie akcja niszcząca (`usun`) i sterowanie ikonami.
 * • Nie zaszywać kolorów z palety Tailwinda (`bg-black`, `text-white`,
 *   `border-blue-400`). Jedyne dopuszczalne źródła to zmienne motywu.
 * • Nie zmieniać tych stałych „na oko". Obie przeszły pomiar na wszystkich
 *   14 motywach — patrz komentarz przy obwódce `.nb-glass` w index.css.
 */

/**
 * STYL 1 — rdzeń szkła. Sama warstwa barwna, BEZ geometrii.
 * Wysokość, odstępy i promień dokłada miejsce użycia, bo przycisk w pasku
 * ma inne wymiary niż przycisk w stopce kafelka.
 */
export const RDZEN_STYL_1 = 'nb-glass text-foreground hover:text-foreground';

/**
 * STYL 2 — rdzeń obwódki. Też bez geometrii i bez samego słowa `border`,
 * żeby konsument decydował o grubości.
 *
 * `bg-foreground/[0.02]`, a nie `bg-white/[0.02]`: `--foreground` odwraca
 * się razem z motywem, więc w ciemnych daje 2% bieli, w jasnych 2% czerni.
 * Biel była tu wcześniej i na jasnych motywach znikała bez śladu.
 */
export const RDZEN_STYL_2 = 'nb-obwodka';

/**
 * Wariant niszczący. NIE jest trzecim stylem — to STYL 2 przemalowany na
 * `--destructive`, bo ostrzeżenie musi wyłamywać się z reszty.
 */
export const RDZEN_USUN =
  'border-destructive/40 bg-destructive/[0.06] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.12]';

/**
 * Wariant cichy — sterowanie, które ma zniknąć, dopóki go nie szukasz:
 * strzałki karuzeli, zamknięcie, „odłóż". Bez obwódki i bez tła.
 */
export const RDZEN_CICHY =
  'border-transparent bg-transparent text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground';

/** Promień wspólny dla obu stylów — jeden, żeby nie było czterech. */
export const PROMIEN_PRZYCISKU = 'rounded-xl';
