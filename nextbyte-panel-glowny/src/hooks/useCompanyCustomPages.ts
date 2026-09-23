import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyCustomPage {
  id: string;
  company_id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  page_type: 'iframe' | 'component' | 'content';
  page_config: Record<string, any>;
  is_active: boolean;
  is_sidebar_visible: boolean;
  order_index: number;
}

export const useCompanyCustomPages = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ['company-custom-pages', companyId],
    queryFn: async (): Promise<CompanyCustomPage[]> => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('company_custom_pages')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      return (data || []) as unknown as CompanyCustomPage[];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
};
