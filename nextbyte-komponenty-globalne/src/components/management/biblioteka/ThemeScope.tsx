import React from 'react';
import { zmienneSzklaDlaMotywu } from '@/lib/szklo-motywu';
import type { MotywPodgladu } from './useMotywyPodgladu';

/**
 * Nakłada motyw na POJEDYNCZY KONTENER, nie na całą stronę.
 *
 * To jest sedno piaskownicy. `useGlobalTheme` ustawia zmienne na
 * `document.documentElement` — gdyby podgląd robił to samo, każde kliknięcie
 * przemalowałoby cały Panel Zarządu i administrator straciłby swój motyw.
 *
 * Zmienne CSS kaskadują, więc wystarczy ustawić je na diva: widzi je wyłącznie
 * jego poddrzewo. Dzięki temu 14 motywów może stać obok siebie na jednym ekranie.
 *
 * `isolation: isolate` odcina mieszanie warstw z otoczeniem, a `colorScheme`
 * ustawiamy z jasności tła, żeby natywne kontrolki (scrollbary, pola) też się
 * zgadzały z podglądem.
 */
export const ThemeScope: React.FC<{
  motyw: MotywPodgladu;
  className?: string;
  children: React.ReactNode;
}> = ({ motyw, className, children }) => {
  const style: React.CSSProperties = { isolation: 'isolate' };

  /*
    SZKŁO LICZONE TUTAJ, NIE U WOŁAJĄCEGO (05.08.2026).

    `useMotywyPodgladu` czyta wyłącznie `color_settings`, czyli surowe barwy.
    Zmienne szkła (`--nb-szklo-krycie`, `--nb-tafla-wypelnienie`, `--nb-szklo-mute`)
    wylicza `zmienneSzklaDlaMotywu` z jasności karty — i jeśli nikt ich nie doda,
    poddrzewo dziedziczy je z `<html>`, czyli z motywu ADMINISTRATORA.

    Zmierzone w „Test motywów (9)": podgląd „NextByte Jasny" (tło 95% jasności)
    dostawał `--nb-szklo-krycie: 0` i `--nb-tafla-wypelnienie: 0.60` — wartości
    motywu ciemnego. Czyli Biblioteka, narzędzie do OCENIANIA wyglądu,
    pokazywała szkło, którego platforma nigdy nie pokaże.

    `PodgladBiblioteki` robił to poprawnie u siebie, ale osiem pozostałych
    wywołań `ThemeScope` już nie. Dlatego liczenie schodzi TU: to jedyne
    miejsce, przez które motyw trafia na kontener, więc nikt tego nie ominie.
  */
  const zmienne = {
    ...motyw.zmienne,
    ...zmienneSzklaDlaMotywu({
      card: motyw.zmienne['--card'],
      mutedForeground: motyw.zmienne['--muted-foreground'],
    }),
  };

  for (const [zmienna, wartosc] of Object.entries(zmienne)) {
    (style as Record<string, string>)[zmienna] = wartosc;
  }

  // '0 0% 4%' -> 4 ; przy jasnym tle natywne kontrolki muszą być jasne
  const jasnosc = Number((motyw.zmienne['--background'] || '').split(/\s+/)[2]?.replace('%', ''));
  if (Number.isFinite(jasnosc)) style.colorScheme = jasnosc > 50 ? 'light' : 'dark';

  return (
    <div className={className} style={style} data-sandbox-theme={motyw.name}>
      {children}
    </div>
  );
};
