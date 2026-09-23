import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { onSiteAssetUpdated } from '@/lib/realtimeChannels';

export interface SiteAsset {
  id: string;
  asset_key: string;
  asset_type: string;
  file_name: string;
  file_path: string;
  file_url: string;
  display_name?: string;
  description?: string;
  is_active: boolean;
}

export const useSiteAsset = (assetKey: string) => {
  const queryClient = useQueryClient();

  // Load from localStorage for instant initial display
  const getCachedAsset = (): SiteAsset | null => {
    try {
      const cached = localStorage.getItem(`site-asset:${assetKey}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const cachedAsset = getCachedAsset();

  // Subscribe to Realtime updates
  useEffect(() => {
    return onSiteAssetUpdated((zmieniony) => {
      if (zmieniony !== assetKey) return;

      // Clear localStorage cache
      localStorage.removeItem(`site-asset:${assetKey}`);

      // Invalidate React Query caches
      queryClient.invalidateQueries({ queryKey: ['site-asset', assetKey] });
      queryClient.invalidateQueries({ queryKey: ['site-assets-active'] });
    });
  }, [assetKey, queryClient]);

  return useQuery({
    queryKey: ['site-asset', assetKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_assets')
        .select('*')
        .eq('asset_key', assetKey)
        .eq('is_active', true)
        .single();

      if (error) {
        // Detect network/CORS errors
        const isNetworkError = error.message?.includes('fetch') || 
                               error.message?.includes('Failed to fetch') ||
                               error.message?.includes('NetworkError') ||
                               error.code === 'PGRST301';
        
        if (isNetworkError) {
          console.warn(`⚠️ Network error fetching site asset '${assetKey}':`, error.message);
        } else {
          console.error(`❌ Error fetching site asset '${assetKey}':`, error);
        }
        return null;
      }

      // Save to localStorage for instant loading next time
      if (data) {
        try {
          localStorage.setItem(`site-asset:${assetKey}`, JSON.stringify(data));
        } catch (e) {
          console.warn('Failed to cache asset:', e);
        }
      }

      return data as SiteAsset;
    },
    placeholderData: cachedAsset,
    staleTime: 5 * 60 * 1000, // 5 minutes - stable between focus changes
    refetchOnMount: false, // Don't refetch on mount, use cache + realtime
    refetchOnWindowFocus: false, // Don't refetch on focus, use realtime updates
    refetchOnReconnect: true, // Refetch when reconnecting
  });
};
