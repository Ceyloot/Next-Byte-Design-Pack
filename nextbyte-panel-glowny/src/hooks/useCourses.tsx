import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { extractYouTubeVideoId } from '@/utils/youtubeUtils';

export interface Course {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'ebook';
  price: number;
  currency: string;
  is_premium: boolean;
  is_active: boolean;
  duration?: string;
  category: string;
  pages?: number;
  students?: number;
  downloads?: number;
  rating: number;
  cover_image_url?: string;
  cover_image_path?: string;
  pdf_file_url?: string;
  pdf_file_path?: string;
  youtube_url?: string;
  byte_price?: number | null;
  ebook_format?: 'pdf' | 'platform';
  visibility?: 'all' | 'subscribers' | 'management_admin';
  created_at: string;
  updated_at: string;
  // Sales data
  sales_count?: number;
}

export const useCourses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      console.log('useCourses - fetching data with optimized query...');
      
      // Fetch courses first
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      if (!coursesData || coursesData.length === 0) return [];

      // Get all course IDs
      const courseIds = coursesData.map(c => c.id);

      // Fetch all sales counts in ONE query using aggregation
      const { data: salesData, error: salesError } = await supabase
        .from('course_purchases')
        .select('course_id')
        .in('course_id', courseIds)
        .eq('status', 'completed');

      if (salesError) {
        console.error('Error fetching sales data:', salesError);
      }

      // Count sales per course
      const salesCount = (salesData || []).reduce((acc, purchase) => {
        acc[purchase.course_id] = (acc[purchase.course_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Merge data
      const coursesWithSales = coursesData.map(course => ({
        ...course,
        sales_count: salesCount[course.id] || 0
      })) as Course[];

      console.log('useCourses - optimized result:', { 
        coursesCount: coursesWithSales.length,
        totalSales: Object.values(salesCount).reduce((a, b) => a + b, 0)
      });

      return coursesWithSales;
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();

      if (error) throw error;

      // If YouTube URL provided, automatically create course structure
      if (courseData.youtube_url && courseData.type === 'course') {
        await createAutoStructure(data.id, courseData.youtube_url, courseData.title);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: 'Sukces',
        description: 'Kurs został utworzony pomyślnie',
      });
    },
    onError: (error) => {
      toast({
        title: 'Błąd',
        description: 'Nie udało się utworzyć kursu',
        variant: 'destructive',
      });
      console.error('Error creating course:', error);
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, ...courseData }: Partial<Course> & { id: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // If YouTube URL provided and no existing structure, create it
      if (courseData.youtube_url && courseData.type === 'course') {
        const hasStructure = await checkCourseStructure(id);
        if (!hasStructure) {
          await createAutoStructure(id, courseData.youtube_url, data.title);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: 'Sukces',
        description: 'Kurs został zaktualizowany pomyślnie',
      });
    },
    onError: (error) => {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować kursu',
        variant: 'destructive',
      });
      console.error('Error updating course:', error);
    },
  });

  // Helper function to check if course has existing structure
  const checkCourseStructure = async (courseId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('course_chapters')
      .select('id')
      .eq('course_id', courseId)
      .limit(1);
    
    if (error) {
      console.error('Error checking course structure:', error);
      return false;
    }
    
    return data && data.length > 0;
  };

  // Helper function to create automatic course structure
  const createAutoStructure = async (courseId: string, youtubeUrl: string, courseTitle: string) => {
    try {
      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Nieprawidłowy URL YouTube');
      }

      // Create chapter
      const { data: chapter, error: chapterError } = await supabase
        .from('course_chapters')
        .insert({
          course_id: courseId,
          title: `Rozdział 1: ${courseTitle}`,
          description: 'Główny rozdział kursu',
          order_index: 0,
          is_active: true
        })
        .select()
        .single();

      if (chapterError) throw chapterError;

      // Create module
      const { data: module, error: moduleError } = await supabase
        .from('course_modules')
        .insert({
          chapter_id: chapter.id,
          title: `Moduł 1: Główne treści`,
          description: 'Główny moduł z materiałami kursu',
          order_index: 0,
          is_active: true
        })
        .select()
        .single();

      if (moduleError) throw moduleError;

      // Create lesson with YouTube video
      const { error: lessonError } = await supabase
        .from('course_lessons')
        .insert({
          module_id: module.id,
          title: `Lekcja 1: ${courseTitle}`,
          description: 'Główna lekcja kursu',
          youtube_video_id: videoId,
          order_index: 0,
          is_active: true,
          is_preview: false
        });

      if (lessonError) throw lessonError;

      toast({
        title: "Sukces",
        description: "Struktura kursu została automatycznie utworzona z filmem YouTube",
      });

    } catch (error: any) {
      console.error('Error creating auto structure:', error);
      toast({
        title: "Uwaga",
        description: "Kurs został utworzony, ale nie udało się automatycznie dodać struktury YouTube",
        variant: "destructive"
      });
    }
  };

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      // First, fetch course details to get file paths
      const { data: course, error: fetchError } = await supabase
        .from('courses')
        .select('cover_image_path, pdf_file_path')
        .eq('id', courseId)
        .single();

      if (fetchError) throw fetchError;

      // Delete cover image if exists
      if (course?.cover_image_path) {
        try {
          const { error: imageError } = await supabase.storage
            .from('course-covers')
            .remove([course.cover_image_path]);
          
          if (imageError && !imageError.message.includes('not found')) {
            console.warn('Error deleting cover image:', imageError);
          }
        } catch (err) {
          console.warn('Error deleting cover image:', err);
        }
      }

      // Delete PDF file if exists
      if (course?.pdf_file_path) {
        try {
          const { error: pdfError } = await supabase.storage
            .from('course-materials')
            .remove([course.pdf_file_path]);
          
          if (pdfError && !pdfError.message.includes('not found')) {
            console.warn('Error deleting PDF file:', pdfError);
          }
        } catch (err) {
          console.warn('Error deleting PDF file:', err);
        }
      }

      // Delete the course (cascade will handle related records)
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: 'Sukces',
        description: 'Kurs i powiązane pliki zostały usunięte',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting course:', error);
      toast({
        title: 'Błąd',
        description: `Nie udało się usunąć kursu: ${error.message || 'Sprawdź uprawnienia'}`,
        variant: 'destructive',
      });
    },
  });

  const uploadCoverImage = async (file: File, courseId?: string) => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${courseId || Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('course-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-covers')
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
      };
    } catch (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się wgrać okładki',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteOldCoverImage = async (imagePath: string) => {
    try {
      await supabase.storage
        .from('course-covers')
        .remove([imagePath]);
    } catch (error) {
      console.error('Error deleting old cover image:', error);
    }
  };

  return {
    courses,
    isLoading,
    error,
    createCourse: createCourseMutation.mutate,
    updateCourse: updateCourseMutation.mutate,
    updateCourseAsync: updateCourseMutation.mutateAsync,
    deleteCourse: deleteCourseMutation.mutate,
    uploadCoverImage,
    deleteOldCoverImage,
    isCreating: createCourseMutation.isPending,
    isUpdating: updateCourseMutation.isPending,
    isDeleting: deleteCourseMutation.isPending,
  };
};