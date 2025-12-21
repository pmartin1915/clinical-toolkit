import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, TrendingUp } from 'lucide-react';
import { HealthIndicator } from '../ui/HealthIndicator';
import { getBPLevel } from '../../utils/healthMetrics';
import { useClinicalStore } from '../../store/clinicalStore';
import { migrateBPReadingsFromLocalStorage } from '../../utils/dataMigration';
import type { VitalSigns } from '../../types/storage';

export const BPTracker = () => {
  // Get store methods
  const vitals = useClinicalStore((state) => state.vitals);
  const saveVitalSigns = useClinicalStore((state) => state.saveVitalSigns);
  const deleteVitalSigns = useClinicalStore((state) => state.deleteVitalSigns);
  const generateId = useClinicalStore((state) => state.generateId);

  // Filter BP readings for default patient
  const bpReadings = vitals.filter(
    v => v.patientId === 'default-patient' && v.type === 'blood_pressure'
  );

  // Form state (still uses local useState)
  const [newReading, setNewReading] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    notes: ''
  });
  const [showForm, setShowForm] = useState(false);

  // Migrate legacy data on component mount
  useEffect(() => {
    const migrationResult = migrateBPReadingsFromLocalStorage();
    if (migrationResult.migratedCount > 0) {
      console.info(`✅ Migrated ${migrationResult.migratedCount} BP readings to encrypted storage`);
    }
    if (migrationResult.errors.length > 0) {
      console.warn('⚠️ Migration warnings:', migrationResult.errors);
    }
  }, []);

  const addReading = () => {
    const systolic = parseInt(newReading.systolic);
    const diastolic = parseInt(newReading.diastolic);
    const pulse = newReading.pulse ? parseInt(newReading.pulse) : undefined;

    if (systolic && diastolic && systolic > 0 && diastolic > 0) {
      const now = new Date().toISOString();

      // Create BP vital signs entry
      const bpVital: VitalSigns = {
        id: generateId(),
        patientId: 'default-patient',
        type: 'blood_pressure',
        value: { systolic, diastolic },
        unit: 'mmHg',
        timestamp: now,
        notes: newReading.notes || undefined,
        location: 'home'
      };

      saveVitalSigns(bpVital);

      // Create separate heart rate entry if pulse provided
      if (pulse) {
        const pulseVital: VitalSigns = {
          id: generateId(),
          patientId: 'default-patient',
          type: 'heart_rate',
          value: pulse,
          unit: 'bpm',
          timestamp: now,
          notes: newReading.notes ? `From BP reading: ${newReading.notes}` : undefined,
          location: 'home'
        };
        saveVitalSigns(pulseVital);
      }

      setNewReading({ systolic: '', diastolic: '', pulse: '', notes: '' });
      setShowForm(false);
    }
  };

  const deleteReading = (id: string) => {
    deleteVitalSigns(id);
  };

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) {
      return { category: 'Normal', color: 'text-green-600', bg: 'bg-green-50' };
    } else if (systolic < 130 && diastolic < 80) {
      return { category: 'Elevated', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    } else if (systolic < 140 || diastolic < 90) {
      return { category: 'Stage 1 HTN', color: 'text-orange-600', bg: 'bg-orange-50' };
    } else if (systolic < 180 || diastolic < 120) {
      return { category: 'Stage 2 HTN', color: 'text-red-600', bg: 'bg-red-50' };
    } else {
      return { category: 'Crisis', color: 'text-red-800', bg: 'bg-red-100' };
    }
  };

  const getAverages = () => {
    if (bpReadings.length === 0) return null;

    // Sort by timestamp (most recent first)
    const sortedReadings = [...bpReadings].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const recent = sortedReadings.slice(0, 10);

    const avgSystolic = Math.round(
      recent.reduce((sum, r) => sum + (r.value as { systolic: number; diastolic: number }).systolic, 0) / recent.length
    );
    const avgDiastolic = Math.round(
      recent.reduce((sum, r) => sum + (r.value as { systolic: number; diastolic: number }).diastolic, 0) / recent.length
    );

    return { avgSystolic, avgDiastolic };
  };

  const averages = getAverages();

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-red-500" />
          <h3 className="text-xl font-semibold text-gray-900">Blood Pressure Tracker</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reading</span>
        </button>
      </div>

      {/* Add Reading Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Add New Reading</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Systolic
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={newReading.systolic}
                  onChange={(e) => setNewReading(prev => ({ ...prev, systolic: e.target.value }))}
                  placeholder="120"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="inline-flex items-center px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 text-gray-500 text-xs">
                  mmHg
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diastolic
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={newReading.diastolic}
                  onChange={(e) => setNewReading(prev => ({ ...prev, diastolic: e.target.value }))}
                  placeholder="80"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="inline-flex items-center px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 text-gray-500 text-xs">
                  mmHg
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pulse (optional)
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={newReading.pulse}
                  onChange={(e) => setNewReading(prev => ({ ...prev, pulse: e.target.value }))}
                  placeholder="72"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="inline-flex items-center px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 text-gray-500 text-xs">
                  bpm
                </span>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={addReading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors min-h-touch-md"
              >
                Save
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={newReading.notes}
              onChange={(e) => setNewReading(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Morning reading, after medication..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Visual Health Indicators */}
      {averages && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HealthIndicator
            level={getBPLevel(averages.avgSystolic, averages.avgDiastolic)}
            value={`${averages.avgSystolic}/${averages.avgDiastolic}`}
            label="Average Blood Pressure"
            description={`Based on your last ${Math.min(bpReadings.length, 10)} readings`}
            unit="mmHg"
            showChart={true}
            ranges={{
              normal: "< 120/80 mmHg",
              caution: "120-129/<80 mmHg", 
              warning: "130-139/80-89 mmHg",
              critical: "≥180/≥120 mmHg"
            }}
          />
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Reading Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-bold text-gray-900">{bpReadings.length}</div>
                  <div className="text-xs text-gray-500">Total readings</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{Math.min(bpReadings.length, 10)}</div>
                  <div className="text-xs text-gray-500">Used for average</div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <div className="text-sm font-medium text-blue-900 mb-2">� Quick Tip</div>
              <div className="text-xs text-blue-800">
                Take readings at the same time each day for better tracking. 
                Ideal blood pressure is less than 120/80 mmHg.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Readings List */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Recent Readings</h4>
        {bpReadings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No readings yet. Add your first blood pressure reading!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[...bpReadings]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((reading) => {
                const bpValue = reading.value as { systolic: number; diastolic: number };
                const category = getBPCategory(bpValue.systolic, bpValue.diastolic);
                const readingDate = new Date(reading.timestamp);

                return (
                  <div key={reading.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {bpValue.systolic}/{bpValue.diastolic}
                          <span className="text-sm text-gray-500 ml-1">mmHg</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {readingDate.toLocaleDateString()} at {readingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${category.bg} ${category.color}`}>
                        {category.category}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {reading.notes && (
                        <div className="text-sm text-gray-600 italic max-w-xs truncate">
                          "{reading.notes}"
                        </div>
                      )}
                      <button
                        onClick={() => deleteReading(reading.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Reference Guide */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Blood Pressure Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="font-medium text-green-800">Normal</div>
            <div className="text-green-700">&lt;120/80</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="font-medium text-yellow-800">Elevated</div>
            <div className="text-yellow-700">120-129/&lt;80</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded p-2">
            <div className="font-medium text-orange-800">Stage 1</div>
            <div className="text-orange-700">130-139/80-89</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <div className="font-medium text-red-800">Stage 2</div>
            <div className="text-red-700">≥140/≥90</div>
          </div>
          <div className="bg-red-100 border border-red-300 rounded p-2">
            <div className="font-medium text-red-900">Crisis</div>
            <div className="text-red-800">≥180/≥120</div>
          </div>
        </div>
      </div>
    </div>
  );
};