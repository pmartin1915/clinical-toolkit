/**
 * Clinical Toolkit Store - Zustand with Encrypted Persistence
 * Replaces StorageManager with secure, type-safe state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEncryptedStorageAdapter } from '../core/encryptedStorage';
import { maskPatientPII, maskPatientBatch, createAuditLogEntry } from '../utils/security/piiMasking';
import type {
  PatientProfile,
  AssessmentResult,
  VitalSigns,
  GoalTracking,
  EducationProgress,
  StorageConfig
} from '../types/storage';

interface ClinicalState {
  // Data
  patients: PatientProfile[];
  assessments: AssessmentResult[];
  vitals: VitalSigns[];
  goals: GoalTracking[];
  education: EducationProgress[];
  config: StorageConfig;
  
  // UI State
  welcomed: boolean;
  tourCompleted: boolean;
  
  // Patient operations
  savePatient: (patient: PatientProfile) => void;
  getPatient: (patientId: string) => PatientProfile | null;
  getAllPatients: () => PatientProfile[];
  deletePatient: (patientId: string) => void;
  
  // Assessment operations
  saveAssessment: (assessment: AssessmentResult) => void;
  getPatientAssessments: (patientId: string) => AssessmentResult[];
  
  // Vitals operations
  saveVitalSigns: (vital: VitalSigns) => void;
  getPatientVitals: (patientId: string, type?: string) => VitalSigns[];
  deleteVitalSigns: (id: string) => void;
  
  // Goal operations
  saveGoal: (goal: GoalTracking) => void;
  getPatientGoals: (patientId: string) => GoalTracking[];
  
  // Education operations
  saveEducationProgress: (progress: EducationProgress) => void;
  getPatientEducationProgress: (patientId: string) => EducationProgress[];
  
  // Config operations
  updateConfig: (config: Partial<StorageConfig>) => void;
  
  // Utility
  generateId: () => string;
  clearAllData: () => void;
  
  // First-visit tracking
  isFirstVisit: () => boolean;
  markWelcomed: () => void;
  
  // Tour tracking
  shouldShowTour: () => boolean;
  markTourCompleted: () => void;
  
  // Backup/restore
  exportPatientData: (patientId: string) => any;
  exportAllData: () => any;
  importData: (data: any) => void;
  
  // Storage stats
  getStorageStats: () => { used: number; total: number; percentage: number };
}

const defaultConfig: StorageConfig = {
  encryptionEnabled: true,
  autoBackup: true,
  backupFrequency: 'weekly',
  retentionPeriod: 365,
  maxFileSize: 10
};

export const useClinicalStore = create<ClinicalState>()(
  persist(
    (set, get) => ({
      // Initial state
      patients: [],
      assessments: [],
      vitals: [],
      goals: [],
      education: [],
      config: defaultConfig,
      welcomed: false,
      tourCompleted: false,
      
      // Patient operations
      savePatient: (patient) => set((state) => {
        const existingIndex = state.patients.findIndex(p => p.id === patient.id);
        patient.updatedAt = new Date().toISOString();
        
        if (existingIndex >= 0) {
          const patients = [...state.patients];
          patients[existingIndex] = patient;
          return { patients };
        } else {
          patient.createdAt = new Date().toISOString();
          return { patients: [...state.patients, patient] };
        }
      }),
      
      getPatient: (patientId) => {
        return get().patients.find(p => p.id === patientId) || null;
      },
      
      getAllPatients: () => {
        return get().patients;
      },
      
      deletePatient: (patientId) => set((state) => ({
        patients: state.patients.filter(p => p.id !== patientId),
        assessments: state.assessments.filter(a => a.patientId !== patientId),
        vitals: state.vitals.filter(v => v.patientId !== patientId),
        goals: state.goals.filter(g => g.patientId !== patientId),
        education: state.education.filter(e => e.patientId !== patientId)
      })),
      
      // Assessment operations
      saveAssessment: (assessment) => set((state) => {
        const existingIndex = state.assessments.findIndex(a => a.id === assessment.id);
        
        if (existingIndex >= 0) {
          const assessments = [...state.assessments];
          assessments[existingIndex] = assessment;
          return { assessments };
        } else {
          return { assessments: [...state.assessments, assessment] };
        }
      }),
      
      getPatientAssessments: (patientId) => {
        return get().assessments.filter(a => a.patientId === patientId);
      },
      
      // Vitals operations
      saveVitalSigns: (vital) => set((state) => {
        const existingIndex = state.vitals.findIndex(v => v.id === vital.id);
        
        if (existingIndex >= 0) {
          const vitals = [...state.vitals];
          vitals[existingIndex] = vital;
          return { vitals };
        } else {
          return { vitals: [...state.vitals, vital] };
        }
      }),
      
      getPatientVitals: (patientId, type) => {
        return get().vitals.filter(v =>
          v.patientId === patientId && (!type || v.type === type)
        );
      },

      deleteVitalSigns: (id) => set((state) => ({
        vitals: state.vitals.filter(v => v.id !== id)
      })),

      // Goal operations
      saveGoal: (goal) => set((state) => {
        const existingIndex = state.goals.findIndex(g => g.id === goal.id);
        
        if (existingIndex >= 0) {
          const goals = [...state.goals];
          goals[existingIndex] = goal;
          return { goals };
        } else {
          return { goals: [...state.goals, goal] };
        }
      }),
      
      getPatientGoals: (patientId) => {
        return get().goals.filter(g => g.patientId === patientId);
      },
      
      // Education operations
      saveEducationProgress: (progress) => set((state) => {
        const existingIndex = state.education.findIndex(e => e.id === progress.id);
        
        if (existingIndex >= 0) {
          const education = [...state.education];
          education[existingIndex] = progress;
          return { education };
        } else {
          return { education: [...state.education, progress] };
        }
      }),
      
      getPatientEducationProgress: (patientId) => {
        return get().education.filter(e => e.patientId === patientId);
      },
      
      // Config operations
      updateConfig: (newConfig) => set((state) => ({
        config: { ...state.config, ...newConfig }
      })),
      
      // Utility
      generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
      },
      
      clearAllData: () => set({
        patients: [],
        assessments: [],
        vitals: [],
        goals: [],
        education: [],
        config: defaultConfig,
        welcomed: false,
        tourCompleted: false
      }),
      
      // First-visit tracking
      isFirstVisit: () => {
        return !get().welcomed;
      },
      
      markWelcomed: () => {
        set({ welcomed: true });
        // You might still want to keep these for analytics if needed
        localStorage.setItem('clinical-toolkit-welcomed-date', new Date().toISOString());
      },
      
      // Tour tracking
      shouldShowTour: () => {
        const state = get();
        return state.welcomed && !state.tourCompleted;
      },
      
      markTourCompleted: () => {
        set({ tourCompleted: true });
        // You might still want to keep these for analytics if needed
        localStorage.setItem('clinical-toolkit-tour-completed-date', new Date().toISOString());
      },
      
      // Backup/restore - HIPAA compliant with masked PII
      exportPatientData: async (patientId: string) => {
        const state = get();
        const patient = state.patients.find(p => p.id === patientId);
        if (!patient) return null;

        // Mask patient PII for HIPAA compliance
        const maskedPatient = await maskPatientPII(patient);

        // Create audit log entry
        const auditEntry = createAuditLogEntry('EXPORT_PATIENT_DATA', maskedPatient, {
          dataTypes: ['assessments', 'vitals', 'goals', 'education']
        });
        console.info('📋 Patient data exported:', auditEntry);

        return {
          patientProfile: patient, // Full profile for legitimate export use
          maskedPatientProfile: maskedPatient, // Masked version for display/logging
          assessments: state.assessments.filter(a => a.patientId === patientId),
          vitals: state.vitals.filter(v => v.patientId === patientId),
          goals: state.goals.filter(g => g.patientId === patientId),
          education: state.education.filter(e => e.patientId === patientId),
          exportedAt: new Date().toISOString()
        };
      },
      
      exportAllData: async () => {
        const state = get();

        // Mask all patient PII for HIPAA compliance
        const maskedPatients = await maskPatientBatch(state.patients);

        // Create audit log entry for batch export
        console.info('📋 All data exported:', {
          timestamp: new Date().toISOString(),
          action: 'EXPORT_ALL_DATA',
          patientCount: state.patients.length,
          maskedPatients: maskedPatients.map(p => p.displayInitials)
        });

        return {
          version: '1.0.0',
          patients: state.patients, // Full profiles for legitimate export use
          maskedPatients, // Masked versions for display/logging
          assessments: state.assessments,
          vitals: state.vitals,
          goals: state.goals,
          education: state.education,
          config: state.config,
          exportedAt: new Date().toISOString()
        };
      },
      
      importData: (data: any) => {
        if (!data || typeof data !== 'object') return;
        
        set({
          patients: data.patients || [],
          assessments: data.assessments || [],
          vitals: data.vitals || [],
          goals: data.goals || [],
          education: data.education || [],
          config: data.config || defaultConfig
        });
      },
      
      // Storage stats
      getStorageStats: () => {
        let used = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('clinical-toolkit-')) {
            const value = localStorage.getItem(key);
            if (value) used += new Blob([value]).size;
          }
        }
        const total = 5 * 1024 * 1024;
        return { used, total, percentage: (used / total) * 100 };
      }
    }),
    {
      name: 'clinical-toolkit-storage',
      storage: createEncryptedStorageAdapter({
        encryptionEnabled: true,
        storageKey: 'clinical-toolkit-encrypted',
        version: 1
      }),
      partialize: (state) => ({
        patients: state.patients,
        assessments: state.assessments,
        vitals: state.vitals,
        goals: state.goals,
        education: state.education,
        config: state.config,
        welcomed: state.welcomed,
        tourCompleted: state.tourCompleted
      })
    }
  )
);
