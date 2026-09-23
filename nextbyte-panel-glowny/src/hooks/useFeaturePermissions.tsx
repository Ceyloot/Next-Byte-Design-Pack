import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AccessLevel = 'all' | 'management_admin' | 'admin_only';

export interface FeaturePermission {
  id: string;
  feature_key: string;
  feature_name: string;
  feature_path: string;
  access_level: AccessLevel;
  is_visible: boolean;
  icon_name: string | null;
  section: string | null;
  order_index: number;
}

export const useFeaturePermissions = () => {
  return useQuery({
    queryKey: ['feature-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_permissions')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as FeaturePermission[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useUserPermissions = () => {
  return useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isAdmin: false, isManagement: false };

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      const userRoles = roles?.map(r => r.role) || [];
      return {
        isAdmin: userRoles.includes('admin'),
        isManagement: userRoles.includes('zarząd') || userRoles.includes('admin'),
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useFilteredFeatures = () => {
  const { data: features, isLoading: featuresLoading } = useFeaturePermissions();
  const { data: permissions, isLoading: permissionsLoading } = useUserPermissions();

  const filteredFeatures = features?.filter(feature => {
    if (!feature.is_visible) return false;
    
    switch (feature.access_level) {
      case 'all':
        return true;
      case 'management_admin':
        return permissions?.isManagement;
      case 'admin_only':
        return permissions?.isAdmin;
      default:
        return false;
    }
  });

  return {
    features: filteredFeatures || [],
    isLoading: featuresLoading || permissionsLoading,
    userPermissions: permissions,
  };
};
