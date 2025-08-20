import { useState } from 'react';
import { AlertTriangle, CheckCircle, Pill, Search, X, Shield, Zap } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  category: string;
  commonDoses: string[];
}

interface Interaction {
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  description: string;
  mechanism: string;
  clinicalEffect: string;
  management: string[];
  monitoring: string[];
  alternatives?: string[];
}

interface InteractionResult {
  medication1: Medication;
  medication2: Medication;
  interaction: Interaction;
}

export const MedicationInteractionChecker = () => {
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Comprehensive medication database (sample of common medications)
  const medicationDatabase: Medication[] = [
    // Cardiovascular
    {
      id: 'lisinopril',
      name: 'Lisinopril',
      genericName: 'lisinopril',
      brandNames: ['Prinivil', 'Zestril'],
      category: 'ACE Inhibitor',
      commonDoses: ['5mg', '10mg', '20mg', '40mg']
    },
    {
      id: 'amlodipine',
      name: 'Amlodipine',
      genericName: 'amlodipine',
      brandNames: ['Norvasc'],
      category: 'Calcium Channel Blocker',
      commonDoses: ['2.5mg', '5mg', '10mg']
    },
    {
      id: 'atorvastatin',
      name: 'Atorvastatin',
      genericName: 'atorvastatin',
      brandNames: ['Lipitor'],
      category: 'Statin',
      commonDoses: ['10mg', '20mg', '40mg', '80mg']
    },
    {
      id: 'warfarin',
      name: 'Warfarin',
      genericName: 'warfarin',
      brandNames: ['Coumadin', 'Jantoven'],
      category: 'Anticoagulant',
      commonDoses: ['1mg', '2mg', '2.5mg', '5mg', '10mg']
    },
    // Diabetes
    {
      id: 'metformin',
      name: 'Metformin',
      genericName: 'metformin',
      brandNames: ['Glucophage', 'Fortamet'],
      category: 'Biguanide',
      commonDoses: ['500mg', '850mg', '1000mg']
    },
    {
      id: 'glipizide',
      name: 'Glipizide',
      genericName: 'glipizide',
      brandNames: ['Glucotrol'],
      category: 'Sulfonylurea',
      commonDoses: ['2.5mg', '5mg', '10mg', '20mg']
    },
    // Mental Health
    {
      id: 'sertraline',
      name: 'Sertraline',
      genericName: 'sertraline',
      brandNames: ['Zoloft'],
      category: 'SSRI',
      commonDoses: ['25mg', '50mg', '100mg', '200mg']
    },
    {
      id: 'fluoxetine',
      name: 'Fluoxetine',
      genericName: 'fluoxetine',
      brandNames: ['Prozac'],
      category: 'SSRI',
      commonDoses: ['10mg', '20mg', '40mg', '80mg']
    },
    {
      id: 'bupropion',
      name: 'Bupropion XL',
      genericName: 'bupropion',
      brandNames: ['Wellbutrin XL'],
      category: 'Atypical Antidepressant',
      commonDoses: ['150mg', '300mg', '450mg']
    },
    // Antibiotics
    {
      id: 'ciprofloxacin',
      name: 'Ciprofloxacin',
      genericName: 'ciprofloxacin',
      brandNames: ['Cipro'],
      category: 'Fluoroquinolone',
      commonDoses: ['250mg', '500mg', '750mg']
    },
    {
      id: 'amoxclav',
      name: 'Amoxicillin-Clavulanate',
      genericName: 'amoxicillin-clavulanate',
      brandNames: ['Augmentin'],
      category: 'Penicillin',
      commonDoses: ['500/125mg', '875/125mg']
    },
    // Pain/Inflammation
    {
      id: 'ibuprofen',
      name: 'Ibuprofen',
      genericName: 'ibuprofen',
      brandNames: ['Advil', 'Motrin'],
      category: 'NSAID',
      commonDoses: ['200mg', '400mg', '600mg', '800mg']
    },
    {
      id: 'tramadol',
      name: 'Tramadol',
      genericName: 'tramadol',
      brandNames: ['Ultram'],
      category: 'Opioid Analgesic',
      commonDoses: ['50mg', '100mg']
    }
  ];

  // Interaction database
  const interactionDatabase: Record<string, Record<string, Interaction>> = {
    'warfarin': {
      'ciprofloxacin': {
        severity: 'major',
        description: 'Ciprofloxacin significantly increases warfarin anticoagulant effect',
        mechanism: 'CYP1A2 and CYP3A4 inhibition reduces warfarin metabolism',
        clinicalEffect: 'Increased bleeding risk, elevated INR',
        management: [
          'Monitor INR closely if combination necessary',
          'Consider dose reduction of warfarin by 25-50%',
          'Increase INR monitoring frequency',
          'Use alternative antibiotic if possible'
        ],
        monitoring: ['INR every 2-3 days initially', 'Signs of bleeding'],
        alternatives: ['Amoxicillin-clavulanate', 'Cephalexin']
      },
      'sertraline': {
        severity: 'moderate',
        description: 'SSRIs may increase bleeding risk when combined with warfarin',
        mechanism: 'Platelet dysfunction from serotonin reuptake inhibition',
        clinicalEffect: 'Increased bleeding risk, especially GI bleeding',
        management: [
          'Monitor for signs of bleeding',
          'Consider PPI if GI bleeding risk',
          'More frequent INR monitoring initially'
        ],
        monitoring: ['INR weekly x 4 weeks', 'Signs of bleeding', 'GI symptoms'],
        alternatives: ['Bupropion (lower bleeding risk)']
      },
      'ibuprofen': {
        severity: 'major',
        description: 'NSAIDs significantly increase bleeding risk with warfarin',
        mechanism: 'Antiplatelet effects plus anticoagulation',
        clinicalEffect: 'Markedly increased bleeding risk',
        management: [
          'Avoid combination if possible',
          'Use acetaminophen for pain instead',
          'If must use, very close monitoring required'
        ],
        monitoring: ['Daily bleeding assessment', 'INR every 2-3 days'],
        alternatives: ['Acetaminophen', 'Topical analgesics']
      }
    },
    'sertraline': {
      'tramadol': {
        severity: 'major',
        description: 'Increased risk of serotonin syndrome',
        mechanism: 'Both medications increase serotonin levels',
        clinicalEffect: 'Serotonin syndrome: hyperthermia, rigidity, altered mental status',
        management: [
          'Avoid combination if possible',
          'Use alternative analgesic',
          'If must combine, start with lowest doses and monitor closely'
        ],
        monitoring: ['Mental status', 'Neuromuscular symptoms', 'Vital signs'],
        alternatives: ['Acetaminophen', 'Topical analgesics', 'Non-serotonergic antidepressants']
      },
      'fluoxetine': {
        severity: 'moderate',
        description: 'Potential for increased serotonergic effects',
        mechanism: 'Both are SSRIs with overlapping mechanisms',
        clinicalEffect: 'Increased side effects, potential serotonin excess',
        management: [
          'Generally avoid combination',
          'Use single SSRI at appropriate dose',
          'Consider washout period when switching'
        ],
        monitoring: ['Serotonin syndrome symptoms', 'Side effect profile'],
        alternatives: ['Single agent optimization', 'Non-SSRI augmentation']
      }
    },
    'lisinopril': {
      'ibuprofen': {
        severity: 'moderate',
        description: 'NSAIDs may reduce ACE inhibitor effectiveness and increase kidney injury risk',
        mechanism: 'Prostaglandin inhibition affects renal function',
        clinicalEffect: 'Reduced blood pressure control, acute kidney injury risk',
        management: [
          'Monitor blood pressure and kidney function',
          'Use lowest effective NSAID dose for shortest duration',
          'Consider acetaminophen alternative'
        ],
        monitoring: ['Blood pressure', 'Serum creatinine', 'BUN'],
        alternatives: ['Acetaminophen', 'Topical NSAIDs']
      },
      'glipizide': {
        severity: 'minor',
        description: 'ACE inhibitors may enhance hypoglycemic effect of sulfonylureas',
        mechanism: 'Improved insulin sensitivity',
        clinicalEffect: 'Slightly increased hypoglycemia risk',
        management: [
          'Monitor blood glucose more frequently initially',
          'Be aware of potential for enhanced effect',
          'Patient education on hypoglycemia symptoms'
        ],
        monitoring: ['Blood glucose', 'Hypoglycemia symptoms'],
        alternatives: ['No change usually needed']
      }
    },
    'atorvastatin': {
      'amlodipine': {
        severity: 'minor',
        description: 'Amlodipine may increase atorvastatin levels',
        mechanism: 'CYP3A4 inhibition',
        clinicalEffect: 'Slightly increased statin levels and myopathy risk',
        management: [
          'Monitor for muscle symptoms',
          'Consider lower atorvastatin dose if symptoms occur',
          'Check CK if muscle symptoms develop'
        ],
        monitoring: ['Muscle pain/weakness', 'CK levels if symptomatic'],
        alternatives: ['Rosuvastatin (less CYP3A4 metabolism)']
      }
    },
    'metformin': {
      'ciprofloxacin': {
        severity: 'minor',
        description: 'Fluoroquinolones may affect glucose control',
        mechanism: 'Variable effects on glucose metabolism',
        clinicalEffect: 'Possible alterations in blood glucose',
        management: [
          'Monitor blood glucose during antibiotic course',
          'Be aware of potential glucose changes',
          'Continue metformin unless contraindicated'
        ],
        monitoring: ['Blood glucose', 'Diabetic symptoms'],
        alternatives: ['Alternative antibiotics if glucose becomes unstable']
      }
    }
  };

  const filteredMedications = medicationDatabase.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.brandNames.some(brand => brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addMedication = (medication: Medication) => {
    if (!selectedMedications.find(med => med.id === medication.id)) {
      setSelectedMedications([...selectedMedications, medication]);
    }
    setSearchTerm('');
  };

  const removeMedication = (medicationId: string) => {
    setSelectedMedications(selectedMedications.filter(med => med.id !== medicationId));
  };

  const checkInteractions = (): InteractionResult[] => {
    const interactions: InteractionResult[] = [];
    
    for (let i = 0; i < selectedMedications.length; i++) {
      for (let j = i + 1; j < selectedMedications.length; j++) {
        const med1 = selectedMedications[i];
        const med2 = selectedMedications[j];
        
        // Check both directions
        const interaction = interactionDatabase[med1.id]?.[med2.id] || 
                         interactionDatabase[med2.id]?.[med1.id];
        
        if (interaction) {
          interactions.push({
            medication1: med1,
            medication2: med2,
            interaction
          });
        }
      }
    }
    
    return interactions.sort((a, b) => {
      const severityOrder = { 'contraindicated': 4, 'major': 3, 'moderate': 2, 'minor': 1 };
      return severityOrder[b.interaction.severity] - severityOrder[a.interaction.severity];
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'contraindicated': return 'bg-red-100 border-red-500 text-red-800';
      case 'major': return 'bg-red-50 border-red-400 text-red-700';
      case 'moderate': return 'bg-orange-50 border-orange-400 text-orange-700';
      case 'minor': return 'bg-yellow-50 border-yellow-400 text-yellow-700';
      default: return 'bg-gray-50 border-gray-400 text-gray-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'contraindicated': return <Zap className="w-5 h-5 text-red-600" />;
      case 'major': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'moderate': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'minor': return <Shield className="w-5 h-5 text-yellow-600" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const interactions = showResults ? checkInteractions() : [];

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Pill className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Medication Interaction Checker</h3>
      </div>

      {/* Search and Add Medications */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search and add medications:
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Search by medication name (e.g., lisinopril, warfarin, sertraline)"
          />
        </div>

        {/* Search Results */}
        {searchTerm && filteredMedications.length > 0 && (
          <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm">
            {filteredMedications.slice(0, 10).map((medication) => (
              <div
                key={medication.id}
                onClick={() => addMedication(medication)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{medication.name}</div>
                    <div className="text-sm text-gray-600">
                      {medication.category} • {medication.brandNames.join(', ')}
                    </div>
                  </div>
                  <span className="text-primary-600 text-sm">Add</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Medications */}
      {selectedMedications.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Selected Medications ({selectedMedications.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedMedications.map((medication) => (
              <div key={medication.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-blue-900">{medication.name}</div>
                    <div className="text-sm text-blue-700">{medication.category}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {medication.commonDoses.join(', ')}
                    </div>
                  </div>
                  <button
                    onClick={() => removeMedication(medication.id)}
                    className="ml-2 p-1 text-blue-600 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check Interactions Button */}
      {selectedMedications.length >= 2 && (
        <div className="mb-6">
          <button
            onClick={() => setShowResults(true)}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium"
          >
            Check for Interactions ({selectedMedications.length} medications)
          </button>
        </div>
      )}

      {/* Results */}
      {showResults && selectedMedications.length >= 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">
              Interaction Results ({interactions.length} interactions found)
            </h4>
            <button
              onClick={() => setShowResults(false)}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              Hide Results
            </button>
          </div>

          {interactions.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h5 className="text-lg font-medium text-green-900 mb-2">No Known Interactions</h5>
              <p className="text-green-700">
                No significant interactions found between the selected medications.
                Always consult current drug interaction databases for the most up-to-date information.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {interactions.map((result, index) => (
                <div key={index} className={`border-2 rounded-lg p-6 ${getSeverityColor(result.interaction.severity)}`}>
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(result.interaction.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-bold text-lg">
                          {result.medication1.name} + {result.medication2.name}
                        </h5>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          result.interaction.severity === 'contraindicated' ? 'bg-red-200 text-red-800' :
                          result.interaction.severity === 'major' ? 'bg-red-100 text-red-700' :
                          result.interaction.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {result.interaction.severity.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h6 className="font-semibold mb-1">Description:</h6>
                          <p className="text-sm">{result.interaction.description}</p>
                        </div>

                        <div>
                          <h6 className="font-semibold mb-1">Mechanism:</h6>
                          <p className="text-sm">{result.interaction.mechanism}</p>
                        </div>

                        <div>
                          <h6 className="font-semibold mb-1">Clinical Effect:</h6>
                          <p className="text-sm">{result.interaction.clinicalEffect}</p>
                        </div>

                        <div>
                          <h6 className="font-semibold mb-2">Management:</h6>
                          <ul className="text-sm space-y-1">
                            {result.interaction.management.map((item, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 mr-2 flex-shrink-0"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h6 className="font-semibold mb-2">Monitoring Required:</h6>
                          <ul className="text-sm space-y-1">
                            {result.interaction.monitoring.map((item, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 mr-2 flex-shrink-0"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {result.interaction.alternatives && result.interaction.alternatives.length > 0 && (
                          <div>
                            <h6 className="font-semibold mb-2">Alternative Medications:</h6>
                            <ul className="text-sm space-y-1">
                              {result.interaction.alternatives.map((alt, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 mr-2 flex-shrink-0"></span>
                                  {alt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clinical Reminders */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Important Clinical Reminders:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• This tool provides common interactions - always check current interaction databases</li>
              <li>• Consider patient-specific factors (age, kidney/liver function, genetics)</li>
              <li>• Monitor patients closely when starting new medications</li>
              <li>• Some interactions may require dose adjustments rather than complete avoidance</li>
              <li>• Consult pharmacy or clinical pharmacist for complex cases</li>
              <li>• Patient education about interaction signs/symptoms is crucial</li>
            </ul>
          </div>

          <button
            onClick={() => {
              setSelectedMedications([]);
              setShowResults(false);
            }}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Clear All Medications
          </button>
        </div>
      )}

      {/* Instructions */}
      {selectedMedications.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-2">How to Use This Tool:</h4>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Search for medications by generic or brand name</li>
            <li>Click to add medications to your list</li>
            <li>Add at least 2 medications to check for interactions</li>
            <li>Review interaction severity and management recommendations</li>
            <li>Use clinical judgment and consult additional resources as needed</li>
          </ol>
        </div>
      )}

      {selectedMedications.length === 1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Add at least one more medication to check for interactions.
          </p>
        </div>
      )}
    </div>
  );
};