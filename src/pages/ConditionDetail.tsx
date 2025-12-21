import { useState, useEffect, lazy, Suspense } from 'react';
import { ArrowLeft, Book, Calculator, Target, FileText, GraduationCap } from 'lucide-react';
import type { Condition } from '../types';
import { PlainLanguageSummary } from '../components/ui/PlainLanguageSummary';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { trackLazyLoad } from '../utils/performance/lazyLoadTracker';
// Lazy-loaded tool components for better performance
const A1CConverter = lazy(() => trackLazyLoad(() => import('../components/tools/A1CConverter').then(m => ({ default: m.A1CConverter })), 'A1CConverter'));
const GAD7Assessment = lazy(() => trackLazyLoad(() => import('../components/tools/GAD7Assessment').then(m => ({ default: m.GAD7Assessment })), 'GAD7Assessment'));
const EnhancedASCVDCalculator = lazy(() => trackLazyLoad(() => import('../components/tools/EnhancedASCVDCalculator').then(m => ({ default: m.EnhancedASCVDCalculator })), 'EnhancedASCVDCalculator'));
const PHQ9Assessment = lazy(() => trackLazyLoad(() => import('../components/tools/PHQ9Assessment').then(m => ({ default: m.PHQ9Assessment })), 'PHQ9Assessment'));
const BMICalculator = lazy(() => trackLazyLoad(() => import('../components/calculators/BMICalculator').then(m => ({ default: m.BMICalculator })), 'BMICalculator'));
const BPTracker = lazy(() => trackLazyLoad(() => import('../components/tools/BPTracker').then(m => ({ default: m.BPTracker })), 'BPTracker'));
const TriglycerideCalculator = lazy(() => trackLazyLoad(() => import('../components/tools/TriglycerideCalculator').then(m => ({ default: m.TriglycerideCalculator })), 'TriglycerideCalculator'));
const UTIAssessment = lazy(() => trackLazyLoad(() => import('../components/tools/UTIAssessment').then(m => ({ default: m.UTIAssessment })), 'UTIAssessment'));
const UTIDiagnostic = lazy(() => trackLazyLoad(() => import('../components/tools/UTIDiagnostic').then(m => ({ default: m.UTIDiagnostic })), 'UTIDiagnostic'));
const SinusitisAssessment = lazy(() => trackLazyLoad(() => import('../components/tools/SinusitisAssessment').then(m => ({ default: m.SinusitisAssessment })), 'SinusitisAssessment'));
const SinusitisDiagnostic = lazy(() => trackLazyLoad(() => import('../components/tools/SinusitisDiagnostic').then(m => ({ default: m.SinusitisDiagnostic })), 'SinusitisDiagnostic'));
const HypertensionManagement = lazy(() => trackLazyLoad(() => import('../components/tools/HypertensionManagement').then(m => ({ default: m.HypertensionManagement })), 'HypertensionManagement'));
const DiabetesTreatment = lazy(() => trackLazyLoad(() => import('../components/tools/DiabetesTreatment').then(m => ({ default: m.DiabetesTreatment })), 'DiabetesTreatment'));
const DepressionTreatment = lazy(() => trackLazyLoad(() => import('../components/tools/DepressionTreatment').then(m => ({ default: m.DepressionTreatment })), 'DepressionTreatment'));
const MedicationInteractionChecker = lazy(() => trackLazyLoad(() => import('../components/tools/MedicationInteractionChecker').then(m => ({ default: m.MedicationInteractionChecker })), 'MedicationInteractionChecker'));
const RiskStratification = lazy(() => trackLazyLoad(() => import('../components/tools/RiskStratification').then(m => ({ default: m.RiskStratification })), 'RiskStratification'));
const PatientEducation = lazy(() => trackLazyLoad(() => import('../components/tools/PatientEducation').then(m => ({ default: m.PatientEducation })), 'PatientEducation'));
const SelfManagement = lazy(() => trackLazyLoad(() => import('../components/tools/SelfManagement').then(m => ({ default: m.SelfManagement })), 'SelfManagement'));
const COPDAssessment = lazy(() => trackLazyLoad(() => import('../components/tools/COPDAssessment').then(m => ({ default: m.COPDAssessment })), 'COPDAssessment'));
const AsthmaControlTest = lazy(() => trackLazyLoad(() => import('../components/tools/AsthmaControlTest').then(m => ({ default: m.AsthmaControlTest })), 'AsthmaControlTest'));
const NYHAClassification = lazy(() => trackLazyLoad(() => import('../components/tools/NYHAClassification').then(m => ({ default: m.NYHAClassification })), 'NYHAClassification'));
const CHA2DS2VAScCalculator = lazy(() => trackLazyLoad(() => import('../components/tools/CHA2DS2VAScCalculator').then(m => ({ default: m.CHA2DS2VAScCalculator })), 'CHA2DS2VAScCalculator'));
const EGFRCalculator = lazy(() => trackLazyLoad(() => import('../components/tools/eGFRCalculator').then(m => ({ default: m.EGFRCalculator })), 'EGFRCalculator'));
const CreatinineClearanceCalculator = lazy(() => trackLazyLoad(() => import('../components/tools/CreatinineClearanceCalculator').then(m => ({ default: m.CreatinineClearanceCalculator })), 'CreatinineClearanceCalculator'));
const OttawaAnkleRules = lazy(() => trackLazyLoad(() => import('../components/tools/OttawaAnkleRules').then(m => ({ default: m.OttawaAnkleRules })), 'OttawaAnkleRules'));
const DrugDosingCalculator = lazy(() => trackLazyLoad(() => import('../components/tools/DrugDosingCalculator').then(m => ({ default: m.DrugDosingCalculator })), 'DrugDosingCalculator'));
const WellsScore = lazy(() => trackLazyLoad(() => import('../components/tools/WellsScore').then(m => ({ default: m.WellsScore })), 'WellsScore'));

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

  // Scroll to top when tab or tool changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, selectedTool]);

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
      case 'enhanced-ascvd-calculator':
        return <EnhancedASCVDCalculator />;
      case 'phq9-assessment':
        return <PHQ9Assessment />;
      case 'depression-treatment':
        return <DepressionTreatment />;
      case 'bmi-calculator':
        return <BMICalculator />;
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
      case 'creatinine-clearance-calculator':
        return <CreatinineClearanceCalculator />;
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
          className="inline-flex items-center px-4 py-3 min-h-touch-md text-primary-600 hover:text-primary-700 mb-4 rounded-md hover:bg-primary-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Conditions
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{condition.title}</h1>
        <p className="text-lg text-gray-600">{condition.shortDescription}</p>
      </div>

      {/* Tabs - Mobile Optimized */}
      <div className="border-b border-gray-200 mb-6">
        {/* Mobile Swipe Hint - Above tabs */}
        <div className="sm:hidden mb-2 text-center">
          <span className="text-xs text-gray-400">Swipe to see all tabs →</span>
        </div>
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
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
                <p className="text-gray-600">Loading tool...</p>
              </div>
            </div>
          }>
            {renderTool(selectedTool)}
          </Suspense>
        </div>
      ) : (
        <div ref={swipeRef as React.RefObject<HTMLDivElement>} className="touch-pan-y">
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
                      className="inline-block px-4 py-3 min-h-touch-md text-primary-600 hover:text-primary-700 text-sm rounded-md hover:bg-primary-50 transition-colors"
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
