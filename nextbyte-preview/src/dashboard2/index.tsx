import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@d2/contexts/AuthContext';
import { SubscriptionProvider } from '@d2/contexts/SubscriptionContext';
import { PanelGlownyKopia } from './PanelGlownyKopia';
import { PanelGlowny5 } from './piec/PanelGlowny5';

/**
 * Dwa układy pod jednym adresem.
 *
 * `5.0` to odtworzenie żywej platformy ze zrzutów — i to jest domyślne,
 * bo nad tym pracujemy. `1.0` to wierna kopia paczki `nextbyte-panel-glowny`
 * z repo, czyli stan starszy o cztery wersje; zostaje pod `?uklad=1`, żeby
 * dało się je zestawić obok siebie i zobaczyć, co dokładnie się zmieniło.
 */
function wybranyUklad(): '1' | '5' {
  if (typeof window === 'undefined') return '5';
  return new URLSearchParams(window.location.search).get('uklad') === '1' ? '1' : '5';
}

/**
 * Obudowa kopii Panelu Głównego — czterech dostawców i nic więcej.
 *
 * Kafelki przyszły z platformy nietknięte, więc dalej wołają `useQuery`
 * i `useNavigate`. Oba dostają tu wersję, która nie wychodzi z tej strony:
 *
 *  • `QueryClient` z wyłączonym ponawianiem i odświeżaniem — zapytania
 *    kończą się na atrapie Supabase, więc nie ma czego ponawiać, a próby
 *    w tle zaśmiecałyby konsolę przy pracy nad wyglądem,
 *  • `MemoryRouter` — kliknięcie „Doładuj" czy „Chat AI" przestawia adres
 *    w pamięci i nic się nie dzieje. Bez routera te same kliknięcia
 *    wysypywałyby cały kafelek, bo `useNavigate` poza routerem rzuca błąd,
 *  • `AuthProvider` — ten sam kontekst co w platformie, tyle że siedzi na
 *    atrapie klienta, więc oddaje jedno konto z `dane-atrapy.ts` i nigdzie
 *    się nie loguje. Sześć kafelków woła `useAuthId` albo `useWallet`
 *    i bez tego dostawcy każdy z nich wywracał się osobno,
 *  • `SubscriptionProvider` — potrzebuje go wybór modelu wewnątrz Szybkiego
 *    Kreatora, żeby wiedzieć, które modele są w planie. Tu plan jest jeden
 *    i stały.
 */
const klient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

export function Dashboard2() {
  return (
    <QueryClientProvider client={klient}>
      <MemoryRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <div className="h-full w-full overflow-y-auto bg-background text-foreground">
              {wybranyUklad() === '1' ? <PanelGlownyKopia /> : <PanelGlowny5 />}
            </div>
          </SubscriptionProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

export default Dashboard2;
