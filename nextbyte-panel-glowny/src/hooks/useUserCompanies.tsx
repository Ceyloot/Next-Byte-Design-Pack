import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CompanyRole } from '@/types/company';
import { hotCache } from '@/lib/hotMemoryCache';
import { useIsAdmin } from '@/hooks/useUserRoles';
import { useAuthId } from '@/hooks/useAuth';

export interface UserCompany {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  industry: string | null;
  role: CompanyRole | 'ghost_admin';
  joined_at: string;
}

export const useUserCompanies = () => {
  const { value: isPlatformAdmin, isLoading: adminLoading } = useIsAdmin();
  const userId = useAuthId();

  return useQuery({
    queryKey: ['user-companies', userId, isPlatformAdmin],
    queryFn: async (): Promise<UserCompany[]> => {
      const cacheKey = isPlatformAdmin ? 'user-companies-admin' : 'user-companies';
      const cached = hotCache.get(cacheKey) as UserCompany[] | null;
      if (cached) {
        console.log('🔥 User companies loaded from hot cache');
        return cached;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's own companies
      const { data, error } = await supabase
        .from('user_companies_view')
        .select('id, name, slug, description, logo_url, industry, role, joined_at')
        .eq('user_id', user.id)
        .order('role', { ascending: true });

      if (error) throw error;

      const ownCompanies: UserCompany[] = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        logo_url: c.logo_url,
        industry: c.industry,
        role: c.role as CompanyRole,
        joined_at: c.joined_at,
      }));

      // If platform admin, also fetch all other companies
      if (isPlatformAdmin) {
        const { data: allCompanies, error: adminError } = await supabase
          .rpc('get_all_companies_for_admin', { p_user_id: user.id });

        if (!adminError && allCompanies) {
          const ownIds = new Set(ownCompanies.map(c => c.id));
          const ghostCompanies: UserCompany[] = allCompanies
            .filter((c: any) => !ownIds.has(c.id))
            .map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.description,
              logo_url: c.logo_url,
              industry: c.industry,
              role: 'ghost_admin' as const,
              joined_at: '',
            }));

          const combined = [...ownCompanies, ...ghostCompanies];
          hotCache.set(cacheKey, combined);
          return combined;
        }
      }

      hotCache.set(cacheKey, ownCompanies);
      return ownCompanies;
    },
    enabled: !adminLoading && !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};
