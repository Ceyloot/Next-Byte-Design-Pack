import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PinnedAgent {
  id: string;
  agent_id: string;
  pinned_at: string;
  display_order: number;
  agent: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    icon_url: string | null;
    color: string;
  };
}

export const usePinnedAgents = () => {
  const userId = useAuthId();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pinnedAgents, isLoading } = useQuery({
    queryKey: ['pinned-agents', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_pinned_agents')
        .select(`
          id,
          agent_id,
          pinned_at,
          display_order,
          agent:agents (
            id,
            name,
            slug,
            icon,
            icon_url,
            color
          )
        `)
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as unknown as PinnedAgent[];
    },
    enabled: !!userId,
  });

  const pinAgent = useMutation({
    mutationFn: async (agentId: string) => {
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_pinned_agents')
        .insert({
          user_id: userId,
          agent_id: agentId,
          display_order: (pinnedAgents?.length || 0) + 1,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pinned-agents'] });
      toast({
        title: 'Moduł przypięty',
        description: 'Moduł został dodany do paska bocznego',
      });
    },
    onError: (error) => {
      console.error('Error pinning agent:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się przypiąć modułu',
        variant: 'destructive',
      });
    },
  });

  const unpinAgent = useMutation({
    mutationFn: async (agentId: string) => {
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_pinned_agents')
        .delete()
        .eq('user_id', userId)
        .eq('agent_id', agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pinned-agents'] });
      toast({
        title: 'Moduł odpięty',
        description: 'Moduł został usunięty z paska bocznego',
      });
    },
    onError: (error) => {
      console.error('Error unpinning agent:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się odpiąć modułu',
        variant: 'destructive',
      });
    },
  });

  const isPinned = (agentId: string): boolean => {
    return pinnedAgents?.some((p) => p.agent_id === agentId) ?? false;
  };

  const togglePin = async (agentId: string) => {
    if (isPinned(agentId)) {
      await unpinAgent.mutateAsync(agentId);
    } else {
      await pinAgent.mutateAsync(agentId);
    }
  };

  return {
    pinnedAgents: pinnedAgents || [],
    isLoading,
    isPinned,
    pinAgent: pinAgent.mutate,
    unpinAgent: unpinAgent.mutate,
    togglePin,
    isPinning: pinAgent.isPending || unpinAgent.isPending,
  };
};
