import { useState } from 'react';
import { Heart, AlertTriangle } from 'lucide-react';

interface ASCVDInputs {
  age: string;
  gender: 'male' | 'female' | '';
  race: 'white' | 'african-american' | 'other' | '';
  totalCholesterol: string;
  hdl: string;
  systolicBP: string;
  treatedHypertension: 'yes' | 'no' | '';
  diabetes: 'yes' | 'no' | '';
  smoker: 'yes' | 'no' | '';
}

export const ASCVDCalculator = () => {
  const [inputs, setInputs] = useState<ASCVDInputs>({
    age: '',
    gender: '',
    race: '',
    totalCholesterol: '',
    hdl: '',
    systolicBP: '',
    treatedHypertension: '',
    diabetes: '',
    smoker: '',
  });

  const [result, setResult] = useState<{
    risk: number;
    riskCategory: string;
    recommendation: string;
    color: string;
    bg: string;
  } | null>(null);

  const handleInputChange = (field: keyof ASCVDInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculateASCVD = () => {
    // Simplified ASCVD risk calculation (actual formula is more complex)
    const age = parseInt(inputs.age);
    const tc = parseInt(inputs.totalCholesterol);
    const hdl = parseInt(inputs.hdl);
    const sbp = parseInt(inputs.systolicBP);

    if (!age || !tc || !hdl || !sbp || !inputs.gender || !inputs.race) {
      return;
    }

    // Base risk factors (simplified)
    let risk = 0;

    // Age contribution
    if (inputs.gender === 'male') {
      risk += Math.max(0, (age - 20) * 0.8);
    } else {
      risk += Math.max(0, (age - 20) * 0.6);
    }

    // Cholesterol ratio
    const cholesterolRatio = tc / hdl;
    if (cholesterolRatio > 5) risk += 5;
    else if (cholesterolRatio > 4) risk += 3;
    else if (cholesterolRatio > 3.5) risk += 1;

    // Blood pressure
    if (sbp > 180) risk += 8;
    else if (sbp > 160) risk += 6;
    else if (sbp > 140) risk += 4;
    else if (sbp > 130) risk += 2;

    // Risk factors
    if (inputs.treatedHypertension === 'yes') risk += 2;
    if (inputs.diabetes === 'yes') risk += 6;
    if (inputs.smoker === 'yes') risk += 4;

    // Race modifier
    if (inputs.race === 'african-american') risk += 2;

    // Gender modifier
    if (inputs.gender === 'male') risk += 3;

    // Cap and convert to percentage
    risk = Math.min(risk, 50);
    risk = Math.max(risk * 0.5, 1);

    let riskCategory, recommendation, color, bg;

    if (risk < 5) {
      riskCategory = 'Low Risk';
      recommendation = 'Lifestyle modifications. Consider statin if LDL ≥190 mg/dL.';
      color = 'text-green-600';
      bg = 'bg-green-50';
    } else if (risk < 7.5) {
      riskCategory = 'Borderline Risk';
      recommendation = 'Lifestyle modifications. Discuss statin therapy benefits/risks.';
      color = 'text-yellow-600';
      bg = 'bg-yellow-50';
    } else if (risk < 20) {
      riskCategory = 'Intermediate Risk';
      recommendation = 'Moderate-intensity statin recommended. Lifestyle modifications.';
      color = 'text-orange-600';
      bg = 'bg-orange-50';
    } else {
      riskCategory = 'High Risk';
      recommendation = 'High-intensity statin strongly recommended. Aggressive lifestyle modifications.';
      color = 'text-red-600';
      bg = 'bg-red-50';
    }

    setResult({
      risk: Math.round(risk * 10) / 10,
      riskCategory,
      recommendation,
      color,
      bg,
    });
  };

  const isComplete = Object.values(inputs).every(value => value !== '');

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Heart className="w-5 h-5 text-red-500" />
        <h3 className="text-xl font-semibold text-gray-900">ASCVD Risk Calculator</h3>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-blue-800 text-sm">
          <strong>Purpose:</strong> Estimates 10-year atherosclerotic cardiovascular disease (ASCVD) risk 
          including coronary death, nonfatal myocardial infarction, and fatal/nonfatal stroke.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Demographics */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Demographics</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <div className="flex">
              <input
                type="number"
                value={inputs.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                min="20"
                max="79"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="45"
              />
              <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                years
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <div className="flex space-x-4">
              {['male', 'female'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleInputChange('gender', option as 'male' | 'female')}
                  className={`px-4 py-2 rounded-md border text-sm font-medium ${
                    inputs.gender === option
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Race</label>
            <select
              value={inputs.race}
              onChange={(e) => handleInputChange('race', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select race</option>
              <option value="white">White</option>
              <option value="african-american">African American</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Clinical Values */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Clinical Values</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Cholesterol</label>
            <div className="flex">
              <input
                type="number"
                value={inputs.totalCholesterol}
                onChange={(e) => handleInputChange('totalCholesterol', e.target.value)}
                min="130"
                max="320"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="200"
              />
              <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                mg/dL
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HDL Cholesterol</label>
            <div className="flex">
              <input
                type="number"
                value={inputs.hdl}
                onChange={(e) => handleInputChange('hdl', e.target.value)}
                min="20"
                max="100"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="50"
              />
              <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                mg/dL
              </span>
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="120"
              />
              <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                mmHg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-4">Risk Factors</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'treatedHypertension', label: 'Taking BP medication?' },
            { key: 'diabetes', label: 'Diabetes?' },
            { key: 'smoker', label: 'Current smoker?' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="flex space-x-2">
                {['yes', 'no'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleInputChange(key as keyof ASCVDInputs, option)}
                    className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium ${
                      inputs[key as keyof ASCVDInputs] === option
                        ? 'bg-primary-100 border-primary-500 text-primary-700'
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
      <div className="mb-6">
        <button
          onClick={calculateASCVD}
          disabled={!isComplete}
          className={`w-full py-3 px-4 rounded-md font-medium ${
            isComplete
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Calculate 10-Year ASCVD Risk
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`p-6 rounded-md ${result.bg}`}>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {result.risk}%
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${result.bg} ${result.color}`}>
              {result.riskCategory}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <AlertTriangle className={`w-4 h-4 mt-0.5 ${result.color}`} />
              <div>
                <span className="font-medium">Recommendation: </span>
                {result.recommendation}
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-gray-700 text-xs">
                <strong>Disclaimer:</strong> This is a simplified calculation for educational purposes. 
                Use the official AHA/ACC Pooled Cohort Risk Calculator for clinical decisions. 
                Consider additional risk enhancers (family history, CAC score, etc.).
              </p>
            </div>
          </div>
        </div>
      )}

      {!isComplete && (
        <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            Please complete all fields to calculate ASCVD risk.
          </p>
        </div>
      )}
    </div>
  );
};