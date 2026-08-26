import React from 'react';
import { useProfilePatterns } from '../../hooks/useProfilePatterns';
import { useProfileBackgrounds } from '../../hooks/useProfileBackgrounds';
import { usePatternLocations, type PatternLocationKey } from '../../hooks/usePatternLocations';
import { useAuthId } from '../../hooks/useAuth';

/**
 * Techgrid — delikatna siatka w tle, ale TYLKO gdy użytkownik nie ustawił
 * własnego wyglądu.
 *
 * Sedno: platforma sprzedaje wzory i tła. `PatternOverlay` już rysuje wzór
 * użytkownika, a tło obrazkowe może być pod nim. Dorysowanie techgridu na
 * sztywno dałoby trzy warstwy naraz i zabrudziło rzecz, za którą ktoś zapłacił
 * Byte. Dlatego techgrid ustępuje: jest wyłącznie tłem domyślnym.
 *
 * Ustępuje gdy:
 *   • użytkownik ma aktywny wzór ORAZ ten wzór jest włączony w tym miejscu,
 *   • albo ma ustawione tło obrazkowe.
 *
 * Rysowany wyłącznie na `currentColor` z alfą, więc jest neutralny wobec
 * wszystkich 14 motywów — nie wnosi własnego koloru, tylko lekko rozjaśnia
 * albo przyciemnia to, co jest pod nim, zależnie od jasności motywu.
 */

interface TechGridProps {
  location: PatternLocationKey;
  /** Rozmiar oczka siatki w px. */
  oczko?: number;
  className?: string;
}

export const TechGrid: React.FC<TechGridProps> = ({ location, oczko = 44, className }) => {
  const userId = useAuthId();
  const { activePattern } = useProfilePatterns(userId || undefined);
  const { activeBackground } = useProfileBackgrounds(userId || undefined);
  const { isLocationEnabled } = usePatternLocations();

  const maWlasnyWzor = !!activePattern && isLocationEnabled(location);
  const maWlasneTlo = !!(activeBackground as any)?.background?.background_url;
  if (maWlasnyWzor || maWlasneTlo) return null;

  const linia = 'hsl(var(--foreground) / 0.028)';
  // Maska wygasza siatkę poniżej pierwszego ekranu treści — siatka ma dawać
  // głębię u góry, nie tapetować całą stronę.
  const maska = 'radial-gradient(ellipse 80% 44% at 50% 0%, #000 30%, transparent 100%)';

  return (
    <div
      aria-hidden
      className={className || 'pointer-events-none absolute inset-0 z-0'}
      style={{
        backgroundImage:
          `linear-gradient(${linia} 1px, transparent 1px),` +
          `linear-gradient(90deg, ${linia} 1px, transparent 1px)`,
        backgroundSize: `${oczko}px ${oczko}px`,
        WebkitMaskImage: maska,
        maskImage: maska,
      }}
    />
  );
};

export default TechGrid;
