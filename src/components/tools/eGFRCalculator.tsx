import { useState, useEffect, useCallback } from 'react';
import { Droplets, Calculator, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface eGFRResult {
  egfr: number;
  ckdStage: number;
  stageDescription: string;
  riskLevel: 'normal' | 'mild' | 'moderate' | 'severe' | 'kidney-failure';
  recommendations: string[];
  drugAdjustments: string[];
}

export const EGFRCalculator = () => {
  const [creatinine, setCreatinine] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const race = 'other'; // Using race-free CKD-EPI 2021 equation
  const [units, setUnits] = useState<'mg/dL' | 'μmol/L'>('mg/dL');
  
  const [result, setResult] = useState<eGFRResult | null>(null);
  const [showDrugGuidance, setShowDrugGuidance] = useState(false);

  const calculateEGFR = useCallback((): eGFRResult | null => {
    const creatinineNum = parseFloat(creatinine);
    const ageNum = parseInt(age);
    
    if (!creatinineNum || !ageNum || ageNum < 18) return null;

    // Convert μmol/L to mg/dL if needed
    let creatinineMgDl = creatinineNum;
    if (units === 'μmol/L') {
      creatinineMgDl = creatinineNum / 88.4; // Conversion factor
    }

    // CKD-EPI equation (2021 version - race-free)
    const kappa = gender === 'female' ? 0.7 : 0.9;
    const alpha = gender === 'female' ? -0.329 : -0.411;
    const genderMultiplier = gender === 'female' ? 1.018 : 1;

    const minRatio = Math.min(creatinineMgDl / kappa, 1);
    const maxRatio = Math.max(creatinineMgDl / kappa, 1);

    let egfr = 141 * Math.pow(minRatio, alpha) * Math.pow(maxRatio, -1.209) * Math.pow(0.993, ageNum) * genderMultiplier;

    // Round to nearest whole number
    egfr = Math.round(egfr);

    // Determine CKD stage and recommendations
    let ckdStage: number;
    let stageDescription: string;
    let riskLevel: eGFRResult['riskLevel'];
    let recommendations: string[];
    let drugAdjustments: string[];

    if (egfr >= 90) {
      ckdStage = 1;
      stageDescription = 'Normal or High (with kidney damage)';
      riskLevel = 'normal';
      recommendations = [
        'Monitor blood pressure and proteinuria',
        'Maintain healthy lifestyle',
        'Annual kidney function monitoring if risk factors present'
      ];
      drugAdjustments = ['No dose adjustments typically needed'];
    } else if (egfr >= 60) {
      ckdStage = 2;
      stageDescription = 'Mildly Decreased';
      riskLevel = 'mild';
      recommendations = [
        'Monitor progression with annual testing',
        'Control blood pressure (<130/80 mmHg)',
        'Screen for complications',
        'Lifestyle modifications'
      ];
      drugAdjustments = ['Consider dose adjustments for select medications'];
    } else if (egfr >= 45) {
      ckdStage = 3;
      stageDescription = 'Moderately Decreased (3a)';
      riskLevel = 'moderate';
      recommendations = [
        'Monitor every 6-12 months',
        'Evaluate for complications (anemia, bone disease)',
        'Consider nephrology referral',
        'Cardiovascular risk reduction'
      ];
      drugAdjustments = [
        'Dose adjust metformin, ACE inhibitors',
        'Avoid nephrotoxic medications',
        'Monitor drug levels more frequently'
      ];
    } else if (egfr >= 30) {
      ckdStage = 3;
      stageDescription = 'Moderately Decreased (3b)';
      riskLevel = 'moderate';
      recommendations = [
        'Monitor every 3-6 months',
        'Nephrology referral recommended',
        'Prepare for renal replacement therapy',
        'Manage complications (anemia, bone disease, acidosis)'
      ];
      drugAdjustments = [
        'Dose adjust most renally cleared drugs',
        'Avoid metformin if eGFR <30',
        'Consider alternative medications'
      ];
    } else if (egfr >= 15) {
      ckdStage = 4;
      stageDescription = 'Severely Decreased';
      riskLevel = 'severe';
      recommendations = [
        'Monitor every 3 months',
        'Nephrology care essential',
        'Prepare for dialysis or transplant',
        'Manage all CKD complications'
      ];
      drugAdjustments = [
        'Significant dose reductions required',
        'Avoid many medications',
        'Frequent monitoring of drug levels',
        'Consider alternative therapies'
      ];
    } else {
      ckdStage = 5;
      stageDescription = 'Kidney Failure';
      riskLevel = 'kidney-failure';
      recommendations = [
        'Immediate nephrology care',
        'Dialysis or transplant needed',
        'Manage all complications',
        'End-stage renal disease management'
      ];
      drugAdjustments = [
        'Extensive medication review required',
        'Many drugs contraindicated',
        'Dialysis considerations for drug dosing',
        'Specialist pharmacy consultation'
      ];
    }

    return {
      egfr,
      ckdStage,
      stageDescription,
      riskLevel,
      recommendations,
      drugAdjustments
    };
  }, [creatinine, age, gender, race, units]);

  useEffect(() => {
    setResult(calculateEGFR());
  }, [calculateEGFR]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'mild': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'severe': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'kidney-failure': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'normal': return CheckCircle;
      case 'mild': return Info;
      case 'moderate': return AlertTriangle;
      case 'severe': return AlertTriangle;
      case 'kidney-failure': return AlertTriangle;
      default: return Info;
    }
  };

  const commonDrugAdjustments = [
    {
      drug: 'Metformin',
      egfr30to45: 'Reduce dose by 50%',
      egfrUnder30: 'Contraindicated',
      notes: 'Risk of lactic acidosis'
    },
    {
      drug: 'ACE Inhibitors',
      egfr30to45: 'Monitor closely, reduce dose',
      egfrUnder30: 'Use with caution',
      notes: 'Monitor K+ and creatinine'
    },
    {
      drug: 'NSAIDs',
      egfr30to45: 'Use with caution',
      egfrUnder30: 'Avoid if possible',
      notes: 'Can worsen kidney function'
    },
    {
      drug: 'Digoxin',
      egfr30to45: 'Reduce dose by 25-50%',
      egfrUnder30: 'Reduce dose by 50%',
      notes: 'Monitor drug levels'
    },
    {
      drug: 'Gabapentin',
      egfr30to45: 'Reduce dose',
      egfrUnder30: 'Significant reduction',
      notes: 'Renally cleared'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">eGFR Calculator & CKD Staging</h2>
              <p className="text-sm text-gray-600">
                Estimated glomerular filtration rate using CKD-EPI equation (2021)
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                <div className="space-y-4">
                  {/* Creatinine */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serum Creatinine
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.1"
                        value={creatinine}
                        onChange={(e) => setCreatinine(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={units === 'mg/dL' ? '1.0' : '88'}
                        aria-label="Serum creatinine value"
                      />
                      <select
                        value={units}
                        onChange={(e) => setUnits(e.target.value as 'mg/dL' | 'μmol/L')}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Creatinine units"
                      >
                        <option value="mg/dL">mg/dL</option>
                        <option value="μmol/L">μmol/L</option>
                      </select>
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age (years)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="65"
                      min="18"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sex
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="gender"
                            value={option.value}
                            checked={gender === option.value}
                            onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
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
                  {/* eGFR Display */}
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Calculator className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">eGFR Result</h3>
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">{result.egfr}</div>
                    <div className="text-sm text-gray-600">mL/min/1.73m²</div>
                  </div>

                  {/* CKD Stage */}
                  <div className={`rounded-lg p-4 border ${getRiskColor(result.riskLevel)}`}>
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const RiskIcon = getRiskIcon(result.riskLevel);
                        return <RiskIcon className="w-6 h-6" />;
                      })()}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">CKD Stage {result.ckdStage}</h4>
                        <p className="text-sm">{result.stageDescription}</p>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Recommendations */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Clinical Management</h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Drug Adjustments */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-3">Medication Considerations</h4>
                    <ul className="space-y-2 mb-3">
                      {result.drugAdjustments.map((adjustment, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-yellow-800">{adjustment}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => setShowDrugGuidance(!showDrugGuidance)}
                      className="text-sm text-yellow-700 hover:text-yellow-900 font-medium transition-colors"
                    >
                      {showDrugGuidance ? 'Hide' : 'Show'} Specific Drug Dosing Guidelines
                    </button>
                  </div>

                  {/* Drug Dosing Table */}
                  {showDrugGuidance && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Common Drug Adjustments</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 font-medium text-gray-700">Medication</th>
                              <th className="text-left py-2 font-medium text-gray-700">eGFR 30-45</th>
                              <th className="text-left py-2 font-medium text-gray-700">eGFR &lt;30</th>
                              <th className="text-left py-2 font-medium text-gray-700">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {commonDrugAdjustments.map((drug, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="py-2 font-medium text-gray-900">{drug.drug}</td>
                                <td className="py-2 text-gray-700">{drug.egfr30to45}</td>
                                <td className="py-2 text-gray-700">{drug.egfrUnder30}</td>
                                <td className="py-2 text-gray-600 text-xs">{drug.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Always consult specific prescribing information and consider individual patient factors.
                      </p>
                    </div>
                  )}

                  {/* Important Notes */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Important Notes</h5>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Uses CKD-EPI 2021 equation (race-free)</li>
                      <li>• Not validated for patients under 18 years</li>
                      <li>• May be less accurate in extremes of body size</li>
                      <li>• Consider cystatin C for more accurate assessment</li>
                      <li>• CKD requires evidence of kidney damage for stages 1-2</li>
                    </ul>
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