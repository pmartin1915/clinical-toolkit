import { useState, useEffect } from 'react';
import { Heart, Info, AlertTriangle, CheckCircle, Calculator } from 'lucide-react';

interface CHA2DS2VAScResult {
  score: number;
  riskLevel: 'low' | 'moderate' | 'high';
  annualStrokeRisk: string;
  recommendation: string;
  anticoagulationRecommended: boolean;
}

export const CHA2DS2VAScCalculator = () => {
  // CHA2DS2-VASc components
  const [congestiveHeartFailure, setCongestiveHeartFailure] = useState(false);
  const [hypertension, setHypertension] = useState(false);
  const [age, setAge] = useState<'under65' | '65to74' | '75plus'>('under65');
  const [diabetes, setDiabetes] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState(false);
  const [vascularDisease, setVascularDisease] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const [result, setResult] = useState<CHA2DS2VAScResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const calculateScore = (): CHA2DS2VAScResult => {
    let score = 0;

    // C - Congestive Heart Failure (1 point)
    if (congestiveHeartFailure) score += 1;

    // H - Hypertension (1 point)
    if (hypertension) score += 1;

    // A2 - Age ≥75 years (2 points), Age 65-74 years (1 point)
    if (age === '75plus') score += 2;
    else if (age === '65to74') score += 1;

    // D - Diabetes Mellitus (1 point)
    if (diabetes) score += 1;

    // S2 - Stroke/TIA/Thromboembolism history (2 points)
    if (strokeHistory) score += 2;

    // V - Vascular disease (1 point)
    if (vascularDisease) score += 1;

    // Sc - Sex category (female) (1 point)
    if (gender === 'female') score += 1;

    // Determine risk level and recommendations
    let riskLevel: 'low' | 'moderate' | 'high';
    let annualStrokeRisk: string;
    let recommendation: string;
    let anticoagulationRecommended: boolean;

    if (score === 0) {
      riskLevel = 'low';
      annualStrokeRisk = '0%';
      recommendation = 'No antithrombotic therapy recommended';
      anticoagulationRecommended = false;
    } else if (score === 1) {
      riskLevel = 'low';
      annualStrokeRisk = '1.3%';
      recommendation = 'Consider oral anticoagulant (males) or no therapy (females if only gender point)';
      anticoagulationRecommended = gender === 'male';
    } else if (score === 2) {
      riskLevel = 'moderate';
      annualStrokeRisk = '2.2%';
      recommendation = 'Oral anticoagulation recommended';
      anticoagulationRecommended = true;
    } else {
      riskLevel = 'high';
      if (score === 3) annualStrokeRisk = '3.2%';
      else if (score === 4) annualStrokeRisk = '4.0%';
      else if (score === 5) annualStrokeRisk = '6.7%';
      else if (score === 6) annualStrokeRisk = '9.8%';
      else if (score === 7) annualStrokeRisk = '9.6%';
      else if (score === 8) annualStrokeRisk = '6.7%';
      else annualStrokeRisk = '15.2%';
      
      recommendation = 'Oral anticoagulation strongly recommended';
      anticoagulationRecommended = true;
    }

    return {
      score,
      riskLevel,
      annualStrokeRisk,
      recommendation,
      anticoagulationRecommended
    };
  };

  useEffect(() => {
    setResult(calculateScore());
  }, [congestiveHeartFailure, hypertension, age, diabetes, strokeHistory, vascularDisease, gender]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return CheckCircle;
      case 'moderate': return Info;
      case 'high': return AlertTriangle;
      default: return Info;
    }
  };

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
              <h2 className="text-xl font-bold text-gray-900">CHA₂DS₂-VASc Score Calculator</h2>
              <p className="text-sm text-gray-600">
                Stroke risk assessment for atrial fibrillation patients
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
                <div className="space-y-4">
                  {/* Congestive Heart Failure */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Congestive Heart Failure
                      </label>
                      <p className="text-xs text-gray-500">History of heart failure or reduced LVEF</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">+1</span>
                      <input
                        type="checkbox"
                        checked={congestiveHeartFailure}
                        onChange={(e) => setCongestiveHeartFailure(e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* Hypertension */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Hypertension
                      </label>
                      <p className="text-xs text-gray-500">History of hypertension or BP ≥140/90</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">+1</span>
                      <input
                        type="checkbox"
                        checked={hypertension}
                        onChange={(e) => setHypertension(e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age Category
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'under65', label: 'Under 65 years', points: 0 },
                        { value: '65to74', label: '65-74 years', points: 1 },
                        { value: '75plus', label: '75+ years', points: 2 }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="age"
                            value={option.value}
                            checked={age === option.value}
                            onChange={(e) => setAge(e.target.value as any)}
                            className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                          <span className="text-xs text-gray-500">+{option.points}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Diabetes */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Diabetes Mellitus
                      </label>
                      <p className="text-xs text-gray-500">History of diabetes or HbA1c ≥6.5%</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">+1</span>
                      <input
                        type="checkbox"
                        checked={diabetes}
                        onChange={(e) => setDiabetes(e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* Stroke History */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Stroke/TIA/Thromboembolism
                      </label>
                      <p className="text-xs text-gray-500">Previous stroke, TIA, or systemic embolism</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">+2</span>
                      <input
                        type="checkbox"
                        checked={strokeHistory}
                        onChange={(e) => setStrokeHistory(e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* Vascular Disease */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Vascular Disease
                      </label>
                      <p className="text-xs text-gray-500">MI, PAD, or aortic plaque</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">+1</span>
                      <input
                        type="checkbox"
                        checked={vascularDisease}
                        onChange={(e) => setVascularDisease(e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sex Category
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'male', label: 'Male', points: 0 },
                        { value: 'female', label: 'Female', points: 1 }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="gender"
                            value={option.value}
                            checked={gender === option.value}
                            onChange={(e) => setGender(e.target.value as any)}
                            className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                          <span className="text-xs text-gray-500">+{option.points}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {result && (
                <>
                  {/* Score Display */}
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Calculator className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">CHA₂DS₂-VASc Score</h3>
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">{result.score}</div>
                    <div className="text-sm text-gray-600">out of 9 points</div>
                  </div>

                  {/* Risk Assessment */}
                  <div className={`rounded-lg p-4 border ${getRiskColor(result.riskLevel)}`}>
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const RiskIcon = getRiskIcon(result.riskLevel);
                        return <RiskIcon className="w-6 h-6" />;
                      })()}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg capitalize">{result.riskLevel} Risk</h4>
                        <p className="text-sm">Annual stroke risk: {result.annualStrokeRisk}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Clinical Recommendation</h4>
                    <p className="text-sm text-gray-700 mb-3">{result.recommendation}</p>
                    
                    {result.anticoagulationRecommended && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <h5 className="font-medium text-blue-900 mb-1">Anticoagulation Options</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Direct oral anticoagulants (DOACs): apixaban, rivaroxaban, dabigatran</li>
                          <li>• Warfarin (target INR 2.0-3.0)</li>
                          <li>• Consider bleeding risk (HAS-BLED score)</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Info className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {showDetails ? 'Hide' : 'Show'} Clinical Details
                      </span>
                    </button>
                    
                    {showDetails && (
                      <div className="mt-4 space-y-3 text-sm text-gray-700">
                        <div>
                          <h5 className="font-medium text-gray-900">Score Interpretation:</h5>
                          <ul className="mt-1 space-y-1 text-xs">
                            <li>• Score 0: Very low risk, no anticoagulation</li>
                            <li>• Score 1: Low risk, consider anticoagulation (males)</li>
                            <li>• Score ≥2: Moderate-high risk, anticoagulation recommended</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900">Guidelines:</h5>
                          <p className="text-xs">
                            Based on 2020 AHA/ACC/HRS Atrial Fibrillation Guidelines and 
                            2020 ESC Atrial Fibrillation Guidelines
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900">Important Notes:</h5>
                          <ul className="mt-1 space-y-1 text-xs">
                            <li>• Consider bleeding risk before starting anticoagulation</li>
                            <li>• Reassess periodically as risk factors may change</li>
                            <li>• Shared decision-making with patient is essential</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};