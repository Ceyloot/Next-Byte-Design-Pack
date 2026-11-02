import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyBytePackEntry {
  id: string;
  pack_type: string;
  source: string | null;
  amount_remaining: number;
  amount_initial: number;
  expires_at: string | null;
  purchased_at: string;
}

export interface CompanyBytePoolSummary {
  tier: string;
  subscription_balance: number;
  subscription_limit: number;
  rollover_balance: number;
  rollover_expires_at: string | null;
  packs_total: number;
  total: number;
  cycle_start_at: string | null;
  cycle_end_at: string | null;
  packs: CompanyBytePackEntry[];
  status: string;
}

/**
 * Jedyne źródło salda Byte firmy: pula planu (`company_byte_pool`, co miesiąc do limitu)
 * i paczki (`company_byte_packs`). Stara księga nie jest już czytana (12.10.2026).
 */
export const useCompanyBytePool = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ['company-byte-pool', companyId],
    queryFn: async (): Promise<CompanyBytePoolSummary> => {
      if (!companyId) throw new Error('No company ID');

      const { data, error } = await supabase.rpc('get_company_byte_summary_v2', {
        p_company_id: companyId,
      });

      if (error) throw error;

      const r = (data as any) || {};
      return {
        tier: r.tier || 'free',
        subscription_balance: Number(r.subscription_balance || 0),
        subscription_limit: Number(r.subscription_limit || 0),
        rollover_balance: Number(r.rollover_balance || 0),
        rollover_expires_at: r.rollover_expires_at || null,
        packs_total: Number(r.packs_total || 0),
        total: Number(r.total || 0),
        cycle_start_at: r.cycle_start_at || null,
        cycle_end_at: r.cycle_end_at || null,
        packs: (r.packs || []) as CompanyBytePackEntry[],
        status: r.status || 'free',
      };
    },
    enabled: !!companyId,
    staleTime: 30 * 1000,
  });
};
