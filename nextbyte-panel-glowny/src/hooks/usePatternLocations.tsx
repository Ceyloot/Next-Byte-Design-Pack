import { useState, useCallback, useEffect } from 'react';

export const PATTERN_LOCATIONS = {
  dashboard: 'Panel Główny',
  chat_ai: 'Chat AI',
  asystent: 'Personalny Asystent',
  zadania: 'Zadania',
  notatki: 'Notatki',
  premium: 'Premium',
  akademia: 'Akademia',
  konto: 'Konto',
} as const;

export type PatternLocationKey = keyof typeof PATTERN_LOCATIONS;

const STORAGE_KEY = 'nextbyte_pattern_locations';

const DEFAULT_LOCATIONS: Record<PatternLocationKey, boolean> = {
  dashboard: true,
  chat_ai: true,
  asystent: true,
  zadania: true,
  notatki: true,
  premium: true,
  akademia: true,
  konto: true,
};

function loadLocations(): Record<PatternLocationKey, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_LOCATIONS, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_LOCATIONS };
}

export function usePatternLocations() {
  const [locations, setLocations] = useState<Record<PatternLocationKey, boolean>>(loadLocations);

  const toggleLocation = useCallback((key: PatternLocationKey) => {
    setLocations(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('pattern-locations-changed', { detail: next }));
      return next;
    });
  }, []);

  const isLocationEnabled = useCallback((key: PatternLocationKey) => {
    return locations[key] ?? false;
  }, [locations]);

  // Listen for changes from other components
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setLocations(detail);
    };
    window.addEventListener('pattern-locations-changed', handler);
    return () => window.removeEventListener('pattern-locations-changed', handler);
  }, []);

  return { locations, toggleLocation, isLocationEnabled };
}
