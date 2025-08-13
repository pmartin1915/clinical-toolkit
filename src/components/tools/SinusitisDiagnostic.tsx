import { useState } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle, Clock, Thermometer, Eye, Zap } from 'lucide-react';

interface PatientData {
  symptomDuration: number;
  hasWorsening: boolean;
  worseningDay: number;
  hasDoubleWorsening: boolean;
  hasFever: boolean;
  hasNasalDischarge: boolean;
  hasFacialPain: boolean;
  hasAnosmia: boolean;
  hasDentalPain: boolean;
  hasHeadache: boolean;
  hasFatigue: boolean;
  age: number;
  hasAllergies: boolean;
  isImmunocompromised: boolean;
  hasComplicationsRisk: boolean;
  recentAntibiotics: boolean;
  hasResistanceRisk: boolean;
  isPenicillinAllergic: boolean;
  isSevereAllergy: boolean;
  recentHospitalization: boolean;
  hasMultipleComorbidities: boolean;
  hasComplicationSigns: string[];
}

interface TreatmentRecommendation {
  diagnosis: string;
  confidence: 'high' | 'moderate' | 'low';
  recommendation: 'observation' | 'antibiotics' | 'urgent_evaluation';
  antibiotics: AntibioticOption[];
  duration: string;
  followUp: string;
  reasoning: string;
  monitoring: string[];
  redFlags: string[];
}

interface AntibioticOption {
  name: string;
  dosage: string;
  duration: string;
  notes?: string;
  isFirstLine: boolean;
  allergyAlternative?: boolean;
}

export const SinusitisDiagnostic = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData>({
    symptomDuration: 0,
    hasWorsening: false,
    worseningDay: 0,
    hasDoubleWorsening: false,
    hasFever: false,
    hasNasalDischarge: false,
    hasFacialPain: false,
    hasAnosmia: false,
    hasDentalPain: false,
    hasHeadache: false,
    hasFatigue: false,
    age: 0,
    hasAllergies: false,
    isImmunocompromised: false,
    hasComplicationsRisk: false,
    recentAntibiotics: false,
    hasResistanceRisk: false,
    isPenicillinAllergic: false,
    isSevereAllergy: false,
    recentHospitalization: false,
    hasMultipleComorbidities: false,
    hasComplicationSigns: []
  });
  
  const [showResults, setShowResults] = useState(false);

  const complicationSigns = [
    'Toxic appearance or altered mental status',
    'Severe frontal headache or photophobia',
    'Orbital signs (periorbital edema, vision changes)',
    'Neurologic deficits or focal symptoms',
    'High fever with rigors',
    'Severe facial pain or swelling'
  ];

  const updatePatientData = (field: keyof PatientData, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const toggleComplicationSign = (sign: string) => {
    setPatientData(prev => ({
      ...prev,
      hasComplicationSigns: prev.hasComplicationSigns.includes(sign)
        ? prev.hasComplicationSigns.filter(s => s !== sign)
        : [...prev.hasComplicationSigns, sign]
    }));
  };

  const diagnoseBacterialSinusitis = (): boolean => {
    const { symptomDuration, hasWorsening, hasDoubleWorsening } = patientData;
    
    // ABRS criteria: ≥10 days without improvement OR worsening after initial improvement
    return (symptomDuration >= 10 && !hasWorsening) || hasDoubleWorsening;
  };

  const hasHighResistanceRisk = (): boolean => {
    const { 
      age, recentAntibiotics, recentHospitalization, hasMultipleComorbidities,
      isImmunocompromised, hasResistanceRisk 
    } = patientData;
    
    return (
      age >= 65 ||
      recentAntibiotics ||
      recentHospitalization ||
      hasMultipleComorbidities ||
      isImmunocompromised ||
      hasResistanceRisk
    );
  };

  const needsUrgentEvaluation = (): boolean => {
    return patientData.hasComplicationSigns.length > 0;
  };

  const getAntibioticRecommendations = (): AntibioticOption[] => {
    const highRisk = hasHighResistanceRisk();
    const allergic = patientData.isPenicillinAllergic;
    const severeAllergy = patientData.isSevereAllergy;

    const antibiotics: AntibioticOption[] = [];

    if (!allergic && !highRisk) {
      // Standard first-line
      antibiotics.push({
        name: 'Amoxicillin-clavulanate',
        dosage: '875 mg/125 mg BID',
        duration: '5-7 days',
        notes: 'First-line for uncomplicated ABRS',
        isFirstLine: true
      });
    }

    if (!allergic && highRisk) {
      // High-dose for resistance risk
      antibiotics.push({
        name: 'Amoxicillin-clavulanate (high-dose)',
        dosage: '2000 mg/125 mg BID',
        duration: '7 days',
        notes: 'High-dose for resistance risk factors',
        isFirstLine: true
      });
    }

    if (allergic && !severeAllergy) {
      // Non-anaphylactic penicillin allergy
      antibiotics.push({
        name: 'Doxycycline',
        dosage: '100 mg BID or 200 mg daily',
        duration: '5-7 days',
        notes: 'For non-severe penicillin allergy',
        isFirstLine: true,
        allergyAlternative: true
      });
    }

    if (allergic && severeAllergy) {
      // Severe penicillin allergy
      antibiotics.push({
        name: 'Levofloxacin',
        dosage: '500 mg daily',
        duration: '5-7 days',
        notes: 'For severe penicillin allergy - use only if no alternative',
        isFirstLine: false,
        allergyAlternative: true
      });
      
      antibiotics.push({
        name: 'Moxifloxacin',
        dosage: '400 mg daily',
        duration: '5-7 days',
        notes: 'Alternative fluoroquinolone for severe allergy',
        isFirstLine: false,
        allergyAlternative: true
      });
    }

    return antibiotics;
  };

  const generateRecommendations = (): TreatmentRecommendation => {
    const isBacterial = diagnoseBacterialSinusitis();
    const needsUrgent = needsUrgentEvaluation();
    const { symptomDuration, hasWorsening, hasDoubleWorsening } = patientData;

    if (needsUrgent) {
      return {
        diagnosis: 'Complicated Sinusitis - Urgent Evaluation Required',
        confidence: 'high',
        recommendation: 'urgent_evaluation',
        antibiotics: [],
        duration: 'N/A',
        followUp: 'IMMEDIATE evaluation - do not delay',
        reasoning: 'Signs suggesting complications require immediate assessment for orbital cellulitis, intracranial extension, or other serious complications',
        monitoring: [],
        redFlags: patientData.hasComplicationSigns
      };
    }

    if (isBacterial) {
      const shouldTreat = symptomDuration >= 7 || hasWorsening || patientData.hasComplicationsRisk;
      
      if (shouldTreat) {
        return {
          diagnosis: 'Acute Bacterial Rhinosinusitis (ABRS)',
          confidence: hasDoubleWorsening ? 'high' : 'moderate',
          recommendation: 'antibiotics',
          antibiotics: getAntibioticRecommendations(),
          duration: hasHighResistanceRisk() ? '7 days' : '5-7 days',
          followUp: '3-5 days to assess response',
          reasoning: hasDoubleWorsening 
            ? 'Double worsening pattern strongly suggests bacterial infection'
            : `Symptoms ${symptomDuration} days without improvement suggests bacterial infection`,
          monitoring: [
            'Symptom improvement expected within 48-72 hours',
            'Return if worsening or no improvement after 3 days',
            'Complete full antibiotic course even if feeling better'
          ],
          redFlags: []
        };
      } else {
        return {
          diagnosis: 'Probable Acute Bacterial Rhinosinusitis',
          confidence: 'moderate',
          recommendation: 'observation',
          antibiotics: [],
          duration: 'N/A',
          followUp: 'Return in 2-3 days if no improvement',
          reasoning: 'Meets criteria for ABRS but early in course - observation appropriate with close follow-up',
          monitoring: [
            'Symptoms should improve within 7 days',
            'Return if worsening or no improvement after 7 days total',
            'Seek care immediately for severe symptoms'
          ],
          redFlags: []
        };
      }
    } else {
      return {
        diagnosis: 'Viral Rhinosinusitis',
        confidence: 'high',
        recommendation: 'observation',
        antibiotics: [],
        duration: 'N/A',
        followUp: 'Return if symptoms worsen or persist >10 days',
        reasoning: symptomDuration < 10 
          ? 'Symptom duration <10 days without worsening suggests viral etiology'
          : 'Improving symptoms suggest viral etiology - continue supportive care',
        monitoring: [
          'Symptomatic treatment: saline rinses, decongestants, pain relief',
          'Symptoms typically resolve within 7-10 days',
          'Return if symptoms worsen after initial improvement',
          'Return if symptoms persist without improvement after 10 days'
        ],
        redFlags: []
      };
    }
  };

  const recommendation = showResults ? generateRecommendations() : null;

  const stepTitles = [
    'Symptom Timeline',
    'Clinical Symptoms',
    'Patient Factors', 
    'Complication Assessment',
    'Treatment Plan'
  ];

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'urgent_evaluation': return 'bg-red-100 border-red-300 text-red-800';
      case 'antibiotics': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'observation': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'moderate': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'low': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How many days have symptoms been present?
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={patientData.symptomDuration || ''}
                  onChange={(e) => updatePatientData('symptomDuration', parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="5"
                  min="1"
                  max="30"
                />
                <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500 text-sm">
                  days
                </span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Symptom Pattern Assessment</h4>
              
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={patientData.hasWorsening}
                    onChange={(e) => updatePatientData('hasWorsening', e.target.checked)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-blue-900 font-medium">Symptoms are worsening</span>
                    <p className="text-sm text-blue-700">Getting worse rather than improving</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={patientData.hasDoubleWorsening}
                    onChange={(e) => updatePatientData('hasDoubleWorsening', e.target.checked)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-blue-900 font-medium">"Double worsening" pattern</span>
                    <p className="text-sm text-blue-700">Initial improvement followed by worsening (classic bacterial pattern)</p>
                  </div>
                </label>
              </div>

              {patientData.hasWorsening && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    On which day did symptoms start worsening?
                  </label>
                  <input
                    type="number"
                    value={patientData.worseningDay || ''}
                    onChange={(e) => updatePatientData('worseningDay', parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="3"
                    min="1"
                    max={patientData.symptomDuration}
                  />
                </div>
              )}
            </div>

            {patientData.symptomDuration > 0 && (
              <div className={`p-4 rounded-lg border-2 ${
                patientData.symptomDuration >= 10 
                  ? 'border-orange-300 bg-orange-50' 
                  : 'border-green-300 bg-green-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">
                    Day {patientData.symptomDuration}: {
                      patientData.symptomDuration >= 10 
                        ? 'Consider bacterial sinusitis if no improvement' 
                        : 'Likely viral - most cases resolve by day 10'
                    }
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
                Select all symptoms present:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'hasFever', label: 'Fever', icon: '🌡️' },
                  { key: 'hasNasalDischarge', label: 'Purulent nasal discharge', icon: '👃' },
                  { key: 'hasFacialPain', label: 'Facial pain/pressure', icon: '😣' },
                  { key: 'hasAnosmia', label: 'Loss of smell (anosmia)', icon: '👃' },
                  { key: 'hasDentalPain', label: 'Dental/jaw pain', icon: '🦷' },
                  { key: 'hasHeadache', label: 'Headache', icon: '🤕' },
                  { key: 'hasFatigue', label: 'Fatigue/malaise', icon: '😴' }
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
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={patientData.age || ''}
                onChange={(e) => updatePatientData('age', parseInt(e.target.value) || 0)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="45"
              />
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-4">Risk factors and medical history:</p>
              
              <div className="space-y-3">
                {[
                  { key: 'hasAllergies', label: 'Allergic rhinitis/environmental allergies' },
                  { key: 'isImmunocompromised', label: 'Immunocompromised (diabetes, steroids, etc.)' },
                  { key: 'hasComplicationsRisk', label: 'Unable to ensure close follow-up' }
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

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-4">Resistance risk factors (past 3 months):</p>
              
              <div className="space-y-3">
                {[
                  { key: 'recentAntibiotics', label: 'Recent antibiotic use' },
                  { key: 'recentHospitalization', label: 'Recent hospitalization' },
                  { key: 'hasMultipleComorbidities', label: 'Multiple comorbidities (DM, CKD, CHF)' },
                  { key: 'hasResistanceRisk', label: 'Area with >10% penicillin-resistant S. pneumoniae' }
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

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-4">Antibiotic allergies:</p>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={patientData.isPenicillinAllergic}
                    onChange={(e) => updatePatientData('isPenicillinAllergic', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Penicillin allergy</span>
                </label>

                {patientData.isPenicillinAllergic && (
                  <label className="flex items-center p-3 border border-orange-200 rounded-lg hover:bg-orange-50 ml-6">
                    <input
                      type="checkbox"
                      checked={patientData.isSevereAllergy}
                      onChange={(e) => updatePatientData('isSevereAllergy', e.target.checked)}
                      className="mr-3"
                    />
                    <span className="text-orange-900">Severe/anaphylactic reaction</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Assess for Complications
              </h4>
              <p className="text-sm text-red-700 mb-4">
                These signs require IMMEDIATE evaluation and imaging:
              </p>
              
              <div className="space-y-2">
                {complicationSigns.map((sign) => (
                  <label key={sign} className="flex items-start p-3 border border-red-200 rounded-lg hover:bg-red-100">
                    <input
                      type="checkbox"
                      checked={patientData.hasComplicationSigns.includes(sign)}
                      onChange={() => toggleComplicationSign(sign)}
                      className="mr-3 mt-1"
                    />
                    <span className="text-red-900 text-sm font-medium">{sign}</span>
                  </label>
                ))}
              </div>

              {patientData.hasComplicationSigns.length > 0 && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-900 font-semibold">⚠️ URGENT EVALUATION REQUIRED</p>
                  <p className="text-sm text-red-800">Consider orbital cellulitis, intracranial extension, or other complications</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return patientData.symptomDuration > 0;
      case 2: return true;
      case 3: return patientData.age > 0;
      case 4: return true;
      default: return false;
    }
  };

  if (showResults && recommendation) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Eye className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Sinusitis Diagnostic Assessment</h3>
        </div>

        <div className={`p-4 rounded-lg border-2 mb-6 ${getRecommendationColor(recommendation.recommendation)}`}>
          <div className="flex items-center space-x-2 mb-2">
            {getConfidenceIcon(recommendation.confidence)}
            <span className="font-bold">{recommendation.diagnosis}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              recommendation.confidence === 'high' ? 'bg-green-100 text-green-800' :
              recommendation.confidence === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {recommendation.confidence} confidence
            </span>
          </div>
          <p className="text-sm">{recommendation.reasoning}</p>
        </div>

        {/* Red Flags */}
        {recommendation.redFlags.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
            <h4 className="font-semibold text-red-900 mb-3 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              URGENT: Complication Signs Present
            </h4>
            <ul className="space-y-2">
              {recommendation.redFlags.map((flag, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-red-800 text-sm font-medium">{flag}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-900 font-bold">⚠️ DO NOT DELAY - IMMEDIATE EVALUATION REQUIRED</p>
              <p className="text-sm text-red-800">Consider imaging and specialist consultation</p>
            </div>
          </div>
        )}

        {/* Treatment Recommendations */}
        {recommendation.recommendation === 'antibiotics' && recommendation.antibiotics.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Thermometer className="w-5 h-5 text-orange-600 mr-2" />
              Antibiotic Recommendations
            </h4>
            <div className="space-y-3">
              {recommendation.antibiotics.map((antibiotic, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  antibiotic.isFirstLine 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-yellow-300 bg-yellow-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-gray-900">{antibiotic.name}</h5>
                      <div className="flex items-center space-x-2 mt-1">
                        {antibiotic.isFirstLine && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            First-line
                          </span>
                        )}
                        {antibiotic.allergyAlternative && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Allergy alternative
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 mb-2">
                    <div><strong>Dosage:</strong> {antibiotic.dosage}</div>
                    <div><strong>Duration:</strong> {antibiotic.duration}</div>
                  </div>
                  {antibiotic.notes && (
                    <p className="text-sm text-gray-600 italic">{antibiotic.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitoring and Follow-up */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monitoring */}
          {recommendation.monitoring.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Patient Instructions
              </h4>
              <ul className="space-y-2">
                {recommendation.monitoring.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-blue-800 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Follow-up Plan
            </h4>
            <p className="text-green-800 text-sm font-medium mb-2">Schedule:</p>
            <p className="text-green-800 text-sm">{recommendation.followUp}</p>
            
            <div className="mt-4 pt-3 border-t border-green-200">
              <p className="text-green-800 text-sm font-medium mb-1">Expected Duration:</p>
              <p className="text-green-800 text-sm">{recommendation.duration || 'Varies by treatment'}</p>
            </div>
          </div>
        </div>

        {/* Clinical Reminders */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Key Clinical Reminders:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Most cases of rhinosinusitis are viral and self-limiting</li>
            <li>• ABRS diagnosis requires ≥10 days without improvement OR worsening after initial improvement</li>
            <li>• Consider imaging only if complications suspected or atypical presentation</li>
            <li>• Fluoroquinolones should be reserved for severe penicillin allergies</li>
            <li>• Watchful waiting is appropriate for most cases meeting ABRS criteria</li>
          </ul>
        </div>

        <button
          onClick={() => {
            setShowResults(false);
            setCurrentStep(1);
            setPatientData({
              symptomDuration: 0, hasWorsening: false, worseningDay: 0, hasDoubleWorsening: false,
              hasFever: false, hasNasalDischarge: false, hasFacialPain: false, hasAnosmia: false,
              hasDentalPain: false, hasHeadache: false, hasFatigue: false, age: 0,
              hasAllergies: false, isImmunocompromised: false, hasComplicationsRisk: false,
              recentAntibiotics: false, hasResistanceRisk: false, isPenicillinAllergic: false,
              isSevereAllergy: false, recentHospitalization: false, hasMultipleComorbidities: false,
              hasComplicationSigns: []
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
        <Eye className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">Sinusitis Diagnostic Algorithm</h3>
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
            Generate Diagnosis
          </button>
        )}
      </div>
    </div>
  );
};