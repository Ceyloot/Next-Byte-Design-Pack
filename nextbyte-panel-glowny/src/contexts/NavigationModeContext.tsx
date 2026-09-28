import React, { createContext, useContext, useState } from 'react';

type NavMode = 'sidebar' | 'pillnav';
/** Krawędź, do której przypięty jest pasek. `gora` / `dol` = pigułka, `lewo` / `prawo` = pasek boczny. */
export type PozycjaPaska = 'lewo' | 'prawo' | 'gora' | 'dol';

interface NavigationModeContextType {
  /** Wynika z pozycji: góra i dół to pigułka, boki to pasek boczny. */
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
  pozycja: PozycjaPaska;
  setPozycja: (p: PozycjaPaska) => void;
}

const NavigationModeContext = createContext<NavigationModeContextType | undefined>(undefined);

const STORAGE_KEY = 'nextbyte_nav_mode';
const STORAGE_POZYCJA = 'nextbyte_nav_pozycja';

const trybZPozycji = (p: PozycjaPaska): NavMode => (p === 'gora' || p === 'dol' ? 'pillnav' : 'sidebar');

function zapisz(p: PozycjaPaska) {
  try {
    localStorage.setItem(STORAGE_POZYCJA, p);
    localStorage.setItem(STORAGE_KEY, trybZPozycji(p));
  } catch {}
}

const odczytajPozycje = (): PozycjaPaska => {
  try {
    /* `?nav=pillnav|sidebar|gora|dol|lewo|prawo` — wymusza pozycję i ją zapamiętuje.
       Po to, żeby podgląd osadzający panel w ramce (inny origin, więc bez
       dostępu do jego localStorage) mógł ustawić pasek. */
    const zAdresu = new URLSearchParams(window.location.search).get('nav');
    const mapa: Record<string, PozycjaPaska> = {
      pillnav: 'gora', sidebar: 'lewo', gora: 'gora', dol: 'dol', lewo: 'lewo', prawo: 'prawo',
    };
    if (zAdresu && mapa[zAdresu]) {
      zapisz(mapa[zAdresu]);
      return mapa[zAdresu];
    }
    const p = localStorage.getItem(STORAGE_POZYCJA);
    if (p === 'lewo' || p === 'prawo' || p === 'gora' || p === 'dol') return p;
    /* Wcześniej zapamiętany tryb sprzed dokowania. */
    if (localStorage.getItem(STORAGE_KEY) === 'pillnav') return 'gora';
  } catch {}
  return 'lewo';
};

export const NavigationModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pozycja, setPozycjaState] = useState<PozycjaPaska>(odczytajPozycje);

  const setPozycja = (p: PozycjaPaska) => {
    setPozycjaState(p);
    zapisz(p);
  };

  /* Przełącznik z ustawień wyglądu zna tylko dwa tryby — gdy tryb już pasuje
     do bieżącej pozycji, nic nie zmieniamy, więc strona paska zostaje. */
  const setNavMode = (mode: NavMode) => {
    if (trybZPozycji(pozycja) === mode) return;
    setPozycja(mode === 'pillnav' ? 'gora' : 'lewo');
  };

  return (
    <NavigationModeContext.Provider value={{ navMode: trybZPozycji(pozycja), setNavMode, pozycja, setPozycja }}>
      {children}
    </NavigationModeContext.Provider>
  );
};

export const useNavigationMode = () => {
  const ctx = useContext(NavigationModeContext);
  if (!ctx) {
    // Fallback when used outside provider (e.g. settings dialog rendered higher in tree)
    const p = odczytajPozycje();
    return {
      navMode: trybZPozycji(p),
      pozycja: p,
      setNavMode: (mode: NavMode) => {
        zapisz(mode === 'pillnav' ? 'gora' : 'lewo');
        window.location.reload();
      },
      setPozycja: (nowa: PozycjaPaska) => {
        zapisz(nowa);
        window.location.reload();
      },
    };
  }
  return ctx;
};
