import type { Condition } from '../../types';

export const depression: Condition = {
  id: 'depression',
  title: 'Major Depressive Disorder (MDD)',
  shortDescription: 'Evidence-based diagnosis and treatment of major depressive disorder',
  category: 'mental-health',
  severity: 'high',
  overview: {
    definition: 'MDD involves persistent depressed mood or anhedonia for ≥2 weeks, with additional symptoms causing significant functional impairment.',
    prevalence: 'Lifetime prevalence ~17%, with 8.3% experiencing MDD annually. Leading cause of disability worldwide.',
    keyPoints: [
      'Aim for remission, not just symptom reduction',
      'Both psychotherapy and medication are effective',
      'Combination therapy recommended for severe depression',
      'Monitor closely for suicidal ideation, especially early in treatment'
    ]
  },
  guidelines: {
    diagnosis: [
      'PHQ-9 score ≥10 suggests major depression',
      'At least one core symptom: depressed mood or anhedonia',
      'Symptoms present most days for ≥2 weeks',
      'Significant functional impairment'
    ],
    treatment: [
      {
        category: 'Psychotherapy',
        options: [
          {
            name: 'Cognitive Behavioral Therapy (CBT)',
            notes: 'Evidence-based, focuses on thought patterns and behaviors',
            duration: '12-20 sessions typically'
          },
          {
            name: 'Interpersonal Therapy (IPT)',
            notes: 'Focuses on relationship patterns and life transitions'
          }
        ]
      },
      {
        category: 'First-line Antidepressants',
        options: [
          {
            name: 'Sertraline',
            dosage: '25-50mg daily → 50-200mg daily',
            notes: 'Well-tolerated, good for anxiety comorbidity'
          },
          {
            name: 'Escitalopram',
            dosage: '5-10mg daily → 10-20mg daily',
            notes: 'Minimal drug interactions, well-tolerated'
          },
          {
            name: 'Fluoxetine',
            dosage: '10-20mg daily → 20-80mg daily',
            notes: 'Long half-life, good for adherence concerns'
          },
          {
            name: 'Bupropion XL',
            dosage: '150mg daily → 300-450mg daily',
            notes: 'Good for fatigue, minimal sexual side effects'
          },
          {
            name: 'Duloxetine',
            dosage: '30mg daily → 60-120mg daily',
            notes: 'Good for comorbid chronic pain or neuropathy'
          }
        ]
      },
      {
        category: 'Treatment by Severity',
        options: [
          {
            name: 'Mild (PHQ-9: 5-9)',
            notes: 'Watchful waiting, exercise, psychotherapy'
          },
          {
            name: 'Moderate (PHQ-9: 10-14)',
            notes: 'Antidepressant OR psychotherapy'
          },
          {
            name: 'Severe (PHQ-9: 20+)',
            notes: 'Antidepressant + psychotherapy; consider ECT'
          }
        ]
      }
    ],
    monitoring: [
      'PHQ-9 every 2-4 weeks initially',
      'Assess suicidal ideation at each visit',
      'Monitor medication adherence and side effects',
      'Functional improvement assessment'
    ]
  },
  tools: [
    {
      id: 'phq9-assessment',
      name: 'PHQ-9 Depression Screening',
      description: 'Standardized tool for depression screening and monitoring',
      type: 'assessment',
      component: 'PHQ9Assessment',
      inputs: [
        { 
          id: 'interest', 
          label: 'Little interest or pleasure in doing things', 
          type: 'select', 
          required: true,
          options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
        },
        { 
          id: 'depressed', 
          label: 'Feeling down, depressed, or hopeless', 
          type: 'select', 
          required: true,
          options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
        }
      ]
    },
    {
      id: 'antidepressant-guide',
      name: 'Antidepressant Selection Guide',
      description: 'Choose optimal antidepressant based on patient factors',
      type: 'reference',
      component: 'AntidepressantGuide'
    },
    {
      id: 'mood-tracker',
      name: 'Daily Mood Tracker',
      description: 'Track mood, energy, sleep, and medication effects',
      type: 'tracker',
      component: 'MoodTracker'
    },
    {
      id: 'suicide-risk-assessment',
      name: 'Suicide Risk Assessment',
      description: 'Structured assessment of suicide risk factors',
      type: 'assessment',
      component: 'SuicideRiskAssessment'
    },
    {
      id: 'behavioral-activation',
      name: 'Behavioral Activation Planner',
      description: 'Schedule pleasant activities to improve mood',
      type: 'education',
      component: 'BehavioralActivation'
    }
  ],
  resources: [
    {
      title: 'APA Practice Guideline for MDD',
      type: 'guideline',
      citation: 'American Psychological Association. Clinical Practice Guideline for the Treatment of Depression Across Three Age Cohorts. 2019.'
    },
    {
      title: 'National Suicide Prevention Lifeline',
      type: 'education',
      url: 'https://988lifeline.org',
      citation: '988 Suicide & Crisis Lifeline - 24/7 crisis support'
    }
  ]
};