import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X, 
  Eye, 
  EyeOff, 
  Shield,
  Activity,
  Heart,
  Pill,
  TrendingUp,
  Clock
} from 'lucide-react';
import { CDSEngine, type CDSAlert } from '../../utils/cdsEngine';

interface CDSAlertsPanelProps {
  isVisible: boolean;
  onClose?: () => void;
  alerts?: CDSAlert[];
}

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  critical: AlertTriangle
};

const severityColors = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-orange-50 border-orange-200 text-orange-800',
  critical: 'bg-red-50 border-red-200 text-red-800'
};

const priorityColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  critical: 'text-red-600'
};

const categoryIcons = {
  'drug-interaction': Pill,
  'contraindication': Shield,
  'vital-signs': Heart,
  'assessment-score': Activity,
  'preventive-care': TrendingUp
};

export const CDSAlertsPanel = ({ isVisible, onClose, alerts: propAlerts }: CDSAlertsPanelProps) => {
  const [alerts, setAlerts] = useState<CDSAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [showDismissed, setShowDismissed] = useState(false);

  useEffect(() => {
    if (propAlerts) {
      setAlerts(propAlerts);
    } else {
      setAlerts(CDSEngine.getActiveAlerts());
    }
  }, [propAlerts]);

  if (!isVisible) return null;

  const filteredAlerts = alerts.filter(alert => {
    if (!showDismissed && alert.dismissed) return false;
    if (filter === 'all') return true;
    return alert.priority === filter;
  });

  const handleDismissAlert = (alert: CDSAlert) => {
    const alertId = `${alert.ruleId}-${alert.triggeredAt}`;
    CDSEngine.dismissAlert(alertId);
    setAlerts(prev => prev.map(a => 
      a.ruleId === alert.ruleId && a.triggeredAt === alert.triggeredAt 
        ? { ...a, dismissed: true }
        : a
    ));
  };

  const renderAlert = (alert: CDSAlert, index: number) => {
    const SeverityIcon = severityIcons[alert.action.severity];
    const CategoryIcon = categoryIcons[alert.category as keyof typeof categoryIcons] || AlertCircle;
    
    return (
      <div
        key={`${alert.ruleId}-${alert.triggeredAt}-${index}`}
        className={`border rounded-lg p-4 mb-3 ${severityColors[alert.action.severity]} ${
          alert.dismissed ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              <SeverityIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-sm">{alert.ruleName}</h4>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[alert.priority]}`}>
                  {alert.priority.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <CategoryIcon className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600 capitalize">
                  {alert.category.replace('-', ' ')}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600">
                  {new Date(alert.triggeredAt).toLocaleString()}
                </span>
              </div>

              <p className="text-sm mb-3">
                {alert.action.message}
              </p>

              {alert.action.suggestedAction && (
                <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Suggested Action:</p>
                  <p className="text-sm text-gray-800">
                    {alert.action.suggestedAction}
                  </p>
                </div>
              )}

              {alert.action.actionRequired && (
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-800">
                    Action Required
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
            {!alert.dismissed && (
              <button
                onClick={() => handleDismissAlert(alert)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const alertCounts = {
    critical: filteredAlerts.filter(a => a.priority === 'critical').length,
    high: filteredAlerts.filter(a => a.priority === 'high').length,
    medium: filteredAlerts.filter(a => a.priority === 'medium').length,
    low: filteredAlerts.filter(a => a.priority === 'low').length,
    total: filteredAlerts.length
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                Clinical Decision Support Alerts
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {alertCounts.total} active • {alertCounts.critical} critical • {alertCounts.high} high
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDismissed(!showDismissed)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm transition-colors min-h-touch-md ${
                showDismissed
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={showDismissed ? 'Hide dismissed' : 'Show dismissed'}
            >
              {showDismissed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showDismissed ? 'Hide' : 'Show'} dismissed</span>
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Close alerts panel"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-2">
            <span className="text-sm font-medium text-gray-700 block sm:inline">Filter by priority:</span>
            <div className="flex flex-wrap gap-2">
              {['all', 'critical', 'high', 'medium', 'low'].map(priority => (
                <button
                  key={priority}
                  onClick={() => setFilter(priority as any)}
                  className={`px-3 py-2 sm:py-1 rounded-full text-xs font-medium transition-colors touch-manipulation ${
                    filter === priority
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-white text-gray-600 hover:bg-gray-100 active:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  {priority !== 'all' && (
                    <span className="ml-1">
                      ({alerts.filter(a => a.priority === priority && (!a.dismissed || showDismissed)).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh] sm:max-h-[60vh]">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No alerts' : `No ${filter} priority alerts`}
              </h3>
              <p className="text-gray-600">
                {showDismissed 
                  ? 'All alerts have been handled or dismissed.'
                  : 'All current alerts are resolved. Toggle "Show dismissed" to see previous alerts.'
                }
              </p>
            </div>
          ) : (
            <div>
              {filteredAlerts.map((alert, index) => renderAlert(alert, index))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Clinical decision support rules based on current evidence-based guidelines
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
              {filteredAlerts.some(a => !a.dismissed) && (
                <button
                  onClick={() => {
                    filteredAlerts.forEach(alert => {
                      if (!alert.dismissed) {
                        handleDismissAlert(alert);
                      }
                    });
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Dismiss all
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};