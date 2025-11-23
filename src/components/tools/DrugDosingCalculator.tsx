import { useState, useEffect } from 'react';
import { Pill, AlertTriangle, Info, Calculator, Search, Shield } from 'lucide-react';

interface DrugDose {
  normalDose: string;
  renalAdjustments: {
    crCl_50_80: string;
    crCl_30_50: string;
    crCl_15_30: string;
    crCl_less_15: string;
    dialysis: string;
  };
  hepaticAdjustments: {
    mild: string;
    moderate: string;
    severe: string;
  };
  contraindications: string[];
  warnings: string[];
  monitoring: string[];
}

interface DrugData {
  [key: string]: DrugDose;
}

const drugDatabase: DrugData = {
  'metformin': {
    normalDose: '500-1000 mg BID with meals',
    renalAdjustments: {
      crCl_50_80: 'Reduce dose by 50%',
      crCl_30_50: 'Use with caution, monitor closely',
      crCl_15_30: 'Contraindicated (risk of lactic acidosis)',
      crCl_less_15: 'Contraindicated',
      dialysis: 'Contraindicated'
    },
    hepaticAdjustments: {
      mild: 'Use with caution',
      moderate: 'Avoid (risk of lactic acidosis)',
      severe: 'Contraindicated'
    },
    contraindications: ['eGFR <30', 'Acute kidney injury', 'Severe liver disease', 'Alcoholism'],
    warnings: ['Risk of lactic acidosis', 'Discontinue before contrast procedures'],
    monitoring: ['Kidney function q6mo', 'Vitamin B12 levels annually', 'Signs of lactic acidosis']
  },
  'digoxin': {
    normalDose: '0.125-0.25 mg daily',
    renalAdjustments: {
      crCl_50_80: 'Reduce dose by 25%',
      crCl_30_50: 'Reduce dose by 50%',
      crCl_15_30: 'Reduce dose by 75%',
      crCl_less_15: 'Reduce dose by 75-90%',
      dialysis: 'Give post-dialysis'
    },
    hepaticAdjustments: {
      mild: 'Monitor levels closely',
      moderate: 'Reduce dose by 25%',
      severe: 'Consider alternative'
    },
    contraindications: ['Heart block', 'Ventricular arrhythmias', 'Hypertrophic cardiomyopathy'],
    warnings: ['Narrow therapeutic index', 'Hypokalemia increases toxicity'],
    monitoring: ['Digoxin levels (0.8-2.0 ng/mL)', 'Electrolytes', 'Kidney function']
  },
  'gabapentin': {
    normalDose: '300-800 mg TID',
    renalAdjustments: {
      crCl_50_80: '400 mg TID',
      crCl_30_50: '300 mg BID',
      crCl_15_30: '300 mg daily',
      crCl_less_15: '300 mg every other day',
      dialysis: '200-300 mg post-dialysis'
    },
    hepaticAdjustments: {
      mild: 'No adjustment needed',
      moderate: 'No adjustment needed',
      severe: 'Use with caution'
    },
    contraindications: ['Hypersensitivity'],
    warnings: ['Suicidal ideation risk', 'Respiratory depression with opioids'],
    monitoring: ['Mood changes', 'Respiratory status if on opioids']
  },
  'atorvastatin': {
    normalDose: '20-80 mg daily at bedtime',
    renalAdjustments: {
      crCl_50_80: 'No adjustment needed',
      crCl_30_50: 'No adjustment needed',
      crCl_15_30: 'Use with caution',
      crCl_less_15: 'Use with caution',
      dialysis: 'No adjustment needed'
    },
    hepaticAdjustments: {
      mild: 'Use with caution',
      moderate: 'Reduce dose or avoid',
      severe: 'Contraindicated'
    },
    contraindications: ['Active liver disease', 'Pregnancy', 'Breastfeeding'],
    warnings: ['Myopathy risk', 'Hepatotoxicity', 'Drug interactions with CYP3A4'],
    monitoring: ['Liver enzymes at baseline and 12 weeks', 'CK if muscle symptoms', 'Lipid panel']
  },
  'lisinopril': {
    normalDose: '10-40 mg daily',
    renalAdjustments: {
      crCl_50_80: 'Start 5-10 mg daily',
      crCl_30_50: 'Start 2.5-5 mg daily',
      crCl_15_30: 'Start 2.5 mg daily',
      crCl_less_15: 'Use with extreme caution',
      dialysis: 'Give post-dialysis'
    },
    hepaticAdjustments: {
      mild: 'No adjustment needed',
      moderate: 'Monitor closely',
      severe: 'Use with caution'
    },
    contraindications: ['Angioedema history', 'Pregnancy', 'Bilateral renal artery stenosis'],
    warnings: ['Hyperkalemia', 'Acute kidney injury', 'Hypotension'],
    monitoring: ['Kidney function and K+ within 1-2 weeks', 'Blood pressure']
  },
  'warfarin': {
    normalDose: '2-10 mg daily (individualized)',
    renalAdjustments: {
      crCl_50_80: 'Monitor INR more frequently',
      crCl_30_50: 'Lower doses often needed',
      crCl_15_30: 'Lower doses, frequent monitoring',
      crCl_less_15: 'Consider alternatives (DOACs contraindicated)',
      dialysis: 'Increased bleeding risk'
    },
    hepaticAdjustments: {
      mild: 'Reduce dose, monitor closely',
      moderate: 'Significant dose reduction needed',
      severe: 'Consider alternatives'
    },
    contraindications: ['Active bleeding', 'Recent major surgery', 'Severe liver disease'],
    warnings: ['Major bleeding risk', 'Multiple drug interactions', 'Dietary vitamin K affects INR'],
    monitoring: ['INR every 2-4 weeks when stable', 'Signs of bleeding']
  }
};

export const DrugDosingCalculator = () => {
  const [selectedDrug, setSelectedDrug] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [creatinineClearance, setCreatinineClearance] = useState('');
  const [hepaticFunction, setHepaticFunction] = useState<'normal' | 'mild' | 'moderate' | 'severe'>('normal');
  const [showResult, setShowResult] = useState(false);

  const filteredDrugs = Object.keys(drugDatabase).filter(drug =>
    drug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateDosing = () => {
    if (!selectedDrug || !creatinineClearance) return null;

    const drug = drugDatabase[selectedDrug];
    const crCl = parseInt(creatinineClearance);
    
    let renalDose = drug.normalDose;
    let renalAdjustment = '';

    if (crCl >= 80) {
      renalDose = drug.normalDose;
      renalAdjustment = 'No renal adjustment needed';
    } else if (crCl >= 50) {
      renalDose = drug.renalAdjustments.crCl_50_80;
      renalAdjustment = 'Mild renal impairment adjustment';
    } else if (crCl >= 30) {
      renalDose = drug.renalAdjustments.crCl_30_50;
      renalAdjustment = 'Moderate renal impairment adjustment';
    } else if (crCl >= 15) {
      renalDose = drug.renalAdjustments.crCl_15_30;
      renalAdjustment = 'Severe renal impairment adjustment';
    } else {
      renalDose = drug.renalAdjustments.crCl_less_15;
      renalAdjustment = 'End-stage renal disease adjustment';
    }

    let hepaticDose = renalDose;
    let hepaticAdjustment = '';

    if (hepaticFunction !== 'normal') {
      hepaticDose = drug.hepaticAdjustments[hepaticFunction];
      hepaticAdjustment = `${hepaticFunction.charAt(0).toUpperCase() + hepaticFunction.slice(1)} hepatic impairment adjustment`;
    }

    return {
      drug,
      renalDose,
      renalAdjustment,
      hepaticDose,
      hepaticAdjustment,
      crCl,
      warnings: drug.warnings,
      contraindications: drug.contraindications,
      monitoring: drug.monitoring
    };
  };

  const result = showResult ? calculateDosing() : null;

  const getRiskLevel = () => {
    if (!result) return 'normal';
    const hasContraindications = result.contraindications.some(contra => 
      (contra.includes('eGFR') && result.crCl < 30) ||
      (contra.includes('liver') && hepaticFunction === 'severe')
    );
    if (hasContraindications) return 'high';
    if (result.crCl < 50 || hepaticFunction !== 'normal') return 'moderate';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  useEffect(() => {
    if (selectedDrug && creatinineClearance) {
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  }, [selectedDrug, creatinineClearance, hepaticFunction]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Pill className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Drug Dosing Calculator</h2>
              <p className="text-sm text-gray-600">
                Kidney and liver function-based medication dosing adjustments
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medication Selection</h3>
                
                {/* Drug Search */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Medication
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Type medication name..."
                    />
                  </div>
                </div>

                {/* Drug Selection */}
                <div className="mb-4">
                  <label htmlFor="drug-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Medication
                  </label>
                  <select
                    id="drug-select"
                    value={selectedDrug}
                    onChange={(e) => setSelectedDrug(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choose a medication...</option>
                    {filteredDrugs.map(drug => (
                      <option key={drug} value={drug}>
                        {drug.charAt(0).toUpperCase() + drug.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient Parameters */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creatinine Clearance (mL/min)
                    </label>
                    <input
                      type="number"
                      value={creatinineClearance}
                      onChange={(e) => setCreatinineClearance(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 60"
                      min="5"
                      max="150"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use Cockcroft-Gault or measured creatinine clearance
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hepatic Function
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'normal', label: 'Normal', description: 'No liver disease' },
                        { value: 'mild', label: 'Mild Impairment', description: 'Child-Pugh A or elevated enzymes' },
                        { value: 'moderate', label: 'Moderate Impairment', description: 'Child-Pugh B' },
                        { value: 'severe', label: 'Severe Impairment', description: 'Child-Pugh C' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-start space-x-3">
                          <input
                            type="radio"
                            name="hepatic"
                            value={option.value}
                            checked={hepaticFunction === option.value}
                            onChange={(e) => setHepaticFunction(e.target.value as any)}
                            className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <div>
                            <span className="text-sm text-gray-700">{option.label}</span>
                            <p className="text-xs text-gray-500">{option.description}</p>
                          </div>
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
                  {/* Dosing Recommendation */}
                  <div className={`rounded-lg p-6 border ${getRiskColor(getRiskLevel())}`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <Calculator className="w-6 h-6" />
                      <h3 className="text-xl font-semibold">
                        {selectedDrug.charAt(0).toUpperCase() + selectedDrug.slice(1)} Dosing
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Normal Dose:</h4>
                        <p className="text-sm">{result.drug.normalDose}</p>
                      </div>
                      
                      {result.renalAdjustment !== 'No renal adjustment needed' && (
                        <div>
                          <h4 className="font-medium text-gray-900">Renal-Adjusted Dose:</h4>
                          <p className="text-sm">{result.renalDose}</p>
                          <p className="text-xs text-gray-600">{result.renalAdjustment}</p>
                        </div>
                      )}
                      
                      {hepaticFunction !== 'normal' && (
                        <div>
                          <h4 className="font-medium text-gray-900">Hepatic-Adjusted Dose:</h4>
                          <p className="text-sm">{result.hepaticDose}</p>
                          <p className="text-xs text-gray-600">{result.hepaticAdjustment}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contraindications */}
                  {result.contraindications.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Shield className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-red-900">Contraindications</h4>
                      </div>
                      <ul className="space-y-1">
                        {result.contraindications.map((contra, index) => (
                          <li key={index} className="text-sm text-red-800 flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{contra}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-900">Warnings & Precautions</h4>
                    </div>
                    <ul className="space-y-1">
                      {result.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-800">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Monitoring */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Info className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Monitoring Requirements</h4>
                    </div>
                    <ul className="space-y-1">
                      {result.monitoring.map((monitor, index) => (
                        <li key={index} className="text-sm text-blue-800">
                          • {monitor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dialysis Information */}
                  {result.crCl < 15 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Dialysis Considerations</h4>
                      <p className="text-sm text-gray-700">{result.drug.renalAdjustments.dialysis}</p>
                    </div>
                  )}
                </>
              )}

              {!result && (
                <div className="text-center py-12">
                  <Pill className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select Medication & Enter Parameters</h3>
                  <p className="text-gray-600">
                    Choose a medication and enter patient parameters to see dosing recommendations
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Important Notes */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Important Notes</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Always consult current prescribing information and institutional protocols</li>
              <li>• Consider individual patient factors, comorbidities, and drug interactions</li>
              <li>• Monitor patient response and adjust doses as clinically indicated</li>
              <li>• Some medications may require therapeutic drug monitoring</li>
              <li>• Consult pharmacy or nephrology for complex dosing decisions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};