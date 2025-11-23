import { useState } from 'react';
import { Shield, Play, RotateCcw, User, AlertTriangle, Activity } from 'lucide-react';
import { CDSEngine, type PatientContext, type CDSAlert } from '../../utils/cdsEngine';
import { CDSAlertsPanel } from './CDSAlertsPanel';

interface CDSDemoProps {
  isVisible: boolean;
  onClose?: () => void;
}

const samplePatients: Array<{ name: string; context: PatientContext; description: string }> = [
  {
    name: "Sarah Johnson (High-Risk Pregnancy)",
    description: "28-year-old female on ACE inhibitor - pregnancy contraindication",
    context: {
      age: 28,
      gender: 'female',
      medications: ['lisinopril', 'prenatal vitamins'],
      diagnoses: ['hypertension'],
      vitals: {
        systolicBP: 145,
        diastolicBP: 92,
        heartRate: 72
      }
    }
  },
  {
    name: "Robert Chen (Drug Interaction)",
    description: "65-year-old male on warfarin and NSAID - bleeding risk",
    context: {
      age: 65,
      gender: 'male',
      medications: ['warfarin', 'ibuprofen', 'metoprolol'],
      allergies: ['penicillin'],
      diagnoses: ['atrial fibrillation', 'arthritis'],
      vitals: {
        systolicBP: 130,
        diastolicBP: 80,
        heartRate: 65
      }
    }
  },
  {
    name: "Maria Rodriguez (Hypertensive Crisis)",
    description: "52-year-old female with severe hypertension requiring immediate attention",
    context: {
      age: 52,
      gender: 'female',
      medications: ['amlodipine', 'hydrochlorothiazide'],
      diagnoses: ['hypertension', 'diabetes'],
      vitals: {
        systolicBP: 185,
        diastolicBP: 125,
        heartRate: 88
      },
      labValues: {
        a1c: { value: 8.2, unit: '%', date: '2024-01-15' }
      }
    }
  },
  {
    name: "James Thompson (Mental Health Crisis)",
    description: "35-year-old male with severe depression and suicide risk",
    context: {
      age: 35,
      gender: 'male',
      medications: ['sertraline'],
      diagnoses: ['major depressive disorder'],
      assessmentScores: {
        phq9: { score: 22, date: '2024-01-20' },
        'phq9-question9': { score: 2, date: '2024-01-20' },
        gad7: { score: 16, date: '2024-01-20' }
      }
    }
  },
  {
    name: "Dorothy Williams (Kidney Function)",
    description: "78-year-old female on metformin with kidney concerns",
    context: {
      age: 78,
      gender: 'female',
      medications: ['metformin', 'lisinopril', 'atorvastatin'],
      diagnoses: ['diabetes', 'hypertension', 'ckd'],
      vitals: {
        systolicBP: 140,
        diastolicBP: 85
      },
      labValues: {
        creatinine: { value: 1.8, unit: 'mg/dL', date: '2024-01-18' },
        a1c: { value: 7.5, unit: '%', date: '2024-01-15' }
      }
    }
  }
];

export const CDSDemo = ({ isVisible, onClose }: CDSDemoProps) => {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<CDSAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  if (!isVisible) return null;

  const handleEvaluatePatient = async (patientIndex: number) => {
    setIsEvaluating(true);
    setSelectedPatient(patientIndex);
    
    // Simulate processing delay for demo effect
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const patient = samplePatients[patientIndex];
    const triggeredAlerts = CDSEngine.evaluatePatient(patient.context);
    
    setAlerts(triggeredAlerts);
    setIsEvaluating(false);
    setShowAlerts(true);
  };

  const handleReset = () => {
    setSelectedPatient(null);
    setAlerts([]);
    setShowAlerts(false);
    CDSEngine.clearAlerts();
  };

  const getCriticalAlertCount = () => {
    return alerts.filter(alert => alert.priority === 'critical').length;
  };

  const getHighAlertCount = () => {
    return alerts.filter(alert => alert.priority === 'high').length;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Clinical Decision Support Demo
                </h2>
                <p className="text-sm text-gray-600">
                  See how our CDS engine identifies potential issues and provides evidence-based recommendations
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors min-h-touch-md"
                title="Reset demo"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close demo"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {/* Instructions */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
                  <p className="text-sm text-blue-800 mb-2">
                    Select a sample patient below to see how our Clinical Decision Support engine automatically 
                    identifies potential safety issues, drug interactions, and provides evidence-based recommendations.
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Drug Interactions:</strong> Identifies dangerous medication combinations</li>
                    <li>• <strong>Contraindications:</strong> Flags medications that shouldn't be used in certain conditions</li>
                    <li>• <strong>Vital Signs Alerts:</strong> Monitors for critical values requiring immediate attention</li>
                    <li>• <strong>Assessment Scores:</strong> Evaluates mental health and suicide risk assessments</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sample Patients */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {samplePatients.map((patient, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition-all touch-manipulation ${
                    selectedPatient === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md active:bg-gray-50'
                  }`}
                  onClick={() => !isEvaluating && handleEvaluatePatient(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <User className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {patient.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {patient.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            Age: {patient.context.age}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            Gender: {patient.context.gender}
                          </span>
                          {patient.context.medications && (
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {patient.context.medications.length} medications
                            </span>
                          )}
                        </div>

                        {patient.context.medications && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Medications:</p>
                            <p className="text-xs text-gray-600">
                              {patient.context.medications.join(', ')}
                            </p>
                          </div>
                        )}

                        {patient.context.vitals && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Vitals:</p>
                            <p className="text-xs text-gray-600">
                              BP: {patient.context.vitals.systolicBP}/{patient.context.vitals.diastolicBP} mmHg
                              {patient.context.vitals.heartRate && `, HR: ${patient.context.vitals.heartRate} bpm`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 ml-3">
                      {selectedPatient === index && isEvaluating ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-blue-600">Evaluating...</span>
                        </div>
                      ) : (
                        <button className="flex items-center space-x-2 px-4 py-2 sm:px-3 sm:py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation">
                          <Play className="w-4 h-4" />
                          <span>Evaluate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Summary */}
            {selectedPatient !== null && alerts.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Evaluation Results: {samplePatients[selectedPatient].name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {alerts.length} alert{alerts.length !== 1 ? 's' : ''} identified
                      {getCriticalAlertCount() > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {getCriticalAlertCount()} Critical
                        </span>
                      )}
                      {getHighAlertCount() > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                          {getHighAlertCount()} High Priority
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAlerts(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-touch-md"
                  >
                    View Detailed Alerts
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CDS Alerts Panel */}
      {showAlerts && (
        <CDSAlertsPanel
          isVisible={showAlerts}
          onClose={() => setShowAlerts(false)}
          alerts={alerts}
        />
      )}
    </>
  );
};