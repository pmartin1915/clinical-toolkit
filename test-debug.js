import { createEncryptedStorageAdapter } from './src/core/encryptedStorage.ts';

const storage = createEncryptedStorageAdapter({
  encryptionEnabled: true,
  storageKey: 'test',
  version: 1
});

const data = {
  state: { patients: [{ id: '1', name: 'Test' }] },
  version: 1
};

console.log('Storing:', JSON.stringify(data));
await storage.setItem('test-key', data);

console.log('Raw localStorage:', localStorage.getItem('test-key'));

const retrieved = await storage.getItem('test-key');
console.log('Retrieved:', JSON.stringify(retrieved));
