import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';

export const useChatStats = () => {
  const [messageCount, setMessageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const userId = useAuthId();

  const loadChatStats = async (providedUserId?: string) => {
    const uid = providedUserId || userId;
    if (!uid) return;
    
    try {
      setIsLoading(true);

      // Pobierz liczbę wiadomości użytkownika z tego miesiąca
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('user_chat_history')
        .select('id', { count: 'exact' })
        .eq('user_id', uid)
        .eq('chat_type', 'agent_ai')
        .eq('sender', 'user')
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      setMessageCount(data?.length || 0);
    } catch (error) {
      console.error('Error loading chat stats:', error);
      setMessageCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadChatStats(userId);
    }
  }, [userId]);

  return {
    messageCount,
    isLoading,
    refreshStats: loadChatStats
  };
};
