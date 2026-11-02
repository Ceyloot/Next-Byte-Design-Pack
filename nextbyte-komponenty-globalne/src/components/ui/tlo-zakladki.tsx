import React from 'react';
import { useTloZakladki } from '@/contexts/TloZakladkiContext';

/**
 * POŚWIATY ZAKŁADKI RYSOWANE PRZEZ POWŁOKĘ (07.09.2026).
 *
 * Michał: „glow orb w tle na niektórych stronach lewy dolny aby się nie
 * ucinały, tylko do krawędzi poszły". Orby leżały w korzeniu strony, czyli
 * w obszarze TREŚCI — lewy dolny kończył się na pastylce paska ostrą
 * krawędzią, bo dalej nie miał gdzie się rozlać. Tu dzieci (te same `div`
 * z tymi samymi klasami) trafiają do slotu strony w powłoce: `-left-24`
 * liczy się od krawędzi EKRANU, więc poświata wychodzi pod pasek i za
 * krawędź, jak każde światło sceny.
 *
 * `klucz` trzyma tożsamość węzła między renderami strony — bez tego każdy
 * render tworzyłby nowe dzieci i powłoka przerysowywałaby się w kółko.
 * Zmień klucz, gdy zmienia się TREŚĆ poświat (np. kolor folderu).
 */
export const PoswiatyZakladki: React.FC<{ klucz: string; children: React.ReactNode }> = ({ klucz, children }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tlo = React.useMemo(() => (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {children}
    </div>
  ), [klucz]);
  useTloZakladki(tlo);
  return null;
};
