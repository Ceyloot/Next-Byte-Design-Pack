import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhotoStudioModel } from './usePhotoStudioModels';

export interface UnifiedPhotoStudioModels {
  fast: PhotoStudioModel | null;
  pro: PhotoStudioModel | null;
  more: PhotoStudioModel[];
  all: PhotoStudioModel[];
}

/**
 * Zunifikowany hook dla Studio Zdjęć: zwraca w jednym zapytaniu mapowanie
 * jakości (Szybki/Pro) z `photo_studio_settings` oraz listę pozostałych
 * aktywnych modeli oznaczonych do pokazania w sekcji "Więcej".
 *
 * Wszystko, co admin ustawi w panelu (provider, cena, miniaturka, kolejność,
 * dostępność, „pokaż w Więcej"), propaguje się tu natychmiast po
 * `invalidateQueries(['photo-studio-models'])`.
 */
export const usePhotoStudioUnifiedModels = () => {
  return useQuery({
    queryKey: ['photo-studio-unified-models'],
    queryFn: async (): Promise<UnifiedPhotoStudioModels> => {
      const [{ data: settings }, { data: models, error }] = await Promise.all([
        supabase
          .from('photo_studio_settings' as any)
          .select('fast_model_id, pro_model_id')
          .eq('id', 'default')
          .maybeSingle(),
        supabase
          .from('photo_studio_models')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      ]);

      if (error) throw error;
      const list = (models || []) as PhotoStudioModel[];

      const fastId = (settings as any)?.fast_model_id ?? null;
      const proId = (settings as any)?.pro_model_id ?? null;

      const fast = fastId ? list.find((m) => m.id === fastId) ?? null : null;
      const pro = proId ? list.find((m) => m.id === proId) ?? null : null;

      // "Więcej" = wszystkie pozostałe aktywne modele oznaczone show_in_more,
      // bez tych już przypisanych do Szybki/Pro (żeby nie duplikować).
      const more = list.filter(
        (m) => m.show_in_more && m.id !== fastId && m.id !== proId
      );

      return { fast, pro, more, all: list };
    },
    staleTime: 60_000,
  });
};
