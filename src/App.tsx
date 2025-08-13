import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { ConditionDetail } from './pages/ConditionDetail';
import { PatientManager } from './components/PatientManager';
import { hypertension } from './data/conditions/hypertension';
import { diabetes } from './data/conditions/diabetes';
import { anxiety } from './data/conditions/anxiety';
import { depression } from './data/conditions/depression';
import { hypertriglyceridemia } from './data/conditions/hypertriglyceridemia';
import { rhinosinusitis } from './data/conditions/rhinosinusitis';
import { uti } from './data/conditions/uti';
import { copd } from './data/conditions/copd';
import { heartFailure } from './data/conditions/heart-failure';
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
};

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'patients' | 'condition'>('dashboard');
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const handleConditionSelect = (conditionId: string) => {
    setSelectedCondition(conditionId);
    setCurrentView('condition');
  };

  const handleNavigate = (view: 'dashboard' | 'patients') => {
    setCurrentView(view);
    setSelectedCondition(null);
  };

  const renderContent = () => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
