import { useState, useEffect } from 'react';
import { Zap, Heart, AlertTriangle, CheckCircle, Info, Calculator } from 'lucide-react';

interface WellsResult {
  score: number;
  riskLevel: 'low' | 'moderate' | 'high';
  preTestProbability: string;
  recommendation: string;
  nextSteps: string[];
  dDimerUtility: string;
}

export const WellsScore = () => {
  // Wells PE Score criteria
  const [clinicalSigns, setClinicalSigns] = useState(false);
  const [alternativeDiagnosis, setAlternativeDiagnosis] = useState(false);
  const [heartRate, setHeartRate] = useState(false);
  const [immobilization, setImmobilization] = useState(false);
  const [previousPE, setPreviousPE] = useState(false);
  const [hemoptysis, setHemoptysis] = useState(false);
  const [malignancy, setMalignancy] = useState(false);

  // DVT criteria (toggle between PE and DVT)
  const [assessmentType, setAssessmentType] = useState<'PE' | 'DVT'>('PE');
  
  // DVT-specific criteria
  const [calfSwelling, setCalfSwelling] = useState(false);
  const [superficialVeins, setSuperficialVeins] = useState(false);
  const [entireLegSwelling, setEntireLegSwelling] = useState(false);
  const [localizedTenderness, setLocalizedTenderness] = useState(false);
  const [pittingEdema, setPittingEdema] = useState(false);
  const [previousDVT, setPreviousDVT] = useState(false);
  const [paralysisParesis, setParalysisParesis] = useState(false);
  const [bedridden, setBedridden] = useState(false);

  const [result, setResult] = useState<WellsResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const calculatePEScore = (): WellsResult => {
    let score = 0;

    // Clinical signs and symptoms of DVT (3 points)
    if (clinicalSigns) score += 3;

    // PE is #1 diagnosis OR equally likely (3 points)
    if (!alternativeDiagnosis) score += 3;

    // Heart rate >100 (1.5 points)
    if (heartRate) score += 1.5;

    // Immobilization or surgery in previous 4 weeks (1.5 points)
    if (immobilization) score += 1.5;

    // Previous PE or DVT (1.5 points)
    if (previousPE) score += 1.5;

    // Hemoptysis (1 point)
    if (hemoptysis) score += 1;

    // Malignancy with treatment within 6 months or palliative (1 point)
    if (malignancy) score += 1;

    // Determine risk level and recommendations
    let riskLevel: 'low' | 'moderate' | 'high';
    let preTestProbability: string;
    let recommendation: string;
    let nextSteps: string[];
    let dDimerUtility: string;

    if (score <= 4) {
      riskLevel = 'low';
      preTestProbability = '12.1%';
      recommendation = 'PE unlikely - Consider D-dimer';
      nextSteps = [
        'Obtain D-dimer',
        'If D-dimer negative: PE excluded',
        'If D-dimer positive: Proceed to CT-PA',
        'Consider alternative diagnoses'
      ];
      dDimerUtility = 'High negative predictive value in this group';
    } else if (score <= 6) {
      riskLevel = 'moderate';
      preTestProbability = '37.1%';
      recommendation = 'PE likely - Consider imaging';
      nextSteps = [
        'Consider CT pulmonary angiogram (CT-PA)',
        'D-dimer less useful (high false positive rate)',
        'If CT-PA negative, consider V/Q scan',
        'Start anticoagulation if high clinical suspicion'
      ];
      dDimerUtility = 'Limited utility due to high false positive rate';
    } else {
      riskLevel = 'high';
      preTestProbability = '59.0%';
      recommendation = 'PE very likely - Proceed to imaging';
      nextSteps = [
        'Obtain CT pulmonary angiogram (CT-PA) urgently',
        'Consider empiric anticoagulation while awaiting results',
        'If CT-PA contraindicated, consider V/Q scan',
        'Evaluate for hemodynamic instability'
      ];
      dDimerUtility = 'Not recommended - proceed directly to imaging';
    }

    return {
      score,
      riskLevel,
      preTestProbability,
      recommendation,
      nextSteps,
      dDimerUtility
    };
  };

  const calculateDVTScore = (): WellsResult => {
    let score = 0;

    // Active cancer (1 point)
    if (malignancy) score += 1;

    // Calf swelling >3cm compared to asymptomatic leg (1 point)
    if (calfSwelling) score += 1;

    // Collateral superficial veins (1 point)
    if (superficialVeins) score += 1;

    // Pitting edema (1 point)
    if (pittingEdema) score += 1;

    // Previous DVT (1 point)
    if (previousDVT) score += 1;

    // Swelling of entire leg (1 point)
    if (entireLegSwelling) score += 1;

    // Localized tenderness along deep venous system (1 point)
    if (localizedTenderness) score += 1;

    // Paralysis, paresis, or recent plaster immobilization (1 point)
    if (paralysisParesis) score += 1;

    // Bedridden >3 days or major surgery within 4 weeks (1 point)
    if (bedridden) score += 1;

    // Alternative diagnosis as likely or greater than DVT (-2 points)
    if (alternativeDiagnosis) score -= 2;

    // Determine risk level and recommendations
    let riskLevel: 'low' | 'moderate' | 'high';
    let preTestProbability: string;
    let recommendation: string;
    let nextSteps: string[];
    let dDimerUtility: string;

    if (score <= 0) {
      riskLevel = 'low';
      preTestProbability = '5.0%';
      recommendation = 'DVT unlikely - Consider D-dimer';
      nextSteps = [
        'Obtain D-dimer',
        'If D-dimer negative: DVT excluded',
        'If D-dimer positive: Proceed to duplex ultrasound',
        'Consider alternative diagnoses'
      ];
      dDimerUtility = 'Excellent negative predictive value';
    } else if (score <= 2) {
      riskLevel = 'moderate';
      preTestProbability = '17.0%';
      recommendation = 'Moderate probability - Consider imaging';
      nextSteps = [
        'Consider duplex ultrasound',
        'D-dimer may be helpful if negative',
        'If ultrasound negative, consider repeat in 1 week',
        'Evaluate for alternative diagnoses'
      ];
      dDimerUtility = 'May be helpful if negative';
    } else {
      riskLevel = 'high';
      preTestProbability = '53.0%';
      recommendation = 'DVT likely - Proceed to imaging';
      nextSteps = [
        'Obtain duplex ultrasound',
        'Consider empiric anticoagulation if delayed imaging',
        'If ultrasound negative, consider repeat or alternative imaging',
        'Evaluate for proximal extension'
      ];
      dDimerUtility = 'Not recommended - proceed directly to imaging';
    }

    return {
      score,
      riskLevel,
      preTestProbability,
      recommendation,
      nextSteps,
      dDimerUtility
    };
  };

  useEffect(() => {
    if (assessmentType === 'PE') {
      setResult(calculatePEScore());
    } else {
      setResult(calculateDVTScore());
    }
  }, [
    assessmentType, clinicalSigns, alternativeDiagnosis, heartRate, immobilization, 
    previousPE, hemoptysis, malignancy, calfSwelling, superficialVeins, 
    entireLegSwelling, localizedTenderness, pittingEdema, previousDVT, 
    paralysisParesis, bedridden
  ]);

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
      case 'moderate': return AlertTriangle;
      case 'high': return AlertTriangle;
      default: return Info;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Wells Score Calculator</h2>
              <p className="text-sm text-gray-600">
                Clinical prediction rule for pulmonary embolism and deep vein thrombosis
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Assessment Type Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Assessment Type</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setAssessmentType('PE')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  assessmentType === 'PE'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Pulmonary Embolism</span>
              </button>
              <button
                onClick={() => setAssessmentType('DVT')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  assessmentType === 'DVT'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Deep Vein Thrombosis</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Criteria Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {assessmentType === 'PE' ? 'PE Wells Score Criteria' : 'DVT Wells Score Criteria'}
                </h3>
                
                {assessmentType === 'PE' ? (
                  <div className="space-y-4">
                    {/* PE Criteria */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Clinical signs and symptoms of DVT
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum of leg swelling and pain with palpation of deep veins
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+3</span>
                        <input
                          type="checkbox"
                          checked={clinicalSigns}
                          onChange={(e) => setClinicalSigns(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          PE is #1 diagnosis OR equally likely
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          No alternative diagnosis more likely than PE
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+3</span>
                        <input
                          type="checkbox"
                          checked={!alternativeDiagnosis}
                          onChange={(e) => setAlternativeDiagnosis(!e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Heart rate &gt;100 bpm
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Tachycardia at presentation
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1.5</span>
                        <input
                          type="checkbox"
                          checked={heartRate}
                          onChange={(e) => setHeartRate(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Immobilization or surgery in previous 4 weeks
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Bedridden &gt;3 days or major surgery within 4 weeks
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1.5</span>
                        <input
                          type="checkbox"
                          checked={immobilization}
                          onChange={(e) => setImmobilization(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Previous PE or DVT
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          History of venous thromboembolism
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1.5</span>
                        <input
                          type="checkbox"
                          checked={previousPE}
                          onChange={(e) => setPreviousPE(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Hemoptysis
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Coughing up blood
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1</span>
                        <input
                          type="checkbox"
                          checked={hemoptysis}
                          onChange={(e) => setHemoptysis(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Malignancy
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Treatment within 6 months or palliative care
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1</span>
                        <input
                          type="checkbox"
                          checked={malignancy}
                          onChange={(e) => setMalignancy(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* DVT Criteria */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Active cancer
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Treatment ongoing or within 6 months or palliative
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1</span>
                        <input
                          type="checkbox"
                          checked={malignancy}
                          onChange={(e) => setMalignancy(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Calf swelling &gt;3cm compared to asymptomatic leg
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Measured 10cm below tibial tuberosity
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1</span>
                        <input
                          type="checkbox"
                          checked={calfSwelling}
                          onChange={(e) => setCalfSwelling(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Collateral superficial veins (non-varicose)
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Present in symptomatic leg
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1</span>
                        <input
                          type="checkbox"
                          checked={superficialVeins}
                          onChange={(e) => setSuperficialVeins(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Pitting edema
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Confined to symptomatic leg
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1</span>
                        <input
                          type="checkbox"
                          checked={pittingEdema}
                          onChange={(e) => setPittingEdema(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Swelling of entire leg
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Thigh and calf involvement
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1</span>
                        <input
                          type="checkbox"
                          checked={entireLegSwelling}
                          onChange={(e) => setEntireLegSwelling(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Localized tenderness along deep venous system
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Distribution of deep veins
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1</span>
                        <input
                          type="checkbox"
                          checked={localizedTenderness}
                          onChange={(e) => setLocalizedTenderness(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Previous DVT
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Previous documented DVT
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1</span>
                        <input
                          type="checkbox"
                          checked={previousDVT}
                          onChange={(e) => setPreviousDVT(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Paralysis, paresis, or recent plaster immobilization
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Of lower extremities
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1</span>
                        <input
                          type="checkbox"
                          checked={paralysisParesis}
                          onChange={(e) => setParalysisParesis(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Bedridden &gt;3 days or major surgery within 4 weeks
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Recently bedridden or major surgery
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">+1</span>
                        <input
                          type="checkbox"
                          checked={bedridden}
                          onChange={(e) => setBedridden(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Alternative diagnosis as likely or greater than DVT
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Another diagnosis more likely
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <span className="text-sm text-gray-600">-2</span>
                        <input
                          type="checkbox"
                          checked={alternativeDiagnosis}
                          onChange={(e) => setAlternativeDiagnosis(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                      <h3 className="text-lg font-semibold text-gray-900">Wells Score</h3>
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">{result.score}</div>
                    <div className="text-sm text-gray-600">points</div>
                  </div>

                  {/* Risk Assessment */}
                  <div className={`rounded-lg p-4 border ${getRiskColor(result.riskLevel)}`}>
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const RiskIcon = getRiskIcon(result.riskLevel);
                        return <RiskIcon className="w-6 h-6" />;
                      })()}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg capitalize">{result.riskLevel} Probability</h4>
                        <p className="text-sm">Pre-test probability: {result.preTestProbability}</p>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Recommendation */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Clinical Recommendation</h4>
                    <p className="text-sm text-gray-700 mb-3">{result.recommendation}</p>
                  </div>

                  {/* D-dimer Utility */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">D-dimer Utility</h4>
                    <p className="text-sm text-blue-800">{result.dDimerUtility}</p>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Recommended Next Steps</h4>
                    <ul className="space-y-2">
                      {result.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Clinical Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors w-full text-left"
                    >
                      <Info className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {showDetails ? 'Hide' : 'Show'} Clinical Details & Evidence
                      </span>
                    </button>
                    
                    {showDetails && (
                      <div className="mt-4 space-y-3 text-sm text-gray-700">
                        <div>
                          <h5 className="font-medium text-gray-900">Validation:</h5>
                          <p className="text-xs">
                            {assessmentType === 'PE' 
                              ? 'Validated in multiple studies with >3,000 patients. Originally derived by Wells et al. (2000).'
                              : 'Validated in multiple studies with >2,000 patients. Originally derived by Wells et al. (1997).'
                            }
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900">Limitations:</h5>
                          <ul className="text-xs space-y-1">
                            <li>• Requires clinical judgment for "alternative diagnosis" criterion</li>
                            <li>• Performance may vary in different populations</li>
                            <li>• Should not replace clinical judgment</li>
                            {assessmentType === 'PE' && <li>• Does not apply to patients with high bleeding risk</li>}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900">Important Notes:</h5>
                          <ul className="text-xs space-y-1">
                            <li>• Consider patient factors beyond the score</li>
                            <li>• Age-adjusted D-dimer may improve specificity in elderly</li>
                            <li>• Pregnancy requires modified approach</li>
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