import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';
import { useTour } from '@/components/onboarding/tour/useTour';
import { ustawKrokLejka, zapiszEventLejka } from '@/lib/lejek';

interface OnboardingState {
  hasSeenWelcome: boolean;
  hasSeenTour: boolean;
  tourStepReached: number;
}

interface OnboardingContextType {
  state: OnboardingState;
  isLoading: boolean;
  showWelcome: boolean;
  showTour: boolean;
  /** True jeśli użytkownik to "pure Google user" bez ustawionego hasła — wymagany blokujący krok. */
  requiresPasswordSetup: boolean;
  tourControls: ReturnType<typeof useTour>;
  dismissWelcome: () => void;
  startTour: () => void;
  completeTour: () => void;
  /** Pominięcie toura — mierzone osobno od ukończenia; w lejku nie wyciąga do chatu. */
  skipTour: () => void;
  resetOnboarding: () => void;
  /** Wywoływane po pomyślnym ustawieniu imienia/nazwiska/hasła w wymaganym kroku. */
  markPasswordSetupComplete: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};

// Optional hook that doesn't throw
export const useOptionalOnboarding = () => {
  return useContext(OnboardingContext);
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userId = useAuthId();
  const [state, setState] = useState<OnboardingState>({
    hasSeenWelcome: true, // Default to true to prevent flash
    hasSeenTour: true,
    tourStepReached: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [requiresPasswordSetup, setRequiresPasswordSetup] = useState(false);
  // Krok lejka onboardingowego (/start): 'samouczek' oznacza, że tour ma
  // ruszyć sam po wejściu na panel, a jego finał prowadzi do Chat AI.
  const [funnelStep, setFunnelStep] = useState<string | null>(null);
  const autoStartOdpalony = useRef(false);
  const navigate = useNavigate();
  const tourControls = useTour();

  // Fetch state from DB + check Google password requirement
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchState = async () => {
      // 1) Sprawdź czy użytkownik to "pure Google user" bez hasła
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('password_set')
            .eq('id', user.id)
            .maybeSingle();

          const hasGoogleIdentity = user.identities?.some(i => i.provider === 'google');
          const hasEmailIdentity = user.identities?.some(i => i.provider === 'email');
          const isPureGoogleUser = !!hasGoogleIdentity && !hasEmailIdentity;
          // NULL password_set (stare konta) = hasło nieustawione
          const needsSetup = isPureGoogleUser && !profile?.password_set;

          setRequiresPasswordSetup(needsSetup);
        }
      } catch (err) {
        console.error('Error checking password setup requirement:', err);
      }

      // 2) Pobierz stan onboardingu
      const { data, error } = await supabase
        .from('user_onboarding_state')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching onboarding state:', error);
        setIsLoading(false);
        return;
      }

      /*
        LEJEK DLA KAŻDEJ ŚWIEŻEJ REJESTRACJI (decyzja Michała 18.08.2026).

        Rejestracja przez /login albo Google omijała /start, więc nowy użytkownik
        dostawał STARY wizard „Krok 1 z 4" zamiast ankiet i samouczka lejka.
        Teraz każde konto bez rozpoczętego lejka i bez obejrzanego powitania
        jedzie na /start (ankiety → samouczek → reżyseria w chacie).

        Stary WelcomeWizard zostaje wyłącznie jako blokujący krok ustawienia
        hasła dla kont Google — wymusza go osobny efekt requiresPasswordSetup,
        który działa niezależnie od tego przekierowania (gate złapie użytkownika
        po powrocie z ankiet, zanim ruszy samouczek).
      */
      if (!data) {
        const { error: insertError } = await supabase
          .from('user_onboarding_state')
          .insert({ user_id: userId });

        if (!insertError) {
          setState({ hasSeenWelcome: false, hasSeenTour: false, tourStepReached: 0 });
          setIsLoading(false);
          navigate('/start', { replace: true });
          return;
        }
      } else {
        setState({
          hasSeenWelcome: data.has_seen_welcome,
          hasSeenTour: data.has_seen_tour,
          tourStepReached: data.tour_step_reached,
        });
        setFunnelStep(data.funnel_step ?? null);
        /*
          ════════════════════════════════════════════════════════════════
           KTO WRACA DO LEJKA — DWA PRZYPADKI, NIE JEDEN
          ════════════════════════════════════════════════════════════════

          Pierwszy: konto sprzed lejka, bez kroku i bez powitania. Dostaje
          ankiety zamiast starego wizarda („wdrażamy ogólnie").

          Drugi, DOŁOŻONY 31.08 po audycie: konto, które PORZUCIŁO ankiety.
          Zmierzone na produkcji — 22 konta mają `has_seen_welcome = false`
          i krok 'ankieta-narzedzia'. Wpadały między dwie bramki: nie szły
          na /start, bo krok był ustawiony, i nie dostawały wizarda, bo lejek
          liczył się jako „w toku". Efekt: goły panel bez żadnego wprowadzenia,
          podczas gdy przed tą gałęzią widziały wizard.

          Wizard nie jest tu odpowiedzią — dublowałby ankiety, które te osoby
          właśnie porzuciły. Odpowiedzią jest ich dokończenie. `/start` umie
          podjąć krok 'ankieta-*' (StartOnboarding sprawdza `startsWith`),
          więc nie ma pętli: wraca dokładnie tam, gdzie człowiek przerwał.
        */
        const porzuconeAnkiety = !!data.funnel_step && data.funnel_step.startsWith('ankieta');
        if (!data.has_seen_welcome && (!data.funnel_step || porzuconeAnkiety)) {
          setIsLoading(false);
          navigate('/start', { replace: true });
          return;
        }
        /*
          STARY WIZARD I LEJEK NIE MOGĄ STAĆ NA EKRANIE JEDNOCZEŚNIE.

          Warunek wykluczał tylko krok 'samouczek'. Tymczasem człowiek z
          `has_seen_welcome = false` stojący na 'chat', 'zaczynam-od' czy
          'oferta' dostawał wizard powitalny NA WIERZCHU lejka — zgłoszenie
          Michała 31.08: „pokazuje mi popup i samouczek jednocześnie", dwa
          okna z własnymi „Dalej", jedno nad drugim.

          Lejek zastępuje wizard w całości: ma własne powitanie, własne ankiety
          i własny samouczek. Wykluczamy więc KAŻDY krok lejka w toku, a nie
          jeden wybrany.
        */
        const lejekWToku = !!data.funnel_step && data.funnel_step !== 'zakonczony';
        if (!data.has_seen_welcome && !lejekWToku) {
          setShowWelcome(true);
        }
      }
      setIsLoading(false);
    };

    fetchState();
  }, [userId]);

  // Jeśli wymagany jest password setup — wymuś otwarcie wizard niezależnie od has_seen_welcome
  useEffect(() => {
    if (requiresPasswordSetup) {
      setShowWelcome(true);
    }
  }, [requiresPasswordSetup]);

  const updateDB = useCallback(async (updates: Partial<{ has_seen_welcome: boolean; has_seen_tour: boolean; tour_step_reached: number }>) => {
    if (!userId) return;
    await supabase
      .from('user_onboarding_state')
      .update(updates)
      .eq('user_id', userId);
  }, [userId]);

  const dismissWelcome = useCallback(() => {
    // Blokada — nie pozwól zamknąć dopóki użytkownik nie ustawi hasła
    if (requiresPasswordSetup) return;
    setShowWelcome(false);
    setState(s => ({ ...s, hasSeenWelcome: true }));
    updateDB({ has_seen_welcome: true });
  }, [updateDB, requiresPasswordSetup]);

  const startTour = useCallback(() => {
    setShowTour(true);
    tourControls.start();
  }, [tourControls]);

  /*
    Samouczek lejka startuje SAM, gdy user przychodzi z ankiet /start
    (funnel_step='samouczek'). Zwłoka daje panelowi czas na wyrenderowanie
    celów spotlightu (sidebar, wyszukiwarka) — bez niej pierwszy krok mierzy
    prostokąt zanim layout stanie i podświetla pustkę.
  */
  /*
    `startTour` PRZEZ REF, nie przez zależność — inaczej efekt zjada własny timer.

    `startTour` jest domknięty na `tourControls`, a te zmieniają tożsamość przy
    każdym kroku toura. Gdyby stał w tablicy zależności, każda taka zmiana
    w ciągu tych 800 ms uruchamiałaby sprzątanie (`clearTimeout`), a ponowny
    przebieg wychodziłby od razu na `autoStartOdpalony.current === true` —
    czyli kasowałby timer i już go nie odtwarzał. Tour po prostu by nie ruszył,
    zależnie od tego, co akurat przerysowało panel w tym oknie czasu.
  */
  const startTourRef = useRef(startTour);
  useEffect(() => { startTourRef.current = startTour; }, [startTour]);

  useEffect(() => {
    if (isLoading || requiresPasswordSetup || autoStartOdpalony.current) return;
    if (funnelStep !== 'samouczek') return;
    autoStartOdpalony.current = true;
    const timer = window.setTimeout(() => {
      startTourRef.current();
      if (userId) zapiszEventLejka(userId, 'samouczek', 'start');
    }, 800);
    return () => window.clearTimeout(timer);
  }, [isLoading, requiresPasswordSetup, funnelStep, userId]);

  /*
    Naprawa martwego pomiaru: `tour_step_reached` istniało od początku, ale nic
    go nie zapisywało — u WSZYSTKICH kont stało zero i nie dało się zobaczyć,
    na którym kroku ludzie porzucają tour. Zapis przy każdym kroku, na miękko.
  */
  useEffect(() => {
    if (!showTour || !userId) return;
    updateDB({ tour_step_reached: tourControls.currentStep + 1 });
  }, [showTour, tourControls.currentStep, userId, updateDB]);

  /**
   * CZEKAMY NA ZAPIS, zanim ktokolwiek pójdzie dalej — `await`, nie `void`.
   *
   * Zgłoszenie Michała 31.08: „po przejściu nie odpala chat ai onboardingu
   * kolejnych kroków". Reżyseria czatu wczytuje stan RAZ, przy montowaniu,
   * i aktywuje się tylko dla `funnel_step = 'chat'`. Zapis szedł przez `void`,
   * więc nawigacja startowała natychmiast, hub czatu montował się pierwszy
   * i odczytywał krok SPRZED zmiany — czyli 'samouczek'. Wyścig, który przy
   * szybkim łączu wygrywał raz tak, raz inaczej.
   */
  const zakonczSamouczekLejka = useCallback(async (pominieto: boolean) => {
    if (!userId || funnelStep !== 'samouczek') return false;
    await ustawKrokLejka(userId, { funnel_step: 'chat' });
    zapiszEventLejka(userId, 'samouczek', pominieto ? 'skip' : 'complete', {
      krok_toura: tourControls.currentStep + 1,
      kroki_lacznie: tourControls.totalSteps,
    });
    setFunnelStep('chat');
    return true;
  }, [userId, funnelStep, tourControls.currentStep, tourControls.totalSteps]);

  const completeTour = useCallback(async () => {
    setShowTour(false);
    tourControls.skip();
    setState(s => ({ ...s, hasSeenTour: true }));
    updateDB({ has_seen_tour: true });
    /*
      PRZEJŚCIE DO CZATU JEST BEZWARUNKOWE — i to jest zmiana z 31.08.

      Wcześniej nawigacja wisiała na `zakonczSamouczekLejka`, które zwraca
      fałsz dla każdego, kto nie stoi akurat na kroku 'samouczek'. Skutek
      zgłoszony przez Michała: „kliknąłem zakończ i nie przenosi do chat ai" —
      bo tour odpalony z Ustawień poza lejkiem kończył się w miejscu, mimo że
      jego ostatni krok mówi wprost o Chat AI.

      Krok lejka przesuwamy nadal tylko wtedy, gdy człowiek w lejku JEST;
      przejście należy się każdemu, kto obejrzał samouczek do końca.
    */
    await zakonczSamouczekLejka(false);
    navigate('/chat-ai');
  }, [tourControls, updateDB, zakonczSamouczekLejka, navigate]);

  const skipTour = useCallback(async () => {
    setShowTour(false);
    tourControls.skip();
    setState(s => ({ ...s, hasSeenTour: true }));
    updateDB({ has_seen_tour: true });
    // Pominięcie nie wyciąga siłą do chatu — user zostaje na panelu, ale krok
    // lejka idzie dalej, żeby reżyseria czekała na niego, gdy sam wejdzie.
    await zakonczSamouczekLejka(true);
  }, [tourControls, updateDB, zakonczSamouczekLejka]);

  /**
   * „Uruchom samouczek ponownie" z Ustawień → Konto.
   *
   * ═══════════════════════════════════════════════════════════════════════
   *  TO JEST PEŁNA PREZENTACJA, NIE SAM TOUR
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Michał 31.08: „kliknąłem przejdź do chat ai i jestem, ale to nie
   * onboarding — a włączam to samouczkiem w ustawieniach; tak powinno być".
   *
   * Wcześniej ten przycisk rozgałęział się na dwa zachowania: wewnątrz lejka
   * wracał na krok 'samouczek', a poza nim odpalał goły tour. Skutek: tour
   * kończył się przejściem do Chat AI (obiecuje to ostatni krok), ale hub
   * czatu nie miał czego podjąć — reżyseria włącza się wyłącznie dla
   * `funnel_step = 'chat'`. Człowiek lądował w pustym czacie.
   *
   * Rozgałęzienia nie ma. Przycisk zawsze ustawia krok 'samouczek', więc
   * po zakończeniu toura lejek przekazuje dalej i prezentacja idzie w całości:
   * panel → Chat AI z prowadzeniem → „Zaczynam od" → oferta.
   *
   * OFERTA JEST BEZPIECZNA — chroni ją `wolnoPokazacOferte`, które patrzy
   * na `oferta_wynik`, a nie na krok. Kto już kupił albo odmówił ostatecznie,
   * nie zobaczy jej ponownie, choćby prezentację odpalał codziennie.
   *
   * `has_seen_welcome` idzie na PRAWDĘ, a wizard gasimy jawnie: mógł już stać
   * na ekranie (otwiera go odczyt stanu przy wejściu na panel), a dwa
   * onboardingi naraz to było osobne zgłoszenie z tego samego dnia.
   */
  const resetOnboarding = useCallback(async () => {
    setFunnelStep('samouczek');
    if (userId) await ustawKrokLejka(userId, { funnel_step: 'samouczek' });

    setShowWelcome(false);
    setState(s => ({ ...s, hasSeenWelcome: true, hasSeenTour: false, tourStepReached: 0 }));
    await updateDB({ has_seen_welcome: true, has_seen_tour: false, tour_step_reached: 0 });

    /* Blokada auto-startu ZOSTAJE ZAMKNIĘTA, choć wygląda to odwrotnie do
       intencji. Ustawienie kroku na 'samouczek' budzi efekt auto-startu, a ten
       po 800 ms zawołałby `startTour()` drugi raz — czyli przestawiłby tour
       z powrotem na krok 1 w chwili, gdy człowiek jest już dalej. Uruchamiamy
       ręcznie i od razu; auto-start ma się nie wtrącać. */
    autoStartOdpalony.current = true;
    startTourRef.current();
  }, [updateDB, userId]);

  const markPasswordSetupComplete = useCallback(() => {
    setRequiresPasswordSetup(false);
  }, []);

  return (
    <OnboardingContext.Provider value={{
      state,
      isLoading,
      showWelcome,
      showTour,
      requiresPasswordSetup,
      tourControls,
      dismissWelcome,
      startTour,
      completeTour,
      skipTour,
      resetOnboarding,
      markPasswordSetupComplete,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};
