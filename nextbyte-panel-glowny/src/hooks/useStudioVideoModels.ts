import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { StudioVideoModel, VideoModelPricing } from '@/components/studio-video/constants';

/**
 * Modele Studio Video = jedno źródło prawdy (tabela `studio_video_models`).
 * Czyta to KLIENT (wycena/lista) i EDGE `studio-video-generate` (realne pobranie Byte).
 * Wzór hooka: usePhotoStudioModels. Typy tabeli nie są wygenerowane → `(supabase as any)`.
 */

/** Surowy wiersz tabeli (kształt admina). */
export interface StudioVideoModelRow {
  id: string;
  model_id: string;
  name: string;
  tagline: string | null;
  badge: string | null;
  provider: string;
  /** i2v | awatar | lipsync — patrz `StudioVideoModel.rodzaj`. */
  rodzaj?: string;
  supports_audio: boolean;
  durations: number[] | null;
  pricing: VideoModelPricing; // jsonb { [quality]: { base, audio? } }
  is_active: boolean;
  is_premium: boolean;
  sort_order: number;
  quality_rating: number | null;
  speed_rating: number | null;
  created_at: string;
  updated_at: string;
}

/** Wiersz DB → kształt modelu używany przez generator (StudioVideoModel). */
export function rowToStudioVideoModel(r: StudioVideoModelRow): StudioVideoModel {
  return {
    id: r.model_id,
    name: r.name,
    tagline: r.tagline ?? '',
    pricing: r.pricing && typeof r.pricing === 'object' ? r.pricing : undefined,
    badge: r.badge ?? undefined,
    supportsAudio: !!r.supports_audio,
    durations: Array.isArray(r.durations) && r.durations.length ? r.durations : undefined,
    isPremium: !!r.is_premium,
    sortOrder: r.sort_order,
    provider: r.provider ?? undefined,
    /* Rodzaj przechodzi WPROST, gdy jest znany. Do 02.09.2026 wszystko poza
       „awatar"/„lipsync" spadało do „i2v" — więc „Klonowanie głosu" (glos)
       i modele mowy (tts) lądowały na liście modeli SCENOWYCH w oknie
       wyboru Generatora, choć film z nich nie powstanie. */
    rodzaj: (['i2v', 'awatar', 'lipsync', 'glos', 'tts'] as const).includes(r.rodzaj as never)
      ? (r.rodzaj as StudioVideoModel['rodzaj'])
      : 'i2v',
    qualityRating: r.quality_rating ?? undefined,
    speedRating: r.speed_rating ?? undefined,
  };
}

/** Aktywne modele dla generatora (posortowane). */
export const useStudioVideoModels = () => {
  return useQuery({
    queryKey: ['studio-video-models'],
    queryFn: async (): Promise<StudioVideoModel[]> => {
      const { data, error } = await (supabase as any)
        .from('studio_video_models')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return ((data ?? []) as StudioVideoModelRow[]).map(rowToStudioVideoModel);
    },
    staleTime: 60_000,
  });
};

/**
 * Modele SCENOWE (obraz → wideo) — dla Generatora i Pro Editora.
 *
 * Odkąd tabela trzyma też modele awatarowe i lipsync, sama lista „aktywnych"
 * przestała odpowiadać na pytanie „co mogę wybrać tutaj". Awatar bez nagrania
 * albo lipsync bez filmu źródłowego zostałyby odrzucone, i to PO pobraniu Byte
 * — bo Generator takich pól w ogóle nie zbiera.
 *
 * Filtr siedzi w hooku, nie w każdym widoku z osobna: trzy miejsca czytają tę
 * listę (Generator, Pro Editor, ustawienia klipu) i pominięcie któregokolwiek
 * dałoby model widoczny tam, gdzie działać nie może.
 */
export const useModeleScenowe = () => {
  const q = useStudioVideoModels();
  return {
    ...q,
    data: q.data?.filter((m) => (m.rodzaj ?? 'i2v') === 'i2v'),
  };
};

/** Wszystkie modele (panel Zarządu). */
export const useAllStudioVideoModels = () => {
  return useQuery({
    queryKey: ['studio-video-models-all'],
    queryFn: async (): Promise<StudioVideoModelRow[]> => {
      const { data, error } = await (supabase as any)
        .from('studio_video_models')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as StudioVideoModelRow[];
    },
  });
};

type NewModel = Omit<StudioVideoModelRow, 'id' | 'created_at' | 'updated_at'>;

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['studio-video-models'] });
  qc.invalidateQueries({ queryKey: ['studio-video-models-all'] });
}

export const useCreateStudioVideoModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (model: NewModel) => {
      const { data, error } = await (supabase as any)
        .from('studio_video_models')
        .insert(model)
        .select()
        .single();
      if (error) throw error;
      return data as StudioVideoModelRow;
    },
    onSuccess: () => { invalidate(qc); toast.success('Model dodany.'); },
    onError: (e: any) => {
      console.error('create studio_video_model', e);
      toast.error(e?.message?.includes('duplicate') ? 'Model o tym ID już istnieje.' : 'Błąd dodawania modelu.');
    },
  });
};

export const useUpdateStudioVideoModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StudioVideoModelRow> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('studio_video_models')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as StudioVideoModelRow;
    },
    onSuccess: () => { invalidate(qc); toast.success('Zapisano zmiany.'); },
    onError: (e: any) => { console.error('update studio_video_model', e); toast.error('Błąd zapisu modelu.'); },
  });
};

export const useDeleteStudioVideoModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('studio_video_models').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(qc); toast.success('Model usunięty.'); },
    onError: (e: any) => { console.error('delete studio_video_model', e); toast.error('Błąd usuwania modelu.'); },
  });
};
