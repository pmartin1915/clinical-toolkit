/**
 * PII Masking Utilities Test Suite
 *
 * Tests HIPAA-compliant masking and hashing of Protected Health Information (PHI)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  maskPatientPII,
  createSafeDisplayName,
  createSafeDisplayNameWithMRN,
  containsPotentialPII,
  sanitizeErrorMessage,
  createAuditLogEntry,
  maskPatientBatch,
  type PIIMaskingConfig,
  type MaskedPatientData
} from '../piiMasking';
import type { PatientProfile } from '../../../types/storage';

describe('PII Masking Utilities', () => {
  // Mock patient data for testing
  const mockPatient: PatientProfile = {
    id: 'patient-123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-15',
    medicalRecordNumber: 'MRN123456',
    conditions: ['diabetes'],
    allergies: ['penicillin'],
    currentMedications: [],
    preferences: {
      reminderTime: '09:00',
      language: 'en',
      units: 'metric',
      dataSharing: false,
      exportFormat: 'pdf'
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  };

  const testConfig: PIIMaskingConfig = {
    hashAlgorithm: 'SHA-256',
    includeTimestamp: false,
    pepper: 'test-pepper'
  };

  describe('maskPatientPII', () => {
    it('should create a hashed ID from patient data', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);

      expect(masked.hashedId).toBeDefined();
      expect(masked.hashedId).toHaveLength(64); // SHA-256 produces 64 hex characters
      expect(masked.hashedId).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce consistent hashes for the same patient', async () => {
      const masked1 = await maskPatientPII(mockPatient, testConfig);
      const masked2 = await maskPatientPII(mockPatient, testConfig);

      expect(masked1.hashedId).toBe(masked2.hashedId);
    });

    it('should produce different hashes for different patients', async () => {
      const patient2: PatientProfile = {
        ...mockPatient,
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1985-06-20'
      };

      const masked1 = await maskPatientPII(mockPatient, testConfig);
      const masked2 = await maskPatientPII(patient2, testConfig);

      expect(masked1.hashedId).not.toBe(masked2.hashedId);
    });

    it('should create display initials correctly', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);

      expect(masked.displayInitials).toBe('J.D.');
    });

    it('should calculate age group correctly for 34-year-old', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);

      // Born 1990-01-15, tested in 2025, age = 34 or 35 depending on current date
      // Should be in "25-34" or "35-44" bucket
      expect(['25-34', '35-44']).toContain(masked.ageGroup);
    });

    it('should preserve original patient ID', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);

      expect(masked.originalId).toBe('patient-123');
    });

    it('should mask medical record number correctly', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);

      expect(masked.maskedMRN).toBe('****3456');
      expect(masked.maskedMRN).not.toContain('MRN');
      expect(masked.maskedMRN).not.toContain('123');
    });

    it('should handle missing MRN gracefully', async () => {
      const patientNoMRN = { ...mockPatient, medicalRecordNumber: undefined };
      const masked = await maskPatientPII(patientNoMRN, testConfig);

      expect(masked.maskedMRN).toBeUndefined();
    });

    it('should handle short MRN correctly', async () => {
      const patientShortMRN = { ...mockPatient, medicalRecordNumber: '123' };
      const masked = await maskPatientPII(patientShortMRN, testConfig);

      expect(masked.maskedMRN).toBe('****');
    });

    it('should handle missing names gracefully', async () => {
      const patientNoName: PatientProfile = {
        ...mockPatient,
        firstName: '',
        lastName: ''
      };
      const masked = await maskPatientPII(patientNoName, testConfig);

      expect(masked.displayInitials).toBe('?.?.');
    });
  });

  describe('Age Group Buckets (HIPAA Safe Harbor)', () => {
    it('should categorize infant correctly (0-4)', async () => {
      const infant = { ...mockPatient, dateOfBirth: '2023-01-01' };
      const masked = await maskPatientPII(infant, testConfig);

      expect(masked.ageGroup).toBe('0-4');
    });

    it('should categorize child correctly (5-11)', async () => {
      const child = { ...mockPatient, dateOfBirth: '2015-01-01' };
      const masked = await maskPatientPII(child, testConfig);

      expect(masked.ageGroup).toBe('5-11');
    });

    it('should categorize teenager correctly (12-17)', async () => {
      const teen = { ...mockPatient, dateOfBirth: '2010-01-01' };
      const masked = await maskPatientPII(teen, testConfig);

      expect(masked.ageGroup).toBe('12-17');
    });

    it('should categorize young adult correctly (18-24)', async () => {
      const youngAdult = { ...mockPatient, dateOfBirth: '2002-01-01' };
      const masked = await maskPatientPII(youngAdult, testConfig);

      expect(masked.ageGroup).toBe('18-24');
    });

    it('should categorize senior correctly (75-89)', async () => {
      const senior = { ...mockPatient, dateOfBirth: '1945-01-01' };
      const masked = await maskPatientPII(senior, testConfig);

      expect(masked.ageGroup).toBe('75-89');
    });

    it('should aggregate ages over 89 (HIPAA requirement)', async () => {
      const elderly = { ...mockPatient, dateOfBirth: '1930-01-01' };
      const masked = await maskPatientPII(elderly, testConfig);

      expect(masked.ageGroup).toBe('90+');
    });

    it('should handle invalid date gracefully', async () => {
      const invalidDate = { ...mockPatient, dateOfBirth: 'invalid-date' };
      const masked = await maskPatientPII(invalidDate, testConfig);

      expect(masked.ageGroup).toBe('Invalid');
    });
  });

  describe('createSafeDisplayName', () => {
    it('should format display name correctly', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);
      const displayName = createSafeDisplayName(masked);

      expect(displayName).toMatch(/^[A-Z]\.[A-Z]\. \(\d+-\d+\)$/);
      expect(displayName).not.toContain('John');
      expect(displayName).not.toContain('Doe');
    });

    it('should create display name with MRN when available', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);
      const displayName = createSafeDisplayNameWithMRN(masked);

      expect(displayName).toContain('****3456');
      expect(displayName).toMatch(/\[.*\d+\]$/);
    });

    it('should create display name without MRN when not available', async () => {
      const patientNoMRN = { ...mockPatient, medicalRecordNumber: undefined };
      const masked = await maskPatientPII(patientNoMRN, testConfig);
      const displayName = createSafeDisplayNameWithMRN(masked);

      expect(displayName).not.toContain('[');
      expect(displayName).not.toContain(']');
    });
  });

  describe('containsPotentialPII', () => {
    it('should detect full names', () => {
      expect(containsPotentialPII('Patient John Doe arrived')).toBe(true);
      expect(containsPotentialPII('Mary Smith checked in')).toBe(true);
    });

    it('should detect SSN patterns', () => {
      expect(containsPotentialPII('SSN: 123-45-6789')).toBe(true);
    });

    it('should detect date patterns (potential DOB)', () => {
      expect(containsPotentialPII('DOB: 1990-01-15')).toBe(true);
    });

    it('should detect potential MRN patterns', () => {
      expect(containsPotentialPII('MRN: ABC123456')).toBe(true);
    });

    it('should detect phone numbers', () => {
      expect(containsPotentialPII('Phone: 5551234567')).toBe(true);
    });

    it('should detect email addresses', () => {
      expect(containsPotentialPII('Contact: john.doe@example.com')).toBe(true);
    });

    it('should not flag safe text', () => {
      expect(containsPotentialPII('Blood pressure is elevated')).toBe(false);
      expect(containsPotentialPII('Patient ID: abc123')).toBe(false);
      expect(containsPotentialPII('Error code: 404')).toBe(false);
    });
  });

  describe('sanitizeErrorMessage', () => {
    it('should return message unchanged if no PII detected', () => {
      const safeMessage = 'Database connection failed';
      const sanitized = sanitizeErrorMessage(safeMessage);

      expect(sanitized).toBe(safeMessage);
    });

    it('should sanitize message containing potential PII', () => {
      const unsafeMessage = 'Error saving data for John Doe';
      const sanitized = sanitizeErrorMessage(unsafeMessage);

      expect(sanitized).not.toContain('John');
      expect(sanitized).not.toContain('Doe');
      expect(sanitized).toContain('PII redacted');
    });

    it('should use masked data when provided', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);
      const unsafeMessage = 'Error saving data for John Doe';
      const sanitized = sanitizeErrorMessage(unsafeMessage, masked);

      expect(sanitized).toContain('J.D.');
      expect(sanitized).toContain(masked.hashedId.substring(0, 8));
      expect(sanitized).not.toContain('John');
    });

    it('should handle Error objects', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);
      const error = new Error('Failed to process John Doe record');
      const sanitized = sanitizeErrorMessage(error, masked);

      expect(sanitized).toContain('J.D.');
      expect(sanitized).not.toContain('John');
    });
  });

  describe('createAuditLogEntry', () => {
    it('should create valid audit log entry', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);
      const entry = createAuditLogEntry('VIEW_RECORD', masked, { source: 'web' });

      expect(entry.action).toBe('VIEW_RECORD');
      expect(entry.patientHashedId).toBe(masked.hashedId);
      expect(entry.patientDisplay).toContain('J.D.');
      expect(entry.timestamp).toBeDefined();
      expect(entry.details).toEqual({ source: 'web' });
    });

    it('should create entry without details', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);
      const entry = createAuditLogEntry('DELETE_RECORD', masked);

      expect(entry.action).toBe('DELETE_RECORD');
      expect(entry.details).toBeUndefined();
    });

    it('should have ISO timestamp', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);
      const entry = createAuditLogEntry('UPDATE_RECORD', masked);

      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('maskPatientBatch', () => {
    it('should mask multiple patients correctly', async () => {
      const patients: PatientProfile[] = [
        mockPatient,
        { ...mockPatient, id: 'patient-456', firstName: 'Jane', lastName: 'Smith' },
        { ...mockPatient, id: 'patient-789', firstName: 'Bob', lastName: 'Johnson' }
      ];

      const masked = await maskPatientBatch(patients, testConfig);

      expect(masked).toHaveLength(3);
      expect(masked[0].displayInitials).toBe('J.D.');
      expect(masked[1].displayInitials).toBe('J.S.');
      expect(masked[2].displayInitials).toBe('B.J.');
    });

    it('should produce unique hashes for each patient', async () => {
      const patients: PatientProfile[] = [
        mockPatient,
        { ...mockPatient, id: 'patient-456', firstName: 'Jane' },
        { ...mockPatient, id: 'patient-789', lastName: 'Smith' }
      ];

      const masked = await maskPatientBatch(patients, testConfig);
      const hashes = masked.map(m => m.hashedId);

      // All hashes should be unique
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);
    });

    it('should handle empty array', async () => {
      const masked = await maskPatientBatch([], testConfig);

      expect(masked).toEqual([]);
    });
  });

  describe('Hash Determinism and Uniqueness', () => {
    it('should produce consistent hashes across sessions', async () => {
      const hashes: string[] = [];

      for (let i = 0; i < 5; i++) {
        const masked = await maskPatientPII(mockPatient, testConfig);
        hashes.push(masked.hashedId);
      }

      // All hashes should be identical
      expect(new Set(hashes).size).toBe(1);
    });

    it('should produce different hashes for name changes', async () => {
      const patient1 = mockPatient;
      const patient2 = { ...mockPatient, firstName: 'Jane' };
      const patient3 = { ...mockPatient, lastName: 'Smith' };

      const masked1 = await maskPatientPII(patient1, testConfig);
      const masked2 = await maskPatientPII(patient2, testConfig);
      const masked3 = await maskPatientPII(patient3, testConfig);

      expect(masked1.hashedId).not.toBe(masked2.hashedId);
      expect(masked1.hashedId).not.toBe(masked3.hashedId);
      expect(masked2.hashedId).not.toBe(masked3.hashedId);
    });

    it('should produce different hashes for DOB changes', async () => {
      const patient1 = mockPatient;
      const patient2 = { ...mockPatient, dateOfBirth: '1991-01-15' };

      const masked1 = await maskPatientPII(patient1, testConfig);
      const masked2 = await maskPatientPII(patient2, testConfig);

      expect(masked1.hashedId).not.toBe(masked2.hashedId);
    });

    it('should produce different hashes for MRN changes', async () => {
      const patient1 = mockPatient;
      const patient2 = { ...mockPatient, medicalRecordNumber: 'MRN999999' };

      const masked1 = await maskPatientPII(patient1, testConfig);
      const masked2 = await maskPatientPII(patient2, testConfig);

      expect(masked1.hashedId).not.toBe(masked2.hashedId);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle patients with special characters in names', async () => {
      const patient = {
        ...mockPatient,
        firstName: "O'Brien",
        lastName: 'Smith-Jones'
      };

      const masked = await maskPatientPII(patient, testConfig);

      expect(masked.displayInitials).toBe('O.S.');
      expect(masked.hashedId).toBeDefined();
    });

    it('should handle patients with unicode characters', async () => {
      const patient = {
        ...mockPatient,
        firstName: 'José',
        lastName: 'Müller'
      };

      const masked = await maskPatientPII(patient, testConfig);

      expect(masked.displayInitials).toBe('J.M.');
      expect(masked.hashedId).toBeDefined();
    });

    it('should handle very long names', async () => {
      const patient = {
        ...mockPatient,
        firstName: 'A'.repeat(100),
        lastName: 'B'.repeat(100)
      };

      const masked = await maskPatientPII(patient, testConfig);

      expect(masked.displayInitials).toBe('A.B.');
      expect(masked.hashedId).toHaveLength(64);
    });

    it('should handle future dates gracefully', async () => {
      const patient = { ...mockPatient, dateOfBirth: '2030-01-01' };
      const masked = await maskPatientPII(patient, testConfig);

      expect(masked.ageGroup).toBeDefined();
      expect(masked.hashedId).toBeDefined();
    });

    it('should handle very old dates (>120 years)', async () => {
      const patient = { ...mockPatient, dateOfBirth: '1900-01-01' };
      const masked = await maskPatientPII(patient, testConfig);

      expect(masked.ageGroup).toBe('90+'); // HIPAA aggregation
    });
  });

  describe('Security Properties', () => {
    it('should not expose original names in masked data', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);
      const maskedString = JSON.stringify(masked);

      expect(maskedString).not.toContain('John');
      expect(maskedString).not.toContain('Doe');
    });

    it('should not expose full DOB in masked data', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);
      const maskedString = JSON.stringify(masked);

      expect(maskedString).not.toContain('1990-01-15');
    });

    it('should not expose full MRN in masked data', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);
      const maskedString = JSON.stringify(masked);

      expect(maskedString).not.toContain('MRN123456');
      expect(maskedString).toContain('****');
    });

    it('should produce irreversible hashes', async () => {
      const masked = await maskPatientPII(mockPatient, testConfig);

      // Hash should not contain recognizable patterns
      expect(masked.hashedId.toLowerCase()).not.toContain('john');
      expect(masked.hashedId.toLowerCase()).not.toContain('doe');
      expect(masked.hashedId).not.toContain('1990');
    });
  });
});
