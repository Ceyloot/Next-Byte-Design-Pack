// ─────────────────────────────────────────────────────────────────────────────
// JEDYNY PUNKT STYKU MODUŁU Z RESZTĄ PLATFORMY.
//
// Cały NextCloud siedzi w `src/modules/nextcloud/` i poza ten katalog sięga wyłącznie tutaj
// oraz po `@/components/ui/*` (shadcn) i `@/lib/utils`. Dzięki temu wyjęcie modułu do osobnego
// repozytorium sprowadza się do podmiany tego jednego pliku — nie do przeczesywania importów
// w kilkudziesięciu komponentach.
//
// W repozytorium platformy engineKit mieszka w katalogu Vidomontu i jest wspólnym językiem
// wizualnym kilku modułów — i to jest ta wersja. W wydaniu samodzielnym (zip Kajetana)
// stoi tu KOPIA z `src/kit/`; to cała różnica między jednym wydaniem a drugim.
//
// PRZENIESIONE NA PLATFORMĘ 10.09.2026 — zmieniona wyłącznie ta jedna ścieżka.
// Reszta modułu (41 plików) jest bajt w bajt tym, co przyszło w paczce.
// ─────────────────────────────────────────────────────────────────────────────

export {
  KitAccentProvider,
  useKitAccent,
  HeaderTile,
  ToolBar,
  ToolPill,
  Composer,
  ComposerSpacer,
  ComposerChip,
  BareSelect,
  PrimaryAction,
  Panel,
  Atmosphere,
} from '@/pages/company/custom/vidomont/documents/engine/engineKit';

export type { KitAccent } from '@/pages/company/custom/vidomont/documents/engine/engineKit';

/*
  ── DRUGI SZEW: DANE PLATFORMY ──────────────────────────────────────────────
  (10.09.2026, polecenie Michała „popodpinaj ludziom systemcloud")

  SystemCloud to LUSTRO modułów platformy: Notatki, Prompty, Studio Zdjęć.
  Moduł sam nie wie nic o Supabase i nie ma się dowiedzieć — dostęp do danych
  wchodzi TĘDY, tak samo jak materiał wizualny wyżej. Wyjęcie modułu do osobnego
  repozytorium dalej sprowadza się do podmiany tego jednego pliku: w wydaniu
  samodzielnym te funkcje zwracają puste tablice i SystemCloud jest po prostu
  pusty, zamiast się wywracać.

  Dlaczego RPC, a nie trzy zapytania z frontu: funkcja `nextcloud_lustro_systemowe`
  ma JAWNE `user_id = auth.uid()` obok RLS. `user_notes` niesie trzynaście polityk,
  w tym udostępnieniowe, a w bazie są 42 zaakceptowane `note_shares` — zapytanie
  oparte tylko na RLS wpuściłoby cudze notatki do „mojej" chmury. Decyzja Michała
  z 10.09 (D7) brzmi: nie.
*/
import { supabase } from '@/integrations/supabase/client';

export interface WpisLustra {
  numer: number;
  rodzicNumer: number;
  tytul: string;
  rodzaj: string;
  zmodyfikowanyO: number | undefined;
  zrodlo: 'notatki' | 'prompty' | 'studio';
  zrodloId: string;
  podglad: string | null;
}

/** Zawartość SystemCloud dla zalogowanego użytkownika. Pusta tablica przy każdej odmowie. */
export async function pobierzLustroSystemowe(): Promise<WpisLustra[]> {
  /* `as any` przy nazwie RPC — tak jak w czternastu innych miejscach platformy
     (np. `szukaj_w_rozmowach`): `integrations/supabase/types.ts` jest GENEROWANY,
     a te funkcje powstały po ostatnim generowaniu. Rzutowanie znika przy
     następnym `generate_typescript_types`. */
  const { data, error } = await supabase.rpc('nextcloud_lustro_systemowe' as any);
  if (error) {
    console.error('[nextcloud] lustro systemowe:', error.message);
    return [];
  }
  return ((data ?? []) as any[]).map((w: any) => ({
    numer: Number(w.numer),
    rodzicNumer: Number(w.rodzic_numer),
    tytul: String(w.tytul ?? ''),
    rodzaj: String(w.rodzaj ?? 'unknown'),
    zmodyfikowanyO: w.zmodyfikowany_o ? new Date(w.zmodyfikowany_o).getTime() : undefined,
    zrodlo: w.zrodlo,
    zrodloId: String(w.zrodlo_id),
    podglad: w.podglad ?? null,
  }));
}

/** Zajęte miejsce i limit planu — w bajtach. */
export async function pobierzMiejsce(): Promise<{ zajete: number; limit: number } | null> {
  const { data: uzytkownik } = await supabase.auth.getUser();
  const id = uzytkownik?.user?.id;
  if (!id) return null;
  const [zajete, limit] = await Promise.all([
    supabase.rpc('nextcloud_zajete_miejsce' as any, { p_user: id }),
    supabase.rpc('nextcloud_limit_miejsca' as any, { p_user: id }),
  ]);
  if (zajete.error || limit.error) {
    console.error('[nextcloud] miejsce:', zajete.error?.message || limit.error?.message);
    return null;
  }
  return { zajete: Number(zajete.data ?? 0), limit: Number(limit.data ?? 0) };
}

/*
  ── PLIKI NA SERWERZE ───────────────────────────────────────────────────────
  (10.09.2026, po zgłoszeniu Michała „nie da się tego odtworzyć")

  Do dziś zawartość plików mieszkała w IndexedDB tej przeglądarki, jako data URL.
  ZMIERZONE, dlaczego to nie mogło działać: `IMG_3291.MOV` waży 917 MB, a data
  URL to base64, czyli ~1,22 GB w pamięci karty — zapis po prostu się nie udaje
  i podgląd dostaje pusty `src`. Do tego plik istniał wyłącznie na tym jednym
  urządzeniu i ginął z historią przeglądarki.

  Kubełek `nextcloud-pliki` jest PRYWATNY, a polityki `storage.objects`
  kotwiczą pierwszy segment ścieżki na `auth.uid()` — czyli cudzego pliku nie da
  się ani odczytać, ani nadpisać, nawet znając nazwę.

  DLACZEGO XHR, A NIE `supabase.storage.upload`:
  klient Supabase nie wystawia postępu wysyłki. `XMLHttpRequest.upload.onprogress`
  wystawia — a przy pliku ważącym setki megabajtów procent jest jedyną rzeczą,
  która odróżnia „trwa" od „zawiesiło się". Adres i nagłówki bierzemy z tego
  samego klienta, więc nie powstaje drugie źródło prawdy o sesji.
*/
const KUBELEK_CHMURY = 'nextcloud-pliki';

/** Ścieżka w kubełku. Pierwszy segment to właściciel — tak działa polityka RLS. */
export async function sciezkaWChmurze(nazwa: string): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  const id = data?.user?.id;
  if (!id) return null;
  /* Losowy przedrostek, bo dwa pliki o tej samej nazwie w różnych folderach
     nadpisałyby się nawzajem — a nazwę nadaje człowiek, nie system. */
  const czysta = nazwa.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 120) || 'plik';
  return `${id}/${crypto.randomUUID()}-${czysta}`;
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  PONAWIANIE — JEDNO MRUGNIĘCIE ŁĄCZA NIE MOŻE KOSZTOWAĆ CAŁEGO PLIKU
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Michał, 22.09.2026: „błąd jakiś się pokazał że nie wgrało 1dnej".
 * ZMIERZONE: `xpeng r1.mp4` (315 MB) NIE MA ani jednego obiektu w kubełku —
 * czyli przesyłanie padło w locie, a nie po. Bliźniaczy plik (347 MB) przeszedł
 * w tej samej kolejce, więc to nie limit rozmiaru ani nie format.
 *
 * Do dziś `xhr.onerror` kończył sprawę: jeden `zakoncz(false)` i tyle. Przy
 * pliku, który jedzie dziewięć minut, oznacza to, że KAŻDE potknięcie sieci
 * wyrzuca do kosza całą pracę — a użytkownik dowiaduje się o tym po tych
 * dziewięciu minutach.
 *
 * Ponawiamy TYLKO błąd sieci. Odpowiedź 4xx znaczy, że serwer zrozumiał
 * żądanie i je odrzucił (zły token, przekroczony limit) — powtarzanie takiego
 * żądania to strata czasu i pasma. Przerwania przez człowieka nie ruszamy
 * w ogóle: kliknął krzyżyk, bo nie chce tego pliku.
 *
 * CZEGO TO NIE ZAŁATWIA. Ponowienie wysyła plik OD ZERA — przy 315 MB to drugie
 * 315 MB. Właściwym rozwiązaniem jest wznawianie (protokół TUS, który Supabase
 * obsługuje pod `/storage/v1/upload/resumable`): przesyłanie wraca do miejsca,
 * w którym padło. To osobna robota i osobna zależność; do tego czasu dwie próby
 * są tańsze niż utrata pliku.
 */
const PROB_WGRANIA = 3;

export async function wgrajPlikDoChmury(
  sciezka: string,
  plik: File,
  naPostep?: (procent: number) => void,
  sygnal?: AbortSignal,
): Promise<boolean> {
  for (let proba = 1; proba <= PROB_WGRANIA; proba += 1) {
    const wynik = await jednaProbaWgrania(sciezka, plik, naPostep, sygnal);
    if (wynik === 'ok') return true;
    if (wynik === 'odmowa' || sygnal?.aborted) return false;

    if (proba < PROB_WGRANIA) {
      console.warn(`[nextcloud] wgrywanie „${plik.name}" — zerwane połączenie, próba ${proba + 1}/${PROB_WGRANIA}`);
      /* Krótka przerwa rośnie z próbą: przy chwilowym zaniku sieci druga próba
         natychmiast po pierwszej padnie z tego samego powodu. */
      await new Promise((r) => setTimeout(r, proba * 1500));
      naPostep?.(0);
    }
  }
  console.error(`[nextcloud] wgrywanie „${plik.name}" — nie udało się po ${PROB_WGRANIA} próbach`);
  return false;
}

type WynikProby = 'ok' | 'siec' | 'odmowa';

/** Jedna próba wysyłki. `siec` = warto ponowić, `odmowa` = nie ma sensu. */
async function jednaProbaWgrania(
  sciezka: string,
  plik: File,
  naPostep?: (procent: number) => void,
  sygnal?: AbortSignal,
): Promise<WynikProby> {
  const { data: sesja } = await supabase.auth.getSession();
  const token = sesja?.session?.access_token;
  if (!token) { console.error('[nextcloud] brak sesji przy wgrywaniu'); return 'odmowa'; }

  const baza = (supabase as any).storageUrl
    ?? `${(supabase as any).supabaseUrl ?? ''}/storage/v1`;

  return await new Promise<WynikProby>((zakoncz) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${baza}/object/${KUBELEK_CHMURY}/${sciezka}`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('x-upsert', 'false');
    if (plik.type) xhr.setRequestHeader('Content-Type', plik.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) naPostep?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) { zakoncz('ok'); return; }
      /*
        ── 409 ZNACZY „JUŻ TAM JEST", CZYLI SUKCES (naprawa 22.09.2026) ───────
        Wysyłamy z `x-upsert: false`, więc magazyn odpowiada 409, gdy obiekt
        pod tą ścieżką już istnieje. Ścieżka zawiera losowy identyfikator
        (`sciezkaWChmurze`), więc istnieje wyłącznie w JEDNYM przypadku:
        POPRZEDNIA PRÓBA DOSZŁA, a zginęła dopiero odpowiedź.

        Tak wygląda zerwanie łącza po wysłaniu ciała — realne przy pliku, który
        jedzie dziewięć minut. Stara reguła („4xx to odmowa") traktowała to jako
        porażkę, więc: stan „błąd", plik nieobecny w wykazie, a 350 MB zostaje
        w kubełku bez wiersza. Dokładnie stąd bierze się zmierzony wcześniej
        rozjazd 669 MB w 27 obiektach wobec 570 MB w 23 wierszach.

        Bajty są na miejscu — to jest definicja udanego wgrania.
      */
      if (xhr.status === 409) { zakoncz('ok'); return; }
      console.error('[nextcloud] wgrywanie', xhr.status, String(xhr.responseText).slice(0, 300));
      /* 5xx to kłopot po stronie serwera — bywa przejściowy, więc ponawiamy.
         4xx serwer zrozumiał i odrzucił; powtórzenie nic nie zmieni. */
      zakoncz(xhr.status >= 500 ? 'siec' : 'odmowa');
    };
    xhr.onerror = () => zakoncz('siec');
    /* `xhr.timeout` NIGDZIE nie jest ustawiane, więc domyślne 0 znaczy „bez
       limitu" i to zdarzenie nie przyjdzie nigdy. Zostawiamy obsługę na wypadek,
       gdyby limit kiedyś doszedł — ale komentarz, który tu stał („zerwanie
       zgłasza się jako timeout, nie error"), był nieprawdziwy: zerwanie idzie
       przez `onerror`, i to ono pokrywa ten przypadek. */
    xhr.ontimeout = () => zakoncz('siec');
    /*
      ── ANULOWANIE (10.09.2026) ─────────────────────────────────────────────
      Michał: „nie da się anulować wgrywania". Przy pliku ważącym setki
      megabajtów brak przerwania znaczy, że pomyłka kosztuje kilka minut
      czekania — i miejsce w planie, bo bajty i tak dojadą.

      `xhr.abort()` przerywa wysyłkę NAPRAWDĘ, w połowie strumienia; sam
      `AbortController` bez tego haczyka tylko oznaczałby obietnicę jako
      porzuconą, a przeglądarka wysyłałaby dalej.
    */
    xhr.onabort = () => zakoncz('odmowa');
    if (sygnal) {
      if (sygnal.aborted) { zakoncz('odmowa'); return; }
      sygnal.addEventListener('abort', () => xhr.abort(), { once: true });
    }
    xhr.send(plik);
  });
}

/**
 * Adres do odtwarzania i pobierania. Podpisany, bo kubełek jest prywatny.
 *
 * To jest CAŁA różnica dla dużych plików: przeglądarka pobiera je zakresami
 * bajtów prosto z magazynu, więc film 917 MB gra od razu, zamiast najpierw
 * wjeżdżać w całości do pamięci karty.
 */
export async function adresPlikuZChmury(sciezka: string, sekundy = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage.from(KUBELEK_CHMURY).createSignedUrl(sciezka, sekundy);
  if (error) { console.error('[nextcloud] podpis adresu:', error.message); return null; }
  return data?.signedUrl ?? null;
}

/*
  ── CZTERYSTA PODPISÓW TO JEDNO ŻĄDANIE, NIE CZTERYSTA (22.09.2026) ─────────
  Wczytanie wykazu podpisywało miniatury przez `Promise.all(map(createSignedUrl))`
  — czyli JEDNO ŻĄDANIE NA WIERSZ, dla całego konta, wystrzelone równolegle.
  Przy 400 plikach to 400 żądań w chwili wejścia do modułu.

  Ironia siedziała dwie linijki wyżej w `chmuraSerwera.ts`: komentarz tłumaczył,
  że „czterysta podpisanych adresów na wejściu to czterysta żądań po coś, czego
  nikt jeszcze nie otworzył" — i dokładnie to robił kod pod spodem, tylko dla
  miniatur zamiast dla plików.

  `createSignedUrls` (liczba mnoga) podpisuje tablicę ścieżek jednym żądaniem.
  Platforma używa go od dawna w `src/hooks/useSignedUrl.ts`. Porcja 100, żeby
  nie odbić się od limitu długości żądania.

  Kolejność wyników nie jest gwarantowana, więc wiążemy je po `path`, a nie po
  pozycji w tablicy — inaczej miniatury trafiłyby do cudzych kafelków.
*/
const PORCJA_PODPISOW = 100;

export async function adresyPlikowZChmury(
  sciezki: string[],
  sekundy = 3600,
): Promise<Map<string, string>> {
  const wynik = new Map<string, string>();
  const unikalne = [...new Set(sciezki.filter(Boolean))];

  for (let i = 0; i < unikalne.length; i += PORCJA_PODPISOW) {
    const partia = unikalne.slice(i, i + PORCJA_PODPISOW);
    const { data, error } = await supabase.storage
      .from(KUBELEK_CHMURY)
      .createSignedUrls(partia, sekundy);
    if (error) { console.error('[nextcloud] podpisy zbiorcze:', error.message); continue; }
    for (const wpis of data ?? []) {
      if (wpis?.path && wpis?.signedUrl) wynik.set(wpis.path, wpis.signedUrl);
    }
  }
  return wynik;
}

/*
  ── MINIATURA OBRAZU POWSTAJE NA SERWERZE (10.09.2026) ──────────────────────
  Michał: „ogarnij jeszcze miniatury po stronie serwera".

  ZMIERZONE, że nie trzeba niczego budować: projekt ma włączone przekształcanie
  obrazów w Supabase Storage. Żądanie
  `/render/image/public/<obiekt>?width=320&height=320&resize=contain`
  oddało z pliku 31 249 B miniaturę 7 731 B — czyli serwer skaluje sam.

  Co to zmienia. Miniatura obrazu przestaje być OSOBNYM PLIKIEM: nie trzeba jej
  generować w przeglądarce, wgrywać, pilnować sierot ani doliczać do limitu
  miejsca. Jest po prostu innym adresem TEGO SAMEGO pliku. Działa też wstecz —
  obrazy wgrane, zanim miniatury w ogóle istniały, dostają podgląd bez migracji
  i bez dorabiania czegokolwiek.

  Czego to NIE obejmuje: filmów i PDF-ów. Przekształcanie Supabase dotyczy
  wyłącznie obrazów, a klatki filmu nie da się wyjąć bez dekodera — w Deno na
  brzegu nie ma ffmpeg i nie będzie. Dlatego film dostaje klatkę tam, gdzie
  dekoder JEST, czyli w przeglądarce, i dopiero ona ląduje w kubełku jako
  prawdziwy plik.
*/
const OBRAZY_SERWEROWE = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'tiff']);

/*
  ── GÓRNY PRÓG PRZEKSZTAŁCANIA (22.09.2026) ─────────────────────────────────
  Michał: „te miniaturki bo się nie aktualizują" — na siatce stały ikony błędu
  wczytania obrazu, nie puste kafelki.

  ZMIERZONE na jego zdjęciach: `DSC_0760-2.PNG` (22,7 MiB = 23,8 MB) dostaje
  miniaturę, a `DSC_0748-2.PNG` (24,3 MiB = 25,5 MB) i każde cięższe — nie.
  Próg wypada więc równo na 25 MB liczonych dziesiętnie, czyli na
  udokumentowanym limicie WEJŚCIA przekształcania obrazów w Supabase Storage.

  To nie jest usterka po naszej stronie i nie da się jej obejść parametrami:
  magazyn po prostu odmawia skalowania pliku tej wagi. Plik powyżej progu musi
  więc dostać WŁASNY plik miniatury, robiony w przeglądarce — tak jak od dawna
  dostają go filmy i PDF-y, gdzie serwer też nic nie zrobi.

  ── DLACZEGO PRÓG STOI TAK NISKO, A NIE PRZY 25 MB ─────────────────────────
  Pierwsza wersja miała 24 MB, czyli tuż pod dokumentowanym limitem. ZMIERZONE
  na żywym udostępnieniu: `DSC_0760-2` (22,7 MiB) dostaje miniaturę z serwera,
  a `DSC_1050` (22,8 MiB) już nie. Sto kilobajtów różnicy to nie jest granica,
  na której da się oprzeć — najpewniej magazyn patrzy nie na wagę pliku, tylko
  na rozmiar po zdekodowaniu (te zdjęcia mają 4032 × 6048, czyli 24 megapiksele).

  Nie zgadujemy więc dalej dokładnej wartości. Wszystko powyżej 15 MB dostaje
  własny kadr, robiony w przeglądarce. Kosztuje to jeden plik ~30 kB na zdjęcie
  — wobec 25 MB oryginału to nic, a znika cała klasa usterek „kafelek pokazuje
  ikonę zepsutego obrazu".

  Zwykłe obrazy (zrzuty ekranu, grafiki z sieci) mieszczą się daleko pod progiem
  i nadal korzystają z darmowego przekształcania po stronie magazynu.
*/
/*
  ── PRÓG STAŁ NA 63% ZMIERZONEJ GRANICY (korekta 22.09.2026) ────────────────
  Było 15 000 000 B, czyli 14,31 MiB, przy zmierzonej granicy magazynu między
  22,7 a 22,8 MiB. Pasmo 14,3–22,7 MiB (37% zakresu, który serwer obsługuje)
  szło więc do przeglądarki bez potrzeby — a ten sam próg bramkuje RENDER
  1600 px do podglądu, więc zdjęcie 20 MiB traciło go i na każde otwarcie
  leciało ~21 MB zamiast ~380 kB.

  20 MiB zostawia 2,7 MiB zapasu pod zmierzoną granicą.
*/
const LIMIT_PRZEKSZTALCENIA = 20 * 1024 * 1024;

/**
 * Czy dla tego pliku miniaturę zrobi sam magazyn.
 *
 * `rozmiar` jest opcjonalny wyłącznie dla wołających, którzy go nie znają —
 * jeśli go masz, PODAJ GO. Bez niego funkcja zakłada, że plik mieści się
 * w limicie, i przy wielkim zdjęciu odeśle prośbę o adres, który odda błąd.
 */
export function miniaturaZSerwera(nazwa: string, rozmiar?: number): boolean {
  if (!OBRAZY_SERWEROWE.has((nazwa.split('.').pop() || '').toLowerCase())) return false;
  /*
    ── BRAK ROZMIARU ZNACZY „NIE RYZYKUJ" (korekta 22.09.2026) ───────────────
    Wcześniej nieznany rozmiar przechodził jako „mieści się w limicie", a pięć
    z sześciu wołających podawało `?? 0` — czyli wiersz bez zapisanego rozmiaru
    dostawał adres przekształcenia, który magazyn odrzuca. Na ekranie: ikona
    zepsutego obrazu, bez wyjaśnienia.

    Domyślne założenie ma być odwrotne: nie wiem, ile waży — nie proszę serwera
    o przekształcenie. Koszt pomyłki w tę stronę to własny kadr zrobiony
    w przeglądarce; w tamtą — zepsuty podgląd.
  */
  if (!Number.isFinite(rozmiar as number)) return false;
  if ((rozmiar as number) > LIMIT_PRZEKSZTALCENIA) return false;
  return true;
}

/**
 * Podpisany adres PRZESKALOWANEJ wersji obrazu. `null`, gdy magazyn odmówi —
 * wołający ma wtedy pokazać ikonę rodzaju, tak jak dotąd.
 */
export async function adresMiniaturyZChmury(sciezka: string, sekundy = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(KUBELEK_CHMURY)
    .createSignedUrl(sciezka, sekundy, {
      /* 320 px to ten sam dłuższy bok, co przy miniaturach z przeglądarki —
         starcza na największy kafel przy ekranie 2×. `contain`, bo kadr ma
         pokazywać CAŁY obraz, a nie wycinek ze środka. */
      transform: { width: 320, height: 320, resize: 'contain' },
    });
  if (error) { console.error('[nextcloud] podpis miniatury:', error.message); return null; }
  return data?.signedUrl ?? null;
}

/*
  ── PODGLĄD TO NIE ORYGINAŁ (22.09.2026) ────────────────────────────────────
  Michał: „czy musimy wyświetlać w pełnej jakości i jak to wpływa na bazę
  danych".

  Nie musimy — i nie powinniśmy. Zdjęcie z aparatu waży 25–30 MB i ma 8000 px
  dłuższego boku. Ekran, na którym je oglądamy, ma 1600 px przy dwukrotnej
  gęstości. Cała reszta tych bajtów przelatuje przez łącze po to, żeby
  przeglądarka natychmiast ją wyrzuciła przy skalowaniu.

  Policzone na materiale Michała: 26 MB oryginału wobec ~380 kB renderu 1600 px
  — **68 razy mniej** na każde otwarcie i każde przewinięcie strzałką. Transfer
  z magazynu jest pozycją na rachunku, więc to nie jest wyłącznie kwestia
  szybkości.

  Oryginał zostaje tam, gdzie jest potrzebny: „Pobierz" podaje PLIK, nie render.
  Dlatego to osobna funkcja i osobne pole w pamięci podręcznej — nie podmiana
  `fileData`, bo wtedy pobieranie cicho oddawałoby zmniejszone zdjęcie.
*/
export async function adresPodgladuZChmury(sciezka: string, sekundy = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(KUBELEK_CHMURY)
    .createSignedUrl(sciezka, sekundy, {
      /* 1600 px dłuższego boku: pełny ekran przy gęstości 2×. `contain`, bo
         podgląd ma pokazywać CAŁY kadr — `cover` przycinałby brzegi. */
      transform: { width: 1600, height: 1600, resize: 'contain' },
    });
  if (error) { console.error('[nextcloud] podpis podglądu:', error.message); return null; }
  return data?.signedUrl ?? null;
}

/*
  ── KOPIA PLIKU MUSI MIEĆ WŁASNE BAJTY (22.09.2026) ─────────────────────────
  Wklejanie robiło `{ ...oryginał, id: nowy }`, więc kopia dziedziczyła ŚCIEŻKĘ
  W MAGAZYNIE. Powstawały dwa wiersze wskazujące jeden obiekt — a kasowanie
  zbiera ścieżki z kasowanych wierszy i woła `storage.remove`. Skutek: usunięcie
  KTÓREJKOLWIEK z kopii niszczyło plik drugiej, która zostawała jako kafelek
  otwierający pustkę. Do tego rozpiska miejsca liczyła obie, a magazyn jeden
  obiekt, więc liczniki rozjeżdżały się na stałe.

  `storage.copy` robi kopię po stronie serwera — bajty nie przechodzą przez
  przeglądarkę, więc kopiowanie filmu 350 MB kosztuje jedno żądanie, nie
  350 MB w górę i w dół.
*/
export async function skopiujPlikWChmurze(zrodlo: string, nazwa: string): Promise<string | null> {
  const cel = await sciezkaWChmurze(nazwa);
  if (!cel) return null;
  const { error } = await supabase.storage.from(KUBELEK_CHMURY).copy(zrodlo, cel);
  if (error) { console.error('[nextcloud] kopiowanie pliku:', error.message); return null; }
  return cel;
}

/** Kasuje zawartość z magazynu. Cichy błąd — wołający ma już swoją decyzję za sobą. */
export async function usunPlikZChmury(sciezka: string): Promise<void> {
  const { error } = await supabase.storage.from(KUBELEK_CHMURY).remove([sciezka]);
  if (error) console.error('[nextcloud] kasowanie pliku:', error.message);
}

/*
  ── WYKAZ PRIVATECLOUD PO STRONIE SERWERA ───────────────────────────────────
  (10.09.2026, decyzja Michała: „chmura ma po stronie serwera działać")

  Moduł dalej myśli w swoich `CloudItem` z liczbowym `id` — bo liczy je
  arytmetycznie w ośmiu miejscach i podmiana na uuid dałaby tam ciche `NaN`.
  Tłumaczenie na wiersze bazy siedzi TUTAJ, w jedynym szwie z platformą.

  `numer` nadaje klient (`kolejneId`), a baza go przyjmuje, o ile jest ≥ 5
  (wyzwalacz `nextcloud_nadaj_numer`). Unikalność w obrębie konta pilnuje
  ograniczenie `nextcloud_numer_na_konto` — więc dwie karty otwarte naraz
  dostaną błąd zamiast po cichu nadpisać sobie plik.
*/
export interface WierszChmury {
  numer: number;
  rodzicNumer: number | null;
  tytul: string;
  rodzaj: string;
  kolor: string;
  przypiety: boolean;
  zarchiwizowany: boolean;
  zarchiwizowanyO: string | null;
  sciezkaPliku: string | null;
  miniaturaSciezka: string | null;
  rozmiar: number;
  zmodyfikowanyO: number | undefined;
}

const naWiersz = (w: any): WierszChmury => ({
  numer: Number(w.numer),
  rodzicNumer: w.rodzic_numer === null || w.rodzic_numer === undefined ? null : Number(w.rodzic_numer),
  tytul: String(w.tytul ?? ''),
  rodzaj: String(w.rodzaj ?? 'unknown'),
  kolor: String(w.kolor ?? 'blue'),
  przypiety: !!w.przypiety,
  /* Kosz i archiwum to jedno pojęcie — patrz `pobierzWykazChmury`. */
  zarchiwizowany: !!w.zarchiwizowany || !!w.usuniety_o,
  zarchiwizowanyO: w.usuniety_o ?? w.zarchiwizowany_o ?? null,
  sciezkaPliku: w.sciezka_pliku ?? null,
  miniaturaSciezka: w.miniatura_sciezka ?? null,
  rozmiar: Number(w.rozmiar ?? 0),
  zmodyfikowanyO: w.zmodyfikowany_o ? new Date(w.zmodyfikowany_o).getTime() : undefined,
});

/*
  Cały wykaz PrivateCloud — RAZEM Z KOSZEM.

  Decyzja D5 Michała brzmiała „kosz (archiwum na 30 dni)", więc archiwum modułu
  JEST koszem: jedno miejsce, z którego się odzyskuje. Wcześniej odsiewaliśmy
  `usuniety_o` po stronie bazy i skasowany plik znikał zewsząd — ekran Archiwum
  pokazywał „0 elementów", choć plik nadal leżał w magazynie i liczył się do
  limitu. Człowiek nie miał ani jak go odzyskać, ani jak odzyskać miejsce.

  Wiersz w koszu wraca jako `zarchiwizowany`, bo tak nazywa to moduł.
*/
/*
  ── „NIE WIEM" TO NIE TO SAMO, CO „NIC NIE MA" (22.09.2026) ─────────────────
  Ta funkcja oddawała `[]` w DWÓCH różnych sytuacjach: gdy konto jest puste
  i gdy odczyt PADŁ. Wołający nie miał jak ich rozróżnić — i jeden z nich
  na tej podstawie KASUJE PLIKI.

  `znajdzSieroty` buduje zbiór „znanych ścieżek" z tego wykazu i uznaje za
  sierotę każdy obiekt w kubełku, którego w nim nie ma. Przy pustej tablicy
  z błędu sierotą staje się CAŁA zawartość konta, a przycisk „Zwolnij miejsce"
  kasuje ją z magazynu bezpowrotnie. Jedno nieudane żądanie i jedno kliknięcie.

  Druga połowa tej samej miny: brak stronicowania. PostgREST oddaje najwyżej
  1000 wierszy i NIE MÓWI, że uciął. Powyżej tego progu pliki od 1001. wiersza
  wyglądały jak sieroty dokładnie tak samo. Ironia: komentarz przy `znajdzSieroty`
  tłumaczy, czemu stronicuje kubełek („posprzątanie skasowałoby przypadkowy
  podzbiór") — a druga strona porównania stronicowania nie miała.

  Teraz: `null` znaczy „odczyt się nie udał", pusta tablica znaczy „pusto".
  I czytamy do wyczerpania.
*/
const KROK_WIERSZY = 1000;

export async function pobierzWykazChmury(): Promise<WierszChmury[] | null> {
  const zebrane: any[] = [];
  for (let od = 0; ; od += KROK_WIERSZY) {
    const { data, error } = await supabase
      .from('nextcloud_elementy' as any)
      .select('numer, rodzic_numer, tytul, rodzaj, kolor, przypiety, zarchiwizowany, zarchiwizowany_o, usuniety_o, sciezka_pliku, miniatura_sciezka, rozmiar, zmodyfikowany_o')
      .order('numer', { ascending: true })
      .range(od, od + KROK_WIERSZY - 1);
    if (error) { console.error('[nextcloud] wykaz:', error.message); return null; }
    const partia = (data ?? []) as any[];
    zebrane.push(...partia);
    if (partia.length < KROK_WIERSZY) break;
  }
  return zebrane.map(naWiersz);
}

/** Dopisuje albo aktualizuje element. Kotwica `user_id` jest w RLS i w domyślnej wartości. */
export async function zapiszElementChmury(el: Partial<WierszChmury> & { numer: number }): Promise<boolean> {
  const { data: uzytkownik } = await supabase.auth.getUser();
  const uid = uzytkownik?.user?.id;
  if (!uid) return false;

  const wiersz: Record<string, unknown> = {
    user_id: uid,
    numer: el.numer,
    rodzic_numer: el.rodzicNumer ?? null,
    tytul: el.tytul ?? '',
    rodzaj: el.rodzaj ?? 'unknown',
    kolor: el.kolor ?? 'blue',
    przypiety: !!el.przypiety,
    zarchiwizowany: !!el.zarchiwizowany,
    zarchiwizowany_o: el.zarchiwizowanyO ?? null,
    /* Archiwizacja = wysłanie do kosza; przywrócenie = wyjęcie z niego.
       `usuniety_o` niesie datę, od której liczy się trzydzieści dni. */
    usuniety_o: el.zarchiwizowany ? (el.zarchiwizowanyO ?? new Date().toISOString()) : null,
    sciezka_pliku: el.sciezkaPliku ?? null,
    miniatura_sciezka: el.miniaturaSciezka ?? null,
    rozmiar: el.rozmiar ?? 0,
  };
  /* `zmodyfikowany_o` dopisujemy TYLKO gdy je znamy — to data pliku z dysku,
     a nie moment zapisu wiersza. Nadpisanie jej `now()` skasowałoby prawdziwą
     datę przy pierwszej zmianie nazwy. */
  if (el.zmodyfikowanyO) wiersz.zmodyfikowany_o = new Date(el.zmodyfikowanyO).toISOString();

  const { error } = await supabase
    .from('nextcloud_elementy' as any)
    .upsert(wiersz, { onConflict: 'user_id,numer' });
  if (error) { console.error('[nextcloud] zapis elementu:', error.message); return false; }
  return true;
}

/**
 * Do kosza, nie na twardo (decyzja D5: 30 dni).
 *
 * Zawartości z magazynu NIE kasujemy tutaj — dopóki element da się przywrócić,
 * jego plik musi istnieć. Sprząta je `nextcloud_oproznij_kosz` po trzydziestu
 * dniach; do tego czasu bajty liczą się do limitu, i to jest uczciwe: nadal leżą.
 */
/**
 * Trwałe usunięcie — wiersz ORAZ pliki w magazynie.
 *
 * Wołane z „Usuń trwale" w archiwum. Bez kasowania obiektów bajty zostawałyby
 * w kubełku bez żadnego wiersza, który by je wskazywał, a zajętość (liczona
 * wprost z magazynu) nigdy by nie spadła.
 */
/*
  ── KOLEJNOŚĆ I PORCJE (naprawa 22.09.2026) ─────────────────────────────────
  Były tu trzy usterki naraz, wszystkie kończące się rozjazdem kubełka z bazą:

  ① Obiekty kasowane PRZED wierszami. Gdy kasowanie wierszy padnie, pliki już
     nie istnieją — zostają kafelki otwierające pustkę. Odwrotna kolejność jest
     bezpieczna: wiersz bez pliku to usterka widoczna i naprawialna, plik bez
     wiersza to sierota licząca się do limitu i niewidoczna dla nikogo.
  ② Błąd kasowania obiektów szedł tylko do konsoli, a funkcja i tak zwracała
     sukces — synchronizacja wykreślała wtedy wiersze z mapy „ostatnio znane",
     więc o osieroconych bajtach nie dowiadywał się już nikt.
  ③ Brak porcjowania. `.in('numer', …)` przy dużym zaznaczeniu wkłada wszystkie
     numery do adresu żądania; powyżej limitu długości serwer odrzuca całość —
     w starej kolejności JUŻ PO skasowaniu plików.
*/
const PORCJA_KASOWANIA = 100;

export async function usunTrwaleZChmury(numery: number[]): Promise<boolean> {
  if (numery.length === 0) return true;

  let wszystko = true;
  for (let i = 0; i < numery.length; i += PORCJA_KASOWANIA) {
    const partia = numery.slice(i, i + PORCJA_KASOWANIA);

    const { data: wiersze } = await supabase
      .from('nextcloud_elementy' as any)
      .select('sciezka_pliku, miniatura_sciezka')
      .in('numer', partia);

    const sciezki = ((wiersze ?? []) as any[])
      .flatMap((w) => [w.sciezka_pliku, w.miniatura_sciezka])
      .filter((x): x is string => typeof x === 'string' && !!x);

    /* NAJPIERW WIERSZE. Dopóki wiersz stoi, plik ma właściciela i da się go
       skasować przy następnym podejściu. */
    const { error: bladWierszy } = await supabase
      .from('nextcloud_elementy' as any).delete().in('numer', partia);
    if (bladWierszy) {
      console.error('[nextcloud] kasowanie wierszy:', bladWierszy.message);
      return false;
    }

    if (sciezki.length > 0) {
      const { error: bladPlikow } = await supabase.storage.from(KUBELEK_CHMURY).remove(sciezki);
      if (bladPlikow) {
        /* Wiersze poszły, obiekty zostały — to sieroty. Mówimy o tym wołającemu
           zamiast meldować sukces; sprzątaczka sierot i tak je potem pokaże. */
        console.error('[nextcloud] kasowanie plików:', bladPlikow.message);
        wszystko = false;
      }
    }
  }
  return wszystko;
}

export async function doKoszaChmury(numery: number[]): Promise<boolean> {
  if (numery.length === 0) return true;
  const { error } = await supabase
    .from('nextcloud_elementy' as any)
    .update({ usuniety_o: new Date().toISOString() })
    .in('numer', numery)
    .is('usuniety_o', null);
  if (error) { console.error('[nextcloud] kosz:', error.message); return false; }
  return true;
}

/*
  ════════════════════════════════════════════════════════════════════════════
   UDOSTĘPNIANIE — WYWOŁANIA BAZY
  ════════════════════════════════════════════════════════════════════════════

  Siedzą TUTAJ, a nie w `lib/udostepnianie.ts`, bo moduł ma jeden punkt styku
  z platformą i pilnuje tego test `chat-ai/__tests__/nextcloudWpiecie.test.ts`.
  W `lib/` zostaje to, co nie potrzebuje serwera: liczenie znaczków i składanie
  adresu.

  NIEZMIENNOŚĆ LINKU nie jest tu pilnowana i nie ma być: zapewnia ją więz
  `UNIQUE (user_id, numer)` na `nextcloud_udostepnienia`. Funkcja `nextcloud_udostepnij`
  robi `INSERT … ON CONFLICT DO UPDATE`, więc token powstaje raz i tylko raz.
*/

export interface Udostepnienie {
  numer: number;
  token: string;
  aktywne: boolean;
  pobieranie: boolean;
  wygasaO: string | null;
  wejsc: number;
  ostatnieWejscieO: string | null;
}

const zWierszaUdostepnienia = (w: any): Udostepnienie => ({
  numer: Number(w.numer),
  token: String(w.token),
  aktywne: !!w.aktywne,
  pobieranie: !!w.pobieranie,
  wygasaO: w.wygasa_o ?? null,
  wejsc: Number(w.wejsc ?? 0),
  ostatnieWejscieO: w.ostatnie_wejscie_o ?? null,
});

/** Wszystkie udostępnienia właściciela — do znaczków w panelu. */
export async function pobierzUdostepnienia(): Promise<Udostepnienie[]> {
  const { data, error } = await supabase
    .from('nextcloud_udostepnienia' as any)
    .select('numer, token, aktywne, pobieranie, wygasa_o, wejsc, ostatnie_wejscie_o');
  if (error) {
    console.error('[nextcloud] odczyt udostępnień:', error.message);
    return [];
  }
  return (data ?? []).map(zWierszaUdostepnienia);
}

/** Włącza udostępnienie albo odświeża jego ustawienia. Token zawsze ten sam. */
export async function wlaczUdostepnienie(
  numer: number,
  pobieranie: boolean,
  wygasaO: Date | null,
): Promise<Udostepnienie | null> {
  const { data, error } = await (supabase as any).rpc('nextcloud_udostepnij', {
    _numer: numer,
    _pobieranie: pobieranie,
    _wygasa_o: wygasaO ? wygasaO.toISOString() : null,
  });
  if (error) {
    console.error('[nextcloud] włączenie udostępnienia:', error.message);
    return null;
  }
  const w = Array.isArray(data) ? data[0] : data;
  return w ? { ...zWierszaUdostepnienia(w), numer } : null;
}

/** Gasi link. Token zostaje w bazie i wróci przy ponownym włączeniu. */
export async function wylaczUdostepnienie(numer: number): Promise<boolean> {
  const { data, error } = await (supabase as any).rpc('nextcloud_wylacz_udostepnienie', {
    _numer: numer,
  });
  if (error) {
    console.error('[nextcloud] wyłączenie udostępnienia:', error.message);
    return false;
  }
  return !!data;
}

/*
  ════════════════════════════════════════════════════════════════════════════
   SIEROTY — BAJTY, ZA KTÓRE PŁACISZ LIMITEM, A KTÓRYCH NIE WIDAĆ
  ════════════════════════════════════════════════════════════════════════════

  Michał, 22.09.2026: „skąd jest 560mb jak one mają ponad 100mb te foty,
  to co zajmuje resztę".

  ZMIERZONE: w kubełku leżało 669 MB w 27 obiektach, a w wykazie 570 MB
  w 23 wierszach. Różnica — 99 MB w czterech obiektach — to pliki BEZ WIERSZA.
  Powstają, gdy wgrywanie zostanie przerwane po wysłaniu bajtów, a przed
  zapisem wiersza, albo gdy zapis wiersza padnie (tak działo się z filmami,
  zanim więz `nextcloud_rodzaj_znany` poznał rodzaj `video`).

  Licznik zajętości pyta SERWER (`nextcloud_zajete_miejsce` sumuje kubełek),
  a rozpiska „Co zajmuje miejsce" liczy WYKAZ. Dlatego te dwie liczby się nie
  zgadzały i nie mogły — jedna widziała sieroty, druga nie.

  ODSIEW JEST PO STRONIE PRZEGLĄDARKI I TAK MA BYĆ. Kasowanie leci przez
  `storage.remove`, czyli z prawami użytkownika i pod polityką, która kotwiczy
  pierwszy segment ścieżki na `auth.uid()`. Nawet błąd w tym kodzie nie ma jak
  dotknąć cudzego pliku.
*/

export interface Sierota {
  sciezka: string;
  nazwa: string;
  bajty: number;
  wgranyO: string | null;
}

/**
 * Obiekty w kubełku, do których nie prowadzi żaden wiersz.
 *
 * Porównanie idzie po PEŁNYM wykazie z bazy, nie po tym, co widać na ekranie:
 * element w archiwum albo w koszu nadal ma swój plik i skasowanie go byłoby
 * utratą danych, a nie sprzątaniem.
 */
export async function znajdzSieroty(): Promise<Sierota[]> {
  const { data: uzytkownik } = await supabase.auth.getUser();
  const uid = uzytkownik?.user?.id;
  if (!uid) return [];

  const wiersze = await pobierzWykazChmury();
  /*
    ODMOWA, NIE ZGADYWANIE. Gdy wykazu nie da się przeczytać, nie wiemy, co jest
    znane — a każdy obiekt w kubełku wyglądałby wtedy na sierotę. Lista sierot
    prowadzi wprost do nieodwracalnego kasowania, więc przy braku pewności
    oddajemy pustkę: użytkownik zobaczy „zero sierot" zamiast propozycji
    skasowania własnej chmury.
  */
  if (wiersze === null) return [];

  const znane = new Set<string>();
  for (const w of wiersze) {
    if (w.sciezkaPliku) znane.add(w.sciezkaPliku);
    if (w.miniaturaSciezka) znane.add(w.miniaturaSciezka);
  }

  /* `list` oddaje najwyżej `limit` pozycji naraz — przy koncie z tysiącem
     plików jedno wywołanie pokazałoby wycinek i „posprzątanie" skasowałoby
     przypadkowy podzbiór. Stąd stronicowanie do wyczerpania. */
  const KROK = 100;
  const sieroty: Sierota[] = [];
  for (let odsuniecie = 0; ; odsuniecie += KROK) {
    const { data, error } = await supabase.storage
      .from(KUBELEK_CHMURY)
      .list(uid, { limit: KROK, offset: odsuniecie });
    if (error) { console.error('[nextcloud] spis kubełka:', error.message); return sieroty; }
    const partia = data ?? [];
    for (const obiekt of partia) {
      const sciezka = `${uid}/${obiekt.name}`;
      if (znane.has(sciezka)) continue;
      sieroty.push({
        sciezka,
        /* Nazwa nadana przez człowieka siedzi w ścieżce, za losowym przedrostkiem
           z `sciezkaWChmurze` — dzięki temu da się pokazać, CO się kasuje. */
        nazwa: obiekt.name.replace(/^[0-9a-f-]{36}-/, ''),
        bajty: Number((obiekt as any)?.metadata?.size ?? 0),
        wgranyO: (obiekt as any)?.created_at ?? null,
      });
    }
    if (partia.length < KROK) break;
  }
  return sieroty;
}

/** Kasuje wskazane sieroty. Zwraca, ile poszło. */
export async function usunSieroty(sciezki: string[]): Promise<number> {
  if (sciezki.length === 0) return 0;
  /* `remove` przyjmuje ograniczoną listę naraz — dzielimy na porcje, żeby
     przy kilkudziesięciu sierotach nie odbić się od limitu żądania. */
  const PORCJA = 50;
  let poszlo = 0;
  for (let i = 0; i < sciezki.length; i += PORCJA) {
    const partia = sciezki.slice(i, i + PORCJA);
    const { error } = await supabase.storage.from(KUBELEK_CHMURY).remove(partia);
    if (error) { console.error('[nextcloud] kasowanie sierot:', error.message); break; }
    poszlo += partia.length;
  }
  return poszlo;
}
