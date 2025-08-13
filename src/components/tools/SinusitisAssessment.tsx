import { useState } from 'react';
import { Wind, Clock, AlertTriangle } from 'lucide-react';

interface SinusitisInputs {
  duration: 'less-than-7' | '7-to-10' | 'more-than-10' | '';
  pattern: 'improving' | 'stable' | 'double-worsening' | '';
  purulentDischarge: 'yes' | 'no' | '';
  facialPain: 'yes' | 'no' | '';
  fever: 'yes' | 'no' | '';
  maxillaryPain: 'yes' | 'no' | '';
  riskFactors: string[];
}

const riskFactorOptions = [
  'Age ≥65 years',
  'Recent hospitalization (last 3 months)',
  'Antibiotic use in last 3 months',
  'Immunocompromised',
  'Multiple comorbidities (DM, CKD, CHF)',
  'History of antibiotic-resistant infections'
];

export const SinusitisAssessment = () => {
  const [inputs, setInputs] = useState<SinusitisInputs>({
    duration: '',
    pattern: '',
    purulentDischarge: '',
    facialPain: '',
    fever: '',
    maxillaryPain: '',
    riskFactors: [],
  });

  const [result, setResult] = useState<{
    diagnosis: string;
    likelihood: string;
    management: string;
    antibiotics: string[];
    duration: string;
    followUp: string;
    color: string;
    bg: string;
  } | null>(null);

  const handleInputChange = (field: keyof SinusitisInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleRiskFactorChange = (factor: string, checked: boolean) => {
    setInputs(prev => ({
      ...prev,
      riskFactors: checked 
        ? [...prev.riskFactors, factor]
        : prev.riskFactors.filter(f => f !== factor)
    }));
  };

  const assessSinusitis = () => {
    // Determine bacterial vs viral likelihood
    const bacterialCriteria = 
      (inputs.duration === 'more-than-10' && inputs.pattern === 'stable') ||
      inputs.pattern === 'double-worsening' ||
      (inputs.purulentDischarge === 'yes' && inputs.facialPain === 'yes');

    const hasRiskFactors = inputs.riskFactors.length > 0;

    let diagnosis, likelihood, management, antibiotics: string[], duration, followUp, color, bg;

    if (inputs.duration === 'less-than-7') {
      // Viral rhinosinusitis
      diagnosis = 'Viral Rhinosinusitis';
      likelihood = 'Highly likely viral etiology';
      management = 'Symptomatic treatment only';
      antibiotics = ['No antibiotics indicated'];
      duration = 'Symptoms typically resolve in 7-10 days';
      followUp = 'Return if symptoms persist >10 days or worsen after initial improvement';
      color = 'text-green-600';
      bg = 'bg-green-50';

    } else if (bacterialCriteria) {
      // Acute bacterial rhinosinusitis (ABRS)
      diagnosis = 'Acute Bacterial Rhinosinusitis (ABRS)';
      likelihood = 'Bacterial infection likely';
      management = 'Antibiotic therapy indicated';
      
      if (hasRiskFactors) {
        antibiotics = [
          'High-risk patient - broader spectrum:',
          'First-line: High-dose amoxicillin-clavulanate 2000mg/125mg BID × 7 days',
          'PCN allergy: Doxycycline 100mg BID × 7 days',
          'Severe allergy: Levofloxacin 750mg daily × 5 days (avoid if possible)'
        ];
      } else {
        antibiotics = [
          'Standard risk patient:',
          'First-line: Amoxicillin-clavulanate 875mg/125mg BID × 5-7 days',
          'PCN allergy: Doxycycline 100mg BID × 5-7 days',
          'Severe allergy: Levofloxacin 750mg daily × 5 days (avoid if possible)'
        ];
      }
      
      duration = '5-7 days treatment course';
      followUp = 'Follow-up in 3-5 days if no improvement. Consider imaging if treatment failure.';
      color = 'text-orange-600';
      bg = 'bg-orange-50';

    } else {
      // Probable viral, but watchful waiting appropriate
      diagnosis = 'Probable Viral Rhinosinusitis';
      likelihood = 'Viral likely, but bacterial possible';
      management = 'Watchful waiting vs. antibiotics based on clinical judgment';
      
      antibiotics = [
        'Options for management:',
        '1. Watchful waiting for 7 days (preferred)',
        '2. If antibiotic chosen:',
        '   • Amoxicillin-clavulanate 875mg/125mg BID × 5-7 days',
        '   • Doxycycline 100mg BID × 5-7 days (PCN allergy)'
      ];
      
      duration = 'Re-evaluate in 7 days if watchful waiting chosen';
      followUp = 'Return if symptoms worsen or no improvement in 7 days';
      color = 'text-yellow-600';
      bg = 'bg-yellow-50';
    }

    setResult({
      diagnosis,
      likelihood,
      management,
      antibiotics,
      duration,
      followUp,
      color,
      bg,
    });
  };

  const isComplete = 
    inputs.duration && 
    inputs.pattern && 
    inputs.purulentDischarge && 
    inputs.facialPain && 
    inputs.fever && 
    inputs.maxillaryPain;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Wind className="w-5 h-5 text-blue-500" />
        <h3 className="text-xl font-semibold text-gray-900">Acute Bacterial Rhinosinusitis Assessment</h3>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-blue-800 text-sm">
          <strong>Clinical Tool:</strong> Distinguishes bacterial from viral rhinosinusitis based on duration, 
          symptom pattern, and clinical features to guide appropriate antibiotic use.
        </p>
      </div>

      <div className="space-y-6 mb-6">
        {/* Duration and Pattern */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Symptom Duration</h4>
            <div className="space-y-2">
              {[
                { value: 'less-than-7', label: '<7 days', desc: 'Typical viral course' },
                { value: '7-to-10', label: '7-10 days', desc: 'Borderline duration' },
                { value: 'more-than-10', label: '>10 days', desc: 'Suggests bacterial if no improvement' },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => handleInputChange('duration', value as any)}
                  className={`w-full text-left p-3 rounded-lg border ${
                    inputs.duration === value
                      ? 'bg-primary-100 border-primary-500'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{label}</div>
                  <div className="text-sm text-gray-600">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Symptom Pattern</h4>
            <div className="space-y-2">
              {[
                { value: 'improving', label: 'Gradually improving', desc: 'Typical viral pattern' },
                { value: 'stable', label: 'Persistent/stable', desc: 'No improvement in severity' },
                { value: 'double-worsening', label: 'Initially improved then worsened', desc: 'Classic ABRS pattern' },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => handleInputChange('pattern', value as any)}
                  className={`w-full text-left p-3 rounded-lg border ${
                    inputs.pattern === value
                      ? value === 'double-worsening'
                        ? 'bg-red-100 border-red-500'
                        : 'bg-primary-100 border-primary-500'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{label}</div>
                  <div className="text-sm text-gray-600">{desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clinical Features */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Clinical Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'purulentDischarge', label: 'Purulent nasal discharge?', important: true },
              { key: 'facialPain', label: 'Unilateral facial pain/pressure?', important: true },
              { key: 'fever', label: 'Fever present?', important: false },
              { key: 'maxillaryPain', label: 'Maxillary tooth pain?', important: false },
            ].map(({ key, label, important }) => (
              <div key={key} className={`p-3 border rounded-lg ${important ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                  {important && <span className="text-orange-500 ml-1">*</span>}
                </label>
                <div className="flex space-x-2">
                  {['yes', 'no'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInputChange(key as keyof SinusitisInputs, option)}
                      className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium ${
                        inputs[key as keyof SinusitisInputs] === option
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

        {/* Risk Factors for Resistance */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Risk Factors for Resistance/Poor Outcome</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {riskFactorOptions.map((factor) => (
              <label key={factor} className="flex items-center space-x-2 p-2 border border-gray-200 rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={inputs.riskFactors.includes(factor)}
                  onChange={(e) => handleRiskFactorChange(factor, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{factor}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Assess Button */}
      <div className="mb-6">
        <button
          onClick={assessSinusitis}
          disabled={!isComplete}
          className={`w-full py-3 px-4 rounded-md font-medium ${
            isComplete
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Assess for Bacterial Sinusitis
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`p-6 rounded-md ${result.bg}`}>
          <div className="flex items-center space-x-2 mb-4">
            {result.diagnosis.includes('Viral') ? (
              <Clock className="w-6 h-6 text-green-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            )}
            <div>
              <div className="text-xl font-bold text-gray-900">
                {result.diagnosis}
              </div>
              <div className={`text-sm font-medium ${result.color}`}>
                {result.likelihood}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Management Approach</h4>
              <p className="text-sm text-gray-700 p-3 bg-white rounded border">
                {result.management}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Antibiotic Recommendations</h4>
              <ul className="space-y-1 text-sm">
                {result.antibiotics.map((item, index) => (
                  <li key={index} className="flex items-start">
                    {item.includes(':') || item.match(/^\d+\./) ? (
                      <span className="font-medium text-gray-900">{item}</span>
                    ) : item.startsWith('   •') ? (
                      <span className="ml-6 flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>{item.substring(4)}</span>
                      </span>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        <span>{item}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Treatment Duration</h4>
                <p className="text-sm text-gray-700">{result.duration}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Follow-up Plan</h4>
                <p className="text-sm text-gray-700">{result.followUp}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-gray-700 text-xs">
              <strong>Clinical Pearls:</strong> Most sinusitis (90-98%) is viral and self-limiting. 
              Imaging is not routinely recommended. Avoid fluoroquinolones as first-line due to serious 
              adverse effects and resistance concerns. Consider nasal saline irrigation as adjunctive therapy.
            </p>
          </div>
        </div>
      )}

      {!isComplete && (
        <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            Please complete all assessment questions to determine the likelihood of bacterial sinusitis 
            and receive appropriate treatment recommendations.
          </p>
        </div>
      )}

      {/* Diagnostic Criteria Reference */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">ABRS Diagnostic Criteria</h4>
        <div className="text-xs text-gray-700 space-y-1">
          <div><strong>Duration:</strong> Symptoms ≥10 days without improvement</div>
          <div><strong>OR Pattern:</strong> "Double worsening" - initial improvement followed by worsening</div>
          <div><strong>Plus:</strong> Purulent discharge with unilateral facial pain/pressure</div>
          <div><strong>Note:</strong> Fever may be present but is not required for diagnosis</div>
        </div>
      </div>
    </div>
  );
};