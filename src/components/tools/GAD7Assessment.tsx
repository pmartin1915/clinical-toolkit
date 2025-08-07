import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';

const gad7Questions = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it\'s hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid as if something awful might happen'
];

const responseOptions = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' }
];

export const GAD7Assessment = () => {
  const [responses, setResponses] = useState<number[]>(new Array(7).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const handleResponse = (questionIndex: number, value: number) => {
    const newResponses = [...responses];
    newResponses[questionIndex] = value;
    setResponses(newResponses);
  };

  const calculateScore = () => {
    return responses.reduce((sum, response) => sum + (response >= 0 ? response : 0), 0);
  };

  const getInterpretation = (score: number) => {
    if (score <= 4) return {
      severity: 'Minimal',
      description: 'Minimal anxiety symptoms',
      recommendation: 'Monitor symptoms. No treatment typically needed.',
      color: 'text-green-600',
      bg: 'bg-green-50'
    };
    if (score <= 9) return {
      severity: 'Mild',
      description: 'Mild anxiety symptoms',
      recommendation: 'Consider psychotherapy or self-help strategies.',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    };
    if (score <= 14) return {
      severity: 'Moderate',
      description: 'Moderate anxiety symptoms',
      recommendation: 'Consider psychotherapy or medication treatment.',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    };
    return {
      severity: 'Severe',
      description: 'Severe anxiety symptoms',
      recommendation: 'Treatment with medication and/or psychotherapy strongly recommended.',
      color: 'text-red-600',
      bg: 'bg-red-50'
    };
  };

  const isComplete = responses.every(response => response >= 0);
  const score = calculateScore();
  const interpretation = getInterpretation(score);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <ClipboardCheck className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">GAD-7 Anxiety Assessment</h3>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Over the last 2 weeks, how often have you been bothered by the following problems?
        </p>
      </div>

      <div className="space-y-6">
        {gad7Questions.map((question, index) => (
          <div key={index} className="border-b border-gray-100 pb-4">
            <p className="font-medium text-gray-900 mb-3">
              {index + 1}. {question}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {responseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleResponse(index, option.value)}
                  className={`p-2 text-sm rounded-md border transition-colors ${
                    responses[index] === option.value
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isComplete && (
        <div className="mt-6">
          <button
            onClick={() => setShowResults(true)}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
          >
            Calculate Score
          </button>
        </div>
      )}

      {showResults && isComplete && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {score}/21
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${interpretation.bg} ${interpretation.color}`}>
              {interpretation.severity} Anxiety
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Description: </span>
              {interpretation.description}
            </div>
            <div>
              <span className="font-medium">Recommendation: </span>
              {interpretation.recommendation}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-blue-800 text-xs">
                <strong>Note:</strong> This screening tool is not a diagnostic instrument. 
                A score ≥10 suggests clinically significant anxiety that may benefit from further evaluation and treatment.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isComplete && (
        <div className="mt-6 p-3 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            Please answer all questions to calculate your GAD-7 score.
          </p>
        </div>
      )}
    </div>
  );
};