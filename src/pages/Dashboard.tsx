import { useState } from 'react';
import { Filter, ArrowUpDown, Activity, Heart, Brain, Calculator, Stethoscope, TrendingUp, Shield, Info } from 'lucide-react';
import { ConditionCard } from '../components/ui/ConditionCard';
import { EnhancedSearch } from '../components/ui/EnhancedSearch';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { SymptomInfoPanel } from '../components/ui/SymptomInfoPanel';
import { CDSDemo } from '../components/ui/CDSDemo';
import { ClinicalSearchTips } from '../components/ui/ClinicalSearchTips';
import { hypertension } from '../data/conditions/hypertension';
import { diabetes } from '../data/conditions/diabetes';
import { anxiety } from '../data/conditions/anxiety';
import { depression } from '../data/conditions/depression';
import { hypertriglyceridemia } from '../data/conditions/hypertriglyceridemia';
import { rhinosinusitis } from '../data/conditions/rhinosinusitis';
import { uti } from '../data/conditions/uti';
import { copd } from '../data/conditions/copd';
import { heartFailure } from '../data/conditions/heart-failure';
import { emergencyOrthopedic } from '../data/conditions/emergency-orthopedic';
import type { Condition } from '../types';

// Prevalence data (approximate annual incidence/prevalence per 100,000)
const prevalenceData: Record<string, number> = {
  'hypertension': 45000, // 45% of adults
  'diabetes': 11000, // 11% of adults
  'anxiety': 18000, // 18% of adults (GAD)
  'depression': 8500, // 8.5% of adults annually
  'copd': 6300, // 6.3% of adults
  'heart-failure': 2300, // 2.3% of adults
  'uti': 12000, // 12% of women annually
  'rhinosinusitis': 12000, // 12% of adults annually
  'hypertriglyceridemia': 25000, // 25% of adults
  'emergency-orthopedic': 15000, // 15% of adults annually (trauma/injuries)
};

const conditions: Condition[] = [
  hypertension,
  diabetes,
  anxiety,
  depression,
  hypertriglyceridemia,
  rhinosinusitis,
  uti,
  copd,
  heartFailure,
  emergencyOrthopedic,
];

interface DashboardProps {
  onConditionSelect: (conditionId: string) => void;
}

export const Dashboard = ({ onConditionSelect }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'prevalence'>('name');
  const [showSymptomInfo, setShowSymptomInfo] = useState(true);
  const [showCDSDemo, setShowCDSDemo] = useState(false);
  const [showSearchTips, setShowSearchTips] = useState(false);

  const quickActions = [
    {
      id: 'bp-tracker',
      title: 'Check Blood Pressure',
      description: 'Track and categorize your BP readings',
      icon: Heart,
      conditionId: 'hypertension',
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      iconColor: 'text-red-600',
      status: 'complete' as const // 🟢 Complete
    },
    {
      id: 'a1c-converter',
      title: 'A1C to Glucose',
      description: 'Convert A1C percentage to glucose levels',
      icon: Calculator,
      conditionId: 'diabetes',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      status: 'complete' as const // 🟢 Complete
    },
    {
      id: 'phq9-assessment',
      title: 'Mood Check',
      description: 'Quick depression screening (PHQ-9)',
      icon: Brain,
      conditionId: 'depression',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      status: 'complete' as const // 🟢 Complete
    },
    {
      id: 'gad7-assessment',
      title: 'Anxiety Check',
      description: 'Assess anxiety levels (GAD-7)',
      icon: Activity,
      conditionId: 'anxiety',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600',
      status: 'complete' as const // 🟢 Complete
    },
    {
      id: 'enhanced-ascvd-calculator',
      title: 'Heart Risk',
      description: 'Comprehensive cardiovascular risk assessment',
      icon: TrendingUp,
      conditionId: 'hypertension',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      iconColor: 'text-orange-600',
      status: 'complete' as const // 🟢 Fixed with correct coefficients
    },
    {
      id: 'copd-assessment',
      title: 'Breathing Check',
      description: 'COPD assessment and monitoring',
      icon: Stethoscope,
      conditionId: 'copd',
      color: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
      iconColor: 'text-teal-600',
      status: 'complete' as const // 🟢 Complete
    },
    {
      id: 'cds-demo',
      title: 'Safety Alerts Demo',
      description: 'See Clinical Decision Support in action',
      icon: Shield,
      conditionId: null, // Special case for demo
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      iconColor: 'text-indigo-600',
      status: 'complete' as const // 🟢 Complete demo
    }
  ];

  const filteredAndSortedConditions = conditions
    .filter(condition => {
      const matchesSearch = condition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           condition.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || condition.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      } else {
        // Sort by prevalence (highest to lowest)
        const aPrevalence = prevalenceData[a.id] || 0;
        const bPrevalence = prevalenceData[b.id] || 0;
        return bPrevalence - aPrevalence;
      }
    });

  const categories = [
    { value: 'all', label: 'All Conditions' },
    { value: 'cardiovascular', label: 'Cardiovascular' },
    { value: 'endocrine', label: 'Endocrine' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'infectious', label: 'Infectious' },
    { value: 'metabolic', label: 'Metabolic' },
    { value: 'orthopedic', label: 'Emergency & Orthopedic' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Clinical Conditions
        </h1>
        <p className="text-lg text-gray-600">
          Evidence-based management guides for common clinical conditions
        </p>
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8" data-tour="quick-tools">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Health Tools</h2>
          <p className="text-sm text-gray-500">Popular calculators and assessments</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map(action => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  if (action.id === 'cds-demo') {
                    setShowCDSDemo(true);
                  } else if (action.conditionId) {
                    onConditionSelect(action.conditionId);
                  }
                }}
                className={`${action.color} border rounded-lg p-4 text-left transition-all hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`${action.iconColor} mt-1`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <div className="ml-2 mt-0.5">
                        <StatusIndicator status={action.status} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Symptom Search Info Panel */}
      <SymptomInfoPanel 
        isVisible={showSymptomInfo} 
        onClose={() => setShowSymptomInfo(false)} 
      />

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0 lg:items-start">
          {/* Search Section */}
          <div className="lg:col-span-2" data-tour="search">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Clinical Search & Symptom Assessment</h3>
                  <p className="text-sm text-gray-600">Search with medical terminology, ICD-10 codes, or patient-friendly terms. Includes red flags and clinical decision support.</p>
                </div>
                <button
                  onClick={() => setShowSearchTips(true)}
                  className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center space-x-1"
                >
                  <Info className="w-4 h-4" />
                  <span>Search Tips</span>
                </button>
              </div>
            </div>
            <EnhancedSearch
              conditions={conditions}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onConditionSelect={onConditionSelect}
              placeholder="Search conditions or describe symptoms..."
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 mb-1 w-full sm:w-auto">Try clinical terms:</span>
              {[
                'dyspnea', 
                'chest pain', 
                'hemoptysis', 
                'polyuria', 
                'ankle pain', 
                'palpitations',
                'R06.02',
                'atrial fibrillation'
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setSearchTerm(example)}
                  className="px-3 py-2 sm:py-1 bg-blue-50 text-blue-700 text-sm rounded-full hover:bg-blue-100 active:bg-blue-200 transition-colors border border-blue-200 touch-manipulation"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          {/* Filter Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Filter & Sort</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400 w-4 h-4 flex-shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="text-gray-400 w-4 h-4 flex-shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'prevalence')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="name">Sort A-Z</option>
                  <option value="prevalence">Sort by Prevalence</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions Grid */}
      {filteredAndSortedConditions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedConditions.map((condition, index) => (
            <div key={condition.id} data-tour={index === 0 ? "condition-card" : undefined}>
              <ConditionCard
                condition={condition}
                onClick={() => onConditionSelect(condition.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">�</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conditions found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Stats Section */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-primary-600">{conditions.length}</div>
          <div className="text-sm font-medium text-gray-900">Conditions</div>
          <div className="text-xs text-gray-500">Available for reference</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-primary-600">
            {conditions.reduce((sum, condition) => sum + condition.tools.length, 0)}
          </div>
          <div className="text-sm font-medium text-gray-900">Tools</div>
          <div className="text-xs text-gray-500">Calculators & assessments</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-primary-600">100%</div>
          <div className="text-sm font-medium text-gray-900">Evidence-based</div>
          <div className="text-xs text-gray-500">Current clinical guidelines</div>
        </div>
      </div>

      {/* CDS Demo Modal */}
      <CDSDemo 
        isVisible={showCDSDemo} 
        onClose={() => setShowCDSDemo(false)} 
      />

      {/* Clinical Search Tips Modal */}
      <ClinicalSearchTips 
        isVisible={showSearchTips} 
        onClose={() => setShowSearchTips(false)} 
      />
    </div>
  );
};