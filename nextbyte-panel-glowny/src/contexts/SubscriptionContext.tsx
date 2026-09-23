import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SHORT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for post-purchase
const POST_PURCHASE_WINDOW = 30 * 60 * 1000; // 30 minutes window for short cache
const STORAGE_KEY = 'subscription_cache_v3';
const DEBOUNCE_DELAY = 1000; // 1 second

interface CachedData {
  data: SubscriptionStatus;
  timestamp: number;
}

/**
 * Poniżej tego wieku cache uznajemy za świeży i NIE odświeżamy w tle.
 * check-subscription woła Stripe API (customers.list + subscriptions.list +
 * subscriptions.search — `search` to najdroższy i najostrzej limitowany
 * endpoint Stripe'a). Limit Stripe'a to ~100 req/s na konto, więc odświeżanie
 * przy każdym wejściu na stronę ustawia TWARDY SUFIT ~100 załadowań strony
 * na sekundę dla całej platformy — niezależnie od tego, ile wytrzyma Supabase.
 * Przy premierze do 500 tys. obserwujących to jest pierwsza rzecz, która pada.
 */
const BACKGROUND_REFRESH_AFTER = 60 * 60 * 1000; // 1 godzina

// Synchronous cache read for instant render
const getInitialSubscriptionFromCache = (): {
  data: SubscriptionStatus | null;
  fromCache: boolean;
  /** Wiek cache w ms — decyduje, czy w ogóle wołać Stripe. */
  ageMs: number;
} => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const { data, timestamp }: CachedData = JSON.parse(cached);
      const ageMs = Date.now() - timestamp;
      if (ageMs < CACHE_DURATION) {
        return { data, fromCache: true, ageMs };
      }
    }
  } catch { /* ignore */ }
  return { data: null, fromCache: false, ageMs: Infinity };
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const initialCache = getInitialSubscriptionFromCache();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(initialCache.data);
  const [isLoading, setIsLoading] = useState(!initialCache.fromCache);
  const [error, setError] = useState<string | null>(null);
  const [isStaleData, setIsStaleData] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);
  const lastCheckRef = useRef<number>(0);
  const activeRequestRef = useRef<Promise<SubscriptionStatus> | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const checkSubscription = useCallback(async (force = false): Promise<void> => {
    try {
      if (!mountedRef.current) return;

      const now = Date.now();
      
      // Enhanced debouncing - prevent too frequent requests
      if (!force && now - lastCheckRef.current < DEBOUNCE_DELAY) {
        console.log('🔄 Request debounced, too soon since last check');
        return;
      }

      // Use existing request if one is in progress
      if (activeRequestRef.current) {
        console.log('🔄 Using existing active request');
        const result = await activeRequestRef.current;
        if (mountedRef.current) {
          setSubscriptionStatus(result);
          setIsLoading(false);
          setError(null);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      lastCheckRef.current = now;
      
      // Check if we're in post-purchase window for short cache
      const postPurchaseFlag = localStorage.getItem('post_purchase');
      const isPostPurchase = postPurchaseFlag && (now - parseInt(postPurchaseFlag)) < POST_PURCHASE_WINDOW;
      
      if (isPostPurchase) {
        console.log('🛒 SubscriptionContext - Post-purchase mode: using short cache');
      }

      // Create and track the active request
      const requestPromise = (async (): Promise<SubscriptionStatus> => {
        try {
          const { data: session } = await supabase.auth.getSession();
          
          if (!session?.session?.user) {
            console.log('ℹ️ No authenticated user found, using anonymous subscription state');
            return { subscribed: false };
          }

          console.log('🔄 Checking subscription status...');
          
          const { data, error: functionError } = await supabase.functions.invoke('check-subscription', {
            headers: {
              Authorization: `Bearer ${session.session.access_token}`,
            },
          });

          if (functionError) {
            console.error('❌ Subscription check error:', functionError);
            throw functionError;
          }

          const result: SubscriptionStatus = {
            subscribed: data?.subscribed || false,
            subscription_tier: data?.subscription_tier,
            subscription_billing: data?.subscription_billing,
            subscription_end: data?.subscription_end,
            subscription_type: data?.subscription_type,
            monthly_bytes_limit: data?.monthly_bytes_limit,
            subscription_price_pln: data?.subscription_price_pln ?? null,
            monthly_bytes_last_granted: data?.monthly_bytes_last_granted,
            subscription_started: data?.subscription_started,
            payment_failed: data?.payment_failed || false,
            grace_period_end: data?.grace_period_end,
            cancel_at_period_end: data?.cancel_at_period_end || false,
          };

          console.log('✅ Subscription status retrieved:', result);

          // Cache the result
          try {
            const effectiveCacheDuration = isPostPurchase ? SHORT_CACHE_DURATION : CACHE_DURATION;
            const cacheData: CachedData = {
              data: result,
              timestamp: Date.now(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
            console.log('💾 Subscription cached successfully', { 
              effectiveDuration: effectiveCacheDuration,
              isPostPurchase 
            });
          } catch (e) {
            console.warn('Failed to cache subscription:', e);
          }

          return result;
        } finally {
          activeRequestRef.current = null;
        }
      })();

      activeRequestRef.current = requestPromise;
      const result = await requestPromise;

      if (mountedRef.current) {
        setSubscriptionStatus(result);
        setIsLoading(false);
        setError(null);
      }
    } catch (err: any) {
      console.error('❌ Error checking subscription:', err);
      
      if (mountedRef.current) {
        const errorMsg = err.message || 'Failed to check subscription';
        setError(errorMsg);
        setIsLoading(false);
        
        // Try to preserve last known good status from cache
        try {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            const { data }: CachedData = JSON.parse(cached);
            setSubscriptionStatus(data);
            setIsStaleData(true); // Mark as stale
            console.log('⚠️ Using stale cached data due to error:', data);
            
            // Auto-retry for network errors (max 3 attempts)
            if (retryCount < 3 && errorMsg.includes('network')) {
              const delay = (retryCount + 1) * 3000; // 3s, 6s, 9s
              console.log(`🔄 Auto-retry in ${delay}ms (attempt ${retryCount + 1}/3)`);
              
              retryTimeoutRef.current = setTimeout(() => {
                if (mountedRef.current) {
                  setRetryCount(prev => prev + 1);
                  checkSubscription(true);
                }
              }, delay);
            }
          } else {
            // Only set false if we have NO cached data at all
            console.log('⚠️ No cached data, preserving current status or defaulting to false');
            if (!subscriptionStatus) {
              setSubscriptionStatus({ subscribed: false });
            }
          }
        } catch (cacheError) {
          console.warn('Failed to load cache fallback:', cacheError);
          // Preserve existing status if available
          if (!subscriptionStatus) {
            setSubscriptionStatus({ subscribed: false });
          }
        }
      }
    }
  }, []);

  const refreshSubscription = useCallback(() => {
    console.log('🔄 Manual subscription refresh requested');
    // Clear cache
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear subscription cache:', e);
    }
    
    // Set post-purchase flag for short cache duration
    localStorage.setItem('post_purchase', Date.now().toString());
    
    // Clear any pending debounce and retry
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    // Reset retry count and stale flag
    setRetryCount(0);
    setIsStaleData(false);
    setError(null);
    
    // Force check
    checkSubscription(true);
  }, [checkSubscription]);

  // Load subscription on init — skip if already loaded from cache synchronously
  useEffect(() => {
    // UWAGA: poprzednio OBIE gałęzie tego `if` robiły dokładnie to samo
    // (`checkSubscription()`), więc komentarz „skip if already loaded from cache"
    // był nieprawdziwy — Stripe był wołany przy KAŻDYM załadowaniu strony,
    // niezależnie od cache. Cache 24h gatował tylko renderowanie, nie sieć.
    if (initialCache.fromCache) {
      // Cache świeży (< 1h) — nie ruszamy Stripe'a w ogóle.
      if (initialCache.ageMs < BACKGROUND_REFRESH_AFTER) return;
      // Cache ważny, ale starszy niż godzina — odświeżamy w tle, nie blokując UI.
      checkSubscription();
      return;
    }
    // Brak ważnego cache — musimy pobrać.
    checkSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSubscription]);

  // Auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (event === 'SIGNED_IN') {
        // Debounce the subscription check after auth changes
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            console.log('🔄 Checking subscription after auth change');
            checkSubscription(true);
          }
        }, 500);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('⏭️ Skipping subscription check on TOKEN_REFRESHED');
      } else if (event === 'SIGNED_OUT') {
        // Handle signout immediately without any async operations
        setSubscriptionStatus({ subscribed: false });
        setIsLoading(false);
        setError(null);
        
        // Clear cache on sign out (non-blocking)
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('post_purchase');
        } catch (e) {
          console.warn('Failed to clear subscription cache on signout:', e);
        }
        
        // Cancel any active requests
        activeRequestRef.current = null;
        
        // Clear debounce timeout
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSubscription]);

  // Realtime subscription to subscribers table changes
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('subscription-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscribers',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 Realtime: subscribers table changed', payload);
            // Force refresh subscription status
            refreshSubscription();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtimeSubscription();
    return () => {
      cleanup.then(fn => fn?.());
    };
  }, [refreshSubscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const contextValue: SubscriptionContextType = {
    subscriptionStatus,
    isLoading,
    error,
    isSubscribed: subscriptionStatus?.subscribed || false,
    isStaleData,
    refreshSubscription,
    retryCount,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};