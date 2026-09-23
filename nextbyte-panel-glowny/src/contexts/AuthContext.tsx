import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { verifyDeviceTrust, clearDeviceTrust, revokeDeviceTrust, getDeviceTrust } from '@/lib/deviceTrust';
import { hotCache } from '@/lib/hotMemoryCache';
import { zdarzenie } from '@/lib/analityka';

interface SignOutOptions {
  /** If true, preserve remember-me flag and device trust token (used for idle timeouts) */
  preserveRememberMe?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: (options?: SignOutOptions) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fast synchronous session check from storage — eliminates cold-start flicker
const AUTH_STORAGE_KEY = 'sb-iwuvszxeutvmzcfuetuo-auth-token';

const getStoredAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return null;
  }
};

const getStoredSession = (): { valid: boolean; user: User | null; session: Session | null } => {
  try {
    const raw = getStoredAuthToken();
    if (!raw) return { valid: false, user: null, session: null };
    const parsed = JSON.parse(raw);
    const expiresAt = parsed?.expires_at ?? 0;
    if (expiresAt <= Math.floor(Date.now() / 1000) + 60) {
      return { valid: false, user: null, session: null };
    }
    const user = parsed?.user ?? null;
    const session = parsed as Session;
    return { valid: true, user, session };
  } catch {
    return { valid: false, user: null, session: null };
  }
};

// Run once at module load for synchronous initialization
const storedSession = getStoredSession();

const clearUserScopedStorage = () => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith('nextbyte_activity_') ||
        key.startsWith('compressed_cache_') ||
        key.startsWith('encryption_key_') ||
        key === 'subscription_cache' ||
        key === 'post_purchase' ||
        key === 'userSettings' ||
        key === 'nav-patterns' ||
        /* ── NEXTCLOUD: KLUCZE Z TREŚCIĄ, NIE Z USTAWIENIAMI (10.09.2026) ──
           `nextcloud-items` to wykaz plików sprzed przeniesienia chmury na
           serwer, a `nextcloud-karty-*` to historia otwartych folderów wraz
           z ich nazwami. Jedno i drugie zostawało po wylogowaniu, więc druga
           osoba na tym samym komputerze widziała ślad po pierwszej.
           CELOWO WĄSKO: preferencje widoku i sortowania (`nextcloud-widok`,
           `nextcloud-sortowanie`) niczyje nie są i mają przeżyć wylogowanie —
           `clearUserScopedStorage` chodzi także przy zwykłym wylogowaniu. */
        key === 'nextcloud-items' ||
        key.startsWith('nextcloud-karty-')
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {}

  /* Baza treści plików. Jest przypisana do DOMENY, nie do konta, więc bez tego
     kroku miniatury i zawartość jednej osoby zostawały dla następnej. Moduł
     kasuje ją także przy starcie, ale tam robi to RAZ na życie karty — a zmiana
     konta strony nie przeładowuje. `onblocked` loguje, bo kasowanie czeka,
     dopóki inna karta trzyma otwarte połączenie, i bez śladu byłoby to
     niewidoczne. */
  try {
    if (typeof indexedDB !== 'undefined') {
      const zadanie = indexedDB.deleteDatabase('nextcloud-files');
      zadanie.onblocked = () => console.warn('[auth] nextcloud-files: kasowanie czeka na inną kartę');
    }
  } catch {}

  hotCache.clear();
};

const clearBrowserCachesAndWorkers = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister().catch(() => undefined)));
    }
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }
  } catch (error) {
    console.warn('[AUTH] Browser cache cleanup skipped:', error);
  }
};

const rememberLastAuthUser = (userId: string | null) => {
  try {
    const previousUserId = localStorage.getItem('nextbyte_last_auth_user_id');
    if (userId && previousUserId && previousUserId !== userId) {
      clearUserScopedStorage();
      window.dispatchEvent(new Event('app:auth-user-changed'));
    }
    if (userId) {
      localStorage.setItem('nextbyte_last_auth_user_id', userId);
    } else {
      localStorage.removeItem('nextbyte_last_auth_user_id');
    }
  } catch {}
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(storedSession.user);
  const [session, setSession] = useState<Session | null>(storedSession.session);
  const [isLoading, setIsLoading] = useState(!storedSession.valid);
  const initializedRef = useRef(false);
  const hasUnverifiedCachedUserRef = useRef(Boolean(storedSession.valid && storedSession.user));
  const sessionRefreshInFlightRef = useRef(false);
  const signedOutRef = useRef(false);
  const forceLogoutCheckedTokenRef = useRef<string | null>(null);
  /* Pomiar lejka: `SIGNED_IN` potrafi paść więcej niż raz na jedno wejście
     (odświeżenie tokenu, powrót do karty). Bez tej blokady panel pokazywałby
     więcej logowań, niż było ludzi. Zerowana przy wylogowaniu, żeby zmiana
     konta w tej samej karcie policzyła się uczciwie. */
  const zmierzonoLogowanieRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const safetyTimeout = setTimeout(() => {
      setIsLoading(prev => {
        if (prev) {
          console.warn('[AUTH] Safety timeout: forcing isLoading=false after 4s');
          return false;
        }
        return prev;
      });
    }, 4000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (signedOutRef.current && event !== 'SIGNED_IN') return;

        if (newSession?.access_token) {
          supabase.realtime.setAuth(newSession.access_token);
        }

        if (event === 'SIGNED_OUT') {
          zmierzonoLogowanieRef.current = false;
          hasUnverifiedCachedUserRef.current = false;
          clearUserScopedStorage();
          rememberLastAuthUser(null);
          window.dispatchEvent(new Event('app:signed-out'));
          setSession(null);
          setUser(null);
          setIsLoading(false);
          clearTimeout(safetyTimeout);
          return;
        }

        if (event === 'SIGNED_IN') {
          signedOutRef.current = false;

          /* REJESTRACJA CZY POWRÓT.
             Baza wie, ilu jest użytkowników; nie wie, ilu ich PRZYBYWA z której
             kampanii — bo lądowanie i rejestracja dzieją się przed pierwszym
             zapisem. Konto założone w ciągu ostatnich dwóch minut traktujemy
             jako świeżą rejestrację; dwie minuty z zapasem obejmują pełne
             przekierowanie przez Google.
             Wysyłamy WYŁĄCZNIE sposób logowania — żadnego identyfikatora. */
          if (!zmierzonoLogowanieRef.current && newSession?.user) {
            zmierzonoLogowanieRef.current = true;
            const zalozone = Date.parse(newSession.user.created_at ?? '');
            const swieze = Number.isFinite(zalozone) && Date.now() - zalozone < 120_000;
            const metoda = newSession.user.app_metadata?.provider ?? 'nieznana';
            zdarzenie(swieze ? 'rejestracja' : 'logowanie', { metoda });
          }
        }

        setSession(prev => {
          if (prev?.access_token === newSession?.access_token) return prev;
          return newSession;
        });
        setUser(prev => {
          const newUser = newSession?.user ?? null;
          // Protect cached user during INITIAL_SESSION with null —
          // getSession() will resolve the truth shortly
          if (!newUser && prev && event === 'INITIAL_SESSION' && hasUnverifiedCachedUserRef.current) return prev;
          if (prev?.id === newUser?.id) return prev;
          return newUser;
        });

        if (event === 'INITIAL_SESSION') {
          hasUnverifiedCachedUserRef.current = false;
        }

        rememberLastAuthUser(newSession?.user?.id ?? null);

        setIsLoading(false);
        clearTimeout(safetyTimeout);
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession?.access_token) {
        supabase.realtime.setAuth(existingSession.access_token);
      }

      hasUnverifiedCachedUserRef.current = false;
      rememberLastAuthUser(existingSession?.user?.id ?? null);
      setSession(prev => {
        if (prev?.access_token === existingSession?.access_token) return prev;
        return existingSession;
      });
      setUser(prev => {
        const newUser = existingSession?.user ?? null;
        if (prev?.id === newUser?.id) return prev;
        return newUser;
      });

      if (!existingSession) {
        verifyDeviceTrust().then((restored) => {
          if (!restored) {
            setIsLoading(false);
            clearTimeout(safetyTimeout);
          }
        }).catch(() => {
          setIsLoading(false);
          clearTimeout(safetyTimeout);
        });
      } else {
        setIsLoading(false);
        clearTimeout(safetyTimeout);
      }
    }).catch((err) => {
      console.error('[AUTH] getSession failed:', err);
      hasUnverifiedCachedUserRef.current = false;
      setSession(null);
      setUser(null);
      setIsLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const refreshOrRestoreSession = useCallback(async () => {
    if (sessionRefreshInFlightRef.current || signedOutRef.current) return;
    sessionRefreshInFlightRef.current = true;

    try {
      const hasAuthToken = Boolean(getStoredAuthToken());
      const hasTrustToken = Boolean(getDeviceTrust());
      if (!hasAuthToken && !hasTrustToken) return;

      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession) {
        // No active session — try device trust as fallback
        if (hasTrustToken) {
          console.log('[AUTH] No session on tab return, attempting device trust restore');
          await verifyDeviceTrust();
        }
        return;
      }

      // Only refresh if the token expires within the next 5 minutes.
      // This prevents unnecessary token revocations on every tab switch,
      // which caused full app re-renders every 1-2 minutes.
      const expiresAt = currentSession.expires_at ?? 0;
      const nowSec = Math.floor(Date.now() / 1000);
      const REFRESH_THRESHOLD_SEC = 5 * 60; // 5 minutes before expiry

      if (expiresAt - nowSec > REFRESH_THRESHOLD_SEC) {
        // Token still fresh — just update realtime auth and skip refresh
        if (currentSession.access_token) {
          supabase.realtime.setAuth(currentSession.access_token);
        }
        return;
      }

      // Session exists and token is near expiry — refresh it
      const { data, error } = await supabase.auth.refreshSession();
      const refreshedSession = data?.session;

      if (error || !refreshedSession) {
        console.warn('[AUTH] Session refresh failed:', error?.message ?? 'no session returned');
        // Refresh failed — the session is likely invalid server-side.
        // Do NOT fall back to stale currentSession. Try device trust instead.
        if (hasTrustToken) {
          console.log('[AUTH] Refresh failed, falling back to device trust');
          await verifyDeviceTrust();
        }
        return;
      }

      // Successfully refreshed
      setSession(prev => {
        if (prev?.access_token === refreshedSession.access_token) return prev;
        return refreshedSession;
      });
      setUser(prev => {
        const newUser = refreshedSession.user ?? null;
        if (prev?.id === newUser?.id) return prev;
        return newUser;
      });
      if (refreshedSession.access_token) {
        supabase.realtime.setAuth(refreshedSession.access_token);
      }
    } catch (err) {
      console.warn('[AUTH] Session restore on tab return failed:', err);
      if (getDeviceTrust()) {
        await verifyDeviceTrust().catch(() => false);
      }
    } finally {
      sessionRefreshInFlightRef.current = false;
    }
  }, []);

  // Tab visibility: refresh session when user returns to app
  // Debounced — visibility + focus + online can all fire within milliseconds
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const debouncedRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void refreshOrRestoreSession();
      }, 500);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        debouncedRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', debouncedRefresh);
    window.addEventListener('online', debouncedRefresh);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', debouncedRefresh);
      window.removeEventListener('online', debouncedRefresh);
    };
  }, [refreshOrRestoreSession]);

  const signOut = useCallback(async (options?: SignOutOptions) => {
    const preserveRememberMe = options?.preserveRememberMe ?? false;

    // Mark as signed out to prevent event handlers from restoring
    signedOutRef.current = true;

    // 1) Flip UI to logged-out immediately
    setUser(null);
    setSession(null);
    hasUnverifiedCachedUserRef.current = false;

    // 2) Clear app-side caches/storage
    try {
      localStorage.removeItem('nextbyte_theme_colors');
      localStorage.removeItem('nextbyte_theme_colors_name');
      localStorage.removeItem('nextbyte_theme_expiry');
      localStorage.removeItem('automationai_license');
      localStorage.removeItem('userSettings');
      // Only clear remember-me on explicit user logout, NOT on idle timeout
      if (!preserveRememberMe) {
        localStorage.removeItem('nextbyte_remember_me');
      }
      sessionStorage.clear();
    } catch {}
    clearUserScopedStorage();
    rememberLastAuthUser(null);

    // 3) Revoke device trust + Supabase signOut in parallel (best-effort)
    // When preserving remember-me, keep device trust token alive for auto-restore
    try {
      if (preserveRememberMe) {
        // Only sign out from Supabase, keep device trust for session restoration
        await supabase.auth.signOut({ scope: 'local' as any }).catch(() => undefined);
      } else {
        await Promise.allSettled([
          revokeDeviceTrust(),
          supabase.auth.signOut({ scope: 'global' as any }),
        ]);
      }
    } catch (err) {
      console.warn('[AUTH] signOut: provider call failed, continuing with hard clear', err);
    }

    // 4) Hard-remove Supabase auth token in case signOut() did not
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}

    window.dispatchEvent(new Event('app:signed-out'));
  }, []);

  // Check for admin-forced fresh login — only once per access_token
  useEffect(() => {
    if (!session?.access_token || !user?.id) return;
    if (forceLogoutCheckedTokenRef.current === session.access_token) return;
    forceLogoutCheckedTokenRef.current = session.access_token;

    let cancelled = false;
    const checkForcedFreshLogin = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('consume-force-logout', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (cancelled || error || !data?.forceLogout) return;

        signedOutRef.current = true;
        setUser(null);
        setSession(null);
        hasUnverifiedCachedUserRef.current = false;
        await clearBrowserCachesAndWorkers();
        clearUserScopedStorage();
        clearDeviceTrust();
        rememberLastAuthUser(null);
        try {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          sessionStorage.clear();
        } catch {}
        await supabase.auth.signOut({ scope: 'global' as any }).catch(() => undefined);
        window.location.replace('/auth?fresh=1');
      } catch (error) {
        console.warn('[AUTH] Forced fresh-login check failed:', error);
      }
    };

    void checkForcedFreshLogin();
    return () => { cancelled = true; };
  }, [session?.access_token, user?.id]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};