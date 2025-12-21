import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll, expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null),
    clear: vi.fn(() => null),
    key: vi.fn(() => null),
    length: 0
  },
  writable: true,
});

// Mock Web Crypto API for encryption tests
// This mock simulates PBKDF2 + AES-GCM encryption flow
const keyStore = new Map<any, { type: string; data: any }>();
let keyCounter = 0;

const cryptoMock = {
  subtle: {
    // Mock importKey for PBKDF2 (step 1: create key material from passphrase)
    importKey: vi.fn((format: string, keyData: any, algorithm: any, extractable: boolean, usages: string[]) => {
      const keyId = keyCounter++;
      const key = { id: keyId, algorithm, usages };
      keyStore.set(keyId, { type: 'raw', data: keyData });
      return Promise.resolve(key);
    }),

    // Mock deriveKey for PBKDF2 -> AES-GCM (step 2: derive encryption key)
    deriveKey: vi.fn((algorithm: any, baseKey: any, derivedKeyAlgorithm: any, extractable: boolean, usages: string[]) => {
      const keyId = keyCounter++;
      const key = { id: keyId, algorithm: derivedKeyAlgorithm, usages };
      // Store a fake derived key (in real crypto, this would be derived from baseKey + salt)
      keyStore.set(keyId, { type: 'derived', data: new Uint8Array(32) }); // 32 bytes = 256 bits
      return Promise.resolve(key);
    }),

    // Mock encrypt for AES-GCM (step 3: encrypt data)
    encrypt: vi.fn((algorithm: any, key: any, data: BufferSource) => {
      const dataArray = data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      // Simple XOR-based "encryption" for testing (predictable but verifiable)
      const encrypted = new Uint8Array(dataArray.length);
      for (let i = 0; i < dataArray.length; i++) {
        encrypted[i] = dataArray[i] ^ 0xAA; // XOR with constant
      }
      return Promise.resolve(encrypted.buffer);
    }),

    // Mock decrypt for AES-GCM (step 4: decrypt data)
    decrypt: vi.fn((algorithm: any, key: any, data: BufferSource) => {
      const dataArray = data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      // Reverse the XOR "encryption"
      const decrypted = new Uint8Array(dataArray.length);
      for (let i = 0; i < dataArray.length; i++) {
        decrypted[i] = dataArray[i] ^ 0xAA; // XOR with same constant
      }
      return Promise.resolve(decrypted.buffer);
    }),

    // Mock digest for SHA-256 hashing (for PII masking)
    digest: vi.fn((_algorithm: string | { name: string }, data: BufferSource) => {
      const dataArray = data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

      // Simple deterministic hash for testing (sum of bytes)
      // Real SHA-256 would be much more complex
      let hash = 0;
      for (let i = 0; i < dataArray.length; i++) {
        hash = (hash * 31 + dataArray[i]) & 0xFFFFFFFF;
      }

      // Return 32-byte (256-bit) array for SHA-256
      const hashArray = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        hashArray[i] = (hash >>> (i % 4 * 8)) & 0xFF;
      }

      return Promise.resolve(hashArray.buffer);
    }),

    generateKey: vi.fn(),
    exportKey: vi.fn(),
    deriveBits: vi.fn(),
    sign: vi.fn(),
    verify: vi.fn()
  },

  getRandomValues: (arr: Uint8Array) => {
    // Provide non-deterministic random values for authentic testing behavior
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }
};

Object.defineProperty(window, 'crypto', {
  value: cryptoMock,
  writable: true,
  configurable: true
});

// Mock window.alert and window.confirm for tests
Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
});

// Suppress console errors during tests unless needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: render is deprecated'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Custom matchers for clinical calculations
expect.extend({
  toBeWithinMedicalTolerance(received: number, expected: number, tolerance = 0.1) {
    const pass = Math.abs(received - expected) <= tolerance;
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be within ${tolerance} of ${expected}`
          : `Expected ${received} to be within ${tolerance} of ${expected}\nDifference: ${Math.abs(received - expected)}`,
    };
  },

  toMatchClinicalRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be in range [${min}, ${max}]`
          : `Expected ${received} to be in clinical range [${min}, ${max}]`,
    };
  }
});

// Extend Vitest matchers type
declare module 'vitest' {
  interface Assertion {
    toBeWithinMedicalTolerance(expected: number, tolerance?: number): void;
    toMatchClinicalRange(min: number, max: number): void;
  }
  interface AsymmetricMatchersContaining {
    toBeWithinMedicalTolerance(expected: number, tolerance?: number): void;
    toMatchClinicalRange(min: number, max: number): void;
  }
}