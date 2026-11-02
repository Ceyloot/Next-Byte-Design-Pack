import React from 'react';
import { useProfilePatterns } from '@/hooks/useProfilePatterns';
import { usePatternLocations, type PatternLocationKey } from '@/hooks/usePatternLocations';
import { PatternBackground, WarstwaWzoru } from '@/components/ui/background-patterns';
import { useAuthId } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTloZakladki } from '@/contexts/TloZakladkiContext';

interface PatternOverlayProps {
  location: PatternLocationKey;
  className?: string;
}

/*
  DWA TRYBY (07.09.2026):
   • z `className` — rysuje się W MIEJSCU (tak używają go strony, które same
     składają tło i oddają je powłoce przez `useTloZakladki`);
   • bez `className` — NIE rysuje nic w miejscu, tylko rejestruje wzór w tle
     POWŁOKI (slot „wzor"). Wcześniejszy `fixed inset-0` teoretycznie
     obejmował cały ekran, ale przodek z `transform`/`filter` robi z niego
     pozycję względem treści — i wzór kończył się na krawędzi treści,
     a pod pastylką paska stało gołe tło (Michał: „tło zakładek nie wchodzi
     pod pasek boczny"). Tło rysowane przez powłokę nie ma tego problemu.
*/
export const PatternOverlay: React.FC<PatternOverlayProps> = ({ location, className }) => {
  const userId = useAuthId();
  const isMobile = useIsMobile();
  const { activePattern } = useProfilePatterns(userId || undefined);
  const { isLocationEnabled } = usePatternLocations();
  const aktywny = !!activePattern && isLocationEnabled(location);

  const wzor = React.useMemo(() => {
    if (!aktywny || !activePattern) return null;
    /* W powłoce wzór obejmuje CAŁY ekran — winieta zamiast zanikania do zera,
       patrz `WarstwaWzoru` w `background-patterns.tsx`. */
    return <WarstwaWzoru wzor={activePattern} className={isMobile ? 'top-[48px]' : undefined} />;
  }, [aktywny, activePattern, isMobile]);

  /* Rejestracja w powłoce tylko w trybie bez `className`; `null` zdejmuje wzór. */
  useTloZakladki(className ? null : wzor, 'wzor');

  if (!className || !aktywny || !activePattern) return null;
  return (
    <div className={className}>
      <PatternBackground
        pattern_type={activePattern.pattern_type as any}
        pattern_color={activePattern.pattern_color}
        pattern_size={activePattern.pattern_size}
        pattern_opacity={activePattern.pattern_opacity}
        background_color={activePattern.background_color}
        fade={activePattern.fade}
      />
    </div>
  );
};
