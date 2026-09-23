/**
 * Lejek onboardingowy — stan przejścia i pomiar.
 *
 * Jedno źródło zapisu dla wszystkich kroków lejka (/start, samouczek, reżyseria
 * w Chat AI i studiach, oferta). Trzy strumienie danych:
 *  - `user_onboarding_state.funnel_*` — GDZIE użytkownik jest (wznawialność),
 *  - `onboarding_events` — start/complete/skip każdego kroku z czasem
 *    (istniejący tour mierzył tylko „skończył/nie skończył" i nie było widać,
 *    gdzie odpada 2/3 ludzi — stąd osobna tabela zdarzeń),
 *  - `onboarding_survey_answers` + Pamięć AI — odpowiedzi ankiet, które
 *    personalizują powitanie w Chat AI.
 *
 * Zapisy są świadomie „fire and forget" z logiem ostrzeżenia: pomiar nie może
 * wywrócić przejścia użytkownika przez lejek.
 */
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { odczytajUtm } from '@/lib/utmRejestracji';

/** Kroki lejka w kolejności przejścia (tablica Michała, 17.08.2026). */
/**
 * ════════════════════════════════════════════════════════════════════════
 *  CO JEST DZIŚ CZĘŚCIĄ LEJKA — jedno źródło dla wszystkich modułów
 * ════════════════════════════════════════════════════════════════════════
 *
 * Obie flagi mieszkały wcześniej w `useRezyseriaChatu`, a to była pułapka:
 * sterowały tylko PRZEKAZANIEM z czatu dalej, ale nie aktywacją reżyserii
 * w module docelowym. `useRezyseriaStudia` włączało się wyłącznie na podstawie
 * `funnel_step`, więc pięć kont, które utknęły na kroku 'studio-zdjec'
 * jeszcze 24.08, dostałoby po wdrożeniu niespodziewany samouczek — a ich
 * pierwsze kliknięcie „Generuj" zwróciłoby podstawiony obraz demo zamiast
 * ich własnego.
 *
 * Flaga musi więc stać tam, gdzie sięgają OBA moduły.
 */

/**
 * Czy Studia są etapem lejka.
 *
 * FAŁSZ OD 31.08.2026 — decyzja produktowa Michała, nie brak gotowości kodu.
 * Prowadzenie w obu Studiach jest napisane i zostaje w repo; wypada tylko
 * z przepływu. Michał: „albo wyrzućmy studio zdjęć z onboardingu / tylko
 * chat ai aby był".
 */
export const STUDIA_W_LEJKU = false;

/**
 * Czy jednorazowa oferta jest etapem lejka.
 *
 * FAŁSZ OD 31.08.2026. Okno obiecuje trzy rzeczy, z których żadna nie ma
 * pokrycia: rabat na Premium i na paczkę nie istnieją w Stripe, a „10 dni
 * Akademii" nic nie nadaje. Pokazywanie ceny, której kliknięcie nie realizuje,
 * jest gorsze niż niepokazywanie jej wcale.
 */
export const OFERTA_W_LEJKU = false;

export const KROKI_LEJKA = [
  'rejestracja',
  'ankieta-narzedzia',
  'ankieta-cele',
  /* Trzecie pytanie ankiety, dodane 09.09.2026. Baza nie ma CHECK-a na
     `funnel_step`, więc nowy krok nie wymaga migracji — sprawdzone. */
  'ankieta-rola',
  'samouczek',
  'chat',
  'studio-zdjec',
  'studio-video',
  'zaczynam-od',
  'oferta',
] as const;

export type KrokLejka = (typeof KROKI_LEJKA)[number];
export type AkcjaLejka = 'start' | 'complete' | 'skip';

/**
 * Etykiety opcji ankiet — jedno źródło dla /start (buduje z nich opcje)
 * i reżyserii Chat AI (tłumaczy zapisane klucze z powrotem na tekst,
 * który asystent wplata w powitanie).
 */
/**
 * Dokąd prowadzi każdy cel z ankiety.
 *
 * MIESZKA TUTAJ, nie w oknie „Zaczynam od" — bo od 31.08 nawiguje `useFinalLejka`,
 * dopiero PO zamknięciu oferty. Okno oddaje wybór w górę i nie rusza trasy samo:
 * przeniesienie do modułu odmontowuje panel razem z `OknoOferty`.
 *
 * Dokąd prowadzi każdy cel z ankiety. Klucze 1:1 z `ETYKIETY_ANKIET.cele`. */
export const SCIEZKI_STARTU: Record<string, string> = {
  'chat-ai': '/chat-ai',
  'studio-zdjec': '/studio-zdjec',
  'studio-video': '/studio-video',
  akademia: '/akademia',
  notatki: '/notatki',
  produktywnosc: '/zadania',
  /*
    Obie odmiany asystenta prowadzą na tę samą stronę — to jeden produkt
    w dwóch trybach, a osobnej strony pobierania wersji lokalnej platforma
    dziś nie ma. Rozdzielone są W ANKIECIE, bo pytanie „lokalnie czy online"
    mierzy popyt na tryb, którego jeszcze nie wypuściliśmy. Gdy strona
    pobierania powstanie, zmienia się tu jedna linia.
  */
  'asystent-online': '/asystent-nextbyte',
  'asystent-lokalny': '/asystent-nextbyte',
};

export const ETYKIETY_ANKIET: Record<'narzedzia_ai' | 'cele' | 'rola', Record<string, string>> = {
  narzedzia_ai: {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    'generatory-grafik': 'Midjourney / generatory grafik',
    canva: 'Canva',
    zaczynam: 'Dopiero zaczynam z AI',
  },
  /*
    ── TRZECIE PYTANIE: CZYM SIĘ ZAJMUJESZ (09.09.2026) ──────────────────────
    Michał: „chciałbym, by każdy użytkownik miał (…) pamięć o sobie".

    Ankieta była najskuteczniejszym źródłem pamięci na całej platformie: dotarła
    do 98 osób, podczas gdy wszystkie rozmowy w Chat AI dały fakty dwudziestu.
    Dawała jednak tylko dwa fakty: czego człowiek używał wcześniej i czego chce
    tutaj. Ani jednego o tym, KIM jest — a to właśnie ta informacja pozwala
    modelowi dobrać przykłady, słownictwo i poziom szczegółu.

    Trzeci krok kosztuje. Na drugim pytaniu odpada dziś 8 osób ze 98, więc mniej
    więcej tyle samo trzeba założyć tutaj. Zysk jest tego wart: fakt o zawodzie
    działa w KAŻDEJ późniejszej rozmowie, a nie tylko przy pierwszym uruchomieniu.
    Dlatego pytanie ma pojedynczy wybór i „Pomiń" na równi z „Dalej".
  */
  rola: {
    'tworca-tresci': 'Twórca treści',
    marketing: 'Marketing i reklama',
    firma: 'Prowadzę firmę',
    handel: 'Sprzedaż i handel',
    it: 'IT i programowanie',
    edukacja: 'Edukacja i szkolenia',
    freelancer: 'Freelancer',
    inne: 'Coś innego',
  },
  cele: {
    'chat-ai': 'Rozmowy i praca z Chat AI',
    'studio-zdjec': 'Generowanie zdjęć i grafik',
    'studio-video': 'Tworzenie wideo',
    akademia: 'Nauka AI krok po kroku',
    notatki: 'Notatki i dokumenty',
    produktywnosc: 'Organizacja i produktywność',
    'asystent-online': 'Personalny asystent online',
    'asystent-lokalny': 'Personalny asystent lokalnie',
  },
};

export interface StanLejka {
  funnel_step: string | null;
  funnel_started_at: string | null;
  funnel_completed_at: string | null;
  /** Kiedy oferta pokazała się PIERWSZY raz. Niepuste = już ją widział. */
  oferta_pokazana_at: string | null;
  oferta_wynik: WynikOferty | null;
}

/**
 * ════════════════════════════════════════════════════════════════════════
 *  OFERTA JEST JEDNORAZOWA — I TO MA BYĆ PRAWDA
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał, 24.08.2026: „oferta musi być na serio jednorazowa".
 *
 * Mówimy użytkownikowi wprost „to ostatni raz, kiedy widzisz tę ofertę".
 * Jeśli wróci za tydzień, przyłapie nas na kłamstwie — i przestanie wierzyć
 * KAŻDEMU kolejnemu komunikatowi platformy, także tym prawdziwym. Dlatego
 * obietnica siedzi w bazie (`user_onboarding_state.oferta_*`), a nie w stanie
 * przeglądarki: wyczyszczenie danych, drugie urządzenie ani ponowne wejście
 * w onboarding nie mogą jej cofnąć.
 *
 * `funnel_step` do tego NIE wystarczy — on mówi, GDZIE ktoś jest, i przesuwa
 * się do przodu. Przy ponownym wejściu wróciłby na początek i oferta
 * pokazałaby się drugi raz.
 */
export type WynikOferty = 'kupil' | 'odrzucil' | 'odrzucil-ostatecznie';

/**
 * Czy wolno pokazać ofertę temu użytkownikowi.
 *
 * FAIL-CLOSED: gdy stanu nie znamy (błąd odczytu, brak wiersza), zwracamy
 * `false`. Lepiej NIE pokazać oferty komuś, kto ma prawo ją zobaczyć, niż
 * pokazać ją drugi raz komuś, komu obiecaliśmy, że to ostatni. Pierwsze to
 * utracona sprzedaż, drugie to złamane słowo.
 */
export const wolnoPokazacOferte = (stan: StanLejka | null): boolean => {
  if (!stan) return false;
  if (stan.oferta_wynik === 'kupil') return false;
  if (stan.oferta_wynik === 'odrzucil-ostatecznie') return false;
  return true;
};

/** Czy to ma być ekran „ostatni raz" (druga odsłona po pierwszej odmowie). */
export const toOstatniaSzansa = (stan: StanLejka | null): boolean =>
  stan?.oferta_wynik === 'odrzucil';

/** Źródło wejścia do lejka — UTM zapamiętany przy wejściu na /start lub /login. */
export const zrodloLejka = (): string => {
  const utm = odczytajUtm();
  return utm?.utm_source || utm?.ref || 'direct';
};

export const wczytajStanLejka = async (userId: string): Promise<StanLejka | null> => {
  const { data, error } = await supabase
    .from('user_onboarding_state')
    .select('funnel_step, funnel_started_at, funnel_completed_at, oferta_pokazana_at, oferta_wynik')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.warn('[lejek] nie udało się wczytać stanu:', error.message);
    return null;
  }
  return (data as StanLejka | null) ?? null;
};

/**
 * Ustawia krok lejka (i opcjonalnie inne pola stanu). Upsert po `user_id` —
 * wiersz mógł jeszcze nie powstać, bo stary OnboardingContext zakłada go
 * dopiero na panelu głównym, a lejek startuje wcześniej.
 */
export const ustawKrokLejka = async (
  userId: string,
  zmiany: Partial<{
    funnel_step: KrokLejka | 'zakonczony';
    funnel_source: string;
    funnel_started_at: string;
    funnel_completed_at: string;
    has_seen_welcome: boolean;
  }>,
): Promise<void> => {
  const { error } = await supabase
    .from('user_onboarding_state')
    .upsert({ user_id: userId, ...zmiany }, { onConflict: 'user_id' });
  if (error) console.warn('[lejek] nie udało się zapisać kroku:', error.message);
};

/** Zdarzenie pomiarowe kroku. Nigdy nie blokuje przejścia dalej. */
export const zapiszEventLejka = (
  userId: string,
  krok: KrokLejka,
  akcja: AkcjaLejka,
  meta?: { [klucz: string]: Json | undefined },
): void => {
  void supabase
    .from('onboarding_events')
    .insert({ user_id: userId, krok, akcja, meta: meta ?? null })
    .then(({ error }) => {
      if (error) console.warn('[lejek] event nie zapisany:', error.message);
    });
};

/**
 * Odpowiedź ankiety: tabela odpowiedzi (upsert — powrót do ankiety nadpisuje,
 * nie dubluje) + fakt w Pamięci AI, żeby Chat AI mógł wpleść ją w powitanie
 * i dalsze rozmowy. `etykiety` to wersja czytelna dla modelu — klucze opcji
 * zostają w tabeli do segmentacji.
 */
export const zapiszAnkiete = async (
  userId: string,
  pytanieKlucz: string,
  odpowiedzi: string[],
  etykiety: string[],
  /* `kategoria` domyślnie `onboarding`, bo tam trafiały pierwsze dwa pytania.
     Pytanie o zawód należy jednak do `work` — kategoria steruje grupowaniem
     na ekranie Pamięci AI, więc fakt o pracy ma leżeć wśród faktów o pracy. */
  faktPamieci: { key: string; opis: string; kategoria?: string },
): Promise<void> => {
  const kategoria = faktPamieci.kategoria ?? 'onboarding';
  const { error } = await supabase
    .from('onboarding_survey_answers')
    .upsert(
      { user_id: userId, question_key: pytanieKlucz, answers: odpowiedzi, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,question_key' },
    );
  if (error) console.warn('[lejek] ankieta nie zapisana:', error.message);

  /* Bez `upsert` (07.09.2026): unikalność faktów jest częściowa (tylko
     bieżące), więc `onConflict` nie ma czego wskazać — czytamy i wstawiamy
     albo poprawiamy. Zakres prywatny (`company_id` NULL). */
  const wartoscFaktu = `${faktPamieci.opis}: ${etykiety.join(', ')}`;
  const { data: istniejacyFakt } = await supabase
    .from('user_ai_memory')
    .select('id')
    .eq('user_id', userId).eq('category', kategoria).eq('key', faktPamieci.key)
    .is('company_id', null).is('valid_to', null)
    .maybeSingle();
  const { error: bladPamieci } = istniejacyFakt
    ? await supabase
        .from('user_ai_memory')
        .update({ value: wartoscFaktu, confidence: 1, source: 'ankieta-onboardingu', zrodlo_typ: 'ankieta-onboardingu', updated_at: new Date().toISOString() })
        .eq('id', istniejacyFakt.id)
    : await supabase
        .from('user_ai_memory')
        .insert({ user_id: userId, category: kategoria, key: faktPamieci.key, value: wartoscFaktu, confidence: 1, source: 'ankieta-onboardingu', zrodlo_typ: 'ankieta-onboardingu' });
  if (bladPamieci) console.warn('[lejek] fakt Pamięci AI nie zapisany:', bladPamieci.message);
};

/**
 * Odnotowuje, że oferta została POKAZANA. Ustawia znacznik czasu tylko raz —
 * `oferta_pokazana_at` ma mówić „kiedy zobaczył ją PIERWSZY raz", więc ekran
 * „ostatniej szansy" go nie nadpisuje.
 */
export const oznaczOfertePokazana = async (userId: string): Promise<void> => {
  const stan = await wczytajStanLejka(userId);
  if (stan?.oferta_pokazana_at) return;   // już odnotowane — nie nadpisujemy
  const { error } = await supabase
    .from('user_onboarding_state')
    .upsert(
      { user_id: userId, oferta_pokazana_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
  if (error) console.warn('[lejek] nie zapisano pokazania oferty:', error.message);
};

/**
 * Zapisuje wynik oferty.
 *
 * ZAPIS JEST TWARDY, nie „fire and forget" jak pomiar. Reszta zapisów w tym
 * pliku może cicho paść, bo dotyczy statystyk — ta nie może. Gdyby przepadła,
 * użytkownik zobaczyłby ofertę, o której powiedzieliśmy „ostatni raz",
 * jeszcze raz. Dlatego zwracamy `false` i wołający ma prawo spróbować
 * ponownie albo NIE przechodzić dalej.
 */
export const zapiszWynikOferty = async (
  userId: string,
  wynik: WynikOferty,
): Promise<boolean> => {
  const { error } = await supabase
    .from('user_onboarding_state')
    .upsert({ user_id: userId, oferta_wynik: wynik }, { onConflict: 'user_id' });
  if (error) {
    console.error('[lejek] NIE zapisano wyniku oferty — obietnica jednorazowości zagrożona:', error.message);
    return false;
  }
  return true;
};
