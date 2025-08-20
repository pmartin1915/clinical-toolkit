import type { Condition } from '../../types';

export const emergencyOrthopedic: Condition = {
  id: 'emergency-orthopedic',
  title: 'Emergency & Orthopedic Tools',
  shortDescription: 'Clinical prediction rules and assessment tools for emergency and orthopedic conditions',
  category: 'orthopedic',
  severity: 'medium',
  overview: {
    definition: 'Collection of evidence-based clinical prediction rules and assessment tools commonly used in emergency medicine and orthopedic practice.',
    prevalence: 'Trauma and musculoskeletal injuries are common presentations in emergency departments and primary care.',
    keyPoints: [
      'Clinical prediction rules reduce unnecessary imaging',
      'Evidence-based tools improve diagnostic accuracy',
      'Proper assessment prevents missed fractures',
      'Systematic approach ensures consistent care'
    ]
  },
  guidelines: {
    diagnosis: [
      'Use validated clinical prediction rules when appropriate',
      'Consider patient factors and clinical judgment',
      'Apply rules within their validated populations',
      'Document reasoning for imaging decisions'
    ],
    treatment: [
      {
        category: 'Clinical Assessment',
        options: [
          { name: 'Systematic examination', notes: 'Follow structured approach for musculoskeletal injuries' },
          { name: 'Documentation', notes: 'Record findings clearly for medico-legal purposes' },
          { name: 'Patient education', notes: 'Explain findings and management plan' },
          { name: 'Follow-up planning', notes: 'Ensure appropriate reassessment timing' }
        ]
      },
      {
        category: 'Imaging Guidelines',
        options: [
          { 
            name: 'Ottawa Rules compliance', 
            notes: 'Follow validated prediction rules to reduce unnecessary X-rays'
          },
          { 
            name: 'Clinical judgment', 
            notes: 'Override rules when clinical suspicion is high'
          },
          { 
            name: 'Advanced imaging', 
            notes: 'Consider CT/MRI for complex cases'
          }
        ]
      }
    ],
    monitoring: [
      'Follow-up in 7-10 days if symptoms persist',
      'Return if worsening pain or new symptoms',
      'Reassess mobility and function',
      'Review imaging results with patient'
    ]
  },
  tools: [
    {
      id: 'ottawa-ankle-rules',
      name: 'Ottawa Ankle Rules',
      description: 'Clinical prediction rule for ankle and foot fracture assessment',
      type: 'calculator',
      component: 'OttawaAnkleRules'
    },
    {
      id: 'wells-score',
      name: 'Wells Score Calculator',
      description: 'Clinical prediction rule for pulmonary embolism and deep vein thrombosis',
      type: 'calculator',
      component: 'WellsScore'
    },
    {
      id: 'drug-dosing-calculator',
      name: 'Drug Dosing Calculator',
      description: 'Kidney and liver function-based medication dosing adjustments',
      type: 'calculator',
      component: 'DrugDosingCalculator'
    }
  ],
  resources: [
    {
      title: 'Ottawa Ankle Rules Validation Studies',
      type: 'guideline',
      citation: 'Stiell IG, et al. Implementation of the Ottawa ankle rules. JAMA. 1994;271(11):827-32.'
    },
    {
      title: 'Wells Score for PE',
      type: 'guideline',
      citation: 'Wells PS, et al. Derivation of a simple clinical model to categorize patients probability of pulmonary embolism. Thromb Haemost. 2000;83(3):416-20.'
    },
    {
      title: 'Emergency Medicine Clinical Decision Rules',
      type: 'reference',
      citation: 'Stiell IG, Wells GA. Methodologic standards for the development of clinical decision rules in emergency medicine. Ann Emerg Med. 1999;33(4):437-47.'
    }
  ]
};