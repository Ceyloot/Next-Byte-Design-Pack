import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';

export interface PlannerEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  category: string;
  icon: string | null;
  color: string | null;
  is_completed: boolean | null;
  created_at: string;
  user_id: string;
  recurrence_type: string | null;
  series_id: string | null;
  is_series_master: boolean | null;
}

export interface PlannerStats {
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  todayEvents: number;
  completionRate: number;
  categories: {
    [key: string]: {
      total: number;
      completed: number;
      completionRate: number;
    };
  };
  weeklyActivity: {
    [key: string]: number;
  };
  monthlyTrend: {
    month: string;
    events: number;
    completed: number;
  }[];
}

export const usePlannerStats = () => {
  const [stats, setStats] = useState<PlannerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userId = useAuthId();

  const { data: events = [], isLoading: isLoadingEvents, refetch } = useQuery({
    queryKey: ['planner-stats-events', userId],
    queryFn: async ({ queryKey }) => {
      const userId = queryKey[1] as string;
      if (!userId) return [];

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time');

      if (error) throw error;
      return data as PlannerEvent[];
    },
  });

  useEffect(() => {
    if (events.length > 0) {
      calculateStats(events);
    } else {
      setStats({
        totalEvents: 0,
        completedEvents: 0,
        upcomingEvents: 0,
        todayEvents: 0,
        completionRate: 0,
        categories: {},
        weeklyActivity: {},
        monthlyTrend: []
      });
    }
    setIsLoading(false);
  }, [events]);

  const calculateStats = (events: PlannerEvent[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Group events by series (recurring events share series_id)
    const seriesMap = new Map<string, PlannerEvent[]>();
    events.forEach(event => {
      const seriesKey = event.series_id || event.id;
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, []);
      }
      seriesMap.get(seriesKey)!.push(event);
    });

    // Count unique series instead of individual instances
    const totalEvents = seriesMap.size;
    const completedEvents = [...seriesMap.values()].filter(group => 
      group.some(e => e.is_completed)
    ).length;
    const upcomingEvents = [...seriesMap.values()].filter(group =>
      group.some(e => {
        const eventDate = new Date(e.start_time);
        return eventDate >= now && !e.is_completed;
      })
    ).length;
    const todayEvents = [...seriesMap.values()].filter(group =>
      group.some(e => {
        const eventDate = new Date(e.start_time);
        return eventDate >= today && eventDate < tomorrow;
      })
    ).length;
    
    const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

    // Statystyki kategorii
    const categories: { [key: string]: { total: number; completed: number; completionRate: number } } = {};
    events.forEach(event => {
      if (!categories[event.category]) {
        categories[event.category] = { total: 0, completed: 0, completionRate: 0 };
      }
      categories[event.category].total++;
      if (event.is_completed) {
        categories[event.category].completed++;
      }
    });

    // Oblicz wskaźniki dla kategorii
    Object.keys(categories).forEach(cat => {
      const catData = categories[cat];
      catData.completionRate = catData.total > 0 ? Math.round((catData.completed / catData.total) * 100) : 0;
    });

    // Aktywność tygodniowa
    const weeklyActivity: { [key: string]: number } = {};
    const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    dayNames.forEach(day => weeklyActivity[day] = 0);

    events.forEach(event => {
      const eventDate = new Date(event.start_time);
      const dayName = dayNames[eventDate.getDay()];
      weeklyActivity[dayName]++;
    });

    // Trend miesięczny (ostatnie 6 miesięcy)
    const monthlyTrend: { month: string; events: number; completed: number }[] = [];
    const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.start_time);
        return eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear();
      });
      
      monthlyTrend.push({
        month: monthKey,
        events: monthEvents.length,
        completed: monthEvents.filter(e => e.is_completed).length
      });
    }

    setStats({
      totalEvents,
      completedEvents,
      upcomingEvents,
      todayEvents,
      completionRate,
      categories,
      weeklyActivity,
      monthlyTrend
    });
  };

  const refreshStats = async () => {
    await refetch();
  };

  return {
    stats,
    events,
    isLoading: isLoading || isLoadingEvents,
    refreshStats
  };
};