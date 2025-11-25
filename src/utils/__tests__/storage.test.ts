import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PatientProfile, AssessmentResult, VitalSigns } from '../../types/storage';
import type { storageManager as StorageManagerType } from '../storage';

// Unmock the storage module for this test file (it's mocked globally in setup.ts)
vi.unmock('../storage');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('StorageManager', () => {
  let storageManager: typeof StorageManagerType;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorageMock.clear();

    // Reset modules to ensure fresh import
    vi.resetModules();

    // Import the real storage manager after mocking localStorage
    const { storageManager: sm } = await import('../storage');
    storageManager = sm;
  });

  describe('Patient Management', () => {
    const mockPatient: PatientProfile = {
      id: 'patient-123',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-01-01',
      conditions: ['hypertension'],
      allergies: ['penicillin'],
      currentMedications: [],
      preferences: {
        reminderTime: '09:00',
        language: 'en',
        units: 'metric',
        dataSharing: false,
        exportFormat: 'pdf'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    it('saves and retrieves patient data', async () => {
      await storageManager.savePatient(mockPatient);
      const retrieved = storageManager.getPatient('patient-123');
      
      expect(retrieved).toEqual(expect.objectContaining({
        id: 'patient-123',
        firstName: 'John',
        lastName: 'Doe'
      }));
    });

    it('updates existing patient data', async () => {
      await storageManager.savePatient(mockPatient);
      
      const updatedPatient = { ...mockPatient, firstName: 'Jane' };
      await storageManager.savePatient(updatedPatient);
      
      const retrieved = storageManager.getPatient('patient-123');
      expect(retrieved?.firstName).toBe('Jane');
    });

    it('returns all patients', async () => {
      const patient1 = { ...mockPatient, id: 'patient-1' };
      const patient2 = { ...mockPatient, id: 'patient-2' };
      
      await storageManager.savePatient(patient1);
      await storageManager.savePatient(patient2);
      
      const allPatients = storageManager.getAllPatients();
      expect(allPatients).toHaveLength(2);
    });

    it('deletes patient and related data', async () => {
      await storageManager.savePatient(mockPatient);
      await storageManager.deletePatient('patient-123');
      
      const retrieved = storageManager.getPatient('patient-123');
      expect(retrieved).toBeNull();
    });
  });

  describe('Assessment Management', () => {
    const mockAssessment: AssessmentResult = {
      id: 'assessment-123',
      patientId: 'patient-123',
      conditionId: 'asthma',
      toolId: 'act',
      toolName: 'Asthma Control Test',
      responses: { q1: 5, q2: 4, q3: 3, q4: 4, q5: 5 },
      score: 21,
      severity: 'Well Controlled',
      recommendations: ['Continue current treatment'],
      timestamp: '2024-01-01T00:00:00Z'
    };

    it('saves and retrieves assessment data', async () => {
      await storageManager.saveAssessment(mockAssessment);
      const assessments = storageManager.getPatientAssessments('patient-123');
      
      expect(assessments).toHaveLength(1);
      expect(assessments[0]).toEqual(mockAssessment);
    });

    it('updates existing assessment', async () => {
      await storageManager.saveAssessment(mockAssessment);
      
      const updatedAssessment = { ...mockAssessment, score: 25 };
      await storageManager.saveAssessment(updatedAssessment);
      
      const assessments = storageManager.getPatientAssessments('patient-123');
      expect(assessments).toHaveLength(1);
      expect(assessments[0].score).toBe(25);
    });

    it('filters assessments by patient', async () => {
      const assessment1 = { ...mockAssessment, id: 'assess-1', patientId: 'patient-1' };
      const assessment2 = { ...mockAssessment, id: 'assess-2', patientId: 'patient-2' };
      
      await storageManager.saveAssessment(assessment1);
      await storageManager.saveAssessment(assessment2);
      
      const patient1Assessments = storageManager.getPatientAssessments('patient-1');
      expect(patient1Assessments).toHaveLength(1);
      expect(patient1Assessments[0].id).toBe('assess-1');
    });
  });

  describe('Vital Signs Management', () => {
    const mockVital: VitalSigns = {
      id: 'vital-123',
      patientId: 'patient-123',
      type: 'blood_pressure',
      value: { systolic: 120, diastolic: 80 },
      unit: 'mmHg',
      timestamp: '2024-01-01T00:00:00Z',
      location: 'home'
    };

    it('saves and retrieves vital signs', async () => {
      await storageManager.saveVitalSigns(mockVital);
      const vitals = storageManager.getPatientVitals('patient-123');
      
      expect(vitals).toHaveLength(1);
      expect(vitals[0]).toEqual(mockVital);
    });

    it('filters vitals by type', async () => {
      const bpVital = { ...mockVital, id: 'vital-bp', type: 'blood_pressure' as const };
      const glucoseVital = { ...mockVital, id: 'vital-glucose', type: 'blood_glucose' as const, value: 95 };
      
      await storageManager.saveVitalSigns(bpVital);
      await storageManager.saveVitalSigns(glucoseVital);
      
      const bpVitals = storageManager.getPatientVitals('patient-123', 'blood_pressure');
      expect(bpVitals).toHaveLength(1);
      expect(bpVitals[0].type).toBe('blood_pressure');
    });
  });

  describe('Data Export/Import', () => {
    const mockPatient: PatientProfile = {
      id: 'patient-123',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-01-01',
      conditions: ['hypertension'],
      allergies: [],
      currentMedications: [],
      preferences: {
        reminderTime: '09:00',
        language: 'en',
        units: 'metric',
        dataSharing: false,
        exportFormat: 'pdf'
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    it('exports patient data', async () => {
      await storageManager.savePatient(mockPatient);
      
      const exportData = storageManager.exportPatientData('patient-123');
      
      expect(exportData).toEqual(expect.objectContaining({
        patientProfile: mockPatient,
        assessments: [],
        vitals: [],
        goals: [],
        education: [],
        exportedAt: expect.any(String)
      }));
    });

    it('exports all data for backup', () => {
      const backupData = storageManager.exportAllData();
      
      expect(backupData).toEqual(expect.objectContaining({
        version: '1.0.0',
        patients: expect.any(Array),
        assessments: expect.any(Array),
        vitals: expect.any(Array),
        goals: expect.any(Array),
        education: expect.any(Array),
        createdAt: expect.any(String),
        checksum: expect.any(String)
      }));
    });

    it('creates and retrieves backups', async () => {
      const backup = await storageManager.createBackup();
      const backups = storageManager.getBackups();

      expect(backups).toContainEqual(backup);
    });
  });

  describe('Storage Management', () => {
    it('generates unique IDs', () => {
      const id1 = storageManager.generateId();
      const id2 = storageManager.generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    it('calculates storage statistics', () => {
      const stats = storageManager.getStorageStats();
      
      expect(stats).toEqual(expect.objectContaining({
        used: expect.any(Number),
        total: expect.any(Number),
        percentage: expect.any(Number)
      }));
    });

    it('tracks first visit status', () => {
      expect(storageManager.isFirstVisit()).toBe(true);
      
      storageManager.markWelcomed();
      expect(storageManager.isFirstVisit()).toBe(false);
    });

    it('tracks tour completion', () => {
      expect(storageManager.hasCompletedTour()).toBe(false);
      
      storageManager.markTourCompleted();
      expect(storageManager.hasCompletedTour()).toBe(true);
    });
  });
});