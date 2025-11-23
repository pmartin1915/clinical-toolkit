import { useState } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle, Brain, Heart, Users, Shield, Clock } from 'lucide-react';

interface PatientData {
  phq9Score: number;
  hasActiveSuicidalIdeation: boolean;
  hasPlanOrIntent: boolean;
  hasUnableToCareSelf: boolean;
  hasPsychosis: boolean;
  hasMania: boolean;
  needsDetox: boolean;
  age: number;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  hasWeightConcerns: boolean;
  hasFatigue: boolean;
  hasAnxiety: boolean;
  hasNeuropathicPain: boolean;
  hasSexualSideEffectConcerns: boolean;
  hasInsomnia: boolean;
  hasLowAppetite: boolean;
  hasAdherenceConcerns: boolean;
  hasPriorSSRIResponse: boolean;
  treatmentPreference: 'medication' | 'therapy' | 'combination' | 'no_preference';
  psychotherapyAccess: boolean;
  previousTreatments: string[];
  substanceUseHistory: boolean;
  costConcerns: boolean;
}

interface TreatmentRecommendation {
  severity: 'mild' | 'moderate' | 'moderately-severe' | 'severe' | 'emergency';
  primaryRecommendation: TreatmentOption;
  alternativeOptions: TreatmentOption[];
  reasoning: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  followUp: string;
  monitoring: string[];
  safetyPlan: string[];
  goals: string[];
}

interface TreatmentOption {
  type: 'medication' | 'therapy' | 'combination' | 'observation' | 'emergency';
  name: string;
  details: string[];
  advantages: string[];
  considerations: string[];
  duration: string;
  monitoringNeeded: string[];
}

export const DepressionTreatment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData>({
    phq9Score: 0,
    hasActiveSuicidalIdeation: false,
    hasPlanOrIntent: false,
    hasUnableToCareSelf: false,
    hasPsychosis: false,
    hasMania: false,
    needsDetox: false,
    age: 0,
    isPregnant: false,
    isBreastfeeding: false,
    hasWeightConcerns: false,
    hasFatigue: false,
    hasAnxiety: false,
    hasNeuropathicPain: false,
    hasSexualSideEffectConcerns: false,
    hasInsomnia: false,
    hasLowAppetite: false,
    hasAdherenceConcerns: false,
    hasPriorSSRIResponse: false,
    treatmentPreference: 'no_preference',
    psychotherapyAccess: false,
    previousTreatments: [],
    substanceUseHistory: false,
    costConcerns: false
  });
  
  const [showResults, setShowResults] = useState(false);

  const previousTreatments = [
    'None - newly diagnosed',
    'Previous SSRI (sertraline, escitalopram, etc.)',
    'Previous SNRI (duloxetine, venlafaxine)',
    'Previous atypical (bupropion, mirtazapine)',
    'Previous psychotherapy',
    'Combination therapy (medication + therapy)'
  ];

  const updatePatientData = (field: keyof PatientData, value: boolean | number | string | string[]) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const togglePreviousTreatment = (treatment: string) => {
    setPatientData(prev => ({
      ...prev,
      previousTreatments: prev.previousTreatments.includes(treatment)
        ? prev.previousTreatments.filter(t => t !== treatment)
        : [...prev.previousTreatments, treatment]
    }));
  };

  const needsEmergencyEvaluation = (): boolean => {
    return patientData.hasActiveSuicidalIdeation && patientData.hasPlanOrIntent ||
           patientData.hasUnableToCareSelf ||
           patientData.hasPsychosis ||
           patientData.hasMania ||
           patientData.needsDetox;
  };

  const getSeverityFromPHQ9 = (): 'mild' | 'moderate' | 'moderately-severe' | 'severe' => {
    const score = patientData.phq9Score;
    if (score >= 20) return 'severe';
    if (score >= 15) return 'moderately-severe';
    if (score >= 10) return 'moderate';
    return 'mild';
  };

  const getOptimalMedication = (): string => {
    const { 
      hasWeightConcerns, hasFatigue, hasAnxiety, hasNeuropathicPain,
      hasSexualSideEffectConcerns, hasInsomnia, hasLowAppetite,
      isBreastfeeding, hasAdherenceConcerns, hasPriorSSRIResponse
    } = patientData;

    // Clinical context-based selection
    if (hasWeightConcerns || hasFatigue) return 'Bupropion';
    if (hasNeuropathicPain || hasAnxiety) return 'Duloxetine';
    if (hasSexualSideEffectConcerns) return 'Bupropion or Mirtazapine';
    if (hasInsomnia || hasLowAppetite) return 'Mirtazapine';
    if (isBreastfeeding) return 'Sertraline';
    if (hasAdherenceConcerns) return 'Fluoxetine (long half-life)';
    if (hasPriorSSRIResponse) return 'SNRI (duloxetine/venlafaxine) or bupropion';
    
    // Default first-line options
    return 'Sertraline, Escitalopram, or Fluoxetine';
  };

  const generateRecommendations = (): TreatmentRecommendation => {
    if (needsEmergencyEvaluation()) {
      return {
        severity: 'emergency',
        primaryRecommendation: {
          type: 'emergency',
          name: 'Emergency Department Evaluation',
          details: [
            'IMMEDIATE psychiatric evaluation required',
            'Safety assessment and stabilization',
            'Consider involuntary hold if necessary',
            'Do not leave patient alone'
          ],
          advantages: ['Immediate safety', 'Crisis intervention', 'Professional assessment'],
          considerations: ['Requires immediate action', 'May involve hospitalization'],
          duration: 'Immediate',
          monitoringNeeded: ['Continuous safety monitoring']
        },
        alternativeOptions: [],
        reasoning: 'Active suicidal ideation with plan/intent, psychosis, mania, or inability to care for self requires immediate evaluation',
        urgency: 'emergency',
        followUp: 'Emergency department NOW',
        monitoring: ['Continuous safety assessment'],
        safetyPlan: [
          'Remove means of self-harm',
          'Constant supervision required',
          'Emergency contacts notified',
          'Crisis hotline: 988 (Suicide & Crisis Lifeline)'
        ],
        goals: ['Immediate safety', 'Crisis stabilization']
      };
    }

    const severity = getSeverityFromPHQ9();
    const score = patientData.phq9Score;
    const hasTherapyAccess = patientData.psychotherapyAccess;
    const preference = patientData.treatmentPreference;

    let primaryRecommendation: TreatmentOption;
    const alternativeOptions: TreatmentOption[] = [];
    let reasoning = '';
    let followUp = '';

    switch (severity) {
      case 'mild':
        if (preference === 'therapy' || !hasTherapyAccess) {
          primaryRecommendation = {
            type: 'observation',
            name: 'Watchful Waiting with Support',
            details: [
              'Regular exercise program',
              'Sleep hygiene education', 
              'Stress management techniques',
              'Regular follow-up every 2-4 weeks'
            ],
            advantages: ['No medication side effects', 'Builds coping skills', 'Cost-effective'],
            considerations: ['Requires motivated patient', 'May not be sufficient alone'],
            duration: '6-8 weeks trial',
            monitoringNeeded: ['PHQ-9 every 2-4 weeks', 'Functional assessment']
          };
          
          if (hasTherapyAccess) {
            alternativeOptions.push({
              type: 'therapy',
              name: 'Psychotherapy',
              details: [
                'Cognitive Behavioral Therapy (CBT)',
                'Interpersonal Therapy (IPT)',
                '12-16 sessions typically'
              ],
              advantages: ['Durable response', 'Teaches coping skills', 'No medication side effects'],
              considerations: ['Requires time commitment', 'May have wait times'],
              duration: '12-16 weeks',
              monitoringNeeded: ['Session attendance', 'Symptom improvement']
            });
          }
        } else {
          primaryRecommendation = {
            type: 'therapy',
            name: 'Psychotherapy (First-line)',
            details: [
              'Cognitive Behavioral Therapy (CBT) preferred',
              'Interpersonal Therapy (IPT) alternative',
              '12-16 sessions over 3-4 months'
            ],
            advantages: ['Evidence-based', 'Durable response', 'No side effects'],
            considerations: ['Time commitment', 'Requires engagement'],
            duration: '12-16 weeks',
            monitoringNeeded: ['Therapy attendance', 'PHQ-9 improvement']
          };
        }
        reasoning = `PHQ-9 score ${score} indicates mild depression. Psychotherapy or watchful waiting appropriate.`;
        followUp = 'Every 2-4 weeks initially';
        break;

      case 'moderate':
        if (preference === 'medication' || !hasTherapyAccess) {
          primaryRecommendation = {
            type: 'medication',
            name: `Antidepressant: ${getOptimalMedication()}`,
            details: [
              'Start low dose, titrate weekly',
              'Full therapeutic trial: 4-6 weeks',
              'Continue 6-12 months if effective',
              'Monitor for side effects and suicidal thoughts'
            ],
            advantages: ['Proven efficacy', 'Convenient', 'Relatively quick onset'],
            considerations: ['Side effects possible', 'Requires monitoring', 'Cost considerations'],
            duration: '6-12 months minimum',
            monitoringNeeded: ['PHQ-9 every 2 weeks initially', 'Side effects', 'Suicidal ideation']
          };
        } else {
          primaryRecommendation = {
            type: 'therapy',
            name: 'Psychotherapy',
            details: [
              'CBT or IPT as first-line',
              'Consider medication if poor response',
              'Regular sessions for 12-16 weeks'
            ],
            advantages: ['Effective for moderate depression', 'Builds long-term skills'],
            considerations: ['May take longer than medication', 'Requires commitment'],
            duration: '12-16 weeks',
            monitoringNeeded: ['Session progress', 'Symptom tracking']
          };
          
          alternativeOptions.push({
            type: 'medication',
            name: `Antidepressant Alternative: ${getOptimalMedication()}`,
            details: ['Consider if therapy unavailable or ineffective'],
            advantages: ['Proven efficacy', 'May work faster than therapy'],
            considerations: ['Side effects', 'Long-term commitment'],
            duration: '6-12 months',
            monitoringNeeded: ['Regular monitoring']
          });
        }
        reasoning = `PHQ-9 score ${score} indicates moderate depression. Both psychotherapy and medication are effective.`;
        followUp = 'Every 2-4 weeks initially';
        break;

      case 'moderately-severe':
        if (preference === 'therapy' && hasTherapyAccess) {
          primaryRecommendation = {
            type: 'combination',
            name: 'Combination Therapy (Medication + Psychotherapy)',
            details: [
              `Antidepressant: ${getOptimalMedication()}`,
              'CBT or IPT concurrently',
              'More effective than either alone',
              'Consider if high functional impact'
            ],
            advantages: ['Most effective approach', 'Addresses multiple aspects', 'Lower relapse rates'],
            considerations: ['Higher cost', 'More time intensive', 'Coordination needed'],
            duration: '4-6 months initially',
            monitoringNeeded: ['Weekly initially', 'PHQ-9 every 2 weeks', 'Therapy progress']
          };
        } else {
          primaryRecommendation = {
            type: 'medication',
            name: `Antidepressant: ${getOptimalMedication()}`,
            details: [
              'Start appropriate first-line agent',
              'May need higher doses or augmentation',
              'Close monitoring essential',
              'Consider therapy referral'
            ],
            advantages: ['Proven for moderate-severe depression', 'Can be effective as monotherapy'],
            considerations: ['May need optimization', 'Higher side effect risk'],
            duration: '9-12 months minimum',
            monitoringNeeded: ['Weekly first month', 'PHQ-9 every 2 weeks', 'Side effects']
          };
          
          if (hasTherapyAccess) {
            alternativeOptions.push({
              type: 'combination',
              name: 'Add Psychotherapy',
              details: ['Consider adding CBT to medication'],
              advantages: ['Enhanced efficacy', 'Better long-term outcomes'],
              considerations: ['Additional time and cost'],
              duration: 'Concurrent with medication',
              monitoringNeeded: ['Combined monitoring']
            });
          }
        }
        reasoning = `PHQ-9 score ${score} indicates moderately severe depression. Combination therapy often superior.`;
        followUp = 'Weekly initially, then every 2 weeks';
        break;

      case 'severe':
        primaryRecommendation = {
          type: 'combination',
          name: 'Intensive Combination Treatment',
          details: [
            `Antidepressant: ${getOptimalMedication()}`,
            'Intensive psychotherapy (CBT/IPT)',
            'Consider ECT if medication-resistant',
            'Close monitoring for safety'
          ],
          advantages: ['Most effective for severe depression', 'Comprehensive approach'],
          considerations: ['Intensive treatment required', 'Higher monitoring needs'],
          duration: '12+ months',
          monitoringNeeded: ['Weekly monitoring', 'Safety assessment', 'Functional improvement']
        };
        
        alternativeOptions.push({
          type: 'medication',
          name: 'Intensive Medication Management',
          details: [
            'Aggressive medication optimization',
            'Consider augmentation strategies',
            'Psychiatric consultation recommended'
          ],
          advantages: ['Can be very effective', 'Multiple options available'],
          considerations: ['Complex medication management', 'Side effect monitoring'],
          duration: '12+ months',
          monitoringNeeded: ['Intensive monitoring required']
        });
        
        reasoning = `PHQ-9 score ${score} indicates severe depression. Aggressive treatment with combination therapy recommended.`;
        followUp = 'Weekly initially, very close monitoring';
        break;
    }

    const safetyPlan = patientData.hasActiveSuicidalIdeation ? [
      'Remove means of self-harm',
      'Identify warning signs',
      'Coping strategies when distressed',
      'Social contacts for support',
      'Professional contacts (therapist, psychiatrist)',
      'Crisis hotline: 988 (Suicide & Crisis Lifeline)'
    ] : [
      'Monitor for worsening symptoms',
      'Watch for emerging suicidal thoughts',
      'Maintain social connections',
      'Follow treatment plan consistently'
    ];

    return {
      severity,
      primaryRecommendation,
      alternativeOptions,
      reasoning,
      urgency: patientData.hasActiveSuicidalIdeation ? 'urgent' : 'routine',
      followUp,
      monitoring: [
        'PHQ-9 scores every 2-4 weeks',
        'Suicidal ideation assessment',
        'Functional improvement (work, relationships)',
        'Medication adherence and side effects',
        'Sleep, appetite, energy levels'
      ],
      safetyPlan,
      goals: [
        'Achieve remission (PHQ-9 <5)',
        'Return to baseline functioning',
        'Prevent relapse and recurrence',
        'Improve quality of life',
        'Develop effective coping strategies'
      ]
    };
  };

  const recommendation = showResults ? generateRecommendations() : null;

  const stepTitles = [
    'PHQ-9 Assessment',
    'Safety Evaluation',
    'Clinical Factors',
    'Treatment Preferences',
    'Treatment Plan'
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 border-red-300 text-red-800';
      case 'urgent': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'border-red-500 bg-red-50';
      case 'moderately-severe': return 'border-orange-500 bg-orange-50';
      case 'moderate': return 'border-yellow-500 bg-yellow-50';
      case 'mild': return 'border-green-500 bg-green-50';
      case 'emergency': return 'border-red-600 bg-red-100';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PHQ-9 Score
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={patientData.phq9Score || ''}
                  onChange={(e) => updatePatientData('phq9Score', parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="12"
                  min="0"
                  max="27"
                />
                <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500 text-sm">
                  /27
                </span>
              </div>
            </div>

            {patientData.phq9Score > 0 && (
              <div className={`p-4 rounded-lg border-2 ${getSeverityColor(getSeverityFromPHQ9())}`}>
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span className="font-medium">
                    PHQ-9 Score {patientData.phq9Score}: {
                      patientData.phq9Score >= 20 ? 'Severe Depression' :
                      patientData.phq9Score >= 15 ? 'Moderately Severe Depression' :
                      patientData.phq9Score >= 10 ? 'Moderate Depression' :
                      patientData.phq9Score >= 5 ? 'Mild Depression' :
                      'Minimal Depression'
                    }
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <p><strong>Suggested Treatment:</strong> {
                    patientData.phq9Score >= 20 ? 'Antidepressant + therapy; consider ECT if needed' :
                    patientData.phq9Score >= 15 ? 'Antidepressant or therapy; combo if functional impact high' :
                    patientData.phq9Score >= 10 ? 'Antidepressant or psychotherapy' :
                    patientData.phq9Score >= 5 ? 'Watchful waiting, exercise, or psychotherapy' :
                    'Monitor symptoms'
                  }</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={patientData.age || ''}
                onChange={(e) => updatePatientData('age', parseInt(e.target.value) || 0)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="35"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Emergency Assessment - Send to ED if ANY present:
              </h4>
              
              <div className="space-y-3">
                <label className="flex items-start p-3 border border-red-200 rounded-lg hover:bg-red-100">
                  <input
                    type="checkbox"
                    checked={patientData.hasActiveSuicidalIdeation}
                    onChange={(e) => updatePatientData('hasActiveSuicidalIdeation', e.target.checked)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-red-900 font-medium">Active suicidal ideation</span>
                    <p className="text-sm text-red-700">Current thoughts of self-harm or suicide</p>
                  </div>
                </label>

                {patientData.hasActiveSuicidalIdeation && (
                  <label className="flex items-start p-3 border border-red-300 rounded-lg hover:bg-red-100 ml-6">
                    <input
                      type="checkbox"
                      checked={patientData.hasPlanOrIntent}
                      onChange={(e) => updatePatientData('hasPlanOrIntent', e.target.checked)}
                      className="mr-3 mt-1"
                    />
                    <div>
                      <span className="text-red-900 font-bold">Plan or intent to harm self</span>
                      <p className="text-sm text-red-800">IMMEDIATE ED evaluation required</p>
                    </div>
                  </label>
                )}

                <label className="flex items-start p-3 border border-red-200 rounded-lg hover:bg-red-100">
                  <input
                    type="checkbox"
                    checked={patientData.hasUnableToCareSelf}
                    onChange={(e) => updatePatientData('hasUnableToCareSelf', e.target.checked)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-red-900 font-medium">Unable to care for self</span>
                    <p className="text-sm text-red-700">Refusal to eat/drink, basic hygiene</p>
                  </div>
                </label>

                <label className="flex items-start p-3 border border-red-200 rounded-lg hover:bg-red-100">
                  <input
                    type="checkbox"
                    checked={patientData.hasPsychosis}
                    onChange={(e) => updatePatientData('hasPsychosis', e.target.checked)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-red-900 font-medium">Psychosis</span>
                    <p className="text-sm text-red-700">Hallucinations, delusions, thought disorder</p>
                  </div>
                </label>

                <label className="flex items-start p-3 border border-red-200 rounded-lg hover:bg-red-100">
                  <input
                    type="checkbox"
                    checked={patientData.hasMania}
                    onChange={(e) => updatePatientData('hasMania', e.target.checked)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-red-900 font-medium">Mania</span>
                    <p className="text-sm text-red-700">Elevated mood, decreased sleep, poor judgment</p>
                  </div>
                </label>

                <label className="flex items-start p-3 border border-red-200 rounded-lg hover:bg-red-100">
                  <input
                    type="checkbox"
                    checked={patientData.needsDetox}
                    onChange={(e) => updatePatientData('needsDetox', e.target.checked)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-red-900 font-medium">Need for detox</span>
                    <p className="text-sm text-red-700">Alcohol or substance withdrawal</p>
                  </div>
                </label>
              </div>

              {needsEmergencyEvaluation() && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-900 font-bold">WARNING: EMERGENCY EVALUATION REQUIRED</p>
                  <p className="text-sm text-red-800">Do not leave patient alone. Send to ED immediately.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">Clinical factors affecting medication choice:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'isPregnant', label: 'Currently pregnant', icon: '�' },
                  { key: 'isBreastfeeding', label: 'Currently breastfeeding', icon: '�' },
                  { key: 'hasWeightConcerns', label: 'Weight gain concerns', icon: '⚖' },
                  { key: 'hasFatigue', label: 'Fatigue/apathy predominant', icon: '�' },
                  { key: 'hasAnxiety', label: 'Co-occurring anxiety', icon: '�' },
                  { key: 'hasNeuropathicPain', label: 'Neuropathic pain/fibromyalgia', icon: '�' },
                  { key: 'hasSexualSideEffectConcerns', label: 'Sexual side effect concerns', icon: '�' },
                  { key: 'hasInsomnia', label: 'Insomnia predominant', icon: '�' },
                  { key: 'hasLowAppetite', label: 'Low appetite/weight loss', icon: '�' },
                  { key: 'hasAdherenceConcerns', label: 'Adherence concerns', icon: '�' },
                  { key: 'substanceUseHistory', label: 'History of substance use', icon: '�' },
                  { key: 'costConcerns', label: 'Cost/insurance concerns', icon: '�' }
                ].map(({ key, label, icon }) => (
                  <label key={key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={patientData[key as keyof PatientData] as boolean}
                      onChange={(e) => updatePatientData(key as keyof PatientData, e.target.checked)}
                      className="mr-3"
                    />
                    <span className="mr-2">{icon}</span>
                    <span className="text-gray-900 text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-4">Treatment history:</p>
              
              <div className="space-y-2">
                {previousTreatments.map((treatment) => (
                  <label key={treatment} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={patientData.previousTreatments.includes(treatment)}
                      onChange={() => togglePreviousTreatment(treatment)}
                      className="mr-3 mt-1"
                    />
                    <span className="text-gray-900 text-sm">{treatment}</span>
                  </label>
                ))}
              </div>

              {patientData.previousTreatments.some(t => t.includes('SSRI')) && (
                <div className="mt-3">
                  <label className="flex items-center p-3 border border-blue-200 rounded-lg hover:bg-blue-50">
                    <input
                      type="checkbox"
                      checked={patientData.hasPriorSSRIResponse}
                      onChange={(e) => updatePatientData('hasPriorSSRIResponse', e.target.checked)}
                      className="mr-3"
                    />
                    <span className="text-blue-900 text-sm">Good response to previous SSRI</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Patient treatment preference:
              </label>
              <div className="space-y-2">
                {[
                  { value: 'no_preference', label: 'No preference - want recommendation' },
                  { value: 'medication', label: 'Prefer medication' },
                  { value: 'therapy', label: 'Prefer psychotherapy' },
                  { value: 'combination', label: 'Prefer combination (medication + therapy)' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="treatmentPreference"
                      value={option.value}
                      checked={patientData.treatmentPreference === option.value}
                      onChange={(e) => updatePatientData('treatmentPreference', e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={patientData.psychotherapyAccess}
                  onChange={(e) => updatePatientData('psychotherapyAccess', e.target.checked)}
                  className="mr-3"
                />
                <span className="text-gray-900">Psychotherapy access available (reasonable wait times, insurance coverage)</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return patientData.phq9Score > 0 && patientData.age > 0;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  if (showResults && recommendation) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Depression Treatment Plan</h3>
        </div>

        <div className={`p-4 rounded-lg border-2 mb-6 ${getUrgencyColor(recommendation.urgency)}`}>
          <div className="flex items-center space-x-2 mb-2">
            {recommendation.urgency === 'emergency' && <AlertTriangle className="w-5 h-5" />}
            {recommendation.urgency === 'urgent' && <AlertTriangle className="w-5 h-5" />}
            {recommendation.urgency === 'routine' && <CheckCircle className="w-5 h-5" />}
            <span className="font-bold capitalize">{recommendation.severity.replace('-', ' ')} Depression</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              recommendation.severity === 'severe' || recommendation.severity === 'emergency' ? 'bg-red-100 text-red-800' :
              recommendation.severity === 'moderately-severe' ? 'bg-orange-100 text-orange-800' :
              recommendation.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              PHQ-9: {patientData.phq9Score}
            </span>
          </div>
          <p className="text-sm">{recommendation.reasoning}</p>
        </div>

        {/* Safety Plan */}
        {recommendation.safetyPlan.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
            <h4 className="font-semibold text-red-900 mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Safety Plan
            </h4>
            <ul className="space-y-2">
              {recommendation.safetyPlan.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-red-800 text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Primary Recommendation */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Primary Recommendation
          </h4>
          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h5 className="font-semibold text-gray-900 text-lg">{recommendation.primaryRecommendation.name}</h5>
                <p className="text-sm text-gray-600 capitalize">{recommendation.primaryRecommendation.type} approach</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {recommendation.primaryRecommendation.duration}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h6 className="font-medium text-green-900 mb-2">Treatment Details:</h6>
                <ul className="text-sm text-green-800 space-y-1">
                  {recommendation.primaryRecommendation.details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="font-medium text-green-900 mb-2">Advantages:</h6>
                  <ul className="text-sm text-green-800 space-y-1">
                    {recommendation.primaryRecommendation.advantages.map((advantage, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-medium text-green-900 mb-2">Considerations:</h6>
                  <ul className="text-sm text-green-800 space-y-1">
                    {recommendation.primaryRecommendation.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {consideration}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Options */}
        {recommendation.alternativeOptions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              Alternative Options
            </h4>
            <div className="space-y-3">
              {recommendation.alternativeOptions.map((option, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-gray-900">{option.name}</h5>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {option.type}
                    </span>
                  </div>
                  <div className="text-sm text-blue-800">
                    <strong>Key benefits:</strong> {option.advantages.join(', ')}
                  </div>
                  {option.details.length > 0 && (
                    <div className="text-xs text-blue-700 mt-1">
                      {option.details.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitoring and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monitoring */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Monitoring Schedule
            </h4>
            <ul className="space-y-2 mb-3">
              {recommendation.monitoring.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-yellow-800 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-yellow-200 pt-3">
              <p className="text-sm font-medium text-yellow-900">Follow-up Schedule:</p>
              <p className="text-sm text-yellow-800">{recommendation.followUp}</p>
            </div>
          </div>

          {/* Treatment Goals */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Treatment Goals
            </h4>
            <ul className="space-y-2">
              {recommendation.goals.map((goal, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-purple-800 text-sm">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clinical Reminders */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Key Clinical Reminders:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Aim for remission, not just symptom reduction</li>
            <li>• Both medication and psychotherapy are effective for mild-moderate MDD</li>
            <li>• Monitor closely for suicidal ideation, especially first 4-6 weeks of treatment</li>
            <li>• Use shared decision-making considering patient preferences and access</li>
            <li>• Continue treatment 6-12 months after remission to prevent relapse</li>
          </ul>
        </div>

        <button
          onClick={() => {
            setShowResults(false);
            setCurrentStep(1);
            setPatientData({
              phq9Score: 0, hasActiveSuicidalIdeation: false, hasPlanOrIntent: false,
              hasUnableToCareSelf: false, hasPsychosis: false, hasMania: false,
              needsDetox: false, age: 0, isPregnant: false, isBreastfeeding: false,
              hasWeightConcerns: false, hasFatigue: false, hasAnxiety: false,
              hasNeuropathicPain: false, hasSexualSideEffectConcerns: false,
              hasInsomnia: false, hasLowAppetite: false, hasAdherenceConcerns: false,
              hasPriorSSRIResponse: false, treatmentPreference: 'no_preference',
              psychotherapyAccess: false, previousTreatments: [], substanceUseHistory: false,
              costConcerns: false
            });
          }}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
        >
          Start New Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">Depression Treatment Decision Tree</h3>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          {stepTitles.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index + 1 === currentStep 
                  ? 'bg-primary-600 text-white' 
                  : index + 1 < currentStep 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1 < currentStep ? '✓' : index + 1}
              </div>
              {index < stepTitles.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
        <h4 className="text-lg font-semibold text-gray-900">{stepTitles[currentStep - 1]}</h4>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < stepTitles.length ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setShowResults(true)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Treatment Plan
          </button>
        )}
      </div>
    </div>
  );
};