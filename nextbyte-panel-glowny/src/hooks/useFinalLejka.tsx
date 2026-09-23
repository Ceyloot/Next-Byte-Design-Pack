import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthId } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  wczytajStanLejka, wolnoPokazacOferte, toOstatniaSzansa, type StanLejka,
} from '@/lib/lejek';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  FINAŁ LEJKA — „ZACZYNAM OD" i oferta
 * ════════════════════════════════════════════════════════════════════════
 *
 * Dwa ostatnie kroki żyją na Panelu Głównym, bo tam ląduje człowiek po
 * Studiu Video i tam wraca po wyborze „zaczynam od".
 *
 * BRAMKA OFERTY JEST FAIL-CLOSED. Dopóki nie wiemy na pewno, że wolno ją
 * pokazać, NIE pokazujemy. Powód w `lejek.ts` przy `wolnoPokazacOferte`:
 * obiecaliśmy „ostatni raz", więc utracona sprzedaż jest tańsza niż złamane
 * słowo.
 */
export const useFinalLejka = () => {
  const userId = useAuthId();
  const [stan, setStan] = useState<StanLejka | null>(null);
  const [ofertaOtwarta, setOfertaOtwarta] = useState(false);
  const zaladowano = useRef(false);

  useEffect(() => {
    if (!userId || zaladowano.current) return;
    zaladowano.current = true;
    void (async () => {
      const s = await wczytajStanLejka(userId);
      setStan(s);
      if (s?.funnel_step === 'oferta' && wolnoPokazacOferte(s)) setOfertaOtwarta(true);
    })();
  }, [userId]);

  /*
    Po wyborze „zaczynam od" krok idzie na `oferta` — pokazujemy ją OD RAZU,
    a wybór odkładamy na później.

    Nawigacja musi poczekać, aż oferta się domknie: przeniesienie do modułu
    odmontowuje panel, a `OknoOferty` na nim mieszka. Zrobione wcześniej
    kasowało ofertę w tej samej klatce, w której miała się pokazać.
  */
  const zamknijOferte = useCallback(() => setOfertaOtwarta(false), []);

  return {
    ofertaOtwarta,
    /** Który ekran oferty — po pierwszej odmowie wracamy na „ostatnią szansę". */
    ekranOferty: toOstatniaSzansa(stan) ? ('ostatnia-szansa' as const) : ('oferta' as const),
    zamknijOferte,
  };
};
