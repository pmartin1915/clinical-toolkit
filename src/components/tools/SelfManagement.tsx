import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Award, Target, Plus, Check, AlertCircle, Heart } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  category: 'medication' | 'exercise' | 'diet' | 'monitoring' | 'lifestyle';
  target: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  progress: number;
  maxProgress: number;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  reminder?: string;
}

interface Tracking {
  id: string;
  date: string;
  type: 'medication' | 'exercise' | 'symptom' | 'vitals' | 'mood';
  value: string | number;
  notes?: string;
  goalId?: string;
}

interface SelfManagementProps {
  condition: string;
}

export const SelfManagement = ({ condition }: SelfManagementProps) => {
  const [activeTab, setActiveTab] = useState<'goals' | 'tracking' | 'progress' | 'insights'>('goals');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tracking, setTracking] = useState<Tracking[]>([]);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({});
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Load condition-specific default goals
  useEffect(() => {
    const defaultGoals = getDefaultGoals(condition);
    setGoals(defaultGoals);
  }, [condition]);

  const getDefaultGoals = (conditionId: string): Goal[] => {
    const goalTemplates: Record<string, Goal[]> = {
      hypertension: [
        {
          id: 'bp-monitoring',
          title: 'Monitor Blood Pressure',
          category: 'monitoring',
          target: 'Check BP 3 times per week',
          frequency: 'weekly',
          progress: 0,
          maxProgress: 3,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Monday, Wednesday, Friday mornings'
        },
        {
          id: 'medication-adherence',
          title: 'Take Medications Daily',
          category: 'medication',
          target: 'Take all prescribed medications',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Same time each day'
        },
        {
          id: 'sodium-reduction',
          title: 'Reduce Sodium Intake',
          category: 'diet',
          target: 'Keep sodium under 2300mg daily',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Read nutrition labels'
        },
        {
          id: 'exercise-routine',
          title: 'Regular Exercise',
          category: 'exercise',
          target: '30 minutes moderate activity',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Walking, cycling, or swimming'
        }
      ],
      diabetes: [
        {
          id: 'glucose-monitoring',
          title: 'Blood Sugar Monitoring',
          category: 'monitoring',
          target: 'Check glucose as prescribed',
          frequency: 'daily',
          progress: 0,
          maxProgress: 4,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Before meals and bedtime'
        },
        {
          id: 'medication-timing',
          title: 'Take Diabetes Medications',
          category: 'medication',
          target: 'Take all medications on schedule',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'With meals or as directed'
        },
        {
          id: 'carb-counting',
          title: 'Track Carbohydrates',
          category: 'diet',
          target: 'Log carbs for all meals',
          frequency: 'daily',
          progress: 0,
          maxProgress: 3,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Use measuring cups or food scale'
        },
        {
          id: 'foot-care',
          title: 'Daily Foot Inspection',
          category: 'lifestyle',
          target: 'Check feet for cuts or sores',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Use mirror if needed'
        }
      ],
      depression: [
        {
          id: 'mood-tracking',
          title: 'Daily Mood Check-in',
          category: 'monitoring',
          target: 'Rate mood on 1-10 scale',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Evening reflection time'
        },
        {
          id: 'medication-consistency',
          title: 'Take Antidepressant',
          category: 'medication',
          target: 'Take medication same time daily',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Set phone alarm'
        },
        {
          id: 'physical-activity',
          title: 'Physical Activity',
          category: 'exercise',
          target: '20 minutes of movement',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Walking, stretching, or dancing'
        },
        {
          id: 'social-connection',
          title: 'Social Connection',
          category: 'lifestyle',
          target: 'Connect with one person',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Text, call, or meet in person'
        }
      ],
      anxiety: [
        {
          id: 'anxiety-tracking',
          title: 'Track Anxiety Episodes',
          category: 'monitoring',
          target: 'Log anxiety triggers and severity',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Note situation and intensity'
        },
        {
          id: 'breathing-practice',
          title: 'Practice Breathing Exercises',
          category: 'lifestyle',
          target: '10 minutes deep breathing',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: '4-7-8 breathing technique'
        },
        {
          id: 'medication-routine',
          title: 'Anti-anxiety Medication',
          category: 'medication',
          target: 'Take medication as prescribed',
          frequency: 'daily',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Follow doctor instructions'
        },
        {
          id: 'exposure-practice',
          title: 'Gradual Exposure',
          category: 'lifestyle',
          target: 'Face one feared situation',
          frequency: 'weekly',
          progress: 0,
          maxProgress: 1,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          reminder: 'Start small and build confidence'
        }
      ]
    };

    return goalTemplates[conditionId] || [];
  };

  const updateGoalProgress = (goalId: string, increment: number = 1) => {
    setGoals(prevGoals =>
      prevGoals.map(goal => {
        if (goal.id === goalId) {
          const newProgress = Math.min(goal.progress + increment, goal.maxProgress);
          const status = newProgress >= goal.maxProgress ? 'completed' : 'active';
          return { ...goal, progress: newProgress, status };
        }
        return goal;
      })
    );

    // Add tracking entry
    const trackingEntry: Tracking = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'medication', // Will be updated based on goal category
      value: 1,
      goalId: goalId,
      notes: 'Goal progress updated'
    };
    setTracking(prev => [...prev, trackingEntry]);
  };

  const addCustomGoal = () => {
    if (newGoal.title && newGoal.target) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title!,
        category: newGoal.category || 'lifestyle',
        target: newGoal.target!,
        frequency: newGoal.frequency || 'daily',
        progress: 0,
        maxProgress: newGoal.frequency === 'daily' ? 1 : newGoal.frequency === 'weekly' ? 1 : 1,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        reminder: newGoal.reminder
      };
      setGoals(prev => [...prev, goal]);
      setNewGoal({});
      setShowAddGoal(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return '💊';
      case 'exercise': return '🏃';
      case 'diet': return '🥗';
      case 'monitoring': return '📊';
      case 'lifestyle': return '🌟';
      default: return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medication': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'exercise': return 'bg-green-100 text-green-800 border-green-200';
      case 'diet': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'monitoring': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'lifestyle': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.round((goal.progress / goal.maxProgress) * 100);
  };

  const getOverallProgress = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    return totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  };

  const getTodaysCompletions = () => {
    const today = new Date().toISOString().split('T')[0];
    return tracking.filter(t => t.date === today).length;
  };

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">My Health Goals</h4>
        <button
          onClick={() => setShowAddGoal(true)}
          className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Create Custom Goal</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Goal title"
              value={newGoal.title || ''}
              onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Target (e.g., 30 minutes daily)"
              value={newGoal.target || ''}
              onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <select
              value={newGoal.category || 'lifestyle'}
              onChange={(e) => setNewGoal({...newGoal, category: e.target.value as any})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="lifestyle">Lifestyle</option>
              <option value="medication">Medication</option>
              <option value="exercise">Exercise</option>
              <option value="diet">Diet</option>
              <option value="monitoring">Monitoring</option>
            </select>
            <select
              value={newGoal.frequency || 'daily'}
              onChange={(e) => setNewGoal({...newGoal, frequency: e.target.value as any})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={addCustomGoal}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Goal
            </button>
            <button
              onClick={() => setShowAddGoal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryIcon(goal.category)}</span>
                <h5 className="font-semibold text-gray-900">{goal.title}</h5>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(goal.category)}`}>
                {goal.category}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-3">{goal.target}</p>

            {goal.reminder && (
              <p className="text-gray-500 text-xs mb-3">💡 {goal.reminder}</p>
            )}

            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{goal.progress}/{goal.maxProgress}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(goal)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 capitalize">{goal.frequency}</span>
              {goal.status !== 'completed' && (
                <button
                  onClick={() => updateGoalProgress(goal.id)}
                  className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Done
                </button>
              )}
              {goal.status === 'completed' && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">
                  <Check className="w-3 h-3 mr-1" />
                  Complete
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Progress Overview</h4>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <h5 className="font-semibold text-blue-900">Overall Progress</h5>
              <p className="text-2xl font-bold text-blue-800">{getOverallProgress()}%</p>
              <p className="text-blue-600 text-sm">of goals completed</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <h5 className="font-semibold text-green-900">Today</h5>
              <p className="text-2xl font-bold text-green-800">{getTodaysCompletions()}</p>
              <p className="text-green-600 text-sm">activities completed</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-purple-600" />
            <div>
              <h5 className="font-semibold text-purple-900">Streak</h5>
              <p className="text-2xl font-bold text-purple-800">7</p>
              <p className="text-purple-600 text-sm">days active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Progress Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h5 className="font-semibold text-gray-900 mb-4">Goal Completion Status</h5>
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center space-x-3">
              <span className="text-sm">{getCategoryIcon(goal.category)}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">{goal.title}</span>
                  <span className="text-gray-600">{getProgressPercentage(goal)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      goal.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${getProgressPercentage(goal)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Health Insights</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h5 className="font-semibold text-gray-900 mb-3">Weekly Summary</h5>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Goals completed</span>
              <span className="font-medium">{goals.filter(g => g.status === 'completed').length}/{goals.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Most active category</span>
              <span className="font-medium">Exercise</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Streak</span>
              <span className="font-medium">7 days</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h5 className="font-semibold text-gray-900 mb-3">Recommendations</h5>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start space-x-2">
              <Heart className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span>Keep up the great work with daily medication adherence!</span>
            </li>
            <li className="flex items-start space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Consider adding a weekend exercise goal to maintain momentum.</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>Remember to track your progress in monitoring goals.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Target className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-900">Self-Management Center</h3>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'goals', label: 'My Goals', icon: Target },
            { id: 'progress', label: 'Progress', icon: TrendingUp },
            { id: 'insights', label: 'Insights', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'goals' && renderGoals()}
      {activeTab === 'progress' && renderProgress()}
      {activeTab === 'insights' && renderInsights()}
    </div>
  );
};