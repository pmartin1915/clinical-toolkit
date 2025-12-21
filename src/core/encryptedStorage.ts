/**
 * Encrypted Storage Adapter for Clinical Toolkit
 * Provides Zustand-compatible storage with AES-256-GCM encryption
 */

import { 
  initializeEncryption, 
  encryptData, 
  decryptData, 
  isEncryptionAvailable,
  clearEncryptionKeys,
  validateEncryption 
} from './encryption';

interface EncryptedStorageOptions {
  encryptionEnabled: boolean;
  storageKey: string;
  version: number;
}

interface StorageMetadata {
  version: number;
  encrypted: boolean;
  timestamp: number;
}

export class EncryptedStorage {
  private options: EncryptedStorageOptions;
  private initialized: boolean = false;

  constructor(options: EncryptedStorageOptions) {
    this.options = options;
  }

  async initialize(): Promise<boolean> {
    try {
      if (this.options.encryptionEnabled) {
        const encryptionReady = await initializeEncryption();
        if (!encryptionReady) {
          console.warn('🔒 Encryption initialization failed, falling back to unencrypted storage');
          this.options.encryptionEnabled = false;
        } else {
          const isValid = await validateEncryption();
          if (!isValid) {
            console.error('🔒 Encryption validation failed, disabling encryption');
            this.options.encryptionEnabled = false;
            return false;
          }
        }
      }
      
      this.initialized = true;
      if (import.meta.env.DEV) {
        console.info(`🔒 Storage initialized (encryption: ${this.options.encryptionEnabled ? 'enabled' : 'disabled'})`);
      }
      return true;
    } catch (error) {
      console.error('🔒 Storage initialization failed:', error);
      this.options.encryptionEnabled = false;
      this.initialized = true;
      return false;
    }
  }

  private async encryptSensitiveData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.options.encryptionEnabled || !isEncryptionAvailable()) {
      return data;
    }

    const result = { ...data };

    try {
      // Handle Zustand's { state: {...}, version: N } format
      const stateData = result.state as Record<string, unknown> | undefined;
      if (stateData && typeof stateData === 'object') {
        const encryptedState = { ...stateData };

        // Encrypt patient data inside state
        if (encryptedState.patients) {
          encryptedState.patients = await encryptData(encryptedState.patients as Record<string, unknown>);
        }

        // Encrypt assessments inside state
        if (encryptedState.assessments) {
          encryptedState.assessments = await encryptData(encryptedState.assessments as Record<string, unknown>);
        }

        // Encrypt vitals inside state
        if (encryptedState.vitals) {
          encryptedState.vitals = await encryptData(encryptedState.vitals as Record<string, unknown>);
        }

        result.state = encryptedState;
      } else {
        // Fallback: encrypt top-level fields (for legacy/non-Zustand usage)
        if (result.patients) {
          result.patients = await encryptData(result.patients as Record<string, unknown>);
        }

        if (result.assessments) {
          result.assessments = await encryptData(result.assessments as Record<string, unknown>);
        }

        if (result.vitals) {
          result.vitals = await encryptData(result.vitals as Record<string, unknown>);
        }
      }

      return result;
    } catch (error) {
      console.error('🔒 Encryption failed, storing unencrypted:', error);
      return data;
    }
  }

  private async decryptSensitiveData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const result = { ...data };

    try {
      // Handle Zustand's { state: {...}, version: N } format
      const stateData = result.state as Record<string, unknown> | undefined;
      if (stateData && typeof stateData === 'object') {
        const decryptedState = { ...stateData };

        // Decrypt patient data inside state
        if (decryptedState.patients && typeof decryptedState.patients === 'string') {
          const decrypted = await decryptData(decryptedState.patients);
          if (decrypted) {
            decryptedState.patients = decrypted;
          }
        }

        // Decrypt assessments inside state
        if (decryptedState.assessments && typeof decryptedState.assessments === 'string') {
          const decrypted = await decryptData(decryptedState.assessments);
          if (decrypted) {
            decryptedState.assessments = decrypted;
          }
        }

        // Decrypt vitals inside state
        if (decryptedState.vitals && typeof decryptedState.vitals === 'string') {
          const decrypted = await decryptData(decryptedState.vitals);
          if (decrypted) {
            decryptedState.vitals = decrypted;
          }
        }

        result.state = decryptedState;
      } else {
        // Fallback: decrypt top-level fields (for legacy/non-Zustand usage)
        if (result.patients && typeof result.patients === 'string') {
          const decrypted = await decryptData(result.patients);
          if (decrypted) {
            result.patients = decrypted;
          }
        }

        if (result.assessments && typeof result.assessments === 'string') {
          const decrypted = await decryptData(result.assessments);
          if (decrypted) {
            result.assessments = decrypted;
          }
        }

        if (result.vitals && typeof result.vitals === 'string') {
          const decrypted = await decryptData(result.vitals);
          if (decrypted) {
            result.vitals = decrypted;
          }
        }
      }

      return result;
    } catch (error) {
      console.error('🔒 Decryption failed, using data as-is:', error);
      return data;
    }
  }

  private createMetadata(data: Record<string, unknown>): StorageMetadata {
    return {
      version: this.options.version,
      encrypted: this.options.encryptionEnabled,
      timestamp: Date.now()
    };
  }

  async setItem(key: string, data: Record<string, unknown>): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const metadata = this.createMetadata(data);
      const processedData = await this.encryptSensitiveData(data);
      
      const storageObject = {
        metadata,
        data: processedData
      };
      
      localStorage.setItem(key, JSON.stringify(storageObject));
      
      if (this.options.encryptionEnabled) {
        console.debug('🔒 Data stored with encryption');
      }
    } catch (error) {
      console.error('🔒 Storage failed:', error);
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (fallbackError) {
        console.error('🔒 Fallback storage also failed:', fallbackError);
      }
    }
  }

  async getItem(key: string): Promise<Record<string, unknown> | null> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const stored = localStorage.getItem(key);
      if (!stored) {
        return null;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(stored);
      } catch {
        console.warn('🔒 Invalid JSON in storage, clearing corrupted data');
        localStorage.removeItem(key);
        return null;
      }

      if (parsedData && typeof parsedData === 'object' && 'metadata' in parsedData) {
        const { metadata, data } = parsedData;
        
        if (metadata.version !== this.options.version) {
          if (import.meta.env.DEV) {
            console.info(`🔒 Storage version mismatch (stored: ${metadata.version}, current: ${this.options.version})`);
          }
        }
        
        if (metadata.encrypted) {
          return await this.decryptSensitiveData(data);
        } else {
          return data;
        }
      } else {
        return await this.decryptSensitiveData(parsedData);
      }
    } catch (error) {
      console.error('🔒 Data retrieval failed:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('🔒 Failed to remove item from storage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
      clearEncryptionKeys();
      if (import.meta.env.DEV) {
        console.info('🔒 Storage and encryption keys cleared');
      }
    } catch (error) {
      console.error('🔒 Failed to clear storage:', error);
    }
  }
}

export function createEncryptedStorageAdapter(options: Partial<EncryptedStorageOptions> = {}) {
  const defaultOptions: EncryptedStorageOptions = {
    encryptionEnabled: true,
    storageKey: 'clinical-toolkit-store',
    version: 1,
    ...options
  };

  const storage = new EncryptedStorage(defaultOptions);

  // Return a PersistStorage interface (handles objects directly)
  return {
    getItem: async (name: string) => {
      try {
        const data = await storage.getItem(name);
        // Zustand expects { state, version } object or null
        return data as any;
      } catch (error) {
        console.error('🔒 Storage adapter getItem failed:', error);
        return null;
      }
    },
    setItem: async (name: string, value: any): Promise<void> => {
      try {
        // Zustand passes { state, version } object directly
        await storage.setItem(name, value);
      } catch (error) {
        console.error('🔒 Storage adapter setItem failed:', error);
        // Don't throw - Zustand middleware expects graceful failure
      }
    },
    removeItem: (name: string): void => {
      storage.removeItem(name);
    }
  };
}
