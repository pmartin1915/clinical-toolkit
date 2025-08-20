import { useState } from 'react';
import { Heart, AlertTriangle, Info, TrendingUp, Shield, Calculator } from 'lucide-react';
import { calculateASCVD, type Inputs as ASCVDInputs, type Subgroup } from '../../utils/ascvd/calculateASCVD';

interface EnhancedASCVDInputs {
  // Basic demographics
  age: string;
  gender: 'male' | 'female' | '';
  race: 'white' | 'african-american' | 'hispanic' | 'asian' | 'other' | '';
  
  // Basic lab values
  totalCholesterol: string;
  hdlCholesterol: string;
  ldlCholesterol: string;
  triglycerides: string;
  systolicBP: string;
  diastolicBP: string;
  
  // Risk factors
  treatedHypertension: 'yes' | 'no' | '';
  diabetes: 'yes' | 'no' | '';
  smoker: 'yes' | 'no' | '';
  
  // Enhanced risk factors (new)
  familyHistory: 'yes' | 'no' | '';
  ckd: 'yes' | 'no' | '';
  inflammatoryDisease: 'yes' | 'no' | '';
  hivInfection: 'yes' | 'no' | '';
  
  // Risk enhancers
  cacScore: string;
  hsCRP: string;
  lipoA: string;
  apoBapoA1Ratio: string;
  ankleArmIndex: string;
  
  // Current medications
  onStatin: 'yes' | 'no' | '';
  onAspirin: 'yes' | 'no' | '';
  onACEInhibitor: 'yes' | 'no' | '';
}

interface ASCVDResult {
  tenYearRisk: number;
  thirtyYearRisk?: number;
  riskCategory: string;
  recommendations: string[];
  riskEnhancers: string[];
  treatmentTargets: {
    ldlTarget: string;
    bpTarget: string;
    lifestyle: string[];
  };
  followUp: string;
  color: string;
  bg: string;
}

export const EnhancedASCVDCalculator = () => {
  const [inputs, setInputs] = useState<EnhancedASCVDInputs>({
    age: '',
    gender: '',
    race: '',
    totalCholesterol: '',
    hdlCholesterol: '',
    ldlCholesterol: '',
    triglycerides: '',
    systolicBP: '',
    diastolicBP: '',
    treatedHypertension: '',
    diabetes: '',
    smoker: '',
    familyHistory: '',
    ckd: '',
    inflammatoryDisease: '',
    hivInfection: '',
    cacScore: '',
    hsCRP: '',
    lipoA: '',
    apoBapoA1Ratio: '',
    ankleArmIndex: '',
    onStatin: '',
    onAspirin: '',
    onACEInhibitor: ''
  });

  const [result, setResult] = useState<ASCVDResult | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'enhanced' | 'medications'>('basic');

  const handleInputChange = (field: keyof EnhancedASCVDInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculatePooledCohortRisk = (): number => {
    const age = parseInt(inputs.age);
    const tc = parseInt(inputs.totalCholesterol);
    const hdl = parseInt(inputs.hdlCholesterol);
    const sbp = parseInt(inputs.systolicBP);
    
    // Input validation
    if (!age || !tc || !hdl || !sbp || !inputs.gender || !inputs.race) {
      return 0;
    }

    // Age range validation (PCE is only valid for ages 40-79)
    if (age < 40 || age > 79) {
      console.warn('Age outside PCE validation range (40-79 years)');
      return 0;
    }

    // Map race/gender to subgroup
    let subgroup: Subgroup;
    if (inputs.gender === 'male') {
      subgroup = inputs.race === 'african-american' ? 'black_male' : 'white_male';
    } else {
      subgroup = inputs.race === 'african-american' ? 'black_female' : 'white_female';
    }

    // Use the new calculation function
    const ascvdInputs: ASCVDInputs = {
      age,
      totalChol: tc,
      hdl,
      sbp,
      treatedBp: inputs.treatedHypertension === 'yes',
      smoker: inputs.smoker === 'yes',
      diabetes: inputs.diabetes === 'yes',
      subgroup
    };

    try {
      const risk = calculateASCVD(ascvdInputs);
      console.log('=== ASCVD Calculation Results ===');
      console.log('Subgroup:', subgroup);
      console.log('Inputs:', ascvdInputs);
      console.log('Risk (decimal):', risk);
      console.log('Risk (percentage):', (risk * 100).toFixed(2) + '%');
      
      return risk * 100; // Convert to percentage for UI
    } catch (error) {
      console.error('ASCVD calculation error:', error);
      return 0;
    }
  };

  const calculate30YearRisk = (tenYearRisk: number): number => {
    // Approximate 30-year risk for younger patients (simplified)
    const age = parseInt(inputs.age);
    if (age >= 60) return tenYearRisk; // Not applicable for older patients
    
    // Extrapolation factor based on age
    const factor = age < 40 ? 3.5 : age < 50 ? 2.8 : 2.2;
    return Math.min(80, tenYearRisk * factor);
  };

  const applyRiskEnhancers = (baseRisk: number): { adjustedRisk: number; enhancers: string[] } => {
    let adjustedRisk = baseRisk;
    const enhancers: string[] = [];

    // Family history of premature CAD
    if (inputs.familyHistory === 'yes') {
      adjustedRisk *= 1.4;
      enhancers.push('Family history of premature CAD (+40% risk)');
    }

    // Chronic kidney disease
    if (inputs.ckd === 'yes') {
      adjustedRisk *= 1.5;
      enhancers.push('Chronic kidney disease (+50% risk)');
    }

    // Inflammatory disease
    if (inputs.inflammatoryDisease === 'yes') {
      adjustedRisk *= 1.3;
      enhancers.push('Inflammatory disease (+30% risk)');
    }

    // HIV infection
    if (inputs.hivInfection === 'yes') {
      adjustedRisk *= 1.5;
      enhancers.push('HIV infection (+50% risk)');
    }

    // CAC Score
    const cacScore = parseInt(inputs.cacScore);
    if (cacScore > 0) {
      if (cacScore > 300) {
        adjustedRisk *= 1.8;
        enhancers.push(`CAC score ${cacScore} (+80% risk - very high)`);
      } else if (cacScore > 100) {
        adjustedRisk *= 1.5;
        enhancers.push(`CAC score ${cacScore} (+50% risk - high)`);
      } else {
        adjustedRisk *= 1.3;
        enhancers.push(`CAC score ${cacScore} (+30% risk - moderate)`);
      }
    } else if (cacScore === 0) {
      adjustedRisk *= 0.7;
      enhancers.push('CAC score 0 (-30% risk - protective)');
    }

    // High-sensitivity CRP
    const hsCRP = parseFloat(inputs.hsCRP);
    if (hsCRP > 3.0) {
      adjustedRisk *= 1.2;
      enhancers.push(`hs-CRP ${hsCRP} mg/L (+20% risk - elevated inflammation)`);
    } else if (hsCRP < 1.0) {
      adjustedRisk *= 0.9;
      enhancers.push(`hs-CRP ${hsCRP} mg/L (-10% risk - low inflammation)`);
    }

    // Lipoprotein(a)
    const lipoA = parseInt(inputs.lipoA);
    if (lipoA > 50) {
      adjustedRisk *= 1.3;
      enhancers.push(`Lp(a) ${lipoA} mg/dL (+30% risk - elevated)`);
    }

    // Ankle-arm index
    const abi = parseFloat(inputs.ankleArmIndex);
    if (abi < 0.9 && abi > 0) {
      adjustedRisk *= 1.4;
      enhancers.push(`ABI ${abi} (+40% risk - peripheral artery disease)`);
    }

    return { 
      adjustedRisk: Math.min(100, adjustedRisk),
      enhancers 
    };
  };

  const generateRecommendations = (risk: number, enhancers: string[]): ASCVDResult => {
    let riskCategory: string;
    let recommendations: string[] = [];
    let color: string;
    let bg: string;
    let ldlTarget: string;
    const bpTarget: string = '<130/80 mmHg';
    
    const lifestyle = [
      'Mediterranean or DASH diet',
      '150+ minutes moderate exercise weekly',
      'Maintain healthy weight (BMI 18.5-24.9)',
      'Smoking cessation if applicable',
      'Limit alcohol consumption'
    ];

    if (risk < 5) {
      riskCategory = 'Low Risk (<5%)';
      color = 'text-green-600';
      bg = 'bg-green-50';
      ldlTarget = '<190 mg/dL (no statin unless familial hypercholesterolemia)';
      recommendations = [
        'Focus on lifestyle modifications',
        'Consider statin only if LDL ≥190 mg/dL or strong family history',
        'Reassess risk in 4-6 years',
        'Encourage healthy lifestyle maintenance'
      ];
    } else if (risk < 7.5) {
      riskCategory = 'Borderline Risk (5-7.4%)';
      color = 'text-yellow-600';
      bg = 'bg-yellow-50';
      ldlTarget = '<100 mg/dL (consider statin if risk enhancers present)';
      recommendations = [
        'Lifestyle modifications as primary intervention',
        'Consider moderate-intensity statin if risk enhancers present',
        'Shared decision-making regarding statin therapy',
        'CAC scoring may help guide therapy if uncertain',
        'Reassess annually'
      ];
    } else if (risk < 20) {
      riskCategory = 'Intermediate Risk (7.5-19.9%)';
      color = 'text-orange-600';
      bg = 'bg-orange-50';
      ldlTarget = '<100 mg/dL (moderate-intensity statin recommended)';
      recommendations = [
        'Moderate-intensity statin recommended',
        'Lifestyle modifications essential',
        'Consider high-intensity statin if multiple risk enhancers',
        'Consider aspirin therapy (discuss bleeding risk)',
        'Blood pressure control <130/80 mmHg'
      ];
    } else {
      riskCategory = 'High Risk (≥20%)';
      color = 'text-red-600';
      bg = 'bg-red-50';
      ldlTarget = '<70 mg/dL (high-intensity statin strongly recommended)';
      recommendations = [
        'High-intensity statin strongly recommended',
        'Consider LDL target <70 mg/dL (or even <55 mg/dL)',
        'Add ezetimibe if LDL remains elevated on statin',
        'Consider PCSK9 inhibitor if LDL >70 mg/dL on maximal therapy',
        'Aspirin therapy recommended (unless contraindicated)',
        'Aggressive blood pressure control <130/80 mmHg',
        'Consider ACE inhibitor/ARB'
      ];
    }

    // Additional recommendations based on risk enhancers
    if (enhancers.length > 0) {
      recommendations.push('Risk enhancers present - consider more aggressive therapy');
      if (risk >= 5 && risk < 7.5) {
        ldlTarget = '<100 mg/dL (favor statin therapy due to risk enhancers)';
      }
    }

    const followUp = risk >= 20 ? '3-6 months' : 
                    risk >= 7.5 ? '6-12 months' : 
                    '1-2 years';

    return {
      tenYearRisk: risk,
      thirtyYearRisk: parseInt(inputs.age) < 60 ? calculate30YearRisk(risk) : undefined,
      riskCategory,
      recommendations,
      riskEnhancers: enhancers,
      treatmentTargets: {
        ldlTarget,
        bpTarget,
        lifestyle
      },
      followUp,
      color,
      bg
    };
  };

  const calculateEnhancedASCVD = () => {
    console.log('Calculate button clicked!');
    console.log('Current inputs:', inputs);
    console.log('isBasicComplete:', isBasicComplete);
    
    // Clear previous result to ensure re-rendering
    setResult(null);
    
    const baseRisk = calculatePooledCohortRisk();
    console.log('Base risk calculated:', baseRisk);
    
    if (baseRisk === 0) {
      console.log('Base risk is 0, returning early');
      return;
    }

    const { adjustedRisk, enhancers } = applyRiskEnhancers(baseRisk);
    const newResult = generateRecommendations(adjustedRisk, enhancers);
    
    console.log('Setting result:', newResult);
    setResult(newResult);
  };

  const isBasicComplete = inputs.age && inputs.gender && inputs.race && 
                         inputs.totalCholesterol && inputs.hdlCholesterol && 
                         inputs.systolicBP && inputs.treatedHypertension !== '' && 
                         inputs.diabetes !== '' && inputs.smoker !== '';

  const tabs = [
    { id: 'basic', label: 'Basic Factors', icon: Heart },
    { id: 'enhanced', label: 'Risk Enhancers', icon: TrendingUp },
    { id: 'medications', label: 'Current Therapy', icon: Shield }
  ] as const;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-full">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enhanced ASCVD Risk Calculator</h2>
              <p className="text-sm text-gray-600">
                2022 AHA/ACC Guidelines with risk enhancers and comprehensive recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
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

        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">ASCVD Risk Assessment</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Estimates 10-year risk of heart attack, stroke, or cardiovascular death using the 
                      2013 ACC/AHA Pooled Cohort Equations with 2022 guideline recommendations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Demographics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Demographics</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <div className="flex">
                      <input
                        type="number"
                        value={inputs.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        min="20"
                        max="79"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="45"
                      />
                      <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                        years (20-79)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['male', 'female'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleInputChange('gender', option as 'male' | 'female')}
                          className={`px-4 py-2 rounded-md border text-sm font-medium ${
                            inputs.gender === option
                              ? 'bg-red-100 border-red-500 text-red-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Race/Ethnicity</label>
                    <select
                      value={inputs.race}
                      onChange={(e) => handleInputChange('race', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select race/ethnicity</option>
                      <option value="white">White/Caucasian</option>
                      <option value="african-american">African American</option>
                      <option value="hispanic">Hispanic/Latino</option>
                      <option value="asian">Asian</option>
                      <option value="other">Other</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Required for accurate risk calculation using validated equations
                    </p>
                  </div>
                </div>

                {/* Clinical Values */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Laboratory Values</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Cholesterol</label>
                      <div className="flex">
                        <input
                          type="number"
                          value={inputs.totalCholesterol}
                          onChange={(e) => handleInputChange('totalCholesterol', e.target.value)}
                          min="130"
                          max="320"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                          placeholder="200"
                        />
                        <span className="inline-flex items-center px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-xs">
                          mg/dL
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">HDL Cholesterol</label>
                      <div className="flex">
                        <input
                          type="number"
                          value={inputs.hdlCholesterol}
                          onChange={(e) => handleInputChange('hdlCholesterol', e.target.value)}
                          min="20"
                          max="100"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                          placeholder="50"
                        />
                        <span className="inline-flex items-center px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-xs">
                          mg/dL
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LDL Cholesterol</label>
                      <div className="flex">
                        <input
                          type="number"
                          value={inputs.ldlCholesterol}
                          onChange={(e) => handleInputChange('ldlCholesterol', e.target.value)}
                          min="50"
                          max="250"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                          placeholder="120"
                        />
                        <span className="inline-flex items-center px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-xs">
                          mg/dL
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Optional - for treatment targets</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Systolic BP</label>
                      <div className="flex">
                        <input
                          type="number"
                          value={inputs.systolicBP}
                          onChange={(e) => handleInputChange('systolicBP', e.target.value)}
                          min="90"
                          max="200"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                          placeholder="120"
                        />
                        <span className="inline-flex items-center px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-xs">
                          mmHg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Risk Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'treatedHypertension', label: 'Taking blood pressure medication?' },
                    { key: 'diabetes', label: 'Diabetes mellitus?' },
                    { key: 'smoker', label: 'Current tobacco use?' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{label}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['yes', 'no'].map((option) => (
                          <button
                            key={option}
                            onClick={() => handleInputChange(key as keyof EnhancedASCVDInputs, option)}
                            className={`px-3 py-2 rounded-md border text-sm font-medium ${
                              inputs[key as keyof EnhancedASCVDInputs] === option
                                ? 'bg-red-100 border-red-500 text-red-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enhanced' && (
            <div className="space-y-6">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-orange-900">Risk Enhancers</h4>
                    <p className="text-sm text-orange-800 mt-1">
                      Additional factors that may increase cardiovascular risk beyond the basic calculation.
                      These help guide treatment decisions, especially in borderline risk patients.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Additional Risk Factors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Risk Factors</h3>
                  
                  {[
                    { 
                      key: 'familyHistory', 
                      label: 'Family history of premature CAD?',
                      description: 'Male relative <55 years or female relative <65 years'
                    },
                    { 
                      key: 'ckd', 
                      label: 'Chronic kidney disease?',
                      description: 'eGFR <60 mL/min/1.73m² or albuminuria'
                    },
                    { 
                      key: 'inflammatoryDisease', 
                      label: 'Inflammatory disease?',
                      description: 'Rheumatoid arthritis, psoriasis, or other autoimmune condition'
                    },
                    { 
                      key: 'hivInfection', 
                      label: 'HIV infection?',
                      description: 'Known HIV-positive status'
                    },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{label}</label>
                        <p className="text-xs text-gray-500">{description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['yes', 'no'].map((option) => (
                          <button
                            key={option}
                            onClick={() => handleInputChange(key as keyof EnhancedASCVDInputs, option)}
                            className={`px-3 py-2 rounded-md border text-sm font-medium ${
                              inputs[key as keyof EnhancedASCVDInputs] === option
                                ? 'bg-orange-100 border-orange-500 text-orange-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Biomarkers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Risk-Enhancing Biomarkers</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coronary Artery Calcium (CAC) Score</label>
                    <div className="flex">
                      <input
                        type="number"
                        value={inputs.cacScore}
                        onChange={(e) => handleInputChange('cacScore', e.target.value)}
                        min="0"
                        max="4000"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                        Agatston units
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Strong predictor; 0 = very low risk, &gt;300 = high risk</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">High-sensitivity CRP</label>
                    <div className="flex">
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.hsCRP}
                        onChange={(e) => handleInputChange('hsCRP', e.target.value)}
                        min="0"
                        max="20"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="1.5"
                      />
                      <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                        mg/L
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{'<1.0 = low risk, 1.0-3.0 = average, >3.0 = high risk'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lipoprotein(a)</label>
                    <div className="flex">
                      <input
                        type="number"
                        value={inputs.lipoA}
                        onChange={(e) => handleInputChange('lipoA', e.target.value)}
                        min="0"
                        max="200"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="30"
                      />
                      <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                        mg/dL
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{'≥50 mg/dL associated with increased risk'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ankle-Brachial Index (ABI)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.ankleArmIndex}
                      onChange={(e) => handleInputChange('ankleArmIndex', e.target.value)}
                      min="0.3"
                      max="1.4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="1.0"
                    />
                    <p className="text-xs text-gray-500 mt-1">{'<0.9 indicates peripheral artery disease'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medications' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">Current Medications</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Information about current cardiovascular medications helps assess treatment adequacy 
                      and guide recommendations for optimization.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    key: 'onStatin', 
                    label: 'Currently taking statin?',
                    description: 'Atorvastatin, rosuvastatin, simvastatin, etc.'
                  },
                  { 
                    key: 'onAspirin', 
                    label: 'Currently taking aspirin?',
                    description: 'Low-dose aspirin for cardioprotection'
                  },
                  { 
                    key: 'onACEInhibitor', 
                    label: 'Taking ACE inhibitor or ARB?',
                    description: 'For blood pressure or heart protection'
                  },
                ].map(({ key, label, description }) => (
                  <div key={key} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{label}</label>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['yes', 'no'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleInputChange(key as keyof EnhancedASCVDInputs, option)}
                          className={`px-3 py-2 rounded-md border text-sm font-medium ${
                            inputs[key as keyof EnhancedASCVDInputs] === option
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calculate Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={calculateEnhancedASCVD}
              disabled={!isBasicComplete}
              className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center space-x-2 ${
                isBasicComplete
                  ? 'bg-red-600 text-white hover:bg-red-700 transition-colors'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Calculator className="w-5 h-5" />
              <span>Calculate Enhanced ASCVD Risk</span>
            </button>
            {!isBasicComplete && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Please complete all required fields to calculate risk.
              </p>
            )}
            <div className="text-xs text-gray-400 mt-2">
              Required fields: age={inputs.age}, gender={inputs.gender}, race={inputs.race}, 
              totalCholesterol={inputs.totalCholesterol}, hdlCholesterol={inputs.hdlCholesterol}, 
              systolicBP={inputs.systolicBP}, treatedHypertension={inputs.treatedHypertension}, 
              diabetes={inputs.diabetes}, smoker={inputs.smoker}
            </div>
            <div className="text-xs text-gray-400">
              isBasicComplete: {isBasicComplete.toString()}
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-8 space-y-6">
              {/* Risk Score Display */}
              <div className={`p-6 rounded-lg border ${result.bg}`}>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {result.tenYearRisk.toFixed(1)}%
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium border ${result.bg} ${result.color}`}>
                    {result.riskCategory}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    10-year ASCVD risk
                  </div>
                  {result.thirtyYearRisk && (
                    <div className="text-sm text-gray-600 mt-1">
                      30-year risk: {result.thirtyYearRisk.toFixed(1)}%
                    </div>
                  )}
                </div>

                {/* Risk Enhancers */}
                {result.riskEnhancers.length > 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Risk Enhancers Present
                    </h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {result.riskEnhancers.map((enhancer, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {enhancer}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className={`w-4 h-4 mr-2 ${result.color}`} />
                      Clinical Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="w-2 h-2 bg-gray-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Treatment Targets</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">LDL Cholesterol: </span>
                        <span className="text-gray-600">{result.treatmentTargets.ldlTarget}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Blood Pressure: </span>
                        <span className="text-gray-600">{result.treatmentTargets.bpTarget}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Follow-up: </span>
                        <span className="text-gray-600">{result.followUp}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lifestyle Recommendations */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Lifestyle Modifications (All Patients)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.treatmentTargets.lifestyle.map((lifestyle, index) => (
                      <div key={index} className="flex items-start text-sm text-green-800">
                        <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {lifestyle}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Important Notes</h5>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Based on 2013 ACC/AHA Pooled Cohort Equations and 2022 guidelines</li>
                    <li>• Risk enhancers may influence treatment decisions in borderline cases</li>
                    <li>• Individual patient factors and shared decision-making are essential</li>
                    <li>• Consider bleeding risk before starting aspirin therapy</li>
                    <li>• Regular monitoring and medication adjustments may be needed</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};