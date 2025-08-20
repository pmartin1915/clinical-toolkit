import { useState } from 'react';
import { Heart, AlertTriangle, Info, Calculator } from 'lucide-react';

interface ASCVDInputs {
  age: string;
  gender: 'male' | 'female' | '';
  race: 'white' | 'african-american' | '';
  totalCholesterol: string;
  hdlCholesterol: string;
  systolicBP: string;
  treatedHypertension: 'yes' | 'no' | '';
  diabetes: 'yes' | 'no' | '';
  smoker: 'yes' | 'no' | '';
}

interface ASCVDResult {
  tenYearRisk: number;
  riskCategory: string;
  recommendations: string[];
  treatmentTargets: {
    ldlTarget: string;
    bpTarget: string;
    lifestyle: string[];
  };
  followUp: string;
  color: string;
  bg: string;
}

export const ASCVDCalculator = () => {
  const [inputs, setInputs] = useState<ASCVDInputs>({
    age: '',
    gender: '',
    race: '',
    totalCholesterol: '',
    hdlCholesterol: '',
    systolicBP: '',
    treatedHypertension: '',
    diabetes: '',
    smoker: ''
  });

  const [result, setResult] = useState<ASCVDResult | null>(null);

  const handleInputChange = (field: keyof ASCVDInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculatePooledCohortRisk = (): number => {
    const age = parseInt(inputs.age);
    const tc = parseInt(inputs.totalCholesterol);
    const hdl = parseInt(inputs.hdlCholesterol);
    const sbp = parseInt(inputs.systolicBP);
    
    if (!age || !tc || !hdl || !sbp || !inputs.gender || !inputs.race) {
      return 0;
    }

    // 2013 ACC/AHA Pooled Cohort Risk Equations - Corrected Coefficients
    let coefficients: any;
    
    if (inputs.gender === 'male') {
      if (inputs.race === 'african-american') {
        // African American Male
        coefficients = {
          lnAge: 2.469,
          lnTC: 0.302,
          lnHDL: -0.307,
          lnSBP_treated: 1.916,
          lnSBP_untreated: 1.809,
          smoke: 0.549,
          diabetes: 0.645,
          meanRisk: 19.54,
          survivalRate: 0.8954
        };
      } else {
        // White Male (non-Hispanic)
        coefficients = {
          lnAge: 3.06117,
          lnTC: 1.12370,
          lnHDL: -0.93263,
          lnSBP_treated: 1.93303,
          lnSBP_untreated: 1.99881,
          smoke: 0.65451,
          diabetes: 0.57367,
          meanRisk: 61.18,
          survivalRate: 0.9144
        };
      }
    } else {
      if (inputs.race === 'african-american') {
        // African American Female
        coefficients = {
          lnAge: 17.1141,
          lnTC: 0.9396,
          lnHDL: -18.9196,
          lnSBP_treated: 4.4748,
          lnSBP_untreated: 6.0873,
          smoke: 0.6908,
          diabetes: 0.8738,
          // Age interaction terms
          lnAge_lnTC: -0.1799,
          lnAge_lnHDL: 4.8844,
          lnAge_lnSBP_treated: -1.0387,
          lnAge_lnSBP_untreated: -1.8944,
          lnAge_smoke: -0.3220,
          lnAge_diabetes: -0.9881,
          meanRisk: 86.61,
          survivalRate: 0.9533
        };
      } else {
        // White Female (non-Hispanic)
        coefficients = {
          lnAge: -29.799,
          lnTC: 4.884,
          lnHDL: -13.540,
          lnSBP_treated: 3.114,
          lnSBP_untreated: 5.349,
          smoke: 0.661,
          diabetes: 0.718,
          // Age interaction terms
          lnAge_lnTC: -1.665,
          lnAge_lnHDL: 3.445,
          lnAge_lnSBP_treated: -2.996,
          lnAge_lnSBP_untreated: -1.844,
          lnAge_smoke: -0.539,
          lnAge_diabetes: -0.398,
          meanRisk: 29.18,
          survivalRate: 0.9665
        };
      }
    }

    // Calculate individual risk score
    let riskScore = 0;
    const lnAge = Math.log(age);
    const lnTC = Math.log(tc);
    const lnHDL = Math.log(hdl);
    const lnSBP = Math.log(sbp);
    
    // Main effects
    riskScore += coefficients.lnAge * lnAge;
    riskScore += coefficients.lnTC * lnTC;
    riskScore += coefficients.lnHDL * lnHDL;
    
    if (inputs.treatedHypertension === 'yes') {
      riskScore += coefficients.lnSBP_treated * lnSBP;
    } else {
      riskScore += coefficients.lnSBP_untreated * lnSBP;
    }
    
    if (inputs.smoker === 'yes') {
      riskScore += coefficients.smoke;
    }
    
    if (inputs.diabetes === 'yes') {
      riskScore += coefficients.diabetes;
    }

    // Apply age interactions for women
    if (inputs.gender === 'female') {
      riskScore += coefficients.lnAge_lnTC * lnAge * lnTC;
      riskScore += coefficients.lnAge_lnHDL * lnAge * lnHDL;
      
      if (inputs.treatedHypertension === 'yes') {
        riskScore += coefficients.lnAge_lnSBP_treated * lnAge * lnSBP;
      } else {
        riskScore += coefficients.lnAge_lnSBP_untreated * lnAge * lnSBP;
      }
      
      if (inputs.smoker === 'yes') {
        riskScore += coefficients.lnAge_smoke * lnAge;
      }
      
      if (inputs.diabetes === 'yes') {
        riskScore += coefficients.lnAge_diabetes * lnAge;
      }
    }

    // Calculate 10-year risk
    const tenYearRisk = (1 - Math.pow(coefficients.survivalRate, Math.exp(riskScore - coefficients.meanRisk))) * 100;
    
    return Math.max(0, Math.min(100, tenYearRisk));
  };

  const generateRecommendations = (risk: number): ASCVDResult => {
    let riskCategory: string;
    let recommendations: string[] = [];
    let color: string;
    let bg: string;
    let ldlTarget: string;
    const bpTarget: string = '<130/80 mmHg';
    
    const lifestyle = [
      'Heart-healthy diet (Mediterranean or DASH)',
      '150+ minutes moderate exercise weekly',
      'Maintain healthy weight (BMI 18.5-24.9)',
      'Smoking cessation if applicable',
      'Limit alcohol consumption'
    ];

    if (risk < 5) {
      riskCategory = 'Low Risk (<5%)';
      color = 'text-green-600';
      bg = 'bg-green-50';
      ldlTarget = '<190 mg/dL (lifestyle focus)';
      recommendations = [
        'Focus on lifestyle modifications',
        'Consider statin only if LDL ≥190 mg/dL',
        'Reassess risk in 4-6 years',
        'Encourage healthy lifestyle maintenance'
      ];
    } else if (risk < 7.5) {
      riskCategory = 'Borderline Risk (5-7.4%)';
      color = 'text-yellow-600';
      bg = 'bg-yellow-50';
      ldlTarget = '<100 mg/dL (consider statin with risk enhancers)';
      recommendations = [
        'Lifestyle modifications as primary intervention',
        'Consider moderate-intensity statin if risk enhancers present',
        'Shared decision-making regarding statin therapy',
        'Consider CAC scoring if uncertain',
        'Reassess annually'
      ];
    } else if (risk < 20) {
      riskCategory = 'Intermediate Risk (7.5-19.9%)';
      color = 'text-orange-600';
      bg = 'bg-orange-50';
      ldlTarget = '<100 mg/dL (moderate-intensity statin)';
      recommendations = [
        'Moderate-intensity statin recommended',
        'Lifestyle modifications essential',
        'Consider high-intensity statin if multiple risk factors',
        'Consider aspirin therapy (assess bleeding risk)',
        'Blood pressure control <130/80 mmHg'
      ];
    } else {
      riskCategory = 'High Risk (≥20%)';
      color = 'text-red-600';
      bg = 'bg-red-50';
      ldlTarget = '<70 mg/dL (high-intensity statin)';
      recommendations = [
        'High-intensity statin strongly recommended',
        'Target LDL <70 mg/dL (consider <55 mg/dL)',
        'Add ezetimibe if LDL remains elevated',
        'Consider PCSK9 inhibitor if needed',
        'Aspirin therapy (unless contraindicated)',
        'Aggressive blood pressure control'
      ];
    }

    const followUp = risk >= 20 ? '3-6 months' : 
                    risk >= 7.5 ? '6-12 months' : 
                    '1-2 years';

    return {
      tenYearRisk: risk,
      riskCategory,
      recommendations,
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

  const calculateASCVD = () => {
    const baseRisk = calculatePooledCohortRisk();
    
    if (baseRisk === 0) {
      return;
    }

    const result = generateRecommendations(baseRisk);
    setResult(result);
  };

  const isComplete = inputs.age && inputs.gender && inputs.race && 
                    inputs.totalCholesterol && inputs.hdlCholesterol && 
                    inputs.systolicBP && inputs.treatedHypertension !== '' && 
                    inputs.diabetes !== '' && inputs.smoker !== '';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-full">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">ASCVD Risk Calculator</h2>
              <p className="text-sm text-gray-600">
                2013 ACC/AHA Pooled Cohort Equations for 10-year cardiovascular risk
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900">ASCVD Risk Assessment</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Estimates 10-year risk of heart attack, stroke, or cardiovascular death using the 
                  validated 2013 ACC/AHA Pooled Cohort Equations.
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
                    min="40"
                    max="79"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="45"
                  />
                  <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                    years (40-79)
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
                  <option value="white">White/Non-Hispanic</option>
                  <option value="african-american">African American</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Equations validated for White and African American populations
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Systolic Blood Pressure</label>
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

          {/* Risk Factors */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
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
                        onClick={() => handleInputChange(key as keyof ASCVDInputs, option)}
                        className={`px-3 py-2 rounded-md border text-sm font-medium ${
                          inputs[key as keyof ASCVDInputs] === option
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

          {/* Calculate Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={calculateASCVD}
              disabled={!isComplete}
              className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center space-x-2 ${
                isComplete
                  ? 'bg-red-600 text-white hover:bg-red-700 transition-colors'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Calculator className="w-5 h-5" />
              <span>Calculate ASCVD Risk</span>
            </button>
            {!isComplete && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Please complete all required fields to calculate risk.
              </p>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="mt-8 space-y-6">
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
                </div>

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

                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Important Notes</h5>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Based on 2013 ACC/AHA Pooled Cohort Equations</li>
                    <li>• Validated for White and African American adults 40-79 years</li>
                    <li>• Consider risk enhancers in borderline cases</li>
                    <li>• Assess bleeding risk before starting aspirin</li>
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