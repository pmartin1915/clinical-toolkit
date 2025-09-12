import { AlertTriangle, Shield, Heart, Calculator } from 'lucide-react';

export type DisclaimerType = 'general' | 'clinical-tool' | 'assessment' | 'emergency' | 'educational';

interface StandardizedDisclaimerProps {
  type: DisclaimerType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

const disclaimerContent = {
  general: {
    icon: AlertTriangle,
    title: 'Educational Use Only',
    text: 'This tool is for educational purposes only. Always consult healthcare professionals for medical advice, diagnosis, or treatment.',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-800 dark:text-amber-200'
  },
  'clinical-tool': {
    icon: Calculator,
    title: 'Clinical Tool Disclaimer',
    text: 'This calculator provides estimates only. Results require professional clinical interpretation and should be validated by qualified healthcare providers. Individual patient factors may significantly affect treatment decisions.',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-800 dark:text-blue-200'
  },
  assessment: {
    icon: Shield,
    title: 'Assessment Tool Notice',
    text: 'This screening tool aids in assessment but does not replace clinical judgment. Results require comprehensive evaluation by qualified healthcare professionals for definitive diagnosis and treatment planning.',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600',
    textColor: 'text-purple-800 dark:text-purple-200'
  },
  emergency: {
    icon: AlertTriangle,
    title: 'Emergency Situations',
    text: 'This tool is not designed for emergency medical situations. If you are experiencing a medical emergency, immediately contact emergency services (911 in the US) or visit the nearest emergency room.',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600',
    textColor: 'text-red-800 dark:text-red-200'
  },
  educational: {
    icon: Heart,
    title: 'Educational Reference',
    text: 'This information is provided for educational purposes and should supplement, not replace, discussion with your healthcare provider. Medical knowledge evolves rapidly - verify information with current sources.',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600',
    textColor: 'text-green-800 dark:text-green-200'
  }
};

const sizeClasses = {
  sm: {
    container: 'p-3',
    icon: 'w-4 h-4',
    text: 'text-xs',
    title: 'text-xs font-medium mb-1'
  },
  md: {
    container: 'p-4',
    icon: 'w-5 h-5',
    text: 'text-sm',
    title: 'text-sm font-medium mb-1'
  },
  lg: {
    container: 'p-5',
    icon: 'w-6 h-6',
    text: 'text-base',
    title: 'text-base font-medium mb-2'
  }
};

export const StandardizedDisclaimer = ({
  type,
  size = 'md',
  className = '',
  showIcon = true
}: StandardizedDisclaimerProps) => {
  const content = disclaimerContent[type];
  const sizeClass = sizeClasses[size];
  const Icon = content.icon;

  return (
    <div className={`${content.bgColor} ${content.borderColor} border rounded-lg ${sizeClass.container} ${className}`}>
      <div className="flex items-start space-x-2">
        {showIcon && (
          <Icon className={`${content.iconColor} ${sizeClass.icon} mt-0.5 flex-shrink-0`} />
        )}
        <div>
          <p className={`${content.textColor} ${sizeClass.title}`}>
            <strong>{content.title}:</strong>
          </p>
          <p className={`${content.textColor} ${sizeClass.text} leading-relaxed`}>
            {content.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StandardizedDisclaimer;