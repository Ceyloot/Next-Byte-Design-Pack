import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FriendRequest } from '@/types/friends';
import { toast } from 'sonner';
import React from 'react';

export const useFriendRequests = (userId?: string) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['friend-requests', userId],
    queryFn: async () => {
      if (!userId) return { incoming: [], outgoing: [] };

      const { data: requests, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:profiles!friend_requests_sender_id_fkey(id, first_name, last_name, email, profile_image_url),
          receiver:profiles!friend_requests_receiver_id_fkey(id, first_name, last_name, email, profile_image_url)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const incoming = (requests as any[]).filter((r: any) => r.receiver_id === userId);
      const outgoing = (requests as any[]).filter((r: any) => r.sender_id === userId);

      return { incoming, outgoing };
    },
    enabled: !!userId,
  });
  
  // Set up realtime subscription
  React.useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel('friend-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['friend-requests', userId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `sender_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['friend-requests', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
  
  return query;
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverId }: { receiverId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['search-users'] });
      toast.success('Zaproszenie wysłane!');
    },
    onError: (error: any) => {
      console.error('Error sending friend request:', error);
      if (error.message?.includes('duplicate')) {
        toast.error('Zaproszenie już wysłane');
      } else {
        toast.error('Nie udało się wysłać zaproszenia');
      }
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      const { data, error } = await supabase.rpc('accept_friend_request', {
        request_id: requestId,
      });

      if (error) throw error;
      if (!data) throw new Error('Failed to accept request');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Jesteście teraz znajomymi!');
    },
    onError: (error: any) => {
      console.error('Error accepting friend request:', error);
      const message = error.message || 'Nie udało się zaakceptować zaproszenia';
      toast.error(message);
    },
  });
};

export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      toast.success('Zaproszenie odrzucone');
    },
    onError: (error) => {
      console.error('Error rejecting friend request:', error);
      toast.error('Nie udało się odrzucić zaproszenia');
    },
  });
};

export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['search-users'] });
      toast.success('Zaproszenie anulowane');
    },
    onError: (error) => {
      console.error('Error canceling friend request:', error);
      toast.error('Nie udało się anulować zaproszenia');
    },
  });
};
