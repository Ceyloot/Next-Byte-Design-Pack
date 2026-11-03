/**
 * ════════════════════════════════════════════════════════════════════════
 *  BRAMKA TYLKO DO ODCZYTU
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kopia Panelu Głównego może czytać prawdziwe dane z platformy, ale NIE MA
 * JAK nic na niej zmienić. To nie jest obietnica w komentarzu — to jedyna
 * droga, jaką kod ma do Supabase, i ona fizycznie nie zawiera zapisu.
 *
 * Dlaczego bramka, a nie „uważajmy, żeby nie klikać": kafelki przyszły
 * z platformy 1:1 i przyniosły ze sobą ścieżki zapisu. Edytor szybkich
 * skrótów robi `upsert` na `user_quick_shortcuts`, portfel umie wołać
 * `spend-bytes`, moduł chmury ma wgrywanie plików. Część z nich jest
 * osiągalna kliknięciem z panelu. Dyscyplina nie jest zabezpieczeniem;
 * brak czasownika w API jest.
 *
 * CO PRZECHODZI:
 *  • `select` i całe filtrowanie (`eq`, `gte`, `order`, `range`, …),
 *  • `rpc`, ale WYŁĄCZNIE z listy poniżej — `rpc` w ogólności potrafi
 *    zapisywać, więc nazwa musi być wymieniona z imienia,
 *  • odczyt sesji (`getSession`, `getUser`, `onAuthStateChange`).
 *
 * CO NIE PRZECHODZI, nigdy i niezależnie od tego, kto zawoła:
 *  • `insert`, `update`, `upsert`, `delete`,
 *  • `functions.invoke` (tam siedzą `spend-bytes`, `check-subscription`,
 *    `create-device-trust` — każde z nich coś zmienia),
 *  • zapis do magazynu plików, `signOut`, `setSession`, `refreshSession`,
 *  • realtime (nie zmienia danych, ale trzyma otwarte połączenie z kontem
 *    i wysyła token — kopii wyglądowej do niczego to nie jest potrzebne).
 *
 * Próba zapisu nie wywraca kafelka: oddaje pustą odpowiedź i zostawia ślad
 * w konsoli, żeby było wiadomo, że coś próbowało.
 *
 * ŹRÓDŁO DANYCH wybiera się samo:
 *  • jest zapisana sesja platformy → czytamy z prawdziwej bazy,
 *  • nie ma sesji → `atrapa.ts` z plikiem przykładowych danych.
 * Bez sesji prawdziwa baza i tak oddałaby pustkę, bo każda tabela panelu
 * jest kotwiczona na `auth.uid()` przez RLS — podpięcie bez logowania
 * dałoby pusty ekran, nie dane.
 */

import { createClient } from '@supabase/supabase-js';
import { atrapa } from './atrapa';

/* Adres i klucz publiczny — te same, co w paczce panelu. Klucz `anon` jest
   z definicji jawny (leci do każdej przeglądarki) i sam z siebie nie daje
   dostępu do niczyich danych; o tym decyduje RLS po stronie bazy. */
const ADRES = 'https://iwuvszxeutvmzcfuetuo.supabase.co';
const KLUCZ_PUBLICZNY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dXZzenhldXR2bXpjZnVldHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzEwOTMsImV4cCI6MjA2NjIwNzA5M30.1kTSozBT2TCeA0SMc-fr_H-TnNA0x8--Gk-OBH444uY';

/** Klucz, pod którym platforma trzyma sesję. Ten sam, żeby dało się ją przenieść. */
export const KLUCZ_SESJI = 'sb-iwuvszxeutvmzcfuetuo-auth-token';

/**
 * Funkcje bazy wpuszczone z imienia.
 *
 * Wszystkie trzy tylko liczą i oddają wynik: dzienna aktywność konta oraz
 * zajętość i limit PrivateCloud. Dopisanie czegokolwiek do tej listy jest
 * decyzją, nie formalnością — `rpc` to zwykłe wywołanie funkcji w bazie
 * i równie dobrze może kasować.
 */
const RPC_DOZWOLONE = new Set([
  'aktywnosc_dzienna',
  'nextcloud_limit_miejsca',
  'nextcloud_zajete_miejsce',
  'nextcloud_lustro_systemowe',
]);

/** Czy w tej przeglądarce leży sesja platformy. */
export function jestSesja(): boolean {
  try {
    const s = localStorage.getItem(KLUCZ_SESJI);
    return !!s && s.length > 20;
  } catch {
    return false; // tryb prywatny albo zablokowane dane witryny
  }
}

export type ZrodloDanych = 'atrapa' | 'platforma';

/** Którym źródłem karmi się panel w tej chwili. */
export const zrodloDanych: ZrodloDanych = jestSesja() ? 'platforma' : 'atrapa';

const pustaOdpowiedz = { data: null, error: null, count: null, status: 200, statusText: 'OK' };

function odmowa(co: string) {
  console.warn(
    `[Panel 2.0 — kopia] Zablokowano próbę zapisu: ${co}. ` +
    'Kopia ma dostęp wyłącznie do odczytu — patrz integrations/supabase/client.ts.',
  );
  return Promise.resolve(pustaOdpowiedz);
}

/**
 * Opakowanie budowniczego zapytania: przepuszcza filtry, zatrzymuje zapisy.
 *
 * Pułapka, której trzeba tu pilnować: łańcuch PostgREST oddaje po każdym
 * ogniwie TEN SAM obiekt, więc opakować trzeba każdy zwrot, a nie tylko
 * pierwszy. Inaczej `.select().eq()` wychodzi z opakowania i `.delete()`
 * doklejone dalej trafia prosto do prawdziwego klienta.
 */
const ZABRONIONE_NA_TABELI = new Set(['insert', 'update', 'upsert', 'delete']);

/**
 * Ślepy łańcuch oddawany po odmowie.
 *
 * Musi przyjąć WSZYSTKO, co kod dopina za zapisem — `.eq()`, `.select()`,
 * `.single()` — i dopiero na `await` oddać pustkę. Pierwsza wersja oddawała
 * sam obiekt z `then` i `delete().eq(...)` wywracało się wyjątkiem
 * „eq is not a function”: zamiast cichej odmowy kafelek znikał. Odmowa ma
 * być niewidoczna dla układu i widoczna wyłącznie w konsoli.
 */
function slepyLancuch(): any {
  const cel: any = {
    then: (s: (v: unknown) => unknown, o?: (p: unknown) => unknown) =>
      Promise.resolve(pustaOdpowiedz).then(s, o),
  };
  return new Proxy(cel, {
    get(obiekt, nazwa) {
      if (nazwa === 'then') return obiekt.then;
      return () => slepyLancuch();
    },
  });
}

function opakujZapytanie(cel: any): any {
  return new Proxy(cel, {
    get(obiekt, nazwa, odbiorca) {
      if (typeof nazwa === 'string' && ZABRONIONE_NA_TABELI.has(nazwa)) {
        return (..._a: unknown[]) => {
          odmowa(`${nazwa}() na tabeli`);
          return slepyLancuch();
        };
      }
      const wartosc = Reflect.get(obiekt, nazwa, odbiorca);
      if (typeof wartosc !== 'function') return wartosc;
      return (...argumenty: unknown[]) => {
        const wynik = wartosc.apply(obiekt, argumenty);
        // `then` oddaje obietnicę — tej nie opakowujemy, bo nie ma w niej zapisu.
        return wynik === obiekt || (wynik && typeof wynik === 'object' && 'select' in wynik)
          ? opakujZapytanie(wynik)
          : wynik;
      };
    },
  });
}

function klientTylkoOdczyt() {
  const prawdziwy = createClient(ADRES, KLUCZ_PUBLICZNY, {
    auth: {
      storageKey: KLUCZ_SESJI,
      persistSession: true,
      autoRefreshToken: false, // odświeżanie tokenu to zapis po stronie konta
      detectSessionInUrl: false,
    },
  });

  return {
    from: (tabela: string) => opakujZapytanie(prawdziwy.from(tabela as never)),

    rpc: (nazwa: string, argumenty?: Record<string, unknown>) =>
      RPC_DOZWOLONE.has(nazwa)
        ? (prawdziwy.rpc as any)(nazwa, argumenty)
        : odmowa(`rpc('${nazwa}') spoza listy dozwolonych`),

    auth: {
      getUser: () => prawdziwy.auth.getUser(),
      getSession: () => prawdziwy.auth.getSession(),
      onAuthStateChange: (...a: never[]) => (prawdziwy.auth.onAuthStateChange as any)(...a),
      // Wylogowanie unieważnia sesję NA KONCIE, więc byłoby zmianą na platformie.
      signOut: () => odmowa('auth.signOut()'),
      setSession: () => odmowa('auth.setSession()'),
      refreshSession: () => odmowa('auth.refreshSession()'),
    },

    functions: { invoke: (nazwa: string) => odmowa(`functions.invoke('${nazwa}')`) },

    storage: {
      from: () => ({
        // Czytanie plików wolno; tworzenie, kasowanie i kopiowanie nie.
        createSignedUrl: (...a: never[]) => (prawdziwy.storage.from('') as any).createSignedUrl(...a),
        getPublicUrl: (...a: never[]) => (prawdziwy.storage.from('') as any).getPublicUrl(...a),
        list: (...a: never[]) => (prawdziwy.storage.from('') as any).list(...a),
        upload: () => odmowa('storage.upload()'),
        remove: () => odmowa('storage.remove()'),
        copy: () => odmowa('storage.copy()'),
      }),
    },

    /* Realtime wyłączone w całości — patrz nagłówek pliku. */
    realtime: { setAuth: () => undefined },
    channel: () => {
      const k: Record<string, unknown> = {};
      k.on = () => k;
      k.subscribe = () => k;
      k.unsubscribe = () => Promise.resolve('ok');
      return k;
    },
    removeChannel: () => Promise.resolve('ok'),
  };
}

export const supabase = (zrodloDanych === 'platforma' ? klientTylkoOdczyt() : atrapa) as any;

export default supabase;
