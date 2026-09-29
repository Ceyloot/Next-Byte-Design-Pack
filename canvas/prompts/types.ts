/**
 * CANVAS — TYPY SYSTEMU PROMPTÓW
 * ===============================
 * Trzy sekcje systemu:
 *   1. gemini/   — prompty analizy (zdjęcie docelowe + opis sceny)
 *   2. operacje/ — jeden prompt na sytuację (object_swap, character_transfer…)
 *   3. bricks/   — cegiełki-zasady, bez których generacja nie może przejść
 *
 * Składarka (`skladaj.ts`) łączy je w jeden prompt dla modelu obrazu.
 * Przepływ krok po kroku: patrz `canvas/README.md`.
 */

/** Zamknięty słownik operacji — Gemini wybiera dokładnie jedną. */
export type OperationId =
  | 'object_swap'
  | 'object_transfer'
  | 'character_swap'
  | 'character_transfer'
  | 'removal'
  | 'addition'
  | 'background_change'
  | 'face_swap'
  | 'clothing_change'
  | 'texture_change'
  | 'season_change'
  | 'time_of_day_change'
  | 'effect_add'
  | 'style_change'
  | 'general_fix';

/** Identyfikatory cegiełek (numer + nazwa reguły). */
export type BrickId =
  | 'light-rule'
  | 'position-rule'
  | 'scale-rule'
  | 'perspective-rule'
  | 'depth-occlusion-rule'
  | 'contact-rule'
  | 'reflection-rule'
  | 'grain-medium-rule'
  | 'fidelity-rule'
  | 'framing-rule'
  | 'output-contract-rule'
  | 'clean-plate-rule'
  | 'singularity-rule'
  | 'object-identity-rule'
  | 'donor-isolation-rule'
  | 'no-copy-paste-rule'
  | 'edge-blend-rule'
  | 'character-identity-rule'
  | 'hair-rule'
  | 'skin-body-rule'
  | 'clothing-rule'
  | 'pose-expression-rule'
  | 'hands-limbs-rule'
  | 'background-rule'
  | 'time-of-day-rule'
  | 'season-rule'
  | 'style-rule'
  | 'texture-rule'
  | 'effect-rule'
  | 'minimal-change-rule';

/**
 * Cegiełka: pojedyncza, nienegocjowalna zasada. Numer wyznacza kolejność
 * w złożonym prompcie (rosnąco), niezależnie od kolejności na liście operacji.
 *
 * Tokeny w `tekst`: {{IMAGE_TARGET}}, {{IMAGE_DONOR}}, {{PIN_TARGET}}, {{PIN_SOURCE}}.
 */
export interface Brick {
  id: BrickId;
  numer: number;
  /** nazwa PL do UI / logów */
  nazwa: string;
  /** pełna treść zasady (EN — język modelu obrazu) */
  tekst: string;
}

/** Czy operacja potrzebuje zdjęcia-dawcy (obiekt/osoba/styl z drugiego zdjęcia). */
export type WymaganieDawcy = 'brak' | 'opcjonalny' | 'wymagany';

/**
 * Operacja: jeden uniwersalny prompt pod konkretną sytuację. Nie zawiera
 * reguł ogólnych — te są w bricks; operacja tylko wskazuje, które bricki włączyć.
 */
export interface Operation {
  id: OperationId;
  /** nazwa PL */
  nazwa: string;
  /** hasła/sytuacje, po których Gemini rozpoznaje tę operację (trafiają do promptu Gemini) */
  kiedyUzyc: string;
  /** bricki włączane przez tę operację */
  bricks: BrickId[];
  dawca: WymaganieDawcy;
  /** czy stare miejsce obiektu/osoby trzeba odbudować (clean plate) */
  czystaPlyta: boolean;
  /** misja — 1–3 zdania, EN */
  misja: string;
  /** kroki wykonania, EN */
  kroki: string[];
  /**
   * Gotowy prompt (np. ze Studia Zdjęć) przejęty 1:1: składarka bierze go zamiast
   * bricków i kroków, dokładając tylko mapę obrazów i pinesek oraz polecenie.
   */
  gotowy?: 'studio-character-swap' | 'studio-face-swap';
}

/** Rola pineski w operacji. */
export type RolaPineski = 'source' | 'target';

/** Pineska przekazywana do systemu (współrzędne znormalizowane 0–1). */
export interface PineskaWejscie {
  /** numer pokazany użytkownikowi i na magentowej kropce (od 1) */
  numer: number;
  /** indeks zdjęcia w kolejności wysyłki do Gemini (od 1) */
  zdjecie: number;
  x: number;
  y: number;
  /** nazwa obiektu pod pineską, jeśli już znana */
  nazwa?: string;
}

// ── Wyniki analizy Gemini ────────────────────────────────────────────────

/** Wynik promptu 1: które zdjęcie jest docelowe + jaka operacja. */
export interface AnalizaDocelowego {
  /** indeks (od 1) zdjęcia docelowego — w kolejności wysłanej do Gemini */
  zdjecieDocelowe: number;
  /** indeksy zdjęć-dawców */
  zdjeciaDawcow: number[];
  operacja: OperationId;
  /** rola każdej pineski w tej operacji */
  role: { pineska: number; rola: RolaPineski }[];
  /** krótkie uzasadnienie (log/UI) */
  powod: string;
}

/** Opis jednej pineski z promptu 2. */
export interface OpisPineski {
  pineska: number;
  /** krótka nazwa całego obiektu/osoby pod pineską */
  nazwa: string;
  /** miejsce w kadrze (np. "on the wooden table, left of the window") */
  miejsce: string;
  /** wygląd: kolor, materiał, stan, cechy */
  wyglad: string;
  /** szacowane wymiary rzeczywiste z kotwicą skali */
  wymiary: string;
}

/** Wynik promptu 2: miejsce, wygląd i wymiary. */
export interface OpisSceny {
  /** miejsce/lokalizacja sceny w jednym zdaniu */
  miejsce: string;
  /** wygląd zdjęcia: medium, światło, ziarno, nastrój */
  wyglad: string;
  /** kotwice skali widoczne w kadrze (znane rozmiary) */
  kotwice: string;
  pineski: OpisPineski[];
}

/** Obraz w kolejności wysyłki do generatora. */
export interface ObrazWejscia {
  /** 1 = docelowy (zawsze), 2.. = dawcy w kolejności pinesek */
  numer: number;
  rola: 'target' | 'donor';
}
