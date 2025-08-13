import { useState } from 'react';
import { Droplets, AlertTriangle, Info } from 'lucide-react';

interface TGInputs {
  triglycerides: string;
  diabetes: 'yes' | 'no' | '';
  ascvdHistory: 'yes' | 'no' | '';
  age: string;
  priorPancreatitis: 'yes' | 'no' | '';
  familyHistory: 'yes' | 'no' | '';
}

export const TriglycerideCalculator = () => {
  const [inputs, setInputs] = useState<TGInputs>({
    triglycerides: '',
    diabetes: '',
    ascvdHistory: '',
    age: '',
    priorPancreatitis: '',
    familyHistory: '',
  });

  const [result, setResult] = useState<{
    category: string;
    riskLevel: string;
    primaryGoal: string;
    treatment: string[];
    urgency: string;
    color: string;
    bg: string;
  } | null>(null);

  const handleInputChange = (field: keyof TGInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculateRisk = () => {
    const tg = parseInt(inputs.triglycerides);
    const age = parseInt(inputs.age || '0');

    if (!tg || tg < 50) {
      return;
    }

    let category, riskLevel, primaryGoal, treatment: string[], urgency, color, bg;

    // Determine TG category
    if (tg < 150) {
      category = 'Normal';
      riskLevel = 'Low';
      primaryGoal = 'Maintain current levels';
      treatment = ['Continue healthy lifestyle habits', 'Regular monitoring if risk factors present'];
      urgency = 'Routine follow-up';
      color = 'text-green-600';
      bg = 'bg-green-50';
    } else if (tg < 500) {
      category = 'Moderate (150-499 mg/dL)';
      riskLevel = inputs.ascvdHistory === 'yes' || inputs.diabetes === 'yes' ? 'High ASCVD Risk' : 'Moderate';
      primaryGoal = 'Reduce ASCVD risk';
      
      treatment = [
        'Lifestyle modifications: <6% calories from sugar',
        'Limit alcohol: ≤2 drinks/day (men), ≤1 drink/day (women)',
        'Increase omega-3 rich fish intake'
      ];

      if (inputs.ascvdHistory === 'yes' || (inputs.diabetes === 'yes' && age > 40)) {
        treatment.push('Consider Icosapent ethyl (Vascepa) 2g BID');
      }

      urgency = 'Follow-up in 12 weeks';
      color = 'text-yellow-600';
      bg = 'bg-yellow-50';
    } else if (tg < 1000) {
      category = 'Moderate-to-Severe (500-999 mg/dL)';
      riskLevel = 'High';
      primaryGoal = 'Prevent ASCVD + pancreatitis';
      
      treatment = [
        'Strict lifestyle: <5% calories from sugar',
        'Fat intake ≤20-25% of calories',
        'Abstain from alcohol',
        'Fenofibrate 145mg daily (preferred fibrate)'
      ];

      if (inputs.ascvdHistory === 'yes' || inputs.diabetes === 'yes') {
        treatment.push('Add Icosapent ethyl if high ASCVD risk');
      }

      urgency = 'Follow-up in 2-4 weeks';
      color = 'text-orange-600';
      bg = 'bg-orange-50';
    } else {
      category = 'Severe (≥1000 mg/dL)';
      riskLevel = 'Critical - Pancreatitis Risk';
      primaryGoal = 'Prevent pancreatitis';
      
      treatment = [
        'URGENT: Strict fat restriction <10-15% calories',
        'Complete alcohol abstinence',
        'Monitor TG every 3 days',
        'Start fibrate once TG <1000 mg/dL',
        'Consider hospitalization if symptoms'
      ];

      urgency = 'Immediate intervention required';
      color = 'text-red-600';
      bg = 'bg-red-50';
    }

    // Additional risk factors
    if (inputs.priorPancreatitis === 'yes') {
      treatment.push('⚠️ Prior pancreatitis: Lifelong alcohol avoidance mandatory');
      if (riskLevel !== 'Critical - Pancreatitis Risk') {
        riskLevel = 'High - Prior Pancreatitis';
      }
    }

    if (inputs.familyHistory === 'yes' && tg >= 1000) {
      treatment.push('⚠️ Consider genetic testing for Familial Chylomicronemia Syndrome');
    }

    setResult({
      category,
      riskLevel,
      primaryGoal,
      treatment,
      urgency,
      color,
      bg,
    });
  };

  const isComplete = inputs.triglycerides && inputs.diabetes && inputs.ascvdHistory && inputs.priorPancreatitis && inputs.familyHistory;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Droplets className="w-5 h-5 text-blue-500" />
        <h3 className="text-xl font-semibold text-gray-900">Triglyceride Risk Assessment</h3>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-blue-800 text-sm">
            <strong>Clinical Use:</strong> Assesses pancreatitis risk and determines treatment approach based on 
            triglyceride levels and cardiovascular risk factors. Fasting triglyceride level required (12-hour fast).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Lab Value */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Laboratory Value</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fasting Triglycerides*
            </label>
            <div className="flex">
              <input
                type="number"
                value={inputs.triglycerides}
                onChange={(e) => handleInputChange('triglycerides', e.target.value)}
                min="50"
                max="5000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="200"
              />
              <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                mg/dL
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">*12-hour fasting required</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age (optional)</label>
            <div className="flex">
              <input
                type="number"
                value={inputs.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                min="18"
                max="100"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="45"
              />
              <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                years
              </span>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Risk Assessment</h4>
          
          {[
            { key: 'diabetes', label: 'Diabetes mellitus?' },
            { key: 'ascvdHistory', label: 'History of ASCVD?' },
            { key: 'priorPancreatitis', label: 'Prior pancreatitis?' },
            { key: 'familyHistory', label: 'Family history of severe hypertriglyceridemia?' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="flex space-x-2">
                {['yes', 'no'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleInputChange(key as keyof TGInputs, option)}
                    className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium ${
                      inputs[key as keyof TGInputs] === option
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
          onClick={calculateRisk}
          disabled={!isComplete}
          className={`w-full py-3 px-4 rounded-md font-medium ${
            isComplete
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Assess Triglyceride Risk
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`p-6 rounded-md ${result.bg}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {inputs.triglycerides} mg/dL
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${result.bg} ${result.color}`}>
                {result.category}
              </div>
            </div>
            {parseInt(inputs.triglycerides) >= 1000 && (
              <AlertTriangle className="w-8 h-8 text-red-500" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Risk Level: </span>
                  <span className={result.color}>{result.riskLevel}</span>
                </div>
                <div>
                  <span className="font-medium">Primary Goal: </span>
                  {result.primaryGoal}
                </div>
                <div>
                  <span className="font-medium">Follow-up: </span>
                  {result.urgency}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Treatment Recommendations</h4>
              <ul className="space-y-1 text-sm">
                {result.treatment.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {parseInt(inputs.triglycerides) >= 1000 && (
            <div className="mt-4 p-3 bg-red-100 rounded-md border border-red-300">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <div className="text-red-800 text-sm">
                  <strong>URGENT:</strong> Triglycerides ≥1000 mg/dL require immediate intervention to prevent 
                  acute pancreatitis. Monitor for abdominal pain, nausea, vomiting. Consider hospitalization if symptomatic.
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-gray-700 text-xs">
              <strong>Clinical Note:</strong> This assessment follows Endocrine Society and AHA guidelines. 
              Response timeline: &lt;5% fat diet shows 25% TG reduction per day; fibrates show response within 2 weeks; 
              maximum effect at 6-8 weeks. Always rule out secondary causes (diabetes, hypothyroidism, medications).
            </p>
          </div>
        </div>
      )}

      {!isComplete && (
        <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            Please complete all fields to assess triglyceride risk and treatment recommendations.
          </p>
        </div>
      )}

      {/* Reference Guide */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Triglyceride Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="font-medium text-green-800">Normal</div>
            <div className="text-green-700">&lt;150 mg/dL</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="font-medium text-yellow-800">Moderate</div>
            <div className="text-yellow-700">150-499 mg/dL</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded p-2">
            <div className="font-medium text-orange-800">Mod-Severe</div>
            <div className="text-orange-700">500-999 mg/dL</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <div className="font-medium text-red-800">Severe</div>
            <div className="text-red-700">≥1000 mg/dL</div>
          </div>
        </div>
      </div>
    </div>
  );
};