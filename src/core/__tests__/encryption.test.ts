import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeEncryption,
  encryptData,
  decryptData,
  validateEncryption,
  isEncryptionAvailable,
  clearEncryptionKeys
} from '../encryption';

describe('Encryption', () => {
  beforeEach(() => {
    clearEncryptionKeys();
  });

  it('should initialize and validate', async () => {
    await initializeEncryption();
    expect(isEncryptionAvailable()).toBe(true);
    expect(await validateEncryption()).toBe(true);
  });

  it('should encrypt and decrypt', async () => {
    await initializeEncryption();
    const data = { test: 'data', num: 123 };
    const encrypted = await encryptData(data);
    expect(encrypted).not.toContain('test');
    const decrypted = await decryptData(encrypted);
    expect(decrypted).toEqual(data);
  });

  it('should use random IV', async () => {
    await initializeEncryption();
    const data = { test: 'data' };
    const enc1 = await encryptData(data);
    const enc2 = await encryptData(data);
    expect(enc1).not.toBe(enc2);
  });

  it('should not expose plaintext', async () => {
    await initializeEncryption();
    const sensitive = { ssn: '123-45-6789', password: 'secret' };
    const encrypted = await encryptData(sensitive);
    expect(encrypted).not.toContain('123-45-6789');
    expect(encrypted).not.toContain('secret');
  });
});
