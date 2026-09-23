import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useHasManagementRole } from '@/hooks/useUserRoles';

type PillNavAccess = 'all' | 'management_admin';

export const usePillNavbarAccess = () => {
  const { value: isManagement, isLoading: rolesLoading } = useHasManagementRole();

  const { data: accessLevel, isLoading: settingLoading } = useQuery({
    queryKey: ['pill-navbar-access'],
    queryFn: async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('category', 'general')
        .eq('key', 'pill_navbar_access')
        .maybeSingle();

      return (data?.value as PillNavAccess) || 'management_admin';
    },
    staleTime: 60 * 1000,
  });

  const isLoading = rolesLoading || settingLoading;
  const canUsePillNavbar = accessLevel === 'all' || isManagement;

  return { canUsePillNavbar, isLoading, accessLevel };
};
