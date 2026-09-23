import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TourStep } from './tourSteps';

interface TourTooltipProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  targetRect: { top: number; left: number; width: number; height: number } | null;
  resolvedPosition: 'top' | 'bottom' | 'left' | 'right';
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  /**
   * Napis na przycisku ostatniego kroku. „Zakończ" mówi, że coś się KOŃCZY —
   * a samouczek panelu kończy się przejściem do Chat AI, więc przycisk ma
   * zapowiadać, co się stanie po kliknięciu. Michał 31.08: „to ostatnie
   * powinno być przycisk, nie zakończ, tylko przejdź do chat ai".
   */
  etykietaOstatniego?: string;
}

export const TourTooltip: React.FC<TourTooltipProps> = ({
  step,
  currentStep,
  totalSteps,
  targetRect,
  resolvedPosition,
  onNext,
  onPrev,
  onSkip,
  etykietaOstatniego = 'Zakończ',
}) => {
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const tooltipStyle = useMemo(() => {
    const vw = window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const isMobileViewport = vw < 640;
    const TOOLTIP_WIDTH = isMobileViewport ? Math.min(vw - 32, 320) : 360;
    const TOOLTIP_HEIGHT_EST = 280;
    const GAP = 14;
    const SAFE_MARGIN = 20;

    /*
      ── DYMEK BEZ CELU MUSI DOSTAĆ PIKSELE, NIE `transform` ────────────────
      Zgłoszenie zespołu: „przy onboarding krok 6 i 7 się ucina".

      Kroki 6 i 7 celują w `onboarding-checklist` i `minichat-assistant` —
      elementy, których na telefonie nie ma. `targetRect` jest wtedy `null`
      i dymek wracał na wyśrodkowanie przez
      `left: 50% + transform: translate(-50%, -50%)`.

      Tylko że ten `transform` NIGDY nie działał: to jest `motion.div`
      z `animate={{ scale: 1 }}`, a Framer Motion pisze do tej samej
      właściwości. Jego `scale` nadpisywał `translate` ze stylu inline,
      więc zostawało samo `left: 50%` — dymek zaczynał się dokładnie
      w połowie ekranu i całą swoją szerokością wychodził poza prawą
      krawędź. Stąd ucięty przycisk „Dalej".

      Naprawa liczy środek w PIKSELACH i nie dotyka `transform`, bo o tę
      właściwość i tak trwa spór z biblioteką animacji. Zaciskanie do
      bezpiecznego marginesu jest to samo, co niżej dla dymków z celem.
    */
    if (!targetRect) {
      const srodek = Math.max(SAFE_MARGIN, (vw - TOOLTIP_WIDTH) / 2);
      return {
        top: `${Math.max(SAFE_MARGIN, (vh - TOOLTIP_HEIGHT_EST) / 2)}px`,
        left: `${srodek}px`,
        width: `${TOOLTIP_WIDTH}px`,
        maxHeight: `${vh - SAFE_MARGIN * 2}px`,
      };
    }

    let top = 0;
    let left = 0;
    let pos = resolvedPosition;

    switch (pos) {
      case 'right':
        top = targetRect.top + targetRect.height / 2 - TOOLTIP_HEIGHT_EST / 2;
        left = targetRect.left + targetRect.width + GAP;
        if (left + TOOLTIP_WIDTH > vw - SAFE_MARGIN) { pos = 'bottom'; }
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - TOOLTIP_HEIGHT_EST / 2;
        left = targetRect.left - TOOLTIP_WIDTH - GAP;
        if (left < SAFE_MARGIN) { pos = 'bottom'; }
        break;
      default:
        break;
    }

    if (pos === 'bottom') {
      top = targetRect.top + targetRect.height + GAP;
      left = isMobileViewport ? (vw - TOOLTIP_WIDTH) / 2 : targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
      if (top + TOOLTIP_HEIGHT_EST > vh - SAFE_MARGIN) {
        pos = 'top';
      }
    }

    if (pos === 'top') {
      top = targetRect.top - TOOLTIP_HEIGHT_EST - GAP;
      left = isMobileViewport ? (vw - TOOLTIP_WIDTH) / 2 : targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
    }

    left = Math.max(SAFE_MARGIN, Math.min(left, vw - TOOLTIP_WIDTH - SAFE_MARGIN));
    top = Math.max(SAFE_MARGIN, Math.min(top, vh - TOOLTIP_HEIGHT_EST - SAFE_MARGIN));

    return { top: `${top}px`, left: `${left}px`, width: `${TOOLTIP_WIDTH}px`, maxHeight: `${vh - SAFE_MARGIN * 2}px` };
  }, [targetRect, resolvedPosition]);

  const isLast = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`tour-tooltip-${currentStep}`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed z-[9995] overflow-y-auto"
        ref={tooltipRef}
        style={tooltipStyle}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative nb-szklo nb-szklo-plynne border border-border/15 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Top glow line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          {/* Header */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Icon container in NextByte style */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm shadow-primary/10">
                <span className="text-sm">{step.icon}</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground tracking-wide">
                {currentStep + 1} / {totalSteps}
              </span>
            </div>
            <button
              onClick={onSkip}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-3">
            <div className="h-0.5 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-4">
            <h3 className="text-base font-semibold text-foreground mb-1.5 tracking-tight">{step.title}</h3>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">{step.description}</p>
          </div>

          {/*
            Actions

            KAŻDY ELEMENT MA POWIEDZIANE, JAK MA USTĄPIĆ — bo napis na ostatnim
            przycisku jest dłuższy niż „Dalej". Michał 31.08: przy „Przejdź do
            Chat AI" przycisk łamał się na dwie linie, „Wstecz" sklejało się
            z kropkami, a stopka rosła w pionie.

            Przyciski `shrink-0` i bez zawijania, kropki jako jedyne elastyczne
            i przycinane. Kropki niosą tę samą informację, co pasek postępu nad
            treścią, więc są najtańszą rzeczą do poświęcenia przy braku miejsca.
          */}
          <div className="px-5 pb-4 flex items-center justify-between gap-3">
            <button
              onClick={onPrev}
              disabled={currentStep === 0}
              className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm text-muted-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              Wstecz
            </button>

            {/* Dot indicators */}
            <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <motion.div
                  key={i}
                  className="shrink-0 rounded-full"
                  animate={{
                    width: i === currentStep ? 8 : 4,
                    height: 4,
                    backgroundColor: i === currentStep ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.25)',
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              ))}
            </div>

            <button
              onClick={onNext}
              className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium px-4 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/40 transition-all duration-200 shadow-sm shadow-primary/10"
            >
              {isLast ? etykietaOstatniego : 'Dalej'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};