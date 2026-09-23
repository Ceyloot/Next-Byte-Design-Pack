import { track } from '@vercel/analytics';

/**
 * ══════════════════════════════════════════════════════════════════════
 *  ANALITYKA — CO WYCHODZI Z PLATFORMY NA ZEWNĄTRZ
 * ══════════════════════════════════════════════════════════════════════
 *
 * Analityka Vercela dostaje ADRES KAŻDEJ ODWIEDZONEJ STRONY. Na platformie,
 * na której 28 ze 179 tras ma parametr w ścieżce, to nie jest niewinne:
 *
 *   /dostawca/wybor/:token      ← token dostępowy w adresie
 *   /share/rozmowa/:slug        ← link do udostępnionej rozmowy = sekret
 *   /spolecznosc/profil/:userId ← identyfikator konkretnego człowieka
 *   /notatki/:noteId            ← prywatna notatka użytkownika
 *
 * Wysłanie tego surowo do zewnętrznej usługi byłoby wyciekiem, nie pomiarem.
 * Dlatego KAŻDY adres przechodzi przez `oczyscAdres` zanim opuści przeglądarkę.
 *
 * Efekt uboczny jest taki, że panel w ogóle staje się czytelny: bez tego
 * „Top Pages" pokazywałoby tysiąc osobnych wierszy `/notatki/<uuid>` zamiast
 * jednego wiersza `/notatki/[id]` z sumą odwiedzin.
 *
 * ── DRUGA STRONA: WŁAŚCIWOŚCI ZDARZEŃ ───────────────────────────────────
 * `zdarzenie()` przepuszcza wartości przez `bezDanychOsobowych`. Adres e-mail
 * albo identyfikator wklejony do zdarzenia przez nieuwagę zostanie wycięty,
 * a w trybie deweloperskim dodatkowo zgłoszony w konsoli. Pomiar ma mówić
 * ILE i CZEGO, nigdy KTO.
 */

/*
  WZORCE TRAS — spisane z kodu, nie zgadywane.

  Odświeżenie po dodaniu nowych tras z parametrem:
    grep -rhoE 'path="[^"]*"' src/ | sed 's/path="//;s/"$//' | sort -u | grep ':'

  Lista NIE musi być kompletna, żeby było bezpiecznie: adres, który nie pasuje
  do żadnego wzorca, i tak przechodzi przez `oczyscSegment`, który wycina
  wszystko, co wygląda na identyfikator. Wzorce dają tylko ŁADNIEJSZE nazwy
  w panelu („/akademia/kurs/[courseId]" zamiast „/akademia/kurs/[id]").
*/
const WZORCE = [
  '/agent/:slug',
  '/akademia/checkout/:courseId',
  '/akademia/ebook/:ebookId',
  '/akademia/kurs/:courseId',
  '/akademia/kurs/:courseId/landing',
  '/akademia/kurs/:courseId/lekcja/:lessonId',
  '/aktualnosci/:slug',
  '/automatyzacje/:workflowId',
  '/arkusze/:spreadsheetId',
  '/creator/:creatorSlug',
  '/dostawca/wybor/:token',
  '/firma/:companySlug/*',
  '/kreator/:creatorId',
  '/kurs/:courseId',
  '/kurs/:courseId/lekcja/:lessonId',
  '/lejki/:funnelId',
  '/notatki/:noteId',
  '/p/:slug',
  '/panel-tworcy/kursy/:slug/edytor',
  '/petle/:loopId/czat',
  '/platforma/:pageSlug',
  '/share/:slug',
  '/share/folder/:slug',
  '/share/rozmowa/:slug',
  '/sklep/paczka/:packId/checkout',
  '/spolecznosc/profil/:userId',
  '/u/:slug',
] as const;

/** Parametry adresu, które WOLNO wysłać. Wszystko inne wypada. */
const DOZWOLONE_PARAMETRY = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAME_CYFRY = /^\d+$/;
const DLUGI_HEKS = /^[0-9a-f]{16,}$/i;

/**
 * Czy pojedynczy kawałek ścieżki wygląda na identyfikator, a nie na nazwę strony.
 * Używane WYŁĄCZNIE dla tras, które nie pasowały do żadnego wzorca — czyli dla
 * tras dodanych po napisaniu tego pliku. To jest siatka bezpieczeństwa.
 */
export function oczyscSegment(segment: string): string {
  if (!segment) return segment;
  if (UUID.test(segment)) return '[id]';
  if (SAME_CYFRY.test(segment)) return '[id]';
  if (DLUGI_HEKS.test(segment)) return '[id]';
  /* Żadna nazwa strony w tej platformie nie ma 24 znaków. Token albo slug — ma. */
  if (segment.length >= 24) return '[id]';
  return segment;
}

/**
 * Dopasowanie ścieżki do wzorca trasy. Zwraca wzorzec z nazwami parametrów
 * w nawiasach kwadratowych albo `null`, jeśli nic nie pasuje.
 */
export function dopasujWzorzec(sciezka: string): string | null {
  const kawalki = sciezka.split('/').filter(Boolean);

  for (const wzorzec of WZORCE) {
    const czesci = wzorzec.split('/').filter(Boolean);
    const gwiazdka = czesci[czesci.length - 1] === '*';

    /* `*` łapie resztę ścieżki, więc wymaga „co najmniej", nie „dokładnie". */
    if (gwiazdka ? kawalki.length < czesci.length - 1 : kawalki.length !== czesci.length) {
      continue;
    }

    let pasuje = true;
    const wynik: string[] = [];

    for (let i = 0; i < czesci.length; i++) {
      const czesc = czesci[i];
      if (czesc === '*') {
        wynik.push('*');
        break;
      }
      if (czesc.startsWith(':')) {
        /* Pusty kawałek nie jest identyfikatorem — `/kurs/` to nie `/kurs/:id`. */
        if (!kawalki[i]) { pasuje = false; break; }
        wynik.push(`[${czesc.slice(1)}]`);
        continue;
      }
      if (czesc !== kawalki[i]) { pasuje = false; break; }
      wynik.push(czesc);
    }

    if (pasuje) return '/' + wynik.join('/');
  }

  return null;
}

/** Ścieżka gotowa do wysłania: wzorzec, jeśli znany, inaczej siatka bezpieczeństwa. */
export function oczyscSciezke(sciezka: string): string {
  const wzorzec = dopasujWzorzec(sciezka);
  if (wzorzec) return wzorzec;

  const kawalki = sciezka.split('/').filter(Boolean).map(oczyscSegment);
  return kawalki.length ? '/' + kawalki.join('/') : '/';
}

/**
 * Pełny adres gotowy do wysłania.
 *
 * Trzy cięcia: ścieżka przez `oczyscSciezke`, parametry przez listę dozwolonych,
 * kotwica (`#`) wycięta w całości — bo to w niej Supabase zwraca `access_token`
 * po zalogowaniu przez Google.
 */
export function oczyscAdres(adres: string): string {
  let url: URL;
  try {
    url = new URL(adres);
  } catch {
    /* Nie da się rozebrać — nie zgadujemy, wysyłamy samą ścieżkę główną. */
    return '/';
  }

  const parametry = new URLSearchParams();
  url.searchParams.forEach((wartosc, klucz) => {
    if (DOZWOLONE_PARAMETRY.has(klucz)) parametry.set(klucz, wartosc);
  });

  const zapytanie = parametry.toString();
  return url.origin + oczyscSciezke(url.pathname) + (zapytanie ? `?${zapytanie}` : '');
}

/* ═══════════════════════════════════════════════════════════════════════
   GRANICA
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Jedyna droga, którą adres opuszcza przeglądarkę.
 *
 * Obie paczki Vercela (`@vercel/analytics` i `@vercel/speed-insights`) wołają
 * `beforeSend` z tym samym kształtem zdarzenia — `{ type, url }`, a Speed
 * Insights dokłada opcjonalne `route`. Jedna funkcja obsługuje więc obie.
 *
 * Mieszka w bibliotece, a nie w komponencie, z jednego powodu: komponent jest
 * zamontowany TYLKO na produkcji, więc lokalnie nie da się go uruchomić ani
 * obejrzeć. Gdyby ta funkcja siedziała w komponencie, jedyne, co miałbym na
 * dowód poprawności, to „przecież wołam tam czystą funkcję". Tutaj mam test.
 */
export function przygotujZdarzenie<T extends { url: string; route?: string }>(
  zdarzenie: T,
  opcje?: { zTrasa?: boolean },
): T {
  const czysty = oczyscAdres(zdarzenie.url);

  /* Speed Insights grupuje wyniki po `route`. Bez tego każdy identyfikator
     w adresie tworzy osobny wiersz i średnie robią się bezużyteczne.

     Trasę wyliczamy na ŻĄDANIE wołającego, a nie po tym, czy pole `route` już
     w zdarzeniu jest. Pierwsza wersja sprawdzała `'route' in zdarzenie` — i to
     był błąd: w aplikacji Vite nikt tego pola nie wypełnia, więc warunek nigdy
     nie byłby prawdziwy i grupowanie po prostu by nie działało. */
  if (opcje?.zTrasa) {
    let trasa: string | undefined;
    try {
      trasa = oczyscSciezke(new URL(zdarzenie.url).pathname);
    } catch {
      trasa = undefined;
    }
    return { ...zdarzenie, url: czysty, route: trasa };
  }

  return { ...zdarzenie, url: czysty };
}

/* ═══════════════════════════════════════════════════════════════════════
   ZDARZENIA
   ═══════════════════════════════════════════════════════════════════════ */

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;

type Wlasciwosci = Record<string, string | number | boolean | null>;

/**
 * Wycina z właściwości zdarzenia wszystko, co identyfikuje człowieka.
 * To jest siatka bezpieczeństwa na przyszłość — dziś nikt nie wysyła e-maila
 * w zdarzeniu, ale za pół roku ktoś doda `{ user: email }` bez zastanowienia.
 */
export function bezDanychOsobowych(wlasciwosci: Wlasciwosci): Wlasciwosci {
  const czyste: Wlasciwosci = {};

  for (const [klucz, wartosc] of Object.entries(wlasciwosci)) {
    if (typeof wartosc === 'string' && (EMAIL.test(wartosc) || UUID.test(wartosc))) {
      if (import.meta.env.DEV) {
        console.warn(
          `[analityka] właściwość „${klucz}" wyglądała na dane osobowe i została wycięta`,
        );
      }
      czyste[klucz] = '[usuniete]';
      continue;
    }
    czyste[klucz] = wartosc;
  }

  return czyste;
}

/*
  ZGODA.

  Domyślnie WŁĄCZONE, bo pomiar Vercela jest bezciasteczkowy — nie zapisuje
  niczego na urządzeniu, więc nie wymaga zgody z art. 5 ust. 3 dyrektywy
  o prywatności. Wyłączamy dopiero, gdy zalogowany człowiek ŚWIADOMIE odmówił
  ciasteczek statystycznych: skoro powiedział „nie mierzcie mnie", to znaczy
  „nie mierzcie mnie", niezależnie od techniki pomiaru.
*/
let zgoda = true;

export function ustawZgodeNaPomiar(wartosc: boolean): void {
  zgoda = wartosc;
}

export function czyWolnoMierzyc(): boolean {
  return zgoda;
}

/** Nazwy zdarzeń — zamknięta lista, żeby panel nie zarósł literówkami. */
export type NazwaZdarzenia =
  | 'rejestracja'
  | 'logowanie'
  | 'zakup_bajtow'
  | 'subskrypcja'
  | 'zakup_kursu'
  | 'zakup_szablonu'
  | 'zakup_paczki_wiedzy'
  | 'subskrypcja_firmowa';

export function zdarzenie(nazwa: NazwaZdarzenia, wlasciwosci?: Wlasciwosci): void {
  if (!zgoda) return;
  try {
    track(nazwa, wlasciwosci ? bezDanychOsobowych(wlasciwosci) : undefined);
  } catch {
    /* Pomiar nie ma prawa wywrócić platformy. Cisza jest tu właściwa. */
  }
}
