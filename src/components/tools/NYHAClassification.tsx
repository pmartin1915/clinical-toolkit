import { useState } from 'react';
import { Heart, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { storageManager } from '../../utils/storage';
import type { AssessmentResult } from '../../types/storage';
import { withClinicalToolErrorBoundary } from '../ui/withErrorBoundary';

interface NYHAClass {
  class: 'I' | 'II' | 'III' | 'IV';
  symptoms: string;
  functionalCapacity: string;
  prognosis: string;
  recommendations: string[];
}

const nyhaClasses: NYHAClass[] = [
  {
    class: 'I',
    symptoms: 'No limitation of physical activity. Ordinary physical activity does not cause undue fatigue, palpitation, dyspnea, or anginal pain.',
    functionalCapacity: 'Ordinary physical activity (walking, climbing stairs)',
    prognosis: 'Excellent - 1-year mortality <5%',
    recommendations: [
      'Continue current optimal medical therapy',
      'Regular exercise and cardiac rehabilitation',
      'Standard follow-up every 3-6 months',
      'Focus on medication adherence and lifestyle modifications',
      'Monitor for progression of symptoms'
    ]
  },
  {
    class: 'II',
    symptoms: 'Slight limitation of physical activity. Comfortable at rest. Ordinary physical activity results in fatigue, palpitation, dyspnea, or anginal pain.',
    functionalCapacity: 'Limited with ordinary activity (walking >2 blocks, climbing >1 flight)',
    prognosis: 'Good - 1-year mortality 5-15%',
    recommendations: [
      'Optimize guideline-directed medical therapy',
      'Consider ACE inhibitor/ARB + beta-blocker + MRA',
      'Cardiac rehabilitation strongly recommended',
      'Monitor closely for progression to Class III',
      'Consider device therapy evaluation if EF ≤35%'
    ]
  },
  {
    class: 'III',
    symptoms: 'Marked limitation of physical activity. Comfortable at rest. Less than ordinary activity causes fatigue, palpitation, dyspnea, or anginal pain.',
    functionalCapacity: 'Limited with less than ordinary activity (walking <2 blocks)',
    prognosis: 'Guarded - 1-year mortality 15-25%',
    recommendations: [
      'Maximize guideline-directed medical therapy',
      'Strong consideration for ARNI if appropriate',
      'Evaluate for ICD/CRT device therapy',
      'Consider advanced therapies (ivabradine, hydralazine/nitrates)',
      'Frequent monitoring and medication titration',
      'Palliative care consultation for symptom management'
    ]
  },
  {
    class: 'IV',
    symptoms: 'Unable to carry on any physical activity without discomfort. Symptoms of heart failure at rest. Discomfort increases with any physical activity.',
    functionalCapacity: 'Symptomatic at rest, any physical activity increases discomfort',
    prognosis: 'Poor - 1-year mortality >25%',
    recommendations: [
      'Hospitalization may be required for optimization',
      'Advanced heart failure specialist referral',
      'Evaluate for heart transplant or mechanical circulatory support',
      'Aggressive diuretic management',
      'Palliative and end-of-life care discussions',
      'Consider continuous IV inotropes if appropriate',
      'Family meeting for goals of care'
    ]
  }
];

const activityQuestions = [
  {
    id: 'rest_symptoms',
    text: 'Do you have heart failure symptoms (shortness of breath, fatigue, swelling) while at rest?',
    options: [
      { text: 'No symptoms at rest', points: 0 },
      { text: 'Mild symptoms at rest', points: 3 },
      { text: 'Significant symptoms at rest', points: 4 }
    ]
  },
  {
    id: 'walking_blocks',
    text: 'How many blocks can you walk on level ground before becoming short of breath or fatigued?',
    options: [
      { text: 'More than 4 blocks without symptoms', points: 0 },
      { text: '2-4 blocks before symptoms', points: 1 },
      { text: '1-2 blocks before symptoms', points: 2 },
      { text: 'Less than 1 block before symptoms', points: 3 },
      { text: 'Unable to walk due to symptoms', points: 4 }
    ]
  },
  {
    id: 'stairs',
    text: 'How many flights of stairs can you climb before becoming short of breath or fatigued?',
    options: [
      { text: 'More than 2 flights without symptoms', points: 0 },
      { text: '1-2 flights before symptoms', points: 1 },
      { text: 'Less than 1 flight before symptoms', points: 2 },
      { text: 'Unable to climb stairs due to symptoms', points: 3 }
    ]
  },
  {
    id: 'daily_activities',
    text: 'How do heart failure symptoms affect your daily activities?',
    options: [
      { text: 'No limitation in daily activities', points: 0 },
      { text: 'Slight limitation in vigorous activities only', points: 1 },
      { text: 'Marked limitation in ordinary activities', points: 2 },
      { text: 'Unable to perform daily activities', points: 3 }
    ]
  }
];

const NYHAClassificationComponent = () => {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleResponse = (questionId: string, points: number) => {
    setResponses(prev => ({ ...prev, [questionId]: points }));
  };

  const calculateNYHAClass = (): NYHAClass | null => {
    const completed = Object.keys(responses).length === activityQuestions.length;
    if (!completed) return null;

    const maxScore = Math.max(...Object.values(responses));
    
    if (maxScore === 0) return nyhaClasses[0]; // Class I
    if (maxScore === 1) return nyhaClasses[1]; // Class II
    if (maxScore === 2 || maxScore === 3) return nyhaClasses[2]; // Class III
    return nyhaClasses[3]; // Class IV
  };

  const getClassColor = (nyhaClass: string) => {
    switch (nyhaClass) {
      case 'I': return 'text-green-800 bg-green-100 border-green-200';
      case 'II': return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      case 'III': return 'text-orange-800 bg-orange-100 border-orange-200';
      case 'IV': return 'text-red-800 bg-red-100 border-red-200';
      default: return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  const getClassIcon = (nyhaClass: string) => {
    switch (nyhaClass) {
      case 'I': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'II': return <Activity className="w-6 h-6 text-yellow-600" />;
      case 'III': return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'IV': return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default: return <Heart className="w-6 h-6 text-gray-600" />;
    }
  };

  const nyhaResult = calculateNYHAClass();
  const progress = (Object.keys(responses).length / activityQuestions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Heart className="w-6 h-6 text-red-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">NYHA Functional Classification</h3>
          <p className="text-gray-600">Assess functional capacity and heart failure symptom severity</p>
        </div>
      </div>

      {!showResults ? (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{Object.keys(responses).length} of {activityQuestions.length}</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {activityQuestions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">
                  {index + 1}. {question.text}
                </h4>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={question.id}
                        value={option.points}
                        checked={responses[question.id] === option.points}
                        onChange={() => handleResponse(question.id, option.points)}
                        className="mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-gray-900 group-hover:text-red-700 transition-colors flex-1">
                        {option.text}
                      </span>
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
              disabled={Object.keys(responses).length !== activityQuestions.length}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                Object.keys(responses).length === activityQuestions.length
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Determine NYHA Class
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Classification Result */}
          {nyhaResult && (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <span className="text-3xl font-bold text-red-800">
                    {nyhaResult.class}
                  </span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900">
                  NYHA Class {nyhaResult.class}
                </h4>
              </div>

              {/* Detailed Classification */}
              <div className={`rounded-lg p-6 border ${getClassColor(nyhaResult.class)}`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getClassIcon(nyhaResult.class)}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-lg mb-3">Class {nyhaResult.class} Heart Failure</h5>
                    
                    <div className="space-y-4">
                      <div>
                        <h6 className="font-semibold mb-1">Symptoms:</h6>
                        <p className="text-sm">{nyhaResult.symptoms}</p>
                      </div>

                      <div>
                        <h6 className="font-semibold mb-1">Functional Capacity:</h6>
                        <p className="text-sm">{nyhaResult.functionalCapacity}</p>
                      </div>

                      <div>
                        <h6 className="font-semibold mb-1">Prognosis:</h6>
                        <p className="text-sm">{nyhaResult.prognosis}</p>
                      </div>

                      <div>
                        <h6 className="font-semibold mb-2">Clinical Recommendations:</h6>
                        <ul className="space-y-1">
                          {nyhaResult.recommendations.map((rec, index) => (
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
              </div>
            </>
          )}

          {/* NYHA Class Reference */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h5 className="font-semibold text-gray-900 mb-4">NYHA Classification Reference:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nyhaClasses.map((classInfo) => (
                <div 
                  key={classInfo.class} 
                  className={`p-4 rounded-lg border-2 ${
                    nyhaResult?.class === classInfo.class 
                      ? getClassColor(classInfo.class) + ' border-current' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {getClassIcon(classInfo.class)}
                    <h6 className="font-bold">Class {classInfo.class}</h6>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{classInfo.functionalCapacity}</p>
                  <p className="text-xs">{classInfo.prognosis}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-2">Clinical Usage Notes:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• NYHA classification is subjective and should be used with objective measures</li>
              <li>• Classification can change with treatment optimization</li>
              <li>• Class III-IV patients should be considered for device therapy evaluation</li>
              <li>• Reassess classification after any significant treatment changes</li>
              <li>• Document functional capacity improvements with therapy</li>
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
              Assess Again
            </button>
            <button
              onClick={async () => {
                try {
                  const assessmentResult: AssessmentResult = {
                    id: storageManager.generateId(),
                    patientId: 'default-patient', // In a real app, this would be selected patient
                    conditionId: 'heart-failure',
                    toolId: 'nyha',
                    toolName: 'NYHA Classification',
                    responses,
                    score: nyhaResult?.class === 'I' ? 1 : nyhaResult?.class === 'II' ? 2 : nyhaResult?.class === 'III' ? 3 : 4,
                    severity: `Class ${nyhaResult?.class}`,
                    recommendations: nyhaResult?.recommendations || [],
                    timestamp: new Date().toISOString()
                  };
                  
                  await storageManager.saveAssessment(assessmentResult);
                  alert('NYHA classification saved successfully!');
                  console.log('NYHA classification saved:', assessmentResult);
                } catch (error) {
                  console.error('Error saving NYHA classification:', error);
                  alert('Failed to save assessment. Please try again.');
                }
              }}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Save Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const NYHAClassification = withClinicalToolErrorBoundary(
  NYHAClassificationComponent,
  'NYHA Classification'
);