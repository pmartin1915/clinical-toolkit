import { useState } from 'react';
import { 
  History, 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  X, 
  Clock,
  Calendar,
  User,
  Filter,
  Download
} from 'lucide-react';
import { CDSHistoryManager, type CDSAlertHistory } from '../../utils/cdsHistory';
import { format } from 'date-fns';

interface CDSHistoryPanelProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
}

const statusIcons = {
  active: AlertTriangle,
  acknowledged: CheckCircle,
  dismissed: X,
  resolved: CheckCircle
};

const statusColors = {
  active: 'text-red-600 bg-red-50 border-red-200',
  acknowledged: 'text-blue-600 bg-blue-50 border-blue-200',
  dismissed: 'text-gray-600 bg-gray-50 border-gray-200',
  resolved: 'text-green-600 bg-green-50 border-green-200'
};

const priorityColors = {
  critical: 'text-red-600',
  high: 'text-orange-600',
  medium: 'text-yellow-600',
  low: 'text-green-600'
};

export const CDSHistoryPanel = ({ patientId, isOpen, onClose }: CDSHistoryPanelProps) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'dismissed' | 'resolved'>('all');
  const [history, setHistory] = useState<CDSAlertHistory[]>(() => 
    CDSHistoryManager.getPatientAlertHistory(patientId)
  );

  if (!isOpen) return null;

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(entry => entry.status === filter);

  const stats = CDSHistoryManager.getPatientCDSStats(patientId);

  const handleStatusChange = (historyId: string, newStatus: 'acknowledged' | 'dismissed' | 'resolved') => {
    let success = false;
    
    switch (newStatus) {
      case 'acknowledged':
        success = CDSHistoryManager.acknowledgeAlert(historyId, 'User');
        break;
      case 'dismissed':
        success = CDSHistoryManager.dismissAlert(historyId, 'User');
        break;
      case 'resolved':
        success = CDSHistoryManager.resolveAlert(historyId, 'User');
        break;
    }

    if (success) {
      setHistory(CDSHistoryManager.getPatientAlertHistory(patientId));
    }
  };

  const exportHistory = () => {
    const exportData = CDSHistoryManager.exportPatientCDSHistory(patientId);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cds-history-${patientId}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">CDS Alert History</h2>
              <p className="text-sm text-gray-600">
                {stats.total} total alerts • {stats.active} active • {stats.resolved} resolved
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportHistory}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm min-h-touch-md"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 transition-colors min-h-touch-md min-w-touch-md"
              title="Close history panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.bySeverity.critical || 0}</div>
              <div className="text-sm text-gray-600">Critical Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.bySeverity.high || 0}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.acknowledged}</div>
              <div className="text-sm text-gray-600">Acknowledged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            {['all', 'active', 'acknowledged', 'dismissed', 'resolved'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status as 'all' | 'active' | 'acknowledged' | 'dismissed' | 'resolved')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-1">({(stats as Record<string, unknown>)[status] as number || 0})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No alerts in history' : `No ${filter} alerts`}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'This patient has no CDS alerts on record.'
                  : `No alerts with status "${filter}" found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry) => {
                const StatusIcon = statusIcons[entry.status];
                
                return (
                  <div
                    key={entry.id}
                    className={`border rounded-lg p-4 ${
                      entry.status === 'active' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <StatusIcon className={`w-5 h-5 ${priorityColors[entry.alert.priority]}`} />
                          <h4 className="font-semibold text-gray-900">{entry.alert.ruleName}</h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusColors[entry.status]}`}>
                            {entry.status.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[entry.alert.priority]}`}>
                            {entry.alert.priority.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">{entry.alert.action.message}</p>

                        {entry.alert.action.suggestedAction && (
                          <div className="bg-blue-50 rounded p-2 mb-2">
                            <p className="text-xs font-medium text-blue-900 mb-1">Suggested Action:</p>
                            <p className="text-sm text-blue-800">{entry.alert.action.suggestedAction}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Triggered: {format(new Date(entry.alert.triggeredAt), 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                          
                          {entry.acknowledgedAt && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>
                                {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)} by {entry.acknowledgedBy || 'Unknown'} 
                                on {format(new Date(entry.acknowledgedAt), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </div>
                          )}
                        </div>

                        {entry.notes && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            <strong>Notes:</strong> {entry.notes}
                          </div>
                        )}

                        {entry.followUpRequired && entry.followUpDate && (
                          <div className="mt-2 flex items-center space-x-2 text-sm text-orange-600">
                            <Clock className="w-4 h-4" />
                            <span>Follow-up required by {format(new Date(entry.followUpDate), 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {entry.status === 'active' && (
                        <div className="flex flex-col space-y-1 ml-4">
                          <button
                            onClick={() => handleStatusChange(entry.id, 'acknowledged')}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => handleStatusChange(entry.id, 'resolved')}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleStatusChange(entry.id, 'dismissed')}
                            className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              CDS alerts help ensure patient safety through evidence-based clinical decision support
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};