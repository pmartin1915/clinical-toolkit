import { useState, useEffect } from 'react';
import { 
  User, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Download, 
  Upload,
  AlertCircle,
  CheckCircle,
  Database,
  History,
  AlertTriangle
} from 'lucide-react';
import { storageManager } from '../utils/storage';
import { syncManager } from '../utils/syncManager';
import { ExportManager } from '../utils/export';
import { EnhancedExportDialog } from './ui/EnhancedExportDialog';
import { PatientCDSIntegration } from './ui/PatientCDSIntegration';
import { QuickVitalsEntry } from './ui/QuickVitalsEntry';
import { CDSHistoryPanel } from './ui/CDSHistoryPanel';
import type { PatientProfile } from '../types/storage';
import { CDSHistoryManager } from '../utils/cdsHistory';
import { format } from 'date-fns';

export const PatientManager = () => {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'profile' | 'export' | 'settings'>('list');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [enhancedExportPatient, setEnhancedExportPatient] = useState<PatientProfile | null>(null);
  const [showCDSHistory, setShowCDSHistory] = useState(false);
  const [cdsHistoryPatientId, setCDSHistoryPatientId] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    const allPatients = storageManager.getAllPatients();
    setPatients(allPatients);
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.medicalRecordNumber && patient.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await storageManager.deletePatient(patientId);
        
        // Add to sync queue for offline sync
        syncManager.addToSyncQueue({
          action: 'delete',
          type: 'patient',
          data: { id: patientId }
        });
        
        loadPatients();
        if (selectedPatient?.id === patientId) {
          setSelectedPatient(null);
        }
        showMessage('success', 'Patient deleted successfully');
      } catch {
        showMessage('error', 'Failed to delete patient');
      }
    }
  };

  const handleExportPatient = async (patient: PatientProfile, format: 'pdf' | 'csv' | 'json') => {
    try {
      setLoading(true);
      const data = storageManager.exportPatientData(patient.id);
      let blob: Blob;
      let filename: string;

      switch (format) {
        case 'pdf':
          blob = await ExportManager.generatePatientReport(data);
          filename = ExportManager.generateFilename(patient, 'pdf');
          break;
        case 'csv': {
          // Create a combined CSV with all data types
          const csvData = {
            assessments: ExportManager.generateAssessmentsCSV(data.assessments),
            vitals: ExportManager.generateVitalsCSV(data.vitals),
            goals: ExportManager.generateGoalsCSV(data.goals)
          };
          // For demo, just export assessments - could create a zip file
          blob = csvData.assessments;
          filename = ExportManager.generateFilename(patient, 'csv', 'assessments');
          break;
        }
        case 'json':
          blob = ExportManager.generateJSONExport(data);
          filename = ExportManager.generateFilename(patient, 'json');
          break;
        default:
          throw new Error('Invalid export format');
      }

      ExportManager.downloadFile(blob, filename);
      showMessage('success', `Patient data exported as ${format.toUpperCase()}`);
    } catch (error) {
      showMessage('error', `Failed to export patient data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async (file: File) => {
    try {
      setLoading(true);
      const text = await file.text();
      const data = JSON.parse(text);
      await storageManager.importData(data);
      loadPatients();
      showMessage('success', 'Data imported successfully');
    } catch (error) {
      showMessage('error', `Failed to import data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const PatientForm = ({ patient, onSave, onCancel }: {
    patient?: PatientProfile;
    onSave: (patient: PatientProfile) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<Partial<PatientProfile>>(
      patient || {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        medicalRecordNumber: '',
        conditions: [],
        allergies: [],
        currentMedications: [],
        preferences: {
          reminderTime: '08:00',
          language: 'en',
          units: 'metric',
          dataSharing: false,
          exportFormat: 'pdf'
        }
      }
    );
    const [showCDSWarning, setShowCDSWarning] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
        showMessage('error', 'Please fill in all required fields');
        return;
      }

      try {
        const patientData: PatientProfile = {
          id: patient?.id || storageManager.generateId(),
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          dateOfBirth: formData.dateOfBirth!,
          medicalRecordNumber: formData.medicalRecordNumber,
          conditions: formData.conditions || [],
          allergies: formData.allergies || [],
          currentMedications: formData.currentMedications || [],
          preferences: formData.preferences!,
          createdAt: patient?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await storageManager.savePatient(patientData);
        
        // Add to sync queue for offline sync
        syncManager.addToSyncQueue({
          action: patient ? 'update' : 'create',
          type: 'patient',
          data: patientData
        });
        
        onSave(patientData);
        loadPatients();
        showMessage('success', patient ? 'Patient updated successfully' : 'Patient created successfully');
      } catch {
        showMessage('error', 'Failed to save patient');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName || ''}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Record Number
            </label>
            <input
              type="text"
              value={formData.medicalRecordNumber || ''}
              onChange={(e) => setFormData({ ...formData, medicalRecordNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conditions (comma-separated)
          </label>
          <input
            type="text"
            value={formData.conditions?.join(', ') || ''}
            onChange={(e) => {
              const value = e.target.value;
              // Split on commas and clean up, but keep empty strings for ongoing typing
              const conditions = value.split(',').map(c => c.trim());
              // Only filter out empty strings if the last character isn't a comma (still typing)
              const filteredConditions = value.endsWith(',') ? conditions : conditions.filter(c => c);
              setFormData({ 
                ...formData, 
                conditions: filteredConditions
              });
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., hypertension, diabetes, depression"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allergies (comma-separated)
          </label>
          <input
            type="text"
            value={formData.allergies?.join(', ') || ''}
            onChange={(e) => {
              const value = e.target.value;
              const allergies = value.split(',').map(a => a.trim());
              const filteredAllergies = value.endsWith(',') ? allergies : allergies.filter(a => a);
              setFormData({ 
                ...formData, 
                allergies: filteredAllergies
              });
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., penicillin, shellfish"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Medications (comma-separated)
          </label>
          <input
            type="text"
            value={formData.currentMedications?.map(med => med.name).join(', ') || ''}
            onChange={(e) => {
              const value = e.target.value;
              const medicationNames = value.split(',').map(m => m.trim());
              const filteredMedicationNames = value.endsWith(',') ? medicationNames : medicationNames.filter(m => m);
              
              const medications = filteredMedicationNames.map((name, index) => ({
                id: `med-${index}`,
                name: name,
                genericName: name, // For now, use the same as name
                dosage: 'As prescribed',
                frequency: 'As directed',
                prescribedDate: new Date().toISOString().split('T')[0],
                active: true
              }));
              setFormData({ 
                ...formData, 
                currentMedications: medications
              });
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., lisinopril, metformin, sertraline"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter medication names separated by commas. CDS alerts will check for interactions and contraindications.
          </p>
        </div>

        {/* CDS Integration */}
        {((formData.currentMedications?.length || 0) > 0 || (formData.allergies?.length || 0) > 0 || (formData.conditions?.length || 0) > 0) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Safety Check
            </label>
            <PatientCDSIntegration
              patientData={formData}
              isRealTime={true}
              onAlertsChange={(alerts) => {
                setShowCDSWarning(alerts.some(alert => alert.priority === 'critical' || alert.priority === 'high'));
              }}
            />
          </div>
        )}

        {/* CDS Warning */}
        {showCDSWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Safety Alert</h4>
                <p className="text-sm text-yellow-700">
                  Critical or high-priority safety alerts have been detected. Please review the recommendations above before saving.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              showCDSWarning 
                ? 'bg-yellow-600 text-white hover:bg-yellow-700 border border-yellow-600' 
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {showCDSWarning ? 'Save Despite Alerts' : (patient ? 'Update Patient' : 'Create Patient')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const StorageStats = () => {
    const stats = storageManager.getStorageStats();
    const backups = storageManager.getBackups();

    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Local Storage</span>
                <span className="text-sm font-medium">{Math.round(stats.percentage)}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(stats.used / 1024)} KB of {Math.round(stats.total / 1024)} KB used
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Backups</h3>
          {backups.length > 0 ? (
            <div className="space-y-2">
              {backups.slice(-5).reverse().map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(new Date(backup.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {backup.patients.length} patients, {backup.assessments.length} assessments
                    </p>
                  </div>
                  <button
                    onClick={() => storageManager.restoreFromBackup(backup)}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No backups available</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Management</h1>
        <p className="text-lg text-gray-600">Manage patient profiles and data</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'list', label: 'Patient List', icon: User },
            { id: 'export', label: 'Export Data', icon: Download },
            { id: 'settings', label: 'Storage Settings', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'list' | 'profile' | 'export' | 'settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <div>
          {!showAddPatient && !selectedPatient && (
            <>
              {/* Search and Add */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search patients..."
                  />
                </div>
                <button
                  onClick={() => setShowAddPatient(true)}
                  className="ml-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </button>
              </div>

              {/* Patient List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Born: {format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}
                        </p>
                        {patient.medicalRecordNumber && (
                          <p className="text-sm text-gray-600">
                            MRN: {patient.medicalRecordNumber}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="p-2 text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {patient.conditions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700">Conditions:</p>
                          <p className="text-sm text-gray-600">{patient.conditions.join(', ')}</p>
                        </div>
                      )}
                      {patient.allergies.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700">Allergies:</p>
                          <p className="text-sm text-red-600">{patient.allergies.join(', ')}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEnhancedExportPatient(patient)}
                        className="flex-1 bg-primary-100 text-primary-800 py-2 px-3 rounded-md text-sm font-medium hover:bg-primary-200 transition-colors flex items-center justify-center space-x-1"
                        disabled={loading}
                      >
                        <Download className="w-4 h-4" />
                        <span>Enhanced Export</span>
                      </button>
                      <button
                        onClick={() => handleExportPatient(patient, 'pdf')}
                        className="bg-gray-100 text-gray-700 py-2 px-2 rounded text-xs hover:bg-gray-200 transition-colors"
                        disabled={loading}
                        title="Quick PDF"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Add your first patient to get started.'}
                  </p>
                </div>
              )}
            </>
          )}

          {showAddPatient && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Patient</h2>
              <PatientForm
                onSave={() => setShowAddPatient(false)}
                onCancel={() => setShowAddPatient(false)}
              />
            </div>
          )}

          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient CDS Overview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedPatient.firstName} {selectedPatient.lastName} - Safety Overview
                  </h2>
                  <button
                    onClick={() => {
                      setCDSHistoryPatientId(selectedPatient.id);
                      setShowCDSHistory(true);
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    <History className="w-4 h-4" />
                    <span>Alert History</span>
                  </button>
                </div>
                <PatientCDSIntegration
                  patientData={selectedPatient}
                  isRealTime={false}
                  onAlertsChange={(alerts) => {
                    // Save alerts to history when they're triggered
                    alerts.forEach(alert => {
                      CDSHistoryManager.saveAlertToHistory(selectedPatient.id, alert);
                    });
                  }}
                />
              </div>

              {/* Quick Vitals Entry */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Vitals Entry</h3>
                <QuickVitalsEntry
                  patientId={selectedPatient.id}
                  onVitalsAdded={(vitals) => {
                    // In a real app, save these to storage
                    console.log('New vitals:', vitals);
                    showMessage('success', `Added ${vitals.length} vital sign(s)`);
                    // Trigger CDS re-evaluation would happen here
                  }}
                />
              </div>

              {/* Edit Patient Form */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Patient Information</h2>
                <PatientForm
                  patient={selectedPatient}
                  onSave={() => setSelectedPatient(null)}
                  onCancel={() => setSelectedPatient(null)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export All Data</h3>
            <div className="space-y-4">
              <button
                onClick={async () => {
                  const backup = await storageManager.createBackup();
                  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                  ExportManager.downloadFile(blob, `clinical-toolkit-backup-${format(new Date(), 'yyyy-MM-dd')}.json`);
                  showMessage('success', 'Backup created and downloaded');
                }}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Complete Backup</span>
              </button>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Import Data</h4>
                  <p className="text-gray-600 mb-4">
                    Upload a backup file to restore data
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportData(file);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && <StorageStats />}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="text-gray-900">Processing...</span>
          </div>
        </div>
      )}

      {/* Enhanced Export Dialog */}
      {enhancedExportPatient && (
        <EnhancedExportDialog
          isOpen={true}
          onClose={() => setEnhancedExportPatient(null)}
          patient={enhancedExportPatient}
        />
      )}

      {/* CDS History Panel */}
      {showCDSHistory && cdsHistoryPatientId && (
        <CDSHistoryPanel
          patientId={cdsHistoryPatientId}
          isOpen={showCDSHistory}
          onClose={() => {
            setShowCDSHistory(false);
            setCDSHistoryPatientId(null);
          }}
        />
      )}
    </div>
  );
};