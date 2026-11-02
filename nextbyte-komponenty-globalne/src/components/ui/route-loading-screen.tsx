import React from 'react';

interface RouteLoadingScreenProps {
  message?: string;
  /** Druga linia, mniejsza — np. „Przygotowujemy twoje dane". */
  podpis?: string;
  /*
    Czy ekran stoi WEWNĄTRZ powłoki aplikacji (pod paskiem górnym).

    Ma znaczenie, bo powłoka jest przypięta do okna, a przewija się jej treść.
    Ekran ładowania o wysokości całego okna, wstawiony POD pasek, jest o tyle
    za wysoki, ile ma pasek — zmierzone: 49 px nadmiaru, przewijanie tam,
    gdzie nie ma czego przewijać, i loader 24 px poniżej środka.
  */
  wPowloce?: boolean;
  /*
    Nazwa „NextByte" nad linią. `false` na stronach, które mogą okazać się
    stronami BEZ marki (udostępniona notatka, 26.09.2026) — zanim dane
    dojadą, nie wiadomo, czy wolno pokazać nazwę platformy.
  */
  znak?: boolean;
}

/*
  EKRAN ŁADOWANIA MA STAĆ W MIEJSCU I BYĆ CICHY.

  ① `min-h-[100svh]`, nie `100vh`: na telefonie `100vh` liczy się tak, jakby
     pasek adresu był schowany, więc ekran dawał się przewijać i skakał.
  ② Wszystkie ekrany ładowania (sesja, powłoka, trasa) idą przez ten
     komponent, a `wPowloce` decyduje, czy odejmować pasek.
  ③ 08.09.2026, Michał: „animacja wczytywania jest masywna i nic nie wnosi".
     Był tu 128-pikselowy neonowy pierścień z odbiciem i tekst 18 px. Teraz
     ten sam język co ekran startowy w `index.html`: mała nazwa i cienka
     sunąca linia (`nb-linia-ladowania` w `index.css`). Bez `animate-fade-in`,
     bo zaczyna od `translateY(10px)` — czyli od skoku.
*/
export const RouteLoadingScreen: React.FC<RouteLoadingScreenProps> = ({
  message = 'Wczytywanie…',
  podpis,
  wPowloce = false,
  znak = true,
}) => {
  return (
    <div
      className={[
        'w-full bg-background flex items-center justify-center',
        wPowloce ? 'h-full min-h-0' : 'min-h-[100svh]',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        {znak && (
          <span className="font-display text-[13px] font-medium uppercase tracking-[0.32em] text-foreground/70" style={{ textIndent: '0.32em' }}>
            NextByte
          </span>
        )}
        <div className="nb-linia-ladowania" aria-hidden="true"><span /></div>
        <div className="space-y-1">
          <p className="text-[13px] text-muted-foreground">{message}</p>
          {podpis && <p className="text-xs text-muted-foreground/70">{podpis}</p>}
        </div>
      </div>
    </div>
  );
};

export default RouteLoadingScreen;
