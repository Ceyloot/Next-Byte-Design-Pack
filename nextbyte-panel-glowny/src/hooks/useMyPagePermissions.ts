import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useUserRoles';

export interface MyPagePermissions {
  pageIds: string[];
  isFullAccess: boolean;
}

export const useMyPagePermissions = (companyId?: string) => {
  const { value: isPlatformAdmin, isLoading: adminLoading } = useIsAdmin();

  return useQuery({
    queryKey: ['my-page-permissions', companyId, isPlatformAdmin],
    queryFn: async (): Promise<MyPagePermissions> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) return { pageIds: [], isFullAccess: false };

      const { data: member } = await supabase
        .from('company_members')
        .select('id, role')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .eq('status', 'active')
        .maybeSingle();

      if (!member) {
        return isPlatformAdmin
          ? { pageIds: [], isFullAccess: true }
          : { pageIds: [], isFullAccess: false };
      }

      const role = member.role as string;
      if (role === 'owner' || role === 'admin') {
        return { pageIds: [], isFullAccess: true };
      }

      const { data: permissions } = await supabase
        .from('company_member_page_permissions')
        .select('page_id')
        .eq('company_member_id', member.id)
        .eq('has_access', true);

      return {
        pageIds: permissions?.map(p => p.page_id) || [],
        isFullAccess: false,
      };
    },
    enabled: !!companyId && !adminLoading,
    staleTime: 5 * 60 * 1000,
  });
};
