import { useState } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle, Thermometer, Clock, FlaskConical } from 'lucide-react';

interface PatientData {
  gender: 'male' | 'female' | '';
  isPregnant: boolean;
  age: number;
  symptoms: string[];
  hasFever: boolean;
  temperature: number;
  hasFlankPain: boolean;
  hasCVATenderness: boolean;
  isImmunocompromised: boolean;
  hasUrinaryAbnormalities: boolean;
  hasCatheter: boolean;
  hasRecentInstrumentation: boolean;
  mdrRiskFactors: string[];
  creatinineClearance: number;
}

interface TreatmentRecommendation {
  diagnosis: string;
  severity: 'simple' | 'complicated' | 'pyelonephritis';
  antibiotics: AntibioticOption[];
  workup: string[];
  monitoring: string[];
  followUp: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  reasoning: string;
}

interface AntibioticOption {
  name: string;
  dosage: string;
  duration: string;
  route: string;
  notes?: string;
  isFirstLine: boolean;
}

export const UTIDiagnostic = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData>({
    gender: '',
    isPregnant: false,
    age: 0,
    symptoms: [],
    hasFever: false,
    temperature: 0,
    hasFlankPain: false,
    hasCVATenderness: false,
    isImmunocompromised: false,
    hasUrinaryAbnormalities: false,
    hasCatheter: false,
    hasRecentInstrumentation: false,
    mdrRiskFactors: [],
    creatinineClearance: 0
  });
  
  const [showResults, setShowResults] = useState(false);

  const commonSymptoms = [
    'Dysuria (painful urination)',
    'Urinary frequency',
    'Urinary urgency',
    'Suprapubic discomfort',
    'Hematuria (blood in urine)',
    'Altered mental status (elderly/debilitated)',
    'Fatigue or malaise'
  ];

  const mdrRiskFactors = [
    'Prior MDR isolate (past 3 months)',
    'Recent hospitalization (past 3 months)',
    'Recent SNF stay (past 3 months)',
    'Recent fluoroquinolone use (past 3 months)',
    'Recent TMP-SMX use (past 3 months)',
    'Recent 3rd+ generation cephalosporin use (past 3 months)',
    'Travel to high-resistance areas (India, Mexico, etc.)'
  ];

  const updatePatientData = (field: keyof PatientData, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSymptom = (symptom: string) => {
    setPatientData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const toggleMDRFactor = (factor: string) => {
    setPatientData(prev => ({
      ...prev,
      mdrRiskFactors: prev.mdrRiskFactors.includes(factor)
        ? prev.mdrRiskFactors.filter(f => f !== factor)
        : [...prev.mdrRiskFactors, factor]
    }));
  };

  const isComplicated = () => {
    const { 
      gender, isPregnant, hasFever, temperature, hasFlankPain, hasCVATenderness,
      isImmunocompromised, hasUrinaryAbnormalities, hasCatheter, hasRecentInstrumentation
    } = patientData;

    return (
      gender === 'male' ||
      isPregnant ||
      hasFever || 
      temperature >= 99.9 ||
      hasFlankPain ||
      hasCVATenderness ||
      isImmunocompromised ||
      hasUrinaryAbnormalities ||
      hasCatheter ||
      hasRecentInstrumentation
    );
  };

  const isPyelonephritis = () => {
    const { hasFever, temperature, hasFlankPain, hasCVATenderness } = patientData;
    return hasFever || temperature >= 99.9 || hasFlankPain || hasCVATenderness;
  };

  const generateRecommendations = (): TreatmentRecommendation => {
    const complicated = isComplicated();
    const pyelonephritis = isPyelonephritis();
    const hasMDRRisk = patientData.mdrRiskFactors.length > 0;
    const lowCrCl = patientData.creatinineClearance > 0 && patientData.creatinineClearance < 30;

    let diagnosis = '';
    let severity: 'simple' | 'complicated' | 'pyelonephritis' = 'simple';
    let antibiotics: AntibioticOption[] = [];
    let workup: string[] = [];
    let monitoring: string[] = [];
    let urgency: 'routine' | 'urgent' | 'emergency' = 'routine';
    let reasoning = '';

    // Determine diagnosis and severity
    if (pyelonephritis) {
      diagnosis = 'Acute Pyelonephritis';
      severity = 'pyelonephritis';
      urgency = 'urgent';
      reasoning = 'Fever, flank pain, or CVA tenderness indicate upper urinary tract infection';
    } else if (complicated) {
      diagnosis = 'Complicated UTI';
      severity = 'complicated';
      urgency = 'urgent';
      reasoning = 'Male gender, pregnancy, immunocompromise, or urinary tract abnormalities present';
    } else {
      diagnosis = 'Acute Uncomplicated Cystitis';
      severity = 'simple';
      urgency = 'routine';
      reasoning = 'Simple cystitis in non-pregnant, immunocompetent female';
    }

    // Workup recommendations
    if (severity === 'simple' && !hasMDRRisk) {
      workup = [
        'Clinical diagnosis - urinalysis optional',
        'Urine culture NOT routinely needed'
      ];
    } else {
      workup = [
        'Urinalysis with microscopy',
        'Urine culture and sensitivity (ALWAYS for complicated UTI)',
        'Consider CBC, BMP if febrile or systemically ill'
      ];
      
      if (pyelonephritis) {
        workup.push('Blood cultures if febrile or toxic appearing');
        workup.push('Consider renal ultrasound or CT if no improvement in 48-72 hours');
      }
    }

    // Antibiotic selection
    if (severity === 'simple') {
      if (!hasMDRRisk) {
        antibiotics = [
          {
            name: 'Nitrofurantoin',
            dosage: '100 mg BID',
            duration: '5 days',
            route: 'PO',
            notes: lowCrCl ? 'AVOID if CrCl <30 mL/min' : undefined,
            isFirstLine: !lowCrCl
          },
          {
            name: 'TMP-SMX DS',
            dosage: '160/800 mg BID',
            duration: '3 days',
            route: 'PO',
            notes: 'Avoid if E. coli resistance >20% in area',
            isFirstLine: true
          }
        ];
      } else {
        antibiotics = [
          {
            name: 'Amoxicillin-Clavulanate',
            dosage: '500 mg BID',
            duration: '5-7 days',
            route: 'PO',
            notes: 'Less effective, more side effects',
            isFirstLine: false
          },
          {
            name: 'Cephalexin',
            dosage: '500 mg BID',
            duration: '5-7 days',
            route: 'PO',
            notes: 'Acceptable alternative',
            isFirstLine: false
          },
          {
            name: 'Ciprofloxacin',
            dosage: '250 mg BID',
            duration: '3 days',
            route: 'PO',
            notes: 'Avoid if possible due to side effects',
            isFirstLine: false
          }
        ];
      }
    } else if (severity === 'pyelonephritis') {
      antibiotics = [
        {
          name: 'Ciprofloxacin',
          dosage: '500 mg BID',
          duration: '7 days',
          route: 'PO',
          notes: 'Must confirm susceptibility on culture',
          isFirstLine: true
        },
        {
          name: 'Levofloxacin',
          dosage: '750 mg daily',
          duration: '5 days',
          route: 'PO',
          notes: 'Alternative fluoroquinolone',
          isFirstLine: true
        }
      ];

      if (hasMDRRisk) {
        antibiotics.unshift({
          name: 'Ceftriaxone',
          dosage: '1 g x 1 dose',
          duration: 'Single dose',
          route: 'IM/IV',
          notes: 'Consider loading dose for moderate illness',
          isFirstLine: true
        });
        
        antibiotics.push({
          name: 'Ertapenem',
          dosage: '1 g daily',
          duration: '7-14 days',
          route: 'IM/IV',
          notes: 'For suspected ESBL/MDR organisms',
          isFirstLine: false
        });
      }
    } else {
      // Complicated UTI (non-pyelonephritis)
      antibiotics = [
        {
          name: 'Ciprofloxacin',
          dosage: '500 mg BID',
          duration: '7-14 days',
          route: 'PO',
          notes: 'Must confirm susceptibility',
          isFirstLine: true
        },
        {
          name: 'Levofloxacin',
          dosage: '750 mg daily',
          duration: '5-7 days',
          route: 'PO',
          notes: 'Alternative fluoroquinolone',
          isFirstLine: true
        }
      ];
    }

    // Monitoring recommendations
    if (severity === 'simple') {
      monitoring = [
        'Symptoms should improve within 24-48 hours',
        'No routine follow-up culture needed',
        'Return if symptoms persist or worsen'
      ];
    } else {
      monitoring = [
        'Clinical improvement expected within 48-72 hours',
        'Follow-up culture 1-2 weeks after completion if symptoms persist',
        'Monitor for treatment failure or resistance'
      ];
      
      if (pyelonephritis) {
        monitoring.push('Consider hospitalization if vomiting, unable to hydrate, or unstable vitals');
        monitoring.push('Blood cultures if febrile or bacteremic');
      }
    }

    const followUp = severity === 'simple' 
      ? 'PRN for persistent symptoms' 
      : severity === 'pyelonephritis'
        ? '48-72 hours to assess response, sooner if worsening'
        : '1 week to assess response';

    return {
      diagnosis,
      severity,
      antibiotics,
      workup,
      monitoring,
      followUp,
      urgency,
      reasoning
    };
  };

  const recommendation = showResults ? generateRecommendations() : null;

  const stepTitles = [
    'Patient Demographics',
    'Symptoms Assessment',
    'Physical Examination',
    'Risk Factors',
    'Treatment Plan'
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 border-red-300 text-red-800';
      case 'urgent': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'pyelonephritis': return <Thermometer className="w-5 h-5 text-red-600" />;
      case 'complicated': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default: return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={patientData.gender === 'female'}
                    onChange={(e) => updatePatientData('gender', e.target.value)}
                    className="mr-2"
                  />
                  Female
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={patientData.gender === 'male'}
                    onChange={(e) => updatePatientData('gender', e.target.value)}
                    className="mr-2"
                  />
                  Male
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={patientData.age || ''}
                onChange={(e) => updatePatientData('age', parseInt(e.target.value) || 0)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="35"
              />
            </div>

            {patientData.gender === 'female' && (
              <div>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={patientData.isPregnant}
                    onChange={(e) => updatePatientData('isPregnant', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Currently pregnant</span>
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Creatinine Clearance (if known)
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={patientData.creatinineClearance || ''}
                  onChange={(e) => updatePatientData('creatinineClearance', parseInt(e.target.value) || 0)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="60"
                />
                <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500 text-sm">
                  mL/min
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Important for nitrofurantoin dosing</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Select all symptoms present:
              </p>
              
              <div className="space-y-2">
                {commonSymptoms.map((symptom) => (
                  <label key={symptom} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={patientData.symptoms.includes(symptom)}
                      onChange={() => toggleSymptom(symptom)}
                      className="mr-3 mt-1"
                    />
                    <span className="text-gray-900">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Physical examination findings:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4 mb-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={patientData.hasFever}
                        onChange={(e) => updatePatientData('hasFever', e.target.checked)}
                        className="mr-2"
                      />
                      Fever present
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Temperature (if measured)</label>
                    <div className="flex">
                      <input
                        type="number"
                        step="0.1"
                        value={patientData.temperature || ''}
                        onChange={(e) => updatePatientData('temperature', parseFloat(e.target.value) || 0)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="99.5"
                      />
                      <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500 text-sm">
                        °F
                      </span>
                    </div>
                  </div>
                </div>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={patientData.hasFlankPain}
                    onChange={(e) => updatePatientData('hasFlankPain', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Flank pain</span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={patientData.hasCVATenderness}
                    onChange={(e) => updatePatientData('hasCVATenderness', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Costovertebral angle (CVA) tenderness</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Complicating factors:
              </p>
              
              <div className="space-y-3">
                {[
                  { key: 'isImmunocompromised', label: 'Immunocompromised (diabetes, steroids, etc.)' },
                  { key: 'hasUrinaryAbnormalities', label: 'Urinary tract obstruction, stones, or abnormalities' },
                  { key: 'hasCatheter', label: 'Urinary catheter present' },
                  { key: 'hasRecentInstrumentation', label: 'Recent urinary instrumentation' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={patientData[key as keyof PatientData] as boolean}
                      onChange={(e) => updatePatientData(key as keyof PatientData, e.target.checked)}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-4">
                MDR risk factors (past 3 months):
              </p>
              
              <div className="space-y-2">
                {mdrRiskFactors.map((factor) => (
                  <label key={factor} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={patientData.mdrRiskFactors.includes(factor)}
                      onChange={() => toggleMDRFactor(factor)}
                      className="mr-3 mt-1"
                    />
                    <span className="text-sm text-gray-900">{factor}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return patientData.gender !== '' && patientData.age > 0;
      case 2: return patientData.symptoms.length > 0;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  if (showResults && recommendation) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <FlaskConical className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">UTI Diagnostic & Treatment Plan</h3>
        </div>

        <div className={`p-4 rounded-lg border-2 mb-6 ${getUrgencyColor(recommendation.urgency)}`}>
          <div className="flex items-center space-x-2 mb-2">
            {getSeverityIcon(recommendation.severity)}
            <span className="font-bold">{recommendation.diagnosis}</span>
          </div>
          <p className="text-sm">{recommendation.reasoning}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Workup */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <FlaskConical className="w-4 h-4 mr-2" />
              Diagnostic Workup
            </h4>
            <ul className="space-y-2">
              {recommendation.workup.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-blue-800 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Monitoring */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Monitoring & Follow-up
            </h4>
            <ul className="space-y-2 mb-3">
              {recommendation.monitoring.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-green-800 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-green-200 pt-3">
              <p className="text-sm font-medium text-green-900">Follow-up Schedule:</p>
              <p className="text-sm text-green-800">{recommendation.followUp}</p>
            </div>
          </div>
        </div>

        {/* Antibiotic Recommendations */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Antibiotic Recommendations:</h4>
          <div className="space-y-3">
            {recommendation.antibiotics.map((antibiotic, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                antibiotic.isFirstLine 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 bg-white'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="font-semibold text-gray-900">{antibiotic.name}</h5>
                      {antibiotic.isFirstLine && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          First-line
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700 mb-2">
                      <div><strong>Dosage:</strong> {antibiotic.dosage}</div>
                      <div><strong>Duration:</strong> {antibiotic.duration}</div>
                      <div><strong>Route:</strong> {antibiotic.route}</div>
                    </div>
                    {antibiotic.notes && (
                      <p className="text-sm text-gray-600 italic">{antibiotic.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
          <h4 className="font-semibold text-yellow-900 mb-2">Key Clinical Reminders:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Don't use nitrofurantoin for pyelonephritis (poor kidney tissue levels)</li>
            <li>• Always assess MDR risk factors before selecting empiric therapy</li>
            <li>• Short courses work for uncomplicated cystitis, longer for complicated UTIs</li>
            <li>• Always send urine culture for complicated UTI or treatment failure</li>
          </ul>
        </div>

        <button
          onClick={() => {
            setShowResults(false);
            setCurrentStep(1);
            setPatientData({
              gender: '', isPregnant: false, age: 0, symptoms: [], hasFever: false,
              temperature: 0, hasFlankPain: false, hasCVATenderness: false,
              isImmunocompromised: false, hasUrinaryAbnormalities: false,
              hasCatheter: false, hasRecentInstrumentation: false,
              mdrRiskFactors: [], creatinineClearance: 0
            });
          }}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
        >
          Start New Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FlaskConical className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">UTI Diagnostic & Treatment Algorithm</h3>
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