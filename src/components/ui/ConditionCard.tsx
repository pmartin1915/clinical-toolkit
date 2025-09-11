import { Heart, Activity, Brain, Microscope, FlaskConical, Bone } from 'lucide-react';
import { MedicalCard, CardHeader, CardTitle, CardContent, Button } from '@medical-wizards/ui';
import type { Condition } from '../../types';
import { StatusIndicator } from './StatusIndicator';
import { getConditionAudit } from '../../utils/toolAudit';
import { MedicalButton, MedicalCard } from '@medical-wizards/ui';

interface ConditionCardProps {
  condition: Condition;
  onClick: () => void;
}

const severityColors = {
  low: 'text-green-700 bg-green-50 border-green-200',
  medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  high: 'text-red-700 bg-red-50 border-red-200',
  critical: 'text-red-800 bg-red-100 border-red-300'
};

const categoryIcons = {
  cardiovascular: Heart,
  pulmonary: Activity,
  neurological: Brain,
  laboratory: Microscope,
  metabolic: FlaskConical,
  orthopedic: Bone
};

export const ConditionCard = ({ condition, onClick }: ConditionCardProps) => {
  const toolIds = condition.tools.map(tool => tool.id);
  const auditResult = getConditionAudit(condition.id, toolIds);

  return (
    <MedicalCard.Interactive onClick={onClick}>
      <CardHeader variant="clinical" padding="default">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {(() => {
              const IconComponent = categoryIcons[condition.category as keyof typeof categoryIcons];
              return IconComponent ? <IconComponent className="w-6 h-6 text-primary" /> : null;
            })()}
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severityColors[condition.severity]}`}>
              {condition.severity.toUpperCase()}
            </span>
          </div>
          <StatusIndicator status={auditResult.overallStatus} size="sm" />
        </div>
        
        <CardTitle variant="clinical" size="lg">
          {condition.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {condition.shortDescription}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            <span>{auditResult.completedTools}/{auditResult.totalTools} tools complete</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm">
              Try tools →
            </Button>
          </div>
        </div>
      </CardContent>
    </MedicalCard.Interactive>
  );
};