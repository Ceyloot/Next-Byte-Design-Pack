import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'nextbyte_panic_shortcut';

// Shared ref to skip global handler during recording
export const panicRecordingRef = { current: false };

export interface PanicShortcut {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  key: string;
}

const DEFAULT_SHORTCUT: PanicShortcut = {
  ctrlKey: true,
  shiftKey: true,
  altKey: false,
  metaKey: false,
  key: 'l',
};

export const formatShortcut = (s: PanicShortcut): string => {
  const parts: string[] = [];
  if (s.ctrlKey || s.metaKey) parts.push('Ctrl');
  if (s.shiftKey) parts.push('Shift');
  if (s.altKey) parts.push('Alt');
  parts.push(s.key.length === 1 ? s.key.toUpperCase() : s.key);
  return parts.join(' + ');
};

interface PanicModeContextValue {
  isPanic: boolean;
  togglePanic: () => void;
  shortcut: PanicShortcut;
  setShortcut: (s: PanicShortcut) => void;
  resetShortcut: () => void;
}

const PanicModeContext = createContext<PanicModeContextValue>({
  isPanic: false,
  togglePanic: () => {},
  shortcut: DEFAULT_SHORTCUT,
  setShortcut: () => {},
  resetShortcut: () => {},
});

export const usePanicMode = () => useContext(PanicModeContext);

const loadShortcut = (): PanicShortcut => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_SHORTCUT;
};

export const PanicModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPanic, setIsPanic] = useState(false);
  const [shortcut, setShortcutState] = useState<PanicShortcut>(loadShortcut);

  const togglePanic = useCallback(() => {
    setIsPanic(prev => !prev);
  }, []);

  const setShortcut = useCallback((s: PanicShortcut) => {
    setShortcutState(s);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  }, []);

  const resetShortcut = useCallback(() => {
    setShortcutState(DEFAULT_SHORTCUT);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  // Global keyboard shortcut listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (panicRecordingRef.current) return;
      const matchCtrl = shortcut.ctrlKey ? (e.ctrlKey || e.metaKey) : true;
      const matchShift = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
      const matchAlt = shortcut.altKey ? e.altKey : !e.altKey;
      const matchKey = !!e.key && !!shortcut?.key && e.key.toLowerCase() === shortcut.key.toLowerCase();

      if (matchCtrl && matchShift && matchAlt && matchKey) {
        e.preventDefault();
        e.stopPropagation();
        togglePanic();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePanic, shortcut]);

  // Sync class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('panic-mode', isPanic);
    return () => document.documentElement.classList.remove('panic-mode');
  }, [isPanic]);

  return (
    <PanicModeContext.Provider value={{ isPanic, togglePanic, shortcut, setShortcut, resetShortcut }}>
      {children}
    </PanicModeContext.Provider>
  );
};
