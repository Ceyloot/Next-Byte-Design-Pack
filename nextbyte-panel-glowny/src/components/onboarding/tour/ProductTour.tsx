import React from 'react';
import { TourOverlay } from './TourOverlay';
import { TourTooltip } from './TourTooltip';
import { useTour } from './useTour';

interface ProductTourProps {
  isActive: boolean;
  onComplete: () => void;
  /** Napis na przycisku ostatniego kroku — patrz `TourTooltip`. */
  etykietaOstatniego?: string;
  /** Osobna ścieżka dla „Pomiń" — pomiar lejka musi odróżniać skip od ukończenia.
      Bez przekazania spada do onComplete (zachowanie sprzed lejka). */
  onSkip?: () => void;
  tourControls: ReturnType<typeof useTour>;
}

export const ProductTour: React.FC<ProductTourProps> = ({ isActive, onComplete, onSkip, tourControls, etykietaOstatniego }) => {
  const { step, currentStep, totalSteps, targetRect, next, prev, skip, getPosition } = tourControls;

  if (!isActive || !step) return null;

  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      onComplete();
    } else {
      next();
    }
  };

  const handleSkip = () => {
    skip();
    (onSkip ?? onComplete)();
  };

  return (
    <>
      <TourOverlay
        isActive={isActive}
        targetRect={targetRect}
        onClickOverlay={() => {}} // Don't skip on overlay click
      />
      <TourTooltip
        step={step}
        currentStep={currentStep}
        totalSteps={totalSteps}
        targetRect={targetRect}
        resolvedPosition={getPosition(step)}
        onNext={handleNext}
        onPrev={prev}
        onSkip={handleSkip}
        etykietaOstatniego={etykietaOstatniego}
      />
    </>
  );
};
