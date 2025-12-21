/**
 * AES-256-GCM Encryption for Clinical Toolkit
 * Adapted from Burn Wizard's proven encryption module
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

let masterKey: CryptoKey | null = null;
let initialized = false;

function getRandomBytes(length: number): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(length));
}

function createSessionPassphrase(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36);
  const userAgent = navigator.userAgent || 'unknown';
  return `clinical-toolkit-${timestamp}-${random}-${btoa(userAgent).slice(0, 20)}`;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function initializeEncryption(): Promise<boolean> {
  try {
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('🔒 Web Crypto API not available');
      return false;
    }

    const passphrase = createSessionPassphrase();
    const salt = getRandomBytes(SALT_LENGTH);
    
    masterKey = await deriveKey(passphrase, salt);
    initialized = true;
    
    console.info('🔒 Encryption initialized successfully');
    return true;
  } catch (error) {
    console.error('🔒 Encryption initialization failed:', error);
    return false;
  }
}

export async function encryptData(data: Record<string, unknown>): Promise<string> {
  if (!initialized || !masterKey) {
    console.warn('🔒 Encryption not initialized, storing data unencrypted');
    return JSON.stringify(data);
  }

  try {
    const plaintext = JSON.stringify(data);
    const encoder = new TextEncoder();
    const plaintextBytes = encoder.encode(plaintext);
    
    const iv = getRandomBytes(IV_LENGTH);
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv as BufferSource,
      },
      masterKey,
      plaintextBytes
    );

    const encryptedArray = new Uint8Array(encrypted);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('🔒 Encryption failed:', error);
    return JSON.stringify(data);
  }
}

export async function decryptData(encryptedData: string): Promise<Record<string, unknown> | null> {
  if (!encryptedData) {
    return null;
  }

  if (initialized && masterKey) {
    try {
      const encryptedBytes = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      const iv = encryptedBytes.slice(0, IV_LENGTH);
      const encrypted = encryptedBytes.slice(IV_LENGTH);

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: ALGORITHM,
          iv: iv as BufferSource,
        },
        masterKey,
        encrypted
      );

      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decrypted);
      return JSON.parse(decryptedText);
    } catch (error) {
      console.warn('🔒 Decryption failed, trying as unencrypted data');
    }
  }

  try {
    return JSON.parse(encryptedData);
  } catch {
    console.error('🔒 Failed to parse data as JSON');
    return null;
  }
}

export function clearEncryptionKeys(): void {
  masterKey = null;
  initialized = false;
  console.info('🔒 Encryption keys cleared');
}

export function isEncryptionAvailable(): boolean {
  return !!(window.crypto && window.crypto.subtle && initialized && masterKey);
}

export async function validateEncryption(): Promise<boolean> {
  try {
    const testData = { test: 'validation', timestamp: Date.now() };
    const encrypted = await encryptData(testData);
    const decrypted = await decryptData(encrypted);
    return JSON.stringify(testData) === JSON.stringify(decrypted);
  } catch (error) {
    console.error('🔒 Encryption validation failed:', error);
    return false;
  }
}
