import type { Condition } from '../../types';

export const diabetes: Condition = {
  id: 'diabetes',
  title: 'Type 2 Diabetes Management',
  shortDescription: 'Comprehensive guide for diagnosis and treatment of type 2 diabetes mellitus',
  category: 'endocrine',
  severity: 'high',
  overview: {
    definition: 'Type 2 diabetes is characterized by insulin resistance and relative insulin deficiency, diagnosed with A1C ≥6.5%, fasting glucose ≥126 mg/dL, or 2-hour glucose ≥200 mg/dL.',
    prevalence: 'Affects over 37 million Americans (~11% of population), leading cause of kidney failure and blindness.',
    keyPoints: [
      'Early intervention prevents complications',
      'Metformin is first-line therapy unless contraindicated',
      'Weight loss is fundamental to treatment',
      'Regular monitoring prevents long-term complications'
    ]
  },
  guidelines: {
    diagnosis: [
      'A1C ≥6.5% on two occasions (preferred)',
      'Fasting plasma glucose ≥126 mg/dL',
      '2-hour glucose ≥200 mg/dL during OGTT',
      'Random glucose ≥200 mg/dL with classic symptoms'
    ],
    treatment: [
      {
        category: 'Lifestyle Modifications',
        options: [
          { name: 'Weight loss', notes: '5-10% reduction significantly improves glycemic control' },
          { name: 'Medical nutrition therapy', notes: 'Carbohydrate counting, portion control' },
          { name: 'Physical activity', notes: '150+ min/week moderate exercise' },
          { name: 'Diabetes self-management education', notes: 'Essential for all patients' }
        ]
      },
      {
        category: 'First-line Pharmacotherapy',
        options: [
          {
            name: 'Metformin',
            dosage: '500mg daily → 2000mg daily',
            notes: 'Start with food, increase weekly as tolerated',
            contraindications: ['eGFR <30', 'Severe hepatic impairment']
          }
        ]
      },
      {
        category: 'Add-on Therapies',
        options: [
          {
            name: 'GLP-1 RA (semaglutide)',
            dosage: '0.25mg weekly → 1mg weekly',
            notes: 'Preferred for obesity or ASCVD',
            indications: ['Weight loss desired', 'CV benefits']
          },
          {
            name: 'SGLT2 inhibitors',
            dosage: 'empagliflozin 10-25mg daily',
            notes: 'Preferred for HF or CKD',
            indications: ['Heart failure', 'CKD protection']
          },
          {
            name: 'Sulfonylureas',
            dosage: 'glipizide 2.5-20mg daily',
            notes: 'Cost-effective but hypoglycemia risk',
            contraindications: ['Frequent hypoglycemia', 'Erratic eating']
          }
        ]
      }
    ],
    monitoring: [
      'A1C every 3-6 months (goal <7% for most)',
      'Annual comprehensive foot exam',
      'Annual dilated eye exam',
      'Lipid panel annually',
      'Kidney function monitoring (eGFR, ACR)'
    ]
  },
  tools: [
    {
      id: 'diabetes-treatment',
      name: 'Diabetes Treatment Algorithm',
      description: 'Evidence-based treatment selection based on A1C, comorbidities, and patient factors',
      type: 'assessment',
      component: 'DiabetesTreatment'
    },
    {
      id: 'a1c-converter',
      name: 'A1C to Average Glucose Converter',
      description: 'Convert A1C percentage to estimated average glucose',
      type: 'calculator',
      component: 'A1CConverter',
      inputs: [
        { id: 'a1c', label: 'A1C', type: 'number', required: true, min: 4, max: 15, unit: '%' }
      ]
    },
    {
      id: 'bmi-calculator',
      name: 'BMI Calculator',
      description: 'Calculate Body Mass Index with weight loss tracking for diabetes management',
      type: 'calculator',
      component: 'BMICalculator'
    },
    {
      id: 'diabetes-medication-guide',
      name: 'Diabetes Medication Comparison',
      description: 'Compare diabetes medications by efficacy, side effects, and cost',
      type: 'reference',
      component: 'DiabetesMedications'
    },
    {
      id: 'carb-counting',
      name: 'Carbohydrate Counting Calculator',
      description: 'Calculate insulin-to-carb ratios and meal planning',
      type: 'calculator',
      component: 'CarbCounting'
    },
    {
      id: 'diabetes-tracker',
      name: 'Blood Sugar & Weight Tracker',
      description: 'Log glucose readings, weight, and medications',
      type: 'tracker',
      component: 'DiabetesTracker'
    },
    {
      id: 'hypoglycemia-action',
      name: 'Hypoglycemia Action Plan',
      description: 'Step-by-step emergency treatment for low blood sugar',
      type: 'education',
      component: 'HypoglycemiaAction'
    },
    {
      id: 'risk-stratification',
      name: 'Risk Stratification Assessment',
      description: 'Comprehensive risk assessment including cardiovascular, VTE, and frailty risk',
      type: 'calculator',
      component: 'RiskStratification'
    },
    {
      id: 'patient-education',
      name: 'Patient Education Center',
      description: 'Interactive learning modules for diabetes management and self-care',
      type: 'education',
      component: 'PatientEducation'
    },
    {
      id: 'self-management',
      name: 'Self-Management Tools',
      description: 'Goal setting, blood sugar tracking, and diabetes management',
      type: 'education',
      component: 'SelfManagement'
    },
    {
      id: 'egfr-calculator',
      name: 'eGFR Calculator & CKD Staging',
      description: 'Estimated glomerular filtration rate using CKD-EPI equation with drug dosing adjustments',
      type: 'calculator',
      component: 'EGFRCalculator'
    },
    {
      id: 'enhanced-ascvd-calculator',
      name: 'Enhanced ASCVD Risk Calculator',
      description: 'Comprehensive cardiovascular risk assessment with 2022 AHA/ACC guidelines, risk enhancers, and treatment recommendations',
      type: 'calculator',
      component: 'EnhancedASCVDCalculator'
    },
    {
      id: 'creatinine-clearance-calculator',
      name: 'Creatinine Clearance Calculator',
      description: 'Estimated creatinine clearance using Cockcroft-Gault equation for drug dosing and kidney function assessment',
      type: 'calculator',
      component: 'CreatinineClearanceCalculator'
    }
  ],
  resources: [
    {
      title: 'ADA 2024 Standards of Medical Care',
      type: 'guideline',
      citation: 'American Diabetes Association. Standards of Medical Care in Diabetes—2024. Diabetes Care. 2024;47(Suppl 1).'
    },
    {
      title: 'AACE Diabetes Management Algorithm',
      type: 'guideline',
      citation: 'American Association of Clinical Endocrinologists. Comprehensive Type 2 Diabetes Management Algorithm 2024.'
    }
  ]
};
