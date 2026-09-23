import React, { createContext, useContext } from 'react';

/**
 * WERSJA BEZ SUPABASE — tylko podgląd wyglądu Panelu Głównego, bez żadnych
 * połączeń do Stripe/Supabase. Zachowuje ten sam kształt kontekstu, żeby
 * komponenty korzystające z `useSubscriptionContext` działały bez zmian.
 */
interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: 'Premium' | 'Ultimate' | string;
  subscription_billing?: 'monthly' | 'yearly';
  subscription_end?: string;
  subscription_type?: string;
  monthly_bytes_limit?: number;
  subscription_price_pln?: number | null;
  monthly_bytes_last_granted?: string;
  subscription_started?: string;
  payment_failed?: boolean;
  grace_period_end?: string;
  cancel_at_period_end?: boolean;
}

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  isSubscribed: boolean;
  isStaleData: boolean;
  refreshSubscription: () => void;
  retryCount: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STATIC_VALUE: SubscriptionContextType = {
  subscriptionStatus: { subscribed: false },
  isLoading: false,
  error: null,
  isSubscribed: false,
  isStaleData: false,
  refreshSubscription: () => {},
  retryCount: 0,
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => (
  <SubscriptionContext.Provider value={STATIC_VALUE}>{children}</SubscriptionContext.Provider>
);

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};
