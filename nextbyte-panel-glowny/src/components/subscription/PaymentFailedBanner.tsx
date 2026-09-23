import React, { useState } from 'react';
import { AlertTriangle, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentFailedBannerProps {
  gracePeriodEnd: string;
}

const PaymentFailedBanner = ({ gracePeriodEnd }: PaymentFailedBannerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const now = new Date();
  const endDate = new Date(gracePeriodEnd);
  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const handleManagePayment = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Nie jesteś zalogowany');

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      window.open(data.url, '_blank');
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się otworzyć panelu płatności",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-4 mt-2 rounded-xl border border-destructive/30 nb-szklo p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-destructive">
            Płatność nie powiodła się
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Zaktualizuj dane karty, aby zachować dostęp Premium.
            {remainingDays > 0 && (
              <span className="font-medium text-destructive/80">
                {' '}Pozostało {remainingDays} {remainingDays === 1 ? 'dzień' : remainingDays < 5 ? 'dni' : 'dni'}.
              </span>
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManagePayment}
            disabled={isLoading}
            className="mt-2 h-8 text-xs border-destructive/30 hover:bg-destructive/20 text-destructive"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <CreditCard className="w-3 h-3 mr-1" />
            )}
            Zaktualizuj kartę
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedBanner;
