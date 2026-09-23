import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Building2, CalendarPlus, Check, Clock, FileEdit, FolderOpen, Inbox, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tile, TileHeader, klasyKafelka } from '@/components/ui/tile';
import { Plakietka } from '@/components/ui/plakietka';
import { usePendingDashboardActions, PendingDashboardActionType } from '@/hooks/usePendingDashboardActions';
import { toast } from 'sonner';

const actionIcons: Record<PendingDashboardActionType, React.ElementType> = {
  company_invite: Building2,
  calendar_share: CalendarPlus,
  note_share: FileEdit,
  folder_share: FolderOpen,
};

export const PendingDashboardActionsCard = () => {
  const navigate = useNavigate();
  const { actions, isLoading, resolveAction } = usePendingDashboardActions();

  if (isLoading || actions.length === 0) return null;

  const handleResolve = async (e: React.MouseEvent, action: typeof actions[number], decision: 'accept' | 'reject') => {
    e.stopPropagation();
    try {
      await resolveAction.mutateAsync({ action, decision });
      toast.success(decision === 'accept' ? 'Zaakceptowano' : 'Odrzucono');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Nie udało się przetworzyć akcji');
    }
  };

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {/* Wcześniej karta miała własny chrome: ręczny cień w nawiasach, stary
          przepis szkła (`nb-szklo`) i gradient z inline style. Teraz
          chrome niesie wspólny kafelek — intencja `akcent`, bo cała karta jest
          wezwaniem do reakcji. */}
      <Tile intencja="akcent">
        <TileHeader
          ikona={Inbox}
          tytul="Do akceptacji"
          podtytul="Zaproszenia, udostępnienia i decyzje wymagające reakcji"
          poPrawej={
            <Plakietka intencja="akcent">
              {actions.length} {actions.length === 1 ? 'oczekuje' : 'oczekują'}
            </Plakietka>
          }
        />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {actions.slice(0, 6).map((action) => {
            const Icon = actionIcons[action.type];
            const isBusy = resolveAction.isPending && resolveAction.variables?.action.id === action.id;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => navigate(action.route)}
                className={cn(
                  klasyKafelka({ interaktywny: true, zwarty: true }),
                  'group w-full text-left',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Plakietka intencja="neutralna">{action.sourceLabel}</Plakietka>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(action.createdAt), { locale: pl, addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 break-words text-sm font-semibold text-foreground">{action.title}</p>
                    <p className="mt-1 line-clamp-1 break-words text-xs text-muted-foreground">{action.description}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
                      <Button size="sm" variant="obwodka" className="h-8 px-3 text-xs" disabled={isBusy} onClick={(e) => handleResolve(e, action, 'accept')}>
                        <Check className="mr-1 h-3.5 w-3.5" /> Akceptuj
                      </Button>
                      <Button size="sm" variant="usun" className="h-8 px-3 text-xs" disabled={isBusy} onClick={(e) => handleResolve(e, action, 'reject')}>
                        <X className="mr-1 h-3.5 w-3.5" /> Odrzuć
                      </Button>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Tile>
    </motion.section>
  );
};
