import { AlertTriangle, Info, Clock, Heart, X } from 'lucide-react';

interface SymptomInfoPanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

const demoSymptoms = [
  { 
    symptom: "shortness of breath", 
    description: "Try typing this to see heart failure and COPD tools",
    icon: Heart,
    color: "text-blue-600"
  },
  { 
    symptom: "chest pain", 
    description: "Leads to cardiovascular assessment tools",
    icon: AlertTriangle,
    color: "text-red-600"
  },
  { 
    symptom: "anxiety", 
    description: "Shows mental health screening tools",
    icon: Info,
    color: "text-purple-600"
  },
  { 
    symptom: "frequent urination", 
    description: "Points to diabetes and UTI assessments",
    icon: Clock,
    color: "text-yellow-600"
  }
];

export const SymptomInfoPanel = ({ isVisible, onClose }: SymptomInfoPanelProps) => {
  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Info className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-900">
              New: Symptom-to-Tool Search
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 min-h-touch-md min-w-touch-md flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors rounded-md hover:bg-blue-100"
                aria-label="Close info panel"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-blue-800 mb-4">
            You can now search by symptoms to quickly find relevant clinical tools and assessments. 
            Try typing a symptom like those below:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoSymptoms.map((demo, index) => {
              const IconComponent = demo.icon;
              return (
                <div key={index} className="flex items-center space-x-3 bg-white bg-opacity-50 rounded-lg p-3">
                  <IconComponent className={`w-5 h-5 ${demo.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      "{demo.symptom}"
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {demo.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Pro tip:</strong> The search understands natural language and medical terms. 
              It also shows urgency levels to help prioritize care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};