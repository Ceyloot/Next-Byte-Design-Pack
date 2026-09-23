import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * AKTYWNOŚĆ DZIENNA — dane pod wykres w stylu siatki GitHuba na Panelu Głównym.
 *
 * Liczy się PO STRONIE BAZY (RPC `aktywnosc_dzienna`), nie w przeglądarce.
 * Powód jest konkretny: aktywność to głównie `wallet_transactions` — u aktywnego
 * konta 2–3 tysiące wierszy na pół roku. PostgREST tnie odpowiedź na 1000 wierszy
 * BEZ ostrzeżenia (znana pułapka), więc liczenie po stronie klienta dawałoby
 * cichy, zaniżony wykres. RPC robi GROUP BY w SQL i zwraca ~180 wierszy
 * {dzien, liczba} — dokładnie i lekko. Funkcja jest SECURITY DEFINER kotwiczona
 * na `auth.uid()`, więc każdy widzi wyłącznie własną aktywność.
 */

export interface DzienAktywnosci {
  /** Klucz `YYYY-MM-DD` w czasie lokalnym. */
  klucz: string;
  data: Date;
  liczba: number;
  /** 0 (brak) … 4 (najwięcej) — poziom nasycenia komórki. */
  poziom: 0 | 1 | 2 | 3 | 4;
}

interface WierszRpc { dzien: string; liczba: number }

/** Klucz dnia w czasie LOKALNYM (nie UTC), żeby komórka trafiła we właściwą kratkę. */
function kluczDnia(d: Date): string {
  const r = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dz = String(d.getDate()).padStart(2, '0');
  return `${r}-${m}-${dz}`;
}

/**
 * Progi poziomów liczone z NIEZEROWYCH dni, nie z max.
 * Konto z jednym dniem-rekordem (np. 106 zdarzeń) i resztą po kilka nie może
 * spłaszczyć całej siatki do poziomu 1 — dlatego progi idą po kwartylach
 * rozkładu, a nie po ułamkach maksimum. Zwraca trzy granice [p, p, p].
 */
function progi(liczby: number[]): [number, number, number] {
  const dodatnie = liczby.filter((n) => n > 0).sort((a, b) => a - b);
  if (dodatnie.length === 0) return [1, 2, 3];
  const kwartyl = (u: number) => dodatnie[Math.min(dodatnie.length - 1, Math.floor(u * dodatnie.length))];
  const p1 = Math.max(1, kwartyl(0.25));
  const p2 = Math.max(p1 + 1, kwartyl(0.5));
  const p3 = Math.max(p2 + 1, kwartyl(0.75));
  return [p1, p2, p3];
}

function poziomDla(liczba: number, [p1, p2, p3]: [number, number, number]): DzienAktywnosci['poziom'] {
  if (liczba <= 0) return 0;
  if (liczba <= p1) return 1;
  if (liczba <= p2) return 2;
  if (liczba <= p3) return 3;
  return 4;
}

export interface StanAktywnosci {
  dni: DzienAktywnosci[];
  /** Ile dni miało jakąkolwiek aktywność w oknie. */
  aktywneDni: number;
  /** Najdłuższa seria kolejnych aktywnych dni, licząc do dziś. */
  aktualnaSeria: number;
  ladowanie: boolean;
  blad: string | null;
}

/**
 * Zwraca CIĄGŁĄ listę dni od (dziś − dni + 1) do dziś — także te bez aktywności,
 * żeby siatka miała komplet kratek. Braki w RPC = poziom 0.
 */
export function useAktywnoscDzienna(dni = 182): StanAktywnosci {
  const [stan, setStan] = useState<StanAktywnosci>({
    dni: [], aktywneDni: 0, aktualnaSeria: 0, ladowanie: true, blad: null,
  });

  useEffect(() => {
    let anulowane = false;

    (async () => {
      const { data, error } = await supabase.rpc('aktywnosc_dzienna' as any, { p_dni: dni });
      if (anulowane) return;

      if (error) {
        setStan((p) => ({ ...p, ladowanie: false, blad: error.message }));
        return;
      }

      const mapa = new Map<string, number>();
      for (const w of (data ?? []) as WierszRpc[]) {
        // `dzien` z bazy to 'YYYY-MM-DD' — bierzemy wprost, bez parsowania do Date
        // (parsowanie przez new Date('YYYY-MM-DD') wpadłoby w UTC i cofnęło dzień).
        mapa.set(w.dzien, Number(w.liczba) || 0);
      }

      const progiPoz = progi([...mapa.values()]);

      const lista: DzienAktywnosci[] = [];
      const dzis = new Date();
      dzis.setHours(0, 0, 0, 0);
      for (let i = dni - 1; i >= 0; i--) {
        const d = new Date(dzis);
        d.setDate(dzis.getDate() - i);
        const klucz = kluczDnia(d);
        const liczba = mapa.get(klucz) ?? 0;
        lista.push({ klucz, data: d, liczba, poziom: poziomDla(liczba, progiPoz) });
      }

      // Aktualna seria: od dziś wstecz, dopóki dzień ma aktywność.
      let seria = 0;
      for (let i = lista.length - 1; i >= 0; i--) {
        if (lista[i].liczba > 0) seria++;
        else break;
      }

      setStan({
        dni: lista,
        aktywneDni: [...mapa.values()].filter((n) => n > 0).length,
        aktualnaSeria: seria,
        ladowanie: false,
        blad: null,
      });
    })();

    return () => { anulowane = true; };
  }, [dni]);

  return stan;
}
