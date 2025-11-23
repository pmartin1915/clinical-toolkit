import { useState } from 'react';
import { BookOpen, CheckCircle, Heart, Target, AlertCircle } from 'lucide-react';

interface EducationModule {
  id: string;
  title: string;
  category: 'basics' | 'management' | 'prevention' | 'emergency';
  duration: string;
  content: {
    overview: string;
    keyPoints: string[];
    actionSteps: string[];
    warning?: string;
  };
  interactive?: {
    type: 'quiz' | 'checklist' | 'tracker';
    items: Array<{
      id: string;
      text: string;
      correct?: boolean;
      explanation?: string;
    }>;
  };
}

interface PatientEducationProps {
  condition: string;
}

export const PatientEducation = ({ condition }: PatientEducationProps) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, boolean>>>({});

  const getEducationModules = (conditionId: string): EducationModule[] => {
    const modules: Record<string, EducationModule[]> = {
      hypertension: [
        {
          id: 'bp-basics',
          title: 'Understanding Your Blood Pressure',
          category: 'basics',
          duration: '10 min',
          content: {
            overview: 'Learn what blood pressure numbers mean and why controlling them matters for your health.',
            keyPoints: [
              'Normal blood pressure is less than 120/80 mmHg',
              'High blood pressure often has no symptoms',
              'Untreated hypertension damages your heart, brain, and kidneys',
              'Most people need medication plus lifestyle changes',
              'Regular monitoring helps prevent complications'
            ],
            actionSteps: [
              'Check your blood pressure at home 2-3 times per week',
              'Keep a blood pressure log with dates and readings',
              'Take medications exactly as prescribed',
              'Report readings above 140/90 to your healthcare provider',
              'Bring your blood pressure log to all appointments'
            ]
          },
          interactive: {
            type: 'quiz',
            items: [
              {
                id: 'bp-reading',
                text: 'A blood pressure reading of 130/85 mmHg indicates:',
                correct: true,
                explanation: 'This reading indicates Stage 1 hypertension and requires lifestyle changes and possibly medication.'
              }
            ]
          }
        },
        {
          id: 'lifestyle-changes',
          title: 'Lifestyle Changes That Lower Blood Pressure',
          category: 'management',
          duration: '15 min',
          content: {
            overview: 'Discover proven lifestyle strategies that can significantly reduce your blood pressure.',
            keyPoints: [
              'Weight loss of even 5-10 pounds can make a difference',
              'DASH diet can lower BP by 8-14 mmHg',
              'Regular exercise reduces BP by 4-9 mmHg',
              'Limiting sodium to <2300mg daily helps most people',
              'Limiting alcohol and quitting smoking are essential'
            ],
            actionSteps: [
              'Aim for 150 minutes of moderate exercise weekly',
              'Eat 4-5 servings of fruits and vegetables daily',
              'Choose whole grains over refined carbohydrates',
              'Limit processed foods and restaurant meals',
              'Read nutrition labels and track sodium intake',
              'Find healthy stress management techniques'
            ]
          },
          interactive: {
            type: 'checklist',
            items: [
              { id: 'exercise', text: 'I will walk for 30 minutes, 5 days this week' },
              { id: 'sodium', text: 'I will check sodium content before buying packaged foods' },
              { id: 'vegetables', text: 'I will eat at least 3 servings of vegetables daily' },
              { id: 'stress', text: 'I will practice deep breathing or meditation for 10 minutes daily' }
            ]
          }
        },
        {
          id: 'medication-management',
          title: 'Taking Your Blood Pressure Medications',
          category: 'management',
          duration: '12 min',
          content: {
            overview: 'Learn how to take your medications effectively and manage potential side effects.',
            keyPoints: [
              'Take medications at the same time each day',
              'Never stop medications suddenly without consulting your doctor',
              'Side effects often improve after 2-4 weeks',
              'Some medications work better when taken at bedtime',
              'Generic medications are just as effective as brand names'
            ],
            actionSteps: [
              'Set daily medication reminders on your phone',
              'Use a pill organizer to track daily doses',
              'Keep a list of all medications and doses',
              'Report side effects to your healthcare provider',
              'Ask about cost-saving options if affordability is an issue',
              'Never share medications with others'
            ],
            warning: 'Never stop taking blood pressure medications without talking to your healthcare provider first, even if you feel better.'
          }
        },
        {
          id: 'emergency-signs',
          title: 'When to Seek Emergency Care',
          category: 'emergency',
          duration: '8 min',
          content: {
            overview: 'Recognize the warning signs of dangerously high blood pressure that require immediate medical attention.',
            keyPoints: [
              'Blood pressure >180/120 with symptoms needs immediate care',
              'Severe headache with high BP is a medical emergency',
              'Chest pain or difficulty breathing requires 911',
              'Sudden vision changes or confusion are serious warnings',
              'Numbness or weakness may indicate stroke'
            ],
            actionSteps: [
              'Call 911 if BP >180/120 with severe headache, chest pain, or difficulty breathing',
              'Go to ER if you have vision changes with high blood pressure',
              'Call your doctor if BP >160/100 without symptoms',
              'Keep emergency contact numbers readily available',
              'Know the location of your nearest emergency room'
            ],
            warning: 'Hypertensive emergency can cause stroke, heart attack, or organ damage. When in doubt, seek immediate medical care.'
          }
        }
      ],
      diabetes: [
        {
          id: 'diabetes-basics',
          title: 'Understanding Type 2 Diabetes',
          category: 'basics',
          duration: '12 min',
          content: {
            overview: 'Learn about type 2 diabetes, how it affects your body, and why management is crucial.',
            keyPoints: [
              'Type 2 diabetes affects how your body uses insulin',
              'Target A1C is usually <7% for most adults',
              'Complications affect eyes, kidneys, nerves, and heart',
              'Good control prevents or delays complications',
              'Diabetes is manageable with the right plan'
            ],
            actionSteps: [
              'Monitor blood sugar as recommended by your provider',
              'Keep a glucose log with readings, meals, and activities',
              'Learn to recognize high and low blood sugar symptoms',
              'Schedule regular check-ups every 3-6 months',
              'Get annual eye exams and foot checks'
            ]
          }
        },
        {
          id: 'blood-sugar-monitoring',
          title: 'Blood Sugar Monitoring and Targets',
          category: 'management',
          duration: '15 min',
          content: {
            overview: 'Master blood glucose monitoring techniques and understand your target ranges.',
            keyPoints: [
              'Target before meals: 80-130 mg/dL',
              'Target 2 hours after meals: <180 mg/dL',
              'Check more often when sick or stressed',
              'Rotate finger stick sites to prevent soreness',
              'Keep extra supplies available at all times'
            ],
            actionSteps: [
              'Wash hands before every blood sugar check',
              'Use the side of your fingertip, not the pad',
              'Record all readings with date, time, and circumstances',
              'Bring your glucose meter to all appointments',
              'Replace lancets regularly for less painful testing',
              'Check expiration dates on test strips'
            ]
          },
          interactive: {
            type: 'tracker',
            items: [
              { id: 'morning', text: 'Morning fasting glucose' },
              { id: 'lunch', text: '2 hours after lunch' },
              { id: 'dinner', text: '2 hours after dinner' },
              { id: 'bedtime', text: 'Bedtime glucose' }
            ]
          }
        },
        {
          id: 'healthy-eating',
          title: 'Eating Well with Diabetes',
          category: 'management',
          duration: '18 min',
          content: {
            overview: 'Develop a sustainable eating plan that helps control blood sugar while enjoying food.',
            keyPoints: [
              'Focus on portion control rather than eliminating foods',
              'Carbohydrates have the biggest impact on blood sugar',
              'Fiber helps slow glucose absorption',
              'Protein and healthy fats help with satiety',
              'Timing of meals affects blood sugar patterns'
            ],
            actionSteps: [
              'Use the plate method: 1/2 non-starchy vegetables, 1/4 protein, 1/4 starch',
              'Choose whole grains over refined carbohydrates',
              'Read nutrition labels and count carbohydrates',
              'Eat meals at consistent times each day',
              'Stay hydrated with water instead of sugary drinks',
              'Plan healthy snacks to prevent low blood sugar'
            ]
          }
        },
        {
          id: 'hypoglycemia',
          title: 'Recognizing and Treating Low Blood Sugar',
          category: 'emergency',
          duration: '10 min',
          content: {
            overview: 'Learn to identify, treat, and prevent dangerous low blood sugar episodes.',
            keyPoints: [
              'Low blood sugar (<70 mg/dL) can be dangerous',
              'Symptoms include shakiness, sweating, confusion, and hunger',
              'Treat immediately with 15 grams of fast-acting carbs',
              'Always carry glucose tablets or juice',
              'Severe low blood sugar may require emergency care'
            ],
            actionSteps: [
              'Follow the 15-15 rule: 15g carbs, wait 15 minutes, recheck',
              'Keep glucose tablets, juice, or candy easily accessible',
              'Wear medical ID jewelry indicating diabetes',
              'Teach family/friends how to help during low blood sugar',
              'Call 911 if unconscious or unable to swallow',
              'Follow up with a protein snack after treating lows'
            ],
            warning: 'Severe hypoglycemia can cause seizures, coma, or death. Always treat low blood sugar immediately.'
          }
        }
      ],
      depression: [
        {
          id: 'depression-understanding',
          title: 'Understanding Depression',
          category: 'basics',
          duration: '12 min',
          content: {
            overview: 'Learn about depression as a medical condition and how treatment can help you feel better.',
            keyPoints: [
              'Depression is a real medical condition, not a personal weakness',
              'Brain chemistry changes contribute to depression symptoms',
              'Treatment works - most people improve with proper care',
              'Therapy and medication often work best together',
              'Recovery takes time but is absolutely possible'
            ],
            actionSteps: [
              'Track your mood daily using a simple 1-10 scale',
              'Notice patterns in your symptoms and triggers',
              'Be honest with your healthcare provider about symptoms',
              'Take medications as prescribed even when feeling better',
              'Stay connected with supportive family and friends'
            ]
          }
        },
        {
          id: 'self-care-strategies',
          title: 'Daily Self-Care for Mental Health',
          category: 'management',
          duration: '15 min',
          content: {
            overview: 'Develop daily habits and coping strategies that support your mental health recovery.',
            keyPoints: [
              'Regular sleep schedule improves mood and energy',
              'Physical activity is as effective as medication for mild depression',
              'Social connection reduces isolation and negative thoughts',
              'Mindfulness helps manage overwhelming emotions',
              'Small daily accomplishments build confidence'
            ],
            actionSteps: [
              'Go to bed and wake up at the same time daily',
              'Aim for 30 minutes of physical activity most days',
              'Practice deep breathing or meditation for 10 minutes daily',
              'Schedule one enjoyable activity each day',
              'Reach out to one supportive person weekly',
              'Set small, achievable daily goals'
            ]
          },
          interactive: {
            type: 'checklist',
            items: [
              { id: 'sleep', text: 'I maintained a regular sleep schedule today' },
              { id: 'exercise', text: 'I was physically active for at least 20 minutes' },
              { id: 'social', text: 'I connected with a supportive person today' },
              { id: 'mindfulness', text: 'I practiced mindfulness or relaxation techniques' },
              { id: 'accomplishment', text: 'I completed at least one meaningful task' }
            ]
          }
        },
        {
          id: 'crisis-planning',
          title: 'Creating Your Safety Plan',
          category: 'emergency',
          duration: '10 min',
          content: {
            overview: 'Develop a personal safety plan for managing suicidal thoughts or mental health crises.',
            keyPoints: [
              'Warning signs help you recognize when you need extra support',
              'Coping strategies can help manage difficult emotions',
              'Having support contacts readily available saves lives',
              'Professional help is available 24/7 when needed',
              'Removing access to means of harm increases safety'
            ],
            actionSteps: [
              'List your personal warning signs of crisis',
              'Identify healthy coping strategies that work for you',
              'Create a list of supportive people to contact',
              'Save crisis hotline numbers in your phone',
              'Remove or secure potentially harmful items',
              'Share your safety plan with trusted people'
            ],
            warning: 'If you are having thoughts of suicide, call 988 (Suicide & Crisis Lifeline) immediately or go to your nearest emergency room.'
          }
        }
      ],
      anxiety: [
        {
          id: 'anxiety-basics',
          title: 'Understanding Anxiety Disorders',
          category: 'basics',
          duration: '10 min',
          content: {
            overview: 'Learn about anxiety as a treatable medical condition and how to recognize symptoms.',
            keyPoints: [
              'Anxiety disorders are the most common mental health condition',
              'Physical symptoms like rapid heartbeat are normal with anxiety',
              'Avoidance often makes anxiety worse over time',
              'Treatment helps most people manage symptoms effectively',
              'Anxiety is treatable with therapy, medication, or both'
            ],
            actionSteps: [
              'Learn to identify your specific anxiety triggers',
              'Practice recognizing physical anxiety symptoms',
              'Keep a daily anxiety journal noting triggers and severity',
              'Challenge anxious thoughts with evidence-based thinking',
              'Gradually face feared situations rather than avoiding them'
            ]
          }
        },
        {
          id: 'breathing-techniques',
          title: 'Breathing and Relaxation Techniques',
          category: 'management',
          duration: '12 min',
          content: {
            overview: 'Master practical techniques to calm your body and mind during anxious moments.',
            keyPoints: [
              'Deep breathing activates your body\'s relaxation response',
              'Progressive muscle relaxation reduces physical tension',
              'Grounding techniques help during panic attacks',
              'Regular practice makes techniques more effective',
              'These skills work best when practiced daily'
            ],
            actionSteps: [
              'Practice 4-7-8 breathing: inhale 4, hold 7, exhale 8',
              'Use the 5-4-3-2-1 grounding technique during panic',
              'Practice progressive muscle relaxation for 10 minutes daily',
              'Set reminders to do breathing exercises throughout the day',
              'Use relaxation apps or guided recordings',
              'Practice techniques when calm so they work during anxiety'
            ]
          }
        },
        {
          id: 'panic-attacks',
          title: 'Managing Panic Attacks',
          category: 'emergency',
          duration: '8 min',
          content: {
            overview: 'Learn to recognize and manage panic attacks when they occur.',
            keyPoints: [
              'Panic attacks feel dangerous but are not life-threatening',
              'Symptoms peak within 10 minutes and then decrease',
              'Fighting panic makes it worse - acceptance helps',
              'Breathing exercises can shorten attack duration',
              'Frequent panic attacks should be evaluated by a professional'
            ],
            actionSteps: [
              'Remind yourself "this is anxiety, not danger"',
              'Focus on slow, deep breathing through your nose',
              'Use grounding techniques to stay present',
              'Avoid leaving the situation if possible',
              'Seek immediate help if having chest pain or can\'t breathe',
              'Follow up with healthcare provider about frequent attacks'
            ],
            warning: 'If you experience chest pain, difficulty breathing, or feel like you\'re having a heart attack, seek immediate medical attention.'
          }
        }
      ]
    };

    return modules[conditionId] || [];
  };

  const modules = getEducationModules(condition);

  const markModuleComplete = (moduleId: string) => {
    setCompletedModules(new Set([...completedModules, moduleId]));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics': return <BookOpen className="w-5 h-5" />;
      case 'management': return <Target className="w-5 h-5" />;
      case 'prevention': return <Heart className="w-5 h-5" />;
      case 'emergency': return <AlertCircle className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'management': return 'bg-green-100 text-green-800 border-green-200';
      case 'prevention': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderModule = (module: EducationModule) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg border ${getCategoryColor(module.category)}`}>
          {getCategoryIcon(module.category)}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h4>
          <p className="text-gray-600 mb-4">{module.content.overview}</p>

          {module.content.warning && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-800 text-sm font-medium">{module.content.warning}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Key Points:</h5>
              <ul className="space-y-1">
                {module.content.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Action Steps:</h5>
              <ul className="space-y-1">
                {module.content.actionSteps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex items-start text-sm text-gray-700">
                    <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                      {stepIndex + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {module.interactive && (
              <div className="border-t pt-4">
                <h5 className="font-semibold text-gray-900 mb-3">Interactive Exercise:</h5>
                {module.interactive.type === 'checklist' && (
                  <div className="space-y-2">
                    {module.interactive.items.map((item) => (
                      <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          onChange={(e) => {
                            const newAnswers = { ...quizAnswers };
                            if (!newAnswers[module.id]) newAnswers[module.id] = {};
                            newAnswers[module.id][item.id] = e.target.checked;
                            setQuizAnswers(newAnswers);
                          }}
                        />
                        <span className="text-sm text-gray-700">{item.text}</span>
                      </label>
                    ))}
                  </div>
                )}
                {module.interactive.type === 'tracker' && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">Use this tracking template:</p>
                    <div className="space-y-2">
                      {module.interactive.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700 w-32">{item.text}:</span>
                          <div className="flex-1 border-b border-gray-300"></div>
                          <span className="text-xs text-gray-500">Date/Time</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-gray-500">Duration: {module.duration}</span>
              <button
                onClick={() => markModuleComplete(module.id)}
                disabled={completedModules.has(module.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  completedModules.has(module.id)
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {completedModules.has(module.id) ? (
                  <>
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Completed
                  </>
                ) : (
                  'Mark Complete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (modules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>Patient education modules are being developed for this condition.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Patient Education Center</h3>
      </div>

      {/* Progress Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900">Your Progress</h4>
            <p className="text-blue-700 text-sm">
              {completedModules.size} of {modules.length} modules completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">
              {Math.round((completedModules.size / modules.length) * 100)}%
            </div>
            <div className="text-xs text-blue-700">Complete</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedModules.size / modules.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Module Selection */}
      {!activeModule && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose a Learning Module</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg border ${getCategoryColor(module.category)}`}>
                      {getCategoryIcon(module.category)}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">{module.title}</h5>
                      <p className="text-gray-600 text-sm mb-2">{module.content.overview}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Duration: {module.duration}</span>
                        {completedModules.has(module.id) && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Learning Tips:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Take your time with each module - there's no rush</li>
              <li>• Practice the action steps in your daily routine</li>
              <li>• Share what you learn with family and friends</li>
              <li>• Bring questions to your next healthcare appointment</li>
              <li>• Review completed modules periodically as refreshers</li>
            </ul>
          </div>
        </div>
      )}

      {/* Active Module */}
      {activeModule && (
        <div>
          <button
            onClick={() => setActiveModule(null)}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Back to Modules
          </button>
          {renderModule(modules.find(m => m.id === activeModule)!)}
        </div>
      )}
    </div>
  );
};