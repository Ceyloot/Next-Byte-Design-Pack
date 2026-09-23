import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Persists React state in localStorage scoped per-user and per-tab key.
 * Survives tab switching, page reload, and app restarts.
 *
 * Usage:
 *   const [prompt, setPrompt] = usePersistedTabState('photo-studio:studio:prompt', '');
 */
export function usePersistedTabState<T>(key: string, defaultValue: T) {
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';
  const storageKey = `nb:${userId}:${key}`;

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  });

  // Track latest key to handle user changes (sign in/out)
  const lastKeyRef = useRef(storageKey);
  useEffect(() => {
    if (lastKeyRef.current !== storageKey) {
      lastKeyRef.current = storageKey;
      try {
        const raw = window.localStorage.getItem(storageKey);
        setValue(raw === null ? defaultValue : (JSON.parse(raw) as T));
      } catch {
        setValue(defaultValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    try {
      if (value === undefined || value === null || (typeof value === 'string' && value === '')) {
        window.localStorage.removeItem(storageKey);
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      }
    } catch (e) {
      // Quota exceeded (large base64 images) — silently drop
      try {
        window.localStorage.removeItem(storageKey);
      } catch {}
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
}
