/**
 * Native platform utilities for Capacitor
 * Handles status bar, splash screen, push notifications, camera,
 * filesystem, haptics, clipboard, network and platform detection
 */

import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

/* ------------------------------------------------------------------ */
/*  Status Bar & Splash Screen (existing)                             */
/* ------------------------------------------------------------------ */

/**
 * Hide the native splash screen once the web-based HTML loader is visible.
 * Called from main.tsx after the initial-loader div is guaranteed to be painted.
 */
export const hideNativeSplash = async () => {
  if (!isNativePlatform()) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 200 });
  } catch (e) {
    console.warn('SplashScreen plugin not available:', e);
  }
};

export const initNativePlugins = async () => {
  if (!isNativePlatform()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#09090b' });

    if (getPlatform() === 'android') {
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch (e) {
    console.warn('StatusBar plugin not available:', e);
  }

  // NOTE: We no longer hide the splash here.
  // It is hidden explicitly via hideNativeSplash() in main.tsx
  // after the HTML loader is confirmed painted.
};

/* ------------------------------------------------------------------ */
/*  Push Notifications                                                */
/* ------------------------------------------------------------------ */

export interface PushListenerCallbacks {
  onRegistration?: (token: string) => void;
  onRegistrationError?: (error: any) => void;
  onNotificationReceived?: (notification: any) => void;
  onNotificationActionPerformed?: (action: any) => void;
}

export const registerPushNotifications = async (): Promise<string | null> => {
  if (!isNativePlatform()) {
    console.warn('Push notifications are only available in the native app');
    return null;
  }

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.warn('Push notification permission not granted');
      return null;
    }

    await PushNotifications.register();
    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        resolve(token.value);
      });
      PushNotifications.addListener('registrationError', (err) => {
        console.error('Push registration error:', err);
        resolve(null);
      });
    });
  } catch (e) {
    console.warn('PushNotifications plugin not available:', e);
    return null;
  }
};

export const addPushListeners = async (callbacks: PushListenerCallbacks) => {
  if (!isNativePlatform()) return;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    if (callbacks.onRegistration) {
      PushNotifications.addListener('registration', (token) => {
        callbacks.onRegistration!(token.value);
      });
    }
    if (callbacks.onRegistrationError) {
      PushNotifications.addListener('registrationError', callbacks.onRegistrationError);
    }
    if (callbacks.onNotificationReceived) {
      PushNotifications.addListener('pushNotificationReceived', callbacks.onNotificationReceived);
    }
    if (callbacks.onNotificationActionPerformed) {
      PushNotifications.addListener('pushNotificationActionPerformed', callbacks.onNotificationActionPerformed);
    }
  } catch (e) {
    console.warn('PushNotifications plugin not available:', e);
  }
};

/* ------------------------------------------------------------------ */
/*  Camera                                                            */
/* ------------------------------------------------------------------ */

export interface PhotoResult {
  dataUrl?: string;
  webPath?: string;
  path?: string;
}

export const takePhoto = async (quality = 90): Promise<PhotoResult> => {
  if (!isNativePlatform()) {
    throw new Error('Aparat jest dostępny tylko w aplikacji natywnej');
  }

  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
  const image = await Camera.getPhoto({
    quality,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
  });

  return {
    dataUrl: image.dataUrl,
    webPath: image.webPath,
    path: image.path,
  };
};

export const pickFromGallery = async (quality = 90): Promise<PhotoResult> => {
  if (!isNativePlatform()) {
    throw new Error('Galeria jest dostępna tylko w aplikacji natywnej');
  }

  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
  const image = await Camera.getPhoto({
    quality,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,
  });

  return {
    dataUrl: image.dataUrl,
    webPath: image.webPath,
    path: image.path,
  };
};

/* ------------------------------------------------------------------ */
/*  Filesystem                                                        */
/* ------------------------------------------------------------------ */

export const saveFile = async (
  fileName: string,
  data: string,
  isBase64 = false,
): Promise<string> => {
  if (!isNativePlatform()) {
    throw new Error('Zapis plików jest dostępny tylko w aplikacji natywnej');
  }

  const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
  const result = await Filesystem.writeFile({
    path: fileName,
    data,
    directory: Directory.Documents,
    ...(isBase64 ? {} : { encoding: Encoding.UTF8 }),
  });

  return result.uri;
};

export const readFile = async (fileName: string, isBase64 = false): Promise<string> => {
  if (!isNativePlatform()) {
    throw new Error('Odczyt plików jest dostępny tylko w aplikacji natywnej');
  }

  const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
  const result = await Filesystem.readFile({
    path: fileName,
    directory: Directory.Documents,
    ...(isBase64 ? {} : { encoding: Encoding.UTF8 }),
  });

  return result.data as string;
};

export const deleteFile = async (fileName: string): Promise<void> => {
  if (!isNativePlatform()) {
    throw new Error('Usuwanie plików jest dostępne tylko w aplikacji natywnej');
  }

  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  await Filesystem.deleteFile({
    path: fileName,
    directory: Directory.Documents,
  });
};

/* ------------------------------------------------------------------ */
/*  Haptics                                                           */
/* ------------------------------------------------------------------ */

export const hapticLight = async () => {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
};

export const hapticMedium = async () => {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
};

export const hapticHeavy = async () => {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch {}
};

export const hapticClick = async () => {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
};

/* ------------------------------------------------------------------ */
/*  Clipboard (with web fallback)                                     */
/* ------------------------------------------------------------------ */

export const copyToClipboard = async (text: string): Promise<void> => {
  if (isNativePlatform()) {
    try {
      const { Clipboard } = await import('@capacitor/clipboard');
      await Clipboard.write({ string: text });
      return;
    } catch {
      void 0;
    }
  }

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      void 0;
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error('Clipboard copy failed');
  }
};

export const readClipboard = async (): Promise<string> => {
  if (isNativePlatform()) {
    try {
      const { Clipboard } = await import('@capacitor/clipboard');
      const result = await Clipboard.read();
      return result.value;
    } catch {}
  }
  // Web fallback
  return navigator.clipboard.readText();
};

/* ------------------------------------------------------------------ */
/*  Network (with web fallback)                                       */
/* ------------------------------------------------------------------ */

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export const getNetworkStatus = async (): Promise<NetworkStatus> => {
  if (isNativePlatform()) {
    try {
      const { Network } = await import('@capacitor/network');
      const status = await Network.getStatus();
      return { connected: status.connected, connectionType: status.connectionType };
    } catch {}
  }
  return { connected: navigator.onLine, connectionType: 'unknown' };
};

export const onNetworkChange = async (
  callback: (status: NetworkStatus) => void,
): Promise<(() => void) | undefined> => {
  if (isNativePlatform()) {
    try {
      const { Network } = await import('@capacitor/network');
      const handle = await Network.addListener('networkStatusChange', (status) => {
        callback({ connected: status.connected, connectionType: status.connectionType });
      });
      return () => handle.remove();
    } catch {}
  }

  // Web fallback
  const onOnline = () => callback({ connected: true, connectionType: 'unknown' });
  const onOffline = () => callback({ connected: false, connectionType: 'unknown' });
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};
