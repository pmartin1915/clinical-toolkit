import { useState, useEffect } from 'react';
import { Stethoscope, Menu, Home, Users, HelpCircle, Wifi, WifiOff } from 'lucide-react';
import { syncManager } from '../../utils/syncManager';

interface HeaderProps {
  currentView?: 'dashboard' | 'patients' | 'condition';
  onNavigate?: (view: 'dashboard' | 'patients') => void;
  onMenuToggle?: () => void;
  onStartTour?: () => void;
}

export const Header = ({ currentView = 'dashboard', onNavigate, onMenuToggle, onStartTour }: HeaderProps) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    const handleConnectionChange = (online: boolean) => {
      setIsOnline(online);
      setPendingSync(syncManager.getPendingSyncCount());
    };

    syncManager.addConnectionListener(handleConnectionChange);
    
    // Update pending count periodically
    const interval = setInterval(() => {
      setPendingSync(syncManager.getPendingSyncCount());
    }, 5000);

    return () => {
      syncManager.removeConnectionListener(handleConnectionChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Clinical Wizard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Evidence-based clinical reference</p>
              </div>
            </div>

            {/* Navigation */}
            {onNavigate && (
              <nav className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Conditions
                </button>
                <button
                  onClick={() => onNavigate('patients')}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'patients'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Patients
                </button>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {onStartTour && (
              <button
                onClick={onStartTour}
                className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Take a guided tour"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Tour
              </button>
            )}
            
            {/* Connection Status */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              {isOnline ? (
                <div className="flex items-center space-x-1 text-green-600" title={`Online${pendingSync > 0 ? ` - ${pendingSync} items syncing` : ''}`}>
                  <Wifi className="w-4 h-4" />
                  <span className="text-gray-600">Online</span>
                  {pendingSync > 0 && (
                    <span className="bg-yellow-500 text-xs rounded-full px-1.5 py-0.5 text-white font-medium ml-1">
                      {pendingSync}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600" title={`Offline${pendingSync > 0 ? ` - ${pendingSync} items queued` : ''}`}>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-gray-600">Offline</span>
                  {pendingSync > 0 && (
                    <span className="bg-red-500 text-xs rounded-full px-1.5 py-0.5 text-white font-medium ml-1">
                      {pendingSync}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Mobile Menu */}
            {onNavigate && (
              <div className="md:hidden">
                <button
                  onClick={onMenuToggle}
                  className="p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {onNavigate && (
          <div className="md:hidden pb-4">
            <nav className="flex space-x-1">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Conditions
              </button>
              <button
                onClick={() => onNavigate('patients')}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'patients'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Patients
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};