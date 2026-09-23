import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, X, Share, Plus } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useScreenSize } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  ZACHĘTA DO WŁĄCZENIA POWIADOMIEŃ — pod paskiem górnym, na telefonie
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał, 26.08.2026: „na telefonie jak ktoś nie ma to w panelu głównym się
 * pokazywał przełącznik na czerwono dosłownie pod paskiem górnym aby to
 * włączyć i pozwolić".
 *
 * DLACZEGO TO W OGÓLE POTRZEBNE
 * Przełącznik powiadomień stoi dziś WYŁĄCZNIE w Ustawieniach → Powiadomienia.
 * Żeby go znaleźć, trzeba wiedzieć, że istnieje. Zmierzone tego samego dnia:
 * na 134 konta AKTYWNĄ subskrypcję push ma JEDNO. To nie jest niechęć do
 * powiadomień — to niewiedza, że da się je włączyć.
 *
 * DLACZEGO CZERWONY, SKORO NIC SIĘ NIE PSUJE
 * Bo to jedyny kolor, którego nie da się przeoczyć na Panelu Głównym pełnym
 * niebieskich kafli. Świadomie używamy go do ZACHĘTY, nie do błędu — i dlatego
 * treść nie straszy, tylko mówi, co człowiek zyska. Gdyby brzmiała jak alarm
 * („Powiadomienia wyłączone!"), byłaby wołaniem o pomoc przy braku problemu.
 *
 * TRZY POWODY, DLA KTÓRYCH PASEK SIĘ NIE POKAZUJE
 *   · na komputerze — Michał poprosił wyraźnie o telefon, a na desktopie
 *     powiadomienia przeglądarki są dużo mniej użyteczne,
 *   · gdy subskrypcja już jest — nie ma czego proponować,
 *   · gdy człowiek raz odmówił — przez 14 dni. Pasek, który wraca po każdym
 *     wejściu mimo odmowy, przestaje być zachętą i staje się natrętem.
 *
 * iOS MA WŁASNĄ ŚCIEŻKĘ i to nie jest kaprys: Safari NIE POZWALA prosić
 * o zgodę na powiadomienia, dopóki strona nie zostanie dodana do ekranu
 * początkowego. Przycisk „Włącz" nie zrobiłby tam NIC — więc zamiast niego
 * pokazujemy, jak dodać aplikację, z ikonami, których trzeba szukać.
 */

const KLUCZ_ODMOWY = 'nb:push-zacheta-odrzucona';
const CISZA_PO_ODMOWIE_DNI = 14;

const odmowilNiedawno = (): boolean => {
  try {
    const kiedy = Number(localStorage.getItem(KLUCZ_ODMOWY) || 0);
    if (!kiedy) return false;
    return Date.now() - kiedy < CISZA_PO_ODMOWIE_DNI * 24 * 60 * 60 * 1000;
  } catch {
    /* Prywatne okno albo zablokowane dane witryny — wtedy pokazujemy pasek.
       Lepiej zaproponować raz za dużo niż nie zaproponować nigdy. */
    return false;
  }
};

export const ZachetaPush: React.FC = () => {
  const { isMobile } = useScreenSize();
  const { hasPushApi, isSubscribed, isiOS, isPWA, permission, isLoading, subscribe } =
    usePushNotifications();
  const [schowany, setSchowany] = useState(() => odmowilNiedawno());

  /* Zablokowana zgoda to ślepy zaułek — przeglądarka nie zapyta drugi raz,
     a odblokowanie siedzi w jej ustawieniach, nie u nas. Pasek z przyciskiem,
     który nic nie robi, byłby gorszy niż jego brak. */
  const zablokowane = permission === 'denied';

  /* `hasPushApi`, NIE `isSupported`.

     `isSupported` jest na iPhonie fałszywe, dopóki aplikacja nie zostanie
     dodana do ekranu początkowego — czyli dokładnie w stanie, w którym ta
     zachęta ma sens. Oparta na nim, nie pokazywała się nikomu na iOS, a to
     większość naszych urządzeń. Gałąź z instrukcją dodania była martwa. */
  const pokazac =
    isMobile && hasPushApi && !isSubscribed && !schowany && !zablokowane;

  const odrzuc = () => {
    try { localStorage.setItem(KLUCZ_ODMOWY, String(Date.now())); } catch { /* nieistotne */ }
    setSchowany(true);
  };

  /* Na iOS bez dodania do ekranu początkowego prośba o zgodę jest niemożliwa —
     pokazujemy instrukcję zamiast przycisku, który by nie zadziałał. */
  const trzebaNajpierwDodac = isiOS && !isPWA;

  return (
    <AnimatePresence>
      {pokazac && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'mb-3 flex items-start gap-3 rounded-2xl px-3.5 py-3',
              'border border-destructive/35 bg-destructive/[0.07]'
            )}
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-destructive/15">
              <BellRing className="h-4 w-4 text-destructive" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-foreground">
                {trzebaNajpierwDodac
                  ? 'Dodaj NextByte do ekranu, żeby dostawać powiadomienia'
                  : 'Włącz powiadomienia'}
              </p>

              {trzebaNajpierwDodac ? (
                <p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] leading-relaxed text-muted-foreground">
                  Dotknij
                  <Share className="inline h-3 w-3 shrink-0" aria-label="Udostępnij" />
                  na dole, potem
                  <Plus className="inline h-3 w-3 shrink-0" aria-label="Plus" />
                  <span className="font-medium text-foreground">Do ekranu początkowego</span>
                  — Safari inaczej nie pozwoli o nie poprosić.
                </p>
              ) : (
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  Dowiesz się o skończonym filmie, terminie zadania i odpowiedzi
                  asystenta — nawet gdy aplikacja jest zamknięta.
                </p>
              )}

              {!trzebaNajpierwDodac && (
                <button
                  type="button"
                  onClick={() => { void subscribe(); }}
                  disabled={isLoading}
                  className={cn(
                    'mt-2.5 inline-flex h-8 items-center justify-center rounded-lg px-3.5',
                    'text-xs font-medium transition-colors',
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                    'disabled:opacity-60'
                  )}
                >
                  {isLoading ? 'Włączam…' : 'Włącz powiadomienia'}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={odrzuc}
              aria-label="Ukryj na dwa tygodnie"
              className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
