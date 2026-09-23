import React from 'react';
import { useProfilePatterns } from '@/hooks/useProfilePatterns';
import { usePatternLocations, type PatternLocationKey } from '@/hooks/usePatternLocations';
import { useAuthId } from '@/hooks/useAuth';

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
  const { isLocationEnabled } = usePatternLocations();

  const maWlasnyWzor = !!activePattern && isLocationEnabled(location);
  if (maWlasnyWzor) return null;

  /*
    KRYCIE 0,055 ZAMIAST 0,028 (26.08, Michał: „podbij opacity grida",
    „daj jakąś teksturę tła, by glassmorphizm był widoczny").

    To nie jest kwestia gustu. `backdrop-filter` rozmywa TO, CO JEST POD
    SPODEM — na jednolitej czerni nie ma czego rozmywać, więc szklana karta
    wygląda jak zwykły ciemny prostokąt z obwódką. Cała praca włożona
    w materiał szkła jest niewidoczna, dopóki tło nie ma faktury.

    0,028 na tle o jasności 9 dawało linie o różnicy poniżej jednego poziomu
    ósmego bitu — czyli siatkę, której technicznie nie da się zobaczyć.
    Podwojenie stawia ją tuż nad progiem: widać ją pod szkłem i przy
    krawędziach kart, a na pustym tle wciąż się nie narzuca.

    Maska sięga teraz 62 % zamiast 44 %: siatka urywała się tuż pod górnym
    pasem, więc karty niżej stały znowu na jednolitej czerni.
  */
  const linia = 'hsl(var(--foreground) / 0.055)';
  const maska = 'radial-gradient(ellipse 96% 62% at 50% 0%, #000 34%, transparent 100%)';

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
