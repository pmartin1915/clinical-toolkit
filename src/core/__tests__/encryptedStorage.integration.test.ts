import { describe, it, expect, beforeEach, vi } from 'vitest';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEncryptedStorageAdapter } from '../encryptedStorage';

describe('EncryptedStorage Integration with Zustand', () => {
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

    vi.clearAllMocks();
  });

  it('should work with Zustand persist middleware', async () => {
    interface TestState {
      patients: Array<{ id: string; name: string }>;
      addPatient: (patient: { id: string; name: string }) => void;
    }

    const useTestStore = create<TestState>()(
      persist(
        (set) => ({
          patients: [],
          addPatient: (patient) => set((state) => ({
            patients: [...state.patients, patient]
          }))
        }),
        {
          name: 'integration-test-store',
          storage: createEncryptedStorageAdapter({
            encryptionEnabled: true,
            storageKey: 'integration-test-store',
            version: 1
          })
        }
      )
    );

    // Add sensitive patient data
    useTestStore.getState().addPatient({ id: '1', name: 'Jane Doe' });
    expect(useTestStore.getState().patients).toHaveLength(1);

    // Give persist middleware time to save (it's async)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify data is stored
    const stored = localStorage.getItem('integration-test-store');
    expect(stored).toBeTruthy();

    // Verify sensitive data is encrypted (shouldn't contain plaintext patient name)
    expect(stored).not.toContain('Jane Doe');
    expect(stored).not.toContain('"name"');
  });

  it('should handle Zustand StorageValue format correctly', async () => {
    const storage = createEncryptedStorageAdapter({
      encryptionEnabled: true,
      storageKey: 'test',
      version: 1
    });

    // Zustand wraps state in { state: actualState, version: number }
    const zustandPayload = {
      state: { patients: [{ id: '1', name: 'Test Patient', ssn: '123-45-6789' }] },
      version: 1
    };

    await storage.setItem('test-key', zustandPayload);
    const retrieved = await storage.getItem('test-key');

    expect(retrieved).toBeTruthy();
    expect(retrieved!.state.patients[0].name).toBe('Test Patient');
    expect(retrieved!.version).toBe(1);

    // Verify sensitive data is encrypted in localStorage
    const raw = localStorage.getItem('test-key');
    expect(raw).not.toContain('123-45-6789');
    expect(raw).not.toContain('Test Patient');
  });

  it('should persist state across store re-creation', async () => {
    interface CounterState {
      count: number;
      increment: () => void;
    }

    // Create store and set value
    const createStore = () => create<CounterState>()(
      persist(
        (set) => ({
          count: 0,
          increment: () => set((state) => ({ count: state.count + 1 }))
        }),
        {
          name: 'persistent-store',
          storage: createEncryptedStorageAdapter({
            encryptionEnabled: true,
            storageKey: 'persistent-store',
            version: 1
          })
        }
      )
    );

    const store1 = createStore();
    store1.getState().increment();
    store1.getState().increment();
    expect(store1.getState().count).toBe(2);

    // Wait for persist
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create new store instance - should load persisted state
    const store2 = createStore();

    // Give it time to hydrate
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(store2.getState().count).toBe(2);
  });

  it('should handle encryption failures gracefully', async () => {
    // Test with encryption disabled (simulates fallback)
    const storage = createEncryptedStorageAdapter({
      encryptionEnabled: false,
      storageKey: 'test',
      version: 1
    });

    const data = {
      state: { test: 'data' },
      version: 1
    };

    await storage.setItem('test-key', data);
    const retrieved = await storage.getItem('test-key');

    expect(retrieved).toBeTruthy();
    expect(retrieved).toEqual(data);
  });

  it('should return null for nonexistent keys', async () => {
    const storage = createEncryptedStorageAdapter({
      encryptionEnabled: true,
      storageKey: 'test',
      version: 1
    });

    const result = await storage.getItem('nonexistent-key');
    expect(result).toBeNull();
  });

  it('should handle storage errors gracefully', async () => {
    const storage = createEncryptedStorageAdapter({
      encryptionEnabled: true,
      storageKey: 'test',
      version: 1
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Store valid data first
    const validData = { state: { test: 'data' }, version: 1 };
    await storage.setItem('test-key', validData);

    // Verify it was stored
    const retrieved = await storage.getItem('test-key');
    expect(retrieved).toEqual(validData);

    consoleSpy.mockRestore();
  });

  it('should work with complex clinical data structure', async () => {
    interface ClinicalState {
      patients: Array<{ id: string; name: string; ssn: string }>;
      assessments: Array<{ id: string; score: number }>;
      addPatient: (patient: { id: string; name: string; ssn: string }) => void;
    }

    const useStore = create<ClinicalState>()(
      persist(
        (set) => ({
          patients: [],
          assessments: [],
          addPatient: (patient) => set((state) => ({
            patients: [...state.patients, patient]
          }))
        }),
        {
          name: 'clinical-store',
          storage: createEncryptedStorageAdapter({
            encryptionEnabled: true,
            storageKey: 'clinical-store',
            version: 1
          })
        }
      )
    );

    // Add sensitive patient data
    useStore.getState().addPatient({
      id: '1',
      name: 'John Doe',
      ssn: '123-45-6789'
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify SSN is encrypted in storage
    const raw = localStorage.getItem('clinical-store');
    expect(raw).toBeTruthy();
    expect(raw).not.toContain('123-45-6789');
    expect(raw).not.toContain('John Doe');

    // Verify state is correct
    expect(useStore.getState().patients).toHaveLength(1);
    expect(useStore.getState().patients[0].ssn).toBe('123-45-6789');
  });
});
