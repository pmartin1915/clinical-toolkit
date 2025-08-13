import { useState } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { ConditionCard } from '../components/ui/ConditionCard';
import { hypertension } from '../data/conditions/hypertension';
import { diabetes } from '../data/conditions/diabetes';
import { anxiety } from '../data/conditions/anxiety';
import { depression } from '../data/conditions/depression';
import { hypertriglyceridemia } from '../data/conditions/hypertriglyceridemia';
import { rhinosinusitis } from '../data/conditions/rhinosinusitis';
import { uti } from '../data/conditions/uti';
import { copd } from '../data/conditions/copd';
import { heartFailure } from '../data/conditions/heart-failure';
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
];

interface DashboardProps {
  onConditionSelect: (conditionId: string) => void;
}

export const Dashboard = ({ onConditionSelect }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'prevalence'>('name');

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
    { value: 'metabolic', label: 'Metabolic' }
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

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conditions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="text-gray-400 w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'prevalence')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">Sort A-Z</option>
              <option value="prevalence">Sort by Prevalence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conditions Grid */}
      {filteredAndSortedConditions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedConditions.map(condition => (
            <ConditionCard
              key={condition.id}
              condition={condition}
              onClick={() => onConditionSelect(condition.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
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
    </div>
  );
};