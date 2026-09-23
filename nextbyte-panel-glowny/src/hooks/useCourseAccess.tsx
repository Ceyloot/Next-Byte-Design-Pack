import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';

export interface CoursePurchase {
  id: string;
  user_id: string;
  course_id: string;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  amount_paid: number;
  currency: string;
  status: string;
  purchased_at: string;
  created_at: string;
  updated_at: string;
}

export const useCourseAccess = () => {
  const [purchases, setPurchases] = useState<CoursePurchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { spendBytes, balance } = useWallet();
  const navigate = useNavigate();

  /**
   * `useCallback` z pustą listą zależności jest tu WYMAGANY, nie kosmetyczny.
   *
   * Ta funkcja wychodzi z hooka jako `refetchPurchases` i ląduje w tablicy
   * zależności `useEffect` w Akademii (NaukaAI.tsx). Bez `useCallback` dostawała
   * nową tożsamość przy każdym renderze, więc efekt odpalał się po każdym
   * renderze — a że w środku wołał `setCelebrationReward({...})` z nowym
   * obiektem, powstawała pętla, którą React ubijał komunikatem „Maximum update
   * depth exceeded". Trafiał w to KAŻDY, kto kupił kurs kartą, bo płatność
   * wraca właśnie na `/akademia?course_purchase=success`.
   */
  const fetchUserPurchases = useCallback(async () => {
    try {
      // Don't fetch if user is not authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPurchases([]);
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from('course_purchases')
        .select('*')
        .eq('status', 'completed')
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching course purchases:', error);
      // Only show toast if it's not an auth error (user not logged in)
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasAccess = (courseId: string) => {
    return purchases.some(purchase => purchase.course_id === courseId);
  };

  const createCourseCheckout = async (courseId: string) => {
    // In-app checkout — navigate to dedicated checkout page (PaymentIntent + Stripe Elements)
    navigate(`/akademia/checkout/${courseId}`);
  };

  const grantCourseAccess = async (userId: string, courseId: string) => {
    try {
      const { data, error } = await supabase.rpc('grant_course_access', {
        p_user_id: userId,
        p_course_id: courseId
      });

      if (error) throw error;
      
      toast({
        title: "Sukces",
        description: "Dostęp do kursu został przyznany",
      });

      return true;
    } catch (error: any) {
      console.error('Error granting course access:', error);
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się przyznać dostępu do kursu",
        variant: "destructive",
      });
      return false;
    }
  };

  const purchaseCourseWithBytes = async (courseId: string, bytePrice: number, courseName?: string) => {
    try {
      if (balance < bytePrice) {
        return { 
          success: false, 
          showBuyDialog: true, 
          requiredBytes: bytePrice, 
          currentBalance: balance,
          itemName: courseName 
        };
      }

      await spendBytes(courseId, 'course', bytePrice);
      await fetchUserPurchases(); // Refresh purchases
      return { success: true };
    } catch (error: any) {
      console.error('Error purchasing course with bytes:', error);
      return { success: false };
    }
  };

  useEffect(() => {
    fetchUserPurchases();
  }, []);

  return {
    purchases,
    isLoading,
    hasAccess,
    createCourseCheckout,
    purchaseCourseWithBytes,
    grantCourseAccess,
    refetch: fetchUserPurchases,
    balance
  };
};