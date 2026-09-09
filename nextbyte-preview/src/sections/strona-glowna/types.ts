/** Podstrony publicznej witryny. `logowanie`/`rejestracja` żyją w osobnym
 *  podglądzie (sections/logowanie), ale zostają w tym typie, bo CTA na
 *  stronie głównej wciąż na nie kierują. */
export type HomePage =
  | 'home' | 'cennik' | 'b2b' | 'historia' | 'logowanie' | 'rejestracja'

/** Ekrany obsługiwane przez podgląd „Logowanie" */
export const EKRANY_AUTH = ['logowanie', 'rejestracja'] as const
export type EkranAuth = (typeof EKRANY_AUTH)[number]

export const jestEkranemAuth = (p: HomePage): p is EkranAuth =>
  (EKRANY_AUTH as readonly string[]).includes(p)

/** Pozycje pod-nawigacji podglądu „Strona główna" */
export const STRONY: { id: HomePage; label: string }[] = [
  { id: 'home',     label: 'Strona główna' },
  { id: 'cennik',   label: 'Cennik' },
  { id: 'b2b',      label: 'Dla firm' },
  { id: 'historia', label: 'Historia' },
]

/** Pozycje pod-nawigacji podglądu „Logowanie" */
export const STRONY_AUTH: { id: EkranAuth; label: string }[] = [
  { id: 'logowanie',   label: 'Logowanie' },
  { id: 'rejestracja', label: 'Rejestracja' },
]
