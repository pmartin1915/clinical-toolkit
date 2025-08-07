import { useState } from 'react';
import { ArrowLeft, Book, Calculator, Target, FileText, GraduationCap } from 'lucide-react';
import type { Condition } from '../types';
import { A1CConverter } from '../components/tools/A1CConverter';
import { GAD7Assessment } from '../components/tools/GAD7Assessment';
import { ASCVDCalculator } from '../components/tools/ASCVDCalculator';
import { PHQ9Assessment } from '../components/tools/PHQ9Assessment';
import { BPTracker } from '../components/tools/BPTracker';

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

  const renderTool = (toolId: string) => {
    switch (toolId) {
      case 'a1c-converter':
        return <A1CConverter />;
      case 'gad7-assessment':
        return <GAD7Assessment />;
      case 'ascvd-calculator':
        return <ASCVDCalculator />;
      case 'phq9-assessment':
        return <PHQ9Assessment />;
      case 'bp-tracker':
        return <BPTracker />;
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedTool(null);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
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
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Definition</h2>
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
                    onClick={() => setSelectedTool(tool.id)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Icon className="w-6 h-6 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {tool.type}
                    </span>
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