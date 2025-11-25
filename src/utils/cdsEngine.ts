// Clinical Decision Support (CDS) Rules Engine
// Implements basic guideline-based alerts and recommendations

export interface CDSRule {
  id: string;
  name: string;
  category: 'drug-interaction' | 'contraindication' | 'vital-signs' | 'assessment-score' | 'preventive-care';
  priority: 'low' | 'medium' | 'high' | 'critical';
  conditions: CDSCondition[];
  actions: CDSAction[];
  sources: string[]; // Clinical guideline sources
  enabled: boolean;
}

export interface CDSCondition {
  type: 'age' | 'gender' | 'medication' | 'allergy' | 'vital-sign' | 'lab-value' | 'assessment-score' | 'diagnosis';
  field: string;
  operator: 'equals' | 'greater-than' | 'less-than' | 'greater-equal' | 'less-equal' | 'contains' | 'not-contains';
  value: string | number | boolean | string[];
  unit?: string;
}

export interface CDSAction {
  type: 'alert' | 'warning' | 'recommendation' | 'contraindication' | 'drug-interaction';
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  actionRequired?: boolean;
  suggestedAction?: string;
}

export interface CDSAlert {
  ruleId: string;
  ruleName: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: CDSAction;
  triggeredAt: string;
  patientContext?: PatientContext;
  dismissed?: boolean;
}

export interface PatientContext {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  medications?: string[];
  allergies?: string[];
  diagnoses?: string[];
  vitals?: {
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  labValues?: Record<string, { value: number; unit: string; date: string }>;
  assessmentScores?: Record<string, { score: number; date: string }>;
}

// Clinical Decision Support Rules Database
const cdsRules: CDSRule[] = [
  // Drug Interaction Rules
  {
    id: 'drug-interaction-ace-potassium',
    name: 'ACE Inhibitor + Potassium Supplement Interaction',
    category: 'drug-interaction',
    priority: 'high',
    conditions: [
      {
        type: 'medication',
        field: 'medications',
        operator: 'contains',
        value: ['lisinopril', 'enalapril', 'captopril', 'ace inhibitor']
      },
      {
        type: 'medication',
        field: 'medications',
        operator: 'contains',
        value: ['potassium', 'k-dur', 'potassium chloride']
      }
    ],
    actions: [
      {
        type: 'drug-interaction',
        message: 'Potential hyperkalemia risk: ACE inhibitor combined with potassium supplement.',
        severity: 'warning',
        actionRequired: true,
        suggestedAction: 'Monitor serum potassium levels closely. Consider dose adjustment or alternative therapy.'
      }
    ],
    sources: ['ACC/AHA Hypertension Guidelines 2017'],
    enabled: true
  },

  {
    id: 'drug-interaction-warfarin-nsaid',
    name: 'Warfarin + NSAID Bleeding Risk',
    category: 'drug-interaction',
    priority: 'critical',
    conditions: [
      {
        type: 'medication',
        field: 'medications',
        operator: 'contains',
        value: ['warfarin', 'coumadin']
      },
      {
        type: 'medication',
        field: 'medications',
        operator: 'contains',
        value: ['ibuprofen', 'naproxen', 'nsaid', 'aspirin']
      }
    ],
    actions: [
      {
        type: 'drug-interaction',
        message: 'CRITICAL: Increased bleeding risk with warfarin and NSAID combination.',
        severity: 'critical',
        actionRequired: true,
        suggestedAction: 'Consider alternative pain management. If combination necessary, monitor INR closely and educate patient on bleeding signs.'
      }
    ],
    sources: ['CHEST Antithrombotic Guidelines', 'ACC/AHA Atrial Fibrillation Guidelines'],
    enabled: true
  },

  // Contraindication Rules
  {
    id: 'contraindication-ace-pregnancy',
    name: 'ACE Inhibitor Pregnancy Contraindication',
    category: 'contraindication',
    priority: 'critical',
    conditions: [
      {
        type: 'gender',
        field: 'gender',
        operator: 'equals',
        value: 'female'
      },
      {
        type: 'age',
        field: 'age',
        operator: 'greater-equal',
        value: 15
      },
      {
        type: 'age',
        field: 'age',
        operator: 'less-equal',
        value: 50
      },
      {
        type: 'medication',
        field: 'medications',
        operator: 'contains',
        value: ['lisinopril', 'enalapril', 'captopril', 'ace inhibitor']
      }
    ],
    actions: [
      {
        type: 'contraindication',
        message: 'CONTRAINDICATION: ACE inhibitors are contraindicated in pregnancy (Category D).',
        severity: 'critical',
        actionRequired: true,
        suggestedAction: 'Verify pregnancy status. If pregnant, discontinue ACE inhibitor immediately and consider methyldopa or labetalol.'
      }
    ],
    sources: ['ACOG Hypertension in Pregnancy Guidelines'],
    enabled: true
  },

  {
    id: 'contraindication-metformin-kidney',
    name: 'Metformin Kidney Function Contraindication',
    category: 'contraindication',
    priority: 'high',
    conditions: [
      {
        type: 'medication',
        field: 'medications',
        operator: 'contains',
        value: ['metformin']
      },
      {
        type: 'lab-value',
        field: 'creatinine',
        operator: 'greater-than',
        value: 1.5,
        unit: 'mg/dL'
      }
    ],
    actions: [
      {
        type: 'contraindication',
        message: 'CAUTION: Metformin use with elevated creatinine (>1.5 mg/dL) increases lactic acidosis risk.',
        severity: 'warning',
        actionRequired: true,
        suggestedAction: 'Calculate eGFR. Consider dose reduction or discontinuation if eGFR <30 mL/min/1.73m².'
      }
    ],
    sources: ['ADA Standards of Care in Diabetes'],
    enabled: true
  },

  // Vital Signs Rules
  {
    id: 'vital-signs-hypertensive-crisis',
    name: 'Hypertensive Crisis Alert',
    category: 'vital-signs',
    priority: 'critical',
    conditions: [
      {
        type: 'vital-sign',
        field: 'systolicBP',
        operator: 'greater-equal',
        value: 180
      },
      {
        type: 'vital-sign',
        field: 'diastolicBP',
        operator: 'greater-equal',
        value: 120
      }
    ],
    actions: [
      {
        type: 'alert',
        message: 'HYPERTENSIVE CRISIS: BP ≥180/120 mmHg requires immediate evaluation.',
        severity: 'critical',
        actionRequired: true,
        suggestedAction: 'Assess for target organ damage. Consider emergency/urgent treatment based on symptoms and end-organ involvement.'
      }
    ],
    sources: ['ACC/AHA Hypertension Guidelines 2017'],
    enabled: true
  },

  {
    id: 'vital-signs-severe-hypotension',
    name: 'Severe Hypotension Alert',
    category: 'vital-signs',
    priority: 'high',
    conditions: [
      {
        type: 'vital-sign',
        field: 'systolicBP',
        operator: 'less-than',
        value: 90
      }
    ],
    actions: [
      {
        type: 'alert',
        message: 'HYPOTENSION: Systolic BP <90 mmHg may indicate hemodynamic compromise.',
        severity: 'warning',
        actionRequired: true,
        suggestedAction: 'Assess patient symptoms, volume status, and consider causes. May need IV fluids or vasopressor support.'
      }
    ],
    sources: ['Surviving Sepsis Campaign Guidelines'],
    enabled: true
  },

  // Assessment Score Rules
  {
    id: 'assessment-severe-depression',
    name: 'Severe Depression PHQ-9 Alert',
    category: 'assessment-score',
    priority: 'high',
    conditions: [
      {
        type: 'assessment-score',
        field: 'phq9',
        operator: 'greater-equal',
        value: 20
      }
    ],
    actions: [
      {
        type: 'alert',
        message: 'SEVERE DEPRESSION: PHQ-9 score ≥20 indicates severe depression.',
        severity: 'warning',
        actionRequired: true,
        suggestedAction: 'Assess suicide risk immediately. Consider psychiatric referral and intensive treatment. Monitor closely.'
      }
    ],
    sources: ['APA Practice Guidelines for Major Depressive Disorder'],
    enabled: true
  },

  {
    id: 'assessment-suicide-risk',
    name: 'PHQ-9 Suicide Risk Assessment',
    category: 'assessment-score',
    priority: 'critical',
    conditions: [
      {
        type: 'assessment-score',
        field: 'phq9-question9',
        operator: 'greater-than',
        value: 0
      }
    ],
    actions: [
      {
        type: 'alert',
        message: 'SUICIDE RISK: Patient endorsed suicidal ideation on PHQ-9 Question 9.',
        severity: 'critical',
        actionRequired: true,
        suggestedAction: 'IMMEDIATE ACTION REQUIRED: Conduct comprehensive suicide risk assessment. Ensure patient safety. Consider emergency psychiatric evaluation.'
      }
    ],
    sources: ['Columbia Suicide Severity Rating Scale', 'APA Practice Guidelines'],
    enabled: true
  },

  {
    id: 'assessment-severe-anxiety',
    name: 'Severe Anxiety GAD-7 Alert',
    category: 'assessment-score',
    priority: 'medium',
    conditions: [
      {
        type: 'assessment-score',
        field: 'gad7',
        operator: 'greater-equal',
        value: 15
      }
    ],
    actions: [
      {
        type: 'alert',
        message: 'SEVERE ANXIETY: GAD-7 score ≥15 indicates severe anxiety disorder.',
        severity: 'warning',
        actionRequired: true,
        suggestedAction: 'Consider evidence-based treatment: CBT, SSRI/SNRI therapy. Assess for comorbid conditions and functional impairment.'
      }
    ],
    sources: ['APA Practice Guidelines for Anxiety Disorders'],
    enabled: true
  },

  // Preventive Care Rules
  {
    id: 'preventive-diabetes-a1c',
    name: 'Diabetes A1C Target Alert',
    category: 'preventive-care',
    priority: 'medium',
    conditions: [
      {
        type: 'diagnosis',
        field: 'diagnoses',
        operator: 'contains',
        value: ['diabetes', 'dm', 'diabetes mellitus']
      },
      {
        type: 'lab-value',
        field: 'a1c',
        operator: 'greater-than',
        value: 7.0,
        unit: '%'
      }
    ],
    actions: [
      {
        type: 'recommendation',
        message: 'DIABETES MANAGEMENT: A1C >7% is above target for most adults with diabetes.',
        severity: 'info',
        actionRequired: false,
        suggestedAction: 'Consider intensifying diabetes therapy. Review lifestyle modifications, medication adherence, and barriers to care.'
      }
    ],
    sources: ['ADA Standards of Care in Diabetes'],
    enabled: true
  }
];

export class CDSEngine {
  private static rules: CDSRule[] = cdsRules;
  private static alerts: CDSAlert[] = [];

  // Evaluate all rules against patient context
  public static evaluatePatient(context: PatientContext): CDSAlert[] {
    const triggeredAlerts: CDSAlert[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      if (this.evaluateRule(rule, context)) {
        for (const action of rule.actions) {
          const alert: CDSAlert = {
            ruleId: rule.id,
            ruleName: rule.name,
            category: rule.category,
            priority: rule.priority,
            action,
            triggeredAt: new Date().toISOString(),
            patientContext: context,
            dismissed: false
          };
          triggeredAlerts.push(alert);
        }
      }
    }

    // Store alerts (in a real app, this would persist to storage)
    this.alerts.push(...triggeredAlerts);
    
    return triggeredAlerts.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Evaluate a single rule against patient context
  private static evaluateRule(rule: CDSRule, context: PatientContext): boolean {
    return rule.conditions.every(condition => this.evaluateCondition(condition, context));
  }

  // Evaluate a single condition
  private static evaluateCondition(condition: CDSCondition, context: PatientContext): boolean {
    let contextValue: string | number | string[] | undefined;

    switch (condition.type) {
      case 'age':
        contextValue = context.age;
        break;
      case 'gender':
        contextValue = context.gender;
        break;
      case 'medication':
        contextValue = context.medications || [];
        break;
      case 'allergy':
        contextValue = context.allergies || [];
        break;
      case 'diagnosis':
        contextValue = context.diagnoses || [];
        break;
      case 'vital-sign':
        contextValue = context.vitals?.[condition.field as keyof typeof context.vitals];
        break;
      case 'lab-value':
        contextValue = context.labValues?.[condition.field]?.value;
        break;
      case 'assessment-score':
        contextValue = context.assessmentScores?.[condition.field]?.score;
        break;
      default:
        return false;
    }

    if (contextValue === undefined || contextValue === null) {
      return false;
    }

    return this.compareValues(contextValue, condition.operator, condition.value);
  }

  // Compare values based on operator
  private static compareValues(contextValue: string | number | string[] | undefined, operator: CDSCondition['operator'], ruleValue: string | number | boolean | string[]): boolean {
    switch (operator) {
      case 'equals':
        return contextValue === ruleValue;
      case 'greater-than':
        return Number(contextValue) > Number(ruleValue);
      case 'less-than':
        return Number(contextValue) < Number(ruleValue);
      case 'greater-equal':
        return Number(contextValue) >= Number(ruleValue);
      case 'less-equal':
        return Number(contextValue) <= Number(ruleValue);
      case 'contains':
        if (Array.isArray(contextValue) && Array.isArray(ruleValue)) {
          return ruleValue.some(val => 
            contextValue.some(ctxVal => 
              ctxVal.toLowerCase().includes(val.toLowerCase())
            )
          );
        }
        if (Array.isArray(contextValue)) {
          return contextValue.some(val => 
            val.toLowerCase().includes(String(ruleValue).toLowerCase())
          );
        }
        return String(contextValue).toLowerCase().includes(String(ruleValue).toLowerCase());
      case 'not-contains':
        if (Array.isArray(contextValue)) {
          return !contextValue.some(val => 
            val.toLowerCase().includes(String(ruleValue).toLowerCase())
          );
        }
        return !String(contextValue).toLowerCase().includes(String(ruleValue).toLowerCase());
      default:
        return false;
    }
  }

  // Get all rules
  public static getRules(): CDSRule[] {
    return this.rules;
  }

  // Get rules by category
  public static getRulesByCategory(category: CDSRule['category']): CDSRule[] {
    return this.rules.filter(rule => rule.category === category);
  }

  // Get all alerts
  public static getAlerts(): CDSAlert[] {
    return this.alerts;
  }

  // Get active (non-dismissed) alerts
  public static getActiveAlerts(): CDSAlert[] {
    return this.alerts.filter(alert => !alert.dismissed);
  }

  // Dismiss an alert
  public static dismissAlert(alertId: string): void {
    const alert = this.alerts.find(a => 
      `${a.ruleId}-${a.triggeredAt}` === alertId
    );
    if (alert) {
      alert.dismissed = true;
    }
  }

  // Clear all alerts
  public static clearAlerts(): void {
    this.alerts = [];
  }

  // Add custom rule
  public static addRule(rule: CDSRule): void {
    this.rules.push(rule);
  }

  // Enable/disable rule
  public static toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  // Get rule statistics
  public static getRuleStats(): {
    total: number;
    enabled: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const stats = {
      total: this.rules.length,
      enabled: this.rules.filter(r => r.enabled).length,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>
    };

    this.rules.forEach(rule => {
      stats.byCategory[rule.category] = (stats.byCategory[rule.category] || 0) + 1;
      stats.byPriority[rule.priority] = (stats.byPriority[rule.priority] || 0) + 1;
    });

    return stats;
  }
}