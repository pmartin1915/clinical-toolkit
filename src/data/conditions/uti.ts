import type { Condition } from '../../types';

export const uti: Condition = {
  id: 'uti',
  title: 'Acute Uncomplicated Cystitis',
  shortDescription: 'Evidence-based management of urinary tract infections in adult females',
  category: 'infectious',
  severity: 'low',
  overview: {
    definition: 'Acute uncomplicated cystitis in non-pregnant, immunocompetent women with normal urinary tract anatomy, presenting with dysuria, frequency, urgency, or suprapubic discomfort.',
    prevalence: 'Affects ~50% of women during their lifetime. Most common outpatient infection in women.',
    keyPoints: [
      'Distinguish uncomplicated vs. complicated UTI',
      'Short-course therapy is effective for uncomplicated cystitis',
      'Rising resistance patterns affect antibiotic choice',
      'Avoid fluoroquinolones when possible'
    ]
  },
  guidelines: {
    diagnosis: [
      'Classic symptoms: dysuria, frequency, urgency, suprapubic pain',
      'Absence of fever, flank pain, or systemic symptoms',
      'Urinalysis: positive nitrites or leukocyte esterase',
      'Urine culture if recurrent UTI or treatment failure'
    ],
    treatment: [
      {
        category: 'Simple UTI (No MDR Risk Factors)',
        options: [
          {
            name: 'Nitrofurantoin',
            dosage: '100mg BID × 5 days',
            notes: 'Preferred first-line, avoid if CrCl <30',
            contraindications: ['CrCl <30', 'Suspected pyelonephritis']
          },
          {
            name: 'TMP-SMX DS',
            dosage: '160/800mg BID × 3 days',
            notes: 'Avoid if local E. coli resistance >20%',
            contraindications: ['Known sulfa allergy', 'High local resistance']
          }
        ]
      },
      {
        category: 'MDR Risk Factors Present',
        options: [
          {
            name: 'Amoxicillin-clavulanate',
            dosage: '500/125mg BID × 5-7 days',
            notes: 'Less effective but acceptable alternative'
          },
          {
            name: 'Cephalexin',
            dosage: '500mg BID × 5-7 days',
            notes: 'Acceptable with limited data'
          },
          {
            name: 'Ciprofloxacin (last resort)',
            dosage: '250mg BID × 3 days',
            notes: 'Avoid due to side effect profile and resistance'
          }
        ]
      },
      {
        category: 'Complicated UTI/Pyelonephritis',
        options: [
          {
            name: 'Ciprofloxacin',
            dosage: '500mg BID × 7 days',
            notes: 'For stable outpatient pyelonephritis'
          },
          {
            name: 'Levofloxacin',
            dosage: '750mg daily × 5 days',
            notes: 'Alternative fluoroquinolone'
          },
          {
            name: 'Ceftriaxone + oral step-down',
            dosage: '1g IM/IV × 1 dose',
            notes: 'Loading dose for moderate illness'
          }
        ]
      }
    ],
    monitoring: [
      'Symptom resolution expected in 2-3 days',
      'No routine post-treatment urine culture needed',
      'Culture indicated if symptoms persist >2-3 days',
      'Counsel on UTI prevention strategies'
    ]
  },
  tools: [
    {
      id: 'uti-assessment',
      name: 'UTI Classification Tool',
      description: 'Determine if UTI is simple, complicated, or pyelonephritis',
      type: 'assessment',
      component: 'UTIAssessment',
      inputs: [
        { id: 'fever', label: 'Fever >99.9°F (37.7°C)?', type: 'radio', required: true, options: ['Yes', 'No'] },
        { id: 'flankPain', label: 'Flank pain or CVA tenderness?', type: 'radio', required: true, options: ['Yes', 'No'] },
        { id: 'pregnancy', label: 'Pregnant?', type: 'radio', required: true, options: ['Yes', 'No'] },
        { id: 'immunocompromised', label: 'Immunocompromised?', type: 'radio', required: true, options: ['Yes', 'No'] },
        { id: 'catheter', label: 'Urinary catheter or recent instrumentation?', type: 'radio', required: true, options: ['Yes', 'No'] }
      ]
    },
    {
      id: 'antibiotic-selector',
      name: 'UTI Antibiotic Selection Guide',
      description: 'Choose optimal antibiotic based on risk factors and local resistance',
      type: 'reference',
      component: 'UTIAntibiotics'
    },
    {
      id: 'symptom-tracker',
      name: 'UTI Symptom Tracker',
      description: 'Monitor symptom resolution and treatment response',
      type: 'tracker',
      component: 'UTITracker'
    },
    {
      id: 'prevention-guide',
      name: 'UTI Prevention Strategies',
      description: 'Evidence-based prevention methods for recurrent UTIs',
      type: 'education',
      component: 'UTIPrevention'
    },
    {
      id: 'resistance-patterns',
      name: 'Local Resistance Pattern Guide',
      description: 'Understand local antibiotic resistance patterns',
      type: 'reference',
      component: 'ResistancePatterns'
    }
  ],
  resources: [
    {
      title: 'IDSA Guidelines for Uncomplicated Cystitis',
      type: 'guideline',
      citation: 'Gupta K, et al. International clinical practice guidelines for the treatment of acute uncomplicated cystitis and pyelonephritis in women. Clin Infect Dis. 2011.'
    },
    {
      title: 'AUA/CUA/SUFU Guideline: Recurrent UTI',
      type: 'guideline',
      citation: 'American Urological Association. Diagnosis and Treatment of Non-Neurogenic Overactive Bladder (OAB) in Adults: AUA/SUFU Guideline. 2019.'
    }
  ]
};