import { useState } from 'react';
import { Brain, AlertCircle } from 'lucide-react';

const phq9Questions = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself'
];

const responseOptions = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' }
];

export const PHQ9Assessment = () => {
  const [responses, setResponses] = useState<number[]>(new Array(9).fill(-1));
  const [functionalImpairment, setFunctionalImpairment] = useState<string>('');
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
      description: 'Minimal depression symptoms',
      recommendation: 'No treatment needed. Monitor symptoms.',
      treatment: 'Watchful waiting, lifestyle modifications',
      color: 'text-green-600',
      bg: 'bg-green-50'
    };
    if (score <= 9) return {
      severity: 'Mild',
      description: 'Mild depression symptoms',
      recommendation: 'Consider psychotherapy or antidepressant treatment.',
      treatment: 'Watchful waiting, exercise, or psychotherapy',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    };
    if (score <= 14) return {
      severity: 'Moderate',
      description: 'Moderate depression symptoms',
      recommendation: 'Antidepressant or psychotherapy recommended.',
      treatment: 'Antidepressant or psychotherapy',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    };
    if (score <= 19) return {
      severity: 'Moderately Severe',
      description: 'Moderately severe depression symptoms',
      recommendation: 'Antidepressant or therapy; combination if high functional impact.',
      treatment: 'Antidepressant or therapy; consider combination',
      color: 'text-red-600',
      bg: 'bg-red-50'
    };
    return {
      severity: 'Severe',
      description: 'Severe depression symptoms',
      recommendation: 'Antidepressant + therapy; consider ECT if needed.',
      treatment: 'Antidepressant + therapy; consider ECT',
      color: 'text-red-600',
      bg: 'bg-red-50'
    };
  };

  const hasSuicidalIdeation = responses[8] > 0;
  const isComplete = responses.every(response => response >= 0) && functionalImpairment !== '';
  const score = calculateScore();
  const interpretation = getInterpretation(score);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="w-5 h-5 text-primary-600" />
        <h3 className="text-xl font-semibold text-gray-900">PHQ-9 Depression Assessment</h3>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-blue-800 text-sm">
          <strong>Instructions:</strong> Over the last 2 weeks, how often have you been bothered by any of the following problems? 
          This validated screening tool helps assess depression severity and guide treatment decisions.
        </p>
      </div>

      <div className="space-y-6 mb-6">
        {phq9Questions.map((question, index) => (
          <div key={index} className={`border rounded-lg p-4 ${index === 8 ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between mb-3">
              <p className="font-medium text-gray-900 flex-1 mr-4">
                {index + 1}. {question}
              </p>
              {index === 8 && (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {responseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleResponse(index, option.value)}
                  className={`p-2 text-sm rounded-md border transition-colors text-center ${
                    responses[index] === option.value
                      ? index === 8 && option.value > 0
                        ? 'bg-red-100 border-red-500 text-red-700'
                        : 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{option.value}</div>
                  <div className="text-xs">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Functional Impairment Question */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <p className="font-medium text-gray-900 mb-3">
          If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {['Not difficult at all', 'Somewhat difficult', 'Very difficult', 'Extremely difficult'].map((option) => (
            <button
              key={option}
              onClick={() => setFunctionalImpairment(option)}
              className={`p-2 text-sm rounded-md border transition-colors ${
                functionalImpairment === option
                  ? 'bg-primary-100 border-primary-500 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Calculate Button */}
      {isComplete && (
        <div className="mb-6">
          <button
            onClick={() => setShowResults(true)}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium"
          >
            Calculate PHQ-9 Score
          </button>
        </div>
      )}

      {/* Suicidal Ideation Warning */}
      {hasSuicidalIdeation && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="font-bold text-red-800">Immediate Attention Required</h4>
              <p className="text-red-700 text-sm mt-1">
                Patient endorsed suicidal ideation. Immediate safety assessment and intervention required. 
                Consider emergency department evaluation if imminent danger.
              </p>
              <div className="mt-2 text-sm text-red-800">
                <strong>Crisis Resources:</strong> National Suicide Prevention Lifeline: 988 | Crisis Text Line: Text HOME to 741741
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && isComplete && (
        <div className={`p-6 rounded-md ${interpretation.bg}`}>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {score}/27
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${interpretation.bg} ${interpretation.color}`}>
              {interpretation.severity} Depression
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Assessment</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Severity: </span>
                  {interpretation.description}
                </div>
                <div>
                  <span className="font-medium">Functional Impact: </span>
                  {functionalImpairment}
                </div>
                {hasSuicidalIdeation && (
                  <div className="text-red-700">
                    <span className="font-medium">WARNING: Suicidal Ideation: </span>
                    Present - Requires immediate clinical attention
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Treatment Recommendation</h4>
              <div className="text-sm">
                <div className="mb-2">
                  <span className="font-medium">Suggested Treatment: </span>
                  {interpretation.treatment}
                </div>
                <div>
                  <span className="font-medium">Clinical Note: </span>
                  {interpretation.recommendation}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Clinical Guidelines</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• PHQ-9 ≥10: Suggests major depression, warrants further evaluation</li>
              <li>• Monitor response every 2-4 weeks with repeat PHQ-9 scoring</li>
              <li>• Target: 50% reduction in score or score &lt;5 for remission</li>
              <li>• Consider combination therapy for scores ≥15 or poor functional impairment</li>
              <li>• Any suicidal ideation requires immediate safety assessment</li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <p className="text-yellow-800 text-xs">
              <strong>Disclaimer:</strong> This screening tool aids in assessment but does not replace clinical judgment. 
              A positive screening requires comprehensive psychiatric evaluation for definitive diagnosis and treatment planning.
            </p>
          </div>
        </div>
      )}

      {!isComplete && (
        <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            Please answer all questions including the functional impairment question to calculate your PHQ-9 score.
          </p>
        </div>
      )}
    </div>
  );
};