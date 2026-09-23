import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { pobierzWszystkieWiersze } from '@/lib/pobierzWszystkieWiersze';

/**
 * Tempo wypalania Byte — ile realnie schodzi na dzień i na ile jeszcze wystarczy.
 *
 * Dlaczego OSOBNE zapytanie, a nie `useWallet().transactions`:
 * tamten hook ma `.limit(50)`. U intensywnego użytkownika 50 transakcji może nie
 * pokryć nawet doby, więc suma z tej listy ZANIŻYŁABY wypalanie i ZAWYŻYŁA
 * „wystarczy na X dni". Byłoby to kłamstwo o pieniądzach — na korzyść
 * użytkownika, ale wciąż kłamstwo. Tu bierzemy dokładnie okno czasowe, bez limitu.
 *
 * Dlaczego liczymy po ZNAKU kwoty, a nie po `transaction_type` (sprawdzone na
 * produkcji 30.07.2026): typ nie jest wiarygodnym wskaźnikiem kierunku —
 * `spend` ma 5551 wierszy ujemnych, ale też 439 DODATNICH, a `purchase`
 * 4 ujemne i 1 dodatni. Znak kwoty jest jedynym pewnym sygnałem.
 *
 * Czego NIE wliczamy i dlaczego:
 *  • `admin_remove`, `adjustment`, `admin_add`, `admin_credit` — operacje
 *    administracyjne. Jednorazowe odjęcie 5000 ⟠ przez admina zamieniłoby
 *    prognozę w „skończy ci się jutro", co nie ma nic wspólnego z tym, jak
 *    użytkownik korzysta z platformy.
 *  • zasilenia (`deposit`, `subscription_monthly_bonus`) — to przychód, a nie
 *    mniejsze zużycie. Wliczenie ich wyzerowałoby wypalanie u każdego
 *    subskrybenta i prognoza straciłaby sens.
 *  • zwroty ODEJMUJEMY od zużycia, bo zwrot odwraca wcześniejszą konsumpcję.
 */

/**
 * Domyślne okno. Od 04.08.2026 jest to już tylko DOMYŚLNA wartość — pasek salda
 * pozwala przełączyć na 30 i 90 dni (Michał: „fajnie, aby pokazywało ostatnie
 * 7/30/90 dni z przyciskiem zmiany").
 *
 * Siedem dni to sensowny start, bo tempo zużycia w AI zmienia się z tygodnia
 * na tydzień — średnia z kwartału powiedziałaby o dzisiejszym tempie niewiele.
 * Ale 90 dni pokazuje TREND, którego z siedmiu dni nie widać wcale.
 */
export const OKNA_DNI = [7, 30, 90] as const;
export type OknoDni = (typeof OKNA_DNI)[number];
const OKNO_DOMYSLNE: OknoDni = 7;

/** Typy, które są ruchem administracyjnym, nie zużyciem użytkownika. */
const TYPY_ADMINISTRACYJNE = new Set([
  'admin_remove', 'admin_add', 'admin_credit', 'adjustment',
]);

export interface ByteBurn {
  /** Suma zużycia w oknie (dodatnia liczba Byte). */
  zuzyteWOknie: number;
  /** Średnie zużycie na dzień, zaokrąglone. */
  naDzien: number;
  /** Na ile dni wystarczy przy tym tempie. `null` gdy nie da się orzec. */
  dniDoKonca: number | null;
  /** Ile dni danych faktycznie mamy — poniżej 2 prognoza jest niepewna. */
  dniDanych: number;
  /** Czy w ogóle jest z czego liczyć (brak zużycia = brak prognozy). */
  maPrognoze: boolean;
}

export function useByteBurn(
  userId: string | undefined,
  balance: number,
  oknoDni: OknoDni = OKNO_DOMYSLNE,
) {
  const { data, isLoading } = useQuery({
    queryKey: ['byte-burn', userId, oknoDni],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const od = new Date(Date.now() - oknoDni * 24 * 60 * 60 * 1000).toISOString();
      /* STRONICOWANIE, nie jedno zapytanie. PostgREST oddaje maksymalnie
         1000 wierszy i NIE MÓWI, że uciął. Przy oknie 7 dni to nie groziło,
         ale przy 90 dniach aktywne konto spokojnie przekracza tysiąc ruchów
         w portfelu — a wtedy „zużyte w oknie" i cały wykres liczyłyby się
         z wycinka danych, wyglądając na kompletne. Ten sam błąd kosztował
         już raz w Zarządzie 75% wykazanych przychodów. */
      return await pobierzWszystkieWiersze<{ amount: number; transaction_type: string; created_at: string }>(
        (odI, doI) => supabase
          .from('wallet_transactions')
          .select('amount, transaction_type, created_at')
          .eq('user_id', userId!)
          .gte('created_at', od)
          .order('created_at', { ascending: true })
          .range(odI, doI),
      );
    },
  });

  const wiersze = data ?? [];

  let zuzyte = 0;
  let zwroty = 0;
  for (const w of wiersze) {
    if (TYPY_ADMINISTRACYJNE.has(w.transaction_type)) continue;
    const kwota = Number(w.amount) || 0;
    if (w.transaction_type === 'refund') {
      // zwrot zawsze dodatni — odwraca wcześniejsze zużycie
      zwroty += Math.abs(kwota);
    } else if (kwota < 0) {
      zuzyte += -kwota;
    }
    // kwoty dodatnie o innym typie = zasilenia, pomijamy
  }

  const zuzyteWOknie = Math.max(0, zuzyte - zwroty);

  // Ile dni danych realnie mamy — świeże konto nie ma pełnego okna.
  const dniDanych = wiersze.length > 0
    ? Math.min(oknoDni, Math.max(1,
        Math.ceil((Date.now() - new Date(wiersze[0].created_at).getTime()) / 86_400_000)))
    : 0;

  const naDzien = dniDanych > 0 ? Math.round(zuzyteWOknie / dniDanych) : 0;
  const maPrognoze = naDzien > 0;

  return {
    ladowanie: isLoading,
    burn: {
      zuzyteWOknie: Math.round(zuzyteWOknie),
      naDzien,
      dniDoKonca: maPrognoze ? Math.floor(balance / naDzien) : null,
      dniDanych,
      maPrognoze,
    } as ByteBurn,
    /** Punkty do wykresu: saldo dzień po dniu, licząc wstecz od dzisiejszego. */
    seria: zbudujSerie(wiersze, balance, oknoDni),
    /** Zużycie Byte w każdym z dni okna, od najstarszego do dzisiaj. */
    zuzycieDzienne: zbudujZuzycieDzienne(wiersze, oknoDni),
  };
}

/**
 * Odtwarza saldo na koniec każdego z ostatnich dni, cofając się od stanu
 * bieżącego. Wykres pokazuje wtedy PRAWDZIWY przebieg salda, a nie wygładzoną
 * ozdobę — jeśli ktoś dostał zasilenie, na wykresie widać skok.
 */
function zbudujSerie(
  wiersze: { amount: number; created_at: string }[],
  balance: number,
  oknoDni: number,
): number[] {
  const dni: number[] = [];
  let stan = balance;
  const dzisiaj = new Date();
  dzisiaj.setHours(23, 59, 59, 999);

  for (let i = 0; i < oknoDni; i++) {
    dni.unshift(stan);
    const granica = new Date(dzisiaj.getTime() - i * 86_400_000);
    const poczatek = new Date(granica.getTime() - 86_400_000);
    // cofamy wszystkie ruchy z tego dnia, żeby dostać stan z dnia poprzedniego
    for (const w of wiersze) {
      const t = new Date(w.created_at).getTime();
      if (t > poczatek.getTime() && t <= granica.getTime()) {
        stan -= Number(w.amount) || 0;
      }
    }
  }
  return dni;
}

/**
 * Zużycie dzień po dniu, tymi SAMYMI regułami co `zuzyteWOknie`: pomijamy ruchy
 * administracyjne, zwroty odwracają wcześniejszy wydatek, a zasilenia nie są
 * wydatkiem. Dzięki temu suma słupków zgadza się z liczbą pod wykresem —
 * gdyby każda z nich liczyła po swojemu, wykres kłamałby względem podpisu.
 *
 * DLACZEGO NIE Z RÓŻNICY SALD: w dniu doładowania wpłata zamaskowałaby wydatek
 * (saldo rośnie, więc „zużycie" wyszłoby zero). Liczymy z ruchów, nie ze stanu.
 */
function zbudujZuzycieDzienne(
  wiersze: { amount: number; transaction_type: string; created_at: string }[],
  oknoDni: number,
): number[] {
  const dni = new Array(oknoDni).fill(0);
  const koniecDzis = new Date();
  koniecDzis.setHours(23, 59, 59, 999);

  for (const w of wiersze) {
    if (TYPY_ADMINISTRACYJNE.has(w.transaction_type)) continue;
    const kwota = Number(w.amount) || 0;
    const wydatek = w.transaction_type === 'refund' ? -Math.abs(kwota) : (kwota < 0 ? -kwota : 0);
    if (wydatek === 0) continue;

    const wiek = Math.floor((koniecDzis.getTime() - new Date(w.created_at).getTime()) / 86_400_000);
    const idx = oknoDni - 1 - wiek;
    if (idx >= 0 && idx < oknoDni) dni[idx] += wydatek;
  }

  return dni.map((d) => Math.max(0, Math.round(d)));
}
