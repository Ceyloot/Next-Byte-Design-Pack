import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_image_url?: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userId: string | null = null;

    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        userId = user.id;

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, profile_image_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    // WYCIEK KANAŁU (naprawiony): funkcja sprzątająca była zwracana z `.then()`,
    // czyli do Promise'a, a nie do Reacta. React dostawał cleanup tylko dla
    // listenera `settingsUpdated`, więc kanał realtime NIGDY nie był usuwany —
    // każde odmontowanie hooka zostawiało żywą subskrypcję WebSocket.
    // Przy 20 przejściach między stronami użytkownik trzymał 20 kanałów.
    // Realtime Supabase jest limitowany i płatny od liczby połączeń, więc
    // przy dziesiątkach tysięcy użytkowników to samo się przewraca.
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    fetchProfile().then(() => {
      if (cancelled || !userId) return;

      // Listen for profile updates — filtered to current user only
      channel = supabase
        .channel(`profile-changes-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            if (payload.new) {
              setProfile(payload.new as UserProfile);
            }
          }
        )
        .subscribe();
    });

    // Listen for custom settings update event
    const handleSettingsUpdate = () => {
      fetchProfile();
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refreshProfile: () => {
      // Trigger a re-fetch by calling fetchProfile again
      setLoading(true);
    }
  };
};