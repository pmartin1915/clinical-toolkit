import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { ConditionDetail } from './pages/ConditionDetail';
import { hypertension } from './data/conditions/hypertension';
import { diabetes } from './data/conditions/diabetes';
import { anxiety } from './data/conditions/anxiety';
import { depression } from './data/conditions/depression';
import { hypertriglyceridemia } from './data/conditions/hypertriglyceridemia';
import { rhinosinusitis } from './data/conditions/rhinosinusitis';
import { uti } from './data/conditions/uti';
import type { Condition } from './types';

const conditions: Record<string, Condition> = {
  hypertension,
  diabetes,
  anxiety,
  depression,
  hypertriglyceridemia,
  rhinosinusitis,
  uti,
};

function App() {
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const handleConditionSelect = (conditionId: string) => {
    setSelectedCondition(conditionId);
  };

  const handleBackToDashboard = () => {
    setSelectedCondition(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {selectedCondition ? (
          <ConditionDetail
            condition={conditions[selectedCondition]}
            onBack={handleBackToDashboard}
          />
        ) : (
          <Dashboard onConditionSelect={handleConditionSelect} />
        )}
      </main>
    </div>
  );
}

export default App;
