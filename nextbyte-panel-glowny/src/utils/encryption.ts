
// Enhanced encryption utilities with AES encryption
const getEncryptionKey = (): string => {
  // In production, this should come from environment variables
  // For now, we'll use a more secure approach with dynamic key generation
  return typeof window !== 'undefined' 
    ? `${window.location.origin}-social-media-encryption-v2`
    : 'social-media-api-keys-v2-fallback';
};

// Generate a key for AES encryption from password
async function generateKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('supabase-salt-2025'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const encryptApiKey = async (apiKey: string): Promise<string> => {
  if (!apiKey) return '';
  
  try {
    const key = await generateKey(getEncryptionKey());
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Error encrypting API key:', error);
    // Fallback to base64 for backward compatibility
    return btoa(apiKey);
  }
};

export const decryptApiKey = async (encryptedKey: string): Promise<string> => {
  if (!encryptedKey) return '';
  
  try {
    const key = await generateKey(getEncryptionKey());
    const combined = new Uint8Array(
      Array.from(atob(encryptedKey), c => c.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Error decrypting API key, trying fallback:', error);
    // Fallback to base64 for backward compatibility
    try {
      return atob(encryptedKey);
    } catch (fallbackError) {
      console.error('Fallback decryption failed:', fallbackError);
      return encryptedKey;
    }
  }
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');
};

export const validateApiKey = (apiKey: string, platform: string): { valid: boolean; error?: string } => {
  if (!apiKey) return { valid: false, error: 'API key is required' };
  
  // Enhanced validation
  if (apiKey.length < 8) {
    return { valid: false, error: 'API key too short (minimum 8 characters)' };
  }
  
  if (apiKey.length > 512) {
    return { valid: false, error: 'API key too long (maximum 512 characters)' };
  }
  
  // Check for suspicious patterns
  if (apiKey.includes('<') || apiKey.includes('>') || apiKey.includes('javascript:')) {
    return { valid: false, error: 'API key contains invalid characters' };
  }
  
  // Platform-specific validation
  switch (platform) {
    case 'youtube':
      if (!apiKey.startsWith('AIza')) {
        return { valid: false, error: 'Invalid YouTube API key format' };
      }
      if (apiKey.length !== 39) {
        return { valid: false, error: 'YouTube API key should be 39 characters long' };
      }
      break;
    case 'instagram':
      if (apiKey.length < 20) {
        return { valid: false, error: 'Instagram API key too short' };
      }
      break;
    case 'tiktok':
      if (apiKey.length < 16) {
        return { valid: false, error: 'TikTok API key too short' };
      }
      break;
  }
  
  return { valid: true };
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier)!;
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    return true;
  };
};
