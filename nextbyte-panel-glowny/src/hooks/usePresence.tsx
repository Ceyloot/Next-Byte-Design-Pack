import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';

const HEARTBEAT_INTERVAL = 60_000; // 60s

export const usePresence = () => {
  const userId = useAuthId();
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!userId) return;

    const setOnline = async () => {
      await supabase
        .from('user_presence')
        .upsert(
          { user_id: userId, status: 'online', last_seen: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
    };

    const setOffline = () => {
      // Use sendBeacon-friendly approach for page close
      supabase
        .from('user_presence')
        .update({ status: 'offline', last_seen: new Date().toISOString() })
        .eq('user_id', userId)
        .then(() => {});
    };

    const handleBeforeUnload = () => {
      // Best-effort offline update via fetch keepalive
      const url = `https://iwuvszxeutvmzcfuetuo.supabase.co/rest/v1/user_presence?user_id=eq.${userId}`;
      const body = JSON.stringify({ status: 'offline', last_seen: new Date().toISOString() });
      try {
        navigator.sendBeacon?.(url); // won't work with PATCH, fallback below
        fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dXZzenhldXR2bXpjZnVldHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzEwOTMsImV4cCI6MjA2NjIwNzA5M30.1kTSozBT2TCeA0SMc-fr_H-TnNA0x8--Gk-OBH444uY',
            'Authorization': `Bearer ${(supabase as any).auth.session?.()?.access_token || ''}`,
            'Prefer': 'return=minimal',
          },
          body,
          keepalive: true,
        }).catch(() => {});
      } catch {
        // silent
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setOffline();
      } else {
        setOnline();
      }
    };

    // Set online immediately
    setOnline();

    // Heartbeat
    heartbeatRef.current = setInterval(() => {
      supabase
        .from('user_presence')
        .update({ last_seen: new Date().toISOString(), status: 'online' })
        .eq('user_id', userId)
        .then(() => {});
    }, HEARTBEAT_INTERVAL);

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeatRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setOffline();
    };
  }, [userId]);
};

