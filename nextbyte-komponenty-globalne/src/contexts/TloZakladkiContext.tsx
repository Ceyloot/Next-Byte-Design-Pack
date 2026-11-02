import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  TŁO ZAKŁADKI — rysowane przez POWŁOKĘ, nie przez stronę
 * ════════════════════════════════════════════════════════════════════════════
 *
 * PO CO. Od 07.09.2026 pasek boczny jest pływającą pastylką ze szkła, a za nim
 * widać tło powłoki. Studio Zdjęć i Studio Video rysowały własne tło (siatka
 * 50 px + poświaty w barwie modułu) NA KORZENIU STRONY, czyli w obszarze
 * treści — więc siatka i fiolet zaczynały się dokładnie na krawędzi treści,
 * a pod pastylką stało gołe `--background`. Michał: „tło za nią aby było takie
 * jak zawartość zakładki, by takiego odcięcia nie było".
 *
 * JAK. Strona rejestruje węzeł tła hookiem `useTloZakladki`, a `AppShell`
 * renderuje go pod CAŁĄ powłoką (także pod pastylką). Przy wyjściu ze strony
 * tło znika samo. Strona bez rejestracji dostaje samo światło powłoki
 * (`TloAplikacji`) — czyli to, co większość zakładek ma dziś.
 *
 * Węzeł podaj ZMEMOIZOWANY (`useMemo`), bo hook zapisuje go w stanie powłoki
 * przy każdej zmianie tożsamości — nowy element w każdym renderze to pętla.
 */
interface Kontekst {
  /** slot → węzeł; powłoka renderuje wszystkie sloty w kolejności rejestracji */
  sloty: Record<string, React.ReactNode>;
  ustawSlot: (klucz: string, tlo: React.ReactNode | null) => void;
}

const TloZakladkiContext = createContext<Kontekst>({ sloty: {}, ustawSlot: () => {} });

export const DostawcaTlaZakladki: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sloty, setSloty] = useState<Record<string, React.ReactNode>>({});
  const ustawSlot = useCallback((klucz: string, tlo: React.ReactNode | null) => {
    setSloty((s) => {
      if (tlo === null) { if (!(klucz in s)) return s; const { [klucz]: _, ...reszta } = s; return reszta; }
      /* TEN SAM węzeł = brak zmiany stanu. Bez tego każdy zapis, nawet
         identyczny, tworzył nowy obiekt slotów i przerysowywał powłokę —
         strażnik przed pętlą, gdyby jakaś strona podała niezmemoizowany węzeł. */
      if (s[klucz] === tlo) return s;
      return { ...s, [klucz]: tlo };
    });
  }, []);
  const wartosc = useMemo(() => ({ sloty, ustawSlot }), [sloty, ustawSlot]);
  return <TloZakladkiContext.Provider value={wartosc}>{children}</TloZakladkiContext.Provider>;
};

/**
 * Do użycia w `AppShell`: wszystkie zarejestrowane tła albo `null`.
 * Kolejność: sloty stron pod spodem, „wzor" (wzór użytkownika
 * z `PatternOverlay`) na wierzchu.
 */
export const useTloZakladkiPowloki = (): React.ReactNode | null => {
  const { sloty } = useContext(TloZakladkiContext);
  const klucze = Object.keys(sloty);
  if (!klucze.length) return null;
  /* „wzor” NA WIERZCHU: strona kładzie pod nim przyciemnienie i poświaty
     (tak było w Chat AI: `bg-background/60` pod wzorem), a wzór ma zostać
     ostry i tej samej mocy co prześwit w pastylce. */
  klucze.sort((a, b) => (a === 'wzor' ? 1 : b === 'wzor' ? -1 : 0));
  return (
    <>
      {klucze.map((k) => <React.Fragment key={k}>{sloty[k]}</React.Fragment>)}
    </>
  );
};

/** Jeden slot — pastylka paska kopiuje z niego wzór, żeby siatka „przechodziła” przez szkło. */
export const useSlotTla = (klucz: string): React.ReactNode | null =>
  useContext(TloZakladkiContext).sloty[klucz] ?? null;

/**
 * Strona (albo komponent w niej) rejestruje tło na czas życia komponentu.
 * `slot` rozdziela niezależnych nadawców: strona używa domyślnego „strona",
 * `PatternOverlay` — „wzor". Dwa sloty nie nadpisują się nawzajem.
 */
export function useTloZakladki(tlo: React.ReactNode, slot = 'strona'): void {
  const { ustawSlot } = useContext(TloZakladkiContext);
  useEffect(() => {
    ustawSlot(slot, tlo);
    return () => ustawSlot(slot, null);
  }, [tlo, slot, ustawSlot]);
}
