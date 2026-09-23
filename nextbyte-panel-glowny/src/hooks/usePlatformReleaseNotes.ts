import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PlatformReleaseStatus = 'draft' | 'published' | 'archived';
export type PlatformReleaseType = 'major' | 'minor' | 'patch' | 'hotfix';
export type ReleaseItemSection = 'added' | 'planned';
export type ReleaseMediaType = 'image' | 'gif' | 'vimeo';

export interface PlatformReleaseNote {
  id: string;
  version: string;
  title: string;
  summary: string | null;
  content: string;
  status: PlatformReleaseStatus;
  release_type: PlatformReleaseType;
  released_at: string | null;
  is_current: boolean;
  is_public: boolean;
  show_planned_section?: boolean;
  next_version_label?: string | null;
  transition_note?: string | null;
  ai_summary?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PlatformReleaseItem {
  id: string;
  release_id: string;
  section: ReleaseItemSection;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface PlatformReleaseMedia {
  id: string;
  release_id: string;
  item_id: string | null;
  media_type: ReleaseMediaType;
  title: string | null;
  url: string;
  storage_path: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

const releaseTable = () => (supabase as any).from('platform_releases');
const itemsTable = () => (supabase as any).from('platform_release_items');
const mediaTable = () => (supabase as any).from('platform_release_media');

export const useCurrentPlatformReleaseNotes = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['platform-release-notes', 'current-public'],
    queryFn: async () => {
      const { data: current, error: currentError } = await releaseTable()
        .select('*')
        .eq('status', 'published')
        .eq('is_public', true)
        .eq('is_current', true)
        .maybeSingle();

      if (currentError) throw currentError;

      let release = current as PlatformReleaseNote | null;

      if (!release) {
        const { data: latest, error: latestError } = await releaseTable()
          .select('*')
          .eq('status', 'published')
          .eq('is_public', true)
          .order('released_at', { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle();
        if (latestError) throw latestError;
        release = latest as PlatformReleaseNote | null;
      }

      if (!release) {
        return { release: null, items: [] as PlatformReleaseItem[], media: [] as PlatformReleaseMedia[] };
      }

      const [{ data: items, error: itemsError }, { data: media, error: mediaError }] = await Promise.all([
        itemsTable()
          .select('*')
          .eq('release_id', release.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        mediaTable()
          .select('*')
          .eq('release_id', release.id)
          .order('sort_order', { ascending: true }),
      ]);

      if (itemsError) throw itemsError;
      if (mediaError) throw mediaError;

      return {
        release,
        items: (items || []) as PlatformReleaseItem[],
        media: (media || []) as PlatformReleaseMedia[],
      };
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['platform-release-notes'] });
    const channel = supabase
      .channel('public-platform-release-notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_releases' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_release_items' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_release_media' }, invalidate)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useMemo(() => {
    const items = query.data?.items || [];
    return {
      ...query,
      release: query.data?.release || null,
      media: query.data?.media || [],
      addedItems: items.filter((item) => item.section === 'added'),
      plannedItems: items.filter((item) => item.section === 'planned'),
    };
  }, [query]);
};

export interface PlatformReleaseBundle {
  release: PlatformReleaseNote;
  addedItems: PlatformReleaseItem[];
  plannedItems: PlatformReleaseItem[];
  media: PlatformReleaseMedia[];
}

export const useAllPlatformReleaseNotes = () => {
  return useQuery({
    queryKey: ['platform-release-notes', 'all-published'],
    queryFn: async () => {
      const { data: releases, error: relError } = await releaseTable()
        .select('*')
        .eq('status', 'published')
        .eq('is_public', true)
        .order('released_at', { ascending: false, nullsFirst: false });

      if (relError) throw relError;
      if (!releases?.length) return [] as PlatformReleaseBundle[];

      const releaseIds = (releases as PlatformReleaseNote[]).map((r) => r.id);

      const [{ data: allItems, error: iErr }, { data: allMedia, error: mErr }] = await Promise.all([
        itemsTable().select('*').in('release_id', releaseIds).eq('is_active', true).order('sort_order', { ascending: true }),
        mediaTable().select('*').in('release_id', releaseIds).order('sort_order', { ascending: true }),
      ]);

      if (iErr) throw iErr;
      if (mErr) throw mErr;

      return (releases as PlatformReleaseNote[]).map((release) => {
        const items = ((allItems || []) as PlatformReleaseItem[]).filter((i) => i.release_id === release.id);
        const media = ((allMedia || []) as PlatformReleaseMedia[]).filter((m) => m.release_id === release.id);
        return {
          release,
          addedItems: items.filter((i) => i.section === 'added'),
          plannedItems: items.filter((i) => i.section === 'planned'),
          media,
        };
      });
    },
    staleTime: 60_000,
  });
};

export const getItemMedia = (media: PlatformReleaseMedia[], itemId: string) =>
  media.filter((entry) => entry.item_id === itemId);

export const getReleaseMedia = (media: PlatformReleaseMedia[]) =>
  media.filter((entry) => !entry.item_id);

export const getVimeoEmbedUrl = (url: string) => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
};
