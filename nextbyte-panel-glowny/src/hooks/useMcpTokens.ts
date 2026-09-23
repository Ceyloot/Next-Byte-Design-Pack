import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface McpAccessToken {
  id: string;
  name: string;
  token_prefix: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export const useMcpTokens = () => {
  const userId = useAuthId();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['mcp-tokens', userId],
    queryFn: async (): Promise<McpAccessToken[]> => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from('mcp_access_tokens')
        .select('*')
        .eq('user_id', userId)
        .is('revoked_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as McpAccessToken[];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });

  const generate = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await (supabase as any).rpc('generate_mcp_token', { p_name: name });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row as { id: string; raw_token: string; token_prefix: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-tokens', userId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Nie udało się wygenerować tokenu');
    },
  });

  const revoke = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await (supabase as any)
        .from('mcp_access_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', tokenId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Token MCP odwołany');
      queryClient.invalidateQueries({ queryKey: ['mcp-tokens', userId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Nie udało się odwołać tokenu');
    },
  });

  return { ...query, generate, revoke };
};
