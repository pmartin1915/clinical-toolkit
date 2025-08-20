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
      id: 'hypertension-management',
      name: 'Hypertension Management Algorithm',
      description: 'Interactive clinical decision support for hypertension treatment',
      type: 'assessment',
      component: 'HypertensionManagement'
    },
    {
      id: 'bp-tracker',
      name: 'Blood Pressure Tracker',
      description: 'Log and track blood pressure readings over time',
      type: 'tracker',
      component: 'BPTracker'
    },
    {
      id: 'enhanced-ascvd-calculator',
      name: 'Enhanced ASCVD Risk Calculator',
      description: 'Comprehensive cardiovascular risk assessment with 2022 AHA/ACC guidelines, risk enhancers, and treatment recommendations',
      type: 'calculator',
      component: 'EnhancedASCVDCalculator'
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
    },
    {
      id: 'medication-interaction-checker',
      name: 'Medication Interaction Checker',
      description: 'Check for drug interactions with BP medications',
      type: 'reference',
      component: 'MedicationInteractionChecker'
    },
    {
      id: 'risk-stratification',
      name: 'Risk Stratification Assessment',
      description: 'Comprehensive risk assessment including cardiovascular, fall, and frailty risk',
      type: 'calculator',
      component: 'RiskStratification'
    },
    {
      id: 'patient-education',
      name: 'Patient Education Center',
      description: 'Interactive learning modules for blood pressure management and self-care',
      type: 'education',
      component: 'PatientEducation'
    },
    {
      id: 'self-management',
      name: 'Self-Management Tools',
      description: 'Goal setting, progress tracking, and personal health management',
      type: 'education',
      component: 'SelfManagement'
    },
    {
      id: 'cha2ds2-vasc-calculator',
      name: 'CHA₂DS₂-VASc Score Calculator',
      description: 'Stroke risk assessment for atrial fibrillation patients',
      type: 'calculator',
      component: 'CHA2DS2VAScCalculator'
    },
    {
      id: 'drug-dosing-calculator',
      name: 'Drug Dosing Calculator',
      description: 'Kidney and liver function-based medication dosing adjustments',
      type: 'calculator',
      component: 'DrugDosingCalculator'
    },
    {
      id: 'wells-score',
      name: 'Wells Score Calculator',
      description: 'Clinical prediction rule for pulmonary embolism and DVT assessment',
      type: 'calculator',
      component: 'WellsScore'
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