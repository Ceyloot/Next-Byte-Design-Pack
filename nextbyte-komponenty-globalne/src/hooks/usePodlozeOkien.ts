import { useEffect, useState, useSyncExternalStore } from 'react';

/*
  PODŁOŻE POD PŁYWAJĄCYMI OKNAMI — strona mówi, na czym leżą (28.09.2026).

  Michał: „jak jest biały motyw tablicy to daj biały motyw asystenta okna,
  a ciemny motyw — ciemny motyw okna asystenta".

  Okno Asystenta unosi się w prawym dolnym rogu nad treścią strony. Zwykle ta
  treść ma motyw platformy, więc okno też. Tablica jest wyjątkiem: płótno
  Excalidraw ma WŁASNY motyw (jasny albo ciemny, przełączany w menu płótna
  i skrótem Shift+Alt+D), niezależny od motywu platformy.

  Tablica deklaruje więc, jakie jest jej płótno, a okno Asystenta
  (`WyspaMotywu` w `FloatingAssistantChat`) bierze motyw z tej deklaracji.
  Bez deklaracji — czyli na każdej innej stronie — okno ma motyw platformy.

  DLACZEGO MAGAZYN, A NIE ATRYBUT NA `<html>`: deklarację czyta komponent
  Reacta, nie arkusz. Atrybut wymagałby `MutationObserver` po stronie okna,
  a magazyn z `useSyncExternalStore` przełącza okno w tym samym renderze,
  w którym płótno zmieniło motyw.

  To NIE zastępuje `useJasnePodloze`: tamto przydymia KAŻDE szkło nad jasnym
  płótnem w ciemnym motywie (paski i menu tablicy dalej go potrzebują).
*/

export type PodlozeOkien = 'jasne' | 'ciemne';

let biezace: PodlozeOkien | null = null;
/** Kto zadeklarował ostatni — sprzątanie cudzej deklaracji jej nie zdejmuje. */
let wlasciciel: symbol | null = null;
const sluchacze = new Set<() => void>();

const powiadom = () => sluchacze.forEach((s) => s());

export const podlozeOkien = {
  odczytaj: (): PodlozeOkien | null => biezace,
  subskrybuj: (s: () => void) => {
    sluchacze.add(s);
    return () => { sluchacze.delete(s); };
  },
  /** Do testów i podglądów. W aplikacji deklaruje `useDeklarujPodlozeOkien`. */
  ustaw: (podloze: PodlozeOkien | null, kto: symbol | null = null) => {
    if (biezace === podloze && wlasciciel === kto) return;
    biezace = podloze;
    wlasciciel = kto;
    powiadom();
  },
  zdejmij: (kto: symbol) => {
    if (wlasciciel !== kto) return;
    biezace = null;
    wlasciciel = null;
    powiadom();
  },
};

/**
 * Strona deklaruje podłoże pływających okien na czas, gdy jest zamontowana.
 * `null` = brak deklaracji (okna biorą motyw platformy).
 */
export function useDeklarujPodlozeOkien(podloze: PodlozeOkien | null): void {
  const [kto] = useState(() => Symbol('podloze-okien'));
  /* Zmiana płótna jasne → ciemne to JEDNA zmiana magazynu, bez przejścia
     przez `null` — inaczej okno mignęłoby na moment motywem platformy. */
  useEffect(() => {
    if (podloze) podlozeOkien.ustaw(podloze, kto);
    else podlozeOkien.zdejmij(kto);
  }, [podloze, kto]);
  useEffect(() => () => podlozeOkien.zdejmij(kto), [kto]);
}

/** Podłoże zadeklarowane przez bieżącą stronę albo `null`. */
export function usePodlozeOkien(): PodlozeOkien | null {
  return useSyncExternalStore(podlozeOkien.subskrybuj, podlozeOkien.odczytaj, () => null);
}
