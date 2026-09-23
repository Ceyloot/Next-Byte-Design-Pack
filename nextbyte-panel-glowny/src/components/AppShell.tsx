import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { DostawcaPanelPaska, usePanelPaska } from '@/contexts/PanelPaskaContext';
import MobileHeader from '@/components/MobileHeader';
import PaymentFailedBanner from '@/components/subscription/PaymentFailedBanner';
import PasekPlatnosciWToku from '@/components/subscription/PasekPlatnosciWToku';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppShellHeight } from '@/hooks/useMobileLayout';
import { useGlobalSidebar } from '@/contexts/SidebarContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useNavigationMode } from '@/contexts/NavigationModeContext';
import { usePillNavbarAccess } from '@/hooks/usePillNavbarAccess';
import { PillNavbar } from '@/components/PillNavbar';
import { usePresence } from '@/hooks/usePresence';
import PanicOverlay from '@/components/PanicOverlay';
import { TloAplikacji } from '@/components/ui/tlo-aplikacji';
import { DostawcaTlaZakladki, useTloZakladkiPowloki, useSlotTla } from '@/contexts/TloZakladkiContext';


interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  /* Dostawca tła zakładki OTACZA obie powłoki: strona rejestruje tło z wnętrza
     `children`, a powłoka czyta je na korzeniu — patrz `TloZakladkiContext`. */
  <DostawcaTlaZakladki>
    <AppShellWnetrze>{children}</AppShellWnetrze>
  </DostawcaTlaZakladki>
);

/**
 * DOMYŚLNE POŚWIATY SCENY (07.09.2026, Michał: „w chat ai i innych te glow
 * orb też"). Zakładka, która nie rejestruje własnego tła, dostaje tę samą
 * parę orbów co Zadania/Notatki — prawy górny i lewy dolny w barwie akcentu,
 * rysowane na korzeniu powłoki, więc od krawędzi EKRANU i pod pastylką paska.
 * Strona z własnym tłem (slot „strona") ma je u siebie i tu nic nie dostaje.
 */
const PoswiatyDomyslne: React.FC = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: 'hsl(var(--primary))' }} />
    <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full opacity-15 blur-3xl" style={{ background: 'hsl(var(--primary))' }} />
  </div>
);

const AppShellWnetrze: React.FC<AppShellProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const tloStrony = useSlotTla('strona');
  const tlaZarejestrowane = useTloZakladkiPowloki();
  const tloZakladki = (
    <>
      {!tloStrony && <PoswiatyDomyslne />}
      {tlaZarejestrowane}
    </>
  );
  const appShellHeight = useAppShellHeight();
  const { isOpen, setIsOpen } = useGlobalSidebar();
  const { subscriptionStatus } = useSubscriptionContext();
  const { navMode } = useNavigationMode();
  const { canUsePillNavbar } = usePillNavbarAccess();

  // Global presence — report online/offline for current user
  usePresence();
  
  
  const showPaymentBanner = subscriptionStatus?.payment_failed && subscriptionStatus?.grace_period_end;

  // ── Pill Navbar mode ──
  if (navMode === 'pillnav' && canUsePillNavbar) {
    return (
      <div className={`${appShellHeight} flex flex-col w-full bg-background overflow-hidden`}>
        {/* Światło pod szkłem — patrz `tlo-aplikacji.tsx`. Rozciągnięte na CAŁĄ
            powłokę, nie tylko na obszar treści: pigułka nawigacji leży wyżej,
            a `--background` to jednolita płaszczyzna, więc rozmywając ją
            pigułka dostawała z powrotem tę samą płaszczyznę i czytała się jak
            szara płyta. Teraz ma pod sobą plamy światła, czyli coś, co da się
            załamać. Wszystko powyżej musi być `relative`, żeby leżeć NAD. */}
        <TloAplikacji />
        {tloZakladki}
        <div className="relative flex-shrink-0">
          <PillNavbar />
          <PasekPlatnosciWToku />
          {showPaymentBanner && (
            <PaymentFailedBanner gracePeriodEnd={subscriptionStatus.grace_period_end!} />
          )}
        </div>
        <div className="relative flex-1 min-h-0">
          <main className="relative h-full overflow-y-auto overflow-x-hidden">
            {children}
          </main>
          <PanicOverlay />
        </div>
      </div>
    );
  }

  // ── Sidebar mode (default) ──
  const showMobileHeader = isMobile;

  return (
    /* Dostawca OTACZA `SidebarProvider`, nie odwrotnie — bo szerokość paska
       musi trafić do zmiennej `--sidebar-width` NA POWŁOCE. To z niej układ
       liczy odstęp treści; ustawienie jej na samym `<Sidebar>` powiększało
       pasek, ale treść dalej odsuwała się o starą wartość i wchodziła pod
       niego (zgłoszone przez Michała: „zawartość narzędzia nachodzi pod pasek").  */
    <DostawcaPanelPaska>
      <PowlokaZPaskiem
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        appShellHeight={appShellHeight}
        showMobileHeader={showMobileHeader}
        showPaymentBanner={!!showPaymentBanner}
        subscriptionStatus={subscriptionStatus}
        tloZakladki={tloZakladki}
      >
        {children}
      </PowlokaZPaskiem>
    </DostawcaPanelPaska>
  );
};

/* Osobny komponent, bo `usePanelPaska` musi być WEWNĄTRZ dostawcy, a jego
   wynik potrzebny jest NA `SidebarProvider`. */
const PowlokaZPaskiem: React.FC<{
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  appShellHeight: string;
  showMobileHeader: boolean;
  showPaymentBanner: boolean;
  subscriptionStatus: any;
  tloZakladki: React.ReactNode | null;
  children: React.ReactNode;
}> = ({ isOpen, setIsOpen, appShellHeight, showMobileHeader, showPaymentBanner, subscriptionStatus, tloZakladki, children }) => {
  const { szerokosc } = usePanelPaska();

  return (
    <SidebarProvider
      open={isOpen}
      onOpenChange={setIsOpen}
      style={{ '--sidebar-width': `${szerokosc}px` } as React.CSSProperties}
    >
      <>
      <div className={`${appShellHeight} flex w-full bg-background overflow-hidden`}>
        {/* Światło pod szkłem NA KORZENIU powłoki, nie w obszarze treści
            (07.09.2026): pastylka paska stoi POZA `SidebarInset`, więc z tłem
            w środku treści rozmywała jednolity `--background` i czytała się
            jak szara płyta — dokładnie problem opisany przy pigułce nawigacji
            wyżej. Treść dostaje to samo światło, bo `SidebarInset` ma tło
            przezroczyste; wszystko powyżej jest `relative`, żeby leżeć NAD. */}
        <TloAplikacji />
        {/* Tło zakładki (siatka + poświaty modułu) — pod treścią I pod pastylką,
            żeby nie było szwu na krawędzi treści. */}
        {tloZakladki}
        <AppSidebar />
        <SidebarInset className="relative flex-1 flex flex-col !min-h-0 overflow-x-hidden !bg-transparent">
          {showMobileHeader && <MobileHeader />}
          <PasekPlatnosciWToku />
          {showPaymentBanner && (
            <PaymentFailedBanner gracePeriodEnd={subscriptionStatus.grace_period_end!} />
          )}
          <main className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
          <PanicOverlay />
        </SidebarInset>
      </div>
      </>
    </SidebarProvider>
  );
};
