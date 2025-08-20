import { useState } from 'react';
import { ArrowLeft, Book, Calculator, Target, FileText, GraduationCap } from 'lucide-react';
import type { Condition } from '../types';
import { PlainLanguageSummary } from '../components/ui/PlainLanguageSummary';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { A1CConverter } from '../components/tools/A1CConverter';
import { GAD7Assessment } from '../components/tools/GAD7Assessment';
import { ASCVDCalculator } from '../components/tools/ASCVDCalculator';
import { EnhancedASCVDCalculator } from '../components/tools/EnhancedASCVDCalculator';
import { PHQ9Assessment } from '../components/tools/PHQ9Assessment';
import { BPTracker } from '../components/tools/BPTracker';
import { TriglycerideCalculator } from '../components/tools/TriglycerideCalculator';
import { UTIAssessment } from '../components/tools/UTIAssessment';
import { UTIDiagnostic } from '../components/tools/UTIDiagnostic';
import { SinusitisAssessment } from '../components/tools/SinusitisAssessment';
import { SinusitisDiagnostic } from '../components/tools/SinusitisDiagnostic';
import { HypertensionManagement } from '../components/tools/HypertensionManagement';
import { DiabetesTreatment } from '../components/tools/DiabetesTreatment';
import { DepressionTreatment } from '../components/tools/DepressionTreatment';
import { MedicationInteractionChecker } from '../components/tools/MedicationInteractionChecker';
import { RiskStratification } from '../components/tools/RiskStratification';
import { PatientEducation } from '../components/tools/PatientEducation';
import { SelfManagement } from '../components/tools/SelfManagement';
import { COPDAssessment } from '../components/tools/COPDAssessment';
import { AsthmaControlTest } from '../components/tools/AsthmaControlTest';
import { NYHAClassification } from '../components/tools/NYHAClassification';
import { CHA2DS2VAScCalculator } from '../components/tools/CHA2DS2VAScCalculator';
import { eGFRCalculator as EGFRCalculator } from '../components/tools/eGFRCalculator';
import { OttawaAnkleRules } from '../components/tools/OttawaAnkleRules';
import { DrugDosingCalculator } from '../components/tools/DrugDosingCalculator';
import { WellsScore } from '../components/tools/WellsScore';

interface ConditionDetailProps {
  condition: Condition;
  onBack: () => void;
}

const toolIcons = {
  calculator: Calculator,
  assessment: Target,
  tracker: FileText,
  reference: Book,
  education: GraduationCap
};

export const ConditionDetail = ({ condition, onBack }: ConditionDetailProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'guidelines' | 'tools' | 'resources'>('overview');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'guidelines', label: 'Guidelines', icon: FileText },
    { id: 'tools', label: 'Tools', icon: Calculator },
    { id: 'resources', label: 'Resources', icon: GraduationCap }
  ] as const;

  const navigateTab = (direction: 'next' | 'prev') => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    }
    
    setActiveTab(tabs[newIndex].id);
    setSelectedTool(null);
  };

  const swipeRef = useSwipeGesture({
    onSwipeLeft: () => navigateTab('next'),
    onSwipeRight: () => navigateTab('prev'),
    threshold: 100
  });

  const renderTool = (toolId: string) => {
    switch (toolId) {
      case 'a1c-converter':
        return <A1CConverter />;
      case 'diabetes-treatment':
        return <DiabetesTreatment />;
      case 'gad7-assessment':
        return <GAD7Assessment />;
      case 'ascvd-calculator':
        return <ASCVDCalculator />;
      case 'enhanced-ascvd-calculator':
        return <EnhancedASCVDCalculator />;
      case 'phq9-assessment':
        return <PHQ9Assessment />;
      case 'depression-treatment':
        return <DepressionTreatment />;
      case 'bp-tracker':
        return <BPTracker />;
      case 'hypertension-management':
        return <HypertensionManagement />;
      case 'triglyceride-calculator':
        return <TriglycerideCalculator />;
      case 'uti-assessment':
        return <UTIAssessment />;
      case 'uti-diagnostic':
        return <UTIDiagnostic />;
      case 'sinusitis-assessment':
        return <SinusitisAssessment />;
      case 'sinusitis-diagnostic':
        return <SinusitisDiagnostic />;
      case 'medication-interaction-checker':
        return <MedicationInteractionChecker />;
      case 'risk-stratification':
        return <RiskStratification />;
      case 'patient-education':
        return <PatientEducation condition={condition.id} />;
      case 'self-management':
        return <SelfManagement condition={condition.id} />;
      case 'copd-assessment':
        return <COPDAssessment />;
      case 'asthma-control-test':
        return <AsthmaControlTest />;
      case 'nyha-classification':
        return <NYHAClassification />;
      case 'cha2ds2-vasc-calculator':
        return <CHA2DS2VAScCalculator />;
      case 'egfr-calculator':
        return <EGFRCalculator />;
      case 'ottawa-ankle-rules':
        return <OttawaAnkleRules />;
      case 'drug-dosing-calculator':
        return <DrugDosingCalculator />;
      case 'wells-score':
        return <WellsScore />;
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <Calculator className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>This tool is coming soon!</p>
            <p className="text-sm mt-2">Tool ID: {toolId}</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Conditions
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{condition.title}</h1>
        <p className="text-lg text-gray-600">{condition.shortDescription}</p>
      </div>

      {/* Tabs - Mobile Optimized */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px overflow-x-auto scrollbar-hide scroll-smooth touch-pan-x">
          <div className="flex space-x-2 sm:space-x-8 min-w-max px-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedTool(null);
                  }}
                  className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap flex-shrink-0 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        
        {/* Mobile Tab Indicator Dots */}
        <div className="sm:hidden mt-3 flex justify-center space-x-2">
          {tabs.map((tab) => (
            <button
              key={`dot-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedTool(null);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                activeTab === tab.id ? 'bg-primary-500' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Switch to ${tab.label} tab`}
            />
          ))}
        </div>
        
        {/* Mobile Swipe Hint */}
        <div className="sm:hidden mt-1 text-center">
          <span className="text-xs text-gray-400">← Swipe to see all tabs →</span>
        </div>
      </div>

      {/* Tab Content */}
      {selectedTool ? (
        <div>
          <button
            onClick={() => setSelectedTool(null)}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Tools
          </button>
          {renderTool(selectedTool)}
        </div>
      ) : (
        <div ref={swipeRef as React.RefObject<HTMLDivElement>} className="touch-pan-y">
          {/* Swipe hint for mobile */}
          <div className="sm:hidden mb-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
              <span>←</span>
              <span>Swipe to navigate tabs</span>
              <span>→</span>
            </div>
          </div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <PlainLanguageSummary conditionId={condition.id} />
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Medical Definition</h2>
                <p className="text-gray-700">{condition.overview.definition}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Prevalence</h2>
                <p className="text-gray-700">{condition.overview.prevalence}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Key Points</h2>
                <ul className="space-y-2">
                  {condition.overview.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'guidelines' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Diagnosis</h2>
                <ul className="space-y-2">
                  {condition.guidelines.diagnosis.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Treatment</h2>
                {condition.guidelines.treatment.map((category, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">{category.category}</h3>
                    <div className="space-y-3">
                      {category.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{option.name}</h4>
                              {option.dosage && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Dosage:</strong> {option.dosage}
                                </p>
                              )}
                              {option.notes && (
                                <p className="text-sm text-gray-600 mt-1">{option.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {condition.tools.map((tool) => {
                const Icon = toolIcons[tool.type] || Calculator;
                return (
                  <div
                    key={tool.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all group"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Icon className="w-6 h-6 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {tool.type}
                      </span>
                      <button
                        onClick={() => setSelectedTool(tool.id)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors group-hover:shadow-md"
                      >
                        Try this tool →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              {condition.resources.map((resource, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                    {resource.type}
                  </span>
                  {resource.citation && (
                    <p className="text-sm text-gray-600">{resource.citation}</p>
                  )}
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Visit Resource →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};