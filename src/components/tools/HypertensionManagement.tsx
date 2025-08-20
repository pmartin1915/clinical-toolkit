import { useState } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle, Heart, Activity } from 'lucide-react';

interface PatientData {
  sbp: number;
  dbp: number;
  hasSymptoms: boolean;
  hasCKD: boolean;
  hasDiabetes: boolean;
  hasHF: boolean;
  hasASCVD: boolean;
  isBlack: boolean;
  age: number;
  hasAllergyACE: boolean;
  symptomDetails: string[];
}

interface TreatmentRecommendation {
  category: string;
  recommendations: string[];
  reasoning: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  followUp: string;
}

export const HypertensionManagement = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData>({
    sbp: 0,
    dbp: 0,
    hasSymptoms: false,
    hasCKD: false,
    hasDiabetes: false,
    hasHF: false,
    hasASCVD: false,
    isBlack: false,
    age: 0,
    hasAllergyACE: false,
    symptomDetails: []
  });
  
  const [showResults, setShowResults] = useState(false);

  const emergencySymptoms = [
    'Acute neurologic symptoms (confusion, headache, vision changes)',
    'Chest pain or shortness of breath',
    'Severe back pain',
    'Nausea/vomiting'
  ];

  const updatePatientData = (field: keyof PatientData, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSymptom = (symptom: string) => {
    setPatientData(prev => ({
      ...prev,
      symptomDetails: prev.symptomDetails.includes(symptom)
        ? prev.symptomDetails.filter(s => s !== symptom)
        : [...prev.symptomDetails, symptom]
    }));
  };

  const getBloodPressureCategory = () => {
    const { sbp, dbp } = patientData;
    if (sbp >= 180 || dbp >= 120) return 'Crisis';
    if (sbp >= 140 || dbp >= 90) return 'Stage 2';
    if (sbp >= 130 || dbp >= 80) return 'Stage 1';
    if (sbp >= 120) return 'Elevated';
    return 'Normal';
  };

  const generateRecommendations = (): TreatmentRecommendation => {
    const { sbp, dbp, hasSymptoms, symptomDetails, hasCKD, hasDiabetes, hasHF, hasASCVD, isBlack, hasAllergyACE } = patientData;
    const bpCategory = getBloodPressureCategory();
    
    // Emergency assessment
    if ((sbp >= 180 || dbp >= 120) && (hasSymptoms && symptomDetails.length > 0)) {
      return {
        category: 'Hypertensive Emergency',
        recommendations: [
          'IMMEDIATE evaluation required',
          'Assess for target organ damage',
          'Consider IV antihypertensives',
          'Hospital admission likely needed'
        ],
        reasoning: 'Severe hypertension with symptoms suggesting acute target-organ damage',
        urgency: 'emergency',
        followUp: 'Emergency department evaluation NOW'
      };
    }

    // Lifestyle modifications (always included)
    const lifestyleRecs = [
      'Reduced sodium intake (<2.3g/day, ideally <1.5g/day)',
      'DASH diet (fruits, vegetables, whole grains)',
      'Weight loss if overweight (goal BMI 18.5-24.9)',
      'Regular exercise (150 min/week moderate intensity)',
      'Alcohol limitation (≤2 drinks/day men, ≤1 drink/day women)'
    ];

    // Determine medication strategy
    const medicationRecs: string[] = [];
    let reasoning = '';

    if (sbp < 130 && dbp < 80) {
      return {
        category: 'Lifestyle Modifications Only',
        recommendations: lifestyleRecs,
        reasoning: 'Blood pressure within target range (<130/80 mmHg)',
        urgency: 'routine',
        followUp: 'Recheck in 6-12 months'
      };
    }

    // Medication selection based on comorbidities and patient factors
    if (sbp >= 140 || dbp >= 90 || (sbp >= 130 && (hasCKD || hasDiabetes || hasASCVD))) {
      
      // Special populations first
      if (hasCKD || hasDiabetes) {
        if (hasAllergyACE) {
          medicationRecs.push('ARB (e.g., losartan 50-100mg daily) - preferred for CKD/diabetes');
        } else {
          medicationRecs.push('ACE inhibitor (e.g., lisinopril 10-40mg daily) - preferred for CKD/diabetes');
        }
        reasoning = 'ACE inhibitor or ARB recommended for kidney/cardiovascular protection';
      } else if (hasHF) {
        if (hasAllergyACE) {
          medicationRecs.push('ARB (e.g., losartan 50-100mg daily) - preferred for heart failure');
        } else {
          medicationRecs.push('ACE inhibitor (e.g., lisinopril 10-40mg daily) - preferred for heart failure');
        }
        reasoning = 'ACE inhibitor or ARB recommended for heart failure management';
      } else if (isBlack && !hasCKD && !hasHF) {
        medicationRecs.push('Calcium channel blocker (e.g., amlodipine 5-10mg daily) - more effective in Black patients without CKD/HF');
        medicationRecs.push('OR Thiazide diuretic (e.g., HCTZ 25-50mg daily)');
        reasoning = 'CCBs and thiazides generally more effective in Black adults without CKD or heart failure';
      } else {
        // General first-line options
        medicationRecs.push('Choose from first-line agents:');
        if (!hasAllergyACE) {
          medicationRecs.push('• ACE inhibitor (e.g., lisinopril 10-40mg daily)');
        }
        medicationRecs.push('• ARB (e.g., losartan 50-100mg daily)');
        medicationRecs.push('• Calcium channel blocker (e.g., amlodipine 5-10mg daily)');
        medicationRecs.push('• Thiazide diuretic (e.g., HCTZ 25-50mg daily)');
        reasoning = 'Multiple first-line options available based on patient tolerability';
      }

      // Combination therapy consideration
      if (sbp >= 160 || dbp >= 100 || (sbp >= 145 && (hasCKD || hasDiabetes || hasASCVD))) {
        medicationRecs.push('');
        medicationRecs.push('Consider combination therapy for improved adherence and control');
        reasoning += '. Higher BP or compelling indications suggest combination therapy may be beneficial';
      }
    }

    const allRecommendations = [
      '�‍♂ LIFESTYLE MODIFICATIONS:',
      ...lifestyleRecs,
      '',
      '� PHARMACOLOGIC THERAPY:',
      ...medicationRecs
    ];

    return {
      category: `${bpCategory} Hypertension Management`,
      recommendations: allRecommendations,
      reasoning,
      urgency: (sbp >= 160 || dbp >= 100) ? 'urgent' : 'routine',
      followUp: (sbp >= 160 || dbp >= 100) 
        ? 'Follow-up in 1-2 weeks, then monthly until controlled'
        : 'Follow-up in 4-6 weeks, then every 3 months when stable'
    };
  };

  const recommendation = showResults ? generateRecommendations() : null;

  const stepTitles = [
    'Blood Pressure Assessment',
    'Symptom Evaluation', 
    'Comorbidities',
    'Patient Factors',
    'Treatment Plan'
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 border-red-300 text-red-800';
      case 'urgent': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Systolic BP
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={patientData.sbp || ''}
                    onChange={(e) => updatePatientData('sbp', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="120"
                  />
                  <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500 text-sm">
                    mmHg
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diastolic BP
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={patientData.dbp || ''}
                    onChange={(e) => updatePatientData('dbp', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="80"
                  />
                  <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500 text-sm">
                    mmHg
                  </span>
                </div>
              </div>
            </div>

            {patientData.sbp > 0 && patientData.dbp > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Blood Pressure Category: {getBloodPressureCategory()}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Does the patient have any symptoms suggesting acute target-organ damage?
              </p>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="symptoms"
                    checked={!patientData.hasSymptoms}
                    onChange={() => updatePatientData('hasSymptoms', false)}
                    className="mr-2"
                  />
                  No symptoms
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="symptoms"
                    checked={patientData.hasSymptoms}
                    onChange={() => updatePatientData('hasSymptoms', true)}
                    className="mr-2"
                  />
                  Yes, has concerning symptoms
                </label>
              </div>
            </div>

            {patientData.hasSymptoms && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-900 mb-3">Select all present symptoms:</p>
                <div className="space-y-2">
                  {emergencySymptoms.map((symptom) => (
                    <label key={symptom} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={patientData.symptomDetails.includes(symptom)}
                        onChange={() => toggleSymptom(symptom)}
                        className="mr-2 mt-1"
                      />
                      <span className="text-sm text-red-800">{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Select all comorbidities present:
            </p>
            
            {[
              { key: 'hasCKD', label: 'Chronic Kidney Disease (CKD)', icon: '�' },
              { key: 'hasDiabetes', label: 'Diabetes Mellitus', icon: '�' },
              { key: 'hasHF', label: 'Heart Failure', icon: '' },
              { key: 'hasASCVD', label: 'Atherosclerotic Cardiovascular Disease', icon: '�' }
            ].map(({ key, label, icon }) => (
              <label key={key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={patientData[key as keyof PatientData] as boolean}
                  onChange={(e) => updatePatientData(key as keyof PatientData, e.target.checked)}
                  className="mr-3"
                />
                <span className="mr-2">{icon}</span>
                <span className="text-gray-900">{label}</span>
              </label>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Additional patient factors:
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={patientData.age || ''}
                onChange={(e) => updatePatientData('age', parseInt(e.target.value) || 0)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="65"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={patientData.isBlack}
                  onChange={(e) => updatePatientData('isBlack', e.target.checked)}
                  className="mr-3"
                />
                <span className="text-gray-900">Black/African American race</span>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={patientData.hasAllergyACE}
                  onChange={(e) => updatePatientData('hasAllergyACE', e.target.checked)}
                  className="mr-3"
                />
                <span className="text-gray-900">ACE inhibitor allergy/intolerance</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return patientData.sbp > 0 && patientData.dbp > 0;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  if (showResults && recommendation) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Heart className="w-6 h-6 text-red-600" />
          <h3 className="text-xl font-bold text-gray-900">Hypertension Management Plan</h3>
        </div>

        <div className={`p-4 rounded-lg border-2 mb-6 ${getUrgencyColor(recommendation.urgency)}`}>
          <div className="flex items-center space-x-2 mb-2">
            {recommendation.urgency === 'emergency' && <AlertTriangle className="w-5 h-5" />}
            {recommendation.urgency === 'urgent' && <AlertTriangle className="w-5 h-5" />}
            {recommendation.urgency === 'routine' && <CheckCircle className="w-5 h-5" />}
            <span className="font-bold">{recommendation.category}</span>
          </div>
          <p className="text-sm">{recommendation.reasoning}</p>
        </div>

        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-gray-900">Treatment Recommendations:</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            {recommendation.recommendations.map((rec, index) => (
              <div key={index} className={`${rec.startsWith('�‍♂') || rec.startsWith('�') ? 'font-semibold text-gray-900 mt-4 first:mt-0' : 'text-gray-700 ml-4'} ${rec === '' ? 'mb-2' : ''}`}>
                {rec && (rec.startsWith('•') ? (
                  <div className="flex items-start space-x-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>{rec.substring(1).trim()}</span>
                  </div>
                ) : (
                  rec
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Follow-up Schedule:</h4>
          <p className="text-blue-800">{recommendation.followUp}</p>
        </div>

        <button
          onClick={() => {
            setShowResults(false);
            setCurrentStep(1);
            setPatientData({
              sbp: 0, dbp: 0, hasSymptoms: false, hasCKD: false, hasDiabetes: false,
              hasHF: false, hasASCVD: false, isBlack: false, age: 0, hasAllergyACE: false,
              symptomDetails: []
            });
          }}
          className="mt-6 w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
        >
          Start New Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Heart className="w-6 h-6 text-red-600" />
        <h3 className="text-xl font-bold text-gray-900">Hypertension Management Algorithm</h3>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          {stepTitles.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index + 1 === currentStep 
                  ? 'bg-primary-600 text-white' 
                  : index + 1 < currentStep 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1 < currentStep ? '✓' : index + 1}
              </div>
              {index < stepTitles.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
        <h4 className="text-lg font-semibold text-gray-900">{stepTitles[currentStep - 1]}</h4>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < stepTitles.length ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setShowResults(true)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Treatment Plan
          </button>
        )}
      </div>
    </div>
  );
};