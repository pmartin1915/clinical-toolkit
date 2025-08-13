import { useState } from 'react';
import { Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';

interface UTIInputs {
  fever: 'yes' | 'no' | '';
  flankPain: 'yes' | 'no' | '';
  pregnancy: 'yes' | 'no' | '';
  immunocompromised: 'yes' | 'no' | '';
  catheter: 'yes' | 'no' | '';
  maleSex: 'yes' | 'no' | '';
  symptoms: string[];
}

const symptomOptions = [
  'Dysuria (painful urination)',
  'Urinary frequency',
  'Urinary urgency',
  'Suprapubic discomfort',
  'Hematuria (blood in urine)',
  'Nausea/vomiting',
  'CVA tenderness'
];

export const UTIAssessment = () => {
  const [inputs, setInputs] = useState<UTIInputs>({
    fever: '',
    flankPain: '',
    pregnancy: '',
    immunocompromised: '',
    catheter: '',
    maleSex: '',
    symptoms: [],
  });

  const [result, setResult] = useState<{
    classification: string;
    severity: string;
    workup: string[];
    treatment: string[];
    followUp: string;
    color: string;
    bg: string;
  } | null>(null);

  const handleInputChange = (field: keyof UTIInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setInputs(prev => ({
      ...prev,
      symptoms: checked 
        ? [...prev.symptoms, symptom]
        : prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const assessUTI = () => {
    // Determine if complicated UTI
    const isComplicated = 
      inputs.fever === 'yes' ||
      inputs.flankPain === 'yes' ||
      inputs.pregnancy === 'yes' ||
      inputs.immunocompromised === 'yes' ||
      inputs.catheter === 'yes' ||
      inputs.maleSex === 'yes';

    let classification, severity, workup: string[], treatment: string[], followUp, color, bg;

    if (isComplicated) {
      // Determine if pyelonephritis vs other complicated UTI
      if (inputs.fever === 'yes' || inputs.flankPain === 'yes' || inputs.symptoms.includes('CVA tenderness')) {
        classification = 'Acute Pyelonephritis';
        severity = 'Complicated UTI';
        
        workup = [
          'Urinalysis with culture and sensitivity (mandatory)',
          'CBC with differential',
          'Basic metabolic panel (BUN, creatinine)',
          'Consider blood cultures if febrile or toxic appearing'
        ];

        if (inputs.symptoms.includes('Nausea/vomiting') || inputs.fever === 'yes') {
          workup.push('Consider renal ultrasound or CT if no improvement in 2-3 days');
        }

        treatment = [
          'Duration: 7-14 days (typically 7 days if uncomplicated pyelonephritis)',
          'Outpatient options:',
          '• Ciprofloxacin 500mg BID × 7 days',
          '• Levofloxacin 750mg daily × 5 days',
          '• Consider ceftriaxone 1g IM/IV × 1 dose if oral route unreliable'
        ];

        if (inputs.pregnancy === 'yes') {
          treatment = [
            'Pregnancy-safe options (avoid fluoroquinolones):',
            '• Ceftriaxone 1g IV daily',
            '• Ampicillin + gentamicin (if susceptible)',
            '• Duration: 7-14 days',
            '• Requires hospitalization for IV therapy'
          ];
        }

        followUp = 'Follow-up in 2-3 days. If no improvement, consider hospitalization or imaging.';
        color = 'text-red-600';
        bg = 'bg-red-50';

      } else {
        classification = 'Complicated Cystitis';
        severity = 'Complicated UTI';
        
        workup = [
          'Urinalysis with culture and sensitivity (mandatory)',
          'Consider post-void residual if retention suspected',
          'Rule out structural abnormalities if recurrent'
        ];

        treatment = [
          'Duration: 7-14 days',
          'First-line options:',
          '• Nitrofurantoin 100mg BID × 7 days (avoid if CrCl <30)',
          '• TMP-SMX DS BID × 7-14 days (if local resistance <20%)',
          '• Amoxicillin-clavulanate 500/125mg BID × 7 days'
        ];

        if (inputs.maleSex === 'yes') {
          treatment.push('Male patients: Consider prostatitis - may need 2-4 weeks treatment');
        }

        followUp = 'Follow-up in 3-5 days if no improvement. Culture-guided therapy adjustment.';
        color = 'text-orange-600';
        bg = 'bg-orange-50';
      }

    } else {
      // Simple UTI (uncomplicated cystitis)
      classification = 'Simple UTI (Uncomplicated Cystitis)';
      severity = 'Uncomplicated';
      
      workup = [
        'Urinalysis (culture not routinely needed)',
        'Urine culture only if:',
        '• Symptoms persist >2-3 days on antibiotics',
        '• Recurrent UTI',
        '• Atypical presentation'
      ];

      // Check for MDR risk factors
      const mdrRisk = inputs.catheter === 'yes'; // Could expand this based on additional factors

      if (mdrRisk) {
        treatment = [
          'MDR risk factors present - broader spectrum:',
          '• Amoxicillin-clavulanate 500/125mg BID × 5-7 days',
          '• Cephalexin 500mg BID × 5-7 days',
          '• Ciprofloxacin 250mg BID × 3 days (last resort)'
        ];
      } else {
        treatment = [
          'Duration: Short course effective',
          'First-line options:',
          '• Nitrofurantoin 100mg BID × 5 days',
          '• TMP-SMX DS BID × 3 days (if local E. coli resistance <20%)',
          'Alternative options:',
          '• Amoxicillin-clavulanate 500/125mg BID × 5-7 days',
          '• Cephalexin 500mg BID × 5-7 days'
        ];
      }

      followUp = 'Routine follow-up. Return if symptoms persist >2-3 days or worsen.';
      color = 'text-green-600';
      bg = 'bg-green-50';
    }

    setResult({
      classification,
      severity,
      workup,
      treatment,
      followUp,
      color,
      bg,
    });
  };

  const hasSymptoms = inputs.symptoms.length > 0;
  const isComplete = 
    inputs.fever && 
    inputs.flankPain && 
    inputs.pregnancy && 
    inputs.immunocompromised && 
    inputs.catheter && 
    inputs.maleSex && 
    hasSymptoms;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Stethoscope className="w-5 h-5 text-primary-600" />
        <h3 className="text-xl font-semibold text-gray-900">UTI Classification Assessment</h3>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-blue-800 text-sm">
          <strong>Purpose:</strong> Classifies urinary tract infections as simple (uncomplicated cystitis) 
          vs. complicated UTI/pyelonephritis to guide appropriate workup and treatment selection.
        </p>
      </div>

      <div className="space-y-6 mb-6">
        {/* Symptoms */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Clinical Presentation</h4>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select all present symptoms:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {symptomOptions.map((symptom) => (
              <label key={symptom} className="flex items-center space-x-2 p-2 border border-gray-200 rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={inputs.symptoms.includes(symptom)}
                  onChange={(e) => handleSymptomChange(symptom, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{symptom}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Complicated UTI Risk Factors */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Complicating Factors Assessment</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'fever', label: 'Fever >99.9°F (37.7°C)?', important: true },
              { key: 'flankPain', label: 'Flank pain or CVA tenderness?', important: true },
              { key: 'pregnancy', label: 'Pregnant?', important: true },
              { key: 'immunocompromised', label: 'Immunocompromised?', important: false },
              { key: 'catheter', label: 'Urinary catheter or recent instrumentation?', important: false },
              { key: 'maleSex', label: 'Male patient?', important: false },
            ].map(({ key, label, important }) => (
              <div key={key} className={`p-3 border rounded-lg ${important ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                  {important && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="flex space-x-2">
                  {['yes', 'no'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInputChange(key as keyof UTIInputs, option)}
                      className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium ${
                        inputs[key as keyof UTIInputs] === option
                          ? important && option === 'yes'
                            ? 'bg-red-100 border-red-500 text-red-700'
                            : 'bg-primary-100 border-primary-500 text-primary-700'
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

      {/* Assess Button */}
      <div className="mb-6">
        <button
          onClick={assessUTI}
          disabled={!isComplete}
          className={`w-full py-3 px-4 rounded-md font-medium ${
            isComplete
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Classify UTI and Generate Recommendations
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`p-6 rounded-md ${result.bg}`}>
          <div className="flex items-center space-x-2 mb-4">
            {result.severity === 'Uncomplicated' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
            <div>
              <div className="text-xl font-bold text-gray-900">
                {result.classification}
              </div>
              <div className={`text-sm font-medium ${result.color}`}>
                {result.severity}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Workup</h4>
              <ul className="space-y-1 text-sm">
                {result.workup.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Treatment Recommendations</h4>
              <ul className="space-y-1 text-sm">
                {result.treatment.map((item, index) => (
                  <li key={index} className="flex items-start">
                    {item.startsWith('•') ? (
                      <span className="ml-4 flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>{item.substring(2)}</span>
                      </span>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        <span className={item.includes(':') ? 'font-medium' : ''}>{item}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Follow-up Plan</h4>
            <p className="text-sm text-gray-700">{result.followUp}</p>
          </div>

          {result.severity !== 'Uncomplicated' && (
            <div className="mt-4 p-3 bg-yellow-100 rounded-md border border-yellow-300">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <div className="text-yellow-800 text-sm">
                  <strong>Clinical Alert:</strong> This is a complicated UTI requiring culture-guided therapy 
                  and close monitoring. Consider hospitalization if unstable or unable to tolerate oral therapy.
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-gray-700 text-xs">
              <strong>Guidelines:</strong> Based on IDSA guidelines for UTI management. Avoid fluoroquinolones 
              when possible due to serious adverse effects. Local antibiotic resistance patterns should guide 
              empiric therapy selection.
            </p>
          </div>
        </div>
      )}

      {!isComplete && (
        <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            Please select symptoms and answer all assessment questions to classify the UTI and receive treatment recommendations.
          </p>
        </div>
      )}
    </div>
  );
};