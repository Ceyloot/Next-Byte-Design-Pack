import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { UserCookieConsent, CookiePreferences } from '@/types/cookies';

export function useCookieConsent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [consentRequired, setConsentRequired] = useState(false);

  // Check if user needs to give consent
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['cookie-consent-check'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('cookie_consent_required')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: true,
  });

  // Get user's consent data
  const { data: consentData, isLoading: consentLoading } = useQuery({
    queryKey: ['user-cookie-consent'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_cookie_consents')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as UserCookieConsent | null;
    },
  });

  useEffect(() => {
    if (profile && profile.cookie_consent_required) {
      setConsentRequired(true);
    } else {
      setConsentRequired(false);
    }
  }, [profile]);

  /* PRZYCZYNA „NIC NIE DZIAŁA" (07.09.2026). Upsert po `user_id` trafia
     w UPDATE, a polityka UPDATE pozwalała zmieniać wiersz tylko 30 dni od
     utworzenia (błąd 42501 z RLS). Naprawa jest w bazie (migracja
     `20260907170000`), a tu: komunikat mówi, CO poszło nie tak, i błąd
     zostaje w stanie, żeby okno mogło go pokazać przy przyciskach. */
  const [bladZapisu, setBladZapisu] = useState<string | null>(null);
  const saveConsentMutation = useMutation({
    mutationFn: async (preferences: CookiePreferences) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get IP and user agent
      const userAgent = navigator.userAgent;
      
      // Upsert consent
      const { error: consentError } = await supabase
        .from('user_cookie_consents')
        .upsert({
          user_id: user.id,
          marketing_cookies: preferences.marketing_cookies,
          statistics_cookies: preferences.statistics_cookies,
          personalization_cookies: preferences.personalization_cookies,
          functional_cookies: preferences.functional_cookies,
          user_agent: userAgent,
          consent_given_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (consentError) throw consentError;

      // Update profile to mark consent as given
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ cookie_consent_required: false })
        .eq('id', user.id);

      if (profileError) throw profileError;

      return true;
    },
    onMutate: () => setBladZapisu(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cookie-consent-check'] });
      queryClient.invalidateQueries({ queryKey: ['user-cookie-consent'] });
      setConsentRequired(false);
      toast({
        title: 'Zgoda zapisana',
        description: 'Twoje preferencje dotyczące cookies zostały zapisane.',
      });
    },
    onError: (error: unknown) => {
      const kod = (error as { code?: string } | null)?.code;
      const opis = kod === '42501'
        ? 'Baza odrzuciła zapis zgody (uprawnienia). Odśwież stronę i spróbuj ponownie — jeśli to się powtórzy, napisz do nas.'
        : 'Nie udało się zapisać zgody. Sprawdź połączenie i spróbuj ponownie.';
      setBladZapisu(opis);
      toast({ title: 'Nie zapisano zgody', description: opis, variant: 'destructive' });
      console.error('Error saving consent:', error);
    },
  });

  return {
    consentRequired,
    consentData,
    isLoading: profileLoading || consentLoading,
    saveConsent: saveConsentMutation.mutate,
    isSaving: saveConsentMutation.isPending,
    bladZapisu,
  };
}
