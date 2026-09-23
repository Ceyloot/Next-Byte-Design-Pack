import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tile, TileHeader } from '@/components/ui/tile';
import { Szkielet } from '@/components/ui/stany';
import { Plakietka } from '@/components/ui/plakietka';
import { Progress } from '@/components/ui/progress';
import { Clock, Gift, CheckCircle2, Loader2 } from 'lucide-react';
import { KafelkiNagrod, type NagrodaZeSzczegolami } from './KafelkiNagrod';
import {
  useEventDetails,
  useEventRewardsWithDetails,
  useEventTasks,
  useUserEventProgress,
  useUserTaskProgress,
  useCanClaimRewards,
  useStartEvent,
  useClaimEventRewards
} from '@/hooks/useEventRewards';
import { useAutoTaskTracking } from '@/hooks/useAutoTaskTracking';
import EventTaskList from './EventTaskList';
import { RewardCelebration } from '@/components/animations/RewardCelebration';
import { AvatarDecorationRewardPreview } from './AvatarDecorationRewardPreview';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface EventRewardPanelProps {
  eventId: string;
}

/**
 * Kolory eventu z bazy (`theme_color`, `secondary_color`) nie malują już ram,
 * pasków ani przycisków — panel mówi akcentem motywu jak reszta Panelu
 * Głównego. Kolory z danych zostają wyłącznie tam, gdzie SĄ treścią:
 * w miniaturze nagrody typu „motyw kolorów".
 */
const EventRewardPanel: React.FC<EventRewardPanelProps> = ({ eventId }) => {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: event, isLoading: eventLoading } = useEventDetails(eventId);
  const { data: rewards, isLoading: rewardsLoading } = useEventRewardsWithDetails(eventId);
  const { data: tasks } = useEventTasks(eventId);
  const { data: progress } = useUserEventProgress(eventId);
  const { data: taskProgress } = useUserTaskProgress(eventId);
  const canClaim = useCanClaimRewards(eventId);

  const startEvent = useStartEvent();
  const claimRewards = useClaimEventRewards();

  const isCompleted = progress?.status === 'completed';
  const hasStarted = progress !== null && progress?.status !== 'not_started';

  // Auto-track progress for automatic tasks (must be before early return)
  useAutoTaskTracking(eventId, tasks, hasStarted);

  // Realtime updates for task progress
  useEffect(() => {
    const channel = supabase
      .channel(`event-task-progress-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_event_task_progress',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('🔄 Realtime update - user_event_task_progress:', payload);
          queryClient.invalidateQueries({ queryKey: ['user-task-progress', eventId] });
          queryClient.invalidateQueries({ queryKey: ['user-event-progress', eventId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_event_progress',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('🔄 Realtime update - user_event_progress:', payload);
          queryClient.invalidateQueries({ queryKey: ['user-event-progress', eventId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);

  if (eventLoading || rewardsLoading || !event) {
    return (
      <Tile>
        <Szkielet wierszy={2} />
        <Szkielet wierszy={1} ksztalt="blok" className="mt-4" />
      </Tile>
    );
  }

  const isTaskBased = event.claim_mode === 'task_based';
  const requiredTasks = tasks?.filter(t => t.is_required) || [];
  const completedTasks = taskProgress?.filter(tp => tp.status === 'completed') || [];
  const completedCount = completedTasks.length;
  const totalRequired = requiredTasks.length;
  const progressPercent = totalRequired > 0 ? (completedCount / totalRequired) * 100 : 100;

  const handleStart = async () => {
    await startEvent.mutateAsync(eventId);
  };

  const handleClaim = async () => {
    await claimRewards.mutateAsync(eventId);
    setShowSuccessDialog(true);
  };

  // Calculate time remaining for limited events
  const getTimeRemaining = () => {
    if (!event.end_date) return null;
    const now = new Date();
    const end = new Date(event.end_date);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Zakończone';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} dni`;
    return `${hours} godzin`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <>
      <Tile intencja="akcent">
        <TileHeader
          tytul={
            <>
              {event.icon && <span aria-hidden className="mr-1.5">{event.icon}</span>}
              {event.display_name}
            </>
          }
          podtytul={event.description || undefined}
          poPrawej={
            <span className="flex flex-col items-end gap-1.5">
              {/* Termin = język --destructive, jak wszędzie na Panelu. */}
              {event.event_type === 'limited_time' && timeRemaining && (
                <Plakietka intencja="krytyczna" ikona={Clock}>
                  {timeRemaining}
                </Plakietka>
              )}
              {isCompleted && (
                <Plakietka intencja="akcent" ikona={CheckCircle2}>
                  Ukończone
                </Plakietka>
              )}
            </span>
          }
        />

        <div className="space-y-5">
          {/* Progress for task-based events - only visible after starting */}
          {isTaskBased && hasStarted && !isCompleted && (
            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Postęp zadań
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Ukończono:
                  </span>
                  <span className="text-sm font-bold tabular-nums text-primary">
                    {completedCount} / {totalRequired}
                  </span>
                </div>
              </div>
              <Progress
                value={progressPercent}
                className="h-2.5 bg-primary/10"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {totalRequired - completedCount === 0
                    ? '✅ Wszystkie wymagane zadania ukończone!'
                    : `Pozostało ${totalRequired - completedCount} ${totalRequired - completedCount === 1 ? 'zadanie' : 'zadań'}`
                  }
                </p>
                <span className="text-xs font-medium tabular-nums text-primary">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
          )}

          {/* Tasks list - only visible after starting */}
          {isTaskBased && hasStarted && !isCompleted && tasks && tasks.length > 0 && (
            <EventTaskList
              eventId={eventId}
              tasks={tasks}
              taskProgress={taskProgress || []}
            />
          )}

          {/* Message when not started yet */}
          {isTaskBased && !hasStarted && !isCompleted && (
            <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Kliknij przycisk poniżej, aby rozpocząć event i zobaczyć zadania do wykonania
              </p>
            </div>
          )}

          {/* Rewards preview */}
          {rewards && rewards.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Gift className="w-4 h-4 text-primary" />
                {isCompleted ? 'Odebrane nagrody' : 'Dostępne nagrody'}
              </div>
              {/* JEDNA KOLUMNA CZYTELNYCH KAFELKÓW zamiast siatki 3–5 kolumn.
                  Zmierzone 03.08.2026: panel rozwija się w kolumnie Panelu
                  Głównego (392 px), więc pięć kolumn dawało kafelek ~70 px —
                  nazwa ucinała się do „Beta…", a cała informacja o nagrodzie
                  sprowadzała się do jednego słowa („Przypinka", „Tło").
                  Do tego odznaki trzymają w `icon_url` EMOJI, nie adres,
                  przez co połowa podglądów była ikoną złamanego pliku.
                  Wspólny komponent: `KafelkiNagrod.tsx` — ten sam wygląd
                  tutaj i na karcie eventu, jedno miejsce na poprawki. */}
              <KafelkiNagrod
                nagrody={rewards as NagrodaZeSzczegolami[]}
                odblokowane={isCompleted}
              />
            </div>
          )}

          {/* Action button */}
          {!isCompleted && !hasStarted && (
            <Button
              onClick={handleStart}
              disabled={startEvent.isPending}
              variant="glass"
              size="lg"
              className="w-full"
            >
              {startEvent.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Dołączam...
                </>
              ) : (
                <>🎯 Dołączam Do Wydarzenia</>
              )}
            </Button>
          )}

          {/* Claim button */}
          {!isCompleted && hasStarted && (
            <Button
              onClick={handleClaim}
              disabled={!canClaim || claimRewards.isPending}
              variant="glass"
              size="lg"
              className="w-full"
            >
              {claimRewards.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Odbieranie...
                </>
              ) : isTaskBased && !canClaim ? (
                <>🔒 Ukończ wszystkie zadania</>
              ) : (
                <>✨ Odbierz nagrody</>
              )}
            </Button>
          )}
        </div>
      </Tile>

      <RewardCelebration
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        rewards={rewards?.map((r: any) => ({
          type: r.reward_type,
          name: r.details?.name || 'Nagroda',
          imageUrl: r.reward_type === 'badge'
            ? r.details?.icon_url
            : r.reward_type === 'avatar_decoration'
            ? r.details?.decoration_url // Use decoration_url for avatar decorations
            : r.details?.preview_url || r.details?.background_url,
          rarity: r.details?.rarity || r.details?.color_theme
        })) || []}
        title="🎉 Gratulacje ukończenia eventu!"
      />
    </>
  );
};

export default EventRewardPanel;
