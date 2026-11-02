/**
 * ATRAPA KLIENTA BAZY (Supabase) — paczka działa BEZ backendu i bez logowania.
 *
 * Na platformie `@/integrations/supabase/client` to prawdziwy klient. Tutaj ten
 * sam import dostaje tę atrapę (patrz `src/integrations/supabase/client.ts`),
 * więc komponenty nie wymagają żadnych zmian.
 *
 * Co umie:
 *  • `from(tabela).select().eq().in().order()…` — czyta z kopii w `motywy.ts`
 *    (`color_themes`, `color_settings`, `component_tokens`); każda inna tabela = pusta lista.
 *  • `update/insert/upsert/delete` — zmienia dane tylko w pamięci karty (po odświeżeniu wraca stan).
 *  • `rpc('publikuj_komponent' | 'przywroc_komponent_z_live')` — kopiuje sandbox ↔ live w pamięci.
 *  • `auth` — zawsze gość (brak sesji). `functions.invoke` — zwraca błąd „brak backendu".
 *  • `channel` / `removeChannel` / `storage` — puste zaślepki.
 *
 * Nie ma tu żadnego adresu ani klucza: nic nie wychodzi do sieci.
 */
import { MOTYWY, TOKENY_KOMPONENTOW } from './motywy';

type Wiersz = Record<string, any>;

const tabele: Record<string, Wiersz[]> = {
  color_themes: MOTYWY.map(({ zmienne: _z, ...m }) => ({ ...m })),
  color_settings: MOTYWY.flatMap((m) =>
    Object.entries(m.zmienne).map(([css_variable, hsl_value]) => ({ theme_id: m.id, css_variable, hsl_value })),
  ),
  component_tokens: TOKENY_KOMPONENTOW.flatMap((tk) =>
    (['live', 'sandbox'] as const).map((wersja) => ({ ...tk, id: `${tk.token}:${wersja}`, wersja })),
  ),
};

const BRAK_BACKENDU = { message: 'Paczka komponentów działa bez backendu.', code: 'ATRAPA' };

type Filtr = (w: Wiersz) => boolean;

class Zapytanie implements PromiseLike<{ data: any; error: any; count?: number | null }> {
  private filtry: Filtr[] = [];
  private sortowanie: { kol: string; rosnaco: boolean }[] = [];
  private limitN: number | null = null;
  private tryb: 'select' | 'update' | 'insert' | 'upsert' | 'delete' = 'select';
  private zmiany: Wiersz | Wiersz[] | null = null;
  private jeden: 'single' | 'maybe' | null = null;

  constructor(private tabela: string) {}

  select(_kolumny?: string, _opcje?: unknown) { return this; }
  update(zmiany: Wiersz) { this.tryb = 'update'; this.zmiany = zmiany; return this; }
  insert(w: Wiersz | Wiersz[]) { this.tryb = 'insert'; this.zmiany = w; return this; }
  upsert(w: Wiersz | Wiersz[]) { this.tryb = 'upsert'; this.zmiany = w; return this; }
  delete() { this.tryb = 'delete'; return this; }

  eq(k: string, v: unknown) { this.filtry.push((w) => w[k] === v); return this; }
  neq(k: string, v: unknown) { this.filtry.push((w) => w[k] !== v); return this; }
  in(k: string, v: unknown[]) { this.filtry.push((w) => v.includes(w[k])); return this; }
  is(k: string, v: unknown) { this.filtry.push((w) => (w[k] ?? null) === v); return this; }
  gt(k: string, v: any) { this.filtry.push((w) => w[k] > v); return this; }
  gte(k: string, v: any) { this.filtry.push((w) => w[k] >= v); return this; }
  lt(k: string, v: any) { this.filtry.push((w) => w[k] < v); return this; }
  lte(k: string, v: any) { this.filtry.push((w) => w[k] <= v); return this; }
  like() { return this; }
  ilike() { return this; }
  or() { return this; }
  not() { return this; }
  filter() { return this; }
  match(o: Wiersz) { for (const [k, v] of Object.entries(o)) this.eq(k, v); return this; }
  contains() { return this; }
  range() { return this; }
  order(kol: string, o?: { ascending?: boolean }) { this.sortowanie.push({ kol, rosnaco: o?.ascending !== false }); return this; }
  limit(n: number) { this.limitN = n; return this; }
  single() { this.jeden = 'single'; return this; }
  maybeSingle() { this.jeden = 'maybe'; return this; }
  abortSignal() { return this; }

  private wykonaj() {
    const dane = (tabele[this.tabela] ??= []);
    const pasuje = (w: Wiersz) => this.filtry.every((f) => f(w));

    if (this.tryb === 'update') {
      for (const w of dane) if (pasuje(w)) Object.assign(w, this.zmiany);
      return { data: null, error: null };
    }
    if (this.tryb === 'insert' || this.tryb === 'upsert') {
      const nowe = Array.isArray(this.zmiany) ? this.zmiany : [this.zmiany ?? {}];
      dane.push(...nowe.map((w) => ({ ...w })));
      return { data: null, error: null };
    }
    if (this.tryb === 'delete') {
      tabele[this.tabela] = dane.filter((w) => !pasuje(w));
      return { data: null, error: null };
    }

    let wynik = dane.filter(pasuje).map((w) => ({ ...w }));
    for (const s of [...this.sortowanie].reverse()) {
      wynik.sort((a, b) => (a[s.kol] > b[s.kol] ? 1 : a[s.kol] < b[s.kol] ? -1 : 0) * (s.rosnaco ? 1 : -1));
    }
    if (this.limitN !== null) wynik = wynik.slice(0, this.limitN);
    if (this.jeden) return { data: wynik[0] ?? null, error: null };
    return { data: wynik, error: null, count: wynik.length };
  }

  then<A = any, B = never>(
    ok?: ((v: { data: any; error: any; count?: number | null }) => A | PromiseLike<A>) | null,
    zle?: ((e: any) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return Promise.resolve(this.wykonaj()).then(ok, zle);
  }
}

function rpc(nazwa: string, argumenty?: Record<string, any>) {
  const tokeny = tabele.component_tokens;
  const komponent = argumenty?.p_komponent;
  if (nazwa === 'publikuj_komponent' || nazwa === 'przywroc_komponent_z_live') {
    const [z, na] = nazwa === 'publikuj_komponent' ? ['sandbox', 'live'] : ['live', 'sandbox'];
    for (const zrodlo of tokeny.filter((w) => w.komponent === komponent && w.wersja === z)) {
      const cel = tokeny.find((w) => w.komponent === komponent && w.wersja === na && w.token === zrodlo.token);
      if (cel) cel.wartosc = zrodlo.wartosc;
    }
    return Promise.resolve({ data: null, error: null });
  }
  return Promise.resolve({ data: null, error: null });
}

const kanal = () => {
  const k: any = {
    on: () => k,
    subscribe: (cb?: (s: string) => void) => { cb?.('CLOSED'); return k; },
    unsubscribe: () => Promise.resolve('ok'),
    send: () => Promise.resolve('ok'),
    track: () => Promise.resolve('ok'),
    presenceState: () => ({}),
  };
  return k;
};

export const supabase: any = {
  from: (tabela: string) => new Zapytanie(tabela),
  rpc,
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    refreshSession: () => Promise.resolve({ data: { session: null, user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    setSession: () => Promise.resolve({ data: { session: null }, error: BRAK_BACKENDU }),
  },
  functions: {
    invoke: () => Promise.resolve({ data: null, error: BRAK_BACKENDU }),
  },
  channel: kanal,
  removeChannel: () => Promise.resolve('ok'),
  removeAllChannels: () => Promise.resolve([]),
  getChannels: () => [],
  storage: {
    from: () => ({
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      createSignedUrl: () => Promise.resolve({ data: null, error: BRAK_BACKENDU }),
      upload: () => Promise.resolve({ data: null, error: BRAK_BACKENDU }),
      download: () => Promise.resolve({ data: null, error: BRAK_BACKENDU }),
      remove: () => Promise.resolve({ data: null, error: null }),
      list: () => Promise.resolve({ data: [], error: null }),
    }),
  },
};
