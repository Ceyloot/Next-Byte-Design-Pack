import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Rocket, Sparkles, StickyNote, CalendarDays, MessageSquare, Building2,
  Coins, Palette, ChevronRight, ChevronLeft, Play, PartyPopper,
  ImageIcon, Search, MessageCircle
} from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import { MandatoryAccountSetupStep } from './MandatoryAccountSetupStep';

interface WelcomeWizardProps {
  open: boolean;
  onClose: () => void;
  onStartTour: () => void;
  userName: string;
  /** Jeśli true — pokaż obowiązkowy krok ustawienia hasła i zablokuj zamykanie. */
  requiresPasswordSetup?: boolean;
  /** Wywołane po pomyślnym zapisaniu danych w obowiązkowym kroku. */
  onPasswordSetupComplete?: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
    scale: 0.95,
  }),
};

const features = [
  { icon: Sparkles, label: 'Asystent AI', tag: 'Asystent' },
  { icon: StickyNote, label: 'Notatki', tag: 'Edytor' },
  { icon: CalendarDays, label: 'Planer', tag: 'Kalendarz' },
  { icon: MessageSquare, label: 'Chat AI', tag: 'Modele AI' },
  { icon: Building2, label: 'Firma', tag: 'Zarządzanie' },
  { icon: Palette, label: 'Personalizacja', tag: 'Motywy' },
];

export const WelcomeWizard: React.FC<WelcomeWizardProps> = ({
  open,
  onClose,
  onStartTour,
  userName,
  requiresPasswordSetup = false,
  onPasswordSetupComplete,
}) => {
  // Krok 0 to obowiązkowy formularz (jeśli wymagany), potem zwykły flow
  const [step, setStep] = useState(requiresPasswordSetup ? 0 : 0);
  const [direction, setDirection] = useState(0);
  const [setupCompleted, setSetupCompleted] = useState(!requiresPasswordSetup);

  // Sync z zewnętrznym wymogiem
  useEffect(() => {
    if (requiresPasswordSetup) {
      setSetupCompleted(false);
      setStep(0);
    } else {
      setSetupCompleted(true);
    }
  }, [requiresPasswordSetup]);

  // Czy wyświetlić obowiązkowy krok jako pierwszy slajd
  const hasMandatoryStep = requiresPasswordSetup;
  // Total = mandatory (jeśli jest, ale tylko dopóki nie wypełniony) + 4 zwykłe karty
  const baseTotal = 4;
  const totalSteps = hasMandatoryStep && !setupCompleted ? baseTotal + 1 : baseTotal;

  // Czy aktualnie pokazywany jest blokujący krok
  const isOnMandatoryStep = hasMandatoryStep && !setupCompleted && step === 0;

  const goNext = () => {
    if (isOnMandatoryStep) return; // nie można pominąć
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const goPrev = () => {
    // Nie pozwól wrócić na obowiązkowy krok po wypełnieniu
    if (step > (hasMandatoryStep && setupCompleted ? 1 : 0)) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const handleMandatorySuccess = () => {
    setSetupCompleted(true);
    setDirection(1);
    setStep(1); // przejdź do pierwszej zwykłej karty (Welcome)
    onPasswordSetupComplete?.();
  };

  const handleStartTour = () => {
    if (!isOnMandatoryStep) {
      onClose();
      setTimeout(onStartTour, 400);
    }
  };

  const baseSteps = [
    // Step 0: Welcome
    <motion.div key="welcome" className="flex flex-col items-center justify-center text-center py-8 px-4 h-full">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative w-24 h-24 mb-8"
      >
        <div className="absolute inset-0 bg-primary/15 rounded-full blur-xl scale-150" />
        <div className="nb-szklo nb-szklo-plynne nb-kafelek relative w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-primary/10">
          <Rocket className="w-12 h-12 text-primary" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl md:text-4xl font-bold text-foreground mb-3"
      >
        Witaj, {userName}! 👋
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground text-lg mb-6 max-w-md"
      >
        Cieszymy się, że jesteś z nami. Pozwól, że pokażemy Ci najważniejsze funkcje platformy.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-2"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/40"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </motion.div>
    </motion.div>,

    // Step 1: Features — login panel style cards
    <motion.div key="features" className="flex h-full flex-col items-center justify-center overflow-hidden px-4 py-2 text-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-0.5"
      >
        <span className="text-primary/60 uppercase tracking-[0.2em] text-xs font-semibold">
          Ekosystem AI · Produktywność
        </span>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-xl sm:text-2xl font-bold text-foreground mb-1"
      >
        Twoje narzędzia
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-sm mb-3 sm:mb-4 max-w-sm"
      >
        Wszystko, czego potrzebujesz, w jednym miejscu
      </motion.p>

      <div className="flex w-full max-w-sm flex-col gap-1.5 sm:gap-2">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
            className="group flex items-center gap-3 rounded-xl border border-border/15 bg-card/20 px-3.5 py-2.5 transition-all duration-300 hover:border-primary/30 sm:px-4"
          >
            <div className="flex h-8 w-8 min-w-8 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm shadow-primary/10 transition-all duration-300 group-hover:from-primary/25 group-hover:to-primary/10 sm:h-9 sm:w-9 sm:min-w-9">
              <f.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-foreground">{f.label}</span>
            <span className="text-xs font-medium text-primary/60">{f.tag}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>,

    // Step 2: Byte System — bento tiles
    <motion.div key="bytes" className="flex flex-col items-center justify-center text-center py-6 px-4 h-full">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative w-16 h-16 mb-4"
      >
        <div className="absolute inset-0 bg-primary/15 rounded-full blur-xl scale-150" />
        <div className="nb-szklo nb-szklo-plynne nb-kafelek relative w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-primary/10">
          <Coins className="w-8 h-8 text-primary" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-foreground mb-1"
      >
        <span className="text-primary">
          <NumberFlow value={1000} trend={1} />
        </span>{' '}
        Byte
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-md mb-5 leading-relaxed text-sm"
      >
        Byte'y napędzają AI na platformie. Oto co możesz z nimi zrobić:
      </motion.p>

      {/* Bento tiles */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
        {[
          { icon: MessageCircle, label: 'Chat AI', value: '∞', unit: 'wiadomości', sub: 'tryb Fast — darmowy', delay: 0.35 },
          { icon: Sparkles, label: 'Chat Pro', value: '1000', unit: 'wiadomości', sub: '1 Byte / wiadomość', delay: 0.4 },
          { icon: ImageIcon, label: 'Obrazy AI', value: '250', unit: 'generacji', sub: '4 Byte / obraz', delay: 0.45 },
          { icon: Search, label: 'Deep Research', value: '142', unit: 'raportów', sub: '14 Byte / raport', delay: 0.5 },
        ].map((tile) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: tile.delay, type: 'spring', stiffness: 280, damping: 22 }}
            className="group rounded-xl border border-border/15 nb-szklo p-4 text-left hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 min-w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                <tile.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{tile.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl font-bold text-foreground tabular-nums">{tile.value}</span>
              <span className="text-xs text-muted-foreground">{tile.unit}</span>
            </div>
            <span className="text-[11px] text-primary/60">{tile.sub}</span>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="text-muted-foreground text-[11px] mt-4 max-w-sm leading-relaxed"
      >
        Zdobywaj więcej Byte z subskrypcji, osiągnięć lub dokupuj w sklepie.
      </motion.p>
    </motion.div>,

    // Step 3: Ready!
    <motion.div key="ready" className="flex flex-col items-center justify-center text-center py-6 px-4 h-full">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="relative w-24 h-24 mb-8"
      >
        <div className="absolute inset-0 bg-green-500/15 rounded-full blur-xl scale-150" />
        <div className="nb-szklo nb-szklo-plynne nb-kafelek relative w-full h-full rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 flex items-center justify-center shadow-green-500/10">
          <PartyPopper className="w-12 h-12 text-green-400" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-foreground mb-3"
      >
        Gotowe! 🎉
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-md mb-8"
      >
        Możesz teraz przejść interaktywny tour po interfejsie, albo od razu zacząć korzystać z platformy.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
      >
        <button
          onClick={handleStartTour}
          className="flex-1 h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary font-semibold text-base hover:bg-primary/20 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Rozpocznij prezentację
        </button>
        <Button
          variant="outline"
          onClick={onClose}
          className="px-8 h-12 text-base"
        >
          Pomiń
        </Button>
      </motion.div>
    </motion.div>,
  ];

  // Buduj listę slajdów: jeśli mandatory wciąż aktywny, jest pierwszy
  const steps = hasMandatoryStep && !setupCompleted
    ? [
        <MandatoryAccountSetupStep key="mandatory" onSuccess={handleMandatorySuccess} />,
        ...baseSteps,
      ]
    : baseSteps;

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      // Blokada zamykania w trybie obowiązkowym
      if (isOnMandatoryStep) return;
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        onOpenAutoFocus={e => e.preventDefault()}
        onPointerDownOutside={(e) => { if (isOnMandatoryStep) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (isOnMandatoryStep) e.preventDefault(); }}
        onInteractOutside={(e) => { if (isOnMandatoryStep) e.preventDefault(); }}
        className={cn(
          "flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-2xl flex-col gap-0 overflow-hidden bg-card/30 p-0 shadow-2xl shadow-primary/5 border-border/15 sm:w-full",
          isOnMandatoryStep && "[&>button]:hidden"
        )}
      >
        {/* Progress */}
        <div className="shrink-0 px-5 pb-2 pr-12 pt-4 sm:px-6 sm:pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              Krok {step + 1} z {totalSteps}
            </span>
            <span className="text-xs text-primary font-semibold">
              {Math.round(((step + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-muted/20 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Animated step content */}
        <div className="relative min-h-0 flex-1 overflow-hidden h-[min(520px,calc(100dvh-150px))]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-full min-h-0"
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation — ukryta na obowiązkowym kroku */}
        {!isOnMandatoryStep && (
          <div className="flex shrink-0 items-center justify-between px-5 pb-4 sm:px-6 sm:pb-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={goPrev}
              disabled={step === (hasMandatoryStep && setupCompleted ? 1 : 0)}
              className="text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Wstecz
            </Button>

            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  animate={{
                    backgroundColor: i === step ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                    scale: i === step ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>

            {step < totalSteps - 1 ? (
              <Button size="sm" onClick={goNext}>
                Dalej
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <div className="w-[85px]" />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
