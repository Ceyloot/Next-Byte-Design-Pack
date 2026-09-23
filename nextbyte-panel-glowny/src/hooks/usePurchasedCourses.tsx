import { maDostepDoMaterialu } from '@/lib/akademia/maDostep';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCourses, Course } from '@/hooks/useCourses';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

export interface PurchasedCourse extends Course {
  hasAccess: boolean;
}

export const usePurchasedCourses = () => {
  const { courses } = useCourses();
  const { hasAccess } = useCourseAccess();
  const { isSubscribed } = useSubscriptionContext();

  const { data: purchasedCourses, isLoading } = useQuery({
    queryKey: ['purchased-courses', courses, isSubscribed],
    queryFn: async () => {
      if (!courses) return [];
      
      // Filter courses that user has access to
      const accessibleCourses: PurchasedCourse[] = courses
        .filter(course => {
          // Include courses user has access to:
          // 1. Free courses (price = 0)
          // 2. Premium courses if user is subscribed
          // 3. Paid courses user has purchased
          const userHasAccess = maDostepDoMaterialu(course, isSubscribed, hasAccess); // 08.09: jedno źródło
          
          return userHasAccess && course.type === 'course' && course.is_active;
        })
        .map(course => ({
          ...course,
          hasAccess: true
        }));

      return accessibleCourses;
    },
    enabled: !!courses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    purchasedCourses: purchasedCourses || [],
    isLoading
  };
};