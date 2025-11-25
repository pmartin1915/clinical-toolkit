import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll, expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock storageManager for tests
const mockStorageManager = {
  generateId: () => 'test-id-' + Math.random().toString(36).substring(7),
  saveAssessment: vi.fn().mockResolvedValue(undefined),
  getPatientAssessments: vi.fn().mockReturnValue([]),
  getAllPatients: vi.fn().mockReturnValue([]),
  getPatient: vi.fn().mockReturnValue(null),
  savePatient: vi.fn().mockResolvedValue(undefined),
  deletePatient: vi.fn().mockResolvedValue(undefined),
  saveVitalSigns: vi.fn().mockResolvedValue(undefined),
  getPatientVitals: vi.fn().mockReturnValue([]),
  saveGoal: vi.fn().mockResolvedValue(undefined),
  getPatientGoals: vi.fn().mockReturnValue([]),
  saveEducationProgress: vi.fn().mockResolvedValue(undefined),
  getPatientEducationProgress: vi.fn().mockReturnValue([]),
  exportPatientData: vi.fn().mockReturnValue({}),
  exportAllData: vi.fn().mockReturnValue({}),
  importData: vi.fn().mockResolvedValue(undefined),
  createBackup: vi.fn().mockResolvedValue({}),
  getBackups: vi.fn().mockReturnValue([]),
  restoreFromBackup: vi.fn().mockResolvedValue(undefined),
  getStorageStats: vi.fn().mockReturnValue({ used: 0, total: 5242880, percentage: 0 }),
  clearAllData: vi.fn(),
  updateStorageConfig: vi.fn(),
  isFirstVisit: vi.fn().mockReturnValue(false),
  markWelcomed: vi.fn(),
  hasCompletedTour: vi.fn().mockReturnValue(true),
  markTourCompleted: vi.fn(),
  shouldShowTour: vi.fn().mockReturnValue(false)
};

// Mock the storage module
vi.mock('../utils/storage', () => ({
  storageManager: mockStorageManager
}));

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