import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { opiszUrzadzenie } from '@/lib/opisUrzadzenia';
import { kluczeSubskrypcji } from '@/lib/kluczePush';
import { isNativePlatform } from '@/lib/native';

// Extend ServiceWorkerRegistration to include pushManager (not in all TS libs)
interface PushServiceWorkerRegistration extends ServiceWorkerRegistration {
  pushManager: PushManager;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationsState {
  /** Czy da się poprosić o zgodę TERAZ, w tym oknie. */
  isSupported: boolean;
  /* Czy urządzenie w ogóle potrafi push — niezależnie od tego, czy aplikacja
     jest dodana do ekranu początkowego.

     Te dwie rzeczy trzeba rozdzielić, bo na iPhonie różnią się właśnie tam,
     gdzie to boli: w Safari `isSupported` jest fałszywe (Safari nie pozwoli
     poprosić o zgodę poza aplikacją), więc każdy warunek oparty na nim
     wygaszał zachętę dokładnie tym ludziom, którym miała powiedzieć, co
     zrobić. `hasPushApi` jest tam prawdziwe od iOS 16.4 — czyli dokładnie
     wtedy, gdy dodanie do ekranu początkowego naprawdę coś zmieni. */
  hasPushApi: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  isLoading: boolean;
  isiOS: boolean;
  isPWA: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const nativeRegisteredRef = useRef(false);
  const [state, setState] = useState<PushNotificationsState>({
    isSupported: false,
    hasPushApi: false,
    isSubscribed: false,
    permission: 'default',
    isLoading: false,
    isiOS: false,
    isPWA: false,
    error: null,
  });
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);

  useEffect(() => {
    // Native Capacitor push — handle separately
    if (isNativePlatform()) {
      setState(prev => ({ ...prev, isSupported: true, hasPushApi: true }));
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Detect PWA mode (standalone)
    const isPWAMode = window.matchMedia('(display-mode: standalone)').matches || 
                      (navigator as any).standalone === true;

    // Check support
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    const hasNotification = 'Notification' in window;

    // On iOS, push only works when running as PWA
    const isSupported = hasServiceWorker && hasPushManager && hasNotification && 
                       (!isIOSDevice || isPWAMode);

    setState(prev => ({
      ...prev,
      isiOS: isIOSDevice,
      isPWA: isPWAMode,
      isSupported,
      hasPushApi: hasServiceWorker && hasPushManager && hasNotification,
      permission: hasNotification ? Notification.permission : 'default',
    }));

    // Check existing subscription
    checkSubscription();
  }, []);

  // Fetch VAPID public key from edge function
  useEffect(() => {
    const fetchVapidKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-vapid-public-key');
        if (error) {
          console.error('[Push] Error fetching VAPID key:', error);
          return;
        }
        if (data?.vapid_public_key) {
          setVapidPublicKey(data.vapid_public_key);
          console.log('[Push] VAPID public key loaded');
        }
      } catch (error) {
        console.error('[Push] Error fetching VAPID key:', error);
      }
    };
    fetchVapidKey();
  }, []);

  const checkSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator)) return;

      // Use the main service worker registration (registered in main.tsx)
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setState(prev => ({ ...prev, isSubscribed: false }));
        return;
      }

      const subscription = await (registration as PushServiceWorkerRegistration).pushManager.getSubscription();
      setState(prev => ({ ...prev, isSubscribed: !!subscription }));
    } catch (error) {
      console.error('[Push] Error checking subscription:', error);
      setState(prev => ({ ...prev, isSubscribed: false }));
    }
  };

  // Native Capacitor push registration
  const subscribeNative = useCallback(async () => {
    if (nativeRegisteredRef.current) return;
    nativeRegisteredRef.current = true;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const { Capacitor } = await import('@capacitor/core');

      const permResult = await PushNotifications.requestPermissions();
      if (permResult.receive !== 'granted') {
        setState(prev => ({ ...prev, isLoading: false, permission: 'denied' as any }));
        throw new Error('Uprawnienia do powiadomień zostały odrzucone');
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', async (tokenData) => {
        console.log('[Push Native] Token:', tokenData.value);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('push_device_tokens' as any)
            .upsert(
              {
                user_id: user.id,
                token: tokenData.value,
                platform: Capacitor.getPlatform(),
                device_name: navigator.userAgent.slice(0, 100),
                is_active: true,
                updated_at: new Date().toISOString(),
              } as any,
              { onConflict: 'user_id,token' }
            );
        }
        setState(prev => ({ ...prev, isSubscribed: true, isLoading: false, permission: 'granted' as any }));
      });

      PushNotifications.addListener('registrationError', (err) => {
        console.error('[Push Native] Registration error:', err);
        setState(prev => ({ ...prev, isLoading: false, error: 'Błąd rejestracji powiadomień' }));
        nativeRegisteredRef.current = false;
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📬 Push received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        const data = action.notification.data;
        if (data?.url) {
          window.location.href = data.url;
        }
      });
    } catch (e: any) {
      setState(prev => ({ ...prev, isLoading: false, error: e.message }));
      nativeRegisteredRef.current = false;
      throw e;
    }
  }, []);

  const subscribe = useCallback(async () => {
    // Use native Capacitor push on mobile
    if (isNativePlatform()) {
      return subscribeNative();
    }

    if (!state.isSupported) {
      throw new Error('Powiadomienia push nie są wspierane w tej przeglądarce');
    }

    if (!vapidPublicKey) {
      throw new Error('Klucz VAPID nie został załadowany');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('[Push] Starting subscribe flow...');
      console.log('[Push] isSupported:', state.isSupported, 'vapidKey:', !!vapidPublicKey);
      
      // Request permission (MUST be triggered by user gesture)
      const permission = await Notification.requestPermission();
      console.log('[Push] Permission result:', permission);
      setState(prev => ({ ...prev, permission }));

      if (permission !== 'granted') {
        throw new Error('Uprawnienia do powiadomień zostały odrzucone');
      }

      // Use existing service worker (registered in main.tsx) - avoids scope conflict
      console.log('[Push] Waiting for service worker ready...');
      
      // Add timeout to detect stuck SW registration
      const registrationPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Service Worker nie jest gotowy - spróbuj odświeżyć stronę')), 10000)
      );
      
      const registration = await Promise.race([registrationPromise, timeoutPromise]);
      console.log('[Push] Service worker ready, scope:', registration.scope);

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      
      console.log('[Push] Subscribing with VAPID key, length:', applicationServerKey.length);
      
      let subscription;
      try {
        subscription = await (registration as PushServiceWorkerRegistration).pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer
        });
      } catch (subscribeError: any) {
        console.error('[Push] pushManager.subscribe failed:', subscribeError);
        // On some Android devices, need to pass ArrayBuffer explicitly
        subscription = await (registration as PushServiceWorkerRegistration).pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer
        });
      }

      console.log('[Push] Push subscription:', subscription);

      const klucze = kluczeSubskrypcji(subscription);
      if (!klucze) {
        throw new Error('Nie udało się uzyskać kluczy subskrypcji');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      /* Zapis idzie przez `przejmij-push`, nie prosto do tabeli.

         Punkt końcowy należy do PRZEGLĄDARKI, a tabela ma UNIQUE na parze
         (konto, punkt). Zapis prosto do tabeli zostawiłby więc wiersz
         poprzedniego konta na tym samym urządzeniu — czyli jego powiadomienia
         lądowałyby na cudzym ekranie. Cudzego wiersza front skasować nie może
         (RLS), robi to funkcja po sprawdzeniu, że klucze subskrypcji się
         zgadzają — czyli że to naprawdę ta sama przeglądarka.

         Opis urządzenia zapisujemy TU, bo to jedyny moment, w którym
         przeglądarka o sobie mówi: z samego adresu punktu końcowego da się
         odczytać co najwyżej dostawcę (Apple/Google), nie urządzenie. */
      const { error } = await supabase.functions.invoke('przejmij-push', {
        body: {
          endpoint: subscription.endpoint,
          p256dh: klucze.p256dh,
          auth: klucze.auth,
          urzadzenie: opiszUrzadzenie(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        },
      });

      if (error) {
        console.error('[Push] Error storing subscription:', error);
        throw new Error('Nie udało się zapisać subskrypcji');
      }

      setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
      console.log('[Push] Successfully subscribed to push notifications');

    } catch (error: any) {
      console.error('[Push] Error subscribing:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Wystąpił błąd podczas subskrypcji'
      }));
      throw error;
    }
  }, [state.isSupported, vapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use existing service worker registration
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
        return;
      }

      const subscription = await (registration as PushServiceWorkerRegistration).pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint);
        }
      }

      setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
      console.log('[Push] Successfully unsubscribed from push notifications');

    } catch (error: any) {
      console.error('[Push] Error unsubscribing:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Wystąpił błąd podczas wypisywania'
      }));
      throw error;
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Użytkownik nie jest zalogowany');

      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: user.id,
          payload: {
            title: 'Test powiadomienia 🔔',
            body: 'Powiadomienia push działają poprawnie!',
            url: '/panel-glowny'
          }
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[Push] Error sending test:', error);
      throw error;
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification,
    checkSubscription,
  };
}
