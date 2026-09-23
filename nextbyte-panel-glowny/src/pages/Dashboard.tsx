import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useIsMobile } from "@/hooks/use-mobile";
import { LazyEventRewardPanel } from "@/components/dashboard/LazyDashboardComponents";
import { NextByteModal } from "@/components/ui/nextbyte-modal";
import { SkrzynkaSpraw } from "@/components/dashboard/SkrzynkaSpraw";
import { KartaEventu } from "@/components/dashboard/KartaEventu";
import { WrocDoRoboty } from "@/components/dashboard/WrocDoRoboty";

import { PendingDashboardActionsCard } from "@/components/dashboard/PendingDashboardActionsCard";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { Gift } from "lucide-react";
import { QuickShortcutsPanel } from "@/components/dashboard/QuickShortcutsPanel";
import { KafelkiChmury } from "@/components/dashboard/KafelkiChmury";
import { SzybkiKreator } from "@/components/dashboard/SzybkiKreator";

import { motion } from "framer-motion";

import { FuturisticLoader } from "@/components/ui/futuristic-loader";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteAsset } from "@/hooks/useSiteAsset";
import { getAssetUrl } from "@/lib/assetUtils";
import { useAuthId } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { BytePaymentProcessingDialog } from "@/components/BytePaymentProcessingDialog";


import { useActiveEvents } from '@/hooks/useEventRewards';
import { useCurrentPlatformReleaseNotes } from '@/hooks/usePlatformReleaseNotes';
import { PlatformReleaseNotesDialog } from '@/components/dashboard/PlatformReleaseNotesDialog';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { PatternOverlay } from '@/components/ui/PatternOverlay';
import { TechGrid } from '@/components/ui/TechGrid';
import { ByteStatusBar } from '@/components/dashboard/ByteStatusBar';
import { ZaproszenieInstalacji } from '@/components/pwa/ZaproszenieInstalacji';
import { ZachetaPush } from '@/components/dashboard/ZachetaPush';
import { Tile, TileHeader, TileRow, TilePill, TileAction, TileFooter } from '@/components/ui/tile';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { useFinalLejka } from '@/hooks/useFinalLejka';
import { OknoOferty } from '@/components/onboarding/lejek/OknoOferty';
import { WelcomeWizard } from '@/components/onboarding/WelcomeWizard';
import { ProductTour } from '@/components/onboarding/tour/ProductTour';
import { SzkieletPulpitu } from '@/components/dashboard/SzkieletPulpitu';
import { KalendarzMiesiaca } from '@/components/dashboard/KalendarzMiesiaca';

class DashboardWidgetBoundary extends React.Component<
  { children: React.ReactNode; name: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[Dashboard] Widget failed: ${this.props.name}`, {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const DashboardContent = () => {
  const {
    userName,
    stats,
    plannerStats,
    messageCount,
    isLoading,
    isSyncing,
    syncStats,
    getPlatformStats,
    isSubscribed
  } = useOptimizedDashboard();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const userId = useAuthId();
  const { profile } = useUserProfile();
  const [selectedQuickStat, setSelectedQuickStat] = useState(0);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  /* Dwa ostatnie kroki lejka. Dla wszystkich poza świeżo zarejestrowanymi
     hak zwraca zamknięte okna i nic tu nie robi. */
  const finalLejka = useFinalLejka();

  const [eventsOpen, setEventsOpen] = useState(false);
  
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const { data: dashboardLogo } = useSiteAsset('dashboard_logo');

  
  const { data: activeEvents, isLoading: eventsLoading } = useActiveEvents();
  const { release: platformRelease, addedItems, plannedItems, media: releaseMedia } = useCurrentPlatformReleaseNotes();
  const platformVersion = platformRelease?.version || 'Beta 1.0.0';



  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const type = searchParams.get('type');
    const sessionId = searchParams.get('session_id');
    if (success === 'true' && type === 'currency') {
      const verifyCurrencyPurchase = async () => {
        try {
          if (sessionId) {
            await supabase.functions.invoke('verify-currency-purchase', {
              body: { sessionId }
            });
          }
          toast({
            title: "Zakup zakończony pomyślnie! 🎉",
            description: "Byte'y zostały dodane do Twojego portfela.",
            variant: "default"
          });
        } catch (error) {
          // NIE powtarzamy tu komunikatu sukcesu. Wcześniej `catch` mówił
          // słowo w słowo to samo co `try` — czyli gdy księgowanie Byte padło,
          // użytkownik i tak czytał „Byte'y zostały dodane do Twojego
          // portfela". Płatność faktycznie przeszła (Stripe ją przyjął), ale
          // środki mogły jeszcze nie trafić na konto, więc mówimy dokładnie
          // to i nic ponadto.
          console.error('Error verifying currency purchase:', error);
          toast({
            title: "Płatność przyjęta",
            description: "Trwa księgowanie Byte. Jeśli za chwilę nie zobaczysz ich na saldzie, odśwież stronę lub napisz do nas.",
            variant: "default"
          });
        }
      };
      verifyCurrencyPurchase();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true' && type === 'currency') {
      toast({
        title: "Płatność anulowana",
        description: "Proces płatności został przerwany. Możesz spróbować ponownie.",
        variant: "destructive"
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // NOTE: ?byte_purchase=success / failed is now handled by
    // <BytePaymentProcessingDialog/> (loader → success/fail UX).
    // It strips its own URL params, so we intentionally do nothing here.
  }, [searchParams, toast]);

  useEffect(() => {
    performance.mark('dashboard-render-start');
    return () => {
      performance.mark('dashboard-render-end');
      performance.measure('dashboard-render', 'dashboard-render-start', 'dashboard-render-end');
    };
  }, []);

  if (isLoading) {
    return (
      /* SZKIELET, nie kółko — patrz `SzkieletPulpitu`.
         Tu akurat WIEMY, co się załaduje, więc można pokazać kształt zamiast
         prosić o cierpliwość. Kółko zostaje tam, gdzie kształtu nie znamy:
         przy weryfikacji sesji i przy dociąganiu modułu trasy. */
      <SzkieletPulpitu />
    );
  }

  return (
    <>
      <BytePaymentProcessingDialog />
      <SEO
        title="Panel Główny - NextByte | Zarządzaj swoimi projektami"
        description="Dashboard NextByte - zarządzaj projektami AI, analizuj statystyki, współpracuj z zespołem i wykorzystuj sztuczną inteligencję do automatyzacji procesów biznesowych."
        keywords="dashboard, panel główny, zarządzanie projektami, AI, automatyzacja, statystyki"
        url="https://nextbyte.ai/panel-glowny"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "NextByte Dashboard",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "PLN" }
        }}
      />
      <div className="h-full min-h-full flex w-full overflow-x-hidden relative">
        {/* Wzór użytkownika ma pierwszeństwo. TechGrid sam się wycofa, gdy
            ktoś ustawił własny wzór albo tło — patrz TechGrid.tsx. */}
        <PatternOverlay location="dashboard" />
        <TechGrid location="dashboard" />

        {/* „Soft orbs" USUNIĘTE (11.08.2026, Michał: „pod paskiem bocznym na
            dole strasznie niebieski jest"). Dwa koła w GOŁYM `--primary`
            przybite do rogów okna — relikt sprzed systemowego tła. Platforma
            ma już oświetlenie sceny: `TloAplikacji` liczy plamy przez
            color-mix z domieszką `--foreground`, skalibrowane POMIAREM na
            dziewięciu motywach właśnie po to, by żaden akcent (jasny błękit,
            limonka…) nie zalewał ekranu. Te orbsy dublowały tamten system
            bez żadnej kalibracji — przy `primary 204 91% 70%` lewy dolny róg
            świecił czystym błękitem przez sidebar (zmierzone: rgb(109,192,248)
            na kole 384×384). Duplikat systemu się usuwa, nie przygasza. */}

        {/* `overflow-hidden` TYLKO w trybie jednego ekranu.
            Regresja zgłoszona przez Michała 04.08.2026: „nie da się na telefonie
            scrollować strony". Zmierzone przy 375×812 — ten `main` miał
            `overflow-y: hidden` przy treści 3898 px w oknie 763 px, czyli
            trzy czwarte panelu było nie do obejrzenia. Poza trybem jednego
            ekranu strona MUSI się przewijać, bo cała treść po prostu się
            nie mieści. */}
        <main className="relative w-full flex-1 overflow-y-auto ekran1:overflow-hidden">
          {/*
            ════════════════════════════════════════════════════════════════
             JEDEN EKRAN, ZERO SCROLLOWANIA STRONY — przebudowa 03.08.2026
            ════════════════════════════════════════════════════════════════
            Michał: „zależy mi, aby wszystko mieściło się na jednym ekranie
            kompa i nie trzeba było scrollować — to ma być centrum zarządzania".

            Dawniej panel był PIONOWĄ KOLUMNĄ kart: Byte, szukanie, skróty,
            onboarding, skrzynka, event, nowości. Na monitorze widać było mniej
            więcej dwie pierwsze pozycje, a reszta wymagała przewijania —
            czyli centrum zarządzania, w którym trzeba szukać.

            Teraz: dwa PASY STAŁE (góra i dół) i między nimi siatka, która
            zabiera całą resztę wysokości. Kolumny przewijają się WEWNĄTRZ
            SIEBIE, a strona nie przewija się wcale.

            Trzy rzeczy, bez których to nie działa i o które łatwo się potknąć:
              • `h-full min-h-0` na każdym poziomie — bez `min-h-0` element
                siatki nie potrafi być NIŻSZY od swojej treści i wypycha układ,
              • `overflow-hidden` na kontenerze zamiast `overflow-y-auto`,
              • `shrink-0` na pasach, żeby to one trzymały wysokość, a nie
                oddawały ją treści środka.

            Szerokość podniesiona z 1100 px do 1600 px: trzy kolumny w 1100 px
            to kolumny po 340 px, w których lista spraw łamie się po dwóch
            słowach. Centrum zarządzania potrzebuje szerokości.
          */}
          {/* `h-full` TYLKO w trybie jednego ekranu — to była druga połowa
              blokady przewijania na telefonie. Przy sztywnej wysokości 763 px
              treść (3898 px) wylewała się poza box tego diva z `overflow: visible`:
              było ją WIDAĆ, ale rodzic nie miał czego przewijać, bo jego dziecko
              deklarowało dokładnie tyle, ile widać. */}
          <div className="flex flex-col ekran1:h-full ekran1:overflow-hidden">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 md:px-6 md:py-5 ekran1:h-full ekran1:overflow-hidden">
              {/* ZACHĘTA DO POWIADOMIEŃ — Michał: „dosłownie pod paskiem górnym".
                  Stoi PIERWSZA, przed saldem, i to jest celowe: na 134 konta
                  aktywną subskrypcję push miało JEDNO, bo przełącznik siedział
                  wyłącznie w Ustawieniach → Powiadomienia. Rzecz, o której nikt
                  nie wie, nie potrzebuje lepszego miejsca w ustawieniach —
                  potrzebuje być zauważona.
                  Sam znika: na komputerze, gdy subskrypcja już jest, i na
                  dwa tygodnie po odmowie. */}
              <ZachetaPush />


              {/* ─── Pasek stanu Byte ───
                  Wchodzi na miejsce dawnego hero (duży awatar + „Witaj" + odznaka
                  wersji). Powitanie i wersja siedzą teraz w jego lewej krawędzi,
                  więc znika cały osobny rząd, a górę ekranu przejmuje informacja,
                  której dotąd na panelu w ogóle nie było: ile masz Byte i na ile
                  Ci starczy. */}
              <motion.div
                className="shrink-0"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <ByteStatusBar
                  userId={userId}
                  userName={userName}
                  avatarUrl={profile?.profile_image_url}
                  platformVersion={platformVersion}
                  onPokazWersje={() => setReleaseDialogOpen(true)}
                />
              </motion.div>

              {/* ZAPROSZENIE DO INSTALACJI — tylko telefon, tylko gdy jest co
                  proponować, i tylko raz na 30 dni po odmowie. Miejsce nie jest
                  przypadkowe: pod saldem, czyli po tym, jak człowiek zobaczył
                  swoje dane, a przed listą rzeczy do zrobienia. Sam znika, gdy
                  aplikacja jest już zainstalowana. */}
              <div className="mb-3 empty:hidden">
                <ZaproszenieInstalacji />
              </div>

              {/* ─── Szukanie ZDJĘTE Z PULPITU — 02.09.2026, Michał ───
                  Stały tu DWA spotlighty naraz: ten i drugi w pasku bocznym
                  (`AppSidebar` montuje własny `NextByteSpotlightInline`).
                  Każdy z nich wiesza własny nasłuch ⌘K, więc skrót trafiał
                  do dwóch pól i o fokus wygrywało to, które zamontowało się
                  ostatnie. Pulpit oddaje szukanie paskowi — jedno pole,
                  jeden nasłuch, o 20 px na lewo. Krok wycieczki celuje teraz
                  w przycisk w pasku. */}

              {/* ─── Wymaga uwagi ───
                  Przed skrótami, nie po nich. Jeśli coś blokuje pracę, nie ma sensu
                  wcześniej proponować rozpoczęcia nowej. */}
              <div className="shrink-0 empty:hidden">
                <DashboardWidgetBoundary name="pending-actions">
                  <PendingDashboardActionsCard />
                </DashboardWidgetBoundary>
              </div>

              {/* ═══ SIATKA GŁÓWNA — zabiera całą wysokość między pasami ═══
                  `flex-1 min-h-0` na siatce i `min-h-0 overflow-y-auto` na
                  każdej kolumnie. Bez `min-h-0` element flexa nie zejdzie
                  poniżej wysokości swojej treści i cała konstrukcja wypchnie
                  stronę w scroll — czyli dokładnie to, co likwidujemy. */}

              {/* ══════════════════════════════════════════════════════════
                   KOLUMNY ZAMIENIONE STRONAMI — 02.09.2026, makieta Michała

                   Od 26.08 kreator stał po PRAWEJ (szeroko), skrzynka po
                   lewej (wąsko). Michał ułożył na makiecie odwrotnie: kreator
                   po LEWEJ, a po prawej skrzynka i kalendarz miesięczny.

                   Szerokości ZOSTAJĄ — dwie trzecie dla kreatora i listy
                   ostatnich rzeczy, jedna trzecia dla tego, co bywa puste.
                   Zmienia się strona. Powód jest prosty: oko ląduje najpierw
                   po lewej, a kreator to jedyny element panelu, który coś
                   ROBI. Reszta pokazuje stan.

                   Nowy podział:
                     LEWA  (2/3)  = robota:   zacznij → wróć → skocz
                     PRAWA (1/3)  = kontekst: co czeka → kiedy → co nowego

                   „Szybka podróż" idzie za kreatorem na lewą — to ten sam
                   gest (zaczynam) w drugim trybie. Kalendarz jest nowy;
                   Michał wybrał pełny miesiąc zamiast paska tygodnia.
                   ══════════════════════════════════════════════════════════ */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 ekran1:min-h-0 ekran1:flex-1">

                {/* ── LEWA (2/3): stąd zaczynam robotę ── */}
                {/* `overflow-y-auto`, NIE `hidden` — wniosek z 24.08: przy oknie
                    1440×900 nadmiar wynosił dokładnie wysokość „Szybkiej
                    podróży", a kafelki były w DOM, lecz ucięte bez suwaka.
                    Tryb jednego ekranu dotyczy STRONY, nie zakazuje przewijania
                    wewnątrz kolumny. */}
                <div className="flex flex-col gap-4 ekran1:min-h-0 ekran1:overflow-y-auto lg:col-span-2">
                  {/* Najcenniejsze miejsce na ekranie dostaje KREATOR, bo to
                      jedyny element panelu, który coś TWORZY. */}
                  <div className="shrink-0">
                    <DashboardWidgetBoundary name="szybki-kreator">
                      <SzybkiKreator />
                    </DashboardWidgetBoundary>
                  </div>

                  {/* Lista ostatnich rzeczy — zawsze ma czym wypełnić kolumnę,
                      więc dostaje szeroką stronę razem z kreatorem (26.08).
                      `min-h-[15rem]`, nie samo `flex-1`: sąsiedzi są `shrink-0`
                      i zabieraliby całą wysokość, a lista zapadała się do
                      samego nagłówka. Minimum gwarantuje cztery pozycje. */}
                  {/* RÓWNE DNO KOLUMN (08.09.2026, Michał: „zależy mi na jak
                      najbardziej symetrycznym i równym ułożeniu"). `flex-1` z
                      podstawą 0 sprawia, że kolumna NIE liczy swojej wysokości
                      z długości listy (tylko z minimum 15 rem) — o wysokości
                      rzędu decyduje prawa kolumna, a lista wypełnia resztę
                      i przewija się w środku. `basis-0` (0px), nie samo
                      `flex-1` (0%): procent od nieokreślonej wysokości kolumny
                      liczy się jak „auto", więc lista dalej dyktowała rząd
                      (zmierzone 08.09: 432 px zamiast 324). Przed: lewa 858 px,
                      prawa 765 px; po: obie równe. */}
                  <div className="flex min-h-[15rem] flex-1 basis-0 flex-col ekran1:min-h-[15rem]">
                    <DashboardWidgetBoundary name="wroc-do-roboty">
                      <WrocDoRoboty />
                    </DashboardWidgetBoundary>
                  </div>
                </div>

                {/* ── PRAWA (1/3): co czeka i kiedy ── */}
                <div className="flex flex-col ekran1:min-h-0 ekran1:overflow-y-auto">
                  {/* `shrink-0` — WYSOKOŚĆ Z TREŚCI, bez rozciągania. W wąskiej
                      kolumnie normalnym stanem skrzynki bywa pustka; z `flex-1`
                      karta „Nic nie czeka" rozciągała się na 850 px — całą
                      wysokość ekranu na jedno zdanie. Terminy stoją NAD
                      kalendarzem, bo termin, który minął, nie może być schowany
                      pod siatką dni. */}
                  <div className="shrink-0">
                    <DashboardWidgetBoundary name="skrzynka-spraw">
                      <SkrzynkaSpraw />
                    </DashboardWidgetBoundary>
                  </div>

                  {/* Kalendarz miesiąca — nowy 02.09. Sam kalendarz, bez listy
                      wydarzeń pod spodem: listę robi skrzynka tuż wyżej. */}
                  {/*
                    `flex-1`: gdy prawa kolumna jest NIŻSZA od lewej, kalendarz
                    dostaje resztę wysokości i dno obu kolumn zostaje w jednej linii.

                    `min-h-0` USUNIĘTE 22.09.2026. Michał: „popraw w panelu
                    głównym kalendarz bo ucina". Ta klasa pozwalała skurczyć się
                    PONIŻEJ własnej treści, więc przy prawej kolumnie wyższej od
                    lewej ostatni tydzień miesiąca był ścinany w połowie.

                    Bez niej zostaje domyślne `min-height: auto`: kalendarz nadal
                    ROŚNIE, gdy jest miejsce, ale nie kurczy się poniżej siatki
                    dni. Równe dno kolumn było ozdobą, ucięty tydzień jest usterką
                    — przy sprzeczności wygrywa siatka.
                  */}
                  <div className="mt-4 flex flex-1 flex-col">
                    <DashboardWidgetBoundary name="kalendarz-miesiaca">
                      <KalendarzMiesiaca />
                    </DashboardWidgetBoundary>
                  </div>

                  {/* Event w kafelku, nie w kolumnie środkowej (03.08): jest
                      JEDNORAZOWY, po odebraniu nagrody trzymałby trzecią ekranu
                      na zawsze. Gamifikacja może stać obok pracy, nie zamiast. */}
                  {!eventsLoading && activeEvents && activeEvents.length > 0 && (
                    <div className="mt-4 shrink-0">
                      <KartaEventu
                        zwarty
                        eventId={(activeEvents[0] as any).id}
                        nazwa={(activeEvents[0] as any).display_name || (activeEvents[0] as any).name}
                        onOtworz={() => setEventsOpen((v) => !v)}
                      />
                    </div>
                  )}

                  {/* Kafelek „Nowości” USUNIĘTY (07.09.2026, Michał: „nie jest
                      nam już potrzebny"). */}

                  {/* Onboarding na końcu, bo sam znika po ukończeniu — własna
                      kolumna stałaby wtedy pusta na zawsze.
                      `data-tour` — TO NIE TO SAMO CO `name` NA GRANICY BŁĘDU:
                      krok 6 wycieczki celuje w `[data-tour="onboarding-checklist"]`,
                      a granica niesie tę nazwę w propsie, którego wycieczka nie
                      widzi. Bez tego atrybutu krok nigdy nie znajdował celu. */}
                  <div className="mt-4 shrink-0 empty:hidden" data-tour="onboarding-checklist">
                    <DashboardWidgetBoundary name="onboarding-checklist">
                      <OnboardingChecklist />
                    </DashboardWidgetBoundary>
                  </div>
                </div>
              </div>

              {/* ── DOLNY PAS: CHMURY PO LEWEJ, SZYBKIE AKCJE PO PRAWEJ ──────────
                  10.09.2026, Michał: „w panelu głównym po prawej daj 6 ikon
                  szybkich akcji, a po lewej system i privatecloud 2 kafelki".

                  Do 08.09 stało tu sześć kafelków skrótów na całą szerokość.
                  Wszystkie prowadziły do modułów, które są w pasku bocznym —
                  czyli dolny pas panelu powtarzał nawigację i nic poza tym nie
                  mówił. Teraz dwie trzecie zajmują chmury, bo one niosą STAN
                  (ile miejsca zostało), a skróty schodzą do jednej trzeciej
                  w postaci samych ikon — tego, co w tej szerokości jest czytelne.

                  Podział 2/1 jest ten sam, co w siatce nad nim, więc krawędzie
                  kolumn stoją w jednej linii przez całą stronę. */}
              <motion.section
                className="grid shrink-0 grid-cols-1 gap-4 lg:grid-cols-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                data-tour="quick-start-cards"
              >
                <div className="lg:col-span-2">
                  <DashboardWidgetBoundary name="kafelki-chmury">
                    <KafelkiChmury />
                  </DashboardWidgetBoundary>
                </div>
                <QuickShortcutsPanel wariant="ikony" />
              </motion.section>

            </div>
          </div>
        </main>
      </div>

      {/* ── NAGRODY W OKNIE, NIE W KOLUMNIE ──────────────────────────────
          Panel rozwijał się pod „Wróć do roboty" w środkowej kolumnie, a ta ma
          stałą wysokość (cały panel mieści się na jednym ekranie, bez
          przewijania). Zmierzone 04.08.2026: po kliknięciu „Zobacz nagrodę"
          panel wypychał z widoku CAŁĄ listę rzeczy użytkownika, a i tak nie
          mieścił czwartej nagrody. Centrum zarządzania nie może tracić pracy
          na rzecz gamifikacji — więc nagrody dostają własne okno i tyle
          miejsca, ile potrzebują. */}
      {/* ── FINAŁ LEJKA ────────────────────────────────────────────────
          „Zaczynam od" i oferta. Oba okna same decydują, czy się pokazać —
          bramka oferty jest FAIL-CLOSED, patrz `wolnoPokazacOferte`. */}
      {/* Ekran „Zaczynam od" wypadł z lejka 31.08 — po pokazie w czacie idzie
          od razu oferta. Komponent został w repo, ale nikt go nie renderuje. */}
      <OknoOferty
        open={finalLejka.ofertaOtwarta}
        startowy={finalLejka.ekranOferty}
        onZamknij={finalLejka.zamknijOferte}
      />

      <NextByteModal
        open={eventsOpen}
        onOpenChange={setEventsOpen}
        title="Wydarzenia i nagrody"
        description="Co jest do zrobienia i co za to dostajesz."
        icon={<Gift className="h-5 w-5 text-foreground" />}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {!eventsLoading && activeEvents?.map(event => (
            <DashboardWidgetBoundary key={event.id} name={`event-reward-${event.id}`}>
              <LazyEventRewardPanel eventId={event.id} />
            </DashboardWidgetBoundary>
          ))}
        </div>
      </NextByteModal>

      <PlatformReleaseNotesDialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen} release={platformRelease} addedItems={addedItems} plannedItems={plannedItems} media={releaseMedia} />

    </>
  );
};

const Dashboard = () => {
  return (
    <OnboardingProvider>
      <DashboardContent />
      <DashboardOnboarding />
    </OnboardingProvider>
  );
};

const DashboardOnboarding = () => {
  const {
    showWelcome,
    showTour,
    requiresPasswordSetup,
    dismissWelcome,
    startTour,
    completeTour,
    skipTour,
    resetOnboarding,
    tourControls,
    markPasswordSetupComplete,
  } = useOnboarding();
  const { userName } = useOptimizedDashboard();

  // Listen for restart onboarding from settings
  const location = useLocation();
  const restartOdpalony = React.useRef(false);
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('restartOnboarding') !== 'true') return;

    /*
      STRAŻNIK JEDNORAZOWOŚCI — bez niego samouczek cofał się na krok 1.

      Zgłoszenie Michała 31.08: „klikam dalej i się glitchuje, przechodzi do
      kroku 2 i cofa, i tak kilka razy". Złożyły się dwie rzeczy:

        • `window.history.replaceState` zmienia adres, ale React Router tego
          NIE WIDZI — `location.search` z `useLocation()` dalej zawiera
          `?restartOnboarding=true`, więc warunek pozostaje prawdziwy;
        • `resetOnboarding` zmieniał tożsamość przy każdym kroku toura (był
          domknięty na `tourControls`), więc efekt przeliczał się po każdym
          „Dalej" — i za każdym razem wołał reset, który restartował tour.

      Tożsamość funkcji naprawiona po stronie kontekstu, ale ref zostaje:
      restart onboardingu to czynność jednorazowa i nie ma powodu, żeby
      zależała od tego, jak stabilne są akurat czyjeś `useCallback`.
    */
    if (restartOdpalony.current) return;
    restartOdpalony.current = true;

    window.history.replaceState({}, '', window.location.pathname);
    // Krótka zwłoka, żeby okno ustawień zdążyło się zamknąć.
    const timer = setTimeout(() => resetOnboarding(), 300);
    return () => clearTimeout(timer);
  }, [location.search, resetOnboarding]);

  return (
    <>
      {/* Wizard pokazujemy dopiero gdy globalny mandatory gate się zamknie */}
      <WelcomeWizard
        open={showWelcome && !requiresPasswordSetup}
        onClose={dismissWelcome}
        onStartTour={startTour}
        userName={userName}
        requiresPasswordSetup={false}
        onPasswordSetupComplete={markPasswordSetupComplete}
      />
      <ProductTour
        isActive={showTour}
        /* Samouczek panelu ZAWSZE kończy się w Chat AI — przycisk ma to
           zapowiadać, zamiast mówić „Zakończ" i przenosić bez uprzedzenia. */
        etykietaOstatniego="Przejdź do Chat AI"
        onComplete={completeTour}
        onSkip={skipTour}
        tourControls={tourControls}
      />
    </>
  );
};

export default Dashboard;
