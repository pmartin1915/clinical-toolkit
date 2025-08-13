import type { Condition } from '../../types';

export const copd: Condition = {
  id: 'copd',
  title: 'COPD & Asthma Management',
  shortDescription: 'Evidence-based diagnosis, staging, and treatment of chronic obstructive pulmonary disease and asthma',
  category: 'cardiovascular',
  severity: 'high',
  overview: {
    definition: 'COPD is characterized by persistent airflow limitation (post-bronchodilator FEV1/FVC <0.70) with chronic inflammation. Asthma involves reversible airway obstruction with variable symptoms.',
    prevalence: 'COPD affects 16 million Americans (6th leading cause of death). Asthma affects 25 million Americans (8.0% of adults).',
    keyPoints: [
      'Smoking cessation is the most important intervention for COPD',
      'Inhaler technique education is critical for both conditions',
      'Exacerbation prevention reduces hospitalizations and mortality',
      'Pulmonary rehabilitation improves quality of life and survival',
      'Asthma control assessment guides step-up/step-down therapy'
    ]
  },
  guidelines: {
    diagnosis: [
      'Post-bronchodilator spirometry required for COPD diagnosis',
      'Fractional exhaled nitric oxide (FeNO) helps diagnose asthma',
      'Peak flow variability >20% suggests asthma',
      'Alpha-1 antitrypsin deficiency screening if age <45 or family history'
    ],
    treatment: [
      {
        category: 'COPD Pharmacotherapy by GOLD Stage',
        options: [
          {
            name: 'GOLD A (Low risk, fewer symptoms)',
            notes: 'Bronchodilator PRN: SABA or SAMA',
            indications: ['mMRC 0-1', 'CAT <10', '≤1 exacerbation/year']
          },
          {
            name: 'GOLD B (Low risk, more symptoms)',
            notes: 'LABA or LAMA daily',
            indications: ['mMRC ≥2', 'CAT ≥10', '≤1 exacerbation/year']
          },
          {
            name: 'GOLD E (High risk, fewer symptoms)',
            notes: 'LAMA or LABA/ICS if blood eos ≥300',
            indications: ['mMRC 0-1', 'CAT <10', '≥2 exacerbations or 1 hospitalization/year']
          },
          {
            name: 'GOLD E (High risk, more symptoms)',
            notes: 'LABA/LAMA ± ICS based on eosinophils and exacerbation history',
            indications: ['mMRC ≥2', 'CAT ≥10', '≥2 exacerbations or 1 hospitalization/year']
          }
        ]
      },
      {
        category: 'Asthma Control-Based Treatment',
        options: [
          {
            name: 'Step 1-2 (Intermittent-Mild Persistent)',
            notes: 'SABA PRN or low-dose ICS',
            indications: ['Symptoms ≤2 days/week', 'Night symptoms ≤2×/month']
          },
          {
            name: 'Step 3-4 (Moderate Persistent)',
            notes: 'Medium-dose ICS/LABA or ICS/LTRA',
            indications: ['Daily symptoms', 'Night symptoms >1×/week']
          },
          {
            name: 'Step 5-6 (Severe Persistent)',
            notes: 'High-dose ICS/LABA ± LTRA ± oral corticosteroids',
            indications: ['Symptoms throughout day', 'Frequent night symptoms']
          }
        ]
      },
      {
        category: 'Non-pharmacological Interventions',
        options: [
          { name: 'Smoking cessation counseling', notes: 'Most important intervention - reduces disease progression' },
          { name: 'Pulmonary rehabilitation', notes: 'Improves exercise capacity, quality of life, and reduces hospitalizations' },
          { name: 'Inhaler technique education', notes: 'Critical - up to 90% of patients have poor technique' },
          { name: 'Action plan development', notes: 'Written plans reduce exacerbations and emergency visits' },
          { name: 'Vaccinations', notes: 'Annual influenza, pneumococcal, COVID-19 vaccines' }
        ]
      }
    ],
    monitoring: [
      'Spirometry annually for COPD progression',
      'Peak flow monitoring for asthma control',
      'Inhaler technique assessment at each visit',
      'Exacerbation frequency and triggers',
      'Quality of life assessment (CAT, ACQ scores)'
    ]
  },
  tools: [
    {
      id: 'copd-assessment',
      name: 'COPD Assessment Test (CAT)',
      description: 'Evaluate COPD impact on daily life and guide treatment decisions',
      type: 'assessment',
      component: 'COPDAssessment'
    },
    {
      id: 'asthma-control-test',
      name: 'Asthma Control Test (ACT)',
      description: 'Assess asthma control and guide step-up/step-down therapy',
      type: 'assessment', 
      component: 'AsthmaControlTest'
    },
    {
      id: 'spirometry-interpreter',
      name: 'Spirometry Result Interpreter',
      description: 'Interpret spirometry results and classify COPD severity',
      type: 'calculator',
      component: 'SpirometryInterpreter'
    },
    {
      id: 'inhaler-technique-guide',
      name: 'Inhaler Technique Guide',
      description: 'Step-by-step instructions for all major inhaler devices',
      type: 'education',
      component: 'InhalerTechniqueGuide'
    },
    {
      id: 'copd-gold-calculator',
      name: 'COPD GOLD Classification',
      description: 'Classify COPD patients into GOLD groups A, B, or E',
      type: 'calculator',
      component: 'COPDGoldCalculator'
    },
    {
      id: 'peak-flow-tracker',
      name: 'Peak Flow Tracker',
      description: 'Monitor peak flow trends and identify asthma patterns',
      type: 'tracker',
      component: 'PeakFlowTracker'
    },
    {
      id: 'exacerbation-action-plan',
      name: 'COPD/Asthma Action Plan Generator',
      description: 'Create personalized action plans for exacerbation management',
      type: 'education',
      component: 'ExacerbationActionPlan'
    },
    {
      id: 'medication-step-calculator',
      name: 'Asthma Step-Up/Step-Down Guide',
      description: 'Determine appropriate asthma medication adjustments based on control',
      type: 'reference',
      component: 'AsthmaMedicationStepper'
    },
    {
      id: 'smoking-cessation-support',
      name: 'Smoking Cessation Support Tool',
      description: 'Evidence-based smoking cessation strategies and resources',
      type: 'education',
      component: 'SmokingCessationSupport'
    },
    {
      id: 'pulmonary-rehab-finder',
      name: 'Pulmonary Rehabilitation Referral Guide',
      description: 'Identify candidates for pulmonary rehabilitation programs',
      type: 'reference',
      component: 'PulmonaryRehabGuide'
    },
    {
      id: 'patient-education',
      name: 'Patient Education Center',
      description: 'Interactive learning modules for COPD and asthma self-management',
      type: 'education',
      component: 'PatientEducation'
    },
    {
      id: 'self-management',
      name: 'Self-Management Tools',
      description: 'Goal setting, symptom tracking, and medication adherence tools',
      type: 'education',
      component: 'SelfManagement'
    }
  ],
  resources: [
    {
      title: '2023 GOLD Global Strategy for COPD',
      type: 'guideline',
      citation: 'Global Initiative for Chronic Obstructive Lung Disease. Global Strategy for the Diagnosis, Management, and Prevention of COPD, 2023 Report.',
      url: 'https://goldcopd.org'
    },
    {
      title: '2020 GINA Asthma Management Guidelines',
      type: 'guideline', 
      citation: 'Global Initiative for Asthma. Global Strategy for Asthma Management and Prevention, 2020.',
      url: 'https://ginasthma.org'
    },
    {
      title: 'ATS/ERS Pulmonary Rehabilitation Statement',
      type: 'guideline',
      citation: 'Spruit MA, et al. An official American Thoracic Society/European Respiratory Society statement: key concepts and advances in pulmonary rehabilitation. Am J Respir Crit Care Med. 2013.'
    }
  ]
};