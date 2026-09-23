/**
 * Master Encryption Key (MEK) Manager
 * 
 * Handles generation, wrapping/unwrapping of a per-user AES-256 key.
 * The MEK is stored in sessionStorage (cleared on tab close).
 * It is persisted in the DB encrypted by the user's password and/or recovery key.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 600_000; // OWASP 2023 recommendation
const STORAGE_KEY = 'mek_raw';

// ─── Helpers ───────────────────────────────────────────────

/** Guarantee a fresh, correctly-sized ArrayBuffer from any Uint8Array (even subviews) */
function safeBuffer(typed: Uint8Array): ArrayBuffer {
  return typed.buffer.slice(typed.byteOffset, typed.byteOffset + typed.byteLength) as ArrayBuffer;
}

function toBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export function fromBase64(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return safeBuffer(arr);
}

// ─── Key derivation ────────────────────────────────────────

async function deriveWrappingKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passData = enc.encode(passphrase);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    safeBuffer(passData),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: safeBuffer(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['wrapKey', 'unwrapKey']
  );
}

// ─── Public API ────────────────────────────────────────────

/** Generate a brand-new random MEK */
export async function generateMEK(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // extractable so we can wrap it
    ['encrypt', 'decrypt']
  );
}

/** Wrap (encrypt) the MEK with a passphrase (password or recovery key) */
export async function wrapMEK(
  mek: CryptoKey,
  passphrase: string,
  existingSalt?: Uint8Array
): Promise<{ wrappedKey: string; salt: string; iv: string }> {
  const salt = existingSalt ?? crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrappingKey = await deriveWrappingKey(passphrase, salt);

  const wrapped = await crypto.subtle.wrapKey('raw', mek, wrappingKey, {
    name: ALGORITHM,
    iv: safeBuffer(iv),
  });

  return {
    wrappedKey: toBase64(wrapped),
    salt: toBase64(safeBuffer(salt)),
    iv: toBase64(safeBuffer(iv)),
  };
}

/** Unwrap (decrypt) the MEK using a passphrase */
export async function unwrapMEK(
  wrappedKeyB64: string,
  passphrase: string,
  saltB64: string,
  ivB64: string
): Promise<CryptoKey> {
  const salt = new Uint8Array(fromBase64(saltB64));
  const iv = new Uint8Array(fromBase64(ivB64));
  const wrappingKey = await deriveWrappingKey(passphrase, salt);

  return crypto.subtle.unwrapKey(
    'raw',
    fromBase64(wrappedKeyB64),
    wrappingKey,
    { name: ALGORITHM, iv: safeBuffer(iv) },
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

// ─── Session storage ───────────────────────────────────────

/** Store MEK in localStorage (base64 of raw key bytes) — persists across refreshes */
export async function storeMEKInSession(mek: CryptoKey): Promise<void> {
  const raw = await crypto.subtle.exportKey('raw', mek);
  localStorage.setItem(STORAGE_KEY, toBase64(raw));
}

/** Retrieve MEK from localStorage */
export async function getMEKFromSession(): Promise<CryptoKey | null> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return await crypto.subtle.importKey(
      'raw',
      fromBase64(stored),
      { name: ALGORITHM, length: KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/** Clear MEK from storage (call on logout) */
export function clearMEKFromSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Encrypt / Decrypt with MEK ────────────────────────────

/** Encrypt a string with the MEK, returns base64 ciphertext + iv + SHA-256 hash */
export async function encryptWithMEK(
  plaintext: string,
  mek: CryptoKey
): Promise<{ encryptedContent: string; iv: string; contentHash: string }> {
  const enc = new TextEncoder();
  const data = enc.encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: safeBuffer(iv) },
    mek,
    safeBuffer(data)
  );

  // SHA-256 integrity hash of plaintext
  const hashBuf = await crypto.subtle.digest('SHA-256', safeBuffer(data));
  const contentHash = toBase64(hashBuf);

  return {
    encryptedContent: toBase64(ciphertext),
    iv: toBase64(safeBuffer(iv)),
    contentHash,
  };
}

/** Decrypt a base64 ciphertext with the MEK */
export async function decryptWithMEK(
  encryptedContentB64: string,
  ivB64: string,
  mek: CryptoKey
): Promise<string> {
  const ciphertext = fromBase64(encryptedContentB64);
  const iv = fromBase64(ivB64);

  const plainBuf = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    mek,
    ciphertext
  );

  return new TextDecoder().decode(plainBuf);
}

// ─── Utility ───────────────────────────────────────────────

/** Hash a recovery key for verification (stored in DB) */
export async function hashRecoveryKey(recoveryKey: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(recoveryKey);
  const hash = await crypto.subtle.digest('SHA-256', safeBuffer(data));
  return toBase64(hash);
}
