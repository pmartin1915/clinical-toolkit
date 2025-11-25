// Data persistence types and interfaces
export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  medicalRecordNumber?: string;
  conditions: string[]; // condition IDs
  allergies: string[];
  currentMedications: Medication[];
  emergencyContact?: EmergencyContact;
  preferences: PatientPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  prescribedBy?: string;
  active: boolean;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface PatientPreferences {
  reminderTime: string;
  language: 'en' | 'es' | 'fr';
  units: 'metric' | 'imperial';
  dataSharing: boolean;
  exportFormat: 'pdf' | 'csv' | 'json';
}

// Assessment and tracking data
export interface AssessmentResult {
  id: string;
  patientId: string;
  conditionId: string;
  toolId: string;
  toolName: string;
  responses: Record<string, string | number | boolean | string[] | number[]>;
  score?: number;
  severity?: string;
  recommendations: string[];
  timestamp: string;
  providerId?: string;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  type: 'blood_pressure' | 'blood_glucose' | 'weight' | 'temperature' | 'heart_rate';
  value: number | { systolic: number; diastolic: number };
  unit: string;
  timestamp: string;
  notes?: string;
  location?: string; // home, clinic, hospital
}

export interface GoalTracking {
  id: string;
  patientId: string;
  goalId: string;
  goalTitle: string;
  category: 'medication' | 'exercise' | 'diet' | 'monitoring' | 'lifestyle';
  target: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  completions: GoalCompletion[];
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
}

export interface GoalCompletion {
  id: string;
  date: string;
  completed: boolean;
  value?: number | string;
  notes?: string;
}

export interface EducationProgress {
  id: string;
  patientId: string;
  conditionId: string;
  moduleId: string;
  moduleTitle: string;
  completedAt?: string;
  progress: number; // 0-100
  quizAnswers?: Record<string, string | number | boolean | string[]>;
  timeSpent: number; // minutes
}

// Export and reporting
export interface ExportData {
  patientProfile: PatientProfile;
  assessments: AssessmentResult[];
  vitals: VitalSigns[];
  goals: GoalTracking[];
  education: EducationProgress[];
  exportedAt: string;
  exportedBy?: string;
}

export interface ReportOptions {
  patientId: string;
  dateRange: {
    start: string;
    end: string;
  };
  includeAssessments: boolean;
  includeVitals: boolean;
  includeGoals: boolean;
  includeEducation: boolean;
  format: 'pdf' | 'csv' | 'json';
}

// Storage configuration
export interface StorageConfig {
  encryptionEnabled: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  retentionPeriod: number; // days
  maxFileSize: number; // MB
}

// Cloud sync (for future implementation)
export interface SyncStatus {
  lastSync: string;
  status: 'success' | 'error' | 'pending' | 'never';
  conflicts: SyncConflict[];
}

export interface SyncConflict {
  id: string;
  type: 'patient' | 'assessment' | 'vital' | 'goal';
  localData: PatientProfile | AssessmentResult | VitalSigns | GoalTracking;
  remoteData: PatientProfile | AssessmentResult | VitalSigns | GoalTracking;
  timestamp: string;
}

// Database operations
export interface DatabaseOperation {
  type: 'create' | 'read' | 'update' | 'delete';
  table: string;
  data?: PatientProfile | AssessmentResult | VitalSigns | GoalTracking | EducationProgress;
  query?: Record<string, string | number | boolean | string[]>;
  timestamp: string;
}

export interface BackupData {
  version: string;
  patients: PatientProfile[];
  assessments: AssessmentResult[];
  vitals: VitalSigns[];
  goals: GoalTracking[];
  education: EducationProgress[];
  createdAt: string;
  checksum: string;
}