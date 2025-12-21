import { useState, useEffect, useCallback } from 'react';
import { Droplets, Calculator, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface CrClResult {
  crcl: number;
  interpretation: string;
  riskLevel: 'normal' | 'mild' | 'moderate' | 'severe';
  recommendations: string[];
  drugAdjustments: string[];
}

export const CreatinineClearanceCalculator = () => {
  const [creatinine, setCreatinine] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [units, setUnits] = useState<'mg/dL' | 'μmol/L'>('mg/dL');
  const [weightUnits, setWeightUnits] = useState<'kg' | 'lbs'>('kg');

  const [result, setResult] = useState<CrClResult | null>(null);
  const [showDrugGuidance, setShowDrugGuidance] = useState(false);

  const calculateCrCl = useCallback((): CrClResult | null => {
    const creatinineNum = parseFloat(creatinine);
    const ageNum = parseInt(age);
    let weightNum = parseFloat(weight);

    if (!creatinineNum || !ageNum || !weightNum || ageNum < 18) return null;

    // Convert weight to kg if needed
    if (weightUnits === 'lbs') {
      weightNum = weightNum * 0.453592; // lbs to kg
    }

    // Convert creatinine to mg/dL if needed
    let creatinineMgDl = creatinineNum;
    if (units === 'μmol/L') {
      creatinineMgDl = creatinineNum / 88.4; // μmol/L to mg/dL
    }

    // Cockcroft-Gault formula
    let crcl = ((140 - ageNum) * weightNum) / (72 * creatinineMgDl);

    // Apply female correction factor
    if (gender === 'female') {
      crcl *= 0.85;
    }

    // Round to 1 decimal place
    crcl = Math.round(crcl * 10) / 10;

    // Determine interpretation and recommendations
    let interpretation: string;
    let riskLevel: CrClResult['riskLevel'];
    let recommendations: string[];
    let drugAdjustments: string[];

    if (crcl >= 60) {
      interpretation = 'Normal kidney function';
      riskLevel = 'normal';
      recommendations = [
        'No dose adjustments typically needed for renally cleared drugs',
        'Continue routine monitoring',
        'Maintain healthy lifestyle habits'
      ];
      drugAdjustments = ['No dose adjustments typically needed'];
    } else if (crcl >= 30) {
      interpretation = 'Mild to moderate kidney impairment';
      riskLevel = 'mild';
      recommendations = [
        'Monitor kidney function regularly',
        'Review medications for renal clearance',
        'Consider nephrology consultation',
        'Control blood pressure and blood sugar'
      ];
      drugAdjustments = [
        'Dose adjust medications cleared by kidneys',
        'Monitor drug levels more frequently',
        'Avoid nephrotoxic medications when possible'
      ];
    } else if (crcl >= 15) {
      interpretation = 'Severe kidney impairment';
      riskLevel = 'moderate';
      recommendations = [
        'Nephrology referral recommended',
        'Frequent monitoring of kidney function',
        'Careful medication review required',
        'Monitor for complications (anemia, bone disease)'
      ];
      drugAdjustments = [
        'Significant dose reductions required',
        'Avoid many renally cleared medications',
        'Consider alternative medications',
        'Frequent monitoring of drug levels'
      ];
    } else {
      interpretation = 'Kidney failure - dialysis likely needed';
      riskLevel = 'severe';
      recommendations = [
        'Immediate nephrology care required',
        'Consider dialysis or transplant preparation',
        'Comprehensive medication review',
        'Monitor all organ systems'
      ];
      drugAdjustments = [
        'Extensive medication adjustments required',
        'Many drugs contraindicated or require special dosing',
        'Dialysis considerations for drug dosing',
        'Specialist pharmacy consultation essential'
      ];
    }

    return {
      crcl,
      interpretation,
      riskLevel,
      recommendations,
      drugAdjustments
    };
  }, [creatinine, age, weight, gender, units, weightUnits]);

  useEffect(() => {
    setResult(calculateCrCl());
  }, [calculateCrCl]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'mild': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'severe': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'normal': return CheckCircle;
      case 'mild': return Info;
      case 'moderate': return AlertTriangle;
      case 'severe': return AlertTriangle;
      default: return Info;
    }
  };

  const commonDrugAdjustments = [
    {
      drug: 'Metformin',
      crcl30to50: 'Reduce dose by 50%',
      crclUnder30: 'Contraindicated',
      notes: 'Risk of lactic acidosis'
    },
    {
      drug: 'ACE Inhibitors',
      crcl30to50: 'Monitor closely, reduce dose',
      crclUnder30: 'Use with caution',
      notes: 'Monitor K+ and creatinine'
    },
    {
      drug: 'Digoxin',
      crcl30to50: 'Reduce dose by 25-50%',
      crclUnder30: 'Reduce dose by 50%',
      notes: 'Monitor drug levels'
    },
    {
      drug: 'Gabapentin',
      crcl30to50: 'Reduce dose',
      crclUnder30: 'Significant reduction',
      notes: 'Renally cleared'
    },
    {
      drug: 'NSAIDs',
      crcl30to50: 'Use with caution',
      crclUnder30: 'Avoid if possible',
      notes: 'Can worsen kidney function'
    },
    {
      drug: 'Vancomycin',
      crcl30to50: 'Monitor levels closely',
      crclUnder30: 'Extended dosing interval',
      notes: 'Individualized dosing required'
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
              <h2 className="text-xl font-bold text-gray-900">Creatinine Clearance Calculator</h2>
              <p className="text-sm text-gray-600">
                Estimated creatinine clearance using Cockcroft-Gault equation
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

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={weightUnits === 'kg' ? '70' : '154'}
                        aria-label="Weight value"
                      />
                      <select
                        value={weightUnits}
                        onChange={(e) => setWeightUnits(e.target.value as 'kg' | 'lbs')}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Weight units"
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
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
                  {/* CrCl Display */}
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Calculator className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Creatinine Clearance</h3>
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">{result.crcl}</div>
                    <div className="text-sm text-gray-600">mL/min</div>
                    <div className="text-sm text-gray-500 mt-2">{result.interpretation}</div>
                  </div>

                  {/* Risk Level */}
                  <div className={`rounded-lg p-4 border ${getRiskColor(result.riskLevel)}`}>
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const RiskIcon = getRiskIcon(result.riskLevel);
                        return <RiskIcon className="w-6 h-6" />;
                      })()}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">Kidney Function Status</h4>
                        <p className="text-sm">{result.interpretation}</p>
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
                              <th className="text-left py-2 font-medium text-gray-700">CrCl 30-50</th>
                              <th className="text-left py-2 font-medium text-gray-700">CrCl {"<"}30</th>
                              <th className="text-left py-2 font-medium text-gray-700">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {commonDrugAdjustments.map((drug, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="py-2 font-medium text-gray-900">{drug.drug}</td>
                                <td className="py-2 text-gray-700">{drug.crcl30to50}</td>
                                <td className="py-2 text-gray-700">{drug.crclUnder30}</td>
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
                      <li>• Uses Cockcroft-Gault equation (most common for drug dosing)</li>
                      <li>• Not validated for patients under 18 years</li>
                      <li>• May be less accurate in extremes of body weight</li>
                      <li>• Consider 24-hour urine creatinine clearance for precision</li>
                      <li>• Ideal body weight may be more accurate than actual weight</li>
                      <li>• For obese patients, consider using adjusted body weight</li>
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
