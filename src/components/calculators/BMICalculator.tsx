// src/components/calculators/BMICalculator.tsx
import { useState, useEffect, useCallback } from 'react';
import { Calculator, TrendingUp, Info, AlertTriangle, Scale } from 'lucide-react'; // Added Scale icon

// Define interfaces for input and result states
interface BMIInputs {
  weight: string;
  height: string;
  units: 'metric' | 'imperial';
}

interface BMIResult {
  bmi: number;
  category: string;
  colorClass: string; // Tailwind text color class
  bgColorClass: string; // Tailwind background color class for results card
}

export const BMICalculator = () => {
  const [inputs, setInputs] = useState<BMIInputs>({
    weight: '',
    height: '',
    units: 'metric', // Default to metric units
  });
  const [result, setResult] = useState<BMIResult | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [heightError, setHeightError] = useState<string | null>(null);

  const handleInputChange = (field: keyof BMIInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    // Clear errors when input changes
    if (field === 'weight') setWeightError(null);
    if (field === 'height') setHeightError(null);
  };

  const calculateBMI = useCallback((): BMIResult | null => {
    let weightValue = parseFloat(inputs.weight);
    let heightValue = parseFloat(inputs.height);

    if (isNaN(weightValue) || isNaN(heightValue)) {
      setWeightError(null); // Clear previous errors
      setHeightError(null);
      return null;
    }

    // Input validation (ranges)
    // Metric ranges: weight 20-300kg, height 100-250cm
    // Imperial approx: weight 44-661lb, height 39-98in
    const minWeightKg = 20;
    const maxWeightKg = 300;
    const minHeightCm = 100;
    const maxHeightCm = 250;

    let validWeight = true;
    let validHeight = true;

    if (inputs.units === 'metric') {
      if (weightValue < minWeightKg || weightValue > maxWeightKg) {
        setWeightError(`Weight must be between ${minWeightKg}kg and ${maxWeightKg}kg`);
        validWeight = false;
      }
      if (heightValue < minHeightCm || heightValue > maxHeightCm) {
        setHeightError(`Height must be between ${minHeightCm}cm and ${maxHeightCm}cm`);
        validHeight = false;
      }
    } else { // Imperial units
      const minWeightLb = minWeightKg * 2.20462;
      const maxWeightLb = maxWeightKg * 2.20462;
      const minHeightIn = minHeightCm / 2.54;
      const maxHeightIn = maxHeightCm / 2.54;

      if (weightValue < minWeightLb || weightValue > maxWeightLb) {
        setWeightError(`Weight must be between ${minWeightLb.toFixed(0)}lb and ${maxWeightLb.toFixed(0)}lb`);
        validWeight = false;
      }
      if (heightValue < minHeightIn || heightValue > maxHeightIn) {
        setHeightError(`Height must be between ${minHeightIn.toFixed(0)}in and ${maxHeightIn.toFixed(0)}in`);
        validHeight = false;
      }
    }

    if (!validWeight || !validHeight) {
      return null;
    }

    // Clear errors if values are now valid
    setWeightError(null);
    setHeightError(null);

    // Unit conversions to metric (kg, m)
    let weightKg: number;
    let heightM: number;

    if (inputs.units === 'imperial') {
      weightKg = weightValue / 2.20462; // lb to kg
      heightM = heightValue * 0.0254;   // in to meters
    } else { // metric
      weightKg = weightValue;
      heightM = heightValue / 100;      // cm to meters
    }

    if (heightM === 0) {
      return null; // Prevent division by zero
    }

    const bmi = weightKg / (heightM * heightM);
    const roundedBmi = parseFloat(bmi.toFixed(1));

    let category: string;
    let colorClass: string;
    let bgColorClass: string;

    // Determine BMI category and color
    if (roundedBmi < 18.5) {
      category = 'Underweight';
      colorClass = 'text-blue-600';
      bgColorClass = 'bg-blue-50';
    } else if (roundedBmi < 25) {
      category = 'Normal weight';
      colorClass = 'text-green-600';
      bgColorClass = 'bg-green-50';
    } else if (roundedBmi < 30) {
      category = 'Overweight';
      colorClass = 'text-yellow-600';
      bgColorClass = 'bg-yellow-50';
    } else if (roundedBmi < 35) {
      category = 'Obese Class I';
      colorClass = 'text-orange-600';
      bgColorClass = 'bg-orange-50';
    } else if (roundedBmi < 40) {
      category = 'Obese Class II';
      colorClass = 'text-red-700'; // Slightly darker red for class II
      bgColorClass = 'bg-red-100'; // Slightly darker red bg
    } else {
      category = 'Obese Class III';
      colorClass = 'text-red-800'; // Darker red for class III
      bgColorClass = 'bg-red-200'; // Darkest red bg
    }

    return {
      bmi: roundedBmi,
      category,
      colorClass,
      bgColorClass,
    };
  }, [inputs.weight, inputs.height, inputs.units]);

  // Real-time calculation on input change
  useEffect(() => {
    const calculatedResult = calculateBMI();
    setResult(calculatedResult);
  }, [calculateBMI]);

  // Check if all fields are filled AND no errors are present
  const isFormComplete = inputs.weight !== '' && inputs.height !== '' && !weightError && !heightError;
  const isCalculable = isFormComplete; // To ensure UI only shows result when valid

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-100 p-2 rounded-full">
              <Scale className="w-6 h-6 text-teal-600" /> {/* Changed to Scale icon */}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">BMI Calculator</h2>
              <p className="text-sm text-gray-600">
                Calculate Body Mass Index for adults (18+ years)
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Clinical Use Info Card */}
          <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-blue-800 text-sm">
                <strong>Clinical Use:</strong> BMI is a screening tool used to categorize weight status (underweight, normal, overweight, obese). It does not diagnose body fatness or health. It's important to consider other factors like body composition, age, sex, ethnicity, and muscle mass.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Measurements</h3>
                <div className="space-y-4">
                  {/* Unit Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Units
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleInputChange('units', 'metric')}
                        className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium touch-target-lg ${
                          inputs.units === 'metric'
                            ? 'bg-primary-100 border-primary-500 text-primary-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Metric (kg, cm)
                      </button>
                      <button
                        onClick={() => handleInputChange('units', 'imperial')}
                        className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium touch-target-lg ${
                          inputs.units === 'imperial'
                            ? 'bg-primary-100 border-primary-500 text-primary-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Imperial (lb, in)
                      </button>
                    </div>
                  </div>

                  {/* Weight Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="weight-input">
                      Weight
                    </label>
                    <div className="flex">
                      <input
                        id="weight-input"
                        type="number"
                        step="0.1"
                        value={inputs.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          weightError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={inputs.units === 'metric' ? '70' : '154'}
                        aria-label="Weight value"
                        min={inputs.units === 'metric' ? '20' : '44'}
                        max={inputs.units === 'metric' ? '300' : '661'}
                      />
                      <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                        {inputs.units === 'metric' ? 'kg' : 'lb'}
                      </span>
                    </div>
                    {weightError && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" /> {weightError}
                      </p>
                    )}
                  </div>

                  {/* Height Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="height-input">
                      Height
                    </label>
                    <div className="flex">
                      <input
                        id="height-input"
                        type="number"
                        step="0.1"
                        value={inputs.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          heightError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={inputs.units === 'metric' ? '175' : '69'}
                        aria-label="Height value"
                        min={inputs.units === 'metric' ? '100' : '39'}
                        max={inputs.units === 'metric' ? '250' : '98'}
                      />
                      <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                        {inputs.units === 'metric' ? 'cm' : 'in'}
                      </span>
                    </div>
                    {heightError && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" /> {heightError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {result && isCalculable ? (
                <>
                  {/* BMI Value Display */}
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Calculator className="w-6 h-6 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Calculated BMI</h3>
                    </div>
                    <div className="text-5xl font-extrabold text-primary-600 mb-2">
                      {result.bmi}
                    </div>
                    <div className="text-sm text-gray-600">kg/m²</div>
                  </div>

                  {/* BMI Category */}
                  <div className={`rounded-lg p-4 border ${result.bgColorClass.replace('bg-', 'border-')}`}>
                    <div className="flex items-center space-x-3">
                      <TrendingUp className={`w-6 h-6 ${result.colorClass}`} />
                      <div className="flex-1">
                        <h4 className={`font-semibold text-lg ${result.colorClass}`}>
                          Category: {result.category}
                        </h4>
                        <p className="text-sm text-gray-700">
                          Based on WHO (World Health Organization) standards.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Important Considerations</h5>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• BMI is a screening tool, not a diagnostic one.</li>
                      <li>• It does not account for muscle mass or body fat distribution.</li>
                      <li>• May be less accurate for athletes, pregnant women, and the elderly.</li>
                      <li>• Consult with a healthcare professional for personalized assessment.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                  <Calculator className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    Enter weight and height to calculate BMI.
                  </p>
                  {!isFormComplete && (inputs.weight || inputs.height || weightError || heightError) && (
                     <p className="mt-3 p-2 bg-yellow-50 rounded-md border border-yellow-200 text-yellow-800 text-sm">
                       Please provide valid weight and height measurements.
                     </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reference Guide */}
        <div className="mt-6 p-6 bg-gray-50 rounded-b-lg border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">BMI Categories (WHO Standards)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center touch-target-lg">
              <div className="font-medium text-blue-800">Underweight</div>
              <div className="text-blue-700">&lt; 18.5</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-2 text-center touch-target-lg">
              <div className="font-medium text-green-800">Normal Weight</div>
              <div className="text-green-700">18.5 – 24.9</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center touch-target-lg">
              <div className="font-medium text-yellow-800">Overweight</div>
              <div className="text-yellow-700">25.0 – 29.9</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded p-2 text-center touch-target-lg">
              <div className="font-medium text-orange-800">Obese Class I</div>
              <div className="text-orange-700">30.0 – 34.9</div>
            </div>
            <div className="bg-red-100 border border-red-200 rounded p-2 text-center touch-target-lg">
              <div className="font-medium text-red-700">Obese Class II</div>
              <div className="text-red-600">35.0 – 39.9</div>
            </div>
            <div className="bg-red-200 border border-red-300 rounded p-2 text-center touch-target-lg">
              <div className="font-medium text-red-800">Obese Class III</div>
              <div className="text-red-700">≥ 40.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
