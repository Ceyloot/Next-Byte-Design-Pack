import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SIDEBAR_STORAGE_KEY = 'sidebar-state';

interface GlobalSidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const GlobalSidebarContext = createContext<GlobalSidebarContextType | null>(null);

function getStoredState(): boolean {
  if (typeof window === 'undefined') return true;
  
  // Try localStorage first (more reliable)
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  
  // Fallback to cookie with proper escaping
  const cookieName = 'sidebar:state';
  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp('(^|; )' + escapedName + '=([^;]*)'));
  if (match) {
    return match[2] === 'true';
  }
  
  return true; // default open
}

function storeState(open: boolean): void {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage
  localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
  
  // Also store in cookie for compatibility
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `sidebar:state=${open}; path=/; max-age=${maxAge}`;
}

export const GlobalSidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpenState] = useState<boolean>(() => getStoredState());

  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open);
    storeState(open);
  }, []);

  const toggle = useCallback(() => {
    setIsOpenState(prev => {
      const newState = !prev;
      storeState(newState);
      return newState;
    });
  }, []);

  // Sync on mount in case storage changed in another tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SIDEBAR_STORAGE_KEY && e.newValue !== null) {
        setIsOpenState(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <GlobalSidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </GlobalSidebarContext.Provider>
  );
};

export function useGlobalSidebar() {
  const context = useContext(GlobalSidebarContext);
  if (!context) {
    throw new Error('useGlobalSidebar must be used within a GlobalSidebarProvider');
  }
  return context;
}

// Optional hook that returns null if outside provider (for conditional use)
export function useGlobalSidebarOptional() {
  return useContext(GlobalSidebarContext);
}
