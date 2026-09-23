import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { bytePurchaseEmitter } from '@/lib/bytePurchaseEmitter';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { SettingsDialog } from '@/components/SettingsDialog';
import { CookieConsentPopup } from '@/components/cookies/CookieConsentPopup';
import { BytePurchaseDialog } from '@/components/BytePurchaseDialog';
import { ByteReceivedCelebration, ByteReceivedSource } from '@/components/animations/ByteReceivedCelebration';
import { PrezentBytePopup } from '@/components/prezenty/PrezentBytePopup';
import { useWallet } from '@/hooks/useWallet';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

interface GlobalDialogsContextType {
  // Settings
  settingsOpen: boolean;
  openSettings: (tab?: string) => void;
  closeSettings: () => void;
  setSettingsOpen: (open: boolean) => void;
  settingsInitialTab?: string;
  
  // Cookie consent
  cookieConsentOpen: boolean;
  openCookieConsent: () => void;
  closeCookieConsent: () => void;
  setCookieConsentOpen: (open: boolean) => void;

  // Byte purchase (global)
  bytePurchaseOpen: boolean;
  openBytePurchase: (opts?: { requiredBytes?: number; itemName?: string }) => void;
  closeBytePurchase: () => void;

  // Byte received celebration
  byteReceivedOpen: boolean;
  showByteReceived: (amount: number, source: ByteReceivedSource, newBalance?: number) => void;
  closeByteReceived: () => void;
}

const GlobalDialogsContext = createContext<GlobalDialogsContextType | null>(null);

export function GlobalDialogsProvider({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<string | undefined>(undefined);
  const [cookieConsentOpen, setCookieConsentOpen] = useState(false);

  // Global Byte purchase dialog state
  const [bytePurchaseOpen, setBytePurchaseOpen] = useState(false);
  const [byteRequired, setByteRequired] = useState(0);
  const [byteItemName, setByteItemName] = useState<string | undefined>(undefined);
  const { balance } = useWallet();
  const { isSubscribed, isLoading: subLoading } = useSubscriptionContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Byte received celebration state
  const [byteReceivedOpen, setByteReceivedOpen] = useState(false);
  const [byteReceivedAmount, setByteReceivedAmount] = useState(0);
  const [byteReceivedSource, setByteReceivedSource] = useState<ByteReceivedSource>('purchase');
  const [byteReceivedNewBalance, setByteReceivedNewBalance] = useState<number | undefined>(undefined);

  // Listen for global byte purchase events (from hooks outside context)
  useEffect(() => {
    return bytePurchaseEmitter.subscribe((payload) => {
      setByteRequired(payload.requiredBytes ?? 0);
      setByteItemName(payload.itemName);
      setBytePurchaseOpen(true);
    });
  }, []);

  /*
    ══════════════════════════════════════════════════════════════════════
     `?settings=` ODSYŁA DO HUBA, NIE OTWIERA DRUGIEGO OKNA (06.08.2026)
    ══════════════════════════════════════════════════════════════════════

    Michał: „czemu w Personalnym Asystencie jak klikam ustawienia to mi
    otwiera popup?".

    Bo to były BOCZNE DRZWI do drugiej kopii Ustawień. Parametr `?settings=`
    otwierał `SettingsDialog` — stare okno z ośmioma zakładkami (Ogólne,
    Asystent, Aplikacje, Hasło, Bezpieczeństwo, Regulaminy, Wygląd), którego
    przebudowa na pięć zakładek w ogóle nie objęła. Użytkownik z Asystenta
    trafiał więc na poprzednią wersję: inny podział, brak zgody na maile,
    Przycisk Paniki dalej w „Ogólnych".

    Teraz parametr przekierowuje na `/ustawienia` z zakładką przetłumaczoną
    na nowy podział. Jedno miejsce, jedna wersja.

    STARE NAZWY MAPUJEMY, bo `?settings=assistant` może siedzieć w czyimś
    linku albo w powiadomieniu wysłanym wcześniej.
  */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const settingsParam = params.get('settings');
    if (!settingsParam) return;

    const NA_NOWE: Record<string, string> = {
      general: 'account',
      password: 'account',
      applications: 'account',
      legal: 'account',
      assistant: 'ai',
      'local-ai': 'ai',
      security: 'security',
      appearance: 'appearance',
      notifications: 'notifications',
    };
    const zakladka = NA_NOWE[settingsParam] ?? 'account';

    params.delete('settings');
    navigate(`/ustawienia?tab=${zakladka}`, { replace: true });
  }, [location.search]);

  /* To samo dla wywolania programowego — zeby nie zostawic trzeciej drogi
     do starego okna. `SettingsDialog` zostaje zamontowany, bo otwieraja go
     jeszcze `DashboardHeader` i `AgentChatInterface`; te wejscia schodza
     osobno, zeby ta zmiana byla mala i odwracalna. */
  const openSettings = useCallback((tab?: string) => {
    const NA_NOWE: Record<string, string> = {
      general: 'account', password: 'account', applications: 'account',
      legal: 'account', assistant: 'ai', 'local-ai': 'ai',
      security: 'security', appearance: 'appearance', notifications: 'notifications',
    };
    navigate(`/ustawienia?tab=${tab ? (NA_NOWE[tab] ?? 'account') : 'account'}`);
  }, [navigate]);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const openCookieConsent = useCallback(() => setCookieConsentOpen(true), []);
  const closeCookieConsent = useCallback(() => setCookieConsentOpen(false), []);

  const openBytePurchase = useCallback((opts?: { requiredBytes?: number; itemName?: string }) => {
    setByteRequired(opts?.requiredBytes ?? 0);
    setByteItemName(opts?.itemName);
    setBytePurchaseOpen(true);
  }, []);
  const closeBytePurchase = useCallback(() => setBytePurchaseOpen(false), []);

  const showByteReceived = useCallback(
    (amount: number, source: ByteReceivedSource, newBalance?: number) => {
      setByteReceivedAmount(amount);
      setByteReceivedSource(source);
      setByteReceivedNewBalance(newBalance);
      setByteReceivedOpen(true);
    },
    []
  );
  const closeByteReceived = useCallback(() => setByteReceivedOpen(false), []);

  const value = useMemo<GlobalDialogsContextType>(() => ({
    settingsOpen,
    settingsInitialTab,
    openSettings,
    closeSettings,
    setSettingsOpen,

    cookieConsentOpen,
    openCookieConsent,
    closeCookieConsent,
    setCookieConsentOpen,

    bytePurchaseOpen,
    openBytePurchase,
    closeBytePurchase,

    byteReceivedOpen,
    showByteReceived,
    closeByteReceived,
  }), [
    settingsOpen, settingsInitialTab, openSettings, closeSettings,
    cookieConsentOpen, openCookieConsent, closeCookieConsent,
    bytePurchaseOpen, openBytePurchase, closeBytePurchase,
    byteReceivedOpen, showByteReceived, closeByteReceived,
  ]);

  return (
    <GlobalDialogsContext.Provider value={value}>
      {children}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} initialTab={settingsInitialTab} />
      <CookieConsentPopup open={cookieConsentOpen} />
      {/* Prezent Byte od zespołu: czeka, aż człowiek wejdzie; „Odbierz" odpala celebrację niżej. */}
      <PrezentBytePopup onOdebrano={(ilosc) => showByteReceived(ilosc, 'admin_grant')} />
      <BytePurchaseDialog
        open={bytePurchaseOpen}
        onOpenChange={setBytePurchaseOpen}
        requiredBytes={byteRequired}
        currentBalance={balance}
        itemName={byteItemName}
        onPurchaseSuccess={() => setBytePurchaseOpen(false)}
      />
      <ByteReceivedCelebration
        open={byteReceivedOpen}
        onOpenChange={setByteReceivedOpen}
        amount={byteReceivedAmount}
        source={byteReceivedSource}
        newBalance={byteReceivedNewBalance}
      />
    </GlobalDialogsContext.Provider>
  );
}

export function useGlobalDialogs() {
  const context = useContext(GlobalDialogsContext);
  if (!context) {
    throw new Error('useGlobalDialogs must be used within GlobalDialogsProvider');
  }
  return context;
}

export function useOptionalGlobalDialogs() {
  return useContext(GlobalDialogsContext);
}

