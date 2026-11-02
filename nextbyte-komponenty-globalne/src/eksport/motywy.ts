/**
 * MOTYWY — kopia z bazy platformy (tabele `color_themes` + `color_settings`),
 * odczytana 02.11.2026 wyłącznie do odczytu. Tylko dwa motywy podstawowe:
 * `dark-theme` (Ciemny motyw) i `nextbyte-light` (NextByte Jasny).
 *
 * Na platformie te wartości żyją w bazie i nakłada je `useGlobalTheme`.
 * W paczce nakłada je `src/eksport/motyw.ts` dokładnie tym samym sposobem:
 * zmienne CSS na <html> + zmienne szkła z `zmienneSzklaDlaMotywu` + atrybut `data-theme`.
 *
 * Wartości to HSL bez `hsl()`, np. '204 91% 70%' — Tailwind używa ich jako `hsl(var(--primary))`.
 */

export interface MotywZBazy {
  id: string;
  name: 'dark-theme' | 'nextbyte-light';
  display_name: string;
  byte_price: number;
  is_purchasable: boolean;
  is_active: boolean;
  /** css_variable -> hsl_value */
  zmienne: Record<string, string>;
}

export const MOTYW_CIEMNY: MotywZBazy = {
  id: '4f5cbc8e-5c65-49ca-abd8-8833cb1843d5',
  name: 'dark-theme',
  display_name: 'Ciemny motyw',
  byte_price: 0,
  is_purchasable: false,
  is_active: true,
  zmienne: {
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
  },
};

export const MOTYW_JASNY: MotywZBazy = {
  id: 'e9a77e1c-a582-4c29-96ab-0266531ddcc1',
  name: 'nextbyte-light',
  display_name: 'NextByte Jasny',
  byte_price: 0,
  is_purchasable: false,
  is_active: true,
  zmienne: {
    '--accent': '215 85% 48%',
    '--accent-foreground': '0 0% 100%',
    '--background': '220 16% 95%',
    '--border': '217 22% 85%',
    '--brand-primary': '215 85% 48%',
    '--brand-primary-dark': '215 85% 45%',
    '--brand-primary-glow': '215 85% 48%',
    '--brand-primary-light': '215 85% 65%',
    '--brand-text-muted': '215 16% 44%',
    '--brand-text-primary': '0 0% 5%',
    '--brand-text-secondary': '0 0% 25%',
    '--brand-text-tertiary': '0 0% 45%',
    '--card': '0 0% 100%',
    '--card-foreground': '0 0% 5%',
    '--chart-1': '215 85% 48%',
    '--chart-2': '173 58% 39%',
    '--chart-3': '197 37% 24%',
    '--chart-4': '43 74% 66%',
    '--chart-5': '27 87% 67%',
    '--destructive': '0 72% 45%',
    '--destructive-foreground': '0 0% 100%',
    '--foreground': '0 0% 5%',
    '--input': '214 32% 91%',
    '--muted': '210 40% 96%',
    '--muted-foreground': '215 16% 44%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '0 0% 5%',
    '--primary': '215 85% 48%',
    '--primary-foreground': '0 0% 100%',
    '--ring': '215 85% 48%',
    '--secondary': '210 40% 96%',
    '--secondary-foreground': '0 0% 10%',
    '--sidebar': '0 0% 98%',
    '--sidebar-accent': '225 20% 94%',
    '--sidebar-accent-foreground': '222 47% 11%',
    '--sidebar-background': '228 26% 98%',
    '--sidebar-border': '214 32% 91%',
    '--sidebar-foreground': '0 0% 5%',
    '--sidebar-primary': '215 85% 48%',
    '--sidebar-primary-foreground': '0 0% 100%',
    '--sidebar-ring': '215 85% 48%',
    '--success': '152 62% 32%',
    '--warning': '32 92% 36%',
  },
};

export const MOTYWY: MotywZBazy[] = [MOTYW_CIEMNY, MOTYW_JASNY];

/**
 * TOKENY KOMPONENTÓW GLOBALNYCH (tabela `component_tokens`, wersja `live`).
 * Zarząd → Biblioteka komponentów → „Komponenty globalne" kręci nimi suwakami.
 * Na platformie `useKomponentyGlobalne` nakłada je na <html>; w paczce robi to
 * samo przez atrapę klienta bazy. W bazie wersje `live` i `sandbox` są dziś równe.
 */
export interface TokenZBazy {
  komponent: string;
  token: string;
  wartosc: string;
  etykieta: string;
  opis: string | null;
  min_wartosc: number | null;
  max_wartosc: number | null;
  krok: number | null;
  jednostka: string | null;
  kolejnosc: number;
}

const t = (
  komponent: string, kolejnosc: number, token: string, wartosc: string, etykieta: string,
  min: number, max: number, krok: number, jednostka: string, opis: string | null,
): TokenZBazy => ({ komponent, token, wartosc, etykieta, opis, min_wartosc: min, max_wartosc: max, krok, jednostka, kolejnosc });

export const TOKENY_KOMPONENTOW: TokenZBazy[] = [
  t('kontener-kafelek', 1, '--nb-kaf-cien-blisko', '0.06', 'Cień bliski', 0, 0.2, 0.01, '', 'Warstwa przy krawedzi. Drugi stopien uniesienia liczy sie z tego przez calc().'),
  t('kontener-kafelek', 2, '--nb-kaf-cien-daleko', '0.28', 'Cień daleki', 0, 0.6, 0.02, '', 'Rozmyta warstwa pod karta. Ona daje wrazenie oderwania od strony.'),
  t('kontener-kafelek', 3, '--nb-kaf-refleks', '0.06', 'Refleks wewnętrzny', 0, 0.25, 0.01, '', 'Liczony od --foreground, wiec odwraca sie z motywem. Wczesniej byl zaszyta biela i na jasnych motywach znikal.'),
  t('kontener-wiersz', 1, '--nb-wrs-wypelnienie', '0.03', 'Wypełnienie wiersza', 0, 0.12, 0.01, '', 'Wiersz ma odcinac sie od kafelka, ale z nim nie konkurowac — dlatego bez cienia.'),
  t('pole-kursor', 1, '--nb-kursor-sprezystosc', '500', 'Sprężystość', 100, 900, 10, '', 'Jak mocno kursor jest ciągnięty do celu. Wyżej = szybciej dojeżdża.'),
  t('pole-kursor', 2, '--nb-kursor-tlumienie', '30', 'Tłumienie', 8, 60, 1, '', 'Hamowanie ruchu. Niżej = kursor przelatuje cel i wraca (odbicie).'),
  t('pole-kursor', 3, '--nb-kursor-masa', '0.5', 'Masa', 0.1, 2, 0.1, '', 'Bezwładność. Wyżej = kursor rusza leniwiej i dłużej dojeżdża.'),
  t('pole-kursor', 4, '--nb-kursor-szerokosc', '2px', 'Grubość kreski', 1, 6, 1, 'px', 'Szerokość karetki w pikselach.'),
  t('przycisk-styl-1', 1, '--nb-p1-obwodka', '0.20', 'Siła obwódki', 0.1, 1, 0.01, '', 'Najniższa alfa, która wygrywa ze stylem 2 na wszystkich motywach.'),
  t('przycisk-styl-1', 2, '--nb-p1-obwodka-hover', '0.35', 'Obwódka po najechaniu', 0.2, 1, 0.01, '', 'Musi byc wyraznym krokiem od spoczynku, nie zaokragleniem tej samej wartosci.'),
  t('przycisk-styl-1', 3, '--nb-p1-refleks', '0.16', 'Refleks górny', 0, 0.4, 0.01, '', 'To on daje wrazenie szkla. Na motywach jasnych czyta sie jako cien wewnetrzny.'),
  t('przycisk-styl-1', 4, '--nb-p1-korpus', '0.55', 'Krycie korpusu', 0.2, 1, 0.05, '', 'Ile karty przebija przez przycisk. Nizej = bardziej przezroczysty.'),
  t('przycisk-styl-1', 5, '--nb-p1-rozmycie', '20px', 'Rozmycie tła', 0, 32, 1, 'px', 'backdrop-filter. Powyzej ~24px koszt rysowania rosnie wyraznie.'),
  t('przycisk-styl-1', 6, '--nb-p1-nasycenie', '1.6', 'Nasycenie tła', 1, 2.5, 0.1, '', 'saturate() pod przyciskiem. 1.0 = bez zmiany.'),
  t('przycisk-styl-1', 7, '--nb-p1-poswiata', '0.3', 'Poświata po najechaniu', 0, 0.8, 0.05, '', 'W kolorze motywu uzytkownika.'),
  t('przycisk-styl-1', 8, '--nb-p1-cien', '0.34', 'Cień rzucany', 0, 0.6, 0.02, '', 'Dolna warstwa cienia. Na motywach ciemnych prawie nic nie wnosi - czern na prawie czerni.'),
  t('przycisk-styl-1', 9, '--nb-p1-uniesienie', '1px', 'Uniesienie po najechaniu', 0, 4, 1, 'px', 'UWAGA: kontener z overflow-hidden przycina uniesienie razem z poswiata.'),
  t('przycisk-styl-1', 10, '--nb-p1-czas', '0.32s', 'Czas przejścia', 0.05, 0.8, 0.01, 's', null),
  t('przycisk-styl-1', 11, '--nb-p1-lsnienie', '0.07', 'Lśnienie górne', 0, 0.2, 0.01, '', 'Gorny przystanek gradientu korpusu.'),
  t('przycisk-styl-2', 1, '--nb-p2-wypelnienie', '0.02', 'Wypełnienie', 0, 0.1, 0.01, '', 'Zasada: ZERO wypelnienia kolorem. Liczone od --foreground, wiec odwraca sie razem z motywem.'),
  t('przycisk-styl-2', 2, '--nb-p2-wypelnienie-hover', '0.06', 'Wypełnienie po najechaniu', 0, 0.2, 0.01, '', null),
  t('przycisk-styl-2', 3, '--nb-p2-obwodka-hover', '0.40', 'Obwódka po najechaniu', 0, 1, 0.05, '', 'Bierze akcent motywu. W spoczynku obwodka jest neutralna (--border).'),
  t('przycisk-styl-2', 4, '--nb-p2-czas', '0.2s', 'Czas przejścia', 0.05, 0.6, 0.01, 's', null),
  t('szklo-material', 1, '--nb-szklo-rozmycie', '8.8px', 'Rozmycie tła', 0, 60, 0.2, 'px', 'Ile szkło rozmywa to, co pod nim. Apple trzyma 30–50 px — im mocniej, tym śmielej można zdjąć zasłonę.'),
  t('szklo-material', 2, '--nb-tafla-wypelnienie', '0.60', 'Gęstość zasłony', 0, 0.95, 0.01, '', 'Ile własnego koloru dokłada tafla. Wyżej = ciemniej i mniej widać tło.'),
  t('szklo-material', 3, '--nb-szklo-nasycenie', '130%', 'Nasycenie', 100, 220, 5, '%', 'Ile koloru przepuszcza szkło. Powyżej 100% barwy spod spodu stają się żywsze.'),
  t('szklo-material', 4, '--nb-szklo-sila', '31', 'Siła załamania', 0, 120, 1, '', 'Jak mocno krawędź szyby wygina obraz pod spodem.'),
  t('szklo-material', 5, '--nb-szklo-aberracja', '2', 'Rozszczepienie', 0, 8, 0.5, '', 'Kolorowa obwódka na brzegu. Powyżej 4 robi się jaskrawa.'),
];
