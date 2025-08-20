import { X, Search, AlertTriangle, Stethoscope, Book } from 'lucide-react';

interface ClinicalSearchTipsProps {
  isVisible: boolean;
  onClose: () => void;
}

export const ClinicalSearchTips = ({ isVisible, onClose }: ClinicalSearchTipsProps) => {
  if (!isVisible) return null;

  const searchExamples = [
    {
      category: "Medical Terminology",
      icon: Stethoscope,
      examples: [
        { term: "dyspnea", description: "Medical term for shortness of breath" },
        { term: "hemoptysis", description: "Coughing up blood" },
        { term: "polydipsia", description: "Excessive thirst" },
        { term: "dysuria", description: "Painful urination" }
      ]
    },
    {
      category: "ICD-10 Codes",
      icon: Book,
      examples: [
        { term: "R06.02", description: "Shortness of breath" },
        { term: "R31.9", description: "Hematuria (blood in urine)" },
        { term: "I48.91", description: "Atrial fibrillation" },
        { term: "R05", description: "Cough" }
      ]
    },
    {
      category: "Patient-Friendly Terms",
      icon: Search,
      examples: [
        { term: "can't breathe", description: "Difficulty breathing" },
        { term: "chest hurt", description: "Chest pain or discomfort" },
        { term: "swollen legs", description: "Peripheral edema" },
        { term: "always thirsty", description: "Polydipsia" }
      ]
    },
    {
      category: "High-Priority Symptoms",
      icon: AlertTriangle,
      examples: [
        { term: "sudden dyspnea", description: "Emergency - possible PE" },
        { term: "crushing chest pain", description: "High priority - cardiac workup" },
        { term: "hemoptysis", description: "High priority - requires imaging" },
        { term: "atrial fibrillation", description: "Stroke risk assessment needed" }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center space-x-3">
            <Search className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Enhanced Clinical Search</h2>
              <p className="text-sm text-gray-600">Search with medical terminology, ICD-10 codes, and clinical intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Close search tips"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Search Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🔍 Intelligent Matching</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Fuzzy matching for typos</li>
                  <li>• Medical terminology recognition</li>
                  <li>• Multi-word phrase matching</li>
                  <li>• Synonym and alias detection</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">⚡ Clinical Intelligence</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Red flag identification</li>
                  <li>• Urgency-based prioritization</li>
                  <li>• Differential diagnosis hints</li>
                  <li>• Evidence-based tool suggestions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {searchExamples.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <IconComponent className={`w-5 h-5 ${
                      category.category === 'High-Priority Symptoms' ? 'text-red-600' :
                      category.category === 'Medical Terminology' ? 'text-blue-600' :
                      category.category === 'ICD-10 Codes' ? 'text-purple-600' :
                      'text-green-600'
                    }`} />
                    <h4 className="font-semibold text-gray-900">{category.category}</h4>
                  </div>
                  <div className="space-y-2">
                    {category.examples.map((example, exampleIndex) => (
                      <div key={exampleIndex} className="flex items-start space-x-2">
                        <code className={`px-2 py-1 rounded text-xs font-mono ${
                          category.category === 'High-Priority Symptoms' ? 'bg-red-100 text-red-800' :
                          category.category === 'Medical Terminology' ? 'bg-blue-100 text-blue-800' :
                          category.category === 'ICD-10 Codes' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {example.term}
                        </code>
                        <span className="text-sm text-gray-600 flex-1">{example.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Search Features in Action</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-800 mb-2">🎯 Smart Results Include:</h5>
                <ul className="text-gray-700 space-y-1">
                  <li>• Primary medical terms and patient-friendly synonyms</li>
                  <li>• ICD-10 codes for documentation</li>
                  <li>• Clinical red flags requiring immediate attention</li>
                  <li>• Differential diagnosis considerations</li>
                  <li>• Recommended diagnostic tests and physical exam</li>
                  <li>• Evidence-based assessment tools</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800 mb-2">🚨 Priority System:</h5>
                <ul className="text-gray-700 space-y-1">
                  <li>• <span className="text-red-600 font-medium">EMERGENCY</span>: Requires immediate evaluation</li>
                  <li>• <span className="text-orange-600 font-medium">HIGH</span>: Urgent assessment needed</li>
                  <li>• <span className="text-yellow-600 font-medium">MEDIUM</span>: Timely evaluation recommended</li>
                  <li>• <span className="text-green-600 font-medium">LOW</span>: Routine assessment appropriate</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-yellow-800 mb-1">Important Disclaimer</h5>
                <p className="text-sm text-yellow-700">
                  This search system provides clinical decision support for educational purposes. 
                  Always use clinical judgment and consult current medical literature. 
                  Emergency symptoms require immediate medical evaluation regardless of search results.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Enhanced search includes 40+ clinical symptoms with medical terminology, ICD-10 codes, and evidence-based guidance
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Start Searching
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};