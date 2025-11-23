import { useState, useEffect } from 'react';
import { Stethoscope, Menu, Home, Users, HelpCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../temp-ui';
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
                <Button
                  variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('dashboard')}
                  icon={<Home className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Conditions
                </Button>
                <Button
                  variant={currentView === 'patients' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('patients')}
                  icon={<Users className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Patients
                </Button>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {onStartTour && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartTour}
                icon={<HelpCircle className="w-4 h-4" />}
                iconPosition="left"
                className="hidden sm:inline-flex"
                title="Take a guided tour"
              >
                Tour
              </Button>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMenuToggle}
                  icon={<Menu className="w-5 h-5" />}
                  aria-label="Open navigation menu"
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {onNavigate && (
          <div className="md:hidden pb-4">
            <nav className="flex space-x-1">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('dashboard')}
                icon={<Home className="w-4 h-4" />}
                iconPosition="left"
              >
                Conditions
              </Button>
              <Button
                variant={currentView === 'patients' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('patients')}
                icon={<Users className="w-4 h-4" />}
                iconPosition="left"
              >
                Patients
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};