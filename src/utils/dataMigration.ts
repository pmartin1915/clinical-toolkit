/**
 * Data Migration Utility
 * Migrates from old StorageManager (Base64) to new encrypted Zustand store
 */

import { useClinicalStore } from '../store/clinicalStore';
import type {
  PatientProfile,
  AssessmentResult,
  VitalSigns,
  GoalTracking,
  EducationProgress,
  StorageConfig
} from '../types/storage';

function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

function decodeBase64Data<T>(data: string): T | null {
  try {
    if (isBase64(data)) {
      const decoded = atob(data);
      return JSON.parse(decoded) as T;
    }
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Failed to decode data:', error);
    return null;
  }
}

export function migrateFromStorageManager(): {
  success: boolean;
  migratedCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    console.info('🔄 Starting migration from StorageManager...');

    // Check if already migrated
    if (localStorage.getItem('clinical-toolkit-migrated')) {
      console.info('✅ Data already migrated');
      return { success: true, migratedCount: 0, errors: [] };
    }

    const store = useClinicalStore.getState();

    // Migrate patients
    const patientsData = localStorage.getItem('clinical-toolkit-patients');
    if (patientsData) {
      const patients = decodeBase64Data<PatientProfile[]>(patientsData);
      if (patients && Array.isArray(patients)) {
        patients.forEach(patient => {
          store.savePatient(patient);
          migratedCount++;
        });
        console.info(`✅ Migrated ${patients.length} patients`);
      }
    }

    // Migrate assessments
    const assessmentsData = localStorage.getItem('clinical-toolkit-assessments');
    if (assessmentsData) {
      const assessments = decodeBase64Data<AssessmentResult[]>(assessmentsData);
      if (assessments && Array.isArray(assessments)) {
        assessments.forEach(assessment => {
          store.saveAssessment(assessment);
          migratedCount++;
        });
        console.info(`✅ Migrated ${assessments.length} assessments`);
      }
    }

    // Migrate vitals
    const vitalsData = localStorage.getItem('clinical-toolkit-vitals');
    if (vitalsData) {
      const vitals = decodeBase64Data<VitalSigns[]>(vitalsData);
      if (vitals && Array.isArray(vitals)) {
        vitals.forEach(vital => {
          store.saveVitalSigns(vital);
          migratedCount++;
        });
        console.info(`✅ Migrated ${vitals.length} vitals`);
      }
    }

    // Migrate goals
    const goalsData = localStorage.getItem('clinical-toolkit-goals');
    if (goalsData) {
      const goals = decodeBase64Data<GoalTracking[]>(goalsData);
      if (goals && Array.isArray(goals)) {
        goals.forEach(goal => {
          store.saveGoal(goal);
          migratedCount++;
        });
        console.info(`✅ Migrated ${goals.length} goals`);
      }
    }

    // Migrate education
    const educationData = localStorage.getItem('clinical-toolkit-education');
    if (educationData) {
      const education = decodeBase64Data<EducationProgress[]>(educationData);
      if (education && Array.isArray(education)) {
        education.forEach(progress => {
          store.saveEducationProgress(progress);
          migratedCount++;
        });
        console.info(`✅ Migrated ${education.length} education records`);
      }
    }

    // Migrate config
    const configData = localStorage.getItem('clinical-toolkit-config');
    if (configData) {
      const config = decodeBase64Data<StorageConfig>(configData);
      if (config) {
        store.updateConfig(config);
        console.info('✅ Migrated config');
      }
    }

    // Clean up old keys
    const oldKeys = [
      'clinical-toolkit-patients',
      'clinical-toolkit-assessments',
      'clinical-toolkit-vitals',
      'clinical-toolkit-goals',
      'clinical-toolkit-education',
      'clinical-toolkit-config',
      'clinical-toolkit-backups',
      'clinical-toolkit-last-backup'
    ];

    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });

    // Mark as migrated
    localStorage.setItem('clinical-toolkit-migrated', 'true');
    localStorage.setItem('clinical-toolkit-migration-date', new Date().toISOString());

    console.info(`✅ Migration complete! Migrated ${migratedCount} items`);
    return { success: true, migratedCount, errors };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMsg);
    console.error('❌ Migration failed:', error);
    return { success: false, migratedCount, errors };
  }
}

export function checkMigrationStatus(): {
  migrated: boolean;
  migrationDate: string | null;
  hasOldData: boolean;
} {
  const migrated = localStorage.getItem('clinical-toolkit-migrated') === 'true';
  const migrationDate = localStorage.getItem('clinical-toolkit-migration-date');

  const hasOldData = !!(
    localStorage.getItem('clinical-toolkit-patients') ||
    localStorage.getItem('clinical-toolkit-assessments') ||
    localStorage.getItem('clinical-toolkit-vitals')
  );

  return { migrated, migrationDate, hasOldData };
}

/**
 * Migrate legacy BP readings from localStorage to encrypted Zustand store
 * Legacy format: { id, date, time, systolic, diastolic, pulse?, notes? }
 * Target format: VitalSigns interface with blood_pressure type
 */
export function migrateBPReadingsFromLocalStorage(): {
  success: boolean;
  migratedCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    console.info('🔄 Starting BP readings migration from localStorage...');

    // Check if already migrated
    if (localStorage.getItem('bp-readings-migrated')) {
      console.info('✅ BP readings already migrated');
      return { success: true, migratedCount: 0, errors: [] };
    }

    // Read legacy BP readings
    const legacyData = localStorage.getItem('bp-readings');
    if (!legacyData) {
      console.info('ℹ️ No legacy BP readings found to migrate');
      localStorage.setItem('bp-readings-migrated', 'true');
      return { success: true, migratedCount: 0, errors: [] };
    }

    // Parse legacy data
    let legacyReadings: any[];
    try {
      legacyReadings = JSON.parse(legacyData);
      if (!Array.isArray(legacyReadings)) {
        throw new Error('Legacy BP data is not an array');
      }
    } catch (parseError) {
      const errorMsg = `Failed to parse legacy BP data: ${parseError}`;
      errors.push(errorMsg);
      console.error('❌', errorMsg);
      return { success: false, migratedCount: 0, errors };
    }

    const store = useClinicalStore.getState();

    // Transform and migrate each reading
    for (const reading of legacyReadings) {
      try {
        // Validate required fields
        if (!reading.systolic || !reading.diastolic) {
          errors.push(`Skipping invalid reading (missing BP values): ${reading.id}`);
          continue;
        }

        // Combine date and time into ISO timestamp
        let timestamp: string;
        if (reading.date && reading.time) {
          timestamp = new Date(`${reading.date}T${reading.time}:00`).toISOString();
        } else if (reading.date) {
          timestamp = new Date(reading.date).toISOString();
        } else {
          timestamp = new Date().toISOString();
        }

        // Transform to VitalSigns format
        const vitalSigns: VitalSigns = {
          id: reading.id || store.generateId(),
          patientId: 'default-patient',
          type: 'blood_pressure',
          value: {
            systolic: Number(reading.systolic),
            diastolic: Number(reading.diastolic)
          },
          unit: 'mmHg',
          timestamp,
          notes: reading.notes || undefined,
          location: 'home'
        };

        // Add pulse as separate vital if present
        if (reading.pulse) {
          const pulseVital: VitalSigns = {
            id: reading.id ? `${reading.id}-pulse` : store.generateId(),
            patientId: 'default-patient',
            type: 'heart_rate',
            value: Number(reading.pulse),
            unit: 'bpm',
            timestamp,
            notes: reading.notes ? `From BP reading: ${reading.notes}` : undefined,
            location: 'home'
          };
          store.saveVitalSigns(pulseVital);
        }

        // Save to encrypted store
        store.saveVitalSigns(vitalSigns);
        migratedCount++;

      } catch (readingError) {
        const errorMsg = `Failed to migrate reading ${reading.id}: ${readingError}`;
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }
    }

    // Clean up legacy data
    localStorage.removeItem('bp-readings');

    // Mark as migrated
    localStorage.setItem('bp-readings-migrated', 'true');
    localStorage.setItem('bp-readings-migration-date', new Date().toISOString());

    console.info(`✅ BP migration complete! Migrated ${migratedCount} readings`);
    if (errors.length > 0) {
      console.warn(`⚠️ Migration completed with ${errors.length} errors`);
    }

    return { success: true, migratedCount, errors };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMsg);
    console.error('❌ BP migration failed:', error);
    return { success: false, migratedCount, errors };
  }
}

export function checkBPMigrationStatus(): {
  migrated: boolean;
  migrationDate: string | null;
  hasLegacyData: boolean;
} {
  const migrated = localStorage.getItem('bp-readings-migrated') === 'true';
  const migrationDate = localStorage.getItem('bp-readings-migration-date');
  const hasLegacyData = !!localStorage.getItem('bp-readings');

  return { migrated, migrationDate, hasLegacyData };
}
