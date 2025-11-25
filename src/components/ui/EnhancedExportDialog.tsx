import { useState } from 'react';
import { 
  X, 
  Download, 
  Mail, 
  FileText, 
 
  User, 
  Calendar,
  Activity,
  Target,
  Heart,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { EnhancedExportManager } from '../../utils/enhancedExport';
import { storageManager } from '../../utils/storage';
import type { PatientProfile } from '../../types/storage';

interface EnhancedExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
}

interface ExportOptions {
  template: 'standard' | 'summary' | 'detailed' | 'provider';
  includeCharts: boolean;
  includeTimeline: boolean;
  includeMedications: boolean;
  includeAssessments: boolean;
  includeVitals: boolean;
  includeGoals: boolean;
  format: 'pdf' | 'csv' | 'json';
  emailOptions?: {
    to: string;
    subject: string;
    body: string;
  };
}

export const EnhancedExportDialog = ({ isOpen, onClose, patient }: EnhancedExportDialogProps) => {
  const [options, setOptions] = useState<ExportOptions>({
    template: 'detailed',
    includeCharts: true,
    includeTimeline: true,
    includeMedications: true,
    includeAssessments: true,
    includeVitals: true,
    includeGoals: true,
    format: 'pdf'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [exportStatus, setExportStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  if (!isOpen) return null;

  const templates = [
    {
      id: 'summary' as const,
      name: 'Summary Report',
      description: 'Key information and recent activity',
      icon: FileText,
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      id: 'detailed' as const,
      name: 'Detailed Report',
      description: 'Comprehensive health record with charts',
      icon: Activity,
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      id: 'provider' as const,
      name: 'Provider Report',
      description: 'Clinical summary for healthcare professionals',
      icon: User,
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    {
      id: 'standard' as const,
      name: 'Standard Report',
      description: 'Basic patient information and history',
      icon: Calendar,
      color: 'bg-gray-100 text-gray-700 border-gray-200'
    }
  ];

  const contentSections = [
    { key: 'includeMedications', label: 'Current Medications', icon: Heart },
    { key: 'includeAssessments', label: 'Assessment History', icon: CheckCircle },
    { key: 'includeVitals', label: 'Vital Signs', icon: Activity },
    { key: 'includeGoals', label: 'Health Goals', icon: Target },
    { key: 'includeCharts', label: 'Charts & Graphs', icon: Activity },
    { key: 'includeTimeline', label: 'Health Timeline', icon: Clock }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      // Get patient data
      const exportData = storageManager.exportPatientData(patient.id);
      
      if (options.format === 'pdf') {
        // Generate enhanced PDF
        const pdfBlob = await EnhancedExportManager.generateEnhancedPatientReport(exportData, {
          template: options.template,
          includeCharts: options.includeCharts,
          includeTimeline: options.includeTimeline,
          includeMedications: options.includeMedications,
          includeAssessments: options.includeAssessments,
          includeVitals: options.includeVitals,
          includeGoals: options.includeGoals
        });

        const filename = EnhancedExportManager.generateFilename(patient, 'pdf', options.template);

        if (showEmailForm && options.emailOptions) {
          // Send by email
          const success = await EnhancedExportManager.sendReportByEmail(
            pdfBlob,
            filename,
            {
              to: options.emailOptions.to,
              subject: options.emailOptions.subject || `Health Report for ${patient.firstName} ${patient.lastName}`,
              body: options.emailOptions.body || 'Please find the attached health report.'
            }
          );

          if (success) {
            setExportStatus({ type: 'success', message: 'Email prepared successfully!' });
          } else {
            setExportStatus({ type: 'error', message: 'Failed to prepare email.' });
          }
        } else {
          // Direct download
          EnhancedExportManager.downloadFile(pdfBlob, filename);
          setExportStatus({ type: 'success', message: 'Report downloaded successfully!' });
        }
      } else {
        // Handle CSV/JSON exports
        setExportStatus({ type: 'error', message: 'CSV/JSON export not yet implemented in enhanced version.' });
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus({ type: 'error', message: 'Export failed. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  const updateOptions = (key: keyof ExportOptions, value: ExportOptions[keyof ExportOptions]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Enhanced Export</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Export health report for {patient.firstName} {patient.lastName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 min-h-touch-md min-w-touch-md flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close export dialog"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status Message */}
          {exportStatus && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              exportStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {exportStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{exportStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Template Selection */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Report Template</h3>
                <div className="space-y-3">
                  {templates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <label
                        key={template.id}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          options.template === template.id
                            ? `${template.color} border-current`
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="template"
                          value={template.id}
                          checked={options.template === template.id}
                          onChange={(e) => updateOptions('template', e.target.value as ExportOptions['template'])}
                          className="sr-only"
                        />
                        <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm opacity-75">{template.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Export Format</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['pdf', 'csv', 'json'].map((format) => (
                    <label
                      key={format}
                      className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        options.format === format
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format}
                        checked={options.format === format}
                        onChange={(e) => updateOptions('format', e.target.value as 'pdf' | 'csv' | 'json')}
                        className="sr-only"
                      />
                      <span className="font-medium">{format.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Content Options */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Include Content</h3>
                <div className="space-y-3">
                  {contentSections.map(({ key, label, icon: Icon }) => (
                    <label
                      key={key}
                      className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={options[key as keyof ExportOptions] as boolean}
                        onChange={(e) => updateOptions(key as keyof ExportOptions, e.target.checked)}
                        className="mr-3 text-primary-600 focus:ring-primary-500"
                      />
                      <Icon className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email Options */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delivery Options</h3>
                  <button
                    onClick={() => setShowEmailForm(!showEmailForm)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm transition-colors min-h-touch-md ${
                      showEmailForm
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Report</span>
                  </button>
                </div>

                {showEmailForm && (
                  <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={options.emailOptions?.to || ''}
                        onChange={(e) => updateOptions('emailOptions', {
                          to: e.target.value,
                          subject: options.emailOptions?.subject || `Health Report for ${patient.firstName} ${patient.lastName}`,
                          body: options.emailOptions?.body || 'Please find the attached health report.'
                        })}
                        placeholder="doctor@example.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={options.emailOptions?.subject || `Health Report for ${patient.firstName} ${patient.lastName}`}
                        onChange={(e) => updateOptions('emailOptions', {
                          to: options.emailOptions?.to || '',
                          subject: e.target.value,
                          body: options.emailOptions?.body || 'Please find the attached health report.'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message
                      </label>
                      <textarea
                        value={options.emailOptions?.body || 'Please find the attached health report.'}
                        onChange={(e) => updateOptions('emailOptions', {
                          to: options.emailOptions?.to || '',
                          subject: options.emailOptions?.subject || `Health Report for ${patient.firstName} ${patient.lastName}`,
                          body: e.target.value
                        })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleExport}
              disabled={isExporting || (showEmailForm && !options.emailOptions?.to)}
              className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : showEmailForm ? (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Prepare Email</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download Report</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="sm:w-auto px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};