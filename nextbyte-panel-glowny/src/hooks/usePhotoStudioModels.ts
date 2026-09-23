import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PhotoStudioProvider = 'runware' | 'google' | 'openai' | 'bfl' | 'nextbyte';

export interface PhotoStudioModel {
  id: string;
  name: string;
  model_id: string;
  description: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  is_premium: boolean;
  byte_cost: number;
  byte_cost_1k: number;
  byte_cost_2k: number;
  byte_cost_4k: number;
  sort_order: number;
  provider: PhotoStudioProvider;
  show_in_more: boolean;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export const usePhotoStudioModels = () => {
  return useQuery({
    queryKey: ['photo-studio-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photo_studio_models')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as PhotoStudioModel[];
    },
  });
};

export const useAllPhotoStudioModels = () => {
  return useQuery({
    queryKey: ['photo-studio-models-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photo_studio_models')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as PhotoStudioModel[];
    },
  });
};

export const useCreatePhotoStudioModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (model: Omit<PhotoStudioModel, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('photo_studio_models')
        .insert(model)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-studio-models'] });
      queryClient.invalidateQueries({ queryKey: ['photo-studio-models-all'] });
      queryClient.invalidateQueries({ queryKey: ['photo-studio-unified-models'] });
      queryClient.invalidateQueries({ queryKey: ['photo-studio-quality-models'] });
      toast.success('Model dodany pomyślnie');
    },
    onError: (error) => {
      console.error('Error creating model:', error);
      toast.error('Błąd podczas dodawania modelu');
    },
  });
};

export const useUpdatePhotoStudioModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PhotoStudioModel> & { id: string }) => {
      const { data, error } = await supabase
        .from('photo_studio_models')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-studio-models'] });
      queryClient.invalidateQueries({ queryKey: ['photo-studio-models-all'] });
      queryClient.invalidateQueries({ queryKey: ['photo-studio-unified-models'] });
      queryClient.invalidateQueries({ queryKey: ['photo-studio-quality-models'] });
      toast.success('Model zaktualizowany');
    },
    onError: (error) => {
      console.error('Error updating model:', error);
      toast.error('Błąd podczas aktualizacji modelu');
    },
  });
};

export const useDeletePhotoStudioModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('photo_studio_models')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-studio-models'] });
      queryClient.invalidateQueries({ queryKey: ['photo-studio-models-all'] });
      queryClient.invalidateQueries({ queryKey: ['photo-studio-unified-models'] });
      queryClient.invalidateQueries({ queryKey: ['photo-studio-quality-models'] });
      toast.success('Model usunięty');
    },
    onError: (error) => {
      console.error('Error deleting model:', error);
      toast.error('Błąd podczas usuwania modelu');
    },
  });
};
