import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CookieConsentSettings, CookieCategory } from '@/types/cookies';

/*
  ════════════════════════════════════════════════════════════════════════════
   PUSTA LISTA MUSI BYĆ ZA KAŻDYM RAZEM TĄ SAMĄ PUSTĄ LISTĄ
  ════════════════════════════════════════════════════════════════════════════

  Znalezione 09.09.2026 w konsoli przeglądarki na /cennik: 450 wpisów
  „Maximum update depth exceeded", wskazujących na `CookieConsentPopup`.

  Mechanizm: hook oddawał `categories || []`, więc dopóki zapytanie nie ma
  danych (ładowanie, błąd, brak dostępu), KAŻDY render tworzył NOWĄ pustą
  tablicę. W oknie ciasteczek ta tablica jest zależnością efektu:

      useEffect(() => { … setWybor(start); }, [categories]);

  Nowa tożsamość → efekt → `setWybor` → render → znowu nowa tablica. Pętla bez
  końca; React wybija się z niej po pięćdziesięciu obrotach i zgłasza błąd,
  a do tego czasu pali procesor odwiedzającemu stronę cennika.

  `||` zamienione przy okazji na `??`: `[]` jest prawdziwe, więc różnicy tu nie
  robi, ale `??` mówi wprost, że chodzi o BRAK danych, a nie o wartość fałszywą.
*/
const BEZ_KATEGORII: CookieCategory[] = [];

export function useCookieSettings() {
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['cookie-consent-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cookie_consent_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as CookieConsentSettings;
    },
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['cookie-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cookie_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as CookieCategory[];
    },
  });

  return {
    settings,
    categories: categories ?? BEZ_KATEGORII,
    isLoading: isLoadingSettings || isLoadingCategories,
  };
}
