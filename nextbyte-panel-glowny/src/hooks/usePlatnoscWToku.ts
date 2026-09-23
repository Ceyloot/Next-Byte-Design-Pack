import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Płatność, która czeka na potwierdzenie w banku (3DS/SCA).
 *
 * PO CO: klient 28.08.2026 kupił subskrypcję, jego bank poprosił o potwierdzenie,
 * płatność utknęła w stanie `incomplete` — i nikt się o tym nie dowiedział.
 * Ani on, ani my. Wyszło dopiero, gdy napisał na Discordzie.
 *
 * Stan zapisuje webhook na `invoice.payment_action_required` i kasuje go przy
 * `invoice.payment_succeeded`, więc pasek znika sam, gdy klient dokończy.
 *
 * DLACZEGO OSOBNY HOOK, A NIE POLE W SubscriptionContext: tamten kontekst jedzie
 * przez `check-subscription`, gdzie odpowiedź budowana jest ręcznie w kilkunastu
 * miejscach. Pole dodane w jednym zniknęłoby w pozostałych — a do tego kontekst
 * ma cache liczony w godzinach, więc pasek pojawiałby się z dużym opóźnieniem.
 * Tu czytamy wprost z tabeli, z krótkim odświeżaniem.
 */
export interface PlatnoscWToku {
  invoiceId: string;
  link: string;
  odKiedy: string;
  wygasa: string | null;
  /** Ile godzin czeka — po dobie warto zapytać, czy klient potrzebuje pomocy. */
  godzinCzekania: number;
}

export const usePlatnoscWToku = () => {
  const { user } = useAuthContext();

  return useQuery<PlatnoscWToku | null>({
    queryKey: ['platnosc-w-toku', user?.id],
    enabled: !!user?.id,
    // Klient wraca z aplikacji banku i pasek ma zniknąć bez przeładowania strony.
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 15 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscribers')
        .select('pending_payment_invoice_id, pending_payment_url, pending_payment_since, pending_payment_expires_at')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error || !data) return null;

      const invoiceId = data.pending_payment_invoice_id;
      const link = data.pending_payment_url;
      // Bez linku pasek nie ma czego zaoferować — lepiej nic nie pokazać
      // niż przycisk, który donikąd nie prowadzi.
      if (!invoiceId || !link) return null;

      // Po wygaśnięciu faktury link przestaje działać. Pasek musi zniknąć sam,
      // nawet gdyby webhook czyszczący nie doszedł.
      const wygasa = data.pending_payment_expires_at;
      if (wygasa && new Date(wygasa).getTime() < Date.now()) return null;

      const odKiedy = data.pending_payment_since || new Date().toISOString();
      const godzinCzekania = Math.max(
        0,
        Math.floor((Date.now() - new Date(odKiedy).getTime()) / (1000 * 60 * 60)),
      );

      return { invoiceId, link, odKiedy, wygasa, godzinCzekania };
    },
  });
};
