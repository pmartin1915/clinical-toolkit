import type { Condition } from '../../types';

export const rhinosinusitis: Condition = {
  id: 'rhinosinusitis',
  title: 'Acute Bacterial Rhinosinusitis (ABRS)',
  shortDescription: 'Evidence-based diagnosis and antibiotic treatment of acute bacterial sinusitis',
  category: 'infectious',
  severity: 'low',
  overview: {
    definition: 'ABRS is diagnosed clinically when sinus symptoms persist ≥10 days without improvement or worsen after initial improvement ("double worsening").',
    prevalence: 'Affects ~12% of adults annually. Only 2-10% of viral upper respiratory infections develop into bacterial sinusitis.',
    keyPoints: [
      'Most sinusitis is viral and self-limiting',
      'Watchful waiting is appropriate for most cases',
      'Imaging not routinely recommended',
      'Antibiotic resistance is a growing concern'
    ]
  },
  guidelines: {
    diagnosis: [
      'Symptoms ≥10 days without improvement, OR',
      'Initial improvement followed by worsening ("double worsening")',
      'Purulent nasal discharge with unilateral facial pain/pressure',
      'Fever may be present but not required'
    ],
    treatment: [
      {
        category: 'Initial Management',
        options: [
          {
            name: 'Watchful waiting',
            notes: 'Appropriate for most patients without severe symptoms',
            duration: '7 days observation'
          },
          {
            name: 'Symptomatic treatment',
            notes: 'Saline irrigation, decongestants, analgesics'
          }
        ]
      },
      {
        category: 'First-line Antibiotics',
        options: [
          {
            name: 'Amoxicillin-clavulanate',
            dosage: '875mg/125mg BID × 5-7 days',
            notes: 'Preferred first-line for most patients'
          },
          {
            name: 'Doxycycline (PCN allergy)',
            dosage: '100mg BID or 200mg daily × 5-7 days',
            notes: 'Good alternative for penicillin allergy'
          }
        ]
      },
      {
        category: 'High-Risk Patients',
        options: [
          {
            name: 'High-dose amoxicillin-clavulanate',
            dosage: '2000mg/125mg BID × 7 days',
            notes: 'Age ≥65, recent hospitalization, recent antibiotics, immunocompromised',
            indications: ['Recent antibiotic use', 'Multiple comorbidities', 'Age ≥65']
          },
          {
            name: 'Fluoroquinolones',
            dosage: 'levofloxacin 750mg daily × 5 days',
            notes: 'Reserve for severe penicillin allergy or treatment failure',
            contraindications: ['Avoid as first-line due to serious adverse effects']
          }
        ]
      }
    ],
    monitoring: [
      'Reassess in 3-5 days if no improvement',
      'Consider imaging if treatment failure',
      'Watch for complications: orbital cellulitis, meningitis',
      'Patient education on when to return'
    ]
  },
  tools: [
    {
      id: 'sinusitis-diagnostic',
      name: 'Sinusitis Diagnostic Algorithm',
      description: 'Complete diagnostic workflow from viral vs bacterial determination to treatment plan',
      type: 'assessment',
      component: 'SinusitisDiagnostic'
    },
    {
      id: 'sinusitis-diagnostic-tool',
      name: 'ABRS Diagnostic Criteria',
      description: 'Assess likelihood of bacterial vs. viral sinusitis',
      type: 'assessment',
      component: 'SinusitisAssessment',
      inputs: [
        { id: 'duration', label: 'Symptom duration', type: 'select', required: true, options: ['<7 days', '7-10 days', '>10 days'] },
        { id: 'pattern', label: 'Symptom pattern', type: 'select', required: true, options: ['Gradually improving', 'Persistent/stable', 'Initially improved then worsened'] },
        { id: 'purulence', label: 'Purulent nasal discharge?', type: 'radio', required: true, options: ['Yes', 'No'] },
        { id: 'facialPain', label: 'Unilateral facial pain/pressure?', type: 'radio', required: true, options: ['Yes', 'No'] }
      ]
    },
    {
      id: 'antibiotic-selector',
      name: 'ABRS Antibiotic Selection Guide',
      description: 'Choose appropriate antibiotic based on risk factors',
      type: 'reference',
      component: 'ABRSAntibiotics'
    },
    {
      id: 'symptom-tracker',
      name: 'Sinusitis Symptom Tracker',
      description: 'Track symptom progression and treatment response',
      type: 'tracker',
      component: 'SinusitisTracker'
    },
    {
      id: 'saline-irrigation-guide',
      name: 'Saline Irrigation Instructions',
      description: 'Step-by-step nasal saline irrigation technique',
      type: 'education',
      component: 'SalineIrrigationGuide'
    },
    {
      id: 'complication-warning',
      name: 'Sinusitis Complication Warning Signs',
      description: 'Recognize serious complications requiring immediate care',
      type: 'education',
      component: 'SinusitisComplications'
    }
  ],
  resources: [
    {
      title: 'IDSA Clinical Practice Guideline for ABRS',
      type: 'guideline',
      citation: 'Chow AW, et al. IDSA Clinical Practice Guideline for Acute Bacterial Rhinosinusitis in Children and Adults. Clin Infect Dis. 2012.'
    },
    {
      title: 'AAO-HNS Clinical Practice Guideline',
      type: 'guideline',
      citation: 'Rosenfeld RM, et al. Clinical practice guideline (update): adult sinusitis. Otolaryngol Head Neck Surg. 2015.'
    }
  ]
};