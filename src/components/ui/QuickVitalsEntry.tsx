import { useState } from 'react';
import { Heart, Thermometer, Weight, Plus, Save, X } from 'lucide-react';
import type { VitalSigns } from '../../types/storage';

interface QuickVitalsEntryProps {
  patientId: string;
  onVitalsAdded: (vitals: VitalSigns[]) => void;
  onClose?: () => void;
}

export const QuickVitalsEntry = ({ patientId, onVitalsAdded, onClose }: QuickVitalsEntryProps) => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const generateId = () => `vital-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSave = () => {
    const vitals: VitalSigns[] = [];
    const timestamp = new Date().toISOString();

    // Blood pressure
    if (systolic && diastolic) {
      vitals.push({
        id: generateId(),
        patientId,
        type: 'blood_pressure',
        value: { systolic: parseInt(systolic), diastolic: parseInt(diastolic) },
        unit: 'mmHg',
        timestamp,
        location: 'clinic'
      });
    }

    // Heart rate
    if (heartRate) {
      vitals.push({
        id: generateId(),
        patientId,
        type: 'heart_rate',
        value: parseInt(heartRate),
        unit: 'bpm',
        timestamp,
        location: 'clinic'
      });
    }

    // Temperature
    if (temperature) {
      vitals.push({
        id: generateId(),
        patientId,
        type: 'temperature',
        value: parseFloat(temperature),
        unit: '°F',
        timestamp,
        location: 'clinic'
      });
    }

    // Weight
    if (weight) {
      vitals.push({
        id: generateId(),
        patientId,
        type: 'weight',
        value: parseFloat(weight),
        unit: 'lbs',
        timestamp,
        location: 'clinic'
      });
    }

    if (vitals.length > 0) {
      onVitalsAdded(vitals);
      // Reset form
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
      setTemperature('');
      setWeight('');
      setIsExpanded(false);
    }
  };

  const hasData = systolic || diastolic || heartRate || temperature || weight;

  if (!isExpanded) {
    return (
      <div className="border border-gray-200 rounded-lg p-3">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Vital Signs</span>
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Quick Vital Signs Entry</h4>
        <button
          onClick={() => {
            setIsExpanded(false);
            if (onClose) onClose();
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Blood Pressure */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blood Pressure
          </label>
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-500" />
            <input
              type="number"
              placeholder="Systolic"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">/</span>
            <input
              type="number"
              placeholder="Diastolic"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">mmHg</span>
          </div>
        </div>

        {/* Heart Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heart Rate
          </label>
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-blue-500" />
            <input
              type="number"
              placeholder="72"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">bpm</span>
          </div>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperature
          </label>
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <input
              type="number"
              step="0.1"
              placeholder="98.6"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">°F</span>
          </div>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight
          </label>
          <div className="flex items-center space-x-2">
            <Weight className="w-4 h-4 text-green-500" />
            <input
              type="number"
              step="0.1"
              placeholder="150"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">lbs</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-gray-500">
          Enter any vital signs to check for safety alerts
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(false)}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 text-sm transition-colors min-h-touch-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasData}
            className="flex items-center space-x-1 px-6 py-3 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-touch-md"
          >
            <Save className="w-3 h-3" />
            <span>Save Vitals</span>
          </button>
        </div>
      </div>
    </div>
  );
};