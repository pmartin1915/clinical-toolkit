// Local storage utilities with encryption and data management
import type { 
  PatientProfile, 
  AssessmentResult, 
  VitalSigns, 
  GoalTracking, 
  EducationProgress,
  ExportData,
  BackupData,
  StorageConfig
} from '../types/storage';

class StorageManager {
  private static instance: StorageManager;
  private config: StorageConfig;
  private encryptionKey: string | null = null;

  private constructor() {
    this.config = this.getStorageConfig();
    this.initializeStorage();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // Initialize storage and check for existing data
  private initializeStorage(): void {
    if (!localStorage.getItem('clinical-toolkit-initialized')) {
      this.createInitialStructure();
      localStorage.setItem('clinical-toolkit-initialized', 'true');
      localStorage.setItem('clinical-toolkit-version', '1.0.0');
    }
    
    // Check for version updates and migrate if needed
    this.checkForMigration();
  }

  private createInitialStructure(): void {
    const initialData = {
      patients: [],
      assessments: [],
      vitals: [],
      goals: [],
      education: [],
      config: this.config
    };

    Object.keys(initialData).forEach(key => {
      if (!localStorage.getItem(`clinical-toolkit-${key}`)) {
        this.setItem(`clinical-toolkit-${key}`, initialData[key as keyof typeof initialData]);
      }
    });
  }

  private checkForMigration(): void {
    const currentVersion = localStorage.getItem('clinical-toolkit-version');
    const latestVersion = '1.0.0';
    
    if (currentVersion !== latestVersion) {
      this.migrateData(currentVersion || '0.0.0', latestVersion);
      localStorage.setItem('clinical-toolkit-version', latestVersion);
    }
  }

  private migrateData(from: string, to: string): void {
    console.log(`Migrating data from version ${from} to ${to}`);
    // Future migration logic will go here
  }

  // Encryption utilities (basic implementation)
  private encrypt(data: string): string {
    if (!this.config.encryptionEnabled || !this.encryptionKey) {
      return data;
    }
    
    // Simple Base64 encoding for demo - in production, use proper encryption
    return btoa(data);
  }

  private decrypt(data: string): string {
    if (!this.config?.encryptionEnabled || !this.encryptionKey) {
      return data;
    }
    
    try {
      return atob(data);
    } catch {
      return data; // Return original if decryption fails
    }
  }

  // Generic storage operations
  private setItem(key: string, value: unknown): void {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = this.encrypt(serialized);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Failed to save data');
    }
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const decrypted = this.decrypt(item);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  // Patient Profile Management
  public async savePatient(patient: PatientProfile): Promise<void> {
    const patients = this.getItem<PatientProfile[]>('clinical-toolkit-patients') || [];
    const existingIndex = patients.findIndex(p => p.id === patient.id);
    
    patient.updatedAt = new Date().toISOString();
    
    if (existingIndex >= 0) {
      patients[existingIndex] = patient;
    } else {
      patient.createdAt = new Date().toISOString();
      patients.push(patient);
    }
    
    this.setItem('clinical-toolkit-patients', patients);
    await this.autoBackup();
  }

  public getPatient(patientId: string): PatientProfile | null {
    const patients = this.getItem<PatientProfile[]>('clinical-toolkit-patients') || [];
    return patients.find(p => p.id === patientId) || null;
  }

  public getAllPatients(): PatientProfile[] {
    return this.getItem<PatientProfile[]>('clinical-toolkit-patients') || [];
  }

  public async deletePatient(patientId: string): Promise<void> {
    const patients = this.getItem<PatientProfile[]>('clinical-toolkit-patients') || [];
    const filtered = patients.filter(p => p.id !== patientId);
    this.setItem('clinical-toolkit-patients', filtered);
    
    // Also delete related data
    await this.deletePatientData(patientId);
    await this.autoBackup();
  }

  private async deletePatientData(patientId: string): Promise<void> {
    // Delete assessments
    const assessments = this.getItem<AssessmentResult[]>('clinical-toolkit-assessments') || [];
    const filteredAssessments = assessments.filter(a => a.patientId !== patientId);
    this.setItem('clinical-toolkit-assessments', filteredAssessments);

    // Delete vitals
    const vitals = this.getItem<VitalSigns[]>('clinical-toolkit-vitals') || [];
    const filteredVitals = vitals.filter(v => v.patientId !== patientId);
    this.setItem('clinical-toolkit-vitals', filteredVitals);

    // Delete goals
    const goals = this.getItem<GoalTracking[]>('clinical-toolkit-goals') || [];
    const filteredGoals = goals.filter(g => g.patientId !== patientId);
    this.setItem('clinical-toolkit-goals', filteredGoals);

    // Delete education progress
    const education = this.getItem<EducationProgress[]>('clinical-toolkit-education') || [];
    const filteredEducation = education.filter(e => e.patientId !== patientId);
    this.setItem('clinical-toolkit-education', filteredEducation);
  }

  // Assessment Results
  public async saveAssessment(assessment: AssessmentResult): Promise<void> {
    const assessments = this.getItem<AssessmentResult[]>('clinical-toolkit-assessments') || [];
    const existingIndex = assessments.findIndex(a => a.id === assessment.id);
    
    if (existingIndex >= 0) {
      assessments[existingIndex] = assessment;
    } else {
      assessments.push(assessment);
    }
    
    this.setItem('clinical-toolkit-assessments', assessments);
    await this.autoBackup();
  }

  public getPatientAssessments(patientId: string): AssessmentResult[] {
    const assessments = this.getItem<AssessmentResult[]>('clinical-toolkit-assessments') || [];
    return assessments.filter(a => a.patientId === patientId);
  }

  // Vital Signs
  public async saveVitalSigns(vital: VitalSigns): Promise<void> {
    const vitals = this.getItem<VitalSigns[]>('clinical-toolkit-vitals') || [];
    const existingIndex = vitals.findIndex(v => v.id === vital.id);
    
    if (existingIndex >= 0) {
      vitals[existingIndex] = vital;
    } else {
      vitals.push(vital);
    }
    
    this.setItem('clinical-toolkit-vitals', vitals);
    await this.autoBackup();
  }

  public getPatientVitals(patientId: string, type?: string): VitalSigns[] {
    const vitals = this.getItem<VitalSigns[]>('clinical-toolkit-vitals') || [];
    return vitals.filter(v => v.patientId === patientId && (!type || v.type === type));
  }

  // Goal Tracking
  public async saveGoal(goal: GoalTracking): Promise<void> {
    const goals = this.getItem<GoalTracking[]>('clinical-toolkit-goals') || [];
    const existingIndex = goals.findIndex(g => g.id === goal.id);
    
    if (existingIndex >= 0) {
      goals[existingIndex] = goal;
    } else {
      goals.push(goal);
    }
    
    this.setItem('clinical-toolkit-goals', goals);
    await this.autoBackup();
  }

  public getPatientGoals(patientId: string): GoalTracking[] {
    const goals = this.getItem<GoalTracking[]>('clinical-toolkit-goals') || [];
    return goals.filter(g => g.patientId === patientId);
  }

  // Education Progress
  public async saveEducationProgress(progress: EducationProgress): Promise<void> {
    const education = this.getItem<EducationProgress[]>('clinical-toolkit-education') || [];
    const existingIndex = education.findIndex(e => e.id === progress.id);
    
    if (existingIndex >= 0) {
      education[existingIndex] = progress;
    } else {
      education.push(progress);
    }
    
    this.setItem('clinical-toolkit-education', education);
    await this.autoBackup();
  }

  public getPatientEducationProgress(patientId: string): EducationProgress[] {
    const education = this.getItem<EducationProgress[]>('clinical-toolkit-education') || [];
    return education.filter(e => e.patientId === patientId);
  }

  // Data Export
  public exportPatientData(patientId: string): ExportData {
    const patient = this.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    return {
      patientProfile: patient,
      assessments: this.getPatientAssessments(patientId),
      vitals: this.getPatientVitals(patientId),
      goals: this.getPatientGoals(patientId),
      education: this.getPatientEducationProgress(patientId),
      exportedAt: new Date().toISOString()
    };
  }

  public exportAllData(): BackupData {
    const now = new Date().toISOString();
    const data = {
      version: '1.0.0',
      patients: this.getAllPatients(),
      assessments: this.getItem<AssessmentResult[]>('clinical-toolkit-assessments') || [],
      vitals: this.getItem<VitalSigns[]>('clinical-toolkit-vitals') || [],
      goals: this.getItem<GoalTracking[]>('clinical-toolkit-goals') || [],
      education: this.getItem<EducationProgress[]>('clinical-toolkit-education') || [],
      createdAt: now,
      checksum: this.generateChecksum(now)
    };

    return data;
  }

  private generateChecksum(data: string): string {
    // Simple checksum - in production, use a proper hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Data Import
  public async importData(data: BackupData): Promise<void> {
    try {
      // Validate data structure
      if (!this.validateBackupData(data)) {
        throw new Error('Invalid backup data format');
      }

      // Create backup of current data
      await this.createBackup();

      // Import data
      this.setItem('clinical-toolkit-patients', data.patients);
      this.setItem('clinical-toolkit-assessments', data.assessments);
      this.setItem('clinical-toolkit-vitals', data.vitals);
      this.setItem('clinical-toolkit-goals', data.goals);
      this.setItem('clinical-toolkit-education', data.education);

      console.log('Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  private validateBackupData(data: BackupData): boolean {
    return Boolean(
      data.version &&
      Array.isArray(data.patients) &&
      Array.isArray(data.assessments) &&
      Array.isArray(data.vitals) &&
      Array.isArray(data.goals) &&
      Array.isArray(data.education) &&
      data.createdAt &&
      data.checksum
    );
  }

  // Backup and Recovery
  public async createBackup(): Promise<BackupData> {
    const backupData = this.exportAllData();
    
    // Store backup in localStorage
    const backups = this.getItem<BackupData[]>('clinical-toolkit-backups') || [];
    backups.push(backupData);
    
    // Keep only last 5 backups
    if (backups.length > 5) {
      backups.splice(0, backups.length - 5);
    }
    
    this.setItem('clinical-toolkit-backups', backups);
    return backupData;
  }

  public getBackups(): BackupData[] {
    return this.getItem<BackupData[]>('clinical-toolkit-backups') || [];
  }

  public async restoreFromBackup(backup: BackupData): Promise<void> {
    await this.importData(backup);
  }

  private async autoBackup(): Promise<void> {
    if (!this.config.autoBackup) return;
    
    const lastBackup = this.getItem<string>('clinical-toolkit-last-backup');
    const now = new Date();
    const shouldBackup = this.shouldCreateBackup(lastBackup, now);
    
    if (shouldBackup) {
      await this.createBackup();
      this.setItem('clinical-toolkit-last-backup', now.toISOString());
    }
  }

  private shouldCreateBackup(lastBackup: string | null, now: Date): boolean {
    if (!lastBackup) return true;
    
    const lastBackupDate = new Date(lastBackup);
    const diffDays = Math.floor((now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (this.config.backupFrequency) {
      case 'daily': return diffDays >= 1;
      case 'weekly': return diffDays >= 7;
      case 'monthly': return diffDays >= 30;
      default: return false;
    }
  }

  // Storage Management
  public getStorageStats(): { used: number; total: number; percentage: number } {
    let used = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('clinical-toolkit-')) {
        const value = localStorage.getItem(key);
        if (value) {
          used += new Blob([value]).size;
        }
      }
    }
    
    const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  }

  public clearAllData(): void {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('clinical-toolkit-')) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
    this.createInitialStructure();
  }

  // Configuration
  private getStorageConfig(): StorageConfig {
    // During initial construction, read config directly from localStorage to avoid circular dependency
    try {
      const item = localStorage.getItem('clinical-toolkit-config');
      if (item) {
        // Try to parse directly first (for unencrypted configs)
        try {
          return JSON.parse(item) as StorageConfig;
        } catch {
          // If that fails, try Base64 decoding (for encrypted configs)
          try {
            const decoded = atob(item);
            return JSON.parse(decoded) as StorageConfig;
          } catch {
            // If all fails, return default config
          }
        }
      }
    } catch (error) {
      console.warn('Error reading storage config, using defaults:', error);
    }
    
    // Return default configuration
    return {
      encryptionEnabled: false,
      autoBackup: true,
      backupFrequency: 'weekly',
      retentionPeriod: 365,
      maxFileSize: 10
    };
  }

  public updateStorageConfig(config: Partial<StorageConfig>): void {
    const currentConfig = this.getStorageConfig();
    const updatedConfig = { ...currentConfig, ...config };
    this.setItem('clinical-toolkit-config', updatedConfig);
    this.config = updatedConfig;
  }

  // Utility methods
  public generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // First-time visit tracking
  public isFirstVisit(): boolean {
    return !localStorage.getItem('clinical-toolkit-welcomed');
  }

  public markWelcomed(): void {
    localStorage.setItem('clinical-toolkit-welcomed', 'true');
    localStorage.setItem('clinical-toolkit-welcomed-date', new Date().toISOString());
  }

  // Guided tour tracking
  public hasCompletedTour(): boolean {
    return localStorage.getItem('clinical-toolkit-tour-completed') === 'true';
  }

  public markTourCompleted(): void {
    localStorage.setItem('clinical-toolkit-tour-completed', 'true');
    localStorage.setItem('clinical-toolkit-tour-completed-date', new Date().toISOString());
  }

  public shouldShowTour(): boolean {
    // Show tour if user has been welcomed but hasn't completed the tour
    return !this.isFirstVisit() && !this.hasCompletedTour();
  }
}

export const storageManager = StorageManager.getInstance();