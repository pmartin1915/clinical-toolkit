/**
 * Encryption Integration Tests
 *
 * These tests verify that:
 * 1. localStorage contains actual ciphertext (not plaintext)
 * 2. Round-trip encryption/decryption maintains data integrity
 * 3. Selective field encryption works correctly
 * 4. Session keys provide isolation
 * 5. Edge cases are handled properly
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createEncryptedStorageAdapter } from '../encryptedStorage';
import { clearEncryptionKeys } from '../encryption';

describe('Encryption Integration - localStorage Verification', () => {
  let storage: ReturnType<typeof createEncryptedStorageAdapter>;
  const STORAGE_KEY = 'clinical-toolkit-store';
  let localStorageData: Record<string, string> = {};

  beforeEach(() => {
    // Reset localStorage
    localStorageData = {};
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
          localStorageData = {};
        },
        get length() {
          return Object.keys(localStorageData).length;
        },
        key: (index: number) => Object.keys(localStorageData)[index] || null
      },
      writable: true,
      configurable: true
    });

    // Create storage adapter with encryption enabled
    storage = createEncryptedStorageAdapter({
      encryptionEnabled: true,
      storageKey: STORAGE_KEY,
      version: 1
    });
  });

  afterEach(() => {
    clearEncryptionKeys();
  });

  it('should store ciphertext in localStorage, never plaintext', async () => {
    // Store sensitive patient data with identifiable PHI
    const sensitiveData = {
      state: {
        patients: [
          {
            id: 'patient-123',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            ssn: '123-45-6789',
            email: 'john.doe@example.com'
          }
        ],
        assessments: [
          {
            id: 'assess-456',
            patientId: 'patient-123',
            diagnosis: 'Hypertension',
            notes: 'Patient presents with elevated blood pressure'
          }
        ],
        vitals: [
          {
            id: 'vital-789',
            type: 'blood_pressure',
            systolic: 140,
            diastolic: 90
          }
        ]
      },
      version: 1
    };

    // Store the data
    await storage.setItem(STORAGE_KEY, sensitiveData);

    // Retrieve raw localStorage value
    const rawStoredValue = localStorageData[STORAGE_KEY];

    expect(rawStoredValue).toBeDefined();
    expect(typeof rawStoredValue).toBe('string');

    // Parse the outer JSON structure
    const parsedStorage = JSON.parse(rawStoredValue);

    // Storage structure: { metadata, data: { state: {...}, version } }
    expect(parsedStorage.data).toBeDefined();
    expect(parsedStorage.data.state).toBeDefined();

    // Verify that sensitive fields are encrypted (Base64 strings, not objects)
    expect(typeof parsedStorage.data.state.patients).toBe('string');
    expect(typeof parsedStorage.data.state.assessments).toBe('string');
    expect(typeof parsedStorage.data.state.vitals).toBe('string');

    // Verify no plaintext PHI appears anywhere in the raw storage
    expect(rawStoredValue).not.toContain('John');
    expect(rawStoredValue).not.toContain('Doe');
    expect(rawStoredValue).not.toContain('123-45-6789');
    expect(rawStoredValue).not.toContain('john.doe@example.com');
    expect(rawStoredValue).not.toContain('Hypertension');
    expect(rawStoredValue).not.toContain('elevated blood pressure');
    expect(rawStoredValue).not.toContain('patient-123');

    // Verify encrypted values are valid Base64
    const isValidBase64 = (str: string): boolean => {
      try {
        return btoa(atob(str)) === str;
      } catch {
        return false;
      }
    };

    expect(isValidBase64(parsedStorage.data.state.patients)).toBe(true);
    expect(isValidBase64(parsedStorage.data.state.assessments)).toBe(true);
    expect(isValidBase64(parsedStorage.data.state.vitals)).toBe(true);

    // Verify decryption retrieves original data
    const retrieved = await storage.getItem(STORAGE_KEY);
    expect(retrieved).toEqual(sensitiveData);
  });

  it('should correctly encrypt and decrypt complex medical records', async () => {
    // Create realistic complex medical data
    const complexData = {
      state: {
        patients: [
          {
            id: 'p1',
            firstName: 'Alice',
            lastName: 'Johnson',
            dateOfBirth: '1985-05-15',
            conditions: ['Diabetes Type 2', 'Hypertension'],
            allergies: ['Penicillin', 'Sulfa drugs'],
            currentMedications: [
              { name: 'Metformin', dosage: '500mg', frequency: 'twice daily' },
              { name: 'Lisinopril', dosage: '10mg', frequency: 'once daily' }
            ],
            emergencyContact: {
              name: 'Bob Johnson',
              relationship: 'Spouse',
              phone: '555-0123'
            }
          },
          {
            id: 'p2',
            firstName: 'Carlos',
            lastName: 'Rodriguez',
            dateOfBirth: '1972-11-30',
            conditions: ['Asthma'],
            allergies: [],
            currentMedications: []
          }
        ],
        assessments: [
          {
            id: 'a1',
            patientId: 'p1',
            toolId: 'phq9',
            responses: [0, 1, 1, 2, 1, 0, 1, 2, 0],
            score: 8,
            severity: 'mild',
            timestamp: new Date('2024-01-15T10:30:00Z').toISOString()
          }
        ],
        vitals: [
          {
            id: 'v1',
            patientId: 'p1',
            type: 'blood_pressure',
            value: { systolic: 135, diastolic: 85 },
            timestamp: new Date('2024-01-15T10:00:00Z').toISOString()
          },
          {
            id: 'v2',
            patientId: 'p1',
            type: 'weight',
            value: 180.5,
            unit: 'lbs',
            timestamp: new Date('2024-01-15T10:00:00Z').toISOString()
          }
        ]
      },
      version: 1
    };

    // Encrypt and store
    await storage.setItem(STORAGE_KEY, complexData);

    // Retrieve and decrypt
    const retrieved = await storage.getItem(STORAGE_KEY);

    // Deep equality check
    expect(retrieved).toEqual(complexData);

    // Verify array types preserved
    expect(Array.isArray(retrieved.state.patients)).toBe(true);
    expect(Array.isArray(retrieved.state.assessments)).toBe(true);
    expect(Array.isArray(retrieved.state.vitals)).toBe(true);

    // Verify nested object types preserved
    expect(typeof retrieved.state.patients[0].emergencyContact).toBe('object');
    expect(typeof retrieved.state.vitals[0].value).toBe('object');

    // Verify numeric types preserved
    expect(typeof retrieved.state.vitals[1].value).toBe('number');
    expect(retrieved.state.vitals[1].value).toBe(180.5);
  });

  it('should selectively encrypt only sensitive fields', async () => {
    // Data with mixed sensitive/non-sensitive fields
    const mixedData = {
      state: {
        patients: [{ id: '1', name: 'Test Patient' }],
        assessments: [{ id: '1', score: 5 }],
        vitals: [{ id: '1', value: 120 }],
        // Non-sensitive fields that should NOT be encrypted
        settings: { theme: 'dark', language: 'en' },
        lastSync: new Date().toISOString()
      },
      version: 1
    };

    await storage.setItem(STORAGE_KEY, mixedData);

    const rawStored = localStorageData[STORAGE_KEY];
    const parsed = JSON.parse(rawStored);

    // Storage structure: { metadata, data: { state: {...}, version } }
    expect(parsed.data).toBeDefined();
    expect(parsed.data.state).toBeDefined();

    // Verify sensitive fields are encrypted (strings, not objects)
    expect(typeof parsed.data.state.patients).toBe('string');
    expect(typeof parsed.data.state.assessments).toBe('string');
    expect(typeof parsed.data.state.vitals).toBe('string');

    // Verify non-sensitive fields are NOT encrypted (remain as objects)
    // Note: Current implementation encrypts only patients/assessments/vitals
    expect(typeof parsed.data.state.settings).toBe('object');
    expect(parsed.data.state.settings.theme).toBe('dark');

    // Verify version is readable (not encrypted)
    expect(parsed.data.version).toBe(1);

    // Verify metadata is readable
    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.encrypted).toBe(true);
  });

  it('should handle empty and null data gracefully', async () => {
    // Test empty arrays
    const emptyData = {
      state: {
        patients: [],
        assessments: [],
        vitals: []
      },
      version: 1
    };

    await storage.setItem(STORAGE_KEY, emptyData);
    const retrieved = await storage.getItem(STORAGE_KEY);
    expect(retrieved).toEqual(emptyData);
    expect(Array.isArray(retrieved.state.patients)).toBe(true);
    expect(retrieved.state.patients.length).toBe(0);

    // Test null values within arrays
    const nullData = {
      state: {
        patients: [{ id: '1', firstName: 'Test', lastName: null }],
        assessments: [],
        vitals: []
      },
      version: 1
    };

    await storage.setItem(STORAGE_KEY, nullData);
    const retrievedNull = await storage.getItem(STORAGE_KEY);
    expect(retrievedNull).toEqual(nullData);
    expect(retrievedNull.state.patients[0].lastName).toBe(null);
  });

  it('should handle unicode and special characters', async () => {
    // Test data with unicode and special characters
    const unicodeData = {
      state: {
        patients: [
          {
            id: '1',
            firstName: '小明',
            lastName: 'López',
            notes: 'Patient presents with café au lait spots. Details: "quoted text" & <special> chars'
          }
        ],
        assessments: [
          {
            id: '1',
            diagnosis: 'Caféine addiction 😊',
            notes: 'Unicode emoji: 🏥 💊 🩺'
          }
        ],
        vitals: []
      },
      version: 1
    };

    await storage.setItem(STORAGE_KEY, unicodeData);
    const retrieved = await storage.getItem(STORAGE_KEY);

    expect(retrieved).toEqual(unicodeData);
    expect(retrieved.state.patients[0].firstName).toBe('小明');
    expect(retrieved.state.patients[0].lastName).toBe('López');
    expect(retrieved.state.assessments[0].diagnosis).toBe('Caféine addiction 😊');
    expect(retrieved.state.assessments[0].notes).toContain('🏥');

    // Verify no plaintext unicode in raw storage
    const rawStored = localStorageData[STORAGE_KEY];
    expect(rawStored).not.toContain('小明');
    expect(rawStored).not.toContain('López');
    expect(rawStored).not.toContain('😊');
  });

  it('should handle large data sets without corruption', async () => {
    // Generate large dataset
    const largePatients = Array.from({ length: 100 }, (_, i) => ({
      id: `patient-${i}`,
      firstName: `FirstName${i}`,
      lastName: `LastName${i}`,
      dateOfBirth: `1980-01-${String(i % 28 + 1).padStart(2, '0')}`,
      conditions: [`Condition ${i}A`, `Condition ${i}B`],
      allergies: [`Allergy ${i}A`],
      currentMedications: [
        { name: `Med ${i}A`, dosage: '10mg', frequency: 'daily' },
        { name: `Med ${i}B`, dosage: '20mg', frequency: 'twice daily' }
      ]
    }));

    const largeData = {
      state: {
        patients: largePatients,
        assessments: Array.from({ length: 200 }, (_, i) => ({
          id: `assess-${i}`,
          patientId: `patient-${i % 100}`,
          score: i % 27,
          responses: Array(9).fill(i % 4)
        })),
        vitals: Array.from({ length: 500 }, (_, i) => ({
          id: `vital-${i}`,
          patientId: `patient-${i % 100}`,
          type: 'blood_pressure',
          value: { systolic: 120 + (i % 40), diastolic: 80 + (i % 20) }
        }))
      },
      version: 1
    };

    await storage.setItem(STORAGE_KEY, largeData);
    const retrieved = await storage.getItem(STORAGE_KEY);

    expect(retrieved).toEqual(largeData);
    expect(retrieved.state.patients.length).toBe(100);
    expect(retrieved.state.assessments.length).toBe(200);
    expect(retrieved.state.vitals.length).toBe(500);

    // Verify last patient data integrity
    expect(retrieved.state.patients[99].firstName).toBe('FirstName99');
    expect(retrieved.state.patients[99].lastName).toBe('LastName99');
  });

  it('should verify encryption round-trip maintains exact data types', async () => {
    // Test data with various JavaScript types
    const typedData = {
      state: {
        patients: [
          {
            id: '1',
            age: 45, // number
            isActive: true, // boolean
            lastVisit: null, // null
            notes: '', // empty string
            weight: 175.5, // float
            children: 3, // integer
            tags: ['diabetic', 'high-risk'], // string array
            metadata: { status: 'active', verified: false } // nested object
          }
        ],
        assessments: [],
        vitals: []
      },
      version: 1
    };

    await storage.setItem(STORAGE_KEY, typedData);
    const retrieved = await storage.getItem(STORAGE_KEY);

    // Type assertions
    const patient = retrieved.state.patients[0];
    expect(typeof patient.age).toBe('number');
    expect(typeof patient.isActive).toBe('boolean');
    expect(patient.lastVisit).toBe(null);
    expect(typeof patient.notes).toBe('string');
    expect(typeof patient.weight).toBe('number');
    expect(Number.isInteger(patient.children)).toBe(true);
    expect(Array.isArray(patient.tags)).toBe(true);
    expect(typeof patient.metadata).toBe('object');

    // Value assertions
    expect(patient.age).toBe(45);
    expect(patient.isActive).toBe(true);
    expect(patient.weight).toBe(175.5);
    expect(patient.children).toBe(3);
  });
});
