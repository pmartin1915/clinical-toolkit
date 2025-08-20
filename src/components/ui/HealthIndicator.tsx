import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type IndicatorLevel = 'normal' | 'caution' | 'warning' | 'critical';
export type TrendDirection = 'up' | 'down' | 'stable';

interface HealthIndicatorProps {
  level: IndicatorLevel;
  value: string | number;
  label: string;
  description?: string;
  trend?: TrendDirection;
  showChart?: boolean;
  unit?: string;
  ranges?: {
    normal: string;
    caution?: string;
    warning?: string;
    critical?: string;
  };
}

const levelConfig = {
  normal: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
    icon: CheckCircle
  },
  caution: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
    icon: AlertTriangle
  },
  warning: {
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-600',
    icon: AlertTriangle
  },
  critical: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
    icon: AlertCircle
  }
};

const trendConfig = {
  up: { icon: TrendingUp, color: 'text-red-500' },
  down: { icon: TrendingDown, color: 'text-green-500' },
  stable: { icon: Minus, color: 'text-gray-500' }
};

export const HealthIndicator = ({
  level,
  value,
  label,
  description,
  trend,
  showChart = false,
  unit = '',
  ranges
}: HealthIndicatorProps) => {
  const config = levelConfig[level];
  const Icon = config.icon;
  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
            <h3 className={`font-medium ${config.textColor}`}>{label}</h3>
            {trend && TrendIcon && (
              <TrendIcon className={`w-4 h-4 ${trendConfig[trend].color}`} />
            )}
          </div>
          
          <div className="flex items-baseline space-x-1 mb-2">
            <span className={`text-2xl font-bold ${config.textColor}`}>
              {value}
            </span>
            {unit && <span className={`text-sm ${config.textColor}`}>{unit}</span>}
          </div>
          
          {description && (
            <p className={`text-sm ${config.textColor} mb-3`}>{description}</p>
          )}
          
          {ranges && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600 mb-2">Reference Ranges:</div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {ranges.normal && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Normal: {ranges.normal}</span>
                  </div>
                )}
                {ranges.caution && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-700">Caution: {ranges.caution}</span>
                  </div>
                )}
                {ranges.warning && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">Warning: {ranges.warning}</span>
                  </div>
                )}
                {ranges.critical && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">Critical: {ranges.critical}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {showChart && (
          <div className="ml-4">
            <div className="w-20 h-16 bg-white rounded border border-gray-200 p-2">
              <div className="w-full h-full relative">
                {/* Simple visualization */}
                <div className="absolute bottom-0 left-0 w-full flex items-end justify-between space-x-1">
                  <div className="w-2 bg-gray-300 rounded-t" style={{ height: '40%' }}></div>
                  <div className="w-2 bg-gray-300 rounded-t" style={{ height: '60%' }}></div>
                  <div className="w-2 bg-gray-300 rounded-t" style={{ height: '30%' }}></div>
                  <div className={`w-2 ${config.iconColor === 'text-green-600' ? 'bg-green-500' : config.iconColor === 'text-yellow-600' ? 'bg-yellow-500' : config.iconColor === 'text-orange-600' ? 'bg-orange-500' : 'bg-red-500'} rounded-t`} style={{ height: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Utility function to determine BP level
export const getBPLevel = (systolic: number, diastolic: number): IndicatorLevel => {
  if (systolic >= 180 || diastolic >= 120) return 'critical';
  if (systolic >= 140 || diastolic >= 90) return 'warning';
  if (systolic >= 130 || diastolic >= 80) return 'caution';
  return 'normal';
};

// Utility function to determine A1C level
export const getA1CLevel = (a1c: number): IndicatorLevel => {
  if (a1c >= 10) return 'critical';
  if (a1c >= 8) return 'warning';
  if (a1c >= 7) return 'caution';
  return 'normal';
};

// Utility function to determine BMI level
export const getBMILevel = (bmi: number): IndicatorLevel => {
  if (bmi >= 40) return 'critical';
  if (bmi >= 30) return 'warning';
  if (bmi >= 25) return 'caution';
  return 'normal';
};