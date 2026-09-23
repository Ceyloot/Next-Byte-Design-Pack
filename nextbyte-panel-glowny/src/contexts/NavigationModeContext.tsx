import React, { createContext, useContext, useState, useEffect } from 'react';

type NavMode = 'sidebar' | 'pillnav';

interface NavigationModeContextType {
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
}

const NavigationModeContext = createContext<NavigationModeContextType | undefined>(undefined);

const STORAGE_KEY = 'nextbyte_nav_mode';

export const NavigationModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navMode, setNavModeState] = useState<NavMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'pillnav') return 'pillnav';
    } catch {}
    return 'sidebar';
  });

  const setNavMode = (mode: NavMode) => {
    setNavModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  };

  // Expose a way to force-reset to sidebar from outside (access control)
  const forceReset = (mode: NavMode) => {
    setNavModeState(mode);
  };

  return (
    <NavigationModeContext.Provider value={{ navMode, setNavMode }}>
      {children}
    </NavigationModeContext.Provider>
  );
};

export const useNavigationMode = () => {
  const ctx = useContext(NavigationModeContext);
  if (!ctx) {
    // Fallback when used outside provider (e.g. settings dialog rendered higher in tree)
    return {
      navMode: (localStorage.getItem(STORAGE_KEY) === 'pillnav' ? 'pillnav' : 'sidebar') as NavMode,
      setNavMode: (mode: NavMode) => {
        localStorage.setItem(STORAGE_KEY, mode);
        window.location.reload();
      },
    };
  }
  return ctx;
};
