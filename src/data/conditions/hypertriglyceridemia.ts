import type { Condition } from '../../types';

export const hypertriglyceridemia: Condition = {
  id: 'hypertriglyceridemia',
  title: 'Hypertriglyceridemia Management',
  shortDescription: 'Evidence-based approach to elevated triglycerides and pancreatitis prevention',
  category: 'metabolic',
  severity: 'medium',
  overview: {
    definition: 'Elevated fasting triglycerides: Moderate (150-499), Moderate-to-Severe (500-999), Severe (≥1000 mg/dL). Focus on ASCVD risk reduction and pancreatitis prevention.',
    prevalence: 'Affects ~25% of US adults. Associated with metabolic syndrome, diabetes, and increased cardiovascular risk.',
    keyPoints: [
      'Lifestyle modifications are fundamental for all levels',
      'Severe hypertriglyceridemia (≥1000) requires immediate intervention',
      'Different treatment goals: ASCVD risk vs. pancreatitis prevention',
      'Familial chylomicronemia syndrome needs genetic testing'
    ]
  },
  guidelines: {
    diagnosis: [
      'Fasting triglyceride levels (12-hour fast)',
      'Rule out secondary causes: diabetes, hypothyroidism, medications',
      'Family history assessment for genetic forms',
      'Consider genetic testing if TG >1000 mg/dL with family history'
    ],
    treatment: [
      {
        category: 'Lifestyle Modifications (All Levels)',
        options: [
          { name: 'Sugar reduction', notes: '<6% of calories from simple sugars' },
          { name: 'Alcohol limitation', notes: '≤2 drinks/day men, ≤1 drink/day women' },
          { name: 'Omega-3 rich fish', notes: '2+ servings/week fatty fish' },
          { name: 'Weight management', notes: '5-10% weight loss if overweight' },
          { name: 'Physical activity', notes: '150+ min/week moderate exercise' }
        ]
      },
      {
        category: 'Moderate Hypertriglyceridemia (150-499 mg/dL)',
        options: [
          {
            name: 'High ASCVD Risk: Icosapent ethyl',
            dosage: '2g twice daily with meals',
            notes: 'First-line for high ASCVD risk patients'
          },
          {
            name: 'Optimize LDL-C',
            notes: 'Initiate or intensify statin therapy'
          }
        ]
      },
      {
        category: 'Moderate-to-Severe (500-999 mg/dL)',
        options: [
          {
            name: 'Fenofibrate',
            dosage: '145mg daily or 48mg daily',
            notes: 'Monitor for myopathy if used with statin'
          },
          {
            name: 'Icosapent ethyl',
            dosage: '2g twice daily',
            notes: 'Add if high ASCVD risk'
          }
        ]
      },
      {
        category: 'Severe (≥1000 mg/dL)',
        options: [
          {
            name: 'Strict dietary fat restriction',
            notes: '<10-15% of calories from fat, monitor TG every 3 days'
          },
          {
            name: 'Complete alcohol abstinence',
            notes: 'Essential for pancreatitis prevention'
          },
          {
            name: 'Fenofibrate',
            dosage: '145mg daily',
            notes: 'Start once TG <1000 mg/dL'
          }
        ]
      }
    ],
    monitoring: [
      'Fasting triglycerides every 2-6 weeks until stable',
      'Liver enzymes if on fibrates',
      'Signs/symptoms of pancreatitis education',
      'ASCVD risk assessment and management'
    ]
  },
  tools: [
    {
      id: 'triglyceride-calculator',
      name: 'Triglyceride Risk Calculator',
      description: 'Assess pancreatitis and ASCVD risk based on TG levels',
      type: 'calculator',
      component: 'TriglycerideCalculator',
      inputs: [
        { id: 'triglycerides', label: 'Fasting Triglycerides', type: 'number', required: true, min: 50, max: 2000, unit: 'mg/dL' },
        { id: 'diabetes', label: 'Diabetes?', type: 'radio', required: true, options: ['Yes', 'No'] },
        { id: 'ascvdHistory', label: 'History of ASCVD?', type: 'radio', required: true, options: ['Yes', 'No'] }
      ]
    },
    {
      id: 'fat-restriction-planner',
      name: 'Low-Fat Diet Planner',
      description: 'Plan meals for severe hypertriglyceridemia management',
      type: 'education',
      component: 'FatRestrictionPlanner'
    },
    {
      id: 'triglyceride-tracker',
      name: 'Triglyceride Level Tracker',
      description: 'Monitor triglyceride trends and medication effects',
      type: 'tracker',
      component: 'TriglycerideTracker'
    },
    {
      id: 'pancreatitis-warning',
      name: 'Pancreatitis Warning Signs',
      description: 'Recognize early signs of acute pancreatitis',
      type: 'education',
      component: 'PancreatitisWarning'
    },
    {
      id: 'medication-comparison',
      name: 'TG Medication Comparison',
      description: 'Compare fibrates, omega-3s, and other TG-lowering drugs',
      type: 'reference',
      component: 'TGMedicationComparison'
    }
  ],
  resources: [
    {
      title: 'AHA Scientific Statement on Triglycerides',
      type: 'guideline',
      citation: 'American Heart Association. Triglycerides and Cardiovascular Disease: A Scientific Statement. Circulation. 2021.'
    },
    {
      title: 'Endocrine Society Clinical Practice Guideline',
      type: 'guideline',
      citation: 'Berglund L, et al. Evaluation and treatment of hypertriglyceridemia: an Endocrine Society clinical practice guideline. J Clin Endocrinol Metab. 2012.'
    }
  ]
};