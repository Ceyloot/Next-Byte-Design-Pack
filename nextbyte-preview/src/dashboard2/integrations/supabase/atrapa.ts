/**
 * ATRAPA KLIENTA SUPABASE — kopia Panelu Głównego nie łączy się z niczym.
 *
 * To jest cała granica między kopią a platformą. Kafelki, hooki i liczenie
 * zostały przeniesione 1:1 i wołają `supabase` dokładnie tak jak w produkcji;
 * tyle że tutaj po drugiej stronie nie ma sieci, tylko `dane-atrapy.ts`.
 *
 * Dlaczego atrapa klienta, a nie przepisane hooki: przepisanie oznaczałoby
 * wycięcie logiki, która właśnie decyduje o WYGLĄDZIE — progi kwartylowe mapy
 * aktywności, tempo wypalania Byte, grupowanie spraw po terminie. Kafelek
 * karmiony gotowym wynikiem wygląda jak panel, ale nim nie jest. Tu zmienia
 * się wyłącznie źródło wierszy.
 *
 * Czego ta atrapa NIE robi i nie będzie robić: żadnego zapisu, żadnego
 * logowania, żadnego wywołania funkcji brzegowej. Zapisy kończą się cicho,
 * nasłuchy nic nie emitują.
 */

import { RPC, TABELE, UZYTKOWNIK } from './dane-atrapy';

type Odpowiedz<T> = { data: T; error: null; count: number | null; status: number; statusText: string };

const odp = <T,>(data: T, count: number | null = null): Odpowiedz<T> =>
  ({ data, error: null, count, status: 200, statusText: 'OK' });

/**
 * Budowniczy zapytania.
 *
 * Łańcuch `.select().eq().gte().order().range()` ma w PostgREST tę własność,
 * że KAŻDE ogniwo jest jednocześnie obietnicą — zapytanie leci w chwili
 * `await`. Odtwarzamy to samo: każdy krok oddaje `this`, a `then` zamyka
 * łańcuch. Filtry są przy tym stosowane naprawdę, bo kafelki potrafią
 * odpytać tę samą tabelę o dwa różne zakresy.
 */
class Zapytanie<T = Record<string, unknown>> implements PromiseLike<Odpowiedz<T[]>> {
  private wiersze: Record<string, unknown>[];
  private pojedynczy: 'single' | 'maybe' | null = null;

  constructor(tabela: string) {
    this.wiersze = [...((TABELE[tabela] as Record<string, unknown>[] | undefined) ?? [])];
  }

  /* Wybór kolumn jest tu bez znaczenia — atrapa oddaje całe wiersze.
     `count` przyjmujemy, bo kod woła `select('*', { count: 'exact' })`. */
  select(_kolumny?: string, _opcje?: { count?: string; head?: boolean }) { return this; }

  eq(pole: string, wartosc: unknown) {
    // Identyfikator konta pomijamy: w kopii jest jedno konto i wszystko jest jego.
    if (pole === 'user_id' || pole === 'owner_id') return this;
    this.wiersze = this.wiersze.filter((w) => w[pole] === wartosc);
    return this;
  }

  neq(pole: string, wartosc: unknown) {
    this.wiersze = this.wiersze.filter((w) => w[pole] !== wartosc);
    return this;
  }

  in(pole: string, wartosci: unknown[]) {
    this.wiersze = this.wiersze.filter((w) => wartosci.includes(w[pole]));
    return this;
  }

  gte(pole: string, wartosc: unknown) { return this.porownaj(pole, wartosc, (a, b) => a >= b); }
  gt(pole: string, wartosc: unknown)  { return this.porownaj(pole, wartosc, (a, b) => a > b); }
  lte(pole: string, wartosc: unknown) { return this.porownaj(pole, wartosc, (a, b) => a <= b); }
  lt(pole: string, wartosc: unknown)  { return this.porownaj(pole, wartosc, (a, b) => a < b); }

  private porownaj(pole: string, wartosc: unknown, test: (a: number, b: number) => boolean) {
    const liczba = (v: unknown) => (typeof v === 'string' ? Date.parse(v) || Number(v) : Number(v));
    const prog = liczba(wartosc);
    if (Number.isNaN(prog)) return this;
    this.wiersze = this.wiersze.filter((w) => test(liczba(w[pole]), prog));
    return this;
  }

  /* Filtry, których atrapa nie udaje — przepuszczają wiersze bez zmian. */
  is() { return this; }
  not() { return this; }
  or() { return this; }
  like() { return this; }
  ilike() { return this; }
  filter() { return this; }
  overlaps() { return this; }
  contains() { return this; }

  order(pole: string, opcje?: { ascending?: boolean }) {
    const rosnaco = opcje?.ascending !== false;
    this.wiersze.sort((a, b) => {
      const x = a[pole], y = b[pole];
      if (x === y) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      return (x > y ? 1 : -1) * (rosnaco ? 1 : -1);
    });
    return this;
  }

  limit(ile: number) { this.wiersze = this.wiersze.slice(0, ile); return this; }

  range(od: number, doI: number) { this.wiersze = this.wiersze.slice(od, doI + 1); return this; }

  single() { this.pojedynczy = 'single'; return this; }
  maybeSingle() { this.pojedynczy = 'maybe'; return this; }

  /* Zapisy kończą się cicho — kopia nie ma gdzie zapisywać. */
  insert() { return this.pusty(); }
  update() { return this.pusty(); }
  upsert() { return this.pusty(); }
  delete() { return this.pusty(); }

  private pusty() { this.wiersze = []; return this; }

  then<A = Odpowiedz<T[]>, B = never>(
    speln?: ((v: Odpowiedz<any>) => A | PromiseLike<A>) | null,
    odrzuc?: ((p: unknown) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    const wynik = this.pojedynczy
      ? odp((this.wiersze[0] ?? null) as unknown)
      : odp(this.wiersze as unknown[], this.wiersze.length);
    return Promise.resolve(wynik).then(speln as never, odrzuc as never);
  }
}

/** Kanał realtime, który nigdy nic nie emituje. */
const kanal = () => {
  const k: Record<string, unknown> = {};
  k.on = () => k;
  k.subscribe = () => k;
  k.unsubscribe = () => Promise.resolve('ok');
  return k;
};

export const atrapa = {
  from: (tabela: string) => new Zapytanie(tabela),

  rpc: (nazwa: string, argumenty?: Record<string, unknown>) =>
    Promise.resolve(odp(RPC[nazwa] ? RPC[nazwa](argumenty) : null)),

  auth: {
    getUser: () => Promise.resolve(odp({ user: { id: UZYTKOWNIK.id, email: UZYTKOWNIK.email } })),
    getSession: () => Promise.resolve(odp({
      session: { user: { id: UZYTKOWNIK.id, email: UZYTKOWNIK.email }, access_token: 'podglad' },
    })),
    refreshSession: () => Promise.resolve(odp({ session: null })),
    setSession: () => Promise.resolve(odp({ session: null })),
    signOut: () => Promise.resolve({ error: null }),
    // Jeden nasłuch, który nigdy nie zawoła — stan konta w kopii się nie zmienia.
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
  },

  realtime: { setAuth: () => undefined },
  channel: kanal,
  removeChannel: () => Promise.resolve('ok'),

  functions: {
    invoke: () => Promise.resolve({ data: null, error: null }),
  },

  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      remove: () => Promise.resolve({ data: null, error: null }),
      copy: () => Promise.resolve({ data: null, error: null }),
      createSignedUrl: () => Promise.resolve({ data: { signedUrl: '' }, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      list: () => Promise.resolve({ data: [], error: null }),
    }),
  },
} as any;

