import { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { WelcomeModal } from './components/ui/WelcomeModal';
import { GuidedTour } from './components/ui/GuidedTour';
import { AccessibilityControls } from './components/ui/AccessibilityControls';
import { ThemeProvider } from './contexts/ThemeContext';
import { storageManager } from './utils/storage';
import { syncManager } from './utils/syncManager';
import { needsLegalConsent } from './utils/legalConsent';

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const ConditionDetail = lazy(() => import('./pages/ConditionDetail').then(module => ({ default: module.ConditionDetail })));
const PatientManager = lazy(() => import('./components/PatientManager').then(module => ({ default: module.PatientManager })));
import { hypertension } from './data/conditions/hypertension';
import { diabetes } from './data/conditions/diabetes';
import { anxiety } from './data/conditions/anxiety';
import { depression } from './data/conditions/depression';
import { hypertriglyceridemia } from './data/conditions/hypertriglyceridemia';
import { rhinosinusitis } from './data/conditions/rhinosinusitis';
import { uti } from './data/conditions/uti';
import { copd } from './data/conditions/copd';
import { heartFailure } from './data/conditions/heart-failure';
import { emergencyOrthopedic } from './data/conditions/emergency-orthopedic';
import type { Condition } from './types';

const conditions: Record<string, Condition> = {
  hypertension,
  diabetes,
  anxiety,
  depression,
  hypertriglyceridemia,
  rhinosinusitis,
  uti,
  copd,
  'heart-failure': heartFailure,
  'emergency-orthopedic': emergencyOrthopedic,
};

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'patients' | 'condition'>('dashboard');
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user needs legal consent or this is a first-time visitor
    if (needsLegalConsent() || storageManager.isFirstVisit()) {
      setShowWelcome(true);
    }

    // Initialize sync manager
    syncManager.checkForUpdates().then(hasUpdates => {
      if (hasUpdates) {
        console.log('App update available');
      }
    });
  }, []);

  const handleConditionSelect = (conditionId: string) => {
    setSelectedCondition(conditionId);
    setCurrentView('condition');
  };

  const handleNavigate = (view: 'dashboard' | 'patients') => {
    setCurrentView(view);
    setSelectedCondition(null);
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    storageManager.markWelcomed();
    
    // Show tour after welcome modal if user hasn't completed it
    setTimeout(() => {
      if (storageManager.shouldShowTour()) {
        setShowTour(true);
      }
    }, 500);
  };

  const handleTourComplete = () => {
    storageManager.markTourCompleted();
  };

  const renderContent = () => {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      }>
        {(() => {
          switch (currentView) {
            case 'patients':
              return <PatientManager />;
            case 'condition':
              return selectedCondition ? (
                <ConditionDetail
                  condition={conditions[selectedCondition]}
                  onBack={() => handleNavigate('dashboard')}
                />
              ) : null;
            default:
              return <Dashboard onConditionSelect={handleConditionSelect} />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
        <Header 
          currentView={currentView} 
          onNavigate={handleNavigate}
          onStartTour={() => setShowTour(true)}
        />
        <main className="flex-1">
          {renderContent()}
        </main>
        <Footer />
        <WelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />
        <GuidedTour 
          isOpen={showTour} 
          onClose={() => setShowTour(false)} 
          onComplete={handleTourComplete}
        />
        <AccessibilityControls />
      </div>
    </ThemeProvider>
  );
}

export default App;
