import { useCallback } from 'react';
import { PlannerStats } from '@/hooks/usePlannerStats';

/**
 * WERSJA BEZ SUPABASE — tylko podgląd wyglądu Panelu Głównego. Zwraca statyczne,
 * puste dane w tym samym kształcie co oryginalny hook, żeby `Dashboard.tsx`
 * renderował się bez żadnych zapytań do backendu.
 */
const EMPTY_PLANNER_STATS: PlannerStats = {
  totalEvents: 0,
  completedEvents: 0,
  upcomingEvents: 0,
  todayEvents: 0,
  completionRate: 0,
  categories: {},
  weeklyActivity: {},
  monthlyTrend: [],
};

export const useOptimizedDashboard = () => {
  const getPlatformStats = useCallback(() => [], []);
  const getStatsData = useCallback(() => [], []);
  const syncStats = useCallback(async () => {}, []);

  return {
    userName: 'Użytkowniku',
    stats: [] as any[],
    plannerStats: EMPTY_PLANNER_STATS,
    messageCount: 0,
    isLoading: false,
    isSyncing: false,
    syncStats,
    getStatsData,
    getPlatformStats,
    isSubscribed: false,
    userProfile: null,
  };
};
