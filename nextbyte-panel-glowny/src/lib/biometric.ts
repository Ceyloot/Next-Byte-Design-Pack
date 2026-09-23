/**
 * Biometric authentication for quick login (Face ID / Touch ID / Fingerprint)
 * 
 * Flow:
 * 1. After successful login, user can enable biometric login in settings
 * 2. Credentials are securely stored on device via NativeBiometric
 * 3. On next app launch, user can authenticate with biometrics instead of password
 */

import { isNativePlatform } from './native';

const BIOMETRIC_SERVER = 'nextbyte.ai';
const BIOMETRIC_ENABLED_KEY = 'nextbyte_biometric_enabled';

export interface BiometricAvailability {
  isAvailable: boolean;
  biometryType: 'face' | 'fingerprint' | 'iris' | 'none';
}

/**
 * Check if biometric authentication is available on this device
 */
export const checkBiometricAvailability = async (): Promise<BiometricAvailability> => {
  if (!isNativePlatform()) {
    return { isAvailable: false, biometryType: 'none' };
  }

  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const result = await NativeBiometric.isAvailable();
    
    let biometryType: BiometricAvailability['biometryType'] = 'none';
    if (result.isAvailable) {
      // biometryType: 1 = fingerprint, 2 = face, 3 = iris
      switch (result.biometryType) {
        case 1: biometryType = 'fingerprint'; break;
        case 2: biometryType = 'face'; break;
        case 3: biometryType = 'iris'; break;
        default: biometryType = 'fingerprint'; break;
      }
    }

    return { isAvailable: result.isAvailable, biometryType };
  } catch (e) {
    console.warn('Biometric check failed:', e);
    return { isAvailable: false, biometryType: 'none' };
  }
};

/**
 * Store credentials securely on device after successful login
 */
export const storeBiometricCredentials = async (
  email: string,
  password: string,
): Promise<boolean> => {
  if (!isNativePlatform()) return false;

  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    
    await NativeBiometric.setCredentials({
      username: email,
      password,
      server: BIOMETRIC_SERVER,
    });

    localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    return true;
  } catch (e) {
    console.error('Failed to store biometric credentials:', e);
    return false;
  }
};

/**
 * Authenticate with biometrics and retrieve stored credentials
 */
export const authenticateWithBiometric = async (): Promise<{
  email: string;
  password: string;
} | null> => {
  if (!isNativePlatform()) return null;

  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');

    // Verify identity
    await NativeBiometric.verifyIdentity({
      reason: 'Zaloguj się do NextByte',
      title: 'Logowanie biometryczne',
      subtitle: 'Użyj Face ID lub odcisku palca',
      description: 'Potwierdź swoją tożsamość, aby się zalogować',
    });

    // Get stored credentials
    const credentials = await NativeBiometric.getCredentials({
      server: BIOMETRIC_SERVER,
    });

    return {
      email: credentials.username,
      password: credentials.password,
    };
  } catch (e) {
    console.warn('Biometric authentication failed:', e);
    return null;
  }
};

/**
 * Remove stored biometric credentials
 */
export const removeBiometricCredentials = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    await NativeBiometric.deleteCredentials({ server: BIOMETRIC_SERVER });
  } catch {}

  localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
};

/**
 * Check if biometric login is enabled by the user
 */
export const isBiometricEnabled = (): boolean => {
  return localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
};

/**
 * Get display name for biometric type (Polish)
 */
export const getBiometricLabel = (type: BiometricAvailability['biometryType']): string => {
  switch (type) {
    case 'face': return 'Face ID';
    case 'fingerprint': return 'Odcisk palca';
    case 'iris': return 'Skan tęczówki';
    default: return 'Biometria';
  }
};
