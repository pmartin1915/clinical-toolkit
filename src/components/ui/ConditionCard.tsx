import { ChevronRight } from 'lucide-react';
import type { Condition } from '../../types';

interface ConditionCardProps {
  condition: Condition;
  onClick: () => void;
}

const severityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200'
};

const categoryIcons = {
  cardiovascular: '🫀',
  endocrine: '⚡',
  'mental-health': '🧠',
  infectious: '🦠',
  metabolic: '🔬'
};

export const ConditionCard = ({ condition, onClick }: ConditionCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{categoryIcons[condition.category]}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severityColors[condition.severity]}`}>
              {condition.severity.toUpperCase()}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {condition.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {condition.shortDescription}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{condition.tools.length} tools available</span>
            <div className="flex items-center space-x-1 text-primary-600 group-hover:text-primary-700">
              <span>View details</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};