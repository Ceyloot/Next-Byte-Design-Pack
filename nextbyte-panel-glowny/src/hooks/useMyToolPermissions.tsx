import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useUserRoles';

export interface MyToolPermissions {
  permissions: string[];
  isFullAccess: boolean;
  memberId: string | null;
  role: string | null;
}

export const useMyToolPermissions = (companyId?: string) => {
  const { value: isPlatformAdmin, isLoading: adminLoading } = useIsAdmin();

  return useQuery({
    queryKey: ['my-tool-permissions', companyId, isPlatformAdmin],
    queryFn: async (): Promise<MyToolPermissions> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) {
        return { permissions: [], isFullAccess: false, memberId: null, role: null };
      }

      // Real membership takes precedence over platform-level ghost access
      const { data: member } = await supabase
        .from('company_members')
        .select('id, role')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .eq('status', 'active')
        .maybeSingle();

      if (!member) {
        if (isPlatformAdmin) {
          return { permissions: [], isFullAccess: true, memberId: null, role: 'ghost_admin' };
        }

        return { permissions: [], isFullAccess: false, memberId: null, role: null };
      }

      const role = member.role as string;
      const isFullAccess = role === 'owner' || role === 'admin';
      
      if (isFullAccess) {
        return { permissions: [], isFullAccess: true, memberId: member.id, role };
      }

      const { data: permissions } = await supabase
        .from('company_member_tool_permissions')
        .select('tool_id, company_tools!inner(path)')
        .eq('company_member_id', member.id)
        .eq('has_access', true);

      return {
        permissions: permissions?.map(p => (p.company_tools as any)?.path).filter(Boolean) || [],
        isFullAccess: false,
        memberId: member.id,
        role
      };
    },
    enabled: !!companyId && !adminLoading,
    staleTime: 30 * 1000, // 30s - permissions must refresh quickly for security
    refetchOnWindowFocus: 'always', // Always refetch when user tabs back
  });
};
