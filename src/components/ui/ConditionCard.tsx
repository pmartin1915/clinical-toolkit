import { Heart, Activity, Brain, Microscope, FlaskConical, Bone } from 'lucide-react';
import type { Condition } from '../../types';
import { StatusIndicator } from './StatusIndicator';
import { getConditionAudit } from '../../utils/toolAudit';
import { MedicalButton, MedicalCard } from '@medical-wizards/ui';

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
  cardiovascular: Heart,
  endocrine: Activity,
  'mental-health': Brain,
  infectious: Microscope,
  metabolic: FlaskConical,
  orthopedic: Bone
};

export const ConditionCard = ({ condition, onClick }: ConditionCardProps) => {
  const toolIds = condition.tools.map(tool => tool.id);
  const auditResult = getConditionAudit(condition.id, toolIds);

  return (
    <MedicalCard.Clinical
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {(() => {
                const IconComponent = categoryIcons[condition.category as keyof typeof categoryIcons];
                return IconComponent ? <IconComponent className="w-6 h-6 text-primary-600" /> : null;
              })()}
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severityColors[condition.severity]}`}>
                {condition.severity.toUpperCase()}
              </span>
            </div>
            <StatusIndicator status={auditResult.overallStatus} size="sm" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {condition.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {condition.shortDescription}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-500">
              <span>{auditResult.completedTools}/{auditResult.totalTools} tools complete</span>
            </div>
            <div className="flex items-center space-x-1">
              <MedicalButton.Clinical size="sm">
                Try tools →
              </MedicalButton.Clinical>
            </div>
          </div>
        </div>
      </div>
    </MedicalCard.Clinical>
  );
};