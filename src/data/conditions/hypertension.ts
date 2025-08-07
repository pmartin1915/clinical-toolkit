import type { Condition } from '../../types';

export const hypertension: Condition = {
  id: 'hypertension',
  title: 'Hypertension Management',
  shortDescription: 'Comprehensive guide for diagnosis and treatment of high blood pressure',
  category: 'cardiovascular',
  severity: 'high',
  overview: {
    definition: 'Hypertension is defined as systolic blood pressure ≥130 mmHg or diastolic blood pressure ≥80 mmHg on multiple occasions.',
    prevalence: 'Affects approximately 45% of US adults, leading cause of cardiovascular disease.',
    keyPoints: [
      'Lifestyle modifications are essential for all patients',
      'Multiple drug classes available for treatment',
      'Target BP <130/80 mmHg for most patients',
      'Regular monitoring prevents complications'
    ]
  },
  guidelines: {
    diagnosis: [
      'Confirm elevated readings on multiple occasions',
      'Rule out white coat hypertension with home monitoring',
      'Evaluate for target organ damage',
      'Assess cardiovascular risk factors'
    ],
    treatment: [
      {
        category: 'Lifestyle Modifications',
        options: [
          { name: 'Sodium restriction', notes: '<2.3g/day, ideally <1.5g/day' },
          { name: 'DASH diet', notes: 'Emphasize fruits, vegetables, whole grains' },
          { name: 'Weight loss', notes: 'Goal BMI 18.5-24.9 kg/m²' },
          { name: 'Regular exercise', notes: '150 min/week moderate intensity' },
          { name: 'Alcohol limitation', notes: '≤2 drinks/day men, ≤1 drink/day women' }
        ]
      },
      {
        category: 'First-line Medications',
        options: [
          { 
            name: 'ACE Inhibitors', 
            dosage: 'lisinopril 10-40mg daily',
            notes: 'Preferred for diabetes, CKD, heart failure'
          },
          { 
            name: 'ARBs', 
            dosage: 'losartan 50-100mg daily',
            notes: 'Alternative to ACEi if cough occurs'
          },
          { 
            name: 'Calcium Channel Blockers', 
            dosage: 'amlodipine 5-10mg daily',
            notes: 'Preferred for Black patients without CKD/HF'
          },
          { 
            name: 'Thiazide Diuretics', 
            dosage: 'HCTZ 25-50mg daily',
            notes: 'Good first-line option, monitor electrolytes'
          }
        ]
      }
    ],
    monitoring: [
      'Blood pressure checks every 1-3 months until controlled',
      'Annual lab work: BUN, creatinine, electrolytes',
      'Assess medication adherence and side effects',
      'Screen for target organ damage annually'
    ]
  },
  tools: [
    {
      id: 'bp-tracker',
      name: 'Blood Pressure Tracker',
      description: 'Log and track blood pressure readings over time',
      type: 'tracker',
      component: 'BPTracker'
    },
    {
      id: 'ascvd-calculator',
      name: 'ASCVD Risk Calculator',
      description: 'Calculate 10-year atherosclerotic cardiovascular disease risk',
      type: 'calculator',
      component: 'ASCVDCalculator',
      inputs: [
        { id: 'age', label: 'Age', type: 'number', required: true, min: 20, max: 79, unit: 'years' },
        { id: 'gender', label: 'Gender', type: 'radio', required: true, options: ['Male', 'Female'] },
        { id: 'race', label: 'Race', type: 'select', required: true, options: ['White', 'African American', 'Other'] },
        { id: 'totalCholesterol', label: 'Total Cholesterol', type: 'number', required: true, min: 130, max: 320, unit: 'mg/dL' },
        { id: 'hdl', label: 'HDL Cholesterol', type: 'number', required: true, min: 20, max: 100, unit: 'mg/dL' },
        { id: 'systolicBP', label: 'Systolic BP', type: 'number', required: true, min: 90, max: 200, unit: 'mmHg' },
        { id: 'treatedHypertension', label: 'Taking BP medication?', type: 'radio', required: true, options: ['Yes', 'No'] },
        { id: 'diabetes', label: 'Diabetes?', type: 'radio', required: true, options: ['Yes', 'No'] },
        { id: 'smoker', label: 'Current smoker?', type: 'radio', required: true, options: ['Yes', 'No'] }
      ]
    },
    {
      id: 'medication-comparison',
      name: 'BP Medication Comparison',
      description: 'Compare different blood pressure medications and their effects',
      type: 'reference',
      component: 'MedicationComparison'
    },
    {
      id: 'lifestyle-planner',
      name: 'Lifestyle Modification Planner',
      description: 'Create personalized plan for lifestyle changes',
      type: 'education',
      component: 'LifestylePlanner'
    },
    {
      id: 'hypertensive-emergency',
      name: 'Hypertensive Emergency Assessment',
      description: 'Rapid assessment tool for hypertensive emergencies',
      type: 'assessment',
      component: 'HypertensiveEmergency'
    }
  ],
  resources: [
    {
      title: '2017 AHA/ACC Hypertension Guidelines',
      type: 'guideline',
      citation: 'Whelton PK, et al. 2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults. J Am Coll Cardiol. 2018;71(19):e127-e248.'
    },
    {
      title: 'ASCVD Risk Calculator',
      type: 'calculator',
      url: 'https://tools.acc.org/ascvd-risk-estimator-plus/'
    }
  ]
};