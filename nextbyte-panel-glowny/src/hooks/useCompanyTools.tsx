import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyTool {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  path: string;
  is_active: boolean;
  order_index: number;
}

export const useCompanyTools = () => {
  return useQuery({
    queryKey: ['company-tools'],
    queryFn: async (): Promise<CompanyTool[]> => {
      const { data, error } = await supabase
        .from('company_tools')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour - tools rarely change
  });
};
