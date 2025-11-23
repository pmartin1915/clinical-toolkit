import { useState, useEffect, useCallback } from 'react';
import { Bone, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface OttawaResult {
  recommendXray: boolean;
  riskLevel: 'low' | 'moderate' | 'high';
  interpretation: string;
  sensitivity: string;
  nextSteps: string[];
}

export const OttawaAnkleRules = () => {
  // Ankle Series Criteria
  const [ankleBoneTenderness, setAnkleBoneTenderness] = useState(false);
  const [ankleBearWeight, setAnkleBearWeight] = useState(false);
  
  // Foot Series Criteria  
  const [footBoneTenderness, setFootBoneTenderness] = useState(false);
  const [footBearWeight, setFootBearWeight] = useState(false);
  
  const [result, setResult] = useState<OttawaResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const calculateResult = useCallback((): OttawaResult => {
    // X-ray is indicated if ANY criteria are positive
    const ankleCriteria = ankleBoneTenderness || ankleBearWeight;
    const footCriteria = footBoneTenderness || footBearWeight;
    const recommendXray = ankleCriteria || footCriteria;

    let riskLevel: 'low' | 'moderate' | 'high';
    let interpretation: string;
    let nextSteps: string[];

    if (!recommendXray) {
      riskLevel = 'low';
      interpretation = 'No X-ray required. Risk of fracture is very low (<1%).';
      nextSteps = [
        'Provide supportive care (rest, ice, elevation)',
        'Prescribe analgesics as needed',
        'Advise weight-bearing as tolerated',
        'Return if symptoms worsen or persist >5-7 days',
        'Consider physiotherapy referral'
      ];
    } else {
      const criteriaCount = [ankleBoneTenderness, ankleBearWeight, footBoneTenderness, footBearWeight].filter(Boolean).length;
      
      if (criteriaCount === 1) {
        riskLevel = 'moderate';
        interpretation = 'X-ray recommended. Single positive criterion indicates moderate fracture risk.';
      } else {
        riskLevel = 'high';
        interpretation = 'X-ray strongly recommended. Multiple positive criteria indicate higher fracture risk.';
      }
      
      nextSteps = [
        'Obtain appropriate X-ray series (ankle and/or foot)',
        'Provide immobilization until X-ray results',
        'Administer appropriate analgesia',
        'If fracture confirmed, refer to orthopedics',
        'If X-ray negative, provide conservative management'
      ];
    }

    return {
      recommendXray,
      riskLevel,
      interpretation,
      sensitivity: '96-99%',
      nextSteps
    };
  }, [ankleBoneTenderness, ankleBearWeight, footBoneTenderness, footBearWeight]);

  useEffect(() => {
    setResult(calculateResult());
  }, [calculateResult]);

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Bone className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ottawa Ankle Rules</h2>
              <p className="text-sm text-gray-600">
                Clinical decision rule for ankle and foot X-ray requirements
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Assessment Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Assessment</h3>
                
                {/* Ankle Series */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                    Ankle Series Indications
                  </h4>
                  <div className="space-y-4 ml-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Bone tenderness at posterior edge or tip of lateral malleolus
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Tenderness along the distal 6 cm of the posterior edge or tip of the lateral malleolus
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={ankleBoneTenderness}
                        onChange={(e) => setAnkleBoneTenderness(e.target.checked)}
                        className="ml-3 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Bone tenderness at posterior edge or tip of medial malleolus
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Tenderness along the distal 6 cm of the posterior edge or tip of the medial malleolus
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={ankleBoneTenderness}
                        onChange={(e) => setAnkleBoneTenderness(e.target.checked)}
                        className="ml-3 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Unable to bear weight both immediately and in ED
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Unable to take 4 steps both immediately after injury and in the emergency department
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={ankleBearWeight}
                        onChange={(e) => setAnkleBearWeight(e.target.checked)}
                        className="ml-3 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Foot Series */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                    Foot Series Indications
                  </h4>
                  <div className="space-y-4 ml-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Bone tenderness at base of 5th metatarsal
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Tenderness at the base of the fifth metatarsal (zone of insertion of peroneus brevis)
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={footBoneTenderness}
                        onChange={(e) => setFootBoneTenderness(e.target.checked)}
                        className="ml-3 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Bone tenderness at navicular
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Tenderness at the navicular bone (medial midfoot)
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={footBoneTenderness}
                        onChange={(e) => setFootBoneTenderness(e.target.checked)}
                        className="ml-3 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Unable to bear weight both immediately and in ED
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Unable to take 4 steps both immediately after injury and in the emergency department
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={footBearWeight}
                        onChange={(e) => setFootBearWeight(e.target.checked)}
                        className="ml-3 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {result && (
                <>
                  {/* Recommendation */}
                  <div className={`rounded-lg p-6 border ${getRiskColor(result.riskLevel)}`}>
                    <div className="flex items-center space-x-3 mb-4">
                      {(() => {
                        const RiskIcon = getRiskIcon(result.riskLevel);
                        return <RiskIcon className="w-8 h-8" />;
                      })()}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">
                          {result.recommendXray ? 'X-ray Recommended' : 'No X-ray Required'}
                        </h3>
                        <p className="text-sm opacity-90">
                          {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} fracture risk
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{result.interpretation}</p>
                  </div>

                  {/* Rule Performance */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Rule Performance</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Sensitivity:</span>
                        <span className="ml-2 text-blue-700">{result.sensitivity}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Specificity:</span>
                        <span className="ml-2 text-blue-700">30-40%</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      High sensitivity means fractures are rarely missed when rules are negative
                    </p>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Recommended Management</h4>
                    <ul className="space-y-2">
                      {result.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors w-full text-left"
                    >
                      <Info className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {showDetails ? 'Hide' : 'Show'} Clinical Details & Limitations
                      </span>
                    </button>
                    
                    {showDetails && (
                      <div className="mt-4 space-y-3 text-sm text-gray-700">
                        <div>
                          <h5 className="font-medium text-gray-900">Inclusion Criteria:</h5>
                          <ul className="mt-1 space-y-1 text-xs list-disc list-inside">
                            <li>Acute ankle or midfoot pain/tenderness</li>
                            <li>Trauma within past 10 days</li>
                            <li>Age ≥18 years</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900">Exclusion Criteria:</h5>
                          <ul className="mt-1 space-y-1 text-xs list-disc list-inside">
                            <li>Multisystem trauma</li>
                            <li>Altered mental status</li>
                            <li>Intoxication</li>
                            <li>Diminished sensation in legs</li>
                            <li>Pathologic fracture</li>
                            <li>Pregnancy</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900">Important Notes:</h5>
                          <ul className="mt-1 space-y-1 text-xs list-disc list-inside">
                            <li>Not validated for children under 18</li>
                            <li>Does not apply to isolated skin injuries</li>
                            <li>Clinical judgment should always prevail</li>
                            <li>Consider fracture if high mechanism of injury</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900">Evidence Base:</h5>
                          <p className="text-xs">
                            Validated in multiple studies with &gt;50,000 patients. 
                            Reduces unnecessary X-rays by 30-40% while maintaining high sensitivity.
                          </p>
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