import { useState } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle, Activity, Heart, Scale, Users } from 'lucide-react';

interface PatientData {
  a1c: number;
  weight: number;
  bmi: number;
  hasASCVD: boolean;
  hasHeartFailure: boolean;
  hasCKD: boolean;
  egfr: number;
  isObese: boolean;
  isHighlyMotivated: boolean;
  currentMedications: string[];
  hasMetforminIntolerance: boolean;
  hasMetforminContraindication: boolean;
  age: number;
  hasHypoglycemiaRisk: boolean;
  costConcerns: boolean;
  preferenceInjection: boolean;
}

interface TreatmentRecommendation {
  phase: string;
  primaryRecommendation: MedicationOption;
  alternativeOptions: MedicationOption[];
  addOnTherapies: MedicationOption[];
  reasoning: string;
  monitoring: string[];
  followUp: string;
  urgency: 'routine' | 'urgent';
  goals: string[];
}

interface MedicationOption {
  name: string;
  dosage: string;
  a1cReduction: string;
  advantages: string[];
  limitations: string[];
  cost: 'low' | 'medium' | 'high';
  isFirstLine: boolean;
  contraindications?: string[];
  monitoring?: string[];
}

export const DiabetesTreatment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData>({
    a1c: 0,
    weight: 0,
    bmi: 0,
    hasASCVD: false,
    hasHeartFailure: false,
    hasCKD: false,
    egfr: 0,
    isObese: false,
    isHighlyMotivated: false,
    currentMedications: [],
    hasMetforminIntolerance: false,
    hasMetforminContraindication: false,
    age: 0,
    hasHypoglycemiaRisk: false,
    costConcerns: false,
    preferenceInjection: false
  });
  
  const [showResults, setShowResults] = useState(false);

  const currentMedications = [
    'None - newly diagnosed',
    'Metformin monotherapy',
    'Metformin + 1 other agent',
    'Metformin + 2+ other agents',
    'Non-metformin regimen'
  ];

  const updatePatientData = (field: keyof PatientData, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const needsUrgentTreatment = () => {
    return patientData.a1c >= 9.0;
  };

  const isNewlyDiagnosed = () => {
    return patientData.currentMedications.includes('None - newly diagnosed');
  };

  const getMetforminRecommendation = (): MedicationOption => {
    return {
      name: 'Metformin',
      dosage: 'Start 500mg daily with evening meal → increase weekly to 2000mg/day',
      a1cReduction: '1-2%',
      advantages: [
        'Low hypoglycemia risk',
        'Weight neutral or modest weight loss',
        'Cardiovascular benefit',
        'Low cost',
        'Extensive safety data'
      ],
      limitations: [
        'GI side effects (nausea, diarrhea)',
        'Contraindicated if eGFR <30',
        'Risk of lactic acidosis (rare)'
      ],
      cost: 'low',
      isFirstLine: true,
      contraindications: ['eGFR <30 mL/min/1.73m²', 'Severe hepatic impairment'],
      monitoring: ['eGFR every 3-6 months', 'B12 levels annually (long-term use)']
    };
  };

  const getAlternativeFirstLine = (): MedicationOption[] => {
    const alternatives: MedicationOption[] = [];

    if (patientData.a1c > 9 || patientData.isObese) {
      alternatives.push({
        name: 'GLP-1 RA (Semaglutide)',
        dosage: '0.25mg weekly → titrate to 1mg weekly',
        a1cReduction: '0.5-2%',
        advantages: [
          'Significant weight loss (5-15%)',
          'Cardiovascular benefits',
          'Low hypoglycemia risk',
          'Once weekly dosing'
        ],
        limitations: [
          'Injectable medication',
          'GI side effects initially',
          'High cost',
          'Requires patient education'
        ],
        cost: 'high',
        isFirstLine: true,
        monitoring: ['Weight', 'GI tolerability', 'Injection site reactions']
      });
    }

    if (patientData.hasHeartFailure || patientData.hasCKD) {
      alternatives.push({
        name: 'SGLT2 Inhibitor (Empagliflozin)',
        dosage: '10mg daily, may increase to 25mg daily',
        a1cReduction: '0.5-0.7%',
        advantages: [
          'Heart failure benefits',
          'CKD protection',
          'Weight loss',
          'Blood pressure reduction'
        ],
        limitations: [
          'Less effective at low eGFR',
          'Genital infections',
          'DKA risk (rare)',
          'Moderate cost'
        ],
        cost: 'medium',
        isFirstLine: true,
        contraindications: ['eGFR <20 mL/min/1.73m²'],
        monitoring: ['eGFR', 'UTI/genital infections', 'Volume status']
      });
    }

    return alternatives;
  };

  const getAddOnTherapies = (): MedicationOption[] => {
    const addOns: MedicationOption[] = [];

    // GLP-1 RA for obesity or ASCVD
    if ((patientData.isObese || patientData.hasASCVD) && !patientData.preferenceInjection) {
      addOns.push({
        name: 'GLP-1 RA (Semaglutide)',
        dosage: '0.25mg weekly → 1mg weekly',
        a1cReduction: '0.5-2%',
        advantages: ['Weight loss', 'CV benefits', 'Preferred for obesity/ASCVD'],
        limitations: ['Injection', 'GI side effects', 'Costly'],
        cost: 'high',
        isFirstLine: false
      });
    }

    // SGLT2 for HF or CKD
    if (patientData.hasHeartFailure || patientData.hasCKD) {
      addOns.push({
        name: 'SGLT2 Inhibitor (Empagliflozin)',
        dosage: '10-25mg daily',
        a1cReduction: '0.5-0.7%',
        advantages: ['HF/CKD benefit', 'Weight loss', 'Preferred for HF/CKD'],
        limitations: ['Less effective at low eGFR', 'Genital infections'],
        cost: 'medium',
        isFirstLine: false
      });
    }

    // Sulfonylurea for cost-effective option
    if (patientData.costConcerns && !patientData.hasHypoglycemiaRisk) {
      addOns.push({
        name: 'Sulfonylurea (Glipizide)',
        dosage: '2.5-20mg daily',
        a1cReduction: '1-2%',
        advantages: ['Inexpensive', 'Rapid onset', 'Effective A1C reduction'],
        limitations: ['Hypoglycemia risk', 'Weight gain', 'Limited CV benefit'],
        cost: 'low',
        isFirstLine: false,
        contraindications: ['Frequent hypoglycemia', 'Erratic eating patterns']
      });
    }

    // DPP-4 inhibitor for elderly or hypoglycemia risk
    if (patientData.age >= 65 || patientData.hasHypoglycemiaRisk) {
      addOns.push({
        name: 'DPP-4 Inhibitor (Sitagliptin)',
        dosage: '100mg daily (adjust for eGFR)',
        a1cReduction: '0.5-0.8%',
        advantages: ['Well tolerated', 'No hypoglycemia', 'Oral medication'],
        limitations: ['Modest efficacy', 'Higher cost than sulfonylureas'],
        cost: 'medium',
        isFirstLine: false
      });
    }

    // Pioglitazone for specific indications
    if (!patientData.hasHeartFailure) {
      addOns.push({
        name: 'Pioglitazone',
        dosage: '15-45mg daily',
        a1cReduction: '0.5-1.4%',
        advantages: ['Lipid benefits', 'NASH improvement', 'Durable effect'],
        limitations: ['Weight gain', 'Fluid retention', 'Fracture risk'],
        cost: 'low',
        isFirstLine: false,
        contraindications: ['Heart failure', 'Active bladder cancer']
      });
    }

    return addOns;
  };

  const generateRecommendations = (): TreatmentRecommendation => {
    const { a1c, hasMetforminIntolerance, hasMetforminContraindication } = patientData;
    const canUseMetformin = !hasMetforminIntolerance && !hasMetforminContraindication && patientData.egfr >= 30;
    const urgent = needsUrgentTreatment();
    const newlyDiagnosed = isNewlyDiagnosed();

    let phase = '';
    let primaryRecommendation: MedicationOption;
    let alternativeOptions: MedicationOption[] = [];
    let addOnTherapies: MedicationOption[] = [];
    let reasoning = '';

    // Determine treatment phase and recommendations
    if (newlyDiagnosed) {
      if (a1c < 6.5 && patientData.isHighlyMotivated) {
        phase = 'Lifestyle Intervention Trial';
        primaryRecommendation = {
          name: 'Lifestyle Modifications',
          dosage: '3-6 month trial',
          a1cReduction: '0.5-2%',
          advantages: [
            'Weight loss fundamental to treatment',
            'Medical nutrition therapy',
            'Physical activity 150+ min/week',
            'Diabetes self-management education'
          ],
          limitations: ['Requires high motivation', 'May delay pharmacotherapy'],
          cost: 'low',
          isFirstLine: true
        };
        reasoning = 'A1C <6.5% with highly motivated patient - lifestyle trial reasonable for 3-6 months';
      } else {
        phase = 'Initial Pharmacotherapy';
        if (canUseMetformin) {
          primaryRecommendation = getMetforminRecommendation();
          reasoning = 'Metformin is preferred first-line therapy unless contraindicated';
        } else {
          alternativeOptions = getAlternativeFirstLine();
          primaryRecommendation = alternativeOptions[0] || getAlternativeFirstLine()[0];
          reasoning = 'Metformin contraindicated - selecting alternative based on comorbidities';
        }
        
        if (urgent) {
          reasoning += '. A1C ≥9% - consider combination therapy or GLP-1 RA/insulin for rapid control';
        }
      }
    } else {
      // Existing therapy - need add-on
      phase = 'Intensification Therapy';
      addOnTherapies = getAddOnTherapies();
      primaryRecommendation = addOnTherapies[0];
      reasoning = 'Glycemic goals not met with current therapy - add-on agent selected based on comorbidities and patient factors';
    }

    // Monitoring recommendations
    const monitoring = [
      'A1C every 3-6 months until stable, then every 6 months',
      'Annual comprehensive foot exam',
      'Annual dilated eye exam',
      'Lipid panel annually',
      'eGFR and ACR annually',
      'Blood pressure monitoring'
    ];

    if (primaryRecommendation.monitoring) {
      monitoring.push(...primaryRecommendation.monitoring);
    }

    // Treatment goals
    const goals = [
      'A1C <7% for most adults',
      'A1C <6.5% if achieved safely without hypoglycemia',
      'A1C <8% for limited life expectancy or comorbidities',
      'Weight loss 5-10% if overweight',
      'Blood pressure <130/80 mmHg',
      'LDL cholesterol <70 mg/dL (if ASCVD risk)'
    ];

    return {
      phase,
      primaryRecommendation,
      alternativeOptions,
      addOnTherapies: newlyDiagnosed ? [] : addOnTherapies,
      reasoning,
      monitoring,
      followUp: urgent ? '2-4 weeks initially, then every 3 months' : '4-6 weeks, then every 3-6 months',
      urgency: urgent ? 'urgent' : 'routine',
      goals
    };
  };

  const recommendation = showResults ? generateRecommendations() : null;

  const stepTitles = [
    'Clinical Assessment',
    'Comorbidities',
    'Current Therapy',
    'Patient Factors',
    'Treatment Plan'
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
                  Current A1C
                </label>
                <div className="flex">
                  <input
                    type="number"
                    step="0.1"
                    value={patientData.a1c || ''}
                    onChange={(e) => updatePatientData('a1c', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="7.5"
                  />
                  <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500 text-sm">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={patientData.age || ''}
                  onChange={(e) => updatePatientData('age', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="55"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                <div className="flex">
                  <input
                    type="number"
                    value={patientData.weight || ''}
                    onChange={(e) => updatePatientData('weight', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="180"
                  />
                  <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500 text-sm">
                    lbs
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
                <div className="flex">
                  <input
                    type="number"
                    step="0.1"
                    value={patientData.bmi || ''}
                    onChange={(e) => {
                      const bmi = parseFloat(e.target.value) || 0;
                      updatePatientData('bmi', bmi);
                      updatePatientData('isObese', bmi >= 30);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="28.5"
                  />
                  <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500 text-sm">
                    kg/m²
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">eGFR (if known)</label>
                <div className="flex">
                  <input
                    type="number"
                    value={patientData.egfr || ''}
                    onChange={(e) => updatePatientData('egfr', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="60"
                  />
                  <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500 text-sm">
                    mL/min
                  </span>
                </div>
              </div>
            </div>

            {patientData.a1c > 0 && (
              <div className={`p-4 rounded-lg border-2 ${
                patientData.a1c >= 9 
                  ? 'border-red-300 bg-red-50' 
                  : patientData.a1c >= 8 
                    ? 'border-orange-300 bg-orange-50' 
                    : 'border-green-300 bg-green-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span className="font-medium">
                    A1C {patientData.a1c}%: {
                      patientData.a1c >= 9 ? 'Urgent treatment needed' :
                      patientData.a1c >= 8 ? 'Above target - intensification recommended' :
                      patientData.a1c >= 7 ? 'Near target - consider optimization' :
                      'At target'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Select all comorbidities present:
            </p>
            
            {[
              { key: 'hasASCVD', label: 'Atherosclerotic Cardiovascular Disease (ASCVD)', icon: '🫀' },
              { key: 'hasHeartFailure', label: 'Heart Failure', icon: '❤️' },
              { key: 'hasCKD', label: 'Chronic Kidney Disease (CKD)', icon: '🫘' }
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

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-3">Metformin considerations:</p>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={patientData.hasMetforminIntolerance}
                    onChange={(e) => updatePatientData('hasMetforminIntolerance', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Metformin intolerance (GI side effects)</span>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={patientData.hasMetforminContraindication}
                    onChange={(e) => updatePatientData('hasMetforminContraindication', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Metformin contraindication (eGFR &lt;30, severe hepatic impairment)</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Current diabetes medications:
              </label>
              <div className="space-y-2">
                {currentMedications.map((medication) => (
                  <label key={medication} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="currentMedications"
                      checked={patientData.currentMedications.includes(medication)}
                      onChange={() => updatePatientData('currentMedications', [medication])}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{medication}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">Patient preferences and considerations:</p>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={patientData.isHighlyMotivated}
                    onChange={(e) => updatePatientData('isHighlyMotivated', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Highly motivated for lifestyle changes</span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={patientData.hasHypoglycemiaRisk}
                    onChange={(e) => updatePatientData('hasHypoglycemiaRisk', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">High hypoglycemia risk (elderly, erratic eating, etc.)</span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={patientData.costConcerns}
                    onChange={(e) => updatePatientData('costConcerns', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Cost/insurance concerns</span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={patientData.preferenceInjection}
                    onChange={(e) => updatePatientData('preferenceInjection', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Prefers to avoid injectable medications</span>
                </label>
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
      case 1: return patientData.a1c > 0 && patientData.age > 0;
      case 2: return true;
      case 3: return patientData.currentMedications.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  if (showResults && recommendation) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Diabetes Treatment Algorithm</h3>
        </div>

        <div className={`p-4 rounded-lg border-2 mb-6 ${getUrgencyColor(recommendation.urgency)}`}>
          <div className="flex items-center space-x-2 mb-2">
            {recommendation.urgency === 'urgent' && <AlertTriangle className="w-5 h-5" />}
            {recommendation.urgency === 'routine' && <CheckCircle className="w-5 h-5" />}
            <span className="font-bold">{recommendation.phase}</span>
          </div>
          <p className="text-sm">{recommendation.reasoning}</p>
        </div>

        {/* Primary Recommendation */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Primary Recommendation
          </h4>
          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h5 className="font-semibold text-gray-900 text-lg">{recommendation.primaryRecommendation.name}</h5>
                <p className="text-sm text-gray-600">{recommendation.primaryRecommendation.dosage}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCostColor(recommendation.primaryRecommendation.cost)}`}>
                  {recommendation.primaryRecommendation.cost} cost
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  A1C ↓{recommendation.primaryRecommendation.a1cReduction}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 className="font-medium text-green-900 mb-2">Advantages:</h6>
                <ul className="text-sm text-green-800 space-y-1">
                  {recommendation.primaryRecommendation.advantages.map((advantage, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {advantage}
                    </li>
                  ))}
                </ul>
              </div>
              
              {recommendation.primaryRecommendation.limitations.length > 0 && (
                <div>
                  <h6 className="font-medium text-green-900 mb-2">Limitations:</h6>
                  <ul className="text-sm text-green-800 space-y-1">
                    {recommendation.primaryRecommendation.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add-on Therapies */}
        {recommendation.addOnTherapies.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              Add-on Therapy Options
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recommendation.addOnTherapies.map((therapy, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-gray-900">{therapy.name}</h5>
                    <div className="flex items-center space-x-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCostColor(therapy.cost)}`}>
                        {therapy.cost}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{therapy.dosage}</p>
                  <p className="text-sm text-blue-800 mb-2">A1C reduction: {therapy.a1cReduction}</p>
                  <div className="text-xs text-blue-700">
                    <strong>Best for:</strong> {therapy.advantages.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals and Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Treatment Goals */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Treatment Goals
            </h4>
            <ul className="space-y-2">
              {recommendation.goals.map((goal, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-purple-800 text-sm">{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Monitoring */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
              <Scale className="w-4 h-4 mr-2" />
              Monitoring Schedule
            </h4>
            <ul className="space-y-2 mb-3">
              {recommendation.monitoring.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-yellow-800 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-yellow-200 pt-3">
              <p className="text-sm font-medium text-yellow-900">Follow-up Schedule:</p>
              <p className="text-sm text-yellow-800">{recommendation.followUp}</p>
            </div>
          </div>
        </div>

        {/* Clinical Reminders */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Key Clinical Reminders:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Weight loss is fundamental to all type 2 diabetes therapy</li>
            <li>• Start low, go slow with metformin to minimize GI side effects</li>
            <li>• Consider patient preferences, cost, and adherence in medication selection</li>
            <li>• Reassess and intensify therapy if A1C not at goal after 3-6 months</li>
            <li>• Always provide diabetes self-management education</li>
          </ul>
        </div>

        <button
          onClick={() => {
            setShowResults(false);
            setCurrentStep(1);
            setPatientData({
              a1c: 0, weight: 0, bmi: 0, hasASCVD: false, hasHeartFailure: false,
              hasCKD: false, egfr: 0, isObese: false, isHighlyMotivated: false,
              currentMedications: [], hasMetforminIntolerance: false,
              hasMetforminContraindication: false, age: 0, hasHypoglycemiaRisk: false,
              costConcerns: false, preferenceInjection: false
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
        <Activity className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Diabetes Treatment Algorithm</h3>
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