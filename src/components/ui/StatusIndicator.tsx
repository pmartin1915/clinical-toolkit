import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'complete' | 'partial' | 'incomplete';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StatusIndicator = ({ 
  status, 
  size = 'md', 
  showLabel = false, 
  className = '' 
}: StatusIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'complete':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Complete',
          description: 'Fully functional with proper validation'
        };
      case 'partial':
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'Partial',
          description: 'Basic functionality but missing features'
        };
      case 'incomplete':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Incomplete',
          description: 'Not functional or has major issues'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (showLabel) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className={`${config.bgColor} rounded-full p-1 flex items-center justify-center`}>
          <Icon className={`${sizeClasses[size]} ${config.color}`} />
        </div>
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`${config.bgColor} rounded-full p-1 flex items-center justify-center ${className}`}
      title={`${config.label}: ${config.description}`}
    >
      <Icon className={`${sizeClasses[size]} ${config.color}`} />
    </div>
  );
};