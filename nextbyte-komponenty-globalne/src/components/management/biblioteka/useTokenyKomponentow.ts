import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { wyczyscCacheTokenow } from '@/hooks/useKomponentyGlobalne';

/**
 * TOKENY KOMPONENTÓW — strona administracyjna (sandbox + publikacja).
 *
 * Różnica wobec `useKomponentyGlobalne`: tamten czyta WYŁĄCZNIE `live` i tylko
 * je nakłada. Ten czyta obie wersje, żeby dało się pokazać, co się zmieni po
 * publikacji, i pilnuje, żeby sandbox nie wyciekł na `documentElement`.
 *
 * Sandbox NIGDY nie trafia na `document`. Podgląd dostaje wartości jako styl
 * na jednym kontenerze (patrz ThemeScope) — inaczej każde ruszenie suwaka
 * przemalowywałoby cały Panel Zarządu i administrator nie widziałby różnicy
 * między tym, co testuje, a tym, co już działa.
 */

export type Komponent =
  | 'przycisk-styl-1'
  | 'przycisk-styl-2'
  | 'kontener-kafelek'
  | 'kontener-wiersz'
  /* Płynny kursor w polach — parametry sprężyny i grubość karetki.
     Lista jest zamknięta również CHECK-iem w bazie, więc nowa pozycja wymaga
     obu miejsc naraz; sam wpis tutaj odbiłby się o 23514 przy zapisie. */
  | 'pole-kursor'
  /* Materiał szkła platformy: rozmycie, gęstość zasłony, nasycenie. */
  | 'szklo-material';

export interface TokenKomponentu {
  id: string;
  komponent: Komponent;
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

/** Zlepia liczbę z suwaka z jednostką z bazy. Bez tego `20` zamiast `20px`. */
export function zJednostka(wartosc: number, jednostka: string | null): string {
  const j = jednostka ?? '';
  // Krok 0.01 potrzebuje dwóch miejsc, krok 1 — zera. Bez tego wychodzi
  // `0.38000000000000006` i taki string ląduje w bazie.
  const miejsca = wartosc % 1 === 0 ? 0 : 2;
  return `${wartosc.toFixed(miejsca)}${j}`;
}

/** Wyciąga liczbę z `'20px'` → 20. Zwraca NaN, gdy wartość jest bez sensu. */
export function bezJednostki(wartosc: string): number {
  return Number.parseFloat(wartosc);
}

export function useTokenyKomponentow(komponent: Komponent) {
  const [sandbox, setSandbox] = useState<TokenKomponentu[]>([]);
  const [live, setLive] = useState<Record<string, string>>({});
  const [ladowanie, setLadowanie] = useState(true);
  const [blad, setBlad] = useState<string | null>(null);
  const [zapisywanie, setZapisywanie] = useState(false);

  const wczytaj = useCallback(async () => {
    setLadowanie(true);
    setBlad(null);

    const { data, error } = await supabase
      .from('component_tokens' as any)
      .select('id, komponent, token, wartosc, wersja, etykieta, opis, min_wartosc, max_wartosc, krok, jednostka, kolejnosc')
      .eq('komponent', komponent)
      .order('kolejnosc', { ascending: true });

    if (error) {
      setBlad(error.message);
      setLadowanie(false);
      return;
    }

    const wiersze = (data ?? []) as any[];
    setSandbox(wiersze.filter(w => w.wersja === 'sandbox') as TokenKomponentu[]);
    setLive(Object.fromEntries(wiersze.filter(w => w.wersja === 'live').map(w => [w.token, w.wartosc])));
    setLadowanie(false);
  }, [komponent]);

  useEffect(() => { wczytaj(); }, [wczytaj]);

  /** Zmiana lokalna — suwak ma być natychmiastowy, bez zapytania na każdy ruch. */
  const ustaw = useCallback((token: string, wartosc: string) => {
    setSandbox(p => p.map(t => (t.token === token ? { ...t, wartosc } : t)));
  }, []);

  /** Zapis sandboxa do bazy. Nie rusza `live`, więc użytkownicy nic nie widzą. */
  const zapiszSandbox = useCallback(async () => {
    setZapisywanie(true);
    setBlad(null);
    // Pojedyncze update'y, nie upsert po (komponent, token, wersja): upsert
    // bez pełnego zestawu kolumn NOT NULL (etykieta) wstawiłby pusty wiersz,
    // gdyby id się nie zgrało.
    for (const t of sandbox) {
      const { error } = await supabase
        .from('component_tokens' as any)
        .update({ wartosc: t.wartosc })
        .eq('id', t.id);
      if (error) {
        setBlad(`Zapis ${t.token}: ${error.message}`);
        setZapisywanie(false);
        return false;
      }
    }
    setZapisywanie(false);
    return true;
  }, [sandbox]);

  /**
   * Publikacja. Najpierw zapis sandboxa, potem funkcja bazodanowa, która
   * przepisuje sandbox → live JEDNYM krokiem. Gdyby to była pętla z
   * przeglądarki, zerwane połączenie w połowie zostawiłoby platformę
   * pół-nową, pół-starą.
   */
  const publikuj = useCallback(async () => {
    setZapisywanie(true);
    setBlad(null);

    const zapisano = await zapiszSandbox();
    if (!zapisano) return false;

    const { error } = await supabase.rpc('publikuj_komponent' as any, { p_komponent: komponent });
    if (error) {
      setBlad(`Publikacja: ${error.message}`);
      setZapisywanie(false);
      return false;
    }

    wyczyscCacheTokenow();
    window.dispatchEvent(new Event('komponentyOpublikowane'));
    await wczytaj();
    setZapisywanie(false);
    return true;
  }, [komponent, zapiszSandbox, wczytaj]);

  /** Cofnięcie sandboxa do tego, co jest opublikowane. */
  const przywrocZLive = useCallback(async () => {
    setZapisywanie(true);
    setBlad(null);
    const { error } = await supabase.rpc('przywroc_komponent_z_live' as any, { p_komponent: komponent });
    if (error) {
      setBlad(`Przywracanie: ${error.message}`);
      setZapisywanie(false);
      return false;
    }
    await wczytaj();
    setZapisywanie(false);
    return true;
  }, [komponent, wczytaj]);

  /** Które tokeny różnią się od opublikowanych — to jest treść „do publikacji". */
  const rozne = sandbox.filter(t => live[t.token] !== undefined && live[t.token] !== t.wartosc);

  /** Gotowy styl dla kontenera podglądu. Sandbox NIE idzie na document. */
  const stylPodgladu = Object.fromEntries(sandbox.map(t => [t.token, t.wartosc])) as React.CSSProperties;

  return {
    sandbox, live, rozne, ladowanie, blad, zapisywanie,
    ustaw, zapiszSandbox, publikuj, przywrocZLive, wczytaj, stylPodgladu,
  };
}
