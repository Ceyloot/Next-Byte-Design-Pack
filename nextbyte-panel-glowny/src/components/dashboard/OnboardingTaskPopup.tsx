import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NextByteModal } from '@/components/ui/nextbyte-modal';
import { Button } from '@/components/ui/button';
import { CheckCircle, Smartphone, Bell } from 'lucide-react';
import { OnboardingTask, OnboardingStep } from '@/hooks/useOnboardingTasks';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<any>> = {
  Smartphone, Bell, CheckCircle,
};

interface OnboardingTaskPopupProps {
  task: OnboardingTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCompleted: boolean;
  onComplete: () => void;
}

export const OnboardingTaskPopup: React.FC<OnboardingTaskPopupProps> = ({
  task, open, onOpenChange, isCompleted, onComplete,
}) => {
  const hasPlatformSteps = task.instruction_steps.some(s => s.platform === 'ios' || s.platform === 'android');
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');

  const filteredSteps = task.instruction_steps.filter(step => {
    if (!hasPlatformSteps) return true;
    return step.platform === 'all' || step.platform === platform;
  });

  const Icon = iconMap[task.icon_name] || CheckCircle;

  return (
    <NextByteModal
      open={open}
      onOpenChange={onOpenChange}
      title={task.instruction_title}
      description={task.description || undefined}
      icon={<Icon className="w-6 h-6 text-foreground" />}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Platform tabs */}
        {hasPlatformSteps && (
          <div className="flex w-fit gap-1 rounded-xl border border-border bg-background/40 p-1">
            {(['ios', 'android'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm transition-all",
                  platform === p
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {p === 'ios' ? 'iOS (Safari)' : 'Android (Chrome)'}
              </button>
            ))}
          </div>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={platform}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {filteredSteps.map((step, i) => (
              <motion.div
                key={`${step.num}-${i}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 30 }}
                className="nb-szklo nb-szklo-plynne rounded-2xl border border-border bg-background/40 p-5 transition-colors duration-300 hover:border-primary/25 md:p-6"
              >
                <div
                  className="mb-3 select-none font-heading text-[2.5rem] font-extralight leading-none text-transparent md:text-[3rem]"
                  // Kontur numeru liczony od --foreground, nie z zaszytej bieli —
                  // na jasnych motywach biel na bieli znikała bez śladu.
                  style={{ WebkitTextStroke: '1px hsl(var(--foreground) / 0.15)' }}
                >
                  {step.num}
                </div>
                <h3 className="mb-2 font-heading text-lg font-light tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Complete button */}
        <div className="pt-2">
          {isCompleted ? (
            // Ukończenie mówi akcentem motywu — zieleń zlewa się z akcentem
            // na Smoczym, a trzeci kolor nic tu nie dodaje.
            <div className="flex items-center justify-center gap-2 py-3 text-primary">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Zadanie ukończone!</span>
            </div>
          ) : (
            <Button
              variant="glass"
              className="w-full"
              onClick={() => {
                onComplete();
                onOpenChange(false);
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Zrobione!
            </Button>
          )}
        </div>
      </div>
    </NextByteModal>
  );
};
