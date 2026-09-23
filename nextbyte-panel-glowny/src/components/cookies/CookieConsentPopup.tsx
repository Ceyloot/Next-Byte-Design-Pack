import React, { useEffect, useState } from 'react';
import { Cookie, Check, Shield, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Okno, OknoTresc, OknoNaglowek, OknoCialo, OknoStopka } from '@/components/ui/okno';
import { Zakladki } from '@/components/ui/zakladki';
import { Button } from '@/components/ui/button';
import { FuturisticLoader } from '@/components/ui/futuristic-loader';
import { ConsentTab } from './ConsentTab';
import { DetailsTab } from './DetailsTab';
import { useCookieSettings } from '@/hooks/useCookieSettings';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { useGlobalDialogs } from '@/contexts/GlobalDialogsContext';
import type { CookieCategory, CookiePreferences } from '@/types/cookies';

interface CookieConsentPopupProps {
  open: boolean;
}

/**
 * ════════════════════════════════════════════════════════════════════════
 *  BANER CIASTECZEK NA KOMPONENTACH BIBLIOTEKI (07.09.2026)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „ogarnij popup ciasteczek ui ux i dodatkowo jest błąd, nic tam
 * nie działa". Błąd siedział w bazie (polityka UPDATE z limitem 30 dni —
 * migracja `20260907170000`), a UI był własnym oknem shadcn z trzema
 * warstwami ręcznych klas: nagłówek, pasek zakładek i przyciski na
 * własnym szkle w środku treści.
 *
 * Teraz: `Okno` biblioteki (etykieta „Prywatność", tytuł, stopka z akcjami
 * na własnej płaszczyźnie), `Zakladki` biblioteki, przyciski w wariantach
 * platformy. Decyzje stoją w STOPCE, nie w treści — jedna akcja główna
 * („Zgadzam się" / „Zapisz wybór"), reszta cicho obok. Okna nie da się
 * zamknąć bez decyzji (brak krzyżyka, klik poza i Escape nic nie robią),
 * bo zgoda jest obowiązkiem wobec każdego zalogowanego.
 */
const przeksztalcKategorie = (
  categories: CookieCategory[],
  wybor: Record<string, boolean>,
): CookiePreferences => {
  const preferencje: CookiePreferences = {
    functional_cookies: true,
    marketing_cookies: false,
    statistics_cookies: false,
    personalization_cookies: false,
  };
  for (const cat of categories) {
    const wlaczona = !!wybor[cat.id];
    const nazwa = cat.name.toLowerCase();
    if (nazwa.includes('marketing')) preferencje.marketing_cookies = wlaczona;
    else if (nazwa.includes('statyst')) preferencje.statistics_cookies = wlaczona;
    else if (nazwa.includes('personal')) preferencje.personalization_cookies = wlaczona;
  }
  return preferencje;
};

const WSZYSTKO: CookiePreferences = {
  functional_cookies: true, marketing_cookies: true, statistics_cookies: true, personalization_cookies: true,
};
const TYLKO_NIEZBEDNE: CookiePreferences = {
  functional_cookies: true, marketing_cookies: false, statistics_cookies: false, personalization_cookies: false,
};

export const CookieConsentPopup: React.FC<CookieConsentPopupProps> = ({ open }) => {
  const [zakladka, setZakladka] = useState<'consent' | 'details'>('consent');
  const [wybor, setWybor] = useState<Record<string, boolean>>({});
  const { settings, categories, isLoading } = useCookieSettings();
  const { saveConsent, isSaving, consentRequired, bladZapisu } = useCookieConsent();
  const { closeCookieConsent } = useGlobalDialogs();

  useEffect(() => {
    if (!consentRequired && open) closeCookieConsent();
  }, [consentRequired, open, closeCookieConsent]);

  /* Stan przełączników mieszka tu, a nie w zakładce: przyciski stoją
     w stopce okna, poza zakładką, więc to okno musi znać wybór. */
  useEffect(() => {
    const start: Record<string, boolean> = {};
    for (const cat of categories) start[cat.id] = cat.is_required;
    setWybor(start);
  }, [categories]);

  const zakladki = settings
    ? [
        { id: 'consent', etykieta: settings.consent_tab_title || 'Zgody', ikona: Cookie },
        { id: 'details', etykieta: settings.details_tab_title || 'Szczegóły', ikona: SlidersHorizontal },
      ]
    : [];

  return (
    <Okno open={open}>
      <OknoTresc
        intencja="akcent"
        rozmiar="sredni"
        className="z-[300]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <OknoNaglowek
          intencja="akcent"
          etykieta="Prywatność"
          tytul={settings?.main_title || 'Ciasteczka'}
          podtytul="Wybierz, na co się zgadzasz. Zmienisz to w każdej chwili w Ustawieniach."
          ikona={<Cookie className="h-4 w-4" />}
          zZamknieciem={false}
        />

        {isLoading || !settings ? (
          <OknoCialo>
            <div className="flex items-center justify-center py-10">
              <FuturisticLoader size="lg" showReflection />
            </div>
          </OknoCialo>
        ) : (
          <>
            <OknoCialo className="space-y-4">
              <Zakladki
                aria-label="Sekcje zgód na ciasteczka"
                zakladki={zakladki}
                aktywna={zakladka}
                onZmiana={(id) => setZakladka(id as 'consent' | 'details')}
              />
              {zakladka === 'consent' ? (
                <ConsentTab settings={settings} categories={categories} />
              ) : (
                <DetailsTab categories={categories} wybor={wybor} onZmiana={setWybor} disabled={isSaving} />
              )}
              {bladZapisu && (
                <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/[0.06] px-3 py-2 text-[13px] text-destructive">
                  {bladZapisu}
                </p>
              )}
            </OknoCialo>

            <OknoStopka>
              {zakladka === 'consent' ? (
                <>
                  <Button variant="ghost" disabled={isSaving} onClick={() => setZakladka('details')}>
                    <SlidersHorizontal className="h-4 w-4" />
                    {settings.button_customize || 'Chcę wybrać'}
                  </Button>
                  <Button variant="outline" disabled={isSaving} onClick={() => saveConsent(TYLKO_NIEZBEDNE)}>
                    <Shield className="h-4 w-4" />
                    {settings.button_necessary_only || 'Tylko niezbędne'}
                  </Button>
                  <Button disabled={isSaving} onClick={() => saveConsent(WSZYSTKO)}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {settings.button_accept_all || 'Zgadzam się'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" disabled={isSaving} onClick={() => saveConsent(TYLKO_NIEZBEDNE)}>
                    <Shield className="h-4 w-4" />
                    {settings.button_necessary_only || 'Tylko niezbędne'}
                  </Button>
                  <Button disabled={isSaving} onClick={() => saveConsent(przeksztalcKategorie(categories, wybor))}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Zapisz wybór
                  </Button>
                </>
              )}
            </OknoStopka>
          </>
        )}
      </OknoTresc>
    </Okno>
  );
};
