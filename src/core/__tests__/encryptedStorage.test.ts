import { describe, it, expect, beforeEach } from 'vitest';
import { createEncryptedStorageAdapter } from '../encryptedStorage';

describe('EncryptedStorage Adapter', () => {
  let storage: ReturnType<typeof createEncryptedStorageAdapter>;
  const STORAGE_KEY = 'test-store';

  beforeEach(() => {
    // Create a real localStorage implementation for these tests
    const localStorageData: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageData[key] || null,
        setItem: (key: string, value: string) => {
          localStorageData[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorageData[key];
        },
        clear: () => {
          for (const key in localStorageData) {
            delete localStorageData[key];
          }
        },
        get length() {
          return Object.keys(localStorageData).length;
        },
        key: (index: number) => Object.keys(localStorageData)[index] || null
      },
      writable: true,
      configurable: true
    });

    storage = createEncryptedStorageAdapter({
      encryptionEnabled: true,
      storageKey: STORAGE_KEY,
      version: 1
    });
  });

  it('should store and retrieve Zustand StorageValue objects', async () => {
    const storageValue = {
      state: { patients: [{ id: '1', name: 'Test' }] },
      version: 1
    };

    // Zustand passes { state, version } object
    await storage.setItem(STORAGE_KEY, storageValue);

    // Should return the same object structure
    const retrieved = await storage.getItem(STORAGE_KEY);
    expect(retrieved).toEqual(storageValue);
  });

  it('should encrypt sensitive data in localStorage', async () => {
    const storageValue = {
      state: { patients: [{ id: '1', ssn: '123-45-6789' }] },
      version: 1
    };

    await storage.setItem(STORAGE_KEY, storageValue);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    // Encrypted data should not contain plaintext SSN
    expect(raw).not.toContain('123-45-6789');
    expect(raw).not.toContain('ssn');

    // Verify it can be decrypted back to the original
    const retrieved = await storage.getItem(STORAGE_KEY);
    expect(retrieved).toEqual(storageValue);
  });

  it('should handle null values', async () => {
    const result = await storage.getItem('nonexistent');
    expect(result).toBeNull();
  });

  it('should remove items', async () => {
    await storage.setItem(STORAGE_KEY, { state: { data: 'test' }, version: 1 });
    storage.removeItem(STORAGE_KEY);
    const result = await storage.getItem(STORAGE_KEY);
    expect(result).toBeNull();
  });

  it('should work with complex nested data structures', async () => {
    const complexData = {
      state: {
        patients: [
          { id: '1', name: 'John', medications: ['med1', 'med2'] }
        ],
        assessments: [
          { id: 'a1', score: 25, responses: { q1: 'yes', q2: 'no' } }
        ],
        config: { theme: 'dark', language: 'en' }
      },
      version: 1
    };

    await storage.setItem(STORAGE_KEY, complexData);
    const retrieved = await storage.getItem(STORAGE_KEY);

    expect(retrieved).toBeTruthy();
    expect(retrieved).toEqual(complexData);
  });

  it('should return null for cleared storage', async () => {
    await storage.setItem(STORAGE_KEY, { state: { test: 'data' }, version: 1 });
    localStorage.clear();

    const result = await storage.getItem(STORAGE_KEY);
    expect(result).toBeNull();
  });

  it('should handle objects without version field', async () => {
    const dataWithoutVersion = {
      state: { patients: [{ id: '1', name: 'Test' }] }
    };

    await storage.setItem(STORAGE_KEY, dataWithoutVersion);
    const retrieved = await storage.getItem(STORAGE_KEY);

    expect(retrieved).toEqual(dataWithoutVersion);
  });
});
