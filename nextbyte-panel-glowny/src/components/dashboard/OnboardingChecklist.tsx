import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronDown, ChevronUp, Smartphone, Bell, Rocket, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tile, TileHeader, TileAction } from '@/components/ui/tile';
import { useOnboardingTasks, OnboardingTask } from '@/hooks/useOnboardingTasks';
import { OnboardingTaskPopup } from './OnboardingTaskPopup';
import { useOptionalOnboarding } from '@/contexts/OnboardingContext';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<any>> = {
  Smartphone, Bell, CheckCircle,
};

export const OnboardingChecklist: React.FC = () => {
  const { tasks, completedTaskIds, completedCount, totalCount, allCompleted, isLoading, completeTask } = useOnboardingTasks();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);
  const onboarding = useOptionalOnboarding();

  if (isLoading || totalCount === 0) return null;

  return (
    <AnimatePresence>
      {!allCompleted && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
          className="overflow-hidden"
        >
          <Tile>
            <TileHeader
              ikona={Rocket}
              tytul="Rozpocznij przygodę"
              podtytul={`${completedCount}/${totalCount} ukończonych`}
              poPrawej={
                <span className="flex items-center gap-1.5">
                  {onboarding && (
                    <Button
                      variant="obwodka"
                      size="sm"
                      onClick={() => onboarding.startTour()}
                      className="h-7 gap-1.5 px-2.5 text-xs"
                    >
                      <Play className="h-3 w-3" />
                      Tour
                    </Button>
                  )}
                  <TileAction
                    rodzaj="cicha"
                    samaIkona
                    ikona={collapsed ? ChevronDown : ChevronUp}
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? 'Rozwiń listę zadań' : 'Zwiń listę zadań'}
                    className="h-7 w-7"
                  />
                </span>
              }
            />

            {/* Progress bar */}
            <div className="mb-3">
              <Progress value={(completedCount / totalCount) * 100} className="h-1.5 bg-foreground/[0.06]" indicatorColor="hsl(var(--primary))" />
            </div>

            {/* Task list */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {tasks.map((task) => {
                    const done = completedTaskIds.has(task.id);
                    const Icon = iconMap[task.icon_name] || CheckCircle;
                    return (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200",
                          "border border-border bg-background/40 hover:border-primary/40 hover:bg-foreground/[0.06]",
                          done && "opacity-60"
                        )}
                      >
                        {/* Ukończone = akcent motywu, nie zieleń — na Smoczym
                            zieleń zlewa się z pomarańczowym akcentem. */}
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors">
                          {done ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <Icon className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className={cn(
                            "block text-sm font-medium",
                            done ? "text-muted-foreground line-through" : "text-card-foreground"
                          )}>
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="line-clamp-1 text-xs text-muted-foreground">{task.description}</span>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 flex-shrink-0 -rotate-90 text-muted-foreground transition-colors group-hover:text-foreground" />
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </Tile>

          {/* Task popup */}
          {selectedTask && (
            <OnboardingTaskPopup
              task={selectedTask}
              open={!!selectedTask}
              onOpenChange={(open) => !open && setSelectedTask(null)}
              isCompleted={completedTaskIds.has(selectedTask.id)}
              onComplete={() => completeTask.mutate(selectedTask.id)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
