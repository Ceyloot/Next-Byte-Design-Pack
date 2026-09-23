import { supabase } from '@/integrations/supabase/client';

const DEVICE_TRUST_KEY = 'nextbyte_device_trust';
const DEVICE_FINGERPRINT_KEY = 'nextbyte_device_fp';

/**
 * Generate a simple but stable device fingerprint based on browser properties.
 * Not meant to be unbreakable — just an extra verification layer.
 */
export const getDeviceFingerprint = (): string => {
  // Check cache first
  const cached = localStorage.getItem(DEVICE_FINGERPRINT_KEY);
  if (cached) return cached;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth?.toString() ?? '',
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency?.toString() ?? '',
  ];

  // Simple hash
  const raw = components.join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const fp = 'fp_' + Math.abs(hash).toString(36);
  localStorage.setItem(DEVICE_FINGERPRINT_KEY, fp);
  return fp;
};

/** Store device trust token after successful login */
export const storeDeviceTrust = (token: string): void => {
  try {
    localStorage.setItem(DEVICE_TRUST_KEY, token);
  } catch {
    // silent
  }
};

/** Read stored device trust token */
export const getDeviceTrust = (): string | null => {
  try {
    return localStorage.getItem(DEVICE_TRUST_KEY);
  } catch {
    return null;
  }
};

const isDefinitiveTrustRejection = (error: unknown, data: unknown): boolean => {
  const message = String(
    (error as { message?: string } | null)?.message ??
    (data as { error?: string; message?: string } | null)?.error ??
    (data as { error?: string; message?: string } | null)?.message ??
    ''
  ).toLowerCase();

  return [
    'invalid',
    'expired',
    'revoked',
    'blocked',
    'fingerprint',
    'unauthorized',
  ].some((reason) => message.includes(reason));
};

/** Clear device trust token (on logout or revoke) */
export const clearDeviceTrust = (): void => {
  try {
    localStorage.removeItem(DEVICE_TRUST_KEY);
  } catch {
    // silent
  }
};

/**
 * After a successful login with "Zapamiętaj na 30 dni" checked,
 * call the edge function to create a device trust token.
 */
export const createDeviceTrust = async (userId: string): Promise<void> => {
  try {
    const fingerprint = getDeviceFingerprint();
    const { data, error } = await supabase.functions.invoke('create-device-trust', {
      body: {
        user_id: userId,
        device_fingerprint: fingerprint,
        user_agent: navigator.userAgent,
      },
    });

    if (error || !data?.token) {
      console.warn('[DeviceTrust] Failed to create trust token:', error);
      return;
    }

    storeDeviceTrust(data.token);
    console.log('[DeviceTrust] Token stored successfully');
  } catch (e) {
    console.warn('[DeviceTrust] Error creating trust token:', e);
  }
};

/**
 * Attempt auto-login using a stored device trust token.
 * Returns true if session was restored, false otherwise.
 */
// In-memory throttle to prevent calling the edge function in a tight loop
// (which trips the per-minute rate limiter and returns 429 → blank screen on /login).
let lastVerifyAttempt = 0;
let inflightVerify: Promise<boolean> | null = null;
const VERIFY_COOLDOWN_MS = 30_000;

export const verifyDeviceTrust = async (): Promise<boolean> => {
  const token = getDeviceTrust();
  if (!token) return false;

  // Reuse the in-flight call if one is happening right now
  if (inflightVerify) return inflightVerify;

  const now = Date.now();
  if (now - lastVerifyAttempt < VERIFY_COOLDOWN_MS) {
    return false;
  }
  lastVerifyAttempt = now;

  inflightVerify = (async (): Promise<boolean> => {
    try {
      const fingerprint = getDeviceFingerprint();
      const { data, error } = await supabase.functions.invoke('verify-device-trust', {
        body: {
          token,
          device_fingerprint: fingerprint,
        },
      });

      if (error || !data?.session) {
        const errMsg = String((error as { message?: string } | null)?.message ?? '').toLowerCase();
        const isRateLimited =
          errMsg.includes('429') ||
          errMsg.includes('rate') ||
          (data && (data as any).trusted === false && (data as any).session === null && errMsg.includes('non-2xx'));

        console.warn('[DeviceTrust] Verification failed:', error ?? data);

        // Only clear the trust token on a definitive rejection from the server.
        // 429 / transient errors must NOT wipe the token, otherwise the user gets
        // logged out permanently after a burst of requests.
        if (!isRateLimited && isDefinitiveTrustRejection(error, data)) {
          clearDeviceTrust();
        }
        return false;
      }

      if (data.token) {
        storeDeviceTrust(data.token);
      }

      // Restore session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) {
        console.warn('[DeviceTrust] Failed to set session:', sessionError);
        clearDeviceTrust();
        return false;
      }

      console.log('[DeviceTrust] Session restored from trust token');
      return true;
    } catch (e) {
      console.warn('[DeviceTrust] Error verifying trust token:', e);
      return false;
    } finally {
      inflightVerify = null;
    }
  })();

  return inflightVerify;
};

/**
 * Revoke the current device trust token on the server side.
 */
export const revokeDeviceTrust = async (): Promise<void> => {
  const token = getDeviceTrust();
  if (!token) return;

  try {
    await supabase.functions.invoke('verify-device-trust', {
      body: {
        token,
        device_fingerprint: getDeviceFingerprint(),
        revoke: true,
      },
    });
  } catch {
    // best-effort
  } finally {
    clearDeviceTrust();
  }
};
