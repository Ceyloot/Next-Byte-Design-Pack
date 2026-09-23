import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DesktopDeviceToken {
  id: string;
  device_name: string;
  token_prefix: string;
  last_used_at: string | null;
  last_check_result: any | null;
  created_at: string;
  revoked_at: string | null;
}

export const useDesktopTokens = () => {
  const userId = useAuthId();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['desktop-device-tokens', userId],
    queryFn: async (): Promise<DesktopDeviceToken[]> => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from('desktop_device_tokens')
        .select('*')
        .eq('user_id', userId)
        .is('revoked_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as DesktopDeviceToken[];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });

  const generate = useMutation({
    mutationFn: async (deviceName: string) => {
      const { data, error } = await (supabase as any).rpc('generate_desktop_token', {
        p_device_name: deviceName,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row as { id: string; raw_token: string; token_prefix: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desktop-device-tokens', userId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Nie udało się wygenerować tokenu');
    },
  });

  const revoke = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await (supabase as any)
        .from('desktop_device_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', tokenId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Token urządzenia odwołany');
      queryClient.invalidateQueries({ queryKey: ['desktop-device-tokens', userId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Nie udało się odwołać tokenu');
    },
  });

  return { ...query, generate, revoke };
};
