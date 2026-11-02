import * as React from 'react';

/**
  KONTENER PORTALI — dokąd idą menu otwierane z wnętrza wyspy motywu (28.09.2026).

  Popover, lista wyboru, menu, dymek i karta po najechaniu renderują się
  portalem do `<body>`, czyli POZA drzewem, w którym zostały otwarte. Zmienne
  motywu dziedziczą się po drzewie DOM, więc menu otwarte z okna w innym
  motywie niż platforma (`WyspaMotywu`) dostawało motyw platformy: jasne okno
  nad białym płótnem tablicy wysuwało ciemne menu.

  Wyspa podaje tu swój element-kontener, a prymitywy biblioteki (`popover`,
  `select`, `dropdown-menu`, `tooltip`, `hover-card`, `context-menu`) biorą go
  jako domyślny `container` portalu. Poza wyspą kontekst jest pusty i portal
  idzie do `<body>` jak dotąd.

  Okna modalne (`dialog`, `sheet`, `drawer`) celowo NIE czytają kontekstu:
  stoją na środku ekranu pod własną zasłoną, nie są przyczepione do okna,
  z którego je otwarto, więc zostają w motywie platformy. Okno, które ma
  motyw PODŁOŻA (tablica), mówi to wprost: `OknoTresc` z `podloze` dostaje
  własny korzeń wyspy w `<body>` i podaje go tu swoim menu (28.09.2026).
*/

const KontekstKontenera = React.createContext<HTMLElement | null>(null);

/** Podaje prymitywom biblioteki kontener portali (wyspa motywu). */
export const KontenerPortali = KontekstKontenera.Provider;

/**
 * Kontener, do którego prymityw ma wysłać portal, albo `undefined` (= `<body>`).
 * Jawny `container` z propsów zawsze wygrywa.
 */
export function useKontenerPortali(jawny?: HTMLElement | null): HTMLElement | undefined {
  const zKontekstu = React.useContext(KontekstKontenera);
  return jawny ?? zKontekstu ?? undefined;
}
