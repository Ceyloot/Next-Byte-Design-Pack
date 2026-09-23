import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plakietka } from '@/components/ui/plakietka';
import { ExternalLink } from 'lucide-react';
import { EventTask, UserTaskProgress, useCompleteTask } from '@/hooks/useEventRewards';
import { cn } from '@/lib/utils';

/**
 * Kolory eventu (`theme_color`, `progress_bar_color`) celowo NIE malują już
 * interfejsu — zadania jadą na akcencie motywu, jak cała platforma. Powód:
 * kolor eventu bywa dowolny (zieleń, żółć), a te na części motywów (Smoczy)
 * zlewają się z akcentem albo znikają na jasnym tle. Dwa kolory znaczące:
 * akcent motywu i --destructive.
 */
interface EventTaskListProps {
  eventId: string;
  tasks: EventTask[];
  taskProgress: UserTaskProgress[];
}

const EventTaskList: React.FC<EventTaskListProps> = ({
  eventId,
  tasks,
  taskProgress
}) => {
  const completeTask = useCompleteTask();

  const isTaskCompleted = (taskId: string) => {
    return taskProgress.some(tp => tp.task_id === taskId && tp.status === 'completed');
  };

  const handleToggleTask = async (taskId: string) => {
    const completed = isTaskCompleted(taskId);
    if (!completed) {
      await completeTask.mutateAsync({ eventId, taskId });
    }
  };

  const handleExternalLink = (task: EventTask) => {
    const url = task.verification_url;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getTaskProgress = (task: EventTask) => {
    const progress = taskProgress.find(tp => tp.task_id === task.id);
    if (!progress || !progress.progress_data) return null;

    const data = progress.progress_data as any;
    // Use max progress to preserve progress even after deleting chat history
    const progressValue = data.max || data.current || 0;
    return {
      current: progressValue,
      required: task.required_value || 0,
      percentage: task.required_value ? Math.min(100, Math.round((progressValue / task.required_value) * 100)) : 0
    };
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const completed = isTaskCompleted(task.id);
        const progress = task.task_type === 'auto' ? getTaskProgress(task) : null;

        return (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3 transition-colors duration-200",
              // Ukończone niesie akcent motywu — zieleń (`success`) wypadła,
              // bo na Smoczym zlewa się z pomarańczowym akcentem.
              completed
                ? "border-primary/30 bg-primary/10"
                : "border-border bg-foreground/[0.03] hover:bg-foreground/[0.06]"
            )}
          >
            <Checkbox
              checked={completed}
              onCheckedChange={() => handleToggleTask(task.id)}
              disabled={completed || task.task_type === 'auto'}
              className={cn("mt-1", task.task_type === 'auto' && !completed && "opacity-50")}
            />

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-lg">{task.icon}</span>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    completed ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {task.task_type === 'auto' && !completed && progress && (
                <div className="space-y-1.5 pl-7">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Postęp</span>
                    <span className="font-medium tabular-nums text-primary">
                      {progress.current} / {progress.required}
                    </span>
                  </div>
                  <Progress
                    value={progress.percentage}
                    className="h-2 bg-primary/10"
                  />
                  <div className="flex justify-end">
                    <span className="text-xs font-medium tabular-nums text-primary">
                      {progress.percentage}%
                    </span>
                  </div>
                </div>
              )}

              {task.task_type === 'external' && task.verification_url && !completed && (
                <Button
                  variant="cichy"
                  size="sm"
                  onClick={() => handleExternalLink(task)}
                  className="h-7 text-xs ml-7"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Wykonaj zadanie
                </Button>
              )}
            </div>

            {task.points > 0 && (
              <Plakietka intencja="akcent">+{task.points} XP</Plakietka>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EventTaskList;
