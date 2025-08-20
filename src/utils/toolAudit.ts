// Comprehensive audit results for all clinical tools
// Status: 'complete' (🟢) | 'partial' (🟡) | 'incomplete' (🔴)

export interface ToolAuditResult {
  id: string;
  name: string;
  status: 'complete' | 'partial' | 'incomplete';
  component?: string;
  issues?: string[];
  notes?: string;
}

export interface ConditionAuditResult {
  id: string;
  overallStatus: 'complete' | 'partial' | 'incomplete';
  completedTools: number;
  totalTools: number;
  tools: ToolAuditResult[];
}

// Individual tool audit results based on code analysis
export const TOOL_AUDIT_RESULTS: Record<string, ToolAuditResult> = {
  // ✅ COMPLETE TOOLS (Fully functional)
  'bp-tracker': {
    id: 'bp-tracker',
    name: 'Blood Pressure Tracker',
    status: 'complete',
    component: 'BPTracker',
    notes: 'Full functionality with data persistence, validation, categorization'
  },
  'a1c-converter': {
    id: 'a1c-converter',
    name: 'A1C to Average Glucose Converter',
    status: 'complete',
    component: 'A1CConverter',
    notes: 'Correct formula, validation, health indicators'
  },
  'phq9-assessment': {
    id: 'phq9-assessment',
    name: 'PHQ-9 Depression Screening',
    status: 'complete',
    component: 'PHQ9Assessment',
    notes: 'All 9 questions, proper scoring, clinical interpretations'
  },
  'gad7-assessment': {
    id: 'gad7-assessment',
    name: 'GAD-7 Anxiety Assessment',
    status: 'complete',
    component: 'GAD7Assessment',
    notes: 'All 7 questions, validated scoring, clinical recommendations'
  },
  'copd-assessment': {
    id: 'copd-assessment',
    name: 'COPD Assessment Test (CAT)',
    status: 'complete',
    component: 'COPDAssessment',
    notes: 'Full CAT with 8 questions, proper scoring, clinical interpretations'
  },
  'triglyceride-calculator': {
    id: 'triglyceride-calculator',
    name: 'Triglyceride Risk Calculator',
    status: 'complete',
    component: 'TriglycerideCalculator',
    notes: 'Risk assessment with clinical recommendations'
  },
  'sinusitis-diagnostic': {
    id: 'sinusitis-diagnostic',
    name: 'Sinusitis Diagnostic Algorithm',
    status: 'complete',
    component: 'SinusitisDiagnostic',
    notes: 'Complete diagnostic workflow'
  },
  'uti-diagnostic': {
    id: 'uti-diagnostic',
    name: 'UTI Diagnostic & Treatment Algorithm',
    status: 'complete',
    component: 'UTIDiagnostic',
    notes: 'Complete diagnostic workflow'
  },

  // ⚠️ PARTIAL TOOLS (Basic functionality but missing features)
  'asthma-control-test': {
    id: 'asthma-control-test',
    name: 'Asthma Control Test (ACT)',
    status: 'partial',
    component: 'AsthmaControlTest',
    notes: 'Component exists but needs validation testing'
  },
  'sinusitis-diagnostic-tool': {
    id: 'sinusitis-diagnostic-tool',
    name: 'ABRS Diagnostic Criteria',
    status: 'partial',
    component: 'SinusitisAssessment',
    notes: 'Basic assessment, may need enhancement'
  },
  'uti-assessment': {
    id: 'uti-assessment',
    name: 'UTI Classification Tool',
    status: 'partial',
    component: 'UTIAssessment',
    notes: 'Basic classification, needs testing'
  },

  // ✅ RECENTLY FIXED TOOLS
  'enhanced-ascvd-calculator': {
    id: 'enhanced-ascvd-calculator',
    name: 'Enhanced ASCVD Risk Calculator',
    status: 'complete',
    component: 'EnhancedASCVDCalculator',
    notes: 'Fixed with correct 2013 ACC/AHA coefficients and proper implementation'
  },
  'ascvd-calculator': {
    id: 'ascvd-calculator',
    name: 'ASCVD Risk Calculator',
    status: 'incomplete',
    component: 'ASCVDCalculator',
    issues: ['Likely has similar calculation issues as enhanced version'],
    notes: 'Needs testing and validation'
  },

  // 🔴 MISSING IMPLEMENTATIONS (Referenced but don't exist)
  'hypertension-management': {
    id: 'hypertension-management',
    name: 'Hypertension Management Algorithm',
    status: 'incomplete',
    component: 'HypertensionManagement',
    issues: ['Component may not be fully implemented'],
    notes: 'Referenced in condition data but needs verification'
  },
  'diabetes-treatment': {
    id: 'diabetes-treatment',
    name: 'Diabetes Treatment Algorithm',
    status: 'incomplete',
    component: 'DiabetesTreatment',
    issues: ['Component may not be fully implemented'],
    notes: 'Referenced in condition data but needs verification'
  },
  'depression-treatment': {
    id: 'depression-treatment',
    name: 'Depression Treatment Decision Tree',
    status: 'incomplete',
    component: 'DepressionTreatment',
    issues: ['Component may not be fully implemented'],
    notes: 'Referenced in condition data but needs verification'
  },
  'nyha-classification': {
    id: 'nyha-classification',
    name: 'NYHA Functional Classification',
    status: 'incomplete',
    component: 'NYHAClassification',
    issues: ['Component may not be fully implemented'],
    notes: 'Referenced in heart failure condition'
  },
  'heart-failure-staging': {
    id: 'heart-failure-staging',
    name: 'AHA/ACC Heart Failure Staging',
    status: 'incomplete',
    component: 'HeartFailureStaging',
    issues: ['Component may not be fully implemented'],
    notes: 'Referenced in heart failure condition'
  },
  'ottawa-ankle-rules': {
    id: 'ottawa-ankle-rules',
    name: 'Ottawa Ankle Rules',
    status: 'partial',
    component: 'OttawaAnkleRules',
    notes: 'Component exists but needs testing'
  },
  'wells-score': {
    id: 'wells-score',
    name: 'Wells Score Calculator',
    status: 'partial',
    component: 'WellsScore',
    notes: 'Component exists but needs testing'
  },
  'cha2ds2-vasc-calculator': {
    id: 'cha2ds2-vasc-calculator',
    name: 'CHA2DS2-VASc Calculator',
    status: 'partial',
    component: 'CHA2DS2VAScCalculator',
    notes: 'Component exists but needs testing'
  },
  'egfr-calculator': {
    id: 'egfr-calculator',
    name: 'eGFR Calculator',
    status: 'partial',
    component: 'EGFRCalculator',
    notes: 'Component exists but needs testing'
  },
  'drug-dosing-calculator': {
    id: 'drug-dosing-calculator',
    name: 'Drug Dosing Calculator',
    status: 'partial',
    component: 'DrugDosingCalculator',
    notes: 'Component exists but needs testing'
  },

  // Additional tools found in files but not fully audited
  'fat-restriction-planner': {
    id: 'fat-restriction-planner',
    name: 'Low-Fat Diet Planner',
    status: 'incomplete',
    issues: ['Implementation unknown'],
    notes: 'Referenced in hypertriglyceridemia condition'
  },
  'medication-interaction-checker': {
    id: 'medication-interaction-checker',
    name: 'Medication Interaction Checker',
    status: 'partial',
    component: 'MedicationInteractionChecker',
    notes: 'Component exists but needs testing'
  }
};

// Calculate overall condition status
export function calculateConditionStatus(toolIds: string[]): ConditionAuditResult['overallStatus'] {
  const toolStatuses = toolIds.map(id => TOOL_AUDIT_RESULTS[id]?.status || 'incomplete');
  const completeCount = toolStatuses.filter(status => status === 'complete').length;
  const partialCount = toolStatuses.filter(status => status === 'partial').length;
  const totalCount = toolStatuses.length;

  if (completeCount === totalCount) return 'complete';
  if (completeCount + partialCount >= totalCount * 0.7) return 'partial';
  return 'incomplete';
}

// Get audit result for a specific condition
export function getConditionAudit(conditionId: string, toolIds: string[]): ConditionAuditResult {
  const tools = toolIds.map(id => TOOL_AUDIT_RESULTS[id] || {
    id,
    name: id,
    status: 'incomplete' as const,
    issues: ['Tool not found or not audited']
  });

  const completedTools = tools.filter(tool => tool.status === 'complete').length;
  
  return {
    id: conditionId,
    overallStatus: calculateConditionStatus(toolIds),
    completedTools,
    totalTools: tools.length,
    tools
  };
}