import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { tourSteps, TourStep } from './tourSteps';
import { useIsMobile } from '@/hooks/use-mobile';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const useTour = () => {
  const isMobile = useIsMobile();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number>(0);

  // Filter steps for mobile
  const activeSteps = useMemo(() => {
    if (!isMobile) return tourSteps;
    return tourSteps.filter(s => !s.hideOnMobile);
  }, [isMobile]);

  const step = activeSteps[currentStep] as TourStep | undefined;

  const getSelector = useCallback((s: TourStep) => {
    if (isMobile && s.mobileTarget) return s.mobileTarget;
    return s.target;
  }, [isMobile]);

  const getPosition = useCallback((s: TourStep) => {
    if (isMobile && s.mobilePosition) return s.mobilePosition;
    return s.position;
  }, [isMobile]);

  const updateRect = useCallback(() => {
    if (!step) return;
    const selector = getSelector(step);
    const el = document.querySelector(selector);
    if (!el) {
      setTargetRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const pad = step.spotlightPadding ?? 8;
    setTargetRect({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });
  }, [step, getSelector]);

  useEffect(() => {
    if (!isActive || !step) return;

    const selector = getSelector(step);
    const el = document.querySelector(selector);
    let pominiecie: ReturnType<typeof setTimeout> | undefined;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(updateRect, 350);
    } else {
      /*
        KROK BEZ CELU JEST POMIJANY — wcześniej komentarz mówił „skip to next",
        a kod ustawiał tylko `targetRect(null)` i szedł dalej. Dymek pojawiał
        się wtedy na środku ekranu i opowiadał o elemencie, którego nie da się
        wskazać, bo go nie ma. Na telefonie tak wyglądały kroki 6 i 7.

        Sekunda zwłoki, bo brak elementu nie znaczy jeszcze „nie istnieje":
        panel dociąga widżety leniwie, a lista zadań startowych pojawia się
        dopiero po odpowiedzi z bazy. Pomijamy dopiero wtedy, gdy po tym
        czasie nadal go nie ma.
      */
      setTargetRect(null);
      pominiecie = setTimeout(() => {
        if (document.querySelector(selector)) {
          updateRect();
        } else {
          setCurrentStep((i) => (i < activeSteps.length - 1 ? i + 1 : i));
        }
      }, 1000);
    }

    observerRef.current = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRect);
    });

    if (el) observerRef.current.observe(el);

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRect);
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      observerRef.current?.disconnect();
      cancelAnimationFrame(rafRef.current);
      /* Bez tego zwłoka na pominięcie przeżywa zmianę kroku i przeskakuje
         użytkownika o jeden dalej już PO tym, jak sam kliknął „Dalej". */
      if (pominiecie) clearTimeout(pominiecie);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isActive, step, updateRect, getSelector, activeSteps.length]);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const next = useCallback(() => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsActive(false);
    }
  }, [currentStep, activeSteps.length]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    currentStep,
    totalSteps: activeSteps.length,
    step,
    targetRect,
    start,
    next,
    prev,
    skip,
    getPosition,
  };
};
