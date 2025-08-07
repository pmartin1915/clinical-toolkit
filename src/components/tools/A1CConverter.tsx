import { useState } from 'react';
import { Calculator } from 'lucide-react';

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

        {result !== null && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {result} mg/dL
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Estimated Average Glucose
              </div>
              
              {(() => {
                const interpretation = getInterpretation(result);
                return (
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${interpretation.bg} ${interpretation.color}`}>
                    {interpretation.level} Control
                  </div>
                );
              })()}
            </div>

            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p><strong>Formula:</strong> eAG = 28.7 × A1C - 46.7</p>
              <p><strong>Normal:</strong> &lt;154 mg/dL (A1C &lt;7%)</p>
              <p><strong>Note:</strong> This is an estimated average. Individual glucose readings will vary.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};