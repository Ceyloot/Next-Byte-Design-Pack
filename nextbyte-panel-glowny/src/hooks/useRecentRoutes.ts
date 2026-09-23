import { useEffect, useState, useCallback } from 'react';

const PINNED_KEY = 'nextbyte_pinned_routes_v1';
const MAX_PINNED = 8;

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJSON = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('nextbyte-pinned-routes-updated'));
  } catch {
    // ignore quota errors
  }
};

/**
 * Manages user-pinned favorite routes (localStorage only).
 * "Recent" auto-tracking was removed by user request — favorites are manual only.
 */
export const useRecentRoutes = () => {
  const [pinned, setPinned] = useState<string[]>(() =>
    readJSON<string[]>(PINNED_KEY, [])
  );

  // Listen for cross-component updates
  useEffect(() => {
    const handler = () => {
      setPinned(readJSON<string[]>(PINNED_KEY, []));
    };
    window.addEventListener('nextbyte-pinned-routes-updated', handler);
    return () => window.removeEventListener('nextbyte-pinned-routes-updated', handler);
  }, []);

  const togglePin = useCallback((path: string) => {
    const current = readJSON<string[]>(PINNED_KEY, []);
    const next = current.includes(path)
      ? current.filter((p) => p !== path)
      : [...current, path].slice(0, MAX_PINNED);
    writeJSON(PINNED_KEY, next);
    setPinned(next);
  }, []);

  const isPinned = useCallback((path: string) => pinned.includes(path), [pinned]);

  return { recent: [] as string[], pinned, togglePin, isPinned };
};
