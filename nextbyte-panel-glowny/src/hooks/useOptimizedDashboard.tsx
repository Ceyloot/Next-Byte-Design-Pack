import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlannerEvent, PlannerStats } from '@/hooks/usePlannerStats';

// Consolidated dashboard data interface
interface DashboardData {
  userName: string;
  stats: any[];
  plannerStats: PlannerStats | null;
  messageCount: number;
  platformStats: any[];
  userProfile: any;
  isSubscribed: boolean;
}

// Memoized planner stats calculation
const calculatePlannerStats = (events: PlannerEvent[]): PlannerStats => {
  if (!events.length) {
    return {
      totalEvents: 0,
      completedEvents: 0,
      upcomingEvents: 0,
      todayEvents: 0,
      completionRate: 0,
      categories: {},
      weeklyActivity: {},
      monthlyTrend: []
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Basic stats
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.is_completed).length;
  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.start_time);
    return eventDate >= now && !e.is_completed;
  }).length;
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.start_time);
    return eventDate >= today && eventDate < tomorrow;
  }).length;
  
  const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  // Categories stats
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

  Object.keys(categories).forEach(cat => {
    const catData = categories[cat];
    catData.completionRate = catData.total > 0 ? Math.round((catData.completed / catData.total) * 100) : 0;
  });

  // Weekly activity
  const weeklyActivity: { [key: string]: number } = {};
  const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
  dayNames.forEach(day => weeklyActivity[day] = 0);

  events.forEach(event => {
    const eventDate = new Date(event.start_time);
    const dayName = dayNames[eventDate.getDay()];
    weeklyActivity[dayName]++;
  });

  // Monthly trend
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

  return {
    totalEvents,
    completedEvents,
    upcomingEvents,
    todayEvents,
    completionRate,
    categories,
    weeklyActivity,
    monthlyTrend
  };
};

export const useOptimizedDashboard = () => {
  const [userName, setUserName] = useState('Użytkowniku');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Single consolidated query for all dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['optimized-dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Batch all queries
      const [profileData, statsData, plannerData, messageData, subscriptionData] = await Promise.all([
        // User profile
        supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single(),
        
        // Social media stats
        supabase
          .from('social_media_stats')
          .select('*')
          .eq('user_id', user.id),
        
        // Planner events
        supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time'),
        
        // Message count
        supabase
          .from('user_message_usage')
          .select('agent_messages_count, agents_messages_count')
          .eq('user_id', user.id)
          .single(),
        
        // Subscription status
        supabase
          .from('subscribers')
          .select('subscribed, subscription_tier')
          .eq('user_id', user.id)
          .single()
      ]);

      // Process user name
      const profile = profileData.data;
      let displayName = 'Użytkowniku';
      if (profile && !profileData.error) {
        const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
        displayName = fullName || profile.first_name || 'Użytkowniku';
      }

      // Process stats
      const stats = statsData.data || [];
      
      // Process planner stats with memoization
      const plannerEvents = plannerData.data || [];
      const plannerStats = calculatePlannerStats(plannerEvents);
      
      // Process message count
      const messageCount = (messageData.data?.agent_messages_count || 0) + 
                          (messageData.data?.agents_messages_count || 0);
      
      // Process subscription
      const isSubscribed = subscriptionData.data?.subscribed || false;

      return {
        userName: displayName,
        stats,
        plannerStats,
        messageCount,
        platformStats: stats,
        userProfile: profileData.error ? null : profile,
        isSubscribed
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Memoized platform stats calculation
  const getPlatformStats = useCallback(() => {
    if (!dashboardData?.stats) return [];
    
    const { stats } = dashboardData;
    const youtubeStats = stats.find(s => s.platform === 'youtube');
    const instagramStats = stats.find(s => s.platform === 'instagram');
    const tiktokStats = stats.find(s => s.platform === 'tiktok');
    const facebookStats = stats.find(s => s.platform === 'facebook');

    return [
      {
        platform: "YouTube",
        videos: youtubeStats?.videos_count ?? 0,
        posts: null
      },
      {
        platform: "Instagram",
        videos: null,
        posts: instagramStats?.posts_count ?? 0
      },
      {
        platform: "TikTok", 
        videos: tiktokStats?.videos_count ?? 0,
        posts: null
      },
      {
        platform: "Facebook",
        videos: null,
        posts: facebookStats?.posts_count ?? 0
      }
    ];
  }, [dashboardData?.stats]);

  // Memoized stats data formatting
  const getStatsData = useCallback(() => {
    if (!dashboardData?.stats) return [];
    
    const { stats } = dashboardData;
    const youtubeStats = stats.find(s => s.platform === 'youtube');
    const instagramStats = stats.find(s => s.platform === 'instagram');
    const tiktokStats = stats.find(s => s.platform === 'tiktok');
    const facebookStats = stats.find(s => s.platform === 'facebook');

    return [
      {
        title: "YouTube",
        value: (youtubeStats?.followers_count ?? 0).toLocaleString(),
        growth: youtubeStats?.growth_percentage ? `${youtubeStats.growth_percentage > 0 ? '+' : ''}${youtubeStats.growth_percentage}%` : "+0%",
        icon: 'youtube',
        color: "text-red-500",
        bgColor: "from-red-500/20 to-red-500/10",
        videos: youtubeStats?.videos_count ?? 0,
        posts: null
      },
      {
        title: "Instagram", 
        value: (instagramStats?.followers_count ?? 0).toLocaleString(),
        growth: instagramStats?.growth_percentage ? `${instagramStats.growth_percentage > 0 ? '+' : ''}${instagramStats.growth_percentage}%` : "+0%",
        icon: 'instagram',
        color: "text-pink-500",
        bgColor: "from-pink-500/20 to-pink-500/10",
        videos: null,
        posts: instagramStats?.posts_count ?? 0
      },
      {
        title: "TikTok",
        value: (tiktokStats?.followers_count ?? 0).toLocaleString(), 
        growth: tiktokStats?.growth_percentage ? `${tiktokStats.growth_percentage > 0 ? '+' : ''}${tiktokStats.growth_percentage}%` : "+0%",
        icon: 'users',
        color: "text-purple-500",
        bgColor: "from-purple-500/20 to-purple-500/10",
        videos: tiktokStats?.videos_count ?? 0,
        posts: null
      },
      {
        title: "Facebook",
        value: (facebookStats?.followers_count ?? 0).toLocaleString(),
        growth: facebookStats?.growth_percentage ? `${facebookStats.growth_percentage > 0 ? '+' : ''}${facebookStats.growth_percentage}%` : "+0%",
        icon: 'facebook',
        color: "text-blue-600",
        bgColor: "from-blue-600/20 to-blue-600/10",
        videos: null,
        posts: facebookStats?.posts_count ?? 0
      }
    ];
  }, [dashboardData?.stats]);

  // Optimized sync function
  const syncStats = useCallback(async () => {
    try {
      console.log('🔄 Optimized dashboard sync started...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user configs
      const { data: configs } = await supabase
        .from('social_media_config')
        .select('platform, username, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Sync YouTube stats if configured
      const youtubeConfig = configs?.find(c => c.platform === 'youtube');
      if (youtubeConfig?.username) {
        try {
          console.log('🔄 Syncing YouTube stats...');
          await supabase.functions.invoke('sync-youtube-stats', {
            body: { username: youtubeConfig.username }
          });
          console.log('✅ YouTube stats synced');
        } catch (error) {
          console.error('Error syncing YouTube:', error);
        }
      }

      // Invalidate and refetch dashboard data
      await queryClient.invalidateQueries({ queryKey: ['optimized-dashboard'] });
      await refetch();

      console.log('✅ Optimized dashboard sync completed');
    } catch (error) {
      console.error('❌ Optimized dashboard sync error:', error);
      toast({
        title: "Błąd synchronizacji",
        description: "Nie udało się zsynchronizować wszystkich danych",
        variant: "destructive"
      });
    }
  }, [queryClient, refetch, toast]);

  // Performance monitoring
  useEffect(() => {
    const perfObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure' && entry.name.includes('dashboard')) {
          console.log(`📊 Dashboard Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
        }
      });
    });
    
    if ('PerformanceObserver' in window) {
      perfObserver.observe({ entryTypes: ['measure'] });
    }

    return () => perfObserver?.disconnect();
  }, []);

  return {
    userName: dashboardData?.userName || userName,
    stats: dashboardData?.stats || [],
    plannerStats: dashboardData?.plannerStats || null,
    messageCount: dashboardData?.messageCount || 0,
    isLoading,
    isSyncing: false,
    syncStats,
    getStatsData,
    getPlatformStats,
    isSubscribed: dashboardData?.isSubscribed || false,
    userProfile: dashboardData?.userProfile || null,
  };
};