import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';

/**
 * Shared hook for fetching user roles - prevents duplicate queries
 * Used by both sidebar and management role checks
 */
export const useUserRoles = () => {
  const userId = useAuthId();

  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching user roles:', error);
          return [];
        }
        
        return data?.map(r => r.role) || [];
      } catch (error) {
        console.error('Error in user roles query:', error);
        return [];
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - roles don't change often
    gcTime: 60 * 60 * 1000, // 60 minutes cache
    retry: 3,
    enabled: !!userId,
  });
};

/**
 * Helper hook to check if user has admin role
 * Returns object with value and loading state
 */
export const useIsAdmin = () => {
  const { data: roles = [], isLoading } = useUserRoles();
  return { value: roles.includes('admin'), isLoading };
};

/**
 * Helper hook to check if user has management role (zarząd or admin)
 * Returns object with value and loading state
 */
export const useHasManagementRole = () => {
  const { data: roles = [], isLoading } = useUserRoles();
  return { value: roles.some(role => role === 'zarząd' || role === 'admin'), isLoading };
};

/**
 * Helper hook to check if user has salesperson role (handlowiec)
 * Returns object with value and loading state
 */
export const useIsSalesperson = () => {
  const { data: roles = [], isLoading } = useUserRoles();
  return { value: roles.includes('handlowiec'), isLoading };
};
