import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Bell, X, CheckCircle } from 'lucide-react';
import { CDSEngine, type PatientContext, type CDSAlert } from '../../utils/cdsEngine';
import type { PatientProfile, VitalSigns, AssessmentResult } from '../../types/storage';

interface PatientCDSIntegrationProps {
  patientData: Partial<PatientProfile>;
  vitals?: VitalSigns[];
  assessments?: AssessmentResult[];
  onAlertsChange?: (alerts: CDSAlert[]) => void;
  isRealTime?: boolean; // Show alerts as user types
}

interface CDSAlertDisplay extends CDSAlert {
  isNew?: boolean;
  acknowledged?: boolean;
}

export const PatientCDSIntegration = ({ 
  patientData, 
  vitals = [], 
  assessments = [],
  onAlertsChange,
  isRealTime = true 
}: PatientCDSIntegrationProps) => {
  const [alerts, setAlerts] = useState<CDSAlertDisplay[]>([]);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<string>('');

  // Convert PatientProfile to PatientContext for CDS evaluation
  const buildPatientContext = (): PatientContext => {
    const context: PatientContext = {};

    // Basic demographics
    if (patientData.dateOfBirth) {
      const birthDate = new Date(patientData.dateOfBirth);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      context.age = age;
    }

    // Gender (assuming we add this to patient profile in the future)
    // context.gender = patientData.gender;

    // Medications - convert from structured format to string array for CDS
    if (patientData.currentMedications && patientData.currentMedications.length > 0) {
      context.medications = patientData.currentMedications
        .filter(med => med.active)
        .map(med => med.name.toLowerCase());
    }

    // Allergies
    if (patientData.allergies && patientData.allergies.length > 0) {
      context.allergies = patientData.allergies.map(allergy => allergy.toLowerCase());
    }

    // Diagnoses/Conditions
    if (patientData.conditions && patientData.conditions.length > 0) {
      context.diagnoses = patientData.conditions.map(condition => condition.toLowerCase());
    }

    // Vital Signs - use most recent values
    if (vitals.length > 0) {
      const recentVitals = vitals.reduce((acc, vital) => {
        if (!acc[vital.type] || new Date(vital.timestamp) > new Date(acc[vital.type].timestamp)) {
          acc[vital.type] = vital;
        }
        return acc;
      }, {} as Record<string, VitalSigns>);

      context.vitals = {};
      
      if (recentVitals.blood_pressure) {
        const bp = recentVitals.blood_pressure.value as { systolic: number; diastolic: number };
        context.vitals.systolicBP = bp.systolic;
        context.vitals.diastolicBP = bp.diastolic;
      }
      
      if (recentVitals.heart_rate) {
        context.vitals.heartRate = recentVitals.heart_rate.value as number;
      }
      
      if (recentVitals.temperature) {
        context.vitals.temperature = recentVitals.temperature.value as number;
      }
      
      if (recentVitals.weight) {
        context.vitals.weight = recentVitals.weight.value as number;
      }
    }

    // Assessment Scores - use most recent values
    if (assessments.length > 0) {
      context.assessmentScores = {};
      
      assessments.forEach(assessment => {
        const key = assessment.toolId.toLowerCase().replace(/-/g, '');
        if (assessment.score !== undefined) {
          context.assessmentScores![key] = {
            score: assessment.score,
            date: assessment.timestamp
          };
        }
      });
    }

    return context;
  };

  // Evaluate patient data with CDS engine
  const evaluatePatient = () => {
    const context = buildPatientContext();
    const currentDataString = JSON.stringify(context);
    
    // Only re-evaluate if data has changed
    if (currentDataString === lastEvaluation) return;
    
    const triggeredAlerts = CDSEngine.evaluatePatient(context);
    const alertsWithState = triggeredAlerts.map(alert => ({
      ...alert,
      isNew: true,
      acknowledged: false
    }));
    
    setAlerts(alertsWithState);
    setLastEvaluation(currentDataString);
    
    if (onAlertsChange) {
      onAlertsChange(triggeredAlerts);
    }
  };

  // Real-time evaluation when patient data changes
  useEffect(() => {
    if (isRealTime && (patientData.currentMedications || patientData.allergies || patientData.conditions)) {
      // Debounce the evaluation to avoid excessive calls
      const timer = setTimeout(evaluatePatient, 500);
      return () => clearTimeout(timer);
    }
  }, [patientData, vitals, assessments, isRealTime]);

  // Manual evaluation trigger
  useEffect(() => {
    if (!isRealTime) {
      evaluatePatient();
    }
  }, []);

  const acknowledgeAlert = (alertIndex: number) => {
    setAlerts(prev => prev.map((alert, index) => 
      index === alertIndex ? { ...alert, acknowledged: true } : alert
    ));
  };

  const dismissAlert = (alertIndex: number) => {
    setAlerts(prev => prev.filter((_, index) => index !== alertIndex));
  };

  const criticalAlerts = alerts.filter(alert => 
    alert.priority === 'critical' && !alert.acknowledged
  );
  const highAlerts = alerts.filter(alert => 
    alert.priority === 'high' && !alert.acknowledged
  );
  const totalActiveAlerts = alerts.filter(alert => !alert.acknowledged).length;

  if (alerts.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">No safety alerts detected</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Alert Summary */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-gray-900">Clinical Decision Support</h4>
            <p className="text-sm text-gray-600">
              {totalActiveAlerts} active alert{totalActiveAlerts !== 1 ? 's' : ''}
              {criticalAlerts.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                  {criticalAlerts.length} Critical
                </span>
              )}
              {highAlerts.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                  {highAlerts.length} High Priority
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAlertsPanel(!showAlertsPanel)}
            className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            {showAlertsPanel ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      {/* Critical Alerts - Always Visible */}
      {criticalAlerts.map((alert, index) => (
        <div
          key={`critical-${index}`}
          className="bg-red-50 border-l-4 border-l-red-500 p-4 rounded-r-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h5 className="font-semibold text-red-900">{alert.ruleName}</h5>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded font-medium">
                    CRITICAL
                  </span>
                  {alert.isNew && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-medium animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-sm text-red-800 mb-2">{alert.action.message}</p>
                {alert.action.suggestedAction && (
                  <div className="bg-red-100 rounded p-2 mb-2">
                    <p className="text-xs font-medium text-red-900 mb-1">Recommended Action:</p>
                    <p className="text-sm text-red-800">{alert.action.suggestedAction}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
              {!alert.acknowledged && (
                <button
                  onClick={() => acknowledgeAlert(index)}
                  className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                  Acknowledge
                </button>
              )}
              <button
                onClick={() => dismissAlert(index)}
                className="p-1 text-red-400 hover:text-red-600 transition-colors"
                title="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Detailed Alerts Panel */}
      {showAlertsPanel && (
        <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900 mb-3">All Safety Alerts</h4>
          <div className="space-y-3">
            {alerts.filter(alert => alert.priority !== 'critical').map((alert, index) => {
              const isHigh = alert.priority === 'high';
              const bgColor = isHigh ? 'bg-orange-50' : 'bg-yellow-50';
              const borderColor = isHigh ? 'border-l-orange-500' : 'border-l-yellow-500';
              const textColor = isHigh ? 'text-orange-800' : 'text-yellow-800';
              
              return (
                <div
                  key={`alert-${index}`}
                  className={`${bgColor} border-l-4 ${borderColor} p-3 rounded-r-lg ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h6 className={`font-medium ${textColor}`}>{alert.ruleName}</h6>
                        <span className={`px-2 py-0.5 ${bgColor} ${textColor} text-xs rounded font-medium`}>
                          {alert.priority.toUpperCase()}
                        </span>
                        {alert.isNew && !alert.acknowledged && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${textColor} mb-1`}>{alert.action.message}</p>
                      {alert.action.suggestedAction && (
                        <p className={`text-xs ${textColor} opacity-80`}>
                          Suggestion: {alert.action.suggestedAction}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 flex-shrink-0 ml-3">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(index)}
                          className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                        >
                          OK
                        </button>
                      )}
                      <button
                        onClick={() => dismissAlert(index)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Dismiss alert"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};