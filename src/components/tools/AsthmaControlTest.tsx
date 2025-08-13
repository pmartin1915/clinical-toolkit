import { useState } from 'react';
import { Wind, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

interface ACTQuestion {
  id: string;
  text: string;
  options: { text: string; score: number }[];
}

const actQuestions: ACTQuestion[] = [
  {
    id: 'work_activities',
    text: 'In the past 4 weeks, how much of the time did your asthma keep you from getting as much done at work, school or at home?',
    options: [
      { text: 'All of the time', score: 1 },
      { text: 'Most of the time', score: 2 },
      { text: 'Some of the time', score: 3 },
      { text: 'A little of the time', score: 4 },
      { text: 'None of the time', score: 5 }
    ]
  },
  {
    id: 'shortness_of_breath',
    text: 'During the past 4 weeks, how often have you had shortness of breath?',
    options: [
      { text: 'More than once a day', score: 1 },
      { text: 'Once a day', score: 2 },
      { text: '3 to 6 times a week', score: 3 },
      { text: 'Once or twice a week', score: 4 },
      { text: 'Not at all', score: 5 }
    ]
  },
  {
    id: 'night_symptoms',
    text: 'During the past 4 weeks, how often did your asthma symptoms (wheezing, coughing, shortness of breath, chest tightness or pain) wake you up at night or earlier than usual in the morning?',
    options: [
      { text: '4 or more nights a week', score: 1 },
      { text: '2 or 3 nights a week', score: 2 },
      { text: 'Once a week', score: 3 },
      { text: 'Once or twice', score: 4 },
      { text: 'Not at all', score: 5 }
    ]
  },
  {
    id: 'rescue_inhaler',
    text: 'During the past 4 weeks, how often have you used your rescue inhaler or nebulizer medication (such as albuterol)?',
    options: [
      { text: '3 or more times per day', score: 1 },
      { text: '1 or 2 times per day', score: 2 },
      { text: '2 or 3 times per week', score: 3 },
      { text: 'Once a week or less', score: 4 },
      { text: 'Not at all', score: 5 }
    ]
  },
  {
    id: 'control_rating',
    text: 'How would you rate your asthma control during the past 4 weeks?',
    options: [
      { text: 'Not controlled at all', score: 1 },
      { text: 'Poorly controlled', score: 2 },
      { text: 'Somewhat controlled', score: 3 },
      { text: 'Well controlled', score: 4 },
      { text: 'Completely controlled', score: 5 }
    ]
  }
];

export const AsthmaControlTest = () => {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleResponse = (questionId: string, score: number) => {
    setResponses(prev => ({ ...prev, [questionId]: score }));
  };

  const calculateScore = (): number => {
    const totalQuestions = actQuestions.length;
    const completedQuestions = Object.keys(responses).length;
    
    if (completedQuestions !== totalQuestions) return -1;
    
    return Object.values(responses).reduce((sum, score) => sum + score, 0);
  };

  const getControlLevel = (score: number) => {
    if (score < 0) return null;
    
    if (score >= 20) {
      return {
        level: 'Well-Controlled Asthma',
        color: 'text-green-800 bg-green-100 border-green-200',
        icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        description: 'Your asthma appears to be well controlled',
        recommendations: [
          'Continue current treatment plan',
          'Regular follow-up with healthcare provider every 3-6 months',
          'Continue environmental trigger avoidance',
          'Maintain written asthma action plan',
          'Annual flu vaccination',
          'Consider step-down therapy if well-controlled for ≥3 months'
        ],
        clinicalAction: 'Current therapy appears appropriate. Consider stepping down if control maintained ≥3 months.'
      };
    } else {
      return {
        level: 'Poorly Controlled Asthma',
        color: 'text-red-800 bg-red-100 border-red-200',
        icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
        description: 'Your asthma is not well controlled and requires attention',
        recommendations: [
          'Schedule appointment with healthcare provider within 1-2 weeks',
          'Review inhaler technique - common cause of poor control',
          'Identify and avoid asthma triggers',
          'Consider step-up in controller therapy',
          'Ensure written asthma action plan is up to date',
          'Review medication adherence',
          'Consider referral to asthma specialist if step 4-5 therapy needed'
        ],
        clinicalAction: 'Step-up therapy recommended. Review adherence and inhaler technique. Consider specialist referral.',
        urgentCare: score < 15 ? 'Consider urgent care evaluation if score <15 with frequent symptoms' : undefined
      };
    }
  };

  const getStepTherapyRecommendation = (score: number) => {
    if (score >= 20) {
      return {
        current: 'Well-controlled - maintain current therapy',
        next: 'Consider step-down if controlled ≥3 months',
        medications: ['Continue current controller medication', 'SABA as needed for symptoms']
      };
    } else if (score >= 16) {
      return {
        current: 'Partially controlled - step-up recommended',
        next: 'Increase to next step in asthma therapy',
        medications: [
          'If on SABA alone: Start low-dose ICS',
          'If on low-dose ICS: Add LABA or increase to medium-dose ICS',
          'If on ICS/LABA: Increase ICS dose or add LTRA'
        ]
      };
    } else {
      return {
        current: 'Poorly controlled - significant step-up needed',
        next: 'Consider stepping up 2 levels or specialist referral',
        medications: [
          'High-dose ICS/LABA combination',
          'Consider LTRA addition',
          'Short course oral corticosteroids may be needed',
          'Biologics evaluation if step 5-6 therapy required'
        ]
      };
    }
  };

  const score = calculateScore();
  const controlLevel = getControlLevel(score);
  const stepTherapy = score >= 0 ? getStepTherapyRecommendation(score) : null;
  const progress = (Object.keys(responses).length / actQuestions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Wind className="w-6 h-6 text-purple-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">Asthma Control Test (ACT)</h3>
          <p className="text-gray-600">Assess how well your asthma has been controlled in the past 4 weeks</p>
        </div>
      </div>

      {!showResults ? (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{Object.keys(responses).length} of {actQuestions.length}</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {actQuestions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">
                  {index + 1}. {question.text}
                </h4>
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <label key={option.score} className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={question.id}
                        value={option.score}
                        checked={responses[question.id] === option.score}
                        onChange={() => handleResponse(question.id, option.score)}
                        className="mt-0.5 h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <span className="text-gray-900 group-hover:text-purple-700 transition-colors">
                          {option.text}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">({option.score} points)</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Calculate Button */}
          <div className="mt-8">
            <button
              onClick={() => setShowResults(true)}
              disabled={Object.keys(responses).length !== actQuestions.length}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                Object.keys(responses).length === actQuestions.length
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Calculate ACT Score
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
              <span className="text-3xl font-bold text-purple-800">{score}</span>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">ACT Score: {score}/25</h4>
          </div>

          {/* Control Level Interpretation */}
          {controlLevel && (
            <div className={`rounded-lg p-6 border ${controlLevel.color}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {controlLevel.icon}
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-lg mb-2">{controlLevel.level}</h5>
                  <p className="mb-4">{controlLevel.description}</p>
                  
                  {controlLevel.urgentCare && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-800">Urgent Care Consideration</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">{controlLevel.urgentCare}</p>
                    </div>
                  )}

                  <div>
                    <h6 className="font-semibold mb-2">Recommended Actions:</h6>
                    <ul className="space-y-1">
                      {controlLevel.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h6 className="font-semibold text-gray-900 mb-1">Clinical Action:</h6>
                    <p className="text-sm text-gray-700">{controlLevel.clinicalAction}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Therapy Recommendations */}
          {stepTherapy && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Activity className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-bold text-blue-900 mb-3">Step Therapy Recommendations</h5>
                  
                  <div className="space-y-4">
                    <div>
                      <h6 className="font-semibold text-blue-800 mb-1">Current Status:</h6>
                      <p className="text-blue-700 text-sm">{stepTherapy.current}</p>
                    </div>

                    <div>
                      <h6 className="font-semibold text-blue-800 mb-1">Next Step:</h6>
                      <p className="text-blue-700 text-sm">{stepTherapy.next}</p>
                    </div>

                    <div>
                      <h6 className="font-semibold text-blue-800 mb-2">Medication Options:</h6>
                      <ul className="space-y-1">
                        {stepTherapy.medications.map((med, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span className="text-blue-700 text-sm">{med}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Score Interpretation Guide */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h5 className="font-semibold text-gray-900 mb-4">ACT Score Interpretation:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-100 rounded">
                  <span className="text-sm font-medium text-green-800">20-25 points</span>
                  <span className="text-xs text-green-700">Well Controlled</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-100 rounded">
                  <span className="text-sm font-medium text-yellow-800">16-19 points</span>
                  <span className="text-xs text-yellow-700">Partially Controlled</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-100 rounded">
                  <span className="text-sm font-medium text-red-800">5-15 points</span>
                  <span className="text-xs text-red-700">Poorly Controlled</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Minimum clinically important difference: 3 points</p>
                <p>• Reassess every 1-6 months based on control</p>
                <p>• Score &lt; 20 indicates need for treatment adjustment</p>
                <p>• Consider specialist referral for persistent poor control</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setShowResults(false);
                setResponses({});
              }}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Take Test Again
            </button>
            <button
              onClick={() => {
                const results = {
                  score,
                  controlLevel: controlLevel?.level,
                  date: new Date().toISOString(),
                  responses
                };
                console.log('Saving ACT results:', results);
                // TODO: Integrate with storage system
              }}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Save Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};