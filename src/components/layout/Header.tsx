import { Stethoscope, Menu, Home, Users } from 'lucide-react';

interface HeaderProps {
  currentView?: 'dashboard' | 'patients' | 'condition';
  onNavigate?: (view: 'dashboard' | 'patients') => void;
  onMenuToggle?: () => void;
}

export const Header = ({ currentView = 'dashboard', onNavigate, onMenuToggle }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Clinical Toolkit</h1>
                <p className="text-sm text-gray-500">Evidence-based clinical reference</p>
              </div>
            </div>

            {/* Navigation */}
            {onNavigate && (
              <nav className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Conditions
                </button>
                <button
                  onClick={() => onNavigate('patients')}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'patients'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Patients
                </button>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Offline Ready</span>
            </div>
            
            {/* Mobile Menu */}
            {onNavigate && (
              <div className="md:hidden">
                <button
                  onClick={onMenuToggle}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Conditions
              </button>
              <button
                onClick={() => onNavigate('patients')}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'patients'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
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