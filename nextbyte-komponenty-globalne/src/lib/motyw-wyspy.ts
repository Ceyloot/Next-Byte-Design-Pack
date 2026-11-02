import { supabase } from '@/integrations/supabase/client';
import { zmienneSzklaDlaMotywu, ZMIENNE_SZKLA } from '@/lib/szklo-motywu';
import type { PodlozeOkien } from '@/hooks/usePodlozeOkien';

/*
  ════════════════════════════════════════════════════════════════════════
   WYSPA MOTYWU — fragment strony w innym motywie niż platforma (28.09.2026)
  ════════════════════════════════════════════════════════════════════════

  Pierwszy użytkownik: okno Asystenta nad płótnem tablicy. Płótno jest jasne
  albo ciemne niezależnie od motywu platformy, a okno ma iść za płótnem
  (prośba Michała, patrz `usePodlozeOkien`).

  JAK MOTYW WCHODZI NA WYSPĘ — tak samo jak na `<html>`:
   • kolory motywu Z BAZY (`color_settings`), cały zestaw, nie wybrane zmienne:
     platforma trzyma motyw w ~40 zmiennych inline na `<html>`, a każda,
     której wyspa nie nadpisze, przeciekłaby z motywu platformy;
   • zmienne szkła z tej samej funkcji co `useGlobalTheme` i Biblioteka
     (`zmienneSzklaDlaMotywu`) — inaczej okno miałoby inne szkło niż platforma
     w tym samym motywie;
   • `data-theme` na korzeniu wyspy — od niego zależą łatki jasnego motywu
     w `index.css` (`[data-theme="nextbyte-light"] .klasa`).

  JAKI MOTYW: jasny to `nextbyte-light` (jedyny jasny w bazie — komentarz
  nad łatkami w `index.css`), ciemny to `dark-theme` (domyślny platformy).
  Wyspa powstaje tylko wtedy, gdy podłoże NIE zgadza się z motywem platformy:
  kto ma kupiony ciemny „Aurora", nad ciemnym płótnem zostaje przy Aurorze.
*/

export const MOTYW_DLA_PODLOZA: Record<PodlozeOkien, string> = {
  jasne: 'nextbyte-light',
  ciemne: 'dark-theme',
};

/** Jasność z wartości „H S% L%" albo `null`. Ta sama reguła co `useJasnyMotyw`. */
export const jasnoscHsl = (wartosc?: string | null): number | null => {
  const dopasowanie = (wartosc ?? '').trim().match(/(\d+(?:\.\d+)?)%\s*$/);
  return dopasowanie ? Number(dopasowanie[1]) : null;
};

/**
 * Który motyw nałożyć na wyspę — albo `null`, gdy wyspa jest zbędna
 * (brak deklaracji podłoża albo podłoże zgadza się z motywem platformy).
 */
export function motywWyspy(podloze: PodlozeOkien | null, platformaJasna: boolean): string | null {
  if (!podloze) return null;
  if ((podloze === 'jasne') === platformaJasna) return null;
  return MOTYW_DLA_PODLOZA[podloze];
}

/**
 * Pełen zestaw zmiennych wyspy: kolory motywu + szkło.
 *
 * Zmienne szkła, których motyw NIE ustawia (ciemny ustawia 3 z 8), dostają
 * `initial`. `useGlobalTheme` robi z nimi `removeProperty` na `<html>` —
 * na wyspie nie ma czego zdjąć, bo wartość dziedziczy się z `<html>`, czyli
 * z motywu platformy (np. ranty 0.24/0.32/0.38 jasnego). `initial` to
 * wartość „nieustawiona": każde użycie w arkuszu ma zapas równy wartości
 * z `:root` (`var(--nb-tafla-krawedz, 0.26)`, `var(--nb-plama-nasycenie, 1)`),
 * więc wynik jest ten sam co na platformie z tym motywem.
 *
 * Wyjątek: `--nb-szklo-mute` na ciemnym = `--muted-foreground`. Materiał czyta
 * go jako `var(--nb-szklo-mute, var(--muted-foreground))`, więc na ciemnej
 * wyspie wygląda to jak na ciemnej platformie — a łatki jasnego motywu, które
 * pod jasną platformą sięgają też do ciemnej wyspy (`[data-theme] .klasa`
 * dopasowuje się do `<html>`), dostają jasny tekst drugoplanowy zamiast
 * swojego zapasu 47% (szary na ciemnym, poniżej progu 4,5 : 1).
 */
export function zmienneWyspy(kolory: Record<string, string>): Record<string, string> {
  const szklo = zmienneSzklaDlaMotywu({
    card: kolory['--card'],
    mutedForeground: kolory['--muted-foreground'],
  });
  const wynik: Record<string, string> = { ...kolory, ...szklo };
  if (!('--nb-szklo-mute' in szklo) && kolory['--muted-foreground']) {
    wynik['--nb-szklo-mute'] = kolory['--muted-foreground'];
  }
  for (const nazwa of ZMIENNE_SZKLA) {
    if (!(nazwa in wynik)) wynik[nazwa] = 'initial';
  }
  return wynik;
}

/**
 * Czy kolory nadają się na wyspę dla tego podłoża: tło po właściwej stronie
 * 50% i tekst czytelny na tle (ta sama bramka co `hasReadableBaseColors`
 * w `useGlobalTheme`). Gdyby ktoś w panelu przemalował motyw, okno zostaje
 * przy motywie platformy zamiast pokazać coś nieczytelnego.
 */
export function koloryPasujaDoPodloza(kolory: Record<string, string>, podloze: PodlozeOkien): boolean {
  const tlo = jasnoscHsl(kolory['--background']);
  const tekst = jasnoscHsl(kolory['--foreground']);
  if (tlo === null || tekst === null) return false;
  if ((tlo > 50) !== (podloze === 'jasne')) return false;
  return Math.abs(tlo - tekst) >= 35;
}

/* ── Pobieranie z bazy ──────────────────────────────────────────────────
   Pamięć w module (jedno zapytanie na motyw na wczytanie strony) i kopia
   w `localStorage`, żeby przy następnej wizycie okno miało motyw od
   pierwszej klatki. Kopia jest tylko startem — baza zawsze ją odświeża. */

const KLUCZ_KOPII = 'nextbyte_motyw_wyspy_';
const wPamieci = new Map<string, Record<string, string>>();
const wLocie = new Map<string, Promise<Record<string, string> | null>>();

/** Kolory motywu znane od ręki (pamięć albo kopia), bez sieci. */
export function koloryMotywuZPamieci(nazwa: string): Record<string, string> | null {
  const znane = wPamieci.get(nazwa);
  if (znane) return znane;
  try {
    const kopia = localStorage.getItem(KLUCZ_KOPII + nazwa);
    if (kopia) {
      const kolory = JSON.parse(kopia) as Record<string, string>;
      if (kolory && typeof kolory === 'object') return kolory;
    }
  } catch {
    // Brak dostępu do localStorage (tryb prywatny) — zostaje baza.
  }
  return null;
}

/** Kolory motywu z bazy (`color_themes` → `color_settings`). `null` przy błędzie. */
export function pobierzKoloryMotywu(nazwa: string): Promise<Record<string, string> | null> {
  const trwa = wLocie.get(nazwa);
  if (trwa) return trwa;
  const zadanie = (async () => {
    const { data: motyw, error: e1 } = await supabase
      .from('color_themes')
      .select('id')
      .eq('name', nazwa)
      .eq('is_active', true)
      .maybeSingle();
    if (e1 || !motyw) return null;
    const { data: wiersze, error: e2 } = await supabase
      .from('color_settings')
      .select('css_variable, hsl_value')
      .eq('theme_id', (motyw as { id: string }).id);
    if (e2 || !wiersze?.length) return null;
    const kolory: Record<string, string> = {};
    for (const w of wiersze as { css_variable: string; hsl_value: string }[]) {
      if (w.css_variable?.startsWith('--') && w.hsl_value) kolory[w.css_variable] = w.hsl_value;
    }
    wPamieci.set(nazwa, kolory);
    try { localStorage.setItem(KLUCZ_KOPII + nazwa, JSON.stringify(kolory)); } catch { /* jw. */ }
    return kolory;
  })().catch(() => null);
  wLocie.set(nazwa, zadanie);
  /* Nieudane pobranie nie zostaje w pamięci na zawsze — następne otwarcie
     okna spróbuje jeszcze raz. */
  void zadanie.then((wynik) => { if (!wynik) wLocie.delete(nazwa); });
  return zadanie;
}

/**
 * Kolory motywu podane z zewnątrz — bez sieci. Dla podglądów deweloperskich
 * (`/dev/okna-tablic`), które pokazują wyspę bez logowania i bez bazy:
 * `pobierzKoloryMotywu` odda te kolory, zamiast pytać `color_settings`.
 * Sama kopia w `localStorage` nie wystarczy — daje pierwszą klatkę, ale
 * `useMotywWyspy` i tak pyta bazę o odświeżenie.
 */
export function podstawKoloryMotywu(nazwa: string, kolory: Record<string, string>): void {
  wPamieci.set(nazwa, kolory);
  wLocie.set(nazwa, Promise.resolve(kolory));
}
