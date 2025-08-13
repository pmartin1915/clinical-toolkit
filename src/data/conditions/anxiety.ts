import type { Condition } from '../../types';

export const anxiety: Condition = {
  id: 'anxiety',
  title: 'Generalized Anxiety Disorder (GAD)',
  shortDescription: 'Evidence-based management of generalized anxiety disorder in adults',
  category: 'mental-health',
  severity: 'medium',
  overview: {
    definition: 'GAD involves excessive anxiety and worry about multiple life areas, occurring more days than not for at least 6 months, causing significant distress or functional impairment.',
    prevalence: 'Affects 3-5% of adults annually, with lifetime prevalence of 9%. More common in women (2:1 ratio).',
    keyPoints: [
      'CBT and pharmacotherapy are equally effective',
      'SSRIs/SNRIs are first-line medications',
      'Combination therapy may be superior for severe cases',
      'Avoid benzodiazepines as first-line due to dependence risk'
    ]
  },
  guidelines: {
    diagnosis: [
      'GAD-7 score ≥10 suggests clinically significant anxiety',
      'Excessive worry about multiple domains for ≥6 months',
      'Difficult to control worry',
      'Associated with physical symptoms (fatigue, muscle tension, sleep disturbance)'
    ],
    treatment: [
      {
        category: 'Psychotherapy',
        options: [
          {
            name: 'Cognitive Behavioral Therapy (CBT)',
            notes: '47-50% response rate, skills-based approach',
            duration: '12-16 sessions typically'
          },
          {
            name: 'Mindfulness-based interventions',
            notes: 'Complementary to CBT, helps with worry rumination'
          }
        ]
      },
      {
        category: 'First-line Medications',
        options: [
          {
            name: 'Sertraline',
            dosage: '25mg daily → 50-200mg daily',
            notes: 'Start low, increase weekly, full effect 4-6 weeks'
          },
          {
            name: 'Escitalopram',
            dosage: '5mg daily → 10-20mg daily',
            notes: 'Well-tolerated, fewer drug interactions'
          },
          {
            name: 'Venlafaxine XR',
            dosage: '37.5mg daily → 75-225mg daily',
            notes: 'Monitor BP weekly, may raise blood pressure'
          },
          {
            name: 'Duloxetine',
            dosage: '30mg daily → 60-120mg daily',
            notes: 'Good for comorbid chronic pain'
          }
        ]
      },
      {
        category: 'Bridging Therapy (if no SUD history)',
        options: [
          {
            name: 'Lorazepam',
            dosage: '0.5-1mg BID-TID PRN',
            duration: '4-6 weeks maximum',
            notes: 'Taper 0.5mg/week when discontinuing'
          },
          {
            name: 'Hydroxyzine',
            dosage: '25-50mg TID PRN',
            notes: 'Non-addictive alternative for SUD history'
          }
        ]
      }
    ],
    monitoring: [
      'GAD-7 scores every 2-4 weeks initially',
      'Monitor for side effects and adherence',
      'Assess functional improvement',
      'Screen for suicidal ideation'
    ]
  },
  tools: [
    {
      id: 'gad7-assessment',
      name: 'GAD-7 Anxiety Assessment',
      description: 'Standardized screening tool for generalized anxiety disorder',
      type: 'assessment',
      component: 'GAD7Assessment',
      inputs: [
        { 
          id: 'nervous', 
          label: 'Feeling nervous, anxious, or on edge', 
          type: 'select', 
          required: true,
          options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
        },
        { 
          id: 'control', 
          label: 'Not being able to stop or control worrying', 
          type: 'select', 
          required: true,
          options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
        },
        { 
          id: 'worrying', 
          label: 'Worrying too much about different things', 
          type: 'select', 
          required: true,
          options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
        }
      ]
    },
    {
      id: 'anxiety-medication-guide',
      name: 'Anxiety Medication Comparison',
      description: 'Compare SSRIs, SNRIs, and other anxiety medications',
      type: 'reference',
      component: 'AnxietyMedications'
    },
    {
      id: 'cbt-techniques',
      name: 'CBT Techniques Guide',
      description: 'Cognitive restructuring and behavioral techniques for anxiety',
      type: 'education',
      component: 'CBTTechniques'
    },
    {
      id: 'anxiety-tracker',
      name: 'Anxiety Symptom Tracker',
      description: 'Daily tracking of anxiety levels and triggers',
      type: 'tracker',
      component: 'AnxietyTracker'
    },
    {
      id: 'crisis-resources',
      name: 'Crisis Resources Finder',
      description: 'Emergency contacts and crisis intervention resources',
      type: 'reference',
      component: 'CrisisResources'
    },
    {
      id: 'patient-education',
      name: 'Patient Education Center',
      description: 'Interactive learning modules for anxiety management and coping skills',
      type: 'education',
      component: 'PatientEducation'
    },
    {
      id: 'self-management',
      name: 'Self-Management Tools',
      description: 'Goal setting, anxiety tracking, and self-care strategies',
      type: 'education',
      component: 'SelfManagement'
    }
  ],
  resources: [
    {
      title: 'APA Practice Guideline for GAD',
      type: 'guideline',
      citation: 'American Psychological Association. Clinical Practice Guideline for the Treatment of Anxiety Disorders. 2019.'
    },
    {
      title: 'NICE Guideline: Generalised Anxiety Disorder',
      type: 'guideline',
      citation: 'National Institute for Health and Care Excellence. Generalised anxiety disorder and panic disorder in adults. NICE guideline [CG113]. 2019.'
    }
  ]
};