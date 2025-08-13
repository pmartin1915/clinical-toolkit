import { useState } from 'react';
import { Wind, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface CATQuestion {
  id: string;
  text: string;
  scale: string[];
}

const catQuestions: CATQuestion[] = [
  {
    id: 'cough',
    text: 'I never cough / I cough all the time',
    scale: ['Never cough', 'Occasionally cough', 'Sometimes cough', 'Frequently cough', 'Often cough', 'Cough all the time']
  },
  {
    id: 'phlegm',
    text: 'I have no phlegm in my chest / My chest is completely full of phlegm',
    scale: ['No phlegm', 'Little phlegm', 'Some phlegm', 'Moderate phlegm', 'Lots of phlegm', 'Chest full of phlegm']
  },
  {
    id: 'chest_tightness',
    text: 'My chest does not feel tight / My chest feels very tight',
    scale: ['No tightness', 'Slight tightness', 'Some tightness', 'Moderate tightness', 'Very tight', 'Extremely tight']
  },
  {
    id: 'breathless',
    text: 'When I walk up a hill or flight of stairs I am not breathless / When I walk up a hill or flight of stairs I am very breathless',
    scale: ['Not breathless', 'Slightly breathless', 'Somewhat breathless', 'Moderately breathless', 'Very breathless', 'Extremely breathless']
  },
  {
    id: 'activities',
    text: 'I am not limited doing activities at home / I am very limited doing activities at home',
    scale: ['Not limited', 'Slightly limited', 'Somewhat limited', 'Moderately limited', 'Very limited', 'Extremely limited']
  },
  {
    id: 'confidence',
    text: 'I am confident leaving my home despite my lung condition / I am not confident leaving my home because of my lung condition',
    scale: ['Very confident', 'Confident', 'Somewhat confident', 'Less confident', 'Not confident', 'Not confident at all']
  },
  {
    id: 'sleep',
    text: 'I sleep soundly / I don\'t sleep soundly because of my lung condition',
    scale: ['Sleep soundly', 'Sleep mostly well', 'Sleep fairly well', 'Some sleep problems', 'Poor sleep', 'Don\'t sleep soundly']
  },
  {
    id: 'energy',
    text: 'I have lots of energy / I have no energy at all',
    scale: ['Lots of energy', 'Good energy', 'Some energy', 'Little energy', 'Very little energy', 'No energy at all']
  }
];

export const COPDAssessment = () => {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleResponse = (questionId: string, score: number) => {
    setResponses(prev => ({ ...prev, [questionId]: score }));
  };

  const calculateScore = (): number => {
    const totalQuestions = catQuestions.length;
    const completedQuestions = Object.keys(responses).length;
    
    if (completedQuestions !== totalQuestions) return -1;
    
    return Object.values(responses).reduce((sum, score) => sum + score, 0);
  };

  const getScoreInterpretation = (score: number) => {
    if (score < 0) return null;
    
    if (score < 10) {
      return {
        category: 'Low Impact',
        color: 'text-green-800 bg-green-100 border-green-200',
        description: 'COPD has a low impact on your life',
        recommendations: [
          'Continue current treatment plan',
          'Maintain regular physical activity',
          'Annual flu vaccination',
          'Consider pulmonary rehabilitation if experiencing any limitations'
        ]
      };
    } else if (score < 20) {
      return {
        category: 'Medium Impact',
        color: 'text-yellow-800 bg-yellow-100 border-yellow-200',
        description: 'COPD has a medium impact on your life',
        recommendations: [
          'Review inhaler technique with healthcare provider',
          'Consider step-up in bronchodilator therapy',
          'Pulmonary rehabilitation may be beneficial',
          'Develop written action plan for exacerbations',
          'Smoking cessation if applicable'
        ]
      };
    } else if (score < 30) {
      return {
        category: 'High Impact', 
        color: 'text-orange-800 bg-orange-100 border-orange-200',
        description: 'COPD has a high impact on your life',
        recommendations: [
          'Urgent medication review and optimization needed',
          'Strong recommendation for pulmonary rehabilitation',
          'Consider combination bronchodilator therapy',
          'Evaluate for ICS if frequent exacerbations',
          'Oxygen assessment may be needed',
          'Social support services evaluation'
        ]
      };
    } else {
      return {
        category: 'Very High Impact',
        color: 'text-red-800 bg-red-100 border-red-200',
        description: 'COPD has a very high impact on your life',
        recommendations: [
          'Immediate comprehensive COPD review required',
          'Consider specialist pulmonology referral',
          'Evaluate for oxygen therapy',
          'Palliative care consultation for symptom management',
          'Review for lung transplant candidacy if appropriate',
          'Comprehensive pulmonary rehabilitation program',
          'End-of-life care planning discussion'
        ]
      };
    }
  };

  const score = calculateScore();
  const interpretation = getScoreInterpretation(score);
  const progress = (Object.keys(responses).length / catQuestions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Wind className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">COPD Assessment Test (CAT)</h3>
          <p className="text-gray-600">Measure the impact of COPD on your daily life</p>
        </div>
      </div>

      {!showResults ? (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{Object.keys(responses).length} of {catQuestions.length}</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {catQuestions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">
                  {index + 1}. {question.text}
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {question.scale.map((label, scoreIndex) => (
                    <div key={scoreIndex} className="text-center">
                      <button
                        onClick={() => handleResponse(question.id, scoreIndex)}
                        className={`w-full p-2 rounded-lg border text-xs transition-colors ${
                          responses[question.id] === scoreIndex
                            ? 'bg-blue-100 border-blue-500 text-blue-800'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {scoreIndex}
                      </button>
                      <p className="text-xs text-gray-600 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Calculate Button */}
          <div className="mt-8">
            <button
              onClick={() => setShowResults(true)}
              disabled={Object.keys(responses).length !== catQuestions.length}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                Object.keys(responses).length === catQuestions.length
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Calculate CAT Score
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <span className="text-3xl font-bold text-blue-800">{score}</span>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">CAT Score: {score}/40</h4>
          </div>

          {/* Interpretation */}
          {interpretation && (
            <div className={`rounded-lg p-6 border ${interpretation.color}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {interpretation.category === 'Low Impact' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : interpretation.category === 'Very High Impact' ? (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  ) : (
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-lg mb-2">{interpretation.category}</h5>
                  <p className="mb-4">{interpretation.description}</p>
                  
                  <div>
                    <h6 className="font-semibold mb-2">Recommended Actions:</h6>
                    <ul className="space-y-1">
                      {interpretation.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h5 className="font-semibold text-gray-900 mb-4">Score Breakdown by Domain:</h5>
            <div className="space-y-3">
              {catQuestions.map((question) => (
                <div key={question.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex-1 pr-4">
                    {question.text.split(' / ')[0]}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{responses[question.id]}/5</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(responses[question.id] / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-2">Clinical Notes:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• CAT score should be reassessed every 3-6 months or after treatment changes</li>
              <li>• Minimum clinically important difference (MCID) is 2 points</li>
              <li>• Scores correlate with GOLD groups: A (CAT &lt; 10), B (CAT ≥ 10)</li>
              <li>• Use alongside mMRC dyspnea scale for comprehensive assessment</li>
              <li>• Consider exacerbation history for complete GOLD classification</li>
            </ul>
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
                  category: interpretation?.category,
                  date: new Date().toISOString(),
                  responses
                };
                console.log('Saving CAT results:', results);
                // TODO: Integrate with storage system
              }}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};