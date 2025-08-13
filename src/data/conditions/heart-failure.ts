import type { Condition } from '../../types';

export const heartFailure: Condition = {
  id: 'heart-failure',
  title: 'Heart Failure Management',
  shortDescription: 'Evidence-based diagnosis, classification, and treatment of heart failure with reduced and preserved ejection fraction',
  category: 'cardiovascular',
  severity: 'high',
  overview: {
    definition: 'Heart failure is a complex syndrome resulting from impairment of ventricular filling or ejection of blood. Classifications include HFrEF (EF ≤40%), HFmrEF (EF 41-49%), and HfpEF (EF ≥50%).',
    prevalence: 'Affects over 6.2 million Americans, leading cause of hospitalization in patients >65 years. 5-year mortality ~50%.',
    keyPoints: [
      'Early diagnosis and treatment improve outcomes and reduce hospitalizations',
      'Guideline-directed medical therapy (GDMT) is essential for HFrEF',
      'Fluid management and daily weights prevent exacerbations',
      'Device therapy (ICD/CRT) improves survival in selected patients',
      'HfpEF management focuses on comorbidities and symptom control'
    ]
  },
  guidelines: {
    diagnosis: [
      'Clinical signs and symptoms plus structural/functional abnormalities',
      'Echocardiogram to assess ejection fraction and structural abnormalities',
      'BNP >35 pg/mL or NT-proBNP >125 pg/mL supports diagnosis',
      'Chest X-ray may show cardiomegaly or pulmonary congestion'
    ],
    treatment: [
      {
        category: 'HFrEF Guideline-Directed Medical Therapy',
        options: [
          {
            name: 'ACE Inhibitor or ARB',
            dosage: 'lisinopril 2.5-40mg daily, losartan 25-150mg daily',
            notes: 'First-line therapy, titrate to maximum tolerated dose',
            indications: ['All patients with HFrEF unless contraindicated']
          },
          {
            name: 'Beta-blocker',
            dosage: 'metoprolol succinate 25-200mg daily, carvedilol 3.125-50mg BID',
            notes: 'Start low, titrate slowly every 2-4 weeks',
            indications: ['All stable HFrEF patients']
          },
          {
            name: 'MRA (Mineralocorticoid Receptor Antagonist)',
            dosage: 'spironolactone 12.5-50mg daily, eplerenone 25-50mg daily',
            notes: 'Monitor K+ and creatinine closely',
            indications: ['NYHA Class II-IV symptoms despite ACEi/ARB + BB']
          },
          {
            name: 'SGLT2 Inhibitor',
            dosage: 'dapagliflozin 10mg daily, empagliflozin 10mg daily',
            notes: 'Benefit independent of diabetes status',
            indications: ['HFrEF patients to reduce CV death and HF hospitalization']
          }
        ]
      },
      {
        category: 'Advanced HFrEF Therapies',
        options: [
          {
            name: 'ARNI (Sacubitril/Valsartan)',
            dosage: '49/51mg BID → 97/103mg BID',
            notes: 'Preferred over ACEi/ARB if tolerated, 36-hour washout from ACEi',
            indications: ['NYHA Class II-III symptoms on stable GDMT']
          },
          {
            name: 'Ivabradine',
            dosage: '2.5-7.5mg BID',
            notes: 'If HR ≥70 bpm on maximum tolerated beta-blocker',
            indications: ['Persistent symptoms, sinus rhythm, HR ≥70 bpm']
          },
          {
            name: 'Hydralazine/Nitrates',
            dosage: 'hydralazine 75-300mg daily + isosorbide dinitrate 120mg daily',
            notes: 'Alternative to ACEi/ARB if not tolerated',
            indications: ['ACEi/ARB intolerant, African American patients as add-on']
          }
        ]
      },
      {
        category: 'Device Therapy',
        options: [
          {
            name: 'ICD (Implantable Cardioverter Defibrillator)',
            notes: 'Primary prevention of sudden cardiac death',
            indications: ['EF ≤35% despite 3+ months optimal medical therapy', 'Life expectancy >1 year']
          },
          {
            name: 'CRT (Cardiac Resynchronization Therapy)',
            notes: 'Improves symptoms and survival in selected patients',
            indications: ['EF ≤35%, QRS ≥150ms (especially LBBB), NYHA Class II-IV']
          }
        ]
      },
      {
        category: 'Lifestyle and Monitoring',
        options: [
          { name: 'Daily weights', notes: 'Same time daily, call if gain >3 lbs in 2 days or >5 lbs in 5 days' },
          { name: 'Fluid restriction', notes: '2L/day if hyponatremia or difficult-to-control volume overload' },
          { name: 'Sodium restriction', notes: '<3g/day for NYHA Class III-IV' },
          { name: 'Exercise training', notes: 'Cardiac rehabilitation recommended for stable patients' },
          { name: 'Medication adherence', notes: 'Pill organizers, education about importance of compliance' }
        ]
      }
    ],
    monitoring: [
      'Clinical assessment every 3-6 months when stable',
      'Lab monitoring: BUN, creatinine, electrolytes every 3-6 months',
      'Annual echocardiogram if EF may have improved',
      'Device interrogation every 3-6 months',
      'Patient education on daily weights and symptom recognition'
    ]
  },
  tools: [
    {
      id: 'nyha-classification',
      name: 'NYHA Functional Classification',
      description: 'Classify heart failure symptoms by functional capacity',
      type: 'assessment',
      component: 'NYHAClassification'
    },
    {
      id: 'heart-failure-staging',
      name: 'AHA/ACC Heart Failure Staging',
      description: 'Stage heart failure from A (at risk) to D (advanced)',
      type: 'assessment',
      component: 'HeartFailureStaging'
    },
    {
      id: 'gdmt-optimizer',
      name: 'GDMT Optimization Tool',
      description: 'Guide evidence-based medication titration for HFrEF',
      type: 'reference',
      component: 'GDMTOptimizer'
    },
    {
      id: 'daily-weight-tracker',
      name: 'Daily Weight Tracker',
      description: 'Monitor daily weights and detect fluid retention early',
      type: 'tracker',
      component: 'DailyWeightTracker'
    },
    {
      id: 'hf-action-plan',
      name: 'Heart Failure Action Plan',
      description: 'Create personalized action plan for symptom changes',
      type: 'education',
      component: 'HeartFailureActionPlan'
    },
    {
      id: 'device-candidacy',
      name: 'ICD/CRT Candidacy Assessment',
      description: 'Evaluate candidacy for cardiac devices',
      type: 'calculator',
      component: 'DeviceCandidacy'
    },
    {
      id: 'bnp-calculator',
      name: 'BNP/NT-proBNP Interpreter',
      description: 'Interpret natriuretic peptide levels in context',
      type: 'calculator',
      component: 'BNPCalculator'
    },
    {
      id: 'diuretic-calculator',
      name: 'Diuretic Dose Calculator',
      description: 'Calculate equivalent doses for loop diuretics',
      type: 'calculator',
      component: 'DiureticCalculator'
    },
    {
      id: 'salt-sodium-converter',
      name: 'Salt to Sodium Converter',
      description: 'Convert between salt and sodium content for dietary counseling',
      type: 'calculator',
      component: 'SaltSodiumConverter'
    },
    {
      id: 'medication-interaction-checker',
      name: 'HF Medication Interaction Checker',
      description: 'Check for drug interactions with heart failure medications',
      type: 'reference',
      component: 'MedicationInteractionChecker'
    },
    {
      id: 'patient-education',
      name: 'Patient Education Center',
      description: 'Interactive learning modules for heart failure self-management',
      type: 'education',
      component: 'PatientEducation'
    },
    {
      id: 'self-management',
      name: 'Self-Management Tools',
      description: 'Goal setting, symptom tracking, and medication adherence',
      type: 'education',
      component: 'SelfManagement'
    }
  ],
  resources: [
    {
      title: '2022 AHA/ACC/HFSA Heart Failure Guideline',
      type: 'guideline',
      citation: 'Heidenreich PA, et al. 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. Circulation. 2022;145(18):e895-e1032.',
      url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063'
    },
    {
      title: '2021 ESC Guidelines for Heart Failure',
      type: 'guideline',
      citation: 'McDonagh TA, et al. 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure. Eur Heart J. 2021;42(36):3599-3726.'
    },
    {
      title: 'HFSA Heart Failure Guidelines',
      type: 'guideline',
      citation: 'Heart Failure Society of America. Heart Failure Guidelines and Quality Standards.',
      url: 'https://www.hfsa.org/patient/guidelines/'
    },
    {
      title: 'Get With The Guidelines - Heart Failure',
      type: 'education',
      citation: 'American Heart Association Quality Improvement Program for Heart Failure.',
      url: 'https://www.heart.org/en/professional/quality-improvement/get-with-the-guidelines/get-with-the-guidelines-heart-failure'
    }
  ]
};