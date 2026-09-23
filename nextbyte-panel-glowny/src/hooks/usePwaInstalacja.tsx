import { useState, useEffect, useCallback } from 'react';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  INSTALACJA PWA — wykrycie, zaproszenie, zapamiętanie odmowy
 * ════════════════════════════════════════════════════════════════════════
 *
 * Platforma MA komplet PWA: manifest, ikony maskowalne, service worker,
 * skróty. Brakowało jednej rzeczy — ZAPROSZENIA. Bez niego człowiek musi sam
 * znaleźć „Dodaj do ekranu początkowego" w menu przeglądarki, czyli funkcję,
 * o której większość nie wie. Skutek: ludzie „korzystają z aplikacji",
 * używając zwykłej karty w przeglądarce.
 *
 * DWIE PLATFORMY, DWIE DROGI — i to jest sedno tego haka:
 *
 *   Android/Chrome  przeglądarka sama zgłasza `beforeinstallprompt`.
 *                   Przechwytujemy go, blokujemy domyślne okienko i wołamy
 *                   je DOPIERO wtedy, gdy sami uznamy moment za dobry.
 *
 *   iOS/Safari      NIE MA takiego zdarzenia i nigdy nie będzie. Instalacja
 *                   jest wyłącznie ręczna: Udostępnij → Do ekranu
 *                   początkowego. Jedyne, co możemy zrobić, to POKAZAĆ tę
 *                   drogę — dlatego hak rozróżnia „mogę zainstalować" od
 *                   „mogę tylko pokazać instrukcję".
 *
 * ODMOWA JEST ZAPAMIĘTYWANA. Zaproszenie, które wraca po każdym wejściu,
 * przestaje być zaproszeniem, a staje się natrętnym paskiem — a takich
 * ludzie uczą się nie widzieć. Trzymamy w `localStorage`, bo to preferencja
 * URZĄDZENIA, nie konta: ktoś może chcieć aplikacji na telefonie i nie
 * chcieć jej na służbowym laptopie.
 */

const KLUCZ_ODMOWY = 'nb-pwa-odmowa';
/* Po odmowie milczymy 30 dni. Nie „nigdy" — bo ktoś może odmówić na
   komputerze, a za miesiąc wejść z telefonu i wtedy chcieć. */
const CISZA_DNI = 30;

interface ZdarzenieInstalacji extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Czy aplikacja działa już jako zainstalowana (nie w karcie przeglądarki). */
export const czyZainstalowana = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  // iOS nie wspiera `display-mode`, ma własną, niestandardową flagę.
  return (window.navigator as { standalone?: boolean }).standalone === true;
};

/** iOS wymaga instrukcji zamiast przycisku — patrz komentarz nad plikiem. */
export const czyIOS = (): boolean =>
  typeof navigator !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as { MSStream?: unknown }).MSStream;

const odmowaAktualna = (): boolean => {
  try {
    const zapis = localStorage.getItem(KLUCZ_ODMOWY);
    if (!zapis) return false;
    return Date.now() - Number(zapis) < CISZA_DNI * 24 * 60 * 60 * 1000;
  } catch {
    return false;   // brak dostępu do magazynu nie może blokować zaproszenia
  }
};

export const usePwaInstalacja = () => {
  const [zdarzenie, setZdarzenie] = useState<ZdarzenieInstalacji | null>(null);
  const [zainstalowana, setZainstalowana] = useState(czyZainstalowana);
  const [odmowiono, setOdmowiono] = useState(odmowaAktualna);

  useEffect(() => {
    const naPrompt = (e: Event) => {
      /* Blokujemy domyślny pasek przeglądarki — zaproszenie ma wyjść
         w NASZYM momencie, po pokazaniu wartości, a nie przy pierwszym
         wejściu, gdy człowiek jeszcze nie wie, co instaluje. */
      e.preventDefault();
      setZdarzenie(e as ZdarzenieInstalacji);
    };
    const naInstalacji = () => { setZdarzenie(null); setZainstalowana(true); };

    window.addEventListener('beforeinstallprompt', naPrompt);
    window.addEventListener('appinstalled', naInstalacji);
    return () => {
      window.removeEventListener('beforeinstallprompt', naPrompt);
      window.removeEventListener('appinstalled', naInstalacji);
    };
  }, []);

  /** Wywołuje okienko przeglądarki. Zwraca `true`, gdy człowiek zainstalował. */
  const zainstaluj = useCallback(async (): Promise<boolean> => {
    if (!zdarzenie) return false;
    await zdarzenie.prompt();
    const { outcome } = await zdarzenie.userChoice;
    setZdarzenie(null);
    if (outcome === 'accepted') { setZainstalowana(true); return true; }
    /* Odmowa w okienku SYSTEMOWYM też się liczy — inaczej pytalibyśmy
       ponownie o coś, czego człowiek właśnie odmówił. */
    try { localStorage.setItem(KLUCZ_ODMOWY, String(Date.now())); } catch { /* nieistotne */ }
    setOdmowiono(true);
    return false;
  }, [zdarzenie]);

  const odrzuc = useCallback(() => {
    try { localStorage.setItem(KLUCZ_ODMOWY, String(Date.now())); } catch { /* nieistotne */ }
    setOdmowiono(true);
  }, []);

  return {
    /** Czy Chrome dał nam gotowe okienko instalacji. */
    mozeZainstalowac: !!zdarzenie && !zainstalowana && !odmowiono,
    /** iOS: nie ma okienka, pokazujemy instrukcję. */
    pokazInstrukcjeIOS: czyIOS() && !zainstalowana && !odmowiono,
    zainstalowana,
    odmowiono,
    zainstaluj,
    odrzuc,
  };
};
