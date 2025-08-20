import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { HealthIndicator, getA1CLevel } from '../ui/HealthIndicator';

export const A1CConverter = () => {
  const [a1c, setA1c] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const convertA1C = () => {
    const a1cValue = parseFloat(a1c);
    if (isNaN(a1cValue) || a1cValue < 4 || a1cValue > 15) {
      setResult(null);
      return;
    }

    // Formula: eAG (mg/dL) = 28.7 × A1C - 46.7
    const avgGlucose = Math.round(28.7 * a1cValue - 46.7);
    setResult(avgGlucose);
  };

  const getInterpretation = (glucose: number) => {
    if (glucose < 154) return { level: 'Good', color: 'text-green-600', bg: 'bg-green-50' };
    if (glucose < 183) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (glucose < 212) return { level: 'Poor', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'Very Poor', color: 'text-red-600', bg: 'bg-red-50' };
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">A1C to Average Glucose Converter</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            A1C Percentage
          </label>
          <div className="flex">
            <input
              type="number"
              value={a1c}
              onChange={(e) => setA1c(e.target.value)}
              placeholder="7.5"
              min="4"
              max="15"
              step="0.1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
              %
            </span>
          </div>
        </div>

        <button
          onClick={convertA1C}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
        >
          Convert
        </button>

        {result !== null && parseFloat(a1c) && (
          <div className="mt-4 space-y-4">
            <HealthIndicator
              level={getA1CLevel(parseFloat(a1c))}
              value={parseFloat(a1c)}
              label="A1C Level"
              description="Your diabetes control status"
              unit="%"
              ranges={{
                normal: "< 7% (< 154 mg/dL)",
                caution: "7-8% (154-183 mg/dL)",
                warning: "8-10% (183-240 mg/dL)",
                critical: "> 10% (> 240 mg/dL)"
              }}
            />
            
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {result} mg/dL
                </div>
                <div className="text-sm text-gray-600">
                  Estimated Average Glucose
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Formula:</strong> eAG = 28.7 × A1C - 46.7</p>
                <p><strong>Note:</strong> This is an estimated average. Individual glucose readings will vary throughout the day.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};