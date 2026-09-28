import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { DostawcaPanelPaska, usePanelPaska } from '@/contexts/PanelPaskaContext';
import MobileHeader from '@/components/MobileHeader';
import { UchwytKrawedzi } from '@/components/UchwytKrawedzi';
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

/*
 * PASEK NAD TREŚCIĄ (26.09.2026, Artur: „górny navbar musi mieć NextGlass").
 *
 * Szkło NextGlass rozmywa to, co POD nim. Pasek stał wcześniej w osobnym
 * wierszu nad obszarem przewijania, więc pod spodem miał tylko tło powłoki —
 * treść nigdy pod niego nie wjeżdżała i materiał był kosztem bez efektu
 * (design-kit/README: „pasek musi leżeć NA przewijanej treści").
 *
 * Teraz pasek leży `absolute` nad obszarem treści, a treść dostaje wyściółkę
 * równą jego zmierzonej wysokości — na starcie wygląda tak samo, a przy
 * przewijaniu przejeżdża POD szkłem. Wysokość z `ResizeObserver`, bo zależy
 * od banerów płatności i od szerokości (telefon / tablet / desktop).
 */
const WysokoscPaskaKontekst = React.createContext<{
  wys: number; ustaw: (n: number) => void;
  /** Odległość od krawędzi ekranu do krawędzi szyby paska (margines + notch). */
  odstep: number; ustawOdstep: (n: number) => void;
  schowany: boolean; ustawSchowany: (v: boolean) => void;
}>({ wys: 0, ustaw: () => {}, odstep: 0, ustawOdstep: () => {}, schowany: false, ustawSchowany: () => {} });

const PowlokaPigulki: React.FC<{ pozycja: 'lewo' | 'prawo' | 'gora' | 'dol'; children: React.ReactNode }> = ({ pozycja, children }) => {
  const { ustaw, ustawOdstep, wys, schowany } = React.useContext(WysokoscPaskaKontekst);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const zmierz = () => {
      ustaw(el.offsetHeight);
      const nav = el.querySelector('nav');
      if (!nav) return;
      const a = el.getBoundingClientRect();
      const b = nav.getBoundingClientRect();
      ustawOdstep(Math.max(0, Math.round(pozycja === 'dol' ? a.bottom - b.bottom : b.top - a.top)));
    };
    const ro = new ResizeObserver(zmierz);
    ro.observe(el);
    zmierz();
    return () => ro.disconnect();
  }, [ustaw, ustawOdstep, pozycja]);
  return (
    /* Chowanie przez `top`/`bottom`, NIE `transform`: przodek z transformacją
       odcina szkłu próbkowanie tła (patrz komentarz przy menu w PillNavbar). */
    <div
      ref={ref}
      className="pointer-events-none absolute inset-x-0 z-50 transition-[top,bottom] duration-300 ease-out [&>*]:pointer-events-auto"
      style={{ [pozycja === 'dol' ? 'bottom' : 'top']: schowany ? -wys - 8 : 0 }}
    >
      {children}
    </div>
  );
};

/*
 * PASEK JEST GRANICĄ (26.09.2026, Artur: „nie ma tego odcięcia — navbar sam
 * jest granicą, pod którą rzeczy znikają; widać, że wchodzą pod niego, ale
 * nie widać od góry, że wychodzą").
 *
 * Zmierzone: Dashboard przewija WŁASNY `<main>`, który zaczynał się 66 px
 * niżej, pod paskiem — treść ucinała się na dolnej krawędzi szyby i nigdy
 * pod nią nie wjeżdżała. Dlatego:
 *   • wysokość paska idzie w zmienne `--nb-pasek-gora` / `--nb-pasek-dol`;
 *     strona z własnym przewijaniem wciąga swój kontener pod pasek
 *     (`-mt-[var(--nb-pasek-gora)]` + ta sama wyściółka — patrz Dashboard),
 *   • maska ucina treść NA KRAWĘDZI SZYBY: pod szkłem widać, nad nim nic.
 *     Maska leży na obszarze treści, pasek jest jego RODZEŃSTWEM, więc
 *     szkło dalej próbkuje to, co pod nim,
 */
const TrescPodPigulka: React.FC<{ pozycja: 'lewo' | 'prawo' | 'gora' | 'dol'; children: React.ReactNode }> = ({ pozycja, children }) => {
  const { wys, odstep, schowany } = React.useContext(WysokoscPaskaKontekst);
  const ref = React.useRef<HTMLDivElement>(null);
  const naDole = pozycja === 'dol';

  /* Pasek NIE chowa się przy przewijaniu (Artur, 26.09: „navbar ma się nie
     chować") — stoi na stałe, a treść przejeżdża pod szkłem. Mechanizm
     `schowany` zostaje w kontekście, ale nic go już nie włącza. */

  const ciecie = schowany ? 0 : odstep;
  const maska = naDole
    ? `linear-gradient(to top, transparent ${ciecie}px, #000 ${ciecie}px)`
    : `linear-gradient(to bottom, transparent ${ciecie}px, #000 ${ciecie}px)`;

  return (
    <>
    <div
      ref={ref}
      className="absolute inset-0"
      style={{
        '--nb-pasek-gora': `${naDole ? 0 : wys}px`,
        '--nb-pasek-dol': `${naDole ? wys : 0}px`,
        maskImage: maska,
        WebkitMaskImage: maska,
      } as React.CSSProperties}
    >
      <main
        className="relative h-full overflow-y-auto overflow-x-hidden"
        style={{ paddingTop: 'var(--nb-pasek-gora)', paddingBottom: 'var(--nb-pasek-dol)' }}
      >
        {children}
      </main>
    </div>
    <PanicOverlay />
    </>
  );
};

const DostawcaWysokosciPaska: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wys, ustaw] = React.useState(0);
  const [odstep, ustawOdstep] = React.useState(0);
  const [schowany, ustawSchowany] = React.useState(false);
  const wartosc = React.useMemo(
    () => ({ wys, ustaw, odstep, ustawOdstep, schowany, ustawSchowany }),
    [wys, odstep, schowany],
  );
  return <WysokoscPaskaKontekst.Provider value={wartosc}>{children}</WysokoscPaskaKontekst.Provider>;
};

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
  const { navMode, pozycja } = useNavigationMode();
  const { canUsePillNavbar } = usePillNavbarAccess();

  // Global presence — report online/offline for current user
  usePresence();
  
  
  const showPaymentBanner = subscriptionStatus?.payment_failed && subscriptionStatus?.grace_period_end;

  // ── Pill Navbar mode ──
  if (navMode === 'pillnav' && canUsePillNavbar) {
    return (
      <DostawcaWysokosciPaska>
      <div className={`${appShellHeight} flex flex-col w-full bg-background overflow-hidden`}>
        {/* Światło pod szkłem — patrz `tlo-aplikacji.tsx`. Rozciągnięte na CAŁĄ
            powłokę, nie tylko na obszar treści: pigułka nawigacji leży wyżej,
            a `--background` to jednolita płaszczyzna, więc rozmywając ją
            pigułka dostawała z powrotem tę samą płaszczyznę i czytała się jak
            szara płyta. Teraz ma pod sobą plamy światła, czyli coś, co da się
            załamać. Wszystko powyżej musi być `relative`, żeby leżeć NAD. */}
        <TloAplikacji />
        {tloZakladki}
        <PowlokaPigulki pozycja={pozycja}>
          <PillNavbar />
          <PasekPlatnosciWToku />
          {showPaymentBanner && (
            <PaymentFailedBanner gracePeriodEnd={subscriptionStatus.grace_period_end!} />
          )}
        </PowlokaPigulki>
        <TrescPodPigulka pozycja={pozycja}>{children}</TrescPodPigulka>
      </div>
      </DostawcaWysokosciPaska>
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
        pozycja={pozycja}
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
  pozycja: 'lewo' | 'prawo' | 'gora' | 'dol';
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  appShellHeight: string;
  showMobileHeader: boolean;
  showPaymentBanner: boolean;
  subscriptionStatus: any;
  tloZakladki: React.ReactNode | null;
  children: React.ReactNode;
}> = ({ pozycja, isOpen, setIsOpen, appShellHeight, showMobileHeader, showPaymentBanner, subscriptionStatus, tloZakladki, children }) => {
  const { szerokosc } = usePanelPaska();

  return (
    <SidebarProvider
      open={isOpen}
      onOpenChange={setIsOpen}
      style={{ '--sidebar-width': `${szerokosc}px` } as React.CSSProperties}
    >
      <>
      <div className={`${appShellHeight} flex ${pozycja === 'prawo' ? 'flex-row-reverse' : ''} w-full bg-background overflow-hidden`}>
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
          {/* Telefon: górny pasek jak dawniej (Artur: „tak jak było wcześniej —
              od góry można wysunąć pasek boczny"), plus gest przeciągnięcia od
              krawędzi, który wysuwa ten sam panel. */}
          {showMobileHeader && <MobileHeader />}
          {showMobileHeader && <UchwytKrawedzi strona={pozycja === 'prawo' ? 'prawo' : 'lewo'} tylkoGest />}
          <PasekPlatnosciWToku />
          {showPaymentBanner && (
            <PaymentFailedBanner gracePeriodEnd={subscriptionStatus.grace_period_end!} />
          )}
          <main
            className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
          >
            {children}
          </main>
          <PanicOverlay />
        </SidebarInset>
      </div>
      </>
    </SidebarProvider>
  );
};
