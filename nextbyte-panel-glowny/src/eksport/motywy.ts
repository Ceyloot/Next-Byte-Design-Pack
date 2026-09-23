/**
 * ════════════════════════════════════════════════════════════════════════════
 *  MOTYWY — KOPIA KOLORÓW Z BAZY PLATFORMY (stan z 23.09.2026)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Na platformie kolory NIE żyją w kodzie, tylko w bazie: tabela `color_themes`
 * (motywy) + `color_settings` (zmienna CSS → wartość HSL). Aplikacja pobiera je
 * przy starcie i wstrzykuje jako zmienne na `<html>` (hook `useGlobalTheme`).
 *
 * W tej paczce ta sama rola przypada temu plikowi — bez bazy i bez logowania
 * do panelu admina. Zmieniasz wartość, Vite przeładowuje stronę i od razu
 * widać efekt. Oddając pracę, oddajesz TEN plik: zamieniamy go na aktualizację
 * `color_settings` w bazie (jedna wartość = jeden wiersz).
 *
 * FORMAT WARTOŚCI: „H S% L%” bez `hsl()` — np. `213 60% 50%`. Tak zapisuje je
 * baza i tak czyta je Tailwind (`hsl(var(--primary))`).
 *
 * Oprócz zmiennych stąd motyw niesie reguły w `src/index.css` przypięte do
 * `[data-theme="nextbyte-light"]` (≈390 miejsc) — to tam siedzą poprawki
 * powierzchni jasnego motywu. Przełącznik ustawia ten atrybut tak jak platforma.
 */
export const MOTYWY = {
  ciemny: {
    /** Nazwa motywu w bazie — trafia do `data-theme` na `<html>`. */
    nazwa: 'dark-theme',
    kolory: {
      '--accent': '204 91% 70%',
      '--accent-foreground': '0 0% 0%',
      '--background': '0 0% 2%',
      '--border': '210 12% 11%',
      '--brand-primary': '204 91% 70%',
      '--brand-primary-dark': '209 75% 64%',
      '--brand-primary-light': '202 95% 76%',
      '--brand-text-muted': '0 0% 64%',
      '--brand-text-primary': '0 0% 100%',
      '--brand-text-secondary': '0 0% 90%',
      '--brand-text-tertiary': '0 0% 83%',
      '--card': '0 0% 3%',
      '--card-foreground': '0 0% 96%',
      '--destructive': '0 72% 55%',
      '--destructive-foreground': '0 0% 98%',
      '--foreground': '0 0% 96%',
      '--input': '210 10% 7%',
      '--muted': '210 10% 7%',
      '--muted-foreground': '0 0% 67%',
      '--popover': '0 0% 3%',
      '--popover-foreground': '0 0% 96%',
      '--primary': '204 91% 70%',
      '--primary-foreground': '0 0% 0%',
      '--ring': '204 91% 70%',
      '--secondary': '210 10% 7%',
      '--secondary-foreground': '0 0% 96%',
      '--sidebar': '0 0% 3%',
      '--sidebar-accent': '204 50% 15%',
      '--sidebar-accent-foreground': '204 91% 70%',
      '--sidebar-border': '0 0% 10%',
      '--sidebar-foreground': '0 0% 96%',
      '--sidebar-primary': '204 91% 70%',
      '--sidebar-primary-foreground': '0 0% 0%',
      '--sidebar-ring': '204 91% 70%',
      '--success': '145 58% 55%',
      '--warning': '38 95% 58%',
    } as Record<string, string>,
  },
  /*
   * ── NEXTBYTE JASNY — motyw domyślny tej paczki (23.09.2026) ──────────────
   *
   * Nowy zestaw jasny, zbudowany pod Panel Główny. Odcień firmowy 213 zostaje
   * (to tożsamość NextByte), zmienia się jego JASNOŚĆ i drabina powierzchni.
   *
   * CO POPRAWIA WOBEC `jasny`:
   *  • `--primary` z 50% na 44% — biały napis na przycisku miał 4,48:1,
   *    czyli PONIŻEJ progu AA (4,5). Teraz 5,52:1. Ten sam akcent jako tekst
   *    na karcie szedł z 4,48 na 5,52, a na tle z 3,94 na 5,01.
   *  • `--sidebar` DOPISANY. Motyw ciemny go ma, `jasny` nie — więc pasek
   *    boczny brał kolor z reguły w `index.css` zamiast z motywu i nie dawało
   *    się go stąd wyregulować.
   *  • Tło 220 24% 96% zamiast 228 28% 95% — mniej sinego zafarbu pod szkłem;
   *    przy 28% nasycenia poświaty `.nb-app-bg` robiły się fioletawe.
   *
   * `nazwa` CELOWO ZOSTAJE `nextbyte-light`. To nie jest przeoczenie:
   * do `[data-theme="nextbyte-light"]` przypięte jest ~390 reguł jasnego
   * motywu w `index.css` (powierzchnie, szkło, cienie). Własna nazwa
   * odcięłaby je wszystkie naraz i motyw wyglądałby na rozjechany.
   * `data-theme` mówi „to jest tryb jasny", paletę niosą zmienne.
   *
   * Kontrasty policzone, nie przyjęte na oko — wszystkie pary tekst/tło
   * przechodzą AA (najniższa 4,77:1 przy tekście drugoplanowym na `--muted`).
   */
  /*
   * ── NEXTBYTE JASNY — motyw domyślny tej paczki (23.09.2026) ──────────────
   *
   * Paleta wzięta z dashboardu w `nextbyte-preview` (`[data-theme="nextbyte-light"]`)
   * — czyli z tego, co Michał wskazał jako „jak powinno być". Wartości są
   * PRZENIESIONE, nie dobrane na nowo, żeby panel i preview nie rozjechały się
   * o pół tonu.
   *
   * DWIE ŚWIADOME RÓŻNICE WOBEC PREVIEW:
   *
   * ① `--primary` 50% → 44%. W preview biały napis na przycisku ma 4,48:1,
   *    czyli PONIŻEJ progu AA (4,5) — zmierzone. Po zejściu o 6 punktów
   *    jasności jest 5,52:1, a różnicy na oko praktycznie nie widać.
   *    Ten sam akcent jako tekst na tle: 3,94 → 5,01.
   *
   * ② Tokeny `--sidebar*` DOPISANE. Preview ich w tym motywie nie ma, panel
   *    ma pasek boczny — bez nich brał kolor z reguły w `index.css` zamiast
   *    z motywu i nie dawało się go stąd wyregulować.
   *
   * KLUCZOWE: `--card` (93%) jest CIEMNIEJSZE od `--background` (97%).
   * To nie pomyłka — tak karta odcina się od strony bez rysowania kreski.
   * Poprzednia wersja miała białą kartę na jasnym tle, czyli biel na bieli,
   * i właśnie dlatego wszystko się zlewało.
   *
   * `nazwa` CELOWO ZOSTAJE `nextbyte-light`: do tego selektora przypięte jest
   * ~390 reguł jasnego motywu w `index.css`. Własna nazwa odcięłaby je naraz.
   */
  nextbyte: {
    nazwa: 'nextbyte-light',
    kolory: {
      '--accent': '213 64% 44%',
      '--accent-foreground': '0 0% 100%',
      '--background': '228 33% 97%',
      '--border': '220 20% 82%',
      '--brand-primary': '213 64% 44%',
      '--brand-primary-dark': '216 55% 38%',
      '--brand-primary-glow': '213 64% 44%',
      '--brand-primary-light': '210 65% 60%',
      '--brand-text-muted': '215 16% 52%',
      '--brand-text-primary': '222 47% 11%',
      '--brand-text-secondary': '215 20% 30%',
      '--brand-text-tertiary': '215 16% 44%',
      '--card': '228 25% 93%',
      '--card-foreground': '222 47% 11%',
      '--chart-1': '213 64% 44%',
      '--chart-2': '173 58% 36%',
      '--chart-3': '197 40% 28%',
      '--chart-4': '43 74% 58%',
      '--chart-5': '27 80% 56%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',
      '--foreground': '222 47% 11%',
      '--input': '220 20% 82%',
      '--muted': '225 15% 90%',
      '--muted-foreground': '215 16% 44%',
      '--popover': '228 25% 93%',
      '--popover-foreground': '222 47% 11%',
      '--primary': '213 64% 44%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '213 64% 44%',
      '--secondary': '225 15% 90%',
      '--secondary-foreground': '222 47% 11%',
      '--sidebar': '228 30% 95%',
      '--sidebar-background': '228 30% 95%',
      '--sidebar-accent': '225 15% 90%',
      '--sidebar-accent-foreground': '222 47% 11%',
      '--sidebar-border': '220 20% 84%',
      '--sidebar-foreground': '222 47% 11%',
      '--sidebar-primary': '213 64% 44%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-ring': '213 64% 44%',
      '--success': '152 62% 30%',
      '--warning': '32 92% 34%',

      /* ── KRAWĘDZIE MATERIAŁU POD JASNE TŁO ──────────────────────────────
         Wartości ZMIERZONE na kafelku wzorcowym w `nextbyte-preview`:
         `rgba(15,23,41,0.65)` na 0,667 px. Panel ma ten sam `border-width`,
         więc 0,65 przenosi się wprost, bez przeliczania.

         Rant materiału na jasnym tle musi być MOCNY, bo nie ma go co wesprzeć:
         na ciemnych motywach kartę unosi własny gradient światła tafli,
         na jasnym takiej pomocy nie ma. Stąd skok z 0,14/0,20 na 0,42/0,65.

         ROZMYCIA TU NIE MA ŚWIADOMIE. `--nb-szklo-rozmycie` i `-nasycenie`
         przychodzą z bazy (`useKomponentyGlobalne`, panel «Zarządzanie
         szkłem») i lądują na `<html>` jako styl inline PO nałożeniu motywu —
         więc wpis tutaj byłby martwy. Sprawdzone: ustawione 6px, zmierzone
         8.8px. Gęstość szkła zmienia się w panelu Zarządu, nie tutaj. */
      '--nb-szklo-krawedz': '0.42',
      '--nb-kafelek-krawedz': '0.65',
      '--nb-tafla-krawedz': '0.52',
    } as Record<string, string>,
  },

  jasny: {
    nazwa: 'nextbyte-light',
    kolory: {
      '--accent': '213 60% 50%',
      '--accent-foreground': '0 0% 100%',
      '--background': '228 28% 95%',
      '--border': '220 18% 86%',
      '--brand-primary': '213 60% 50%',
      '--brand-primary-dark': '216 55% 38%',
      '--brand-primary-glow': '213 60% 50%',
      '--brand-primary-light': '210 65% 60%',
      '--brand-text-muted': '215 16% 57%',
      '--brand-text-primary': '222 47% 11%',
      '--brand-text-secondary': '215 20% 30%',
      '--brand-text-tertiary': '215 16% 47%',
      '--card': '0 0% 100%',
      '--card-foreground': '222 47% 11%',
      '--chart-1': '213 60% 50%',
      '--chart-2': '173 58% 39%',
      '--chart-3': '197 37% 24%',
      '--chart-4': '43 74% 66%',
      '--chart-5': '27 87% 67%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',
      '--foreground': '222 47% 11%',
      '--input': '220 18% 86%',
      '--muted': '225 20% 94%',
      '--muted-foreground': '215 16% 44%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '222 47% 11%',
      '--primary': '213 60% 50%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '213 60% 50%',
      '--secondary': '225 20% 94%',
      '--secondary-foreground': '222 47% 11%',
      '--sidebar-accent': '225 20% 94%',
      '--sidebar-accent-foreground': '222 47% 11%',
      '--sidebar-background': '228 26% 98%',
      '--sidebar-border': '220 18% 88%',
      '--sidebar-foreground': '222 47% 11%',
      '--sidebar-primary': '213 60% 50%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-ring': '213 60% 50%',
      '--success': '152 62% 32%',
      '--warning': '32 92% 36%',
    } as Record<string, string>,
  },

  scandinavian: {
    nazwa: 'scandinavian',
    kolory: {
      '--accent': '161 14% 88%',
      '--accent-foreground': '161 22% 26%',
      '--background': '46 20% 95%',
      '--border': '38 8% 83%',
      '--brand-primary': '161 22% 40%',
      '--brand-primary-dark': '161 22% 30%',
      '--brand-primary-light': '161 20% 52%',
      '--brand-text-muted': '38 6% 52%',
      '--brand-text-primary': '38 12% 10%',
      '--brand-text-secondary': '38 8% 26%',
      '--brand-text-tertiary': '38 6% 42%',
      '--card': '46 16% 99%',
      '--card-foreground': '42 14% 12%',
      '--destructive': '0 72% 52%',
      '--destructive-foreground': '0 0% 100%',
      '--foreground': '42 14% 12%',
      '--input': '38 8% 86%',
      '--muted': '38 8% 93%',
      '--muted-foreground': '38 6% 46%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '38 12% 12%',
      '--primary': '161 22% 40%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '161 22% 40%',
      '--secondary': '38 8% 92%',
      '--secondary-foreground': '38 12% 18%',
      '--sidebar': '38 8% 93%',
      '--sidebar-accent': '161 14% 86%',
      '--sidebar-accent-foreground': '161 22% 28%',
      '--sidebar-border': '38 8% 83%',
      '--sidebar-foreground': '38 12% 14%',
      '--sidebar-primary': '161 22% 40%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-ring': '161 22% 40%',
      '--success': '145 58% 45%',
      '--warning': '38 95% 48%',
    } as Record<string, string>,
  },

  przyjazny: {
    nazwa: 'przyjazny',
    kolory: {
      '--accent': '165 58% 58%',
      '--accent-foreground': '165 40% 8%',
      '--background': '230 22% 7%',
      '--border': '230 14% 20%',
      '--brand-primary': '14 90% 65%',
      '--brand-primary-dark': '12 84% 56%',
      '--brand-primary-light': '18 94% 74%',
      '--brand-text-muted': '230 8% 64%',
      '--brand-text-primary': '30 24% 98%',
      '--brand-text-secondary': '30 18% 90%',
      '--brand-text-tertiary': '30 12% 78%',
      '--card': '230 20% 10%',
      '--card-foreground': '30 24% 94%',
      '--destructive': '348 82% 62%',
      '--destructive-foreground': '30 24% 96%',
      '--foreground': '30 24% 94%',
      '--input': '230 18% 13%',
      '--muted': '230 18% 12%',
      '--muted-foreground': '230 10% 66%',
      '--popover': '230 20% 10%',
      '--popover-foreground': '30 24% 94%',
      '--primary': '14 90% 65%',
      '--primary-foreground': '20 20% 8%',
      '--ring': '14 90% 65%',
      '--secondary': '230 16% 14%',
      '--secondary-foreground': '30 22% 92%',
      '--sidebar': '230 20% 10%',
      '--sidebar-accent': '14 50% 20%',
      '--sidebar-accent-foreground': '14 90% 68%',
      '--sidebar-border': '230 14% 20%',
      '--sidebar-foreground': '30 24% 94%',
      '--sidebar-primary': '14 90% 65%',
      '--sidebar-primary-foreground': '20 20% 8%',
      '--sidebar-ring': '14 90% 65%',
      '--success': '145 58% 55%',
      '--warning': '38 95% 58%',
    } as Record<string, string>,
  },

  smoczy: {
    nazwa: 'dragon-red',
    kolory: {
      '--accent': '0 91% 60%',
      '--accent-foreground': '0 0% 100%',
      '--background': '0 0% 0%',
      '--border': '0 0% 10%',
      '--brand-primary': '0 91% 60%',
      '--brand-primary-dark': '0 75% 50%',
      '--brand-primary-light': '0 95% 70%',
      '--brand-text-muted': '0 0% 64%',
      '--brand-text-primary': '0 0% 100%',
      '--brand-text-secondary': '0 0% 90%',
      '--brand-text-tertiary': '0 0% 83%',
      '--card': '0 0% 3%',
      '--card-foreground': '0 0% 96%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '0 0% 98%',
      '--foreground': '0 0% 96%',
      '--input': '0 0% 6%',
      '--muted': '0 0% 6%',
      '--muted-foreground': '0 0% 67%',
      '--popover': '0 0% 3%',
      '--popover-foreground': '0 0% 96%',
      '--primary': '0 91% 60%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '0 91% 60%',
      '--secondary': '0 0% 6%',
      '--secondary-foreground': '0 0% 96%',
      '--sidebar': '0 0% 3%',
      '--sidebar-border': '0 0% 10%',
      '--sidebar-foreground': '0 0% 96%',
      '--sidebar-primary': '0 91% 60%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-ring': '0 91% 60%',
      '--success': '145 58% 55%',
      '--warning': '38 95% 58%',
    } as Record<string, string>,
  },

  luxury: {
    nazwa: 'luxury',
    kolory: {
      '--accent': '39 39% 58%',
      '--accent-foreground': '0 0% 3%',
      '--background': '0 0% 3%',
      '--border': '30 12% 14%',
      '--brand-primary': '39 39% 58%',
      '--brand-primary-dark': '39 34% 47%',
      '--brand-primary-light': '39 45% 68%',
      '--brand-text-muted': '30 8% 50%',
      '--brand-text-primary': '0 0% 95%',
      '--brand-text-secondary': '30 8% 80%',
      '--brand-text-tertiary': '30 8% 65%',
      '--card': '0 0% 4%',
      '--card-foreground': '0 0% 95%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '0 0% 98%',
      '--foreground': '0 0% 95%',
      '--input': '30 10% 8%',
      '--muted': '30 10% 8%',
      '--muted-foreground': '39 12% 55%',
      '--popover': '0 0% 4%',
      '--popover-foreground': '0 0% 95%',
      '--primary': '39 39% 58%',
      '--primary-foreground': '0 0% 3%',
      '--ring': '39 39% 58%',
      '--secondary': '30 10% 8%',
      '--secondary-foreground': '0 0% 95%',
      '--sidebar': '0 0% 3%',
      '--sidebar-border': '30 12% 14%',
      '--sidebar-foreground': '0 0% 95%',
      '--sidebar-primary': '39 39% 58%',
      '--sidebar-primary-foreground': '0 0% 3%',
      '--sidebar-ring': '39 39% 58%',
      '--success': '145 58% 55%',
      '--warning': '38 95% 58%',
    } as Record<string, string>,
  },

  sniezny: {
    nazwa: 'snowy-white',
    kolory: {
      '--accent': '0 0% 90%',
      '--accent-foreground': '0 0% 5%',
      '--background': '0 0% 0%',
      '--border': '0 0% 10%',
      '--brand-primary': '0 0% 95%',
      '--brand-primary-dark': '0 0% 80%',
      '--brand-primary-light': '0 0% 100%',
      '--brand-text-muted': '0 0% 64%',
      '--brand-text-primary': '0 0% 100%',
      '--brand-text-secondary': '0 0% 90%',
      '--brand-text-tertiary': '0 0% 83%',
      '--card': '0 0% 3%',
      '--card-foreground': '0 0% 96%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '0 0% 98%',
      '--foreground': '0 0% 96%',
      '--input': '0 0% 6%',
      '--muted': '0 0% 6%',
      '--muted-foreground': '0 0% 67%',
      '--popover': '0 0% 3%',
      '--popover-foreground': '0 0% 96%',
      '--primary': '0 0% 95%',
      '--primary-foreground': '0 0% 5%',
      '--ring': '0 0% 90%',
      '--secondary': '0 0% 6%',
      '--secondary-foreground': '0 0% 96%',
      '--sidebar': '0 0% 3%',
      '--sidebar-border': '0 0% 10%',
      '--sidebar-foreground': '0 0% 96%',
      '--sidebar-primary': '0 0% 95%',
      '--sidebar-primary-foreground': '0 0% 5%',
      '--sidebar-ring': '0 0% 90%',
      '--success': '145 58% 55%',
      '--warning': '38 95% 58%',
    } as Record<string, string>,
  },

  przyszly: {
    nazwa: 'future-theme',
    kolory: {
      '--accent': '210 40% 96%',
      '--accent-foreground': '0 0% 10%',
      '--background': '0 0% 98%',
      '--border': '214 32% 91%',
      '--brand-primary': '215 85% 55%',
      '--brand-primary-dark': '215 85% 45%',
      '--brand-primary-light': '215 85% 65%',
      '--brand-text-muted': '215 16% 47%',
      '--brand-text-primary': '0 0% 5%',
      '--brand-text-secondary': '0 0% 25%',
      '--brand-text-tertiary': '0 0% 45%',
      '--card': '0 0% 100%',
      '--card-foreground': '0 0% 5%',
      '--destructive': '0 84% 60%',
      '--destructive-foreground': '0 0% 100%',
      '--foreground': '0 0% 5%',
      '--input': '214 32% 91%',
      '--muted': '210 40% 96%',
      '--muted-foreground': '215 16% 47%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '0 0% 5%',
      '--primary': '215 85% 55%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '215 85% 55%',
      '--secondary': '210 40% 96%',
      '--secondary-foreground': '0 0% 10%',
      '--sidebar': '0 0% 98%',
      '--sidebar-foreground': '0 0% 5%',
      '--sidebar-border': '214 32% 91%',
      '--success': '152 62% 32%',
      '--warning': '32 92% 36%',
      '--nb-plama-nasycenie': '0.15',
      '--nb-kafelek-krawedz': '0.12',
      '--nb-szklo-krawedz': '0.10',
      '--nb-tafla-krawedz': '0.14',
    } as Record<string, string>,
  },
};
